/* A corrida ao vivo no servidor (Fase 5), em passo travado.

   O motor da corrida do jogo (Gp) só lê a própria corrida: nada de Math.random, relógio ou
   carreira. A mesma entrada (Gp.entrada, só dados) com as mesmas ordens no mesmo passo dá a mesma
   corrida em qualquer lugar. Então o servidor roda a corrida oficial no relógio da sala, e cada
   tela roda a mesma corrida, recebendo as ordens com o passo em que valem.

   - Ordens (box, ritmo, pneu, ordem de equipe): o servidor confere o dono do carro e marca a
     ordem num passo que nenhuma tela alcançou ainda: as telas só andam até o passo liberado, e o
     liberado fica ANTECEDENCIA_S (tempo real) à frente da corrida oficial. Todas aplicam no
     mesmo passo e na mesma ordem (n).
   - Rádio: a corrida para no passo em que a pergunta aparece, aqui e nas telas. A resposta do
     dono do carro (ou a padrão, depois de PERGUNTA_MS) vale naquele passo.
   - Largada: espera a reação às luzes de cada jogador (ou LARGADA_MS). Cada um larga só os seus
     carros; quem não reagiu larga com a reação sorteada da corrida.
   - Pular para o fim: só com o voto de todos os humanos daquela corrida.
   - Recuperação: a entrada e o registro de ordens refazem a corrida até qualquer passo (uma tela
     que volta, ou o servidor que reiniciou).
   - Conferência: a soma do estado a cada SOMA_CADA passos; a tela compara com a dela.

   O resultado oficial é o do servidor (Gp.resultado). Depois, o fim da rodada roda de novo, com a
   mesma semente, usando essa chegada (ligarCorridas no modo 'concluir'). */

export const ANTECEDENCIA_S = 0.8;     // a ordem vale este tanto de tempo real depois de chegar
export const PERGUNTA_MS = 20000;      // o rádio espera a resposta do dono
export const LARGADA_MS = 45000;       // a largada espera a reação de todos
export const SOMA_CADA = 64;           // passos entre duas conferências (16 s de prova)
const MAX_PASSOS = 400000;

const clone = o => o === undefined ? undefined : structuredClone(o);

/* ── os ganchos do motor durante o processamento de uma rodada ──
   modo 'preparar': cada corrida com humano vira uma definição (a entrada e os donos dos carros)
   e segue com uma chegada rápida, descartada (o processamento roda numa cópia do mundo).
   modo 'concluir': cada corrida recebe a chegada da corrida ao vivo. */
export function ligarCorridas(J, modo, resultados){
  const ctl = { modo, defs: [], k: 0, contexto: null, resultados: resultados || {}, divergencias: [], faltas: [] };
  const vivoDe = (M, res, notas) => ({ finish: J.Gp.chegada(M, res), flId: res.flId, sc: res.sc, crono: J.Gp.cronoDe(res),
    notas: (notas && notas.ME) || [], ordem: res.ordemEquipe || null });
  const correr = (ent, donos, M, info) => {
    const chave = 'c' + ctl.k++;
    if(modo === 'preparar'){
      ctl.defs.push(Object.assign({ chave, ent: clone(ent), donos, slots: [...new Set(Object.values(donos))].sort() }, info));
      const R = J.Gp.criar(clone(ent)); J.Gp.terminar(R);
      return vivoDe(M, J.Gp.resultado(R), null);
    }
    const r = ctl.resultados[chave];
    /* sem a chegada ao vivo (a corrida falhou no servidor): o caminho rápido de sempre */
    if(!r || !r.res){ ctl.faltas.push(chave); return null; }
    if(r.ent !== undefined && JSON.stringify(r.ent) !== JSON.stringify(ent)) ctl.divergencias.push(chave);
    return vivoDe(M, r.res, r.notas);
  };
  /* modo piloto: o motor de carreira (Engine.runRace) */
  J.Engine.mpCorrida = (sea, M) => {
    const cx = ctl.contexto; if(!cx || cx.modo !== 'piloto') return null;
    const controla = f => cx.donos[f.id] !== undefined;
    if(!M.running.concat(M.out).some(x => controla(x.f))) return null;
    const ent = J.Gp.entrada(sea, M, J.S.series, sea.year, controla);
    ent.carros.forEach(c => { const x = cx.extras && cx.extras[c.id]; if(x) Object.assign(c, x); });
    const donos = {};
    ent.carros.forEach((c, i) => { if(c.ctrl) donos[i] = cx.donos[c.id]; });
    return correr(ent, donos, M, { serie: sea.isTop ? J.Engine.serie().short : sea.cat, chefe: false });
  };
  /* modo chefe: Chefe.correr, na perspectiva do anfitrião (a outra equipe humana é a 'EU2') */
  J.Chefe.mpCorrida = M => {
    const cx = ctl.contexto; if(!cx || cx.modo !== 'chefe') return null;
    const sea = M.sea, equipeDe = id => (sea.field.find(f => f.id === id) || {}).teamId;
    const controla = f => cx.donos[f.teamId] !== undefined;
    if(!M.running.concat(M.out).some(x => controla(x.f))) return null;
    const ent = J.Gp.entrada(sea, M, J.Chefe.sk(), sea.ano, controla, { gestao: true });
    ent.mpEquipes = true;
    const donos = {};
    ent.carros.forEach((c, i) => {
      if(!c.ctrl) return;
      donos[i] = cx.donos[equipeDe(c.id)];
      if(cx.modos && cx.modos[c.id]) c.modo = cx.modos[c.id];
      if(cx.pneus && cx.pneus[c.id]) c.pneuIni = cx.pneus[c.id];
    });
    return correr(ent, donos, M, { serie: (J.C && J.C.cat) || 'Corrida', chefe: true });
  };
  J.mpCorridas = ctl;
  return ctl;
}
export function desligarCorridas(J){
  delete J.Engine.mpCorrida; delete J.Chefe.mpCorrida; delete J.mpCorridas;
}

/* a soma do estado da corrida que as telas conferem (só o que a simulação usa, arredondado) */
export function somaDe(R){
  let h = 0x811c9dc5;
  const mexe = v => { const t = String(v); for(let i = 0; i < t.length; i++){ h ^= t.charCodeAt(i); h = Math.imul(h, 0x01000193); } h ^= 124; h = Math.imul(h, 0x01000193); };
  mexe(Math.round(R.t * 4)); mexe(Math.round(R.w * 1e4)); mexe(R.sc ? R.sc.tipo + (R.sc.fim ? 1 : 0) : '-');
  for(const s of R.carros){
    mexe(Math.round(s.s * 100)); mexe(Math.round(s.v * 100)); mexe(s.estado); mexe(s.voltas); mexe(s.paradas);
    mexe(s.pneu.c); mexe(Math.round(s.pneu.gasto * 1e5)); mexe(s.modo); mexe(Math.round((s.comb || 0) * 1e5));
  }
  return (h >>> 0).toString(36);
}

/* aplica uma entrada do registro na corrida (o mesmo código roda nas telas, em assets/multiplayer.js) */
export function aplicar(Gp, R, e){
  const d = e.dados || {};
  if(e.tipo === 'comandar') return Gp.comandar(R, d.i, d.cmd);
  if(e.tipo === 'responder') return Gp.responder(R, d.k);
  if(e.tipo === 'largar') return Gp.largar(R, d.reac, !!d.queimou, d.so);
  if(e.tipo === 'terminar') return Gp.terminar(R);
}

/* os comandos que um jogador pode dar a um carro dele (listas fechadas, como no muro do jogo) */
function cmdValido(Gp, R, s, cmd){
  if(!cmd || typeof cmd !== 'object' || Array.isArray(cmd)) return null;
  const ks = Object.keys(cmd); if(ks.length !== 1) return null;
  const k = ks[0], v = cmd[k];
  if(k === 'modo') return Gp.modosDe(R).indexOf(v) >= 0 ? { modo: v } : null;
  if(k === 'trato') return s.trato && Object.hasOwn(Gp.TRATO, v) ? { trato: v } : null;
  if(k === 'mistura') return s.mistura && R.regras.energia && Object.hasOwn(Gp.MISTURA, v) ? { mistura: v } : null;
  if(k === 'auto') return v === true && s.trato ? { auto: true } : null;
  if(k === 'parar') return v === null || (typeof v === 'string' && Object.hasOwn(Gp.COMP, v) && Gp.opcoesLargada(R).indexOf(v) >= 0) ? { parar: v } : null;
  if(k === 'ceder') return Number.isInteger(v) && R.carros[v] && R.carros[v].c.ctrl && R.carros[v].c.eq === s.c.eq && v !== s.i ? { ceder: v } : null;
  if(k === 'ordemEq') return R.ent.gestao && (v === 'livre' || v === 'manter') ? { ordemEq: v } : null;
  return null;
}

export class Corrida {
  /* def: { chave, ent, donos: { indiceDoCarro: slot }, slots, serie, chefe }; salvo: o estado de antes */
  constructor(J, def, salvo){
    this.J = J; this.def = def;
    const Gp = J.Gp;
    this.R = Gp.criar(clone(def.ent));
    const e = salvo || {};
    this.log = e.log || []; this.seq = e.seq || 0;
    this.fase = e.fase || 'largada'; this.prazo = e.prazo || 0;
    this.largadas = e.largadas || {}; this.votos = e.votos || {}; this.fora = e.fora || {};
    this.liberado = e.liberado || 0; this.res = e.res || null; this.notas = e.notas || null;
    this.passo = 0;
    this.fila = this.log.slice().sort((a, b) => a.passo - b.passo || a.n - b.n);
    /* refaz a corrida até o passo salvo, com as ordens de cada passo */
    const ate = e.passo || 0;
    while(this.passo < ate && !this.R.fim){
      this.aplicarDoPasso();
      if(this.R.fim || this.R.pergunta) break;
      Gp.passo(this.R); this.passo++;
    }
    if(this.fase === 'fim' && !this.res) this.fechar();
    this.alvo = this.passo; this.relogio = 0;
  }
  salvo(){
    return { chave: this.def.chave, log: this.log, seq: this.seq, passo: this.passo, liberado: this.liberado, fase: this.fase, prazo: this.prazo,
             largadas: this.largadas, votos: this.votos, fora: this.fora, res: this.res, notas: this.notas };
  }
  meus(slot){ return Object.keys(this.def.donos).filter(i => String(this.def.donos[i]) === String(slot)).map(Number); }
  dono(i){ return this.def.donos[i]; }

  registrar(tipo, slot, dados, passo){
    const e = { n: ++this.seq, passo, tipo, slot: slot == null ? null : Number(slot), dados };
    this.log.push(e); this.fila.push(e);
    return e;
  }
  /* as entradas marcadas para o passo em que a corrida está, na ordem em que chegaram */
  aplicarDoPasso(){
    const agora = this.fila.filter(e => e.passo <= this.passo).sort((a, b) => a.n - b.n);
    if(!agora.length) return;
    this.fila = this.fila.filter(e => e.passo > this.passo);
    for(const e of agora) aplicar(this.J.Gp, this.R, e);
  }
  /* o passo mais cedo em que uma ordem nova pode valer: nenhuma tela passou dele */
  proximoPasso(){ return Math.max(this.liberado, this.passo + 1); }

  /* uma ordem de um jogador: { e } (a entrada registrada) ou { erro } */
  ordem(slot, tipo, dados, agora){
    const R = this.R, Gp = this.J.Gp, d = dados && typeof dados === 'object' && !Array.isArray(dados) ? dados : null;
    if(!d) return { erro: 'dados' };
    if(!this.def.slots.map(String).includes(String(slot))) return { erro: 'corrida' };
    if(this.fase === 'fim') return { erro: 'fim' };
    if(tipo === 'largada'){
      if(this.fase !== 'largada') return { erro: 'fase' };
      if(this.largadas[slot]) return { erro: 'repetida' };
      const auto = d.auto === true, queimou = d.queimou === true;
      if(!auto && !queimou && !(typeof d.reac === 'number' && d.reac >= 0 && d.reac <= 3)) return { erro: 'dados' };
      this.largadas[slot] = auto ? { auto: true } : { reac: queimou ? 0 : d.reac, queimou };
      return { ok: true };
    }
    if(tipo === 'comandar'){
      const i = d.i, s = Number.isInteger(i) ? R.carros[i] : null;
      if(!s || String(this.dono(i)) !== String(slot)) return { erro: 'carro' };
      const cmd = cmdValido(Gp, R, s, d.cmd);
      if(!cmd) return { erro: 'dados' };
      return { e: this.registrar('comandar', slot, { i, cmd }, this.proximoPasso()) };
    }
    if(tipo === 'responder'){
      const q = R.pergunta;
      if(this.fase !== 'pergunta' || !q) return { erro: 'fase' };
      if(String(this.dono(q.i)) !== String(slot)) return { erro: 'carro' };
      if(typeof d.k !== 'string' || !q.opcoes.some(o => o.k === d.k)) return { erro: 'dados' };
      const e = this.registrar('responder', slot, { k: d.k }, this.passo);
      this.retomar(agora);
      return { e };
    }
    if(tipo === 'pular'){
      if(typeof d.quer !== 'boolean') return { erro: 'dados' };
      if(d.quer) this.votos[slot] = true; else delete this.votos[slot];
      if(this.def.slots.every(x => this.votos[x])) return { e: this.terminar(agora) };
      return { ok: true };
    }
    return { erro: 'tipo' };
  }
  /* uma ordem da própria sala (sem dono): a equipe assume as paradas de quem saiu, e devolve na volta */
  ordemDaSala(i, cmd){
    if(this.fase === 'fim' || !this.R.carros[i]) return null;
    return this.registrar('comandar', null, { i, cmd }, this.proximoPasso());
  }
  terminar(agora){
    const pausa = this.fase === 'pergunta' || this.fase === 'largada';
    const e = this.registrar('terminar', null, {}, pausa ? this.passo : this.proximoPasso());
    if(pausa) this.retomar(agora);
    return e;
  }
  /* a largada: cada jogador larga só os carros dele, na ordem dos slots (a mesma em todo lugar) */
  darLargada(agora){
    const R = this.R, novas = [];
    for(const slot of this.def.slots){
      const l = this.largadas[slot], so = this.meus(slot);
      if(l && !l.auto && so.length) novas.push(this.registrar('largar', slot, { reac: l.reac, queimou: !!l.queimou, so }, 0));
    }
    this.retomar(agora);
    return novas;
  }
  retomar(agora){
    this.aplicarDoPasso();
    this.fase = this.R.fim ? 'fim' : 'correndo';
    this.alvo = this.passo; this.relogio = agora;
    if(this.R.fim) this.fechar();
  }
  liberar(vel){
    const D = Math.ceil(ANTECEDENCIA_S * vel / this.J.Gp.DT);
    if(this.fase === 'correndo') this.liberado = Math.max(this.liberado, this.passo + D);
  }
  /* o relógio da sala anda: devolve o que mudou ({ novas, fase, soma }) */
  avancar(agora, vel){
    const R = this.R, Gp = this.J.Gp, mud = { novas: [], fase: false, soma: null };
    if(this.fase === 'largada'){
      if(!this.def.slots.every(s => this.largadas[s]) && agora < this.prazo) return mud;
      mud.novas = this.darLargada(agora); mud.fase = true;
    }
    if(this.fase === 'pergunta'){
      if(agora < this.prazo) return mud;
      mud.novas.push(this.registrar('responder', null, { k: R.pergunta.padrao }, this.passo));
      this.retomar(agora); mud.fase = true;
    }
    if(this.fase === 'correndo'){
      this.alvo += Math.max(0, agora - this.relogio) / 1000 * vel / Gp.DT; this.relogio = agora;
      let guarda = 0;
      while(this.passo < this.alvo && !R.fim && guarda++ < MAX_PASSOS){
        this.aplicarDoPasso();
        if(R.fim || R.pergunta) break;
        Gp.passo(R); this.passo++;
        if(this.passo % SOMA_CADA === 0) mud.soma = { passo: this.passo, soma: somaDe(R) };
        if(R.pergunta) break;
      }
      if(R.fim){ this.fechar(); mud.fase = true; }
      else if(R.pergunta){ this.fase = 'pergunta'; this.prazo = agora + PERGUNTA_MS; this.alvo = this.passo; mud.fase = true; }
      else this.liberar(vel);
    }
    return mud;
  }
  fechar(){
    const R = this.R, Gp = this.J.Gp;
    this.fase = 'fim';
    if(this.res) return;
    this.res = Gp.resultado(R);
    this.notas = {};
    Object.keys(this.def.donos).forEach(i => { const c = R.carros[i] && R.carros[i].c; if(c) this.notas[c.id] = Gp.notasDe(R, c.id); });
  }
  /* o que todos podem ver do andamento */
  publico(agora){
    const R = this.R, q = this.fase === 'pergunta' && R.pergunta;
    return { k: this.def.chave, fase: this.fase, passo: this.passo, liberado: this.liberado,
             volta: R.lider ? Math.min(R.N, R.lider.voltas + 1) : 0, N: R.N,
             prazo: this.fase === 'largada' || this.fase === 'pergunta' ? Math.max(0, this.prazo - agora) : null,
             largadas: Object.keys(this.largadas).map(Number), votos: Object.keys(this.votos).map(Number),
             pergunta: q ? { dono: this.dono(q.i) } : null };
  }
  /* tudo para uma tela montar a corrida e alcançar o passo liberado */
  inicio(agora){
    return Object.assign({ ent: this.def.ent, donos: this.def.donos, slots: this.def.slots, serie: this.def.serie, chefe: this.def.chefe,
                           log: this.log }, this.publico(agora));
  }
}
