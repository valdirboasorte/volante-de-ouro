/* Reserva de uma equipe grande correndo numa categoria menor, e o papel que
   não pode sobrar de uma equipe antiga.
   — trocar de série depois de ser reserva: você volta a correr (o relato da Aston Martin);
   — reserva + titular na F2 no mesmo ano: corre a F2 inteira e pode ser chamado;
   — a convocação corre na principal e devolve a temporada de baixo intacta;
   — o vínculo acaba ao subir para a principal ou trocar de série;
   — o histórico mostra o papel, e a tela de propostas oferece acumular.
   Uso: node testes/reserva-dupla.js   Não modifica arquivos nem saves. */
const H = require('./base');
let falhas = 0, n = 0;
const ok = (c, m) => { n++; if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };
const topo = J => J.run(`(() => { const t = S.ladder.indexOf(Engine.topCat()); return Engine.teamsFor(Engine.topCat(), S.year + 1, S.series, t, S.ladder.length).slice().sort((a, b) => b.str - a.str); })()`);

/* 1. reserva da Aston Martin, depois WEC: volta a correr */
{
  const J = H.carregar({ silencioso:true, seed: 3 });
  H.novaCarreira(J, { era: 7, ano: 2030, idade: 24, rapido: true });
  const r = J.run(`(() => { const t = S.ladder.indexOf(Engine.topCat()); S.catIdx = t;
    const ts = Engine.teamsFor(Engine.topCat(), S.year, S.series, t, S.ladder.length);
    S.team = { id:ts[0].id, name:ts[0].name, color:ts[0].color, str:ts[0].str }; S.papel = Engine.novoPapel('reserva', ts[0].name, null);
    Game.startSeason(); UI.limparFila(); UI.close(); Game.simSeason(); UI.limparFila(); UI.close(); Game.endSeason(); UI.limparFila(); UI.close();
    const tw = Engine.teamsFor('WEC', S.year + 1, 'wec', 0, 1)[0] || { id:'w', name:'Cadillac', color:'#fc0', str:85 };
    S.pendingOffers = [{ sk:'wec', cat:'WEC', team: tw, years:1 }]; Game.takeOffer(0); UI.limparFila(); UI.close();
    const papel = S.papel; Game.simSeason(); UI.limparFila(); UI.close();
    return { papel, serie: S.series, largou: S.season.results.filter(x => x.dnf !== 'RES').length, n: S.season.results.length }; })()`);
  ok(r.serie === 'wec' && r.papel === null && r.largou === r.n && r.n > 0, `reserva na F1 e depois WEC: o papel não vem junto e você larga as ${r.n} corridas`);
}

/* 2. reserva + titular na F2 */
{
  const J = H.carregar({ silencioso:true, seed: 5 });
  H.novaCarreira(J, { era: 7, ano: 2023, idade: 18, rapido: true });
  const ts = topo(J);
  const f2 = J.run(`(() => { const i = S.ladder.indexOf(Engine.topCat()) - 1; S.catIdx = i; return { cat: S.ladder[i], times: Engine.teamsFor(S.ladder[i], S.year + 1, S.series, i, S.ladder.length) }; })()`);
  J.run(`S.pendingOffers = ${JSON.stringify([
    { type:'f1', cat: J.run('Engine.topCat()'), team: ts[0], years: 1, papel: 'reserva', note: 'x' },
    { type:'f1', cat: f2.cat, team: f2.times[0], years: 1, note: 'y' },
    { type:'f1', cat: J.run('Engine.topCat()'), team: ts[5], years: 2, note: 'z' }])}; UI.ofertasModal();`);
  const html = J.E('modal').innerHTML;
  ok(/UI\.escolherReserva\(0\)/.test(html) && /acumular com uma vaga de corrida/.test(html), 'a proposta de reserva mostra que dá para acumular com uma vaga de corrida');
  J.run('UI.escolherReserva(0)');
  const esc = J.E('modal').innerHTML;
  ok(/Game\.takeOffer\(0\)/.test(esc) && /Game\.takeOfferDupla\(0,1\)/.test(esc) && !/takeOfferDupla\(0,2\)/.test(esc), 'a escolha: só reserva, ou reserva e titular na categoria menor (a vaga na principal não acumula)');
  J.run('Game.takeOfferDupla(0, 1); UI.limparFila(); UI.close();');
  const d = J.run('({ papel: S.papel, v: S.reservaDe, cat: S.season.cat, eq: S.team.name, isTop: S.season.isTop, ano: S.year })');
  ok(!d.papel && d.v && d.v.equipe === ts[0].name && d.cat === f2.cat && d.eq === f2.times[0].name && !d.isTop,
     `titular na ${d.cat} pela ${d.eq} e reserva da ${d.v && d.v.equipe}`);
  /* a convocação: corre na principal e devolve a F2 intacta */
  const c = J.run(`(() => { Engine.chanceAusencia = () => .5; Engine.superlicenca = () => 40; const sea = S.season; sea.round = 3;
    const antes = { round: sea.round, cat: sea.cat, res: sea.results.length };
    let conv = null; for(let k = 0; k < 20 && !conv; k++){ sea.convRes = null; conv = Engine.convocacaoReserva(sea); }
    if(!conv) return { conv: null };
    Game.correrConvocacaoAcademia(conv, true);
    return { conv, antes, depois: { round: S.season.round, cat: S.season.cat, res: S.season.results.length }, convs: S.convocacoes, v: S.reservaDe }; })()`);
  ok(c.conv && c.conv.reserva && c.conv.equipe === ts[0].name, 'um titular da equipe cai e o reserva é chamado');
  ok(c.convs && c.convs.length === 1 && c.convs[0].equipe === ts[0].name && c.convs[0].cat === J.run('Engine.topCat()'), 'a corrida na principal fica registrada como convocação');
  ok(c.antes && c.depois.round === c.antes.round && c.depois.cat === c.antes.cat && c.depois.res === c.antes.res && c.v.convocacoes === 1,
     'depois da bandeirada, a temporada da F2 volta intacta');
  J.run('Engine.chanceAusencia = r => .005;');
  /* a temporada inteira da F2 continua correndo, e o fim do ano avalia o vínculo */
  const fim = J.run(`(() => { Game.simSeason(); UI.limparFila(); UI.close(); const sea = S.season;
    const largou = sea.results.filter(x => Engine.largou(x)).length;
    Game.endSeason(); UI.limparFila(); UI.close(); const h = S.history[S.history.length - 1];
    UI.render(); return { largou, n: sea.results.length, h, aval: S.reservaDe && S.reservaDe.avaliacao, hist: document.getElementById('pane-hist').innerHTML }; })()`);
  ok(fim.n > 0 && fim.largou >= fim.n - 3 && !fim.h.papel && fim.h.reservaDe === ts[0].name, `a F2 inteira corrida (${fim.largou} de ${fim.n} largadas), o ano registrado como titular e reserva`);
  ok(typeof fim.aval === 'number' && /Reserva da /.test(fim.hist), `o vínculo foi avaliado (${fim.aval}) e o histórico mostra "Reserva da ${ts[0].name}"`);
  /* subir para a principal como titular encerra o vínculo */
  J.run(`S.pendingOffers = [{ type:'f1', cat: Engine.topCat(), team: ${JSON.stringify(ts[3])}, years: 2, up: true, note: 'v' }]; Game.takeOffer(0); UI.limparFila(); UI.close();`);
  ok(J.run('S.reservaDe') === null && J.run('S.season.isTop') && !J.run('S.papel'), 'titular na principal: o vínculo de reserva acaba');
}

/* 3. trocar de série com o vínculo ativo também encerra; save antigo sem o campo abre */
{
  const J = H.carregar({ silencioso:true, seed: 8 });
  H.novaCarreira(J, { era: 7, ano: 2023, idade: 18, rapido: true });
  J.run(`S.reservaDe = { equipe:'Ferrari', tipo:'reserva', sk:S.series, desde:S.year, ate:S.year + 3, avaliacao:0 };
    const tw = Engine.teamsFor('WEC', S.year + 1, 'wec', 0, 1)[0]; S.pendingOffers = [{ sk:'wec', cat:'WEC', team: tw, years:1 }]; Game.takeOffer(0); UI.limparFila(); UI.close();`);
  ok(J.run('S.reservaDe') === null, 'outra série: o vínculo de reserva acaba');
  J.run('delete S.reservaDe; Game.save();');
  const K = H.carregar({ silencioso:true, store: J.store });
  K.run('Game.continueSave(); UI.limparFila(); UI.close(); Game.nextRace(); UI.limparFila(); UI.close();');
  ok(K.run('!!S && !S.reservaDe'), 'save sem o vínculo abre e segue normalmente');
}

console.log(falhas ? falhas + ' falha(s) de ' + n : `reserva e categoria menor: ${n} verificações, tudo certo`);
if(falhas) process.exitCode = 1;
