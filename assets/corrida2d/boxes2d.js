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
      for(const c of S.carros){
        const ini = c.pneuIni && Gp.COMP[c.pneuIni] ? c.pneuIni : C2D.Boxes.pneuDeLargada(S, c);
        c.pneu = { c: ini, gasto: c.pneu0 || 0, voltas: 0 };
        c.pneus = [ini]; c.paradas = 0; c.comb = 1; c.box = null; c.pedirBox = false; c.boxPneu = null;
        c.aderPneu = 1;
        /* a vaga de cada equipe na pit lane */
        c.vagaBox = B.ini + 110 + ((C2D.semente('box:' + (c.eq || c.id)) % 9) / 9) * Math.max(40, B.comp - 240);
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
      /* pedido de box (jogador) ou plano (IA) */
      if(!c.box && c.estado === 'pista'){
        const auto = c.ia || c.boxAuto;
        /* a parada planejada; sob safety car vale antecipar (parar custa menos com o pelotão devagar) */
        const sobSC = (S.sc || S.vsc) && S.N - c.voltas > 2 && c.plano.length && c.voltas + 1 >= c.plano[0] - Math.max(2, Math.round(S.N * .25));
        const plano = auto && c.plano.length && (c.voltas + 1 >= c.plano[0] || sobSC);
        const resta = S.N - c.voltas;
        const precisa = auto && ((c.pneu.gasto > 1.08 && resta > 2) || (c.dano > .38 && resta > 2) || (S.tanque < Infinity && c.comb * S.tanque < 1.15) || (C2D.Boxes.trocaPorChuva(S, c) && resta > 1));
        /* box automático do jogador: a equipe chama (o botão Box mostra o pneu; tocar de novo troca ou cancela) */
        if(!c.ia && c.boxAuto && (plano || precisa) && !c.pedirBox && !c.cancelouChamada){ c.pedirBox = true; c.boxPneu = C2D.Boxes.pneuParaBox(S, c); c.chamado = true; S.eventos.push({ t: S.t, tipo: 'chamadoBox', a: c.id }); }
        const quer = c.pedirBox || (c.ia && ((plano && resta > 1) || precisa));
        const q = ((c.s - B.ini) % P.L + P.L) % P.L;
        if(quer && q < 40 && c.voltas < S.N){
          c.box = { fase: 'entrando', ate: 0 };
          c.fantasma = true;     /* na pit lane ninguém encosta em ninguém (simplificação) */
          c.boxPneu = c.boxPneu || C2D.Boxes.pneuParaBox(S, c);
          if(plano) c.plano.shift();
          c.chamado = false; c.cancelouChamada = false;
          S.eventos.push({ t: S.t, tipo: 'entraBox', a: c.id, volta: c.voltas + 1 });
        }
      }
      if(!c.box) return cmd;
      /* na pit lane: o carro anda sozinho no limitador, para na vaga e sai */
      const limite = S.regras.limite || 22;
      const dAlvo = B.dEm(c.s);
      const ate = ((c.vagaBox - c.s) % P.L + P.L) % P.L;
      if(!c.boxIA) c.boxIA = C2D.IA.criar({ ritmo: .8 });
      c.boxIA.alvoD = dAlvo != null ? dAlvo : null;
      const base = C2D.IA.comandar(c.boxIA, c, P, { carros: null, w: S.amb.w });
      let vMax = limite;
      if(c.box.fase === 'entrando'){
        if(ate < 40) vMax = Math.min(limite, Math.sqrt(2 * 9 * Math.max(0, ate - 1)));
        if(ate < 1.5 || ate > P.L - 3){ c.box.fase = 'parado'; c.box.ate = S.t + C2D.Boxes.tempoParado(S, c); }
      }
      if(c.box.fase === 'parado'){
        if(S.t >= c.box.ate){ C2D.Boxes.trocar(S, c); c.box.fase = 'saindo'; }
        return { steer: base.steer, acel: 0, freio: 1 };
      }
      if(c.box.fase === 'saindo'){
        const q = ((c.s - B.ini) % P.L + P.L) % P.L;
        if(q > B.comp - 2 || dAlvo == null){ c.box = null; c.boxIA = null; c.pedirBox = false; c.boxPneu = null; c.fantasma = c.estado !== 'pista'; return cmd; }
      }
      const v = c.v;
      return { steer: base.steer, acel: v < vMax - .5 ? .8 : 0, freio: v > vMax + .5 ? lim2((v - vMax) * .3) : 0 };
    },
    tempoParado(S, c){
      const rnd = C2D.rng(C2D.semente('parada:' + c.id + ':' + c.paradas + ':' + S.semente));
      const lento = rnd() < (S.ano >= 2005 ? .05 : .08) ? 2 + rnd() * 6 : 0;
      const comb = S.tanque < Infinity ? (1 - c.comb) * 6 : 0;
      return (S.regras.parado || 3) * (.92 + rnd() * .18) + lento + (c.dano > .2 ? 6 : 0) + comb;
    },
    trocar(S, c){
      const novo = c.boxPneu || C2D.Boxes.pneuParaBox(S, c);
      c.pneu = { c: novo, gasto: 0, voltas: 0 }; c.pneus.push(novo);
      c.paradas++; c.comb = 1;
      if(c.dano > .2) c.dano = Math.min(c.dano, .1);
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
    incidente(S, c){
      if(S.bandeira || !S.regras) return;
      const P = S.P, naPista = Math.abs(c.d) < P.meia + 3;
      const rnd = C2D.rng(C2D.semente('sc:' + c.id + ':' + Math.floor(S.t) + ':' + S.semente));
      if(S.sc || S.vsc || S.lider && S.lider.voltas >= S.N - 1) return;
      const r = rnd();
      if(r < S.regras.scProb * (naPista ? 1 : .55)){
        S.sc = { fase: 'ativo', desde: S.t, ateVolta: (S.lider ? S.lider.voltas : 0) + 2 + Math.floor(rnd() * 2) };
        S.houveSC = true; S.eventos.push({ t: S.t, tipo: 'sc', a: c.id });
      } else if(r < S.regras.scProb + S.regras.vscProb){
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
