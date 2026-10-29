/* Atualização da comunidade, fase 6: testes finais e compatibilidade.
   — um save de piloto gravado antes da ficha, dos rivais históricos e do dinheiro novo
     (testes/fixtures/piloto-antes-comunidade3.json) abre, ganha os campos novos e joga
     mais duas temporadas;
   — um save de chefe gravado antes das instalações que envelhecem, com empréstimo e obra
     em andamento (chefe-antes-comunidade4.json), abre e segue: a parcela antiga continua
     a mesma, a idade das instalações nasce sem castigo;
   — uma carreira longa de piloto, no modo realista e com risco, do começo à aposentadoria,
     com tudo ligado (ficha, foco, equipe pessoal, patrocínio, lesão, rivais), e a passagem
     para chefe de equipe;
   — o resultado depende do piloto: mesma semente, o piloto melhor soma mais; mesma semente
     e mesmas escolhas, a mesma temporada;
   — decisões contam: o acerto certo dá mais carro que o errado; a ficha muda o formato do
     piloto, não o tamanho.
   Uso: node testes/fase6.js   Não modifica arquivos nem saves. */
'use strict';
const H = require('./base');
const fs = require('fs'), path = require('path');
let falhas = 0, n = 0;
const ok = (c, m) => { n++; if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };
const js = (J, code) => JSON.parse(J.run('JSON.stringify(' + code + ')'));
const numeros = o => JSON.stringify(o, (k, v) => typeof v === 'number' && !Number.isFinite(v) ? '__ruim__' : v).indexOf('__ruim__') < 0;

/* 1. save de piloto de antes */
{
  const antigo = fs.readFileSync(path.join(__dirname, 'fixtures', 'piloto-antes-comunidade3.json'), 'utf8');
  const a = JSON.parse(antigo);
  ok(!a.driver.perf && a.rel && a.rel.rival && !a.rel.antigos && a.modo === 'realista', `a fixture é um save de piloto de ${a.season.year} sem ficha nem rivais históricos, com um rival ativo`);
  const store = { vdo_save: antigo };
  const J = H.carregar({ silencioso: true, seed: 7, store });
  let erro = null;
  try { J.run('Game.continueSave(); UI.limparFila(); UI.close();'); } catch(e){ erro = e.message; }
  ok(!erro && J.run('S && S.driver.name') === 'Fixture Piloto', 'o save antigo abre na versão nova' + (erro ? ': ' + erro : ''));
  const r = js(J, `(() => { const out = {};
    out.telas = (() => { try { UI.render(); UI.fichaModal(); UI.financas(); UI.pessoas(); UI.close(); return true; } catch(e){ return e.message; } })();
    out.ficha = Engine.ficha(); out.ovr = S.driver.ovr; return out; })()`);
  ok(r.telas === true && r.ficha && Object.keys(r.ficha).length === 6 && numeros(r), 'a ficha nasce do piloto e as telas novas abrem (ficha, finanças, parceiros)' + (r.telas !== true ? ': ' + r.telas : ''));
  let fim = null;
  try { for(let i = 0; i < 2; i++){ const t = H.temporada(J); if(t.fim) fim = t.fim; } } catch(e){ erro = e.message; }
  const d = js(J, '{ ano: S.year, money: S.money, perf: S.driver.perf, rel: { rival: S.rel.rival || null, antigos: S.rel.antigos || [] }, retired: !!S.retired }');
  ok(!erro && d.ano >= a.season.year + 2 && numeros(d), `e joga mais duas temporadas (${d.ano})${fim ? ' · ' + fim : ''}${erro ? ': ' + erro : ''}`);
  ok(Array.isArray(d.rel.antigos), 'os rivais passam a ter ativo e histórico');
}

/* 2. save de chefe de antes */
{
  const antigo = fs.readFileSync(path.join(__dirname, 'fixtures', 'chefe-antes-comunidade4.json'), 'utf8');
  const a = JSON.parse(antigo);
  ok(!a.instalAno && a.divida && a.divida.restam > 0 && a.obras && Object.keys(a.obras).length, `a fixture é um save de chefe de ${a.ano} com empréstimo e obra em andamento, sem a idade das instalações`);
  const store = { vdo_chefe: antigo };
  const J = H.carregar({ silencioso: true, seed: 9, store });
  J.run(require('./chefe-comum'));
  let erro = null;
  try { J.run('UIC.continuar(); UI.limparFila(); UI.close();'); } catch(e){ erro = e.message; }
  ok(!erro && J.run('C && C.chefe.nome') === 'Fixture Chefe', 'o save antigo abre na versão nova' + (erro ? ': ' + erro : ''));
  const r = js(J, `(() => { const out = { parcela0: C.divida.parcela };
    out.idade = Chefe.idadeInstal('fabrica'); out.obs = Chefe.obsoleto('fabrica'); out.ef = Chefe.eficiencia('aero');
    out.telas = (() => { try { UIC.instalacoes(); UIC.pagina('financas'); UI.close(); return true; } catch(e){ return e.message; } })();
    const sea = C.temporada; while(sea.round < sea.calendar.length) Chefe.correr();
    Chefe.fimDeTemporada(); Chefe.proximoAno(); UI.limparFila(); UI.close(); __inverno(); out.parcela1 = C.divida ? C.divida.parcela : null; out.ano = C.ano; Chefe.comecarTemporada(); UI.limparFila(); UI.close();
    out.restam = C.divida ? C.divida.restam : 0; out.obra = C.obras; out.instAno = C.instalAno; return out; })()`);
  ok(r.idade === 0 && r.obs === 0 && r.ef > 0 && r.telas === true, 'a idade das instalações nasce sem castigo para quem já tinha a fábrica' + (r.telas !== true ? ': ' + r.telas : ''));
  ok(r.parcela1 === r.parcela0 && r.restam === a.divida.restam - 1, 'o empréstimo antigo segue com a parcela combinada');
  ok(r.instAno && r.instAno.tunel === a.obras.tunel.pronto, 'a obra que estava em andamento termina e conta a idade a partir de quando ficou pronta');
}

/* 3. carreira longa de piloto, com tudo ligado, até a aposentadoria e a passagem para chefe */
{
  const store = {};
  const J = H.carregar({ silencioso: true, seed: 44, store });
  J.run(require('./chefe-comum'));
  H.novaCarreira(J, { era: 7, ano: 1998, idade: 16, serie: 'f1', modo: 'realista', cc: 'IT', nome: 'Longo Teste', risco: true });
  let erro = null, anos = 0, focos = 0, pessoal = 0, nacionais = 0, ofertas = 0;
  const ruins = [];
  try {
    for(let i = 0; i < 30 && !J.run('!!S.retired'); i++){
      /* o jogador escolhe um foco por ano e mantém um preparador físico quando pode */
      J.run(`(() => { const ks = Object.keys(FOCOS); if(S.season && S.season.round === 0) Game.escolherFoco(ks[${i} % ks.length]);
        if(S.money && S.money.saldo > 3e5 && !(S.pessoal && S.pessoal.fisico)) Game.contratarPessoal('fisico'); UI.close(); })()`);
      if(J.run('Engine.focoAtivo()')) focos++;
      if(J.run('!!(S.pessoal && S.pessoal.fisico)')) pessoal++;
      const of = js(J, '(S.patroOfertas || []).map(o => o.cc)');
      ofertas += of.length; nacionais += of.filter(c => c === 'IT').length;
      const t = H.temporada(J); anos++;
      const v = js(J, '{ money: S.money, perf: S.driver.perf, attr: S.driver.attr, ovr: S.driver.ovr, cond: S.driver.condicao == null ? 100 : S.driver.condicao }');
      if(!numeros(v)) ruins.push(J.run('S.year') + ': número inválido');
      if(Object.values(v.perf || {}).some(x => x < 20 || x > 99)) ruins.push(J.run('S.year') + ': ficha fora da faixa');
      if(t.fim) break;
    }
    if(!J.run('!!S.retired')) J.run('Game.endCareer("escolha"); UI.close();');
  } catch(e){ erro = e.message; }
  ok(!erro && anos >= 8 && !ruins.length, `${anos} temporadas jogadas sem erro e sem número inválido${erro ? ': ' + erro : ''}${ruins.length ? ' · ' + ruins.slice(0, 3).join(', ') : ''}`);
  ok(focos >= anos - 2 && pessoal >= 1, `foco escolhido em ${focos} anos e preparador físico em ${pessoal}`);
  ok(ofertas === 0 || nacionais / ofertas >= .4, `um piloto italiano recebe sobretudo marcas italianas (${nacionais} de ${ofertas})`);
  ok(!!store.vdo_hall && J.run('ExPiloto.pode()'), 'a carreira terminou, foi para a galeria, e a passagem para chefe fica disponível');
  const eq = js(J, 'ExPiloto.equipes()');
  if(eq.length) J.run(`ExPiloto.comecar(${eq[eq.length - 1].idx})`);
  const c = js(J, 'C && { nome: C.chefe.nome, ex: C.exPiloto && C.exPiloto.nome, ano: C.ano, rep: C.rep }');
  ok(eq.length && c && c.nome === 'Longo Teste' && c.ex === 'Longo Teste' && c.ano === js(J, 'S.year') + 1, `ele assume uma equipe no ano seguinte, com a reputação do que conquistou (${c && c.rep})`);
  let e2 = null;
  try { J.run('__inverno(); __temporada(); Chefe.proximoAno(); UI.limparFila(); UI.close();'); } catch(e){ e2 = e.message; }
  ok(!e2 && J.run('C.ano') === c.ano + 1, 'e a primeira temporada de chefe corre normalmente' + (e2 ? ': ' + e2 : ''));
}

/* 4. o resultado depende do piloto, não do sorteio */
{
  const temporada = (seed, delta) => { const J = H.carregar({ silencioso: true, seed });
    H.novaCarreira(J, { era: 7, ano: 2016, idade: 25, serie: 'f1' });
    return js(J, `(() => { const a = S.driver.attr; ['pace','race','cons','wet','dev'].forEach(k => a[k] = clamp(a[k] + ${delta}, 20, 99)); delete S.driver.perf;
      Game.simSeason(false); UI.limparFila(); UI.close(); const r = S.season.results; return { pts: r.reduce((x, y) => x + (y.pts || 0), 0), pos: r.map(x => x.pos || 30) }; })()`); };
  let melhor = 0, soma = 0;
  const seeds = [3, 5, 8, 13, 21, 34];
  seeds.forEach(sd => { const fraco = temporada(sd, -6), forte = temporada(sd, 6);
    const m = p => p.reduce((x, y) => x + y, 0) / p.length;
    if(m(forte.pos) < m(fraco.pos)) melhor++; soma += m(fraco.pos) - m(forte.pos); });
  ok(melhor >= 5 && soma > 0, `mesma semente, mesmo carro: o piloto 12 pontos melhor chega na frente em média (${melhor} de ${seeds.length} temporadas, ${(soma / seeds.length).toFixed(1)} posições por corrida)`);
  const a = temporada(77, 0), b = temporada(77, 0);
  ok(JSON.stringify(a) === JSON.stringify(b), 'mesma semente e mesmas escolhas: a mesma temporada, corrida por corrida');
}

/* 5. decisões contam */
{
  const J = H.carregar({ silencioso: true, seed: 12 });
  H.novaCarreira(J, { era: 7, ano: 2016, idade: 25, serie: 'f1' });
  const r = js(J, `(() => { const sea = S.season, rd = sea.round, id = Engine.setupIdeal(sea, rd);
    sea.setupRound = rd; sea.setup = { asa: id.asa, susp: id.susp, motor: 2, resp: [] }; const certo = Engine.setupEfeito(sea, rd);
    sea.setup = { asa: id.asa > 2 ? 0 : 4, susp: id.susp > 2 ? 0 : 4, motor: 2, resp: [] }; const errado = Engine.setupEfeito(sea, rd);
    return { certo: certo.car, errado: errado.car, ec: certo.erro, ee: errado.erro }; })()`);
  ok(r.certo > r.errado && r.ec < r.ee, `o acerto certo dá mais carro que o errado (${r.certo.toFixed(2)} contra ${r.errado.toFixed(2)})`);
  const f = js(J, `(() => { const f = Engine.ficha(), b = Object.assign({}, f), ref = Engine.fichaRef(); FICHA_KEYS.forEach(k => f[k] = ref);
    const neutra = Engine.fichaEfeito({ type:'street' }, false, S.season); f.pneu = ref + 15; f.defesa = ref - 15; const forma = Engine.fichaEfeito({ type:'street' }, false, S.season);
    Object.assign(f, b); return { n: neutra.r, f: forma.r }; })()`);
  ok(f.n === 0 && f.f !== 0, 'a ficha muda o formato do piloto, não o tamanho: no nível dele não soma nada; pneu bom e defesa fraca mudam o domingo');
}

/* 6. piloto sem equipe numa categoria com playoff: a tabela não quebra (achado na carreira longa) */
{
  const J = H.carregar({ silencioso: true, seed: 15 });
  H.novaCarreira(J, { era: 7, ano: 2012, idade: 26, serie: 'nascar' });
  const r = js(J, `(() => { const me = S.season.field.find(f => f.isMe); me.teamId = 'LIVRE'; S.team = { id:'LIVRE', name:'Sem equipe', color:'#5a6470', str:0, livre:true };
    try { const st = Engine.standings(S.season); UI.panes(); return { ok: st.every(d => d.team && d.team.name), playoff: !!S.season.playoff }; } catch(e){ return { erro: e.message }; } })()`);
  ok(r.ok, 'sem equipe, a tabela do campeonato mostra o piloto sem cor em vez de quebrar' + (r.erro ? ': ' + r.erro : ''));
}

console.log(falhas ? `\n${falhas} de ${n} verificações falharam` : `\nfase 6: ${n} verificações, tudo certo`);
process.exit(falhas ? 1 : 0);
