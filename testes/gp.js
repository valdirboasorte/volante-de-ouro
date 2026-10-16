/* A corrida ao vivo (Gp) e o imprevisto do fim de semana.
   — a corrida termina, sem NaN, com todos os carros na chegada;
   — com dois compostos obrigatórios, quem termina no seco usou dois;
   — a parada pedida do muro acontece, com o pneu pedido;
   — largada no molhado sai com pneu de chuva;
   — o fim de semana da carreira passa pelos imprevistos de sexta, sábado e domingo;
   — punição de grid empurra o carro para trás sem quebrar o grid (carreira e chefe). */
const H = require('./base');
let falhas = 0;
const ok = (c, m) => { if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };
const gridValido = g => { const v = Object.values(g).sort((a, b) => a - b); return v.every((x, k) => x === k + 1); };

const J = H.carregar({ silencioso: true });
H.novaCarreira(J, { era: 7, ano: 2023, idade: 24, rapido: false });

/* ── a corrida ao vivo ── */
J.run(`_ent = () => { const sea = S.season; const M = Engine.montarCorrida(sea);
  const ent = Gp.entrada(sea, M, S.series, sea.year, f => !!f.isMe);
  ent.carros.forEach(c => { if(c.me){ c.fora = null; c.fracFora = null; c.erro = false; } });
  return { M, ent }; };`);
{
  const r = J.run(`(() => { const { M, ent } = _ent(); ent.wet = false; const R = Gp.criar(ent); Gp.terminar(R); const res = Gp.resultado(R);
    const chegou = R.carros.filter(s => s.estado !== 3);
    return { fim: R.fim, n: res.ordem.length, total: M.running.length + M.out.length,
      nan: R.carros.some(s => !isFinite(s.s) || !isFinite(s.v)) || res.ordem.some(o => o.fim != null && !isFinite(o.fim)),
      choveu: R.choveu, dois: R.regras.doisCompostos,
      semDois: chegou.filter(s => new Set([...s.usados].filter(c => !Gp.COMP[c].chuva)).size < 2).length,
      pararam: R.carros.filter(s => s.paradas > 0).length }; })()`);
  ok(r.fim, 'a corrida chega à bandeirada');
  ok(r.n === r.total, `todos os carros na chegada (${r.n} de ${r.total})`);
  ok(!r.nan, 'nenhuma posição, velocidade ou tempo NaN');
  ok(r.pararam > 0, `houve paradas nos boxes (${r.pararam} carros pararam)`);
  if(r.dois && !r.choveu) ok(r.semDois === 0, 'regra dos dois compostos cumprida por quem terminou');
}
{
  const r = J.run(`(() => { const { ent } = _ent(); ent.wet = false; const R = Gp.criar(ent);
    const i = R.carros.findIndex(s => s.c.me), s = R.carros[i];
    const pedido = s.pneu.c === 'H' ? 'S' : 'H';
    Gp.avancar(R, R.T * 6); while(R.pergunta){ Gp.responder(R, R.pergunta.padrao); Gp.avancar(R, R.T * 6); }
    const paradas0 = s.paradas;
    Gp.comandar(R, i, { parar: pedido, modo: 'atacar' });
    Gp.avancar(R, R.T * 9.5); while(R.pergunta){ Gp.responder(R, R.pergunta.padrao); Gp.avancar(R, R.T * 9.5); }
    const fez = s.paradas > paradas0 && s.usados.has(pedido);
    Gp.terminar(R);
    return { fez, pedido, estado: s.estado }; })()`);
  ok(r.fez || r.estado === 3, `a parada pedida do muro acontece, com ${r.pedido}`);
}
{
  const r = J.run(`(() => { const { ent } = _ent(); ent.wet = true; const R = Gp.criar(ent);
    const largou = R.carros.map(s => s.pneu.c); Gp.terminar(R);
    return { chuva: largou.every(c => Gp.COMP[c].chuva), fim: R.fim }; })()`);
  ok(r.chuva && r.fim, 'largada no molhado com pneu de chuva, e a corrida termina');
}

{
  /* o seu carro não para sozinho: a equipe só chama no rádio */
  const r = J.run(`(() => { const { ent } = _ent(); ent.wet = false; const R = Gp.criar(ent);
    const s = R.carros.find(x => x.c.me), planejou = s.plano.length > 0;
    let guarda = 0;
    while(!R.fim && guarda++ < 2000){ Gp.avancar(R, R.t + 30); if(R.pergunta) Gp.responder(R, 'seguir'); }
    return { fim: R.fim, paradas: s.paradas, estado: s.estado, planejou, radio: R.eventos.filter(e => e.tipo === 'sugestao' && e.a === s.i).length,
             outros: R.carros.filter(x => !x.c.ctrl && x.paradas > 0).length }; })()`);
  ok(r.fim && r.paradas === 0, `sem o seu comando o carro não para (${r.paradas} paradas; os outros pararam: ${r.outros})`);
  ok(r.radio > 0 || r.estado === 3 || !r.planejou, `a equipe chamou no rádio ${r.radio} vez(es)`);
}

/* ── o fim de semana da carreira, do treino à bandeirada ── */
function fimDeSemana(etapa){
  const rd0 = J.run('S.season.round');
  J.run(`Engine.garantirFds(S.season, S.season.round).sorteio = '${etapa}';`);
  const vistos = [];
  for(let k = 0; k < 60 && J.run('S.season.round') === rd0; k++){
    J.run('UI.limparFila(); UI.close(); Game.nextRace();');
    if(J.run('S.season.round') !== rd0) break;
    const st = J.run(`(() => { const f = S.season.fds; return { etapa: f.etapa, ev: f.evento && !f.evento.escolha ? f.evento : null, n: (f.treinos || []).length, s: f.sessoes }; })()`);
    if(st.ev){
      vistos.push(st.ev.k + '@' + st.ev.etapa);
      J.run(`Game.eventoFds(Engine.EVENTOS_FDS.find(x => x.k === '${st.ev.k}').o(S.season)[0].k);`);
      continue;
    }
    if(st.etapa === 'treino') J.run(`Game.fazerTreino('acerto');`);
    else if(st.etapa === 'acerto') J.run('Game.setupNoEngenheiro();');
    else if(st.etapa === 'quali') J.run(`Game.fazerQuali('meio');`);
  }
  J.run('UI.limparFila(); UI.close();');
  return { correu: J.run('S.season.round') === rd0 + 1, vistos };
}
{
  const vistos = [];
  let corridas = 0;
  ['treino', 'quali', 'corrida', 'quali', 'corrida', 'treino'].forEach(et => {
    if(J.run('S.season.round') >= J.run('S.season.calendar.length') || J.run('S.retired')) return;
    const r = fimDeSemana(et);
    if(r.correu) corridas++;
    vistos.push(...r.vistos);
  });
  ok(corridas === 6, `seis fins de semana corridos do começo ao fim (${corridas})`);
  const etapas = new Set(vistos.map(v => v.split('@')[1]));
  ok(etapas.has('quali') && etapas.has('corrida'), `imprevistos apareceram no sábado e no domingo (${vistos.join(', ') || 'nenhum'})`);
}
{
  /* a punição dos comissários: três posições, grid continua de 1 a N */
  const r = J.run(`(() => { const sea = S.season; const fds = Engine.garantirFds(sea, sea.round);
    fds.sorteio = 'feito'; fds.evento = { k: 'comissarios', etapa: 'quali', escolha: null };
    Engine.escolherEventoFds(sea, 'aceitar');
    fds.quali = Engine.rodarQuali(sea, sea.round, 'meio');
    const M = Engine.montarCorrida(sea);
    return { antes: fds.quali.grid.ME, depois: M.grid.ME, n: sea.field.length, grid: M.grid }; })()`);
  ok(r.depois === Math.min(r.n, r.antes + 3) && gridValido(r.grid), `punição de grid na carreira: ${r.antes}º → ${r.depois}º, grid íntegro`);
  const c = J.run(`(() => { const sea = S.season; const fds = sea.fds;
    fds.efeitos = {}; fds.evento = { k: 'calor', etapa: 'corrida', escolha: null };
    Engine.escolherEventoFds(sea, 'poupar');
    const M = Engine.montarCorrida(sea); const ent = Gp.entrada(sea, M, S.series, sea.year, f => !!f.isMe);
    ent.wet = false; const R = Gp.criar(ent); const eu = ent.carros.find(c => c.me);
    return { calor: ent.calor, pista: R.clima.pista, modo: eu.modo }; })()`);
  ok(c.calor === 10 && c.modo === 'poupar' && c.pista >= 48, `onda de calor: asfalto a ${c.pista} °C, largada poupando`);
}

/* ── o chefe de equipe ── */
{
  const K = H.carregar({ silencioso: true });
  K.run(`Chefe.novo({ modo:'criar', ano:2018, chefe:{ nome:'T', cc:'BR' }, eq:{ nome:'Teste', cor:'#123456', cc:'BR' } });
         UI.show = () => {}; UIC.render = () => {};
         while(Chefe.titulares().filter(p => !p.venceu).length < 2) Chefe.assinar(C.inv.mercado[0], { sal:1, anos:2, n1:false, papel:'titular' }, 1);
         if(!C.motor.nome) Chefe.escolherMotor(Chefe.motorObrigado().nome, 2);
         UIC.comecar(); UI.close();`);
  /* motor trocado em 2018: dez posições para trás */
  const r = K.run(`(() => { const sea = C.temporada; Chefe.escalar(sea);
    const f0 = sea.field.find(f => f.teamId === 'EU' && f.ativo && f.carro === 0);
    sea.fds = { rd: sea.round, evento: { k: 'motor', carro: 0, nome: f0.name, escolha: 'trocar' }, efeitos: {} };
    const M = Chefe.montar();
    return { g: M.grid[f0.id], n: M.corre.length, grid: M.grid, notas: M.notas }; })()`);
  ok(r.g >= Math.min(r.n, 11) && gridValido(r.grid), `chefe: motor trocado larga em ${r.g}º, grid íntegro`);
  ok(r.notas.some(n => /motor/i.test(n)), 'chefe: o imprevisto aparece no resumo da corrida');
  /* ordem de equipe: quando um carro está colado atrás do outro, o da frente abre */
  const o = K.run(`(() => { for(let t = 0; t < 12; t++){
      const M = Chefe.montar(); const sea = C.temporada;
      const ent = Gp.entrada(sea, M, 'f1', sea.ano, f => f.teamId === 'EU');
      ent.carros.forEach(c => { c.fora = null; });
      const R = Gp.criar(ent);
      const nossos = R.carros.filter(s => s.c.ctrl);
      let guarda = 0;
      while(!R.fim && guarda++ < 400000){
        if(R.pergunta) Gp.responder(R, R.pergunta.padrao);
        Gp.passo(R);
        for(const s of nossos){ const j = Gp.podeCeder(R, s.i); if(j && R.lider && R.lider.voltas > 2){
          const r = Gp.comandar(R, s.i, { ceder: j.i });
          const ate = R.t + 40; Gp.avancar(R, ate); while(R.pergunta && R.t < ate){ Gp.responder(R, R.pergunta.padrao); Gp.avancar(R, ate); }
          return { r: r || 'ok', oe: R.ordemEquipe, passou: j.s > s.s || s.estado !== 0 || j.estado !== 0, tentativas: t + 1 };
        } }
      }
    } return null; })()`);
  if(o) ok(o.r === 'ok' && o.oe && o.passou, `chefe: ordem de equipe obedecida (achou a chance na ${o.tentativas}ª corrida)`);
  else console.log('  · chefe: os dois carros não ficaram colados em 12 corridas; ordem de equipe não testada');
  let com = 0, erros = 0;
  for(let k = 0; k < 8; k++){
    try {
      K.run('UI.limparFila(); UI.close(); C.temporada.fds = null; UIC.preCorrida();');
      if(K.run('!!(C.temporada.fds && C.temporada.fds.evento)')) com++;
      K.run('UIC.largar(); UI.limparFila(); UI.close();');
    } catch(e){ erros++; console.log('    ' + e.message); }
  }
  ok(erros === 0 && K.run('C.temporada.round') >= 8, `chefe: oito fins de semana sem erro (${com} com imprevisto)`);
}

console.log(falhas ? falhas + ' falha(s)' : 'corrida ao vivo e fim de semana: tudo certo');
if(falhas) process.exitCode = 1;
