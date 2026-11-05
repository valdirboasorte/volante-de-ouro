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
  for(const m of ['nucleo', 'pista2d', 'carro2d', 'ia2d', 'regras2d', 'entrada2d', 'arte2d', 'cenario2d', 'render2d', 'sessao2d', 'boxes2d', 'boost2d', 'assist2d', 'tela2d', 'carreira2d'])
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

/* 4. as ajudas: quem só vira e acelera, sem nunca frear, completa as voltas com o freio
   assistido (e o controle de estabilidade), e sem ele sai da pista */
for(const [trk, sk, ano, ajuda] of [['br_int', 'f1', 2024, true], ['mc', 'f1', 2024, true], ['us_lbh', 'indy', 2024, true], ['br_int', 'f1', 2024, false]]){
  const r = J.run(`(() => {
    const S = C2D.Sessao.criar({ trkId: '${trk}', ano: ${ano}, sk: '${sk}', nivel: 0, tipo: 'treino', semLargada: true,
      carros: [{ id: 'ME', me: true, assist: { freioAuto: ${ajuda} } }] });
    const c = S.eu, ia = C2D.IA.criar({ ritmo: 1 });
    let muro = 0, t = 0;
    while(c.voltas < 3 && t < 400){
      const base = C2D.IA.comandar(ia, c, S.P, S.amb);
      C2D.Sessao.passo(S, { steer: base.steer, acel: 1, freio: 0, uma: {} }, C2D.DT); t += C2D.DT;
      if(c.batida > 3) muro++;
    }
    return { voltas: c.voltas, muro, melhor: c.melhor, Tref: S.P.Tref };
  })()`);
  if(ajuda) ok(r.voltas >= 3 && r.muro === 0 && r.melhor < r.Tref * 1.15, `${trk}: com o freio assistido, só acelerando, ${r.voltas} voltas e ${r.muro} batidas (melhor ${r.melhor && r.melhor.toFixed(2)})`);
  else ok(r.muro > 0 || r.voltas < 3, `${trk}: sem o freio assistido, só acelerando, o carro devia sair da pista`);
}

/* 5. limites de pista: no tolerante a zebra é pista e um toque rápido na grama não conta;
   as punições vêm mais tarde (6º aviso, depois a cada dois); o rigoroso é a regra estrita */
const r5 = J.run(`(() => {
  const caso = (modo, dExtra, seg) => {
    const S = C2D.Sessao.criar({ trkId: 'br_int', ano: 2024, sk: 'f1', nivel: 0, tipo: 'corrida', voltas: 5, carros: [{ id: 'ME', me: true }], limites: modo, semLargada: true });
    const c = S.eu; c.ini = 0; c.v = 50; c.piso = 0; c.d = S.P.meia + c.sp.larg / 2 + dExtra;
    for(let t = 0; t < seg; t += C2D.DT) C2D.Sessao.limites(S, c, { acel: 1 }, C2D.DT);
    return c.avisos;
  };
  const pun = (modo, a) => { const S = C2D.Sessao.criar({ trkId: 'br_int', ano: 2024, sk: 'f1', nivel: 0, tipo: 'corrida', voltas: 5, carros: [{ id: 'ME', me: true }], limites: modo, semLargada: true });
    S.eu.avisos = a; C2D.Corrida.depois(S, C2D.DT); return S.eu.penal; };
  return { tz: caso('tolerante', 1.05, 1), tg: caso('tolerante', 2.6, .2), tl: caso('tolerante', 2.6, .8), rz: caso('rigoroso', 1.05, 1), dl: caso('desligado', 2.6, .8),
           t5: pun('tolerante', 5), t6: pun('tolerante', 6), t8: pun('tolerante', 8), r4: pun('rigoroso', 4) };
})()`);
ok(r5.tz === 0 && r5.tg === 0 && r5.tl === 1, 'tolerante: zebra e toque rápido na grama não contam, saída longa conta');
ok(r5.rz === 1 && r5.dl === 0, 'rigoroso conta a zebra; desligado não conta nada');
ok(r5.t5 === 0 && r5.t6 === 5 && r5.t8 === 10 && r5.r4 === 5, `punições: tolerante ${r5.t5}/${r5.t6}/${r5.t8} s, rigoroso ${r5.r4} s no 4º aviso`);

console.log(falhas ? falhas + ' falha(s) de ' + n : `corrida 2D: ${r1.feitas} pistas montadas (${r1.longas.length} estradas longas de fora), ${n} verificações, tudo certo`);
process.exitCode = falhas ? 1 : 0;
