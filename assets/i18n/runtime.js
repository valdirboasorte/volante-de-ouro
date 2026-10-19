/* Tradução da apresentação. O motor e os saves conservam os valores originais.
   Os catálogos são locais: inclusive ao abrir index.html sem servidor. */
(function(global){
  'use strict';
  const doc = global.document, KEY = 'vdo_language';
  const locales = global.VDO_LOCALES || {}, compiled = new Map();
  const originals = new WeakMap(), attributes = new WeakMap();
  const ATTRS = ['title', 'aria-label', 'placeholder', 'alt', 'label'];
  const SKIP = 'script,style,noscript,textarea,code,pre,[data-i18n-ignore]';
  const normal = s => String(s).replace(/\s+/g, ' ').trim();
  const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const supported = lang => lang === 'pt' || (Object.prototype.hasOwnProperty.call(locales, lang) && Array.isArray(locales[lang].pairs));
  let language = 'pt', observer = null, started = false, names = new Set();
  try{ const saved = global.localStorage.getItem(KEY); if(supported(saved)) language = saved; }catch(e){}

  function catalog(lang){
    if(compiled.has(lang)) return compiled.get(lang);
    const exact = new Map(), folded = new Map(), templates = [];
    for(const pair of (locales[lang] || {}).pairs || []){
      if(!Array.isArray(pair) || pair.length !== 2) continue;
      const source = normal(pair[0]), target = normal(pair[1]);
      if(!source || !target) continue;
      const keys = [...source.matchAll(/\{(\w+)\}/g)].map(m => m[1]);
      if(!keys.length){
        exact.set(source, target);
        const lower = source.toLocaleLowerCase('pt-BR');
        if(!exact.has(lower)) exact.set(lower, target.toLocaleLowerCase(lang));
        folded.set(lower, target); continue;
      }
      const dstKeys = [...target.matchAll(/\{(\w+)\}/g)].map(m => m[1]);
      if(keys.length > 6 || [...new Set(keys)].sort().join('|') !== [...new Set(dstKeys)].sort().join('|')) continue;
      const literals = source.split(/\{\w+\}/g), weight = literals.join('').trim().length;
      if(weight < 3 && !(keys.length === 2 && ['a','de'].includes(literals.join('').trim())) && literals[0] !== 'GP ') continue;
      const pattern = '^' + literals.map((s, i) => escape(s) + (i < keys.length
        ? keys[i] === 'pos' ? '(\\d+º?|P\\d+|—)' : '(.*?)' : '')).join('') + '$';
      templates.push({ source, target, keys, rx:new RegExp(pattern, 'u'),
        prefix:literals[0], weight, numeric:weight < 8 && !literals[0].trim() && keys.every(k => /^\d+$/.test(k)) });
    }
    templates.sort((a, b) => b.weight - a.weight);
    const phrases = [...exact.keys()].filter(s => s.length >= 25 && /[.!?]$/.test(s)).sort((a, b) => b.length - a.length);
    const phraseRx = phrases.length ? new RegExp('(?<![\\p{L}\\p{N}])(?:' + phrases.map(escape).join('|') + ')(?![\\p{L}\\p{N}])', 'gu') : null;
    const data = { exact, folded, templates, phraseRx, cache:new Map() };
    compiled.set(lang, data); return data;
  }

  function formats(s, lang){
    s = s.replace(/€\s*(\d+(?:,\d+)?)\s*(mi|mil)\b/g, (_, number, unit) => {
      if(lang === 'ja'){
        const value = Number(number.replace(',', '.')) * (unit === 'mi' ? 1e6 : 1e3);
        const magnitude = value >= 1e8 ? 1e8 : value >= 1e4 ? 1e4 : 1;
        return '€' + new Intl.NumberFormat('ja-JP', { maximumFractionDigits:4 }).format(value / magnitude)
          + (magnitude === 1e8 ? '億' : magnitude === 1e4 ? '万' : '');
      }
      return lang === 'en' ? '€ ' + number.replace(',', '.') + (unit === 'mi' ? 'm' : 'k')
        : '€ ' + number + (unit === 'mi' ? ' M' : ' mil');
    });
    if(lang === 'en') s = s.replace(/\b(\d+)º\b|\b(\d+)º(?=$|[\s.,;:)])/g, (_, a, b) => {
      const n = Number(a || b), mod = n % 100;
      return n + (mod >= 11 && mod <= 13 ? 'th' : ({1:'st',2:'nd',3:'rd'}[n % 10] || 'th'));
    });
    if(lang === 'ja') s = s.replace(/(\d+)º/g, '$1位');
    return s;
  }

  function core(source, lang, depth){
    if(lang === 'pt' || !locales[lang] || depth > 4 || !source || names.has(source)) return source;
    const data = catalog(lang);
    if(data.exact.has(source)) return data.exact.get(source);
    if(source === source.toLocaleUpperCase('pt-BR') && /[A-ZÁ-Ú]/.test(source)){
      const target = data.folded.get(source.toLocaleLowerCase('pt-BR'));
      if(target) return target.toLocaleUpperCase(lang);
    }
    for(const p of data.templates){
      if(p.prefix && !source.startsWith(p.prefix)) continue;
      if(source.length > 2400) continue;
      const match = p.rx.exec(source); if(!match) continue;
      /* "para" também é preposição. Uma frase de contrato não é uma
         parada na pista; o motivo da parada começa com "com" ou "sem". */
      if(p.source === '{piloto} para {motivo}.' && !/^(?:com|sem) /u.test(match[2])) continue;
      if(p.numeric && match.slice(1).some(v => !/^[\d\s.,%+−–×ºª/€:()-]+$/.test(v)) &&
        !(p.source === '{0} até {1}' && /^\d{4}$/.test(match[2]))) continue;
      const values = {};
      let valid = true;
      p.keys.forEach((key, i) => {
        if(key in values && values[key] !== match[i + 1]) valid = false;
        values[key] = match[i + 1];
      });
      if(!valid) continue;
      return p.target.replace(/\{(\w+)\}/g, (_, key) => {
        const value = values[key];
        if(/^(eu|nome|piloto|rival|eq|equipe|team|jornalista)$/.test(key)) return value;
        if(lang === 'ja') return core(normal(value), lang, depth + 1);
        return value.match(/^\s*/)[0] + core(normal(value), lang, depth + 1) + value.match(/\s*$/)[0];
      });
    }
    /* Textos do motor podem juntar dois parágrafos conhecidos no mesmo nó.
       Substitua somente frases completas do catálogo, nunca palavras soltas. */
    if(data.phraseRx){
      let matched = false;
      const joined = source.replace(data.phraseRx, s => { matched = true; return data.exact.get(s); });
      if(matched) return joined;
    }
    /* Frases compostas por rótulos independentes, como a ficha do piloto. */
    for(const separator of [' · ', ' — ', ' → ', '\n']){
      if(!source.includes(separator)) continue;
      return source.split(separator).map(s => core(s.trim(), lang, depth + 1)).join(separator);
    }
    const numbered = source.match(/^(\d+[.)]\s+)(.+)$/u);
    if(numbered) return numbered[1] + core(numbered[2], lang, depth + 1);
    const colon = source.indexOf(': ');
    if(colon > 0 && data.exact.has(source.slice(0, colon)))
      return data.exact.get(source.slice(0, colon)) + ': ' + core(source.slice(colon + 2), lang, depth + 1);
    const count = source.match(/^(.+?)\s+(\d+(?:\/\d+)?|\d+\s+ano\(s\))$/u);
    if(count && data.exact.has(count[1])) return data.exact.get(count[1]) + ' ' + count[2].replace('ano(s)', lang === 'en' ? 'year(s)' : lang === 'ja' ? '年' : 'año(s)');
    /* Texto de botão/rótulo com seta, dois-pontos, aspas ou pontuação. */
    const edge = source.match(/^([←→—·•“”«»"'\s]*)(.*?)([←→—·•“”«»"':.!?\s]*)$/u);
    if(edge && edge[2] && edge[2] !== source){
      const translated = core(edge[2], lang, depth + 1);
      if(translated !== edge[2]) return edge[1] + translated + edge[3];
    }
    /* Um parágrafo pode juntar frases de catálogos diferentes. */
    if(depth < 2 && /[.!?] /.test(source)){
      const parts = source.split(/(?<=[.!?])\s+(?=[A-ZÁ-Ú“—])/u);
      if(parts.length > 1) return parts.map(s => core(s, lang, depth + 1)).join(' ');
    }
    return source;
  }

  function text(value, lang){
    if(value == null) return '';
    const raw = String(value); lang = lang || language;
    if(lang === 'pt' || !locales[lang]) return raw;
    const source = normal(raw); if(!source || !/\p{L}/u.test(source)) return formats(raw, lang);
    const data = catalog(lang);
    let result = data.cache.get(source);
    if(result == null){
      result = formats(core(source, lang, 0), lang);
      if(data.cache.size >= 2000) data.cache.clear();
      data.cache.set(source, result);
    }
    return raw.match(/^\s*/)[0] + result + raw.match(/\s*$/)[0];
  }

  function refreshNames(){
    let next;
    try{ next = typeof global.VDO_LANGUAGE_NAMES === 'function' ? global.VDO_LANGUAGE_NAMES() : new Set(); }catch(e){ next = new Set(); }
    if(next.size === names.size && [...next].every(n => names.has(n))) return;
    names = next;
    /* Nomes podem mudar ao carregar outra carreira. Não reutilize capturas. */
    for(const data of compiled.values()) data.cache.clear();
  }
  function ignored(node){
    const parent = node.nodeType === 1 ? node : node.parentElement;
    return !parent || !!(parent.closest && parent.closest(SKIP));
  }
  function translateNode(node){
    if(ignored(node)) return;
    if(node.nodeType === 3){
      const current = node.nodeValue, old = originals.get(node);
      const source = old && old.rendered === current ? old.source : current;
      /* Japonês distingue idade (歳) de duração (年). O texto português de
         ambos é "2 anos"; os campos de contrato indicam esse contexto. */
      const duration = language === 'ja' && node.parentElement.closest('[data-i18n-duration]') && normal(source).match(/^(\d+)\s+anos?$/u);
      const result = duration ? source.replace(/\d+\s+anos?/, duration[1] + '年') : text(source);
      originals.set(node, { source, rendered:result });
      if(current !== result) node.nodeValue = result;
      return;
    }
    if(node.nodeType !== 1) return;
    /* Option sem value usa o texto como chave do filtro. Traduzi-lo não pode
       alterar o valor que o evento onchange entrega ao jogo. */
    if(node.tagName === 'OPTION' && !node.hasAttribute('value')) node.setAttribute('value', node.textContent);
    let saved = attributes.get(node);
    if(!saved){ saved = {}; attributes.set(node, saved); }
    for(const attr of ATTRS){
      if(!node.hasAttribute(attr)) continue;
      const current = node.getAttribute(attr), old = saved[attr];
      const source = old && old.rendered === current ? old.source : current;
      const result = text(source); saved[attr] = { source, rendered:result };
      if(current !== result) node.setAttribute(attr, result);
    }
    for(const child of Array.from(node.childNodes || [])) translateNode(child);
  }
  function observe(){
    if(observer) observer.observe(doc.body, { subtree:true, childList:true, characterData:true, attributes:true, attributeFilter:ATTRS });
  }
  function apply(root){
    if(!doc || !doc.body) return;
    if(observer) observer.disconnect();
    refreshNames(); translateNode(root || doc.body); observe();
  }
  function setLanguage(lang){
    if(!supported(lang)) return false;
    language = lang;
    try{ global.localStorage.setItem(KEY, lang); }catch(e){}
    if(doc){
      doc.documentElement.lang = lang === 'pt' ? 'pt-BR' : locales[lang].htmlLang;
      doc.title = lang === 'pt' ? 'Volante de Ouro · Construa sua carreira no automobilismo' : locales[lang].title;
      const picker = doc.getElementById('languageSelect'); if(picker) picker.value = lang;
      apply();
    }
    if(typeof global.dispatchEvent === 'function' && typeof global.CustomEvent === 'function')
      global.dispatchEvent(new global.CustomEvent('vdo:languagechange', { detail:{ language:lang } }));
    return true;
  }
  function init(){
    if(started || !doc || !doc.body) return;
    started = true;
    const picker = doc.getElementById('languageSelect');
    if(picker) picker.addEventListener('change', () => setLanguage(picker.value));
    if(typeof global.MutationObserver === 'function') observer = new global.MutationObserver(records => {
      observer.disconnect(); refreshNames();
      const dirty = new Set();
      for(const record of records){
        if(record.type === 'childList') for(const node of record.addedNodes) dirty.add(node);
        else dirty.add(record.target);
      }
      for(const node of dirty){
        let parent = node.parentNode, nested = false;
        while(parent){ if(dirty.has(parent)){ nested = true; break; } parent = parent.parentNode; }
        if(!nested && node.isConnected !== false) translateNode(node);
      }
      observe();
    });
    setLanguage(language);
  }
  global.VDO_I18N = { text, setLanguage, apply, init, get language(){ return language; },
    search(value){ return normal(value).normalize('NFKC').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase(); } };
  if(doc){ if(doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init); else init(); }
})(window);
