/* Clique duplo nos botões que avançam o jogo não pode pular ano nem correr duas vezes */
const H = require('./base');
let falhas = 0;
const ok = (c, m) => { if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };
{
  const J = H.carregar();
  H.novaCarreira(J, { era:7, ano:2024, idade:20, rapido:true });
  J.run('Game.simSeason(); UI.limparFila(); UI.close(); Game.endSeason(); UI.limparFila(); UI.close();');
  J.run('S.academyOffers = null; S.lastSum = Engine.summary(S.season); Game.showOffers(S.lastSum); UI.limparFila();');
  const ano = J.run('S.year');
  const i = J.run('S.pendingOffers.findIndex(o => o.podeP !== false)');
  J.run(`Game.takeOffer(${i}); Game.takeOffer(${i});`);
  ok(J.run('S.year') === ano + 1, 'modo piloto: assinar duas vezes avança um ano só');
}
{
  const J = H.carregar();
  J.run(`Chefe.novo({ modo:'criar', ano:2018, chefe:{ nome:'T', cc:'BR' }, eq:{ nome:'Teste', cor:'#123456', cc:'BR' } });
         UI.show = () => {}; UIC.render = () => {};
         while(Chefe.titulares().filter(p => !p.venceu).length < 2) Chefe.assinar(C.inv.mercado[0], { sal:1, anos:2, n1:false, papel:'titular' }, 1);
         if(!C.motor.nome) Chefe.escolherMotor(Chefe.motorObrigado().nome, 2);`);
  const caixa0 = J.run('C.caixa');
  J.run('UIC.comecar(); UI.close(); UIC.comecar();');
  ok(J.run('C.temporada.round') === 0 && J.run('C.fase') === 'temporada', 'modo chefe: começar duas vezes não reinicia a temporada');
  const gasto = caixa0 - J.run('C.caixa');
  J.run('UI.close();');
  J.run('UIC.preCorrida(); UIC.largar(); UIC.largar();');
  ok(J.run('C.temporada.round') === 1, 'modo chefe: largar duas vezes corre uma corrida só');
  J.run('UI.close(); while(C.temporada.round < C.temporada.calendar.length){ const r = Chefe.correr(); delete r.tl; }');
  J.run('UIC.fimTemporada();');
  const ano = J.run('C.ano');
  J.run('C.balanco.falencia = null; C.balanco.estouro = null; C.balanco.aval = null; UIC.aposBalanco(); UIC.aposBalanco();');
  ok(J.run('C.ano') === ano + 1, 'modo chefe: "Seguir" duas vezes passa um ano só');
  J.run('UIC.falencia(); UIC.teto();');
  ok(true, 'janela de falência e de teto sem falência nem teto não quebram');
}
console.log(falhas ? falhas + ' falha(s)' : 'clique duplo: tudo protegido');

if(typeof falhas !== 'undefined' && falhas) process.exitCode = 1;
