/* Carrega o jogo inteiro no Node, com uma página falsa, para testes. */
const fs = require('fs');
const vm = require('vm');
const ARQ = process.env.VDO_HTML || require('path').join(__dirname, '..', 'index.html');

function fakeEl(){
  const cl = new Set();
  return {
    _v:'', innerHTML:'', textContent:'', innerText:'', checked:false, style:{ setProperty(){} }, dataset:{},
    options:[], min:13, max:30, children:[],
    classList:{ add:c => cl.add(c), remove:c => cl.delete(c),
      toggle:(c, f) => { (f === undefined ? !cl.has(c) : f) ? cl.add(c) : cl.delete(c); }, contains:c => cl.has(c) },
    get value(){ return this._v; }, set value(v){ this._v = String(v); },
    addEventListener(){}, appendChild(){}, focus(){}, scrollIntoView(){}, setAttribute(){}, getAttribute(){ return null; },
    querySelector(){ return fakeEl(); }, querySelectorAll(){ return []; },
    getBoundingClientRect(){ return { top:0, left:0, width:0, height:0, right:0, bottom:0 }; }
  };
}

function carregar(opts){
  opts = opts || {};
  const html = fs.readFileSync(opts.arquivo || ARQ, 'utf8');
  const blocos = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  const els = {};
  const document = {
    getElementById: id => els[id] || (els[id] = fakeEl()),
    querySelector: () => fakeEl(), querySelectorAll: () => [],
    documentElement: fakeEl(), body: fakeEl(), createElement: () => fakeEl(), addEventListener(){}
  };
  const store = opts.store || {};
  const ctx = {
    document, console, Math, JSON, Date, Object, Array, String, Number, Set, Map, Promise, Symbol, Error, RegExp,
    isNaN, parseInt, parseFloat, Infinity, NaN, encodeURIComponent, decodeURIComponent,
    localStorage: { getItem:k => (k in store ? store[k] : null), setItem:(k, v) => { store[k] = String(v); }, removeItem:k => { delete store[k]; } },
    setTimeout: () => 0, clearTimeout(){}, setInterval: () => 0, clearInterval(){},
    addEventListener(){}, scrollTo(){}, scrollY:0, innerWidth:1200, performance:{ now:() => Date.now() },
    navigator:{ userAgent:'node' }, location:{ reload(){} }, matchMedia:() => ({ matches:false, addEventListener(){} })
  };
  ctx.window = ctx; ctx.self = ctx;
  vm.createContext(ctx);
  vm.runInContext(blocos[0], ctx, { filename:'bloco0.js' });
  vm.runInContext(blocos[1], ctx, { filename:'bloco1.js' });
  const run = c => vm.runInContext(c, ctx);
  const E = id => document.getElementById(id);
  return { ctx, run, E, store };
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
  if(melhor < 0) return { sea, sum, fim:'nada cabia' };
  J.run(`Game.takeOffer(${melhor}); UI.limparFila(); UI.close();`);
  return { sea, sum };
}

module.exports = { carregar, novaCarreira, temporada, fakeEl };
