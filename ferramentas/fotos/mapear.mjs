// Fotos livres do Wikimedia Commons para o modo chefe: o retrato de cada piloto
// do banco histórico (todas as categorias), a foto de cada chassi e, onde o banco
// não guarda o chassi (IndyCar, NASCAR, Fórmula E...), a foto da página da equipe.
//
// Não baixa imagem nenhuma: guarda o caminho da miniatura no Commons, o autor e
// a licença em dados/fotos.js. O jogo mostra a miniatura quando está online e,
// sem ela, as iniciais do piloto ou a foto de época que já está no projeto.
//
// Entrada: dados/historico.js (cada pessoa com a página da Wikipédia, quando
// conhecida, e o chassi de cada inscrição). Para não pôr o rosto de um homônimo,
// a página só vale se a descrição curta da Wikipédia disser que é piloto (ou se
// a página foi conferida no banco). Só entram licenças livres (pilicense=free na
// Wikipédia; CC0, domínio público, CC BY e CC BY-SA conferidos no Commons).
//
// Uso: node ferramentas/fotos/mapear.mjs
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, '..', '..');
const UA = 'VolanteDeOuro-fotos/2.0 (https://volantedeouro.com; jogo gratuito)';
const espera = ms => new Promise(r => setTimeout(r, ms));
const PREFIXO = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/';

const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(RAIZ, 'dados', 'historico.js'), 'utf8') + '\nthis.HIST = HIST;', ctx);
const HIST = ctx.HIST;

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

/* a imagem livre principal e a descrição curta de cada página (Wikipédia em inglês) */
async function paginas(titulos, rotulo){
  const res = new Map(), todos = [...new Set(titulos)], ls = lotes(todos, 50);
  let k = 0;
  for(const lote of ls){
    const j = await api('en.wikipedia.org', { action: 'query', prop: 'pageimages|description', piprop: 'name', pilicense: 'free', redirects: '1', titles: lote.join('|') });
    const q = j.query || {};
    const volta = new Map();
    (q.normalized || []).forEach(n => volta.set(n.to, n.from));
    (q.redirects || []).forEach(r => volta.set(r.to, volta.get(r.from) || r.from));
    (q.pages || []).forEach(p => {
      if(p.missing) return;
      const v = { img: p.pageimage || null, desc: p.description || '' };
      res.set(volta.get(p.title) || p.title, v); res.set(p.title, v);
    });
    if(++k % 40 === 0) console.log(`  ${rotulo}: ${k} de ${ls.length} lotes`);
    await espera(100);
  }
  return res;
}
/* autor, licença e miniatura de cada arquivo, conferidos no próprio Commons */
const tirarHtml = s => String(s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
async function arquivos(nomes, largura){
  const res = new Map();
  for(const lote of lotes([...new Set(nomes)], 50)){
    const j = await api('commons.wikimedia.org', { action: 'query', prop: 'imageinfo', iiprop: 'url|extmetadata', iiurlwidth: String(largura),
      iiextmetadatafilter: 'LicenseShortName|Artist|NonFree', titles: lote.map(a => 'File:' + a).join('|') });
    ((j.query || {}).pages || []).forEach(p => {
      const ii = p.imageinfo && p.imageinfo[0]; if(!ii || !ii.thumburl) return;
      const m = ii.extmetadata || {};
      const lic = tirarHtml(m.LicenseShortName && m.LicenseShortName.value);
      if((m.NonFree && String(m.NonFree.value) === 'true') || /\bNC\b|\bND\b|non-?commercial|no derivative/i.test(lic) || !/CC0|public domain|^PD|CC BY|CC-BY|Attribution/i.test(lic)) return;
      /* a miniatura, sem os parâmetros de rastreio que a API acrescenta */
      const tb = ii.thumburl.split('?')[0].replace(/^https:\/\/(thumb|upload)\.wikimedia\.org\/wikipedia\/commons\/thumb\//, '');
      if(tb === ii.thumburl.split('?')[0]) return;
      /* "a/ab/Arquivo.jpg/330px-Arquivo.jpg": guarda o arquivo e a largura quando o nome segue o padrão */
      const mm = tb.match(/^([0-9a-f]\/[0-9a-f]{2}\/([^/]+))\/(\d+)px-(.+)$/);
      const curto = mm && mm[4] === mm[2] ? [mm[1], +mm[3]] : [tb, 0];
      res.set(p.title.replace(/^File:/, ''), { t: curto, autor: tirarHtml(m.Artist && m.Artist.value).slice(0, 70) || 'autor no Commons', lic });
    });
    await espera(100);
  }
  return res;
}

/* candidatos ao título da página de um chassi: "Red Bull Racing-Honda RBPT RB20"
   é a página "Red Bull Racing RB20"; "Atlassian Williams-Mercedes FW48", "Williams FW48" */
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

/* a pessoa é piloto? (descrição curta da Wikipédia) */
const PILOTO = /(racing|race car|racecar|racer|motor ?sport|nascar|indycar|formula|kart|rally|stock car|sports car|touring car|speedway|driver)/i;
const CARRO = /(car|automobile|prototype|chassis|vehicle|racer|formula)/i;
const NAO_CARRO = /(company|manufacturer|constructor|team|engine|person|driver|circuit|race$|season|championship)/i;
const EQUIPE = /(team|racing|motorsport|constructor|auto racing|race team)/i;

/* 1. pessoas: [nome no jogo, página, conferida] */
const pessoas = HIST.P.map(s => { const [nome, , jogo, pagina] = String(s).split('|');
  return [jogo || nome, (pagina || nome.replace(/\s*\([^)]*\)\s*$/, '')).replace(/_/g, ' '), !!pagina]; })
  .filter(x => x[1] && x[1].length > 2 && !/[#<>[\]{}|]/.test(x[1]));
/* 2. chassis: a chave é o que vem antes de " · " */
const chassis = [...new Set(HIST.K.map(k => String(k).split(' · ')[0].trim()))].filter(Boolean);
/* 3. equipes: o nome como o banco guarda */
const equipes = [...new Set(HIST.E.map(e => String(e).trim()))].filter(e => e.length > 2 && e.length < 120 && !/[#<>[\]{}|]/.test(e));
console.log(`${pessoas.length} pessoas, ${chassis.length} chassis, ${equipes.length} equipes`);

const pgP = await paginas(pessoas.map(p => p[1]), 'pilotos');
const cand = chassis.map(candidatos);
const pgK = await paginas(cand.flat(), 'chassis');
const pgE = await paginas(equipes, 'equipes');
const arqP = new Map(), arqK = new Map();
let descartadas = 0;
pessoas.forEach(([jogo, pg, conferida]) => {
  const v = pgP.get(pg); if(!v || !v.img) return;
  if(!conferida && !PILOTO.test(v.desc)){ descartadas++; return; }
  if(!arqP.has(jogo)) arqP.set(jogo, v.img);
});
chassis.forEach((k, i) => {
  const t = cand[i].find(x => { const v = pgK.get(x); return v && v.img && (CARRO.test(v.desc) || !v.desc) && !NAO_CARRO.test(v.desc); });
  if(t) arqK.set(k, pgK.get(t).img);
});
const arqE = new Map();
equipes.forEach(e => { const v = pgE.get(e); if(v && v.img && EQUIPE.test(v.desc) && !/(person|driver|born)/i.test(v.desc)) arqE.set(e, v.img); });
console.log('pilotos com imagem', arqP.size, '(homônimos descartados:', descartadas + ')', 'chassis', arqK.size);
const infoP = await arquivos([...arqP.values()], 330);
const infoK = await arquivos([...arqK.values()], 1280);
const infoE = await arquivos([...arqE.values()], 1280);

/* autores e licenças vão numa tabela só: cada foto guarda o índice */
const autores = [], licencas = [], ia = new Map(), il = new Map();
const idx = (lista, mapa, v) => { if(!mapa.has(v)){ mapa.set(v, lista.length); lista.push(v); } return mapa.get(v); };
const linha = i => i.t[1] ? [i.t[0], i.t[1], idx(autores, ia, i.autor), idx(licencas, il, i.lic)] : [i.t[0], 0, idx(autores, ia, i.autor), idx(licencas, il, i.lic)];
const P = {}, K = {}, E = {};
arqP.forEach((a, jogo) => { const i = infoP.get(a.replace(/_/g, ' ')) || infoP.get(a); if(i) P[jogo] = linha(i); });
arqK.forEach((a, k) => { const i = infoK.get(a.replace(/_/g, ' ')) || infoK.get(a); if(i) K[k] = linha(i); });
arqE.forEach((a, k) => { const i = infoE.get(a.replace(/_/g, ' ')) || infoE.get(a); if(i) E[k] = linha(i); });
const js = `/* Fotos livres do Wikimedia Commons: o retrato de cada piloto do banco histórico
   (a foto da ficha da Wikipédia, quando é livre e a página é de um piloto) e a
   foto de cada chassi e de cada equipe (para as categorias em que o banco não
   guarda o chassi). Só o caminho da miniatura, o autor e a licença: a imagem
   é carregada do Commons quando há internet. Gerado por ferramentas/fotos/mapear.mjs;
   não edite à mão. Cada valor: [arquivo, largura da miniatura (0 = caminho
   completo), índice do autor em a, índice da licença em l]. */
const FOTOS = ${JSON.stringify({ v: 2, base: PREFIXO, a: autores, l: licencas, p: P, k: K, e: E })};
`;
fs.writeFileSync(path.join(RAIZ, 'dados', 'fotos.js'), js);
console.log(`retratos: ${Object.keys(P).length} · chassis: ${Object.keys(K).length} · equipes: ${Object.keys(E).length} · ${Math.round(js.length / 1024)} KB`);
