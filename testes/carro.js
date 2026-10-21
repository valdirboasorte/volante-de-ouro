/* O carro importa? O mesmo piloto em carros de níveis diferentes, e pilotos
   diferentes no mesmo carro, em temporadas inteiras de F1.
   Uso: node testes/carro.js [temporadas por caso=12] [ano=2010] [semente=7]
   Não modifica arquivos nem saves. */
const H = require('./base');

function temporada(ano, nivel, rank, seed){
  const J = H.carregar({ silencioso:true, seed });
  const eraIdx = J.run(`ERAS.reduce((k, e, i) => e.y <= ${ano} ? i : k, 0)`);
  H.novaCarreira(J, { era: eraIdx, ano, idade: 28, rapido: true });
  return J.run(`(() => {
    const top = Engine.topCat();
    S.catIdx = S.ladder.indexOf(top);
    for(const k in S.driver.attr){ S.driver.attr[k] = ${nivel}; S.driver.pot[k] = ${nivel}; }
    S.driver.ovr = Engine.ovr(S.driver.attr); S.driver.morale = 60;
    const times = Engine.teamsFor(top, S.year, S.series, S.catIdx, S.ladder.length).slice().sort((a, b) => b.str - a.str);
    const t = times[Math.min(times.length - 1, ${rank} - 1)];
    S.team = { id:t.id, name:t.name, color:t.color, str:t.str };
    S.season = Engine.buildSeason();
    S.season.minhaForma = 0; S.season._perfilado = true;
    S.season.field.forEach(f => { if(!f.isMe) Engine.perfilRival(f, S.season); });
    Game.simSeason(); UI.limparFila(); UI.close();
    const sum = Engine.summary(S.season);
    const tm = S.season.teammateId ? Engine.standings(S.season).findIndex(d => d.id === S.season.teammateId) + 1 : null;
    const melhorSkill = Math.max(...S.season.field.filter(f => !f.isMe).map(f => f.skill));
    return { pos: sum.pos, wins: sum.wins, champ: sum.champion, carros: times.length, str: t.str, top: times[0].str, tm, melhorSkill };
  })()`);
}

if(require.main === module){
  const N = +(process.argv[2] || 12), ano = +(process.argv[3] || 2010), semente = +(process.argv[4] || 7);
  console.log(`F1 ${ano}: ${N} temporadas por caso (piloto com todos os atributos no nível indicado)`);
  for(const nivel of [94, 86, 78]){
    for(const rank of [1, 3, 6, 9, 12]){
      const rs = [];
      for(let i = 0; i < N; i++){ try { rs.push(temporada(ano, nivel, rank, semente * 10000 + nivel * 100 + rank * 7 + i)); } catch(e){ console.log('ERRO', e.message.split('\n')[0]); } }
      if(!rs.length) continue;
      const m = f => rs.reduce((s, r) => s + f(r), 0) / rs.length;
      console.log(`piloto ${nivel} · ${rank}º carro (força ${rs[0].str} de ${rs[0].top}) · posição média ${m(r => r.pos).toFixed(1)}`
        + ` · títulos ${(m(r => r.champ ? 1 : 0) * 100).toFixed(0)}% · vitórias/temp ${m(r => r.wins).toFixed(1)} · companheiro ${m(r => r.tm || 0).toFixed(1)}º · melhor rival ${rs[0].melhorSkill}`);
    }
  }
}
module.exports = { temporada };
