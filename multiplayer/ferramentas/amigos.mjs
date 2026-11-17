/* Testar o multiplayer com amigos SEM publicar nada: serve o site desta pasta e leva /api (e o
   WebSocket) para o servidor local (wrangler dev, porta 8787), tudo atrás de uma porta só (4400).
   Um túnel (ssh -R) dá a essa porta um endereço https para os amigos; veja o amigos.bat.
   O servidor local só aceita o Origin de 127.0.0.1:4338, então o Origin é reescrito aqui.
   Uso: node ferramentas/amigos.mjs */
import http from 'node:http';
import net from 'node:net';
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve(import.meta.dirname, '..', '..');
const PORTA = 4400, API = 8787, ORIGEM = 'http://127.0.0.1:4338';
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.gif': 'image/gif',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.mp4': 'video/mp4', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8' };
const PROIBIDO = new Set(['.git', 'multiplayer', 'node_modules', '.claude', '.wrangler']);
/* o servidor local vê o endereço de antes, e o site avisa onde fica o servidor (um script com atributo não entra no hash da versão) */
const INJETA = '<script data-amigos>window.VDO_MP_SERVIDOR=location.origin</script>';

const servidor = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if(url.pathname.startsWith('/api/')){
    const h = Object.assign({}, req.headers, { host: '127.0.0.1:' + API, origin: ORIGEM });
    const p = http.request({ host: '127.0.0.1', port: API, method: req.method, path: req.url, headers: h }, r => { res.writeHead(r.statusCode, r.headers); r.pipe(res); });
    p.on('error', () => { res.writeHead(502); res.end('servidor do multiplayer fora do ar'); });
    return req.pipe(p);
  }
  let rel = decodeURIComponent(url.pathname); if(rel.endsWith('/')) rel += 'index.html';
  const arq = path.normalize(path.join(RAIZ, rel));
  const partes = path.relative(RAIZ, arq).split(path.sep);
  if(arq !== RAIZ && (!arq.startsWith(RAIZ) || partes.some(x => PROIBIDO.has(x)))){ res.writeHead(403); return res.end('proibido'); }
  fs.readFile(arq, (e, dados) => {
    if(e){ res.writeHead(404); return res.end('não achei'); }
    const ext = path.extname(arq).toLowerCase();
    if(ext === '.html') dados = Buffer.from(dados.toString('utf8').replace('</head>', INJETA + '</head>'), 'utf8');
    res.writeHead(200, { 'content-type': TIPOS[ext] || 'application/octet-stream', 'cache-control': 'no-cache' });
    res.end(dados);
  });
});

/* o WebSocket das salas: repassa o pedido com o Origin trocado e liga os dois lados */
servidor.on('upgrade', (req, sock, head) => {
  const up = net.connect(API, '127.0.0.1', () => {
    let txt = `${req.method} ${req.url} HTTP/1.1\r\n`;
    for(let i = 0; i < req.rawHeaders.length; i += 2){
      const k = req.rawHeaders[i], kl = k.toLowerCase();
      txt += kl === 'host' ? `Host: 127.0.0.1:${API}\r\n` : kl === 'origin' ? `Origin: ${ORIGEM}\r\n` : `${k}: ${req.rawHeaders[i + 1]}\r\n`;
    }
    up.write(txt + '\r\n'); if(head && head.length) up.write(head);
    sock.pipe(up); up.pipe(sock);
  });
  up.on('error', () => sock.destroy()); sock.on('error', () => up.destroy());
});

servidor.listen(PORTA, '127.0.0.1', () => console.log(`site + multiplayer em http://127.0.0.1:${PORTA} (servidor local esperado na porta ${API})`));
