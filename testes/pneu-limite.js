/* Pneu no limite: o desgaste trava em 100%, e dali em diante o pneu pode
   estourar a qualquer momento — às vezes no segundo seguinte, às vezes, com
   sorte, várias voltas depois. Enquanto resiste, o ritmo continua caindo.
   Uso: node testes/pneu-limite.js   Não modifica arquivos nem saves. */
const H = require('./base');
let falhas = 0, n = 0;
const ok = (c, m) => { n++; if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };

const J = H.carregar({ silencioso:true, seed: 21 });
H.novaCarreira(J, { era: 7, ano: 2024, idade: 24, rapido: true });
J.run(`(() => { const t = S.ladder.indexOf(Engine.topCat()); S.catIdx = t;
  const ts = Engine.teamsFor(Engine.topCat(), S.year, S.series, t, S.ladder.length);
  S.team = { id:ts[2].id, name:ts[2].name, color:ts[2].color, str:ts[2].str }; S.driver.injured = 0;
  Game.startSeason(); UI.limparFila(); UI.close(); S.driver.injured = 0;
  const sea = S.season; sea.round = 2; const M = Engine.montarCorrida(sea);
  globalThis._ent = Gp.entrada(sea, M, 'f1', 2024, f => !!f.isMe, { seed: 777 });
  _ent.wet = false; _ent.carros.forEach(c => { c.fora = null; c.fracFora = null; c.erro = false; }); })()`);

/* o seu carro nunca para sozinho: fica na pista até o pneu acabar */
J.run(`globalThis._ate = (semente, passo) => {
  const ent = JSON.parse(JSON.stringify(_ent)); ent.seed = semente;
  const R = Gp.criar(ent); R.w = 0; R.choveu = false; R.clima.fases = [[0, 0]]; R.regras.scProb = 0; R.regras.vscProb = 0;
  const eu = R.carros.find(s => s.c.ctrl); eu.plano = []; eu.modo = 'atacar';
  let max = 0, chegou = null, ritmo100 = null, ritmoDepois = null, guarda = 0;
  while(!eu.furo && eu.estado !== 3 && eu.estado !== 4 && R.t < 9000 && guarda++ < 1e6){
    /* o rádio pode chamar (um toque quebrou a asa): o carro segue, como pede o teste */
    if(R.pergunta) Gp.responder(R, R.pergunta.opcoes.some(o => o.k === 'seguir') ? 'seguir' : R.pergunta.padrao);
    Gp.avancar(R, R.t + (passo || 1));
    max = Math.max(max, eu.pneu.gasto);
    if(eu.pneu.gasto >= 1 && chegou == null){ chegou = eu.s; ritmo100 = eu.m; }
    if(chegou != null && eu.s - chegou > R.g.L * .5 && ritmoDepois == null) ritmoDepois = eu.m;
    if(eu.estado !== 0 && eu.estado !== 5 && eu.pneu.gasto < .5) break;
  }
  return { max, furou: !!eu.furo, voltasNoFio: chegou == null ? null : (eu.s - chegou) / R.g.L, fio: eu.pneu.fio / R.g.L,
    ritmo100, ritmoDepois, abandonou: eu.estado === 3 || eu.estado === 4, toque: R.eventos.some(e => e.tipo === 'toque' && (e.a === eu.i || e.b === eu.i)), evento: R.eventos.filter(e => e.tipo === 'furo' && e.a === eu.i).map(e => !!e.estouro),
    quando: (R.eventos.find(e => e.tipo === 'furo' && e.a === eu.i && e.estouro) || {}).t, fioExato: eu.pneu.fio };
}`);

const lotes = [];
for(let k = 1; k <= 64; k++) lotes.push(J.run(`_ate(${k * 97})`));
/* um toque com outro carro (furo ou asa quebrada) é outro lance: fica fora da conta */
const comFio = lotes.filter(x => x.voltasNoFio != null && !x.abandonou && !x.toque);
ok(lotes.every(x => x.max <= 1 + 1e-9), `o desgaste nunca passa de 100% (máximo ${Math.max(...lotes.map(x => x.max)).toFixed(3)})`);
ok(comFio.length >= 12 && comFio.every(x => x.furou), `${comFio.length} pneus chegaram ao limite com o carro na pista, e todos acabaram estourando`);
const v = comFio.map(x => x.voltasNoFio).sort((a, b) => a - b);
const media = v.reduce((a, b) => a + b, 0) / v.length;
ok(v[0] < .25 && v[v.length - 1] > 1.8, `às vezes estoura logo (${v[0].toFixed(2)} volta), às vezes dura bem mais (${v[v.length - 1].toFixed(2)} voltas)`);
ok(media > .5 && media < 1.8, `em média, cerca de uma volta no fio (${media.toFixed(2)})`);
ok(comFio.filter(x => x.ritmoDepois != null).every(x => x.ritmoDepois > x.ritmo100), 'enquanto resiste, o pneu no fio continua ficando mais lento');
ok(comFio.every(x => x.evento.length && x.evento.every(e => e)), 'o estouro vira um lance da corrida ("o pneu estourou no limite")');
/* a mesma corrida, transmitida em velocidades diferentes, estoura no mesmo metro */
const a = J.run('_ate(500, 1)'), b = J.run('_ate(500, 8)'), c = J.run('_ate(500, 25)');
ok(a.quando != null && a.quando === b.quando && b.quando === c.quando && a.fioExato === b.fioExato && b.fioExato === c.fioExato, `a 1×, 8× e 25× o pneu estoura no mesmo instante da prova (${a.quando && a.quando.toFixed(1)} s)`);

console.log(falhas ? falhas + ' falha(s) de ' + n : `pneu no limite: ${n} verificações, tudo certo`);
if(falhas) process.exitCode = 1;
