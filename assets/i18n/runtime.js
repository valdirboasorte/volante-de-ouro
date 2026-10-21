/* Tradução da apresentação. O motor e os saves conservam os valores originais.
   Os catálogos são locais: inclusive ao abrir index.html sem servidor. */
(function(global){
  'use strict';
  const doc = global.document, KEY = 'vdo_language';
  const locales = global.VDO_LOCALES || {}, compiled = new Map();
  const originals = new WeakMap(), attributes = new WeakMap();
  const ATTRS = ['title', 'aria-label', 'placeholder', 'alt', 'label'];
  const SKIP = 'script,style,noscript,textarea,code,pre,[data-i18n-ignore]';
  const IDENTITY = /^(eu|nome|piloto|rival|eq|equipe|team|jornalista)$/;
  const PARTICLES = new Set(['a','o','de','da','do','das','dos','e','di','del','della','la','le','van','von','der','den','the','of']);
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
      if([...new Set(keys)].sort().join('|') !== [...new Set(dstKeys)].sort().join('|')) continue;
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
    if(lang === 'pt') return s;
    const amount = (number, unit, currency) => {
      if(lang === 'ja'){
        const value = Number(number.replace(',', '.')) * (unit === 'mi' ? 1e6 : 1e3);
        const magnitude = value >= 1e8 ? 1e8 : value >= 1e4 ? 1e4 : 1;
        return currency + new Intl.NumberFormat('ja-JP', { maximumFractionDigits:4 }).format(value / magnitude)
          + (magnitude === 1e8 ? '億' : magnitude === 1e4 ? '万' : '');
      }
      return lang === 'en' ? (currency ? currency + ' ' : '') + number.replace(',', '.') + (unit === 'mi' ? 'm' : 'k')
        : (currency ? currency + ' ' : '') + number + (unit === 'mi' ? ' M' : ' mil');
    };
    s = s.replace(/€\s*(\d+(?:,\d+)?)\s*(mi|mil)\b/g, (_, number, unit) => amount(number, unit, '€'));
    /* A moeda e o valor podem estar em nós diferentes (por exemplo, um <b>). */
    s = s.replace(/\b(\d+(?:,\d+)?)\s*(mi|mil)\b/g, (_, number, unit) => amount(number, unit, ''));
    if(/^V\d+$/.test(s)) s = lang === 'en' ? s.replace('V','L') : lang === 'ja' ? s.slice(1) + '周目' : s;
    if(lang === 'en') s = s.replace(/\b(\d+)º(?=$|[^\p{L}\p{N}])/gu, (_, a) => {
      const n = Number(a), mod = n % 100;
      return n + (mod >= 11 && mod <= 13 ? 'th' : ({1:'st',2:'nd',3:'rd'}[n % 10] || 'th'));
    });
    if(lang === 'ja') s = s.replace(/(\d+)º/g, '$1位');
    return s;
  }

  function core(source, lang, depth, missing){
    if(lang === 'pt' || !locales[lang] || !source || names.has(source)) return source;
    if(/^[\d\s.,%+−–×ºª/€:()-]+$/.test(source) || /^[PV]\d+$/.test(source)
      || /^(?:\d+\s*[×x]\s*)?(?:−|-)?€?\s*[\d.,]+\s*(?:mi|mil)$/.test(source)) return source;
    if(depth > 12){ if(missing && /\p{L}/u.test(source)) missing.add(source); return source; }
    const data = catalog(lang);
    if(data.exact.has(source)) return data.exact.get(source);
    if(source === source.toLocaleUpperCase('pt-BR') && /[A-ZÁ-Ú]/.test(source)){
      const target = data.folded.get(source.toLocaleLowerCase('pt-BR'));
      if(target) return target.toLocaleUpperCase(lang);
    }
    const folded = data.folded.get(source.toLocaleLowerCase('pt-BR'));
    if(folded) return /^[A-ZÁ-Ú]/u.test(source)
      ? folded.charAt(0).toLocaleUpperCase(lang) + folded.slice(1) : folded;
    /* O travessão de uma fala não faz parte da mensagem. Tente o conteúdo
       completo, inclusive sua pontuação, antes de separar as frases. */
    const dialogue = source.match(/^([—•“«"']\s*)(.+)$/u);
    if(dialogue){
      const trial = new Set(), translated = core(dialogue[2], lang, depth + 1, trial);
      if(translated !== dialogue[2] || !trial.size){
        if(missing) for(const value of trial) missing.add(value);
        return dialogue[1] + translated;
      }
    }
    for(const p of data.templates){
      if(p.prefix && !source.startsWith(p.prefix)) continue;
      if(source.length > 2400) continue;
      const match = p.rx.exec(source); if(!match) continue;
      /* Um rótulo amplo, como "Carro{0}", não tem prioridade sobre uma
         sentença completa conhecida dentro do mesmo parágrafo. */
      if(p.weight < 25 && data.phraseRx && source.search(data.phraseRx) !== -1) continue;
      /* Uma captura não pode engolir os campos seguintes de uma ficha.
         Cada campo mantém sua ordem, mesmo quando a tradução é idêntica
         ao português (como alguns rótulos em espanhol). */
      if(match.slice(1).some(value => [' · ', ' → ', ' — '].some(separator => value.includes(separator))
        && !names.has(normal(value)))) continue;
      if(match.slice(1).some((value, i) => /^(eu|nome|piloto|rival|eq|equipe|team|jornalista)$/.test(p.keys[i])
        && /[:;!?](?:\s|$)/u.test(value) && !names.has(normal(value)))) continue;
      /* As capturas de identidade não são trechos de narrativa. Um nome
         escolhido pelo jogador pode ter qualquer formato; os demais não
         podem consumir expressões como "O asfalto passa dos 55 graus". */
      if(match.slice(1).some((value, i) => IDENTITY.test(p.keys[i]) && !names.has(normal(value))
        && normal(value).split(' ').some(word => word && !PARTICLES.has(word)
          && /^[a-zà-ÿ]/u.test(word) && !/[A-ZÀ-Þ]/u.test(word)))) continue;
      /* Uma captura livre não deve consumir a próxima frase inteira.
         Nomes com iniciais e campos de identidade são preservados. */
      if(match.slice(1).some((value, i) => /[.!?]\s+(?=[A-ZÁ-Ú“—])/u.test(value)
        && !/^(eu|nome|piloto|rival|eq|equipe|team|jornalista|fala|txt|texto|mensagem)$/.test(p.keys[i]) && !names.has(normal(value)))) continue;
      /* "para" também é preposição. Uma frase de contrato não é uma
         parada na pista; o motivo da parada começa com "com" ou "sem". */
      if(p.source === '{piloto} para {motivo}.' && !/^(?:com|sem) /u.test(match[2])) continue;
      if(p.numeric && match.slice(1).some(v => !/^[\d\s.,%+−–×ºª/€:()-]+$/.test(v.replace(/(\d)\s*(?:mil|mi)\b/g, '$1'))) &&
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
        if(/^(eu|nome|piloto|rival|eq|equipe|team|jornalista)$/.test(key)
          && !(global.VDO_LANGUAGE_TEAM_LABELS && global.VDO_LANGUAGE_TEAM_LABELS.has(normal(value)) && !names.has(normal(value)))) return value;
        if(lang === 'ja') return core(normal(value), lang, depth + 1, missing);
        return value.match(/^\s*/)[0] + core(normal(value), lang, depth + 1, missing) + value.match(/\s*$/)[0];
      });
    }
    /* Textos do motor podem juntar dois parágrafos conhecidos no mesmo nó.
       Substitua somente frases completas do catálogo, nunca palavras soltas. */
    if(data.phraseRx){
      const matches = [...source.matchAll(data.phraseRx)];
      if(matches.length){
        const gap = s => !normal(s) ? s : s.match(/^\s*/)[0]
          + core(normal(s), lang, depth + 1, missing) + s.match(/\s*$/)[0];
        let joined = '', end = 0;
        for(const match of matches){
          joined += gap(source.slice(end, match.index)) + data.exact.get(match[0]);
          end = match.index + match[0].length;
        }
        return joined + gap(source.slice(end));
      }
    }
    /* Preserve primeiro as mensagens completas do catálogo. Só depois
       separe um parágrafo que combine frases de origens diferentes. */
    if(depth < 6 && /[.!?] /.test(source)){
      const parts = source.split(/(?<=[.!?])\s+(?=[A-ZÁ-Ú“—])/u);
      if(parts.length > 1) return parts.map(s => core(s, lang, depth + 1, missing)).join(' ');
    }
    /* Frases compostas por rótulos independentes, como a ficha do piloto. */
    for(const separator of [' · ', ' — ', ' → ', '\n']){
      if(!source.includes(separator)) continue;
      return source.split(separator).map(s => core(s.trim(), lang, depth + 1, missing)).join(separator);
    }
    /* O nome oficial de um campeonato pode estar em inglês, seguido de um
       país em português: "F4 Japanese Championship (Japão)". */
    const parenthetical = source.match(/^(.*?)(\s*)\(([^()]*)\)([.!?]?)$/u);
    if(parenthetical){
      return core(normal(parenthetical[1]), lang, depth + 1, missing) + parenthetical[2]
        + '(' + core(normal(parenthetical[3]), lang, depth + 1, missing) + ')' + parenthetical[4];
    }
    const numbered = source.match(/^(\d+(?:º|ª)?[.):]\s+)(.+)$/u);
    if(numbered) return numbered[1] + core(numbered[2], lang, depth + 1, missing);
    const colon = source.indexOf(': ');
    if(colon > 0 && data.exact.has(source.slice(0, colon)))
      return data.exact.get(source.slice(0, colon)) + ': ' + core(source.slice(colon + 2), lang, depth + 1, missing);
    const count = source.match(/^(.+?)\s+(\d+(?:\/\d+)?|\d+\s+ano\(s\))$/u);
    if(count && data.exact.has(count[1])) return data.exact.get(count[1]) + ' ' + count[2].replace('ano(s)', lang === 'en' ? 'year(s)' : lang === 'ja' ? '年' : 'año(s)');
    /* Texto de botão/rótulo com seta, dois-pontos, aspas ou pontuação. */
    const edge = source.match(/^([←→—·•“”«»"'\s]*)(.*?)([←→—·•“”«»"':.!?\s]*)$/u);
    if(edge && edge[2] && edge[2] !== source){
      const trial = new Set();
      const translated = core(edge[2], lang, depth + 1, trial);
      if(translated !== edge[2] || !trial.size){
        if(missing) for(const value of trial) missing.add(value);
        return edge[1] + translated + edge[3];
      }
    }
    if(missing && /\p{L}/u.test(source)) missing.add(source);
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
  function translateAttribute(node, attr){
    if(!node.hasAttribute(attr)) return;
    let saved = attributes.get(node);
    if(!saved){ saved = {}; attributes.set(node, saved); }
    const current = node.getAttribute(attr), old = saved[attr];
    const source = old && old.rendered === current ? old.source : current;
    const result = text(source); saved[attr] = { source, rendered:result };
    if(current !== result) node.setAttribute(attr, result);
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
    for(const attr of ATTRS) translateAttribute(node, attr);
    for(const child of Array.from(node.childNodes || [])) translateNode(child);
  }
  function observe(){
    if(observer) observer.observe(doc.body, { subtree:true, childList:true, characterData:true, attributes:true, attributeFilter:ATTRS });
  }
  function apply(root){
    if(!doc || !doc.body) return;
    if(observer) observer.disconnect();
    refreshNames(); translateNode(root || doc.body);
    if(!root && doc.querySelectorAll){
      for(const meta of doc.querySelectorAll('meta[name="description"],meta[property="og:title"],meta[property="og:description"],meta[name="twitter:title"],meta[name="twitter:description"],meta[property="og:image:alt"],meta[name="twitter:image:alt"]'))
        translateAttribute(meta, 'content');
      const locale = doc.querySelector('meta[property="og:locale"]');
      if(locale) locale.setAttribute('content', { pt:'pt_BR', en:'en_US', es:'es_ES', ja:'ja_JP' }[language]);
    }
    observe();
  }
  function setLanguage(lang){
    if(!supported(lang)) return false;
    language = lang;
    try{ global.localStorage.setItem(KEY, lang); }catch(e){}
    if(doc){
      doc.documentElement.lang = lang === 'pt' ? 'pt-BR' : locales[lang].htmlLang;
      doc.title = lang === 'pt' ? 'Volante de Ouro — Simulador de Carreira no Automobilismo' : locales[lang].title;
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
    audit(value, lang){
      lang = lang || language; refreshNames();
      const missing = new Set(), source = normal(value == null ? '' : value);
      return { text:formats(core(source, lang, 0, missing), lang), missing:[...missing] };
    },
    search(value){ return normal(value).normalize('NFKC').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase(); } };
  if(doc){ if(doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init); else init(); }
})(window);
