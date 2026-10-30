/* A página falsa em que o motor do jogo roda no servidor. É a mesma ideia de
   testes/base.js: elementos que aceitam qualquer escrita, um localStorage em memória
   e temporizadores que não fazem nada (as mensagens e animações da tela não existem
   aqui). Com `seed`, o acaso do jogo vem de um gerador fixo, para os testes. */

function elementoFalso(){
  const cl = new Set();
  return {
    _v: '', innerHTML: '', textContent: '', innerText: '', checked: false, style: { setProperty(){} }, dataset: {},
    options: [], min: 13, max: 30, children: [],
    classList: { add: c => cl.add(c), remove: c => cl.delete(c),
      toggle: (c, f) => { (f === undefined ? !cl.has(c) : f) ? cl.add(c) : cl.delete(c); }, contains: c => cl.has(c) },
    get value(){ return this._v; }, set value(v){ this._v = String(v); },
    _a: {}, addEventListener(){}, removeEventListener(){}, appendChild(){}, removeChild(){}, remove(){}, focus(){}, blur(){}, click(){}, scrollIntoView(){},
    setAttribute(n, v){ this._a[n] = String(v); }, getAttribute(n){ return n in this._a ? this._a[n] : null; }, removeAttribute(n){ delete this._a[n]; },
    play(){ return Promise.resolve(); }, pause(){}, load(){},
    querySelector(){ return elementoFalso(); }, querySelectorAll(){ return []; }, closest(){ return null; },
    getBoundingClientRect(){ return { top: 0, left: 0, width: 0, height: 0, right: 0, bottom: 0 }; },
    getContext(){ return null; }
  };
}

/* o gerador de testes/base.js (mulberry32), para os mesmos lotes reproduzíveis */
export function mathComSemente(seed){
  let t = (seed >>> 0) || 1;
  const rnd = () => { t = (t + 0x6D2B79F5) >>> 0; let x = Math.imul(t ^ (t >>> 15), 1 | t); x ^= x + Math.imul(x ^ (x >>> 7), 61 | x); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
  const M = Object.create(Math); M.random = rnd; return M;
}

export function ambienteFalso(opts = {}){
  const els = {};
  const document = {
    getElementById: id => els[id] || (els[id] = elementoFalso()),
    querySelector: () => elementoFalso(), querySelectorAll: () => [],
    documentElement: elementoFalso(), body: elementoFalso(), head: elementoFalso(),
    createElement: () => elementoFalso(), createTextNode: () => elementoFalso(),
    addEventListener(){}, removeEventListener(){}, hidden: true, visibilityState: 'hidden'
  };
  const store = {};
  const nada = () => 0;
  const amb = {
    document,
    localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; }, clear(){ for(const k in store) delete store[k]; } },
    sessionStorage: { getItem: () => null, setItem(){}, removeItem(){} },
    setTimeout: nada, clearTimeout(){}, setInterval: nada, clearInterval(){},
    requestAnimationFrame: nada, cancelAnimationFrame(){},
    addEventListener(){}, removeEventListener(){}, dispatchEvent(){ return true; },
    scrollTo(){}, scrollY: 0, innerWidth: 1200, innerHeight: 800, devicePixelRatio: 1,
    performance: { now: () => Date.now() },
    navigator: { userAgent: 'volante-servidor', language: 'pt-BR', languages: ['pt-BR'], vibrate(){ return false; } },
    location: { reload(){}, hostname: 'servidor', href: 'https://servidor/', search: '', hash: '', pathname: '/' },
    history: { replaceState(){}, pushState(){} },
    matchMedia: () => ({ matches: false, addEventListener(){}, removeEventListener(){}, addListener(){} }),
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
    alert(){}, confirm: () => false, prompt: () => null,
    Audio: function(){ return elementoFalso(); }, Image: function(){ return elementoFalso(); },
    fetch: () => Promise.reject(new Error('sem rede no motor')),
    Math: opts.seed != null ? mathComSemente(opts.seed) : Math
  };
  amb.window = amb; amb.self = amb;
  return amb;
}
