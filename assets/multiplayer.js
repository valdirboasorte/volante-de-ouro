/* Multiplayer, Fase 1: as salas.
   Cria uma sala ou entra com o código de um amigo, mostra quem está nela e se está
   conectado, e volta sozinho para a sala depois de uma queda ou de fechar o jogo.
   As rodadas e as corridas chegam nas próximas fases. O servidor (pasta multiplayer/)
   é a autoridade: esta página só faz pedidos e mostra o que ele responde.

   A ficha que identifica o jogador fica no localStorage (vdo_mp). É uma identidade de
   teste, não uma conta: quem tiver a ficha ocupa a vaga, e limpar os dados do site a
   perde. Por enquanto o botão só aparece com o servidor local (127.0.0.1); em outra
   origem, só quando VDO_MP_SERVIDOR for definido.
   Para testar dois jogadores no mesmo navegador: ?mpperfil=2 usa outra ficha. */
(function(){
  'use strict';
  const local = /^(127\.0\.0\.1|localhost)$/.test(location.hostname);
  const SERVIDOR = local ? 'http://127.0.0.1:8787' : String(window.VDO_MP_SERVIDOR || '');
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
    interno: 'O servidor não conseguiu aplicar essa decisão.'
  };
  const TELAS = new Set([TITULO_SALA, 'Partida multiplayer', 'Resultado da rodada']);
  const erroTxt = c => ERROS[c] || ERROS.servidor;

  function ler(){ try { const g = JSON.parse(localStorage.getItem(CHAVE) || 'null'); return g && g.codigo && /^[0-9a-f]{64}$/.test(g.ficha) ? g : null; } catch(e){ return null; } }
  function gravar(g){ try { if(g) localStorage.setItem(CHAVE, JSON.stringify(g)); else localStorage.removeItem(CHAVE); } catch(e){} }
  const codigoBonito = c => String(c || '').replace(/^(.{4})(.{4})$/, '$1-$2');
  const id = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random());

  const MP = {
    /* fora | conectando | conectado | reconectando | outra-aba | perdida */
    con: 'fora', sala: null, voce: null, v: -1, ws: null, tentativas: 0, falhas: 0, _pend: {}, versao: null,

    disponivel(){ return !!SERVIDOR && typeof WebSocket === 'function' && !!(window.crypto && crypto.subtle); },

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
      } else if(m.t === 'jogadores'){
        if(MP.sala && Array.isArray(m.jogadores)) MP.sala.jogadores = m.jogadores;
      } else if(m.t === 'vista'){
        /* o que só este jogador vê (as decisões dele); chega depois de cada mudança */
        if(typeof m.v === 'number' && m.v < (MP.vVista || -1)) return;
        MP.vVista = typeof m.v === 'number' ? m.v : MP.vVista; MP.vista = m.vista || null;
        if(MP._chefe && MP.vista && MP.vista.C) return MP.aplicarChefe();
      } else if(m.t === 'rodada'){
        /* a rodada foi processada: o resultado oficial, igual para os dois */
        if(MP.sala && MP.sala.partida) MP.sala.partida.ultimo = { rodada: m.rodada, resultado: m.resultado };
        /* no chefe, o que aconteceu aparece nas telas do próprio jogo, com a equipe já atualizada */
        if(MP.sala && MP.sala.partida && MP.sala.partida.regras === 'chefe'){ MP._rodadaNova = m.resultado || {}; return; }
        const m2 = el('modal');
        if(UI.aberta() && m2 && TELAS.has(m2.dataset.titulo)) MP._verResultado = true;
        else { MP._verResultado = true; UI.toast('Rodada processada.'); }
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
    chefeAtivo(){ return !!MP._chefe && !!(MP.sala && MP.sala.partida && MP.sala.partida.regras === 'chefe'); },
    entrarChefe(){
      if(!MP.vista || !MP.vista.C) return MP.abrirPartida();
      MP._chefe = true;
      C = MP.vista.C;
      UIC._M = null; UIC.pag = 'visao';
      UI.limparFila(); UI.close(); UI.show('chefe'); UIC.render();
      MP.barra();
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
      C = MP.vista.C;
      UIC.render();
      MP.barra();
      const depois = MP._aposVista, nova = MP._rodadaNova;
      MP._aposVista = null; MP._rodadaNova = null;
      if(depois){ try { depois(); } catch(e){ console.error(e); } }
      if(nova) MP.mostrarRodada(nova);
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
      if(!MP._chefe) return;
      const s = MP.sala, p = s && s.partida; if(!p) return;
      let b = el('mpBarra');
      if(!b){ b = document.createElement('div'); b.id = 'mpBarra'; b.className = 'mp mp-barra'; document.body.appendChild(b); document.body.classList.add('mp-com-barra'); }
      const eu = MP.voce ? MP.voce.slot : (ler() || {}).slot;
      const pronto = slot => !!(p.prontos && p.prontos[slot]);
      const outros = s.jogadores.filter(j => j.slot !== eu);
      const souPronto = pronto(eu), outrosProntos = outros.every(j => pronto(j.slot)), proc = p.estado === 'processing';
      const fase = { inverno: 'pré-temporada', temporada: 'temporada', balanco: 'balanço do ano' }[MP.vista && MP.vista.fase] || '';
      const sea = typeof C !== 'undefined' && C && C.temporada, prox = MP.vista && MP.vista.fase === 'temporada' && sea && sea.calendar[sea.round];
      const estado = proc ? 'Processando a rodada…' : souPronto && !outrosProntos ? 'Aguardando o adversário…'
        : !souPronto && outrosProntos ? 'O adversário já está pronto.' : 'Tome as suas decisões no seu ritmo.';
      b.innerHTML = `<span class="mp-b-t"><b>Multiplayer</b> · <span>Rodada</span> ${p.rodada}${fase ? ` · <span>${fase}</span>` : ''}${prox ? ` · <span>GP ${esc(prox.gp)}</span>` : ''}</span>
        <span class="mp-b-e" role="status">${estado}</span>
        <span class="mp-b-j">${outros.map(j => `<span class="mp-dot${j.conectado ? ' on' : ''}" aria-hidden="true"></span> <span data-i18n-ignore>${esc(j.nome)}</span>: <span>${pronto(j.slot) ? 'pronto' : 'decidindo'}</span>`).join(' ')}</span>
        ${souPronto ? `<button class="btn btn-ghost btn-sm" onclick="MP.pronto(false)"${proc ? ' disabled' : ''}>Cancelar prontidão</button>`
                    : `<button class="btn btn-primary btn-sm" onclick="MP.chefePronto()"${proc || MP.con !== 'conectado' ? ' disabled' : ''}>Pronto para avançar</button>`}
        <button class="btn btn-ghost btn-sm" onclick="MP.abrirPartida()">Sala</button>`;
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
      MP._saindo = true; clearTimeout(MP._volta); clearInterval(MP._ping);
      if(MP.ws){ try { MP.ws.close(1000, 'saiu'); } catch(e){} }
      MP.ws = null; gravar(null);
      MP.sala = null; MP.voce = null; MP.v = -1; MP.con = 'fora'; MP._saindo = false;
      MP.desenhar(); MP.abrir();
    },

    /* ── a tela ── */
    desenhar(){
      const g = ler(), d = el('mpDesc');
      const p = MP.sala && MP.sala.partida;
      if(d) d.innerHTML = g ? `<span>Sala</span> <span data-i18n-ignore>${esc(codigoBonito(g.codigo))}</span>${p ? ` · <span>rodada</span> ${p.rodada}` : ''} · <span>${MP.textoConexao()}</span>`
                            : '<span>Sala com um amigo</span> · <span>teste</span>';
      const m = el('modal');
      if(UI.aberta() && m && TELAS.has(m.dataset.titulo)) MP.abrir(MP._tela);
      if(MP._chefe) MP.barra();
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
      UI.modal(UI.head(TITULO_SALA, s && s.modo === 'chefe' ? 'Teste: chefe de equipe com um amigo. As corridas ao vivo chegam na próxima etapa.'
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
          ${s && s.modo === 'chefe' ? MP.configChefe(s, souAnf, eu) : ''}
          ${MP.linhaConexao()}
        </div>
        <div class="mft"><button class="btn btn-ghost" onclick="MP.sair()">Sair da sala</button><span class="sp"></span>
          ${souAnf ? `<button class="btn btn-primary" onclick="MP.iniciar()"${jog.length >= 2 && MP.con === 'conectado' && (s.modo !== 'chefe' || jog.every(j => (s.config.equipes || {})[j.slot] != null)) ? '' : ' disabled'}>Iniciar partida</button>` : ''}
          <button class="btn btn-ghost" onclick="UI.close()">Fechar</button></div>`);
    },
    /* a rodada de gerenciamento: cada um decide no seu ritmo e confirma quando estiver pronto */
    abrirPartida(){
      if(MP.sala && MP.sala.partida && MP.sala.partida.regras === 'chefe') return MP.abrirPartidaChefe();
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
      const jog = s.jogadores.slice().sort((a, b) => a.slot - b.slot);
      const pronto = slot => !!(p.prontos && p.prontos[slot]);
      const cartao = j => `<div class="sv-item mp-jog"><span class="mp-dot${j.conectado ? ' on' : ''}" aria-hidden="true"></span>
        <div class="sv-tx"><b data-i18n-ignore>${esc(j.nome)}</b><span class="sv-desc"><span>${pronto(j.slot) ? 'pronto' : 'decidindo'}</span>${j.conectado ? '' : ' · <span>desconectado</span>'}${j.slot === eu ? ' · <span>você</span>' : ''}</span></div></div>`;
      UI.modal(UI.head('Partida multiplayer', `<span>Rodada</span> ${p.rodada}`) +
        `<div class="mbd sv mp">
          <p class="mp-estado${p.estado === 'processing' ? ' mp-proc' : ''}" role="status">${p.estado === 'processing' ? 'Processando a rodada…' : 'Tome as suas decisões no seu ritmo. A rodada avança quando os dois estiverem prontos.'}</p>
          <span class="lbl">Jogadores</span>${jog.map(cartao).join('')}
          ${MP.vista && MP.vista.C ? '' : '<p class="mut sv-vazio">Carregando a sua equipe…</p>'}
          ${MP.linhaConexao()}
        </div>
        <div class="mft"><button class="btn btn-ghost" onclick="UI.close()">Fechar</button><span class="sp"></span>
          <button class="btn btn-primary" onclick="MP.entrarChefe()"${MP.vista && MP.vista.C ? '' : ' disabled'}>Ir para a minha equipe</button></div>`);
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
      .mp-barra{position:fixed;left:0;right:0;bottom:0;z-index:90;display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;
        padding:10px 16px;background:var(--s1);border-top:1px solid var(--line);font-size:14px}
      .mp-barra .mp-b-e{flex:1;min-width:160px;color:var(--soft)}
      .mp-barra .mp-dot{display:inline-block;vertical-align:middle}
      body.mp-com-barra{padding-bottom:64px}`;
    document.head.appendChild(st);
    const b = el('btnMP'); if(b) b.hidden = false;
    if(ler()) MP.conectar(); else MP.desenhar();
    addEventListener('online', () => { if(ler() && !MP.ws) MP.tentarDeNovo(); });
    document.addEventListener('visibilitychange', () => { if(!document.hidden && ler() && !MP.ws && MP.con !== 'outra-aba') MP.tentarDeNovo(); });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
