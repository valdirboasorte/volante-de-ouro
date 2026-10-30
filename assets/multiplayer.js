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
  const VELS = [1, 2, 4, 8, 16];
  const ERROS = {
    rede: 'Sem conexão com o servidor do multiplayer.',
    servidor: 'O servidor do multiplayer não respondeu direito. Tente de novo.',
    limite: 'Muitas salas criadas agora. Espere um minuto e tente de novo.',
    codigo: 'Esse código não é válido: confira as letras e os números.',
    sala: 'Essa sala não existe.',
    cheia: 'Essa sala já está cheia.',
    versao: 'A sua página está numa versão diferente do servidor. Recarregue a página.',
    comecou: 'A partida dessa sala já começou.',
    nome: 'Escreva o seu nome.',
    origem: 'Este endereço não pode abrir salas.',
    anfitriao: 'Só o anfitrião muda isso.',
    tempo: 'O servidor demorou a responder. Tente de novo.',
    jogadores: 'A partida começa com os dois jogadores na sala.',
    estado: 'Isso não vale neste momento da partida.',
    processando: 'A rodada está sendo processada.',
    rodada: 'Essa rodada já passou: a tela foi atualizada.',
    pronto: 'Você está pronto: cancele a prontidão para mudar a decisão.',
    acao: 'Essa ação não é permitida.',
    dados: 'Essa decisão não é válida.',
    equipes: 'Os dois jogadores precisam escolher uma equipe.',
    equipe: 'Essa equipe já foi escolhida.',
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
      const fase = { inverno: 'pré-temporada', temporada: 'temporada', balanco: 'balanço do ano', mercado: 'propostas' }[MP.vista && MP.vista.fase] || '';
      const sea = piloto ? (typeof S !== 'undefined' && S && S.season) : (typeof C !== 'undefined' && C && C.temporada);
      const prox = MP.vista && MP.vista.fase === 'temporada' && sea && sea.calendar[sea.round];
      const voltas = p.estado === 'corrida' && MP.cor ? Object.values(MP.cor.corridas).filter(c => c.N)
        .map(c => `<span data-i18n-ignore>${esc(c.serie || '')}</span> <span>volta</span> ${Math.min(c.volta || 1, c.N)}/${c.N}`).join(' · ') : '';
      const estado = p.estado === 'corrida' ? `<span>Corrida ao vivo</span>${voltas ? ': ' + voltas : ''}`
        : proc ? 'Processando a rodada…' : souPronto && !outrosProntos ? 'Aguardando o adversário…'
        : !souPronto && outrosProntos ? 'O adversário já está pronto.' : 'Tome as suas decisões no seu ritmo.';
      b.innerHTML = `<span class="mp-b-t"><b>Multiplayer</b> · <span>Rodada</span> ${p.rodada}${fase ? ` · <span>${fase}</span>` : ''}${prox ? ` · <span>GP ${esc(prox.gp)}</span>` : ''}</span>
        <span class="mp-b-e" role="status">${estado}</span>
        <span class="mp-b-j">${outros.map(j => `<span class="mp-dot${j.conectado ? ' on' : ''}" aria-hidden="true"></span> <span data-i18n-ignore>${esc(j.nome)}</span>: <span>${pronto(j.slot) ? 'pronto' : (p.fora || []).map(String).includes(String(j.slot)) ? 'carreira encerrada' : 'decidindo'}</span>`).join(' ')}</span>
        ${souPronto ? `<button class="btn btn-ghost btn-sm" onclick="MP.pronto(false)"${proc ? ' disabled' : ''}>Cancelar prontidão</button>`
                    : `<button class="btn btn-primary btn-sm" onclick="${piloto ? 'MP.pilotoPronto()' : 'MP.chefePronto()'}"${proc || MP.con !== 'conectado' ? ' disabled' : ''}>Pronto para avançar</button>`}
        ${p.estado === 'corrida' && MP.cor && MP.cor.minha && !MP.cor.aberta ? '<button class="btn btn-gold btn-sm" onclick="MP.verCorrida()">Ver a corrida</button>' : ''}
        <button class="btn btn-ghost btn-sm" onclick="MP.abrirPartida()">Sala</button>`;
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
      const minha = (m.corridas || []).find(c => Object.values(c.donos).map(String).includes(String(eu)));
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
        const meus = new Set(Object.keys(c.donos).filter(i => String(c.donos[i]) === String(eu)).map(i => c.ent.carros[i].id));
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
        meus: new Set(Object.keys(c.donos).filter(i => String(c.donos[i]) === String(eu)).map(Number)),
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
          if(tx){ tx.className = 'av-luzes-tx'; tx.textContent = 'Esperando o outro jogador largar…'; }
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
      const series = { f1: 'Fórmula 1', indy: 'IndyCar' };
      const ligado = MP.con === 'conectado' ? '' : ' disabled';
      const estilos = typeof STYLES !== 'undefined' ? Object.keys(STYLES) : ['equilibrado'];
      const outros = s.jogadores.filter(j => j.slot !== eu).map(j => ({ j, p: (cfg.pilotos || {})[j.slot] }));
      return `<span class="lbl">Campeonato</span>
        <div class="sv-item"><div class="sv-tx"><span class="sv-modo">Série e ano</span>
          ${souAnf ? `<div class="mp-vels">${Object.keys(series).map(k => `<button class="btn btn-sm ${k === serie ? 'btn-primary' : 'btn-ghost'}" onclick="MP.configurar({ serie: '${k}' })"${ligado}>${series[k]}</button>`).join('')}
              <input type="number" id="mpAno" min="1950" max="2026" value="${ano}" aria-label="Ano"> <button class="btn btn-ghost btn-sm" onclick="MP.configurar({ ano: +el('mpAno').value })"${ligado}>Mudar o ano</button></div>`
                   : `<b>${series[serie] || esc(serie)} ${ano}</b>`}</div></div>
        <span class="lbl">Seu piloto</span>
        <p class="mut mp-ajuda">Com a mesma idade, os dois começam na mesma categoria e dividem as corridas. Com idades diferentes, cada um começa na sua.</p>
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
      const dono = i => s.jogadores.find(j => escolhas[j.slot] === i);
      const series = { f1: 'Fórmula 1', indy: 'IndyCar' };
      const ligado = MP.con === 'conectado' ? '' : ' disabled';
      return `<span class="lbl">Campeonato</span>
        <div class="sv-item"><div class="sv-tx"><span class="sv-modo">Série e ano</span>
          ${souAnf ? `<div class="mp-vels">${Object.keys(series).map(k => `<button class="btn btn-sm ${k === sk ? 'btn-primary' : 'btn-ghost'}" onclick="MP.configurar({ sk: '${k}' })"${ligado}>${series[k]}</button>`).join('')}
              <input type="number" id="mpAno" min="1950" max="2026" value="${ano}" aria-label="Ano"> <button class="btn btn-ghost btn-sm" onclick="MP.configurar({ ano: +el('mpAno').value })"${ligado}>Mudar o ano</button></div>`
                   : `<b>${series[sk] || esc(sk)} ${ano}</b>`}</div></div>
        <span class="lbl">Equipes</span>
        <p class="mut mp-ajuda">Cada um escolhe a sua. As outras equipes do grid ficam com a inteligência do jogo.</p>
        <div class="mp-eqs">${lista.map(([i, t]) => { const d = dono(i), minha = !!d && d.slot === eu;
          return `<button class="sv-item mp-jog mp-eq${minha ? ' mp-sel' : ''}" onclick="MP.escolherEquipe(${i})"${(d && !minha) || MP.con !== 'conectado' ? ' disabled' : ''}>
            <span class="mp-cor" style="background:${esc(t.color || '#888')}" aria-hidden="true"></span>
            <span class="sv-tx"><b data-i18n-ignore>${esc(t.name)}</b>${d ? `<span class="sv-desc" data-i18n-ignore>${esc(d.nome)}</span>` : ''}</span></button>`; }).join('')}</div>`;
    },
    copiar(){
      const g = ler(); if(!g) return;
      const falhou = () => UI.toast('Não consegui copiar: o código está na tela.');
      try { navigator.clipboard.writeText(codigoBonito(g.codigo)).then(() => UI.toast('Código copiado.'), falhou); } catch(e){ falhou(); }
    },
    /* sair de verdade avisa o servidor (a vaga fica livre); sem conexão, só esquece aqui */
    async sair(certeza){
      if(!certeza) return MP.abrir('sair');
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
      MP.desenhar();
    },
    /* outra sala: a atual fica guardada, e a tela volta para criar ou entrar */
    outraSala(){ MP.soltar(); MP.abrirEntrada(); },
    /* volta para uma sala da lista */
    voltarSala(codigo){
      const g = lerLista().find(x => x.codigo === codigo); if(!g) return;
      MP.soltar(); gravar(g);
      MP.voce = { slot: g.slot }; MP.tentativas = 0; MP.falhas = 0;
      MP.conectar(); MP.abrir();
    },
    /* apaga uma sala deste aparelho (a atual sai de verdade, se a partida ainda não começou) */
    apagarSala(codigo, certeza){
      if(!certeza){ MP._apagar = codigo; return MP.abrirEntrada(); }
      MP._apagar = null;
      const g = ler();
      if(g && g.codigo === codigo) return MP.sair(true);
      gravarLista(lerLista().filter(x => x.codigo !== codigo));
      MP.abrirEntrada();
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
      UI.modal(UI.head(TITULO_SALA, s && s.modo === 'chefe' ? 'Teste: chefe de equipe com um amigo.'
        : s && s.modo === 'piloto' ? 'Teste: carreira de piloto com um amigo.'
        : 'Teste: por enquanto a sala junta os jogadores. As rodadas e as corridas chegam nas próximas etapas.') +
        `<div class="mbd sv mp">
          ${corpo}
          <span class="lbl">Código da sala</span>
          <div class="mp-codigo"><b data-i18n-ignore>${esc(codigoBonito(g.codigo))}</b><button class="btn btn-ghost btn-sm" onclick="MP.copiar()">Copiar código</button></div>
          <p class="mut mp-ajuda">Mande o código para o seu amigo: ele abre o Volante de Ouro, toca em Multiplayer e entra com o código.</p>
          <span class="lbl">Jogadores</span>
          ${s ? jog.map(cartao).join('') : '<p class="mut sv-vazio">Carregando a sala…</p>'}
          ${s && jog.length < 2 ? '<div class="sv-item mp-jog mp-vaga"><span class="mp-dot" aria-hidden="true"></span><div class="sv-tx"><span class="sv-desc">Esperando o segundo jogador…</span></div></div>' : ''}
          ${s ? `<span class="lbl">Partida</span>
          <div class="sv-item"><div class="sv-tx"><span class="sv-modo">Modo</span><b>${MODOS[s.modo] || s.modo}</b></div></div>
          <div class="sv-item"><div class="sv-tx"><span class="sv-modo">Velocidade das corridas</span>
            ${souAnf ? `<div class="mp-vels">${VELS.map(n => `<button class="btn btn-sm ${n === vel ? 'btn-primary' : 'btn-ghost'}" onclick="MP.velocidade(${n})"${MP.con === 'conectado' ? '' : ' disabled'}>${n}×</button>`).join('')}</div>`
                     : `<b>${vel}×</b>`}</div></div>` : ''}
          ${s && s.modo !== 'teste' ? `<div class="sv-item"><div class="sv-tx"><span class="sv-modo">Corridas</span>
            ${souAnf ? `<div class="mp-vels">${[[true, 'Ao vivo'], [false, 'Rápidas']].map(([v, n]) => `<button class="btn btn-sm ${(s.config.aoVivo !== false) === v ? 'btn-primary' : 'btn-ghost'}" onclick="MP.configurar({ aoVivo: ${v} })"${MP.con === 'conectado' ? '' : ' disabled'}>${n}</button>`).join('')}</div>`
                     : `<b>${s.config.aoVivo !== false ? 'Ao vivo' : 'Rápidas'}</b>`}
            <span class="sv-desc">${s.config.aoVivo !== false ? 'Os dois assistem e comandam a mesma corrida, no relógio da sala.' : 'A corrida é calculada na hora, sem transmissão.'}</span></div></div>` : ''}
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
        : 'Tome as suas decisões no seu ritmo. A rodada avança quando os dois estiverem prontos.';
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
    listaSalas(){
      const l = lerLista(); if(!l.length) return '';
      return `<span class="lbl">Suas salas</span>` + l.map(g => MP._apagar === g.codigo
        ? `<div class="sv-item sv-apagar"><div class="sv-tx"><b><span>Apagar esta sala?</span> <span data-i18n-ignore>${esc(codigoBonito(g.codigo))}</span></b><span class="sv-desc">Ela some deste aparelho. Se a partida ainda não começou, a vaga fica livre.</span></div>
            <div class="sv-bts"><button class="btn btn-ghost btn-sm" onclick="MP._apagar=null;MP.abrirEntrada()">Cancelar</button><button class="btn btn-primary btn-sm" onclick="MP.apagarSala('${g.codigo}', true)">Apagar</button></div></div>`
        : `<div class="sv-item"><div class="sv-tx"><b data-i18n-ignore>${esc(codigoBonito(g.codigo))}</b><span class="sv-desc">${g.modo ? `<span>${esc(MODOS[g.modo] || g.modo)}</span> · ` : ''}<span data-i18n-ignore>${esc(g.nome || '')}</span></span></div>
            <div class="sv-bts"><button class="btn btn-primary btn-sm" onclick="MP.voltarSala('${g.codigo}')">Abrir</button><button class="btn btn-ghost btn-sm" onclick="MP.apagarSala('${g.codigo}')">Apagar</button></div></div>`).join('');
    },
    abrirEntrada(){
      let nome = ''; try { nome = localStorage.getItem('vdo_mp_nome') || ''; } catch(e){}
      UI.modal(UI.head(TITULO_ENTRADA, 'Teste com um amigo: crie uma sala ou entre com o código que ele mandar.') +
        `<div class="mbd sv mp">
          <div class="field"><label class="lbl" for="mpNome">Seu nome</label><input type="text" id="mpNome" maxlength="24" autocomplete="off" value="${esc(nome)}"></div>
          <span class="lbl">Criar uma sala</span>
          <div class="mp-modos">
            <label class="sv-item"><input type="radio" name="mpModo" value="chefe" checked> <span>Chefe de equipe</span></label>
            <label class="sv-item"><input type="radio" name="mpModo" value="piloto"> <span>Carreira de piloto</span></label>
          </div>
          <button class="btn btn-primary mp-acao" onclick="MP.criar()">Criar sala</button>
          <span class="lbl">Entrar numa sala</span>
          <div class="field"><label class="lbl" for="mpCodigo">Código da sala</label><input type="text" id="mpCodigo" maxlength="9" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ABCD-EFGH" data-i18n-ignore></div>
          <button class="btn btn-contorno mp-acao" onclick="MP.entrar()">Entrar</button>
          <p class="mp-erro" id="mpErro" role="alert"></p>
          ${MP.listaSalas()}
          <p class="mut sv-uso">Identidade de teste: a sua vaga na sala fica guardada neste navegador. Limpar os dados do site faz você perder a vaga.</p>
        </div>
        <div class="mft"><span class="sp"></span><button class="btn btn-ghost" onclick="UI.close()">Fechar</button></div>`);
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
      .mp-barra{position:fixed;left:0;right:0;bottom:0;z-index:90;display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;
        padding:10px 16px;background:var(--s1);border-top:1px solid var(--line);font-size:14px}
      .mp-barra .mp-b-e{flex:1;min-width:160px;color:var(--soft)}
      .mp-barra .mp-dot{display:inline-block;vertical-align:middle}
      body.mp-com-barra{padding-bottom:64px}
      .ini-mp{margin-top:12px}`;
    document.head.appendChild(st);
    /* o botão fica fora do bloco "Continuar", que some quando o aparelho não tem save do jogo solo */
    const b = el('btnMP');
    if(b){
      b.hidden = false;
      const cont = b.closest('.ini-cont');
      if(cont && cont.parentNode){ const w = document.createElement('div'); w.className = 'ini-mp'; cont.parentNode.insertBefore(w, cont.nextSibling); w.appendChild(b); }
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
    if(ler()) MP.conectar(); else MP.desenhar();
    addEventListener('online', () => { if(ler() && !MP.ws) MP.tentarDeNovo(); });
    document.addEventListener('visibilitychange', () => { if(!document.hidden && ler() && !MP.ws && MP.con !== 'outra-aba') MP.tentarDeNovo(); });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
