/* Atualização da comunidade (fase 1): as correções urgentes.
   — Fórmula E na chuva: com um pneu só, ninguém para "por chuva" para pôr o mesmo pneu;
     nas categorias com pneu de chuva, a troca continua acontecendo;
   — a mesma janela redesenhada fica onde estava; uma janela nova começa do alto;
     reabrir a mesma tela não volta ao topo, e uma tela nova sim;
   Uso: node testes/comunidade.js   Não modifica arquivos nem saves. */
const H = require('./base');
let falhas = 0, n = 0;
const ok = (c, m) => { n++; if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };

function chefe(seed, sk, ano, pos){
  const J = H.carregar({ silencioso: true, seed });
  J.run(require('./chefe-comum'));
  J.run(`(() => { const l = eraOfSeries(${ano}, '${sk}').teams.map((t, i) => [i, Engine.resolveTeam(t, i, ${ano}, '${sk}')]).filter(x => x[1]);
    Chefe.novo({ chefe:{ nome:'T', cc:'BR' }, realismo:true, modo:'assumir', sk:'${sk}', ano:${ano}, idx:l[Math.min(l.length - 1, ${pos})][0] }); __inverno(); Chefe.comecarTemporada(); })()`);
  return J;
}
/* uma corrida com a pista molhada do começo ao fim */
const molhada = (J, w) => JSON.parse(J.run(`(() => { const sea = C.temporada; Chefe.gridDaEtapa(sea); const M = Chefe.montar();
  const R = Gp.criar(Gp.entrada(sea, M, Chefe.sk(), sea.ano, f => f.teamId === 'EU', { gestao: true }));
  R.clima.fases = [[0, ${w}]]; R.w = ${w}; Gp.terminar(R);
  const res = Gp.resultado(R), par = res.ordem.map(o => o.paradas), pneus = res.ordem.map(o => o.pneus);
  /* parada para consertar o carro depois de um toque não é ciclo de chuva: desconta os toques de cada um */
  const semToque = res.ordem.map(o => { const s = R.carros.find(c => c.c.id === o.id); const t = s ? R.eventos.filter(e => e.tipo === 'toque' && (e.a === s.i || e.b === s.i)).length : 0; return Math.max(0, o.paradas - t); });
  return JSON.stringify({ media: par.reduce((a, b) => a + b, 0) / par.length, max: Math.max(...par), maxSemToque: Math.max(...semToque), chuva: R.regras.chuva, pneus }); })()`));

/* 1. Fórmula E na chuva */
{
  const fe = molhada(chefe(5, 'fe', 2021, 2), .75);
  ok(fe.chuva.length === 0 && fe.max <= 1 && fe.media < .3, `Fórmula E 2021 com pista molhada: ${fe.media.toFixed(2)} parada por carro, no máximo ${fe.max} (antes: 15 por carro, até 21)`);
  const f1 = molhada(chefe(6, 'f1', 2019, 4), .75);
  ok(f1.pneus.some(p => p.some(c => c === 'I' || c === 'W')) && f1.maxSemToque <= 4, `F1 2019 molhada: quem largou de pneu seco troca para o de chuva, sem ciclo de paradas (máximo ${f1.maxSemToque} sem contar os consertos depois de toque; ${f1.max} no total)`);
}

/* 2. rolagem preservada */
{
  const J = H.carregar({ silencioso: true, seed: 1 });
  const r = JSON.parse(J.run(`(() => { const m = document.getElementById('modal'); const b = m.querySelector('.mbd');
    UI.modal(UI.head('Patrocínio', 'x') + '<div class="mbd">a</div>');
    const mbd = { _y: 0 }; m.querySelector = () => mbd;
    mbd.scrollTop = 420;
    UI.modal(UI.head('Patrocínio', 'y') + '<div class="mbd">b</div>');
    const mesma = mbd.scrollTop;
    mbd.scrollTop = 300;
    UI.modal(UI.head('Mercado', 'z') + '<div class="mbd">c</div>');
    const nova = mbd.scrollTop;
    let topo = 0; window.scrollTo = () => { topo++; };
    document.body.dataset.tela = 'intro'; UI.show('intro'); const mesmaTela = topo;
    UI.show('chefe'); const outraTela = topo;
    window.scrollY = 800; let volta = null; window.scrollTo = (x, y) => { volta = y; };
    UI.manterRolagem(() => { window.scrollY = 120; });
    return JSON.stringify({ mesma, nova, mesmaTela, outraTela, volta }); })()`));
  ok(r.mesma === 420, 'escolher uma opção numa janela (patrocínio, acerto...) não leva a janela de volta ao topo');
  ok(r.nova === 300, 'uma janela nova não herda a rolagem da anterior (fica como o navegador deixa)');
  ok(r.mesmaTela === 0 && r.outraTela === 1, 'reabrir a mesma tela não rola para o topo; trocar de tela sim');
  ok(r.volta === 800, 'redesenhar a página devolve a rolagem que o jogador tinha');
}

/* 3. dificuldade também na corrida ao vivo */
{
  const J = H.carregar({ silencioso: true, seed: 7 });
  H.novaCarreira(J, { era: 7, ano: 2018, idade: 24, serie: 'f1' });
  const r = JSON.parse(J.run(`(() => { const out = {};
    for(const d of ['tranquilo', 'equilibrado', 'realista']){ S.dif = d; Game._M = null; const ent = Game.entradaDaEtapa(S.season);
      const R = Gp.criar(ent); const ia = R.carros.filter(s => !s.c.ctrl);
      out[d] = { erro: ent.erroMult, ia: ent.iaNivel, planoIA: ia.filter(s => s.erroPlano).length }; }
    return JSON.stringify(out); })()`));
  ok(r.tranquilo.erro === .5 && r.equilibrado.erro === .8 && r.realista.erro === 1, 'ao vivo, o erro do jogador segue a dificuldade (metade no Tranquilo), como na corrida rápida');
  ok(r.tranquilo.planoIA > 0 && r.realista.planoIA === 0, `no Tranquilo as rivais leem o pneu com erro (${r.tranquilo.planoIA} carros); no Desafio, como sempre`);
}

/* 4. idade e fim de carreira: não há idade fixa */
{
  const J = H.carregar({ silencioso: true, seed: 1 });
  J.run(`Game.startScenario('senna94'); UI.limparFila(); UI.close();`);
  const c = JSON.parse(J.run('JSON.stringify({ age: S.driver.age, peak: S.driver.peak, decl: S.driver.decl, last: S.driver.lastAge })'));
  ok(c.decl > c.age && c.last >= c.decl + 2, `o Senna de 1994 (${c.age} anos) entra com o declínio aos ${c.decl} e o fim da linha aos ${c.last}, não com uma curva de estreante`);
  const f = JSON.parse(J.run(`(() => { const d = S.driver, H0 = S.history.slice();
    d.age = d.lastAge + 1; d.ovr = 80;
    S.history = [{ cat: Engine.topCat(), pos: 2 }, { cat: Engine.topCat(), pos: 2 }]; const vice = Engine.fimDaLinha(d);
    S.history = [{ cat: Engine.topCat(), pos: 1, champion: true }]; const campeao = Engine.fimDaLinha(d);
    S.history = [{ cat: Engine.topCat(), pos: 14 }, { cat: Engine.topCat(), pos: 16 }]; const fraco = Engine.fimDaLinha(d);
    d.ovr = 88; const elite = Engine.fimDaLinha(d);
    S.history = H0; return JSON.stringify({ vice, campeao, fraco, elite }); })()`));
  ok(!f.vice && !f.campeao, 'passado da idade em que costuma parar, quem foi vice ou campeão continua no mercado');
  ok(f.fraco && !f.elite, 'quem caiu para o fundo do grid chega ao fim da linha; um veterano ainda de ponta, não');
  /* a regra que afastou o Senna aos 35 depois de dois vices não existe mais */
  const v = JSON.parse(J.run(`(() => { const d = S.driver; d.age = 35; d.lastAge = 35; d.ovr = 90;
    S.history = [{ cat: Engine.topCat(), pos: 2 }, { cat: Engine.topCat(), pos: 2 }];
    return JSON.stringify({ fim: Engine.fimDaLinha(d) }); })()`));
  ok(!v.fim, 'com dois vice-campeonatos, 35 anos não é mais o fim da F1');
}

/* 5. contratos: a IA renova com estabilidade; romper contrato pesa no mercado */
{
  const J = H.carregar({ silencioso: true, seed: 3 });
  const r = JSON.parse(J.run(`(() => { let bom = 0, ruim = 0, velho = 0; const N = 2000;
    for(let i = 0; i < N; i++){
      if(Mundo.renova({ nasc: 2000, ps: 2, psN: 20, h: 82 }, 2030)) bom++;
      if(Mundo.renova({ nasc: 2000, ps: 19, psN: 20, h: 72 }, 2030)) ruim++;
      if(Mundo.renova({ nasc: 1990, ps: 8, psN: 20, h: 78 }, 2030)) velho++; }
    return JSON.stringify({ bom: bom / N, ruim: ruim / N, velho: velho / N }); })()`));
  ok(r.bom > .5 && r.ruim < .25 && r.velho < r.bom, `renovação da IA: ${(r.bom * 100).toFixed(0)}% de quem foi bem, ${(r.ruim * 100).toFixed(0)}% de quem foi mal, ${(r.velho * 100).toFixed(0)}% do veterano de 40`);
  const K = H.carregar({ silencioso: true, seed: 8 });
  H.novaCarreira(K, { era: 7, ano: 2018, idade: 24, serie: 'f1' });
  const q = JSON.parse(K.run(`(() => { K_ = 0; const ano = S.year + 1, sum = Engine.summary(S.season);
    const a = Engine.valorJogadorTopo('Ferrari', ano, sum, {});
    S.rompeu = { nome: 'Outra', ate: ano + 1 }; const w = {}; const b = Engine.valorJogadorTopo('Ferrari', ano, sum, w);
    S.rompeu = null; return JSON.stringify({ a, b, w }); })()`.replace('K_ = 0; ', '')));
  ok(q.b < q.a - 1 && q.w.rompeu, 'quem rompeu um contrato há pouco vale menos para todas as equipes, e o motivo aparece no mercado');
}

console.log(falhas ? `\n${falhas} de ${n} verificações falharam` : `\ncomunidade, fase 1: ${n} verificações, tudo certo`);
process.exit(falhas ? 1 : 0);
