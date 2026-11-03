/* O modo chefe com várias equipes humanas no mesmo mundo, em cima do motor do jogo.

   O jogo só conhece uma equipe humana, a 'EU'. Em vez de reescrevê-lo, o mundo da sala
   guarda uma parte compartilhada (o registro de pilotos, a IA, a fase, o ano, e a temporada
   de cada categoria) e um pacote por equipe (caixa, carro, pilotos, patrocínios, decisões...).
   Para agir por uma equipe, monta-se a "perspectiva" dela: o mundo com o pacote dela, em que
   ela é a 'EU' e as outras humanas da mesma categoria aparecem como 'EU2', 'EU3'... As de
   outra categoria vão em C.mpOutras com fora: true (só para os pilotos delas não estarem à
   venda); o jogo não põe essas no grid.

   Várias pessoas podem dividir uma equipe: todas mandam em tudo. O pacote é da equipe
   (mundo.equipes, pela chave dela: o menor slot entre os membros) e mundo.membros diz de
   que equipe é cada jogador.

   Campeonatos separados (salas com mundo.grupos): cada categoria em que há equipe humana é um
   grupo, com a temporada dela (mundo.grupos[cat].base.temporada) e os ids das equipes humanas
   nela (mundo.grupos[cat].ids: a primeira, na ordem da sala, é a 'EU'). A categoria, a escada
   e o inverno (o mercado de pilotos incluído) são de cada equipe. Quem sobe de categoria muda
   de grupo no começo da temporada seguinte. Salas antigas (sem grupos) têm um campeonato só,
   com tudo o que não é da equipe em mundo.base, e seguem funcionando.

   - Ações (as decisões de um jogador): rodam na perspectiva da equipe dele, e o mundo que
     sai dali vale para todos (o servidor faz uma ação por vez).
   - Viradas de fase (começo de temporada, fim de temporada, ano novo): rodam primeiro do
     lado do anfitrião, que decide o mundo; depois do lado de cada outra equipe. A primeira
     equipe de outra categoria decide a temporada daquela categoria (sobre o mundo que o
     anfitrião deixou); as demais rodam sobre uma cópia de antes, e dali só sai o que é delas:
     o pacote, os carros e os registros dos pilotos delas.
   - A corrida: uma por categoria. A classificação roda uma vez, com cada carro humano
     avaliado na perspectiva da sua equipe; a montagem do domingo junta os lados e corre uma
     vez; a mesma chegada é aplicada depois à economia de cada outra equipe da categoria. */

/* o que é de cada equipe; o resto é o mundo */
export const CHAVES = {
  raiz: ['chefe', 'eq', 'caixa', 'livro', 'rep', 'part', 'dir', 'carro', 'motor', 'instal', 'obras', 'staff', 'pilotos',
         'patro', 'plano', 'acad', 'futuroBonus', 'news', 'decisao', 'n1', 'pecas', 'acertos', 'instalAno', 'balanco',
         'ultimaPos', 'rel', 'hist', 'eventos', 'evento', 'inicio', 'total', 'carreira', 'carroDoAno', 'modo', 'seq',
         'cenario', 'eqDesde', 'divida', 'mpContra', 'penalTunel', 'penalTunelAno', 'vendida', 'conceito', 'exPiloto', 'mpFechada'],
  temporada: ['results', 'qsHist', 'meta', 'rankCarro', 'gastoTeto', 'pacotes', 'evol', 'leitura', 'ac', 'conf', 'objPatro', 'fds', 'metaNeg', 'excluida'],
  qs: ['janelas'],
  inv: ['tent', 'msgs', 'decisoes', 'staffMerc', 'patro', 'olheiros', 'investidores', 'convites', 'subir']
};
/* o mundo conhecido; uma chave fora das duas listas aparece nos testes */
export const MUNDO = ['v', 'realismo', 'sk', 'topo', 'cat', 'escada', 'mundo', 'temporada', 'W', 'ia', 'fase', 'inv', 'ano'];
/* com campeonatos separados, também são da equipe: a categoria e a escada (o inverno inteiro também, à parte) */
const DA_EQUIPE = ['cat', 'topo', 'escada'];

const clone = o => o === undefined ? undefined : structuredClone(o);
const pegar = (o, ks) => { const r = {}; if(o) for(const k of ks) if(k in o) r[k] = o[k]; return r; };
const tirar = (o, ks) => { if(o) for(const k of ks) delete o[k]; };

export const agrupado = mundo => !!mundo.grupos;
const chavesRaiz = mundo => agrupado(mundo) ? CHAVES.raiz.concat(DA_EQUIPE) : CHAVES.raiz;

/* as equipes humanas, na ordem da sala (a do anfitrião primeiro) */
export const equipesDe = mundo => (mundo.ordem || [mundo.anfitriao, mundo.convidado]).map(String);
/* a equipe de um jogador (a chave de uma equipe também serve: ela é um dos membros) */
export const equipeDe = (mundo, slot) => String(mundo.membros && mundo.membros[slot] !== undefined ? mundo.membros[slot] : slot);
/* os jogadores de uma equipe */
export const membrosDe = (mundo, k) => mundo.membros
  ? Object.keys(mundo.membros).filter(s => String(mundo.membros[s]) === String(k)).sort((a, b) => a - b) : [String(k)];
/* a categoria (grupo) em que a temporada de uma equipe está guardada; '*' nas salas de um campeonato só */
export const grupoDe = (mundo, slot) => agrupado(mundo) ? String(mundo.equipes[equipeDe(mundo, slot)].grupo) : '*';
/* as categorias com equipe humana, na ordem da sala (a do anfitrião primeiro) */
export const gruposDe = mundo => { const gs = []; for(const k of equipesDe(mundo)){ const g = grupoDe(mundo, k); if(!gs.includes(g)) gs.push(g); } return gs; };
/* as equipes de uma categoria, na ordem da sala */
export const doGrupo = (mundo, g) => equipesDe(mundo).filter(k => grupoDe(mundo, k) === String(g));
/* onde fica o que a categoria divide (a temporada); nas salas de um campeonato só, é o mundo */
const baseDoGrupo = (mundo, g) => agrupado(mundo) ? (mundo.grupos[g] || (mundo.grupos[g] = { base: {}, ids: {} })).base : mundo.base;
export const temporadaDo = (mundo, g) => baseDoGrupo(mundo, g).temporada;
/* o id de uma equipe na temporada guardada da categoria dela: 'EU' para a primeira, 'EU2', 'EU3'... */
const idBase = (mundo, k) => {
  if(agrupado(mundo)){ const G = mundo.grupos[grupoDe(mundo, k)]; return (G && G.ids && G.ids[k]) || 'EU'; }
  const i = equipesDe(mundo).indexOf(String(k)); return i <= 0 ? 'EU' : 'EU' + (i + 1);
};
/* o id da equipe j vista pela equipe k, da mesma categoria (k troca de lugar com o 'EU') */
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
/* uma outra equipe humana como a perspectiva de k a vê: da mesma categoria, com id e carros; de outra, fora */
const outraDe = (mundo, j, k) => {
  const vo = mundo.equipes[j].vitrine;
  if(grupoDe(mundo, j) !== grupoDe(mundo, k)) return { id: 'FX' + j, fora: true, nome: vo.nome, cor: vo.cor, str: vo.str, reservados: vo.reservados, carros: [] };
  return { id: idVisto(mundo, j, k), nome: vo.nome, cor: vo.cor, str: vo.str, reservados: vo.reservados, carros: vo.carros };
};

/* a perspectiva da equipe de um jogador: um C completo, só dela, pronto para o motor.
   base e gbase: o mundo e a parte da categoria de antes (numa virada de fase) */
export function perspectiva(mundo, slot, base, gbase){
  const k = equipeDe(mundo, slot);
  const C = clone(base || mundo.base);
  if(agrupado(mundo)) Object.assign(C, clone(gbase || baseDoGrupo(mundo, grupoDe(mundo, k))));
  const b = mundo.equipes[k];
  Object.assign(C, clone(b.raiz));
  if(C.temporada){
    Object.assign(C.temporada, clone(b.temporada));
    if(C.temporada.qs) Object.assign(C.temporada.qs, clone(b.qs));
  }
  if(agrupado(mundo)) C.inv = b.inv == null ? null : clone(b.inv);
  else if(C.inv) Object.assign(C.inv, clone(b.inv));
  trocarIds(C, idBase(mundo, k));
  C.mpOutras = equipesDe(mundo).filter(j => j !== k).map(j => outraDe(mundo, j, k));
  if(C.temporada){
    const daqui = C.mpOutras.filter(o => !o.fora);
    for(const o of daqui){ const t = C.temporada.teams.find(x => x.id === o.id); if(t) t.str = o.str; }
    /* das outras equipes, só os carros que estão escalados correm */
    const outras = new Set(daqui.map(o => o.id));
    C.temporada.field = C.temporada.field.filter(f => !outras.has(f.teamId) || f.ativo);
  }
  return C;
}

/* guarda de volta o que saiu de uma perspectiva.
   compartilhado: o mundo inteiro vem dela (o de todos e o da categoria dela);
   grupo: só a parte da categoria dela (a primeira equipe de outra categoria numa virada de fase);
   senão, só o que é da equipe (pacote, carros, registros dos pilotos dela) */
export function absorver(J, mundo, slot, C, { compartilhado, grupo, midsAntes } = {}){
  const k = equipeDe(mundo, slot), g = grupoDe(mundo, k);
  const vit = (J.C = C, vitrine(J, C));
  const id = idBase(mundo, k);
  trocarIds(C, id);
  const b = mundo.equipes[k] || (mundo.equipes[k] = {});
  b.raiz = clone(pegar(C, chavesRaiz(mundo)));
  b.temporada = C.temporada ? clone(pegar(C.temporada, CHAVES.temporada)) : {};
  b.qs = C.temporada && C.temporada.qs ? clone(pegar(C.temporada.qs, CHAVES.qs)) : {};
  b.inv = agrupado(mundo) ? (C.inv == null ? null : clone(C.inv)) : C.inv ? clone(pegar(C.inv, CHAVES.inv)) : {};
  b.vitrine = vit;
  /* o que a categoria divide: a temporada, sem o que é de cada equipe */
  const daCategoria = () => {
    const s = clone(C.temporada);
    if(s){ tirar(s, CHAVES.temporada); if(s.qs) tirar(s.qs, CHAVES.qs); }
    return s;
  };
  if(compartilhado){
    const base = clone(C);
    tirar(base, chavesRaiz(mundo)); delete base.mpOutras;
    if(agrupado(mundo)){
      baseDoGrupo(mundo, g).temporada = daCategoria();
      delete base.temporada; delete base.inv;
    } else {
      if(base.temporada){ tirar(base.temporada, CHAVES.temporada); if(base.temporada.qs) tirar(base.temporada.qs, CHAVES.qs); }
      if(base.inv) tirar(base.inv, CHAVES.inv);
    }
    mundo.base = base;
    return;
  }
  /* os registros de quem é (ou era, até esta fase) piloto desta equipe */
  const mids = new Set([...(midsAntes || []), ...midsDe(b)]);
  if(mundo.base.W && C.W) for(const m of mids) if(C.W.p[m]) mundo.base.W.p[m] = clone(C.W.p[m]);
  if(grupo){ baseDoGrupo(mundo, g).temporada = daCategoria(); return; }
  /* os carros desta equipe no grid da categoria, e a força dela */
  const sb = baseDoGrupo(mundo, g).temporada, sc = C.temporada;
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

/* os grupos pela categoria de cada equipe agora (no começo da temporada, quem subiu muda de grupo):
   em cada categoria, a primeira equipe na ordem da sala é a 'EU', as outras 'EU2', 'EU3'... */
export function reagrupar(mundo){
  if(!agrupado(mundo)) return;
  const por = {};
  for(const k of equipesDe(mundo)){ const g = String(mundo.equipes[k].raiz.cat); (por[g] = por[g] || []).push(k); }
  const grupos = {};
  for(const [g, ks] of Object.entries(por)){
    grupos[g] = { base: mundo.grupos[g] ? mundo.grupos[g].base : {}, ids: {} };
    ks.forEach((k, i) => { grupos[g].ids[k] = i ? 'EU' + (i + 1) : 'EU'; mundo.equipes[k].grupo = g; });
  }
  mundo.grupos = grupos;
}

/* ── a sala ── */

/* equipes da mesma série e do mesmo ano; o anfitrião decide o mundo.
   equipes: { chave: { chefe, cc, idx } (uma real), { chefe, cc, criar: { nome, cor, cc }, fin } (fundada)
   ou { chefe, cc, criar, fin, base: categoria } (começando na base) }; ordem: as chaves, a do anfitrião
   primeiro; membros: { slot: chave }. Sem ordem, valem anfitriao e convidado (duas equipes, um jogador
   cada, um campeonato só, como nas salas antigas). */
export function criarMundo(J, { sk, ano, anfitriao, convidado, equipes, ordem, membros }){
  const ks = (ordem || [anfitriao, convidado]).map(String);
  const novo = (e, seq) => {
    J.Chefe.novo(Object.assign({ chefe: { nome: e.chefe, cc: e.cc || 'BR' }, realismo: true, sk, ano, seq },
      e.criar ? { modo: e.base ? 'base' : 'criar', cat: e.base, fin: e.fin || 'investidor', eq: { nome: e.criar.nome, cor: e.criar.cor, cc: e.criar.cc } }
              : { modo: 'assumir', idx: e.idx }));
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
    /* com ordem, campeonatos separados: cada equipe começa no grupo da categoria dela */
    mundo.grupos = {};
    ks.forEach((k, i) => { mundo.equipes[k] = { grupo: String(Cs[i].cat), raiz: { cat: Cs[i].cat } }; });
    reagrupar(mundo);
  }
  const daEquipe = C => ({ raiz: clone(pegar(C, chavesRaiz(mundo))), temporada: {}, qs: {},
    inv: agrupado(mundo) ? clone(C.inv || null) : C.inv ? clone(pegar(C.inv, CHAVES.inv)) : {} });
  /* as outras equipes ainda não estão no mundo do anfitrião: o pacote de cada uma vem do mundo dela */
  ks.slice(1).forEach((k, i) => {
    const CB = Cs[i + 1];
    J.C = CB;
    mundo.equipes[k] = Object.assign(mundo.equipes[k] || {}, daEquipe(CB), { vitrine: vitrine(J, CB) });
  });
  /* o mundo é o do anfitrião, com o mercado refeito sem os pilotos das outras equipes */
  const CA = Cs[0];
  mundo.equipes[ks[0]] = Object.assign(mundo.equipes[ks[0]] || {}, daEquipe(CA));
  CA.mpOutras = ks.slice(1).map(k => Object.assign(outraDe(mundo, k, ks[0]), { carros: [] }));
  J.C = CA;
  if(CA.inv) CA.inv.mercado = J.Chefe.ehTopo() ? J.Chefe.mercadoPilotos() : J.Chefe.mercadoJunior();
  absorver(J, mundo, ks[0], CA, { compartilhado: true });
  /* e os pilotos de cada outra equipe passam a ser dela também no registro do mundo; com campeonatos
     separados, o mercado de cada uma é refeito no mundo de todos (sem os pilotos das outras equipes) */
  for(const k of ks.slice(1)){
    const FB = perspectiva(mundo, k);
    J.C = FB;
    FB.pilotos.forEach(p => J.Chefe.ligar(p));
    absorver(J, mundo, k, FB, { compartilhado: false });
  }
  if(agrupado(mundo)) for(const k of ks.slice(1)){
    const FB = perspectiva(mundo, k);
    J.C = FB;
    if(FB.inv) FB.inv.mercado = J.Chefe.ehTopo() ? J.Chefe.mercadoPilotos() : J.Chefe.mercadoJunior();
    J.UI.limparFila();
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

/* uma virada de fase: o anfitrião decide o mundo; a primeira equipe de cada outra categoria decide a
   temporada dela (sobre o mundo que o anfitrião deixou); as demais rodam sobre o mundo de antes.
   novaTemporada: no começo da temporada, quem mudou de categoria muda de grupo antes */
export function faseDupla(J, mundo, fn, { novaTemporada } = {}){
  if(novaTemporada) reagrupar(mundo);
  const antes = clone(mundo.base), gantes = agrupado(mundo) ? clone(mundo.grupos) : null;
  const [h, ...outras] = equipesDe(mundo);
  const decididas = new Set([grupoDe(mundo, h)]);
  const FA = perspectiva(mundo, h);
  J.C = FA; fn(J, FA); J.UI.limparFila();
  absorver(J, mundo, h, FA, { compartilhado: true });
  for(const g of outras){
    const midsAntes = midsDe(mundo.equipes[g]), cat = grupoDe(mundo, g);
    const lidera = !decididas.has(cat);
    decididas.add(cat);
    const FB = lidera ? perspectiva(mundo, g) : perspectiva(mundo, g, antes, gantes && gantes[cat] ? gantes[cat].base : undefined);
    J.C = FB; fn(J, FB); J.UI.limparFila();
    absorver(J, mundo, g, FB, { grupo: lidera, midsAntes });
  }
}

/* o fim de semana de uma categoria (sem g: a do anfitrião): classificação e corrida uma vez só, para
   todas as equipes humanas dela; devolve o registro de cada equipe */
export function corrida(J, mundo, g){
  const [h, ...ks] = doGrupo(mundo, g === undefined ? grupoDe(mundo, equipesDe(mundo)[0]) : g);
  const FA = perspectiva(mundo, h), sA = FA.temporada;
  const outras = ks.map(k => { const F = perspectiva(mundo, k); return { g: k, F, sea: F.temporada }; });
  const em = (C, fn) => { const antes = J.C; J.C = C; try { return fn(); } finally { J.C = antes; } };
  /* o tempo da etapa é um só: o lado da primeira equipe sorteia */
  em(FA, () => J.Chefe.chuvaDaEtapa(sA));
  for(const o of outras) o.sea.clima = clone(sA.clima);
  /* sábado: as sessões rodam uma vez; cada carro humano vale o que vale na equipe dele */
  /* o imprevisto do fim de semana de cada equipe vale na hora de correr, mesmo que o sábado já tenha sido criado
     por uma decisão de outro lado (resolver duas vezes não faz nada) */
  em(FA, () => J.Chefe.fdsResolver(sA));
  for(const o of outras) em(o.F, () => J.Chefe.fdsResolver(o.sea));
  em(FA, () => J.Chefe.qualiDaEtapa(sA));
  /* o sábado pode ter nascido numa decisão de outra equipe: sem janelas escolhidas do lado da primeira, vale a janela padrão */
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
    for(const k of [h, ...ks]){ const m = membrosDe(mundo, k); donos[idBase(mundo, k)] = m.length === 1 ? m[0] : m; }
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
