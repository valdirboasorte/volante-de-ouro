/* Pneu de largada e pneu depois de um toque: a escolha é de quem controla o carro.
   — antes da luz verde, cada carro seu aceita o pneu escolhido e refaz o plano;
   — depois da largada, ou num carro que não é seu, a escolha é recusada;
   — no toque, o rádio oferece os compostos possíveis, com a sugestão da equipe marcada,
     e separa conserto do bico de troca de pneu;
   — a resposta escolhida é o pneu que vai para o carro; simular até o fim usa a sugestão.
   Uso: node testes/pneus.js   Não modifica arquivos nem saves. */
const H = require('./base');
let falhas = 0, n = 0;
const ok = (c, m) => { n++; if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };

const J = H.carregar({ silencioso:true, seed: 21 });
H.novaCarreira(J, { era: 7, ano: 2023, idade: 24, rapido: false });
J.run(`_ent = (doisMeus) => { const sea = S.season; const M = Engine.montarCorrida(sea);
  const ent = Gp.entrada(sea, M, S.series, sea.year, f => !!f.isMe);
  ent.carros.forEach(c => { c.fora = null; c.fracFora = null; c.erro = false; });
  if(doisMeus){ const outro = ent.carros.find(c => !c.me); outro.ctrl = true; }
  ent.wet = false; return ent; };`);

{
  const r = J.run(`(() => { const R = Gp.criar(_ent(true)); R.w = 0; R.choveu = false;
    const meus = R.carros.filter(s => s.c.ctrl), ops = Gp.opcoesLargada(R);
    const res = meus.map(s => { const alvo = ops.find(c => c !== s.pneuSugerido && !Gp.COMP[c].chuva);
      const ok = Gp.escolherLargada(R, s.i, alvo);
      return { ok, alvo, pneu: s.pneu.c, usados: [...s.usados], plano: s.plano.length >= 0, sug: s.pneuSugerido, troca: s.escolheuLargada }; });
    const alheio = R.carros.find(s => !s.c.ctrl);
    const recusaAlheio = !Gp.escolherLargada(R, alheio.i, 'S');
    const recusaInvalido = !Gp.escolherLargada(R, meus[0].i, 'X');
    Gp.avancar(R, R.T * 2);
    const antes = meus[0].pneu.c;
    const recusaDepois = !Gp.escolherLargada(R, meus[0].i, ops.find(c => c !== antes));
    return { ops, res, recusaAlheio, recusaInvalido, recusaDepois, n: meus.length }; })()`);
  ok(r.ops.length >= 3, `na F1 de 2023 há escolha de largada (${r.ops.join(', ')})`);
  ok(r.n === 2 && r.res.every(x => x.ok && x.pneu === x.alvo && x.usados.length === 1 && x.usados[0] === x.alvo && x.troca),
    'os dois carros controlados (como no modo chefe) largam com o pneu escolhido, cada um o seu');
  ok(r.recusaAlheio && r.recusaInvalido, 'carro de outra equipe ou composto inexistente: recusado');
  ok(r.recusaDepois, 'depois da luz verde não dá para trocar o pneu de largada');
}
{
  /* o toque: pneu furado e bico quebrado */
  const r = J.run(`(() => { const R = Gp.criar(_ent(false)); R.w = 0; R.choveu = false;
    const eu = R.carros.find(s => s.c.ctrl), outro = R.carros.find(s => !s.c.ctrl);
    const rndOrig = R.rnd;
    R.rnd = () => .1; Gp.toque(R, eu, outro);
    const q1 = R.pergunta; const furo = { txt:q1.txt, padrao:q1.padrao, ks:q1.opcoes.map(o => o.k), ns:q1.opcoes.map(o => o.n + (o.tag ? ' (' + o.tag + ')' : '')), ds:q1.opcoes.map(o => o.d) };
    const escolhido = q1.opcoes.find(o => o.k !== q1.padrao && o.k !== 'seguir').k;
    Gp.responder(R, escolhido); const parou = eu.parar;
    eu.parar = null; eu.furo = false;
    R.rnd = () => .4; Gp.toque(R, eu, outro);
    const q2 = R.pergunta; const asa = { txt:q2.txt, padrao:q2.padrao, ns:q2.opcoes.map(o => o.n), ds:q2.opcoes.map(o => o.d) };
    Gp.responder(R, q2.padrao); const padraoPneu = eu.parar;
    R.rnd = rndOrig;
    return { furo, escolhido, parou, asa, padraoPneu, rec: Gp.melhorPneuAgora(R, eu) }; })()`);
  ok(/furado/.test(r.furo.txt) && r.furo.ks.filter(k => /^p_/.test(k)).length >= 2 && r.furo.ks.indexOf('seguir') >= 0,
    `pneu furado: o rádio oferece ${r.furo.ks.filter(k => /^p_/.test(k)).length} compostos e seguir assim`);
  ok(r.furo.ns.some(x => /sugestão da equipe/.test(x)) && r.furo.padrao === r.furo.ks[0], 'a sugestão da equipe vem marcada e em primeiro');
  ok(r.parou === r.escolhido.slice(2), `a escolha vale: pediu ${r.escolhido.slice(2)}, o carro para por ${r.parou}`);
  ok(/quebrada/.test(r.asa.txt) && r.asa.ns.every(x => x === 'Seguir assim' || /bico novo/.test(x)) && r.asa.ds.some(d => /Conserto do bico/.test(d)),
    'bico quebrado: o rádio separa o conserto do bico da troca de pneu');
  ok(r.furo.ds.some(d => /Sem conserto/.test(d)), 'pneu furado: fica claro que é só troca de pneu');
  ok(r.padraoPneu === r.rec, 'sem resposta (simular até o fim), vale a sugestão da equipe');
}
{
  /* uma corrida inteira com escolha de largada termina limpa */
  const r = J.run(`(() => { const R = Gp.criar(_ent(true)); const meus = R.carros.filter(s => s.c.ctrl);
    meus.forEach(s => Gp.escolherLargada(R, s.i, Gp.opcoesLargada(R).find(c => !Gp.COMP[c].chuva && c !== s.pneuSugerido)));
    Gp.terminar(R); const res = Gp.resultado(R);
    return { fim: R.fim, nan: R.carros.some(s => !isFinite(s.s)), n: res.ordem.length }; })()`);
  ok(r.fim && !r.nan && r.n > 10, 'corrida inteira com pneus de largada escolhidos chega à bandeirada sem erro');
}
{
  /* aderência e duração mostradas antes da largada fazem sentido com a pista */
  const r = J.run(`(() => { const R = Gp.criar(_ent(true));
    R.w = 0; const seco = Gp.opcoesLargada(R).map(c => [c, Gp.perfilPneu(R, c)]);
    R.w = .8; const molhado = Gp.opcoesLargada(R).map(c => [c, Gp.perfilPneu(R, c)]);
    R.w = 0; const regra = Gp.regraPneus(R, R.carros.find(s => s.c.ctrl));
    return { seco, molhado, regra, dois: R.regras.doisCompostos }; })()`);
  const sec = Object.fromEntries(r.seco), mol = Object.fromEntries(r.molhado);
  const lisos = Object.keys(sec).filter(c => !['I','W'].includes(c));
  ok(lisos.every(c => sec[c].voltas >= 1 && !sec[c].aviso) && (!sec.W || sec.W.aviso), 'no seco: pneus lisos sem aviso, pneu de chuva com aviso');
  ok(lisos.every(c => mol[c].ader === 1 && mol[c].aviso) && (!mol.W || mol.W.ader === 3), 'no molhado: liso quase sem aderência, pneu de chuva no topo');
  ok(!r.dois || r.regra.some(t => /dois compostos/.test(t)), 'a regra dos dois compostos aparece quando vale');
}
{
  /* piloto: a preparação vem depois do grid e antes da largada; o pneu confirmado vai para a pista */
  const K = H.carregar({ silencioso:true, seed: 33 });
  H.novaCarreira(K, { era: 7, ano: 2023, idade: 24, rapido: false });
  const r = K.run(`(() => { const sea = S.season; const fds = Engine.garantirFds(sea, sea.round);
    while((fds.treinos || []).length < fds.sessoes) Engine.correrTreino(sea, sea.round, 'acerto');
    Game.garantirResp(); sea.setup.auto = false; fds.etapa = 'quali'; fds.sorteio = 'feito'; fds.evento = null;
    Game.fazerQuali('meio'); UI.limparFila(); UI.close(); fds.etapa = 'corrida';
    const antes = sea.results.length;
    Game.nextRace();
    const abriuPrep = /Preparação da corrida/.test(document.getElementById('modal').innerHTML) && sea.results.length === antes;
    const d = Gp.dadosLargada(sea, Game.entradaDaEtapa(sea));
    const alvo = d.carros[0].opcoes.map(o => o.c).find(c => c !== d.carros[0].sugerido && !Gp.COMP[c].chuva);
    Game.escolherPneuLargada('ME', alvo);
    let pneu = null; const criar = Gp.criar; Gp.criar = ent => { const R = criar(ent); const me = R.carros.find(s => s.c.me); if(me) pneu = me.pneu.c; return R; };
    Game.confirmarLargada(); Gp.criar = criar;
    const depois = sea.results.length;
    Game.confirmarLargada();
    return { abriuPrep, alvo, pneu, antes, depois, final: sea.results.length }; })()`);
  ok(r.abriuPrep, 'piloto: depois do grid vem a preparação, e a corrida ainda não aconteceu');
  ok(r.pneu === r.alvo, `piloto: o pneu confirmado na preparação é o da largada (${r.alvo})`);
  ok(r.depois === r.antes + 1 && r.final === r.depois, 'piloto: confirmar corre a etapa uma vez só');
}
console.log(falhas ? falhas + ' falha(s) de ' + n : `pneus: ${n} verificações, tudo certo`);
if(falhas) process.exitCode = 1;
