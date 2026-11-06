/* Corrida interativa 2D: a corrida contra a IA e o caminho até o campeonato.
   - vinte carros da IA em cinco voltas: todos chegam (menos o azar marcado), sem carro preso nem número quebrado;
   - o azar sorteado pelo motor (quebra, batida) vira abandono na volta marcada; o jogador não tem batida marcada;
   - o resultado 2D tem o formato de Gp.resultado e passa por Gp.chegada → Engine.runRace como a corrida ao vivo:
     pontos, classificação, resultados e rodada andam do mesmo jeito.
   Uso: node testes/corrida2d-corrida.js   Não modifica arquivos nem saves. */
const H = require('./base');
const { carregar2D } = require('./corrida2d');

let falhas = 0, n = 0;
const ok = (cond, msg) => { n++; if(!cond){ falhas++; console.log('✗ ' + msg); } };

const J = carregar2D();

/* 1. a corrida da IA */
const r1 = J.run(`(() => {
  const carros = [];
  for(let k = 0; k < 20; k++) carros.push({ id: 'c' + k, nome: 'P' + k, grid: k + 1, ia: { ritmo: .985 - k * .0012, ruido: .35, erros: .04 },
    destino: k === 7 ? { tipo: 'MEC', volta: 3 } : k === 12 ? { tipo: 'ACID', volta: 2 } : null });
  const S = C2D.Sessao.criar({ trkId: 'br_int', ano: 2024, sk: 'f1', nivel: 0, tipo: 'corrida', voltas: 5, carros, semente: 11 });
  S.eu = { autopiloto: true };
  let g = 0; while(!S.acabou && g++ < 120 * 60 * 15) C2D.Sessao.passo(S, null, C2D.DT);
  const res = C2D.Corrida.resultado(S);
  return { acabou: S.acabou, res, toques: S.eventos.filter(e => e.tipo === 'toque').length,
           presos: S.eventos.filter(e => e.tipo === 'voltouPista').length,
           nan: S.carros.some(c => !isFinite(c.x) || !isFinite(c.y) || !isFinite(c.vx)) };
})()`);
ok(r1.acabou, 'a corrida da IA não chegou ao fim');
ok(!r1.nan, 'número quebrado no estado dos carros');
const chegaram = r1.res.ordem.filter(o => !o.fora);
/* 18 podem chegar (uma quebra e uma batida sorteadas); com o dano por peça uma batida forte
   acaba com a corrida dos dois carros, então até dois abandonos por acidente na pista */
ok(chegaram.length >= 16, 'poucos carros chegaram: ' + chegaram.length);
ok((r1.res.ordem.find(o => o.id === 'c7') || {}).fora === 'MEC', 'a quebra marcada não virou abandono');
ok((r1.res.ordem.find(o => o.id === 'c12') || {}).fora === 'ACID', 'a batida marcada não virou abandono');
ok(chegaram.every(o => o.voltas >= 4 && o.fim > 0), 'quem chegou tem voltas e tempo');
ok(r1.res.ordem.every((o, k) => k === 0 || o.fora || r1.res.ordem[k - 1].fora || r1.res.ordem[k - 1].voltas > o.voltas || r1.res.ordem[k - 1].fim <= o.fim), 'a ordem respeita voltas e tempo');
ok(r1.toques < 45, 'toques demais: ' + r1.toques);
ok(r1.presos <= 3, 'carros presos voltando à pista: ' + r1.presos);
ok(r1.res.fl && r1.res.fl.t > 60 && r1.res.N === 5 && r1.res.tv > 300, 'volta mais rápida, voltas e tempo do vencedor');

/* 2. do motor para a pista 2D e de volta para o campeonato */
H.novaCarreira(J, { era: 7, ano: 2023, idade: 24, rapido: false });
const r2 = J.run(`(() => {
  const sea = S.season;
  const rd = sea.round, nRes = sea.results.length;
  const M = Engine.montarCorrida(sea);
  const ent = Gp.entrada(sea, M, S.series, sea.year, f => !!f.isMe);
  const N = 3;
  const carros = C2D.Corrida.montarGrid(ent, { nivel: 'medio', voltas: N });
  const meuCarro = carros.find(c => c.me);
  const meuEnt = ent.carros.find(c => c.me);
  const S2 = C2D.Sessao.criar({ trkId: ent.trkId, ano: ent.ano, sk: ent.sk, nivel: ent.nivel, tipo: 'corrida', voltas: N, carros, semente: ent.seed });
  S2.eu.ia = C2D.IA.criar({ ritmo: .97 }); S2.eu.autopiloto = true;
  let g = 0; while(!S2.acabou && g++ < 120 * 60 * 20) C2D.Sessao.passo(S2, null, C2D.DT);
  const res = C2D.Corrida.resultado(S2);
  const vivo = { montagem: M, finish: Gp.chegada(M, res), flId: res.flId, sc: res.sc, crono: Gp.cronoDe(res), notas: C2D.Corrida.notasDe(S2, 'ME') };
  const antes = Object.assign({}, sea.dstand);
  const rec = Engine.runRace(sea, vivo);
  const meu = res.ordem.findIndex(o => o.id === 'ME');
  const somaPts = Object.keys(sea.dstand).reduce((a, k) => a + (sea.dstand[k] - (antes[k] || 0)), 0);
  const pts = sea.pts.p.slice(0, res.ordem.filter(o => !o.fora).length).reduce((a, b) => a + b, 0);
  return { pista: ent.trkId, idsIguais: res.ordem.length === M.running.length + M.out.length && res.ordem.every(o => vivo.finish.some(x => x.f.id === o.id)),
           pos: rec.pos, dnf: rec.dnf, meuRes: meu + 1, meuFora: res.ordem[meu].fora, rodou: sea.round === rd + 1, guardou: sea.results.length === nRes + 1,
           somaPts, ptsTabela: pts, crono: rec.crono, semBatidaMarcada: !(meuCarro.destino && meuCarro.destino.tipo === 'ACID'), entFora: meuEnt.fora || null };
})()`);
ok(r2.idsIguais, 'o resultado 2D tem todos os carros da montagem');
ok(r2.rodou && r2.guardou, 'a rodada andou e o resultado foi guardado');
ok(r2.meuFora ? r2.pos == null && r2.dnf === r2.meuFora : r2.pos === r2.meuRes, `a posição do jogador no campeonato é a da pista (${r2.pos} contra ${r2.meuRes})`);
ok(r2.somaPts >= r2.ptsTabela && r2.somaPts > 0, `os pontos da etapa foram distribuídos (${r2.somaPts} de ${r2.ptsTabela} da tabela)`);
ok(!!r2.crono && r2.crono.n === 3, 'o cronômetro da corrida foi para o resultado');
ok(r2.semBatidaMarcada, 'o jogador saiu com batida marcada (quem bate é quem dirige)');

/* 3. a classificação 2D: a sua volta entra entre os tempos dos rivais e o grid sai refeito */
const r3 = J.run(`(() => {
  const sea = S.season, rd = sea.round;
  const q = Engine.rodarQuali(sea, rd, 'cedo');
  const rivais = q.ordem.filter(o => !o.me);
  const tempos = {}; rivais.forEach((o, k) => tempos[o.id] = 80 + k * .2);
  const a = C2D.Carreira.fecharQuali(sea, rd, q, tempos, 80 + 4 * .2 + .1);   /* entre o 5º e o 6º rival */
  const posA = a.grid.ME;
  const b = C2D.Carreira.fecharQuali(sea, rd, q, tempos, 79);                 /* mais rápido que todos */
  const posB = b.grid.ME;
  const c = C2D.Carreira.fecharQuali(sea, rd, q, tempos, null);               /* sem volta */
  const g = c.grid, vals = Object.values(g).sort((x, y) => x - y);
  return { posA, posB, posC: c.grid.ME, largam: vals.length, validos: vals.every((v, k) => v === k + 1), notaC: c.notas.some(t => /Sem volta válida/.test(t)), modo: c.modo };
})()`);
ok(r3.posA === 6 && r3.posB === 1, `a volta do jogador decide o lugar no grid (${r3.posA} e ${r3.posB})`);
ok(r3.posC === r3.largam && r3.notaC, 'sem volta válida, o jogador larga em último e o resumo avisa');
ok(r3.validos && r3.modo === '2d', 'o grid refeito vai de 1 a N, sem buraco');

/* 4. cada categoria com o que tem de próprio (corridas curtas) */
const CATS = [['br_int', 'f1', 2024, .1, 'drs'], ['us_lbh', 'indy', 2024, .1, 'p2p'], ['indy', 'indy', 2024, .04, 'lancada'],
              ['us_day', 'nascar', 2024, .04, 'vacuo'], ['mc', 'fe', 2024, .25, 'attack'], ['br_int', 'f1', 2000, .08, 'reabastece'], ['it_imo', 'f1', 1965, .15, 'antigo']];
for(const [trk, sk, ano, frac, oque] of CATS){
  const r = J.run(`(() => {
    const P = C2D.Pista.criar('${trk}', ${ano}, { sk: '${sk}', nivel: 0 });
    const trk = TRACKS['${trk}'] || { id: '${trk}', type: P.tipo };
    const Ncl = Prova.voltas('${sk}', 0, ${ano}, trk, P.L, P.Tref).N, N = Math.max(3, Math.round(Ncl * ${frac}));
    const carros = [];
    for(let k = 0; k < 14; k++) carros.push({ id: 'c' + k, grid: k + 1, eq: 'E' + Math.floor(k / 2), ia: { ritmo: .985 - k * .0012, ruido: .35, erros: .03 } });
    const S = C2D.Sessao.criar({ trkId: '${trk}', ano: ${ano}, sk: '${sk}', nivel: 0, tipo: 'corrida', voltas: N, carros, semente: 5, boxes: { sk: '${sk}', ano: ${ano}, nivel: 0, fracao: N / Ncl, Ncl } });
    S.eu = { autopiloto: true };
    const ini = S.estado;
    let g = 0, drs = 0, p2p = 0, vac = 0, attack = 0, comb = 0;
    while(!S.acabou && g++ < 120 * 60 * 25){ C2D.Sessao.passo(S, null, C2D.DT);
      for(const c of S.carros){ if(c.drsAberto) drs++; if(c.p2p && c.p2p.ligado) p2p++; if(c.dragF < .9) vac++; if(c.attack && c.attack.ate > S.t) attack++; } }
    const res = C2D.Corrida.resultado(S);
    return { acabou: S.acabou, N, ini, chegaram: res.ordem.filter(o => !o.fora).length, drs, p2p, vac, attack, tanque: S.tanque, paradas: res.ordem.reduce((a, o) => a + o.paradas, 0),
             tipo: S.carros[0].sp.tipo, nan: S.carros.some(c => !isFinite(c.x) || !isFinite(c.vx)) };
  })()`);
  const nome = `${sk} ${ano} em ${trk}`;
  ok(r.acabou && !r.nan, nome + ': a corrida chegou ao fim sem número quebrado');
  ok(r.chegaram >= 10, nome + ': poucos carros chegaram (' + r.chegaram + ' de 14)');
  if(oque === 'drs') ok(r.drs > 0, nome + ': ninguém abriu o DRS');
  if(oque === 'p2p') ok(r.p2p > 0, nome + ': ninguém usou o push-to-pass');
  if(oque === 'lancada') ok(r.ini === 'lancada', nome + ': a largada não foi lançada');
  if(oque === 'vacuo') ok(r.vac > 0 && r.ini === 'lancada', nome + ': sem vácuo ou sem largada lançada');
  if(oque === 'attack') ok(r.attack > 0, nome + ': ninguém ativou o Attack Mode');
  if(oque === 'reabastece') ok(r.tanque < Infinity && r.paradas >= 10, nome + ': o reabastecimento não obrigou as paradas (' + r.paradas + ')');
  if(oque === 'antigo') ok(r.tipo === 'antigo' && r.drs === 0, nome + ': o carro de 1965 não é o antigo ou abriu DRS');
}

console.log(falhas ? falhas + ' falha(s) de ' + n : `corrida 2D: ${chegaram.length} de 20 carros da IA na chegada, ${r1.toques} toques; resultado entrou no campeonato (${r2.pista}, ${r2.pos ? r2.pos + 'º' : r2.dnf}); ${n} verificações, tudo certo`);
process.exitCode = falhas ? 1 : 0;
