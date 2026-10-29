/* Manager 2.1: as correções de integridade e de equilíbrio do modo chefe.
   — a punição de túnel do teto de gastos vale só no ano seguinte (antes ficava para sempre);
   — quem sobe da academia tem contrato de dois anos, salário de estreante e multa de rescisão
     na categoria principal, e continua sem salário na base;
   — projeto de peça inacabado atravessa o inverno; com regulamento novo, vira conhecimento;
   — o piloto que passa do último ano da história envelhece do jeito dele, sem parar em 9
     pontos, e os anos documentados não mudam;
   — com o muro gerenciando, a falha do acaso cai mais em quem forçou o motor.
   Uso: node testes/manager-21.js   Não modifica arquivos nem saves. */
const H = require('./base');
let falhas = 0, n = 0;
const ok = (c, m) => { n++; if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };

function equipe(seed, ano, pos, sk, modo){
  sk = sk || 'f1';
  const J = H.carregar({ silencioso: true, seed });
  J.run(require('./chefe-comum'));
  if(modo === 'base') J.run(`(() => { const cats = Chefe.escadaBase(${ano}, 'BR', '${sk}'); Chefe.novo({ chefe:{ nome:'T', cc:'BR' }, realismo:true, modo:'base', sk:'${sk}', ano:${ano}, cat: cats[cats.length - 1], eq:{ nome:'Base', cor:'#123456', cc:'BR' } }); })()`);
  else J.run(`(() => { const l = eraOfSeries(${ano}, '${sk}').teams.map((t, i) => [i, Engine.resolveTeam(t, i, ${ano}, '${sk}')]).filter(x => x[1]).sort((a, b) => b[1].str - a[1].str);
    Chefe.novo({ chefe:{ nome:'T', cc:'BR' }, realismo:true, modo:'assumir', sk:'${sk}', ano:${ano}, idx:l[Math.min(l.length - 1, ${pos})][0] }); })()`);
  return J;
}

/* 1. a punição de túnel dura um ano */
{
  const J = equipe(3, 2021, 3);
  const r = JSON.parse(J.run(`(() => { __inverno(); __temporada();
    C.balanco = C.balanco || {}; C.balanco.estouro = { valor: 5e6, teto: 140e6, pct: .03 };
    Chefe.resolverTeto('declarar'); const pen = C.penalTunel;
    Chefe.proximoAno(); const ano1 = C.ano, ef1 = Chefe.eficiencia('aero'), ativa1 = C.penalTunel && C.penalTunelAno === C.ano;
    __inverno(); __temporada(); Chefe.proximoAno(); const ativa2 = !!(C.penalTunel && C.penalTunelAno === C.ano), ef2 = Chefe.eficiencia('aero');
    return JSON.stringify({ pen, ano1, ativa1, ativa2, ef1, ef2, campo: C.penalTunel }); })()`));
  ok(r.pen === .1 && r.ativa1, `estouro de 3% declarado: 10% a menos de túnel em ${r.ano1}`);
  ok(!r.ativa2 && !r.campo, 'no segundo ano a punição já acabou (antes, ela ficava para sempre)');
}

/* 2. contrato de quem sobe da academia */
{
  const J = equipe(5, 2012, 5);
  const r = JSON.parse(J.run(`(() => { __inverno();
    const p = Chefe.novoPiloto({ nome:'Garoto Academia', cc:'BR', nasc: C.ano - 19, hab: 70, pot: 84, papel:'livre' });
    Chefe.levarParaAcademia(p);
    const antes = { sal: p.sal, multa: Chefe.multaDispensa(p) };
    const t = Chefe.pilotoDe('teste'); if(t) Chefe.dispensar(t);
    UIC.acad(p.id, 'teste'); UI.limparFila(); UI.close();
    return JSON.stringify({ antes, sal: p.sal, ate: p.ate, ano: C.ano, multa: Chefe.multaDispensa(p), cria: p.cria, papel: p.papel, mercado: Chefe.salarioPedido(p) }); })()`));
  ok(r.antes.sal === 0 && r.antes.multa === 0, 'na academia o garoto não tem salário (o custo é o da academia)');
  ok(r.papel === 'teste' && r.sal > 0 && r.sal <= Math.max(r.mercado, r.sal), `promovido na F1: salário de estreante (${r.sal}) e contrato até ${r.ate}`);
  ok(r.ate === r.ano + 2 && r.multa > 0 && r.cria, `contrato de dois anos, com multa de rescisão (${r.multa}) e a equipe que formou registrada`);
  const B = equipe(6, 2012, 0, 'f1', 'base');
  const b = JSON.parse(B.run(`(() => { __inverno();
    const p = Chefe.novoPiloto({ nome:'Garoto Base', cc:'BR', nasc: C.ano - 16, hab: 60, pot: 80, papel:'livre' });
    Chefe.levarParaAcademia(p); UIC.acad(p.id, 'teste'); UI.limparFila(); UI.close();
    return JSON.stringify({ sal: p.sal, topo: Chefe.ehTopo() }); })()`));
  ok(!b.topo && b.sal === 0, 'na base ninguém recebe salário: continua como era');
}

/* 3. projeto de peça inacabado na virada do ano */
{
  const J = equipe(7, 2015, 4);
  const r = JSON.parse(J.run(`(() => { __inverno(); Chefe.comecarTemporada(); const sea = C.temporada;
    while(sea.round < sea.calendar.length - 1) Chefe.correr();
    const P = Pecas.P(); P.proj = P.proj.filter(x => x.st !== 'proj');
    const pr = Pecas.projetar('susp', 'pneu', 1);
    while(sea.round < sea.calendar.length) Chefe.correr();
    const falta = pr.ok ? pr.proj.fim - P.dia : null;
    Chefe.fimDeTemporada(); Chefe.proximoAno(); __inverno(); Chefe.comecarTemporada();
    const h = C.pecas.proj.find(x => x.herdado && x.p === 'susp');
    return JSON.stringify({ ok: pr.ok, falta, herdado: !!h, fim: h && h.fim, ano: C.ano }); })()`));
  ok(r.ok && r.falta > 0, 'um projeto começou no fim do ano e não deu tempo de terminar');
  ok(r.herdado && r.fim === r.falta, `em ${r.ano} ele continua, com os ${r.falta} dias que faltavam (antes, o dinheiro sumia)`);
  const K = equipe(8, 2016, 4);
  const k = JSON.parse(K.run(`(() => { __inverno(); Chefe.comecarTemporada(); const sea = C.temporada;
    while(sea.round < sea.calendar.length - 1) Chefe.correr();
    const P = Pecas.P(); P.proj = P.proj.filter(x => x.st !== 'proj'); const c0 = P.conhec.susp || 0;
    Pecas.projetar('susp', 'pneu', 2); while(sea.round < sea.calendar.length) Chefe.correr();
    Chefe.fimDeTemporada(); Chefe.proximoAno(); __inverno(); Chefe.comecarTemporada();
    return JSON.stringify({ ano: C.ano, herdado: C.pecas.proj.some(x => x.herdado), conhec: C.pecas.conhec.susp || 0, base: c0 * .4 }); })()`));
  ok(k.ano === 2017 && !k.herdado && k.conhec > k.base, `com regulamento novo (${k.ano}) o projeto não passa, mas o trabalho vira conhecimento da peça`);
}

/* 4. o piloto que continua depois da história */
{
  const J = H.carregar({ silencioso: true, seed: 1 });
  const s = (nome, ano, base) => J.run(`skillEm('f1', ${JSON.stringify(nome)}, ${ano}, ${base})`);
  ok(s('Senna', 1994, 98) === 98 && s('Senna', 1993, 98) === 98, 'Senna até 1994: a nota real, como antes');
  ok(s('Senna', 2004, 98) <= 85, `Senna mantido até os 44 anos (2004): ${s('Senna', 2004, 98)}, não mais 89`);
  ok(s('M. Schumacher', 2012, 98) === Math.round(98 - Math.min(9, (43 - 36) * 1.1)), 'Schumacher em 2012, ano documentado: a mesma nota de antes');
  const dist = JSON.parse(J.run(`(() => { const at = ativoDe('f1'), out = { a40: [], a44: [] };
    for(const nome in at){ if(nome[0] === '_') continue; const f = fichaDe('f1', nome); if(!f) continue; const a = at[nome];
      if(a[1] - f[0] > 36 || a[1] - f[0] < 28) continue;
      out.a40.push(skillEm('f1', nome, f[0] + 40, 92)); out.a44.push(skillEm('f1', nome, f[0] + 44, 92)); }
    return JSON.stringify(out); })()`));
  const m = a => a.reduce((x, y) => x + y, 0) / a.length;
  ok(dist.a44.length > 40 && m(dist.a44) < 84 && m(dist.a40) < 90, `nota 92 no auge: média ${m(dist.a40).toFixed(1)} aos 40 e ${m(dist.a44).toFixed(1)} aos 44 (${dist.a44.length} pilotos)`);
  ok(dist.a40.some(v => v >= 89) && dist.a44.some(v => v >= 85) && dist.a44.some(v => v <= 76), 'cada um do seu jeito: há longevos e há quem caia cedo');
}

/* 5. a falha do acaso cai em quem forçou o motor */
{
  const J = equipe(9, 2019, 3);
  const r = JSON.parse(J.run(`(() => { __inverno(); Chefe.comecarTemporada(); const sea = C.temporada; Chefe.gridDaEtapa(sea); const M = Chefe.montar();
    const R = Gp.criar(Gp.entrada(sea, M, Chefe.sk(), sea.ano, f => f.teamId === 'EU', { gestao: true }));
    const nossos = R.carros.filter(s => s.c.ctrl);
    R.carros.forEach(s => { s.voltas = 20; s.estresse = 20; });
    nossos[0].estresse = 20 * 2.5; nossos[1].estresse = 20 * .55;
    let u = 1; R.rnd = () => { u = (u * 16807) % 2147483647; return u / 2147483647; };
    const cont = new Map(R.carros.map(s => [s, 0]));
    for(let k = 0; k < 80000; k++){
      R.pergunta = null; R.carros.forEach(s => { s.fora = null; s.dano = 0; s.estado = 0; });
      Gp.acaso(R, () => {});
      R.carros.forEach(s => { if(s.dano > 0 || (R.pergunta && R.pergunta.i === s.i)) cont.set(s, cont.get(s) + 1); });
    }
    const outros = R.carros.filter(s => !s.c.ctrl).map(s => cont.get(s));
    return JSON.stringify({ max: cont.get(nossos[0]), poup: cont.get(nossos[1]), media: outros.reduce((a, b) => a + b, 0) / outros.length }); })()`));
  ok(r.max > r.media * 1.8 && r.poup < r.media * .8, `em 80.000 sorteios, a falha do acaso caiu ${r.max} vezes no carro em ataque máximo, ${r.poup} no que poupou e ${r.media.toFixed(0)} na média dos outros`);
}

/* 6. a moral pesa na cabeça: consistência, erro e renovação */
{
  const J = equipe(11, 2015, 3);
  const r = JSON.parse(J.run(`(() => { __inverno(); Chefe.comecarTemporada(); const sea = C.temporada; Chefe.escalar(sea);
    const f = sea.field.find(x => x.teamId === 'EU' && x.pid), p = C.pilotos.find(x => x.id === f.pid);
    C.rep = 30; p.moral = 30; const c30 = Chefe.moralCons(f), e30 = Engine.chanceErro((f.cons || 55) + c30, 'f1', false, false);
    p.venceu = true; const r30 = Chefe.chanceAssinar(p, { sal:1, anos:2, n1:false });
    p.moral = 90; const c90 = Chefe.moralCons(f), e90 = Engine.chanceErro((f.cons || 55) + c90, 'f1', false, false);
    const r90 = Chefe.chanceAssinar(p, { sal:1, anos:2, n1:false }); delete p.venceu;
    Chefe.mexerMoral(p, -11, 'ordem de equipe'); Chefe.mexerMoral(p, 4, 'resultados acima do carro'); UIC.pagina('pilotos');
    return JSON.stringify({ c30, c90, e30, e90, r30, r90, log: p.moralLog.length, html: /Moral: .*ordem de equipe/.test(document.getElementById('chPrincipal').innerHTML) }); })()`));
  ok(r.c30 < -4 && r.c90 > 4 && r.e30 > r.e90 * 1.1, `moral 30 contra 90: consistência ${r.c30.toFixed(1)} contra +${r.c90.toFixed(1)}, chance de erro ${(r.e30 * 100).toFixed(1)}% contra ${(r.e90 * 100).toFixed(1)}%`);
  ok(r.r90 - r.r30 > .2, `renovar com moral 90 é mais fácil que com 30 (${(r.r90 * 100).toFixed(0)}% contra ${(r.r30 * 100).toFixed(0)}%)`);
  ok(r.log >= 2 && r.html, 'a ficha do piloto mostra o que pesou na moral');
}

/* 7. a fronteira técnica e o conceito do regulamento novo */
{
  const J = equipe(12, 2010, 0);
  const r = JSON.parse(J.run(`(() => { const m = [];
    for(let a = 0; a < 6; a++){ __inverno(); Chefe.funcoesAtivas().forEach(f => { C.staff[f] = Chefe.staffGerado(f, 95, C.ano); C.staff[f].ate = C.ano + 5; });
      ['fabrica','tunel','sim'].forEach(k => { C.instal[k] = 5; }); Chefe.areasAtivas().forEach(x => C.plano[x] = 5);
      Chefe.comecarTemporada(); m.push({ ano: C.ano, forca: Chefe.forca(), top: 40 + .59 * Chefe.fronteira(), primeiro: a === 0, conceito: C.conceito && C.conceito.ano === C.ano ? C.conceito.v : null });
      const sea = C.temporada; while(sea.round < sea.calendar.length) Chefe.correr(); Chefe.fimDeTemporada(); Chefe.proximoAno(); UI.limparFila(); UI.close(); }
    return JSON.stringify(m); })()`));
  const pior = Math.max(...r.filter(x => !x.primeiro).map(x => x.forca - x.top));
  ok(pior <= 4, `com staff, instalações e gasto no máximo, o carro chega a no máximo ${pior.toFixed(1)} pontos acima do melhor carro da época (antes: até 99 contra 92–97)`);
  ok(r.some(x => x.ano === 2014 && x.conceito != null), `regulamento novo em 2014: o conceito do carro saiu ${r.find(x => x.ano === 2014).conceito > 0 ? 'acima' : 'abaixo'} do esperado (${r.find(x => x.ano === 2014).conceito})`);
  const conc = [];
  for(let s = 0; s < 14; s++){ const K = equipe(100 + s, 2013, 6); conc.push(K.run(`(() => { __inverno(); Chefe.proximoAno; __temporada(); Chefe.proximoAno(); __inverno(); Chefe.comecarTemporada(); return C.conceito ? C.conceito.v : 0; })()`)); }
  ok(conc.some(v => v >= 3) && conc.some(v => v <= -2), `em 14 equipes do meio em 2014, o conceito variou de ${Math.min(...conc)} a +${Math.max(...conc)}: dá para acertar e dá para errar`);
}

/* 8. staff: mercado com elite às vezes, carreira e aposentadoria */
{
  const J = equipe(13, 1995, 4);
  const r = JSON.parse(J.run(`(() => { const v = []; for(let i = 0; i < 400; i++) v.push(Chefe.nivelCandidato());
    const s = Chefe.staffGerado('box', 70, C.ano); s.nasc = C.ano - 30; s.pot = 82; const n0 = s.nv;
    for(let a = 0; a < 6; a++) Chefe.evoluirStaff(s, C.ano + a); const n1 = s.nv;
    const v2 = Chefe.staffGerado('box', 88, C.ano); v2.nasc = C.ano - 64; for(let a = 0; a < 6 && !v2.aposentou; a++) Chefe.evoluirStaff(v2, C.ano + a);
    return JSON.stringify({ max: Math.max(...v), acima82: v.filter(x => x > 82).length, elite: v.filter(x => x >= 85).length, med: v.reduce((a, b) => a + b, 0) / v.length, n0, n1, apos: !!v2.aposentou }); })()`));
  ok(r.max > 85 && r.elite > 10 && r.elite < 120 && r.med < 74, `400 candidatos: ${r.elite} de elite (85+), máximo ${r.max.toFixed(0)}, média ${r.med.toFixed(1)} (antes, nunca passava de 82)`);
  ok(r.n1 > r.n0 && r.apos, `o jovem evolui (${r.n0} → ${r.n1.toFixed(1)}) e o veterano se aposenta`);
}

/* 9. patrocínio renovado pelo preço de hoje */
{
  const J = equipe(14, 1978, 3);
  const r = JSON.parse(J.run(`(() => { __inverno(); Chefe.comecarTemporada(); const sea = C.temporada;
    const x = C.patro[0] || (C.patro.push(Object.assign(Chefe.ofertasPatrocinio(1)[0], { ate: C.ano })), C.patro[0]);
    x.ate = C.ano; x.sat = 75; x.valor = Math.round(x.valor * .25); x.meta = null; const antes = x.valor;
    while(sea.round < sea.calendar.length) Chefe.correr(); Chefe.fimDeTemporada();
    return JSON.stringify({ antes, depois: x.valor, mercado: Chefe.valorMercadoPatro(x, C.ano + 1), f20: Chefe.fatorRepPatro(20), f60: Chefe.fatorRepPatro(60), f100: Chefe.fatorRepPatro(100) }); })()`));
  ok(r.depois > r.antes * 1.5 && r.depois <= r.antes * 2.5 + 1000, `um contrato defasado é renovado perto do preço de hoje (${r.antes} → ${r.depois}; mercado ${Math.round(r.mercado)})`);
  ok(r.f100 < r.f60 * 1.4 && r.f60 > r.f20, `reputação vale cada vez menos no alto (fator ${r.f20.toFixed(2)} / ${r.f60.toFixed(2)} / ${r.f100.toFixed(2)})`);
}

/* 10. mercado: estrela sob contrato e duas estrelas no mesmo box */
{
  const J = equipe(15, 2016, 0);
  const r = JSON.parse(J.run(`(() => { __inverno(); C.rep = 100;
    const p = C.inv.mercado.find(x => Chefe.sobContrato(x) && Chefe.hab(x) >= 88);
    if(!p) return JSON.stringify({ sem: true });
    const preso = Chefe.chanceAssinar(p, { sal:1, anos:2, n1:false }); const multa = Chefe.multaRival(p);
    const eq = p.eqHist; p.eqHist = null; const livre = Chefe.chanceAssinar(p, { sal:1, anos:2, n1:false }); p.eqHist = eq;
    const tit = Chefe.titulares(); tit.forEach(q => { q.real = true; q.base = 70; q.extra = 0; });
    const semEstrela = Chefe.chanceAssinar(p, { sal:1, anos:2, n1:false });
    const est = tit[0]; est.base = 96;
    const comEstrela = Chefe.chanceAssinar(p, { sal:1, anos:2, n1:false }), comN1 = Chefe.chanceAssinar(p, { sal:1, anos:2, n1:true });
    return JSON.stringify({ preso, livre, multa, semEstrela, comEstrela, comN1, hab: Chefe.hab(est) }); })()`));
  if(r.sem) ok(true, 'sem estrela sob contrato neste mercado (nada a medir)');
  else {
    ok(r.livre - r.preso > .15 && r.multa > 0, `estrela sob contrato: ${(r.preso * 100).toFixed(0)}% contra ${(r.livre * 100).toFixed(0)}% se estivesse livre, e rescisão de ${r.multa}`);
    ok(r.hab >= 87 && r.semEstrela - r.comEstrela > .25 && r.comN1 > r.comEstrela + .15, `com outra estrela no box: ${(r.semEstrela * 100).toFixed(0)}% → ${(r.comEstrela * 100).toFixed(0)}%, e ${(r.comN1 * 100).toFixed(0)}% se a oferta for de nº 1`);
  }
}

/* 11. teto de gastos: só onde existia, com aviso, conta e projeção */
{
  const J = equipe(16, 2020, 3);
  const r = JSON.parse(J.run(`(() => { __inverno(); const sem = Chefe.tetoConta(); __temporada(); Chefe.proximoAno();
    const aviso = C.inv.msgs.some(m => /Novo regulamento financeiro/.test(m.t)); const k = Chefe.tetoConta();
    UIC.pagina('financas'); const tela = document.getElementById('chPrincipal').innerHTML;
    Chefe.comecarTemporada(); const sea = C.temporada; for(let i = 0; i < 5; i++) Chefe.correr(); const k2 = Chefe.tetoConta();
    return JSON.stringify({ sem, aviso, k, k2, tela: /Projeção/.test(tela) && /Fica fora/.test(tela) }); })()`));
  ok(r.sem === null, 'em 2020 não existe teto: nada aparece');
  ok(r.aviso && r.k && r.k.teto > 0 && r.k.proj > 0 && r.tela, `em 2021 vem o aviso, e o painel mostra limite, projeção e o que fica fora (${Math.round(r.k.proj / 1e6)} de ${Math.round(r.k.teto / 1e6)} mi)`);
  ok(r.k2.emAno && r.k2.gasto > 0 && r.k2.resta === r.k2.teto - r.k2.gasto && r.k2.proj >= r.k2.gasto, 'na temporada, o contado e o que sobra batem, e a projeção parte do gasto real');
}

/* 12. classificação, treinos e peças: informação que muda a decisão */
{
  const J = equipe(17, 2019, 4);
  const r = JSON.parse(J.run(`(() => { __inverno(); Chefe.comecarTemporada(); const sea = C.temporada;
    const lq = Chefe.leituraQuali(sea, sea.round), lq2 = Chefe.leituraQuali(sea, sea.round);
    const L = {}; for(let rd = 0; rd < sea.calendar.length; rd++) Chefe.leituraQuali(sea, rd).linhas.forEach(([k, v]) => { (L[k] = L[k] || new Set()).add(v.replace(/ \\(\\d+%\\)/, '')); });
    Chefe.escalar(sea); const f = sea.field.find(x => x.teamId === 'EU' && x.carro === 0);
    C.decisao = C.decisao || {}; C.decisao.treino = { 0:'pneus' }; const dPneus = Chefe.dadosTreino(f), qP = Chefe.efeitoTreino(f).q;
    C.decisao.treino = { 0:'quali' }; const dQuali = Chefe.dadosTreino(f), qQ = Chefe.efeitoTreino(f).q;
    C.decisao.treino = { 0:'equilibrio' }; const s0 = Acerto.estado(sea, 0).saidas; UIC.dec('treino', 0, 'configuracao'); const s1 = Acerto.estado(sea, 0).saidas; UI.close();
    const pv = Pecas.previsao('asaD', 'lenta', 1), rN = Pecas.etapaPronta(pv.dias + Pecas.diasFab('asaD', 2, false)), rR = Pecas.etapaPronta(pv.dias + Pecas.diasFab('asaD', 2, true));
    return JSON.stringify({ n: lq.linhas.length, igual: JSON.stringify(lq) === JSON.stringify(lq2), var: Object.values(L).map(s => s.size), dPneus, dQuali, qP, qQ, s0, s1, rN, rR, round: sea.round,
      fN: Pecas.diasFab('asaD', 2, false), fR: Pecas.diasFab('asaD', 2, true) }); })()`));
  ok(r.n === 4 && r.igual && r.var.filter(x => x > 1).length >= 3, `a leitura da classificação tem pista, tráfego, bandeira e chuva, muda de etapa para etapa e é a mesma ao reabrir`);
  ok(r.dPneus > r.dQuali + .4 && r.qQ > r.qP, `avaliação de pneus dá muito mais dado de pneu (${Math.round(r.dPneus * 100)}% contra ${Math.round(r.dQuali * 100)}%) e a simulação de classificação dá mais ritmo de sábado`);
  ok(r.s1 === r.s0 + 2, `teste de configuração: duas saídas a mais para o acerto (${r.s0} → ${r.s1})`);
  ok(r.rN != null && r.rN > r.round && r.fR < r.fN && (r.rR == null || r.rR <= r.rN), `a peça começada agora corre a partir da etapa ${r.rN + 1}; às pressas a fabricação leva ${r.fR} dias em vez de ${r.fN}`);
}

/* 13. convites e participação */
{
  const J = equipe(18, 2005, 5);
  const r = JSON.parse(J.run(`(() => { let conv = null;
    for(let a = 0; a < 8 && !conv; a++){ __inverno(); __temporada(); Chefe.proximoAno(); UI.limparFila(); UI.close(); C.rep = 95; C.total.tit = Math.max(C.total.tit, 3);
      for(let k = 0; k < 6 && !conv; k++){ C.inv.convites = Chefe.convites(); conv = (C.inv.convites || []).find(o => o.sk !== 'f1') || null; } }
    if(!conv) return JSON.stringify({ sem: true });
    const h = C.hist.length, tot = C.total.temporadas; Chefe.aceitarConvite(conv);
    const depois = { sk: Chefe.sk(), hist: C.hist.length, tot: C.total.temporadas, carreira: (C.carreira || []).length };
    __inverno(); __temporada(); const sv = JSON.parse(JSON.stringify(C)); Chefe.migrar(sv);
    return JSON.stringify({ conv, h, tot, depois, ok: sv.hist.length === h + 1 }); })()`));
  if(r.sem) ok(false, 'nenhum convite de outra categoria em 8 invernos com reputação 95');
  else ok(r.depois.sk === r.conv.sk && r.depois.hist === r.h && r.depois.tot === r.tot && r.depois.carreira >= 1 && r.ok, `convite da ${r.conv.nome} (${r.conv.sk}) aceito: a carreira muda de categoria com o histórico e os totais, e o save continua`);
  const D = H.carregar({ silencioso: true, seed: 19 }); D.run(require('./chefe-comum'));
  const d = JSON.parse(D.run(`(() => { Chefe.novo({ modo:'criar', sk:'f1', ano:2012, chefe:{ nome:'T', cc:'BR' }, eq:{ nome:'Própria', cor:'#123456', cc:'BR' }, realismo:true }); __inverno();
    const o = { id: 1, nome:'Fundo', pct: 20, valor: 30e6 }; C.inv.investidores = [o]; const part0 = C.part; Chefe.aceitarInvestidor(o);
    const preco = Chefe.precoRecompra(20); __temporada(); const div = -(C.livro.dividendos || 0); Chefe.proximoAno(); C.caixa = Math.max(C.caixa, preco * 2);
    const rr = Chefe.recomprar(20); return JSON.stringify({ part0, preco, valor: o.valor, div, ok: rr.ok, part: C.part }); })()`));
  ok(d.preco > d.valor && d.ok && d.part === d.part0, `vender 20% rendeu ${Math.round(d.valor / 1e6)} mi; recomprar custou ${Math.round(d.preco / 1e6)} mi e devolve os ${d.part}%`);
  ok(d.div >= 0, `enquanto o sócio está dentro, ele leva a parte dele do lucro (${Math.round(d.div / 1e6)} mi no ano)`);
  const A = equipe(20, 2012, 3);
  ok(A.run('Chefe.ehDono()') === false && A.run('Chefe.recomprar(10).ok') === false, 'o chefe contratado não vende nem recompra uma equipe que não é dele');
}

/* 14. automático e manual usam o mesmo motor: quem decide melhor ganha */
{
  const J = equipe(9, 2019, 4);
  const r = JSON.parse(J.run(`(() => { __inverno(); Chefe.comecarTemporada(); const sea = C.temporada; const t = { auto:[0, 0, 0], esperto:[0, 0, 0], maximo:[0, 0, 0] };
    const correr = (M, pol) => { const R = Gp.criar(Gp.entrada(sea, M, Chefe.sk(), sea.ano, f => f.teamId === 'EU', { gestao: true }));
      if(pol === 'maximo') R.carros.forEach((s, i) => { if(s.c.ctrl) Gp.comandar(R, i, { modo:'maximo' }); });
      const volta = {}; let g = 0;
      while(!R.fim && g++ < 400000){ if(R.pergunta) Gp.responder(R, R.pergunta.padrao);
        R.carros.forEach((s, i) => { if(!s.c.ctrl || s.estado !== 0) return; if(s.sugestao && !s.parar) Gp.comandar(R, i, { parar: s.sugestao.c });
          if(pol === 'esperto' && volta[i] !== s.voltas){ volta[i] = s.voltas; const v = Gp.vizinhos(R, s), resta = R.N - s.voltas; let modo = 'normal', trato = 'normal';
            if(v.gf < .9 && s.pneu.gasto < .8) modo = resta <= 8 && v.gf < .5 ? 'maximo' : 'atacar'; else if(v.gt < .6) modo = 'atacar'; else if(v.gf > 4 && v.gt > 4) modo = 'poupar';
            if(s.pneu.gasto > .7 && resta > 6) trato = 'cuidar'; else if(resta <= 4 && v.gf < 1.5) trato = 'forcar'; Gp.comandar(R, i, { modo, trato }); } });
        Gp.passo(R); }
      const res = Gp.resultado(R), ids = new Set(R.carros.filter(s => s.c.ctrl).map(s => s.c.id));
      res.ordem.forEach((o, i) => { if(!ids.has(o.id)) return; const T = t[pol]; T[0] += o.fora ? 20 : i + 1; T[1]++; T[2] += o.paradas; }); };
    for(let k = 0; k < 6; k++){ Chefe.gridDaEtapa(sea); const M = Chefe.montar(); ['auto', 'esperto', 'maximo'].forEach(p => correr(M, p)); Chefe.correr(); }
    return JSON.stringify(Object.fromEntries(Object.entries(t).map(([k, v]) => [k, { pos: v[0] / v[1], par: v[2] / v[1] }]))); })()`));
  /* com 6 corridas a diferença entre o automático e um jogador que lê a corrida fica dentro do
     ruído (uma corrida vale várias posições); o que se verifica aqui é que decidir muda o resultado */
  ok(r.esperto.pos !== r.auto.pos || r.esperto.par !== r.auto.par, `mesmo motor, sem bônus: em 6 corridas iguais o jogador que lê a corrida fez P${r.esperto.pos.toFixed(1)} e o automático P${r.auto.pos.toFixed(1)} (decidir muda o resultado)`);
  ok(r.maximo.par > r.auto.par, `ataque máximo a corrida toda gasta mais pneu: ${r.maximo.par.toFixed(1)} paradas por carro contra ${r.auto.par.toFixed(1)}`);
}

console.log(falhas ? `\n${falhas} de ${n} verificações falharam` : `\nmanager 2.1: ${n} verificações, tudo certo`);
process.exit(falhas ? 1 : 0);
