/* A academia acompanha a formação enquanto o piloto entrega resultados;
   a avaliação pode dispensar, e o primeiro campeonato de topo conclui o
   vínculo. As propostas válidas isolam a assinatura da sorte no mercado. */
const H = require('./base');
let falhas = 0;
const ok = (c, m) => { if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };
const FDA = 'Ferrari Driver Academy';
const fechar = J => J.run('UI.limparFila(); UI.close();');

function carreira(store){
  const J = H.carregar({ silencioso:true, store:store || {} });
  H.novaCarreira(J, { era:7, ano:2024, idade:19, rapido:false, modo:'classico' });
  J.run(`S.catIdx = S.ladder.findIndex(c => /Fórmula Regional/.test(c));
    if(S.catIdx < 0) throw new Error('A escada do teste precisa da Fórmula Regional.');
    S.catAlvo = S.ladder[S.catIdx]; S.team = null;
    Game.startSeason(); UI.limparFila(); UI.close();
    S.driver.fame = 20; S.driver.morale = 75;
    S.lastSum = Engine.summary(S.season);
    S._acadList = [ACADEMIES.find(a => a.n === '${FDA}')];
    Game.joinAcademy(0); UI.limparFila(); UI.close();`);
  return J;
}

function assinar(J, cat, sk){
  J.run(`(() => {
    const sk = ${JSON.stringify(sk || null)} || S.series, ano = S.year + 1;
    const era = eraOfSeries(ano, sk);
    const escada = resolveLadder(era.ladder, S.driver.cc, ano, Engine.escolhas(sk));
    const cat = ${JSON.stringify(cat)} || escada[escada.length - 1];
    const idx = escada.indexOf(cat);
    if(idx < 0) throw new Error('Categoria ausente da escada: ' + cat);
    const equipes = Engine.teamsFor(cat, ano, sk, idx, escada.length);
    const team = equipes.find(t => t.name === 'Mercedes') || equipes[0];
    if(!team) throw new Error('Proposta de teste sem equipe.');
    S.promessasAtivas = []; S.sementes = [];
    S.pendingOffers = [{ type:'f1', cat, sk, escada, catIdx:idx,
      team, years:1, podeP:true, up:true, promessas:[] }];
    Game.takeOffer(0); UI.limparFila(); UI.close();
  })()`);
}

/* Usa a mesma sequência de sorteios em cada comparação. Não altera
   Math.random nem depende da ordem em que outros testes sejam executados. */
function sondar(J, talento, n = 160){
  return J.run(`(() => {
    const cfg = ${JSON.stringify(talento)};
    Object.keys(S.driver.attr).forEach(k => { S.driver.attr[k] = cfg.hab; S.driver.pot[k] = cfg.pot; });
    S.driver.ovr = Engine.ovr(S.driver.attr); S.driver.fame = 20; S.driver.age = 17;
    S.season.field.forEach(f => { f.skill = 65; });
    S.season.mediaSkill = 65;
    S.season.teams.forEach(t => { t.str = 70; }); S.team.str = 70;
    const pos = cfg.pos || Math.max(1, Math.ceil(S.season.field.length * cfg.faixa));
    const sum = { ...Engine.summary(S.season), pos, champion:pos === 1, races:10, total:10,
      tmWins:Math.round(cfg.duelo * 10), tmRaces:10, wins:pos === 1 ? 5 : 0,
      podiums:pos <= 3 ? 7 : 0 };
    const perfil = Engine.academyPerfil(sum), nomes = new Set();
    let quantos = 0, estado = 0x243f6a88;
    const rnd = () => { estado = (Math.imul(estado, 1664525) + 1013904223) >>> 0; return estado / 4294967296; };
    const original = { ...R };
    R.f = rnd; R.chance = p => rnd() < p;
    R.int = (a,b) => a + Math.floor(rnd() * (b - a + 1));
    R.range = (a,b) => a + rnd() * (b - a); R.pick = a => a[R.int(0, a.length - 1)];
    R.shuffle = lista => { const a = lista.slice();
      for(let i = a.length - 1; i > 0; i--){ const j = R.int(0,i); [a[i],a[j]] = [a[j],a[i]]; } return a; };
    try {
      for(let i = 0; i < ${n}; i++){
        const convites = Engine.academyOffers(sum);
        if(convites.length) quantos++;
        convites.forEach(a => nomes.add(a.n));
      }
    } finally { Object.assign(R, original); }
    return { perfil, quantos, nomes:Array.from(nomes), sum };
  })()`);
}

/* Aceitar já deve atualizar a ficha e o armazenamento, antes de assinar
   qualquer equipe ou de jogar outra corrida. */
{
  const store = {}, J = carreira(store);
  ok(J.run('S.academy && S.academy.n') === FDA, 'aceitar o convite torna o piloto membro da Ferrari');
  ok(JSON.parse(store.vdo_save).academy?.n === FDA, 'a aceitação é salva imediatamente');
  ok(J.E('drvCard').innerHTML.includes(FDA), 'a ficha mostra a academia assim que o convite é aceito');
  const fame = J.run('S.driver.fame');
  J.run('Game.joinAcademy(0); UI.limparFila(); UI.close();');
  ok(J.run('S.driver.fame') === fame && fame === 28, 'clique repetido não duplica a fama nem remove a academia');
  const N = H.carregar({ silencioso:true, store });
  N.run('Game.continueSave(); UI.limparFila(); UI.close();');
  ok(N.run('S.academy && S.academy.n') === FDA, 'fechar e abrir o jogo mantém a filiação aceita');
}

/* As equipes que correm na base não precisam pertencer à fábrica da F1. */
{
  const J = carreira();
  const cats = J.run('S.ladder.slice(S.catIdx, -1)');
  for(const cat of cats){
    assinar(J, cat);
    ok(J.run('S.season.cat') === cat && !J.run('S.season.isTop') && J.run('S.academy && S.academy.n') === FDA,
      'mantém a Ferrari ao assinar com uma equipe da ' + cat);
  }
  const ano = J.run('S.year');
  J.run(`const teamInvalidoAcad = { id:'t0', name:'Mercedes', color:'#00d2be', str:80 };
    S.pendingOffers = [{ type:'f1', cat:Engine.topCat(), team:teamInvalidoAcad, years:1, podeP:false, paga:1e9 }];
    Game.takeOffer(0); UI.limparFila(); UI.close();`);
  ok(J.run('S.year') === ano && J.run('S.academy && S.academy.n') === FDA,
    'proposta fora do orçamento não altera o vínculo');
  J.run(`S.pendingOffers = [{ type:'f1', cat:Engine.topCat(), team:teamInvalidoAcad, years:1, retirada:true }];
    Game.takeOffer(0); UI.limparFila(); UI.close();`);
  ok(J.run('S.year') === ano && J.run('S.academy && S.academy.n') === FDA,
    'proposta retirada não altera o vínculo');
}

/* Uma troca de equipe não é uma dispensa. O desempenho é avaliado à parte:
   o mesmo ano não pode ser sorteado várias vezes, nem ao recarregar. */
{
  const store = {}, J = carreira(store);
  J.run(`S.driver.age = 22; S.driver.fame = 0;
    Object.keys(S.driver.attr).forEach(k => { S.driver.attr[k] = 35; S.driver.pot[k] = 45; });
    S.driver.ovr = Engine.ovr(S.driver.attr);
    S.academy.desde = S.year - 3; S.academy.anosRuins = 2;
    S.season.field.forEach((f, i) => { S.season.dstand[f.id] = f.isMe ? 0 : 100 + i; });
    S.season.round = S.season.calendar.length;
    S.season.results = S.season.calendar.map((_, i) => ({ r:i + 1, pos:S.season.field.length,
      grid:S.season.field.length, pts:0, dnf:false, tmPos:2, tmGrid:2 }));
    S.lastSum = Engine.summary(S.season);`);
  const primeira = J.run(`(() => { const chance = R.chance; R.chance = () => false;
    try { return Engine.academyReview(S.lastSum); } finally { R.chance = chance; } })()`);
  ok(primeira === null && J.run('S.academy && S.academy.n') === FDA,
    'um piloto em má fase pode receber outra oportunidade na avaliação');
  const revisao = J.run(`(() => { let sorteios = 0; const chance = R.chance;
    R.chance = () => { sorteios++; return true; };
    try { return { resultado:Engine.academyReview(S.lastSum), sorteios }; }
    finally { R.chance = chance; } })()`);
  ok(revisao.resultado === null && revisao.sorteios === 0 && J.run('S.academy && S.academy.n') === FDA,
    'avaliar novamente o mesmo ano não sorteia uma nova decisão');
  J.run('Game.save();');
  const N = H.carregar({ silencioso:true, store });
  N.run('Game.continueSave(); UI.limparFila(); UI.close();');
  const recarregada = N.run(`(() => { let sorteios = 0; const chance = R.chance;
    R.chance = () => { sorteios++; return true; };
    try { return { resultado:Engine.academyReview(S.lastSum), sorteios, ruins:S.academy.anosRuins }; }
    finally { R.chance = chance; } })()`);
  ok(recarregada.resultado === null && recarregada.sorteios === 0 && recarregada.ruins >= 2,
    'recarregar preserva a avaliação feita e os anos ruins acumulados');
  assinar(N, N.run('S.season.cat'));
  N.run(`S.season.field.forEach((f, i) => { S.season.dstand[f.id] = f.isMe ? 0 : 100 + i; });
    S.season.round = S.season.calendar.length;
    S.season.results = S.season.calendar.map((_, i) => ({ r:i + 1, pos:S.season.field.length,
      grid:S.season.field.length, pts:0, dnf:false, tmPos:2, tmGrid:2 }));`);
  N.run(`(() => { const chance = R.chance; R.chance = () => true;
    try { Game.endSeason(); } finally { R.chance = chance; } })(); UI.limparFila(); UI.close();`);
  ok(!N.run('S.academy') && N.run('S.exAcademia && S.exAcademia.motivo') === 'desempenho',
    'outra temporada ruim pode levar à dispensa efetiva pela academia');
  const corte = N.run('JSON.stringify(S.exAcademia)');
  N.run('Game.save();');
  const Depois = H.carregar({ silencioso:true, store });
  Depois.run('Game.continueSave(); UI.limparFila(); UI.close();');
  ok(!Depois.run('S.academy') && Depois.run('JSON.stringify(S.exAcademia)') === corte,
    'salvar e recarregar não desfaz uma dispensa por desempenho');
}

/* Um título ou pódio no campeonato garante a continuidade mesmo com uma
   sequência antiga de anos ruins e o sorteio desfavorável. */
for(const pos of [1, 2, 3]){
  const J = carreira();
  const corte = J.run(`(() => { S.academy.anosRuins = 3; S.academy.desde = S.year - 3;
    const chance = R.chance; R.chance = () => true;
    try { return Engine.academyReview({ ...Engine.summary(S.season), pos:${pos}, champion:${pos === 1}, races:10, total:10 }); }
    finally { R.chance = chance; } })()`);
  ok(corte === null && J.run('S.academy && S.academy.n') === FDA,
    'terminar em ' + pos + 'º no campeonato protege o vínculo na avaliação');
}

{
  const J = carreira();
  J.run(`UI._sem = { k:'cobranca_academia' }; Game.escolherSemente(2); UI.limparFila(); UI.close();`);
  ok(J.run('S.academy && S.academy.n') === FDA, 'a cobrança do programa permite resolver a situação sem expulsar o piloto');
}

{
  const J = carreira();
  const cat = J.run(`(() => { const e = eraOfSeries(S.year + 1, 'indy');
    const l = resolveLadder(e.ladder, S.driver.cc, S.year + 1, Engine.escolhas('indy')); return l[l.length - 2]; })()`);
  assinar(J, cat, 'indy');
  ok(J.run('S.series') === 'indy' && !J.run('S.season.isTop') && J.run('S.academy && S.academy.n') === FDA,
    'trocar da base europeia para a base da Indy mantém o programa');
}

/* No modo realista, o apoio precisa continuar entrando no orçamento e no
   caixa da temporada, e deixar de entrar quando a formação terminar. */
{
  const J = carreira();
  J.run("S.modo = 'realista'; S.money.saldo = 30e6;");
  for(const cat of ['Fórmula 3', 'Fórmula 2']){
    assinar(J, cat);
    const r = J.run(`(() => {
      const comAcademia = Engine.balancoAno(), ac = S.academy;
      S.academy = null;
      const semAcademia = Engine.balancoAno();
      S.academy = ac;
      return { ac:ac && ac.n, com:comAcademia, sem:semAcademia, caixa:S.money.hist[0] };
    })()`);
    ok(r.ac === FDA && r.com.apoio > 0 && r.com.liquido > r.sem.liquido,
      'modo realista: a Ferrari reduz o custo líquido na ' + cat);
    ok(r.caixa.ano === J.run('S.year') && r.caixa.apoio === r.com.apoio,
      'modo realista: o caixa da ' + cat + ' recebeu o apoio da academia');
  }
  assinar(J, null, 'f1');
  ok(!J.run('S.academy') && J.run('Engine.apoioAcademia(1e6)') === 0 &&
      J.run('Engine.balancoAno().apoio') === 0 && J.run('S.money.hist[0].apoio') === 0,
    'modo realista: a estreia na F1 encerra o apoio à formação');
}

/* Todas as sete carreiras concluem a formação ao alcançar seu próprio topo,
   inclusive quando a assinatura é com uma equipe de outra fábrica. */
for(const sk of ['f1', 'indy', 'wec', 'stock', 'nascar', 'dtm', 'fe']){
  const J = carreira();
  const antes = J.run('({ fame:S.driver.fame, moral:S.driver.morale, desde:S.academy.desde })');
  assinar(J, null, sk);
  const r = J.run('({ topo:S.season.isTop, cat:S.season.cat, ano:S.year, ac:S.academy, ex:S.exAcademia, fame:S.driver.fame, moral:S.driver.morale })');
  ok(r.topo && !r.ac && r.ex?.n === FDA && r.ex.motivo === 'formacao' && r.ex.cat === r.cat && r.ex.ano === r.ano && r.ex.desde === antes.desde,
    sk + ': estreia no topo conclui a academia e preserva o registro da formação');
  ok(r.fame === antes.fame && r.moral === antes.moral, sk + ': formar-se não tira fama nem moral');
  ok(/Formação concluída/i.test(J.E('drvCard').innerHTML) && J.E('drvCard').innerHTML.includes(FDA),
    sk + ': a ficha mostra que o piloto foi formado pela Ferrari');
  if(sk === 'f1'){
    const assinatura = J.run('JSON.stringify(S.exAcademia)');
    J.run('Engine.concluirAcademia();');
    ok(J.run('JSON.stringify(S.exAcademia)') === assinatura, 'a conclusão não se repete nem reescreve a formação');
    const catBase = J.run('S.ladder[S.ladder.length - 2]');
    assinar(J, catBase);
    const qtd = J.run(`(() => { const original = R.chance; R.chance = () => true;
      try { return Engine.academyOffers({ pos:1, champion:true }).length; } finally { R.chance = original; } })()`);
    ok(!J.run('S.academy') && qtd === 0, 'voltar à base após se formar não oferece uma nova academia');
  }
}

/* Convites variam com resultado, habilidade e potencial. Os nomes dos
   programas e das categorias vêm dos catálogos, sem privilegiar Ferrari
   ou Fórmula Regional na geração de propostas. */
{
  const J = carreira(), programas = new Set(), categorias = new Set();
  J.run('S.academy = null; S.exAcademia = null; S.academyDropped = null;');
  const base = J.run('S.ladder.slice(0, -1)');
  let geracionais = 0, bons = 0, ruins = 0, perfisOrdenados = true;
  for(const cat of base){
    J.run(`S.catIdx = S.ladder.indexOf(${JSON.stringify(cat)}); S.catAlvo = ${JSON.stringify(cat)};
      S.team = null; Game.startSeason(); UI.limparFila(); UI.close();`);
    const g = sondar(J, { hab:78, pot:96, pos:1, duelo:1 });
    const b = sondar(J, { hab:65, pot:82, faixa:.25, duelo:.7 });
    const r = sondar(J, { hab:48, pot:63, faixa:.8, duelo:.2 });
    geracionais += g.quantos; bons += b.quantos; ruins += r.quantos;
    perfisOrdenados = perfisOrdenados && g.perfil.interesse > b.perfil.interesse && b.perfil.interesse > r.perfil.interesse;
    if(g.quantos && b.quantos) categorias.add(cat);
    g.nomes.concat(b.nomes).forEach(n => programas.add(n));
  }
  ok(perfisOrdenados && geracionais > bons && bons > ruins,
    'mesmos sorteios e grids: talento geracional recebe mais convites que piloto bom, e bom mais que ruim');
  ok(categorias.size >= 4, 'o interesse das academias aparece em várias categorias de base');
  ok(programas.size >= 4, 'as amostras produzem programas variados, sem uma academia fixa');
  console.log('  convites nas amostras: geracional ' + geracionais + ', bom ' + bons + ', ruim ' + ruins + '; ' + programas.size + ' programas em ' + categorias.size + ' categorias');

  const destaque = sondar(J, { hab:70, pot:96, faixa:.55, duelo:.7 });
  const comum = sondar(J, { hab:70, pot:72, faixa:.55, duelo:.7 });
  ok(destaque.quantos > 0 && comum.quantos === 0,
    'potencial excepcional com bom duelo pode chamar atenção fora do grupo dos primeiros');
  const nenhum = J.run(`(() => { const chance = R.chance; R.chance = () => false;
    try { return Engine.academyOffers({ ...Engine.summary(S.season), pos:1, champion:true, races:10, total:10 }).length; }
    finally { R.chance = chance; } })()`);
  ok(nenhum === 0, 'até um campeão pode passar o ano sem convite quando o sorteio não favorece');
  const bloqueios = J.run(`(() => { const chance = R.chance; R.chance = () => true;
    const sum = { ...Engine.summary(S.season), pos:1, champion:true, races:10, total:10 };
    try {
      S.driver.age = 24; const idade = Engine.academyOffers(sum).length;
      S.driver.age = 17; S.season.isTop = true; const topo = Engine.academyOffers(sum).length;
      S.season.isTop = false; const cedo = Engine.academyOffers({ ...sum, races:2 }).length;
      return { idade, topo, cedo };
    } finally { R.chance = chance; } })()`);
  ok(bloqueios.idade === 0 && bloqueios.topo === 0 && bloqueios.cedo === 0,
    'convites respeitam idade, formação na base e mínimo de corridas observadas');

  J.run(`S.exAcademia = { n:'${FDA}', motivo:'desempenho', ano:S.year };`);
  const recente = sondar(J, { hab:78, pot:96, pos:1, duelo:1 });
  J.run('S.exAcademia.ano = S.year - 3;');
  const antiga = sondar(J, { hab:78, pot:96, pos:1, duelo:1 });
  ok(!recente.nomes.includes(FDA) && antiga.nomes.includes(FDA),
    'o programa que dispensou o piloto espera antes de voltar a convidá-lo');
}

/* As restrições se aplicam aos programas efetivamente sorteados, inclusive
   em épocas anteriores à existência das academias modernas. */
for(const c of [
  { ano:1985, cc:'GB', sk:'f1' }, { ano:1996, cc:'BR', sk:'f1' },
  { ano:2024, cc:'IT', sk:'f1' }, { ano:2024, cc:'US', sk:'indy' },
  { ano:2024, cc:'BR', sk:'stock' }
]){
  const J = carreira();
  J.run(`S.academy = null; S.exAcademia = null; S.academyDropped = null;
    S.year = ${c.ano}; S.season.year = ${c.ano}; S.driver.cc = '${c.cc}'; S.series = '${c.sk}';`);
  const r = sondar(J, { hab:78, pot:96, pos:1, duelo:1 });
  const elegiveis = J.run(`ACADEMIES.filter(a => ${c.ano + 1} >= a.from && (!a.to || ${c.ano + 1} <= a.to)
    && (!a.cc || a.cc === '${c.cc}') && (!a.sk || a.sk === '${c.sk}')).map(a => a.n)`);
  ok(r.nomes.length > 0 && r.nomes.every(n => elegiveis.includes(n)),
    'convites de ' + c.ano + ' para ' + c.cc + '/' + c.sk + ' respeitam época, país e carreira');
}

/* Carreiras existentes devem continuar funcionando: há pista recuperável
   no antigo registro de saída, mas não se inventa filiação sem registro. */
for(const tipo of ['contrato', 'desempenho', 'sem-registro', 'historico-topo', 'arquivo-topo', 'desempenho-topo', 'ativa-topo']){
  const store = {}, J = carreira(store);
  J.run(`S.academyDropped = null; S.exAcademia = null;
    S.history = []; S.archive = [];`);
  if(tipo === 'ativa-topo'){
    /* Emula save antigo que já estava no topo e ainda tinha academia ativa. */
    J.run(`S.catIdx = S.ladder.length - 1; S.season.isTop = true;
      S.season.cat = Engine.topCat(); S.lastCat = S.season.cat;`);
  } else {
    J.run('S.academy = null;');
    if(tipo === 'desempenho' || tipo === 'desempenho-topo') J.run(`S.academyDropped = '${FDA}';`);
    else if(tipo !== 'sem-registro') J.run(`S.exAcademia = { n:'${FDA}', ano:S.year, motivo:'contrato' };`);
    if(tipo === 'historico-topo' || tipo === 'desempenho-topo') J.run(`S.history = [{ year:2023, cat:'Fórmula 1', isTop:true }];`);
    if(tipo === 'arquivo-topo') J.run(`S.archive = [{ year:2023, cat:'Fórmula 1', isTop:true, results:[] }];`);
  }
  J.run('Game.save();');
  const N = H.carregar({ silencioso:true, store });
  N.run('Game.continueSave(); UI.limparFila(); UI.close();');
  if(tipo === 'contrato'){
    ok(N.run('S.academy && S.academy.n') === FDA, 'save antigo (' + tipo + '): restaura a academia ainda na base');
    ok(N.run('S.academy && S.academy.peso') === 1.12 && !/desde null/.test(N.E('drvCard').innerHTML),
      'save antigo (' + tipo + '): recupera os benefícios e apresenta a ficha sem data inventada');
  } else if(tipo === 'ativa-topo'){
    ok(!N.run('S.academy') && N.run('S.exAcademia && S.exAcademia.motivo') === 'formacao',
      'save antigo com academia ativa no topo registra a conclusão ao carregar');
  } else if(tipo === 'historico-topo' || tipo === 'arquivo-topo'){
    ok(!N.run('S.academy') && N.run('S.exAcademia && S.exAcademia.n') === FDA &&
        N.run('S.exAcademia.motivo') === 'formacao' && N.run('S.exAcademia.ano') === 2023,
      'save antigo (' + tipo + '): registra a formação concluída sem reativar benefícios');
  } else {
    ok(!N.run('S.academy'), 'save antigo (' + tipo + '): não cria um vínculo indevido');
  }
}

console.log(falhas ? falhas + ' falha(s)' : 'academias: vínculos, desempenho e formação verificados');
if(falhas) process.exitCode = 1;
