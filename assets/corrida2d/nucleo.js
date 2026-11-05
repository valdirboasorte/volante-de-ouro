/* Corrida interativa 2D: o núcleo.
   Fica fora dos <script> embutidos de propósito: a versão do jogo (o hash que o servidor
   do multiplayer confere) não muda por causa deste modo. Nada aqui toca a página: a
   simulação roda igual no navegador e no Node dos testes.
   O que vem do jogo, só para ler: Pista, Prova, Gp, Engine, rngDe, seedOf, clamp. */
(function(raiz){
  const C2D = raiz.C2D = raiz.C2D || {};
  C2D.V = (raiz.Corrida2D && raiz.Corrida2D.V) || 'dev';
  /* o passo fixo da física: 120 por segundo; a tela interpola entre dois passos */
  C2D.DT = 1 / 120;
  C2D.G = 9.81;

  const PI = Math.PI, TAU = 2 * Math.PI;
  C2D.lim = (v, a, b) => v < a ? a : v > b ? b : v;
  /* ângulo entre -π e π */
  C2D.ang = a => { a = (a + PI) % TAU; if(a < 0) a += TAU; return a - PI; };
  C2D.mix = (a, b, t) => a + (b - a) * t;
  /* aproxima v de alvo no máximo taxa*dt (as rampas dos comandos) */
  C2D.rampa = (v, alvo, taxa, dt) => { const d = alvo - v, m = taxa * dt; return d > m ? v + m : d < -m ? v - m : alvo; };

  /* sorteio reproduzível: o mesmo do jogo quando existe (rngDe), senão um igual */
  C2D.rng = function(semente){
    if(typeof rngDe === 'function') return rngDe(semente >>> 0);
    let t = (semente >>> 0) || 1;
    return () => { t = (t + 0x6D2B79F5) >>> 0; let x = Math.imul(t ^ (t >>> 15), 1 | t); x ^= x + Math.imul(x ^ (x >>> 7), 61 | x); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
  };
  C2D.semente = txt => typeof seedOf === 'function' ? seedOf(String(txt)) >>> 0 : String(txt).split('').reduce((h, c) => (Math.imul(h ^ c.charCodeAt(0), 16777619)) >>> 0, 2166136261);

  /* um resumo numérico do estado: dois carros iguais dão o mesmo número (teste de determinismo) */
  C2D.impressao = function(carros){
    let h = 2166136261;
    const mexe = v => { const k = Math.round(v * 1000) | 0; h = Math.imul(h ^ k, 16777619) >>> 0; };
    for(const c of carros){ mexe(c.x); mexe(c.y); mexe(c.psi); mexe(c.vx); mexe(c.vy); mexe(c.r); }
    return h;
  };

  /* tempo de volta em texto: 1:10.734 */
  C2D.fmtVolta = function(t){
    if(!(t >= 0) || !isFinite(t)) return '—';
    const m = Math.floor(t / 60), s = t - m * 60;
    return (m ? m + ':' + (s < 10 ? '0' : '') : '') + s.toFixed(3);
  };
  C2D.fmtDelta = d => !isFinite(d) ? '' : (d >= 0 ? '+' : '−') + Math.abs(d).toFixed(3);

  /* o relógio de passo fixo: acumula o tempo real e devolve quantos passos dar e a fração
     que sobra (para a tela interpolar). Nunca mais de 0,1 s por quadro: aba que volta
     do fundo não faz o carro pular meia volta. */
  C2D.Relogio = function(){
    return { acc: 0, ult: null,
      quadro(agora, escala){
        if(this.ult == null){ this.ult = agora; return 0; }
        let dt = (agora - this.ult) / 1000; this.ult = agora;
        if(dt > .1) dt = .1; if(dt < 0) dt = 0;
        /* velocidade do jogo: 0,7 faz a corrida inteira (você e os rivais) andar em câmera lenta */
        this.acc += dt * (escala || 1);
        const n = Math.floor(this.acc / C2D.DT);
        this.acc -= n * C2D.DT;
        return n;
      },
      get alfa(){ return this.acc / C2D.DT; },
      zerar(){ this.ult = null; this.acc = 0; }
    };
  };
})(typeof window !== 'undefined' ? window : globalThis);
