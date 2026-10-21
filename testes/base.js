/* Carrega o jogo inteiro no Node, com uma página falsa, para testes. */
const fs = require('fs');
const vm = require('vm');
const ARQ = process.env.VDO_HTML || require('path').join(__dirname, '..', 'index.html');

function fakeEl(onWrite, id){
  const cl = new Set();
  const element = {
    _v:'', innerHTML:'', textContent:'', innerText:'', checked:false, style:{ setProperty(){} }, dataset:{},
    options:[], min:13, max:30, children:[],
    classList:{ add:c => cl.add(c), remove:c => cl.delete(c),
      toggle:(c, f) => { (f === undefined ? !cl.has(c) : f) ? cl.add(c) : cl.delete(c); }, contains:c => cl.has(c) },
    get value(){ return this._v; }, set value(v){ this._v = String(v); },
    _a:{}, addEventListener(){}, appendChild(){}, focus(){}, scrollIntoView(){},
    setAttribute(n, v){ this._a[n] = String(v); }, getAttribute(n){ return n in this._a ? this._a[n] : null; }, removeAttribute(n){ delete this._a[n]; },
    play(){ return Promise.resolve(); }, pause(){}, load(){},
    querySelector(){ return fakeEl(onWrite); }, querySelectorAll(){ return []; },
    getBoundingClientRect(){ return { top:0, left:0, width:0, height:0, right:0, bottom:0 }; }
  };
  if(onWrite){
    for(const property of ['innerHTML','textContent','innerText']){
      let value = element[property];
      Object.defineProperty(element, property, { get:() => value, set(next){
        value = next; onWrite({ id:id || '', property, value:String(next == null ? '' : next) });
      } });
    }
    element.setAttribute = (name, value) => {
      element._a[name] = String(value);
      if(['title','aria-label','placeholder','alt','label'].includes(name))
        onWrite({ id:id || '', property:name, value:String(value) });
    };
  }
  return element;
}

function carregar(opts){
  opts = opts || {};
  const html = fs.readFileSync(opts.arquivo || ARQ, 'utf8');
  const blocos = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  const els = {};
  const document = {
    getElementById: id => els[id] || (els[id] = fakeEl(opts.onWrite, id)),
    querySelector: () => fakeEl(opts.onWrite), querySelectorAll: () => [],
    documentElement: fakeEl(opts.onWrite), body: fakeEl(opts.onWrite), createElement: () => fakeEl(opts.onWrite), addEventListener(){}
  };
  const store = opts.store || {};
  const ctx = {
    document, console, Math, JSON, Date, Object, Array, String, Number, Set, Map, Promise, Symbol, Error, RegExp,
    isNaN, parseInt, parseFloat, Infinity, NaN, encodeURIComponent, decodeURIComponent, URL,
    localStorage: { getItem:k => (k in store ? store[k] : null), setItem:(k, v) => { store[k] = String(v); }, removeItem:k => { delete store[k]; } },
    setTimeout: () => 0, clearTimeout(){}, setInterval: () => 0, clearInterval(){},
    addEventListener(){}, scrollTo(){}, scrollY:0, innerWidth:1200, performance:{ now:() => Date.now() },
    navigator:{ userAgent:'node' }, location:{ reload(){} }, matchMedia:() => ({ matches:false, addEventListener(){} })
  };
  /* lotes reproduzíveis: com opts.seed, o acaso do jogo vem de um gerador fixo */
  if(opts.seed != null){
    let t = (opts.seed >>> 0) || 1;
    const rnd = () => { t = (t + 0x6D2B79F5) >>> 0; let x = Math.imul(t ^ (t >>> 15), 1 | t); x ^= x + Math.imul(x ^ (x >>> 7), 61 | x); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
    const M = Object.create(Math); M.random = rnd; ctx.Math = M;
  }
  ctx.window = ctx; ctx.self = ctx;
  vm.createContext(ctx);
  /* o banco histórico, que a página carrega por <script src> antes do jogo */
  const HISTARQ = require('path').join(__dirname, '..', 'dados', 'historico.js');
  if(!opts.semHistorico && fs.existsSync(HISTARQ)) vm.runInContext(fs.readFileSync(HISTARQ, 'utf8'), ctx, { filename:'historico.js' });
  const VENCARQ = require('path').join(__dirname, '..', 'dados', 'vencedores.js');
  if(!opts.semHistorico && fs.existsSync(VENCARQ)) vm.runInContext(fs.readFileSync(VENCARQ, 'utf8'), ctx, { filename:'vencedores.js' });
  const TRACARQ = require('path').join(__dirname, '..', 'dados', 'tracados.js');
  if(!opts.semHistorico && fs.existsSync(TRACARQ)) vm.runInContext(fs.readFileSync(TRACARQ, 'utf8'), ctx, { filename:'tracados.js' });
  if(opts.silencioso) ctx.console = { log(){}, warn(){}, error(){}, info(){} };
  /* todos os blocos de script sem atributo, na ordem da página */
  blocos.forEach((b, i) => vm.runInContext(b, ctx, { filename:'bloco' + i + '.js' }));
  /* Os catálogos e a apresentação usam scripts locais defer, após o jogo. */
  for(const arq of ['en.js', 'es.js', 'common.js', 'career.js', 'events.js', 'nationalities.js', 'dialogues.js', 'race.js', 'advanced.js', 'media.js', 'interface.js', 'ja.js', 'ja-ui.js', 'ja-career.js', 'ja-media.js', 'complete-world.js', 'complete-driver.js', 'complete-chief.js', 'complete-common.js', 'novidades.js', 'presenca.js', 'runtime.js']){
    const p = require('path').join(__dirname, '..', 'assets', 'i18n', arq);
    if(fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename:'i18n/' + arq });
  }
  const run = c => vm.runInContext(c, ctx);
  const E = id => document.getElementById(id);
  return { ctx, run, E, els, store };
}

/* começa uma carreira de piloto como o formulário faria */
function novaCarreira(J, o){
  J.run(`S = null; UI.eraSel = ${o.era}; UI.year = ${o.ano}; UI.serie = '${o.serie || 'f1'}'; UI.country = '${o.cc || 'BR'}';
         UI.style = '${o.estilo || 'equilibrado'}'; UI.modo = '${o.modo || 'classico'}'; UI.origem = '${o.origem || 'media'}';`);
  J.E('inName').value = o.nome || 'Teste'; J.E('inNum').value = '7'; J.E('inAge').value = String(o.idade || 17);
  J.E('chkRisk').checked = !!o.risco; J.E('chkFast').checked = o.rapido !== false;
  J.run('Game.start(); UI.limparFila(); UI.close();');
}

/* joga uma temporada inteira e escolhe a melhor vaga; devolve o resumo */
function temporada(J, politica){
  const S = () => J.run('S');
  if(S().retired) return { fim:'aposentado' };
  J.run('Game.simSeason(); UI.limparFila(); UI.close();');
  if(S().retired) return { fim:'acabou' };
  const sea = S().season;
  J.run('Game.endSeason(); UI.limparFila(); UI.close();');
  const sum = S().history[S().history.length - 1];
  if((S().academyOffers || []).length) J.run('S._acadList = S.academyOffers; S.academyOffers = null; Game.joinAcademy(0); UI.limparFila(); UI.close();');
  J.run('S.lastSum = Engine.summary(S.season); Game.showOffers(S.lastSum); UI.limparFila();');
  if(S().retired) return { sea, sum, fim:'sem vaga' };
  const ofs = S().pendingOffers || [];
  const top = J.run('Engine.topCat()');
  let melhor = -1, nota = -1e9;
  ofs.forEach((of, i) => {
    if(of.podeP === false) return;
    let v = (of.team ? of.team.str : 0);
    if(of.sk && of.sk !== S().series) v -= 200;
    if(of.cat === top) v += 100; else if(of.up || of.pulo) v += 50;
    if(of.down) v -= 30;
    if(politica === 'ficar' && of.team && S().team && of.team.name === S().team.name) v += 500;
    if(v > nota){ nota = v; melhor = i; }
  });
  /* a política pode ser uma função que escolhe a proposta pelo índice */
  if(typeof politica === 'function'){ const i = politica(ofs, S()); if(i != null && i >= 0) melhor = i; }
  if(melhor < 0) return { sea, sum, fim:'nada cabia' };
  J.run(`Game.takeOffer(${melhor}); UI.limparFila(); UI.close();`);
  return { sea, sum };
}

module.exports = { carregar, novaCarreira, temporada, fakeEl };
