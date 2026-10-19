'use strict';
const assert = require('node:assert/strict');
const { request, runChecks, formatReport } = require('../ferramentas/verificar-dominio');
const OLD = 'https://volante-de-ouro.pages.dev', OFFICIAL = 'https://volantedeouro.com';
const recovery = '/recuperar-progresso/', marker = '<meta name="vdo-progress-recovery" content="1">';
const aliases = ['/recuperar-progresso', recovery, '/recuperar-progresso/index.html'];

function response(status, location = null, body = marker){
  return { status, headers:{ get:name => name === 'location' ? location : null },
    body:{ cancel:async () => {} }, text:async () => body };
}

async function test(){
  for(const origin of [OLD, OFFICIAL]){
    const calls = [];
    const fetchImpl = async (url, options) => {
      calls.push(url);
      assert.equal(options.redirect, 'manual');
      assert.equal(options.method, 'GET');
      return url === origin + recovery ? response(200) : response(308, recovery);
    };
    for(const alias of aliases){
      const actual = await request(origin + alias, 'GET', true, fetchImpl);
      assert.equal(actual.error, undefined);
      assert.equal(actual.finalUrl, origin + recovery);
      assert.equal(actual.finalStatus, 200);
      assert.equal(actual.recoveryReady, true);
    }
    assert.equal(calls.length, 5);
  }

  for(const location of [OFFICIAL + recovery, 'https://example.com/recuperar-progresso/',
    'http://volante-de-ouro.pages.dev/recuperar-progresso/', '/index.html',
    '/recuperar-progresso-outra', recovery + '?token=novo', recovery + '#alterado',
    'https://usuario@volante-de-ouro.pages.dev/recuperar-progresso/']){
    let calls = 0;
    const actual = await request(OLD + recovery, 'GET', true, async () => {
      calls++;
      return response(301, location);
    });
    assert.ok(actual.error, location);
    assert.equal(calls, 1, 'Não deve acessar destinos fora da origem/rota permitida');
  }

  let calls = 0;
  const loop = await request(OLD + '/recuperar-progresso', 'GET', true, async url => {
    calls++;
    return response(301, url.endsWith('/') ? '/recuperar-progresso' : recovery);
  });
  assert.match(loop.error, /Loop/);
  assert.equal(calls, 2);

  const noLocation = await request(OLD + recovery, 'GET', true, async () => response(301));
  assert.match(noLocation.error, /sem Location/);
  const query = '?idioma=ja&tag=1&tag=2&nome=a%2Bb';
  const withQuery = await request(OLD + '/recuperar-progresso' + query, 'GET', true,
    async url => url === OLD + recovery + query ? response(200) : response(308, recovery + query));
  assert.equal(withQuery.recoveryReady, true);
  assert.equal(withQuery.finalUrl, OLD + recovery + query);
  for(const origin of [OLD, OFFICIAL]){
    let requests = 0;
    const escapedAfterCanonical = await request(origin + '/recuperar-progresso', 'GET', true, async () => {
      requests++;
      return requests === 1 ? response(308, recovery) :
        response(301, (origin === OLD ? OFFICIAL : OLD) + recovery);
    });
    assert.match(escapedAfterCanonical.error, /sair da origem/);
    assert.equal(requests, 2, 'Não deve seguir troca de domínio mesmo após canonicalização válida');
  }
  const fallback = await request(OLD + recovery, 'GET', true, async () => response(200, null, '<title>Jogo</title>'));
  assert.equal(fallback.recoveryReady, false);
  const error = await request(OLD + '/', 'HEAD', false, async () => {
    throw new TypeError('fetch failed', { cause:{ code:'UND_ERR_CONNECT_TIMEOUT' } });
  });
  assert.equal(error.errorCode, 'UND_ERR_CONNECT_TIMEOUT');

  let active = 0, maximum = 0;
  const seen = new Set();
  const fetchHealthy = async (url, options) => {
    active++;
    maximum = Math.max(maximum, active);
    seen.add(options.method + ' ' + url);
    await new Promise(resolve => setTimeout(resolve, 2));
    active--;
    const parsed = new URL(url);
    if(aliases.includes(parsed.pathname)) return response(200);
    return parsed.origin === OLD ? response(301, OFFICIAL + parsed.pathname + parsed.search) : response(200);
  };
  const verified = await runChecks({ fetchImpl:fetchHealthy });
  assert.equal(verified.results.length, 22);
  assert.ok(verified.results.every(item => item.ok), JSON.stringify(verified.results.filter(item => !item.ok)));
  assert.equal(maximum, 4);
  for(const origin of [OLD, OFFICIAL]) for(const alias of aliases) assert.ok(seen.has('GET ' + origin + alias));

  const baseline = await runChecks({ baseline:true, fetchImpl:async () => response(200, null, '<title>Jogo</title>') });
  assert.ok(baseline.results.every(item => item.observed && item.ok === undefined));
  assert.doesNotMatch(formatReport(baseline), /[✓✗]/);
  assert.match(formatReport(baseline), /não comprova/);
  const missing = await runChecks({ fetchImpl:async () => response(200, null, '<title>Jogo</title>') });
  assert.ok(missing.results.some(item => item.errors.some(message => /fallback/.test(message))));
  console.log('verificador de domínio: aliases, origem, loops, marcador, concorrência e observação validados');
}

test().catch(error => { console.error(error); process.exitCode = 1; });
