/* Corrida 2D: o desenho, em Canvas 2D (sem biblioteca).
   O mundo está em metros com y para cima (como os traçados do jogo); a tela vira o eixo.
   A pista é montada uma vez em pedaços (Path2D) e só os pedaços que aparecem são
   desenhados. Os carros são desenhados uma vez por pintura num canvas fora da tela e
   depois só copiados. O painel (textos) fica no DOM, fora daqui. */
(function(raiz){
  const C2D = raiz.C2D;
  const { lim } = C2D;
  const PISO = C2D.PISO;

  const COR = {
    grama: '#2f5130', grama2: '#335834', brita: '#b9a47a', escape: '#4a4d52', asfalto: '#3a3d42', asfaltoPit: '#45484e',
    linha: '#e8e8e8', zebraV: '#d8261c', zebraB: '#f2f2f2', muro: '#a9adb3', pneus: '#1b1c1f', rua: '#2a2d31', fundoOval: '#2c4a2d',
    marca: 'rgba(18,18,20,.42)'
  };

  /* ── a pista em pedaços ── */
  function montarPista(P){
    const n = P.n, x = P.x, y = P.y, nx = P.nx, ny = P.ny, m = P.meia;
    const pt = (i, d) => { i = (i % n + n) % n; return [x[i] + nx[i] * d, y[i] + ny[i] * d]; };
    const pedacos = P.pedacos.map(pd => {
      const asf = new Path2D(), linhas = new Path2D(), zebV = new Path2D(), zebB = new Path2D();
      const escapes = { 2: new Path2D(), 3: new Path2D(), 4: new Path2D() }, muros = new Path2D();
      /* asfalto: borda esquerda para a frente, borda direita para trás */
      for(let i = pd.i0; i <= pd.i1 + 1; i++){ const p = pt(i, m); i === pd.i0 ? asf.moveTo(p[0], p[1]) : asf.lineTo(p[0], p[1]); }
      for(let i = pd.i1 + 1; i >= pd.i0; i--){ const p = pt(i, -m); asf.lineTo(p[0], p[1]); }
      asf.closePath();
      /* área de escape de cada lado, em faixas do mesmo piso */
      for(const lado of [1, -1]){
        const esc = lado > 0 ? P.escE : P.escD, piso = lado > 0 ? P.pisoE : P.pisoD;
        let i = pd.i0;
        while(i <= pd.i1){
          const pi = piso[i % n]; let j = i;
          while(j < pd.i1 + 1 && piso[(j + 1) % n] === pi) j++;
          const path = escapes[pi] || escapes[2];
          for(let q = i; q <= j + 1; q++){ const p = pt(q, lado * m); q === i ? path.moveTo(p[0], p[1]) : path.lineTo(p[0], p[1]); }
          for(let q = j + 1; q >= i; q--){ const p = pt(q, lado * (m + esc[q % n])); path.lineTo(p[0], p[1]); }
          path.closePath();
          i = j + 1;
        }
        for(let q = pd.i0; q <= pd.i1 + 1; q++){ const p = pt(q, lado * (m + esc[q % n] + .35)); q === pd.i0 ? muros.moveTo(p[0], p[1]) : muros.lineTo(p[0], p[1]); }
      }
      /* linhas brancas das bordas */
      for(const lado of [1, -1]){
        for(let i = pd.i0; i <= pd.i1 + 1; i++){ const p = pt(i, lado * (m - .2)); i === pd.i0 ? linhas.moveTo(p[0], p[1]) : linhas.lineTo(p[0], p[1]); }
      }
      /* zebras: listras de ~1,3 m por fora da linha branca */
      for(let i = pd.i0; i <= pd.i1; i++){
        if(!P.zebra[i % n]) continue;
        for(let t = 0; t < 3; t++){
          const f0 = t / 3, f1 = (t + 1) / 3, cor = ((i * 3 + t) % 2) ? zebV : zebB;
          for(const lado of [1, -1]){
            const a0 = pt(i, lado * m), b0 = pt(i + 1, lado * m), a1 = pt(i, lado * (m + 1.2)), b1 = pt(i + 1, lado * (m + 1.2));
            const L0 = [a0[0] + (b0[0] - a0[0]) * f0, a0[1] + (b0[1] - a0[1]) * f0], L1 = [a0[0] + (b0[0] - a0[0]) * f1, a0[1] + (b0[1] - a0[1]) * f1];
            const E0 = [a1[0] + (b1[0] - a1[0]) * f0, a1[1] + (b1[1] - a1[1]) * f0], E1 = [a1[0] + (b1[0] - a1[0]) * f1, a1[1] + (b1[1] - a1[1]) * f1];
            cor.moveTo(L0[0], L0[1]); cor.lineTo(L1[0], L1[1]); cor.lineTo(E1[0], E1[1]); cor.lineTo(E0[0], E0[1]); cor.closePath();
          }
        }
      }
      return Object.assign({}, pd, { asf, linhas, zebV, zebB, escapes, muros });
    });
    /* pit lane, a faixa de largada e o grid */
    const pit = new Path2D(), muretaPit = new Path2D();
    const B = P.box;
    for(let q = 0; q <= B.comp; q += 2){
      const s = B.ini + q, dd = B.dEm(s); if(dd == null) continue;
      const p = C2D.Pista.ponto(P, s, dd + B.lado * B.larg / 2);
      q === 0 ? pit.moveTo(p.x, p.y) : pit.lineTo(p.x, p.y);
    }
    for(let q = B.comp; q >= 0; q -= 2){
      const s = B.ini + q, dd = B.dEm(s); if(dd == null) continue;
      const p = C2D.Pista.ponto(P, s, dd - B.lado * B.larg / 2);
      pit.lineTo(p.x, p.y);
    }
    pit.closePath();
    for(let q = 140; q <= B.comp - 140; q += 4){ const p = C2D.Pista.ponto(P, B.ini + q, B.lado * (m + 1.4)); q === 140 ? muretaPit.moveTo(p.x, p.y) : muretaPit.lineTo(p.x, p.y); }
    const largada = [];
    for(let a = 0; a < 2; a++) for(let b = 0; b < Math.round(P.w); b++){
      const s0 = a * 1, d0 = -m + b * (P.w / Math.round(P.w));
      const c = [C2D.Pista.ponto(P, s0, d0), C2D.Pista.ponto(P, s0 + 1, d0), C2D.Pista.ponto(P, s0 + 1, d0 + P.w / Math.round(P.w)), C2D.Pista.ponto(P, s0, d0 + P.w / Math.round(P.w))];
      const path = new Path2D(); path.moveTo(c[0].x, c[0].y); c.slice(1).forEach(q => path.lineTo(q.x, q.y)); path.closePath();
      largada.push({ path, branco: (a + b) % 2 === 0 });
    }
    const grid = new Path2D();
    for(let k = 1; k <= 26; k++){
      const vg = C2D.Pista.vaga(P, k), s = vg.s + 2.6, d = vg.d;
      const a = C2D.Pista.ponto(P, s, d - 1.2), b = C2D.Pista.ponto(P, s, d + 1.2), c = C2D.Pista.ponto(P, s - .8, d + 1.2), e = C2D.Pista.ponto(P, s - .8, d - 1.2);
      grid.moveTo(e.x, e.y); grid.lineTo(a.x, a.y); grid.lineTo(b.x, b.y); grid.lineTo(c.x, c.y);
    }
    return { pedacos, pit, muretaPit, largada, grid };
  }

  /* ── os carros: desenhados uma vez por tipo e cor ── */
  const ESC = 14;   /* pixels por metro no desenho guardado */
  function clarear(hex, f){
    const h = String(hex || '#888').replace('#', ''), v = h.length === 3 ? h.split('').map(c => c + c).join('') : h.padEnd(6, '8');
    const n = [0, 2, 4].map(i => parseInt(v.slice(i, i + 2), 16) || 0);
    const r = n.map(c => Math.round(f >= 0 ? c + (255 - c) * f : c * (1 + f)));
    return 'rgb(' + r.join(',') + ')';
  }
  function desenharCarro(sp, cor, eu){
    const L = sp.comp, W = sp.larg, cw = Math.ceil((L + .8) * ESC), ch = Math.ceil((W + .8) * ESC);
    const cv = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(cw, ch) : Object.assign(document.createElement('canvas'), { width: cw, height: ch });
    const g = cv.getContext('2d');
    g.translate(cw / 2, ch / 2); g.scale(ESC, ESC);
    /* x para a frente (direita da imagem), y para o lado */
    const roda = (x, y, l, w) => { g.fillStyle = '#121214'; g.fillRect(x - l / 2, y - w / 2, l, w); g.fillStyle = '#2a2b2f'; g.fillRect(x - l / 2, y - w / 2 + w * .35, l, w * .3); };
    const ret = (x, y, l, w, c) => { g.fillStyle = c; g.fillRect(x - l / 2, y - w / 2, l, w); };
    const escuro = clarear(cor, -.45), claro = clarear(cor, .35);
    const t = sp.tipo;
    if(t === 'kart'){
      roda(L * .36, W * .4, .28, .2); roda(L * .36, -W * .4, .28, .2); roda(-L * .36, W * .42, .32, .26); roda(-L * .36, -W * .42, .32, .26);
      ret(0, 0, L * .86, W * .55, '#2b2d31');
      ret(L * .05, 0, L * .5, W * .45, cor);
      ret(L * .42, 0, .16, W * .7, cor);
      g.fillStyle = eu ? '#f0c12e' : claro; g.beginPath(); g.arc(-L * .08, 0, .17, 0, Math.PI * 2); g.fill();
    } else if(t === 'stock' || t === 'turismo'){
      roda(L * .33, W * .44, .7, .26); roda(L * .33, -W * .44, .7, .26); roda(-L * .31, W * .44, .7, .26); roda(-L * .31, -W * .44, .7, .26);
      g.fillStyle = cor; g.beginPath();
      const r = .35, x0 = -L / 2, y0 = -W * .46, w = L, h = W * .92;
      g.moveTo(x0 + r, y0); g.lineTo(x0 + w - r * 1.6, y0); g.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + r * 1.6); g.lineTo(x0 + w, y0 + h - r * 1.6); g.quadraticCurveTo(x0 + w, y0 + h, x0 + w - r * 1.6, y0 + h);
      g.lineTo(x0 + r, y0 + h); g.quadraticCurveTo(x0, y0 + h, x0, y0 + h - r); g.lineTo(x0, y0 + r); g.quadraticCurveTo(x0, y0, x0 + r, y0); g.fill();
      ret(L * .14, 0, L * .17, W * .74, '#16181c');      /* para-brisa */
      ret(-L * .27, 0, L * .12, W * .7, '#16181c');       /* vidro de trás */
      ret(-L * .06, 0, L * .3, W * .76, claro);           /* teto */
      ret(-L * .06, 0, L * .3, W * .14, eu ? '#f0c12e' : escuro);
      if(t === 'stock') ret(-L * .46, 0, .18, W * .9, escuro);
    } else if(t === 'prototipo'){
      roda(L * .33, W * .42, .72, .3); roda(L * .33, -W * .42, .72, .3); roda(-L * .3, W * .42, .76, .32); roda(-L * .3, -W * .42, .76, .32);
      g.fillStyle = cor; g.beginPath(); g.ellipse(0, 0, L * .5, W * .47, 0, 0, Math.PI * 2); g.fill();
      ret(-L * .46, 0, .35, W * .96, escuro);
      g.fillStyle = '#16181c'; g.beginPath(); g.ellipse(L * .08, 0, L * .16, W * .2, 0, 0, Math.PI * 2); g.fill();
      ret(L * .08, 0, L * .2, W * .06, eu ? '#f0c12e' : claro);
    } else {
      /* fórmula (e o antigo charuto, que não tem asas) */
      const antigo = t === 'antigo';
      const fr = L * .38, tr = -L * .33, lw = antigo ? .5 : .62, ww = antigo ? .22 : .38;
      roda(fr, W / 2 - ww / 2, lw, ww); roda(fr, -W / 2 + ww / 2, lw, ww);
      roda(tr, W / 2 - ww / 2 - .02, lw * 1.15, ww * 1.15); roda(tr, -W / 2 + ww / 2 + .02, lw * 1.15, ww * 1.15);
      if(!antigo){
        ret(L * .47, 0, .3, W * .96, escuro);              /* asa dianteira */
        ret(L * .47, 0, .12, W * .9, cor);
        ret(-L * .47, 0, .36, W * .52, escuro);            /* asa traseira */
        ret(-L * .06, 0, L * .4, W * .62, cor);            /* laterais */
      }
      g.fillStyle = cor; g.beginPath();
      g.moveTo(L * .47, 0); g.lineTo(L * .2, W * .11); g.lineTo(-L * .3, W * .16); g.lineTo(-L * .42, W * .1); g.lineTo(-L * .42, -W * .1); g.lineTo(-L * .3, -W * .16); g.lineTo(L * .2, -W * .11); g.closePath(); g.fill();
      ret(L * .02, 0, L * .13, W * .14, '#121316');        /* cockpit */
      g.fillStyle = eu ? '#f0c12e' : claro; g.beginPath(); g.arc(L * .02, 0, W * .065, 0, Math.PI * 2); g.fill();
      if(!antigo) ret(L * .3, 0, L * .2, W * .05, claro);
    }
    return { cv, w: cw / ESC, h: ch / ESC };
  }

  C2D.Render = {
    COR,
    criar(canvas, P, opc){
      opc = opc || {};
      const R = { cv: canvas, ctx: canvas.getContext('2d'), P, pista: montarPista(P), sprites: new Map(),
                  cam: { x: 0, y: 0, ang: 0, z: 6, ok: false }, modo: opc.camera || 'perseguir', dpr: 1, dprMax: opc.dprMax || 2,
                  marcas: new Float32Array(6 * 1600), nMarcas: 0, iMarca: 0, rodasAnt: new Map(), particulas: [], tempos: [], escala: 1 };
      C2D.Render.redimensionar(R);
      return R;
    },
    redimensionar(R){
      const cv = R.cv, r = cv.getBoundingClientRect ? cv.getBoundingClientRect() : { width: cv.width, height: cv.height };
      R.dpr = Math.min(R.dprMax, (typeof devicePixelRatio !== 'undefined' ? devicePixelRatio : 1)) * R.escala;
      R.W = Math.max(1, r.width); R.H = Math.max(1, r.height);
      cv.width = Math.round(R.W * R.dpr); cv.height = Math.round(R.H * R.dpr);
    },
    sprite(R, c){
      const k = c.sp.tipo + '|' + c.cor + '|' + (c.me ? 1 : 0);
      let s = R.sprites.get(k);
      if(!s){ s = desenharCarro(c.sp, c.cor, c.me); R.sprites.set(k, s); }
      return s;
    },

    /* marcas de pneu: segmentos guardados num anel */
    marcar(R, c, alfa){
      const sp = c.sp, cs = Math.cos(c.psi), sn = Math.sin(c.psi);
      const rodas = [[-sp.b, sp.larg * .4], [-sp.b, -sp.larg * .4], [sp.a, sp.larg * .4], [sp.a, -sp.larg * .4]];
      const ant = R.rodasAnt.get(c) || [];
      const marca = c.deslize > 1.15 && c.v > 3 ? Math.min(1, (c.deslize - 1.1) * 1.2) : 0;
      const novo = [];
      for(let q = 0; q < 4; q++){
        const [lx, ly] = rodas[q];
        const px = c.x + lx * cs - ly * sn, py = c.y + lx * sn + ly * cs;
        novo.push(px, py);
        const frente = q >= 2;
        if(ant.length && (frente ? c.travF : marca > 0)){
          const o = R.iMarca * 6;
          R.marcas[o] = ant[q * 2]; R.marcas[o + 1] = ant[q * 2 + 1]; R.marcas[o + 2] = px; R.marcas[o + 3] = py; R.marcas[o + 4] = frente ? .8 : marca; R.marcas[o + 5] = 0;
          R.iMarca = (R.iMarca + 1) % 1600; R.nMarcas = Math.min(1600, R.nMarcas + 1);
        }
      }
      R.rodasAnt.set(c, novo);
      /* poeira na grama e na brita, faísca no muro */
      if((c.piso === PISO.GRAMA || c.piso === PISO.BRITA) && c.v > 6 && R.particulas.length < 220 && Math.random() < .5)
        R.particulas.push({ x: c.x - cs * sp.b, y: c.y - sn * sp.b, vx: -c.vx * .1 * cs, vy: -c.vx * .1 * sn, t: 0, d: .9, r: 1.2, cor: c.piso === PISO.BRITA ? '200,180,140' : '120,100,70' });
      if(c.batida > 3 && R.particulas.length < 260) for(let k = 0; k < 6; k++)
        R.particulas.push({ x: c.x, y: c.y, vx: (Math.random() - .5) * 14, vy: (Math.random() - .5) * 14, t: 0, d: .35, r: .25, cor: '255,200,90' });
    },

    /* um quadro. carros: lista; foco: o carro da câmera; alfa: fração do passo (interpolação) */
    quadro(R, carros, foco, alfa, dt){
      const ctx = R.ctx, P = R.P, W = R.W, H = R.H;
      const t0 = typeof performance !== 'undefined' ? performance.now() : 0;
      /* posição interpolada do foco */
      const fx = foco.px + (foco.x - foco.px) * alfa, fy = foco.py + (foco.y - foco.py) * alfa;
      const fpsi = foco.ppsi + C2D.ang(foco.psi - foco.ppsi) * alfa;
      const cam = R.cam, v = foco.v || 0;
      const olhar = Math.min(38, v * .32);
      const ax = fx + Math.cos(fpsi) * olhar, ay = fy + Math.sin(fpsi) * olhar;
      /* zoom pela diagonal da tela: no celular em pé o carro não some, no monitor dá para ver longe */
      const zAlvo = Math.sqrt(W * H) / 52 / (1 + v / 80);
      if(!cam.ok){ cam.x = ax; cam.y = ay; cam.ang = fpsi; cam.z = zAlvo; cam.ok = true; }
      const k = Math.min(1, (dt || .016) * 5);
      cam.x += (ax - cam.x) * k; cam.y += (ay - cam.y) * k; cam.z += (zAlvo - cam.z) * Math.min(1, (dt || .016) * 1.5);
      if(R.modo === 'perseguir') cam.ang += C2D.ang(fpsi - cam.ang) * Math.min(1, (dt || .016) * 4);
      const rot = R.modo === 'perseguir' ? cam.ang - Math.PI / 2 : 0;
      const z = cam.z;
      /* o carro fica um pouco abaixo do meio na câmera que persegue */
      const ox = W / 2, oy = R.modo === 'perseguir' ? H * .6 : H / 2;
      ctx.setTransform(R.dpr, 0, 0, R.dpr, 0, 0);
      ctx.fillStyle = P.tipo === 'street' ? COR.rua : P.oval ? COR.fundoOval : COR.grama;
      ctx.fillRect(0, 0, W, H);
      ctx.translate(ox, oy); ctx.rotate(rot); ctx.scale(z, -z); ctx.translate(-cam.x, -cam.y);
      /* o que aparece: um círculo em volta da câmera */
      const raio = Math.hypot(W, H) / z * .62 + 10;
      const vis = R.pista.pedacos.filter(p => p.x1 > cam.x - raio && p.x0 < cam.x + raio && p.y1 > cam.y - raio && p.y0 < cam.y + raio);
      for(const p of vis){ ctx.fillStyle = COR.grama2; ctx.fill(p.escapes[2]); ctx.fillStyle = COR.brita; ctx.fill(p.escapes[3]); ctx.fillStyle = COR.escape; ctx.fill(p.escapes[4]); }
      ctx.lineJoin = 'round';
      ctx.fillStyle = COR.asfaltoPit; ctx.fill(R.pista.pit);
      for(const p of vis){ ctx.fillStyle = COR.asfalto; ctx.fill(p.asf); }
      for(const p of vis){ ctx.fillStyle = COR.zebraV; ctx.fill(p.zebV); ctx.fillStyle = COR.zebraB; ctx.fill(p.zebB); }
      ctx.strokeStyle = COR.linha; ctx.lineWidth = .22;
      for(const p of vis) ctx.stroke(p.linhas);
      ctx.strokeStyle = P.tipo === 'street' || P.oval ? COR.muro : COR.pneus; ctx.lineWidth = .7;
      for(const p of vis) ctx.stroke(p.muros);
      ctx.strokeStyle = COR.muro; ctx.lineWidth = .5; ctx.stroke(R.pista.muretaPit);
      for(const q of R.pista.largada){ ctx.fillStyle = q.branco ? '#f4f4f4' : '#151515'; ctx.fill(q.path); }
      ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = .18; ctx.stroke(R.pista.grid);
      /* marcas de pneu */
      if(R.nMarcas){
        ctx.strokeStyle = COR.marca; ctx.lineWidth = .3; ctx.lineCap = 'round';
        ctx.beginPath();
        for(let q = 0; q < R.nMarcas; q++){ const o = q * 6; const mx = R.marcas[o + 2]; if(Math.abs(mx - cam.x) > raio || Math.abs(R.marcas[o + 3] - cam.y) > raio) continue; ctx.moveTo(R.marcas[o], R.marcas[o + 1]); ctx.lineTo(mx, R.marcas[o + 3]); }
        ctx.stroke();
      }
      /* carros (sombra, depois o desenho) */
      for(const c of carros){
        const cx = c.px + (c.x - c.px) * alfa, cy = c.py + (c.y - c.py) * alfa;
        if(Math.abs(cx - cam.x) > raio || Math.abs(cy - cam.y) > raio) continue;
        const cp = c.ppsi + C2D.ang(c.psi - c.ppsi) * alfa;
        const s = C2D.Render.sprite(R, c);
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(cp);
        if(c.estado === 'fora') ctx.globalAlpha = .45;
        ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(-c.sp.comp / 2 + .25, -c.sp.larg / 2 - .25, c.sp.comp, c.sp.larg);
        ctx.drawImage(s.cv, -s.w / 2, -s.h / 2, s.w, s.h);
        ctx.restore();
      }
      /* poeira e faíscas */
      const dd = dt || .016;
      for(let q = R.particulas.length - 1; q >= 0; q--){
        const p = R.particulas[q]; p.t += dd; if(p.t > p.d){ R.particulas.splice(q, 1); continue; }
        p.x += p.vx * dd; p.y += p.vy * dd;
        const a = 1 - p.t / p.d;
        ctx.fillStyle = 'rgba(' + p.cor + ',' + (a * .5).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1.5 - a * .5), 0, Math.PI * 2); ctx.fill();
      }
      /* tempo de desenho, para baixar a resolução em aparelho fraco */
      if(t0){ R.tempos.push(performance.now() - t0); if(R.tempos.length > 90) R.tempos.shift(); }
    },

    /* o mapa do circuito, desenhado uma vez; os pontos dos carros a cada quadro */
    minimapa(cv, P){
      const dpr = Math.min(2, (typeof devicePixelRatio !== 'undefined' ? devicePixelRatio : 1));
      const r = cv.getBoundingClientRect(), W = Math.max(40, r.width), H = Math.max(40, r.height);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      const cx = (P.caixa.x0 + P.caixa.x1) / 2, cy = (P.caixa.y0 + P.caixa.y1) / 2;
      const esc = Math.min(W / (P.caixa.x1 - P.caixa.x0), H / (P.caixa.y1 - P.caixa.y0)) * .86;
      const M = { cv, ctx: cv.getContext('2d'), P, dpr, W, H, cx, cy, esc, fundo: null };
      const off = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(cv.width, cv.height) : Object.assign(document.createElement('canvas'), { width: cv.width, height: cv.height });
      const g = off.getContext('2d');
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.translate(W / 2, H / 2); g.scale(esc, -esc); g.translate(-cx, -cy);
      g.lineJoin = 'round'; g.lineCap = 'round';
      const trilha = new Path2D(); for(let i = 0; i <= P.n; i++){ const j = i % P.n; i ? trilha.lineTo(P.x[j], P.y[j]) : trilha.moveTo(P.x[j], P.y[j]); }
      g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = 9 / esc; g.stroke(trilha);
      g.strokeStyle = '#c9ccd1'; g.lineWidth = 4 / esc; g.stroke(trilha);
      const l0 = C2D.Pista.ponto(P, 0, P.meia + 8), l1 = C2D.Pista.ponto(P, 0, -P.meia - 8);
      g.strokeStyle = '#f0c12e'; g.lineWidth = 3 / esc; g.beginPath(); g.moveTo(l0.x, l0.y); g.lineTo(l1.x, l1.y); g.stroke();
      M.fundo = off;
      return M;
    },
    pontosMinimapa(M, carros, foco){
      const g = M.ctx;
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, M.cv.width, M.cv.height); g.drawImage(M.fundo, 0, 0);
      g.setTransform(M.dpr, 0, 0, M.dpr, 0, 0);
      const px = x => M.W / 2 + (x - M.cx) * M.esc, py = y => M.H / 2 - (y - M.cy) * M.esc;
      for(const c of carros){
        if(c === foco) continue;
        g.fillStyle = c.cor; g.beginPath(); g.arc(px(c.x), py(c.y), 3, 0, Math.PI * 2); g.fill();
      }
      if(foco){ g.fillStyle = '#f0c12e'; g.strokeStyle = '#0b0c0e'; g.lineWidth = 1.5; g.beginPath(); g.arc(px(foco.x), py(foco.y), 4.5, 0, Math.PI * 2); g.fill(); g.stroke(); }
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
