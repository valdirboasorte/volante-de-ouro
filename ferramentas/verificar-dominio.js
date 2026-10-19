/* Verificação HTTP real, sem autenticação e sem alterar Cloudflare ou saves.
   node ferramentas/verificar-dominio.js --baseline   observa o estado atual
   node ferramentas/verificar-dominio.js              exige a migração ativa
   Acrescente --json para saída estruturada. Requer Node 18+. */
'use strict';
const OLD = 'https://volante-de-ouro.pages.dev', OFFICIAL = 'https://volantedeouro.com';
const recoveryPaths = ['/recuperar-progresso', '/recuperar-progresso/', '/recuperar-progresso/index.html'];
const redirectStatuses = new Set([301, 302, 303, 307, 308]);
const paths = ['/', '/carreira', '/login', '/rota/aninhada',
  '/carreira?idioma=ja&ref=a%2Bb&tag=1&tag=2',
  '/login?next=%2Fcarreira%3Fano%3D2024&teste=dominio',
  '/rota/%E6%97%A5%E6%9C%AC?nome=%E4%BD%90%E8%97%A4&espaco=a+b'];

function publicError(error){
  const code = error && (error.cause && error.cause.code || error.code);
  return { error:error && error.message || String(error),
    ...(typeof code === 'string' && /^[A-Z0-9_]{1,80}$/.test(code) ? { errorCode:code } : {}) };
}

async function request(url, method = 'GET', recoveryPage = false, fetchImpl = globalThis.fetch){
  const result = { url, method }, hops = [], visited = new Set();
  let current = url;
  try{
    const initial = new URL(url);
    for(let redirects = 0; ; redirects++){
      if(visited.has(current)) throw new Error('Loop de redirecionamento na recuperação');
      visited.add(current);
      const response = await fetchImpl(current, { method, redirect:'manual', signal:AbortSignal.timeout(20000),
        headers:{ 'User-Agent':'VolanteDeOuro-DomainCheck/1.0' } });
      const hop = { url:current, status:response.status, location:response.headers.get('location') };
      hops.push(hop);
      if(hops.length === 1) Object.assign(result, { status:hop.status, location:hop.location });
      if(recoveryPage) Object.assign(result, { finalUrl:current, finalStatus:hop.status, hops });

      if(!recoveryPage){
        if(response.body) await response.body.cancel();
        return result;
      }
      if(!redirectStatuses.has(hop.status)){
        const body = await response.text();
        result.recoveryReady = hop.status === 200 && /<meta\s+name=["']vdo-progress-recovery["']\s+content=["']1["']/i.test(body);
        return result;
      }
      if(response.body) await response.body.cancel();
      if(!hop.location) throw new Error('Redirecionamento da recuperação sem Location');
      if(redirects >= 3) throw new Error('Limite de redirecionamentos da recuperação excedido');
      const next = new URL(hop.location, current);
      if(next.origin !== initial.origin || next.username || next.password)
        throw new Error('A recuperação tentou sair da origem; o destino não foi acessado');
      if(!recoveryPaths.includes(next.pathname) || next.search !== initial.search || next.hash)
        throw new Error('A recuperação tentou sair das rotas permitidas ou alterar parâmetros; o destino não foi acessado');
      current = next.href;
    }
  }catch(error){ return { ...result, ...publicError(error) }; }
}

async function mapLimited(items, limit, operation){
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length:Math.min(limit, items.length) }, async () => {
    for(;;){
      const index = next++;
      if(index >= items.length) return;
      results[index] = await operation(items[index]);
    }
  }));
  return results;
}

async function runChecks({ baseline = false, fetchImpl = globalThis.fetch } = {}){
  const checks = [
    ...paths.flatMap(path => [
      { url:OLD + path, expectedStatus:301, expectedLocation:OFFICIAL + path },
      { url:OFFICIAL + path, expectedStatus:200, expectedLocation:null }
    ]),
    { url:OLD + '/', method:'HEAD', expectedStatus:301, expectedLocation:OFFICIAL + '/' },
    { url:OFFICIAL + '/', method:'HEAD', expectedStatus:200, expectedLocation:null },
    ...[OLD,OFFICIAL].flatMap(origin => recoveryPaths.map(path =>
      ({ url:origin + path, expectedStatus:200, expectedLocation:null, recoveryPage:true })))
  ];
  const results = await mapLimited(checks, 4, async check => {
    const actual = await request(check.url, check.method, check.recoveryPage, fetchImpl), errors = [];
    if(actual.error) errors.push(actual.error);
    else if(!baseline){
      if(check.recoveryPage){
        if(actual.finalStatus !== 200) errors.push('HTTP final esperado na recuperação: 200');
        if(!actual.recoveryReady) errors.push('A recuperação ainda serve outra página/fallback do jogo');
      }else{
        if(actual.status !== check.expectedStatus) errors.push('HTTP esperado: ' + check.expectedStatus);
        let destination = actual.location;
        if(destination){ try{ destination = new URL(destination, check.url).href; }catch(e){} }
        if(destination !== check.expectedLocation) errors.push('Location esperado: ' + (check.expectedLocation || '(ausente)'));
      }
    }
    return { ...actual, ...(baseline ? { observed:!actual.error } :
      { expectedStatus:check.expectedStatus, expectedLocation:check.expectedLocation, ok:errors.length === 0 }), errors };
  });
  return { checkedAt:new Date().toISOString(), mode:baseline ? 'baseline' : 'verify',
    note:baseline ? 'Observação; não comprova que o redirecionamento esteja ativo.' :
      'Verificação do comportamento publicado, incluindo a exceção de recuperação.', results };
}

function formatReport(report){
  const baseline = report.mode === 'baseline';
  return [report.note, ...report.results.map(item => (baseline ? '• ' : item.ok ? '✓ ' : '✗ ')
    + item.method + ' ' + item.url + ' → ' + (item.status || item.error)
    + (item.location ? ' ' + item.location : '')
    + (item.hops && item.hops.length > 1 ? ' (destino: ' + item.finalUrl + ' → ' + item.finalStatus + ')' : '')
    + (item.recoveryReady === false ? ' (recuperação não publicada)' : '')
    + (item.errorCode ? ' [causa: ' + item.errorCode + ']' : '')
    + (item.errors.length ? ' [' + item.errors.join('; ') + ']' : ''))].join('\n');
}

async function main(args = process.argv.slice(2)){
  if(args.some(arg => !['--baseline','--json'].includes(arg))){
    console.error('Uso: node ferramentas/verificar-dominio.js [--baseline] [--json]');
    process.exitCode = 2;
    return;
  }
  const report = await runChecks({ baseline:args.includes('--baseline') });
  console.log(args.includes('--json') ? JSON.stringify(report,null,2) : formatReport(report));
  process.exitCode = report.results.every(item => !item.errors.length) ? 0 : 1;
}

if(require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
module.exports = { request, runChecks, formatReport };
