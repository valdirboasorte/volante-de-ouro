/* Verificações da sala de chefe (Fase 3) contra um wrangler dev de verdade: lobby com série, ano
   e equipes, dados privados, ações do inverno, pronto com pendências, um começo de temporada e três
   corridas reais com dois clientes WebSocket, ação repetida e, depois de reiniciar o servidor, a
   sala voltando e a próxima corrida processando uma vez só. rodar.mjs chama fase1 antes de
   reiniciar o servidor e fase2 depois. Cada socket fica abaixo de 20 mensagens por 10 s. */
import { criarMotor } from '../src/gerado/motor-jogo.js';
import { ambienteFalso } from '../src/pagina-falsa.js';
import { checar, dormir, api, esperar, abrir } from './salas.mjs';

const IP = '10.77.0.2';                // chave própria no limite de criação de salas
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
async function pedir(c, m, ms = 20000){
  const id = m.id !== undefined ? m.id : 'C' + (++seq);
  await mandar(c, Object.assign({ id }, m));
  return esperar(c, x => (x.t === 'ok' || x.t === 'erro') && x.id === id, ms);
}
const acao = (c, rodada, tipo, dados) => pedir(c, { t: 'acao', rodada, tipo, dados });
const pronto = (c, rodada, p = true) => pedir(c, { t: 'pronto', rodada, pronto: p });
const vDe = c => Math.max(0, ...c.msgs.filter(m => typeof m.v === 'number').map(m => m.v));
const ultimaVista = c => { for(let i = c.msgs.length - 1; i >= 0; i--) if(c.msgs[i].t === 'vista') return c.msgs[i]; return null; };
/* espera a vista mais recente chegar (a do último v que o cliente viu) e devolve a perspectiva C */
async function atual(c, ms = 10000){
  const limite = Date.now() + ms;
  while(Date.now() < limite){
    const v = ultimaVista(c);
    if(v && v.v === vDe(c)) return v.vista.C;
    await dormir(40);
  }
  const v = ultimaVista(c);
  return v ? v.vista.C : null;
}
const sodois = async (a, b) => [await atual(a), await atual(b)];
const eq = (x, y) => JSON.stringify(x) === JSON.stringify(y);

export async function fase1({ base, versao, estado }){
  console.log('\nSala de chefe, antes de reiniciar o servidor');
  limites.clear();
  const E = estado.chefe = {};
  /* o mesmo motor, aqui no teste, para escolher equipes válidas e saber os nomes delas */
  const amb = ambienteFalso({ seed: 5 });
  const J = criarMotor(amb); J.amb = amb;
  const lista = J.eraOfSeries(2024, 'f1').teams.map((t, i) => [i, J.Engine.resolveTeam(t, i, 2024, 'f1')]).filter(x => x[1]).sort((a, b) => b[1].str - a[1].str);
  const [idxA, nomeA] = [lista[3][0], lista[3][1].name], [idxB, nomeB] = [lista[7][0], lista[7][1].name];

  // 1: lobby
  let r = await api(base, '/api/salas', { nome: 'Ana', modo: 'chefe', versao }, { ip: IP });
  const A = r.json || {};
  const a = ligar(await abrir(base, A.codigo, A.ficha), A.codigo, 0);
  await esperar(a, m => m.t === 'estado');
  r = await api(base, `/api/salas/${A.codigo}/entrar`, { nome: 'Bia', versao }, { ip: IP });
  const B = r.json || {};
  const b = ligar(await abrir(base, A.codigo, B.ficha), A.codigo, 1);
  await esperar(b, m => m.t === 'estado');
  Object.assign(E, { codigo: A.codigo, fichaA: A.ficha, fichaB: B.ficha, nomeA, nomeB });
  checar('1 sala de chefe: configuração padrão (velocidade 8, f1, 2024, sem equipes) e regras ainda vazias',
    eq(A.sala && A.sala.config, { velocidade: 8, sk: 'f1', ano: 2024, equipes: {} }), A.sala && A.sala.config);
  /* as rodadas daqui correm pelo caminho rápido; a corrida ao vivo tem o teste dela (corrida-sala.mjs) */
  r = await pedir(a, { t: 'configurar', config: { ano: 2024, aoVivo: false } });
  checar('1 o anfitrião configura o ano 2024 → ok (só o campo enviado muda)', r && r.t === 'ok', r);
  r = await pedir(b, { t: 'configurar', config: { ano: 2019 } });
  checar('1 o convidado configura → erro anfitriao', r && r.t === 'erro' && r.codigo === 'anfitriao', r);
  r = await pedir(a, { t: 'configurar', config: { ano: 1800 } });
  checar('1 ano sem equipes → erro config', r && r.t === 'erro' && r.codigo === 'config', r);
  r = await pedir(a, { t: 'configurar', config: { sk: 'wec' } });
  checar('1 série fora da lista → erro config', r && r.t === 'erro' && r.codigo === 'config', r);
  r = await pedir(a, { t: 'escolherEquipe', idx: 9999 });
  checar('1 escolherEquipe: índice que não existe → erro equipe', r && r.t === 'erro' && r.codigo === 'equipe', r);
  r = await pedir(a, { t: 'escolherEquipe', idx: idxA });
  checar(`1 escolherEquipe: o anfitrião escolhe a ${nomeA} → ok`, r && r.t === 'ok', r);
  r = await pedir(b, { t: 'escolherEquipe', idx: idxA });
  checar('1 escolherEquipe: o mesmo índice para o convidado → erro equipe', r && r.t === 'erro' && r.codigo === 'equipe', r);
  r = await pedir(a, { t: 'iniciar' });
  checar('1 iniciar sem as duas equipes → erro equipes', r && r.t === 'erro' && r.codigo === 'equipes', r);
  r = await pedir(b, { t: 'escolherEquipe', idx: idxB });
  const salaB = await esperar(b, m => m.t === 'sala' && m.sala.config.equipes && m.sala.config.equipes[1] === idxB);
  checar(`1 escolherEquipe: o convidado escolhe a ${nomeB} → ok e a sala mostra as duas escolhas`, r && r.t === 'ok' && salaB && salaB.sala.config.equipes[0] === idxA, r);
  r = await pedir(a, { t: 'iniciar' });
  const sa = await esperar(a, m => m.t === 'sala' && m.sala.partida, 20000), sb = await esperar(b, m => m.t === 'sala' && m.sala.partida, 20000);
  const [CA, CB] = await sodois(a, b);
  checar('1 iniciar com as duas equipes → partida com regras chefe, rodada 1; cada um vê a equipe que escolheu',
    r && r.t === 'ok' && sa && sb && sa.sala.partida.regras === 'chefe' && sa.sala.partida.rodada === 1 && CA && CB
    && CA.eq.nome === nomeA && CB.eq.nome === nomeB, { r, a: CA && CA.eq && CA.eq.nome, b: CB && CB.eq && CB.eq.nome });
  const vistaA = ultimaVista(a).vista, vistaB = ultimaVista(b).vista;
  checar('1 a vista traz a fase e a perspectiva (fase inverno)', vistaA.fase === 'inverno' && vistaB.fase === 'inverno' && !!vistaA.C.inv, vistaA.fase);

  // 2: dados privados
  const jA = JSON.stringify(vistaA), jB = JSON.stringify(vistaB);
  checar('2 cada vista tem só a própria equipe na raiz: eq, caixa e pilotos diferentes',
    CA.eq.nome !== CB.eq.nome && CA.caixa !== CB.caixa && eq(CA.pilotos.map(p => p.nome).sort(), CA.pilotos.map(p => p.nome).sort())
    && !CA.pilotos.some(p => CB.pilotos.some(q => q.nome === p.nome)));
  const rival = CA.mpOutras && CA.mpOutras[0];
  checar('2 a outra equipe aparece só como o rival EU2 (nome, força e carros)', CA.mpOutras.length === 1 && rival.id === 'EU2' && rival.nome === nomeB && typeof rival.str === 'number' && Array.isArray(rival.carros), rival && Object.keys(rival));
  const nomesPatroB = [...CB.patro, ...CB.inv.patro].map(p => p.nome);
  const unicos = nomesPatroB.filter(n => ![...CA.patro, ...CA.inv.patro].some(p => p.nome === n));
  checar('2 nada privado da outra equipe na vista: o caixa, o livro e os patrocinadores que só ela tem não aparecem',
    !jA.includes(String(CB.caixa)) && !jB.includes(String(CA.caixa)) && (!CB.livro || eq(CA.livro, CB.livro) || !jA.includes(JSON.stringify(CB.livro)))
    && unicos.every(n => !jA.includes(JSON.stringify(n))) && !jA.includes('"vitrine"') && !jB.includes('"vitrine"'),
    { caixaB: CB.caixa, unicos: unicos.length });

  // 3: ações do inverno
  const planoB0 = CB.plano.aero;
  const novoPlano = CA.plano.aero === 3 ? 2 : 3;
  r = await acao(a, 1, 'plano', { area: 'aero', nivel: novoPlano });
  let [x, y] = await sodois(a, b);
  checar('3 plano: muda só o da equipe de quem agiu', r && r.t === 'ok' && x.plano.aero === novoPlano && y.plano.aero === planoB0, { r, a: x.plano, b: y.plano });
  r = await acao(a, 1, 'plano', { area: 'aero', nivel: 99 });
  checar('3 plano com nível fora da faixa → erro dados', r && r.t === 'erro' && r.codigo === 'dados', r);
  const motorB0 = y.motor.nome;
  r = await acao(a, 1, 'motor', { nome: 'Honda', anos: 1 });
  [x, y] = await sodois(a, b);
  checar('3 motor: a escolha é só de quem agiu (ou o fornecedor recusou e nada mudou)',
    r && r.t === 'ok' && y.motor.nome === motorB0 && (r.resultado.ok ? x.motor.nome === 'Honda' : true), { r, a: x.motor.nome, b: y.motor.nome });
  r = await acao(a, 1, 'aceitarContra', {});
  checar('3 aceitarContra sem contraproposta → erro contra', r && r.t === 'erro' && r.codigo === 'contra', r);
  r = await acao(b, 1, 'negociar', { piloto: { mercado: 'Ninguém Assim' }, oferta: { sal: 1, anos: 1, n1: false, papel: 'teste' } });
  checar('3 negociar com quem não está no mercado → erro piloto', r && r.t === 'erro' && r.codigo === 'piloto', r);
  r = await acao(b, 1, 'negociar', { piloto: { mercado: 'x' }, oferta: { sal: 2, anos: 1, n1: false, papel: 'teste' } });
  checar('3 negociar com dados inválidos (salário 2) → erro dados', r && r.t === 'erro' && r.codigo === 'dados', r);
  r = await acao(a, 1, 'dec', { g: 'estr', k: 0, v: 'ataque' });
  checar('3 uma decisão de corrida no inverno → erro fase', r && r.t === 'erro' && r.codigo === 'fase', r);

  // 6 (aqui, ainda no inverno): a mesma ação com o mesmo id aplica uma vez só
  const v0 = vDe(b);
  const r1 = await pedir(b, { t: 'acao', id: 'dup-1', rodada: 1, tipo: 'plano', dados: { area: 'chassi', nivel: 4 } });
  const r2 = await pedir(b, { t: 'acao', id: 'dup-1', rodada: 1, tipo: 'plano', dados: { area: 'chassi', nivel: 4 } });
  await dormir(500);
  const subidas = new Set(b.msgs.filter(m => m.t === 'sala' && m.v > v0).map(m => m.v)).size;
  checar('6 dedupe: o mesmo id duas vezes → a mesma resposta e a versão sobe uma vez só', r1 && r2 && r1.t === 'ok' && eq(r1, r2) && subidas === 1, { r1, r2, subidas });

  // 3/4: dispensar um titular cria a pendência; contratar do mercado resolve
  [x, y] = await sodois(a, b);
  const titular = x.pilotos.find(p => p.papel === 'titular');
  r = await acao(a, 1, 'dispensar', { id: titular.id });
  checar(`3 dispensar o titular ${titular.nome} → ok`, r && r.t === 'ok', r);
  r = await pronto(a, 1);
  checar('4 pronto no inverno com pendência → erro pendencias com a lista (texto) em detalhe', r && r.t === 'erro' && r.codigo === 'pendencias' && Array.isArray(r.detalhe) && r.detalhe.length > 0 && r.detalhe.every(t => typeof t === 'string'), r);
  [x, y] = await sodois(a, b);
  /* os mais modestos primeiro: um astro pode recusar uma equipe pequena, e isso é do jogo */
  const mercado = x.inv.mercado.slice().sort((p, q) => p.hab - q.hab);
  let assinado = null, viuContra = false;
  for(const m of mercado.slice(0, 6)){
    r = await acao(a, 1, 'negociar', { piloto: { mercado: m.nome }, oferta: { sal: 1.3, anos: 1, n1: false, papel: 'titular' } });
    if(!r || r.t !== 'ok') continue;               // sem vaga/superlicença: tenta o próximo
    if(r.resultado.ok){ assinado = m.nome; break; }
    if(r.resultado.contra){
      viuContra = true;
      const c = await acao(a, 1, 'aceitarContra', {});
      if(c && c.t === 'ok'){ assinado = m.nome; break; }
    }
  }
  [x, y] = await sodois(a, b);
  checar(`3 negociar: ${assinado} entra em C.pilotos de quem contratou${viuContra ? ' (pela contraproposta)' : ''} e some do mercado da outra equipe`,
    !!assinado && x.pilotos.some(p => p.nome === assinado) && !y.inv.mercado.some(p => p.nome === assinado) && !x.inv.mercado.some(p => p.nome === assinado), { assinado });
  r = await acao(b, 1, 'negociar', { piloto: { mercado: assinado }, oferta: { sal: 1.3, anos: 1, n1: false, papel: 'teste' } });
  checar('3 a outra equipe tenta o mesmo piloto → erro (já não está no mercado)', r && r.t === 'erro' && r.codigo === 'piloto', r);
  const pa = await pronto(a, 1), pb = await pronto(b, 1);
  checar('4 as pendências resolvidas: os dois ficam prontos', pa && pb && pa.t === 'ok' && pb.t === 'ok', { pa, pb });
  const rod = await esperar(a, m => m.t === 'rodada', 30000), rodB = await esperar(b, m => m.t === 'rodada', 30000);
  const [TA, TB] = await sodois(a, b);
  checar('4 uma rodada tipo inicio, igual para os dois; as duas vistas em temporada com o mesmo calendário',
    rod && rodB && eq(rod.resultado, rodB.resultado) && rod.resultado.tipo === 'inicio' && rod.resultado.ano === 2024
    && TA.fase === 'temporada' && TB.fase === 'temporada' && eq(TA.temporada.calendar.map(c => c.id), TB.temporada.calendar.map(c => c.id)), rod && rod.resultado);

  // 5: três corridas
  let rodadaN = 2;
  for(let n = 1; n <= 3; n++){
    if(n === 1){
      r = await acao(a, rodadaN, 'dec', { g: 'estr', k: 0, v: 'ataque' });
      checar('5 dec: estratégia de ataque no carro 0 → ok', r && r.t === 'ok', r);
      const jn = await acao(b, rodadaN, 'janela', { carro: 0, k: 'tarde' });
      checar('5 janela de classificação do carro 0 → ok', jn && jn.t === 'ok', jn);
    }
    await acao(a, rodadaN, 'acertoAuto', { k: 0 });
    await acao(b, rodadaN, 'dec', { g: 'motor', v: n === 2 ? 'poupar' : 'normal' });
    let pend = true;
    for(let tentativa = 0; pend && tentativa < 4; tentativa++){
      const pa = await pronto(a, rodadaN), pb = await pronto(b, rodadaN);
      pend = false;
      for(const [c, p] of [[a, pa], [b, pb]]){
        if(p && p.t === 'erro' && p.codigo === 'evento'){
          pend = true;
          const ev = await acao(c, rodadaN, 'evento', { i: 0 });
          checar(`5 etapa ${n}: um acontecimento bloqueou o pronto (erro evento) e a decisão o resolveu`, ev && ev.t === 'ok' && ev.resultado && typeof ev.resultado.titulo === 'string', ev);
        }
      }
    }
    const ra = await esperar(a, m => m.t === 'rodada', 40000), rb = await esperar(b, m => m.t === 'rodada', 40000);
    const [SA, SB] = await sodois(a, b);
    const ta = SA && SA.temporada, tb = SB && SB.temporada;
    checar(`5 etapa ${n}: a rodada é tipo corrida e idêntica para os dois clientes`, ra && rb && eq(ra.resultado, rb.resultado) && ra.resultado.tipo === 'corrida' && ra.resultado.etapa === n && ra.resultado.top.length === 10 && ra.rodada === rodadaN, ra && ra.resultado && { tipo: ra.resultado.tipo, etapa: ra.resultado.etapa });
    const ultA = (ta.results || []).slice(-1)[0], ultB = (tb.results || []).slice(-1)[0];
    checar(`5 etapa ${n}: mesma rodada, mesma tabela de construtores (EU de um = EU2 do outro) e cada equipe com o seu resultado`,
      ta.round === n && tb.round === n && (ta.cstand.EU || 0) === (tb.cstand.EU2 || 0) && (ta.cstand.EU2 || 0) === (tb.cstand.EU || 0)
      && !!ultA && !!ultB && ultA.r === n && ultB.r === n
      && ultA.nossos.every(p => SA.pilotos.some(q => q.nome === p.nome)) && ultB.nossos.every(p => SB.pilotos.some(q => q.nome === p.nome)),
      { ra: ta.round, rb: tb.round, cs: [ta.cstand.EU, tb.cstand.EU2] });
    E.ultimoResultado = ra && ra.resultado;
    rodadaN++;
  }
  Object.assign(E, { rodada: rodadaN, vistaA: JSON.stringify(ultimaVista(a).vista), vistaB: JSON.stringify(ultimaVista(b).vista), etapas: 3 });
  a.ws.close(); b.ws.close();
  await dormir(300);
}

export async function fase2({ base, versao, estado }){
  console.log('\nSala de chefe, depois de reiniciar o servidor (mesmo storage)');
  limites.clear();
  const E = estado.chefe;
  if(!E){ checar('7 a fase 1 da sala de chefe deixou o estado para a fase 2', false); return; }
  const a = ligar(await abrir(base, E.codigo, E.fichaA), E.codigo, 0);
  const b = ligar(await abrir(base, E.codigo, E.fichaB), E.codigo, 1);
  const ea = await esperar(a, m => m.t === 'estado', 20000), eb = await esperar(b, m => m.t === 'estado', 20000);
  const [CA, CB] = await sodois(a, b);
  const va = ultimaVista(a), vb = ultimaVista(b);
  checar('7 depois de reiniciar: a sala de chefe reconecta, na rodada certa, com a mesma vista de antes',
    ea && eb && ea.sala.partida.rodada === E.rodada && ea.sala.partida.regras === 'chefe' && va && vb
    && JSON.stringify(va.vista) === E.vistaA && JSON.stringify(vb.vista) === E.vistaB, { rodada: ea && ea.sala.partida.rodada, esperada: E.rodada });
  for(const [c, C] of [[a, CA], [b, CB]]){
    if(C && C.evento){ const ev = await acao(c, E.rodada, 'evento', { i: 0 }); checar('7 o acontecimento pendente é resolvido antes do pronto', ev && ev.t === 'ok', ev); }
  }
  await pronto(a, E.rodada); await pronto(b, E.rodada);
  const ra = await esperar(a, m => m.t === 'rodada', 40000), rb = await esperar(b, m => m.t === 'rodada', 40000);
  await dormir(600);
  const [SA, SB] = await sodois(a, b);
  const quantas = a.msgs.filter(m => m.t === 'rodada').length;
  checar('7 a próxima corrida é processada uma vez só (etapa 4), igual para os dois, e o mundo segue coerente',
    ra && rb && quantas === 1 && eq(ra.resultado, rb.resultado) && ra.resultado.tipo === 'corrida' && ra.resultado.etapa === E.etapas + 1
    && SA.temporada.round === E.etapas + 1 && SB.temporada.round === E.etapas + 1 && (SA.temporada.cstand.EU || 0) === (SB.temporada.cstand.EU2 || 0),
    ra && ra.resultado && { tipo: ra.resultado.tipo, etapa: ra.resultado.etapa, quantas });
  a.ws.close(); b.ws.close();
  await dormir(300);
}
