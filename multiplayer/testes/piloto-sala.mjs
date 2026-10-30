/* Verificações da sala de piloto (Fase 4) contra um wrangler dev de verdade: lobby com série, ano e
   o piloto de cada um, dados privados, ações da temporada, uma rodada de corridas com dois clientes
   WebSocket, uma sala com idades diferentes jogada até o fim do ano (academia/propostas/ano novo),
   ação repetida e, depois de reiniciar o servidor, a sala voltando e a próxima rodada processando uma
   vez só. rodar.mjs chama fase1 antes de reiniciar o servidor e fase2 depois. Cada socket fica
   abaixo de 20 mensagens por 10 s. */
import { checar, dormir, api, esperar, abrir } from './salas.mjs';

const IP = '10.77.0.3';                // chave própria no limite de criação de salas
const JANELA = 10000, MAX_ENVIO = 17;
const limites = new Map();             // "codigo:slot" -> instantes dos últimos envios
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
  const id = m.id !== undefined ? m.id : 'P' + (++seq);
  await mandar(c, Object.assign({ id }, m));
  return esperar(c, x => (x.t === 'ok' || x.t === 'erro') && x.id === id, ms);
}
const acao = (c, rodada, tipo, dados) => pedir(c, { t: 'acao', rodada, tipo, dados });
const pronto = (c, rodada, p = true) => pedir(c, { t: 'pronto', rodada, pronto: p });
const vDe = c => Math.max(0, ...c.msgs.filter(m => typeof m.v === 'number').map(m => m.v));
const ultimaVista = c => { for(let i = c.msgs.length - 1; i >= 0; i--) if(c.msgs[i].t === 'vista') return c.msgs[i]; return null; };
/* espera a vista mais recente chegar (a do último v que o cliente viu) e devolve a vista inteira */
async function atual(c, ms = 10000){
  const limite = Date.now() + ms;
  while(Date.now() < limite){
    const v = ultimaVista(c);
    if(v && v.v === vDe(c)) return v.vista;
    await dormir(40);
  }
  const v = ultimaVista(c);
  return v ? v.vista : null;
}
const sodois = async (a, b) => [await atual(a), await atual(b)];
const eq = (x, y) => JSON.stringify(x) === JSON.stringify(y);
const rodadaMsg = (c, n, ms = 60000) => esperar(c, m => m.t === 'rodada' && m.rodada === n, ms);

async function novaSala(base, versao, nomeA, nomeB){
  let r = await api(base, '/api/salas', { nome: nomeA, modo: 'piloto', versao }, { ip: IP });
  const A = r.json || {};
  const a = ligar(await abrir(base, A.codigo, A.ficha), A.codigo, 0);
  await esperar(a, m => m.t === 'estado');
  r = await api(base, `/api/salas/${A.codigo}/entrar`, { nome: nomeB, versao }, { ip: IP });
  const B = r.json || {};
  const b = ligar(await abrir(base, A.codigo, B.ficha), A.codigo, 1);
  await esperar(b, m => m.t === 'estado');
  return { A, B, a, b };
}
async function iniciarCom(a, b, pa, pb){
  await pedir(a, { t: 'escolherPiloto', piloto: pa });
  await pedir(b, { t: 'escolherPiloto', piloto: pb });
  const r = await pedir(a, { t: 'iniciar' }, 60000);
  await esperar(a, m => m.t === 'sala' && m.sala.partida, 60000); await esperar(b, m => m.t === 'sala' && m.sala.partida, 60000);
  return r;
}

export async function fase1({ base, versao, estado }){
  console.log('\nSala de piloto, antes de reiniciar o servidor');
  limites.clear();
  const E = estado.piloto = {};

  // 1: lobby, escolha dos pilotos, início
  const { A, B, a, b } = await novaSala(base, versao, 'Ana', 'Bia');
  Object.assign(E, { codigo: A.codigo, fichaA: A.ficha, fichaB: B.ficha });
  checar('1 sala de piloto: configuração padrão (velocidade 8, f1, 2024, sem pilotos)',
    eq(A.sala && A.sala.config, { velocidade: 8, serie: 'f1', ano: 2024, pilotos: {} }), A.sala && A.sala.config);
  let r = await pedir(b, { t: 'configurar', config: { ano: 2019 } });
  checar('1 o convidado configura → erro anfitriao', r && r.t === 'erro' && r.codigo === 'anfitriao', r);
  r = await pedir(a, { t: 'configurar', config: { serie: 'wec' } });
  checar('1 série fora da lista → erro config', r && r.t === 'erro' && r.codigo === 'config', r);
  r = await pedir(a, { t: 'configurar', config: { ano: 1800 } });
  checar('1 ano antes da primeira era → erro config', r && r.t === 'erro' && r.codigo === 'config', r);
  r = await pedir(a, { t: 'configurar', config: { ano: 2024 } });
  checar('1 o anfitrião configura o ano 2024 → ok', r && r.t === 'ok', r);
  const bom = { nome: 'Ana Silva', cc: 'BR', idade: 20, estilo: 'equilibrado' };
  r = await pedir(a, { t: 'escolherPiloto', piloto: Object.assign({}, bom, { idade: 99 }) });
  const r2 = await pedir(a, { t: 'escolherPiloto', piloto: Object.assign({}, bom, { estilo: 'bogus' }) });
  const r3 = await pedir(a, { t: 'escolherPiloto', piloto: Object.assign({}, bom, { cc: 'Brasil' }) });
  checar('1 escolherPiloto inválido (idade 99, estilo bogus, cc "Brasil") → erro piloto nos três',
    [r, r2, r3].every(x => x && x.t === 'erro' && x.codigo === 'piloto'), [r, r2, r3]);
  r = await pedir(a, { t: 'escolherPiloto', piloto: bom });
  const salaA = await esperar(b, m => m.t === 'sala' && m.sala.config.pilotos && m.sala.config.pilotos[0]);
  checar('1 escolherPiloto: o anfitrião escolhe Ana Silva → ok e a sala mostra o piloto', r && r.t === 'ok' && salaA && salaA.sala.config.pilotos[0].nome === 'Ana Silva', r);
  r = await pedir(b, { t: 'escolherPiloto', piloto: Object.assign({}, bom, { nome: 'ana silva', cc: 'PT' }) });
  checar('1 o mesmo nome do outro piloto → erro piloto', r && r.t === 'erro' && r.codigo === 'piloto', r);
  r = await pedir(a, { t: 'iniciar' });
  checar('1 iniciar sem os dois pilotos → erro pilotos', r && r.t === 'erro' && r.codigo === 'pilotos', r);
  const t0 = Date.now();
  r = await iniciarCom(a, b, bom, { nome: 'Bia Costa', cc: 'PT', idade: 20, estilo: 'agressivo' });
  console.log(`    (iniciar levou ${Date.now() - t0} ms)`);
  const [VA, VB] = await sodois(a, b);
  const sa = a.msgs.find(m => m.t === 'sala' && m.sala.partida);
  const nomeDe = (S, id) => ((S.season.field.find(f => f.id === id)) || {}).name;
  checar('1 iniciar com os dois pilotos → partida com regras piloto, fase temporada; cada vista tem o próprio piloto, ME = ele e ME2 = o outro',
    r && r.t === 'ok' && sa && sa.sala.partida.regras === 'piloto' && sa.sala.partida.rodada === 1 && VA && VB && VA.fase === 'temporada'
    && VA.S.driver.name === 'Ana Silva' && VB.S.driver.name === 'Bia Costa'
    && nomeDe(VA.S, 'ME') === 'Ana Silva' && nomeDe(VA.S, 'ME2') === 'Bia Costa' && nomeDe(VB.S, 'ME') === 'Bia Costa' && nomeDe(VB.S, 'ME2') === 'Ana Silva',
    { r, a: VA && VA.S.driver.name, b: VB && VB.S.driver.name });

  // 3: ações (cada uma muda só quem agiu)
  r = await acao(a, 1, 'setResp', { i: 0, v: 1 });
  const rf = await acao(a, 1, 'escolherFoco', { k: Object.keys(VA.S.focos || { velocidade: 1 })[0] || 'velocidade' });
  const ri = await acao(a, 1, 'investir', { v: 100000 });
  const [XA, XB] = await sodois(a, b);
  checar('3 setResp / escolherFoco / investir(100000) → ok com avisos; mudam só quem agiu',
    [r, rf, ri].every(x => x && x.t === 'ok' && Array.isArray(x.resultado.avisos))
    && XA.S.season.setup.resp[0] === 1 && !(XB.S.season.setup && XB.S.season.setup.resp && XB.S.season.setup.resp[0])
    && !!XA.S.foco && !XB.S.foco && XA.S.money.invest === 100000 && XB.S.money.invest === 0, { r, rf, ri, fA: XA.S.foco, fB: XB.S.foco });
  const dados = [await acao(a, 1, 'investir', { v: 123 }), await acao(a, 1, 'pagarTeste', { v: 1 }), await acao(a, 1, 'setResp', { i: 0, v: 5 }),
    await acao(a, 1, 'setFilo', { k: 'nada' })];
  checar('3 valores inválidos (investir 123, pagarTeste 1, setResp v 5, setFilo desconhecido) → erro dados', dados.every(x => x && x.t === 'erro' && x.codigo === 'dados'), dados);
  r = await acao(b, 1, 'academia', { i: null });
  checar('3 uma ação do mercado na temporada → erro fase', r && r.t === 'erro' && r.codigo === 'fase', r);
  r = await acao(b, 1, 'naoExiste', {});
  checar('3 ação desconhecida → erro acao', r && r.t === 'erro' && r.codigo === 'acao', r);
  r = await acao(b, 1, 'setupEngenheiro', {});
  const [, EB] = await sodois(a, b);
  checar('3 setupEngenheiro → ok, o aviso do jogo volta e o carro de quem pediu sai montado (sem mexer no do outro)',
    r && r.t === 'ok' && (r.resultado.avisos || []).some(t => /engenheiro/i.test(t))
    && EB.S.season.setup && EB.S.season.setup.auto === false && EB.S.season.setupRound === EB.S.season.round
    && XA.S.season.setup.resp[0] === 1, { r, setup: EB.S.season.setup });

  // 2: dados privados
  const jA = JSON.stringify(XA), jB = JSON.stringify(XB);
  checar('2 a vista de cada um não traz o dinheiro, o contrato nem os atributos do outro',
    XA.S.money.invest !== XB.S.money.invest && !jB.includes(JSON.stringify(XA.S.money)) && !jA.includes(JSON.stringify(XB.S.money))
    && !jA.includes(JSON.stringify(XB.S.driver.attr)) && !jB.includes(JSON.stringify(XA.S.driver.attr))
    && (!XB.S.contract || !jA.includes(JSON.stringify(XB.S.contract)) || eq(XA.S.contract, XB.S.contract)),
    { a: Object.keys(XA.S).length });

  // 6: a mesma ação com o mesmo id aplica uma vez só
  const v0 = vDe(b);
  const d1 = await pedir(b, { t: 'acao', id: 'dup-1', rodada: 1, tipo: 'setResp', dados: { i: 1, v: 1 } });
  const d2 = await pedir(b, { t: 'acao', id: 'dup-1', rodada: 1, tipo: 'setResp', dados: { i: 1, v: 1 } });
  await dormir(500);
  const subidas = new Set(b.msgs.filter(m => m.t === 'sala' && m.v > v0).map(m => m.v)).size;
  checar('6 dedupe: o mesmo id duas vezes → a mesma resposta e a versão sobe uma vez só', d1 && d2 && d1.t === 'ok' && eq(d1, d2) && subidas === 1, { d1, d2, subidas });

  // 4: uma rodada da sala
  const pa = await pronto(a, 1), pb = await pronto(b, 1);
  const ra = await rodadaMsg(a, 1), rb = await rodadaMsg(b, 1);
  const [YA, YB] = await sodois(a, b);
  const e = ra && ra.resultado;
  checar('4 os dois prontos → uma rodada tipo corridas, idêntica para os dois; uma entrada por piloto que correu, com o top 10',
    pa && pb && pa.t === 'ok' && pb.t === 'ok' && ra && rb && eq(ra.resultado, rb.resultado) && e.tipo === 'corridas' && e.etapas.length === 2
    && e.etapas.map(x => x.slot).join() === '0,1' && e.etapas[0].gp === e.etapas[1].gp && e.etapas[0].top.length === 10 && e.etapas[0].venc === e.etapas[0].top[0].nome
    && e.etapas[0].top.every(x => 'pos' in x && x.nome && x.equipe) && !JSON.stringify(e).includes('saldo'), e);
  checar('4 as duas vistas andam juntas: a mesma etapa e a tabela de pontos cruzada (ME de um = ME2 do outro)',
    YA.S.season.round === 1 && YB.S.season.round === 1 && (YA.S.season.dstand.ME || 0) === (YB.S.season.dstand.ME2 || 0) && (YA.S.season.dstand.ME2 || 0) === (YB.S.season.dstand.ME || 0)
    && YA.S.season.results.length === 1 && YB.S.season.results.length === 1,
    { a: YA.S.season.dstand, b: YB.S.season.dstand });
  E.vistaA = JSON.stringify(ultimaVista(a).vista); E.vistaB = JSON.stringify(ultimaVista(b).vista);
  a.ws.close(); b.ws.close();
  await dormir(300);

  // 5: outra sala, idades diferentes: um ano inteiro, o mercado e o ano novo
  const s2 = await novaSala(base, versao, 'Caio', 'Duda');
  const { a: a2, b: b2 } = s2;
  await iniciarCom(a2, b2, { nome: 'Caio Lima', cc: 'BR', idade: 16, estilo: 'tecnico' }, { nome: 'Duda Reis', cc: 'AR', idade: 21, estilo: 'equilibrado' });
  let [W1, W2] = await sodois(a2, b2);
  const dif = W1.S.season.cat !== W2.S.season.cat;
  let n = 1, fim = false, rodadasIguais = true, ultimo = null;
  const t1 = Date.now();
  while(!fim && n <= 30){
    const p1 = await pronto(a2, n), p2 = await pronto(b2, n);
    const q1 = await rodadaMsg(a2, n), q2 = await rodadaMsg(b2, n);
    if(!(p1 && p2 && p1.t === 'ok' && p2.t === 'ok' && q1 && q2 && eq(q1.resultado, q2.resultado))) rodadasIguais = false;
    ultimo = q1 && q1.resultado; fim = !!(ultimo && ultimo.fimAno); n++;
  }
  console.log(`    (${n - 1} rodadas até o fim do ano em ${((Date.now() - t1) / 1000).toFixed(1)} s)`);
  [W1, W2] = await sodois(a2, b2);
  checar(`5 categorias diferentes (${W1 && W1.S.season.cat} × ${W2 && W2.S.season.cat}): ${n - 1} rodadas até aparecer fimAno, iguais para os dois, e as duas vistas ficam em mercado`,
    dif && rodadasIguais && fim && ultimo.tipo === 'corridas' && W1.fase === 'mercado' && W2.fase === 'mercado', { dif, rodadasIguais, fim, fase: W1 && W1.fase });
  const anoAntes = W1.S.year;
  /* academia (se houver) fica de lado; sem escolha, o pronto é recusado */
  for(const [c, V] of [[a2, W1], [b2, W2]]){
    if((V.S.academyOffers || []).length) await acao(c, n, 'academia', { i: null });
  }
  let pe = await pronto(a2, n);
  checar('5 mercado: pronto sem escolher a proposta → erro proposta', pe && pe.t === 'erro' && pe.codigo === 'proposta', pe);
  [W1, W2] = await sodois(a2, b2);
  checar('5 mercado: cada um tem as próprias propostas', (W1.S.pendingOffers || []).length > 0 && (W2.S.pendingOffers || []).length > 0, [(W1.S.pendingOffers || []).length, (W2.S.pendingOffers || []).length]);
  const escolhivel = V => (V.S.pendingOffers || []).findIndex(o => !o.retirada && o.podeP !== false && (!o.sk || o.sk === V.S.series));
  const po = await acao(a2, n, 'pedirOferta', { i: escolhivel(W1), k: 'anos' });
  const ruim = await acao(a2, n, 'escolherOferta', { i: 99 });
  [W1, W2] = await sodois(a2, b2);
  checar('5 mercado: pedirOferta → ok com avisos; escolherOferta de proposta que não existe → erro proposta',
    po && po.t === 'ok' && Array.isArray(po.resultado.avisos) && ruim && ruim.t === 'erro' && ruim.codigo === 'proposta', { po, ruim });
  const eA = await acao(a2, n, 'escolherOferta', { i: escolhivel(W1) }), eB = await acao(b2, n, 'escolherOferta', { i: escolhivel(W2) });
  const prA = await pronto(a2, n), prB = await pronto(b2, n);
  const ro1 = await rodadaMsg(a2, n), ro2 = await rodadaMsg(b2, n);
  [W1, W2] = await sodois(a2, b2);
  checar('5 as propostas escolhidas e os dois prontos → rodada tipo anoNovo, igual para os dois; as vistas mostram o ano seguinte, fase temporada e sem a escolha velha',
    [eA, eB, prA, prB].every(x => x && x.t === 'ok') && ro1 && ro2 && eq(ro1.resultado, ro2.resultado) && ro1.resultado.tipo === 'anoNovo' && ro1.resultado.ano === anoAntes + 1
    && W1.fase === 'temporada' && W2.fase === 'temporada' && W1.S.year === anoAntes + 1 && W2.S.year === anoAntes + 1
    && W1.S.season.year === anoAntes + 1 && W1.S.season.round === 0 && W1.S.mpEscolha === undefined, { eA, eB, prA, prB, ano: ro1 && ro1.resultado, f: W1 && W1.fase, y: W1 && W1.S.year });
  a2.ws.close(); b2.ws.close();
  await dormir(300);
}

export async function fase2({ base, versao, estado }){
  console.log('\nSala de piloto, depois de reiniciar o servidor (mesmo storage)');
  limites.clear();
  const E = estado.piloto;
  if(!E){ checar('7 a fase 1 da sala de piloto deixou o estado para a fase 2', false); return; }
  const a = ligar(await abrir(base, E.codigo, E.fichaA), E.codigo, 0);
  const b = ligar(await abrir(base, E.codigo, E.fichaB), E.codigo, 1);
  const ea = await esperar(a, m => m.t === 'estado', 30000), eb = await esperar(b, m => m.t === 'estado', 30000);
  await sodois(a, b);
  const va = ultimaVista(a), vb = ultimaVista(b);
  checar('7 depois de reiniciar: a sala de piloto reconecta, na rodada 2, com a mesma vista de antes',
    ea && eb && ea.sala.partida.rodada === 2 && ea.sala.partida.regras === 'piloto' && va && vb
    && JSON.stringify(va.vista) === E.vistaA && JSON.stringify(vb.vista) === E.vistaB, { rodada: ea && ea.sala.partida.rodada });
  await pronto(a, 2); await pronto(b, 2);
  const ra = await rodadaMsg(a, 2), rb = await rodadaMsg(b, 2);
  await dormir(600);
  const [VA, VB] = await sodois(a, b);
  const quantas = a.msgs.filter(m => m.t === 'rodada').length;
  checar('7 a próxima rodada é processada uma vez só (etapa 2), igual para os dois, e o mundo segue coerente',
    ra && rb && quantas === 1 && eq(ra.resultado, rb.resultado) && ra.resultado.tipo === 'corridas' && VA.S.season.round === 2 && VB.S.season.round === 2
    && (VA.S.season.dstand.ME || 0) === (VB.S.season.dstand.ME2 || 0), ra && { tipo: ra.resultado.tipo, quantas });
  a.ws.close(); b.ws.close();
  await dormir(300);
}
