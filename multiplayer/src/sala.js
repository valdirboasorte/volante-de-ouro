/* A sala: um Durable Object por código. Guarda o estado oficial da partida (lobby e
   rodadas), valida quem entra e fala com os jogadores por WebSocket. Usa só a API de
   hibernação: a sala dorme quando ninguém manda nada e o estado vive no storage, não na
   memória. Quem chega pelo Worker (rotas-salas.js) cai em fetch(): /criar e /entrar são
   pedidos internos, o resto é o upgrade do WebSocket.

   Rodadas (Fase 2): cada jogador planeja em segredo (ação), marca pronto, e quando todos
   estão prontos a sala processa a rodada UMA vez (processar). As regras vêm de regrasDe():
   'chefe' e 'piloto' (os dois modos, com o motor do jogo) e 'teste' (um jogo mínimo só para os
   testes de turnos, aceito na criação só com DESENVOLVIMENTO). O mundo (segredos incluídos) nunca vai inteiro para ninguém: cada
   jogador recebe só a regras.vista dele. Regra de ouro daqui: um await que não é de
   storage (criptografia, por exemplo) NÃO segura as outras chamadas da sala, então nunca
   fica entre conferir uma condição e ocupar/mudar o estado; muda-se tudo de forma
   síncrona e só então se espera o storage.

   Corridas ao vivo (Fase 5, corrida-mp.js): quando os dois ficam prontos numa rodada que tem
   corrida com humano, a sala prepara as corridas (o processamento numa cópia do mundo, que só
   recolhe a entrada de cada corrida), passa para 'corrida' e roda cada uma no relógio da sala,
   com as ordens dos jogadores. Quando todas chegam ao fim, a rodada é processada de verdade com
   as chegadas guardadas. Uma sala com config.aoVivo === false corre tudo pelo caminho rápido. */
import { DurableObject } from 'cloudflare:workers';
import { VERSAO_JOGO, criarMotor } from './gerado/motor-jogo.js';
import { ambienteFalso } from './pagina-falsa.js';
import { regrasTeste } from './regras-teste.js';
import { criarRegrasChefe } from './regras-chefe.js';
import { criarRegrasPiloto } from './regras-piloto.js';
import { criarRnd } from './aleatorio.js';
import { ligarCorridas, desligarCorridas, Corrida, LARGADA_MS } from './corrida-mp.js';

const MAX_JOGADORES = 2;              // pensado para crescer: nada abaixo assume 2
const MAX_NOME = 24;
const MAX_MENSAGEM = 16384;
const LIMITE_MENSAGENS = 20;          // por slot, a cada JANELA_MS
const JANELA_MS = 10000;
const VIOLACOES_MAX = 3;
const VELOCIDADES = [1, 2, 4, 8, 16];
const MODOS = ['chefe', 'piloto'];
const PROTOCOLO = 'volante.v1';
const RE_FICHA = /^ficha\.([0-9a-f]{64})$/;
const ABERTO = 1;                     // WebSocket.OPEN
const SERIES_CHEFE = ['f1', 'indy'];
const CONFIG_CHEFE = () => ({ velocidade: 8, sk: 'f1', ano: 2024, equipes: {} });
const SERIES_PILOTO = ['f1', 'indy'];
const CONFIG_PILOTO = () => ({ velocidade: 8, serie: 'f1', ano: 2024, pilotos: {} });
const IDADE_MIN = 14, IDADE_MAX = 30;
const RE_CC = /^[A-Z]{2}$/;
const MAX_ACOES_VISTAS = 200;         // ids de ação lembrados para não repetir uma ação reenviada
const ESPERA_TENTATIVA_MS = 1500;     // nova tentativa depois de uma falha no processamento
const ESPERA_TETO_MS = 600000;        // e no máximo 10 min entre tentativas
const ESPERA_RECUPERAR_MS = 300;      // processamento que ficou pendente quando a sala acordou
const FALHAS_AVISO = 5;
const TIQUE_MS = 100;                 // o relógio da corrida ao vivo
const MARCA_MS = 200;                 // o andamento (passo liberado) para as telas
const SOMA_MS = 2000;                 // a conferência do estado
const SALVAR_MS = 2000;               // o passo da corrida guardado, para refazer depois de um reinício
const VIGIA_MS = 10000;               // o alarme que retoma a corrida se a sala reiniciar
const FORA_MS = 15000;                // desconectado por mais que isso, a equipe assume as paradas dele

const enc = new TextEncoder();

function resposta(corpo, status){ return Response.json(corpo, { status }); }

/* a mensagem de um erro do motor, curta: ajuda a achar o defeito e não carrega segredo nenhum */
const textoErro = e => String((e && (e.stack || e.message)) || e).slice(0, 300);

function log(ev, codigo, extra){
  console.log(JSON.stringify(Object.assign({ ev, codigo }, extra)));
}

function hex(bytes){
  return [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
}

async function sha256(txt){
  return hex(new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(txt))));
}

function novaFicha(){
  return hex(crypto.getRandomValues(new Uint8Array(32)));
}

/* nome limpo: sem controle nem marcas invisíveis, espaços colapsados, até 24 caracteres */
function limparNome(v){
  if(typeof v !== 'string') return '';
  const s = v.replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩﻿]/g, ' ')
    .replace(/\s+/g, ' ').trim();
  return [...s].slice(0, MAX_NOME).join('').trim();
}

/* id de mensagem devolvido ao cliente só se for curto e simples */
function idSeguro(id){
  if(typeof id === 'number' && Number.isFinite(id)) return id;
  if(typeof id === 'string' && id.length <= 64) return id;
  return undefined;
}

export class Sala extends DurableObject {
  constructor(ctx, env){
    super(ctx, env);
    this.sala = null;
    this.mundo = null;                // o mundo das regras (segredos incluídos); só nesta classe
    this.motorJ = null;               // o motor do jogo: criado na primeira vez que precisa, só em memória
    this.regrasChefe = null;
    this.regrasPiloto = null;
    this.falharProximo = false;       // só no desenvolvimento: a próxima rodada falha uma vez
    this.limites = new Map();         // slot -> { ini, n, violacoes }; some ao hibernar, sem problema
    this.corridas = null;             // as corridas ao vivo da rodada (chave -> Corrida), só em memória
    this.relogio = null;
    this.tiqueando = false;
    ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair('{"t":"ping"}', '{"t":"pong"}'));
    ctx.blockConcurrencyWhile(async () => {
      const guardado = await ctx.storage.get(['sala', 'mundo']);
      this.sala = guardado.get('sala') || null;
      this.mundo = guardado.get('mundo') || null;
      /* a sala caiu (ou foi reiniciada) no meio de um processamento: agenda para terminar */
      if(this.sala && this.sala.partida && (this.sala.partida.estado === 'processing' || this.sala.partida.estado === 'corrida'))
        await ctx.storage.setAlarm(Date.now() + ESPERA_RECUPERAR_MS);
    });
  }

  /* o motor do jogo desta sala: criado sob demanda (nunca no topo do módulo: o Worker tem 1 s para
     subir) e refeito se a sala dormiu. A página falsa tem um Math só dele, que as regras prendem
     a uma semente a cada ação. */
  motor(){
    if(!this.motorJ){
      const amb = ambienteFalso({ seed: 1 });
      const J = criarMotor(amb);
      J.amb = amb; J.Saves.auto = false;
      this.motorJ = J;
    }
    return this.motorJ;
  }

  regrasDe(nome){
    if(nome === 'chefe') return this.regrasChefe || (this.regrasChefe = criarRegrasChefe(() => this.motor()));
    if(nome === 'piloto') return this.regrasPiloto || (this.regrasPiloto = criarRegrasPiloto(() => this.motor()));
    return regrasTeste;
  }

  async salvar(){ await this.ctx.storage.put('sala', this.sala); }

  /* sala e mundo juntos, numa escrita só: nunca um sem o outro */
  async salvarTudo(){ await this.ctx.storage.put({ sala: this.sala, mundo: this.mundo }); }

  /* quem não tem mais decisões na partida (carreira encerrada) conta como pronto */
  dispensado(slot){
    const p = this.sala && this.sala.partida, regras = p && this.regrasDe(p.regras);
    try { return !!(regras && regras.dispensado && this.mundo && regras.dispensado(this.mundo, slot)); } catch(e){ return false; }
  }

  /* vista pública: nunca inclui a ficha nem o hash dela */
  vista(excluir){
    const s = this.sala;
    return {
      codigo: s.codigo, modo: s.modo, estado: s.estado, anfitriao: s.anfitriao,
      config: s.config,
      jogadores: s.jogadores.map(j => ({
        slot: j.slot, nome: j.nome, conectado: this.conectado(j.slot, excluir), visto: j.visto
      })),
      partida: this.vistaPartida()
    };
  }

  /* a partida na vista pública: só o que todos podem ver (nada do mundo, nenhum plano) */
  vistaPartida(){
    const s = this.sala, p = s.partida;
    if(!p) return null;
    const prontos = {};
    for(const j of s.jogadores) prontos[j.slot] = !!p.prontos[j.slot];
    const v = { estado: p.estado, rodada: p.rodada, prontos, ultimo: p.ultimo, regras: p.regras,
                fora: s.jogadores.filter(j => this.dispensado(j.slot)).map(j => j.slot) };
    if(this.env.DESENVOLVIMENTO === '1') v.falhas = p.falhas;   // só para os testes verem a nova tentativa
    return v;
  }

  /* a vista privada de cada jogador conectado, só no socket dele */
  enviarVistas(){
    const s = this.sala;
    if(!s || !s.partida) return;
    for(const j of s.jogadores){
      for(const w of this.ctx.getWebSockets('slot:' + j.slot)) this.enviarVista(w, j.slot);
    }
  }

  enviarVista(ws, slot){
    const s = this.sala;
    if(!s || !s.partida) return;
    this.enviar(ws, { t: 'vista', v: s.v, vista: this.regrasDe(s.partida.regras).vista(this.mundo, slot) });
  }

  conectado(slot, excluir){
    return this.ctx.getWebSockets('slot:' + slot).some(w => w !== excluir && w.readyState === ABERTO);
  }

  enviar(ws, msg){
    try{ ws.send(JSON.stringify(msg)); }catch(e){ /* socket já fechado */ }
  }

  difundir(msg, excluir){
    const txt = JSON.stringify(msg);
    for(const w of this.ctx.getWebSockets()){
      if(w === excluir || w.readyState !== ABERTO) continue;
      try{ w.send(txt); }catch(e){ /* socket já fechado */ }
    }
  }

  fecharSeguro(ws, codigo, motivo){
    try{
      if(codigo === undefined || codigo === 1005 || codigo === 1006 || codigo === 1015) ws.close();
      else ws.close(codigo, motivo);
    }catch(e){ /* já fechado */ }
  }

  async fetch(request){
    const url = new URL(request.url);
    if(request.headers.get('Upgrade') === 'websocket') return this.abrirWs(request);
    if(request.method === 'POST' && url.pathname === '/criar') return this.criar(await request.json());
    if(request.method === 'POST' && url.pathname === '/entrar') return this.entrar(await request.json());
    return resposta({ erro: 'rota' }, 404);
  }

  async criar(corpo){
    const nome = limparNome(corpo.nome);
    if(!nome) return resposta({ erro: 'nome' }, 400);
    /* 'teste' (as regras mínimas dos testes de turnos) só existe no desenvolvimento */
    if(!MODOS.includes(corpo.modo) && !(corpo.modo === 'teste' && this.env.DESENVOLVIMENTO === '1')) return resposta({ erro: 'modo' }, 400);
    if(corpo.versao !== VERSAO_JOGO) return resposta({ erro: 'versao', versaoServidor: VERSAO_JOGO }, 409);
    /* o hash vem antes da conferência: uma espera de criptografia não segura as outras
       chamadas da sala (só as de storage seguram), então conferir e ocupar não podem
       ter nenhum await no meio */
    const ficha = novaFicha(), fichaHash = await sha256(ficha);
    if(this.sala) return resposta({ erro: 'existe' }, 409);
    const agora = Date.now();
    this.sala = {
      codigo: corpo.codigo, modo: corpo.modo, versao: VERSAO_JOGO, criada: agora, estado: 'lobby',
      anfitriao: 0, v: 1, config: corpo.modo === 'chefe' ? CONFIG_CHEFE() : corpo.modo === 'piloto' ? CONFIG_PILOTO() : { velocidade: 8 },
      jogadores: [{ slot: 0, nome, fichaHash, entrou: agora, visto: agora }]
    };
    await this.salvar();
    log('criada', corpo.codigo);
    return resposta({ codigo: corpo.codigo, ficha, slot: 0, sala: this.vista() }, 201);
  }

  async entrar(corpo){
    const nome = limparNome(corpo.nome);
    /* como em criar: o await da ficha antes; de "achar a vaga" até "ocupar", nada espera */
    const ficha = novaFicha(), fichaHash = await sha256(ficha);
    const s = this.sala;
    if(!s) return resposta({ erro: 'sala' }, 404);
    if(!nome) return resposta({ erro: 'nome' }, 400);
    if(corpo.versao !== s.versao) return resposta({ erro: 'versao', versaoServidor: VERSAO_JOGO }, 409);
    if(s.estado !== 'lobby') return resposta({ erro: 'comecou' }, 409);
    let slot = 0;
    while(s.jogadores.some(j => j.slot === slot)) slot++;
    if(slot >= MAX_JOGADORES) return resposta({ erro: 'cheia' }, 409);
    const agora = Date.now();
    s.jogadores.push({ slot, nome, fichaHash, entrou: agora, visto: agora });
    s.jogadores.sort((a, b) => a.slot - b.slot);
    s.v++;
    await this.salvar();
    log('entrou', s.codigo);
    /* quem já está na sala vê o convidado na hora (desconectado até o WebSocket dele abrir) */
    this.difundir({ t: 'sala', v: s.v, sala: this.vista() });
    return resposta({ codigo: s.codigo, ficha, slot, sala: this.vista() }, 200);
  }

  /* acha o jogador dono da ficha comparando os hashes em tempo constante */
  async jogadorDaFicha(ficha){
    const alvo = enc.encode(await sha256(ficha));
    let achado = null;
    for(const j of this.sala.jogadores){
      const h = enc.encode(j.fichaHash);
      if(h.length === alvo.length && crypto.subtle.timingSafeEqual(h, alvo)) achado = j;
    }
    return achado;
  }

  async abrirWs(request){
    if(!this.sala) return resposta({ erro: 'ficha' }, 401);
    const oferecidos = (request.headers.get('Sec-WebSocket-Protocol') || '').split(',').map(p => p.trim());
    const entrada = oferecidos.map(p => RE_FICHA.exec(p)).find(Boolean);
    if(!oferecidos.includes(PROTOCOLO) || !entrada) return resposta({ erro: 'ficha' }, 401);
    const jogador = await this.jogadorDaFicha(entrada[1]);
    if(!jogador) return resposta({ erro: 'ficha' }, 401);

    for(const velho of this.ctx.getWebSockets('slot:' + jogador.slot)) this.fecharSeguro(velho, 4000, 'substituida');

    const par = new WebSocketPair();
    const [cliente, servidor] = Object.values(par);
    this.ctx.acceptWebSocket(servidor, ['slot:' + jogador.slot]);
    servidor.serializeAttachment({ slot: jogador.slot });

    jogador.visto = Date.now();
    await this.salvar();
    this.enviar(servidor, { t: 'estado', v: this.sala.v, voce: { slot: jogador.slot }, sala: this.vista() });
    this.enviarVista(servidor, jogador.slot);
    this.enviarCorridaInicio(servidor);
    this.difundir({ t: 'jogadores', v: this.sala.v, jogadores: this.vista().jogadores });
    return new Response(null, { status: 101, webSocket: cliente, headers: { 'Sec-WebSocket-Protocol': PROTOCOLO } });
  }

  /* limite por slot: 20 mensagens a cada 10 s; devolve 'ok', 'excedeu' ou 'derrubar' */
  conferirLimite(slot){
    const agora = Date.now();
    let l = this.limites.get(slot);
    if(!l){ l = { ini: agora, n: 0, violacoes: 0 }; this.limites.set(slot, l); }
    if(agora - l.ini >= JANELA_MS){
      if(l.n <= LIMITE_MENSAGENS) l.violacoes = 0;   // janela limpa perdoa; janela estourada não
      l.ini = agora; l.n = 0;
    }
    l.n++;
    if(l.n <= LIMITE_MENSAGENS) return 'ok';
    l.violacoes++;                    // cada mensagem acima do limite é uma violação
    return l.violacoes >= VIOLACOES_MAX ? 'derrubar' : 'excedeu';
  }

  async webSocketMessage(ws, mensagem){
    const anexo = ws.deserializeAttachment() || {};
    const slot = anexo.slot;
    if(!this.sala || slot === undefined) return this.fecharSeguro(ws, 1008, 'sem sala');
    if(typeof mensagem !== 'string' || mensagem.length > MAX_MENSAGEM){
      this.enviar(ws, { t: 'erro', codigo: 'mensagem' });
      log('erro', this.sala.codigo, { motivo: 'mensagem' });
      return this.fecharSeguro(ws, 1009, 'mensagem');
    }
    let msg = null, invalido = false;
    try{ msg = JSON.parse(mensagem); }catch(e){ invalido = true; }
    const id = msg && typeof msg === 'object' ? idSeguro(msg.id) : undefined;

    const lim = this.conferirLimite(slot);
    if(lim !== 'ok'){
      this.enviar(ws, { t: 'erro', codigo: 'limite', id });
      if(lim === 'derrubar'){
        log('erro', this.sala.codigo, { motivo: 'limite' });
        this.fecharSeguro(ws, 4008, 'limite');
      }
      return;
    }
    if(invalido || !msg || typeof msg !== 'object' || Array.isArray(msg)) return this.enviar(ws, { t: 'erro', codigo: 'json', id });

    if(msg.t === 'configurar') return this.configurar(ws, slot, msg, id);
    if(msg.t === 'escolherEquipe') return this.escolherEquipe(ws, slot, msg, id);
    if(msg.t === 'escolherPiloto') return this.escolherPiloto(ws, slot, msg, id);
    if(msg.t === 'sair') return this.sair(ws, slot, id);
    if(msg.t === 'iniciar') return this.iniciar(ws, slot, id);
    if(msg.t === 'acao') return this.acao(ws, slot, msg, id);
    if(msg.t === 'pronto') return this.pronto(ws, slot, msg, id);
    if(msg.t === 'corrida') return this.ordemCorrida(ws, slot, msg, id);
    if(msg.t === 'velocidade') return this.velocidadeCorrida(ws, slot, msg, id);
    if(msg.t === 'corridaSync'){ this.enviarCorridaInicio(ws); return this.enviar(ws, { t: 'ok', id }); }
    if(msg.t === '__falhar' && this.env.DESENVOLVIMENTO === '1'){
      this.falharProximo = true;      // só no desenvolvimento: a próxima rodada falha uma vez
      return this.enviar(ws, { t: 'ok', id });
    }
    this.enviar(ws, { t: 'erro', codigo: 'tipo', id });
  }

  erro(ws, codigo, id){ this.enviar(ws, { t: 'erro', codigo, id }); }

  /* só o anfitrião, só no lobby, só com a sala cheia: cria o mundo e abre a rodada 1 */
  async iniciar(ws, slot, id){
    const s = this.sala;
    if(slot !== s.anfitriao) return this.erro(ws, 'anfitriao', id);
    if(s.estado !== 'lobby') return this.erro(ws, 'estado', id);
    if(s.jogadores.length !== MAX_JOGADORES) return this.erro(ws, 'jogadores', id);
    const chefe = s.modo === 'chefe';
    if(chefe && !s.jogadores.every(j => Number.isInteger(s.config.equipes && s.config.equipes[j.slot]))) return this.erro(ws, 'equipes', id);
    if(s.modo === 'piloto' && !s.jogadores.every(j => s.config.pilotos && s.config.pilotos[j.slot])) return this.erro(ws, 'pilotos', id);
    const regras = this.regrasDe(s.modo);
    try{
      this.mundo = regras.iniciar(s.jogadores.map(j => ({ slot: j.slot, nome: j.nome })),
        { config: s.config, codigo: s.codigo, anfitriao: s.anfitriao });
    }catch(e){
      log('erro', s.codigo, { motivo: 'iniciar', erro: textoErro(e) });
      return this.erro(ws, 'interno', id);
    }
    const prontos = {};
    for(const j of s.jogadores) prontos[j.slot] = false;
    s.partida = { estado: 'planning', rodada: 1, prontos, ultimo: null, regras: regras.nome, falhas: 0 };
    s.acoesVistas = [];
    s.estado = 'partida';
    s.v++;
    await this.salvarTudo();
    log('iniciada', s.codigo);
    this.enviar(ws, { t: 'ok', id });
    this.difundir({ t: 'sala', v: s.v, sala: this.vista() });
    this.enviarVistas();
  }

  /* ação do jogador na rodada (planejar etc.). Uma ação reenviada com o mesmo id e o mesmo
     conteúdo recebe a resposta guardada e não é aplicada de novo. */
  async acao(ws, slot, msg, id){
    const s = this.sala, p = s.partida;
    if(!p) return this.erro(ws, 'estado', id);
    const regras = this.regrasDe(p.regras);
    const conteudo = JSON.stringify([msg.rodada, msg.tipo, msg.dados === undefined ? null : msg.dados]);
    const chave = slot + ':' + typeof id + ':' + id;
    s.acoesVistas = s.acoesVistas || [];
    const vista = id === undefined ? null : s.acoesVistas.find(a => a.chave === chave && a.conteudo === conteudo);
    if(vista) return this.enviar(ws, vista.resposta);
    if(p.estado === 'processing' || p.estado === 'corrida') return this.erro(ws, 'processando', id);
    if(msg.rodada !== p.rodada) return this.erro(ws, 'rodada', id);
    if(p.prontos[slot]) return this.erro(ws, 'pronto', id);
    const def = typeof msg.tipo === 'string' && Object.hasOwn(regras.acoes, msg.tipo) ? regras.acoes[msg.tipo] : null;
    if(!def) return this.erro(ws, 'acao', id);
    if(def.validar(msg.dados) !== null) return this.erro(ws, 'dados', id);
    /* aplica numa cópia: se as regras falharem no meio, o mundo oficial fica intacto */
    const copia = structuredClone(this.mundo);
    let resultado;
    try{ resultado = def.aplicar(copia, slot, msg.dados, { codigo: s.codigo, rodada: p.rodada, id }); }
    catch(e){
      log('erro', s.codigo, { motivo: 'acao', erro: textoErro(e) });
      return this.erro(ws, 'interno', id);
    }
    /* as regras recusaram: a cópia some, nada é gravado e a versão não muda */
    if(resultado && typeof resultado === 'object' && typeof resultado.erro === 'string')
      return this.enviar(ws, { t: 'erro', codigo: resultado.erro, id, detalhe: resultado.detalhe });
    const resposta = { t: 'ok', id, resultado };
    this.mundo = copia;
    if(id !== undefined){
      s.acoesVistas = s.acoesVistas.filter(a => a.chave !== chave);
      s.acoesVistas.push({ chave, conteudo, resposta });
      if(s.acoesVistas.length > MAX_ACOES_VISTAS) s.acoesVistas.splice(0, s.acoesVistas.length - MAX_ACOES_VISTAS);
    }
    s.v++;
    await this.salvarTudo();
    this.enviar(ws, resposta);
    this.difundir({ t: 'sala', v: s.v, sala: this.vista() });
    this.enviarVistas();
  }

  /* pronto / cancelar pronto. Quando o último fica pronto, a rodada vai para 'processing' e é
     processada: a mudança de estado é síncrona, então só uma mensagem consegue disparar isso. */
  async pronto(ws, slot, msg, id){
    const s = this.sala, p = s.partida;
    if(!p) return this.erro(ws, 'estado', id);
    if(p.estado === 'processing' || p.estado === 'corrida') return this.erro(ws, 'processando', id);
    if(msg.rodada !== p.rodada) return this.erro(ws, 'rodada', id);
    if(typeof msg.pronto !== 'boolean') return this.erro(ws, 'dados', id);
    if(!!p.prontos[slot] === msg.pronto) return this.enviar(ws, { t: 'ok', id });   // nada mudou
    if(msg.pronto){
      const regras = this.regrasDe(p.regras);
      let bloqueio = null;
      if(regras.podeFicarPronto){
        try{ bloqueio = regras.podeFicarPronto(this.mundo, slot); }
        catch(e){ log('erro', s.codigo, { motivo: 'pronto' }); return this.erro(ws, 'interno', id); }
      }
      if(bloqueio) return this.enviar(ws, { t: 'erro', codigo: bloqueio.erro, id, detalhe: bloqueio.detalhe });
    }
    p.prontos[slot] = msg.pronto;
    const todos = s.jogadores.every(j => p.prontos[j.slot] || this.dispensado(j.slot));
    const algum = s.jogadores.some(j => p.prontos[j.slot]);
    p.estado = todos ? 'processing' : algum ? 'waiting' : 'planning';
    s.v++;
    await this.salvarTudo();
    this.enviar(ws, { t: 'ok', id });
    this.difundir({ t: 'sala', v: s.v, sala: this.vista() });
    this.enviarVistas();
    if(todos) await this.processar();
  }

  /* processa a rodada atual no máximo uma vez: só roda com a partida em 'processing' e
     confere a rodada antes de gravar. Se as regras falharem, fica em 'processing' e o
     alarme tenta de novo (o mesmo sorteio, pois a semente é sala + rodada). */
  async processar(){
    const s = this.sala, p = s && s.partida;
    if(!p || p.estado !== 'processing') return;
    const N = p.rodada;
    const regras = this.regrasDe(p.regras);
    const aoVivo = regras.nome !== 'teste' && this.aoVivo();
    let r;
    try{
      if(this.falharProximo){ this.falharProximo = false; throw new Error('falha de teste'); }
      if(aoVivo && !p.corridaPronta){
        const x = this.comCorridas(regras, N, 'preparar');
        if(x.ctl.defs.length) return await this.comecarCorrida(x.ctl.defs, N);
        /* sem corrida com humano nesta rodada: o que saiu da preparação já é a rodada */
        r = x.r;
      }
      else if(aoVivo){
        const x = this.comCorridas(regras, N, 'concluir', p.corridaPronta ? await this.resultadosDaCorrida() : {});
        r = x.r;
        if(x.ctl.divergencias.length || x.ctl.faltas.length)
          log('erro', s.codigo, { motivo: 'corrida', rodada: N, divergencias: x.ctl.divergencias, faltas: x.ctl.faltas });
      }
      else r = regras.processar(structuredClone(this.mundo), N, criarRnd(s.codigo, N));
    }catch(e){
      p.falhas++;
      log(p.falhas > FALHAS_AVISO ? 'erro' : 'falha', s.codigo, { motivo: 'processamento', rodada: N, falhas: p.falhas, erro: textoErro(e) });
      /* a espera dobra a cada falha seguida (até 10 min): com a mesma semente, um defeito
         nas regras falharia sempre, e o alarme não pode virar um laço de requisições */
      const espera = Math.min(ESPERA_TETO_MS, ESPERA_TENTATIVA_MS * 2 ** Math.min(20, p.falhas - 1));
      await Promise.all([this.salvarTudo(), this.ctx.storage.setAlarm(Date.now() + espera)]);
      return;
    }
    if(p.estado !== 'processing' || p.rodada !== N) return;   // já processada por outro caminho
    this.mundo = r.mundo;
    p.ultimo = { rodada: N, resultado: r.resultado };
    p.rodada = N + 1;
    for(const j of s.jogadores) p.prontos[j.slot] = false;
    p.estado = 'planning';
    p.falhas = 0;
    const tinhaCorrida = !!p.corridaPronta;
    delete p.corridaPronta; delete p.corrida;
    this.corridas = null;
    s.v++;
    await this.salvarTudo();
    if(tinhaCorrida) await this.ctx.storage.delete(['corridaDefs', 'corridaEst']);
    log('processada', s.codigo, { rodada: N });
    this.difundir({ t: 'rodada', v: s.v, rodada: N, resultado: r.resultado });
    this.difundir({ t: 'sala', v: s.v, sala: this.vista() });
    this.enviarVistas();
  }

  async alarm(){
    const p = this.sala && this.sala.partida;
    if(p && p.estado === 'corrida'){
      if(!this.relogio || !this.corridas) await this.retomarCorrida();
      else await this.ctx.storage.setAlarm(Date.now() + VIGIA_MS);
      return;
    }
    await this.processar();
  }

  /* ── corridas ao vivo (Fase 5) ── */
  aoVivo(){ const c = this.sala.config; return !c || c.aoVivo !== false; }

  /* a rodada processada com os ganchos das corridas: 'preparar' recolhe as corridas (numa cópia do
     mundo, descartada); 'concluir' usa as chegadas guardadas */
  comCorridas(regras, N, modo, resultados){
    const s = this.sala, J = this.motor();
    const ctl = ligarCorridas(J, modo, resultados);
    try{ return { ctl, r: regras.processar(structuredClone(this.mundo), N, criarRnd(s.codigo, N)) }; }
    finally{ desligarCorridas(J); }
  }

  estadoCorrida(){ return { vel: this.corridaVel, corridas: [...this.corridas.values()].map(c => c.salvo()) }; }
  publicoCorrida(agora){ return { t: 'corridaEstado', vel: this.corridaVel, corridas: [...this.corridas.values()].map(c => c.publico(agora)) }; }

  async comecarCorrida(defs, N){
    const s = this.sala, p = s.partida, J = this.motor(), agora = Date.now();
    this.corridas = new Map();
    for(const d of defs){ const c = new Corrida(J, d); c.prazo = agora + LARGADA_MS; this.corridas.set(d.chave, c); }
    this.corridaVel = VELOCIDADES.includes(s.config && s.config.velocidade) ? s.config.velocidade : 8;
    p.estado = 'corrida';
    p.corrida = { rodada: N, n: defs.length };
    p.falhas = 0;
    s.v++;
    await this.ctx.storage.put({ sala: s, corridaDefs: defs, corridaEst: this.estadoCorrida() });
    log('corrida', s.codigo, { rodada: N, corridas: defs.length });
    this.difundir({ t: 'sala', v: s.v, sala: this.vista() });
    for(const w of this.ctx.getWebSockets()) this.enviarCorridaInicio(w);
    this.ligarRelogio();
  }

  /* depois de um reinício: a entrada e o registro refazem cada corrida até o passo guardado */
  async retomarCorrida(){
    const s = this.sala, p = s.partida;
    const g = await this.ctx.storage.get(['corridaDefs', 'corridaEst']);
    const defs = g.get('corridaDefs'), est = g.get('corridaEst');
    if(!defs || !est){
      /* sem a corrida guardada: a rodada segue pelo caminho rápido */
      log('erro', s.codigo, { motivo: 'corrida', erro: 'sem estado para retomar' });
      p.estado = 'processing'; p.corridaPronta = true;
      await this.salvar();
      return this.processar();
    }
    const J = this.motor(), agora = Date.now();
    this.corridas = new Map();
    this.corridaVel = est.vel || 8;
    for(const d of defs){
      const c = new Corrida(J, d, (est.corridas || []).find(x => x.chave === d.chave));
      if(c.fase === 'largada' || c.fase === 'pergunta') c.prazo = Math.max(c.prazo, agora + 5000);
      c.relogio = agora;
      this.corridas.set(d.chave, c);
    }
    log('corridaRetomada', s.codigo, { rodada: p.rodada });
    for(const w of this.ctx.getWebSockets()) this.enviarCorridaInicio(w);
    this.ligarRelogio();
  }

  ligarRelogio(){
    if(this.relogio) return;
    this.ultMarca = 0; this.ultSoma = Date.now(); this.ultSalvo = Date.now();
    this.relogio = setInterval(() => {
      this.tique().catch(e => log('erro', this.sala && this.sala.codigo, { motivo: 'tique', erro: textoErro(e) }));
    }, TIQUE_MS);
    this.ctx.storage.setAlarm(Date.now() + VIGIA_MS);
  }
  desligarRelogio(){ if(this.relogio){ clearInterval(this.relogio); this.relogio = null; } }

  /* desconectado há mais de FORA_MS: a equipe assume as paradas dele; de volta, devolve */
  conferirAusentes(c, agora){
    const novas = [];
    for(const slot of c.def.slots){
      const f = c.fora[slot] || (c.fora[slot] = { desde: null, aplicado: false });
      if(this.conectado(slot)){
        f.desde = null;
        if(f.aplicado){ f.aplicado = false; c.meus(slot).forEach(i => { const e = c.ordemDaSala(i, { equipe: false }); if(e) novas.push(e); }); }
      } else {
        if(f.desde == null) f.desde = agora;
        if(!f.aplicado && agora - f.desde > FORA_MS){ f.aplicado = true; c.meus(slot).forEach(i => { const e = c.ordemDaSala(i, { equipe: true }); if(e) novas.push(e); }); }
      }
    }
    return novas;
  }

  async tique(){
    if(this.tiqueando || !this.corridas) return;
    this.tiqueando = true;
    try{
      const s = this.sala, p = s && s.partida, agora = Date.now();
      if(!p || p.estado !== 'corrida'){ this.desligarRelogio(); return; }
      let mudou = false;
      for(const c of this.corridas.values()){
        if(c.fase === 'fim') continue;
        const novas = c.fase === 'correndo' ? this.conferirAusentes(c, agora) : [];
        const mud = c.avancar(agora, this.corridaVel);
        for(const e of novas.concat(mud.novas)) this.difundir({ t: 'corridaLog', k: c.def.chave, e });
        if(novas.length || mud.novas.length || mud.fase) mudou = true;
        if(mud.soma) c.ultimaSoma = mud.soma;
      }
      if(mudou || agora - this.ultMarca >= MARCA_MS){ this.ultMarca = agora; this.difundir(this.publicoCorrida(agora)); }
      if(agora - this.ultSoma >= SOMA_MS){
        this.ultSoma = agora;
        for(const c of this.corridas.values()) if(c.ultimaSoma){ this.difundir(Object.assign({ t: 'corridaSoma', k: c.def.chave }, c.ultimaSoma)); c.ultimaSoma = null; }
      }
      const todas = [...this.corridas.values()].every(c => c.fase === 'fim');
      if(mudou || todas || agora - this.ultSalvo >= SALVAR_MS){ this.ultSalvo = agora; await this.ctx.storage.put('corridaEst', this.estadoCorrida()); }
      if(todas) await this.fimDasCorridas();
    } finally { this.tiqueando = false; }
  }

  /* todas na bandeirada: a rodada é processada com as chegadas */
  async fimDasCorridas(){
    const s = this.sala, p = s.partida;
    if(!p || p.estado !== 'corrida') return;
    this.desligarRelogio();
    p.estado = 'processing'; p.corridaPronta = true;
    s.v++;
    await this.ctx.storage.put({ sala: s, corridaEst: this.estadoCorrida() });
    log('corridaFim', s.codigo, { rodada: p.rodada });
    this.difundir({ t: 'corridaFim', rodada: p.rodada });
    this.difundir({ t: 'sala', v: s.v, sala: this.vista() });
    await this.processar();
  }

  async resultadosDaCorrida(){
    const g = await this.ctx.storage.get(['corridaDefs', 'corridaEst']);
    const defs = g.get('corridaDefs') || [], est = g.get('corridaEst') || { corridas: [] }, out = {};
    for(const d of defs){
      const c = est.corridas.find(x => x.chave === d.chave);
      out[d.chave] = { ent: d.ent, res: c ? c.res : null, notas: c ? c.notas : null };
    }
    return out;
  }

  enviarCorridaInicio(ws){
    const p = this.sala && this.sala.partida;
    if(!p || p.estado !== 'corrida' || !this.corridas) return;
    const agora = Date.now();
    this.enviar(ws, { t: 'corridaInicio', rodada: p.rodada, vel: this.corridaVel, corridas: [...this.corridas.values()].map(c => c.inicio(agora)) });
  }

  /* uma ordem do jogador para a corrida: registrada e mandada a todos antes de qualquer passo novo */
  async ordemCorrida(ws, slot, msg, id){
    const p = this.sala.partida;
    if(!p || p.estado !== 'corrida' || !this.corridas) return this.erro(ws, 'estado', id);
    const c = typeof msg.k === 'string' ? this.corridas.get(msg.k) : null;
    if(!c) return this.erro(ws, 'corrida', id);
    if(typeof msg.tipo !== 'string') return this.erro(ws, 'tipo', id);
    const agora = Date.now();
    let r;
    try{ r = c.ordem(slot, msg.tipo, msg.dados, agora); }
    catch(e){ log('erro', this.sala.codigo, { motivo: 'ordem', erro: textoErro(e) }); return this.erro(ws, 'interno', id); }
    if(r.erro) return this.erro(ws, r.erro, id);
    if(r.e) this.difundir({ t: 'corridaLog', k: c.def.chave, e: r.e });
    this.enviar(ws, { t: 'ok', id, resultado: r.e ? { n: r.e.n, passo: r.e.passo } : null });
    this.difundir(this.publicoCorrida(agora));
    await this.ctx.storage.put('corridaEst', this.estadoCorrida());
  }

  /* a velocidade da transmissão: qualquer um que está correndo muda para todos (não muda o resultado) */
  async velocidadeCorrida(ws, slot, msg, id){
    const p = this.sala.partida;
    if(!p || p.estado !== 'corrida' || !this.corridas) return this.erro(ws, 'estado', id);
    if(![...this.corridas.values()].some(c => c.def.slots.map(String).includes(String(slot)))) return this.erro(ws, 'corrida', id);
    if(!VELOCIDADES.includes(msg.v)) return this.erro(ws, 'dados', id);
    this.corridaVel = msg.v;
    this.enviar(ws, { t: 'ok', id });
    this.difundir(this.publicoCorrida(Date.now()));
    await this.ctx.storage.put('corridaEst', this.estadoCorrida());
  }

  async configurar(ws, slot, msg, id){
    const s = this.sala;
    if(slot !== s.anfitriao) return this.enviar(ws, { t: 'erro', codigo: 'anfitriao', id });
    const c = msg.config;
    if(!c || typeof c !== 'object' || Array.isArray(c)) return this.enviar(ws, { t: 'erro', codigo: 'config', id });
    if(s.modo === 'chefe'){
      /* sala de chefe: velocidade, série e ano, todos opcionais (só o que veio muda); série e ano só
         no lobby e validados pelo motor (o ano precisa ter equipes naquela série). Mudar um deles
         apaga as escolhas de equipe. */
      if(c.velocidade !== undefined && !VELOCIDADES.includes(c.velocidade)) return this.erro(ws, 'config', id);
      if(c.aoVivo !== undefined && typeof c.aoVivo !== 'boolean') return this.erro(ws, 'config', id);
      if(c.sk !== undefined && !SERIES_CHEFE.includes(c.sk)) return this.erro(ws, 'config', id);
      if(c.ano !== undefined && !(Number.isInteger(c.ano) && c.ano >= 1900 && c.ano <= 2100)) return this.erro(ws, 'config', id);
      const novo = Object.assign({}, s.config);
      if(c.velocidade !== undefined) novo.velocidade = c.velocidade;
      if(c.aoVivo !== undefined) novo.aoVivo = c.aoVivo;
      if(c.sk !== undefined) novo.sk = c.sk;
      if(c.ano !== undefined) novo.ano = c.ano;
      if(novo.sk !== s.config.sk || novo.ano !== s.config.ano){
        if(s.estado !== 'lobby') return this.erro(ws, 'estado', id);
        let teams = [];
        try{ teams = this.motor().eraOfSeries(novo.ano, novo.sk).teams || []; }catch(e){ teams = []; }
        if(!teams.length) return this.erro(ws, 'config', id);
        novo.equipes = {};
      }
      s.config = novo;
    }else if(s.modo === 'piloto'){
      /* sala de piloto: velocidade, série e ano, todos opcionais (só o que veio muda); série e ano só no
         lobby. O ano precisa ter uma era do jogo e existir na série. Os pilotos escolhidos ficam. */
      if(c.velocidade !== undefined && !VELOCIDADES.includes(c.velocidade)) return this.erro(ws, 'config', id);
      if(c.aoVivo !== undefined && typeof c.aoVivo !== 'boolean') return this.erro(ws, 'config', id);
      if(c.serie !== undefined && !SERIES_PILOTO.includes(c.serie)) return this.erro(ws, 'config', id);
      if(c.ano !== undefined && !Number.isInteger(c.ano)) return this.erro(ws, 'config', id);
      const novo = Object.assign({}, s.config);
      if(c.velocidade !== undefined) novo.velocidade = c.velocidade;
      if(c.aoVivo !== undefined) novo.aoVivo = c.aoVivo;
      if(c.serie !== undefined) novo.serie = c.serie;
      if(c.ano !== undefined) novo.ano = c.ano;
      if(novo.serie !== s.config.serie || novo.ano !== s.config.ano){
        if(s.estado !== 'lobby') return this.erro(ws, 'estado', id);
        let ok = false;
        try{
          const J = this.motor(), era = J.Engine.eraOf(novo.ano, 'f1');
          ok = novo.ano >= J.ERAS[0].y && novo.ano <= 2100 && !!era && J.ERAS.includes(era) && novo.ano >= J.SERIES[novo.serie].from;
        }catch(e){ ok = false; }
        if(!ok) return this.erro(ws, 'config', id);
      }
      s.config = novo;
    }else{
      if(!VELOCIDADES.includes(c.velocidade)) return this.enviar(ws, { t: 'erro', codigo: 'config', id });
      s.config = { velocidade: c.velocidade };
    }
    s.v++;
    await this.salvar();
    this.enviar(ws, { t: 'ok', id });
    this.difundir({ t: 'sala', v: s.v, sala: this.vista() });
  }

  /* a equipe de cada jogador, no lobby da sala de chefe: um índice da lista de equipes da série e
     do ano que o motor consegue montar, e nunca o mesmo para dois jogadores */
  async escolherEquipe(ws, slot, msg, id){
    const s = this.sala;
    if(s.modo !== 'chefe') return this.erro(ws, 'modo', id);
    if(s.estado !== 'lobby') return this.erro(ws, 'estado', id);
    const idx = msg.idx;
    if(!Number.isInteger(idx) || idx < 0) return this.erro(ws, 'equipe', id);
    let ok = false;
    try{
      const J = this.motor(), era = J.eraOfSeries(s.config.ano, s.config.sk);
      ok = !!era.teams[idx] && !!J.Engine.resolveTeam(era.teams[idx], idx, s.config.ano, s.config.sk);
    }catch(e){ ok = false; }
    s.config.equipes = s.config.equipes || {};
    if(!ok || Object.entries(s.config.equipes).some(([k, v]) => v === idx && Number(k) !== slot)) return this.erro(ws, 'equipe', id);
    s.config.equipes[slot] = idx;
    s.v++;
    await this.salvar();
    this.enviar(ws, { t: 'ok', id });
    this.difundir({ t: 'sala', v: s.v, sala: this.vista() });
  }

  /* o piloto de cada jogador, no lobby da sala de piloto: nome, país (sigla), idade e estilo. O nome
     (2 a 24 caracteres: o formulário do jogo pede ao menos 2 letras) não repete o do outro piloto. */
  async escolherPiloto(ws, slot, msg, id){
    const s = this.sala;
    if(s.modo !== 'piloto') return this.erro(ws, 'modo', id);
    if(s.estado !== 'lobby') return this.erro(ws, 'estado', id);
    const p = msg.piloto;
    if(!p || typeof p !== 'object' || Array.isArray(p)) return this.erro(ws, 'piloto', id);
    const jogador = s.jogadores.find(j => j.slot === slot);
    if(p.nome !== undefined && p.nome !== null && typeof p.nome !== 'string') return this.erro(ws, 'piloto', id);
    const nome = limparNome(p.nome) || limparNome(jogador && jogador.nome);
    const estilo = p.estilo === undefined || p.estilo === null ? 'equilibrado' : p.estilo;
    let ok = nome.length >= 2 && typeof p.cc === 'string' && RE_CC.test(p.cc) && Number.isInteger(p.idade)
      && p.idade >= IDADE_MIN && p.idade <= IDADE_MAX && typeof estilo === 'string';
    try{
      const J = this.motor();
      ok = ok && Object.keys(J.STYLES).includes(estilo) && J.COUNTRIES.some(c => c.cc === p.cc);
    }catch(e){ ok = false; }
    if(!ok) return this.erro(ws, 'piloto', id);
    s.config.pilotos = s.config.pilotos || {};
    const igual = x => x.nome.toLocaleLowerCase() === nome.toLocaleLowerCase();
    if(Object.entries(s.config.pilotos).some(([k, v]) => Number(k) !== slot && igual(v))) return this.erro(ws, 'piloto', id);
    s.config.pilotos[slot] = { nome, cc: p.cc, idade: p.idade, estilo };
    s.v++;
    await this.salvar();
    this.enviar(ws, { t: 'ok', id });
    this.difundir({ t: 'sala', v: s.v, sala: this.vista() });
  }

  async sair(ws, slot, id){
    const s = this.sala;
    if(s.estado !== 'lobby') return this.enviar(ws, { t: 'erro', codigo: 'estado', id });
    s.jogadores = s.jogadores.filter(j => j.slot !== slot);
    if(s.config && s.config.equipes) delete s.config.equipes[slot];
    if(s.config && s.config.pilotos) delete s.config.pilotos[slot];
    this.limites.delete(slot);
    this.enviar(ws, { t: 'ok', id });
    for(const w of this.ctx.getWebSockets('slot:' + slot)) this.fecharSeguro(w, 1000, 'saiu');
    log('saiu', s.codigo);
    if(!s.jogadores.length){
      this.sala = null;
      await this.ctx.storage.deleteAll();
      return;
    }
    if(s.anfitriao === slot) s.anfitriao = Math.min(...s.jogadores.map(j => j.slot));
    s.v++;
    await this.salvar();
    this.difundir({ t: 'sala', v: s.v, sala: this.vista() });
  }

  async aoDesconectar(ws, codigo, motivo){
    this.fecharSeguro(ws, codigo, motivo);
    const s = this.sala;
    const anexo = ws.deserializeAttachment() || {};
    const j = s && s.jogadores.find(x => x.slot === anexo.slot);
    if(!j) return;                    // saiu de vez: o 'sala' do sair já avisou todo mundo
    j.visto = Date.now();
    await this.salvar();
    this.difundir({ t: 'jogadores', v: s.v, jogadores: this.vista(ws).jogadores }, ws);
  }

  async webSocketClose(ws, codigo, motivo){
    await this.aoDesconectar(ws, codigo, motivo);
  }

  async webSocketError(ws, erro){
    if(this.sala) log('erro', this.sala.codigo, { motivo: 'ws' });
    await this.aoDesconectar(ws, 1011, 'erro');
  }
}
