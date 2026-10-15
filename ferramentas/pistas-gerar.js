/* Gera o bloco de traçados reais do jogo a partir do bacinger/f1-circuits (MIT).
   Uso: node ferramentas/pistas-gerar.js   → reescreve o bloco PISTAS_REAIS no index.html

   Para cada circuito:
   - projeta longitude/latitude em metros (equirretangular no centro da pista);
   - ajusta a escala ao comprimento oficial do arquivo (anota o fator);
   - garante o sentido de corrida (Singapura e Paul Ricard vêm invertidos na
     lista; conferido contra as vias de mão única do OpenStreetMap);
   - mantém o primeiro ponto, que no arquivo é a linha de chegada;
   - grava os vértices em decímetros, como diferenças, para caber no HTML.

   A faixa de anos de cada versão vem do histórico de reformas de cada
   autódromo; onde não há certeza, o registro diz "aproximado". */
const fs = require('fs'), path = require('path');
const DIR = path.join(__dirname, 'terceiros', 'f1c', 'f1-circuits-master', 'circuits');
const ARQ = path.join(__dirname, '..', 'index.html');

/* arquivo → ids do jogo, primeira temporada desta configuração, sentido, boxes, notas */
const MAPA = [
  ['br-1940', ['br_int'], 1990, null, { pit:'esq', nota:'Traçado atual de 4.309 m, em uso desde 1990.' }],
  ['br-1977', ['br_jac'], 1978, null, { pit:null, aprox:'sentido de circulação não confirmado em segunda fonte' }],
  ['it-1922', ['it','dt_mon'], 2000, null, { pit:'dir', nota:'Variante del Rettifilo na forma atual desde 2000.' }],
  ['mc-1929', ['mc'], 2003, null, { pit:null, aprox:'versões anteriores a 2003 diferem em detalhes (piscina, Rascasse)' }],
  ['gb-1948', ['gb','gb_70'], 2011, null, { pit:null, nota:'Arena e reta dos boxes nova, desde 2011.' }],
  ['be-1925', ['be','dt_spa'], 2007, null, { pit:null, nota:'Bus Stop atual desde 2007.' }],
  ['de-1932', ['de_hoc','dt_hoc'], 2002, null, { pit:null, nota:'Hockenheim encurtado, desde 2002.' }],
  ['de-1927', ['de_nur'], 2002, null, { pit:null, nota:'GP-Strecke com a Mercedes Arena, desde 2002.' }],
  ['hu-1986', ['hu'], 2003, null, { pit:null }],
  ['es-1991', ['es_cat'], 2007, null, { pit:null, aprox:'a chicane da última curva mudou em 2007 e saiu em 2023; não verificado qual versão o arquivo traz' }],
  ['at-1969', ['at_ost','at_sty','dt_spi'], 1996, null, { pit:null, nota:'Traçado do A1-Ring, mantido no Red Bull Ring.' }],
  ['jp-1962', ['jp_suz'], 2003, null, { pit:null }],
  ['ca-1978', ['ca_ste'], 2002, null, { pit:null, aprox:'mudanças pequenas antes de 2002' }],
  ['au-1953', ['au_mel'], 2022, null, { pit:null, nota:'Reforma de 2022.' }],
  ['my-1999', ['my'], 1999, null, { pit:null }],
  ['cn-2004', ['cn'], 2004, null, { pit:null }],
  ['bh-2002', ['bh'], 2004, null, { pit:null, aprox:'em 2010 a F1 usou o traçado longo' }],
  ['tr-2005', ['tr'], 2005, null, { pit:null }],
  ['sg-2008', ['sg'], 2023, true, { pit:null, aprox:'traçado de 2023 em diante; entre 2008 e 2022 havia o trecho sob a arquibancada da baía' }],
  ['ae-2009', ['ae'], 2021, null, { pit:null, nota:'Reforma de 2021.' }],
  ['us-2012', ['us_cot','ns_cot'], 2012, null, { pit:null }],
  ['mx-1962', ['mx'], 2015, null, { pit:null, nota:'Traçado da volta da F1, desde 2015.' }],
  ['az-2016', ['az'], 2016, null, { pit:null }],
  ['ru-2014', ['ru'], 2014, null, { pit:null }],
  ['sa-2021', ['sa'], 2021, null, { pit:null }],
  ['qa-2004', ['qa'], 2004, null, { pit:null }],
  ['us-2022', ['us_mia'], 2022, null, { pit:null }],
  ['us-2023', ['us_lvs'], 2023, null, { pit:null }],
  ['nl-1948', ['nl','dt_zan'], 2020, null, { pit:null, nota:'Reforma com curvas inclinadas, desde 2020; a inclinação não está modelada.' }],
  ['pt-2008', ['pt_alg'], 2008, null, { pit:null }],
  ['pt-1972', ['pt_est'], 1994, null, { pit:null, aprox:'chicane de 1994; antes o traçado era diferente' }],
  ['fr-1969', ['fr_ric'], 2018, true, { pit:null, aprox:'configuração da F1 de 2018 e 2019; nos anos 70 e 80 era outra' }],
  ['fr-1960', ['fr_mag'], 2003, null, { pit:null }],
  ['it-1953', ['it_imo','it_imo2','dt_imo'], 2008, null, { pit:null, aprox:'a Variante Bassa saiu entre 2006 e 2008' }],
  ['it-1914', ['it_mug'], 1974, null, { pit:null }],
  ['us-1909', ['us_ind'], 2000, null, { pit:null, ate:2007, aprox:'traçado misto usado pela F1 de 2000 a 2007' }],
  ['us-1956', ['us_wat'], 1975, null, { pit:null, aprox:'chicane interna desde 1975' }],
  ['za-1961', ['za'], 2015, null, { pit:null, aprox:'traçado reformado; a F1 correu em versões anteriores' }],
  ['ar-1952', ['ar'], 1995, null, { pit:null, ate:1998, aprox:'versão da F1 de 1995 a 1998, não confirmada' }],
  ['es-2026', ['es_mad'], 2026, null, { pit:null }]
];

function ler(id){
  const f = JSON.parse(fs.readFileSync(path.join(DIR, id + '.geojson'), 'utf8')).features[0];
  return { prop: f.properties, c: f.geometry.coordinates };
}
const R = 6371008.8;
const saida = {};
for(const [arq, ids, de, inverter, extra] of MAPA){
  const { prop, c } = ler(arq);
  const lat0 = c.reduce((s, p) => s + p[1], 0) / c.length * Math.PI / 180;
  const lon0 = c.reduce((s, p) => s + p[0], 0) / c.length;
  const latm = c.reduce((s, p) => s + p[1], 0) / c.length;
  let pts = c.map(p => [(p[0] - lon0) * Math.PI / 180 * R * Math.cos(lat0), (p[1] - latm) * Math.PI / 180 * R]);
  /* laço fechado: o último ponto repete o primeiro */
  const fechado = Math.hypot(pts[0][0] - pts[pts.length - 1][0], pts[0][1] - pts[pts.length - 1][1]) < 1;
  if(fechado) pts = pts.slice(0, -1);
  if(inverter) pts = [pts[0]].concat(pts.slice(1).reverse());
  let comp = 0;
  for(let i = 0; i < pts.length; i++){ const a = pts[i], b = pts[(i + 1) % pts.length]; comp += Math.hypot(b[0] - a[0], b[1] - a[1]); }
  const oficial = prop.length || comp;
  const fator = Math.abs(oficial / comp - 1) < .06 ? oficial / comp : 1;
  pts = pts.map(p => [p[0] * fator, p[1] * fator]);
  /* decímetros, em diferenças */
  const dm = []; let px = 0, py = 0;
  pts.forEach(p => { const x = Math.round(p[0] * 10), y = Math.round(p[1] * 10); dm.push(x - px, y - py); px = x; py = y; });
  const reg = { f: arq, nome: prop.Name, de, comp: Math.round(oficial), alt: prop.altitude || null,
                esc: +(fator).toFixed(4), pts: dm.join(',') };
  if(extra.ate) reg.ate = extra.ate;
  if(extra.pit) reg.pit = extra.pit;
  if(extra.nota) reg.nota = extra.nota;
  if(extra.aprox) reg.aprox = extra.aprox;
  if(inverter) reg.inv = 1;
  ids.forEach(id => { saida[id] = arq; });
  saida['#' + arq] = reg;
  console.log(arq.padEnd(8), String(pts.length).padStart(4), 'pts · medido', comp.toFixed(0), '· oficial', oficial, '· escala', fator.toFixed(3), '·', ids.join(','));
}
/* a licença MIT vai junto com os dados, inteira, como ela pede */
const LICENCA = fs.readFileSync(path.join(DIR, '..', 'LICENSE.md'), 'utf8').trim()
  .replace(/\*\//g, '* /').split(/\r?\n/).map(l => ('   ' + l).trimEnd()).join('\n');
const js = `/* ═══ PISTAS REAIS (gerado por ferramentas/pistas-gerar.js — não editar à mão) ═══
   Traçados: bacinger/f1-circuits (https://github.com/bacinger/f1-circuits), licença MIT.
   Desenhos não oficiais, feitos pelo autor sobre mapa; escala ajustada ao comprimento
   oficial de cada arquivo. "#arquivo" guarda o traçado; o id do jogo aponta para ele.

${LICENCA} */
const PISTAS_REAIS = ${JSON.stringify(saida)};
/* ═══ FIM DAS PISTAS REAIS ═══ */`;
let h = fs.readFileSync(ARQ, 'utf8');
const i0 = h.indexOf('/* ═══ PISTAS REAIS (gerado'), i1 = h.indexOf('/* ═══ FIM DAS PISTAS REAIS ═══ */');
if(i0 >= 0 && i1 > i0) h = h.slice(0, i0) + js + h.slice(i1 + '/* ═══ FIM DAS PISTAS REAIS ═══ */'.length);
else {
  /* primeira vez: logo depois do registro de circuitos */
  const ancora = '].forEach(t=>TRACKS[t[0]]={id:t[0], gp:t[1], circ:t[2], cc:t[3], type:t[4], rainP:t[5]/100});';
  const k = h.indexOf(ancora);
  if(k < 0) throw new Error('âncora do TRACKS');
  h = h.slice(0, k + ancora.length) + '\n\n' + js + '\n' + h.slice(k + ancora.length);
}
fs.writeFileSync(ARQ, h);
console.log('\nbloco gravado:', (js.length / 1024).toFixed(1), 'KB');
