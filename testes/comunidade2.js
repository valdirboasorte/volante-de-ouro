/* Atualização da comunidade (fase 2): corrida, clima e som.
   — o campeonato provisório da torre, na bandeirada, é o mesmo que o jogo grava;
   — os setores somam a volta, saem da simulação (mesma semente, mesmos setores) e têm a cor certa;
   — chuva por região e época: deserto quase seco, Europa mais úmida fora do verão;
   — alertas: largada molhada, chuva, pista secando; o radar erra mais nos anos 70;
   — corrida avulsa sem tocar na carreira; simular só esta corrida anda uma etapa;
   — o som não quebra nada sem áudio e guarda a escolha.
   Uso: node testes/comunidade2.js   Não modifica arquivos nem saves. */
const H = require('./base');
let falhas = 0, n = 0;
const ok = (c, m) => { n++; if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };

function chefe(seed, sk, ano, pos){
  const J = H.carregar({ silencioso: true, seed });
  J.run(require('./chefe-comum'));
  J.run(`(() => { const l = eraOfSeries(${ano}, '${sk}').teams.map((t, i) => [i, Engine.resolveTeam(t, i, ${ano}, '${sk}')]).filter(x => x[1]);
    Chefe.novo({ chefe:{ nome:'T', cc:'BR' }, realismo:true, modo:'assumir', sk:'${sk}', ano:${ano}, idx:l[Math.min(l.length - 1, ${pos})][0] }); __inverno(); Chefe.comecarTemporada(); })()`);
  return J;
}

/* 1. o campeonato ao vivo */
{
  const J = chefe(4, 'f1', 2019, 3);
  const r = JSON.parse(J.run(`(() => { const sea = C.temporada; for(let i = 0; i < 3; i++) Chefe.correr();
    Chefe.gridDaEtapa(sea); const M = Chefe.montar();
    const R = Gp.criar(Gp.entrada(sea, M, Chefe.sk(), sea.ano, f => f.teamId === 'EU', { gestao: true }));
    let g = 0; while(R.t < 900 && g++ < 100000){ if(R.pergunta) Gp.responder(R, R.pergunta.padrao); Gp.passo(R); }
    const meio = Gp.campeonatoAgora(R);
    Gp.terminar(R); const K = Gp.campeonatoAgora(R), res = Gp.resultado(R);
    Chefe.correr({ montagem: M, finish: Gp.chegada(M, res), flId: res.flId, sc: res.sc });
    const difs = K.pilotos.filter(x => (sea.dstand[x.id] || 0) !== x.total).map(x => x.n + ' ' + x.total + '≠' + (sea.dstand[x.id] || 0));
    const eqs = K.equipes.filter(x => { const t = sea.teams.find(t => t.name === x.n); return t && (sea.cstand[t.id] || 0) !== x.total; }).map(x => x.n);
    const fora = R.carros.filter(s => s.estado === 3).map(s => K.pilotos.find(x => x.id === s.c.id)).filter(Boolean);
    return JSON.stringify({ difs, eqs, n: K.pilotos.length, ordem: K.pilotos.every((x, i, a) => !i || a[i - 1].total >= x.total),
      meioProv: meio.pilotos.reduce((a, x) => a + x.prov, 0), foraProv: fora.reduce((a, x) => a + x.prov, 0), mexeu: meio.pilotos.some(x => x.delta !== 0) }); })()`));
  ok(r.difs.length === 0 && r.eqs.length === 0, `na bandeirada, os ${r.n} totais provisórios de pilotos e de construtores são os que o jogo grava${r.difs.length ? ': ' + r.difs.slice(0, 3).join(', ') : ''}`);
  ok(r.ordem && r.meioProv > 0 && r.foraProv === 0, 'no meio da corrida os pontos provisórios já contam, em ordem, e quem abandonou não soma nada');
  ok(r.mexeu, 'a torre mostra quem sobe e quem cai no campeonato durante a corrida');
}

/* 2. os setores */
{
  const corrida = seed => { const J = chefe(seed, 'f1', 2019, 4); return JSON.parse(J.run(`(() => { const sea = C.temporada; Chefe.gridDaEtapa(sea); const M = Chefe.montar();
    const R = Gp.criar(Gp.entrada(sea, M, Chefe.sk(), sea.ano, f => f.teamId === 'EU', { gestao: true }));
    const voltas = []; let g = 0;
    while(R.t < 1200 && g++ < 100000){ if(R.pergunta) Gp.responder(R, R.pergunta.padrao);
      const s0 = R.carros[0], v = s0.voltas, sv = s0.setVolta ? s0.setVolta.slice() : null; Gp.passo(R);
      if(s0.voltas > v && sv && sv[0] && sv[1] && s0.setUlt[2] && s0.ultima && s0.estado === 0) voltas.push([sv[0].t + sv[1].t + s0.setUlt[2].t, s0.ultima]); }
    const cores = {}; R.carros.forEach(c => (c.setUlt || []).forEach(x => { if(x) cores[x.cor] = (cores[x.cor] || 0) + 1; }));
    const roxos = R.carros.flatMap(c => (c.mSet || []).map((t, k) => t === R.mSet[k] ? 1 : 0)).reduce((a, b) => a + b, 0);
    return JSON.stringify({ voltas, mSet: R.mSet, cores, roxos }); })()`)); };
  const a = corrida(11), b = corrida(11);
  const err = Math.max(...a.voltas.map(v => Math.abs(v[0] - v[1])));
  ok(a.voltas.length >= 5 && err < .06, `os três setores somam a volta (${a.voltas.length} voltas, diferença máxima ${err.toFixed(3)} s)`);
  ok(JSON.stringify(a.mSet) === JSON.stringify(b.mSet), 'mesma semente, mesmos setores: a cor vem da simulação, não de sorteio');
  ok(a.roxos >= 3 && (a.cores.amarelo || 0) > 0, `cada melhor setor da corrida é o melhor pessoal de quem fez (${a.roxos}); quem não melhorou fica amarelo`);
}

/* 3. clima por região e época */
{
  const J = H.carregar({ silencioso: true, seed: 2 });
  const r = JSON.parse(J.run(`JSON.stringify({ bh: TRACKS.bh.rainP * chuvaRegiao(TRACKS.bh, 0, 20), bhBase: TRACKS.bh.rainP,
    beVerao: chuvaRegiao(TRACKS.be, 8, 20), beOutono: chuvaRegiao(TRACKS.be, 19, 20), sg: chuvaRegiao(TRACKS.sg || { cc:'SG' }, 15, 20) })`));
  ok(r.bh <= .005 && r.bh < r.bhBase, `Bahrein: ${(r.bh * 100).toFixed(1)}% de chance de chuva (era ${(r.bhBase * 100).toFixed(0)}%); rara, mas possível`);
  ok(r.beVerao < 1 && r.beOutono > 1 && r.sg === 1, 'na Europa chove menos no verão e mais na primavera e no outono');
}

/* 4. alertas e radar */
{
  const J = chefe(9, 'f1', 2019, 4);
  const r = JSON.parse(J.run(`(() => { const sea = C.temporada; Chefe.gridDaEtapa(sea); const M = Chefe.montar();
    const R = Gp.criar(Gp.entrada(sea, M, Chefe.sk(), sea.ano, f => f.teamId === 'EU', { gestao: true }));
    R.clima.fases = [[0, .8], [1500, 0]]; Gp.terminar(R);
    const tipos = R.eventos.map(e => e.tipo);
    return JSON.stringify({ largada: tipos.indexOf('largadaMolhada') >= 0, enchar: tipos.indexOf('encharcando') >= 0, parou: tipos.indexOf('parou') >= 0, secando: tipos.indexOf('secando') >= 0,
      ordem: tipos.indexOf('parou') < tipos.indexOf('secando') }); })()`));
  ok(r.largada && r.enchar && r.parou && r.secando && r.ordem, 'largada molhada, pista encharcando, a chuva parando e a pista secando viram alertas, nessa ordem');
  const radar = ano => { const K = chefe(12, 'f1', ano, 4); return JSON.parse(K.run(`(() => { const sea = C.temporada; Chefe.gridDaEtapa(sea); const M = Chefe.montar();
    const out = []; for(let k = 0; k < 12; k++){ const ent = Gp.entrada(sea, M, Chefe.sk(), sea.ano, f => f.teamId === 'EU', { gestao: true, seed: 100 + k });
      const R = Gp.criar(ent); R.clima.fases = [[0, 0], [600, .7]]; R.t = 0; const p = Gp.previsao(R); if(p) out.push(Math.abs(p.min - 10) / 10); }
    return JSON.stringify(out); })()`)); };
  const e75 = radar(1975), e20 = radar(2020), m = a => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length);
  ok(m(e75) > m(e20) * 2 && m(e20) < .1 && m(e20) > 0, `o radar erra a hora da chuva em ${(m(e75) * 100).toFixed(0)}% nos anos 70 e ${(m(e20) * 100).toFixed(0)}% hoje`);
}

/* 5. corrida avulsa e simular só esta corrida */
{
  const store = {};
  const J = H.carregar({ silencioso: true, seed: 2, store });
  H.novaCarreira(J, { era: 7, ano: 2018, idade: 24, serie: 'f1' }); J.run('Game.save()');
  const antes = store.vdo_save, sAntes = J.run('JSON.stringify(S)');
  const r = JSON.parse(J.run(`JSON.stringify((() => { const x = Chefe.corridaAvulsa('f1', 1994, 2); return x && { gp: x.rec.gp, n: x.rec.top.length, venc: x.rec.venc, pole: x.rec.pole }; })())`));
  ok(r && r.gp === 'San Marino' && r.n >= 20 && r.venc && r.pole, `corrida avulsa: GP de ${r && r.gp} de 1994 com o grid inteiro (${r && r.n} carros), vencedor e pole`);
  ok(J.run('JSON.stringify(S)') === sAntes && store.vdo_save === antes && !store.vdo_chefe && J.run('C === null'), 'a corrida avulsa não toca na carreira em andamento nem grava nada');
  const ind = JSON.parse(J.run(`JSON.stringify((() => { const x = Chefe.corridaAvulsa('indy', 2005, 0); return x && { n: x.rec.top.length }; })())`));
  ok(ind && ind.n >= 15, 'corrida avulsa em outra categoria (IndyCar 2005)');
  J.run('Game.simSeason(false, true); UI.limparFila(); UI.close();');
  ok(J.run('S.season.results.length') === 1 && J.run('S.season.round') === 1, 'simular só esta corrida anda exatamente uma etapa');
  J.run('UI.corridaAvulsa(Chefe.corridaAvulsa("f1", 2010, 0))');
  ok(/Corrida avulsa/.test(J.E('modal').innerHTML) && /Bahrein|Bahrain/.test(J.E('modal').innerHTML), 'a tela da corrida avulsa mostra o resultado');
}

/* 6. som */
{
  const store = {};
  const J = H.carregar({ silencioso: true, seed: 1, store });
  const r = J.run(`(() => { try { Som.luz(); Som.apagou(); Som.alerta(); Som.radio(); Som.box(); Som.bandeira(); Som.motor(true); Som.motor(false); return 'ok'; } catch(e){ return e.message; } })()`);
  ok(r === 'ok', 'sem áudio (testes, navegador sem Web Audio), os sons simplesmente não tocam');
  J.run('Som.definir({ ligado:false, vol:.3, ambiente:false })');
  ok(store.vdo_som === '0' && store.vdo_vol === '0.3' && store.vdo_somamb === '0', 'mudo, volume e ronco ficam guardados no aparelho');
  J.run('UI.somModal()');
  ok(/Volume/.test(J.E('modal').innerHTML) && /Mudo/.test(J.E('modal').innerHTML), 'a tela do som tem volume e mudo');
}

console.log(falhas ? `\n${falhas} de ${n} verificações falharam` : `\ncomunidade, fase 2: ${n} verificações, tudo certo`);
process.exit(falhas ? 1 : 0);
