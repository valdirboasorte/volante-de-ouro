/* O mercado do modo piloto: motivos, interesse, negociação e quebra de contrato */
const H = require('./base');
let falhas = 0;
const ok = (c, m) => { if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };
const resumo = { negociou:0, cedeu:0, manteve:0, retirou:0, motivos:{} };
for(let k = 0; k < 25; k++){
  const J = H.carregar();
  H.novaCarreira(J, { era:6, ano:2014, idade:27, rapido:true, modo: k % 2 ? 'realista' : 'classico' });
  J.run('Game.simSeason(); UI.limparFila(); UI.close(); Game.endSeason(); UI.limparFila(); UI.close();');
  J.run('S.academyOffers = null; S.lastSum = Engine.summary(S.season); Game.showOffers(S.lastSum); UI.limparFila();');
  const html = J.E('modal').innerHTML;
  if(k === 0){
    ok(/Mercado de/.test(html), 'a janela de ofertas abre');
    ok(Array.isArray(J.run('S.mercadoMotivos')), 'há uma lista de quem não ligou');
  }
  (J.run('S.mercadoMotivos') || []).forEach(m => resumo.motivos[m.m] = (resumo.motivos[m.m] || 0) + 1);
  const ofs = J.run('S.pendingOffers') || [];
  const i = ofs.findIndex(o => o.gap != null && !o.sk);
  if(i < 0) continue;
  const antes = { anos: ofs[i].years };
  J.run(`Game.negociarOferta(${i})`);
  if(k === 0) ok(/Negociar com a/.test(J.E('modal').innerHTML), 'a conversa abre');
  J.run(`Game.pedirOferta(${i}, 'anos')`);
  const depois = J.run(`S.pendingOffers[${i}]`);
  resumo.negociou++;
  if(depois.retirada) resumo.retirou++;
  else if(depois.years > antes.anos) resumo.cedeu++;
  else resumo.manteve++;
  if(!depois.retirada){
    J.run(`Game.takeOffer(${i}); UI.limparFila(); UI.close();`);
    const c = J.run('S.contract');
    if(depois.years !== c.years) { falhas++; console.log('  ✗ o contrato assinado não tem os anos negociados'); }
  }
}
console.log(`  negociações: ${resumo.negociou} — cederam ${resumo.cedeu}, mantiveram ${resumo.manteve}, retiraram ${resumo.retirou}`);
console.log('  motivos vistos:', Object.entries(resumo.motivos).map(([m, n]) => n + '× ' + m.slice(0, 50)).join(' | '));
/* quebra de contrato */
{
  const J = H.carregar();
  H.novaCarreira(J, { era:6, ano:2014, idade:27, rapido:true, modo:'realista' });
  J.run('S.contract.years = 3; Game.simSeason(); UI.limparFila(); UI.close(); Game.endSeason(); UI.limparFila(); UI.close();');
  J.run('S.academyOffers = null; S.lastSum = Engine.summary(S.season); Game.showOffers(S.lastSum); UI.limparFila();');
  ok(/Você tem contrato com a/.test(J.E('modal').innerHTML), 'o aviso de contrato em vigor aparece');
  const eq = J.run('S.team.name'), saldo = J.run('S.money.saldo');
  const ofs = J.run('S.pendingOffers');
  const i = ofs.findIndex(o => o.team && o.team.name !== eq && o.podeP !== false);
  if(i >= 0){
    J.run(`Game.takeOffer(${i}); UI.limparFila(); UI.close();`);
    ok(J.run('S.rompeu && S.rompeu.nome') === eq, 'trocar de equipe no meio do contrato registra a quebra');
    ok(J.run('S.money.saldo') < saldo + 1, 'a multa sai do caixa no modo realista');
  } else console.log('  (sem proposta de outra equipe para testar a quebra)');
}
console.log(falhas ? falhas + ' falha(s)' : 'mercado sem falhas');

if(typeof falhas !== 'undefined' && falhas) process.exitCode = 1;
