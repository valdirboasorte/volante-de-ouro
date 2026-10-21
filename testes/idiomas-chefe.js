/* Regressões do modo chefe: estados que não aparecem no fluxo feliz,
   inclusive os nós e atributos das sessões ao vivo. Não modifica saves. */
'use strict';
const assert = require('assert/strict'), H = require('./base');
const languages = ['en', 'es', 'ja'];
const sources = new Set();
const normalize = s => String(s).replace(/\s+/g, ' ').trim();
const decode = s => s.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (_, e) => e[0] === '#'
  ? String.fromCodePoint(parseInt(e.slice(/^#x/i.test(e) ? 2 : 1), /^#x/i.test(e) ? 16 : 10))
  : ({ amp:'&', lt:'<', gt:'>', quot:'"', apos:"'", nbsp:' ' }[e.toLowerCase()]));
function record(value){
  const s = normalize(decode(String(value)));
  if(/\p{L}/u.test(s)) sources.add(s);
}
function html(value){
  const clean = String(value).replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<([a-z]+)[^>]*data-i18n-ignore[^>]*>[^<]*<\/\1>/gi, '');
  for(const m of clean.matchAll(/<(?:[^>"']|"[^"]*"|'[^']*')*>|[^<]+/g)){
    if(m[0][0] !== '<') record(m[0]);
    else for(const attr of m[0].matchAll(/\b(?:title|aria-label|placeholder|alt|label)\s*=\s*(["'])(.*?)\1/g)) record(attr[2]);
  }
}
const J = H.carregar({ silencioso:true, seed:4242, onWrite:w => w.property === 'innerHTML' ? html(w.value) : record(w.value) });
const run = code => J.run(code);
run(require('./chefe-comum'));
run(`globalThis.cancelAnimationFrame = () => {};
  Chefe.novo({ modo:'assumir', sk:'f1', ano:2024, idx:0, chefe:{ nome:'T', cc:'BR' }, realismo:true });
  UI.limparFila(); UI.close(); UI.show('chefe');
  UIC.PAGS.forEach(([k]) => UIC.pagina(k));
  C.divida = { restam:3, parcela:30000 }; UIC.pagina('financas');
  __inverno(); Chefe.comecarTemporada(); UI.limparFila(); UI.close();
  Chefe.qualiDaEtapa(C.temporada); UIC.pagina('visao');`);

/* A sessão mostra os estados reais, antes e depois de uma tentativa.
   O teste também captura títulos e descrições acessíveis da tela. */
for(const tipo of ['quali', 'treino']){
  run(`Sessao.S = Sessao.criar('${tipo}'); Sessao.sel = Sessao.S.carros.findIndex(c => c.ctrl);
    Sessao.montar();
    Sessao.S.carros.filter(c => c.ctrl).forEach(c => { c.saidas = 1; }); Sessao.muro(true);
    ['saida', 'rapida', 'entrada'].forEach(fase => {
      Sessao.S.carros.filter(c => c.ctrl).forEach(c => { c.estado = 'pista'; c.fase = fase; });
      Sessao.painel(); Sessao.muro(true);
    });
    Sessao.S.carros.filter(c => c.ctrl).forEach(c => { c.estado = 'box'; });
    Sessao.muro(true); document.getElementById('ssFimBox')._feito = false; Sessao.encerrada();`);
}

const api = J.ctx.VDO_I18N;
let checks = 0;
/* Asserções exatas evitam que um filtro de palavras deixe passar mensagens
   curtas em português, como acontecia com "sem tempo" e as parcelas. */
const fixtures = [
  ['Continuar a classificação', 'Continue qualifying', 'Continuar la clasificación', '予選を続ける'],
  ['O calendário aparece quando a temporada começar.', 'The calendar will appear when the season starts.', 'El calendario aparecerá cuando empiece la temporada.', 'シーズンが始まるとカレンダーが表示されます。'],
  ['Você deve 3 parcela(s) de € 30 mil.', 'You owe 3 instalment(s) of € 30k.', 'Debes 3 cuota(s) de € 30 mil.', '€3万の返済が残り3回あります。'],
  ['Verstappen: sem tempo', 'Verstappen: no time', 'Verstappen: sin tiempo', 'Verstappen：タイムなし'],
  ['licença MIT', 'MIT license', 'licencia MIT', 'MITライセンス'],
  ['0 paradas', '0 stops', '0 paradas', '0ストップ'],
  ['1 parada', '1 stop', '1 parada', '1ストップ'],
  ['2 paradas', '2 stops', '2 paradas', '2ストップ'],
  ['meta 4º', 'target 4th', 'objetivo 4º', '目標4位'],
  ['previsto € 26 mi', 'projected € 26m', 'previsto € 26 M', '予測€2,600万'],
  ['2024 encerrada', '2024 finished', '2024 finalizada', '2024年終了']
];
for(const [source, ...targets] of fixtures){
  for(const [i, lang] of languages.entries()){
    assert.equal(api.text(source, lang), targets[i], `${lang}: ${source}`); checks++;
  }
}
/* Confirma que as regressões são exercitadas pela interface, não apenas
   por chamadas artificiais ao tradutor. */
for(const required of ['Continuar a classificação →', 'Você deve 3 parcela(s) de € 30 mil.', 'Nos boxes', 'Volta de saída', 'Volta rápida', 'Volta de entrada']){
  assert.ok(sources.has(required), `a interface deve renderizar: ${required}`); checks++;
}
assert.ok([...sources].some(s => /: sem tempo$/.test(s)), 'o encerramento sem volta precisa ser exercitado'); checks++;
assert.ok([...sources].some(s => /licença MIT/.test(s)), 'o crédito do traçado precisa ser exercitado'); checks++;
const knownNames = Array.from(run('VDO_LANGUAGE_NAMES()')).sort((a, b) => b.length - a.length);
const residual = /\b(?:você|vocês|não|também|equipe|temporada|corrida|pneu|piloto|saídas|classificação|garagem|licença|parcela|continuar|calendário)\b/iu;
const residualSpanish = /\b(?:você|vocês|não|também|equipe|pneu|saídas|classificação|garagem|licença|parcela|calendário)\b/iu;
for(const source of sources){
  for(const lang of languages){
    let translated = api.audit(source, lang).text;
    for(const name of knownNames) translated = translated.split(name).join('');
    /* Algumas palavras são iguais em português e espanhol. */
    assert.ok(!(lang === 'es' ? residualSpanish : residual).test(translated), `${lang}: ${source} => ${translated}`); checks++;
  }
}
const before = run('JSON.stringify(C)');
for(const lang of [...languages, 'pt']){
  api.setLanguage(lang);
  assert.equal(run('JSON.stringify(C)'), before, 'trocar idioma não altera a partida'); checks++;
}
console.log(`${checks} verificações: modo chefe e sessões traduzidos nos três idiomas`);
