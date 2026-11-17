/* Corrida 2D: a profundidade.
   A câmera olha a pista de cima, de uma altura finita: o que é alto (copa de árvore, telhado,
   arquibancada, pórtico) aparece deslocado para longe do meio da tela, tanto mais quanto mais
   alto, e desliza sobre o chão quando a câmera anda. É o que dá volume ao cenário e a
   sensação de velocidade. O chão e os carros ficam exatamente onde estavam: a câmera do jogo
   não muda; só o desenho do que tem altura.
   Os andares: cada coisa alta é desenhada no andar da altura dela (ALT), e um andar inteiro é
   o mesmo desenho plano ampliado em volta do ponto de fuga (o chão debaixo do meio da tela).
   A luz: o sol vem do noroeste; a sombra de um metro de altura cai SOL metros no chão. */
(function(raiz){
  const C2D = raiz.C2D;
  /* a altura de cada andar, em metros (0 é o chão) */
  const ALT = [0, 2.6, 6.5, 11, 17];
  C2D.Relevo = {
    ALT,
    /* a sombra, no chão, de um metro de altura (cada pista tem o seu sol: temas2d.js) */
    sol(R){
      const tm = R.cen && R.cen.tema, f = tm && tm.sol ? tm.sol.comp : 1;
      return { x: .8 * f, y: -.62 * f, forca: tm && tm.sol ? tm.sol.forca : .34 };
    },
    /* a cada quadro: o ponto de fuga (o chão debaixo do meio da tela) e a altura da câmera */
    preparar(R){
      const v = R.vista, cam = R.cam, uy = v.H / 2 - v.oy;
      const Hc = Math.max(48, 1.15 * v.W / v.z);
      R.rv = { x: cam.x + uy * v.sn / v.z, y: cam.y - uy * v.cs / v.z, Hc, s: ALT.map(h => Hc / (Hc - h)) };
    },
    /* quanto um ponto a h metros do chão se afasta do ponto de fuga */
    esc(R, h){ const Hc = R.rv.Hc; return Hc / (Hc - Math.min(h, Hc * .55)); },
    /* a sombra de um prisma: a base (pts, em volta) arrastada por (dx, dy). Preenche no contexto g */
    varrido(g, pts, dx, dy){
      const poli = (q, ox, oy) => {
        let A = 0; for(let i = 0; i < q.length; i++){ const a = q[i], b = q[(i + 1) % q.length]; A += a[0] * b[1] - b[0] * a[1]; }
        const o = A < 0 ? q.slice().reverse() : q;
        for(let i = 0; i < o.length; i++){ if(i) g.lineTo(o[i][0] + ox, o[i][1] + oy); else g.moveTo(o[i][0] + ox, o[i][1] + oy); }
        g.closePath();
      };
      g.beginPath();
      poli(pts, 0, 0); poli(pts, dx, dy);
      for(let i = 0; i < pts.length; i++){ const a = pts[i], b = pts[(i + 1) % pts.length]; poli([a, b, [b[0] + dx, b[1] + dy], [a[0] + dx, a[1] + dy]], 0, 0); }
      g.fill();
    },
    /* as paredes de um prisma vistas de cima: só as viradas para o ponto de fuga aparecem.
       pts: a base em volta; s: a escala do topo; pinta(a, b, a2, b2, luz) recebe cada parede
       (a, b no pé; a2, b2 no topo; luz: quanto ela olha para o sol, de -1 a 1). s0: a escala do pé,
       quando o prisma nasce em cima de outro andar */
    paredes(R, pts, s, pinta, s0){
      const C = R.rv, n = pts.length;
      let A = 0; for(let i = 0; i < n; i++){ const a = pts[i], b = pts[(i + 1) % n]; A += a[0] * b[1] - b[0] * a[1]; }
      const sg = A < 0 ? -1 : 1;
      for(let i = 0; i < n; i++){
        const a = pts[i], b = pts[(i + 1) % n], ex = b[0] - a[0], ey = b[1] - a[1], l = Math.hypot(ex, ey) || 1;
        /* a normal para fora da base */
        const nx = sg * ey / l, ny = -sg * ex / l;
        if((C.x - (a[0] + b[0]) / 2) * nx + (C.y - (a[1] + b[1]) / 2) * ny <= 0) continue;
        const sb = (q, f) => [C.x + (q[0] - C.x) * f, C.y + (q[1] - C.y) * f];
        pinta(s0 ? sb(a, s0) : a, s0 ? sb(b, s0) : b, sb(a, s), sb(b, s), -nx * .79 + ny * .61);
      }
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
