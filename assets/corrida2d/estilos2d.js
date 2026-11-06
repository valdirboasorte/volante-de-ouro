/* Corrida 2D: o catálogo de carros de todas as categorias do modo piloto.
   Cada campeonato do banco histórico, em cada época, aponta para o carro que ele usava
   de verdade (o chassi da monomarca, a geração do regulamento): a Tatuus F4-T014 e a T421
   da F4, a Dallara de cada F3, a Lola da F3000, as três GP2, o roadster da Indy de 1955,
   o Opala da Stock Car, a pickup da NASCAR Truck, o Grupo C, o 917, o Can-Am, o DPi...
   e as categorias de base das escadas (midget e sprint car de terra, modificado da
   NASCAR, late model, carretera, kart de cada época).
   O desenho é de cada tipo de carro; a pintura é a da equipe. */
(function(raiz){
  const C2D = raiz.C2D;
  const A = () => C2D.Arte.lib;

  /* ─────────── desenhos que faltavam ─────────── */

  /* fórmula de motor dianteiro (F1 dos anos 50, roadster da Indy, Fórmula Júnior de motor na frente) */
  function frente(g, p, o){
    const { caminhoSim, ret, corpo, pneu, capacete, numero, tom, CARBONO } = A();
    const L = p.L0, hW = p.W0 / 2, off = p.offset || 0, gc = corpo(g, o.cor, hW);
    const rF = p.rF, rT = p.rT;
    for(const s of [1, -1]){ pneu(g, rF[0], s * rF[1], rF[2], rF[3], { arame: true }); pneu(g, rT[0], s * rT[1] + (p.stagger && s < 0 ? -.03 : 0), rT[2], rT[3] * (p.stagger && s > 0 ? 1.12 : 1), { arame: true }); }
    g.strokeStyle = '#3a3d42'; g.lineWidth = .045;
    for(const s of [1, -1]){ g.beginPath(); g.moveTo(rF[0], s * rF[1] * .8); g.lineTo(rF[0] - .1, s * .18); g.moveTo(rT[0], s * rT[1] * .8); g.lineTo(rT[0] + .1, s * .2); g.stroke(); }
    const pts = [[L / 2, .16], [L / 2 - .15, .24], [L * .2, p.capo || .3], [-L * .05, p.corpoW || .36], [-L * .3, .3], [-L / 2 + .2, .15], [-L / 2, .05]];
    g.save(); g.translate(0, off); caminhoSim(g, pts); g.fillStyle = gc; g.fill(); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = .02; g.stroke();
    /* grade do radiador, persianas do capô, faixa */
    g.fillStyle = '#16181b'; g.beginPath(); g.ellipse(L / 2 - .05, 0, .06, .15, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = .02; for(let q = 0; q < 5; q++){ const x = L * .3 - q * .12; g.beginPath(); g.moveTo(x, -.18); g.lineTo(x - .05, -.08); g.moveTo(x, .18); g.lineTo(x - .05, .08); g.stroke(); }
    g.fillStyle = o.cor2; ret(g, -L / 2 + .2, L / 2 - .1, -.03, .03); g.fill();
    /* cockpit lá atrás, para-brisa pequeno, encosto */
    const cx = p.cockX != null ? p.cockX : -L * .12;
    ret(g, cx - .3, cx + .25, -.22, .22, .18); g.fillStyle = '#0b0c0e'; g.fill();
    g.strokeStyle = 'rgba(200,220,235,.8)'; g.lineWidth = .035; g.beginPath(); g.ellipse(cx + .28, 0, .05, .22, 0, -Math.PI / 2, Math.PI / 2); g.stroke();
    capacete(g, cx - .05, 0, .13, o.capCor);
    if(p.encosto){ ret(g, cx - .65, cx - .3, -.1, .1, .08); g.fillStyle = gc; g.fill(); }
    g.restore();
    /* escapamento por fora */
    g.strokeStyle = '#b7bcc4'; g.lineWidth = .05; g.beginPath(); g.moveTo(L * .2, .3 + off); g.quadraticCurveTo(-L * .1, .4 + off, -L * .35, .34 + off); g.stroke();
    /* o número num círculo do lado e no bico */
    g.beginPath(); g.arc(L * .08, -.0 + off, .17, 0, Math.PI * 2); g.fillStyle = '#f4f4f2'; g.fill();
    if(o.num != null) numero(g, o.num, L * .08, off, .2, Math.PI / 2, '#111', 'rgba(255,255,255,0)');
    if(p.santantonio){ g.strokeStyle = CARBONO; g.lineWidth = .06; g.beginPath(); g.moveTo(cx - .32, -.2 + off); g.lineTo(cx - .32, .2 + off); g.stroke(); }
  }

  /* midget e sprint car: motor na frente, gaiola em cima do piloto, nerf bars, pneu traseiro
     direito bem maior (as curvas são todas para a esquerda); o sprint pode ter a asa enorme */
  function sprint(g, p, o){
    const { ret, corpo, pneu, capacete, numero, tom, CARBONO } = A();
    const L = p.L0, gc = corpo(g, o.cor, .5);
    const xf = L * .34, xt = -L * .3, yf = p.yF || .62, yt = p.yT || .66;
    pneu(g, xf, yf, .5, .26); pneu(g, xf, -yf, .5, .26);
    pneu(g, xt, yt, .62, .34); pneu(g, xt, -yt - .02, .72, .46);
    /* nerf bars e eixos */
    g.strokeStyle = '#9aa0a8'; g.lineWidth = .045;
    for(const s of [1, -1]){ g.beginPath(); g.moveTo(xf - .28, s * yf); g.lineTo(xt + .34, s * yt); g.stroke(); }
    g.beginPath(); g.moveTo(xf, -yf + .1); g.lineTo(xf, yf - .1); g.moveTo(xt, -yt + .1); g.lineTo(xt, yt - .1); g.stroke();
    /* capô, cockpit e tanque traseiro */
    ret(g, xf - .25, L / 2, -.22, .22, .12); g.fillStyle = gc; g.fill();
    g.fillStyle = '#1a1c20'; ret(g, L / 2 - .06, L / 2 + .02, -.14, .14, .03); g.fill();
    ret(g, xt + .15, xf - .2, -.32, .32, .1); g.fillStyle = gc; g.fill();
    ret(g, -L / 2, xt + .15, -.3, .3, .14); g.fillStyle = tom(o.cor, -.15); g.fill();
    capacete(g, -.02, 0, .14, o.capCor);
    /* a gaiola (o arco de proteção) */
    g.strokeStyle = '#2a2d31'; g.lineWidth = .06; ret(g, -.35, .3, -.3, .3, .06); g.stroke();
    g.beginPath(); g.moveTo(-.35, 0); g.lineTo(.3, 0); g.stroke();
    if(p.asa){
      /* a asa de cima (do tamanho do carro) e a do bico, com as placas laterais */
      const aw = p.asa;
      g.fillStyle = 'rgba(0,0,0,.25)'; ret(g, -.55 + .06, .55 + .06, -aw / 2 + .06, aw / 2 + .06, .05); g.fill();
      ret(g, -.55, .55, -aw / 2, aw / 2, .05); g.fillStyle = o.cor2; g.fill();
      g.fillStyle = gc; ret(g, -.55, .55, -aw / 2 + .08, aw / 2 - .08, .03); g.fill();
      g.fillStyle = o.cor2; ret(g, -.6, .6, -aw / 2 - .02, -aw / 2 + .06, .02); g.fill(); ret(g, -.6, .6, aw / 2 - .06, aw / 2 + .02, .02); g.fill();
      if(o.num != null) numero(g, o.num, 0, 0, .7, Math.PI / 2, '#fff');
      ret(g, L / 2 - .05, L / 2 + .35, -.42, .42, .04); g.fillStyle = o.cor2; g.fill();
    } else if(o.num != null) numero(g, o.num, xt + .4, 0, .28, Math.PI / 2, '#fff');
  }

  /* modificado da NASCAR: carroceria de carro de corrida, rodas da frente para fora */
  function modificado(g, p, o){
    const { caminhoSim, ret, corpo, pneu, capacete, numero, tom, CARBONO } = A();
    const L = p.L0, gc = corpo(g, o.cor, .9);
    pneu(g, L * .32, .82, .66, .3); pneu(g, L * .32, -.82, .66, .3);
    pneu(g, -L * .3, .8, .72, .34); pneu(g, -L * .3, -.8, .72, .34);
    g.strokeStyle = '#3a3d42'; g.lineWidth = .05; g.beginPath(); g.moveTo(L * .32, -.68); g.lineTo(L * .32, .68); g.stroke();
    caminhoSim(g, [[L / 2, .3], [L * .3, .42], [L * .05, .55], [-L * .2, .72], [-L / 2 + .1, .72], [-L / 2, .65]]); g.fillStyle = gc; g.fill();
    ret(g, -L * .18, L * .05, -.5, .5, .1); g.fillStyle = tom(o.cor2, 0); g.fill();
    g.fillStyle = '#1a2330'; ret(g, L * .05, L * .12, -.44, .44, .04); g.fill();
    if(o.num != null) numero(g, o.num, -L * .07, 0, .55, Math.PI / 2, o.cor, 'rgba(0,0,0,.5)');
    g.fillStyle = CARBONO; ret(g, -L / 2 + .02, -L / 2 + .18, -.7, .7, .03); g.fill();
  }

  /* carro de turismo, de estoque, GT, sedã ou SUV (carroceria fechada genérica, com parâmetros) */
  function carroceria(g, p, o){
    const { caminhoSim, ret, corpo, pneu, numero, asa, tom, luz, CARBONO } = A();
    const L = o.L, W = o.W, h = W / 2, gc = corpo(g, o.cor, h);
    const xF = L * (p.rodas ? p.rodas[0] : .32), xT = -L * (p.rodas ? p.rodas[1] : .3);
    const pb = p.paralamas || 0;
    for(const s of [1, -1]) for(const x of [xF, xT]) pneu(g, x, s * (h - .2 + (p.rodasFora || 0)), p.pneuL || .68, p.pneuW || .32, { comp: p.gt ? o.compCor : null });
    const nR = p.nariz != null ? p.nariz : .6, tR = p.traseira != null ? p.traseira : .9;
    const pts = [[L / 2, h * nR], [L / 2 - .15, h * (nR + (1 - nR) * .7)]];
    if(pb){ pts.push([xF + .45, h * (1 - pb * .4)], [xF, h * (1 + pb)], [xF - .55, h * (1 - pb)], [xT + .55, h * (1 - pb)], [xT, h * (1 + pb)], [xT - .45, h * (1 - pb * .4)]); }
    else pts.push([L * .25, h], [-L * .3, h]);
    pts.push([-L / 2 + .15, h * (tR + (1 - tR) * .5)], [-L / 2, h * tR]);
    caminhoSim(g, pts); g.fillStyle = gc; g.fill(); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = .025; g.stroke();
    /* pintura */
    g.save(); caminhoSim(g, pts); g.clip(); g.fillStyle = o.cor2;
    const pd = o.padrao;
    if(pd === 0){ ret(g, -L / 2, L / 2, -.14, -.06); g.fill(); ret(g, -L / 2, L / 2, .06, .14); g.fill(); }
    else if(pd === 1){ g.beginPath(); g.moveTo(L / 2, -h); g.lineTo(L / 2 - 1.2, -h); g.lineTo(-L / 2 + .6, h); g.lineTo(-L / 2 + 1.6, h); g.closePath(); g.fill(); }
    else if(pd === 2){ ret(g, -L / 2, -L * .1, -h, h); g.fill(); }
    else { ret(g, L / 2 - .7, L / 2, -h, h); g.fill(); }
    const br = g.createLinearGradient(0, -h, 0, h * .3); br.addColorStop(0, 'rgba(255,255,255,.25)'); br.addColorStop(.55, 'rgba(255,255,255,0)'); g.fillStyle = br; g.fillRect(-L, -h, 2 * L, h * 1.3);
    g.restore();
    /* cabine: para-brisa, teto, vidro traseiro (o SUV e a van têm o teto comprido) */
    const [c0, c1, cw] = p.cab || [L * .12, -L * .2, .76];
    const vF = p.vidroF || .5, vT = p.vidroT || .38;
    g.beginPath(); g.moveTo(c0 + vF, -h * cw * .92); g.lineTo(c0, -h * cw); g.lineTo(c0, h * cw); g.lineTo(c0 + vF, h * cw * .92); g.closePath();
    const gv = g.createLinearGradient(c0, 0, c0 + vF, 0); gv.addColorStop(0, '#1a2330'); gv.addColorStop(1, '#5b7086'); g.fillStyle = gv; g.fill();
    ret(g, c1, c0, -h * cw, h * cw, .1); g.fillStyle = p.tetoCor === 'cor' ? tom(o.cor, .08) : tom(o.cor2, -.05); g.fill();
    if(vT > 0){ g.beginPath(); g.moveTo(c1, -h * cw * .97); g.lineTo(c1 - vT, -h * cw * .86); g.lineTo(c1 - vT, h * cw * .86); g.lineTo(c1, h * cw * .97); g.closePath(); g.fillStyle = '#1a2330'; g.fill(); }
    if(p.tomadaTeto){ ret(g, c0 - .45, c0 - .1, -.12, .12, .05); g.fillStyle = '#0d0e10'; g.fill(); }
    if(p.tetoNum !== false && o.num != null) numero(g, o.num, (c0 + c1) / 2, 0, Math.min(.85, (c0 - c1) * .75, h * cw * 1.6), Math.PI / 2, tom(o.cor, luz(o.cor2) > .5 ? -.2 : .9), 'rgba(0,0,0,.55)');
    if(p.capoNum){
      /* o adesivo do patrocinador principal no capô (forma clara, sem marca) */
      const x0 = (p.cab ? p.cab[0] : L * .12) + (p.vidroF || .5) + .15, x1 = L / 2 - .35;
      if(x1 - x0 > .4){ ret(g, x0, x1, -h * .62, h * .62, .12); g.fillStyle = o.cor2; g.fill();
        g.fillStyle = luz(o.cor2) > .6 ? 'rgba(20,22,26,.8)' : 'rgba(255,255,255,.9)'; ret(g, x0 + (x1 - x0) * .2, x1 - (x1 - x0) * .2, -h * .36, h * .36, .06); g.fill(); }
      /* o número nas portas aparece de lado: um pedaço dele na borda */
      if(o.num != null){ g.fillStyle = 'rgba(255,255,255,.9)'; for(const s of [1, -1]){ ret(g, (p.cab ? p.cab[1] : -L * .2) + .1, (p.cab ? p.cab[0] : L * .12) - .1, s * h * .9 - .05, s * h * .9 + .05, .03); g.fill(); } }
    }
    /* adesivos, respiros, faróis, lanternas, retrovisores */
    g.fillStyle = luz(o.cor) > .7 ? 'rgba(20,22,26,.7)' : 'rgba(255,255,255,.85)';
    ret(g, L * .2, L * .27, -h * .55, -h * .15, .04); g.fill(); ret(g, -L * .42, -L * .32, h * .15, h * .55, .04); g.fill();
    if(p.respiros){ g.fillStyle = 'rgba(0,0,0,.55)'; for(const s of [1, -1]){ ret(g, L * .3, L * .38, s * .3 - .12, s * .3 + .12, .04); g.fill(); } }
    if(p.capoCentral){ ret(g, L * .22, L * .4, -.16, .16, .05); g.fillStyle = 'rgba(0,0,0,.45)'; g.fill(); }
    const fr = p.farois || 'retos';
    if(fr === 'redondos'){ g.fillStyle = '#f3f6fa'; for(const s of [1, -1]){ g.beginPath(); g.arc(L / 2 - .2, s * h * .68, .13, 0, Math.PI * 2); g.fill(); if(p.farois4){ g.beginPath(); g.arc(L / 2 - .2, s * h * .38, .1, 0, Math.PI * 2); g.fill(); } } }
    else if(fr === 'finos'){ g.fillStyle = '#f3f6fa'; for(const s of [1, -1]){ ret(g, L / 2 - .28, L / 2 - .1, s * h * .6 - .2, s * h * .6 + .2, .04); g.fill(); } }
    else if(fr === 'adesivo'){ g.fillStyle = 'rgba(255,240,180,.75)'; for(const s of [1, -1]){ ret(g, L / 2 - .2, L / 2 - .04, s * h * .7 - .14, s * h * .7 + .14, .05); g.fill(); } }
    else { g.fillStyle = '#f3f6fa'; for(const s of [1, -1]){ ret(g, L / 2 - .2, L / 2 - .04, s * h * .7 - .16, s * h * .7 + .16, .05); g.fill(); } }
    g.fillStyle = '#d0151a'; if(p.lanterna === 'barra'){ ret(g, -L / 2 + .02, -L / 2 + .1, -h * .8, h * .8, .03); g.fill(); } else for(const s of [1, -1]){ ret(g, -L / 2 + .02, -L / 2 + .14, s * h * .72 - .16, s * h * .72 + .16, .04); g.fill(); }
    if(p.retro !== false){ g.fillStyle = tom(o.cor, -.2); for(const s of [1, -1]){ ret(g, c0 - .05, c0 + .12, s * (h + .04) - .06, s * (h + .04) + .06, .03); g.fill(); } }
    if(p.splitter){ g.fillStyle = CARBONO; ret(g, L / 2 - .02, L / 2 + .1, -h * .88, h * .88, .03); g.fill(); }
    if(p.cacamba){ ret(g, -L / 2 + .2, c1 - .1, -h * .82, h * .82, .05); g.fillStyle = tom(o.cor, -.2); g.fill(); g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = .03; g.stroke(); }
    /* o que vai atrás: spoiler, asa (em pilares), asa alta */
    const as = p.asa || 'spoiler';
    if(as === 'spoiler'){ g.fillStyle = CARBONO; ret(g, -L / 2 + .02, -L / 2 + .16, -h * .92, h * .92, .03); g.fill(); }
    else if(as === 'asa' || as === 'alta' || as === 'gt500'){
      g.fillStyle = CARBONO; for(const s of [1, -1]){ ret(g, -L / 2 + .25, -L / 2 + .55, s * .45 - .03, s * .45 + .03); g.fill(); }
      const ap = as === 'gt500' ? .42 : .34, ax = as === 'alta' ? -L / 2 + .05 : -L / 2 + .12;
      asa(g, ax, ap, W * (as === 'gt500' ? .98 : .9), as === 'gt500' ? 3 : 2, o.cor, tom(o.cor, .2), { placas: .4, corPlaca: o.cor2 });
    } else if(as === 'pato'){ g.fillStyle = tom(o.cor, -.25); ret(g, -L / 2, -L / 2 + .35, -h * .7, h * .7, .12); g.fill(); }
    else if(as === 'bico'){ /* os aero warriors: bico em cunha e a asa altíssima */
      g.fillStyle = tom(o.cor, -.2); ret(g, -L / 2 - .1, -L / 2 + .2, -h * .9, h * .9, .04); g.fill();
      g.fillStyle = CARBONO; for(const s of [1, -1]){ ret(g, -L / 2 + .05, -L / 2 + .35, s * h * .85 - .04, s * h * .85 + .04); g.fill(); } }
    if(p.difusor){ g.fillStyle = CARBONO; ret(g, -L / 2 - .06, -L / 2 + .02, -h * .7, h * .7, .02); g.fill(); }
  }

  /* carro antigo: para-lamas separados, capô comprido, cabine redonda (jalopy, carretera,
     sportsman, a NASCAR dos anos 50, os sedãs do turismo dos anos 60) */
  function antigo(g, p, o){
    const { caminhoSim, ret, corpo, pneu, numero, tom, luz } = A();
    const L = o.L, W = o.W, h = W / 2, gc = corpo(g, o.cor, h);
    const xF = L * .32, xT = -L * .3;
    for(const s of [1, -1]) for(const x of [xF, xT]) pneu(g, x, s * (h - .16), .62, .26);
    if(p.paralamasSoltos){
      for(const s of [1, -1]) for(const x of [xF, xT]){ g.beginPath(); g.ellipse(x, s * (h - .2), .5, .3, 0, 0, Math.PI * 2); g.fillStyle = gc; g.fill(); g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = .02; g.stroke(); }
      caminhoSim(g, [[L / 2 - .05, h * .45], [L / 2 - .3, h * .62], [-L / 2 + .3, h * .7], [-L / 2, h * .55]]); g.fillStyle = gc; g.fill();
    } else { caminhoSim(g, [[L / 2, h * .62], [L / 2 - .25, h * .95], [-L / 2 + .3, h], [-L / 2, h * .8]]); g.fillStyle = gc; g.fill(); g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = .025; g.stroke(); }
    /* grade cromada, capô com friso, para-brisa curvo, teto arredondado */
    g.fillStyle = '#c9ccd1'; ret(g, L / 2 - .08, L / 2 + .02, -h * .5, h * .5, .04); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = .03; g.beginPath(); g.moveTo(L / 2 - .1, 0); g.lineTo(L * .08, 0); g.stroke();
    const c0 = p.cab ? p.cab[0] : L * .05, c1 = p.cab ? p.cab[1] : -L * .22, cw = h * .74;
    /* para-brisa e vidro de trás curvos, o teto arredondado */
    ret(g, c1 - .34, c0 + .42, -cw, cw, .3); g.fillStyle = '#1a2330'; g.fill();
    g.strokeStyle = 'rgba(140,170,195,.45)'; g.lineWidth = .04; g.beginPath(); g.ellipse(c0 + .18, 0, .14, cw * .9, 0, -Math.PI / 2, Math.PI / 2); g.stroke();
    ret(g, c1, c0, -cw * .92, cw * .92, .22); g.fillStyle = p.tetoCor2 ? tom(o.cor2, -.05) : tom(o.cor, .06); g.fill();
    g.strokeStyle = 'rgba(0,0,0,.22)'; g.lineWidth = .02; g.stroke();
    /* para-choques cromados na frente e atrás, faróis redondos e lanternas */
    g.fillStyle = '#d5d8dd'; ret(g, L / 2 - .04, L / 2 + .05, -h * .82, h * .82, .04); g.fill(); ret(g, -L / 2 - .05, -L / 2 + .04, -h * .82, h * .82, .04); g.fill();
    g.fillStyle = '#f3f6fa'; for(const s of [1, -1]){ g.beginPath(); g.arc(L / 2 - .15, s * h * .62, .11, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = '#c0121a'; for(const s of [1, -1]){ ret(g, -L / 2 + .04, -L / 2 + .14, s * h * .68 - .09, s * h * .68 + .09, .03); g.fill(); }
    if(o.num != null){ const rr = Math.min(.3, (c0 - c1) * .3, cw * .62), xm = (c0 + c1) / 2; g.beginPath(); g.arc(xm, 0, rr, 0, Math.PI * 2); g.fillStyle = '#f4f4f2'; g.fill(); numero(g, o.num, xm, 0, rr * 1.15, Math.PI / 2, '#111', 'rgba(255,255,255,0)'); }
    if(p.gaiola){ g.strokeStyle = '#2a2d31'; g.lineWidth = .05; g.beginPath(); g.moveTo(c0, -h * .6); g.lineTo(c1, h * .6); g.stroke(); }
  }

  /* Porsche 911 (Carrera Cup, Supercup): frente redonda com os dois faróis, motor atrás e a asa */
  function p911(g, p, o){
    const { caminhoSim, ret, corpo, pneu, numero, asa, tom } = A();
    const L = o.L, W = o.W, h = W / 2, gc = corpo(g, o.cor, h);
    for(const s of [1, -1]){ pneu(g, L * .3, s * (h - .2), .62, .3, { comp: o.compCor }); pneu(g, -L * .28, s * (h - .18), .66, .34, { comp: o.compCor }); }
    caminhoSim(g, [[L / 2, h * .5], [L / 2 - .25, h * .92], [L * .3, h * 1.02], [L * .05, h * .82], [-L * .15, h * .9], [-L * .3, h * 1.04], [-L / 2 + .2, h * .9], [-L / 2, h * .7]]);
    g.fillStyle = gc; g.fill(); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = .025; g.stroke();
    g.fillStyle = '#f3f6fa'; for(const s of [1, -1]){ g.beginPath(); g.ellipse(L / 2 - .3, s * h * .66, .16, .13, 0, 0, Math.PI * 2); g.fill(); }
    g.beginPath(); g.moveTo(L * .12 + .5, -h * .58); g.lineTo(L * .12, -h * .66); g.lineTo(L * .12, h * .66); g.lineTo(L * .12 + .5, h * .58); g.closePath(); g.fillStyle = '#2a3646'; g.fill();
    g.beginPath(); g.ellipse(-L * .08, 0, L * .2, h * .64, 0, 0, Math.PI * 2); g.fillStyle = tom(o.cor2, -.05); g.fill();
    g.fillStyle = '#1a2330'; ret(g, -L * .3, -L * .24, -h * .5, h * .5, .1); g.fill();
    if(o.num != null) numero(g, o.num, -L * .08, 0, .55, Math.PI / 2, o.cor, 'rgba(0,0,0,.5)');
    g.fillStyle = 'rgba(0,0,0,.5)'; for(let q = 0; q < 4; q++){ ret(g, -L * .42 + q * .1, -L * .42 + q * .1 + .05, -h * .3, h * .3); g.fill(); }
    if(p.asaGrande && !o.semAsa){
      g.fillStyle = A().CARBONO; for(const s of [1, -1]){ ret(g, -L / 2 + .3, -L / 2 + .6, s * .4 - .03, s * .4 + .03); g.fill(); }
      asa(g, -L / 2 - .02, .42, W * .96, 2, o.cor, tom(o.cor, .2), { placas: .45, corPlaca: o.cor2 });
      g.fillStyle = A().CARBONO; ret(g, L / 2 - .02, L / 2 + .1, -h * .85, h * .85, .03); g.fill();
    } else if(!o.semAsa) asa(g, -L / 2 + .08, .3, W * .82, 1, o.cor, tom(o.cor, .2), { placas: .32, corPlaca: o.cor2 });
    g.fillStyle = '#d0151a'; ret(g, -L / 2 + .02, -L / 2 + .08, -h * .78, h * .78, .03); g.fill();
  }

  /* protótipo de endurance de cada época: Grupo C, 917, P4, Can-Am, LMP1, LMP2, DP, DPi, hipercarro */
  function prototipo(g, p, o){
    const { caminhoSim, ret, corpo, pneu, capacete, numero, asa, tom, CARBONO } = A();
    const L = o.L, W = o.W, h = W / 2, gc = corpo(g, o.cor, h);
    const xF = L * (p.rF || .32), xT = -L * (p.rT || .3);
    for(const s of [1, -1]){ pneu(g, xF, s * (h - .2), .66, .3, { comp: o.compCor }); pneu(g, xT, s * (h - .2), .72, .36, { comp: o.compCor }); }
    const fx = p.paralama || .95, meio = p.meio || .6, caud = p.cauda || .8;
    const pts = [[L / 2, h * (p.bico || .32)], [L / 2 - .25, h * .6], [xF + .3, h * fx], [xF - .4, h * fx * .98], [L * .02, h * meio], [xT + .5, h * fx * .95], [xT, h * fx], [-L / 2 + .2, h * caud], [-L / 2, h * caud * .9]];
    caminhoSim(g, pts); g.fillStyle = gc; g.fill(); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = .025; g.stroke();
    g.save(); caminhoSim(g, pts); g.clip(); g.fillStyle = o.cor2;
    if(o.padrao === 0){ ret(g, -L / 2, L / 2, -.1, .1); g.fill(); }
    else if(o.padrao === 1){ g.beginPath(); g.moveTo(L / 2, -h); g.lineTo(L / 2 - 1, -h); g.lineTo(-L / 2 + .6, h); g.lineTo(-L / 2 + 1.6, h); g.closePath(); g.fill(); }
    else if(o.padrao === 2){ ret(g, -L / 2, -L * .15, -h, h); g.fill(); }
    else { ret(g, L * .25, L / 2, -h, h); g.fill(); }
    const br = g.createLinearGradient(0, -h, 0, h * .3); br.addColorStop(0, 'rgba(255,255,255,.22)'); br.addColorStop(.55, 'rgba(255,255,255,0)'); g.fillStyle = br; g.fillRect(-L, -h, 2 * L, h * 1.3);
    g.restore();
    const cx = L * (p.cabX != null ? p.cabX : .08);
    if(p.aberto){
      /* barchetta e protótipo aberto: o cockpit com o piloto e o santantônio */
      ret(g, cx - .45, cx + .3, -.32, .32, .14); g.fillStyle = '#0b0c0e'; g.fill();
      capacete(g, cx - .1, p.ladoPiloto || 0, .14, o.capCor);
      g.strokeStyle = 'rgba(200,220,235,.7)'; g.lineWidth = .035; g.beginPath(); g.ellipse(cx + .32, 0, .06, .34, 0, -Math.PI / 2, Math.PI / 2); g.stroke();
      if(p.santantonio !== false){ g.strokeStyle = CARBONO; g.lineWidth = .07; g.beginPath(); g.moveTo(cx - .5, -.3); g.lineTo(cx - .5, .3); g.stroke(); }
    } else {
      g.beginPath(); g.ellipse(cx, 0, p.cabC || .78, p.cabW || .42, 0, 0, Math.PI * 2);
      const gv = g.createRadialGradient(cx + .2, -.15, .05, cx, 0, .8); gv.addColorStop(0, '#6f87a0'); gv.addColorStop(1, '#141b24'); g.fillStyle = gv; g.fill();
      g.strokeStyle = tom(o.cor, -.3); g.lineWidth = .04; g.stroke();
    }
    if(p.barbatana){ g.strokeStyle = tom(o.cor, -.35); g.lineWidth = .045; g.beginPath(); g.moveTo(cx - .75, 0); g.lineTo(-L / 2 + .35, 0); g.stroke(); }
    if(p.tomadas !== false){ g.fillStyle = 'rgba(0,0,0,.6)'; for(const s of [1, -1]){ ret(g, -.2, .35, s * h * .62 - .07, s * h * .62 + .07, .03); g.fill(); } }
    const fr = p.farois || 'pares';
    g.fillStyle = '#f3f6fa';
    if(fr === 'pares'){ for(const s of [1, -1]){ g.beginPath(); g.ellipse(L / 2 - .38, s * h * .78, .22, .07, s * .3, 0, Math.PI * 2); g.fill(); } }
    else if(fr === 'redondos'){ for(const s of [1, -1]){ g.beginPath(); g.arc(L / 2 - .3, s * h * .6, .12, 0, Math.PI * 2); g.fill(); } }
    else if(fr === 'barra'){ ret(g, L / 2 - .2, L / 2 - .12, -h * .7, h * .7, .03); g.fill(); }
    const as = p.asa;
    if(as === 'alta'){ g.fillStyle = CARBONO; for(const s of [1, -1]){ ret(g, -L / 2 + .3, -L / 2 + .7, s * .35 - .04, s * .35 + .04); g.fill(); } asa(g, -L / 2 + .25, .4, W * .7, 1, o.cor, tom(o.cor, .2), { placas: .45, corPlaca: o.cor2 }); }
    else if(as === 'cauda'){ g.fillStyle = tom(o.cor, -.2); ret(g, -L / 2, -L / 2 + .3, -h * .78, h * .78, .06); g.fill(); }
    else if(as !== 'nenhuma') asa(g, -L / 2 + .1, .32, W * (p.asaLarg || .96), p.elementos || 1, o.cor, tom(o.cor, .2), { placas: .5, corPlaca: o.cor2 });
    g.fillStyle = '#ff2a2a'; ret(g, -L / 2 - .02, -L / 2 + .04, -h * .8, h * .8, .02); g.fill();
    if(o.num != null){ const nx = p.numX != null ? L * p.numX : L * .26; g.fillStyle = '#f4f4f2'; ret(g, nx, nx + .5, -.32, .32, .08); g.fill(); numero(g, o.num, nx + .25, 0, .42, Math.PI / 2, '#111', 'rgba(255,255,255,0)'); }
  }

  /* kart de cada época: o tubular sem carenagem (anos 60), o de laterais redondas (anos 90) e o atual */
  function kartE(g, p, o){
    const { ret, corpo, pneu, capacete, numero, tom, caminhoSim, CARBONO } = A();
    if(p.moderno) return A().kart(g, o.cor, o.cor2, o.num, o.capCor);
    const gc = corpo(g, o.cor, .7);
    pneu(g, .5, .5, .28, .16); pneu(g, .5, -.5, .28, .16); pneu(g, -.58, .55, .3, .22); pneu(g, -.58, -.55, .3, .22);
    g.strokeStyle = '#a7acb3'; g.lineWidth = .05; g.beginPath(); g.moveTo(.55, -.38); g.lineTo(.55, .38); g.moveTo(-.58, -.45); g.lineTo(-.58, .45); g.moveTo(.6, -.22); g.lineTo(-.62, -.3); g.moveTo(.6, .22); g.lineTo(-.62, .3); g.moveTo(.75, -.2); g.lineTo(.75, .2); g.stroke();
    if(p.laterais){ for(const s of [1, -1]){ g.beginPath(); g.ellipse(-.05, s * .52, .35, .1, 0, 0, Math.PI * 2); g.fillStyle = gc; g.fill(); }
      caminhoSim(g, [[.88, .12], [.8, .3], [.62, .32], [.6, .22]]); g.fillStyle = gc; g.fill(); }
    ret(g, -.4, .0, -.18, .18, .1); g.fillStyle = '#16181b'; g.fill();
    g.beginPath(); g.ellipse(-.15, 0, .16, .25, 0, 0, Math.PI * 2); g.fillStyle = p.laterais ? tom(o.cor2, -.15) : o.cor; g.fill();
    capacete(g, -.1, 0, .13, o.capCor);
    g.strokeStyle = '#111'; g.lineWidth = .04; g.beginPath(); g.arc(.18, 0, .1, -Math.PI / 2, Math.PI / 2); g.stroke();
    if(o.num != null){ g.fillStyle = '#f4f4f2'; ret(g, .66, .86, -.13, .13, .04); g.fill(); numero(g, o.num, .76, 0, .17, Math.PI / 2, '#111', 'rgba(255,255,255,0)'); }
  }

  /* ─────────── o catálogo ─────────── */
  /* fórmulas: f = 'formula' com os parâmetros do desenho de fórmula (pode herdar de uma base da arte) */
  const F = (base, over, nome, dims) => ({ f: 'formula', base, over: over || {}, nome, dims });
  const DEF = {
    /* F1 e as fórmulas que já existiam (os desenhos da arte), com os nomes dos carros */
    'f1-1950': { f: 'frente', p: { L0: 4.1, W0: 1.55, rF: [1.3, .66, .56, .2], rT: [-1.35, .66, .6, .22], corpoW: .36, capo: .3, encosto: true }, nome: 'Fórmula 1 de motor dianteiro (Alfa 158, Maserati 250F)', dims: [4.1, 1.55] },
    'roadster': { f: 'frente', p: { L0: 4.3, W0: 1.75, rF: [1.4, .72, .6, .24], rT: [-1.42, .72, .66, .28], corpoW: .55, capo: .48, offset: .12, stagger: true, encosto: true, santantonio: true }, nome: 'Roadster de Indianápolis (Watson, Kurtis)', dims: [4.3, 1.75] },
    'f1-1960': { f: 'formula', base: 'f1-1960', nome: 'Fórmula 1 de motor traseiro (Cooper, Lotus 25)', dims: [3.8, 1.55] },
    'f1-1975': { f: 'formula', base: 'f1-1975', nome: 'Fórmula 1 de asas e entrada de ar alta (Lotus 72, McLaren M23)', dims: [4.4, 2.0] },
    'f1-1980': { f: 'formula', base: 'f1-1980', nome: 'Fórmula 1 de efeito solo (Lotus 79, Williams FW07)', dims: [4.4, 2.0] },
    'f1-1988': { f: 'formula', base: 'f1-1988', nome: 'Fórmula 1 turbo e de fundo plano (McLaren MP4/4)', dims: [4.5, 2.0] },
    'f1-2000': { f: 'formula', base: 'f1-2000', nome: 'Fórmula 1 de bico alto e pneus com sulcos', dims: [4.6, 1.8] },
    'f1-2012': { f: 'formula', base: 'f1-2012', nome: 'Fórmula 1 de asa traseira estreita (2009–2016)', dims: [5.0, 1.8] },
    'f1-2019': { f: 'formula', base: 'f1-2019', over: { halo: false }, nome: 'Fórmula 1 de 2017 (asas largas)', dims: [5.6, 2.0] },
    'f1-2019h': { f: 'formula', base: 'f1-2019', over: { halo: true }, nome: 'Fórmula 1 de 2018 a 2021 (halo)', dims: [5.6, 2.0] },
    'f1-2022': { f: 'formula', base: 'f1-2022', nome: 'Fórmula 1 de efeito solo (2022–2025)', dims: [5.6, 2.0] },
    'f1-2026': { f: 'formula', base: 'f1-2022', over: { asaD: { x: 2.65, prof: .36, larg: 1.82, el: 3, curva: true }, piso: [.7, -1.7, .78], pods: [.5, -1.45, .66, 'esculpido'], rF: [1.7, .72, .7, .34], rT: [-1.75, .7, .74, .4] }, nome: 'Fórmula 1 de 2026 (mais estreito, asas móveis)', dims: [5.4, 1.9] },
    /* a escada europeia */
    'f2-1970': { f: 'formula', base: 'f1-1975', over: { airbox: null, asaT: { x: -1.8, prof: .34, larg: .86, el: 1, poste: true }, rT: [-1.45, .72, .66, .44] }, nome: 'Fórmula 2 europeia (March 712, Brabham BT36)', dims: [4.1, 1.85] },
    'f2-1980': { f: 'formula', base: 'f1-1980', over: { pods: [.6, -1.7, .66, 'efeitoSolo'], asaT: { x: -1.85, prof: .36, larg: .84, el: 1, poste: true } }, nome: 'Fórmula 2 europeia de efeito solo (March 812, Ralt RH6)', dims: [4.2, 1.9] },
    'f3000-1990': { f: 'formula', base: 'f1-1988', over: { airbox: true, asaT: { x: -2.0, prof: .44, larg: .96, el: 2 } }, nome: 'Fórmula 3000 (Reynard 89D, Lola T90/50)', dims: [4.4, 1.95] },
    'lola-t96': { f: 'formula', base: 'f2-2005', over: { asaD: { x: 2.5, prof: .32, larg: 1.62, el: 2, placas: .45 }, asaT: { x: -2.15, prof: .42, larg: .96, el: 2 } }, nome: 'Lola T96/50 (Fórmula 3000)', dims: [4.6, 1.85] },
    'lola-b02': { f: 'formula', base: 'f2-2005', over: { asaT: { x: -2.15, prof: .42, larg: .92, el: 3 }, barge: true }, nome: 'Lola B02/50 (Fórmula 3000)', dims: [4.6, 1.8] },
    'gp2-05': { f: 'formula', base: 'f1-2000', over: { sulcos: false, asaT: { x: -2.2, prof: .4, larg: .95, el: 2 } }, nome: 'Dallara GP2/05', dims: [4.95, 1.8] },
    'gp2-08': { f: 'formula', base: 'f1-2000', over: { sulcos: false, asaD: { x: 2.6, prof: .34, larg: 1.6, el: 3, placas: .5 }, asaT: { x: -2.25, prof: .42, larg: .95, el: 2 } }, nome: 'Dallara GP2/08', dims: [5.0, 1.8] },
    'gp2-11': { f: 'formula', base: 'f1-2012', over: { asaT: { x: -2.3, prof: .42, larg: .9, el: 2 } }, nome: 'Dallara GP2/11', dims: [5.25, 1.8] },
    'f2-2018': { f: 'formula', base: 'f2', nome: 'Dallara F2 2018', dims: [5.22, 1.9] },
    'f2-2024': { f: 'formula', base: 'f2', over: { pods: [.5, -1.4, .68, 'esculpido'], asaD: { x: 2.65, prof: .38, larg: 1.84, el: 3, curva: true } }, nome: 'Dallara F2 2024', dims: [5.25, 1.9] },
    'wsbn': { f: 'formula', base: 'f2-2005', over: { asaT: { x: -2.1, prof: .4, larg: .9, el: 2 } }, nome: 'Dallara SN01 (World Series by Nissan)', dims: [4.6, 1.8] },
    'wsr-t05': { f: 'formula', base: 'f1-2000', over: { sulcos: false, asaT: { x: -2.2, prof: .42, larg: .95, el: 2 } }, nome: 'Dallara T05/T08 (Fórmula Renault 3.5)', dims: [4.9, 1.8] },
    'wsr-t12': { f: 'formula', base: 'f1-2012', over: { asaT: { x: -2.25, prof: .42, larg: .85, el: 2 } }, nome: 'Dallara T12 (Fórmula Renault 3.5)', dims: [4.9, 1.8] },
    'a1gp': { f: 'formula', base: 'f2-2005', over: { asaD: { x: 2.55, prof: .38, larg: 1.72, el: 3, placas: .5 }, asaT: { x: -2.15, prof: .44, larg: .98, el: 2 } }, nome: 'A1GP (Lola A1 / Ferrari)', dims: [4.8, 1.85] },
    'fnippon-old': { f: 'formula', base: 'f2-2005', nome: 'Formula Nippon (Lola/Reynard)', dims: [4.6, 1.8] },
    'fn09': { f: 'formula', base: 'f1-2012', over: { asaT: { x: -2.25, prof: .42, larg: .9, el: 2 } }, nome: 'Swift FN09 (Formula Nippon)', dims: [4.9, 1.8] },
    'sf14': { f: 'formula', base: 'f1-2012', over: { asaD: { x: 2.7, prof: .38, larg: 1.75, el: 3 }, asaT: { x: -2.3, prof: .42, larg: .9, el: 2 }, pods: [.48, -1.4, .62, 'esculpido'] }, nome: 'Dallara SF14 (Super Formula)', dims: [5.2, 1.9] },
    'sf19': { f: 'formula', base: 'f2', over: { pods: [.5, -1.42, .64, 'esculpido'] }, nome: 'Dallara SF19 (Super Formula, halo)', dims: [5.3, 1.9] },
    'sf23': { f: 'formula', base: 'f2', over: { pods: [.52, -1.45, .7, 'esculpido'], asaD: { x: 2.65, prof: .38, larg: 1.82, el: 3, curva: true } }, nome: 'Dallara SF23 (Super Formula)', dims: [5.3, 1.9] },
    /* F3 de cada época */
    'f3-500': { f: 'formula', base: 'f1-1960', over: { pods: null }, nome: 'Fórmula 3 de 500 cc (Cooper Mk)', dims: [3.1, 1.35] },
    'fjunior': { f: 'formula', base: 'f1-1960', nome: 'Fórmula Júnior (Lotus 18, Cooper T52)', dims: [3.4, 1.45] },
    'f3-1965': { f: 'formula', base: 'formulaFord', over: { pods: null }, nome: 'Fórmula 3 de 1 litro (Brabham BT21)', dims: [3.6, 1.5] },
    'f3-1975': { f: 'formula', base: 'f1-1975', over: { airbox: null, asaT: { x: -1.7, prof: .3, larg: .8, el: 1, poste: true }, asaD: { x: 2.05, prof: .2, larg: 1.25, el: 1, placas: .25 } }, nome: 'Fórmula 3 de asas (March 743, Ralt RT1)', dims: [3.9, 1.75] },
    'f3-1985': { f: 'formula', base: 'f1-1988', over: { airbox: 'periscopio', asaT: { x: -1.85, prof: .36, larg: .82, el: 2 } }, nome: 'Fórmula 3 de fundo plano (Ralt RT30, Reynard 853)', dims: [4.0, 1.85] },
    'f3-1995': { f: 'formula', base: 'f2-2005', over: { asaT: { x: -1.9, prof: .36, larg: .82, el: 2 } }, nome: 'Dallara F3 de bico alto (F394–F302)', dims: [4.2, 1.8] },
    'f3-2005': { f: 'formula', base: 'f2-2005', over: { asaD: { x: 2.35, prof: .3, larg: 1.6, el: 2, placas: .5 }, asaT: { x: -1.95, prof: .38, larg: .82, el: 2 } }, nome: 'Dallara F305/F308', dims: [4.35, 1.8] },
    'f3-2012': { f: 'formula', base: 'f3', over: { halo: false }, nome: 'Dallara F312', dims: [4.35, 1.85] },
    'f3-2016': { f: 'formula', base: 'f3', over: { halo: false, pods: [.45, -1.25, .6, 'esculpido'] }, nome: 'Dallara F316/F317', dims: [4.35, 1.85] },
    'f3-2019': { f: 'formula', base: 'f3', nome: 'Dallara F3 2019 (FIA F3, halo)', dims: [4.97, 1.85] },
    'f3-2025': { f: 'formula', base: 'f3', over: { pods: [.47, -1.3, .64, 'esculpido'] }, nome: 'Dallara F3 2025', dims: [4.97, 1.85] },
    'gp3-10': { f: 'formula', base: 'f1-2012', over: { asaT: { x: -2.15, prof: .38, larg: .78, el: 2 }, barge: false }, nome: 'Dallara GP3/10', dims: [4.6, 1.8] },
    'gp3-13': { f: 'formula', base: 'f1-2012', over: { asaT: { x: -2.15, prof: .38, larg: .8, el: 2 }, pods: [.45, -1.3, .58, 'esculpido'] }, nome: 'Dallara GP3/13', dims: [4.6, 1.8] },
    'gp3-16': { f: 'formula', base: 'f3', over: { halo: false }, nome: 'Dallara GP3/16', dims: [4.6, 1.85] },
    'dallara-320': { f: 'formula', base: 'f3', over: { asaD: { x: 2.4, prof: .34, larg: 1.66, el: 2 } }, nome: 'Dallara 320 (Super Formula Lights, Euroformula)', dims: [4.4, 1.85] },
    /* Fórmula Regional, Renault, BMW, Abarth, Masters */
    'tatuus-t318': { f: 'formula', base: 'f3', over: { asaD: { x: 2.35, prof: .32, larg: 1.6, el: 2 }, asaT: { x: -1.95, prof: .34, larg: .82, el: 2 } }, nome: 'Tatuus T-318 (Fórmula Regional, W Series)', dims: [4.6, 1.78] },
    'tatuus-fr2000': { f: 'formula', base: 'f2-2005', over: { asaD: { x: 2.25, prof: .28, larg: 1.45, el: 2, placas: .4 }, asaT: { x: -1.85, prof: .34, larg: .78, el: 2 } }, nome: 'Tatuus FR2000 (Fórmula Renault 2.0)', dims: [4.1, 1.75] },
    'barazi-fr10': { f: 'formula', base: 'f1-2012', over: { asaT: { x: -2.0, prof: .34, larg: .78, el: 2 }, barge: false }, nome: 'Barazi-Epsilon FR2.0-10', dims: [4.35, 1.75] },
    'tatuus-fr19': { f: 'formula', base: 'f3', over: { asaT: { x: -1.95, prof: .34, larg: .8, el: 2 } }, nome: 'Tatuus FR-19 (Fórmula Renault, halo)', dims: [4.4, 1.75] },
    'tatuus-ft50': { f: 'formula', base: 'f1-2012', over: { asaT: { x: -2.0, prof: .34, larg: .8, el: 2 }, barge: false }, nome: 'Tatuus FT-50 (Toyota Racing Series)', dims: [4.4, 1.75] },
    'msv-016': { f: 'formula', base: 'f1-2012', over: { asaT: { x: -2.05, prof: .36, larg: .82, el: 2 }, barge: false }, nome: 'Tatuus MSV F3-016 (BRDC F3)', dims: [4.5, 1.78] },
    'msv-022': { f: 'formula', base: 'f3', over: { asaT: { x: -2.0, prof: .36, larg: .84, el: 2 } }, nome: 'Tatuus MSV-022 (GB3, halo)', dims: [4.6, 1.8] },
    'fr-1995': { f: 'formula', base: 'f1-1988', over: { airbox: true, asaD: { x: 2.25, prof: .26, larg: 1.4, el: 1, placas: .35, baixo: true }, asaT: { x: -1.85, prof: .34, larg: .8, el: 1 } }, nome: 'Fórmula Renault dos anos 90 (Tatuus RC, Martini MK)', dims: [4.0, 1.75] },
    'fbmw-old': { f: 'formula', base: 'f1-1988', over: { airbox: true, asaD: { x: 2.15, prof: .24, larg: 1.35, el: 1, placas: .3, baixo: true }, asaT: { x: -1.8, prof: .32, larg: .76, el: 1 } }, nome: 'Formel ADAC / Fórmula BMW Júnior (anos 90)', dims: [3.9, 1.7] },
    'atlantic-2000': { f: 'formula', base: 'f2-2005', over: { asaT: { x: -2.05, prof: .38, larg: .9, el: 2 } }, nome: 'Fórmula Atlantic (Ralt RT41, Swift 008.a)', dims: [4.45, 1.85] },
    'barber-saab': { f: 'formula', base: 'f1-1988', over: { airbox: true, asaD: { x: 2.25, prof: .26, larg: 1.4, el: 1, placas: .35, baixo: true }, asaT: { x: -1.9, prof: .36, larg: .82, el: 1 } }, nome: 'Barber Saab Pro Series (Mondiale)', dims: [4.1, 1.75] },
    'tatuus-ft60': { f: 'formula', base: 'f3', nome: 'Tatuus FT-60 (Fórmula Regional da Oceania)', dims: [4.6, 1.78] },
    'ligier-f3': { f: 'formula', base: 'f3', over: { pods: [.45, -1.3, .62, 'reto'], asaD: { x: 2.35, prof: .34, larg: 1.6, el: 2 } }, nome: 'Ligier JS F3 (Fórmula Regional das Américas)', dims: [4.5, 1.8] },
    'dome-f111': { f: 'formula', base: 'f3', over: { asaT: { x: -1.95, prof: .34, larg: .8, el: 2 } }, nome: 'Dome F111/3 (Fórmula Regional Japonesa)', dims: [4.5, 1.78] },
    'mygale-fb02': { f: 'formula', base: 'f4', over: { halo: false, asaD: { x: 2.1, prof: .3, larg: 1.45, el: 2, baixo: true }, asaT: { x: -1.8, prof: .34, larg: .78, el: 2 } }, nome: 'Mygale FB02 (Fórmula BMW)', dims: [4.0, 1.72] },
    'tatuus-fa': { f: 'formula', base: 'f4', over: { halo: false }, nome: 'Tatuus FA010 (Fórmula Abarth)', dims: [4.2, 1.7] },
    'tatuus-fm': { f: 'formula', base: 'f2-2005', over: { asaT: { x: -1.9, prof: .34, larg: .8, el: 2 } }, nome: 'Tatuus FM (Fórmula Masters)', dims: [4.2, 1.75] },
    /* F4 */
    'f4-t014': { f: 'formula', base: 'f4', over: { halo: false }, nome: 'Tatuus F4-T014 (F4 1ª geração)', dims: [4.2, 1.7] },
    'f4-t421': { f: 'formula', base: 'f4', nome: 'Tatuus F4-T421 (F4 2ª geração, halo)', dims: [4.2, 1.7] },
    'mygale-f4': { f: 'formula', base: 'f4', over: { halo: false, pods: [.42, -1.12, .56, 'reto'], asaD: { x: 2.12, prof: .32, larg: 1.52, el: 2 } }, nome: 'Mygale M14-F4', dims: [4.25, 1.75] },
    'mygale-f4h': { f: 'formula', base: 'f4', over: { pods: [.42, -1.12, .56, 'reto'], asaD: { x: 2.12, prof: .32, larg: 1.52, el: 2 } }, nome: 'Mygale M21-F4 (halo)', dims: [4.25, 1.75] },
    'ligier-f4': { f: 'formula', base: 'f4', over: { halo: false, asaT: { x: -1.82, prof: .34, larg: .82, el: 1 } }, nome: 'Ligier JS F4', dims: [4.25, 1.75] },
    'ligier-f422': { f: 'formula', base: 'f4', over: { asaT: { x: -1.82, prof: .34, larg: .82, el: 1 } }, nome: 'Ligier JS F422 (halo)', dims: [4.25, 1.75] },
    'dome-f110': { f: 'formula', base: 'f4', over: { halo: false, bico: [2.05, .12, .85, .2] }, nome: 'Dome F110 (F4 Japonesa)', dims: [4.3, 1.7] },
    'dome-f111f4': { f: 'formula', base: 'f4', over: { bico: [2.05, .12, .85, .2] }, nome: 'F4 Japonesa de 2ª geração (Dome, com halo)', dims: [4.3, 1.7] },
    /* Fórmula Ford, Vee, Opel, Delta */
    'ff-1970': { f: 'formula', base: 'formulaFord', over: { pods: null }, nome: 'Fórmula Ford de charuto (Lotus 61, Merlyn)', dims: [3.9, 1.55] },
    'ff-1990': { f: 'formula', base: 'formulaFord', nome: 'Fórmula Ford de laterais (Van Diemen RF, Swift)', dims: [4.1, 1.6] },
    'ff-2012': { f: 'formula', base: 'f4', over: { halo: false, asaT: { x: -1.75, prof: .3, larg: .76, el: 1 } }, nome: 'Mygale SJ12 (Fórmula Ford EcoBoost)', dims: [4.1, 1.7] },
    'fvee': { f: 'formula', base: 'formulaFord', over: { pods: null, bico: [1.7, .16, .7, .3], rF: [1.1, .64, .5, .16], rT: [-1.05, .66, .56, .2] }, nome: 'Fórmula Vee (motor de Fusca)', dims: [3.6, 1.45] },
    'super-vee': { f: 'formula', base: 'f1-1975', over: { airbox: null, asaT: { x: -1.75, prof: .32, larg: .82, el: 1, poste: true }, asaD: { x: 2.05, prof: .22, larg: 1.3, el: 1, placas: .25 } }, nome: 'Fórmula Super Vee (Ralt RT5)', dims: [4.0, 1.75] },
    'fopel': { f: 'formula', base: 'f2-2005', over: { asaD: { x: 2.2, prof: .26, larg: 1.4, el: 1, placas: .35, baixo: true }, asaT: { x: -1.8, prof: .32, larg: .76, el: 1 } }, nome: 'Fórmula Opel / Lotus (Reynard 893)', dims: [4.0, 1.7] },
    /* América */
    'usac-1970': { f: 'formula', base: 'f1-1975', over: { asaT: { x: -1.95, prof: .44, larg: 1.05, el: 1, poste: true }, airbox: null }, nome: 'USAC de motor traseiro e asas (Eagle, McLaren M16)', dims: [4.6, 1.95] },
    'cart-1982': { f: 'formula', base: 'f1-1980', over: { asaT: { x: -2.05, prof: .44, larg: 1.05, el: 2 } }, nome: 'CART de efeito solo (Penske PC10, March 82C)', dims: [4.7, 2.0] },
    'cart-1990': { f: 'formula', base: 'f1-1988', over: { airbox: true, asaT: { x: -2.15, prof: .5, larg: 1.05, el: 2 }, asaD: { x: 2.5, prof: .32, larg: 1.7, el: 2, placas: .5 } }, nome: 'CART dos anos 90 (Lola T90, Penske PC-19)', dims: [4.8, 2.0] },
    'cart-2000': { f: 'formula', base: 'f2-2005', over: { asaD: { x: 2.55, prof: .38, larg: 1.85, el: 3, placas: .55 }, asaT: { x: -2.2, prof: .46, larg: 1.0, el: 2 }, rF: [1.62, .76, .66, .36], rT: [-1.68, .76, .74, .44] }, nome: 'CART/Champ Car (Reynard, Lola B2K)', dims: [4.9, 2.0] },
    'dp01': { f: 'formula', base: 'f2-2005', over: { asaD: { x: 2.55, prof: .38, larg: 1.85, el: 3, placas: .55 }, asaT: { x: -2.25, prof: .42, larg: .98, el: 2 }, pods: [.5, -1.4, .74, 'esculpido'] }, nome: 'Panoz DP01 (Champ Car 2007)', dims: [4.9, 2.0] },
    'irl-1997': { f: 'formula', base: 'f2-2005', over: { asaD: { x: 2.5, prof: .36, larg: 1.82, el: 2, placas: .5 }, asaT: { x: -2.2, prof: .38, larg: .98, el: 1 }, rF: [1.6, .76, .66, .36], rT: [-1.66, .76, .74, .44] }, nome: 'IRL G-Force / Dallara (1997–2002)', dims: [4.9, 1.98] },
    'ir03': { f: 'formula', base: 'f2-2005', over: { asaD: { x: 2.55, prof: .36, larg: 1.85, el: 3, placas: .55 }, asaT: { x: -2.2, prof: .38, larg: .98, el: 2 }, rF: [1.62, .76, .68, .36], rT: [-1.68, .76, .76, .44] }, nome: 'Dallara IR-03/05 (IndyCar 2003–2011)', dims: [4.95, 1.98] },
    'indy12': { f: 'formula', base: 'indy12', nome: 'Dallara DW12 (IndyCar 2012–2014)', dims: [5.0, 2.0] },
    'indy15': { f: 'formula', base: 'indy12', over: { protT: false, asaD: { x: 2.55, prof: .44, larg: 1.92, el: 4, placas: .6 }, barge: true }, nome: 'IndyCar com kits aerodinâmicos (2015–2017)', dims: [5.0, 2.0] },
    'indy18': { f: 'formula', base: 'indy18', over: { aeroscreen: false }, nome: 'Dallara IR-18 (IndyCar 2018–2019)', dims: [5.2, 1.95] },
    'indy20': { f: 'formula', base: 'indy18', over: { aeroscreen: true }, nome: 'Dallara IR-18 com aeroscreen (IndyCar 2020 em diante)', dims: [5.2, 1.95] },
    'lights-1986': { f: 'formula', base: 'f1-1988', over: { airbox: true, asaT: { x: -1.95, prof: .4, larg: .92, el: 1 } }, nome: 'Indy Lights (March 86A, Wildcat)', dims: [4.4, 1.9] },
    'lights-1993': { f: 'formula', base: 'f2-2005', over: { asaT: { x: -2.05, prof: .4, larg: .92, el: 1 } }, nome: 'Lola T93/20 (Indy Lights)', dims: [4.5, 1.9] },
    'ipps': { f: 'formula', base: 'f2-2005', over: { asaD: { x: 2.45, prof: .34, larg: 1.72, el: 2, placas: .5 }, asaT: { x: -2.1, prof: .38, larg: .94, el: 1 } }, nome: 'Dallara IPS (Indy Lights 2002–2014)', dims: [4.7, 1.9] },
    'il15': { f: 'formula', base: 'indy18', over: { aeroscreen: false, asaT: { x: -2.1, prof: .36, larg: .9, el: 2 } }, nome: 'Dallara IL-15 (Indy Lights / Indy NXT)', dims: [4.8, 1.9] },
    'il15-aero': { f: 'formula', base: 'indy18', over: { aeroscreen: true, asaT: { x: -2.1, prof: .36, larg: .9, el: 2 } }, nome: 'Dallara IL-15 com aeroscreen (Indy NXT)', dims: [4.8, 1.9] },
    'star-mazda': { f: 'formula', base: 'f2-2005', over: { asaD: { x: 2.2, prof: .28, larg: 1.45, el: 1, placas: .35 }, asaT: { x: -1.85, prof: .32, larg: .8, el: 1 } }, nome: 'Star Mazda Pro (Star Formula Mazda)', dims: [4.2, 1.75] },
    'pm18': { f: 'formula', base: 'f3', over: { asaT: { x: -1.95, prof: .34, larg: .82, el: 2 } }, nome: 'Tatuus PM-18 (Indy Pro 2000)', dims: [4.4, 1.78] },
    'usf-vandiemen': { f: 'formula', base: 'formulaFord', nome: 'Van Diemen USF2000', dims: [4.0, 1.6] },
    'tatuus-usf17': { f: 'formula', base: 'f4', over: { halo: false, asaT: { x: -1.82, prof: .32, larg: .8, el: 2 } }, nome: 'Tatuus USF-17 (USF2000)', dims: [4.25, 1.72] },
    'tatuus-usf22': { f: 'formula', base: 'f4', over: { asaT: { x: -1.82, prof: .32, larg: .8, el: 2 } }, nome: 'Tatuus USF-22 (USF2000, halo)', dims: [4.25, 1.72] },
    'atlantic-1980': { f: 'formula', base: 'f1-1980', over: { pods: [.55, -1.6, .64, 'efeitoSolo'], asaT: { x: -1.8, prof: .36, larg: .84, el: 1, poste: true } }, nome: 'Fórmula Atlantic (Ralt RT4, March 79B)', dims: [4.1, 1.85] },
    'swift-016': { f: 'formula', base: 'f2-2005', over: { asaT: { x: -2.05, prof: .38, larg: .9, el: 2 } }, nome: 'Swift 016.a (Fórmula Atlantic)', dims: [4.5, 1.85] },
    'barber': { f: 'formula', base: 'f2-2005', over: { asaD: { x: 2.25, prof: .28, larg: 1.45, el: 1, placas: .35 }, asaT: { x: -1.9, prof: .34, larg: .82, el: 1 } }, nome: 'Reynard Barber Dodge', dims: [4.3, 1.8] },
    'midget': { f: 'sprint', p: { L0: 3.0 }, nome: 'Midget de terra (USAC Midgets)', dims: [3.0, 1.55], esc: [['Midgets']] },
    'sprint': { f: 'sprint', p: { L0: 3.8, yF: .7, yT: .74 }, nome: 'Sprint car sem asa (USAC Sprint)', dims: [3.8, 1.8], esc: [['Sprint Cars', 1950, 1985]] },
    'sprint-asa': { f: 'sprint', p: { L0: 3.8, yF: .7, yT: .74, asa: 1.6 }, nome: 'Sprint car com asa (World of Outlaws)', dims: [3.8, 1.8], esc: [['Sprint Cars', 1986, 2026]] },
    /* Fórmula E */
    'fe1': { f: 'formula', base: 'fe1', nome: 'Spark-Renault SRT_01E (Fórmula E Gen1)', dims: [5.0, 1.8] },
    'fe2': { f: 'formula', base: 'fe2', nome: 'Spark SRT05e (Fórmula E Gen2)', dims: [5.16, 1.77] },
    'fe3': { f: 'formula', base: 'fe3', nome: 'Spark Gen3 (Fórmula E 2023 em diante)', dims: [5.02, 1.7] },
    /* NASCAR e o caminho de estoque */
    'cup-1950': { f: 'antigo', p: { paralamasSoltos: false, cab: [.1, -1.1] }, nome: 'NASCAR dos anos 50 (Hudson Hornet, Chevrolet Bel Air)', dims: [5.2, 1.95] },
    'cup-1965': { f: 'carroceria', p: { nariz: .7, traseira: .95, cab: [.2, -1.15, .74], farois: 'redondos', farois4: true, asa: 'nenhuma', retro: true, tetoCor: 'cor' }, nome: 'NASCAR dos anos 60 (Ford Galaxie, Plymouth Belvedere)', dims: [5.4, 2.0] },
    'cup-aero': { f: 'carroceria', p: { nariz: .25, traseira: .95, cab: [.2, -1.2, .72], farois: 'adesivo', asa: 'bico', tetoCor: 'cor' }, nome: 'Aero warriors (Dodge Daytona, Plymouth Superbird)', dims: [5.7, 2.0] },
    'cup-1975': { f: 'carroceria', p: { nariz: .7, traseira: .9, cab: [.15, -1.05, .72], farois: 'redondos', farois4: true, asa: 'spoiler', tetoCor: 'cor' }, nome: 'NASCAR dos anos 70 (Chevelle, Torino, Monte Carlo)', dims: [5.3, 2.0] },
    'cup-1985': { f: 'carroceria', p: { nariz: .65, traseira: .9, cab: [.15, -.95, .74], farois: 'adesivo', asa: 'spoiler', capoNum: true }, nome: 'NASCAR dos anos 80 (Thunderbird, Monte Carlo SS)', dims: [5.1, 1.95] },
    'cup-1995': { f: 'carroceria', p: { nariz: .55, traseira: .88, cab: [.2, -.9, .74], farois: 'adesivo', asa: 'spoiler', capoNum: true }, nome: 'NASCAR Gen4 (Lumina, Taurus, Monte Carlo)', dims: [5.1, 1.95] },
    'cup-cot': { f: 'carroceria', p: { nariz: .7, traseira: .92, cab: [.2, -.95, .76], farois: 'adesivo', asa: 'alta', splitter: true, capoNum: true }, nome: 'Car of Tomorrow (NASCAR 2007–2010, com asa)', dims: [5.15, 2.0] },
    'cup-gen5': { f: 'carroceria', p: { nariz: .6, traseira: .9, cab: [.2, -.95, .76], farois: 'adesivo', asa: 'spoiler', splitter: true, capoNum: true }, nome: 'NASCAR Gen5/Gen6 (2011–2021)', dims: [5.15, 1.95] },
    'cup-nextgen': { f: 'carroceria', p: { nariz: .55, traseira: .9, cab: [.18, -.9, .78], farois: 'adesivo', asa: 'spoiler', splitter: true, capoNum: true, difusor: true, paralamas: .03 }, nome: 'NASCAR Next Gen (2022 em diante)', dims: [5.2, 2.0] },
    'xfinity': { f: 'carroceria', p: { nariz: .6, traseira: .9, cab: [.2, -.95, .76], farois: 'adesivo', asa: 'spoiler', splitter: true, capoNum: true }, nome: 'NASCAR Xfinity (Camaro, Mustang, Supra)', dims: [5.05, 1.95] },
    'truck': { f: 'carroceria', p: { nariz: .7, traseira: .98, cab: [.55, -.35, .82], vidroT: .14, farois: 'adesivo', asa: 'spoiler', cacamba: true, tetoNum: true, capoNum: true }, nome: 'Pickup da NASCAR Truck (Silverado, Tundra, F-150)', dims: [5.4, 2.05] },
    'arca': { f: 'carroceria', p: { nariz: .6, traseira: .9, cab: [.2, -.9, .74], farois: 'adesivo', asa: 'spoiler', capoNum: true }, nome: 'Carro da ARCA (carroceria de Cup das gerações anteriores)', dims: [5.1, 1.95] },
    'late-model': { f: 'carroceria', p: { nariz: .55, traseira: .95, cab: [.1, -.85, .74], farois: 'adesivo', asa: 'spoiler', tetoCor: 'cor' }, nome: 'Late model de asfalto', dims: [4.9, 1.95], esc: [['Late Models']] },
    'late-model-terra': { f: 'carroceria', p: { nariz: .4, traseira: 1, cab: [.0, -.95, .8], farois: 'adesivo', asa: 'pato', tetoCor: 'cor', retro: false }, nome: 'Dirt late model (carroceria em cunha de terra)', dims: [4.9, 1.95], esc: [['Corridas de Terra', 1971, 2026]] },
    'modificado': { f: 'modificado', p: { L0: 4.7 }, nome: 'Modificado da NASCAR (rodas expostas)', dims: [4.7, 1.95], esc: [['Modificados']] },
    'sportsman': { f: 'antigo', p: { paralamasSoltos: false, gaiola: true, cab: [.05, -1.0] }, nome: 'Sportsman (sedã de corrida dos anos 50–70)', dims: [5.0, 1.9], esc: [['Sportsman']] },
    'jalopy': { f: 'antigo', p: { paralamasSoltos: true, cab: [-.1, -.9] }, nome: 'Jalopy (cupê antigo de corrida de bairro)', dims: [4.3, 1.7], esc: [['Corridas de Terra', 1950, 1970], ['Corridas de Bairro', 1950, 1965]] },
    'carretera': { f: 'antigo', p: { paralamasSoltos: true, cab: [0, -.95] }, nome: 'Carretera (cupê de estrada dos anos 40 e 50)', dims: [4.6, 1.75], esc: [['Corridas Regionais', 1950, 1960], ['Corridas Nacionais', 1950, 1960]] },
    /* Brasil */
    'opala': { f: 'carroceria', p: { nariz: .75, traseira: .95, cab: [.1, -1.0, .74], farois: 'retos', asa: 'nenhuma', tetoCor: 'cor' }, nome: 'Chevrolet Opala (Stock Car 1979–1993)', dims: [4.75, 1.8] },
    'omega': { f: 'carroceria', p: { nariz: .6, traseira: .9, cab: [.15, -1.0, .74], farois: 'finos', asa: 'spoiler' }, nome: 'Chevrolet Omega (Stock Car 1994–1999)', dims: [4.85, 1.85] },
    'stock-2000': { f: 'carroceria', p: { nariz: .55, traseira: .88, cab: [.15, -.85, .76], farois: 'finos', asa: 'asa', splitter: true }, nome: 'Stock Car de silhueta (Vectra, Astra, 2000–2008)', dims: [4.7, 1.9] },
    'stock-2009': { f: 'carroceria', p: { nariz: .5, traseira: .88, cab: [.15, -.85, .76], farois: 'finos', asa: 'asa', splitter: true, paralamas: .04 }, nome: 'Stock Car (Peugeot 408, Cruze, Corolla, 2009–2019)', dims: [4.75, 1.95] },
    'stock-2020': { f: 'carroceria', p: { nariz: .5, traseira: .86, cab: [.15, -.85, .76], farois: 'finos', asa: 'asa', splitter: true, paralamas: .06, respiros: true }, nome: 'Stock Car (Corolla e Cruze, 2020–2023)', dims: [4.8, 1.95] },
    'stock-suv': { f: 'carroceria', p: { nariz: .45, traseira: .92, cab: [.35, -1.25, .8], vidroT: .25, farois: 'finos', asa: 'asa', splitter: true, paralamas: .08, respiros: true }, nome: 'Stock Car de SUV (Tracker, Corolla Cross, 2024 em diante)', dims: [4.7, 2.0] },
    'stock-light': { f: 'carroceria', p: { nariz: .55, traseira: .88, cab: [.15, -.85, .76], farois: 'finos', asa: 'asa', splitter: true }, nome: 'Stock Light / Stock Series', dims: [4.7, 1.9] },
    'turismo-nac': { f: 'carroceria', p: { nariz: .5, traseira: .98, cab: [.05, -.85, .8], vidroT: .3, farois: 'finos', asa: 'spoiler' }, nome: 'Turismo Nacional (hatch: Gol, Onix, HB20)', dims: [4.0, 1.75] },
    'marcas-80': { f: 'carroceria', p: { nariz: .75, traseira: .95, cab: [.05, -.85, .76], vidroT: .3, farois: 'retos', asa: 'nenhuma', tetoCor: 'cor' }, nome: 'Marcas e Pilotos dos anos 80 (Gol, Passat, Escort, Monza)', dims: [4.1, 1.62] },
    'marcas-br': { f: 'carroceria', p: { nariz: .55, traseira: .9, cab: [.1, -.9, .76], farois: 'finos', asa: 'asa' }, nome: 'Brasileiro de Marcas (Corolla, Civic, Cruze)', dims: [4.6, 1.82] },
    'porsche-old': { f: 'p911', p: {}, nome: 'Porsche 911 Cup (964, 993, 996 e 997)', dims: [4.45, 1.85] },
    'porsche': { f: 'p911', p: {}, nome: 'Porsche 911 GT3 Cup (991/992)', dims: [4.6, 1.92] },
    /* turismo */
    'turismo-60': { f: 'antigo', p: { paralamasSoltos: false, cab: [.05, -.8] }, nome: 'Turismo dos anos 60 (Lotus Cortina, Alfa GTA, Mini)', dims: [4.2, 1.6] },
    'turismo-80': { f: 'carroceria', p: { nariz: .7, traseira: .9, cab: [.1, -.85, .74], farois: 'retos', asa: 'asa', tetoCor: 'cor' }, nome: 'Grupo A dos anos 80 (Sierra RS500, BMW M3)', dims: [4.4, 1.75] },
    'dtm-grupoA': { f: 'carroceria', p: { nariz: .75, traseira: .9, cab: [.1, -.8, .74], farois: 'retos', asa: 'asa', paralamas: .06 }, nome: 'DTM Grupo A (BMW M3 E30, Mercedes 190E Evo)', dims: [4.4, 1.8] },
    'dtm-itc': { f: 'carroceria', p: { nariz: .5, traseira: .85, cab: [.1, -.8, .74], farois: 'finos', asa: 'asa', splitter: true, paralamas: .08 }, nome: 'DTM/ITC Classe 1 (Alfa 155 V6 Ti, Mercedes C)', dims: [4.5, 1.9] },
    'dtm-2000': { f: 'carroceria', p: { nariz: .5, traseira: .85, cab: [.1, -.85, .76], farois: 'finos', asa: 'asa', splitter: true, paralamas: .08 }, nome: 'DTM de silhueta (2000–2011)', dims: [4.8, 1.85] },
    'classe1': { f: 'carroceria', p: { nariz: .5, traseira: .85, cab: [.1, -.85, .76], farois: 'finos', asa: 'asa', splitter: true, paralamas: .1, respiros: true }, nome: 'DTM Classe 1 (2012–2020)', dims: [4.8, 1.95] },
    'gt3': { f: 'carroceria', p: { gt: true, nariz: .45, traseira: .85, cab: [.05, -.95, .74], farois: 'finos', asa: 'asa', splitter: true, paralamas: .12, respiros: true, difusor: true }, nome: 'GT3 (Mercedes-AMG, BMW M4, Audi R8, Ferrari 296)', dims: [4.65, 2.04] },
    'gt3-911': { f: 'p911', p: { asaGrande: true }, nome: 'Porsche 911 GT3 R', dims: [4.62, 2.0] },
    'gt3-gt': { f: 'carroceria', p: { gt: true, nariz: .4, traseira: .82, cab: [-.15, -1.05, .72], farois: 'finos', asa: 'asa', splitter: true, paralamas: .14, respiros: true, capoCentral: true, difusor: true }, nome: 'GT3 de motor dianteiro longo (Mercedes-AMG GT3, Aston Vantage)', dims: [4.75, 2.04] },
    'gt-2000': { f: 'carroceria', p: { gt: true, nariz: .45, traseira: .85, cab: [.0, -.9, .72], farois: 'finos', asa: 'asa', splitter: true, paralamas: .12 }, nome: 'GT dos anos 2000 (Porsche 996 GT3-R, Ferrari 360)', dims: [4.5, 1.95] },
    'gt1': { f: 'carroceria', p: { gt: true, nariz: .35, traseira: .8, cab: [-.05, -1.05, .7], farois: 'finos', asa: 'alta', splitter: true, paralamas: .14, respiros: true, difusor: true }, nome: 'GT1 (Maserati MC12, Saleen S7, Aston DBR9)', dims: [5.0, 2.05] },
    'gt500': { f: 'carroceria', p: { gt: true, nariz: .4, traseira: .82, cab: [.0, -.95, .72], farois: 'finos', asa: 'gt500', splitter: true, paralamas: .16, respiros: true, difusor: true }, nome: 'Super GT GT500 (Supra, NSX, Z)', dims: [4.7, 1.95] },
    'jgtc': { f: 'carroceria', p: { gt: true, nariz: .5, traseira: .85, cab: [.05, -.9, .74], farois: 'finos', asa: 'alta', splitter: true, paralamas: .12 }, nome: 'JGTC GT500 (Skyline GT-R, Supra, NSX)', dims: [4.6, 1.9] },
    'super-touring': { f: 'carroceria', p: { nariz: .55, traseira: .88, cab: [.1, -.85, .76], farois: 'finos', asa: 'asa', splitter: true }, nome: 'Super Touring (Volvo 850, Alfa 156, Ford Mondeo)', dims: [4.6, 1.8] },
    'btc-t': { f: 'carroceria', p: { nariz: .55, traseira: .9, cab: [.05, -.85, .78], vidroT: .3, farois: 'finos', asa: 'asa', splitter: true }, nome: 'BTC Touring (Vauxhall Astra, Honda Civic, 2001–2010)', dims: [4.4, 1.8] },
    'ngtc': { f: 'carroceria', p: { nariz: .5, traseira: .95, cab: [.05, -.85, .8], vidroT: .3, farois: 'finos', asa: 'asa', splitter: true, paralamas: .05 }, nome: 'BTCC NGTC (Civic Type R, BMW 330e, Toyota Corolla)', dims: [4.6, 1.85] },
    'wtcc': { f: 'carroceria', p: { nariz: .55, traseira: .9, cab: [.1, -.85, .76], farois: 'finos', asa: 'asa', splitter: true, paralamas: .05 }, nome: 'WTCC (Chevrolet Cruze, Citroën C-Elysée)', dims: [4.5, 1.85] },
    'tcr': { f: 'carroceria', p: { nariz: .5, traseira: .95, cab: [.05, -.8, .8], vidroT: .3, farois: 'finos', asa: 'asa', splitter: true, paralamas: .07 }, nome: 'TCR (Hyundai Elantra N, Audi RS3, Honda Civic)', dims: [4.5, 1.95] },
    'etcc-70': { f: 'carroceria', p: { nariz: .75, traseira: .92, cab: [.1, -.85, .74], farois: 'redondos', farois4: true, asa: 'spoiler', tetoCor: 'cor', paralamas: .08 }, nome: 'Turismo europeu dos anos 70 (BMW 3.0 CSL, Ford Capri)', dims: [4.6, 1.8] },
    'supercars-70': { f: 'carroceria', p: { nariz: .75, traseira: .92, cab: [.1, -.95, .74], farois: 'redondos', farois4: true, asa: 'spoiler', tetoCor: 'cor' }, nome: 'Turismo australiano dos anos 70 (Falcon GT, Torana)', dims: [4.8, 1.85] },
    'supercars-90': { f: 'carroceria', p: { nariz: .6, traseira: .9, cab: [.1, -.95, .76], farois: 'finos', asa: 'asa' }, nome: 'V8 Supercars (Commodore, Falcon, 1993–2012)', dims: [4.95, 1.9] },
    'supercars-cotf': { f: 'carroceria', p: { nariz: .55, traseira: .9, cab: [.1, -.95, .76], farois: 'finos', asa: 'asa', splitter: true, paralamas: .04 }, nome: 'Supercars Car of the Future (2013–2022)', dims: [4.95, 1.95] },
    'supercars-gen3': { f: 'carroceria', p: { nariz: .5, traseira: .88, cab: [.05, -.95, .74], farois: 'finos', asa: 'asa', splitter: true, paralamas: .06 }, nome: 'Supercars Gen3 (Mustang, Camaro)', dims: [4.95, 1.95] },
    /* endurance */
    'barchetta-50': { f: 'prototipo', p: { aberto: true, bico: .5, paralama: .95, meio: .86, cauda: .7, asa: 'nenhuma', farois: 'redondos', tomadas: false, cabX: -.05, barbatana: true }, nome: 'Esporte dos anos 50 (Jaguar D-Type, Ferrari 250 TR)', dims: [4.0, 1.65] },
    'sport-60': { f: 'prototipo', p: { bico: .5, paralama: .98, meio: .84, cauda: .92, asa: 'cauda', farois: 'redondos', cabC: .72, cabW: .46, tomadas: false }, nome: 'Protótipo dos anos 60 (Ford GT40, Ferrari 330 P4)', dims: [4.2, 1.8] },
    'sport-917': { f: 'prototipo', p: { bico: .42, paralama: 1, meio: .86, cauda: .55, asa: 'cauda', farois: 'redondos', cabC: .62, cabW: .4, rT: .24, cabX: .12, tomadas: false }, nome: 'Porsche 917 / Ferrari 512 (cauda longa)', dims: [4.8, 2.0] },
    'sport-936': { f: 'prototipo', p: { aberto: true, bico: .3, paralama: .98, meio: .62, cauda: .85, asa: 'alta', farois: 'pares', cabX: .0 }, nome: 'Grupo 6 (Porsche 936, Alfa 33TT)', dims: [4.4, 1.98] },
    'grupoC': { f: 'prototipo', p: { bico: .62, paralama: .98, meio: .93, cauda: .97, asa: 'baixa', farois: 'redondos', cabC: .72, cabW: .42, cabX: .12, elementos: 2, asaLarg: .98, numX: .3 }, nome: 'Grupo C (Porsche 956/962, Jaguar XJR-9, Sauber C9)', dims: [4.8, 2.0] },
    'gtp': { f: 'prototipo', p: { bico: .55, paralama: .98, meio: .9, cauda: .95, asa: 'alta', farois: 'pares', cabC: .74, cabW: .42, cabX: .1, elementos: 2 }, nome: 'IMSA GTP (Jaguar XJR, Nissan NPT-90, Eagle MkIII)', dims: [4.7, 2.0] },
    'imsa-gt': { f: 'carroceria', p: { gt: true, nariz: .55, traseira: .82, cab: [.0, -.8, .72], farois: 'redondos', asa: 'asa', paralamas: .16 }, nome: 'IMSA GT dos anos 70 (Porsche 935, BMW M1)', dims: [4.7, 2.0] },
    'wsc-90': { f: 'prototipo', p: { aberto: true, bico: .32, paralama: .98, meio: .62, cauda: .85, asa: 'baixa', farois: 'pares', cabX: .05 }, nome: 'Protótipo aberto (Ferrari 333 SP, Audi R8)', dims: [4.6, 2.0] },
    'lmp-2005': { f: 'prototipo', p: { aberto: true, bico: .3, paralama: .98, meio: .6, cauda: .85, asa: 'baixa', farois: 'pares', cabX: .05, elementos: 2 }, nome: 'LMP aberto (Lola B05, Courage, Audi R10)', dims: [4.65, 2.0] },
    'lmp1': { f: 'prototipo', p: { bico: .3, paralama: 1, meio: .55, cauda: .85, asa: 'baixa', farois: 'barra', barbatana: true, cabC: .8, cabW: .44, elementos: 2 }, nome: 'LMP1 híbrido (Audi R18, Porsche 919, Toyota TS050)', dims: [4.65, 1.9] },
    'lmp2-2011': { f: 'prototipo', p: { bico: .32, paralama: .98, meio: .58, cauda: .85, asa: 'baixa', farois: 'pares', barbatana: true, cabC: .78, cabW: .42 }, nome: 'LMP2 (Oreca 03, HPD ARX, Zytek, 2011–2016)', dims: [4.65, 1.95] },
    'lmp2': { f: 'prototipo', p: { bico: .3, paralama: 1, meio: .58, cauda: .85, asa: 'baixa', farois: 'barra', barbatana: true, cabC: .8, cabW: .44 }, nome: 'Oreca 07 / Ligier JS P217 (LMP2)', dims: [4.75, 1.9] },
    'dp': { f: 'prototipo', p: { bico: .7, paralama: .96, meio: .9, cauda: .95, asa: 'alta', farois: 'pares', cabC: .9, cabW: .52, cabX: .04, tomadas: true }, nome: 'Daytona Prototype (Riley, Dallara DP)', dims: [4.6, 1.95] },
    'dpi': { f: 'prototipo', p: { bico: .3, paralama: 1, meio: .58, cauda: .85, asa: 'baixa', farois: 'barra', barbatana: true, cabC: .8, cabW: .44 }, nome: 'DPi (Cadillac, Acura ARX-05, Mazda RT24-P)', dims: [4.75, 1.95] },
    'hyper': { f: 'prototipo', p: { bico: .3, paralama: 1, meio: .62, cauda: .82, asa: 'baixa', farois: 'barra', barbatana: true, cabC: .82, cabW: .44, elementos: 1 }, nome: 'Hipercarro LMH (Toyota GR010, Ferrari 499P)', dims: [5.0, 2.0] },
    'lmdh': { f: 'prototipo', p: { bico: .28, paralama: 1, meio: .6, cauda: .85, asa: 'baixa', farois: 'barra', barbatana: true, cabC: .82, cabW: .44, elementos: 1 }, nome: 'LMDh / GTP (Porsche 963, Cadillac V-Series.R, BMW M Hybrid)', dims: [5.1, 2.0] },
    'canam-60': { f: 'prototipo', p: { aberto: true, bico: .35, paralama: 1, meio: .7, cauda: .9, asa: 'alta', farois: 'nenhum', cabX: .0, tomadas: false }, nome: 'Can-Am (McLaren M8, Porsche 917/30, Chaparral)', dims: [4.3, 2.05] },
    'canam-80': { f: 'formula', base: 'f1-1980', over: { pods: [.6, -1.8, .82, 'efeitoSolo'], rF: [1.5, .8, .62, .34], rT: [-1.55, .8, .74, .5] }, nome: 'Can-Am monoposto carenado (Lola T530)', dims: [4.4, 2.05] },
    'sport-nacional': { f: 'prototipo', p: { aberto: true, bico: .35, paralama: .95, meio: .62, cauda: .85, asa: 'baixa', farois: 'pares', cabX: .05 }, nome: 'Protótipo nacional (Spyder, Aldee, MCR)', dims: [4.2, 1.85], esc: [['Sport Nacional', 1966, 2026]] },
    /* o safety car e o pace car (só na pista, fora da garagem) */
    'safety-car': { f: 'carroceria', p: { gt: true, nariz: .42, traseira: .84, cab: [.0, -.95, .72], farois: 'finos', asa: 'spoiler', splitter: true, paralamas: .12, respiros: true, capoCentral: true, tetoNum: false, tetoCor: 'cor' }, nome: 'Safety car', dims: [4.6, 1.95], oculto: true },
    /* kart */
    'kart-60': { f: 'kartE', p: {}, nome: 'Kart tubular sem carenagem (anos 60 e 70)', dims: [1.75, 1.25] },
    'kart-90': { f: 'kartE', p: { laterais: true }, nome: 'Kart de laterais redondas (anos 80 e 90)', dims: [1.8, 1.3] },
    'kart': { f: 'kartE', p: { moderno: true }, nome: 'Kart CIK-FIA atual', dims: [1.85, 1.35] }
  };

  /* ─────────── qual carro cada campeonato usava, ano a ano ─────────── */
  const ate = (...faixas) => ano => { for(const [a, k] of faixas) if(ano <= a) return k; return faixas[faixas.length - 1][1]; };
  const F3 = ate([1960, 'f3-500'], [1971, 'f3-1965'], [1982, 'f3-1975'], [1993, 'f3-1985'], [2004, 'f3-1995'], [2011, 'f3-2005'], [2015, 'f3-2012'], [2018, 'f3-2016'], [2024, 'f3-2019'], [9999, 'f3-2025']);
  const F3n = ate([1971, 'f3-1965'], [1982, 'f3-1975'], [1993, 'f3-1985'], [2004, 'f3-1995'], [2011, 'f3-2005'], [2015, 'f3-2012'], [9999, 'f3-2016']);
  const F4 = ate([2021, 'f4-t014'], [9999, 'f4-t421']);
  const F4m = ate([2020, 'mygale-f4'], [9999, 'mygale-f4h']);
  const FR2 = ate([1999, 'fr-1995'], [2009, 'tatuus-fr2000'], [2018, 'barazi-fr10'], [9999, 'tatuus-fr19']);
  const KART = ate([1975, 'kart-60'], [1995, 'kart-90'], [9999, 'kart']);
  const F1 = ate([1957, 'f1-1950'], [1966, 'f1-1960'], [1977, 'f1-1975'], [1982, 'f1-1980'], [1993, 'f1-1988'], [2008, 'f1-2000'], [2016, 'f1-2012'], [2017, 'f1-2019'], [2021, 'f1-2019h'], [2025, 'f1-2022'], [9999, 'f1-2026']);
  const GT3 = ate([2005, 'gt-2000'], [9999, ['gt3', 'gt3', 'gt3-gt', 'gt3-911']]);
  const POR_CAMP = {
    f1: F1,
    euro_f2: ate([1972, 'f2-1970'], [9999, 'f2-1980']),
    f3000: ate([1995, 'f3000-1990'], [2001, 'lola-t96'], [9999, 'lola-b02']), f3000_brit: ate([9999, 'f3000-1990']), f3000_italia: ate([1995, 'f3000-1990'], [2001, 'lola-t96'], [9999, 'lola-b02']),
    gp2: ate([2007, 'gp2-05'], [2010, 'gp2-08'], [9999, 'gp2-11']), gp2_asia: ate([2010, 'gp2-08'], [9999, 'gp2-11']),
    f2: ate([2017, 'gp2-11'], [2023, 'f2-2018'], [9999, 'f2-2024']),
    wsbn: ate([9999, 'wsbn']), wsr: ate([2011, 'wsr-t05'], [9999, 'wsr-t12']), a1gp: ate([9999, 'a1gp']),
    fnippon: ate([2008, 'fnippon-old'], [2013, 'fn09'], [2018, 'sf14'], [2022, 'sf19'], [9999, 'sf23']), jp_f2: ate([1977, 'f2-1970'], [1986, 'f2-1980'], [9999, 'f3000-1990']),
    f3: ate([2024, 'f3-2019'], [9999, 'f3-2025']), gp3: ate([2012, 'gp3-10'], [2015, 'gp3-13'], [9999, 'gp3-16']),
    f3_euro_fia: F3, f3_euroseries: F3, f3_euro_7584: F3, f3_brit: F3, f3_alema: F3, f3_italiana: F3, f3_japao: F3n, f3_sudam: F3n, f3_brasil: F3n,
    euroformula: ate([2011, 'f3-2005'], [2018, 'f3-2016'], [9999, 'dallara-320']), sf_lights: ate([9999, 'dallara-320']),
    gb3: ate([2021, 'msv-016'], [9999, 'msv-022']), eurocup3: ate([9999, 'tatuus-t318']), frec: ate([9999, 'tatuus-t318']),
    fr_eurocup: FR2, fr_uk: FR2, fr_nec: FR2, fr_alps: FR2, fr_brasil: FR2,
    frme: ate([9999, 'tatuus-t318']), fram: ate([2023, 'ligier-f3'], [9999, 'tatuus-t318']), frjp: ate([9999, 'dome-f111']), froc: ate([2019, 'tatuus-ft50'], [9999, 'tatuus-ft60']), frin: ate([9999, 'tatuus-t318']),
    fbmw_adac: ate([2001, 'fbmw-old'], [9999, 'mygale-fb02']), fbmw_europe: ate([9999, 'mygale-fb02']), fbmw_uk: ate([9999, 'mygale-fb02']), fbmw_usa: ate([9999, 'mygale-fb02']),
    f4_italia: F4, f4_brit: ate([2021, 'mygale-f4'], [9999, 'f4-t421']), f4_adac: F4, f4_espanha: F4, f4_franca: F4m, f4_japao: ate([2021, 'dome-f110'], [9999, 'dome-f111f4']),
    f4_china: F4m, f4_eua: ate([2021, 'ligier-f4'], [9999, 'ligier-f422']), f4_nacam: F4, f4_cez: F4, f4_uae: F4, f4_meio: F4, f4_india: F4m, f4_sea: F4m, f4_australia: F4m,
    w_series: ate([9999, 'tatuus-t318']), f1_academy: ate([9999, 'f4-t421']), f4_brasil: F4, f4_danish: F4m, f4_neerlandesa: F4,
    ff_brit: ate([1983, 'ff-1970'], [2011, 'ff-1990'], [9999, 'ff-2012']), ff_festival: ate([1983, 'ff-1970'], [2011, 'ff-1990'], [9999, 'ff-2012']), ff_brasil: ate([1983, 'ff-1970'], [9999, 'ff-1990']),
    fvee_brasil: ate([9999, 'fvee']), fvee: ate([9999, 'fvee']), super_vee: ate([9999, 'super-vee']), fopel: ate([9999, 'fopel']), fabarth: ate([9999, 'tatuus-fa']), fmasters: ate([9999, 'tatuus-fm']),
    fjunior: ate([9999, 'fjunior']), f3_500: ate([9999, 'f3-500']),
    atlantic: ate([1995, 'atlantic-1980'], [2005, 'atlantic-2000'], [9999, 'swift-016']), barber: ate([1995, 'barber-saab'], [9999, 'barber']), fdelta: F4,
    indy: ate([2002, 'irl-1997'], [2011, 'ir03'], [2014, 'indy12'], [2017, 'indy15'], [2019, 'indy18'], [9999, 'indy20']),
    cart: ate([1980, 'usac-1970'], [1986, 'cart-1982'], [1995, 'cart-1990'], [2006, 'cart-2000'], [9999, 'dp01']),
    aaa: ate([9999, 'roadster']), usac: ate([1964, 'roadster'], [9999, 'usac-1970']),
    indy_lights: ate([1992, 'lights-1986'], [2001, 'lights-1993'], [2014, 'ipps'], [2022, 'il15'], [9999, 'il15-aero']),
    ip2000: ate([2017, 'star-mazda'], [9999, 'pm18']), usf2000: ate([2016, 'usf-vandiemen'], [2021, 'tatuus-usf17'], [9999, 'tatuus-usf22']), usf_juniors: ate([9999, 'ligier-f422']),
    nascar_cup: ate([1959, 'cup-1950'], [1968, 'cup-1965'], [1970, 'cup-aero'], [1980, 'cup-1975'], [1991, 'cup-1985'], [2006, 'cup-1995'], [2010, 'cup-cot'], [2021, 'cup-gen5'], [9999, 'cup-nextgen']),
    nascar_xfinity: ate([1991, 'cup-1985'], [2010, 'cup-1995'], [9999, 'xfinity']), nascar_truck: ate([9999, 'truck']), arca: ate([1959, 'cup-1950'], [1970, 'cup-1965'], [1980, 'cup-1975'], [1991, 'cup-1985'], [2014, 'cup-1995'], [9999, 'arca']),
    stock_car: ate([1993, 'opala'], [1999, 'omega'], [2008, 'stock-2000'], [2019, 'stock-2009'], [2023, 'stock-2020'], [9999, 'stock-suv']),
    stock_light: ate([2008, 'omega'], [9999, 'stock-light']), turismo_nac: ate([9999, 'turismo-nac']), porsche_br: ate([2012, 'porsche-old'], [9999, 'porsche']), marcas_br: ate([1999, 'marcas-80'], [9999, 'marcas-br']),
    porsche_supercup: ate([2012, 'porsche-old'], [9999, 'porsche']),
    dtm: ate([1992, 'dtm-grupoA'], [1996, 'dtm-itc'], [2011, 'dtm-2000'], [2020, 'classe1'], [9999, ['gt3', 'gt3', 'gt3-gt', 'gt3-911']]),
    btcc: ate([1969, 'turismo-60'], [1982, 'etcc-70'], [1989, 'turismo-80'], [2000, 'super-touring'], [2010, 'btc-t'], [9999, 'ngtc']),
    wtcc: ate([2017, 'wtcc'], [9999, 'tcr']), tcr_world: ate([9999, 'tcr']), tcr_sa: ate([9999, 'tcr']),
    etcc: ate([1969, 'turismo-60'], [1981, 'etcc-70'], [1989, 'turismo-80'], [2000, 'super-touring'], [9999, 'wtcc']),
    supercars: ate([1984, 'supercars-70'], [1992, 'turismo-80'], [2012, 'supercars-90'], [2022, 'supercars-cotf'], [9999, 'supercars-gen3']),
    super_gt: ate([2013, 'jgtc'], [9999, 'gt500']), fia_gt: ate([2009, 'gt1'], [9999, 'gt1']),
    gtwc_europe: GT3, gtwc_america: GT3, british_gt: GT3, gt_open: GT3,
    wec: ate([2020, 'lmp1'], [2022, 'hyper'], [9999, ['hyper', 'lmdh']]),
    wsc: ate([1961, 'barchetta-50'], [1967, 'sport-60'], [1975, 'sport-917'], [1981, 'sport-936'], [9999, 'grupoC']),
    elms: ate([2010, 'lmp-2005'], [2016, 'lmp2-2011'], [9999, 'lmp2']), asian_lms: ate([2016, 'lmp2-2011'], [9999, 'lmp2']),
    imsa: ate([1980, 'imsa-gt'], [1993, 'gtp'], [1998, 'wsc-90'], [2013, 'dp'], [2016, 'dp'], [2022, 'dpi'], [9999, 'lmdh']),
    alms: ate([2006, 'wsc-90'], [9999, 'lmp-2005']), grand_am: ate([9999, 'dp']), canam: ate([1974, 'canam-60'], [9999, 'canam-80']),
    fe: ate([2018, 'fe1'], [2022, 'fe2'], [9999, 'fe3']),
    kart_mundial: KART, kart_europeu: KART, wsk_super: KART, wsk_euro: KART, cotf: KART, kart_brasil: KART, copa_brasil_kart: KART
  };
  /* as categorias da escada que não são um campeonato do catálogo */
  const POR_NOME = [
    [/Kart/i, KART],
    [/Midget/i, () => 'midget'],
    [/Sprint Car/i, ate([1985, 'sprint'], [9999, 'sprint-asa'])],
    [/Modificad/i, () => 'modificado'],
    [/Late Model/i, () => 'late-model'],
    [/Corridas de Terra/i, ate([1970, 'jalopy'], [9999, 'late-model-terra'])],
    [/Sportsman/i, () => 'sportsman'],
    [/Corridas de Bairro/i, ate([1965, 'jalopy'], [9999, 'turismo-nac'])],
    [/Corridas (Regionais|Nacionais)/i, ate([1960, 'carretera'], [1975, 'turismo-60'], [1992, 'turismo-80'], [9999, 'turismo-nac'])],
    [/^Turismo$/i, ate([1969, 'turismo-60'], [1982, 'etcc-70'], [1989, 'turismo-80'], [2000, 'super-touring'], [9999, 'tcr'])],
    [/Sport Nacional/i, ate([1965, 'barchetta-50'], [9999, 'sport-nacional'])],
    [/Mundial de Sport/i, POR_CAMP.wsc],
    [/WEC|Endurance/i, ate([1961, 'barchetta-50'], [1967, 'sport-60'], [1975, 'sport-917'], [1981, 'sport-936'], [1992, 'grupoC'], [2011, 'lmp-2005'], [2020, 'lmp1'], [2022, 'hyper'], [9999, 'lmdh'])],
    [/LMP2/i, POR_CAMP.elms],
    [/Super Vee/i, () => 'super-vee'],
    [/Fórmula Vee/i, () => 'fvee'],
    [/Atlantic/i, POR_CAMP.atlantic],
    [/Barber/i, POR_CAMP.barber],
    [/Star Mazda|Indy Pro|Pro Mazda/i, POR_CAMP.ip2000],
    [/USF ?2000/i, POR_CAMP.usf2000],
    [/Indy Lights|Indy NXT/i, POR_CAMP.indy_lights],
    [/World Series/i, ate([2004, 'wsbn'], [9999, 'wsr-t12'])],
    [/Fórmula Delta/i, POR_CAMP.fdelta],
    [/Renault Brasil/i, POR_CAMP.fr_brasil],
    [/Fórmula Júnior/i, () => 'fjunior'],
    [/Fórmula 3 \(500/i, () => 'f3-500'],
    [/Fórmula Regional/i, ate([9999, 'tatuus-t318'])],
    [/Fórmula Renault/i, ate([1993, 'fopel'], [2009, 'tatuus-fr2000'], [2018, 'barazi-fr10'], [9999, 'tatuus-fr19'])],
    [/Fórmula 4/i, F4],
    [/Fórmula Ford/i, ate([1983, 'ff-1970'], [2011, 'ff-1990'], [9999, 'ff-2012'])],
    [/Fórmula 3000|F3000/i, POR_CAMP.f3000],
    [/GP2/i, POR_CAMP.gp2],
    [/ARCA/i, POR_CAMP.arca],
    [/Fórmula 3/i, F3],
    [/Fórmula 2/i, ate([1972, 'f2-1970'], [1984, 'f2-1980'], [1995, 'f3000-1990'], [2004, 'lola-b02'], [2010, 'gp2-08'], [2017, 'gp2-11'], [2023, 'f2-2018'], [9999, 'f2-2024'])],
    [/Stock/i, POR_CAMP.stock_car],
    [/NASCAR|Busch|Xfinity/i, POR_CAMP.nascar_cup],
    [/IndyCar|Indy/i, ate([1964, 'roadster'], [1980, 'usac-1970'], [1995, 'cart-1990'], [2002, 'irl-1997'], [2011, 'ir03'], [2014, 'indy12'], [2017, 'indy15'], [2019, 'indy18'], [9999, 'indy20'])],
    [/DTM/i, POR_CAMP.dtm],
    [/Fórmula E/i, POR_CAMP.fe]
  ];

  /* as famílias da garagem, na ordem em que aparecem (o primeiro padrão que bate) */
  const GRUPOS = [
    ['Fórmula 1', /^f1-/],
    ['Fórmula E', /^fe\d/],
    ['IndyCar, CART e a escada americana', /^(roadster|usac|cart|dp01|irl|ir03|indy|lights|ipps|il15|star-mazda|pm18|usf-|tatuus-usf|atlantic|swift|barber|super-vee)/],
    ['Fórmula 2, F3000, GP2 e Super Formula', /^(f2-|f3000|lola-|gp2|wsbn|wsr|a1gp|fnippon|fn09|sf\d)/],
    ['Fórmula 3', /^(f3-|gp3|dallara-320|fjunior|msv-)/],
    ['Fórmula Regional, Renault, BMW e F4', /^(tatuus|barazi|ligier|dome|mygale|fr-|fbmw|f4-)/],
    ['Fórmula Ford, Vee e as escolas', /^(ff-|fvee|fopel)/],
    ['Terra e ovais curtos', /^(midget|sprint|modificado|late-model|sportsman|jalopy|carretera)/],
    ['NASCAR', /^(cup-|xfinity|truck|arca)/],
    ['Brasil', /^(opala|omega|stock-|turismo-nac|marcas|porsche)/],
    ['Turismo', /^(turismo-|dtm-|classe1|super-touring|btc-t|ngtc|wtcc|tcr|etcc|supercars)/],
    ['GT', /^(gt|jgtc|imsa-gt)/],
    ['Endurance e protótipos', /^(barchetta|sport-|grupoC|gtp|wsc|lmp|dp|hyper|lmdh|canam)/],
    ['Kart', /^kart/]
  ];
  C2D.Estilos = {
    DEF, POR_CAMP, POR_NOME, GRUPOS,
    grupoDe(est){ const g = GRUPOS.find(([, rx]) => rx.test(est)); return g ? g[0] : 'Outros'; },
    /* em que campeonatos (e de que ano a que ano) cada carro correu: { est: [{ id, n, de, ate }] } */
    usos(){
      if(C2D.Estilos._usos) return C2D.Estilos._usos;
      const u = {};
      const lista = typeof HIST !== 'undefined' && HIST.C ? HIST.C : [];
      for(const c of lista){
        const f = POR_CAMP[c.id]; if(!f) continue;
        const fim = Math.min(c.ate || 2026, 2026);
        for(let a = c.de; a <= fim; a++){
          for(const est of [].concat(f(a))){
            const l = u[est] = u[est] || [];
            const ult = l.filter(x => x.id === c.id).pop();
            if(ult && ult.ate === a - 1) ult.ate = a;
            else if(!(ult && ult.ate === a)) l.push({ id: c.id, n: c.n, de: a, ate: a });
          }
        }
      }
      return C2D.Estilos._usos = u;
    },
    /* o ano que representa o carro (o meio do período mais longo em que correu) */
    anoDe(est){ const l = (C2D.Estilos.usos()[est] || []).slice().sort((a, b) => (b.ate - b.de) - (a.ate - a.de))[0]; return l ? Math.round((l.de + l.ate) / 2) : 2024; },
    /* o estilo do carro de uma categoria (nome da escada ou campeonato do catálogo) num ano */
    /* chave: a equipe (nos grids mistos, como o hipercarro LMH/LMDh e a GT3, cada equipe tem o seu modelo) */
    daCategoria(cat, ano, kart, chave){
      const um = k => Array.isArray(k) ? k[A().hash(chave || '') % k.length] : k;
      if(kart && !(cat && /Kart/i.test(cat))) return KART(ano);
      let id = null;
      try { if(cat && typeof campDaCat === 'function') id = campDaCat(cat, ano); } catch(e){}
      if(id && POR_CAMP[id]) return um(POR_CAMP[id](ano));
      if(cat) for(const [rx, f] of POR_NOME) if(rx.test(cat)) return um(f(ano));
      return null;
    },
    /* todos os carros de um campeonato, com o primeiro ano de cada um (para a garagem) */
    doCampeonato(id, de, ate){
      const f = POR_CAMP[id], out = [];
      if(!f) return out;
      let ult = null;
      for(let a = de; a <= ate; a++){ const ks = [].concat(f(a)); const k = ks.join(','); if(k !== ult){ ks.filter((x, i) => ks.indexOf(x) === i).forEach(x => out.push({ est: x, ano: a })); ult = k; } }
      return out;
    },
    dims(est){ const d = DEF[est]; return d && d.dims ? { comp: d.dims[0], larg: d.dims[1] } : null; },
    desenhar(g, E, o){
      const lib = A();
      const faltam = o.faltam, sem = k => !!(faltam && faltam.has(k));
      if(E.f === 'formula'){
        const base = C2D.Arte.semPecas(Object.assign({}, lib.formula && C2D.Arte.FORM[E.base] || {}, E.over || {}), faltam);
        const cheia = Object.assign({}, C2D.Arte.FORM[E.base] || {}, E.over || {});
        /* (a escala é a do carro inteiro: sem a asa ele não encolhe) */
        const Lb = (cheia.asaD ? cheia.asaD.x : cheia.bico[0]) - (cheia.asaT ? cheia.asaT.x - cheia.asaT.prof : cheia.motor[1]);
        const Wb = 2 * Math.max(cheia.rF[1] + cheia.rF[3] / 2, cheia.rT[1] + cheia.rT[3] / 2, cheia.asaD ? cheia.asaD.larg / 2 : 0, cheia.asaT ? cheia.asaT.larg / 2 : 0);
        g.scale(o.L / Math.max(3, Lb + .05), o.W / Math.max(1.2, Wb));
        return lib.formula(g, base, o.cor, o.cor2, o.num, o.capCor, o.compCor, o.padrao, E.base);
      }
      if(E.f === 'frente'){ g.scale(o.L / E.p.L0, o.W / E.p.W0); return frente(g, E.p, o); }
      if(E.f === 'sprint'){ g.scale(o.L / E.p.L0, o.W / 1.8); return sprint(g, sem('asaT') ? Object.assign({}, E.p, { asa: 0 }) : E.p, o); }
      if(E.f === 'modificado'){ g.scale(o.L / E.p.L0, o.W / 1.95); return modificado(g, E.p, o); }
      if(E.f === 'kartE'){ g.scale(o.L / 1.85, o.W / 1.35); return kartE(g, E.p, o); }
      /* sem a asa ou o splitter, o desenho sem eles */
      const p = (sem('asaT') || sem('paraF') || sem('paraT')) ? Object.assign({}, E.p, sem('asaT') ? { asa: E.f === 'carroceria' ? 'spoilerQuebrado' : 'nenhuma', asaGrande: false } : {}, sem('paraF') ? { splitter: false } : {}, sem('paraT') ? { difusor: false } : {}) : E.p;
      if(E.f === 'carroceria') return carroceria(g, p, o);
      if(E.f === 'antigo') return antigo(g, p, o);
      if(E.f === 'p911') return p911(g, p, Object.assign({}, o, { semAsa: sem('asaT') }));
      if(E.f === 'prototipo') return prototipo(g, p, o);
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
