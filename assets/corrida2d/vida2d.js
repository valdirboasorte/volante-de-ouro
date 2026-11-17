/* Corrida 2D: a vida em volta da pista.
   Um autódromo em dia de corrida tem gente: o público em pé atrás do alambrado nas curvas,
   os mecânicos na porta das garagens com os pneus e os carrinhos de ferramenta, o muro dos
   boxes com as cabines das equipes, o paddock com os caminhões de cada equipe atrás do
   prédio, barracas, o trator e a ambulância ao lado dos postos dos fiscais, as torres das
   câmeras de TV nas freadas e os nomes pintados na grama. No kart, as barraquinhas e as
   vans do paddock. Tudo é montado uma vez por pista (sempre igual para a mesma pista) e
   pintado nos blocos: o que fica no chão no andar 0, os tetos nos andares de cima.
   Só desenho: nada daqui tem colisão nem entra na física. */
(function(raiz){
  const C2D = raiz.C2D;
  const novo = (w, h) => typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(w, h) : Object.assign(document.createElement('canvas'), { width: w, height: h });
  const NOMES = ['VOLANTE DE OURO', 'OURO GP', 'GRANDE PRÊMIO', 'APEX', 'PISTÃO', 'TURBO', 'VELOZ', 'PÓDIO', 'RETA OPOSTA', 'BANDEIRADA'];
  const caixa = (x, y, hd, a, b) => { const c = Math.cos(hd), s = Math.sin(hd); return [[-a, -b], [a, -b], [a, b], [-a, b]].map(([u, w]) => [x + u * c - w * s, y + u * s + w * c]); };

  /* uma pessoa vista de cima: os ombros na cor da camisa, a cabeça e a sombra (24 px por metro) */
  function pessoa(camisa, cabeca){
    const c = novo(24, 24), g = c.getContext('2d');
    g.translate(12, 12);
    g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(2.2, 1.8, 6.2, 4, 0, 0, 6.3); g.fill();
    g.fillStyle = camisa; g.beginPath(); g.ellipse(0, 0, 6.2, 3.7, 0, 0, 6.3); g.fill();
    g.fillStyle = 'rgba(255,255,255,.22)'; g.beginPath(); g.ellipse(-1.6, -1, 3.4, 1.7, 0, 0, 6.3); g.fill();
    g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = .8; g.beginPath(); g.ellipse(0, 0, 6.2, 3.7, 0, 0, 6.3); g.stroke();
    g.fillStyle = cabeca; g.beginPath(); g.arc(0, 0, 2.7, 0, 6.3); g.fill();
    g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.arc(-.8, -.8, 1.2, 0, 6.3); g.fill();
    return c;
  }
  const CABECAS = ['#3a2a1c', '#1c1a18', '#6b4a2a', '#c9a36a', '#e9e4d6', '#b3241a', '#1f4fbf', '#8a8f96'];
  /* o público em pé, espalhado (transparente: o chão aparece entre as pessoas). 160 px = 8 m */
  function texGente(cores){
    const c = novo(160, 160), g = c.getContext('2d'), r = C2D.rng(83), gente = cores.map((cor, k) => pessoa(cor, CABECAS[k % CABECAS.length]));
    for(let k = 0; k < 46; k++){
      const x = r() * 160, y = r() * 160, s = gente[Math.floor(r() * gente.length)], a = r() * 6.3, e = .78 + r() * .2;
      for(const dx of [-160, 0, 160]) for(const dy of [-160, 0, 160]){
        const X = x + dx, Y = y + dy; if(X < -14 || X > 174 || Y < -14 || Y > 174) continue;
        g.save(); g.translate(X, Y); g.rotate(a); g.scale(e, e); g.drawImage(s, -12, -12); g.restore();
      }
    }
    return c;
  }

  /* um veículo de apoio visto de cima, apontando para +x: teto = só a parte de cima (para o andar 1) */
  function veiculo(ctx, tipo, cor, teto){
    const rr = (x, y, w, h, r) => { ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); };
    if(tipo === 'caminhao'){
      /* a carreta de uma equipe: o baú comprido na cor dela, a faixa, e o cavalo na frente */
      if(!teto){ ctx.fillStyle = '#1a1c20'; rr(-8.1, -1.4, 16.2, 2.8, .3); ctx.fill(); return; }
      ctx.fillStyle = cor; rr(-8, -1.3, 12.6, 2.6, .25); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fillRect(-8, .6, 12.6, .7); ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(-8, -1.3, 12.6, .5);
      ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.fillRect(-6.5, -.25, 9.5, .5);
      ctx.fillStyle = '#e9ecef'; rr(5, -1.2, 2.9, 2.4, .35); ctx.fill(); ctx.fillStyle = '#1b222c'; rr(6.6, -1.05, .9, 2.1, .2); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = .1; rr(-8, -1.3, 12.6, 2.6, .25); ctx.stroke(); rr(5, -1.2, 2.9, 2.4, .35); ctx.stroke();
      return;
    }
    const L = tipo === 'van' ? 5 : tipo === 'trator' ? 3.6 : tipo === 'guincho' ? 6.4 : 4.6, W = tipo === 'trator' ? 2 : 2;
    if(!teto){
      ctx.fillStyle = '#131417'; for(const [x, y] of [[L * .3, W * .5], [L * .3, -W * .5], [-L * .3, W * .5], [-L * .3, -W * .5]]){ rr(x - .38, y - .16, .76, .32, .1); ctx.fill(); }
      ctx.fillStyle = '#1a1c20'; rr(-L / 2, -W / 2, L, W, .3); ctx.fill(); return;
    }
    if(tipo === 'trator'){
      ctx.fillStyle = cor; rr(-L / 2, -.75, L * .62, 1.5, .2); ctx.fill();
      ctx.fillStyle = '#2a2d33'; rr(L * .1, -.9, L * .38, 1.8, .25); ctx.fill(); ctx.fillStyle = 'rgba(180,215,235,.6)'; rr(L * .16, -.7, L * .2, 1.4, .15); ctx.fill();
      ctx.fillStyle = '#ffb000'; ctx.beginPath(); ctx.arc(L * .28, 0, .22, 0, 6.3); ctx.fill();
    } else if(tipo === 'guincho'){
      ctx.fillStyle = '#3a3e45'; rr(-L / 2, -.95, L * .66, 1.9, .15); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.lineWidth = .08; ctx.beginPath(); for(let q = 0; q < 5; q++){ ctx.moveTo(-L / 2 + .4 + q * .75, -.85); ctx.lineTo(-L / 2 + .4 + q * .75, .85); } ctx.stroke();
      ctx.fillStyle = cor; rr(L * .16, -1, L * .34, 2, .3); ctx.fill(); ctx.fillStyle = '#1b222c'; rr(L * .34, -.85, .7, 1.7, .15); ctx.fill();
      ctx.fillStyle = '#ffb000'; ctx.fillRect(L * .2, -.5, .3, 1);
    } else {
      /* van, ambulância ou carro de serviço */
      ctx.fillStyle = cor; rr(-L / 2, -W / 2 + .05, L, W - .1, .35); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.2)'; rr(-L / 2 + .2, .25, L - .4, .5, .2); ctx.fill();
      ctx.fillStyle = '#1b222c'; rr(L * .22, -W / 2 + .2, L * .16, W - .4, .15); ctx.fill();
      if(tipo === 'ambulancia'){ ctx.fillStyle = '#d6311f'; ctx.fillRect(-.9, -.22, 1.4, .44); ctx.fillRect(-.42, -.7, .44, 1.4); ctx.fillStyle = '#3d8ef7'; ctx.fillRect(L * .12, -.55, .25, 1.1); }
      else if(tipo === 'van'){ ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(-L / 2 + .3, -.12, L * .55, .24); }
    }
    ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = .08; rr(-L / 2, -W / 2 + .05, L, W - .1, .3); ctx.stroke();
  }
  const MEIA = { caminhao: [8.1, 1.4], van: [2.5, 1], trator: [1.8, 1], guincho: [3.2, 1], ambulancia: [2.3, 1], carro: [2.3, 1] };

  C2D.Vida = {
    texturas(T, tm){
      T.gente = texGente(tm.publico);
      const cache = new Map();
      T.pessoa = cor => { let s = cache.get(cor); if(!s){ s = pessoa(cor, CABECAS[cache.size % CABECAS.length]); cache.set(cor, s); } return s; };
    },

    montar(P, cen, aj){
      if(typeof Path2D === 'undefined') return;
      const tm = cen.tema, n = P.n, m = P.meia, L = P.L, ds = P.ds, B = P.box, rnd = C2D.rng(C2D.semente('vida:' + P.id));
      const np = P.pedacos.length, md = i => ((i % n) + n) % n, idx = s => Math.floor(((s % L) + L) % L / ds) % n, pedDe = i => Math.min(np - 1, Math.floor(md(i) / 24));
      const escDe = (i, lado) => (lado > 0 ? P.escE : P.escD)[md(i)];
      const pt = (s, d) => C2D.Pista.ponto(P, s, d);
      const cada = () => P.pedacos.map(() => []);
      const V = cen.vida = { publico: [], gente: cada(), barracas: cada(), veic: cada(), torres: cada(), cabines: cada(), logos: [] };
      const A = cen.amb, tomado = (x, y) => !!(A && A.tomado && A.tomado(x, y));
      const dentroDe = (pts, x, y) => { let d = false; for(let i = 0, j = pts.length - 1; i < pts.length; j = i++){ const a = pts[i], b = pts[j]; if((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) d = !d; } return d; };
      const perto = (pts, x, y, f) => dentroDe(pts, x, y) || dentroDe(pts, x + f, y) || dentroDe(pts, x - f, y) || dentroDe(pts, x, y + f) || dentroDe(pts, x, y - f);
      const emArq = (x, y) => cen.arquib.some(a => x > a.x0 - 3 && x < a.x1 + 3 && y > a.y0 - 3 && y < a.y1 + 3 && perto(a.pts, x, y, 2.5));
      const Bx = cen.boxes, emBox = (x, y) => !!Bx && x > Bx.x0 - 3 && x < Bx.x1 + 3 && y > Bx.y0 - 3 && y < Bx.y1 + 3 && perto(Bx.pts, x, y, 2.5);
      const emPredio = (x, y, i) => { for(let q = -1; q <= 1; q++) for(const b of cen.porPedaco[pedDe(i + q * 24)].predios) if(Math.hypot(b.x - x, b.y - y) < b.raioG + 1) return true; return false; };
      const ocup = [];
      const livre = (x, y, folga, i) => aj.livre(x, y, folga) && !tomado(x, y) && !emArq(x, y) && !emBox(x, y) && !(P.tipo === 'street' && emPredio(x, y, i)) && !ocup.some(o => Math.hypot(o.x - x, o.y - y) < o.r + folga);
      const rua = P.tipo === 'street', kart = P.kart, antiga = tm.era === 'antiga';
      const zonas = (P.zonas || []).filter(z => z.q > .28).slice().sort((a, b) => b.q - a.q);

      /* ── o público em pé atrás do alambrado: por fora das freadas (antes da arquibancada), e na reta das pistas antigas ── */
      const faixa = (s0, s1, lado, dA, dB) => {
        const dent = [], fora = [];
        for(let s = s0; s <= s1 + .01; s += 4){
          const i = idx(s); if(aj.naBox(i, lado)) return null;
          const base = m + escDe(i, lado), a = pt(s, lado * (base + dA)), b = pt(s, lado * (base + dB));
          if(!livre((a.x + b.x) / 2, (a.y + b.y) / 2, 1, i) || !livre(b.x, b.y, .5, i)) return null;
          dent.push(a); fora.push(b);
        }
        if(dent.length < 3) return null;
        const p = new Path2D(); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
        dent.forEach((q, k) => k ? p.lineTo(q.x, q.y) : p.moveTo(q.x, q.y)); for(let k = fora.length - 1; k >= 0; k--) p.lineTo(fora[k].x, fora[k].y); p.closePath();
        dent.concat(fora).forEach(q => { x0 = Math.min(x0, q.x); y0 = Math.min(y0, q.y); x1 = Math.max(x1, q.x); y1 = Math.max(y1, q.y); });
        dent.forEach((q, k) => ocup.push({ x: (q.x + fora[k].x) / 2, y: (q.y + fora[k].y) / 2, r: (dB - dA) / 2 + 1 }));
        return { p, x0, y0, x1, y1, dent, fora };
      };
      if(!kart && !tm.semArq){
        const prof = rua ? 2.6 : 6;
        for(const z of zonas.slice(0, rua ? 10 : 8)){
          const s0 = z.i * ds, fora = (P.k[md(z.fim)] || 0) > 0 ? -1 : 1;
          const f = faixa(s0 - 70, s0 + 12, fora, rua ? 2.2 : 3.4, (rua ? 2.2 : 3.4) + prof);
          if(f) V.publico.push(f);
        }
        if(antiga) for(const lado of [1, -1]) for(let s = 40; s < Math.min(L * .5, 420); s += 90){ const f = faixa(s, s + 70, lado, 2.6, 6.5); if(f) V.publico.push(f); }
      }
      /* ── barracas atrás do público ── */
      const CORES_B = ['#f4f2ec', '#f4f2ec', '#d6311f', '#1f6fbf', '#f2c61f', '#1f8a4b'];
      const barraca = (x, y, hd, a, b, i) => { if(!livre(x, y, Math.max(a, b) + .6, i)) return false; V.barracas[pedDe(i)].push({ x, y, hd, a, b, cor: CORES_B[Math.floor(rnd() * CORES_B.length)], pts: caixa(x, y, hd, a, b) }); ocup.push({ x, y, r: Math.max(a, b) + .4 }); return true; };
      for(const f of V.publico){
        if(rua) continue;
        for(let q = 0, k = 2; q < f.fora.length && k > 0; q += 3 + Math.floor(rnd() * 3)){
          const a = f.dent[q], b = f.fora[q], hd = Math.atan2(b.y - a.y, b.x - a.x), d = 4.5 + rnd() * 2;
          if(barraca(b.x + Math.cos(hd) * d, b.y + Math.sin(hd) * d, hd + Math.PI / 2, 1.5 + (rnd() < .4 ? 1.5 : 0), 1.5, 0)) k--;
        }
      }
      /* ── os boxes: a equipe na porta de cada garagem, os pneus e o carrinho; as cabines no muro; o paddock atrás ── */
      if(Bx){
        const lado = Bx.lado;
        Bx.garagens.forEach((g, q) => {
          const i = idx(Bx.ini + 6 + q * 14 + 5), lista = V.gente[pedDe(i)], s0 = Bx.ini + 6 + q * 14;
          for(let k = 0; k < 4; k++){ const o = pt(s0 + 1.2 + k * 2.4 + rnd() * .8, lado * (Bx.d0 + .3 + rnd() * 1.5)); lista.push({ x: o.x, y: o.y, a: rnd() * 6.3, eq: q }); }
          const o = pt(s0 + 8.6, lado * (Bx.d0 + 1.3)); lista.push({ x: o.x, y: o.y, a: o.hd, eq: q, tipo: 'pneus' });
          const c = pt(s0 + .9, lado * (Bx.d0 + 1.5)); lista.push({ x: c.x, y: c.y, a: c.hd, eq: q, tipo: 'carrinho' });
          /* a cabine da equipe no muro dos boxes (uma a cada duas garagens) */
          if(q % 2 === 0){ const w = pt(s0 + 5, lado * (m + 1.4)); V.cabines[pedDe(i)].push({ x: w.x, y: w.y, hd: w.hd, eq: q, pts: caixa(w.x, w.y, w.hd, 1.7, .75) }); }
          /* o caminhão da equipe no paddock, de ré para o prédio */
          const t = pt(s0 + 5, lado * (Bx.d1 + 13));
          if(livre(t.x, t.y, 6, i)){ const hd = t.hd + lado * Math.PI / 2; V.veic[pedDe(i)].push({ x: t.x, y: t.y, hd, tipo: 'caminhao', eq: q, pts: caixa(t.x, t.y, hd, 8.1, 1.4) }); ocup.push({ x: t.x, y: t.y, r: 8 }); }
        });
        /* o safety car... não: o carro médico e a ambulância na saída dos boxes */
        for(const [ds2, tipo, cor] of [[0, 'ambulancia', '#f4f2ec'], [7, 'carro', '#d9dde2']]){
          const s = Bx.fim + 22 + ds2, o = pt(s, lado * (Bx.d0 + 2.2));
          if(livre(o.x, o.y, 2, idx(s))){ V.veic[pedDe(idx(s))].push({ x: o.x, y: o.y, hd: o.hd, tipo, cor, pts: caixa(o.x, o.y, o.hd, 2.3, 1) }); ocup.push({ x: o.x, y: o.y, r: 2.6 }); }
        }
      } else if(kart && B && B.comp > 60){
        /* o paddock do kart: barraquinhas e vans ao longo da pit lane */
        const lado = Math.sign(B.lado) || 1;
        for(let s = B.ini + 30, q = 0; s < B.ini + B.comp - 30; s += 5.5, q++){
          const i = idx(s), o = pt(s, lado * (B.d + B.larg / 2 + 3.2));
          if(barraca(o.x, o.y, o.hd, 1.5, 1.5, i)){
            for(let k = 0; k < 2; k++){ const g = pt(s - 1 + rnd() * 2, lado * (B.d + B.larg / 2 + .8 + rnd() * .8)); V.gente[pedDe(i)].push({ x: g.x, y: g.y, a: rnd() * 6.3, cor: tm.publico[Math.floor(rnd() * tm.publico.length)] }); }
            if(q % 2 === 0){ const v = pt(s, lado * (B.d + B.larg / 2 + 8.5)); if(livre(v.x, v.y, 2.6, i)){ const hd = v.hd + lado * Math.PI / 2; V.veic[pedDe(i)].push({ x: v.x, y: v.y, hd, tipo: 'van', cor: ['#f4f2ec', '#c9ccd1', '#2b4562', '#8a1f1f'][q % 4], pts: caixa(v.x, v.y, hd, 2.5, 1) }); ocup.push({ x: v.x, y: v.y, r: 2.7 }); } }
          }
        }
      }
      /* ── o trator, o guincho ou a ambulância ao lado dos postos dos fiscais ── */
      if(A && A.postos) A.postos.forEach((l, k) => l.forEach((q, j) => {
        if((k + j) % 2) return;
        const tipo = ['trator', 'guincho', 'ambulancia'][(k + j) % 3 === 0 ? 0 : (k * 7 + j) % 3], x = q.x - Math.cos(q.hd) * 5.2, y = q.y - Math.sin(q.hd) * 5.2, mm = MEIA[tipo];
        if(!livre(x, y, 2.2, k * 24)) return;
        V.veic[k].push({ x, y, hd: q.hd, tipo, cor: tipo === 'ambulancia' ? '#f4f2ec' : tipo === 'trator' ? '#f0a51a' : '#d6311f', pts: caixa(x, y, q.hd, mm[0], mm[1]) }); ocup.push({ x, y, r: 3.2 });
      }));
      /* ── as torres das câmeras de TV: por fora das freadas mais fortes, coladas na barreira ── */
      if(!kart && !antiga) for(const z of zonas.slice(0, 6)){
        const s = z.i * ds + 6, i = idx(s), fora = (P.k[md(z.fim)] || 0) > 0 ? -1 : 1; if(aj.naBox(i, fora)) continue;
        const o = pt(s, fora * (m + escDe(i, fora) + 2.6));
        if(!livre(o.x, o.y, 1.4, i)) continue;
        V.torres[pedDe(i)].push({ x: o.x, y: o.y, hd: o.hd, pts: caixa(o.x, o.y, o.hd, 1.1, 1.1) }); ocup.push({ x: o.x, y: o.y, r: 1.8 });
      }
      /* ── os nomes pintados na grama, por dentro das curvas: desligados (2026-11-12). Eram palavras
         inventadas ("APEX", "RETA OPOSTA") que não existem nos autódromos e enfeiavam o mapa ── */
      if(false && !kart && !rua && !P.oval && !P.terra && (tm.era === 'atual' || tm.era === 'moderna') && typeof document !== 'undefined' && C2D.Ambiente && C2D.Ambiente.texto){
        let q = 0;
        for(const z of zonas.slice(0, 7)){
          const i = md(z.fim), dentro = (P.k[i] || 0) > 0 ? 1 : -1, esc = escDe(i, dentro), piso = (dentro > 0 ? P.pisoE : P.pisoD)[i];
          if(piso !== 2 || esc < 7 || aj.naBox(i, dentro)) continue;
          const alt = Math.min(3.2, esc - 4.2), o = pt(i * ds, dentro * (m + 2.6 + alt / 2));
          const s = C2D.Ambiente.texto(NOMES[(C2D.semente(P.id) + q++) % NOMES.length], '#f4f2ec'), comp = alt * s.prop;
          V.logos.push({ x: o.x, y: o.y, hd: o.hd + (dentro > 0 ? Math.PI : 0), s, alt, r: comp / 2 + 1 });
        }
      }
      /* nada de árvore em cima de barraca, caminhão, torre ou público */
      if(ocup.length) for(const pp of cen.porPedaco) pp.arvores = pp.arvores.filter(t => !ocup.some(o => Math.hypot(o.x - t.x, o.y - t.y) < o.r + t.r * .7));
    },

    /* ── o que fica no chão (pintado nos blocos, por cima das barreiras) ── */
    pintar(ctx, R, vis){
      const V = R.cen.vida; if(!V) return;
      const T = C2D.Cenario.texturas(), cores = C2D.Cenario.equipes(R), largo = R.visLargo || vis, ve = (x, y, r) => R.visivel(x - r, y - r, x + r, y + r);
      /* os nomes pintados na grama (um pouco gastos) */
      for(const l of V.logos){
        if(!ve(l.x, l.y, l.r)) continue;
        ctx.save(); ctx.translate(l.x, l.y); ctx.rotate(l.hd); ctx.scale(1, -1); ctx.globalAlpha = .62;
        ctx.drawImage(l.s.cv, -l.alt * l.s.prop / 2, -l.alt / 2, l.alt * l.s.prop, l.alt); ctx.restore();
      }
      /* o público em pé: o chão pisado e as pessoas */
      for(const f of V.publico){
        if(!R.visivel(f.x0, f.y0, f.x1, f.y1)) continue;
        ctx.fillStyle = 'rgba(96,78,50,.26)'; ctx.fill(f.p);
        const pg = C2D.Cenario.padrao(ctx, 'gente', 1 / 20); if(pg){ ctx.fillStyle = pg; ctx.fill(f.p); }
      }
      for(const p of largo){
        /* as bases das barracas, das cabines e das torres; os veículos por baixo (rodas e sombra do chassi) */
        for(const b of V.barracas[p.idx]){ if(!ve(b.x, b.y, 4)) continue; ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.hd); ctx.fillStyle = 'rgba(40,36,30,.35)'; ctx.fillRect(-b.a, -b.b, b.a * 2, b.b * 2); ctx.fillStyle = '#6f6a5e'; ctx.fillRect(-b.a + .3, -b.b + .3, b.a * 2 - .6, b.b * 2 - .6); ctx.restore(); }
        for(const c of V.cabines[p.idx]){ if(!ve(c.x, c.y, 3)) continue; ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.hd); ctx.fillStyle = '#3a3e45'; ctx.fillRect(-1.7, -.75, 3.4, 1.5); ctx.restore(); }
        for(const t of V.torres[p.idx]){ if(!ve(t.x, t.y, 2)) continue; ctx.save(); ctx.translate(t.x, t.y); ctx.rotate(t.hd); ctx.fillStyle = 'rgba(30,32,36,.5)'; ctx.fillRect(-1.1, -1.1, 2.2, 2.2); ctx.restore(); }
        for(const v of V.veic[p.idx]){ if(!ve(v.x, v.y, 9)) continue; ctx.save(); ctx.translate(v.x, v.y); ctx.rotate(v.hd); veiculo(ctx, v.tipo, null, false); ctx.restore(); }
        /* a gente dos boxes (na cor da equipe), os pneus empilhados e o carrinho de ferramentas */
        for(const g of V.gente[p.idx]){
          if(!ve(g.x, g.y, 1.5)) continue;
          const cor = g.cor || cores[(g.eq || 0) % cores.length];
          ctx.save(); ctx.translate(g.x, g.y); ctx.rotate(g.a);
          if(g.tipo === 'pneus'){ for(const [x, y] of [[-.36, -.36], [.36, -.36], [-.36, .36], [.36, .36]]){ ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.arc(x + .1, y - .08, .34, 0, 6.3); ctx.fill(); ctx.fillStyle = '#17181b'; ctx.beginPath(); ctx.arc(x, y, .33, 0, 6.3); ctx.fill(); ctx.fillStyle = '#4a4e55'; ctx.beginPath(); ctx.arc(x, y, .16, 0, 6.3); ctx.fill(); } }
          else if(g.tipo === 'carrinho'){ ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(-.5, -.42, 1.2, .7); ctx.fillStyle = cor; ctx.fillRect(-.6, -.35, 1.2, .7); ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(-.6, .18, 1.2, .17); ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = .05; ctx.strokeRect(-.6, -.35, 1.2, .7); }
          else if(T.pessoa){ ctx.scale(1, -1); ctx.drawImage(T.pessoa(cor), -.5, -.5, 1, 1); }
          ctx.restore();
        }
      }
    },

    sombras(g, R, vis, sol){
      const V = R.cen.vida; if(!V) return;
      const Rel = C2D.Relevo, ALT = Rel.ALT, ve = (x, y, r) => R.visivel(x - r, y - r, x + r, y + r);
      for(const p of (R.visLargo || vis)){
        for(const b of V.barracas[p.idx]) if(ve(b.x, b.y, 7)) Rel.varrido(g, b.pts, sol.x * ALT[1], sol.y * ALT[1]);
        for(const c of V.cabines[p.idx]) if(ve(c.x, c.y, 6)) Rel.varrido(g, c.pts, sol.x * ALT[1], sol.y * ALT[1]);
        for(const v of V.veic[p.idx]) if(ve(v.x, v.y, 13)){ const h = v.tipo === 'caminhao' ? 3.6 : v.tipo === 'carro' ? 1.3 : 2.2; Rel.varrido(g, v.pts, sol.x * h, sol.y * h); }
        for(const t of V.torres[p.idx]) if(ve(t.x, t.y, 9)){
          const ox = sol.x * ALT[2], oy = sol.y * ALT[2];
          g.lineCap = 'round'; g.lineWidth = .22; g.beginPath(); for(const q of t.pts){ g.moveTo(q[0], q[1]); g.lineTo(q[0] + ox, q[1] + oy); } g.stroke();
          g.beginPath(); t.pts.forEach((q, k) => k ? g.lineTo(q[0] + ox, q[1] + oy) : g.moveTo(q[0] + ox, q[1] + oy)); g.closePath(); g.fill();
        }
      }
    },

    indexar(P, cen, marca){
      const V = cen.vida; if(!V) return;
      const um = (k, o, r) => marca(k, o.x - r, o.y - r, o.x + r, o.y + r);
      V.barracas.forEach(l => l.forEach(b => um(1, b, 4)));
      V.cabines.forEach(l => l.forEach(c => um(1, c, 3)));
      V.veic.forEach(l => l.forEach(v => um(1, v, 9)));
      V.torres.forEach(l => l.forEach(t => um(2, t, 3)));
    },

    /* ── os tetos, cada um no seu andar ── */
    andar(ctx, R, vis, k){
      const V = R.cen.vida; if(!V) return;
      const cores = C2D.Cenario.equipes(R), ve = (x, y, r) => R.visivel(x - r, y - r, x + r, y + r);
      for(const p of (R.visLargo || vis)){
        if(k === 1){
          for(const b of V.barracas[p.idx]){
            if(!ve(b.x, b.y, 4)) continue;
            /* a lona em quatro águas: as que olham para o noroeste, mais claras */
            ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.hd);
            const a = b.a, c = b.b, cx = Math.min(a, c) * .95;
            ctx.fillStyle = b.cor; ctx.fillRect(-a, -c, a * 2, c * 2);
            const nw = -Math.sin(b.hd) - Math.cos(b.hd) > 0, nw2 = Math.cos(b.hd) - Math.sin(b.hd) < 0, cl = 'rgba(255,255,255,.3)', es = 'rgba(0,0,0,.2)';
            ctx.fillStyle = nw ? cl : es; ctx.beginPath(); ctx.moveTo(-a, -c); ctx.lineTo(a, -c); ctx.lineTo(a - cx, 0); ctx.lineTo(-a + cx, 0); ctx.closePath(); ctx.fill();
            ctx.fillStyle = nw ? es : cl; ctx.beginPath(); ctx.moveTo(-a, c); ctx.lineTo(a, c); ctx.lineTo(a - cx, 0); ctx.lineTo(-a + cx, 0); ctx.closePath(); ctx.fill();
            ctx.fillStyle = nw2 ? 'rgba(255,255,255,.14)' : 'rgba(0,0,0,.1)'; ctx.beginPath(); ctx.moveTo(-a, -c); ctx.lineTo(-a + cx, 0); ctx.lineTo(-a, c); ctx.closePath(); ctx.fill();
            ctx.fillStyle = nw2 ? 'rgba(0,0,0,.1)' : 'rgba(255,255,255,.14)'; ctx.beginPath(); ctx.moveTo(a, -c); ctx.lineTo(a - cx, 0); ctx.lineTo(a, c); ctx.closePath(); ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = .08; ctx.strokeRect(-a, -c, a * 2, c * 2);
            ctx.restore();
          }
          for(const c of V.cabines[p.idx]){
            if(!ve(c.x, c.y, 3)) continue;
            ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.hd);
            ctx.fillStyle = '#e3e6ea'; ctx.fillRect(-1.7, -.75, 3.4, 1.5); ctx.fillStyle = cores[c.eq % cores.length]; ctx.fillRect(-1.7, -.2, 3.4, .4);
            ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = .07; ctx.strokeRect(-1.7, -.75, 3.4, 1.5);
            ctx.restore();
          }
          for(const v of V.veic[p.idx]){
            if(!ve(v.x, v.y, 9)) continue;
            ctx.save(); ctx.translate(v.x, v.y); ctx.rotate(v.hd); veiculo(ctx, v.tipo, v.cor || cores[(v.eq || 0) % cores.length], true); ctx.restore();
          }
        }
        if(k === 2) for(const t of V.torres[p.idx]){
          if(!ve(t.x, t.y, 3)) continue;
          /* a plataforma da câmera: o piso de grade, o guarda-corpo, o cinegrafista e a câmera apontada para a pista */
          ctx.save(); ctx.translate(t.x, t.y); ctx.rotate(t.hd);
          ctx.fillStyle = '#5a5f66'; ctx.fillRect(-1.1, -1.1, 2.2, 2.2);
          ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = .05; ctx.beginPath(); for(let q = -1; q <= 1; q += .5){ ctx.moveTo(q, -1.1); ctx.lineTo(q, 1.1); ctx.moveTo(-1.1, q); ctx.lineTo(1.1, q); } ctx.stroke();
          ctx.strokeStyle = '#d9dde2'; ctx.lineWidth = .12; ctx.strokeRect(-1.1, -1.1, 2.2, 2.2);
          ctx.fillStyle = '#2b2f36'; ctx.beginPath(); ctx.ellipse(.1, .2, .3, .22, 0, 0, 6.3); ctx.fill(); ctx.fillStyle = '#c9a36a'; ctx.beginPath(); ctx.arc(.1, .2, .13, 0, 6.3); ctx.fill();
          ctx.fillStyle = '#17181b'; ctx.fillRect(-.25, -.75, .5, .7); ctx.fillStyle = '#6fa8dc'; ctx.fillRect(-.14, -.95, .28, .22);
          ctx.restore();
        }
      }
    },

    /* ── a cada quadro: os pés das torres de TV (mudam com a câmera) ── */
    paredes(ctx, R, vis, naTela){
      const V = R.cen.vida; if(!V) return;
      const rv = R.rv, f = rv.s[2], v = R.vista, pl = new Path2D(); let tem = false;
      for(const p of vis) for(const t of V.torres[p.idx]){
        if(!naTela(t.x, t.y, 10 * v.z)) continue;
        for(const q of t.pts){ pl.moveTo(q[0], q[1]); pl.lineTo(rv.x + (q[0] - rv.x) * f, rv.y + (q[1] - rv.y) * f); }
        tem = true;
      }
      if(tem){ ctx.strokeStyle = '#4a4f57'; ctx.lineWidth = .16; ctx.stroke(pl); }
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
