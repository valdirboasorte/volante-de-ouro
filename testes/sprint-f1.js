/* As sprints da Fórmula 1, como em cada ano desde 2021:
   — as etapas de cada temporada (2021: Silverstone, Monza, Interlagos; 2023: seis);
   — 2021-2022: a classificação dá o grid da sprint e a chegada da sprint dá o grid do GP;
     desde 2023: o GP larga pela classificação e a sprint pela sessão dela;
   — 3-2-1 em 2021 e 8-7-6-5-4-3-2-1 depois; a sprint não conta como GP;
   — no modo chefe, a sprint não repete operação, patrocínio e salários: o ano paga o mesmo;
   — antes de 2021, a F1 não tem sprint.
   Uso: node testes/sprint-f1.js   Não modifica arquivos nem saves. */
const H = require('./base');
let falhas = 0, n = 0;
const ok = (c, m) => { n++; if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };

/* o calendário */
const J = H.carregar({ silencioso: true, seed: 13 });
const cal = ano => J.run(`calendarioSprintF1(calendarFor(${ano}, 'f1'), ${ano}, (id, i) => ({ r: i + 1, id, gp: (TRACKS[id] || {}).gp }))
  .map(t => ({ id: t.id, r: t.r, s: !!t.sprintF1, g: t.gridRegra, p: t.pts ? t.pts.p.join('-') : null, semPole: !!t.semPole }))`);
const c21 = cal(2021), c23 = cal(2023), c20 = cal(2020);
ok(c21.filter(t => t.s).map(t => t.id).join() === 'gb,it,br_int', '2021: sprints em Silverstone, Monza e Interlagos');
ok(c23.filter(t => t.s).length === 6 && c23.filter(t => !t.s).length === 22, '2023: seis sprints e os 22 GPs');
ok(!c20.some(t => t.s), '2020: nenhuma sprint');
const i21 = c21.findIndex(t => t.s);
ok(c21[i21].g === 'quali' && c21[i21 + 1].g === 'chegada' && c21[i21].p === '3-2-1', '2021: sprint pela classificação (3-2-1), GP pela chegada da sprint');
const i23 = c23.findIndex(t => t.s);
ok(c23[i23].g === 'nova' && c23[i23 + 1].g === 'quali' && c23[i23].p === '8-7-6-5-4-3-2-1', '2023: sprint com sessão própria (8 a 1), GP pela classificação');
ok(c21[i21].r === c21[i21 + 1].r, 'a sprint leva o número da etapa do GP dela');
const c22 = cal(2022), i22 = c22.findIndex(t => t.s);
ok(!c22[i22].semPole && c22[i22 + 1].semPole && c21[i21].semPole && !c21[i21 + 1].semPole, 'pole oficial: do GP em 2021 (vencedor da sprint), da sexta em 2022');

/* modo piloto */
const corrida = ano => {
  const P = H.carregar({ silencioso: true, seed: 13 });
  H.novaCarreira(P, { era: 7, ano, idade: 28, rapido: true });
  P.run('Game.simSeason(); UI.limparFila(); UI.close();');
  return P.run(`(() => { const s = S.season, sum = Engine.summary(s); let erros = 0;
    s.calendar.forEach((t, i) => { if(t.tipo !== 'principal') return; const rec = s.results[i];
      const base = t.gridRegra === 'chegada' ? (s.chegadaFds || {})[t.fds + ':0'] : (s.qualiFds || {})[t.fds];
      const esperado = base ? base.indexOf('ME') + 1 : 0; if(esperado && rec.grid && rec.grid !== esperado) erros++; });
    return { erros, races: sum.races, total: sum.total, sprints: sum.sprints, gps: S.career.gps, spN: (S.career.sprints || {}).n,
      ptsSprint: s.results.filter(r => r.sprintF1).every(r => !r.pts || r.pts <= 8) }; })()`);
};
const p21 = corrida(2021), p23 = corrida(2023);
ok(p21.erros === 0 && p23.erros === 0, 'piloto: o GP larga pela chegada da sprint (2021) ou pela classificação (2023)');
ok(p21.total === 22 && p21.sprints === 3 && p21.gps === p21.races && p21.spN === 3, `piloto: ${p21.races} GPs e ${p21.sprints} sprints em 2021, contados separados`);
ok(p23.ptsSprint, 'piloto: nenhuma sprint paga mais de 8 pontos');

/* modo chefe */
const K = H.carregar({ silencioso: true, seed: 5 });
K.run(require('./chefe-comum'));
const k = K.run(`(() => {
  const idx = eraOfSeries(2023, 'f1').teams.findIndex((t, i) => { const r = Engine.resolveTeam(t, i, 2023, 'f1'); return r && r.name === 'Ferrari'; });
  Chefe.novo({ chefe:{ nome:'T', cc:'BR' }, realismo:true, modo:'assumir', sk:'f1', ano:2023, idx });
  __inverno(); Chefe.comecarTemporada(); UI.limparFila(); UI.close();
  const sea = C.temporada, orig = Chefe.montar; let M = null, erros = 0, sprintsSemCusto = true;
  Chefe.montar = () => (M = orig());
  while(sea.round < sea.calendar.length){
    const t = sea.calendar[sea.round], caixa0 = C.caixa;
    const ops0 = JSON.stringify(C.livro && C.livro[sea.ano] ? (C.livro[sea.ano].operacao || 0) : 0);
    Chefe.correr();
    if(t.sprintF1){ const ops1 = JSON.stringify(C.livro && C.livro[sea.ano] ? (C.livro[sea.ano].operacao || 0) : 0); if(ops1 !== ops0) sprintsSemCusto = false; }
    if(t.tipo === 'principal'){ const q = sea.qualiFds[t.fds] || []; M.corre.forEach(f => { const e = q.indexOf(f.id) + 1; if(e && M.grid[f.id] !== e) erros++; }); }
  }
  Chefe.montar = orig;
  const tit = C.pilotos.filter(p => p.papel === 'titular');
  return { erros, n: sea.calendar.length, pagas: Chefe.etapasPagas(sea), sprintsSemCusto,
    est: tit.every(p => p.est.gps <= 22 && (p.est.spr || 0) <= 6) }; })()`);
ok(k.erros === 0, 'chefe: o GP larga pela classificação disputada, e a sprint pela sessão dela');
ok(k.n === 28 && k.pagas === 22, 'chefe: 28 corridas no ano, 22 delas pagam e cobram');
ok(k.sprintsSemCusto, 'chefe: a sprint não cobra a operação da etapa');
ok(k.est, 'chefe: GPs e sprints contados separados para os seus pilotos');

console.log(falhas ? `${falhas} de ${n} verificações falharam` : `sprints da F1: ${n} verificações, tudo certo`);
process.exit(falhas ? 1 : 0);
