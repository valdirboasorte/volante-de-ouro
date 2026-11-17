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
     verde é dada quando o líder cruza a linha.
   - a inovação de cada época da F1 (2026-11-12), para o piloto se acostumar ao regulamento:
       turbo (1977-1988, quem tinha): segurar Q sobe a pressão, mais potência, mais consumo,
         e o motor esquenta; passou do ponto, perde potência até esfriar;
       KERS (2009 McLaren, Ferrari, Renault e BMW; 2011-2013 todos): 6,7 s de potência extra por volta;
       duto F (2010): segurar Shift na reta corta o arrasto; aberto numa curva, a traseira solta;
       DRS só de 2011 a 2025;
       ERS (2014-2025): bateria que carrega nas freadas e um limite de uso por volta;
       2026 em diante: aero ativa nas retas (Shift), ERS mais forte (Q) e o Modo Ultrapassagem
         (a menos de 1 s do carro da frente na detecção, energia extra).
     A IA usa as mesmas ferramentas. */
(function(raiz){
  const C2D = raiz.C2D;
  const { lim } = C2D;

  C2D.Boost = {
    preparar(S, opc){
      const P = S.P, sk = opc.sk, ano = opc.ano, nivel = opc.nivel || 0, reg = S.regras || {};
      const fr = S.fracao || 1;
      S.boost = {
        drs: !!reg.drs && !(sk === 'f1' && nivel === 0 && ano >= 2026), zonasDRS: reg.drs ? C2D.Boost.zonasDRS(P) : [],
        era: C2D.Boost.era(sk, ano, nivel, P),
        p2p: !P.kart && ((sk === 'indy' && nivel === 0 && ano >= 2009 && !P.oval) || (sk === 'stock' && nivel === 0 && ano >= 2011)) ? { seg: Math.max(25, (sk === 'indy' ? 200 : 100) * fr), ganho: 1.07 } : null,
        attack: sk === 'fe' && nivel === 0 && ano >= 2018 ? { usos: Math.max(1, Math.round(2 * Math.min(1, fr * 2))), dur: Math.max(35, 240 * fr), ganho: 1.12, zona: C2D.Boost.zonaAttack(P) } : null,
        energia: reg.energia && !P.kart ? reg.energia : null,
        /* o vácuo: até onde ele chega (no mínimo; em velocidade, cerca de um segundo) e quanto do arrasto some colado */
        vacuo: sk === 'nascar' ? { alcance: 70, ganho: .42 } : P.oval ? { alcance: 60, ganho: .36 } : P.kart ? { alcance: 22, ganho: .2 } : { alcance: 48, ganho: .32 },
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
        const E = S.boost.era;
        c.kers = E.kers && (!E.kers.so2009 || /mclaren|ferrari|renault|bmw/i.test(c.eq || '')) ? { resta: E.kers.seg, volta: -1, ligado: false } : null;
        c.ers = E.ers ? { bat: .85, resta: E.ers.porVolta, volta: -1, ligado: false } : null;
        c.turbo = E.turbo && C2D.Boost.temTurbo(c.eq, ano) ? { calor: 0, quente: false, ligado: false } : null;
        c.fduct = !!E.fduct; c.aero26 = !!E.aero26;
      }
      if(S.boost.era.overtake) S.boost.zonasOT = C2D.Boost.zonasDRS(P);
      /* o gasto de energia de uma volta normal (a referência para o orçamento da corrida) */
      if(S.boost.energia) S.boost.porVolta = C2D.Boost.energiaVolta(P);
    },

    /* a inovação da época no carro (só a F1, categoria principal) */
    era(sk, ano, nivel, P){
      const f1 = sk === 'f1' && nivel === 0 && !(P && P.kart);
      return {
        turbo: f1 && ano >= 1977 && ano <= 1988 ? { ganho: 1.1, esquenta: 1 / 11, esfria: 1 / 18 } : null,
        kers: f1 && (ano === 2009 || (ano >= 2011 && ano <= 2013)) ? { seg: 6.7, ganho: 1.09, so2009: ano === 2009 } : null,
        fduct: f1 && ano === 2010,
        ers: f1 && ano >= 2014 ? (ano >= 2026 ? { ganho: 1.17, gasta: 1 / 24, colhe: .09, porVolta: 40 } : { ganho: 1.11, gasta: 1 / 30, colhe: .07, porVolta: 33 }) : null,
        aero26: f1 && ano >= 2026,
        overtake: f1 && ano >= 2026
      };
    },
    /* quem tinha motor turbo: a Renault desde 1977, a Ferrari e a Toleman desde 1981, a Brabham desde 1982;
       de 1983 a 1986 quase todos; em 1987 e 1988, com o turbo limitado, só parte do grid */
    temTurbo(eq, ano){
      const e = String(eq || '').toLowerCase();
      if(ano < 1977 || ano > 1988) return false;
      if(ano <= 1980) return /renault/.test(e);
      if(ano <= 1982) return /renault|ferrari|toleman/.test(e) || (ano === 1982 && /brabham/.test(e));
      if(ano <= 1986) return !(/tyrrell/.test(e) && ano <= 1984);
      return /ferrari|mclaren|lotus|arrows|zakspeed|brabham|ligier|osella/.test(e) || (ano === 1987 && /williams|benetton/.test(e));
    },
    /* o que o painel diz antes da largada: a ferramenta da época e a tecla */
    dica(S){
      const B = S.boost; if(!B) return '';
      const c = S.eu || {}, E = B.era || {}, partes = [];
      if(c.turbo) partes.push('Turbo: segure Q (ou toque em TURBO) para subir a pressão. Mais potência e mais consumo; o motor esquenta');
      if(c.kers) partes.push('KERS: segure Q (ou toque em KERS) para 6,7 s de potência extra por volta');
      if(c.fduct) partes.push('Duto F: segure Shift nas retas para cortar o arrasto. Feche antes da curva, ou a traseira solta');
      if(B.drs) partes.push('DRS: a menos de 1 s do carro da frente na detecção, aperte Shift (ou toque em DRS) na zona');
      if(c.ers) partes.push('ERS: segure Q (ou toque em ERS) para usar a bateria; ela recarrega nas freadas');
      if(c.aero26) partes.push('Aero ativa: segure Shift nas retas');
      if(E.overtake) partes.push('a menos de 1 s do carro da frente na detecção, o Modo Ultrapassagem dá energia extra');
      return partes.join(' · ');
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
    energiaVolta(P){ return P.Tref * .8; },

    /* antes da física de cada carro */
    antes(S, c, cmd, dt){
      const B = S.boost; if(!B) return cmd;
      const P = S.P, L = P.L;
      c.dragF = 1; c.potF = 1; c.aeroF = 1;
      if(c.estado !== 'pista' || c.box) return cmd;
      const verde = S.estado === 'pista' && !S.sc && !S.vsc;
      /* vácuo e ar sujo: o carro logo à frente. A esteira de ar dele abre com a distância (colado, só
         bem atrás dele; mais longe, dá para pegar meio de lado); o arrasto cai mais quanto mais perto */
      const alc = Math.max(B.vacuo.alcance, c.v * .95);
      let frente = null, gap = Infinity;
      for(const o of S.carros){
        if(o === c || o.fantasma || o.estado === 'fora') continue;
        const ds = ((o.sTot - c.sTot) % L + L * 1.5) % L - L / 2;
        if(ds > 2 && ds < alc && Math.abs(o.d - c.d) < 1.2 + ds * .035 && ds < gap){ gap = ds; frente = o; }
      }
      c.vacuo = 0;
      if(frente && c.v > 22){
        const larg = 1.2 + gap * .035, lat = 1 - .55 * Math.min(1, Math.abs(frente.d - c.d) / larg);
        c.vacuo = Math.pow(1 - gap / alc, 1.15) * lat;
        c.dragF *= 1 - B.vacuo.ganho * c.vacuo;
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
        /* a IA alivia (freio leve) quando passa do perfil de velocidade do carro normal; só a freada de verdade fecha */
        const limFreio = c.ia ? .5 : .1;
        if(naZona && c.drsPode && (c.ia || cmd.boost || cmd.boostToque || c.drsAberto) && (cmd.freio || 0) < limFreio) c.drsAberto = true;
        if((cmd.freio || 0) > limFreio || !naZona) c.drsAberto = false;
        if(c.drsAberto) c.dragF *= .86;
      }
      /* a inovação da época */
      const reta = Math.abs(P.k[c.i] || 0) < 1 / 400, E = B.era || {};
      /* a IA segue um perfil de velocidade do carro normal: na reta, sem freada de verdade, conta como pé no fundo */
      const acel = c.ia ? reta && (cmd.freio || 0) < .5 : (cmd.acel || 0) > .5;
      const ataque = frente != null && gap < 45;
      /* duto F (2010) e aero ativa (2026): abrir na reta corta o arrasto */
      if(c.fduct || c.aero26){
        const quer = c.ia ? reta && verde : !!cmd.boost;
        const aberto = quer && (cmd.freio || 0) < (c.ia ? .5 : .1) && (c.fduct || reta);
        if(c.fduct){ c.fductAberto = aberto; if(aberto){ c.dragF *= .93; if(!reta) c.aeroF *= .8; } }
        else { c.aeroAberto = aberto; if(aberto) c.dragF *= .86; }
      }
      /* KERS: o tanto de cada volta, para gastar quando quiser */
      if(c.kers){
        if(c.kers.volta !== c.voltas){ c.kers.volta = c.voltas; c.kers.resta = E.kers.seg; }
        const quer = c.ia ? reta && (ataque || c.s / L > .55) : !!cmd.ers;
        c.kers.ligado = verde && quer && acel && c.kers.resta > 0;
        if(c.kers.ligado){ c.potF *= E.kers.ganho; c.kers.resta = Math.max(0, c.kers.resta - dt); }
      }
      /* ERS: a bateria carrega na freada; o uso tem limite por volta */
      if(c.ers){
        if(c.ers.volta !== c.voltas){ c.ers.volta = c.voltas; c.ers.resta = E.ers.porVolta; }
        c.ers.bat = Math.min(1, c.ers.bat + (cmd.freio || 0) * dt * E.ers.colhe);
        const quer = c.ia ? reta && (ataque || c.ers.bat > .55) : !!cmd.ers;
        c.ers.ligado = verde && quer && acel && c.ers.bat > 0 && c.ers.resta > 0;
        if(c.ers.ligado){ c.potF *= E.ers.ganho; c.ers.bat = Math.max(0, c.ers.bat - E.ers.gasta * dt); c.ers.resta = Math.max(0, c.ers.resta - dt); }
      }
      /* Modo Ultrapassagem (2026): a menos de 1 s na detecção, a bateria ganha energia */
      if(E.overtake && c.ers && B.zonasOT){
        const cruzouOT = x => Math.floor((s0 - x) / L) < Math.floor((s1 - x) / L);
        for(const z of B.zonasOT) if(cruzouOT(z.det) && verde && c.voltas >= 1 && frente != null && gap < c.v * 1.0){
          c.ers.bat = Math.min(1, c.ers.bat + .2);
          if(c === S.eu) S.avisoDano = { t: S.t, txt: 'Modo Ultrapassagem: energia extra na bateria' };
        }
      }
      /* turbo: mais pressão, mais potência, mais calor */
      if(c.turbo){
        const T = E.turbo;
        const quer = c.ia ? reta && ataque && c.turbo.calor < .6 : !!cmd.ers;
        c.turbo.ligado = verde && quer && acel && !c.turbo.quente;
        if(c.turbo.ligado){ c.potF *= T.ganho; c.turbo.calor = Math.min(1.05, c.turbo.calor + T.esquenta * dt); }
        else c.turbo.calor = Math.max(0, c.turbo.calor - T.esfria * dt);
        if(c.turbo.calor >= 1 && !c.turbo.quente){
          c.turbo.quente = true;
          if(c === S.eu) S.avisoDano = { t: S.t, txt: 'Motor superaquecido: alivie a pressão do turbo' };
        }
        if(c.turbo.quente){ c.potF *= .86; if(c.turbo.calor < .45) c.turbo.quente = false; }
      }
      /* push-to-pass (a IA liga com o pé no fundo; o perfil dela é o do carro normal) */
      if(c.p2p){
        if(!c.ia && cmd.boostToque){ c.p2p.ligado = !c.p2p.ligado; }
        if(c.ia) c.p2p.ligado = verde && frente != null && gap < 35 && reta && c.p2p.resta > 0 && acel;
        if(c.p2p.ligado && c.p2p.resta > 0 && (acel || (cmd.acel || 0) > .5)){ c.potF *= S.boost.p2p.ganho; c.p2p.resta = Math.max(0, c.p2p.resta - dt); }
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
      /* A IA guia por um perfil de velocidade feito para o carro normal: com o DRS, o KERS, o ERS, o turbo,
         o push-to-pass, o Attack Mode, o duto F ou a aero ativa ligados na reta, ela vai de pé no fundo.
         Sem isso o ganho virava freada e a ferramenta não fazia diferença nenhuma. A freada de verdade
         (para a curva, para não bater no da frente) passa de .5 e continua valendo. */
      if(c.ia && reta && (cmd.freio || 0) < .5 && (c.drsAberto || c.fductAberto || c.aeroAberto || (c.kers && c.kers.ligado)
        || (c.ers && c.ers.ligado) || (c.turbo && c.turbo.ligado) || (c.p2p && c.p2p.ligado) || (c.attack && S.t < c.attack.ate)))
        cmd = Object.assign({}, cmd, { acel: 1, freio: 0 });
      /* energia contada */
      if(c.energia != null){
        const porSeg = 1 / (S.boost.porVolta * S.N);
        const gasto = (c.potFrac != null ? c.potFrac : (cmd.acel || 0)) * porSeg * dt * (c.ia ? .97 : 1) * (c.turbo && c.turbo.ligado ? 1.6 : 1);
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
