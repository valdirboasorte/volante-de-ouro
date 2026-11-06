/* Corrida 2D: o carro.
   Modelo de bicicleta (um eixo na frente, um atrás) a 120 passos por segundo. O pneu gera
   força lateral pelo ângulo de deriva até um pico e cai um pouco depois dele (é aí que o
   carro escorrega). Cada eixo divide a aderência entre frear/acelerar e virar (elipse de
   atrito): pé embaixo na saída de curva solta a traseira, freio demais trava a frente.
   O peso passa para a frente na freada e para trás na aceleração, e a asa empurra o carro
   contra o chão com o quadrado da velocidade.
   Os números de aderência, potência, freio e arrasto são os de Prova.fisica (a física de
   cada categoria e época que o jogo já ajustou a tempos reais), com a calibração da pista
   (P.f) para a trajetória ideal. O resto (massa, entre-eixos, tamanho) vem da tabela abaixo. */
(function(raiz){
  const C2D = raiz.C2D;
  const { lim, rampa } = C2D;
  const G = 9.81;
  const PISO = C2D.PISO;
  /* aderência e arrasto de cada piso: [aderência, freio extra em g] */
  const PISOS = [[1, 0], [.95, 0], [.55, .28], [.42, .95], [.93, 0], [1, 0], [.5, .5]];
  /* o acerto de base (equilíbrio entre os eixos e folga do volante) */
  const AJ = C2D.AJ = { muF: .975, muR: 1.04, Br: 1.2, folgaAp: 1.6, folgaLat: 1.2, aeroF: 0, transf: .6 };

  /* ── o carro de cada categoria e época ──
     m (kg com piloto), L entre-eixos, fw peso na frente, h centro de gravidade, comp e larg
     (m), d0 esterço máximo (rad), ap deriva do pico do pneu (rad), marchas e giro máximo */
  function modelo(sk, ano, nivel, kart){
    if(kart) return { tipo: 'kart', m: 165, L: 1.05, fw: .43, h: .25, comp: 1.85, larg: 1.35, d0: .42, ap: .11, marchas: 1, rpm: 15000 };
    const tin = sk === 'nascar' || sk === 'stock' || sk === 'dtm';
    if(nivel >= 1 && !tin){
      return nivel === 1 ? { tipo: 'formula', m: 790, L: 3.1, fw: .44, h: .3, comp: 5.2, larg: 1.9, d0: .36, ap: .095, marchas: 6, rpm: 9000 }
           : nivel === 2 ? { tipo: 'formula', m: 670, L: 2.9, fw: .43, h: .3, comp: 4.9, larg: 1.85, d0: .37, ap: .1, marchas: 6, rpm: 8500 }
           :               { tipo: 'formula', m: 570, L: 2.7, fw: .42, h: .3, comp: 4.3, larg: 1.75, d0: .38, ap: .105, marchas: 5, rpm: 7500 };
    }
    if(sk === 'nascar') return { tipo: 'stock', m: 1580, L: 2.79, fw: .53, h: .45, comp: 5.2, larg: 2.0, d0: .34, ap: .13, marchas: 4, rpm: 9500 };
    if(sk === 'stock')  return { tipo: 'turismo', m: 1300, L: 2.7, fw: .52, h: .45, comp: 4.8, larg: 1.95, d0: .36, ap: .12, marchas: 6, rpm: 7500 };
    if(sk === 'dtm')    return { tipo: 'turismo', m: 1100, L: 2.75, fw: .5, h: .42, comp: 4.9, larg: 1.95, d0: .36, ap: .115, marchas: 6, rpm: 9000 };
    if(sk === 'fe')     return { tipo: 'fe', m: 900, L: 3.0, fw: .42, h: .3, comp: 5.0, larg: 1.8, d0: .38, ap: .1, marchas: 1, rpm: 0 };
    if(sk === 'wec')    return { tipo: 'prototipo', m: 1030, L: 3.0, fw: .45, h: .35, comp: 4.9, larg: 2.0, d0: .35, ap: .1, marchas: 7, rpm: 9000 };
    if(sk === 'indy')   return { tipo: 'formula', m: 770, L: 3.0, fw: .42, h: .3, comp: 5.2, larg: 1.95, d0: .35, ap: .095, marchas: 6, rpm: 12000 };
    /* F1 por época */
    if(ano < 1967) return { tipo: 'antigo', m: 520, L: 2.35, fw: .42, h: .34, comp: 3.8, larg: 1.55, d0: .42, ap: .13, marchas: 5, rpm: 10000 };
    if(ano < 1983) return { tipo: 'formula', m: 600, L: 2.7, fw: .4, h: .3, comp: 4.4, larg: 2.0, d0: .38, ap: .11, marchas: 5, rpm: 11500 };
    if(ano < 1995) return { tipo: 'formula', m: 600, L: 2.9, fw: .41, h: .3, comp: 4.5, larg: 2.0, d0: .37, ap: .1, marchas: 6, rpm: 14500 };
    if(ano < 2009) return { tipo: 'formula', m: 620, L: 3.05, fw: .44, h: .28, comp: 4.6, larg: 1.8, d0: .36, ap: .09, marchas: 7, rpm: 19000 };
    if(ano < 2014) return { tipo: 'formula', m: 660, L: 3.3, fw: .45, h: .28, comp: 5.0, larg: 1.8, d0: .35, ap: .09, marchas: 7, rpm: 18000 };
    if(ano < 2017) return { tipo: 'formula', m: 720, L: 3.5, fw: .45, h: .28, comp: 5.3, larg: 1.8, d0: .34, ap: .09, marchas: 8, rpm: 12000 };
    if(ano < 2022) return { tipo: 'formula', m: 760, L: 3.6, fw: .45, h: .28, comp: 5.6, larg: 2.0, d0: .33, ap: .085, marchas: 8, rpm: 12000 };
    return { tipo: 'formula', m: 800, L: 3.6, fw: .45, h: .28, comp: 5.6, larg: 2.0, d0: .33, ap: .085, marchas: 8, rpm: 12000 };
  }

  C2D.Carro = {
    modelo,
    /* o carro pronto para a pista P. opc: { sk, ano, nivel, k (fator de tempo de volta do
       carro: 1 = referência, 1.01 = 1% mais lento), mods (o que o piloto muda no carro),
       assist: { abs, tc, direcao } } */
    criar(P, opc){
      opc = opc || {};
      const md = modelo(opc.sk || 'f1', opc.ano || P.ano, opc.nivel || 0, P.kart);
      /* o carro de verdade daquela categoria naquele ano (o catálogo de estilos2d.js); sem a
         categoria, o da série e do nível */
      const ano = opc.ano || P.ano;
      let est = C2D.Estilos && opc.cat ? C2D.Estilos.daCategoria(opc.cat, ano, P.kart, opc.eq || opc.id) : null;
      if(!est && C2D.Arte) est = C2D.Arte.estilo(opc.sk || 'f1', ano, opc.nivel || 0, P.kart);
      const dm = est && C2D.Estilos ? C2D.Estilos.dims(est) : null;
      if(dm){ md.comp = Math.max(dm.comp, md.L + .5); md.larg = dm.larg; }
      const fis = P.fis, f = P.f || 1, k = opc.k || 1, mods = opc.mods || {};
      /* semelhança dinâmica: com tudo isso o carro anda 1/k mais devagar em cada ponto */
      const k2 = k * k, k3 = k2 * k;
      const mu = fis.mu * f / k2 * (mods.ader || 1);
      const sp = Object.assign({}, md, {
        mu, aero: fis.aero * f, b0: fis.b0 * f / k2, pm: fis.pm / k3 * (mods.trac || 1), drag: fis.drag, vmax: fis.vmax / k,
        a: md.L * (1 - md.fw), b: md.L * md.fw,
        C: mods.C || 1.35, chuva: mods.chuva || 1,
        /* a inclinação das curvas do oval: a mesma aderência a mais que Prova.perfil dá */
        banco: P.oval ? .35 / k2 : 0
      });
      sp.Iz = md.m * sp.a * sp.b;
      sp.estilo = est;
      /* a deriva do pico do pneu traseiro (mais firme que o dianteiro) */
      sp.apR = sp.ap / AJ.Br;
      sp.B = Math.tan(Math.PI / (2 * sp.C)) / sp.ap;
      sp.fzr0 = sp.a / md.L;
      /* as relações de marcha (só o mostrador e o som: a potência é constante) */
      sp.vMarcha = [];
      for(let g = 1; g <= sp.marchas; g++) sp.vMarcha.push(sp.vmax * 1.03 * Math.pow(g / sp.marchas, .72));
      const c = {
        id: opc.id || 'ME', nome: opc.nome || '', cor: opc.cor || '#e10600', me: !!opc.me, sp, k,
        assist: Object.assign({ abs: true, tc: true, direcao: true, estab: true, freioAuto: false }, opc.assist || {}), danoMult: opc.danoMult || 1,
        x: 0, y: 0, psi: 0, vx: 0, vy: 0, r: 0, delta: 0,
        px: 0, py: 0, ppsi: 0,
        i: 0, s: 0, sTot: 0, d: 0, piso: 0, pisoF: 0, pisoR: 0,
        acel: 0, freio: 0, ax: 0, ay: 0, af: 0, ar: 0, travF: false, patinaR: false, deslize: 0,
        marcha: 1, rpm: 0, v: 0, dano: 0, batida: 0, molhado: 0
      };
      /* as peças (asa, bico, para-choques, rodas): o dano por peça de dano2d.js */
      if(C2D.Dano) C2D.Dano.preparar(c);
      return c;
    },

    /* o esterço máximo: com a direção progressiva, o volante todo virado leva o carro
       um pouco além do limite de aderência daquela velocidade (não mais que isso) */
    dmax(c, v, chuva){
      const sp = c.sp;
      if(!c.assist.direcao) return sp.d0 / (1 + v / 35);
      const latMax = G * (sp.mu * (chuva || 1) + sp.banco + sp.aero * v * v) * AJ.folgaLat;
      return Math.min(sp.d0, Math.atan(sp.L * latMax / Math.max(v * v, 1)) + sp.ap * AJ.folgaAp);
    },

    /* coloca o carro num ponto da pista, parado e alinhado */
    posicionar(c, P, s, d){
      const p = C2D.Pista.ponto(P, s, d);
      c.x = c.px = p.x; c.y = c.py = p.y; c.psi = c.ppsi = p.hd; c.vx = c.vy = c.r = c.delta = 0;
      c.i = p.i; const pr = C2D.Pista.projetar(P, c.x, c.y, c.i);
      c.i = pr.i; c.s = pr.s; c.d = pr.d; c.sTot = s < 0 ? pr.s - P.L : pr.s;
    },

    /* um passo de física. inp: { steer -1..1 (+ esquerda), acel 0..1, freio 0..1 }.
       amb: { w (pista molhada 0..1) } */
    passo(c, P, inp, dt, amb){
      const sp = c.sp, m = sp.m;
      c.px = c.x; c.py = c.y; c.ppsi = c.psi;
      const v = Math.hypot(c.vx, c.vy);
      const w = (amb && amb.w) || 0;
      const cs = Math.cos(c.psi), sn = Math.sin(c.psi);

      /* ── onde estão os eixos: o piso debaixo de cada um ── */
      const rel = c.psi - P.hd[c.i];
      const dF = c.d + sp.a * Math.sin(rel), dR = c.d - sp.b * Math.sin(rel);
      c.pisoF = C2D.Pista.piso(P, c.i, c.s, dF);
      c.pisoR = C2D.Pista.piso(P, c.i, c.s, dR);
      c.piso = C2D.Pista.piso(P, c.i, c.s, c.d);
      const chuva = (1 - .2 * w * (2 - sp.chuva)) * (c.aderPneu || 1);
      /* dano por peça (dano2d.js): rodas e suspensão tiram aderência do eixo; sem ele, o dano geral */
      const dm = c.dm;
      const muF = (sp.mu * chuva + sp.banco) * PISOS[c.pisoF][0] * (dm ? dm.muF : 1 - .16 * c.dano), muR = (sp.mu * chuva + sp.banco) * PISOS[c.pisoR][0] * (dm ? dm.muR : 1 - .06 * c.dano);
      const arrastoPiso = (PISOS[c.pisoF][1] + PISOS[c.pisoR][1]) / 2;

      /* ── cargas: peso, asa e transferência longitudinal ── */
      const D = sp.mu > 0 ? m * G * sp.aero * (c.aeroF || 1) * (1 - .15 * w) * v * v / sp.mu : 0;
      /* a asa da frente quebrada tira a carga da frente (o carro sai de frente); a de trás, a de trás */
      const pF = sp.fw + AJ.aeroF, DF = D * pF * (dm ? dm.aF : 1), DR = D * (1 - pF) * (dm ? dm.aR : 1);
      const Fz = m * G + DF + DR;
      let Fzf = m * G * sp.b / sp.L + DF - m * c.ax * sp.h * AJ.transf / sp.L;
      Fzf = lim(Fzf, Fz * .12, Fz * .88);
      const Fzr = Fz - Fzf;

      /* ── direção: esterço máximo que cai com a velocidade ── */
      const dmax = C2D.Carro.dmax(c, v, chuva);
      const alvoD = lim(inp.steer || 0, -1, 1) * dmax + (dm && v > 2 ? dm.puxa : 0);
      c.delta = rampa(c.delta, alvoD, 2.2 + 6 / (1 + v / 10), dt);
      const dl = c.delta;

      /* ── deriva dos pneus (com atraso de relaxação) ── */
      const vxa = Math.max(Math.abs(c.vx), 1.5), sg = c.vx >= 0 ? 1 : -1;
      const afAlvo = Math.atan2(c.vy + sp.a * c.r, vxa) - dl * sg;
      const arAlvo = Math.atan2(c.vy - sp.b * c.r, vxa);
      const rel2 = Math.min(1, (v + .5) * dt / .3);
      c.af += (afAlvo - c.af) * rel2; c.ar += (arAlvo - c.ar) * rel2;
      /* o acerto de base sai levemente sub-esterçante (traseira mais firme): estável no
         limite, mas pé demais na saída ainda solta a traseira */
      const curvaF = a => Math.sin(sp.C * Math.atan(sp.B * a)), curvaR = a => Math.sin(sp.C * Math.atan(sp.B * AJ.Br * a));
      let Fyf = -muF * AJ.muF * Fzf * curvaF(c.af), Fyr = -muR * AJ.muR * Fzr * curvaR(c.ar);

      /* ── frear e acelerar dentro do que o pneu dá ── */
      const brkCoef = G * (sp.b0 * (1 - .18 * w) + 1.1 * sp.aero * v * v) * m / Fz;
      const acel = lim(inp.acel || 0, 0, 1), freio = lim(inp.freio || 0, 0, 1);
      c.acel = acel; c.freio = freio;
      const capF = brkCoef * Fzf * PISOS[c.pisoF][0] * chuva * (dm ? dm.freioF : 1), capR = brkCoef * Fzr * PISOS[c.pisoR][0] * chuva * (dm ? dm.freioR : 1);
      const capT = muR * 1.55 * Fzr;
      let Fxf = 0, Fxr = 0;
      c.travF = false; c.patinaR = false;
      if(freio > 0 && v > .3){
        /* repartição puxada para a frente, como nos carros de verdade: a frente trava
           antes da traseira (o carro sai de frente, não roda) */
        const pedido = freio * (capF + capR) * 1.04 * sg, parteF = Math.min(.8, capF / Math.max(1, capF + capR) + .08);
        let bf = pedido * parteF, br = pedido * (1 - parteF);
        /* controle de estabilidade: traseira escorregando, alivia o freio de trás */
        if(c.assist.estab && Math.abs(c.ar) > sp.apR * .9) br *= .35;
        if(c.assist.abs){ bf = lim(bf, -capF * .97, capF * .97); br = lim(br, -capR * .97, capR * .97); }
        if(Math.abs(bf) > capF){ c.travF = true; bf = Math.sign(bf) * capF * .85; }
        if(Math.abs(br) > capR){ br = Math.sign(br) * capR * .85; }
        Fxf = -bf; Fxr = -br;
      }
      if(acel > 0){
        let ped = acel * m * sp.pm * (c.potF || 1) * (dm ? dm.pot : 1 - .25 * c.dano) * (c.potencia != null ? c.potencia : 1) / Math.max(v, 3);
        /* controle de tração: não pede mais do que o pneu traseiro dá, virando o quanto vira */
        const usoLat = Math.min(.98, Math.abs(Fyr) / Math.max(1, muR * Fzr));
        const livre = capT * Math.sqrt(1 - usoLat * usoLat);
        if(c.assist.tc) ped = Math.min(ped, livre * .96);
        if(c.assist.estab && Math.abs(c.ar) > sp.apR * 1.1) ped *= .6;
        /* e saindo de frente: alivia o acelerador para a frente voltar a morder */
        if(c.assist.estab && v > 8 && Math.abs(c.af) > sp.ap * 1.02) ped *= .3;
        if(ped > capT){ c.patinaR = true; ped = capT * .9; }
        Fxr += ped;
        /* a fração da potência que chegou às rodas (a energia contada gasta por ela) */
        c.potFrac = Math.min(1.3, ped * Math.max(v, 3) / Math.max(1, m * sp.pm));
      } else c.potFrac = 0;
      /* elipse de atrito: o que sobra para virar */
      const elipse = (Fy, Fx, capX, capY, solto) => {
        const u = capX > 0 ? Math.min(1, Math.abs(Fx) / capX) : 1;
        const l = capY * Math.sqrt(Math.max(0, 1 - u * u)) * (solto ? .55 : 1);
        return lim(Fy, -l, l);
      };
      Fyf = elipse(Fyf, Fxf, Math.max(capF, 1), muF * Fzf, c.travF);
      Fyr = elipse(Fyr, Fxr, Math.max(Fxr > 0 ? capT : capR, 1), muR * Fzr, c.patinaR);

      /* ── forças no carro (referência do carro: x para a frente, y para a esquerda) ── */
      const cd = Math.cos(dl), sd = Math.sin(dl);
      let Fx = Fxr + Fxf * cd - Fyf * sd;
      let Fy = Fyr + Fyf * cd + Fxf * sd;
      const Mz = sp.a * (Fyf * cd + Fxf * sd) - sp.b * Fyr;
      /* arrasto do ar, rolagem e piso (grama e brita seguram) */
      if(v > .05){
        const Fa = m * sp.drag * (c.dragF || 1) * (dm ? dm.drag : 1) * v * v + m * G * (.012 + arrastoPiso);
        Fx -= Fa * c.vx / v; Fy -= Fa * c.vy / v * .3;
      }
      const ax = Fx / m, ay = Fy / m;
      c.ax += (ax - c.ax) * Math.min(1, dt * 12);
      c.ay = ay;
      let vx = c.vx + (ax + c.vy * c.r) * dt;
      let vy = c.vy + (ay - c.vx * c.r) * dt;
      let r = c.r + Mz / sp.Iz * dt;
      /* parado e em baixa velocidade o modelo dinâmico vira o cinemático (estável na largada e nos boxes) */
      if(v < 6){
        const kin = 1 - v / 6;
        r += (vx * Math.tan(dl) / sp.L - r) * kin * .5;
        vy += (0 - vy) * kin * .35;
        if(freio > 0 && Math.abs(vx) < .6 && acel === 0){ vx = 0; vy = 0; r = 0; }
      }
      /* sem marcha à ré pelo acelerador: o freio parado só segura o carro */
      if(vx < -2) vx = -2;
      c.vx = vx; c.vy = vy; c.r = r;
      c.psi += r * dt;
      c.x += (vx * cs - vy * sn) * dt;
      c.y += (vx * sn + vy * cs) * dt;
      c.v = Math.hypot(vx, vy);
      c.deslize = Math.max(Math.abs(c.ar) / sp.apR, c.travF ? 1.4 : 0, c.patinaR ? 1.3 : 0);

      /* ── onde o carro está agora na pista ── */
      const ant = c.s;
      const pr = C2D.Pista.projetar(P, c.x, c.y, c.i);
      c.i = pr.i; c.s = pr.s; c.d = pr.d;
      let dsv = c.s - ant; if(dsv < -P.L / 2) dsv += P.L; else if(dsv > P.L / 2) dsv -= P.L;
      c.sTot += dsv;

      C2D.Carro.muro(c, P);
      C2D.Carro.motor(c);
    },

    /* o muro: os quatro cantos do carro não passam dele */
    muro(c, P){
      const sp = c.sp, cs = Math.cos(c.psi), sn = Math.sin(c.psi), nx = P.nx[c.i], ny = P.ny[c.i];
      const hl = sp.comp / 2, hw = sp.larg / 2;
      c.batida = 0;
      for(let q = 0; q < 4; q++){
        const lx = q < 2 ? hl : -hl, ly = q % 2 ? hw : -hw;
        const ox = lx * cs - ly * sn, oy = lx * sn + ly * cs;
        const dc = c.d + ox * nx + oy * ny;
        const lado = dc > 0 ? 1 : -1;
        const limite = C2D.Pista.muroEm(P, c.i, lado);
        const pen = Math.abs(dc) - limite;
        if(pen <= 0) continue;
        /* empurra de volta para dentro */
        const ex = -lado * nx, ey = -lado * ny;          /* normal do muro, apontando para a pista */
        c.x += ex * pen; c.y += ey * pen; c.d -= lado * pen;
        /* impulso no canto: o carro quica pouco e gira */
        const vxw = c.vx * cs - c.vy * sn, vyw = c.vx * sn + c.vy * cs;
        const pvx = vxw - c.r * oy, pvy = vyw + c.r * ox;
        const vn = pvx * ex + pvy * ey;
        if(vn >= 0) continue;
        const rxn = ox * ey - oy * ex;
        const e = .25, J = -(1 + e) * vn / (1 / sp.m + rxn * rxn / sp.Iz);
        /* atrito no muro: raspa e perde velocidade */
        const tx = -ey, ty = ex, vt = pvx * tx + pvy * ty;
        const rxt = ox * ty - oy * tx;
        const Jt = lim(-vt / (1 / sp.m + rxt * rxt / sp.Iz), -J * .35, J * .35);
        const nvx = vxw + (J * ex + Jt * tx) / sp.m, nvy = vyw + (J * ey + Jt * ty) / sp.m;
        c.r += (rxn * J + rxt * Jt) / sp.Iz;
        c.vx = nvx * cs + nvy * sn; c.vy = -nvx * sn + nvy * cs;
        /* o impacto não passa da velocidade do carro (o giro no canto não soma energia que não existe) */
        const imp = Math.min(-vn, c.v * 1.05 + 1);
        c.batida = Math.max(c.batida, imp);
        /* o dano vai para as peças daquele canto (dano2d.js); a força entra pelo muro */
        if(!(imp > 2 && C2D.Dano && C2D.Dano.anotar(c, lx, ly, imp, ex * cs + ey * sn, -ex * sn + ey * cs)))
          if(imp > 4) c.dano = Math.min(1, c.dano + (imp - 4) * .012 * (c.danoMult || 1));
      }
    },

    /* ── toques entre carros ──
       Cada carro é um retângulo. Separação pelo eixo de menor sobreposição (SAT), impulso
       no canto que entrou, atrito entre as carrocerias e dano pela velocidade do impacto.
       Devolve os toques fortes deste passo: [{ a, b, v }] */
    colisoes(lista){
      const toques = [];
      const nC = lista.length;
      for(let p = 0; p < nC; p++){
        const A = lista[p]; if(A.fantasma) continue;
        for(let q = p + 1; q < nC; q++){
          const B = lista[q]; if(B.fantasma) continue;
          const dx = B.x - A.x, dy = B.y - A.y, lim2 = (A.sp.comp + B.sp.comp) * .55;
          if(dx * dx + dy * dy > lim2 * lim2) continue;
          const r = C2D.Carro.contato(A, B, dx, dy);
          if(r) toques.push(r);
        }
      }
      return toques;
    },
    contato(A, B, dx, dy){
      const ca = Math.cos(A.psi), sa = Math.sin(A.psi), cb = Math.cos(B.psi), sb = Math.sin(B.psi);
      const ha = [A.sp.comp / 2, A.sp.larg / 2], hb = [B.sp.comp / 2, B.sp.larg / 2];
      const eixos = [[ca, sa], [-sa, ca], [cb, sb], [-sb, cb]];
      let menor = Infinity, nx = 0, ny = 0, qual = 0;
      for(let k = 0; k < 4; k++){
        const [ex, ey] = eixos[k];
        const rA = ha[0] * Math.abs(ca * ex + sa * ey) + ha[1] * Math.abs(-sa * ex + ca * ey);
        const rB = hb[0] * Math.abs(cb * ex + sb * ey) + hb[1] * Math.abs(-sb * ex + cb * ey);
        const d = dx * ex + dy * ey, sob = rA + rB - Math.abs(d);
        if(sob <= 0) return null;
        if(sob < menor){ menor = sob; const s = d >= 0 ? 1 : -1; nx = ex * s; ny = ey * s; qual = k; }
      }
      /* o ponto de contato: o canto do outro carro mais enfiado neste */
      const canto = (C, c, s, h, dir) => {
        let melhor = null, bp = Infinity;
        for(const [lx, ly] of [[h[0], h[1]], [h[0], -h[1]], [-h[0], h[1]], [-h[0], -h[1]]]){
          const px = C.x + lx * c - ly * s, py = C.y + lx * s + ly * c, pr = (px * nx + py * ny) * dir;
          if(pr < bp){ bp = pr; melhor = [px, py]; }
        }
        return melhor;
      };
      const pt = qual < 2 ? canto(B, cb, sb, hb, 1) : canto(A, ca, sa, ha, -1);
      /* separa, dividindo pela massa */
      const mA = A.sp.m, mB = B.sp.m, tot = mA + mB;
      A.x -= nx * menor * mB / tot; A.y -= ny * menor * mB / tot;
      B.x += nx * menor * mA / tot; B.y += ny * menor * mA / tot;
      /* velocidades no mundo e no ponto */
      const vAx = A.vx * ca - A.vy * sa, vAy = A.vx * sa + A.vy * ca;
      const vBx = B.vx * cb - B.vy * sb, vBy = B.vx * sb + B.vy * cb;
      const rAx = pt[0] - A.x, rAy = pt[1] - A.y, rBx = pt[0] - B.x, rBy = pt[1] - B.y;
      const pAx = vAx - A.r * rAy, pAy = vAy + A.r * rAx, pBx = vBx - B.r * rBy, pBy = vBy + B.r * rBx;
      const rvx = pBx - pAx, rvy = pBy - pAy, vn = rvx * nx + rvy * ny;
      if(vn >= 0) return null;
      const IA = A.sp.Iz, IB = B.sp.Iz;
      const rAn = rAx * ny - rAy * nx, rBn = rBx * ny - rBy * nx;
      const e = .15, J = -(1 + e) * vn / (1 / mA + 1 / mB + rAn * rAn / IA + rBn * rBn / IB);
      const tx = -ny, ty = nx, vt = rvx * tx + rvy * ty;
      const rAt = rAx * ty - rAy * tx, rBt = rBx * ty - rBy * tx;
      const Jt = lim(-vt / (1 / mA + 1 / mB + rAt * rAt / IA + rBt * rBt / IB), -J * .15, J * .15);
      const ix = J * nx + Jt * tx, iy = J * ny + Jt * ty;
      const nAx = vAx - ix / mA, nAy = vAy - iy / mA, nBx = vBx + ix / mB, nBy = vBy + iy / mB;
      /* o giro do toque é amortecido: carroceria, suspensão e pneu absorvem parte (um toque
         leve de traseira não roda o carro como roda uma caixa de sapato) */
      const giro = .5;
      A.r -= (rAn * J + rAt * Jt) / IA * giro; B.r += (rBn * J + rBt * Jt) / IB * giro;
      A.vx = nAx * ca + nAy * sa; A.vy = -nAx * sa + nAy * ca;
      B.vx = nBx * cb + nBy * sb; B.vy = -nBx * sb + nBy * cb;
      /* a energia do toque: no máximo a velocidade de um carro em relação ao outro */
      const imp = Math.min(-vn, Math.hypot(vBx - vAx, vBy - vAy) * 1.15 + 1.5);
      /* o ponto do toque em cada carro e a direção da força (A é empurrado contra n, B a favor) */
      const loc = (C, c, s, x, y) => [(x - C.x) * c + (y - C.y) * s, -(x - C.x) * s + (y - C.y) * c];
      const [aX, aY] = loc(A, ca, sa, pt[0], pt[1]), [bX, bY] = loc(B, cb, sb, pt[0], pt[1]);
      const okA = imp > 2 && C2D.Dano && C2D.Dano.anotar(A, aX, aY, imp, -(nx * ca + ny * sa), -(-nx * sa + ny * ca));
      const okB = imp > 2 && C2D.Dano && C2D.Dano.anotar(B, bX, bY, imp, nx * cb + ny * sb, -nx * sb + ny * cb);
      if(imp > 3){ const dn = (imp - 3) * .015; if(!okA && !A.partes) A.dano = Math.min(1, A.dano + dn * (A.danoMult || 1)); if(!okB && !B.partes) B.dano = Math.min(1, B.dano + dn * (B.danoMult || 1)); }
      A.toque = Math.max(A.toque || 0, imp); B.toque = Math.max(B.toque || 0, imp);
      return imp > 1.5 ? { a: A.id, b: B.id, v: imp } : null;
    },

    /* marcha e giro para o mostrador e o som (câmbio automático) */
    motor(c){
      const sp = c.sp, v = Math.max(0, c.vx);
      if(sp.marchas <= 1 || !sp.rpm){ c.marcha = sp.marchas <= 1 && sp.rpm ? 1 : 0; c.rpm = sp.rpm ? sp.rpm * (.25 + .75 * Math.min(1, v / sp.vmax)) : 0; return; }
      let g = c.marcha || 1;
      while(g < sp.marchas && v > sp.vMarcha[g - 1] * .97) g++;
      while(g > 1 && v < sp.vMarcha[g - 2] * .78) g--;
      c.marcha = g;
      const base = g > 1 ? sp.vMarcha[g - 2] * .5 : 0;
      c.rpm = sp.rpm * lim(.32 + .68 * (v - base * 0) / sp.vMarcha[g - 1], .3, 1);
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
