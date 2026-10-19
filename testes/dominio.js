/* Contrato da configuração Cloudflare e do acesso à recuperação.
   A confirmação do HTTP publicado é feita por ferramentas/verificar-dominio.js. */
'use strict';
const assert = require('assert/strict'), fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname,'..'), read = p => fs.readFileSync(path.join(root,p),'utf8');
const csv = read('infra/cloudflare/redirects.csv').trim().split(/\r?\n/);
assert.equal(csv.length,1,'uma única origem; sem cabeçalho CSV');
const columns = csv[0].split(',');
assert.deepEqual(columns,['volante-de-ouro.pages.dev/','https://volantedeouro.com/','301','TRUE','FALSE','TRUE','TRUE'],
  'status, query, subdomínios, subcaminhos e sufixos no formato documentado pela Cloudflare');
const rule = JSON.parse(read('infra/cloudflare/regra-redirecionamento.json'));
assert.equal(rule.enabled,false,'o arquivo é um rascunho até a recuperação ser publicada');
assert.equal(rule.action,'redirect');
assert.equal(rule.action_parameters.from_list.name,'vdo_dominio_antigo');
assert.equal(rule.action_parameters.from_list.key,'http.request.full_uri');
assert.ok(rule.expression.includes('http.host eq "volante-de-ouro.pages.dev"'));
assert.ok(rule.expression.includes('http.request.full_uri in $vdo_dominio_antigo'));
const recovery = new Set(['/recuperar-progresso','/recuperar-progresso/','/recuperar-progresso/index.html']);
const except = rule.expression.match(/not \(http\.request\.uri\.path in \{([^}]+)\}\)/);
assert.ok(except,'a recuperação precisa estar excluída da regra');
assert.deepEqual(new Set([...except[1].matchAll(/"([^"]+)"/g)].map(m=>m[1])),recovery);

/* Exemplos de aceitação para a regra publicada; não simulam uma ativação. */
const legacy = new URL('https://' + columns[0]), official = new URL(columns[1]);
function expected(url){
  const u = new URL(url);
  if(u.hostname !== legacy.hostname || recovery.has(u.pathname)) return null;
  u.protocol=official.protocol; u.host=official.host; return u.href;
}
for(const p of ['/','/carreira','/login','/a/b/','/assets/flags/jp.svg','/recuperar-progresso-outra',
  '/login?next=%2Fcarreira%3Fano%3D2024','/carreira?tag=1&tag=2&ref=a%2Bb&espaco=a+b',
  '/%E6%97%A5%E6%9C%AC?nome=%E4%BD%90%E8%97%A4']){
  assert.equal(expected(legacy.origin+p),official.origin+p);
  assert.equal(expected(official.origin+p),null,'domínio oficial não deve voltar à origem nem redirecionar para si próprio');
}
for(const p of recovery) assert.equal(expected(legacy.origin+p+'?idioma=ja'),null,'recuperação continua no origin dos saves');
assert.equal(expected('https://preview.volante-de-ouro.pages.dev/carreira'),null,'preview fora do escopo');
assert.equal(expected('https://volante-de-ouro.pages.dev.example.com/carreira'),null,'hostname precisa ser exato');

const script=read('assets/migracao-dominio.js');
function page(origin,language='pt-BR'){
  const links=[],events={};
  const doc={readyState:'complete',documentElement:{lang:language},getElementById:id=>links.find(x=>x.id===id),
    querySelector:s=>s==='.ini-acoes'?{appendChild:n=>links.push(n)}:null,
    createElement:()=>({attrs:{},setAttribute(k,v){this.attrs[k]=v;}})};
  const ctx={document:doc,location:{origin},window:{addEventListener:(name,fn)=>events[name]=fn}};
  Object.defineProperty(ctx,'localStorage',{get(){throw Error('link de recuperação não deve acessar nem alterar saves');}});
  vm.runInNewContext(script,ctx);
  return{doc,links,events};
}
for(const origin of [legacy.origin,'http://volantedeouro.com','https://preview.volante-de-ouro.pages.dev','null'])
  assert.equal(page(origin).links.length,0,'link não modifica outros ambientes');
const P=page(official.origin);
assert.equal(P.links.length,1);assert.equal(P.links[0].href,'/recuperar-progresso/');
assert.equal(P.links[0].textContent,'Recuperar progresso do site antigo');
assert.ok(Object.hasOwn(P.links[0].attrs,'data-i18n-ignore'));
for(const[lang,label]of [['en','Recover progress from the old site'],['es','Recuperar el progreso del sitio anterior'],['ja','旧サイトのセーブデータを復元']]){
  P.doc.documentElement.lang=lang;P.events['vdo:languagechange']();assert.equal(P.links[0].textContent,label);
}
assert.ok(read('index.html').includes('<script src="assets/migracao-dominio.js" defer></script>'));
console.log('domínio: configuração, caminhos, query strings, exceção de recuperação e link preservados');
