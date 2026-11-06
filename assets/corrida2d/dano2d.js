/* Corrida 2D: o dano por peça e os destroços.
   Cada carro tem as peças do tipo dele: o fórmula tem asa dianteira (ou o bico, nos antigos),
   asa traseira, a carenagem e as quatro rodas com a suspensão; o carro fechado tem para-choque
   dianteiro (com o splitter), traseiro (com o difusor), as laterais, a asa (quando tem) e as
   rodas; o kart tem a carenagem do bico, o para-choque de trás e as rodas.
   A batida acerta as peças do canto que bateu, com força pela velocidade do impacto e pela
   direção (de frente quebra asa e bico; de lado, roda e suspensão). Peça que chega a zero
   se solta e vira destroço: voa, quica, gira, para no muro ou na brita, e quem passa por cima
   empurra o destroço e pode furar o pneu ou quebrar a asa. Destroço grande parado na pista
   chama o safety car (ou o virtual), como a direção de prova faz; os fiscais tiram depois.
   O que falta no carro muda o carro: sem asa dianteira ele sai de frente, sem a traseira
   a traseira solta (e anda mais na reta), suspensão torta puxa para um lado, pneu furado
   e roda arrancada acabam com a corrida. No box a equipe troca bico, asa e para-choque. */
(function(raiz){
  const C2D = raiz.C2D;

  /* cada peça: limite (m/s de impacto que ela aguenta sem nada), força do dano, zona do carro */
  const PECA = {
    asaD:      { lim: 2.8, k: .075, zona: 'F', nome: 'Asa dianteira' },
    bico:      { lim: 3.0, k: .06,  zona: 'F', nome: 'Bico' },
    paraF:     { lim: 3.4, k: .045, zona: 'F', nome: 'Para-choque dianteiro' },
    asaT:      { lim: 3.0, k: .06,  zona: 'T', nome: 'Asa traseira' },
    paraT:     { lim: 3.4, k: .045, zona: 'T', nome: 'Para-choque traseiro' },
    carenagem: { lim: 4.5, k: .035, zona: 'L', nome: 'Carenagem' },
    latE:      { lim: 4.0, k: .04,  zona: 'L', lado: 1, nome: 'Lateral esquerda' },
    latD:      { lim: 4.0, k: .04,  zona: 'L', lado: -1, nome: 'Lateral direita' },
    FE:        { lim: 6, k: .04,  roda: 1, eixo: 1, lado: 1, nome: 'Roda dianteira esquerda' },
    FD:        { lim: 6, k: .04,  roda: 1, eixo: 1, lado: -1, nome: 'Roda dianteira direita' },
    TE:        { lim: 6, k: .04,  roda: 1, eixo: -1, lado: 1, nome: 'Roda traseira esquerda' },
    TD:        { lim: 6, k: .04,  roda: 1, eixo: -1, lado: -1, nome: 'Roda traseira direita' }
  };
  const RODAS = ['FE', 'FD', 'TE', 'TD'];
  /* o tempo que a equipe leva para trocar cada peça no box (s) */
  const REPARO = { asaD: 7.5, bico: 8, paraF: 6, asaT: 22, paraT: 6, carenagem: 9, latE: 4, latD: 4 };

  /* o tipo do carro pelo desenho dele (o catálogo de estilos2d.js) e se ele tem asas */
  function tipoDe(est){
    const E = C2D.Estilos && C2D.Estilos.DEF[est], FORM = C2D.Arte && C2D.Arte.FORM;
    if(est === 'kart' || (E && E.f === 'kartE')) return { fam: 'kart', asaD: false, asaT: false };
    let base = null;
    if(E && E.f === 'formula') base = Object.assign({}, FORM && FORM[E.base] || {}, E.over || {});
    else if(!E && FORM && FORM[est]) base = FORM[est];
    if(base) return { fam: 'aberto', asaD: !!base.asaD, asaT: !!base.asaT };
    if(E && E.f === 'frente') return { fam: 'aberto', asaD: false, asaT: false };
    if(E && E.f === 'sprint') return { fam: 'aberto', asaD: !!E.p.asa, asaT: !!E.p.asa };
    const p = E && E.p || {};
    let asaT = true;
    if(E && E.f === 'carroceria') asaT = p.asa === 'asa' || p.asa === 'alta' || p.asa === 'gt500';
    else if(E && E.f === 'antigo') asaT = false;
    else if(E && E.f === 'modificado') asaT = false;
    else if(E && E.f === 'prototipo') asaT = p.asa !== 'nenhuma' && p.asa !== 'cauda';
    else if(!E) asaT = est !== 'nascar' && est !== 'stock';
    return { fam: 'fechado', asaD: false, asaT };
  }

  const nova = () => ({ h: 1, solta: false });

  C2D.Dano = {
    PECA, REPARO, tipoDe,
    /* as peças do carro (no Carro.criar) */
    preparar(c){
      const t = tipoDe(c.sp.estilo);
      const lista = t.fam === 'aberto' ? [t.asaD ? 'asaD' : 'bico', 'carenagem'].concat(t.asaT ? ['asaT'] : [])
        : t.fam === 'kart' ? ['bico', 'paraT'] : ['paraF', 'paraT', 'latE', 'latD'].concat(t.asaT ? ['asaT'] : []);
      c.partes = {}; lista.concat(RODAS).forEach(k => c.partes[k] = nova());
      c.fam = t.fam; c.impactos = []; c.marcasDano = []; c.mascara = ''; c.furo = null; c.destruido = false;
      C2D.Dano.recalcular(c);
    },

    /* guarda um impacto no carro (lx, ly: ponto no carro; nlx, nly: direção da força, no carro) */
    anotar(c, lx, ly, imp, nlx, nly){
      if(!c.partes) return false;
      const l = c.impactos;
      if(l.length < 8) l.push({ lx, ly, imp, nlx, nly });
      else { let m = 0; for(let q = 1; q < l.length; q++) if(l[q].imp < l[m].imp) m = q; if(l[m].imp < imp) l[m] = { lx, ly, imp, nlx, nly }; }
      return true;
    },

    /* depois dos toques do passo: o dano de cada impacto guardado */
    processar(S, dt){
      for(const c of S.carros){
        if(c.impactos && c.impactos.length){ for(const m of c.impactos) C2D.Dano.impacto(S, c, m.lx, m.ly, m.imp, m.nlx, m.nly); c.impactos.length = 0; }
      }
      C2D.Dano.detritos(S, dt);
    },

    impacto(S, c, lx, ly, imp, nlx, nly){
      const P = c.partes; if(!P) return;
      const sp = c.sp, hl = sp.comp / 2, hw = sp.larg / 2;
      const u = Math.max(-1, Math.min(1, lx / hl)), w = Math.max(-1, Math.min(1, ly / hw));
      const fx = Math.abs(nlx), fy = Math.abs(nly);
      const suave = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
      const zF = suave(.3, .9, u), zT = suave(.3, .9, -u);
      /* carro fechado: rodas por dentro da carroceria, para-choque feito para encostar */
      const fech = c.fam === 'fechado', kart = c.fam === 'kart';
      const mult = (c.danoMult || 1);
      const rnd = C2D.rng(C2D.semente('dano:' + c.id + ':' + Math.round(S.t * 120) + ':' + Math.round(imp * 10)));
      let total = 0, ultimo = null;
      for(const k in P){
        const pe = P[k], d = PECA[k]; if(pe.solta) continue;
        let peso;
        if(d.roda){
          const wx = d.eixo > 0 ? sp.a : -sp.b, wy = d.lado * (hw - .25);
          const dist = Math.hypot(lx - wx, ly - wy);
          peso = Math.max(0, 1 - dist / (fech ? .9 : 1.15)) * (.35 + .65 * fy);
          if(!fech && (d.eixo > 0 ? zF : zT) > .5 && Math.sign(ly) === d.lado) peso = Math.max(peso, .5 * (.3 + .7 * fx));
        } else if(d.zona === 'F') peso = zF * (.35 + .65 * fx);
        else if(d.zona === 'T') peso = zT * (.35 + .65 * fx);
        else if(d.lado) peso = (Math.sign(w) === d.lado ? suave(.4, .95, Math.abs(w)) : 0) * (1 - Math.max(zF, zT) * .6) * (.4 + .6 * fy);
        else peso = (1 - Math.max(zF, zT)) * .6 * (.3 + .7 * fy);
        if(peso <= .02) continue;
        const lim = d.lim + (fech ? (d.roda ? 3 : 1.6) : 0) + (kart ? 1.5 : 0);
        if(imp <= lim) continue;
        const dn = peso * d.k * Math.pow(imp - lim, 1.3) * mult;
        if(dn < .004) continue;
        pe.h = Math.max(0, pe.h - dn); total += dn; ultimo = k;
        /* pancada na roda pode furar o pneu */
        if(d.roda && dn > .25 && !c.furo && rnd() < .2){ c.furo = k; C2D.Dano.avisar(S, c, 'furo', k); }
        /* chapa de carroceria (e a carenagem) amassa: só arranca numa pancada forte */
        const chapa = (fech && !d.roda && k !== 'asaT') || k === 'carenagem';
        if(pe.h <= 0 && chapa && imp < 11) pe.h = .04;
        else if(pe.h <= 0) C2D.Dano.soltar(S, c, k, lx, ly, nlx, nly, imp, rnd);
      }
      if(total > 0){
        /* a marca no carro e as lascas que voam do ponto da batida */
        const mk = c.marcasDano;
        if(mk.length < 8) mk.push({ lx, ly, r: Math.min(.65, .14 + total * .9 + imp * .02), s: rnd() });
        else { const q = Math.floor(rnd() * mk.length); mk[q].r = Math.min(.7, mk[q].r + .05); }
        const n = Math.min(5, Math.round(total * 8 + rnd() * .8));
        for(let q = 0; q < n; q++) C2D.Dano.lascar(S, c, lx, ly, nlx, nly, imp, rnd);
        if(ultimo && P[ultimo] && !P[ultimo].solta && P[ultimo].h < .55 && !P[ultimo].avisou){ P[ultimo].avisou = true; C2D.Dano.avisar(S, c, 'dano', ultimo); }
        C2D.Dano.recalcular(c);
      }
    },

    /* a peça se solta e vira destroço */
    soltar(S, c, k, lx, ly, nlx, nly, imp, rnd){
      const pe = c.partes[k]; if(!pe || pe.solta) return;
      pe.solta = true; pe.h = 0;
      const sp = c.sp, d = PECA[k];
      /* onde a peça fica no carro */
      let px = lx, py = ly, L = .5, W = .3, tipo = 'painel';
      if(k === 'asaD'){ px = sp.comp / 2 - .2; py = 0; L = sp.larg * .92; W = .36; tipo = 'asa'; }
      else if(k === 'asaT'){ px = -sp.comp / 2 + .25; py = 0; L = Math.min(1.1, sp.larg * .55); W = .42; tipo = 'asa'; }
      else if(k === 'bico'){ px = sp.comp / 2 - .35; py = 0; L = .8; W = .32; }
      else if(k === 'paraF'){ px = sp.comp / 2 - .15; py = 0; L = sp.larg * .85; W = .32; }
      else if(k === 'paraT'){ px = -sp.comp / 2 + .15; py = 0; L = sp.larg * .8; W = .3; }
      else if(k === 'carenagem'){ px = -sp.comp * .15; py = 0; L = 1.2; W = .55; }
      else if(k === 'latE' || k === 'latD'){ px = 0; py = d.lado * (sp.larg / 2 - .1); L = Math.min(2, sp.comp * .38); W = .26; }
      else if(d.roda){ px = d.eixo > 0 ? sp.a : -sp.b; py = d.lado * (sp.larg / 2 - .25); L = c.fam === 'kart' ? .3 : .66; W = c.fam === 'kart' ? .22 : .36; tipo = 'roda'; }
      if(tipo === 'asa' && L < .5) L = .5;
      const cs = Math.cos(c.psi), sn = Math.sin(c.psi);
      const vxw = c.vx * cs - c.vy * sn, vyw = c.vx * sn + c.vy * cs;
      /* a velocidade do ponto do carro, mais o empurrão da batida e um pouco de acaso */
      const fxw = nlx * cs - nly * sn, fyw = nlx * sn + nly * cs;
      const kick = 1.5 + imp * (.25 + rnd() * .3);
      const fr = tipo === 'roda' ? .9 : .55 + rnd() * .3;
      const pc = {
        x: c.x + px * cs - py * sn, y: c.y + px * sn + py * cs,
        vx: vxw * fr + fxw * kick + (rnd() - .5) * 3, vy: vyw * fr + fyw * kick + (rnd() - .5) * 3,
        a: c.psi + (rnd() - .5) * .4, w: (rnd() - .5) * (tipo === 'roda' ? 14 : 18),
        z: .3, vz: (tipo === 'roda' ? 2.5 : 1.2) + rnd() * (tipo === 'roda' ? 4 : 2.5) + imp * .05,
        tipo, L, W, cor: c.cor, cor2: c.cor2 || '#ffffff', grande: true, t: 0, i: c.i, d: c.d, dono: c.id, parte: k, sem: rnd(),
        /* a asa e o para-choque ficam atravessados (a envergadura no lado do carro) */
        ao: k === 'asaD' || k === 'asaT' || k === 'paraF' || k === 'paraT' ? 'y' : 'x'
      };
      C2D.Dano.novoDetrito(S, pc);
      c.mascara = Object.keys(c.partes).filter(q => c.partes[q].solta).sort().join(',');
      if(d.roda){ c.destruido = true; C2D.Dano.avisar(S, c, 'roda', k); }
      else C2D.Dano.avisar(S, c, 'solta', k);
      S.eventos.push({ t: S.t, tipo: 'peca', a: c.id, parte: k });
    },

    lascar(S, c, lx, ly, nlx, nly, imp, rnd){
      const cs = Math.cos(c.psi), sn = Math.sin(c.psi);
      const vxw = c.vx * cs - c.vy * sn, vyw = c.vx * sn + c.vy * cs;
      const fxw = nlx * cs - nly * sn, fyw = nlx * sn + nly * cs;
      const k = 1 + imp * (.15 + rnd() * .35);
      C2D.Dano.novoDetrito(S, {
        x: c.x + lx * cs - ly * sn, y: c.y + lx * sn + ly * cs,
        vx: vxw * (.5 + rnd() * .4) + fxw * k + (rnd() - .5) * 5, vy: vyw * (.5 + rnd() * .4) + fyw * k + (rnd() - .5) * 5,
        a: rnd() * 6.3, w: (rnd() - .5) * 30, z: .3, vz: 1 + rnd() * 3,
        tipo: 'lasca', L: .12 + rnd() * .3, W: .08 + rnd() * .16, cor: rnd() < .55 ? '#16181b' : c.cor, cor2: c.cor2 || '#fff', grande: false, t: 0, i: c.i, d: c.d, dono: c.id, sem: rnd()
      });
    },

    novoDetrito(S, pc){
      const l = S.detritos = S.detritos || [];
      if(l.length >= 100){ const q = l.findIndex(x => !x.grande); l.splice(q >= 0 ? q : 0, 1); }
      l.push(pc);
    },

    /* a física dos destroços: voo, quique, giro, atrito no chão, muro, e os carros passando */
    detritos(S, dt){
      const l = S.detritos; if(!l || !l.length) return;
      const P = S.P;
      for(let q = l.length - 1; q >= 0; q--){
        const p = l[q];
        p.t += dt;
        /* os fiscais: lasca some com o tempo; peça grande sai quando a direção de prova neutraliza, ou depois */
        if(!p.grande && p.t > 32){ l.splice(q, 1); continue; }
        if(p.grande && p.t > 95){ l.splice(q, 1); continue; }
        if(p.grande){
          if(p.parado != null && (S.sc || S.vsc) && p.t - p.parado > 9){ l.splice(q, 1); continue; }
          if(p.parado != null && p.t - p.parado > (p.naPista ? 40 : 75)){ l.splice(q, 1); continue; }
        }
        const v = Math.hypot(p.vx, p.vy);
        if(v < .05 && p.z <= 0 && Math.abs(p.w) < .05 && !p.mexeu){ if(p.parado == null) C2D.Dano.parou(S, p); continue; }
        p.mexeu = false;
        /* no ar */
        if(p.z > 0 || p.vz > 0){
          p.vz -= 9.81 * dt; p.z += p.vz * dt;
          if(p.z <= 0){
            p.z = 0;
            if(p.vz < -1.2){ p.vz = -p.vz * (p.tipo === 'roda' ? .45 : .25); p.w *= .8; const f = p.tipo === 'roda' ? .9 : .75; p.vx *= f; p.vy *= f; }
            else p.vz = 0;
          }
        }
        /* no chão: atrito pelo piso e pela peça (a roda rola longe; o painel arrasta) */
        if(p.z <= 0){
          const piso = C2D.Pista.piso(P, p.i, p.st || 0, p.d);
          const solo = piso === C2D.PISO.BRITA ? 3 : piso === C2D.PISO.GRAMA ? 1.7 : 1;
          const mu = (p.tipo === 'roda' ? .14 : p.tipo === 'asa' ? .55 : p.tipo === 'lasca' ? .7 : .5) * solo;
          const dv = mu * 9.81 * dt;
          if(v > dv){ p.vx -= p.vx / v * dv; p.vy -= p.vy / v * dv; } else { p.vx = 0; p.vy = 0; }
          p.w *= Math.max(0, 1 - dt * (p.tipo === 'roda' ? .8 : 3) * solo);
        }
        p.x += p.vx * dt; p.y += p.vy * dt; p.a += p.w * dt;
        /* onde está na pista e o muro */
        const pr = C2D.Pista.projetar(P, p.x, p.y, p.i);
        p.i = pr.i; p.d = pr.d; p.st = pr.s;
        const lado = p.d >= 0 ? 1 : -1, limite = C2D.Pista.muroEm(P, p.i, lado) - p.W / 2;
        if(Math.abs(p.d) > limite){
          const nx = P.nx[p.i] * lado, ny = P.ny[p.i] * lado, pen = Math.abs(p.d) - limite;
          p.x -= nx * pen; p.y -= ny * pen; p.d -= lado * pen;
          const vn = p.vx * nx + p.vy * ny;
          if(vn > 0){ p.vx -= (1 + .3) * vn * nx; p.vy -= (1 + .3) * vn * ny; p.vx *= .7; p.vy *= .7; p.w = -p.w * .6 + (vn * .8) * (p.sem > .5 ? 1 : -1); }
        }
      }
      /* os carros passando por cima (ou batendo no destroço) */
      for(const c of S.carros){
        if(c.fantasma || c.v < 3) continue;
        const cs = Math.cos(c.psi), sn = Math.sin(c.psi), hl = c.sp.comp / 2, hw = c.sp.larg / 2;
        for(const p of l){
          if(p.z > .45) continue;
          const dx = p.x - c.x, dy = p.y - c.y;
          if(dx * dx + dy * dy > (hl + 1.2) * (hl + 1.2)) continue;
          const lx = dx * cs + dy * sn, ly = -dx * sn + dy * cs, r = Math.max(p.L, p.W) / 2;
          if(Math.abs(lx) > hl + r * .6 || Math.abs(ly) > hw + r * .6) continue;
          if(p.ultCarro === c && S.t - p.ultT < .5) continue;
          p.ultCarro = c; p.ultT = S.t;
          const vxw = c.vx * cs - c.vy * sn, vyw = c.vx * sn + c.vy * cs;
          const rel = Math.hypot(vxw - p.vx, vyw - p.vy);
          const rnd = C2D.rng(C2D.semente('det:' + c.id + ':' + Math.round(S.t * 60) + ':' + Math.round(p.sem * 1e6)));
          /* o destroço é chutado para a frente e para o lado, e salta */
          const ox = dx / (Math.hypot(dx, dy) || 1), oy = dy / (Math.hypot(dx, dy) || 1);
          const pesado = p.tipo === 'roda' ? .7 : p.grande ? .85 : 1;
          p.vx = vxw * (.75 + rnd() * .35) * pesado + ox * (2 + rnd() * 3); p.vy = vyw * (.75 + rnd() * .35) * pesado + oy * (2 + rnd() * 3);
          p.vz = Math.max(p.vz, (p.grande ? 1.2 : 2) + rel * (.03 + rnd() * .05)); p.z = Math.max(p.z, .05);
          p.w += (rnd() - .5) * 25; p.parado = null; p.mexeu = true;
          /* o carro: peça grande na frente quebra asa ou bico; lasca de carbono fura pneu */
          if(p.grande && rel > 7 && lx > 0) C2D.Dano.impacto(S, c, hl, ly, rel * (p.tipo === 'roda' ? .3 : .2), 1, 0);
          if(!c.furo && rel > 15 && rnd() < (p.tipo === 'lasca' ? .035 : p.tipo === 'asa' ? .07 : .02)){
            const k = (lx > 0 ? 'F' : 'T') + (ly > 0 ? 'E' : 'D');
            if(c.partes && c.partes[k] && !c.partes[k].solta){ c.furo = k; C2D.Dano.recalcular(c); C2D.Dano.avisar(S, c, 'furo', k); }
          }
        }
      }
    },

    /* destroço grande parado na pista: a direção de prova neutraliza (como num acidente) */
    parou(S, p){
      p.parado = p.t;
      p.naPista = Math.abs(p.d) < S.P.meia + .5;
      if(p.grande && p.naPista && !p.chamou && S.regras && C2D.Boxes && S.tipo === 'corrida'){
        p.chamou = true;
        const fake = { id: p.dono + ':det' + Math.round(p.sem * 1e4), d: p.d };
        C2D.Boxes.incidente(S, fake);
      }
    },

    /* o que o dano faz no carro: fatores para a física e o dano geral (box e abandono) */
    recalcular(c){
      const P = c.partes; if(!P) return;
      const h = k => P[k] ? (P[k].solta ? 0 : P[k].h) : 1, solta = k => !!(P[k] && P[k].solta);
      let aF = 1, aR = 1, drag = 1, pot = 1;
      if(P.asaD) aF *= solta('asaD') ? .3 : .55 + .45 * h('asaD');
      if(P.bico) aF *= .8 + .2 * h('bico');
      if(P.paraF) aF *= solta('paraF') ? .72 : .8 + .2 * h('paraF');
      if(P.asaT){ aR *= solta('asaT') ? .4 : .6 + .4 * h('asaT'); drag *= solta('asaT') ? .9 : 1; }
      if(P.paraT) aR *= solta('paraT') ? .82 : .88 + .12 * h('paraT');
      for(const k of ['latE', 'latD', 'paraF', 'paraT', 'carenagem', 'bico']) if(P[k]) drag *= 1 + .05 * (1 - h(k));
      if(P.carenagem) pot *= solta('carenagem') ? .82 : .85 + .15 * h('carenagem');
      /* rodas e suspensão: aderência do eixo, freio, puxada para um lado */
      const eixo = (a, b) => {
        let f = 1 - .32 * (2 - h(a) - h(b)) / 2;
        if(solta(a) || solta(b)) f *= .4;
        if(c.furo === a || c.furo === b) f *= .62;
        return f;
      };
      const muF = eixo('FE', 'FD'), muR = eixo('TE', 'TD');
      for(const k of RODAS) drag *= 1 + .07 * (1 - h(k)) + (solta(k) ? .5 : 0) + (c.furo === k ? .12 : 0);
      const torto = (h('FD') - h('FE')) * .03 + (h('TD') - h('TE')) * .015 + (c.furo ? (c.furo[1] === 'E' ? .012 : -.012) : 0)
        + (solta('FE') ? .08 : 0) - (solta('FD') ? .08 : 0) + (solta('TE') ? .04 : 0) - (solta('TD') ? .04 : 0);
      c.dm = { aF, aR, muF, muR, drag, pot, puxa: torto, freioF: solta('FE') || solta('FD') ? .5 : 1, freioR: solta('TE') || solta('TD') ? .5 : 1 };
      /* o dano geral, como o motor da corrida e o box entendem */
      const v = [];
      for(const k in P){
        const d = PECA[k], perda = 1 - h(k);
        if(d.roda) v.push(solta(k) ? 1 : perda * .9);
        else if(k === 'asaD' || k === 'bico') v.push(solta(k) ? .5 : perda * .45);
        else if(k === 'asaT') v.push(solta(k) ? .45 : perda * .4);
        else if(k === 'carenagem') v.push(perda * .55);
        else v.push(perda * .25);
      }
      if(c.furo) v.push(.45);
      v.sort((a, b) => b - a);
      c.dano = Math.min(1, (v[0] || 0) + .2 * v.slice(1).reduce((a, b) => a + b, 0));
      c.destruido = RODAS.some(solta) || c.dano >= .85;
    },

    /* o tempo de box para arrumar o que dá, e o conserto */
    tempoReparo(c){
      const P = c.partes; if(!P) return c.dano > .2 ? 6 : 0;
      let t = 0;
      for(const k in REPARO) if(P[k] && (P[k].solta || P[k].h < .7)) t = Math.max(t, REPARO[k]) + (t ? 2 : 0);
      return t;
    },
    reparar(c, tudo){
      const P = c.partes; if(!P){ if(c.dano > .2) c.dano = Math.min(c.dano, .1); return; }
      for(const k in P){
        if(PECA[k].roda){ if(tudo){ P[k] = nova(); } continue; }
        if(P[k].solta || P[k].h < .7 || tudo) P[k] = nova();
      }
      c.furo = null;
      if(tudo) c.marcasDano = [];
      c.mascara = Object.keys(P).filter(q => P[q].solta).sort().join(',');
      C2D.Dano.recalcular(c);
    },

    /* a mensagem para o jogador */
    avisar(S, c, tipo, k){
      if(c !== S.eu) return;
      const txt = tipo === 'furo' ? 'Pneu furado: vá para o box' : tipo === 'roda' ? 'Você perdeu uma roda: carro destruído'
        : tipo === 'solta' ? (k === 'asaD' ? 'Asa dianteira arrancada: o carro sai de frente' : k === 'asaT' ? 'Asa traseira arrancada: a traseira está solta'
          : k === 'bico' ? 'Bico arrancado' : k === 'paraF' ? 'Para-choque dianteiro arrancado' : k === 'paraT' ? 'Para-choque traseiro arrancado' : k === 'carenagem' ? 'Carenagem arrancada: o motor esquenta' : 'Peça da lateral arrancada')
        : PECA[k] && PECA[k].roda ? 'Suspensão danificada: o carro puxa para um lado'
        : k === 'asaD' ? 'Asa dianteira danificada' : k === 'asaT' ? 'Asa traseira danificada' : k === 'bico' ? 'Bico danificado'
        : k === 'carenagem' ? 'Carenagem danificada' : k === 'paraF' || k === 'paraT' ? 'Para-choque danificado' : 'Lateral danificada';
      if(txt) S.avisoDano = { txt, t: S.t };
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
