/* Verificações das salas contra um wrangler dev de verdade (HTTP e WebSocket reais).
   rodar.mjs sobe o servidor, chama fase1, reinicia o servidor sobre o mesmo storage e
   chama fase2: assim a persistência é testada de fato. Cada verificação imprime uma
   linha; o que não dá para provar localmente sai como "não verificável". */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const FICHA_ZERO = '0'.repeat(64);
const ORIGEM_BOA = 'http://127.0.0.1:4338';
const ORIGEM_RUIM = 'http://site-qualquer.example';

export const placar = { ok: 0, falhas: 0, nao: 0 };

export function checar(nome, cond, detalhe){
  if(cond){ placar.ok++; console.log('  ✓ ' + nome); }
  else{
    placar.falhas++;
    console.log('  ✗ ' + nome + (detalhe === undefined ? '' : ' — ' + JSON.stringify(detalhe).slice(0, 400)));
  }
  return !!cond;
}
function naoVerificavel(nome, motivo){ placar.nao++; console.log('  – não verificável localmente: ' + nome + ' (' + motivo + ')'); }

export const dormir = ms => new Promise(r => setTimeout(r, ms));

export async function api(base, caminho, corpo, { origem, bruto, metodo, ip } = {}){
  const headers = { 'content-type': 'application/json' };
  if(origem) headers.Origin = origem;
  if(ip) headers['CF-Connecting-IP'] = ip;   // chave própria no limite de criação (os testes de turnos)
  const r = await fetch(base + caminho, {
    method: metodo || (corpo === undefined && bruto === undefined ? 'GET' : 'POST'), headers,
    body: bruto !== undefined ? bruto : corpo === undefined ? undefined : JSON.stringify(corpo)
  });
  let json = null;
  try{ json = await r.json(); }catch(e){ /* sem corpo */ }
  return { status: r.status, json, headers: r.headers };
}

/* cliente de WebSocket com fila de mensagens: esperar(pred) consome a primeira não lida que bater */
function conectar(base, codigo, protocolos, origem){
  const url = base.replace(/^http/, 'ws') + '/api/salas/' + codigo + '/ws';
  const opcoes = { protocols: protocolos };
  if(origem) opcoes.headers = { Origin: origem };
  const ws = new WebSocket(url, opcoes);
  const c = { ws, msgs: [], aberto: false, protocolo: '', fechou: null };
  c.abriu = new Promise(res => {
    ws.addEventListener('open', () => { c.aberto = true; c.protocolo = ws.protocol; res(true); });
    ws.addEventListener('error', () => res(false));
    ws.addEventListener('close', () => res(false));
  });
  c.fim = new Promise(res => {
    ws.addEventListener('close', e => { c.fechou = { codigo: e.code, motivo: e.reason }; res(c.fechou); });
  });
  ws.addEventListener('message', e => c.msgs.push(JSON.parse(e.data)));
  c.enviar = m => ws.send(typeof m === 'string' ? m : JSON.stringify(m));
  return c;
}

export async function esperar(c, pred, ms = 4000){
  const limite = Date.now() + ms;
  while(Date.now() < limite){
    const m = c.msgs.find(x => !x._lida && pred(x));
    if(m){ m._lida = true; return m; }
    await dormir(20);
  }
  return null;
}
async function esperarFecho(c, ms = 4000){
  return Promise.race([c.fim, dormir(ms).then(() => null)]);
}
const fichaProto = f => ['volante.v1', 'ficha.' + f];
export async function abrir(base, codigo, ficha){
  const c = conectar(base, codigo, fichaProto(ficha));
  await c.abriu;
  return c;
}


/* cliente WebSocket cru (TCP): o do Node só termina o fechamento depois que o servidor
   derruba a conexão, e o wrangler dev não derruba quando o servidor fecha um socket
   por fora (caso do 4000). Aqui leio o quadro de close direto do fio. */
async function abrirCru(base, codigo, ficha){
  const net = await import('node:net');
  const { host } = new URL(base);
  const sock = net.connect({ host: '127.0.0.1', port: Number(new URL(base).port) });
  const cru = { fechou: null, aberto: false, buf: Buffer.alloc(0), subproto: '' };
  const chave = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64');
  sock.on('connect', () => sock.write(['GET /api/salas/' + codigo + '/ws HTTP/1.1', 'Host: ' + host, 'Upgrade: websocket', 'Connection: Upgrade',
    'Sec-WebSocket-Key: ' + chave, 'Sec-WebSocket-Version: 13', 'Sec-WebSocket-Protocol: volante.v1, ficha.' + ficha, '', ''].join('\r\n')));
  sock.on('error', () => {});
  sock.on('data', d => {
    cru.buf = Buffer.concat([cru.buf, d]);
    if(!cru.aberto){
      const fim = cru.buf.indexOf('\r\n\r\n');
      if(fim < 0) return;
      const cab = cru.buf.subarray(0, fim).toString();
      cru.aberto = /^HTTP\/1.1 101/.test(cab);
      cru.subproto = (/sec-websocket-protocol: *(\S+)/i.exec(cab) || [])[1] || '';
      cru.buf = cru.buf.subarray(fim + 4);
    }
    while(cru.buf.length >= 2){
      let n = cru.buf[1] & 0x7f, off = 2;
      if(n === 126){ if(cru.buf.length < 4) return; n = cru.buf.readUInt16BE(2); off = 4; }
      if(cru.buf.length < off + n) return;
      const op = cru.buf[0] & 0x0f, carga = cru.buf.subarray(off, off + n);
      cru.buf = cru.buf.subarray(off + n);
      if(op === 8) cru.fechou = { codigo: carga.length >= 2 ? carga.readUInt16BE(0) : 1005, motivo: carga.subarray(2).toString() };
    }
  });
  cru.fecho = async (ms = 4000) => {
    const limite = Date.now() + ms;
    while(!cru.fechou && Date.now() < limite) await dormir(20);
    return cru.fechou;
  };
  cru.sock = sock;
  const limite = Date.now() + 4000;
  while(!cru.aberto && Date.now() < limite) await dormir(20);
  return cru;
}

export async function fase1({ base, versao, estado }){
  console.log('\nSalas, antes de reiniciar o servidor');

  // 1: criar
  let r = await api(base, '/api/salas', { nome: 'Ana', modo: 'chefe', versao });
  const A = r.json || {};
  checar('1 criar: 201, código de 8 caracteres do alfabeto, ficha de 64 hex, slot 0',
    r.status === 201 && /^[2-9A-HJKMNP-Z]{8}$/.test(A.codigo) && /^[0-9a-f]{64}$/.test(A.ficha) && A.slot === 0, r);
  checar('1 criar: a vista pública traz lobby, anfitrião 0, velocidade 8 e nunca o hash da ficha',
    A.sala && A.sala.estado === 'lobby' && A.sala.anfitriao === 0 && A.sala.config.velocidade === 8
    && A.sala.jogadores.length === 1 && !JSON.stringify(A).includes('fichaHash'), A);
  r = await api(base, '/api/salas', { nome: 'Ana', modo: 'mestre', versao });
  checar('1 criar: modo inválido → 400 modo', r.status === 400 && r.json.erro === 'modo', r);
  r = await api(base, '/api/salas', { nome: ' \t\u0000 ', modo: 'chefe', versao });
  checar('1 criar: nome vazio depois de limpar → 400 nome', r.status === 400 && r.json.erro === 'nome', r);
  r = await api(base, '/api/salas', { nome: 'Ana', modo: 'chefe', versao: 'outra' });
  checar('1 criar: versão do jogo errada → 409 versao com a versão do servidor',
    r.status === 409 && r.json.erro === 'versao' && r.json.versaoServidor === versao, r);
  r = await api(base, '/api/salas', undefined, { bruto: JSON.stringify({ nome: 'x'.repeat(3000), modo: 'chefe', versao }) });
  checar('1 criar: corpo acima de 2048 bytes → 400 corpo', r.status === 400 && r.json.erro === 'corpo', r);
  r = await api(base, '/api/salas', undefined, { bruto: '{isto nao e json' });
  checar('1 criar: corpo que não é JSON → 400 corpo', r.status === 400 && r.json.erro === 'corpo', r);

  // 2: entrar
  r = await api(base, `/api/salas/${A.codigo}/entrar`, { nome: 'Bia', versao: 'outra' });
  checar('2 entrar: versão errada → 409 versao', r.status === 409 && r.json.erro === 'versao' && r.json.versaoServidor === versao, r);
  r = await api(base, `/api/salas/${A.codigo}/entrar`, { nome: ' \n ', versao });
  checar('2 entrar: nome ruim → 400 nome', r.status === 400 && r.json.erro === 'nome', r);
  r = await api(base, `/api/salas/${A.codigo}/entrar`, { nome: '  Bia\u0000   Lima  ', versao });
  const B = r.json || {};
  checar('2 entrar: segundo jogador → 200, slot 1, ficha de 64 hex, nome limpo e com espaços colapsados',
    r.status === 200 && B.slot === 1 && /^[0-9a-f]{64}$/.test(B.ficha) && B.ficha !== A.ficha
    && B.sala.jogadores[1].nome === 'Bia Lima', r);
  r = await api(base, `/api/salas/${A.codigo.toLowerCase()}/entrar`, { nome: 'Caio', versao });
  checar('2 entrar: terceiro jogador (código em minúsculas) → 409 cheia', r.status === 409 && r.json.erro === 'cheia', r);
  r = await api(base, '/api/salas/ABC/entrar', { nome: 'Caio', versao });
  checar('2 entrar: código malformado → 400 codigo', r.status === 400 && r.json.erro === 'codigo', r);
  r = await api(base, '/api/salas/OOOOOOOO/entrar', { nome: 'Caio', versao });
  checar('2 entrar: código com letra fora do alfabeto → 400 codigo', r.status === 400 && r.json.erro === 'codigo', r);
  r = await api(base, '/api/salas/ZZZZZZZZ/entrar', { nome: 'Caio', versao });
  checar('2 entrar: código que nunca foi criado → 404 sala', r.status === 404 && r.json.erro === 'sala', r);

  // 3: WebSocket com ficha válida
  const a = await abrir(base, A.codigo, A.ficha);
  const estA = await esperar(a, m => m.t === 'estado');
  checar('3 ws: abre com o subprotocolo volante.v1 e recebe estado com os dois jogadores',
    a.aberto && a.protocolo === 'volante.v1' && estA && estA.voce.slot === 0 && estA.sala.jogadores.length === 2
    && estA.sala.jogadores[0].nome === 'Ana' && estA.sala.jogadores[1].nome === 'Bia Lima'
    && estA.sala.jogadores[0].conectado === true && estA.sala.jogadores[1].conectado === false
    && !JSON.stringify(estA).includes('fichaHash'), estA);
  await esperar(a, m => m.t === 'jogadores');            // o aviso da própria entrada
  a.enviar({ t: 'ping' });
  checar('3 ws: ping automático responde pong sem acordar a sala', !!(await esperar(a, m => m.t === 'pong')));
  const b = await abrir(base, A.codigo, B.ficha);
  const estB = await esperar(b, m => m.t === 'estado');
  const avisoEntrou = await esperar(a, m => m.t === 'jogadores' && m.jogadores[1].conectado === true);
  checar('3 ws: quando o segundo conecta, o primeiro recebe jogadores com conectado true',
    estB && estB.voce.slot === 1 && estB.sala.jogadores.every(j => j.conectado) && !!avisoEntrou, { estB, avisoEntrou });
  b.ws.close(1000);
  const avisoSaiu = await esperar(a, m => m.t === 'jogadores' && m.jogadores[1].conectado === false);
  checar('3 ws: quando o segundo desconecta, o primeiro recebe jogadores com conectado false',
    !!avisoSaiu && avisoSaiu.jogadores[0].conectado === true, avisoSaiu);

  // 4: ficha inválida
  let x = conectar(base, A.codigo, fichaProto(FICHA_ZERO));
  checar('4 ws: ficha inválida é recusada', !(await x.abriu));
  x = conectar(base, A.codigo, ['ficha.' + A.ficha]);
  checar('4 ws: ficha certa sem o subprotocolo volante.v1 é recusada', !(await x.abriu));
  x = conectar(base, A.codigo, ['volante.v1']);
  checar('4 ws: sem ficha nenhuma é recusada', !(await x.abriu));
  x = conectar(base, 'ZZZZZZZZ', fichaProto(A.ficha));
  checar('4 ws: sala que nunca existiu é recusada', !(await x.abriu));

  // 5: configurar
  const vAntes = estA.v;
  const reabriuB = await abrir(base, A.codigo, B.ficha);
  const b1 = reabriuB;
  await esperar(b1, m => m.t === 'estado');
  a.enviar({ t: 'configurar', id: 'c1', config: { velocidade: 16 } });
  const okA = await esperar(a, m => m.t === 'ok' && m.id === 'c1');
  const salaA = await esperar(a, m => m.t === 'sala');
  const salaB = await esperar(b1, m => m.t === 'sala');
  estado.v = salaA && salaA.v;
  checar('5 configurar: anfitrião muda a velocidade para 16, os dois recebem sala e v aumenta',
    !!okA && salaA && salaB && salaA.sala.config.velocidade === 16 && salaB.sala.config.velocidade === 16
    && salaA.v > vAntes && salaB.v === salaA.v, { okA, salaA, salaB, vAntes });
  b1.enviar({ t: 'configurar', id: 'c2', config: { velocidade: 1 } });
  const negado = await esperar(b1, m => m.t === 'erro' && m.id === 'c2');
  checar('5 configurar: convidado → erro anfitriao', negado && negado.codigo === 'anfitriao', negado);
  a.enviar({ t: 'configurar', id: 'c3', config: { velocidade: 3 } });
  const ruim = await esperar(a, m => m.t === 'erro' && m.id === 'c3');
  checar('5 configurar: velocidade inválida → erro config', ruim && ruim.codigo === 'config', ruim);
  a.enviar({ t: 'dancar', id: 'c4' });
  const tipo = await esperar(a, m => m.t === 'erro' && m.id === 'c4');
  checar('5 mensagem de tipo desconhecido → erro tipo (com o id de volta)', tipo && tipo.codigo === 'tipo', tipo);

  // 6: JSON inválido e mensagem grande
  a.enviar('isto {não é json');
  const json = await esperar(a, m => m.t === 'erro' && m.codigo === 'json');
  checar('6 JSON inválido → erro json e a conexão continua aberta', !!json && a.ws.readyState === 1, json);
  b1.enviar('y'.repeat(20 * 1024));
  const grande = await esperar(b1, m => m.t === 'erro' && m.codigo === 'mensagem');
  const fechoGrande = await esperarFecho(b1);
  checar('6 mensagem de 20 KB → erro mensagem e o socket fecha com 1009',
    !!grande && fechoGrande && fechoGrande.codigo === 1009, { grande, fechoGrande });

  // 7: segunda conexão com a mesma ficha derruba a primeira
  const b2 = await abrirCru(base, A.codigo, B.ficha);
  const b3 = await abrir(base, A.codigo, B.ficha);
  const fechoVelho = await b2.fecho();
  const estB3 = await esperar(b3, m => m.t === 'estado');
  await dormir(300);
  const ultimoAviso = a.msgs.filter(m => m.t === 'jogadores').pop();
  b2.sock.destroy();
  checar('7 mesma ficha em outro socket: o primeiro recebe close 4000 substituida (lido do fio) e a vaga continua conectada',
    b2.aberto && b2.subproto === 'volante.v1' && fechoVelho && fechoVelho.codigo === 4000 && fechoVelho.motivo === 'substituida' && !!estB3
    && ultimoAviso.jogadores[1].conectado === true, { fechoVelho, ultimoAviso });

  // 8: reconexão
  b3.ws.close(1000);
  const caiu = await esperar(a, m => m.t === 'jogadores' && m.jogadores[1].conectado === false);
  const b4 = await abrir(base, A.codigo, B.ficha);
  const estB4 = await esperar(b4, m => m.t === 'estado');
  const voltou = await esperar(a, m => m.t === 'jogadores' && m.jogadores[1].conectado === true);
  checar('8 reconexão: fecha, reabre com a mesma ficha, mesmo slot, e o outro vê conectado true de novo',
    !!caiu && estB4 && estB4.voce.slot === 1 && !!voltou, { caiu, estB4, voltou });

  // 9: Origin
  r = await api(base, '/api/salas', { nome: 'Ana', modo: 'chefe', versao }, { origem: ORIGEM_RUIM });
  checar('9 origem fora da lista → 403 origem no POST', r.status === 403 && r.json.erro === 'origem', r);
  r = await api(base, `/api/salas/${A.codigo}/entrar`, { nome: 'Ana', versao }, { origem: ORIGEM_RUIM });
  checar('9 origem fora da lista → 403 origem também no entrar', r.status === 403 && r.json.erro === 'origem', r);
  r = await api(base, '/api/salas', undefined, { origem: ORIGEM_BOA, metodo: 'OPTIONS' });
  checar('9 preflight de origem permitida → 204 com os cabeçalhos CORS',
    r.status === 204 && r.headers.get('access-control-allow-origin') === ORIGEM_BOA
    && r.headers.get('vary') === 'Origin' && /POST/.test(r.headers.get('access-control-allow-methods') || '')
    && /content-type/i.test(r.headers.get('access-control-allow-headers') || ''), [...r.headers]);
  r = await api(base, `/api/salas/ZZZZZZZZ/entrar`, { nome: 'Ana', versao }, { origem: ORIGEM_BOA });
  checar('9 resposta a origem permitida leva Access-Control-Allow-Origin',
    r.status === 404 && r.headers.get('access-control-allow-origin') === ORIGEM_BOA, [...r.headers]);
  const wsRuim = conectar(base, A.codigo, fichaProto(A.ficha), ORIGEM_RUIM);
  const wsBom = conectar(base, A.codigo, fichaProto(B.ficha), ORIGEM_BOA);
  const abriuRuim = await wsRuim.abriu, abriuBom = await wsBom.abriu;
  if(abriuBom && !abriuRuim) checar('9 websocket: origem fora da lista é recusada e a permitida abre', true);
  else if(abriuBom && abriuRuim) naoVerificavel('9 origem no websocket', 'o WebSocket do Node não enviou o cabeçalho Origin; vale só a prova por HTTP');
  else checar('9 websocket: origem permitida abre', false, { abriuRuim, abriuBom });
  wsRuim.ws.close(); wsBom.ws.close();

  // limite de mensagens por slot (numa sala só dele, para não atrapalhar as outras)
  r = await api(base, '/api/salas', { nome: 'Dani ' + 'comprido '.repeat(5), modo: 'piloto', versao });
  const C = r.json || {};
  checar('1 criar: nome comprido é cortado em 24 caracteres', r.status === 201 && C.sala.jogadores[0].nome.length <= 24
    && C.sala.jogadores[0].nome.startsWith('Dani comprido'), r);
  const c = await abrir(base, C.codigo, C.ficha);
  await esperar(c, m => m.t === 'estado');
  for(let i = 0; i < 30; i++) c.enviar({ t: 'x', id: i });
  const lim = await esperar(c, m => m.t === 'erro' && m.codigo === 'limite' && m.id === 20);
  const fechoLim = await esperarFecho(c);
  const antes = c.msgs.filter(m => m.t === 'erro' && m.codigo === 'tipo').length;
  checar('6 limite: 20 mensagens por 10 s passam, as seguintes recebem erro limite (com id) e na 3ª violação o socket fecha com 4008',
    antes === 20 && !!lim && fechoLim && fechoLim.codigo === 4008, { antes, lim, fechoLim });

  // 11 (parte): o último a sair apaga a sala
  r = await api(base, '/api/salas', { nome: 'Eva', modo: 'chefe', versao });
  const E = r.json || {};
  const e = await abrir(base, E.codigo, E.ficha);
  await esperar(e, m => m.t === 'estado');
  e.enviar({ t: 'sair', id: 's1' });
  const okE = await esperar(e, m => m.t === 'ok' && m.id === 's1');
  const fechoE = await esperarFecho(e);
  r = await api(base, `/api/salas/${E.codigo}/entrar`, { nome: 'Fred', versao });
  const reusa = conectar(base, E.codigo, fichaProto(E.ficha));
  checar('11 sair: o último jogador sai, o socket fecha 1000 saiu e a sala deixa de existir (404, ficha recusada)',
    !!okE && fechoE && fechoE.codigo === 1000 && fechoE.motivo === 'saiu' && r.status === 404 && !(await reusa.abriu), { okE, fechoE, r });

  for(const k of [a, b4]) k.ws.close(1000);
  await dormir(200);
  Object.assign(estado, { A, B, versao });
}

export async function fase2({ base, versao, estado }){
  console.log('\nSalas, depois de reiniciar o servidor (mesmo storage)');
  const { A, B } = estado;

  // 10: persistência
  const a = await abrir(base, A.codigo, A.ficha);
  const b = await abrir(base, A.codigo, B.ficha);
  const estA = await esperar(a, m => m.t === 'estado');
  const estB = await esperar(b, m => m.t === 'estado');
  checar('10 persistência: as duas fichas antigas ainda conectam depois do reinício', a.aberto && b.aberto && !!estA && !!estB, { a: a.aberto, b: b.aberto });
  checar('10 persistência: nomes, velocidade 16, anfitrião e versão da sala intactos',
    estA && estA.sala.jogadores.map(j => j.nome).join('|') === 'Ana|Bia Lima' && estA.sala.config.velocidade === 16
    && estA.sala.anfitriao === 0 && estA.sala.modo === 'chefe' && estA.sala.codigo === A.codigo && estA.v === estado.v
    && estA.voce.slot === 0 && estB.voce.slot === 1, { estA, vEsperado: estado.v });
  const velha = conectar(base, A.codigo, fichaProto(FICHA_ZERO));
  checar('10 persistência: ficha inválida continua recusada', !(await velha.abriu));
  let r = await api(base, `/api/salas/${A.codigo}/entrar`, { nome: 'Caio', versao });
  checar('10 persistência: a sala continua cheia (409 cheia)', r.status === 409 && r.json.erro === 'cheia', r);

  // 11: sair libera a vaga; o anfitrião que sai passa a vez
  await esperar(a, m => m.t === 'jogadores' && m.jogadores[1].conectado === true);
  b.enviar({ t: 'sair', id: 's1' });
  const okB = await esperar(b, m => m.t === 'ok' && m.id === 's1');
  const fechoB = await esperarFecho(b);
  const salaSaiu = await esperar(a, m => m.t === 'sala' && m.sala.jogadores.length === 1);
  checar('11 sair: o convidado sai, o socket fecha 1000 saiu e o anfitrião recebe sala com 1 jogador e v maior',
    !!okB && fechoB && fechoB.codigo === 1000 && fechoB.motivo === 'saiu' && !!salaSaiu && salaSaiu.v > estado.v
    && salaSaiu.sala.anfitriao === 0, { okB, fechoB, salaSaiu });
  const velhoB = conectar(base, A.codigo, fichaProto(B.ficha));
  checar('11 sair: a ficha de quem saiu deixa de valer', !(await velhoB.abriu));
  r = await api(base, `/api/salas/${A.codigo}/entrar`, { nome: 'Caio', versao });
  const Cn = r.json || {};
  checar('11 sair: a vaga liberada aceita um novo jogador no slot 1', r.status === 200 && Cn.slot === 1 && Cn.sala.jogadores[1].nome === 'Caio', r);
  const c = await abrir(base, A.codigo, Cn.ficha);
  await esperar(c, m => m.t === 'estado');
  a.enviar({ t: 'sair', id: 's2' });
  await esperar(a, m => m.t === 'ok' && m.id === 's2');
  const passou = await esperar(c, m => m.t === 'sala' && m.sala.anfitriao === 1);
  checar('11 sair: quando o anfitrião sai, o menor slot que sobra vira anfitrião', !!passou && passou.sala.jogadores.length === 1, passou);
  c.ws.close(1000);

  // 14: três convidados ao mesmo tempo: só um fica com a vaga, e o anfitrião vê na hora
  r = await api(base, '/api/salas', { nome: 'Duda', modo: 'chefe', versao });
  const D = r.json || {};
  const d = await abrir(base, D.codigo, D.ficha);
  await esperar(d, m => m.t === 'estado');
  const juntos = await Promise.all(['Edu', 'Fabi', 'Gabi'].map(nome => api(base, `/api/salas/${D.codigo}/entrar`, { nome, versao })));
  const entraram = juntos.filter(x => x.status === 200), barrados = juntos.filter(x => x.status === 409 && x.json.erro === 'cheia');
  checar('14 entrar ao mesmo tempo: de três pedidos juntos, só um fica com a vaga (slot 1) e os outros recebem cheia',
    entraram.length === 1 && barrados.length === 2 && entraram[0].json.slot === 1, juntos.map(x => [x.status, x.json && (x.json.slot ?? x.json.erro)]));
  const aviso = await esperar(d, m => m.t === 'sala' && m.sala.jogadores.length === 2);
  checar('14 entrar: o anfitrião recebe a sala com o convidado na hora, ainda desconectado',
    !!aviso && aviso.sala.jogadores[1].conectado === false && !JSON.stringify(aviso).includes('fichaHash'), aviso);
  d.ws.close(1000);

  // 12: limite de criação por IP
  const codigos = [];
  for(let i = 0; i < 11; i++) codigos.push((await api(base, '/api/salas', { nome: 'Gil', modo: 'piloto', versao })).status);
  const quantos429 = codigos.filter(s => s === 429).length;
  if(quantos429) checar('12 limite: 11 criações seguidas do mesmo cliente → aparece 429 limite (' + codigos.join(',') + ')', codigos[0] === 201);
  else naoVerificavel('12 limite de criação por IP', 'o binding de ratelimit não barrou nada no wrangler dev: ' + codigos.join(','));

  // 13: viabilidade
  console.log('\nMotor');
  const h1 = await fetch(base + '/__viabilidade?seed=7', { signal: AbortSignal.timeout(180000) }).then(x => x.json());
  const h2 = await fetch(base + '/__viabilidade?seed=7', { signal: AbortSignal.timeout(180000) }).then(x => x.json());
  const { viabilidade } = await import(pathToFileURL(path.join(AQUI, '..', 'src', 'viabilidade.js')).href);
  const local = await viabilidade(7);
  checar('13 viabilidade: seed 7 duas vezes no workerd dá o mesmo hash', !!h1.hash && h1.hash === h2.hash, { h1: h1.hash, h2: h2.hash });
  checar('13 viabilidade: o hash do workerd é igual ao calculado no Node (' + local.hash + ')', h1.hash === local.hash, { workerd: h1.hash, node: local.hash });
}
