/* Regras do campeonato: pontos, construtores, desempate, tabela ao vivo e histórico */
const H = require('./base');
const casos = [
  ['f1', 1955], ['f1', 1975], ['f1', 1988], ['f1', 2008], ['f1', 2024], ['f1', 2025], ['f1', 2030],
  ['indy', 1985], ['indy', 1999], ['indy', 2015], ['nascar', 1990], ['nascar', 2005], ['nascar', 2012], ['nascar', 2015], ['nascar', 2020],
  ['wec', 2012], ['stock', 2015], ['dtm', 2005], ['fe', 2022]
];
let falhas = 0, corridas = 0;
const falha = (c, m) => { falhas++; if(falhas < 40) console.log('  ✗ ' + c + ': ' + m); };
for(const [sk, ano] of casos){
  const J = H.carregar();
  const eraIdx = J.run(`ERAS.reduce((k, e, i) => e.y <= ${ano} ? i : k, 0)`);
  H.novaCarreira(J, { era: eraIdx, ano, idade: 29, serie: sk, rapido:true });
  const rot = `${sk} ${ano}`;
  const sea0 = J.run('S.season');
  if(!sea0.isTop){ console.log(`  (${rot}: começou fora da principal, em ${sea0.cat})`); }
  const res = JSON.parse(J.run(`JSON.stringify((function(){
    const sea = S.season, P = sea.pts, out = { erros:[], n:0 };
    const somaD = () => Object.values(sea.dstand).reduce((a, b) => a + b, 0);
    const somaC = () => Object.values(sea.cstand).reduce((a, b) => a + b, 0);
    while(sea.round < sea.calendar.length){
      const antesD = somaD(), antesC = somaC();
      const trk = sea.calendar[sea.round];
      const rec = Engine.runRace(sea);
      Game.tally(rec);
      out.n++;
      const dD = somaD() - antesD, dC = somaC() - antesC;
      if(Math.abs(dD - dC) > .001) out.erros.push('GP ' + rec.gp + ': pilotos ' + dD + ' x construtores ' + dC);
      const mult = trk.dbl ? 2 : 1;
      const maxPts = P.p.reduce((a, b) => a + b, 0) * mult + (P.fl ? (typeof P.fl === 'number' ? P.fl : 1) : 0) + (P.pole ? (typeof P.pole === 'number' ? P.pole : 1) : 0)
        + (P.etapas ? [1,2,3,4,5,6,7,8,9,10].reduce((a, k) => a + Math.round((11 - k) * 1.6), 0) : 0);
      if(dD > maxPts + .001 && !sea.playoff) out.erros.push('GP ' + rec.gp + ': ' + dD + ' pontos distribuídos, máximo ' + maxPts);
      /* o jogador: posição, pontos e a tabela ao vivo terminando no mesmo lugar */
      if(rec.pos != null){
        const pts = (rec.pos <= P.p.length ? P.p[rec.pos - 1] * mult : 0);
        if(rec.pts < pts) out.erros.push('GP ' + rec.gp + ': ' + rec.pos + 'º valeu ' + rec.pts + ', a tabela dá ' + pts);
        if(rec.tl){
          const ult = rec.tl.voltas[rec.tl.voltas.length - 1].ordem;
          if(ult.indexOf('ME') + 1 !== rec.pos) out.erros.push('GP ' + rec.gp + ': ao vivo terminou ' + (ult.indexOf('ME') + 1) + 'º, resultado ' + rec.pos + 'º');
        }
      } else if(rec.dnf){
        /* quem abandona não pontua — a não ser o ponto da pole, onde o regulamento dá (IndyCar) */
        const pole = P.pole && rec.grid === 1 ? (typeof P.pole === 'number' ? P.pole : 1) : 0;
        if(rec.pts > pole) out.erros.push('GP ' + rec.gp + ': abandonou e pontuou ' + rec.pts);
      }
      const top = rec.top.map(t => t.pos).filter(x => x != null);
      for(let i = 1; i < top.length; i++) if(top[i] !== top[i - 1] + 1) { out.erros.push('GP ' + rec.gp + ': posições do top 10 fora de ordem ' + top.join(',')); break; }
      if(rec.top.length && rec.top[0].pos !== 1 && rec.top[0].pos != null) out.erros.push('GP ' + rec.gp + ': ninguém em 1º');
    }
    /* classificação: ordenada por pontos, com desempate por contagem */
    const st = Engine.standings(sea);
    if(!sea.playoff) for(let i = 1; i < st.length; i++) if(st[i].pts > st[i - 1].pts) { out.erros.push('classificação fora de ordem na posição ' + (i + 1)); break; }
    const empatados = st.filter((d, i) => i && d.pts === st[i - 1].pts && d.pts > 0).length;
    out.empates = empatados;
    const meuSt = st.find(d => d.me);
    if(!sea.playoff && meuSt && Math.abs(meuSt.pts - ptsValidos(sea, 'ME')) > .001) out.erros.push('pontos do jogador na tabela ≠ pontos válidos');
    /* só os melhores resultados contam, onde o regulamento manda */
    if(P.melhores) st.forEach(d => { if(d.pts > (sea.dstand[d.id] || 0) + .001) out.erros.push(d.name + ': pontos válidos acima do total'); });
    /* na F1 de 2025 em diante a volta mais rápida não vale ponto */
    if(sea.year >= 2025 && S.series === 'f1' && P.fl) out.erros.push('volta mais rápida ainda pontua em ' + sea.year);
    /* NASCAR: todo o grid pontua; desde 2014 o campeão termina entre 5000 e 5100 */
    if(S.series === 'nascar' && P.p.length < sea.field.length) out.erros.push('só ' + P.p.length + ' de ' + sea.field.length + ' pontuam');
    if(S.series === 'nascar' && sea.year >= 2014 && sea.playoff && sea.playoff.campeao){
      const pc = Engine.ptsDe(sea, sea.playoff.campeao);
      if(pc < 5000 || pc > 5100) out.erros.push('campeão da NASCAR com ' + pc + ' pontos');
    }
    const somaRes = sea.results.reduce((a, r) => a + (r.pts || 0), 0);
    if(!sea.playoff && Math.abs(somaRes - (sea.dstand.ME || 0)) > .001) out.erros.push('soma do retrospecto ' + somaRes + ' ≠ campeonato ' + (sea.dstand.ME || 0));
    const cons = Engine.constructors(sea);
    for(let i = 1; i < cons.length; i++) if(cons[i].pts > cons[i - 1].pts) { out.erros.push('construtores fora de ordem'); break; }
    out.campeao = st[0].name; out.ptsCampeao = st[0].pts; out.playoff = !!sea.playoff;
    return out;
  })())`));
  corridas += res.n;
  res.erros.forEach(e => falha(rot, e));
  /* o histórico salvo bate com o que foi corrido */
  J.run('Game.endSeason(); UI.limparFila(); UI.close();');
  const arq = JSON.parse(J.run('JSON.stringify(S.archive[S.archive.length - 1])'));
  const sea = J.run('S.season');
  if(arq.results.length !== sea.results.length) falha(rot, 'arquivo com ' + arq.results.length + ' corridas, temporada com ' + sea.results.length);
  const hist = J.run('S.history[S.history.length - 1]');
  const validos = J.run('ptsValidos(S.season, "ME")');
  if(hist.pts !== validos && !sea.playoff) falha(rot, 'histórico ' + hist.pts + ' pts, campeonato ' + validos);
  console.log(`  ${rot.padEnd(12)} ${sea.cat.padEnd(26)} ${res.n} corridas · campeão ${res.campeao} (${res.ptsCampeao})${res.playoff ? ' · playoff' : ''}${res.empates ? ' · ' + res.empates + ' empate(s) resolvidos' : ''}`);
}
/* As categorias de base de quem faz carreira na NASCAR: o playoff da Copa
   não pode vazar para elas, o kart pontua como kart e a Busch/Xfinity
   usa a tabela da Copa da época. */
for(const ano of [2008, 2012, 2020]){
  const J = H.carregar();
  const eraIdx = J.run(`ERAS.reduce((k, e, i) => e.y <= ${ano} ? i : k, 0)`);
  H.novaCarreira(J, { era: eraIdx, ano, idade: 13, serie: 'nascar', rapido: false });
  const escada = J.run('S.ladder');
  escada.slice(0, -1).forEach((cat, idx) => {
    const r = JSON.parse(J.run(`JSON.stringify((function(){
      S.year = ${ano}; S.catIdx = ${idx}; S.catAlvo = ${JSON.stringify(cat)}; S.team = null;
      S.season = Engine.buildSeason();
      Game.simSeason(); UI.limparFila(); UI.close();
      const sea = S.season, st = Engine.standings(sea);
      return { cat: sea.cat, n: sea.results.length, cal: sea.calendar.length, playoff: !!sea.playoff,
               p: sea.pts.p, mel: sea.pts.melhores || 0, campeao: st[0].pts };
    })())`));
    const rot = `nascar ${ano} ${r.cat}`;
    corridas += r.n;
    if(r.playoff) falha(rot, 'abriu o playoff da Copa');
    if(/Kart/.test(r.cat)){
      if(r.p.join('-') !== '25-20-16-13-11-10-9-8-7-6-5-4-3-2-1') falha(rot, 'tabela do kart ' + r.p.join('-'));
      if(r.mel !== r.cal - 1) falha(rot, 'descarte: valem ' + r.mel + ' de ' + r.cal);
      if(r.campeao > 25 * r.mel) falha(rot, 'campeão com ' + r.campeao + ' pontos em ' + r.mel + ' resultados válidos');
    } else if(/^(Busch|Xfinity) Series$/.test(r.cat)){
      const copa = J.run(`pointsFor(${ano}, 'nascar').p.join('-')`);
      if(r.p.join('-') !== copa) falha(rot, 'não usa a tabela da Copa');
    } else if(r.campeao > r.p[0] * r.cal + 30) falha(rot, 'campeão com ' + r.campeao + ' pontos em ' + r.cal + ' corridas');
    console.log(`  ${rot.padEnd(34)} ${r.n} corridas · campeão com ${r.campeao}`);
  });
}
console.log(`\n${corridas} corridas verificadas, ${falhas} problema(s)`);

if(typeof falhas !== 'undefined' && falhas) process.exitCode = 1;
