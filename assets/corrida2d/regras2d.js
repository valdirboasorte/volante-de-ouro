/* Corrida 2D: o controle de corrida.
   Largada (cada um sai quando reage às luzes), a ordem na pista, as diferenças pelas
   marcas da volta, as bandeiras (amarela, azul, quadriculada), as punições (limites da
   pista), os abandonos (o azar sorteado antes da corrida, como no motor clássico) e o
   resultado no mesmo formato de Gp.resultado: daí em diante o campeonato faz a conta de
   sempre (Gp.chegada → Engine.runRace), sem nada duplicado. */
(function(raiz){
  const C2D = raiz.C2D;
  const { lim } = C2D;
  const K = 16;   /* marcas por volta para as diferenças */

  /* os níveis dos rivais: competência (ritmo no limite, erros, desvio da linha), nunca o carro do jogador */
  C2D.NIVEIS = {
    facil:   { n: 'Fácil',   ritmo: .952, faixa: .022, erros: .09, ruido: .65, erroFreio: -.06 },
    medio:   { n: 'Médio',   ritmo: .97,  faixa: .018, erros: .055, ruido: .45, erroFreio: -.03 },
    dificil: { n: 'Difícil', ritmo: .984, faixa: .014, erros: .03, ruido: .3, erroFreio: 0 },
    lenda:   { n: 'Lenda',   ritmo: .995, faixa: .009, erros: .015, ruido: .18, erroFreio: 0 }
  };
  /* da dificuldade da carreira para o nível padrão dos rivais na pista */
  C2D.nivelPadrao = () => {
    const d = typeof Engine !== 'undefined' && Engine.difK ? Engine.difK() : 'equilibrado';
    return d === 'tranquilo' ? 'facil' : d === 'realista' ? 'dificil' : 'medio';
  };

  C2D.Corrida = {
    K,
    /* o grid da sessão a partir da entrada do motor (Gp.entrada) ou de uma lista simples.
       ent.carros: [{ id, nome, cor, eq, me, ctrl, grid, ritmo, cons, fora, fracFora }]
       O ritmo de cada rival sai da nota dele no fim de semana (a mesma que o motor usa);
       o azar sorteado (quebra, batida) vira o destino do carro na volta marcada. O jogador
       não tem batida marcada: quem bate é quem dirige. A quebra mecânica vale para todos. */
    montarGrid(ent, opc){
      opc = opc || {};
      const nv = C2D.NIVEIS[opc.nivel] || C2D.NIVEIS.medio;
      const cs = ent.carros.slice().sort((a, b) => a.grid - b.grid);
      const rs = cs.map(c => c.ritmo != null ? c.ritmo : 60), rMax = Math.max(...rs), rMin = Math.min(...rs);
      const N = opc.voltas || 5;
      return cs.map((c, k) => {
        const nota = rMax > rMin ? (c.ritmo - rMin) / (rMax - rMin) : .5;
        const cons = c.cons != null ? c.cons : 60;
        const o = { id: c.id, nome: c.nome, cor: c.cor, eq: c.eq, me: !!(c.me || c.ctrl), grid: c.grid || k + 1, cc: c.cc };
        if(!o.me) o.ia = { ritmo: nv.ritmo + nv.faixa * (nota - .5) * 2, erros: nv.erros * (1.4 - cons / 100), ruido: nv.ruido,
                           erroFreio: nv.erroFreio, agr: c.agr != null ? c.agr : .5, cuidado: .5 };
        if(c.fora && !(o.me && c.fora === 'ACID')) o.destino = { tipo: c.fora, volta: Math.max(1, Math.min(N, Math.ceil((c.fracFora != null ? c.fracFora : .5) * N))) };
        return o;
      });
    },
    /* opc: { voltas, limiteAvisos } ; os carros já estão na sessão com { destino: { tipo, volta } } */
    preparar(S, opc){
      opc = opc || {};
      S.N = Math.max(1, opc.voltas || 5);
      S.limiteAvisos = opc.limiteAvisos != null ? opc.limiteAvisos : 3;
      S.bandeira = null; S.tFim = null; S.acabou = false; S.lider = null;
      S.fl = { t: Infinity, id: null, volta: null };
      for(const c of S.carros){
        c.estado = 'pista'; c.cp = []; c.fim = null; c.penal = 0; c.foraTipo = null; c.foraVolta = null;
        /* a reação às luzes: 0,17 a 0,30 s (o jogador reage com o próprio dedo) */
        c.atraso = c.me ? 0 : .17 + ((C2D.semente('reac:' + c.id + ':' + S.semente) % 1000) / 1000) * .13;
        c.pos = 0;
      }
      S.ordem = S.carros.slice();
    },

    /* antes da física de cada carro: segura quem ainda não reagiu, conduz o destino */
    comando(S, c, cmd){
      if(S.verdeEm != null && c.ia && S.t - S.verdeEm < c.atraso) return { steer: 0, acel: 0, freio: 1 };
      if(c.estado === 'fora') return { steer: 0, acel: 0, freio: 1 };
      if(c.estado === 'chegou'){ if(c.ia) c.ia.ritmo = Math.min(c.ia.ritmo, .55); }
      /* o azar marcado: quebra (perde potência e encosta) ou batida (erro grande numa freada) */
      const dst = c.destino;
      if(dst && !dst.feito && c.estado === 'pista' && c.voltas + 1 >= dst.volta){
        if(dst.tipo === 'MEC'){
          dst.feito = true; c.potencia = .15; S.eventos.push({ t: S.t, tipo: 'quebra', a: c.id, volta: c.voltas + 1 });
        } else if(c.ia && c.v > 25 && Math.abs(S.P.k[c.i]) > 1 / 120){
          dst.feito = true; dst.em = S.t; c.r += (S.P.k[c.i] > 0 ? 1 : -1) * 1.6; c.ia.errandoAte = c.ia.t + 4; c.ia.erroBase += .6;
          S.eventos.push({ t: S.t, tipo: 'erro', a: c.id, volta: c.voltas + 1 });
        }
      }
      /* a batida marcada termina fora da corrida, mesmo que o carro tenha rodado sem bater */
      if(dst && dst.feito && dst.tipo === 'ACID' && c.estado === 'pista' && (c.v < 8 || S.t - dst.em > 5)) C2D.Corrida.abandonar(S, c, 'ACID');
      if(c.potencia != null && c.potencia < 1 && c.ia && c.estado === 'pista'){
        /* encosta do lado de fora e para */
        c.ia.alvoD = (c.d >= 0 ? 1 : -1) * (S.P.meia + 2.5);
        if(Math.abs(c.d) > S.P.meia - c.sp.larg / 2 - .8) cmd = { steer: cmd.steer, acel: 0, freio: .6 };
        if(c.v < 3) C2D.Corrida.abandonar(S, c, 'MEC');
      }
      return cmd;
    },

    abandonar(S, c, tipo){
      if(c.estado === 'fora') return;
      c.estado = 'fora'; c.foraTipo = tipo || 'ACID'; c.foraVolta = c.voltas + 1; c.fantasma = true; c.foraT = S.t;
      S.eventos.push({ t: S.t, tipo: 'abandono', a: c.id, motivo: c.foraTipo, volta: c.voltas + 1 });
      if(c.foraTipo === 'ACID' && C2D.Boxes && S.regras) C2D.Boxes.incidente(S, c);
    },

    /* depois da física: marcas de tempo, chegada, punições, ordem */
    depois(S, dt){
      const P = S.P, L = P.L;
      for(const c of S.carros){
        if(c.estado === 'fora') continue;
        /* marcas da volta (as diferenças da torre saem delas) */
        if(c.sTot > 0){
          const idx = Math.floor(c.sTot / (L / K));
          while(c.cp.length <= idx) c.cp.push(S.t);
        }
        /* chegada: com a bandeirada, quem cruza a linha termina */
        if(c.estado === 'pista' && c.ini != null && c.voltas > 0){
          if(S.bandeira !== 'quadriculada' && c.voltas >= S.N){
            S.bandeira = 'quadriculada'; S.tFim = S.t; S.eventos.push({ t: S.t, tipo: 'bandeirada', a: c.id });
          }
          if(S.bandeira === 'quadriculada' && c.voltaFeita !== c.voltas){
            c.estado = 'chegou'; c.fim = c.ini; c.voltaFeita = c.voltas; c.fantasma = true;
            S.eventos.push({ t: S.t, tipo: 'chegada', a: c.id, pos: null });
            /* depois da bandeirada o jogador vai devagar até os boxes, no piloto automático */
            if(c.me){ c.ia = c.ia || C2D.IA.criar({ ritmo: .5 }); c.ia.ritmo = .5; c.autopiloto = true; }
          }
        }
        c.voltaFeita = c.voltas;
        /* volta mais rápida (válida) */
        if(c.melhor < S.fl.t){ S.fl = { t: c.melhor, id: c.id, volta: c.voltas }; }
        /* limites da pista: três avisos, depois 5 segundos a cada vez */
        const devidas = Math.max(0, c.avisos - S.limiteAvisos);
        while((c.avisosPunidos || 0) < devidas){
          c.avisosPunidos = (c.avisosPunidos || 0) + 1; c.penal += 5;
          S.eventos.push({ t: S.t, tipo: 'punicao', a: c.id, seg: 5, motivo: 'limites' });
        }
        /* batida que deixou o carro parado ou destruído: abandono */
        if(c.dano >= .85 || (c.destino && c.destino.feito && c.destino.tipo === 'ACID' && c.v < 2 && c.parado > 1.2)) C2D.Corrida.abandonar(S, c, 'ACID');
      }
      /* fim: todos chegaram, ou um minuto e meio depois do vencedor */
      if(S.bandeira === 'quadriculada' && !S.acabou){
        const rodando = S.carros.some(c => c.estado === 'pista');
        if(!rodando || S.t - S.tFim > 90) S.acabou = true;
      }
      const antes = new Map(S.ordem.map(c => [c, c.pos]));
      S.ordem = C2D.Corrida.ordem(S);
      S.ordem.forEach((c, k) => c.pos = k + 1);
      S.lider = S.ordem[0];
      /* ultrapassagem do jogador sob safety car: 5 segundos */
      if((S.sc || S.vsc) && S.eu && S.eu.estado === 'pista' && !S.eu.box){
        const eu = S.eu, a = antes.get(eu);
        if(a && eu.pos < a){
          const passados = S.ordem.filter(o => o !== eu && o.pos > eu.pos && antes.get(o) < a && o.estado === 'pista' && !o.box);
          if(passados.length && !(eu.ultPunSC > S.t - 4)){ eu.ultPunSC = S.t; eu.penal += 5; S.eventos.push({ t: S.t, tipo: 'punicao', a: eu.id, seg: 5, motivo: 'sc' }); }
        }
      }
    },

    /* a ordem: quem chegou (mais voltas, menos tempo com punição), quem roda (pela distância),
       quem abandonou (quem foi mais longe na frente) — a mesma de Gp.ordem */
    ordem(S){
      const peso = c => c.estado === 'chegou' ? 0 : c.estado === 'pista' ? 1 : 2;
      return S.carros.slice().sort((a, b) => peso(a) - peso(b)
        || (a.estado === 'chegou' && b.estado === 'chegou' ? (b.voltas - a.voltas) || ((a.fim + a.penal) - (b.fim + b.penal)) : b.sTot - a.sTot));
    },

    /* a torre: posição, diferença para o líder e para o da frente */
    torre(S){
      const ord = S.ordem, L = S.P.L, lider = ord[0];
      return ord.map((c, k) => {
        const l = { c, pos: k + 1, dif: '', int: '' };
        if(c.estado === 'fora'){ l.dif = 'ABD'; return l; }
        if(k === 0){ l.dif = c.estado === 'chegou' ? 'Venceu' : 'Líder'; return l; }
        const atras = Math.floor((lider.sTot - c.sTot) / L);
        if(c.estado === 'chegou' && lider.estado === 'chegou'){
          const dv = lider.voltas - c.voltas;
          l.dif = dv >= 1 ? '+' + dv + (dv > 1 ? ' voltas' : ' volta') : '+' + Math.max(0, (c.fim + c.penal) - (lider.fim + lider.penal)).toFixed(1);
          return l;
        }
        if(atras >= 1){ l.dif = '+' + atras + (atras > 1 ? ' voltas' : ' volta'); return l; }
        const i = c.cp.length - 1;
        if(i >= 0 && lider.cp[i] != null) l.dif = '+' + Math.max(0, c.cp[i] - lider.cp[i]).toFixed(1);
        const fr = ord[k - 1];
        if(fr && i >= 0 && fr.cp[i] != null && fr.estado !== 'fora') l.int = '+' + Math.max(0, c.cp[i] - fr.cp[i]).toFixed(1);
        return l;
      });
    },

    /* ── o resultado, no formato de Gp.resultado ── */
    resultado(S){
      const ord = S.ordem, lider = ord[0];
      const fl = S.fl.id != null ? S.carros.find(c => c.id === S.fl.id) : null;
      return {
        ordem: ord.map(c => ({ id: c.id, fora: c.estado === 'fora' ? (c.foraTipo || 'MEC') : null, voltas: c.voltas,
          fim: c.fim != null ? c.fim + c.penal : null, paradas: c.paradas || 0, penal: c.penal, melhor: isFinite(c.melhor) ? c.melhor : null,
          pneus: c.pneus || ['M'], fracFora: c.estado === 'fora' ? Math.min(.99, (c.foraVolta || 1) / S.N) : null })),
        flId: fl ? fl.id : null, fl: fl ? { nome: fl.nome, t: S.fl.t, volta: S.fl.volta } : null,
        sc: !!S.houveSC, N: S.N, condensada: !!S.condensada, tv: lider && lider.fim != null ? lider.fim + lider.penal : S.t,
        eventos: S.eventos.slice(), choveu: !!S.choveu, ordemEquipe: null, modo: '2d'
      };
    },
    /* o que a corrida do seu carro teve, nas palavras do resumo (como Gp.notasDe) */
    notasDe(S, id){
      const c = S.carros.find(x => x.id === id); if(!c) return [];
      const out = [];
      if(c.voltasInvalidas || S.eventos.some(e => e.a === id && e.tipo === 'voltouPista')) out.push('escorregao');
      if(c.estado === 'fora') out.push(c.foraTipo === 'ACID' ? 'erro' : 'mecanica');
      return out;
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
