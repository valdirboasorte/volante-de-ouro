/* Os acontecimentos fora da pista aparecem no meio da temporada — não só
   quando o jogador volta ao painel — e pesam na carreira.
   — "Próxima corrida": o acontecimento aparece antes do fim de semana, e o
     fim de semana começa sozinho depois dele;
   — "Simular o resto do ano": a simulação para em cada acontecimento e segue;
   — o efeito é maior que o da ficha e mexe no ritmo das três corridas seguintes. */
const H = require('./base');
let falhas = 0;
const ok = (c, m) => { if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };
/* nos testes o setTimeout não roda: fechar uma janela é close() + proxima() */
const fechar = J => J.run('UI.close(); UI.proxima();');

{
  const J = H.carregar({ silencioso: true });
  H.novaCarreira(J, { era: 7, ano: 2023, idade: 24, rapido: false });
  J.run('S.season.eventosAt = [S.season.round + 1]; S.season.dilemmaAt = 99; S.promessasAtivas = [];');
  /* a corrida inteira, como o jogador: fim de semana, corrida, resultado */
  for(let k = 0; k < 40 && J.run('S.season.round') === 0; k++){
    J.run('UI.limparFila(); UI.close(); Game.nextRace();');
    if(J.run('S.season.round') !== 0) break;
    const st = J.run('(() => { const f = S.season.fds; return { etapa: f.etapa, ev: f.evento && !f.evento.escolha ? f.evento.k : null }; })()');
    if(st.ev) J.run(`Game.eventoFds(Engine.EVENTOS_FDS.find(x => x.k === '${st.ev}').o(S.season)[0].k);`);
    else if(st.etapa === 'treino') J.run(`Game.fazerTreino('acerto');`);
    else if(st.etapa === 'acerto') J.run('Game.setupNoEngenheiro();');
    else if(st.etapa === 'quali') J.run(`Game.fazerQuali('meio');`);
    /* depois do grid vem a preparação: a corrida só sai quando o jogador confirma a largada */
    else if(st.etapa === 'corrida') J.run('Game.confirmarLargada();');
  }
  ok(J.run('S.season.round') === 1, 'a primeira corrida acabou');
  ok(J.run('UI._fila.length') >= 1, 'o acontecimento ficou esperando atrás do resultado');
  /* "Próxima corrida →" na tela do resultado */
  J.run('UI.close(); Game.nextRace();');
  const abriu = J.run('UI.aberta()'), antesDoFds = J.run('!S.season.fds || S.season.fds.rd !== S.season.round');
  ok(abriu && antesDoFds, 'o acontecimento aparece antes do fim de semana seguinte');
  J.run('UI.limparFila();'); fechar(J);
  ok(J.run('!!S.season.fds && S.season.fds.rd === S.season.round && UI.aberta()'), 'depois dele, o fim de semana começa sozinho');
}
{
  const J = H.carregar({ silencioso: true });
  H.novaCarreira(J, { era: 7, ano: 2023, idade: 24, rapido: true });
  J.run('S.season.eventosAt = [2, 4]; S.season.dilemmaAt = 99; S.promessasAtivas = []; UI.limparFila(); UI.close();');
  J.run('Game.simSeason(true);');
  const paradas = [];
  for(let k = 0; k < 6 && J.run('UI.aberta()'); k++){
    paradas.push(J.run('S.season.round'));
    J.run('UI.limparFila();'); fechar(J);
  }
  const fim = J.run('S.season.round >= S.season.calendar.length');
  ok(paradas.join(',') === '2,4' && fim, `simular o ano para nos acontecimentos (parou nas rodadas ${paradas.join(', ') || 'nenhuma'}) e vai até o fim`);
}
{
  const J = H.carregar({ silencioso: true });
  H.novaCarreira(J, { era: 7, ano: 2023, idade: 24, rapido: true });
  const r = J.run(`(() => { S.driver.morale = 60; const e = EVENTOS.find(x => x.id === 'familia');
    UI.eventoModal(e); Game.escolherEvento(2);
    return { moral: S.driver.morale, emb: Engine.embalo(S.season), embalo: S.embalo }; })()`);
  ok(r.moral === 60 - Math.round(9 * 1.4), `efeito maior que o da ficha (moral 60 → ${r.moral})`);
  ok(r.emb < 0 && r.embalo.ate === J.run('S.season.round') + 3, `abalado nas próximas três corridas (${r.emb})`);
  /* e o embalo pesa no ritmo da corrida */
  const d = J.run(`(() => { let soma = 0; for(let k = 0; k < 40; k++){ S.embalo = { v: 1.5, ano: S.season.year, ate: S.season.round + 3 };
      const a = Engine.montarCorrida(S.season).running.find(x => x.f.isMe); S.embalo = null;
      const b = Engine.montarCorrida(S.season).running.find(x => x.f.isMe); if(a && b) soma += a.vr - b.vr; } return soma / 40; })()`);
  ok(d > 0, `embalo positivo deixa o carro mais rápido (+${d.toFixed(2)} de ritmo médio)`);
}

console.log(falhas ? falhas + ' falha(s)' : 'acontecimentos: aparecem no meio da temporada e pesam');
if(falhas) process.exitCode = 1;
