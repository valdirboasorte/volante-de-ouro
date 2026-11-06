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
  /* desenha repetindo nas bordas, para a textura emendar sem costura */
  function emenda(w, h, x, y, r, fn){
    for(const dx of [-w, 0, w]) for(const dy of [-h, 0, h]){
      const X = x + dx, Y = y + dy;
      if(X + r < 0 || X - r > w || Y + r < 0 || Y - r > h) continue;
      fn(X, Y);
    }
  }
  /* manchas suaves (variação de tom larga) */
  function manchas(g, w, h, n, cores, r0, r1, sem){
    const r = C2D.rng(sem);
    for(let k = 0; k < n; k++){
      const x = r() * w, y = r() * h, rr = r0 + r() * (r1 - r0), cor = cores[Math.floor(r() * cores.length)];
      emenda(w, h, x, y, rr, (X, Y) => { const gr = g.createRadialGradient(X, Y, 0, X, Y, rr); gr.addColorStop(0, cor); gr.addColorStop(1, cor.replace(/[\d.]+\)$/, '0)')); g.fillStyle = gr; g.fillRect(X - rr, Y - rr, rr * 2, rr * 2); });
    }
  }
  const TEX = {};
  function texturas(){
    if(TEX.ok) return TEX;
    /* grama (uma tela de 512 px a 25 cm = 128 m): o verde de base, a variação larga, as listras do
       cortador a 45 graus (o período divide a tela, então emenda) e as lâminas. Tudo numa textura
       só: o chão inteiro sai num preenchimento por quadro */
    let c = novoCanvas(512, 512), g = c.getContext('2d');
    g.fillStyle = '#45843a'; g.fillRect(0, 0, 512, 512);
    manchas(g, 512, 512, 60, ['rgba(255,255,240,.06)', 'rgba(0,10,0,.075)', 'rgba(255,255,240,.035)'], 50, 140, 21);
    manchas(g, 512, 512, 220, ['rgba(98,158,72,.2)', 'rgba(30,86,32,.22)', 'rgba(120,160,70,.11)'], 8, 28, 11);
    { const P = 512 / 12;   /* duas listras (clara e escura) a cada 512/6 px: emenda na largura e na altura */
      for(let k = -12; k < 24; k++){ g.fillStyle = k % 2 ? 'rgba(255,255,230,.06)' : 'rgba(0,20,0,.06)'; g.beginPath(); g.moveTo(k * P, 0); g.lineTo(k * P + P, 0); g.lineTo(k * P + P + 512, 512); g.lineTo(k * P + 512, 512); g.closePath(); g.fill(); } }
    { const r = C2D.rng(12); g.lineCap = 'round'; g.lineWidth = .8;
      for(let k = 0; k < 26000; k++){
        const x = r() * 512, y = r() * 512, a = -.9 + (r() - .5) * 1.1, l = 1.1 + r() * 1.8, v = r();
        g.strokeStyle = v < .45 ? 'rgba(110,172,78,.32)' : v < .9 ? 'rgba(28,78,28,.3)' : 'rgba(170,200,110,.25)';
        emenda(512, 512, x, y, l, (X, Y) => { g.beginPath(); g.moveTo(X, Y); g.lineTo(X + Math.cos(a) * l, Y + Math.sin(a) * l); g.stroke(); });
      } }
    TEX.grama = c;
    /* asfalto (512 px a 6 cm = 32 m): agregado fino, pedrinhas, remendos e o desgaste largos */
    c = novoCanvas(512, 512); g = c.getContext('2d');
    g.fillStyle = '#393c42'; g.fillRect(0, 0, 512, 512);
    manchas(g, 512, 512, 22, ['rgba(255,255,255,.04)', 'rgba(0,0,0,.09)'], 60, 170, 33);
    manchas(g, 512, 512, 90, ['rgba(255,255,255,.035)', 'rgba(0,0,0,.08)'], 16, 50, 31);
    { const r = C2D.rng(32);
      for(let k = 0; k < 56000; k++){ const v = r(); g.fillStyle = v < .5 ? 'rgba(0,0,0,.16)' : v < .92 ? 'rgba(255,255,255,.07)' : 'rgba(205,205,210,.16)'; const s = v < .92 ? 1 : 1.6; g.fillRect(Math.floor(r() * 512), Math.floor(r() * 512), s, s); } }
    TEX.asfalto = c;
    /* a pilha de pneus em padrão (2 × 2 pneus de 66 cm, fileiras desencontradas): a barreira
       sai num traço só, sem desenhar pneu por pneu */
    c = novoCanvas(64, 64); g = c.getContext('2d');
    g.fillStyle = '#0c0d0f'; g.fillRect(0, 0, 64, 64);
    for(const [x, y] of [[16, 16], [48, 16], [0, 48], [32, 48], [64, 48]]){
      g.fillStyle = '#141518'; g.beginPath(); g.arc(x, y, 15.4, 0, 6.3); g.fill();
      g.fillStyle = '#34373d'; g.beginPath(); g.arc(x, y, 10.5, 0, 6.3); g.fill();
      g.fillStyle = '#0b0c0e'; g.beginPath(); g.arc(x, y, 4.6, 0, 6.3); g.fill();
      g.strokeStyle = 'rgba(255,255,255,.16)'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 13, Math.PI * 1.05, Math.PI * 1.55); g.stroke();
    }
    TEX.pneus = c;
    /* o público em padrão (64 px = 2,56 m): cabeças redondas de camisas de várias cores, com o
       brilho do noroeste e alguns assentos vazios */
    c = novoCanvas(64, 64); g = c.getContext('2d');
    { const r = C2D.rng(71), cores = ['#d8473c', '#f0c12e', '#eef0f2', '#3d8ef7', '#2b2f36', '#e88a3a', '#7a4fb8', '#35a36a'];
      for(let a = 0; a < 4; a++) for(let b = 0; b < 4; b++){
        const x = 8 + a * 16 + (r() - .5) * 3, y = 8 + b * 16 + (r() - .5) * 3;
        if(r() < .18){ g.fillStyle = 'rgba(30,60,120,.55)'; g.beginPath(); g.arc(x, y, 4.4, 0, 6.3); g.fill(); continue; }
        g.fillStyle = cores[Math.floor(r() * cores.length)]; g.beginPath(); g.arc(x, y, 6.6, 0, 6.3); g.fill();
        g.fillStyle = 'rgba(255,255,255,.22)'; g.beginPath(); g.arc(x - 1.6, y - 1.6, 4.2, 0, 6.3); g.fill();
        g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.arc(x + 1.8, y + 1.8, 3, 0, 6.3); g.fill();
      } }
    TEX.publico = c;
    /* terra batida (as milhas de terra): barro avermelhado, com sulcos e torrões */
    c = novoCanvas(128, 128); g = c.getContext('2d');
    g.fillStyle = '#7a5136'; g.fillRect(0, 0, 128, 128);
    ruido(g, 128, 128, 1800, ['rgba(60,36,22,.35)', 'rgba(150,110,78,.28)', 'rgba(95,62,40,.4)', 'rgba(170,128,92,.18)'], 1.8);
    g.strokeStyle = 'rgba(55,33,20,.18)'; g.lineWidth = 1;
    for(let k = 0; k < 128; k += 7){ g.beginPath(); g.moveTo(0, k + 2 * Math.sin(k)); g.lineTo(128, k + 2 * Math.cos(k)); g.stroke(); }
    TEX.terra = c;
    /* brita: pedrinhas com luz do noroeste (claro em cima à esquerda, sombra embaixo à direita) */
    c = novoCanvas(128, 128); g = c.getContext('2d');
    g.fillStyle = '#c6ad85'; g.fillRect(0, 0, 128, 128);
    { const r = C2D.rng(41), cores = ['#d8c59f', '#bba077', '#e6d7b6', '#a98f68', '#cbb48c'];
      for(let k = 0; k < 2600; k++){
        const x = r() * 128, y = r() * 128, rx = .7 + r() * 1.3, ry = rx * (.6 + r() * .4), a = r() * 3.14, cor = cores[Math.floor(r() * cores.length)];
        emenda(128, 128, x, y, 3, (X, Y) => {
          g.fillStyle = 'rgba(90,70,45,.35)'; g.beginPath(); g.ellipse(X + .5, Y + .5, rx, ry, a, 0, 6.3); g.fill();
          g.fillStyle = cor; g.beginPath(); g.ellipse(X, Y, rx, ry, a, 0, 6.3); g.fill();
          g.fillStyle = 'rgba(255,250,235,.35)'; g.beginPath(); g.ellipse(X - rx * .3, Y - ry * .3, rx * .4, ry * .35, a, 0, 6.3); g.fill();
        });
      } }
    TEX.brita = c;
    /* asfalto do escape e da pit lane (mais claro e liso) */
    c = novoCanvas(256, 256); g = c.getContext('2d');
    g.fillStyle = '#4f535a'; g.fillRect(0, 0, 256, 256);
    manchas(g, 256, 256, 20, ['rgba(255,255,255,.04)', 'rgba(0,0,0,.06)'], 20, 60, 51);
    { const r = C2D.rng(52); for(let k = 0; k < 7000; k++){ const v = r(); g.fillStyle = v < .5 ? 'rgba(0,0,0,.1)' : 'rgba(255,255,255,.06)'; g.fillRect(Math.floor(r() * 256), Math.floor(r() * 256), 1, 1); } }
    TEX.escape = c;
    /* calçada e quarteirão (circuito de rua): placas de concreto de tons diferentes, juntas
       discretas e o grão da pedra */
    c = novoCanvas(256, 256); g = c.getContext('2d');
    g.fillStyle = '#7b7c7a'; g.fillRect(0, 0, 256, 256);
    { const r = C2D.rng(61);
      for(let a = 0; a < 256; a += 16) for(let b = 0; b < 256; b += 16){ const v = r(); g.fillStyle = v < .35 ? 'rgba(255,250,240,.06)' : v < .7 ? 'rgba(0,0,0,.05)' : 'rgba(120,110,95,.06)'; g.fillRect(a, b, 16, 16); }
      g.fillStyle = 'rgba(0,0,0,.1)'; for(let k = 0; k < 256; k += 16){ g.fillRect(k, 0, 1, 256); g.fillRect(0, k, 256, 1); }
      g.fillStyle = 'rgba(255,255,255,.06)'; for(let k = 0; k < 256; k += 16){ g.fillRect(k + 1, 0, 1, 256); g.fillRect(0, k + 1, 256, 1); }
      for(let k = 0; k < 6000; k++){ const v = r(); g.fillStyle = v < .5 ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.06)'; g.fillRect(Math.floor(r() * 256), Math.floor(r() * 256), 1, 1); } }
    TEX.rua = c;
    /* árvores: quatro tipos, copa em camadas com a luz do noroeste, contorno escuro e a sombra
       (a silhueta escura e desfocada, que cai para o sudeste) */
    TEX.arvores = [0, 1, 2, 3].map(v => {
      const E = 12, R0 = 4.2, cw = Math.ceil(R0 * 2.7 * E), cc = novoCanvas(cw, cw), gg = cc.getContext('2d');
      const sb = novoCanvas(cw, cw), gs = sb.getContext('2d');
      gg.translate(cw / 2, cw / 2); gg.scale(E, E); gs.translate(cw / 2, cw / 2); gs.scale(E, E);
      const r = C2D.rng(17 + v * 31);
      const pal = [['#24512a', '#357236', '#58993f', '#8cc35c'], ['#2b5a26', '#3f7d33', '#6aa648', '#a6cf6a'], ['#1d4426', '#2b5e34', '#3f7d45', '#6aa260'], ['#2f5a22', '#477a2c', '#6f9f3c', '#a9c96a']][v];
      const silhueta = (g, cor) => {
        g.fillStyle = cor; g.beginPath();
        if(v === 2){ /* pinheiro: estrela de pontas */
          const n = 11; for(let k = 0; k <= n * 2; k++){ const a = k / (n * 2) * Math.PI * 2, rr = (k % 2 ? .62 : 1) * R0 * .9 * (.92 + .08 * Math.sin(k * 7.3)); const x = Math.cos(a) * rr, y = Math.sin(a) * rr; k ? g.lineTo(x, y) : g.moveTo(x, y); }
        } else {
          const nb = v === 3 ? 9 : 8, rb = C2D.rng(91 + v);
          for(let k = 0; k < nb; k++){ const a = k / nb * Math.PI * 2 + rb() * .4, d = R0 * (v === 3 ? .5 : .42), rr = R0 * (v === 3 ? .42 : .5) * (.85 + rb() * .3); g.moveTo(Math.cos(a) * d + rr, Math.sin(a) * d); g.arc(Math.cos(a) * d, Math.sin(a) * d, rr, 0, Math.PI * 2); }
          g.moveTo(R0 * .55, 0); g.arc(0, 0, R0 * .55, 0, Math.PI * 2);
        }
        g.fill();
      };
      /* a sombra: silhueta desfocada */
      gs.filter = 'blur(' + Math.round(E * .35) + 'px)'; silhueta(gs, 'rgba(12,24,12,1)'); gs.filter = 'none';
      /* contorno e base escura, depois os tons subindo para o noroeste */
      gg.save(); gg.scale(1.04, 1.04); silhueta(gg, 'rgba(10,28,12,.75)'); gg.restore();
      silhueta(gg, pal[0]);
      gg.save(); gg.translate(-R0 * .1, -R0 * .1); gg.scale(.86, .86); silhueta(gg, pal[1]); gg.restore();
      /* aglomerados de folhas: claros no noroeste, mais escuros no sudeste */
      for(let k = 0; k < 26; k++){
        const a = r() * Math.PI * 2, d = Math.sqrt(r()) * R0 * .72, x = Math.cos(a) * d, y = Math.sin(a) * d, rr = R0 * (.14 + r() * .16);
        const luz = (-x - y) / (R0 * 1.2);
        gg.fillStyle = luz > .15 ? pal[2] : luz < -.25 ? 'rgba(14,38,16,.35)' : pal[1];
        gg.beginPath(); gg.arc(x, y, rr, 0, Math.PI * 2); gg.fill();
      }
      for(let k = 0; k < 14; k++){
        const a = Math.PI * 1.25 + (r() - .5) * 1.6, d = R0 * (.2 + r() * .45), x = Math.cos(a) * d, y = Math.sin(a) * d;
        gg.fillStyle = pal[3]; gg.globalAlpha = .55 + r() * .35; gg.beginPath(); gg.arc(x, y, R0 * (.06 + r() * .08), 0, Math.PI * 2); gg.fill();
      }
      gg.globalAlpha = 1;
      return { cv: cc, sombra: sb, m: cw / E };
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
      const porPedaco = P.pedacos.map(() => ({ arvores: [], predios: [] })), predios = [];
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
              /* (só desenho) um prédio não cai em cima do outro */
              const raioP = Math.min(larg, prof) * .5, cor = ['#6f655c', '#7a6f63', '#5d6670', '#8a8179', '#6b5f58', '#7d8590'][Math.floor(rnd() * 6)], alto = rnd();
              const junto = predios.some(q => Math.hypot(q.x - cx, q.y - cy) < (q.raio + raioP) * .92);
              if(!junto && livre(cx, cy, prof / 2 + 2)){ const pr = { x: cx, y: cy, hd: P.hd[i], larg, prof, cor, alto, raio: raioP }; predios.push(pr); porPedaco[pedacoDe(i)].predios.push(pr); }
            }
          } else if(rnd() < (oval ? .25 : .7)){
            const qtd = 1 + Math.floor(rnd() * 3);
            for(let q = 0; q < qtd; q++){
              const d = lado * (m + esc + 6 + rnd() * (oval ? 18 : 34)), [px, py] = ponto(i + Math.floor(rnd() * 3), d);
              const tx = px + (rnd() - .5) * 6, ty = py + (rnd() - .5) * 6;
              if(livre(tx, ty, 4.5)){ const arv = { x: tx, y: ty, r: 2.6 + rnd() * 2.6, v: Math.floor(rnd() * 3), rot: rnd() * 6.3 }; arv.v2 = (Math.floor(arv.rot * 97) % 4 + 4) % 4; porPedaco[pedacoDe(i)].arvores.push(arv); }
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
        const degraus = new Path2D(), povo = Array.from({ length: 8 }, () => new Path2D()), assentos = new Path2D();
        const filas = Math.max(3, Math.round(prof / 1.1));
        for(let f = 1; f < filas; f++){
          const t = f / filas; dent.forEach((p, k) => { const q = fora[k], px = p.x + (q.x - p.x) * t, py = p.y + (q.y - p.y) * t; k ? degraus.lineTo(px, py) : degraus.moveTo(px, py); });
          for(let k = 0; k < dent.length - 1; k++){
            for(let u = 0; u < 7; u++){
              const tt = (f - .5) / filas, a = dent[k], b = dent[k + 1], c = fora[k], d = fora[k + 1], w = (u + .5 + (rnd() - .5) * .3) / 7;
              const pxA = a.x + (c.x - a.x) * tt, pyA = a.y + (c.y - a.y) * tt, pxB = b.x + (d.x - b.x) * tt, pyB = b.y + (d.y - b.y) * tt;
              const px = pxA + (pxB - pxA) * w, py = pyA + (pyB - pyA) * w;
              /* (o público agora é um padrão de textura) */
              rnd();
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
        /* a faixa de patrocínio na frente da arquibancada (virada para a pista) */
        const faixa = new Path2D(); dent.forEach((p, k) => { const q = fora[k], px = p.x + (q.x - p.x) * .03, py = p.y + (q.y - p.y) * .03; k ? faixa.lineTo(px, py) : faixa.moveTo(px, py); });
        arquib.push({ corpo, degraus, povo, assentos, faixa, x0, y0, x1, y1, cobertura: rnd() < .6, telhado, sombraTelhado, nervuras, cor: ['#2f6fd1', '#c51f24', '#1d8a4b', '#d08a12'][Math.floor(rnd() * 4)] });
      };
      if(!kart){
        fazArquib(-220, 120, -Math.sign(B.lado) || -1, oval ? 26 : 16);
        (P.zonas || []).filter(z => z.q > .45).slice(0, 4).forEach(z => { const s0 = z.i * P.ds, fora = (P.k[z.fim % n] || 0) > 0 ? -1 : 1; fazArquib(s0 + 20, s0 + 120, fora, 12); });
      }
      /* (só desenho) nenhuma árvore em cima de arquibancada */
      if(arquib.length) for(const pp of porPedaco) pp.arvores = pp.arvores.filter(t => !arquib.some(q => t.x > q.x0 - t.r && t.x < q.x1 + t.r && t.y > q.y0 - t.r && t.y < q.y1 + t.r));
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
        const maquinas = new Path2D();
        for(let s = ini + 10; s < fim - 10; s += 22){ const c0 = C2D.Pista.ponto(P, s, lado * (d0 + 9)), c1 = C2D.Pista.ponto(P, s + 3, lado * (d0 + 9)), c2 = C2D.Pista.ponto(P, s + 3, lado * (d0 + 11)), c3 = C2D.Pista.ponto(P, s, lado * (d0 + 11)); maquinas.moveTo(c0.x, c0.y); maquinas.lineTo(c1.x, c1.y); maquinas.lineTo(c2.x, c2.y); maquinas.lineTo(c3.x, c3.y); maquinas.closePath(); }
        const claras = new Path2D();
        for(let s = ini + 4; s < fim - 6; s += 9){ const c0 = C2D.Pista.ponto(P, s, lado * (d0 + 4.5)), c1 = C2D.Pista.ponto(P, s + 4, lado * (d0 + 4.5)), c2 = C2D.Pista.ponto(P, s + 4, lado * (d0 + 6.2)), c3 = C2D.Pista.ponto(P, s, lado * (d0 + 6.2)); claras.moveTo(c0.x, c0.y); claras.lineTo(c1.x, c1.y); claras.lineTo(c2.x, c2.y); claras.lineTo(c3.x, c3.y); claras.closePath(); }
        boxes = { corpo, portas, telhado, faixas, vagas, maquinas, claras };
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
      const sombra = (path, d, a) => { ctx.save(); ctx.translate(d, -d); ctx.fillStyle = 'rgba(10,16,12,' + a + ')'; ctx.fill(path); ctx.restore(); };
      for(const a of C.arquib){
        if(!R.visivel(a.x0, a.y0, a.x1, a.y1)) continue;
        /* a sombra da arquibancada no chão, a estrutura, os degraus com o público e a cobertura */
        sombra(a.corpo, a.cobertura ? 3.2 : 1.6, .3);
        ctx.fillStyle = '#7d838b'; ctx.fill(a.corpo);
        ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = .5; ctx.stroke(a.degraus);
        ctx.strokeStyle = 'rgba(0,0,0,.32)'; ctx.lineWidth = .16; ctx.stroke(a.degraus);
        ctx.fillStyle = padrao(ctx, 'publico', .04); ctx.fill(a.corpo);
        ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = .16; ctx.stroke(a.degraus);
        ctx.strokeStyle = '#1b1d21'; ctx.lineWidth = .7; ctx.stroke(a.faixa);
        ctx.strokeStyle = a.cor; ctx.lineWidth = .5; ctx.setLineDash([5, 2.5]); ctx.stroke(a.faixa); ctx.setLineDash([]);
        ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = .12; ctx.setLineDash([2.2, 5.3]); ctx.lineDashOffset = -1.2; ctx.stroke(a.faixa); ctx.setLineDash([]); ctx.lineDashOffset = 0;
        if(a.cobertura && a.telhado){
          ctx.fillStyle = 'rgba(0,0,0,.38)'; ctx.fill(a.sombraTelhado);
          ctx.fillStyle = '#e1e4e8'; ctx.fill(a.telhado);
          ctx.strokeStyle = 'rgba(0,0,0,.14)'; ctx.lineWidth = .3; ctx.stroke(a.nervuras);
          ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = .12; ctx.stroke(a.nervuras);
          ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = .22; ctx.stroke(a.telhado);
        }
        ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = .25; ctx.stroke(a.corpo);
      }
      if(C.boxes){
        /* o prédio dos boxes: sombra longa, o telhado com as nervuras e as máquinas, as garagens */
        sombra(C.boxes.corpo, 4, .32);
        ctx.fillStyle = '#cfd3d9'; ctx.fill(C.boxes.corpo);
        ctx.strokeStyle = 'rgba(0,0,0,.08)'; ctx.lineWidth = 1.6; ctx.stroke(C.boxes.telhado);
        ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = .25; ctx.stroke(C.boxes.telhado);
        if(C.boxes.claras){ ctx.fillStyle = '#8fb3cf'; ctx.fill(C.boxes.claras); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.save(); ctx.translate(-.15, .15); ctx.fill(C.boxes.claras); ctx.restore(); ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = .12; ctx.stroke(C.boxes.claras); }
        ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = .5; ctx.stroke(C.boxes.corpo);
        if(C.boxes.maquinas){ ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.save(); ctx.translate(.35, -.35); ctx.fill(C.boxes.maquinas); ctx.restore(); ctx.fillStyle = '#9ba1a9'; ctx.fill(C.boxes.maquinas); }
        ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = .3; ctx.stroke(C.boxes.corpo);
        for(const g of C.boxes.portas){
          ctx.fillStyle = '#1a1c20'; ctx.fill(g.p);
          ctx.strokeStyle = g.cor; ctx.lineWidth = .55; ctx.stroke(g.p);
          ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = .1; ctx.stroke(g.p);
        }
        for(const v of C.boxes.vagas){ ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fill(v.p); ctx.strokeStyle = v.cor; ctx.lineWidth = .22; ctx.stroke(v.p); }
        ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = .15; ctx.stroke(C.boxes.faixas);
      }
      /* prédios da rua */
      for(const p of vis){
        for(const b of C.porPedaco[p.idx].predios){
          /* a sombra cai para o sudeste do mundo, mais longe quanto mais alto o prédio */
          const hS = 2 + b.alto * 6;
          ctx.save(); ctx.translate(b.x + hS * .7, b.y - hS * .7); ctx.rotate(b.hd); ctx.fillStyle = 'rgba(8,12,16,.38)'; ctx.fillRect(-b.larg / 2, -b.prof / 2, b.larg, b.prof); ctx.restore();
          ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.hd);
          const sem = Math.abs(Math.floor(b.x * 13 + b.y * 7)), telha = sem % 5 < 2;
          const W2 = b.larg / 2, H2 = b.prof / 2;
          if(telha){
            /* telhado de quatro águas: a água virada para o noroeste mais clara, as telhas e a cumeeira */
            const base = ['#b8613f', '#a9533a', '#c4744c', '#9c4b33'][sem % 4];
            ctx.fillStyle = base; ctx.fillRect(-W2, -H2, b.larg, b.prof);
            const cx = Math.min(W2, H2) * .9;
            /* (a água clara é a que olha para o noroeste do mundo) */
            const nw = -Math.sin(b.hd) - Math.cos(b.hd) > 0, claro = 'rgba(255,230,200,.16)', escuro = 'rgba(40,10,0,.2)';
            ctx.fillStyle = nw ? claro : escuro; ctx.beginPath(); ctx.moveTo(-W2, -H2); ctx.lineTo(W2, -H2); ctx.lineTo(W2 - cx, 0); ctx.lineTo(-W2 + cx, 0); ctx.closePath(); ctx.fill();
            ctx.fillStyle = nw ? escuro : claro; ctx.beginPath(); ctx.moveTo(-W2, H2); ctx.lineTo(W2, H2); ctx.lineTo(W2 - cx, 0); ctx.lineTo(-W2 + cx, 0); ctx.closePath(); ctx.fill();
            ctx.strokeStyle = 'rgba(60,20,8,.25)'; ctx.lineWidth = .12; ctx.beginPath(); for(let yy = -H2 + .6; yy < H2; yy += .6){ ctx.moveTo(-W2, yy); ctx.lineTo(W2, yy); } ctx.stroke();
            ctx.strokeStyle = 'rgba(255,220,190,.45)'; ctx.lineWidth = .3; ctx.beginPath(); ctx.moveTo(-W2 + cx, 0); ctx.lineTo(W2 - cx, 0); ctx.moveTo(-W2, -H2); ctx.lineTo(-W2 + cx, 0); ctx.lineTo(-W2, H2); ctx.moveTo(W2, -H2); ctx.lineTo(W2 - cx, 0); ctx.lineTo(W2, H2); ctx.stroke();
            ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = .2; ctx.strokeRect(-W2, -H2, b.larg, b.prof);
            ctx.restore(); continue;
          }
          const laje = ['#d6cfc2', '#c9c3b8', '#e1dccf', '#b9b5ae', '#cfc6b2', '#a9aeb3'][sem % 6];
          ctx.fillStyle = laje; ctx.fillRect(-W2, -H2, b.larg, b.prof);
          /* a mureta do telhado (borda clara) e o telhado um pouco mais escuro por dentro */
          ctx.fillStyle = 'rgba(0,0,0,.1)'; ctx.fillRect(-W2 + .6, -H2 + .6, b.larg - 1.2, b.prof - 1.2);
          ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = .4; ctx.strokeRect(-W2 + .25, -H2 + .25, b.larg - .5, b.prof - .5);
          ctx.strokeStyle = 'rgba(0,0,0,.42)'; ctx.lineWidth = .2; ctx.strokeRect(-W2, -H2, b.larg, b.prof);
          /* máquinas no telhado: caixas com sombra (sempre as mesmas para cada prédio) */
          const nM = 1 + sem % 3;
          for(let q = 0; q < nM; q++){
            const mx = ((sem >> (q * 3)) % 7 / 7 - .45) * (b.larg - 4), my = ((sem >> (q * 3 + 2)) % 5 / 5 - .4) * (b.prof - 4), mw = 1.6 + (sem >> q) % 3, mh = 1.2 + (sem >> (q + 1)) % 2;
            ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(mx + .4, my - .4 - mh / 2, mw, mh);
            ctx.fillStyle = '#a3a8ae'; ctx.fillRect(mx, my - mh / 2, mw, mh); ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(mx, my - mh / 2, mw, .25);
          }
          ctx.restore();
        }
      }
    },

    /* as barreiras com o desenho de cada tipo */
    barreiras(ctx, R, vis){
      const tipo = R.cen.barreira.tipo;
      /* toda barreira projeta sombra para o sudeste (a luz vem do noroeste) */
      const sombra = (fn, d) => { ctx.save(); ctx.translate(d, -d); fn(); ctx.restore(); };
      const todos = (path, cor, lw, dash, off) => { ctx.strokeStyle = cor; ctx.lineWidth = lw; ctx.setLineDash(dash || []); ctx.lineDashOffset = off || 0; for(const p of vis) ctx.stroke(p[path]); };
      ctx.lineJoin = 'round';
      if(tipo === 'pneus'){
        /* duas fileiras de pneus (a de trás desencontrada), com aro, furo e brilho; a cinta
           vermelha e branca na frente; o guard-rail de aço com postes atrás */
        ctx.lineCap = 'butt';
        sombra(() => { todos('muros', 'rgba(10,18,10,.35)', 1.6); todos('guard', 'rgba(10,18,10,.25)', .35); }, .45);
        todos('guard', '#9aa1a9', .22); todos('guard', '#d9dde2', .07); todos('guard', '#5d636b', .14, [.14, 2.8]);
        ctx.lineCap = 'butt';
        const pn = padrao(ctx, 'pneus', 1.32 / 64);
        todos('murosFora', pn, .68); todos('muros', pn, .68);
        todos('cinta', '#e7e4dc', .2); todos('cinta', '#c51f24', .2, [1.4, 1.4], 0); todos('cinta', 'rgba(255,255,255,.35)', .05);
      } else if(tipo === 'concreto'){
        /* muro de concreto: sombra, a face, o topo claro e as juntas; o alambrado com postes atrás */
        ctx.lineCap = 'butt';
        sombra(() => todos('muros', 'rgba(10,14,18,.4)', 1.1), .55);
        todos('muros', '#9aa0a8', .85); todos('muros', '#cfd3d8', .55); ctx.save(); ctx.translate(-.08, .08); todos('muros', '#eceef0', .18); ctx.restore();
        todos('muros', 'rgba(0,0,0,.28)', .85, [.05, 3.95]);
        sombra(() => todos('murosFora', 'rgba(0,0,0,.18)', .08), .6);
        todos('murosFora', 'rgba(205,210,216,.55)', .06); todos('murosFora', '#4a4f56', .22, [.12, 2.9]);
      } else {
        /* muro SAFER: sombra, a espuma branca, a faixa azul e as juntas dos módulos */
        ctx.lineCap = 'butt';
        sombra(() => todos('muros', 'rgba(10,14,18,.4)', 1.2), .6);
        todos('muros', '#c9ccd1', .95); todos('muros', '#f2f3f5', .7); todos('muros', '#2f6fd1', .2); ctx.save(); ctx.translate(-.08, .08); todos('muros', 'rgba(255,255,255,.7)', .1); ctx.restore();
        todos('muros', 'rgba(0,0,0,.25)', .95, [.05, 5.95]);
        todos('murosFora', 'rgba(205,210,216,.5)', .06); todos('murosFora', '#4a4f56', .22, [.12, 2.9]);
      }
      ctx.setLineDash([]); ctx.lineDashOffset = 0; ctx.lineCap = 'butt';
    },

    /* o que fica por cima dos carros: copas das árvores e o pórtico */
    alto(ctx, R, vis){
      const C = R.cen, T = texturas();
      for(const p of vis){
        for(const a of C.porPedaco[p.idx].arvores){
          const v = a.v2 != null ? a.v2 : a.v, s = T.arvores[v], k = a.r / 4.2;
          /* a sombra no chão, longe pela altura da árvore; a copa não gira (a luz é do mundo) */
          ctx.save(); ctx.translate(a.x + 2.2 * k, a.y - 2.2 * k); ctx.scale(k * 1.02, k * .96); ctx.globalAlpha = .34;
          ctx.drawImage(s.sombra, -s.m / 2, -s.m / 2, s.m, s.m); ctx.restore();
          ctx.save(); ctx.translate(a.x, a.y); ctx.scale(k, -k);
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
