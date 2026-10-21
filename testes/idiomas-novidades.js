/* As telas novas renderizadas em inglês, espanhol e japonês: reserva e convocação,
   motivos do mercado, estatísticas e rankings, bens de luxo, garagem de sexta,
   regulamento do fim de semana, conversas, apoio ao projeto e o modo chefe nas
   séries. Procura português que tenha sobrado no texto mostrado.
   Uso: node testes/idiomas-novidades.js   Não modifica arquivos nem saves. */
'use strict';
const H = require('./base');
const languages = ['en', 'es', 'ja'];
let checks = 0, rendered = 0, J, scenario = '';
const failures = [], seen = new Set(), knownNames = new Set(), faltas = new Set();
const ptEnglish = /\b(?:você|vocês|não|também|sua|seu|equipe|rodada|campeão|temporada|corrida|pneu|piloto|vitórias|patrocínio|largada|engenheiro|dinheiro|escolha|fechar|reserva|titular|vaga|ajuste|acerto|garagem|trecho|conversa|regulamento|apoio|chave|categoria)\b/iu;
const ptOther = /\b(?:você|vocês|não|também|sua|seu|equipe|rodada|campeão|pódios|vitórias|patrocínio|engenheiro|escolha|fechar|vaga|pneu|garagem|trecho|acerto|apoio|chave)\b/iu;
const normalize = s => s.replace(/\s+/g, ' ').trim();
const decode = s => s.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (_, e) => e[0] === '#'
  ? String.fromCodePoint(parseInt(e.slice(/^#x/i.test(e) ? 2 : 1), /^#x/i.test(e) ? 16 : 10)) : ({ amp:'&', lt:'<', gt:'>', quot:'"', apos:"'", nbsp:' ' }[e.toLowerCase()]));
function inspect(raw){
  const source = normalize(decode(String(raw)));
  if(!J || !/\p{L}/u.test(source) || seen.has(source)) return;
  seen.add(source); rendered++;
  for(const name of J.run('Array.from(VDO_LANGUAGE_NAMES())')) knownNames.add(name);
  for(const lang of languages){
    let out = J.ctx.VDO_I18N.audit(source, lang).text;
    for(const name of [...knownNames].sort((a, b) => b.length - a.length)) out = out.split(name).join('');
    checks++;
    if((lang === 'en' ? ptEnglish : ptOther).test(out)) failures.push({ scenario, source, lang, output: out });
    if(process.env.VDO_FALTAS) J.ctx.VDO_I18N.audit(source, lang).missing.forEach(m => faltas.add(m));
  }
}
function renderedHTML(raw){
  const clean = String(raw).replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<([a-z]+)[^>]*data-i18n-ignore[^>]*>[^<]*<\/\1>/gi, '');
  for(const match of clean.matchAll(/<(?:[^>"']|"[^"]*"|'[^']*')*>|[^<]+/g)){
    if(match[0][0] !== '<') inspect(match[0]);
    else for(const attr of match[0].matchAll(/\b(?:title|aria-label|placeholder|alt|label)\s*=\s*(["'])(.*?)\1/g)) inspect(attr[2]);
  }
}
J = H.carregar({ silencioso:true, seed: 4242, onWrite: w => w.property === 'innerHTML' ? renderedHTML(w.value) : inspect(w.value) });
const run = (rot, code) => { scenario = rot; J.run('UI.limparFila && UI.limparFila(); UI.close();'); J.run(code); };

/* reserva, convocação e o fim de semana de quem está no box */
H.novaCarreira(J, { era: 7, ano: 2023, idade: 23, cc: 'BR', rapido: false });
run('reserva:inicio', `(() => { const t = S.ladder.indexOf(Engine.topCat()); S.catIdx = t;
  const ts = Engine.teamsFor(Engine.topCat(), S.year, S.series, t, S.ladder.length);
  S.team = { id:ts[2].id, name:ts[2].name, color:ts[2].color, str:ts[2].str };
  S.papel = Engine.novoPapel('reserva', ts[2].name, null); S.driver.injured = 0;
  Game.startSeason(); UI.limparFila(); UI.close(); S.driver.injured = 0; })()`);
run('reserva:fds', 'UI.papelFimDeSemana()');
for(const k of ['sim','fp1','teste','box']) run('reserva:' + k, `(() => { const ops = Engine.atividadesPapel(S.season); if(ops.indexOf('${k}') >= 0){ const r = Engine.fazerAtividadePapel(S.season, '${k}'); const rec = Engine.runRace(S.season); UI.papelResultado(r, rec); } })()`);
run('reserva:convocacao', `(() => { const sea = S.season; const f = sea.field.find(x => !x.isMe && x.teamId === S.team.id);
  const conv = { id:f.id, nome:f.name, equipe:S.team.name, motivo:'lesão sofrida em casa', corridas:2 }; UI.convocacaoModal(conv); })()`);
run('reserva:temporada', 'Game.simSeason(); UI.limparFila(); UI.close(); Game.endSeason(); UI.limparFila(); UI.close();');
run('mercado:ofertas', 'S.lastSum = Engine.summary(S.season); Game.showOffers(S.lastSum);');
(J.run('(S.mercadoMotivos || []).map(m => m.m)') || []).forEach(inspect);
run('estatisticas', 'UI.estatisticas()');
for(const modo of ['save','real']) run('lendas:' + modo, `UI.lendas('f1', { name:S.driver.name, cc:S.driver.cc, porSerie:S.career.porSerie, titles:S.career.titles, wins:S.career.wins, serie:'f1' }, '${modo}')`);

/* luxo, garagem, regulamento e conversas */
H.novaCarreira(J, { era: 7, ano: 2016, idade: 12, cc: 'BR', modo: 'realista', rapido: false });
run('luxo:crianca', 'S.money.saldo = 9e6; UI.financas();');
run('luxo:adulto', 'S.driver.age = 19; S.money.luxo = ["Relógio suíço"]; UI.financas();');
run('garagem', `(() => { const sea = S.season; Engine.garantirFds(sea, sea.round); UI.setupModal(); Game.setResp(0, 2); Game.setResp(1, 2); Game.setResp(2, 1); })()`);
for(const [ano, rd] of [[1989, 0], [2005, 1], [2005, 8], [2016, 0], [2019, 3]]){
  run('regulamento:' + ano, `(() => { const sea = S.season; sea.year = ${ano}; sea.isTop = true; sea.round = ${rd}; Engine.resumoRegras(sea, ${rd}).forEach(t => UI.toast(t)); UI.qualiModal(); })()`);
}
(J.run('[1990,2012,2019,2023].map(a => [Engine.formatoIndy500(a).n, Engine.formatoIndy500(a).d])') || []).flat().forEach(inspect);
run('pessoas', 'Engine.gente(); Engine.sincronizarGente(); UI.pessoas();');
run('conversas', `(() => { const sea = S.season; sea.round = 5; sea.results = [{ pos: 2 }];
  S.falasFeitas = {}; S.falasTema = {}; S.falasPessoa = {};
  ['eng','chefe'].forEach(p => { const x = Engine.pessoa(p); if(x){ UI.conversa(x.id); const c = Engine.conversasDe(x)[0]; if(c) UI.falar(x.id, c.id); } }); })()`);
run('pneus:largada', `(() => { const sea = S.season; const M = Engine.montarCorrida(sea); const ent = Gp.entrada(sea, M, S.series, sea.year, f => !!f.isMe);
  const R = Gp.criar(ent); const eu = R.carros.find(s => s.c.ctrl), outro = R.carros.find(s => !s.c.ctrl);
  Gp.regraPneus(R, eu).forEach(t => UI.toast(t)); Gp.opcoesLargada(R).forEach(c => { const p = Gp.perfilPneu(R, c); if(p.aviso) UI.toast(p.aviso); });
  R.rnd = () => .1; Gp.toque(R, eu, outro); R.pergunta.opcoes.forEach(o => { UI.toast(o.n); UI.toast(o.d); if(o.tag) UI.toast(o.tag); }); })()`);

/* apoio ao projeto: a página fixa, sem configuração e com uma configuração de teste só aqui */
{
  const html = require('fs').readFileSync(require('path').join(__dirname, '..', 'index.html'), 'utf8');
  scenario = 'doacao:pagina';
  renderedHTML((html.match(/<section class="screen" id="scr-apoio"[\s\S]*?(?=<!-- ═════════ FICHA DE INSCRIÇÃO)/) || [''])[0]);
  renderedHTML((html.match(/<nav class="topnav" id="topMenu"[\s\S]*?<\/nav>/) || [''])[0]);
}
run('doacao:indisponivel', `window.VDO_DOACAO = {}; Doacao.pagina(); Doacao.voltar();`);
require('vm').runInContext(require('fs').readFileSync(require('path').join(__dirname, '..', 'assets', 'doacao.js'), 'utf8'), J.ctx);
run('doacao:pix', `Doacao.pagina(); Doacao.voltar();`);
run('doacao', `window.VDO_DOACAO = { pix:{ chave:'chave-teste', beneficiario:'Pessoa Teste' }, link:{ url:'https://exemplo.invalid/apoio', nome:'Plataforma' } }; UI.show('career'); Doacao.pagina(); Doacao.voltar();`);

/* resultados com estados explícitos: reserva, testes, sem equipe, DNQ, DNPQ, abandono */
run('resultados:estados', `[{ dnf:'RES', papelTipo:'reserva' }, { dnf:'RES', papelTipo:'teste' }, { dnf:'RES', papelTipo:'livre' }, { dnf:'DNQ' }, { dnf:'DNPQ' },
  { grid:5, dnf:'MEC' }, { grid:5, dnf:'ACID' }, { dnf:'LES' }, { dnf:'DNS' }, { grid:3, pos:2 }, { grid:1, pos:1 }, { grid:8, pos:12 }, { grid:null, pos:null }]
  .forEach(r => { UI.toast(narrative(r, null)); const e = Engine.estadoProva(r); UI.toast(e.rot); UI.toast(e.curto); });`);
H.novaCarreira(J, { era: 7, ano: 2030, idade: 22, cc: 'BR', rapido: true });
run('resultados:reserva', `(() => { const t = S.ladder.indexOf(Engine.topCat()); S.catIdx = t;
  const ts = Engine.teamsFor(Engine.topCat(), S.year, S.series, t, S.ladder.length);
  S.team = { id:ts[0].id, name:ts[0].name, color:ts[0].color, str:ts[0].str }; S.papel = Engine.novoPapel('reserva', ts[0].name, null);
  S.driver.injured = 0; Game.startSeason(); UI.limparFila(); UI.close(); S.driver.injured = 0; Engine.chanceAusencia = () => 0;
  Game.simSeason(); UI.limparFila(); UI.close(); UI.render(); UI.retro(); UI.sumBar(); [0, 1].forEach(i => UI.raceDetail(i)); })()`);

/* idade e caminho de entrada pela época e pelo país */
for(const [ano, cc] of [[1955, 'GB'], [1958, 'US'], [1962, 'BR'], [1966, 'GB'], [1976, 'BR'], [1995, 'JP']])
  run('entrada:' + ano + cc, `UI.year = ${ano}; UI.country = '${cc}'; document.getElementById('inAge').value = '8'; UI.ageChanged();`);

/* preparação da largada do piloto */
H.novaCarreira(J, { era: 7, ano: 2023, idade: 24, cc: 'BR', rapido: false });
run('prep:piloto', `(() => { const sea = S.season; const fds = Engine.garantirFds(sea, sea.round);
  while((fds.treinos || []).length < fds.sessoes) Engine.correrTreino(sea, sea.round, 'acerto');
  Game.garantirResp(); sea.setup.auto = false; fds.etapa = 'quali'; fds.sorteio = 'feito'; fds.evento = null;
  Game.fazerQuali('meio'); UI.limparFila(); UI.close(); fds.etapa = 'corrida'; Game.nextRace();
  const d = Gp.dadosLargada(sea, Game.entradaDaEtapa(sea)); const alvo = d.carros[0].opcoes.map(o => o.c).find(c => c !== d.carros[0].sugerido);
  if(alvo) Game.escolherPneuLargada('ME', alvo); })()`);

/* classificação do chefe, sessão por sessão, e a preparação por carro */
J.run(require('./chefe-comum'));
for(const [sk, ano, rd] of [['f1', 2024, 0], ['f1', 1989, 0], ['f1', 2005, 0], ['f1', 2016, 0], ['f1', 1990, 0], ['indy', 2019, 4], ['nascar', 2018, 0]]){
  run('chefe:quali:' + sk + ano, `(() => { const idx = eraOfSeries(${ano}, '${sk}').teams.findIndex((t, i) => Engine.resolveTeam(t, i, ${ano}, '${sk}'));
    Chefe.novo({ modo:'assumir', sk:'${sk}', ano:${ano}, idx, chefe:{ nome:'T', cc:'BR' }, realismo:true });
    __inverno(); Chefe.comecarTemporada(); UI.limparFila(); UI.close();
    const sea = C.temporada; sea.round = ${rd};
    UIC.irQuali(); UIC.janela(0, 'cedo'); UIC.janela(1, 'tarde'); Chefe.rodarSessao(); UIC.quali(); UIC.simularQuali(); UIC.gridFinal(); UIC.prepCorrida();
    const d = Gp.dadosLargada(sea, UIC.entradaDaEtapa()); d.carros.forEach(c => { const o = c.opcoes.find(x => x.c !== c.sugerido); if(o) UIC.escolherPneu(c.id, o.c); });
    (C.news || []).forEach(n => UI.toast(n.t)); })()`);
}

/* o hub do chefe em páginas: todas as áreas, na pré-temporada e na temporada */
run('chefe:hub', `(() => { const l = eraOfSeries(2024, 'f1').teams.map((t, i) => [i, Engine.resolveTeam(t, i, 2024, 'f1')]).filter(x => x[1]);
  Chefe.novo({ modo:'assumir', sk:'f1', ano:2024, idx: l.find(x => x[1].name === 'Ferrari')[0], chefe:{ nome:'T', cc:'BR' }, realismo:true });
  UI.show('chefe'); UIC.pag = 'visao'; UIC.render();
  UIC.PAGS.forEach(([k]) => UIC.pagina(k)); UIC.pagina('pilotos'); UIC.academia(); UIC.pagina('desenvolvimento'); UIC.motores(); UIC.pagina('financas'); UIC.banco();
  __inverno(); Chefe.comecarTemporada(); UI.limparFila(); UI.close();
  UIC.PAGS.forEach(([k]) => UIC.pagina(k));
  const sea = C.temporada; for(let i = 0; i < 3; i++){ Chefe.gridDaEtapa(sea); Chefe.correr(); }
  /* as peças: projeto em andamento, pronto, fabricando; o acerto com a leitura do piloto */
  Pecas.projetar('asaD', 'lenta', 2); Pecas.projetar('susp', 'pneu', 0); Pecas.avancar(40);
  const pr = C.pecas.proj.find(x => x.st === 'pronto'); if(pr) Pecas.fabricar(pr.e, 2);
  Pecas.projetar('assoalho', 'rapida', 1); UIC.pagina('desenvolvimento'); UIC.pagina('visao');
  Acerto.saida(0); Acerto.auto(1); UIC.pagina('corrida');
  [0, 1, 2, 3].forEach(i => { UIC._dp = Pecas.partes()[i]; UIC._di = i % 3; UIC.pagina('desenvolvimento'); });
  UIC.PAGS.forEach(([k]) => UIC.pagina(k)); UIC.irCorrida();
  while(sea.round < sea.calendar.length) Chefe.correr();
  UIC.pagina('visao'); UIC.pagina('corrida'); Chefe.fimDeTemporada(); UIC.pagina('visao'); UIC.topo(); UI.show('intro'); })()`);

/* os treinos livres do chefe: programa e acerto de cada carro */
run('chefe:treinos', `(() => { const idx = eraOfSeries(2024, 'f1').teams.findIndex((t, i) => Engine.resolveTeam(t, i, 2024, 'f1'));
  Chefe.novo({ modo:'assumir', sk:'f1', ano:2024, idx, chefe:{ nome:'T', cc:'BR' }, realismo:true }); __inverno(); Chefe.comecarTemporada(); UI.limparFila(); UI.close();
  UIC.preCorrida(); UIC.dec('treino', '0', 'corrida'); UIC.dec('treino', '1', 'quali'); UIC.dec('acerto', '0', 'corrida'); UIC.dec('acerto', '1', 'quali'); })()`);

/* a administração do chefe: caixa etapa a etapa, obra, pacote, patrocinador, diretoria e balanço */
run('chefe:admin', `(() => { const idx = eraOfSeries(2019, 'f1').teams.findIndex((t, i) => Engine.resolveTeam(t, i, 2019, 'f1'));
  Chefe.novo({ modo:'assumir', sk:'f1', ano:2019, idx, chefe:{ nome:'T', cc:'BR' }, realismo:true }); __inverno(); Chefe.comecarTemporada(); UI.limparFila(); UI.close();
  if(!C.patro.length) Chefe.ofertasPatrocinio(2).forEach(s => Chefe.aceitarPatro(s));
  if(!C.dir) C.dir = { conf: 55, meta: 5, aporte: 0, dono: 'conselho', prio: 'financas' };
  UI.show('chefe'); UIC.render(); UIC.trocarAba('fin'); UIC.instalacoes(); UI.close(); UIC.pacote(); UI.close(); UIC.preCorrida(); UI.close();
  const sea = C.temporada; ['podio','top5','pontos','dois'].forEach(k => { sea.objPatro = null; Chefe.objetivoPatro(sea); sea.objPatro.k = k; UIC.preCorrida(); UI.close(); });
  for(let k = 0; k < 3; k++){ Chefe.gridDaEtapa(sea); const M = Chefe.montar(); const rec = Chefe.correr(); UIC.resultado(rec); UI.close(); }
  UIC.render(); UIC.trocarAba('fin');
  C.patro.forEach((x, k) => { x.ate = sea.ano; x.sat = k ? 20 : 90; });
  while(sea.round < sea.calendar.length) Chefe.correr();
  Chefe.fimDeTemporada(); UIC.fimTemporada && UIC.fimTemporada(); (C.news || []).slice(0, 12).forEach(n => UI.toast(n.t)); })()`);

/* as rivais com gestão própria, depois da história */
run('chefe:rivais', `(() => { const idx = eraOfSeries(2026, 'f1').teams.findIndex((t, i) => Engine.resolveTeam(t, i, 2026, 'f1'));
  Chefe.novo({ modo:'assumir', sk:'f1', ano:2026, idx, chefe:{ nome:'T', cc:'BR' }, realismo:true }); __inverno(); __temporada(); Chefe.proximoAno(); UI.limparFila(); UI.close(); __inverno();
  Chefe.comecarTemporada(); UI.limparFila(); UI.close(); C.rel = { McLaren: -30, Ferrari: 12, Williams: -10, Haas: 0 };
  const sea = C.temporada; while(sea.round < Math.floor(sea.calendar.length / 3) + 1){ Chefe.gridDaEtapa(sea); Chefe.correr(); }
  UI.show('chefe'); UIC.render(); UIC.trocarAba('con'); (C.news || []).slice(0, 20).forEach(n => UI.toast(n.t));
  const p = { id: Chefe.novoId(), nome:'Piloto da Rival', cc:'GB', nasc: 2000, real:false, hab: 84, pot: 86, skill: 84, pede: 1e6, eqHist:'Mercedes', orig:'f1', moral:60, fama:40, papel:'livre', est:{ gps:0, v:0, pod:0, pts:0, poles:0 } };
  Chefe.assinar(p, { sal:1, anos:1, papel:'teste' }, 1); (C.news || []).slice(0, 3).forEach(n => UI.toast(n.t)); })()`);

/* a central de corrida do chefe: torre, câmera, cartões, previsões, mistura e ordens */
for(const [sk, ano] of [['f1', 2024], ['f1', 1986], ['f1', 2005], ['fe', 2020]]){
  run('chefe:central:' + sk + ano, `(() => { globalThis.requestAnimationFrame = () => 0; globalThis.cancelAnimationFrame = () => {};
    const idx = eraOfSeries(${ano}, '${sk}').teams.findIndex((t, i) => Engine.resolveTeam(t, i, ${ano}, '${sk}'));
    Chefe.novo({ modo:'assumir', sk:'${sk}', ano:${ano}, idx, chefe:{ nome:'T', cc:'BR' }, realismo:true });
    __inverno(); Chefe.comecarTemporada(); UI.limparFila(); UI.close();
    const sea = C.temporada; Chefe.gridDaEtapa(sea);
    const R = Gp.criar(UIC.entradaDaEtapa()); AoVivo.R = R; AoVivo.opc = { serie: C.cat, chefe: true }; AoVivo.cam = null;
    while(R.lider == null || R.lider.voltas < 8){ if(R.pergunta) Gp.responder(R, R.pergunta.padrao); Gp.passo(R); }
    AoVivo.montar();
    ['int', 'lider', 'pneu', 'voltas'].forEach(m => { AoVivo.modoTorre = m; AoVivo.painel(); });
    const meus = R.carros.filter(s => s.c.ctrl);
    meus.forEach((s, k) => { s.sugestao = { c: R.regras.secos[0], por: k ? 'cobrir' : 'undercut', volta: s.voltas + 1, desde: s.voltas }; s.economia = !!k; if(s.carga != null) s.carga = k ? .1 : .9; s.auto = !k; });
    AoVivo.cartoes();
    meus.forEach(s => { s.pneu.gasto = 1; s.parar = R.regras.secos[0]; s._prev = null; }); AoVivo.cartoes();
    meus.forEach(s => { s.estado = 2; }); AoVivo.cartoes();
    if(meus[0]){ Gp.comandar(R, meus[0].i, { ordemEq: 'manter' }); Gp.comandar(R, meus[0].i, { ordemEq: 'livre' }); R.carros[meus[0].i].estado = 0; Gp.comandar(R, meus[0].i, { auto: true }); }
    R.eventos.slice(-12).forEach(e => UI.toast(AoVivo.texto(e)));
    AoVivo.R = null; AoVivo.svg = null; })()`);
}

/* cenários do chefe: lista, abertura, depósito, objetivos e o fim */
run('cenarios:lista', 'UIC.cenarios();');
for(const id of ['brawn09', 'andrea92', 'mclaren88', 'minardi01', 'williams19', 'foyt21'])
  run('cenarios:' + id, `(() => { Cenario.iniciar('${id}', { nome:'T', cc:'BR' }); UIC.cenarioIntro(); UI.close(); if(C.cenario && '${id}' === 'andrea92'){ UIC.deposito(); }
    UIC.render && UIC.render(); document.getElementById('tmpCen').innerHTML = UIC.cenarioHtml(); (C.news || []).forEach(n => UI.toast(n.t)); })()`);
run('cenarios:fim', `(() => { C.cenario.estado = 'sucesso'; UIC.cenarioFim(); UI.close(); C.cenario.estado = 'fracasso'; C.cenario.visto = false; UIC.cenarioFim(); })()`);
run('cenarios:andrea-fds', `(() => { Cenario.iniciar('andrea92', { nome:'T', cc:'BR' }); C.cenario.deposito = 'nao'; Chefe.comecarTemporada(); UI.limparFila(); UI.close();
  const sea = C.temporada; Chefe.qualiDaEtapa(sea); UIC.quali(); Chefe.correr(); UIC.irQuali(); UIC.quali(); Chefe.rodarSessao(); UIC.quali(); })()`);

/* reserva de equipe grande correndo numa categoria menor, e o pneu que estoura no limite */
H.novaCarreira(J, { era: 7, ano: 2023, idade: 18, cc: 'BR', rapido: true });
run('reserva-dupla:propostas', `(() => { const it = S.ladder.indexOf(Engine.topCat()), i2 = it - 1; S.catIdx = i2;
  const ts = Engine.teamsFor(Engine.topCat(), S.year + 1, S.series, it, S.ladder.length), f2 = Engine.teamsFor(S.ladder[i2], S.year + 1, S.series, i2, S.ladder.length);
  S.pendingOffers = [{ type:'f1', cat: Engine.topCat(), team: ts[0], years:1, papel:'reserva', note: Engine.notaPapel('reserva', ts[0], false) },
    { type:'f1', cat: S.ladder[i2], team: f2[0], years:1, note:'Renovar onde você já está. Eles conhecem o seu jeito.' }];
  UI.ofertasModal(); UI.escolherReserva(0); Game.takeOfferDupla(0, 1); UI.limparFila(); UI.close(); UI.render();
  Engine.chanceAusencia = () => .5; Engine.superlicenca = () => 40; const sea = S.season; let conv = null;
  for(let k = 0; k < 20 && !conv; k++){ sea.convRes = null; conv = Engine.convocacaoReserva(sea); }
  if(conv) UI.convocacaoModal(conv); Engine.chanceAusencia = a => .005; })()`);
inspect('Max Verstappen: o pneu estourou no limite.');

/* a dificuldade: na ficha e no meio da carreira */
run('dificuldade', `(() => { ['tranquilo','equilibrado','realista'].forEach(k => { UI.dif = k; UI.difForm(); }); UI.difModal(); UI.render(); Game.setDif('equilibrado'); })()`);

/* o modo chefe fora da F1 */
for(const sk of ['indy','nascar','wec','fe','dtm','stock']){
  run('chefe:form:' + sk, `UIC.n.sk = '${sk}'; UIC.n.modo = 'base'; UIC.form();`);
  run('chefe:novo:' + sk, `Chefe.novo({ modo:'base', sk:'${sk}', ano:2018, chefe:{ nome:'T', cc:'BR' }, realismo:true, eq:{ nome:'Sakura Racing', cor:'#123456', cc:'JP' } }); UIC.boasVindas();`);
  (J.run('C.news.map(n => n.t)') || []).forEach(inspect);
}

if(process.env.VDO_FALTAS) require('fs').writeFileSync(process.env.VDO_FALTAS, JSON.stringify([...faltas].sort(), null, 1));
if(failures.length){ if(process.env.VDO_FALHAS) require("fs").writeFileSync(process.env.VDO_FALHAS, JSON.stringify(failures, null, 1)); else console.log(JSON.stringify(failures.slice(0, 60), null, 1)); console.log(failures.length + ' texto(s) ainda com português'); process.exitCode = 1; }
else console.log(`${checks} verificações em ${rendered} mensagens das telas novas: traduções completas`);
