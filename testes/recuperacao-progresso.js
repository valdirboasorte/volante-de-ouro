/* Recuperação entre origins: dados locais, conflitos, consentimento e rollback.
   Uso: node testes/recuperacao-progresso.js (sem dependências externas). */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const html=fs.readFileSync(path.join(__dirname,'..','recuperar-progresso','index.html'),'utf8');
const core=html.match(/<script id="recovery-core">([\s\S]*?)<\/script>/)[1];
const ui=html.match(/<script id="recovery-ui">([\s\S]*?)<\/script>/)[1];
const context=vm.createContext({});vm.runInContext(core,context,{filename:'recovery-core.js'});
const R=context.VDO_RECOVERY;let checks=0;
function eq(actual,expected,note){checks++;const plain=value=>value===undefined?undefined:JSON.parse(JSON.stringify(value));assert.deepEqual(plain(actual),plain(expected),note);}
function ok(value,note){checks++;assert.ok(value,note);}
function error(fn,code,note){checks++;assert.throws(fn,e=>e.code===code,note);}
function storage(initial={},options={}){
  const values={...initial},calls=[];let sets=0;
  return {values,calls,getItem(key){if(options.readBlocked)throw Error('blocked');return Object.hasOwn(values,key)?values[key]:null;},
    setItem(key,value){calls.push(['set',key]);sets++;if(options.writeBlocked)throw Error('blocked');if(options.failSet===sets){if(options.afterWrite)values[key]=String(value);throw Error('quota');}values[key]=String(value);},
    removeItem(key){calls.push(['remove',key]);if(options.removeBlocked)throw Error('blocked');delete values[key];}};
}
const pilot=' {"year":2026,"driver":{"name":"山田 太郎 🏁 <b>José</b>","cc":"JP"},"season":{"year":2026,"cat":"Kart Regional"},"history":[],"archive":[]} \n';
const chief='{"ano":2005,"chefe":{"nome":"María 鈴木"},"eq":{"nome":"Équipe 日本"},"cat":"Fórmula 1"}';
const saves=JSON.stringify({v:1,ativo:{piloto:null,chefe:'s1'},lista:[{id:'s1',modo:'chefe',nome:'Équipe 日本',dado:null},{id:'s2',modo:'piloto',nome:'山田',data:1,dado:pilot}]});
const values={vdo_save:pilot,vdo_chefe:chief,vdo_saves:saves,vdo_hall:' [{"name":"Álvaro 山本","from":1950,"to":1972}] ',vdo_chefe_hall:'[{"nome":"代表","eq":"競技","de":2000,"ate":2025}]',vdo_language:'ja',vdo_theme:'light',vdo_mov:'0',vdo_durcorrida:'30',vdo_velcorrida:'16'};
function raw(withValues=values,changes={}){return JSON.stringify({format:'volante-de-ouro-progress',version:1,sourceOrigin:R.OLD,createdAt:'2026-10-19T12:30:00.000Z',values:withValues,...changes});}

ok(html.includes('<meta name="vdo-progress-recovery" content="1">'),'marcador HTTP distingue a recuperação do fallback SPA');
ok(!/<script[^>]+src=|<link[^>]+(?:stylesheet|href=)|<iframe|\bfetch\s*\(|XMLHttpRequest|sendBeacon|document\.cookie|innerHTML\s*=/.test(html),'página independente não carrega recursos, envia dados nem injeta HTML');
eq(Array.from(R.KEYS),Object.keys(values),'allowlist é exatamente as dez chaves do jogo');
/* os jogos guardados entram no backup, e um save quebrado dentro deles é recusado */
error(()=>R.parse(raw({...values,vdo_saves:JSON.stringify({lista:[{id:'x',modo:'piloto',dado:'{"driver":{}}'}]})})),'invalid','save guardado inválido é recusado');
error(()=>R.parse(raw({...values,vdo_saves:JSON.stringify({lista:[{id:'x',modo:'outro',dado:null}]})})),'invalid','modo desconhecido é recusado');
eq(R.details('vdo_saves',saves),{key:'vdo_saves',count:1,names:['山田']},'resumo conta os jogos guardados');
for(const origin of [R.OLD,R.VERCEL,R.OFFICIAL])ok(R.allowed(origin),'origin HTTPS autorizado');
eq(R.VERCEL,'https://volante-de-ouro.vercel.app','Vercel autorizada pelo origin HTTPS exato');
for(const origin of ['null','file://','http://volantedeouro.com','https://www.volantedeouro.com','https://volantedeouro.com.evil.example','https://volante-de-ouro.pages.dev:444','https://preview.volante-de-ouro.pages.dev','http://volante-de-ouro.vercel.app','https://volante-de-ouro.vercel.app:444','https://preview.volante-de-ouro.vercel.app','https://volante-de-ouro.vercel.app.evil.example']){
  ok(!R.allowed(origin),'origin não autorizado recusado');error(()=>R.backup(storage(values),origin),'origin','não exporta fora dos origins exatos');
}
const source=storage({...values,unrelated:'secret',auth_token:'never export'}),sourceBefore={...source.values};
const exported=R.backup(source,R.OLD),parsed=R.parse(exported);
eq(parsed.values,values,'exporta valores originais byte a byte, incluindo Unicode e espaços');
eq(parsed.sourceOrigin,R.OLD,'registra origin de exportação');eq(parsed.version,1,'backup versionado');eq(source.values,sourceBefore,'exportação não modifica origem nem dados alheios');eq(source.calls,[],'exportação nunca escreve nem apaga');
const vercelSource=storage({...values,unrelated:'never export'}),vercelBefore={...vercelSource.values};
const vercelBackup=R.backup(vercelSource,R.VERCEL),vercelParsed=R.parse(vercelBackup);
eq(vercelParsed.sourceOrigin,R.VERCEL,'backup identifica sua origem Vercel');
eq(vercelParsed.values,values,'exportação Vercel cobre exatamente as nove chaves originais');
eq(vercelSource.values,vercelBefore,'exportação Vercel preserva todos os dados de origem');
eq(vercelSource.calls,[],'exportação Vercel não faz nenhuma escrita ou remoção');
const fromVercel=storage({vdo_save:currentPilotForVercel(),unrelated:'keep'});
const fromVercelBefore={...fromVercel.values},vercelResult=R.restore(vercelBackup,fromVercel,R.OFFICIAL);
eq(fromVercel.values.vdo_save,fromVercelBefore.vdo_save,'importação Vercel preserva carreira oficial conflitante');
eq(fromVercel.values,{...values,...fromVercelBefore},'importação Vercel preenche ausentes e preserva dados oficiais e alheios');
eq(vercelResult.skipped,['vdo_save'],'conflito vindo da Vercel é informado');
function currentPilotForVercel(){return JSON.stringify({year:2026,driver:{name:'Carreira oficial preservada'},season:{year:2026,cat:'Fórmula 1'}});}
const destination=storage({unrelated:'keep'}),result=R.restore(exported,destination,R.OFFICIAL);
eq(result.written,R.KEYS,'restaura piloto, chefe, históricos e preferências');eq(destination.values,{unrelated:'keep',...values},'restauração conserva exatamente as strings e dados alheios');
eq(R.restore(exported,destination,R.OFFICIAL).written,[],'segunda importação não regrava dados existentes');
for(const origin of [R.OLD,R.VERCEL,'null','http://volantedeouro.com']){
  const target=storage(values);error(()=>R.restore(exported,target,origin),'origin','importação só escreve no domínio oficial');eq(target.calls,[],'origin inválido não toca no armazenamento');
}
const vercelTarget=storage(values);error(()=>R.preview(vercelBackup,vercelTarget,R.VERCEL),'origin','Vercel também recusa prévia de importação');eq(vercelTarget.calls,[],'prévia recusada na Vercel não altera dados');
const preview=R.preview(exported,storage({vdo_save:'existing broken save'}),R.OFFICIAL);
eq(preview.entries[0].incoming.name,'山田 太郎 🏁 <b>José</b>','prévia mostra nome como texto');eq(preview.entries[0].incoming.year,2026,'prévia mostra ano');eq(preview.entries[1].incoming.team,'Équipe 日本','prévia mostra equipe');eq(preview.entries[2].incoming.count,1,'prévia mostra históricos');ok(preview.entries[0].conflict,'mesmo dado oficial inválido ou vazio é preservado por padrão');
const conflicts=storage({vdo_save:'',vdo_language:'en',vdo_hall:'[]',unrelated:'untouched'});
const mixed=R.restore(exported,conflicts,R.OFFICIAL);
eq(conflicts.values.vdo_save,'','string vazia existente também é conflito');eq(conflicts.values.vdo_language,'en','idioma oficial existente preservado');eq(conflicts.values.vdo_hall,'[]','histórico oficial preservado');eq(mixed.skipped,['vdo_save','vdo_hall','vdo_language'],'conflitos relatados');eq(conflicts.values.vdo_chefe,chief,'dados ausentes ainda são restaurados');

/* Uma substituição exige escolha explícita, confirmação e backup do estado atual. */
const currentPilot=JSON.stringify({year:2025,driver:{name:'Carreira oficial'},season:{year:2025,cat:'Fórmula 4'}});
const official=storage({vdo_save:currentPilot,vdo_language:'en',unrelated:'untouched'});
for(const consent of [{replace:true},{replace:true,confirmed:false},{replace:true,confirmed:true}])error(()=>R.restore(exported,official,R.OFFICIAL,consent),'consent','não substitui sem backup e consentimento');
eq(official.values.vdo_save,currentPilot,'ausência de consentimento preserva carreira oficial');
error(()=>R.restore(exported,official,R.OFFICIAL,{replace:true,confirmed:true,backup:exported}),'stale','backup do domínio antigo não autoriza substituir o oficial');
const safety=R.backup(official,R.OFFICIAL);
official.values.vdo_mov='1';error(()=>R.restore(exported,official,R.OFFICIAL,{replace:true,confirmed:true,backup:safety}),'stale','dados mudaram depois do backup: substituição recusada');
delete official.values.vdo_mov;
R.restore(exported,official,R.OFFICIAL,{replace:true,confirmed:true,backup:safety});eq(official.values,{...values,unrelated:'untouched'},'substituição expressamente autorizada restaura dados antigos e mantém chaves alheias');
eq(R.parse(safety).values.vdo_save,currentPilot,'arquivo de segurança conserva a carreira oficial anterior');
const partial=storage({vdo_save:currentPilot,vdo_chefe:chief});
R.restore(raw({vdo_language:'es'}),partial,R.OFFICIAL,{replace:true,confirmed:true,backup:R.backup(partial,R.OFFICIAL)});
eq(partial.values,{vdo_save:currentPilot,vdo_chefe:chief,vdo_language:'es'},'substituição não apaga chaves ausentes no backup de entrada');

/* Schema estrito e saves malformados jamais chegam à escrita. */
for(const bad of ['',null,'null','[]','{}','not json',raw(values,{version:2}),raw(values,{format:'other'}),raw(values,{sourceOrigin:'https://evil.example'}),raw(values,{createdAt:'yesterday'}),raw(values,{extra:'no'}),raw({...values,unexpected:'no'}),raw({...values,vdo_language:'jp'}),raw({...values,vdo_theme:'night'}),raw({...values,vdo_mov:'yes'}),raw({...values,vdo_durcorrida:'NaN'}),raw({...values,vdo_durcorrida:'0'}),raw({...values,vdo_velcorrida:'99'}),raw({...values,vdo_save:'{broken'}),raw({...values,vdo_save:'[]'}),raw({...values,vdo_save:'{"driver":{"name":"X"},"year":"2026"}'}),raw({...values,vdo_chefe:'{"ano":2026,"eq":{"nome":"x"}}'}),raw({...values,vdo_hall:'{}'}),raw({...values,vdo_chefe_hall:'[1]'}),raw({...values,vdo_save:{year:2026}})]){
  const target=storage();error(()=>R.restore(bad,target,R.OFFICIAL),'invalid','arquivo inválido recusado');eq(target.calls,[],'validação ocorre antes de qualquer escrita');
}
const protoTop=raw().replace('"format":','"__proto__":{},"format":');
const protoKey=raw().replace('"vdo_save":','"__proto__":"x","vdo_save":');
const protoSave=raw({...values,vdo_save:'{"driver":{"name":"X"},"year":2026,"history":[{"__proto__":{"polluted":true}}]}'});
for(const value of [protoTop,protoKey,protoSave])error(()=>R.parse(value),'invalid','__proto__ recusado inclusive em dados aninhados');eq({}.polluted,undefined,'nenhum protótipo foi alterado');
error(()=>R.parse(' '.repeat(R.MAX_BYTES+1)),'tooLarge','limite de caracteres');
error(()=>R.parse('日'.repeat(Math.ceil(R.MAX_BYTES/3)+1)),'tooLarge','limite usa bytes UTF-8 para japonês');
error(()=>R.backup(storage(values,{readBlocked:true}),R.OLD),'storage','armazenamento bloqueado durante exportação');
error(()=>R.restore(exported,storage({}, {readBlocked:true}),R.OFFICIAL),'storage','armazenamento bloqueado antes de importar');
const noWrite=storage({}, {writeBlocked:true});error(()=>R.restore(exported,noWrite,R.OFFICIAL),'write','armazenamento bloqueado na escrita');eq(noWrite.values,{},'falha de escrita não deixa importação parcial');
const blockedReplace=storage({vdo_save:currentPilot,vdo_chefe:chief,vdo_language:'en',unrelated:'keep'},{writeBlocked:true}),blockedBefore={...blockedReplace.values},blockedBackup=R.backup(blockedReplace,R.OFFICIAL);
error(()=>R.restore(exported,blockedReplace,R.OFFICIAL,{replace:true,confirmed:true,backup:blockedBackup}),'write','bloqueio persistente na substituição é informado');
eq(blockedReplace.values,blockedBefore,'bloqueio persistente preserva exatamente o progresso oficial intacto');
eq(blockedReplace.calls,[['set','vdo_save']],'rollback não remove nem regrava valores anteriores intactos');
const partialFirst=storage({vdo_save:currentPilot,vdo_chefe:chief,vdo_language:'en'},{failSet:1,afterWrite:true}),partialBefore={...partialFirst.values},partialBackup=R.backup(partialFirst,R.OFFICIAL);
error(()=>R.restore(exported,partialFirst,R.OFFICIAL,{replace:true,confirmed:true,backup:partialBackup}),'write','erro após gravar primeiro valor aciona restauração');
eq(partialFirst.values,partialBefore,'primeira escrita parcial recupera exatamente a carreira anterior');
eq(partialFirst.calls,[['set','vdo_save'],['set','vdo_save']],'rollback restaura direto sem excluir uma carreira existente');
for(const afterWrite of [false,true]){
  const target=storage({unrelated:'keep'},{failSet:3,afterWrite});error(()=>R.restore(exported,target,R.OFFICIAL),'write','quota ou erro depois da escrita desfaz importação');eq(target.values,{unrelated:'keep'},'rollback remove todas as novas chaves, inclusive a que lançou erro');
}
for(const afterWrite of [false,true]){
  const target=storage({vdo_save:currentPilot,vdo_chefe:chief,vdo_language:'en',unrelated:'keep'},{failSet:3,afterWrite}),before={...target.values},backup=R.backup(target,R.OFFICIAL);
  error(()=>R.restore(exported,target,R.OFFICIAL,{replace:true,confirmed:true,backup}),'write','quota na substituição faz rollback');eq(target.values,before,'rollback recupera exatamente carreira oficial e preferências anteriores');
}
const failedRollback=storage({}, {failSet:2,afterWrite:true,removeBlocked:true});error(()=>R.restore(exported,failedRollback,R.OFFICIAL),'rollback','falha de rollback é comunicada explicitamente');
const concurrent=storage({vdo_save:currentPilot,vdo_language:'en'},{failSet:2}),concurrentBackup=R.backup(concurrent,R.OFFICIAL),baseSet=concurrent.setItem.bind(concurrent);
concurrent.setItem=(key,value)=>{try{baseSet(key,value);}catch(e){concurrent.values.vdo_save='written by another tab';throw e;}};
error(()=>R.restore(exported,concurrent,R.OFFICIAL,{replace:true,confirmed:true,backup:concurrentBackup}),'rollback','escrita concorrente durante falha é informada');
eq(concurrent.values.vdo_save,'written by another tab','rollback não remove nem substitui valor concorrente diferente do importado');
ok(!concurrent.calls.some(call=>call[0]==='remove'&&call[1]==='vdo_save'),'rollback nunca apaga carreira gravada por outra aba');
const changed=storage();let reads=0;const realGet=changed.getItem.bind(changed);changed.getItem=key=>{if(++reads===10)changed.values.vdo_save='other tab';return realGet(key);};error(()=>R.restore(exported,changed,R.OFFICIAL),'stale','alteração concorrente é detectada e não passa despercebida');eq(changed.values.vdo_save,'other tab','não destrói escrita de outra aba');

/* A página trabalha com saves reais, que depois reabrem no motor existente. */
const H=require('./base'),game=H.carregar();H.novaCarreira(game,{era:7,ano:2020,idade:14,nome:'山田 太郎',cc:'JP'});game.run('Game.save()');
game.run("Chefe.novo({modo:'base',ano:2015,cat:'Fórmula 4 Britânica',chefe:{nome:'鈴木 花子',cc:'JP'},eq:{nome:'日本レーシング',cor:'#123456',cc:'JP'}}); UIC.salvar();");
const actual=storage({vdo_save:game.store.vdo_save,vdo_chefe:game.store.vdo_chefe}),received=storage();R.restore(R.backup(actual,R.OLD),received,R.OFFICIAL);
const reopened=H.carregar({store:received.values});reopened.run('Game.continueSave(); UIC.continuar();');eq(reopened.run('S.driver.name'),'山田 太郎','carreira de piloto real reabre após transferência');eq(reopened.run('C.chefe.nome'),'鈴木 花子','carreira de chefe real reabre após transferência');eq(received.values.vdo_save,actual.values.vdo_save,'motor recebe save de piloto sem modificar seu formato');
const vercelReceived=storage();R.restore(R.backup(actual,R.VERCEL),vercelReceived,R.OFFICIAL);
const vercelReopened=H.carregar({store:vercelReceived.values});vercelReopened.run('Game.continueSave(); UIC.continuar();');
eq(vercelReopened.run('S.driver.name'),'山田 太郎','piloto real vindo da Vercel reabre no motor');eq(vercelReopened.run('C.chefe.nome'),'鈴木 花子','chefe real vindo da Vercel reabre no motor');eq(vercelReceived.values.vdo_save,actual.values.vdo_save,'transferência Vercel preserva o formato do save real');

/* DOM mínimo verifica idiomas, modo por origin, segurança de texto e fluxo de consentimento. */
function page(origin,initial={}){
  const store=storage(initial),nodes={},events={},downloads=[];let currentBlob;
  class Element{
    constructor(id=''){this.id=id;this.dataset={};this.events={};this.children=[];this.textContent='';this.hidden=false;this.disabled=false;this.checked=false;this.value='';this.files=[];}
    addEventListener(type,fn){this.events[type]=fn;}setAttribute(key,value){this[key]=value;}appendChild(node){this.children.push(node);return node;}replaceChildren(){this.children=[];}remove(){}click(){if(this.download)downloads.push({name:this.download,blob:currentBlob});else if(this.events.click)return this.events.click();}set innerHTML(value){throw Error('unsafe HTML');}
  }
  for(const match of html.matchAll(/\bid="([^"]+)"/g))nodes[match[1]]=new Element(match[1]);
  const labels=[];for(const match of html.matchAll(/<[^>]+data-t="([^"]+)"[^>]*>/g)){const id=match[0].match(/\bid="([^"]+)"/),node=id?nodes[id[1]]:new Element();node.dataset.t=match[1];labels.push(node);}
  const document={documentElement:new Element(),body:new Element(),getElementById:id=>nodes[id],querySelectorAll:()=>labels,createElement:()=>new Element()};
  const sandbox={document,location:{origin},localStorage:store,Blob:class{constructor(parts,options){this.parts=parts;this.options=options;currentBlob=this;}},URL:{createObjectURL:()=> 'blob:local-backup',revokeObjectURL(){}},setTimeout(){},addEventListener(type,fn){events[type]=fn;}};
  sandbox.window=sandbox;vm.createContext(sandbox);vm.runInContext(core,sandbox);vm.runInContext(ui,sandbox);
  return {nodes,document,store,downloads,events,sandbox,labels};
}
for(const origin of [R.OLD,R.VERCEL])for(const [lang,title]of [['pt','Recuperar progresso'],['en','Recover progress'],['es','Recuperar progreso'],['ja','進行データの復元']]){
  const P=page(origin,{...values,vdo_language:lang});eq(P.document.title,'Volante de Ouro — '+title,'página traduzida conforme preferência');ok(P.nodes.importSection.hidden,'na origem alternativa a importação permanece oculta');ok(!P.nodes.allowed.hidden,'na origem alternativa a exportação está disponível');ok(P.nodes.modeNote.textContent.includes(origin),'aviso nos quatro idiomas identifica a origem real');P.nodes.export.click();eq(P.downloads.length,1,'backup baixado localmente');eq(P.store.calls,[],'página alternativa não escreve nem mesmo idioma');const downloaded=JSON.parse(P.downloads[0].blob.parts[0]);eq(downloaded.values.vdo_save,pilot,'download conserva raw save');eq(downloaded.sourceOrigin,origin,'download informa a origem correta');eq(Object.keys(downloaded.values),Array.from(R.KEYS),'download cobre as nove chaves');if(origin===R.VERCEL)ok(P.downloads[0].name.includes('-vercel-'),'nome do arquivo distingue o backup Vercel');
}
const unsupported=page('null',values);ok(unsupported.nodes.allowed.hidden,'file:// não permite ações de recuperação');ok(unsupported.nodes.modeNote.textContent.includes('HTTPS'),'endereço inválido explicado');
const P=page(R.OFFICIAL,{vdo_save:currentPilot,vdo_language:'en'});ok(!P.nodes.importSection.hidden,'oficial oferece importação');
P.nodes.file.files=[{size:Buffer.byteLength(exported),text:async()=>exported}];
(async()=>{
  const V=page(R.OFFICIAL,{vdo_save:currentPilot,vdo_language:'es'});V.nodes.file.files=[{size:Buffer.byteLength(vercelBackup),text:async()=>vercelBackup}];
  await V.nodes.file.events.change();ok(!V.nodes.preview.hidden,'arquivo Vercel exibe prévia no oficial');ok(V.nodes.source.textContent.includes(R.VERCEL),'prévia identifica origem Vercel');
  V.nodes.import.click();eq(V.store.values.vdo_save,currentPilot,'fluxo DOM preserva carreira oficial ao importar Vercel sem substituir');eq(V.store.values.vdo_chefe,chief,'fluxo DOM importa chefe ausente do backup Vercel');eq(V.store.values.vdo_language,'es','fluxo DOM preserva preferência oficial conflitante');eq(vercelSource.calls,[],'importação oficial nunca escreve na origem Vercel');
  await P.nodes.file.events.change();ok(!P.nodes.preview.hidden,'arquivo válido exibe prévia');ok(!P.nodes.import.disabled,'padrão permite importar ausentes');
  const rowText=P.nodes.rows.children.flatMap(row=>row.children.map(cell=>cell.textContent)).join(' ');ok(rowText.includes('山田 太郎 🏁 <b>José</b>'),'nome com marcação exibido literalmente');ok(rowText.includes('Carreira oficial'),'prévia inclui carreira oficial conflitante');
  P.nodes.replace.checked=true;P.nodes.replace.events.change();ok(P.nodes.import.disabled,'substituição começa bloqueada');ok(P.nodes.confirmed.disabled,'confirmação exige baixar backup atual');
  P.nodes.exportCurrent.click();eq(P.downloads.length,1,'backup oficial deve ser baixado antes de substituir');ok(!P.nodes.confirmed.disabled,'download habilita confirmação');ok(P.nodes.import.disabled,'download sozinho não confirma substituição');
  P.nodes.confirmed.checked=true;P.nodes.confirmed.events.change();ok(!P.nodes.import.disabled,'escolha, backup e confirmação habilitam importação');P.nodes.import.click();eq(P.store.values.vdo_save,pilot,'fluxo autorizado restaura antiga carreira');ok(P.nodes.status.textContent.includes('Import complete'),'sucesso apresentado');
  P.nodes.language.value='ja';P.nodes.language.events.change();eq(P.document.documentElement.lang,'ja','seletor oferece japonês JP');eq(P.nodes.import.textContent,'進行データを読み込む','botões acompanham idioma');
  P.nodes.file.files=[{size:R.MAX_BYTES+1,text:async()=>{throw Error('must not read');}}];await P.nodes.file.events.change();ok(P.nodes.preview.hidden,'arquivo grande não mantém prévia antiga');ok(P.nodes.status.className.includes('error'),'arquivo grande sinalizado');
  const models={};for(const lang of ['pt','en','es','ja']){P.nodes.language.value=lang;P.nodes.language.events.change();models[lang]=P.labels.map(n=>n.textContent);}
  for(const lang of ['en','es','ja'])ok(models[lang].every((text,i)=>!!text&&text!==P.labels[i].dataset.t),'todos os rótulos estáticos têm tradução');
  console.log(checks+' verificações de recuperação de progresso passaram');
})().catch(error=>{console.error(error);process.exitCode=1;});
