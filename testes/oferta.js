/* O campeonato escrito na proposta é o campeonato da temporada.
   Um brasileiro em 2021 tem a F4 Italiana no degrau da F4; em 2022 a escada
   dele passa a ter a F4 Brasil. Quem assinou com uma equipe da F4 Italiana
   tem de correr a F4 Italiana — e quem assinou com a F4 Brasil, a F4 Brasil. */
const H = require('./base');
let falhas = 0;
const ok = (c, m) => { if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };

function assinar(cat){
  const J = H.carregar({ silencioso: true });
  H.novaCarreira(J, { era: 7, ano: 2021, idade: 15, cc: 'BR', rapido: true });
  J.run(`Game.simSeason(); UI.limparFila(); UI.close(); Game.endSeason(); UI.limparFila(); UI.close();
         S.academyOffers = null;
         const prox = S.year + 1, i = S.ladder.indexOf(${JSON.stringify(cat)});
         const idx = i >= 0 ? i : 3;
         const t = Engine.teamsFor(${JSON.stringify(cat)}, prox, S.series, idx, S.ladder.length)[0];
         S.pendingOffers = [{ type: 'f1', cat: ${JSON.stringify(cat)}, team: t, years: 1, up: true, note: 'teste' }];
         Game.takeOffer(0); UI.limparFila(); UI.close();`);
  return { ano: J.run('S.year'), cat: J.run('S.season.cat'), equipe: J.run('S.team && S.team.name'), ladder: J.run('S.ladder') };
}

{
  const r = assinar('Fórmula 4 Italiana');
  ok(r.ano === 2022 && r.cat === 'Fórmula 4 Italiana', `assinou F4 Italiana em 2021, corre ${r.cat} em ${r.ano} (${r.equipe})`);
}
{
  const r = assinar('Fórmula 4 Brasil');
  ok(r.ano === 2022 && r.cat === 'Fórmula 4 Brasil', `assinou F4 Brasil, corre ${r.cat} em ${r.ano}`);
}
{
  /* nas temporadas seguintes, a escolha continua valendo */
  const J = H.carregar({ silencioso: true });
  H.novaCarreira(J, { era: 7, ano: 2021, idade: 15, cc: 'BR', rapido: true });
  J.run(`Game.simSeason(); UI.limparFila(); UI.close(); Game.endSeason(); UI.limparFila(); UI.close();
         S.academyOffers = null;
         const t = Engine.teamsFor('Fórmula 4 Italiana', S.year + 1, S.series, 3, S.ladder.length)[0];
         S.pendingOffers = [{ type: 'f1', cat: 'Fórmula 4 Italiana', team: t, years: 1, up: true, note: 'teste' }];
         Game.takeOffer(0); UI.limparFila(); UI.close();`);
  let havia = false;
  const r = H.temporada(J, (ofs, S) => { const i = ofs.findIndex(o => o.cat === S.season.cat); havia = i >= 0; return i; });
  const cat = J.run('S.season.cat');
  /* campeão não recebe proposta para ficar: aí não há o que renovar */
  if(havia) ok(!r.fim && cat === 'Fórmula 4 Italiana', `renovou no mesmo campeonato e continua na ${cat}`);
  else console.log('  · campeão só recebe proposta para subir: renovação não testada nesta rodada');
}

{
  /* carreiras inteiras, nos anos em que a escada muda de forma (F4 nacional
     que nasce, Fórmula Ford que sai da escada em 2000, campeonato que acaba):
     o campeonato de cada proposta assinada é o da temporada seguinte */
  let assinadas = 0; const erradas = [];
  [['BR', 2020, 7], ['GB', 1998, 5], ['NL', 2017, 7], ['IT', 2009, 6], ['US', 1998, 5]].forEach(([cc, ano, era]) => {
    const J = H.carregar({ silencioso: true });
    H.novaCarreira(J, { era, ano, idade: 14, cc, rapido: true });
    J.run('Game._take = Game.takeOffer; Game.takeOffer = function(i){ const o = S.pendingOffers && S.pendingOffers[i]; _ass = o && !o.sk ? o.cat : null; return Game._take(i); };');
    for(let k = 0; k < 6; k++){
      const r = H.temporada(J);
      if(r.fim) break;
      const cat = J.run('typeof _ass !== "undefined" ? _ass : null'); if(!cat) continue;
      assinadas++;
      const agora = J.run('S.season.cat'), a = J.run('S.year');
      const mesmo = agora === cat || J.run(`(() => { const x = campDaCat(${JSON.stringify(agora)}, ${a}); return !!x && x === campDaCat(${JSON.stringify(cat)}, ${a}); })()`);
      if(!mesmo) erradas.push(`${cc} ${a}: ${cat} → ${agora}`);
      J.run('_ass = null;');
    }
  });
  ok(assinadas > 10 && !erradas.length, `${assinadas} propostas assinadas, todas corridas no campeonato escrito${erradas.length ? ' — erradas: ' + erradas.join('; ') : ''}`);
}

console.log(falhas ? falhas + ' falha(s)' : 'proposta: o campeonato assinado é o campeonato corrido');
if(falhas) process.exitCode = 1;
