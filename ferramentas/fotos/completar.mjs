// Completa dados/fotos.js onde a ficha da Wikipédia não deu foto livre: o
// retrato do piloto e a foto do chassi passam a vir do Wikidata (a imagem
// principal, P18, sempre um arquivo do Commons) e, para o chassi sem imagem
// principal, da categoria dele no Commons (P373). Só acrescenta o que falta;
// o que mapear.mjs já achou fica como está.
//
// Rode depois de mapear.mjs: node ferramentas/fotos/completar.mjs
// As mesmas regras de mapear.mjs: piloto só com descrição de piloto (ou página
// conferida no banco), chassi só com descrição de carro, licença livre conferida
// no Commons.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, '..', '..');
const ARQ = path.join(RAIZ, 'dados', 'fotos.js');
const UA = 'VolanteDeOuro-fotos/2.0 (https://volantedeouro.com; jogo gratuito)';
const espera = ms => new Promise(r => setTimeout(r, ms));

const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(RAIZ, 'dados', 'historico.js'), 'utf8') + '\nthis.HIST = HIST;', ctx);
vm.runInContext(fs.readFileSync(ARQ, 'utf8') + '\nthis.FOTOS = FOTOS;', ctx);
const HIST = ctx.HIST, FOTOS = JSON.parse(JSON.stringify(ctx.FOTOS));

async function api(host, params){
  const u = new URL('https://' + host + '/w/api.php');
  Object.entries(Object.assign({ format: 'json', formatversion: '2', origin: '*' }, params)).forEach(([k, v]) => u.searchParams.set(k, v));
  for(let t = 0; t < 5; t++){
    try {
      const r = await fetch(u, { headers: { 'User-Agent': UA } });
      if(r.status === 429 || r.status >= 500){ await espera(2000 * (t + 1)); continue; }
      return await r.json();
    } catch(e){ await espera(2000 * (t + 1)); }
  }
  throw new Error('falhou: ' + u);
}
const lotes = (a, n) => { const out = []; for(let i = 0; i < a.length; i += n) out.push(a.slice(i, i + n)); return out; };
const tirarHtml = s => String(s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

/* título da Wikipédia (com redirecionamento) → item do Wikidata */
async function itens(titulos){
  const res = new Map();
  for(const lote of lotes([...new Set(titulos)], 50)){
    const j = await api('en.wikipedia.org', { action: 'query', prop: 'pageprops', ppprop: 'wikibase_item', redirects: '1', titles: lote.join('|') });
    const q = j.query || {}, volta = new Map();
    (q.normalized || []).forEach(n => volta.set(n.to, n.from));
    (q.redirects || []).forEach(r => volta.set(r.to, volta.get(r.from) || r.from));
    (q.pages || []).forEach(p => {
      const id = p.pageprops && p.pageprops.wikibase_item; if(!id) return;
      res.set(volta.get(p.title) || p.title, id); res.set(p.title, id);
    });
    await espera(100);
  }
  return res;
}
/* item → imagem principal, categoria do Commons e descrição em inglês */
async function entidades(ids){
  const res = new Map();
  for(const lote of lotes([...new Set(ids)], 50)){
    const j = await api('www.wikidata.org', { action: 'wbgetentities', ids: lote.join('|'), props: 'claims|descriptions', languages: 'en', formatversion: '1' });
    Object.values(j.entities || {}).forEach(e => {
      const v = (p) => ((e.claims || {})[p] || []).map(c => c.mainsnak && c.mainsnak.datavalue && c.mainsnak.datavalue.value).filter(Boolean);
      res.set(e.id, { img: v('P18')[0] || null, cat: v('P373')[0] || null, desc: (e.descriptions && e.descriptions.en && e.descriptions.en.value) || '' });
    });
    await espera(100);
  }
  return res;
}
/* a primeira foto da categoria do Commons (jpg ou png, nada de logo nem desenho) */
async function daCategoria(cat){
  const j = await api('commons.wikimedia.org', { action: 'query', list: 'categorymembers', cmtitle: 'Category:' + cat, cmtype: 'file', cmlimit: '40' });
  const fs = ((j.query || {}).categorymembers || []).map(m => m.title.replace(/^File:/, ''));
  return fs.filter(f => /\.(jpe?g|png)$/i.test(f) && !/logo|livery|drawing|diagram|sketch|badge|emblem|helmet|engine|steering|cockpit|interior|wheel|\bnose\b/i.test(f));
}
/* autor, licença e miniatura, conferidos no Commons (as regras de mapear.mjs) */
async function arquivos(nomes, largura){
  const res = new Map();
  for(const lote of lotes([...new Set(nomes)], 50)){
    const j = await api('commons.wikimedia.org', { action: 'query', prop: 'imageinfo', iiprop: 'url|extmetadata', iiurlwidth: String(largura),
      iiextmetadatafilter: 'LicenseShortName|Artist|NonFree', titles: lote.map(a => 'File:' + a).join('|') });
    const q = j.query || {}, volta = new Map();
    (q.normalized || []).forEach(n => volta.set(n.to, n.from));
    (q.pages || []).forEach(p => {
      const ii = p.imageinfo && p.imageinfo[0]; if(!ii || !ii.thumburl) return;
      const m = ii.extmetadata || {};
      const lic = tirarHtml(m.LicenseShortName && m.LicenseShortName.value);
      if((m.NonFree && String(m.NonFree.value) === 'true') || /\bNC\b|\bND\b|non-?commercial|no derivative/i.test(lic) || !/CC0|public domain|^PD|CC BY|CC-BY|Attribution|OGL|Open Government/i.test(lic)) return;
      const tb = ii.thumburl.split('?')[0].replace(/^https:\/\/(thumb|upload)\.wikimedia\.org\/wikipedia\/commons\/thumb\//, '');
      if(tb === ii.thumburl.split('?')[0]) return;
      const mm = tb.match(/^([0-9a-f]\/[0-9a-f]{2}\/([^/]+))\/(\d+)px-(.+)$/);
      const curto = mm && mm[4] === mm[2] ? [mm[1], +mm[3]] : [tb, 0];
      const v = { t: curto, autor: tirarHtml(m.Artist && m.Artist.value).slice(0, 70) || 'autor no Commons', lic };
      const nome = p.title.replace(/^File:/, '');
      res.set(nome, v); if(volta.has(p.title)) res.set(volta.get(p.title).replace(/^File:/, ''), v);
    });
    await espera(100);
  }
  return res;
}

/* as mesmas listas e filtros de mapear.mjs */
function candidatos(chassi){
  const s = chassi.split(' / ')[0].trim();
  const c = [s];
  const m = s.match(/^(.*?)-(\S.*) (\S+)$/);
  if(m){
    const cons = m[1].trim(), modelo = m[3], palavras = cons.split(' ');
    const ult2 = (m[2] + ' ' + m[3]).split(' ').slice(-2).join(' ');
    [cons + ' ' + modelo, palavras[palavras.length - 1] + ' ' + modelo, palavras[0] + ' ' + modelo,
     palavras.slice(0, 2).join(' ') + ' ' + modelo, cons + ' ' + ult2].forEach(x => { if(c.indexOf(x) < 0) c.push(x); });
  }
  return c.filter(x => x.length > 2 && x.length < 120 && !/[#<>[\]{}|]/.test(x));
}
const PILOTO = /(racing|race car|racecar|racer|motor ?sport|nascar|indycar|formula|kart|rally|stock car|sports car|touring car|speedway|driver)/i;
const CARRO = /(car|automobile|prototype|chassis|vehicle|racer|formula)/i;
const NAO_CARRO = /(company|manufacturer|constructor|team|engine|person|driver|circuit|race$|season|championship|brand|marque)/i;
/* páginas que os candidatos não acham: o banco usa o nome curto, a Wikipédia o nome comercial */
const ARTIGOS = {
  'Mercedes F1 W08 EQ Power+': 'Mercedes AMG F1 W08 EQ Power+',
  'Mercedes F1 W09 EQ Power+': 'Mercedes AMG F1 W09 EQ Power+',
  'Mercedes F1 W12': 'Mercedes-AMG F1 W12 E Performance',
  'Mercedes F1 W13': 'Mercedes-AMG F1 W13 E Performance',
  'Mercedes F1 W14': 'Mercedes-AMG F1 W14 E Performance',
  'Mercedes F1 W15': 'Mercedes-AMG F1 W15 E Performance',
  'Mercedes F1 W16': 'Mercedes-AMG F1 W16 E Performance',
  'Mercedes F1 W17': 'Mercedes-AMG F1 W17',
  'MRT-Mercedes MRT05': 'Manor MRT05',
  'Alfa Romeo Racing-Ferrari C39': 'Alfa Romeo Racing C39'
};

const pessoas = HIST.P.map(s => { const [nome, , jogo, pagina] = String(s).split('|');
  return [jogo || nome, (pagina || nome.replace(/\s*\([^)]*\)\s*$/, '')).replace(/_/g, ' '), !!pagina]; })
  .filter(x => x[1] && x[1].length > 2 && !/[#<>[\]{}|]/.test(x[1]) && !FOTOS.p[x[0]]);
const chassis = [...new Set(HIST.K.map(k => String(k).split(' · ')[0].trim()))].filter(k => k && !FOTOS.k[k]);
/* um nome só de marca ("Mercedes-Benz") não é um carro */
const cand = chassis.map(k => (ARTIGOS[k] ? [ARTIGOS[k]] : []).concat(/\s|\d/.test(k) ? candidatos(k) : []));
console.log(`faltam ${pessoas.length} retratos e ${chassis.length} chassis`);

const qP = await itens(pessoas.map(p => p[1]));
const qK = await itens(cand.flat());
const ent = await entidades([...qP.values(), ...qK.values()]);
const arqP = new Map(), arqK = new Map();
pessoas.forEach(([jogo, pg, conferida]) => {
  const e = ent.get(qP.get(pg)); if(!e || !e.img) return;
  if(!conferida && !PILOTO.test(e.desc)) return;
  if(!arqP.has(jogo)) arqP.set(jogo, [e.img]);
});
let deCategoria = 0;
for(let i = 0; i < chassis.length; i++){
  const ok = cand[i].map(x => ent.get(qK.get(x))).find(e => e && (e.img || e.cat) && (CARRO.test(e.desc) || !e.desc) && !NAO_CARRO.test(e.desc));
  if(!ok) continue;
  const lista = [];
  if(ok.img) lista.push(ok.img);
  if(ok.cat){ const fs = await daCategoria(ok.cat); if(fs.length){ lista.push(...fs.slice(0, 6)); if(!ok.img) deCategoria++; } await espera(100); }
  if(lista.length) arqK.set(chassis[i], lista);
}
console.log(`achados: ${arqP.size} retratos, ${arqK.size} chassis (${deCategoria} pela categoria do Commons)`);
const infoP = await arquivos([...arqP.values()].flat(), 330);
const infoK = await arquivos([...arqK.values()].flat(), 1280);

const ia = new Map(FOTOS.a.map((a, i) => [a, i])), il = new Map(FOTOS.l.map((l, i) => [l, i]));
const idx = (lista, mapa, v) => { if(!mapa.has(v)){ mapa.set(v, lista.length); lista.push(v); } return mapa.get(v); };
const linha = i => [i.t[0], i.t[1] || 0, idx(FOTOS.a, ia, i.autor), idx(FOTOS.l, il, i.lic)];
const pega = (info, lista) => { for(const a of lista){ const i = info.get(a) || info.get(a.replace(/_/g, ' ')); if(i) return i; } return null; };
let nP = 0, nK = 0;
arqP.forEach((l, jogo) => { const i = pega(infoP, l); if(i){ FOTOS.p[jogo] = linha(i); nP++; } });
arqK.forEach((l, k) => { const i = pega(infoK, l); if(i){ FOTOS.k[k] = linha(i); nK++; } });

const txt = fs.readFileSync(ARQ, 'utf8');
const cab = txt.slice(0, txt.indexOf('const FOTOS = '));
const js = cab + `const FOTOS = ${JSON.stringify(FOTOS)};\n`;
fs.writeFileSync(ARQ, js);
console.log(`acrescentados: ${nP} retratos, ${nK} chassis · ${Math.round(js.length / 1024)} KB`);
