/* A classificação ao vivo no multiplayer (modo chefe), em cima da sessão do jogo (Sessao).

   A sessão do jogo sorteia o ritmo a cada volta rápida: nenhuma tela consegue refazer a mesma
   sessão. Por isso aqui quem roda é só o servidor: a sessão anda no relógio da sala, e as telas
   recebem o estado dela (quem está na pista, em que volta, os tempos) e mostram. As ordens de
   cada jogador ("sair para a pista" com um carro dele) vêm para o servidor e valem na hora.

   - Cada sessão (Q1, Q2, Q3...) é uma etapa ao vivo da rodada. Quando ela acaba, o valor de
     cada carro fica guardado (resultado()), e a passada seguinte da rodada aplica esses valores
     com Classif.rodar (o mesmo que a tela do jogo faz no fim da sessão) e abre a próxima.
   - Os carros humanos de todas as equipes da categoria são de controle: cada um é avaliado na
     perspectiva da equipe dele (a janela de saída e a força do carro de cada uma). Quem não manda
     o carro para a pista sai sozinho no meio da sessão, como o jogo faz ao simular a sessão.
   - Pular até o fim: com o voto de todos os humanos da sessão (o anfitrião não espera). */

const DT = .5;                           // o passo da sessão do jogo (Sessao.terminar usa o mesmo)
const MAX_PASSOS = 20000;
const clone = o => o === undefined ? undefined : structuredClone(o);

/* a sessão ao vivo de uma categoria, criada no meio da passada da rodada (perspectivas do lado de
   cada equipe já com o fim de semana até o sábado). Tudo é copiado: a passada segue sem ela. */
export function criarSessao(J, { FA, outras, chave, donos, idDe }){
  const em = (C, fn) => { const antes = J.C; J.C = C; try { return fn(); } finally { J.C = antes; } };
  const A = clone(FA), Bs = outras.map(o => ({ F: clone(o.F), id: o.id }));
  const S = em(A, () => J.Sessao.criar('quali'));
  if(!S) return null;
  /* quem é de quem: os carros da primeira equipe já são de controle; os das outras equipes também */
  const deQuem = new Map();
  for(const b of Bs){
    b.sea = b.F.temporada;
    b.vq = em(b.F, () => J.Chefe.valorQuali(b.sea, J.Chefe.ctxQuali(b.sea)));
    S.sea.field.filter(f => f.teamId === b.id).forEach(f => deQuem.set(f.id, b));
  }
  const baseA = S.base;
  S.base = (id, ses) => {
    const b = deQuem.get(id);
    if(!b) return em(A, () => baseA(id, ses));
    /* a janela de saída deste carro vale na equipe dele */
    const c = S.carros.find(x => x.id === id);
    if(c && b.sea.qs){ b.sea.qs.janelas = b.sea.qs.janelas || {}; b.sea.qs.janelas[c.carro] = S.qs.janelas[c.carro]; }
    const f = b.sea.field.find(x => x.id === id);
    const r = em(b.F, () => b.vq(id, ses));
    return f ? r : { v: -1e9 };
  };
  const donoDe = {};
  S.carros.forEach((c, i) => {
    const b = deQuem.get(c.id);
    /* um carro de outra equipe humana: de controle, sem o plano de saídas da IA */
    if(b){ c.ctrl = true; c.carro = (b.sea.field.find(f => f.id === c.id) || {}).carro; delete c.v; c.plano = []; }
    const id = b ? b.id : c.ctrl ? 'EU' : null;
    if(id && donos[id] !== undefined) donoDe[i] = donos[id];
    else if(c.ctrl) c.ctrl = false;
  });
  /* quem não mandar sair, sai no meio da sessão (o que Sessao.terminar faz) */
  if(!S.emFila) S.carros.forEach(c => { if(c.ctrl && !c.plano.length) c.plano = [S.dur * .55]; });
  /* o vRef: a referência de ritmo é a da IA, calculada sem os carros das outras equipes */
  const ia = S.carros.filter(c => !c.ctrl && c.v != null);
  S.vRef = ia.length ? Math.max(...ia.map(c => c.v)) : S.vRef;
  return new SessaoMP(J, S, { chave, donos: donoDe, em, A });
}

export class SessaoMP {
  constructor(J, S, { chave, donos, em, A }){
    this.J = J; this.S = S; this.em = em; this.A = A;
    const slots = [...new Set(Object.values(donos).flatMap(d => [].concat(d).map(String)))].sort((a, b) => a - b);
    /* o que a sala lê de uma corrida ao vivo: a chave, os donos e quem está nela */
    this.def = { chave, donos, slots, sessao: true, serie: S.ses ? S.ses.n : 'Classificação', chefe: true };
    this.fase = 'correndo'; this.alvo = 0; this.relogio = 0; this.votos = {}; this.largadas = {}; this.fora = {};
    this.passo = 0; this.liberado = 0; this.log = []; this.prazo = 0; this.res = null;
    this.ver = 0;                          // muda a cada mudança que as telas precisam ver
  }
  donosDe(i){ const d = this.def.donos[i]; return d === undefined ? [] : [].concat(d).map(String); }
  manda(i, slot){ return this.donosDe(i).includes(String(slot)); }
  meus(slot){ return Object.keys(this.def.donos).filter(i => this.manda(i, slot)).map(Number); }
  /* a equipe assume (quem saiu da sala): na sessão, o carro sai sozinho no plano padrão */
  ordemDaSala(){ return null; }

  /* o relógio da sala: a sessão anda vel segundos de sessão por segundo de verdade */
  avancar(agora, vel){
    const mud = { novas: [], fase: false, soma: null };
    if(this.fase === 'fim') return mud;
    const S = this.S, Ss = this.J.Sessao;
    if(!this.relogio) this.relogio = agora;
    this.alvo += Math.max(0, agora - this.relogio) / 1000 * vel; this.relogio = agora;
    const antes = this.marca();
    let g = 0;
    while(S.t < this.alvo && !S.fim && g++ < MAX_PASSOS) this.em(this.A, () => Ss.passo(S, DT));
    this.passo = Math.round(S.t / DT); this.liberado = this.passo;
    if(S.fim){ this.fechar(); mud.fase = true; }
    else if(this.marca() !== antes) mud.fase = true;
    return mud;
  }
  /* o que muda a tela: estado, volta e tempos de cada carro */
  marca(){ return this.S.carros.map(c => c.estado + (c.fase || '') + c.saidas + (c.melhor || 0)).join('|') + this.S.log.length; }

  /* uma ordem de um jogador: { e } (nada a registrar aqui) ou { erro } */
  ordem(slot, tipo, dados, agora){
    const S = this.S, d = dados && typeof dados === 'object' && !Array.isArray(dados) ? dados : null;
    if(!d) return { erro: 'dados' };
    if(!this.def.slots.includes(String(slot))) return { erro: 'corrida' };
    if(this.fase === 'fim') return { erro: 'fim' };
    if(tipo === 'sair'){
      const c = Number.isInteger(d.i) ? S.carros[d.i] : null;
      if(!c || !c.ctrl || !this.manda(d.i, slot)) return { erro: 'carro' };
      if(c.estado !== 'box' || S.emFila) return { erro: 'fase' };
      if(S.t + S.T * 1.15 >= S.dur) return { erro: 'tarde' };
      this.J.Sessao.comecar(S, c);
      this.ver++;
      return { ok: true };
    }
    if(tipo === 'pular'){
      if(typeof d.quer !== 'boolean') return { erro: 'dados' };
      if(d.quer) this.votos[slot] = true; else delete this.votos[slot];
      if(this.def.slots.every(x => this.votos[x])) this.terminar(agora);
      return { ok: true };
    }
    return { erro: 'tipo' };
  }
  /* até o fim, na hora (o pular de todos, ou o anfitrião forçando) */
  terminar(){
    if(this.fase === 'fim') return null;
    this.em(this.A, () => this.J.Sessao.terminar(this.S));
    this.fechar();
    return null;
  }
  fechar(){
    if(this.res) { this.fase = 'fim'; return; }
    this.fase = 'fim';
    /* o valor de cada carro, como Sessao.fechar entrega para Classif.rodar */
    const valores = {}, notas = {};
    for(const c of this.S.carros){
      if(!c.ctrl) valores[c.id] = c.v;
      else if(c.vBest != null){ valores[c.id] = c.vBest; if(c.notas && c.notas.length) notas[c.id] = c.notas; }
      else valores[c.id] = -1e6;
    }
    this.res = { valores, notas };
  }
  resultado(){ return this.res; }

  /* para as telas: o que não muda na sessão (inicio) e o andamento (publico) */
  carroPublico(c){
    return { estado: c.estado, fase: c.fase, lapIni: c.lapIni, lapDur: c.lapDur, melhor: c.melhor, ult: c.ult, saidas: c.saidas };
  }
  inicio(agora){
    const S = this.S;
    return Object.assign(this.publico(agora), {
      sessao: true, donos: this.def.donos, slots: this.def.slots, serie: this.def.serie, chefe: true,
      ent: { tipo: S.tipo, ano: S.sea.ano, trk: { id: S.trk.id, gp: S.trk.gp, circ: S.trk.circ, type: S.trk.type }, T: S.T, wet: S.wet, dur: S.dur,
             ses: { k: S.ses.k, n: S.ses.n, modo: S.ses.modo, passam: S.ses.passam || 0, semJanela: !!S.ses.semJanela }, emFila: !!S.emFila,
             carros: S.carros.map(c => ({ id: c.id, nome: c.nome, cor: c.cor, carro: c.carro, humano: !!c.ctrl })) }
    });
  }
  publico(){
    const S = this.S;
    return { k: this.def.chave, sessao: true, fase: this.fase, t: S.t, fim: !!S.fim, passo: this.passo, liberado: this.liberado,
             votos: Object.keys(this.votos).map(Number), carros: S.carros.map(c => this.carroPublico(c)), log: S.log.slice(-8) };
  }
  /* depois de um reinício a sessão não volta (o sorteio dela só existe aqui): a passada seguinte a abre de novo */
  salvo(){ return { chave: this.def.chave, sessao: true, fase: this.fase, res: this.res }; }
}
