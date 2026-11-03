/* O modo chefe com várias equipes humanas no mesmo mundo, em cima do motor do jogo.

   O jogo só conhece uma equipe humana, a 'EU'. Em vez de reescrevê-lo, o mundo da sala
   guarda uma parte compartilhada (a temporada, o registro de pilotos, a IA, o mercado) e
   um pacote por equipe (caixa, carro, pilotos, patrocínios, decisões...). Para agir por
   uma equipe, monta-se a "perspectiva" dela: o mundo com o pacote dela, em que ela é a
   'EU' e as outras humanas aparecem como 'EU2', 'EU3'... O mundo guardado tem os ids da
   equipe do anfitrião; cada outra equipe vê o seu id trocado com o 'EU'.

   Várias pessoas podem dividir uma equipe: todas mandam em tudo. O pacote é da equipe
   (mundo.equipes, pela chave dela: o menor slot entre os membros) e mundo.membros diz de
   que equipe é cada jogador. Salas antigas, de duas equipes, guardam só anfitriao e
   convidado (sem ordem nem membros) e seguem funcionando.

   - Ações (as decisões de um jogador): rodam na perspectiva da equipe dele, e o mundo que
     sai dali vale para todos (o servidor faz uma ação por vez).
   - Viradas de fase (começo de temporada, fim de temporada, ano novo): rodam primeiro do
     lado do anfitrião, que decide o mundo; depois do lado de cada outra equipe, sobre uma
     cópia do mundo de antes, e dali só sai o que é dela: o pacote, os carros e os
     registros dos pilotos dela.
   - A corrida: a classificação roda uma vez, com cada carro humano avaliado na
     perspectiva da sua equipe; a montagem do domingo junta todos os lados e corre uma vez;
     a mesma chegada é aplicada depois à economia de cada outra equipe. */

/* o que é de cada equipe; o resto é o mundo */
export const CHAVES = {
  raiz: ['chefe', 'eq', 'caixa', 'livro', 'rep', 'part', 'dir', 'carro', 'motor', 'instal', 'obras', 'staff', 'pilotos',
         'patro', 'plano', 'acad', 'futuroBonus', 'news', 'decisao', 'n1', 'pecas', 'acertos', 'instalAno', 'balanco',
         'ultimaPos', 'rel', 'hist', 'eventos', 'evento', 'inicio', 'total', 'carreira', 'carroDoAno', 'modo', 'seq',
         'cenario', 'eqDesde', 'divida', 'mpContra', 'penalTunel', 'penalTunelAno', 'vendida', 'conceito', 'exPiloto'],
  temporada: ['results', 'qsHist', 'meta', 'rankCarro', 'gastoTeto', 'pacotes', 'evol', 'leitura', 'ac', 'conf', 'objPatro', 'fds', 'metaNeg', 'excluida'],
  qs: ['janelas'],
  inv: ['tent', 'msgs', 'decisoes', 'staffMerc', 'patro', 'olheiros', 'investidores', 'convites', 'subir']
};
/* o mundo conhecido; uma chave fora das duas listas aparece nos testes */
export const MUNDO = ['v', 'realismo', 'sk', 'topo', 'cat', 'escada', 'mundo', 'temporada', 'W', 'ia', 'fase', 'inv', 'ano'];

const clone = o => o === undefined ? undefined : structuredClone(o);
const pegar = (o, ks) => { const r = {}; if(o) for(const k of ks) if(k in o) r[k] = o[k]; return r; };
const tirar = (o, ks) => { if(o) for(const k of ks) delete o[k]; };

/* as equipes humanas, na ordem da sala (a do anfitrião primeiro) */
export const equipesDe = mundo => (mundo.ordem || [mundo.anfitriao, mundo.convidado]).map(String);
/* a equipe de um jogador (a chave de uma equipe também serve: ela é um dos membros) */
export const equipeDe = (mundo, slot) => String(mundo.membros && mundo.membros[slot] !== undefined ? mundo.membros[slot] : slot);
/* os jogadores de uma equipe */
export const membrosDe = (mundo, k) => mundo.membros
  ? Object.keys(mundo.membros).filter(s => String(mundo.membros[s]) === String(k)).sort((a, b) => a - b) : [String(k)];
/* o id de uma equipe no mundo guardado: 'EU' para a do anfitrião, 'EU2', 'EU3'... para as outras */
const idBase = (mundo, k) => { const i = equipesDe(mundo).indexOf(String(k)); return i <= 0 ? 'EU' : 'EU' + (i + 1); };
/* o id da equipe j vista pela equipe k (k troca de lugar com o 'EU') */
const idVisto = (mundo, j, k) => { const a = idBase(mundo, j), b = idBase(mundo, k); return a === b ? 'EU' : a === 'EU' ? b : a; };

/* 'EU' ↔ outro id na temporada: na lista de equipes, nos carros e na tabela de construtores.
   Trocar duas vezes volta ao começo. */
export function trocarIds(C, outro = 'EU2'){
  const t = C && C.temporada; if(!t || outro === 'EU') return C;
  const tr = id => id === 'EU' ? outro : id === outro ? 'EU' : id;
  for(const x of t.teams || []){
    if(x.id !== 'EU' && x.id !== outro) continue;
    x.id = tr(x.id);
    if(x.id === 'EU'){ x.nossa = true; delete x.humana; } else { x.humana = true; delete x.nossa; }
  }
  for(const f of t.field || []){
    if(f.teamId !== 'EU' && f.teamId !== outro) continue;
    f.teamId = tr(f.teamId);
    if(f.teamId === 'EU') f.nosso = true; else delete f.nosso;
  }
  if(t.cstand){ const a = t.cstand.EU, b = t.cstand[outro]; delete t.cstand.EU; delete t.cstand[outro]; if(b !== undefined) t.cstand.EU = b; if(a !== undefined) t.cstand[outro] = a; }
  return C;
}

/* o que uma equipe mostra ao mundo: nome, cor, força do carro, quem é dela e os carros
   dela no grid (calculado com a perspectiva dela ativa) */
function vitrine(J, C){
  return {
    nome: C.eq.nome, cor: C.eq.cor, str: J.Chefe.forca(),
    reservados: (C.pilotos || []).filter(p => p.papel !== 'emprestado').map(p => p.nome),
    carros: C.temporada ? C.temporada.field.filter(f => f.teamId === 'EU').map(f => clone(f)) : []
  };
}
const midsDe = b => new Set(((b && b.raiz && b.raiz.pilotos) || []).map(p => p.mid).filter(Boolean));
const outraDe = (mundo, j, k) => { const vo = mundo.equipes[j].vitrine; return { id: idVisto(mundo, j, k), nome: vo.nome, cor: vo.cor, str: vo.str, reservados: vo.reservados, carros: vo.carros }; };

/* a perspectiva da equipe de um jogador: um C completo, só dela, pronto para o motor */
export function perspectiva(mundo, slot, base){
  const k = equipeDe(mundo, slot);
  const C = clone(base || mundo.base);
  const b = mundo.equipes[k];
  Object.assign(C, clone(b.raiz));
  if(C.temporada){
    Object.assign(C.temporada, clone(b.temporada));
    if(C.temporada.qs) Object.assign(C.temporada.qs, clone(b.qs));
  }
  if(C.inv) Object.assign(C.inv, clone(b.inv));
  trocarIds(C, idBase(mundo, k));
  C.mpOutras = equipesDe(mundo).filter(j => j !== k).map(j => outraDe(mundo, j, k));
  if(C.temporada){
    for(const o of C.mpOutras){ const t = C.temporada.teams.find(x => x.id === o.id); if(t) t.str = o.str; }
    /* das outras equipes, só os carros que estão escalados correm */
    const outras = new Set(C.mpOutras.map(o => o.id));
    C.temporada.field = C.temporada.field.filter(f => !outras.has(f.teamId) || f.ativo);
  }
  return C;
}

/* guarda de volta o que saiu de uma perspectiva. compartilhado: o mundo inteiro vem dela;
   senão, só o que é da equipe (pacote, carros, registros dos pilotos dela) */
export function absorver(J, mundo, slot, C, { compartilhado, midsAntes } = {}){
  const k = equipeDe(mundo, slot);
  const vit = (J.C = C, vitrine(J, C));
  const id = idBase(mundo, k);
  trocarIds(C, id);
  const b = mundo.equipes[k] || (mundo.equipes[k] = {});
  b.raiz = clone(pegar(C, CHAVES.raiz));
  b.temporada = C.temporada ? clone(pegar(C.temporada, CHAVES.temporada)) : {};
  b.qs = C.temporada && C.temporada.qs ? clone(pegar(C.temporada.qs, CHAVES.qs)) : {};
  b.inv = C.inv ? clone(pegar(C.inv, CHAVES.inv)) : {};
  b.vitrine = vit;
  if(compartilhado){
    const base = clone(C);
    tirar(base, CHAVES.raiz); delete base.mpOutras;
    if(base.temporada){ tirar(base.temporada, CHAVES.temporada); if(base.temporada.qs) tirar(base.temporada.qs, CHAVES.qs); }
    if(base.inv) tirar(base.inv, CHAVES.inv);
    mundo.base = base;
    return;
  }
  /* os registros de quem é (ou era, até esta fase) piloto desta equipe */
  const mids = new Set([...(midsAntes || []), ...midsDe(b)]);
  if(mundo.base.W && C.W) for(const m of mids) if(C.W.p[m]) mundo.base.W.p[m] = clone(C.W.p[m]);
  /* os carros desta equipe no grid, e a força dela */
  const sb = mundo.base.temporada, sc = C.temporada;
  if(sb && sc && sb.ano === sc.ano){
    sb.field = sb.field.filter(f => f.teamId !== id).concat(sc.field.filter(f => f.teamId === id).map(f => clone(f)));
    const t = sb.teams.find(x => x.id === id); if(t) t.str = vit.str;
  }
}

/* uma função do motor com o sorteio preso a uma semente (o Math da página falsa é só deste motor) */
export function comSemente(J, rnd, fn){
  const M = J.amb.Math, antes = M.random;
  M.random = rnd;
  try { return fn(); } finally { M.random = antes; }
}

/* ── a sala ── */

/* equipes reais da mesma série e do mesmo ano; o anfitrião decide o mundo.
   equipes: { chave: { chefe, cc, idx } }; ordem: as chaves, a do anfitrião primeiro;
   membros: { slot: chave }. Sem ordem, valem anfitriao e convidado (duas equipes, um jogador cada). */
export function criarMundo(J, { sk, ano, anfitriao, convidado, equipes, ordem, membros }){
  const ks = (ordem || [anfitriao, convidado]).map(String);
  const novo = (e, seq) => {
    J.Chefe.novo({ chefe: { nome: e.chefe, cc: e.cc || 'BR' }, realismo: true, modo: 'assumir', sk, ano, idx: e.idx, seq });
    J.UI.limparFila(); J.UI.close();
    return J.C;
  };
  const Cs = ks.map((k, i) => novo(equipes[k], i * 500000));
  const mundo = { v: 1, sk, ano, anfitriao: ks[0], convidado: ks[1], etapa: 'inverno', base: null, equipes: {} };
  if(ordem){
    mundo.ordem = ks;
    mundo.membros = {};
    for(const [s, k] of Object.entries(membros || {})) mundo.membros[s] = String(k);
    for(const k of ks) if(mundo.membros[k] === undefined) mundo.membros[k] = k;
  }
  /* as outras equipes ainda não estão no mundo do anfitrião: o pacote de cada uma vem do mundo dela */
  ks.slice(1).forEach((k, i) => {
    const CB = Cs[i + 1];
    J.C = CB;
    mundo.equipes[k] = { raiz: clone(pegar(CB, CHAVES.raiz)), temporada: {}, qs: {}, inv: CB.inv ? clone(pegar(CB.inv, CHAVES.inv)) : {}, vitrine: vitrine(J, CB) };
  });
  /* o mundo é o do anfitrião, com o mercado refeito sem os pilotos das outras equipes */
  const CA = Cs[0];
  CA.mpOutras = ks.slice(1).map(k => Object.assign(outraDe(mundo, k, ks[0]), { carros: [] }));
  J.C = CA;
  if(CA.inv) CA.inv.mercado = J.Chefe.mercadoPilotos();
  absorver(J, mundo, ks[0], CA, { compartilhado: true });
  /* e os pilotos de cada outra equipe passam a ser dela também no registro do mundo */
  for(const k of ks.slice(1)){
    const FB = perspectiva(mundo, k);
    J.C = FB;
    FB.pilotos.forEach(p => J.Chefe.ligar(p));
    absorver(J, mundo, k, FB, { compartilhado: false });
  }
  return mundo;
}

/* uma decisão de um jogador: roda na perspectiva da equipe dele e o mundo que sai vale para todos */
export function agir(J, mundo, slot, fn){
  const C = perspectiva(mundo, slot);
  J.C = C;
  const r = fn(J, C);
  J.UI.limparFila();
  absorver(J, mundo, slot, C, { compartilhado: true });
  return r;
}

/* uma virada de fase: o anfitrião decide o mundo; cada outra equipe roda sobre o mundo de antes */
export function faseDupla(J, mundo, fn){
  const antes = clone(mundo.base), [h, ...outras] = equipesDe(mundo);
  const FA = perspectiva(mundo, h);
  J.C = FA; fn(J, FA); J.UI.limparFila();
  absorver(J, mundo, h, FA, { compartilhado: true });
  for(const g of outras){
    const midsAntes = midsDe(mundo.equipes[g]);
    const FB = perspectiva(mundo, g, antes);
    J.C = FB; fn(J, FB); J.UI.limparFila();
    absorver(J, mundo, g, FB, { compartilhado: false, midsAntes });
  }
}

/* o fim de semana: classificação e corrida uma vez só, para todos; devolve o registro de cada equipe */
export function corrida(J, mundo){
  const [h, ...ks] = equipesDe(mundo);
  const FA = perspectiva(mundo, h), sA = FA.temporada;
  const outras = ks.map(g => { const F = perspectiva(mundo, g); return { g, F, sea: F.temporada }; });
  const em = (C, fn) => { const antes = J.C; J.C = C; try { return fn(); } finally { J.C = antes; } };
  /* o tempo da etapa é um só: o lado do anfitrião sorteia */
  em(FA, () => J.Chefe.chuvaDaEtapa(sA));
  for(const o of outras) o.sea.clima = clone(sA.clima);
  /* sábado: as sessões rodam uma vez; cada carro humano vale o que vale na equipe dele */
  /* o imprevisto do fim de semana de cada equipe vale na hora de correr, mesmo que o sábado já tenha sido criado
     por uma decisão de outro lado (resolver duas vezes não faz nada) */
  em(FA, () => J.Chefe.fdsResolver(sA));
  for(const o of outras) em(o.F, () => J.Chefe.fdsResolver(o.sea));
  em(FA, () => J.Chefe.qualiDaEtapa(sA));
  /* o sábado pode ter nascido numa decisão de outra equipe: sem janelas escolhidas do lado do anfitrião, vale a janela padrão */
  if(!sA.qs.janelas) sA.qs.janelas = {};
  for(const o of outras){
    o.janelas = (o.sea.qs && o.sea.qs.rd === sA.qs.rd && o.sea.qs.janelas) || {};
    o.sea.qs = Object.assign(clone(sA.qs), { janelas: o.janelas });
  }
  if(!sA.qs.concluida){
    const vqA = em(FA, () => J.Chefe.valorQuali(sA, J.Chefe.ctxQuali(sA)));
    const deQuem = new Map();
    for(const o of outras){
      o.vq = em(o.F, () => J.Chefe.valorQuali(o.sea, J.Chefe.ctxQuali(o.sea)));
      const id = idBase(mundo, o.g);
      sA.field.filter(f => f.teamId === id).forEach(f => deQuem.set(f.id, o));
    }
    em(FA, () => J.Classif.simularTudo(sA, (id, ses) => { const o = deQuem.get(id); return o ? em(o.F, () => o.vq(id, ses)) : vqA(id, ses); }));
  }
  em(FA, () => J.Chefe.gridDaEtapa(sA));
  /* cada outra equipe fica com o mesmo resultado de sábado (e calcula onde os carros dela ficaram) */
  for(const o of outras){
    o.sea.qs = Object.assign(clone(sA.qs), { janelas: o.janelas });
    delete o.sea.qs.grid;
    em(o.F, () => J.Chefe.gridDaEtapa(o.sea));
  }
  /* domingo: cada lado monta os seus; a corrida usa os carros humanos de cada um */
  const MA = em(FA, () => J.Chefe.montar());
  for(const o of outras) o.M = em(o.F, () => J.Chefe.montar());
  const deOutra = new Map();
  for(const o of outras) o.M.corre.filter(f => f.teamId === 'EU').forEach(f => deOutra.set(f.id, o));
  const paraA = x => Object.assign({}, x, { f: sA.field.find(f => f.id === x.f.id) || x.f });
  const dosOutros = lista => outras.flatMap(o => o.M[lista].filter(x => deOutra.get(x.f.id) === o).map(paraA));
  const M = Object.assign({}, MA, {
    running: MA.running.filter(x => !deOutra.has(x.f.id)).concat(dosOutros('running')),
    out: MA.out.filter(x => !deOutra.has(x.f.id)).concat(dosOutros('out')),
    /* sem ordem de equipe no multiplayer por enquanto: ela só valeria para um dos lados */
    dec: Object.assign({}, MA.dec, { ordem: 'livre' })
  });
  /* corrida ao vivo (Fase 5): de quem é cada carro (o slot, ou os membros de uma equipe dividida),
     com o ritmo e o pneu de largada que cada equipe deixou combinados (o que UIC.largar põe na entrada) */
  if(J.mpCorridas){
    const MODO = { ataque: 'atacar', poupar: 'poupar' };
    const modos = {}, pneus = {}, donos = {};
    for(const [sea, Mx] of [[sA, MA], ...outras.map(o => [o.sea, o.M])]){
      const fds = sea.fds && sea.fds.rd === sea.round && sea.fds.efeitos && sea.fds.efeitos.modo;
      const esc = sea.pneusLargada && sea.pneusLargada.rd === sea.round ? sea.pneusLargada.carros || {} : {};
      sea.field.filter(f => f.teamId === 'EU').forEach(f => {
        modos[f.id] = MODO[(Mx.dec.estr || {})[f.carro]] || fds || 'normal';
        if(esc[f.id]) pneus[f.id] = esc[f.id];
      });
    }
    for(const k of equipesDe(mundo)){ const m = membrosDe(mundo, k); donos[idBase(mundo, k)] = m.length === 1 ? m[0] : m; }
    J.mpCorridas.contexto = { modo: 'chefe', donos, modos, pneus };
  }
  let recA;
  try { recA = em(FA, () => J.Chefe.correr({ montagem: M })); } finally { if(J.mpCorridas) J.mpCorridas.contexto = null; }
  J.C = FA; J.UI.limparFila();
  absorver(J, mundo, h, FA, { compartilhado: true });
  /* a mesma chegada, aplicada à economia e aos pilotos de cada outra equipe */
  const ch = recA.chegada, recs = { [h]: recA };
  for(const o of outras){
    const paraB = x => Object.assign({}, x, { f: o.sea.field.find(f => f.id === x.f.id) || x.f });
    const midsAntes = midsDe(mundo.equipes[o.g]);
    recs[o.g] = em(o.F, () => J.Chefe.correr({ montagem: Object.assign({}, o.M, { dec: Object.assign({}, o.M.dec, { ordem: 'livre' }) }),
      finish: ch.finish.map(paraB), flId: ch.flId, sc: ch.sc }));
    J.C = o.F; J.UI.limparFila();
    absorver(J, mundo, o.g, o.F, { compartilhado: false, midsAntes });
  }
  return recs;
}
