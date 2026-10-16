/* Piloto machucado não para o campeonato.
   — com você fora, a corrida acontece: os outros pontuam e o vencedor aparece no resultado;
   — o mesmo vale na temporada simulada;
   — lesão da reta final do ano não atravessa as férias (a do inverno, sim). */
const H = require('./base');
let falhas = 0;
const ok = (c, m) => { if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };
const somaPts = J => J.run('Object.keys(S.season.dstand).filter(k => k !== "ME").reduce((a, k) => a + S.season.dstand[k], 0)');

{
  const J = H.carregar({ silencioso: true });
  H.novaCarreira(J, { era: 7, ano: 2023, idade: 24, rapido: false });
  J.run('S.driver.injured = 2;');
  const rd0 = J.run('S.season.round'), outros0 = somaPts(J), meus0 = J.run('S.season.dstand.ME || 0');
  J.run('Game.nextRace(); UI.limparFila(); UI.close();');
  const rec = J.run('S.season.results[S.season.results.length - 1]');
  ok(J.run('S.season.round') === rd0 + 1, 'machucado: a rodada anda');
  ok(rec.dnf === 'LES' && rec.pos == null, 'machucado: você aparece como lesionado no resultado');
  ok(rec.top.length >= 3 && rec.top.every(t => !t.me), `os outros correm (vitória de ${rec.top[0] && rec.top[0].n})`);
  ok(somaPts(J) > outros0, 'os outros pilotos marcam pontos no campeonato');
  ok((J.run('S.season.dstand.ME || 0')) === meus0, 'você não marca ponto sem correr');
  ok(J.run('S.driver.injured') === 1, 'falta uma corrida de recuperação');
  J.run('Game.nextRace(); UI.limparFila(); UI.close();');
  ok(J.run('S.driver.injured') === 0, 'recuperado depois de duas corridas');
}
{
  const J = H.carregar({ silencioso: true });
  H.novaCarreira(J, { era: 7, ano: 2023, idade: 24, rapido: true });
  J.run('S.driver.injured = 3;');
  J.run('Game.simSeason(); UI.limparFila(); UI.close();');
  const les = J.run('S.season.results.filter(r => r.dnf === "LES")');
  ok(les.length >= 3 && les.every(r => r.top.length >= 3), `temporada simulada: ${les.length} corridas sem você, todas com resultado`);
  const cheio = J.run('(() => { const n = S.season.results.length; const p = Object.keys(S.season.porCorrida || {}).filter(k => k !== "ME").map(k => S.season.porCorrida[k].length); return { n, max: Math.max(...p) }; })()');
  ok(cheio.max === cheio.n, `cada rodada conta para os outros (${cheio.max} de ${cheio.n})`);
}
{
  /* bateu na última corrida: as férias curam */
  let curou = 0, tentativas = 0;
  for(let k = 0; k < 4; k++){
    const J = H.carregar({ silencioso: true });
    H.novaCarreira(J, { era: 7, ano: 2023, idade: 24, rapido: true });
    J.run('Game.simSeason(); UI.limparFila(); UI.close(); S.driver.injured = 1;');
    const r = H.temporada(J);
    if(r.fim) continue;
    tentativas++;
    /* o que sobrar de lesão só pode ter vindo do próprio inverno */
    const inverno = J.run('(S.invernoNotas || []).reduce((a, x) => a + ((x.e && x.e.lesao) || 0), 0)');
    if(J.run('S.driver.injured') === inverno) curou++;
  }
  ok(tentativas > 0 && curou === tentativas, `lesão do fim do ano não atravessa as férias (${curou} de ${tentativas})`);
}

console.log(falhas ? falhas + ' falha(s)' : 'lesão: o campeonato anda sem você');
if(falhas) process.exitCode = 1;
