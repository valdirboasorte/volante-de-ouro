/* Propõe (e, com --aplicar, aplica) correções nas escalações do jogo a partir
   da auditoria: o piloto que o jogo põe numa equipe e a fonte põe em outra.
   — se a equipe da fonte existe naquele ano no jogo, o piloto vai para ela;
   — se não existe e a equipe errada continua com alguém, o piloto sai dela;
   — senão, nada muda (fica no relatório).
   Equivalências de nome de inscrição → equipe do jogo ficam em APELIDOS.
   Uso: node ferramentas/historico/corrigir-escalacoes.mjs [--aplicar] */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, '..', '..');
const aud = JSON.parse(readFileSync(join(AQUI, 'auditoria.json'), 'utf8')).filter(x => !/não aparece/.test(x.wikipedia));
let html = readFileSync(join(RAIZ, 'index.html'), 'utf8');

/* nomes de inscrição que são a mesma equipe do jogo */
const APELIDOS = [
  [/owen racing/i, 'BRM'], [/fittipaldi automotive|copersucar/i, 'Copersucar'], [/mf1 racing|midland/i, 'Midland'],
  [/vandervell/i, 'Vanwall'], [/hw motors/i, 'HWM'], [/team norev|surtees/i, 'Surtees'], [/ambrosio.*shadow|shadow/i, 'Shadow'],
  [/frank williams|williams/i, 'Frank Williams Racing'], [/ligier/i, 'Ligier'], [/larrousse/i, 'Larrousse'],
  [/jordan/i, 'Jordan'], [/minardi/i, 'Minardi'], [/arrows/i, 'Arrows'], [/ensign/i, 'Ensign'], [/hesketh/i, 'Hesketh'],
  [/march/i, 'March'], [/lotus/i, 'Lotus'], [/coloni/i, 'Coloni'], [/osella/i, 'Osella'], [/\bats\b/i, 'ATS'],
  [/theodore/i, 'Theodore'], [/mclaren/i, 'McLaren'], [/brabham/i, 'Brabham'], [/rial/i, 'Rial'], [/tyrrell/i, 'Tyrrell'],
  [/ganassi/i, 'Chip Ganassi'], [/penske/i, 'Penske'], [/arrow mclaren/i, 'Arrow McLaren'], [/andretti/i, 'Andretti'],
  [/rahal letterman lanigan/i, 'Rahal Letterman Lanigan'], [/rahal letterman/i, 'Rahal Letterman'], [/ed carpenter|cfh racing/i, 'Ed Carpenter'],
  [/foyt/i, 'Foyt'], [/meyer shank|shank/i, 'Meyer Shank'], [/juncos/i, 'Juncos Hollinger'], [/coyne/i, 'Dale Coyne'],
  [/panther/i, 'Panther'], [/dreyer & reinbold/i, 'Dreyer & Reinbold'], [/vision racing/i, 'Vision'], [/newman.?haas/i, 'Newman/Haas'],
  [/patrick racing/i, 'Patrick Racing'], [/fern[aá]ndez racing/i, 'Fernández'], [/kelley racing/i, 'Kelley'], [/team menard/i, 'Menard'],
  [/forsythe/i, 'Forsythe'], [/carlin/i, 'Carlin'], [/harding/i, 'Harding'], [/schmidt peterson/i, 'Schmidt Peterson'],
  [/tasman/i, 'Tasman'], [/arciero/i, 'Arciero-Wells'], [/pk racing/i, 'PK Racing'], [/conquest/i, 'Conquest'],
  [/luczo/i, 'Luczo-Dragon'], [/kv racing|kv /i, 'KV Racing'], [/prema/i, 'PREMA']
];
const bloco = sk => { const i = html.indexOf(sk === 'f1' ? 'const LINEUPS = { f1: {' : '\n indy: {', 0); return i; };
/* a linha de um ano numa série (F1 vem primeiro no objeto LINEUPS, a Indy depois) */
function linha(sk, ano){
  const ini = html.indexOf('const LINEUPS = { f1: {');
  const ind = html.indexOf('indy:', ini);
  const de = sk === 'f1' ? ini : ind, ate = sk === 'f1' ? ind : html.indexOf('\n};', ind);
  const trecho = html.slice(de, ate);
  const m = trecho.match(new RegExp('\\n' + ano + ":'([^']*)'"));
  return m ? { texto: m[1], pos: de + trecho.indexOf(m[0]) + ('\n' + ano + ":'").length } : null;
}
const parse = t => t.split('|').filter(Boolean).map(b => { const i = b.indexOf(':'); return [b.slice(0, i), b.slice(i + 1).split(',').filter(Boolean)]; });
const junta = eqs => eqs.filter(([, ps]) => ps.length).map(([e, ps]) => e + ':' + ps.join(',')).join('|');

/* casos ambíguos, revistos à mão: ficam como estão (e no relatório) */
const PULAR = new Set(['indy 1997 Franchitti', 'indy 2006 Rice', 'f1 1974 Schenken', 'f1 1977 Tambay', 'f1 1977 Merzario']);
const propostas = [];
for(const a of aud){
  if(PULAR.has(a.sk + ' ' + a.ano + ' ' + a.piloto)) continue;
  const L = linha(a.sk, a.ano); if(!L) continue;
  const eqs = parse(L.texto);
  const atual = eqs.find(([e, ps]) => e === a.equipeJogo && ps.includes(a.piloto));
  if(!atual) continue;
  /* a equipe da fonte, se ela existe no jogo naquele ano */
  const fontes = a.wikipedia.split(' / ');
  let destino = null;
  for(const f of fontes){
    for(const [re, nome] of APELIDOS) if(re.test(f)){
      const d = eqs.find(([e]) => e === nome || e.toLowerCase().includes(nome.toLowerCase()) || nome.toLowerCase().includes(e.toLowerCase()));
      if(d){ destino = d; break; }
    }
    if(destino) break;
  }
  if(destino && destino[0] === atual[0]) continue;      /* era só diferença de nome: está certo */
  if(destino) propostas.push({ ...a, acao: 'mover', para: destino[0] });
  else if(atual[1].length > 1) propostas.push({ ...a, acao: 'tirar' });
  else propostas.push({ ...a, acao: 'manter (equipe ficaria vazia)' });
}
const aplicar = process.argv.includes('--aplicar');
const porLinha = {};
propostas.forEach(p => (porLinha[p.sk + p.ano] = porLinha[p.sk + p.ano] || []).push(p));
let feitas = 0;
for(const k in porLinha){
  const ps = porLinha[k], L = linha(ps[0].sk, ps[0].ano);
  const eqs = parse(L.texto);
  for(const p of ps){
    if(p.acao.startsWith('manter')) continue;
    const de = eqs.find(([e]) => e === p.equipeJogo);
    if(!de || !de[1].includes(p.piloto)) continue;
    if(p.acao === 'tirar' && de[1].length < 2) continue;
    de[1] = de[1].filter(x => x !== p.piloto);
    if(p.acao === 'mover'){ const para = eqs.find(([e]) => e === p.para); if(!para[1].includes(p.piloto)) para[1].push(p.piloto); }
    feitas++;
  }
  const novo = junta(eqs);
  console.log(`${ps[0].sk} ${ps[0].ano}: ` + ps.map(p => `${p.piloto} ${p.equipeJogo} → ${p.acao === 'mover' ? p.para : p.acao} (fonte: ${p.wikipedia.slice(0, 40)})`).join('; '));
  if(aplicar){
    const L2 = linha(ps[0].sk, ps[0].ano);
    html = html.slice(0, L2.pos) + novo + html.slice(L2.pos + L2.texto.length);
  }
}
if(aplicar){ writeFileSync(join(RAIZ, 'index.html'), html); console.log(`\n${feitas} correções aplicadas`); }
else console.log(`\n${propostas.length} propostas (rode com --aplicar para gravar)`);
