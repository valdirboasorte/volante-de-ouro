/* Corrida 2D: pneus, combustível, boxes e safety car.
   Tudo sai do regulamento da categoria e da época que o jogo já tem (Gp.regras), do
   desgaste do motor clássico (Gp.gastoVolta, Gp.degr, Gp.desencaixe) e das paradas
   previstas (Prova.estrategia). Numa corrida 2D mais curta que a real, o pneu e o tanque
   duram na mesma proporção: as paradas continuam fazendo sentido.
   O pneu gasto vira menos aderência (a mesma perda de tempo do motor clássico, pela
   semelhança dinâmica: tempo k vezes maior = aderência dividida por k²). */
(function(raiz){
  const C2D = raiz.C2D;
  const { lim } = C2D;

  C2D.Boxes = {
    /* opc: { sk, ano, nivel, fracao, Ncl, km, wet, pista (temperatura do asfalto) } */
    preparar(S, opc){
      const P = S.P;
      const kart = P.kart, oval = P.oval;
      const fr = lim(opc.fracao || (S.N / Math.max(1, opc.Ncl || S.N)), .01, 1);
      const Ncl = opc.Ncl || S.N;
      const km = opc.km || Ncl * P.L / 1000;
      const est = typeof Prova !== 'undefined' ? Prova.estrategia(opc.sk, opc.ano, opc.nivel || 0, Ncl, km, !!opc.wet, kart) : { paradas: 0, parado: 3, limite: 22 };
      const regras = typeof Gp !== 'undefined' ? Gp.regras(opc.sk, opc.ano, opc.nivel || 0, kart, oval, est, Ncl) : { secos: ['M'], chuva: ['W'], gasto: 1, tanque: Infinity, parado: 3, limite: 22, scProb: 0, vscProb: 0 };
      /* paradas na corrida 2D: a corrida encurtada tem menos paradas (pelo menos uma onde a
         regra pede), e o pneu e o tanque duram o stint novo, na mesma proporção do real */
      const p0 = est.paradas || 0;
      const p2 = p0 <= 0 ? 0 : Math.min(p0, Math.max(S.N >= 6 ? 1 : 0, Math.round(p0 * fr * 3)));
      const stintReal = Ncl / (p0 + 1), stint2d = S.N / (p2 + 1);
      S.paradas2d = p2;
      S.regras = regras; S.est = est; S.Ncl = Ncl;
      S.fracao = lim(stint2d / Math.max(1, stintReal), .02, 1);
      S.amb.pista = opc.pista || 30;
      /* o tanque em voltas da corrida 2D: o stint planejado e uma pequena folga */
      S.tanque = regras.tanque < Infinity ? (p2 > 0 ? stint2d * 1.12 + .6 : S.N + 1.5) : Infinity;
      S.sc = null; S.vsc = null; S.incidentes = [];
      const B = P.box;
      /* a garagem de cada equipe: a mesma ordem do desenho dos boxes (as equipes na ordem do grid,
         uma garagem de 10 m a cada 14 m); sem prédio dos boxes, as vagas se espalham pela pit lane */
      const eqs = [];
      for(const c of S.carros.slice().sort((a, b) => (a.grid || 0) - (b.grid || 0))){ const k = c.eq || c.cor; if(eqs.indexOf(k) < 0) eqs.push(k); }
      const gIni = B.ini + 126, gFim = B.ini + B.comp - 130;
      const nG = !kart && B.comp > 260 ? Math.max(1, Math.floor((gFim - gIni) / 14 - 1e-9) + 1) : 0;
      for(const c of S.carros){
        const ini = c.pneuIni && Gp.COMP[c.pneuIni] ? c.pneuIni : C2D.Boxes.pneuDeLargada(S, c);
        c.pneu = { c: ini, gasto: c.pneu0 || 0, voltas: 0 };
        c.pneus = [ini]; c.paradas = 0; c.comb = 1; c.box = null; c.pedirBox = false; c.boxPneu = null;
        c.aderPneu = 1;
        /* a vaga de cada equipe: diante da garagem dela */
        const q = Math.max(0, eqs.indexOf(c.eq || c.cor));
        c.garagem = q;
        c.vagaBox = nG ? gIni + (q % nG) * 14 + 5 : B.ini + 110 + (q + .5) / Math.max(1, eqs.length) * Math.max(40, B.comp - 240);
        /* as paradas planejadas da IA, espalhadas pela corrida como no motor clássico */
        c.plano = [];
        if((c.ia || c.boxAuto) && S.paradas2d > 0 && S.N >= 4){
          const rnd = C2D.rng(C2D.semente('plano:' + c.id + ':' + S.semente));
          for(let q = 1; q <= S.paradas2d; q++){
            const base = Math.round(S.N * q / (S.paradas2d + 1));
            c.plano.push(lim(base + Math.round((rnd() - .5) * Math.max(1, S.N * .14)), 1, S.N - 1));
          }
        }
      }
    },
    /* os pneus que fazem sentido agora (para o botão do box) */
    opcoes(S, c){
      const reg = S.regras, w = S.amb.w || 0;
      const l = w > .3 ? reg.chuva.concat(reg.secos) : reg.secos.concat(w > .15 ? reg.chuva : []);
      return [...new Set(l)].filter(p => Gp.COMP[p]);
    },
    pneuDeLargada(S, c){
      const reg = S.regras, w = S.amb.w || 0;
      if(w > .38 && reg.chuva.length) return w > .72 && reg.chuva.indexOf('W') >= 0 ? 'W' : reg.chuva[0];
      const op = reg.secos;
      if(!c.ia) return op.indexOf('M') >= 0 ? 'M' : op[0];
      const h = C2D.semente('larg:' + c.id + ':' + S.semente) % 100;
      return op.length > 1 ? (h < 55 ? (op.indexOf('M') >= 0 ? 'M' : op[0]) : h < 80 ? op[0] : op[op.length - 1]) : op[0];
    },
    /* o pneu para a próxima parada: chuva se a pista pede, senão um composto que cumpra a regra dos dois */
    pneuParaBox(S, c){
      const reg = S.regras, w = S.amb.w || 0;
      if(w > .38 && reg.chuva.length) return w > .72 && reg.chuva.indexOf('W') >= 0 ? 'W' : reg.chuva[0];
      const secos = reg.secos;
      if(secos.length === 1) return secos[0];
      const usados = new Set(c.pneus.filter(p => !Gp.COMP[p].chuva));
      const resta = Math.max(1, S.N - c.voltas - 1);
      /* quantas voltas cada composto aguenta até o fim da vida (gasto 1), na escala desta corrida */
      const vida = p => 1 / Math.max(1e-6, Gp.gastoVolta({ trk: { type: S.P.tipo }, clima: { pista: S.amb.pista || 30 }, g: { L: S.P.L }, regras: reg }, p, 0) / S.fracao * .95);
      const ordem = ['S', 'M', 'H'].filter(p => secos.indexOf(p) >= 0);
      let opc = ordem;
      if(reg.doisCompostos && usados.size < 2){ const nov = ordem.filter(p => !usados.has(p)); if(nov.length) opc = nov; }
      /* o mais macio que chega ao fim; se nenhum chega, o mais duro */
      return opc.find(p => vida(p) >= resta * 1.02) || opc[opc.length - 1];
    },

    /* a perda de ritmo do pneu e do tanque (fator de tempo; 1 = pneu novo de referência) */
    fatorPneu(S, c){
      const C = Gp.COMP[c.pneu.c] || Gp.COMP.M, w = S.amb.w || 0;
      const seco = w < .3 ? (C.ritmo || 0) : 0;
      return (1 + seco + Gp.degr(c.pneu.gasto) * (C.deg || 1)) * Gp.desencaixe(c.pneu.c, w);
    },

    /* antes da física: a pit lane é dirigida pelo limitador (como nos jogos de corrida) */
    comando(S, c, cmd){
      const P = S.P, B = P.box;
      /* pedido de box (jogador) ou plano (IA). No kart não há pit lane (a pista nem a
         desenha, e o regulamento não tem paradas): abrir para o lado dos boxes na reta
         não pode virar uma entrada no box */
      if(!c.box && c.estado === 'pista' && !P.kart){
        const auto = c.ia || c.boxAuto;
        /* a parada planejada; sob safety car vale antecipar (parar custa menos com o pelotão devagar) */
        const sobSC = (S.sc || S.vsc) && S.N - c.voltas > 2 && c.plano.length && c.voltas + 1 >= c.plano[0] - Math.max(2, Math.round(S.N * .25));
        const plano = auto && c.plano.length && (c.voltas + 1 >= c.plano[0] || sobSC);
        const resta = S.N - c.voltas;
        const precisa = auto && ((c.pneu.gasto > 1.08 && resta > 2) || (c.dano > .38 && resta > 2) || (S.tanque < Infinity && c.comb * S.tanque < 1.15) || (C2D.Boxes.trocaPorChuva(S, c) && resta > 1));
        /* box automático do jogador: a equipe chama (o botão Box mostra o pneu; tocar de novo troca ou cancela) */
        if(!c.ia && c.boxAuto && (plano || precisa) && !c.pedirBox && !c.cancelouChamada){ c.pedirBox = true; c.boxPneu = C2D.Boxes.pneuParaBox(S, c); c.chamado = true; S.eventos.push({ t: S.t, tipo: 'chamadoBox', a: c.id }); }
        /* drive-through ou stop-and-go pendente (punicoes2d.js): a IA vai cumprir; o jogador entra quando quiser */
        const cumprir = !!(C2D.Punicoes && C2D.Punicoes.querCumprir(S, c));
        const quer = c.pedirBox || (c.ia && ((plano && resta > 1) || precisa || cumprir));
        const q = ((c.s - B.ini) % P.L + P.L) % P.L;
        /* jogador no volante: só para se ele mesmo vira o carro para a pit lane na entrada (o chamado é só conselho) */
        const manual = c === S.eu && !c.autopiloto && !c.ia;
        const entra = manual
          ? q < 140 && Math.sign(c.d) === Math.sign(B.lado) && Math.abs(c.d) > P.meia + .5
          : quer && q < 40;
        if(entra && c.voltas < S.N){
          /* com punição pendente, esta passagem é para cumprir: o drive-through atravessa o pit lane
             sem parar; o stop-and-go para na vaga o tempo da regra, sem ninguém mexer no carro */
          const servir = c.punPend && c.punPend.length && !S.sc && !S.vsc ? c.punPend[0] : null;
          c.box = { fase: servir && servir.t === 'dt' ? 'saindo' : 'entrando', ate: 0, servir };
          c.re = false; c.reOk = false;
          c.fantasma = true;     /* na pit lane ninguém encosta em ninguém (simplificação) */
          c.boxPneu = c.boxPneu || C2D.Boxes.pneuParaBox(S, c);
          if(plano && !servir) c.plano.shift();
          c.chamado = false; c.cancelouChamada = false;
          S.eventos.push({ t: S.t, tipo: 'entraBox', a: c.id, volta: c.voltas + 1 });
        }
      }
      if(!c.box) return cmd;
      /* na pit lane: o carro anda sozinho no limitador pela faixa rápida, entra na vaga diante da
         garagem da equipe, para com a equipe em volta e volta para a faixa rápida (se o companheiro
         está sendo atendido, espera atrás dele) */
      const limite = S.regras.limite || 22, L = P.L, lado = Math.sign(B.lado) || 1;
      if(!c.boxIA){ c.boxIA = C2D.IA.criar({ ritmo: .8 }); c.boxIA.livre = true; c.boxIA.Ld0 = 3; c.boxIA.LdK = .22; }
      const slot = c.vagaBox, ate = ((slot - c.s) % L + L) % L;
      const ocupado = S.carros.some(o => o !== c && o.box && o.vagaBox === slot && (o.box.fase === 'parado' ||
        (o.box.fase === 'saindo' && Math.abs(((o.s - slot) % L + L * 1.5) % L - L / 2) < 7) || (o.box.fase === 'entrando' && ((slot - o.s) % L + L) % L < ate)));
      const parar = c.box.fase === 'fila' || (c.box.fase === 'entrando' && ocupado) ? 8.5 : 0;
      /* a faixa: rápida (do lado da pista) ou a de trabalho (do lado das garagens), no ponto à frente */
      const olhar = 3 + .22 * c.v, sAlvo = c.s + olhar, ateA = ((slot - sAlvo) % L + L) % L;
      const centro = B.dEm(sAlvo);
      const rapida = centro != null ? centro - lado * B.larg * .22 : null, trabalho = centro != null ? centro + lado * B.larg * .25 : null;
      let dAlvo = rapida;
      if(centro != null && c.box.fase !== 'saindo'){
        const falta = ateA - parar;
        if(falta < 24 || falta > L - 4) dAlvo = C2D.mix(trabalho, rapida, lim2(falta > L - 4 ? 0 : falta / 24));
      } else if(centro != null && c.box.fase === 'saindo'){
        const andou = ((c.s - slot) % L + L) % L;
        dAlvo = c.box.servir && c.box.servir.t === 'dt' ? rapida : C2D.mix(trabalho, rapida, lim2(andou / 16));
      }
      c.boxIA.alvoD = dAlvo;
      const base = C2D.IA.comandar(c.boxIA, c, P, { carros: null, w: S.amb.w });
      let vMax = limite;
      if(c.box.fase === 'entrando'){
        const resta = ate - parar;
        if(resta < 40 && resta > -2) vMax = Math.min(limite, Math.sqrt(2 * 6 * Math.max(0, resta - .4)) + .3);
        if(resta < 1 || ate > L - 3){
          if(parar){ c.box.fase = 'fila'; }
          else { c.box.fase = 'parado'; c.box.desde = S.t; c.box.ate = S.t + (c.box.servir ? (c.box.servir.s || 10) : C2D.Boxes.tempoParado(S, c)); }
        }
      }
      if(c.box.fase === 'fila'){
        if(!ocupado){ c.box.fase = 'entrando'; }
        else return { steer: base.steer, acel: 0, freio: 1 };
      }
      if(c.box.fase === 'parado'){
        if(S.t >= c.box.ate){ if(!c.box.servir) C2D.Boxes.trocar(S, c); c.box.fase = 'saindo'; }
        return { steer: 0, acel: 0, freio: 1 };
      }
      if(c.box.fase === 'saindo'){
        const q = ((c.s - B.ini) % P.L + P.L) % P.L;
        if(q > B.comp - 2 || centro == null){
          /* a passagem para cumprir punição não troca pneu: o pedido de box do jogador continua valendo */
          const sv = c.box.servir;
          if(sv && C2D.Punicoes) C2D.Punicoes.cumpriu(S, c, sv);
          c.box = null; c.boxIA = null; c.saiuBox = S.t;
          if(!sv){ c.pedirBox = false; c.boxPneu = null; }
          /* volta à pista pela linha de saída: sem encostar em ninguém até pegar velocidade */
          if(c.estado === 'pista'){ c.fantasma = true; c.retorno = { ate: S.t + 7, lado }; } else c.fantasma = true;
          return cmd;
        }
      }
      const v = c.v;
      return { steer: base.steer, acel: v < vMax - .5 ? .8 : 0, freio: v > vMax + .3 ? lim2((v - vMax) * .35) : 0 };
    },
    tempoParado(S, c){
      const rnd = C2D.rng(C2D.semente('parada:' + c.id + ':' + c.paradas + ':' + S.semente));
      const lento = rnd() < (S.ano >= 2005 ? .05 : .08) ? 2 + rnd() * 6 : 0;
      const comb = S.tanque < Infinity ? (1 - c.comb) * 6 : 0;
      /* trocar bico, asa e para-choque leva o tempo de cada peça (dano2d.js) */
      const reparo = C2D.Dano ? C2D.Dano.tempoReparo(c) : (c.dano > .2 ? 6 : 0);
      return (S.regras.parado || 3) * (.92 + rnd() * .18) + lento + reparo + comb;
    },
    trocar(S, c){
      const novo = c.boxPneu || C2D.Boxes.pneuParaBox(S, c);
      c.pneu = { c: novo, gasto: 0, voltas: 0 }; c.pneus.push(novo);
      c.paradas++; c.comb = 1;
      if(C2D.Dano) C2D.Dano.reparar(c); else if(c.dano > .2) c.dano = Math.min(c.dano, .1);
      S.eventos.push({ t: S.t, tipo: 'boxes', a: c.id, c: novo, volta: c.voltas + 1 });
    },
    trocaPorChuva(S, c){
      const w = S.amb.w || 0, C = Gp.COMP[c.pneu.c];
      return (w > .45 && !C.chuva && S.regras.chuva.length) || (w < .2 && C.chuva && S.N - c.voltas > 2);
    },

    /* depois da física: gasta pneu e combustível com a distância */
    depois(S, c, ds){
      if(ds <= 0 || c.estado === 'fora') return;
      const P = S.P;
      const R = { trk: { type: P.tipo }, clima: { pista: S.amb.pista || 30 }, g: { L: P.L }, regras: S.regras };
      const porVolta = Gp.gastoVolta(R, c.pneu.c, S.amb.w || 0) / S.fracao;
      const escorrega = .7 + .45 * Math.min(2, c.deslize || 0);
      c.pneu.gasto += porVolta * (ds / P.L) * escorrega * (c.mods && c.mods.pneu || 1);
      if(c.pneu.gasto > 1.6) c.pneu.gasto = 1.6;
      if(S.tanque < Infinity){
        c.comb -= (ds / P.L) / S.tanque;
        if(c.comb <= 0 && c.estado === 'pista'){ c.comb = 0; c.potencia = 0; S.eventos.push({ t: S.t, tipo: 'semComb', a: c.id }); }
      }
      const f = C2D.Boxes.fatorPneu(S, c);
      c.aderPneu = 1 / (f * f);
    },

    /* ── o safety car e o safety car virtual ── */
    /* como a direção de prova decide: carro parado na pista chama o safety car; encostado junto da
       pista, mais o virtual; longe, na brita ou atrás do muro, só bandeira amarela no setor.
       Destroço na pista: o virtual, quando a categoria tem. Um segundo safety car é mais raro. */
    incidente(S, c, det){
      if(S.bandeira || !S.regras) return;
      const P = S.P, ad = Math.abs(c.d), naPista = ad < P.meia + 1.5, perto = ad < P.meia + 6;
      const rnd = C2D.rng(C2D.semente('sc:' + c.id + ':' + Math.floor(S.t) + ':' + S.semente));
      if(S.sc || S.vsc || S.lider && S.lider.voltas >= S.N - 1) return;
      /* (a corrida 2D encurtada tem os abandonos da prova inteira em poucas voltas: cada incidente pesa
         menos, para que a corrida curta não tenha safety car toda hora) */
      const curta = lim(.25 + .75 * Math.min(1, (S.N || 1) / Math.max(1, S.Ncl || S.N || 1)), .25, 1);
      const reg = S.regras, temVSC = (reg.vscProb || 0) > 0, segundo = (S.houveSC ? .45 : 1) * curta;
      let pSC = reg.scProb * (det ? .3 : naPista ? 1 : perto ? .22 : .05) * segundo;
      let pVSC = temVSC ? (det ? .45 : naPista ? Math.max(reg.vscProb, .2) : perto ? .35 : .1) * segundo : 0;
      const r = rnd();
      if(r < pSC){
        S.sc = { fase: 'ativo', desde: S.t, ateVolta: (S.lider ? S.lider.voltas : 0) + 2 + Math.floor(rnd() * 2) };
        S.houveSC = true; S.eventos.push({ t: S.t, tipo: 'sc', a: c.id });
      } else if(r < pSC + pVSC){
        S.vsc = { ate: S.t + 25 + rnd() * 30 };
        S.houveSC = true; S.eventos.push({ t: S.t, tipo: 'vsc', a: c.id });
      }
    },
    controle(S){
      if(S.sc && S.lider && S.lider.voltas >= S.sc.ateVolta){ S.sc = null; S.eventos.push({ t: S.t, tipo: 'verde' }); }
      if(S.vsc && S.t > S.vsc.ate){ S.vsc = null; S.eventos.push({ t: S.t, tipo: 'verde' }); }
    },
    /* o teto de velocidade sob safety car (para a IA; o jogador é vigiado na ultrapassagem) */
    tetoSC(S, c){
      const P = S.P, vRef = P.seco.v[c.i];
      if(S.vsc) return vRef * .7;
      if(!S.sc) return Infinity;
      if(c === S.lider) return Math.min(vRef * .62, 42);
      return vRef * .86;
    }
  };
  const lim2 = v => v < 0 ? 0 : v > 1 ? 1 : v;
})(typeof window !== 'undefined' ? window : globalThis);
