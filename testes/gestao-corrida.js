/* Manager 2.0, fase 1: o motor de corrida com o muro gerenciando (modo chefe).
   — a mesma semente dá o mesmo resultado a 1×, 2×, 4× e 16×, rodando o quadro da
     transmissão de verdade, com a ordem do nº 1 ligada;
   — o modo piloto continua igual: sem gestão, nada de risco por volta, IA nem mistura;
   — quatro ritmos: o ataque máximo é mais rápido, gasta mais pneu e quebra mais;
     conservar é o contrário;
   — a gestão de pneus é separada do ritmo: cuidar gasta menos e anda menos;
   — combustível e energia só onde a regra existia (F1 1984–88, F1 desde 2014,
     Fórmula E desde 2018); na era turbo quem anda rico demais fica sem gasolina;
     na F1 híbrida o piloto tira o pé e chega;
   — a IA muda de ritmo durante a corrida, com um jeito fixo por equipe;
   — "manter posições" impede a disputa entre os seus carros;
   — ninguém tem a quebra marcada antes da largada: o risco vive na pista.
   Uso: node testes/gestao-corrida.js   Não modifica arquivos nem saves. */
const H = require('./base');
let falhas = 0, n = 0;
const ok = (c, m) => { n++; if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };

function equipe(seed, sk, ano, pos){
  const J = H.carregar({ silencioso: true, seed });
  J.run(require('./chefe-comum'));
  J.run(`(() => { const l = eraOfSeries(${ano}, '${sk}').teams.map((t, i) => [i, Engine.resolveTeam(t, i, ${ano}, '${sk}')]).filter(x => x[1]).sort((a, b) => b[1].str - a[1].str);
    Chefe.novo({ chefe:{ nome:'T', cc:'BR' }, realismo:true, eq:{ nome:'Equipe Teste', cor:'#123456', cc:'GB' }, modo:'assumir', sk:'${sk}', ano:${ano}, idx:l[Math.min(l.length - 1, ${pos})][0] });
    __inverno(); Chefe.comecarTemporada(); UI.limparFila(); UI.close();
    globalThis._montar = (gestao, seed) => { const sea = C.temporada; Chefe.gridDaEtapa(sea); const M = Chefe.montar();
      const ent = Gp.entrada(sea, M, Chefe.sk(), sea.ano, f => f.teamId === 'EU', gestao ? { gestao: true, seed } : { seed });
      return { M, ent }; };
  })()`);
  return J;
}

/* 1. a mesma semente em qualquer velocidade */
{
  const J = equipe(23, 'f1', 2024, 4);
  J.run(`globalThis.requestAnimationFrame = () => 0;
    (() => { const { ent } = _montar(true, 4242); globalThis._ent = ent;
      ent.n1 = ent.carros.filter(c => c.ctrl).sort((a, b) => b.grid - a.grid)[0].id; })()`);
  const rodar = vel => J.run(`(() => {
    const R = Gp.criar(JSON.parse(JSON.stringify(_ent)));
    AoVivo.R = R; AoVivo.carrosEl = []; AoVivo.pausa = false; AoVivo._largada = false; AoVivo.alvo = null; AoVivo.vel = ${vel};
    AoVivo.opc = {}; AoVivo.acabou = false; AoVivo.radio = () => {}; AoVivo.bandeirada = () => { AoVivo.acabou = true; };
    let ts = 1000; AoVivo.ult = ts; let q = 0, mandou = false;
    while(!R.fim && q++ < 3e6){ ts += 1000 / 60; if(R.pergunta) Gp.responder(R, R.pergunta.padrao);
      R.carros.forEach(s => { if(s.c.ctrl && s.sugestao && !s.parar && s.estado === 0) Gp.comandar(R, s.i, { parar: s.sugestao.c }); });
      /* uma ordem dada pelo jogador num instante de prova fixo */
      if(!mandou && R.t >= 1200){ mandou = true; const s = R.carros.find(x => x.c.ctrl && x.estado === 0); if(s) Gp.comandar(R, s.i, { modo: 'atacar', trato: 'cuidar' }); }
      AoVivo.quadro(ts); }
    const res = Gp.resultado(R);
    return res.ordem.map(o => o.id + ':' + (o.fim == null ? 'x' + o.voltas : o.fim.toFixed(3))).join('|') + '#' + JSON.stringify(R.ordemEquipe || null) + '#' + R.eventos.length; })()`);
  const base = rodar(16);
  const vs = [1, 2, 4].map(v => [v, rodar(v)]);
  ok(vs.every(([, x]) => x === base), 'mesma semente, mesmas ordens: o resultado é idêntico a 1×, 2×, 4× e 16× (' + vs.map(([v, x]) => v + '× ' + (x === base ? 'igual' : 'diferente')).join(', ') + ')');
}

/* 2. o modo piloto não muda: sem gestão, nada novo entra na corrida */
{
  const J = equipe(5, 'f1', 2016, 3);
  const r = J.run(`(() => { const { ent } = _montar(false, 77); const R = Gp.criar(ent);
    return { gestao: ent.gestao, novos: R.carros.some(s => s.trato || s.risco || s.ia || s.carga != null || s.mistura),
      modos: Gp.modosDe(R).join(','), maximo: Gp.comandar(R, R.carros[0].i, { modo: 'maximo' }) === undefined && R.carros[0].modo !== 'maximo' }; })()`);
  ok(!r.gestao && !r.novos, 'sem gestão (modo piloto), nenhum carro tem risco por volta, IA de ritmo, trato de pneu ou mistura');
  ok(r.modos === 'poupar,normal,atacar' && r.maximo, 'no modo piloto continuam os três ritmos; o ataque máximo é só do muro que gerencia');
}

/* 3. os ritmos e a gestão de pneus, do mesmo ponto da corrida */
{
  const J = equipe(9, 'f1', 2016, 3);
  const r = J.run(`(() => {
    const { ent } = _montar(true, 99);
    ent.carros.forEach(c => { c.fora = null; c.risco = null; c.erro = false; });
    ent.wet = false;
    const base = Gp.criar(JSON.parse(JSON.stringify(ent)));
    /* corre só o carro escolhido, sozinho na pista, para medir ritmo e desgaste */
    const medir = (modo, trato) => {
      const R = Gp.criar(JSON.parse(JSON.stringify(ent)));
      R.clima.fases = [[0, 0]]; R.w = 0;
      R.carros.forEach(s => { if(s.i !== 0){ s.estado = 3; s.s = -1e6; } });
      const s = R.carros[0]; s.ia = null; s.auto = false; s.modo = modo; s.trato = trato; s.plano = []; s.risco = null; s.erroVolta = null;
      const rnd = R.rnd; R.rnd = () => .999;
      while(s.voltas < 8 && R.t < 4000) Gp.passo(R);
      R.rnd = rnd;
      return { t: s.cruz[s.cruz.length - 1] - s.cruz[1], gasto: s.pneu.gasto };
    };
    return { con: medir('poupar', 'normal'), eq: medir('normal', 'normal'), at: medir('atacar', 'normal'), max: medir('maximo', 'normal'),
             cuidar: medir('normal', 'cuidar'), forcar: medir('normal', 'forcar'),
             motor: ['poupar', 'normal', 'atacar', 'maximo'].map(k => Gp.MODOS[k].motor) }; })()`);
  ok(r.max.t < r.at.t && r.at.t < r.eq.t && r.eq.t < r.con.t, `mais ataque, menos tempo em 7 voltas: máximo ${r.max.t.toFixed(1)} s < atacar ${r.at.t.toFixed(1)} < equilibrado ${r.eq.t.toFixed(1)} < conservar ${r.con.t.toFixed(1)}`);
  ok(r.max.gasto > r.at.gasto && r.at.gasto > r.eq.gasto && r.eq.gasto > r.con.gasto, `e mais pneu gasto: ${[r.max, r.at, r.eq, r.con].map(x => Math.round(x.gasto * 100) + '%').join(' > ')}`);
  ok(r.motor[3] > r.motor[2] && r.motor[2] > r.motor[1] && r.motor[1] > r.motor[0], 'o castigo no motor cresce com o ritmo (risco de quebra por volta)');
  ok(r.cuidar.gasto < r.eq.gasto * .85 && r.cuidar.t > r.eq.t, `cuidar do pneu: ${Math.round(r.cuidar.gasto * 100)}% contra ${Math.round(r.eq.gasto * 100)}%, ${(r.cuidar.t - r.eq.t).toFixed(1)} s mais lento`);
  ok(r.forcar.gasto > r.eq.gasto && r.forcar.t < r.eq.t, 'forçar o pneu: mais rápido e gasta mais');
}

/* 4. risco vivo: o ritmo muda a chance de quebrar a cada volta */
{
  const J = equipe(9, 'f1', 1986, 3);
  const r = J.run(`(() => {
    const { ent } = _montar(true, 12);
    const fora = ent.carros.filter(c => c.fora).length, comRisco = ent.carros.filter(c => c.risco && c.risco.mec > 0).length;
    const tenta = (modo, x) => { const R = Gp.criar(JSON.parse(JSON.stringify(ent))); const s = R.carros[0];
      s.modo = modo; s.ia = null; s.auto = false; s.voltas = 5; s.fora = null; s.erroVolta = null; s.risco = { mec: .1, acid: 0 };
      R.rnd = () => x; Gp.porVolta(R, s, false); return !!(s.fora && s.fora.tipo === 'MEC'); };
    return { fora, comRisco, total: ent.carros.length,
      /* risco de 10% na volta: com o sorteio 0,2 o máximo (×2,5) quebra e o equilibrado não; com 0,06, o equilibrado quebra e o conservar (×0,55) não */
      max: tenta('maximo', .2), eq: tenta('normal', .2), con: tenta('poupar', .06), eq2: tenta('normal', .06) }; })()`);
  ok(r.fora === 0 && r.comRisco === r.total, `ninguém larga com a quebra marcada; os ${r.total} carros levam o risco para a pista`);
  ok(r.max && !r.eq && !r.con && r.eq2, 'com o mesmo sorteio, o ataque máximo quebra onde o equilibrado aguenta, e o conservar aguenta onde o equilibrado quebra');
}

/* 5. combustível e energia, só onde a regra existia */
{
  const J = H.carregar({ silencioso: true });
  const r = J.run(`(() => { const est = { parado: 3, limite: 22, paradas: 1 };
    const e = (sk, ano, nivel) => { const g = Gp.regras(sk, ano, nivel || 0, false, false, est, 60).energia; return g ? g.tipo + (g.pane ? '+pane' : '') : '-'; };
    return { f1_1983: e('f1', 1983), f1_1984: e('f1', 1984), f1_1988: e('f1', 1988), f1_1989: e('f1', 1989), f1_2005: e('f1', 2005), f1_2012: e('f1', 2012),
      f1_2014: e('f1', 2014), f1_2024: e('f1', 2024), f2_2024: e('f1', 2024, 1), fe_2016: e('fe', 2016), fe_2020: e('fe', 2020), indy: e('indy', 2020), nascar: e('nascar', 2020) }; })()`);
  ok(r.f1_1983 === '-' && r.f1_1984 === 'comb+pane' && r.f1_1988 === 'comb+pane' && r.f1_1989 === '-', 'F1: limite de combustível de 1984 a 1988 (era turbo), e não antes nem depois');
  ok(r.f1_2005 === '-' && r.f1_2012 === '-' && r.f1_2014 === 'comb' && r.f1_2024 === 'comb', 'F1: com reabastecimento ou sem limite, nada; desde 2014, combustível e energia contados');
  ok(r.f2_2024 === '-' && r.fe_2016 === '-' && r.fe_2020 === 'bateria' && r.indy === '-' && r.nascar === '-', 'Fórmula E desde 2018 (bateria); F2, IndyCar e NASCAR sem limite de corrida');
}
{
  /* era turbo: rico e no ataque máximo a corrida inteira, o tanque seca; F1 híbrida: o piloto economiza e chega */
  const seca = (ano, pos) => {
    const J = equipe(31, 'f1', ano, pos);
    return J.run(`(() => { const { ent } = _montar(true, 55); ent.wet = false;
      ent.carros.forEach(c => { c.risco = null; c.erro = false; });
      const R = Gp.criar(ent); R.clima.fases = [[0, 0]]; R.w = 0; R.sc = { fim: true }; R.regras.scProb = 0; R.regras.vscProb = 0;
      const s = R.carros.find(x => x.c.ctrl); s.ia = null; s.auto = false;
      /* só o combustível decide: sem batida nem quebra sorteadas para este carro */
      const mandar = () => { s.fora = null; if(s.estado === 0){ s.modo = 'maximo'; s.mistura = 'rica'; s.trato = 'normal'; } };
      while(!R.fim){ mandar(); if(R.pergunta) Gp.responder(R, R.pergunta.padrao);
        if(s.sugestao && !s.parar && s.estado === 0) Gp.comandar(R, s.i, { parar: s.sugestao.c });
        Gp.passo(R); }
      const ia = R.carros.filter(x => !x.c.ctrl && x.estado === 4 && x.carga != null);
      return { motivo: (R.eventos.find(e => e.tipo === 'quebra' && e.a === s.i) || {}).motivo || null, estado: s.estado, economia: s.economiaVoltas || 0,
        iaChegou: ia.length, iaSeca: R.eventos.filter(e => e.tipo === 'quebra' && /sem combust/.test(e.motivo || '') && !R.carros[e.a].c.ctrl).length }; })()`);
  };
  const t = seca(1986, 3), h = seca(2016, 3);
  ok(t.estado === 3 && t.motivo === 'sem combustível', `F1 1986: rico e no máximo a corrida inteira, o carro fica sem combustível (${t.motivo || 'chegou'})`);
  ok(h.estado === 4, 'F1 2016: na mesma ordem, o piloto tira o pé quando falta e chega ao fim');
  ok(t.iaChegou > 5 && h.iaChegou > 5, `a IA administra o combustível e chega (${t.iaChegou} carros em 1986, ${h.iaChegou} em 2016)`);
}

/* 6. a IA muda de ritmo e tem um jeito por equipe; "manter posições" segura os seus */
{
  const J = equipe(13, 'f1', 2024, 4);
  const r = J.run(`(() => { const { ent } = _montar(true, 321);
    const R = Gp.criar(ent); R.ordemEq = 'manter';
    const nossos = new Set(R.carros.filter(s => s.c.ctrl).map(s => s.i));
    Gp.terminar(R);
    const ia = R.carros.filter(s => !s.c.ctrl);
    const usou = ia.filter(s => s.modosUsados.size > 1).length;
    const p1 = Gp.personalidade('Ferrari'), p2 = Gp.personalidade('Ferrari'), p3 = Gp.personalidade('Williams');
    const brigaInterna = R.eventos.filter(e => e.tipo === 'ultrapassagem' && nossos.has(e.a) && nossos.has(e.b)).length;
    return { usou, n: ia.length, mesmoJeito: p1.agr === p2.agr && p1.cuidado === p2.cuidado, jeitos: p1.agr !== p3.agr, brigaInterna,
      undercut: R.eventos.filter(e => e.tipo === 'boxes').length }; })()`);
  ok(r.usou >= r.n / 3, `a IA muda de ritmo durante a corrida (${r.usou} de ${r.n} carros usaram mais de um)`);
  ok(r.mesmoJeito && r.jeitos, 'o jeito de cada muro é fixo pela equipe e muda de uma equipe para outra');
  ok(r.brigaInterna === 0, 'com "manter posições", os seus carros não se ultrapassam');
}

/* 7. a ordem do nº 1 sai dentro da simulação, sem depender da tela */
{
  const J = equipe(17, 'f1', 2024, 1);
  const r = J.run(`(() => { const { ent } = _montar(true, 808);
    const nossos = ent.carros.filter(c => c.ctrl).sort((a, b) => a.grid - b.grid);
    /* o nº 1 larga logo atrás do companheiro e é mais rápido */
    const [fr, tr] = nossos; tr.grid = fr.grid + .5; tr.ritmo = fr.ritmo + 6; ent.n1 = tr.id;
    ent.carros.forEach(c => { c.risco = null; c.erro = false; });
    const R = Gp.criar(ent);
    while(!R.fim && !R.ordemEquipe && R.t < 1500){ if(R.pergunta) Gp.responder(R, R.pergunta.padrao); Gp.passo(R); }
    return { ordem: R.ordemEquipe, n1: tr.id }; })()`);
  ok(r.ordem && r.ordem.pelo === r.n1, 'favorecer o nº 1: o companheiro abre passagem quando está colado à frente, decidido no passo da simulação');
}

console.log(falhas ? falhas + ' falha(s) de ' + n : `motor com o muro gerenciando: ${n} verificações, tudo certo`);
if(falhas) process.exitCode = 1;
