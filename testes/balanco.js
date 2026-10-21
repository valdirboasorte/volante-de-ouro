/* Equilíbrio de carreiras inteiras, em lotes reproduzíveis.
   Uso: node testes/balanco.js [carreiras por grupo=20] [idades=8,12,15,18,22] [ano=2000] [semente=1]
   Um piloto automático joga cada carreira do começo ao fim: aceita a primeira
   academia, prefere subir rumo à F1 e, sem vaga de titular, aceita o papel de
   reserva. Mede potencial, chegada à F1, títulos e vitórias — por lote, nunca
   por uma carreira só. Não modifica arquivos nem saves. */
const H = require('./base');

function carreira(o, seed){
  const J = H.carregar({ silencioso:true, seed });
  const eraIdx = J.run(`ERAS.reduce((k, e, i) => e.y <= ${o.ano} ? i : k, 0)`);
  H.novaCarreira(J, { era: eraIdx, ano: o.ano, idade: o.idade, cc: o.cc || 'BR', rapido: true, serie: 'f1' });
  J.run(`S.dif = '${process.env.DIF || 'realista'}'`);
  const d0 = J.run('({ tal: S.driver.tal, pot: S.driver.pot, ovr: S.driver.ovr, gen: S.driver.geracional || null })');
  const potMed = p => Object.values(p).reduce((a, b) => a + b, 0) / Object.keys(p).length;
  const out = { idade0: o.idade, tal: d0.tal, pot0: potMed(d0.pot), potPace0: d0.pot.pace, potMax: potMed(d0.pot), ovrMax: d0.ovr,
    f1: 0, idadeF1: null, anosF1: 0, titF1: 0, vitF1: 0, titBase: 0, reserva: 0, campF2SemVaga: 0, fim: '',
    anosTop2: 0, titTop2: 0, anosMeio: 0, titMeio: 0 };
  for(let k = 0; k < 40; k++){
    if(J.run('S.retired')){ out.fim = 'aposentou'; break; }
    J.run('Game.simSeason(); UI.limparFila(); UI.close();');
    if(J.run('S.retired')){ out.fim = 'acabou'; break; }
    const top = J.run('S.season.isTop'), papel = J.run('(S.papel && S.papel.tipo) || null');
    /* a posição do carro no grid daquele ano: 1 = o mais forte */
    const rankCarro = J.run('(() => { const ts = S.season.teams || []; const me = S.team && S.team.str; return me == null ? 99 : 1 + ts.filter(t => t.id !== S.team.id && t.str > me).length; })()');
    J.run('Game.endSeason(); UI.limparFila(); UI.close();');
    const sum = J.run('S.history[S.history.length - 1]');
    if(papel){ out.reserva++; }
    else if(top){
      out.anosF1++; out.vitF1 += sum.wins || 0; if(sum.champion) out.titF1++;
      if(rankCarro <= 2){ out.anosTop2++; if(sum.champion) out.titTop2++; }
      else if(rankCarro <= 5){ out.anosMeio++; if(sum.champion) out.titMeio++; }
      if(out.idadeF1 == null) out.idadeF1 = J.run('S.driver.age') - 1;
      out.f1 = 1;
    } else if(sum.champion) out.titBase++;
    const p = J.run('S.driver.pot'), ovr = J.run('S.driver.ovr');
    out.potMax = Math.max(out.potMax, potMed(p)); out.ovrMax = Math.max(out.ovrMax, ovr);
    const campBase = !top && sum.champion && J.run('S.catIdx === S.ladder.length - 2');
    if((J.run('S.academyOffers') || []).length) J.run('S._acadList = S.academyOffers; S.academyOffers = null; Game.joinAcademy(0); UI.limparFila(); UI.close();');
    J.run('S.lastSum = Engine.summary(S.season); Game.showOffers(S.lastSum); UI.limparFila();');
    if(J.run('S.retired')){ out.fim = 'sem vaga'; break; }
    const ofs = J.run('S.pendingOffers || []');
    const topCat = J.run('Engine.topCat()');
    let melhor = -1, nota = -1e9;
    ofs.forEach((of, i) => {
      if(of.podeP === false || (of.sk && of.sk !== 'f1')) return;
      let v = of.team ? of.team.str : 0;
      if(of.cat === topCat && !of.papel) v += 100; else if(of.papel) v += 60; else if(of.up || of.pulo) v += 50;
      if(of.down) v -= 30;
      if(v > nota){ nota = v; melhor = i; }
    });
    if(campBase && !ofs.some(of => of.cat === topCat && !of.papel)) out.campF2SemVaga++;
    if(melhor < 0){ out.fim = 'nada cabia'; break; }
    J.run(`Game.takeOffer(${melhor}); UI.limparFila(); UI.close();`);
  }
  if(!out.fim) out.fim = 'limite';
  return out;
}

const taxa = (rs, t, a) => { const A = rs.reduce((s, r) => s + (r[a] || 0), 0); return A ? (rs.reduce((s, r) => s + (r[t] || 0), 0) / A * 100).toFixed(0) + '%' : '-'; };
function resumo(rot, rs){
  const n = rs.length, m = f => rs.reduce((s, r) => s + f(r), 0) / Math.max(1, n);
  const pct = f => (m(r => f(r) ? 1 : 0) * 100).toFixed(0) + '%';
  const f1 = rs.filter(r => r.f1);
  const ordenado = rs.map(r => r.titF1).sort((a, b) => b - a);
  console.log(`${rot.padEnd(12)} n=${n} | potencial ini ${m(r => r.pot0).toFixed(1)} máx ${m(r => r.potMax).toFixed(1)} | geracional(pot≥90) ${pct(r => r.potMax >= 90)} | OVR máx ${m(r => r.ovrMax).toFixed(0)}`
    + ` | chega F1 ${pct(r => r.f1)} idade ${f1.length ? (f1.reduce((s, r) => s + r.idadeF1, 0) / f1.length).toFixed(1) : '-'}`
    + ` | anos F1 ${m(r => r.anosF1).toFixed(1)} | títulos F1 média ${m(r => r.titF1).toFixed(2)} (≥1 ${pct(r => r.titF1 >= 1)}, ≥4 ${pct(r => r.titF1 >= 4)}, máx ${ordenado[0]})`
    + ` | vitórias F1 média ${m(r => r.vitF1).toFixed(1)} máx ${Math.max(...rs.map(r => r.vitF1))} | títulos base ${m(r => r.titBase).toFixed(1)} | reserva (anos) ${m(r => r.reserva).toFixed(1)} | campeão de acesso sem vaga ${m(r => r.campF2SemVaga).toFixed(2)}`
    + ` | carro top-2: ${rs.reduce((s, r) => s + r.anosTop2, 0)} anos, título ${taxa(rs, 'titTop2', 'anosTop2')}/ano | carro 3º-5º: ${rs.reduce((s, r) => s + r.anosMeio, 0)} anos, título ${taxa(rs, 'titMeio', 'anosMeio')}/ano`);
}

if(require.main === module){
  const N = +(process.argv[2] || 20);
  const idades = (process.argv[3] || '8,12,15,18,22').split(',').map(Number);
  const ano = +(process.argv[4] || 2000);
  const semente = +(process.argv[5] || 1);
  const todos = [];
  for(const idade of idades){
    const rs = [];
    for(let i = 0; i < N; i++){
      try { rs.push(carreira({ ano: ano - Math.max(0, idade - 8) * 0, idade }, semente * 100000 + idade * 1000 + i)); }
      catch(e){ console.log('ERRO idade', idade, i, e.message.split('\n')[0]); }
    }
    resumo(`idade ${idade}`, rs); todos.push(...rs);
  }
  resumo('TODAS', todos);
  /* por faixa de talento: o que se espera de cada uma */
  [[0, 72, 'pot <72'], [72, 78, 'pot 72-77'], [78, 84, 'pot 78-83'], [84, 89, 'pot 84-88'], [89, 100, 'pot 89+']].forEach(([a, b, rot]) => {
    const g = todos.filter(r => r.pot0 >= a && r.pot0 < b);
    if(g.length) resumo(rot, g);
  });
  /* idade e OVR de quem estreou */
  const f1 = todos.filter(r => r.f1);
  if(f1.length) console.log('estreia: idades', JSON.stringify(f1.map(r => r.idadeF1).sort((a, b) => a - b)));
}
module.exports = { carreira, resumo };
