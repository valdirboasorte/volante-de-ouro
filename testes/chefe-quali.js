/* Classificação de verdade no modo chefe, e a preparação antes da largada.
   — as sessões seguem o regulamento da categoria e da etapa (Q1/Q2/Q3, 2016,
     2005, pré-classificação de 1989, fases na IndyCar e na NASCAR);
   — cada carro disputa as sessões; um pode passar enquanto o outro cai;
   — eliminado não volta na sessão seguinte nem ganha vaga na corrida;
   — salvar e retomar entre sessões; abrir a corrida não refaz o grid;
   — pneu de largada escolhido por carro, confirmado, aplicado e sem corrida duplicada.
   Uso: node testes/chefe-quali.js   Não modifica arquivos nem saves. */
const H = require('./base');
let falhas = 0, n = 0;
const ok = (c, m) => { n++; if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };

function equipe(J, o){
  J.run(require('./chefe-comum'));
  J.run(`(() => { Chefe.novo(${JSON.stringify(Object.assign({ chefe:{ nome:'T', cc:'BR' }, realismo:true, eq:{ nome:'Equipe Teste', cor:'#123456', cc:'GB' } }, o))});
    __inverno(); Chefe.comecarTemporada(); UI.limparFila(); UI.close(); })()`);
}
const idx = (J, sk, ano, pos) => J.run(`(() => { const l = eraOfSeries(${ano}, '${sk}').teams.map((t, i) => [i, Engine.resolveTeam(t, i, ${ano}, '${sk}')]).filter(x => x[1]).sort((a, b) => b[1].str - a[1].str); return l[Math.min(l.length - 1, ${pos})][0]; })()`);

/* 1. F1 2024: Q1, Q2 e Q3 jogados; eliminado não volta; salvar e retomar no meio */
{
  const J = H.carregar({ silencioso:true, seed: 31 });
  equipe(J, { modo:'assumir', sk:'f1', ano:2024, idx: idx(H.carregar({ silencioso:true }), 'f1', 2024, 5) });
  J.run('UIC.irQuali(); UI.limparFila && UI.limparFila(); UI.close();');
  const p = J.run(`(() => { const qs = C.temporada.qs; return { ses: qs.sessoes.map(s => s.k + ':' + (s.passam || '')), n: qs.inscritos.length, nossos: C.temporada.field.filter(f => f.teamId === 'EU' && f.ativo).map(f => f.id) }; })()`);
  ok(p.ses.join(',') === 'q1:15,q2:10,q3:' || p.ses.join(',') === 'q1:16,q2:10,q3:', `F1 2024: Q1, Q2 e Q3 (${p.ses.join(', ')}; ${p.n} inscritos)`);
  J.run(`C.temporada.qs.janelas = { 0:'tarde', 1:'cedo' }; Chefe.rodarSessao();`);
  const q1 = J.run('JSON.parse(JSON.stringify(C.temporada.qs.res[0]))');
  ok(q1.ordem.length === p.n && p.nossos.every(id => q1.ordem.indexOf(id) >= 0), 'os dois carros da equipe disputaram o Q1');
  /* salva, recarrega numa página nova e continua de onde parou */
  J.run('UIC.salvar();');
  const K = H.carregar({ silencioso:true, seed: 77, store: J.store });
  K.run('UIC.continuar(); UI.limparFila(); UI.close();');
  const meio = K.run('(() => { const qs = C.temporada.qs; return { i: qs.i, vivos: qs.vivos.length, elimQ1: qs.res[0].elim }; })()');
  ok(meio.i === 1 && meio.vivos === q1.passam.length, 'retomado depois do Q1: a sessão seguinte é o Q2, com os mesmos classificados');
  K.run('Chefe.rodarSessao(); Chefe.rodarSessao();');
  const fim = K.run(`(() => { const sea = C.temporada, qs = sea.qs; Chefe.gridDaEtapa(sea);
    return { q2: qs.res[1].ordem, q3: qs.res[2].ordem, grid: qs.grid, concl: qs.concluida, elim1: qs.res[0].elim, elim2: qs.res[1].elim }; })()`);
  ok(fim.elim1.every(id => fim.q2.indexOf(id) < 0) && fim.elim2.every(id => fim.q3.indexOf(id) < 0), 'quem caiu no Q1 não aparece no Q2, e quem caiu no Q2 não aparece no Q3');
  ok(fim.q3.length === 10 && fim.q3.every((id, k) => fim.grid[id] === k + 1) && fim.elim2.every(id => fim.grid[id] > 10 && fim.grid[id] <= 15 + 1)
     && fim.elim1.every(id => fim.grid[id] > 15), 'o grid: Q3 nas dez primeiras, depois quem caiu no Q2, depois quem caiu no Q1');
  /* abrir a corrida não refaz o grid */
  const g = K.run(`(() => { const sea = C.temporada; const M1 = Chefe.montar(); const M2 = Chefe.montar();
    const igual = M => Object.keys(sea.qs.grid).every(id => M.grid[id] === sea.qs.grid[id]);
    const r = Chefe.correr({ montagem: M2, finish: M2.running.sort((a, b) => a.grid - b.grid).map((x, k) => Object.assign({}, x, { pos: k + 1, out: false, dnf: null })).concat(M2.out.map(x => Object.assign({}, x, { out:true, pos:null }))) });
    return { igual: igual(M1) && igual(M2), nossos: r.nossos.map(x => [x.nome, x.grid]), grid: sea.qs.grid, ids: sea.field.filter(f => f.teamId === 'EU').map(f => [f.name, f.id]) }; })()`);
  ok(g.igual, 'montar a corrida duas vezes dá o mesmo grid das sessões');
  ok(g.nossos.every(([nome, gr]) => { const id = (g.ids.find(x => x[0] === nome) || [])[1]; return g.grid[id] === gr; }), 'o resultado da corrida guarda o grid que as sessões deram');
}

/* 2. um carro passa e o outro cai: com uma equipe do meio, em algumas etapas */
{
  let visto = false, tentativas = 0;
  for(const seed of [3, 5, 8, 13, 21, 34, 55, 89]){
    if(visto) break;
    const J = H.carregar({ silencioso:true, seed });
    equipe(J, { modo:'assumir', sk:'f1', ano:2019, idx: idx(J, 'f1', 2019, 6) });
    for(let rd = 0; rd < 6 && !visto; rd++){
      tentativas++;
      const r = J.run(`(() => { const sea = C.temporada; Chefe.qualiDaEtapa(sea); Chefe.rodarSessao();
        const qs = sea.qs, nossos = sea.field.filter(f => f.teamId === 'EU' && f.ativo).map(f => f.id);
        const passou = nossos.filter(id => qs.res[0].passam.indexOf(id) >= 0), caiu = nossos.filter(id => qs.res[0].elim.indexOf(id) >= 0);
        Chefe.gridDaEtapa(sea);
        const res = { passou, caiu, grid: qs.grid };
        Chefe.correr(); return res; })()`);
      if(r.passou.length === 1 && r.caiu.length === 1){
        visto = true;
        ok(r.grid[r.caiu[0]] > 15 && r.grid[r.passou[0]] <= 15, `um carro passa no Q1 e o outro cai (etapa ${rd + 1}): ${r.grid[r.passou[0]]}º e ${r.grid[r.caiu[0]]}º no grid`);
      }
    }
  }
  if(!visto) ok(false, `em ${tentativas} etapas nenhum caso de um carro passar e o outro cair`);
}

/* 3. pré-classificação de 1989: equipe nova fora da cota */
{
  const J = H.carregar({ silencioso:true, seed: 17 });
  equipe(J, { modo:'criar', sk:'f1', ano:1989, fin:'investidor' });
  const r = J.run(`(() => { const sea = C.temporada; Chefe.qualiDaEtapa(sea); const qs = sea.qs;
    const nossos = sea.field.filter(f => f.teamId === 'EU' && f.ativo).map(f => f.id);
    const isentosNossos = nossos.filter(id => qs.isentos.indexOf(id) >= 0).length;
    Chefe.rodarSessao(); const pre = qs.res[0];
    Chefe.gridDaEtapa(sea);
    const M = Chefe.montar();
    return { ses: qs.sessoes.map(s => s.k), n: qs.inscritos.length, part: pre.ordem.length, passam: pre.passam.length, elim: pre.elim,
      fora: qs.fora, isentosNossos, nossos, largam: Object.keys(qs.grid).length,
      noGrid: pre.elim.some(id => qs.grid[id] != null), naCorrida: pre.elim.some(id => M.corre.some(f => f.id === id)), foraNossos: M.foraNossos.map(x => x.k) }; })()`);
  ok(r.ses[0] === 'preq' && r.n > 30, `1989: ${r.n} inscritos, a etapa começa pela pré-classificação`);
  ok(r.isentosNossos === 0 && r.part === r.n - 26 && r.passam === 4, `a equipe nova não é isenta: ${r.part} carros disputam 4 vagas`);
  ok(r.elim.every(id => r.fora[id] === 'DNPQ') && !r.noGrid && !r.naCorrida, 'quem cai na pré-classificação fica DNPQ, fora do grid e fora da corrida');
  ok(r.largam === 26, 'largam 26');
  ok(r.nossos.every(id => r.elim.indexOf(id) < 0) || r.foraNossos.indexOf('DNPQ') >= 0, 'um carro seu que cai aparece como DNPQ no resultado');
}

/* 4. regulamento da categoria e da etapa */
{
  const J = H.carregar({ silencioso:true });
  const plano = (sk, ano, rd, cat) => J.run(`(() => { const sea = { ano:${ano}, isTop:${!cat}, cat:${JSON.stringify(cat || '')}, sk:'${sk}', field:new Array(22).fill(0), teams:[],
      calendar: calendarFor(${ano}, '${sk}').map(id => Object.assign({ id }, TRACKS[id] || {})) };
    const reg = Engine.regulamento(sea, ${rd}, '${sk}'); return Classif.plano(reg, 22).map(s => s.k).join(','); })()`);
  ok(plano('f1', 2016, 0) === 'q1,q2,q3' && J.run(`Classif.plano({ fmt: Engine.formatoQuali(2016, 'f1', 0, { isTop:true }), preQuali:false }, 22).find(s => s.k === 'q2').passam`) === 8,
     '2016, etapa 1: eliminação progressiva (8 no Q3)');
  ok(J.run(`Classif.plano({ fmt: Engine.formatoQuali(2016, 'f1', 5, { isTop:true }), preQuali:false }, 22).find(s => s.k === 'q2').passam`) === 10, '2016, etapa 6: Q1/Q2/Q3 normal (10 no Q3)');
  ok(plano('f1', 2005, 1) === 'v1,v2' && plano('f1', 2005, 8) === 'u', '2005: duas voltas somadas no começo do ano, volta única depois');
  ok(plano('f1', 1990, 0) === 's1,s2', 'até 1995: duas sessões, vale o melhor tempo');
  ok(plano('indy', 2015, 0) === 'fa,fb' && plano('nascar', 2020, 0) === 'fa,fb', 'IndyCar e NASCAR modernas: fase inicial e fase final');
  ok(plano('f1', 2010, 0, 'GP2') === 'u', 'categoria de acesso: sessão única');
}

/* 5. preparação e pneus no chefe: cada carro o seu; confirmado vale; a largada não duplica a corrida */
{
  const J = H.carregar({ silencioso:true, seed: 44 });
  equipe(J, { modo:'assumir', sk:'f1', ano:2023, idx: idx(J, 'f1', 2023, 3) });
  const r = J.run(`(() => { const sea = C.temporada;
    UIC.irQuali(); UIC.simularQuali(); const grid = JSON.stringify(sea.qs.grid);
    UIC.prepCorrida();
    const d = Gp.dadosLargada(sea, UIC.entradaDaEtapa());
    const [a, b] = d.carros; const lisos = d.carros[0].opcoes.map(o => o.c).filter(c => !Gp.COMP[c].chuva);
    const ca = lisos.find(c => c !== a.sugerido) || lisos[0], cb = lisos.find(c => c !== ca) || lisos[0];
    UIC.escolherPneu(a.id, ca); UIC.escolherPneu(b.id, cb);
    let capturado = null; const criar = Gp.criar; Gp.criar = ent => { const R = criar(ent); capturado = R.carros.filter(s => s.c.ctrl).map(s => [s.c.id, s.pneu.c]); return R; };
    const antes = sea.results.length;
    UIC.confirmarLargada();
    Gp.criar = criar;
    const depois = sea.results.length;
    UIC.largar(); UIC.largar();
    return { ca, cb, a: a.id, b: b.id, capturado, antes, depois, final: sea.results.length, gridIgual: grid === JSON.stringify((sea.qsHist && sea.qs.grid) || {}) || true,
             confirmado: sea.pneusLargada.confirmado }; })()`);
  const mapa = Object.fromEntries(r.capturado || []);
  ok(mapa[r.a] === r.ca && mapa[r.b] === r.cb && r.ca !== r.cb, `cada carro largou com o pneu escolhido (${r.ca} e ${r.cb})`);
  ok(r.depois === r.antes + 1 && r.final === r.depois, 'a confirmação corre a etapa uma vez; repetir a largada não corre de novo');
}
{
  /* o pneu fora do regulamento não vale: Fórmula E tem um composto só */
  const J = H.carregar({ silencioso:true, seed: 45 });
  equipe(J, { modo:'assumir', sk:'fe', ano:2020, idx: 0 });
  const r = J.run(`(() => { const sea = C.temporada; UIC.irQuali(); UIC.simularQuali();
    const d = Gp.dadosLargada(sea, UIC.entradaDaEtapa()); const a = d.carros[0];
    sea.pneusLargada = { rd: sea.round, carros: { [a.id]: 'S' }, confirmado: false };
    const R = Gp.criar(UIC.entradaDaEtapa()); return { unico: d.unico, pneu: R.carros.find(s => s.c.id === a.id).pneu.c, ops: Gp.opcoesLargada(R) }; })()`);
  ok(r.unico && r.pneu !== 'S' && r.ops.indexOf(r.pneu) >= 0, `Fórmula E: um pneu só (${r.ops.join(',')}); um composto fora do regulamento é ignorado`);
}

/* 6. sair na preparação e continuar não reutiliza a temporada anterior em memória */
{
  const J = H.carregar({ silencioso:true, seed: 44 });
  equipe(J, { modo:'assumir', sk:'f1', ano:2024, idx: 3 });
  const r = J.run(`(() => {
    UIC.irQuali(); UIC.simularQuali(); UIC.prepCorrida();
    const anterior = UIC.montagem();
    UIC.sair(); UIC.continuar();
    const sea = C.temporada;
    UIC.prepCorrida();
    const atual = UIC.montagem();
    const abrir = AoVivo.abrir;
    AoVivo.abrir = (ent, op, fim) => { const R = Gp.criar(ent); Gp.terminar(R); fim(Gp.resultado(R)); };
    try { UIC.confirmarLargada(); } finally { AoVivo.abrir = abrir; }
    const rodada = sea.round, resultados = sea.results.length, caixa = C.caixa;
    UIC.confirmarLargada(); UIC.largar();
    const semRepetir = sea.round === rodada && sea.results.length === resultados && C.caixa === caixa;
    const salvo = JSON.parse(Store.get('vdo_chefe'));
    /* Também protege troca por outro objeto de save com ano, rodada e equipe iguais. */
    UIC.montagem();
    const outro = JSON.parse(JSON.stringify(C)); C = outro;
    const mesmaChave = UIC.montagem().sea === outro.temporada;
    return { renovada: anterior !== atual && atual.sea === sea,
      rodada, resultados, semRepetir,
      salvo: salvo.temporada.round === rodada && salvo.temporada.results.length === resultados && salvo.caixa === caixa,
      mesmaChave };
  })()`);
  ok(r.renovada, 'sair da preparação e continuar monta a corrida com a temporada carregada');
  ok(r.rodada === 1 && r.resultados === 1, 'a corrida ao vivo avança a rodada e registra o resultado na temporada atual');
  ok(r.semRepetir && r.salvo, 'repetir a confirmação não repete despesas nem resultados, e o save retém a corrida');
  ok(r.mesmaChave, 'outro save com a mesma chave de etapa não reutiliza a temporada antiga');
}

console.log(falhas ? falhas + ' falha(s) de ' + n : `classificação do chefe e preparação: ${n} verificações, tudo certo`);
if(falhas) process.exitCode = 1;
