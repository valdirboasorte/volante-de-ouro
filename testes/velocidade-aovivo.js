/* A velocidade da transmissão é a que o botão diz: 1× é tempo real, 64× é 64
   vezes mais rápido, em telas de 60 Hz e de 144 Hz. Antes a simulação rodava
   ao menos um passo de 0,25 s por quadro, e de 1× a 16× tudo andava igual.
   Roda o quadro de verdade (AoVivo.quadro) com relógio de tela simulado.
   Uso: node testes/velocidade-aovivo.js   Não modifica arquivos nem saves. */
const H = require('./base');
let falhas = 0, n = 0;
const ok = (c, m) => { n++; if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };

const J = H.carregar({ silencioso:true, seed: 6 });
H.novaCarreira(J, { era: 7, ano: 2024, idade: 24, rapido: true });
J.run(`globalThis.requestAnimationFrame = () => 0;
  (() => { const t = S.ladder.indexOf(Engine.topCat()); S.catIdx = t; Game.startSeason(); UI.limparFila(); UI.close();
  const sea = S.season; const M = Engine.montarCorrida(sea); globalThis._ent = Gp.entrada(sea, M, S.series, sea.year, f => !!f.isMe); })()`);
const medir = (vel, hz) => J.run(`(() => {
  const R = Gp.criar(JSON.parse(JSON.stringify(_ent))); R.equipeDecide = true;
  AoVivo.R = R; AoVivo.carrosEl = []; AoVivo.pausa = false; AoVivo._largada = false; AoVivo.alvo = null; AoVivo.vel = ${vel};
  AoVivo.painel = () => {}; AoVivo.cartoes = () => {}; AoVivo.radio = () => {}; AoVivo.bandeirada = () => {};
  let ts = 1000; AoVivo.ult = ts; const t0 = R.t, quadros = ${hz} * 3;
  for(let k = 0; k < quadros; k++){ ts += 1000 / ${hz}; if(R.pergunta) Gp.responder(R, R.pergunta.padrao); AoVivo.quadro(ts); }
  return (R.t - t0) / 3; })()`);
const res = {};
for(const hz of [60, 144]) for(const v of [1, 4, 8, 16, 32, 64]) res[hz + ':' + v] = medir(v, hz);
for(const hz of [60, 144]){
  const linha = [1, 4, 8, 16, 32, 64].map(v => `${v}× → ${res[hz + ':' + v].toFixed(1)}`).join(' · ');
  ok([1, 4, 8, 16, 32, 64].every(v => Math.abs(res[hz + ':' + v] - v) <= Math.max(.3, v * .04)), `${hz} Hz: segundos de prova por segundo real ${linha}`);
}
console.log(falhas ? falhas + ' falha(s) de ' + n : `velocidade da transmissão: ${n} verificações, tudo certo`);
if(falhas) process.exitCode = 1;
