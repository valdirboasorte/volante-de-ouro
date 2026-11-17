/* Corrida 2D: o chão e os andares do cenário pintados uma vez, em blocos.
   Desenhar a pista inteira a cada quadro custa caro: cada camada (grama, brita, asfalto,
   zebra, linha, barreira...) é um caminho grande, e são dezenas delas por pedaço. Aqui o
   que não muda de um quadro para outro é pintado uma vez num bloco de 512 px e depois só
   copiado. Cada bloco cobre um quadrado do mundo; a resolução acompanha a distância da
   câmera (cinco níveis, cada um a metade do anterior) e só ficam guardados os blocos por
   onde a câmera anda. O chão é o andar 0; os andares de cima (telhados, copas das árvores) são blocos
   transparentes, copiados com a escala da altura deles: é isso que dá a profundidade.
   Só desenho: nada daqui entra na física. */
(function(raiz){
  const C2D = raiz.C2D;
  const TAM = 512, BORDA = 3, MIOLO = TAM - 2 * BORDA;
  const NIVEIS = [6, 12, 24, 48, 96];
  /* um bloco pode aparecer ampliado até isto antes de trocar para o nível mais fino */
  const FOLGA = 1.2;
  const agora = () => typeof performance !== 'undefined' ? performance.now() : Date.now();
  const novo = (w, h) => typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(w, h)
    : typeof document !== 'undefined' ? Object.assign(document.createElement('canvas'), { width: w, height: h }) : null;
  let ultimo = null;

  /* o nível de resolução para tantos pixels por metro na tela (com folga para não ficar trocando) */
  function nivelDe(st, zd){
    const N = st.niveis;
    let n = st.nivel;
    if(n < 0){ n = 0; while(n < N.length - 1 && N[n] * FOLGA < zd) n++; return n; }
    while(n < N.length - 1 && N[n] * FOLGA * 1.07 < zd) n++;
    while(n > 0 && N[n - 1] * FOLGA * .93 >= zd) n--;
    return n;
  }

  /* pinta um bloco: o quadrado (tx, ty) do nível n, no andar k */
  function pintar(R, st, n, k, tx, ty){
    const res = st.niveis[n], lado = MIOLO / res, w = TAM / res, b = BORDA / res;
    const x0 = tx * lado - b, y0 = ty * lado - b, x1 = x0 + w, y1 = y0 + w;
    if(k > 0 && !(C2D.Cenario && C2D.Cenario.temAndar && C2D.Cenario.temAndar(R, k, x0, y0, x1, y1))) return { vazio: true, k, n };
    const t0 = agora(), q = k ? 1 : 0;
    let tela = st.telas[q], g = st.gs[q];
    if(!tela){ tela = st.telas[q] = novo(TAM, TAM); g = st.gs[q] = tela.getContext('2d', C2D.Camadas.CPU ? { alpha: k > 0, willReadFrequently: true } : { alpha: k > 0 }); }
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.setLineDash([]); g.lineDashOffset = 0;
    if(k) g.clearRect(0, 0, TAM, TAM);
    g.setTransform(res, 0, 0, -res, -x0 * res, y1 * res);
    const perto = (M) => R.pista.pedacos.filter(p => p.x1 > x0 - M && p.x0 < x1 + M && p.y1 > y0 - M && p.y0 < y1 + M);
    const vis = perto(4);
    /* o desenho pensa que a câmera está no meio do bloco e vê só ele */
    const Rt = Object.create(R);
    Rt.cam = { x: (x0 + x1) / 2, y: (y0 + y1) / 2, z: res, ang: 0, ok: true };
    Rt.raio = w / 2;
    const mb = 18 / res;
    Rt.visivel = (a, c, d, e) => d > x0 - mb && a < x1 + mb && e > y0 - mb && c < y1 + mb;
    Rt.bloco = { x0, y0, x1, y1, res, n, k };
    Rt.visLargo = perto(110);
    if(k === 0) C2D.Render.estatico(g, Rt, vis);
    else C2D.Cenario.andar(g, Rt, vis, k);
    let img;
    if(tela.transferToImageBitmap) img = tela.transferToImageBitmap();
    else { img = tela; st.telas[q] = null; st.gs[q] = null; }
    st.tempo += agora() - t0; st.pintados++; st.reais++;
    return { img, x: x0, y: y1, w, k, n };
  }

  C2D.Camadas = {
    NIVEIS, TAM,
    criar(R){
      if(!novo(1, 1)) return null;
      /* os blocos da corrida anterior não servem mais */
      if(ultimo) C2D.Camadas.limpar(ultimo);
      const st = { blocos: new Map(), nivel: -1, troca: -999, quadro: 0, max: 64, telas: [null, null], gs: [null, null], t0: 0, feitos: 0, tempo: 0, pintados: 0, falhou: false,
                   fila: [], agendado: false, noQuadro: 0, usados: 0, reais: 0, telaS: null, gS: null, niveis: NIVEIS.slice(), base: 0, zdAnt: 0,
                   camAnt: null, px: 0, py: 0, longe: 1e12, dtq: 0 };
      ultimo = st;
      return st;
    },
    limpar(st){
      if(!st) return;
      for(const bl of st.blocos.values()) if(bl.img && bl.img.close) try { bl.img.close(); } catch(e){}
      st.blocos.clear(); st.nivel = -1; st.reais = 0;
    },
    /* as sombras de um bloco do chão: quem desenha (fn) pinta formas cheias numa tela à parte; aqui elas
       viram uma cor só, são desfocadas e escurecem o chão de uma vez (sombra sobre sombra não soma) */
    sombra(ctx, R, forca, fn){
      const st = R.cam2, b = R.bloco; if(!st || !b) return false;
      const M = 24, T2 = TAM + 2 * M;
      if(!st.telaS){ st.telaS = novo(T2, T2); st.gS = st.telaS.getContext('2d'); }
      const g = st.gS;
      g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.setLineDash([]); g.clearRect(0, 0, T2, T2);
      g.setTransform(b.res, 0, 0, -b.res, -b.x0 * b.res + M, b.y1 * b.res + M);
      fn(g);
      g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-in'; g.fillStyle = 'rgb(10,16,40)'; g.fillRect(0, 0, T2, T2);
      g.globalCompositeOperation = 'source-over';
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = forca;
      if('filter' in ctx) ctx.filter = 'blur(' + Math.max(.6, Math.min(4.5, b.res * .1)).toFixed(1) + 'px)';
      ctx.drawImage(st.telaS, -M, -M);
      ctx.restore();
      return true;
    },
    /* começa o quadro: escolhe o nível e zera a verba de pintura */
    comecar(R){
      const st = R.cam2, v = R.vista;
      st.dtq = st.t0 ? (agora() - st.t0) / 1000 : 0;
      st.quadro++; st.t0 = agora(); st.feitos = 0; st.fila.length = 0; st.usados = 0;
      /* para onde a câmera está indo: o ponto da tela onde o meio dela vai estar daqui a uns 27 quadros.
         Os blocos da borda desse lado são adiantados primeiro; os que ficaram para trás, não */
      { const cam = R.cam, a = st.camAnt, dx = a ? Math.max(-60, Math.min(60, (cam.x - a.x) * 27)) : 0, dy = a ? Math.max(-60, Math.min(60, (cam.y - a.y) * 27)) : 0;
        st.camAnt = { x: cam.x, y: cam.y };
        st.px = v.W / 2 + v.z * (dx * v.cs + dy * v.sn); st.py = v.H / 2 + v.z * (dx * v.sn - dy * v.cs); st.longe = Math.pow(Math.max(v.W, v.H) * .78, 2); }
      /* os níveis desta corrida: o mais fino é o da câmera parada (o mais perto que ela chega com a distância
         escolhida); cada nível abaixo, a metade. Assim a troca de nível só acontece em alta velocidade, quando
         a câmera já subiu bastante, e não a cada curva */
      /* (numa tela enorme os blocos não acompanham a resolução inteira: a memória não cresce sem limite, e o chão
         aparece só um pouco mais macio) */
      const grande = Math.min(1, Math.sqrt(2.8e6 / (v.W * v.H * R.dpr * R.dpr)));
      const topo = Math.max(8, Math.min(112, Math.sqrt(v.W * v.H) / 52 * (R.zoom || 1) * R.dpr / FOLGA * grande));
      if(!st.base || Math.abs(topo - st.base) > st.base * .04){ C2D.Camadas.limpar(st); st.base = topo; st.niveis = [topo / 16, topo / 8, topo / 4, topo / 2, topo]; }
      const N = st.niveis, zd = v.z * R.dpr, n = nivelDe(st, zd), sobe = zd > st.zdAnt + 1e-4, desce = zd < st.zdAnt - 1e-4;
      st.zdAnt = zd;
      if(n !== st.nivel){ if(st.nivel >= 0) st.troca = st.quadro; st.nivel = n; }
      /* o nível para onde a câmera está indo (acelerando, a câmera sobe; freando, desce): os blocos dele vão sendo adiantados */
      st.prox = -1;
      if(sobe && n < N.length - 1 && N[n] * FOLGA * 1.07 * .88 < zd) st.prox = n + 1;
      else if(desce && n > 0 && N[n - 1] * FOLGA * .93 * 1.14 >= zd) st.prox = n - 1;
    },
    /* depois do quadro: no tempo que sobra até o próximo, pinta os blocos da borda (para onde a câmera vai) */
    depois(R){
      const st = R.cam2; if(!st || st.falhou) return;
      /* guarda só os mais usados: o dobro do que a tela mostra e uma folga */
      const alvo = Math.max(36, Math.min(150, Math.round(st.usados * 1.4) + 10));
      if(st.reais > alvo + 12){
        for(const [chave, bl] of st.blocos){ if(st.reais <= alvo) break; if(!bl.vazio){ st.reais--; if(bl.img && bl.img.close) try { bl.img.close(); } catch(e){} } st.blocos.delete(chave); }
      }
      if(st.agendado || !st.fila.length || typeof setTimeout === 'undefined') return;
      st.agendado = true;
      setTimeout(() => C2D.Camadas.adiantar(R), 0);
    },
    adiantar(R, verba){
      const st = R.cam2; if(!st) return 0;
      st.agendado = false;
      if(st.falhou || !st.fila.length) return 0;
      const t0 = agora(); let n = 0;
      st.fila.sort((p, q) => p.d - q.d);
      try {
        /* um bloco por vez; dois quando o monitor é de 60 Hz (sobra mais tempo entre um quadro e outro) */
        while(st.fila.length && n < (st.dtq > .0125 ? 2 : 1) && agora() - t0 < (verba || 6)){
          const f = st.fila.shift();
          if(st.blocos.has(f.chave)) continue;
          const bl = pintar(R, st, f.n, f.k, f.tx, f.ty);
          st.blocos.set(f.chave, bl);
          if(!bl.vazio) n++;
        }
      } catch(e){ st.falhou = true; if(typeof console !== 'undefined') console.warn('Corrida 2D: blocos do chão desligados', e); }
      return n;
    },
    /* desenha o andar k (0 = o chão) com os blocos; s é a escala do andar em volta do ponto de fuga.
       Devolve false se não deu (aí quem chamou desenha do jeito antigo) */
    andar(R, ctx, k, s){
      const st = R.cam2; if(!st || st.falhou) return false;
      try {
        /* os andares de cima são formas largas (copas, telhados): um nível mais grosso basta, e guarda quatro vezes menos */
        const v = R.vista, cam = R.cam, z = v.z, n = k ? Math.max(0, st.nivel - 1) : st.nivel, res = st.niveis[n], lado = MIOLO / res;
        const C = R.rv || cam;
        s = s || 1;
        /* a caixa da tela no mundo (num andar de cima, encolhida pela escala dele) */
        let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
        for(let q = 0; q < 4; q++){
          const ux = (q === 1 || q === 2 ? v.W : 0) - v.ox, uy = (q >= 2 ? v.H : 0) - v.oy;
          let wx = cam.x + (ux * v.cs + uy * v.sn) / z, wy = cam.y - (-ux * v.sn + uy * v.cs) / z;
          if(s !== 1){ wx = C.x + (wx - C.x) / s; wy = C.y + (wy - C.y) / s; }
          if(wx < x0) x0 = wx; if(wx > x1) x1 = wx; if(wy < y0) y0 = wy; if(wy > y1) y1 = wy;
        }
        const meia = lado * z * s * .7072 + 6, larga = meia + lado * z * s * .6;
        const lista = [], faltam = [];
        const tx0 = Math.floor(x0 / lado) - 1, tx1 = Math.floor(x1 / lado) + 1, ty0 = Math.floor(y0 / lado) - 1, ty1 = Math.floor(y1 / lado) + 1;
        for(let ty = ty0; ty <= ty1; ty++) for(let tx = tx0; tx <= tx1; tx++){
          let cx = (tx + .5) * lado, cy = (ty + .5) * lado;
          if(s !== 1){ cx = C.x + (cx - C.x) * s; cy = C.y + (cy - C.y) * s; }
          const vx = cx - cam.x, vy = cy - cam.y, sx = v.ox + z * (vx * v.cs + vy * v.sn), sy = v.oy + z * (vx * v.sn - vy * v.cs);
          if(sx < -larga || sx > v.W + larga || sy < -larga || sy > v.H + larga) continue;
          const fora = sx < -meia || sx > v.W + meia || sy < -meia || sy > v.H + meia;
          const chave = k + ':' + n + ':' + tx + ':' + ty, bl = st.blocos.get(chave);
          const d = (sx - v.ox) * (sx - v.ox) + (sy - v.oy) * (sy - v.oy);
          if(bl){ if(!fora){ st.blocos.delete(chave); st.blocos.set(chave, bl); if(!bl.vazio) lista.push(bl); } }
          else if(fora){ const df = (sx - st.px) * (sx - st.px) + (sy - st.py) * (sy - st.py); if(df < st.longe) st.fila.push({ k, n, tx, ty, chave, d: df }); }
          else faltam.push({ tx, ty, chave, d });
        }
        /* os blocos do nível para onde a câmera vai (só os do meio da tela), depois dos da borda */
        if(st.prox >= 0){
          const n2 = k ? Math.max(0, st.prox - 1) : st.prox, lado2 = MIOLO / st.niveis[n2];
          for(let ty = Math.floor(y0 / lado2); ty <= Math.floor(y1 / lado2); ty++) for(let tx = Math.floor(x0 / lado2); tx <= Math.floor(x1 / lado2); tx++){
            const chave = k + ':' + n2 + ':' + tx + ':' + ty; if(st.blocos.has(chave)) continue;
            let cx = (tx + .5) * lado2, cy = (ty + .5) * lado2;
            if(s !== 1){ cx = C.x + (cx - C.x) * s; cy = C.y + (cy - C.y) * s; }
            const vx = cx - cam.x, vy = cy - cam.y, sx = v.ox + z * (vx * v.cs + vy * v.sn), sy = v.oy + z * (vx * v.sn - vy * v.cs), m2 = lado2 * z * s * .7072;
            if(sx < -m2 || sx > v.W + m2 || sy < -m2 || sy > v.H + m2) continue;
            st.fila.push({ k, n: n2, tx, ty, chave, d: 4e7 + (sx - v.ox) * (sx - v.ox) + (sy - v.oy) * (sy - v.oy) });
          }
        }
        let incompleto = false;
        if(faltam.length){
          faltam.sort((p, q) => p.d - q.d);
          /* a verba: curta no meio da corrida (um bloco por quadro; os outros aparecem no nível anterior
             ou ficam para o quadro seguinte); larga quando a câmera pula para um lugar novo */
          const frio = (lista.length === 0 || faltam.length > 2 * lista.length) && st.quadro - st.troca > 45;
          const verba = frio ? 70 : 4;
          for(const f of faltam){
            /* (no meio da corrida, no máximo dois blocos por quadro: pintar custa tempo da placa de vídeo, não daqui) */
            if(st.feitos >= 1 && (agora() - st.t0 > verba || (!frio && st.feitos >= 2))){ incompleto = true; break; }
            const bl = pintar(R, st, n, k, f.tx, f.ty);
            st.blocos.set(f.chave, bl);
            if(!bl.vazio){ st.feitos++; st.noQuadro++; lista.push(bl); }
          }
        }
        ctx.save();
        if(s !== 1){ ctx.translate(C.x, C.y); ctx.scale(s, s); ctx.translate(-C.x, -C.y); }
        ctx.scale(1, -1);
        ctx.imageSmoothingEnabled = true;
        /* enquanto falta bloco do nível novo, os do nível anterior ficam por baixo */
        if(incompleto){
          const velhos = [];
          for(const bl of st.blocos.values()) if(bl.k === k && bl.n !== n && !bl.vazio && bl.x < x1 && bl.x + bl.w > x0 && bl.y > y0 && bl.y - bl.w < y1) velhos.push(bl);
          velhos.sort((p, q) => p.n - q.n);
          for(const bl of velhos) ctx.drawImage(bl.img, bl.x, -bl.y, bl.w, bl.w);
        }
        for(const bl of lista) ctx.drawImage(bl.img, bl.x, -bl.y, bl.w, bl.w);
        ctx.restore();
        st.usados += lista.length;
        return true;
      } catch(e){
        st.falhou = true;
        if(typeof console !== 'undefined') console.warn('Corrida 2D: blocos do chão desligados', e);
        return false;
      }
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
