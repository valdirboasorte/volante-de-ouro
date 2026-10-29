/* As animações vêm ligadas por padrão, mesmo com o movimento reduzido do sistema;
   só a escolha explícita do jogador ("desligar") as desliga.
   Exercita os scripts reais, antes do primeiro desenho e depois dos cliques.
   Uso: node testes/movimento.js */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { carregar, fakeEl } = require('./base');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(process.env.VDO_HTML || path.join(root, 'index.html'), 'utf8');
const head = html.match(/<head>([\s\S]*?)<\/head>/i)[1];
const inicio = [...head.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const publico = fs.readFileSync(path.join(root, 'assets', 'presenca-web.js'), 'utf8');
let checks = 0;
function eq(actual, expected, message){ checks++; assert.equal(actual, expected, message); }
function classes(element, ligado, message){
  eq(element.classList.contains('mov'), ligado, message + ': classe mov');
  eq(element.classList.contains('sem-mov'), !ligado, message + ': classe sem-mov');
}
function esperado(reduzido, pref){ return pref !== '0'; }

eq(inicio.length > 0, true, 'script inicial encontrado no head');
for(const reduzido of [false, true]) for(const pref of [undefined, '0', '1']){
  const rotulo = `sistema ${reduzido ? 'reduzido' : 'normal'}, escolha ${pref === undefined ? 'ausente' : pref}`;
  const storage = pref === undefined ? {} : { vdo_mov:pref };
  const element = fakeEl();
  const ctx = { document:{documentElement:element}, localStorage:{getItem:key => storage[key] ?? null},
    matchMedia:() => ({matches:reduzido}) };
  ctx.window = ctx;
  vm.createContext(ctx);
  inicio.forEach(script => vm.runInContext(script, ctx));
  classes(element, esperado(reduzido, pref), 'primeiro desenho: ' + rotulo);
  eq(storage.vdo_mov, pref, 'primeiro desenho não grava preferência: ' + rotulo);
}

const store = { vdo_save:'carreira preservada', vdo_chefe:'equipe preservada' };
const J = carregar({ semHistorico:true, silencioso:true, store });
let reduzido = false;
const mediaEvents = {};
J.ctx.matchMedia = () => ({get matches(){return reduzido;}, addEventListener:(kind, fn) => {mediaEvents[kind] = fn;}});
J.run('UI.toast = () => {};');

function estado(ligado, rotulo){
  eq(J.run('UI.movimentoLigado()'), ligado, rotulo + ': estado efetivo');
  classes(J.ctx.document.documentElement, ligado, rotulo);
  eq(J.E('btnMov').getAttribute('aria-pressed'), String(ligado), rotulo + ': botão acessível');
  eq(J.E('btnMov').title, ligado ? 'Desligar as animações' : 'Ligar as animações', rotulo + ': ação do botão');
  eq(J.run('Abertura.reduzido'), !ligado, rotulo + ': abertura sincronizada');
  eq(J.E('peMov').textContent, ligado ? 'Desligar as animações' : 'Ligar as animações', rotulo + ': menu sincronizado');
}

for(const sistema of [false, true]) for(const pref of [undefined, '0', '1']){
  reduzido = sistema;
  if(pref === undefined) delete store.vdo_mov;
  else store.vdo_mov = pref;
  const rotulo = `sistema ${sistema ? 'reduzido' : 'normal'}, escolha ${pref === undefined ? 'ausente' : pref}`;
  const ligado = esperado(sistema, pref);
  eq(J.run('UI.aplicarMovimento()'), ligado, 'aplicar: ' + rotulo);
  J.run('Abertura.iniciar();');
  estado(ligado, 'iniciar: ' + rotulo);
  eq(store.vdo_mov, pref, 'aplicar preserva ausência ou escolha: ' + rotulo);

  J.run('UI.alternarMovimento();');
  estado(!ligado, 'primeiro clique: ' + rotulo);
  eq(store.vdo_mov, ligado ? '0' : '1', 'primeiro clique persiste escolha: ' + rotulo);
  J.run('UI.aplicarMovimento();');
  estado(!ligado, 'reaplicar mantém escolha: ' + rotulo);

  J.run('UI.alternarMovimento();');
  estado(ligado, 'segundo clique: ' + rotulo);
  eq(store.vdo_mov, ligado ? '1' : '0', 'segundo clique persiste escolha: ' + rotulo);
}

/* O listener real atualiza também vídeo, rótulo do menu e classes. */
vm.runInContext(publico, J.ctx, {filename:'presenca-web.js'});
eq(typeof mediaEvents.change, 'function', 'listener da preferência do sistema registrado');
for(const pref of [undefined, '0', '1']){
  if(pref === undefined) delete store.vdo_mov;
  else store.vdo_mov = pref;
  for(const sistema of [true, false]){
    reduzido = sistema;
    mediaEvents.change({matches:sistema});
    estado(esperado(sistema, pref), `mudança do sistema para ${sistema}, escolha ${pref}`);
    eq(store.vdo_mov, pref, 'mudança do sistema não grava uma escolha do jogador');
  }
}
eq(store.vdo_save, 'carreira preservada', 'controles de animação não alteram a carreira');
eq(store.vdo_chefe, 'equipe preservada', 'controles de animação não alteram a equipe');
console.log(`animações: ${checks} verificações de preferência, cliques e sincronização passaram`);
