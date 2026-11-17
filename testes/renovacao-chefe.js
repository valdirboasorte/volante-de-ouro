/* Renovar o contrato de quem já estava na equipe assumida (Senna e Prost na McLaren
   de 1988) não pode virar salário NaN: o pedido só existia para quem veio do mercado,
   e o NaN contaminava o caixa da equipe (assets/correcoes-chefe.js). */
const { carregar } = require('./base');
const J = carregar({ silencioso: true, seed: 5 });
J.run(require('./chefe-comum'));
let falhas = 0;
const ok = (c, m) => { if(!c){ falhas++; console.log('FALHOU:', m); } };
J.run(`(() => { const era = eraOfSeries(1988, 'f1'), idx = era.teams.findIndex(t => /McLaren/.test(t[0]));
  Chefe.novo({ modo:'assumir', sk:'f1', ano:1988, idx, chefe:{ nome:'T', cc:'BR' }, realismo:true }); })()`);
J.run('__temporada(); Chefe.proximoAno(); UI.limparFila(); UI.close();');
const r = JSON.parse(J.run(`JSON.stringify((() => {
  const p = C.pilotos.find(x => x.venceu);
  if(!p) return null;
  UIC.negociar(p.id); UI.close();
  const tela = Number.isFinite(p.pede);
  Chefe.assinar(p, { sal:1, anos:2, n1:false, papel:p.papel }, 1);
  const caixa0 = C.caixa;
  __temporada();
  return { nome:p.nome, tela, sal:p.sal, ate:p.ate, caixa:C.caixa, caixa0 };
})())`));
ok(r, 'algum titular da McLaren de 1988 com contrato vencido no inverno de 1989');
if(r){
  ok(r.tela, `${r.nome}: a tela de renovação tem o pedido de salário`);
  ok(Number.isFinite(r.sal) && r.sal > 0, `${r.nome}: salário renovado é um número (${r.sal})`);
  ok(r.ate === 1990, `${r.nome}: contrato renovado até 1990 (${r.ate})`);
  ok(Number.isFinite(r.caixa), `o caixa da equipe continua um número depois de uma temporada (${r.caixa})`);
}
/* titular sem superlicença (Leclerc em 2016) com a equipe já tendo reserva: o cartão
   oferece passar a reserva e correr na F2 pela academia; a academia não o devolve a titular */
{
  const J2 = carregar({ silencioso: true, seed: 7 });
  const r2 = JSON.parse(J2.run(`JSON.stringify((() => {
    const era = eraOfSeries(2016, 'f1'), idx = era.teams.findIndex(t => /Sauber/.test(t[0]));
    Chefe.novo({ modo:'assumir', sk:'f1', ano:2016, idx, chefe:{ nome:'T', cc:'BR' }, realismo:true });
    const sai = Chefe.titulares()[0];
    const lec = Chefe.pilotoReal('Leclerc', 2016, { papel:'titular', carro: sai.carro, ate: 2018, sal: 5e5 });
    C.pilotos.splice(C.pilotos.indexOf(sai), 1, lec);
    if(!Chefe.pilotoDe('teste')) C.pilotos.push(Chefe.pilotoReal('Giovinazzi', 2016, { papel:'teste', ate: 2018, sal: 3e5 }));
    const q = String.fromCharCode(39);
    const html = CorrecoesChefe.cartoesSemLicenca('<div class="ch-card"><button class="ch-opt rd" onclick="UIC.dispensar(' + q + lec.id + q + ')">Dispensar</button></div>');
    const bloqueado = Chefe.pendencias().some(x => /Leclerc sem superlicença/.test(x));
    CorrecoesChefe.paraF2(lec.id);
    const papelF2 = lec.papel;
    UIC.acad(lec.id, 'titular');
    return { bloqueado, reserva: html.indexOf("UIC.rebaixar('" + lec.id + "')") >= 0, f2: html.indexOf('CorrecoesChefe.paraF2') >= 0,
      papelF2, papelDepois: lec.papel, livre: !Chefe.pendencias().some(x => /superlicença/.test(x)) };
  })())`));
  ok(r2.bloqueado, 'Leclerc em 2016 sem superlicença trava a temporada como titular');
  ok(r2.reserva && r2.f2, 'o cartão dele oferece passar a reserva e correr na F2, mesmo com a equipe já tendo reserva');
  ok(r2.papelF2 === 'academia' && r2.papelDepois === 'academia', `vai para a academia e a academia não o devolve a titular sem licença (${r2.papelF2}/${r2.papelDepois})`);
  ok(r2.livre, 'sem ele como titular, a superlicença deixa de travar a temporada');
}

/* menos toques nas corridas ao vivo do chefe; a corrida do piloto não muda */
{
  const conta = (gestao) => {
    const J3 = carregar({ silencioso: true, seed: 9 });
    J3.run(require('./chefe-comum'));
    return JSON.parse(J3.run(`JSON.stringify((() => {
      const era = eraOfSeries(2018, 'f1'), idx = era.teams.findIndex(t => /Ferrari/.test(t[0]));
      Chefe.novo({ modo:'assumir', sk:'f1', ano:2018, idx, chefe:{ nome:'T', cc:'BR' }, realismo:true }); __inverno(); Chefe.comecarTemporada();
      let toques = 0, n = 0;
      for(let k = 0; k < 6; k++){ UIC._M = null; const ent = UIC.entradaDaEtapa(); ent.gestao = ${gestao}; const R = Gp.criar(ent); const ev = R.evento;
        R.evento = function(t){ if(t === 'toque') toques++; return ev.apply(this, arguments); }; try { Gp.terminar(R); } catch(e){} n++; UIC._M = null; Chefe.correr(); }
      return { porCorrida: toques / n };
    })())`));
  };
  const chefe = conta(true);
  ok(chefe.porCorrida <= 8, `F1 2018 no chefe: ${chefe.porCorrida.toFixed(1)} toques por corrida (eram uns 14)`);
  ok(JSON.parse(J.run('JSON.stringify(CorrecoesChefe.CORTE_TOQUE)')) > 0, 'o corte vale só com o muro gerenciando (ent.gestao)');
}

if(falhas){ console.log(falhas + ' falha(s)'); process.exitCode = 1; }
else console.log('correções do chefe (renovação, superlicença, toques): ok');
