/* Escalações reais da F1 e da IndyCar, etapa por etapa, lidas da lista de
   inscritos de cada temporada que o importador já guardou em brutos/ (nenhuma
   requisição). Escreve dados/escalacoes.js, que o jogo usa para montar as
   duplas de cada equipe e saber quantos carros ela alinhava.

   Uso: node ferramentas/historico/escalacoes.mjs   (depois do gerar.mjs)

   Por que existe: o banco histórico guarda uma equipe por piloto, a primeira
   linha em que ele aparece. Quem fez uma corrida fora do campeonato por outra
   equipe (Meira pela Foyt em 2008, "NC"), quem substituiu alguém uma vez
   (Russell na Mercedes em 2020) ou quem trocou de equipe no meio do ano
   (Kvyat em 2016) ficava na equipe errada. Aqui cada linha conta as etapas
   que aquele piloto fez por aquela equipe.

   O que sai, por temporada: quantas etapas o campeonato teve e uma linha por
   inscrição (o nome da equipe como a página escreve), com o carro, quantos
   carros ela tinha na maior parte das etapas, em quantas etapas correu e, de
   cada piloto, quantas etapas fez e a primeira. Pessoa = índice
   do banco (HIST.P), achada pela página da Wikipedia; sem página conhecida,
   fica o nome escrito. Não completa nada: temporada em que a tabela não diz
   as etapas fica de fora, e o jogo usa o banco como antes. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, '..', '..');

/* o banco: pessoas e a página de cada uma */
const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(RAIZ, 'dados', 'historico.js'), 'utf8') + ';globalThis.__H = HIST;', ctx);
const HIST = ctx.__H;
const porPagina = new Map(), porNome = new Map(), repetidos = new Set();
HIST.P.forEach((s, i) => { const f = String(s).split('|'); const pg = f[3] || f[0]; if(pg) porPagina.set(pg.replace(/ /g, '_'), i);
  if(porNome.has(f[0])) repetidos.add(f[0]); else porNome.set(f[0], i); });
repetidos.forEach(n => porNome.delete(n));
/* o mesmo nome escrito de outro jeito ("Zhou Guanyu" e "Guanyu Zhou", "A.J." e
   "A. J."): só vale entre as pessoas que o banco já tem naquela temporada */
const letras = s => norm(s).replace(/[^a-z ]/g, ' ').trim();
const chaves = s => [letras(s).replace(/ /g, ''), letras(s).split(/\s+/).sort().join(' ')];
function daTemporada(cid, ano){
  const row = HIST.T[cid] && HIST.T[cid][ano];
  if(!row || !row[5]) return [];
  return row[5].split('|').map(e => parseInt(e.split(',')[0], 36)).filter(i => i >= 0);
}

/* os campeonatos por trás da F1 e da IndyCar do jogo (CAT_HIST no index.html) */
const FAIXAS = [['f1', 1950, 2100], ['usac', 1956, 1978], ['cart', 1979, 1995], ['indy', 1996, 2100]];

const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
/* as etapas de uma célula: "1–4, 6, 9A", "All", "All except 3 and 5", "NC" */
function etapas(rod, total){
  const t = String(rod || '').replace(/\[[^\]]*\]/g, '').trim();
  if(!t) return null;
  const out = new Set();
  const todas = () => { for(let k = 1; k <= total; k++) out.add(String(k)); };
  const exc = t.match(/^all\s+except\s+(.+)$/i);
  if(exc){ todas(); exc[1].split(/\s*(?:,|and|&)\s*/).forEach(x => { const m = x.match(/^(\d+)/); if(m) out.delete(m[1]); }); return out; }
  for(const pedaco of t.split(/\s*[,;]\s*/)){
    if(/^all$/i.test(pedaco)){ todas(); continue; }
    if(/^(nc|none|tba|tbc|—|-)$/i.test(pedaco) || !pedaco) continue;
    const r = pedaco.match(/^(\d+)[A-Z]?\s*[–—-]\s*(\d+)[A-Z]?$/);
    if(r){ for(let k = +r[1]; k <= +r[2]; k++) out.add(String(k)); continue; }
    const u = pedaco.match(/^(\d+[A-Z]?)$/);
    if(u){ out.add(u[1]); continue; }
  }
  return out;
}
const primeira = s => Math.min(...[...s].map(x => parseInt(x, 10)).filter(n => !isNaN(n)));
const mediana = l => { const v = l.slice().sort((a, b) => a - b); return v.length ? v[Math.floor((v.length - 1) / 2)] : 0; };

const ESC = { v: 1 }, fora = [], semPessoa = new Set();
let linhas = 0, temporadas = 0;
for(const [cid, de, ate] of FAIXAS){
  const dir = path.join(AQUI, 'brutos', cid);
  if(!fs.existsSync(dir)) continue;
  for(const arq of fs.readdirSync(dir).sort()){
    const ano = +arq.slice(0, 4);
    if(!(ano >= de && ano <= ate)) continue;
    const b = JSON.parse(fs.readFileSync(path.join(dir, arq), 'utf8'));
    const ins = (b.inscritos || []).filter(x => !x.teste && x.nome && x.eq && !/^sources?:?$/i.test(x.nome.trim()));
    if(!ins.length) continue;
    const maior = Math.max(0, ...ins.flatMap(x => (String(x.rod || '').match(/\d+/g) || []).map(Number)));
    const total = Math.max((b.calendario || []).length, maior);
    /* pessoa → equipe → etapas (as linhas sem etapa só valem se a pessoa não tiver outra) */
    const pes = new Map();
    for(const x of ins){
      const k = x.pagina || x.nome;
      const p = pes.get(k) || { x, eqs: new Map(), semEtapa: new Set() };
      pes.set(k, p);
      const e = etapas(x.rod, total);
      const cha = x.con && x.cha && !norm(x.cha).includes(norm(x.con)) ? x.con + ' ' + x.cha : (x.cha || x.con || '');
      const carro = [cha, x.mot].filter(Boolean).join(' · ');
      if(e == null){ p.semEtapa.add(x.eq + '\u0000' + carro); continue; }
      const q = p.eqs.get(x.eq) || { carro, et: new Set() };
      if(!q.carro && carro) q.carro = carro;
      e.forEach(v => q.et.add(v));
      p.eqs.set(x.eq, q);
    }
    const desconhecidas = [...pes.values()].filter(p => !p.eqs.size && p.semEtapa.size).length;
    /* sem etapas na tabela (a CART de 1990, por exemplo): fica com o banco */
    if(desconhecidas > pes.size * .3){ fora.push(`${cid} ${ano}: ${desconhecidas} de ${pes.size} pilotos sem etapas`); continue; }
    const porEq = new Map();
    for(const p of pes.values()){
      const pg = p.x.pagina ? p.x.pagina.replace(/ /g, '_') : null;
      let id = pg != null && porPagina.has(pg) ? porPagina.get(pg) : porNome.has(p.x.nome) ? porNome.get(p.x.nome) : null;
      if(id == null){
        const [a1, a2] = chaves(p.x.nome);
        const c = daTemporada(cid, ano).filter(i => { const [b1, b2] = chaves(String(HIST.P[i]).split('|')[0]); return a1 === b1 || a2 === b2; });
        if(c.length === 1) id = c[0];
        /* e, por último, sobrenome e inicial ("Patricio" e "Pato O'Ward"), se só um bater */
        const sob = n => letras(n).split(/\s+/), [i1, s1] = [sob(p.x.nome)[0][0], sob(p.x.nome).pop()];
        const d = id == null ? daTemporada(cid, ano).filter(i => { const w = sob(String(HIST.P[i]).split('|')[0]); return w.pop() === s1 && w[0][0] === i1; }) : [];
        if(d.length === 1) id = d[0];
      }
      if(id == null){ id = p.x.nome; semPessoa.add(`${cid} ${ano} ${p.x.nome}`); }
      for(const [eq, q] of p.eqs){
        if(!q.et.size) continue;            /* só corrida fora do campeonato */
        const l = porEq.get(eq) || { carro: q.carro, pil: [] };
        if(!l.carro && q.carro) l.carro = q.carro;
        l.pil.push({ id, et: q.et });
        porEq.set(eq, l);
      }
    }
    const lin = [];
    for(const [eq, l] of porEq){
      /* quantos carros: os pilotos daquela inscrição em cada etapa que ela correu, na
         mediana; e em quantas etapas ela correu (a que só foi às 500 Milhas não é
         um carro da temporada) */
      const conta = {};
      l.pil.forEach(p => p.et.forEach(v => conta[v] = (conta[v] || 0) + 1));
      const carros = Math.max(1, mediana(Object.values(conta)));
      l.pil.sort((a, b) => b.et.size - a.et.size || primeira(a.et) - primeira(b.et));
      lin.push([eq, l.carro || '', carros, Object.keys(conta).length, l.pil.map(p => [p.id, p.et.size, primeira(p.et)])]);
      linhas += l.pil.length;
    }
    if(!lin.length) continue;
    (ESC[cid] = ESC[cid] || {})[ano] = { n: total, l: lin };
    temporadas++;
  }
}

const hoje = new Date().toISOString().slice(0, 10);
const saida = `/* Escalações etapa por etapa da F1 e da IndyCar — gerado por
   ferramentas/historico/escalacoes.mjs em ${hoje} a partir das listas de inscritos
   da Wikipedia em inglês já lidas pelo banco histórico (CC BY-SA 4.0).
   Por temporada: n = etapas do campeonato; l = [equipe inscrita, carro, carros na
   maior parte das etapas, etapas em que ela correu, [[pessoa, etapas, primeira etapa], ...]].
   Pessoa = índice em HIST.P (texto = nome
   como está na página). Não editar à mão. */
const HIST_ESC = ${JSON.stringify(ESC)};
`;
fs.writeFileSync(path.join(RAIZ, 'dados', 'escalacoes.js'), saida);
console.log(`escalações: ${temporadas} temporadas, ${linhas} pilotos por equipe, ${(saida.length / 1024).toFixed(0)} KB`);
if(fora.length) console.log('sem etapas (o jogo usa o banco): ' + fora.join('; '));
if(semPessoa.size) console.log(`${semPessoa.size} nomes sem pessoa no banco (ficam escritos): ` + [...semPessoa].slice(0, 12).join('; ') + (semPessoa.size > 12 ? '…' : ''));
