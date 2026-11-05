/* Corrida 2D: o piloto da IA.
   Dirige o mesmo carro, com a mesma física e a mesma aderência do jogador: mira um ponto
   da trajetória ideal à frente (mais longe quanto mais rápido) e acelera ou freia para a
   velocidade possível ali, vezes o ritmo do piloto. Ninguém tem aderência extra nem
   puxão de elástico. A dificuldade muda a competência (ritmo, erro no ponto de freada,
   desvio da linha, chance de errar), nunca o carro do jogador. */
(function(raiz){
  const C2D = raiz.C2D;
  const { lim } = C2D;

  C2D.IA = {
    /* opc: { ritmo (fração do limite, 0.9..1), erroFreio (m), ruido (m), semente } */
    criar(opc){
      opc = opc || {};
      return { ritmo: opc.ritmo != null ? opc.ritmo : 1, erroFreio: opc.erroFreio || 0, erroBase: opc.erroFreio || 0, ruido: opc.ruido || 0,
               erros: opc.erros || 0, agr: opc.agr != null ? opc.agr : .5, cuidado: opc.cuidado != null ? opc.cuidado : .5,
               rnd: C2D.rng(opc.semente || 1), desvio: 0, desvioAlvo: 0, troca: 0, alvoD: null,
               lado: 0, ladoAte: 0, voltaVista: -1, errarEm: null, errandoAte: 0, t: 0 };
    },

    /* ── o tráfego: quem está à frente, ao lado e atrás ──
       Devolve { lado: deslocamento lateral pedido ou null, vMax: teto de velocidade,
       freiaPara: { gap, v } do carro à frente que não dá para passar } */
    trafego(ia, c, P, amb, rumo){
      const out = { lado: null, vMax: Infinity, segue: null, min: null, max: null };
      const lista = amb && amb.carros; if(!lista) return out;
      const L = P.L, v = c.v, meia = P.meia, wc = c.sp.larg;
      /* o corredor por onde o carro vai passar: de onde está até onde quer ir */
      const dIr = rumo != null ? rumo : c.d, cLo = Math.min(c.d, dIr), cHi = Math.max(c.d, dIr);
      let frente = null, gF = Infinity;
      for(const o of lista){
        if(o === c || o.fantasma) continue;
        const ds = o.sTot - c.sTot;
        const dsp = ((ds % L) + L * 1.5) % L - L / 2;           /* distância na pista, de -L/2 a L/2 */
        const voltas = Math.round((ds - dsp) / L);               /* voltas de diferença na corrida */
        const dd = o.d - c.d, folgaLat = (o.sp.larg + wc) / 2;
        const meioComp = (o.sp.comp + c.sp.comp) / 2;
        /* ao lado: não fecha a porta, deixa um carro de espaço */
        if(Math.abs(dsp) < meioComp + 1.2 && Math.abs(dd) < folgaLat + 1.6){
          if(dd > 0) out.max = Math.min(out.max == null ? Infinity : out.max, o.d - folgaLat - .45);
          else out.min = Math.max(out.min == null ? -Infinity : out.min, o.d + folgaLat + .45);
        }
        /* à frente, no caminho (no corredor entre onde está e para onde vai) */
        const noCaminho = o.d + folgaLat + .4 > cLo && o.d - folgaLat - .4 < cHi;
        if(dsp > 0 && dsp < 70 && noCaminho){
          const g = dsp - meioComp;
          if(g < gF){ gF = g; frente = { o, g, voltas }; }
        }
        /* atrás, uma volta na frente: bandeira azul, sai da linha */
        if(dsp < 0 && dsp > -40 && voltas >= 1 && o.v > v - 2) out.azul = o;
      }
      if(out.azul){
        const lin = P.linha.e[c.i];
        out.lado = -Math.sign(lin || 1) * (meia - wc / 2 - .4);
        out.vMax = v * .985;
      }
      ia.t += C2D.DT;
      if(frente){
        const o = frente.o, g = frente.g;
        const lapeado = frente.voltas <= -1;
        /* carro rodado ou muito lento à frente: desvia já para o lado com mais espaço e freia */
        const relO = Math.abs(C2D.ang(o.psi - P.hd[o.i]));
        if(g < Math.max(30, v * 1.8) && (relO > .6 || o.v < v * .55) && v > 12){
          const espE = meia - (o.d + o.sp.larg / 2 + .3), espD = (o.d - o.sp.larg / 2 - .3) + meia;
          const lado = espE > espD ? 1 : -1;
          out.lado = o.d + lado * (o.sp.larg / 2 + wc / 2 + .9 + Math.min(2.5, relO * 1.2));
          ia.lado = lado; ia.ladoAte = ia.t + 1.5;
          out.segue = { g: g - 4, v: Math.max(0, o.v) };
          return out;
        }
        const quero = (P.seco.v[c.i] * ia.ritmo / (c.k || 1));
        const maisRapido = quero > o.v + .6 || v > o.v + 1.5 || lapeado;
        /* escolhe o lado: por dentro da próxima curva, se couber; senão onde há mais espaço */
        if(maisRapido && !amb.semPassar && g < 28 && (ia.lado === 0 || ia.t > ia.ladoAte)){
          let curva = 0; for(let q = 0; q < 30; q++) curva += P.linha.k[(c.i + q * 2) % P.n];
          const espE = meia - (o.d + o.sp.larg / 2), espD = (o.d - o.sp.larg / 2) + meia, preciso = wc + .45;
          const dentro = curva > 0 ? 1 : -1;
          let lado = 0;
          if((dentro > 0 ? espE : espD) >= preciso) lado = dentro;
          else if(Math.max(espE, espD) >= preciso) lado = espE > espD ? 1 : -1;
          if(lado){ ia.lado = lado; ia.ladoAte = ia.t + 2.5 + ia.rnd() * 1.5; }
        }
        if(ia.lado && ia.t <= ia.ladoAte && (maisRapido || g < 4)) out.lado = o.d + ia.lado * (o.sp.larg / 2 + wc / 2 + .55);
        else ia.lado = 0;
        /* enquanto a traseira dele estiver no caminho, não encosta: freia para ele */
        /* no vácuo quem vem atrás chega mais depressa: a distância de seguir cresce com a aproximação */
        const fecha = Math.max(0, v - o.v);
        const gapMin = 2.5 + v * (.1 + .08 * ia.cuidado) * (ia.lado ? .6 : 1) + fecha * .35;
        out.segue = { g: g - gapMin, v: o.v };
        if(g < gapMin) out.vMax = Math.min(out.vMax, Math.max(0, o.v - (gapMin - g) * .6));
      } else if(ia.t > ia.ladoAte) ia.lado = 0;
      return out;
    },

    /* os erros: a cada volta, uma chance de errar a freada de uma curva (passar do ponto) */
    errar(ia, c, P){
      if(c.voltas !== ia.voltaVista){
        ia.voltaVista = c.voltas;
        if(ia.erros > 0 && P.zonas && P.zonas.length && ia.rnd() < ia.erros){
          const z = P.zonas[Math.floor(ia.rnd() * P.zonas.length)];
          ia.errarEm = (z.i * P.g.ds) % P.L;
        } else ia.errarEm = null;
      }
      if(ia.errarEm != null){
        const ate = ((ia.errarEm - c.s) % P.L + P.L) % P.L;
        if(ate < 140 && ate > 60){ ia.errandoAte = ia.t + 3.5; ia.errarEm = null; ia.errou = (ia.errou || 0) + 1; }
      }
      ia.erroFreio = ia.t < ia.errandoAte ? ia.erroBase + .32 : ia.erroBase;
    },

    /* devolve o comando deste passo para o carro c */
    comandar(ia, c, P, amb){
      const L = P.linha, n = P.n, v = c.v, sp = c.sp;
      const w = (amb && amb.w) || 0;
      /* o desvio da linha: um pouco de ruído, que muda devagar */
      if(ia.ruido > 0){
        ia.troca -= C2D.DT;
        if(ia.troca <= 0){ ia.troca = 1.5 + ia.rnd() * 2.5; ia.desvioAlvo = (ia.rnd() * 2 - 1) * ia.ruido; }
        ia.desvio += (ia.desvioAlvo - ia.desvio) * C2D.DT * .8;
      }
      C2D.IA.errar(ia, c, P);
      /* ── volante: o ponto à frente na linha ── */
      const Ld = (ia.Ld0 != null ? ia.Ld0 : 5) + (ia.LdK != null ? ia.LdK : .3) * v;
      const ia0 = c.i, passos = Math.max(1, Math.round(Ld / P.ds));
      const j = (ia0 + passos) % n;
      let alvoLado = L.e[j] + ia.desvio;
      /* na largada cada um segura a sua faixa e só depois procura a trajetória */
      if(c.voltas === 0 && c.dLargada != null && c.sTot < 380){
        const f = lim((c.sTot + 60) / 440, 0, 1);
        alvoLado = C2D.mix(c.dLargada, alvoLado, f * f);
      }
      if(ia.alvoD != null) alvoLado = ia.alvoD;
      const tr = C2D.IA.trafego(ia, c, P, amb, alvoLado);
      if(tr.lado != null) alvoLado = tr.lado;
      if(tr.max != null) alvoLado = Math.min(alvoLado, tr.max);
      if(tr.min != null) alvoLado = Math.max(alvoLado, tr.min);
      /* fora da trajetória ideal a curva dá menos: um pouco mais de calma */
      const foraLinha = Math.abs(alvoLado - L.e[j]);
      alvoLado = lim(alvoLado, -(P.meia - sp.larg / 2 - .25), P.meia - sp.larg / 2 - .25);
      const tx = P.x[j] + P.nx[j] * alvoLado, ty = P.y[j] + P.ny[j] * alvoLado;
      const dx = tx - c.x, dy = ty - c.y;
      const cs = Math.cos(c.psi), sn = Math.sin(c.psi);
      const lx = dx * cs + dy * sn, ly = -dx * sn + dy * cs;
      const d2 = Math.max(4, lx * lx + ly * ly);
      const kap = 2 * ly / d2;
      /* a curvatura pedida vira esterço, com amortecimento do giro (sem zigue-zague) */
      let delta = Math.atan(sp.L * kap) + .06 * (kap * v - c.r);
      /* traseira escorregando: contra-esterça, as rodas da frente para onde o carro vai */
      const solta = Math.abs(c.ar) / (sp.apR || sp.ap);
      const vai = Math.atan2(c.vy + sp.a * c.r, Math.max(1, c.vx));
      if(solta > 1.05 && v > 4) delta = C2D.mix(delta, vai, Math.min(.85, (solta - 1.05) * .9));
      /* e não vira além do que o pneu da frente segura: passar do pico só arrasta */
      if(v > 5) delta = lim(delta, vai - sp.ap * (ia.pico || 1.05), vai + sp.ap * (ia.pico || 1.05));
      const dmax = C2D.Carro.dmax(c, v, 1 - .2 * w);
      const steer = lim(delta / Math.max(.01, dmax), -1, 1);

      /* ── pedais ──
         Acelera até a velocidade possível aqui; freia quando a desaceleração necessária
         para chegar à velocidade possível mais adiante encosta na que o carro tem.
         O erro no ponto de freada (dificuldade) é um engano nessa conta. */
      const prof = w > .3 ? P.molhado.v : P.seco.v;
      const kk = ia.ritmo / (c.k || 1) * (1 - Math.min(.06, foraLinha * .012)) * (c.potencia != null && c.potencia < 1 ? .5 : 1);
      const lead = Math.max(1, Math.round(v * .05 / P.ds));
      const vAqui = Math.min(prof[(ia0 + lead) % n] * kk * Math.sqrt(c.aderPneu || 1), tr.vMax, c.teto || Infinity);
      const capFreio = C2D.G * (sp.b0 * (1 - .18 * w) + 1.1 * sp.aero * v * v) * .9 * (1 + (ia.erroFreio || 0));
      let pede = 0;
      const alcance = Math.min(n - 1, Math.ceil((v * v / (2 * Math.max(5, capFreio * .6)) + 10) / P.ds));
      for(let q = 1; q <= alcance; q++){
        const vp = prof[(ia0 + q) % n] * kk * Math.sqrt(c.aderPneu || 1);
        if(vp >= v) continue;
        const a = (v * v - vp * vp) / (2 * Math.max(.5, q * P.ds - v * .03));
        if(a > pede) pede = a;
      }
      /* o carro à frente que não dá para passar também é um ponto de freada */
      if(tr.segue && tr.segue.v < v){
        const a = (v * v - tr.segue.v * tr.segue.v) / (2 * Math.max(.6, tr.segue.g));
        if(a > pede) pede = a;
      }
      let acel = 0, freio = 0;
      if(pede > capFreio * .93) freio = lim((pede / capFreio - .93) * 6 + .55, 0, 1);
      else if(v > vAqui * 1.004 + .15) freio = lim((v - vAqui) * .35, 0, 1);
      else if(v < vAqui - .3) acel = lim(.6 + (vAqui - v) * .4, 0, 1);
      else acel = .4;
      /* freada e curva dividem o pneu: virando muito, freia menos (como faz um piloto) */
      if(freio > 0){
        const latCap = C2D.G * (sp.mu * (1 - .2 * w) + sp.banco + sp.aero * v * v);
        const uso = Math.min(.95, Math.abs(c.ay) / Math.max(1, latCap));
        freio = Math.min(freio, Math.sqrt(1 - uso * uso));
        /* a traseira começando a escapar na freada: solta o pedal antes que o carro rode */
        if(solta > .75) freio *= lim(1.75 - solta, .2, 1);
      }
      /* escorregando de traseira: alivia o pé */
      if(solta > 1.1) acel *= .5;
      /* saindo de frente (o volante já no limite do pneu): tira o pé, o peso vai para a frente */
      if(v > 5 && Math.abs(c.af) >= sp.ap * .98 && freio === 0) acel = Math.min(acel, Math.abs(c.af) > sp.ap * 1.2 ? 0 : .15);
      return { steer, acel, freio };
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
