/* Corrida 2D: a tela (a camada por cima do jogo, o painel e os botões).
   Abre por cima de tudo, roda o laço (passo fixo da física, desenho a cada quadro, painel
   10 vezes por segundo) e fecha devolvendo o resumo. Os textos ficam no DOM para a
   tradução do jogo alcançar; números que mudam o tempo todo levam data-i18n-ignore. */
(function(raiz){
  const C2D = raiz.C2D;
  const { lim } = C2D;
  const $ = (r, s) => r.querySelector(s);

  /* preferências do aparelho (fora do save): câmera, assistências, tipo de controle de toque */
  const PREF_K = 'vdo_c2d';
  const PADRAO = { camera: 'perseguir', abs: true, tc: true, estab: true, direcao: true, toque: 'botoes', freioAuto: true, linha: true, danosRed: true, ritmo: 1, boxAuto: true,
                   pularSC: true, limites: 'tolerante', zoom: 1.6 };
  /* as distâncias da câmera (1 = a antiga, a mais longe) */
  const ZOOMS = [1, 1.25, 1.6, 2.2, 2.8];
  const pref = () => { try { return Object.assign({}, PADRAO, JSON.parse(localStorage.getItem(PREF_K) || '{}')); } catch(e){ return Object.assign({}, PADRAO); } };
  const salvarPref = p => { try { localStorage.setItem(PREF_K, JSON.stringify(p)); } catch(e){} };
  C2D.pref = pref;

  const tr = t => (raiz.VDO_I18N && raiz.VDO_I18N.text) ? raiz.VDO_I18N.text(t) : t;
  C2D.tr = tr;
  const toqueProvavel = () => { try { return matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window; } catch(e){ return false; } };

  function html(opc){
    return `
      <canvas class="c2d-mundo"></canvas>
      <div class="c2d-hud">
        <div class="c2d-topo">
          <div class="c2d-caixa c2d-esq">
            <div class="c2d-linha"><span class="c2d-rot">${opc.tipo === 'corrida' ? 'Volta' : opc.limiteVoltas ? 'Lançadas' : 'Voltas'}</span><b class="c2d-num" data-i18n-ignore data-c2d="volta">0</b></div>
            <div class="c2d-linha c2d-pos"${opc.tipo === 'corrida' ? '' : ' hidden'}><span class="c2d-rot">Posição</span><b class="c2d-num" data-i18n-ignore data-c2d="pos">1</b></div>
            <div class="c2d-sessao"><span>${opc.titulo || 'Treino livre'}</span>${opc.gp ? ' <span class="c2d-gp">' + String(opc.gp).replace(/[<>&]/g, '') + '</span>' : ''}</div>
            ${opc.referencia ? '<div class="c2d-ref"><span class="c2d-rot">Pole dos rivais</span> <b data-i18n-ignore>' + C2D.fmtVolta(opc.referencia) + '</b></div>' : ''}
          </div>
          <div class="c2d-caixa c2d-cron">
            <b class="c2d-tempo" data-i18n-ignore data-c2d="tempo">0.000</b>
            <span class="c2d-delta" data-i18n-ignore data-c2d="delta"></span>
            <div class="c2d-setores"><i data-c2d="s0"></i><i data-c2d="s1"></i><i data-c2d="s2"></i></div>
            <div class="c2d-pares"><span class="c2d-rot">Última</span><b data-i18n-ignore data-c2d="ult">—</b><span class="c2d-rot">Melhor</span><b data-i18n-ignore data-c2d="melhor">—</b></div>
          </div>
          <canvas class="c2d-mapa"></canvas>
        </div>
        <ol class="c2d-torre" data-c2d="torre" data-i18n-ignore hidden></ol>
        <div class="c2d-bandeira" data-c2d="bandeira" hidden></div>
        <div class="c2d-aviso" data-c2d="aviso" hidden></div>
        <div class="c2d-baixo">
          <div class="c2d-rpm" data-c2d="rpm">${'<i></i>'.repeat(14)}</div>
          <div class="c2d-velo"><b class="c2d-num" data-i18n-ignore data-c2d="vel">0</b><span>km/h</span></div>
          <div class="c2d-marcha" data-i18n-ignore data-c2d="marcha">N</div>
          <div class="c2d-extra">
            <span class="c2d-pneu" data-c2d="pneu" hidden><i data-i18n-ignore data-c2d="pneuC">M</i><b data-i18n-ignore data-c2d="pneuG">0%</b></span>
            <span class="c2d-comb" data-c2d="comb" hidden><span class="c2d-rot">Comb.</span> <b data-i18n-ignore data-c2d="combV">—</b></span>
            <span class="c2d-boost" data-c2d="boost" hidden></span>
            <span class="c2d-danos" data-c2d="danos" hidden></span>
          </div>
        </div>
      </div>
      <button class="c2d-pausar" type="button" aria-label="Pausar">II</button>
      <button class="c2d-voltar" type="button" hidden>Voltar à pista</button>
      ${opc.tipo === 'corrida' ? '<button class="c2d-boxbtn" type="button" data-c2d="boxbtn">Box</button>' : ''}
      <div class="c2d-toque" hidden>
        <div class="c2d-tq-dir-grupo">
          <button class="c2d-tq c2d-tq-esq" type="button" aria-label="Esquerda">◀</button>
          <button class="c2d-tq c2d-tq-dir" type="button" aria-label="Direita">▶</button>
          <div class="c2d-faixa" hidden><span>Volante</span></div>
        </div>
        <div class="c2d-tq-ped-grupo">
          <button class="c2d-tq c2d-tq-freio" type="button">Freia</button>
          <button class="c2d-tq c2d-tq-acel" type="button">Acelera</button>
        </div>
      </div>
      <div class="c2d-luzes" hidden>${'<i></i>'.repeat(5)}</div>
      <div class="c2d-simulando" hidden><b>Simulando a corrida…</b><span data-i18n-ignore data-c2d="simVolta"></span></div>
      <div class="c2d-cortina" hidden aria-live="polite"><div class="c2d-cortina-tx"><b data-i18n-ignore data-c2d="scTitulo">SAFETY CAR</b><span data-c2d="scMotivo"></span><span data-c2d="scSub"></span><span class="c2d-cortina-barra"><i data-c2d="scBarra"></i></span><small><span>Volta</span> <span data-i18n-ignore data-c2d="scVolta"></span></small></div></div>
      <div class="c2d-contagem" hidden><span>Relargada em</span><b data-i18n-ignore data-c2d="contagem">3</b></div>
      <div class="c2d-resultado" hidden>
        <div class="c2d-menu-caixa c2d-res-caixa">
          <h2 data-c2d="resTitulo">Resultado</h2>
          <p class="c2d-res-sub" data-c2d="resSub"></p>
          <div class="c2d-res-tabela" data-c2d="resTabela" data-i18n-ignore></div>
          <button class="c2d-btn c2d-btn-ouro" data-m="concluir" type="button">${opc.textoConcluir || 'Continuar'}</button>
        </div>
      </div>
      <div class="c2d-menu" hidden>
        <div class="c2d-menu-caixa">
          <h2>Pausa</h2>
          <button class="c2d-btn c2d-btn-ouro" data-m="continuar" type="button">Continuar</button>
          ${opc.tipo === 'corrida' ? '<button class="c2d-btn" data-m="simular" type="button">Simular até a bandeirada</button>' : opc.aoFim ? '' : '<button class="c2d-btn" data-m="reiniciar" type="button">Recomeçar</button>'}
          <div class="c2d-opcoes">
            <label><input type="checkbox" data-o="freioAuto"> Freio assistido</label>
            <label><input type="checkbox" data-o="linha"> Linha de trajetória</label>
            <label><input type="checkbox" data-o="danosRed"> Danos reduzidos no meu carro</label>
            <label><input type="checkbox" data-o="boxAuto"> Box automático (a equipe chama)</label>
            <label><input type="checkbox" data-o="pularSC"> Pular o safety car (avança até a relargada)</label>
            <label class="c2d-op-sel">Limites de pista <select data-o="limites"><option value="tolerante">Tolerante</option><option value="rigoroso">Rigoroso</option><option value="desligado">Desligado</option></select></label>
            <label class="c2d-op-sel">Distância da câmera <select data-o="zoom"><option value="2.8">Colada no carro</option><option value="2.2">Bem perto</option><option value="1.6">Perto</option><option value="1.25">Média</option><option value="1">Longe</option></select></label>
            <label class="c2d-op-sel">Velocidade do jogo <select data-o="ritmo"><option value="1">100%</option><option value="0.85">85%</option><option value="0.7">70%</option></select></label>
            <label><input type="checkbox" data-o="abs"> Freio ABS</label>
            <label><input type="checkbox" data-o="tc"> Controle de tração</label>
            <label><input type="checkbox" data-o="estab"> Controle de estabilidade</label>
            <label><input type="checkbox" data-o="direcao"> Direção progressiva</label>
            <label><input type="checkbox" data-o="norte"> Mapa fixo (norte para cima)</label>
            <label><input type="checkbox" data-o="faixa"> Toque: faixa de volante</label>
          </div>
          <button class="c2d-btn" data-m="garagem" type="button">Garagem: ver todos os carros</button>
          <p class="c2d-ajuda">Teclado: setas ou WASD · Shift: ultrapassagem · R: voltar à pista · C: câmera · P ou Esc: pausa. Controle: alavanca, gatilhos, Start.</p>
          <button class="c2d-btn c2d-btn-sair" data-m="sair" type="button">${opc.textoSair || 'Sair do treino'}</button>
        </div>
      </div>`;
  }

  C2D.Tela = {
    aberta: null,

    /* abre um treino livre (a fase do protótipo): opc { trkId, ano, sk, nivel, nome, cor, titulo, aoFim } */
    abrirTreino(opc){ return C2D.Tela.abrir(Object.assign({ tipo: 'treino' }, opc || {})); },
    /* a garagem: todos os carros do catálogo (estilos2d.js), por família, na mesma escala,
       com o nome do carro de verdade e os campeonatos e anos em que ele correu */
    garagem(){
      if(document.getElementById('c2dGaragem')) return;
      const E = C2D.Estilos;
      const el = document.createElement('div');
      el.id = 'c2dGaragem'; el.className = 'c2d c2d-garagem'; el.style.zIndex = 9100;
      el.innerHTML = '<div class="c2d-gar-topo"><h2>Garagem</h2><p>Os carros de todas as categorias do modo piloto, cada um com o chassi e a época dele. Todos na mesma escala.</p>'
        + '<input class="c2d-gar-busca" type="search" placeholder="Procurar carro ou campeonato" aria-label="Procurar carro ou campeonato">'
        + '<button class="c2d-btn" type="button" data-fechar>Fechar</button></div><div class="c2d-gar-lista"></div>';
      document.body.appendChild(el);
      C2D.Tela.fundoParado(true);
      let obs = null;
      const fechar = () => { if(obs) obs.disconnect(); el.remove(); if(!C2D.Tela.aberta) C2D.Tela.fundoParado(false); };
      el.querySelector('[data-fechar]').addEventListener('click', fechar);
      const lista = el.querySelector('.c2d-gar-lista');
      const pinturas = [['#e2231a', 'Rossa'], ['#00a19c', 'Verde Água'], ['#1e41ff', 'Azul Real'], ['#ff8000', 'Laranja'], ['#f2f2f2', 'Branca'], ['#2b4562', 'Marinho'], ['#f5d000', 'Amarela'], ['#006f62', 'Verde']];
      const usos = E.usos();
      const grupos = new Map(E.GRUPOS.map(([n]) => [n, []]));
      Object.keys(E.DEF).filter(est => !E.DEF[est].oculto).forEach(est => { const gn = E.grupoDe(est); if(!grupos.has(gn)) grupos.set(gn, []); grupos.get(gn).push(est); });
      const cards = [];
      /* o desenho de cada cartão só quando ele aparece na tela */
      const desenhar = card => {
        if(card._feito) return; card._feito = true;
        const est = card._est, k = card._k, d = E.DEF[est], cv = card.querySelector('canvas');
        const dpr = Math.min(2, devicePixelRatio || 1), W = 340, H = 168;
        cv.width = W * dpr; cv.height = H * dpr;
        const g = cv.getContext('2d'); g.scale(dpr, dpr);
        const terra = /^(midget|sprint|late-model-terra|jalopy)/.test(est);
        g.fillStyle = C2D.Cenario ? C2D.Cenario.padrao(g, terra ? 'terra' : 'asfalto', 1) : '#383b40'; g.fillRect(0, 0, W, H);
        const dm = E.dims(est) || { comp: 4.5, larg: 1.9 };
        /* a mesma escala para todos: dá para ver o kart pequeno e o NASCAR enorme */
        const esc = (W - 40) / 6.1;
        for(let q = 0; q < 2; q++){
          const [cor, eq] = pinturas[(k * 3 + q * 5) % pinturas.length];
          const car = { sp: { comp: dm.comp, larg: dm.larg, estilo: est }, cor, eq: eq + k, id: eq + k, num: (k * 7 + q * 13) % 90 + 3, me: q === 1 };
          const sp = C2D.Arte.carro(car, ['S', 'M'][q]), sb = C2D.Arte.sombra(car);
          const cx = W / 2, cy = H / 4 + q * H / 2;
          g.save(); g.translate(cx + 3, cy + 3); g.globalAlpha = .7; g.drawImage(sb.cv, -sb.w / 2 * esc, -sb.h / 2 * esc, sb.w * esc, sb.h * esc); g.restore();
          g.drawImage(sp.cv, cx - sp.w / 2 * esc, cy - sp.h / 2 * esc, sp.w * esc, sp.h * esc);
        }
        if(d && d.dims){ g.font = '600 11px Archivo, system-ui, sans-serif'; g.fillStyle = 'rgba(255,255,255,.55)'; g.textAlign = 'right'; g.fillText(d.dims[0].toFixed(1) + ' m', W - 10, H - 8); }
      };
      obs = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting){ desenhar(e.target); obs.unobserve(e.target); } }), { root: el, rootMargin: '300px' }) : null;
      let k = 0;
      for(const [gn, ests] of grupos){
        if(!ests.length) continue;
        const sec = document.createElement('section'); sec.className = 'c2d-gar-grupo';
        const h = document.createElement('h3'); h.textContent = gn; sec.appendChild(h);
        const grade = document.createElement('div'); grade.className = 'c2d-gar-grade'; sec.appendChild(grade);
        ests.sort((a, b) => E.anoDe(a) - E.anoDe(b));
        for(const est of ests){
          const d = E.DEF[est], lu = usos[est] || [];
          const card = document.createElement('div'); card.className = 'c2d-gar-card'; card._est = est; card._k = k++;
          card.appendChild(document.createElement('canvas'));
          const tit = document.createElement('b'); tit.textContent = d.nome || est; card.appendChild(tit);
          const us = document.createElement('div'); us.className = 'c2d-gar-usos';
          lu.slice(0, 6).forEach(u => {
            const s = document.createElement('span');
            const n = document.createElement('span'); n.textContent = u.n; s.appendChild(n);
            s.appendChild(document.createTextNode(' ' + (u.de === u.ate ? u.de : u.de + '–' + u.ate)));
            us.appendChild(s);
          });
          if(lu.length > 6){ const s = document.createElement('span'); s.textContent = '+' + (lu.length - 6); us.appendChild(s); }
          /* os carros só das categorias de base: os degraus da escada em que eles aparecem */
          if(!lu.length) (d.esc || []).forEach(([n, de, ate]) => {
            const s = document.createElement('span');
            const b = document.createElement('span'); b.textContent = n; s.appendChild(b);
            if(de) s.appendChild(document.createTextNode(' ' + de + '–' + ate));
            us.appendChild(s);
          });
          card.appendChild(us);
          card._busca = ((d.nome || '') + ' ' + lu.map(u => u.n).concat((d.esc || []).map(x => x[0])).join(' ')).toLowerCase();
          grade.appendChild(card); cards.push(card);
          if(obs) obs.observe(card); else desenhar(card);
        }
        lista.appendChild(sec);
      }
      /* a busca: pelo nome do carro ou pelo campeonato (também no texto mostrado, já traduzido) */
      el.querySelector('.c2d-gar-busca').addEventListener('input', ev => {
        const t = ev.target.value.trim().toLowerCase();
        cards.forEach(c => { c.hidden = !!t && c._busca.indexOf(t) < 0 && c.textContent.toLowerCase().indexOf(t) < 0; });
        lista.querySelectorAll('.c2d-gar-grupo').forEach(s => { s.hidden = !s.querySelector('.c2d-gar-card:not([hidden])'); });
      });
      C2D.Tela._garagem = { el, cards, desenhar };
    },
    /* corrida: opc { trkId, ano, sk, nivel, voltas, carros (C2D.Corrida.montarGrid), titulo, aoFim(res, notasDe, S) } */
    abrirCorrida(opc){ return C2D.Tela.abrir(Object.assign({ tipo: 'corrida', titulo: 'Corrida', textoSair: 'Abandonar a corrida' }, opc || {})); },
    abrir(opc){
      if(C2D.Tela.aberta) C2D.Tela.fechar(true);
      opc = Object.assign({ trkId: 'br_int', ano: 2024, sk: 'f1', nivel: 0, cor: '#e2231a', tipo: 'treino' }, opc || {});
      const p = pref();
      const el = document.createElement('div');
      el.id = 'c2d'; el.className = 'c2d';
      el.innerHTML = html(opc);
      document.body.appendChild(el);
      C2D.Tela.fundoParado(true);
      const T = { el, opc, p, rodando: true, pausa: false, raf: 0, ultHud: 0, rel: C2D.Relogio(), resumo: null };
      C2D.Tela.aberta = T;
      /* monta a sessão depois de pintar a camada (a pista leva uns décimos para ficar pronta) */
      el.classList.add('c2d-carregando');
      const carg = document.createElement('div'); carg.className = 'c2d-carga'; carg.textContent = 'Preparando a pista…'; el.appendChild(carg); T.carga = carg;
      setTimeout(() => {
        try { C2D.Tela.montar(T); }
        catch(e){ console.error(e); C2D.Tela.fechar(); if(typeof UI !== 'undefined' && UI.toast) UI.toast('Não deu para abrir a corrida 2D nesta pista.'); }
      }, 30);
      return T;
    },

    montar(T){
      const { el, opc, p } = T;
      const assist = { abs: p.abs, tc: p.tc, estab: p.estab, direcao: p.direcao, freioAuto: p.freioAuto };
      const carros = (opc.carros || [{ id: 'ME', me: true, nome: opc.nome || 'Você', cor: opc.cor }]).map(o => o.me ? Object.assign({}, o, { assist, danoMult: p.danosRed ? .3 : 1, boxAuto: !!p.boxAuto }) : o);
      const S = T.S = C2D.Sessao.criar({ trkId: opc.trkId, ano: opc.ano, sk: opc.sk, nivel: opc.nivel, cat: opc.cat, tipo: opc.tipo, semente: opc.semente || 7,
        voltas: opc.voltas, w: opc.w || 0, carros, boxes: opc.boxes, clima: opc.clima, limites: p.limites });
      T.abrev = new Map(S.carros.map(c => [c, C2D.Tela.abreviar(c.nome || c.id)]));
      T.linhasTorre = [];
      T.R = C2D.Render.criar($(el, '.c2d-mundo'), S.P, { camera: p.camera });
      T.R.S = S; T.R.linha = !!p.linha; T.escala = +p.ritmo || 1; T.R.zoom = +p.zoom || 1.6;
      $(el, '.c2d-mundo').addEventListener('wheel', ev => { ev.preventDefault(); C2D.Tela.acao(T, ev.deltaY < 0 ? 'zoomMais' : 'zoomMenos'); }, { passive: false });
      /* a dica da largada: quais ajudas estão ligadas e onde mudar */
      T.dicaAte = (p.freioAuto || p.linha) ? 9 : 0;
      T.M = C2D.Render.minimapa($(el, '.c2d-mapa'), S.P);
      T.E = C2D.Entrada.criar({ aoUma: a => C2D.Tela.acao(T, a) });
      /* os elementos do painel */
      T.h = {}; el.querySelectorAll('[data-c2d]').forEach(n => T.h[n.dataset.c2d] = n);
      T.rpm = Array.from(el.querySelectorAll('.c2d-rpm i'));
      /* toque */
      const tq = $(el, '.c2d-toque');
      C2D.Entrada.botao(T.E, $(el, '.c2d-tq-esq'), 'esq');
      C2D.Entrada.botao(T.E, $(el, '.c2d-tq-dir'), 'dir');
      C2D.Entrada.botao(T.E, $(el, '.c2d-tq-freio'), 'freio');
      C2D.Entrada.botao(T.E, $(el, '.c2d-tq-acel'), 'acel');
      C2D.Entrada.faixaVolante(T.E, $(el, '.c2d-faixa'));
      const usarToque = v => { tq.hidden = !v; el.classList.toggle('c2d-com-toque', !!v); };
      usarToque(toqueProvavel());
      el.addEventListener('pointerdown', ev => { if(ev.pointerType === 'touch') usarToque(true); }, true);
      C2D.Tela.aplicarFaixa(T);
      $(el, '.c2d-pausar').addEventListener('click', () => C2D.Tela.pausar(T, !T.pausa));
      $(el, '.c2d-voltar').addEventListener('click', () => { C2D.Sessao.voltarPista(T.S, T.S.eu); });
      const bb = $(el, '.c2d-boxbtn'); if(bb) bb.addEventListener('click', () => C2D.Tela.acao(T, 'box'));
      el.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', () => C2D.Tela.menu(T, b.dataset.m)));
      el.querySelectorAll('[data-o]').forEach(i => {
        const k = i.dataset.o;
        if(i.tagName === 'SELECT'){ i.value = String(p[k]); i.addEventListener('change', () => C2D.Tela.opcao(T, k, k === 'limites' ? i.value : +i.value)); return; }
        i.checked = k === 'norte' ? p.camera === 'norte' : k === 'faixa' ? p.toque === 'faixa' : !!p[k];
        i.addEventListener('change', () => C2D.Tela.opcao(T, k, i.checked));
      });
      /* aba no fundo: pausa */
      T.visib = () => { if(document.hidden) C2D.Tela.pausar(T, true); };
      document.addEventListener('visibilitychange', T.visib);
      T.redim = () => { C2D.Render.redimensionar(T.R); T.M = C2D.Render.minimapa($(el, '.c2d-mapa'), S.P); };
      window.addEventListener('resize', T.redim);
      el.classList.remove('c2d-carregando'); if(T.carga) T.carga.remove();
      $(el, '.c2d-luzes').hidden = S.estado !== 'luzes';
      const laco = agora => {
        if(!T.rodando) return;
        T.raf = requestAnimationFrame(laco);
        C2D.Tela.quadro(T, agora);
      };
      T.raf = requestAnimationFrame(laco);
    },

    quadro(T, agora){
      const S = T.S;
      const dtReal = T.ultQ ? Math.min(.1, (agora - T.ultQ) / 1000) : .016;
      T.ultQ = agora;
      if(T.simulando){
        /* até a bandeirada, sem desenhar cada passo: uns segundos de corrida por quadro */
        const fim = performance.now() + 14;
        while(!S.acabou && performance.now() < fim) for(let k = 0; k < 60 && !S.acabou; k++) C2D.Sessao.passo(S, null, C2D.DT);
        T.rel.zerar();
        if(T.h.simVolta) T.h.simVolta.textContent = (S.lider ? Math.min(S.N, S.lider.voltas + 1) : 1) + ' / ' + S.N;
        if(S.acabou){ T.simulando = false; T.el.querySelector('.c2d-simulando').hidden = true; }
      } else if(T.contagem > 0 && !T.pausa){
        /* a relargada: tudo parado por três segundos, depois a bandeira verde é sua */
        const dt = T.ultQc ? Math.min(.1, (agora - T.ultQc) / 1000) : 0; T.ultQc = agora;
        T.contagem -= dt; T.rel.zerar();
        /* (os décimos a mais são da cortina saindo: o número começa no 3) */
        const n = Math.max(1, Math.min(3, Math.ceil(T.contagem)));
        if(T.h.contagem.textContent !== String(n)) T.h.contagem.textContent = String(n);
        if(T.contagem <= 0){ T.el.querySelector('.c2d-contagem').hidden = true; T.verdeAte = S.t + 3; T.ultQc = null; }
      } else if(T.pulandoSC && !T.pausa){
        /* safety car: atrás da cortina a corrida anda sem desenhar até a relargada, com o seu
           carro seguindo o pelotão (ninguém vê o jogo acelerado) */
        /* (enquanto a cortina entra, pouco por quadro para a animação ficar lisa; fechada, o máximo) */
        const fim = performance.now() + (agora - T.scDesde > 420 ? 75 : 10);
        /* atrás do safety car todo mundo anda devagar e em fila: o passo pode ser de 60 Hz (metade do custo) */
        while((S.sc || S.vsc) && !S.acabou && performance.now() < fim) for(let k = 0; k < 40 && (S.sc || S.vsc); k++) C2D.Sessao.passo(S, null, C2D.DT * 2);
        T.rel.zerar();
        C2D.Tela.progressoSC(T);
        if((!(S.sc || S.vsc) || S.acabou) && agora - T.scDesde > 1400) C2D.Tela.fimSC(T);
      } else if(!T.pausa && !T.fimMostrado){
        /* a cortina só abre quando o jogador já está na fila do safety car */
        if(S.tipo === 'corrida' && T.p.pularSC && (S.sc || S.vsc) && S.eu.estado === 'pista' && !S.acabou){
          T.filaSC = T.filaSC || {};
          if(C2D.Corrida.naFilaSC(S, S.eu, dtReal, T.filaSC, T.R.scS)){ T.filaSC = null; C2D.Tela.inicioSC(T); }
        } else T.filaSC = null;
        const n = T.rel.quadro(agora, T.escala);
        for(let k = 0; k < n; k++){
          const inp = C2D.Entrada.ler(T.E, C2D.DT, S.eu.v);
          C2D.Sessao.passo(S, inp, C2D.DT);
          for(const c of S.carros) if(c.v > 1 && !c.fantasma) C2D.Render.marcar(T.R, c);
        }
      } else T.rel.zerar();
      if(S.tipo === 'corrida' && S.acabou && !T.fimMostrado) C2D.Tela.mostrarResultado(T);
      if(T.opc.limiteVoltas && S.eu.voltas >= T.opc.limiteVoltas && !T.fimSessao){
        T.fimSessao = true;
        const h = T.h.aviso; h.hidden = false; h.textContent = isFinite(S.eu.melhor) ? 'Sessão encerrada · melhor volta ' + C2D.fmtVolta(S.eu.melhor) : 'Sessão encerrada · sem volta válida';
        h.__v = h.textContent;
        setTimeout(() => { if(C2D.Tela.aberta === T) C2D.Tela.fechar(); }, 1800);
      }
      /* com a cortina fechada não precisa desenhar a pista */
      const coberto = T.pulandoSC && agora - T.scDesde > 420;
      if(!coberto) C2D.Render.quadro(T.R, S.carros, S.eu, T.pausa ? 1 : T.rel.alfa, T.pausa ? 0 : dtReal);
      /* aparelho fraco: a resolução cai até o desenho caber no quadro */
      const tm = T.R.tempos;
      if(tm.length >= 90 && !T.pausa){
        const media = tm.reduce((a, b) => a + b, 0) / tm.length;
        if(media > 11 && T.R.escala > .55){ T.R.escala = Math.max(.55, T.R.escala - .15); T.R.tempos.length = 0; C2D.Render.redimensionar(T.R); }
      }
      /* o intervalo real entre os quadros (inclui a pintura na placa de vídeo, que o tempo do JS
         não vê): abaixo de ~45 quadros por segundo por dois segundos seguidos, a resolução cai */
      if(!T.pausa && !T.simulando && !T.pulandoSC && dtReal > 0 && dtReal < .25){
        const iv = T.intervalos = T.intervalos || [];
        iv.push(dtReal); if(iv.length > 120) iv.shift();
        if(iv.length >= 120 && T.R.escala > .7){
          const ord = iv.slice().sort((a, b) => a - b), med = ord[60];
          if(med > .022){ T.R.escala = Math.max(.7, T.R.escala - .15); iv.length = 0; C2D.Render.redimensionar(T.R); }
        }
      }
      if(agora - T.ultHud > 100){ T.ultHud = agora; C2D.Tela.painel(T); }
    },

    painel(T){
      const S = T.S, c = S.eu, h = T.h;
      const vel = Math.round(Math.max(0, c.vx) * 3.6);
      const set = (k, v) => { if(h[k] && h[k].__v !== v){ h[k].__v = v; h[k].textContent = v; } };
      set('vel', String(vel));
      set('marcha', c.re ? 'R' : c.sp.marchas <= 1 ? (c.vx > .5 ? 'D' : 'N') : (c.vx < .3 ? 'N' : String(c.marcha)));
      const fr = c.sp.rpm ? lim(c.rpm / c.sp.rpm, 0, 1) : lim(c.vx / c.sp.vmax, 0, 1);
      const acesas = Math.round(fr * T.rpm.length);
      T.rpm.forEach((n, i) => { const on = i < acesas; if(n.__on !== on){ n.__on = on; n.classList.toggle('on', on); } });
      if(S.tipo === 'corrida'){
        set('volta', Math.min(S.N, Math.max(1, c.voltas + 1)) + '/' + S.N);
        set('pos', (c.pos || 1) + '/' + S.carros.length);
        C2D.Tela.torre(T);
        const band = S.bandeira === 'quadriculada' ? (c.estado === 'chegou' ? 'Bandeirada! Você termina em ' + c.pos + 'º' : 'Bandeira quadriculada')
          : T.pulandoSC ? '' : S.sc ? 'Safety car na pista: sem ultrapassagem' : S.vsc ? 'Safety car virtual: 30% mais devagar, sem ultrapassagem' : '';
        if(h.bandeira.__v !== band){ h.bandeira.__v = band; h.bandeira.textContent = band; h.bandeira.hidden = !band; h.bandeira.classList.toggle('c2d-sc', !!(S.sc || S.vsc) && !S.bandeira); }
      } else set('volta', T.opc.limiteVoltas ? Math.min(c.voltas, T.opc.limiteVoltas) + '/' + T.opc.limiteVoltas : String(c.voltas));
      const tAtual = c.ini != null ? S.t - c.ini : 0;
      set('tempo', c.ini != null ? C2D.fmtVolta(tAtual) : '—');
      set('ult', c.ultima ? C2D.fmtVolta(c.ultima.t) + (c.ultima.valida ? '' : ' ✕') : '—');
      set('melhor', isFinite(c.melhor) ? C2D.fmtVolta(c.melhor) : '—');
      /* diferença para a melhor volta, no último setor fechado */
      let delta = '';
      if(isFinite(c.melhor) && c.tSetor != null && c.setor !== undefined){
        const feitos = c.setores.filter(Boolean);
        if(feitos.length){
          const soma = feitos.reduce((a, s) => a + s.t, 0), ref = c.melhorSet.slice(0, feitos.length).reduce((a, b) => a + b, 0);
          if(isFinite(ref)) delta = C2D.fmtDelta(soma - ref);
        }
      }
      set('delta', delta);
      if(h.delta) h.delta.className = 'c2d-delta' + (delta.startsWith('−') ? ' bom' : delta ? ' ruim' : '');
      for(let k = 0; k < 3; k++){
        const s = c.setores[k], n = h['s' + k];
        const cls = s ? 'c2d-s-' + s.cor : '';
        if(n.__c !== cls){ n.__c = cls; n.className = cls; }
      }
      /* pneu, combustível, box */
      if(c.pneu && S.regras){
        if(h.pneu.hidden) h.pneu.hidden = false;
        set('pneuC', c.pneu.c);
        h.pneuC.className = 'c2d-pc-' + c.pneu.c;
        set('pneuG', Math.round(Math.min(1.5, c.pneu.gasto) * 100) + '%');
        if(S.tanque < Infinity){ if(h.comb.hidden) h.comb.hidden = false; set('combV', (c.comb * S.tanque).toFixed(1) + ' v'); }
        const bb = h.boxbtn;
        if(bb){
          const txt = c.box ? (c.box.fase === 'parado' ? 'Parado' : 'Pit lane') : c.pedirBox ? 'Box: ' + Gp.nomePneu(c.boxPneu) : 'Box';
          if(bb.__v !== txt){ bb.__v = txt; bb.textContent = txt; bb.classList.toggle('on', !!(c.pedirBox || c.box)); }
        }
      }
      /* DRS, push-to-pass, Attack Mode, energia */
      if(S.boost && h.boost){
        let txt = '', cls = 'c2d-boost';
        if(S.boost.drs){ txt = 'DRS'; cls += c.drsAberto ? ' aberto' : c.drsPode && c.drsZona ? ' pode' : ' off'; }
        else if(c.p2p){ txt = 'P2P ' + Math.round(c.p2p.resta) + ' s'; cls += c.p2p.ligado ? ' aberto' : c.p2p.resta > 0 ? ' pode' : ' off'; }
        else if(c.attack){ const resta = c.attack.ate - S.t; txt = resta > 0 ? 'ATTACK ' + Math.ceil(resta) + ' s' : 'ATTACK ×' + c.attack.usos; cls += resta > 0 ? ' aberto' : c.attack.usos ? ' pode' : ' off'; }
        if(c.energia != null){ const me = C2D.Boost.metaEnergia(S, c); txt += (txt ? ' · ' : '') + 'Energia ' + Math.round(me.agora * 100) + '%' + (me.agora < me.meta - .02 ? ' (poupe)' : ''); }
        if(h.boost.__v !== txt + cls){ h.boost.__v = txt + cls; h.boost.textContent = txt; h.boost.className = cls; h.boost.hidden = !txt; }
      }
      /* danos: o carro visto de cima, a frente para cima; cada peça com a cor do estado dela */
      if(h.danos && c.partes){
        const P = c.partes, est = k => !P[k] ? '' : P[k].solta ? 'solta' : c.furo === k ? 'furo' : P[k].h > .9 ? 'ok' : P[k].h > .6 ? 'leve' : P[k].h > .3 ? 'medio' : 'grave';
        const assin = Object.keys(P).map(est).join() + (c.furo || '');
        if(h.danos.__v !== assin){
          h.danos.__v = assin;
          const algum = Object.keys(P).some(k => est(k) !== 'ok');
          h.danos.hidden = !algum;
          if(algum){
            const f = P.asaD ? 'asaD' : P.bico ? 'bico' : 'paraF', t = P.asaT ? 'asaT' : P.paraT ? 'paraT' : '', m = P.carenagem ? 'carenagem' : '';
            const cel = (k, cls) => '<i class="' + cls + ' d-' + (k ? est(k) || 'ok' : 'nada') + '"' + (k && C2D.Dano.PECA[k] ? ' title="' + C2D.Dano.PECA[k].nome + '"' : '') + '></i>';
            h.danos.innerHTML = cel('FE', 'r') + cel(f, 'a') + cel('FD', 'r') + cel(P.latE ? 'latE' : '', 'l') + cel(m, 'm') + cel(P.latD ? 'latD' : '', 'l') + cel('TE', 'r') + cel(t, 'a') + cel('TD', 'r');
          }
        }
      }
      /* avisos */
      let aviso = '';
      if(S.t < (T.dicaAte || 0) && !T.fimSessao) aviso = 'Freio assistido e linha de trajetória ligados · mude na pausa (II ou Esc)';
      else if(S.estado === 'luzes') aviso = '';
      else if(S.estado === 'lancada') aviso = 'Largada lançada: siga o pace car';
      else if(T.fimSessao) aviso = h.aviso.__v;
      else if(c.box && c.box.fase === 'parado') aviso = 'Parada: ' + Math.max(0, c.box.ate - S.t).toFixed(1) + ' s';
      else if(c.box) aviso = 'Pit lane: limitador ligado';
      /* o box é você que entra: a entrada perto, o lado dela e o pneu que a equipe preparou */
      else if((c.pedirBox || c.chamado) && S.regras && C2D.Tela.entradaBox(S, c) != null) aviso = (S.P.box.lado > 0 ? 'Entrada dos boxes à esquerda em ' : 'Entrada dos boxes à direita em ') + C2D.Tela.entradaBox(S, c) + ' m (' + Gp.nomePneu(c.boxPneu) + ')';
      else if(c.chamado && c.pedirBox) aviso = 'A equipe chama: entre nos boxes nesta volta (' + Gp.nomePneu(c.boxPneu) + ')';
      else if(S.tipo === 'corrida' && c.estado === 'fora') aviso = 'Carro destruído: você está fora da corrida';
      else if(c.destruido && S.tipo !== 'corrida') aviso = 'Carro destruído: toque em Voltar à pista para recomeçar';
      else if(S.avisoDano && S.t - S.avisoDano.t < 3.5) aviso = S.avisoDano.txt;
      else if(S.eventos.length && S.eventos[S.eventos.length - 1].tipo === 'punicao' && S.eventos[S.eventos.length - 1].a === c.id && S.t - S.eventos[S.eventos.length - 1].t < 4) aviso = '+5 s de punição';
      else if(T.verdeAte && S.t < T.verdeAte) aviso = 'Bandeira verde!';
      else if(S.tipo === 'corrida' && c.invalida && c.ini != null && S.limitesModo !== 'desligado') aviso = 'Limites de pista: aviso ' + c.avisos + ' de ' + S.limiteAvisos;
      else if(c.invalida && c.ini != null) aviso = 'Volta inválida: limites da pista';
      else if(c.piso === C2D.PISO.GRAMA || c.piso === C2D.PISO.BRITA) aviso = 'Fora da pista';
      if(h.aviso.__v !== aviso){ h.aviso.__v = aviso; h.aviso.textContent = aviso; h.aviso.hidden = !aviso; }
      const bv = $(T.el, '.c2d-voltar'), pode = C2D.Sessao.podeVoltar(S, c);
      if(bv.hidden === pode) bv.hidden = !pode;
      /* luzes */
      const lz = $(T.el, '.c2d-luzes');
      if(S.estado === 'luzes'){ lz.hidden = false; lz.querySelectorAll('i').forEach((n, i) => n.classList.toggle('on', i < S.luzes)); }
      else if(!lz.hidden && !T.luzFim){ T.luzFim = true; lz.classList.add('verde'); setTimeout(() => { lz.hidden = true; }, 700); }
      C2D.Render.pontosMinimapa(T.M, S.carros, c);
    },

    abreviar(nome){
      const partes = String(nome || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().split(/\s+/);
      const ult = partes[partes.length - 1] || '???';
      return ult.slice(0, 3).toUpperCase();
    },
    /* a torre: os três primeiros e quem está perto de você */
    torre(T){
      const S = T.S, el = T.h.torre; if(!el) return;
      const tor = C2D.Corrida.torre(S), eu = tor.findIndex(l => l.c === S.eu);
      const quer = new Set([0, 1, 2]);
      for(let k = eu - 2; k <= eu + 2; k++) if(k >= 0 && k < tor.length) quer.add(k);
      const linhas = [...quer].sort((a, b) => a - b).slice(0, 8).map(k => tor[k]);
      if(el.hidden) el.hidden = false;
      while(T.linhasTorre.length < linhas.length){ const li = document.createElement('li'); li.innerHTML = '<i></i><b></b><span></span><em></em>'; el.appendChild(li); T.linhasTorre.push(li); }
      T.linhasTorre.forEach((li, k) => {
        const l = linhas[k];
        li.hidden = !l; if(!l) return;
        const gap = k === 0 ? (l.c.estado === 'chegou' ? '🏁' : '') : tr(l.int || l.dif);
        const chave = l.pos + '|' + T.abrev.get(l.c) + '|' + gap + '|' + (l.c === S.eu) + '|' + l.c.estado;
        if(li.__k === chave) return; li.__k = chave;
        li.className = (l.c === S.eu ? 'eu ' : '') + (l.c.estado === 'fora' ? 'fora' : '');
        li.children[0].style.background = l.c.cor;
        li.children[1].textContent = l.pos;
        li.children[2].textContent = T.abrev.get(l.c);
        li.children[3].textContent = gap;
      });
    },
    mostrarResultado(T){
      const S = T.S; T.fimMostrado = true;
      const tor = C2D.Corrida.torre(S), eu = S.eu;
      const fl = S.fl.id ? S.carros.find(c => c.id === S.fl.id) : null;
      T.h.resTitulo.textContent = eu.estado === 'fora' ? 'Abandono' : eu.pos === 1 ? 'Vitória!' : eu.pos + 'º lugar';
      const limpo0 = t => String(t == null ? '' : t).replace(/[<>&"]/g, '');
      T.h.resSub.innerHTML = '<span>' + limpo0(T.opc.titulo || 'Corrida') + '</span>' + (T.opc.gp ? ' <span>' + limpo0(T.opc.gp) + '</span>' : '') + ' · <span>' + S.N + ' voltas</span>'
        + (fl ? ' · <span>Volta mais rápida:</span> <b data-i18n-ignore>' + limpo0(fl.nome || fl.id) + ' ' + C2D.fmtVolta(S.fl.t) + '</b>' : '');
      const limpo = t => String(t == null ? '' : t).replace(/[<>&"]/g, '');
      T.h.resTabela.innerHTML = tor.map(l => '<div class="' + (l.c === eu ? 'eu' : '') + '"><b>' + l.pos + '</b><i style="background:' + limpo(l.c.cor) + '"></i><span>' + limpo(l.c.nome || l.c.id)
        + '</span><em>' + (l.c.estado === 'fora' ? tr('ABD') : l.pos === 1 ? C2D.fmtVolta(l.c.fim + l.c.penal) : limpo(tr(l.dif))) + '</em><small>' + (isFinite(l.c.melhor) ? C2D.fmtVolta(l.c.melhor) : '') + '</small></div>').join('');
      T.el.querySelector('.c2d-resultado').hidden = false;
    },

    /* o safety car entrou: o seu carro passa para o piloto automático (sem ultrapassar, no ritmo
       do pelotão; o box chamado continua valendo) e a corrida avança até a relargada */
    inicioSC(T){
      const S = T.S, c = S.eu;
      T.pulandoSC = true;
      c.autoAntesSC = !!c.autopiloto; c.iaAntesSC = c.ia || null;
      c.ia = C2D.IA.criar({ ritmo: (C2D.NIVEIS[T.opc.nivelRivais] || C2D.NIVEIS.medio).ritmo, semente: 77 });
      c.autopiloto = true;
      /* a cortina, como a da troca de categoria: entra da direita com o nome grande */
      const vsc = !!(S.vsc && !S.sc), card = T.el.querySelector('.c2d-cortina');
      card.classList.toggle('vsc', vsc); card.classList.remove('sai'); card.hidden = false;
      card.style.animation = 'none'; void card.offsetWidth; card.style.animation = '';
      T.h.scTitulo.textContent = vsc ? 'VIRTUAL SAFETY CAR' : 'SAFETY CAR';
      /* o motivo: o carro do acidente, ou os destroços na pista */
      const ev = S.eventos.slice().reverse().find(e => e.tipo === 'sc' || e.tipo === 'vsc');
      const quem = ev && S.carros.find(q => q.id === ev.a);
      T.h.scMotivo.innerHTML = '';
      if(quem){ const a = document.createElement('span'); a.textContent = 'Acidente com'; const b = document.createElement('span'); b.setAttribute('data-i18n-ignore', ''); b.textContent = ' ' + (quem.nome || quem.id); T.h.scMotivo.append(a, b); }
      else { const a = document.createElement('span'); a.textContent = 'Destroços na pista'; T.h.scMotivo.append(a); }
      T.h.scSub.textContent = vsc ? 'Bandeira amarela em toda a pista: todos 30% mais devagar' : 'O pelotão se agrupa atrás do safety car';
      T.scDesde = performance.now(); T.scT0 = S.t; T.scS0 = S.lider ? S.lider.sTot / S.P.L : 0;
      T.scFimV = S.sc ? S.sc.ateVolta : null; T.scFimT = S.vsc ? S.vsc.ate : null;
      C2D.Tela.progressoSC(T);
    },
    /* a página do jogo por baixo: parada enquanto a corrida ou a garagem estão abertas (o CSS
       esconde e pausa as animações; os vídeos que tocavam param e voltam a tocar no fim) */
    fundoParado(sim){
      document.documentElement.classList.toggle('c2d-aberto', !!sim);
      document.querySelectorAll('video').forEach(v => {
        if(sim){ if(!v.paused){ v.__c2d = true; try { v.pause(); } catch(e){} } }
        else if(v.__c2d){ v.__c2d = false; try { const p = v.play(); if(p && p.catch) p.catch(() => {}); } catch(e){} }
      });
    },
    /* a distância até a entrada dos boxes, quando está perto (até 300 m); senão null */
    entradaBox(S, c){
      const P = S.P, B = P.box; if(!B || c.box) return null;
      const falta = ((B.ini - c.s) % P.L + P.L) % P.L;
      return falta <= 300 ? Math.max(0, Math.round(falta / 10) * 10) : null;
    },
    progressoSC(T){
      const S = T.S, lid = S.lider;
      let f = 1;
      if(S.sc && T.scFimV != null && lid) f = (lid.sTot / S.P.L - T.scS0) / Math.max(.5, T.scFimV - T.scS0);
      else if(S.vsc && T.scFimT != null) f = (S.t - T.scT0) / Math.max(1, T.scFimT - T.scT0);
      f = Math.max(0, Math.min(1, f));
      const w = Math.round(f * 100) + '%';
      if(T.h.scBarra.__w !== w){ T.h.scBarra.__w = w; T.h.scBarra.style.width = w; }
      const v = (lid ? Math.min(S.N, lid.voltas + 1) : 1) + ' / ' + S.N;
      if(T.h.scVolta.__v !== v){ T.h.scVolta.__v = v; T.h.scVolta.textContent = v; }
    },
    fimSC(T){
      const S = T.S, c = S.eu;
      T.pulandoSC = false;
      c.autopiloto = c.autoAntesSC; c.ia = c.iaAntesSC; c.autoAntesSC = null; c.iaAntesSC = null;
      /* a cortina sai pela esquerda e mostra o pelotão já agrupado, parado para a relargada */
      const card = T.el.querySelector('.c2d-cortina');
      card.classList.add('sai');
      setTimeout(() => { card.hidden = true; card.classList.remove('sai'); }, 480);
      T.R.cam.ok = false; T.R.particulas.length = 0;
      C2D.Render.quadro(T.R, S.carros, S.eu, 1, 0);
      if(S.acabou) return;
      T.contagem = 3.4; T.ultQc = null;
      T.h.contagem.textContent = '3';
      T.el.querySelector('.c2d-contagem').hidden = false;
      C2D.Entrada.ler(T.E, 0);
    },

    acao(T, a){
      if(a === 'pausa') return C2D.Tela.pausar(T, !T.pausa);
      if(T.pausa) return;
      if(a === 'reset' && C2D.Sessao.podeVoltar(T.S, T.S.eu)) C2D.Sessao.voltarPista(T.S, T.S.eu);
      if(a === 'box' && T.S.tipo === 'corrida' && T.S.regras){
        const c = T.S.eu;
        if(c.box) return;
        /* primeiro toque pede o box com o pneu sugerido; os seguintes trocam o pneu; o último cancela */
        const ops = C2D.Boxes.opcoes(T.S, c);
        if(!c.pedirBox){ c.pedirBox = true; c.boxPneu = C2D.Boxes.pneuParaBox(T.S, c); }
        else {
          const i = ops.indexOf(c.boxPneu);
          if(i < 0 || i === ops.length - 1){ c.pedirBox = false; c.boxPneu = null; if(c.chamado){ c.cancelouChamada = true; c.chamado = false; } }
          else c.boxPneu = ops[i + 1];
        }
        C2D.Tela.painel(T);
      }
      if(a === 'camera'){ C2D.Tela.opcao(T, 'norte', T.R.modo !== 'norte'); const i = T.el.querySelector('[data-o="norte"]'); if(i) i.checked = T.R.modo === 'norte'; }
      if(a === 'zoomMais' || a === 'zoomMenos'){
        const atual = +T.p.zoom || 1.6, k = ZOOMS.reduce((m, z, q) => Math.abs(z - atual) < Math.abs(ZOOMS[m] - atual) ? q : m, 0);
        const novo = ZOOMS[Math.max(0, Math.min(ZOOMS.length - 1, k + (a === 'zoomMais' ? 1 : -1)))];
        C2D.Tela.opcao(T, 'zoom', novo); const i = T.el.querySelector('[data-o="zoom"]'); if(i) i.value = String(novo);
      }
    },
    pausar(T, v){
      T.pausa = !!v;
      T.el.querySelector('.c2d-menu').hidden = !T.pausa;
      T.el.classList.toggle('c2d-pausado', T.pausa);
      if(T.pausa && T.E) C2D.Entrada.ler(T.E, 0);
    },
    menu(T, m){
      if(m === 'continuar') return C2D.Tela.pausar(T, false);
      if(m === 'simular'){
        /* o carro do jogador segue no piloto automático, no ritmo do nível dos rivais */
        const c = T.S.eu; c.ia = c.ia || C2D.IA.criar({ ritmo: (C2D.NIVEIS[T.opc.nivelRivais] || C2D.NIVEIS.medio).ritmo, semente: 99 }); c.autopiloto = true;
        C2D.Tela.pausar(T, false);
        /* instantâneo: projeta o resto da corrida; se falhar, simula passo a passo como antes */
        try { C2D.Corrida.projetar(T.S); T.rel.zerar(); return C2D.Tela.mostrarResultado(T); }
        catch(e){ if(typeof console !== 'undefined') console.warn('projetar falhou', e); }
        T.simulando = true; T.el.querySelector('.c2d-simulando').hidden = false; return;
      }
      if(m === 'concluir') return C2D.Tela.fechar();
      if(m === 'garagem') return C2D.Tela.garagem();
      if(m === 'reiniciar'){ const o = T.opc; C2D.Tela.fechar(true); return C2D.Tela.abrirTreino(o); }
      if(m === 'sair') return C2D.Tela.fechar();
    },
    opcao(T, k, v){
      const p = T.p;
      if(k === 'norte'){ p.camera = v ? 'norte' : 'perseguir'; T.R.modo = p.camera; }
      else if(k === 'faixa'){ p.toque = v ? 'faixa' : 'botoes'; C2D.Tela.aplicarFaixa(T); }
      else if(k === 'linha'){ p.linha = !!v; T.R.linha = !!v; }
      else if(k === 'danosRed'){ p.danosRed = !!v; if(T.S && T.S.eu) T.S.eu.danoMult = v ? .3 : 1; }
      else if(k === 'ritmo'){ p.ritmo = v; T.escala = v; }
      else if(k === 'zoom'){ p.zoom = v; T.R.zoom = v; }
      else if(k === 'boxAuto'){ p.boxAuto = !!v; if(T.S && T.S.eu) T.S.eu.boxAuto = !!v; }
      else if(k === 'pularSC'){ p.pularSC = !!v; }
      else if(k === 'limites'){ p.limites = v; if(T.S){ T.S.limitesModo = v; T.S.limiteAvisos = v === 'rigoroso' ? 3 : 5; T.S.passoPunicao = v === 'rigoroso' ? 1 : 2; } }
      else { p[k] = !!v; if(T.S && T.S.eu) T.S.eu.assist[k] = !!v; }
      salvarPref(p);
    },
    aplicarFaixa(T){
      const faixa = T.p.toque === 'faixa';
      T.el.querySelector('.c2d-faixa').hidden = !faixa;
      T.el.querySelectorAll('.c2d-tq-esq, .c2d-tq-dir').forEach(b => b.hidden = faixa);
    },

    fechar(semAviso){
      const T = C2D.Tela.aberta; if(!T) return;
      T.rodando = false; cancelAnimationFrame(T.raf);
      if(T.E) C2D.Entrada.soltar(T.E);
      document.removeEventListener('visibilitychange', T.visib);
      window.removeEventListener('resize', T.redim);
      T.el.remove();
      if(!document.getElementById('c2dGaragem')) C2D.Tela.fundoParado(false);
      C2D.Tela.aberta = null;
      const S = T.S, c = S && S.eu;
      if(S && S.tipo === 'corrida'){
        /* saiu antes da bandeirada: o carro do jogador abandona e o resto da corrida é simulado */
        if(!S.acabou){
          /* desistir no meio conta como abandono mecânico: não sorteia lesão como uma batida */
          if(c && c.estado === 'pista' && !c.autopiloto) C2D.Corrida.abandonar(S, c, 'MEC');
          let guarda = 0; while(!S.acabou && guarda++ < 120 * 60 * 90) C2D.Sessao.passo(S, null, C2D.DT);
        }
        const res = C2D.Corrida.resultado(S);
        if(!semAviso && T.opc.aoFim) T.opc.aoFim(res, id => C2D.Corrida.notasDe(S, id), S);
        return res;
      }
      const resumo = c ? { voltas: c.voltas, melhor: isFinite(c.melhor) ? c.melhor : null, historico: c.historico.slice() } : null;
      if(!semAviso && T.opc.aoFim) T.opc.aoFim(resumo);
      return resumo;
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
