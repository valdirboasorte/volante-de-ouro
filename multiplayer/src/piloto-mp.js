/* O modo piloto com dois pilotos humanos no mesmo mundo, em cima do motor do jogo.

   Quase tudo do save do piloto é dele (ficha, dinheiro, contrato, relações, mídia...). O que
   é do mundo: o registro de pilotos (mundos), a memória dos grids e as temporadas em que eles
   correm. Cada um joga na própria "perspectiva": o mundo com o save dele, em que ele é a linha
   'ME' da temporada; o outro piloto humano, quando corre na mesma categoria, é a linha 'ME2'.

   - As operações de cada piloto rodam uma depois da outra sobre o mesmo mundo (agir).
   - Na mesma categoria, os dois dividem uma temporada: o anfitrião a monta com a vaga do outro
     (S.mpOutros), o convidado a recebe pronta (S.mpTemporada), e a corrida roda uma vez só: o
     lado do convidado calcula a linha dele (sea.mpGravar), o anfitrião corre com ela pronta
     (sea.mpLinhas), e a mesma chegada é aplicada depois à carreira do convidado, sobre a
     temporada de antes da corrida.
   - Em categorias diferentes, cada um tem a sua temporada, e as etapas andam juntas pela
     fração do calendário: as duas temporadas acabam na mesma rodada da sala.
   - No fim do ano, cada um recebe as propostas dele e escolhe; a temporada nova só é montada
     depois que os dois escolheram (S.mpSemTemporada).

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
const outroDe = (mundo, slot) => String(slot) === String(mundo.anfitriao) ? mundo.convidado : mundo.anfitriao;
const trocaId = id => id === 'ME' ? 'ME2' : id === 'ME2' ? 'ME' : id;

/* a categoria em que o piloto corre neste ano */
export function chaveDe(S){ return S.series + '|' + (S.ladder && S.ladder[S.catIdx]) + '|' + S.year; }
const chaveSlot = (mundo, slot) => chaveDe(mundo.pilotos[slot].raiz);

/* 'ME' ↔ 'ME2' em toda a temporada dividida (linhas, tabelas, listas): trocar duas vezes volta ao começo */
export function trocar(sea){
  const andar = o => {
    if(Array.isArray(o)){ for(let i = 0; i < o.length; i++){ if(typeof o[i] === 'string') o[i] = trocaId(o[i]); else andar(o[i]); } return; }
    if(!o || typeof o !== 'object') return;
    /* primeiro os valores, depois as duas chaves de uma vez (senão um valor seria trocado duas vezes) */
    for(const k of Object.keys(o)){ const v = o[k]; if(typeof v === 'string') o[k] = trocaId(v); else andar(v); }
    const temA = 'ME' in o, temB = 'ME2' in o;
    if(temA || temB){ const a = o.ME, b = o.ME2; delete o.ME; delete o.ME2; if(temB) o.ME = b; if(temA) o.ME2 = a; }
  };
  andar(sea);
  for(const f of sea.field || []){
    if(f.id === 'ME'){ f.isMe = true; delete f.humano; }
    else if(f.id === 'ME2'){ f.humano = true; delete f.isMe; }
  }
  return sea;
}

/* o outro piloto humano, como a montagem da temporada precisa dele */
function outroInfo(mundo, slot){
  const o = outroDe(mundo, slot), R = mundo.pilotos[o].raiz;
  return { id: 'ME2', name: R.driver.name, cc: R.driver.cc, teamId: R.team ? R.team.id : null, papel: R.papel || null,
           skill: Math.round(R.driver.ovr || 70), aqui: chaveSlot(mundo, o) === chaveSlot(mundo, slot) };
}

/* a perspectiva de um piloto: o S completo, pronto para o motor */
export function perspectiva(mundo, slot, temporadas){
  const P = mundo.pilotos[slot], tm = temporadas || mundo.temporadas;
  const S = Object.assign(clone(P.raiz), clone(mundo.base));
  const T = tm[P.chaveTemporada || chaveSlot(mundo, slot)];
  if(T){
    const sea = clone(T.sea);
    if(String(T.dono) !== String(slot)) trocar(sea);
    Object.assign(sea, clone(P.temporada));
    S.season = sea;
  } else S.season = null;
  S.mpOutros = [outroInfo(mundo, slot)];
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
    if(String(T.dono) !== String(slot)) trocar(s2);
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

/* as temporadas do ano para os dois: na mesma categoria, uma só, montada pelo anfitrião */
function montarTemporadas(J, mundo, { inicio = false } = {}){
  const h = mundo.anfitriao, g = mundo.convidado;
  const antigas = mundo.temporadas, novas = {};
  const mesma = ativo(mundo, h) && ativo(mundo, g) && chaveSlot(mundo, h) === chaveSlot(mundo, g);
  const montar = (slot, compartilhada) => {
    const S = perspectiva(mundo, slot, antigas);
    J.S = S;
    const guardadas = S.season ? pegar(S.season, ['dilemmaAt', 'eventosAt']) : {};
    if(compartilhada){
      /* o convidado recebe a temporada que o anfitrião montou, com ele na linha 'ME' */
      const T = novas[chaveSlot(mundo, h)];
      const sea = trocar(clone(T.sea));
      /* a parte dele da temporada começa do zero (a do anfitrião ficou do lado do anfitrião) */
      sea.results = [];
      if(inicio){ S.season = sea; Object.assign(S.season, guardadas); }
      else { S.mpTemporada = sea; J.Game.startSeason(); J.UI.limparFila(); J.UI.close(); }
      const tm = S.season.field.find(f => !f.isMe && f.teamId === (S.team && S.team.id));
      S.season.teammateId = tm ? tm.id : null;
      S.season.mpChave = chaveDe(S);
    } else {
      if(inicio){ S.season = J.Engine.buildSeason(); Object.assign(S.season, guardadas); }
      else { J.Game.startSeason(); J.UI.limparFila(); J.UI.close(); }
      S.season.mpChave = chaveDe(S);
    }
    absorver(J, mundo, slot, S, { destino: novas });
    delete novas[S.season.mpChave].sea.mpChave;
  };
  /* com os pilotos de antes de montar (o S.season velho ainda conta: a lesão cura no inverno) */
  /* quem encerrou a carreira fica com a última temporada, parada */
  const congelar = slot => { const c = mundo.pilotos[slot].chaveTemporada; if(antigas[c]) novas[c] = antigas[c]; };
  if(ativo(mundo, h)) montar(h, false); else congelar(h);
  if(ativo(mundo, g)) montar(g, mesma); else congelar(g);
  mundo.temporadas = novas;
}

export function criarMundo(J, { serie, ano, anfitriao, convidado, pilotos }){
  const SA = criarPiloto(J, Object.assign({ serie, ano }, pilotos[anfitriao]));
  const SB = criarPiloto(J, Object.assign({ serie, ano }, pilotos[convidado]));
  const mundo = { v: 1, serie, anfitriao: String(anfitriao), convidado: String(convidado), fase: 'temporada', t: 0,
                  base: {}, temporadas: {}, pilotos: {} };
  /* o mundo é o do anfitrião; cada um leva a carreira dele (e a temporada velha, só para os números dela) */
  for(const k of MUNDO) if(k in SA) mundo.base[k] = clone(SA[k]);
  const pessoal = S => { const r = {}; for(const k of Object.keys(S)) if(!MUNDO.includes(k) && !TEMPORARIAS.includes(k)) r[k] = S[k]; return clone(r); };
  mundo.pilotos[mundo.anfitriao] = { raiz: pessoal(SA), temporada: clone(pegar(SA.season, TEMP_PILOTO)) };
  mundo.pilotos[mundo.convidado] = { raiz: pessoal(SB), temporada: clone(pegar(SB.season, TEMP_PILOTO)) };
  /* as temporadas são montadas de novo no mundo de todos */
  const velhas = {};
  for(const [slot, S] of [[mundo.anfitriao, SA], [mundo.convidado, SB]]){
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
  return [mundo.anfitriao, mundo.convidado].filter(s => mundo.pilotos[s].chaveTemporada === chave && ativo(mundo, s));
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

/* uma etapa da temporada dividida: a linha do convidado sai do lado dele, a corrida roda do
   lado do anfitrião, e a mesma chegada vale para o convidado */
function etapaDupla(J, mundo){
  const h = mundo.anfitriao, g = mundo.convidado;
  /* o lado do convidado, com a temporada de antes da corrida */
  const FB = perspectiva(mundo, g), seaB = FB.season;
  J.S = FB;
  const bCorre = corre(FB);
  seaB.mpGravar = {};
  const MB = J.Engine.montarCorrida(seaB, !bCorre);
  const grav = seaB.mpGravar; delete seaB.mpGravar;
  const extrasB = bCorre ? extrasDoCarro(J, seaB) : null;
  /* o lado do anfitrião: a corrida de verdade */
  const FA = perspectiva(mundo, h), seaA = FA.season;
  J.S = FA;
  const aMachucado = FA.driver.injured > 0;
  if(aMachucado) J.Engine.reservaNoCarro(seaA, true);
  const linhaB = seaA.field.find(f => f.id === 'ME2');
  const ausenteAntes = linhaB ? linhaB.ausente : undefined;
  if(bCorre && grav && (grav.q != null)) seaA.mpLinhas = { ME2: grav };
  else if(linhaB) linhaB.ausente = true;
  const MA = J.Engine.montarCorrida(seaA, aMachucado);
  donosDaCorrida(J, Object.assign({ ME: h }, bCorre ? { ME2: g } : {}), extrasB ? { ME2: extrasB } : null);
  let recA;
  try { recA = J.Engine.runRace(seaA, { montagem: MA }, aMachucado); } finally { donosDaCorrida(J, null); }
  delete seaA.mpLinhas;
  if(linhaB){ if(ausenteAntes === undefined) delete linhaB.ausente; else linhaB.ausente = ausenteAntes; }
  depoisDaCorrida(J, FA, recA, aMachucado);
  absorver(J, mundo, h, FA);
  /* a mesma chegada, na carreira do convidado */
  J.S = FB;
  const ch = recA.chegada;
  const paraB = x => Object.assign({}, x, { f: seaB.field.find(f => f.id === trocaId(x.f.id)) || x.f });
  const grid = {}; Object.keys(MA.grid || {}).forEach(id => { grid[trocaId(id)] = MA.grid[id]; });
  const recB = J.Engine.runRace(seaB, { montagem: Object.assign({}, MB, { grid }), finish: ch.finish.map(paraB), flId: trocaId(ch.flId), sc: ch.sc }, !bCorre);
  depoisDaCorrida(J, FB, recB, FB.driver.injured > 0 && !bCorre);
  /* do convidado volta só a carreira dele e a parte dele da temporada */
  absorver(J, mundo, g, FB, { temporada: false, mundo: false });
  mundo.pilotos[g].temporada = clone(pegar(seaB, TEMP_PILOTO));
  return { [h]: recA, [g]: recB };
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
        if(quem.length === 2) Object.assign(recs, etapaDupla(J, mundo));
        else recs[quem[0]] = etapaSozinho(J, mundo, quem[0]);
      });
    }
  });
  mundo.t++;
  return recs;
}
export const anoAcabou = mundo => Object.keys(mundo.temporadas).every(c => !pilotosDa(mundo, c).length || mundo.temporadas[c].sea.round >= mundo.temporadas[c].sea.calendar.length);

/* ── o fim do ano ── */

/* o balanço de cada um e as propostas: a temporada dividida entra no mundo uma vez só */
export function fimDoAno(J, mundo){
  const h = mundo.anfitriao, g = mundo.convidado, ativos = [h, g].filter(s => ativo(mundo, s));
  const dividida = ativos.length === 2 && mundo.pilotos[h].chaveTemporada === mundo.pilotos[g].chaveTemporada;
  for(const slot of ativos){
    agir(J, mundo, slot, (J, S) => {
      if(dividida && slot === g) S.mpSemRegistro = true;
      /* o balanço do ano fica guardado para a página mostrar a mesma tela do jogo solo */
      const balanco = J.UI.seasonEndModal;
      J.UI.seasonEndModal = function(sum, growth){ S.mpBalanco = clone({ sum, growth }); return balanco.apply(this, arguments); };
      try { J.Game.endSeason(); } finally { J.UI.seasonEndModal = balanco; }
      J.UI.limparFila(); J.UI.close();
      delete S.mpSemRegistro;
      /* as propostas (a academia, quando há, é escolhida antes pelo próprio jogador) */
      if(!S.academyOffers || !S.academyOffers.length){ S.lastSum = J.Engine.summary(S.season); J.Game.showOffers(S.lastSum); J.UI.limparFila(); }
    }, { temporada: !(dividida && slot === g) });
  }
  mundo.fase = 'mercado';
}

/* com a proposta escolhida pelos dois: o ano novo e as temporadas novas */
export function anoNovo(J, mundo, escolhas){
  for(const slot of [mundo.anfitriao, mundo.convidado].filter(s => ativo(mundo, s))){
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
