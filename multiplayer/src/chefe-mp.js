/* O modo chefe com duas equipes humanas no mesmo mundo, em cima do motor do jogo.

   O jogo só conhece uma equipe humana, a 'EU'. Em vez de reescrevê-lo, o mundo da sala
   guarda uma parte compartilhada (a temporada, o registro de pilotos, a IA, o mercado) e
   um pacote por equipe (caixa, carro, pilotos, patrocínios, decisões...). Para agir por
   uma equipe, monta-se a "perspectiva" dela: o mundo com o pacote dela, em que ela é a
   'EU' e a outra humana aparece com o id 'EU2'. O anfitrião guarda o mundo com os ids
   dele; o convidado vê os ids trocados.

   - Ações (as decisões de um jogador): rodam na perspectiva dele, e o mundo que sai dali
     vale para todos (o servidor faz uma ação por vez).
   - Viradas de fase (começo de temporada, fim de temporada, ano novo): rodam primeiro do
     lado do anfitrião, que decide o mundo; depois do lado do convidado, sobre uma cópia
     do mundo de antes, e dali só sai o que é dele: o pacote, os carros e os registros dos
     pilotos dele.
   - A corrida: a classificação roda uma vez, com cada carro humano avaliado na
     perspectiva da sua equipe; a montagem do domingo junta os dois lados e corre uma vez;
     a mesma chegada é aplicada depois à economia do convidado. */

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
const idDe = (mundo, slot) => String(slot) === String(mundo.anfitriao) ? 'EU' : 'EU2';
const outroDe = (mundo, slot) => String(slot) === String(mundo.anfitriao) ? mundo.convidado : mundo.anfitriao;

/* 'EU' ↔ 'EU2' na temporada: na lista de equipes, nos carros e na tabela de construtores.
   Trocar duas vezes volta ao começo. */
export function trocarIds(C){
  const t = C && C.temporada; if(!t) return C;
  const tr = id => id === 'EU' ? 'EU2' : id === 'EU2' ? 'EU' : id;
  for(const x of t.teams || []){
    if(x.id !== 'EU' && x.id !== 'EU2') continue;
    x.id = tr(x.id);
    if(x.id === 'EU'){ x.nossa = true; delete x.humana; } else { x.humana = true; delete x.nossa; }
  }
  for(const f of t.field || []){
    if(f.teamId !== 'EU' && f.teamId !== 'EU2') continue;
    f.teamId = tr(f.teamId);
    if(f.teamId === 'EU') f.nosso = true; else delete f.nosso;
  }
  if(t.cstand){ const a = t.cstand.EU, b = t.cstand.EU2; delete t.cstand.EU; delete t.cstand.EU2; if(b !== undefined) t.cstand.EU = b; if(a !== undefined) t.cstand.EU2 = a; }
  return C;
}

/* o que a outra equipe mostra ao mundo: nome, cor, força do carro, quem é dela e os carros
   dela no grid (calculado com a perspectiva dela ativa) */
function vitrine(J, C){
  return {
    nome: C.eq.nome, cor: C.eq.cor, str: J.Chefe.forca(),
    reservados: (C.pilotos || []).filter(p => p.papel !== 'emprestado').map(p => p.nome),
    carros: C.temporada ? C.temporada.field.filter(f => f.teamId === 'EU').map(f => clone(f)) : []
  };
}
const midsDe = b => new Set(((b && b.raiz && b.raiz.pilotos) || []).map(p => p.mid).filter(Boolean));

/* a perspectiva de uma equipe: um C completo, só dela, pronto para o motor */
export function perspectiva(mundo, slot, base){
  const C = clone(base || mundo.base);
  const b = mundo.equipes[slot];
  Object.assign(C, clone(b.raiz));
  if(C.temporada){
    Object.assign(C.temporada, clone(b.temporada));
    if(C.temporada.qs) Object.assign(C.temporada.qs, clone(b.qs));
  }
  if(C.inv) Object.assign(C.inv, clone(b.inv));
  if(idDe(mundo, slot) === 'EU2') trocarIds(C);
  const vo = mundo.equipes[outroDe(mundo, slot)].vitrine;
  C.mpOutras = [{ id: 'EU2', nome: vo.nome, cor: vo.cor, str: vo.str, reservados: vo.reservados, carros: vo.carros }];
  if(C.temporada){
    const t = C.temporada.teams.find(x => x.id === 'EU2'); if(t) t.str = vo.str;
    /* da outra equipe, só os carros que estão escalados correm */
    C.temporada.field = C.temporada.field.filter(f => f.teamId !== 'EU2' || f.ativo);
  }
  return C;
}

/* guarda de volta o que saiu de uma perspectiva. compartilhado: o mundo inteiro vem dela;
   senão, só o que é da equipe (pacote, carros, registros dos pilotos dela) */
export function absorver(J, mundo, slot, C, { compartilhado, midsAntes } = {}){
  const vit = (J.C = C, vitrine(J, C));
  const id = idDe(mundo, slot);
  if(id === 'EU2') trocarIds(C);
  const b = mundo.equipes[slot] || (mundo.equipes[slot] = {});
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

/* duas equipes reais da mesma série e do mesmo ano; o anfitrião decide o mundo */
export function criarMundo(J, { sk, ano, anfitriao, convidado, equipes }){
  const novo = (e, seq) => {
    J.Chefe.novo({ chefe: { nome: e.chefe, cc: e.cc || 'BR' }, realismo: true, modo: 'assumir', sk, ano, idx: e.idx, seq });
    J.UI.limparFila(); J.UI.close();
    return J.C;
  };
  const CA = novo(equipes[anfitriao], 0);
  const CB = novo(equipes[convidado], 500000);
  const mundo = { v: 1, sk, ano, anfitriao: String(anfitriao), convidado: String(convidado), etapa: 'inverno', base: null, equipes: {} };
  /* o convidado ainda não está no mundo do anfitrião: o pacote dele vem do mundo dele */
  J.C = CB;
  mundo.equipes[mundo.convidado] = { raiz: clone(pegar(CB, CHAVES.raiz)), temporada: {}, qs: {}, inv: CB.inv ? clone(pegar(CB.inv, CHAVES.inv)) : {}, vitrine: vitrine(J, CB) };
  /* o mundo é o do anfitrião, com o mercado refeito sem os pilotos do convidado */
  const vo = mundo.equipes[mundo.convidado].vitrine;
  CA.mpOutras = [{ id: 'EU2', nome: vo.nome, cor: vo.cor, str: vo.str, reservados: vo.reservados, carros: [] }];
  J.C = CA;
  if(CA.inv) CA.inv.mercado = J.Chefe.mercadoPilotos();
  absorver(J, mundo, mundo.anfitriao, CA, { compartilhado: true });
  /* e os pilotos do convidado passam a ser dele também no registro do mundo */
  const FB = perspectiva(mundo, mundo.convidado);
  J.C = FB;
  FB.pilotos.forEach(p => J.Chefe.ligar(p));
  absorver(J, mundo, mundo.convidado, FB, { compartilhado: false });
  return mundo;
}

/* uma decisão de um jogador: roda na perspectiva dele e o mundo que sai vale para todos */
export function agir(J, mundo, slot, fn){
  const C = perspectiva(mundo, slot);
  J.C = C;
  const r = fn(J, C);
  J.UI.limparFila();
  absorver(J, mundo, slot, C, { compartilhado: true });
  return r;
}

/* uma virada de fase: o anfitrião decide o mundo; o convidado roda sobre o mundo de antes */
export function faseDupla(J, mundo, fn){
  const antes = clone(mundo.base), g = mundo.convidado;
  const FA = perspectiva(mundo, mundo.anfitriao);
  J.C = FA; fn(J, FA); J.UI.limparFila();
  absorver(J, mundo, mundo.anfitriao, FA, { compartilhado: true });
  const midsAntes = midsDe(mundo.equipes[g]);
  const FB = perspectiva(mundo, g, antes);
  J.C = FB; fn(J, FB); J.UI.limparFila();
  absorver(J, mundo, g, FB, { compartilhado: false, midsAntes });
}

/* o fim de semana: classificação e corrida uma vez só, para os dois */
export function corrida(J, mundo){
  const h = mundo.anfitriao, g = mundo.convidado;
  const FA = perspectiva(mundo, h), FB = perspectiva(mundo, g);
  const sA = FA.temporada, sB = FB.temporada;
  const em = (C, fn) => { const antes = J.C; J.C = C; try { return fn(); } finally { J.C = antes; } };
  /* o tempo da etapa é um só: o lado do anfitrião sorteia */
  em(FA, () => J.Chefe.chuvaDaEtapa(sA));
  sB.clima = clone(sA.clima);
  /* sábado: as sessões rodam uma vez; cada carro humano vale o que vale na equipe dele */
  /* o imprevisto do fim de semana de cada equipe vale na hora de correr, mesmo que o sábado já tenha sido criado
     por uma decisão do outro lado (resolver duas vezes não faz nada) */
  em(FA, () => J.Chefe.fdsResolver(sA));
  em(FB, () => J.Chefe.fdsResolver(sB));
  em(FA, () => J.Chefe.qualiDaEtapa(sA));
  /* o sábado pode ter nascido numa decisão do convidado: sem janelas escolhidas do lado do anfitrião, vale a janela padrão */
  if(!sA.qs.janelas) sA.qs.janelas = {};
  const janelasB = (sB.qs && sB.qs.rd === sA.qs.rd && sB.qs.janelas) || {};
  sB.qs = Object.assign(clone(sA.qs), { janelas: janelasB });
  if(!sA.qs.concluida){
    const vqA = em(FA, () => J.Chefe.valorQuali(sA, J.Chefe.ctxQuali(sA)));
    const vqB = em(FB, () => J.Chefe.valorQuali(sB, J.Chefe.ctxQuali(sB)));
    const doB = new Set(sA.field.filter(f => f.teamId === 'EU2').map(f => f.id));
    em(FA, () => J.Classif.simularTudo(sA, (id, ses) => doB.has(id) ? em(FB, () => vqB(id, ses)) : vqA(id, ses)));
  }
  em(FA, () => J.Chefe.gridDaEtapa(sA));
  /* o convidado fica com o mesmo resultado de sábado (e calcula onde os carros dele ficaram) */
  sB.qs = Object.assign(clone(sA.qs), { janelas: janelasB });
  delete sB.qs.grid;
  em(FB, () => J.Chefe.gridDaEtapa(sB));
  /* domingo: cada lado monta os seus; a corrida usa os carros humanos de cada um */
  const MA = em(FA, () => J.Chefe.montar()), MB = em(FB, () => J.Chefe.montar());
  const doB = new Set(MB.corre.filter(f => f.teamId === 'EU').map(f => f.id));
  const paraA = x => Object.assign({}, x, { f: sA.field.find(f => f.id === x.f.id) || x.f });
  const M = Object.assign({}, MA, {
    running: MA.running.filter(x => !doB.has(x.f.id)).concat(MB.running.filter(x => doB.has(x.f.id)).map(paraA)),
    out: MA.out.filter(x => !doB.has(x.f.id)).concat(MB.out.filter(x => doB.has(x.f.id)).map(paraA)),
    /* sem ordem de equipe no multiplayer por enquanto: ela só valeria para um dos dois lados */
    dec: Object.assign({}, MA.dec, { ordem: 'livre' })
  });
  const recA = em(FA, () => J.Chefe.correr({ montagem: M }));
  J.C = FA; J.UI.limparFila();
  absorver(J, mundo, h, FA, { compartilhado: true });
  /* a mesma chegada, aplicada à economia e aos pilotos do convidado */
  const ch = recA.chegada;
  const paraB = x => Object.assign({}, x, { f: sB.field.find(f => f.id === x.f.id) || x.f });
  const midsAntes = midsDe(mundo.equipes[g]);
  const recB = em(FB, () => J.Chefe.correr({ montagem: Object.assign({}, MB, { dec: Object.assign({}, MB.dec, { ordem: 'livre' }) }),
    finish: ch.finish.map(paraB), flId: ch.flId, sc: ch.sc }));
  J.C = FB; J.UI.limparFila();
  absorver(J, mundo, g, FB, { compartilhado: false, midsAntes });
  return { [h]: recA, [g]: recB };
}
