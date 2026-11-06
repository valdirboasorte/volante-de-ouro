/* Corrida 2D: a sessão (treino, classificação e corrida usam a mesma base).
   Guarda os carros e o relógio, conta voltas e setores com o instante exato da passagem
   (interpolado dentro do passo), marca volta inválida quando o carro sai inteiro da pista
   e põe de volta na pista quem ficou parado de lado ou de ré. Não toca a página. */
(function(raiz){
  const C2D = raiz.C2D;
  const { lim } = C2D;

  C2D.Sessao = {
    /* opc: { trkId, ano, sk, nivel, tipo: 'treino'|'classificacao'|'corrida', carros: [{ id, nome, cor, me, k, ia, assist, grid }] } */
    criar(opc){
      const P = opc.P || C2D.Pista.criar(opc.trkId, opc.ano, { sk: opc.sk, nivel: opc.nivel || 0 });
      const S = { P, tipo: opc.tipo || 'treino', t: 0, passos: 0, amb: { w: opc.w || 0 }, carros: [], eu: null,
                  estado: opc.semLargada ? 'pista' : 'luzes', luzes: 0, verdeEm: null, eventos: [], semente: opc.semente || 1 };
      S.rnd = C2D.rng(S.semente);
      (opc.carros || [{ id: 'ME', me: true }]).forEach((o, k) => {
        const c = C2D.Carro.criar(P, Object.assign({ sk: opc.sk, ano: opc.ano, nivel: opc.nivel || 0, cat: opc.cat }, o));
        const vg = C2D.Pista.vaga(P, o.grid || k + 1);
        C2D.Carro.posicionar(c, P, vg.s, vg.d); c.dLargada = vg.d;
        Object.assign(c, { voltas: 0, ini: null, setor: 0, tSetor: null, setores: [null, null, null], ultSet: [null, null, null], melhorSet: [Infinity, Infinity, Infinity],
                           ultima: null, melhor: Infinity, invalida: false, parado: 0, fora: false, avisos: 0, penal: 0, historico: [] });
        if(o.ia) c.ia = C2D.IA.criar(Object.assign({ semente: C2D.semente(S.semente + ':' + (o.id || k)) }, o.ia));
        if(o.destino) c.destino = Object.assign({}, o.destino);
        if(o.pneuIni) c.pneuIni = o.pneuIni;
        if(o.boxAuto) c.boxAuto = true;
        if(o.pneu0) c.pneu0 = o.pneu0;
        c.eq = o.eq || ''; c.cc = o.cc || '';
        c.num = o.num != null ? o.num : (C2D.semente('num:' + (o.id || k)) % 98) + 2;
        if(o.cor2) c.cor2 = o.cor2;
        if(o.me) S.eu = c;
        S.carros.push(c);
      });
      if(!S.eu) S.eu = S.carros[0];
      S.melhorSet = [Infinity, Infinity, Infinity]; S.melhorVolta = Infinity;
      S.amb.carros = S.carros;
      S.ano = opc.ano;
      S.limitesModo = opc.limites || 'tolerante';
      if(S.tipo === 'corrida') C2D.Corrida.preparar(S, { voltas: opc.voltas, limiteAvisos: S.limitesModo === 'rigoroso' ? 3 : 5, passoPunicao: S.limitesModo === 'rigoroso' ? 1 : 2 });
      if(S.tipo === 'corrida' && C2D.Boxes) C2D.Boxes.preparar(S, Object.assign({ sk: opc.sk, ano: opc.ano, nivel: opc.nivel || 0, fracao: 1, wet: (opc.w || 0) > .3 }, opc.boxes || {}));
      if(opc.clima) S.clima = opc.clima;
      if(S.tipo === 'corrida' && C2D.Boost){
        C2D.Boost.preparar(S, { sk: opc.sk, ano: opc.ano, nivel: opc.nivel || 0 });
        /* largada lançada: sem luzes, o pelotão já rodando atrás do pace car */
        if(S.boost.lancada && !opc.semLargada){
          S.estado = 'lancada';
          for(const c of S.carros){ const v0 = C2D.Boost.vPace(S, c); c.vx = v0; c.atraso = 0; }
        }
      }
      return S;
    },

    /* a largada parada: cinco luzes que acendem uma por segundo e apagam juntas */
    largada(S, dt){
      S.tLuzes = (S.tLuzes || 0) + dt;
      if(S.apagarEm == null) S.apagarEm = 5.2 + S.rnd() * 1.6;
      S.luzes = Math.min(5, Math.floor(S.tLuzes / 1));
      if(S.tLuzes >= S.apagarEm){ S.estado = 'pista'; S.luzes = 0; S.verdeEm = S.t; S.eventos.push({ t: S.t, tipo: 'verde' }); }
    },

    /* um passo de toda a sessão; inp é o comando do jogador */
    passo(S, inp, dt){
      const P = S.P;
      if(S.estado === 'luzes') C2D.Sessao.largada(S, dt);
      if(S.estado === 'lancada' && !C2D.Boost.lancada(S)){ S.estado = 'pista'; S.verdeEm = S.t; S.eventos.push({ t: S.t, tipo: 'verde' }); }
      const largou = S.estado !== 'luzes';
      const lancada = S.estado === 'lancada';
      const corrida = S.tipo === 'corrida';
      /* a chuva que chega e para (o tempo do dia do motor clássico, na escala da corrida 2D) */
      if(S.clima && typeof Gp !== 'undefined'){
        const fr = S.fracao || 1, chuva = Gp.chuvaEm({ clima: S.clima }, S.t / fr);
        S.amb.w += (chuva - S.amb.w) * dt / ((chuva > S.amb.w ? 150 : 520) * fr);
        if(S.amb.w > .3) S.choveu = true;
      }
      /* sob safety car ninguém passa; a IA anda no teto */
      S.amb.semPassar = !!(S.sc || S.vsc || S.estado === 'lancada');
      if(S.regras) for(const c of S.carros) c.teto = S.estado === 'lancada' ? C2D.Boost.vPace(S, c) : (S.sc || S.vsc) && c.estado === 'pista' ? C2D.Boxes.tetoSC(S, c) : Infinity;
      for(const c of S.carros){
        /* quem abandonou e já parou sai da conta */
        if(c.estado === 'fora' && c.v < .3){ c.px = c.x; c.py = c.y; c.ppsi = c.psi; continue; }
        const s0 = c.sTot;
        let cmd;
        if(c === S.eu && !c.autopiloto){
          cmd = inp || { steer: 0, acel: 0, freio: 0 };
          if(c.assist.freioAuto && largou && !c.box && C2D.Assist) cmd = C2D.Assist.freio(S, c, cmd);
        }
        else cmd = c.ia ? C2D.IA.comandar(c.ia, c, P, S.amb) : { steer: 0, acel: 0, freio: 1 };
        /* antes da luz verde o carro fica no freio (o acelerador só faz barulho) */
        if(!largou) cmd = { steer: cmd.steer, acel: 0, freio: 1, giro: cmd.acel };
        else if(corrida){
          if(c === S.eu && inp && inp.uma && inp.uma.boost) cmd = Object.assign({}, cmd, { boostToque: true });
          cmd = C2D.Corrida.comando(S, c, cmd);
          if(S.regras) cmd = C2D.Boxes.comando(S, c, cmd);
          if(S.boost) cmd = C2D.Boost.antes(S, c, cmd, dt);
          /* atrás do pace car: limitador de velocidade para todos, sem ultrapassar */
          if(lancada){ const vp = C2D.Boost.vPace(S, c); if(c.v > vp) cmd = Object.assign({}, cmd, { acel: 0, freio: Math.min(1, (c.v - vp) * .2) }); }
        }
        /* carro destruído (roda arrancada): o piloto só segura o carro até parar */
        if(c.destruido) cmd = { steer: (cmd.steer || 0) * .3, acel: 0, freio: .45 };
        C2D.Carro.passo(c, P, cmd, dt, S.amb);
        if(S.regras) C2D.Boxes.depois(S, c, c.sTot - s0);
        C2D.Sessao.cronometrar(S, c, s0, dt);
        C2D.Sessao.limites(S, c, cmd, dt);
      }
      /* os toques entre carros */
      const toques = C2D.Carro.colisoes(S.carros);
      for(const t of toques){
        const k = t.a < t.b ? t.a + '|' + t.b : t.b + '|' + t.a;
        S.ultToque = S.ultToque || {};
        if(t.v > 3.5 && !(S.ultToque[k] > S.t - 1.5)){ S.ultToque[k] = S.t; S.eventos.push({ t: S.t, tipo: 'toque', a: t.a, b: t.b, v: +t.v.toFixed(1) }); }
      }
      /* o dano de cada batida nas peças, e os destroços */
      if(C2D.Dano) C2D.Dano.processar(S, dt);
      S.t += dt; S.passos++;
      if(corrida){ C2D.Corrida.depois(S, dt); if(S.regras) C2D.Boxes.controle(S); }
    },

    /* passagens pela linha e pelos setores, com o instante exato */
    cronometrar(S, c, s0, dt){
      const P = S.P, L = P.L, s1 = c.sTot;
      if(s1 <= s0) return;
      const marcos = [0, P.setores[0], P.setores[1]];
      for(let k = 0; k < 3; k++){
        const off = marcos[k];
        const a = Math.floor((s0 - off) / L), b = Math.floor((s1 - off) / L);
        if(b <= a) continue;
        const alvo = b * L + off, f = (alvo - s0) / (s1 - s0);
        const tc = S.t + dt * lim(f, 0, 1);
        C2D.Sessao.marco(S, c, k, tc);
      }
    },
    marco(S, c, k, tc){
      if(k === 0){
        /* linha de chegada: fecha o terceiro setor e a volta */
        if(c.ini != null && c.tSetor != null) C2D.Sessao.fecharSetor(S, c, 2, tc - c.tSetor);
        if(c.ini != null){
          const tv = tc - c.ini;
          c.ultima = { t: tv, valida: !c.invalida };
          c.historico.push(c.ultima);
          if(!c.invalida && tv < c.melhor){ c.melhor = tv; S.eventos.push({ t: tc, tipo: 'melhor', a: c.id, tv }); }
          if(!c.invalida && tv < S.melhorVolta){ S.melhorVolta = tv; S.melhorDe = c.id; }
          c.voltas++;
        }
        c.ini = tc; c.tSetor = tc; c.invalida = false; c.setores = [null, null, null];
      } else if(c.tSetor != null){
        C2D.Sessao.fecharSetor(S, c, k - 1, tc - c.tSetor);
        c.tSetor = tc;
      }
    },
    /* a cor de cada setor: roxo (melhor de todos), verde (seu melhor), amarelo */
    fecharSetor(S, c, k, t){
      let cor = 'amarelo';
      if(!c.invalida && t > 0){
        if(t < S.melhorSet[k]){ cor = 'roxo'; S.melhorSet[k] = t; c.melhorSet[k] = t; }
        else if(t < c.melhorSet[k]){ cor = 'verde'; c.melhorSet[k] = t; }
      }
      c.setores[k] = { t, cor }; c.ultSet[k] = { t, cor };
    },

    /* limites da pista e carro parado */
    limites(S, c, cmd, dt){
      const P = S.P;
      /* limites da pista. Rigoroso: as quatro rodas para fora da linha branca (a zebra fica
         fora). Tolerante (padrão): a zebra é pista, e só conta quem fica inteiro na grama, na
         brita ou no escape por um instante, andando. Desligado: nada conta. */
      const modo = S.limitesModo || 'tolerante';
      const margem = modo === 'rigoroso' ? 0 : 1.5;
      const fora = modo !== 'desligado' && Math.abs(c.d) - c.sp.larg / 2 > P.meia + margem && c.piso !== C2D.PISO.PIT;
      c.tFora = fora ? (c.tFora || 0) + dt : 0;
      const conta = modo === 'rigoroso' ? fora : c.tFora > .35 && c.v > 12;
      if(conta && !c.foraContou && c.ini != null && !c.invalida){ c.invalida = true; c.avisos++; S.eventos.push({ t: S.t, tipo: 'limites', a: c.id, n: c.avisos }); }
      if(!fora) c.foraContou = false; else if(conta) c.foraContou = true;
      c.fora = fora;
      /* parado de lado, de ré ou preso no muro */
      const rel = Math.abs(C2D.ang(c.psi - P.hd[c.i]));
      const preso = c.v < 1.5 && (cmd.acel > .3 || rel > 1.6) && S.estado === 'pista';
      c.parado = preso ? c.parado + dt : 0;
      if((c.ia && c.parado > 2.5) || (c === S.eu && c.assist.freioAuto && c.parado > 3)) C2D.Sessao.voltarPista(S, c);
    },
    /* o carro volta ao eixo da pista, parado e apontado para a frente; a volta não vale */
    voltarPista(S, c){
      const P = S.P;
      /* na corrida, carro destruído não volta; no treino e na classificação a equipe entrega o carro consertado */
      if(c.destruido && S.tipo === 'corrida') return;
      if(c.destruido && C2D.Dano) C2D.Dano.reparar(c, true);
      const lado = lim(c.d, -P.meia * .5, P.meia * .5);
      const sTot = c.sTot;
      C2D.Carro.posicionar(c, P, c.s, lado);
      c.sTot = sTot; c.parado = 0;
      if(c.ini != null) c.invalida = true;
      S.eventos.push({ t: S.t, tipo: 'voltouPista', a: c.id });
    },
    podeVoltar(S, c){
      const rel = Math.abs(C2D.ang(c.psi - S.P.hd[c.i]));
      return c.v < 4 && (rel > 1.2 || c.parado > .8 || Math.abs(c.d) > S.P.meia + 1);
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
