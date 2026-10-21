/* A porta da categoria principal e a carreira de reserva.
   — campeão da F2 não tem vaga garantida (e às vezes não tem nenhuma);
   — com todos os assentos contratados, ninguém cria vaga para o jogador;
   — o piloto rápido entra quando existe oportunidade;
   — o jovem excepcional interessa mais que o campeão tardio;
   — reserva e testes aparecem sem promoção garantida;
   — substituição de titular: o reserva larga, pontua e volta ao box;
   — o acadêmico da F2 é chamado pela equipe-mãe e volta para a F2;
   — a "última porta aberta no grid" não existe mais.
   Uso: node testes/mercado-topo.js   Não modifica arquivos nem saves. */
const H = require('./base');
let falhas = 0, n = 0;
const ok = (c, m) => { n++; if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };

/* um piloto no último degrau de acesso, depois de uma temporada */
function noAcesso(seed, o){
  const J = H.carregar({ silencioso:true, seed });
  H.novaCarreira(J, { era: o.era || 7, ano: o.ano, idade: o.idade, cc: 'BR', rapido: true });
  J.run(`(() => {
    const topo = Engine.topCat(), it = S.ladder.indexOf(topo);
    S.catIdx = it - 1; S.catAlvo = S.ladder[S.catIdx]; S.team = null;
    S.season = Engine.buildSeason();
    for(const k in S.driver.attr){ S.driver.attr[k] = ${o.ovr}; S.driver.pot[k] = ${o.pot || o.ovr}; }
    S.driver.ovr = Engine.ovr(S.driver.attr); S.driver.alcance = 1; S.driver.fame = ${o.fama || 40};
    S.driver.age = ${o.idade};
    /* a trajetória: anos no acesso */
    S.history = [];
    for(let k = ${o.anosAcesso || 1}; k >= 1; k--) S.history.push({ year: S.year - k + 1, cat: S.season.cat, pos: ${o.pos || 1}, races: 12, champion: k === 1 && ${o.pos || 1} === 1, wins: 4 });
  })()`);
  return J;
}
const somaFalsa = o => `({ pos:${o.pos || 1}, champion:${(o.pos || 1) === 1}, wins:${o.wins || 5}, podiums:8, races:12, tmWins:${o.tm != null ? o.tm : 8}, tmRaces:12 })`;

{
  /* 1. campeão da F2 (78, 21 anos) — vários mundos, 2021 → 2022 */
  let com = 0, sem = 0, reserva = 0, motivo = false; const N = 30;
  for(let i = 0; i < N; i++){
    const J = noAcesso(1000 + i, { ano: 2021, idade: 21, ovr: 78, pot: 82 });
    const r = J.run(`(() => { const m = Engine.mercadoTopo(${somaFalsa({})}); return { t: m.titulares.length, p: Engine.ofertasPapel(${somaFalsa({})}, m).length, mot: m.motivos.length }; })()`);
    if(r.t) com++; else sem++;
    if(r.p) reserva++;
    if(r.mot) motivo = true;
  }
  ok(sem > 0 && com > 0, `campeão da F2 de 2021: vaga de titular em ${com} de ${N} mundos, sem vaga em ${sem}`);
  ok(reserva > 0, `quando não há vaga, aparecem propostas de reserva/testes (${reserva} de ${N})`);
  ok(motivo, 'as equipes que não chamaram explicam o porquê');
}
{
  /* 2. todos os assentos contratados (mundo depois de 2026) */
  const J = noAcesso(77, { ano: 2031, idade: 21, ovr: 78, pot: 82 });
  const r = J.run(`(() => {
    const W = Engine.garantirMundo(S.series);
    Mundo.noDegrau(W, 0).forEach(x => x.ate = S.year + 6);
    const m = Engine.mercadoTopo(${somaFalsa({})});
    const v = Engine.vagasTopo(S.year + 1);
    return { titulares: m.titulares.length, vagas: Object.values(v).reduce((a, x) => a + x.vagas.length, 0), motivos: m.motivos.map(x => x.m) };
  })()`);
  ok(r.vagas === 0, `com todos os contratos em vigor não há vaga aberta (${r.vagas})`);
  ok(r.titulares === 0, `e o campeão da F2 (78) não recebe vaga de titular (${r.titulares})`);
  ok(r.motivos.some(m => /titulares|contratos/.test(m)), 'o motivo é dito: as equipes mantiveram os titulares');
}
{
  /* 3. o piloto rápido entra quando existe oportunidade; 4. jovem excepcional x campeão tardio */
  let rapido = 0, tardio = 0, jovem = 0; const N = 24;
  for(let i = 0; i < N; i++){
    const A = noAcesso(3000 + i, { ano: 2021, idade: 20, ovr: 88, pot: 92 });
    if(A.run(`Engine.mercadoTopo(${somaFalsa({ wins: 7 })}).titulares.length`) > 0) rapido++;
    const T = noAcesso(4000 + i, { ano: 2021, idade: 27, ovr: 79, pot: 79, anosAcesso: 5 });
    if(T.run(`Engine.mercadoTopo(${somaFalsa({})}).titulares.length`) > 0) tardio++;
    const Y = noAcesso(5000 + i, { ano: 2021, idade: 19, ovr: 79, pot: 90, anosAcesso: 1 });
    if(Y.run(`Engine.mercadoTopo(${somaFalsa({})}).titulares.length`) > 0) jovem++;
  }
  ok(rapido >= N * .7, `campeão rápido (88) encontra vaga na maioria dos mundos (${rapido} de ${N})`);
  ok(jovem > tardio, `jovem excepcional (19 anos) interessa mais que o campeão tardio (27 anos, 5 temporadas no acesso): ${jovem} x ${tardio} de ${N}`);
}
{
  /* 5. sem "última porta": um piloto lento demais não ganha vaga de consolação */
  let titular = 0, livre = 0; const N = 12;
  for(let i = 0; i < N; i++){
    const J = noAcesso(6000 + i, { ano: 2021, idade: 23, ovr: 64, pot: 66, pos: 6 });
    J.run(`S.lastSum = ${somaFalsa({ pos: 6 })}; S.season.isTop = false;`);
    const ofs = J.run(`(() => { const sum = ${somaFalsa({ pos: 6 })}; return Engine.offers(sum).map(o => ({ cat:o.cat, papel:o.papel || null, livre:!!o.livre })); })()`);
    if(ofs.some(o => o.cat === 'Fórmula 1' && !o.papel && !o.livre)) titular++;
    if(ofs.some(o => o.livre)) livre++;
  }
  ok(titular === 0, `piloto lento (64) não recebe vaga de titular por consolação (${titular} de ${N})`);
}
{
  /* 6. reserva: aceitar, viver a temporada, ser chamado para substituir */
  const J = noAcesso(91, { ano: 2021, idade: 21, ovr: 78, pot: 82 });
  J.run(`(() => {
    const topo = Engine.topCat(), it = S.ladder.indexOf(topo);
    const t = Engine.teamsFor(topo, S.year + 1, S.series, it, S.ladder.length).find(x => x.name === 'Ferrari') || Engine.teamsFor(topo, S.year + 1, S.series, it, S.ladder.length)[0];
    S.lastSum = ${somaFalsa({})};
    S.pendingOffers = [{ type:'f1', cat: topo, team: t, years: 1, papel: 'reserva', note: 'teste', promessas: [] }];
    Game.takeOffer(0); UI.limparFila(); UI.close();
  })()`);
  const st = J.run(`({ papel: S.papel && S.papel.tipo, equipe: S.papel && S.papel.equipe, top: S.season.isTop, ausente: Engine.meAusente(S.season),
    noGrid: S.season.field.filter(f => f.teamId === S.team.id && !f.isMe).length })`);
  ok(st.papel === 'reserva' && st.top && st.ausente && st.noGrid === 2, `reserva da ${st.equipe}: na categoria principal, fora do grid, com os dois titulares da equipe (${st.noGrid})`);
  /* um fim de semana de reserva, pelo caminho do jogador */
  J.run(`S.opts.fast = false; S.driver.injured = 0; UI.limparFila(); UI.close(); Game.nextRace();`);
  const tela = J.run(`document.getElementById('modal').innerHTML`);
  ok(/O que fazer neste fim de semana/.test(tela) && /Metas da temporada/.test(tela), 'o fim de semana do reserva mostra metas e atividades');
  J.run(`UI.limparFila(); UI.close(); Game.atividadePapel(Engine.atividadesPapel(S.season)[0]); UI.limparFila(); UI.close();`);
  const depois = J.run(`({ round: S.season.round, res: S.season.results[0].dnf, gps: S.career.gps, prog: S.papel.prog })`);
  ok(depois.round === 1 && depois.res === 'RES' && !depois.gps, 'a corrida acontece sem ele: inscrição como reserva, sem contar largada');
  /* substituição forçada */
  const sub = J.run(`(() => {
    Engine.chanceAusencia = () => 1;
    const conv = Engine.checarConvocacao(S.season);
    if(!conv) return null;
    Engine.iniciarSubstituicao(S.season, conv);
    Engine.chanceAusencia = () => 0;
    let rec, k = 0, largadas = 0;
    while(S.season.subst && k++ < 5){ rec = Engine.runRace(S.season); Game.tally(rec); if(Engine.largou(rec)) largadas++; Engine.fimDaSubstituicao(S.season, rec); }
    return { nome: conv.nome, largou: largadas > 0, corridas: conv.corridas, largadas, pos: rec.pos, gps: S.career.gps, ausente: Engine.meAusente(S.season), titular: !S.season.field.find(f => f.name === conv.nome).ausente };
  })()`);
  ok(sub && sub.largou && sub.gps === sub.largadas && sub.largadas === sub.corridas, `substituindo ${sub && sub.nome} por ${sub && sub.corridas} corrida(s): cada largada conta (${sub && sub.gps})`);
  ok(sub && sub.ausente && sub.titular, 'o titular volta ao carro e o reserva volta ao box');
  /* fim do ano do reserva: avaliação e mercado sem promoção garantida */
  J.run(`Engine.chanceAusencia = () => 0; S.driver.injured = 0; Game.simSeason(); UI.limparFila(); UI.close(); Game.endSeason(); UI.limparFila(); UI.close();`);
  const fimAno = J.run(`({ av: S.history[S.history.length - 1].avaliacao, papel: S.history[S.history.length - 1].papel, races: S.history[S.history.length - 1].races, dnfs: S.history[S.history.length - 1].dnfs })`);
  ok(fimAno.papel === 'reserva' && typeof fimAno.av === 'number', `o ano de reserva fica no histórico com avaliação (${fimAno.av})`);
  ok(fimAno.races === sub.largadas && fimAno.dnfs <= fimAno.races, `largadas do ano: só as da substituição (${fimAno.races})`);
}
{
  /* 7. o acadêmico na F2 chamado pela equipe-mãe (Bearman, Ferrari 2024) */
  const J = noAcesso(123, { ano: 2024, idade: 19, ovr: 80, pot: 86 });
  const r = J.run(`(() => {
    S.academy = { n:'Ferrari Driver Academy', t:'Ferrari', c:'#d40000', peso:1.12, desde:S.year - 2, anosRuins:0 };
    S.history.push({ year: S.year - 1, cat: 'Fórmula 3', pos: 1, races: 10, champion: true });
    S.fp1Hist = [S.year, S.year];
    const catAntes = S.season.cat, roundAntes = S.season.round;
    Engine.chanceAusencia = () => 1;
    const ca = Engine.convocacaoAcademia(S.season);
    if(!ca) return { ca: null };
    Game.correrConvocacaoAcademia(ca, true);
    return { ca: ca.equipe, cat: S.season.cat === catAntes, round: S.season.round === roundAntes, conv: (S.convocacoes || []).length,
             gps: S.career.gps, papel: S.papel || null, team: S.team };
  })()`);
  ok(r.ca === 'Ferrari', 'o acadêmico da Ferrari na F2 é chamado quando um titular cai');
  ok(r.cat && r.round && !r.papel, 'depois da corrida, a temporada da F2 continua de onde estava');
  ok(r.conv === 1 && r.gps === 1, 'a corrida na principal fica registrada e conta como largada na principal');
}

console.log(falhas ? falhas + ' falha(s) de ' + n : `mercado da principal e reserva: ${n} verificações, tudo certo`);
if(falhas) process.exitCode = 1;
