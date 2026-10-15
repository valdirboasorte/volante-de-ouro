/* A corrida volta a volta (Prova) contada a partir de corridas de verdade do jogo:
   termina na ordem do resultado? A volta mais rápida é de quem o motor disse?
   Quem abandonou abandona? As ultrapassagens não ficam indo e voltando?
   E o resumo de tempos que vai para o resultado faz sentido? */
const H = require('./base');
const POR = +(process.argv[2] || 4);
let falhas = 0;
const ok = (c, m) => { if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };

const casos = [[1975, 29], [1995, 17], [2010, 24], [2024, 17], [2024, 29]];
let corridas = 0, certas = 0, quaseCertas = 0, flCertas = 0, flTotal = 0, foraCertos = 0, foraTotal = 0;
let passes = 0, vaivem = 0, cronoOk = 0, ms = 0, torreOk = 0, roxaOk = 0;
const cats = new Set();
for(const [ano, idade] of casos){
  const J = H.carregar();
  H.novaCarreira(J, { era:`ERAS.reduce((k,e,i)=>e.y<=${ano}?i:k,0)`, ano, idade, rapido:false });
  for(let k = 0; k < POR; k++){
    const r = JSON.parse(J.run(`(function(){
      const sea = S.season; if(!sea.calendar[sea.round]) return 'null';
      const rec = Engine.runRace(sea); Game.tally(rec);
      const ent = rec.provaEnt; if(!ent) return JSON.stringify({ semEnt:true });
      const t0 = Date.now(); const P = Prova.criar(ent); const ms = Date.now() - t0;
      Central.P = P; Central.rec = rec; Central.resumir(); Central.preparar(); Central.P = null;
      /* a tabela na bandeirada é a ordem final, e o roxo é a volta mais rápida oficial */
      const torre = Prova.torre(P, P.t).filter(l => !l.fora).map(l => l.c.i).join();
      const torreOk = torre === P.ordem.filter(i => !P.carros[i].fora).join();
      const quem = i => { const c = P.carros[i]; return c.nome.split(' ').pop() + '(' + (c.cruz.length - 1) + 'v ' + (c.fim || 0).toFixed(1) + ')'; };
      const detalhe = torreOk ? '' : 'torre ' + torre.split(',').map(quem).join(' ') + ' | ordem ' + P.ordem.filter(i => !P.carros[i].fora).map(quem).join(' ');
      const roxa = Math.min(...P.carros.map(c => c.melhorAte.length ? c.melhorAte[c.melhorAte.length - 1] : Infinity));
      const alvoDe = {}; ent.carros.forEach(c => alvoDe[c.id] = c);
      const chegaram = P.ordem.map(i => P.carros[i]).filter(c => !c.fora);
      const fora = ent.carros.filter(c => c.fora).map(c => c.id);
      const ps = P.eventos.filter(e => e.tipo === 'ultrapassagem');
      let vv = 0;
      ps.forEach((e, k) => { const v2 = ps.slice(k + 1).find(f => f.a === e.b && f.b === e.a && f.volta - e.volta <= 3);
        if(v2 && ps.slice(ps.indexOf(v2) + 1).find(f => f.a === e.a && f.b === e.b && f.volta - v2.volta <= 3)) vv++; });
      return JSON.stringify({ cat: sea.cat, ano: sea.year, gp: rec.gp, ms, N: P.N,
        trocados: chegaram.filter((c, k) => alvoDe[c.id].alvo !== k).length,
        fl: ent.flId ? { esperado: ent.flId, veio: P.fl.i != null ? P.carros[P.fl.i].id : null, chegou: !alvoDe[ent.flId].fora } : null,
        foraEsperado: fora.length, foraVeio: P.carros.filter(c => c.foraEm != null && c.foraEm <= P.t && fora.includes(c.id)).length,
        passes: ps.length, vaivem: vv, torreOk, detalhe, roxaOk: P.fl.i == null || Math.abs(roxa - P.fl.t) < 1e-9,
        crono: rec.crono, top: rec.top.map(t => t.pos), difs: rec.top.map((t, k) => Prova.difTop(rec, k)) });
    })()`));
    if(!r) break;
    if(r.semEnt){ ok(false, 'corrida sem descrição para assistir'); continue; }
    corridas++; ms += r.ms; cats.add(r.ano + ' ' + r.cat);
    if(r.trocados === 0) certas++;
    if(r.trocados <= 2) quaseCertas++;
    else console.log(`  ! ${r.ano} ${r.cat} GP ${r.gp}: ${r.trocados} fora do lugar`);
    if(r.fl && r.fl.chegou){ flTotal++; if(r.fl.veio === r.fl.esperado) flCertas++; }
    foraTotal += r.foraEsperado; foraCertos += r.foraVeio;
    passes += r.passes; vaivem += r.vaivem;
    if(r.torreOk) torreOk++; else console.log('  ! a tabela na bandeirada não bate com a ordem final em ' + r.ano + ' ' + r.cat + ' ' + r.gp + ': ' + r.detalhe);
    if(r.roxaOk) roxaOk++; else console.log('  ! o roxo da tabela não é a volta mais rápida oficial em ' + r.gp);
    /* o resumo: o vencedor tem o tempo de prova, os outros diferenças que só crescem */
    const c = r.crono, nums = c ? c.dif.filter((d, i) => i > 0 && typeof d === 'number') : [];
    const crescente = nums.every((d, i) => i === 0 || d >= nums[i - 1] - .05);
    const ok1 = c && c.n === r.N && c.dif.length === r.top.length && c.dif[0] === 0 && c.tv > 0 && crescente
      && /^\d+:\d\d(:\d\d)?\.\d$|^\d+:\d\d\.\d$/.test(r.difs[0]) && r.difs.slice(1).every((d, i) => r.top[i + 1] == null ? d === '' : /^\+(\d+\.\ds|\d+ voltas?)$/.test(d));
    if(ok1) cronoOk++;
    else console.log('  ! resumo estranho em ' + r.gp + ': ' + JSON.stringify(c) + ' ' + JSON.stringify(r.difs));
  }
}
console.log('  categorias: ' + [...cats].join(', '));
ok(corridas >= casos.length * POR * .8, `${corridas} corridas contadas volta a volta`);
ok(certas >= corridas * .85, `${certas}/${corridas} terminam exatamente na ordem do resultado`);
ok(quaseCertas === corridas, `nenhuma com mais de dois carros fora do lugar`);
ok(flCertas >= flTotal * .85, `volta mais rápida de quem o motor disse em ${flCertas}/${flTotal}`);
ok(foraCertos === foraTotal, `${foraCertos}/${foraTotal} abandonos acontecem na pista`);
ok(vaivem <= passes * .02, `${passes} ultrapassagens, ${vaivem} pares indo e voltando em até 3 voltas`);
ok(torreOk === corridas, `a tabela na bandeirada mostra a ordem final em ${torreOk}/${corridas}`);
ok(roxaOk === corridas, `o roxo da tabela é a volta mais rápida oficial em ${roxaOk}/${corridas}`);
ok(cronoOk === corridas, `resumo de tempos coerente em ${cronoOk}/${corridas}`);
ok(ms / Math.max(1, corridas) < 2500, `${Math.round(ms / Math.max(1, corridas))} ms por corrida em média`);
console.log(falhas ? falhas + ' falha(s)' : `prova: ${certas}/${corridas} na ordem, ${vaivem} vaivém, ${Math.round(ms / Math.max(1, corridas))} ms por corrida`);
if(falhas) process.exitCode = 1;
