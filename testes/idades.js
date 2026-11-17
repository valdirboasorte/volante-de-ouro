/* A idade de cada piloto real sai do ano de nascimento da pessoa que corria com
   aquele nome naquele ano (assets/idades.js + dados/nascimentos.js).
   O caso que abriu a correção: o Michael Andretti em 1993 aparecia com a idade
   do Mario, porque a tabela de nascimentos do jogo é indexada pelo nome curto
   ("M. Andretti") e o nome curto se repete entre pessoas. */
const { carregar } = require('./base');
const J = carregar({ silencioso: true });
const run = J.run;
let falhas = 0;
const ok = (cond, msg) => { if(!cond){ falhas++; console.log('FALHOU:', msg); } };
const igual = (a, b, msg) => ok(a === b, `${msg}: esperava ${b}, veio ${a}`);

ok(run('typeof Idades !== "undefined" && Idades.instalado'), 'assets/idades.js instalado depois do jogo');
ok(run('typeof HIST_NASC !== "undefined" && Object.keys(HIST_NASC.a).length > 5000'), 'dados/nascimentos.js carregado');

const idade = (sk, nome, ano) => run(`idadeEm(${JSON.stringify(sk)}, ${JSON.stringify(nome)}, ${ano}, null)`);
const quem = (sk, nome, ano) => run(`(Idades.pessoa(${JSON.stringify(sk)}, ${JSON.stringify(nome)}, ${ano}) || {}).nome || null`);

/* a família Andretti: o mesmo nome curto, três pessoas em épocas diferentes */
igual(quem('f1', 'M. Andretti', 1993), 'Michael Andretti', 'F1 1993: "M. Andretti" é o Michael');
igual(idade('f1', 'M. Andretti', 1993), 31, 'F1 1993: Michael Andretti (1962)');
igual(idade('f1', 'Andretti', 1978), 38, 'F1 1978: Mario Andretti (1940)');
igual(idade('indy', 'Andretti', 1993), 53, 'Indy 1993: Mario Andretti, ainda na Newman/Haas');
igual(idade('indy', 'M. Andretti', 1991), 29, 'Indy 1991: Michael Andretti, campeão da CART');
igual(quem('indy', 'M. Andretti', 2015), 'Marco Andretti', 'Indy 2015: "M. Andretti" é o Marco');
igual(idade('indy', 'M. Andretti', 2015), 28, 'Indy 2015: Marco Andretti (1987)');
igual(idade('indy', 'M. Andretti', 2010), 23, 'Indy 2010: Marco, mesmo com o Michael três anos antes');
igual(idade('indy', 'M. Andretti', 2006), 44, 'Indy 2006 (divisão CART/IRL): Michael Andretti');
igual(idade('indy', 'M. Andretti', 1993), 31, 'Indy 1993: "M. Andretti" no ano em que o Michael estava na F1 continua sendo o Michael');
igual(idade('wec', 'M. Andretti', 1972), 32, 'Endurance 1972 (sem lista no banco): "M. Andretti" é o Mario, não o Michael de 10 anos');

/* pai e filho com o mesmo sobrenome: Bobby e Graham Rahal */
igual(idade('indy', 'Rahal', 1990), 37, 'Indy 1990: Bobby Rahal (1953)');
igual(idade('indy', 'Rahal', 2015), 26, 'Indy 2015: Graham Rahal (1989)');
/* e a nota acompanha: o Graham de 26 anos não perde nota de veterano de 62 */
const base = run(`(eraOfSeries(2015, 'indy').pilots.find(p => p[0] === 'Rahal') || [])[2]`);
igual(run(`skillEm('indy', 'Rahal', 2015, ${base})`), base, 'Indy 2015: nota do Graham Rahal sem declínio de idade');

/* outras épocas: anos 50 e anos 80 da F1, que já estavam certos, continuam certos */
igual(idade('f1', 'Fangio', 1955), 44, 'F1 1955: Fangio (1911)');
igual(idade('f1', 'Senna', 1988), 28, 'F1 1988: Senna (1960)');
igual(idade('f1', 'Verstappen', 2021), 24, 'F1 2021: Max Verstappen (1997)');
igual(idade('f1', 'J. Verstappen', 1994), 22, 'F1 1994: Jos Verstappen (1972)');
/* duas fontes: o Wikidata dá 1970 para o Montoya; a página da Wikipedia (e a tabela do jogo) dizem 1975 */
igual(idade('f1', 'Montoya', 2001), 26, 'F1 2001: Juan Pablo Montoya (1975)');
igual(idade('f1', 'Manzon', 1950), 33, 'F1 1950: Robert Manzon (1917; a tabela do jogo dizia 1922)');

/* quem não tem ficha na tabela do jogo ganhava uma idade sorteada (24 a 32) em qualquer época */
const semFicha = JSON.parse(run(`JSON.stringify((() => {
  const out = [];
  [['indy', 1993], ['nascar', 2000], ['dtm', 1990], ['wec', 2012], ['stock', 2015], ['fe', 2016]].forEach(([sk, ano]) => {
    const lu = lineupOf(sk, ano) || {};
    Object.keys(lu).forEach(n => {
      if(fichaDe(sk, n)) return;
      const b = Idades.nasc(sk, n, ano);
      if(b != null) out.push([sk, ano, n, idadeEm(sk, n, ano, null), ano - b]);
    });
  });
  return out;
})())`));
ok(semFicha.length >= 30, `pilotos sem ficha com nascimento conhecido em seis grids (${semFicha.length})`);
semFicha.forEach(([sk, ano, n, i, real]) => ok(i === real, `${sk} ${ano}: ${n} com ${i} anos, real ${real}`));

/* o grid do chefe não tem a mesma pessoa duas vezes nem ninguém abaixo de 16 anos */
const pools = JSON.parse(run(`JSON.stringify((() => {
  const out = {};
  [['indy', 1985], ['indy', 2010], ['dtm', 2012], ['stock', 2015], ['nascar', 2009], ['f1', 2007]].forEach(([sk, ano]) => {
    C = { sk, pilotos:[], mundo:{}, W:null, ano };
    out[sk + ano] = Chefe.pilotosDoAno(ano).map(p => [p.nome, idadeEm(sk, p.nome, ano, null), (Idades.pessoa(sk, p.nome, ano) || {}).i]);
  });
  C = null;
  return out;
})())`));
Object.entries(pools).forEach(([k, l]) => {
  const vistos = {};
  l.forEach(([n, i, pi]) => {
    ok(i >= 16, `${k}: ${n} no grid com ${i} anos`);
    if(pi != null){ ok(!vistos[pi], `${k}: ${n} e ${vistos[pi]} são a mesma pessoa`); vistos[pi] = n; }
  });
});
ok(!pools.indy1985.some(p => p[0] === 'Mi. Andretti'), 'Indy 1985: o Michael não aparece de novo como "Mi. Andretti"');
ok(!pools.dtm2012.some(p => p[0] === 'Lawson'), 'DTM 2012: o Liam Lawson (10 anos) fora do grid');

/* modo chefe: assumir a Newman/Haas de 1993 traz o Mario com a idade dele, e o mercado tem idades reais */
const chefe = JSON.parse(run(`JSON.stringify((() => {
  const era = eraOfSeries(1993, 'indy'), idx = era.teams.findIndex(t => /Newman/.test(t[0]));
  Chefe.novo({ modo:'assumir', sk:'indy', ano:1993, idx, chefe:{ nome:'T', cc:'BR' }, realismo:true });
  const pil = C.pilotos.map(p => [p.nome, Chefe.idade(p)]);
  const merc = C.inv.mercado.filter(p => p.real || p.mid).map(p => {
    const b = Idades.nasc('indy', p.nome, 1993);
    return [p.nome, 1993 - p.nasc, b == null ? null : 1993 - b];
  });
  return { pil, merc };
})())`));
const mario = chefe.pil.find(p => p[0] === 'Andretti');
ok(mario && mario[1] === 53, `chefe Indy 1993: Mario Andretti com 53 anos (${JSON.stringify(chefe.pil)})`);
chefe.merc.forEach(([n, i, real]) => { if(real != null) ok(i === real, `mercado Indy 1993: ${n} com ${i} anos, real ${real}`); });
ok(chefe.merc.filter(m => m[2] != null).length >= 10, 'mercado Indy 1993 com idades reais conferidas');

/* save antigo: o Michael gravado com o nascimento do Mario é corrigido ao abrir */
const save = JSON.parse(run(`JSON.stringify((() => {
  const c = { v: Chefe.V, sk:'f1', ano:1993, inicio:1993, pilotos:[{ nome:'M. Andretti', real:true, base:80, nasc:1940 },
    { nome:'Piloto Inventado', real:false, nasc:1970 }], W:null };
  const n = Idades.corrigirSave(c);
  return { n, m: c.pilotos[0].nasc, inv: c.pilotos[1].nasc };
})())`));
igual(save.m, 1962, 'save antigo: Michael Andretti volta a nascer em 1962');
igual(save.inv, 1970, 'save antigo: piloto inventado não é mexido');

if(falhas){ console.log(falhas + ' falha(s)'); process.exitCode = 1; }
else console.log('idades reais por época: ok');
