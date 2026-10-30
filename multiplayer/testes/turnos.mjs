/* Verificações dos turnos (Fase 2) contra um wrangler dev de verdade: iniciar a partida,
   ações secretas, pronto, processamento único, falha com nova tentativa, reconexão e
   recuperação depois de reiniciar o servidor. Usa as regras de teste (src/regras-teste.js).
   rodar.mjs chama fase1 antes de reiniciar o servidor e fase2 depois; a fase1 termina de
   propósito com uma sala travada em 'processing' (falha + alarme pendente) para a fase2
   provar que a rodada é terminada uma única vez depois da queda. */
import { regrasTeste } from '../src/regras-teste.js';
import { criarRnd } from '../src/aleatorio.js';
import { checar, dormir, api, esperar, abrir } from './salas.mjs';

const IP = '10.77.0.1';                // chave própria no limite de criação, para não gastar o das outras verificações
const JANELA = 10000, MAX_ENVIO = 17;  // o servidor aceita 20 a cada 10 s por slot; aqui sobra folga

/* ---- ajudantes ---- */

const limites = new Map();             // "codigo:slot" -> instantes dos últimos envios (vale para qualquer socket do slot)
let seq = 0;

function ligar(c, codigo, slot){
  const k = codigo + ':' + slot;
  if(!limites.has(k)) limites.set(k, []);
  c.lim = limites.get(k);
  c.slot = slot;
  return c;
}

/* espera até caberem n mensagens sem estourar o limite do servidor */
async function folga(c, n){
  for(;;){
    const agora = Date.now();
    while(c.lim.length && agora - c.lim[0] >= JANELA) c.lim.shift();
    if(c.lim.length + n <= MAX_ENVIO) return;
    await dormir(Math.max(50, JANELA - (agora - c.lim[0]) + 50));
  }
}
function mandarJa(c, m){ c.lim.push(Date.now()); c.enviar(m); }
async function mandar(c, m){ await folga(c, 1); mandarJa(c, m); }

/* manda com id novo e espera o ok ou o erro desse id */
async function pedir(c, m){
  const id = m.id !== undefined ? m.id : 'T' + (++seq);
  await mandar(c, Object.assign({ id }, m));
  return esperar(c, x => (x.t === 'ok' || x.t === 'erro') && x.id === id);
}

const ultima = (c, t, pred = () => true) => {
  for(let i = c.msgs.length - 1; i >= 0; i--) if(c.msgs[i].t === t && pred(c.msgs[i])) return c.msgs[i];
  return null;
};
const contar = (c, pred) => c.msgs.filter(pred).length;
const igual = (x, y) => JSON.stringify(x) === JSON.stringify(y);
const vDe = c => Math.max(0, ...c.msgs.filter(m => typeof m.v === 'number').map(m => m.v));

/* alguma chave com "plano" no nome, em qualquer profundidade, com este valor? (ou a chave "planos") */
function achaPlano(obj, valor, caminho = ''){
  if(!obj || typeof obj !== 'object') return null;
  for(const [k, v] of Object.entries(obj)){
    if(k === 'planos') return caminho + '.' + k;
    if(/plano/i.test(k) && v === valor) return caminho + '.' + k;
    const sub = achaPlano(v, valor, caminho + '.' + k);
    if(sub) return sub;
  }
  return null;
}
const vazou = (c, valor) => c.msgs.map(m => achaPlano(m, valor, m.t)).find(Boolean) || null;

async function criarSalaCom(base, versao, nomes){
  let r = await api(base, '/api/salas', { nome: nomes[0], modo: 'piloto', versao }, { ip: IP });
  const A = r.json || {};
  const sala = { codigo: A.codigo, A, B: null, a: null, b: null };
  sala.a = ligar(await abrir(base, A.codigo, A.ficha), A.codigo, 0);
  await esperar(sala.a, m => m.t === 'estado');
  if(nomes[1]){
    r = await api(base, `/api/salas/${A.codigo}/entrar`, { nome: nomes[1], versao }, { ip: IP });
    sala.B = r.json || {};
    sala.b = ligar(await abrir(base, A.codigo, sala.B.ficha), A.codigo, 1);
    await esperar(sala.b, m => m.t === 'estado');
  }
  return sala;
}

/* sala de dois, já iniciada, com a primeira vista de cada um consumida */
async function salaIniciada(base, versao){
  const s = await criarSalaCom(base, versao, ['Ana', 'Bia']);
  const r = await pedir(s.a, { t: 'iniciar' });
  await esperar(s.a, m => m.t === 'vista');
  await esperar(s.b, m => m.t === 'vista');
  s.iniciou = r;
  return s;
}

const prontoMsg = (rodada, pronto) => ({ t: 'pronto', rodada, pronto });
const planejar = (rodada, valor) => ({ t: 'acao', rodada, tipo: 'planejar', dados: { valor } });

/* ---- fase 1: antes de reiniciar o servidor ---- */

export async function fase1({ base, versao, estado }){
  console.log('\nTurnos, antes de reiniciar o servidor');
  limites.clear();
  const T = estado.turnos = {};

  // 1: iniciar
  const M = await criarSalaCom(base, versao, ['Ana']);
  const { a } = M;
  let r = await pedir(a, { t: 'iniciar' });
  checar('1 iniciar: o anfitrião sozinho na sala → erro jogadores', r && r.t === 'erro' && r.codigo === 'jogadores', r);
  let j = await api(base, `/api/salas/${M.codigo}/entrar`, { nome: 'Bia', versao }, { ip: IP });
  M.B = j.json;
  const b = M.b = ligar(await abrir(base, M.codigo, M.B.ficha), M.codigo, 1);
  await esperar(b, m => m.t === 'estado');
  r = await pedir(b, { t: 'iniciar' });
  checar('1 iniciar: o convidado → erro anfitriao', r && r.t === 'erro' && r.codigo === 'anfitriao', r);
  r = await pedir(a, { t: 'iniciar' });
  const salaA = await esperar(a, m => m.t === 'sala' && m.sala.partida);
  const salaB = await esperar(b, m => m.t === 'sala' && m.sala.partida);
  const vistaA = await esperar(a, m => m.t === 'vista');
  const vistaB = await esperar(b, m => m.t === 'vista');
  const pa = salaA && salaA.sala.partida;
  checar('1 iniciar: o anfitrião com 2 jogadores → ok; os dois recebem sala (estado partida, partida planning, rodada 1, ninguém pronto, sem último, regras teste) e uma vista',
    r && r.t === 'ok' && salaA && salaB && salaA.sala.estado === 'partida' && pa.estado === 'planning' && pa.rodada === 1
    && igual(pa.prontos, { 0: false, 1: false }) && pa.ultimo === null && pa.regras === 'teste'
    && igual(salaA.sala.partida, salaB.sala.partida) && vistaA && vistaB
    && vistaA.vista.meuPlano === null && vistaA.vista.rivalDecidiu === false && igual(vistaA.vista.pontos, { 0: 0, 1: 0 })
    && vistaB.vista.meuPlano === null && Array.isArray(vistaB.vista.historico), { r, salaA, vistaA });
  checar('1 iniciar: a vista pública da partida não traz o mundo nem planos',
    !JSON.stringify(salaA).includes('planos') && !JSON.stringify(salaA).includes('mundo') && !JSON.stringify(salaA).includes('fichaHash'), salaA);
  j = await api(base, `/api/salas/${M.codigo}/entrar`, { nome: 'Caio', versao }, { ip: IP });
  checar('1 iniciar: entrar depois de começar → 409 comecou', j.status === 409 && j.json.erro === 'comecou', j);
  r = await pedir(a, { t: 'iniciar' });
  checar('1 iniciar: iniciar de novo → erro estado', r && r.t === 'erro' && r.codigo === 'estado', r);

  // 2: ação secreta
  const v0 = vDe(a);
  r = await pedir(a, planejar(1, 7));
  const vistaA2 = await esperar(a, m => m.t === 'vista' && m.vista.meuPlano === 7);
  const vistaB2 = await esperar(b, m => m.t === 'vista' && m.vista.rivalDecidiu === true);
  checar('2 ação: planejar 7 → ok {plano:7} e a vista do próprio jogador mostra meuPlano 7',
    r && r.t === 'ok' && igual(r.resultado, { plano: 7 }) && !!vistaA2 && vistaA2.vista.rivalDecidiu === false, { r, vistaA2 });
  checar('2 ação: a vista do outro jogador diz rivalDecidiu true e meuPlano null',
    !!vistaB2 && vistaB2.vista.meuPlano === null, vistaB2);
  checar('2 ação: v aumenta em 1 e o 7 do rival não aparece como plano em nada que o outro recebeu (sala, vista)',
    vDe(a) === v0 + 1 && !vazou(b, 7) && !vazou(a, 3), { v0, v: vDe(a), vazou: vazou(b, 7) });
  r = await pedir(b, planejar(1, 0));
  const r2 = await pedir(b, planejar(1, 11));
  const r3 = await pedir(b, { t: 'acao', rodada: 1, tipo: 'planejar', dados: { valor: 'x' } });
  const r4 = await pedir(b, { t: 'acao', rodada: 1, tipo: 'planejar', dados: { valor: 2.5 } });
  checar('2 ação: valor 0, 11, "x" e 2.5 → erro dados',
    [r, r2, r3, r4].every(x => x && x.t === 'erro' && x.codigo === 'dados'), [r, r2, r3, r4]);
  r = await pedir(b, { t: 'acao', rodada: 1, tipo: 'trapacear', dados: { valor: 3 } });
  const rp = await pedir(b, { t: 'acao', rodada: 1, tipo: 'constructor', dados: { valor: 3 } });
  checar('2 ação: tipo desconhecido (inclusive "constructor") → erro acao', r && r.codigo === 'acao' && rp && rp.codigo === 'acao', [r, rp]);
  r = await pedir(b, planejar(5, 3));
  checar('2 ação: rodada errada → erro rodada', r && r.t === 'erro' && r.codigo === 'rodada', r);
  r = await pedir(b, planejar(1, 3));
  checar('2 ação: o outro jogador planeja 3 → ok {plano:3}', r && r.t === 'ok' && igual(r.resultado, { plano: 3 }), r);

  // 3: ação repetida (mesmo id)
  await dormir(150);
  const v1 = vDe(a);
  const dup = { t: 'acao', id: 'dup1', rodada: 1, tipo: 'planejar', dados: { valor: 8 } };
  await folga(a, 3);
  mandarJa(a, dup); mandarJa(a, dup); mandarJa(a, dup);
  const resp = [];
  for(let i = 0; i < 3; i++) resp.push(await esperar(a, m => m.t === 'ok' && m.id === 'dup1'));
  await dormir(400);
  const salasNovas = contar(a, m => m.t === 'sala' && m.v > v1);
  const vistaDup = ultima(a, 'vista');
  checar('3 repetição: a mesma ação com o mesmo id 3 vezes → 3 respostas iguais, aplicada uma vez (v +1, uma só sala nova)',
    resp.every(Boolean) && resp.every(x => igual(x, resp[0])) && igual(resp[0].resultado, { plano: 8 })
    && vDe(a) === v1 + 1 && salasNovas === 1 && vistaDup.vista.meuPlano === 8, { resp, v1, v: vDe(a), salasNovas });
  const v2 = vDe(a);
  r = await pedir(a, { t: 'acao', id: 'dup1', rodada: 1, tipo: 'planejar', dados: { valor: 6 } });
  await dormir(200);
  checar('3 repetição: o mesmo id com conteúdo diferente é uma ação nova (aplicada, v +1, plano 6)',
    r && r.t === 'ok' && igual(r.resultado, { plano: 6 }) && vDe(a) === v2 + 1 && ultima(a, 'vista').vista.meuPlano === 6, { r, v2, v: vDe(a) });
  T.planos = { 0: 6, 1: 3 };

  // 4: pronto e espera
  r = await pedir(a, prontoMsg(1, 'sim'));
  checar('4 pronto: valor que não é booleano → erro dados', r && r.codigo === 'dados', r);
  r = await pedir(a, prontoMsg(1, true));
  const sA = await esperar(a, m => m.t === 'sala' && m.sala.partida && m.sala.partida.estado === 'waiting');
  const sB = await esperar(b, m => m.t === 'sala' && m.sala.partida && m.sala.partida.estado === 'waiting');
  checar('4 pronto: um pronto → partida waiting, rodada ainda 1, prontos {0:true,1:false}, nos dois',
    r && r.t === 'ok' && sA && sB && sA.sala.partida.rodada === 1 && igual(sA.sala.partida.prontos, { 0: true, 1: false })
    && igual(sA.sala.partida, sB.sala.partida), { r, sA });
  r = await pedir(a, planejar(1, 4));
  checar('4 pronto: quem está pronto não pode mudar o plano → erro pronto', r && r.t === 'erro' && r.codigo === 'pronto', r);
  const vAntes = vDe(a);
  r = await pedir(a, prontoMsg(1, true));
  await dormir(300);
  checar('4 pronto: o mesmo valor de novo → ok sem mudar nada (v igual, nenhuma sala nova)',
    r && r.t === 'ok' && vDe(a) === vAntes, { r, vAntes, v: vDe(a) });
  r = await pedir(a, prontoMsg(1, false));
  const cancelou = await esperar(b, m => m.t === 'sala' && m.sala.partida && m.sala.partida.estado === 'planning' && m.v > vAntes);
  checar('4 pronto: cancelar → volta para planning e o outro vê', r && r.t === 'ok' && !!cancelou && igual(cancelou.sala.partida.prontos, { 0: false, 1: false }), { r, cancelou });
  r = await pedir(a, prontoMsg(1, true));
  const voltou = await esperar(a, m => m.t === 'sala' && m.sala.partida && m.sala.partida.estado === 'waiting' && m.v > vAntes + 1);
  checar('4 pronto: pronto de novo → waiting', r && r.t === 'ok' && !!voltou, { r, voltou });
  checar('2 ação: depois de tudo isso, nenhum plano de um jogador apareceu para o outro (8 e 6 do primeiro, 3 do segundo)',
    !vazou(b, 8) && !vazou(b, 6) && !vazou(b, 7) && !vazou(a, 3), { b8: vazou(b, 8), b6: vazou(b, 6), a3: vazou(a, 3) });

  // 5: os dois prontos → uma rodada processada
  const tAntes = Date.now();
  r = await pedir(b, prontoMsg(1, true));
  const rodA = await esperar(a, m => m.t === 'rodada');
  const rodB = await esperar(b, m => m.t === 'rodada');
  await dormir(700);
  const nA = contar(a, m => m.t === 'rodada' && m.rodada === 1), nB = contar(b, m => m.t === 'rodada' && m.rodada === 1);
  const salaR = ultima(a, 'sala');
  const res = rodA && rodA.resultado;
  const somaOk = res && res.jogadas.every(x => x.ganho === x.plano + x.sorte && x.sorte >= 1 && x.sorte <= 6 && res.pontos[x.slot] === x.ganho);
  checar('5 processar: os dois prontos → cada cliente recebe exatamente um rodada 1, com resultado idêntico',
    r && r.t === 'ok' && !!rodA && !!rodB && nA === 1 && nB === 1 && igual(rodA.resultado, rodB.resultado) && rodA.rodada === 1, { nA, nB, rodA });
  checar('5 processar: a sala segue para a rodada 2 em planning, prontos zerados, ultimo.rodada 1 igual ao evento',
    salaR.sala.partida.rodada === 2 && salaR.sala.partida.estado === 'planning' && igual(salaR.sala.partida.prontos, { 0: false, 1: false })
    && salaR.sala.partida.ultimo.rodada === 1 && igual(salaR.sala.partida.ultimo.resultado, res), salaR);
  checar('5 processar: os planos 6 e 3 e as sortes de 1 a 6 estão no resultado e os pontos são a soma dos ganhos',
    somaOk && res.jogadas.length === 2 && res.jogadas[0].plano === 6 && res.jogadas[1].plano === 3, res);
  const vistaP = ultima(a, 'vista'), vistaPB = ultima(b, 'vista');
  checar('5 processar: as vistas depois da rodada têm meuPlano null, os pontos novos e um item de histórico',
    vistaP.vista.meuPlano === null && vistaPB.vista.meuPlano === null && igual(vistaP.vista.pontos, res.pontos)
    && vistaP.vista.historico.length === 1 && vistaP.vista.historico[0].rodada === 1 && vistaP.vista.rivalDecidiu === false, vistaP);
  T.resultado1 = res;
  T.demora1 = Date.now() - tAntes;

  // 8: determinismo (as mesmas regras no Node, com o mesmo código, rodada e planos)
  const mundo = regrasTeste.iniciar([{ slot: 0 }, { slot: 1 }]);
  mundo.planos = { 0: 6, 1: 3 };
  const noNode = regrasTeste.processar(mundo, 1, criarRnd(M.codigo, 1)).resultado;
  checar('8 determinismo: o resultado do servidor é igual ao das regras rodadas no Node com o mesmo código, rodada e planos',
    igual(noNode, res), { servidor: res, node: noNode });

  // 6: rajada de pronto (rodada 2): cada um manda 6 de uma vez
  await pedir(a, planejar(2, 2));
  await pedir(b, planejar(2, 9));
  await folga(a, 7); await folga(b, 7);
  const lerA = a.msgs.length, lerB = b.msgs.length;
  for(let i = 0; i < 6; i++){
    mandarJa(a, Object.assign({ id: 'ra' + i }, prontoMsg(2, true)));
    mandarJa(b, Object.assign({ id: 'rb' + i }, prontoMsg(2, true)));
  }
  const rod2A = await esperar(a, m => m.t === 'rodada' && m.rodada === 2);
  const rod2B = await esperar(b, m => m.t === 'rodada' && m.rodada === 2);
  await dormir(900);
  const respostas = [...a.msgs.slice(lerA), ...b.msgs.slice(lerB)].filter(m => (m.t === 'ok' || m.t === 'erro') && /^r[ab]\d$/.test(m.id));
  const permitidas = respostas.every(m => m.t === 'ok' || m.codigo === 'processando' || m.codigo === 'rodada');
  const vistaR = ultima(a, 'vista'), salaRaj = ultima(a, 'sala');
  checar('6 rajada: 12 pronto ao mesmo tempo (6 de cada) → a rodada 2 é processada uma vez só: um evento rodada por cliente, igual nos dois',
    !!rod2A && !!rod2B && contar(a, m => m.t === 'rodada' && m.rodada === 2) === 1 && contar(b, m => m.t === 'rodada' && m.rodada === 2) === 1
    && igual(rod2A.resultado, rod2B.resultado), { rod2A, rod2B });
  checar('6 rajada: as 12 mensagens foram respondidas (ok ou erro processando/rodada) e o histórico tem uma entrada só da rodada 2',
    respostas.length === 12 && permitidas && vistaR.vista.historico.filter(h => h.rodada === 2).length === 1
    && vistaR.vista.historico.length === 2 && salaRaj.sala.partida.rodada === 3 && salaRaj.sala.partida.estado === 'planning',
    { n: respostas.length, codigos: respostas.map(m => m.codigo || m.t), historico: vistaR.vista.historico.map(h => h.rodada), salaRaj: salaRaj.sala.partida });
  const pontos2 = rod2A && rod2A.resultado.pontos;
  const pontosSoma = vistaR.vista.historico.reduce((acc, h) => { for(const x of h.jogadas) acc[x.slot] = (acc[x.slot] || 0) + x.ganho; return acc; }, {});
  checar('6 rajada: os pontos acumulados são a soma dos ganhos das duas rodadas', igual(pontos2, pontosSoma), { pontos2, pontosSoma });

  // 7: pedidos de uma rodada velha
  await dormir(200);
  const antesA = a.msgs.length, antesB = b.msgs.length, vAntes7 = vDe(a);
  const velhos = [
    await pedir(a, prontoMsg(1, true)), await pedir(a, planejar(2, 5)),
    await pedir(b, prontoMsg(2, true)), await pedir(b, planejar(1, 5))
  ];
  await dormir(400);
  const novas = [...a.msgs.slice(antesA), ...b.msgs.slice(antesB)].filter(m => m.t === 'sala' || m.t === 'vista' || m.t === 'rodada');
  checar('7 rodada velha: pronto e ação com a rodada antiga → erro rodada, sem nenhuma sala, vista ou evento novo e v igual',
    velhos.every(x => x && x.t === 'erro' && x.codigo === 'rodada') && novas.length === 0 && vDe(a) === vAntes7, { velhos, novas });

  // 10: reconexão com pronto guardado e a rodada parada
  r = await pedir(a, planejar(3, 6));
  r = await pedir(a, prontoMsg(3, true));
  await esperar(b, m => m.t === 'sala' && m.sala.partida && m.sala.partida.estado === 'waiting' && m.sala.partida && m.sala.partida.rodada === 3);
  a.ws.close(1000);
  const caiu = await esperar(b, m => m.t === 'jogadores' && m.jogadores[0].conectado === false);
  const rodadasAntes = contar(b, m => m.t === 'rodada');
  await dormir(1800);
  const a2 = M.a = ligar(await abrir(base, M.codigo, M.A.ficha), M.codigo, 0);
  const est2 = await esperar(a2, m => m.t === 'estado');
  const vis2 = await esperar(a2, m => m.t === 'vista');
  const voltou2 = await esperar(b, m => m.t === 'jogadores' && m.jogadores[0].conectado === true);
  const ordem = a2.msgs.findIndex(m => m.t === 'estado') < a2.msgs.findIndex(m => m.t === 'vista');
  checar('10 reconexão: o outro vê conectado false e depois true; com um jogador ausente e o outro sem estar pronto a rodada não avança',
    !!caiu && !!voltou2 && contar(b, m => m.t === 'rodada') === rodadasAntes && est2.sala.partida.rodada === 3, { caiu, voltou2, est2 });
  checar('10 reconexão: quem volta continua pronto e recebe estado (com a partida) e depois a sua vista com o plano 6',
    est2 && vis2 && ordem && est2.sala.partida.estado === 'waiting' && igual(est2.sala.partida.prontos, { 0: true, 1: false })
    && vis2.vista.meuPlano === 6 && vis2.vista.rivalDecidiu === false, { est2, vis2 });
  r = await pedir(b, planejar(3, 4));
  const vB = await esperar(b, m => m.t === 'vista' && m.vista.meuPlano === 4);
  const vA = await esperar(a2, m => m.t === 'vista' && m.vista.rivalDecidiu === true);
  checar('10 reconexão: o outro planeja 4 sem ficar pronto (decisão pendente para depois do reinício)', r && r.t === 'ok' && !!vB && !!vA, { r, vB, vA });
  await dormir(200);
  Object.assign(T.M = {}, {
    codigo: M.codigo, fichaA: M.A.ficha, fichaB: M.B.ficha, v: vDe(a2), pontos: vB.vista.pontos,
    ultimo: ultima(a2, 'sala').sala.partida.ultimo
  });
  a2.ws.close(1000); b.ws.close(1000);

  // 9: falha no processamento e nova tentativa
  const F = await salaIniciada(base, versao);
  r = await pedir(F.a, { t: '__falhar' });
  checar('9 falha: __falhar no desenvolvimento → ok', r && r.t === 'ok', r);
  await pedir(F.a, prontoMsg(1, true));
  const tPronto = Date.now();
  await pedir(F.b, prontoMsg(1, true));
  await dormir(500);
  const rodaramLogo = contar(F.a, m => m.t === 'rodada') + contar(F.b, m => m.t === 'rodada');
  const b2 = ligar(await abrir(base, F.codigo, F.B.ficha), F.codigo, 1);
  const estF = await esperar(b2, m => m.t === 'estado');
  const visF = await esperar(b2, m => m.t === 'vista');
  checar('9 falha: com os dois prontos a rodada falha — nenhum evento rodada, partida continua em processing e falhas 1 (visto numa conexão nova)',
    rodaramLogo === 0 && estF && estF.sala.partida.estado === 'processing' && estF.sala.partida.falhas === 1 && estF.sala.partida.rodada === 1 && !!visF, { rodaramLogo, estF });
  r = await pedir(b2, planejar(1, 5));
  const r5 = await pedir(b2, prontoMsg(1, false));
  checar('9 falha: durante o processamento, ação e pronto → erro processando', r && r.codigo === 'processando' && r5 && r5.codigo === 'processando', [r, r5]);
  const rodF = await esperar(F.a, m => m.t === 'rodada', 3500);
  const tRodada = Date.now();
  const rodF2 = await esperar(b2, m => m.t === 'rodada', 1500);
  await dormir(900);
  const salaF = ultima(F.a, 'sala'), visFim = ultima(F.a, 'vista');
  checar('9 falha: a nova tentativa (depois de ~1,5 s) processa a rodada exatamente uma vez, igual para os dois clientes',
    !!rodF && !!rodF2 && tRodada - tPronto >= 1200 && contar(F.a, m => m.t === 'rodada') === 1 && contar(b2, m => m.t === 'rodada') === 1
    && igual(rodF.resultado, rodF2.resultado) && rodF.rodada === 1, { dt: tRodada - tPronto, rodF });
  checar('9 falha: depois do sucesso a sala está na rodada 2 em planning, falhas 0, e o histórico tem uma entrada',
    salaF.sala.partida.rodada === 2 && salaF.sala.partida.estado === 'planning' && salaF.sala.partida.falhas === 0
    && visFim.vista.historico.length === 1, { salaF: salaF.sala.partida, visFim });
  const semFalha = regrasTeste.processar(regrasTeste.iniciar([{ slot: 0 }, { slot: 1 }]), 1, criarRnd(F.codigo, 1)).resultado;
  checar('8 determinismo: o resultado da nova tentativa é o mesmo que as regras dão no Node para esse código e rodada (sem planos)',
    igual(semFalha, rodF && rodF.resultado), { semFalha, rodF });
  F.a.ws.close(1000); b2.ws.close(1000);

  // 12 (preparação): sala travada em processing com o alarme pendente; rodar.mjs derruba o servidor logo em seguida
  const K = await salaIniciada(base, versao);
  await pedir(K.a, { t: '__falhar' });
  await pedir(K.a, planejar(1, 4));
  await pedir(K.b, planejar(1, 9));
  await pedir(K.a, prontoMsg(1, true));
  const tK = Date.now();
  await pedir(K.b, prontoMsg(1, true));
  const kb = ligar(await abrir(base, K.codigo, K.B.ficha), K.codigo, 1);
  const estK = await esperar(kb, m => m.t === 'estado');
  const travado = Date.now() - tK;
  checar('12 queda no meio: sala travada em processing com 1 falha e nenhum evento rodada; o servidor é derrubado em seguida (' + travado + ' ms depois da falha, antes da nova tentativa de 1500 ms)',
    estK && estK.sala.partida.estado === 'processing' && estK.sala.partida.falhas === 1 && estK.sala.partida.rodada === 1
    && contar(K.a, m => m.t === 'rodada') === 0 && travado < 1000, { travado, estK });
  T.K = { codigo: K.codigo, fichaA: K.A.ficha, fichaB: K.B.ficha };
}

/* ---- fase 2: depois de reiniciar o servidor sobre o mesmo storage ---- */

export async function fase2({ base, versao, estado }){
  console.log('\nTurnos, depois de reiniciar o servidor (mesmo storage)');
  limites.clear();
  const { M, K } = estado.turnos;

  // 11: persistência da partida
  const a = ligar(await abrir(base, M.codigo, M.fichaA), M.codigo, 0);
  const b = ligar(await abrir(base, M.codigo, M.fichaB), M.codigo, 1);
  const estA = await esperar(a, m => m.t === 'estado');
  const estB = await esperar(b, m => m.t === 'estado');
  const visA = await esperar(a, m => m.t === 'vista');
  const visB = await esperar(b, m => m.t === 'vista');
  const p = estA && estA.sala.partida;
  checar('11 persistência: partida, rodada 3, prontos {0:true,1:false}, último resultado, v e estado "partida" intactos depois do reinício',
    p && p.estado === 'waiting' && p.rodada === 3 && igual(p.prontos, { 0: true, 1: false }) && igual(p.ultimo, M.ultimo)
    && p.ultimo.rodada === 2 && estA.sala.estado === 'partida' && estA.v === M.v && igual(estA.sala.partida, estB.sala.partida), { p, vEsperado: M.v, v: estA && estA.v });
  checar('11 persistência: pontos e planos privados intactos (meuPlano 6 e 4, rivalDecidiu true nos dois, histórico com 2 rodadas)',
    visA && visB && igual(visA.vista.pontos, M.pontos) && visA.vista.meuPlano === 6 && visB.vista.meuPlano === 4
    && visA.vista.rivalDecidiu === true && visB.vista.rivalDecidiu === true && visA.vista.historico.length === 2
    && igual(visA.vista.historico, visB.vista.historico), { visA, visB });
  const r = await pedir(b, prontoMsg(3, true));
  const rodA = await esperar(a, m => m.t === 'rodada' && m.rodada === 3);
  const rodB = await esperar(b, m => m.t === 'rodada' && m.rodada === 3);
  await dormir(500);
  const res = rodA && rodA.resultado;
  checar('11 persistência: a decisão pendente sobreviveu — o segundo pronto processa a rodada 3 com os planos 6 e 4, uma vez só',
    r && r.t === 'ok' && !!rodA && !!rodB && igual(rodA.resultado, rodB.resultado) && contar(a, m => m.t === 'rodada') === 1
    && res.jogadas[0].plano === 6 && res.jogadas[1].plano === 4
    && res.jogadas.every(x => res.pontos[x.slot] === M.pontos[x.slot] + x.ganho), { res, pontosAntes: M.pontos });
  a.ws.close(1000); b.ws.close(1000);

  // 12: recuperação depois da queda no meio do processamento
  const ka = ligar(await abrir(base, K.codigo, K.fichaA), K.codigo, 0);
  const kb = ligar(await abrir(base, K.codigo, K.fichaB), K.codigo, 1);
  const kEst = await esperar(ka, m => m.t === 'estado');
  await esperar(kb, m => m.t === 'estado');
  const estavaTravada = kEst && kEst.sala.partida.estado === 'processing';
  let rodK = null;
  if(estavaTravada) rodK = await esperar(ka, m => m.t === 'rodada', 5000);
  await dormir(2600);      // tempo de sobra para uma segunda (indevida) tentativa aparecer
  const kRod = contar(ka, m => m.t === 'rodada') + contar(kb, m => m.t === 'rodada');
  ka.ws.close(1000);
  const ka2 = ligar(await abrir(base, K.codigo, K.fichaA), K.codigo, 0);
  const kEst2 = await esperar(ka2, m => m.t === 'estado');
  const kVis2 = await esperar(ka2, m => m.t === 'vista');
  const pk = kEst2 && kEst2.sala.partida;
  checar('12 recuperação: depois da queda no meio do processamento ('
    + (estavaTravada ? 'a sala acordou ainda em processing e terminou sozinha' : 'a sala já tinha terminado a rodada sozinha, pelo alarme, antes da conexão') + '), a rodada avançou uma vez: rodada 2, planning, ultimo.rodada 1',
    pk && pk.rodada === 2 && pk.estado === 'planning' && pk.ultimo && pk.ultimo.rodada === 1 && pk.falhas === 0 && igual(pk.prontos, { 0: false, 1: false }), { pk, estavaTravada });
  checar('12 recuperação: o histórico tem uma entrada só (rodada 1 com os planos 4 e 9), nenhum evento rodada repetido e os pontos batem com os ganhos',
    kVis2 && kVis2.vista.historico.length === 1 && kVis2.vista.historico[0].rodada === 1
    && kVis2.vista.historico[0].jogadas.map(x => x.plano).join() === '4,9'
    && kVis2.vista.historico[0].jogadas.every(x => kVis2.vista.pontos[x.slot] === x.ganho) && igual(pk.ultimo.resultado.jogadas, kVis2.vista.historico[0].jogadas)
    && kRod <= (estavaTravada ? 2 : 0) && (!estavaTravada || (!!rodK && contar(ka, m => m.t === 'rodada') === 1)), { kVis2, kRod, estavaTravada });
  const noNode = regrasTeste.processar(Object.assign(regrasTeste.iniciar([{ slot: 0 }, { slot: 1 }]), { planos: { 0: 4, 1: 9 } }), 1, criarRnd(K.codigo, 1)).resultado;
  checar('8 determinismo: a rodada recuperada depois da queda é igual à das regras no Node (mesmo código, rodada e planos)', igual(noNode, pk && pk.ultimo.resultado), { noNode, servidor: pk && pk.ultimo });
  ka2.ws.close(1000); kb.ws.close(1000);
}
