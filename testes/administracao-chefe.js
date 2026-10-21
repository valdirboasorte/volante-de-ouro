/* Manager 2.0, fase 4: a administração do chefe.
   — o caixa etapa a etapa bate com o que acontece nas corridas (dentro do que
     reparos e bônus mudam) e mostra o efeito de uma decisão antes dela;
   — o chefe de mecânicos pesa no tempo parado e na chance de parada lenta;
   — o patrocinador pede um objetivo por etapa, paga o bônus quando cumprido e a
     satisfação decide a renovação no fim do contrato;
   — a diretoria acompanha corrida a corrida e cobra a sua prioridade no fim do ano.
   Uso: node testes/administracao-chefe.js   Não modifica arquivos nem saves. */
const H = require('./base');
let falhas = 0, n = 0;
const ok = (c, m) => { n++; if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };

function equipe(seed, ano, pos, sk){
  sk = sk || 'f1';
  const J = H.carregar({ silencioso: true, seed });
  J.run(require('./chefe-comum'));
  J.run(`(() => { const l = eraOfSeries(${ano}, '${sk}').teams.map((t, i) => [i, Engine.resolveTeam(t, i, ${ano}, '${sk}')]).filter(x => x[1]).sort((a, b) => b[1].str - a[1].str);
    Chefe.novo({ chefe:{ nome:'T', cc:'BR' }, realismo:true, modo:'assumir', sk:'${sk}', ano:${ano}, idx:l[Math.min(l.length - 1, ${pos})][0] });
    __inverno(); Chefe.comecarTemporada(); UI.limparFila(); UI.close();
    globalThis._etapa = () => { const sea = C.temporada; Chefe.gridDaEtapa(sea); const M = Chefe.montar();
      const R = Gp.criar(Gp.entrada(sea, M, Chefe.sk(), sea.ano, f => f.teamId === 'EU', { gestao: true })); Gp.terminar(R);
      const res = Gp.resultado(R); return Chefe.correr({ montagem: M, finish: Gp.chegada(M, res), flId: res.flId, sc: res.sc }); };
  })()`);
  return J;
}

/* 1. o caixa etapa a etapa */
{
  const J = equipe(5, 2019, 4);
  const r = J.run(`(() => { const f = Chefe.fluxo(); const antes = C.caixa;
    const prev3 = f.etapas[2].caixa; const recs = [_etapa(), _etapa(), _etapa()];
    const bonus = recs.reduce((a, x) => a, 0);
    const extra = Chefe.caixaFimAno({ agora: -Chefe.M(10e6) }), base = Chefe.caixaFimAno();
    return { n: f.etapas.length, resta: C.temporada.calendar.length, prev3, real: C.caixa, antes, base, extra, dez: Chefe.M(10e6), op: Chefe.M(1.05e6),
      faixa: f.min <= f.fim && f.fim <= f.max }; })()`);
  ok(r.n === r.resta, `uma barra para cada uma das ${r.resta} etapas que faltam`);
  ok(Math.abs(r.real - r.prev3) < r.op * 4, `depois de três corridas, o caixa real (${(r.real / 1e6).toFixed(1)} mi) fica perto do previsto (${(r.prev3 / 1e6).toFixed(1)} mi)`);
  ok(Math.abs((r.base - r.extra) - r.dez) < 1, 'uma decisão de 10 mi aparece inteira no caixa do fim do ano antes de ser tomada');
  ok(r.faixa, 'o fim do ano vem com faixa (reparos, bônus e posição final)');
}

/* 2. o chefe de mecânicos */
{
  const J = equipe(7, 2016, 3);
  const r = J.run(`(() => { const sea = C.temporada; Chefe.gridDaEtapa(sea); const M = Chefe.montar();
    const ent = Gp.entrada(sea, M, Chefe.sk(), sea.ano, f => f.teamId === 'EU', { gestao: true });
    const temBox = ent.carros.filter(c => c.ctrl).every(c => c.box != null);
    const parada = (nivel, x) => { const e = JSON.parse(JSON.stringify(ent)); e.carros.forEach(c => { c.risco = null; c.erro = false; if(c.ctrl) c.box = nivel; });
      const R = Gp.criar(e); const s = R.carros.find(c => c.c.ctrl); s.ia = null; s.auto = false;
      while(s.voltas < 2){ if(R.pergunta) Gp.responder(R, R.pergunta.padrao); Gp.passo(R); }
      s.parar = R.regras.secos[0]; const rnd = R.rnd;
      while(s.estado !== 2 && !R.fim){ Gp.passo(R); }
      return s.boxAte - R.t; };
    /* mesma parada, mesmo sorteio */
    return { temBox, rapido: parada(90), lento: parada(40), staff: !!C.staff.box, func: Chefe.funcoesAtivas().indexOf('box') >= 0 }; })()`);
  ok(r.staff && r.func && r.temBox, 'a equipe tem um chefe de mecânicos, e o nível dele chega aos carros na corrida');
  ok(r.rapido < r.lento, `uma equipe de boxes boa para mais rápido (${r.rapido.toFixed(2)} s contra ${r.lento.toFixed(2)} s)`);
  const q = J.run(`(() => { const lenta = bx => (2016 >= 2005 ? .05 : .08) * clamp(1 + (60 - bx) / 50, .45, 1.5);
    return { bom: lenta(90), ruim: lenta(40) }; })()`);
  ok(q.bom < .05 && q.ruim > .05 && q.bom < q.ruim / 2, `e erra menos: parada lenta em ${(q.bom * 100).toFixed(1)}% das paradas contra ${(q.ruim * 100).toFixed(1)}% (a equipe média, nível 60, fica em 5%)`);
}

/* 3. patrocinadores: objetivo da etapa, satisfação e renovação */
{
  const J = equipe(9, 2018, 5);
  const r = J.run(`(() => { if(!C.patro.length){ const o = Chefe.ofertasPatrocinio(2); o.forEach(s => { s.anos = 1; Chefe.aceitarPatro(Object.assign(s, { anos: 1 })); }); }
    const sea = C.temporada; const ob = Chefe.objetivoPatro(sea);
    const sat0 = C.patro.map(x => x.sat); const caixa0 = Chefe.saldoLivro();
    const rec = _etapa();
    const feito = sea.results[0] && sea.objPatro ? sea.objPatro.feito : null;
    return { ob, feito, nota: rec.notas.some(t => /objetivo/.test(t)), sat0, sat1: C.patro.map(x => x.sat), patro: C.patro.length }; })()`);
  ok(r.patro > 0 && r.ob && r.ob.bonus > 0 && ['podio', 'top5', 'pontos', 'dois'].indexOf(r.ob.k) >= 0, `o patrocinador pede um objetivo para a etapa (${r.ob && r.ob.k}, bônus de ${r.ob ? (r.ob.bonus / 1e6).toFixed(2) : '?'} mi)`);
  ok(typeof r.feito === 'boolean' && r.nota, 'depois da corrida o objetivo é conferido e aparece no resumo');
  ok(r.sat1.some((v, k) => v !== r.sat0[k]), 'a satisfação dos patrocinadores anda com o resultado');
  const ren = J.run(`(() => { const sea = C.temporada; const [a, b] = [C.patro[0], C.patro[1] || null];
    a.ate = sea.ano; a.sat = 90; const ateA = a.ate; if(b){ b.ate = sea.ano; b.sat = 20; }
    while(sea.round < sea.calendar.length){ _etapa(); a.sat = Math.max(a.sat, 85); if(b) b.sat = Math.min(b.sat, 25); }
    Chefe.fimDeTemporada();
    return { a: a.ate > ateA, aRen: a.renovou === sea.ano, b: b ? b.ate === sea.ano && !b.renovou : true, balanco: (C.balanco.pats || []).some(p => p.renovou) }; })()`);
  ok(ren.a && ren.aRen && ren.balanco, 'a marca satisfeita renova no fim do contrato, e o balanço mostra');
  ok(ren.b, 'a marca insatisfeita não renova');
}

/* 4. a diretoria */
{
  const J = equipe(13, 2010, 6);
  const r = J.run(`(() => { if(!C.dir){ C.dir = { conf: 60, meta: C.temporada.meta || 5, aporte: 0, dono: 'conselho', prio: 'financas' }; }
    const n0 = (C.temporada.conf || []).length; _etapa(); _etapa(); _etapa();
    return { hist: (C.temporada.conf || []).length - n0, prio: C.dir.prio, prioOk: !!Chefe.PRIO[C.dir.prio] }; })()`);
  ok(r.hist === 3 && r.prioOk, `a confiança da diretoria anda corrida a corrida (${r.hist} registros) e ela tem uma prioridade (${r.prio})`);
  const f = J.run(`(() => { const sea = C.temporada; C.dir.prio = 'financas'; C.dir.conf = 50; sea.meta = 4;
    while(sea.round < sea.calendar.length) _etapa();
    const copia = JSON.parse(JSON.stringify(C));
    C.livro = { patrocinio: 1e9 }; C.caixa = 5e8; C.dir.conf = 50; const ricoAval = Chefe.fimDeTemporada().aval;
    C = Chefe.migrar(copia); C.livro = { salarios: -1e9 }; C.caixa = -1e8; C.dir.conf = 50; const pobreAval = Chefe.fimDeTemporada().aval;
    return { rico: ricoAval.delta, pobre: pobreAval.delta }; })()`);
  ok(f.rico > f.pobre + 10, `com a prioridade "contas no azul", o mesmo ano esportivo vale mais com o caixa no azul (${f.rico} contra ${f.pobre})`);
}

console.log(falhas ? falhas + ' falha(s) de ' + n : `administração do chefe: ${n} verificações, tudo certo`);
if(falhas) process.exitCode = 1;
