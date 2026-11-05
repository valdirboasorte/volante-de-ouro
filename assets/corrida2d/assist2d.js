/* Corrida 2D: as ajudas de pilotagem do jogador (todas opcionais, no menu de pausa).
   - freio assistido: quando o carro chega rápido demais na curva, ele freia o que falta,
     com a mesma conta que a IA usa (velocidade possível mais adiante, freio que o carro
     tem) e uma margem de segurança. O jogador continua virando e acelerando; pode frear
     antes, nunca depois do que a ajuda deixa.
   - linha de trajetória: as cores da linha à frente dizem acelerar, aliviar ou frear
     (a render2d desenha; a conta é esta aqui). */
(function(raiz){
  const C2D = raiz.C2D;
  const { lim } = C2D;
  const G = 9.81;

  C2D.Assist = {
    /* a velocidade que a ajuda aceita em cada ponto (com margem, e menos fora da linha ideal) */
    fator(S, c){
      const P = S.P;
      const fora = Math.abs(c.d - P.linha.e[c.i]);
      /* na rua o muro está a dois metros: mais margem */
      const margem = P.tipo === 'street' ? .925 : .955;
      return margem / (c.k || 1) * Math.sqrt(c.aderPneu || 1) * (1 - Math.min(.1, fora * .014));
    },
    capFreio(c, v, w){ const sp = c.sp; return G * (sp.b0 * (1 - .18 * w) + 1.1 * sp.aero * v * v) * .86; },
    /* quanto é preciso frear agora (0 a 1) para chegar a cada ponto à frente na velocidade possível */
    freioNecessario(S, c){
      const P = S.P, n = P.n, v = c.v, w = S.amb.w || 0;
      if(v < 7) return 0;
      const prof = w > .3 ? P.molhado.v : P.seco.v, kk = C2D.Assist.fator(S, c), cap = C2D.Assist.capFreio(c, v, w);
      let pede = 0;
      const alcance = Math.min(n - 1, Math.ceil((v * v / (2 * Math.max(5, cap * .6)) + 12) / P.ds));
      const E = P.linha.e;
      for(let q = 1; q <= alcance; q++){
        const j = (c.i + q) % n;
        /* chicane: a trajetória troca de lado em poucos metros e o carro precisa de calma a mais */
        const troca = Math.abs(E[(j + 6) % n] - E[j]);
        const vp = prof[j] * kk * (troca > 2.5 ? 1 - Math.min(.16, (troca - 2.5) * .035) : 1);
        if(vp >= v) continue;
        const a = (v * v - vp * vp) / (2 * Math.max(.5, q * P.ds - v * .06));
        if(a > pede) pede = a;
      }
      /* o carro logo à frente, na mesma trajetória: não deixa acertar a traseira dele */
      const L = P.L;
      for(const o of (S.carros || [])){
        if(o === c || o.fantasma || o.estado === 'fora') continue;
        const ds = ((o.sTot - c.sTot) % L + L * 1.5) % L - L / 2;
        if(ds <= 0 || ds > 80 || o.v >= v) continue;
        if(Math.abs(o.d - c.d) > (o.sp.larg + c.sp.larg) / 2 + .35) continue;
        const gap = ds - (o.sp.comp + c.sp.comp) / 2 - 2.5;
        const a = (v * v - o.v * o.v) / (2 * Math.max(.5, gap));
        if(a > pede) pede = a;
      }
      const vAqui = prof[(c.i + 1) % n] * kk;
      let f = 0;
      if(pede > cap * .9) f = lim((pede / cap - .9) * 5 + .45, 0, 1);
      else if(v > vAqui * 1.03 + .3) f = lim((v - vAqui * 1.03) * .3, 0, .8);
      if(f > 0){
        /* freada e curva dividem o pneu: virando forte, freia menos para não rodar */
        const sp = c.sp, latCap = G * (sp.mu * (1 - .2 * w) + (sp.banco || 0) + sp.aero * v * v);
        const uso = Math.min(.95, Math.abs(c.ay) / Math.max(1, latCap));
        f = Math.min(f, Math.sqrt(1 - uso * uso) + .1);
      }
      return f;
    },
    /* o comando do jogador com a ajuda */
    freio(S, c, cmd){
      const f = C2D.Assist.freioNecessario(S, c);
      c.assistindo = f > (cmd.freio || 0) + .05;
      if(!c.assistindo) return cmd;
      return Object.assign({}, cmd, { freio: Math.max(cmd.freio || 0, f), acel: f > .15 ? 0 : (cmd.acel || 0) * (1 - f) });
    },

    /* a cor de cada trecho da linha à frente: 0 acelerar, 1 aliviar, 2 frear */
    cores(S, c, pontos){
      const P = S.P, n = P.n, v = Math.max(c.v, 1), w = S.amb.w || 0;
      const prof = w > .3 ? P.molhado.v : P.seco.v, kk = C2D.Assist.fator(S, c), cap = C2D.Assist.capFreio(c, v, w);
      const out = new Uint8Array(pontos);
      let pior = 0;
      for(let q = 1; q <= pontos; q++){
        const vp = prof[(c.i + q) % n] * kk;
        let cor = 0;
        if(vp < v){
          const a = (v * v - vp * vp) / (2 * Math.max(.5, q * P.ds));
          cor = a > cap * .78 ? 2 : a > cap * .38 ? 1 : 0;
        }
        /* depois de um ponto de freada, a linha segue a curva: o que vem logo depois herda a cor */
        pior = Math.max(pior * (q < 6 ? 1 : 0), cor);
        out[q - 1] = cor;
      }
      return out;
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
