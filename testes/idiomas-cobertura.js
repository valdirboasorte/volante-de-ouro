/* Mensagens realmente renderizadas e regressões de tradução parcial.
   Uso: node testes/idiomas-cobertura.js. Não modifica arquivos nem saves. */
'use strict';
const assert=require('assert/strict'),H=require('./base');
const languages=['en','es','ja'];
let checks=0,rendered=0,J,scenario='',failures=[];
const seen=new Set(),knownNames=new Set(['Equipe Nationale Belge']);
const ptEnglish=/\b(?:você|vocês|não|também|sua|seu|equipe|rodada|campeão|campeã|temporada|corrida|pneu|piloto|pódios|vitórias|patrocínio|orçamentário|câmbio|largada|engenheiro|bandeirada|faltam|dinheiro|finanças|escolha|fechar|avançar)\b/iu;
const ptOther=/\b(?:você|vocês|não|também|sua|seu|equipe|rodada|campeão|campeã|pódios|vitórias|patrocínio|orçamentário|câmbio|engenheiro|bandeirada|finanças|escolha|fechar|avançar)\b/iu;
const normalize=s=>s.replace(/\s+/g,' ').trim();
function decode(s){return s.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp|ndash|mdash|hellip);/gi,(_,e)=>e[0]==='#'?String.fromCodePoint(parseInt(e.slice(/^#x/i.test(e)?2:1),/^#x/i.test(e)?16:10)):({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' ',ndash:'–',mdash:'—',hellip:'…'}[e.toLowerCase()]));}
function inspect(raw){
  const source=normalize(decode(String(raw)));
  if(!J||!/[\p{L}]/u.test(source)||seen.has(source))return;
  seen.add(source);rendered++;
  const names=J.run('Array.from(VDO_LANGUAGE_NAMES())');
  for(const name of names)knownNames.add(name);
  for(const lang of languages){
    let out=J.ctx.VDO_I18N.audit(source,lang).text;
    for(const name of [...knownNames].sort((a,b)=>b.length-a.length))out=out.split(name).join('');
    checks++;
    if((lang==='en'?ptEnglish:ptOther).test(out))failures.push({scenario,source,lang,output:out});
  }
}
function renderedHTML(raw){
  const clean=String(raw).replace(/<!--[\s\S]*?-->/g,'').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,'');
  for(const match of clean.matchAll(/<(?:[^>"']|"[^"]*"|'[^']*')*>|[^<]+/g)){
    if(match[0][0]!=='<')inspect(match[0]);
    else for(const attr of match[0].matchAll(/\b(?:title|aria-label|placeholder|alt|label)\s*=\s*(["'])(.*?)\1/g))inspect(attr[2]);
  }
}
function load(){
  J=null;
  const loaded=H.carregar({silencioso:true,onWrite:write=>write.property==='innerHTML'?renderedHTML(write.value):inspect(write.value)});
  J=loaded;
  let seed=78231;const math=Object.create(Math);math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};J.ctx.Math=math;
  return J;
}
function run(label,code){scenario=label;J.run('UI.limparFila(); UI.close();');J.run(code);}
load();
for(const code of ['UI.help()','UI.seriesInfo()','UI.campeonatos()','UI.hall()','UI.records()','UI.scenarios()','Abertura.creditos()'])run('opening:'+code,code);
for(const series of ['f1','indy','wec','stock','nascar','dtm','fe'])for(const gender of ['m','f']){
  scenario='driver:'+series+':'+gender;J.run(`UI.genero='${gender}';`);
  H.novaCarreira(J,{era:7,ano:2024,idade:gender==='m'?8:24,cc:'JP',nome:'佐藤',serie:series,rapido:false});
  for(const code of ['UI.render()','UI.financas()','UI.pessoas()','UI.empresarios()','UI.prepModal()','UI.archive()'])run(scenario+':'+code,code);
  run('driver:race:'+series, 'UI.raceResult(Engine.runRace(S.season));');
  run('driver:season:'+series,'Game.simSeason(); UI.limparFila(); UI.close(); Game.endSeason();');
}
scenario='driver:all-weekend-events';
for(const text of J.run('Engine.EVENTOS_FDS.flatMap(e=>[e.t,e.d(S.season),...e.o(S.season).flatMap(o=>[o.n,o.d])])'))inspect(text);
for(const year of [1950,1988,2024])for(const mode of ['assumir','criar','base']){
  run('chief:'+year+':'+mode,`Chefe.novo({modo:'${mode}',ano:${year},idx:0,chefe:{nome:'鈴木',cc:'JP'},eq:{nome:'Sakura Racing',cor:'#123456',cc:'JP'}});`);
  for(const code of ['UIC.boasVindas()','UIC.render()','UIC.abaEquipe()','UIC.abaFinancas()','UIC.abaNoticias()','UIC.mercado()','UIC.fichaMercado(0)','UIC.motores()','UIC.desenv()','UIC.engenharia()','UIC.instalacoes()','UIC.patrocinio()','UIC.academia()','UIC.investidores()','UIC.banco()'])run('chief:'+year+':'+mode+':'+code,code);
  for(const text of J.run(`Chefe.FDS.flatMap(e=>[e.t('Senna'),e.d(),...e.o({ano:${year}}).flatMap(o=>[o.n,o.d,e.t('Senna')+': '+o.n.toLowerCase()+'.'])])`))inspect(text);
  const before=J.run('JSON.stringify(C)');
  for(const lang of languages){J.ctx.VDO_I18N.setLanguage(lang);assert.equal(J.run('JSON.stringify(C)'),before,'trocar idioma mantém a equipe intacta');checks++;}
}
/* Estes eventos vêm dos mesmos geradores usados no acompanhamento ao vivo. */
J.run("Central.P={carros:[{nome:'Senna'},{nome:'Prost'}]}; AoVivo.R={carros:[{c:{nome:'Senna'}},{c:{nome:'Prost'}}]};");
for(const kind of ['ultrapassagem','retardatario','boxes','batida','quebra','sc','verde','bandeira'])inspect(J.run(`Central.texto({tipo:'${kind}',a:0,b:1})`));
for(const kind of ['ultrapassagem','boxes','lenta','batida','quebra','sc','vsc','verde','bandeira','erro','toque','furo','punicao','chuva','parou','falha','radio','ordem','ordemEq','auto','sugestao'])inspect(J.run(`AoVivo.texto({tipo:'${kind}',a:0,b:1,c:'S',seg:5,motivo:'detrito',furo:1,txt:'Poupar o motor até o fim',por:'pneu'})`));
for(const cause of ['plano','pneu','furo','comb','chuva','seco','regra','sc','undercut','cobrir'])for(const compound of ['S','M','H','I','W'])inspect(J.run(`AoVivo.fraseBox('${cause}','${compound}')`));
/* Saídas independentes do catálogo: pontuação, composição e unidades. */
const api=J.ctx.VDO_I18N;
for(const [source,en,es,ja]of [
  ['— Você está inteiro?','— Are you all right?','— ¿Estás bien?','— けがはないか？'],
  ['Pré-temporada de 2024 · motor Honda','2024 pre-season · Honda engine','Pretemporada de 2024 · motor Honda','2024年プレシーズン · Hondaエンジン'],
  ['F4 Japanese Championship (Japão)','F4 Japanese Championship (Japan)','F4 Japanese Championship (Japón)','F4 Japanese Championship (日本)'],
  ['Petróleo · até 2025','Oil · until 2025','Petróleo · hasta 2025','石油 ·〜2025'],
  ['46 mi','46m','46 M','4,600万'],
  ['rodada 12','round 12','ronda 12','第12戦'],
  ['V12','L12','V12','12周目'],
  ['Os comissários chamaram Pérez: aceitar a punição.','The stewards summoned Pérez: accept the penalty.','Los comisarios llamaron a Pérez: aceptar la sanción.','スチュワードがPérezを召喚：ペナルティを受け入れる。']
])for(const [i,lang]of languages.entries()){assert.equal(api.text(source,lang),[en,es,ja][i],source+' em '+lang);checks++;}
for(const lang of languages){
  api.setLanguage(lang);J.run("UIH.f={ano:2024,busca:'',regiao:'',pais:'',nivel:-1,tipo:'',situ:'ativos'};");
  const query=api.text('Japão',lang);J.run('UIH.f.busca='+JSON.stringify(query));
  assert.ok(J.run("UIH.filtrados().some(c=>c.p==='JP')"),'busca de campeonatos aceita país traduzido em '+lang);checks++;
}
if(failures.length){console.error(JSON.stringify(failures,null,2));throw Error(failures.length+' textos renderizados ainda contêm português');}
assert.ok(rendered>300,'cenários precisam exercitar textos de verdade');
console.log(checks+' verificações em '+rendered+' mensagens renderizadas: traduções completas nos cenários verificados');
