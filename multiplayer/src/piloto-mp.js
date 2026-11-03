/* O modo piloto com vários pilotos humanos no mesmo mundo, em cima do motor do jogo.

   Quase tudo do save do piloto é dele (ficha, dinheiro, contrato, relações, mídia...). O que
   é do mundo: o registro de pilotos (mundos), a memória dos grids e as temporadas em que eles
   correm. Cada um joga na própria "perspectiva": o mundo com o save dele, em que ele é a linha
   'ME' da temporada; os outros pilotos humanos da mesma categoria são as linhas 'ME2', 'ME3'...
   (o id de cada um fica na temporada, T.ids, do lado de quem a montou, o dono; salas antigas, de
   dois pilotos, não têm T.ids: o outro é a 'ME2').

   - As operações de cada piloto rodam uma depois da outra sobre o mesmo mundo (agir).
   - Na mesma categoria, todos dividem uma temporada: o primeiro deles (na ordem da sala) a monta
     com a vaga dos outros (S.mpOutros), os outros a recebem pronta (S.mpTemporada), e a corrida
     roda uma vez só: o lado de cada outro calcula a linha dele (sea.mpGravar), o primeiro corre
     com elas prontas (sea.mpLinhas), e a mesma chegada é aplicada depois à carreira de cada
     outro, sobre a temporada de antes da corrida.
   - Em categorias diferentes, cada um tem a sua temporada, e as etapas andam juntas pela
     fração do calendário: todas as temporadas acabam na mesma rodada da sala.
   - No fim do ano, cada um recebe as propostas dele e escolhe; a temporada nova só é montada
     depois que todos escolheram (S.mpSemTemporada).

   Fica de fora por enquanto: os acontecimentos fora da pista, as conversas, os pedidos e o
   sábado jogado na mão (o grid sai da classificação calculada), e o reserva no carro de um
   piloto humano machucado numa temporada dividida (o carro fica parado). */
import { criarRnd } from './aleatorio.js';

/* o que é do mundo; o resto da raiz é do piloto */
export const MUNDO = ['mundos', 'gridMem', 'gridMemEra', 'gridMemSerie', 'gridFem'];
/* as partes da temporada que são de cada piloto (no jogo de um só elas moram na temporada) */
export const TEMP_PILOTO = ['results', 'teammateId', 'teammateIdAntes', 'setup', 'setupRound', 'fds', 'minhaForma', 'subst',
  'convAcad', 'convRes', 'convRound', 'dilemmaAt', 'eventosAt', 'pneusLargada', 'fired', 'firedAt'];
/* marcas do multiplayer que não ficam no save */
const TEMPORARIAS = ['season', 'mpOutros', 'mpTemporada', 'mpSemTemporada', 'mpSemRegistro'];

const clone = o => o === undefined ? undefined : structuredClone(o);
const pegar = (o, ks) => { const r = {}; if(o) for(const k of ks) if(k in o) r[k] = o[k]; return r; };
const tirar = (o, ks) => { if(o) for(const k of ks) delete o[k]; };
/* os pilotos da sala, na ordem dela (o anfitrião primeiro); salas antigas guardam só anfitrião e convidado */
export const ordemDe = mundo => (mundo.ordem || [mundo.anfitriao, mundo.convidado]).map(String);
/* o id de um piloto numa temporada, do lado do dono dela */
const idNa = (T, slot) => String(slot) === String(T.dono) ? 'ME' : (T.ids && T.ids[slot]) || 'ME2';
/* de um lado para o outro: quem joga como slot troca de lugar com o 'ME' do dono */
const lado = (T, slot) => { const b = idNa(T, slot); return id => b === 'ME' ? id : id === 'ME' ? b : id === b ? 'ME' : id; };

/* a categoria em que o piloto corre neste ano */
export function chaveDe(S){ return S.series + '|' + (S.ladder && S.ladder[S.catIdx]) + '|' + S.year; }
const chaveSlot = (mundo, slot) => chaveDe(mundo.pilotos[slot].raiz);

/* 'ME' ↔ outro id em toda a temporada dividida (linhas, tabelas, listas): trocar duas vezes volta ao começo */
export function trocar(sea, outro = 'ME2'){
  if(outro === 'ME') return sea;
  const tr = id => id === 'ME' ? outro : id === outro ? 'ME' : id;
  const andar = o => {
    if(Array.isArray(o)){ for(let i = 0; i < o.length; i++){ if(typeof o[i] === 'string') o[i] = tr(o[i]); else andar(o[i]); } return; }
    if(!o || typeof o !== 'object') return;
    /* primeiro os valores, depois as duas chaves de uma vez (senão um valor seria trocado duas vezes) */
    for(const k of Object.keys(o)){ const v = o[k]; if(typeof v === 'string') o[k] = tr(v); else andar(v); }
    const temA = 'ME' in o, temB = outro in o;
    if(temA || temB){ const a = o.ME, b = o[outro]; delete o.ME; delete o[outro]; if(temB) o.ME = b; if(temA) o[outro] = a; }
  };
  andar(sea);
  for(const f of sea.field || []){
    if(f.id === 'ME'){ f.isMe = true; delete f.humano; }
    else if(f.id === outro){ f.humano = true; delete f.isMe; }
  }
  return sea;
}

/* os outros pilotos humanos, como a montagem da temporada precisa deles; o id só vale para quem
   está na mesma temporada (os outros levam um id que não aparece em grid nenhum) */
function outrosInfo(mundo, slot, T){
  const minha = mundo.pilotos[slot].chaveTemporada;
  return ordemDe(mundo).filter(o => o !== String(slot)).map(o => {
    const R = mundo.pilotos[o].raiz, junto = !!T && !!minha && mundo.pilotos[o].chaveTemporada === minha;
    return { id: junto ? lado(T, slot)(idNa(T, o)) : 'MPX' + o, slot: o, name: R.driver.name, cc: R.driver.cc, teamId: R.team ? R.team.id : null,
             papel: R.papel || null, skill: Math.round(R.driver.ovr || 70), aqui: chaveSlot(mundo, o) === chaveSlot(mundo, slot) };
  });
}

/* a perspectiva de um piloto: o S completo, pronto para o motor */
export function perspectiva(mundo, slot, temporadas){
  const P = mundo.pilotos[slot], tm = temporadas || mundo.temporadas;
  const S = Object.assign(clone(P.raiz), clone(mundo.base));
  const T = tm[P.chaveTemporada || chaveSlot(mundo, slot)];
  if(T){
    const sea = clone(T.sea);
    if(String(T.dono) !== String(slot)) trocar(sea, idNa(T, slot));
    Object.assign(sea, clone(P.temporada));
    S.season = sea;
  } else S.season = null;
  S.mpOutros = outrosInfo(mundo, slot, T);
  return S;
}

/* guarda de volta o que saiu de uma perspectiva. temporada: false quando a temporada desta
   perspectiva não deve voltar para o mundo (a do convidado antes da corrida dividida, a velha
   depois de escolher a proposta); mundo: false para não mexer no registro de pilotos */
export function absorver(J, mundo, slot, S, { temporada = true, mundo: doMundo = true, destino } = {}){
  const P = mundo.pilotos[slot] || (mundo.pilotos[slot] = {});
  const sea = S.season;
  if(sea && temporada) P.temporada = clone(pegar(sea, TEMP_PILOTO));
  const raiz = {};
  for(const k of Object.keys(S)) if(!MUNDO.includes(k) && !TEMPORARIAS.includes(k)) raiz[k] = S[k];
  P.raiz = clone(raiz);
  if(doMundo) for(const k of MUNDO) if(k in S) mundo.base[k] = clone(S[k]);
  if(sea && temporada){
    const chave = sea.mpChave || chaveDe(S);
    P.chaveTemporada = chave;
    const tm = destino || mundo.temporadas;
    const T = tm[chave] || (tm[chave] = { dono: String(slot) });
    const s2 = clone(sea);
    tirar(s2, TEMP_PILOTO); delete s2.mpLinhas; delete s2.mpGravar;
    if(String(T.dono) !== String(slot)) trocar(s2, idNa(T, slot));
    T.sea = s2;
  }
}

/* uma ação ou etapa de um piloto: roda na perspectiva dele e o que sai vale para o mundo */
export function agir(J, mundo, slot, fn, opcoes){
  const S = perspectiva(mundo, slot);
  J.S = S;
  const r = fn(J, S);
  J.UI.limparFila();
  absorver(J, mundo, slot, S, opcoes);
  return r;
}

/* uma comSemente igual à do chefe: o Math da página falsa é só deste motor */
export function comSemente(J, rnd, fn){
  const M = J.amb.Math, antes = M.random;
  M.random = rnd;
  try { return fn(); } finally { M.random = antes; }
}

/* ── criar ── */

/* uma carreira nova, como o formulário do jogo faria (sempre no modo rápido: sem telas de inverno) */
function criarPiloto(J, c){
  J.S = null;
  const ano = c.ano, era = J.ERAS.indexOf(J.Engine.eraOf(ano));
  Object.assign(J.UI, { eraSel: era < 0 ? J.ERAS.length - 1 : era, year: ano, serie: c.serie, country: c.cc || 'BR',
    style: c.estilo || 'equilibrado', modo: c.modo || 'classico', origem: c.origem || 'media' });
  const d = J.amb.document;
  d.getElementById('inName').value = c.nome; d.getElementById('inNum').value = String(c.num || 7);
  d.getElementById('inAge').value = String(c.idade || 17);
  d.getElementById('chkRisk').checked = !!c.risco; d.getElementById('chkFast').checked = true;
  J.Game.start(); J.UI.limparFila(); J.UI.close();
  if(J.S) J.S.opts.fast = true;
  return J.S;
}

/* as temporadas do ano para todos: quem corre na mesma categoria divide uma só, montada pelo
   primeiro do grupo (na ordem da sala), com a vaga dos outros */
function montarTemporadas(J, mundo, { inicio = false } = {}){
  const antigas = mundo.temporadas, novas = {}, ordem = ordemDe(mundo);
  const grupos = new Map();
  for(const s of ordem) if(ativo(mundo, s)){ const c = chaveSlot(mundo, s); if(!grupos.has(c)) grupos.set(c, []); grupos.get(c).push(s); }
  const montar = (slot, grupo) => {
    const dono = grupo[0], compartilhada = slot !== dono;
    const S = perspectiva(mundo, slot, antigas);
    J.S = S;
    const guardadas = S.season ? pegar(S.season, ['dilemmaAt', 'eventosAt']) : {};
    /* os ids da temporada nova: o dono é a 'ME', os outros do grupo 'ME2', 'ME3'... */
    const ids = {}; grupo.slice(1).forEach((s, i) => { ids[s] = 'ME' + (i + 2); });
    if(compartilhada){
      /* recebe a temporada que o dono montou, com ele na linha 'ME' */
      const T = novas[chaveSlot(mundo, dono)];
      const sea = trocar(clone(T.sea), T.ids[slot]);
      /* a parte dele da temporada começa do zero (a do dono ficou do lado do dono) */
      sea.results = [];
      if(inicio){ S.season = sea; Object.assign(S.season, guardadas); }
      else { S.mpTemporada = sea; J.Game.startSeason(); J.UI.limparFila(); J.UI.close(); }
      const tm = S.season.field.find(f => !f.isMe && f.teamId === (S.team && S.team.id));
      S.season.teammateId = tm ? tm.id : null;
      S.season.mpChave = chaveDe(S);
    } else {
      /* quem divide a categoria entra na montagem com o id novo; quem não divide, não entra */
      S.mpOutros.forEach(o => { o.aqui = grupo.includes(o.slot); if(o.aqui) o.id = ids[o.slot]; });
      if(inicio){ S.season = J.Engine.buildSeason(); Object.assign(S.season, guardadas); }
      else { J.Game.startSeason(); J.UI.limparFila(); J.UI.close(); }
      S.season.mpChave = chaveDe(S);
    }
    absorver(J, mundo, slot, S, { destino: novas });
    const T = novas[S.season.mpChave];
    delete T.sea.mpChave;
    if(!compartilhada && grupo.length > 1) T.ids = ids;
  };
  /* com os pilotos de antes de montar (o S.season velho ainda conta: a lesão cura no inverno) */
  /* quem encerrou a carreira fica com a última temporada, parada */
  const congelar = slot => { const c = mundo.pilotos[slot].chaveTemporada; if(antigas[c]) novas[c] = antigas[c]; };
  for(const s of ordem){
    if(ativo(mundo, s)) montar(s, grupos.get(chaveSlot(mundo, s)));
    else congelar(s);
  }
  mundo.temporadas = novas;
}

/* pilotos: { slot: ficha }; ordem: os slots, o anfitrião primeiro (sem ordem: anfitrião e convidado) */
export function criarMundo(J, { serie, ano, anfitriao, convidado, pilotos, ordem }){
  const ks = (ordem || [anfitriao, convidado]).map(String);
  const Ss = ks.map(s => criarPiloto(J, Object.assign({ serie, ano }, pilotos[s])));
  const mundo = { v: 1, serie, anfitriao: ks[0], convidado: ks[1], fase: 'temporada', t: 0,
                  base: {}, temporadas: {}, pilotos: {} };
  if(ordem) mundo.ordem = ks;
  /* o mundo é o do anfitrião; cada um leva a carreira dele (e a temporada velha, só para os números dela) */
  for(const k of MUNDO) if(k in Ss[0]) mundo.base[k] = clone(Ss[0][k]);
  const pessoal = S => { const r = {}; for(const k of Object.keys(S)) if(!MUNDO.includes(k) && !TEMPORARIAS.includes(k)) r[k] = S[k]; return clone(r); };
  ks.forEach((s, i) => { mundo.pilotos[s] = { raiz: pessoal(Ss[i]), temporada: clone(pegar(Ss[i].season, TEMP_PILOTO)) }; });
  /* as temporadas são montadas de novo no mundo de todos */
  const velhas = {};
  for(const [slot, S] of ks.map((s, i) => [s, Ss[i]])){
    const c = 'velha|' + slot;
    velhas[c] = { dono: slot, sea: (() => { const s = clone(S.season); tirar(s, TEMP_PILOTO); return s; })() };
    mundo.pilotos[slot].chaveTemporada = c;
  }
  mundo.temporadas = velhas;
  montarTemporadas(J, mundo, { inicio: true });
  return mundo;
}

/* ── as etapas ── */

/* quem corre em cada temporada (quem encerrou a carreira fica de fora: o carro segue com a IA) */
const ativo = (mundo, s) => !mundo.pilotos[s].raiz.retired;
export function pilotosDa(mundo, chave){
  return ordemDe(mundo).filter(s => mundo.pilotos[s].chaveTemporada === chave && ativo(mundo, s));
}

/* corrida ao vivo (Fase 5): quem é dono de cada carro humano nesta corrida, e o que o carro do
   outro humano leva do lado dele. Sem a sala pedindo corridas ao vivo (J.mpCorridas), nada muda. */
function donosDaCorrida(J, donos, extras){
  if(J.mpCorridas) J.mpCorridas.contexto = donos ? { modo: 'piloto', donos, extras: extras || {} } : null;
}
/* o que a montagem da corrida tira da carreira de quem é o 'ME' (Gp.entrada), para o carro dele
   na corrida do outro lado: pneu usado e modo do fim de semana, a ficha, a largada nata */
function extrasDoCarro(J, sea){
  const E = J.Engine, x = {};
  const pu = E.efeitoFds(sea, 'pneuUsado'), md = E.efeitoFds(sea, 'modo');
  if(pu) x.pneu0 = pu;
  if(md) x.modo = md;
  const fv = E.fichaVivo && E.fichaVivo();
  if(fv){ x.pneuMult = fv.pneu; x.ataque = fv.ataque; x.defesa = fv.defesa; }
  x.largadaNata = !!(E.temTraco && E.temTraco('largada'));
  const esc = sea.pneusLargada && sea.pneusLargada.rd === sea.round ? sea.pneusLargada.carros || {} : {};
  if(esc.ME) x.pneuIni = esc.ME;
  return x;
}

/* uma etapa de quem está sozinho na categoria: o mesmo caminho do "simular uma etapa" do jogo */
function etapaSozinho(J, mundo, slot){
  return agir(J, mundo, slot, (J, S) => {
    donosDaCorrida(J, { ME: slot });
    try { J.Game.simSeason(false, true); } finally { donosDaCorrida(J, null); }
    const r = S.season.results; return r[r.length - 1] || null;
  });
}

/* o que vem depois da corrida, como em Game.simSeason */
function depoisDaCorrida(J, S, rec, machucado){
  const sea = S.season, E = J.Engine, G = J.Game;
  if(machucado){
    S.driver.injured--; E.recuperar(false);
    if(S.driver.injured <= 0) E.reservaNoCarro(sea, false);
    return;
  }
  G.tally(rec);
  if(sea.subst) E.fimDaSubstituicao(sea, rec);
  if(rec.injury && rec.injury.fatal){ G.endCareer('acidente'); return; }
  if(rec.injury) E.lesionar(rec.injury.races, 'corrida');
  if(E.midReview(sea)) G.fire(true);
  J.UI.limparFila(); J.UI.close();
}
const corre = S => !(S.driver.injured > 0) && !S.papel && !S.retired;

/* uma etapa da temporada dividida: a linha de cada outro sai do lado dele, a corrida roda do
   lado do primeiro do grupo, e a mesma chegada vale para cada outro */
function etapaGrupo(J, mundo, chave){
  const T = mundo.temporadas[chave], [h, ...outros] = pilotosDa(mundo, chave), deH = lado(T, h);
  /* o lado de cada outro, com a temporada de antes da corrida */
  const lados = outros.map(g => {
    const F = perspectiva(mundo, g), sea = F.season;
    J.S = F;
    const anda = corre(F);
    sea.mpGravar = {};
    const M = J.Engine.montarCorrida(sea, !anda);
    const grav = sea.mpGravar; delete sea.mpGravar;
    /* o id dele do lado do primeiro, e a tradução de um id do lado do primeiro para o dele */
    const deG = lado(T, g);
    return { g, F, sea, anda, M, grav, extras: anda ? extrasDoCarro(J, sea) : null,
             id: deH(idNa(T, g)), tr: id => deG(deH(id)) };
  });
  /* o lado do primeiro: a corrida de verdade */
  const FA = perspectiva(mundo, h), seaA = FA.season;
  J.S = FA;
  const aMachucado = FA.driver.injured > 0;
  if(aMachucado) J.Engine.reservaNoCarro(seaA, true);
  const donos = { ME: h }, extras = {}, linhas = {};
  for(const l of lados){
    l.linha = seaA.field.find(f => f.id === l.id);
    l.ausenteAntes = l.linha ? l.linha.ausente : undefined;
    if(l.anda && l.grav && (l.grav.q != null)) linhas[l.id] = l.grav;
    else if(l.linha) l.linha.ausente = true;
    if(l.anda) donos[l.id] = l.g;
    if(l.extras) extras[l.id] = l.extras;
  }
  if(Object.keys(linhas).length) seaA.mpLinhas = linhas;
  const MA = J.Engine.montarCorrida(seaA, aMachucado);
  donosDaCorrida(J, donos, extras);
  let recA;
  try { recA = J.Engine.runRace(seaA, { montagem: MA }, aMachucado); } finally { donosDaCorrida(J, null); }
  delete seaA.mpLinhas;
  for(const l of lados) if(l.linha){ if(l.ausenteAntes === undefined) delete l.linha.ausente; else l.linha.ausente = l.ausenteAntes; }
  depoisDaCorrida(J, FA, recA, aMachucado);
  absorver(J, mundo, h, FA);
  /* a mesma chegada, na carreira de cada outro */
  const ch = recA.chegada, recs = { [h]: recA };
  for(const l of lados){
    J.S = l.F;
    const paraB = x => Object.assign({}, x, { f: l.sea.field.find(f => f.id === l.tr(x.f.id)) || x.f });
    const grid = {}; Object.keys(MA.grid || {}).forEach(id => { grid[l.tr(id)] = MA.grid[id]; });
    recs[l.g] = J.Engine.runRace(l.sea, { montagem: Object.assign({}, l.M, { grid }), finish: ch.finish.map(paraB), flId: l.tr(ch.flId), sc: ch.sc }, !l.anda);
    depoisDaCorrida(J, l.F, recs[l.g], l.F.driver.injured > 0 && !l.anda);
    /* de cada outro volta só a carreira dele e a parte dele da temporada */
    absorver(J, mundo, l.g, l.F, { temporada: false, mundo: false });
    mundo.pilotos[l.g].temporada = clone(pegar(l.sea, TEMP_PILOTO));
  }
  return recs;
}

/* uma rodada de corridas da sala: cada temporada anda a sua fração do calendário */
export function rodadaDeCorridas(J, mundo){
  const recs = {};
  const tamanho = c => mundo.temporadas[c].sea.calendar.length;
  const nmax = Math.max(1, ...Object.keys(mundo.temporadas).filter(c => pilotosDa(mundo, c).length).map(tamanho));
  /* cada categoria com o seu sorteio, tirado antes de qualquer corrida: o que uma corrida gasta
     de sorteio não muda a montagem da outra (a corrida ao vivo prepara e conclui a rodada em
     duas passadas, e as duas precisam montar as mesmas corridas) */
  const sementes = Object.keys(mundo.temporadas).map(() => Math.floor(J.amb.Math.random() * 4294967296));
  Object.keys(mundo.temporadas).forEach((chave, k) => {
    const alvo = Math.min(tamanho(chave), Math.floor((mundo.t + 1) * tamanho(chave) / nmax));
    let guarda = 0;
    while(mundo.temporadas[chave].sea.round < alvo && guarda++ < 5){
      const quem = pilotosDa(mundo, chave);
      if(!quem.length) break;
      comSemente(J, criarRnd('etapa:' + sementes[k], mundo.temporadas[chave].sea.round), () => {
        if(quem.length >= 2) Object.assign(recs, etapaGrupo(J, mundo, chave));
        else recs[quem[0]] = etapaSozinho(J, mundo, quem[0]);
      });
    }
  });
  mundo.t++;
  return recs;
}
export const anoAcabou = mundo => Object.keys(mundo.temporadas).every(c => !pilotosDa(mundo, c).length || mundo.temporadas[c].sea.round >= mundo.temporadas[c].sea.calendar.length);

/* ── o fim do ano ── */

/* o balanço de cada um e as propostas: a temporada dividida entra no mundo uma vez só, pelo primeiro do grupo */
export function fimDoAno(J, mundo){
  const ativos = ordemDe(mundo).filter(s => ativo(mundo, s)), primeiro = {};
  for(const s of ativos){ const c = mundo.pilotos[s].chaveTemporada; if(!(c in primeiro)) primeiro[c] = s; }
  for(const slot of ativos){
    const dividida = primeiro[mundo.pilotos[slot].chaveTemporada] !== slot;
    agir(J, mundo, slot, (J, S) => {
      if(dividida) S.mpSemRegistro = true;
      /* o balanço do ano fica guardado para a página mostrar a mesma tela do jogo solo */
      const balanco = J.UI.seasonEndModal;
      J.UI.seasonEndModal = function(sum, growth){ S.mpBalanco = clone({ sum, growth }); return balanco.apply(this, arguments); };
      try { J.Game.endSeason(); } finally { J.UI.seasonEndModal = balanco; }
      J.UI.limparFila(); J.UI.close();
      delete S.mpSemRegistro;
      /* as propostas (a academia, quando há, é escolhida antes pelo próprio jogador) */
      if(!S.academyOffers || !S.academyOffers.length){ S.lastSum = J.Engine.summary(S.season); J.Game.showOffers(S.lastSum); J.UI.limparFila(); }
    }, { temporada: !dividida });
  }
  mundo.fase = 'mercado';
}

/* com a proposta escolhida por todos: o ano novo e as temporadas novas */
export function anoNovo(J, mundo, escolhas){
  for(const slot of ordemDe(mundo).filter(s => ativo(mundo, s))){
    agir(J, mundo, slot, (J, S) => {
      S.mpSemTemporada = true;
      delete S.mpBalanco;
      /* sem nenhuma proposta, a carreira acaba (como no jogo solo, Game.showOffers) */
      if(escolhas[slot] === undefined && !(S.pendingOffers || []).some(o => o.podeP !== false && !o.retirada)) J.Game.endCareer('semvaga');
      else J.Game.takeOffer(escolhas[slot]);
      J.UI.limparFila(); J.UI.close();
      delete S.mpSemTemporada;
    }, { temporada: false });
  }
  montarTemporadas(J, mundo);
  mundo.fase = 'temporada'; mundo.t = 0;
}
