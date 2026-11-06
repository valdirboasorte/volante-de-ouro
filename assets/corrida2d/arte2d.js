/* Corrida 2D: a arte dos carros e do cenário (desenhada em código, sem imagem baixada).
   Cada categoria e época tem o seu carro visto de cima: a F1 de cada regulamento (o
   charuto dos anos 60, o efeito solo, o turbo, o bico alto, o halo, o efeito solo de
   2022), a IndyCar com o aeroscreen, a Fórmula E de cada geração, a NASCAR, a Stock Car,
   o DTM, os protótipos do WEC e o kart. A pintura usa a cor da equipe, uma segunda cor
   que combina, um desenho de pintura por equipe, o número e o capacete.
   Cada carro é desenhado uma vez num canvas fora da tela e depois só copiado. */
(function(raiz){
  const C2D = raiz.C2D;
  const ESC = 30;                      /* pixels por metro no desenho guardado */
  const CARBONO = '#15171a', CARBONO2 = '#22252a', BORRACHA = '#0d0e10';

  /* ── cores ── */
  function rgb(hex){
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
    gr.addColorStop(0, tom(cor, -.55)); gr.addColorStop(.22, tom(cor, -.08)); gr.addColorStop(.38, tom(cor, .28)); gr.addColorStop(.5, tom(cor, .12)); gr.addColorStop(.78, tom(cor, -.18)); gr.addColorStop(1, tom(cor, -.6));
    return gr;
  }
  function carbono(g, meiaW){ const gr = g.createLinearGradient(0, -meiaW, 0, meiaW); gr.addColorStop(0, '#0b0c0e'); gr.addColorStop(.45, CARBONO2); gr.addColorStop(1, '#090a0b'); return gr; }

  function pneu(g, x, y, l, w, o){
    o = o || {};
    ret(g, x - l / 2, x + l / 2, y - w / 2, y + w / 2, Math.min(.12, w * .35));
    const gr = g.createLinearGradient(x - l / 2, 0, x + l / 2, 0);
    gr.addColorStop(0, '#060607'); gr.addColorStop(.25, '#1c1d20'); gr.addColorStop(.5, '#2a2c30'); gr.addColorStop(.75, '#1c1d20'); gr.addColorStop(1, '#060607');
    g.fillStyle = gr; g.fill();
    if(o.sulcos){ g.strokeStyle = 'rgba(0,0,0,.75)'; g.lineWidth = .025; for(let k = 1; k <= 3; k++){ const yy = y - w / 2 + w * k / 4; g.beginPath(); g.moveTo(x - l / 2 + .04, yy); g.lineTo(x + l / 2 - .04, yy); g.stroke(); } }
    if(o.arame){ g.strokeStyle = 'rgba(200,200,205,.5)'; g.lineWidth = .02; g.beginPath(); g.moveTo(x - l * .3, y); g.lineTo(x + l * .3, y); g.stroke(); }
    if(o.comp){ g.strokeStyle = o.comp; g.lineWidth = .035; const yy = y + (y > 0 ? w / 2 - .03 : -w / 2 + .03); g.beginPath(); g.moveTo(x - l * .38, yy); g.lineTo(x + l * .38, yy); g.stroke(); }
  }
  function capacete(g, x, y, r, cor, viseira){
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2);
    const gr = g.createRadialGradient(x + r * .3, y - r * .3, r * .1, x, y, r);
    gr.addColorStop(0, tom(cor, .55)); gr.addColorStop(.6, cor); gr.addColorStop(1, tom(cor, -.45));
    g.fillStyle = gr; g.fill();
    g.fillStyle = viseira || 'rgba(15,17,20,.85)'; g.beginPath(); g.ellipse(x + r * .5, y, r * .32, r * .62, 0, 0, Math.PI * 2); g.fill();
  }
  function numero(g, n, x, y, alt, rot, cor, borda){
    g.save(); g.translate(x, y); g.rotate(rot || 0);
    g.font = '800 ' + alt + 'px Archivo, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.lineWidth = alt * .16; g.strokeStyle = borda || 'rgba(0,0,0,.7)'; g.lineJoin = 'round'; g.strokeText(String(n), 0, alt * .04);
    g.fillStyle = cor || '#fff'; g.fillText(String(n), 0, alt * .04);
    g.restore();
  }
  function asa(g, x, prof, larg, el, cor, cor2, o){
    o = o || {};
    const x0 = x - prof, h = larg / 2;
    if(o.curva){
      g.beginPath(); g.moveTo(x, -h * .25); g.quadraticCurveTo(x - prof * .2, -h * .7, x - prof * .15, -h); g.lineTo(x0 - prof * .2, -h); g.quadraticCurveTo(x0, -h * .5, x0 + prof * .3, -h * .18);
      g.lineTo(x0 + prof * .3, h * .18); g.quadraticCurveTo(x0, h * .5, x0 - prof * .2, h); g.lineTo(x - prof * .15, h); g.quadraticCurveTo(x - prof * .2, h * .7, x, h * .25); g.closePath();
    } else ret(g, x0, x, -h, h, .04);
    g.fillStyle = carbono(g, h); g.fill();
    /* os elementos da asa: faixas na cor da equipe */
    g.strokeStyle = cor2 || tom(cor, .25); g.lineWidth = Math.min(.06, prof / (el * 2.2));
    for(let k = 0; k < el; k++){
      const xx = x - prof * (k + .6) / (el + .2);
      g.beginPath(); g.moveTo(xx, -h * (o.curva ? .96 - k * .05 : .96)); g.lineTo(xx, h * (o.curva ? .96 - k * .05 : .96)); g.stroke();
    }
    if(o.faixa){ g.fillStyle = cor; ret(g, x0 + prof * .15, x - prof * .1, -h * .55, h * .55, .03); g.fill(); }
    /* placas laterais */
    const ep = o.placas || prof * 1.05;
    g.fillStyle = o.corPlaca || cor; ret(g, x - ep, x + .02, -h - .035, -h + .035, .02); g.fill(); ret(g, x - ep, x + .02, h - .035, h + .035, .02); g.fill();
  }

  function formula(g, p, cor, cor2, num, capCor, comp, padrao, est){
    const meiaW = 1.1;
    const gc = corpo(g, cor, meiaW);
    /* piso de carbono (o fundo plano aparecendo por fora das laterais) */
    if(p.piso){ const [a, b, h] = p.piso; caminhoSim(g, [[a, h * .55], [a - .2, h], [b + .25, h * .96], [b, h * .7]]); g.fillStyle = carbono(g, h); g.fill(); }
    /* suspensão */
    g.strokeStyle = '#2b2e33'; g.lineWidth = .045;
    for(const s of [1, -1]){
      const [fx, fy] = p.rF, [tx, ty] = p.rT;
      g.beginPath(); g.moveTo(fx + .12, s * fy * .8); g.lineTo(fx + .3, s * .12); g.moveTo(fx - .1, s * fy * .8); g.lineTo(fx - .4, s * .16); g.stroke();
      g.beginPath(); g.moveTo(tx + .1, s * ty * .8); g.lineTo(tx + .45, s * .2); g.moveTo(tx - .1, s * ty * .8); g.lineTo(tx - .35, s * .16); g.stroke();
    }
    /* pneus */
    const op = { sulcos: p.sulcos, arame: p.arame, comp };
    /* (no desenho o y é o contrário do carro: s = -1 é o lado esquerdo) */
    const sem = p.semRoda || {};
    for(const s of [1, -1]){ if(!sem[s < 0 ? 'FE' : 'FD']) pneu(g, p.rF[0], s * p.rF[1], p.rF[2], p.rF[3], op); if(!sem[s < 0 ? 'TE' : 'TD']) pneu(g, p.rT[0], s * p.rT[1], p.rT[2], p.rT[3], op); }
    /* proteção das rodas traseiras (IndyCar 2012–2017) e carenagens (Fórmula E Gen2) */
    if(p.protT){ for(const s of [1, -1]){ g.beginPath(); g.ellipse(p.rT[0] - .55, s * p.rT[1], .32, p.rT[3] * .62, 0, 0, Math.PI * 2); g.fillStyle = gc; g.fill(); } }
    if(p.cobreF){ for(const s of [1, -1]){ g.beginPath(); g.ellipse(p.rF[0], s * (p.rF[1] - .02), p.rF[2] * .62, p.rF[3] * .68, 0, 0, Math.PI * 2); g.fillStyle = gc; g.fill(); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = .02; g.stroke(); } }
    if(p.cobreT){ for(const s of [1, -1]){ g.beginPath(); g.ellipse(p.rT[0] + .05, s * (p.rT[1] - .02), p.rT[2] * .58, p.rT[3] * .66, 0, 0, Math.PI * 2); g.fillStyle = gc; g.fill(); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = .02; g.stroke(); } }
    /* bargeboards (as peças escuras entre a roda e a lateral) */
    if(p.barge){ for(const s of [1, -1]){ g.beginPath(); g.moveTo(1.05, s * .4); g.lineTo(.7, s * .72); g.lineTo(.45, s * .7); g.lineTo(.7, s * .38); g.closePath(); g.fillStyle = CARBONO; g.fill(); } }
    /* laterais */
    if(p.pods){
      const [a, b, h, forma] = p.pods;
      let pts;
      if(forma === 'esculpido') pts = [[a, h * .55], [a - .15, h * .95], [a - .55, h], [(a + b) / 2, h * .8], [b + .3, h * .45], [b, h * .3]];
      else if(forma === 'efeitoSolo') pts = [[a, h * .8], [a - .1, h], [b + .2, h], [b, h * .85]];
      else if(forma === 'radiador') pts = [[a, h * .5], [a - .1, h], [b + .15, h * .95], [b, h * .6]];
      else pts = [[a, h * .6], [a - .2, h * .95], [(a + b) / 2, h * .85], [b + .2, h * .5], [b, h * .32]];
      caminhoSim(g, pts); g.fillStyle = gc; g.fill();
      /* entrada de ar */
      g.fillStyle = 'rgba(0,0,0,.75)';
      for(const s of [1, -1]){ ret(g, a - .12, a - .02, s > 0 ? h * .55 : -h * .95, s > 0 ? h * .95 : -h * .55, .02); g.fill(); }
      if(forma === 'efeitoSolo'){ g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = .03; for(const s of [1, -1]){ g.beginPath(); g.moveTo(a - .1, s * h); g.lineTo(b + .2, s * h); g.stroke(); } }
    }
    /* bico e monocoque */
    const [px, pw, bx, bw] = p.bico;
    let pts;
    if(p.charuto) pts = [[px, .02], [px - .1, pw], [bx, bw], [p.cock[1], bw * 1.05], [p.motor[1] + .4, p.motor[3] * 1.4], [p.motor[1], p.motor[3]]];
    else if(p.cunha) pts = [[px, pw * .6], [px - .25, pw], [bx, bw * 1.2], [p.cock[1], bw], [p.motor[1], p.motor[3]]];
    else if(p.flecha) pts = [[px, .03], [px - .5, .18], [bx, bw], [p.cock[1], bw * .95], [p.motor[1], p.motor[3]]];
    else pts = [[px, pw * .5], [px - .1, pw], [bx + (px - bx) * .45, pw * 1.35], [bx, bw], [p.cock[0], p.cock[2] * 1.3], [p.motor[0], p.motor[2]], [p.motor[1] + .5, p.motor[3] * 1.5], [p.motor[1], p.motor[3]]];
    caminhoSim(g, pts); g.fillStyle = gc; g.fill();
    g.strokeStyle = 'rgba(0,0,0,.28)'; g.lineWidth = .02; g.stroke();
    /* o desenho da pintura */
    g.save(); caminhoSim(g, pts); g.clip();
    g.fillStyle = cor2;
    if(padrao === 0){ ret(g, p.motor[1], px, -.045, .045); g.fill(); }
    else if(padrao === 1){ ret(g, p.motor[1], px, -.16, -.1); g.fill(); ret(g, p.motor[1], px, .1, .16); g.fill(); }
    else if(padrao === 2){ ret(g, p.motor[1] - .1, (p.cock[1] + p.motor[1]) / 2, -1, 1); g.fill(); }
    else { g.beginPath(); g.moveTo(px + .1, -.4); g.lineTo(bx + .25, 0); g.lineTo(px + .1, .4); g.lineTo(px + .1, .3); g.lineTo(bx + .45, 0); g.lineTo(px + .1, -.3); g.closePath(); g.fill(); }
    g.restore();
    /* brilho do lado da luz, e um reflexo fino ao longo do bico e da tampa do motor */
    g.save(); caminhoSim(g, pts); g.clip();
    const br = g.createLinearGradient(0, -meiaW * .4, 0, meiaW * .2); br.addColorStop(0, 'rgba(255,255,255,.26)'); br.addColorStop(.6, 'rgba(255,255,255,0)');
    g.fillStyle = br; g.fillRect(-3, -1, 6, 1.2);
    g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = .035; g.lineCap = 'round';
    g.beginPath(); g.moveTo(px - .15, -.05); g.lineTo(bx - .1, -bw * .45); g.moveTo(p.cock[1] - .25, -p.motor[2] * .55); g.lineTo(p.motor[1] + .35, -p.motor[3] * .6); g.stroke();
    g.restore();
    /* adesivos de patrocínio (formas claras, sem marca) */
    g.fillStyle = luz(cor) > .7 ? 'rgba(20,22,26,.75)' : 'rgba(255,255,255,.85)';
    if(p.pods && !p.charuto){ const [a, b, h] = p.pods; for(const sg of [1, -1]){ ret(g, (a + b) / 2 - .32, (a + b) / 2 + .18, sg * h * .62 - .07, sg * h * .62 + .07, .03); g.fill(); } }
    if(!p.charuto && bx < px - .4){ ret(g, bx + .15, bx + .5, -bw * .42, bw * .42, .03); g.fill(); }
    if(GUELRAS[est] && p.pods){ const [a, b, h] = p.pods; g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = .025;
      for(const sg of [1, -1]) for(let q = 0; q < 4; q++){ const xx = b + .35 + q * .1; g.beginPath(); g.moveTo(xx, sg * h * .2); g.lineTo(xx - .05, sg * h * .5); g.stroke(); } }
    /* motor: barbatana, entrada de ar, escapamento */
    if(p.fin){ g.strokeStyle = tom(cor, -.35); g.lineWidth = .035; g.beginPath(); g.moveTo(p.cock[1] - .4, 0); g.lineTo(p.motor[1] + .15, 0); g.stroke(); }
    if(p.airbox === true){ g.beginPath(); g.ellipse(p.cock[1] - .18, 0, .17, .12, 0, 0, Math.PI * 2); g.fillStyle = '#0b0c0e'; g.fill(); }
    if(TCAM[est]){ g.fillStyle = (hash(cor) % 2) ? '#f5d000' : '#111316'; ret(g, p.cock[1] - .02, p.cock[1] + .12, -.09, .09, .03); g.fill(); g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = .015; g.stroke(); }
    /* retrovisores */
    if(!p.charuto && est !== 'f1-1975'){ const xm = p.cock[0] + .08, ym = p.cock[2] + .3; g.strokeStyle = CARBONO2; g.lineWidth = .03;
      for(const sg of [1, -1]){ g.beginPath(); g.moveTo(xm - .05, sg * p.cock[2] * .9); g.lineTo(xm, sg * ym); g.stroke(); g.beginPath(); g.ellipse(xm, sg * ym, .07, .12, 0, 0, Math.PI * 2); g.fillStyle = tom(cor, -.25); g.fill(); g.fillStyle = 'rgba(180,200,220,.7)'; g.beginPath(); g.ellipse(xm - .02, sg * ym, .03, .08, 0, 0, Math.PI * 2); g.fill(); } }
    else if(p.airbox === 'alto'){ ret(g, p.cock[1] - .55, p.cock[1] - .05, -.2, .2, .08); g.fillStyle = gc; g.fill(); g.fillStyle = '#0b0c0e'; ret(g, p.cock[1] - .12, p.cock[1] - .04, -.12, .12, .03); g.fill(); }
    else if(p.airbox === 'periscopio'){ for(const s of [1, -1]){ ret(g, p.cock[1] - .45, p.cock[1] - .15, s * .14 - .05, s * .14 + .05, .03); g.fillStyle = '#0b0c0e'; g.fill(); } }
    if(p.escape){ g.strokeStyle = '#b7bcc4'; g.lineWidth = .04; for(const s of [1, -1]){ g.beginPath(); g.moveTo(p.cock[1] - .3, s * .3); g.quadraticCurveTo(p.motor[1] + .3, s * .42, p.motor[1] - .1, s * .3); g.stroke(); } }
    /* cockpit, piloto e halo / aeroscreen */
    const [c0, c1, cw] = p.cock;
    ret(g, c1, c0, -cw, cw, cw * .9); g.fillStyle = '#0a0b0d'; g.fill();
    capacete(g, (c0 + c1) / 2 - .04, 0, Math.min(.15, cw * .62), capCor);
    if(p.halo){ g.strokeStyle = p.haloLed ? cor2 : '#111316'; g.lineWidth = .07; g.beginPath(); g.moveTo(c0 + .2, 0); g.lineTo(c0 - .05, 0); g.stroke();
      g.beginPath(); g.ellipse((c0 + c1) / 2 + .02, 0, (c0 - c1) / 2 + .02, cw * 1.08, 0, Math.PI * .5, Math.PI * 1.5); g.stroke();
      g.beginPath(); g.ellipse((c0 + c1) / 2 + .02, 0, (c0 - c1) / 2 + .02, cw * 1.08, 0, -Math.PI * .5, Math.PI * .5, true); g.stroke(); }
    if(p.aeroscreen){ g.beginPath(); g.ellipse((c0 + c1) / 2 + .05, 0, (c0 - c1) / 2 + .18, cw * 1.35, 0, 0, Math.PI * 2);
      const ga = g.createRadialGradient(c0 - .1, -cw * .4, .02, (c0 + c1) / 2, 0, cw * 1.4); ga.addColorStop(0, 'rgba(190,215,235,.55)'); ga.addColorStop(1, 'rgba(40,55,70,.35)');
      g.fillStyle = ga; g.fill(); g.strokeStyle = '#121418'; g.lineWidth = .05; g.stroke(); }
    if(p.charuto && !p.pods){ g.strokeStyle = 'rgba(200,220,235,.75)'; g.lineWidth = .04; g.beginPath(); g.ellipse(c0 + .02, 0, .06, cw * .95, 0, -Math.PI * .5, Math.PI * .5); g.stroke(); }
    /* asas */
    if(p.asaD){ const a = p.asaD; asa(g, a.x, a.prof, a.larg, a.el, cor, cor2, { curva: a.curva, placas: a.placas, corPlaca: cor2, faixa: a.fe }); }
    if(p.asaT){
      const a = p.asaT;
      if(a.poste){ g.fillStyle = CARBONO; ret(g, a.x - a.prof * .3, a.x + .25, -.04, .04); g.fill(); }
      if(a.viga){ g.fillStyle = CARBONO2; ret(g, a.x + .02, a.x + .14, -a.larg * .42, a.larg * .42, .03); g.fill(); }
      asa(g, a.x, a.prof, a.larg, a.el, cor, tom(cor, .2), { placas: a.prof * 1.08, corPlaca: cor });
      if(a.dupla) asa(g, a.x - a.prof - .05, a.prof * .7, a.larg * .9, 1, cor, tom(cor, .2), {});
      /* o número na asa traseira e a luz de chuva */
      if(num != null) numero(g, num, a.x - a.prof / 2, 0, Math.min(.3, a.prof * .75), Math.PI / 2, '#fff');
      g.fillStyle = '#ff2a2a'; ret(g, a.x - a.prof - .05, a.x - a.prof + .02, -.06, .06, .02); g.fill();
    }
    if(p.difusor){ g.fillStyle = CARBONO; ret(g, p.motor[1] - .25, p.motor[1] + .05, -.62, .62, .06); g.fill(); g.fillStyle = cor2; ret(g, p.motor[1] - .26, p.motor[1] - .18, -.7, .7, .03); g.fill();
      if(num != null) numero(g, num, p.motor[1] + .5, 0, .26, Math.PI / 2, '#fff'); }
    if(!p.asaT && !p.difusor && num != null && !p.semNumNariz){
      /* os antigos levavam o número num círculo branco no bico */
      g.beginPath(); g.arc(px - .45, 0, Math.min(.2, bw * .75), 0, Math.PI * 2); g.fillStyle = '#f4f4f2'; g.fill();
      numero(g, num, px - .45, 0, Math.min(.22, bw * .85), Math.PI / 2, '#111', 'rgba(255,255,255,0)');
    }
  }

  /* ── carros de carroceria ── */
  function fechado(g, tipo, L, W, cor, cor2, num, capCor, comp, padrao){
    const h = W / 2, gc = corpo(g, cor, h);
    const rodas = tipo === 'hyper' || tipo === 'lmp' ? [L * .33, -L * .3] : [L * .32, -L * .3];
    /* pneus (aparecem um pouco por fora) */
    for(const s of [1, -1]) for(const x of rodas) pneu(g, x, s * (h - .2), .68, .32, { comp: tipo === 'hyper' || tipo === 'gt3' ? comp : null });
    let pts;
    if(tipo === 'nascar' || tipo === 'stock') pts = [[L / 2, h * .62], [L / 2 - .12, h * .92], [L / 2 - .5, h], [-L / 2 + .2, h], [-L / 2, h * .93]];
    else if(tipo === 'gt3') pts = [[L / 2, h * .55], [L / 2 - .2, h * .9], [rodas[0], h * 1.02], [rodas[0] - .6, h * .88], [rodas[1] + .5, h * .9], [rodas[1], h * 1.03], [-L / 2 + .2, h * .9], [-L / 2, h * .82]];
    else if(tipo === 'classe1') pts = [[L / 2, h * .7], [L / 2 - .15, h * .98], [-L / 2 + .15, h], [-L / 2, h * .95]];
    else pts = [[L / 2, h * .3], [L / 2 - .2, h * .55], [rodas[0] + .25, h * 1.0], [rodas[0] - .45, h * .95], [0, h * .62], [rodas[1] + .45, h * .9], [rodas[1], h], [-L / 2 + .15, h * .92], [-L / 2, h * .8]];
    caminhoSim(g, pts); g.fillStyle = gc; g.fill(); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = .025; g.stroke();
    /* pintura */
    g.save(); caminhoSim(g, pts); g.clip(); g.fillStyle = cor2;
    if(padrao === 0){ ret(g, -L / 2, L / 2, -.14, -.06); g.fill(); ret(g, -L / 2, L / 2, .06, .14); g.fill(); }
    else if(padrao === 1){ g.beginPath(); g.moveTo(L / 2, -h); g.lineTo(L / 2 - 1.2, -h); g.lineTo(-L / 2 + .6, h); g.lineTo(-L / 2 + 1.6, h); g.closePath(); g.fill(); }
    else if(padrao === 2){ ret(g, -L / 2, -L * .1, -h, h); g.fill(); }
    else { ret(g, L / 2 - .7, L / 2, -h, h); g.fill(); }
    /* brilho */
    const br = g.createLinearGradient(0, -h, 0, h * .3); br.addColorStop(0, 'rgba(255,255,255,.25)'); br.addColorStop(.55, 'rgba(255,255,255,0)'); g.fillStyle = br; g.fillRect(-L, -h, 2 * L, h * 1.3);
    g.restore();
    if(tipo === 'nascar' || tipo === 'stock' || tipo === 'classe1' || tipo === 'gt3'){
      /* para-brisa, teto, vidro de trás */
      const xp = tipo === 'gt3' ? L * .06 : L * .12, xt = tipo === 'gt3' ? -L * .2 : -L * .2;
      g.beginPath(); g.moveTo(xp + .5, -h * .7); g.lineTo(xp, -h * .78); g.lineTo(xp, h * .78); g.lineTo(xp + .5, h * .7); g.closePath();
      const gv = g.createLinearGradient(xp, 0, xp + .5, 0); gv.addColorStop(0, '#1a2330'); gv.addColorStop(1, '#5b7086'); g.fillStyle = gv; g.fill();
      ret(g, xt, xp, -h * .76, h * .76, .1); g.fillStyle = tom(cor2, -.05); g.fill();
      g.beginPath(); g.moveTo(xt, -h * .74); g.lineTo(xt - .38, -h * .66); g.lineTo(xt - .38, h * .66); g.lineTo(xt, h * .74); g.closePath(); g.fillStyle = '#1a2330'; g.fill();
      if(num != null) numero(g, num, (xp + xt) / 2, 0, Math.min(.9, (xp - xt) * .78), Math.PI / 2, tom(cor, luz(cor2) > .5 ? -.2 : .9), 'rgba(0,0,0,.55)');
      /* adesivos de patrocínio no capô e na traseira */
      g.fillStyle = luz(cor) > .7 ? 'rgba(20,22,26,.7)' : 'rgba(255,255,255,.85)';
      ret(g, L * .2, L * .27, -h * .55, -h * .15, .04); g.fill(); ret(g, -L * .42, -L * .32, h * .15, h * .55, .04); g.fill();
      /* capô: número e respiros */
      if(tipo === 'nascar' && num != null) numero(g, num, L * .34, 0, .62, Math.PI / 2, cor2, 'rgba(0,0,0,.6)');
      if(tipo === 'gt3'){ g.fillStyle = 'rgba(0,0,0,.55)'; for(const s of [1, -1]) { ret(g, L * .3, L * .38, s * .3 - .12, s * .3 + .12, .04); g.fill(); } }
      /* faróis e lanternas */
      g.fillStyle = tipo === 'nascar' ? 'rgba(255,240,180,.75)' : '#f3f6fa';
      for(const s of [1, -1]){ ret(g, L / 2 - .2, L / 2 - .04, s * h * .7 - .14, s * h * .7 + .14, .05); g.fill(); }
      g.fillStyle = '#d0151a'; for(const s of [1, -1]){ ret(g, -L / 2 + .02, -L / 2 + .14, s * h * .72 - .16, s * h * .72 + .16, .04); g.fill(); }
      /* espelhos */
      g.fillStyle = tom(cor, -.2); for(const s of [1, -1]){ ret(g, xp - .05, xp + .12, s * (h + .04) - .06, s * (h + .04) + .06, .03); g.fill(); }
      /* aerofólio */
      if(tipo === 'nascar' || tipo === 'stock'){ g.fillStyle = CARBONO; ret(g, -L / 2 + .02, -L / 2 + .16, -h * .92, h * .92, .03); g.fill(); }
      else { g.fillStyle = CARBONO; for(const s of [1, -1]){ ret(g, -L / 2 + .25, -L / 2 + .55, s * .45 - .03, s * .45 + .03); g.fill(); }
        asa(g, -L / 2 + .12, .34, W * .9, 2, cor, tom(cor, .2), { placas: .4, corPlaca: cor2 }); }
      g.fillStyle = CARBONO; ret(g, L / 2 - .02, L / 2 + .08, -h * .85, h * .85, .03); g.fill();
    } else {
      /* protótipo: cabine fechada, barbatana, asa traseira, faróis e a barra de luz atrás */
      const cx = L * .1;
      g.beginPath(); g.ellipse(cx, 0, .78, .42, 0, 0, Math.PI * 2);
      const gv = g.createRadialGradient(cx + .2, -.15, .05, cx, 0, .8); gv.addColorStop(0, '#6f87a0'); gv.addColorStop(1, '#141b24'); g.fillStyle = gv; g.fill();
      g.strokeStyle = tom(cor, -.3); g.lineWidth = .04; g.stroke();
      g.strokeStyle = tom(cor, -.35); g.lineWidth = .045; g.beginPath(); g.moveTo(cx - .75, 0); g.lineTo(-L / 2 + .35, 0); g.stroke();
      g.fillStyle = 'rgba(0,0,0,.6)'; for(const s of [1, -1]){ ret(g, -.2, .35, s * h * .62 - .07, s * h * .62 + .07, .03); g.fill(); }
      g.fillStyle = '#f3f6fa'; for(const s of [1, -1]){ g.beginPath(); g.ellipse(L / 2 - .38, s * h * .78, .22, .07, s * .3, 0, Math.PI * 2); g.fill(); }
      asa(g, -L / 2 + .1, .32, W * .96, 1, cor, tom(cor, .2), { placas: .5, corPlaca: cor2 });
      g.fillStyle = '#ff2a2a'; ret(g, -L / 2 - .02, -L / 2 + .04, -h * .8, h * .8, .02); g.fill();
      if(num != null){ g.fillStyle = '#f4f4f2'; ret(g, L * .26, L * .26 + .5, -.32, .32, .08); g.fill(); numero(g, num, L * .26 + .25, 0, .42, Math.PI / 2, '#111', 'rgba(255,255,255,0)'); }
    }
  }

  function kart(g, cor, cor2, num, capCor){
    pneu(g, .5, .52, .3, .2); pneu(g, .5, -.52, .3, .2); pneu(g, -.6, .58, .32, .26); pneu(g, -.6, -.58, .32, .26);
    g.strokeStyle = '#8f949b'; g.lineWidth = .045; g.beginPath(); g.moveTo(.55, -.4); g.lineTo(.55, .4); g.moveTo(-.6, -.48); g.lineTo(-.6, .48); g.moveTo(.5, -.2); g.lineTo(-.6, -.3); g.moveTo(.5, .2); g.lineTo(-.6, .3); g.stroke();
    /* laterais, bico e para-choque */
    const gc = corpo(g, cor, .7);
    for(const s of [1, -1]){ ret(g, -.4, .25, s * .52 - .1, s * .52 + .1, .08); g.fillStyle = gc; g.fill(); }
    caminhoSim(g, [[.92, .1], [.85, .38], [.62, .42], [.58, .3]]); g.fillStyle = gc; g.fill();
    g.fillStyle = cor2; ret(g, .66, .86, -.15, .15, .05); g.fill();
    if(num != null) numero(g, num, .76, 0, .2, Math.PI / 2, '#111', 'rgba(255,255,255,0)');
    g.fillStyle = CARBONO; ret(g, -.9, -.78, -.6, .6, .05); g.fill();
    /* banco, piloto e volante */
    ret(g, -.42, .02, -.2, .2, .1); g.fillStyle = '#16181b'; g.fill();
    g.beginPath(); g.ellipse(-.15, 0, .16, .26, 0, 0, Math.PI * 2); g.fillStyle = tom(cor2, -.15); g.fill();
    capacete(g, -.1, 0, .13, capCor);
    g.strokeStyle = '#111'; g.lineWidth = .04; g.beginPath(); g.arc(.18, 0, .1, -Math.PI / 2, Math.PI / 2); g.stroke();
  }

  C2D.Arte = {
    ESC, estilo, segunda, tom, COMP, FORM,
    /* as peças de desenho, para o catálogo de carros (estilos2d.js) */
    lib: { caminhoSim, ret, corpo, carbono, pneu, capacete, numero, asa, formula, fechado, kart, tom, luz, hash, CARBONO, CARBONO2 },
    /* o desenho guardado do carro c (sprite): { cv, w, h } em metros */
    _cache: new Map(),
    carro(c, comp){
      const sp = c.sp, est = sp.estilo || estilo('f1', 2024, 0, false);
      const cor = c.cor || '#e2231a', cor2 = c.cor2 || segunda(cor, c.eq || c.id), num = c.num != null ? c.num : null;
      const falta = c.mascara || '';
      const k = [est, cor, cor2, num, c.me ? 1 : 0, comp || '', falta].join('|');
      let s = C2D.Arte._cache.get(k);
      if(s) return s;
      const L = sp.comp, W = sp.larg, mx = L / 2 + .45, my = W / 2 + .35;
      const cw = Math.ceil(mx * 2 * ESC), ch = Math.ceil(my * 2 * ESC);
      const cv = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(cw, ch) : Object.assign(document.createElement('canvas'), { width: cw, height: ch });
      const g = cv.getContext('2d');
      g.translate(cw / 2, ch / 2); g.scale(ESC, ESC);
      const capCor = c.me ? '#f0c12e' : tom(cor2, luz(cor2) > .85 ? -.1 : 0);
      const padrao = hash(c.eq || cor) % 4;
      const compCor = comp ? COMP[comp] : null;
      /* as proporções de cada estilo são de um carro "padrão"; o desenho se ajusta ao tamanho do carro */
      const E = C2D.Estilos && C2D.Estilos.DEF[est];
      const faltam = falta ? new Set(falta.split(',')) : null;
      g.save();
      if(E && E.f) C2D.Estilos.desenhar(g, E, { cor, cor2, num, capCor, compCor, padrao, L, W, est, faltam });
      else if(est === 'kart'){ g.scale(L / 1.85, W / 1.35); kart(g, cor, cor2, num, capCor); }
      else if(FORM[est]){ const base = C2D.Arte.semPecas(FORM[est], faltam); const Lb = (FORM[est].asaD ? FORM[est].asaD.x : FORM[est].bico[0]) - (FORM[est].asaT ? FORM[est].asaT.x - FORM[est].asaT.prof : FORM[est].motor[1]) ; g.scale(L / Math.max(3, Lb + .05), W / 2); formula(g, base, cor, cor2, num, capCor, compCor, padrao, est); }
      else fechado(g, est, L, W, cor, cor2, num, capCor, compCor, padrao);
      g.restore();
      /* o que foi arrancado: a estrutura aparecendo e o cubo da roda */
      if(faltam) C2D.Arte.buracos(g, faltam, L, W, est);
      /* o contorno escuro em volta do carro inteiro (lê contra asfalto, grama e brita) */
      const oc = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(cw, ch) : Object.assign(document.createElement('canvas'), { width: cw, height: ch });
      const go = oc.getContext('2d');
      for(const [dx, dy] of [[2, 0], [-2, 0], [0, 2], [0, -2], [1.4, 1.4], [-1.4, -1.4], [1.4, -1.4], [-1.4, 1.4]]) go.drawImage(cv, dx, dy);
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
