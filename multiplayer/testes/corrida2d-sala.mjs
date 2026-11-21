/* A corrida 2D numa sala de verdade (Fase 7), contra o wrangler dev: dois clientes Node, cada um com
   a sessão 2D inteira (rede2d.js, Rede.Cliente) e um robô no volante, ligados à sala por WebSocket
   com uma rede de mentira no meio (atraso, variação e perda nos dois sentidos).
   - a sala de piloto com "Pilotando (2D)" abre uma corrida 2D com os dois e a largada espera os dois;
   - mede: ida e volta, quadros por segundo, bytes por segundo, o erro de posição do outro humano;
   - um dos dois cai (o WebSocket fecha) no meio e volta 3 s depois com a mesma ficha: a sala assume
     o carro e devolve;
   - os dois votam para pular: a sala projeta o resto, processa a rodada e o resultado entra nos dois
     campeonatos (a posição de cada um na carreira é a da corrida).
   Uso: node testes/corrida2d-sala.mjs [atrasoMs] [variacaoMs] [perda%] [segundosDeCorrida]
   Sobe um wrangler dev próprio na porta 8792 (storage temporário). */
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checar, dormir, api, esperar, abrir, placar } from './salas.mjs';
import { criarMotor, VERSAO_JOGO } from '../src/gerado/motor-jogo.js';
import { ambienteFalso } from '../src/pagina-falsa.js';

const AQUI = path.dirname(fileURLToPath(import.meta.url)), RAIZ = path.join(AQUI, '..');
const PORTA = 8792, BASE = `http://127.0.0.1:${PORTA}`;
const ATRASO = +(process.argv[2] || 40), VARIA = +(process.argv[3] || 15), PERDA = +(process.argv[4] || 1) / 100, DURA = +(process.argv[5] || 75);
const WRANGLER = path.join(RAIZ, 'node_modules', 'wrangler', 'bin', 'wrangler.js');
const pct = (a, p) => { if(!a.length) return 0; const s = a.slice().sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
const media = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;

/* ── o servidor ── */
function subir(persist){
  const f = spawn(process.execPath, [WRANGLER, 'dev', '--port', String(PORTA), '--ip', '127.0.0.1', '--persist-to', persist, '--show-interactive-dev-session=false'],
    { cwd: RAIZ, stdio: ['ignore', 'pipe', 'pipe'], env: Object.assign({}, process.env, { WRANGLER_SEND_METRICS: 'false', NO_COLOR: '1', FORCE_COLOR: '0' }) });
  f.saida = ''; f.encerrou = false;
  f.stdout.on('data', d => { f.saida += d; }); f.stderr.on('data', d => { f.saida += d; });
  f.on('exit', () => { f.encerrou = true; });
  return f;
}
async function respondendo(){ try { await fetch(BASE + '/nada', { signal: AbortSignal.timeout(1500) }); return true; } catch(e){ return false; } }
async function derrubar(f){
  if(!f || f.encerrou) return;
  try { if(process.platform === 'win32') execFileSync('taskkill', ['/PID', String(f.pid), '/T', '/F'], { stdio: 'ignore' }); else process.kill(f.pid, 'SIGKILL'); } catch(e){}
}

/* ── a rede de mentira: em ordem; um pacote perdido chega 200–300 ms depois e segura os de trás ── */
function canal(){
  let ultimo = 0;
  return fn => {
    const agora = performance.now();
    let t = agora + ATRASO + Math.random() * VARIA;
    if(Math.random() < PERDA) t += 200 + Math.random() * 100;
    t = Math.max(t, ultimo); ultimo = t;
    setTimeout(fn, t - agora);
  };
}

/* ── um jogador: o WebSocket, a sessão 2D e o robô ── */
function novoMotor(){ const amb = ambienteFalso({ seed: 5 }); const J = criarMotor(amb); J.amb = amb; return J; }
function jogador(nome, slot, codigo, ficha){
  const P = { nome, slot, codigo, ficha, c: null, R: null, S: null, eu: null, J: novoMotor(), hist: new Map(), fotos: [], bytes: 0, msgs2d: 0, h2d: 0, parado: false, ida: canal(), volta: canal(), fila: [] };
  P.C2D = P.J.amb.C2D;
  P.conectar = async () => {
    P.c = await abrir(BASE, codigo, ficha);
    P.c.ws.addEventListener('message', e => {
      P.bytes += e.data.length;
      const m = JSON.parse(e.data);
      if(m.t === 'c2dQ' || m.t === 'c2dH' || (m.t === 'corridaInicio' && P.R)) P.volta(() => P.receber2d(m));
    });
  };
  P.receber2d = m => {
    if(!P.R) return;
    if(m.t === 'corridaInicio'){ const c = (m.corridas || []).find(x => x.modo === '2d'); if(c) P.R.receber(c.quadro, performance.now()); return; }
    if(m.t === 'c2dQ') P.msgs2d++; else P.h2d++;
    P.R.receber(m, performance.now());
  };
  P.enviar = m => P.ida(() => { try { P.c.ws.send(JSON.stringify(m)); } catch(e){} });
  P.abrir2d = c => {
    P.k = c.k;
    P.R = P.C2D.Rede.Cliente(c.c2d, { slot, k: c.k, agora: () => performance.now(), enviar: m => { if(!P.parado) P.enviar(m); } });
    P.R.receber(c.quadro, performance.now());
    const carros = c.c2d.carros.map(o => o.dono === String(slot) ? Object.assign({}, o, { assist: { abs: true, tc: true, estab: true, direcao: true, freioAuto: false } }) : o);
    P.S = P.R.sessao(carros); P.eu = P.S.eu;
    P.eu.ia = P.C2D.IA.criar({ ritmo: slot ? .965 : .975, semente: 70 + slot }); P.eu.autopiloto = true;
    P.enviar({ t: 'corrida', id: 'p2d' + slot, k: c.k, tipo: 'pronto2d', dados: {} });
  };
  P.quadro = () => {
    if(!P.S || P.parado) return;
    const n = P.R.relogio.quadro(performance.now());
    for(let k = 0; k < n; k++){ P.C2D.Sessao.passo(P.S, null, P.C2D.DT); P.hist.set(Math.round(P.S.t * 1000), [P.eu.x, P.eu.y]); }
    if(n && P.S.t > 8 && !P.S.acabou) P.fotos.push({ t: Math.round(P.S.t * 1000), carros: P.S.carros.map(c => [c.x, c.y, c.remoto, c.humano, c.estado, c.box ? 1 : 0]) });
  };
  return P;
}

const persist = fs.mkdtempSync(path.join(os.tmpdir(), 'volante-mp2d-'));
let srv = null;
try {
  console.log(`\nCorrida 2D na sala (wrangler dev) · atraso ${ATRASO} ms ±${VARIA} ms · perda ${(PERDA * 100).toFixed(1)}% · ${DURA} s de prova`);
  srv = subir(persist);
  const limite = Date.now() + 90000;
  while(!(await respondendo())){ if(srv.encerrou || Date.now() > limite) throw new Error('o wrangler dev não subiu:\n' + srv.saida.slice(-1500)); await dormir(400); }

  /* a sala: duas tentativas, para o caso de uma lesão da pré-temporada deixar um dos dois fora da 1ª corrida */
  let A, B, a, b, inicio = null;
  for(let tentativa = 0; tentativa < 4 && !inicio; tentativa++){
    let r = await api(BASE, '/api/salas', { nome: 'Gil', modo: 'piloto', versao: VERSAO_JOGO }, { ip: '10.88.0.' + (tentativa + 1) });
    const sA = r.json || {};
    r = await api(BASE, `/api/salas/${sA.codigo}/entrar`, { nome: 'Hana', versao: VERSAO_JOGO }, { ip: '10.88.0.' + (tentativa + 1) });
    const sB = r.json || {};
    a = jogador('Gil', 0, sA.codigo, sA.ficha); b = jogador('Hana', 1, sA.codigo, sB.ficha);
    await a.conectar(); await b.conectar();
    const pedir = async (P, m, ms = 30000) => { const id = 'x' + Math.random().toString(36).slice(2); P.c.enviar(Object.assign({ id }, m)); return esperar(P.c, x => (x.t === 'ok' || x.t === 'erro') && x.id === id, ms); };
    let rc = await pedir(a, { t: 'configurar', config: { corrida2d: true, dist2d: 0.1, ia2d: 'medio' } });
    if(tentativa === 0) checar('o anfitrião liga a corrida 2D na sala de piloto', rc && rc.t === 'ok', rc);
    await pedir(a, { t: 'escolherPiloto', piloto: { nome: 'Gil Matos', cc: 'BR', idade: 20, estilo: 'equilibrado' } });
    await pedir(b, { t: 'escolherPiloto', piloto: { nome: 'Hana Sato', cc: 'JP', idade: 20, estilo: 'agressivo' } });
    await pedir(a, { t: 'iniciar' }, 60000);
    await esperar(a.c, m => m.t === 'sala' && m.sala.partida, 60000);
    await pedir(a, { t: 'pronto', rodada: 1, pronto: true }, 90000); await pedir(b, { t: 'pronto', rodada: 1, pronto: true }, 90000);
    const ia = await esperar(a.c, m => m.t === 'corridaInicio', 90000), ib = await esperar(b.c, m => m.t === 'corridaInicio', 90000);
    const ca = ia && ia.corridas.find(c => c.modo === '2d'), cb = ib && ib.corridas.find(c => c.modo === '2d');
    if(ca && cb && ca.c2d.carros.filter(c => c.dono != null).length === 2){ A = sA; B = sB; inicio = { ca, cb }; break; }
    console.log('  · os dois não estão na mesma corrida 2D desta sala (lesão ou categorias diferentes); outra sala');
    a.c.ws.close(); b.c.ws.close();
  }
  checar('a rodada abre uma corrida 2D com os dois humanos, cada um dono do seu carro', !!inicio);
  if(!inicio) throw new Error('sem corrida 2D com os dois');
  const def = inicio.ca.c2d;
  console.log(`  · ${def.trkId} ${def.ano} (${def.cat}), ${def.N} voltas, ${def.carros.length} carros`);
  const t0 = performance.now();
  a.abrir2d(inicio.ca); b.abrir2d(inicio.cb);
  /* a máquina travada (outro programa pesado) também trava o teste: medir para não culpar a rede */
  const trava = { ult: performance.now(), perdido: 0, max: 0 };
  const laco = setInterval(() => {
    const n = performance.now(), gap = n - trava.ult; trava.ult = n;
    if(gap > 100){ trava.perdido += gap - 16; trava.max = Math.max(trava.max, gap); }
    a.quadro(); b.quadro();
  }, 16);

  /* a largada espera os dois e acontece */
  const ateLargada = Date.now() + 40000;
  while(Date.now() < ateLargada && !(a.S.estado === 'pista' && b.S.estado === 'pista')) await dormir(100);
  checar('a largada acontece nas duas telas', a.S.estado === 'pista' && b.S.estado === 'pista', [a.S.estado, b.S.estado, a.S.t, b.S.t]);
  console.log(`  · luzes apagadas em ${((performance.now() - t0) / 1000).toFixed(1)} s desde a abertura`);

  /* a queda: Hana perde a conexão por 3 s no meio */
  let caiu = false, voltou = false;
  const fimProva = Date.now() + DURA * 1000;
  while(Date.now() < fimProva){
    await dormir(200);
    if(!caiu && b.S.t > 35){
      caiu = true; b.parado = true; b.c.ws.close();
      await dormir(3000);
      await b.conectar(); b.parado = false;
      const re = await esperar(b.c, m => m.t === 'corridaInicio', 10000);
      if(re) b.receber2d(re);
      voltou = !!re;
    }
  }
  clearInterval(laco);
  const dur = (performance.now() - t0) / 1000;
  checar('quem caiu volta para a mesma corrida (a sala manda tudo de novo)', voltou);
  checar('a sala assumiu o carro de quem caiu e devolveu quando a tela voltou', b.R.medidas.adocoes >= 1, b.R.medidas);

  /* as medidas */
  const erros = [], entre = [];
  for(const [P, O] of [[a, b], [b, a]]){
    for(const f of P.fotos){
      const v = O.hist.get(f.t); if(!v) continue;
      const c = f.carros[O.eu.idx]; if(!c || c[4] !== 'pista' || c[5]) continue;
      if(f.t > 34000 && f.t < 42000) continue;   // a janela da queda
      erros.push(Math.hypot(c[0] - v[0], c[1] - v[1]));
    }
  }
  /* os carros da IA nas duas telas, no mesmo tempo de prova (os dois veem o mesmo carro no mesmo lugar?) */
  const fb = new Map(b.fotos.map(f => [f.t, f]));
  for(const f of a.fotos){
    const g = fb.get(f.t); if(!g || (f.t > 34000 && f.t < 42000)) continue;
    f.carros.forEach((c, i) => { const d = g.carros[i]; if(c[3] || !d || c[4] !== 'pista' || c[5]) return; entre.push(Math.hypot(c[0] - d[0], c[1] - d[1])); });
  }
  const rtt = [a.R.medidas.rtt, b.R.medidas.rtt].map(v => v == null ? '—' : (v * 1000).toFixed(0) + ' ms');
  console.log(`  · ida e volta medida pelo relógio: ${rtt.join(' / ')}`);
  console.log(`  · quadros da sala por segundo: ${(a.msgs2d / dur).toFixed(1)} / ${(b.msgs2d / dur).toFixed(1)} · estados do outro humano por segundo: ${(a.h2d / dur).toFixed(1)} / ${(b.h2d / dur).toFixed(1)}`);
  console.log(`  · recebido por tela: ${(a.bytes / dur / 1024).toFixed(1)} KB/s / ${(b.bytes / dur / 1024).toFixed(1)} KB/s`);
  console.log(`  · erro do outro humano na tela: média ${media(erros).toFixed(2)} m · p95 ${pct(erros, .95).toFixed(2)} m · máx ${pct(erros, 1).toFixed(2)} m (${erros.length})`);
  console.log(`  · o mesmo carro da IA nas duas telas: média ${media(entre).toFixed(2)} m · p95 ${pct(entre, .95).toFixed(2)} m (${entre.length})`);
  const ocupada = trava.perdido / 1000 / dur > .03;
  console.log(`  · travadas do próprio teste: ${(trava.perdido / 1000).toFixed(1)} s em ${dur.toFixed(0)} s (máx ${trava.max.toFixed(0)} ms)${ocupada ? ' — máquina ocupada' : ''}`);
  if(ocupada) console.log('  – não verificável agora: cadência do quadro e erro do outro humano (a máquina travou o próprio teste)');
  else checar('o quadro da sala chega ~20 vezes por segundo', a.msgs2d / dur > 15 && b.msgs2d / dur > 15, [a.msgs2d / dur, b.msgs2d / dur]);
  if(ATRASO + VARIA <= 120 && !ocupada){
    checar('o outro humano aparece perto de onde está (p95 < 3 m)', erros.length > 100 && pct(erros, .95) < 3, [erros.length, pct(erros, .95)]);
  }
  if(ATRASO + VARIA <= 120) checar('as duas telas veem a IA no mesmo lugar (p95 < 3 m)', entre.length > 100 && pct(entre, .95) < 3, [entre.length, pct(entre, .95)]);

  /* pular: os dois votam; a sala projeta o resto e processa a rodada */
  const voto = async (P) => { const id = 'v' + P.slot; P.c.enviar({ t: 'corrida', id, k: P.k, tipo: 'pular', dados: { quer: true } }); return esperar(P.c, x => (x.t === 'ok' || x.t === 'erro') && x.id === id, 10000); };
  const va = await voto(a), vb = await voto(b);
  checar('o voto dos dois para pular é aceito', va && va.t === 'ok' && vb && vb.t === 'ok', [va, vb]);
  const fa = await esperar(a.c, m => m.t === 'corridaFim', 20000), ra = await esperar(a.c, m => m.t === 'rodada', 60000), rb = await esperar(b.c, m => m.t === 'rodada', 60000);
  checar('a corrida acaba e a rodada é processada para os dois', !!(fa && ra && rb));
  const etapas = (ra && ra.resultado && ra.resultado.etapas) || [];
  checar('a rodada tem a corrida de cada um', etapas.length === 2 && etapas.map(e => e.slot).sort().join() === '0,1', etapas.map(e => [e.slot, e.gp]));
  /* a carreira de cada um: a posição da última corrida */
  const vistaDe = async P => { await dormir(500); for(let i = P.c.msgs.length - 1; i >= 0; i--) if(P.c.msgs[i].t === 'vista') return P.c.msgs[i].vista; return null; };
  const posDe = v => { const r = v && v.S && v.S.season && v.S.season.results; const u = r && r[r.length - 1]; return u ? u.pos : null; };
  const pa = posDe(await vistaDe(a)), pb = posDe(await vistaDe(b));
  /* a ordem final que a tela tem depois do último quadro (o mesmo resultado da sala) */
  await dormir(600);
  const fin = P => P.C2D.Corrida.ordem(P.S).findIndex(c => c === P.eu) + 1;
  console.log(`  · posições: na carreira ${pa} / ${pb} · no fim da 2D, na tela ${fin(a)} / ${fin(b)}`);
  checar('na carreira de cada um entra a posição da corrida 2D', pa != null && pb != null && pa !== pb && pa === fin(a) && pb === fin(b), { carreira: [pa, pb], tela: [fin(a), fin(b)] });
  a.c.ws.close(); b.c.ws.close();
} catch(e){
  console.log('  ✗ o teste parou: ' + (e && e.stack || e));
  placar.falhas++;
} finally {
  await derrubar(srv);
  try { fs.rmSync(persist, { recursive: true, force: true }); } catch(e){}
}
console.log(`\n${placar.ok} ok, ${placar.falhas} falha(s)`);
process.exit(placar.falhas ? 1 : 0);
