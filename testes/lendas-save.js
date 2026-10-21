/* "Os maiores da história" neste save: cada piloto começa com os títulos reais
   que já tinha antes do primeiro ano da sua carreira (Verstappen chega a 2023
   com dois), e o que acontece depois é o do save — sem duplicar ninguém.
   Uso: node testes/lendas-save.js   Não modifica arquivos nem saves. */
const H = require('./base');
let falhas = 0, n = 0;
const ok = (c, m) => { n++; if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };
const rank = (J, sk) => J.run(`(() => { const u = rankingUniverso('${sk}', { name: S.driver.name }); return { desde: u.desde, primeiro: u.primeiroAno,
  semV: u.semVencedores, semC: u.semCampeao, l: u.linhas.map(x => ({ nome: x.nome, t: x.t, antes: x.tAntes || 0, v: x.v, vAntes: x.vAntes || 0 })) }; })()`);

{
  const J = H.carregar({ silencioso:true, seed: 5 });
  H.novaCarreira(J, { era: 7, ano: 2023, idade: 24, rapido: true });
  J.run('const t = S.ladder.indexOf(Engine.topCat()); S.catIdx = t; Game.startSeason(); UI.limparFila(); UI.close(); Game.simSeason(); UI.limparFila(); UI.close(); Game.endSeason(); UI.limparFila(); UI.close();');
  const r = rank(J, 'f1'), de = nome => r.l.find(x => x.nome === nome) || {};
  ok(de('Verstappen').antes === 2, `Verstappen começa 2023 com os 2 títulos reais (2021 e 2022): ${de('Verstappen').t} no total`);
  ok(de('Hamilton').antes === 7 && de('M. Schumacher').antes === 7 && de('Fangio').antes === 5, 'Hamilton e Schumacher com 7, Fangio com 5, desde 1950');
  ok(r.desde === 2023 && r.primeiro === 1950, 'o save começa no seu primeiro ano; antes dele vale a história real');
  ok(de('Verstappen').vAntes === 35 && de('Hamilton').vAntes === 103 && de('M. Schumacher').vAntes === 91 && de('Senna').vAntes === 41,
     'e as vitórias reais de antes: Verstappen 35, Hamilton 103, Schumacher 91, Senna 41');
  ok(!r.semV.length && !r.semC.length, 'na F1 o banco tem o campeão e o vencedor de todas as corridas desde 1950');
  ok(r.l.every((x, i) => r.l.findIndex(y => y.nome === x.nome) === i), 'ninguém aparece duas vezes (o título real e o do save somam no mesmo nome)');
  /* o ano vira quando você assina para o seguinte: aí 2023 entra no mundo */
  J.run('S.lastSum = Engine.summary(S.season); Game.showOffers(S.lastSum); UI.limparFila(); const i = (S.pendingOffers || []).findIndex(o => o.podeP !== false); Game.takeOffer(Math.max(0, i)); UI.limparFila(); UI.close();');
  const r2 = rank(J, 'f1');
  const titulosSave = r2.l.reduce((a, x) => a + x.t - x.antes, 0);
  ok(titulosSave === 1 && r2.l.find(x => x.nome === 'Verstappen').antes === 2, `virado o ano, 2023 soma exatamente um título do save à tabela, sem mexer nos de antes`);
  J.run(`UI.lendas('f1', { name: S.driver.name, cc: S.driver.cc, serie: 'f1' }, 'save')`);
  ok(/Títulos e vitórias reais de 1950 a 2022/.test(J.E('modal').innerHTML), 'a nota explica de onde vêm os títulos e as vitórias de antes do save');
}
{
  const J = H.carregar({ silencioso:true, seed: 8 });
  H.novaCarreira(J, { era: 7, ano: 2019, idade: 24, rapido: true, serie: 'indy' });
  J.run('const t = S.ladder.indexOf(Engine.topCat()); S.catIdx = t; Game.startSeason(); UI.limparFila(); UI.close(); Game.simSeason(); UI.limparFila(); UI.close(); Game.endSeason(); UI.limparFila(); UI.close();');
  const r = rank(J, 'indy'), dixon = r.l.find(x => /Dixon/.test(x.nome)) || {};
  ok(dixon.antes >= 5 && dixon.vAntes >= 40, `IndyCar 2019: Dixon começa com os títulos (${dixon.antes}) e as vitórias (${dixon.vAntes}) reais que já tinha`);
}
{
  /* NASCAR: o banco tem lacunas — a tela diz quais anos ficam de fora, e "Fulano (?)" não vira duas pessoas */
  const J = H.carregar({ silencioso:true, seed: 5 });
  H.novaCarreira(J, { era: 4, ano: 1995, idade: 24, rapido: true, serie: 'nascar' });
  J.run('const t = S.ladder.indexOf(Engine.topCat()); S.catIdx = t; Game.startSeason(); UI.limparFila(); UI.close(); Game.simSeason(); UI.limparFila(); UI.close(); Game.endSeason(); UI.limparFila(); UI.close();');
  const r = rank(J, 'nascar'), ea = r.l.filter(x => /^Dale Earnhardt( \(\?\))?$/.test(x.nome));
  ok(ea.length === 1 && ea[0].antes === 7, `Dale Earnhardt aparece uma vez só, com os 7 títulos de antes de 1995`);
  ok(r.semV.indexOf(1967) >= 0 && r.semC.indexOf(1967) >= 0, 'os anos sem dado no banco (1967, por exemplo) ficam listados, não inventados');
  J.run(`UI.lendas('nascar', { name: S.driver.name, cc: S.driver.cc, serie: 'nascar' }, 'save')`);
  ok(/Sem o vencedor corrida a corrida no banco/.test(J.E('modal').innerHTML), 'a tela avisa quais anos não têm o vencedor de cada corrida');
}
{
  /* nos anos em que você ainda não está na principal, as vitórias dos outros também andam */
  const J = H.carregar({ silencioso:true, seed: 5 });
  H.novaCarreira(J, { era: 7, ano: 2023, idade: 12, rapido: true });
  for(let k = 0; k < 4; k++) J.run(`(() => { Game.simSeason(); UI.limparFila(); UI.close(); Game.endSeason(); UI.limparFila(); UI.close();
    S.lastSum = Engine.summary(S.season); Game.showOffers(S.lastSum); UI.limparFila();
    const i = Math.max(0, (S.pendingOffers || []).findIndex(o => o.podeP !== false && !o.livre)); Game.takeOffer(i); UI.limparFila(); UI.close(); })()`);
  const r = rank(J, 'f1'), ver = r.l.find(x => x.nome === 'Verstappen') || {};
  const topos = J.run(`(() => { const W = S.mundos.f1; return Object.keys(W.topos || {}).filter(a => +a >= 2023).map(a => ({ a: +a, soma: Object.values(W.topos[a].v || {}).reduce((x, y) => x + y, 0), n: calendarFor(+a, 'f1').length })); })()`);
  ok(J.run('S.season.isTop') === false && ver.v > ver.vAntes && ver.vAntes === 35, `ainda na base em ${J.run('S.year')}: Verstappen já passou das 35 vitórias reais para ${ver.v}`);
  ok(topos.length >= 4 && topos.every(t => t.soma === t.n), 'cada ano simulado distribui exatamente as corridas do calendário daquele ano: ' + topos.map(t => t.a + ' ' + t.soma + '/' + t.n).join(', '));
  ok(J.run(`rankingUniverso('f1', { name: S.driver.name }).vitoriasParciais`) === false, 'com o registro de cada ano, a tela não precisa mais avisar que faltam vitórias');
  /* save de antes do registro anual: os anos já passados são refeitos e dão o mesmo número */
  J.run('delete S.mundos.f1.topos; Game.save();');
  const K = H.carregar({ silencioso:true, store: J.store });
  K.run('Game.continueSave(); UI.limparFila(); UI.close();');
  const vk = K.run(`rankingUniverso('f1', { name: S.driver.name }).linhas.find(x => x.nome === 'Verstappen').v`);
  ok(vk === ver.v, `save antigo, sem o registro anual: as vitórias dos anos já passados são refeitas (${vk})`);
}
console.log(falhas ? falhas + ' falha(s) de ' + n : `maiores da história no save: ${n} verificações, tudo certo`);
if(falhas) process.exitCode = 1;
