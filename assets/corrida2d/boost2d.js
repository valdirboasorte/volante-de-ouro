/* Corrida 2D: o que cada categoria tem de próprio.
   - vácuo e ar sujo (todas): atrás de outro carro na reta o arrasto cai; colado numa curva,
     a asa perde parte da carga. Na NASCAR o vácuo é muito mais forte.
   - DRS (F1 desde 2011, F2 desde 2015, como em Gp.regras): nas zonas de reta antes das
     freadas fortes, a um segundo de quem está à frente, a partir da terceira volta.
   - push-to-pass (IndyCar em misto e rua desde 2009, Stock Car desde 2011): segundos de
     potência extra para gastar na corrida inteira.
   - Attack Mode (Fórmula E desde 2018): passar pela zona de ativação dá potência extra por
     alguns minutos, um número fixo de vezes.
   - energia contada (F1 desde 2014, Fórmula E desde 2018, como em Gp.regras.energia):
     o acelerador gasta, a freada recupera um pouco (Fórmula E); acabou, a potência cai.
   - largada lançada (ovais da IndyCar, NASCAR): o pelotão vem atrás do pace car e a bandeira
     verde é dada quando o líder cruza a linha. */
(function(raiz){
  const C2D = raiz.C2D;
  const { lim } = C2D;

  C2D.Boost = {
    preparar(S, opc){
      const P = S.P, sk = opc.sk, ano = opc.ano, nivel = opc.nivel || 0, reg = S.regras || {};
      const fr = S.fracao || 1;
      S.boost = {
        drs: !!reg.drs, zonasDRS: reg.drs ? C2D.Boost.zonasDRS(P) : [],
        p2p: !P.kart && ((sk === 'indy' && nivel === 0 && ano >= 2009 && !P.oval) || (sk === 'stock' && nivel === 0 && ano >= 2011)) ? { seg: Math.max(25, (sk === 'indy' ? 200 : 100) * fr), ganho: 1.07 } : null,
        attack: sk === 'fe' && nivel === 0 && ano >= 2018 ? { usos: Math.max(1, Math.round(2 * Math.min(1, fr * 2))), dur: Math.max(35, 240 * fr), ganho: 1.12, zona: C2D.Boost.zonaAttack(P) } : null,
        energia: reg.energia && !P.kart ? reg.energia : null,
        vacuo: sk === 'nascar' ? { alcance: 60, ganho: .27 } : P.oval ? { alcance: 50, ganho: .22 } : { alcance: 42, ganho: .2 },
        arSujo: sk === 'f1' && nivel === 0 ? (ano >= 2022 ? .06 : ano >= 1983 ? .16 : .04) : sk === 'indy' ? .1 : .06,
        lancada: (sk === 'nascar' && nivel <= 1) || (sk === 'indy' && P.oval)
      };
      for(const c of S.carros){
        c.drsAberto = false; c.drsPode = false;
        c.p2p = S.boost.p2p ? { resta: S.boost.p2p.seg, ligado: false } : null;
        c.attack = S.boost.attack ? { usos: S.boost.attack.usos, ate: 0, plano: [] } : null;
        if(c.attack && c.ia){ for(let q = 1; q <= c.attack.usos; q++) c.attack.plano.push(Math.max(1, Math.round(S.N * q / (c.attack.usos + 1)))); }
        c.energia = S.boost.energia ? 1 + (S.boost.energia.margem || 0) + (c.ia ? .02 : 0) : null;
        c.dragF = 1; c.potF = 1; c.aeroF = 1;
      }
      /* o gasto de energia de uma volta normal (a referência para o orçamento da corrida) */
      if(S.boost.energia) S.boost.porVolta = C2D.Boost.energiaVolta(P);
    },

    /* as retas antes das freadas fortes (as mesmas zonas de ultrapassagem do motor clássico) */
    zonasDRS(P){
      const out = [];
      for(const z of (P.zonas || [])){
        let j = z.i, comp = 0;
        while(comp < 1300 && Math.abs(P.k[(j - 1 + P.n) % P.n]) < 1 / 500){ j = (j - 1 + P.n) % P.n; comp += P.ds; }
        if(comp >= 260) out.push({ ini: (j * P.ds + 70) % P.L, fim: (z.i * P.ds - 15 + P.L) % P.L, det: (j * P.ds - 40 + P.L) % P.L, comp });
      }
      return out.sort((a, b) => b.comp - a.comp).slice(0, 3);
    },
    zonaAttack(P){
      const z = (P.zonas || [])[Math.floor((P.zonas || []).length / 2)] || { i: Math.floor(P.n / 2) };
      const s = (z.i * P.ds + 60) % P.L;
      return { ini: s, fim: (s + 50) % P.L, lado: P.k[z.i] > 0 ? -1 : 1 };
    },
    dentro(s, ini, fim, L){ const q = ((s - ini) % L + L) % L, comp = ((fim - ini) % L + L) % L; return q <= comp; },
    energiaVolta(P){ return P.Tref * .78; },

    /* antes da física de cada carro */
    antes(S, c, cmd, dt){
      const B = S.boost; if(!B) return cmd;
      const P = S.P, L = P.L;
      c.dragF = 1; c.potF = 1; c.aeroF = 1;
      if(c.estado !== 'pista' || c.box) return cmd;
      const verde = S.estado === 'pista' && !S.sc && !S.vsc;
      /* vácuo e ar sujo: o carro logo à frente, no mesmo trilho */
      let frente = null, gap = Infinity;
      for(const o of S.carros){
        if(o === c || o.fantasma || o.estado === 'fora') continue;
        const ds = ((o.sTot - c.sTot) % L + L * 1.5) % L - L / 2;
        if(ds > 2 && ds < B.vacuo.alcance && Math.abs(o.d - c.d) < 1.8 && ds < gap){ gap = ds; frente = o; }
      }
      if(frente && c.v > 25){
        const f = 1 - gap / B.vacuo.alcance;
        c.dragF *= 1 - B.vacuo.ganho * f * f;
        if(gap < 22) c.aeroF *= 1 - B.arSujo * (1 - gap / 22);
      }
      c.atrasDe = frente; c.gapFrente = gap;
      /* DRS: no ponto de detecção, a um segundo de quem está à frente; abre na zona, fecha na freada */
      const s1 = c.sTot, s0 = c._sb != null ? c._sb : s1; c._sb = s1;
      if(B.drs){
        const cruzou = x => Math.floor((s0 - x) / L) < Math.floor((s1 - x) / L);
        for(const z of B.zonasDRS){
          if(cruzou(z.det)) c.drsPode = verde && c.voltas >= 2 && (S.amb.w || 0) < .3 && frente != null && gap < c.v * 1.0;
          if(cruzou(z.fim)){ c.drsPode = false; c.drsAberto = false; }
        }
        const naZona = B.zonasDRS.some(z => C2D.Boost.dentro(c.s, z.ini, z.fim, L));
        c.drsZona = naZona;
        if(naZona && c.drsPode && (c.ia || cmd.boost || cmd.boostToque || c.drsAberto) && (cmd.freio || 0) < .1) c.drsAberto = true;
        if((cmd.freio || 0) > .1 || !naZona) c.drsAberto = false;
        if(c.drsAberto) c.dragF *= .86;
      }
      /* push-to-pass */
      if(c.p2p){
        if(!c.ia && cmd.boostToque){ c.p2p.ligado = !c.p2p.ligado; }
        if(c.ia) c.p2p.ligado = verde && frente != null && gap < 35 && Math.abs(P.k[c.i]) < 1 / 400 && c.p2p.resta > 0 && (cmd.acel || 0) > .9;
        if(c.p2p.ligado && c.p2p.resta > 0 && (cmd.acel || 0) > .5){ c.potF *= S.boost.p2p.ganho; c.p2p.resta = Math.max(0, c.p2p.resta - dt); }
        if(c.p2p.resta <= 0) c.p2p.ligado = false;
      }
      /* Attack Mode */
      if(c.attack){
        const A = S.boost.attack;
        const naZona = C2D.Boost.dentro(c.s, A.zona.ini, A.zona.fim, L);
        const quer = c.ia ? (c.attack.plano.length && c.voltas + 1 >= c.attack.plano[0]) : cmd.boost;
        if(naZona && quer && c.attack.usos > 0 && S.t > c.attack.ate && verde){
          c.attack.usos--; c.attack.ate = S.t + A.dur; if(c.ia) c.attack.plano.shift();
          S.eventos.push({ t: S.t, tipo: 'attack', a: c.id });
        }
        if(S.t < c.attack.ate) c.potF *= A.ganho;
      }
      /* energia contada */
      if(c.energia != null){
        const porSeg = 1 / (S.boost.porVolta * S.N);
        const gasto = (cmd.acel || 0) * c.potF * porSeg * dt * (c.ia ? .97 : 1);
        const volta = B.energia.tipo === 'bateria' ? (cmd.freio || 0) * porSeg * dt * .22 : 0;
        c.energia = Math.max(0, c.energia - gasto + volta);
        if(c.energia <= 0) c.potF *= B.energia.pane ? .2 : .55;
      }
      return cmd;
    },

    /* a velocidade do pace car (o pelotão encosta nele em fila) */
    vPace(S, c){ return Math.min(S.P.seco.v[c.i] * .62, 40); },
    /* a largada lançada: o pelotão segue o pace car até o líder cruzar a linha */
    lancada(S){
      const lid = S.carros.reduce((a, c) => !a || c.sTot > a.sTot ? c : a, null);
      return lid && lid.sTot < 0;
    },

    /* a meta de energia para o painel: quanto deveria sobrar agora */
    metaEnergia(S, c){
      if(c.energia == null) return null;
      const frac = lim(c.sTot / (S.P.L * S.N), 0, 1);
      return { agora: c.energia, meta: (1 + (S.boost.energia.margem || 0)) * (1 - frac) };
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
