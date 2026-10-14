/* Tamanho do save em carreiras longas, e se ele reabre */
const H = require('./base');
for(const [rot, o] of [['piloto 1990, 25 anos', { era:4, ano:1990, idade:14 }], ['piloto 2020, 25 anos', { era:7, ano:2020, idade:14 }]]){
  const store = {};
  const J = H.carregar({ store });
  H.novaCarreira(J, Object.assign({ rapido:true }, o));
  let anos = 0;
  for(; anos < 25; anos++){ const r = H.temporada(J); if(r.fim) break; }
  J.run('Game.save()');
  const tam = (store.vdo_save || '').length;
  const W = J.run('JSON.stringify(S.mundos || {}).length');
  const N = H.carregar({ store });
  N.run('Game.continueSave(); UI.limparFila(); UI.close();');
  console.log(`${rot}: ${anos} temporadas, save ${(tam / 1024).toFixed(0)} KB (mundo ${(W / 1024).toFixed(0)} KB, ${J.run('Object.keys(S.mundos.f1.p).length')} pilotos no registro), reabre: ${N.run('!!(S && S.season)')}`);
}
{
  const J = H.carregar();
  J.run(`Chefe.novo({ modo:'base', ano:2015, cat:'Fórmula 4 Britânica', chefe:{ nome:'T', cc:'GB' }, eq:{ nome:'Teste', cor:'#123456', cc:'GB' } })`);
  for(let a = 0; a < 25; a++){
    J.run(`while(Chefe.titulares().filter(p => !p.venceu).length < 2 && C.inv.mercado.length) Chefe.assinar(C.inv.mercado[0], { sal:1, anos:1, n1:false, papel:'titular' }, 1);
           if(Chefe.ehF1() && !C.motor.proprio && !C.motor.nome) Chefe.escolherMotor(Chefe.motorObrigado().nome, 1);
           if(C.inv.subir && C.inv.subir.ok) Chefe.subir(true);
           if(Chefe.ehF1() && !C.motor.proprio && !C.motor.nome) Chefe.escolherMotor(Chefe.motorObrigado().nome, 1);
           while(Chefe.titulares().filter(p => !p.venceu).length < 2 && C.inv.mercado.length) Chefe.assinar(C.inv.mercado[0], { sal:1, anos:1, n1:false, papel:'titular' }, 1);
           Chefe.comecarTemporada();
           while(C.temporada.round < C.temporada.calendar.length){ const r = Chefe.correr(); delete r.tl; }
           var bb = Chefe.fimDeTemporada(); if(bb.falencia) Chefe.resgatar(); C.balanco.estouro = null; Chefe.proximoAno();`);
  }
  const tam = J.run('JSON.stringify(C).length');
  console.log(`chefe 2015, 25 anos: save ${(tam / 1024).toFixed(0)} KB (mundo ${(J.run('JSON.stringify(C.W).length') / 1024).toFixed(0)} KB), categoria final ${J.run('C.cat')}`);
}
