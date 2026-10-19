/* Tradução local, apresentação dinâmica e preservação dos dados do jogo.
   Sem dependências: node testes/idiomas.js */
const fs = require('fs'), path = require('path'), vm = require('vm');
const assert = require('assert/strict');
const H = require('./base');
let checks = 0;
function eq(a, b, message){ checks++; assert.equal(a, b, message); }
function ok(value, message){ checks++; assert.ok(value, message); }
const dir = path.join(__dirname, '..', 'assets', 'i18n');
const scripts = ['en.js','es.js','common.js','career.js','events.js','nationalities.js','dialogues.js','race.js','advanced.js','media.js','interface.js','ja.js','ja-ui.js','ja-career.js','ja-media.js','runtime.js'];

/* DOM mínimo com a semântica usada pelo runtime: mutações são entregues
   juntas, no fim da operação, e não durante a escrita de uma tradução. */
function page(store = {}, blocked = false){
  let active = null, pending = [], writes = 0;
  const listeners = {}, ids = new Map();
  const mutation = record => { if(active) pending.push(record); };
  class Text {
    constructor(value){ this.nodeType = 3; this._value = value; this.parentNode = null; }
    get parentElement(){ return this.parentNode; }
    get isConnected(){ return !!(this.parentNode && this.parentNode.isConnected); }
    get nodeValue(){ return this._value; }
    set nodeValue(value){ this._value = value; writes++; mutation({ type:'characterData', target:this }); }
    get textContent(){ return this.nodeValue; }
  }
  class Element {
    constructor(tag, id){
      this.nodeType = 1; this.tagName = tag.toUpperCase(); this.childNodes = [];
      this.parentNode = null; this.attrs = {}; this.events = {}; this._value = '';
      if(id){ this.attrs.id = id; ids.set(id, this); }
    }
    get parentElement(){ return this.parentNode; }
    get isConnected(){ return this === doc.documentElement || !!(this.parentNode && this.parentNode.isConnected); }
    appendChild(node){
      node.parentNode = this; this.childNodes.push(node);
      mutation({ type:'childList', target:this, addedNodes:[node] }); return node;
    }
    get textContent(){ return this.childNodes.map(n => n.textContent).join(''); }
    set textContent(value){
      this.childNodes.forEach(n => n.parentNode = null);
      const node = new Text(String(value)); node.parentNode = this; this.childNodes = [node];
      mutation({ type:'childList', target:this, addedNodes:[node] });
    }
    get value(){ return this.tagName === 'OPTION' ? (this.attrs.value == null ? this.textContent : this.attrs.value) : this._value; }
    set value(value){ this._value = String(value); }
    hasAttribute(key){ return key in this.attrs; }
    getAttribute(key){ return this.hasAttribute(key) ? this.attrs[key] : null; }
    setAttribute(key, value){ this.attrs[key] = String(value); mutation({ type:'attributes', target:this, attributeName:key }); }
    addEventListener(key, fn){ (this.events[key] = this.events[key] || []).push(fn); }
    closest(selector){
      const matches = selector.split(',').some(s => s.startsWith('[') ? this.hasAttribute(s.slice(1,-1)) : this.tagName.toLowerCase() === s);
      return matches ? this : this.parentNode ? this.parentNode.closest(selector) : null;
    }
    set innerHTML(value){ throw new Error('A tradução não pode reescrever HTML: ' + value); }
  }
  const doc = { readyState:'loading', title:'', getElementById:id => ids.get(id) || null,
    addEventListener(key, fn){ listeners[key] = fn; } };
  doc.documentElement = new Element('html'); doc.body = new Element('body');
  doc.documentElement.appendChild(doc.body);
  const create = (tag, text, parent = doc.body, id) => {
    const node = new Element(tag, id); if(text != null) node.appendChild(new Text(text)); parent.appendChild(node); return node;
  };
  const picker = create('select', null, doc.body, 'languageSelect');
  picker.setAttribute('aria-label','Idioma');
  for(const [value, label] of [['pt','PT'],['en','EN'],['es','ES'],['ja','JP']]) create('option',label,picker).setAttribute('value',value);
  const context = { document:doc, console, Set, Map, WeakMap, String, Array, Object,
    localStorage:{ getItem:key => { if(blocked) throw Error('storage'); return store[key] || null; },
      setItem:(key,value) => { if(blocked) throw Error('storage'); store[key] = value; } },
    CustomEvent:class { constructor(type, options){ this.type = type; this.detail = options.detail; } },
    dispatchEvent(event){ if(listeners[event.type]) listeners[event.type](event); },
    MutationObserver:class {
      constructor(callback){ this.callback = callback; }
      observe(){ active = this; }
      disconnect(){ if(active === this) active = null; pending = []; }
    }
  };
  context.window = context;
  vm.createContext(context);
  for(const name of scripts) vm.runInContext(fs.readFileSync(path.join(dir,name),'utf8'), context, { filename:name });
  return { context, doc, picker, create, store, init:() => listeners.DOMContentLoaded(),
    flush(){ const observer = active, records = pending; pending = []; if(observer && records.length) observer.callback(records); },
    pending:() => pending.length, writes:() => writes };
}

const P = page(), api = P.context.VDO_I18N;
const button = P.create('button','Iniciar carreira'), icon = P.create('svg',null,button);
icon.setAttribute('viewBox','0 0 24 24'); const handler = () => {}; button.addEventListener('click',handler);
const input = P.create('input'); input.value = 'Meu piloto <b>BR</b>'; input.setAttribute('placeholder','Buscar país…');
const paragraph = P.create('p','Formação ativa desde 2023 · ligado à Aston Martin');
const name = P.create('span','Brasil'); name.setAttribute('data-i18n-ignore','');
const option = P.create('option','Todas');
const typed = P.create('textarea','Arquivo'), code = P.create('code','Salvar');
const image = P.create('img'); image.setAttribute('src','assets/flags/br.svg'); image.setAttribute('title','Brasil');
const toast = P.create('p','Carreira salva neste aparelho.');
const age = P.create('span','17 anos');
const durationBox = P.create('div'); durationBox.setAttribute('data-i18n-duration','');
const duration = P.create('button','2 anos',durationBox), oneYear = P.create('span','1 ano',durationBox);
P.init(); eq(api.language,'pt','português é o padrão');
ok(api.setLanguage('en'),'inglês disponível');
eq(button.textContent,'Start a career','rótulo estático traduzido');
eq(button.childNodes[1],icon,'ícone SVG conserva a identidade');
eq(button.events.click[0],handler,'evento de clique preservado');
eq(input.value,'Meu piloto <b>BR</b>','valor digitado nunca é traduzido');
eq(input.getAttribute('placeholder'),'Search countries…','placeholder traduzido');
eq(option.textContent,'All','opção exibida traduzida'); eq(option.value,'Todas','valor implícito da opção continua canônico');
eq(name.textContent,'Brasil','identidade marcada preservada');
eq(typed.textContent,'Arquivo','conteúdo editável preservado'); eq(code.textContent,'Salvar','código preservado');
eq(image.getAttribute('title'),'Brazil','atributo acessível traduzido'); eq(image.getAttribute('src'),'assets/flags/br.svg','caminho da bandeira preservado');
eq(paragraph.textContent,'Academy member since 2023 · linked to Aston Martin','template e identidade da academia preservados');
eq(P.doc.documentElement.lang,'en','idioma do documento correto'); eq(P.picker.value,'en','seletor acompanha idioma');
eq(P.store.vdo_language,'en','preferência salva separada da carreira');
eq(P.pending(),0,'tradução não realimenta o observador');

toast.textContent = 'Você entrou na Ferrari Driver Academy.';
input.setAttribute('placeholder','Ex.: Senna'); P.flush();
eq(toast.textContent,'You have joined Ferrari Driver Academy.','mensagem criada após iniciar é traduzida');
eq(input.getAttribute('placeholder'),'E.g. Senna','atributo atualizado pelo jogo é traduzido');
eq(P.pending(),0,'atualização dinâmica não cria um ciclo');
api.setLanguage('es');
eq(button.textContent,'Iniciar carrera','troca do inglês direto para espanhol');
eq(toast.textContent,'Te has unido a Ferrari Driver Academy.','texto dinâmico troca sem encadear traduções');
eq(P.doc.documentElement.lang,'es','idioma espanhol no documento');
ok(api.setLanguage('ja'),'japonês disponível');
eq(button.textContent,'キャリアを始める','troca direta do espanhol para japonês');
eq(input.getAttribute('placeholder'),'例：Senna','placeholder japonês');
eq(P.picker.getAttribute('aria-label'),'言語','seletor tem nome acessível em japonês');
eq(P.doc.documentElement.lang,'ja','idioma japonês do documento');
ok(P.doc.title.includes('モータースポーツ'),'título da página em japonês');
eq(P.picker.value,'ja','seletor acompanha japonês');
eq(P.store.vdo_language,'ja','preferência japonesa salva');
eq(input.value,'Meu piloto <b>BR</b>','troca para japonês mantém texto digitado');
eq(button.childNodes[1],icon,'japonês mantém o SVG');
eq(button.events.click[0],handler,'japonês mantém o evento');
eq(image.getAttribute('title'),'ブラジル','nome acessível da bandeira em japonês');
eq(image.getAttribute('src'),'assets/flags/br.svg','japonês mantém arquivo da bandeira');
eq(age.textContent,'17歳','idade recebe unidade japonesa de idade');
eq(duration.textContent,'2年','duração do contrato recebe unidade de anos');
eq(oneYear.textContent,'1年','duração de um ano também recebe unidade de anos');
toast.textContent='Volta 3 de 40'; P.flush();
eq(toast.textContent,'全40周中3周目','japonês traduz mutações durante a corrida');
eq(P.pending(),0,'japonês não realimenta o observador');
toast.textContent='Você entrou na Ferrari Driver Academy.'; P.flush();
api.setLanguage('pt');
eq(button.textContent,'Iniciar carreira','volta ao texto português exato');
eq(toast.textContent,'Você entrou na Ferrari Driver Academy.','texto dinâmico original recuperado');
eq(input.getAttribute('placeholder'),'Ex.: Senna','atributo mais recente recuperado');
eq(paragraph.textContent,'Formação ativa desde 2023 · ligado à Aston Martin','frase original recuperada');
eq(P.doc.documentElement.lang,'pt-BR','idioma português no documento');
eq(duration.textContent,'2 anos','contrato recupera o português original');
eq(oneYear.textContent,'1 ano','duração singular recupera o português original');
ok(!api.setLanguage('fr'),'idioma desconhecido recusado sem trocar preferência');
ok(!api.setLanguage('toString'),'nomes de propriedades herdadas não são idiomas');

for(const [source,en,es] of [
  ['Volta 3 de 40','Lap 3 of 40','Vuelta 3 de 40'],
  ['Brasil · 17 anos','Brazil · 17 years old','Brasil · 17 años'],
  ['Kart Regional → Fórmula 4 Italiana','Regional Karting → Italian Formula 4','Karting Regional → Fórmula 4 Italiana'],
  ['— Provas avulsas de endurance liberadas.','— One-off endurance races allowed.','— Se permiten pruebas sueltas de resistencia.'],
  ['Honda até 2025','Honda until 2025','Honda hasta 2025'],
  ['motor Honda','Honda engine','motor Honda'],
  ['Que orgulho ver um argentino campeão de novo. Muito bem, Messi.','So proud to see an Argentine become champion again. Well done, Messi.','Qué orgullo ver a un argentino campeón de nuevo. Muy bien, Messi.'],
  ['€ 2,4 mi','€ 2.4m','€ 2,4 M'],
  ['21º','21st','21º'],
  ['Carlos de Oliveira','Carlos de Oliveira','Carlos de Oliveira'],
  ['2. Argentino de Kart','2. Argentine Karting Championship','2. Campeonato Argentino de Karting'],
  ['1950 a 1959','1950 to 1959','1950 a 1959'],
  ['País: Alemanha','Country: Germany','País: Alemania'],
  ['1 de 2','1 of 2','1 de 2'],
  ['GP Bahrein','GP Bahrain','GP Baréin'],
  ['Senna passa Prost.','Senna overtakes Prost.','Senna adelanta a Prost.'],
  ['Venceu depois de largar em 2º debaixo de água. A vitória apareceu e você não hesitou.',
    'You won after starting 2nd in the pouring rain. The opportunity came and you took it.',
    'Ganaste tras salir en 2º bajo la lluvia. La oportunidad llegó y no dudaste.']
]){ eq(api.text(source,'en'),en,source+' em inglês'); eq(api.text(source,'es'),es,source+' em espanhol'); }
eq(api.search('Áustria'),'austria','busca ignora acentos');
eq(api.search('ｱﾙｾﾞﾝﾁﾝ'),api.search('アルゼンチン'),'busca aceita katakana de meia largura sem perder vozeamento');
eq(api.search('ＪＡＰＡＮ'),api.search('Japan'),'busca aceita letras de largura inteira');
for(const [source,target] of [
  ['Japão','日本'], ['País: Japão','国: 日本'],
  ['Japão · 17 anos','日本 · 17歳'], ['um japonês','日本人ドライバー'],
  ['uma japonesa','日本人ドライバー'], ['Poucas japonesas','少数の日本人ドライバー'],
  ['Volta 3 de 40','全40周中3周目'], ['21º','21位'], ['2º','2位'],
  ['€ 2,4 mi','€240万'], ['€ 380 mil','€38万'], ['€ 120 mi','€1.2億'],
  ['€ 3 mil','€3,000'], ['Senna passa Prost.','SennaがProstを抜いた。'],
  ['patrocinador principal · 3 ano(s)','メインスポンサー · 3年'],
  ['26 anos · nível 87 · € 1,5 mi por ano','26歳 · レベル 87 · 年額€150万'],
  ['A Ferrari fecha com a Honda para 3 temporadas.','FerrariがHondaと3シーズンの契約を結んだ。'],
  ['A Ferrari fecha com a Honda para uma temporada.','FerrariがHondaと1シーズンの契約を結んだ。'],
  ['Hoje: 3 anos. Segurança para você, risco para eles.','現在は3年契約。あなたにとっては安心、チームにとってはリスクになる。'],
  ['Senna para sem combustível.','Sennaが燃料切れで止まった。'],
  ['FORA','敗退'], ['Na equipe','所属チームで'],
  ['Você tem contrato com a','契約先：'],
  ['por mais 2 anos. Assinar com outra equipe é quebrar o contrato: a multa é de',
    'との契約はあと2年。別のチームと契約すると違反となり、違約金は'],
  [', a sua fama sofre e a Ferrari não volta a te chamar tão cedo.',
    '。知名度が下がり、Ferrariからも当分声がかかりません。'],
  ['Venceu depois de largar em 2º debaixo de água. A vitória apareceu e você não hesitou.',
    '激しい雨の中で、2位からスタートして優勝。巡ってきたチャンスを逃しませんでした。'],
  ['Venceu depois de largar em 2º. A vitória apareceu e você não hesitou.',
    '2位からスタートして優勝。巡ってきたチャンスを逃しませんでした。'],
  ['佐藤','佐藤'], ['佐藤 健太','佐藤 健太'],
  ['Que orgulho ver um japonês campeão de novo. Muito bem, 森.',
    '再び日本人ドライバーが王者になる姿を見られて誇らしい。よくやった、森。']
]) eq(api.text(source,'ja'),target,source+' em japonês');
const injection = 'Você entrou na <img src=x onerror=alert(1)>.';
toast.textContent = injection; api.setLanguage('en');
eq(toast.childNodes.length,1,'valores de templates continuam texto, sem inserir HTML');
eq(toast.textContent,'You have joined <img src=x onerror=alert(1)>.','template mantém conteúdo como texto');
api.setLanguage('pt'); eq(toast.textContent,injection,'restauração não altera valor interpolado');
P.context.VDO_LANGUAGE_NAMES = () => new Set(['Brasil']); api.setLanguage('en');
eq(api.text('Brasil'),'Brasil','nome escolhido pelo jogador é protegido');
P.context.VDO_LANGUAGE_NAMES = () => new Set(); api.apply();
eq(api.text('Brasil'),'Brazil','cache acompanha a mudança de identidades');

const resumed = page({ vdo_language:'es' }); resumed.init(); eq(resumed.context.VDO_I18N.language,'es','preferência restaurada em outra abertura');
const resumedJa = page({ vdo_language:'ja' }); resumedJa.init();
eq(resumedJa.context.VDO_I18N.language,'ja','japonês restaurado ao reabrir');
eq(resumedJa.doc.documentElement.lang,'ja','documento reaberto já em japonês');
const invalid = page({ vdo_language:'xx' }); invalid.init(); eq(invalid.context.VDO_I18N.language,'pt','preferência inválida volta ao português');
const storageBlocked = page({},true); storageBlocked.init(); ok(storageBlocked.context.VDO_I18N.setLanguage('es'),'idioma funciona com armazenamento bloqueado');
ok(storageBlocked.context.VDO_I18N.setLanguage('ja'),'japonês funciona sem armazenamento');

for(const lang of ['en','es','ja']){
  const locale = P.context.VDO_LOCALES[lang]; ok(locale.pairs.length > 1000,'catálogo amplo de '+lang);
  for(const [source,target] of locale.pairs){
    ok(typeof source === 'string' && typeof target === 'string' && source.trim() && target.trim(),'par válido de '+lang);
    const keys = s => [...new Set([...s.matchAll(/\{(\w+)\}/g)].map(m=>m[1]))].sort().join('|');
    eq(keys(source),keys(target),'placeholders preservados: '+source);
    ok(!/<(?:script|iframe)\b/i.test(target),'catálogo de texto seguro');
  }
}

/* A língua não participa da simulação e não traduz categorias dentro do save. */
const J = H.carregar({ silencioso:true }); H.novaCarreira(J,{ era:7,ano:2024,idade:8,cc:'AR',nome:'Brasil',rapido:false });
const before = J.run('JSON.stringify(S)');
for(const lang of ['en','es','ja','pt']){
  J.ctx.VDO_I18N.setLanguage(lang); eq(J.run('JSON.stringify(S)'),before,'carreira intacta em '+lang);
}
J.ctx.VDO_I18N.setLanguage('en'); J.run("UI.pickCountry('DE')");
eq(J.E('inCountry').value,'Germany','campo de país escolhido usa o idioma'); eq(J.run('UI.country'),'DE','nacionalidade mantém o código original');
J.ctx.VDO_I18N.setLanguage('ja'); J.run("UI.pickCountry('JP')");
eq(J.E('inCountry').value,'日本','formulário aceita país em japonês'); eq(J.run('UI.country'),'JP','japonês usa código canônico no formulário');
eq(J.run('S.driver.cc'),'AR','trocar idioma e formulário não altera a nacionalidade da carreira');
J.run('Game.save()');
eq(JSON.parse(J.store.vdo_save).season.cat,'Kart Regional','save guarda categoria original');

for(const data of ['CONVERSAS','PEDIDOS','EVENTOS']){
  const choices = J.run(data + '.flatMap(x => [x.t, ...x.ops.map(o => o.t)])');
  for(const lang of ['en','es','ja']){
    const translated = new Set(P.context.VDO_LOCALES[lang].pairs.map(p => p[0]));
    ok(choices.every(t => translated.has(t)),data+': todos os títulos e escolhas possuem entrada em '+lang);
  }
}
/* Textos dos dados da carreira também precisam de entradas, além dos menus. */
for(const data of ['EMPRESARIOS','ORIGENS','RELACOES','ARQUETIPOS','TRACOS','INVERNO',
  'COMPROMISSOS','PERSONAS','OBJETIVOS','CONVERSAS','PEDIDOS','EVENTOS','SEMENTES','PROMESSAS','LEITURAS','EVENTOS_FUNDOS']){
  const sources = [];
  function visit(obj, opening){
    if(!obj || typeof obj !== 'object') return;
    for(const [key,value] of Object.entries(obj)){
      if(typeof value === 'string' && (opening || ['n','t','d','ds','sub','pista'].includes(key)) &&
        !(data === 'EMPRESARIOS' && key === 'n')) sources.push(value);
      else if(value && typeof value === 'object') visit(value, opening || key === 'abre');
    }
  }
  visit(J.run(data),false);
  for(const lang of ['en','es','ja']){
    const keys = new Set(P.context.VDO_LOCALES[lang].pairs.map(p => p[0].replace(/\s+/g,' ').trim()));
    const missing = sources.filter(s => !keys.has(s.replace(/\s+/g,' ').trim()));
    eq(missing.join('\n'),'',data+': cobertura dos textos em '+lang);
  }
}
for(const cc of J.run('COUNTRIES.map(c => c.cc)')) for(const gender of ['m','f']){
  const data = J.run(`nacionalidadePiloto(${JSON.stringify(cc)}, ${JSON.stringify(gender)})`);
  for(const lang of ['en','es','ja']){
    const keys = new Set(P.context.VDO_LOCALES[lang].pairs.map(p => p[0]));
    ok(Object.values(data).every(s => keys.has(s)),cc+'/'+gender+': nacionalidade catalogada em '+lang);
  }
}
const chief = H.carregar({ silencioso:true });
chief.run('Chefe.novo({modo:"assumir",ano:2024,idx:0,chefe:{nome:"Brasil",cc:"BR"}})');
const teamBefore = chief.run('JSON.stringify(C)');
for(const lang of ['es','en','ja','pt']){
  chief.ctx.VDO_I18N.setLanguage(lang);
  eq(chief.run('JSON.stringify(C)'),teamBefore,'equipe do chefe intacta em '+lang);
}
const html = fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
for(const name of scripts){
  ok(html.includes('src="assets/i18n/'+name+'" defer'), name+': carregamento local na página');
}
ok(html.includes('id="languageSelect"'),'seletor visível integrado na página');
ok(html.includes('value="ja" lang="ja" aria-label="日本語">JP</option>'),'opção japonesa exibe JP e mantém o código de idioma correto');
const japaneseKeys = new Set(P.context.VDO_LOCALES.ja.pairs.map(p => p[0].replace(/\s+/g,' ').trim()));
const missingJapanese = P.context.VDO_LOCALES.en.pairs.map(p=>p[0].replace(/\s+/g,' ').trim()).filter(s=>!japaneseKeys.has(s));
eq([...new Set(missingJapanese)].join('\n'),'','catálogo japonês cobre todas as fontes já disponíveis em inglês');

console.log(`${checks} verificações de idiomas: tudo certo`);
