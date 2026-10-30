/* Rotas HTTP das salas (/api/salas*): política de Origin com CORS, limite de corpo,
   limite de criação por IP e o encaminhamento para o Durable Object da sala (um por
   código). O Worker só valida a forma do pedido; as regras da sala ficam em sala.js. */

const ALFABETO = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const TAMANHO_CODIGO = 8;
const RE_CODIGO = /^[2-9A-HJKMNP-Z]{8}$/;
const MAX_CORPO = 2048;
const TENTATIVAS_CODIGO = 3;

function json(corpo, status, cors){
  return Response.json(corpo, { status, headers: cors || {} });
}

function origensPermitidas(env){
  return String(env.ORIGENS || '').split(',').map(s => s.trim()).filter(Boolean);
}

/* descarta os bytes de 248 a 255: com 31 letras, o resto da divisão favoreceria as 8 primeiras */
function novoCodigo(){
  const teto = 256 - (256 % ALFABETO.length);
  let c = '';
  while(c.length < TAMANHO_CODIGO){
    for(const x of crypto.getRandomValues(new Uint8Array(TAMANHO_CODIGO))){
      if(x < teto && c.length < TAMANHO_CODIGO) c += ALFABETO[x % ALFABETO.length];
    }
  }
  return c;
}

/* lê o corpo como JSON de até 2048 bytes; devolve o objeto ou null */
async function lerCorpo(request){
  const declarado = Number(request.headers.get('content-length'));
  if(declarado > MAX_CORPO) return null;
  const bruto = new Uint8Array(await request.arrayBuffer());
  if(bruto.length === 0 || bruto.length > MAX_CORPO) return null;
  try{
    const o = JSON.parse(new TextDecoder().decode(bruto));
    return o && typeof o === 'object' && !Array.isArray(o) ? o : null;
  }catch(e){ return null; }
}

/* repassa ao Durable Object como pedido interno e devolve o status e o JSON dele */
async function paraSala(env, codigo, caminho, corpo){
  const stub = env.SALAS.get(env.SALAS.idFromName(codigo));
  const r = await stub.fetch('https://sala' + caminho, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(corpo)
  });
  let dados = null;
  try{ dados = await r.json(); }catch(e){ dados = { erro: 'sala' }; }
  return { status: r.status, dados };
}

export async function rotasSalas(request, env, url){
  const origem = request.headers.get('Origin');
  let cors = {};
  if(origem){
    if(!origensPermitidas(env).includes(origem)) return json({ erro: 'origem' }, 403);
    cors = {
      'Access-Control-Allow-Origin': origem,
      'Vary': 'Origin',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'content-type'
    };
  }
  if(request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

  const partes = url.pathname.split('/').filter(Boolean);   // ['api','salas', codigo?, acao?]

  // POST /api/salas
  if(partes.length === 2){
    if(request.method !== 'POST') return json({ erro: 'metodo' }, 405, cors);
    const corpo = await lerCorpo(request);
    if(!corpo) return json({ erro: 'corpo' }, 400, cors);
    if(env.LIMITE_SALAS){
      const ip = request.headers.get('CF-Connecting-IP') || 'local';
      const { success } = await env.LIMITE_SALAS.limit({ key: ip });
      if(!success) return json({ erro: 'limite' }, 429, cors);
    }
    for(let i = 0; i < TENTATIVAS_CODIGO; i++){
      const codigo = novoCodigo();
      const r = await paraSala(env, codigo, '/criar', { codigo, nome: corpo.nome, modo: corpo.modo, versao: corpo.versao });
      if(r.status === 409 && r.dados && r.dados.erro === 'existe') continue;
      return json(r.dados, r.status, cors);
    }
    return json({ erro: 'codigo' }, 503, cors);
  }

  if(partes.length === 4){
    const codigo = partes[2].toUpperCase();
    if(!RE_CODIGO.test(codigo)) return json({ erro: 'codigo' }, 400, cors);

    // POST /api/salas/:codigo/entrar
    if(partes[3] === 'entrar'){
      if(request.method !== 'POST') return json({ erro: 'metodo' }, 405, cors);
      const corpo = await lerCorpo(request);
      if(!corpo) return json({ erro: 'corpo' }, 400, cors);
      const r = await paraSala(env, codigo, '/entrar', { codigo, nome: corpo.nome, versao: corpo.versao });
      return json(r.dados, r.status, cors);
    }

    // GET /api/salas/:codigo/ws
    if(partes[3] === 'ws'){
      if(request.method !== 'GET' || request.headers.get('Upgrade') !== 'websocket')
        return json({ erro: 'websocket' }, 426, cors);
      const stub = env.SALAS.get(env.SALAS.idFromName(codigo));
      return stub.fetch(request);
    }
  }
  return json({ erro: 'rota' }, 404, cors);
}
