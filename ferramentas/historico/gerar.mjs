/* ══════════════════════════════════════════════════════════════════
   GERADOR DO BANCO HISTÓRICO
   Lê brutos/<campeonato>/<ano>.json (o que o importador tirou da
   Wikipedia), valida, junta as pessoas que aparecem em vários campeonatos,
   dá a cada uma o nome que o jogo já usa (quando ela existe no jogo) e
   escreve:
     dados/historico.js                    — o banco que o jogo carrega
     ferramentas/historico/RELATORIO.md    — contagens honestas e pendências
   Uso: node ferramentas/historico/gerar.mjs

   Status de cada temporada:
     L  lista de inscritos lida da página da temporada (fonte única)
     C  só a classificação final (parcial: quem não pontuou pode faltar)
     V  a página existe, mas nenhuma tabela foi lida (pendente)
     X  sem página da temporada (pendente)
   Nada aqui é "verificado": verificado exige duas fontes independentes
   concordando, e por enquanto só há uma.
   ══════════════════════════════════════════════════════════════════ */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { CATALOGO, anosDe } from './catalogo.mjs';
import { ccDe } from './paises.mjs';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, '..', '..');
const BRUTOS = join(AQUI, 'brutos');
const HOJE = new Date().toISOString().slice(0, 10);
const ANO_MAX = 2026;
const require = createRequire(import.meta.url);

/* ── o jogo, para saber os nomes que ele já usa ── */
const { carregar } = require(join(RAIZ, 'testes', 'base.js'));
const J = carregar({ semHistorico: true, silencioso: true });
const LINEUPS = J.run('LINEUPS'), JR_REAIS = J.run('JR_REAIS'), JR_HOMONIMOS = J.run('JR_HOMONIMOS');
const SERIES_JOGO = Object.keys(J.run('SERIES'));
const DOCS = {};
SERIES_JOGO.forEach(sk => { DOCS[sk] = J.run(`Mundo.doc(${JSON.stringify(sk)})`); });

/* ── utilidades ── */
const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[’‘`´]/g, "'").replace(/-/g, ' ').replace(/[^a-z0-9' .]/g, ' ').replace(/\s+/g, ' ').trim();
const semJr = s => s.replace(/,? jr\.?$/, '').trim();
const ASIA_SOBRENOME_PRIMEIRO = new Set(['CN', 'TW', 'HK', 'MO', 'KR']);
/* o nome curto do jogo (g) descreve o nome completo (f)? 3 = igual, 2 = inicial e sobrenome, 1 = sobrenome */
function casa(g, f, cc){
  const G = semJr(norm(g)), F = semJr(norm(f));
  if(!G || !F) return 0;
  if(G === F) return 3;
  const m = G.match(/^([a-z])\. (.+)$/);
  if(m) return F.endsWith(' ' + m[2]) && F[0] === m[1] ? 2 : 0;
  if(F.endsWith(' ' + G)) return 1;
  if(ASIA_SOBRENOME_PRIMEIRO.has(cc) && F.startsWith(G + ' ')) return 1;
  return 0;
}
const posNum = p => { const n = parseInt(String(p).replace(/[^\d]/g, ''), 10); return isNaN(n) ? null : n; };
const b36 = n => n < 0 || n == null ? '' : n.toString(36);
const limpa = s => String(s || '').replace(/[|,]/g, ' ').replace(/\s+/g, ' ').trim();

/* ── 1. lê tudo ── */
const brutos = {};
for(const c of CATALOGO){
  brutos[c.id] = {};
  const dir = join(BRUTOS, c.id);
  if(!existsSync(dir)) continue;
  for(const f of readdirSync(dir).filter(x => x.endsWith('.json'))){
    const b = JSON.parse(readFileSync(join(dir, f), 'utf8'));
    brutos[c.id][b.ano] = b;
  }
}

/* ── 2. pessoas ── */
const pessoas = new Map();         /* chave → registro */
const paisesDesconhecidos = {};
const chaveDe = (nome, pagina, cc) => pagina ? 'p:' + norm(pagina.replace(/_/g, ' ')) : 'n:' + norm(nome) + '|' + (cc || '');
function pessoa(nome, pagina, paisTxt, campId, ano, nivel, jogo){
  const { cc, nh, desconhecido } = ccDe(paisTxt);
  if(desconhecido) paisesDesconhecidos[paisTxt] = (paisesDesconhecidos[paisTxt] || 0) + 1;
  const k = chaveDe(nome, pagina, cc);
  let p = pessoas.get(k);
  if(!p){ p = { k, nome, nomes: new Set(), pagina: pagina || null, ccs: {}, nh: null, anos: new Set(), camps: {}, topo: new Set() }; pessoas.set(k, p); }
  p.nomes.add(nome);
  p.cn = p.cn || {}; p.cn[nome] = (p.cn[nome] || 0) + 1;
  if(cc) p.ccs[cc] = (p.ccs[cc] || 0) + 1;
  if(nh && !p.nh) p.nh = nh;
  p.anos.add(ano);
  (p.camps[campId] = p.camps[campId] || []).push(ano);
  if(jogo) p.topo.add(jogo + ':' + ano);
  return p;
}
/* o nome curto do jogo descreve esta pessoa, por qualquer das formas em que o nome dela apareceu? */
const casaP = (g, p) => Math.max(0, ...[...p.nomes].map(n => casa(g, n, ccPrincipal(p))));
const ccPrincipal = p => { const e = Object.entries(p.ccs).sort((a, b) => b[1] - a[1]); return e.length ? e[0][0] : null; };

/* a mesma pessoa, lida sem link numa temporada e com link em outra, é uma só:
   cada registro sem página se junta ao único registro com página que tem o
   mesmo nome e país compatível (se houver dois, fica separado — pode ser
   gente diferente) */
const apelido = new Map();          /* chave sem página → chave com página */
function fundirSemPagina(){
  const porNome = new Map();
  for(const p of pessoas.values()) if(p.pagina){
    for(const n of p.nomes){ const k = norm(n); (porNome.get(k) || porNome.set(k, []).get(k)).push(p); }
  }
  for(const p of [...pessoas.values()]){
    if(p.pagina) continue;
    const cc = ccPrincipal(p);
    const cands = [...new Set(porNome.get(norm(p.nome)) || [])].filter(q => !cc || !ccPrincipal(q) || ccPrincipal(q) === cc);
    if(cands.length !== 1) continue;
    const q = cands[0];
    p.nomes.forEach(n => q.nomes.add(n));
    Object.entries(p.cn || {}).forEach(([n, k]) => { q.cn = q.cn || {}; q.cn[n] = (q.cn[n] || 0) + k; });
    Object.entries(p.ccs).forEach(([c, n]) => q.ccs[c] = (q.ccs[c] || 0) + n);
    p.anos.forEach(a => q.anos.add(a));
    Object.entries(p.camps).forEach(([c, as]) => (q.camps[c] = q.camps[c] || []).push(...as));
    p.topo.forEach(t => q.topo.add(t));
    if(!q.nh && p.nh) q.nh = p.nh;
    apelido.set(p.k, q.k);
    pessoas.delete(p.k);
  }
}
const real = p => { let k = p.k; while(apelido.has(k)) k = apelido.get(k); return pessoas.get(k) || p; };
/* A Wikipedia às vezes liga a mesma pessoa a páginas diferentes (um
   redirecionamento, a página de desambiguação). Mesmo nome, mesmo país e
   anos de corrida a menos de 20 anos uns dos outros: é a mesma pessoa. */
function fundirHomonimos(){
  /* o nome de exibição já é o mais frequente; o agrupamento usa todas as
     formas do nome com nome e sobrenome (um sobrenome sozinho juntaria todos
     os Jones da história) */
  for(const p of pessoas.values()) if(p.cn){ const e = Object.entries(p.cn).sort((a, b) => b[1] - a[1]); p.nome = e[0][0]; }
  const porForma = new Map();
  for(const p of pessoas.values()) for(const v of p.nomes){
    const k = norm(v);
    (porForma.get(k) || porForma.set(k, []).get(k)).push(p);
  }
  const min = p => Math.min(...p.anos), max = p => Math.max(...p.anos);
  const compat = (a, b, k) => { const ca = ccPrincipal(a), cb = ccPrincipal(b);
    /* nome de uma palavra só (um apelido como "Geki", ou um sobrenome solto):
       mesmo país dos dois lados e no máximo três anos de distância */
    if(k.split(' ').length < 2) return !!ca && ca === cb && min(b) - max(a) <= 3 && min(a) - max(b) <= 3;
    /* bandeiras diferentes: tabela antiga com a bandeira trocada, se os dois
       correram o mesmo campeonato na mesma época */
    if(ca && cb && ca !== cb) return min(b) - max(a) <= 2 && min(a) - max(b) <= 2 && Object.keys(a.camps).some(c => b.camps[c]);
    return min(b) - max(a) <= 20 && min(a) - max(b) <= 20; };
  const ordem = [...pessoas.values()].sort((a, b) => (!ccPrincipal(a)) - (!ccPrincipal(b)) || (!a.pagina) - (!b.pagina) || min(a) - min(b));
  let n = 0;
  for(const alvo of ordem){
    if(!pessoas.has(alvo.k)) continue;
    const cands = new Map();
    for(const v of alvo.nomes){ const k = norm(v); (porForma.get(k) || []).forEach(q => { if(!cands.has(q) || k.split(' ').length > 1) cands.set(q, k); }); }
    for(const [p, k] of cands){
      if(p === alvo || !pessoas.has(p.k) || !compat(alvo, p, k)) continue;
      p.nomes.forEach(x => alvo.nomes.add(x));
      Object.entries(p.cn || {}).forEach(([x, k]) => { alvo.cn = alvo.cn || {}; alvo.cn[x] = (alvo.cn[x] || 0) + k; });
      Object.entries(p.ccs).forEach(([c, k]) => alvo.ccs[c] = (alvo.ccs[c] || 0) + k);
      p.anos.forEach(a => alvo.anos.add(a));
      Object.entries(p.camps).forEach(([c, as]) => (alvo.camps[c] = alvo.camps[c] || []).push(...as));
      p.topo.forEach(t => alvo.topo.add(t));
      if(!alvo.nh && p.nh) alvo.nh = p.nh;
      if(!alvo.pagina) alvo.pagina = p.pagina;
      apelido.set(p.k, alvo.k);
      pessoas.delete(p.k);
      n++;
    }
  }
  return n;
}

/* ── 3. temporadas ── */
const temporadas = {};             /* id → ano → montada */
const alertas = [];
for(const c of CATALOGO){
  temporadas[c.id] = {};
  for(const a of anosDe(c, ANO_MAX)){
    const b = brutos[c.id][a];
    const t = { st: 'X', pagina: null, revid: null, lista: [], cal: [], campeao: null, campeaoTxt: null, alertas: [] };
    temporadas[c.id][a] = t;
    if(!b){ t.naoImportado = true; continue; }
    if(!b.pagina){ t.tentativas = b.tentativas; continue; }
    t.pagina = b.pagina; t.revid = b.revid; t.baixado = b.baixado; t.via = b.via;
    const ins = (b.inscritos || []).filter(x => !x.teste);
    const cls = b.classificacao || [];
    const porChave = new Map();
    const add = (x, deCls) => {
      const p = pessoa(x.nome, x.pagina, x.cc, c.id, a, c.nivel, c.jogo);
      let r = porChave.get(p.k);
      if(!r){ r = { p, eqs: [], cons: [], nums: [], carros: [], pos: null, cls: false }; porChave.set(p.k, r); }
      if(x.con && !r.cons.includes(x.con)) r.cons.push(x.con);
      if(x.eq && !r.eqs.includes(x.eq)) r.eqs.push(x.eq);
      if(x.num && !r.nums.includes(x.num)) r.nums.push(x.num);
      const cha = x.con && x.cha && !norm(x.cha).includes(norm(x.con)) ? x.con + ' ' + x.cha : (x.cha || x.con || '');
      const carro = [cha, x.mot].filter(Boolean).join(' · ');
      if(carro && !r.carros.includes(carro)) r.carros.push(carro);
      if(deCls) r.cls = true;
      return r;
    };
    ins.forEach(x => add(x, false));
    /* posição final: '=' herda a do de cima (empate) */
    let ult = null;
    cls.forEach(x => {
      let n = posNum(x.pos);
      if(n == null && /^=/.test(x.pos)) n = ult;
      if(n != null) ult = n;
      const r = add(x, true);
      if(r.pos == null && n != null) r.pos = n;
    });
    t.lista = [...porChave.values()].sort((m, n) => (m.pos == null ? 1e6 : m.pos) - (n.pos == null ? 1e6 : n.pos));
    t.st = ins.length ? 'L' : cls.length ? 'C' : 'V';
    t.nInscritos = ins.length; t.nClassif = cls.length;
    /* calendário */
    t.cal = (b.calendario || []).map(e => ({ circuito: e.circuito, cc: ccDe(e.cc).cc, data: e.data }));
    /* campeão: o que a página diz, ligado a uma pessoa da lista */
    t.campeaoTxt = b.campeao || null;
    if(b.campeao){
      const alvo = norm(b.campeao);
      /* o nome pode vir diferente no infobox ("Alex" e "Alessandro Zanardi",
         "Dave" e "David Walker"): vale sobrenome e inicial, se só um bater */
      const sob = s => semJr(norm(s)).split(' ').pop(), ini = s => norm(s)[0];
      const porSob = t.lista.filter(x => [...x.p.nomes].some(n => sob(n) === sob(b.campeao) && ini(n) === ini(b.campeao)));
      const r = t.lista.find(x => [...x.p.nomes].some(n => norm(n) === alvo)) || t.lista.find(x => alvo.includes(norm(x.p.nome)) && norm(x.p.nome).length > 4)
        || (porSob.length === 1 ? porSob[0] : null);
      if(r) t.campeao = r.p;
      else t.alertas.push('campeão "' + b.campeao + '" não está na lista lida');
      const pri = t.lista.find(x => x.pos === 1);
      if(r && pri && pri.p !== r.p && b.campeaoFonte === 'infobox') t.alertas.push('o 1º da classificação lida (' + pri.p.nome + ') não é o campeão do infobox');
    }
    /* GT e endurance têm três ou quatro pilotos por carro: lista longa é normal */
    const teto = /gt|endurance/.test(c.tipo) ? 420 : c.tipo === 'turismo' || c.tipo === 'stock' ? 200 : 140;
    if(t.lista.length > teto) t.alertas.push(t.lista.length + ' pilotos: lista grande demais, conferir a tabela lida');
    if(t.st === 'L' && t.lista.length < 6) t.alertas.push('só ' + t.lista.length + ' pilotos na lista de inscritos');
    const semPais = t.lista.filter(x => !ccPrincipal(x.p)).length;
    if(semPais > 3) t.alertas.push(semPais + ' pilotos sem nacionalidade legível');
    t.alertas.forEach(m => alertas.push({ id: c.id, ano: a, m }));
  }
}

/* junta as pessoas lidas sem link às que têm página, e os homônimos que são
   a mesma pessoa; depois refaz cada lista */
fundirSemPagina();
const homonimosFundidos = fundirHomonimos();
for(const id in temporadas) for(const a in temporadas[id]){
  const t = temporadas[id][a];
  if(!t.lista.length) continue;
  const m = new Map();
  for(const r of t.lista){
    r.p = real(r.p);
    const x = m.get(r.p.k);
    if(!x){ m.set(r.p.k, r); continue; }
    if(r.pos != null && (x.pos == null || r.pos < x.pos)) x.pos = r.pos;
    ['eqs', 'cons', 'nums', 'carros'].forEach(k => r[k].forEach(v => { if(!x[k].includes(v)) x[k].push(v); }));
  }
  t.lista = [...m.values()].sort((u, v) => (u.pos == null ? 1e6 : u.pos) - (v.pos == null ? 1e6 : v.pos));
  if(t.campeao) t.campeao = real(t.campeao);
}

/* o nome de exibição é a forma que mais aparece nas fontes */
for(const p of pessoas.values()) if(p.cn){ const e = Object.entries(p.cn).sort((a, b) => b[1] - a[1]); p.nome = e[0][0]; }

/* ── 4. o nome de cada pessoa no jogo ── */
const nomeJogo = new Map();        /* chave da pessoa → nome no jogo */
const dono = new Map();            /* nome no jogo → chave (cada nome é de uma pessoa só) */
const comoAchou = { escalacao: 0, lista: 0, base: 0 };
const auditoria = [];
const mapa = [];
function atribuir(p, nome, forca, como){
  const atual = dono.get(nome);
  if(atual && atual.k !== p.k){ if(atual.forca >= forca) return false; nomeJogo.delete(atual.k); }
  if(nomeJogo.has(p.k)) return false;
  nomeJogo.set(p.k, nome); dono.set(nome, { k: p.k, forca }); comoAchou[como]++;
  mapa.push({ nome: p.nome, jogo: nome, como, cc: ccPrincipal(p), anos: Math.min(...p.anos) + '–' + Math.max(...p.anos), camps: Object.keys(p.camps).join(' ') });
  return true;
}
/* 4a. escalações ano a ano (F1 e Indy): o nome do jogo contra quem estava inscrito naquele ano */
const ESCALACAO_CAMP = { f1: ['f1'], indy: ['indy', 'cart'] };
for(const sk in ESCALACAO_CAMP){
  const L = LINEUPS[sk] || {};
  for(const ano in L){
    const pessoasAno = [];
    ESCALACAO_CAMP[sk].forEach(id => { const t = temporadas[id] && temporadas[id][ano]; if(t) t.lista.forEach(r => pessoasAno.push(r)); });
    if(!pessoasAno.length) continue;
    String(L[ano]).split('|').filter(Boolean).forEach(bloco => {
      const i = bloco.indexOf(':'), equipe = bloco.slice(0, i);
      bloco.slice(i + 1).split(',').filter(Boolean).forEach(g => {
        const cands = pessoasAno.map(r => ({ r, s: casaP(g, r.p) })).filter(x => x.s > 0);
        const melhor = Math.max(0, ...cands.map(x => x.s));
        const top = [...new Map(cands.filter(x => x.s === melhor).map(x => [x.r.p.k, x])).values()];
        if(top.length === 1){
          atribuir(top[0].r.p, g, 10 + melhor, 'escalacao');
          /* auditoria: a equipe do jogo aparece no que a Wikipedia diz daquele piloto? */
          const r = top[0].r, txt = norm(r.eqs.concat(r.cons, r.carros).join(' '));
          const pal = norm(equipe).split(' ').filter(w => w.length > 2);
          if(pal.length && !pal.some(w => txt.includes(w))) auditoria.push({ sk, ano: +ano, piloto: g, equipeJogo: equipe, wikipedia: r.eqs.join(' / ') || '?' });
        } else if(!top.length && ESCALACAO_CAMP[sk].some(id => { const t = temporadas[id][ano]; return t && t.st === 'L'; })){
          auditoria.push({ sk, ano: +ano, piloto: g, equipeJogo: equipe, wikipedia: 'não aparece entre os inscritos daquele ano' });
        }
      });
    });
  }
}
/* 4b. as listas de época de todas as séries do jogo (nome, país, anos) */
for(const sk of SERIES_JOGO){
  const doc = DOCS[sk];
  for(const nome in doc){
    if(dono.has(nome)) continue;
    const d = doc[nome];
    const cands = [];
    for(const p of pessoas.values()){
      if(nomeJogo.has(p.k)) continue;
      const cc = ccPrincipal(p);
      if(cc && d.cc && cc !== d.cc) continue;
      const s = casaP(nome, p);
      if(!s) continue;
      const anos = [...p.anos];
      const cabem = anos.filter(y => y >= d.de - 12 && y <= d.ate + 20).length;
      /* nome completo idêntico e mesmo país bastam; sobrenome sozinho precisa
         dos anos certos (senão Giuliano Alesi viraria o Jean) */
      if(s < 3 && (cabem < anos.length * .6 || Math.min(...anos) > d.ate)) continue;
      const naSerie = [...p.topo].some(x => x.startsWith(sk + ':'));
      cands.push({ p, s: s + (naSerie ? 2 : 0) });
    }
    if(!cands.length) continue;
    const melhor = Math.max(...cands.map(x => x.s));
    const top = cands.filter(x => x.s === melhor);
    if(top.length === 1) atribuir(top[0].p, nome, 5 + melhor, 'base');
  }
}
/* 4c. os grids da base que o jogo já tinha (F2, F3, Fórmula Regional): o nome curto que ele usava */
const JR_CAMP = { f2: ['f2'], f3: ['f3'], freg: ['frec'] };
for(const cat in JR_REAIS){
  for(const ano in JR_REAIS[cat]){
    const lista = (JR_CAMP[cat] || []).flatMap(id => (temporadas[id] && temporadas[id][ano] ? temporadas[id][ano].lista : []));
    String(JR_REAIS[cat][ano]).split('|').filter(Boolean).forEach(x => {
      const cru = x.slice(0, x.lastIndexOf(':')).replace(/_/g, ' ');
      const g = JR_HOMONIMOS[cru] || cru;
      if(dono.has(g)) return;
      const cands = lista.map(r => ({ r, s: casaP(g, r.p) })).filter(y => y.s > 0);
      const melhor = Math.max(0, ...cands.map(y => y.s));
      const top = [...new Map(cands.filter(y => y.s === melhor).map(y => [y.r.p.k, y])).values()];
      if(top.length === 1) atribuir(top[0].r.p, g, 4 + melhor, 'lista');
    });
  }
}
/* 4d. quem não está no jogo fica com o nome completo; nome repetido ganha o país */
const usados = new Set([...dono.keys(), ...SERIES_JOGO.flatMap(sk => Object.keys(DOCS[sk]))]);
const contaNome = {};
for(const p of pessoas.values()) if(!nomeJogo.has(p.k)) contaNome[p.nome] = (contaNome[p.nome] || 0) + 1;
for(const p of pessoas.values()){
  if(nomeJogo.has(p.k)) continue;
  let n = p.nome;
  if(contaNome[n] > 1 || usados.has(n)) n = n + ' (' + (ccPrincipal(p) || '?') + ')';
  let k = 2; const base = n;
  while(usados.has(n)) n = base + ' ' + (k++);
  usados.add(n); nomeJogo.set(p.k, n);
}

/* ── 5. o arquivo do jogo ── */
const P = [], idxP = new Map();
const iP = p => { if(idxP.has(p.k)) return idxP.get(p.k);
  const j = nomeJogo.get(p.k), pg = p.pagina && p.pagina.replace(/_/g, ' ') !== p.nome ? p.pagina.replace(/ /g, '_') : '';
  const linha = [p.nome, ccPrincipal(p) || '', j !== p.nome ? j : '', pg, p.nh || ''].join('|').replace(/\|+$/, '');
  P.push(linha); idxP.set(p.k, P.length - 1); return P.length - 1; };
const dic = () => { const arr = [], m = new Map(); return { arr, i: s => { if(!s) return -1; if(!m.has(s)){ arr.push(s); m.set(s, arr.length - 1); } return m.get(s); } }; };
const E = dic(), K = dic(), L = dic();
const T = {};
const resumo = {};
for(const c of CATALOGO){
  const r = resumo[c.id] = { L: 0, C: 0, V: 0, X: 0, anos: 0, anosDados: [], semPagina: [] };
  for(const a of anosDe(c, ANO_MAX)){
    const t = temporadas[c.id][a];
    r.anos++; r[t.st]++;
    if(t.st === 'L' || t.st === 'C') r.anosDados.push(a);
    if(t.st === 'X') r.semPagina.push(a);
    if(t.st === 'X' && !t.pagina) continue;
    const ents = t.lista.map(x => [b36(iP(x.p)), b36(E.i(limpa(x.eqs[0]))), b36(K.i(limpa(x.carros[0]))), limpa(x.nums[0]), x.pos == null ? '' : x.pos].join(',').replace(/,+$/, '')).join('|');
    const cal = t.cal.map(e => [b36(L.i(limpa(e.circuito))), e.cc || '', limpa(e.data)].join(',').replace(/,+$/, '')).join('|');
    (T[c.id] = T[c.id] || {})[a] = [t.st, t.pagina, t.revid || 0, t.campeao ? iP(t.campeao) : -1, t.campeao ? '' : (t.campeaoTxt || ''), ents, cal];
  }
}
const C = CATALOGO.map(c => {
  const o = { id: c.id, n: c.nome, ns: c.nomes, de: c.de, ate: c.ate, p: c.pais, r: c.regiao, nv: c.nivel, t: c.tipo };
  if(c.sucessor) o.s = c.sucessor;
  if(c.jogo) o.j = c.jogo;
  if(c.artigo) o.a = c.artigo;
  return o;
});
const saida = `/* ═══════════════════════════════════════════════════════════════════
   BANCO HISTÓRICO DO AUTOMOBILISMO — gerado por ferramentas/historico/gerar.mjs
   em ${HOJE}. Não editar à mão: rode o importador e o gerador de novo.
   Fonte: Wikipedia em inglês (texto sob CC BY-SA 4.0), uma página por
   temporada, com a revisão lida guardada em cada temporada.
   Status: L = lista de inscritos (fonte única) · C = só a classificação
   final (parcial) · V = página sem tabela legível · X = sem página.
   Nenhuma temporada aqui é "verificada": só há uma fonte.
   P: nome completo|país|nome no jogo|página|nacionalidade histórica
   T[campeonato][ano]: [status, página, revisão, campeão (índice em P),
     campeão em texto, inscritos "piloto,equipe,carro,número,posição|…",
     calendário "circuito,país,data|…"] — índices em base 36
   ═══════════════════════════════════════════════════════════════════ */
var HIST = ${JSON.stringify({ v: 1, gerado: HOJE, fonte: { nome: 'Wikipedia em inglês', url: 'https://en.wikipedia.org/wiki/', licenca: 'CC BY-SA 4.0' },
  C, P, E: E.arr, K: K.arr, L: L.arr, T })};
`;
mkdirSync(join(RAIZ, 'dados'), { recursive: true });
writeFileSync(join(RAIZ, 'dados', 'historico.js'), saida);

/* ── 6. relatório ── */
const tot = { camp: CATALOGO.length, anos: 0, L: 0, C: 0, V: 0, X: 0 };
Object.values(resumo).forEach(r => { tot.anos += r.anos; tot.L += r.L; tot.C += r.C; tot.V += r.V; tot.X += r.X; });
const campComDados = Object.values(resumo).filter(r => r.L + r.C > 0).length;
const pessoasUsadas = P.length, comPais = [...pessoas.values()].filter(p => ccPrincipal(p)).length;
const faixas = anos => { const out = []; let i = 0; anos = anos.slice().sort((a, b) => a - b);
  while(i < anos.length){ let j = i; while(j + 1 < anos.length && anos[j + 1] === anos[j] + 1) j++; out.push(i === j ? '' + anos[i] : anos[i] + '–' + anos[j]); i = j + 1; } return out.join(', '); };
const NIVEL = ['kart', 'entrada (F4, Ford, Vee)', 'regional', 'F3', 'F2 / topo nacional', 'topo mundial'];
let md = `# Banco histórico — relatório\n\nGerado em ${HOJE} por \`ferramentas/historico/gerar.mjs\`.\n\n` +
`## O que estes números são\n\n` +
`- **Fonte:** uma só, a Wikipedia em inglês, lida pela API pública do MediaWiki (uma requisição por vez, com pausa e identificação). Cada temporada guarda a página e o número da revisão lida.\n` +
`- **Nada aqui está "verificado".** Verificado exigiria uma segunda fonte independente concordando. As temporadas com lista de inscritos são **fonte única**; as que só têm a classificação final são **parciais** (quem não pontuou pode faltar); o resto está **pendente**.\n` +
`- **Cadastrado não é verificado:** o catálogo lista ${tot.camp} campeonatos; ter um campeonato no catálogo não quer dizer que as temporadas dele foram importadas.\n` +
`- Os dados de pilotos que o jogo já tinha à mão (escalações da F1 e da Indy, grids de F2/F3/F. Regional de 2017 em diante) continuam como estavam; o banco novo não os substitui, e a auditoria abaixo mostra onde eles discordam da fonte.\n\n` +
`## Totais\n\n| | |\n|---|---|\n` +
`| Campeonatos no catálogo | ${tot.camp} |\n| Campeonatos com ao menos uma temporada lida | ${campComDados} |\n` +
`| Temporadas cobertas pelo catálogo (campeonato × ano, até ${ANO_MAX}) | ${tot.anos} |\n` +
`| Temporadas com lista de inscritos (fonte única) | ${tot.L} |\n| Temporadas só com a classificação final (parcial) | ${tot.C} |\n` +
`| Temporadas com página mas sem tabela legível (pendente) | ${tot.V} |\n| Temporadas sem página própria (pendente) | ${tot.X} |\n` +
`| Temporadas verificadas por duas fontes | 0 |\n` +
`| Pilotos reais distintos | ${pessoasUsadas} (com nacionalidade lida: ${comPais}) |\n` +
`| Pilotos ligados a um nome que o jogo já usava | ${comoAchou.escalacao + comoAchou.base + comoAchou.lista} (escalação ano a ano: ${comoAchou.escalacao}; listas de época: ${comoAchou.base}; grids de base do jogo: ${comoAchou.lista}) |\n` +
`| Equipes (nomes de inscrição distintos) | ${E.arr.length} |\n| Carros (chassi · motor distintos) | ${K.arr.length} |\n| Circuitos (nomes distintos nos calendários) | ${L.arr.length} |\n\n` +
`## Por campeonato\n\nL = lista de inscritos · C = só classificação · P = pendente (sem página ou sem tabela legível)\n\n| Campeonato | Nível | Período | L | C | P | Anos com dados |\n|---|---|---|---|---|---|---|\n` +
CATALOGO.map(c => { const r = resumo[c.id]; return `| ${c.nome} (\`${c.id}\`) | ${NIVEL[c.nivel] || c.nivel} | ${c.de}–${c.ate == null ? 'hoje' : c.ate} | ${r.L} | ${r.C} | ${r.V + r.X} | ${faixas(r.anosDados) || '—'} |`; }).join('\n') +
`\n\n## Pendências: temporadas sem página própria na Wikipedia em inglês\n\n` +
CATALOGO.filter(c => resumo[c.id].semPagina.length).map(c => `- **${c.nome}:** ${faixas(resumo[c.id].semPagina)}`).join('\n') +
`\n\n## Alertas da validação (${alertas.length})\n\n` + (alertas.length ? alertas.slice(0, 400).map(x => `- \`${x.id}\` ${x.ano}: ${x.m}`).join('\n') : 'Nenhum.') +
(alertas.length > 400 ? `\n- … e mais ${alertas.length - 400}` : '') +
`\n\n## Auditoria das escalações do jogo contra a fonte (${auditoria.length})\n\nO jogo põe o piloto na equipe da coluna "jogo"; a Wikipedia o lista inscrito pela equipe da última coluna. Nem toda linha é erro do jogo (o jogo resume cada temporada em equipes e pilotos principais), mas cada uma merece conferência.\n\n| Série | Ano | Piloto (jogo) | Equipe no jogo | Na Wikipedia |\n|---|---|---|---|---|\n` +
auditoria.sort((a, b) => a.sk.localeCompare(b.sk) || a.ano - b.ano).map(x => `| ${x.sk} | ${x.ano} | ${x.piloto} | ${x.equipeJogo} | ${x.wikipedia} |`).join('\n') +
`\n\n## Nomes de país não reconhecidos\n\n` + (Object.keys(paisesDesconhecidos).length ? Object.entries(paisesDesconhecidos).sort((a, b) => b[1] - a[1]).map(([k, v]) => `- ${k}: ${v}`).join('\n') : 'Nenhum.') + '\n';
/* os anos de teste: cada degrau de cada escada do jogo, o campeonato real e o que há dele */
const CAT_HIST = J.run('CAT_HIST');
const campDe = (cat, ano) => { const f = (CAT_HIST[cat] || []).find(x => ano >= x[0] && ano <= x[1]); return f ? f[2] : null; };
const NOMES_SERIE = { f1: 'Fórmula 1', indy: 'IndyCar', wec: 'Endurance', stock: 'Stock Car', nascar: 'NASCAR', dtm: 'DTM', fe: 'Fórmula E' };
md += `\n## Anos de teste\n\nCada degrau da escada de cada carreira do jogo (resolvida para um piloto britânico; outras nacionalidades trocam os degraus nacionais), o campeonato real que ele representa e o que o banco tem daquela temporada. **L** lista de inscritos · **C** só classificação · **—** sem fonte (o grid é simulado).\n\n`;
for(const ano of [1950, 1960, 1975, 1985, 1995, 2005, 2015, 2026]){
  md += `### ${ano}\n\n`;
  for(const sk of SERIES_JOGO){
    const esc = J.run(`(() => { const e = eraOfSeries(${ano}, '${sk}'); return ${ano} >= (SERIES['${sk}'].from || 0) ? resolveLadder(e.ladder, 'GB', ${ano}) : null; })()`);
    if(!esc) continue;
    md += `- **${NOMES_SERIE[sk] || sk}:** ` + esc.map(cat => {
      const id = campDe(cat, ano), t = id && temporadas[id] && temporadas[id][ano];
      if(!id) return `${cat} (sem campeonato no catálogo)`;
      const st = t && (t.st === 'L' || t.st === 'C') ? `${t.st}, ${t.lista.length} pilotos` : '—';
      return `${cat} → \`${id}\` (${st})`;
    }).join(' · ') + '\n';
  }
  md += '\n';
}
writeFileSync(join(AQUI, 'RELATORIO.md'), md);
writeFileSync(join(AQUI, 'auditoria.json'), JSON.stringify(auditoria, null, 1));
writeFileSync(join(AQUI, 'nomes-do-jogo.json'), JSON.stringify(mapa.filter(m => nomeJogo.get([...pessoas.values()].find(p => p.nome === m.nome)?.k) === m.jogo || true), null, 1));

const kb = Math.round(Buffer.byteLength(saida) / 1024);
console.log(`dados/historico.js: ${kb} KB · ${P.length} pilotos · ${E.arr.length} equipes · ${K.arr.length} carros · ${L.arr.length} circuitos`);
console.log(`temporadas: ${tot.L} com inscritos, ${tot.C} só classificação, ${tot.V + tot.X} pendentes de ${tot.anos}`);
console.log(`homônimos fundidos: ${homonimosFundidos} · nomes do jogo: ${JSON.stringify(comoAchou)} · alertas ${alertas.length} · auditoria ${auditoria.length}`);

/* depuração: DEP="nome" node gerar.mjs mostra as pessoas com esse nome */
if(process.env.DEP) for(const p of pessoas.values()) if([...p.nomes].some(n => norm(n).includes(norm(process.env.DEP))))
  console.log(p.k, '|', [...p.nomes].join(' / '), '|', JSON.stringify(p.ccs), '|', Math.min(...p.anos) + '–' + Math.max(...p.anos), '|', Object.keys(p.camps).join(' '), '| jogo:', nomeJogo.get(p.k));
