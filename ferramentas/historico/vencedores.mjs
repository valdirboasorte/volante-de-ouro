/* Vencedores de cada corrida das categorias principais das sete séries do
   jogo, lidos das páginas de temporada que já estão no cache (nenhuma
   requisição). Escreve dados/vencedores.js, que o jogo usa para dar a cada
   piloto as vitórias reais que ele tinha antes do início do save.

   Uso: node ferramentas/historico/vencedores.mjs

   Como lê: em cada página, a primeira tabela que tem a coluna "Winning
   driver" (ou "Winner"); a célula daquela coluna em cada linha. O vencedor é
   a pessoa do banco cuja página está no link da célula; sem link conhecido,
   fica o nome como está escrito. Vitória dividida (dois pilotos no mesmo carro,
   anos 50) conta para os dois. Não completa nada: temporada sem página no
   cache ou sem a coluna fica de fora, e o relatório lista quais. */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, '..', '..');
const require = createRequire(import.meta.url);

/* o banco: pessoas e a página de cada uma */
const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(RAIZ, 'dados', 'historico.js'), 'utf8') + ';globalThis.__H = HIST;', ctx);
const HIST = ctx.__H;
const porPagina = new Map();
/* a página fica vazia no banco quando é o próprio nome; o nome completo, quando
   único, serve de segunda chave (link para um redirecionamento, por exemplo) */
const porNome = new Map(), repetidos = new Set();
HIST.P.forEach((s, i) => { const f = String(s).split('|'); const pg = f[3] || f[0]; if(pg) porPagina.set(pg.replace(/ /g, '_'), i);
  if(porNome.has(f[0])) repetidos.add(f[0]); else porNome.set(f[0], i); });
repetidos.forEach(n => porNome.delete(n));

/* as temporadas: a categoria principal de cada série, ano a ano, como o jogo resolve */
const H = require(path.join(RAIZ, 'testes', 'base.js'));
const J = H.carregar({ silencioso: true });
const pares = J.run(`(() => { const out = []; for(const sk of SERIES_KEYS){ const de = (SERIES[sk] && SERIES[sk].from) || 1950;
  for(let y = de; y <= 2026; y++){ let topo = ''; try { const e = eraOfSeries(y, sk); topo = resolveRung(e.ladder[e.ladder.length - 1], 'BR', y); } catch(e){ continue; }
    const cid = topo && campDaCat(topo, y); const t = cid && Hist.temporada(cid, y); if(t && t.pagina) out.push([cid, y, t.pagina]); } } return out; })()`);

const texto = h => h.replace(/<sup[\s\S]*?<\/sup>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#\d+;/g, ' ').replace(/\s+/g, ' ').trim();

/* as tabelas de primeiro nível da página */
function tabelas(html){
  const out = [], rx = /<table\b|<\/table>/gi;
  let m, prof = 0, ini = -1;
  while((m = rx.exec(html))){
    if(m[0][1] !== '/'){ if(prof++ === 0) ini = m.index; }
    else if(prof > 0 && --prof === 0) out.push(html.slice(ini, m.index + 8));
  }
  return out;
}
/* a grade da tabela, com rowspan e colspan expandidos */
function grade(tab){
  const linhas = [];
  const rxTr = /<tr\b[^>]*>([\s\S]*?)(?=<tr\b|<\/table>)/gi;
  let tr;
  const pend = [];          /* rowspans ainda valendo: col → { html, resta } */
  while((tr = rxTr.exec(tab))){
    const cels = [];
    const rxC = /<(t[hd])\b([^>]*)>([\s\S]*?)(?=<t[hd]\b|<\/tr>|$)/gi;
    let c;
    while((c = rxC.exec(tr[1]))){
      const at = c[2];
      const cs = +((at.match(/colspan="?(\d+)/i) || [])[1] || 1), rs = +((at.match(/rowspan="?(\d+)/i) || [])[1] || 1);
      cels.push({ th: c[1].toLowerCase() === 'th', html: c[3], cs, rs });
    }
    const linha = [];
    let col = 0;
    const poe = (cel, k) => { linha[k] = cel; };
    let ci = 0;
    while(ci < cels.length || pend.some((p, k) => p && p.resta > 0 && k >= col)){
      if(pend[col] && pend[col].resta > 0){ poe(pend[col].cel, col); pend[col].resta--; col++; continue; }
      if(ci >= cels.length) { col++; if(col > 60) break; continue; }
      const cel = cels[ci++];
      for(let k = 0; k < cel.cs; k++){ poe(cel, col + k); if(cel.rs > 1) pend[col + k] = { cel, resta: cel.rs - 1 }; }
      col += cel.cs;
    }
    linhas.push(linha);
  }
  return linhas;
}
const CAB = /^(winning drivers?|winners?|race winners?|winning driver\(s\)|overall winners?|overall winning drivers?)$/i;
function vencedoresDa(html){
  for(const tab of tabelas(html)){
    if(!/Winn/i.test(tab)) continue;
    const g = grade(tab);
    const h = g.findIndex(l => l.some(c => c && c.th && CAB.test(texto(c.html))));
    if(h < 0) continue;
    const col = g[h].findIndex(c => c && c.th && CAB.test(texto(c.html)));
    const out = [];
    for(const l of g.slice(h + 1)){
      const c = l[col]; if(!c || c.th) continue;
      const t = texto(c.html);
      if(!t || /cancel|not held|abandon|^tba$|^—$|^-$/i.test(t)) continue;
      const links = [...c.html.matchAll(/href="\/wiki\/([^"#?]+)"/g)].map(m => decodeURIComponent(m[1]));
      const ids = [...new Set(links.map(p => porPagina.get(p)).filter(i => i != null))];
      if(!ids.length){
        /* sem link conhecido: o nome escrito, se ele for de uma pessoa só do banco */
        const nomes = t.replace(/\[[^\]]*\]/g, '').split(/\s*(?:\/|,| and | & )\s*/).map(x => x.trim()).filter(Boolean);
        nomes.forEach(nm => { if(porNome.has(nm)) ids.push(porNome.get(nm)); });
      }
      out.push(ids.length ? (ids.length === 1 ? ids[0] : ids) : t.replace(/\[[^\]]*\]/g, '').trim());
    }
    if(out.length) return out;
  }
  return null;
}

const V = { v: 1 }, faltou = [];
let corridas = 0, semPessoa = 0;
for(const [cid, ano, pagina] of pares){
  if(V[cid] && V[cid][ano]) continue;
  /* o cache guarda a página pelo título final (depois do redirecionamento) */
  const alternativas = [pagina, pagina.replace(/ season$/, ''), pagina.replace(/Formula One season$/, 'Formula One World Championship'), pagina + ' season'];
  const arq = alternativas.map(t => path.join(AQUI, 'cache', t.replace(/ /g, '_').replace(/\//g, '%2F') + '.json.gz')).find(a => fs.existsSync(a));
  if(!arq){ faltou.push(`${cid} ${ano}: página fora do cache`); continue; }
  let html;
  try { html = JSON.parse(zlib.gunzipSync(fs.readFileSync(arq)).toString()).html; } catch(e){ faltou.push(`${cid} ${ano}: cache ilegível`); continue; }
  const lista = vencedoresDa(html || '');
  if(!lista){ faltou.push(`${cid} ${ano}: sem coluna de vencedor`); continue; }
  (V[cid] = V[cid] || {})[ano] = lista;
  corridas += lista.length; semPessoa += lista.filter(x => typeof x === 'string').length;
}
const cab = `/* Vencedores de cada corrida das categorias principais — gerado por
   ferramentas/historico/vencedores.mjs em ${new Date().toISOString().slice(0, 10)} a partir das páginas
   de temporada da Wikipedia em inglês já usadas pelo banco histórico (CC BY-SA 4.0).
   Número = pessoa do banco (HIST.P); texto = nome como está na página; lista = vitória dividida.
   Não editar à mão. */\n`;
fs.writeFileSync(path.join(RAIZ, 'dados', 'vencedores.js'), cab + 'const HIST_V = ' + JSON.stringify(V) + ';\n');
console.log(`${pares.length} temporadas, ${corridas} corridas lidas, ${semPessoa} vencedores sem pessoa no banco (ficam pelo nome), ${faltou.length} temporadas sem dado`);
faltou.slice(0, 40).forEach(x => console.log('  - ' + x));
if(faltou.length > 40) console.log(`  … e mais ${faltou.length - 40}`);
