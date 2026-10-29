/* ══════════════════════════════════════════════════════════════════
   TRAÇADOS A PARTIR DOS MAPAS SVG DA WIKIMEDIA COMMONS
   Para cada circuito da lista abaixo:
   1. acha o artigo na Wikipedia (en; os br_ tentam pt antes) e lê o wikitext:
      a imagem do traçado (parâmetro image/layout/map/imagem/mapa do infobox
      que termine em .svg; na falta, o primeiro [[File:...svg]] do artigo) e
      o comprimento oficial (length_km / length_mi);
   2. pede à Commons a URL do arquivo, o autor e a licença, e baixa o SVG;
   3. lê o SVG sem dependências (pilha de transform, <path>/<polyline>/<polygon>,
      parser completo de path data com arcos e curvas amostradas);
   4. fica com o caminho fechado mais longo (sem molduras nem rabiscos);
   5. inverte o y (SVG cresce para baixo, o jogo para cima), ajusta o perímetro
      ao comprimento oficial e grava no formato do jogo (decímetros, diferenças).
   Uso: node ferramentas/pistas-svg.mjs [ids|todos]     (ids separados por vírgula)
   Os mapas são de colaboradores da Commons, cada um com seu autor e licença
   (quase todos CC BY-SA: a licença exige o mesmo tipo de licença no derivado). */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync, gunzipSync } from 'node:zlib';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, '..');
const PASTA = join(AQUI, 'pistas-svg');
const CACHE = join(PASTA, 'cache');
mkdirSync(CACHE, { recursive: true });
const UA = 'VolanteDeOuro-tracks/1.0 (https://github.com/valdirboasorte/volante-de-ouro; fan project, contact via GitHub)';
const dorme = ms => new Promise(r => setTimeout(r, ms));
const PAUSA = 1500;   /* entre pedidos ao mesmo serviço */

/* ── o que procurar para cada circuito ── */
const BUSCA = {
  gb_ain: 'Aintree Motor Racing Circuit', be_niv: 'Nivelles-Baulers', be_chi: 'Chimay Street Circuit', fr_rou: 'Rouen-Les-Essarts',
  fr_pau: 'Circuit de Pau-Ville', fr_cae: 'Circuit de la Prairie Caen', it_bar: 'Bari Grand Prix circuit', it_nap: 'Posillipo circuit Naples',
  it_mod: 'Aerautodromo di Modena', ch: 'Bremgarten Circuit', es_ped: 'Pedralbes Circuit', es_val: 'Valencia Street Circuit',
  pt_por: 'Circuito da Boavista', pt_lis: 'Monsanto Park Circuit', us_riv: 'Riverside International Raceway', us_dal: 'Fair Park Dallas Grand Prix circuit',
  us_phx: 'Phoenix street circuit', us_lv: 'Caesars Palace Grand Prix', ma: 'Ain-Diab Circuit', kr: 'Korea International Circuit',
  au_ade: 'Adelaide Street Circuit', us_mea: 'Meadowlands Grand Prix', ca_tor: 'Exhibition Place street circuit Toronto',
  ca_van: 'Molson Indy Vancouver circuit', au_sur: 'Surfers Paradise Street Circuit', us_nsh: 'Nashville Street Circuit',
  us_bel: 'Raceway on Belle Isle', se_kri: 'Råbelövsbanan', br_sal: 'Circuito de rua de Salvador Stock Car', br_bh: 'Circuito da Pampulha Stock Car',
  fe_ber: 'Tempelhof Airport Street Circuit', fe_rom: "Circuito Cittadino dell'EUR", fe_nyc: 'Brooklyn Street Circuit', fe_lon: 'ExCeL London Circuit',
  fe_hkg: 'Hong Kong Central Harbourfront Circuit', fe_mar: 'Circuit International Automobile Moulay El Hassan', fe_par: 'Paris Street Circuit Invalides',
  fe_pun: 'Punta del Este Street Circuit', fe_bue: 'Puerto Madero Street Circuit', fe_jak: 'Jakarta International e-Prix Circuit',
  fe_tok: 'Tokyo Street Circuit', fe_dir: 'Riyadh Street Circuit Diriyah', fe_sao: 'São Paulo Street Circuit Anhembi',
  fe_mia: 'Biscayne Bay Street Circuit', fe_mos: 'Moscow Street Circuit'
};

/* o SVG pode vir em UTF-16 (Illustrator): olha a marca de ordem dos bytes */
function decodificar(b){
  if(b[0] === 0xFF && b[1] === 0xFE) return b.subarray(2).toString('utf16le');
  if(b[0] === 0xFE && b[1] === 0xFF){ const c = Buffer.from(b.subarray(2)); c.swap16(); return c.toString('utf16le'); }
  if(b[0] === 0xEF && b[1] === 0xBB && b[2] === 0xBF) return b.subarray(3).toString('utf8');
  return b.toString('utf8');
}

/* ── rede, com cache e pausa por serviço (igual à do pistas-osm; também guarda texto) ── */
const ultimo = {};
async function pegar(servico, url, opcoes, pausa){
  const texto = !!(opcoes && opcoes.texto);
  const chave = url.replace(/[^\w.-]+/g, '_');
  const f = join(CACHE, chave.slice(0, 120) + '_' + (Buffer.from(url).reduce((a, b) => (a * 31 + b) >>> 0, 7)).toString(36) + (texto ? '.txt.gz' : '.json.gz'));
  if(existsSync(f)){ const s = gunzipSync(readFileSync(f)).toString('utf8'); return texto ? s : JSON.parse(s); }
  for(let t = 0; t < 5; t++){
    const espera = (ultimo[servico] || 0) + pausa - Date.now(); if(espera > 0) await dorme(espera);
    ultimo[servico] = Date.now();
    let r;
    try { r = await fetch(url, { headers: { 'User-Agent': UA, 'Api-User-Agent': UA } }); }
    catch(e){ await dorme(5000 * (t + 1)); continue; }
    if(r.status === 429 || r.status >= 500){ await dorme(10000 * (t + 1)); continue; }
    if(r.status === 404 && texto) throw new Error('arquivo não encontrado (404)');
    if(texto){
      const s = await r.arrayBuffer().then(b => decodificar(Buffer.from(b))).catch(() => null);
      if(!s || !/<svg[\s>]/i.test(s)){ await dorme(5000); continue; }
      writeFileSync(f, gzipSync(s));
      return s;
    }
    const j = await r.json().catch(() => null);
    if(!j){ await dorme(5000); continue; }
    writeFileSync(f, gzipSync(JSON.stringify(j)));
    return j;
  }
  throw new Error(servico + ' não respondeu');
}
const wiki = (lang, params) => pegar('wiki', `https://${lang}.wikipedia.org/w/api.php?` + new URLSearchParams(Object.assign({ format: 'json', formatversion: '2' }, params)), null, PAUSA);
const commons = params => pegar('commons', 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams(Object.assign({ format: 'json', formatversion: '2' }, params)), null, PAUSA);
const baixar = url => pegar('upload', url, { texto: true }, PAUSA);

/* ── 1. o artigo, a imagem do traçado e o comprimento oficial ── */
const km = s => { const m = String(s).replace(/,/g, '.').match(/[\d.]+/); return m ? parseFloat(m[0]) : null; };
/* o que não é mapa de pista: logos, bandeiras, brasões, mapas de localização */
const NAO_E_MAPA = /logo|flag|bandeira|icon|commons-|wikimedia|location|locator|blank|coat[ _]of|escudo|bras[aã]o|symbol|badge|crest|\bpog\b|marker|arrow|pictogram/i;
/* palavras do nome do arquivo que dizem "isto é um mapa de pista" (e o que é mapa geral) */
const E_PISTA = /circuit|circuito|track|layout|route|course|raceway|speedway|prix|street|strecke|pista|plan\b|autodrom|ring\b|tra[cç]ad|parcours|traccia|oval/i;
const E_MAPA_GERAL = /\bmap\b|\bmapa\b|\bcarte\b|\bkarte\b|\bmappa\b/i;
const SVG_NOME = /(?:(?:file|image|ficheiro|imagem|arquivo|archivo|fichier|datei)\s*:\s*)?([^\[\]|{}<>\n]*?\.svg)(?![\w])/i;
const PARAMS_IMG = /^(?:image\d*|imagem\d*|layout\d*|map\d*|mapa\d*|image_map|map_image|circuit_map|track_map|track_layout|imagem_mapa|circuit_image)$/i;
const limparNome = s => { let n = s.replace(/^\s*(?:file|image|ficheiro|imagem|arquivo|archivo|fichier|datei)\s*:\s*/i, '').trim().replace(/_/g, ' ');
  try { n = decodeURIComponent(n); } catch(e){} return n; };
/* as imagens .svg candidatas: primeiro as do infobox, depois as do resto do artigo */
function candidatas(txt){
  const info = [], resto = [], raster = [];
  const linhas = txt.split('\n');
  let i0 = linhas.findIndex(l => /\{\{\s*(infobox|info\/|ficha|caixa de informa|geobox)/i.test(l));
  if(i0 >= 0){
    for(let k = i0; k < Math.min(linhas.length, i0 + 150); k++){
      const l = linhas[k];
      if(k > i0 && /^\}\}/.test(l)) break;
      const m = l.match(/^\s*\|\s*([\w ]+?)\s*=\s*(.*)$/);
      if(!m || !PARAMS_IMG.test(m[1])) continue;
      const s = m[2].match(SVG_NOME);
      if(s) info.push({ nome: limparNome(s[1]), mapa: /^(?:map|mapa)/i.test(m[1]) });
      else { const r = m[2].match(/([^\[\]|{}<>\n:]+?\.(?:png|jpe?g|gif|webp|tiff?))/i); if(r) raster.push(limparNome(r[1])); }
    }
  }
  for(const m of txt.matchAll(/\[\[\s*(?:file|image|ficheiro|imagem|arquivo|archivo|fichier)\s*:\s*([^\]|\n]+?\.svg)/gi)) resto.push(limparNome(m[1]));
  for(const m of txt.matchAll(/^\s*(?:file|image|ficheiro|imagem|arquivo)\s*:\s*([^|\n]+?\.svg)/gim)) resto.push(limparNome(m[1]));
  const vistos = new Set(), svgs = [];
  /* image/layout antes de map/mapa: este costuma ser o mapa de localização */
  const ordenado = info.filter(i => !i.mapa).concat(info.filter(i => i.mapa));
  const bom = n => !NAO_E_MAPA.test(n) && !(E_MAPA_GERAL.test(n) && !E_PISTA.test(n));
  ordenado.map(i => i.nome).concat(resto.map(n => n)).forEach(n => { const k = n.toLowerCase(); if(!vistos.has(k) && bom(n)){ vistos.add(k); svgs.push({ nome: n, infobox: ordenado.some(i => i.nome === n) }); } });
  return { svgs, raster };
}
/* o comprimento no infobox: length_km, length_mi (ou o parâmetro livre length / comprimento) */
function comprimento(txt){
  let L = null;
  const mk = txt.match(/\|\s*(?:length_km|length_km1|comprimento_km|comprimento)\s*=\s*(?:\{\{\s*convert\s*\|)?\s*([\d.,]+)/i);
  const mm = txt.match(/\|\s*(?:length_mi|length_mi1)\s*=\s*(?:\{\{\s*convert\s*\|)?\s*([\d.,]+)/i);
  const ml = txt.match(/\|\s*length\s*=\s*(?:\{\{\s*convert\s*\|)?\s*([\d.,]+)\s*\|?\s*(km|mi|m)\b/i);
  if(mk && km(mk[1])) L = km(mk[1]) * (km(mk[1]) > 100 ? 1 : 1000);
  else if(mm && km(mm[1])) L = km(mm[1]) * 1609.34;
  else if(ml && km(ml[1])) L = km(ml[1]) * (/km/i.test(ml[2]) ? 1000 : /mi/i.test(ml[2]) ? 1609.34 : 1);
  if(L && (L < 300 || L > 30000)) L = null;
  return L;
}
const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const GENERICAS = new Set('circuit circuito circuits street park international internacional raceway speedway autodromo motor race track de da do di del des la le the and grand prix gp city cittadino stock car on of in e-prix eprix'.split(' '));
const palavras = s => norm(s).split(' ').filter(w => w.length > 2 && !GENERICAS.has(w));
/* os artigos da busca, na ordem do buscador, com o wikitext (um pedido só) */
async function artigos(lang, termo){
  const j = await wiki(lang, { action: 'query', generator: 'search', gsrsearch: termo, gsrlimit: '4', prop: 'revisions', rvprop: 'content', rvslots: 'main', redirects: '1' });
  const ps = (j.query && j.query.pages) || [];
  const chave = palavras(termo);
  return ps.slice().sort((a, b) => (a.index || 99) - (b.index || 99)).map(p => ({
    lang, titulo: p.title, txt: (p.revisions && p.revisions[0] && p.revisions[0].slots && p.revisions[0].slots.main.content) || '',
    ligado: palavras(p.title).some(w => chave.includes(w)) })).filter(a => a.txt);
}
/* ── 2. a Commons: URL, autor e licença ── */
const semTags = s => String(s || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;|&apos;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
async function infoArquivo(nome){
  const j = await commons({ action: 'query', prop: 'imageinfo', iiprop: 'url|extmetadata', titles: 'File:' + nome, redirects: '1' });
  const p = j.query && j.query.pages && j.query.pages[0];
  const ii = p && !p.missing && p.imageinfo && p.imageinfo[0];
  if(!ii) return null;
  const em = ii.extmetadata || {};
  return { titulo: p.title, url: ii.url.replace(/\?.*$/, ''), pagina: ii.descriptionurl, licenca: semTags(em.LicenseShortName && em.LicenseShortName.value) || 'desconhecida',
    autor: semTags(em.Artist && em.Artist.value).slice(0, 160) || 'desconhecido' };
}

/* ── 3. o SVG: transformações e dados de caminho ── */
const MI = [1, 0, 0, 1, 0, 0];
const mult = (m, n) => [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3],
  m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]];
function lerTransform(s){
  let m = MI;
  if(!s) return m;
  for(const t of s.matchAll(/(matrix|translate|scale|rotate|skewX|skewY)\s*\(([^)]*)\)/g)){
    const a = (t[2].match(/[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g) || []).map(Number);
    let n = MI;
    if(t[1] === 'matrix' && a.length >= 6) n = a.slice(0, 6);
    else if(t[1] === 'translate') n = [1, 0, 0, 1, a[0] || 0, a[1] || 0];
    else if(t[1] === 'scale') n = [a[0] == null ? 1 : a[0], 0, 0, a[1] == null ? (a[0] == null ? 1 : a[0]) : a[1], 0, 0];
    else if(t[1] === 'rotate'){
      const r = (a[0] || 0) * Math.PI / 180, c = Math.cos(r), s2 = Math.sin(r);
      n = [c, s2, -s2, c, 0, 0];
      if(a.length >= 3) n = mult(mult([1, 0, 0, 1, a[1], a[2]], n), [1, 0, 0, 1, -a[1], -a[2]]);
    }
    else if(t[1] === 'skewX') n = [1, 0, Math.tan((a[0] || 0) * Math.PI / 180), 1, 0, 0];
    else if(t[1] === 'skewY') n = [1, Math.tan((a[0] || 0) * Math.PI / 180), 0, 1, 0, 0];
    m = mult(m, n);
  }
  return m;
}
const NUM = /[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/y;
/* arco por extremos → pontos (F.6.5 da especificação do SVG) */
function arco(x1, y1, rx, ry, fi, fa, fs, x2, y2){
  if(x1 === x2 && y1 === y2) return [];
  rx = Math.abs(rx); ry = Math.abs(ry);
  if(!rx || !ry) return [[x2, y2]];
  const p = fi * Math.PI / 180, c = Math.cos(p), s = Math.sin(p);
  const dx = (x1 - x2) / 2, dy = (y1 - y2) / 2;
  const x1p = c * dx + s * dy, y1p = -s * dx + c * dy;
  const lam = x1p * x1p / (rx * rx) + y1p * y1p / (ry * ry);
  if(lam > 1){ const q = Math.sqrt(lam); rx *= q; ry *= q; }
  const num = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p, den = rx * rx * y1p * y1p + ry * ry * x1p * x1p;
  let co = Math.sqrt(Math.max(0, num / den)); if(fa === fs) co = -co;
  const cxp = co * rx * y1p / ry, cyp = -co * ry * x1p / rx;
  const cx = c * cxp - s * cyp + (x1 + x2) / 2, cy = s * cxp + c * cyp + (y1 + y2) / 2;
  const ux = (x1p - cxp) / rx, uy = (y1p - cyp) / ry, vx = (-x1p - cxp) / rx, vy = (-y1p - cyp) / ry;
  const th1 = Math.atan2(uy, ux);
  let dth = Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
  if(!fs && dth > 0) dth -= 2 * Math.PI; else if(fs && dth < 0) dth += 2 * Math.PI;
  const N = Math.max(8, Math.ceil(Math.abs(dth) / (Math.PI * 2) * 40)), out = [];
  for(let k = 1; k <= N; k++){
    const a = th1 + dth * k / N, ca = Math.cos(a), sa = Math.sin(a);
    out.push([c * rx * ca - s * ry * sa + cx, s * rx * ca + c * ry * sa + cy]);
  }
  out[out.length - 1] = [x2, y2];
  return out;
}
const NC = 20;   /* pontos por segmento de curva */
function cubica(p0, p1, p2, p3){
  const o = [];
  for(let k = 1; k <= NC; k++){ const t = k / NC, u = 1 - t;
    o.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]); }
  return o;
}
function quadratica(p0, p1, p2){
  const o = [];
  for(let k = 1; k <= NC; k++){ const t = k / NC, u = 1 - t; o.push([u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]]); }
  return o;
}
/* o atributo d inteiro → subcaminhos [{ pts, fechado }] (dividido em cada M/m) */
function lerCaminho(d){
  const subs = []; let cur = null;
  let i = 0, x = 0, y = 0, sx = 0, sy = 0, cmd = '', ctrl = null, ult = '';   /* ctrl: ponto de controle anterior, para S e T */
  const n = d.length;
  const pular = () => { while(i < n && /[\s,]/.test(d[i])) i++; };
  const num = () => { pular(); NUM.lastIndex = i; const m = NUM.exec(d); if(!m) throw new Error('número esperado'); i = NUM.lastIndex; return parseFloat(m[0]); };
  const flag = () => { pular(); const c = d[i]; if(c === '0' || c === '1'){ i++; return +c; } throw new Error('flag esperada'); };
  const garante = () => { if(!cur){ cur = { pts: [[x, y]], fechado: false }; subs.push(cur); } };
  const ir = pts => { garante(); pts.forEach(p => cur.pts.push(p)); const u = pts[pts.length - 1]; if(u){ x = u[0]; y = u[1]; } };
  try {
    while(true){
      pular(); if(i >= n) break;
      if(/[A-Za-z]/.test(d[i])){ cmd = d[i++]; }
      else if(!cmd) break;
      else if(cmd === 'Z' || cmd === 'z') break;   /* número solto depois do Z: lixo */
      const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase();
      const ox = rel ? x : 0, oy = rel ? y : 0;
      if(C === 'Z'){ if(cur){ cur.fechado = true; } x = sx; y = sy; cur = null; ctrl = null; ult = 'Z'; continue; }
      if(C === 'M'){
        x = num() + ox; y = num() + oy; sx = x; sy = y; cur = { pts: [[x, y]], fechado: false }; subs.push(cur);
        cmd = rel ? 'l' : 'L'; ctrl = null; ult = 'M'; continue;
      }
      if(C === 'L'){ const a = num() + ox, b = num() + oy; ir([[a, b]]); ctrl = null; }
      else if(C === 'H'){ const a = num() + ox; ir([[a, y]]); ctrl = null; }
      else if(C === 'V'){ const b = num() + oy; ir([[x, b]]); ctrl = null; }
      else if(C === 'C'){
        const a = [num() + ox, num() + oy], b = [num() + ox, num() + oy], e = [num() + ox, num() + oy];
        garante(); const p0 = [x, y]; ir(cubica(p0, a, b, e)); ctrl = b; ult = 'C';
      }
      else if(C === 'S'){
        const b = [num() + ox, num() + oy], e = [num() + ox, num() + oy];
        garante(); const p0 = [x, y], a = (ctrl && ult === 'C') ? [2 * x - ctrl[0], 2 * y - ctrl[1]] : p0;
        ir(cubica(p0, a, b, e)); ctrl = b; ult = 'C';
      }
      else if(C === 'Q'){
        const a = [num() + ox, num() + oy], e = [num() + ox, num() + oy];
        garante(); const p0 = [x, y]; ir(quadratica(p0, a, e)); ctrl = a; ult = 'Q';
      }
      else if(C === 'T'){
        const e = [num() + ox, num() + oy];
        garante(); const p0 = [x, y], a = (ctrl && ult === 'Q') ? [2 * x - ctrl[0], 2 * y - ctrl[1]] : p0;
        ir(quadratica(p0, a, e)); ctrl = a; ult = 'Q';
      }
      else if(C === 'A'){
        const rx = num(), ry = num(), fi = num(), fa = flag(), fs = flag(), e = [num() + ox, num() + oy];
        garante(); ir(arco(x, y, rx, ry, fi, fa, fs, e[0], e[1])); ctrl = null; ult = 'A';
        x = e[0]; y = e[1];
      }
      else break;
      if(C === 'L' || C === 'H' || C === 'V') ult = C;
    }
  } catch(e){ /* dado truncado ou torto: fica com o que já leu */ }
  return subs;
}
const lerPontos = s => { const a = (String(s).match(/[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g) || []).map(Number), p = []; for(let k = 0; k + 1 < a.length; k += 2) p.push([a[k], a[k + 1]]); return p; };
const SEM_DESENHO = new Set(['defs', 'clippath', 'mask', 'marker', 'pattern', 'symbol', 'metadata', 'style', 'script', 'title', 'desc', 'filter', 'lineargradient', 'radialgradient', 'foreignobject', 'text']);
/* o SVG inteiro → todos os subcaminhos, já transformados */
function lerSVG(svg){
  const limpo = svg.replace(/<!--[\s\S]*?-->/g, '').replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '').replace(/<\?[\s\S]*?\?>/g, '').replace(/<!DOCTYPE[^>[]*(?:\[[\s\S]*?\])?\s*>/gi, '');
  const subs = [];
  const pilha = [{ m: MI, pula: false, oculto: false, nome: '#raiz' }];
  let pulando = 0, ocultos = 0;
  const TAG = /<(\/?)([A-Za-z][\w:.-]*)((?:"[^"]*"|'[^']*'|[^'">])*?)(\/?)>/g;
  for(const t of limpo.matchAll(TAG)){
    const nome = t[2].toLowerCase().replace(/^svg:/, '');
    if(t[1]){   /* fechamento: desempilha até o que abriu */
      for(let k = pilha.length - 1; k > 0; k--) if(pilha[k].nome === nome){
        while(pilha.length > k){ const u = pilha.pop(); if(u.pula) pulando--; if(u.oculto) ocultos--; }
        break;
      }
      continue;
    }
    const at = {};
    for(const a of t[3].matchAll(/([\w:.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) at[a[1].toLowerCase()] = a[2] != null ? a[2] : a[3];
    const estilo = at.style || '';
    const oculto = at.display === 'none' || /display\s*:\s*none/i.test(estilo) || at.visibility === 'hidden' || /visibility\s*:\s*hidden/i.test(estilo);
    const pai = pilha[pilha.length - 1];
    let m = mult(pai.m, lerTransform(at.transform));
    if(nome === 'svg' && pilha.length > 1 && (at.x || at.y)) m = mult(m, [1, 0, 0, 1, parseFloat(at.x) || 0, parseFloat(at.y) || 0]);
    if(!pulando && !ocultos && !oculto){
      let sub = null;
      if(nome === 'path' && at.d) sub = lerCaminho(at.d);
      else if(nome === 'polyline' && at.points) sub = [{ pts: lerPontos(at.points), fechado: false }];
      else if(nome === 'polygon' && at.points) sub = [{ pts: lerPontos(at.points), fechado: true }];
      if(sub) sub.forEach(s => { if(s.pts.length >= 2) subs.push({ pts: s.pts.map(p => [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]]), fechado: s.fechado }); });
    }
    if(!t[4]){
      const pula = SEM_DESENHO.has(nome);
      pilha.push({ m, pula, oculto, nome });
      if(pula) pulando++;
      if(oculto) ocultos++;
    }
  }
  return subs;
}

/* ── 4. qual subcaminho é a pista ── */
function medidas(pts, fechar){
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, per = 0, ar = 0;
  for(let k = 0; k < pts.length; k++){
    const p = pts[k], q = pts[(k + 1) % pts.length];
    if(p[0] < x0) x0 = p[0]; if(p[0] > x1) x1 = p[0]; if(p[1] < y0) y0 = p[1]; if(p[1] > y1) y1 = p[1];
    if(k + 1 < pts.length || fechar) per += Math.hypot(q[0] - p[0], q[1] - p[1]);
    ar += p[0] * q[1] - q[0] * p[1];
  }
  return { x0, y0, x1, y1, per, area: Math.abs(ar) / 2 };
}
function escolherPista(subs){
  const todos = subs.filter(s => s.pts.length >= 3).map(s => Object.assign(s, medidas(s.pts, false)));
  if(!todos.length) return { erro: 'nenhum caminho (SVG sem path/polyline/polygon aproveitável)' };
  const X0 = Math.min(...todos.map(s => s.x0)), Y0 = Math.min(...todos.map(s => s.y0)), X1 = Math.max(...todos.map(s => s.x1)), Y1 = Math.max(...todos.map(s => s.y1));
  const areaTotal = (X1 - X0) * (Y1 - Y0) || 1;
  const fechados = todos.filter(s => {
    const diag = Math.hypot(s.x1 - s.x0, s.y1 - s.y0), a = s.pts[0], b = s.pts[s.pts.length - 1];
    return s.fechado || Math.hypot(a[0] - b[0], a[1] - b[1]) <= .03 * diag;
  }).map(s => Object.assign(s, medidas(s.pts, true)));
  if(!fechados.length) return { erro: 'nenhum caminho fechado' };
  const semMoldura = fechados.filter(s => !(((s.x1 - s.x0) * (s.y1 - s.y0)) / areaTotal > .9 && s.area / (((s.x1 - s.x0) * (s.y1 - s.y0)) || 1) > .9));
  if(!semMoldura.length) return { erro: 'nenhum caminho fechado (só molduras)' };
  const maior = Math.max(...semMoldura.map(s => s.per));
  const cand = semMoldura.filter(s => s.per >= .15 * maior);
  cand.sort((a, b) => b.per - a.per);
  return { sub: cand[0], candidatos: cand.length, segundo: cand[1] ? cand[1].per / cand[0].per : 0, fechados: fechados.length, total: todos.length };
}

/* ── 5. do SVG para pontos do jogo (igual ao codificar do pistas-osm) ── */
function simplificar(pts, tol){
  if(pts.length < 3) return pts;
  const d = (p, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy; if(!L2) return Math.hypot(p[0] - a[0], p[1] - a[1]);
    let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L2; t = Math.max(0, Math.min(1, t)); return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy); };
  /* Douglas-Peucker sem recursão (traçados de imagem têm milhares de pontos) */
  const manter = new Uint8Array(pts.length); manter[0] = 1; manter[pts.length - 1] = 1;
  const pi = [[0, pts.length - 1]];
  while(pi.length){
    const [i, j] = pi.pop(); let m = -1, k = -1;
    for(let q = i + 1; q < j; q++){ const v = d(pts[q], pts[i], pts[j]); if(v > m){ m = v; k = q; } }
    if(m > tol){ manter[k] = 1; pi.push([i, k], [k, j]); }
  }
  return pts.filter((p, k) => manter[k]);
}
function codificar(pts, tol){
  pts = pts.slice();
  if(Math.hypot(pts[0][0] - pts[pts.length - 1][0], pts[0][1] - pts[pts.length - 1][1]) < 1) pts.pop();
  const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length, cy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
  const c = pts.map(p => [p[0] - cx, p[1] - cy]);
  let s = simplificar(c, tol);
  /* pista simples demais para o jogo: afina a tolerância até ter pontos suficientes */
  while(s.length < 24 && tol > .05){ tol /= 2; s = simplificar(c, tol); }
  let px = 0, py = 0;
  const v = [];
  s.forEach(p => { const x = Math.round(p[0] * 10), y = Math.round(p[1] * 10); v.push(x - px, y - py); px = x; py = y; });
  return { pts: v.join(','), n: s.length, tol };
}
function descodificar(str){
  const a = str.split(',').map(Number), p = []; let x = 0, y = 0;
  for(let k = 0; k + 1 < a.length; k += 2){ x += a[k]; y += a[k + 1]; p.push([x / 10, y / 10]); }
  return p;
}

/* ── tudo junto ── */
const saidaArq = join(RAIZ, 'dados', 'tracados-svg.js');
const estadoArq = join(PASTA, 'estado.json');
const anterior = existsSync(saidaArq) ? (() => { const ctx = {}; try { new Function('ctx', readFileSync(saidaArq, 'utf8').replace('var PISTAS_SVG', 'ctx.PISTAS_SVG'))(ctx); } catch(e){} return ctx.PISTAS_SVG || {}; })() : {};
const estado = existsSync(estadoArq) ? (() => { try { return JSON.parse(readFileSync(estadoArq, 'utf8')); } catch(e){ return {}; } })() : {};
const qual = process.argv[2] || 'todos';
const pedidos = qual === 'todos' ? null : qual.split(',').map(s => s.trim()).filter(Boolean);
if(pedidos) pedidos.filter(id => !BUSCA[id]).forEach(id => console.log('id desconhecido, ignorado:', id));
const ids = Object.keys(BUSCA).filter(id => !pedidos || pedidos.includes(id));
const saida = Object.assign({}, anterior);

/* plano B: quando os artigos não têm SVG, procura o arquivo direto na Commons (só desenhos .svg) */
async function buscaCommons(termo, extras){
  const consultas = [{ q: termo, estrito: false }].concat(extras.map(q => ({ q, estrito: true })));
  const achados = new Map();
  for(const c of consultas){
    const chave = palavras(c.q);
    if(!chave.length) continue;
    const j = await commons({ action: 'query', list: 'search', srsearch: c.q + ' filetype:drawing', srnamespace: '6', srlimit: '12' });
    ((j.query && j.query.search) || []).forEach((r, k) => {
      const nome = r.title.replace(/^File:/, '');
      if(!/\.svg$/i.test(nome) || NAO_E_MAPA.test(nome) || achados.has(nome.toLowerCase())) return;
      if(/speedway/i.test(nome) && !/speedway/i.test(termo)) return;   /* autódromo oval da mesma cidade não é o circuito de rua */
      const comuns = palavras(nome.replace(/\.svg$/i, '')).filter(w => chave.includes(w)).length;
      const pista = E_PISTA.test(nome);
      if(!comuns || (E_MAPA_GERAL.test(nome) && !pista)) return;
      if(!pista && (c.estrito || comuns < chave.length)) return;   /* sem cara de pista, só vale com o nome todo */
      achados.set(nome.toLowerCase(), { nome, pontos: comuns * 2 + (pista ? 2 : 0) - k * .01 });
    });
  }
  return [...achados.values()].sort((a, b) => b.pontos - a.pontos);
}

/* tenta um arquivo: Commons → SVG → pista → pontos do jogo. Devolve null (com o motivo em falta) ou o resultado */
async function tentarArquivo(nomeArq, L, art, noInfobox, via, falta){
  let info;
  try { info = await infoArquivo(nomeArq); } catch(e){ falta('erro de rede na Commons: ' + e.message); return null; }
  if(!info){ falta(`${nomeArq} não está na Commons (arquivo local da Wikipedia?)`); return null; }
  let svg;
  try { svg = await baixar(info.url); } catch(e){ falta(`não baixou ${nomeArq}: ${e.message}`); return null; }
  let r;
  try { r = escolherPista(lerSVG(svg)); } catch(e){ falta(`erro lendo ${nomeArq}: ${e.message}`); return null; }
  if(r.erro){ falta(`${nomeArq}: ${r.erro}`); return null; }
  /* y para cima, perímetro ajustado ao comprimento oficial */
  const pts = r.sub.pts.map(p => [p[0], -p[1]]);
  const per = medidas(pts, true).per;
  /* comprimento oficial que o artigo não traz no infobox (o da época em que o jogo corre lá) */
  const COMP_FIXO = { us_dal: 3901, us_lv: 3650, us_mea: 2707, fe_mos: 2390 };
  if(!L && COMP_FIXO[ID_ATUAL]) L = COMP_FIXO[ID_ATUAL];
  const alvo = L || 3300;
  const e = alvo / per;
  const m = pts.map(p => [p[0] * e, p[1] * e]);
  const cod = codificar(m, .0015 * alvo);
  if(cod.n < 20){ falta(`${nomeArq}: o caminho escolhido tem só ${cod.n} pontos (não é a pista)`); return null; }
  const xs = m.map(p => p[0]), ys = m.map(p => p[1]);
  const larg = Math.max(...xs) - Math.min(...xs), alt = Math.max(...ys) - Math.min(...ys);
  const compacta = 4 * Math.PI * r.sub.area / (r.sub.per * r.sub.per);
  const nota = `${cod.n} pontos, ${r.candidatos} candidato(s) fechado(s) de ${r.total} caminhos, proporção ${(Math.max(larg, alt) / Math.max(1, Math.min(larg, alt))).toFixed(1)}:1, compacidade ${compacta.toFixed(2)}`
    + (r.segundo >= .5 ? `, 2º caminho tem ${Math.round(r.segundo * 100)}% do perímetro` : '')
    + (L ? `, comprimento oficial ${Math.round(L)} m` : ', sem comprimento oficial (3300 m)') + (noInfobox ? '' : ', imagem fora do infobox')
    + (via ? ', ' + via : '') + (cod.tol < .0015 * alvo ? ', tolerância reduzida' : '');
  const rec = { f: 'svg', nome: art ? art.titulo : BUSCA_ATUAL, comp: Math.round(alvo), pts: cod.pts, sentido: 'hor', arquivo: info.titulo, autor: info.autor, licenca: info.licenca, url: info.pagina, wiki: art ? art.lang + ':' + art.titulo : '' };
  if(!L) rec.semcomp = 1;
  return { rec, nota, n: cod.n, candidatos: r.candidatos, imagem: info.url };
}
let BUSCA_ATUAL = '', ID_ATUAL = '';

/* tenta um circuito: devolve { rec, nota, ... } ou { erro } */
async function tracar(id){
  ID_ATUAL = id;
  const termo = BUSCA_ATUAL = BUSCA[id];
  const langs = id.startsWith('br_') ? ['pt', 'en'] : ['en'];
  const motivos = [];
  const falta = m => { if(!motivos.includes(m) && motivos.length < 6) motivos.push(m); };
  const erro = () => motivos.length ? motivos.join('; ') : 'nenhum artigo da Wikipedia com o termo';
  let tentativas = 0, melhor = null, Lref = null;
  const vistos = new Set(), titulos = [];
  for(const lang of langs){
    let arts;
    try { arts = await artigos(lang, termo); } catch(e){ falta('erro de rede na busca (' + lang + '): ' + e.message); continue; }
    arts = arts.filter(a => a.ligado);
    if(!arts.length){ falta(`a busca (${lang}) não achou artigo parecido com "${termo}"`); continue; }
    for(const art of arts){
      const { svgs, raster } = candidatas(art.txt);
      const L = comprimento(art.txt);
      if(!melhor){ melhor = { lang, titulo: art.titulo }; Lref = L; }
      const t = art.titulo.replace(/^\d{4}\s+/, ''); if(!titulos.includes(t) && titulos.length < 2) titulos.push(t);
      if(!svgs.length){ falta(`artigo ${lang}:${art.titulo} sem imagem SVG` + (raster.length ? ' (só raster: ' + raster.slice(0, 2).join(', ') + ')' : '')); continue; }
      for(const sv of svgs.slice(0, 4)){
        if(++tentativas > 8) break;
        vistos.add(sv.nome.toLowerCase());
        const r = await tentarArquivo(sv.nome, L, art, sv.infobox, '', falta);
        if(r) return r;
      }
    }
  }
  /* plano B: a busca de arquivos da Commons */
  let achados = [];
  try { achados = await buscaCommons(termo, titulos.filter(t => norm(t) !== norm(termo))); } catch(e){ falta('erro de rede na busca da Commons: ' + e.message); }
  if(!achados.length) falta('a Commons não tem SVG com o nome do circuito');
  let n = 0;
  for(const c of achados){
    if(vistos.has(c.nome.toLowerCase())) continue;
    if(++n > 4) break;
    const r = await tentarArquivo(c.nome, Lref, melhor, false, 'achado pela busca da Commons', falta);
    if(r) return r;
  }
  return { erro: erro() };
}


for(const id of ids){
  let r;
  try { r = await tracar(id); } catch(e){ r = { erro: 'erro: ' + e.message, rede: true }; }
  if(r.rec){
    saida[id] = r.rec;
    estado[id] = { ok: true, resultado: 'ok: ' + r.nota, arquivo: r.rec.arquivo, licenca: r.rec.licenca, imagem: r.imagem, candidatos: r.candidatos, n: r.n };
    console.log(id, '— ok', r.nota);
  } else {
    if(!r.rede) delete saida[id];
    if(!(r.rede && estado[id] && estado[id].ok)) estado[id] = { ok: false, resultado: 'falhou: ' + r.erro, arquivo: '', licenca: '', imagem: '' };
    console.log(id, '— falhou:', r.erro);
  }
}

/* conferidos a olho contra o circuito de verdade e recusados: o caminho escolhido não é a pista */
const RECUSADOS = {
  ca_tor: 'o caminho mistura as ruas da cidade com a pista',
  au_sur: 'o caminho mistura as ruas da cidade com a pista',
  us_bel: 'o caminho mistura as ruas da ilha com a pista',
  fe_pun: 'o caminho é a linha da costa e a moldura do mapa',
  it_mod: 'traço dobrado no meio, que não é a pista'
};
Object.keys(RECUSADOS).forEach(id => { if(saida[id]){ delete saida[id]; } if(estado[id]) estado[id] = Object.assign({}, estado[id], { ok: false, resultado: 'recusado na conferência: ' + RECUSADOS[id] }); });
/* o arquivo de dados: na ordem da tabela, com o que já havia */
const ordem = Object.keys(BUSCA).filter(id => saida[id]).concat(Object.keys(saida).filter(id => !BUSCA[id]));
const final = {}; ordem.forEach(id => { final[id] = saida[id]; });
const ok = ordem.length;
writeFileSync(saidaArq, `/* Traçados de circuitos tirados dos mapas SVG da Wikimedia Commons, gerados por
   ferramentas/pistas-svg.mjs. Cada mapa tem o seu próprio autor e licença, listados
   no registro (autor, licenca, url, arquivo); a maioria é CC BY-SA, e essa licença
   vale também para este arquivo de dados (compartilhar igual, com atribuição).
   Pontos em decímetros (diferenças, x leste, y norte); comp em metros (o oficial da
   Wikipedia; semcomp:1 = sem comprimento oficial, 3300 m é suposição). */
var PISTAS_SVG = ${JSON.stringify(final)};
`);
writeFileSync(estadoArq, JSON.stringify(estado, null, 1));

/* ── relatório e prévia ── */
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const cel = s => String(s == null ? '' : s).replace(/\|/g, '/').replace(/\s+/g, ' ');
const todosIds = Object.keys(BUSCA);
const falhas = todosIds.filter(id => estado[id] && !estado[id].ok).length;
writeFileSync(join(PASTA, 'RELATORIO.md'), `# Traçados dos mapas SVG da Commons\n\n${ok} traçados, ${falhas} que falharam, ${todosIds.filter(id => !estado[id]).length} ainda não tentados.\n\n`
  + `| id | circuito | resultado | arquivo | licença |\n|---|---|---|---|---|\n`
  + todosIds.map(id => { const e = estado[id] || { resultado: 'não tentado', arquivo: '', licenca: '' };
    return `| ${id} | ${cel(BUSCA[id])} | ${cel(e.resultado)} | ${cel(e.arquivo)} | ${cel(e.licenca)} |`; }).join('\n') + '\n');

const cartoes = todosIds.filter(id => estado[id]).map(id => {
  const e = estado[id], r = final[id];
  if(!r) return `<section class="c falha"><h2>${id} — ${esc(BUSCA[id])}</h2><p>${esc(e.resultado)}</p></section>`;
  const p = descodificar(r.pts), xs = p.map(q => q[0]), ys = p.map(q => -q[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys), mg = Math.max(x1 - x0, y1 - y0) * .05 + 1;
  const pol = p.map(q => q[0].toFixed(1) + ',' + (-q[1]).toFixed(1)).join(' ') + ' ' + p[0][0].toFixed(1) + ',' + (-p[0][1]).toFixed(1);
  const sw = (Math.max(x1 - x0, y1 - y0) / 150).toFixed(1);
  return `<section class="c"><h2>${id} — ${esc(r.nome)}</h2><p>${r.comp} m${r.semcomp ? ' (suposto)' : ''} · ${p.length} pontos · ${esc(r.licenca)} · <a href="${esc(r.url)}">${esc(r.arquivo)}</a><br><small>${esc(r.autor)}</small></p>`
    + `<div class="par"><img loading="lazy" src="${esc(e.imagem)}" alt="${esc(r.arquivo)}">`
    + `<svg viewBox="${(x0 - mg).toFixed(1)} ${(y0 - mg).toFixed(1)} ${(x1 - x0 + 2 * mg).toFixed(1)} ${(y1 - y0 + 2 * mg).toFixed(1)}"><polyline points="${pol}" fill="none" stroke="#c0392b" stroke-width="${sw}" stroke-linejoin="round"/>`
    + `<circle cx="${p[0][0].toFixed(1)}" cy="${(-p[0][1]).toFixed(1)}" r="${(sw * 2.2).toFixed(1)}" fill="#27ae60"/></svg></div></section>`;
});
writeFileSync(join(PASTA, 'previa.html'), `<!doctype html><html lang="pt-br"><meta charset="utf-8"><title>Prévia dos traçados SVG</title>
<style>body{font:14px system-ui,sans-serif;background:#eee;margin:16px}h2{font-size:16px;margin:0 0 4px}p{margin:2px 0 8px}.c{background:#fff;margin:0 0 16px;padding:10px 14px;border-radius:6px}
.falha{opacity:.7}.par{display:flex;gap:12px}.par img,.par svg{flex:1;min-width:0;height:380px;object-fit:contain;background:#fafafa;border:1px solid #ddd}</style>
<h1>Prévia dos traçados SVG (${ok} traçados)</h1><p>À esquerda o mapa original da Commons, à direita o traçado gravado (bolinha verde = primeiro ponto).</p>
${cartoes.join('\n')}
</html>
`);
console.log(`\n${ok} traçados, ${falhas} falhas, ${ids.length} circuitos nesta rodada`);
