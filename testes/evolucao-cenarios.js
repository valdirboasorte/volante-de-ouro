/* Evolução do piloto em cenários controlados, nas três dificuldades.
   Cada cenário fixa idade, atributos, potencial e o ano na pista, e mede o
   ganho médio de geral em 300 temporadas:
   — quem domina a categoria evolui mais que o mesmo piloto no meio do grid;
   — o Tranquilo acelera (perto de 1,5×), Equilibrado e Desafio ficam iguais;
   — perto do teto quase nada, e a elite (85+) cresce menos que um estreante;
   — o veterano cai igual em qualquer dificuldade; ninguém passa do potencial;
   — o balanço do ano mostra "Geral: x → y" e o porquê.
   Uso: node testes/evolucao-cenarios.js */
const H = require('./base');
let falhas = 0, n = 0;
const ok = (c, m) => { n++; if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };

const J = H.carregar({ silencioso: true, seed: 11 });
H.novaCarreira(J, { era: J.run('ERAS.reduce((k, e, i) => e.y <= 2015 ? i : k, 0)'), ano: 2015, idade: 16, serie: 'f1' });
J.run('Game.simSeason(); UI.limparFila(); UI.close();');

/* ganho médio de geral num cenário, ou o geral depois de vários anos (anos > 1) */
const medir = (c, dif, anos) => J.run(`(() => {
  const base = JSON.stringify(S); let t = 0; const N = ${anos ? 20 : 300};
  for(let i = 0; i < N; i++){
    S = JSON.parse(base); S.dif = '${dif}';
    const d = S.driver; d.age = ${c.idade}; d.peak = 29; d.decl = 33; d.ritmoDev = 1; d.alcance = .94; d.tardio = false;
    for(const k in d.attr){ d.attr[k] = ${c.at}; d.pot[k] = ${c.pot}; }
    d.ovr = Engine.ovr(d.attr); S.academy = null; S.prep = Engine.prepZerado(); S.compromisso = null; if(S.rel) S.rel.mentor = null;
    S.season.isTop = ${!!c.top}; S.catIdx = Math.round(${c.cat} * (S.ladder.length - 1));
    const o0 = Engine.ovr(d.attr);
    for(let a = 0; a < ${anos || 1}; a++){ if(${!!anos}) d.age = Math.min(d.age, 24); Engine.progress(${JSON.stringify(c.sum)}); }
    t += ${anos ? 'Math.max(...Object.keys(d.attr).map(k => d.attr[k] - d.pot[k]))' : 'Engine.ovr(d.attr) - o0'};
  }
  S = JSON.parse(base); return t / N; })()`);

const CAMPEAO = { races:18, pos:1, champion:true, wins:6, podiums:11, tmWins:14, tmRaces:18, dnfs:1 };
const MEIO = { races:18, pos:12, wins:0, podiums:0, tmWins:7, tmRaces:18, dnfs:3 };
const C = {
  f4:      { idade:16, at:58, pot:84, cat:.35, sum:{ races:20, pos:1, champion:true, wins:11, podiums:16, tmWins:18, tmRaces:20, dnfs:0 } },
  f3camp:  { idade:19, at:70, pot:86, cat:.6, sum:CAMPEAO },
  f3meio:  { idade:19, at:70, pot:86, cat:.6, sum:MEIO },
  teto:    { idade:28, at:85, pot:88, cat:1, top:true, sum:{ races:22, pos:4, wins:1, podiums:6, tmWins:13, tmRaces:22, dnfs:2 } },
  veterano:{ idade:37, at:84, pot:88, cat:1, top:true, sum:{ races:22, pos:9, wins:0, podiums:1, tmWins:8, tmRaces:22, dnfs:3 } },
  elite:   { idade:22, at:90, pot:97, cat:1, top:true, sum:CAMPEAO },
  novato:  { idade:22, at:63, pot:70, cat:1, top:true, sum:CAMPEAO }
};
const r = {};
for(const k in C){ r[k] = {}; for(const d of ['tranquilo', 'equilibrado', 'realista']) r[k][d] = medir(C[k], d); }
const f = x => (x > 0 ? '+' : '') + x.toFixed(2);
for(const k in C) console.log(`    ${k.padEnd(9)} Tranquilo ${f(r[k].tranquilo)} · Equilibrado ${f(r[k].equilibrado)} · Desafio ${f(r[k].realista)}`);

ok(r.f4.equilibrado >= 4.5, `jovem que domina a F4 evolui de verdade (${f(r.f4.equilibrado)} de geral no ano)`);
ok(r.f3camp.equilibrado > r.f3meio.equilibrado * 1.25, `campeão da F3 evolui mais que o mesmo piloto em 12º (${f(r.f3camp.equilibrado)} × ${f(r.f3meio.equilibrado)})`);
const razao = r.f4.tranquilo / r.f4.equilibrado;
ok(razao > 1.3 && razao < 1.7, `Tranquilo perto de 1,5× o Equilibrado (${razao.toFixed(2)}×)`);
ok(Math.abs(r.f3camp.realista - r.f3camp.equilibrado) < .3 && Math.abs(r.f4.realista - r.f4.equilibrado) < .4, 'Desafio evolui como o Equilibrado: sem bônus');
ok(r.teto.equilibrado < .5, `perto do teto quase nada (${f(r.teto.equilibrado)})`);
ok(r.elite.equilibrado < r.novato.equilibrado, `a elite cresce menos que um estreante com a mesma distância do teto (${f(r.elite.equilibrado)} × ${f(r.novato.equilibrado)})`);
ok(r.veterano.equilibrado < -1 && Math.abs(r.veterano.tranquilo - r.veterano.realista) < .3, `o veterano cai, em qualquer dificuldade (${f(r.veterano.equilibrado)})`);
const passou = medir(Object.assign({}, C.f4, { pot: 90 }), 'tranquilo', 15);
ok(passou <= 0, 'quinze títulos seguidos no Tranquilo não passam do potencial');

/* o balanço do ano mostra o geral e o porquê */
const tela = J.run(`(() => { const sum = Engine.summary(S.season); const g = Engine.progress(sum); UI.seasonEndModal(sum, g);
  return { ovr: g.ovr, porque: g.porque.map(x => x[0]), html: document.getElementById('modal').innerHTML }; })()`);
ok(Array.isArray(tela.ovr) && /Geral<\/span>: <b data-i18n-ignore>\d+ → \d+ \([+-]?\d+\)/.test(tela.html), `o balanço mostra "Geral: ${tela.ovr[0]} → ${tela.ovr[1]}"`);
ok(tela.porque.indexOf('desempenho') >= 0 && /Desempenho na temporada/.test(tela.html), 'e explica o que pesou (desempenho, companheiro, categoria...)');

console.log(falhas ? falhas + ' falha(s) de ' + n : `evolução em cenários: ${n} verificações, tudo certo`);
if(falhas) process.exitCode = 1;
