/* Regulamento do fim de semana: formato de classificação por etapa (as mudanças
   no meio de 2005 e de 2016), limite de grid e pré-classificação (F1 1977-1995),
   as 500 Milhas por edição, o resumo na tela e o que fica guardado no save.
   Uso: node testes/regulamento.js   Não modifica arquivos nem saves. */
const H = require('./base');
let falhas = 0, n = 0;
const ok = (c, m) => { n++; if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };

function naPrincipal(ano, sk, seed, fraca){
  const J = H.carregar({ silencioso:true, seed });
  const era = J.run(`ERAS.reduce((k, e, i) => e.y <= ${ano} ? i : k, 0)`);
  H.novaCarreira(J, { era, ano, idade: 28, serie: sk, rapido: true });
  J.run(`(() => { const t = S.ladder.indexOf(Engine.topCat()); S.catIdx = t;
    const ts = Engine.teamsFor(Engine.topCat(), S.year, S.series, t, S.ladder.length).slice().sort((a, b) => b.str - a.str);
    const eq = ${fraca ? 'ts[ts.length - 1]' : 'ts[0]'};
    S.team = { id:eq.id, name:eq.name, color:eq.color, str:eq.str }; S.driver.injured = 0;
    Game.startSeason(); UI.limparFila(); UI.close(); S.driver.injured = 0; })()`);
  return J;
}

{
  /* formatos de classificação da F1, etapa por etapa */
  const J = H.carregar({ silencioso:true });
  const f = (ano, rd) => J.run(`(() => { const x = Engine.formatoQuali(${ano}, 'f1', ${rd}); return { k:x.k, n:x.n, ag:!!x.agregado, el:!!x.eliminacao, s:x.sessoes, v:x.voltas }; })()`);
  ok(f(1995, 0).k === 'aberta' && f(1995, 0).s === 2, '1995: duas sessões de treino cronometrado');
  ok(f(2002, 0).v === 12 && f(2002, 0).s === 1, '1996–2002: uma hora, no máximo doze voltas');
  ok(f(2003, 0).k === 'volta' && /sábado/i.test(f(2004, 0).n), '2003 volta única; 2004 as duas voltas no sábado');
  ok([0,1,2,3,4,5].every(r => f(2005, r).ag) && [6,10,18].every(r => !f(2005, r).ag && f(2005, r).k === 'volta'), '2005: tempos somados só nas seis primeiras etapas, depois volta única');
  ok([0,1].every(r => f(2016, r).el) && [2,10,20].every(r => !f(2016, r).el && f(2016, r).k === 'corte'), '2016: eliminação progressiva só nas duas primeiras etapas');
  ok(f(2009, 0).k === 'corte' && f(2015, 0).k === 'corte' && f(2024, 0).k === 'corte', 'Q1, Q2 e Q3 nos outros anos do corte');
}
{
  /* as 500 Milhas, edição por edição */
  const J = H.carregar({ silencioso:true });
  const e = ano => J.run(`Engine.formatoIndy500(${ano})`);
  ok(/Bump Day/.test(e(1990).n) && /Fast Nine/.test(e(2012).n) && /Last Row/.test(e(2019).n) && /Fast Six/.test(e(2023).n), 'Bump Day até 2009, Fast Nine 2010–2021, Last Row Shootout desde 2019, Fast Six desde 2022');
  ok([1990, 2012, 2019, 2023].every(a => e(a).vagas === 33 && e(a).voltas === 4), '33 largam e cada tentativa é a média de quatro voltas');
}
{
  /* F1 1989: 40 inscritos, pré-classificação e 26 no grid */
  const J = naPrincipal(1989, 'f1', 11, true);
  const campo = J.run('S.season.field.length');
  J.run('Game.simSeason(); UI.limparFila(); UI.close();');
  const r = J.run(`(() => { const sea = S.season; const rds = Object.keys(sea.naoLarga || {}).map(Number);
    const exemplo = rds.length ? sea.naoLarga[rds[0]] : {};
    const codigos = Object.values(exemplo);
    const forca = {}; sea.teams.forEach(t => forca[t.id] = t.str);
    const fortes = sea.teams.slice().sort((a, b) => b.str - a.str).slice(0, 3).map(t => t.id);
    const forteFora = rds.some(rd => Object.keys(sea.naoLarga[rd]).some(id => { const f = sea.field.find(x => x.id === id); return f && fortes.indexOf(f.teamId) >= 0; }));
    const meus = sea.results.map(x => x.dnf).filter(d => d === 'DNQ' || d === 'DNPQ');
    const s = Engine.summary(sea);
    return { rds: rds.length, total: sea.calendar.length, foraN: Object.keys(exemplo).length, dnpq: codigos.filter(c => c === 'DNPQ').length, dnq: codigos.filter(c => c === 'DNQ').length,
      forteFora, meus: meus.length, naoLargou: s.naoLargou, inscr: s.inscricoes, largadas: s.races }; })()`);
  ok(campo > 30 && r.rds === r.total, `1989: ${campo} inscritos, corte aplicado em todas as ${r.total} etapas`);
  ok(campo - r.foraN === 26 && r.dnpq === campo - 30 && r.dnq === 4, `pré-classificação tira ${r.dnpq}, a classificação tira ${r.dnq}: largam 26`);
  ok(!r.forteFora, 'as três equipes de ponta não ficam fora do grid (as médias às vezes ficam, como a Lotus em 1989)');
  ok(r.naoLargou >= r.meus && r.inscr === r.largadas + r.naoLargou, `na equipe mais fraca, você ficou fora ${r.meus} vez(es); inscrições = largadas + não largou`);
}
{
  /* F1 2016: 22 carros, ninguém fica fora; o resumo mostra o regulamento e as fontes */
  const J = naPrincipal(2016, 'f1', 3, false);
  const r = J.run(`(() => { const sea = S.season; const res = Engine.resumoRegras(sea, 0);
    return { campo: sea.field.length, res, fmt0: Engine.regulamento(sea, 0).fmt.n, fmt5: Engine.regulamento(sea, 5).fmt.n, fontes: Engine.FONTES_REGRAS.length }; })()`);
  J.run('Game.simSeason(); UI.limparFila(); UI.close();');
  const fora = J.run('Object.keys(S.season.naoLarga || {}).length');
  ok(fora === 0, `2016: ${r.campo} carros, ninguém fica fora`);
  ok(r.fmt0 !== r.fmt5 && /Eliminação/.test(r.fmt0), 'o resumo da etapa 1 e o da etapa 6 mostram formatos diferentes');
  ok(r.res.some(t => /107%/.test(t)) && r.res.some(t => /Pneus/.test(t)) && r.res.some(t => /Pontos/.test(t)) && r.fontes >= 3, 'o resumo traz 107%, pneus, pontos e as fontes');
}
{
  /* a classificação jogada guarda o formato da etapa; o save conserva */
  const J = naPrincipal(2005, 'f1', 5, false);
  J.run(`(() => { const sea = S.season; sea.round = 2; Engine.garantirFds(sea, 2); const q = Engine.rodarQuali(sea, 2, 'meio'); sea.round = 8; Engine.rodarQuali(sea, 8, 'meio'); sea.round = 0; Game.save(); })()`);
  const salvo = JSON.parse(J.store.vdo_save).season.qualiFmt || {};
  ok(salvo[2] && salvo[8] && salvo[2] !== salvo[8], `o save guarda o formato usado em cada etapa (${salvo[2]} / ${salvo[8]})`);
}
console.log(falhas ? falhas + ' falha(s) de ' + n : `regulamento: ${n} verificações, tudo certo`);
if(falhas) process.exitCode = 1;
