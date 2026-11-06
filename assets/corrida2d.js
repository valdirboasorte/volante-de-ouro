/* Corrida interativa 2D: a porta de entrada (sempre carregada, pequena).
   O resto do modo (física, pista, IA, desenho) só é baixado quando alguém escolhe correr
   em 2D. Fica fora dos <script> embutidos: a versão do jogo (o hash do multiplayer) não
   muda. Para testar o protótipo: abra o jogo com ?pista2d=1 (opcional: &trk=br_int&ano=2024&sk=f1). */
(function(){
  const V = '20261106-c9a1';
  const MODULOS = ['nucleo', 'pista2d', 'carro2d', 'dano2d', 'ia2d', 'regras2d', 'entrada2d', 'arte2d', 'estilos2d', 'cenario2d', 'render2d', 'sessao2d', 'boxes2d', 'boost2d', 'assist2d', 'tela2d', 'carreira2d'];
  let carregando = null;

  function script(src){
    return new Promise((ok, falha) => {
      const s = document.createElement('script');
      s.src = src; s.async = false;
      s.onload = ok; s.onerror = () => falha(new Error('não carregou ' + src));
      document.head.appendChild(s);
    });
  }
  function estilo(href){
    if(document.querySelector('link[data-c2d]')) return;
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = href; l.dataset.c2d = '1';
    document.head.appendChild(l);
  }
  /* carrega o modo uma vez; as chamadas seguintes esperam a mesma carga */
  function carregar(){
    if(window.C2D && window.C2D.Tela) return Promise.resolve(window.C2D);
    if(carregando) return carregando;
    estilo('assets/corrida2d.css?v=' + V);
    carregando = MODULOS.reduce((p, m) => p.then(() => script('assets/corrida2d/' + m + '.js?v=' + V)), Promise.resolve())
      .then(() => window.C2D)
      .catch(e => { carregando = null; throw e; });
    return carregando;
  }

  window.Corrida2D = {
    V, carregar,
    /* treino livre sozinho (protótipo): { trkId, ano, sk, nivel, cor, nome, aoFim } */
    treino(opc){ return carregar().then(C2D => C2D.Tela.abrirTreino(opc)); },
    garagem(){ return carregar().then(C2D => C2D.Tela.garagem()); },
    /* corrida de teste contra a IA, fora da carreira: { trkId, ano, sk, rivais, voltas, nivelRivais } */
    corridaTeste(opc){
      return carregar().then(C2D => {
        const n = Math.max(1, Math.min(39, opc.rivais || 19));
        const cores = ['#e2231a', '#00a19c', '#ff8000', '#1e41ff', '#006f62', '#2b4562', '#900000', '#b6babd', '#64c4ff', '#52e252', '#6c3483', '#f5d000'];
        const nomes = ['Ayrton Moreira', 'Lewis Brandt', 'Max Halvorsen', 'Charles Duret', 'Lando Price', 'Oscar Whitley', 'George Kemp', 'Carlos Ibarra', 'Fernando Lozano', 'Pierre Gaudin',
                       'Esteban Roux', 'Yuki Mori', 'Alex Novak', 'Nico Stahl', 'Kevin Moller', 'Valtteri Laine', 'Zhou Wen', 'Logan Hart', 'Daniel Rourke', 'Sergio Pardo', 'Mick Bauer', 'Kimi Arola'];
        const ent = { carros: [] };
        const meu = Math.min(n + 1, opc.largada || Math.ceil((n + 1) / 2));
        let g = 1;
        for(let k = 0; k <= n; k++){
          const eu = g === meu;
          ent.carros.push({ id: eu ? 'ME' : 'r' + k, nome: eu ? 'Você' : nomes[k % nomes.length], cor: eu ? '#e2231a' : cores[k % cores.length], eq: eu ? 'Você' : 'Equipe ' + (k % 12), me: eu, grid: g, ritmo: 80 - g * .6, cons: 60 });
          g++;
        }
        const carros = C2D.Corrida.montarGrid(ent, { nivel: opc.nivelRivais || C2D.nivelPadrao(), voltas: opc.voltas || 3 });
        return C2D.Tela.abrirCorrida(Object.assign({ titulo: 'Corrida de teste', textoConcluir: 'Fechar' }, opc, { carros, voltas: opc.voltas || 3 }));
      });
    }
  };

  /* ═══ na carreira de piloto ═══
     Antes de cada sessão (treino, classificação, corrida) o jogador escolhe entre a
     simulação clássica e a corrida 2D; a preferência fica nos ajustes da carreira
     (S.opts.modoCorrida: 'perguntar', 'classica' ou '2d'). Sem o campo, o jogo pergunta;
     com "clássica", tudo fica exatamente como antes. Multiplayer, modo rápido e as
     estradas longas ficam sempre na clássica. */
  const C = window.Corrida2D;
  const NOMES = { perguntar: 'Perguntar', classica: 'Clássica', '2d': '2D' };
  const DIST = [[.1, 'Sprint (10%)'], [.2, 'Curta (20%)'], [.35, 'Média (35%)'], [.5, 'Longa (50%)'], [1, 'Completa (100%)']];
  const NIV = [['facil', 'Fácil'], ['medio', 'Médio'], ['dificil', 'Difícil'], ['lenda', 'Lenda']];
  const esc = t => String(t == null ? '' : t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const temS = () => typeof S !== 'undefined' && S && S.opts;
  C.modo = () => (temS() && S.opts.modoCorrida) || 'perguntar';
  C.rotuloModo = () => NOMES[C.modo()] || 'Perguntar';
  C.ajustes = () => {
    const o = temS() ? (S.opts.c2d || {}) : {};
    const padraoIA = (() => { const d = typeof Engine !== 'undefined' && Engine.difK ? Engine.difK() : 'equilibrado'; return d === 'tranquilo' ? 'facil' : d === 'realista' ? 'dificil' : 'medio'; })();
    return { dist: o.dist || .2, ia: o.ia || padraoIA };
  };
  C.disponivel = (trkId, ano) => {
    if(!temS() || S.opts.fast) return false;
    if(typeof Game !== 'undefined' && Game.emMP && Game.emMP()) return false;
    try { if(!document.createElement('canvas').getContext('2d')) return false; } catch(e){ return false; }
    try { const g = Pista.de(trkId, ano); return !!g && g.L <= 26000; } catch(e){ return false; }
  };
  /* a escolha antes da sessão */
  C.escolher = (sessao, info, classica, em2d) => {
    const m = C.modo();
    if(!C.disponivel(info.trkId, info.ano) || m === 'classica') return classica();
    if(m === '2d') return em2d();
    const aj = C.ajustes(), corrida = sessao === 'corrida';
    C._escolha = (k) => {
      const lembrar = document.getElementById('c2dLembrar');
      const dist = document.getElementById('c2dDist'), ia = document.getElementById('c2dIA');
      S.opts.c2d = Object.assign({}, S.opts.c2d || {}, { dist: dist ? +dist.value : aj.dist, ia: ia ? ia.value : aj.ia });
      if(lembrar && lembrar.checked) S.opts.modoCorrida = k;
      C._escolha = null;
      if(typeof Game !== 'undefined' && Game.save) Game.save();
      UI.close();
      (k === '2d' ? em2d : classica)();
    };
    const titulo = { treino: 'Treino livre', classificacao: 'Sessão de classificação', corrida: 'Corrida' }[sessao] || 'Sessão';
    UI.modal(UI.head('Como você quer correr?', '<span>' + esc(titulo) + '</span>' + (info.nome ? ' · <span>' + esc(info.nome) + '</span>' : ''), false) +
      `<div class="mbd">
        <button class="dil" onclick="Corrida2D._escolha('classica')"><b>Simulação clássica</b><span>A pista decide pela sua ficha e você comanda do muro, como sempre.</span></button>
        <button class="dil" onclick="Corrida2D._escolha('2d')"><b>Corrida interativa 2D</b><span>Você pilota, visto de cima: teclado, toque ou controle. A sua ficha deixa o carro mais fácil ou mais difícil de levar no limite.</span></button>
        <div class="c2d-esc-op" style="display:grid;gap:8px;margin-top:12px">
          ${corrida ? `<label style="display:flex;gap:10px;align-items:center;justify-content:space-between">Distância na 2D <select id="c2dDist" style="width:auto;flex:0 0 auto">${DIST.map(([v, n]) => `<option value="${v}"${v === aj.dist ? ' selected' : ''}>${n}</option>`).join('')}</select></label>` : ''}
          <label style="display:flex;gap:10px;align-items:center;justify-content:space-between">Rivais na pista <select id="c2dIA" style="width:auto;flex:0 0 auto">${NIV.map(([v, n]) => `<option value="${v}"${v === aj.ia ? ' selected' : ''}>${n}</option>`).join('')}</select></label>
          <label style="display:flex;gap:10px;align-items:center"><input type="checkbox" id="c2dLembrar"> Usar sempre esta escolha (dá para mudar em Corrida, nos ajustes)</label>
        </div>
      </div>`);
  };
  /* o botão dos ajustes da carreira: Perguntar → Clássica → 2D */
  C.trocarModo = () => {
    if(!temS()) return;
    const ord = ['perguntar', 'classica', '2d'], m = C.modo();
    S.opts.modoCorrida = ord[(ord.indexOf(m) + 1) % ord.length];
    if(typeof Game !== 'undefined' && Game.save) Game.save();
    if(typeof UI !== 'undefined'){ if(UI.render) UI.render(); if(UI.toast) UI.toast({ perguntar: 'Antes de cada sessão o jogo pergunta: clássica ou 2D.', classica: 'Todas as sessões na simulação clássica.', '2d': 'Todas as sessões na corrida interativa 2D.' }[S.opts.modoCorrida]); }
  };

  /* as montagens da corrida que o motor fez por último (para tirar do resumo o erro
     sorteado para o jogador: na 2D quem decide se ele erra é ele) */
  const montagens = [];
  C._montagens = montagens;
  function instalar(){
    if(typeof AoVivo === 'undefined' || typeof Game === 'undefined' || typeof Engine === 'undefined' || AoVivo.__c2d) return;
    AoVivo.__c2d = true;
    const montOrig = Engine.montarCorrida;
    Engine.montarCorrida = function(){ const M = montOrig.apply(this, arguments); montagens.push(M); if(montagens.length > 4) montagens.shift(); return M; };
    const abrirOrig = AoVivo.abrir;
    AoVivo.abrir = function(ent, opc, aoFim){
      const classica = () => abrirOrig.call(AoVivo, ent, opc, aoFim);
      if(!ent || (opc && opc.chefe)) return classica();
      const M = montagens.slice().reverse().find(m => m && m.trk && m.trk.id === ent.trkId && m.rd + 1 === ent.r) || null;
      C.escolher('corrida', { trkId: ent.trkId, ano: ent.ano, nome: ent.gp ? 'GP ' + ent.gp : '' }, classica,
        () => carregar().then(C2D => C2D.Carreira.corrida(ent, opc, aoFim, M)).catch(e => { console.error(e); classica(); }));
    };
    const quaOrig = Game.fazerQuali;
    Game.fazerQuali = function(janela){
      if(Game.emMP && Game.emMP()) return quaOrig.apply(Game, arguments);
      const sea = S.season, trk = sea && sea.calendar[sea.round];
      if(!trk) return quaOrig.apply(Game, arguments);
      C.escolher('classificacao', { trkId: trk.id, ano: sea.year, nome: 'GP ' + trk.gp }, () => quaOrig.call(Game, janela),
        () => carregar().then(C2D => C2D.Carreira.quali(janela, quaOrig)).catch(e => { console.error(e); quaOrig.call(Game, janela); }));
    };
    const treOrig = Game.fazerTreino;
    Game.fazerTreino = function(k){
      const sea = S.season, trk = sea && sea.calendar[sea.round];
      if(!trk || (Game.emMP && Game.emMP())) return treOrig.apply(Game, arguments);
      C.escolher('treino', { trkId: trk.id, ano: sea.year, nome: 'GP ' + trk.gp }, () => treOrig.call(Game, k),
        () => carregar().then(C2D => C2D.Carreira.treino(k, treOrig)).catch(e => { console.error(e); treOrig.call(Game, k); }));
    };
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', instalar); else instalar();
  window.addEventListener('load', instalar);

  /* entrada de teste: ?pista2d=1 abre o protótipo direto */
  try {
    const q = new URLSearchParams(location.search);
    if(q.has('pista2d')){
      const base = { trkId: q.get('trk') || 'br_int', ano: +(q.get('ano') || 2024), sk: q.get('sk') || 'f1', nivel: +(q.get('nivel') || 0), cat: q.get('cat') || null };
      const abrir = () => q.has('garagem') ? window.Corrida2D.garagem() : (q.has('rivais')
        ? window.Corrida2D.corridaTeste(Object.assign(base, { rivais: +q.get('rivais'), voltas: +(q.get('voltas') || 3), nivelRivais: q.get('ia') || null, largada: +(q.get('largada') || 0) || null }))
        : window.Corrida2D.treino(base)).catch(e => console.error(e));
      if(document.readyState === 'complete') setTimeout(abrir, 300); else window.addEventListener('load', () => setTimeout(abrir, 300));
    }
  } catch(e){}
})();
