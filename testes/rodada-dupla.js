/* A rodada dupla das categorias de base, como no regulamento de cada ano:
   — o formato por campeonato real (GP2, F2, F3 da FIA, F3 Euro Series, F3 Europeia, F4);
   — a corrida curta larga com os primeiros invertidos, da classificação ou da corrida anterior;
   — cada corrida paga a sua tabela; largar na frente de um grid invertido não é pole;
   — o modo piloto e o modo chefe montam o mesmo fim de semana;
   — a F1 e o kart continuam com uma corrida por etapa.
   Uso: node testes/rodada-dupla.js   Não modifica arquivos nem saves. */
const H = require('./base');
let falhas = 0, n = 0;
const ok = (c, m) => { n++; if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };
const J = H.carregar({ silencioso: true, seed: 11 });
const fmt = (cat, ano) => J.run(`(() => { const f = formatoFds('${cat}', ${ano}, 'f1'); return f ? f.corridas.map(c => ({ n: c.n, g: c.grid, p: c.pts.p, pole: c.pts.pole || 0, fl: c.pts.fl || 0 })) : null; })()`);

/* os formatos */
const f22 = fmt('Fórmula 2', 2022);
ok(f22.length === 2 && f22[0].g.inv === 10 && f22[0].g.de === 'quali' && f22[0].p.join() === '10,8,6,5,4,3,2,1' && f22[1].g === 'quali' && f22[1].pole === 2,
  'F2 2022: sprint com os 10 primeiros da classificação invertidos (10-8-6-5…), principal com 2 pela pole');
const f21 = fmt('Fórmula 2', 2021);
ok(f21.length === 3 && f21[1].g.de === 'anterior' && f21[2].pole === 4, 'F2 2021: duas sprints e a principal no domingo');
const gp08 = fmt('GP2 Series', 2008);
ok(gp08[0].p.join() === '10,8,6,5,4,3,2,1' && gp08[1].g.inv === 8 && gp08[1].g.de === 'anterior' && gp08[1].p.join() === '6,5,4,3,2,1',
  'GP2 2008: a sprint inverte os 8 primeiros da principal e paga 6-5-4-3-2-1');
ok(fmt('GP2 Series', 2015)[1].p.join() === '15,12,10,8,6,4,2,1', 'GP2 2015: sprint 15-12-10-8-6-4-2-1');
ok(fmt('Fórmula 3', 2019)[1].g.inv === 8 && fmt('Fórmula 3', 2023)[0].g.inv === 12 && fmt('Fórmula 3', 2023)[0].p.join() === '10,9,8,7,6,5,4,3,2,1',
  'F3 da FIA: 8 invertidos em 2019; 12 e 10-9-8… a partir de 2022');
ok(fmt('Fórmula 3', 2008)[1].g.inv === 8 && fmt('Fórmula 3', 2016).length === 3 && fmt('Fórmula 3', 2016).every(c => c.g === 'quali' || c.g === 'nova'),
  'F3 Euro Series 2008 inverte 8; a F3 Europeia de 2016 tem três corridas sem inversão');
ok(fmt('Fórmula 4 Italiana', 2015)[1].g.inv === 10 && !fmt('Fórmula 4 Italiana', 2020).some(c => typeof c.g === 'object'),
  'F4 Italiana: corrida 2 invertida só em 2014-2015');
const gb = fmt('Fórmula 4 Britânica', 2023);
ok(gb.length === 3 && gb[1].g.inv === 10 && gb[1].p.join() === '15,12,10,8,6,4,2,1' && gb[0].fl === 1 && fmt('Fórmula 4 Britânica', 2021)[1].g.inv === 0,
  'F4 Britânica 2023: corrida 2 com os 10 da classificação invertidos e 15-12-10…; 2021 inverteu o grid inteiro');
ok(fmt('Fórmula 1', 2022) === null && fmt('Mundial de Kart', 2022) === null && fmt('Fórmula 3000', 1995) === null, 'F1, kart e F3000: uma corrida por etapa');

/* a inversão */
const inv = J.run(`(() => { const sea = { calendar: [{ fds:0, fdsN:0, gridRegra:'quali' }, { fds:0, fdsN:1, gridRegra:{ inv:3, de:'anterior' } }],
  chegadaFds: { '0:0': ['a','b','c','d','e'] } }; return Engine.gridDoFds(sea, 1, ['a','b','c','d','e']); })()`);
ok(inv.c === 1 && inv.b === 2 && inv.a === 3 && inv.d === 4 && inv.e === 5, 'os 3 primeiros da corrida anterior largam invertidos; o resto, na ordem de chegada');

/* modo piloto: uma temporada de F2 em 2022 */
H.novaCarreira(J, { era: 7, ano: 2022, idade: 24, rapido: false });
J.run('Game.simSeason(); UI.limparFila(); UI.close();');
const p = J.run(`(() => { const s = S.season; const ws = {};
  s.results.forEach((r, i) => { const t = s.calendar[i]; (ws[t.fds] = ws[t.fds] || {})[t.fdsN] = r; });
  const q = Object.keys(ws).map(w => ({ q: (s.qualiFds[w] || []).indexOf('ME') + 1, sprint: ws[w][0] && ws[w][0].grid, principal: ws[w][1] && ws[w][1].grid, inv: !!(ws[w][0] && ws[w][0].inv) }));
  return { cat: s.cat, n: s.calendar.length, q, poles: (S.career.base || {}).poles || 0,
    polesPrincipal: s.results.filter(r => !r.inv && r.grid === 1).length }; })()`);
ok(p.cat === 'Fórmula 2' && p.n % 2 === 0, `piloto: a temporada da F2 tem ${p.n} corridas, em fins de semana de duas`);
ok(p.q.every(w => !w.q || w.principal === w.q), 'piloto: a principal larga na posição da classificação');
ok(p.q.every(w => !w.q || !w.sprint || w.sprint === (w.q <= 10 ? 11 - w.q : w.q)), 'piloto: a sprint larga com os 10 primeiros da classificação invertidos');
ok(p.q.every(w => w.inv), 'piloto: a sprint fica marcada como corrida de grid invertido');
ok(p.poles === p.polesPrincipal, 'piloto: só conta pole quem largou em 1º pela classificação');

/* modo chefe: a mesma F2 */
const K = H.carregar({ silencioso: true, seed: 5 });
K.run(require('./chefe-comum'));
const c = K.run(`(() => {
  Chefe.novo({ modo:'base', ano:2022, cat:'Fórmula 2', chefe:{ nome:'T', cc:'GB' }, eq:{ nome:'Teste', cor:'#123456', cc:'GB' } });
  __inverno(); Chefe.comecarTemporada(); UI.limparFila(); UI.close();
  const sea = C.temporada, orig = Chefe.montar; let M = null, erros = 0;
  Chefe.montar = () => (M = orig());
  while(sea.round < sea.calendar.length){
    const t = sea.calendar[sea.round];
    Chefe.correr();
    const q = (sea.qualiFds || {})[t.fds] || [];
    M.corre.forEach(f => {
      const qp = q.indexOf(f.id) + 1; if(!qp) return;
      const esperado = t.fdsN === 0 ? (qp <= 10 ? 11 - qp : qp) : qp;
      if(M.grid[f.id] !== esperado) erros++;
    });
  }
  Chefe.montar = orig;
  return { n: sea.calendar.length, erros, sprint: sea.calendar[0].corridaN, pts: sea.calendar[0].pts.p.join() }; })()`);
ok(c.erros === 0 && c.sprint === 'Sprint' && c.pts === '10,8,6,5,4,3,2,1', `chefe: as ${c.n} corridas da F2 largam pela regra (sprint invertida, principal da classificação)`);
const ui = K.run(`(() => { Chefe.novo({ modo:'base', ano:2022, cat:'Fórmula 2', chefe:{ nome:'T', cc:'GB' }, eq:{ nome:'Teste', cor:'#123456', cc:'GB' } });
  __inverno(); Chefe.comecarTemporada(); UI.limparFila(); UI.close();
  const sea = C.temporada; Chefe.correr();
  UIC.irCorrida(); const qs = sea.qs && sea.qs.rd === sea.round ? sea.qs : null;
  return { herdada: !!(qs && qs.herdada && qs.concluida && qs.grid), round: sea.round }; })()`);
ok(ui.herdada && ui.round === 1, 'chefe: a segunda corrida do fim de semana vai direto para a largada, sem nova classificação');

/* a F1 continua igual */
const L = H.carregar({ silencioso: true, seed: 2 });
H.novaCarreira(L, { era: 7, ano: 2020, idade: 28, rapido: true });
const f1 = L.run('(() => { const s = S.season; return { top: s.isTop, fds: s.calendar.some(t => t.fds != null), ids: new Set(s.calendar.map(t => t.id)).size === s.calendar.length }; })()');
ok(f1.top && !f1.fds && f1.ids, 'F1: uma corrida por etapa, sem fim de semana duplo');

console.log(falhas ? `${falhas} de ${n} verificações falharam` : `rodada dupla: ${n} verificações, tudo certo`);
process.exit(falhas ? 1 : 0);
