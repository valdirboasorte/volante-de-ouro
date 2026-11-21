/* Corrida 2D: o comissariado (direção de prova).
   Investiga os toques entre carros, decide quem causou, mede a gravidade pelo que
   aconteceu com o outro carro e aplica a punição que a categoria usava naquela época:

     FIA desde 2014 (F1, F2, F3, Fórmula E, WEC, DTM, Stock Car)  5 s · 10 s · drive-through · stop-and-go
     FIA 1994–2013                                                drive-through · stop-and-go
     FIA 1989–1993                                                stop-and-go
     antes disso                                                  só a bandeira preta
     IndyCar e CART (desde 1979)                                  drive-through · stop-and-go
     NASCAR e ARCA                                                contato não é punido ("rubbin's racing");
                                                                  passar sob bandeira amarela = pass-through
     kart (CIK, desde 2015)                                       5 s · 10 s · bandeira preta
     kart antes de 2015                                           10 s · 20 s · bandeira preta

   Drive-through e stop-and-go têm de ser cumpridos em até três voltas; dado nas três
   últimas voltas (ou sem tempo de cumprir) vira tempo somado ao fim: 20 s e 30 s desde
   2014, 25 s e 35 s antes. Quem não cumpre leva a bandeira preta. No kart não há pit lane:
   tudo é punição em tempo, como na vida real.

   A gravidade (0 a 4): 0 toque sem consequência · 1 o outro perdeu a posição ou teve dano
   leve · 2 o outro rodou ou teve dano sério · 3 o outro abandonou · 4 conduta perigosa
   (tirou o outro da corrida com muita diferença de velocidade, ou bateu sob safety car).
   Modos: rigoroso (como o comissário mais duro), tolerante (o padrão: um degrau a menos de
   gravidade, toque leve é incidente de corrida) e desligado. Também cuida de não deixar
   o jogador passar o carro da frente sob safety car. */
(function(raiz){
  const C2D = raiz.C2D;
  const { lim } = C2D;

  /* quem pilota de verdade: o seu carro, ou (no servidor do multiplayer, rede2d.js) qualquer humano */
  const ehEu = (S, c) => !!c && (c === S.eu || !!c.humano);

  const T5 = { t: 'tempo', s: 5 }, T10 = { t: 'tempo', s: 10 }, T20 = { t: 'tempo', s: 20 };
  const DT = { t: 'dt' }, SG = { t: 'sg', s: 10 }, DSQ = { t: 'dsq' }, NADA = null;

  /* contato[g]: a punição para cada gravidade; scPasse: ultrapassar sob safety car;
     vantagem: ganhar posição por fora da pista; tarde: o tempo no lugar do drive-through e
     do stop-and-go que não dá mais para cumprir */
  const SISTEMAS = {
    fia14:   { nome: 'Regras da FIA desde 2014: 5 s, 10 s, drive-through e stop-and-go', contato: [T5, T5, T10, DT, SG], scPasse: T5, vantagem: T5, tarde: { dt: 20, sg: 30 } },
    fia94:   { nome: 'Regras da FIA de 1994 a 2013: drive-through e stop-and-go', contato: [NADA, DT, DT, SG, SG], scPasse: DT, vantagem: DT, tarde: { dt: 25, sg: 35 } },
    fia89:   { nome: 'Regras da FIA de 1989 a 1993: stop-and-go', contato: [NADA, NADA, SG, SG, SG], scPasse: SG, vantagem: NADA, tarde: { dt: 25, sg: 35 } },
    antigo:  { nome: 'Antes das punições em tempo: só a bandeira preta para conduta perigosa', contato: [NADA, NADA, NADA, NADA, DSQ], scPasse: NADA, vantagem: NADA, tarde: { dt: 25, sg: 35 } },
    indy:    { nome: 'Regras da IndyCar: drive-through e stop-and-go por contato evitável', contato: [NADA, DT, DT, SG, SG], scPasse: DT, vantagem: NADA, tarde: { dt: 20, sg: 30 } },
    nascar:  { nome: 'Regras da NASCAR: contato faz parte; passar sob bandeira amarela custa um pass-through', contato: [NADA, NADA, NADA, NADA, NADA], scPasse: DT, vantagem: NADA, tarde: { dt: 20, sg: 30 } },
    kart15:  { nome: 'Regras da CIK desde 2015: 5 s, 10 s e bandeira preta', contato: [T5, T5, T10, T10, DSQ], scPasse: T10, vantagem: T5, tarde: { dt: 10, sg: 20 } },
    kart:    { nome: 'Regras do kart antes de 2015: 10 s, 20 s e bandeira preta', contato: [NADA, T10, T10, T20, DSQ], scPasse: T10, vantagem: NADA, tarde: { dt: 10, sg: 20 } }
  };

  /* o sistema de cada categoria e época */
  function sistema(sk, ano, nivel, kart){
    ano = ano || 2024;
    if(kart) return ano >= 2015 ? 'kart15' : 'kart';
    if(sk === 'nascar') return 'nascar';
    if(sk === 'indy') return ano >= 1979 ? 'indy' : 'antigo';
    if(sk === 'fe') return 'fia14';
    if(sk === 'wec') return ano >= 2012 ? 'fia14' : ano >= 1994 ? 'fia94' : 'antigo';
    /* F1 e as categorias de base da FIA, DTM e Stock Car seguem o código esportivo da FIA */
    return ano >= 2014 ? 'fia14' : ano >= 1994 ? 'fia94' : ano >= 1989 ? 'fia89' : 'antigo';
  }

  const nomePun = p => !p ? '' : p.t === 'tempo' ? '+' + p.s + ' s' : p.t === 'dt' ? 'Drive-through' : p.t === 'sg' ? 'Stop-and-go de ' + (p.s || 10) + ' s' : 'Desclassificação';
  const MOTIVO = {
    colisao: 'causou uma colisão', perigosa: 'condução perigosa', sc: 'ultrapassou sob safety car',
    vantagem: 'ganhou posição por fora da pista', reincidencia: 'conduta antidesportiva repetida',
    naoCumpriu: 'não cumpriu a punição'
  };
  /* a velocidade lateral (em relação à pista) e o ângulo com a pista */
  function lateral(P, c){
    const ca = Math.cos(c.psi), sa = Math.sin(c.psi), h = P.hd[c.i];
    const wx = c.vx * ca - c.vy * sa, wy = c.vx * sa + c.vy * ca;
    return wx * -Math.sin(h) + wy * Math.cos(h);
  }

  C2D.Punicoes = {
    SISTEMAS, sistema, nomePun, MOTIVO,
    /* opc: { modo, sk, ano, nivel } */
    preparar(S, opc){
      opc = opc || {};
      const id = sistema(opc.sk, opc.ano, opc.nivel || 0, S.P.kart);
      S.pun = { modo: opc.modo || 'tolerante', id, sis: SISTEMAS[id], casos: [], lista: [] };
      for(const c of S.carros){ c.punPend = []; c.punN = 0; }
    },
    ativo(S){ return !!(S.pun && S.pun.modo !== 'desligado'); },
    /* sem pit lane (kart, pista sem prédio dos boxes) drive-through e stop-and-go viram tempo */
    temPitLane(S){ const B = S.P.box; return !S.P.kart && !!B && B.comp > 260; },

    /* antes de resolver os toques: como cada carro vinha (o toque muda as velocidades) */
    antesDosToques(S){
      if(!S.pun) return;
      for(const c of S.carros){ if(c.fantasma || c.estado !== 'pista') continue; c.pw = lateral(S.P, c); c.prel = Math.abs(C2D.ang(c.psi - S.P.hd[c.i])); }
    },

    /* um toque entre dois carros: quem causou? (abre a investigação; a decisão vem depois,
       quando dá para ver o que aconteceu com o outro carro) */
    toque(S, t){
      if(!C2D.Punicoes.ativo(S) || S.estado !== 'pista') return;
      const A = S.carros.find(c => c.id === t.a), B = S.carros.find(c => c.id === t.b);
      if(!A || !B || A.estado !== 'pista' || B.estado !== 'pista' || A.box || B.box) return;
      /* o mesmo par já em investigação: só guarda a pancada mais forte */
      const ja = S.pun.casos.find(k => !k.feito && ((k.a === A && k.b === B) || (k.a === B && k.b === A)));
      if(ja){ ja.imp = Math.max(ja.imp, t.v); return; }
      const j = C2D.Punicoes.culpa(S, A, B);
      const caso = { t0: S.t, imp: t.v, sc: !!(S.sc || S.vsc), feito: false };
      if(!j){ caso.a = A; caso.b = B; caso.incidente = true; }
      else { caso.a = j.culpado; caso.b = j.vitima; caso.tipo = j.tipo; }
      caso.posA0 = caso.a.pos; caso.posB0 = caso.b.pos; caso.vB0 = Math.max(1, caso.b.v); caso.danoB0 = caso.b.dano || 0; caso.rodou = false;
      S.pun.casos.push(caso);
      for(const [eu, o] of [[A, B], [B, A]]) if(ehEu(S, eu)){ S.eventos.push({ t: S.t, tipo: 'investigacao', a: eu.id, b: o.id, txt: 'Toque com ' + (o.nome || o.id) + ' em análise' }); }
    },
    /* a culpa, como o comissário olharia o replay: batida por trás é de quem vem atrás; lado a
       lado, de quem fechou a porta (só um dos dois foi para cima do outro); quem já vinha
       rodando ou os dois indo um para o outro é incidente de corrida */
    culpa(S, A, B){
      const P = S.P, len = (A.sp.comp + B.sp.comp) / 2, ds = B.sTot - A.sTot;
      if((A.prel || 0) > .7 || (B.prel || 0) > .7) return null;
      if(ds > len * .72) return { culpado: A, vitima: B, tipo: 'traseira' };
      if(ds < -len * .72) return { culpado: B, vitima: A, tipo: 'traseira' };
      const s = Math.sign(B.d - A.d) || 1, wA = (A.pw || 0) * s, wB = -(B.pw || 0) * s;
      const vaiA = wA > .9, vaiB = wB > .9;
      /* quem volta de fora da pista e fecha quem está nela */
      const foraA = Math.abs(A.d) > P.meia + .3, foraB = Math.abs(B.d) > P.meia + .3;
      if(foraA && !foraB && wA > .4) return { culpado: A, vitima: B, tipo: 'retorno' };
      if(foraB && !foraA && wB > .4) return { culpado: B, vitima: A, tipo: 'retorno' };
      if(vaiA && !vaiB && wA > wB + .6) return { culpado: A, vitima: B, tipo: 'lateral' };
      if(vaiB && !vaiA && wB > wA + .6) return { culpado: B, vitima: A, tipo: 'lateral' };
      return null;
    },

    /* depois de cada passo: decide os casos, vigia as voltas para cumprir, ultrapassagens */
    depois(S, antes){
      const pun = S.pun; if(!pun) return;
      const P = S.P;
      for(const k of pun.casos){
        if(k.feito) continue;
        const b = k.b;
        if(b.estado === 'pista'){
          const rel = Math.abs(C2D.ang(b.psi - P.hd[b.i]));
          if(rel > 1.2 || b.v < k.vB0 * .4) k.rodou = true;
        }
        const fimJanela = S.t - k.t0 > 4 || b.estado === 'fora' || S.acabou;
        if(fimJanela) C2D.Punicoes.decidir(S, k);
      }
      if(pun.casos.length > 40) pun.casos = pun.casos.filter(k => !k.feito);
      /* drive-through e stop-and-go: três voltas para cumprir; sem cumprir, bandeira preta */
      for(const c of S.carros){
        if(!c.punPend || !c.punPend.length) continue;
        if(c.estado === 'chegou'){ C2D.Punicoes.converter(S, c); continue; }
        if(c.estado !== 'pista' || c.box) continue;
        const p = c.punPend[0];
        /* sob safety car não dá para cumprir: o prazo não acaba antes de uma volta de bandeira verde */
        if((S.sc || S.vsc) && p.ate - c.voltas < 2) p.ate = c.voltas + 2;
        if(c.voltas >= p.ate){ c.punPend.length = 0; C2D.Punicoes.aplicar(S, c, DSQ, 'naoCumpriu'); }
      }
      /* ultrapassagem sob safety car e por fora da pista: dá para devolver a posição */
      if(antes && pun.modo !== 'desligado') C2D.Punicoes.ultrapassagens(S, antes);
      for(const k of pun.devolver || []){
        if(k.feito) continue;
        const c = k.c, alvos = k.alvos.filter(o => o.estado === 'pista' && !o.box);
        const aindaNaFrente = alvos.some(o => c.pos < o.pos);
        if(!aindaNaFrente || c.estado !== 'pista'){ k.feito = true; if(ehEu(S, c) && c.estado === 'pista') S.eventos.push({ t: S.t, tipo: 'investigacao', a: c.id, txt: 'Posição devolvida: sem punição' }); continue; }
        if(S.t > k.ate){ k.feito = true; C2D.Punicoes.aplicar(S, c, k.motivo === 'sc' ? pun.sis.scPasse : pun.sis.vantagem, k.motivo, alvos[0]); }
      }
    },
    /* quem ganhou posição sob safety car (o jogador) ou com as quatro rodas fora da pista */
    ultrapassagens(S, antes){
      const pun = S.pun, P = S.P;
      pun.devolver = (pun.devolver || []).filter(k => !k.feito);
      const janela = pun.modo === 'rigoroso' ? 6 : 10;
      for(const c of S.carros){
        if(c.estado !== 'pista' || c.box) continue;
        const forad = Math.abs(c.d) - c.sp.larg / 2 > P.meia + .2;
        if(forad) c.tForaUlt = S.t;
        const a = antes.get(c);
        if(!a || c.pos >= a) continue;
        const passados = S.ordem.filter(o => o !== c && o.pos > c.pos && antes.get(o) < a && o.estado === 'pista' && !o.box && !C2D.Punicoes.lento(o));
        if(!passados.length) continue;
        let motivo = null;
        if((S.sc || S.vsc) && ehEu(S, c) && pun.sis.scPasse) motivo = 'sc';
        else if(pun.sis.vantagem && c.tForaUlt != null && S.t - c.tForaUlt < 1.2) motivo = 'vantagem';
        if(!motivo || pun.devolver.some(k => k.c === c && k.motivo === motivo)) continue;
        pun.devolver.push({ c, alvos: passados, motivo, ate: S.t + janela, feito: false });
        if(ehEu(S, c)) S.eventos.push({ t: S.t, tipo: 'investigacao', a: c.id, txt: (motivo === 'sc' ? 'Ultrapassagem sob safety car' : 'Ganhou posição por fora da pista') + ': devolva a posição em ' + janela + ' s' });
      }
    },
    /* carro que se arrasta (quebrado, destruído, voltando à pista): pode ser passado */
    lento(o){ return o.destruido || (o.potencia != null && o.potencia < 1) || !!o.retorno || o.v < Math.min(12, (isFinite(o.teto) ? o.teto : 40) * .35); },

    /* a decisão de um caso */
    decidir(S, k){
      k.feito = true;
      const pun = S.pun, a = k.a, b = k.b;
      const avisa = txt => { for(const eu of [a, b]) if(ehEu(S, eu)) S.eventos.push({ t: S.t, tipo: 'investigacao', a: eu.id, txt }); };
      if(k.incidente){ avisa('Incidente de corrida: sem punição'); return; }
      if(a.estado === 'fora'){ return; }
      let g = 0;
      if(a.pos < b.pos && k.posA0 > k.posB0) g = 1;
      const dDano = (b.dano || 0) - k.danoB0;
      if(dDano > .12) g = Math.max(g, 1);
      if(dDano > .3 || k.rodou) g = Math.max(g, 2);
      if(b.estado === 'fora' && b.foraTipo === 'ACID') g = Math.max(g, 3);
      if((g >= 3 && k.imp > 14) || (k.sc && g >= 2)) g = 4;
      /* tolerante: um degrau a menos; toque leve de lado não é nada nem no rigoroso */
      if(pun.modo === 'tolerante') g -= 1;
      else if(g === 0 && !(k.tipo === 'traseira' && k.imp > 6)) g = -1;
      if(g < 0){ avisa('Incidente de corrida: sem punição'); return; }
      const p = pun.sis.contato[Math.min(4, g)];
      if(!p){ avisa('Sem punição: ' + (pun.id === 'nascar' ? 'contato faz parte da corrida' : 'a direção de prova deixou passar')); return; }
      a.punN = (a.punN || 0) + 1;
      /* rigoroso: a terceira punição por contato na mesma corrida é bandeira preta */
      if(pun.modo === 'rigoroso' && a.punN >= 3 && p.t !== 'dsq') return C2D.Punicoes.aplicar(S, a, DSQ, 'reincidencia', b);
      C2D.Punicoes.aplicar(S, a, p, g >= 4 ? 'perigosa' : 'colisao', b);
    },

    /* aplica a punição; drive-through e stop-and-go ficam pendentes (ou viram tempo) */
    aplicar(S, c, p, motivo, contra){
      if(!p || !S.pun || S.pun.modo === 'desligado' || c.estado === 'fora') return;
      const sis = S.pun.sis;
      let real = p;
      if((p.t === 'dt' || p.t === 'sg') && (!C2D.Punicoes.temPitLane(S) || S.N - c.voltas <= 3 || S.bandeira === 'quadriculada' || c.estado === 'chegou'))
        real = { t: 'tempo', s: p.t === 'dt' ? sis.tarde.dt : sis.tarde.sg, de: p.t };
      const reg = { id: c.id, nome: c.nome || c.id, t: S.t, volta: c.voltas + 1, pun: real, motivo, contra: contra ? (contra.nome || contra.id) : null };
      S.pun.lista.push(reg);
      if(real.t === 'tempo') c.penal += real.s;
      else if(real.t === 'dt' || real.t === 'sg') c.punPend.push({ t: real.t, s: real.s, ate: c.voltas + 3, motivo, reg });
      const txt = C2D.Punicoes.texto(reg);
      S.eventos.push({ t: S.t, tipo: 'punicao', a: c.id, seg: real.t === 'tempo' ? real.s : 0, pun: real.t, motivo, txt });
      if(real.t === 'dsq') C2D.Corrida.abandonar(S, c, 'DSQ');
    },
    texto(reg){
      const p = reg.pun, m = MOTIVO[reg.motivo] || reg.motivo;
      const base = p.t === 'tempo' ? '+' + p.s + ' s' + (p.de ? ' (' + (p.de === 'dt' ? 'drive-through' : 'stop-and-go') + ' convertido)' : '')
        : p.t === 'dt' ? 'Drive-through' : p.t === 'sg' ? 'Stop-and-go de ' + (p.s || 10) + ' s' : 'Bandeira preta: desclassificado';
      return base + (reg.cumprido ? ' cumprido' : '') + ': ' + m + (reg.contra ? ' (' + reg.contra + ')' : '');
    },
    /* a punição pendente de quem terminou (ou da simulação até a bandeirada) vira tempo */
    converter(S, c){
      const sis = S.pun && S.pun.sis; if(!sis || !c.punPend) return;
      for(const p of c.punPend){
        const s = p.t === 'dt' ? sis.tarde.dt : sis.tarde.sg;
        c.penal += s;
        /* a mesma linha da decisão: o drive-through vira o tempo da regra */
        if(p.reg) p.reg.pun = { t: 'tempo', s, de: p.t };
        else S.pun.lista.push({ id: c.id, nome: c.nome || c.id, t: S.t, volta: c.voltas, pun: { t: 'tempo', s, de: p.t }, motivo: p.motivo, contra: null });
      }
      c.punPend.length = 0;
    },
    /* a simulação até a bandeirada: os casos abertos se decidem agora, o pendente vira tempo */
    fechar(S){
      if(!S.pun) return;
      for(const k of S.pun.casos) if(!k.feito) C2D.Punicoes.decidir(S, k);
      for(const c of S.carros) if(c.estado !== 'fora') C2D.Punicoes.converter(S, c);
    },
    /* o box: entrar para cumprir (a punição pendente vem antes do pneu). Sob safety car não se
       cumpre punição: a passagem pelo box é uma parada normal */
    querCumprir(S, c){ return !!(c.punPend && c.punPend.length && !S.sc && !S.vsc); },
    cumpriu(S, c, p){
      const i = c.punPend.indexOf(p); if(i >= 0) c.punPend.splice(i, 1);
      if(p.reg) p.reg.cumprido = true;
      S.eventos.push({ t: S.t, tipo: 'cumpriu', a: c.id, pun: p.t, txt: (p.t === 'dt' ? 'Drive-through' : 'Stop-and-go') + ' cumprido' });
    },

    /* sob safety car o jogador não passa o carro da frente: o carro segura a distância sozinho
       (quem está no box, abandonou ou se arrasta pode ser passado, como na vida real) */
    segurarSC(S, c, cmd){
      c.segurandoSC = null;
      if(!(S.sc || S.vsc) || c.estado !== 'pista' || c.box || c.autopiloto) return cmd;
      let a = null;
      for(let k = c.pos - 2; k >= 0; k--){
        const o = S.ordem[k];
        if(!o || o.estado !== 'pista' || o.box || C2D.Punicoes.lento(o)) continue;
        a = o; break;
      }
      if(!a) return cmd;
      const gap = a.sTot - c.sTot, folga = (a.sp.comp + c.sp.comp) / 2 + 4;
      if(gap > folga + 60) return cmd;
      c.segurandoSC = a;
      const vAlvo = Math.max(0, a.v + (gap - folga) * .55);
      if(c.v <= vAlvo) return cmd;
      return Object.assign({}, cmd, { acel: 0, freio: Math.max(cmd.freio || 0, lim((c.v - vAlvo) * .3 + (gap < folga ? .25 : 0), 0, 1)) });
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
