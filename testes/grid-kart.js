/* O regional tem maioria local garantida, com pessoas persistentes no mundo.
   Uso: node testes/grid-kart.js */
const H = require('./base');
let falhas = 0, verificacoes = 0;
const ok = (c, m) => { verificacoes++; if(!c){ falhas++; console.log('  ✗ ' + m); } };
const json = (j, c) => JSON.parse(j.run('JSON.stringify(' + c + ')'));
const fechar = j => j.run('UI.limparFila(); UI.close();');
const J = H.carregar({ silencioso:true });
const maioria = (field, cc) => {
  const rivais = field.filter(f => !f.isMe);
  return rivais.length > 0 && rivais.filter(f => f.cc === cc).length >= Math.ceil(rivais.length * .85);
};

function carreira(cc, ano = 2024, store = {}, serie = 'f1'){
  const j = H.carregar({ silencioso:true, store });
  H.novaCarreira(j, { era:`ERAS.reduce((k,e,i)=>e.y<=${ano}?i:k,0)`, ano,
    idade:8, cc, serie, rapido:false, nome:'Teste Regional' });
  return j;
}

/* Inclui países que não tinham nomes ou pilotos no mundo inicial. */
for(const cc of J.run('COUNTRIES.map(c => c.cc)')){
  const grid = json(J, `(() => {
    const W = Mundo.novo('f1', 2024), g = Mundo.nDegraus('f1', 2024);
    return Mundo.gridDe(W, g, 2024, { n:19, cat:'Kart Regional', cc:${JSON.stringify(cc)} })
      .map(r => ({ name:r.n, cc:r.cc }));
  })()`);
  ok(maioria(grid, cc), `${cc}: pelo menos85% dos19rivais são locais mesmo sem um pool anterior`);
  ok(new Set(grid.map(f => f.name)).size === grid.length && grid.every(f => f.name && !/^Piloto \d+$/.test(f.name)),
    `${cc}: nomes completos únicos de pessoas fictícias`);
  ok(J.run(`!!NOMES_PROPRIOS[${JSON.stringify(cc)}] &&
    (NOMES_PAIS[${JSON.stringify(cc)}] || SOBRENOMES_EXTRA[${JSON.stringify(cc)}] || ['BR','US','AT'].includes(${JSON.stringify(cc)}))`),
    `${cc}: o gerador possui nomes e sobrenomes daquele país`);
}

for(const [cc, ano] of [['AR',1975], ['AR',2024], ['BR',2024], ['IT',2024], ['GB',2024], ['JP',2024], ['VN',2024]]){
  for(let repeticao = 0; repeticao < 2; repeticao++){
    const j = carreira(cc, ano), sea = json(j, 'S.season');
    ok(sea.cat === 'Kart Regional' && maioria(sea.field, cc),
      `${cc}/${ano}/${repeticao}: formulário e Engine.buildSeason geram maioria local`);
    ok(j.run(`S.season.field.filter(f => !f.isMe).every(f => {
      const r = S.mundos[S.series].p[f.mid]; return r && r.cc === f.cc && r.n === f.name;
    })`), `${cc}/${ano}: bandeiras e identidades são as mesmas no grid e no mundo`);
    const antigos = new Set(sea.field.filter(f => !f.isMe).map(f => f.name));
    j.run(`S.year++; S.catAlvo = 'Kart Regional'; S.team = null;
      S.season = Engine.buildSeason();`);
    const proximo = json(j, 'S.season');
    ok(maioria(proximo.field, cc), `${cc}/${ano + 1}: temporada seguinte mantém maioria local`);
    ok(proximo.field.some(f => !f.isMe && antigos.has(f.name)),
      `${cc}/${ano + 1}: parte dos rivais persiste no ano seguinte`);
  }
}

/* Continuidade não pode perpetuar um grid internacional antigo. Não há
   conversão de nacionalidade: o estrangeiro conserva a própria identidade. */
{
  const resultado = json(J, `(() => {
    const W = Mundo.novo('f1', 2024), g = Mundo.nDegraus('f1', 2024), deg = Mundo.degraus('f1', 2024)[g];
    const antigos = Array.from({ length:19 }, () => {
      const r = Mundo.inventar(W, g, 2024, 'GB', 12, deg);
      r.camp = 'Kart Regional'; r.campAno = 2023; return { id:r.id, n:r.n, cc:r.cc };
    });
    const real = Mundo.real(W, 'f1', 'Lewis Hamilton', 2024, g, 'GB');
    real.camp = 'Kart Regional'; real.campAno = 2023;
    const grid = Mundo.gridDe(W, g, 2024, { n:19, cat:'Kart Regional', cc:'AR' });
    return { grid:grid.map(r => ({ name:r.n, cc:r.cc })),
      identidades:antigos.every(a => W.p[a.id].n === a.n && W.p[a.id].cc === a.cc),
      real:W.p[real.id].cc === 'GB' && W.p[real.id].n === 'Lewis Hamilton' };
  })()`);
  ok(maioria(resultado.grid, 'AR'), 'grid estrangeiro herdado não elimina a maioria argentina');
  ok(resultado.identidades && resultado.real, 'estrangeiros reais e fictícios conservam nome e nacionalidade originais');
}

/* O país explícito prevalece sobre S, C, a escada global britânica e idioma. */
{
  const j = carreira('BR');
  j.run("C = { cc:'JP', cat:'Kart Regional' };");
  const grid = json(j, `(() => {
    const W = Mundo.novo('f1', 2024), g = Mundo.nDegraus('f1', 2024);
    return Mundo.gridDe(W, g, 2024, { n:19, cat:'Kart Regional', cc:'AR' }).map(r => ({ cc:r.cc }));
  })()`);
  ok(maioria(grid, 'AR'), 'país explícito argentino não herda nacionalidade de S, C ou Mundo.degraus');
  ok(j.run("mixNacional('Kart Regional') === null"), 'API sem país explícito não consulta estados globais');
}

for(const cat of ['Mundial de Kart', 'Fórmula 3', 'Fórmula 2']){
  const grid = json(J, `(() => {
    const W = Mundo.novo('f1', 2024), g = Mundo.degrauDe('f1', 2024, ${JSON.stringify(cat)});
    return Mundo.gridDe(W, g, 2024, { n:19, cat:${JSON.stringify(cat)}, cc:'AR' }).map(r => ({ cc:r.cc }));
  })()`);
  ok(new Set(grid.map(f => f.cc)).size >= 3 && !maioria(grid, 'AR'), `${cat}: continua internacional`);
}

/* Um antigo save com o grid global pode ser reparado antes do primeiro
   fim de semana. Assentos, atributos, jogador e pessoas do mundo ficam. */
function gridAntigo(opcao){
  const store = {}, j = carreira('AR', 2024, store);
  j.run(`(() => {
    const W = Engine.garantirMundo(), g = Mundo.degrauDe(S.series, S.year, S.season.cat, S.catIdx, S.ladder.length),
      deg = Mundo.degraus(S.series, S.year)[g];
    S.season.field.filter(f => !f.isMe).forEach(f => {
      const r = Mundo.inventar(W, g, S.year, 'GB', 12, deg);
      r.camp = S.season.cat; r.campAno = S.year;
      f.mid = r.id; f.name = r.n; f.cc = r.cc; f.doc = false;
    });
  })()`);
  if(opcao === 'corrida') j.run('const resGridAntigo = Engine.runRace(S.season); Game.tally(resGridAntigo);');
  if(opcao === 'fds') j.run('Engine.garantirFds(S.season, 0);');
  return { j, store };
}
{
  const { j, store } = gridAntigo();
  const antes = json(j, 'S.season');
  const estrangeiros = json(j, 'S.season.field.filter(f => !f.isMe).map(f => ({ ...S.mundos[S.series].p[f.mid] }))');
  ok(j.run('Engine.migrarGridKartLocal()'), 'migração repara o grid global antes da primeira corrida');
  const depois = json(j, 'S.season');
  ok(maioria(depois.field, 'AR'), 'save antigo reparado tem maioria argentina');
  ok(antes.field.every((f, i) => f.id === depois.field[i].id && f.teamId === depois.field[i].teamId &&
    f.skill === depois.field[i].skill && f.qb === depois.field[i].qb && f.rb === depois.field[i].rb),
    'migração conserva slots, equipes, habilidade e tendências');
  ok(JSON.stringify(antes.field.find(f => f.isMe)) === JSON.stringify(depois.field.find(f => f.isMe)) &&
    JSON.stringify(antes.results) === JSON.stringify(depois.results), 'migração preserva jogador e resultados');
  ok(estrangeiros.every(r => j.run(`S.mundos[S.series].p[${JSON.stringify(r.id)}].n`) === r.n &&
    j.run(`S.mundos[S.series].p[${JSON.stringify(r.id)}].cc`) === r.cc),
    'migração não renomeia nem muda nacionalidade dos antigos rivais no mundo');
  ok(!j.run('Engine.migrarGridKartLocal()'), 'migração é idempotente');
  const nomes = depois.field.map(f => f.name).join('|');
  j.run('Game.save();');
  const n = H.carregar({ silencioso:true, store });
  n.run('Game.continueSave();'); fechar(n);
  ok(n.run('S.season.field.map(f => f.name).join("|")') === nomes,
    'salvar e reabrir conserva os mesmos rivais e nomes');
}
{
  const { j, store } = gridAntigo();
  j.run('Game.save()');
  const reaberto = H.carregar({ silencioso:true, store });
  reaberto.run('Game.continueSave()'); fechar(reaberto);
  ok(maioria(json(reaberto,'S.season.field'),'AR'), 'abrir save antigo aciona a migração automaticamente');
  ok(maioria(JSON.parse(store.vdo_save).season.field,'AR'), 'migração automática já fica salva');
}
for(const opcao of ['corrida','fds']){
  const { j } = gridAntigo(opcao), antes = j.run('JSON.stringify(S.season)');
  ok(!j.run('Engine.migrarGridKartLocal()') && j.run('JSON.stringify(S.season)') === antes,
    `${opcao}: migração conserva integralmente um campeonato que já começou`);
}

console.log(`${verificacoes} verificações do grid regional: ${falhas ? falhas + ' falharam' : 'tudo certo'}`);
process.exitCode = falhas ? 1 : 0;
