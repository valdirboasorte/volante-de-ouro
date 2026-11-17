/* ══════════════════════════════════════════════════════════════════
   LIMPEZA DO BANCO JÁ GERADO
   Conserta dados/historico.js (e o que depende dele em dados/) sem gerar
   de novo: serve para quando brutos/ e cache/ não estão no disco. As
   regras estão em limpeza.mjs, as mesmas que o gerador aplica.

   1. Notas da tabela lidas como inscritos (o rodapé "Sources:", "Under
      caution", "Drivers ineligible to score points", "Am class"…) e linhas
      com as colunas deslocadas (o número do carro na coluna da equipe)
      saem da temporada.
   2. A equipe que é um marcador ("?", "Privateer", "TBA"…) fica vazia: o
      jogo lê eq: null.
   3. O piloto com um marcador grudado no nome ("Jay Fogleman 1", "Dana
      Patten (R)", "Nicola Zonzini J") volta a ser a pessoa de nome limpo:
      a que o banco já tem, se o país e a época combinam (a regra do
      gerador); senão, a própria entrada é renomeada.
   4. A célula com dois ou três pilotos lida como um nome só ("Warren
      Cullen Ron Harrop") vira uma linha para cada um, quando o nome
      inteiro se divide em pessoas que o banco já conhece.
   5. A conta de corridas sai das equipes da NASCAR, da ARCA e dos
      Supercars ("Brewco Motorsports 34 / Michael Waltrip Racing 1").
   6. dados/vencedores.js: o rodapé contado como vencedor de corrida sai.
   7. E (equipes) e K (carros) são refeitos na ordem do primeiro uso, como
      o gerador faz. P (pessoas) nunca é renumerado, porque
      dados/escalacoes.js e dados/vencedores.js guardam índices de P: a
      pessoa que ficou sem nenhuma temporada vira uma entrada vazia.

   Uso: node ferramentas/historico/limpar-banco.mjs            (só mostra)
        node ferramentas/historico/limpar-banco.mjs --aplicar  (grava)
        … --json <arquivo>   guarda o levantamento completo
   Rodar duas vezes dá no mesmo: a segunda não acha nada.
   ══════════════════════════════════════════════════════════════════ */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { naoEPiloto, equipeDesconhecida, nomeLimpo, equipeLimpa } from './limpeza.mjs';

const AQUI = dirname(fileURLToPath(import.meta.url));
const DADOS = join(AQUI, '..', '..', 'dados');
const APLICAR = process.argv.includes('--aplicar');
const iJson = process.argv.indexOf('--json');

/* um arquivo de dados: cabeçalho de comentário + "var X = {json};" */
function abre(nome, marca){
  const arq = join(DADOS, nome);
  if(!existsSync(arq)) return null;
  const texto = readFileSync(arq, 'utf8');
  const ini = texto.indexOf(marca);
  if(ini < 0){ console.error(`dados/${nome}: não achei "${marca}"`); process.exit(1); }
  const cabeca = texto.slice(0, ini + marca.length), resto = texto.slice(ini + marca.length);
  const fim = resto.match(/;\s*$/);
  if(!fim){ console.error(`dados/${nome}: o arquivo não termina em ";"`); process.exit(1); }
  const corpo = resto.slice(0, resto.length - fim[0].length);
  const obj = JSON.parse(corpo);
  if(JSON.stringify(obj) !== corpo){ console.error(`dados/${nome}: o arquivo não é o JSON que o gerador escreve; nada foi mexido`); process.exit(1); }
  return { nome, obj, corpo, grava: () => writeFileSync(arq, cabeca + JSON.stringify(obj) + fim[0]) };
}
const fH = abre('historico.js', 'var HIST = ');
if(!fH){ console.error('dados/historico.js não existe'); process.exit(1); }
const fV = abre('vencedores.js', 'const HIST_V = '), fE = abre('escalacoes.js', 'const HIST_ESC = ');
const HIST = fH.obj, V = fV ? fV.obj : null, ESC = fE ? fE.obj : null;

const b = s => s ? parseInt(s, 36) : -1;
const b36 = n => n < 0 ? '' : n.toString(36);
const campos = i => String(HIST.P[i] || '').split('|');
const nomeDe = i => campos(i)[0];
const ccDe = i => campos(i)[1] || '';
const jogoDe = i => { const c = campos(i); return c[2] || c[0]; };
const familia = id => String(id).split('_')[0];

/* valor → { linhas, temporadas } */
const soma = (m, v, k) => { let o = m.get(v); if(!o) m.set(v, o = { n: 0, t: new Set() }); o.n++; o.t.add(k); };
const lista = m => [...m].map(([v, o]) => ({ valor: v, temporadas: o.t.size, linhas: o.n, onde: [...o.t] })).sort((x, y) => y.temporadas - x.temporadas || y.linhas - x.linhas);
const equipesFora = new Map(), pilotosFora = new Map(), deslocadas = new Map(), nomesLimpos = new Map(), divididos = new Map(), contas = new Map(), vencFora = new Map();
const mexidas = new Set();
let linhas = 0, linhasFora = 0, equipesVazias = 0;

/* ── 1 e 2. as temporadas em linhas, já sem as notas ── */
const T = [];                      /* { id, ano, k, row, l: [{ p, eq, carro, num, pos, peso }] } */
for(const c of HIST.C){
  const anos = HIST.T[c.id];
  if(!anos) continue;
  for(const ano in anos){
    const row = anos[ano], k = c.id + ':' + ano, l = [];
    for(const s of (row[5] ? row[5].split('|') : [])){
      linhas++;
      const [p, e, kk, num, pos] = s.split(',');
      const pi = b(p), nome = nomeDe(pi);
      let eq = e ? HIST.E[b(e)] : '';
      const carro = kk ? HIST.K[b(kk)] : '';
      /* colunas deslocadas: o número do carro na coluna da equipe */
      const deslocada = /^\d+$/.test(eq);
      if(naoEPiloto(nome) || deslocada){
        linhasFora++; mexidas.add(k);
        if(pi === row[3]) console.log(`  atenção: ${k} tem como campeão uma linha tirada ("${nome}")`);
        if(deslocada && !naoEPiloto(nome)) soma(deslocadas, eq, k); else soma(pilotosFora, nome, k);
        if(eq && equipeDesconhecida(eq)) soma(equipesFora, eq, k);
        continue;
      }
      if(eq && equipeDesconhecida(eq)){ soma(equipesFora, eq, k); equipesVazias++; mexidas.add(k); eq = ''; }
      l.push({ p: pi, eq, carro, num: num || '', pos: pos || '' });
    }
    T.push({ id: c.id, ano: +ano, k, row, l });
  }
}

/* ── 3. o marcador grudado no nome ── */
const uso = new Map();             /* pessoa → { anos, camps } */
const usa = (i, id, ano) => { let o = uso.get(i); if(!o) uso.set(i, o = { anos: new Set(), camps: new Set() }); o.anos.add(ano); o.camps.add(id); };
for(const t of T){ t.l.forEach(x => usa(x.p, t.id, t.ano)); if(t.row[3] >= 0) usa(t.row[3], t.id, t.ano); }
const porNome = new Map();
const indexa = i => { const n = nomeDe(i); if(!n) return; let l = porNome.get(n); if(!l) porNome.set(n, l = []); if(l.indexOf(i) < 0) l.push(i); };
HIST.P.forEach((s, i) => { if(uso.has(i)) indexa(i); });
const jogos = new Map(); HIST.P.forEach((s, i) => { if(s) jogos.set(jogoDe(i), i); });
const vao = (a, z) => { const A = [...a.anos], Z = [...z.anos]; return Math.max(0, Math.min(...Z) - Math.max(...A), Math.min(...A) - Math.max(...Z)); };
const divide = (a, z, f) => [...a.camps].some(c => [...z.camps].some(d => f(c) === f(d)));
/* a mesma pessoa? a regra do gerador: bandeiras diferentes só no mesmo campeonato
   e na mesma época; fora isso, no máximo vinte anos de distância */
const combina = (i, j) => { const ua = uso.get(i), uz = uso.get(j), ca = ccDe(i), cz = ccDe(j);
  if(ca && cz && ca !== cz) return vao(ua, uz) <= 2 && divide(ua, uz, x => x);
  return vao(ua, uz) <= 20; };
const melhor = (i, cands) => cands.filter(j => combina(i, j))
  .map(j => ({ j, s: (divide(uso.get(i), uso.get(j), x => x) ? 2 : 0) + (divide(uso.get(i), uso.get(j), familia) ? 1 : 0), v: vao(uso.get(i), uso.get(j)) }))
  .sort((x, y) => y.s - x.s || x.v - y.v || x.j - y.j)[0];
const troca = new Map();           /* pessoa com marcador → a pessoa de nome limpo */
let renomeadas = 0, fundidas = 0;
const fusoes = [];                 /* para conferir: quem virou quem */
for(const i of [...uso.keys()].sort((x, y) => x - y)){
  const nome = nomeDe(i), base = nomeLimpo(nome);
  if(base === nome) continue;
  const m = melhor(i, (porNome.get(base) || []).filter(j => j !== i && !troca.has(j)));
  soma(nomesLimpos, nome + ' → ' + base, [...uso.get(i).camps][0]);
  if(m){
    fusoes.push({ de: nome, para: HIST.P[m.j], cc: ccDe(i), camps: [...uso.get(i).camps].join(','), campsPara: [...uso.get(m.j).camps].slice(0, 6).join(','), anos: vao(uso.get(i), uso.get(m.j)), mesmaFamilia: m.s > 0 });
    troca.set(i, m.j); fundidas++;
    const ui = uso.get(i), uj = uso.get(m.j); ui.anos.forEach(a => uj.anos.add(a)); ui.camps.forEach(c => uj.camps.add(c));
    if(!ccDe(m.j) && ccDe(i)){ const c = campos(m.j); c[1] = ccDe(i); HIST.P[m.j] = c.join('|').replace(/\|+$/, ''); }
    continue;
  }
  /* ninguém com esse nome que combine: a própria entrada passa a se chamar assim */
  const c = campos(i), cc = c[1] || '';
  jogos.delete(jogoDe(i));
  let j = base; if(jogos.has(j)) j = base + ' (' + (cc || '?') + ')';
  for(let k = 2, b0 = j; jogos.has(j); k++) j = b0 + ' ' + k;
  c[0] = base; c[2] = j !== base ? j : '';
  HIST.P[i] = c.join('|').replace(/\|+$/, '');
  jogos.set(j, i); indexa(i); renomeadas++;
}
/* quantas corridas a tabela dava para aquela linha: decide a equipe quando a
   mesma pessoa aparece com duas ("Derrick Gilchrist 7" e "Derrick Gilchrist 1") */
const pesoDe = nome => { const m = String(nome).match(/\s(\d{1,2})(?:\s*\([A-Z]\d?\))?$/); return m ? +m[1] : null; };
const nomesAntes = HIST.P.map((s, i) => troca.has(i) ? nomeDe(i) : null);

/* ── 4. vários pilotos num nome só ── */
const candidatos = (n, t) => (porNome.get(n) || []).filter(j => !troca.has(j))
  .map(j => { const u = uso.get(j), d = Math.min(...[...u.anos].map(a => Math.abs(a - t.ano))); return { j, s: (u.camps.has(t.id) ? 2 : 0) + ([...u.camps].some(c => familia(c) === familia(t.id)) ? 1 : 0), d }; })
  .filter(x => x.d <= 20).sort((x, y) => y.s - x.s || x.d - y.d || x.j - y.j);
const partesDe = (nome, t) => {
  const tk = nome.split(' '), N = tk.length;
  if(N < 4) return null;
  const dp = Array(N + 1).fill(null); dp[0] = [];
  for(let a = 0; a < N; a++){ if(!dp[a]) continue;
    for(let z = a + 2; z <= Math.min(N, a + 5); z++){ if(dp[z] || (a === 0 && z === N)) continue;
      const c = candidatos(tk.slice(a, z).join(' '), t); if(c.length) dp[z] = dp[a].concat([c[0].j]); } }
  return dp[N] && dp[N].length >= 2 ? dp[N] : null;
};

/* ── aplica 3, 4 e 5 a cada temporada ── */
for(const t of T){
  let mudou = false;
  const saida = [];
  for(const x of t.l){
    let ps = [x.p], peso = null;
    if(troca.has(x.p)){ peso = pesoDe(nomesAntes[x.p]); ps = [troca.get(x.p)]; mudou = true; }
    const partes = partesDe(nomeDe(ps[0]), t);
    if(partes){ soma(divididos, nomeDe(ps[0]) + ' → ' + partes.map(nomeDe).join(' + '), t.k); ps = partes; mudou = true; }
    const eq = equipeLimpa(x.eq, t.id);
    if(eq !== x.eq){ soma(contas, x.eq + ' → ' + eq, t.k); mudou = true; }
    ps.forEach(p => saida.push({ p, eq, carro: x.carro, num: x.num, pos: x.pos, peso }));
  }
  if(t.row[3] >= 0 && troca.has(t.row[3])){ t.row[3] = troca.get(t.row[3]); mudou = true; }
  if(!mudou) continue;
  mexidas.add(t.k);
  /* uma linha por pessoa: a que veio primeiro fica; a outra completa o que falta */
  const porP = new Map();
  for(const x of saida){
    const y = porP.get(x.p);
    if(!y){ porP.set(x.p, x); continue; }
    if(x.pos && (!y.pos || +x.pos < +y.pos)) y.pos = x.pos;
    const troca2 = !y.eq || (x.eq && y.peso != null && x.peso != null && x.peso > y.peso);
    if(troca2 && x.eq){ y.eq = x.eq; if(x.carro) y.carro = x.carro; if(x.num) y.num = x.num; y.peso = x.peso; }
    if(!y.carro) y.carro = x.carro; if(!y.num) y.num = x.num;
  }
  t.l = [...porP.values()].sort((m, n) => (m.pos ? +m.pos : 1e6) - (n.pos ? +n.pos : 1e6));
}

/* ── 7. E e K na ordem do primeiro uso; as temporadas de volta ao formato do banco ── */
const dic = () => { const arr = [], m = new Map(); return { arr, i: s => { if(!s) return -1; if(!m.has(s)){ arr.push(s); m.set(s, arr.length - 1); } return m.get(s); } }; };
const E = dic(), K = dic();
const refs = new Set();
for(const t of T){
  t.row[5] = t.l.map(x => { refs.add(x.p); return [b36(x.p), b36(E.i(x.eq)), b36(K.i(x.carro)), x.num, x.pos].join(',').replace(/,+$/, ''); }).join('|');
  if(t.row[3] >= 0) refs.add(t.row[3]);
}
const antes = { E: HIST.E.length, K: HIST.K.length };
HIST.E = E.arr; HIST.K = K.arr;

/* ── 6. vencedores e escalações: a nota sai, a pessoa com marcador vira a de nome limpo ── */
const ehNota = x => typeof x === 'number' ? (!nomesAntes[x] && naoEPiloto(nomeDe(x))) : naoEPiloto(x);
const vira = x => typeof x === 'number' && troca.has(x) ? troca.get(x) : x;
if(V) for(const id in V){ if(id === 'v') continue;
  for(const ano in V[id]){
    V[id][ano] = V[id][ano].map(w => {
      if(!Array.isArray(w)){ if(ehNota(w)){ soma(vencFora, typeof w === 'number' ? nomeDe(w) : w, id + ':' + ano); return undefined; } return vira(w); }
      const l = w.filter(x => !ehNota(x)).map(vira); return l.length ? (l.length === 1 ? l[0] : l) : undefined;
    }).filter(w => w !== undefined);
    V[id][ano].forEach(w => [].concat(w).forEach(x => { if(typeof x === 'number') refs.add(x); }));
  }
}
if(ESC) for(const id in ESC){ if(id === 'v') continue;
  for(const ano in ESC[id]) for(const e of (ESC[id][ano].l || [])) for(const d of (e[4] || [])){ d[0] = vira(d[0]); if(typeof d[0] === 'number') refs.add(d[0]); } }

/* ── 7. a pessoa que ficou sem nenhuma temporada: entrada vazia, o índice fica ── */
let vazias = 0;
HIST.P.forEach((s, i) => { if(s && !refs.has(i)){ HIST.P[i] = ''; vazias++; } });

/* ── o levantamento ── */
const levantamento = { equipes: lista(equipesFora), pilotos: lista(pilotosFora), deslocadas: lista(deslocadas),
  nomes: lista(nomesLimpos), fusoes, divididos: lista(divididos), contas: lista(contas), vencedores: lista(vencFora) };
const mostra = (titulo, l, max) => {
  if(!l.length) return;
  console.log(`\n${titulo} (${l.length} valores, ${l.reduce((a, x) => a + x.linhas, 0)} linhas)`);
  l.slice(0, max).forEach(x => console.log(`  ${String(x.temporadas).padStart(4)} temp. ${String(x.linhas).padStart(4)} linhas  ${JSON.stringify(x.valor)}  ${x.onde.slice(0, 4).join(' ')}${x.onde.length > 4 ? ' …' : ''}`));
  if(l.length > max) console.log(`  … e mais ${l.length - max}`);
};
mostra('EQUIPES que não são equipes', levantamento.equipes, 40);
mostra('PILOTOS que são notas da tabela (a linha sai)', levantamento.pilotos, 40);
mostra('NÚMERO DO CARRO na coluna da equipe (colunas deslocadas; a linha sai)', levantamento.deslocadas, 8);
mostra('NOMES com marcador grudado', levantamento.nomes, 12);
mostra('VÁRIOS PILOTOS num nome só', levantamento.divididos, 12);
mostra('EQUIPES com a conta de corridas', levantamento.contas, 12);
mostra('VENCEDORES que são notas da tabela', levantamento.vencedores, 12);
console.log(`\n${linhas} linhas lidas · ${linhasFora} tiradas · ${equipesVazias} ficaram sem equipe · ${mexidas.size} temporadas mexidas`);
console.log(`nomes limpos: ${fundidas} viraram a pessoa que o banco já tinha, ${renomeadas} foram renomeados · ${vazias} pessoas sem temporada esvaziadas`);
console.log(`equipes ${antes.E} → ${HIST.E.length} · carros ${antes.K} → ${HIST.K.length} · pessoas ${HIST.P.length} (os índices não mudam)`);

if(iJson > 0 && process.argv[iJson + 1]) writeFileSync(process.argv[iJson + 1], JSON.stringify(levantamento, null, 1));
const mudados = [fH, fV, fE].filter(f => f && JSON.stringify(f.obj) !== f.corpo);
if(!APLICAR){ console.log(`\nnada foi gravado (use --aplicar)${mudados.length ? ' · mudariam: ' + mudados.map(f => f.nome).join(', ') : ''}`); process.exit(0); }
if(!mudados.length){ console.log('\no banco já estava limpo: nada a gravar'); process.exit(0); }
mudados.forEach(f => f.grava());
console.log('\ngravado: ' + mudados.map(f => 'dados/' + f.nome).join(', '));
