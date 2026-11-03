/* Multiplayer: as salas, as rodadas do chefe (Fase 3) e as da carreira de piloto (Fase 4).
   Cria uma sala ou entra com o código de um amigo, mostra quem está nela e se está
   conectado, e volta sozinho para a sala depois de uma queda ou de fechar o jogo.
   As corridas ao vivo (Fase 5) rodam no servidor e nas duas telas. O servidor (pasta multiplayer/)
   é a autoridade: esta página só faz pedidos e mostra o que ele responde.

   A ficha que identifica o jogador fica no localStorage (vdo_mp). É uma identidade de
   teste, não uma conta: quem tiver a ficha ocupa a vaga, e limpar os dados do site a
   perde. O botão aparece com o servidor local (127.0.0.1) e, no site oficial (servidor em
   mp.volantedeouro.com), por enquanto só para quem abriu o link com ?mp=1: o aparelho lembra
   (?mp=0 esquece). Com ABERTO_A_TODOS, aparece para todo mundo. Em outra origem, só quando
   VDO_MP_SERVIDOR for definido.
   Para testar dois jogadores no mesmo navegador: ?mpperfil=2 usa outra ficha. */
(function(){
  'use strict';
  const local = /^(127\.0\.0\.1|localhost)$/.test(location.hostname);
  const oficial = /^(www\.)?volantedeouro\.com$/.test(location.hostname);
  const SERVIDOR = local ? 'http://127.0.0.1:8787' : String(window.VDO_MP_SERVIDOR || (oficial ? 'https://mp.volantedeouro.com' : ''));
  /* em teste: no site oficial, o botão só para quem tem o link (?mp=1) */
  const ABERTO_A_TODOS = false;
  const comLink = (() => {
    const q = new URLSearchParams(location.search).get('mp');
    try {
      if(q === '1') localStorage.setItem('vdo_mp_ver', '1');
      if(q === '0') localStorage.removeItem('vdo_mp_ver');
      return localStorage.getItem('vdo_mp_ver') === '1';
    } catch(e){ return q === '1'; }
  })();
  const perfil = (new URLSearchParams(location.search).get('mpperfil') || '').replace(/[^a-z0-9]/gi, '').slice(0, 8);
  const CHAVE = 'vdo_mp' + (perfil ? '_' + perfil : '');
  const TITULO_SALA = 'Sala multiplayer', TITULO_ENTRADA = 'Multiplayer';
  const MODOS = { chefe: 'Chefe de equipe', piloto: 'Carreira de piloto' };
  const MODO_ENTRADA = {
    chefe: { bt: 'Criar sala de chefe', tx: 'Até 8 jogadores. Cada um comanda uma equipe real do mesmo grid, ou divide uma com os amigos: contratos, carro e estratégia.' },
    piloto: { bt: 'Criar sala de piloto', tx: 'Até 8 jogadores, cada um com o seu piloto. Com a mesma idade, dividem a categoria; com idades diferentes, cada um sobe pela sua.' }
  };
  const VELS = [1, 2, 4, 8, 16];
  const MAX_SALA = 8;
  /* o dono de um carro na corrida ao vivo: um slot, ou a lista dos membros de uma equipe dividida */
  const ehDono = (d, slot) => [].concat(d).map(String).includes(String(slot));
  const ERROS = {
    rede: 'Sem conexão com o servidor do multiplayer.',
    servidor: 'O servidor do multiplayer não respondeu direito. Tente de novo.',
    limite: 'Muitas salas criadas agora. Espere um minuto e tente de novo.',
    codigo: 'Esse código não é válido: confira as letras e os números.',
    sala: 'Essa sala não existe.',
    cheia: 'Essa sala já está cheia: cabem até 8 jogadores.',
    versao: 'A sua página está numa versão diferente do servidor. Recarregue a página.',
    comecou: 'A partida dessa sala já começou.',
    nome: 'Escreva o seu nome.',
    origem: 'Este endereço não pode abrir salas.',
    anfitriao: 'Só o anfitrião muda isso.',
    forcar: 'Ainda não dá para avançar sem os outros.',
    subir: 'Não há oferta para subir de categoria agora.',
    fundar: 'Confira a equipe: nome de 2 a 22 letras (sem repetir o de outra equipe fundada), cor, país e de onde vem o dinheiro.',
    tempo: 'O servidor demorou a responder. Tente de novo.',
    jogadores: 'A partida precisa de pelo menos dois jogadores na sala.',
    estado: 'Isso não vale neste momento da partida.',
    processando: 'A rodada está sendo processada.',
    rodada: 'Essa rodada já passou: a tela foi atualizada.',
    pronto: 'Você está pronto: cancele a prontidão para mudar a decisão.',
    acao: 'Essa ação não é permitida.',
    dados: 'Essa decisão não é válida.',
    equipes: 'Os dois jogadores precisam escolher uma equipe.',
    equipe: 'Essa equipe não está disponível neste campeonato.',
    config: 'Esse campeonato não está disponível.',
    pendencias: 'Ainda há pendências antes de seguir.',
    evento: 'Decida o acontecimento antes de ficar pronto.',
    superlicenca: 'Esse piloto não tem superlicença.',
    mp: 'Indisponível no multiplayer por enquanto.',
    academia: 'A academia está cheia.',
    pacote: 'Não dá para levar esse pacote agora.',
    interno: 'O servidor não conseguiu aplicar essa decisão.',
    pilotos: 'Os dois jogadores precisam escolher o piloto.',
    piloto: 'Esse nome de piloto já foi escolhido.',
    proposta: 'Escolha uma proposta antes de seguir.',
    serie: 'Propostas de outra série não valem no multiplayer.',
    carreira: 'A sua carreira acabou.',
    fase: 'Isso não vale nesta fase.',
    corrida: 'Você não está nesta corrida.',
    carro: 'Esse carro não é seu.',
    repetida: 'A sua largada já foi registrada.',
    fim: 'A corrida já acabou.',
    quali: 'Você já escolheu a hora da classificação.'
  };
  const TELAS = new Set([TITULO_SALA, 'Partida multiplayer', 'Resultado da rodada']);
  const erroTxt = c => ERROS[c] || ERROS.servidor;

  function ler(){ try { const g = JSON.parse(localStorage.getItem(CHAVE) || 'null'); return g && g.codigo && /^[0-9a-f]{64}$/.test(g.ficha) ? g : null; } catch(e){ return null; } }
  /* as salas deste aparelho (a atual fica em CHAVE; a lista guarda todas, para voltar a qualquer uma) */
  const LISTA = CHAVE + '_salas';
  function lerLista(){ try { const l = JSON.parse(localStorage.getItem(LISTA) || '[]'); return Array.isArray(l) ? l.filter(g => g && g.codigo && /^[0-9a-f]{64}$/.test(g.ficha)) : []; } catch(e){ return []; } }
  function gravarLista(l){ try { if(l.length) localStorage.setItem(LISTA, JSON.stringify(l.slice(0, 20))); else localStorage.removeItem(LISTA); } catch(e){} }
  function naLista(g){ if(!g) return; const l = lerLista().filter(x => x.codigo !== g.codigo); l.unshift(Object.assign({}, g, { em: Date.now() })); gravarLista(l); }
  function gravar(g){ try { if(g) localStorage.setItem(CHAVE, JSON.stringify(g)); else localStorage.removeItem(CHAVE); } catch(e){} if(g) naLista(g); }
  const codigoBonito = c => String(c || '').replace(/^(.{4})(.{4})$/, '$1-$2');
  const id = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random());

  /* a soma do estado da corrida: igual à de multiplayer/src/corrida-mp.js (somaDe) */
  function somaCorrida(R){
    let h = 0x811c9dc5;
    const mexe = v => { const t = String(v); for(let i = 0; i < t.length; i++){ h ^= t.charCodeAt(i); h = Math.imul(h, 0x01000193); } h ^= 124; h = Math.imul(h, 0x01000193); };
    mexe(Math.round(R.t * 4)); mexe(Math.round(R.w * 1e4)); mexe(R.sc ? R.sc.tipo + (R.sc.fim ? 1 : 0) : '-');
    for(const s of R.carros){
      mexe(Math.round(s.s * 100)); mexe(Math.round(s.v * 100)); mexe(s.estado); mexe(s.voltas); mexe(s.paradas);
      mexe(s.pneu.c); mexe(Math.round(s.pneu.gasto * 1e5)); mexe(s.modo); mexe(Math.round((s.comb || 0) * 1e5));
    }
    return (h >>> 0).toString(36);
  }

  const MP = {
    /* fora | conectando | conectado | reconectando | outra-aba | perdida */
    con: 'fora', sala: null, voce: null, v: -1, ws: null, tentativas: 0, falhas: 0, _pend: {}, versao: null,

    /* quem já tem uma sala guardada continua vendo o botão, mesmo sem o link */
    disponivel(){ return !!SERVIDOR && (local || ABERTO_A_TODOS || comLink || !!ler() || lerLista().length > 0) && typeof WebSocket === 'function' && !!(window.crypto && crypto.subtle); },

    /* o mesmo hash que multiplayer/ferramentas/gerar-motor.mjs calcula dos scripts sem atributo */
    async versaoDaPagina(){
      if(MP.versao) return MP.versao;
      const blocos = [...document.scripts].filter(s => !s.attributes.length).map(s => s.textContent);
      const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(blocos.join('\n/*--*/\n')));
      return (MP.versao = [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('').slice(0, 16));
    },

    async pedir(caminho, corpo){
      let r;
      try { r = await fetch(SERVIDOR + caminho, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(corpo) }); }
      catch(e){ return { erro: 'rede' }; }
      let d = null; try { d = await r.json(); } catch(e){}
      if(!r.ok || !d) return { erro: (d && d.erro) || 'servidor' };
      return d;
    },

    /* ── entrar e criar ── */
    async criar(){
      const nome = (el('mpNome') || {}).value || '';
      const m = document.querySelector('input[name="mpModo"]:checked');
      await MP.chegar('/api/salas', { nome, modo: m ? m.value : 'chefe' }, nome);
    },
    async entrar(){
      const nome = (el('mpNome') || {}).value || '';
      const codigo = String((el('mpCodigo') || {}).value || '').toUpperCase().replace(/[^0-9A-Z]/g, '');
      if(codigo.length !== 8) return MP.avisar('codigo');
      await MP.chegar('/api/salas/' + codigo + '/entrar', { nome }, nome);
    },
    async chegar(caminho, corpo, nome){
      if(MP._ocupado) return;
      if(!String(nome).trim()) return MP.avisar('nome');
      MP._ocupado = true; MP.avisar('');
      document.querySelectorAll('.mp-acao').forEach(b => b.disabled = true);
      corpo.versao = await MP.versaoDaPagina();
      const d = await MP.pedir(caminho, corpo);
      MP._ocupado = false;
      document.querySelectorAll('.mp-acao').forEach(b => b.disabled = false);
      if(d.erro) return MP.avisar(d.erro);
      /* a sala de antes continua na lista, mas a conexão com ela fecha: tudo daqui vai para a nova */
      MP.soltar();
      gravar({ codigo: d.codigo, ficha: d.ficha, slot: d.slot, nome: String(nome).trim() });
      try { localStorage.setItem('vdo_mp_nome', String(nome).trim()); } catch(e){}
      MP.sala = d.sala || null; MP.voce = { slot: d.slot }; MP.v = -1; MP.tentativas = 0; MP.falhas = 0;
      MP.conectar(); MP.abrir();
    },
    avisar(c){ const e = el('mpErro'); if(e) e.textContent = c ? erroTxt(c) : ''; },

    /* ── a conexão ── */
    conectar(){
      const g = ler(); if(!g || !MP.disponivel()) return;
      if(MP.ws && MP.ws.readyState <= 1) return;
      clearTimeout(MP._volta);
      MP.con = MP.tentativas ? 'reconectando' : 'conectando'; MP.desenhar();
      let ws;
      try { ws = new WebSocket(SERVIDOR.replace(/^http/, 'ws') + '/api/salas/' + g.codigo + '/ws', ['volante.v1', 'ficha.' + g.ficha]); }
      catch(e){ return MP.agendar(); }
      MP.ws = ws;
      let abriu = false;
      ws.onopen = () => { abriu = true; MP.tentativas = 0; MP.falhas = 0; MP.con = 'conectado';
        clearInterval(MP._ping); MP._ping = setInterval(() => { if(ws.readyState === 1) ws.send('{"t":"ping"}'); }, 25000); MP.desenhar(); };
      ws.onmessage = ev => { let m = null; try { m = JSON.parse(ev.data); } catch(e){} if(m && typeof m === 'object') MP.receber(m); };
      ws.onclose = ev => {
        if(MP.ws !== ws) return;
        MP.ws = null; clearInterval(MP._ping);
        Object.values(MP._pend).forEach(p => p.fim({ erro: 'rede' })); MP._pend = {};
        if(ev.code === 4000){ MP.con = 'outra-aba'; return MP.desenhar(); }
        if(MP._saindo) return;
        /* sem nunca abrir, várias vezes seguidas: a vaga ou a sala não existem mais */
        MP.falhas = abriu ? 0 : MP.falhas + 1;
        if(MP.falhas >= 6){ MP.con = 'perdida'; return MP.desenhar(); }
        MP.agendar();
      };
    },
    agendar(){
      MP.tentativas++; MP.con = 'reconectando'; MP.desenhar();
      MP._volta = setTimeout(MP.conectar, Math.min(15000, 1000 * 2 ** Math.min(4, MP.tentativas - 1)));
    },
    tentarDeNovo(){ MP.falhas = 0; MP.tentativas = 0; MP.conectar(); },

    receber(m){
      if(m.t === 'estado' || m.t === 'sala'){
        if(typeof m.v === 'number' && m.v < MP.v) return;
        if(typeof m.v === 'number') MP.v = m.v;
        MP.sala = m.sala || MP.sala; if(m.voce) MP.voce = m.voce;
        const g = ler(); if(g && MP.sala && MP.sala.modo && g.modo !== MP.sala.modo){ g.modo = MP.sala.modo; gravar(g); }
      } else if(m.t === 'jogadores'){
        if(MP.sala && Array.isArray(m.jogadores)) MP.sala.jogadores = m.jogadores;
      } else if(m.t === 'vista'){
        /* o que só este jogador vê (as decisões dele); chega depois de cada mudança */
        if(typeof m.v === 'number' && m.v < (MP.vVista || -1)) return;
        MP.vVista = typeof m.v === 'number' ? m.v : MP.vVista; MP.vista = m.vista || null;
        if(MP._chefe && MP.vista && MP.vista.C) return MP.aplicarChefe();
        if(MP._piloto && MP.vista && MP.vista.S) return MP.aplicarPiloto();
      } else if(m.t === 'rodada'){
        /* a rodada foi processada: o resultado oficial, igual para os dois */
        if(MP.sala && MP.sala.partida) MP.sala.partida.ultimo = { rodada: m.rodada, resultado: m.resultado };
        /* no chefe, o que aconteceu aparece nas telas do próprio jogo, com a equipe já atualizada */
        if(MP.sala && MP.sala.partida && (MP.sala.partida.regras === 'chefe' || MP.sala.partida.regras === 'piloto')){ MP._rodadaNova = m.resultado || {}; return; }
        const m2 = el('modal');
        if(UI.aberta() && m2 && TELAS.has(m2.dataset.titulo)) MP._verResultado = true;
        else { MP._verResultado = true; UI.toast('Rodada processada.'); }
      } else if(m.t === 'corridaInicio'){ return MP.corridaInicio(m);
      } else if(m.t === 'corridaLog'){ return MP.corridaLog(m);
      } else if(m.t === 'corridaEstado'){ return MP.corridaEstado(m);
      } else if(m.t === 'corridaSoma'){ return MP.corridaSoma(m);
      } else if(m.t === 'corridaFim'){ if(MP.cor) MP.cor.fim = true; return MP.barra();
      } else if(m.t === 'forcado'){
        /* o anfitrião avançou sem esperar: quem não tinha confirmado fica sabendo */
        const eu = MP.meuSlot();
        if(m.corrida) UI.toast('O anfitrião levou a corrida até o fim.');
        else if((m.slots || []).map(String).includes(String(eu))) UI.toast('O anfitrião avançou a rodada: as suas decisões abertas ficaram com a escolha padrão.');
        return;
      } else if(m.t === 'ok' || m.t === 'erro'){
        const p = m.id && MP._pend[m.id];
        if(p){ delete MP._pend[m.id]; p.fim(m.t === 'ok' ? { ok: true, resultado: m.resultado } : { erro: m.codigo, detalhe: m.detalhe }); }
        else if(m.t === 'erro' && m.codigo === 'limite') UI.toast('Muitas mensagens seguidas: espere um pouco.');
        return;
      } else return;
      MP.desenhar();
    },
    /* uma mensagem com id: responde quando o servidor confirmar (ou recusar) */
    enviar(t, dados){
      return new Promise(fim => {
        if(!MP.ws || MP.ws.readyState !== 1) return fim({ erro: 'rede' });
        const k = id(), espera = setTimeout(() => { if(MP._pend[k]){ delete MP._pend[k]; fim({ erro: 'tempo' }); } }, 8000);
        MP._pend[k] = { fim: r => { clearTimeout(espera); fim(r); } };
        MP.ws.send(JSON.stringify(Object.assign({ t, id: k }, dados || {})));
      });
    },

    async velocidade(n){
      const r = await MP.enviar('configurar', { config: { velocidade: n } });
      if(r.erro) UI.toast(erroTxt(r.erro));
    },
    /* ── a partida por turnos ── */
    async iniciar(){
      const r = await MP.enviar('iniciar');
      if(r.erro) UI.toast(erroTxt(r.erro));
    },
    async planejar(valor){
      const p = MP.sala && MP.sala.partida; if(!p) return;
      const r = await MP.enviar('acao', { rodada: p.rodada, tipo: 'planejar', dados: { valor } });
      if(r.erro) UI.toast(erroTxt(r.erro));
    },
    /* um clique só vale até a resposta chegar; um "pronto" que chega depois de a rodada
       passar não precisa de aviso: a tela já mostra a rodada nova */
    async pronto(sim){
      const p = MP.sala && MP.sala.partida; if(!p || MP._prontoNoAr) return;
      MP._prontoNoAr = true;
      const r = await MP.enviar('pronto', { rodada: p.rodada, pronto: !!sim });
      MP._prontoNoAr = false;
      if(r.erro && r.erro !== 'rodada') UI.toast(erroTxt(r.erro));
    },
    voltarAoGerenciamento(){ MP._verResultado = false; MP.abrir(); },

    /* ── o modo chefe com um amigo ──
       A equipe na tela (C) é a cópia que o servidor mandou. As telas do jogo funcionam como
       sempre; cada decisão vira uma ação (UIC.mp, no index.html), e a resposta só aparece
       depois que a equipe atualizada chega. Nada disso toca no save do modo chefe. */
    /* só vale enquanto a equipe na tela é a cópia do servidor: começar uma carreira solo desliga sozinho */
    chefeAtivo(){ return !!MP._chefe && typeof C !== 'undefined' && !!C && C === MP._C && !!(MP.sala && MP.sala.partida && MP.sala.partida.regras === 'chefe'); },
    entrarChefe(){
      if(!MP.vista || !MP.vista.C) return MP.abrirPartida();
      MP._chefe = true;
      C = MP._C = MP.vista.C;
      UIC._M = null; UIC.pag = 'visao';
      UI.limparFila(); UI.close(); UI.show('chefe'); UIC.render();
      MP.barra();
      MP.verCorrida();
    },
    sairDoChefe(){
      MP._chefe = false; MP._aposVista = null; MP._rodadaNova = null;
      C = null;
      const b = el('mpBarra'); if(b) b.remove();
      document.body.classList.remove('mp-com-barra');
      UI.limparFila(); UI.close(); UI.show('intro'); Game.checkSave(); MP.desenhar();
    },
    /* a equipe atualizada chegou: troca a cópia, redesenha e mostra o que estava esperando */
    aplicarChefe(){
      if(!MP.chefeAtivo()) return;
      C = MP._C = MP.vista.C;
      UIC.render();
      MP.barra();
      const depois = MP._aposVista, nova = MP._rodadaNova;
      MP._aposVista = null; MP._rodadaNova = null;
      if(depois){ try { depois(); } catch(e){ console.error(e); } }
      if(nova) MP.rodadaDepoisDaCorrida(nova, () => MP.mostrarRodada(nova));
    },
    /* a rodada processada, pelas telas do jogo: o resultado da corrida, os testes de
       pré-temporada ou o inverno do ano novo */
    mostrarRodada(r){
      UI.limparFila(); UI.close();
      const sea = C.temporada;
      if(r.tipo === 'corrida' && sea && sea.results && sea.results.length) return UI.depois(() => UIC.resultado(sea.results[sea.results.length - 1]), 150);
      if(r.tipo === 'inicio') return UI.depois(() => UIC.preTemporada(), 150);
      if(r.tipo === 'anoNovo') return UI.depois(() => UIC.inverno(), 150);
    },
    chefeAcao(tipo, dados, depois){
      const p = MP.sala && MP.sala.partida; if(!p) return;
      MP.enviar('acao', { rodada: p.rodada, tipo, dados }).then(r => {
        if(r.erro) return UI.toast(erroTxt(r.erro));
        MP._aposVista = () => { if(depois) depois(r.resultado || {}); };
      });
    },
    async chefePronto(){
      const p = MP.sala && MP.sala.partida; if(!p || MP._prontoNoAr) return;
      MP._prontoNoAr = true;
      const r = await MP.enviar('pronto', { rodada: p.rodada, pronto: true });
      MP._prontoNoAr = false;
      if(!r.erro || r.erro === 'rodada') return;
      if(r.erro === 'pendencias' && Array.isArray(r.detalhe) && r.detalhe.length) return UI.toast('Falta ' + r.detalhe.join(' e ') + '.');
      if(r.erro === 'evento'){ UI.toast('Decida o acontecimento antes de ficar pronto.'); return UIC.evento(); }
      UI.toast(erroTxt(r.erro));
    },
    async configurar(c){ const r = await MP.enviar('configurar', { config: c }); if(r.erro) UI.toast(erroTxt(r.erro)); },
    async escolherEquipe(idx){ const r = await MP.enviar('escolherEquipe', { idx }); if(r.erro) UI.toast(erroTxt(r.erro)); },
    /* a barra da partida dentro da tela do chefe: rodada, quem está pronto e o botão */
    barra(){
      if(!MP._chefe && !MP._piloto) return;
      const s = MP.sala, p = s && s.partida; if(!p) return;
      let b = el('mpBarra');
      if(!b){ b = document.createElement('div'); b.id = 'mpBarra'; b.className = 'mp mp-barra'; document.body.appendChild(b); document.body.classList.add('mp-com-barra'); }
      const eu = MP.voce ? MP.voce.slot : (ler() || {}).slot;
      const pronto = slot => !!(p.prontos && p.prontos[slot]);
      const outros = s.jogadores.filter(j => j.slot !== eu);
      const souPronto = pronto(eu), outrosProntos = outros.every(j => pronto(j.slot)), proc = p.estado === 'processing' || p.estado === 'corrida';
      const piloto = p.regras === 'piloto';
      /* o anfitrião pode avançar sem esperar quem ainda está decidindo (ou levar a corrida até o fim) */
      const fora = (p.fora || []).map(String);
      const esperando = outros.some(j => !pronto(j.slot) && !fora.includes(String(j.slot)));
      const podeForcar = s.anfitriao === eu && MP.con === 'conectado' && (p.estado === 'corrida' ? !!(MP.cor && !MP.cor.fim) : !proc && esperando);
      const armado = podeForcar && MP._forcarArmado && Date.now() - MP._forcarArmado < 6000;
      const auto = (p.auto || []).map(String), simulo = auto.includes(String(eu));
      const fase = { inverno: 'pré-temporada', temporada: 'temporada', balanco: 'balanço do ano', mercado: 'propostas' }[MP.vista && MP.vista.fase] || '';
      const sea = piloto ? (typeof S !== 'undefined' && S && S.season) : (typeof C !== 'undefined' && C && C.temporada);
      const prox = MP.vista && MP.vista.fase === 'temporada' && sea && sea.calendar[sea.round];
      const voltas = p.estado === 'corrida' && MP.cor ? Object.values(MP.cor.corridas).filter(c => c.N)
        .map(c => `<span data-i18n-ignore>${esc(c.serie || '')}</span> <span>volta</span> ${Math.min(c.volta || 1, c.N)}/${c.N}`).join(' · ') : '';
      const estado = simulo && p.estado !== 'corrida' ? 'Simulando até o fim da temporada.'
        : p.estado === 'corrida' ? `<span>Corrida ao vivo</span>${voltas ? ': ' + voltas : ''}`
        : proc ? 'Processando a rodada…' : souPronto && !outrosProntos ? (outros.length > 1 ? 'Aguardando os outros jogadores…' : 'Aguardando o adversário…')
        : !souPronto && outrosProntos ? (outros.length > 1 ? 'Os outros já estão prontos.' : 'O adversário já está pronto.') : 'Tome as suas decisões no seu ritmo.';
      b.innerHTML = `<span class="mp-b-t"><b>Multiplayer</b> · <span>Rodada</span> ${p.rodada}${fase ? ` · <span>${fase}</span>` : ''}${prox ? ` · <span>GP ${esc(prox.gp)}</span>` : ''}</span>
        <span class="mp-b-e" role="status">${estado}</span>
        <span class="mp-b-j">${outros.map(j => `<span class="mp-dot${j.conectado ? ' on' : ''}" aria-hidden="true"></span> <span data-i18n-ignore>${esc(j.nome)}</span>: <span>${auto.includes(String(j.slot)) ? 'simulando' : pronto(j.slot) ? 'pronto' : (p.fora || []).map(String).includes(String(j.slot)) ? 'carreira encerrada' : 'decidindo'}</span>`).join(' ')}</span>
        ${simulo ? `<button class="btn btn-ghost btn-sm" onclick="MP.simularAno(false)">Parar a simulação</button>`
          : souPronto ? `<button class="btn btn-ghost btn-sm" onclick="MP.pronto(false)"${proc ? ' disabled' : ''}>Cancelar prontidão</button>`
                    : `<button class="btn btn-primary btn-sm" onclick="${piloto ? 'MP.pilotoPronto()' : 'MP.chefePronto()'}"${proc || MP.con !== 'conectado' ? ' disabled' : ''}>Pronto para avançar</button>`}
        ${p.estado === 'corrida' && MP.cor && MP.cor.minha && !MP.cor.aberta ? '<button class="btn btn-gold btn-sm" onclick="MP.verCorrida()">Ver a corrida</button>' : ''}
        ${podeForcar ? `<button class="btn btn-sm mp-forcar${armado ? ' mp-armado' : ''}" onclick="MP.forcar()"${MP._forcarNoAr ? ' disabled' : ''}>${armado ? 'Confirmar: avançar agora' : p.estado === 'corrida' ? 'Forçar o fim da corrida' : 'Forçar avanço'}</button>` : ''}
        <button class="btn btn-ghost btn-sm" onclick="MP.abrirPartida()">Sala</button>`;
    },
    /* "Simular o resto do ano": as rodadas deste jogador ficam prontas sozinhas até o fim da temporada */
    simularAno(ligar, certeza){
      if(ligar && !certeza) return UI.modal(UI.head('Simular o resto do ano?', 'As suas rodadas ficam prontas sozinhas até o fim da temporada') +
        `<div class="mbd"><p class="mut" style="margin:0">Os acontecimentos do caminho ficam sem a sua decisão, e você não assiste às corridas: os seus carros ficam com a equipe. A sala anda quando os outros também confirmarem. Dá para parar a qualquer momento na barra de baixo.</p></div>
        <div class="mft"><button class="btn btn-ghost" onclick="UI.close()">Voltar</button><span class="sp"></span><button class="btn btn-primary" onclick="UI.close(); MP.simularAno(true, true)">Simular</button></div>`);
      MP.enviar('simular', { ligado: !!ligar }).then(r => {
        if(r.erro) return UI.toast(erroTxt(r.erro));
        UI.toast(ligar ? 'Simulando até o fim da temporada.' : 'Simulação parada: as decisões voltam a ser suas.');
      });
    },
    /* "Forçar avanço" (só o anfitrião): o primeiro toque arma, o segundo (em até 6 s) manda.
       O servidor dá a escolha padrão a quem não confirmou; o que não tem padrão volta como aviso. */
    async forcar(){
      const p = MP.sala && MP.sala.partida; if(!p || MP._forcarNoAr) return;
      if(!MP._forcarArmado || Date.now() - MP._forcarArmado >= 6000){
        MP._forcarArmado = Date.now(); MP.barra();
        UI.toast(p.estado === 'corrida' ? 'Toque de novo para levar a corrida até o fim para todos.'
                                         : 'Toque de novo para avançar agora. Quem não confirmou fica com a escolha padrão.');
        setTimeout(() => { if(MP._forcarArmado && Date.now() - MP._forcarArmado >= 6000){ MP._forcarArmado = 0; MP.barra(); } }, 6100);
        return;
      }
      MP._forcarArmado = 0; MP._forcarNoAr = true; MP.barra();
      const r = await MP.enviar('forcar', { rodada: p.rodada });
      MP._forcarNoAr = false; MP.barra();
      if(!r.erro || r.erro === 'rodada') return;
      if(r.erro === 'forcar' && Array.isArray(r.detalhe) && r.detalhe.length)
        return UI.toast(r.detalhe.map(b => b.nome + ': ' + (b.erro === 'pendencias' && Array.isArray(b.detalhe) && b.detalhe.length ? 'falta ' + b.detalhe.join(' e ') : erroTxt(b.erro))).join(' · '));
      UI.toast(erroTxt(r.erro));
    },

    /* ── a corrida ao vivo (Fase 5) ──
       O servidor roda a corrida oficial; esta tela roda a mesma corrida (a entrada e as ordens que
       ele manda, no passo em que valem) e só anda até o passo que ele liberou. As ordens daqui vão
       para ele e voltam pelo registro, com o passo. A soma de conferência dele confere a desta tela;
       se elas não baterem, a tela refaz a corrida com o registro inteiro. */
    meuSlot(){ return MP.voce ? MP.voce.slot : (ler() || {}).slot; },
    corridaInicio(m){
      const eu = MP.meuSlot();
      if(!MP.cor || MP.cor.rodada !== m.rodada) MP.cor = { rodada: m.rodada, corridas: {}, aberta: false, tela: null, refeitas: 0 };
      MP.cor.vel = m.vel;
      (m.corridas || []).forEach(c => { MP.cor.corridas[c.k] = c; });
      const minha = (m.corridas || []).find(c => Object.values(c.donos).some(d => ehDono(d, eu)));
      MP.cor.minha = minha ? minha.k : null;
      MP.barra();
      if(!minha) return;
      const t = MP.cor.tela;
      /* a mesma corrida já na tela (o servidor mandou de novo depois de uma queda): só junta o que faltava */
      if(t && t.k === minha.k && MP.cor.aberta && !t.refazer){
        minha.log.forEach(e => MP.corridaEntrada(t, e));
        t.liberado = Math.max(t.liberado, minha.liberado);
        return MP.corridaFase(t, minha);
      }
      if(MP._piloto || MP._chefe) MP.abrirCorrida(minha);
      else UI.toast('A corrida ao vivo começou: abra a sala do multiplayer.');
    },
    /* volta para a corrida que está na pista (a sala manda tudo de novo); false se não há corrida */
    verCorrida(){
      const p = MP.sala && MP.sala.partida;
      if(!p || p.estado !== 'corrida' || (MP.cor && MP.cor.aberta)) return false;
      if(MP.cor) MP.cor.tela = null;
      MP.enviar('corridaSync');
      return true;
    },
    abrirCorrida(c){
      const eu = MP.meuSlot();
      /* piloto: antes da largada, o resultado da classificação (o grid da corrida e o que a janela rendeu) */
      if(!c.chefe && c.fase === 'largada' && MP.cor.qualiVisto !== c.k && typeof S !== 'undefined' && S && S.season){
        MP.cor.qualiVisto = c.k;
        const carros = c.ent.carros.slice().sort((a, b) => a.grid - b.grid);
        const meus = new Set(Object.keys(c.donos).filter(i => ehDono(c.donos[i], eu)).map(i => c.ent.carros[i].id));
        const pos = carros.findIndex(x => meus.has(x.id)) + 1, sea = S.season, j = sea.fds && sea.fds.rd === sea.round && sea.fds.mpJanela;
        UI.limparFila(); UI.close();
        UI.qualiResultado({ minha: pos || null, foraMe: null, fmt: Engine.formatoQuali(sea.year, S.series, sea.round),
          notas: j ? j.notas.map(k => Engine.NOTA_JANELA_EU[k]).filter(Boolean) : [],
          ordem: carros.map(x => ({ id: x.id, name: x.nome, cc: x.cc, me: meus.has(x.id) })) });
        /* "Domingo": a corrida, com o que o servidor tem agora (o outro pode já ter largado) */
        const b = [...document.querySelectorAll('.modal .btn-primary')].pop();
        if(b) b.onclick = () => { UI.close(); MP.enviar('corridaSync'); };
        return;
      }
      const t = MP.cor.tela = { k: c.k, R: Gp.criar(JSON.parse(JSON.stringify(c.ent))), passo: 0, fila: [], vistos: new Set(),
        liberado: c.liberado, fase: c.fase, somas: {}, somasServ: {}, donos: c.donos,
        meus: new Set(Object.keys(c.donos).filter(i => ehDono(c.donos[i], eu)).map(Number)),
        largadaEnviada: (c.largadas || []).map(String).includes(String(eu)), pediuPular: (c.votos || []).map(String).includes(String(eu)) };
      c.log.forEach(e => MP.corridaEntrada(t, e));
      /* quem chega no meio da corrida alcança o servidor de uma vez */
      MP.corridaAndar(t, c.passo);
      MP.cor.aberta = true;
      UI.limparFila(); UI.close();
      AoVivo.abrir(c.ent, { serie: c.serie, chefe: c.chefe, R: t.R, mp: MP.adaptador(t) }, () => MP.corridaFechou());
      MP.barra();
    },
    corridaEntrada(t, e){
      if(!e || t.vistos.has(e.n)) return;
      t.vistos.add(e.n);
      /* uma ordem para um passo que esta tela já passou não deveria existir: refaz com o registro */
      if(e.passo < t.passo){ t.refazer = true; MP.enviar('corridaSync'); return; }
      t.fila.push(e);
    },
    /* as ordens do passo em que a corrida está, na ordem em que o servidor registrou */
    corridaPendentes(t){
      if(!t.fila.length) return;
      const R = t.R, agora = t.fila.filter(e => e.passo <= t.passo).sort((a, b) => a.n - b.n);
      if(!agora.length) return;
      t.fila = t.fila.filter(e => e.passo > t.passo);
      const tinha = !!R.pergunta;
      for(const e of agora){
        const d = e.dados || {};
        if(e.tipo === 'comandar') Gp.comandar(R, d.i, d.cmd);
        else if(e.tipo === 'responder') Gp.responder(R, d.k);
        else if(e.tipo === 'largar') Gp.largar(R, d.reac, !!d.queimou, d.so);
        else if(e.tipo === 'terminar') Gp.terminar(R);
      }
      if(((tinha && !R.pergunta) || R.fim) && AoVivo.R === R){
        const box = el('avRadio'); if(box && AoVivo._perguntando){ box.hidden = true; box.innerHTML = ''; box.onclick = null; }
        AoVivo._perguntando = false;
        if(R.fim) AoVivo._largada = false;
      }
    },
    corridaDepois(t){
      t.passo++;
      if(t.passo % 64 === 0){
        t.somas[t.passo] = somaCorrida(t.R);
        delete t.somas[t.passo - 64 * 40];
        MP.corridaConferir(t, t.passo);
      }
    },
    corridaAndar(t, ate){
      const R = t.R; let g = 0;
      MP.corridaPendentes(t);
      while(t.passo < Math.min(ate, t.liberado) && !R.fim && g++ < 400000){
        MP.corridaPendentes(t);
        if(R.fim || R.pergunta) break;
        Gp.passo(R); MP.corridaDepois(t);
      }
    },
    corridaConferir(t, p){
      const a = t.somas[p], b = t.somasServ[p];
      if(a === undefined || b === undefined) return;
      delete t.somas[p]; delete t.somasServ[p];
      if(a === b) return;
      console.warn('[multiplayer] a corrida desta tela se afastou da oficial no passo ' + p);
      if(MP.cor.refeitas < 2){ MP.cor.refeitas++; t.refazer = true; MP.enviar('corridaSync'); }
      else if(!MP.cor.avisou){ MP.cor.avisou = true; UI.toast('A sua tela se afastou da corrida oficial. O resultado que vale é o do servidor.'); }
    },
    corridaLog(m){ const t = MP.cor && MP.cor.tela; if(t && t.k === m.k) MP.corridaEntrada(t, m.e); },
    corridaSoma(m){ const t = MP.cor && MP.cor.tela; if(!t || t.k !== m.k) return; t.somasServ[m.passo] = m.soma; MP.corridaConferir(t, m.passo); },
    corridaEstado(m){
      if(!MP.cor) return;
      MP.cor.vel = m.vel;
      (m.corridas || []).forEach(c => { MP.cor.corridas[c.k] = Object.assign(MP.cor.corridas[c.k] || {}, c); });
      const t = MP.cor.tela, c = t && (m.corridas || []).find(x => x.k === t.k);
      if(c){ t.liberado = Math.max(t.liberado, c.liberado); MP.corridaFase(t, c); }
      const ov = el('aovivo');
      if(ov && MP.cor.aberta) ov.querySelectorAll('.av-vel [data-v]').forEach(b => b.classList.toggle('on', +b.dataset.v === m.vel));
      /* a barra de quem não está na pista mostra a volta (uma vez por segundo basta) */
      const agora = Date.now();
      if(!MP.cor.aberta && agora - (MP._barraEm || 0) > 1000){ MP._barraEm = agora; MP.barra(); }
    },
    corridaFase(t, c){
      const antes = t.fase; t.fase = c.fase;
      if(antes === 'largada' && c.fase !== 'largada' && AoVivo.R === t.R){
        AoVivo._largada = false;
        if(t.aoLargar){ const f = t.aoLargar; t.aoLargar = null; f(); }
        /* as luzes ainda na tela (o prazo da largada acabou): fecham como a largada automática */
        else if(el('avLuzes')){ const b = el('avLargAuto'); if(b && b.onclick) b.onclick(); }
      }
      const pb = el('avPular');
      if(pb && c.votos) pb.classList.toggle('on', c.votos.map(String).includes(String(MP.meuSlot())));
    },
    /* a tela da corrida fechou ("Ver o resultado"): o resultado da rodada, se já chegou */
    corridaFechou(){
      if(!MP.cor) return;
      MP.cor.aberta = false; MP.cor.tela = null;
      const nova = MP.cor.rodadaPendente;
      if(nova){ const f = MP.cor.mostrar; MP.cor = null; return f(); }
      MP.barra();
      UI.toast('A rodada fecha quando todas as corridas da sala acabarem.');
    },
    rodadaDepoisDaCorrida(nova, mostrar){
      if(MP.cor && MP.cor.aberta){ MP.cor.rodadaPendente = nova; MP.cor.mostrar = mostrar; return; }
      MP.cor = null;
      mostrar();
    },
    /* o que a tela da corrida (AoVivo) pede: os carros desta tela, o relógio e as ordens */
    adaptador(t){
      return {
        meus: t.meus,
        quadro(){ MP.corridaPendentes(t); },
        limitar(alvo){
          /* o lugar certo é um pouco antes do liberado: a próxima marca do servidor chega antes de a tela parar */
          const lib = t.liberado * Gp.DT, vel = (MP.cor && MP.cor.vel) || 8, ideal = lib - vel * .4;
          if(ideal - alvo > vel * 3) alvo = ideal;                       // muito atrás (aba escondida, rede): pula
          else if(ideal - alvo > vel * .3) alvo += (ideal - alvo) * .04;  // um pouco atrás: alcança aos poucos
          return Math.min(alvo, lib);
        },
        antes(R){ MP.corridaPendentes(t); return !R.fim && !R.pergunta && t.passo < t.liberado; },
        depois(){ MP.corridaDepois(t); },
        vel(){ return (MP.cor && MP.cor.vel) || 8; },
        velocidade(v){ MP.enviar('velocidade', { v }).then(r => { if(r.erro) UI.toast(erroTxt(r.erro)); }); },
        comandar(R, i, cmd){
          if(!t.meus.has(i)) return;
          if(cmd.ceder != null){ const j = Gp.podeCeder(R, i); if(!j || j.i !== cmd.ceder) return 'longe'; }
          MP.ordemCorrida(t, 'comandar', { i, cmd });
        },
        responder(R, k){ MP.ordemCorrida(t, 'responder', { k }); },
        pular(){
          if(MP.sala && MP.sala.anfitriao === MP.meuSlot()){
            MP.ordemCorrida(t, 'pular', { quer: true, forcar: true });
            return UI.toast('Você é o anfitrião: a corrida vai até o fim para todos.');
          }
          t.pediuPular = !t.pediuPular;
          MP.ordemCorrida(t, 'pular', { quer: t.pediuPular });
          UI.toast(t.pediuPular ? 'Você pediu para pular até o fim. A corrida pula quando todos pedirem.' : 'Pedido para pular cancelado.');
        },
        largar(d){ if(t.fase !== 'largada' || t.largadaEnviada) return; t.largadaEnviada = true; MP.ordemCorrida(t, 'largada', d); },
        esperandoLargada(){ return t.fase === 'largada'; },
        mostrarLuzes(){ return t.fase === 'largada' && !t.largadaEnviada && t.meus.size > 0; },
        aguardarLargada(sair, tx){
          if(t.fase !== 'largada') return sair();
          t.aoLargar = sair;
          if(tx){ tx.className = 'av-luzes-tx'; tx.textContent = 'Esperando a largada dos outros jogadores…'; }
        }
      };
    },
    ordemCorrida(t, tipo, dados){
      MP.enviar('corrida', { k: t.k, tipo, dados }).then(r => { if(r.erro && r.erro !== 'fim') UI.toast(erroTxt(r.erro)); });
    },
    /* ── o modo piloto com um amigo ── (o mesmo esquema do chefe, com a carreira S) */
    pilotoAtivo(){ return !!MP._piloto && typeof S !== 'undefined' && !!S && S === MP._S && !!(MP.sala && MP.sala.partida && MP.sala.partida.regras === 'piloto'); },
    entrarPiloto(){
      if(!MP.vista || !MP.vista.S) return MP.abrirPartida();
      MP._piloto = true;
      S = MP._S = MP.vista.S;
      UI.limparFila(); UI.close(); UI.show('career'); UI.render();
      MP.barra();
      if(!MP.verCorrida()) MP.inverno();
    },
    /* a pré-temporada (o servidor já resolveu, como no modo rápido) explica uma lesão ou uma moral
       baixa antes da primeira corrida: o resumo aparece uma vez por ano em cada aparelho */
    inverno(){
      const chave = (MP.sala && MP.sala.codigo) + ':' + S.year;
      if(!S.invernoNotas || S.invernoAno !== S.year || MP._invernoVisto === chave) return;
      MP._invernoVisto = chave;
      UI.invernoResumo();
    },
    sairDoPiloto(){
      MP._piloto = false; MP._aposVista = null; MP._rodadaNova = null;
      S = null; MP._S = null;
      const b = el('mpBarra'); if(b) b.remove();
      document.body.classList.remove('mp-com-barra');
      UI.limparFila(); UI.close(); UI.show('intro'); Game.checkSave(); MP.desenhar();
    },
    aplicarPiloto(){
      if(!MP.pilotoAtivo()) return;
      S = MP._S = MP.vista.S;
      UI.render();
      MP.barra();
      const depois = MP._aposVista, nova = MP._rodadaNova;
      MP._aposVista = null; MP._rodadaNova = null;
      if(depois){ try { depois(); } catch(e){ console.error(e); } }
      if(nova) MP.rodadaDepoisDaCorrida(nova, () => MP.mostrarRodadaPiloto(nova));
    },
    /* a rodada processada: a sua corrida, pela tela de resultado do jogo (quem não correu fica sabendo) */
    mostrarRodadaPiloto(r){
      UI.limparFila(); UI.close();
      const eu = MP.voce ? MP.voce.slot : (ler() || {}).slot;
      if(r.tipo === 'corridas'){
        const minha = (r.etapas || []).some(e => String(e.slot) === String(eu));
        const res = S.season && S.season.results;
        if(minha && res && res.length) return UI.depois(() => UI.raceResult(res[res.length - 1]), 150);
        UI.toast(r.fimAno ? 'O ano acabou: veja o balanço e as propostas.' : 'Sem corrida na sua categoria nesta rodada.');
        if(r.fimAno) UI.depois(() => Game.endSeason(), 150);
        return;
      }
      if(r.tipo === 'anoNovo'){ UI.toast('A nova temporada começa.'); MP.inverno(); }
    },
    pilotoAcao(tipo, dados, depois){
      const p = MP.sala && MP.sala.partida; if(!p) return;
      MP.enviar('acao', { rodada: p.rodada, tipo, dados }).then(r => {
        if(r.erro) return UI.toast(erroTxt(r.erro));
        const avisos = (r.resultado && r.resultado.avisos) || [];
        MP._aposVista = () => { if(depois) depois(r.resultado || {}); if(avisos.length) UI.toast(avisos[avisos.length - 1]); };
      });
    },
    async pilotoPronto(){
      const p = MP.sala && MP.sala.partida; if(!p || MP._prontoNoAr) return;
      MP._prontoNoAr = true;
      const r = await MP.enviar('pronto', { rodada: p.rodada, pronto: true });
      MP._prontoNoAr = false;
      if(!r.erro || r.erro === 'rodada') return;
      if(r.erro === 'academia'){ UI.toast('Responda à academia antes de seguir.'); return Game.afterSeason(S.lastSum || Engine.summary(S.season)); }
      if(r.erro === 'proposta'){ UI.toast('Escolha uma proposta antes de seguir.'); return Game.showOffers(S.lastSum); }
      UI.toast(erroTxt(r.erro));
    },
    async escolherPiloto(){
      const v = id => (el(id) || {}).value || '';
      const piloto = { nome: v('mpPNome').trim(), cc: v('mpPPais').trim().toUpperCase(), idade: +v('mpPIdade'), estilo: v('mpPEstilo') };
      const r = await MP.enviar('escolherPiloto', { piloto });
      UI.toast(r.erro ? erroTxt(r.erro) : 'Piloto salvo.');
    },
    /* no lobby de uma sala de piloto: o ano e a série (do anfitrião) e o piloto de cada um */
    configPiloto(s, souAnf, eu){
      const cfg = s.config || {}, serie = cfg.serie || 'f1', ano = cfg.ano || 2024, meu = (cfg.pilotos || {})[eu] || {};
      /* as 7 séries do jogo, com o nome que o jogo usa */
      const series = {}; (typeof SERIES_KEYS !== 'undefined' ? SERIES_KEYS : ['f1', 'indy']).forEach(k => { series[k] = SERIES[k] ? SERIES[k].name : k; });
      const ligado = MP.con === 'conectado' ? '' : ' disabled';
      const estilos = typeof STYLES !== 'undefined' ? Object.keys(STYLES) : ['equilibrado'];
      const outros = s.jogadores.filter(j => j.slot !== eu).map(j => ({ j, p: (cfg.pilotos || {})[j.slot] }));
      return `<span class="lbl">Campeonato</span>
        <div class="sv-item"><div class="sv-tx"><span class="sv-modo">Série e ano</span>
          ${souAnf ? `<div class="mp-vels">${Object.keys(series).map(k => `<button class="btn btn-sm ${k === serie ? 'btn-primary' : 'btn-ghost'}" onclick="MP.configurar({ serie: '${k}' })"${ligado}>${series[k]}</button>`).join('')}
              <input type="number" id="mpAno" min="1950" max="2026" value="${ano}" aria-label="Ano"> <button class="btn btn-ghost btn-sm" onclick="MP.configurar({ ano: +el('mpAno').value })"${ligado}>Mudar o ano</button></div>`
                   : `<b>${series[serie] || esc(serie)} ${ano}</b>`}</div></div>
        <span class="lbl">Seu piloto</span>
        <p class="mut mp-ajuda">Quem tem a mesma idade começa na mesma categoria e divide as corridas. Com idades diferentes, cada um começa na sua.</p>
        <div class="mp-form">
          <div class="field"><label class="lbl" for="mpPNome">Nome</label><input type="text" id="mpPNome" maxlength="24" value="${esc(meu.nome || '')}" data-i18n-ignore></div>
          <div class="field"><label class="lbl" for="mpPPais">País (sigla)</label><input type="text" id="mpPPais" maxlength="2" value="${esc(meu.cc || 'BR')}" data-i18n-ignore></div>
          <div class="field"><label class="lbl" for="mpPIdade">Idade</label><input type="number" id="mpPIdade" min="14" max="30" value="${meu.idade || 17}"></div>
          <div class="field"><label class="lbl" for="mpPEstilo">Estilo</label><select id="mpPEstilo">${estilos.map(k => `<option value="${esc(k)}"${k === (meu.estilo || 'equilibrado') ? ' selected' : ''}>${esc(typeof STYLES !== 'undefined' && STYLES[k] && STYLES[k].nome ? STYLES[k].nome : k)}</option>`).join('')}</select></div>
        </div>
        <button class="btn btn-contorno btn-sm" onclick="MP.escolherPiloto()"${ligado}>Salvar meu piloto</button>
        ${outros.map(({ j, p }) => `<p class="mut mp-ajuda"><span data-i18n-ignore>${esc(j.nome)}</span>: ${p ? `<span data-i18n-ignore>${esc(p.nome)}</span>, ${p.idade} <span>anos</span>` : '<span>ainda escolhendo o piloto</span>'}</p>`).join('')}`;
    },
    /* no lobby de uma sala de chefe: o campeonato (do anfitrião) e a equipe de cada um */
    configChefe(s, souAnf, eu){
      const cfg = s.config || {}, sk = cfg.sk || 'f1', ano = cfg.ano || 2024, escolhas = cfg.equipes || {};
      let lista = [];
      try { lista = eraOfSeries(ano, sk).teams.map((t, i) => [i, Engine.resolveTeam(t, i, ano, sk)]).filter(x => x[1]).sort((a, b) => b[1].str - a[1].str); } catch(e){}
      const donos = i => s.jogadores.filter(j => escolhas[j.slot] === i);
      /* as 7 séries do jogo, com o nome que o jogo usa */
      const series = {}; (typeof SERIES_KEYS !== 'undefined' ? SERIES_KEYS : ['f1', 'indy']).forEach(k => { series[k] = SERIES[k] ? SERIES[k].name : k; });
      const ligado = MP.con === 'conectado' ? '' : ' disabled';
      return `<span class="lbl">Campeonato</span>
        <div class="sv-item"><div class="sv-tx"><span class="sv-modo">Série e ano</span>
          ${souAnf ? `<div class="mp-vels">${Object.keys(series).map(k => `<button class="btn btn-sm ${k === sk ? 'btn-primary' : 'btn-ghost'}" onclick="MP.configurar({ sk: '${k}' })"${ligado}>${series[k]}</button>`).join('')}
              <input type="number" id="mpAno" min="1950" max="2026" value="${ano}" aria-label="Ano"> <button class="btn btn-ghost btn-sm" onclick="MP.configurar({ ano: +el('mpAno').value })"${ligado}>Mudar o ano</button></div>`
                   : `<b>${series[sk] || esc(sk)} ${ano}</b>`}</div></div>
        <span class="lbl">Equipes</span>
        <p class="mut mp-ajuda">Cada um escolhe uma equipe real ou funda a sua. Quem escolher a mesma divide ela, e todos mandam em tudo. As outras equipes do grid ficam com a inteligência do jogo.</p>
        ${MP.formFundar(s, eu, ligado)}
        <div class="mp-eqs">${Object.entries(cfg.fundadas || {}).map(([k, f]) => { const v = 'n' + k, d = s.jogadores.filter(j => escolhas[j.slot] === v), minha = d.some(j => j.slot === eu);
          return `<button class="sv-item mp-jog mp-eq${minha ? ' mp-sel' : ''}" onclick="MP.escolherEquipe('${v}')"${minha || MP.con !== 'conectado' ? ' disabled' : ''}>
            <span class="mp-cor" style="background:${esc(f.cor)}" aria-hidden="true"></span>
            <span class="sv-tx"><b data-i18n-ignore>${esc(f.nome)}</b><span class="sv-desc"><span>fundada</span>${f.base ? ` · <span data-i18n-ignore>${esc(f.base)}</span>` : ''}${d.length ? ` · <span data-i18n-ignore>${d.map(j => esc(j.nome)).join(', ')}</span>` : ''}</span></span></button>`; }).join('')}${lista.map(([i, t]) => { const d = donos(i), minha = d.some(j => j.slot === eu);
          return `<button class="sv-item mp-jog mp-eq${minha ? ' mp-sel' : ''}" onclick="MP.escolherEquipe(${i})"${minha || MP.con !== 'conectado' ? ' disabled' : ''}>
            <span class="mp-cor" style="background:${esc(t.color || '#888')}" aria-hidden="true"></span>
            <span class="sv-tx"><b data-i18n-ignore>${esc(t.name)}</b>${d.length ? `<span class="sv-desc" data-i18n-ignore>${d.map(j => esc(j.nome)).join(', ')}</span>` : ''}</span></button>`; }).join('')}</div>`;
    },
    /* "Fundar uma equipe", como no jogo: nome, país, cor e de onde vem o dinheiro (o rascunho fica em MP._fundar
       para sobreviver aos redesenhos da sala) */
    formFundar(s, eu, ligado){
      const fundadas = (s.config && s.config.fundadas) || {};
      if(fundadas[eu]) return '';
      if(!MP._fundarAberto) return `<div class="mp-vels"><button class="btn btn-contorno btn-sm" onclick="MP._fundarAberto=true;MP.abrir()"${ligado}>Fundar uma equipe</button></div>`;
      const cores = (typeof UIC !== 'undefined' && UIC.CORES) || ['#e8112d'], fins = (typeof Chefe !== 'undefined' && Chefe.FIN) || {};
      const F = MP._fundar || (MP._fundar = { nome: '', cc: 'BR', cor: cores[0], fin: 'investidor', base: null });
      const cfg = s.config || {};
      /* onde começa: na categoria principal ou numa de acesso (a escada depende do país, como no jogo) */
      let escada = [];
      try { escada = Chefe.escadaBase(cfg.ano || 2024, F.cc, cfg.sk || 'f1'); } catch(e){}
      if(F.base && !escada.includes(F.base)) F.base = null;
      return `<div class="sv-item mp-fundar"><div class="sv-tx">
          <span class="sv-modo">Fundar uma equipe</span>
          <span class="sv-desc">O carro é o pior do grid e ninguém quer correr por você. Ainda. Os pilotos você contrata no inverno.</span>
          <div class="mp-form">
            <div class="field"><label class="lbl" for="mpFNome">Nome da equipe</label><input type="text" id="mpFNome" maxlength="22" value="${esc(F.nome)}" oninput="MP._fundar.nome=this.value" autocomplete="off" data-i18n-ignore></div>
            <div class="field"><label class="lbl" for="mpFPais">País</label><select id="mpFPais" onchange="MP._fundar.cc=this.value;MP.abrir()">${COUNTRIES.map(c => `<option value="${c.cc}"${c.cc === F.cc ? ' selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
          </div>
          <span class="lbl">Cor</span>
          <div class="ch-cores">${cores.map(c => `<button class="ch-cor${F.cor === c ? ' sel' : ''}" style="background:${c}" onclick="MP._fundar.cor='${c}';MP.abrir()" aria-label="Cor ${c}" aria-pressed="${F.cor === c}"></button>`).join('')}</div>
          <span class="lbl">Onde a equipe começa</span>
          <div class="mp-vels"><button class="btn btn-sm ${!F.base ? 'btn-primary' : 'btn-ghost'}" onclick="MP._fundar.base=null;MP.abrir()">Na categoria principal</button>${escada.map(c => `<button class="btn btn-sm ${F.base === c ? 'btn-primary' : 'btn-ghost'}" onclick="MP._fundar.base='${esc(c).replace(/'/g, "\\'")}';MP.abrir()" data-i18n-ignore>${esc(c)}</button>`).join('')}</div>
          <span class="sv-desc">${F.base ? 'Começar na base: pilotos que pagam para correr, orçamento curto e a categoria principal lá em cima. Cada categoria com equipe da sala tem o seu campeonato.' : 'Fundar na categoria principal: o carro é o pior do grid.'}</span>
          <span class="lbl">De onde vem o dinheiro</span>
          <div class="mp-vels">${Object.keys(fins).map(k => `<button class="btn btn-sm ${F.fin === k ? 'btn-primary' : 'btn-ghost'}" onclick="MP._fundar.fin='${k}';MP.abrir()" title="${esc(fins[k].d)}">${esc(fins[k].n)}</button>`).join('')}</div>
          <span class="sv-desc">${esc((fins[F.fin] || {}).d || '')}</span>
          <div class="mp-vels"><button class="btn btn-primary btn-sm" onclick="MP.fundarEquipe()"${ligado}>Fundar a equipe</button><button class="btn btn-ghost btn-sm" onclick="MP._fundarAberto=false;MP.abrir()">Cancelar</button></div>
        </div></div>`;
    },
    async fundarEquipe(){
      const F = MP._fundar || {};
      const r = await MP.enviar('fundarEquipe', { equipe: { nome: String(F.nome || '').trim(), cor: F.cor, cc: F.cc, fin: F.fin, base: F.base || null } });
      if(r.erro) return UI.toast(erroTxt(r.erro));
      MP._fundarAberto = false; UI.toast('Equipe fundada: ela já é a sua nesta sala.');
    },
    copiar(){
      const g = ler(); if(!g) return;
      const falhou = () => UI.toast('Não consegui copiar: o código está na tela.');
      try { navigator.clipboard.writeText(codigoBonito(g.codigo)).then(() => UI.toast('Código copiado.'), falhou); } catch(e){ falhou(); }
    },
    /* sair de verdade avisa o servidor (a vaga fica livre); sem conexão, só esquece aqui */
    async sair(certeza){
      if(!certeza){
        /* a confirmação fica no topo da janela: rola até ela (o botão está lá embaixo) */
        MP.abrir('sair');
        const x = document.querySelector('.mp .sv-apagar'); if(x) x.scrollIntoView({ block: 'nearest' });
        return;
      }
      MP._saindo = true;
      if(MP.ws && MP.ws.readyState === 1) await MP.enviar('sair');
      MP.esquecer();
    },
    esquecer(){
      const g = ler();
      if(g) gravarLista(lerLista().filter(x => x.codigo !== g.codigo));
      MP.soltar(); MP.abrir();
    },
    /* larga a sala atual sem apagá-la: ela continua na lista */
    soltar(){
      MP._saindo = true; clearTimeout(MP._volta); clearInterval(MP._ping);
      if(MP.ws){ try { MP.ws.close(1000, 'saiu'); } catch(e){} }
      MP.ws = null; gravar(null);
      MP.sala = null; MP.voce = null; MP.v = -1; MP.con = 'fora'; MP._saindo = false;
      MP.vista = null; MP.vVista = -1; MP.cor = null; MP._apagar = null;
      /* a tela da partida de antes (carreira ou equipe da outra sala) deixa de ser a do multiplayer */
      MP._piloto = false; MP._chefe = false; MP._S = null; MP._C = null; MP._aposVista = null; MP._rodadaNova = null;
      const barra = el('mpBarra'); if(barra) barra.remove();
      document.body.classList.remove('mp-com-barra');
      MP.desenhar();
    },
    /* outra sala: a atual fica guardada, e a tela volta para criar ou entrar */
    outraSala(){ MP.soltar(); UI.close(); MP.tela(); if(document.body.dataset.tela === 'multiplayer') MP.abrirEntrada(); },
    /* volta para uma sala da lista */
    voltarSala(codigo){
      const g = lerLista().find(x => x.codigo === codigo); if(!g) return;
      MP.soltar(); gravar(g);
      MP.voce = { slot: g.slot }; MP.tentativas = 0; MP.falhas = 0;
      MP.conectar(); MP.abrir();
    },
    /* apaga uma sala deste aparelho (a atual sai de verdade, se a partida ainda não começou) */
    async apagarSala(codigo, certeza){
      /* a lista da janela de entrada (aberta por cima da página) tem a vez; senão, a da página */
      const m = el('modal'), naEntrada = UI.aberta() && m && m.dataset.titulo === TITULO_ENTRADA;
      const naTela = document.body.dataset.tela === 'multiplayer' && !naEntrada;
      if(certeza === false){ MP._apagar = null; return naTela ? MP.telaSalas() : MP.abrirEntrada(); }
      if(!certeza){ MP._apagar = codigo; return naTela ? MP.telaSalas() : MP.abrirEntrada(); }
      MP._apagar = null;
      const g = ler();
      if(g && g.codigo === codigo){ await MP.sair(true); if(naTela){ UI.close(); MP.tela(); } return; }
      gravarLista(lerLista().filter(x => x.codigo !== codigo));
      naTela ? MP.telaSalas() : MP.abrirEntrada();
    },

    /* ── a tela ── */
    desenhar(){
      const g = ler(), d = el('mpDesc');
      const p = MP.sala && MP.sala.partida;
      if(d) d.innerHTML = g ? `<span>Sala</span> <span data-i18n-ignore>${esc(codigoBonito(g.codigo))}</span>${p ? ` · <span>rodada</span> ${p.rodada}` : ''} · <span>${MP.textoConexao()}</span>`
                            : '<span>Sala com um amigo</span> · <span>teste</span>';
      const m = el('modal');
      if(UI.aberta() && m && TELAS.has(m.dataset.titulo)) MP.abrir(MP._tela);
      if(MP._chefe || MP._piloto) MP.barra();
      if(document.body.dataset.tela === 'multiplayer') MP.telaSalas();
    },
    /* a linha de conexão, com o que dá para fazer quando ela cai */
    linhaConexao(){
      const con = { conectado: 'Conectado ao servidor.', conectando: 'Conectando ao servidor…', reconectando: 'Sem conexão: tentando voltar…',
        'outra-aba': 'Esta sala está aberta em outra aba ou aparelho.', perdida: 'Não consegui voltar para a sala. Ela pode ter sido fechada.', fora: 'Sem conexão.' }[MP.con];
      return `<p class="mut mp-con" role="status">${con}${MP.con === 'perdida' ? ` <button class="btn btn-ghost btn-sm" onclick="MP.tentarDeNovo()">Tentar de novo</button> <button class="btn btn-ghost btn-sm" onclick="MP.esquecer()">Esquecer esta sala</button>` : ''}${MP.con === 'outra-aba' ? ' <button class="btn btn-ghost btn-sm" onclick="MP.tentarDeNovo()">Usar nesta aba</button>' : ''}</p>`;
    },
    textoConexao(){
      return { fora: 'sem conexão', conectando: 'conectando…', conectado: 'conectado', reconectando: 'reconectando…',
               'outra-aba': 'aberta em outra aba', perdida: 'não consegui voltar' }[MP.con] || '';
    },
    abrir(tela){
      MP._tela = tela || null;
      const g = ler();
      if(!g) return MP.abrirEntrada();
      if(MP.con === 'fora') MP.conectar();
      if(MP.sala && MP.sala.partida && MP.sala.partida.regras === 'chefe') return MP.vista && MP.vista.C ? MP.entrarChefe() : MP.abrirPartida();
      if(MP.sala && MP.sala.partida && MP.sala.partida.regras === 'piloto') return MP.vista && MP.vista.S ? MP.entrarPiloto() : MP.abrirPartida();
      if(MP.sala && MP.sala.partida) return MP._verResultado && MP.sala.partida.ultimo ? MP.abrirResultado() : MP.abrirPartida();
      const s = MP.sala, eu = MP.voce ? MP.voce.slot : g.slot;
      const souAnf = s && s.anfitriao === eu;
      const jog = s ? s.jogadores.slice().sort((a, b) => a.slot - b.slot) : [];
      const cartao = j => `<div class="sv-item mp-jog"><span class="mp-dot${j.conectado ? ' on' : ''}" aria-hidden="true"></span>
        <div class="sv-tx"><b data-i18n-ignore>${esc(j.nome)}</b><span class="sv-desc"><span>${j.conectado ? 'conectado' : 'desconectado'}</span>${s.anfitriao === j.slot ? ' · <span>anfitrião</span>' : ''}${j.slot === eu ? ' · <span>você</span>' : ''}</span></div></div>`;
      const vel = s && s.config ? s.config.velocidade : 8;
      const corpo = MP._tela === 'sair'
        ? `<div class="sv-item sv-apagar"><div class="sv-tx"><b>Sair da sala?</b><span class="sv-desc">A sua vaga fica livre para outra pessoa.</span></div>
            <div class="sv-bts"><button class="btn btn-ghost btn-sm" onclick="MP.abrir()">Cancelar</button><button class="btn btn-primary btn-sm" onclick="MP.sair(true)">Sair</button></div></div>`
        : '';
      UI.modal(UI.head(TITULO_SALA, s && s.modo === 'chefe' ? 'Teste: chefe de equipe com os amigos, até 8 jogadores.'
        : s && s.modo === 'piloto' ? 'Teste: carreira de piloto com os amigos, até 8 jogadores.'
        : 'Teste: por enquanto a sala junta os jogadores. As rodadas e as corridas chegam nas próximas etapas.') +
        `<div class="mbd sv mp">
          ${corpo}
          <span class="lbl">Código da sala</span>
          <div class="mp-codigo"><b data-i18n-ignore>${esc(codigoBonito(g.codigo))}</b><button class="btn btn-ghost btn-sm" onclick="MP.copiar()">Copiar código</button></div>
          <p class="mut mp-ajuda">Mande o código para os seus amigos: eles abrem o Volante de Ouro, tocam em Multiplayer e entram com o código.</p>
          <span class="lbl">Jogadores</span>
          ${s ? jog.map(cartao).join('') : '<p class="mut sv-vazio">Carregando a sala…</p>'}
          ${s && jog.length < MAX_SALA ? `<div class="sv-item mp-jog mp-vaga"><span class="mp-dot" aria-hidden="true"></span><div class="sv-tx"><span class="sv-desc">${jog.length < 2 ? 'Esperando o segundo jogador…' : `<span>Cabem até 8 jogadores:</span> ${jog.length}/${MAX_SALA}`}</span></div></div>` : ''}
          ${s ? `<span class="lbl">Partida</span>
          <div class="sv-item"><div class="sv-tx"><span class="sv-modo">Modo</span><b>${MODOS[s.modo] || s.modo}</b></div></div>
          <div class="sv-item"><div class="sv-tx"><span class="sv-modo">Velocidade das corridas</span>
            ${souAnf ? `<div class="mp-vels">${VELS.map(n => `<button class="btn btn-sm ${n === vel ? 'btn-primary' : 'btn-ghost'}" onclick="MP.velocidade(${n})"${MP.con === 'conectado' ? '' : ' disabled'}>${n}×</button>`).join('')}</div>`
                     : `<b>${vel}×</b>`}</div></div>` : ''}
          ${s && s.modo !== 'teste' ? `<div class="sv-item"><div class="sv-tx"><span class="sv-modo">Corridas</span>
            ${souAnf ? `<div class="mp-vels">${[[true, 'Ao vivo'], [false, 'Rápidas']].map(([v, n]) => `<button class="btn btn-sm ${(s.config.aoVivo !== false) === v ? 'btn-primary' : 'btn-ghost'}" onclick="MP.configurar({ aoVivo: ${v} })"${MP.con === 'conectado' ? '' : ' disabled'}>${n}</button>`).join('')}</div>`
                     : `<b>${s.config.aoVivo !== false ? 'Ao vivo' : 'Rápidas'}</b>`}
            <span class="sv-desc">${s.config.aoVivo !== false ? 'Todos assistem e comandam a mesma corrida, no relógio da sala.' : 'A corrida é calculada na hora, sem transmissão.'}</span></div></div>` : ''}
          ${s && s.modo === 'chefe' ? MP.configChefe(s, souAnf, eu) : ''}
          ${s && s.modo === 'piloto' ? MP.configPiloto(s, souAnf, eu) : ''}
          ${MP.linhaConexao()}
        </div>
        <div class="mft"><button class="btn btn-ghost" onclick="MP.sair()">Sair da sala</button><button class="btn btn-ghost" onclick="MP.outraSala()">Outra sala</button><span class="sp"></span>
          ${souAnf ? `<button class="btn btn-primary" onclick="MP.iniciar()"${jog.length >= 2 && MP.con === 'conectado' && (s.modo !== 'chefe' || jog.every(j => (s.config.equipes || {})[j.slot] != null)) && (s.modo !== 'piloto' || jog.every(j => (s.config.pilotos || {})[j.slot])) ? '' : ' disabled'}>Iniciar partida</button>` : ''}
          <button class="btn btn-ghost" onclick="UI.close()">Fechar</button></div>`);
    },
    /* a rodada de gerenciamento: cada um decide no seu ritmo e confirma quando estiver pronto */
    abrirPartida(){
      if(MP.sala && MP.sala.partida && (MP.sala.partida.regras === 'chefe' || MP.sala.partida.regras === 'piloto')) return MP.abrirPartidaChefe();
      const s = MP.sala, p = s.partida, eu = MP.voce ? MP.voce.slot : (ler() || {}).slot, vista = MP.vista || {};
      const jog = s.jogadores.slice().sort((a, b) => a.slot - b.slot);
      const pronto = slot => !!(p.prontos && p.prontos[slot]);
      const souPronto = pronto(eu), outrosProntos = jog.filter(j => j.slot !== eu).every(j => pronto(j.slot));
      const processando = p.estado === 'processing', ligado = MP.con === 'conectado';
      const estado = processando ? 'Processando a rodada…'
        : souPronto && !outrosProntos ? 'Aguardando o adversário…'
        : !souPronto && outrosProntos ? 'O adversário já está pronto. A rodada avança quando você confirmar.'
        : 'Tome as suas decisões no seu ritmo. A rodada avança quando todos estiverem prontos.';
      const pontos = vista.pontos || {};
      const cartao = j => `<div class="sv-item mp-jog"><span class="mp-dot${j.conectado ? ' on' : ''}" aria-hidden="true"></span>
        <div class="sv-tx"><b data-i18n-ignore>${esc(j.nome)}</b><span class="sv-desc"><span>${pronto(j.slot) ? 'pronto' : 'decidindo'}</span>${j.conectado ? '' : ' · <span>desconectado</span>'}${j.slot === eu ? ' · <span>você</span>' : ''}</span></div>
        <b class="mp-pts">${pontos[j.slot] || 0} <span>pontos</span></b></div>`;
      const trava = souPronto || processando || !ligado;
      UI.modal(UI.head('Partida multiplayer', `<span>Rodada</span> ${p.rodada}`) +
        `<div class="mbd sv mp">
          <p class="mp-estado${processando ? ' mp-proc' : ''}" role="status">${estado}</p>
          <span class="lbl">Jogadores</span>
          ${jog.map(cartao).join('')}
          <span class="lbl">Rodada de teste</span>
          <p class="mut mp-ajuda">Teste do protocolo: escolha um número. No processamento, o servidor soma um sorteio e guarda os pontos. O jogo de verdade entra na próxima fase.</p>
          <div class="mp-vels">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `<button class="btn btn-sm ${vista.meuPlano === n ? 'btn-primary' : 'btn-ghost'}" onclick="MP.planejar(${n})"${trava ? ' disabled' : ''}>${n}</button>`).join('')}</div>
          <p class="mut mp-ajuda">${vista.rivalDecidiu ? 'O adversário já decidiu.' : 'O adversário ainda está decidindo.'}</p>
          ${p.ultimo ? `<button class="btn btn-ghost btn-sm" onclick="MP._verResultado = true; MP.abrir()">Ver o resultado da rodada anterior</button>` : ''}
          ${MP.linhaConexao()}
        </div>
        <div class="mft"><button class="btn btn-ghost" onclick="UI.close()">Fechar</button><span class="sp"></span>
          ${souPronto
            ? `<button class="btn btn-ghost" onclick="MP.pronto(false)"${processando || !ligado ? ' disabled' : ''}>Cancelar prontidão</button>`
            : `<button class="btn btn-primary" onclick="MP.pronto(true)"${processando || !ligado ? ' disabled' : ''}>Pronto para avançar</button>`}</div>`);
    },
    /* a sala de uma partida de chefe: quem está pronto, e a volta para a própria equipe */
    abrirPartidaChefe(){
      const s = MP.sala, p = s.partida, eu = MP.voce ? MP.voce.slot : (ler() || {}).slot;
      const piloto = p.regras === 'piloto', pronta = !!(MP.vista && (piloto ? MP.vista.S : MP.vista.C));
      const jog = s.jogadores.slice().sort((a, b) => a.slot - b.slot);
      const pronto = slot => !!(p.prontos && p.prontos[slot]);
      const cartao = j => `<div class="sv-item mp-jog"><span class="mp-dot${j.conectado ? ' on' : ''}" aria-hidden="true"></span>
        <div class="sv-tx"><b data-i18n-ignore>${esc(j.nome)}</b><span class="sv-desc"><span>${pronto(j.slot) ? 'pronto' : 'decidindo'}</span>${j.conectado ? '' : ' · <span>desconectado</span>'}${j.slot === eu ? ' · <span>você</span>' : ''}</span></div></div>`;
      UI.modal(UI.head('Partida multiplayer', `<span>Rodada</span> ${p.rodada}`) +
        `<div class="mbd sv mp">
          <p class="mp-estado${p.estado === 'processing' ? ' mp-proc' : ''}" role="status">${p.estado === 'processing' ? 'Processando a rodada…' : 'Tome as suas decisões no seu ritmo. A rodada avança quando os dois estiverem prontos.'}</p>
          <span class="lbl">Jogadores</span>${jog.map(cartao).join('')}
          ${pronta ? '' : `<p class="mut sv-vazio">${piloto ? 'Carregando a sua carreira…' : 'Carregando a sua equipe…'}</p>`}
          ${MP.linhaConexao()}
        </div>
        <div class="mft"><button class="btn btn-ghost" onclick="UI.close()">Fechar</button><span class="sp"></span>
          <button class="btn btn-primary" onclick="${piloto ? 'MP.entrarPiloto()' : 'MP.entrarChefe()'}"${pronta ? '' : ' disabled'}>${piloto ? 'Ir para a minha carreira' : 'Ir para a minha equipe'}</button></div>`);
    },
    /* o resultado oficial da rodada, o mesmo para os dois */
    abrirResultado(){
      const s = MP.sala, u = s.partida.ultimo, res = u.resultado || {};
      const nome = slot => { const j = s.jogadores.find(x => x.slot === slot); return j ? j.nome : '?'; };
      const linhas = (res.jogadas || []).map(x => `<div class="sv-item mp-jog"><div class="sv-tx"><b data-i18n-ignore>${esc(nome(x.slot))}</b>
          <span class="sv-desc"><span>número</span> ${x.plano} · <span>sorteio</span> ${x.sorte}</span></div><b class="mp-pts">+${x.ganho}</b></div>`).join('');
      const placar = Object.keys(res.pontos || {}).map(k => `<div class="sv-item mp-jog"><div class="sv-tx"><b data-i18n-ignore>${esc(nome(Number(k)))}</b></div><b class="mp-pts">${res.pontos[k]} <span>pontos</span></b></div>`).join('');
      UI.modal(UI.head('Resultado da rodada', `<span>Rodada</span> ${u.rodada}`) +
        `<div class="mbd sv mp">
          <span class="lbl">Jogadas</span>${linhas}
          <span class="lbl">Placar</span>${placar}
          ${MP.linhaConexao()}
        </div>
        <div class="mft"><span class="sp"></span><button class="btn btn-primary" onclick="MP.voltarAoGerenciamento()">Voltar ao gerenciamento</button></div>`);
    },
    /* ── a página do multiplayer (o botão da abertura): os dois modos, continuar e as partidas deste aparelho ──
       Só monta a interface: criar e entrar usam a tela de entrada de sempre (MP.abrirEntrada), continuar usa
       MP.abrir, e "Minhas partidas" mostra as salas guardadas neste aparelho (nada é inventado). */
    tela(){
      const sec = MP.montarTela();
      if(!sec) return MP.abrirEntrada();
      UI.limparFila(); UI.close();
      UI.show('multiplayer');
      MP.telaSalas();
      /* a entrada anima a cada visita: o cabeçalho, os dois cartões, os painéis */
      const raiz = sec.querySelector('.mpp');
      if(raiz){
        raiz.classList.remove('mpp-entra'); void raiz.offsetWidth; raiz.classList.add('mpp-entra');
        clearTimeout(MP._entra); MP._entra = setTimeout(() => raiz.classList.remove('mpp-entra'), 1900);
      }
    },
    montarTela(){
      let sec = el('scr-multiplayer');
      if(sec) return sec;
      const intro = el('scr-intro'); if(!intro || !intro.parentNode) return null;
      sec = document.createElement('section');
      sec.className = 'screen'; sec.id = 'scr-multiplayer'; sec.setAttribute('aria-labelledby', 'mppTit');
      /* os ícones da casa (ICONES, no index.html) e dois desenhados aqui no mesmo traço */
      const IC = {
        historico: 'M13 3a9 9 0 0 0-9 9H1l3.9 3.9.1.1L9 12H6a7 7 0 1 1 2.05 4.95l-1.42 1.42A9 9 0 1 0 13 3zm-1 5v5l4.25 2.52.77-1.28-3.52-2.09V8H12z',
        lista: 'M4 5h2v2H4V5zm4 0h12v2H8V5zM4 11h2v2H4v-2zm4 0h12v2H8v-2zM4 17h2v2H4v-2zm4 0h12v2H8v-2z',
        seta: 'M9.3 5.3 7.9 6.7 13.2 12l-5.3 5.3 1.4 1.4L16 12z'
      };
      const svg = k => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="${IC[k]}"/></svg>`;
      let ni = 0;
      const item = (ic, nome, acao, ativo) => `<button class="mpp-nav-i${ativo ? ' on' : ''}" style="--i:${(ni++) * .5}"${ativo ? ' aria-current="page"' : ` onclick="${acao}"`}>${ico(ic)}<span>${nome}</span></button>`;
      const cartao = (k, n, img, pos, alt, titulo, texto) => `<article class="mpp-card" style="--i:${n}">
          <div class="mpp-card-foto"><img src="${img}" width="1920" height="1280" alt="${alt}" loading="lazy" decoding="async" style="object-position:${pos}"></div>
          <div class="mpp-card-corpo">
            <div class="mpp-card-cab">
              <span class="mpp-num" aria-hidden="true">0${n}.</span>
              <h2>${titulo}</h2>
              <span class="mpp-selo">${ico('pessoas')}<span>Multiplayer</span></span>
            </div>
            <p>${texto}</p>
            <button class="mpp-entrar" onclick="MP.entrarNoModo('${k}')">${ico('pessoas')}<span>Entrar no modo</span>${svg('seta')}</button>
          </div>
        </article>`;
      sec.innerHTML = `<div class="mpp">
        <nav class="mpp-nav" aria-label="Navegação">
          ${item('casa', 'Início', 'Game.goHome()')}
          ${item('trofeu', 'Carreira', 'Abertura.comecar()')}
          ${item('maleta', 'Chefe de equipe', 'Abertura.chefe()')}
          ${item('pessoas', 'Multiplayer', '', true)}
          ${item('barras', 'Recordes', 'UI.records()')}
          ${item('coroa', 'Lendas', 'UI.hall()')}
          ${item('livros', 'Como funciona', 'UI.help()')}
          <p class="mpp-nav-lema"><span>Do kart ao topo.</span> <span>Em qualquer época.</span> <span>Com quem você quiser.</span></p>
        </nav>
        <div class="mpp-conteudo">
          <header class="mpp-cab">
            <div class="mpp-cab-foto" aria-hidden="true"><img src="assets/apoio/spa-2008-before-start.jpg" width="1920" height="1280" alt="" decoding="async"></div>
            <div class="mpp-cab-tx">
              <span class="mpp-cab-ic" aria-hidden="true">${ico('pessoas')}</span>
              <div>
                <div class="mpp-titulo"><h1 id="mppTit">Multiplayer</h1><span class="mpp-beta">Beta</span></div>
                <p>Convide seus amigos ou jogue com outros pilotos em uma experiência completa de automobilismo!</p>
              </div>
            </div>
          </header>
          <div class="mpp-cards">
            ${cartao('chefe', 1, 'assets/spanish-grand-prix-2009.jpg', '50% 38%', 'Ross Brawn, de fone, entre os mecânicos no grid do GP da Espanha de 2009, com Adrian Newey ao lado', 'Chefe de Equipe',
              'Administre uma equipe junto com outros jogadores ou dispute contra equipes controladas por eles.')}
            ${cartao('piloto', 2, 'assets/cartoes/hamilton-trofeu.jpg', '50% 20%', 'Lewis Hamilton, de boné branco, sorri e ergue o troféu no pódio', 'Carreira de Piloto',
              'Cada jogador controla seu próprio piloto. Compitam nas mesmas categorias e busquem títulos contra outros participantes.')}
          </div>
          <div class="mpp-paineis">
            <div class="mpp-painel" id="mppContinuar" style="--i:3">
              <span class="mpp-painel-ic">${svg('historico')}</span>
              <div class="mpp-painel-tx"><h3><button class="mpp-painel-bt" onclick="MP.continuarDaTela()" aria-describedby="mppContinuarTx">Continuar Partida</button></h3><p id="mppContinuarTx">Retome sua última carreira multiplayer.</p></div>
              <span class="mpp-painel-ir">${svg('seta')}</span>
            </div>
            <div class="mpp-painel" id="mppMinhas" style="--i:4">
              <span class="mpp-painel-ic">${svg('lista')}</span>
              <div class="mpp-painel-tx"><h3><button class="mpp-painel-bt" id="mppMinhasBt" onclick="MP.minhasPartidas()" aria-expanded="false" aria-controls="mppSalas" aria-describedby="mppMinhasTx">Minhas Partidas</button></h3><p id="mppMinhasTx">Acompanhe suas campanhas multiplayer.</p></div>
              <span class="mpp-painel-ir">${svg('seta')}</span>
            </div>
          </div>
          <section class="mpp-salas" id="mppSalas" hidden aria-label="Minhas partidas"></section>
          <p class="mpp-credito">Fotos: o grid de Spa, 2008, Mark McArdle (CC BY-SA 2.0); GP da Espanha de 2009, janebelindasmith (CC BY 2.0), via Wikimedia Commons.</p>
        </div>
      </div>`;
      intro.parentNode.insertBefore(sec, intro.nextSibling);
      return sec;
    },
    /* "Entrar no modo": a entrada de sempre (criar ou entrar com código), já com o modo escolhido */
    entrarNoModo(modo){ MP.abrirEntrada(modo); },
    continuarDaTela(){
      if(!ler()) return UI.toast('Nenhuma partida multiplayer neste aparelho ainda. Entre num dos modos para começar.');
      MP.abrir();
    },
    minhasPartidas(){
      const box = el('mppSalas'), b = el('mppMinhasBt'); if(!box) return;
      if(!lerLista().length && !ler()) return UI.toast('Nenhuma partida guardada neste aparelho ainda.');
      box.hidden = !box.hidden;
      if(b) b.setAttribute('aria-expanded', box.hidden ? 'false' : 'true');
      if(!box.hidden){ MP.telaSalas(); try { box.scrollIntoView({ behavior: UI.movimentoLigado && UI.movimentoLigado() ? 'smooth' : 'auto', block: 'nearest' }); } catch(e){} }
    },
    /* o estado real dos dois painéis e a lista das salas deste aparelho */
    telaSalas(){
      const atual = ler(); if(atual && !lerLista().some(x => x.codigo === atual.codigo)) naLista(atual);
      const l = lerLista(), p = MP.sala && MP.sala.partida;
      const cont = el('mppContinuar'), contTx = el('mppContinuarTx'), min = el('mppMinhas'), minTx = el('mppMinhasTx');
      if(cont){
        cont.classList.toggle('mpp-off', !atual); cont.querySelector('.mpp-painel-bt').setAttribute('aria-disabled', atual ? 'false' : 'true');
        if(contTx) contTx.innerHTML = atual
          ? `<span>Sala</span> <span data-i18n-ignore>${esc(codigoBonito(atual.codigo))}</span>${atual.modo ? ` · <span>${esc(MODOS[atual.modo] || atual.modo)}</span>` : ''}${p ? ` · <span>rodada</span> ${p.rodada}` : ''}`
          : '<span>Nenhuma partida multiplayer neste aparelho ainda.</span>';
      }
      if(min){
        min.classList.toggle('mpp-off', !l.length); min.querySelector('.mpp-painel-bt').setAttribute('aria-disabled', l.length ? 'false' : 'true');
        if(minTx) minTx.innerHTML = l.length ? (l.length === 1 ? '<span>1 sala guardada neste aparelho.</span>' : `${l.length} <span>salas guardadas neste aparelho.</span>`)
                                             : '<span>Acompanhe suas campanhas multiplayer.</span>';
      }
      const box = el('mppSalas'); if(!box || box.hidden) return;
      if(!l.length){ box.innerHTML = '<p class="mpp-vazio">Nenhuma partida guardada neste aparelho ainda.</p>'; return; }
      box.innerHTML = l.map(g => {
        const eh = atual && atual.codigo === g.codigo;
        if(MP._apagar === g.codigo) return `<div class="mpp-sala mpp-sala-apagar">
            <div class="mpp-sala-tx"><b><span>Apagar esta sala?</span> <span data-i18n-ignore>${esc(codigoBonito(g.codigo))}</span></b>
              <span>Ela some deste aparelho. Se a partida ainda não começou, a vaga fica livre.</span></div>
            <div class="mpp-sala-bts"><button class="btn btn-sm" onclick="MP.apagarSala('${g.codigo}', false)">Cancelar</button><button class="btn btn-primary btn-sm" onclick="MP.apagarSala('${g.codigo}', true)">Apagar</button></div>
          </div>`;
        const estado = eh ? `${p ? `<span>rodada</span> ${p.rodada} · ` : ''}<span>${MP.textoConexao()}</span>` : '<span>guardada</span>';
        return `<div class="mpp-sala${eh ? ' mpp-sala-atual' : ''}">
            <div class="mpp-sala-tx"><b data-i18n-ignore>${esc(codigoBonito(g.codigo))}</b>
              <span>${g.modo ? `<span>${esc(MODOS[g.modo] || g.modo)}</span> · ` : ''}<span data-i18n-ignore>${esc(g.nome || '')}</span> · ${estado}</span></div>
            <div class="mpp-sala-bts">${eh ? '<button class="btn btn-primary btn-sm" onclick="MP.abrir()">Continuar</button>' : `<button class="btn btn-sm" onclick="MP.voltarSala('${g.codigo}')">Abrir</button>`}
              <button class="btn btn-sm mpp-x" onclick="MP.apagarSala('${g.codigo}')">Apagar</button></div>
          </div>`;
      }).join('') + '<p class="mpp-nota">Identidade de teste: as salas ficam guardadas neste navegador. Limpar os dados do site faz você perder as vagas.</p>';
    },
    listaSalas(){
      const atual = ler(); if(atual && !lerLista().some(x => x.codigo === atual.codigo)) naLista(atual);
      const l = lerLista(); if(!l.length) return '';
      return `<span class="lbl">Suas salas</span>` + l.map(g => MP._apagar === g.codigo
        ? `<div class="sv-item sv-apagar"><div class="sv-tx"><b><span>Apagar esta sala?</span> <span data-i18n-ignore>${esc(codigoBonito(g.codigo))}</span></b><span class="sv-desc">Ela some deste aparelho. Se a partida ainda não começou, a vaga fica livre.</span></div>
            <div class="sv-bts"><button class="btn btn-ghost btn-sm" onclick="MP._apagar=null;MP.abrirEntrada()">Cancelar</button><button class="btn btn-primary btn-sm" onclick="MP.apagarSala('${g.codigo}', true)">Apagar</button></div></div>`
        : `<div class="sv-item"><div class="sv-tx"><b data-i18n-ignore>${esc(codigoBonito(g.codigo))}</b><span class="sv-desc">${g.modo ? `<span>${esc(MODOS[g.modo] || g.modo)}</span> · ` : ''}<span data-i18n-ignore>${esc(g.nome || '')}</span></span></div>
            <div class="sv-bts">${atual && atual.codigo === g.codigo ? '<button class="btn btn-primary btn-sm" onclick="MP.abrir()">Continuar</button>' : `<button class="btn btn-primary btn-sm" onclick="MP.voltarSala('${g.codigo}')">Abrir</button>`}<button class="btn btn-ghost btn-sm" onclick="MP.apagarSala('${g.codigo}')">Apagar</button></div></div>`).join('');
    },
    /* a entrada: o nome em cima; à esquerda os dois modos (com foto) e criar, à direita o código e as salas.
       Os campos de sempre (mpNome, mpModo, mpCodigo) ficam, então criar, entrar e entrarNoModo não mudam. */
    abrirEntrada(modo){
      let nome = ''; try { nome = localStorage.getItem('vdo_mp_nome') || ''; } catch(e){}
      const k = MODO_ENTRADA[modo] ? modo : (MODO_ENTRADA[MP._modo] ? MP._modo : 'chefe');
      MP._modo = k;
      const tile = (v, img, pos) => `<label class="mpe-modo">
            <input type="radio" name="mpModo" value="${v}"${v === k ? ' checked' : ''} onchange="MP.modoEscolhido()">
            <span class="mpe-foto"><img src="${img}" alt="" decoding="async" style="object-position:${pos}"></span>
            <b>${MODOS[v]}</b>
          </label>`;
      UI.modal(UI.head(TITULO_ENTRADA, 'Crie uma sala ou entre com o código que um amigo mandar.') +
        `<div class="mbd mp mpe">
          <div class="field mpe-nome"><label class="lbl" for="mpNome">Seu nome</label><input type="text" id="mpNome" maxlength="24" autocomplete="off" value="${esc(nome)}" placeholder="Como os outros vão ver você"></div>
          <div class="mpe-grade">
            <section class="mpe-lado" aria-labelledby="mpeCriar">
              <h3 class="mpe-t" id="mpeCriar">Criar uma sala</h3>
              <div class="mpe-modos" role="radiogroup" aria-labelledby="mpeCriar">
                ${tile('chefe', 'assets/spanish-grand-prix-2009.jpg', '50% 34%')}
                ${tile('piloto', 'assets/cartoes/hamilton-trofeu.jpg', '50% 22%')}
              </div>
              <p class="mpe-desc" id="mpModoTx">${MODO_ENTRADA[k].tx}</p>
              <button class="btn btn-primary mp-acao mpe-bt" id="mpCriarBt" onclick="MP.criar()">${MODO_ENTRADA[k].bt}</button>
            </section>
            <section class="mpe-lado mpe-cod" aria-labelledby="mpeEntrar">
              <h3 class="mpe-t" id="mpeEntrar">Entrar com um código</h3>
              <p class="mpe-desc">Quem criou a sala manda o código de 8 letras.</p>
              <label class="mpe-vh" for="mpCodigo">Código da sala</label>
              <input type="text" id="mpCodigo" class="mpe-codigo" maxlength="9" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ABCD-EFGH" data-i18n-ignore onkeydown="if(event.key==='Enter')MP.entrar()">
              <button class="btn btn-contorno mp-acao mpe-bt" onclick="MP.entrar()">Entrar</button>
            </section>
          </div>
          <p class="mp-erro" id="mpErro" role="alert"></p>
          ${MP.listaSalas() ? `<div class="mpe-salas">${MP.listaSalas()}</div>` : ''}
          <p class="mut sv-uso">Identidade de teste: a sua vaga na sala fica guardada neste navegador. Limpar os dados do site faz você perder a vaga.</p>
        </div>
        <div class="mft"><span class="sp"></span><button class="btn btn-ghost" onclick="UI.close()">Fechar</button></div>`, true);
    },
    /* o texto e o botão seguem o modo marcado */
    modoEscolhido(){
      const m = document.querySelector('input[name="mpModo"]:checked'), k = m && MODO_ENTRADA[m.value] ? m.value : 'chefe';
      MP._modo = k;
      const b = el('mpCriarBt'), tx = el('mpModoTx');
      if(b) b.textContent = MODO_ENTRADA[k].bt;
      if(tx) tx.textContent = MODO_ENTRADA[k].tx;
    }
  };
  window.MP = MP;

  function iniciar(){
    if(!MP.disponivel()) return;
    const st = document.createElement('style');
    st.textContent = `.mp .mp-codigo{display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--s2);border-radius:var(--r-sm)}
      .mp .mp-codigo b{flex:1;font-size:24px;letter-spacing:.12em;font-variant-numeric:tabular-nums}
      .mp .mp-dot{width:10px;height:10px;border-radius:50%;flex:none;background:var(--faint)}
      .mp .mp-dot.on{background:var(--green)}
      .mp .sv-item.mp-jog{flex-direction:row;align-items:center}
      .mp .mp-vaga{opacity:.7}
      .mp .mp-vels{display:flex;gap:6px;flex-wrap:wrap;margin-top:4px}
      .mp .mp-modos{display:grid;gap:6px}
      .mp .mp-modos label{cursor:pointer}
      .mp .mp-modos input{width:auto;flex:none;margin:0;accent-color:var(--accent)}
      .mp .mp-erro{margin:0;min-height:1.3em;font-size:14px;color:var(--red-txt)}
      .mp .mp-ajuda,.mp .mp-con{margin:0;font-size:13px}
      .mp .mp-estado{margin:0;padding:12px 14px;background:var(--s2);border-radius:var(--r-sm);border:1px solid var(--line);font-size:15px}
      .mp .mp-estado.mp-proc{border-color:var(--green)}
      .mp .mp-pts{flex:none;font-variant-numeric:tabular-nums}
      .mp .mp-pts span{font-weight:400;color:var(--soft);font-size:13px}
      .mp .mp-eqs{display:grid;gap:6px;grid-template-columns:repeat(auto-fill,minmax(180px,1fr))}
      .mp .mp-eq{width:100%;text-align:left;cursor:pointer;color:inherit;font:inherit}
      .mp .mp-eq.mp-sel{outline:2px solid var(--accent)}
      .mp .mp-eq:disabled{cursor:default;opacity:.55}
      .mp .mp-cor{width:10px;height:28px;border-radius:3px;flex:none}
      .mp #mpAno{width:90px}
      .mp .mp-form{display:grid;gap:8px;grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}
      .mp .mp-form .field{margin:0}
      .modal.wide:has(.mpe){max-width:900px}
      /* as linhas não encolhem quando o modal fica baixo: quem rola é o corpo */
      .mpe{display:grid;gap:16px;grid-auto-rows:max-content}
      .mpe .mpe-nome input{font-size:18px;min-height:52px}
      .mpe-grade{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(0,1fr);gap:0;border:1px solid var(--line);border-radius:14px;overflow:hidden;background:var(--s1)}
      .mpe-lado{display:flex;flex-direction:column;gap:12px;padding:20px 22px 22px;min-width:0}
      .mpe-cod{background:var(--s2)}
      .mpe-t{margin:0;font-size:24px;font-weight:700;font-style:italic;line-height:1.1;color:var(--ink)}
      .mpe-desc{margin:0;font-size:15px;line-height:1.45;color:var(--soft)}
      .mpe-modos{display:grid;grid-template-columns:1fr 1fr;gap:10px}
      .mpe-modo{position:relative;display:block;border-radius:10px;overflow:hidden;cursor:pointer;background:#0d0e10;isolation:isolate;transition:transform .18s var(--ease),box-shadow .18s}
      .mpe-modo input{position:absolute;opacity:0;pointer-events:none}
      .mpe-foto{display:block;aspect-ratio:4/3}
      .mpe-foto img{width:100%;height:100%;object-fit:cover;filter:grayscale(.85) brightness(.62);transition:filter .3s,transform .6s var(--ease-out,ease)}
      /* o nome do modo fica legível sobre a foto (taste-skill-ignore) */
      .mpe-modo::after{content:'';position:absolute;inset:40% 0 0;z-index:0;background:linear-gradient(0deg,rgba(8,9,11,.9),rgba(8,9,11,0))}
      .mpe-modo b{position:absolute;left:12px;right:12px;bottom:10px;z-index:1;font-size:19px;font-weight:700;font-style:italic;line-height:1.1;color:#fff}
      .mpe-modo:hover .mpe-foto img{filter:grayscale(.3) brightness(.78);transform:scale(1.04)}
      .mpe-modo:has(input:checked){box-shadow:0 0 0 2px var(--accent)}
      .mpe-modo:has(input:checked) .mpe-foto img{filter:none}
      .mpe-modo:has(input:checked) b{color:var(--accent)}
      .mpe-modo:has(input:focus-visible){outline:2px solid var(--ink);outline-offset:3px}
      .mpe-modo:active{transform:scale(.98)}
      .mpe .mpe-bt{width:100%;min-height:52px;margin-top:auto;font-size:17px}
      .mpe-vh{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
      .mpe .mpe-codigo{min-height:64px;font-size:28px;font-weight:800;letter-spacing:.16em;text-align:center;text-transform:uppercase;font-variant-numeric:tabular-nums}
      .mpe .mpe-codigo::placeholder{color:var(--faint);letter-spacing:.16em}
      .mpe-salas{display:grid;gap:8px}
      .mpe .mp-erro:empty{display:none}
      @media (max-width:700px){
        .mpe-grade{grid-template-columns:1fr}
        .mpe-lado{padding:16px}
        .mpe-foto{aspect-ratio:1/1}
        .mpe-modo b{font-size:17px}
      }
      @media (prefers-reduced-motion:reduce){ .mpe-modo,.mpe-foto img{transition:none} .mpe-modo:hover .mpe-foto img{transform:none} }
      .mp-barra{position:fixed;left:0;right:0;bottom:0;z-index:90;display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;
        padding:10px 16px;background:var(--s1);border-top:1px solid var(--line);font-size:14px}
      .mp-barra .mp-b-e{flex:1;min-width:160px;color:var(--soft)}
      .mp-barra .mp-dot{display:inline-block;vertical-align:middle}
      body.mp-com-barra{padding-bottom:64px}
      .mp-barra .mp-forcar{border:1px solid var(--accent);color:var(--accent);background:transparent}
      .mp-barra .mp-forcar.mp-armado{background:var(--accent);color:var(--accent-ink)}
      .ini-mp{margin-top:12px}
      .ini-texto:has(#abMP){max-width:740px}
      #scr-multiplayer{--mpp-ouro:var(--accent)}
      /* a página ocupa a largura toda, como a tela do chefe (o trilho na borda esquerda) */
      body[data-tela="multiplayer"] .wrap{max-width:none; padding:0}
      .mpp{position:relative; display:grid; grid-template-columns:232px minmax(0,1fr); min-height:calc(100vh - 64px)}
      .mpp::before{content:''; position:absolute; left:0; top:0; bottom:0; width:232px; background:var(--rail)}
      .mpp-nav{position:sticky; top:64px; z-index:1; align-self:start; height:calc(100vh - 64px); display:flex; flex-direction:column; gap:4px; padding:28px 16px 24px}
      .mpp-nav-i{display:flex; align-items:center; gap:14px; min-height:50px; padding:0 16px; border-radius:10px; font-size:16px; font-weight:600; color:var(--soft); text-align:left; transition:background .2s,color .2s,transform .2s var(--ease)}
      .mpp-nav-i .ico{width:24px; height:24px; fill:currentColor; flex:none}
      .mpp-nav-i:hover{background:var(--s2); color:var(--ink); transform:translateX(3px)}
      .mpp-nav-i:focus-visible{outline:2px solid var(--mpp-ouro); outline-offset:2px}
      .mpp-nav-i.on{background:var(--mpp-ouro); color:var(--accent-ink); cursor:default}
      .mpp-nav-i.on:hover{transform:none}
      .mpp-nav-lema{margin:auto 0 0; padding:20px 16px 0; display:grid; gap:2px; font-size:16px; line-height:1.4; font-style:italic; color:var(--faint)}
      .mpp-conteudo{min-width:0; max-width:1440px; padding:24px clamp(16px,2.6vw,40px) 72px}
      .mpp-cab{position:relative; display:flex; align-items:flex-end; min-height:clamp(240px,32vh,330px); border-radius:18px; overflow:hidden; isolation:isolate; background:#0d0e10}
      .mpp-cab-foto{position:absolute; inset:0; z-index:-2}
      .mpp-cab-foto img{width:100%; height:100%; object-fit:cover; object-position:50% 78%; filter:grayscale(1) contrast(1.06) brightness(.78)}
      /* o véu que deixa o título legível sobre a foto (taste-skill-ignore) */
      .mpp-cab::after{content:''; position:absolute; inset:0; z-index:-1; background:linear-gradient(0deg,rgba(8,9,11,.96) 0%,rgba(8,9,11,.6) 42%,rgba(8,9,11,.12) 100%)}
      .mpp-cab-tx{display:flex; align-items:center; gap:clamp(14px,2vw,26px); width:100%; padding:clamp(20px,2.6vw,34px); border-bottom:2px solid var(--mpp-ouro)}
      .mpp-cab-ic{display:grid; place-items:center; flex:none}
      .mpp-cab-ic .ico{width:clamp(52px,5vw,78px); height:clamp(52px,5vw,78px); fill:var(--mpp-ouro)}
      .mpp-titulo{display:flex; flex-wrap:wrap; align-items:center; gap:8px 16px}
      .mpp-cab h1{margin:0; font-size:clamp(40px,5.6vw,86px); font-weight:800; font-style:italic; text-transform:uppercase; line-height:.95; letter-spacing:-.01em; color:#fff}
      .mpp-beta{padding:6px 12px; border:2px solid var(--mpp-ouro); border-radius:999px; font-size:14px; font-weight:700; line-height:1; color:var(--mpp-ouro)}
      .mpp-cab-tx p{margin:8px 0 0; max-width:62ch; font-size:19px; line-height:1.45; font-style:italic; color:#d3d7dc}
      .mpp-cards{display:grid; grid-template-columns:1fr 1fr; gap:clamp(16px,2vw,28px); margin-top:clamp(18px,2.4vw,28px)}
      .mpp-card{position:relative; display:flex; flex-direction:column; border:2px solid var(--mpp-ouro); border-radius:18px; overflow:hidden; background:var(--s1); transition:transform .35s var(--ease-out,ease),box-shadow .35s}
      .mpp-card:hover{transform:translateY(-4px); box-shadow:0 0 0 1px var(--mpp-ouro),0 24px 60px -20px rgba(240,193,46,.38)}
      .mpp-card-foto{position:relative; aspect-ratio:16/8.5; overflow:hidden; background:#0d0e10}
      .mpp-card-foto img{width:100%; height:100%; object-fit:cover; transition:transform 1.1s var(--ease-out,ease)}
      /* a foto se funde no corpo do cartão (taste-skill-ignore) */
      .mpp-card-foto::after{content:''; position:absolute; inset:auto 0 0 0; height:42%; background:linear-gradient(0deg,var(--s1),rgba(0,0,0,0))}
      .mpp-card:hover .mpp-card-foto img{transform:scale(1.05)}
      .mpp-card-corpo{display:flex; flex-direction:column; flex:1; gap:14px; padding:4px clamp(18px,2vw,28px) clamp(18px,2vw,26px)}
      .mpp-card-cab{display:flex; flex-wrap:wrap; align-items:center; gap:8px 14px}
      .mpp-num{font-size:40px; font-weight:800; font-style:italic; line-height:1; color:var(--mpp-ouro)}
      .mpp-card-cab h2{flex:0 1 auto; margin:0; font-size:32px; font-weight:700; font-style:italic; line-height:1.05; color:var(--ink)}
      .mpp-selo{margin-left:auto; display:inline-flex; align-items:center; gap:8px; padding:7px 14px; border-radius:999px; background:var(--mpp-ouro); color:var(--accent-ink); font-size:14px; font-weight:700; line-height:1}
      .mpp-selo .ico{width:18px; height:18px; fill:currentColor}
      .mpp-card-corpo p{margin:0; padding-bottom:18px; border-bottom:1px solid var(--s4); font-size:16px; line-height:1.5; font-style:italic; color:var(--soft)}
      .mpp-entrar{position:relative; display:flex; align-items:center; justify-content:center; gap:14px; min-height:62px; margin-top:auto; padding:0 56px; border:2px solid var(--mpp-ouro); border-radius:10px; color:var(--mpp-ouro); font-size:22px; font-weight:700; font-style:italic; transition:background .2s,color .2s,transform .12s var(--ease)}
      .mpp-entrar .ico{width:26px; height:26px; fill:currentColor; flex:none}
      .mpp-entrar .ico:last-child{position:absolute; right:18px; transition:transform .25s var(--ease)}
      .mpp-entrar:hover,.mpp-entrar:focus-visible{background:var(--mpp-ouro); color:var(--accent-ink); outline:none}
      .mpp-entrar:hover .ico:last-child{transform:translateX(5px)}
      .mpp-entrar:active{transform:translateY(1px)}
      .mpp-paineis{display:grid; grid-template-columns:1fr 1fr; gap:clamp(16px,2vw,28px); margin-top:clamp(16px,2vw,24px)}
      .mpp-painel{position:relative; display:flex; align-items:center; gap:18px; min-height:88px; padding:16px 22px; border:1px solid var(--s4); border-radius:14px; background:var(--s1); transition:border-color .2s,background .2s}
      .mpp-painel:hover,.mpp-painel:focus-within{border-color:var(--mpp-ouro); background:var(--s2)}
      .mpp-painel h3{margin:0; font-size:22px; font-weight:700; line-height:1.15}
      .mpp-painel-bt{color:var(--ink); text-align:left; font:inherit}
      .mpp-painel-bt::after{content:''; position:absolute; inset:0; border-radius:14px}
      .mpp-painel-bt:focus-visible{outline:none}
      .mpp-painel:focus-within{box-shadow:0 0 0 2px var(--mpp-ouro)}
      .mpp-painel .ico{fill:var(--soft); transition:fill .2s,transform .25s var(--ease)}
      .mpp-painel-ic .ico{width:42px; height:42px}
      .mpp-painel:hover .ico{fill:var(--mpp-ouro)}
      .mpp-painel-tx{flex:1; display:grid; gap:3px; min-width:0}
      .mpp-painel-tx p{margin:0; font-size:16px; line-height:1.4; font-style:italic; color:var(--soft)}
      .mpp-painel-ir .ico{width:28px; height:28px}
      .mpp-painel:hover .mpp-painel-ir .ico{transform:translateX(4px)}
      .mpp-painel.mpp-off{opacity:.55}
      .mpp-painel.mpp-off .mpp-painel-bt{cursor:default}
      .mpp-painel.mpp-off:hover{border-color:var(--s4); background:var(--s1)}
      .mpp-painel.mpp-off:hover .ico{fill:var(--soft); transform:none}
      .mpp-salas{margin-top:14px; padding:clamp(14px,2vw,22px); border-radius:14px; background:var(--s1)}
      .mpp-sala{display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px 16px; padding:14px 18px; background:var(--s2); border-radius:10px}
      .mpp-sala + .mpp-sala{margin-top:8px}
      .mpp-sala-atual{background:var(--s3)}
      .mpp-sala-apagar{background:var(--s4)}
      .mpp-sala-tx{display:grid; gap:3px; min-width:0}
      .mpp-sala-tx b{font-size:22px; font-weight:800; letter-spacing:.06em; font-variant-numeric:tabular-nums}
      .mpp-sala-tx > span{font-size:16px; color:var(--soft)}
      .mpp-sala-bts{display:flex; gap:8px}
      .mpp-x{background:transparent; color:var(--soft)}
      .mpp-x:hover{background:var(--s4); color:var(--ink)}
      .mpp-vazio{margin:0; font-size:16px; color:var(--soft)}
      .mpp-nota{margin:14px 0 0; max-width:72ch; font-size:14px; color:var(--faint)}
      .mpp-credito{margin:24px 0 0; max-width:64ch; font-size:14px; line-height:1.5; color:var(--faint)}
      /* a entrada: a foto do grid assenta, o título e os cartões sobem em sequência */
      .mpp-entra .mpp-cab-foto img{animation:mppFoto 1.8s var(--ease-out,ease) both}
      .mpp-entra .mpp-cab-tx > *,.mpp-entra .mpp-card,.mpp-entra .mpp-painel,.mpp-entra .mpp-nav-i{animation:mppSobe .62s var(--ease-out,ease) both; animation-delay:calc(var(--i,0) * 85ms + 140ms)}
      .mpp-entra .mpp-cab-tx > :last-child{--i:.6}
      @keyframes mppSobe{from{opacity:0; transform:translateY(24px)} to{opacity:1; transform:none}}
      @keyframes mppFoto{from{transform:scale(1.12)} to{transform:scale(1)}}
      @media (max-width:1100px){
        .mpp{grid-template-columns:1fr; min-height:0}
        .mpp::before{display:none}
        .mpp-nav{background:var(--rail)}
        .mpp-nav{position:static; height:auto; flex-direction:row; flex-wrap:wrap; gap:6px; padding:10px clamp(16px,2.4vw,36px)}
        .mpp-nav-i{flex:none; min-height:44px; padding:0 14px; gap:10px}
        .mpp-nav-i:hover{transform:none}
        .mpp-nav-lema{display:none}
      }
      @media (max-width:760px){
        .mpp-cards,.mpp-paineis{grid-template-columns:1fr}
        /* no celular a foto vira uma faixa em cima, e o texto fica embaixo, no escuro */
        .mpp-cab{flex-direction:column; align-items:stretch; min-height:0}
        .mpp-cab-foto{position:relative; inset:auto; height:150px; z-index:0}
        .mpp-cab::after{inset:0 0 auto 0; height:150px; z-index:0}
        .mpp-cab-tx{position:relative; z-index:1; align-items:flex-start; padding:16px 18px 20px}
        .mpp-cab h1{font-size:clamp(34px,10.5vw,52px)}
        .mpp-cab-ic .ico{width:40px; height:40px; margin-top:2px}
        .mpp-cab-tx p{font-size:17px}
        .mpp-selo{margin-left:0}
        .mpp-nav{gap:4px; padding:8px 16px}
        .mpp-nav-i{min-height:40px; padding:0 12px; font-size:15px}
        .mpp-card-cab h2{font-size:28px}
        .mpp-num{font-size:36px}
        .mpp-entrar{padding:0 48px}
      }
      @media (prefers-reduced-motion:reduce){
        .mpp-entra *{animation:none!important}
        .mpp-card,.mpp-card-foto img,.mpp-nav-i,.mpp-painel .ico{transition:none}
        .mpp-card:hover,.mpp-card:hover .mpp-card-foto img{transform:none}
      }
      .mp-clicado{background:var(--accent,#e1251b)!important;border-color:var(--accent,#e1251b)!important;color:#fff!important}`;
    document.head.appendChild(st);
    /* o botão fica fora do bloco "Continuar", que some quando o aparelho não tem save do jogo solo */
    const b = el('btnMP');
    if(b){
      /* o botão grande da abertura, ao lado de "Chefe de equipe", leva à tela do multiplayer */
      b.hidden = true;
      const chefe = document.querySelector('.ini-acoes .btn-contorno');
      if(chefe && !el('abMP')){
        const nb = document.createElement('button');
        nb.className = 'btn btn-contorno btn-lg'; nb.id = 'abMP';
        nb.innerHTML = '<span>Multiplayer</span> <span class="seta" aria-hidden="true">→</span>';
        nb.onclick = () => MP.tela();
        chefe.parentNode.insertBefore(nb, chefe.nextSibling);
      }
    }
    /* sair da tela da partida por qualquer botão (o menu, "Sair") desliga o modo e tira a barra */
    const mostrar = UI.show;
    UI.show = function(nome){
      const r = mostrar.apply(this, arguments);
      if((MP._piloto && nome !== 'career') || (MP._chefe && nome !== 'chefe')){
        if(MP._piloto){ MP._piloto = false; if(typeof S !== 'undefined' && S === MP._S) S = null; MP._S = null; }
        if(MP._chefe){ MP._chefe = false; if(typeof C !== 'undefined' && C === MP._C) C = null; MP._C = null; }
        MP._aposVista = null; MP._rodadaNova = null;
        const barra = el('mpBarra'); if(barra) barra.remove();
        document.body.classList.remove('mp-com-barra');
      }
      return r;
    };
    /* o que a carreira solo deixa fazer e o servidor ainda não sabe aplicar: numa partida de piloto
       vira um aviso, em vez de mudar só a cópia da tela (o servidor desfaria na próxima rodada) */
    ['setDif', 'toggleFast', 'definirRival', 'contratarEmpresario', 'demitirEmpresario', 'negociarOferta', 'takeOfferDupla',
     'ajustarVinculoReserva', 'aceitarParalela', 'recusarParalela', 'aceitarConvocacao', 'recusarConvocacao', 'correrConvocacaoAcademia',
     'marcarInverno', 'cobrarPromessas', 'escolherSemente', 'tomarRota', 'recalcularRota', 'fazerTreino', 'pularTreinos',
     'escolherFala', 'aplicarFala', 'escolherEvento', 'chooseDilemma', 'responderPedido', 'pedido', 'escolherLado', 'endCareer'
    ].forEach(k => {
      const orig = Game[k]; if(typeof orig !== 'function') return;
      Game[k] = function(){ return Game.mpIndisponivel() ? undefined : orig.apply(this, arguments); };
    });
    /* "Simular o resto do ano" numa partida (piloto ou chefe): liga a simulação na sala, em vez de
       correr o ano só na cópia da tela */
    if(typeof UIC !== 'undefined' && typeof UIC.simularResto === 'function'){
      const sr = UIC.simularResto;
      UIC.simularResto = function(){ return UIC.emMP && UIC.emMP() ? MP.simularAno(true) : sr.apply(this, arguments); };
    }
    if(typeof Game.simSeason === 'function'){
      const ss = Game.simSeason;
      Game.simSeason = function(pausar, umaEtapa){ return Game.emMP && Game.emMP() && !umaEtapa ? MP.simularAno(true) : ss.apply(this, arguments); };
    }
    /* o clique aparece na hora, mesmo com ping alto: o botão fica vermelho já no toque e os vizinhos
       do mesmo grupo apagam; a tela de verdade chega com a resposta do servidor e redesenha tudo */
    document.addEventListener('click', e => {
      if(!(MP._piloto || MP._chefe || (MP.sala && UI.aberta()))) return;
      const b = e.target.closest && e.target.closest('button, .dil, [data-sel]');
      if(!b || b.disabled) return;
      const oc = b.getAttribute('onclick') || '';
      if(!/(Game|UIC|MP)\./.test(oc) || /^\s*UI\.close\(\);?\s*$/.test(oc)) return;
      const grupo = b.parentElement;
      if(grupo) [...grupo.children].forEach(x => { if(x !== b) x.classList.remove('mp-clicado'); });
      b.classList.add('mp-clicado');
    }, true);
    if(ler()) MP.conectar(); else MP.desenhar();
    /* o link direto para a tela do multiplayer: volantedeouro.com/?mp=1#multiplayer */
    if(location.hash === '#multiplayer') setTimeout(() => MP.tela(), 0);
    addEventListener('online', () => { if(ler() && !MP.ws) MP.tentarDeNovo(); });
    document.addEventListener('visibilitychange', () => { if(!document.hidden && ler() && !MP.ws && MP.con !== 'outra-aba') MP.tentarDeNovo(); });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
