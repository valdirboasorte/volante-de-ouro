/* ═════════════════════════════════════════════════════════════════
   CORREÇÕES DOS TRAÇADOS (2026-11-12)
   Fica fora dos blocos <script> do index.html para não mudar a versão do
   multiplayer; a página, os testes (testes/base.js) e o motor do servidor
   (multiplayer/ferramentas/gerar-motor.mjs) carregam este arquivo depois do jogo.

   A linha de chegada no lugar de verdade. O jogo põe a chegada na reta mais
   longa do traçado, o que acerta na maioria dos circuitos, mas não em Le Mans
   (a reta mais longa é a Hunaudières, a Mulsanne) nem em Detroit (a chegada
   ficava na Atwater Street, junto ao rio). Quando o registro do traçado diz
   onde fica a chegada, ela vai para lá:
   - "chegada": [x, y] em metros, no mesmo referencial dos pontos do registro
     (vem da própria marcação do mapa: a relação de Le Mans e a linha dos
     tijolos de Indianápolis no OpenStreetMap);
   - "chegadaFrac": [fx, fy], a fração da caixa do traçado (x para leste,
     y para o norte), conferida à mão no mapa do circuito (Detroit).
   Só o ponto de partida da volta muda: o desenho, o comprimento e o sentido
   ficam iguais.

   O traçado genérico (o circuito que não tem mapa nenhum). Antes era sempre o
   mesmo retângulo com dois entalhes na rua, um oval igual para todos e uma
   bolha de pontas nos mistos. Agora cada circuito ganha a sua forma (sempre a
   mesma para o mesmo circuito), com cara do tipo dele:
   - rua: um bloco de cidade (em L, T, U, Z ou cruz), esquinas em 90 graus,
     retas entre elas e às vezes uma chicane;
   - misto, veloz, técnico: retas longas, grampos, esses e curvas de raio
     variado (menos curvas no veloz, mais e mais apertadas no técnico);
   - oval: o clássico, o tri-oval, o em D, o clipe de papel ou o retangular;
   - kart: compacto e sinuoso.
   O jogo continua avisando que é esquemático.
   ═════════════════════════════════════════════════════════════════ */
const PistasCorrecoes = (function(){
  function pontos(reg){
    const v = String(reg.pts || '').split(',').map(Number), out = [];
    let x = 0, y = 0;
    for(let i = 0; i + 1 < v.length; i += 2){ x += v[i]; y += v[i + 1]; out.push([x / 10, y / 10]); }
    return out;
  }
  /* o ponto da chegada, no referencial do traçado montado pelo jogo (os pontos do registro vezes a escala) */
  function alvo(reg, g){
    const P = pontos(reg); if(P.length < 3) return null;
    let per = 0; for(let i = 0; i < P.length; i++){ const a = P[i], b = P[(i + 1) % P.length]; per += Math.hypot(b[0] - a[0], b[1] - a[1]); }
    const esc = per > 0 ? g.L / per : 1;
    if(Array.isArray(reg.chegada)) return [reg.chegada[0] * esc, reg.chegada[1] * esc];
    if(Array.isArray(reg.chegadaFrac)){
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for(const [x, y] of P){ if(x < x0) x0 = x; if(x > x1) x1 = x; if(y < y0) y0 = y; if(y > y1) y1 = y; }
      return [(x0 + (x1 - x0) * reg.chegadaFrac[0]) * esc, (y0 + (y1 - y0) * reg.chegadaFrac[1]) * esc];
    }
    return null;
  }
  /* gira a volta para começar no ponto mais perto da chegada */
  function aChegada(g, reg){
    if(!g || !reg || !g.n || !(reg.chegada || reg.chegadaFrac)) return g;
    const a = alvo(reg, g); if(!a) return g;
    let melhor = 0, dm = Infinity;
    for(let i = 0; i < g.n; i++){ const d = (g.x[i] - a[0]) ** 2 + (g.y[i] - a[1]) ** 2; if(d < dm){ dm = d; melhor = i; } }
    if(melhor){
      const rot = arr => { const b = new Float32Array(g.n); for(let i = 0; i < g.n; i++) b[i] = arr[(i + melhor) % g.n]; return b; };
      g.x = rot(g.x); g.y = rot(g.y);
      Pista.derivar(g);
    }
    if(Array.isArray(g.aprox)) g.aprox = g.aprox.map(t => /linha de chegada na reta mais longa/.test(t) ? null : t.replace(/^linha de chegada e boxes/, 'boxes')).filter(Boolean);
    /* o sentido conferido no mapa não é suposição; o traçado que não muda desde a inauguração vale para qualquer ano */
    if(Array.isArray(g.aprox) && reg.sentidoConferido) g.aprox = g.aprox.filter(t => !/^sentido de corrida suposto/.test(t));
    if(Array.isArray(g.aprox) && reg.mesmoDesde) g.aprox = g.aprox.map(t => /^traçado atual do circuito/.test(t) ? 'o mesmo traçado desde ' + reg.mesmoDesde : t);
    g.chegadaReal = true;
    return g;
  }
  /* ── o traçado genérico ── */
  const denso = (cantos, passo) => {
    const out = [];
    for(let i = 0; i < cantos.length; i++){
      const a = cantos[i], b = cantos[(i + 1) % cantos.length], n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / passo));
      for(let j = 0; j < n; j++) out.push([a[0] + (b[0] - a[0]) * j / n, a[1] + (b[1] - a[1]) * j / n]);
    }
    return out;
  };
  const areaDe = P => { let a = 0; for(let i = 0; i < P.length; i++){ const p = P[i], q = P[(i + 1) % P.length]; a += p[0] * q[1] - q[0] * p[1]; } return a / 2; };
  /* rua: um bloco de cidade (células de uma grade ligadas, sem buraco) e o contorno dele */
  function rua(rnd){
    const C = 4, R = 3, cel = new Set(), k = (c, r) => c + ',' + r;
    const alvo = 3 + Math.floor(rnd() * 5);
    cel.add(k(Math.floor(rnd() * C), Math.floor(rnd() * R)));
    for(let t = 0; cel.size < alvo && t < 200; t++){
      const l = [...cel], [c, r] = l[Math.floor(rnd() * l.length)].split(',').map(Number);
      const v = [[1, 0], [-1, 0], [0, 1], [0, -1]][Math.floor(rnd() * 4)], c2 = c + v[0], r2 = r + v[1];
      if(c2 >= 0 && c2 < C && r2 >= 0 && r2 < R) cel.add(k(c2, r2));
    }
    /* as arestas de fora: as que só uma célula tem */
    const larg = 180 + rnd() * 140, alt = 140 + rnd() * 120, cont = new Map();
    const xs = [0], ys = [0];
    for(let i = 1; i <= C; i++) xs.push(xs[i - 1] + larg * (.75 + rnd() * .5));
    for(let i = 1; i <= R; i++) ys.push(ys[i - 1] + alt * (.75 + rnd() * .5));
    const add = (a, b) => { const kk = a < b ? a + '|' + b : b + '|' + a; cont.set(kk, (cont.get(kk) || 0) + 1); };
    const p = (i, j) => i + ':' + j;
    for(const s of cel){ const [c, r] = s.split(',').map(Number); add(p(c, r), p(c + 1, r)); add(p(c + 1, r), p(c + 1, r + 1)); add(p(c + 1, r + 1), p(c, r + 1)); add(p(c, r + 1), p(c, r)); }
    const arestas = [...cont].filter(e => e[1] === 1).map(e => e[0].split('|'));
    if(arestas.length < 4) return null;
    /* encadeia; um canto tocado por quatro arestas é buraco ou cintura: recusa */
    const viz = new Map();
    for(const [a, b] of arestas){ if(!viz.has(a)) viz.set(a, []); if(!viz.has(b)) viz.set(b, []); viz.get(a).push(b); viz.get(b).push(a); }
    if([...viz.values()].some(l => l.length !== 2)) return null;
    const ini = arestas[0][0], volta = [ini];
    let ant = null, at = ini;
    for(let g = 0; g < arestas.length; g++){ const nx = viz.get(at).find(v => v !== ant); if(nx === ini) break; ant = at; at = nx; volta.push(at); }
    if(volta.length !== arestas.length) return null;
    let P = volta.map(s => { const [i, j] = s.split(':').map(Number); return [xs[i], ys[j]]; });
    /* tira os cantos que não viram (pontos no meio de uma reta) */
    P = P.filter((q, i) => { const a = P[(i - 1 + P.length) % P.length], b = P[(i + 1) % P.length]; return Math.abs((q[0] - a[0]) * (b[1] - q[1]) - (q[1] - a[1]) * (b[0] - q[0])) > 1; });
    /* um retângulo só não tem cara de cidade: pelo menos seis esquinas */
    if(P.length < 6) return null;
    /* uma ou duas esquinas cortadas em diagonal (a avenida que corta o quarteirão) */
    for(let q = 0, nq = Math.floor(rnd() * 3); q < nq; q++){
      const i = Math.floor(rnd() * P.length), a = P[(i - 1 + P.length) % P.length], c = P[i], b = P[(i + 1) % P.length];
      const la = Math.hypot(c[0] - a[0], c[1] - a[1]), lb = Math.hypot(b[0] - c[0], b[1] - c[1]), d = Math.min(la, lb) * (.25 + rnd() * .2);
      if(d < 40) continue;
      P.splice(i, 1, [c[0] + (a[0] - c[0]) / la * d, c[1] + (a[1] - c[1]) / la * d], [c[0] + (b[0] - c[0]) / lb * d, c[1] + (b[1] - c[1]) / lb * d]);
    }
    /* quase sempre uma chicane na reta mais comprida (o desvio de uma rua para a outra) */
    if(rnd() < .8){
      let m = 0, L = 0;
      for(let i = 0; i < P.length; i++){ const a = P[i], b = P[(i + 1) % P.length], l = Math.hypot(b[0] - a[0], b[1] - a[1]); if(l > L){ L = l; m = i; } }
      const a = P[m], b = P[(m + 1) % P.length], ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L, sg = areaDe(P) > 0 ? -1 : 1, d = 28 * sg;
      const t0 = .35 + rnd() * .2, w = 40;
      const q = (t, off) => [a[0] + ux * L * t - uy * off, a[1] + uy * L * t + ux * off];
      P.splice(m + 1, 0, q(t0, 0), q(t0 + w / L, d), q(t0 + 3 * w / L, d), q(t0 + 4 * w / L, 0));
    }
    return denso(P, 30);
  }
  /* misto, veloz e técnico: pontos espalhados, o casco convexo e os meios dos lados empurrados
     para dentro ou para fora (assim aparecem grampos, esses e retas de tamanhos diferentes) */
  function misto(rnd, tipo){
    const nPts = tipo === 'fast' ? 9 : tipo === 'tech' ? 16 : 12, asp = 1 + rnd() * .9, pts = [];
    for(let i = 0; i < nPts; i++) pts.push([(rnd() * 2 - 1) * 500 * asp, (rnd() * 2 - 1) * 500]);
    pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cruz = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const baixo = [], cima = [];
    for(const q of pts){ while(baixo.length >= 2 && cruz(baixo[baixo.length - 2], baixo[baixo.length - 1], q) <= 0) baixo.pop(); baixo.push(q); }
    for(const q of pts.slice().reverse()){ while(cima.length >= 2 && cruz(cima[cima.length - 2], cima[cima.length - 1], q) <= 0) cima.pop(); cima.push(q); }
    const H = baixo.slice(0, -1).concat(cima.slice(0, -1));
    if(H.length < 3) return null;
    /* os meios dos lados: empurrados (o técnico mais, o veloz menos) */
    const forca = tipo === 'fast' ? .22 : tipo === 'tech' ? .55 : .38, out = [];
    for(let i = 0; i < H.length; i++){
      const a = H[i], b = H[(i + 1) % H.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      out.push([a[0], a[1]]);
      if(L < 160) continue;
      const nn = tipo === 'tech' && L > 520 ? 2 : 1;
      for(let q = 1; q <= nn; q++){
        const t = q / (nn + 1) + (rnd() - .5) * .15, d = (rnd() * 2 - 1) * L * forca;
        out.push([a[0] + (b[0] - a[0]) * t + (-(b[1] - a[1]) / L) * d, a[1] + (b[1] - a[1]) * t + ((b[0] - a[0]) / L) * d]);
      }
    }
    /* afasta os pontos colados e abre os ângulos fechados demais (um grampo, não uma agulha) */
    for(let it = 0; it < 6; it++){
      for(let i = 0; i < out.length; i++) for(let j = i + 1; j < out.length; j++){
        const dx = out[j][0] - out[i][0], dy = out[j][1] - out[i][1], d = Math.hypot(dx, dy) || 1;
        if(d < 120){ const f = (120 - d) / 2 / d; out[i][0] -= dx * f; out[i][1] -= dy * f; out[j][0] += dx * f; out[j][1] += dy * f; }
      }
      for(let i = 0; i < out.length; i++){
        const a = out[(i - 1 + out.length) % out.length], q = out[i], b = out[(i + 1) % out.length];
        const v1x = a[0] - q[0], v1y = a[1] - q[1], v2x = b[0] - q[0], v2y = b[1] - q[1], l1 = Math.hypot(v1x, v1y) || 1, l2 = Math.hypot(v2x, v2y) || 1;
        const ang = Math.acos(Math.max(-1, Math.min(1, (v1x * v2x + v1y * v2y) / (l1 * l2))));
        if(ang < .95){ const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2; q[0] += (mx - q[0]) * .35; q[1] += (my - q[1]) * .35; }
      }
    }
    /* as duas ou três retas mais longas ficam retas (pontos ao longo delas); o resto vira curva suave */
    const lados = out.map((a, i) => { const b = out[(i + 1) % out.length]; return { i, L: Math.hypot(b[0] - a[0], b[1] - a[1]) }; }).sort((u, v) => v.L - u.L);
    const retas = new Set(lados.slice(0, tipo === 'fast' ? 3 : tipo === 'tech' ? 1 : 2).map(u => u.i));
    const fim = [];
    out.forEach((a, i) => {
      fim.push(a);
      if(!retas.has(i)) return;
      const b = out[(i + 1) % out.length], n = Math.max(2, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 60));
      for(let j = 1; j < n; j++){ const t = j / n; if(t > .12 && t < .88) fim.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
    });
    return fim;
  }
  /* os ovais: clássico, tri-oval, em D, clipe de papel e retangular */
  function oval(rnd){
    const tipos = ['classico', 'tri', 'D', 'clipe', 'quad'], t = tipos[Math.floor(rnd() * tipos.length)];
    const P = [];
    const arco = (cx, cy, r, a0, a1, n) => { for(let i = 0; i < n; i++){ const a = a0 + (a1 - a0) * i / n; P.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } };
    const reta = (a, b, n) => { for(let i = 0; i < n; i++) P.push([a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n]); };
    if(t === 'quad'){
      /* quatro curvas e duas retas curtas (como Indianápolis), num retângulo arredondado */
      const r = 1, a = 2.6 + rnd() * 1.4, b = .6 + rnd() * .5;
      reta([-a / 2, -r - b / 2], [a / 2, -r - b / 2], 16); arco(a / 2, -b / 2, r, -Math.PI / 2, 0, 10); reta([a / 2 + r, -b / 2], [a / 2 + r, b / 2], 4);
      arco(a / 2, b / 2, r, 0, Math.PI / 2, 10); reta([a / 2, r + b / 2], [-a / 2, r + b / 2], 16); arco(-a / 2, b / 2, r, Math.PI / 2, Math.PI, 10);
      reta([-a / 2 - r, b / 2], [-a / 2 - r, -b / 2], 4); arco(-a / 2, -b / 2, r, Math.PI, 1.5 * Math.PI, 10);
    } else {
      const a = t === 'clipe' ? 3.2 + rnd() * 1.2 : t === 'classico' ? 1.6 + rnd() * 1.4 : 1.8 + rnd() * .8, r = 1;
      /* a reta da frente: reta, com a dobra do tri-oval ou a barriga do D */
      const dobra = t === 'tri' ? .45 + rnd() * .25 : t === 'D' ? .35 + rnd() * .2 : 0;
      if(t === 'tri'){ for(const [u, f] of [[0, 0], [.25, .62], [.5, 1], [.75, .62]]) P.push([-a / 2 + a * u, -r - dobra * f]); }
      else if(t === 'D'){ for(let i = 0; i < 20; i++){ const u = i / 20; P.push([-a / 2 + a * u, -r - dobra * Math.sin(Math.PI * u)]); } }
      else reta([-a / 2, -r], [a / 2, -r], 20);
      arco(a / 2, 0, r, -Math.PI / 2, Math.PI / 2, 22); reta([a / 2, r], [-a / 2, r], 20); arco(-a / 2, 0, r, Math.PI / 2, 1.5 * Math.PI, 22);
    }
    return P.map(q => [q[0] * 100, q[1] * 100]);
  }
  /* o traçado genérico de um circuito: tenta formas até achar uma que não se cruza nem tem curva de agulha */
  function generico(trk, motivo){
    const tipo = trk.type || 'mixed', kart = /^(kt_|kb_|kr_)/.test(trk.id);
    const alvo = kart ? 1100 : tipo === 'oval' ? (trk.id === 'indy' ? 4023 : /day|tal/.test(trk.id) ? 4023 : 2414)
               : tipo === 'street' ? 3300 : tipo === 'fast' ? 5600 : tipo === 'tech' ? 4200 : 4700;
    const rnd = rngDe(seedOf('esq2:' + trk.id));
    const kMax = kart ? 1 / 7 : tipo === 'street' ? 1 / 11 : 1 / 16;
    let g = null;
    for(let tent = 0; tent < 40 && !g; tent++){
      let cand = tipo === 'oval' ? oval(rnd) : tipo === 'street' ? rua(rnd) : misto(rnd, kart ? 'tech' : tipo);
      if(!cand || cand.length < 8) continue;
      /* horário, como a maioria dos circuitos; o oval, anti-horário */
      const horario = areaDe(cand) < 0;
      if(tipo === 'oval' ? horario : !horario) cand = cand.slice().reverse();
      const t = Pista.construir(cand, alvo);
      if(Pista.cruza(t)) continue;
      let pior = 0;
      for(let i = 0; i < t.n; i++) pior = Math.max(pior, Math.abs(t.k[i]));
      if(pior > kMax && tent < 36) continue;
      g = t;
    }
    if(!g) return null;
    Pista.chegadaNaReta(g);
    return Object.assign(g, {
      real: false, id: trk.id, tipo, nome: trk.circ, circ: trk.circ,
      fonte: 'esquemático gerado pelo jogo', motivo, aprox: ['traçado inteiro: esquemático, não é o circuito real'],
      ladoBox: g.dentro
    });
  }

  function instalar(){
    if(typeof Pista === 'undefined' || Pista.__chegadaReal) return;
    Pista.__chegadaReal = true;
    /* o genérico novo; se ele não achar forma, fica o antigo */
    if(typeof Pista.esquema === 'function' && typeof rngDe === 'function' && typeof seedOf === 'function'){
      const antigo = Pista.esquema;
      Pista.esquema = function(trk, motivo){ let g = null; try { g = generico(trk, motivo); } catch(e){ g = null; } return g || antigo.apply(this, arguments); };
    }
    for(const k of ['osm', 'mapa', 'aproximado']){
      const orig = Pista[k]; if(typeof orig !== 'function') continue;
      Pista[k] = function(trk, reg){ return aChegada(orig.apply(this, arguments), reg); };
    }
    if(Array.isArray(Pista._cache)) Pista._cache.length = 0;
  }
  instalar();
  return { instalar, aChegada, generico };
})();
