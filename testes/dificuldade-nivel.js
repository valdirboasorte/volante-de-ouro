/* Dificuldade (Tranquilo, Equilibrado, Desafio): só o lado do jogador muda.
   — save antigo, sem o campo, abre como Equilibrado;
   — o ritmo, o preço da vaga e o pneu no fio seguem a escolha; Desafio fica como era;
   — dá para trocar no meio da carreira, e a ficha de criação mostra as três;
   Uso: node testes/dificuldade-nivel.js   Não modifica arquivos nem saves. */
const H = require('./base');
let falhas = 0, n = 0;
const ok = (c, m) => { n++; if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };

const J = H.carregar({ silencioso:true, seed: 4 });
H.novaCarreira(J, { era: 7, ano: 2016, idade: 12, cc: 'BR', modo: 'realista', rapido: true });
ok(J.run('S.dif') === 'equilibrado', 'carreira nova começa em Equilibrado');
J.run('delete S.dif; Game.save();');
const K = H.carregar({ silencioso:true, store: J.store });
K.run('Game.continueSave(); UI.limparFila(); UI.close();');
ok(K.run('Engine.difK()') === 'equilibrado', 'save antigo, sem o campo, abre em Equilibrado');

const medir = k => J.run(`(() => { S.dif = '${k}'; const q = Engine.meSkill(false).q;
  const sum = Engine.summary(S.season); S.lastSum = sum; Game.showOffers(sum); UI.limparFila();
  const pagas = (S.pendingOffers || []).filter(o => o.custo > 0).map(o => o.paga / Math.max(1, (o.custo - (o.apoio || 0)) * Engine.descontoCampeao(o, sum)));
  return { q, rel: pagas.length ? pagas.reduce((a, b) => a + b, 0) / pagas.length : null, fio: Engine.dif().fio }; })()`);
const r = { tranquilo: medir('tranquilo'), equilibrado: medir('equilibrado'), realista: medir('realista') };
ok(r.tranquilo.q > r.equilibrado.q && r.equilibrado.q > r.realista.q, `ritmo de classificação: ${r.tranquilo.q.toFixed(1)} > ${r.equilibrado.q.toFixed(1)} > ${r.realista.q.toFixed(1)}`);
ok(r.realista.rel == null || Math.abs(r.realista.rel - 1) < .01, 'Desafio paga a vaga inteira, como antes');
ok(r.equilibrado.rel == null || (Math.abs(r.equilibrado.rel - .7) < .02 && Math.abs(r.tranquilo.rel - .5) < .02), 'Equilibrado paga 70% da vaga e Tranquilo, metade');
ok(r.tranquilo.fio === 3 && r.equilibrado.fio === 2 && r.realista.fio === 1, 'o pneu no fio do seu carro aguenta em média 3, 2 e 1 volta');

/* trocar no meio da carreira, pela barra de ações */
J.run('S.dif = "equilibrado"; UI.render(); UI.difModal();');
ok(/Game\.setDif\('tranquilo'\)/.test(J.E('modal').innerHTML) && /UI\.difModal\(\)/.test(J.E('actBar').innerHTML), 'a barra da carreira abre a escolha de dificuldade');
J.run('Game.setDif("tranquilo")');
ok(J.run('S.dif') === 'tranquilo', 'trocar no meio da carreira vale na hora');
const F = H.carregar({ silencioso:true });
F.run('UI.dif = "realista"; UI.difForm();');
ok(/Tranquilo/.test(F.E('difBox').innerHTML) && /Desafio/.test(F.E('difBox').innerHTML) && /Sem ajuda/.test(F.E('difTx').textContent), 'a ficha de criação mostra as três e explica a escolhida');

console.log(falhas ? falhas + ' falha(s) de ' + n : `dificuldade: ${n} verificações, tudo certo`);
if(falhas) process.exitCode = 1;
