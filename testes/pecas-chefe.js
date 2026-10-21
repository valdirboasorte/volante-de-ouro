/* As peças do carro e o acerto (modo chefe):
   — F1 e Endurance têm peças; as categorias de carro padronizado não;
   — cada época tem as suas peças (asas desde 1968, assoalho e laterais desde 1977);
   — o carro do ano sai do plano de inverno: as peças têm a média do carro;
   — projeto custa dinheiro (conta no teto), horas de túnel e dias; fica pronto,
     é fabricado e montado primeiro no carro prioritário; o carro muda;
   — desde 2021 o campeão tem menos horas de túnel que o décimo;
   — a pista pesa: carro forte nas curvas lentas rende mais na rua;
   — as peças gastam, a batida destrói e o carro nunca fica sem a peça;
   — o que outro sistema somou no carro (um acontecimento) continua valendo;
   — save da versão 4 abre na 5 e ganha as peças;
   — acerto: 100% no ideal, a impressão do piloto aponta o caminho, o engenheiro
     melhora o acerto de base e o acerto bom rende no sábado.
   Uso: node testes/pecas-chefe.js   Não modifica arquivos nem saves. */
const H = require('./base');
let falhas = 0, n = 0;
const ok = (c, m) => { n++; if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };

function equipe(sk, ano, pos, seed){
  const J = H.carregar({ silencioso: true, seed: seed || 5 });
  J.run(require('./chefe-comum'));
  J.run(`(() => { const l = eraOfSeries(${ano}, '${sk}').teams.map((t, i) => [i, Engine.resolveTeam(t, i, ${ano}, '${sk}')]).filter(x => x[1]).sort((a, b) => b[1].str - a[1].str);
    Chefe.novo({ chefe:{ nome:'T', cc:'BR' }, realismo:true, eq:{ nome:'Equipe Teste', cor:'#123456', cc:'GB' }, modo:'assumir', sk:'${sk}', ano:${ano}, idx:l[Math.min(l.length - 1, ${pos})][0] });
    __inverno(); Chefe.comecarTemporada(); UI.limparFila(); UI.close(); })()`);
  return J;
}

/* 1. onde há peças e quais */
{
  const J = equipe('f1', 2024, 4);
  const r = J.run(`(() => ({ ativo: Pecas.ativo(), partes: Pecas.partes(), aero: C.carro.aero, na: Pecas.notaArea('aero'), ch: C.carro.chassi, nc: Pecas.notaArea('chassi'),
    un: C.pecas.un.length, montadas: [0, 1].every(k => Pecas.partes().every(p => !!Pecas.montada(k, p))), horas: C.pecas.horasAno, v: C.v, V: Chefe.V }))()`);
  ok(r.ativo && r.partes.join() === 'chassi,asaD,asaT,assoalho,laterais,susp', `F1 2024: peças ${r.partes.join(', ')}`);
  ok(Math.abs(r.aero - r.na) < .6 && Math.abs(r.ch - r.nc) < .6, `o carro do ano tem a média das peças (aero ${r.aero.toFixed(1)}, chassi ${r.ch.toFixed(1)})`);
  ok(r.montadas && r.un > 12, `os dois carros saem com todas as peças montadas e reservas (${r.un} unidades)`);
  ok(r.v === 5 && r.V === 5, 'o save novo já nasce na versão 5');
  const v = equipe('f1', 1962, 3).run(`(() => ({ p: Pecas.partes(), h: Pecas.horasDoAno() }))()`);
  ok(v.p.join() === 'chassi,carroceria,susp' && v.h === 0, 'F1 1962: chassi, carroceria e suspensão; sem asa e sem horas de túnel');
  const w = equipe('f1', 1979, 3).run(`(() => Pecas.partes())()`);
  ok(w.indexOf('assoalho') >= 0 && w.indexOf('asaD') >= 0 && w.indexOf('carroceria') < 0, 'F1 1979: asas, assoalho e laterais');
  const fora = ['indy', 'nascar', 'fe'].map(sk => equipe(sk, 2020, 2).run(`(() => Pecas.ativo())()`));
  ok(fora.every(x => !x), 'IndyCar, NASCAR e Fórmula E (carro padronizado) não têm peças');
  ok(equipe('wec', 2020, 2).run(`(() => Pecas.ativo())()`), 'o Endurance tem peças');
}

/* 2. o projeto: custo, teto, horas, prazo, fabricação e montagem */
{
  const J = equipe('f1', 2024, 4);
  const r = J.run(`(() => {
    const P = Pecas.P(), caixa0 = C.caixa, teto0 = C.temporada.gastoTeto, h0 = P.horas;
    const a = Pecas.projetar('asaD', 'lenta', 2);
    const dup = Pecas.projetar('asaD', 'rapida', 0);
    const custo = caixa0 - C.caixa, teto = C.temporada.gastoTeto - teto0, horas = P.horas - h0;
    /* o projeto sai bem (para medir o caminho inteiro) */
    const res = R.f; R.f = () => .02;
    let g = 0; while(P.proj.find(x => x.id === a.proj.id).st === 'proj' && g++ < 10) Pecas.depoisDaCorrida(C.temporada, []);
    R.f = res;
    const pr = P.proj.find(x => x.id === a.proj.id), e = Pecas.esp(pr.e);
    const aeroAntes = C.carro.aero, lentaAntes = Pecas.attr(P.prio || 0).lenta;
    const f = Pecas.fabricar(pr.e, 2);
    g = 0; while(P.proj.find(x => x.id === f.fab.id).st === 'fab' && g++ < 10) Pecas.depoisDaCorrida(C.temporada, []);
    const m0 = Pecas.montada(P.prio || 0, 'asaD'), m1 = Pecas.montada(1 - (P.prio || 0), 'asaD');
    return { ok: a.ok, dup: dup.ok, custo, teto, horas, st: pr.st, n: e.n, dif: pr.dif, foco: e.foco,
      m0: Pecas.esp(m0.e).n, m1: Pecas.esp(m1.e).n, aeroDepois: C.carro.aero, aeroAntes, lentaDepois: Pecas.attr(P.prio || 0).lenta, lentaAntes }; })()`);
  ok(r.ok && !r.dup, 'um projeto por peça de cada vez');
  ok(r.custo > 0 && Math.abs(r.custo - r.teto) < 1 && r.horas > 0, `o projeto custa ${(r.custo / 1e6).toFixed(1)} mi (no teto de gastos) e ${r.horas} h de túnel`);
  ok(r.n === 2 && r.dif > 0 && r.foco === 'lenta', `fica pronto como asa dianteira v2, melhor que a v1 (+${r.dif.toFixed(1)})`);
  ok(r.m0 === 2 && r.m1 === 2, 'fabricadas duas unidades, a v2 vai para os dois carros');
  ok(r.lentaDepois > r.lentaAntes && r.aeroDepois > r.aeroAntes, `o carro melhora nas curvas lentas (${r.lentaAntes.toFixed(1)} → ${r.lentaDepois.toFixed(1)})`);
}

/* 3. as horas de túnel pela regra de 2021 */
{
  const J = equipe('f1', 2024, 4);
  const r = J.run(`(() => { const h = pos => { C.hist = [{ ano: C.ano - 1, pos, cat: C.cat }]; return Pecas.horasDoAno(); }; return { p1: h(1), p10: h(10) }; })()`);
  ok(r.p1 < r.p10 && Math.abs(r.p1 / r.p10 - .7 / 1.15) < .01, `o campeão tem ${r.p1} h; o décimo, ${r.p10} h`);
}

/* 4. a pista pesa no carro */
{
  const J = equipe('f1', 2024, 4);
  const r = J.run(`(() => { const P = Pecas.P();
    /* as duas asas dianteiras e as suspensões ficam muito fortes nas curvas lentas e fracas na reta */
    P.un.forEach(u => { const e = Pecas.esp(u.e); if(e.p === 'asaD' || e.p === 'susp'){ e.a.lenta += 25; } if(e.p === 'asaT' || e.p === 'laterais'){ e.a.reta -= 20; } });
    return { rua: Pecas.delta(0, { type: 'street' }), alta: Pecas.delta(0, { type: 'fast' }) }; })()`);
  ok(r.rua > 0 && r.alta < 0, `carro de curva lenta: ${r.rua.toFixed(2)} na rua, ${r.alta.toFixed(2)} na pista de alta`);
}

/* 5. desgaste, batida e reserva */
{
  const J = equipe('f1', 2024, 4);
  const r = J.run(`(() => { const P = Pecas.P();
    const c0 = Pecas.montada(0, 'asaD').c;
    Pecas.depoisDaCorrida(C.temporada, []);
    const c1 = Pecas.montada(0, 'asaD').c;
    const antes = P.un.length, chance = R.chance; R.chance = () => true;
    const f = C.temporada.field.find(x => x.teamId === 'EU' && x.carro === 0);
    Pecas.depoisDaCorrida(C.temporada, [{ f, dnf: 'ACID' }]);
    R.chance = chance;
    /* destrói tudo de um tipo e vê o carro continuar com a peça */
    P.un = P.un.filter(u => Pecas.esp(u.e).p !== 'assoalho' || u.carro === 1);
    Pecas.montar();
    return { c0, c1, antes, depois: P.un.length, notas: P.notas.slice(), tem: !!Pecas.montada(0, 'assoalho') }; })()`);
  ok(r.c1 < r.c0, `a asa dianteira gasta numa corrida (${r.c0.toFixed(0)}% → ${r.c1.toFixed(0)}%)`);
  ok(r.depois < r.antes && r.notas.some(t => /destruiu/.test(t)), 'a batida destrói peças');
  ok(r.tem, 'sem reserva, a fábrica faz uma unidade às pressas: o carro nunca fica sem a peça');
}

/* 6. o que um acontecimento somou no carro continua valendo */
{
  const J = equipe('f1', 2024, 4);
  const r = J.run(`(() => { const a0 = C.carro.aero; C.carro.aero += 3; Pecas.depoisDaCorrida(C.temporada, []); return { a0, a1: C.carro.aero }; })()`);
  ok(r.a1 > r.a0 + 2, `um ganho de +3 no aero continua depois da fábrica recalcular o carro (${r.a0.toFixed(1)} → ${r.a1.toFixed(1)})`);
}

/* 7. save da versão 4 */
{
  const J = equipe('f1', 2024, 4);
  const r = J.run(`(() => { const c = JSON.parse(JSON.stringify(C)); c.v = 4; delete c.pecas; delete c.acertos;
    Store.set('vdo_chefe', JSON.stringify(c)); C = null; UIC.continuar(); UI.close();
    const P = Pecas.P(); return { v: C.v, tem: !!P && P.ano === C.ano, montadas: [0, 1].every(k => Pecas.partes().every(p => !!Pecas.montada(k, p))) }; })()`);
  ok(r.v === 5 && r.tem && r.montadas, 'um save da versão 4 abre na 5 e ganha as peças do carro');
}

/* 8. o acerto */
{
  const J = equipe('f1', 2024, 4);
  const r = J.run(`(() => { const sea = C.temporada, id = Acerto.ideal(sea, 0);
    const q100 = Acerto.qualidade(sea, 0, id.slice());
    const st = Acerto.estado(sea, 0), base = Acerto.qualidade(sea, 0);
    /* sem ruído, a impressão do piloto leva exatamente ao ideal */
    const d = st.v.map((x, j) => (x - id[j]) / 5);
    const fb = Acerto.SENT.map(s => s[4].reduce((t, w, j) => t + w * d[j], 0));
    const dh = Acerto.resolver(fb), exato = dh.every((x, j) => Math.abs(x - d[j]) < 1e-6);
    const f = sea.field.find(x => x.teamId === 'EU' && x.carro === 0);
    const qAntes = Chefe.efeitoTreino(f).q;
    const saidas = st.saidas;
    Acerto.auto(0);
    const depois = Acerto.qualidade(sea, 0), qDepois = Chefe.efeitoTreino(f).q;
    const st1 = Acerto.estado(sea, 1); Acerto.saida(1);
    return { q100, base, exato, depois, usadas: st.usadas, saidas, qAntes, qDepois, fb1: st1.fb && st1.fb.length, est: st1.est }; })()`);
  ok(r.q100 === 100, 'no acerto ideal, 100%');
  ok(r.exato, 'a impressão do piloto, sem ruído, aponta exatamente o que mudar');
  ok(r.depois > r.base && r.usadas >= 1 && r.usadas <= r.saidas && r.depois < 100, `o engenheiro usa ${r.usadas} das ${r.saidas} saídas e melhora o acerto sem chegar à perfeição (${r.base.toFixed(0)}% → ${r.depois.toFixed(0)}%)`);
  ok(r.qDepois > r.qAntes, 'acerto melhor rende mais na classificação');
  ok(r.fb1 === 5 && r.est != null, 'cada saída traz o que o piloto sente nas cinco áreas e a estimativa do engenheiro');
}

console.log(falhas ? `\n${falhas} de ${n} verificações falharam` : `peças e acerto: ${n} verificações, tudo certo`);
process.exit(falhas ? 1 : 0);
