/* A corrida ao vivo em passo travado (Fase 5), sem servidor: o motor do jogo no Node.
   Para cada modo (piloto com os dois na mesma categoria; chefe com duas equipes):
   - a rodada preparada dá uma corrida com os carros dos dois humanos, cada um com o seu dono;
   - a corrida "do servidor" (Corrida) anda num relógio falso, com largada, ordens dos dois e rádio;
   - duas "telas" refazem a mesma corrida só com o que o servidor mandou (entrada, registro, passo
     liberado), andando no ritmo delas: as somas de conferência e o resultado batem com o servidor;
   - uma ordem para o carro do outro é recusada;
   - refazer a corrida a partir do estado salvo no meio dá o mesmo resultado;
   - a rodada concluída com a chegada ao vivo não diverge da preparada, e o resultado da rodada é
     o da corrida.
   Uso: node testes/corrida-mp.mjs   (gere o motor antes: node ferramentas/gerar-motor.mjs) */
import { criarMotor } from '../src/gerado/motor-jogo.js';
import { ambienteFalso } from '../src/pagina-falsa.js';
import { criarRnd } from '../src/aleatorio.js';
import { criarRegrasPiloto } from '../src/regras-piloto.js';
import { criarRegrasChefe } from '../src/regras-chefe.js';
import { ligarCorridas, desligarCorridas, Corrida, aplicar, somaDe, SOMA_CADA } from '../src/corrida-mp.js';

let ok = 0, falhas = 0;
const checar = (nome, cond, detalhe) => { if(cond){ ok++; console.log('  ✓ ' + nome); } else { falhas++; console.log('  ✗ ' + nome + (detalhe === undefined ? '' : ' — ' + JSON.stringify(detalhe).slice(0, 400))); } return !!cond; };
const clone = o => structuredClone(o);

function novoMotor(seed){ const amb = ambienteFalso({ seed }); const J = criarMotor(amb); J.amb = amb; J.Saves.auto = false; return J; }

function preparar(J, regras, mundo, codigo, N){
  const ctl = ligarCorridas(J, 'preparar');
  try { const r = regras.processar(clone(mundo), N, criarRnd(codigo, N)); return { defs: ctl.defs, r }; }
  finally { desligarCorridas(J); }
}
function concluir(J, regras, mundo, codigo, N, resultados){
  const ctl = ligarCorridas(J, 'concluir', resultados);
  try { const r = regras.processar(clone(mundo), N, criarRnd(codigo, N)); return { r, ctl }; }
  finally { desligarCorridas(J); }
}

/* uma tela: a mesma corrida, só com o que o servidor mandou, no passo que ela alcançou */
class Tela {
  constructor(J, ini){
    this.Gp = J.Gp; this.R = J.Gp.criar(clone(ini.ent)); this.passo = 0; this.fila = []; this.vistas = new Set();
    this.liberado = ini.liberado; this.somas = {};
    for(const e of ini.log) this.receber(e);
  }
  receber(e){ if(!this.vistas.has(e.n)){ this.vistas.add(e.n); this.fila.push(e); } }
  aplicarDoPasso(){
    const agora = this.fila.filter(e => e.passo <= this.passo).sort((a, b) => a.n - b.n);
    this.fila = this.fila.filter(e => e.passo > this.passo);
    for(const e of agora) aplicar(this.Gp, this.R, e);
  }
  /* anda até o alvo (no máximo o liberado), como o quadro da tela */
  andar(alvo){
    const R = this.R;
    this.aplicarDoPasso();
    while(this.passo < Math.min(alvo, this.liberado) && !R.fim){
      this.aplicarDoPasso();
      if(R.fim || R.pergunta) break;
      this.Gp.passo(R); this.passo++;
      if(this.passo % SOMA_CADA === 0) this.somas[this.passo] = somaDe(R);
    }
  }
}

/* a corrida inteira num relógio falso: o servidor e duas telas, com ordens e rádio */
function correr(J, def, opcoes){
  const { donos } = def, slots = def.slots, vel = 16;
  let agora = 1000;
  const S = new Corrida(J, def); S.prazo = agora + 45000;
  const ini = () => S.inicio(agora);
  const telas = [new Tela(J, ini()), new Tela(J, ini())];
  const somasServidor = {};
  const recusas = [];
  const mandar = e => telas.forEach(t => t.receber(e));
  const meus = slot => Object.keys(donos).filter(i => String(donos[i]) === String(slot)).map(Number);
  /* a largada: o anfitrião reage às luzes, o convidado pede a automática */
  const l0 = S.ordem(slots[0], 'largada', { reac: .21 }, agora), l1 = slots[1] !== undefined ? S.ordem(slots[1], 'largada', { auto: true }, agora) : { ok: true };
  if(l0.erro || l1.erro) recusas.push(['largada', l0, l1]);
  /* ordem para o carro do outro: recusada */
  if(slots.length > 1){
    const r = S.ordem(slots[0], 'comandar', { i: meus(slots[1])[0], cmd: { modo: 'atacar' } }, agora);
    if(!r.erro) recusas.push(['carro do outro aceito', r]);
  }
  let meio = null, perguntas = 0, ordens = 0, guarda = 0;
  while(S.fase !== 'fim' && guarda++ < 200000){
    agora += 100;
    const mud = S.avancar(agora, vel);
    mud.novas.forEach(mandar);
    if(mud.soma) somasServidor[mud.soma.passo] = mud.soma.soma;
    telas.forEach(t => { t.liberado = S.liberado; });
    /* as telas andam no ritmo delas: uma colada no liberado, a outra um pouco atrás */
    telas[0].andar(S.liberado);
    telas[1].andar(Math.max(0, S.passo - 12));
    /* o rádio: o dono responde a segunda opção na metade das vezes; senão espera o prazo */
    if(S.fase === 'pergunta' && S.R.pergunta && !S._respondendo){
      perguntas++;
      const q = S.R.pergunta, dono = S.dono(q.i);
      if(perguntas % 2){ const r = S.ordem(dono, 'responder', { k: q.opcoes[q.opcoes.length > 1 ? 1 : 0].k }, agora); if(r.e) mandar(r.e); else recusas.push(['responder', r]); }
    }
    /* ordens dos dois de tempos em tempos: ritmo e uma parada */
    if(S.fase === 'correndo' && S.passo > 40 && S.passo % 157 === 0){
      for(const slot of slots){
        const i = meus(slot)[0]; if(i === undefined) continue;
        const cmd = ordens % 3 === 0 ? { modo: 'atacar' } : ordens % 3 === 1 ? { modo: 'poupar' } : { parar: S.R.regras.secos[0] };
        const r = S.ordem(slot, 'comandar', { i, cmd }, agora);
        if(r.e){ mandar(r.e); ordens++; } else recusas.push(['comandar', cmd, r]);
      }
    }
    if(!meio && S.fase === 'correndo' && S.passo > 1500){ meio = { salvo: clone(S.salvo()), passo: S.passo, soma: somaDe(S.R) }; }
    if(opcoes && opcoes.pularEm && S.passo >= opcoes.pularEm && !S._pediu){
      S._pediu = true;
      for(const slot of slots){ const r = S.ordem(slot, 'pular', { quer: true }, agora); if(r.e) mandar(r.e); }
    }
  }
  /* as telas terminam com o que já receberam (o servidor parou de liberar quando acabou) */
  telas.forEach(t => { t.liberado = Infinity; t.andar(Infinity); });
  return { S, telas, somasServidor, recusas, meio, perguntas, ordens };
}

function conferir(J, rotulo, def, x){
  const { S, telas, somasServidor, recusas, meio } = x;
  checar(`${rotulo}: a corrida chegou ao fim (${S.R.N} voltas, ${S.passo} passos, ${x.ordens} ordens, ${x.perguntas} rádio(s))`, S.fase === 'fim' && !!S.res);
  checar(`${rotulo}: ordens válidas aceitas, e a ordem para o carro do outro recusada`, !recusas.length, recusas);
  const res = JSON.stringify(S.res.ordem);
  telas.forEach((t, k) => {
    const rt = t.R.fim ? JSON.stringify(J.Gp.resultado(t.R).ordem) : null;
    const comuns = Object.keys(somasServidor).filter(p => t.somas[p] !== undefined);
    const dif = comuns.filter(p => t.somas[p] !== somasServidor[p]);
    checar(`${rotulo}: a tela ${k + 1} chega ao mesmo resultado e às mesmas ${comuns.length} somas de conferência`, rt === res && comuns.length > 3 && !dif.length,
      { fim: t.R.fim, dif: dif.slice(0, 3), igual: rt === res });
  });
  if(meio){
    const R2 = new Corrida(J, def, meio.salvo);
    checar(`${rotulo}: refeita do estado salvo no passo ${meio.passo}, a corrida está igual`, R2.passo === meio.passo && somaDe(R2.R) === meio.soma, { p: R2.passo, s: [somaDe(R2.R), meio.soma] });
    let agora = 1e7, g = 0;
    R2.relogio = agora;
    while(R2.fase !== 'fim' && g++ < 100000){ agora += 1000; R2.avancar(agora, 16); if(R2.fase === 'pergunta') R2.ordem(R2.dono(R2.R.pergunta.i), 'responder', { k: R2.R.pergunta.padrao }, agora); }
    /* depois do meio, as ordens e respostas foram outras (o rádio respondido aqui é sempre o padrão):
       o que importa é que ela anda e termina */
    checar(`${rotulo}: e continua até o fim sozinha`, R2.fase === 'fim' && !!R2.res);
  }
}

/* ── modo piloto: os dois com 20 anos, na mesma categoria ── */
{
  console.log('\nPiloto: dois humanos na mesma corrida');
  const J = novoMotor(31), regras = criarRegrasPiloto(() => J), codigo = 'TESTEVIV';
  const config = { serie: 'f1', ano: 2024, pilotos: { 0: { nome: 'Ana Silva', cc: 'BR', idade: 20, estilo: 'equilibrado' }, 1: { nome: 'Bia Costa', cc: 'PT', idade: 20, estilo: 'agressivo' } } };
  const mundo = regras.iniciar([{ slot: 0 }, { slot: 1 }], { config, codigo, anfitriao: 0 });
  const { defs } = preparar(J, regras, mundo, codigo, 1);
  checar('a rodada preparada tem uma corrida, com um carro de cada humano e o dono certo', defs.length === 1
    && Object.values(defs[0].donos).sort().join() === '0,1' && defs[0].ent.carros.filter(c => c.ctrl).length === 2
    && defs[0].ent.carros.find(c => c.id === 'ME2').nome === 'Bia Costa', defs.map(d => [d.donos, d.ent.carros.filter(c => c.ctrl).map(c => c.id + ':' + c.nome)]));
  const d2 = preparar(J, regras, mundo, codigo, 1).defs;
  checar('preparar duas vezes dá a mesma entrada (a semente da rodada decide tudo)', JSON.stringify(d2) === JSON.stringify(defs));
  const x = correr(J, defs[0]);
  conferir(J, 'piloto', defs[0], x);
  const { r, ctl } = concluir(J, regras, mundo, codigo, 1, { [defs[0].chave]: { ent: defs[0].ent, res: x.S.res, notas: x.S.notas } });
  const nomes = Object.fromEntries(defs[0].ent.carros.map(c => [c.id, c.nome]));
  const top = (r.resultado.etapas[0] || {}).top || [];
  checar('a rodada concluída com a chegada ao vivo: sem divergência, e o top 10 da rodada é o da corrida',
    !ctl.divergencias.length && !ctl.faltas.length && r.resultado.etapas.length === 2
    && top.map(t => t.nome).join('|') === x.S.res.ordem.slice(0, 10).map(o => nomes[o.id]).join('|'),
    { div: ctl.divergencias, faltas: ctl.faltas, top: top.slice(0, 3).map(t => t.nome), res: x.S.res.ordem.slice(0, 3).map(o => nomes[o.id]) });
}

/* ── modo chefe: duas equipes, com pular para o fim pelo voto dos dois ── */
{
  console.log('\nChefe: duas equipes humanas na mesma corrida');
  const J = novoMotor(32), regras = criarRegrasChefe(() => J), codigo = 'TESTECHF';
  /* duas equipes reais de 2024, uma do meio e uma de trás (como em chefe-mp.mjs) */
  const l = J.eraOfSeries(2024, 'f1').teams.map((t, i) => [i, J.Engine.resolveTeam(t, i, 2024, 'f1')]).filter(x => x[1]).sort((a, b) => b[1].str - a[1].str);
  const config = { sk: 'f1', ano: 2024, equipes: { 0: l[3][0], 1: l[7][0] } };
  let mundo = regras.iniciar([{ slot: 0, nome: 'Carla' }, { slot: 1, nome: 'Davi' }], { config, codigo, anfitriao: 0 });
  /* a primeira rodada é o inverno: sem corrida */
  let N = 1, defs = [], guarda = 0;
  while(!defs.length && guarda++ < 4){
    const p = preparar(J, regras, mundo, codigo, N);
    if(p.defs.length){ defs = p.defs; break; }
    mundo = p.r.mundo; N++;
  }
  checar(`a rodada ${N} (a primeira corrida) tem os quatro carros humanos, dois de cada dono, com a ordem de equipe separada`, defs.length === 1
    && Object.values(defs[0].donos).filter(s => String(s) === '0').length === 2 && Object.values(defs[0].donos).filter(s => String(s) === '1').length === 2
    && defs[0].ent.mpEquipes === true && defs[0].ent.gestao === true, defs.map(d => d.donos));
  if(defs.length){
    const def = defs[0];
    /* a ordem de equipe de um não vale para o outro */
    {
      const C = new Corrida(J, def), [a] = Object.keys(def.donos).filter(i => String(def.donos[i]) === '0').map(Number);
      C.ordem(0, 'largada', { auto: true }, 0); C.ordem(1, 'largada', { auto: true }, 0); C.avancar(1, 8);
      const r = C.ordem(0, 'comandar', { i: a, cmd: { ordemEq: 'manter' } }, 1);
      C.avancar(5000, 8);
      const eqA = C.R.carros[a].c.eq, eqB = C.R.carros[Object.keys(def.donos).find(i => String(def.donos[i]) === '1')].c.eq;
      checar('"manter posições" de uma equipe só vale para ela', !!r.e && C.R.ordemEqDe[eqA] === 'manter' && C.R.ordemEqDe[eqB] === undefined && C.R.ordemEq === 'livre', { r, de: C.R.ordemEqDe });
    }
    const x = correr(J, def, { pularEm: 2500 });
    conferir(J, 'chefe', def, x);
    checar('os dois votaram para pular e a corrida foi até o fim de uma vez', x.S.log.some(e => e.tipo === 'terminar'));
    const { r, ctl } = concluir(J, regras, mundo, codigo, N, { [def.chave]: { ent: def.ent, res: x.S.res, notas: x.S.notas } });
    const nomes = Object.fromEntries(def.ent.carros.map(c => [c.id, c.nome]));
    checar('a rodada do chefe concluída com a chegada ao vivo: sem divergência, e o vencedor é o da corrida',
      !ctl.divergencias.length && !ctl.faltas.length && r.resultado.venc === nomes[x.S.res.ordem[0].id],
      { div: ctl.divergencias, faltas: ctl.faltas, venc: r.resultado.venc, res: nomes[x.S.res.ordem[0].id] });
  }
}

/* ── o rádio: corridas inteiras de chefe até aparecer uma pergunta para um carro humano ── */
{
  console.log('\nRádio: a corrida para na pergunta, para os dois');
  let achou = null;
  for(const codigo of ['RADIOAAA', 'RADIOBBB', 'RADIOCCC', 'RADIODDD', 'RADIOEEE', 'RADIOFFF', 'RADIOGGG', 'RADIOHHH']){
    const J = novoMotor(33), regras = criarRegrasChefe(() => J);
    const l = J.eraOfSeries(2024, 'f1').teams.map((t, i) => [i, J.Engine.resolveTeam(t, i, 2024, 'f1')]).filter(x => x[1]).sort((a, b) => b[1].str - a[1].str);
    let mundo = regras.iniciar([{ slot: 0, nome: 'Carla' }, { slot: 1, nome: 'Davi' }], { config: { sk: 'f1', ano: 2024, equipes: { 0: l[1][0], 1: l[5][0] } }, codigo, anfitriao: 0 });
    mundo = preparar(J, regras, mundo, codigo, 1).r.mundo;
    const { defs } = preparar(J, regras, mundo, codigo, 2);
    if(!defs.length) continue;
    const x = correr(J, defs[0]);
    if(x.perguntas){ achou = { J, def: defs[0], x, codigo }; break; }
  }
  if(checar('alguma corrida inteira teve rádio para um carro humano', !!achou)){
    const { J, def, x } = achou;
    conferir(J, `rádio (${achou.codigo})`, def, x);
    const resp = x.S.log.filter(e => e.tipo === 'responder');
    checar(`as respostas (do dono ou a padrão no prazo) valem no passo da pergunta, nas telas e no servidor (${resp.length})`,
      resp.length === x.perguntas && resp.some(e => e.slot !== null), resp.map(e => [e.passo, e.slot, e.dados.k]));
  }
}

console.log(falhas ? `\n${falhas} de ${ok + falhas} verificações falharam` : `\ncorrida ao vivo: ${ok} verificações, tudo certo`);
process.exit(falhas ? 1 : 0);
