/* Manager 2.0, fase 5: as rivais.
   — até o último ano documentado a força das rivais é a da história, mesmo com
     a gestão criada;
   — depois, cada rival é gerida: orçamento, tipo e jeito próprios; o mesmo save
     dá o mesmo mundo; o orçamento anda com o resultado; o teto de gastos segura
     os ricos; as rivais levam pacotes no meio do ano;
   — tirar um piloto de uma rival esfria a relação: o motor dela fica mais caro
     e os pilotos dela ficam mais difíceis de contratar.
   Uso: node testes/ia-chefe.js   Não modifica arquivos nem saves. */
const H = require('./base');
let falhas = 0, n = 0;
const ok = (c, m) => { n++; if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };

function equipe(seed, ano, pos){
  const J = H.carregar({ silencioso: true, seed });
  J.run(require('./chefe-comum'));
  J.run(`(() => { const l = eraOfSeries(${ano}, 'f1').teams.map((t, i) => [i, Engine.resolveTeam(t, i, ${ano}, 'f1')]).filter(x => x[1]).sort((a, b) => b[1].str - a[1].str);
    Chefe.novo({ chefe:{ nome:'T', cc:'BR' }, realismo:true, modo:'assumir', sk:'f1', ano:${ano}, idx:l[Math.min(l.length - 1, ${pos})][0] });
    __inverno(); Chefe.comecarTemporada(); UI.limparFila(); UI.close(); })()`);
  return J;
}
const ateAno = (J, alvo) => J.run(`(() => { let g = 0; while(C.ano < ${alvo} && g++ < 10){ Math.random = (() => { let x = 7 + C.ano; return () => { x = (x * 16807) % 2147483647; return x / 2147483647; }; })();
  __temporada(); Chefe.proximoAno(); UI.limparFila(); UI.close(); __inverno(); } return C.ano; })()`);

/* 1. a história fica intacta */
{
  const J = equipe(3, 2024, 4);
  const r = J.run(`(() => { C.ia = { sk:'f1', ano: 2030, eq: { 'McLaren': { str: 60 } }, pos: {} };
    const a = Chefe.equipesIA(2024).map(t => t.name + Math.round(t.str * 10)).join(), b = Chefe.equipesHist(2024).map(t => t.name + Math.round(t.str * 10)).join();
    const c = Chefe.equipesIA(2026).map(t => t.name + Math.round(t.str * 10)).join(), d = Chefe.equipesHist(2026).map(t => t.name + Math.round(t.str * 10)).join();
    C.ia = null; return { a, b, c, d, ativa: Chefe.iaAtiva(2026), ativa27: Chefe.iaAtiva(2027) }; })()`);
  ok(r.a === r.b && r.c === r.d && !r.ativa && r.ativa27, 'até 2026 a força das rivais é a da história, mesmo com a gestão criada; de 2027 em diante a gestão vale');
}

/* 2. depois da história: a gestão das rivais */
{
  const corre = seed => { const J = equipe(seed, 2026, 5); ateAno(J, 2028); return J; };
  const J = corre(21), K = corre(21);
  const a = J.run(`JSON.stringify(Object.fromEntries(Object.entries(C.ia.eq).map(([k, g]) => [k, [g.str, Math.round(g.orc * 1000)]])))`);
  const b = K.run(`JSON.stringify(Object.fromEntries(Object.entries(C.ia.eq).map(([k, g]) => [k, [g.str, Math.round(g.orc * 1000)]])))`);
  const r = J.run(`(() => { const ia = Chefe.equipesIA(C.ano), hist = Chefe.equipesHist(C.ano);
    const dif = ia.filter((t, k) => Math.abs(t.str - hist[k].str) > .05).length;
    const tipos = new Set(Object.values(C.ia.eq).map(g => g.tipo));
    return { ano: C.ano, iaAno: C.ia.ano, dif, n: ia.length, tipos: [...tipos].join(','), temPos: Object.keys(C.ia.pos || {}).length, tam: JSON.stringify(C.ia).length }; })()`);
  ok(r.ano === 2028 && r.iaAno === 2028, `a gestão das rivais acompanha o save até ${r.ano}`);
  ok(r.dif >= r.n / 2, `a força das rivais sai das decisões delas, não da extrapolação do banco (${r.dif} de ${r.n} diferentes)`);
  ok(a === b, 'o mesmo save, com as mesmas decisões, dá o mesmo mundo');
  ok(r.tipos.indexOf('fabrica') >= 0 && r.tipos.indexOf('independente') >= 0 && r.temPos > 0, 'equipes de fábrica e independentes, com a posição do ano guardada para a decisão de inverno');
  ok(r.tam < 6000, `a gestão das rivais ocupa pouco no save (${r.tam} caracteres)`);
}

/* 3. as regras da gestão */
{
  const J = equipe(5, 2026, 5);
  const r = J.run(`(() => {
    const mk = (orc, extra) => Object.assign({ tipo:'independente', agr:.5, risco:0, paciencia:.5, orc, str:80, hist:[] }, extra || {});
    C.ia = { sk:'f1', ano: 2026, eq: { Rica: mk(1.1), Pobre: mk(.4), A: mk(.7), B: mk(.7) }, pos: {} };
    for(let a = 2027; a <= 2032; a++){ C.ia.pos[a - 1] = { Rica: 2, Pobre: 9, A: 1, B: 10 }; Chefe.iaInverno(a); }
    const eq = C.ia.eq;
    const comTeto = Chefe.iaAlvo(1.25, 2030); C.sk = 'indy'; const semTeto = Chefe.iaAlvo(1.25, 2030); C.sk = 'f1';
    return { rica: eq.Rica.str, pobre: eq.Pobre.str, a: eq.A.orc, b: eq.B.orc, comTeto, semTeto }; })()`);
  ok(r.rica > r.pobre + 4, `quem tem orçamento constrói carro melhor (${r.rica} contra ${r.pobre} depois de seis anos)`);
  ok(r.a > r.b + .1, `o orçamento anda com o resultado: a campeã ganha (${r.a.toFixed(2)}), a última perde (${r.b.toFixed(2)})`);
  ok(r.comTeto < r.semTeto, 'com teto de gastos, o rico não pode gastar tudo');
  const p = J.run(`(() => { C.ia = null; Chefe.iaGarantir(2027); const sea = C.temporada; sea.ano = 2027; sea.teams.forEach(t => { if(C.ia.eq[t.name]) t.str = C.ia.eq[t.name].str; });
    const antes = sea.teams.map(t => t.str).join();
    sea.round = Math.floor(sea.calendar.length / 3); const feitos = Chefe.iaPacotes(sea);
    const depois = sea.teams.map(t => t.str).join();
    sea.ano = 2024; sea.round = Math.floor(sea.calendar.length / 3); const hist = Chefe.iaPacotes(sea); sea.ano = 2026;
    return { feitos: feitos.length, mudou: antes !== depois, hist: hist.length }; })()`);
  ok(p.feitos > 0 && p.mudou, `no meio do ano as rivais levam pacotes (${p.feitos} equipes na janela)`);
  ok(p.hist === 0, 'num ano da história, nenhuma rival muda de força no meio do ano');
}

/* 4. consequências: tirar um piloto de uma rival */
{
  const J = equipe(11, 2024, 6);
  const r = J.run(`(() => { const p = { id: Chefe.novoId(), nome:'Piloto da Rival', cc:'GB', nasc: 2000, real:false, hab: 84, pot: 86, skill: 84, pede: 1e6, eqHist:'Mercedes', strHist: 92, orig:'f1', moral:60, fama:40, papel:'livre', est:{ gps:0, v:0, pod:0, pts:0, poles:0 } };
    const antes = Chefe.chanceAssinar(Object.assign({}, p, { nome:'Outro' }), { sal:1, anos:2 });
    const m = { nome:'Mercedes', custo:1.2 }; const caro0 = Chefe.custoMotor(m);
    Chefe.assinar(p, { sal:1, anos:1, papel:'teste' }, 1);
    const depois = Chefe.chanceAssinar(Object.assign({}, p, { nome:'Outro' }), { sal:1, anos:2 });
    return { rel: C.rel.Mercedes, caro0, caro1: Chefe.custoMotor(m), antes, depois, news: C.news.some(n => /não gostou de perder/.test(n.t)) }; })()`);
  ok(r.rel < 0 && r.news, `tirar um piloto da Mercedes esfria a relação (${r.rel}) e vira notícia`);
  ok(r.caro1 > r.caro0, 'o motor da Mercedes fica mais caro para você');
  ok(r.depois < r.antes, 'e os pilotos dela ficam mais difíceis de contratar');
  const d = J.run(`(() => { C.rel.Mercedes = -40; __temporada(); Chefe.proximoAno(); UI.limparFila(); UI.close(); return C.rel.Mercedes || 0; })()`);
  ok(d > -40, 'a memória esfria com os invernos');
}

console.log(falhas ? falhas + ' falha(s) de ' + n : `rivais com gestão própria: ${n} verificações, tudo certo`);
if(falhas) process.exitCode = 1;
