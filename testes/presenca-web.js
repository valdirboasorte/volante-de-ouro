/* SEO entregue no HTML, ativos reais e navegação pública sem tocar nas carreiras.
   Sem dependências: node testes/presenca-web.js
   Não substitui a validação dos headers no provedor depois do deploy. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const assert = require('node:assert/strict'), zlib = require('node:zlib');
const root = path.join(__dirname, '..'), official = 'https://volantedeouro.com/';
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const html = read('index.html'), head = html.match(/<head>([\s\S]*?)<\/head>/i)[1];
let checks = 0;
function ok(value, message){ checks++; assert.ok(value, message); }
function eq(actual, expected, message){ checks++; assert.deepEqual(actual, expected, message); }
function attrs(tag){
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/g)].map(m => [m[1].toLowerCase(), m[3]]));
}
const metas = [...head.matchAll(/<meta\b[^>]*>/gi)].map(m => attrs(m[0]));
function meta(key){
  const found = metas.filter(m => m.name === key || m.property === key);
  eq(found.length, 1, 'metadado único: ' + key);
  return found[0].content;
}
function localAsset(url){
  const parsed = new URL(url, official);
  eq(parsed.origin, new URL(official).origin, 'ativo pertence ao domínio oficial: ' + url);
  const file = path.resolve(root, '.' + decodeURIComponent(parsed.pathname));
  ok(file.startsWith(root + path.sep), 'ativo permanece no diretório público');
  ok(fs.existsSync(file), 'ativo existe: ' + parsed.pathname);
  return fs.readFileSync(file);
}
function png(buffer, expected, label){
  eq([...buffer.subarray(0, 8)], [137,80,78,71,13,10,26,10], label + ': assinatura PNG');
  let offset = 8, dims = null, ended = false;
  const compressed = [];
  while(offset + 12 <= buffer.length){
    const size = buffer.readUInt32BE(offset), type = buffer.toString('ascii', offset + 4, offset + 8);
    ok(offset + size + 12 <= buffer.length, label + ': chunk completo');
    if(type === 'IHDR') dims = [buffer.readUInt32BE(offset + 8), buffer.readUInt32BE(offset + 12)];
    if(type === 'IDAT') compressed.push(buffer.subarray(offset + 8, offset + 8 + size));
    offset += size + 12;
    if(type === 'IEND'){ ended = true; break; }
  }
  eq(dims, expected, label + ': dimensões');
  ok(ended && offset === buffer.length, label + ': termina em IEND');
  ok(compressed.length > 0 && zlib.inflateSync(Buffer.concat(compressed)).length > 0, label + ': pixels comprimidos válidos');
}

/* Metadados presentes na resposta estática, antes de qualquer JavaScript. */
{
  const canonical = [...head.matchAll(/<link\b[^>]*>/gi)].map(m => attrs(m[0])).filter(a => a.rel === 'canonical');
  eq(canonical.map(a => a.href), [official], 'canonical único e oficial');
  ok(/<html\b[^>]*lang="pt-BR"/.test(html), 'idioma inicial declarado');
  ok(/<title>Volante de Ouro[^<]*Simulador de Carreira[^<]*<\/title>/.test(head), 'título útil no servidor');
  const description = meta('description');
  ok(description.length >= 90 && description.length <= 200, 'descrição pública tem tamanho razoável');
  ok(/piloto|chefe/i.test(description) && /gratuito|gratuita/i.test(description), 'descrição informa o conteúdo real');
  ok(/index/.test(meta('robots')) && !/noindex/.test(meta('robots')), 'página oficial indexável');
  ok(/width=device-width/.test(meta('viewport')), 'viewport móvel');
  ok(/^#[0-9a-f]{6}$/i.test(meta('theme-color')), 'cor do navegador válida');
  eq(meta('og:type'), 'website', 'tipo Open Graph');
  eq(meta('og:url'), official, 'URL Open Graph oficial');
  eq(meta('twitter:card'), 'summary_large_image', 'cartão de compartilhamento grande');
  for(const key of ['og:title','og:description','og:image:alt','twitter:title','twitter:description','twitter:image:alt'])
    ok(meta(key).trim().length > 15, 'metadado preenchido: ' + key);
  const image = meta('og:image');
  ok(image.startsWith(official), 'imagem compartilhada usa URL absoluta oficial');
  eq(meta('og:image:secure_url'), image, 'imagem HTTPS consistente');
  eq(meta('twitter:image'), image, 'Twitter usa a mesma imagem oficial');
  eq(meta('og:image:type'), 'image/png', 'tipo da imagem compartilhada');
  eq([meta('og:image:width'), meta('og:image:height')], ['1200','630'], 'dimensões Open Graph declaradas');
  png(localAsset(image), [1200,630], 'imagem Open Graph');
}

/* Não inventar avaliações, organização, datas ou funcionalidades disponíveis. */
{
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter(m => attrs(m[1]).type === 'application/ld+json');
  eq(scripts.length, 1, 'um bloco JSON-LD público');
  const schema = JSON.parse(scripts[0][2]);
  eq(schema['@context'], 'https://schema.org', 'contexto Schema.org');
  const graph = schema['@graph'];
  ok(Array.isArray(graph), 'grafo JSON-LD');
  eq(graph.map(n => n['@type']).sort(), ['VideoGame','WebSite'], 'tipos verificáveis, sem empresa inventada');
  const game = graph.find(n => n['@type'] === 'VideoGame');
  for(const node of graph){
    eq(node.url, official, 'URL estruturada oficial');
    eq(node.name, 'Volante de Ouro', 'nome estruturado correto');
    eq(node.inLanguage, ['pt-BR','en','es','ja'], 'idiomas do jogo');
  }
  eq(game.isAccessibleForFree, true, 'modelo gratuito declarado');
  ok(/navegador/i.test(game.gamePlatform), 'plataforma real');
  eq(game.isPartOf['@id'], graph.find(n => n['@type'] === 'WebSite')['@id'], 'jogo vinculado ao website');
  ok(!/"(?:aggregateRating|review|ratingValue|ratingCount|award|datePublished|dateCreated|foundingDate|Organization)"/.test(scripts[0][2]), 'sem avaliações, prêmios, organização ou datas inventadas');

  const publicIntro = html.slice(html.indexOf('<section class="screen on" id="scr-intro">'), html.indexOf('<section class="screen" id="scr-apoio"'));
  const text = publicIntro.replace(/<!--[\s\S]*?-->/g,'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ');
  ok(/<h1\b/.test(publicIntro) && /simulador gratuito de carreira no automobilismo/.test(text), 'HTML inicial contém título e descrição antes de executar scripts');
  ok(/<main\b[^>]*id="conteudo"[^>]*tabindex="-1"/.test(html) && /href="#conteudo"/.test(html), 'atalho de teclado aponta ao conteúdo principal');
  for(const id of ['inName','inNum','inCountry','chnChefe','chnChefePais']){
    ok(new RegExp('<label\\b[^>]*for="'+id+'"').test(html), 'campo de criação possui rótulo associado: '+id);
  }
  ok(/id="inAge" aria-label="Idade"/.test(html), 'controle de idade possui nome acessível');
  const roadmap = html.match(/<section\b[^>]*id="roadmap"[^>]*>[\s\S]*?<\/section>/)[0];
  ok(/aria-labelledby="roadmapT"/.test(roadmap) && /<h2 id="roadmapT">/.test(roadmap), 'roadmap possui nome acessível e hierarquia');
  const features = roadmap.match(/<ul class="rm-recursos">([\s\S]*?)<\/ul>/)[1];
  eq((features.match(/<li>/g) || []).length, 7, 'sete recursos disponíveis em HTML');
  for(const feature of ['Carreira de piloto','Chefe de equipe','Campeonatos históricos','Simulação de corridas','Mercado de pilotos','Sistema de contratos','Estatísticas e recordes'])
    ok(features.includes(feature), 'recurso público: ' + feature);
  eq((roadmap.match(/>Planejado<\//g) || []).length, 3, 'três planos com estado honesto');
  for(const plan of ['Multiplayer cooperativo','Saves na nuvem','Infraestrutura para crescer']) ok(roadmap.includes(plan), 'plano: ' + plan);
  ok(!/Em desenvolvimento|\b20\d\d\b|\d+\s*%/i.test(roadmap), 'roadmap não inventa datas, percentuais ou desenvolvimento em andamento');
  ok(roadmap.includes('Funcionalidades e prioridades podem mudar'), 'aviso de mudança de prioridades');
  ok(roadmap.includes('doar não é comprar uma funcionalidade futura'), 'apoio não é pré-venda');
  const nav = html.match(/<nav class="topnav"[\s\S]*?<\/nav>/)[0];
  ok(/<a href="#roadmap"/.test(nav), 'menu utiliza âncora real do roadmap');
  ok(/<script src="assets\/presenca-web\.js" defer><\/script>/.test(html), 'navegação pública carrega sem bloquear o HTML');
  const css = read('assets/presenca-web.css');
  ok(css.includes('prefers-reduced-motion:reduce') && css.includes('@media(max-width:700px)'), 'estilos incluem movimento reduzido e versão móvel');

  const locales={en:{pairs:[]},es:{pairs:[]},ja:{pairs:[]}};
  const context={window:{VDO_LOCALES:locales}};
  vm.createContext(context);
  vm.runInContext(read('assets/i18n/presenca.js'),context);
  const phrases=[...roadmap.matchAll(/>([^<>]+)</g)].map(m=>m[1].trim()).filter(Boolean);
  phrases.push(meta('description'),meta('og:title'),meta('og:image:alt'),'Pular para o conteúdo','Roadmap',
    'Termine a corrida antes de abrir o roadmap.','Conclua a decisão atual antes de abrir o roadmap.');
  for(const lang of ['en','es','ja']){
    const translated=new Map(locales[lang].pairs);
    for(const phrase of new Set(phrases)){
      ok(typeof translated.get(phrase)==='string' && translated.get(phrase).trim().length>0, 'conteúdo público traduzido em '+lang+': '+phrase);
    }
    ok(locales[lang].title.includes('Volante de Ouro'), 'título traduzido preserva a marca em '+lang);
    ok(translated.get('Planejado')!=='Planejado' && translated.get('Saves na nuvem')!=='Saves na nuvem', 'planos apresentados no idioma selecionado: '+lang);
  }
}

/* Formatos reais dos ícones e identidade estável da instalação existente. */
{
  const links = [...head.matchAll(/<link\b[^>]*>/gi)].map(m => attrs(m[0]));
  const iconLinks = links.filter(a => ['icon','apple-touch-icon'].includes(a.rel));
  for(const icon of iconLinks) localAsset(icon.href);
  png(localAsset('favicon-32x32.png'), [32,32], 'favicon PNG');
  png(localAsset('apple-touch-icon.png'), [180,180], 'ícone Apple');
  const svg = localAsset('favicon.svg').toString();
  const view = svg.match(/<svg\b[^>]*viewBox="0 0 (\d+) (\d+)"/);
  ok(view && Number(view[1]) > 0 && view[1] === view[2] && /<\/svg>/.test(svg), 'favicon SVG quadrado e escalável');
  const ico = localAsset('favicon.ico');
  eq([ico.readUInt16LE(0),ico.readUInt16LE(2)], [0,1], 'assinatura de arquivo ICO');
  const count = ico.readUInt16LE(4), sizes = [];
  ok(count >= 3 && ico.length >= 6 + count * 16, 'diretório ICO completo');
  for(let i=0; i<count; i++){
    const entry = 6 + i*16, w = ico[entry] || 256, h = ico[entry+1] || 256;
    const size = ico.readUInt32LE(entry+8), offset = ico.readUInt32LE(entry+12);
    ok(size > 0 && offset >= 6 + count*16 && offset+size <= ico.length, 'imagem ICO dentro do arquivo');
    sizes.push(w); const image = ico.subarray(offset,offset+size);
    if(image[0] === 137) png(image,[w,h],'ICO '+w);
    else eq([image.readInt32LE(4),image.readInt32LE(8)], [w,h*2], 'imagem DIB do ICO '+w);
  }
  ok([16,32,48].every(size => sizes.includes(size)), 'ICO cobre 16, 32 e 48 pixels');
  const manifest = JSON.parse(read('manifest.json'));
  eq(new URL(manifest.id,official).href, official+'index.html', 'id conserva identidade anterior do start_url');
  eq(new URL(manifest.start_url,official).href, official+'index.html', 'start_url existente preservada');
  eq(new URL(manifest.scope,official).href, official, 'escopo cobre o jogo');
  eq(manifest.display, 'standalone', 'modo instalado preservado');
  for(const icon of manifest.icons){
    const file = localAsset(icon.src);
    if(icon.type === 'image/png') png(file,icon.sizes.split('x').map(Number),'PWA '+icon.src);
    else ok(icon.type === 'image/svg+xml' && /<svg\b/.test(file.toString()), 'SVG do manifest válido');
  }
  ok(manifest.icons.some(i=>i.sizes==='192x192') && manifest.icons.some(i=>i.sizes==='512x512'), 'PWA possui ambos os tamanhos necessários');
}

/* Rastreamento permitido; rotas de SPA e recuperação não viram páginas fictícias. */
{
  const robots = read('robots.txt');
  ok(/^User-agent:\s*\*$/m.test(robots) && /^Allow:\s*\/$/m.test(robots), 'rastreamento público permitido');
  ok(!/^Disallow:\s*\S/m.test(robots), 'CSS e JavaScript não são bloqueados');
  ok(robots.includes('Sitemap: '+official+'sitemap.xml'), 'robots informa sitemap oficial');
  const sitemap = read('sitemap.xml');
  ok(/<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/.test(sitemap), 'namespace do sitemap correto');
  eq([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]), [official], 'somente raiz canônica pública no sitemap');
  ok(!/<lastmod>/.test(sitemap), 'sem data de modificação inventada');
  const blocks = []; let block;
  for(const line of read('_headers').split(/\r?\n/)){
    if(!line.trim() || line.trim().startsWith('#')) continue;
    if(/^\S/.test(line)){ block={pattern:line,values:[]}; blocks.push(block); }
    else { ok(!!block,'header possui regra'); block.values.push(line.trim()); }
  }
  const global = blocks.find(b=>b.pattern==='/*');
  ok(global && !global.values.some(v=>/^X-Robots-Tag:.*noindex/i.test(v)), 'regra global não bloqueia indexação oficial');
  ok(global.values.includes('Cache-Control: public, max-age=0, must-revalidate'), 'arquivos mutáveis são revalidados');
  ok(!blocks.some(b=>b.pattern.startsWith(official) && b.values.some(v=>/^X-Robots-Tag:.*noindex/i.test(v))), 'nenhuma regra noindex dirigida ao domínio oficial');
  ok(blocks.some(b=>b.pattern==='https://:project.pages.dev/*' && b.values.includes('X-Robots-Tag: noindex')), 'host alternativo Pages fora do índice');
  ok(blocks.some(b=>b.pattern==='/recuperar-progresso/*' && b.values.includes('X-Robots-Tag: noindex, nofollow')), 'recuperação continua acessível sem indexação');
  const vercel = JSON.parse(read('vercel.json'));
  ok(!vercel.redirects && !vercel.rewrites, 'Vercel mantém caminhos e dados locais sem novo redirect');
  ok(vercel.headers.some(r=>r.source==='/(.*)' && r.headers.some(h=>h.key==='X-Robots-Tag' && h.value==='noindex')), 'noindex da Vercel definido apenas na configuração Vercel');
}

/* Executa o script real com um DOM mínimo: mede efeitos públicos observáveis.
   Acesso ao armazenamento falha de propósito para detectar leituras/escritas. */
function navigation({hash='',loading=false,live=false,missing=false,modal=false,queued=false,continuation=false}={}){
  const calls=[], events={}, docEvents={}, linkEvents=[{},{}], mediaEvents={};
  const saves={driver:{name:'Piloto antigo',year:1994},chief:{team:'Equipe',money:12345}};
  const stored=JSON.stringify(saves), url=new URL(official+'?idioma=ja'+hash);
  const section={scrollIntoView:opts=>calls.push(['scroll',JSON.parse(JSON.stringify(opts))]),focus:opts=>calls.push(['focus',JSON.parse(JSON.stringify(opts))])};
  const context={console,location:{hash:url.hash},document:{readyState:loading?'loading':'complete',
    getElementById:id=>id==='roadmap'&&!missing?section:null,
    querySelectorAll:()=>linkEvents.map(b=>({addEventListener:(kind,fn)=>{b[kind]=fn;}})),
    addEventListener:(kind,fn)=>{docEvents[kind]=fn;}},
    history:{pushState:(state,title,to)=>{url.hash=to;context.location.hash=url.hash;calls.push(['history',to]);}},
    addEventListener:(kind,fn)=>{events[kind]=fn;},
    matchMedia:()=>({addEventListener:(kind,fn)=>{mediaEvents[kind]=fn;}}),
    localStorage:{getItem(){throw Error('navegação não deve ler saves');},setItem(){throw Error('navegação não deve gravar saves');},removeItem(){throw Error('navegação não deve apagar saves');}},
    S:saves.driver,C:saves.chief,AoVivo:{R:live?{running:true}:null},
    UI:{aberta:()=>modal,_fila:queued?[()=>calls.push(['decision'])]:[],
      _aoEsvaziar:continuation?()=>{saves.driver.year++;calls.push(['resume']);}:null,
      limparFila:()=>calls.push(['queue']),close:()=>calls.push(['close']),show:id=>calls.push(['show',id]),
      menuTopo:value=>calls.push(['menu',value]),toast:text=>calls.push(['toast',text]),
      aplicarMovimento:()=>calls.push(['motion']),movimentoLigado:()=>false},
    Abertura:{reduzido:false,filme:()=>calls.push(['film'])}};
  vm.createContext(context); vm.runInContext(read('assets/presenca-web.js'),context);
  return {context,calls,events,docEvents,linkEvents,mediaEvents,stored,saves,url,
    click(overrides={}){ const event={button:0,prevented:false,preventDefault(){this.prevented=true;},...overrides};linkEvents[0].click(event);return event; }};
}
{
  const p=navigation();
  ok(p.linkEvents.every(e=>typeof e.click==='function'), 'menu e rodapé recebem navegação pública');
  eq(p.calls, [], 'carregar o script sem hash não muda a tela');
  const click=p.click();
  ok(click.prevented, 'clique comum usa navegação interna');
  ok(p.calls.some(c=>c[0]==='show'&&c[1]==='intro'), 'vindo de outra tela, exibe a abertura que contém roadmap');
  ok(p.calls.some(c=>c[0]==='menu'&&c[1]===false), 'fecha menu móvel');
  eq(p.url.href,official+'?idioma=ja#roadmap','âncora preserva domínio e query');
  ok(p.calls.some(c=>c[0]==='scroll')&&p.calls.some(c=>c[0]==='focus'), 'roadmap recebe rolagem e foco de teclado');
  eq(JSON.stringify(p.saves),p.stored,'navegação não modifica dados das carreiras');
  ok(!p.calls.some(c=>c[0]==='queue'||c[0]==='close'),'navegação livre não limpa fila nem agenda callbacks de fechamento');
  p.calls.length=0; p.click();
  ok(!p.calls.some(c=>c[0]==='history'), 'abrir novamente não duplica entrada de histórico');
  for(const modified of [{ctrlKey:true},{metaKey:true},{shiftKey:true},{altKey:true},{button:1},{button:2}]){
    const m=navigation();
    ok(!m.click(modified).prevented && m.calls.length===0,'clique modificado mantém comportamento nativo: '+JSON.stringify(modified));
  }
  const keyboard=navigation();
  ok(keyboard.click({button:undefined}).prevented && keyboard.calls.some(c=>c[0]==='focus'), 'ativação por teclado abre e foca o roadmap');
  const live=navigation({live:true});
  live.click();
  eq(live.calls.map(c=>c[0]),['toast'],'corrida ativa recebe aviso sem limpar fila, fechar diálogo ou trocar tela');
  eq(live.url.hash,'','corrida ativa não altera histórico');
  eq(JSON.stringify(live.saves),live.stored,'corrida ativa preserva saves');
  for(const pending of [{modal:true},{queued:true},{continuation:true},{modal:true,queued:true,continuation:true}]){
    const busy=navigation(pending), queue=busy.context.UI._fila, callback=busy.context.UI._aoEsvaziar;
    ok(busy.click().prevented,'decisão pendente bloqueia a navegação: '+JSON.stringify(pending));
    eq(busy.calls.map(c=>c[0]),['toast'],'decisão pendente só avisa, sem executar fechamento ou simulação');
    eq(busy.url.hash,'','decisão pendente preserva o histórico');
    ok(busy.context.UI._fila===queue && busy.context.UI._aoEsvaziar===callback,'fila e continuação pendentes preservadas por referência');
    eq(JSON.stringify(busy.saves),busy.stored,'decisão pendente preserva dados das carreiras');
  }
  const initial=navigation({hash:'#roadmap'});
  ok(initial.calls.some(c=>c[0]==='show'&&c[1]==='intro') && initial.calls.some(c=>c[0]==='focus'),'link direto com hash abre o roadmap');
  ok(!initial.calls.some(c=>c[0]==='history'),'hash inicial não cria histórico extra');
  const deferred=navigation({loading:true});
  ok(!deferred.linkEvents[0].click && typeof deferred.docEvents.DOMContentLoaded==='function','inicialização aguarda DOM quando necessário');
  deferred.docEvents.DOMContentLoaded();
  ok(typeof deferred.linkEvents[0].click==='function','DOMContentLoaded conecta os links');
  deferred.context.location.hash='#roadmap';deferred.events.hashchange();
  ok(deferred.calls.some(c=>c[0]==='focus'),'mudança de hash também abre o roadmap');
  const absent=navigation({missing:true});
  ok(!absent.click().prevented && absent.calls.length===0,'seção ausente não interrompe navegação nem carreira');
  const reduced=navigation();reduced.mediaEvents.change();
  ok(reduced.context.Abertura.reduzido && reduced.calls.some(c=>c[0]==='motion') && reduced.calls.some(c=>c[0]==='film'),'mudança de movimento reduzido atualiza a abertura');
}
console.log(`presença web: ${checks} verificações de SEO, ativos, roadmap e navegação passaram`);
