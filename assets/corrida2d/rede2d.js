/* Corrida 2D em rede (multiplayer): o que o servidor e as telas usam igual.

   Quem manda em quê:
   - o servidor (o Durable Object da sala) roda a sessão oficial: os carros da IA, o safety car,
     as bandeiras, as punições, a ordem e o resultado;
   - cada jogador pilota o próprio carro na tela dele, com a física local: o comando não espera
     a rede. A tela manda o estado do carro ~30 vezes por segundo;
   - em cada lado, os carros que aquele lado não simula são "fantoches" (c.remoto): ficam onde o
     último estado recebido diz, levados até o agora pela pista (s, d e o ângulo em relação à
     pista: numa curva o carro segue a curva) e com a correção suavizada (Rede.TAU).
   O relógio é o tempo de prova do servidor; a tela estima a diferença dele para o relógio dela
   pelo eco (como no NTP) e roda a sessão no "agora" do servidor.

   Nada aqui toca a página: roda igual no navegador, no Node dos testes e no motor do servidor
   (multiplayer/ferramentas/gerar-motor.mjs). Fica fora dos <script> embutidos do index.html:
   a versão do jogo (o hash do multiplayer) não muda por causa deste arquivo. */
(function(raiz){
  const C2D = raiz.C2D;
  const { lim, ang } = C2D;

  const Rede = C2D.Rede = {
    V: 1,
    HZ_EU: 30,          // o estado do próprio carro, por segundo
    QUADRO_S: .05,      // um quadro do servidor a cada 50 ms
    TAU: .12,           // a correção de posição de um fantoche se desfaz em ~120 ms
    MAX_EXTRA: .8,      // um estado velho é levado até 0,8 s adiante pela pista (perda no TCP segura
                        // os pacotes de trás por meio segundo); depois disso o carro espera
    VCORR: 25,          // a correção nunca anda mais que 25 m/s além do carro (não vira puxão)
    SALTO_S: 14,        // erro maior que isso (m), ou TAU não resolve: o fantoche pula (box, volta à pista)
    ASSUMIR_S: 1,       // sem estado do dono por 1 s, o servidor assume o carro com a IA
    EVENTOS: ['sc', 'vsc', 'verde', 'abandono', 'bandeirada', 'punicao', 'investigacao', 'cumpriu', 'quebra', 'semComb']
  };

  /* ── a pista: montar custa uns décimos, então a mesma serve à definição e à sessão ── */
  const pistas = [];
  Rede.pista = (trkId, ano, sk, nivel) => {
    const k = trkId + '|' + ano + '|' + sk + '|' + (nivel || 0);
    const ja = pistas.find(p => p.k === k);
    if(ja) return ja.P;
    const P = C2D.Pista.criar(trkId, ano, { sk, nivel: nivel || 0 });
    pistas.push({ k, P }); if(pistas.length > 3) pistas.shift();
    return P;
  };

  /* ── a definição da corrida (no servidor, no gancho da corrida do motor) ──
     A mesma conta da corrida 2D do jogo solo (carreira2d.js): o carro de cada equipe vira um fator
     de tempo de volta, o talento de cada rival vira a competência da IA, o azar sorteado vira o
     destino do carro, o tempo do dia é o do motor clássico. Só dados: vai para o storage e para
     as telas. o: { sea, ent, donos: { índice do carro: slot }, carR: { id: bônus do acerto },
     dist, nivelIA, cat, gp, limites, punicoes } */
  Rede.definir = function(o){
    const { sea, ent } = o;
    const sk = ent.sk, ano = ent.ano, nivel = ent.nivel || 0;
    const P = Rede.pista(ent.trkId, ano, sk, nivel);
    const wet = !!ent.wet;
    const trk = (typeof TRACKS !== 'undefined' && TRACKS[ent.trkId]) || { id: ent.trkId, type: P.tipo, rainP: .2 };
    const tk = (sea.calendar && sea.calendar[sea.round]) || { type: P.tipo };
    const W = Engine.trackWeights(tk.type, wet);
    const Ncl = Prova.voltas(sk, nivel, ano, Object.assign({ id: P.id, type: P.tipo }, tk), P.L, P.Tref).N;
    const s1 = Prova.segPorPonto(sk, ano, nivel) / Math.max(1, Ncl);
    const car = {};
    ent.carros.forEach(c => {
      const f = sea.field.find(x => x.id === c.id);
      if(f) car[c.id] = Engine.carStr(sea, f.teamId, sea.round) + ((o.carR && o.carR[c.id]) || 0);
    });
    const vals = Object.values(car), top = vals.length ? Math.max(...vals) : 0;
    const k = {}; Object.keys(car).forEach(id => k[id] = 1 + W.car * (top - car[id]) * s1 / P.Tref);
    const N = Math.max(3, Math.round(Ncl * lim(o.dist || .2, .05, 1)));
    const ent2 = Object.assign({}, ent, { carros: ent.carros.map(c => Object.assign({}, c, { ritmo: (c.ritmo != null ? c.ritmo : 60) - W.car * (car[c.id] || 0) })) });
    const nivelIA = C2D.NIVEIS[o.nivelIA] ? o.nivelIA : 'medio';
    const idx = {}; ent.carros.forEach((c, i) => idx[c.id] = i);
    const carros = C2D.Corrida.montarGrid(ent2, { nivel: nivelIA, voltas: N }).map(g => {
      const i = idx[g.id], e = ent.carros[i] || {}, d = o.donos[i];
      const x = { id: g.id, nome: g.nome, cor: g.cor, eq: g.eq || '', cc: g.cc || '', grid: g.grid, k: k[g.id] || 1 };
      const num = o.nums && o.nums[g.id] != null ? o.nums[g.id] : e.num;
      if(num != null) x.num = num;
      if(d !== undefined && d !== null) x.dono = String([].concat(d)[0]);
      else if(g.ia) x.ia = g.ia;
      if(g.destino) x.destino = g.destino;
      if(e.pneuIni) x.pneuIni = e.pneuIni;
      if(e.pneu0) x.pneu0 = e.pneu0;
      if(x.dono && e.pneuMult) x.pneuMult = e.pneuMult;
      return x;
    });
    const clima = JSON.parse(JSON.stringify(Gp.clima(ent, trk, P.Tref, Ncl, P.oval)));
    const rnd = C2D.rng(C2D.semente('luzes:' + (ent.seed || 7) + ':' + ent.trkId));
    return { v: Rede.V, modo: '2d', trkId: ent.trkId, ano, sk, nivel, cat: o.cat || null, gp: o.gp || '', N, Ncl, semente: ent.seed || 7,
             w: clima.w0 || 0, clima, boxes: { sk, ano, nivel, fracao: N / Ncl, Ncl, wet, pista: clima.pista }, nivelIA,
             limites: o.limites || 'tolerante', punicoes: o.punicoes || 'tolerante', apagarEm: +(5.2 + rnd() * 1.6).toFixed(3), carros };
  };

  /* ── a sessão de um lado ──
     papel: { servidor: true } ou { slot } (a tela daquele jogador). carrosTela: a lista do def com o
     que a tela acrescenta ao carro dela (ajudas, ficha do piloto). No servidor os carros humanos são
     fantoches; na tela, todos menos o dela. Ninguém fica com o azar de outro lado: o fantoche não
     tem IA nem destino (o dono sim: a quebra marcada acontece no carro dele, na tela dele). */
  Rede.criarSessao = function(def, papel, carrosTela){
    papel = papel || {};
    const srv = !!papel.servidor, eu = papel.slot != null ? String(papel.slot) : null;
    const carros = (carrosTela || def.carros).map(o => {
      const c = Object.assign({}, o);
      const meu = !srv && eu != null && o.dono === eu;
      c.me = meu;
      if(o.dono != null){ delete c.ia; if(!meu) delete c.destino; }
      else if(!srv) delete c.destino;
      return c;
    });
    const P = Rede.pista(def.trkId, def.ano, def.sk, def.nivel);
    const S = C2D.Sessao.criar({ P, trkId: def.trkId, ano: def.ano, sk: def.sk, nivel: def.nivel, cat: def.cat, tipo: 'corrida', semente: def.semente,
      voltas: def.N, w: def.w, carros, boxes: def.boxes, clima: def.clima, limites: def.limites, punicoes: def.punicoes });
    S.carros.forEach((c, k) => {
      const o = carros[k];
      c.idx = k;
      c.dono = o.dono != null ? o.dono : null;
      c.humano = o.dono != null;
      c.remoto = srv ? c.humano : !c.me;
      c.rd = { base: null, tErr: 0, eS: 0, eD: 0, eP: 0, tUlt: -1 };
    });
    S.apagarEm = def.apagarEm;
    /* no servidor não existe "o seu carro": um marcador que não é carro nenhum */
    if(srv) S.eu = { id: '', estado: 'servidor', voltas: 0, carro: false };
    S.rede = { srv, eu, def, antes: null, depois: null };
    return S;
  };

  /* ── o estado de um carro em números inteiros (o que viaja) ──
     [sTot cm, d cm, x cm, y cm, rumo mrad, ângulo com a pista mrad, vx cm/s, vy cm/s, giro mrad/s,
      ṡ cm/s, ḋ cm/s, aceleração cm/s², esterço mrad, acelerador %, freio %, deslize %, bits]
     A posição desenhada é a do x, y (exata); a pista (s, d) só leva o carro adiante no tempo. */
  Rede.N_DIN = 17;
  const hdEm = (P, s) => C2D.Pista.ponto(P, s, 0).hd;
  Rede.dinamica = function(S, c){
    const P = S.P, hd = hdEm(P, c.s);
    const cs = Math.cos(c.psi), sn = Math.sin(c.psi);
    const VX = c.vx * cs - c.vy * sn, VY = c.vx * sn + c.vy * cs;
    const ch = Math.cos(hd), sh = Math.sin(hd);
    const bits = (c.travF ? 1 : 0) | (c.patinaR ? 2 : 0) | (c.re ? 4 : 0) | (c.fantasma ? 8 : 0) | (c.drsAberto || c.fductAberto || c.aeroAberto ? 16 : 0);
    const r = Math.round;
    return [r(c.sTot * 100), r(c.d * 100), r(c.x * 100), r(c.y * 100), r(ang(c.psi) * 1000), r(ang(c.psi - hd) * 1000),
            r(c.vx * 100), r(c.vy * 100), r(c.r * 1000),
            r((VX * ch + VY * sh) * 100), r((-VX * sh + VY * ch) * 100), r((c.ax || 0) * 100), r((c.delta || 0) * 1000),
            r((c.acel || 0) * 100), r((c.freio || 0) * 100), r(lim(c.deslize || 0, 0, 3) * 100), bits];
  };
  const base = (t, e) => ({ t, s: e[0] / 100, d: e[1] / 100, x: e[2] / 100, y: e[3] / 100, psi: e[4] / 1000, pr: e[5] / 1000,
    vx: e[6] / 100, vy: e[7] / 100, r: e[8] / 1000, sd: e[9] / 100, dd: e[10] / 100, ax: e[11] / 100, delta: e[12] / 1000,
    acel: e[13] / 100, freio: e[14] / 100, desl: e[15] / 100, bits: e[16] | 0, p0: null });

  /* onde a base põe o carro no tempo t (sem a correção) */
  function extrapolar(b, t){
    let dt = t - b.t;
    if(dt < -.1) dt = -.1;
    if(dt > Rede.MAX_EXTRA) dt = Rede.MAX_EXTRA;
    /* um estado "do futuro" (a tela um pouco atrás do relógio da sala) volta no tempo pela velocidade;
       adiante, a aceleração só nos primeiros 0,15 s, e o carro não anda para trás por causa dela */
    const da = Math.min(Math.max(dt, 0), .15);
    let ds = b.sd * dt;
    if(dt > 0){ ds += .5 * b.ax * da * da; if(b.sd > 0 && ds < 0) ds = 0; }
    /* o deslocamento lateral perde força (ninguém atravessa a pista inteira em linha reta) */
    const dd = b.dd * dt * (1 - Math.min(1, Math.abs(dt) / .6) * .5);
    return { s: b.s + ds, d: b.d + dd, pr: b.pr, dt, da };
  }

  /* chega um estado novo para um fantoche: a correção começa onde o carro está desenhado */
  Rede.novaBase = function(S, c, t, e){
    const rd = c.rd, nb = base(t, e);
    if(rd.base && t < rd.base.t) return false;
    const agora = S.t;
    if(rd.base){
      const at = Rede.estimar(S, c, agora), nv = extrapolar(nb, agora);
      const eS = at.s - nv.s, eD = at.d - nv.d, eP = ang(at.pr - nv.pr);
      if(Math.abs(eS) > Rede.SALTO_S || Math.abs(eD) > 6){ rd.eS = rd.eD = rd.eP = 0; rd.saltou = true; }
      else { rd.eS = eS; rd.eD = eD; rd.eP = eP; }
      rd.tErr = agora;
      /* erro grande se desfaz mais devagar: a correção anda no máximo VCORR (e 6 m/s de lado) */
      rd.tau = Math.max(Rede.TAU, Math.abs(rd.eS) / Rede.VCORR, Math.abs(rd.eD) / 6);
    } else { rd.eS = rd.eD = rd.eP = 0; rd.tErr = agora; rd.saltou = true; rd.tau = Rede.TAU; }
    rd.base = nb;
    return true;
  };
  /* a posição desenhada no tempo t: a base levada até t, mais a correção que ainda falta desfazer */
  Rede.estimar = function(S, c, t){
    const rd = c.rd, x = extrapolar(rd.base, t);
    const f = Math.exp(-Math.max(0, t - rd.tErr) / (rd.tau || Rede.TAU));
    return { s: x.s + rd.eS * f, d: x.d + rd.eD * f, pr: x.pr + rd.eP * f, dt: x.dt, da: x.da };
  };
  /* põe o fantoche no lugar do tempo t (antes do passo, com t = o fim do passo) */
  Rede.posicionar = function(S, c, t){
    const rd = c.rd, b = rd.base; if(!b) return;
    const P = S.P, x = Rede.estimar(S, c, t);
    /* o x, y da base mais o quanto a pista levou o carro adiante (e a correção, se falta desfazer) */
    const p0 = b.p0 || (b.p0 = C2D.Pista.ponto(P, b.s, b.d));
    const p = C2D.Pista.ponto(P, x.s, x.d);
    const X = b.x + (p.x - p0.x), Y = b.y + (p.y - p0.y);
    const psi = b.psi + ang(p.hd - p0.hd) + (x.pr - b.pr);
    if(rd.saltou){ c.px = X; c.py = Y; c.ppsi = psi; c.psi = psi; rd.saltou = false; }
    else { c.px = c.x; c.py = c.y; c.ppsi = c.psi; }
    c.x = X; c.y = Y;
    c.psi = c.ppsi + ang(psi - c.ppsi);
    const vx = b.vx + b.ax * x.da;
    c.vx = vx < -2 && !(b.bits & 4) ? -2 : vx; c.vy = b.vy; c.r = b.r; c.v = Math.hypot(c.vx, c.vy);
    c.i = p.i; c.sTot = x.s; c.s = ((x.s % P.L) + P.L) % P.L; c.d = x.d;
    c.delta = b.delta; c.acel = b.acel; c.freio = b.freio; c.deslize = b.desl;
    c.travF = !!(b.bits & 1); c.patinaR = !!(b.bits & 2); c.re = !!(b.bits & 4);
    if(c.estado === 'pista' || c.estado === 'chegou') c.fantasma = !!(b.bits & 8);
    c.drsAberto = !!(b.bits & 16);
    c.piso = C2D.Pista.piso(P, c.i, c.s, c.d);
  };

  /* ── o que muda pouco (vai só quando muda, e inteiro a cada 2 s) ── */
  const ESTADO = { pista: 0, chegou: 1, fora: 2 }, ESTADO_N = ['pista', 'chegou', 'fora'];
  const r3 = v => v == null || !isFinite(v) ? null : Math.round(v * 1000) / 1000;
  Rede.meta = function(S, c){
    const hv = (c.historico || []).filter(h => h.valida && h.t > 0).slice(-5).map(h => r3(h.t));
    return {
      e: ESTADO[c.estado] != null ? ESTADO[c.estado] : 0, ft: c.foraTipo || 0, fv: c.foraVolta || 0,
      l: c.voltas || 0, i: r3(c.ini), mb: r3(c.melhor), u: c.ultima ? [r3(c.ultima.t), c.ultima.valida ? 1 : 0] : 0,
      f: r3(c.fim), p: c.penal || 0, a: c.avisos || 0,
      pc: c.pneu ? c.pneu.c : 0, pg: c.pneu ? Math.round(c.pneu.gasto * 100) : 0, cb: c.comb != null ? Math.round(c.comb * 100) : 0,
      bx: c.box ? c.box.fase : 0, ms: c.mascara || '', pr: c.paradas || 0, pn: (c.pneus || []).join(','),
      rc: c.recolhido ? 1 : 0, ds: c.destruido ? 1 : 0, hv: hv.join(',')
    };
  };
  /* só as chaves que mudaram desde o último envio (null quando nada mudou) */
  Rede.diferenca = function(novo, velho){
    if(!velho) return novo;
    let out = null;
    for(const k in novo){
      const a = novo[k], b = velho[k];
      if(Array.isArray(a) ? !(Array.isArray(b) && a[0] === b[0] && a[1] === b[1]) : a !== b){ (out = out || {})[k] = a; }
    }
    return out;
  };
  /* aplica a meta num carro. quem: 'fantoche' (tudo) ou 'meu' (só o que é do servidor: punição,
     desclassificação, carro assumido) ou 'humano' (no servidor: o que o dono conta do carro dele) */
  Rede.aplicarMeta = function(S, c, m, quem){
    if(!m) return;
    const tem = k => Object.prototype.hasOwnProperty.call(m, k);
    if(quem === 'meu'){
      if(tem('p')) c.penal = m.p;
      if(tem('e') && m.e === 2 && m.ft === 'DSQ' && c.estado !== 'fora') C2D.Corrida.abandonar(S, c, 'DSQ');
      return;
    }
    if(tem('e')){
      const novo = ESTADO_N[m.e] || 'pista';
      if(quem === 'humano'){
        /* o servidor decide a desclassificação: o carro fora no servidor não volta */
        if(novo === 'fora' && c.estado !== 'fora') C2D.Corrida.abandonar(S, c, m.ft || c.foraTipo || 'ACID');
        else if(novo === 'chegou' && c.estado === 'pista'){ c.estado = 'chegou'; c.fantasma = true; }
      } else {
        c.estado = novo;
        /* quem chegou ou abandonou não ocupa lugar na pista (como no jogo solo, Corrida.abandonar) */
        if(novo !== 'pista') c.fantasma = true;
      }
    }
    if(tem('ft') && quem !== 'humano') c.foraTipo = m.ft || null;
    if(tem('fv') && quem !== 'humano') c.foraVolta = m.fv || null;
    if(tem('l')) c.voltas = m.l;
    if(tem('i')) c.ini = m.i;
    if(tem('mb')) c.melhor = m.mb == null ? Infinity : m.mb;
    if(tem('u')) c.ultima = m.u ? { t: m.u[0], valida: !!m.u[1] } : null;
    if(tem('f')) c.fim = m.f;
    if(tem('p') && quem !== 'humano') c.penal = m.p;
    if(tem('a')) c.avisos = m.a;
    if(c.pneu && tem('pc') && m.pc) c.pneu.c = m.pc;
    if(c.pneu && tem('pg')) c.pneu.gasto = m.pg / 100;
    if(tem('cb')) c.comb = m.cb / 100;
    if(tem('bx')) c.box = m.bx ? Object.assign(c.box || {}, { fase: m.bx }) : null;
    if(tem('ms') && m.ms !== (c.mascara || '')){
      c.mascara = m.ms;
      const soltas = m.ms ? m.ms.split(',') : [];
      if(c.partes) for(const k in c.partes) c.partes[k].solta = soltas.indexOf(k) >= 0;
    }
    if(tem('pr')) c.paradas = m.pr;
    if(tem('pn') && m.pn) c.pneus = m.pn.split(',');
    if(tem('rc') && quem !== 'humano'){ c.recolhido = !!m.rc; if(c.recolhido) c.fantasma = true; }
    if(tem('ds')) c.destruido = !!m.ds;
    if(tem('hv')) c.historico = m.hv ? m.hv.split(',').map(t => ({ t: +t, valida: true })) : [];
    if(tem('as')) c.assumido = !!m.as;
  };

  /* ── o que vale para a corrida inteira (o servidor manda; a tela não decide) ── */
  const ORDEM_ESTADO = { luzes: 0, lancada: 1, pista: 2 };
  Rede.global = function(S){
    return { es: S.estado, tl: r3(S.tLuzes || 0), lz: S.luzes || 0, ve: r3(S.verdeEm), bd: S.bandeira || 0, tf: r3(S.tFim), ac: S.acabou ? 1 : 0,
             sc: S.sc || 0, vsc: S.vsc || 0, hs: S.houveSC ? 1 : 0, fl: S.fl && S.fl.id != null ? [S.fl.id, r3(S.fl.t), S.fl.volta] : 0,
             w: Math.round((S.amb.w || 0) * 1000) / 1000, ch: S.choveu ? 1 : 0 };
  };
  Rede.aplicarGlobal = function(S, g){
    if(!g) return;
    /* a largada só anda para a frente: as luzes da tela podem apagar um instante antes do quadro */
    if((ORDEM_ESTADO[g.es] || 0) > (ORDEM_ESTADO[S.estado] || 0)){
      if(S.estado === 'luzes' || S.estado === 'lancada'){ S.verdeEm = g.ve != null ? g.ve : S.t; S.luzes = 0; S.eventos.push({ t: S.t, tipo: 'verde' }); }
      S.estado = g.es;
    }
    if(S.estado === 'luzes' && g.es === 'luzes'){ S.luzes = Math.max(S.luzes || 0, g.lz || 0); }
    if(g.bd && !S.bandeira){ S.bandeira = g.bd; }
    if(g.tf != null) S.tFim = g.tf;
    S.acabou = !!g.ac;
    S.sc = g.sc || null; S.vsc = g.vsc || null;
    if(g.hs) S.houveSC = true;
    if(g.fl) S.fl = { id: g.fl[0], t: g.fl[1], volta: g.fl[2] };
    if(g.ch) S.choveu = true;
    if(typeof g.w === 'number') S.amb.w = g.w;
  };

  /* ── a tela: a sessão com o próprio carro, o relógio do servidor e o que vai e vem ──
     opc: { slot, enviar(msg), agora() (ms), k (a chave da corrida na sala) } */
  Rede.Cliente = function(def, opc){
    const agoraMs = opc.agora || (() => (typeof performance !== 'undefined' ? performance.now() : Date.now()));
    const R = {
      def, k: opc.k, slot: String(opc.slot), enviar: opc.enviar || (() => {}), S: null,
      theta: null, thetaAlvo: null, amostras: [], iniciou: false, g: null, metaEnv: null, ultMetaFull: -1e9,
      ultEnvio: -1e9, assumido: false, adotar: false, evIdx: 0, toques: [], fila: [],
      medidas: { quadros: 0, humanos: 0, rtt: null, saltos: 0, adocoes: 0, atrasoMax: 0 }
    };
    R.agora = agoraMs;
    R.sessao = function(carrosTela){
      const S = R.S = Rede.criarSessao(def, { slot: R.slot }, carrosTela);
      S.rede.antes = (S, dt) => { for(const c of S.carros) if(c.remoto) Rede.posicionar(S, c, S.t + dt); };
      S.rede.depois = (S, dt) => R.depoisDoPasso(S, dt);
      S.rede.espelho = true;
      R.eu = S.eu;
      if(R.fila.length){ const f = R.fila; R.fila = []; f.forEach(m => R.receber(m.m, m.em)); }
      return S;
    };
    /* o relógio da tela: quantos passos dar para alcançar o agora do servidor */
    R.relogio = {
      _alfa: 0,
      quadro(agora){
        const S = R.S; R.relogio._alfa = 0;
        if(!S || !R.iniciou || R.theta == null) return 0;
        /* a estimativa do relógio anda devagar para o alvo (pulos só quando ela erra muito) */
        if(R.thetaAlvo != null){
          const d = R.thetaAlvo - R.theta;
          R.theta += Math.abs(d) > .15 ? d : lim(d, -.002, .002);
        }
        const alvo = agora / 1000 + R.theta;
        let falta = alvo - S.t;
        /* em dia com a sala há quanto tempo (a aba no fundo anda a 1 quadro por segundo e fica para trás) */
        if(falta < .25){ if(R.emDiaDesde == null) R.emDiaDesde = agora; } else R.emDiaDesde = null;
        if(falta > 1){ R.saltar(alvo); falta = alvo - S.t; }
        if(falta <= 0) return 0;
        let n = Math.floor(falta / C2D.DT + 1e-9);
        if(n > 30) n = 30;
        R.relogio._alfa = lim((falta - n * C2D.DT) / C2D.DT, 0, 1);
        return n;
      },
      get alfa(){ return R.relogio._alfa; },
      zerar(){}
    };
    /* a tela ficou para trás (aba escondida): o tempo pula; o carro, o servidor assumiu e devolve */
    R.saltar = function(alvo){
      const S = R.S, dt = alvo - S.t;
      R.medidas.saltos++;
      S.t = alvo; if(S.estado === 'luzes') S.tLuzes = (S.tLuzes || 0) + dt;
      for(const c of S.carros) if(c.rd) c.rd.saltou = true;
    };
    R.depoisDoPasso = function(S, dt){
      Rede.aplicarGlobal(S, R.g);
      const c = R.eu;
      /* os toques do meu carro com outro humano: o servidor julga (ele vê os dois) */
      for(; R.evIdx < S.eventos.length; R.evIdx++){
        const e = S.eventos[R.evIdx];
        if(e.tipo !== 'toque' || (e.a !== c.id && e.b !== c.id)) continue;
        const o = S.carros.find(x => x.id === (e.a === c.id ? e.b : e.a));
        if(o && o.humano) R.toques.push([o.idx, e.v]);
      }
      if(R.assumido || !R.iniciou) return;
      if(S.t - R.ultEnvio < 1 / Rede.HZ_EU - 1e-6) return;
      R.ultEnvio = S.t;
      const m = Rede.meta(S, c), cheio = S.t - R.ultMetaFull > 2;
      const dif = cheio ? m : Rede.diferenca(m, R.metaEnv);
      if(cheio) R.ultMetaFull = S.t;
      R.metaEnv = m;
      const msg = { t: 'c2dEu', k: R.k, ts: Math.round(S.t * 1000) / 1000, tl: Math.round(R.agora() * 10) / 10, e: Rede.dinamica(S, c) };
      if(dif) msg.m = dif;
      if(R.adotar){ msg.ad = 1; R.adotar = false; }
      if(R.toques.length){ msg.tq = R.toques.splice(0, 4); }
      R.enviar(msg);
    };
    /* o eco do servidor: a diferença entre os relógios, pela amostra de menor ida e volta */
    R.sincronizar = function(q, emMs){
      const eco = q.eco && q.eco[R.slot];
      if(eco){
        const tl = eco[0] / 1000, ts = eco[1], T3 = emMs / 1000;
        /* (em rede local a conta arredondada pode dar um tico negativa) */
        const bruto = (T3 - tl) - (q.tq - ts), rtt = Math.max(0, bruto);
        if(bruto >= -.003 && bruto < 5){
          const th = ((ts - tl) + (q.tq - T3)) / 2;
          R.amostras.push({ rtt, th }); if(R.amostras.length > 24) R.amostras.shift();
          const melhor = R.amostras.reduce((a, b) => b.rtt < a.rtt ? b : a);
          R.thetaAlvo = melhor.th; R.medidas.rtt = rtt;
          if(R.theta == null) R.theta = melhor.th;
        }
      }
      if(R.theta == null){ R.theta = R.thetaAlvo = q.tq - emMs / 1000 + .05; }
    };
    /* uma mensagem do servidor (c2dQ: o quadro de todos; c2dH: um humano, repassado na hora) */
    R.receber = function(m, emMs){
      if(emMs == null) emMs = R.agora();
      const S = R.S;
      if(!S){ R.fila.push({ m, em: emMs }); if(R.fila.length > 40) R.fila.shift(); return; }
      if(m.t === 'c2dH'){
        R.medidas.humanos++;
        const c = S.carros[m.i];
        if(c && c.remoto && c.humano) Rede.novaBase(S, c, m.ts, m.e);
        return;
      }
      if(m.t !== 'c2dQ') return;
      R.medidas.quadros++;
      R.sincronizar(m, emMs);
      if(m.ini) R.iniciou = true;
      R.g = m.g || R.g;
      if(Array.isArray(m.ev)) for(const e of m.ev){
        /* os meus avisos de limites já nascem na minha tela */
        if(e.tipo === 'punicao' && e.motivo === 'limites' && e.a === R.eu.id) continue;
        if((e.tipo === 'abandono' || e.tipo === 'quebra' || e.tipo === 'semComb') && e.a === R.eu.id && !R.assumido) continue;
        S.eventos.push(Object.assign({}, e, { t: Math.min(S.t, e.t) }));
      }
      if(Array.isArray(m.pun) && S.pun) for(const r of m.pun) S.pun.lista.push(r);
      if(m.m) for(const i in m.m){
        const c = S.carros[i]; if(!c) continue;
        if(c === R.eu){
          /* o que a sala sabe do meu carro, inteiro (para pegar de volta com as voltas e o cronômetro) */
          R.metaEu = Object.assign(R.metaEu || {}, m.m[i]);
          /* na bandeirada final (ou no pulo para o fim) o meu carro também fica como a sala fechou */
          Rede.aplicarMeta(S, c, m.m[i], m.g && m.g.ac ? 'fantoche' : 'meu');
          if(Object.prototype.hasOwnProperty.call(m.m[i], 'as')){
            const as = !!m.m[i].as;
            if(as && !R.assumido){ R.assumido = true; c.remoto = true; c.rd.base = null; }
            else if(!as && R.assumido && !R.adotar){ R.assumido = false; c.remoto = false; }
          }
        } else Rede.aplicarMeta(S, c, m.m[i], 'fantoche');
      }
      if(Array.isArray(m.e)) for(const x of m.e){
        const c = S.carros[x[0]]; if(!c) continue;
        const t = m.t2 - (x[1] || 0) / 1000;
        if(c === R.eu){
          /* o servidor está com o meu carro: ele anda como fantoche até eu pegar de volta */
          if(R.assumido){ Rede.novaBase(S, c, t, x.slice(2)); R.querAdotar = true; }
          continue;
        }
        if(c.remoto) Rede.novaBase(S, c, t, x.slice(2));
      }
      /* pegar o carro de volta: do ponto em que o servidor deixou, e só com a tela em dia há meio segundo
         (senão a sala e a tela ficam trocando o carro de mão a cada segundo) */
      if(R.assumido && R.querAdotar && R.eu.rd.base && S.t > 0 && R.emDiaDesde != null && emMs - R.emDiaDesde > 500 && !(R.metaEu && R.metaEu.bx)){
        Rede.posicionar(S, R.eu, S.t); R.eu.px = R.eu.x; R.eu.py = R.eu.y; R.eu.ppsi = R.eu.psi;
        const b = R.eu.rd.base; R.eu.vx = b.vx; R.eu.vy = b.vy; R.eu.r = b.r;
        /* as voltas, o cronômetro, o pneu e o box como a sala deixou (ela cruzou a linha por mim) */
        if(R.metaEu){
          const fant = R.eu.fantasma;
          Rede.aplicarMeta(S, R.eu, R.metaEu, 'fantoche');
          R.eu.fantasma = fant; R.eu.voltaFeita = R.eu.voltas; R.eu.tSetor = null; R.eu.setores = [null, null, null];
        }
        R.eu.remoto = false; R.assumido = false; R.querAdotar = false; R.adotar = true; R.medidas.adocoes++;
        R.ultEnvio = -1e9;
      }
      const atraso = S.t - m.t2; if(atraso > R.medidas.atrasoMax) R.medidas.atrasoMax = atraso;
    };
    return R;
  };

  /* ── os ajustes nas peças do jogo, só para sessões em rede (S.rede); fora delas, nada muda ── */
  /* toques: cada lado só resolve os toques em que entra um carro que ele simula */
  const colOrig = C2D.Carro.colisoes;
  C2D.Carro.colisoes = function(lista){
    let rede = false;
    for(let k = 0; k < lista.length; k++) if(lista[k].remoto){ rede = true; break; }
    if(!rede) return colOrig.call(this, lista);
    const toques = [], nC = lista.length;
    for(let p = 0; p < nC; p++){
      const A = lista[p]; if(A.fantasma) continue;
      for(let q = p + 1; q < nC; q++){
        const B = lista[q]; if(B.fantasma || (A.remoto && B.remoto)) continue;
        const dx = B.x - A.x, dy = B.y - A.y, l2 = (A.sp.comp + B.sp.comp) * .55;
        if(dx * dx + dy * dy > l2 * l2) continue;
        const r = C2D.Carro.contato(A, B, dx, dy);
        if(r) toques.push(r);
      }
    }
    return toques;
  };
  /* o dano de um fantoche é do lado que o simula: aqui ele não perde peça */
  if(C2D.Dano){
    const danoOrig = C2D.Dano.processar;
    C2D.Dano.processar = function(S){
      if(S.rede) for(const c of S.carros) if(c.remoto && c.impactos) c.impactos.length = 0;
      return danoOrig.apply(this, arguments);
    };
  }
  /* na tela, a direção de prova e o safety car são do servidor */
  const naTela = S => !!(S && S.rede && S.rede.espelho);
  const calar = (obj, nomes) => { if(obj) nomes.forEach(n => { const f = obj[n]; if(typeof f === 'function') obj[n] = function(S){ return naTela(S) ? undefined : f.apply(this, arguments); }; }); };
  calar(C2D.Boxes, ['incidente', 'controle']);
  calar(C2D.Punicoes, ['antesDosToques', 'toque', 'depois']);
  /* no servidor: punição de quem está pilotando de verdade não fica pendente (drive-through e
     stop-and-go viram o tempo da regra: cumprir no box dependeria da tela do dono) */
  if(C2D.Punicoes && C2D.Punicoes.aplicar){
    const aplOrig = C2D.Punicoes.aplicar;
    C2D.Punicoes.aplicar = function(S, c){
      const r = aplOrig.apply(this, arguments);
      if(S && S.rede && S.rede.srv && c && c.humano && c.remoto && c.punPend && c.punPend.length){ C2D.Punicoes.converter(S, c); c.punPend.length = 0; }
      return r;
    };
  }
})(typeof window !== 'undefined' ? window : globalThis);
