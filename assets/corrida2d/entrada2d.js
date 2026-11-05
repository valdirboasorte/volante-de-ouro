/* Corrida 2D: os comandos do jogador.
   Teclado (setas ou WASD), botões grandes de toque e controle (Gamepad API) viram um só
   comando por passo: volante -1..1 (+ esquerda), acelerador e freio 0..1.
   No teclado as teclas são liga/desliga; as rampas fazem o volante e os pedais andarem
   como num controle analógico. */
(function(raiz){
  const C2D = raiz.C2D;
  const { lim, rampa } = C2D;

  const TECLAS = {
    ArrowLeft: 'esq', KeyA: 'esq', ArrowRight: 'dir', KeyD: 'dir',
    ArrowUp: 'acel', KeyW: 'acel', ArrowDown: 'freio', KeyS: 'freio',
    ShiftLeft: 'boost', ShiftRight: 'boost', KeyE: 'boost',
    KeyP: 'pausa', Escape: 'pausa', KeyR: 'reset', KeyC: 'camera', KeyB: 'box'
  };

  C2D.Entrada = {
    criar(opc){
      opc = opc || {};
      const E = { tec: {}, toque: {}, uma: {}, steer: 0, acel: 0, freio: 0, volante: null, pad: null, usouToque: false, usouPad: false, aoUma: opc.aoUma || null };
      E.baixo = ev => {
        const a = TECLAS[ev.code]; if(!a) return;
        ev.preventDefault(); ev.stopPropagation();
        if(!E.tec[a] && (a === 'pausa' || a === 'reset' || a === 'camera' || a === 'box' || a === 'boost')){ E.uma[a] = true; if(E.aoUma) E.aoUma(a); }
        E.tec[a] = true;
      };
      E.cima = ev => { const a = TECLAS[ev.code]; if(!a) return; ev.preventDefault(); ev.stopPropagation(); E.tec[a] = false; };
      E.perdeu = () => { E.tec = {}; E.toque = {}; E.volante = null; };
      if(typeof window !== 'undefined' && window.addEventListener){
        window.addEventListener('keydown', E.baixo, true);
        window.addEventListener('keyup', E.cima, true);
        window.addEventListener('blur', E.perdeu);
      }
      return E;
    },
    soltar(E){
      if(typeof window === 'undefined' || !window.removeEventListener) return;
      window.removeEventListener('keydown', E.baixo, true);
      window.removeEventListener('keyup', E.cima, true);
      window.removeEventListener('blur', E.perdeu);
    },

    /* liga um botão da tela (toque ou mouse) a uma ação, com vários dedos ao mesmo tempo */
    botao(E, el, acao){
      const liga = ev => { ev.preventDefault(); E.usouToque = true; E.toque[acao] = (E.toque[acao] || 0) + 1; el.classList.add('on');
        try { el.setPointerCapture(ev.pointerId); } catch(e){}
        if(acao === 'pausa' || acao === 'reset' || acao === 'camera' || acao === 'box' || acao === 'boost'){ E.uma[acao] = true; if(E.aoUma) E.aoUma(acao); }
        if(navigator.vibrate && acao !== 'acel' && ev.isTrusted && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) try { navigator.vibrate(8); } catch(e){} };
      const desliga = ev => { ev.preventDefault(); E.toque[acao] = Math.max(0, (E.toque[acao] || 0) - 1); if(!E.toque[acao]) el.classList.remove('on'); };
      el.addEventListener('pointerdown', liga);
      el.addEventListener('pointerup', desliga);
      el.addEventListener('pointercancel', desliga);
      el.addEventListener('contextmenu', ev => ev.preventDefault());
    },
    /* a faixa de volante: a posição do dedo na faixa é o quanto vira */
    faixaVolante(E, el){
      let id = null;
      const ler = ev => { const r = el.getBoundingClientRect(); E.volante = lim(-((ev.clientX - r.left) / r.width * 2 - 1) * 1.25, -1, 1); };
      el.addEventListener('pointerdown', ev => { ev.preventDefault(); E.usouToque = true; id = ev.pointerId; try { el.setPointerCapture(id); } catch(e){} ler(ev); });
      el.addEventListener('pointermove', ev => { if(ev.pointerId === id) ler(ev); });
      const fim = ev => { if(ev.pointerId === id){ id = null; E.volante = null; } };
      el.addEventListener('pointerup', fim); el.addEventListener('pointercancel', fim);
    },

    /* o comando deste passo */
    ler(E, dt, v){
      /* controle */
      let pad = null;
      if(typeof navigator !== 'undefined' && navigator.getGamepads){
        const lista = navigator.getGamepads() || [];
        for(const g of lista) if(g && g.connected){ pad = g; break; }
      }
      const t = E.tec, q = E.toque;
      const esq = t.esq || q.esq, dir = t.dir || q.dir;
      let alvoS = (esq ? 1 : 0) - (dir ? 1 : 0);
      let alvoA = t.acel || q.acel ? 1 : 0, alvoF = t.freio || q.freio ? 1 : 0;
      let analogico = false;
      if(pad){
        const ax = pad.axes[0] || 0, zona = .12;
        const rt = pad.buttons[7] ? pad.buttons[7].value : 0, lt = pad.buttons[6] ? pad.buttons[6].value : 0;
        if(Math.abs(ax) > zona){ alvoS = -Math.sign(ax) * Math.pow((Math.abs(ax) - zona) / (1 - zona), 1.4); analogico = true; E.usouPad = true; }
        if(rt > .04){ alvoA = Math.max(alvoA, rt); E.usouPad = true; }
        if(lt > .04){ alvoF = Math.max(alvoF, lt); E.usouPad = true; }
        const bt = i => pad.buttons[i] && pad.buttons[i].pressed;
        const antes = E.pad || {};
        const agora = { a: bt(0), x: bt(2), y: bt(3), st: bt(9), sel: bt(8) };
        if(agora.a && !antes.a){ E.uma.boost = true; if(E.aoUma) E.aoUma('boost'); }
        if(agora.st && !antes.st){ E.uma.pausa = true; if(E.aoUma) E.aoUma('pausa'); }
        if(agora.y && !antes.y){ E.uma.reset = true; if(E.aoUma) E.aoUma('reset'); }
        if(agora.sel && !antes.sel){ E.uma.camera = true; if(E.aoUma) E.aoUma('camera'); }
        if(agora.x && !antes.x){ E.uma.box = true; if(E.aoUma) E.aoUma('box'); }
        E.pad = agora;
      }
      if(E.volante != null){ alvoS = E.volante; analogico = true; }
      /* rampas: analógico vai direto (suavizado); tecla anda depressa e volta mais depressa */
      if(analogico) E.steer += (alvoS - E.steer) * Math.min(1, dt * 18);
      /* em alta velocidade a tecla vira o volante mais devagar (correções finas); soltar centra rápido */
      else E.steer = rampa(E.steer, alvoS, alvoS === 0 || Math.sign(alvoS) !== Math.sign(E.steer) ? 7 : Math.max(1.5, 4.2 / (1 + (v || 0) / 45)), dt);
      E.acel = rampa(E.acel, alvoA, alvoA > E.acel ? 7 : 12, dt);
      E.freio = rampa(E.freio, alvoF, alvoF > E.freio ? 9 : 14, dt);
      const uma = E.uma; E.uma = {};
      return { steer: E.steer, acel: E.acel, freio: E.freio, boost: !!(t.boost || q.boost), uma };
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
