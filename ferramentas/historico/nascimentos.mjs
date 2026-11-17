/* O ano de nascimento de cada pessoa do banco histórico, lido do Wikidata pela
   página da Wikipedia em inglês que o banco já guarda para ela. Escreve
   dados/nascimentos.js, de onde o jogo tira a idade dos pilotos reais em
   qualquer ano (assets/idades.js).

   Uso: node ferramentas/historico/nascimentos.mjs   (depois do gerar.mjs)
        node ferramentas/historico/nascimentos.mjs --sem-rede   (só o cache)

   Por que existe: a tabela de nascimentos do jogo (NASC, no index.html) é
   indexada pelo nome curto, e o nome curto se repete entre pessoas: "M. Andretti"
   é o Mario na tabela e o Michael (e depois o Marco) nas escalações da Indy;
   "Rahal" é o Bobby e o Graham. Quem não está na tabela ganhava uma idade
   estimada. Com o nascimento de cada pessoa, a idade sai certa em toda época.

   Regras:
   - A pessoa é a página dela. Página explícita no banco (quarto campo de P) vale
     direto; página deduzida do nome só vale se o Wikidata disser que é gente
     (Q5) e a descrição falar de automobilismo, para um xará não entrar.
   - Página de desambiguação não vale. Datas de nascimento que discordam em
     mais de um ano também não: fica sem o dado, e o jogo segue estimando.
   - Segunda fonte: quando o ano do Wikidata não bate com a tabela de nascimentos
     do próprio jogo (NASC, no index.html), vale o ano da caixa de informações da
     página na Wikipedia (o Wikidata dá 1970 para o Juan Pablo Montoya, de 1975).
   - Só a API pública (MediaWiki e o SPARQL do Wikidata), uma requisição por
     vez com pausa, identificação no User-Agent e cache em disco
     (ferramentas/historico/cache/nascimentos.json), para nunca pedir duas vezes. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, '..', '..');
const CACHE = path.join(AQUI, 'cache', 'nascimentos.json');
const SAIDA = path.join(RAIZ, 'dados', 'nascimentos.js');
const SEM_REDE = process.argv.includes('--sem-rede');
const UA = { 'User-Agent': 'VolanteDeOuro-historico/1.0 (nascimentos; https://github.com/valdirboasorte/volante-de-ouro)' };
const sleep = ms => new Promise(r => setTimeout(r, ms));

const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(RAIZ, 'dados', 'historico.js'), 'utf8'), ctx);
const H = ctx.HIST;
/* a mesma leitura de Hist.pessoa no jogo */
const pessoas = H.P.map((s, i) => {
  const [nome, cc, jogo, pagina] = String(s || '?').split('|');
  return { i, nome, explicita: !!pagina, pagina: pagina || nome.replace(/ /g, '_') };
});

const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, 'utf8')) : { q: {}, w: {} };
cache.q = cache.q || {}; cache.w = cache.w || {}; cache.i = cache.i || {};
const guardar = () => { fs.mkdirSync(path.dirname(CACHE), { recursive: true }); fs.writeFileSync(CACHE, JSON.stringify(cache)); };

async function pegar(url, headers){
  for(let k = 0; k < 8; k++){
    try {
      const r = await fetch(url, { headers });
      const t = await r.text();
      if(r.ok) return JSON.parse(t);
    } catch(e){ /* tenta de novo */ }
    await sleep(4000 * (k + 1));
  }
  throw new Error('sem resposta: ' + url.slice(0, 120));
}

/* 1. página → item do Wikidata (segue redirecionamentos; desambiguação fica de fora) */
const paginas = [...new Set(pessoas.map(p => p.pagina))].filter(t => !(t in cache.q));
if(!SEM_REDE){
  for(let i = 0; i < paginas.length; i += 50){
    const lote = paginas.slice(i, i + 50);
    const url = 'https://en.wikipedia.org/w/api.php?action=query&format=json&redirects=1&prop=pageprops&ppprop=wikibase_item|disambiguation&titles='
      + encodeURIComponent(lote.map(t => t.replace(/_/g, ' ')).join('|'));
    const j = await pegar(url, UA);
    const norm = {}, red = {}, item = {};
    ((j.query || {}).normalized || []).forEach(n => norm[n.from] = n.to);
    ((j.query || {}).redirects || []).forEach(n => red[n.from] = n.to);
    Object.values((j.query || {}).pages || {}).forEach(p => {
      if(p.pageprops && p.pageprops.wikibase_item && !('disambiguation' in p.pageprops)) item[p.title] = p.pageprops.wikibase_item;
    });
    lote.forEach(t => { let x = t.replace(/_/g, ' '); x = norm[x] || x; x = red[x] || x; x = norm[x] || x; cache.q[t] = item[x] || null; });
    if(i % 1000 === 0){ guardar(); console.log('páginas', i + lote.length, '/', paginas.length); }
    await sleep(900);
  }
  guardar();
}

/* 2. item → nascimento, se é gente e a descrição */
const itens = [...new Set(Object.values(cache.q).filter(Boolean))].filter(q => !(q in cache.w));
if(!SEM_REDE){
  for(let i = 0; i < itens.length; i += 200){
    const lote = itens.slice(i, i + 200);
    const q = `SELECT ?item ?b ?h ?d WHERE { VALUES ?item { ${lote.map(x => 'wd:' + x).join(' ')} }
      OPTIONAL { ?item wdt:P569 ?b } OPTIONAL { ?item wdt:P31 ?h }
      OPTIONAL { ?item schema:description ?d FILTER(LANG(?d) = "en") } }`;
    const j = await pegar('https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(q),
      Object.assign({ Accept: 'application/sparql-results+json' }, UA));
    const acc = {};
    lote.forEach(x => acc[x] = { b: [], h: false, d: '' });
    j.results.bindings.forEach(b => {
      const id = b.item.value.split('/').pop(), a = acc[id]; if(!a) return;
      if(b.b){ const y = parseInt(String(b.b.value).replace(/^\+/, ''), 10); if(y && a.b.indexOf(y) < 0) a.b.push(y); }
      if(b.h && b.h.value.endsWith('/Q5')) a.h = true;
      if(b.d) a.d = b.d.value;
    });
    lote.forEach(x => cache.w[x] = acc[x]);
    if(i % 2000 === 0){ guardar(); console.log('itens', i + lote.length, '/', itens.length); }
    await sleep(1500);
  }
  guardar();
}

/* os anos em que cada pessoa aparece em alguma temporada do banco */
const anos = {};
Object.values(H.T).forEach(porAno => Object.entries(porAno).forEach(([ano, row]) => {
  const ents = row && row[5];
  if(!ents) return;
  ents.split('|').forEach(e => {
    const i = parseInt(e.split(',')[0], 36);
    if(isNaN(i)) return;
    const a = anos[i] = anos[i] || [9999, 0];
    if(+ano < a[0]) a[0] = +ano;
    if(+ano > a[1]) a[1] = +ano;
  });
}));

/* a tabela de nascimentos do jogo, só para saber onde conferir na segunda fonte */
const NASC = (() => {
  const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
  const i = html.indexOf('const NASC = {'); if(i < 0) return {};
  const f = html.indexOf('\n};', i);
  try { return vm.runInNewContext('(' + html.slice(i + 'const NASC = '.length, f + 2) + ')'); } catch(e){ return {}; }
})();
const tabela = {};
Object.entries(NASC).forEach(([k, v]) => { const n = k.replace(/^[a-z0-9]+:/, ''); (tabela[n] = tabela[n] || []).push(v[0]); });
/* o ano de nascimento na caixa de informações da página */
function anoDaCaixa(texto){
  const m = String(texto || '').match(/\|\s*birth[_ ]date\s*=([^\n]*)/i);
  const y = m && m[1].match(/\b(1[89]\d\d|20[0-2]\d)\b/);
  return y ? +y[1] : null;
}

/* 3. o arquivo do jogo: página → ano */
const AUTO = /driv|racer|racing|motor|rally|nascar|formula|indy|le mans|stock car|touring|karting|sports car|team (owner|principal)|engineer/i;
const a = {}, conferir = [];
let comPagina = 0, comAno = 0, recusados = 0, discordam = 0, impossiveis = 0;
pessoas.forEach(p => {
  const q = cache.q[p.pagina]; if(!q) return;
  comPagina++;
  const w = cache.w[q]; if(!w || !w.h || !w.b.length) return;
  if(!p.explicita && !AUTO.test(w.d || '')){ recusados++; return; }
  const min = Math.min(...w.b), max = Math.max(...w.b);
  if(max - min > 1){ discordam++; return; }
  const [jogoNome] = [String(H.P[p.i]).split('|')[2] || p.nome];
  const daTabela = tabela[jogoNome] || tabela[p.nome];
  if(daTabela && daTabela.indexOf(min) < 0) conferir.push(p);
  if(min < 1850 || min > 2020) return;
  /* xará que passou pelo filtro: a data não bate com os anos em que a pessoa correu
     (o Marcos Garcia da Stock Car de 1986 não nasceu em 1986) */
  const j = anos[p.i];
  if(j && (j[0] - min < 13 || j[1] - min > 75)){ impossiveis++; return; }
  a[p.pagina] = min; comAno++;
});
/* a segunda fonte, para quem discorda da tabela do jogo */
let trocados = 0;
for(const p of conferir){
  if(!(p.pagina in cache.i) && !SEM_REDE){
    const url = 'https://en.wikipedia.org/w/api.php?action=query&format=json&redirects=1&prop=revisions&rvprop=content&rvslots=main&rvsection=0&titles='
      + encodeURIComponent(p.pagina.replace(/_/g, ' '));
    try {
      const j = await pegar(url, UA);
      const pg = Object.values((j.query || {}).pages || {})[0] || {};
      const rv = (pg.revisions || [])[0];
      cache.i[p.pagina] = anoDaCaixa(rv && rv.slots && rv.slots.main && rv.slots.main['*']);
    } catch(e){ cache.i[p.pagina] = null; }
    await sleep(700);
  }
  const y = cache.i[p.pagina];
  if(y && y !== a[p.pagina]){ console.log('  caixa da Wikipedia:', p.nome, a[p.pagina], '→', y); a[p.pagina] = y; trocados++; }
}
guardar();

const chaves = Object.keys(a).sort();
const corpo = '{' + chaves.map(k => JSON.stringify(k) + ':' + a[k]).join(',') + '}';
const hoje = new Date().toISOString().slice(0, 10);
fs.writeFileSync(SAIDA, `/* ═══════════════════════════════════════════════════════════════════
   ANO DE NASCIMENTO DAS PESSOAS DO BANCO HISTÓRICO — gerado por
   ferramentas/historico/nascimentos.mjs em ${hoje}. Não editar à mão.
   Fonte: Wikidata (CC0), pela página da Wikipedia em inglês que o banco
   guarda para cada pessoa (dados/historico.js, HIST.P).
   a: página → ano de nascimento. Quem não está aqui segue com a idade
   estimada pelo jogo.
   ═══════════════════════════════════════════════════════════════════ */
var HIST_NASC = {"v":1,"gerado":"${hoje}","fonte":{"nome":"Wikidata","url":"https://www.wikidata.org/","licenca":"CC0"},"a":${corpo}};
`);
console.log(`pessoas ${pessoas.length} · com página ${comPagina} · com ano ${comAno} · xarás recusados ${recusados} · datas que discordam ${discordam} · datas impossíveis para os anos de corrida ${impossiveis} · conferidos na Wikipedia ${conferir.length}, trocados ${trocados}`);
