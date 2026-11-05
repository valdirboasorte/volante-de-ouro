/* Corrida interativa 2D: pista, física e piloto automático.
   - toda pista do jogo (até 26 km) vira pista 2D sem número quebrado, com a trajetória dentro dela;
   - a mesma corrida rodada duas vezes dá o mesmo estado (determinismo);
   - a IA no limite faz a volta perto do tempo de referência do jogo (Prova.perfil), sem sair da pista.
   Uso: node testes/corrida2d.js   Não modifica arquivos nem saves. */
const path = require('path');
const fs = require('fs');
const vm = require('vm');
const { carregar } = require('./base');

const RAIZ = path.join(__dirname, '..');
function carregar2D(opts){
  const J = carregar(Object.assign({ silencioso: true }, opts || {}));
  for(const m of ['nucleo', 'pista2d', 'carro2d', 'ia2d', 'regras2d', 'entrada2d', 'render2d', 'sessao2d', 'boxes2d', 'boost2d', 'tela2d', 'carreira2d'])
    vm.runInContext(fs.readFileSync(path.join(RAIZ, 'assets', 'corrida2d', m + '.js'), 'utf8'), J.ctx, { filename: 'corrida2d/' + m + '.js' });
  return J;
}
module.exports = { carregar2D };
if(require.main !== module) return;

const J = carregar2D();
let falhas = 0, n = 0;
const ok = (cond, msg) => { n++; if(!cond){ falhas++; console.log('✗ ' + msg); } };

/* 1. todas as pistas */
const r1 = J.run(`(() => {
  const ids = Object.keys(TRACKS), ruins = [], longas = [];
  let feitas = 0;
  for(const id of ids){
    const kart = /^(kt_|kb_|kr_)/.test(id);
    const sk = TRACKS[id].type === 'oval' ? 'indy' : 'f1', ano = 2010;
    if(!C2D.Pista.suporta(id, ano)){ longas.push(id); continue; }
    try {
      const P = C2D.Pista.criar(id, ano, { sk, nivel: kart ? 4 : 0 });
      feitas++;
      const prob = [];
      for(let i = 0; i < P.n; i++){
        if(!isFinite(P.x[i]) || !isFinite(P.y[i])){ prob.push('xy'); break; }
        if(!(P.escE[i] > 0) || !(P.escD[i] > 0)){ prob.push('escape'); break; }
        if(Math.abs(P.linha.e[i]) > P.meia){ prob.push('linha fora'); break; }
        if(!(P.seco.v[i] > 0) || !isFinite(P.seco.v[i])){ prob.push('velocidade'); break; }
      }
      if(!(P.Tref > 0) || !(P.f > .4 && P.f < 2.6)) prob.push('calibração f=' + P.f);
      if(prob.length) ruins.push(id + ': ' + prob.join(', '));
    } catch(e){ ruins.push(id + ': ' + e.message); }
  }
  return { total: ids.length, feitas, ruins, longas };
})()`);
ok(r1.ruins.length === 0, 'pistas com problema: ' + r1.ruins.slice(0, 8).join(' | '));
ok(r1.feitas > 200, 'poucas pistas montadas: ' + r1.feitas);

/* 2. determinismo: vinte carros, trinta segundos, duas vezes */
const r2 = J.run(`(() => {
  const P = C2D.Pista.criar('br_int', 2024, { sk: 'f1', nivel: 0 });
  const roda = () => {
    const cs = [];
    for(let k = 0; k < 20; k++){
      const c = C2D.Carro.criar(P, { sk: 'f1', ano: 2024, id: 'c' + k }), vg = C2D.Pista.vaga(P, k + 1);
      C2D.Carro.posicionar(c, P, vg.s, vg.d); c.ia = C2D.IA.criar({ ritmo: .95 + k * .002, ruido: .6, semente: k + 1 }); cs.push(c);
    }
    for(let p = 0; p < 120 * 30; p++) for(const c of cs) C2D.Carro.passo(c, P, C2D.IA.comandar(c.ia, c, P, {}), C2D.DT, {});
    return C2D.impressao(cs);
  };
  return [roda(), roda()];
})()`);
ok(r2[0] === r2[1], 'a mesma corrida deu estados diferentes: ' + r2.join(' / '));

/* 3. a volta da IA no limite, perto do tempo de referência */
const CASOS = [['br_int', 2024, 'f1', .04], ['mc', 2024, 'f1', .07], ['gb_sil', 2024, 'f1', .04], ['jp_suz', 2024, 'f1', .04],
               ['indy', 2024, 'indy', .04], ['us_lbh', 2024, 'indy', .04], ['us_day', 2024, 'nascar', .04], ['us_wat', 2024, 'nascar', .04],
               ['br_int', 1990, 'f1', .05], ['it_imo', 1965, 'f1', .06]];
for(const [trk, ano, sk, tol] of CASOS){
  const r = J.run(`(() => {
    const P = C2D.Pista.criar('${trk}', ${ano}, { sk: '${sk}', nivel: 0 });
    const c = C2D.Carro.criar(P, { sk: '${sk}', ano: ${ano} });
    C2D.Carro.posicionar(c, P, -6, 0);
    const ia = C2D.IA.criar({ ritmo: 1 });
    let t = 0, ult = 0, volta = 0, fora = 0, muro = 0, passos = 0; const voltas = [];
    while(voltas.length < 2 && t < 600){
      C2D.Carro.passo(c, P, C2D.IA.comandar(ia, c, P, {}), C2D.DT, {}); t += C2D.DT;
      if(voltas.length >= 1 || c.sTot > P.L){ passos++; if(Math.abs(c.d) - c.sp.larg / 2 > P.meia) fora++; if(c.batida > 2) muro++; }
      const v = Math.floor(c.sTot / P.L);
      if(v > volta){ volta = v; if(v >= 1) voltas.push(t - ult); ult = t; }
    }
    return { Tref: P.Tref, volta: voltas[1], fora: fora / Math.max(1, passos), muro };
  })()`);
  const dif = (r.volta - r.Tref) / r.Tref;
  ok(r.volta > 0 && dif > -.02 && dif < tol, `${trk} ${ano} ${sk}: volta ${r.volta && r.volta.toFixed(3)} contra ${r.Tref.toFixed(3)} (${(dif * 100).toFixed(1)}%)`);
  ok(r.fora < .01, `${trk} ${ano} ${sk}: a IA passou ${(r.fora * 100).toFixed(1)}% da volta fora da pista`);
  ok(r.muro === 0 || trk === 'mc', `${trk} ${ano} ${sk}: a IA bateu no muro ${r.muro} vez(es)`);
}

console.log(falhas ? falhas + ' falha(s) de ' + n : `corrida 2D: ${r1.feitas} pistas montadas (${r1.longas.length} estradas longas de fora), ${n} verificações, tudo certo`);
process.exitCode = falhas ? 1 : 0;
