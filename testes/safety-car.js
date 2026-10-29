/* Safety car na corrida ao vivo.
   — com o pelotão espalhado, os intervalos diminuem volta a volta sob safety car;
   — a ordem na pista se mantém (sem ultrapassagem), e os boxes seguem funcionando;
   — retardatário à frente do líder não recupera a volta, a menos que o regulamento deixe;
   — a relargada sai com o pelotão agrupado;
   — o safety car virtual não agrupa: os intervalos ficam;
   — o mesmo resultado em velocidades diferentes de transmissão.
   Uso: node testes/safety-car.js   Não modifica arquivos nem saves. */
const H = require('./base');
let falhas = 0, n = 0;
const ok = (c, m) => { n++; if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };

const J = H.carregar({ silencioso:true, seed: 12 });
H.novaCarreira(J, { era: 7, ano: 2024, idade: 24, rapido: true });
J.run(`(() => { const t = S.ladder.indexOf(Engine.topCat()); S.catIdx = t;
  const ts = Engine.teamsFor(Engine.topCat(), S.year, S.series, t, S.ladder.length);
  S.team = { id:ts[3].id, name:ts[3].name, color:ts[3].color, str:ts[3].str }; S.driver.injured = 0;
  Game.startSeason(); UI.limparFila(); UI.close(); S.driver.injured = 0; })()`);
J.run(`globalThis._corrida = (tipo, desdobra, passo) => {
  const sea = S.season; sea.round = 3;
  const M = Engine.montarCorrida(sea); const ent = Gp.entrada(sea, M, 'f1', 2024, f => false, { seed: 4242 });
  ent.wet = false; ent.carros.forEach(c => { c.fora = null; c.fracFora = null; c.erro = false; });
  const R = Gp.criar(ent); R.w = 0; R.choveu = false; R.clima.fases = [[0, 0]];
  R.regras.scProb = 0; R.regras.vscProb = 0; R.regras.desdobra = desdobra; R.equipeDecide = true;
  R.carros.forEach(s => { s.plano = []; });
  const L = R.g.L, ate = alvo => { let g = 0; while(R.lider ? R.lider.voltas < alvo : g < 5) { Gp.avancar(R, R.t + (passo || 1)); if(g++ > 2e5) break; } };
  const rodando = () => R.carros.filter(s => s.estado === 0);
  const espalhado = () => { const r = rodando().filter(s => R.lider.s - s.s < L * .5); return Math.max(...r.map(s => R.lider.s - s.s)); };
  const ordem = () => R.carros.filter(s => s.estado === 0).sort((a, b) => b.s - a.s).map(s => s.i).join(',');
  ate(10);
  const L0 = R.lider.voltas;
  /* um retardatário plantado à frente do líder na pista (quase uma volta atrás) */
  const ret = rodando().sort((a, b) => a.s - b.s)[0];
  ret.s = R.lider.s - L * .7; ret.voltas = Math.floor(ret.s / L);
  const deficit0 = R.lider.s - ret.s;
  const gapsAntes = espalhado(), ordemAntes = ordem();
  R.sc = { tipo, desde: R.t, ateVolta: L0 + 4, fim: false }; R.evento(tipo === 'SC' ? 'sc' : 'vsc', null, null, { motivo: 'teste' });
  const serie = [gapsAntes];
  for(let v = 1; v <= 4; v++){ ate(L0 + v); serie.push(espalhado()); }
  const ordemDepois = R.carros.filter(s => s.estado === 0 && s !== ret).sort((a, b) => b.s - a.s).map(s => s.i).join(',');
  const ordemAntesSemRet = ordemAntes.split(',').filter(x => +x !== ret.i).join(',');
  const deficit1 = R.lider.s - ret.s;
  ate(L0 + 6);
  /* o recolhimento sai no passo seguinte ao líder fechar a volta combinada: olha depois da janela */
  const verde = R.eventos.some(e => e.tipo === 'verde' && R.sc && R.sc.fim && e.t >= R.sc.desde);
  return { serie: serie.map(x => Math.round(x)), ordemIgual: ordemAntesSemRet === ordemDepois, verde, deficit0: Math.round(deficit0), deficit1: Math.round(deficit1), L: Math.round(L) };
};`);

const sc = J.run(`_corrida('SC', false, 1)`);
ok(sc.serie[0] > 1500, `pelotão espalhado antes do safety car: ${sc.serie[0]} m do líder ao último da mesma volta`);
ok(sc.serie[1] < sc.serie[0] * .6 && sc.serie[2] <= sc.serie[1] + 20 && sc.serie[4] < sc.serie[0] * .4,
   `sob safety car o pelotão alcança a fila e fica nela: ${sc.serie.join(' → ')} m`);
ok(sc.serie[4] < 45 * 22, 'a fila tem o tamanho de carros em distância segura, não um amontoado nem um teletransporte');
ok(sc.ordemIgual, 'a ordem na pista se mantém sob safety car');
ok(sc.verde, 'o safety car recolhe e a bandeira verde volta');
ok(sc.deficit1 >= sc.deficit0 - 50, `sem permissão, o retardatário à frente do líder não recupera a volta (${sc.deficit0} → ${sc.deficit1} m de déficit)`);
const des = J.run(`_corrida('SC', true, 1)`);
ok(des.deficit1 < des.L * .55, `com permissão do regulamento, ele vai para o fim da fila e recupera a volta (${des.deficit0} → ${des.deficit1} m)`);
const vsc = J.run(`_corrida('VSC', false, 1)`);
ok(Math.abs(vsc.serie[4] - vsc.serie[0]) < vsc.serie[0] * .25, `safety car virtual: os intervalos ficam (${vsc.serie.join(' → ')} m)`);
/* mesmas horas de prova a 1× e a 8×: safety car entra aos 800 s, mede aos 1200 s */
J.run(`(() => { const sea = S.season; sea.round = 3; const M = Engine.montarCorrida(sea);
  globalThis._entFixa = Gp.entrada(sea, M, 'f1', 2024, f => false, { seed: 4242 });
  _entFixa.wet = false; _entFixa.carros.forEach(c => { c.fora = null; c.fracFora = null; c.erro = false; }); })()`);
J.run(`globalThis._porTempo = passo => {
  const R = Gp.criar(JSON.parse(JSON.stringify(_entFixa))); R.w = 0; R.choveu = false; R.clima.fases = [[0, 0]];
  R.regras.scProb = 0; R.regras.vscProb = 0; R.equipeDecide = true; R.carros.forEach(s => { s.plano = []; });
  const ate = T => { while(R.t < T) Gp.avancar(R, Math.min(T, R.t + passo)); };
  ate(800); R.sc = { tipo:'SC', desde: R.t, ateVolta: R.lider.voltas + 5, fim: false };
  ate(1200);
  return R.carros.map(s => Math.round(s.s * 10) / 10).join(','); };`);
const t1 = J.run('_porTempo(1)'), t8 = J.run('_porTempo(8)'), t25 = J.run('_porTempo(25)');
const rapido = { iguais: t1 === t8 && t8 === t25 };
ok(rapido.iguais, 'a 1×, 8× e 25× cada carro está no mesmo metro da pista nas mesmas horas de prova, com safety car');

console.log(falhas ? falhas + ' falha(s) de ' + n : `safety car: ${n} verificações, tudo certo`);
if(falhas) process.exitCode = 1;
