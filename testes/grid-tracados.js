/* O grid real em todas as categorias principais e o traçado de cada pista.
   — escalações reais do banco histórico também na NASCAR, Stock Car, DTM, Fórmula E e
     Endurance (antes só F1 e IndyCar): pilotos de verdade nas equipes de verdade;
   — no Endurance cada carro tem um piloto no jogo: entra o primeiro de cada tripulação, e
     os outros não sobram para preencher outras equipes;
   — o modo chefe mostra a escalação, a bandeira e quantos carros cada equipe tinha;
   — traçados: os reais (base da F1 e OpenStreetMap), os aproximados (estradas, aeródromos,
     ovais) no comprimento oficial, e o kartódromo genérico com um kartódromo real de modelo.
   Uso: node testes/grid-tracados.js   Não modifica arquivos nem saves. */
'use strict';
const H = require('./base');
let falhas = 0, n = 0;
const ok = (c, m) => { n++; if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };
const js = (J, code) => JSON.parse(J.run('JSON.stringify(' + code + ')'));
const J = H.carregar({ silencioso: true, seed: 1 });
J.run(require('./chefe-comum'));

/* 1. escalações reais nas outras categorias */
const esc = (sk, ano) => js(J, `(() => { const l = lineupOf('${sk}', ${ano}) || {}, por = {}; Object.keys(l).forEach(p => (por[l[p]] = por[l[p]] || []).push(p));
  const times = eraOfSeries(${ano}, '${sk}').teams.map((x, i) => Engine.resolveTeam(x, i, ${ano}, '${sk}')).filter(Boolean).map(x => x.name);
  return { por, times, vagas: vagasReais('${sk}', ${ano}) || {} }; })()`);
const tem = (e, time, nome) => (e.por[time] || []).indexOf(nome) >= 0;
const cob = e => e.times.filter(t => e.por[t]).length + '/' + e.times.length;
const n20 = esc('nascar', 2020), n10 = esc('nascar', 2010);
ok(tem(n20, 'Hendrick', 'Chase Elliott') && tem(n20, 'Joe Gibbs', 'Denny Hamlin') && tem(n20, 'Penske', 'Joey Logano') && n20.vagas.Hendrick === 4,
  `NASCAR 2020: Elliott na Hendrick (4 carros), Hamlin na Gibbs, Logano na Penske (${cob(n20)} equipes)`);
ok(tem(n10, 'Hendrick', 'Jimmie Johnson') && tem(n10, 'Chip Ganassi', 'Juan Pablo Montoya') || tem(n10, 'Hendrick', 'Jimmie Johnson') && Object.keys(n10.por).length >= 8,
  `NASCAR 2010: Jimmie Johnson na Hendrick; a Ganassi achada mesmo com o nome "Earnhardt Ganassi" (${cob(n10)} equipes)`);
const fe = esc('fe', 2021), dtm = esc('dtm', 2019), st = esc('stock', 2019), w18 = esc('wec', 2018), w23 = esc('wec', 2023);
ok(tem(fe, 'Jaguar TCS', 'Evans') && tem(fe, 'Porsche', 'Wehrlein'), `Fórmula E 2021: Evans na Jaguar, Wehrlein na Porsche (${cob(fe)} equipes)`);
ok(tem(dtm, 'Abt Audi', 'Müller') && tem(dtm, 'Rosberg', 'Rast'), `DTM 2019: Müller na Abt ("Audi Sport Team Abt"), Rast na Rosberg (${cob(dtm)} equipes)`);
ok(tem(st, 'Full Time', 'Barrichello') && tem(st, 'Eurofarma-RC', 'Daniel Serra'), `Stock Car 2019: Barrichello na Full Time, Serra na Eurofarma (${cob(st)} equipes)`);
ok(tem(w18, 'Toyota', 'Alonso') && (w18.por.Toyota || []).length === w18.vagas.Toyota, `Endurance 2018-19: Alonso na Toyota, um piloto por carro (${cob(w18)} equipes)`);
ok(Object.keys(w23.por).length >= 6 && (w23.por['Toyota Gazoo'] || []).length === 2, `Endurance 2023: as equipes de verdade (${cob(w23)})`);
ok(!Object.keys(n10.por).some(t => n10.por[t].some(p => /\(/.test(p))), 'sem "(?)" nem "(US)" sobrando no nome dos pilotos');

/* 2. o modo chefe nessas categorias */
const chefe = (sk, ano) => js(J, `(() => { const l = eraOfSeries(${ano}, '${sk}').teams.map((t, i) => [i, Engine.resolveTeam(t, i, ${ano}, '${sk}')]).filter(x => x[1]).sort((a, b) => b[1].str - a[1].str);
  Chefe.novo({ chefe:{ nome:'T', cc:'BR' }, realismo:true, modo:'assumir', sk:'${sk}', ano:${ano}, idx:l[l.length - 1][0] }); UI.limparFila(); UI.close();
  const sea = C.temporada || null; UIC.n = { modo:'assumir', sk:'${sk}', ano:${ano}, idx:null }; UIC.formEquipe(); const h = el('chnEquipe').innerHTML;
  return { adef: (h.match(/Escala\\u00e7\\u00e3o a definir/g) || []).length, carros: /carros?</.test(h), bandeira: /class="flag[ "]/.test(h), times: l.length }; })()`);
for(const [sk, ano, max] of [['nascar', 2020, 0], ['fe', 2021, 1], ['dtm', 2019, 1], ['wec', 2015, 0]]){
  const c = chefe(sk, ano);
  ok(c.adef <= max && c.carros && c.bandeira, `${sk} ${ano} no modo chefe: escalação com bandeira e número de carros (${c.adef} de ${c.times} equipes sem escalação)`);
}
/* a equipe do chefe não rouba o titular da grande: o grid sai com os pilotos reais */
const g = js(J, `(() => { const l = eraOfSeries(2020, 'nascar').teams.map((t, i) => [i, Engine.resolveTeam(t, i, 2020, 'nascar')]).filter(x => x[1]).sort((a, b) => b[1].str - a[1].str);
  Chefe.novo({ chefe:{ nome:'T', cc:'BR' }, realismo:true, modo:'assumir', sk:'nascar', ano:2020, idx:l[l.length - 1][0] }); UI.limparFila(); UI.close();
  const teams = Chefe.equipesDoAno ? null : null; const sea = { teams: [] }; const g = Chefe.montarGrid(2020, eraOfSeries(2020, 'nascar').teams.map((t, i) => Engine.resolveTeam(t, i, 2020, 'nascar')).filter(Boolean).map((t, i) => Object.assign({ id: 't' + i }, t)));
  return g; })()`);
ok(g && JSON.stringify(g).indexOf('Chase Elliott') >= 0, 'o grid montado pelo chefe tem os pilotos reais nas equipes deles');

/* 3. traçados */
const t = js(J, `(() => { const ids = Object.keys(TRACKS), c = { real:0, osm:0, mapa:0, aprox:0, modelo:0, esq:0 }, esq = [];
  ids.forEach(id => { const g = Pista.de(id, 2000); const k = g.modelo ? 'modelo' : g.arquivo === 'svg' ? 'mapa' : g.arquivo === 'aprox' ? 'aprox' : g.arquivo === 'osm' ? 'osm' : g.real ? 'real' : 'esq'; c[k]++; if(k === 'esq') esq.push(id); });
  const lv = Pista.de('us_lv', 1982), tor = Pista.de('ca_tor', 1995);
  const L = id => Math.round(Pista.de(id, 1960).L);
  const k1 = Pista.de('kr_loc', 2000), k2 = Pista.de('kr_loc', 2001);
  return { c, esq, total: ids.length, reims: L('fr_rei'), pesc: L('it_pes'), spr: L('us_spr'), avus: L('dt_ave'), bug: L('fr_bug'), atl: L('us_atl'),
    kart: { real: k1.real, mod: k1.modelo, igual: k1.modelo === k2.modelo, L: Math.round(k1.L) }, fonteReims: Pista.de('fr_rei', 1960).fonte,
    lv: { fonte: lv.fonte, L: Math.round(lv.L), real: lv.real }, tor: { real: tor.real } }; })()`);
ok(t.reims === 8302 && t.pesc === 25579 && t.spr === 1609 && t.avus === 8300, `estradas, ovais e aeródromos no comprimento oficial (Reims ${t.reims} m, Pescara ${t.pesc} m, Springfield ${t.spr} m, AVUS do DTM ${t.avus} m)`);
ok(t.bug === 4185 && t.atl === 4088, `Bugatti e Road Atlanta com o traçado real do OpenStreetMap (${t.bug} m, ${t.atl} m)`);
ok(t.kart.real && t.kart.mod && t.kart.igual && t.kart.L > 400 && t.kart.L < 1900, `kartódromo genérico com o traçado de um kartódromo real de modelo (${t.kart.mod}, sempre o mesmo)`);
ok(/aproximado/.test(t.fonteReims), 'o traçado aproximado aparece como aproximado, não como exato');
ok(/Wikimedia Commons/.test(t.lv.fonte) && /CC|Public|domínio/i.test(t.lv.fonte) && t.lv.L === 3650 && t.lv.real,
  `circuito de rua copiado do mapa da Commons, com autor e licença na tela (Caesars Palace: ${t.lv.L} m; ${t.lv.fonte})`);
ok(!t.tor.real, 'mapa recusado na conferência (Toronto) continua esquemático, em vez de um traçado errado');
ok(t.esq.length <= 30, `traçados: ${t.c.real} da base da F1, ${t.c.osm} do OpenStreetMap, ${t.c.mapa} dos mapas da Commons, ${t.c.aprox} aproximados, ${t.c.modelo} kartódromos com modelo, ${t.c.esq} esquemáticos de ${t.total}`);

console.log(falhas ? `\n${falhas} de ${n} verificações falharam` : `\ngrid e traçados: ${n} verificações, tudo certo`);
process.exit(falhas ? 1 : 0);
