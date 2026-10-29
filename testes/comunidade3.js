/* Atualização da comunidade (fase 3): o piloto por dentro.
   — a ficha: seis características além dos cinco atributos, nascidas do próprio piloto,
     refletidas no geral e usadas nas contas (sábado, pneu, defesa, cabeça, corrida ao vivo);
   — o foco do ano: acelera o escolhido, freia o oposto, rende mais na base e menos repetido;
   — o jeito do carro: combina ou não com o estilo, sem bônus exagerado; a adaptação ameniza;
   — o rumo pedido para o carro: a equipe decide, e o efeito chega só nas pistas certas;
   — lesão: condição física, recuperação aos poucos, reserva no carro e confiança;
   — rivais: ativo e histórico, esfriar, esquentar, reencontro, companheiro, mercado, ações;
   — as telas novas em inglês, espanhol e japonês.
   Uso: node testes/comunidade3.js   Não modifica arquivos nem saves. */
'use strict';
const H = require('./base');
let falhas = 0, n = 0;
const ok = (c, m) => { n++; if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };
const carreira = (seed, o, extra) => { const J = H.carregar(Object.assign({ silencioso: true, seed }, extra || {})); H.novaCarreira(J, o); return J; };
const js = (J, code) => JSON.parse(J.run('JSON.stringify(' + code + ')'));
const corre = J => J.run('Game.simSeason(false, true); UI.limparFila(); UI.close();');
const F1 = { era: 7, ano: 2018, idade: 24, serie: 'f1' };

/* 1. a ficha */
{
  const J = carreira(3, F1);
  const f = js(J, 'Engine.ficha()');
  ok(Object.keys(f).length === 6 && Object.values(f).every(v => v >= 20 && v <= 99),
    'seis características além dos cinco atributos: ' + Object.keys(f).join(', '));
  const f2 = js(J, `(() => { const p = S.driver.perf; delete S.driver.perf; const a = JSON.stringify(Engine.ficha()); delete S.driver.perf;
    const b = JSON.stringify(Engine.ficha()); S.driver.perf = p; return { a, b, perto: FICHA_KEYS.every(k => Math.abs(JSON.parse(a)[k] - p[k]) < 2) }; })()`);
  ok(f2.a === f2.b && f2.perto, 'save antigo sem ficha: ela nasce do próprio piloto, sempre igual, sem sorteio');
  const o = js(J, `(() => { const a = S.driver.attr, f = Engine.ficha(), alto = Object.assign({}, f);
    FICHA_KEYS.forEach(k => alto[k] = Math.min(99, f[k] + 15)); return { base: Engine.ovr(a), com: Engine.ovr(a, f), alto: Engine.ovr(a, alto) }; })()`);
  ok(o.alto - o.com >= 1 && o.alto - o.com <= 2 && Math.abs(o.com - o.base) <= 2,
    `o geral reflete a ficha sem ser substituído por ela: ${o.com} → ${o.alto} com a ficha 15 pontos melhor`);
  const q = js(J, `(() => { const f = Engine.ficha(), q0 = f.quali, a = Engine.meSkill(false); f.quali = q0 + 20; const b = Engine.meSkill(false); f.quali = q0;
    return { dq: b.q - a.q, dr: b.r - a.r }; })()`);
  ok(Math.abs(q.dq - 3.6) < .01 && q.dr === 0, `ritmo de classificação mexe no sábado e não no domingo (+20 → +${q.dq.toFixed(1)} na nota de classificação)`);
  const e = js(J, `(() => { const f = Engine.ficha(), b = Object.assign({}, f), trk = { type:'tech' };
    const med = k => { f[k] = 85; const hi = Engine.fichaEfeito(trk, false, S.season); f[k] = 40; const lo = Engine.fichaEfeito(trk, false, S.season); Object.assign(f, b); return [hi, lo]; };
    const [ph, pl] = med('pneu'), [dh, dl] = med('defesa'), [ch, cl] = med('cabeca');
    f.pneu = 85; const vh = Engine.fichaVivo(); f.pneu = 40; const vl = Engine.fichaVivo(); Object.assign(f, b);
    return { pneu: ph.r - pl.r, def: dh.r - dl.r, cons: ch.cons - cl.cons, crash: [ch.crash, cl.crash], calma: [ch.calma, cl.calma], vivo: [vh.pneu, vl.pneu] }; })()`);
  ok(e.pneu > .5 && e.pneu < 1.2 && e.vivo[0] < 1 && e.vivo[1] > 1,
    `gestão de pneus: ritmo no fim do stint na simulação (${e.pneu.toFixed(2)}) e desgaste ao vivo (${e.vivo[0]} contra ${e.vivo[1]})`);
  ok(e.def > .3 && e.def < 1, `defesa segura posição sem virar bônus enorme (${e.def.toFixed(2)} de nota entre 85 e 40)`);
  ok(e.cons > 3 && e.crash[0] < e.crash[1] && e.calma[0] && !e.calma[1], 'controle emocional: mais constância, menos batida, e não sente o aperto do campeonato');
  const neutro = js(J, `(() => { const f = Engine.ficha(), b = Object.assign({}, f), ref = Engine.fichaRef(), a = S.driver.attr, r0 = a.race;
    FICHA_KEYS.forEach(k => f[k] = ref); a.race = ref; const e = Engine.fichaEfeito({ type:'tech' }, false, S.season), v = Engine.fichaVivo();
    Object.assign(f, b); a.race = r0; return { r: e.r, cons: e.cons, crash: e.crash, passe: e.passe, pneu: v.pneu, at: v.ataque, de: v.defesa, fb: (() => { const x = f.feedback; f.feedback = ref; const y = Engine.feedbackFabrica(); f.feedback = x; return y; })() }; })()`);
  ok(Object.values(neutro).every(v => Math.abs(v - Math.round(v)) < 1e-9 && (v === 0 || v === 1)),
    'a ficha muda o formato do piloto, não o tamanho: no nível do próprio piloto ela não dá nem tira nada');
  const ad = js(J, '(() => { const f = Engine.ficha(), a0 = f.adapt; f.adapt = 90; const hi = Engine.adaptMult(); f.adapt = 30; const lo = Engine.adaptMult(); f.adapt = a0; return [hi, lo]; })()');
  ok(ad[0] > 1.15 && ad[1] < .85, 'adaptação acelera o aprendizado de uma categoria nova');
  const fb = js(J, '(() => { const f = Engine.ficha(), b0 = f.feedback; f.feedback = 90; const hi = Engine.feedbackFabrica(); f.feedback = 40; const lo = Engine.feedbackFabrica(); f.feedback = b0; return [hi, lo]; })()');
  ok(fb[0] > 0 && fb[1] < 0, 'feedback técnico entra no desenvolvimento do carro durante o ano');
}

/* 2. a ficha na corrida ao vivo */
{
  const J = carreira(4, F1);
  const r = js(J, `(() => { const sea = S.season, M = Game.montagem(sea); Game._M = null;
    const ent = Gp.entrada(sea, M, S.series, sea.year, f => !!f.isMe), eu = ent.carros.find(c => c.me);
    const roda = mult => { const e = JSON.parse(JSON.stringify(ent)); e.carros.find(c => c.me).pneuMult = mult; const R = Gp.criar(e);
      let g = 0; while(R.t < 400 && g++ < 50000){ if(R.pergunta) Gp.responder(R, R.pergunta.padrao); Gp.passo(R); }
      const s = R.carros.find(x => x.c.me); return s.pneu.gasto / Math.max(1, s.voltas); };
    return { tem: !!(eu && eu.pneuMult && eu.ataque && eu.defesa), bom: roda(.9), ruim: roda(1.1) }; })()`);
  ok(r.tem, 'na corrida ao vivo o seu carro leva a ficha: pneu, ataque e defesa');
  ok(r.bom < r.ruim, `quem cuida do pneu gasta menos borracha por volta ao vivo (${(r.bom * 100).toFixed(2)}% contra ${(r.ruim * 100).toFixed(2)}%)`);
}

/* 3. o foco do ano */
{
  const cresce = foco => { const J = carreira(21, { era: 7, ano: 2018, idade: 21, serie: 'f1' });
    return js(J, `(() => { ${foco ? `S.foco = { k:'${foco}', ano:S.season.year, seguidos:0 };` : ''}
      const a0 = Object.assign({}, S.driver.attr), f0 = Object.assign({}, Engine.ficha());
      Engine.progress(Engine.summary(S.season));
      return { pace: S.driver.attr.pace - a0.pace, cons: S.driver.attr.cons - a0.cons, quali: S.driver.perf.quali - f0.quali }; })()`); };
  const sem = cresce(null), com = cresce('velocidade');
  ok(com.pace > sem.pace && com.quali > sem.quali && com.cons < sem.cons,
    `foco em velocidade: ritmo +${com.pace.toFixed(1)} (sem foco +${sem.pace.toFixed(1)}), classificação +${com.quali.toFixed(1)} (+${sem.quali.toFixed(1)}), constância cresce menos`);
  const J = carreira(22, F1);
  const fm = js(J, `(() => { const ano = S.season.year, top = S.season.isTop, r = {};
    S.foco = { k:'velocidade', ano, seguidos:0 }; S.season.isTop = true; r.topo = Engine.focoMult('pace'); r.menos = Engine.focoMult('cons');
    S.season.isTop = false; r.base = Engine.focoMult('pace'); S.foco.seguidos = 3; r.rep = Engine.focoMult('pace'); S.foco.seguidos = 0;
    const p0 = S.driver.attr.pace; S.driver.attr.pace = 92; r.alto = Engine.focoMult('pace'); S.driver.attr.pace = p0;
    S.season.isTop = top; S.foco.ano = ano - 1; r.velho = Engine.focoMult('pace'); delete S.foco; return r; })()`);
  ok(fm.base > fm.topo && fm.topo > 1 && fm.menos < 1, `o foco rende mais na base (×${fm.base.toFixed(2)}) que na principal (×${fm.topo.toFixed(2)}), e o lado oposto cresce menos (×${fm.menos.toFixed(2)})`);
  ok(fm.rep < fm.base && fm.alto < fm.base, 'retorno decrescente: repetir o foco ou já estar perto do topo rende menos');
  ok(fm.velho === 1, 'o foco vale só para o ano em que foi escolhido');
  J.run('Game.escolherFoco("pneus"); Game.escolherFoco("chuva"); UI.close();');
  corre(J);
  J.run('Game.escolherFoco("velocidade"); UI.limparFila(); UI.close();');
  ok(J.run('S.foco.k') === 'chuva', 'o foco se troca no inverno; depois da primeira corrida fica decidido');
}

/* 4. o jeito do carro */
{
  const J = carreira(5, F1);
  const r = js(J, `(() => { const sea = S.season, d = S.driver, st = d.style, out = [];
    ['agressivo','consistente','tecnico','equilibrado'].forEach(s => { d.style = s; sea.teams.forEach(t => out.push(Engine.encaixeBruto(Engine.caraterCarro(sea, t.id), d) * .8)); });
    d.style = st;
    const a = Engine.caraterCarro(sea, sea.teams[0].id), b = Engine.caraterCarro(sea, sea.teams[0].id);
    const eras = sea.teams.filter(t => JSON.stringify(Engine.caraterCarro(sea, t.id)) !== JSON.stringify(Engine.caraterCarro({ year: 1985, teams: sea.teams }, t.id))).length;
    return { max: Math.max(...out.map(Math.abs)), media: out.reduce((x, y) => x + y, 0) / out.length, igual: JSON.stringify(a) === JSON.stringify(b), eras, n: sea.teams.length, k: out.length }; })()`);
  ok(r.igual && r.eras >= r.n / 2, 'o jeito do carro sai da equipe e do regulamento: o mesmo carro tem o mesmo jeito, e muda com o regulamento');
  ok(r.max <= .8 && Math.abs(r.media) < .2, `encaixe piloto–carro sem bônus exagerado: no máximo ±${r.max.toFixed(2)} de nota, média ${r.media.toFixed(2)} em ${r.k} combinações`);
  const m = js(J, `(() => { const sea = S.season, f = Engine.ficha(), d = S.driver, a0 = f.adapt, st = d.style, id0 = S.team.id;
    let t = null; for(const s of ['agressivo','consistente','tecnico']){ d.style = s; t = sea.teams.find(x => Engine.encaixeBruto(Engine.caraterCarro(sea, x.id), d) < -.3); if(t) break; }
    if(!t){ d.style = st; return null; }
    S.team.id = t.id; f.adapt = 90; const hi = Engine.encaixe(sea, 0).v; f.adapt = 35; const lo = Engine.encaixe(sea, 0).v; const fim = Engine.encaixe(sea, sea.calendar.length - 1).v;
    f.adapt = a0; S.team.id = id0; d.style = st; return { hi, lo, fim }; })()`);
  ok(m && m.lo < 0 && m.hi > m.lo && m.fim > m.lo, `carro que não combina: quem se adapta sofre menos (${m && m.hi} contra ${m && m.lo}) e todo mundo aprende o carro ao longo do ano (${m && m.fim})`);
}

/* 5. o rumo do desenvolvimento */
{
  const J = carreira(6, F1);
  const c = js(J, `(() => { const f = Engine.ficha(), f0 = f.feedback, r0 = S.teamRel;
    f.feedback = 40; S.teamRel = 30; const baixo = Engine.chanceDirecao('reta'); f.feedback = 90; S.teamRel = 85; const alto = Engine.chanceDirecao('reta');
    f.feedback = f0; S.teamRel = r0; return { baixo, alto }; })()`);
  ok(c.alto > c.baixo + .3, `a equipe ouve mais quem dá bom feedback e tem boa relação (${Math.round(c.baixo * 100)}% → ${Math.round(c.alto * 100)}%)`);
  corre(J);
  const d = js(J, `(() => { const sea = S.season, id = S.team.id;
    const forca = (rd, tipo) => { const cal = sea.calendar[rd], t0 = cal.type; cal.type = tipo; const v = Engine.carStr(sea, id, rd); cal.type = t0; return v; };
    const antes = [forca(4, 'fast'), forca(4, 'street')], base = forca(sea.round, 'fast');
    S.direcao = { ano: sea.year, k: 'reta', rd: sea.round, aceito: true, forca: 1 };
    const ja = forca(sea.round, 'fast'), depois = [forca(4, 'fast'), forca(4, 'street')];
    const segunda = Engine.pedirDirecao('lentas');
    S.direcao = { ano: sea.year, k: 'confia', rd: sea.round, aceito: true, forca: 1 }; sea.round++; const conf = Engine.direcaoConfia(sea); sea.round--;
    S.direcao = { ano: sea.year, k: 'reta', rd: sea.round, aceito: false, forca: 1 }; const recusa = forca(4, 'fast');
    delete S.direcao; return { antes, base, ja, depois, segunda, conf, recusa }; })()`);
  ok(d.depois[0] - d.antes[0] > .4 && d.antes[1] - d.depois[1] > .1, `rumo aceito: o carro anda mais nas pistas do pedido (+${(d.depois[0] - d.antes[0]).toFixed(2)}) e perde um pouco nas outras`);
  ok(Math.abs(d.ja - d.base) < 1e-9, 'as peças não chegam na mesma corrida do pedido');
  ok(d.segunda === null, 'um pedido por temporada');
  ok(d.conf > 0 && Math.abs(d.recusa - d.antes[0]) < 1e-9, 'confiabilidade pedida reduz as quebras; rumo recusado não muda nada');
  const jr = js(J, '(() => { const t = S.season.isTop; S.season.isTop = false; const r = Engine.pedirDirecao("reta"); S.season.isTop = t; return { r, dir: S.direcao || null }; })()');
  ok(jr.r === null && jr.dir === null, 'na base, com carro igual para todos, não há rumo de desenvolvimento para pedir');
}

/* 6. lesão, reserva e recuperação */
{
  const J = carreira(8, Object.assign({ risco: true }, F1));
  corre(J);
  const c0 = js(J, `(() => { const f = Engine.ficha(), c0 = f.cabeca;
    f.cabeca = 90; S.driver.morale = 70; Engine.lesionar(2, 'corrida'); const a = { inj: S.driver.injured, cond: S.driver.condicao, mor: S.driver.morale };
    S.driver.condicao = 100; f.cabeca = 35; S.driver.morale = 70; Engine.lesionar(2, 'corrida'); const b = { inj: S.driver.injured, cond: S.driver.condicao, mor: S.driver.morale };
    f.cabeca = c0; return { a, b }; })()`);
  ok(c0.a.inj === 2 && c0.a.cond < 100 && c0.a.mor < 70 && c0.b.mor < c0.a.mor,
    `lesão: fora de 2 corridas, condição física ${c0.a.cond}, e a confiança cai menos em quem tem cabeça (${c0.a.mor} contra ${c0.b.mor})`);
  const antes = js(J, '{ gps: S.career.gps, cond: S.driver.condicao, pts: S.season.cstand[S.team.id] || 0 }');
  const m = js(J, `(() => { const sea = S.season; Engine.reservaNoCarro(sea, true); const M = Engine.montarCorrida(sea, true), todos = M.running.concat(M.out);
    return { rsv: todos.some(x => x.f.reservaMeu), eu: todos.some(x => x.f.isMe) }; })()`);
  ok(m.rsv && !m.eu, 'machucado, o reserva da equipe leva o seu carro');
  corre(J); corre(J);
  const fora = js(J, `(() => { const sea = S.season, rs = sea.field.find(f => f.reservaMeu);
    const M = Engine.montarCorrida(sea), todos = M.running.concat(M.out);
    return { inj: S.driver.injured, gps: S.career.gps, cond: S.driver.condicao, banco: !!(rs && rs.ausente), rsvNaPista: todos.some(x => x.f.reservaMeu), eu: todos.some(x => x.f.isMe), extra: Engine.condicaoEfeito() }; })()`);
  ok(fora.inj === 0 && fora.gps === antes.gps && fora.banco && !fora.rsvNaPista && fora.eu,
    'quando você volta, o reserva volta para o box, e as corridas de fora não contam como largadas suas');
  ok(fora.cond > antes.cond && fora.cond < 100 && fora.extra < 0, `a fisioterapia devolve um pouco a cada corrida (condição ${antes.cond} → ${fora.cond}); voltar sem estar inteiro custa ritmo (${fora.extra.toFixed(2)})`);
  for(let i = 0; i < 4; i++) corre(J);
  ok(J.run('S.driver.condicao') === 100 && J.run('Engine.condicaoEfeito()') === 0, 'algumas corridas depois o corpo está inteiro e a penalidade some');
  J.run('S.driver.condicao = 70; S.driver.injured = 0;');
  H.temporada(J);
  ok(J.run('S.driver.condicao') === 100, 'o inverno devolve o corpo inteiro');
}

/* 7. rivais */
{
  const J = carreira(7, { era: 7, ano: 2016, idade: 23, serie: 'f1', modo: 'realista' });
  corre(J); J.run('Game.definirRival();');
  const riv = js(J, 'S.rel.rival');
  ok(riv && riv.n && riv.de === 2016 && riv.nivel === 1, 'o rival nasce com nome, ano de início e intensidade');
  const rc = js(J, `(() => { const campo = S.season.field.filter(f => !f.ausente); return { com: Engine.rivalNaCorrida(campo), sem: Engine.rivalNaCorrida(campo.filter(f => f.name !== S.rel.rival.n)) }; })()`);
  ok(rc.com.r > 0 && rc.com.crash > 1 && rc.sem.r === 0 && rc.sem.crash === 1, 'com o rival na pista você anda mais e arrisca mais; sem ele, nada muda');
  J.run(`S.season.field.find(x => x.name === S.rel.rival.n).name += ' X'`);
  const sai = js(J, '{ out: Engine.atualizarRivais(), riv: S.rel.rival || null, ant: S.rel.antigos[0] }');
  ok(!sai.riv && sai.ant && sai.ant.n === riv.n && sai.ant.motivo === 'longe' && sai.out[0][0] === 'rivalLonge', 'rival que sai do seu grid vira rival histórico, com o placar guardado');
  J.run(`(() => { const f = S.season.field.find(x => / X$/.test(x.name)); f.name = f.name.slice(0, -2); })()`);
  const volta = js(J, '{ out: Engine.atualizarRivais(), riv: S.rel.rival || null, n: S.rel.antigos.length }');
  ok(volta.riv && volta.riv.n === riv.n && volta.out[0][0] === 'rivalVolta' && volta.n === 0, 'de volta ao mesmo grid, a rivalidade volta');
  const ev = js(J, `(() => { const r = S.rel.rival; r.de = S.year - 3; delete r.volta; r.nivel = 2; r.ano = { a: S.year - 1, d: 8, perto: 6, v: 6 };
    const f0 = S.driver.fame, a = Engine.atualizarRivais(), n1 = r.nivel, fama = S.driver.fame - f0;
    r.ano = { a: S.year - 1, d: 6, perto: 0, v: 3 }; r.nivel = 1; const b = Engine.atualizarRivais();
    return { a: a.map(x => x[0]), n1, fama, b: b.map(x => x[0]), ativo: !!S.rel.rival, mot: (S.rel.antigos[0] || {}).motivo }; })()`);
  ok(ev.n1 === 3 && ev.a.indexOf('rivalEsquentou') >= 0 && ev.fama === 2, 'briga perto o ano inteiro esquenta a rivalidade, e vencer o duelo do ano vale nome');
  ok(!ev.ativo && ev.b.indexOf('rivalEsfriou') >= 0 && ev.mot === 'esfriou', 'um ano sem se cruzar esfria; no fim, a rivalidade vira história');
  const pista = js(J, `(() => { const x = S.rel.antigos[0], top = n => [{ n:'A' }, { n:'B' }, { n:'C' }, { n:'D' }].concat([{ n }]);
    const r = []; for(let i = 0; i < 3; i++) r.push(Engine.reacenderRival({ pos: 4, top: top(x.n) })); return { r, riv: S.rel.rival && S.rel.rival.n }; })()`);
  ok(pista.r[0] === null && pista.r[1] === null && pista.r[2] === riv.n && pista.riv === riv.n, 'o rival histórico colado em você três vezes no ano reacende a briga');
  const cp = js(J, `(() => { const r = S.rel.rival, sea = S.season, f = sea.field.find(x => x.name === r.n), t0 = f.teamId;
    const outro = sea.teams.find(t => t.id !== S.team.id && t.id !== t0);
    r.time = 'Equipe Antiga'; f.teamId = outro.id; const a = Engine.atualizarRivais().map(x => x[0]);
    f.teamId = S.team.id; const comp = Engine.gente().find(x => x.papel === 'comp' && !x.saiu), n0 = comp && comp.n, tens0 = comp && comp.rel.tens;
    if(comp) comp.n = r.n; const b = Engine.atualizarRivais().map(x => x[0]); const tens1 = comp && comp.rel.tens;
    if(comp) comp.n = n0; f.teamId = t0; return { a, b, tens0, tens1, comp: !!comp }; })()`);
  ok(cp.a.indexOf('rivalEquipe') >= 0, 'o rival trocou de equipe: você fica sabendo');
  ok(cp.b.indexOf('rivalCompanheiro') >= 0 && (!cp.comp || cp.tens1 > cp.tens0), 'o rival virou seu companheiro: aviso e uma garagem tensa');
  const of = js(J, `(() => { const r = S.rel.rival, sea = S.season, f = sea.field.find(x => x.name === r.n), t = sea.teams.find(x => x.id === f.teamId);
    return { sim: Engine.rivalNaEquipe({ team: { name: t.name }, cat: sea.cat, type: 'f1' }), nao: Engine.rivalNaEquipe({ team: { name: 'Nenhuma' }, cat: sea.cat }) }; })()`);
  ok(of.sim === riv.n && of.nao === null, 'a proposta da equipe do rival avisa que ele está lá');
  const ac = js(J, `(() => { S.relFeitas = []; S.rel.rival.nivel = 1; Game.relacionar('provocar'); const n1 = S.rel.rival.nivel; UI.close();
    UI.pessoas(); const com = /Provocar o rival/.test(el('modal').innerHTML); const r = S.rel.rival; delete S.rel.rival; UI.pessoas(); const sem = /Provocar o rival/.test(el('modal').innerHTML);
    S.rel.rival = r; return { n1, com, sem }; })()`);
  ok(ac.n1 === 2, 'provocar o rival na imprensa esquenta a rivalidade');
  ok(ac.com && !ac.sem, 'as ações com o rival só aparecem quando existe um rival');
  const nt = js(J, `(() => { const n0 = (S.midia || []).length; Engine.noticia('rival', { k: 'rivalVolta', n: 'Fulano' });
    return { holo: Engine.temHolofote(), n: (S.midia || []).length - n0, txt: (S.midia || [])[0] && S.midia[0].txt }; })()`);
  ok(!nt.holo || (nt.n === 1 && /Fulano está de volta/.test(nt.txt)), 'a imprensa noticia o que muda com os rivais');
  const dc = js(J, `(() => { const p = Engine.novaPessoa('eng', { n:'Velho Conhecido', cc:'BR', conf: 90, resp: 90, afeto: 10, tens: 40 }); p.saiu = S.year; const g = Engine.gente(); g.push(p);
    Engine.virarAnoGente(); const r = Object.assign({}, p.rel); g.splice(g.indexOf(p), 1); return r; })()`);
  ok(dc.conf < 90 && dc.afeto > 10 && dc.tens < 40, 'quem saiu da sua vida vira lembrança: a relação volta devagar para o neutro');
  J.run(`S.rel.antigos.push({ n:'Antigo Rival', cc:'BR', de:2010, ate:2012, v:3, p:4, nivel:2, motivo:'aposentou' }); UI.pessoas();`);
  const h = J.E('modal').innerHTML;
  ok(/Rivais/.test(h) && /rival ativo/.test(h) && /rival histórico/.test(h), 'a tela de parceiros separa o rival ativo dos rivais históricos');
}

/* 8. as telas novas nos outros idiomas */
{
  const sources = new Set();
  const normalize = s => String(s).replace(/\s+/g, ' ').trim();
  const decode = s => s.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (_, e) => e[0] === '#'
    ? String.fromCodePoint(parseInt(e.slice(/^#x/i.test(e) ? 2 : 1), /^#x/i.test(e) ? 16 : 10))
    : ({ amp:'&', lt:'<', gt:'>', quot:'"', apos:"'", nbsp:' ' }[e.toLowerCase()]));
  const record = v => { const s = normalize(decode(String(v))); if(/\p{L}/u.test(s)) sources.add(s); };
  const html = v => {
    const clean = String(v).replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
      .replace(/<([a-z]+)[^>]*data-i18n-ignore[^>]*>[^<]*<\/\1>/gi, '');
    for(const m of clean.matchAll(/<(?:[^>"']|"[^"]*"|'[^']*')*>|[^<]+/g)){
      if(m[0][0] !== '<') record(m[0]);
      else for(const a of m[0].matchAll(/\b(?:title|aria-label|placeholder|alt|label)\s*=\s*(["'])(.*?)\1/g)) record(a[2]);
    }
  };
  let ligado = false;
  const J = carreira(9, Object.assign({ modo: 'realista' }, F1), { onWrite: w => { if(!ligado) return; w.property === 'innerHTML' ? html(w.value) : record(w.value); } });
  ligado = true;
  J.run(`S.driver.condicao = 82; UI.render(); UI.fichaModal(); Game.escolherFoco('combate'); UI.close();
    S.direcao = { ano: S.season.year, k: 'lentas', rd: 0, aceito: true, forca: 1 }; UI.fichaModal();
    S.direcao.aceito = false; UI.fichaModal(); delete S.direcao; S.season.round = S.season.calendar.length - 1; UI.fichaModal(); S.season.round = 0;
    Engine.lesionar(2, 'corrida'); UI.fichaModal();
    Object.keys(FOCOS).forEach(k => { UI.toast(FOCOS[k].ds); }); Object.keys(DIRECOES).forEach(k => UI.toast(DIRECOES[k].ds));
    ['agressivo','consistente','tecnico','equilibrado'].forEach(st => { S.driver.style = st; UI.fichaModal(); });
    UI.toast('O foco desta temporada já está decidido.'); UI.toast('Você já pediu um rumo para o carro nesta temporada.');
    UI.toast('A equipe aceitou o rumo: ' + DIRECOES.reta.n + '. As peças chegam nas próximas corridas.'); UI.toast('A equipe ouviu, mas manteve o plano dela.');
    UI.toast('Você não largou em Mônaco. Faltam 1 corrida(s) de recuperação. Ustinov correu no seu lugar e terminou em 3º.');
    ['rivalAposentou','rivalLonge','rivalEsquentou','rivalEsfriou','rivalEquipe','rivalCompanheiro','rivalVolta','rivalPista','antigoAposentou','rivalPaz']
      .forEach(k => UI.toast(Engine.rivalTxt([k, 'Hughes', 'Williams'])));
    UI.toast('Seu rival Hughes corre nessa equipe.'); UI.toast('Você não tem um rival agora.');
    UI.toast('Você provocou Hughes na imprensa. Ele vai responder na pista.'); UI.toast('Hughes aceitou baixar o tom. A rivalidade continua, mais limpa.');
    UI.toast('Hughes riu da proposta. A rivalidade continua.');
    S.rel.rival = { n:'Hughes', cc:'GB', nivel:2, v:3, p:2, de:2016, time:'Williams' };
    S.rel.antigos = [{ n:'Antigo', cc:'BR', de:2010, ate:2012, v:1, p:2, nivel:1, motivo:'longe' }, { n:'Outro', cc:'IT', de:2011, ate:2013, v:1, p:2, nivel:1, motivo:'aposentou' },
      { n:'Mais Um', cc:'FR', de:2012, ate:2014, v:1, p:2, nivel:1, motivo:'esfriou' }, { n:'Paz', cc:'ES', de:2012, ate:2015, v:1, p:2, nivel:1, motivo:'paz' }];
    UI.pessoas();
    document.body.insertAdjacentHTML && 0;
    el('modal').innerHTML = UI.porqueEvolucao({ ovr:[70, 72], porque:[['foco','combate'], ['encaixe', 4]] }) + UI.fichaEvolucao({ quali:1, pneu:.5, defesa:.8, adapt:0, feedback:.4, cabeca:.6 });`);
  const api = J.ctx.VDO_I18N;
  const nomes = Array.from(J.run('VDO_LANGUAGE_NAMES()')).concat(['Hughes', 'Ustinov', 'Williams', 'Antigo', 'Outro', 'Mais Um', 'Paz', 'Mônaco']).sort((a, b) => b.length - a.length);
  const residual = /\b(?:você|vocês|não|também|equipe|temporada|corrida|corridas|pneu|pneus|piloto|classificação|carro|curvas|rivalidade|foco|ficha|lesão|reserva|garagem|defesa|rumo|peças|fábrica|ritmo|constância|adaptação|desenvolvimento|condição|estilo|regulamento|imprensa|trégua|histórico|ativo)\b/iu;
  const residualEs = /(?:você|vocês|não|também|equipe|pneu|classificação|carro\b|lesão|garagem|rumo\b|peças|constância|adaptação|condição|imprensa|trégua)/iu;
  const ruins = [];
  let k = 0;
  for(const s of sources) for(const lang of ['en', 'es', 'ja']){
    let t = api.audit(s, lang).text; nomes.forEach(x => t = t.split(x).join('')); k++;
    if((lang === 'es' ? residualEs : residual).test(t)) ruins.push(`${lang}: ${s} => ${t}`);
  }
  for(const precisa of ['Ficha do piloto', 'Foco de desenvolvimento do ano', 'Rumo do desenvolvimento do carro', 'Rivais', 'Forte em', 'O jeito do carro']){
    k++; if(![...sources].some(s => s.indexOf(precisa) >= 0)) ruins.push('não renderizou: ' + precisa);
  }
  ruins.slice(0, 25).forEach(x => console.log('    ' + x));
  ok(!ruins.length, `as telas e mensagens da fase 3 em inglês, espanhol e japonês (${k} textos verificados${ruins.length ? ', ' + ruins.length + ' com português sobrando' : ''})`);
}

console.log(falhas ? `\n${falhas} de ${n} verificações falharam` : `\ncomunidade, fase 3: ${n} verificações, tudo certo`);
process.exit(falhas ? 1 : 0);
