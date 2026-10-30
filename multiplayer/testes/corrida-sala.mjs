/* Verificações da corrida ao vivo numa sala de verdade (Fase 5), contra o wrangler dev: dois
   pilotos na mesma categoria, os dois prontos, a corrida no relógio da sala com largada, ordens,
   velocidade, uma tela que cai e volta, o voto para pular e a rodada processada com a chegada da
   corrida; uma segunda sala fica com a corrida na pista para o servidor reiniciar (fase2) e ela
   seguir de onde parou. rodar.mjs chama fase1 antes de reiniciar o servidor e fase2 depois. */
import { checar, dormir, api, esperar, abrir } from './salas.mjs';
import { criarMotor } from '../src/gerado/motor-jogo.js';
import { ambienteFalso } from '../src/pagina-falsa.js';
import { aplicar } from '../src/corrida-mp.js';

const IP = '10.77.0.4';
const JANELA = 10000, MAX_ENVIO = 17;
const limites = new Map();
let seq = 0;

function ligar(c, codigo, slot){
  const k = codigo + ':' + slot;
  if(!limites.has(k)) limites.set(k, []);
  c.lim = limites.get(k); c.slot = slot;
  return c;
}
async function mandar(c, m){
  for(;;){
    const agora = Date.now();
    while(c.lim.length && agora - c.lim[0] >= JANELA) c.lim.shift();
    if(c.lim.length < MAX_ENVIO) break;
    await dormir(Math.max(50, JANELA - (agora - c.lim[0]) + 50));
  }
  c.lim.push(Date.now()); c.enviar(m);
}
async function pedir(c, m, ms = 30000){
  const id = m.id !== undefined ? m.id : 'V' + (++seq);
  await mandar(c, Object.assign({ id }, m));
  return esperar(c, x => (x.t === 'ok' || x.t === 'erro') && x.id === id, ms);
}
const corrida = (c, k, tipo, dados) => pedir(c, { t: 'corrida', k, tipo, dados });
const pronto = (c, rodada) => pedir(c, { t: 'pronto', rodada, pronto: true }, 90000);
const vDe = c => Math.max(0, ...c.msgs.filter(m => typeof m.v === 'number').map(m => m.v));
async function vista(c, ms = 10000){
  const limite = Date.now() + ms;
  while(Date.now() < limite){
    for(let i = c.msgs.length - 1; i >= 0; i--) if(c.msgs[i].t === 'vista'){ if(c.msgs[i].v === vDe(c)) return c.msgs[i].vista; break; }
    await dormir(40);
  }
  return null;
}
const PILOTOS = [{ nome: 'Eva Rocha', cc: 'BR', idade: 20, estilo: 'equilibrado' }, { nome: 'Fábio Nunes', cc: 'PT', idade: 20, estilo: 'agressivo' }];

async function salaNaCorrida(base, versao, vel){
  let r = await api(base, '/api/salas', { nome: 'Eva', modo: 'piloto', versao }, { ip: IP });
  const A = r.json || {};
  const a = ligar(await abrir(base, A.codigo, A.ficha), A.codigo, 0);
  await esperar(a, m => m.t === 'estado');
  r = await api(base, `/api/salas/${A.codigo}/entrar`, { nome: 'Fábio', versao }, { ip: IP });
  const B = r.json || {};
  const b = ligar(await abrir(base, A.codigo, B.ficha), A.codigo, 1);
  await esperar(b, m => m.t === 'estado');
  await pedir(a, { t: 'configurar', config: { velocidade: vel } });
  await pedir(a, { t: 'escolherPiloto', piloto: PILOTOS[0] });
  await pedir(b, { t: 'escolherPiloto', piloto: PILOTOS[1] });
  await pedir(a, { t: 'iniciar' }, 60000);
  await esperar(a, m => m.t === 'sala' && m.sala.partida, 60000);
  const pa = await pronto(a, 1), pb = await pronto(b, 1);
  const ia = await esperar(a, m => m.t === 'corridaInicio', 90000), ib = await esperar(b, m => m.t === 'corridaInicio', 90000);
  return { A, B, a, b, pa, pb, ia, ib };
}

/* a tela: refaz a corrida com a entrada e o registro, até o fim */
function refazer(J, ent, log){
  const R = J.Gp.criar(structuredClone(ent));
  let fila = log.slice(), passo = 0, g = 0;
  const doPasso = () => { const ag = fila.filter(e => e.passo <= passo).sort((x, y) => x.n - y.n); fila = fila.filter(e => e.passo > passo); ag.forEach(e => aplicar(J.Gp, R, e)); };
  while(!R.fim && g++ < 500000){
    doPasso();
    if(R.fim) break;
    if(R.pergunta){ J.Gp.responder(R, R.pergunta.padrao); continue; }   // só se o registro não trouxe a resposta
    J.Gp.passo(R); passo++;
  }
  return J.Gp.resultado(R);
}
const logDe = (c, k) => {
  const ini = c.msgs.filter(m => m.t === 'corridaInicio').pop();
  const vistos = new Map();
  for(const e of (ini ? (ini.corridas.find(x => x.k === k) || {}).log || [] : [])) vistos.set(e.n, e);
  for(const m of c.msgs) if(m.t === 'corridaLog' && m.k === k) vistos.set(m.e.n, m.e);
  return [...vistos.values()].sort((x, y) => x.n - y.n);
};

export async function fase1({ base, versao, estado }){
  console.log('\nCorrida ao vivo (sala de piloto), antes de reiniciar o servidor');
  const amb = ambienteFalso({ seed: 3 }); const J = criarMotor(amb); J.amb = amb; J.Saves.auto = false;

  /* os dois precisam estar no grid: a pré-temporada pode deixar um deles machucado na primeira
     corrida (a sala então corre com um humano só); nesse caso, a corrida é encerrada e outra sala tenta */
  let sala1 = null;
  for(let tentativa = 0; tentativa < 4 && !sala1; tentativa++){
    const x = await salaNaCorrida(base, versao, 16);
    const c0 = x.ia && x.ia.corridas[0];
    if(c0 && Object.values(c0.donos).map(String).sort().join() === '0,1'){ sala1 = x; break; }
    if(c0){ for(const s of new Set(Object.values(c0.donos).map(String))) await corrida(s === '0' ? x.a : x.b, c0.k, 'pular', { quer: true }); }
    x.a.ws.close(); x.b.ws.close();
  }
  if(!sala1) return checar('1 uma sala com os dois pilotos no grid da primeira corrida', false);
  const { A, B, a, b, pa, pb, ia, ib } = sala1;
  const ca = ia && ia.corridas[0], cb = ib && ib.corridas[0];
  checar('1 os dois prontos → a sala abre a corrida ao vivo: os dois recebem a mesma corrida, com um carro de cada um',
    pa && pa.t === 'ok' && pb && pb.t === 'ok' && ia && ib && ia.corridas.length === 1 && JSON.stringify(ca.ent) === JSON.stringify(cb.ent)
    && Object.values(ca.donos).map(String).sort().join() === '0,1' && ca.fase === 'largada', { pa, pb, n: ia && ia.corridas.length, donos: ca && ca.donos });
  if(!ca) return;
  const k = ca.k, meu = s => Number(Object.keys(ca.donos).find(i => String(ca.donos[i]) === String(s)));
  const sala = await esperar(a, m => m.t === 'sala' && m.sala.partida && m.sala.partida.estado === 'corrida', 10000);
  let r = await pedir(a, { t: 'acao', rodada: 1, tipo: 'setResp', dados: { i: 0, v: 1 } });
  checar('1 a sala está em corrida e as ações da rodada esperam (erro processando)', !!sala && r && r.t === 'erro' && r.codigo === 'processando', r);

  // largada
  r = await corrida(a, k, 'largada', { reac: .2 });
  const rep = await corrida(a, k, 'largada', { reac: .2 });
  const rb = await corrida(b, k, 'largada', { auto: true });
  const lg = await esperar(b, m => m.t === 'corridaLog' && m.k === k && m.e.tipo === 'largar', 10000);
  const cor = await esperar(a, m => m.t === 'corridaEstado' && m.corridas[0].fase === 'correndo', 10000);
  checar('2 largada: a reação do anfitrião vale só para o carro dele, o convidado larga no automático, e a corrida anda',
    r && r.t === 'ok' && rep && rep.t === 'erro' && rep.codigo === 'repetida' && rb && rb.t === 'ok' && lg && lg.e.slot === 0
    && JSON.stringify(lg.e.dados.so) === JSON.stringify([meu(0)]) && lg.e.passo === 0 && !!cor, { r, rep, rb, lg: lg && lg.e });

  // ordens
  await dormir(600);
  const libAntes = Math.max(...b.msgs.filter(m => m.t === 'corridaEstado').map(m => m.corridas[0].liberado));
  r = await corrida(a, k, 'comandar', { i: meu(0), cmd: { modo: 'atacar' } });
  const viu = r && r.t === 'ok' && await esperar(b, m => m.t === 'corridaLog' && m.e.n === r.resultado.n, 5000);
  checar('3 uma ordem para o próprio carro: aceita, chega aos dois, e vale num passo que nenhuma tela alcançou',
    !!viu && viu.e.passo >= libAntes && viu.e.dados.cmd.modo === 'atacar', { r, e: viu && viu.e, libAntes });
  const recusas = [await corrida(b, k, 'comandar', { i: meu(0), cmd: { modo: 'poupar' } }), await corrida(b, k, 'comandar', { i: meu(1), cmd: { voar: 1 } }),
                   await corrida(b, k, 'comandar', { i: meu(1), cmd: { modo: 'maximo' } }), await pedir(b, { t: 'velocidade', v: 3 })];
  checar('3 recusadas: ordem para o carro do outro (carro), comando que não existe, ritmo só do modo chefe, velocidade fora da lista (dados)',
    recusas.map(x => x && x.codigo).join() === 'carro,dados,dados,dados', recusas.map(x => x && x.codigo));
  r = await pedir(b, { t: 'velocidade', v: 16 });
  checar('3 a velocidade vale para a sala inteira', r && r.t === 'ok', r);

  // a tela do convidado cai e volta
  b.ws.close();
  await dormir(800);
  const b2 = ligar(await abrir(base, A.codigo, B.ficha), A.codigo, 1);
  const volta = await esperar(b2, m => m.t === 'corridaInicio', 10000);
  checar('4 o convidado cai e volta: recebe a corrida com o registro inteiro (a largada e a ordem) e o passo liberado',
    !!volta && volta.corridas[0].log.some(e => e.tipo === 'largar') && volta.corridas[0].log.some(e => e.tipo === 'comandar') && volta.corridas[0].liberado > 0,
    volta && volta.corridas[0].log.map(e => e.tipo));

  // pular: precisa dos dois
  r = await corrida(a, k, 'pular', { quer: true });
  await dormir(400);
  const aindaCorre = !a.msgs.some(m => m.t === 'corridaFim');
  const r2 = await corrida(b2, k, 'pular', { quer: true });
  const fim = await esperar(a, m => m.t === 'corridaFim', 30000);
  const rod = await esperar(a, m => m.t === 'rodada' && m.rodada === 1, 120000);
  checar('5 pular: um voto não basta; com o voto dos dois a corrida vai à bandeirada e a rodada é processada',
    r && r.t === 'ok' && aindaCorre && r2 && r2.t === 'ok' && !!fim && !!rod && rod.resultado.tipo === 'corridas', { r, r2, fim: !!fim, rod: rod && rod.resultado.tipo });
  if(rod){
    const log = logDe(a, k), res = refazer(J, ca.ent, log);
    const nomes = Object.fromEntries(ca.ent.carros.map(c => [c.id, c.nome]));
    const top = (rod.resultado.etapas[0] || {}).top || [];
    checar('5 a rodada traz a chegada da corrida ao vivo: a tela refaz a corrida com o que recebeu e chega ao mesmo top 10',
      top.map(t => t.nome).join('|') === res.ordem.slice(0, 10).map(o => nomes[o.id]).join('|') && log.some(e => e.tipo === 'terminar'),
      { top: top.slice(0, 3).map(t => t.nome), tela: res.ordem.slice(0, 3).map(o => nomes[o.id]) });
    const [VA, VB] = [await vista(a), await vista(b2)];
    checar('5 as duas carreiras com o resultado da corrida (uma etapa no histórico) e a sala de volta ao planejamento da rodada 2',
      VA && VB && VA.S.season.results.length === 1 && VB.S.season.results.length === 1
      && a.msgs.filter(m => m.t === 'sala').pop().sala.partida.estado === 'planning' && a.msgs.filter(m => m.t === 'sala').pop().sala.partida.rodada === 2);
  }
  a.ws.close(); b2.ws.close();

  // a segunda sala: a corrida fica na pista para o reinício
  const s2 = await salaNaCorrida(base, versao, 1);
  if(s2.ia){
    const k2 = s2.ia.corridas[0].k;
    await corrida(s2.a, k2, 'largada', { auto: true });
    await corrida(s2.b, k2, 'largada', { auto: true });
    await esperar(s2.a, m => m.t === 'corridaEstado' && m.corridas[0].fase === 'correndo', 10000);
    /* a ordem de quem estiver no grid (a pré-temporada pode ter deixado um dos dois de fora) */
    const donos2 = s2.ia.corridas[0].donos, i2 = Number(Object.keys(donos2)[0]);
    const r3 = await corrida(String(donos2[i2]) === '0' ? s2.a : s2.b, k2, 'comandar', { i: i2, cmd: { modo: 'poupar' } });
    await dormir(3000);
    const ult = s2.a.msgs.filter(m => m.t === 'corridaEstado').pop();
    estado.corrida2 = { codigo: s2.A.codigo, fichaA: s2.A.ficha, fichaB: s2.B.ficha, k: k2, passo: ult ? ult.corridas[0].passo : 0, n: r3 && r3.resultado && r3.resultado.n };
    checar('6 uma segunda sala fica com a corrida andando (1×) para o reinício do servidor', !!ult && ult.corridas[0].passo > 0 && !!estado.corrida2.n, ult && ult.corridas[0]);
  }
}

export async function fase2({ base, estado }){
  console.log('\nCorrida ao vivo, depois de reiniciar o servidor (mesmo storage)');
  const E = estado.corrida2; if(!E) return checar('7 a sala da corrida existe', false);
  const a = ligar(await abrir(base, E.codigo, E.fichaA), E.codigo, 0);
  const b = ligar(await abrir(base, E.codigo, E.fichaB), E.codigo, 1);
  const ia = await esperar(a, m => m.t === 'corridaInicio', 30000);
  const c = ia && ia.corridas.find(x => x.k === E.k);
  checar('7 depois do reinício a corrida volta: o registro guardado (com a ordem do convidado) e o passo de antes, ou mais',
    !!c && c.log.some(e => e.n === E.n) && c.passo + 64 >= E.passo, c && { passo: c.passo, antes: E.passo, log: c.log.map(e => e.tipo) });
  await esperar(b, m => m.t === 'corridaInicio', 30000);
  await dormir(1500);
  const depois = a.msgs.filter(m => m.t === 'corridaEstado').pop();
  checar('7 e segue andando no relógio da sala', !!depois && c && depois.corridas[0].passo > c.passo, depois && depois.corridas[0]);
  await corrida(a, E.k, 'pular', { quer: true });
  await corrida(b, E.k, 'pular', { quer: true });
  const rod = await esperar(a, m => m.t === 'rodada' && m.rodada === 1, 120000);
  await dormir(1500);
  checar('7 com o voto dos dois ela termina e a rodada 1 é processada uma vez só',
    !!rod && a.msgs.filter(m => m.t === 'rodada').length === 1 && a.msgs.filter(m => m.t === 'sala').pop().sala.partida.rodada === 2);
  a.ws.close(); b.ws.close();
}
