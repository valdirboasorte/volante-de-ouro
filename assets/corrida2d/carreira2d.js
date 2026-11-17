/* Corrida 2D na carreira de piloto: do fim de semana do jogo para a pista e de volta.
   - corrida: recebe a mesma entrada da corrida ao vivo (Gp.entrada) e devolve o resultado
     pelo mesmo caminho (aoFim → Gp.chegada → Engine.runRace → Game.fecharCorrida);
   - classificação: o motor sorteia o sábado dos rivais (Engine.rodarQuali) e a sua volta
     de verdade decide onde você larga;
   - treino: você roda à vontade e o programa escolhido vale como na clássica.
   O carro de cada equipe anda o que a força do carro diz (fator de tempo de volta exato);
   o talento de cada rival vira a competência da IA; a sua ficha mexe no carro, nunca no volante. */
(function(raiz){
  const C2D = raiz.C2D;
  const { lim } = C2D;
  const n75 = x => lim(((x == null ? 70 : x) - 75) / 20, -1.25, 1.25);

  C2D.Carreira = {
    /* a ficha do jogador no carro dele (efeitos pequenos: o que decide é como ele pilota) */
    mods(quali){
      const a = (S.driver && S.driver.attr) || {}, fi = (Engine.ficha && Engine.ficha()) || {};
      return {
        ader: 1 + .012 * n75(a.pace) + (quali ? .008 * n75(fi.quali != null ? fi.quali : a.pace) : 0),
        pneu: (Engine.fichaVivo && Engine.fichaVivo() || {}).pneu || 1,      /* gestão de pneus: gasta menos */
        trac: 1 + .01 * n75(a.pace),
        C: 1.35 - .07 * n75(a.cons),             /* constância: o pneu perdoa mais depois do pico */
        chuva: 1 + .25 * n75(a.wet)               /* chuva: perde menos no molhado */
      };
    },

    /* a força do carro de cada um vira um fator de tempo de volta (1 = o melhor carro) */
    fatores(sea, ids, P, sk, ano, nivel, wet){
      const trk = sea.calendar[sea.round] || { type: P.tipo };
      const W = Engine.trackWeights(trk.type, wet);
      const Ncl = Prova.voltas(sk, nivel, ano, Object.assign({ id: P.id, type: P.tipo }, trk), P.L, P.Tref).N;
      const s1 = Prova.segPorPonto(sk, ano, nivel) / Math.max(1, Ncl);
      const aj = Engine.setupEfeito(sea, sea.round), gente = Engine.bonusGente ? Engine.bonusGente() : { car: 0 };
      const car = {};
      ids.forEach(id => {
        const f = sea.field.find(x => x.id === id); if(!f) return;
        let v = Engine.carStr(sea, f.teamId, sea.round);
        if(f.isMe) v += (aj.carR || 0) + (gente.car || 0);
        car[id] = v;
      });
      const top = Math.max(...Object.values(car));
      const k = {};
      Object.keys(car).forEach(id => k[id] = 1 + W.car * (top - car[id]) * s1 / P.Tref);
      return { k, car, W, Ncl };
    },

    /* a melhor volta possível no carro de referência (a IA no limite), medida na própria física */
    voltaIdeal(P, sk, ano, nivel){
      if(P._ideal) return P._ideal;
      const c = C2D.Carro.criar(P, { sk, ano, nivel });
      C2D.Carro.posicionar(c, P, -250, 0);
      c.vx = P.seco.v[Math.floor(((P.L - 250) % P.L) / P.ds)] * .9;
      const ia = C2D.IA.criar({ ritmo: 1 });
      let t = 0, ini = null, fim = null, g = 0;
      while(fim == null && g++ < 120 * 400){
        const s0 = c.sTot;
        C2D.Carro.passo(c, P, C2D.IA.comandar(ia, c, P, {}), C2D.DT, {});
        t += C2D.DT;
        if(s0 < 0 && c.sTot >= 0) ini = t;
        if(s0 < P.L && c.sTot >= P.L) fim = t;
      }
      P._ideal = fim != null && ini != null ? fim - ini : P.Tref * 1.02;
      return P._ideal;
    },

    nivelIA(){ const aj = raiz.Corrida2D && raiz.Corrida2D.ajustes ? raiz.Corrida2D.ajustes() : { ia: 'medio' }; return C2D.NIVEIS[aj.ia] ? aj.ia : 'medio'; },

    /* ── a corrida ── */
    corrida(ent, opc, aoFim, M){
      const sea = S.season;
      const P = C2D.Pista.criar(ent.trkId, ent.ano, { sk: ent.sk, nivel: ent.nivel });
      const wet = !!ent.wet;
      const fx = C2D.Carreira.fatores(sea, ent.carros.map(c => c.id), P, ent.sk, ent.ano, ent.nivel, wet);
      const aj = raiz.Corrida2D.ajustes();
      const N = Math.max(3, Math.round(fx.Ncl * aj.dist));
      /* o talento sem o carro: é o que vira competência da IA */
      const ent2 = Object.assign({}, ent, { carros: ent.carros.map(c => Object.assign({}, c, { ritmo: (c.ritmo != null ? c.ritmo : 60) - fx.W.car * (fx.car[c.id] || 0) })) });
      const carros = C2D.Corrida.montarGrid(ent2, { nivel: C2D.Carreira.nivelIA(), voltas: N }).map(o => {
        o.k = fx.k[o.id] || 1;
        if(o.me){ o.mods = C2D.Carreira.mods(false); o.nome = o.nome || (S.driver && S.driver.name) || 'Você'; if(S.driver && S.driver.num != null) o.num = S.driver.num; }
        const e = ent.carros.find(c => c.id === o.id) || {};
        if(e.pneuIni) o.pneuIni = e.pneuIni;
        if(e.pneu0) o.pneu0 = e.pneu0;
        if(o.me && e.pneuMult) o.mods.pneu = e.pneuMult;
        return o;
      });
      /* o erro que o motor sorteou para o jogador sai do resumo: na 2D quem decide é quem pilota */
      if(M && Array.isArray(M.notas)) for(let q = M.notas.length - 1; q >= 0; q--) if(['erro', 'escorregao', 'mecanica'].indexOf(M.notas[q]) >= 0) M.notas.splice(q, 1);
      /* o tempo do dia: o mesmo sorteio da corrida clássica (Gp.clima com a mesma semente) */
      const trk = (typeof TRACKS !== 'undefined' && TRACKS[ent.trkId]) || { id: ent.trkId, type: P.tipo, rainP: .2 };
      const clima = Gp.clima(ent, trk, P.Tref, fx.Ncl, P.oval);
      return C2D.Tela.abrirCorrida({
        trkId: ent.trkId, ano: ent.ano, sk: ent.sk, nivel: ent.nivel, cat: ent.cat || sea.cat, voltas: N, carros, semente: ent.seed || 7, w: clima.w0,
        boxes: { sk: ent.sk, ano: ent.ano, nivel: ent.nivel, fracao: N / fx.Ncl, Ncl: fx.Ncl, wet, pista: clima.pista }, clima,
        titulo: 'Corrida', gp: ent.gp ? 'GP ' + ent.gp : '', nivelRivais: C2D.Carreira.nivelIA(), textoConcluir: 'Continuar',
        aoFim: (res, notasDe) => aoFim(res, notasDe)
      });
    },

    /* ── a classificação ── */
    quali(janela, original){
      const sea = S.season, rd = sea.round, trk = sea.calendar[rd];
      const fds = Engine.garantirFds(sea, rd);
      /* o sábado dos rivais, como na clássica (janela, pista que evolui, erros, cortes) */
      const q = Engine.rodarQuali(sea, rd, janela);
      const sk = S.series, nivel = Prova.nivelDe(sea), ano = sea.year;
      const P = C2D.Pista.criar(trk.id, ano, { sk, nivel });
      const wet = Engine.climaDe ? !!Engine.climaDe(sea, rd) : false;
      const ids = q.ordem.map(o => o.id);
      const fx = C2D.Carreira.fatores(sea, ids, P, sk, ano, nivel, wet);
      const T100 = C2D.Carreira.voltaIdeal(P, sk, ano, nivel) * (wet ? 1.08 : 1);
      const nv = C2D.NIVEIS[C2D.Carreira.nivelIA()];
      /* o tempo de cada rival: o carro dele e o talento dele, na ordem que o motor sorteou */
      const rivais = q.ordem.filter(o => !o.me && !(o.fora === 'DNPQ'));
      const tal = rivais.map(o => { const f = sea.field.find(x => x.id === o.id) || {}; return (f.skill || 60) + (f.qb || 0); });
      const tMax = Math.max(...tal), tMin = Math.min(...tal);
      const brutos = rivais.map((o, k) => T100 * (fx.k[o.id] || 1) / (nv.ritmo + nv.faixa * ((tMax > tMin ? (tal[k] - tMin) / (tMax - tMin) : .5) - .5) * 2));
      const ord = brutos.slice().sort((a, b) => a - b);
      const tempos = {}; rivais.forEach((o, k) => tempos[o.id] = ord[k]);
      const meuK = fx.k.ME || 1;
      return C2D.Tela.abrir({
        tipo: 'classificacao', trkId: trk.id, ano, sk, nivel, cat: sea.cat, w: wet ? .7 : 0, semente: (sea.gpSeed && sea.gpSeed[rd]) || 7,
        titulo: 'Sessão de classificação', gp: 'GP ' + trk.gp, limiteVoltas: 3, textoSair: 'Encerrar a classificação',
        carros: [{ id: 'ME', me: true, nome: S.driver.name, cor: (S.team && S.team.color) || '#e2231a', k: meuK, mods: C2D.Carreira.mods(true) }],
        referencia: ord[0],
        aoFim: resumo => {
          const meu = resumo && resumo.melhor;
          C2D.Carreira.fecharQuali(sea, rd, q, tempos, meu);
          fds.etapa = 'corrida';
          Game.save();
          UI.qualiResultado(fds.quali);
        }
      });
    },
    /* a sua volta entra entre os tempos dos rivais e o grid é refeito com o regulamento da etapa */
    fecharQuali(sea, rd, q, tempos, meu){
      const fds = Engine.garantirFds(sea, rd);
      const ordem = q.ordem.filter(o => !o.me).map(o => o.id);
      const fora = q.ordem.filter(o => o.fora === 'DNPQ').map(o => o.id);
      const com = ordem.filter(id => fora.indexOf(id) < 0);
      let pos = meu ? com.filter(id => tempos[id] != null && tempos[id] < meu).length : com.length;
      com.splice(pos, 0, 'ME');
      const campos = com.concat(fora).map(id => sea.field.find(f => f.id === id)).filter(Boolean);
      const corte = Engine.cortarGrid(sea, rd, campos);
      const grid = {}; corte.largam.forEach((f, i) => grid[f.id] = i + 1);
      sea.naoLarga = sea.naoLarga || {};
      if(Object.keys(corte.fora).length) sea.naoLarga[rd] = corte.fora; else delete sea.naoLarga[rd];
      tempos = Object.assign({}, tempos); if(meu) tempos.ME = meu;
      const notas = q.notas.filter(t => !/Você ficou fora do grid|pré-classificação/.test(t));
      if(corte.fora.ME) notas.push(corte.fora.ME === 'DNPQ' ? 'Você não passou da pré-classificação. O fim de semana acabou na sexta de manhã.' : 'Você ficou fora do grid. Não largou.');
      if(!meu) notas.push('Sem volta válida na classificação: você larga do fim do grid.');
      fds.quali = Object.assign({}, q, {
        grid, notas, minha: grid.ME || null, foraMe: corte.fora.ME || null, modo: '2d', tempos,
        ordem: campos.map(f => ({ id: f.id, name: f.name, cc: f.cc, me: !!f.isMe, fora: corte.fora[f.id] || null }))
      });
      return fds.quali;
    },

    /* ── o treino ── */
    treino(k, original){
      const sea = S.season, rd = sea.round, trk = sea.calendar[rd];
      const sk = S.series, nivel = Prova.nivelDe(sea), ano = sea.year;
      const P = C2D.Pista.criar(trk.id, ano, { sk, nivel });
      const wet = Engine.climaDe ? !!Engine.climaDe(sea, rd) : false;
      const fx = C2D.Carreira.fatores(sea, ['ME'], P, sk, ano, nivel, wet);
      return C2D.Tela.abrir({
        tipo: 'treino', trkId: trk.id, ano, sk, nivel, cat: sea.cat, w: wet ? .6 : 0, titulo: 'Treino livre', gp: 'GP ' + trk.gp, textoSair: 'Encerrar o treino',
        carros: [{ id: 'ME', me: true, nome: S.driver.name, cor: (S.team && S.team.color) || '#e2231a', k: fx.k.ME || 1, mods: C2D.Carreira.mods(false) }],
        aoFim: resumo => {
          original.call(Game, k);
          if(resumo && resumo.melhor) setTimeout(() => UI.toast('Sua melhor volta no treino 2D: ' + C2D.fmtVolta(resumo.melhor) + '.'), 400);
        }
      });
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
