/* ══════════════════════════════════════════════════════════════════
   TRAÇADOS REAIS DO OPENSTREETMAP
   Para cada circuito do jogo que ainda não tem traçado real:
   1. acha o lugar: o artigo do circuito na Wikipedia (coordenadas e
      comprimento oficial) ou, na falta dele, o buscador do OpenStreetMap;
   2. baixa as vias de corrida (highway=raceway) em volta, pela Overpass API;
   3. monta o grafo das vias — respeitando o sentido de mão única, que é o
      sentido da corrida — e procura os anéis fechados;
   4. fica com o anel cujo comprimento bate com o oficial (±12 %); sem
      comprimento oficial, o mais longo dentro do que o tipo de pista permite;
   5. projeta em metros e grava no formato do jogo (decímetros, diferenças).
   O que não fecha um anel confiável continua esquemático, e o relatório diz.
   Uso: node ferramentas/pistas-osm.mjs [ids|todos]
   Dados do mapa © colaboradores do OpenStreetMap (ODbL). */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { gzipSync, gunzipSync } from 'node:zlib';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, '..');
const CACHE = join(AQUI, 'pistas-osm', 'cache');
mkdirSync(CACHE, { recursive: true });
const UA = 'VolanteDeOuro-tracks/1.0 (https://github.com/valdirboasorte/volante-de-ouro; fan project, contact via GitHub)';
const dorme = ms => new Promise(r => setTimeout(r, ms));
const require = createRequire(import.meta.url);
const { carregar } = require(join(RAIZ, 'testes', 'base.js'));
const J = carregar({ semHistorico: true, silencioso: true });
const TRACKS = J.run('TRACKS'), PISTAS_REAIS = J.run('PISTAS_REAIS');

/* ── rede, com cache e pausa por serviço ── */
const ultimo = {};
async function pegar(servico, url, opcoes, pausa){
  const chave = (url + (opcoes && opcoes.body ? '|' + opcoes.body : '')).replace(/[^\w.-]+/g, '_');
  const f = join(CACHE, chave.slice(0, 120) + '_' + (Buffer.from(chave).reduce((a, b) => (a * 31 + b) >>> 0, 7)).toString(36) + '.json.gz');
  if(existsSync(f)) return JSON.parse(gunzipSync(readFileSync(f)).toString('utf8'));
  for(let t = 0; t < 5; t++){
    const espera = (ultimo[servico] || 0) + pausa - Date.now(); if(espera > 0) await dorme(espera);
    ultimo[servico] = Date.now();
    let r;
    try { r = await fetch(url, Object.assign({ headers: { 'User-Agent': UA, 'Api-User-Agent': UA, 'Content-Type': 'application/x-www-form-urlencoded' } }, opcoes || {})); }
    catch(e){ await dorme(5000 * (t + 1)); continue; }
    if(r.status === 429 || r.status >= 500){ await dorme(10000 * (t + 1)); continue; }
    const j = await r.json().catch(() => null);
    if(!j){ await dorme(5000); continue; }
    writeFileSync(f, gzipSync(JSON.stringify(j)));
    return j;
  }
  throw new Error(servico + ' não respondeu');
}
const wiki = (lang, params) => pegar('wiki', `https://${lang}.wikipedia.org/w/api.php?` + new URLSearchParams(Object.assign({ format: 'json', formatversion: '2' }, params)), null, 700);
const nominatim = q => pegar('nominatim', 'https://nominatim.openstreetmap.org/search?' + new URLSearchParams({ q, format: 'jsonv2', limit: '5' }), null, 1200);
const overpass = async q => {
  try { return await pegar('overpass', 'https://overpass-api.de/api/interpreter', { method: 'POST', body: 'data=' + encodeURIComponent(q) }, 4000); }
  catch(e){ return pegar('overpass2', 'https://overpass.kumi.systems/api/interpreter', { method: 'POST', body: 'data=' + encodeURIComponent(q) }, 4000); }
};

/* ── o que procurar para cada circuito (o nome do jogo nem sempre é o do artigo) ── */
const BUSCA = {
  es_zue: 'Circuito Internacional de Zuera', kt_zue: 'Circuito Internacional de Zuera karting', it_mod: 'Aerautodromo di Modena',
  it_pes: 'Pescara Circuit', it_sir: 'Syracuse Circuit', it_bar: 'Bari Grand Prix circuit', it_nap: 'Posillipo circuit Naples Grand Prix',
  fr_rei: 'Reims-Gueux', fr_rou: 'Rouen-Les-Essarts', fr_cle: 'Charade Circuit', fr_dij: 'Dijon-Prenois', fr_pau: 'Pau Circuit',
  fr_bug: 'Bugatti Circuit', fr_alb: "Circuit d'Albi", fr_cae: 'Circuit de la Prairie Caen', be_chi: 'Chimay Street Circuit',
  be_niv: 'Nivelles-Baulers', be_zol: 'Circuit Zolder', de: 'Nürburgring Nordschleife', de_avu: 'AVUS', ch: 'Bremgarten Circuit',
  at: 'Zeltweg Air Base circuit', se: 'Scandinavian Raceway', es_ped: 'Pedralbes Circuit', es_mon: 'Montjuïc circuit',
  es_jar: 'Circuito del Jarama', es_jer: 'Circuito de Jerez', es_val: 'Valencia Street Circuit', pt_por: 'Circuito da Boavista',
  pt_lis: 'Monsanto Park Circuit', indy: 'Indianapolis Motor Speedway', us_seb: 'Sebring International Raceway',
  us_riv: 'Riverside International Raceway', us_lbh: 'Long Beach street circuit', us_det: 'Detroit street circuit',
  us_dal: 'Fair Park Dallas Grand Prix', us_phx: 'Phoenix street circuit', us_lv: 'Caesars Palace Grand Prix circuit',
  ca_mos: 'Canadian Tire Motorsport Park', ca_mtt: 'Circuit Mont-Tremblant', za_eas: 'Prince George Circuit',
  ma: 'Ain-Diab Circuit', jp: 'Fuji Speedway', jp_aid: 'Okayama International Circuit', kr: 'Korea International Circuit',
  in: 'Buddh International Circuit', bh_out: 'Bahrain International Circuit outer', au_ade: 'Adelaide Street Circuit',
  fr_lem: 'Circuit de la Sarthe', it_tar: 'Circuito Piccolo delle Madonie', it_mil: 'Mille Miglia', se_kri: 'Råbelövsbanan',
  au_san: 'Sandown Raceway', jp_sug: 'Sportsland Sugo', jp_aut: 'Autopolis', us_atl: 'Road Atlanta',
  fe_ber: 'Tempelhof Airport Street Circuit', fe_rom: 'Circuito Cittadino dell\'EUR', fe_mco: 'Circuit de Monaco',
  fe_nyc: 'Brooklyn Street Circuit', fe_lon: 'ExCeL London circuit', fe_mex: 'Autódromo Hermanos Rodríguez',
  fe_san: "Parque O'Higgins Circuit", fe_hkg: 'Hong Kong Central Harbourfront Circuit', fe_mar: 'Circuit International Automobile Moulay El Hassan',
  fe_par: 'Paris street circuit Invalides', fe_pun: 'Punta del Este Street Circuit', fe_bue: 'Puerto Madero Street Circuit',
  fe_jak: 'Jakarta International e-Prix Circuit', fe_por: 'Portland International Raceway', fe_sha: 'Shanghai International Circuit',
  fe_tok: 'Tokyo Street Circuit', fe_mis: 'Misano World Circuit Marco Simoncelli', fe_dir: 'Riyadh Street Circuit',
  fe_sao: 'São Paulo Street Circuit Anhembi', fe_jed: 'Jeddah Corniche Circuit', fe_mia: 'Biscayne Bay Street Circuit',
  fe_lbh: 'Long Beach street circuit', fe_mos: 'Moscow Street Circuit',
  dt_nor: 'Norisring', dt_nur: 'Nürburgring', dt_bra: 'Brands Hatch', dt_lau: 'Lausitzring', dt_osc: 'Motorsport Arena Oschersleben',
  dt_zol: 'Circuit Zolder', dt_mis: 'Misano World Circuit Marco Simoncelli', dt_ass: 'TT Circuit Assen', dt_ave: 'AVUS',
  dt_die: 'Flugplatzrennen Diepholz', dt_wun: 'Wunstorf airfield circuit', dt_sal: 'Salzburgring', dt_don: 'Donington Park',
  it_val: 'Vallelunga Circuit', it_cre: 'Cremona Circuit', it_fra: 'Autodromo di Franciacorta', it_mis: 'Misano World Circuit Marco Simoncelli',
  it_mon: 'Monza Circuit', de_osc: 'Motorsport Arena Oschersleben', de_sac: 'Sachsenring', de_lau: 'Lausitzring',
  gb_oul: 'Oulton Park', gb_cro: 'Croft Circuit', gb_thr: 'Thruxton Circuit', gb_kno: 'Knockhill Racing Circuit', gb_sil: 'Silverstone Circuit',
  es_ara: 'MotorLand Aragón', es_nav: 'Circuito de Navarra', es_por: 'Algarve International Circuit', fr_nog: 'Circuit Paul Armagnac',
  fr_led: 'Circuit de Lédenon', fr_cro: 'Circuit de Croix-en-Ternois', jp_oka: 'Okayama International Circuit', jp_fuj: 'Fuji Speedway',
  br_goi: 'Autódromo Internacional Ayrton Senna (Goiânia)', br_cur: 'Autódromo Internacional de Curitiba', br_cas: 'Autódromo Zilmar Beux',
  br_tar: 'Autódromo Internacional de Tarumã', br_scs: 'Autódromo Internacional de Santa Cruz do Sul', br_lon: 'Autódromo Internacional Ayrton Senna (Londrina)',
  br_cgr: 'Autódromo Internacional Orlando Moura', br_bsb: 'Autódromo Internacional Nelson Piquet (Brasília)', br_sal: 'Circuito de Salvador Stock Car',
  br_vel: 'Velopark', br_vlc: 'Autódromo Velocitta', br_gua: 'Autódromo Internacional de Guaporé', br_bh: 'Circuito da Pampulha Stock Car',
  br_car: 'Autódromo Internacional de Caruaru', br_mog: 'Autódromo Velocitta', br_vel2: 'Autódromo Velocitta', br_int2: 'Autódromo José Carlos Pace',
  ar_tdh: 'Autódromo Termas de Río Hondo',
  kt_int: 'Kartódromo Ayrton Senna Interlagos', kb_int: 'Kartódromo Ayrton Senna Interlagos', kt_lon: 'South Garda Karting Lonato',
  kt_gen: 'Karting Genk Horensbergdam', kt_ker: 'Erftlandring Kerpen', kt_lem: 'Circuit Alain Prost Le Mans karting',
  kt_pfi: 'PF International Kart Circuit', kt_sar: 'Circuito Internazionale Napoli Sarno', kt_wac: 'Prokart Raceland Wackersdorf',
  kt_sal: 'Circuit de Salbris karting', kt_alg: 'Kartódromo Internacional do Algarve', kt_bir: 'Kartódromo de Birigui',
  kt_new: 'New Castle Motorsports Park', kt_oca: 'Ocala Gran Prix', kt_gra: 'Kartódromo Granja Viana', kt_ald: 'Kartódromo Aldeia da Serra',
  kb_gra: 'Kartódromo Granja Viana', kb_ald: 'Kartódromo Aldeia da Serra', kb_bir: 'Kartódromo de Birigui', kb_lon: 'Kartódromo de Londrina',
  kb_cas: 'Kartódromo de Cascavel', kb_par: 'Kartódromo Paladino', kb_bh: 'Kartódromo RMBH',
  kt_adr: 'Adria Karting Raceway', kt_fra: 'Franciacorta Karting Track', kt_cas2: 'Castelletto di Branduzzo kart', kt_sie: 'Siena kart circuit',
  kt_amp: 'Kartbahn Ampfing', kt_osc2: 'Kartbahn Oschersleben', kt_hah: 'Kartbahn Hahn Wackersdorf', kt_ang: 'Circuit d\'Angerville karting',
  kt_ost: 'Circuit Ostricourt karting', kt_var: 'Circuit de Varennes karting', kt_she: 'Shenington Kart Racing Club',
  kt_row: 'Rowrah Kart Circuit', kt_whi: 'Whilton Mill', kt_kim: 'Kimbolton kart circuit', kt_cam: 'Karting Campillos',
  kt_rec: 'Karting Recas', kt_chi2: 'Kartodromo Lucas Guerrero Chiva', kt_pit: 'Pittsburgh International Race Complex',
  kt_nor: 'Norway Indiana kart track', kt_dou: 'Dousman Raceway'
};
/* pistas inventadas pelo jogo (kartódromos regionais genéricos): ficam esquemáticas */
const GENERICAS = new Set(['kr_loc', 'kr_cli', 'kr_int', 'kr_reg', 'kr_est']);
const PAIS = { GB:'United Kingdom', BE:'Belgium', FR:'France', IT:'Italy', DE:'Germany', CH:'Switzerland', AT:'Austria', SE:'Sweden', ES:'Spain',
  PT:'Portugal', US:'United States', CA:'Canada', ZA:'South Africa', MA:'Morocco', JP:'Japan', KR:'South Korea', IN:'India', BH:'Bahrain',
  AU:'Australia', BR:'Brazil', AR:'Argentina', NL:'Netherlands', MX:'Mexico', CL:'Chile', HK:'Hong Kong', UY:'Uruguay', ID:'Indonesia',
  CN:'China', SA:'Saudi Arabia', RU:'Russia', MC:'Monaco' };

const kartId = id => /^(kt_|kb_|kr_)/.test(id);
/* faixa de comprimento plausível por tipo (sem comprimento oficial) */
function faixa(id, t){
  if(kartId(id)) return [500, 1800];
  if(t.type === 'oval') return /dirt|terra/i.test(t.circ) ? [400, 1700] : [800, 4300];
  if(id === 'de') return [20000, 23000];
  if(id === 'fr_lem') return [13000, 14000];
  if(t.type === 'street') return [1500, 7500];
  return [1800, 8000];
}

/* ── 1. o lugar e o comprimento oficial ── */
const km = s => { const m = String(s).replace(/,/g, '.').match(/[\d.]+/); return m ? parseFloat(m[0]) : null; };
async function lugar(id, t){
  const q = BUSCA[id] || `${t.circ} ${t.type === 'oval' ? 'Speedway' : kartId(id) ? 'kart' : 'circuit'}`;
  const langs = t.cc === 'BR' ? ['pt', 'en'] : ['en'];
  for(const lang of langs){
    const s = await wiki(lang, { action: 'query', list: 'search', srsearch: q, srlimit: '4' });
    for(const r of (s.query && s.query.search) || []){
      const c = await wiki(lang, { action: 'query', prop: 'coordinates|revisions', rvprop: 'content', rvslots: 'main', titles: r.title, redirects: '1' });
      const p = c.query && c.query.pages && c.query.pages[0];
      if(!p || !p.coordinates || !p.coordinates.length) continue;
      const txt = (p.revisions && p.revisions[0] && p.revisions[0].slots && p.revisions[0].slots.main.content) || '';
      /* o comprimento do traçado principal no infobox: length_km, ou length_mi */
      let L = null;
      const mk = txt.match(/\|\s*(?:length_km|length_km1|comprimento_km|comprimento)\s*=\s*([\d.,]+)/i);
      const mm = txt.match(/\|\s*(?:length_mi|length_mi1)\s*=\s*([\d.,]+)/i);
      if(mk) L = km(mk[1]) * (km(mk[1]) > 100 ? 1 : 1000);
      else if(mm) L = km(mm[1]) * 1609.34;
      if(L && (L < 300 || L > 30000)) L = null;
      return { lat: p.coordinates[0].lat, lon: p.coordinates[0].lon, titulo: `${lang}:${p.title}`, L, via: 'wikipedia' };
    }
  }
  const n = await nominatim(`${(BUSCA[id] || t.circ)}, ${PAIS[t.cc] || ''}`);
  if(Array.isArray(n) && n.length) return { lat: +n[0].lat, lon: +n[0].lon, titulo: 'osm:' + n[0].display_name.slice(0, 80), L: null, via: 'nominatim' };
  return null;
}

/* ── 2. as vias de corrida em volta ── */
async function vias(lat, lon, raio){
  const q = `[out:json][timeout:90];(way(around:${raio},${lat},${lon})["highway"="raceway"];);out body geom;`;
  const j = await overpass(q);
  return (j.elements || []).filter(e => e.type === 'way' && e.geometry);
}

/* circuitos de estrada antigos costumam estar mapeados como relação de rota com o nome do circuito */
const GENERICAS_NOME = /^(circuit|circuito|circuitos|street|park|international|internacional|raceway|speedway|autodromo|autódromo|motor|race|track|de|da|do|di|del|des|la|le|the|and|grand|prix|gp|city|cittadino)$/i;
function chaveDe(titulo){
  const ws = String(titulo || '').replace(/^\w+:/, '').replace(/\(.*?\)/g, ' ').split(/[\s\-–,']+/).filter(w => w.length >= 4 && !GENERICAS_NOME.test(w));
  return ws.slice(0, 2).map(w => w.replace(/[.*+?^${}()|[\]\\"]/g, '')).join('|');
}
async function rotas(lat, lon, raio, chave){
  if(!chave) return [];
  const q = `[out:json][timeout:90];(relation(around:${raio},${lat},${lon})["name"~"${chave}",i];);out body geom;`;
  const j = await overpass(q);
  const out = [];
  (j.elements || []).forEach(r => (r.members || []).forEach((m, k) => {
    if(m.type === 'way' && m.geometry && m.geometry.length > 1) out.push({ id: 'r' + r.id + '-' + k, tags: { name: (r.tags && r.tags.name) || '' }, geometry: m.geometry });
  }));
  return out;
}

/* ── 3. o grafo e os anéis ── */
const R0 = 6371008.8;
function metros(lat0, lon0){
  const c = Math.cos(lat0 * Math.PI / 180);
  return (lat, lon) => [(lon - lon0) * Math.PI / 180 * R0 * c, (lat - lat0) * Math.PI / 180 * R0];
}
function aneis(ways, alvo, kart, proj, faixaL){
  /* vias que não são a pista: boxes, acesso, área de serviço */
  const ruim = w => { const t = w.tags || {}; const n = (t.name || '') + ' ' + (t.ref || '');
    /* só o que é de fato pit lane ou acesso: "Paddock Hill Bend" é curva de Brands Hatch */
    return /\bpit\b|pit ?lane|pitlane|pit road|boxengasse|boxenstra|voie des stands|corsia box|drag ?strip|dragstrip|\bacesso\b|service road/i.test(n)
      || /pit/.test(t.raceway || '') || t.service || t.area === 'yes'; };
  const ehKart = w => { const t = w.tags || {}; return t.sport === 'karting' || /kart/i.test(t.name || ''); };
  let usar = ways.filter(w => !ruim(w));
  if(kart){ const k = usar.filter(ehKart); if(k.length) usar = k; }
  else usar = usar.filter(w => !ehKart(w));
  /* nós compartilhados viram cruzamentos (pela coordenada: vale para vias e
     para os trechos de uma relação de rota, que vêm sem o número do nó) */
  const nk = g => g.lat.toFixed(6) + ',' + g.lon.toFixed(6);
  usar.forEach(w => { w.chaves = w.geometry.map(nk); });
  const uso = new Map();
  usar.forEach(w => w.chaves.forEach((nd, i) => uso.set(nd, (uso.get(nd) || 0) + (i === 0 || i === w.chaves.length - 1 ? 2 : 1))));
  const arestas = [];
  usar.forEach(w => {
    const t = w.tags || {}, mao = t.oneway === 'yes' || t.oneway === '1' ? 1 : t.oneway === '-1' ? -1 : 0;
    let ini = 0;
    for(let i = 1; i < w.chaves.length; i++){
      if(uso.get(w.chaves[i]) > 1 || i === w.chaves.length - 1){
        const pts = w.geometry.slice(ini, i + 1).map(g => proj(g.lat, g.lon));
        let L = 0; for(let k = 1; k < pts.length; k++) L += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]);
        const a = w.chaves[ini], b = w.chaves[i];
        if(mao >= 0) arestas.push({ de: a, para: b, pts, L, w: w.id, nome: t.name || '' });
        if(mao <= 0) arestas.push({ de: b, para: a, pts: pts.slice().reverse(), L, w: w.id, nome: t.name || '', volta: true });
        ini = i;
      }
    }
  });
  const saem = new Map();
  arestas.forEach((e, k) => { e.k = k; (saem.get(e.de) || saem.set(e.de, []).get(e.de)).push(e); });
  const maxL = alvo ? alvo * 1.15 : faixaL[1];
  const achados = [];
  let passos = 0;
  /* busca em profundidade a partir de cada aresta, sem repetir nó */
  for(const e0 of arestas){
    const pilha = [[e0]], visto = new Set([e0.de]);
    const dfs = (cam, L) => {
      if(passos++ > 400000) return;
      const ult = cam[cam.length - 1];
      if(ult.para === e0.de){ achados.push({ cam: cam.slice(), L }); return; }
      if(visto.has(ult.para)) return;
      visto.add(ult.para);
      for(const e of saem.get(ult.para) || []){
        if(e.w === ult.w && e.volta !== ult.volta && e.de === ult.para && e.para === ult.de) continue;   /* não dá meia-volta */
        if(L + e.L > maxL) continue;
        if(e.k < e0.k) continue;                                 /* cada anel uma vez: começa na menor aresta */
        cam.push(e); dfs(cam, L + e.L); cam.pop();
      }
      visto.delete(ult.para);
    };
    dfs([e0], e0.L);
    if(passos > 400000) break;
  }
  return achados;
}
/* quão "redondo" é o anel: 1 num círculo, perto de 0 num anel torto e fino */
function redondeza(a){
  const p = a.cam.flatMap(e => e.pts);
  let A = 0; for(let i = 0; i < p.length; i++){ const q = p[(i + 1) % p.length]; A += p[i][0] * q[1] - q[0] * p[i][1]; }
  return 4 * Math.PI * Math.abs(A / 2) / (a.L * a.L);
}
function escolher(achados, alvo, faixaL, oval){
  const bons = achados.filter(a => a.L >= faixaL[0] * .85);
  if(!bons.length) return null;
  /* num oval, o comprimento da Wikipedia muitas vezes é o do misto (Motegi, Daytona)
     e o anel do comprimento certo pode passar pelo miolo (Indianápolis): vale o anel
     maior e mais redondo do tamanho de um oval, com preferência pelo que confere */
  if(oval){
    const cand = bons.filter(a => a.L >= faixaL[0] && a.L <= faixaL[1]);
    if(cand.length){
      const maior = Math.max(...cand.map(a => a.L));
      const nota = a => redondeza(a) * Math.sqrt(a.L / maior) * (alvo && Math.abs(a.L - alvo) / alvo <= .12 ? 1.15 : 1);
      cand.sort((a, b) => nota(b) - nota(a));
      const m = cand[0];
      return Object.assign(m, { conf: 'oval: o anel maior e mais redondo (' + Math.round(m.L) + ' m' + (alvo ? '; a Wikipedia dá ' + Math.round(alvo) + ' m' : '') + ')' });
    }
  }
  if(alvo){
    bons.sort((a, b) => Math.abs(a.L - alvo) - Math.abs(b.L - alvo));
    const m = bons[0];
    return Math.abs(m.L - alvo) / alvo <= .12 ? Object.assign(m, { conf: 'comprimento oficial confere (' + Math.round(m.L) + ' m contra ' + Math.round(alvo) + ' m)' }) : null;
  }
  bons.sort((a, b) => b.L - a.L);
  const m = bons.find(a => a.L <= faixaL[1]);
  return m ? Object.assign(m, { conf: 'sem comprimento oficial; anel mais longo plausível para o tipo (' + Math.round(m.L) + ' m)' }) : null;
}

/* ── 4. o anel vira pontos do jogo ── */
function simplificar(pts, tol){
  if(pts.length < 3) return pts;
  const d = (p, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy; if(!L2) return Math.hypot(p[0] - a[0], p[1] - a[1]);
    let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L2; t = Math.max(0, Math.min(1, t)); return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy); };
  const rec = (i, j, out) => { let m = -1, k = -1; for(let q = i + 1; q < j; q++){ const v = d(pts[q], pts[i], pts[j]); if(v > m){ m = v; k = q; } }
    if(m > tol){ rec(i, k, out); rec(k, j, out); } else out.push(pts[i]); };
  const out = []; rec(0, pts.length - 1, out); out.push(pts[pts.length - 1]); return out;
}
function codificar(cam){
  let pts = [];
  cam.forEach((e, k) => { pts = pts.concat(k ? e.pts.slice(1) : e.pts); });
  if(Math.hypot(pts[0][0] - pts[pts.length - 1][0], pts[0][1] - pts[pts.length - 1][1]) < 1) pts.pop();
  const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length, cy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
  pts = simplificar(pts.map(p => [p[0] - cx, p[1] - cy]), 1.2);
  let px = 0, py = 0;
  const v = [];
  pts.forEach(p => { const x = Math.round(p[0] * 10), y = Math.round(p[1] * 10); v.push(x - px, y - py); px = x; py = y; });
  return { pts: v.join(','), n: pts.length };
}

/* ── tudo junto ── */
const saidaArq = join(RAIZ, 'dados', 'tracados.js');
const anterior = existsSync(saidaArq) ? (() => { const ctx = {}; try { new Function('ctx', readFileSync(saidaArq, 'utf8').replace('var PISTAS_OSM', 'ctx.PISTAS_OSM'))(ctx); } catch(e){} return ctx.PISTAS_OSM || {}; })() : {};
const qual = process.argv[2] || 'todos';
const ids = Object.keys(TRACKS).filter(id => !PISTAS_REAIS[id] && (qual === 'todos' || qual.split(',').includes(id)));
const saida = Object.assign({}, anterior), log = [];
/* circuitos repetidos com outro id que já tem traçado real: apontam para ele */
const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const ALIAS = { dt_bra: 'gb_bra', dt_nur: 'de_nur', it_mon: 'it', gb_sil: 'gb', br_int2: 'br_int', jp_fuj: 'jp', fe_mco: 'mc', fe_mex: 'mx', fe_sha: 'cn',
  ns_ind: 'indy', ns_wat: 'us_wat', dt_zol: 'be_zol', it_mis: 'fe_mis', dt_mis: 'fe_mis', dt_ave: 'de_avu', dt_don: 'gb_don', de_osc: 'dt_osc',
  de_lau: 'dt_lau', jp_aid: 'jp_oka', es_por: 'pt_alg', ns_son: 'us_son', ns_riv: 'us_riv', fe_lbh: 'us_lbh', ns_cal: 'us_fon', ns_chi: 'us_chi',
  ns_tex: 'us_tex', ns_kan: 'us_kan', ns_nas: 'us_nas', ns_ric: 'us_ric', ns_day: 'us_day', ns_dayj: 'us_day', br_vel2: 'br_mog', br_mog: 'br_vlc',
  kb_gra: 'kt_gra', kb_ald: 'kt_ald', kb_bir: 'kt_bir', kb_int: 'kt_int' };
/* fase 1: onde fica cada circuito (Wikipedia é rápida) */
const lugares = {};
for(const id of ids){
  const t = TRACKS[id];
  if(GENERICAS.has(id)){ log.push([id, t.circ, 'genérica do jogo — esquemática']); continue; }
  if(ALIAS[id]) continue;                                   /* segunda passagem */
  if(saida[id] && !saida[id].alias && qual === 'todos') continue;   /* já feito numa rodada anterior */
  try {
    const lg = await lugar(id, t);
    if(!lg){ log.push([id, t.circ, 'não achei o lugar']); console.log(id, '— sem lugar'); continue; }
    lg.raio = id === 'de' ? 9000 : id === 'fr_lem' ? 8000 : kartId(id) ? 900 : t.type === 'oval' ? 1800 : lg.L ? Math.max(1500, Math.min(5000, lg.L * .55)) : 3000;
    lugares[id] = lg;
  } catch(e){ log.push([id, t.circ, 'erro: ' + e.message]); }
}
console.log(Object.keys(lugares).length + ' circuitos localizados');
/* fase 2: as vias de corrida de doze circuitos por consulta (GRUPO=n muda o tamanho) */
const viasDe = {};
const lista = Object.keys(lugares);
const dist = (a, b) => { const c = Math.cos(a.lat * Math.PI / 180); return Math.hypot((a.lat - b.lat) * 111320, (a.lon - b.lon) * 111320 * c); };
const TAM = +process.env.GRUPO || 12;
for(let k = 0; k < lista.length; k += TAM){
  const grupo = lista.slice(k, k + TAM);
  const q = '[out:json][timeout:180];(' + grupo.map(id => `way(around:${Math.round(lugares[id].raio)},${lugares[id].lat},${lugares[id].lon})["highway"="raceway"];`).join('') + ');out body geom;';
  let els = [];
  try { els = ((await overpass(q)).elements || []).filter(e => e.type === 'way' && e.geometry); }
  catch(e){ console.log('grupo', k, 'falhou:', e.message); }
  grupo.forEach(id => { const lg = lugares[id]; viasDe[id] = els.filter(w => w.geometry.some(p => dist(p, lg) <= lg.raio)); });
  console.log('vias: grupo', k / TAM + 1, 'de', Math.ceil(lista.length / TAM), '·', els.length, 'vias');
}
/* fase 3: o anel de cada um */
for(const id of lista){
  const t = TRACKS[id], lg = lugares[id];
  try {
    const fx = faixa(id, t);
    let ws = viasDe[id] || [];
    const proj = metros(lg.lat, lg.lon);
    let achados = ws.length ? aneis(ws, lg.L, kartId(id), proj, fx) : [];
    let m = escolher(achados, lg.L, fx, t.type === 'oval'), via = 'vias de corrida';
    if(!m && process.env.ROTAS){
      const rs = await rotas(lg.lat, lg.lon, Math.max(lg.raio, 6000), chaveDe(BUSCA[id] || lg.titulo));
      if(rs.length){
        const a2 = aneis(rs, lg.L, false, proj, fx);
        const m2 = escolher(a2, lg.L, fx, t.type === 'oval');
        if(m2){ m = m2; ws = rs; achados = a2; via = 'relação de rota'; }
      }
    }
    if(!ws.length){ log.push([id, t.circ, `sem vias de corrida no OSM perto de ${lg.titulo}`]); console.log(id, '— sem vias'); continue; }
    if(!m){ log.push([id, t.circ, `${ws.length} vias, ${achados.length} anéis, nenhum confere${lg.L ? ' com ' + Math.round(lg.L) + ' m' : ''} (${lg.titulo})`]); console.log(id, '— sem anel'); continue; }
    /* sem mão única no anel, o sentido é suposição: oval anti-horário; o resto, horário */
    const comMao = m.cam.some(e => /yes|1|-1/.test(String(((ws.find(w => w.id === e.w) || {}).tags || {}).oneway || '')));
    const cod = codificar(m.cam);
    saida[id] = { f: 'osm', nome: lg.titulo.replace(/^\w+:/, ''), comp: Math.round(lg.L && Math.abs(m.L - lg.L) / lg.L <= .12 ? lg.L : m.L), pts: cod.pts, de: 0,
      vias: [...new Set(m.cam.map(e => e.w))].slice(0, 40), sentido: comMao ? 'osm' : (t.type === 'oval' ? 'anti' : 'hor'),
      conf: m.conf + (via !== 'vias de corrida' ? ' (' + via + ')' : ''), wiki: lg.via === 'wikipedia' ? lg.titulo : null };
    log.push([id, t.circ, `ok: ${cod.n} pontos, ${m.conf}${comMao ? '' : ', sentido suposto'}`]);
    console.log(id, '— ok');
  } catch(e){ log.push([id, t.circ, 'erro: ' + e.message]); console.log(id, '— erro', e.message); }
}
/* segunda passagem: os circuitos repetidos apontam para o traçado do outro id */
for(const id of ids){
  const al = ALIAS[id];
  if(!al) continue;
  const t = TRACKS[id];
  if(PISTAS_REAIS[al] || (saida[al] && !saida[al].alias)){ saida[id] = { alias: al }; log.push([id, t.circ, 'mesmo circuito de ' + al]); }
  else log.push([id, t.circ, 'mesmo circuito de ' + al + ', que ainda não tem traçado']);
}
const ok = Object.keys(saida).filter(k => saida[k] && !saida[k].alias).length, al = Object.keys(saida).filter(k => saida[k] && saida[k].alias).length;
writeFileSync(saidaArq, `/* Traçados reais tirados do OpenStreetMap (© colaboradores do OpenStreetMap, ODbL),
   gerados por ferramentas/pistas-osm.mjs. Cada registro: pontos em decímetros
   (diferenças, x leste, y norte), comprimento oficial, as vias usadas e como o
   anel foi confirmado. "alias" aponta para outro circuito do jogo. */
var PISTAS_OSM = ${JSON.stringify(saida)};
`);
/* o relatório junta esta rodada com as anteriores: cada pista fica com a linha mais recente */
const relArq = join(AQUI, 'pistas-osm', 'RELATORIO.md');
const linhas = new Map();
if(existsSync(relArq)) readFileSync(relArq, 'utf8').split('\n').forEach(l => { const m = l.match(/^\| ([a-z0-9_]+) \| (.*) \| (.*) \|$/); if(m && m[1] !== 'id') linhas.set(m[1], [m[1], m[2], m[3]]); });
log.forEach(l => linhas.set(l[0], l));
/* quem já está no arquivo de saída e ficou sem linha (rodadas antigas) */
Object.keys(saida).forEach(k => { if(!linhas.has(k) && TRACKS[k]) linhas.set(k, [k, TRACKS[k].circ, saida[k].alias ? 'mesmo circuito de ' + saida[k].alias : 'ok: ' + (saida[k].conf || '')]); });
writeFileSync(relArq, `# Traçados do OpenStreetMap\n\n${ok} traçados novos, ${al} circuitos apontando para outro já existente.\n\n| id | circuito | resultado |\n|---|---|---|\n` +
  [...linhas.values()].sort((a, b) => a[0].localeCompare(b[0])).map(l => `| ${l[0]} | ${l[1]} | ${l[2]} |`).join('\n') + '\n');
console.log(`\n${ok} traçados, ${al} apelidos, ${log.length} pistas vistas`);
