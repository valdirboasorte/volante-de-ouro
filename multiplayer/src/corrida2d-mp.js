/* A corrida 2D ao vivo no servidor (Fase 7): vários jogadores pilotando na mesma pista.

   Não é passo travado como a corrida clássica (corrida-mp.js): a física da 2D roda a 120 passos por
   segundo, com toques, e cada jogador precisa sentir o carro na hora. Então:
   - a sala roda a sessão oficial (C2D, do motor gerado): a IA, o safety car, as bandeiras, as
     punições, a ordem e o resultado. Os carros humanos aqui são fantoches (c.remoto) que andam com o
     estado que o dono manda (rede2d.js);
   - cada tela simula o próprio carro e manda o estado ~30 vezes por segundo (c2dEu). A sala repassa
     esse estado na hora aos outros (c2dH) e manda a todos, a cada tique de 50 ms, o quadro de todos
     os carros e o controle da prova (c2dQ);
   - sem notícia do dono por 1 s (caiu, aba escondida), a sala assume o carro com a IA; a tela, quando
     volta, pega o carro do ponto em que a sala deixou e avisa (ad), e a sala devolve;
   - o toque entre dois humanos, cada tela resolve para o próprio carro; a sala julga (punição) o que
     as telas contam (tq), com os dois fantoches que ela tem.
   O resultado (C2D.Corrida.resultado, no formato de Gp.resultado) entra na rodada como a chegada ao
   vivo da corrida clássica: o fim da rodada roda com ela (ligarCorridas no modo 'concluir'). */

export const CARREGAR_MS = 60000;   // a largada espera as telas montarem a pista
export const CONTAGEM_MS = 3000;    // todos prontos: 3 s até as luzes acenderem
const MAX_PASSOS = 72;               // 0,6 s de prova por tique, no máximo (o resto o tempo de prova espera)
const META_CHEIA_MS = 2000;
const ESTADOS = ['pista', 'chegou', 'fora'];
const FASES_BOX = ['entrando', 'fila', 'parado', 'saindo'];
const TIPOS_FORA = ['ACID', 'MEC', 'DSQ'];
const EVENTOS_RES = ['abandono', 'sc', 'vsc', 'punicao', 'bandeirada', 'quebra'];

/* a meta que a tela manda do carro dela: só chaves conhecidas, com o tipo certo */
function metaLimpa(m, N){
  if(!m || typeof m !== 'object' || Array.isArray(m)) return null;
  const out = {}, num = v => typeof v === 'number' && Number.isFinite(v), int = (v, a, b) => Number.isInteger(v) && v >= a && v <= b;
  const txt = (v, re, n) => typeof v === 'string' && v.length <= n && re.test(v);
  if('e' in m && int(m.e, 0, 2)) out.e = m.e;
  if('ft' in m && (m.ft === 0 || TIPOS_FORA.includes(m.ft))) out.ft = m.ft;
  if('fv' in m && int(m.fv, 0, 999)) out.fv = m.fv;
  if('l' in m && int(m.l, 0, N + 2)) out.l = m.l;
  if('i' in m && (m.i === null || num(m.i))) out.i = m.i;
  if('mb' in m && (m.mb === null || (num(m.mb) && m.mb > 0))) out.mb = m.mb;
  if('u' in m && (m.u === 0 || (Array.isArray(m.u) && m.u.length === 2 && num(m.u[0]) && (m.u[1] === 0 || m.u[1] === 1)))) out.u = m.u;
  if('f' in m && (m.f === null || num(m.f))) out.f = m.f;
  if('a' in m && int(m.a, 0, 999)) out.a = m.a;
  if('pc' in m && (m.pc === 0 || txt(m.pc, /^[A-Za-z0-9]{1,4}$/, 4))) out.pc = m.pc;
  if('pg' in m && int(m.pg, 0, 400)) out.pg = m.pg;
  if('cb' in m && int(m.cb, 0, 100)) out.cb = m.cb;
  if('bx' in m && (m.bx === 0 || FASES_BOX.includes(m.bx))) out.bx = m.bx;
  if('ms' in m && txt(m.ms, /^[A-Za-z,]*$/, 120)) out.ms = m.ms;
  if('pr' in m && int(m.pr, 0, 99)) out.pr = m.pr;
  if('pn' in m && txt(m.pn, /^[A-Za-z0-9,]*$/, 120)) out.pn = m.pn;
  if('ds' in m && (m.ds === 0 || m.ds === 1)) out.ds = m.ds;
  if('hv' in m && txt(m.hv, /^[0-9.,]*$/, 120)) out.hv = m.hv;
  return out;
}

export class Corrida2D {
  /* def: { chave, ent, donos, slots, serie, chefe: false, c2d: a definição de rede2d.js }; salvo: o de antes */
  constructor(J, def, salvo){
    this.J = J; this.def = def; this.modo2d = true;
    const C2D = this.C2D = J.amb.C2D, Rede = this.Rede = C2D.Rede;
    const e = salvo || {};
    this.fase = e.fase || 'carregando'; this.prazo = e.prazo || 0;
    this.prontos = e.prontos || {}; this.votos = e.votos || {};
    this.res = e.res || null; this.notas = e.notas || null;
    this.assumirNaLargada = new Set(e.assumirNaLargada || []);
    this.passo = 0; this.liberado = 0; this.largadas = {}; this.fora = {};
    const S = this.S = Rede.criarSessao(def.c2d, { servidor: true });
    this.humanos = S.carros.filter(c => c.humano);
    S.rede.antes = (S, dt) => { for(const c of this.humanos) if(c.remoto) Rede.posicionar(S, c, S.t + dt); };
    this.ult = {}; this.eco = {}; this.toques = {};
    this.metaEnv = {}; this.ultMetaCheia = 0;
    this.t0 = null;
    if(e.foto) this.restaurar(e.foto);
    if(this.fase === 'correndo') this.t0 = Date.now() - Math.max(0, S.t) * 1000;
    /* depois de um reinício, cada dono tem o prazo normal para voltar a mandar o estado do carro */
    if(e.foto) for(const c of this.humanos) this.ult[c.idx] = Date.now();
    this.evIdx = S.eventos.length; this.punIdx = S.pun ? S.pun.lista.length : 0;
    if(this.fase === 'fim' && !this.res) this.fechar();
  }

  /* ── o que a sala usa (a mesma cara da Corrida clássica) ── */
  donosDe(i){ const d = this.def.donos[i]; return d === undefined ? [] : [].concat(d).map(String); }
  manda(i, slot){ return this.donosDe(i).includes(String(slot)); }
  meus(slot){ return Object.keys(this.def.donos).filter(i => this.manda(i, slot)).map(Number); }
  dono(i){ return this.def.donos[i]; }
  carroDe(slot){ return this.humanos.find(c => c.dono === String(slot)) || null; }
  /* o tempo de prova no relógio de parede (antes da largada, 0) */
  tempo(agora){ return this.t0 == null ? 0 : (agora - this.t0) / 1000; }

  salvo(){
    return { chave: this.def.chave, modo: '2d', fase: this.fase, prazo: this.prazo, prontos: this.prontos, votos: this.votos,
             res: this.res, notas: this.notas, assumirNaLargada: [...this.assumirNaLargada], foto: this.fase === 'fim' ? null : this.foto() };
  }
  /* uma ordem da sala (quem simula o ano não pilota): o carro dele é da IA desde a largada */
  ordemDaSala(i, cmd){
    if(cmd && cmd.equipe === true){ const c = this.S.carros.find(x => x.humano && this.manda(i, x.dono)); if(c) this.assumirNaLargada.add(c.dono); }
    return null;
  }

  /* uma ordem de um jogador: { ok } ou { erro } */
  ordem(slot, tipo, dados, agora){
    const d = dados && typeof dados === 'object' && !Array.isArray(dados) ? dados : null;
    if(!d) return { erro: 'dados' };
    if(!this.def.slots.map(String).includes(String(slot))) return { erro: 'corrida' };
    if(this.fase === 'fim') return { erro: 'fim' };
    const c = this.carroDe(slot);
    if(tipo === 'pronto2d'){ this.prontos[slot] = true; return { ok: true }; }
    if(tipo === 'pular'){
      if(typeof d.quer !== 'boolean') return { erro: 'dados' };
      if(d.quer) this.votos[slot] = true; else delete this.votos[slot];
      if(this.def.slots.every(x => this.votos[x])) this.terminar(agora);
      return { ok: true };
    }
    if(tipo === 'abandonar'){
      if(!c) return { erro: 'carro' };
      if(c.estado === 'pista') this.C2D.Corrida.abandonar(this.S, c, 'MEC');
      return { ok: true };
    }
    return { erro: 'tipo' };
  }

  /* o estado do carro de um jogador (c2dEu): devolve o repasse para os outros (c2dH) ou null */
  eu(slot, msg, agora){
    if(this.fase === 'fim') return null;
    const c = this.carroDe(slot); if(!c) return null;
    const e = msg.e, S = this.S;
    if(!Array.isArray(e) || e.length !== this.Rede.N_DIN || !e.every(v => Number.isInteger(v) && Math.abs(v) < 2e9)) return null;
    if(typeof msg.ts !== 'number' || !Number.isFinite(msg.ts)) return null;
    if(typeof msg.tl === 'number' && Number.isFinite(msg.tl)) this.eco[slot] = [msg.tl, Math.round(this.tempo(agora) * 1000) / 1000];
    this.ult[c.idx] = agora;
    if(c.assumido){
      /* a sala está com o carro: só devolve quando a tela confirma que pegou dali (ad) */
      if(msg.ad !== 1) return null;
      this.devolver(c);
    }
    if(this.fase !== 'correndo') return null;
    const ts = Math.min(msg.ts, this.tempo(agora) + .25);
    if(!this.Rede.novaBase(S, c, ts, e)) return null;
    c.rd.ultE = e; c.rd.ultT = ts;
    const m = metaLimpa(msg.m, S.N);
    if(m){
      /* chegada antes da bandeirada não existe */
      if(m.e === 1 && !S.bandeira && (m.l == null ? c.voltas : m.l) < S.N) delete m.e;
      this.Rede.aplicarMeta(S, c, m, 'humano');
    }
    if(Array.isArray(msg.tq)) for(const x of msg.tq.slice(0, 4)) if(Array.isArray(x)) this.toqueHumano(c, x[0], x[1]);
    return { t: 'c2dH', k: this.def.chave, i: c.idx, ts, e };
  }
  /* um toque entre dois humanos que uma tela contou: a sala julga com os fantoches dela */
  toqueHumano(c, i, v){
    const S = this.S, o = S.carros[i];
    if(!o || !o.humano || o === c || !(typeof v === 'number' && v > 3.5 && v < 120)) return;
    const k = c.idx < o.idx ? c.idx + '|' + o.idx : o.idx + '|' + c.idx;
    if(this.toques[k] > S.t - 1.5) return;
    this.toques[k] = S.t;
    S.eventos.push({ t: S.t, tipo: 'toque', a: c.id, b: o.id, v: +v.toFixed(1) });
    if(S.pun && this.C2D.Punicoes){ this.C2D.Punicoes.antesDosToques(S); this.C2D.Punicoes.toque(S, { a: c.id, b: o.id, v }); }
  }
  /* sem o dono, a IA pilota (do ponto em que o carro está) */
  assumir(c){
    const C2D = this.C2D, nv = C2D.NIVEIS[this.def.c2d.nivelIA] || C2D.NIVEIS.medio;
    c.remoto = false; c.assumido = true; this.assumiuAlguem = true;
    c.ia = C2D.IA.criar({ ritmo: nv.ritmo, erros: nv.erros * .5, ruido: nv.ruido, erroFreio: nv.erroFreio, agr: .5, cuidado: .6, semente: C2D.semente('assumir:' + c.id + ':' + Math.floor(this.S.t)) });
    c.boxAuto = true;
  }
  devolver(c){
    /* punição que ficou pendente enquanto a IA pilotava vira tempo: a tela do dono não cumpre no box */
    if(c.punPend && c.punPend.length && this.C2D.Punicoes){ this.C2D.Punicoes.converter(this.S, c); c.punPend.length = 0; }
    c.remoto = true; c.assumido = false; delete c.ia; c.boxAuto = false;
    c.rd.base = null;
  }
  conferirDonos(agora){
    const S = this.S;
    for(const c of this.humanos){
      if(!c.remoto || c.estado !== 'pista') continue;
      const ult = this.ult[c.idx] != null ? this.ult[c.idx] : this.t0;
      if(this.assumirNaLargada.has(c.dono) || agora - ult > this.Rede.ASSUMIR_S * 1000) this.assumir(c);
    }
    void S;
  }

  /* o relógio da sala anda: devolve { novas, fase, soma } como a Corrida clássica */
  avancar(agora){
    const mud = { novas: [], fase: false, soma: null }, S = this.S, C2D = this.C2D;
    if(this.fase === 'carregando'){
      if(!this.def.slots.every(s => this.prontos[s] || this.assumirNaLargada.has(String(s))) && agora < this.prazo) return mud;
      this.fase = 'correndo'; this.t0 = agora + CONTAGEM_MS; mud.fase = true;
      return mud;
    }
    if(this.fase !== 'correndo') return mud;
    const alvo = this.tempo(agora);
    if(alvo <= S.t) return mud;
    this.conferirDonos(agora);
    let n = 0;
    while(S.t + C2D.DT <= alvo + 1e-9 && n < MAX_PASSOS && !S.acabou){ C2D.Sessao.passo(S, null, C2D.DT); n++; }
    /* a sala ficou para trás (CPU): o tempo de prova espera em vez de pular */
    if(n >= MAX_PASSOS && alvo - S.t > .3) this.t0 += (alvo - S.t) * 1000;
    this.passo += n;
    if(S.acabou){ this.fechar(); mud.fase = true; }
    return mud;
  }
  /* pular para o fim (o voto de todos, ou o anfitrião): o resto da corrida projetado, na hora */
  terminar(){
    if(this.fase === 'fim') return null;
    const S = this.S;
    try { this.C2D.Corrida.projetar(S); }
    catch(e){ let g = 0; while(!S.acabou && g++ < 120 * 60 * 30) this.C2D.Sessao.passo(S, null, this.C2D.DT); }
    S.acabou = true;
    this.fechar();
    return null;
  }
  fechar(){
    this.fase = 'fim';
    if(this.res) return;
    const S = this.S, C2D = this.C2D;
    const res = C2D.Corrida.resultado(S);
    /* só o que a rodada usa (o storage tem limite por valor) */
    res.eventos = (res.eventos || []).filter(e => EVENTOS_RES.includes(e.tipo)).slice(-60);
    this.res = JSON.parse(JSON.stringify(res));
    this.notas = {};
    for(const c of this.humanos) this.notas[c.id] = C2D.Corrida.notasDe(S, c.id);
  }

  /* ── o que vai para as telas ── */
  metaDe(c){ const m = this.Rede.meta(this.S, c); if(c.humano) m.as = c.assumido ? 1 : 0; return m; }
  /* o quadro de todos (c2dQ); cheio: todas as metas inteiras (a tela que abre agora) */
  quadro(agora, cheio){
    const S = this.S, Rede = this.Rede, tq = Math.round(this.tempo(agora) * 1000) / 1000;
    const out = { t: 'c2dQ', k: this.def.chave, t2: Math.round(S.t * 1000) / 1000, tq, ini: this.fase === 'correndo' || this.fase === 'fim' ? 1 : 0, fase: this.fase };
    const e = [];
    for(const c of S.carros){
      if(c.humano && c.remoto){ if(c.rd.ultE) e.push([c.idx, Math.round((S.t - c.rd.ultT) * 1000)].concat(c.rd.ultE)); continue; }
      if(c.recolhido && !cheio && this.metaEnv[c.idx] && this.metaEnv[c.idx].rc) continue;
      e.push([c.idx, 0].concat(Rede.dinamica(S, c)));
    }
    out.e = e;
    const todas = cheio || agora - this.ultMetaCheia > META_CHEIA_MS;
    if(todas && !cheio) this.ultMetaCheia = agora;
    const m = {};
    let algum = false;
    for(const c of S.carros){
      const nova = this.metaDe(c), dif = todas ? nova : Rede.diferenca(nova, this.metaEnv[c.idx]);
      if(!cheio) this.metaEnv[c.idx] = nova;
      if(dif){ m[c.idx] = dif; algum = true; }
    }
    if(algum) out.m = m;
    out.g = Rede.global(S);
    if(!cheio){
      const ev = [];
      for(; this.evIdx < S.eventos.length; this.evIdx++){ const x = S.eventos[this.evIdx]; if(Rede.EVENTOS.includes(x.tipo)) ev.push(x); }
      if(ev.length) out.ev = ev.slice(-20);
      if(S.pun && S.pun.lista.length > this.punIdx){ out.pun = S.pun.lista.slice(this.punIdx); this.punIdx = S.pun.lista.length; }
    } else if(S.pun && S.pun.lista.length) out.pun = S.pun.lista.slice();
    if(Object.keys(this.eco).length) out.eco = this.eco;
    return out;
  }
  /* o que todos podem ver do andamento (corridaEstado) */
  publico(agora){
    const S = this.S, lid = S.lider;
    return { k: this.def.chave, modo: '2d', fase: this.fase, passo: 0, liberado: 0,
             volta: lid ? Math.min(S.N, lid.voltas + 1) : 0, N: S.N,
             prazo: this.fase === 'carregando' ? Math.max(0, this.prazo - agora) : this.fase === 'correndo' && this.t0 > agora ? this.t0 - agora : null,
             largadas: Object.keys(this.prontos).map(Number), votos: Object.keys(this.votos).map(Number), pergunta: null };
  }
  /* tudo para uma tela montar a corrida (corridaInicio) */
  inicio(agora){
    return Object.assign({ ent: this.def.ent, donos: this.def.donos, slots: this.def.slots, serie: this.def.serie, chefe: false, log: [],
                           c2d: this.def.c2d, quadro: this.quadro(agora, true) }, this.publico(agora));
  }

  /* ── guardar e voltar (o servidor reiniciou no meio): aproximado, as posições de 2 s atrás ── */
  foto(){
    const S = this.S, Rede = this.Rede;
    return { t: S.t, g: Rede.global(S), tLuzes: S.tLuzes || 0,
             carros: S.carros.map(c => [Rede.dinamica(S, c), Rede.meta(S, c), c.assumido ? 1 : 0]),
             pun: S.pun ? S.pun.lista.slice() : [] };
  }
  restaurar(f){
    const S = this.S, Rede = this.Rede;
    S.t = f.t || 0; S.tLuzes = f.tLuzes || 0;
    const g = f.g || {};
    S.estado = g.es || S.estado; S.verdeEm = g.ve != null ? g.ve : S.verdeEm; S.luzes = g.lz || 0;
    S.bandeira = g.bd || null; S.tFim = g.tf != null ? g.tf : null; S.acabou = !!g.ac;
    S.sc = g.sc || null; S.vsc = g.vsc || null; S.houveSC = !!g.hs; S.choveu = !!g.ch;
    if(g.fl) S.fl = { id: g.fl[0], t: g.fl[1], volta: g.fl[2] };
    if(typeof g.w === 'number') S.amb.w = g.w;
    if(S.pun && Array.isArray(f.pun)) S.pun.lista = f.pun.slice();
    (f.carros || []).forEach(([e, m, as], k) => {
      const c = S.carros[k]; if(!c) return;
      c.rd.base = null; Rede.novaBase(S, c, S.t, e); Rede.posicionar(S, c, S.t);
      Rede.aplicarMeta(S, c, m, 'fantoche');
      c.voltaFeita = c.voltas;
      if(c.humano){ c.rd.ultE = e; c.rd.ultT = S.t; if(as) this.assumir(c); }
      else c.rd.base = null;
    });
  }
}
