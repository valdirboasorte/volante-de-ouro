/* Corrida 2D: a arte dos carros e do cenário (desenhada em código, sem imagem baixada).
   Cada categoria e época tem o seu carro visto de cima: a F1 de cada regulamento (o
   charuto dos anos 60, o efeito solo, o turbo, o bico alto, o halo, o efeito solo de
   2022), a IndyCar com o aeroscreen, a Fórmula E de cada geração, a NASCAR, a Stock Car,
   o DTM, os protótipos do WEC e o kart. A pintura usa a cor da equipe, uma segunda cor
   que combina, um desenho de pintura por equipe, o número e o capacete.
   Cada carro é desenhado uma vez num canvas fora da tela e depois só copiado. */
(function(raiz){
  const C2D = raiz.C2D;
  const ESC = 56;                      /* pixels por metro no desenho guardado */
  const CARBONO = '#15171a', CARBONO2 = '#22252a', BORRACHA = '#0d0e10';

  /* ── cores ── */
  function rgb(hex){
    if(/^rgb/.test(hex)) return String(hex).match(/[\d.]+/g).slice(0, 3).map(v => Math.round(+v));
    const h = String(hex || '#888').replace('#', ''), v = h.length === 3 ? h.split('').map(c => c + c).join('') : h.padEnd(6, '8');
    return [0, 2, 4].map(i => parseInt(v.slice(i, i + 2), 16) || 0);
  }
  function tom(hex, f){
    const n = rgb(hex);
    const r = n.map(c => Math.round(f >= 0 ? c + (255 - c) * f : c * (1 + f)));
    return 'rgb(' + r.join(',') + ')';
  }
  const luz = hex => { const [r, g, b] = rgb(hex); return (r * .299 + g * .587 + b * .114) / 255; };
  const hash = t => { let h = 2166136261; for(const ch of String(t)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0; return h; };
  /* a segunda cor da equipe: uma que contraste com a primeira, sempre a mesma para a equipe */
  function segunda(cor, chave){
    const op = ['#ffffff', '#f0c12e', '#111317', '#c9ccd1', '#e2231a', '#1e41ff', '#00a19c'];
    const l0 = luz(cor), h = hash(chave || cor);
    for(let k = 0; k < op.length; k++){ const c = op[(h + k) % op.length]; if(Math.abs(luz(c) - l0) > .32) return c; }
    return l0 > .5 ? '#111317' : '#ffffff';
  }
  const COMP = { S: '#ff3b30', M: '#ffd60a', H: '#f2f2f2', I: '#34c759', W: '#0a84ff' };

  /* ── o estilo de cada categoria e época ── */
  function estilo(sk, ano, nivel, kart){
    if(kart) return 'kart';
    if(sk === 'nascar') return nivel >= 1 ? 'stock' : 'nascar';
    if(sk === 'stock') return 'stock';
    if(sk === 'dtm') return ano >= 2021 ? 'gt3' : 'classe1';
    if(sk === 'wec') return nivel >= 1 ? 'lmp' : ano >= 2021 ? 'hyper' : 'lmp';
    if(sk === 'fe') return nivel >= 1 ? 'f4' : ano >= 2023 ? 'fe3' : ano >= 2018 ? 'fe2' : 'fe1';
    if(sk === 'indy'){
      if(nivel >= 1) return ano >= 2018 ? 'f3' : 'f2-2005';
      return ano >= 2018 ? 'indy18' : ano >= 2012 ? 'indy12' : ano >= 1996 ? 'f1-2000' : ano >= 1983 ? 'f1-1988' : 'f1-1975';
    }
    if(nivel === 1) return ano >= 2018 ? 'f2' : ano >= 2009 ? 'f1-2012' : ano >= 1994 ? 'f2-2005' : ano >= 1983 ? 'f1-1988' : 'f1-1975';
    if(nivel === 2) return ano >= 2019 ? 'f3' : ano >= 1990 ? 'f2-2005' : ano >= 1970 ? 'formulaFord' : 'f1-1960';
    if(nivel >= 3) return ano >= 2014 ? 'f4' : ano >= 1970 ? 'formulaFord' : 'f1-1960';
    if(ano <= 1966) return 'f1-1960';
    if(ano <= 1977) return 'f1-1975';
    if(ano <= 1982) return 'f1-1980';
    if(ano <= 1993) return 'f1-1988';
    if(ano <= 2008) return 'f1-2000';
    if(ano <= 2016) return 'f1-2012';
    if(ano <= 2021) return 'f1-2019';
    return 'f1-2022';
  }

  /* ── as fórmulas: proporções de cada época (em metros; x para a frente, y para o lado) ── */
  const FORM = {
    'f1-2022': { asaD: { x: 2.8, prof: .4, larg: 1.94, el: 4, curva: true }, bico: [2.66, .11, 1.05, .23], rF: [1.78, .76, .74, .38], rT: [-1.83, .72, .78, .44],
                 cock: [.62, -.2, .25], halo: true, pods: [.55, -1.5, .72, 'esculpido'], piso: [.75, -1.8, .86], motor: [.12, -2.2, .32, .13], airbox: true, fin: true,
                 asaT: { x: -2.32, prof: .44, larg: 1.0, el: 2, viga: true } },
    'f1-2019': { asaD: { x: 2.9, prof: .42, larg: 2.0, el: 5 }, bico: [2.7, .1, 1.05, .22], rF: [1.82, .78, .72, .37], rT: [-1.86, .73, .78, .44],
                 cock: [.64, -.2, .24], halo: 2018, pods: [.5, -1.45, .64, 'reto'], piso: [.95, -1.85, .84], barge: true, motor: [.1, -2.2, .31, .12], airbox: true, fin: true,
                 asaT: { x: -2.38, prof: .4, larg: .95, el: 2 } },
    'f1-2012': { asaD: { x: 2.75, prof: .38, larg: 1.8, el: 4 }, bico: [2.6, .1, 1.05, .2], rF: [1.72, .72, .68, .3], rT: [-1.78, .68, .72, .38],
                 cock: [.6, -.2, .24], pods: [.45, -1.4, .6, 'reto'], piso: [.8, -1.7, .7], barge: true, motor: [.1, -2.1, .3, .12], airbox: true, fin: false,
                 asaT: { x: -2.3, prof: .42, larg: .76, el: 2 } },
    'f1-2000': { asaD: { x: 2.55, prof: .32, larg: 1.5, el: 2, placas: .5 }, bico: [2.5, .08, 1.05, .2], rF: [1.62, .66, .64, .3], rT: [-1.72, .64, .7, .36],
                 cock: [.6, -.15, .23], pods: [.5, -1.35, .62, 'reto'], piso: [.7, -1.6, .66], barge: true, motor: [.1, -2.0, .29, .12], airbox: true,
                 asaT: { x: -2.15, prof: .4, larg: .98, el: 3 }, sulcos: true },
    'f2-2005': { asaD: { x: 2.45, prof: .3, larg: 1.6, el: 2, placas: .4 }, bico: [2.4, .09, 1.0, .2], rF: [1.58, .68, .62, .3], rT: [-1.66, .66, .68, .38],
                 cock: [.58, -.15, .23], pods: [.48, -1.3, .6, 'reto'], piso: [.7, -1.55, .68], motor: [.1, -1.95, .29, .13], airbox: true,
                 asaT: { x: -2.1, prof: .4, larg: .9, el: 2 } },
    'f1-1988': { asaD: { x: 2.4, prof: .3, larg: 1.6, el: 2, placas: .45, baixo: true }, bico: [2.35, .16, .95, .26], rF: [1.55, .74, .62, .34], rT: [-1.62, .72, .72, .46],
                 cock: [.55, -.15, .26], pods: [.45, -1.35, .68, 'reto'], piso: [.6, -1.5, .74], motor: [.05, -1.9, .32, .16], airbox: 'periscopio',
                 asaT: { x: -2.05, prof: .46, larg: 1.0, el: 2 } },
    'f1-1980': { asaD: { x: 2.25, prof: .22, larg: 1.15, el: 1, placas: .3 }, bico: [2.3, .14, .9, .28], rF: [1.5, .74, .6, .32], rT: [-1.55, .72, .72, .48],
                 cock: [.5, -.1, .27], pods: [.65, -1.9, .72, 'efeitoSolo'], motor: [.0, -1.8, .3, .2], airbox: true,
                 asaT: { x: -1.95, prof: .4, larg: .9, el: 1, poste: true } },
    'f1-1975': { asaD: null, bico: [2.15, .42, .9, .32], cunha: true, rF: [1.45, .76, .58, .3], rT: [-1.5, .74, .7, .5],
                 cock: [.45, -.1, .26], pods: [.2, -1.0, .64, 'radiador'], motor: [-.1, -1.7, .3, .2], airbox: 'alto',
                 asaT: { x: -1.85, prof: .38, larg: .92, el: 1, poste: true } },
    'f1-1960': { asaD: null, bico: [1.95, .18, .8, .32], charuto: true, rF: [1.22, .64, .56, .18], rT: [-1.18, .64, .6, .2], arame: true,
                 cock: [.25, -.35, .26], pods: null, motor: [-.3, -1.75, .32, .14], escape: true, asaT: null },
    'formulaFord': { asaD: null, bico: [1.75, .14, .75, .27], charuto: true, rF: [1.15, .62, .52, .2], rT: [-1.1, .62, .56, .24],
                 cock: [.3, -.3, .25], pods: [.2, -.7, .4, 'reto'], motor: [-.3, -1.55, .3, .16], asaT: null },
    'f2':      { asaD: { x: 2.6, prof: .38, larg: 1.8, el: 3 }, bico: [2.5, .1, 1.0, .21], rF: [1.66, .72, .68, .34], rT: [-1.72, .7, .74, .4],
                 cock: [.6, -.18, .24], halo: true, pods: [.48, -1.35, .62, 'reto'], piso: [.8, -1.65, .76], motor: [.1, -2.0, .3, .12], airbox: true, fin: true,
                 asaT: { x: -2.2, prof: .42, larg: .9, el: 2 } },
    'f3':      { asaD: { x: 2.42, prof: .34, larg: 1.68, el: 2 }, bico: [2.34, .1, .95, .2], rF: [1.56, .7, .64, .32], rT: [-1.6, .68, .7, .38],
                 cock: [.56, -.18, .24], halo: true, pods: [.45, -1.25, .58, 'reto'], piso: [.7, -1.5, .72], motor: [.1, -1.85, .29, .13], airbox: true, fin: true,
                 asaT: { x: -2.05, prof: .38, larg: .86, el: 2 } },
    'f4':      { asaD: { x: 2.1, prof: .3, larg: 1.5, el: 2 }, bico: [2.05, .1, .85, .2], rF: [1.36, .66, .58, .3], rT: [-1.4, .64, .64, .34],
                 cock: [.5, -.15, .24], halo: true, pods: [.4, -1.1, .54, 'reto'], motor: [.05, -1.6, .28, .13], airbox: true,
                 asaT: { x: -1.8, prof: .34, larg: .8, el: 1 } },
    'indy18':  { asaD: { x: 2.55, prof: .42, larg: 1.88, el: 3, placas: .55 }, bico: [2.5, .12, 1.0, .22], rF: [1.66, .78, .7, .36], rT: [-1.72, .76, .76, .44],
                 cock: [.6, -.2, .25], aeroscreen: 2020, pods: [.5, -1.35, .7, 'reto'], piso: [.8, -1.75, .82], motor: [.1, -2.05, .31, .14], airbox: true, fin: true,
                 asaT: { x: -2.2, prof: .38, larg: .95, el: 2 } },
    'indy12':  { asaD: { x: 2.5, prof: .4, larg: 1.85, el: 3, placas: .5 }, bico: [2.45, .12, 1.0, .22], rF: [1.64, .76, .68, .36], rT: [-1.7, .74, .74, .44],
                 cock: [.58, -.2, .25], pods: [.5, -1.3, .74, 'reto'], protT: true, motor: [.1, -2.0, .31, .14], airbox: true,
                 asaT: { x: -2.25, prof: .38, larg: .9, el: 2 } },
    'fe1':     { asaD: { x: 2.45, prof: .36, larg: 1.72, el: 2 }, bico: [2.4, .1, 1.0, .21], rF: [1.6, .72, .66, .34], rT: [-1.65, .7, .72, .38],
                 cock: [.55, -.18, .24], pods: [.45, -1.3, .62, 'reto'], motor: [.1, -1.95, .3, .13], airbox: true, asaT: { x: -2.1, prof: .36, larg: .86, el: 2 } },
    'fe2':     { asaD: { x: 2.5, prof: .34, larg: 1.6, el: 1, fe: true }, bico: [2.5, .14, .9, .26], rF: [1.62, .7, .66, .34], rT: [-1.66, .7, .72, .38],
                 cock: [.55, -.2, .24], halo: true, haloLed: true, cobreF: true, cobreT: true, pods: [.55, -1.4, .78, 'esculpido'], motor: [.1, -2.0, .33, .14], fin: true,
                 asaT: { x: -2.2, prof: .3, larg: .9, el: 1, dupla: true } },
    'fe3':     { asaD: { x: 2.45, prof: .28, larg: 1.55, el: 1, fe: true }, bico: [2.45, .05, 1.0, .3], flecha: true, rF: [1.6, .72, .64, .32], rT: [-1.6, .7, .7, .36],
                 cock: [.5, -.2, .24], halo: true, haloLed: true, pods: [.6, -1.5, .74, 'esculpido'], motor: [.1, -2.05, .36, .1], fin: true, asaT: null, difusor: true }
  };

  /* detalhes por estilo: câmera de TV em cima da entrada de ar, retrovisores, guelras */
  const TCAM = { 'f1-2022': 1, 'f1-2019': 1, 'f1-2012': 1, 'f1-2000': 1, 'f2': 1, 'f3': 1, 'indy18': 1, 'indy12': 1, 'fe2': 1, 'fe3': 1 };
  const GUELRAS = { 'f1-2022': 1, 'fe3': 1 };
  /* ── desenho ── */
  function caminhoSim(g, pts){
    /* contorno simétrico suave: pts = [[x, meiaLargura], ...] da frente para trás */
    g.beginPath();
    g.moveTo(pts[0][0], -pts[0][1]);
    for(let k = 1; k < pts.length; k++){ const a = pts[k - 1], b = pts[k]; g.quadraticCurveTo(a[0], -a[1], (a[0] + b[0]) / 2, -(a[1] + b[1]) / 2); }
    const u = pts[pts.length - 1]; g.lineTo(u[0], -u[1]); g.lineTo(u[0], u[1]);
    for(let k = pts.length - 2; k >= 0; k--){ const a = pts[k + 1], b = pts[k]; g.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2); }
    g.lineTo(pts[0][0], pts[0][1]);
    g.closePath();
  }
  function ret(g, x0, x1, y0, y1, r){ const w = x1 - x0, h = y1 - y0; r = Math.min(r || 0, Math.abs(w) / 2, Math.abs(h) / 2); g.beginPath(); if(g.roundRect) g.roundRect(x0, y0, w, h, r); else g.rect(x0, y0, w, h); }
  /* o volume da carroceria: escuro nas bordas, claro no meio, um brilho do lado da luz */
  function corpo(g, cor, meiaW){
    const gr = g.createLinearGradient(0, -meiaW, 0, meiaW);
    gr.addColorStop(0, tom(cor, -.5)); gr.addColorStop(.16, tom(cor, -.12)); gr.addColorStop(.36, tom(cor, .2)); gr.addColorStop(.52, tom(cor, .06)); gr.addColorStop(.8, tom(cor, -.2)); gr.addColorStop(1, tom(cor, -.6));
    return gr;
  }
  function carbono(g, meiaW){ const gr = g.createLinearGradient(0, -meiaW, 0, meiaW); gr.addColorStop(0, '#0b0c0e'); gr.addColorStop(.4, '#272a2f'); gr.addColorStop(.6, '#1c1e22'); gr.addColorStop(1, '#090a0b'); return gr; }
  /* uma peça pintada com volume: a tinta, o reflexo do céu do lado da luz, a sombra do outro lado e o contorno.
     cam() traça o caminho; hw é a meia largura da peça (o reflexo acompanha a peça, não o carro) */
  function volume(g, cam, cor, hw, o){
    o = o || {};
    const yc = o.yc || 0;
    cam();
    const gr = g.createLinearGradient(0, yc - hw, 0, yc + hw);
    gr.addColorStop(0, tom(cor, -.5)); gr.addColorStop(.16, tom(cor, -.12)); gr.addColorStop(.36, tom(cor, .2)); gr.addColorStop(.52, tom(cor, .06)); gr.addColorStop(.8, tom(cor, -.2)); gr.addColorStop(1, tom(cor, -.6));
    g.fillStyle = gr; g.fill();
    g.save(); cam(); g.clip();
    const a = o.brilho != null ? o.brilho : .34;
    const b = g.createLinearGradient(0, yc - hw, 0, yc + hw);
    b.addColorStop(.1, 'rgba(255,255,255,0)'); b.addColorStop(.25, 'rgba(255,255,255,' + a + ')'); b.addColorStop(.31, 'rgba(255,255,255,' + (a * .3).toFixed(3) + ')'); b.addColorStop(.46, 'rgba(255,255,255,0)');
    g.fillStyle = b; g.fillRect(-12, yc - hw - 1, 24, 2 * hw + 2);
    g.restore();
    if(o.traco !== false){ cam(); g.strokeStyle = o.traco || 'rgba(0,0,0,.45)'; g.lineWidth = o.lw || .024; g.lineJoin = 'round'; g.stroke(); }
  }
  /* o vinco entre dois painéis: um risco escuro com o filete de luz ao lado */
  function vinco(g, pts, o){
    o = o || {};
    const traca = d => { g.beginPath(); g.moveTo(pts[0][0] + d, pts[0][1] - d); for(let k = 1; k < pts.length; k++) g.lineTo(pts[k][0] + d, pts[k][1] - d); g.stroke(); };
    g.lineCap = 'round'; g.lineJoin = 'round';
    g.strokeStyle = 'rgba(255,255,255,' + (o.luz != null ? o.luz : .16) + ')'; g.lineWidth = o.lw || .016; traca(.014);
    g.strokeStyle = 'rgba(0,0,0,' + (o.a != null ? o.a : .42) + ')'; traca(0);
    g.lineCap = 'butt';
  }
  /* vidro: escuro perto do teto, o céu refletido perto da borda, um reflexo atravessado */
  function vidro(g, cam, x0, x1){
    cam();
    const gv = g.createLinearGradient(x0, 0, x1, 0); gv.addColorStop(0, '#0d131a'); gv.addColorStop(.5, '#26364a'); gv.addColorStop(1, '#7790a8');
    g.fillStyle = gv; g.fill();
    g.save(); cam(); g.clip();
    const xm = (x0 + x1) / 2, d = Math.abs(x1 - x0);
    g.fillStyle = 'rgba(255,255,255,.17)'; g.beginPath(); g.moveTo(xm - d * .2, -9); g.lineTo(xm + d * .2, -9); g.lineTo(xm + d * .5, 0); g.lineTo(xm + d * .1, 0); g.closePath(); g.fill();
    g.restore();
    cam(); g.strokeStyle = 'rgba(0,0,0,.65)'; g.lineWidth = .028; g.lineJoin = 'round'; g.stroke();
  }
  /* o pneu visto de cima: os ombros arredondados somem na sombra, a banda pega luz; liso, com
     sulcos ou riscado (os de rua e os antigos); a cor do composto vai nos dois ombros */
  function pneu(g, x, y, l, w, o){
    o = o || {};
    const x0 = x - l / 2, x1 = x + l / 2, y0 = y - w / 2, y1 = y + w / 2, r = Math.min(w * .42, l * .2, .15);
    ret(g, x0, x1, y0, y1, r);
    const gr = g.createLinearGradient(0, y0, 0, y1);
    gr.addColorStop(0, '#040405'); gr.addColorStop(.14, '#191a1d'); gr.addColorStop(.36, '#3e4147'); gr.addColorStop(.6, '#2a2c31'); gr.addColorStop(.86, '#131416'); gr.addColorStop(1, '#030304');
    g.fillStyle = gr; g.fill();
    g.save(); ret(g, x0, x1, y0, y1, r); g.clip();
    const gx = g.createLinearGradient(x0, 0, x1, 0);
    gx.addColorStop(0, 'rgba(0,0,0,.7)'); gx.addColorStop(.22, 'rgba(0,0,0,0)'); gx.addColorStop(.78, 'rgba(0,0,0,0)'); gx.addColorStop(1, 'rgba(0,0,0,.7)');
    g.fillStyle = gx; g.fillRect(x0, y0, l, w);
    if(o.sulcos){ g.strokeStyle = 'rgba(0,0,0,.8)'; g.lineWidth = Math.max(.018, w * .05); for(let k = 1; k <= 4; k++){ const yy = y0 + w * k / 5; g.beginPath(); g.moveTo(x0, yy); g.lineTo(x1, yy); g.stroke(); } }
    else if(o.arame || o.riscado){ g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = .016; for(let xx = x0 + .04; xx < x1; xx += .065){ g.beginPath(); g.moveTo(xx, y0 + w * .14); g.lineTo(xx + .03, y); g.lineTo(xx, y1 - w * .14); g.stroke(); } }
    /* o brilho da borracha, do lado da luz */
    g.strokeStyle = 'rgba(255,255,255,.11)'; g.lineWidth = w * .09; g.beginPath(); g.moveTo(x0 + l * .2, y0 + w * .3); g.lineTo(x1 - l * .2, y0 + w * .3); g.stroke();
    if(o.comp){ g.strokeStyle = o.comp; g.lineWidth = Math.max(.028, w * .075); for(const yy of [y0 + w * .1, y1 - w * .1]){ g.beginPath(); g.moveTo(x0 + l * .2, yy); g.lineTo(x1 - l * .2, yy); g.stroke(); } }
    g.restore();
    ret(g, x0, x1, y0, y1, r); g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = .016; g.stroke();
  }
  /* o capacete: o casco com a faixa do desenho do piloto e a viseira na frente */
  function capacete(g, x, y, r, cor, viseira){
    const casco = () => { g.beginPath(); g.ellipse(x, y, r * 1.08, r, 0, 0, Math.PI * 2); };
    casco();
    const gr = g.createRadialGradient(x + r * .2, y - r * .38, r * .06, x, y, r * 1.12);
    gr.addColorStop(0, tom(cor, .65)); gr.addColorStop(.5, cor); gr.addColorStop(1, tom(cor, -.55));
    g.fillStyle = gr; g.fill();
    g.save(); casco(); g.clip();
    g.fillStyle = luz(cor) > .6 ? 'rgba(18,20,24,.6)' : 'rgba(255,255,255,.72)'; g.fillRect(x - r * 1.2, y - r * .15, r * 1.6, r * .3);
    g.fillStyle = viseira || '#0b0e12'; g.beginPath(); g.ellipse(x + r * .68, y, r * .42, r * .8, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(150,195,230,.55)'; g.beginPath(); g.ellipse(x + r * .7, y - r * .3, r * .1, r * .24, -.35, 0, Math.PI * 2); g.fill();
    g.restore();
    casco(); g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = Math.max(.012, r * .09); g.stroke();
  }
  /* o piloto no cockpit: os ombros, os braços até o volante, as luvas e o capacete.
     o: { macacao, aro (volante de aro, dos antigos), dist (do capacete ao volante, em raios), ombros: false }
     (o macacão não leva a cor da equipe: fica igual em todas as camadas da pintura) */
  function piloto(g, x, y, r, capCor, o){
    o = o || {};
    const mac = o.macacao || '#2a2d33', xv = x + r * (o.dist || 2.3);
    if(o.ombros !== false){ g.fillStyle = mac; g.beginPath(); g.ellipse(x - r * .45, y, r * .8, r * 1.8, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = .014; g.stroke(); }
    if(o.volante !== false){
      g.strokeStyle = mac; g.lineWidth = r * .52; g.lineCap = 'round';
      for(const s of [1, -1]){ g.beginPath(); g.moveTo(x - r * .1, y + s * r * 1.35); g.quadraticCurveTo(x + r, y + s * r * 1.4, xv - r * .12, y + s * r * .6); g.stroke(); }
      g.lineCap = 'butt';
      if(o.aro){ g.strokeStyle = o.aro; g.lineWidth = r * .2; g.beginPath(); g.ellipse(xv, y, r * .3, r * .85, 0, 0, Math.PI * 2); g.stroke(); }
      else { g.fillStyle = '#0b0c0e'; ret(g, xv - r * .2, xv + r * .2, y - r * .78, y + r * .78, r * .16); g.fill();
        g.fillStyle = '#e8c21a'; g.fillRect(xv - r * .08, y - r * .3, r * .16, r * .16); g.fillStyle = '#35c06a'; g.fillRect(xv - r * .08, y + r * .14, r * .16, r * .16); }
      g.fillStyle = o.luvas || '#0f1012'; for(const s of [1, -1]){ g.beginPath(); g.arc(xv - r * .06, y + s * r * .62, r * .27, 0, Math.PI * 2); g.fill(); }
    }
    capacete(g, x, y, r, capCor);
  }
  function numero(g, n, x, y, alt, rot, cor, borda){
    g.save(); g.translate(x, y); g.rotate(rot || 0);
    g.font = '800 ' + alt + 'px Archivo, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.lineWidth = alt * .16; g.strokeStyle = borda || 'rgba(0,0,0,.7)'; g.lineJoin = 'round'; g.strokeText(String(n), 0, alt * .04);
    g.fillStyle = cor || '#fff'; g.fillText(String(n), 0, alt * .04);
    g.restore();
  }
  /* a asa: cada elemento com a sua curva (claro na frente, sombra atrás, a fenda entre eles), as placas
     laterais com espessura. O plano principal é de carbono e os flaps levam a cor da equipe; até o
     fim dos anos 90 a asa inteira era pintada (o.pintada) */
  function asa(g, x, prof, larg, el, cor, cor2, o){
    o = o || {};
    const x0 = x - prof, h = larg / 2, n = Math.max(1, el | 0);
    const forma = () => {
      if(o.curva){
        g.beginPath(); g.moveTo(x, -h * .25); g.quadraticCurveTo(x - prof * .2, -h * .7, x - prof * .15, -h); g.lineTo(x0 - prof * .2, -h); g.quadraticCurveTo(x0, -h * .5, x0 + prof * .3, -h * .18);
        g.lineTo(x0 + prof * .3, h * .18); g.quadraticCurveTo(x0, h * .5, x0 - prof * .2, h); g.lineTo(x - prof * .15, h); g.quadraticCurveTo(x - prof * .2, h * .7, x, h * .25); g.closePath();
      } else ret(g, x0, x, -h, h, .04);
    };
    g.save(); forma(); g.clip();
    const xa0 = o.curva ? x + .02 : x, xb0 = o.curva ? x0 - prof * .22 : x0, dx = (xa0 - xb0) / n;
    for(let k = 0; k < n; k++){
      const xa = xa0 - dx * k, xb = xa - dx;
      const pint = o.pintada || (n > 1 && k > 0);
      g.fillStyle = pint ? cor : '#1c1e22'; g.fillRect(xb - .01, -h - .1, dx + .02, 2 * h + .2);
      const ge = g.createLinearGradient(xa, 0, xb, 0);
      ge.addColorStop(0, 'rgba(255,255,255,' + (pint ? .3 : .2) + ')'); ge.addColorStop(.4, 'rgba(255,255,255,0)'); ge.addColorStop(1, 'rgba(0,0,0,.42)');
      g.fillStyle = ge; g.fillRect(xb - .01, -h - .1, dx + .02, 2 * h + .2);
      if(k > 0){ g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(xa - .012, -h - .1, .024, 2 * h + .2); }
    }
    /* a luz de um lado, a sombra do outro */
    const gl = g.createLinearGradient(0, -h, 0, h); gl.addColorStop(0, 'rgba(255,255,255,.12)'); gl.addColorStop(.5, 'rgba(255,255,255,0)'); gl.addColorStop(1, 'rgba(0,0,0,.25)');
    g.fillStyle = gl; g.fillRect(x0 - prof, -h - .1, prof * 3, 2 * h + .2);
    if(o.faixa){ g.fillStyle = cor; ret(g, x0 + prof * .15, x - prof * .1, -h * .55, h * .55, .03); g.fill(); }
    if(n === 1 && !o.pintada){ g.fillStyle = cor; g.fillRect(x0, -h, Math.min(.06, prof * .22), 2 * h); }
    g.restore();
    forma(); g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = .02; g.stroke();
    /* placas laterais */
    const ep = o.placas || prof * 1.05, cp = o.corPlaca || cor;
    for(const s of [1, -1]){
      ret(g, x - ep, x + .02, s * h - .045, s * h + .045, .025); g.fillStyle = cp; g.fill();
      g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = .016; g.stroke();
      g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = .014; g.beginPath(); g.moveTo(x - ep + .04, s * h - .02); g.lineTo(x - .03, s * h - .02); g.stroke();
    }
  }

  /* os estilos em que a asa é pintada (o carbono à mostra só vira regra no fim dos anos 90) */
  const ASA_PINTADA = { 'f1-1960': 1, 'f1-1975': 1, 'f1-1980': 1, 'f1-1988': 1, 'formulaFord': 1, 'f2-2005': 1, 'f1-2000': 1 };
  /* os que abrem a asa traseira (o atuador aparece no meio dela) */
  const COM_DRS = { 'f1-2012': 1, 'f1-2019': 1, 'f1-2022': 1, 'f2': 1, 'f3': 1 };
  function formula(g, p, cor, cor2, num, capCor, comp, padrao, est){
    const antigo = !!p.charuto, metal = antigo || !!p.cunha || est === 'f1-1980';
    const [px, pw, bx, bw] = p.bico, [c0, c1, cw] = p.cock, [m0, m1, mw0, mw1] = p.motor;
    const sem = p.semRoda || {};
    const claro = luz(cor) > .62;
    /* o assoalho de carbono, com a borda pegando luz */
    if(p.piso){
      const [a, b, h] = p.piso, cam = () => caminhoSim(g, [[a, h * .5], [a - .18, h * .96], [(a + b) / 2, h], [b + .25, h * .97], [b, h * .72]]);
      cam(); g.fillStyle = carbono(g, h); g.fill();
      g.save(); cam(); g.clip();
      g.strokeStyle = 'rgba(255,255,255,.16)'; g.lineWidth = .05; g.beginPath(); g.moveTo(a - .15, -h + .035); g.lineTo(b + .25, -h + .035); g.stroke();
      g.strokeStyle = 'rgba(0,0,0,.55)'; g.beginPath(); g.moveTo(a - .15, h - .035); g.lineTo(b + .25, h - .035); g.stroke();
      g.restore();
      cam(); g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = .02; g.stroke();
    }
    /* o câmbio e a estrutura de trás, entre as rodas */
    { const xr = p.asaT ? p.asaT.x - p.asaT.prof * .4 : m1 - .12;
      ret(g, Math.min(xr, m1 - .05), m1 + .45, -Math.max(.09, mw1 * .95), Math.max(.09, mw1 * .95), .04); g.fillStyle = metal ? '#6b7078' : '#191b1f'; g.fill();
      g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = .015; g.stroke(); }
    /* suspensão: os dois braços de cada triângulo, o tirante e, atrás, o semieixo */
    for(const s of [1, -1]){
      const [fx, fy, fl, fw] = p.rF, [tx, ty, tl, tw] = p.rT;
      const yf = s * (fy - fw / 2 + .03), yt = s * (ty - tw / 2 + .03);
      const cf = s * Math.max(.09, Math.min(bw, pw * 1.15 + .03)), ct = s * Math.max(.1, mw1 * 1.05), ce = s * Math.max(.13, mw0 * .8);
      g.lineCap = 'round';
      g.strokeStyle = metal ? '#b4bac2' : '#16181b'; g.lineWidth = metal ? .034 : .042;
      g.beginPath(); g.moveTo(fx + .03, yf); g.lineTo(fx + .36, cf * .85); g.moveTo(fx - .03, yf); g.lineTo(fx - .42, cf * 1.2); g.stroke();
      g.beginPath(); g.moveTo(tx + .03, yt); g.lineTo(tx + .5, ce); g.moveTo(tx - .03, yt); g.lineTo(tx - .28, ct); g.stroke();
      g.strokeStyle = metal ? '#8b9199' : '#30343a'; g.lineWidth = metal ? .024 : .03;
      g.beginPath(); g.moveTo(fx + .12, yf); g.lineTo(fx - .1, cf); g.moveTo(tx + .02, yt); g.lineTo(tx + .08, ct); g.stroke();
      if(!metal){ g.strokeStyle = 'rgba(255,255,255,.1)'; g.lineWidth = .012; g.beginPath(); g.moveTo(fx + .03, yf - .012); g.lineTo(fx + .36, cf * .85 - .012); g.moveTo(tx + .03, yt - .012); g.lineTo(tx + .5, ce - .012); g.stroke(); }
      g.lineCap = 'butt';
      /* os dutos de freio, colados na roda */
      if(!metal){ g.fillStyle = '#0b0c0e'; ret(g, fx - fl * .3, fx + fl * .3, Math.min(yf, yf - s * .075), Math.max(yf, yf - s * .075), .02); g.fill(); ret(g, tx - tl * .3, tx + tl * .3, Math.min(yt, yt - s * .075), Math.max(yt, yt - s * .075), .02); g.fill(); }
    }
    /* pneus (no desenho o y é o contrário do carro: s = -1 é o lado esquerdo) */
    const op = { sulcos: p.sulcos, arame: p.arame, comp };
    for(const s of [1, -1]){ if(!sem[s < 0 ? 'FE' : 'FD']) pneu(g, p.rF[0], s * p.rF[1], p.rF[2], p.rF[3], op); if(!sem[s < 0 ? 'TE' : 'TD']) pneu(g, p.rT[0], s * p.rT[1], p.rT[2], p.rT[3], op); }
    /* proteção das rodas traseiras (IndyCar 2012–2017) e carenagens (Fórmula E Gen2) */
    const carena = (x, y, rx, ry) => volume(g, () => { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); }, cor, ry, { yc: y });
    if(p.protT) for(const s of [1, -1]) carena(p.rT[0] - .55, s * p.rT[1], .32, p.rT[3] * .62);
    if(p.cobreF) for(const s of [1, -1]) carena(p.rF[0], s * (p.rF[1] - .02), p.rF[2] * .62, p.rF[3] * .68);
    if(p.cobreT) for(const s of [1, -1]) carena(p.rT[0] + .05, s * (p.rT[1] - .02), p.rT[2] * .58, p.rT[3] * .66);
    /* os defletores entre a roda e a lateral */
    if(p.barge) for(const s of [1, -1]){
      g.beginPath(); g.moveTo(1.08, s * .38); g.lineTo(.72, s * .74); g.lineTo(.44, s * .72); g.lineTo(.7, s * .36); g.closePath(); g.fillStyle = '#17191c'; g.fill();
      g.strokeStyle = 'rgba(255,255,255,.13)'; g.lineWidth = .014; g.beginPath(); g.moveTo(1.04, s * .42); g.lineTo(.74, s * .7); g.moveTo(.92, s * .42); g.lineTo(.62, s * .7); g.stroke();
    }
    /* as laterais */
    if(p.pods){
      const [a, b, h, forma] = p.pods;
      let pp;
      if(forma === 'esculpido') pp = [[a, h * .55], [a - .15, h * .95], [a - .55, h], [(a + b) / 2, h * .8], [b + .3, h * .45], [b, h * .3]];
      else if(forma === 'efeitoSolo') pp = [[a, h * .8], [a - .1, h], [b + .2, h], [b, h * .85]];
      else if(forma === 'radiador') pp = [[a, h * .5], [a - .1, h], [b + .15, h * .95], [b, h * .6]];
      else pp = [[a, h * .6], [a - .2, h * .95], [(a + b) / 2, h * .85], [b + .2, h * .5], [b, h * .32]];
      volume(g, () => caminhoSim(g, pp), cor, h);
      for(const s of [1, -1]){
        /* a boca do radiador: um recuo escuro, com a borda da frente na luz */
        const ya = s * h * .52, yb = s * h * .94;
        ret(g, a - .17, a - .02, Math.min(ya, yb), Math.max(ya, yb), .035);
        const gi = g.createLinearGradient(a - .17, 0, a - .02, 0); gi.addColorStop(0, '#000'); gi.addColorStop(1, '#30343a'); g.fillStyle = gi; g.fill();
        if(forma === 'efeitoSolo'){ /* a saia e as saídas de ar em cima */
          g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = .03; g.beginPath(); g.moveTo(a - .1, s * (h - .02)); g.lineTo(b + .2, s * (h - .02)); g.stroke();
          g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = .022; for(let q = 0; q < 5; q++){ const xx = b + .45 + q * .09; g.beginPath(); g.moveTo(xx, s * h * .5); g.lineTo(xx, s * h * .78); g.stroke(); } }
        else if(forma === 'radiador'){ ret(g, b + .12, a - .22, Math.min(s * h * .6, s * h * .9), Math.max(s * h * .6, s * h * .9), .02); g.fillStyle = '#23262b'; g.fill();
          g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = .012; for(let xx = b + .16; xx < a - .24; xx += .05){ g.beginPath(); g.moveTo(xx, s * h * .62); g.lineTo(xx, s * h * .88); g.stroke(); } }
        else if(forma === 'esculpido' || GUELRAS[est]){ g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = .022; for(let q = 0; q < 5; q++){ const xx = b + .42 + q * .1; g.beginPath(); g.moveTo(xx, s * h * .22); g.lineTo(xx - .06, s * h * .5); g.stroke(); } }
        else vinco(g, [[a - .3, s * h * .5], [(a + b) / 2, s * h * .46], [b + .3, s * h * .3]], { a: .28, luz: .1 });
      }
    }
    /* bico, monocoque e tampa do motor */
    let pts;
    if(p.charuto) pts = [[px, .02], [px - .1, pw], [bx, bw], [c1, bw * 1.05], [m1 + .4, mw1 * 1.4], [m1, mw1]];
    else if(p.cunha) pts = [[px, pw * .6], [px - .25, pw], [bx, bw * 1.2], [c1, bw], [m1, mw1]];
    else if(p.flecha) pts = [[px, .03], [px - .5, .18], [bx, bw], [c1, bw * .95], [m1, mw1]];
    else pts = [[px, pw * .5], [px - .1, pw], [bx + (px - bx) * .45, pw * 1.35], [bx, bw], [c0, cw * 1.3], [m0, mw0], [m1 + .5, mw1 * 1.5], [m1, mw1]];
    const hwC = Math.max(.2, pts.reduce((m, q) => Math.max(m, q[1]), 0) + .03), camC = () => caminhoSim(g, pts);
    volume(g, camC, cor, hwC);
    /* o desenho antigo da pintura (só quando a equipe não tem pintura na tabela) */
    g.save(); camC(); g.clip();
    g.fillStyle = cor2;
    if(padrao === 0){ ret(g, m1, px, -.045, .045); g.fill(); }
    else if(padrao === 1){ ret(g, m1, px, -.16, -.1); g.fill(); ret(g, m1, px, .1, .16); g.fill(); }
    else if(padrao === 2){ ret(g, m1 - .1, (c1 + m1) / 2, -1, 1); g.fill(); }
    else if(padrao === 3){ g.beginPath(); g.moveTo(px + .1, -.4); g.lineTo(bx + .25, 0); g.lineTo(px + .1, .4); g.lineTo(px + .1, .3); g.lineTo(bx + .45, 0); g.lineTo(px + .1, -.3); g.closePath(); g.fill(); }
    /* a espinha da tampa do motor: um filete de luz e a sombra do outro lado */
    if(!antigo){ g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = .022; g.lineCap = 'round'; g.beginPath(); g.moveTo(c1 - .3, -.02); g.lineTo(m1 + .25, -.012); g.stroke();
      g.strokeStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.moveTo(c1 - .3, .03); g.lineTo(m1 + .25, .02); g.stroke(); g.lineCap = 'butt'; }
    g.restore();
    /* as emendas: o bico, a tampa do motor */
    if(!antigo && !p.flecha && px - bx > .5){ const xj = bx + (px - bx) * .3, wj = bw + (pw * 1.35 - bw) * .55; vinco(g, [[xj, -wj * .9], [xj, wj * .9]], { a: .32 }); }
    if(!antigo && !p.cunha) vinco(g, [[c1 - .32, -mw0 * .85], [c1 - .42, 0], [c1 - .32, mw0 * .85]], { a: .26, luz: .1 });
    /* a barbatana */
    if(p.fin){ g.strokeStyle = tom(cor, -.45); g.lineWidth = .045; g.lineCap = 'round'; g.beginPath(); g.moveTo(c1 - .42, 0); g.lineTo(m1 + .12, 0); g.stroke();
      g.strokeStyle = tom(cor, .35); g.lineWidth = .014; g.beginPath(); g.moveTo(c1 - .42, -.014); g.lineTo(m1 + .12, -.014); g.stroke(); g.lineCap = 'butt'; }
    /* a entrada de ar do motor */
    if(p.airbox === true){
      g.beginPath(); g.ellipse(c1 - .17, 0, .19, .14, 0, 0, Math.PI * 2); g.fillStyle = tom(cor, -.3); g.fill();
      g.beginPath(); g.ellipse(c1 - .15, 0, .15, .105, 0, 0, Math.PI * 2);
      const ga = g.createLinearGradient(c1 - .3, 0, c1, 0); ga.addColorStop(0, '#000'); ga.addColorStop(1, '#2c3036'); g.fillStyle = ga; g.fill();
    } else if(p.airbox === 'alto'){
      volume(g, () => ret(g, c1 - .62, c1 - .04, -.21, .21, .1), cor, .21);
      ret(g, c1 - .15, c1 - .04, -.15, .15, .04); g.fillStyle = '#060708'; g.fill();
    } else if(p.airbox === 'periscopio'){ for(const s of [1, -1]){ ret(g, c1 - .48, c1 - .14, s * .15 - .055, s * .15 + .055, .03); g.fillStyle = tom(cor, -.25); g.fill(); ret(g, c1 - .22, c1 - .14, s * .15 - .04, s * .15 + .04, .02); g.fillStyle = '#060708'; g.fill(); } }
    if(TCAM[est]){ g.fillStyle = (hash(cor) % 2) ? '#f5d000' : '#101214'; ret(g, c1 - .03, c1 + .1, -.1, .1, .03); g.fill(); g.strokeStyle = 'rgba(0,0,0,.65)'; g.lineWidth = .014; g.stroke(); }
    /* o motor à mostra dos anos 60: as cornetas e os escapamentos */
    if(p.escape){
      g.fillStyle = '#0c0d0f'; for(const s of [1, -1]) for(let q = 0; q < 4; q++){ g.beginPath(); g.arc(c1 - .32 - q * .15, s * .075, .045, 0, Math.PI * 2); g.fill(); }
      g.strokeStyle = '#c3c8cf'; g.lineWidth = .014; for(const s of [1, -1]) for(let q = 0; q < 4; q++){ g.beginPath(); g.arc(c1 - .32 - q * .15, s * .075, .045, 0, Math.PI * 2); g.stroke(); }
      g.lineCap = 'round'; for(const s of [1, -1]){ g.strokeStyle = '#8f959d'; g.lineWidth = .06; g.beginPath(); g.moveTo(c1 - .3, s * .3); g.quadraticCurveTo(m1 + .3, s * .42, m1 - .12, s * .28); g.stroke();
        g.strokeStyle = '#e3e6ea'; g.lineWidth = .018; g.beginPath(); g.moveTo(c1 - .3, s * .3 - .015); g.quadraticCurveTo(m1 + .3, s * .42 - .015, m1 - .12, s * .28 - .015); g.stroke(); }
      g.lineCap = 'butt';
    }
    /* retrovisores */
    if(!antigo && est !== 'f1-1975'){ const xm = c0 + .08, ym = cw + .3;
      for(const sg of [1, -1]){ g.strokeStyle = '#1e2024'; g.lineWidth = .03; g.beginPath(); g.moveTo(xm - .05, sg * cw * .9); g.lineTo(xm, sg * ym); g.stroke();
        g.beginPath(); g.ellipse(xm, sg * ym, .075, .125, 0, 0, Math.PI * 2); g.fillStyle = tom(cor, -.2); g.fill(); g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = .014; g.stroke();
        g.fillStyle = 'rgba(175,205,230,.8)'; g.beginPath(); g.ellipse(xm - .03, sg * ym, .025, .085, 0, 0, Math.PI * 2); g.fill(); } }
    /* o cockpit: a abertura, o apoio de cabeça, o piloto */
    const rc = Math.min(.15, cw * .62), xh = (c0 + c1) / 2 - .05;
    ret(g, c1, c0, -cw, cw, cw * .9); g.fillStyle = '#07080a'; g.fill();
    g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = .028; g.stroke();
    g.strokeStyle = tom(cor, claro ? -.35 : .22); g.lineWidth = .014; ret(g, c1 - .01, c0 + .01, -cw - .012, cw + .012, cw * .9); g.stroke();
    if(antigo || p.cunha || est === 'f1-1980'){
      /* cockpit aberto: os ombros e os braços de fora, o volante de aro, o para-brisa e o santantônio */
      piloto(g, xh, 0, rc, capCor, { aro: antigo ? '#6e4420' : '#15171a', macacao: antigo ? '#e2ddcf' : '#d3d6da', luvas: antigo ? '#5a3a1c' : '#0f1012', dist: Math.min(2.6, (c0 - xh) / rc - .5) });
      g.strokeStyle = 'rgba(190,215,235,.8)'; g.lineWidth = .035; g.beginPath(); g.ellipse(c0 + .02, 0, .07, cw * .98, 0, -Math.PI * .5, Math.PI * .5); g.stroke();
      if(!antigo || p.pods){ g.strokeStyle = '#c3c8cf'; g.lineWidth = .04; g.beginPath(); g.moveTo(xh - rc * 1.5, -cw * .7); g.quadraticCurveTo(xh - rc * 2.2, 0, xh - rc * 1.5, cw * .7); g.stroke(); }
    } else {
      /* cockpit fechado dos modernos: o apoio de cabeça em volta do capacete, as mãos no volante */
      g.strokeStyle = '#2b2f35'; g.lineWidth = Math.min(.08, cw * .3); g.beginPath(); g.ellipse(xh - rc * .15, 0, rc * 1.25, Math.min(cw * .82, rc * 1.45), 0, Math.PI * .5, Math.PI * 1.5); g.stroke();
      piloto(g, xh, 0, rc, capCor, { ombros: false, dist: Math.min(2.5, (c0 - xh) / rc - .55) });
    }
    if(p.halo){
      const hc = p.haloLed ? cor2 : '#101113', xe = (c0 + c1) / 2 + .02, rx = (c0 - c1) / 2 + .02, ry = cw * 1.08;
      const arco = (lw, c, d) => { g.strokeStyle = c; g.lineWidth = lw; g.lineCap = 'round'; g.beginPath(); g.moveTo(c0 + .22, d); g.lineTo(c0 - .05, d); g.stroke();
        g.beginPath(); g.ellipse(xe, d, rx, ry, 0, Math.PI * .5, Math.PI * 1.5); g.stroke(); g.beginPath(); g.ellipse(xe, d, rx, ry, 0, -Math.PI * .5, Math.PI * .5, true); g.stroke(); g.lineCap = 'butt'; };
      arco(.085, hc, 0); arco(.018, 'rgba(255,255,255,.28)', -.018);
    }
    if(p.aeroscreen){ const cam = () => { g.beginPath(); g.ellipse((c0 + c1) / 2 + .05, 0, (c0 - c1) / 2 + .18, cw * 1.35, 0, 0, Math.PI * 2); };
      cam(); const ga = g.createRadialGradient(c0 - .1, -cw * .4, .02, (c0 + c1) / 2, 0, cw * 1.4); ga.addColorStop(0, 'rgba(200,225,245,.55)'); ga.addColorStop(1, 'rgba(40,55,70,.3)');
      g.fillStyle = ga; g.fill(); g.strokeStyle = '#111316'; g.lineWidth = .055; g.stroke();
      g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = .016; g.beginPath(); g.ellipse((c0 + c1) / 2 + .05, 0, (c0 - c1) / 2 + .1, cw * 1.2, 0, -Math.PI * .45, -Math.PI * .05); g.stroke(); }
    /* as asas */
    const pintada = !!ASA_PINTADA[est];
    if(p.asaD){ const a = p.asaD;
      /* os pilares que seguram a asa no bico */
      if(a.x - px > .05 || a.curva){ g.fillStyle = '#131517'; for(const s of [1, -1]){ ret(g, a.x - a.prof * .7, Math.min(px, a.x) - .02, s * pw * .9 - .02, s * pw * .9 + .02, .01); g.fill(); } }
      asa(g, a.x, a.prof, a.larg, a.el, cor, cor2, { curva: a.curva, placas: a.placas, corPlaca: pintada ? cor : cor2, faixa: a.fe, pintada });
      /* o bico passa por cima da asa */
      if(!a.curva && px > a.x - a.prof){ g.save(); g.beginPath(); g.rect(a.x - a.prof - .02, -pw * 1.5, a.prof + .3, pw * 3); g.clip(); volume(g, camC, cor, hwC); g.restore(); }
    }
    if(p.asaT){
      const a = p.asaT;
      if(a.poste){ g.fillStyle = '#17191c'; ret(g, a.x - a.prof * .3, a.x + .25, -.04, .04); g.fill(); }
      if(a.viga){ g.fillStyle = '#1e2024'; ret(g, a.x + .02, a.x + .14, -a.larg * .42, a.larg * .42, .03); g.fill(); }
      asa(g, a.x, a.prof, a.larg, a.el, cor, tom(cor, .2), { placas: a.prof * 1.1, corPlaca: cor, pintada });
      if(a.dupla) asa(g, a.x - a.prof - .05, a.prof * .7, a.larg * .9, 1, cor, tom(cor, .2), {});
      if(COM_DRS[est]){ g.fillStyle = '#0d0e10'; ret(g, a.x - a.prof * .62, a.x - a.prof * .1, -.035, .035, .02); g.fill(); }
      /* o número na asa traseira e a luz de chuva */
      if(num != null) numero(g, num, a.x - a.prof / 2, a.larg * .22, Math.min(.28, a.prof * .7), Math.PI / 2, '#fff');
      g.fillStyle = '#ff2a2a'; ret(g, a.x - a.prof - .06, a.x - a.prof + .02, -.065, .065, .02); g.fill();
    }
    if(p.difusor){ g.fillStyle = '#17191c'; ret(g, m1 - .25, m1 + .05, -.62, .62, .06); g.fill(); g.fillStyle = cor2; ret(g, m1 - .26, m1 - .18, -.7, .7, .03); g.fill();
      if(num != null) numero(g, num, m1 + .5, 0, .26, Math.PI / 2, '#fff'); }
    /* o número no bico: num círculo branco nos antigos, direto na tinta nos outros */
    if(!p.asaT && !p.difusor && num != null && !p.semNumNariz){
      g.beginPath(); g.arc(px - .45, 0, Math.min(.2, bw * .75), 0, Math.PI * 2); g.fillStyle = '#f4f4f2'; g.fill(); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = .014; g.stroke();
      numero(g, num, px - .45, 0, Math.min(.22, bw * .85), Math.PI / 2, '#111', 'rgba(255,255,255,0)');
    } else if(num != null && !antigo && !p.semNumNariz && bw > .17 && px - bx > .7){
      numero(g, num, bx + .32, 0, Math.min(.2, bw * .8), Math.PI / 2, '#fff', 'rgba(0,0,0,.75)');
    }
  }

  /* ── carros de carroceria (quando a categoria não está no catálogo, usa o carro do catálogo mais próximo) ── */
  const FECHADO = { nascar: 'cup-gen5', stock: 'stock-2000', classe1: 'classe1', gt3: 'gt3', hyper: 'hyper', lmp: 'lmp2' };
  function fechado(g, tipo, L, W, cor, cor2, num, capCor, comp, padrao){
    const D = C2D.Estilos && C2D.Estilos.DEF, E = D && (D[FECHADO[tipo]] || D[tipo] || D['stock-2000']);
    if(E) return C2D.Estilos.desenhar(g, E, { cor, cor2, num, capCor, compCor: comp, padrao, L, W, est: tipo, faltam: null });
    const h = W / 2;
    for(const s of [1, -1]) for(const x of [L * .32, -L * .3]) pneu(g, x, s * (h - .2), .68, .32, { comp });
    volume(g, () => caminhoSim(g, [[L / 2, h * .6], [L / 2 - .15, h * .95], [-L / 2 + .15, h], [-L / 2, h * .9]]), cor, h);
    if(num != null) numero(g, num, -L * .05, 0, .8, Math.PI / 2, '#fff');
  }

  /* o kart de hoje: o chassi de tubos, as carenagens, o motor do lado e o piloto com os braços no volante */
  function kart(g, cor, cor2, num, capCor){
    /* a bandeja e os tubos */
    ret(g, -.5, .62, -.3, .3, .06); g.fillStyle = '#1a1c20'; g.fill();
    g.strokeStyle = '#a9aeb6'; g.lineWidth = .04; g.lineCap = 'round';
    g.beginPath(); g.moveTo(.55, -.42); g.lineTo(.55, .42); g.moveTo(-.6, -.5); g.lineTo(-.6, .5); g.moveTo(.6, -.26); g.lineTo(-.62, -.33); g.moveTo(.6, .26); g.lineTo(-.62, .33); g.stroke();
    g.lineCap = 'butt';
    pneu(g, .5, .53, .3, .2); pneu(g, .5, -.53, .3, .2); pneu(g, -.6, .6, .33, .27); pneu(g, -.6, -.6, .33, .27);
    /* o motor e o escape, do lado direito */
    ret(g, -.5, -.2, .2, .44, .04); g.fillStyle = '#5d626a'; g.fill(); g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = .014; g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.2)'; g.lineWidth = .012; for(let q = 0; q < 4; q++){ g.beginPath(); g.moveTo(-.46 + q * .07, .24); g.lineTo(-.46 + q * .07, .4); g.stroke(); }
    g.strokeStyle = '#8f959d'; g.lineWidth = .06; g.lineCap = 'round'; g.beginPath(); g.moveTo(-.5, .32); g.lineTo(-.86, .3); g.stroke(); g.lineCap = 'butt';
    /* as carenagens laterais, o bico e o para-choque de trás */
    for(const s of [1, -1]) volume(g, () => ret(g, -.34, .3, s * .56 - .11, s * .56 + .11, .1), cor, .11, { yc: s * .56 });
    volume(g, () => caminhoSim(g, [[.96, .12], [.9, .4], [.64, .46], [.6, .32]]), cor, .46);
    g.fillStyle = '#17191c'; ret(g, -.92, -.8, -.62, .62, .05); g.fill();
    /* a carenagem do volante com a placa do número */
    volume(g, () => caminhoSim(g, [[.5, .1], [.42, .2], [.24, .2], [.22, .12]]), cor, .2);
    g.fillStyle = cor2; ret(g, .68, .88, -.16, .16, .05); g.fill();
    if(num != null) numero(g, num, .78, 0, .2, Math.PI / 2, luz(cor2) > .55 ? '#111' : '#fff', 'rgba(255,255,255,0)');
    /* o banco e o piloto */
    ret(g, -.46, .0, -.21, .21, .11); g.fillStyle = '#0d0e10'; g.fill();
    piloto(g, -.12, 0, .13, capCor, { macacao: tom(cor2, luz(cor2) > .6 ? -.45 : -.1), dist: 2.4 });
  }

  C2D.Arte = {
    ESC, estilo, segunda, tom, COMP, FORM,
    /* as peças de desenho, para o catálogo de carros (estilos2d.js) */
    lib: { caminhoSim, ret, corpo, carbono, volume, vinco, vidro, piloto, pneu, capacete, numero, asa, formula, fechado, kart, tom, luz, hash, CARBONO, CARBONO2 },
    /* o desenho guardado do carro c (sprite): { cv, w, h } em metros */
    _cache: new Map(),
    carro(c, comp){
      const sp = c.sp, est = sp.estilo || estilo('f1', 2024, 0, false);
      /* a pintura da equipe (pinturas2d.js): as cores e o desenho; sem ela, a cor e o desenho antigos */
      const pin = c.pintura || null;
      const cor = pin ? pin.c[0] : c.cor || '#e2231a', cor2 = pin ? pin.c[1] || segunda(cor, c.eq || c.id) : c.cor2 || segunda(cor, c.eq || c.id), num = c.num != null ? c.num : null;
      const falta = c.mascara || '';
      const k = [est, cor, cor2, num, c.me ? 1 : 0, comp || '', falta, pin ? pin.chave : '', c.capCor || ''].join('|');
      let s = C2D.Arte._cache.get(k);
      if(s) return s;
      const L = sp.comp, W = sp.larg, mx = L / 2 + .45, my = W / 2 + .35;
      const cw = Math.ceil(mx * 2 * ESC), ch = Math.ceil(my * 2 * ESC);
      const tela = () => typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(cw, ch) : Object.assign(document.createElement('canvas'), { width: cw, height: ch });
      /* o capacete é do piloto (cada um tem o seu); o seu é dourado */
      const capCor = c.me ? '#f0c12e' : c.capCor || tom(cor2, luz(cor2) > .85 ? -.1 : 0);
      const padrao = pin ? -1 : hash(c.eq || cor) % 4;
      const compCor = comp ? COMP[comp] : null;
      /* as proporções de cada estilo são de um carro "padrão"; o desenho se ajusta ao tamanho do carro */
      const E = C2D.Estilos && C2D.Estilos.DEF[est];
      const faltam = falta ? new Set(falta.split(',')) : null;
      /* o carro inteiro numa cor de base (as outras cores da pintura entram por cima, recortadas) */
      const pinta = base => {
        const cv = tela(), g = cv.getContext('2d');
        g.translate(cw / 2, ch / 2); g.scale(ESC, ESC);
        g.save();
        if(E && E.f) C2D.Estilos.desenhar(g, E, { cor: base, cor2, num, capCor, compCor, padrao, L, W, est, faltam });
        else if(est === 'kart'){ g.scale(L / 1.85, W / 1.35); kart(g, base, cor2, num, capCor); }
        else if(FORM[est]){ const b0 = C2D.Arte.semPecas(FORM[est], faltam); const Lb = (FORM[est].asaD ? FORM[est].asaD.x : FORM[est].bico[0]) - (FORM[est].asaT ? FORM[est].asaT.x - FORM[est].asaT.prof : FORM[est].motor[1]) ; g.scale(L / Math.max(3, Lb + .05), W / 2); formula(g, b0, base, cor2, num, capCor, compCor, padrao, est); }
        else fechado(g, est, L, W, base, cor2, num, capCor, compCor, padrao);
        g.restore();
        return cv;
      };
      const cv = pinta(cor), g = cv.getContext('2d');
      /* as outras cores: o mesmo carro pintado na cor k, recortado na forma do desenho. Só muda
         onde há tinta (carbono, pneu e vidro são iguais nas duas versões), e o volume fica */
      if(pin && pin.d.length && C2D.Pinturas){
        const feitas = new Map();
        for(const t of pin.d){
          const ck = pin.c[t.k - 1]; if(!ck || ck === cor) continue;
          if(!feitas.has(ck)) feitas.set(ck, pinta(ck));
          const tmp = tela(), gt = tmp.getContext('2d');
          gt.drawImage(feitas.get(ck), 0, 0);
          gt.globalCompositeOperation = 'destination-in';
          gt.translate(cw / 2, ch / 2); gt.scale(ESC, ESC); gt.fillStyle = '#fff';
          C2D.Pinturas.mascara(gt, t, L, W);
          g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(tmp, 0, 0); g.restore();
        }
      }
      /* o que foi arrancado: a estrutura aparecendo e o cubo da roda */
      if(faltam) C2D.Arte.buracos(g, faltam, L, W, est);
      /* o contorno escuro em volta do carro inteiro (lê contra asfalto, grama e brita) */
      const oc = tela();
      const go = oc.getContext('2d');
      const ct = ESC / 24; for(const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [.7, .7], [-.7, -.7], [.7, -.7], [-.7, .7]]) go.drawImage(cv, dx * ct, dy * ct);
      go.globalCompositeOperation = 'source-in'; go.fillStyle = 'rgba(8,9,11,.8)'; go.fillRect(0, 0, cw, ch);
      go.globalCompositeOperation = 'source-over'; go.drawImage(cv, 0, 0);
      s = { cv: oc, w: cw / ESC, h: ch / ESC };
      C2D.Arte._cache.set(k, s);
      if(C2D.Arte._cache.size > 90) C2D.Arte._cache.delete(C2D.Arte._cache.keys().next().value);
      return s;
    },
    /* a fórmula sem as peças arrancadas */
    semPecas(base, faltam){
      if(!faltam) return base;
      const b = Object.assign({}, base);
      if(faltam.has('asaD')) b.asaD = null;
      if(faltam.has('asaT')){ b.asaT = null; b.semNumNariz = true; }
      const sr = {}; for(const k of ['FE', 'FD', 'TE', 'TD']) if(faltam.has(k)) sr[k] = true;
      b.semRoda = sr;
      return b;
    },
    /* onde a peça saiu: a estrutura escura aparecendo, cabos, e o cubo no lugar da roda
       (coordenadas do desenho: x para a frente, y ao contrário do carro) */
    buracos(g, faltam, L, W, est){
      const h = W / 2, esc = '#17191c', est2 = '#2c3036';
      const tira = (x0, x1, y0, y1) => { ret(g, x0, x1, y0, y1, .05); g.fillStyle = esc; g.fill(); g.strokeStyle = est2; g.lineWidth = .03; g.beginPath(); for(let x = x0 + .08; x < x1; x += .16){ g.moveTo(x, y0 + .02); g.lineTo(x + .06, y1 - .02); } g.stroke(); };
      const fam = C2D.Dano ? C2D.Dano.tipoDe(est).fam : 'aberto';
      if(faltam.has('paraF')) tira(L / 2 - .38, L / 2 - .02, -h * .78, h * .78);
      if(faltam.has('paraT')) tira(-L / 2 + .02, -L / 2 + .34, -h * .74, h * .74);
      if(faltam.has('latE')) tira(-L * .28, L * .22, -h + .02, -h + .26);
      if(faltam.has('latD')) tira(-L * .28, L * .22, h - .26, h - .02);
      if(faltam.has('bico')) tira(L / 2 - .5, L / 2 - .05, -.12, .12);
      if(faltam.has('carenagem')){
        ret(g, -L * .38, -L * .04, -h * .32, h * .32, .08); g.fillStyle = '#26292e'; g.fill();
        g.strokeStyle = '#7b8088'; g.lineWidth = .035; g.beginPath();
        for(let q = 0; q < 4; q++){ const x = -L * .35 + q * L * .08; g.moveTo(x, -h * .22); g.lineTo(x, h * .22); } g.stroke();
        g.fillStyle = '#b9532a'; ret(g, -L * .37, -L * .3, -h * .12, h * .12, .03); g.fill();
      }
      /* a roda arrancada: o cubo e o braço da suspensão quebrado */
      for(const k of ['FE', 'FD', 'TE', 'TD']){
        if(!faltam.has(k)) continue;
        const x = (k[0] === 'F' ? 1 : -1) * L * (k[0] === 'F' ? .32 : .3), y = (k[1] === 'E' ? -1 : 1) * (h - (fam === 'aberto' ? .1 : .22));
        if(fam !== 'aberto'){ g.beginPath(); g.ellipse(x, y, .42, .2, 0, 0, Math.PI * 2); g.fillStyle = '#0c0d0f'; g.fill(); }
        g.beginPath(); g.arc(x, y, .11, 0, Math.PI * 2); g.fillStyle = '#9aa0a8'; g.fill();
        g.strokeStyle = '#3a3e44'; g.lineWidth = .05; g.beginPath(); g.moveTo(x, y); g.lineTo(x * .9, y * .45); g.stroke();
      }
    },
    /* a sombra macia do carro (um desenho por tamanho) */
    _sombras: new Map(),
    sombra(c){
      const sp = c.sp, k = sp.comp.toFixed(1) + 'x' + sp.larg.toFixed(1);
      let s = C2D.Arte._sombras.get(k);
      if(s) return s;
      const E = 10, mx = sp.comp / 2 + .8, my = sp.larg / 2 + .8, cw = Math.ceil(mx * 2 * E), ch = Math.ceil(my * 2 * E);
      const cv = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(cw, ch) : Object.assign(document.createElement('canvas'), { width: cw, height: ch });
      const g = cv.getContext('2d');
      g.translate(cw / 2, ch / 2); g.scale(E, E);
      /* a sombra larga e macia, e por cima a de contato, mais firme, colada no carro */
      g.filter = 'blur(' + Math.round(E * .4) + 'px)'; g.fillStyle = 'rgba(0,0,0,.42)';
      ret(g, -sp.comp / 2, sp.comp / 2, -sp.larg / 2, sp.larg / 2, .35); g.fill();
      g.filter = 'blur(' + Math.max(1, Math.round(E * .12)) + 'px)'; g.fillStyle = 'rgba(0,0,0,.38)';
      ret(g, -sp.comp / 2 + .25, sp.comp / 2 - .25, -sp.larg / 2 + .15, sp.larg / 2 - .15, .25); g.fill();
      g.filter = 'none';
      s = { cv, w: cw / E, h: ch / E };
      C2D.Arte._sombras.set(k, s);
      return s;
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
