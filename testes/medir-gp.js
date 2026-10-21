/* Medição (não entra na suíte): a corrida ao vivo do modo chefe, etapa a etapa.
   — quantos abandonam (todos e os seus), quantos param, quem ganha;
   — o caminho estatístico ("simular o resto do ano") na mesma equipe;
   — a mesma semente a 1×, 2×, 4× e 16×, rodando o quadro da transmissão de verdade.
   Uso: node testes/medir-gp.js [etapas] [ano] [posição da equipe no grid]
   Não modifica arquivos nem saves. */
const H = require('./base');
const ETAPAS = +(process.argv[2] || 12), ANO = +(process.argv[3] || 2024), POS = +(process.argv[4] || 4);

function equipe(seed){
  const J = H.carregar({ silencioso: true, seed });
  J.run(require('./chefe-comum'));
  const idx = J.run(`(() => { const l = eraOfSeries(${ANO}, 'f1').teams.map((t, i) => [i, Engine.resolveTeam(t, i, ${ANO}, 'f1')]).filter(x => x[1]).sort((a, b) => b[1].str - a[1].str); return l[Math.min(l.length - 1, ${POS})][0]; })()`);
  J.run(`(() => { Chefe.novo({ chefe:{ nome:'T', cc:'BR' }, realismo:true, eq:{ nome:'Equipe Teste', cor:'#123456', cc:'GB' }, modo:'assumir', sk:'f1', ano:${ANO}, idx:${idx} });
    __inverno(); Chefe.comecarTemporada(); UI.limparFila(); UI.close(); })()`);
  return J;
}

const t0 = Date.now();
const J = equipe(11);
const r = J.run(`(() => {
  const out = { etapas: 0, carros: 0, abd: 0, abdNossos: 0, nossos: 0, mec: 0, acid: 0, paradas: 0, vitNossas: 0, posNossas: [], venc: {}, estat: { abd: 0, carros: 0 }, ritmos: {} };
  for(let k = 0; k < ${ETAPAS} && C.temporada.round < C.temporada.calendar.length; k++){
    const sea = C.temporada;
    Chefe.gridDaEtapa(sea);
    const M = Chefe.montar();
    /* o caminho estatístico com a mesma montagem: só conta os abandonos */
    out.estat.abd += M.out.length; out.estat.carros += M.out.length + M.running.length;
    const ent = Gp.entrada(sea, M, "f1", sea.ano, f => f.teamId === "EU", { gestao: ${!process.env.SEM} });
    const R = Gp.criar(ent); Gp.terminar(R);
    const res = Gp.resultado(R);
    out.etapas++; out.carros += R.carros.length;
    R.carros.forEach(s => {
      if(s.estado === 3){ out.abd++; if(s.foraTipo === 'MEC') out.mec++; else out.acid++; if(s.c.nosso) out.abdNossos++; }
      out.paradas += s.paradas;
      if(s.c.nosso) out.nossos++;
      (s.modosUsados ? [...s.modosUsados] : [s.modo]).forEach(m => out.ritmos[m] = (out.ritmos[m] || 0) + 1);
    });
    const v = R.carros.find(x => x.c.id === res.ordem[0].id).c; out.venc[v.nome] = (out.venc[v.nome] || 0) + 1;
    const fin = Gp.chegada(M, res);
    fin.filter(x => x.f.teamId === 'EU').forEach(x => out.posNossas.push(x.out ? 'ABD' : x.pos));
    Chefe.correr({ montagem: M, finish: fin, flId: res.flId, sc: res.sc, crono: Gp.cronoDe(res) });
  }
  return out; })()`);
console.log(`F1 ${ANO}, equipe ${POS + 1}ª mais forte, ${r.etapas} etapas`);
console.log(`  ao vivo: ${(100 * r.abd / r.carros).toFixed(1)}% abandonam (${r.mec} quebras, ${r.acid} batidas); seus carros: ${r.abdNossos}/${r.nossos}`);
console.log(`  estatístico (mesma montagem): ${(100 * r.estat.abd / r.estat.carros).toFixed(1)}% abandonam`);
console.log(`  paradas por carro: ${(r.paradas / r.carros).toFixed(2)}`);
console.log(`  seus carros: ${r.posNossas.join(' ')}`);
console.log(`  vencedores: ${Object.entries(r.venc).sort((a, b) => b[1] - a[1]).map(([n, v]) => n + ' ' + v).join(', ')}`);
console.log(`  ritmos usados: ${JSON.stringify(r.ritmos)}`);

/* a mesma semente em várias velocidades, pelo quadro da transmissão */
{
  const K = equipe(23);
  K.run(`globalThis.requestAnimationFrame = () => 0;
    (() => { const sea = C.temporada; Chefe.gridDaEtapa(sea); const M = Chefe.montar();
      globalThis._ent = Gp.entrada(sea, M, 'f1', sea.ano, f => f.teamId === 'EU', { gestao: ${!process.env.SEM} });
      _ent.n1 = _ent.carros.filter(c => c.ctrl).sort((a, b) => b.grid - a.grid)[0].id; })()`);
  const rodar = vel => K.run(`(() => {
    const R = Gp.criar(JSON.parse(JSON.stringify(_ent)));
    AoVivo.R = R; AoVivo.carrosEl = []; AoVivo.pausa = false; AoVivo._largada = false; AoVivo.alvo = null; AoVivo.vel = ${vel};
    AoVivo.opc = {}; AoVivo.acabou = false;
    AoVivo.radio = () => {}; AoVivo.bandeirada = () => { AoVivo.acabou = true; };
    let ts = 1000; AoVivo.ult = ts; let q = 0;
    while(!R.fim && q++ < 3e6){ ts += 1000 / 60; if(R.pergunta) Gp.responder(R, R.pergunta.padrao);
      /* o seu muro segue a equipe: chama o box quando o rádio sugere */
      R.carros.forEach(s => { if(s.c.ctrl && s.sugestao && !s.parar && s.estado === 0) Gp.comandar(R, s.i, { parar: s.sugestao.c }); });
      AoVivo.quadro(ts); }
    const res = Gp.resultado(R);
    return res.ordem.map(o => o.id + ':' + (o.fim == null ? 'x' : o.fim.toFixed(2))).join('|') + ' ordem=' + JSON.stringify(R.ordemEquipe || null); })()`);
  const base = rodar(16);
  const outros = [1, 2, 4, 8].map(v => [v, rodar(v)]);
  outros.forEach(([v, x]) => console.log(`  ${v}× ${x === base ? 'igual' : 'DIFERENTE'} a 16×`));
  if(outros.some(([, x]) => x !== base)) console.log('    16×: ' + base.slice(-120) + '\n    ' + outros.map(([v, x]) => v + '×: ' + x.slice(-120)).join('\n    '));
}
console.log(`(${((Date.now() - t0) / 1000).toFixed(0)} s)`);
