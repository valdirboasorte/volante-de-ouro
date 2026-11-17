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
  /* o tema da pista da vez (temas2d.js) e as texturas dele: as de base, com as do tema por cima */
  let TEMA = null, TEXT = null;
  function texturas(){
    base();
    const chave = TEMA ? TEMA.chave : '';
    if(!TEXT || TEXT.chave !== chave){ TEXT = Object.assign({}, TEX, { chave }); if(TEMA && C2D.Ambiente) C2D.Ambiente.texturas(TEXT, TEMA); if(TEMA && C2D.Vida) C2D.Vida.texturas(TEXT, TEMA); }
    return TEXT;
  }
  function base(){
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
    TEX.grama = c; TEX.gramaCorte = c; TEX.gramaFina = novoCanvas(8, 8);
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
    g.fillStyle = '#62656b'; g.fillRect(0, 0, 256, 256);
    manchas(g, 256, 256, 20, ['rgba(255,255,255,.04)', 'rgba(0,0,0,.06)'], 20, 60, 51);
    { const r = C2D.rng(52); for(let k = 0; k < 7000; k++){ const v = r(); g.fillStyle = v < .5 ? 'rgba(0,0,0,.1)' : 'rgba(255,255,255,.06)'; g.fillRect(Math.floor(r() * 256), Math.floor(r() * 256), 1, 1); } }
    TEX.escape = c;
    /* a sujeira das beiradas da pista (transparente: pedrinhas, borracha solta e poeira) */
    c = novoCanvas(128, 128); g = c.getContext('2d');
    { const r = C2D.rng(77); for(let k = 0; k < 760; k++){ const v = r(); g.fillStyle = v < .55 ? 'rgba(18,16,15,.5)' : v < .85 ? 'rgba(176,156,116,.5)' : 'rgba(232,228,214,.4)'; const s = .7 + r() * 1.3; g.fillRect(r() * 128, r() * 128, s, s); } }
    TEX.sujeira = c;
    /* o grão do asfalto de perto: pedrinhas claras e poros escuros (transparente, 256 px a 2 cm = 5,3 m) */
    c = novoCanvas(256, 256); g = c.getContext('2d');
    { const r = C2D.rng(78); for(let k = 0; k < 5200; k++){ const v = r(); g.fillStyle = v < .5 ? 'rgba(0,0,0,.2)' : v < .9 ? 'rgba(226,226,232,.14)' : 'rgba(240,238,230,.3)'; const s = v < .9 ? 1 + r() * .8 : 1.6 + r(); g.fillRect(r() * 256, r() * 256, s, s); } }
    TEX.asfFino = c;
    /* as sombras das nuvens que passam (256 px a 2 m = 512 m) */
    c = novoCanvas(256, 256); g = c.getContext('2d');
    manchas(g, 256, 256, 9, ['rgba(8,14,40,.5)', 'rgba(8,14,40,.36)'], 34, 80, 88);
    TEX.nuvens = c;
    /* calçada e quarteirão (circuito de rua): placas de concreto de tons diferentes, juntas
       discretas e o grão da pedra */
    c = novoCanvas(256, 256); g = c.getContext('2d');
    g.fillStyle = '#7b7c7a'; g.fillRect(0, 0, 256, 256);
    { const r = C2D.rng(61);
      for(let a = 0; a < 256; a += 16) for(let b = 0; b < 256; b += 16){ const v = r(); g.fillStyle = v < .35 ? 'rgba(255,250,240,.03)' : v < .7 ? 'rgba(0,0,0,.028)' : 'rgba(120,110,95,.035)'; g.fillRect(a, b, 16, 16); }
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
      return { cv: cc, sombra: sb, m: cw / E, tipo: v === 2 ? 'pinheiro' : 'folha' };
    });
    TEX.ok = true;
    return TEX;
  }

  /* um padrão em metros: px pixels da textura valem um metro na pista */
  function padrao(ctx, nome, metrosPorPixel){
    ctx.__pad = ctx.__pad || {};
    const T = texturas(), k = nome + metrosPorPixel + T.chave;
    if(ctx.__pad[k]) return ctx.__pad[k];
    const p = ctx.createPattern(T[nome], 'repeat');
    if(p && p.setTransform && typeof DOMMatrix !== 'undefined') p.setTransform(new DOMMatrix([metrosPorPixel, 0, 0, metrosPorPixel, 0, 0]));
    ctx.__pad[k] = p;
    return p;
  }

  /* ── (só desenho) o que tem altura ── */
  const tomCor = (hex, f) => 'rgb(' + [1, 3, 5].map(i => { const c = parseInt(hex.slice(i, i + 2), 16); return Math.round(f >= 0 ? c + (255 - c) * f : c * (1 + f)); }).join(',') + ')';
  const FACHADA = ['#d9cfc0', '#cfc4b0', '#e3d8c6', '#c9b9a3', '#d6c7b2', '#bfc4c9'];
  /* um prédio da rua: os cantos da base, o andar do telhado (pela altura) e as cores das paredes na luz e na sombra */
  function predio(pr){
    const c = Math.cos(pr.hd), sn = Math.sin(pr.hd), a = pr.larg / 2, b = pr.prof / 2;
    pr.pts = [[-a, -b], [a, -b], [a, b], [-a, b]].map(([u, w]) => [pr.x + u * c - w * sn, pr.y + u * sn + w * c]);
    pr.raioG = Math.hypot(a, b);
    pr.andar = pr.alto < .45 ? 2 : pr.alto < .85 ? 3 : 4;
    const pal = (TEMA && TEMA.lajes) || FACHADA;
    pr.parede = pal[Math.abs(Math.floor(pr.x * 7 + pr.y * 3)) % pal.length];
    pr.corL = tomCor(pr.parede, .22); pr.corS = tomCor(pr.parede, -.34); pr.parede = tomCor(pr.parede, -.1);
    return pr;
  }
  /* a altura de uma árvore (para o comprimento da sombra) */
  function alturaArv(a, s){
    const t = s.tipo || 'folha';
    return t === 'arbusto' ? 1.1 : t === 'rocha' ? .7 : t === 'palmeira' ? 10 : t === 'pinheiro' || t === 'cipreste' ? Math.min(15, 4 + a.r * 2.4) : 6.5 + a.r * .7;
  }
  /* em que andares cada tipo de árvore aparece: a imagem, o tamanho e o deslocamento para o lado da luz */
  function andaresDe(s){
    if(s.andares) return s.andares;
    const claro = () => {
      if(s.claro) return s.claro;
      const c = novoCanvas(s.cv.width, s.cv.height), g = c.getContext('2d');
      g.drawImage(s.cv, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(255,255,190,.17)'; g.fillRect(0, 0, c.width, c.height);
      return s.claro = c;
    };
    const t = s.tipo || 'folha';
    s.tronco = t === 'arbusto' || t === 'rocha' ? 0 : t === 'palmeira' ? 3 : 2;
    return s.andares = t === 'arbusto' || t === 'rocha' ? {}
      : t === 'palmeira' ? { 3: { img: s.cv, f: 1 } }
      : t === 'pinheiro' ? { 2: { img: s.cv, f: 1 }, 3: { img: claro(), f: .66 }, 4: { img: claro(), f: .36 } }
      : t === 'cipreste' ? { 2: { img: s.cv, f: 1 }, 3: { img: s.cv, f: .85 }, 4: { img: claro(), f: .6 } }
      : t === 'eucalipto' ? { 2: { img: s.cv, f: .78 }, 3: { img: claro(), f: 1, d: -.04 } }
      : { 2: { img: s.cv, f: 1 }, 3: { img: claro(), f: .6, d: -.07 } };
  }
  const troncoDe = s => { andaresDe(s); return s.tronco; };
  /* o telhado de um prédio da rua (de telha, de quatro águas; ou a laje com as máquinas) */
  function telhadoPredio(ctx, C, b){
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.hd);
    const sem = Math.abs(Math.floor(b.x * 13 + b.y * 7)), telha = sem % 10 < (C.tema ? C.tema.telha : 4);
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
      ctx.restore(); return;
    }
    const laje = ((C.tema && C.tema.lajes) || ['#d6cfc2', '#c9c3b8', '#e1dccf', '#b9b5ae', '#cfc6b2', '#a9aeb3'])[sem % 6];
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

  C2D.Cenario = {
    texturas, padrao,
    /* monta o cenário de uma pista (uma vez) */
    montar(P){
      TEMA = C2D.Temas ? C2D.Temas.de(P) : null;
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
              if(!junto && livre(cx, cy, prof / 2 + 2)){ const pr = predio({ x: cx, y: cy, hd: P.hd[i], larg, prof, cor, alto, raio: raioP }); predios.push(pr); porPedaco[pedacoDe(i)].predios.push(pr); }
            }
          } else if(rnd() < Math.min(.95, (oval ? .25 : .7) * (TEMA ? TEMA.dens : 1))){
            const qtd = 1 + Math.floor(rnd() * 3 * Math.max(1, TEMA ? TEMA.dens : 1));
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
      /* a barreira da época e do lugar (fardos de feno, guard-rail, cerca), quando o tema pede */
      if(TEMA && TEMA.barreira) barreira.tipo = TEMA.barreira;
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
        /* (só desenho) os lances de degraus (um por andar), a parte debaixo da cobertura e o beiral */
        const faixaDe = (t0, t1) => { const pp = new Path2D(); dent.forEach((a, k) => { const q = fora[k], px = a.x + (q.x - a.x) * t0, py = a.y + (q.y - a.y) * t0; k ? pp.lineTo(px, py) : pp.moveTo(px, py); }); for(let k = dent.length - 1; k >= 0; k--){ const a = dent[k], q = fora[k]; pp.lineTo(a.x + (q.x - a.x) * t1, a.y + (q.y - a.y) * t1); } pp.closePath(); return pp; };
        const linhaDe = t => { const pp = new Path2D(); dent.forEach((a, k) => { const q = fora[k], px = a.x + (q.x - a.x) * t, py = a.y + (q.y - a.y) * t; k ? pp.lineTo(px, py) : pp.moveTo(px, py); }); return pp; };
        const cortes = prof >= 15 ? [0, .3, .62, 1] : [0, .5, 1];
        const terracos = cortes.slice(0, -1).map((t0, q) => ({ k: q + 1, corpo: faixaDe(t0, cortes[q + 1]), frente: linhaDe(t0 + .012), fundo: linhaDe(cortes[q + 1] - .012) }));
        const pts = dent.map(q => [q.x, q.y]).concat(fora.slice().reverse().map(q => [q.x, q.y]));
        arquib.push({ pts, terracos, kTeto: cortes.length, sobTeto: faixaDe(mt - .1, 1), beiral: linhaDe(mt + .012), prof, corpo, degraus, povo, assentos, faixa, x0, y0, x1, y1, cobertura: rnd() < .6, telhado, sombraTelhado, nervuras, cor: ['#2f6fd1', '#c51f24', '#1d8a4b', '#d08a12'][Math.floor(rnd() * 4)] });
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
        /* (só desenho) o contorno, a caixa e a frente de cada garagem (a porta aparece na parede) */
        const ptsB = pts0.map(q => [q.x, q.y]).concat(pts1.slice().reverse().map(q => [q.x, q.y]));
        let bx0 = 1e9, by0 = 1e9, bx1 = -1e9, by1 = -1e9; for(const q of ptsB){ bx0 = Math.min(bx0, q[0]); by0 = Math.min(by0, q[1]); bx1 = Math.max(bx1, q[0]); by1 = Math.max(by1, q[1]); }
        const garagens = [];
        for(let s = ini + 6; s < fim - 10; s += 14){ const a = C2D.Pista.ponto(P, s, lado * d0), b = C2D.Pista.ponto(P, s + 10, lado * d0); garagens.push({ a: [a.x, a.y], b: [b.x, b.y], nx: Math.sin(a.hd) * lado, ny: -Math.cos(a.hd) * lado }); }
        boxes = { corpo, portas, telhado, faixas, vagas, maquinas, claras, pts: ptsB, garagens, x0: bx0, y0: by0, x1: bx1, y1: by1, ini, fim, lado, d0, d1 };
      }
      /* o pórtico da largada: uma viga sobre a pista com as luzes */
      const g0 = C2D.Pista.ponto(P, 0, -m - 2.5), g1 = C2D.Pista.ponto(P, 0, m + 2.5);
      const portico = { x0: g0.x, y0: g0.y, x1: g1.x, y1: g1.y, luzes: [-.3, -.15, 0, .15, .3].map(f => C2D.Pista.ponto(P, -.6, f * P.w)) };
      const cen = { porPedaco, barreira, borracha, arquib, boxes, portico, tema: TEMA };
      /* o ambiente do lugar (água, noite, marcos, estacionamento, placas): ambiente2d.js */
      if(TEMA && C2D.Ambiente) C2D.Ambiente.montar(P, cen, { livre, naBox, fazArquib });
      /* a vida em volta (gente, barracas, carros de apoio): vida2d.js; e o índice dos andares */
      if(C2D.Asfalto) C2D.Asfalto.montar(P, cen);
      if(C2D.Vida) C2D.Vida.montar(P, cen, { livre, naBox });
      C2D.Cenario.indexar(P, cen);
      return cen;
    },

    /* o chão debaixo da pista (o fundo da tela inteira) */
    fundo(ctx, P){
      const nome = P.tipo === 'street' ? 'rua' : 'grama';
      return padrao(ctx, nome, nome === 'grama' ? .25 : .2);
    },

    /* as cores das equipes do grid, na ordem da largada (para as garagens e as vagas dos boxes) */
    equipes(R){
      const C = R.cen; if(C.coresEq) return C.coresEq;
      const padrao2 = ['#e2231a', '#00a19c', '#ff8000', '#1e41ff', '#006f62', '#2b4562', '#900000', '#b6babd', '#64c4ff', '#52e252'];
      if(!R.S || !R.S.carros || !R.S.carros.length) return padrao2;
      const vistos = new Set(), l = [];
      for(const c of R.S.carros.slice().sort((a, b) => (a.grid || 0) - (b.grid || 0))){ const k = c.eq || c.cor; if(vistos.has(k)) continue; vistos.add(k); l.push(c.cor || '#888'); }
      return C.coresEq = l.length ? l : padrao2;
    },

    /* ── o chão em volta da pista, debaixo das zebras e das linhas (pintado uma vez, nos blocos) ── */
    chao(ctx, R, vis){
      const C = R.cen, P = R.P, largo = R.visLargo || vis;
      if(C2D.Ambiente) C2D.Ambiente.chao(ctx, R, vis);
      /* a borracha na trajetória e as marcas do asfalto (asfalto2d.js); sem ele, só a borracha */
      if(C2D.Asfalto) C2D.Asfalto.pintar(ctx, R, vis);
      else {
        ctx.strokeStyle = P.terra ? 'rgba(40,22,12,.22)' : 'rgba(12,12,14,.16)'; ctx.lineWidth = P.terra ? 4 : 2.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        for(const p of vis) ctx.stroke(C.borracha[p.idx]);
        ctx.strokeStyle = P.terra ? 'rgba(40,22,12,.14)' : 'rgba(12,12,14,.1)'; ctx.lineWidth = 1.2;
        for(const p of vis) ctx.stroke(C.borracha[p.idx]);
      }
      ctx.lineCap = 'butt'; ctx.lineJoin = 'round';
      /* o piso debaixo do que é alto: aparece quando a altura afasta o que está em cima */
      for(const a of C.arquib){
        if(!R.visivel(a.x0 - 1, a.y0 - 1, a.x1 + 1, a.y1 + 1)) continue;
        ctx.fillStyle = '#4b4f56'; ctx.fill(a.corpo);
        ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = .7; ctx.setLineDash([.35, 3.65]); ctx.stroke(a.degraus); ctx.setLineDash([]);
        ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = .3; ctx.stroke(a.corpo);
      }
      const B = C.boxes;
      if(B && R.visivel(B.x0 - 12, B.y0 - 12, B.x1 + 12, B.y1 + 12)){
        /* o chão das garagens (escuro lá dentro, mais claro na porta) e a pit lane pintada */
        const cores = C2D.Cenario.equipes(R);
        ctx.fillStyle = '#2b2d32'; ctx.fill(B.corpo);
        B.portas.forEach((g, k) => { ctx.fillStyle = '#50545b'; ctx.fill(g.p); ctx.strokeStyle = cores[k % cores.length]; ctx.lineWidth = .18; ctx.stroke(g.p); });
        ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = .3; ctx.stroke(B.corpo);
        B.vagas.forEach((v, k) => { ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fill(v.p); ctx.strokeStyle = cores[k % cores.length]; ctx.lineWidth = .22; ctx.stroke(v.p); });
        ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = .15; ctx.stroke(B.faixas);
      }
      for(const p of largo) for(const b of C.porPedaco[p.idx].predios){
        if(!R.visivel(b.x - b.raioG, b.y - b.raioG, b.x + b.raioG, b.y + b.raioG)) continue;
        ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.hd);
        ctx.fillStyle = '#383b41'; ctx.fillRect(-b.larg / 2, -b.prof / 2, b.larg, b.prof);
        ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = .3; ctx.strokeRect(-b.larg / 2, -b.prof / 2, b.larg, b.prof);
        ctx.restore();
      }
    },

    /* ── as barreiras com o desenho de cada tipo e o que fica rente ao chão (pintados nos blocos) ── */
    barreiras(ctx, R, vis){
      const C = R.cen, tipo = C.barreira.tipo;
      /* toda barreira projeta sombra para o sudeste (a luz vem do noroeste) */
      const sombra = (fn, d) => { ctx.save(); ctx.translate(d, -d * .78); fn(); ctx.restore(); };
      const todos = (path, cor, lw, dash, off) => { ctx.strokeStyle = cor; ctx.lineWidth = lw; ctx.setLineDash(dash || []); ctx.lineDashOffset = off || 0; for(const p of vis) ctx.stroke(p[path]); };
      ctx.lineJoin = 'round';
      if(tipo === 'pneus'){
        /* duas fileiras de pneus (a de trás desencontrada), com aro, furo e brilho; a cinta
           colorida na frente; o guard-rail de aço com postes atrás */
        ctx.lineCap = 'butt';
        sombra(() => { todos('muros', 'rgba(10,18,10,.35)', 1.6); todos('guard', 'rgba(10,18,10,.25)', .35); }, .45);
        todos('guard', (C.tema && C.tema.guard) || '#9aa1a9', .22); todos('guard', '#d9dde2', .07); todos('guard', '#5d636b', .14, [.14, 2.8]);
        ctx.lineCap = 'butt';
        const pn = padrao(ctx, 'pneus', 1.32 / 64);
        todos('murosFora', pn, .68); todos('muros', pn, .68);
        const cin = (C.tema && C.tema.cinta) || ['#e7e4dc', '#c51f24'];
        todos('cinta', cin[0], .2); todos('cinta', cin[1], .2, [1.4, 1.4], 0); todos('cinta', 'rgba(255,255,255,.35)', .05);
      } else if(tipo === 'concreto'){
        /* muro de concreto: sombra, a face, o topo claro e as juntas; o pé do alambrado atrás (a tela sobe no andar 1) */
        ctx.lineCap = 'butt';
        sombra(() => todos('muros', 'rgba(10,14,18,.4)', 1.1), .55);
        todos('muros', '#9aa0a8', .85); todos('muros', '#cfd3d8', .55); ctx.save(); ctx.translate(-.08, .08); todos('muros', '#eceef0', .18); ctx.restore();
        todos('muros', 'rgba(0,0,0,.28)', .85, [.05, 3.95]);
        todos('murosFora', 'rgba(60,66,74,.5)', .1); todos('murosFora', '#3f444b', .26, [.14, 2.88]);
      } else if(tipo !== 'safer' && C2D.Ambiente){
        C2D.Ambiente.barreira(ctx, R, vis, tipo, sombra, todos);
      } else {
        /* muro SAFER: sombra, a espuma branca, a faixa azul e as juntas dos módulos */
        ctx.lineCap = 'butt';
        sombra(() => todos('muros', 'rgba(10,14,18,.4)', 1.2), .6);
        todos('muros', '#c9ccd1', .95); todos('muros', '#f2f3f5', .7); todos('muros', '#2f6fd1', .2); ctx.save(); ctx.translate(-.08, .08); todos('muros', 'rgba(255,255,255,.7)', .1); ctx.restore();
        todos('muros', 'rgba(0,0,0,.25)', .95, [.05, 5.95]);
        todos('murosFora', 'rgba(60,66,74,.5)', .1); todos('murosFora', '#3f444b', .26, [.14, 2.88]);
      }
      ctx.setLineDash([]); ctx.lineDashOffset = 0; ctx.lineCap = 'butt';
      /* o pé das árvores (o tronco com a terra em volta); os arbustos e as pedras ficam no chão mesmo */
      const T = texturas();
      for(const p of (R.visLargo || vis)) for(const a of C.porPedaco[p.idx].arvores){
        if(!R.visivel(a.x - a.r, a.y - a.r, a.x + a.r, a.y + a.r)) continue;
        const s = T.arvores[(a.v2 != null ? a.v2 : a.v) % T.arvores.length], k = a.r / 4.2;
        if(s.tipo === 'arbusto' || s.tipo === 'rocha'){
          ctx.save(); ctx.translate(a.x, a.y); ctx.scale(k * .8, -k * .8); ctx.drawImage(s.cv, -s.m / 2, -s.m / 2, s.m, s.m); ctx.restore();
        } else {
          ctx.fillStyle = 'rgba(58,42,24,.3)'; ctx.beginPath(); ctx.arc(a.x, a.y, .95 * k + .3, 0, 6.3); ctx.fill();
          ctx.fillStyle = '#3f3122'; ctx.beginPath(); ctx.arc(a.x, a.y, .4 * k + .1, 0, 6.3); ctx.fill();
        }
      }
      if(C2D.Ambiente) C2D.Ambiente.barreiras(ctx, R, vis);
      if(C2D.Vida) C2D.Vida.pintar(ctx, R, vis);
    },

    /* ── as sombras de tudo o que tem altura, como formas cheias: quem chama junta todas,
       desfoca e escurece o chão de uma vez (duas sombras por cima não escurecem em dobro) ── */
    sombras(g, R, vis){
      const C = R.cen, T = texturas(), Rel = C2D.Relevo, sol = Rel.sol(R), ALT = Rel.ALT, largo = R.visLargo || vis;
      const ang = Math.atan2(sol.y, sol.x), cs = Math.hypot(sol.x, sol.y);
      g.fillStyle = '#000'; g.strokeStyle = '#000'; g.lineCap = 'round'; g.lineJoin = 'round'; g.setLineDash([]);
      for(const p of largo){
        for(const a of C.porPedaco[p.idx].arvores){
          const s = T.arvores[(a.v2 != null ? a.v2 : a.v) % T.arvores.length], k = a.r / 4.2, h = alturaArv(a, s), ox = sol.x * h, oy = sol.y * h, al = a.r * 1.8 + 1;
          if(!R.visivel(Math.min(a.x, a.x + ox) - al, Math.min(a.y, a.y + oy) - al, Math.max(a.x, a.x + ox) + al, Math.max(a.y, a.y + oy) + al)) continue;
          const baixo = s.tipo === 'arbusto' || s.tipo === 'rocha', kk = k * (baixo ? .8 : s.tipo === 'palmeira' ? .85 : 1.05);
          if(!baixo){ g.lineWidth = .5 * k + .12; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(a.x + ox * .85, a.y + oy * .85); g.stroke(); }
          /* a copa: a silhueta desfocada, esticada na direção em que a sombra cai */
          g.save(); g.translate(a.x + ox, a.y + oy); g.rotate(ang); g.scale(1 + .22 * cs, 1); g.rotate(-ang); g.scale(kk, -kk);
          g.drawImage(s.sombra, -s.m / 2, -s.m / 2, s.m, s.m); g.restore();
        }
        for(const b of C.porPedaco[p.idx].predios){
          const h = ALT[b.andar], ox = sol.x * h, oy = sol.y * h, rg = b.raioG + Math.hypot(ox, oy);
          if(!R.visivel(b.x - rg, b.y - rg, b.x + rg, b.y + rg)) continue;
          Rel.varrido(g, b.pts, ox, oy);
        }
      }
      for(const a of C.arquib){
        const h = ALT[a.kTeto], ox = sol.x * h, oy = sol.y * h;
        if(!R.visivel(a.x0 + Math.min(0, ox) - 1, a.y0 + Math.min(0, oy) - 1, a.x1 + Math.max(0, ox) + 1, a.y1 + Math.max(0, oy) + 1)) continue;
        const hf = ALT[a.kTeto - 1] * .9;
        Rel.varrido(g, a.pts, sol.x * hf, sol.y * hf);
        if(a.cobertura){ g.save(); g.translate(ox, oy); g.fill(a.telhado); g.restore(); }
      }
      const B = C.boxes;
      if(B){ const h = ALT[2], ox = sol.x * h, oy = sol.y * h; if(R.visivel(B.x0 + Math.min(0, ox) - 1, B.y0 + Math.min(0, oy) - 1, B.x1 + Math.max(0, ox) + 1, B.y1 + Math.max(0, oy) + 1)) Rel.varrido(g, B.pts, ox, oy); }
      /* o pórtico da largada: a viga lá em cima e os dois pilares */
      const pg = C.portico, hp = ALT[2];
      if(pg && R.visivel(Math.min(pg.x0, pg.x1) - 2, Math.min(pg.y0, pg.y1) - 12, Math.max(pg.x0, pg.x1) + 12, Math.max(pg.y0, pg.y1) + 2)){
        const ox = sol.x * hp, oy = sol.y * hp;
        g.lineCap = 'butt'; g.lineWidth = pg.larg || 1.2; g.beginPath(); g.moveTo(pg.x0 + ox, pg.y0 + oy); g.lineTo(pg.x1 + ox, pg.y1 + oy); g.stroke();
        g.lineCap = 'round'; g.lineWidth = .5; g.beginPath(); g.moveTo(pg.x0, pg.y0); g.lineTo(pg.x0 + ox, pg.y0 + oy); g.moveTo(pg.x1, pg.y1); g.lineTo(pg.x1 + ox, pg.y1 + oy); g.stroke();
      }
      if(C2D.Ambiente && C2D.Ambiente.sombras) C2D.Ambiente.sombras(g, R, vis, sol);
      if(C2D.Vida && C2D.Vida.sombras) C2D.Vida.sombras(g, R, vis, sol);
    },

    /* ── os andares: o que tem altura é pintado plano, no andar dele, e copiado com a escala da altura ── */
    /* depois de montar tudo: em que quadrados do mundo cada andar tem alguma coisa (só esses viram bloco) */
    indexar(P, cen){
      const CEL2 = 32, grade = cen.grade = [null, new Set(), new Set(), new Set(), new Set()];
      const marca = (k, x0, y0, x1, y1) => { const g = grade[k]; if(!g) return; for(let a = Math.floor(x0 / CEL2); a <= Math.floor(x1 / CEL2); a++) for(let b = Math.floor(y0 / CEL2); b <= Math.floor(y1 / CEL2); b++) g.add(a * 100003 + b); };
      const T = texturas();
      for(const pp of cen.porPedaco){
        for(const a of pp.arvores){ const s = T.arvores[(a.v2 != null ? a.v2 : a.v) % T.arvores.length], an = andaresDe(s), m = a.r * 1.5; for(const k in an) marca(+k, a.x - m, a.y - m, a.x + m, a.y + m); }
        for(const b of pp.predios) marca(b.andar, b.x - b.raioG, b.y - b.raioG, b.x + b.raioG, b.y + b.raioG);
      }
      for(const a of cen.arquib){ for(const t of a.terracos) marca(t.k, a.x0, a.y0, a.x1, a.y1); if(a.cobertura) marca(a.kTeto, a.x0, a.y0, a.x1, a.y1); }
      if(cen.boxes) marca(2, cen.boxes.x0, cen.boxes.y0, cen.boxes.x1, cen.boxes.y1);
      const pg = cen.portico; if(pg) marca(2, Math.min(pg.x0, pg.x1) - 3, Math.min(pg.y0, pg.y1) - 3, Math.max(pg.x0, pg.x1) + 3, Math.max(pg.y0, pg.y1) + 3);
      /* (o alambrado dos muros sobe ao andar 1 ao longo da pista inteira) */
      if(cen.barreira.tipo === 'concreto' || cen.barreira.tipo === 'safer') for(const pd of P.pedacos) marca(1, pd.x0, pd.y0, pd.x1, pd.y1);
      if(C2D.Ambiente && C2D.Ambiente.indexar) C2D.Ambiente.indexar(P, cen, marca);
      if(C2D.Vida && C2D.Vida.indexar) C2D.Vida.indexar(P, cen, marca);
    },
    temAndar(R, k, x0, y0, x1, y1){
      const g = R.cen && R.cen.grade && R.cen.grade[k]; if(!g) return false;
      for(let a = Math.floor(x0 / 32); a <= Math.floor(x1 / 32); a++) for(let b = Math.floor(y0 / 32); b <= Math.floor(y1 / 32); b++) if(g.has(a * 100003 + b)) return true;
      return false;
    },
    /* pinta o andar k (com o ctx no mundo, plano: a escala da altura é de quem chama) */
    andar(ctx, R, vis, k){
      const C = R.cen, T = texturas(), largo = R.visLargo || vis;
      ctx.lineJoin = 'round'; ctx.lineCap = 'butt'; ctx.setLineDash([]);
      /* o alambrado atrás do muro: a tela e os postes, vistos de cima no topo (andar 1) */
      if(k === 1 && (C.barreira.tipo === 'concreto' || C.barreira.tipo === 'safer')){
        ctx.strokeStyle = 'rgba(214,220,228,.5)'; ctx.lineWidth = .09; for(const p of vis) ctx.stroke(p.murosFora);
        ctx.strokeStyle = '#59606a'; ctx.lineWidth = .24; ctx.setLineDash([.14, 2.88]); for(const p of vis) ctx.stroke(p.murosFora); ctx.setLineDash([]);
      }
      /* as árvores: a copa no andar 2 e o topo, mais claro, no 3 (pinheiros e ciprestes sobem ao 4) */
      for(const p of largo) for(const a of C.porPedaco[p.idx].arvores){
        const s = T.arvores[(a.v2 != null ? a.v2 : a.v) % T.arvores.length], cam = andaresDe(s)[k]; if(!cam) continue;
        const kk = a.r / 4.2 * cam.f, m = s.m * kk / 2;
        if(!R.visivel(a.x - m, a.y - m, a.x + m, a.y + m)) continue;
        ctx.save(); ctx.translate(a.x + (cam.d || 0) * a.r, a.y - (cam.d || 0) * a.r); ctx.scale(kk, -kk);
        ctx.drawImage(cam.img, -s.m / 2, -s.m / 2, s.m, s.m); ctx.restore();
      }
      /* os prédios da rua: o telhado, no andar da altura do prédio */
      for(const p of largo) for(const b of C.porPedaco[p.idx].predios){
        if(b.andar !== k || !R.visivel(b.x - b.raioG, b.y - b.raioG, b.x + b.raioG, b.y + b.raioG)) continue;
        telhadoPredio(ctx, C, b);
      }
      /* as arquibancadas: um lance de degraus por andar, e a cobertura por cima de tudo */
      for(const a of C.arquib){
        if(!R.visivel(a.x0 - 1, a.y0 - 1, a.x1 + 1, a.y1 + 1)) continue;
        for(const t of a.terracos) if(t.k === k){
          ctx.fillStyle = '#7d838b'; ctx.fill(t.corpo);
          ctx.save(); ctx.clip(t.corpo);
          ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = .5; ctx.stroke(a.degraus);
          ctx.fillStyle = padrao(ctx, 'publico', .04); ctx.fill(t.corpo);
          ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = .16; ctx.stroke(a.degraus);
          /* debaixo da cobertura fica na sombra */
          if(a.cobertura){ ctx.fillStyle = 'rgba(6,10,26,.34)'; ctx.fill(a.sobTeto); }
          ctx.restore();
          ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = .5; ctx.stroke(t.fundo);
          ctx.strokeStyle = '#dfe2e6'; ctx.lineWidth = .3; ctx.stroke(t.frente);
          ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = .2; ctx.stroke(t.corpo);
          if(t.k === 1){
            /* a faixa de patrocínio na frente da arquibancada (virada para a pista) */
            ctx.strokeStyle = '#1b1d21'; ctx.lineWidth = .7; ctx.stroke(a.faixa);
            ctx.strokeStyle = a.cor; ctx.lineWidth = .5; ctx.setLineDash([5, 2.5]); ctx.stroke(a.faixa); ctx.setLineDash([]);
            ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = .12; ctx.setLineDash([2.2, 5.3]); ctx.lineDashOffset = -1.2; ctx.stroke(a.faixa); ctx.setLineDash([]); ctx.lineDashOffset = 0;
          }
        }
        if(a.cobertura && a.kTeto === k){
          ctx.fillStyle = '#e1e4e8'; ctx.fill(a.telhado);
          ctx.strokeStyle = 'rgba(0,0,0,.14)'; ctx.lineWidth = .3; ctx.stroke(a.nervuras);
          ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = .12; ctx.stroke(a.nervuras);
          ctx.strokeStyle = a.cor; ctx.lineWidth = .55; ctx.stroke(a.beiral);
          ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = .22; ctx.stroke(a.telhado);
        }
      }
      const B = C.boxes;
      if(k === 2 && B && R.visivel(B.x0 - 1, B.y0 - 1, B.x1 + 1, B.y1 + 1)){
        /* o telhado do prédio dos boxes: as nervuras, as claraboias e as máquinas */
        ctx.fillStyle = '#cfd3d9'; ctx.fill(B.corpo);
        ctx.strokeStyle = 'rgba(0,0,0,.08)'; ctx.lineWidth = 1.6; ctx.stroke(B.telhado);
        ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = .25; ctx.stroke(B.telhado);
        if(B.claras){ ctx.fillStyle = '#8fb3cf'; ctx.fill(B.claras); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.save(); ctx.translate(-.15, .15); ctx.fill(B.claras); ctx.restore(); ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = .12; ctx.stroke(B.claras); }
        ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = .5; ctx.stroke(B.corpo);
        if(B.maquinas){ ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.save(); ctx.translate(.35, -.3); ctx.fill(B.maquinas); ctx.restore(); ctx.fillStyle = '#9ba1a9'; ctx.fill(B.maquinas); }
        ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = .3; ctx.stroke(B.corpo);
      }
      /* o pórtico da largada: a viga com a caixa das luzes (com o nome do circuito, quem pinta é o ambiente) */
      const pg = C.portico;
      if(k === 2 && pg && !(C.amb && C.amb.nomeP) && R.visivel(Math.min(pg.x0, pg.x1) - 3, Math.min(pg.y0, pg.y1) - 3, Math.max(pg.x0, pg.x1) + 3, Math.max(pg.y0, pg.y1) + 3)){
        ctx.strokeStyle = '#2a2d33'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(pg.x0, pg.y0); ctx.lineTo(pg.x1, pg.y1); ctx.stroke();
        ctx.strokeStyle = '#4a4e55'; ctx.lineWidth = .25; ctx.beginPath(); ctx.moveTo(pg.x0, pg.y0); ctx.lineTo(pg.x1, pg.y1); ctx.stroke();
        for(const l of pg.luzes){ ctx.fillStyle = '#101113'; ctx.beginPath(); ctx.arc(l.x, l.y, .34, 0, Math.PI * 2); ctx.fill(); }
      }
      if(C2D.Ambiente && C2D.Ambiente.andar) C2D.Ambiente.andar(ctx, R, vis, k);
      if(C2D.Vida && C2D.Vida.andar) C2D.Vida.andar(ctx, R, vis, k);
    },

    /* ── a cada quadro, por cima dos carros: as paredes e os troncos (que mudam com a câmera) e os andares ── */
    alto(ctx, R, vis){
      const C = R.cen, Rel = C2D.Relevo, rv = R.rv, ALT = Rel.ALT, T = texturas(), v = R.vista, cam = R.cam;
      const naTela = (x, y, m) => { const dx = x - cam.x, dy = y - cam.y, sx = v.ox + v.z * (dx * v.cs + dy * v.sn), sy = v.oy + v.z * (dx * v.sn - dy * v.cs); return sx > -m && sx < v.W + m && sy > -m && sy < v.H + m; };
      const quad = (a, b, b2, a2) => { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(b2[0], b2[1]); ctx.lineTo(a2[0], a2[1]); ctx.closePath(); ctx.fill(); };
      ctx.lineJoin = 'round'; ctx.lineCap = 'butt'; ctx.setLineDash([]);
      /* as paredes dos prédios da rua: cada parede é um quadrilátero só (convexo, rápido de desenhar);
         as janelas de todas saem num traço */
      const jan = new Path2D(); let temJan = false;
      for(const p of vis) for(const b of C.porPedaco[p.idx].predios){
        if(!naTela(b.x, b.y, (b.raioG + ALT[b.andar]) * v.z)) continue;
        const pisos = b.andar === 2 ? 2 : b.andar === 3 ? 3 : 5;
        Rel.paredes(R, b.pts, rv.s[b.andar], (a, bb, a2, b2, luz) => {
          ctx.fillStyle = luz > .2 ? b.corL : luz < -.2 ? b.corS : b.parede; quad(a, bb, b2, a2);
          for(let q = 1; q <= pisos; q++){ const t = (q - .42) / pisos; jan.moveTo(a[0] + (a2[0] - a[0]) * t, a[1] + (a2[1] - a[1]) * t); jan.lineTo(bb[0] + (b2[0] - bb[0]) * t, bb[1] + (b2[1] - bb[1]) * t); }
          temJan = true;
        });
      }
      if(temJan){ ctx.strokeStyle = 'rgba(22,28,40,.6)'; ctx.lineWidth = .22; ctx.setLineDash([1.3, .9]); ctx.stroke(jan); ctx.setLineDash([]); }
      /* o prédio dos boxes: as paredes, e na frente as portas das garagens com a cor de cada equipe */
      const B = C.boxes;
      if(B && R.visivel(B.x0 - 10, B.y0 - 10, B.x1 + 10, B.y1 + 10)){
        const s = rv.s[2], cores = C2D.Cenario.equipes(R), sobe = (p, t) => { const f = 1 + (s - 1) * t; return [rv.x + (p[0] - rv.x) * f, rv.y + (p[1] - rv.y) * f]; };
        Rel.paredes(R, B.pts, s, (a, bb, a2, b2, luz) => {
          if(!naTela((a[0] + bb[0]) / 2, (a[1] + bb[1]) / 2, 12 * v.z)) return;
          ctx.fillStyle = luz > .2 ? '#c9cdd4' : luz < -.2 ? '#868b93' : '#a9aeb6'; quad(a, bb, b2, a2);
        });
        /* (a frente só aparece do lado da pista: o ponto de fuga do lado de fora da parede) */
        B.garagens.forEach((g, q) => {
          if(!naTela((g.a[0] + g.b[0]) / 2, (g.a[1] + g.b[1]) / 2, 8 * v.z)) return;
          if((rv.x - g.a[0]) * g.nx + (rv.y - g.a[1]) * g.ny <= 0) return;
          ctx.fillStyle = '#17191d'; quad(g.a, g.b, sobe(g.b, .62), sobe(g.a, .62));
          ctx.fillStyle = cores[q % cores.length]; quad(sobe(g.a, .66), sobe(g.b, .66), sobe(g.b, .93), sobe(g.a, .93));
        });
      }
      /* os troncos: do pé de cada árvore até a copa */
      const tr = new Path2D(); let temTr = false;
      for(const p of vis) for(const a of C.porPedaco[p.idx].arvores){
        const s = T.arvores[(a.v2 != null ? a.v2 : a.v) % T.arvores.length], kb = troncoDe(s); if(!kb) continue;
        if(!naTela(a.x, a.y, (a.r + 3) * v.z)) continue;
        const f = rv.s[kb]; tr.moveTo(a.x, a.y); tr.lineTo(rv.x + (a.x - rv.x) * f, rv.y + (a.y - rv.y) * f); temTr = true;
      }
      if(temTr){ ctx.lineCap = 'round'; ctx.strokeStyle = '#3f3122'; ctx.lineWidth = .5; ctx.stroke(tr); ctx.strokeStyle = 'rgba(160,130,90,.35)'; ctx.lineWidth = .14; ctx.stroke(tr); ctx.lineCap = 'butt'; }
      /* os pilares do pórtico */
      const pg = C.portico;
      if(pg && naTela((pg.x0 + pg.x1) / 2, (pg.y0 + pg.y1) / 2, 30 * v.z)){
        const f = rv.s[2];
        ctx.strokeStyle = '#33373d'; ctx.lineWidth = .55; ctx.beginPath();
        for(const [x, y] of [[pg.x0, pg.y0], [pg.x1, pg.y1]]){ ctx.moveTo(x, y); ctx.lineTo(rv.x + (x - rv.x) * f, rv.y + (y - rv.y) * f); }
        ctx.stroke();
      }
      if(C2D.Ambiente && C2D.Ambiente.paredes) C2D.Ambiente.paredes(ctx, R, vis, naTela, quad);
      if(C2D.Vida && C2D.Vida.paredes) C2D.Vida.paredes(ctx, R, vis, naTela);
      /* os andares, de baixo para cima: dos blocos pintados; sem eles, pintados agora */
      for(let k = 1; k < ALT.length; k++){
        const s = rv.s[k];
        if(R.cam2 && !R.semBlocos && C2D.Camadas.andar(R, ctx, k, s)) continue;
        ctx.save(); ctx.translate(rv.x, rv.y); ctx.scale(s, s); ctx.translate(-rv.x, -rv.y);
        C2D.Cenario.andar(ctx, R, vis, k);
        ctx.restore();
      }
      /* as luzes da largada acesas, lá em cima no pórtico */
      if(pg && R.luzes > 0 && naTela((pg.x0 + pg.x1) / 2, (pg.y0 + pg.y1) / 2, 30 * v.z)){
        const f = rv.s[2];
        for(const l of pg.luzes){
          const x = rv.x + (l.x - rv.x) * f, y = rv.y + (l.y - rv.y) * f;
          ctx.fillStyle = 'rgba(255,60,50,.28)'; ctx.beginPath(); ctx.arc(x, y, .8, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#ff2a2a'; ctx.beginPath(); ctx.arc(x, y, .34, 0, Math.PI * 2); ctx.fill();
        }
      }
      if(C2D.Ambiente) C2D.Ambiente.alto(ctx, R, vis, naTela);
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
