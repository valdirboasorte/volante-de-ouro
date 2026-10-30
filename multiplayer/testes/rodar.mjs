/* Roda os testes do multiplayer: gera o motor, sobe o wrangler dev (porta 8791, storage
   novo em pasta temporária), roda a fase 1 (salas, sala de chefe e depois turnos), derruba o servidor
   logo em seguida (os turnos deixam uma rodada travada de propósito), sobe de novo sobre
   o mesmo storage para provar a persistência, roda a fase 2 (turnos, sala de chefe e salas) e derruba tudo. Sai com
   código 1 se qualquer verificação falhar. Uso: npm run testes (dentro de multiplayer/) */
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, '..');
const PORTA = 8791;
const BASE = `http://127.0.0.1:${PORTA}`;
const WRANGLER = path.join(RAIZ, 'node_modules', 'wrangler', 'bin', 'wrangler.js');
const dormir = ms => new Promise(r => setTimeout(r, ms));

let servidor = null;

function subir(persist){
  const filho = spawn(process.execPath, [WRANGLER, 'dev', '--port', String(PORTA), '--ip', '127.0.0.1',
    '--persist-to', persist, '--show-interactive-dev-session=false'], {
    cwd: RAIZ, stdio: ['ignore', 'pipe', 'pipe'],
    env: Object.assign({}, process.env, { WRANGLER_SEND_METRICS: 'false', NO_COLOR: '1', FORCE_COLOR: '0' })
  });
  filho.saida = '';
  filho.encerrou = false;
  filho.stdout.on('data', d => { filho.saida += d; });
  filho.stderr.on('data', d => { filho.saida += d; });
  filho.on('exit', () => { filho.encerrou = true; });
  return filho;
}

async function respondendo(){
  try{
    await fetch(BASE + '/nada', { signal: AbortSignal.timeout(1500) });
    return true;
  }catch(e){ return false; }
}

async function esperarPronto(filho){
  const limite = Date.now() + 90000;
  while(Date.now() < limite){
    if(filho.encerrou) throw new Error('o wrangler dev encerrou sozinho:\n' + filho.saida.slice(-1500));
    if(await respondendo()) return;
    await dormir(400);
  }
  throw new Error('o wrangler dev não respondeu em 90 s:\n' + filho.saida.slice(-1500));
}

async function derrubar(filho){
  if(!filho || filho.encerrou) return;
  try{
    if(process.platform === 'win32') execFileSync('taskkill', ['/PID', String(filho.pid), '/T', '/F'], { stdio: 'ignore' });
    else process.kill(filho.pid, 'SIGKILL');
  }catch(e){ /* já tinha saído */ }
  const limite = Date.now() + 15000;
  while(Date.now() < limite && (await respondendo())) await dormir(300);
}

async function main(){
  const persist = fs.mkdtempSync(path.join(os.tmpdir(), 'volante-mp-'));
  let placar = null;
  try{
    console.log('Gerando o motor do jogo');
    execFileSync(process.execPath, ['ferramentas/gerar-motor.mjs'], { cwd: RAIZ, stdio: 'inherit' });
    const salas = await import(pathToFileURL(path.join(AQUI, 'salas.mjs')).href);
    placar = salas.placar;
    const turnos = await import(pathToFileURL(path.join(AQUI, 'turnos.mjs')).href);
    const chefe = await import(pathToFileURL(path.join(AQUI, 'chefe-sala.mjs')).href);
    const piloto = await import(pathToFileURL(path.join(AQUI, 'piloto-sala.mjs')).href);
    const { VERSAO_JOGO } = await import(pathToFileURL(path.join(RAIZ, 'src', 'gerado', 'motor-jogo.js')).href);
    const ctx = { base: BASE, versao: VERSAO_JOGO, estado: {} };

    console.log(`Subindo o wrangler dev em ${BASE} (storage em ${persist})`);
    servidor = subir(persist);
    await esperarPronto(servidor);
    await salas.fase1(ctx);
    await piloto.fase1(ctx);
    await chefe.fase1(ctx);           // antes dos turnos: a sala travada deles não pode esperar um minuto
    await turnos.fase1(ctx);          // termina com uma rodada travada em processing: derrubar logo

    console.log('\nReiniciando o wrangler dev sobre o mesmo storage');
    await derrubar(servidor);
    servidor = subir(persist);
    await esperarPronto(servidor);
    await turnos.fase2(ctx);
    await chefe.fase2(ctx);
    await piloto.fase2(ctx);
    await salas.fase2(ctx);
  }catch(e){
    console.log('  ✗ o teste parou: ' + (e && e.stack || e));
    if(placar) placar.falhas++;
    else placar = { ok: 0, falhas: 1, nao: 0 };
  }finally{
    await derrubar(servidor);
    try{ fs.rmSync(persist, { recursive: true, force: true }); }catch(e){ /* o Windows pode segurar o arquivo por um instante */ }
  }
  console.log(`\n${placar.ok} ok, ${placar.falhas} falha(s), ${placar.nao} não verificável(is) localmente`);
  process.exit(placar.falhas ? 1 : 0);
}

process.on('SIGINT', () => { derrubar(servidor).then(() => process.exit(130)); });
main();
