/* Corrida 2D: o ambiente de cada pista — o que o tema (temas2d.js) pede além do cenário de base.
   As texturas do chão de cada bioma (grama, capim seco, areia do deserto, duna, rocha), a brita
   e o asfalto de cada lugar e época, a pintura das áreas de escape, as árvores de cada região
   (folhosa, pinheiro, palmeira, cipreste, eucalipto), a água (costa com cais e barcos, lago no
   miolo), o estacionamento atrás da arquibancada, o camping de motorhomes no miolo dos ovais,
   as placas de publicidade nas retas, os postos dos fiscais, os marcos (ponte, roda-gigante,
   torre e pagode, estádio, tijolos da largada, campo de golfe), o nome do circuito no pórtico
   e no telhado dos boxes, as barreiras de época (fardos de feno, guard-rail, cerca) e a noite
   (uma camada escura em baixa resolução com a pista, os postes e os carros recortados em luz).
   Tudo montado uma vez por pista; por quadro só entra o que a câmera vê. Só desenho. */
(function(raiz){
  const C2D = raiz.C2D;
  const novo = (w, h) => typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(w, h) : Object.assign(document.createElement('canvas'), { width: w, height: h });
  const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
  const rgba = (hex, a) => 'rgba(' + rgb(hex).join(',') + ',' + a + ')';
  /* a cor mais clara (f > 0) ou mais escura (f < 0), com transparência */
  const mix = (hex, f, a) => 'rgba(' + rgb(hex).map(c => Math.round(f >= 0 ? c + (255 - c) * f : c * (1 + f))).join(',') + ',' + (a == null ? 1 : a) + ')';
  const rr = (g, x, y, w, h, r) => { g.beginPath(); if(g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); };
  /* desenha repetindo nas bordas, para a textura emendar sem costura */
  function emenda(w, x, y, r, fn){
    for(const dx of [-w, 0, w]) for(const dy of [-w, 0, w]){ const X = x + dx, Y = y + dy; if(X + r < 0 || X - r > w || Y + r < 0 || Y - r > w) continue; fn(X, Y); }
  }
  function manchas(g, w, n, cores, r0, r1, sem){
    const r = C2D.rng(sem);
    for(let k = 0; k < n; k++){
      const x = r() * w, y = r() * w, raio = r0 + r() * (r1 - r0), [cor, a] = cores[Math.floor(r() * cores.length)];
      emenda(w, x, y, raio, (X, Y) => { const gr = g.createRadialGradient(X, Y, 0, X, Y, raio); gr.addColorStop(0, rgba(cor, a)); gr.addColorStop(1, rgba(cor, 0)); g.fillStyle = gr; g.fillRect(X - raio, Y - raio, raio * 2, raio * 2); });
    }
  }
  /* (nas texturas o y fica ao contrário do mundo: a sombra vai para +x e −y, o brilho para −x e +y) */

  /* ── o chão de cada bioma (512 px a 25 cm = 128 m) ── */
  function texChao(tm, corte){
    const c = novo(512, 512), g = c.getContext('2d'), [base, claro, escuro] = tm.grama, r = C2D.rng(12);
    g.fillStyle = base; g.fillRect(0, 0, 512, 512);
    manchas(g, 512, 60, [[claro, .2], [escuro, .2]], 50, 140, 21);
    manchas(g, 512, 220, [[claro, .22], [escuro, .24]], 8, 28, 11);
    if(tm.terra) manchas(g, 512, 80, [[tm.terra, .55], [tm.terra, .35]], 5, 20, 15);     /* a terra aparecendo no meio do capim */
    g.lineCap = 'round';
    if(tm.solo === 'grama' || tm.solo === 'seco'){
      /* as listras do cortador (bem fracas no capim seco) e as lâminas */
      const P = 512 / 12, a = tm.solo === 'seco' ? .025 : .06;
      /* (longe da pista ninguém corta: sem listras, mais escura e com moitas) */
      if(!corte){ g.fillStyle = 'rgba(0,14,0,.1)'; g.fillRect(0, 0, 512, 512); manchas(g, 512, 150, [[escuro, .3], [claro, .16], ['#8a7a3a', .1]], 5, 20, 29); }
      for(let k = -12; corte && k < 24; k++){ g.fillStyle = k % 2 ? 'rgba(255,255,230,' + a + ')' : 'rgba(0,20,0,' + a + ')'; g.beginPath(); g.moveTo(k * P, 0); g.lineTo(k * P + P, 0); g.lineTo(k * P + P + 512, 512); g.lineTo(k * P + 512, 512); g.closePath(); g.fill(); }
      const lam = tm.solo === 'seco' ? [mix(claro, .2, .34), mix(escuro, 0, .26), 'rgba(232,220,154,.25)'] : [mix(claro, .12, .32), mix(escuro, -.1, .3), mix(claro, .4, .22)];
      g.lineWidth = .8;
      for(let k = 0; k < 26000; k++){
        const x = r() * 512, y = r() * 512, a2 = -.9 + (r() - .5) * 1.1, l = 1.1 + r() * 1.8, v = r(), dx = Math.cos(a2) * l, dy = Math.sin(a2) * l;
        g.strokeStyle = v < .45 ? lam[0] : v < .9 ? lam[1] : lam[2];
        emenda(512, x, y, l, (X, Y) => { g.beginPath(); g.moveTo(X, Y); g.lineTo(X + dx, Y + dy); g.stroke(); });
      }
    } else if(tm.solo === 'areia' || tm.solo === 'duna'){
      /* as ondas do vento, os grãos e as moitas (poucas no deserto; nas dunas, o capim que segura a areia) */
      g.lineWidth = 1;
      for(let k = 0; k < 900; k++){
        const x = r() * 512, y = r() * 512, l = 6 + r() * 16, a2 = .5 + (r() - .5) * .5, dx = Math.cos(a2) * l, dy = Math.sin(a2) * l;
        g.strokeStyle = r() < .5 ? mix(claro, .2, .4) : mix(escuro, 0, .22);
        emenda(512, x, y, l, (X, Y) => { g.beginPath(); g.moveTo(X, Y); g.quadraticCurveTo(X + dx * .5, Y + dy * .5 - 2, X + dx, Y + dy); g.stroke(); });
      }
      for(let k = 0; k < 5000; k++){ g.fillStyle = r() < .5 ? mix(escuro, -.1, .35) : 'rgba(255,255,255,.18)'; g.fillRect(Math.floor(r() * 512), Math.floor(r() * 512), 1, 1); }
      const duna = tm.solo === 'duna', cT = duna ? ['#7d9060', '#5f7548', '#95a878'] : ['#7c7a4a', '#5f6238'];
      for(let k = 0, nT = duna ? 900 : 120; k < nT; k++){
        const x = r() * 512, y = r() * 512, raio = 2 + r() * (duna ? 6 : 3.5), cor = cT[Math.floor(r() * cT.length)], a2 = r() * 3;
        emenda(512, x, y, raio + 2, (X, Y) => { g.fillStyle = 'rgba(60,45,20,.25)'; g.beginPath(); g.ellipse(X + 1.2, Y - 1.2, raio, raio * .8, a2, 0, 6.3); g.fill(); g.fillStyle = cor; g.beginPath(); g.ellipse(X, Y, raio, raio * .8, a2, 0, 6.3); g.fill(); });
      }
    } else {
      /* rocha: pedras soltas com luz e capim ralo entre elas */
      for(let k = 0; k < 1400; k++){
        const x = r() * 512, y = r() * 512, rx = 1.5 + r() * 5, ry = rx * (.5 + r() * .5), a2 = r() * 3.14, cl = r() < .5;
        emenda(512, x, y, rx + 2, (X, Y) => { g.fillStyle = 'rgba(40,36,30,.3)'; g.beginPath(); g.ellipse(X + 1, Y - 1, rx, ry, a2, 0, 6.3); g.fill(); g.fillStyle = cl ? mix(claro, .15, .9) : mix(escuro, 0, .9); g.beginPath(); g.ellipse(X, Y, rx, ry, a2, 0, 6.3); g.fill(); });
      }
      manchas(g, 512, 60, [['#5f7a4a', .35]], 6, 18, 19);
    }
    return c;
  }
  /* o capim de perto: lâminas finas, tufos e umas florzinhas; transparente, por cima do chão (256 px a 3 cm = 8 m) */
  function texFina(tm){
    const c = novo(256, 256), g = c.getContext('2d'), r = C2D.rng(57), claro = tm.grama[1], escuro = tm.grama[2], seco = tm.solo !== 'grama';
    g.lineCap = 'round';
    for(let k = 0; k < 5200; k++){
      const x = r() * 256, y = r() * 256, a = -1.1 + (r() - .5) * 1.5, l = 2 + r() * 4.5, v = r(), dx = Math.cos(a) * l, dy = Math.sin(a) * l;
      g.strokeStyle = v < .45 ? mix(claro, .18, .3) : v < .88 ? mix(escuro, -.12, .32) : seco ? 'rgba(226,210,140,.3)' : mix(claro, .45, .26);
      g.lineWidth = .7 + r() * .8;
      emenda(256, x, y, l, (X, Y) => { g.beginPath(); g.moveTo(X, Y); g.lineTo(X + dx, Y + dy); g.stroke(); });
    }
    for(let k = 0; k < 60; k++){ const x = r() * 256, y = r() * 256, raio = 2 + r() * 4; emenda(256, x, y, raio, (X, Y) => { g.fillStyle = mix(escuro, -.2, .22); g.beginPath(); g.arc(X, Y, raio, 0, 6.3); g.fill(); }); }
    if(!seco) for(let k = 0; k < 26; k++){ g.fillStyle = r() < .6 ? 'rgba(250,246,226,.7)' : 'rgba(244,214,90,.7)'; g.fillRect(Math.floor(r() * 256), Math.floor(r() * 256), 1.4, 1.4); }
    return c;
  }
  function texBrita(cor){
    const c = novo(128, 128), g = c.getContext('2d'), r = C2D.rng(41);
    g.fillStyle = cor; g.fillRect(0, 0, 128, 128);
    const cores = [mix(cor, .2), mix(cor, -.12), mix(cor, .38), mix(cor, -.25), mix(cor, .08)];
    for(let k = 0; k < 2600; k++){
      const x = r() * 128, y = r() * 128, rx = .7 + r() * 1.3, ry = rx * (.6 + r() * .4), a = r() * 3.14, co = cores[Math.floor(r() * 5)];
      emenda(128, x, y, 3, (X, Y) => {
        g.fillStyle = mix(cor, -.55, .35); g.beginPath(); g.ellipse(X + .5, Y - .5, rx, ry, a, 0, 6.3); g.fill();
        g.fillStyle = co; g.beginPath(); g.ellipse(X, Y, rx, ry, a, 0, 6.3); g.fill();
        g.fillStyle = 'rgba(255,250,235,.3)'; g.beginPath(); g.ellipse(X - rx * .3, Y + ry * .3, rx * .4, ry * .35, a, 0, 6.3); g.fill();
      });
    }
    return c;
  }
  /* o asfalto do lugar e da época: novo e escuro, velho com remendos e rachaduras, ou placas de concreto */
  function texAsfalto(tm){
    const c = novo(512, 512), g = c.getContext('2d'), r = C2D.rng(32), velho = tm.velho;
    g.fillStyle = tm.asfalto; g.fillRect(0, 0, 512, 512);
    manchas(g, 512, 22, [['#ffffff', velho ? .07 : .04], ['#000000', velho ? .13 : .09]], 60, 170, 33);
    manchas(g, 512, 90, [['#ffffff', .035], ['#000000', .08]], 16, 50, 31);
    for(let k = 0; k < 56000; k++){ const v = r(); g.fillStyle = v < .5 ? 'rgba(0,0,0,.16)' : v < .92 ? 'rgba(255,255,255,.07)' : 'rgba(205,205,210,.16)'; const s = v < .92 ? 1 : 1.6; g.fillRect(Math.floor(r() * 512), Math.floor(r() * 512), s, s); }
    if(tm.concreto){
      g.fillStyle = 'rgba(0,0,0,.2)'; for(let k = 0; k < 5; k++){ g.fillRect(Math.round(k * 102.4), 0, 1.5, 512); g.fillRect(0, Math.round(k * 102.4), 512, 1.5); }
      g.fillStyle = 'rgba(255,255,255,.1)'; for(let k = 0; k < 5; k++){ g.fillRect(Math.round(k * 102.4) + 2, 0, 1, 512); g.fillRect(0, Math.round(k * 102.4) + 2, 512, 1); }
    } else if(velho){
      g.strokeStyle = 'rgba(0,0,0,.22)'; g.lineWidth = 1;
      for(let k = 0; k < 26; k++){ let x = 30 + r() * 450, y = 30 + r() * 450; g.beginPath(); g.moveTo(x, y); for(let q = 0; q < 5; q++){ x += (r() - .5) * 40; y += (r() - .5) * 40; g.lineTo(x, y); } g.stroke(); }
      for(let k = 0; k < 9; k++){ g.fillStyle = r() < .5 ? 'rgba(0,0,0,.1)' : 'rgba(255,255,255,.05)'; g.fillRect(20 + r() * 400, 20 + r() * 400, 20 + r() * 50, 14 + r() * 30); }
    }
    return c;
  }
  /* a área de escape pintada: uma cor só (o azul de Yas, o verde-água de Miami) ou listras (Paul Ricard, COTA) */
  function texEscape(e){
    const c = novo(256, 256), g = c.getContext('2d'), r = C2D.rng(52);
    g.fillStyle = '#4f535a'; g.fillRect(0, 0, 256, 256);
    if(e.cor){ g.fillStyle = rgba(e.cor, .82); g.fillRect(0, 0, 256, 256); }
    if(e.listras){
      const nc = e.listras.length, n = nc === 3 ? 6 : 8, P = 256 / n;
      for(let k = -n; k < n * 2; k++){ g.fillStyle = rgba(e.listras[((k % nc) + nc) % nc], .8); g.beginPath(); g.moveTo(k * P, 0); g.lineTo(k * P + P * .5, 0); g.lineTo(k * P + P * .5 + 256, 256); g.lineTo(k * P + 256, 256); g.closePath(); g.fill(); }
    }
    manchas(g, 256, 20, [['#ffffff', .05], ['#000000', .08]], 20, 60, 51);
    for(let k = 0; k < 7000; k++){ g.fillStyle = r() < .5 ? 'rgba(0,0,0,.1)' : 'rgba(255,255,255,.06)'; g.fillRect(Math.floor(r() * 256), Math.floor(r() * 256), 1, 1); }
    return c;
  }
  function texRua(cor){
    const c = novo(256, 256), g = c.getContext('2d'), r = C2D.rng(61);
    g.fillStyle = cor; g.fillRect(0, 0, 256, 256);
    for(let a = 0; a < 256; a += 16) for(let b = 0; b < 256; b += 16){ const v = r(); g.fillStyle = v < .35 ? 'rgba(255,250,240,.06)' : v < .7 ? 'rgba(0,0,0,.05)' : 'rgba(120,110,95,.06)'; g.fillRect(a, b, 16, 16); }
    g.fillStyle = 'rgba(0,0,0,.1)'; for(let k = 0; k < 256; k += 16){ g.fillRect(k, 0, 1, 256); g.fillRect(0, k, 256, 1); }
    g.fillStyle = 'rgba(255,255,255,.06)'; for(let k = 0; k < 256; k += 16){ g.fillRect(k + 1, 0, 1, 256); g.fillRect(0, k + 1, 256, 1); }
    for(let k = 0; k < 6000; k++){ g.fillStyle = r() < .5 ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.06)'; g.fillRect(Math.floor(r() * 256), Math.floor(r() * 256), 1, 1); }
    return c;
  }
  function texPublico(cores){
    const c = novo(64, 64), g = c.getContext('2d'), r = C2D.rng(71);
    for(let a = 0; a < 4; a++) for(let b = 0; b < 4; b++){
      const x = 8 + a * 16 + (r() - .5) * 3, y = 8 + b * 16 + (r() - .5) * 3;
      if(r() < .18){ g.fillStyle = 'rgba(30,60,120,.55)'; g.beginPath(); g.arc(x, y, 4.4, 0, 6.3); g.fill(); continue; }
      g.fillStyle = cores[Math.floor(r() * cores.length)]; g.beginPath(); g.arc(x, y, 6.6, 0, 6.3); g.fill();
      g.fillStyle = 'rgba(255,255,255,.22)'; g.beginPath(); g.arc(x - 1.6, y + 1.6, 4.2, 0, 6.3); g.fill();
      g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.arc(x + 1.8, y - 1.8, 3, 0, 6.3); g.fill();
    }
    return c;
  }
  function texAgua(cor){
    const c = novo(256, 256), g = c.getContext('2d'), r = C2D.rng(81);
    g.fillStyle = cor; g.fillRect(0, 0, 256, 256);
    manchas(g, 256, 40, [['#ffffff', .07], ['#001020', .13]], 18, 60, 82);
    g.lineCap = 'round'; g.lineWidth = 1;
    for(let k = 0; k < 420; k++){
      const x = r() * 256, y = r() * 256, l = 3 + r() * 7;
      g.strokeStyle = r() < .6 ? 'rgba(255,255,255,.2)' : 'rgba(0,20,40,.16)';
      emenda(256, x, y, l, (X, Y) => { g.beginPath(); g.moveTo(X - l / 2, Y); g.quadraticCurveTo(X, Y - 1.6, X + l / 2, Y); g.stroke(); });
    }
    return c;
  }
  /* um carro de passeio visto de cima (px), para o estacionamento e o camping */
  function carrinho(g, x, y, w, l, cor){
    g.fillStyle = 'rgba(0,0,0,.3)'; rr(g, x - w / 2 + 2, y - l / 2 - 2, w, l, 5); g.fill();
    g.fillStyle = cor; rr(g, x - w / 2, y - l / 2, w, l, 5); g.fill();
    g.fillStyle = 'rgba(20,28,38,.85)'; rr(g, x - w / 2 + 3, y - l * .24, w - 6, l * .15, 2); g.fill(); rr(g, x - w / 2 + 3, y + l * .2, w - 6, l * .11, 2); g.fill();
    g.fillStyle = 'rgba(255,255,255,.2)'; rr(g, x - w / 2 + 3, y - l * .07, w - 6, l * .25, 2); g.fill();
  }
  /* o estacionamento (512 px a 1/16 m = 32 m): duas fileiras de vagas e a rua, duas vezes */
  function texEstac(tm){
    const c = novo(512, 512), g = c.getContext('2d'), r = C2D.rng(91);
    g.fillStyle = '#5c5f64'; g.fillRect(0, 0, 512, 512);
    for(let k = 0; k < 9000; k++){ g.fillStyle = r() < .5 ? 'rgba(0,0,0,.1)' : 'rgba(255,255,255,.05)'; g.fillRect(Math.floor(r() * 512), Math.floor(r() * 512), 1, 1); }
    const cores = tm.era === 'classica' ? ['#c9c2a8', '#7a2a22', '#2f4a3a', '#d8d2c0', '#2a2c30', '#8a6a3a', '#3a4f7a', '#a8a39a'] : ['#e9eaec', '#c7c9cc', '#2a2c30', '#8a8d92', '#b3241a', '#1f4f9f', '#f1f1f1', '#3a3d42', '#d8d2c0', '#2f6a4a'];
    const vaga = 512 / 12;
    for(let md = 0; md < 2; md++) for(const y0 of [0, 11]){
      const yy = (md * 16 + y0) * 16;
      for(let q = 0; q < 12; q++){
        g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(q * vaga, yy, 1.5, 80);
        if(r() < .8) carrinho(g, q * vaga + vaga / 2 + (r() - .5) * 4, yy + 40 + (r() - .5) * 6, 29, 68, cores[Math.floor(r() * cores.length)]);
      }
    }
    return c;
  }
  /* o camping do miolo dos ovais (fundo transparente): motorhomes com toldo, barracas, caminhonetes e a rua de terra */
  function texCamping(){
    const c = novo(512, 512), g = c.getContext('2d'), r = C2D.rng(95), toldos = ['#d6311f', '#1f5fbf', '#f2c61f', '#1f8a4b', '#f08a1a'];
    for(let md = 0; md < 2; md++){
      const yy = md * 256;
      g.fillStyle = 'rgba(120,100,70,.35)'; g.fillRect(0, yy + 156, 512, 96);
      for(let q = 0; q < 6; q++){
        const xx = q * (512 / 6) + 10;
        if(r() < .14) continue;
        if(r() < .72){
          const w = 40, l = 116 + r() * 20, y1 = yy + 12 + r() * 10;
          g.fillStyle = 'rgba(0,0,0,.28)'; rr(g, xx + 3, y1 - 3, w, l, 6); g.fill();
          g.fillStyle = r() < .7 ? '#eeeae0' : '#d9d4c6'; rr(g, xx, y1, w, l, 6); g.fill();
          g.fillStyle = 'rgba(0,0,0,.14)'; rr(g, xx + 8, y1 + 20, w - 16, 14, 2); g.fill(); rr(g, xx + 8, y1 + l - 44, w - 16, 18, 2); g.fill();
          g.fillStyle = toldos[Math.floor(r() * toldos.length)]; rr(g, xx + w + 2, y1 + 24, 26, l * .5, 3); g.fill();
          g.fillStyle = 'rgba(255,255,255,.3)'; for(let s = 0; s < 3; s++) g.fillRect(xx + w + 4 + s * 8, y1 + 24, 3, l * .5);
        } else {
          const y1 = yy + 26 + r() * 30, cor = toldos[Math.floor(r() * toldos.length)];
          g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(xx + 24, y1 + 17, 22, 19, 0, 0, 6.3); g.fill();
          g.fillStyle = cor; g.beginPath(); g.ellipse(xx + 21, y1 + 20, 22, 19, 0, 0, 6.3); g.fill();
          g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(xx - 1, y1 + 20); g.lineTo(xx + 43, y1 + 20); g.moveTo(xx + 21, y1 + 1); g.lineTo(xx + 21, y1 + 39); g.stroke();
          carrinho(g, xx + 60, y1 + 78, 30, 78, ['#2a2c30', '#b3241a', '#e9eaec', '#1f4f9f'][Math.floor(r() * 4)]);
        }
      }
    }
    return c;
  }
  /* os fardos de feno das pistas antigas (um traço de padrão, como os pneus) */
  function texFeno(){
    const c = novo(64, 64), g = c.getContext('2d');
    g.fillStyle = '#6f6140'; g.fillRect(0, 0, 64, 64);
    const fardo = (x, y) => { g.fillStyle = '#d6bf78'; rr(g, x, y, 58, 26, 4); g.fill(); g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(x + 3, y + 19, 52, 5); g.strokeStyle = 'rgba(110,88,40,.7)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x + 18, y); g.lineTo(x + 18, y + 26); g.moveTo(x + 40, y); g.lineTo(x + 40, y + 26); g.stroke(); };
    fardo(3, 3); fardo(-29, 35); fardo(35, 35);
    return c;
  }
  function brilho(){
    const c = novo(64, 64), g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.45, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return c;
  }
  /* um barco visto de cima: lancha, iate e iate grande (a proa para +x) */
  function barco(v){
    const E = 6, L = [9, 17, 30][v], W = L * .27, cw = Math.ceil((L + 2) * E), ch = Math.ceil((W + 2) * E), c = novo(cw, ch), g = c.getContext('2d');
    g.translate(cw / 2, ch / 2); g.scale(E, E);
    const casco = s => { g.beginPath(); g.moveTo(L / 2 * s, 0); g.quadraticCurveTo(L * .28 * s, -W / 2 * s, -L * .1 * s, -W / 2 * s); g.lineTo(-L / 2 * s, -W * .42 * s); g.lineTo(-L / 2 * s, W * .42 * s); g.lineTo(-L * .1 * s, W / 2 * s); g.quadraticCurveTo(L * .28 * s, W / 2 * s, L / 2 * s, 0); g.closePath(); };
    casco(1.04); g.fillStyle = 'rgba(0,25,45,.3)'; g.fill();
    casco(1); g.fillStyle = '#f4f5f6'; g.fill(); g.strokeStyle = 'rgba(40,60,80,.5)'; g.lineWidth = .12; g.stroke();
    casco(.8); g.fillStyle = v ? '#d9c9a8' : '#e6e8ea'; g.fill();
    g.fillStyle = '#f7f8f9'; rr(g, -L * .22, -W * .26, L * .42, W * .52, W * .14); g.fill();
    g.fillStyle = '#243447'; rr(g, L * .06, -W * .2, L * .1, W * .4, W * .08); g.fill();
    if(v === 2){ g.fillStyle = '#eef0f2'; rr(g, -L * .14, -W * .17, L * .2, W * .34, W * .08); g.fill(); g.fillStyle = '#2fa7c9'; rr(g, -L * .4, -W * .16, L * .12, W * .32, W * .1); g.fill(); }
    return { cv: c, w: cw / E, h: ch / E };
  }

  /* ── as árvores de cada região: copa em camadas com a luz do noroeste, contorno e a sombra ── */
  const FOLHAGEM = { verde: ['#24512a', '#357236', '#58993f', '#8cc35c'], oliva: ['#3a4f24', '#54692f', '#7a8c45', '#a8b868'], escuro: ['#1b3f24', '#28572f', '#3f7a40', '#6aa25a'],
                     tropical: ['#1f5a2a', '#2f8038', '#4fae44', '#93d464'], seco: ['#3c5340', '#56705a', '#7d977c', '#a9bfa4'] };
  const PAL_TIPO = { pinheiro: ['#17382a', '#22503a', '#34704c', '#5f9c6c'], palmeira: ['#1f5a2c', '#2f8a3c', '#5cb850', '#a4e070'], cipreste: ['#16321f', '#1f4a2a', '#2f6a3a', '#4f8a50'],
                     eucalipto: ['#3c5340', '#56705a', '#7d977c', '#a9bfa4'], rocha: ['#5c574e', '#7d776b', '#a19a8c', '#c9c2b3'] };
  function arvore(tipo, pal, sem){
    const E = 12, R0 = 4.2, cw = Math.ceil(R0 * 2.7 * E), cv = novo(cw, cw), sb = novo(cw, cw), g = cv.getContext('2d'), gs = sb.getContext('2d'), r = C2D.rng(17 + sem * 31);
    g.translate(cw / 2, cw / 2); g.scale(E, E); gs.translate(cw / 2, cw / 2); gs.scale(E, E);
    const forma = (c, cor, s) => {
      c.fillStyle = cor; c.beginPath();
      if(tipo === 'pinheiro'){ const n = 11; for(let k = 0; k <= n * 2; k++){ const a = k / (n * 2) * Math.PI * 2, raio = (k % 2 ? .62 : 1) * R0 * .9 * s; k ? c.lineTo(Math.cos(a) * raio, Math.sin(a) * raio) : c.moveTo(Math.cos(a) * raio, Math.sin(a) * raio); } }
      else if(tipo === 'palmeira'){ for(let k = 0; k < 9; k++){ const a = k / 9 * Math.PI * 2 + .2, L = R0 * .98 * s, w = R0 * .2 * s, ax = Math.cos(a), ay = Math.sin(a); c.moveTo(0, 0); c.quadraticCurveTo(ax * L * .5 - ay * w, ay * L * .5 + ax * w, ax * L, ay * L); c.quadraticCurveTo(ax * L * .5 + ay * w, ay * L * .5 - ax * w, 0, 0); } }
      else if(tipo === 'cipreste') c.arc(0, 0, R0 * .36 * s, 0, Math.PI * 2);
      else if(tipo === 'rocha'){ const rb = C2D.rng(5 + sem); for(let k = 0; k < 8; k++){ const a = k / 8 * Math.PI * 2, raio = R0 * (.45 + rb() * .3) * s; k ? c.lineTo(Math.cos(a) * raio, Math.sin(a) * raio * .8) : c.moveTo(Math.cos(a) * raio, Math.sin(a) * raio * .8); } }
      else {
        const arb = tipo === 'arbusto', euc = tipo === 'eucalipto', nb = arb ? 9 : euc ? 7 : 8, rb = C2D.rng(91 + sem), d = R0 * (arb ? .5 : euc ? .55 : .42) * s, r0 = R0 * (arb ? .42 : euc ? .3 : .5) * s;
        for(let k = 0; k < nb; k++){ const a = k / nb * Math.PI * 2 + rb() * .4, raio = r0 * (.85 + rb() * .3); c.moveTo(Math.cos(a) * d + raio, Math.sin(a) * d); c.arc(Math.cos(a) * d, Math.sin(a) * d, raio, 0, Math.PI * 2); }
        if(!euc){ c.moveTo(R0 * .55 * s, 0); c.arc(0, 0, R0 * .55 * s, 0, Math.PI * 2); }
      }
      c.fill();
    };
    /* a sombra: a silhueta desfocada (a do cipreste, alto e fino, é comprida) */
    gs.filter = 'blur(' + Math.round(E * .35) + 'px)';
    if(tipo === 'cipreste'){ gs.fillStyle = 'rgba(12,24,12,1)'; gs.beginPath(); gs.ellipse(R0 * .5, -R0 * .5, R0, R0 * .3, -Math.PI / 4, 0, Math.PI * 2); gs.fill(); }
    else forma(gs, tipo === 'rocha' ? 'rgba(20,18,14,1)' : 'rgba(12,24,12,1)', 1);
    gs.filter = 'none';
    forma(g, tipo === 'rocha' ? 'rgba(30,26,20,.8)' : 'rgba(8,22,10,.75)', 1.04);
    forma(g, pal[0], 1);
    g.save(); g.translate(-R0 * .1, -R0 * .1); forma(g, pal[1], .86); g.restore();
    if(tipo === 'palmeira'){
      /* a nervura de cada folha (as viradas para a luz, mais claras) e o miolo */
      g.lineCap = 'round'; g.lineWidth = .1;
      for(let k = 0; k < 9; k++){ const a = k / 9 * Math.PI * 2 + .2, ax = Math.cos(a), ay = Math.sin(a), luz = -ax - ay; g.strokeStyle = luz > .2 ? pal[3] : luz < -.4 ? 'rgba(10,40,16,.5)' : pal[2]; g.beginPath(); g.moveTo(ax * R0 * .12, ay * R0 * .12); g.lineTo(ax * R0 * .9, ay * R0 * .9); g.stroke(); }
      g.fillStyle = '#5b4630'; g.beginPath(); g.arc(0, 0, R0 * .1, 0, Math.PI * 2); g.fill();
    } else if(tipo === 'rocha'){
      g.save(); g.translate(-R0 * .12, -R0 * .1); forma(g, pal[2], .55); g.restore();
      g.strokeStyle = 'rgba(30,26,20,.45)'; g.lineWidth = .07; g.beginPath(); g.moveTo(-R0 * .1, -R0 * .3); g.lineTo(R0 * .15, R0 * .1); g.lineTo(R0 * .05, R0 * .4); g.stroke();
    } else {
      const alc = tipo === 'cipreste' ? R0 * .3 : R0 * .72, n1 = tipo === 'cipreste' ? 8 : 26, n2 = tipo === 'cipreste' ? 5 : 14;
      for(let k = 0; k < n1; k++){
        const a = r() * Math.PI * 2, d = Math.sqrt(r()) * alc, x = Math.cos(a) * d, y = Math.sin(a) * d, raio = alc * (.2 + r() * .22), luz = (-x - y) / (alc * 1.6);
        g.fillStyle = luz > .15 ? pal[2] : luz < -.25 ? 'rgba(14,38,16,.35)' : pal[1]; g.beginPath(); g.arc(x, y, raio, 0, Math.PI * 2); g.fill();
      }
      for(let k = 0; k < n2; k++){
        const a = Math.PI * 1.25 + (r() - .5) * 1.6, d = alc * (.28 + r() * .6), x = Math.cos(a) * d, y = Math.sin(a) * d;
        g.fillStyle = pal[3]; g.globalAlpha = .55 + r() * .35; g.beginPath(); g.arc(x, y, alc * (.08 + r() * .11), 0, Math.PI * 2); g.fill();
      }
      g.globalAlpha = 1;
    }
    return { cv, sombra: sb, m: cw / E, tipo };
  }
  function arvores(tm){
    const pesos = tm.arv, tipos = Object.keys(pesos), tot = tipos.reduce((a, k) => a + pesos[k], 0), lista = [];
    for(const k of tipos){ const q = Math.max(1, Math.round(pesos[k] / tot * 6)); for(let j = 0; j < q; j++) lista.push(k); }
    const seca = tm.solo !== 'grama';
    return lista.slice(0, 8).map((tipo, j) => arvore(tipo, PAL_TIPO[tipo] || (tipo === 'arbusto' && seca ? ['#55603a', '#6f7a48', '#96a064', '#bcc48a'] : FOLHAGEM[tm.folhagem] || FOLHAGEM.verde), j));
  }
  /* um texto pintado (o nome do circuito): { cv, prop } */
  function texto(txt, cor){
    const fonte = '800 56px Archivo, "Arial Narrow", Arial, sans-serif', g0 = novo(8, 8).getContext('2d');
    g0.font = fonte;
    const w = Math.ceil(g0.measureText(txt).width) + 16, c = novo(w, 72), g = c.getContext('2d');
    g.font = fonte; g.textBaseline = 'middle'; g.fillStyle = cor; g.fillText(txt, 8, 38);
    return { cv: c, prop: w / 72 };
  }
  /* escreve no mundo (o y do mundo é para cima: desvira para a letra não sair espelhada) */
  function escrever(ctx, s, x, y, ang, alt, alfa){
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(1, -1); if(alfa != null) ctx.globalAlpha = alfa;
    ctx.drawImage(s.cv, -alt * s.prop / 2, -alt / 2, alt * s.prop, alt); ctx.restore();
  }
  const pad = (ctx, nome, mpp) => C2D.Cenario.padrao(ctx, nome, mpp);
  /* (só desenho) os cantos de uma caixa virada (meias medidas a e b), uma viga atravessada e os corpos da torre */
  const caixa = (x, y, hd, a, b) => { const c = Math.cos(hd), s = Math.sin(hd); return [[-a, -b], [a, -b], [a, b], [-a, b]].map(([u, w]) => [x + u * c - w * s, y + u * s + w * c]); };
  /* (o texto lê da esquerda para a direita de quem chega) */
  function viga(ctx, x0, y0, x1, y1, desenho){
    const comp = Math.hypot(x1 - x0, y1 - y0);
    ctx.save(); ctx.translate((x0 + x1) / 2, (y0 + y1) / 2); ctx.rotate(Math.atan2(y0 - y1, x0 - x1)); desenho(comp); ctx.restore();
  }
  const TORRE = [5.5, 4.2, 2.9], TORRE_P = [5.5, 4.4, 3.3];

  C2D.Ambiente = {
    texto, escrever,
    /* as texturas que mudam com o tema (por cima das de base do cenário) */
    texturas(T, tm){
      T.grama = texChao(tm, false); T.gramaCorte = texChao(tm, true); T.gramaFina = texFina(tm);
      if(tm.brita !== '#c6ad85') T.brita = texBrita(tm.brita);
      if(tm.asfalto !== '#393c42') T.asfalto = texAsfalto(tm);
      T.pit = T.escape;                                   /* o pit lane fica no asfalto liso, sem a pintura do lugar */
      if(tm.escape) T.escape = texEscape(tm.escape);
      if(tm.rua !== '#7b7c7a') T.rua = texRua(tm.rua);
      T.publico = texPublico(tm.publico);
      T.arvores = arvores(tm);
      if(tm.costa || tm.lago) T.agua = texAgua(tm.agua);
      if(tm.costa) T.barcos = [0, 1, 2].map(barco);
      if(tm.estac) T.estac = texEstac(tm);
      if(tm.camping) T.camping = texCamping();
      if(tm.barreira === 'feno') T.feno = texFeno();
      if(tm.noite) T.brilho = brilho();
    },

    /* monta o ambiente da pista (uma vez). aj: as funções do cenário (livre, naBox, fazArquib) */
    montar(P, cen, aj){
      const tm = cen.tema; if(!tm || typeof Path2D === 'undefined') return;
      const n = P.n, x = P.x, y = P.y, nx = P.nx, ny = P.ny, m = P.meia, L = P.L, B = P.box;
      const rnd = C2D.rng(C2D.semente('amb:' + P.id));
      const md = i => ((i % n) + n) % n;
      const escDe = (i, lado) => lado > 0 ? P.escE[md(i)] : P.escD[md(i)];
      const pt = (i, d) => { const j = md(i); return [x[j] + nx[j] * d, y[j] + ny[j] * d]; };
      const ladoBox = Math.sign(B.lado) || 1;
      const ladoDe = l => l === 'E' ? 1 : l === 'D' ? -1 : l === 'dentro' ? (P.dentro || 1) : l === 'box' ? ladoBox : l === 'arq' ? -ladoBox : -(P.dentro || 1);
      const A = cen.amb = { bandas: [], barcos: [], lagos: [], estac: [], pontes: [], marcos: [], faixas: null, camping: null, tijolos: null, roda: null, torre: null, teto: null };
      const ocup = [];
      /* ── a costa: uma faixa de água ao longo de um trecho, depois do muro (ou em volta da pista inteira, numa ilha) ── */
      for(const b of (tm.costa || [])){
        const lado = ladoDe(b.lado), i0 = Math.round(b.f0 * n), i1 = Math.round(b.f1 * n), anel = b.f1 - b.f0 >= .999;
        const p = new Path2D(), cais = new Path2D();
        for(let i = i0; i <= i1; i += 2){ const q = pt(i, lado * (m + escDe(i, lado) + b.dist)); if(i === i0){ p.moveTo(q[0], q[1]); cais.moveTo(q[0], q[1]); } else { p.lineTo(q[0], q[1]); cais.lineTo(q[0], q[1]); } }
        if(anel){ p.closePath(); cais.closePath(); }
        for(let i = i1; i >= i0; i -= 2){ const q = pt(i, lado * (m + escDe(i, lado) + b.dist + b.larg)); (anel && i === i1) ? p.moveTo(q[0], q[1]) : p.lineTo(q[0], q[1]); }
        p.closePath();
        A.bandas.push({ lado, i0, i1, dist: b.dist, larg: b.larg, path: p, cais });
        for(let q = 0, t = 0; q < (b.barcos || 0) && t < 500; t++){
          const i = i0 + Math.floor(rnd() * (i1 - i0)), [bx, by] = pt(i, lado * (m + escDe(i, lado) + b.dist + 10 + rnd() * Math.min(b.larg - 26, 150)));
          if(!aj.livre(bx, by, 24) || A.barcos.some(o => Math.hypot(o.x - bx, o.y - by) < 17)) continue;
          A.barcos.push({ x: bx, y: by, a: P.hd[md(i)] + (rnd() < .5 ? 0 : Math.PI) + (rnd() - .5) * .5, v: rnd() < .2 ? 2 : rnd() < .55 ? 1 : 0 }); q++;
        }
      }
      const emAgua = (px, py) => {
        for(const b of A.bandas){
          let best = 1e18, bi = -1;
          for(let i = b.i0; i <= b.i1; i += 3){ const j = md(i), dx = px - x[j], dy = py - y[j], d2 = dx * dx + dy * dy; if(d2 < best){ best = d2; bi = j; } }
          if(bi < 0) continue;
          const lat = ((px - x[bi]) * nx[bi] + (py - y[bi]) * ny[bi]) * b.lado, base = m + escDe(bi, b.lado) + b.dist;
          if(lat > base - 1 && lat < base + b.larg + 1 && best - lat * lat < 200) return true;
        }
        return false;
      };
      /* a terra firme em volta de cada pedaço da pista (por cima da água, quando outro trecho passa por ela) */
      if(A.bandas.length) A.faixas = P.pedacos.map(pd => {
        const p = new Path2D();
        for(let i = pd.i0; i <= pd.i1 + 1; i++){ const q = pt(i, m + escDe(i, 1) + 6); i === pd.i0 ? p.moveTo(q[0], q[1]) : p.lineTo(q[0], q[1]); }
        for(let i = pd.i1 + 1; i >= pd.i0; i--){ const q = pt(i, -(m + escDe(i, -1) + 6)); p.lineTo(q[0], q[1]); }
        p.closePath(); return p;
      });
      /* ── o miolo: os pontos de dentro do traçado mais longe da pista (para o lago, o estádio, o golfe) ── */
      let cand = null;
      const interior = () => {
        const cx = P.caixa, am = [], out = []; for(let i = 0; i < n; i += 3) am.push(i);
        for(let a = 1; a < 26; a++) for(let b = 1; b < 26; b++){
          const px = cx.x0 + (cx.x1 - cx.x0) * a / 26, py = cx.y0 + (cx.y1 - cx.y0) * b / 26;
          let dentro = false, dmin = 1e9;
          for(let k = 0; k < am.length; k++){
            const i = am[k], j = am[(k + 1) % am.length];
            if((y[i] > py) !== (y[j] > py) && px < (x[j] - x[i]) * (py - y[i]) / (y[j] - y[i]) + x[i]) dentro = !dentro;
            const d = Math.hypot(px - x[i], py - y[i]) - m - Math.max(P.escE[i], P.escD[i]); if(d < dmin) dmin = d;
          }
          if(dentro && dmin > 20) out.push({ x: px, y: py, d: dmin });
        }
        return out.sort((p, q) => q.d - p.d);
      };
      const pega = rMin => { cand = cand || interior(); return cand.find(q => q.d > rMin + 8 && !emAgua(q.x, q.y) && !ocup.some(o => Math.hypot(o.x - q.x, o.y - q.y) < o.r + rMin)) || null; };
      const bolha = (cx, cy, r, sem) => { const p = new Path2D(), f1 = sem * 6.3, f2 = sem * 17; for(let k = 0; k <= 48; k++){ const a = k / 48 * Math.PI * 2, raio = r * (1 + .16 * Math.sin(3 * a + f1) + .09 * Math.sin(5 * a + f2)), px = cx + Math.cos(a) * raio, py = cy + Math.sin(a) * raio * .82; k ? p.lineTo(px, py) : p.moveTo(px, py); } p.closePath(); return p; };
      if(tm.estadio){ const c = pega(80); if(c){ const r = Math.min(c.d - 10, 100); A.marcos.push({ tipo: 'estadio', x: c.x, y: c.y, r, a: rnd() * 3.14 }); ocup.push({ x: c.x, y: c.y, r: r + 6 }); } }
      if(tm.esfera){ const c = pega(52); if(c){ A.marcos.push({ tipo: 'esfera', x: c.x, y: c.y, r: 44 }); ocup.push({ x: c.x, y: c.y, r: 52 }); } }
      if(tm.lago){ const c = pega(24); if(c){ const r = Math.min((c.d - 10) / 1.3, tm.lagoR || 90); if(r >= 16){ A.lagos.push({ x: c.x, y: c.y, r, path: bolha(c.x, c.y, r, rnd()) }); ocup.push({ x: c.x, y: c.y, r: r * 1.3 }); } } }
      if(tm.golfe) for(let q = 0; q < 3; q++){ const c = pega(30); if(c){ A.marcos.push({ tipo: 'golfe', x: c.x, y: c.y, r: 26, a: rnd() * 3.14 }); ocup.push({ x: c.x, y: c.y, r: 34 }); } }
      /* ── arquibancadas a mais: o estádio em volta de um trecho, o anel de Bristol ── */
      if(tm.semArq) cen.arquib.length = 0;
      for(const e of (tm.arqExtra || [])) for(const lado of e.lado ? [ladoDe(e.lado)] : [1, -1]) for(let s = e.f0 * L; s < e.f1 * L - 40; s += 112) aj.fazArquib(s, Math.min(e.f1 * L, s + 104), lado, e.prof || 16);
      if(tm.anel) for(let s = 150; s < L - 250; s += 118) aj.fazArquib(s, s + 110, -(P.dentro || 1), 28);
      /* ── o estacionamento atrás da arquibancada da reta ── */
      if(tm.estac && cen.arquib.length){
        const lado = -ladoBox, prof = P.oval ? 26 : 16, dent = [], fora = []; let ok = true;
        for(let s = -200; s <= 100 && ok; s += 10){
          const i = Math.floor(((s % L) + L) % L / P.ds) % n, d0 = m + escDe(i, lado) + 3 + prof + 5, a = C2D.Pista.ponto(P, s, lado * d0), b = C2D.Pista.ponto(P, s, lado * (d0 + 34));
          if(!aj.livre(b.x, b.y, 2) || emAgua(b.x, b.y) || ocup.some(o => Math.hypot(o.x - b.x, o.y - b.y) < o.r)) ok = false;
          dent.push(a); fora.push(b);
        }
        if(ok){
          const p = new Path2D(); dent.forEach((q, k) => k ? p.lineTo(q.x, q.y) : p.moveTo(q.x, q.y)); for(let k = fora.length - 1; k >= 0; k--) p.lineTo(fora[k].x, fora[k].y); p.closePath();
          A.estac.push(p);
          dent.forEach((q, k) => ocup.push({ x: (q.x + fora[k].x) / 2, y: (q.y + fora[k].y) / 2, r: 20 }));
        }
      }
      /* ── o camping de motorhomes no miolo dos ovais ── */
      if(tm.camping && L > 1200){
        const ld = P.dentro || 1, d0 = 44, d1 = d0 + Math.min(70, L / 60), p = new Path2D();
        for(let i = 0; i <= n; i += 3){ const q = pt(i, ld * (m + escDe(i, ld) + d0)); i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1]); }
        p.closePath();
        for(let i = n; i >= 0; i -= 3){ const q = pt(i, ld * (m + escDe(i, ld) + d1)); i === n ? p.moveTo(q[0], q[1]) : p.lineTo(q[0], q[1]); }
        p.closePath(); A.camping = p;
      }
      /* nada de árvore, prédio ou arquibancada dentro da água, do lago ou de um marco */
      const tomado = (px, py) => emAgua(px, py) || ocup.some(o => Math.hypot(o.x - px, o.y - py) < o.r);
      A.tomado = tomado;
      for(const pp of cen.porPedaco){ pp.arvores = pp.arvores.filter(t => !tomado(t.x, t.y)); pp.predios = pp.predios.filter(b => !tomado(b.x, b.y)); }
      cen.arquib = cen.arquib.filter(a => !emAgua((a.x0 + a.x1) / 2, (a.y0 + a.y1) / 2));
      /* ── as placas de publicidade: nas retas, na frente da barreira ── */
      A.placas = tm.placas ? P.pedacos.map(pd => {
        const p = new Path2D();
        for(const lado of [1, -1]){
          let on = false;
          for(let i = pd.i0; i <= pd.i1 + 1; i++){
            const j = md(i);
            if(Math.abs(P.k[j]) > 1 / 300 || aj.naBox(j, lado)){ on = false; continue; }
            const q = pt(i, lado * (m + escDe(j, lado) - .32)); on ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1]); on = true;
          }
        }
        return p;
      }) : null;
      /* ── os postos dos fiscais (a cada ~190 m, um lado de cada vez) e os postes de luz (à noite) ── */
      A.postos = P.pedacos.map(() => []); A.luzes = P.pedacos.map(() => []);
      const pedDe = i => Math.min(P.pedacos.length - 1, Math.floor(i / 24));
      if(tm.era !== 'antiga' && !P.kart) for(let s = 90, q = 0; s < L - 60; s += 190, q++){
        const lado = q % 2 ? 1 : -1, i = Math.floor(s / P.ds) % n; if(aj.naBox(i, lado)) continue;
        const [px, py] = pt(i, lado * (m + escDe(i, lado) + 2.4)); if(tomado(px, py)) continue;
        A.postos[pedDe(i)].push({ x: px, y: py, hd: P.hd[i] });
      }
      if(tm.noite){
        const passo = Math.max(2, Math.round(30 / P.ds));
        for(let i = 0, q = 0; i < n; i += passo, q++){ const lado = q % 2 ? 1 : -1; if(aj.naBox(i, lado)) continue; const [px, py] = pt(i, lado * (m + escDe(i, lado) + 2.6)); A.luzes[pedDe(i)].push([px, py]); }
        /* o recorte de luz de cada pedaço: a pista com as áreas de escape, e a pista em si (mais clara) */
        A.halo = P.pedacos.map(pd => [8, -1].map(mais => {
          const p = new Path2D();
          for(let i = pd.i0; i <= pd.i1 + 1; i++){ const q = pt(i, m + (mais > 0 ? escDe(i, 1) + mais : 2)); i === pd.i0 ? p.moveTo(q[0], q[1]) : p.lineTo(q[0], q[1]); }
          for(let i = pd.i1 + 1; i >= pd.i0; i--){ const q = pt(i, -(m + (mais > 0 ? escDe(i, -1) + mais : 2))); p.lineTo(q[0], q[1]); }
          p.closePath(); return p;
        }));
      }
      /* ── os marcos de cada lugar ── */
      for(const b of (tm.pontes || [])){ const i = md(Math.round(b.f * n)), a = pt(i, m + escDe(i, 1) + 2.2), c = pt(i, -(m + escDe(i, -1) + 2.2)); A.pontes.push({ ax: a[0], ay: a[1], bx: c[0], by: c[1], larg: b.larg || 3.6, cor: b.cor, hotel: !!b.hotel }); }
      if(tm.roda){ const i = md(Math.round(tm.roda.f * n)), lado = ladoDe(tm.roda.lado), [px, py] = pt(i, lado * (m + escDe(i, lado) + tm.roda.dist)); if(aj.livre(px, py, 20) && !tomado(px, py)) A.roda = { x: px, y: py, hd: P.hd[i], R: tm.roda.R }; }
      if(tm.tijolos){
        const c = [C2D.Pista.ponto(P, -1.4, -m), C2D.Pista.ponto(P, -1.4, m), C2D.Pista.ponto(P, -.45, m), C2D.Pista.ponto(P, -.45, -m)], p = new Path2D(), meio = new Path2D();
        p.moveTo(c[0].x, c[0].y); c.slice(1).forEach(q => p.lineTo(q.x, q.y)); p.closePath();
        const a = C2D.Pista.ponto(P, -.92, -m), b = C2D.Pista.ponto(P, -.92, m); meio.moveTo(a.x, a.y); meio.lineTo(b.x, b.y);
        A.tijolos = { p, meio };
      }
      /* o nome do circuito: no pórtico da largada e no telhado dos boxes; a torre de controle (ou o pagode) na linha */
      if(tm.nome && typeof document !== 'undefined'){
        A.nomeP = texto(tm.nome, '#f4f2ec'); cen.portico.larg = 2.6;
        if(cen.boxes){
          const d0 = B.d + B.larg / 2 + 1.2, t = C2D.Pista.ponto(P, B.ini + B.comp / 2 - 40, ladoBox * (d0 + 13.4));
          A.nomeT = texto(tm.nome, '#2a2d33'); A.teto = { x: t.x, y: t.y, hd: t.hd, alt: 3.2 };
          if(tm.era !== 'antiga'){ const q = C2D.Pista.ponto(P, 3, ladoBox * (d0 + 8)); A.torre = { x: q.x, y: q.y, hd: q.hd, pagode: tm.pagode, pts: [] }; }
        }
      }
    },

    /* ── o que fica debaixo de tudo: a água, a terra firme em volta da pista, o cais e os barcos ── */
    fundo(ctx, R, vis){
      const A = R.cen && R.cen.amb; if(!A || !A.bandas.length) return;
      const P = R.P, T = C2D.Cenario.texturas();
      ctx.fillStyle = pad(ctx, 'agua', .12);
      for(const b of A.bandas) ctx.fill(b.path);
      ctx.fillStyle = P.tipo === 'street' ? pad(ctx, 'rua', .2) : pad(ctx, 'grama', .25);
      for(const p of vis) ctx.fill(A.faixas[p.idx]);
      ctx.lineJoin = 'round'; ctx.lineCap = 'butt';
      for(const b of A.bandas){ ctx.strokeStyle = 'rgba(0,30,50,.3)'; ctx.lineWidth = 3.4; ctx.stroke(b.cais); ctx.strokeStyle = '#d9d4c6'; ctx.lineWidth = 1.5; ctx.stroke(b.cais); }
      for(const b of A.barcos){
        if(Math.abs(b.x - R.cam.x) > R.raio + 20 || Math.abs(b.y - R.cam.y) > R.raio + 20) continue;
        const s = T.barcos[b.v];
        ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.a); ctx.drawImage(s.cv, -s.w / 2, -s.h / 2, s.w, s.h); ctx.restore();
      }
    },

    /* ── no chão, longe da pista: lago, camping, estacionamento, estádio, golfe e os tijolos ── */
    chao(ctx, R, vis){
      const A = R.cen && R.cen.amb; if(!A) return;
      const ve = (x, y, r) => Math.abs(x - R.cam.x) < R.raio + r && Math.abs(y - R.cam.y) < R.raio + r;
      for(const l of A.lagos){
        if(!ve(l.x, l.y, l.r * 1.4)) continue;
        ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(214,198,150,.9)'; ctx.lineWidth = 3; ctx.stroke(l.path);
        ctx.fillStyle = pad(ctx, 'agua', .12); ctx.fill(l.path);
        ctx.strokeStyle = 'rgba(0,30,50,.28)'; ctx.lineWidth = 1.2; ctx.stroke(l.path);
      }
      if(A.camping){ ctx.fillStyle = pad(ctx, 'camping', 1 / 16); ctx.fill(A.camping); }
      for(const e of A.estac){ ctx.fillStyle = 'rgba(10,16,12,.3)'; ctx.save(); ctx.translate(.5, -.5); ctx.fill(e); ctx.restore(); ctx.fillStyle = pad(ctx, 'estac', 1 / 16); ctx.fill(e); ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = .3; ctx.stroke(e); }
      for(const k of A.marcos){
        if(!ve(k.x, k.y, k.r + 30)) continue;
        ctx.save(); ctx.translate(k.x, k.y);
        if(k.tipo === 'estadio'){
          /* a sombra, a arquibancada em três anéis, o gramado com as linhas e a cobertura */
          const w = k.r, h = k.r * .82, cores = R.cen.tema.cinta;
          ctx.save(); ctx.translate(5, -5); ctx.rotate(k.a); ctx.fillStyle = 'rgba(10,16,12,.32)'; rr(ctx, -w, -h, w * 2, h * 2, h * .5); ctx.fill(); ctx.restore();
          ctx.rotate(k.a);
          ctx.fillStyle = '#c3c7cd'; rr(ctx, -w, -h, w * 2, h * 2, h * .5); ctx.fill();
          ['#8f959d', cores[1], '#7d838b'].forEach((cor, q) => { const f = .9 - q * .13; ctx.fillStyle = cor; rr(ctx, -w * f, -h * f, w * 2 * f, h * 2 * f, h * .42 * f); ctx.fill(); });
          ctx.fillStyle = '#3f9a45'; rr(ctx, -w * .5, -h * .4, w, h * .8, 2); ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = .5; ctx.strokeRect(-w * .46, -h * .36, w * .92, h * .72); ctx.beginPath(); ctx.moveTo(0, -h * .36); ctx.lineTo(0, h * .36); ctx.moveTo(h * .12, 0); ctx.arc(0, 0, h * .12, 0, 6.3); ctx.stroke();
          ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = .4; rr(ctx, -w, -h, w * 2, h * 2, h * .5); ctx.stroke();
        } else if(k.tipo === 'golfe'){
          ctx.rotate(k.a);
          ctx.fillStyle = 'rgba(150,205,110,.55)'; ctx.beginPath(); ctx.ellipse(0, 0, k.r, k.r * .5, 0, 0, 6.3); ctx.fill();
          ctx.fillStyle = '#9bd675'; ctx.beginPath(); ctx.ellipse(k.r * .5, 0, k.r * .3, k.r * .26, 0, 0, 6.3); ctx.fill();
          ctx.fillStyle = '#e6d7a8'; ctx.beginPath(); ctx.ellipse(k.r * .1, k.r * .34, k.r * .2, k.r * .11, .4, 0, 6.3); ctx.fill(); ctx.beginPath(); ctx.ellipse(k.r * .78, -k.r * .26, k.r * .13, k.r * .09, -.5, 0, 6.3); ctx.fill();
          ctx.fillStyle = '#d6311f'; ctx.beginPath(); ctx.arc(k.r * .52, 0, .45, 0, 6.3); ctx.fill();
        }
        ctx.restore();
      }
      if(A.tijolos){ ctx.fillStyle = '#9c4a34'; ctx.fill(A.tijolos.p); ctx.strokeStyle = 'rgba(60,25,15,.55)'; ctx.lineWidth = .95; ctx.setLineDash([.24, .1]); ctx.stroke(A.tijolos.meio); ctx.setLineDash([]); ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = .05; ctx.stroke(A.tijolos.p); }
    },

    /* ── as barreiras de época: fardos de feno, guard-rail com alambrado, cerca de madeira ── */
    barreira(ctx, R, vis, tipo, sombra, todos){
      const tm = R.cen.tema;
      ctx.lineCap = 'butt';
      if(tipo === 'feno'){
        sombra(() => todos('muros', 'rgba(20,16,8,.3)', 1.3), .35);
        todos('muros', pad(ctx, 'feno', 1.32 / 64), .8);
        todos('murosFora', '#e9e4d6', .12); todos('murosFora', '#8a7d68', .22, [.14, 2.4]);
      } else if(tipo === 'armco'){
        sombra(() => todos('muros', 'rgba(10,18,10,.3)', .7), .4);
        todos('muros', '#7d838a', .42); todos('muros', tm.guard, .26); ctx.save(); ctx.translate(-.05, .05); todos('muros', 'rgba(255,255,255,.55)', .07); ctx.restore();
        todos('muros', '#4f555c', .5, [.16, 3.4]);
        todos('murosFora', 'rgba(200,205,212,.5)', .06); todos('murosFora', '#4a4f56', .22, [.12, 2.9]);
      } else {
        sombra(() => todos('muros', 'rgba(20,16,8,.28)', .5), .35);
        todos('muros', '#efece4', .2); todos('muros', '#b9b3a4', .34, [.14, 2.2]);
      }
      ctx.setLineDash([]); ctx.lineDashOffset = 0;
    },

    /* ── junto das barreiras, rente ao chão: as placas, o pé dos postos dos fiscais e dos postes de luz ── */
    barreiras(ctx, R, vis){
      const A = R.cen && R.cen.amb; if(!A) return;
      const tm = R.cen.tema;
      if(A.placas){
        const c = tm.placas, nc = c.length;
        ctx.lineCap = 'butt'; ctx.lineWidth = .4;
        for(let k = 0; k < nc; k++){ ctx.strokeStyle = c[k]; ctx.setLineDash([7, 8 * nc - 7]); ctx.lineDashOffset = -8 * k; for(const p of vis) ctx.stroke(A.placas[p.idx]); }
        ctx.setLineDash([]); ctx.lineDashOffset = 0;
        ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = .06; for(const p of vis) ctx.stroke(A.placas[p.idx]);
      }
      /* o posto dos fiscais: a laje, dois fiscais de laranja e a bandeira (o teto fica no andar 1) */
      for(const p of (R.visLargo || vis)) for(const q of A.postos[p.idx]){
        if(!R.visivel(q.x - 4, q.y - 4, q.x + 4, q.y + 4)) continue;
        ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.hd);
        ctx.fillStyle = '#62676e'; ctx.fillRect(-1.5, -1.15, 3, 2.3);
        ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(-1.2, -.9, 2.4, 1.8);
        for(const [x, y] of [[1.9, -.45], [2.05, .5]]){
          ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.arc(x + .12, y - .1, .3, 0, 6.3); ctx.fill();
          ctx.fillStyle = '#f08a1a'; ctx.beginPath(); ctx.ellipse(x, y, .3, .22, 0, 0, 6.3); ctx.fill();
          ctx.fillStyle = '#f4f2ec'; ctx.beginPath(); ctx.arc(x, y, .14, 0, 6.3); ctx.fill();
        }
        ctx.fillStyle = '#f2c61f'; ctx.fillRect(2.2, .62, .7, .45); ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = .05; ctx.strokeRect(2.2, .62, .7, .45);
        ctx.restore();
      }
      if(tm.noite){ ctx.fillStyle = '#2f3339'; for(const p of (R.visLargo || vis)) for(const l of A.luzes[p.idx]){ if(!R.visivel(l[0] - 1, l[1] - 1, l[0] + 1, l[1] + 1)) continue; ctx.beginPath(); ctx.arc(l[0], l[1], .34, 0, 6.3); ctx.fill(); } }
    },

    /* ── as sombras do que é do lugar (formas cheias; o cenário junta com as dele) ── */
    sombras(g, R, vis, sol){
      const A = R.cen && R.cen.amb; if(!A) return;
      const Rel = C2D.Relevo, ALT = Rel.ALT, tm = R.cen.tema, largo = R.visLargo || vis;
      const ve = (x, y, r) => R.visivel(x - r, y - r, x + r, y + r);
      if(A.placas){ g.save(); g.translate(sol.x * 1.1, sol.y * 1.1); g.lineCap = 'butt'; g.lineWidth = .55; g.setLineDash([7, 1]); g.globalAlpha = .8; for(const p of vis) g.stroke(A.placas[p.idx]); g.restore(); g.setLineDash([]); }
      for(const p of largo){
        for(const q of A.postos[p.idx]) if(ve(q.x, q.y, 8)) Rel.varrido(g, q.pts || (q.pts = caixa(q.x, q.y, q.hd, 1.2, .9)), sol.x * ALT[1], sol.y * ALT[1]);
        if(tm.noite) for(const l of A.luzes[p.idx]){ if(!ve(l[0], l[1], 14)) continue; g.lineCap = 'round'; g.lineWidth = .3; g.beginPath(); g.moveTo(l[0], l[1]); g.lineTo(l[0] + sol.x * ALT[3], l[1] + sol.y * ALT[3]); g.stroke(); }
      }
      if(A.torre && ve(A.torre.x, A.torre.y, 40)){
        const t = A.torre, tam = t.pagode ? TORRE_P : TORRE;
        for(let q = 0; q < 3; q++) Rel.varrido(g, caixa(t.x, t.y, t.hd, tam[q], tam[q]), sol.x * ALT[q + 2], sol.y * ALT[q + 2]);
      }
      for(const b of A.pontes){
        const h = ALT[b.hotel ? 3 : 2], ox = sol.x * h, oy = sol.y * h, mx = (b.ax + b.bx) / 2, my = (b.ay + b.by) / 2;
        if(!ve(mx + ox / 2, my + oy / 2, Math.hypot(b.ax - b.bx, b.ay - b.by) / 2 + h + b.larg)) continue;
        g.lineCap = 'butt'; g.lineWidth = b.larg; g.beginPath(); g.moveTo(b.ax + ox, b.ay + oy); g.lineTo(b.bx + ox, b.by + oy); g.stroke();
        g.lineCap = 'round'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(b.ax, b.ay); g.lineTo(b.ax + ox, b.ay + oy); g.moveTo(b.bx, b.by); g.lineTo(b.bx + ox, b.by + oy); g.stroke();
      }
      if(A.roda && ve(A.roda.x, A.roda.y, A.roda.R * 2.4)){
        /* a roda-gigante: a sombra do aro no chão é uma elipse comprida */
        const w = A.roda, Rr = w.R;
        g.save(); g.translate(w.x + sol.x * Rr * .55, w.y + sol.y * Rr * .55); g.rotate(w.hd); g.globalAlpha = .75; g.lineWidth = 1.8; g.beginPath(); g.ellipse(0, 0, Rr, Rr * .45, 0, 0, 6.3); g.stroke();
        g.lineWidth = .5; g.beginPath(); for(let q = 0; q < 8; q++){ const a = q / 8 * 6.283; g.moveTo(0, 0); g.lineTo(Math.cos(a) * Rr, Math.sin(a) * Rr * .45); } g.stroke(); g.restore();
      }
      for(const k of A.marcos){
        if(!ve(k.x, k.y, k.r * 2.2)) continue;
        if(k.tipo === 'esfera'){ g.beginPath(); g.ellipse(k.x + sol.x * k.r * .6, k.y + sol.y * k.r * .6, k.r * 1.25, k.r * .95, Math.atan2(sol.y, sol.x), 0, 6.3); g.fill(); }
        else if(k.tipo === 'estadio'){ const pts = []; for(let q = 0; q < 20; q++){ const a = q / 20 * 6.283, c = Math.cos(k.a), s = Math.sin(k.a), u = Math.cos(a) * k.r, w = Math.sin(a) * k.r * .82; pts.push([k.x + u * c - w * s, k.y + u * s + w * c]); } Rel.varrido(g, pts, sol.x * ALT[3], sol.y * ALT[3]); }
      }
    },

    /* ── em que andares o lugar tem alguma coisa ── */
    indexar(P, cen, marca){
      const A = cen.amb; if(!A) return;
      for(const l of A.postos) for(const q of l) marca(1, q.x - 3, q.y - 3, q.x + 3, q.y + 3);
      if(A.teto) marca(2, A.teto.x - 60, A.teto.y - 60, A.teto.x + 60, A.teto.y + 60);
      if(A.torre) for(let k = 2; k <= 4; k++) marca(k, A.torre.x - 9, A.torre.y - 9, A.torre.x + 9, A.torre.y + 9);
      for(const b of A.pontes) marca(b.hotel ? 3 : 2, Math.min(b.ax, b.bx) - b.larg, Math.min(b.ay, b.by) - b.larg, Math.max(b.ax, b.bx) + b.larg, Math.max(b.ay, b.by) + b.larg);
      for(const k of A.marcos) if(k.tipo === 'estadio') marca(3, k.x - k.r, k.y - k.r, k.x + k.r, k.y + k.r);
    },

    /* ── o que o lugar tem em cada andar (pintado plano; a escala da altura é de quem chama) ── */
    andar(ctx, R, vis, k){
      const A = R.cen && R.cen.amb; if(!A) return;
      const ve = (x, y, r) => R.visivel(x - r, y - r, x + r, y + r);
      if(k === 1){
        /* o teto dos postos dos fiscais */
        for(const p of (R.visLargo || vis)) for(const q of A.postos[p.idx]){
          if(!ve(q.x, q.y, 3)) continue;
          ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.hd);
          ctx.fillStyle = '#f08a1a'; ctx.fillRect(-1.2, -.9, 2.4, 1.8); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(-1.2, .45, 2.4, .45);
          ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = .1; ctx.strokeRect(-1.2, -.9, 2.4, 1.8);
          ctx.restore();
        }
      }
      if(k === 2){
        /* o nome do circuito no telhado dos boxes */
        if(A.teto && ve(A.teto.x, A.teto.y, 60)) escrever(ctx, A.nomeT, A.teto.x, A.teto.y, A.teto.hd, A.teto.alt, .8);
        /* o pórtico da largada com o nome do circuito e a caixa das luzes */
        const g = R.cen.portico;
        if(A.nomeP && g && ve((g.x0 + g.x1) / 2, (g.y0 + g.y1) / 2, 40)){
          viga(ctx, g.x0, g.y0, g.x1, g.y1, comp => {
            ctx.fillStyle = '#1c1f24'; ctx.fillRect(-comp / 2, -1.3, comp, 2.6);
            ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fillRect(-comp / 2, 1, comp, .3);
            const alt = Math.min(1.7, (comp - 5) / A.nomeP.prop);
            ctx.save(); ctx.scale(1, -1); ctx.drawImage(A.nomeP.cv, -alt * A.nomeP.prop / 2, -alt / 2 - .1, alt * A.nomeP.prop, alt); ctx.restore();
            ctx.fillStyle = '#3a3e45'; ctx.fillRect(-comp / 2 - .9, -1.7, 1.8, 3.4); ctx.fillRect(comp / 2 - .9, -1.7, 1.8, 3.4);
          });
          for(const l of g.luzes){ ctx.fillStyle = '#0c0d0f'; ctx.beginPath(); ctx.arc(l.x, l.y, .34, 0, Math.PI * 2); ctx.fill(); }
        }
      }
      /* as pontes sobre a pista (a casca do hotel fica um andar acima) */
      for(const b of A.pontes){
        if((b.hotel ? 3 : 2) !== k || !ve((b.ax + b.bx) / 2, (b.ay + b.by) / 2, 60)) continue;
        viga(ctx, b.ax, b.ay, b.bx, b.by, comp => {
          const h = b.larg / 2;
          ctx.fillStyle = b.cor[0]; ctx.fillRect(-comp / 2, -h, comp, b.larg);
          if(b.hotel){
            /* a casca em treliça do hotel sobre a pista */
            ctx.strokeStyle = rgba(b.cor[1], .7); ctx.lineWidth = .3; ctx.beginPath();
            for(let q = -comp / 2 - b.larg; q < comp / 2; q += 3){ ctx.moveTo(Math.max(-comp / 2, q), q < -comp / 2 ? -h + (-comp / 2 - q) : -h); ctx.lineTo(Math.min(comp / 2, q + b.larg), q + b.larg > comp / 2 ? h - (q + b.larg - comp / 2) : h); ctx.moveTo(Math.max(-comp / 2, q), q < -comp / 2 ? h - (-comp / 2 - q) : h); ctx.lineTo(Math.min(comp / 2, q + b.larg), q + b.larg > comp / 2 ? -h + (q + b.larg - comp / 2) : -h); }
            ctx.stroke();
          } else {
            ctx.fillStyle = b.cor[1]; for(let q = -comp / 2 + 1.5; q < comp / 2 - 2; q += 5) ctx.fillRect(q, -h + .5, 2.5, b.larg - 1);
          }
          ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(-comp / 2, h - .3, comp, .3); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(-comp / 2, -h, comp, .3);
          ctx.fillStyle = '#3a3e45'; ctx.fillRect(-comp / 2 - 1.2, -h - .6, 2.4, b.larg + 1.2); ctx.fillRect(comp / 2 - 1.2, -h - .6, 2.4, b.larg + 1.2);
        });
      }
      /* a torre de controle: três corpos, um em cada andar (o pagode tem os telhados escuros) */
      if(A.torre && k >= 2 && ve(A.torre.x, A.torre.y, 9)){
        const t = A.torre, q = k - 2, s = (t.pagode ? TORRE_P : TORRE)[q];
        ctx.save(); ctx.translate(t.x, t.y); ctx.rotate(t.hd);
        ctx.fillStyle = t.pagode ? (q === 1 ? '#3f434a' : '#e9e4d6') : (q === 1 ? '#7fa6c4' : '#e3e6ea'); ctx.fillRect(-s, -s, s * 2, s * 2);
        ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fillRect(-s, s - .5, s * 2, .5); ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.fillRect(-s, -s, s * 2, .5);
        ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = .16; ctx.strokeRect(-s, -s, s * 2, s * 2);
        if(q === 2){ ctx.fillStyle = '#d6311f'; ctx.beginPath(); ctx.arc(0, 0, .5, 0, 6.3); ctx.fill(); ctx.strokeStyle = '#3a3e45'; ctx.lineWidth = .12; ctx.beginPath(); ctx.moveTo(-s * .6, 0); ctx.lineTo(s * .6, 0); ctx.moveTo(0, -s * .6); ctx.lineTo(0, s * .6); ctx.stroke(); }
        ctx.restore();
      }
      /* a cobertura do estádio */
      if(k === 3) for(const m of A.marcos){
        if(m.tipo !== 'estadio' || !ve(m.x, m.y, m.r + 10)) continue;
        const w = m.r, h = m.r * .82;
        ctx.save(); ctx.translate(m.x, m.y); ctx.rotate(m.a);
        ctx.strokeStyle = '#eef0f2'; ctx.lineWidth = w * .11; rr(ctx, -w * .95, -h * .95, w * 1.9, h * 1.9, h * .46); ctx.stroke();
        ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = .3; rr(ctx, -w, -h, w * 2, h * 2, h * .5); ctx.stroke(); rr(ctx, -w * .89, -h * .89, w * 1.78, h * 1.78, h * .42); ctx.stroke();
        ctx.restore();
      }
    },

    /* ── a cada quadro: as paredes e os pilares do que é do lugar (mudam com a câmera) ── */
    paredes(ctx, R, vis, naTela, quad){
      const A = R.cen && R.cen.amb; if(!A) return;
      const Rel = C2D.Relevo, rv = R.rv, v = R.vista, tm = R.cen.tema;
      /* a torre: as paredes de cada corpo (o de cima nasce no telhado do de baixo) */
      if(A.torre && naTela(A.torre.x, A.torre.y, 40 * v.z)){
        const t = A.torre, tam = t.pagode ? TORRE_P : TORRE;
        for(let q = 0; q < 3; q++){
          const clara = t.pagode ? '#d8d2c2' : q === 1 ? '#8fb3cf' : '#c9cdd4', escura = t.pagode ? '#a39d8e' : q === 1 ? '#5f86a6' : '#8f949c';
          Rel.paredes(R, t.pts[q] || (t.pts[q] = caixa(t.x, t.y, t.hd, tam[q], tam[q])), rv.s[q + 2], (a, b, a2, b2, luz) => { ctx.fillStyle = luz > 0 ? clara : escura; quad(a, b, b2, a2); }, q ? rv.s[q + 1] : 0);
        }
      }
      /* os pilares das pontes e os mastros dos postes de luz, num traço só */
      const pl = new Path2D(); let tem = false;
      for(const b of A.pontes){
        if(!naTela((b.ax + b.bx) / 2, (b.ay + b.by) / 2, 70 * v.z)) continue;
        const f = rv.s[b.hotel ? 3 : 2];
        for(const [x, y] of [[b.ax, b.ay], [b.bx, b.by]]){ pl.moveTo(x, y); pl.lineTo(rv.x + (x - rv.x) * f, rv.y + (y - rv.y) * f); }
        tem = true;
      }
      if(tem){ ctx.strokeStyle = '#3a3e45'; ctx.lineWidth = 1.3; ctx.lineCap = 'round'; ctx.stroke(pl); ctx.lineCap = 'butt'; }
      if(tm.noite){
        const pm = new Path2D(), f = rv.s[3]; let temM = false;
        for(const p of vis) for(const l of A.luzes[p.idx]){ if(!naTela(l[0], l[1], 14 * v.z)) continue; pm.moveTo(l[0], l[1]); pm.lineTo(rv.x + (l[0] - rv.x) * f, rv.y + (l[1] - rv.y) * f); temM = true; }
        if(temM){ ctx.strokeStyle = '#43474e'; ctx.lineWidth = .26; ctx.stroke(pm); }
      }
      /* os postos dos fiscais: as paredes que aparecem */
      for(const p of vis) for(const q of A.postos[p.idx]){
        if(!naTela(q.x, q.y, 6 * v.z)) continue;
        Rel.paredes(R, q.pts || (q.pts = caixa(q.x, q.y, q.hd, 1.2, .9)), rv.s[1], (a, b, a2, b2, luz) => { ctx.fillStyle = luz > 0 ? '#d97a14' : '#a85c0c'; quad(a, b, b2, a2); });
      }
    },

    /* ── por cima de tudo: a roda-gigante, a esfera; e a noite ── */
    alto(ctx, R, vis, naTela){
      const A = R.cen && R.cen.amb; if(!A) return;
      const tm = R.cen.tema, Rel = C2D.Relevo, rv = R.rv, v = R.vista;
      if(A.roda && naTela(A.roda.x, A.roda.y, A.roda.R * 2.2 * v.z)){
        /* a roda-gigante de cima: as pernas sobem do chão até o eixo, e o aro (visto de topo) com as cabines lá no alto */
        const w = A.roda, Rr = w.R, f = Rel.esc(R, 16), ex = rv.x + (w.x - rv.x) * f, ey = rv.y + (w.y - rv.y) * f, c = Math.cos(w.hd), s = Math.sin(w.hd);
        ctx.strokeStyle = '#5c6169'; ctx.lineWidth = .8; ctx.lineCap = 'round'; ctx.beginPath();
        for(const [u, q] of [[-7, 9], [7, 9], [-7, -9], [7, -9]]){ ctx.moveTo(w.x + u * c - q * s, w.y + u * s + q * c); ctx.lineTo(ex, ey); }
        ctx.stroke(); ctx.lineCap = 'butt';
        ctx.save(); ctx.translate(ex, ey); ctx.rotate(w.hd); ctx.scale(f, f);
        ctx.fillStyle = '#e9ecef'; ctx.fillRect(-Rr, -1.1, Rr * 2, 2.2);
        const cores = ['#d6311f', '#f2c61f', '#1f6fbf', '#f4f2ec'];
        for(let q = 0, nq = Math.round(Rr / 2.2); q <= nq; q++){ ctx.fillStyle = cores[q % 4]; ctx.fillRect(-Rr + q * (2 * Rr / nq) - 1.1, -2, 2.2, 4); }
        ctx.fillStyle = '#3a3e45'; ctx.fillRect(-2.2, -3.2, 4.4, 6.4);
        ctx.restore();
      }
      for(const k of A.marcos){
        if(k.tipo !== 'esfera' || !naTela(k.x, k.y, (k.r * 2 + 30) * v.z)) continue;
        /* a esfera de telas: três fatias, cada uma mais alta e menor, e os anéis de luz no topo */
        const fat = [[6, 1, '#141a3a'], [20, .86, '#22408f'], [34, .55, '#3f63d0']];
        for(const [h, fr, cor] of fat){ const f = Rel.esc(R, h); ctx.fillStyle = cor; ctx.beginPath(); ctx.arc(rv.x + (k.x - rv.x) * f, rv.y + (k.y - rv.y) * f, k.r * fr * f, 0, 6.3); ctx.fill(); }
        const f = Rel.esc(R, 38), x = rv.x + (k.x - rv.x) * f, y = rv.y + (k.y - rv.y) * f, r = k.r * .5 * f;
        const gr = ctx.createRadialGradient(x - r * .3, y + r * .3, r * .1, x, y, r); gr.addColorStop(0, '#9a7cf5'); gr.addColorStop(.6, '#4f7fe0'); gr.addColorStop(1, 'rgba(63,99,208,0)');
        ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.3); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.16)'; ctx.lineWidth = .4; for(let q = 1; q < 4; q++){ ctx.beginPath(); ctx.arc(x, y, r * q / 4, 0, 6.3); ctx.stroke(); }
      }
      if(tm.noite && A.halo) C2D.Ambiente.noite(ctx, R, vis, A, tm);
    },

    /* ── a noite: uma camada escura em baixa resolução; a pista, os postes, as arquibancadas, os boxes e os
       carros recortam a luz nela. Um desenho pequeno e uma cópia ampliada por quadro (a ampliação já suaviza) ── */
    noite(ctx, R, vis, A, tm){
      const T = C2D.Cenario.texturas(), cw = R.cv.width, ch = R.cv.height, lw = Math.max(64, Math.ceil(cw / 6)), lh = Math.max(40, Math.ceil(ch / 6));
      let cam = R.__noite; if(!cam || cam.width !== lw || cam.height !== lh) cam = R.__noite = novo(lw, lh);
      const g = cam.getContext('2d'), mt = ctx.getTransform(), sx = lw / cw, sy = lh / ch;
      g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, lw, lh);
      g.fillStyle = tm.noite >= 1 ? 'rgba(6,9,28,.8)' : 'rgba(34,22,48,.5)'; g.fillRect(0, 0, lw, lh);
      g.globalCompositeOperation = 'destination-out';
      g.setTransform(mt.a * sx, mt.b * sy, mt.c * sx, mt.d * sy, mt.e * sx, mt.f * sy);
      g.fillStyle = 'rgba(0,0,0,.5)'; for(const p of vis) g.fill(A.halo[p.idx][0]);
      g.fillStyle = 'rgba(0,0,0,.72)'; for(const p of vis) g.fill(A.halo[p.idx][1]);
      for(const p of vis) for(const l of A.luzes[p.idx]) g.drawImage(T.brilho, l[0] - 22, l[1] - 22, 44, 44);
      g.fillStyle = 'rgba(0,0,0,.45)'; for(const a of R.cen.arquib) if(R.visivel(a.x0, a.y0, a.x1, a.y1)) g.fill(a.corpo);
      if(R.cen.boxes){ g.fillStyle = 'rgba(0,0,0,.55)'; g.fill(R.cen.boxes.corpo); }
      for(const k of A.marcos) if(k.tipo === 'esfera') g.drawImage(T.brilho, k.x - k.r * 2, k.y - k.r * 2, k.r * 4, k.r * 4);
      for(const b of A.pontes) if(b.hotel) g.drawImage(T.brilho, (b.ax + b.bx) / 2 - 40, (b.ay + b.by) / 2 - 40, 80, 80);
      if(R.S) for(const c of R.S.carros){ if(c.recolhido || Math.abs(c.x - R.cam.x) > R.raio || Math.abs(c.y - R.cam.y) > R.raio) continue; g.drawImage(T.brilho, c.x - 8, c.y - 8, 16, 16); }
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = true; ctx.drawImage(cam, 0, 0, cw, ch); ctx.restore();
      /* as lâmpadas acesas, por cima do escuro */
      const rv = R.rv, f = rv ? rv.s[3] : 1;
      ctx.fillStyle = 'rgba(255,246,222,.98)';
      for(const p of vis) for(const l of A.luzes[p.idx]){
        const x = rv ? rv.x + (l[0] - rv.x) * f : l[0], y = rv ? rv.y + (l[1] - rv.y) * f : l[1];
        if(Math.abs(x - R.cam.x) > R.raio || Math.abs(y - R.cam.y) > R.raio) continue;
        ctx.drawImage(T.brilho, x - 2.4, y - 2.4, 4.8, 4.8);
        ctx.beginPath(); ctx.arc(x, y, .36, 0, 6.3); ctx.fill();
      }
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
