/* Manager 2.0, fase 3: treinos livres do chefe e a versão do save.
   — um save de antes (versão 1, sem treinos) abre, migra para a versão 2, corre
     uma etapa e salva já na versão nova;
   — o acerto de classificação rende mais no sábado e o de corrida mais no domingo;
   — o programa de corridas longas dá mais dados de pneu; ceder o carro no TL1 tira dados;
   — os dados chegam à corrida: faixas de previsão mais estreitas e um plano de
     paradas que erra menos a vida do pneu;
   — o acerto de corrida gasta menos pneu na pista.
   Uso: node testes/treinos-chefe.js   Não modifica arquivos nem saves. */
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

/* 1. save antigo */
{
  const J = equipe(5, 2016, 4);
  J.run(`(() => { const c = JSON.parse(JSON.stringify(C)); c.v = 1; delete c.decisao.treino; delete c.decisao.acerto;
    delete c.staff.box; (c.patro || []).forEach(x => delete x.sat); if(c.dir) delete c.dir.prio; Store.set('vdo_chefe', JSON.stringify(c)); })()`);
  const K = H.carregar({ silencioso: true, seed: 9, store: J.store });
  K.run('UIC.continuar(); UI.limparFila && UI.limparFila(); UI.close();');
  const r = K.run(`(() => { const antes = { v: C.v, V: Chefe.V, treino: C.decisao.treino, acerto: C.decisao.acerto, box: !!(C.staff.box && C.staff.box.funcao === 'box'),
      sat: (C.patro || []).every(x => x.sat === 60), prio: !C.dir || !!Chefe.PRIO[C.dir.prio] };
    const sea = C.temporada, rd = sea.round; UIC.preCorrida(); UI.close(); Chefe.gridDaEtapa(sea);
    const M = Chefe.montar(); const ent = Gp.entrada(sea, M, Chefe.sk(), sea.ano, f => f.teamId === 'EU', { gestao: true });
    const R = Gp.criar(ent); Gp.terminar(R); const res = Gp.resultado(R);
    Chefe.correr({ montagem: M, finish: Gp.chegada(M, res), flId: res.flId, sc: res.sc }); UIC.salvar();
    const salvo = JSON.parse(Store.get('vdo_chefe'));
    return { antes, rodou: sea.round === rd + 1, salvoV: salvo.v, salvoTreino: !!(salvo.decisao && salvo.decisao.treino) }; })()`);
  ok(r.antes.v === r.antes.V && r.antes.treino && r.antes.treino[0] === 'equilibrio' && r.antes.acerto[1] === 'equilibrio', `um save da versão 1 abre e migra para a versão ${r.antes.V} com o treino de equilíbrio`);
  ok(r.antes.box && r.antes.sat && r.antes.prio, 'e ganha chefe de mecânicos, satisfação neutra dos patrocinadores e a prioridade da diretoria');
  ok(r.rodou && r.salvoV === r.antes.V && r.salvoTreino, 'o save migrado corre uma etapa e salva na versão nova');
}

/* 2. sábado e domingo: o acerto e o programa pesam onde devem */
{
  const J = equipe(7, 2024, 3);
  const r = J.run(`(() => { const sea = C.temporada; Chefe.qualiDaEtapa(sea);
    const g = R.gauss; R.gauss = () => 0;
    const ctx = Chefe.ctxQuali(sea), f = sea.field.find(x => x.teamId === 'EU' && x.ativo && x.carro === 0);
    const ses = sea.qs.sessoes[0];
    const q = (t, a) => { C.decisao.treino[0] = t; C.decisao.acerto[0] = a; return Chefe.valorQuali(sea, ctx)(f.id, Object.assign({}, ses, { semJanela: true })).v; };
    const vq = q('quali', 'quali'), vc = q('corrida', 'corrida'), ve = q('equilibrio', 'equilibrio');
    const d = t => { C.decisao.treino[0] = t; return Chefe.dadosTreino(f); };
    const dq = d('quali'), de = d('equilibrio'), dc = d('corrida');
    C.decisao.tl1 = { carro: 0, pid: 'x' }; const dtl1 = Chefe.dadosTreino(f); C.decisao.tl1 = null;
    C.decisao.treino[0] = 'corrida'; C.decisao.acerto[0] = 'corrida'; const ec = Chefe.efeitoTreino(f);
    C.decisao.treino[0] = 'quali'; C.decisao.acerto[0] = 'quali'; const eq = Chefe.efeitoTreino(f);
    R.gauss = g; return { vq, vc, ve, dq, de, dc, dtl1, ec, eq }; })()`);
  ok(r.vq > r.ve && r.ve > r.vc, `classificação: o carro acertado para o sábado é o mais rápido (${r.vq.toFixed(2)} > ${r.ve.toFixed(2)} > ${r.vc.toFixed(2)})`);
  ok(r.ec.r > r.eq.r && r.ec.gasto < 1 && r.eq.gasto > 1, 'corrida: o acerto de corrida tem mais ritmo de domingo e gasta menos pneu; o de classificação, o contrário');
  ok(r.dc > r.de && r.de > r.dq, `dados de pneu: corridas longas ${Math.round(r.dc * 100)}% > equilíbrio ${Math.round(r.de * 100)}% > simulação de classificação ${Math.round(r.dq * 100)}%`);
  ok(r.dtl1 < r.dc, 'ceder o carro no primeiro treino tira dados do titular');
}

/* 3. os dados na corrida: faixas e plano */
{
  const J = equipe(11, 2024, 3);
  const r = J.run(`(() => { const sea = C.temporada; Chefe.gridDaEtapa(sea); const M = Chefe.montar();
    const ent = Gp.entrada(sea, M, Chefe.sk(), sea.ano, f => f.teamId === 'EU', { gestao: true });
    const meus = ent.carros.filter(c => c.ctrl);
    const temDados = meus.every(c => c.dados != null && c.gastoMult != null);
    const faixa = dados => { const e = JSON.parse(JSON.stringify(ent)); e.carros.forEach(c => { if(c.ctrl){ c.dados = dados; } });
      const R = Gp.criar(e); while(R.lider == null || R.lider.voltas < 10){ if(R.pergunta) Gp.responder(R, R.pergunta.padrao); Gp.passo(R); }
      const s = R.carros.find(x => x.c.ctrl && x.estado === 0); const p = Gp.previsoes(R, s);
      return { larg: p.pneu.max - p.pneu.min, box: p.box.max - p.box.min, erro: Math.abs(s.erroPlano), u: p.u }; };
    const pouco = faixa(.05), muito = faixa(.95);
    /* o pneu de verdade com o acerto de corrida e o de classificação */
    /* sem abandonos nem safety car: um carro quebrado na frente muda o desgaste das 8 voltas */
    const gasto = mult => { const e = JSON.parse(JSON.stringify(ent)); e.wet = false; e.carros.forEach(c => { c.risco = null; c.erro = false; c.fora = null; c.fracFora = null; if(c.ctrl) c.gastoMult = mult; });
      const R = Gp.criar(e); R.clima.fases = [[0, 0]]; R.w = 0; R.regras.scProb = 0; R.regras.vscProb = 0; const s = R.carros.find(x => x.c.ctrl); s.plano = []; s.ia = null; s.auto = false;
      /* o mesmo composto nas duas corridas (com menos desgaste o plano largaria de macio) */
      s.pneu = { c: 'M', gasto: 0, voltas: 0 }; s.usados = new Set(['M']);
      /* o carro fica na pista as 8 voltas: o rádio é respondido com "seguir" e nenhuma parada é marcada */
      while(s.voltas < 8 && !R.fim){ if(R.pergunta) Gp.responder(R, R.pergunta.opcoes.some(o => o.k === 'seguir') ? 'seguir' : R.pergunta.padrao); s.parar = null; s.boxPneu = null; Gp.passo(R); }
      return s.paradas ? null : s.pneu.gasto; };
    return { temDados, pouco, muito, gc: gasto(.94), gq: gasto(1.06) }; })()`);
  ok(r.temDados, 'os dados de treino e o desgaste do acerto chegam aos seus carros na corrida');
  ok(r.muito.larg < r.pouco.larg && r.muito.u < r.pouco.u, `com muitos dados, a faixa da vida do pneu é mais estreita (${r.muito.larg} voltas contra ${r.pouco.larg})`);
  ok(r.muito.erro <= .05 && r.pouco.erro <= .16 && r.muito.erro < r.pouco.erro + 1e-9, `e o plano da equipe erra menos a vida do pneu (erro de ${(r.muito.erro * 100).toFixed(1)}% contra ${(r.pouco.erro * 100).toFixed(1)}%)`);
  ok(r.gc != null && r.gq != null && r.gc < r.gq * .92, `na pista, o acerto de corrida gasta menos pneu (${Math.round(r.gc * 100)}% contra ${Math.round(r.gq * 100)}% em 8 voltas)`);
}

console.log(falhas ? falhas + ' falha(s) de ' + n : `treinos do chefe e versão do save: ${n} verificações, tudo certo`);
if(falhas) process.exitCode = 1;
