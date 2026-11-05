/* Corrida 2D: a pista vista de cima, feita do traçado que o jogo já tem.
   Pista.de(trkId, ano) dá o eixo da pista a cada ~4 m (no comprimento oficial), com a
   direção e a curvatura. Daqui sai o resto: bordas, zebras, área de escape e muro, a
   pit lane, os setores, o grid, a trajetória ideal e a velocidade possível em cada ponto.
   A largura não existe nos dados: vem do tipo do circuito (padrão da categoria). */
(function(raiz){
  const C2D = raiz.C2D;
  const { lim } = C2D;
  const G = 9.81;

  /* largura da pista e área de escape padrão (do asfalto até o muro), por tipo */
  const LARG = { street: 11, oval: 16, tech: 12.5, mixed: 13, fast: 14 };
  const ESC = { street: 2.4, oval: 2.5, tech: 16, mixed: 18, fast: 22 };
  /* tipos de piso: 0 asfalto, 1 zebra, 2 grama, 3 brita, 4 asfalto de escape, 5 pit lane, 6 muro */
  const PISO = { ASF: 0, ZEB: 1, GRAMA: 2, BRITA: 3, ESC: 4, PIT: 5, MURO: 6 };
  C2D.PISO = PISO;

  /* a velocidade possível em cada ponto de uma linha (passo variável), como Prova.perfil:
     a curva limita, o motor acelera até lá, o freio chega até lá */
  function perfil(k, ds, fis, f, molhado, oval, Lw){
    const n = k.length, v = new Float32Array(n);
    Lw = Lw || 3;
    /* o carro tem um eixo que satura antes (o acerto sai de frente): a curva é limitada por ele */
    const ef = C2D.AJ ? Math.min(C2D.AJ.muF, C2D.AJ.muR) * .99 : 1;
    const mu = (fis.mu * f * (molhado ? .8 : 1) + (oval ? .35 : 0)) * ef, c = fis.aero * f * (molhado ? .85 : 1) * ef, b0 = fis.b0 * f;
    for(let i = 0; i < n; i++){
      /* nas curvas fechadas a roda virada entrega menos força de lado (cosseno do esterço) */
      const R = 1 / Math.max(1e-5, Math.abs(k[i])), cd = Math.cos(Math.atan(Lw / R)) * .99;
      const den = 1 - G * R * c * cd;
      v[i] = Math.min(fis.vmax, den > .05 ? Math.sqrt(G * R * mu * cd / den) : fis.vmax);
    }
    /* acelerar e frear dividem o pneu com a curva (elipse de atrito), como no carro */
    const lat = (w, i) => Math.min(.999, w * w * Math.abs(k[i]) / (G * (mu + c * w * w)));
    const acc = (w, i) => { const u = lat(w, i); return Math.max(.3, Math.min(G * fis.mu * f * .85, fis.pm / Math.max(w, 4)) * Math.sqrt(1 - u * u) - fis.drag * w * w); };
    const brk = (w, i) => { const u = lat(w, i); return Math.max(1, G * (b0 * (molhado ? .82 : 1) + c * 1.1 * w * w) * Math.sqrt(1 - u * u) * .97); };
    for(let p = 0; p < 2; p++) for(let i = 0; i < n; i++){ const j = (i + 1) % n, l = Math.sqrt(v[i] * v[i] + 2 * acc(v[i], i) * ds[i]); if(v[j] > l) v[j] = l; }
    for(let p = 0; p < 2; p++) for(let i = n - 1; i >= 0; i--){ const j = (i + 1) % n, l = Math.sqrt(v[j] * v[j] + 2 * brk(v[j], j) * ds[i]); if(v[i] > l) v[i] = l; }
    let T = 0; for(let i = 0; i < n; i++) T += ds[i] / Math.max(1, (v[i] + v[(i + 1) % n]) / 2);
    return { v, T };
  }
  C2D.perfil = perfil;

  /* direção, curvatura e passo de uma linha fechada qualquer */
  function geometria(x, y){
    const n = x.length, ds = new Float32Array(n), hd = new Float32Array(n), kb = new Float32Array(n), k = new Float32Array(n);
    for(let i = 0; i < n; i++){ const j = (i + 1) % n; ds[i] = Math.max(.05, Math.hypot(x[j] - x[i], y[j] - y[i])); hd[i] = Math.atan2(y[j] - y[i], x[j] - x[i]); }
    /* curvatura suave, mas não a ponto de apagar uma chicane (a linha já vem alisada) */
    const W = C2D.KW || 2, A = C2D.KA != null ? C2D.KA : 2;
    for(let i = 0; i < n; i++){
      let l = 0; for(let q = -W; q < W; q++) l += ds[(i + q + n) % n];
      kb[i] = C2D.ang(hd[(i + W) % n] - hd[(i - W + n) % n]) / Math.max(.5, l);
    }
    for(let i = 0; i < n; i++){ let s = 0; for(let q = -A; q <= A; q++) s += kb[(i + q + n) % n]; k[i] = s / (2 * A + 1); }
    return { ds, hd, k };
  }

  C2D.Pista = {
    _cache: [],
    /* estradas longas (Mille Miglia, Targa Florio, Carrera) ficam de fora do modo 2D */
    MAX_L: 26000,
    suporta(trkId, ano){
      try { const g = Pista.de(trkId, ano); return !!g && g.L <= C2D.Pista.MAX_L; } catch(e){ return false; }
    },
    larguraDe(tipo, kart){ return kart ? 8 : LARG[tipo] || 13; },

    /* opc: { sk, nivel, ano } para a física de referência (calibração da trajetória) */
    criar(trkId, ano, opc){
      opc = opc || {};
      const chave = [trkId, ano, opc.sk, opc.nivel].join(':');
      const achou = C2D.Pista._cache.find(c => c.k === chave);
      if(achou) return achou.P;
      const g = Pista.de(trkId, ano);
      if(!(g && g.L <= C2D.Pista.MAX_L)) throw new Error('pista longa demais para o modo 2D: ' + trkId);
      const trk = (typeof TRACKS !== 'undefined' && TRACKS[trkId]) || { id: trkId, type: g.tipo || 'mixed' };
      const tipo = trk.type || g.tipo || 'mixed';
      const kart = /^(kt_|kb_|kr_)/.test(trkId) || (opc.nivel || 0) >= 4;
      const oval = tipo === 'oval';
      const n = g.n, ds = g.ds, L = g.L;
      const x = Float32Array.from(g.x), y = Float32Array.from(g.y), hd = Float32Array.from(g.hd), k = Float32Array.from(g.k);
      const nx = new Float32Array(n), ny = new Float32Array(n);
      for(let i = 0; i < n; i++){ nx[i] = -Math.sin(hd[i]); ny[i] = Math.cos(hd[i]); }
      const w = C2D.Pista.larguraDe(tipo, kart), meia = w / 2;
      const P = { id: trkId, ano, nome: g.nome || trk.circ || trkId, tipo, kart, oval, real: !!g.real, aprox: g.aprox || [],
                  g, n, ds, L, x, y, hd, k, nx, ny, w, meia, dentro: g.dentro || 1, ladoBox: g.ladoBox || g.dentro || 1 };

      /* ── área de escape de cada lado (esquerda = lado positivo da normal) ── */
      const escE = new Float32Array(n), escD = new Float32Array(n), pisoE = new Uint8Array(n), pisoD = new Uint8Array(n);
      const base = kart ? 5 : ESC[tipo] || 16;
      for(let i = 0; i < n; i++){
        escE[i] = base; escD[i] = base;
        if(oval){
          /* oval: muro por fora, faixa de asfalto e grama por dentro */
          if(P.dentro > 0){ escE[i] = 14; escD[i] = 1.6; } else { escD[i] = 14; escE[i] = 1.6; }
        }
        const fora = k[i] > 0 ? -1 : 1;                       /* lado de fora da curva */
        const curva = Math.abs(k[i]) > 1 / 420;
        const pisoBase = tipo === 'street' || oval ? PISO.ESC : PISO.GRAMA;
        pisoE[i] = pisoBase; pisoD[i] = pisoBase;
        if(!oval && tipo !== 'street' && curva){ if(fora > 0) pisoE[i] = PISO.BRITA; else pisoD[i] = PISO.BRITA; }
        if(oval){ if(P.dentro > 0) pisoE[i] = PISO.ESC; else pisoD[i] = PISO.ESC; }
        /* por dentro da curva o muro não pode passar do centro dela */
        const R = 1 / Math.max(1e-5, Math.abs(k[i]));
        const lim = Math.max(.8, R * .85 - meia);
        if(k[i] > 0) escE[i] = Math.min(escE[i], lim); else escD[i] = Math.min(escD[i], lim);
      }
      /* dois trechos da pista que passam perto: o muro fica no meio deles */
      const CEL = 25, grade = new Map(), cel = (a, b) => (Math.floor(a / CEL) * 73856093) ^ (Math.floor(b / CEL) * 19349663);
      for(let i = 0; i < n; i++){ const c = cel(x[i], y[i]); let l = grade.get(c); if(!l) grade.set(c, l = []); l.push(i); }
      const vizinhanca = Math.ceil(80 / ds), alcance = meia * 2 + base * 2 + 6;
      for(let i = 0; i < n; i++){
        const gx = Math.floor(x[i] / CEL), gy = Math.floor(y[i] / CEL), R = Math.ceil(alcance / CEL);
        for(let a = -R; a <= R; a++) for(let b = -R; b <= R; b++){
          const l = grade.get(((gx + a) * 73856093) ^ ((gy + b) * 19349663)); if(!l) continue;
          for(const j of l){
            let dij = Math.abs(i - j); dij = Math.min(dij, n - dij);
            if(dij < vizinhanca) continue;
            const vx = x[j] - x[i], vy = y[j] - y[i];
            const lat = vx * nx[i] + vy * ny[i], ao = Math.abs(vx * -ny[i] + vy * nx[i]);
            if(ao > Math.abs(lat) * .8 + 4) continue;
            const folga = Math.max(.8, Math.abs(lat) / 2 - meia);
            if(lat > 0) escE[i] = Math.min(escE[i], folga); else escD[i] = Math.min(escD[i], folga);
          }
        }
      }
      /* suaviza sem deixar passar do limite: mínimo vizinho, depois média */
      const suave = a => {
        const m = new Float32Array(n), s = new Float32Array(n);
        for(let i = 0; i < n; i++){ let v = Infinity; for(let q = -3; q <= 3; q++) v = Math.min(v, a[(i + q + n) % n]); m[i] = v; }
        for(let i = 0; i < n; i++){ let v = 0; for(let q = -3; q <= 3; q++) v += m[(i + q + n) % n]; s[i] = Math.min(a[i], v / 7); }
        return s;
      };
      Object.assign(P, { escE: suave(escE), escD: suave(escD), pisoE, pisoD });

      /* ── zebras: onde a curva aperta ── */
      const zeb = new Uint8Array(n);
      for(let i = 0; i < n; i++) if(Math.abs(k[i]) > 1 / 300) for(let q = -4; q <= 4; q++) zeb[(i + q + n) % n] = 1;
      if(oval) zeb.fill(0);
      P.zebra = zeb;

      /* ── pit lane: do mesmo lugar que o motor da corrida usa (L − 330 até 230) ── */
      const box = { ini: L - 330, fim: 230, lado: P.ladoBox, d: meia + 7, larg: 6 };
      box.comp = (box.fim - box.ini + L) % L;
      box.dEm = s => {
        const q = ((s - box.ini) % L + L) % L; if(q > box.comp) return null;
        const r = Math.min(1, q / 110, (box.comp - q) / 110);
        return box.lado * (meia - 2 + (box.d - meia + 2) * Math.max(0, r));
      };
      P.box = box;
      P.setores = [L / 3, 2 * L / 3];

      /* ── pedaços com caixa, para desenhar só o que aparece e achar o carro depressa ── */
      const TAM = 24, pedacos = [];
      for(let i0 = 0; i0 < n; i0 += TAM){
        const i1 = Math.min(n, i0 + TAM);
        let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
        for(let i = i0; i <= i1; i++){ const j = i % n, m = meia + Math.max(P.escE[j], P.escD[j]) + 3; x0 = Math.min(x0, x[j] - m); x1 = Math.max(x1, x[j] + m); y0 = Math.min(y0, y[j] - m); y1 = Math.max(y1, y[j] + m); }
        pedacos.push({ i0, i1, x0, y0, x1, y1 });
      }
      P.pedacos = pedacos;
      let cx0 = 1e9, cy0 = 1e9, cx1 = -1e9, cy1 = -1e9;
      pedacos.forEach(p => { cx0 = Math.min(cx0, p.x0); cy0 = Math.min(cy0, p.y0); cx1 = Math.max(cx1, p.x1); cy1 = Math.max(cy1, p.y1); });
      P.caixa = { x0: cx0, y0: cy0, x1: cx1, y1: cy1 };

      /* ── a trajetória ideal: menor curvatura dentro da pista (elástico) ── */
      C2D.Pista.linhaIdeal(P, (opc.margem != null ? opc.margem : 1.3));
      /* ── a física de referência e a calibração ── */
      if(opc.sk) C2D.Pista.calibrar(P, opc.sk, ano, opc.nivel || 0);

      C2D.Pista._cache.push({ k: chave, P });
      if(C2D.Pista._cache.length > 3) C2D.Pista._cache.shift();
      return P;
    },

    linhaIdeal(P, margem){
      const n = P.n, e = new Float32Array(n), lo = -(P.meia - margem), hi = P.meia - margem;
      const { x, y, nx, ny } = P;
      const px = new Float32Array(n), py = new Float32Array(n);
      for(let i = 0; i < n; i++){ px[i] = x[i]; py[i] = y[i]; }
      const etapas = [[10, 160], [5, 160], [2, 160], [1, 80]];
      for(const [st, it] of etapas){
        for(let r = 0; r < it; r++){
          for(let i = 0; i < n; i++){
            const a = (i - st + n) % n, b = (i + st) % n;
            const mx = (px[a] + px[b]) / 2 - px[i], my = (py[a] + py[b]) / 2 - py[i];
            const d = (mx * nx[i] + my * ny[i]) * .6;
            const v = lim(e[i] + d, lo, hi);
            e[i] = v; px[i] = x[i] + nx[i] * v; py[i] = y[i] + ny[i] * v;
          }
        }
      }
      /* encostada na borda, a linha herda o ruído do traçado: uma última passada de alisamento
         que pode sair até 30 cm da margem */
      for(let r = 0; r < 4; r++){
        for(let i = 0; i < n; i++){
          const a = (i - 1 + n) % n, b = (i + 1) % n;
          const mx = (px[a] + px[b]) / 2 - px[i], my = (py[a] + py[b]) / 2 - py[i];
          const d = (mx * nx[i] + my * ny[i]) * .5;
          const v = lim(e[i] + d, lo - .3, hi + .3);
          e[i] = v; px[i] = x[i] + nx[i] * v; py[i] = y[i] + ny[i] * v;
        }
      }
      const geo = geometria(px, py);
      P.linha = { e, x: px, y: py, ds: geo.ds, hd: geo.hd, k: geo.k };
    },

    /* a física da categoria e a calibração: a volta ideal na trajetória ideal leva o
       tempo de referência que o jogo já tem (Prova.perfil, ajustado a voltas reais).
       f multiplica aderência, aerodinâmica e freio. */
    calibrar(P, sk, ano, nivel){
      if(typeof Prova === 'undefined') return;
      Prova._oval = P.oval;
      const fis = Prova.fisica(sk, ano, nivel, P.kart);
      Prova._oval = false;
      const ref = Prova.perfil(P.g, fis, false, P.oval);
      const Lw = C2D.Carro ? C2D.Carro.modelo(sk, ano, nivel, P.kart).L : 3;
      const Tl = f => perfil(P.linha.k, P.linha.ds, fis, f, false, P.oval, Lw).T;
      let a = .3, b = 1.8;
      for(let it = 0; it < 30; it++){ const m = (a + b) / 2; if(Tl(m) > ref.T) a = m; else b = m; }
      const f = (a + b) / 2;
      P.fis = fis; P.Tref = ref.T; P.f = f;
      P.seco = perfil(P.linha.k, P.linha.ds, fis, f, false, P.oval, Lw);
      P.molhado = perfil(P.linha.k, P.linha.ds, fis, f, true, P.oval, Lw);
      P.zonas = ref.zonas;
    },

    /* posição no eixo: s (metros desde a largada), d (lateral, + à esquerda) e o índice.
       Procura descendo a distância a partir do último índice: barato e não pula para
       outro trecho da pista que passe perto. */
    projetar(P, x, y, i0){
      const n = P.n, X = P.x, Y = P.y;
      let i = ((i0 | 0) % n + n) % n;
      const d2 = j => { const a = X[j] - x, b = Y[j] - y; return a * a + b * b; };
      let best = d2(i);
      for(let passo = 0; passo < 400; passo++){
        const f = (i + 1) % n, t = (i - 1 + n) % n, df = d2(f), dt = d2(t);
        if(df < best && df <= dt){ i = f; best = df; }
        else if(dt < best){ i = t; best = dt; }
        else break;
      }
      /* refina no segmento até o vizinho mais perto */
      const j = (i + 1) % n, h = (i - 1 + n) % n;
      let a = i, b = j;
      if(d2(h) < d2(j)){ a = h; b = i; }
      const sx = X[b] - X[a], sy = Y[b] - Y[a], l2 = sx * sx + sy * sy || 1;
      const t = lim(((x - X[a]) * sx + (y - Y[a]) * sy) / l2, 0, 1);
      const qx = X[a] + sx * t, qy = Y[a] + sy * t;
      const nxa = P.nx[a] + (P.nx[b] - P.nx[a]) * t, nya = P.ny[a] + (P.ny[b] - P.ny[a]) * t;
      const d = (x - qx) * nxa + (y - qy) * nya;
      const s = (a + t) * P.ds;
      return { i, s, d };
    },

    /* o piso debaixo de um ponto (s, d) */
    piso(P, i, s, d){
      const m = P.meia;
      const bd = P.box.dEm(s);
      if(bd != null && Math.sign(d) === Math.sign(P.box.lado) && Math.abs(d) > m && Math.abs(d - bd) < P.box.larg / 2 + .5) return PISO.PIT;
      const ad = Math.abs(d);
      if(ad <= m) return PISO.ASF;
      if(ad <= m + 1.2 && P.zebra[i]) return PISO.ZEB;
      const esc = d > 0 ? P.escE[i] : P.escD[i];
      if(ad <= m + esc) return d > 0 ? P.pisoE[i] : P.pisoD[i];
      return PISO.MURO;
    },
    /* até onde vai o lado (o muro), a partir do eixo */
    muroEm(P, i, lado){
      const m = P.meia + (lado > 0 ? P.escE[i] : P.escD[i]);
      /* do lado dos boxes, ao longo da pit lane, o muro fica por fora dela */
      if(lado === Math.sign(P.box.lado) && P.box.dEm(i * P.ds) != null) return Math.max(m, P.box.d + P.box.larg / 2 + .8);
      return m;
    },

    /* um ponto ao longo da pista com deslocamento lateral */
    ponto(P, s, d){
      const L = P.L; s = ((s % L) + L) % L;
      const f = s / P.ds, i = Math.floor(f) % P.n, j = (i + 1) % P.n, t = f - Math.floor(f);
      const hd = P.hd[i] + C2D.ang(P.hd[j] - P.hd[i]) * t;
      const x = P.x[i] + (P.x[j] - P.x[i]) * t - Math.sin(hd) * (d || 0);
      const y = P.y[i] + (P.y[j] - P.y[i]) * t + Math.cos(hd) * (d || 0);
      return { x, y, hd, i };
    },
    /* a vaga no grid: 8 m entre posições, alternando os lados, como o motor da corrida */
    vaga(P, pos){
      const s = -(pos - 1) * 8 - 6, d = (pos % 2 ? 1 : -1) * P.w * .22;
      return Object.assign(C2D.Pista.ponto(P, s, d), { s, d });
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
