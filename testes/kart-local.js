/* O kart regional/nacional corre no país do campeonato. Exercita o
   calendário usado pela carreira e a correção de saves sem reescrever
   corridas disputadas nem um fim de semana que já começou. */
const H = require('./base');
let falhas = 0, verificacoes = 0;
const ok = (c, m) => { verificacoes++; if(!c){ falhas++; console.log('  ✗ ' + m); } };
const J = H.carregar({ silencioso:true });
const json = (j, c) => JSON.parse(j.run('JSON.stringify(' + c + ')'));
const fechar = j => j.run('UI.limparFila(); UI.close();');

function carreira(cc, ano = 2024, store = {}, serie = 'f1'){
  const j = H.carregar({ silencioso:true, store });
  H.novaCarreira(j, { era:`ERAS.reduce((k,e,i)=>e.y<=${ano}?i:k,0)`, ano,
    idade:8, cc, serie, rapido:false, nome:'Teste Local' });
  return j;
}
function calendario(cat, cc, ano = 2026, n = 9, j = J){
  return json(j, `juniorCalendar(${JSON.stringify(cat)}, ${ano}, 'f1', ${n}, ${JSON.stringify(cc)})
    .map(id => ({ id, ...TRACKS[id] }))`);
}
function soPais(c, cc, n){
  return c.length === n && c.every(t => t.id && t.cc === cc && /^(kt_|kb_|kr_)/.test(t.id));
}

/* Inclui as nacionalidades que não possuem um campeonato no catálogo nem
   pistas reais cadastradas. Nenhuma precisa viajar ao exterior para
   preencher o número de etapas do campeonato local. */
for(const cc of J.run('COUNTRIES.map(c => c.cc)')){
  for(const ano of [1975, 2026]){
    const c = calendario('Kart Regional', cc, ano);
    ok(soPais(c, cc, 9), `${cc}/${ano}: nove etapas regionais ficam no país do piloto`);
  }
}
ok(J.run('COUNTRIES.length') === 96, 'a cobertura inclui as 96 nacionalidades da criação');

/* O formulário e Engine.newSeason precisam passar o país até o registro
   de cada etapa, inclusive em carreiras históricas. */
for(const [cc, ano] of [['AR',2024], ['AR',2026], ['AR',1975], ['BR',2024],
  ['GB',2024], ['IT',2024], ['JP',2024], ['ZA',2024]]){
  const j = carreira(cc, ano), s = json(j, 'S.season');
  ok(s.cat === 'Kart Regional' && s.calendar.length >= 5 &&
    s.calendar.every(e => e.cc === cc && j.run(`TRACKS[${JSON.stringify(e.id)}].cc`) === cc),
    `${cc}/${ano}: a carreira aos oito anos tem calendário e bandeiras locais`);
  ok(s.calendar.every((e, i) => e.r === i + 1 && e.gp && e.circ),
    `${cc}/${ano}: as etapas conservam numeração e nomes válidos`);
  if(cc === 'AR'){
    const ids = s.calendar.map(e => e.id);
    ok(ano < 2005 ? ids.every(id => /^kr_ar_/.test(id)) : ids.every(id => /^kt_ar_/.test(id)),
      `Argentina/${ano}: usa pistas reais documentadas ou locais esquemáticas conforme a época`);
    ok(s.calendar.every(e => j.run(`!TRACKS[${JSON.stringify(e.id)}].anoFonte ||
      TRACKS[${JSON.stringify(e.id)}].anoFonte <= ${ano}`)),
      `Argentina/${ano}: não antecipa pistas cuja fonte é posterior ao ano jogado`);
  }
}

/* Poucas pistas resultam em visitas repetidas ao mesmo kartódromo, sem
   completar o calendário com Lonato, Interlagos ou outro país. */
for(const [cc, cat, ano, maxPistas] of [
  ['PT','Kart Nacional',2026,1], ['AR','Argentino de Kart',2005,1],
  ['AR','Argentino de Kart',2024,2], ['AR','Argentino de Kart',2026,4]
]){
  const c = calendario(cat, cc, ano, 10);
  ok(soPais(c, cc, 10) && new Set(c.map(t => t.id)).size <= maxPistas,
    `${cat}/${cc}/${ano}: repete as pistas locais para completar dez etapas`);
}
ok(!J.run("NAT.ZA") && soPais(calendario('Kart Nacional', 'ZA'), 'ZA', 9),
  'Kart Nacional sem entrada em NAT usa o país do piloto');
ok(soPais(calendario('Italiano de Kart', 'AR'), 'IT', 9),
  'argentino que escolhe o Italiano de Kart corre na Itália');
ok(soPais(calendario('Brasileiro de Kart', 'AR'), 'BR', 9),
  'argentino que escolhe o Brasileiro de Kart corre no Brasil');

/* A mesma função atende outras carreiras, sem herdar uma escolha global
   deixada por outro piloto. O Mundial e os monopostos seguem internacionais. */
const a = carreira('AR'), b = carreira('BR');
ok(soPais(calendario('Kart Regional', 'BR', 2024, 9, a), 'BR', 9) &&
  soPais(calendario('Kart Regional', 'AR', 2024, 9, b), 'AR', 9),
  'o argumento do país prevalece sobre outra carreira carregada');
for(const serie of ['indy', 'stock']){
  const c = json(J, `juniorCalendar('Kart Regional', 2024, '${serie}', 9, 'AR').map(id => TRACKS[id])`);
  ok(soPais(c, 'AR', 9), `${serie}: o kart regional argentino permanece na Argentina`);
}
for(const cat of ['Mundial de Kart', 'Fórmula 3', 'Fórmula 2']){
  const c = calendario(cat, 'AR', 2024, 10);
  ok(new Set(c.map(t => t.cc)).size >= 2, `${cat}: mantém calendário internacional`);
  const outroPais = calendario(cat, 'BR', 2024, 10);
  ok(c.map(t => t.id).join() === outroPais.map(t => t.id).join(),
    `${cat}: nacionalidade do piloto não muda os países da competição internacional`);
}
/* Nomes internacionais em português e do catálogo histórico não podem
   cair no calendário nacional nem no fallback dos circuitos de F1. */
for(const cat of ['Kart Internacional', 'CIK-FIA World Karting Championship',
  'CIK-FIA European Karting Championship']){
  const c = calendario(cat, 'AR', 2024, 10);
  ok(c.length === 10 && new Set(c.map(t => t.cc)).size >= 2 &&
    c.every(t => /^(kt_|kb_|kr_)/.test(t.id)),
    `${cat}: argentino disputa países diferentes exclusivamente em pistas de kart`);
}
const f1 = json(J, "calendarFor(2024, 'f1').map(id => TRACKS[id].cc)");
ok(f1.length >= 20 && new Set(f1).size >= 10, 'F1 conserva seu calendário internacional');
const esquema = json(J, `(() => { const t = kartLocalDoPais('ZA')[0], g = Pista.de(t, 2024);
  return { id:t, cc:TRACKS[t].cc, L:g.L, n:g.n, nivel:Prova.nivelDe({ cat:'Kart Regional', isTop:false }) }; })()`);
ok(esquema.cc === 'ZA' && /^kr_za_/.test(esquema.id) && esquema.L > 900 && esquema.L < 1300 &&
  esquema.n >= 64 && esquema.nivel === 4, 'pista local gerada continua sendo kart no mapa e na simulação');

/* Salvar um país sem pistas reais e abrir em outro contexto precisa
   reconstruir os IDs antes de renderizar a temporada. */
{
  const store = {}, j = carreira('ZA', 2024, store);
  const antes = j.run('JSON.stringify(S.season.calendar)');
  j.run('Game.save();');
  const n = H.carregar({ silencioso:true, store });
  n.run('Game.continueSave();'); fechar(n);
  ok(n.run('JSON.stringify(S.season.calendar)') === antes &&
    n.run("S.season.calendar.every(e => TRACKS[e.id] && TRACKS[e.id].cc === 'ZA')"),
    'reabrir save conserva as pistas genéricas locais e encontra todos os seus IDs');
}

function saveAntigo(cc, cat, opcoes = {}){
  const store = {}, j = carreira(cc, opcoes.ano || 2024, store);
  if(cat !== 'Kart Regional'){
    j.run(`S.catAlvo = ${JSON.stringify(cat)}; S.catIdx = S.ladder.indexOf(S.catAlvo);
      if(S.catIdx < 0) throw new Error('Categoria do cenário ausente da escada.');
      S.team = null; Game.startSeason();`); fechar(j);
  }
  /* Reproduz o defeito antigo: calendário inteiro vindo do Mundial. */
  j.run(`S.season.calendar = S.season.calendar.map((e, i) => {
    const t = TRACKS[KART_IDS[i % KART_IDS.length]];
    return { ...e, id:t.id, cc:t.cc, circ:t.circ, gp:t.gp, type:t.type, rainP:t.rainP };
  });
  const recLocalTeste = Engine.runRace(S.season); Game.tally(recLocalTeste);
  S.archive = [{ year:S.year - 1, cat:'Kart Regional', calendar:[{ id:'kt_lon', cc:'IT' }],
    results:[{ r:1, gp:'Lonato', pos:2, pts:20 }] }];
  S.history = [{ year:S.year - 1, cat:'Kart Regional', pos:2, wins:1, pts:20 }];`);
  if(opcoes.fds) j.run(`Engine.garantirFds(S.season, S.season.round);
    S.season.fds.treinos = [{ k:'acerto', ganho:3 }]; S.season.fds.etapa = 'quali';`);
  j.run('Game.save();');
  return { store, antes:JSON.parse(store.vdo_save) };
}

for(const [cc, cat] of [['AR','Kart Regional'], ['AR','Argentino de Kart'], ['ZA','Kart Regional']]){
  const { store, antes } = saveAntigo(cc, cat);
  const n = H.carregar({ silencioso:true, store });
  n.run('Game.continueSave();'); fechar(n);
  const depois = json(n, 'S');
  ok(depois.season.round === antes.season.round && depois.season.round === 1 &&
    JSON.stringify(depois.season.results) === JSON.stringify(antes.season.results),
    `${cc}/${cat}: migração preserva a corrida disputada e o progresso`);
  ok(JSON.stringify(depois.season.calendar[0]) === JSON.stringify(antes.season.calendar[0]) &&
    depois.season.calendar.slice(1).every(e => e.cc === cc && n.run(`TRACKS[${JSON.stringify(e.id)}].cc`) === cc),
    `${cc}/${cat}: corrige somente etapas futuras estrangeiras`);
  ok(JSON.stringify(depois.season.dstand) === JSON.stringify(antes.season.dstand) &&
    JSON.stringify(depois.season.cstand) === JSON.stringify(antes.season.cstand) &&
    JSON.stringify(depois.history) === JSON.stringify(antes.history) &&
    JSON.stringify(depois.archive) === JSON.stringify(antes.archive),
    `${cc}/${cat}: mantém classificação, retrospecto e temporadas arquivadas`);
  const calendarioMigrado = n.run('JSON.stringify(S.season.calendar)');
  n.run('Engine.migrarKartLocal();');
  ok(n.run('JSON.stringify(S.season.calendar)') === calendarioMigrado,
    `${cc}/${cat}: migrar novamente é idempotente`);
  ok(JSON.parse(store.vdo_save).season.calendar.slice(1).every(e => e.cc === cc),
    `${cc}/${cat}: continueSave grava o calendário corrigido`);
}

{
  const { store, antes } = saveAntigo('AR', 'Kart Regional', { fds:true });
  const n = H.carregar({ silencioso:true, store });
  n.run('Game.continueSave();'); fechar(n);
  const depois = json(n, 'S'), atual = antes.season.round;
  ok(JSON.stringify(depois.season.calendar[atual]) === JSON.stringify(antes.season.calendar[atual]) &&
    JSON.stringify(depois.season.fds) === JSON.stringify(antes.season.fds),
    'save com treino em andamento mantém a pista atual e os dados do fim de semana');
  ok(depois.season.calendar.slice(atual + 1).every(e => e.cc === 'AR'),
    'mesmo com treino iniciado, as etapas seguintes são corrigidas para o país');
}

/* A migração não transforma o Mundial de um argentino num campeonato
   argentino, nem toca um campeonato que já está todo correto. */
for(const cat of ['Mundial de Kart', 'Kart Regional']){
  const j = carreira('AR');
  if(cat !== 'Kart Regional'){
    j.run(`S.catAlvo = '${cat}'; S.catIdx = S.ladder.indexOf(S.catAlvo);
      S.team = null; Game.startSeason();`); fechar(j);
  }
  const antes = j.run('JSON.stringify(S.season)');
  j.run('Engine.migrarKartLocal();');
  ok(j.run('JSON.stringify(S.season)') === antes, `${cat}: migração não muda uma temporada já válida`);
}

console.log(`${verificacoes - falhas}/${verificacoes} verificações de kart local passaram.`);
if(falhas) process.exitCode = 1;
