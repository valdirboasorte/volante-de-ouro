/* Verificação somente leitura da prévia Cloudflare Pages. Requer Node 18+.
   node ferramentas/verificar-previa.js https://VERSAO.volante-de-ouro.pages.dev/ [--json]
   GET sem seguir redirecionamentos. Não acessa produção, APIs ou saves. */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const crypto = require('node:crypto'), vm = require('node:vm');
const ROOT = path.resolve(__dirname, '..'), OFFICIAL = 'https://volantedeouro.com/';
const TEXT_EXTENSIONS = new Set(['.html','.js','.css','.json','.xml','.txt','.svg']);

function previewURL(value){
  const url = new URL(value);
  if(url.protocol !== 'https:' || url.username || url.password || url.port || url.search || url.hash || url.pathname !== '/' ||
    !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.volante-de-ouro\.pages\.dev$/i.test(url.hostname))
    throw new Error('Use somente a URL raiz HTTPS de uma prévia *.volante-de-ouro.pages.dev; produção é recusada.');
  return url;
}
function attrs(tag){
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/g)]
    .map(m => [m[1].toLowerCase(),m[3].replace(/&amp;/g,'&')]));
}
function normalized(buffer, file){
  return TEXT_EXTENSIONS.has(path.extname(file).toLowerCase())
    ? Buffer.from(buffer.toString('utf8').replace(/\r\n?/g,'\n')) : buffer;
}
const hash = buffer => crypto.createHash('sha256').update(buffer).digest('hex');
function localFile(url){
  let pathname = decodeURIComponent(url.pathname);
  if(pathname.endsWith('/')) pathname += 'index.html';
  const file = path.resolve(ROOT, '.' + pathname);
  if(!file.startsWith(ROOT + path.sep)) throw new Error('Caminho fora do pacote público');
  return file;
}
async function mapLimited(items, operation){
  let next = 0;
  await Promise.all(Array.from({length:Math.min(4,items.length)},async()=>{
    for(;;){const index = next++; if(index >= items.length) return; await operation(items[index]);}
  }));
}
function resourceReferences(html, base){
  const found = new Set();
  for(const match of html.matchAll(/<(?:script|link|img|video|source)\b[^>]*>/gi)){
    const tag = attrs(match[0]);
    for(const raw of [tag.src,tag.href,tag.poster]){
      if(!raw || raw.includes('${') || /^(?:#|data:|javascript:)/i.test(raw)) continue;
      const url = new URL(raw,base);
      if(url.origin === base.origin) found.add(url.pathname + url.search);
    }
  }
  return [...found];
}

async function runChecks(value, {fetchImpl=globalThis.fetch}={}){
  const base = previewURL(value), failures = [], requests = new Map(), compared = new Set();
  let checks = 0, htmlSHA256 = null;
  function check(condition,label){checks++; if(!condition) failures.push(label); return !!condition;}
  function request(relative){
    const url = new URL(relative,base);
    if(url.origin !== base.origin) throw new Error('Requisição fora da prévia recusada');
    if(!requests.has(url.href)) requests.set(url.href,(async()=>{
      try{
        const response = await fetchImpl(url.href,{method:'GET',redirect:'manual',signal:AbortSignal.timeout(25000),
          headers:{'User-Agent':'VolanteDeOuro-PreviewCheck/1.0'}});
        const bytes = Buffer.from(await response.arrayBuffer());
        return {url,response,bytes,text:bytes.toString('utf8')};
      }catch(error){return {url,error:error.message};}
    })());
    return requests.get(url.href);
  }
  function headers(result){
    const h = result.response.headers, label = result.url.pathname;
    check(/(?:^|[\s,])noindex(?:$|[\s,])/i.test(h.get('x-robots-tag')||''),label+': header noindex da prévia');
    check(h.get('x-content-type-options') === 'nosniff',label+': header nosniff');
    const cache = h.get('cache-control')||'';
    check(/(?:^|[,\s])max-age=0(?:$|[,\s])/i.test(cache) && /must-revalidate/i.test(cache),label+': cache exige revalidação');
  }
  async function asset(relative,expectedType){
    const result = await request(relative), label = result.url.pathname;
    if(!check(!result.error,label+': GET disponível'+(result.error?' ('+result.error+')':''))) return null;
    if(!check(result.response.status === 200,label+': HTTP 200 sem redirecionamento (recebido '+result.response.status+')')) return null;
    check(!result.response.headers.get('location'),label+': sem Location');
    headers(result);
    if(expectedType) check(expectedType.test(result.response.headers.get('content-type')||''),label+': Content-Type correto');
    if(!compared.has(label)){
      compared.add(label);
      try{
        const file = localFile(result.url), local = fs.readFileSync(file);
        const same = hash(normalized(local,file)) === hash(normalized(result.bytes,file));
        check(same,label+': SHA-256 coincide com o arquivo local (texto ignora CRLF)');
        if(label === '/') htmlSHA256 = {local:hash(normalized(local,file)),preview:hash(normalized(result.bytes,file))};
      }catch(error){check(false,label+': comparação local indisponível ('+error.message+')');}
    }
    return result;
  }
  const page = await asset('/',/text\/html/i);
  if(page){
    const html = page.text, head = (html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)||[])[1]||'';
    const meta = [...head.matchAll(/<meta\b[^>]*>/gi)].map(m=>attrs(m[0]));
    function metadata(key){const entries=meta.filter(m=>m.name===key||m.property===key);check(entries.length===1,'metadado único: '+key);return entries[0]&&entries[0].content||'';}
    const links = [...head.matchAll(/<link\b[^>]*>/gi)].map(m=>attrs(m[0]));
    check(/<!doctype html>/i.test(html) && /<html\b[^>]*lang="pt-BR"/i.test(html),'HTML inicial e idioma');
    check(/<title>Volante de Ouro[^<]*Simulador de Carreira[^<]*<\/title>/i.test(head),'título entregue pelo servidor');
    check(links.filter(a=>a.rel==='canonical').length===1 && links.find(a=>a.rel==='canonical').href===OFFICIAL,'canonical único oficial');
    check(metadata('description').length>90,'descrição útil');
    check(metadata('og:url')===OFFICIAL,'Open Graph mantém domínio oficial');
    check(metadata('og:type')==='website','Open Graph tipo website');
    check(metadata('twitter:card')==='summary_large_image','Twitter Card grande');
    for(const key of ['og:title','og:description','twitter:title','twitter:description','og:image:alt','twitter:image:alt'])
      check(metadata(key).length>15,'metadado preenchido: '+key);
    check(/width=device-width/.test(metadata('viewport')),'viewport responsivo');
    const image = metadata('og:image');
    check(image===OFFICIAL+'assets/brand/og-volante-de-ouro.png','imagem Open Graph absoluta oficial');
    check(metadata('twitter:image')===image,'imagem Twitter consistente');
    check(metadata('og:image:width')==='1200' && metadata('og:image:height')==='630','dimensões OG declaradas');
    check(!/id="roadmap"|href="#roadmap"/.test(html),'sem roadmap no HTML publicado');
    const structured = [...head.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
      .filter(m=>attrs(m[1]).type==='application/ld+json');
    check(structured.length===1,'um bloco JSON-LD');
    try{
      const schema=JSON.parse(structured[0][2]),graph=schema['@graph'];
      check(schema['@context']==='https://schema.org' && Array.isArray(graph),'JSON-LD parseável e contexto correto');
      check(graph.map(n=>n['@type']).sort().join(',')==='VideoGame,WebSite','tipos JSON-LD esperados');
      check(graph.every(n=>n.url===OFFICIAL),'URLs estruturadas oficiais');
      check(graph.find(n=>n['@type']==='VideoGame').isAccessibleForFree===true,'modelo gratuito estruturado');
    }catch(error){check(false,'JSON-LD inválido: '+error.message);}
    const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
    for(let i=0;i<scripts.length;i++){
      const a=attrs(scripts[i][1]); if(a.src||a.type==='application/ld+json') continue;
      try{new vm.Script(scripts[i][2]);check(true,'sintaxe inline '+i);}catch(error){check(false,'script inline '+i+': '+error.message);}
    }
    await mapLimited(resourceReferences(html,base),async relative=>{
      const ext=path.extname(new URL(relative,base).pathname).toLowerCase();
      const type=ext==='.js'?/(?:javascript|ecmascript)/i:ext==='.css'?/text\/css/i:undefined;
      const result=await asset(relative,type);
      if(result&&ext==='.js'){
        try{new vm.Script(result.text);check(true,'sintaxe '+relative);}catch(error){check(false,relative+': sintaxe JavaScript '+error.message);}
      }
    });
  }
  const [robots,sitemap,manifest,recovery] = await Promise.all([
    asset('/robots.txt',/text\/plain/i),asset('/sitemap.xml',/(?:application|text)\/xml/i),
    asset('/manifest.json',/(?:application\/(?:manifest\+)?json)/i),asset('/recuperar-progresso/',/text\/html/i)
  ]);
  if(robots){
    check(!/<html/i.test(robots.text),'robots.txt não é fallback HTML');
    check(/^User-agent:\s*\*\s*$/mi.test(robots.text)&&/^Allow:\s*\/\s*$/mi.test(robots.text),'robots permite conteúdo público');
    check(/^Sitemap:\s*https:\/\/volantedeouro\.com\/sitemap\.xml\s*$/mi.test(robots.text),'robots aponta sitemap oficial');
  }
  if(sitemap){
    check(!/<html/i.test(sitemap.text)&&/<urlset\s+xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/.test(sitemap.text),'sitemap real com namespace correto');
    check([...sitemap.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]).join(',')===OFFICIAL,'sitemap só contém página canônica real');
    check(!/<lastmod>/.test(sitemap.text),'sitemap sem datas inventadas');
  }
  if(manifest){
    try{
      const data=JSON.parse(manifest.text);
      check(data.id==='./index.html'&&data.start_url==='./index.html'&&data.scope==='./','manifest mantém identidade e escopo');
      check(data.display==='standalone'&&data.lang==='pt-BR','manifest válido para instalação');
      check(Array.isArray(data.icons)&&data.icons.length>=4,'manifest possui ícones');
      for(const icon of data.icons||[]){
        const url=new URL(icon.src,base);
        if(!check(url.origin===base.origin,'ícone pertence à prévia')) continue;
        const result=await asset(url.pathname,icon.type==='image/png'?/image\/png/i:/image\/svg\+xml/i);
        if(result&&icon.type==='image/png'){
          const b=result.bytes;
          check(b.length>=24&&b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'assinatura PNG '+url.pathname);
          if(b.length>=24) check(icon.sizes===b.readUInt32BE(16)+'x'+b.readUInt32BE(20),'dimensões PNG '+url.pathname);
        }
      }
    }catch(error){check(false,'manifest inválido: '+error.message);}
  }
  for(const [relative,width,height] of [['/assets/brand/og-volante-de-ouro.png',1200,630],['/apple-touch-icon.png',180,180],['/favicon-32x32.png',32,32]]){
    const result=await asset(relative,/image\/png/i);
    if(result){const b=result.bytes;check(b.length>=24&&b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'PNG válido '+relative);
      if(b.length>=24) check(b.readUInt32BE(16)===width&&b.readUInt32BE(20)===height,'dimensões '+relative);}
  }
  const ico=await asset('/favicon.ico',/image\/(?:x-icon|vnd\.microsoft\.icon)/i);
  if(ico) check(ico.bytes.length>=6&&ico.bytes.readUInt16LE(0)===0&&ico.bytes.readUInt16LE(2)===1&&ico.bytes.readUInt16LE(4)>=3,'ICO real contém múltiplos tamanhos');
  if(recovery){
    check(/<meta name="vdo-progress-recovery" content="1">/.test(recovery.text),'recuperação entrega marcador próprio');
    check(/<meta name="robots" content="noindex,nofollow">/.test(recovery.text),'recuperação continua fora dos buscadores');
    try{
      const core=(recovery.text.match(/<script id="recovery-core">([\s\S]*?)<\/script>/)||[])[1];
      const sandbox={};vm.runInNewContext(core,sandbox,{timeout:1000});
      check(sandbox.VDO_RECOVERY.allowed(base.origin)===false,'recuperação bloqueia origem de prévia');
      check(sandbox.VDO_RECOVERY.allowed(OFFICIAL.slice(0,-1))===true,'recuperação mantém origem oficial autorizada');
      let reads=0,blocked=false;
      try{sandbox.VDO_RECOVERY.read({getItem(){reads++;return null;}},base.origin);}catch(error){blocked=error.code==='origin';}
      check(blocked&&reads===0,'recuperação em prévia não lê saves');
    }catch(error){check(false,'proteção da recuperação não pôde ser validada: '+error.message);}
  }
  return {checkedAt:new Date().toISOString(),url:base.href,checks,passed:checks-failures.length,failed:failures.length,
    requests:requests.size,comparedFiles:compared.size,htmlSHA256,failures};
}
function formatReport(report){
  return ['Prévia: '+report.url,report.passed+'/'+report.checks+' verificações passaram; '+report.failed+' falhas.',
    report.requests+' URLs consultadas por GET; '+report.comparedFiles+' arquivos comparados com SHA-256.',
    ...(report.htmlSHA256?['SHA-256 HTML normalizado: '+report.htmlSHA256.preview]:[]),
    ...report.failures.map(f=>'FALHA: '+f)].join('\n');
}
async function main(args=process.argv.slice(2)){
  const positional=args.filter(a=>a!=='--json');
  if(positional.length!==1){console.error('Uso: node ferramentas/verificar-previa.js https://VERSAO.volante-de-ouro.pages.dev/ [--json]');process.exitCode=2;return;}
  const report=await runChecks(positional[0]);
  console.log(args.includes('--json')?JSON.stringify(report,null,2):formatReport(report));
  process.exitCode=report.failed?1:0;
}
if(require.main===module) main().catch(error=>{console.error(error.message);process.exitCode=1;});
module.exports={previewURL,resourceReferences,runChecks,formatReport};
