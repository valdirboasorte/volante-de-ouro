/* Corrida 2D: o asfalto usado.
   Uma pista de verdade não é um tapete liso: tem trechos recapeados de tons diferentes, as
   juntas da pavimentação, remendos, rachaduras, a borracha escura na trajetória (mais
   carregada nas freadas e nas curvas), as marcas de quem travou a roda ou escapou de
   traseira, as arrancadas no grid, a sujeira nas beiradas, a zebra riscada de pneu e os
   sulcos de quem foi parar na brita. Tudo isso é montado uma vez por pista (sempre igual
   para a mesma pista) e pintado nos blocos do chão. Só desenho: a aderência não muda. */
(function(raiz){
  const C2D = raiz.C2D;
  const lim = (v, a, b) => v < a ? a : v > b ? b : v;

  C2D.Asfalto = {
    montar(P, cen){
      if(typeof Path2D === 'undefined') return;
      const n = P.n, x = P.x, y = P.y, nx = P.nx, ny = P.ny, m = P.meia, ds = P.ds, L = P.linha, w = P.w;
      const rnd = C2D.rng(C2D.semente('asfalto:' + P.id));
      const np = P.pedacos.length, md = i => ((i % n) + n) % n, pedDe = i => Math.min(np - 1, Math.floor(md(i) / 24));
      const pt = (i, d) => { const j = md(i); return [x[j] + nx[j] * d, y[j] + ny[j] * d]; };
      /* um ponto ao lado da trajetória ideal (o metros para a esquerda dela), sem sair do asfalto */
      const pl = (i, o) => { const j = md(i), oo = lim(o, -m + .4 - L.e[j], m - .4 - L.e[j]); return [L.x[j] - Math.sin(L.hd[j]) * oo, L.y[j] + Math.cos(L.hd[j]) * oo]; };
      const cada = f => P.pedacos.map(f);
      const A = cen.asf = { trechos: [], juntas: cada(() => new Path2D()), faixas: cada(() => new Path2D()), remendos: cada(() => new Path2D()), rachas: cada(() => new Path2D()),
                            borr: cada(() => new Path2D()), forte: cada(() => new Path2D()), marcas: cada(() => [new Path2D(), new Path2D(), new Path2D()]),
                            sulcos: cada(() => [new Path2D(), new Path2D()]), beira: cada(() => new Path2D()), zebSuja: cada(() => new Path2D()), oleo: cada(() => []),
                            pintura: { tracejado: new Path2D(), cheio: new Path2D(), amarelo: new Path2D(), x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 }, esc: P.kart ? .55 : 1 };
      const terra = P.terra, kart = P.kart, tm = cen.tema, velho = !!(tm && tm.velho);
      /* ── a borracha: a trajetória inteira, pedaço a pedaço (as pontas se encontram sem se sobrepor) ── */
      P.pedacos.forEach((pd, k) => { const p = A.borr[k]; for(let i = pd.i0; i <= pd.i1; i++){ const j = md(i); i === pd.i0 ? p.moveTo(L.x[j], L.y[j]) : p.lineTo(L.x[j], L.y[j]); } });
      /* mais carregada onde se freia e onde se faz curva */
      const pesa = new Uint8Array(n);
      for(let i = 0; i < n; i++) if(Math.abs(L.k[i]) > 1 / 240) pesa[i] = 1;
      for(const z of (P.zonas || [])){ if(!(z.q > .15)) continue; for(let i = z.i - Math.round(25 / ds); i <= z.fim; i++) pesa[md(i)] = 1; }
      P.pedacos.forEach((pd, k) => { const p = A.forte[k]; let on = false; for(let i = pd.i0; i <= pd.i1; i++){ const j = md(i); if(!pesa[j]){ on = false; continue; } on ? p.lineTo(L.x[j], L.y[j]) : p.moveTo(L.x[j], L.y[j]); on = true; } });
      if(!terra){
        /* ── as juntas ao comprido (as passadas da pavimentadora) ── */
        const dj = kart ? [0] : P.oval ? [-w / 4, 0, w / 4] : [-w / 6, w / 6];
        P.pedacos.forEach((pd, k) => { const p = A.faixas[k]; for(const d of dj) for(let i = pd.i0; i <= pd.i1; i++){ const q = pt(i, d); i === pd.i0 ? p.moveTo(q[0], q[1]) : p.lineTo(q[0], q[1]); } });
        /* ── os trechos recapeados: a largura toda ou uma faixa só, mais claros (velhos) ou mais escuros (novos) ── */
        for(let i = Math.floor(rnd() * 60 / ds); i < n; ){
          const fim = Math.min(n, i + Math.max(4, Math.floor((40 + rnd() * 300) / ds))), v = rnd();
          let d0 = -m, d1 = m, tom = 0;
          if(v < .3) tom = 1; else if(v < .56) tom = -1;
          else if(v < .7){ tom = rnd() < .5 ? 1 : -1; const c = dj[Math.floor(rnd() * dj.length)]; if(rnd() < .5) d1 = c; else d0 = c; }
          if(tom){
            const p = new Path2D(); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
            const mais = a => { if(a[0] < x0) x0 = a[0]; if(a[0] > x1) x1 = a[0]; if(a[1] < y0) y0 = a[1]; if(a[1] > y1) y1 = a[1]; };
            for(let q = i; q <= fim; q++){ const a = pt(q, d1); q === i ? p.moveTo(a[0], a[1]) : p.lineTo(a[0], a[1]); mais(a); }
            for(let q = fim; q >= i; q--){ const a = pt(q, d0); p.lineTo(a[0], a[1]); mais(a); }
            p.closePath();
            A.trechos.push({ p, tom, f: .45 + rnd() * .55, x0, y0, x1, y1 });
            for(const q of [i, fim]){ const a = pt(q, d0), b = pt(q, d1), jp = A.juntas[pedDe(q)]; jp.moveTo(a[0], a[1]); jp.lineTo(b[0], b[1]); }
          }
          i = fim + Math.floor(rnd() * 160 / ds);
        }
        /* ── remendos (retângulos de piche novo) e rachaduras (mais numa pista velha) ── */
        for(let q = 0, nq = Math.round(P.L / (velho ? 90 : 150)); q < nq; q++){
          const i = Math.floor(rnd() * n), comp = 2 + rnd() * 5, larg = Math.min(w * .4, 1.2 + rnd() * 2.6), d = (rnd() - .5) * (w - larg - .8), ni = Math.max(1, Math.round(comp / ds));
          const a = pt(i, d - larg / 2), b = pt(i + ni, d - larg / 2), c = pt(i + ni, d + larg / 2), e = pt(i, d + larg / 2), p = A.remendos[pedDe(i)];
          p.moveTo(a[0], a[1]); p.lineTo(b[0], b[1]); p.lineTo(c[0], c[1]); p.lineTo(e[0], e[1]); p.closePath();
        }
        for(let q = 0, nq = Math.round(P.L / (velho ? 26 : 70)); q < nq; q++){
          const i = Math.floor(rnd() * n), j = md(i), p = A.rachas[pedDe(i)], hd = P.hd[j];
          let d = (rnd() - .5) * (w - 1), s = 0, a = pt(i, d), px = a[0], py = a[1];
          p.moveTo(px, py);
          for(let k = 0, nk = 3 + Math.floor(rnd() * 5); k < nk; k++){
            const av = .5 + rnd() * 1.4, lat = (rnd() - .5) * 1.1;
            if(Math.abs(d + lat) > m - .3) break;
            d += lat; s += av; px += Math.cos(hd) * av - Math.sin(hd) * lat; py += Math.sin(hd) * av + Math.cos(hd) * lat;
            p.lineTo(px, py);
          }
        }
        /* ── a sujeira nas beiradas (fora da trajetória ninguém limpa) ── */
        P.pedacos.forEach((pd, k) => { const p = A.beira[k]; for(const lado of [1, -1]) for(let i = pd.i0; i <= pd.i1; i++){ const q = pt(i, lado * (m - .8)); i === pd.i0 ? p.moveTo(q[0], q[1]) : p.lineTo(q[0], q[1]); } });
        /* ── a zebra riscada de pneu (do lado da pista) ── */
        P.pedacos.forEach((pd, k) => { const p = A.zebSuja[k]; for(const lado of [1, -1]){ let on = false; for(let i = pd.i0; i <= pd.i1; i++){ if(!P.zebra[md(i)]){ on = false; continue; } const q = pt(i, lado * (m + .38)); on ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1]); on = true; } } });
      }
      /* ── as marcas de pneu: um risco (ou um par, da largura do carro) ao lado da trajetória ── */
      const bit = kart ? .5 : .78;
      const risco = (i0, len, o0, o1, classe, par) => {
        for(const lado of par ? [-bit, bit] : [0]){
          let ant = -1;
          for(let q = 0; q <= len; q++){
            const t = q / Math.max(1, len), a = pl(i0 + q, o0 + (o1 - o0) * t * t + lado), k = pedDe(i0 + q);
            if(k !== ant){ if(ant >= 0) A.marcas[ant][classe].lineTo(a[0], a[1]); A.marcas[k][classe].moveTo(a[0], a[1]); ant = k; }
            else A.marcas[k][classe].lineTo(a[0], a[1]);
          }
        }
      };
      const classe = () => { const v = rnd(); return v < .5 ? 0 : v < .85 ? 1 : 2; };
      if(!terra){
        for(const z of (P.zonas || [])){
          if(!(z.q > .15)) continue;
          const fora = (P.k[md(z.fim)] || 0) > 0 ? -1 : 1, compZ = Math.max(4, ((z.fim - z.i) % n + n) % n);
          /* quem travou na freada */
          for(let q = 0, nq = 1 + Math.floor(z.q * 5 + rnd() * 2); q < nq; q++){
            const i0 = z.i - Math.floor(rnd() * 30 / ds) + Math.floor(rnd() * compZ * .5), len = Math.max(3, Math.floor((12 + rnd() * (30 + 50 * z.q)) / ds)), o0 = (rnd() - .5) * 3.2;
            risco(i0, len, o0, o0 + (rnd() - .5) * 1.4 + fora * rnd() * .8, classe(), rnd() < .8);
          }
          /* quem escorregou de traseira na saída */
          for(let q = 0, nq = Math.floor(z.q * 3 + rnd() * 1.6); q < nq; q++){
            const i0 = z.fim + Math.floor(rnd() * 14 / ds), len = Math.max(3, Math.floor((14 + rnd() * 36) / ds)), o0 = (rnd() - .5) * 1.6;
            risco(i0, len, o0, o0 + fora * (.8 + rnd() * 2.2), classe(), true);
          }
        }
        /* travadas soltas pela pista */
        for(let q = 0, nq = Math.round(P.L / 420); q < nq; q++){ const o0 = (rnd() - .5) * 4; risco(Math.floor(rnd() * n), Math.max(3, Math.floor((8 + rnd() * 22) / ds)), o0, o0 + (rnd() - .5), 0, rnd() < .7); }
        /* as arrancadas no grid: dois riscos fortes saindo de cada vaga */
        for(let k = 1; k <= 26; k++){
          const vg = C2D.Pista.vaga(P, k), comp = 4 + rnd() * 6, cl = rnd() < .5 ? 2 : 1, ped = A.marcas[pedDe(Math.floor(((vg.s % P.L) + P.L) % P.L / ds))][cl];
          for(const lado of [-bit, bit]){ const a = C2D.Pista.ponto(P, vg.s - .6, vg.d + lado), b = C2D.Pista.ponto(P, vg.s + comp * .5, vg.d + lado * (1 + (rnd() - .5) * .1)), c = C2D.Pista.ponto(P, vg.s + comp, vg.d + lado + (rnd() - .5) * .5); ped.moveTo(a.x, a.y); ped.lineTo(b.x, b.y); ped.lineTo(c.x, c.y); }
          /* e os pingos de óleo de quem ficou parado ali */
          if(rnd() < .6){ const o = C2D.Pista.ponto(P, vg.s - 1.2 - rnd() * 1.5, vg.d + (rnd() - .5) * .5); A.oleo[pedDe(Math.floor(((vg.s % P.L) + P.L) % P.L / ds))].push({ x: o.x, y: o.y, r: .25 + rnd() * .4 }); }
        }
      }
      /* ── os sulcos de quem saiu reto na freada e foi parar na brita (ou marcou a grama) ── */
      for(const z of (P.zonas || [])){
        if(!(z.q > .3) || P.tipo === 'street' || P.oval) continue;
        const fora = (P.k[md(z.fim)] || 0) > 0 ? -1 : 1;
        for(let q = 0, nq = 1 + Math.floor(rnd() * 2.6); q < nq; q++){
          const i0 = z.fim - Math.floor(rnd() * 22 / ds), j0 = md(i0), esc = (fora > 0 ? P.escE : P.escD)[j0], prof = esc * (.3 + rnd() * .55);
          if(prof < 2.5) continue;
          const len = Math.max(4, Math.floor((prof * (2 + rnd() * 2.5)) / ds)), brita = (fora > 0 ? P.pisoE : P.pisoD)[j0] === 3 ? 0 : 1;
          for(const lado of [-bit, bit]){
            let ant = -1;
            for(let u = 0; u <= len; u++){
              const t = u / len, j = md(i0 + u), escJ = (fora > 0 ? P.escE : P.escD)[j];
              /* (cada roda no seu sulco: um mais para fora, outro mais para dentro, sem voltar para o asfalto nem passar do muro) */
              const dm = Math.max(m + 1.35, Math.min(m + escJ - .9, m + 1.5 + prof * Math.pow(t, .75)) + lado);
              const a = pt(i0 + u, fora * dm), k = pedDe(i0 + u), cam = A.sulcos;
              if(k !== ant){ if(ant >= 0) cam[ant][brita].lineTo(a[0], a[1]); cam[k][brita].moveTo(a[0], a[1]); ant = k; } else cam[k][brita].lineTo(a[0], a[1]);
            }
          }
        }
      }
      /* ── a pintura dos boxes: a linha tracejada da entrada e da saída, as linhas do limite de velocidade ── */
      const B = P.box, pin = A.pintura, lado = Math.sign(B.lado) || 1;
      const mais = q => { if(q.x < pin.x0) pin.x0 = q.x; if(q.x > pin.x1) pin.x1 = q.x; if(q.y < pin.y0) pin.y0 = q.y; if(q.y > pin.y1) pin.y1 = q.y; };
      if(B && B.comp > 120 && !terra){
        for(const [s0, s1] of [[B.ini + 12, B.ini + 78], [B.ini + B.comp - 78, B.ini + B.comp - 12]]){
          for(let s = s0; s <= s1; s += 2){ const q = C2D.Pista.ponto(P, s, lado * (m - .12)); s === s0 ? pin.tracejado.moveTo(q.x, q.y) : pin.tracejado.lineTo(q.x, q.y); mais(q); }
        }
        if(B.comp > 260) for(const s of [B.ini + 116, B.ini + B.comp - 116]){
          const a = C2D.Pista.ponto(P, s, lado * (B.d - B.larg / 2 + .2)), b = C2D.Pista.ponto(P, s, lado * (B.d + B.larg / 2 - .2));
          pin.cheio.moveTo(a.x, a.y); pin.cheio.lineTo(b.x, b.y); mais(a); mais(b);
          const c = C2D.Pista.ponto(P, s + .7, lado * (B.d - B.larg / 2 + .2)), e = C2D.Pista.ponto(P, s + .7, lado * (B.d + B.larg / 2 - .2));
          pin.amarelo.moveTo(c.x, c.y); pin.amarelo.lineTo(e.x, e.y);
        }
      }
    },

    /* antes da brita e do asfalto: a beirada da grama gasta e seca junto da pista */
    antes(ctx, R, vis){
      const P = R.P; if(P.tipo === 'street' || P.terra) return;
      const k = P.kart ? .5 : 1;
      ctx.lineJoin = 'round'; ctx.lineCap = 'butt';
      ctx.strokeStyle = 'rgba(222,204,128,.09)'; ctx.lineWidth = 7 * k; for(const p of vis) ctx.stroke(p.bordas);
      ctx.strokeStyle = 'rgba(126,100,60,.15)'; ctx.lineWidth = 2.6 * k; for(const p of vis) ctx.stroke(p.bordas);
    },

    /* por cima do asfalto liso, por baixo das zebras e das linhas */
    pintar(ctx, R, vis){
      const A = R.cen.asf, P = R.P;
      if(!A){
        ctx.strokeStyle = 'rgba(12,12,14,.16)'; ctx.lineWidth = 2.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        for(const p of vis) ctx.stroke(R.cen.borracha[p.idx]);
        return;
      }
      const terra = P.terra, e = A.esc, pad = (nome, mpp) => C2D.Cenario.padrao(ctx, nome, mpp);
      ctx.lineJoin = 'round'; ctx.lineCap = 'butt'; ctx.setLineDash([]);
      if(!terra){
        for(const t of A.trechos){
          if(!R.visivel(t.x0, t.y0, t.x1, t.y1)) continue;
          ctx.fillStyle = t.tom > 0 ? 'rgba(255,255,255,' + (.055 * t.f).toFixed(3) + ')' : 'rgba(0,0,0,' + (.1 * t.f).toFixed(3) + ')'; ctx.fill(t.p);
        }
        ctx.fillStyle = 'rgba(8,8,10,.14)'; for(const p of vis) ctx.fill(A.remendos[p.idx]);
        ctx.strokeStyle = 'rgba(0,0,0,.24)'; ctx.lineWidth = .07; for(const p of vis) ctx.stroke(A.remendos[p.idx]);
        ctx.strokeStyle = 'rgba(0,0,0,.14)'; ctx.lineWidth = .06; for(const p of vis) ctx.stroke(A.faixas[p.idx]);
        ctx.strokeStyle = 'rgba(0,0,0,.22)'; ctx.lineWidth = .09; for(const p of vis) ctx.stroke(A.juntas[p.idx]);
        ctx.strokeStyle = 'rgba(0,0,0,.26)'; ctx.lineWidth = .05; for(const p of vis) ctx.stroke(A.rachas[p.idx]);
        const sj = pad('sujeira', 1 / 40);
        if(sj){ ctx.strokeStyle = sj; ctx.lineWidth = 1.5 * e; for(const p of vis) ctx.stroke(A.beira[p.idx]); }
      }
      /* a borracha na trajetória: larga e fraca; nas freadas e nas curvas, mais carregada
         (na terra, o sulco escuro e úmido por onde todo mundo passa) */
      const cor = terra ? '40,22,12' : '13,11,11';
      for(const [lw, a] of terra ? [[4.4, .2], [1.6, .13]] : [[5.6, .05], [3.6, .07], [2, .08]]){ ctx.strokeStyle = 'rgba(' + cor + ',' + a + ')'; ctx.lineWidth = lw * e; for(const p of vis) ctx.stroke(A.borr[p.idx]); }
      if(!terra) for(const [lw, a] of [[4.4, .07], [2.5, .1]]){ ctx.strokeStyle = 'rgba(' + cor + ',' + a + ')'; ctx.lineWidth = lw * e; for(const p of vis) ctx.stroke(A.forte[p.idx]); }
      /* as marcas de pneu e os pingos de óleo */
      ctx.lineCap = 'round';
      [.1, .17, .28].forEach((a, q) => { ctx.strokeStyle = 'rgba(9,9,11,' + a + ')'; ctx.lineWidth = P.kart ? .14 : .27; for(const p of vis) ctx.stroke(A.marcas[p.idx][q]); });
      for(const p of vis) for(const o of A.oleo[p.idx]){
        if(!R.visivel(o.x - 1, o.y - 1, o.x + 1, o.y + 1)) continue;
        ctx.fillStyle = 'rgba(8,8,10,.2)'; ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, 6.3); ctx.fill();
        ctx.fillStyle = 'rgba(8,8,10,.25)'; ctx.beginPath(); ctx.arc(o.x + o.r * .2, o.y, o.r * .45, 0, 6.3); ctx.fill();
      }
      /* os sulcos na brita e na grama */
      ctx.strokeStyle = 'rgba(98,76,44,.4)'; ctx.lineWidth = .36; for(const p of vis) ctx.stroke(A.sulcos[p.idx][0]);
      ctx.strokeStyle = 'rgba(255,246,222,.22)'; ctx.lineWidth = .1; ctx.save(); ctx.translate(-.16, .16); for(const p of vis) ctx.stroke(A.sulcos[p.idx][0]); ctx.restore();
      ctx.strokeStyle = 'rgba(70,52,28,.36)'; ctx.lineWidth = .34; for(const p of vis) ctx.stroke(A.sulcos[p.idx][1]);
      ctx.lineCap = 'butt';
    },

    /* por cima das zebras e das linhas: a zebra riscada de pneu e a pintura dos boxes */
    marcas(ctx, R, vis){
      const A = R.cen.asf; if(!A) return;
      ctx.lineJoin = 'round'; ctx.lineCap = 'butt';
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(14,12,12,.17)'; ctx.lineWidth = .16; ctx.setLineDash([2.2, 3.1, 1.1, 4.6]); for(const p of vis) ctx.stroke(A.zebSuja[p.idx]);
      ctx.strokeStyle = 'rgba(14,12,12,.1)'; ctx.lineWidth = .5; ctx.setLineDash([1.4, 6.1, 2.6, 7.3]); ctx.lineDashOffset = 3; for(const p of vis) ctx.stroke(A.zebSuja[p.idx]);
      ctx.lineCap = 'butt';
      ctx.setLineDash([]); ctx.lineDashOffset = 0;
      const pin = A.pintura;
      if(R.visivel(pin.x0 - 1, pin.y0 - 1, pin.x1 + 1, pin.y1 + 1)){
        ctx.strokeStyle = 'rgba(238,237,232,.92)'; ctx.lineWidth = .2; ctx.setLineDash([2.4, 2.4]); ctx.stroke(pin.tracejado); ctx.setLineDash([]);
        ctx.strokeStyle = 'rgba(238,237,232,.92)'; ctx.lineWidth = .35; ctx.stroke(pin.cheio);
        ctx.strokeStyle = 'rgba(240,193,46,.9)'; ctx.lineWidth = .25; ctx.stroke(pin.amarelo);
      }
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
