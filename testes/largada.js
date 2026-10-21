/* A largada pelas luzes (corrida ao vivo, modo chefe e modo piloto):
   — cada carro sai quando o piloto reage; a IA reage entre 0,12 e 0,45 s;
   — a reação do jogador vale para os carros dele: reagir rápido rende posições
     na primeira volta, dormir nas luzes custa posições;
   — soltar com as luzes acesas queima a largada: 5 s de punição;
   — a reação só vale antes de a corrida andar;
   — a mesma semente com a mesma reação dá a mesma corrida.
   Uso: node testes/largada.js   Não modifica arquivos nem saves. */
const H = require('./base');
let falhas = 0, n = 0;
const ok = (c, m) => { n++; if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };

const J = H.carregar({ silencioso: true, seed: 11 });
J.run(require('./chefe-comum'));
J.run(`(() => { const l = eraOfSeries(2024, 'f1').teams.map((t, i) => [i, Engine.resolveTeam(t, i, 2024, 'f1')]).filter(x => x[1]).sort((a, b) => b[1].str - a[1].str);
  Chefe.novo({ chefe:{ nome:'T', cc:'BR' }, realismo:true, eq:{ nome:'Equipe Teste', cor:'#123456', cc:'GB' }, modo:'assumir', sk:'f1', ano:2024, idx:l[5][0] });
  __inverno(); Chefe.comecarTemporada(); UI.limparFila(); UI.close();
  const sea = C.temporada; Chefe.gridDaEtapa(sea); const M = Chefe.montar();
  globalThis._ent = Gp.entrada(sea, M, Chefe.sk(), sea.ano, f => f.teamId === 'EU', { gestao: true, seed: 777 });
  /* a primeira volta: posição de cada carro seu quando o líder fecha a volta 1 */
  globalThis._volta1 = (seed, reac, queimou) => {
    const ent = JSON.parse(JSON.stringify(_ent)); ent.seed = seed;
    ent.carros.forEach(c => { c.risco = null; c.erro = false; });
    const R = Gp.criar(ent); R.regras.scProb = 0; R.regras.vscProb = 0;
    if(reac != null) Gp.largar(R, reac, queimou);
    let g = 0; while(!R.fim && (!R.lider || R.lider.voltas < 1) && g++ < 100000) Gp.passo(R);
    const ord = Gp.ordem(R);
    return R.carros.filter(s => s.c.ctrl).map(s => ({ grid: s.c.grid, pos: ord.indexOf(s) + 1, penal: s.penal, atraso: s.reacao }));
  };
})()`);

/* 1. a IA reage dentro do que um piloto de verdade reage */
{
  const r = J.run(`(() => { const R = Gp.criar(JSON.parse(JSON.stringify(_ent))); return R.carros.map(s => s.atraso); })()`);
  ok(r.every(a => a >= .12 && a <= .45), `cada piloto sai entre 0,12 e 0,45 s depois das luzes (${Math.min(...r).toFixed(3)} a ${Math.max(...r).toFixed(3)} s)`);
  ok(new Set(r.map(a => a.toFixed(3))).size > r.length / 2, 'cada piloto tem a própria reação');
}

/* 2. reagir rápido rende posições; dormir nas luzes custa */
{
  const r = J.run(`(() => { let rap = 0, len = 0, k = 0;
    for(let sd = 1; sd <= 12; sd++){
      const a = _volta1(1000 + sd, .15, false), b = _volta1(1000 + sd, .65, false);
      a.forEach((x, i) => { rap += x.pos; len += b[i].pos; k++; });
    }
    return { rap: rap / k, len: len / k }; })()`);
  ok(r.rap + 1 < r.len, `reação de 0,15 s termina a volta 1 em ${r.rap.toFixed(1)}º, em média; 0,65 s, em ${r.len.toFixed(1)}º`);
}

/* 3. largada queimada: 5 s de punição para cada carro seu */
{
  const r = J.run(`(() => { const R = Gp.criar(JSON.parse(JSON.stringify(_ent))); Gp.largar(R, 0, true);
    return { pen: R.carros.filter(s => s.c.ctrl).map(s => s.penal), ev: R.eventos.filter(e => e.tipo === 'punicao' && /largada/.test(e.motivo)).length,
             ia: R.carros.filter(s => !s.c.ctrl).every(s => s.penal === 0) }; })()`);
  ok(r.pen.every(p => p === 5) && r.ev === r.pen.length && r.ia, 'queimar a largada dá 5 s de punição aos seus carros, e só a eles');
}

/* 4. só vale antes de a corrida andar */
{
  const r = J.run(`(() => { const R = Gp.criar(JSON.parse(JSON.stringify(_ent))); Gp.passo(R); return Gp.largar(R, .2, false); })()`);
  ok(r === false, 'depois que a corrida andou, a reação não muda mais nada');
}

/* 5. a mesma semente e a mesma reação dão a mesma corrida */
{
  const r = J.run(`(() => { const corr = () => { const R = Gp.criar(JSON.parse(JSON.stringify(_ent))); Gp.largar(R, .231, false); Gp.terminar(R);
      return Gp.ordem(R).map(s => s.c.id + ':' + (s.fim != null ? s.fim.toFixed(2) : 'x')).join('|'); };
    return corr() === corr(); })()`);
  ok(r, 'a mesma semente com a mesma reação dá o mesmo resultado');
}

/* 6. a transmissão abre nas luzes quando há carro seu no grid */
{
  const r = J.run(`(() => { const fs = typeof AoVivo.luzes === 'function', s = String(AoVivo.montar); return fs && /AoVivo\\.luzes\\(\\)/.test(s); })()`);
  ok(r, 'a corrida ao vivo começa pelas luzes da largada');
}

console.log(falhas ? `\n${falhas} de ${n} verificações falharam` : `largada: ${n} verificações, tudo certo`);
process.exit(falhas ? 1 : 0);
