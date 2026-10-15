/* Importa temporadas da Wikipedia em inglês (API pública do MediaWiki).
   Uso: node ferramentas/historico/importar.mjs [ids separados por vírgula | todos] [anoIni-anoFim]
   — uma requisição por vez, com pausa, identificando o projeto no User-Agent;
   — tudo que é baixado fica em cache/ comprimido (o que já está lá não é pedido de novo);
   — a leitura das tabelas roda num Chrome sem interface (analisar.js);
   — saída em brutos/<campeonato>/<ano>.json, com a página e a revisão de origem.
   O título de cada temporada sai do padrão do catálogo; quando ele não existe,
   vale o link daquele ano na caixa de navegação do artigo do campeonato.
   Um título que redireciona para uma página sem o ano no nome (o artigo geral
   do campeonato) conta como "sem página": nada de ler o artigo geral como se
   fosse a temporada.
   A Wikipedia é uma fonte secundária: o que sai daqui é "fonte única", não
   "verificado". O gerador é quem decide o status. */
import { mkdirSync, existsSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { gzipSync, gunzipSync } from 'node:zlib';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { CATALOGO, tituloTemporada, anosDe } from './catalogo.mjs';

const AQUI = dirname(fileURLToPath(import.meta.url));
const CACHE = join(AQUI, 'cache'), BRUTOS = join(AQUI, 'brutos');
mkdirSync(CACHE, { recursive: true }); mkdirSync(BRUTOS, { recursive: true });
const UA = 'VolanteDeOuro-importer/1.0 (https://github.com/valdirboasorte/volante-de-ouro; fan project, contact via GitHub)';
const PAUSA = 700;
const dorme = ms => new Promise(r => setTimeout(r, ms));
const arq = t => join(CACHE, t.replace(/[^\w.-]+/g, '_').slice(0, 180) + '.json');

let ultima = 0;
export async function pagina(titulo){
  const f = arq(titulo), fz = f + '.gz';
  if(existsSync(fz)) return JSON.parse(gunzipSync(readFileSync(fz)).toString('utf8'));
  if(existsSync(f)){                                   /* cache antigo, sem compressão */
    const s = readFileSync(f, 'utf8');
    writeFileSync(fz, gzipSync(s)); unlinkSync(f);
    return JSON.parse(s);
  }
  const espera = ultima + PAUSA - Date.now(); if(espera > 0) await dorme(espera);
  ultima = Date.now();
  const url = 'https://en.wikipedia.org/w/api.php?action=parse&format=json&formatversion=2&redirects=1&prop=text|revid&page=' + encodeURIComponent(titulo);
  for(let tentativa = 0; tentativa < 5; tentativa++){
    let r;
    try { r = await fetch(url, { headers: { 'User-Agent': UA, 'Api-User-Agent': UA } }); }
    catch(e){ await dorme(4000 * (tentativa + 1)); continue; }
    if(r.status === 429 || r.status >= 500){ await dorme(4000 * (tentativa + 1)); continue; }
    const j = await r.json();
    const out = j.error ? { titulo, erro: j.error.code } : { titulo, final: j.parse.title, revid: j.parse.revid, html: j.parse.text, baixado: new Date().toISOString().slice(0, 10) };
    writeFileSync(fz, gzipSync(JSON.stringify(out)));
    return out;
  }
  throw new Error('a Wikipedia não respondeu: ' + titulo);
}

/* o leitor de tabelas, num navegador sem interface */
let navegador, aba;
export async function leitor(){
  if(aba) return aba;
  const SKILL = process.env.TASTE_SKILL || 'C:/Users/Usuário/.claude/skills/design-taste-frontend/scripts/lib/cdp.mjs';
  const { Browser } = await import(pathToFileURL(SKILL).href);
  navegador = await Browser.launch();
  aba = await navegador.newPage({ width: 800, height: 600 });
  await aba.goto('data:text/html,<meta charset=utf-8><p>leitor', { settleMs: 50 });
  await aba.eval(readFileSync(join(AQUI, 'analisar.js'), 'utf8') + ';window.analisar = analisar; window.navboxAnos = navboxAnos; 1');
  return aba;
}
export async function analisarHTML(html){
  const p = await leitor();
  return JSON.parse(await p.eval(`analisar(${JSON.stringify(html)})`));
}
export async function fechar(){ if(navegador) await navegador.close(); navegador = aba = null; }

/* ano → título da página da temporada, pela caixa de navegação do artigo */
const navCache = {};
export async function temporadasDoArtigo(c){
  if(navCache[c.id]) return navCache[c.id];
  navCache[c.id] = {};
  if(!c.artigo) return navCache[c.id];
  const pg = await pagina(c.artigo.replace(/_/g, ' '));
  if(pg.erro) return navCache[c.id];
  const p = await leitor();
  navCache[c.id] = JSON.parse(await p.eval(`navboxAnos(${JSON.stringify(pg.html)}, ${JSON.stringify([c.artigo, ...(c.navbox || [])].filter(Boolean))})`));
  return navCache[c.id];
}

/* a página encontrada é mesmo de uma temporada? O título final precisa ter o ano */
const ehTemporada = (pg, a) => !pg.erro && new RegExp('(^|\\D)(' + a + '|' + (a - 1) + '[–-]' + String(a).slice(2) + ')(\\D|$)').test(pg.final);
/* ...e, se a Wikipedia redirecionou, o destino tem de ser deste campeonato:
   a temporada da Fórmula Azzurra redireciona para a da F3 Italiana, e ler
   aquela página daria o grid da F3 como se fosse o da Azzurra */
const GENERICAS = /^(championship|series|the|of|and|fia|international|world|cup|trophy|season|seasons|de|da|do)$/;
const NUM = { one:'1', two:'2', three:'3', four:'4', five:'5' };
const palavras = t => String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\(.*?\)/g, ' ')
  .replace(/[^a-z0-9]+/g, ' ').split(' ').filter(Boolean).map(w => NUM[w] || w);
export function formasDe(c){
  return [c.artigo, ...(c.nomes || []).map(n => n[2]), ...(c.navbox || [])].filter(Boolean)
    .map(f => palavras(f.replace(/_/g, ' ')).filter(w => !GENERICAS.test(w))).filter(x => x.length);
}
const doCampeonato = (c, titulo) => { const p = palavras(titulo); return formasDe(c).some(f => f.every(w => p.includes(w))); };
const confere = (c, pg, a, pedido) => ehTemporada(pg, a) && (pg.final === pedido || doCampeonato(c, pg.final));

export async function paginaDaTemporada(c, a){
  const tentativas = [];
  const t = tituloTemporada(c, a);
  if(t){
    const pg = await pagina(t);
    if(confere(c, pg, a, t)) return { titulo: t, pg, via: 'padrão' };
    tentativas.push(t + (pg.erro ? ' (' + pg.erro + ')' : ' → ' + pg.final));
  }
  const nav = await temporadasDoArtigo(c);
  if(nav[a] && nav[a] !== t){
    const pg = await pagina(nav[a]);
    if(confere(c, pg, a, nav[a])) return { titulo: nav[a], pg, via: 'navbox' };
    tentativas.push(nav[a] + (pg.erro ? ' (' + pg.erro + ')' : ' → ' + pg.final));
  }
  /* 3. o que as categorias "… seasons" da Wikipedia listam para aquele ano (descobrir.mjs) */
  const desc = descobertas()[c.id];
  const td = desc && desc[a];
  if(td && td !== t && td !== nav[a]){
    const pg = await pagina(td);
    if(confere(c, pg, a, td)) return { titulo: td, pg, via: 'categoria' };
    tentativas.push(td + (pg.erro ? ' (' + pg.erro + ')' : ' → ' + pg.final));
  }
  return { titulo: t, pg: null, tentativas };
}
let _desc = null;
function descobertas(){
  if(_desc) return _desc;
  const f = join(AQUI, 'descobertas.json');
  _desc = existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : {};
  return _desc;
}

async function principal(){
  const [qual = 'todos', faixa] = process.argv.slice(2);
  const [a0, a1] = faixa ? faixa.split('-').map(Number) : [1950, 2026];
  const ids = qual === 'todos' ? null : new Set(qual.split(','));
  let n = 0, faltou = 0;
  for(const c of CATALOGO){
    if(ids && !ids.has(c.id)) continue;
    mkdirSync(join(BRUTOS, c.id), { recursive: true });
    for(const a of anosDe(c, 2026)){
      if(a < a0 || a > (a1 || a0)) continue;
      let achado;
      try { achado = await paginaDaTemporada(c, a); }
      catch(e){ console.log(c.id.padEnd(14), a, '— ERRO ao buscar:', e.message); faltou++; continue; }
      const { titulo, pg, via, tentativas } = achado;
      const saida = { campeonato: c.id, ano: a, titulo: pg ? titulo : (titulo || null) };
      if(!pg){ saida.pendente = 'sem página da temporada'; saida.tentativas = tentativas; faltou++; }
      else {
        let lido;
        try { lido = await analisarHTML(pg.html); }
        catch(e){ console.log(c.id.padEnd(14), a, '— ERRO ao ler a página:', e.message.slice(0, 200)); await fechar(); faltou++; continue; }
        Object.assign(saida, { pagina: pg.final, revid: pg.revid, baixado: pg.baixado, via }, lido);
        if(!saida.inscritos.length) saida.pendente = saida.classificacao.length ? 'parcial: sem lista de inscritos, só a classificação final' : 'página sem tabela de inscritos legível';
      }
      writeFileSync(join(BRUTOS, c.id, a + '.json'), JSON.stringify(saida, null, 1));
      n++;
      console.log(c.id.padEnd(14), a, !pg ? '— sem página' + (tentativas.length ? ' [' + tentativas.join('; ') + ']' : '')
        : `${saida.inscritos.length} inscritos, ${saida.classificacao.length} classif., ${saida.calendario.length} etapas, campeão ${saida.campeao || '?'}${via === 'navbox' ? ' (navbox: ' + pg.final + ')' : ''}`);
    }
  }
  await fechar();
  console.log(`\n${n} temporadas lidas, ${faltou} sem página`);
}
if(process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) await principal();
