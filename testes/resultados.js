/* Resultados de corrida: estados explícitos e números coerentes.
   Reproduz o relato "abandona quase todas as corridas", "Pnull" e "Pódio em nullº":
   — uma temporada de reserva mostra RES, não ABD, e nenhuma narrativa de pódio sem posição;
   — DNQ, DNPQ, lesão e reserva não contam como abandono;
   — grid, chegada, pontos e estatísticas batem com as provas;
   — uma temporada moderna em condições normais não tem abandono quase universal;
   — a velocidade da transmissão não muda o resultado nem os riscos;
   — proposta de reserva não esconde a de titular da mesma equipe.
   Uso: node testes/resultados.js   Não modifica arquivos nem saves. */
const H = require('./base');
let falhas = 0, n = 0;
const ok = (c, m) => { n++; if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };

function naPrincipal(J, ano, forte){
  const era = J.run(`ERAS.reduce((k, e, i) => e.y <= ${ano} ? i : k, 0)`);
  H.novaCarreira(J, { era, ano, idade: 22, serie:'f1', rapido: true });
  J.run(`(() => { const t = S.ladder.indexOf(Engine.topCat()); S.catIdx = t;
    const ts = Engine.teamsFor(Engine.topCat(), S.year, S.series, t, S.ladder.length).slice().sort((a, b) => b.str - a.str);
    const eq = ${forte ? 'ts[0]' : 'ts[ts.length - 1]'}; S.team = { id:eq.id, name:eq.name, color:eq.color, str:eq.str };
    for(const k in S.driver.attr) S.driver.attr[k] = 86; S.driver.ovr = Engine.ovr(S.driver.attr);
    S.driver.injured = 0; Game.startSeason(); UI.limparFila(); UI.close(); S.driver.injured = 0; })()`);
}

/* 1. narrativa nunca fala de pódio sem posição válida */
{
  const J = H.carregar({ silencioso:true });
  const casos = [{ grid:null, pos:null }, { grid:null, pos:null, dnf:'RES' }, { grid:null, pos:null, dnf:'DNQ' }, { grid:null, pos:null, dnf:'DNPQ' },
    { grid:5, pos:null, dnf:'MEC' }, { grid:null, pos:null, dnf:'XYZ' }, { grid:undefined, pos:2 }];
  const t = J.run(`${JSON.stringify(casos)}.map(r => narrative(r, null))`);
  ok(t.every(x => !/null|undefined|NaN/.test(x)), 'nenhuma narrativa com null, undefined ou NaN');
  ok(t.slice(0, 6).every(x => !/Pódio|pódio|Venceu|vitória/.test(x)), 'sem posição válida, nada de pódio nem vitória');
  ok(J.run('ord(null)') === '—' && J.run('ord(3)') === '3º', 'ordinal de posição ausente é "—", não "nullº"');
  const est = J.run(`['ACID','MEC','LES','RES','DNQ','DNPQ','DNS'].map(d => Engine.estadoProva({ dnf:d })).map(e => e.k + ':' + e.largou + ':' + !!e.abandono)`);
  ok(est.join(' ') === 'acid:true:true mec:true:true les:false:false res:false:false dnq:false:false dnpq:false:false dns:false:false', 'estados explícitos: só acidente e mecânica são abandono');
  ok(J.run(`Engine.estadoProva({ dnf:'RES', papelTipo:'teste' }).curto`) === 'TST' && J.run(`Engine.estadoProva({ dnf:'RES', papelTipo:'livre' }).curto`) === 'S/E', 'reserva, testes e sem equipe aparecem com o próprio rótulo');
}

/* 2. o relato: temporada de reserva na Mercedes do futuro */
{
  const J = H.carregar({ silencioso:true, seed: 9 });
  naPrincipal(J, 2032, true);
  J.run(`S.papel = Engine.novoPapel('reserva', S.team.name, null); Game.startSeason(); UI.limparFila(); UI.close(); S.driver.injured = 0;
    Engine.chanceAusencia = () => 0; Game.simSeason(); UI.limparFila(); UI.close();`);
  const r = J.run(`(() => { const sea = S.season; UI.retro(); const tab = document.getElementById('retroBox').innerHTML;
    const det = sea.results.map((x, i) => { UI.raceDetail(i); return document.getElementById('modal').innerHTML; });
    UI.sumBar(); const bar = document.getElementById('sumBar').innerHTML; const s = Engine.summary(sea);
    return { codigos: [...new Set(sea.results.map(x => x.dnf))], papel: sea.results.map(x => x.papelTipo), tab, det, bar, s }; })()`);
  ok(r.codigos.length === 1 && r.codigos[0] === 'RES' && r.papel.every(x => x === 'reserva'), 'todas as etapas do reserva ficam registradas como RES, com o papel');
  ok(!/>ABD</.test(r.tab) && /RES/.test(r.tab), 'a tabela da temporada mostra RES, não ABD');
  ok(r.det.every(h => !/null|Pódio em|undefined/.test(h)), 'o detalhe de cada etapa não mostra "Pnull" nem pódio inventado');
  ok(r.s.races === 0 && r.s.dnfs === 0 && r.s.naoLargou === r.s.inscricoes && /No box \(reserva\)/.test(r.bar), 'estatística: 0 largadas, 0 abandonos, e o resumo diz que você estava no box');
}

/* 3. DNQ e DNPQ não viram abandono (F1 1989, equipe mais fraca) */
{
  const J = H.carregar({ silencioso:true, seed: 11 });
  naPrincipal(J, 1989, false);
  J.run('Engine.chanceAusencia = () => 0; Game.simSeason(); UI.limparFila(); UI.close();');
  const r = J.run(`(() => { const sea = S.season; UI.retro(); const tab = document.getElementById('retroBox').innerHTML; const s = Engine.summary(sea);
    const nl = sea.results.filter(x => x.dnf === 'DNQ' || x.dnf === 'DNPQ').length; const ab = sea.results.filter(x => x.dnf === 'ACID' || x.dnf === 'MEC').length;
    return { nl, ab, s, tabDNQ: /DNP?Q/.test(tab), nar: sea.results.filter(x => x.dnf === 'DNQ' || x.dnf === 'DNPQ').map(x => narrative(x, sea)) }; })()`);
  ok(r.nl > 0 && r.tabDNQ, `${r.nl} etapa(s) sem classificação aparecem como DNQ/DNPQ na tabela`);
  ok(r.s.dnfs === r.ab && r.s.naoLargou === r.nl, 'o resumo conta abandono só para quem largou e não terminou');
  ok(r.nar.every(x => /classificou|pré-classificação/.test(x)), 'a narrativa diz que você não se classificou');
}

/* 4. grid, chegada, pontos e estatísticas batem; temporada moderna sem abandono quase universal */
{
  let corridas = 0, abandonos = 0, coerente = true;
  for(const seed of [3, 5, 8]){
    const J = H.carregar({ silencioso:true, seed });
    naPrincipal(J, 2024, true);
    J.run('Engine.chanceAusencia = () => 0; Game.simSeason(); UI.limparFila(); UI.close();');
    const r = J.run(`(() => { const sea = S.season; const s = Engine.summary(sea);
      const pts = sea.results.reduce((a, x) => a + (x.pts || 0), 0);
      /* o resumo conta Grandes Prêmios: a sprint da F1 tem a contagem dela */
      const gps = sea.results.filter(x => !x.sprintF1);
      const largou = gps.filter(x => Engine.estadoProva(x).largou).length;
      const ab = gps.filter(x => Engine.estadoProva(x).abandono).length;
      const gridOk = sea.results.every(x => !Engine.estadoProva(x).largou || posOk(x.grid));
      const fimOk = sea.results.every(x => x.dnf || posOk(x.pos));
      return { pts, dstand: sea.dstand.ME || 0, races: s.races, largou, ab, dnfs: s.dnfs, wins: s.wins, w: gps.filter(x => x.pos === 1).length, gridOk, fimOk, n: sea.results.length }; })()`);
    corridas += r.n; abandonos += r.ab;
    if(r.pts !== r.dstand || r.races !== r.largou || r.dnfs !== r.ab || r.wins !== r.w || !r.gridOk || !r.fimOk) coerente = false;
  }
  ok(coerente, 'pontos, largadas, abandonos, vitórias, grid e chegada batem com cada prova');
  ok(abandonos / corridas < .2, `F1 2024, melhor carro: ${abandonos} abandonos em ${corridas} corridas (${Math.round(abandonos / corridas * 100)}%)`);
}

/* 5. a velocidade da transmissão não muda a corrida */
{
  const J = H.carregar({ silencioso:true, seed: 4 });
  naPrincipal(J, 2024, true);
  const r = J.run(`(() => { const sea = S.season; const M = Engine.montarCorrida(sea);
    const ent = Gp.entrada(sea, M, S.series, sea.year, f => !!f.isMe);
    const roda = passo => { const R = Gp.criar(JSON.parse(JSON.stringify(ent))); R.equipeDecide = true; let g = 0;
      while(!R.fim && g++ < 2e6){ if(R.pergunta) Gp.responder(R, R.pergunta.padrao); Gp.avancar(R, R.t + passo); }
      const res = Gp.resultado(R); return res.ordem.map(o => o.id + (o.fora ? ':' + o.fora : '')).join(',') + '|sc' + R.eventos.filter(e => e.tipo === 'sc').length; };
    return { lento: roda(.1), rapido: roda(6.4), rapidissimo: roda(25) }; })()`);
  ok(r.lento === r.rapido && r.rapido === r.rapidissimo, 'a mesma corrida a 1×, 64× e 250×: mesma chegada, mesmos abandonos, mesmos safety cars');
}

/* 6. proposta de reserva não esconde a de titular da mesma equipe */
{
  const J = H.carregar({ silencioso:true });
  const r = J.run(`(() => { const t = { name:'Mercedes' };
    const offers = [{ cat:'Fórmula 1', team:t, papel:'reserva' }, { cat:'Fórmula 1', team:t }];
    return offers.filter((o, i, a) => a.findIndex(x => x.cat === o.cat && (x.team && x.team.name) === (o.team && o.team.name)
      && (x.papel || '') === (o.papel || '') && !!x.livre === !!o.livre) === i).length; })()`);
  const fonte = require('fs').readFileSync(require('path').join(__dirname, '..', 'index.html'), 'utf8');
  ok(r === 2 && /\(x\.papel \|\| ''\) === \(o\.papel \|\| ''\)/.test(fonte), 'reserva e titular da mesma equipe aparecem como duas propostas');
}

console.log(falhas ? falhas + ' falha(s) de ' + n : `resultados: ${n} verificações, tudo certo`);
if(falhas) process.exitCode = 1;
