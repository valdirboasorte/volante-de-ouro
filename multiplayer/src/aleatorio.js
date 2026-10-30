/* Sorteio determinístico das rodadas: mulberry32 com semente FNV-1a de 32 bits do texto
   "codigo:rodada". A mesma sala e a mesma rodada dão sempre a mesma sequência, então
   reprocessar uma rodada (nova tentativa depois de uma falha) dá o mesmo resultado. */

export function criarRnd(codigo, rodada){
  const txt = codigo + ':' + rodada;
  let h = 0x811c9dc5;
  for(let i = 0; i < txt.length; i++){
    h ^= txt.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  let a = h >>> 0;
  return function rnd(){
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
