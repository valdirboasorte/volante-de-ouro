/* As sessões ao vivo do modo chefe (treino livre e classificação):
   — no treino, cada saída de um carro seu gasta uma saída do acerto e traz o que
     o piloto sente; o acerto bom deixa a volta mais rápida;
   — na classificação, o carro que não sai fica sem tempo e cai para o fim; a hora
     da volta rápida vira a janela de saída; a torre e o resultado oficial têm a
     mesma ordem; depois da bandeirada ninguém abre volta rápida;
   — a volta única (2004) põe cada carro na pista uma vez, em fila.
   Uso: node testes/sessao-ao-vivo.js   Não modifica arquivos nem saves. */
const H = require('./base');
let falhas = 0, n = 0;
const ok = (c, m) => { n++; if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };

function equipe(ano, pos, seed){
  const J = H.carregar({ silencioso: true, seed: seed || 6 });
  J.run(`(() => { const l = eraOfSeries(${ano}, 'f1').teams.map((t, i) => [i, Engine.resolveTeam(t, i, ${ano}, 'f1')]).filter(x => x[1]).sort((a, b) => b[1].str - a[1].str);
    Chefe.novo({ chefe:{ nome:'T', cc:'BR' }, realismo:true, modo:'assumir', sk:'f1', ano:${ano}, idx:l[Math.min(l.length - 1, ${pos})][0] });
    const inv = C.inv; while(inv.decisoes.length) Chefe.resolverSaida(inv.decisoes[0], 'segurar');
    if(Chefe.ehF1() && !C.motor.proprio && !C.motor.nome) Chefe.escolherMotor(Chefe.motorObrigado().nome, 1);
    Chefe.comecarTemporada(); UI.limparFila(); UI.close(); })()`);
  return J;
}

/* 1. o treino livre */
{
  const J = equipe(2024, 3);
  const r = J.run(`(() => { const sea = C.temporada;
    const S = Sessao.criar('treino'); Sessao.S = S;
    const meu = S.carros.findIndex(c => c.ctrl);
    const st0 = Acerto.estado(sea, S.carros[meu].carro).usadas;
    Sessao.sair(meu);
    let g = 0; while(S.carros[meu].estado !== 'box' && g++ < 20000) Sessao.passo(S, .5);
    const st = Acerto.estado(sea, S.carros[meu].carro);
    const voltas = S.carros[meu].voltas.length;
    Sessao.terminar(S);
    /* acerto no ideal contra acerto longe dele: a mesma volta de treino */
    const k = S.carros[meu].carro, id = Acerto.ideal(sea, k);
    const tempo = v => { st.v = v.slice(); S.t = 100; return Sessao.tempoRapida(S, S.carros[meu]); };
    const bom = tempo(id), ruim = tempo(id.map(x => Math.max(1, Math.min(20, x + 5))));
    return { gastou: st.usadas - st0, fb: !!st.fb, voltas, fim: S.fim, ia: S.carros.filter(c => !c.ctrl && c.melhor != null).length, total: S.carros.length, bom, ruim, qs: !!(sea.qs && sea.qs.rd === sea.round) }; })()`);
  ok(r.gastou === 1 && r.fb, 'uma saída no treino gasta uma saída do acerto e traz o que o piloto sente');
  ok(r.voltas === 3, `a saída do treino tem três voltas rápidas (${r.voltas})`);
  ok(r.fim && r.ia >= r.total - 2, `a sessão acaba e a IA marca tempo (${r.ia} de ${r.total})`);
  ok(r.bom < r.ruim - .2, `acerto no ponto é mais rápido no treino (${r.bom.toFixed(3)} s contra ${r.ruim.toFixed(3)} s)`);
  ok(!r.qs, 'o treino não abre a classificação da etapa');
}

/* 2. a classificação ao vivo */
{
  const J = equipe(2024, 3);
  const r = J.run(`(() => { const sea = C.temporada; Chefe.qualiDaEtapa(sea);
    const S = Sessao.criar('quali'); Sessao.S = S;
    const meus = S.carros.map((c, i) => [c, i]).filter(([c]) => c.ctrl);
    /* um sai no fim da sessão; o outro fica na garagem */
    meus[0][0].plano = [S.dur * .82];
    let tardeAbriu = false;
    const passo0 = Sessao.passo;
    let g = 0; while(!S.fim && g++ < 400000){ Sessao.passo(S, .5);
      S.carros.forEach(c => { if(c.fase === 'rapida' && c.lapIni > S.dur + .5) tardeAbriu = true; }); }
    const janela = sea.qs.janelas[meus[0][0].carro];
    const torre = Sessao.ordem(S).filter(c => c.melhor != null).map(c => c.id);
    const res = Sessao.fechar(S);
    const oficial = res.ordem.filter(id => torre.indexOf(id) >= 0);
    return { janela, semTempo: meus[1][0].melhor == null, ultimo: res.ordem[res.ordem.length - 1] === meus[1][0].id,
      mesma: torre.join() === oficial.join(), tardeAbriu, sessao: res.n, prox: sea.qs.i }; })()`);
  ok(r.janela === 'tarde', `a volta no fim da sessão vira a janela "esperar o fim" (${r.janela})`);
  ok(r.semTempo && r.ultimo, 'o carro que não sai fica sem tempo e cai para o fim da sessão');
  ok(r.mesma, 'a torre de tempos e o resultado oficial têm a mesma ordem');
  ok(!r.tardeAbriu, 'depois da bandeirada ninguém abre volta rápida');
  ok(r.prox === 1, `o resultado do ${r.sessao} entra na classificação e a próxima sessão fica pronta`);
}

/* 3. a volta única de 2004: em fila, uma vez cada um */
{
  const J = equipe(2004, 3);
  const r = J.run(`(() => { const sea = C.temporada; const qs = Chefe.qualiDaEtapa(sea);
    const S = Sessao.criar('quali'); Sessao.terminar(S);
    return { fila: S.emFila, todos: S.carros.every(c => c.voltas.length === 1), formato: qs.fmt }; })()`);
  ok(r.fila && r.todos, `volta única (${r.formato}): cada carro sai uma vez, em fila`);
}

console.log(falhas ? `\n${falhas} de ${n} verificações falharam` : `sessões ao vivo: ${n} verificações, tudo certo`);
process.exit(falhas ? 1 : 0);
