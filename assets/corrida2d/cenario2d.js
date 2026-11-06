/* Corrida 2D: o cenário em volta da pista.
   Texturas do chão (grama cortada em faixas, asfalto com grão, brita, calçada), a borracha
   na trajetória, o tipo de barreira de cada circuito (pneus nos mistos, concreto com tela
   na rua, muro SAFER nos ovais), árvores, prédios de cidade, arquibancadas com público, o
   prédio dos boxes com as garagens das equipes e o pórtico da largada.
   Tudo é montado uma vez por pista, guardado por pedaço, e desenhado só onde a câmera vê. */
(function(raiz){
  const C2D = raiz.C2D;
  const novoCanvas = (w, h) => typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(w, h) : Object.assign(document.createElement('canvas'), { width: w, height: h });

  /* ── texturas (um canvas pequeno que se repete) ── */
  function ruido(g, w, h, n, cores, tam){
    const r = C2D.rng(n);
    for(let k = 0; k < n; k++){ g.fillStyle = cores[Math.floor(r() * cores.length)]; const s = tam * (.4 + r()); g.fillRect(r() * w, r() * h, s, s); }
  }
  const TEX = {};
  function texturas(){
    if(TEX.ok) return TEX;
    /* grama: duas faixas de corte e manchas */
    let c = novoCanvas(128, 128), g = c.getContext('2d');
    g.fillStyle = '#2f5a2c'; g.fillRect(0, 0, 128, 128); g.fillStyle = '#356533'; g.fillRect(0, 0, 64, 128);
    ruido(g, 128, 128, 900, ['rgba(20,45,20,.35)', 'rgba(70,110,55,.3)', 'rgba(35,70,30,.4)'], 2.2);
    TEX.grama = c;
    /* asfalto: grão fino */
    c = novoCanvas(128, 128); g = c.getContext('2d');
    g.fillStyle = '#383b40'; g.fillRect(0, 0, 128, 128);
    ruido(g, 128, 128, 2600, ['rgba(255,255,255,.05)', 'rgba(0,0,0,.12)', 'rgba(255,255,255,.03)', 'rgba(0,0,0,.07)'], 1.2);
    TEX.asfalto = c;
    /* terra batida (as milhas de terra): barro avermelhado, com sulcos e torrões */
    c = novoCanvas(128, 128); g = c.getContext('2d');
    g.fillStyle = '#7a5136'; g.fillRect(0, 0, 128, 128);
    ruido(g, 128, 128, 1800, ['rgba(60,36,22,.35)', 'rgba(150,110,78,.28)', 'rgba(95,62,40,.4)', 'rgba(170,128,92,.18)'], 1.8);
    g.strokeStyle = 'rgba(55,33,20,.18)'; g.lineWidth = 1;
    for(let k = 0; k < 128; k += 7){ g.beginPath(); g.moveTo(0, k + 2 * Math.sin(k)); g.lineTo(128, k + 2 * Math.cos(k)); g.stroke(); }
    TEX.terra = c;
    /* brita */
    c = novoCanvas(64, 64); g = c.getContext('2d');
    g.fillStyle = '#b7a37c'; g.fillRect(0, 0, 64, 64);
    ruido(g, 64, 64, 700, ['#a08c66', '#cbb894', '#8f7c58', '#d6c6a4'], 1.6);
    TEX.brita = c;
    /* asfalto do escape e da pit lane (mais claro, liso) */
    c = novoCanvas(128, 128); g = c.getContext('2d');
    g.fillStyle = '#4a4e54'; g.fillRect(0, 0, 128, 128);
    ruido(g, 128, 128, 1400, ['rgba(255,255,255,.05)', 'rgba(0,0,0,.08)'], 1.4);
    TEX.escape = c;
    /* calçada e quarteirão (circuito de rua) */
    c = novoCanvas(128, 128); g = c.getContext('2d');
    g.fillStyle = '#5a5d61'; g.fillRect(0, 0, 128, 128);
    g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 1; for(let k = 0; k <= 128; k += 16){ g.beginPath(); g.moveTo(k, 0); g.lineTo(k, 128); g.moveTo(0, k); g.lineTo(128, k); g.stroke(); }
    ruido(g, 128, 128, 900, ['rgba(255,255,255,.05)', 'rgba(0,0,0,.08)'], 1.5);
    TEX.rua = c;
    /* árvores: três copas diferentes */
    TEX.arvores = [0, 1, 2].map(v => {
      const E = 10, R0 = 4.2, cw = Math.ceil(R0 * 2.6 * E), cc = novoCanvas(cw, cw), gg = cc.getContext('2d');
      gg.translate(cw / 2, cw / 2); gg.scale(E, E);
      const r = C2D.rng(17 + v * 31);
      const base = ['#244d22', '#2d5a26', '#1f4521'][v], claro = ['#4f8a3c', '#5e9446', '#3f7a35'][v];
      for(let k = 0; k < 7; k++){
        const a = r() * Math.PI * 2, d = r() * R0 * .45, rr = R0 * (.45 + r() * .35);
        const x = Math.cos(a) * d, y = Math.sin(a) * d;
        const gr = gg.createRadialGradient(x - rr * .3, y - rr * .3, rr * .1, x, y, rr);
        gr.addColorStop(0, claro); gr.addColorStop(.7, base); gr.addColorStop(1, 'rgba(15,35,15,.9)');
        gg.fillStyle = gr; gg.beginPath(); gg.arc(x, y, rr, 0, Math.PI * 2); gg.fill();
      }
      return { cv: cc, m: cw / E };
    });
    TEX.ok = true;
    return TEX;
  }

  /* um padrão em metros: px pixels da textura valem um metro na pista */
  function padrao(ctx, nome, metrosPorPixel){
    ctx.__pad = ctx.__pad || {};
    const k = nome + metrosPorPixel;
    if(ctx.__pad[k]) return ctx.__pad[k];
    const p = ctx.createPattern(texturas()[nome], 'repeat');
    if(p && p.setTransform && typeof DOMMatrix !== 'undefined') p.setTransform(new DOMMatrix([metrosPorPixel, 0, 0, metrosPorPixel, 0, 0]));
    ctx.__pad[k] = p;
    return p;
  }

  C2D.Cenario = {
    texturas, padrao,
    /* monta o cenário de uma pista (uma vez) */
    montar(P){
      const n = P.n, x = P.x, y = P.y, nx = P.nx, ny = P.ny, m = P.meia, rnd = C2D.rng(C2D.semente('cenario:' + P.id));
      const rua = P.tipo === 'street', oval = P.oval, kart = P.kart;
      /* grade de pontos do eixo, para não pôr nada em cima de outro trecho */
      const CEL = 30, grade = new Map(), ch = (a, b) => a * 73856093 ^ b * 19349663;
      for(let i = 0; i < n; i += 2){ const k = ch(Math.floor(x[i] / CEL), Math.floor(y[i] / CEL)); let l = grade.get(k); if(!l) grade.set(k, l = []); l.push(i); }
      const livre = (px, py, folga) => {
        const gx = Math.floor(px / CEL), gy = Math.floor(py / CEL);
        for(let a = -2; a <= 2; a++) for(let b = -2; b <= 2; b++){
          const l = grade.get(ch(gx + a, gy + b)); if(!l) continue;
          for(const i of l){ const dx = x[i] - px, dy = y[i] - py, lim = m + Math.max(P.escE[i], P.escD[i]) + folga; if(dx * dx + dy * dy < lim * lim) return false; }
        }
        return true;
      };
      const pedacoDe = i => Math.min(P.pedacos.length - 1, Math.floor(i / 24));
      const porPedaco = P.pedacos.map(() => ({ arvores: [], predios: [] }));
      const ponto = (i, d) => { i = (i % n + n) % n; return [x[i] + nx[i] * d, y[i] + ny[i] * d]; };
      const B = P.box;
      const naBox = (i, lado) => lado === Math.sign(B.lado) && B.dEm(i * P.ds) != null;
      /* árvores (mistos e ovais) ou prédios (rua) */
      for(let i = 0; i < n; i += kart ? 3 : 4){
        for(const lado of [1, -1]){
          if(naBox(i, lado)) continue;
          const esc = lado > 0 ? P.escE[i] : P.escD[i];
          if(rua){
            if(rnd() < .55){
              const d = lado * (m + esc + 4 + rnd() * 6), [px, py] = ponto(i, d);
              const larg = 10 + rnd() * 22, prof = 10 + rnd() * 18;
              const cx = px + nx[i] * lado * prof / 2, cy = py + ny[i] * lado * prof / 2;
              if(livre(cx, cy, prof / 2 + 2)) porPedaco[pedacoDe(i)].predios.push({ x: cx, y: cy, hd: P.hd[i], larg, prof, cor: ['#6f655c', '#7a6f63', '#5d6670', '#8a8179', '#6b5f58', '#7d8590'][Math.floor(rnd() * 6)], alto: rnd() });
            }
          } else if(rnd() < (oval ? .25 : .7)){
            const qtd = 1 + Math.floor(rnd() * 3);
            for(let q = 0; q < qtd; q++){
              const d = lado * (m + esc + 6 + rnd() * (oval ? 18 : 34)), [px, py] = ponto(i + Math.floor(rnd() * 3), d);
              const tx = px + (rnd() - .5) * 6, ty = py + (rnd() - .5) * 6;
              if(livre(tx, ty, 4.5)) porPedaco[pedacoDe(i)].arvores.push({ x: tx, y: ty, r: 2.6 + rnd() * 2.6, v: Math.floor(rnd() * 3), rot: rnd() * 6.3 });
            }
          }
        }
      }
      /* barreiras por tipo: pneus (mistos), concreto (rua), SAFER (oval, a partir de 2002; antes, e nas
         milhas de terra, o muro de concreto) */
      const barreira = { tipo: rua ? 'concreto' : oval ? (P.terra || (P.ano || 2024) < 2002 ? 'concreto' : 'safer') : 'pneus' };
      /* borracha na trajetória (o asfalto escurece onde todo mundo passa) */
      const borracha = P.pedacos.map(pd => { const p = new Path2D(); for(let i = pd.i0; i <= pd.i1 + 1; i++){ const j = i % n; i === pd.i0 ? p.moveTo(P.linha.x[j], P.linha.y[j]) : p.lineTo(P.linha.x[j], P.linha.y[j]); } return p; });
      /* arquibancadas: a reta da largada (do lado oposto aos boxes) e as freadas fortes */
      const arquib = [];
      const fazArquib = (s0, s1, lado, prof) => {
        const passos = Math.max(2, Math.round((s1 - s0) / 4)), dent = [], fora = [];
        for(let q = 0; q <= passos; q++){
          const s = s0 + (s1 - s0) * q / passos, i = Math.floor(((s % P.L) + P.L) % P.L / P.ds) % n, esc = lado > 0 ? P.escE[i] : P.escD[i];
          const p = C2D.Pista.ponto(P, s, lado * (m + esc + 3)), pf = C2D.Pista.ponto(P, s, lado * (m + esc + 3 + prof));
          if(!livre(p.x * .5 + pf.x * .5, p.y * .5 + pf.y * .5, 1)) return;
          dent.push(p); fora.push(pf);
        }
        const corpo = new Path2D(); dent.forEach((p, k) => k ? corpo.lineTo(p.x, p.y) : corpo.moveTo(p.x, p.y)); for(let k = fora.length - 1; k >= 0; k--) corpo.lineTo(fora[k].x, fora[k].y); corpo.closePath();
        const degraus = new Path2D(), povo = [new Path2D(), new Path2D(), new Path2D(), new Path2D()];
        const filas = Math.max(3, Math.round(prof / 1.6));
        for(let f = 1; f < filas; f++){
          const t = f / filas; dent.forEach((p, k) => { const q = fora[k], px = p.x + (q.x - p.x) * t, py = p.y + (q.y - p.y) * t; k ? degraus.lineTo(px, py) : degraus.moveTo(px, py); });
          for(let k = 0; k < dent.length - 1; k++){
            for(let u = 0; u < 4; u++){
              if(rnd() < .25) continue;
              const tt = (f - .5) / filas, a = dent[k], b = dent[k + 1], c = fora[k], d = fora[k + 1], w = (u + rnd() * .6) / 4;
              const pxA = a.x + (c.x - a.x) * tt, pyA = a.y + (c.y - a.y) * tt, pxB = b.x + (d.x - b.x) * tt, pyB = b.y + (d.y - b.y) * tt;
              const px = pxA + (pxB - pxA) * w, py = pyA + (pyB - pyA) * w;
              povo[Math.floor(rnd() * 4)].rect(px - .3, py - .3, .6, .6);
            }
          }
        }
        let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; dent.concat(fora).forEach(p => { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); });
        /* o telhado: dos 45% do fundo para trás, com nervuras e a sombra que joga nos degraus */
        const telhado = new Path2D(), sombraTelhado = new Path2D(), nervuras = new Path2D(), mt = .45;
        const meio = dent.map((p, k) => ({ x: p.x + (fora[k].x - p.x) * mt, y: p.y + (fora[k].y - p.y) * mt }));
        meio.forEach((p, k) => k ? telhado.lineTo(p.x, p.y) : telhado.moveTo(p.x, p.y)); for(let k = fora.length - 1; k >= 0; k--) telhado.lineTo(fora[k].x, fora[k].y); telhado.closePath();
        const meio2 = dent.map((p, k) => ({ x: p.x + (fora[k].x - p.x) * (mt - .12), y: p.y + (fora[k].y - p.y) * (mt - .12) }));
        meio2.forEach((p, k) => k ? sombraTelhado.lineTo(p.x, p.y) : sombraTelhado.moveTo(p.x, p.y)); for(let k = meio.length - 1; k >= 0; k--) sombraTelhado.lineTo(meio[k].x, meio[k].y); sombraTelhado.closePath();
        for(let k = 0; k < dent.length; k += 3){ nervuras.moveTo(meio[k].x, meio[k].y); nervuras.lineTo(fora[k].x, fora[k].y); }
        arquib.push({ corpo, degraus, povo, x0, y0, x1, y1, cobertura: rnd() < .6, telhado, sombraTelhado, nervuras });
      };
      if(!kart){
        fazArquib(-220, 120, -Math.sign(B.lado) || -1, oval ? 26 : 16);
        (P.zonas || []).filter(z => z.q > .45).slice(0, 4).forEach(z => { const s0 = z.i * P.ds, fora = (P.k[z.fim % n] || 0) > 0 ? -1 : 1; fazArquib(s0 + 20, s0 + 120, fora, 12); });
      }
      /* o prédio dos boxes, com uma garagem por equipe */
      let boxes = null;
      if(!kart && B.comp > 260){
        const ini = B.ini + 120, fim = B.ini + B.comp - 120, lado = Math.sign(B.lado) || 1, d0 = B.d + B.larg / 2 + 1.2, d1 = d0 + 16;
        const pts0 = [], pts1 = [];
        for(let s = ini; s <= fim; s += 6){ pts0.push(C2D.Pista.ponto(P, s, lado * d0)); pts1.push(C2D.Pista.ponto(P, s, lado * d1)); }
        const corpo = new Path2D(); pts0.forEach((p, k) => k ? corpo.lineTo(p.x, p.y) : corpo.moveTo(p.x, p.y)); for(let k = pts1.length - 1; k >= 0; k--) corpo.lineTo(pts1[k].x, pts1[k].y); corpo.closePath();
        const portas = [], cores = ['#e2231a', '#00a19c', '#ff8000', '#1e41ff', '#006f62', '#2b4562', '#900000', '#b6babd', '#64c4ff', '#52e252'];
        let k = 0;
        for(let s = ini + 6; s < fim - 10; s += 14){
          const a = C2D.Pista.ponto(P, s, lado * d0), b = C2D.Pista.ponto(P, s + 10, lado * d0), c = C2D.Pista.ponto(P, s + 10, lado * (d0 + 2.2)), dd = C2D.Pista.ponto(P, s, lado * (d0 + 2.2));
          const p = new Path2D(); p.moveTo(a.x, a.y); p.lineTo(b.x, b.y); p.lineTo(c.x, c.y); p.lineTo(dd.x, dd.y); p.closePath();
          portas.push({ p, cor: cores[k++ % cores.length] });
        }
        const telhado = new Path2D(); for(let s = ini; s <= fim; s += 30){ const a = C2D.Pista.ponto(P, s, lado * (d0 + 3)), b = C2D.Pista.ponto(P, s, lado * (d1 - 1)); telhado.moveTo(a.x, a.y); telhado.lineTo(b.x, b.y); }
        /* a pit lane pintada: as linhas das bordas e a vaga de cada equipe diante da garagem */
        const faixas = new Path2D(), vagas = [];
        for(const dd of [B.d - B.larg / 2 + .15, B.d + B.larg / 2 - .15]){ for(let s = B.ini + 90; s <= B.ini + B.comp - 90; s += 4){ const q = C2D.Pista.ponto(P, s, lado * dd); s === B.ini + 90 ? faixas.moveTo(q.x, q.y) : faixas.lineTo(q.x, q.y); } }
        k = 0;
        for(let s = ini + 6; s < fim - 10; s += 14){
          const a = C2D.Pista.ponto(P, s + 1, lado * (B.d + .2)), b = C2D.Pista.ponto(P, s + 9, lado * (B.d + .2)), c = C2D.Pista.ponto(P, s + 9, lado * (B.d + B.larg / 2 - .3)), dd = C2D.Pista.ponto(P, s + 1, lado * (B.d + B.larg / 2 - .3));
          const pv = new Path2D(); pv.moveTo(a.x, a.y); pv.lineTo(b.x, b.y); pv.lineTo(c.x, c.y); pv.lineTo(dd.x, dd.y); pv.closePath();
          vagas.push({ p: pv, cor: cores[k++ % cores.length] });
        }
        boxes = { corpo, portas, telhado, faixas, vagas };
      }
      /* o pórtico da largada: uma viga sobre a pista com as luzes */
      const g0 = C2D.Pista.ponto(P, 0, -m - 2.5), g1 = C2D.Pista.ponto(P, 0, m + 2.5);
      const portico = { x0: g0.x, y0: g0.y, x1: g1.x, y1: g1.y, luzes: [-.3, -.15, 0, .15, .3].map(f => C2D.Pista.ponto(P, -.6, f * P.w)) };
      return { porPedaco, barreira, borracha, arquib, boxes, portico };
    },

    /* o chão debaixo da pista (o fundo da tela inteira) */
    fundo(ctx, P){
      const nome = P.tipo === 'street' ? 'rua' : 'grama';
      return padrao(ctx, nome, nome === 'grama' ? .25 : .2);
    },

    /* o que fica por cima do chão e por baixo dos carros */
    chao(ctx, R, vis){
      const C = R.cen, P = R.P;
      /* borracha na trajetória (na terra, o sulco mais escuro e úmido por onde todo mundo passa) */
      ctx.strokeStyle = P.terra ? 'rgba(40,22,12,.22)' : 'rgba(12,12,14,.16)'; ctx.lineWidth = P.terra ? 4 : 2.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for(const p of vis) ctx.stroke(C.borracha[p.idx]);
      ctx.strokeStyle = P.terra ? 'rgba(40,22,12,.14)' : 'rgba(12,12,14,.1)'; ctx.lineWidth = 1.2;
      for(const p of vis) ctx.stroke(C.borracha[p.idx]);
      /* arquibancadas e prédio dos boxes (baixos: por baixo das copas) */
      for(const a of C.arquib){
        if(!R.visivel(a.x0, a.y0, a.x1, a.y1)) continue;
        /* os degraus com o público; o telhado (quando há) cobre só o fundo */
        ctx.fillStyle = '#6f757d'; ctx.fill(a.corpo);
        ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = .18; ctx.stroke(a.degraus);
        ['#e2231a', '#f0c12e', '#eef0f2', '#3d8ef7'].forEach((cor, k) => { ctx.fillStyle = cor; ctx.fill(a.povo[k]); });
        if(a.cobertura && a.telhado){ ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fill(a.sombraTelhado); ctx.fillStyle = '#d7dbe0'; ctx.fill(a.telhado); ctx.strokeStyle = 'rgba(0,0,0,.16)'; ctx.lineWidth = .25; ctx.stroke(a.nervuras); }
        ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = .3; ctx.stroke(a.corpo);
      }
      if(C.boxes){
        ctx.fillStyle = '#d4d8de'; ctx.fill(C.boxes.corpo);
        ctx.strokeStyle = 'rgba(0,0,0,.12)'; ctx.lineWidth = .5; ctx.stroke(C.boxes.telhado);
        ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = .3; ctx.stroke(C.boxes.corpo);
        for(const g of C.boxes.portas){ ctx.fillStyle = g.cor; ctx.fill(g.p); }
        ctx.globalAlpha = .35; for(const v of C.boxes.vagas){ ctx.fillStyle = v.cor; ctx.fill(v.p); } ctx.globalAlpha = 1;
        ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = .15; ctx.stroke(C.boxes.faixas);
      }
      /* prédios da rua */
      for(const p of vis){
        for(const b of C.porPedaco[p.idx].predios){
          ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.hd);
          ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(-b.larg / 2 + 1.2, -b.prof / 2 - 1.2, b.larg, b.prof);
          ctx.fillStyle = b.cor; ctx.fillRect(-b.larg / 2, -b.prof / 2, b.larg, b.prof);
          ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(-b.larg / 2, -b.prof / 2, b.larg, b.prof * .35);
          ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = .3; ctx.strokeRect(-b.larg / 2 + 1, -b.prof / 2 + 1, b.larg - 2, b.prof - 2);
          if(b.alto > .6){ ctx.fillStyle = 'rgba(40,44,50,.5)'; ctx.fillRect(-1.5, -1.5, 3, 3); }
          ctx.restore();
        }
      }
    },

    /* as barreiras com o desenho de cada tipo */
    barreiras(ctx, R, vis){
      const tipo = R.cen.barreira.tipo;
      if(tipo === 'pneus'){
        ctx.lineCap = 'round';
        ctx.setLineDash([.01, .7]); ctx.strokeStyle = '#0f1012'; ctx.lineWidth = .66; for(const p of vis) ctx.stroke(p.muros);
        ctx.setLineDash([.01, .7]); ctx.lineDashOffset = .35; ctx.strokeStyle = '#26282c'; ctx.lineWidth = .62; for(const p of vis) ctx.stroke(p.muros);
        ctx.setLineDash([.01, .7]); ctx.lineDashOffset = 0; ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = .25; for(const p of vis) ctx.stroke(p.muros);
        ctx.setLineDash([]);
        /* guard-rail por trás dos pneus */
        ctx.strokeStyle = '#b8bec6'; ctx.lineWidth = .12; for(const p of vis) ctx.stroke(p.murosFora);
      } else if(tipo === 'concreto'){
        ctx.strokeStyle = '#c9cdd3'; ctx.lineWidth = .8; for(const p of vis) ctx.stroke(p.muros);
        ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = .1; for(const p of vis) ctx.stroke(p.murosFora);
        ctx.setLineDash([.12, 2.6]); ctx.strokeStyle = '#3a3e44'; ctx.lineWidth = .35; for(const p of vis) ctx.stroke(p.murosFora); ctx.setLineDash([]);
      } else {
        ctx.strokeStyle = '#eef0f2'; ctx.lineWidth = .9; for(const p of vis) ctx.stroke(p.muros);
        ctx.strokeStyle = '#3d8ef7'; ctx.lineWidth = .22; for(const p of vis) ctx.stroke(p.muros);
        ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = .1; for(const p of vis) ctx.stroke(p.murosFora);
      }
    },

    /* o que fica por cima dos carros: copas das árvores e o pórtico */
    alto(ctx, R, vis){
      const C = R.cen, T = texturas();
      for(const p of vis){
        for(const a of C.porPedaco[p.idx].arvores){
          const s = T.arvores[a.v], k = a.r / 4.2;
          ctx.save(); ctx.translate(a.x + 1.4 * k, a.y - 1.4 * k); ctx.globalAlpha = .35; ctx.fillStyle = '#000';
          ctx.beginPath(); ctx.arc(0, 0, a.r * .9, 0, Math.PI * 2); ctx.fill(); ctx.restore();
          ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(a.rot); ctx.scale(k, k);
          ctx.drawImage(s.cv, -s.m / 2, -s.m / 2, s.m, s.m); ctx.restore();
        }
      }
      const g = C.portico;
      if(R.visivel(Math.min(g.x0, g.x1) - 5, Math.min(g.y0, g.y1) - 5, Math.max(g.x0, g.x1) + 5, Math.max(g.y0, g.y1) + 5)){
        ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(g.x0 + 1, g.y0 - 1); ctx.lineTo(g.x1 + 1, g.y1 - 1); ctx.stroke();
        ctx.strokeStyle = '#2a2d33'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(g.x0, g.y0); ctx.lineTo(g.x1, g.y1); ctx.stroke();
        ctx.strokeStyle = '#4a4e55'; ctx.lineWidth = .25; ctx.beginPath(); ctx.moveTo(g.x0, g.y0); ctx.lineTo(g.x1, g.y1); ctx.stroke();
        for(const l of g.luzes){ ctx.fillStyle = R.luzes > 0 ? '#ff2a2a' : '#111'; ctx.beginPath(); ctx.arc(l.x, l.y, .32, 0, Math.PI * 2); ctx.fill(); }
      }
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
