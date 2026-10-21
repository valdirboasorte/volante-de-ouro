/* Medição (não entra na suíte): com o muro no automático, os seus carros ganham e
   perdem posições como os da IA? Compara posições ganhas na corrida ao vivo,
   por faixa de largada, entre os seus carros e os da IA.
   Uso: node testes/medir-justica.js [corridas] [ano] [posição da equipe]  */
const H = require('./base');
const N = +(process.argv[2] || 30), ANO = +(process.argv[3] || 2024), POS = +(process.argv[4] || 4);
const tot = { eu: [], ia: [] };
for(let s = 0; tot.eu.length < N * 2 && s < 30; s++){
  const J = H.carregar({ silencioso: true, seed: 100 + s });
  J.run(require('./chefe-comum'));
  J.run(`(() => { const l = eraOfSeries(${ANO}, 'f1').teams.map((t, i) => [i, Engine.resolveTeam(t, i, ${ANO}, 'f1')]).filter(x => x[1]).sort((a, b) => b[1].str - a[1].str);
    Chefe.novo({ chefe:{ nome:'T', cc:'BR' }, realismo:true, modo:'assumir', sk:'f1', ano:${ANO}, idx:l[${POS}][0] }); __inverno(); Chefe.comecarTemporada(); UI.limparFila(); UI.close(); })()`);
  const r = J.run(`(() => { const out = [];
    for(let k = 0; k < 8 && C.temporada.round < C.temporada.calendar.length; k++){
      const sea = C.temporada; Chefe.gridDaEtapa(sea); const M = Chefe.montar();
      const R = Gp.criar(Gp.entrada(sea, M, 'f1', sea.ano, f => f.teamId === 'EU', { gestao: true })); Gp.terminar(R);
      const ord = Gp.ordem(R).filter(s => s.estado !== 3);
      const ritmo = ord.slice().sort((a, b) => a.m0 - b.m0);
      R.carros.forEach(s => { if(s.estado === 3) return; out.push([s.c.ctrl ? 1 : 0, ritmo.indexOf(s) + 1, ord.indexOf(s) + 1, s.paradas]); });
      const res = Gp.resultado(R); Chefe.correr({ montagem: M, finish: Gp.chegada(M, res), flId: res.flId, sc: res.sc });
    } return out; })()`);
  r.forEach(([eu, g, p, par]) => (eu ? tot.eu : tot.ia).push([g, p, par]));
}
const faixa = (l, a, b) => l.filter(x => x[0] >= a && x[0] <= b);
const media = l => l.length ? (l.reduce((s, x) => s + (x[0] - x[1]), 0) / l.length).toFixed(2) : '-';
const par = l => l.length ? (l.reduce((s, x) => s + x[2], 0) / l.length).toFixed(2) : '-';
for(const [a, b] of [[1, 22], [1, 7], [8, 14], [15, 22]])
  console.log(`ritmo ${a}-${b} (chegada contra o lugar do ritmo): seus ${faixa(tot.eu, a, b).length} carros ganham ${media(faixa(tot.eu, a, b))} (paradas ${par(faixa(tot.eu, a, b))}) · IA ${faixa(tot.ia, a, b).length} carros ganham ${media(faixa(tot.ia, a, b))} (paradas ${par(faixa(tot.ia, a, b))})`);
