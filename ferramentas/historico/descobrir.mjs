/* Descobre as páginas de temporada pelas categorias da Wikipedia
   ("Category:Champ Car seasons", "Category:Super GT seasons"…), para os
   campeonatos cujas temporadas não seguem um padrão de título.
   1. pega as categorias de uma temporada já importada (ou do artigo do
      campeonato) e fica com as que terminam em "seasons";
   2. lista os membros dessas categorias e guarda ano → título;
   3. grava descobertas.json, que o importador consulta depois do padrão do
      catálogo e da caixa de navegação.
   Uso: node ferramentas/historico/descobrir.mjs [ids|pendentes] */
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync, gunzipSync } from 'node:zlib';
import { CATALOGO, anosDe } from './catalogo.mjs';
import { formasDe } from './importar.mjs';

const AQUI = dirname(fileURLToPath(import.meta.url));
const BRUTOS = join(AQUI, 'brutos'), CACHE = join(AQUI, 'cache', 'consultas');
mkdirSync(CACHE, { recursive: true });
const SAIDA = join(AQUI, 'descobertas.json');
const UA = 'VolanteDeOuro-importer/1.0 (https://github.com/valdirboasorte/volante-de-ouro; fan project, contact via GitHub)';
const dorme = ms => new Promise(r => setTimeout(r, ms));
let ultima = 0;

/* uma consulta à API, com cache em disco */
async function consulta(params){
  const qs = new URLSearchParams(Object.assign({ format: 'json', formatversion: '2' }, params)).toString();
  const f = join(CACHE, qs.replace(/[^\w.-]+/g, '_').slice(0, 180) + '.json.gz');
  if(existsSync(f)) return JSON.parse(gunzipSync(readFileSync(f)).toString('utf8'));
  const espera = ultima + 700 - Date.now(); if(espera > 0) await dorme(espera);
  ultima = Date.now();
  for(let t = 0; t < 5; t++){
    let r;
    try { r = await fetch('https://en.wikipedia.org/w/api.php?' + qs, { headers: { 'User-Agent': UA, 'Api-User-Agent': UA } }); }
    catch(e){ await dorme(4000 * (t + 1)); continue; }
    if(r.status === 429 || r.status >= 500){ await dorme(4000 * (t + 1)); continue; }
    const j = await r.json();
    writeFileSync(f, gzipSync(JSON.stringify(j)));
    return j;
  }
  throw new Error('a Wikipedia não respondeu');
}
const categoriasDe = async titulo => {
  const j = await consulta({ action: 'query', prop: 'categories', titles: titulo, cllimit: '100', clshow: '!hidden', redirects: '1' });
  return ((j.query && j.query.pages && j.query.pages[0] && j.query.pages[0].categories) || []).map(c => c.title);
};
const membros = async (cat, tipo) => {
  const out = []; let cont = null;
  do {
    const p = { action: 'query', list: 'categorymembers', cmtitle: cat, cmlimit: '500', cmtype: tipo || 'page' };
    if(cont) p.cmcontinue = cont;
    const j = await consulta(p);
    ((j.query && j.query.categorymembers) || []).forEach(m => out.push(m.title));
    cont = j.continue && j.continue.cmcontinue;
  } while(cont);
  return out;
};

const NUM = { one:'1', two:'2', three:'3', four:'4', five:'5' };
const palavras = t => String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\(.*?\)/g, ' ')
  .replace(/[^a-z0-9]+/g, ' ').split(' ').filter(Boolean).map(w => NUM[w] || w);
const anoDoTitulo = t => {
  const m = t.match(/(?:^|\D)(\d{4})(?:[–-](\d{2}|\d{4}))?(?:\D|$)/);
  if(!m) return null;
  return m[2] ? +(m[2].length === 2 ? m[1].slice(0, 2) + m[2] : m[2]) : +m[1];
};

const descobertas = existsSync(SAIDA) ? JSON.parse(readFileSync(SAIDA, 'utf8')) : {};
const qual = process.argv[2] || 'pendentes';
const ids = qual === 'pendentes' ? null : new Set(qual.split(','));
for(const c of CATALOGO){
  if(ids && !ids.has(c.id)) continue;
  const anos = anosDe(c, 2026);
  const dir = join(BRUTOS, c.id);
  const lidos = existsSync(dir) ? readdirSync(dir).map(f => JSON.parse(readFileSync(join(dir, f), 'utf8'))) : [];
  const pend = anos.filter(a => { const b = lidos.find(x => x.ano === a); return !b || !b.pagina || !((b.inscritos || []).length || (b.classificacao || []).length); });
  if(!ids && !pend.length) continue;
  /* 1. as categorias "… seasons": de temporadas já lidas e do artigo do campeonato */
  const sementes = lidos.filter(x => x.pagina).slice(0, 3).map(x => x.pagina);
  if(c.artigo) sementes.push(c.artigo.replace(/_/g, ' '));
  const cats = new Set();
  for(const s of sementes){
    for(const cat of await categoriasDe(s)){
      if(/ seasons$/i.test(cat)) cats.add(cat);
      /* o artigo costuma estar em "Category:<Campeonato>"; a de temporadas é subcategoria dela */
      else if(s === (c.artigo || '').replace(/_/g, ' ')){
        const fc = palavras(cat.replace(/^Category:/, ''));
        if(formasDe(c).some(f => f.every(w => fc.includes(w))))
          (await membros(cat, 'subcat')).filter(x => / seasons$/i.test(x)).forEach(x => cats.add(x));
      }
    }
  }
  /* só as categorias de temporadas deste campeonato (a da F1 aparece em muita página) */
  /* categoria específica ("Champ Car seasons") vale inteira; categoria genérica
     ("Formula Renault seasons", que junta várias séries) só vale para o título
     que tiver o nome deste campeonato */
  const tokCat = cat => palavras(cat.replace(/^Category:/, '').replace(/ seasons$/i, ''));
  const especifica = cat => formasDe(c).some(f => f.every(w => tokCat(cat).includes(w)));
  const minhas = [...cats].filter(cat => { const p = tokCat(cat); return especifica(cat) || formasDe(c).some(f => p.every(w => f.includes(w))); });
  const porAno = {};
  for(const cat of minhas){
    const esp = especifica(cat);
    for(const t of await membros(cat)){
      const a = anoDoTitulo(t);
      if(!a || a < c.de || (c.ate != null && a > c.ate)) continue;
      const p = palavras(t);
      const casaNome = formasDe(c).some(f => f.every(w => p.includes(w)));
      if(!esp && !casaNome) continue;
      const nota = (/season|championship|series|cup/i.test(t) ? 2 : 0) + (casaNome ? 2 : 0);
      if(!porAno[a] || nota > porAno[a].nota) porAno[a] = { t, nota };
    }
  }
  descobertas[c.id] = Object.fromEntries(Object.entries(porAno).map(([a, x]) => [a, x.t]));
  const novos = pend.filter(a => porAno[a]);
  console.log(c.id.padEnd(15), 'categorias:', minhas.length ? minhas.join(', ').slice(0, 90) : '—', '| temporadas achadas:', Object.keys(porAno).length, '| pendentes resolvíveis:', novos.length + '/' + pend.length);
  writeFileSync(SAIDA, JSON.stringify(descobertas, null, 1));
}
