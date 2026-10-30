/* As regras do modo chefe com duas equipes humanas (Fase 3). Mesma interface das regras de
   teste (nome, iniciar, acoes, processar, vista) mais podeFicarPronto. O motor do jogo chega
   por uma função (obterMotor) porque a sala só o cria quando precisa: nunca no topo do módulo.

   Cada ação roda na perspectiva do jogador (agir) e espelha o que o UIC do index.html faz no
   motor, sem a parte de tela. Uma ação inválida devolve { erro, detalhe? } e a sala descarta
   a cópia do mundo (nada é gravado). Todo sorteio sai de uma semente da sala: o mesmo código e
   o mesmo id de ação dão o mesmo resultado; a rodada processada de novo dá o mesmo mundo.

   Fora do multiplayer por enquanto: demissão e fim de carreira (o balanço resolve só dívida,
   teto de gastos e falência; fechar a equipe é recusado). */
import { criarRnd } from './aleatorio.js';
import { criarMundo, perspectiva, agir, faseDupla, corrida, comSemente } from './chefe-mp.js';

const erro = (codigo, detalhe) => detalhe === undefined ? { erro: codigo } : { erro: codigo, detalhe };
const ehObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const inteiro = (v, a, b) => Number.isInteger(v) && v >= a && v <= b;
const texto = v => typeof v === 'string' && v.length > 0 && v.length <= 80;
const idOk = v => texto(v) || (typeof v === 'number' && Number.isFinite(v));
/* o carro 0 ou 1 (aceita "0" e "1", como o jogo guarda); senão null */
const carroDe = v => (v === 0 || v === 1) ? v : (v === '0' || v === '1') ? Number(v) : null;
const emCurso = C => !!C.temporada && C.temporada.round < C.temporada.calendar.length;

export function criarRegrasChefe(obterMotor){
  /* define uma ação: fases em que vale, forma dos dados (rápida, sem o motor) e o corpo, que
     roda na perspectiva do jogador com o sorteio preso à semente desta ação */
  const acao = (fases, forma, corpo) => ({
    validar: dados => ehObj(dados) && forma(dados) ? null : 'dados',
    aplicar(mundo, slot, dados, ctx){
      const J = obterMotor();
      return comSemente(J, criarRnd(ctx.codigo, 'acao:' + ctx.id), () => agir(J, mundo, slot, (J, C) => {
        if(!fases.includes(C.fase)) return erro('fase');
        return corpo(J, C, dados);
      }));
    }
  });
  const INV = ['inverno'], TEMP = ['temporada'], BAL = ['balanco'];

  /* as vagas de piloto, como a tela de proposta calcula */
  const vagas = (J, C, p, papel) => {
    const Ch = J.Chefe;
    const vagaTit = Ch.titulares().filter(x => !x.venceu && x !== p).length < 2 && Ch.superlicenca(p).ok;
    const teste = Ch.pilotoDe('teste');
    if(papel === 'titular' && !vagaTit) return erro('vaga', 'sem vaga de titular (ou sem superlicença)');
    if(papel === 'teste' && teste && teste !== p) return erro('vaga', 'já há um piloto de testes');
    return null;
  };
  const pilotoProprio = (C, id) => idOk(id) ? C.pilotos.find(x => x.id === id) : null;

  const acoes = {
    /* ── inverno ── */
    negociar: acao(INV, d => ehObj(d.piloto) && ehObj(d.oferta)
      && ((texto(d.piloto.mercado) && d.piloto.id === undefined) || (idOk(d.piloto.id) && d.piloto.mercado === undefined))
      && [.85, 1, 1.3].includes(d.oferta.sal) && inteiro(d.oferta.anos, 1, 3) && typeof d.oferta.n1 === 'boolean'
      && ['titular', 'teste'].includes(d.oferta.papel), (J, C, d) => {
      const Ch = J.Chefe, inv = C.inv, of = d.oferta;
      if(!inv) return erro('fase');
      const renova = d.piloto.id !== undefined;
      const p = renova ? C.pilotos.find(x => x.id === d.piloto.id && (x.papel === 'titular' || x.papel === 'teste'))
        : inv.mercado.find(x => x.nome === d.piloto.mercado);
      if(!p) return erro('piloto');
      if(of.anos === 3 && !Ch.ehF1()) return erro('dados');
      if(of.n1 && !(Ch.ehF1() && of.papel === 'titular')) return erro('dados');
      const sem = vagas(J, C, p, of.papel); if(sem) return sem;
      if(!renova && inv.tent.pil >= J.UIC.TENT_PIL) return erro('tentativas');
      const oferta = { sal: of.sal, anos: of.anos, n1: of.n1, papel: of.papel };
      const r = Ch.negociar(p, oferta);
      C.mpContra = r.contra ? { nome: p.nome, id: renova ? p.id : null, oferta, contra: r.contra } : null;
      return { ok: !!r.ok, t: r.t, contra: r.contra || null, ate: r.ok ? p.ate : null, nome: p.nome };
    }),
    aceitarContra: acao(INV, () => true, (J, C) => {
      const m = C.mpContra; if(!m) return erro('contra');
      const p = m.id !== null ? C.pilotos.find(x => x.id === m.id) : C.inv.mercado.find(x => x.nome === m.nome);
      if(!p) return erro('piloto');
      const sem = vagas(J, C, p, m.oferta.papel); if(sem) return sem;
      J.Chefe.assinar(p, Object.assign({}, m.oferta, { salFixo: m.contra }), 1);
      C.mpContra = null;
      return { ok: true, nome: p.nome, ate: p.ate };
    }),
    recusarContra: acao(INV, () => true, (J, C) => { C.mpContra = null; return { ok: true }; }),
    n1: acao(INV, d => d.id === null || idOk(d.id), (J, C, d) => {
      if(d.id === null){ C.n1 = null; return { ok: true }; }
      const p = pilotoProprio(C, d.id);
      if(!p || p.papel !== 'titular') return erro('piloto');
      C.n1 = p.id;
      return { ok: true };
    }),
    promover: acao(INV, d => idOk(d.id), (J, C, d) => {
      const Ch = J.Chefe, p = pilotoProprio(C, d.id);
      if(!p || p.papel !== 'teste') return erro('piloto');
      if(!Ch.superlicenca(p).ok) return erro('superlicenca');
      if(Ch.titulares().filter(x => !x.venceu).length >= 2) return erro('vaga');
      const usados = Ch.titulares().filter(x => !x.venceu).map(x => x.carro);
      const velho = Ch.titulares().find(x => x.venceu);
      if(velho) velho.carro = 9;
      p.papel = 'titular'; p.carro = usados.indexOf(0) < 0 ? 0 : 1;
      return { ok: true };
    }),
    rebaixar: acao(INV, d => idOk(d.id), (J, C, d) => {
      const p = pilotoProprio(C, d.id);
      if(!p || p.papel !== 'titular') return erro('piloto');
      if(J.Chefe.pilotoDe('teste')) return erro('vaga', 'já há um piloto de testes');
      p.papel = 'teste'; if(C.n1 === p.id) C.n1 = null;
      J.Chefe.mexerMoral(p, -12, 'rebaixado a reserva');
      return { ok: true };
    }),
    dispensar: acao(INV, d => idOk(d.id), (J, C, d) => {
      const p = pilotoProprio(C, d.id); if(!p) return erro('piloto');
      J.Chefe.dispensar(p);
      return { ok: true };
    }),
    motor: acao(INV, d => texto(d.nome) && inteiro(d.anos, 1, 3), (J, C, d) => {
      const Ch = J.Chefe;
      if(!Ch.ehF1()) return erro('motor');
      const atual = Object.assign({}, C.motor);
      const r = Ch.escolherMotor(d.nome, d.anos);
      /* trocar de fornecedor antes do fim do contrato custa metade do que faltava (só se a troca saiu) */
      if(r.ok && !atual.proprio && atual.nome && atual.nome !== d.nome && atual.ate >= C.ano){
        const m = Ch.motorInfo(atual.nome);
        if(m) Ch.lancar('motor', -Ch.custoMotor(m) * (atual.ate - C.ano + 1) * .5);
      }
      return { ok: !!r.ok, t: r.t };
    }),
    plano: acao(INV, d => texto(d.area) && Number.isInteger(d.nivel), (J, C, d) => {
      const Ch = J.Chefe;
      if(!Ch.areasAtivas().includes(d.area) || !inteiro(d.nivel, 0, Ch.DEV_CUSTO.length - 1)) return erro('dados');
      C.plano[d.area] = d.nivel;
      return { ok: true };
    }),
    staff: acao(INV, d => texto(d.nome) && [1, 1.25, 1.5].includes(d.m), (J, C, d) => {
      const s = C.inv.staffMerc.find(x => x.nome === d.nome); if(!s) return erro('staff');
      if(C.inv.tent.staff >= J.UIC.TENT_STAFF) return erro('tentativas');
      const r = J.Chefe.contratarStaff(s, d.m);
      return { ok: !!r.ok };
    }),
    renovarStaff: acao(INV, d => texto(d.k), (J, C, d) => {
      const s = J.Chefe.funcoesAtivas().includes(d.k) ? C.staff[d.k] : null;
      if(!s || !s.venceu || s.aposentou) return erro('staff');
      J.Chefe.renovarStaff(d.k);
      return { ok: true };
    }),
    construir: acao(INV, d => texto(d.k), (J, C, d) => {
      const Ch = J.Chefe, info = Object.hasOwn(Ch.INSTAL, d.k) ? Ch.INSTAL[d.k] : null;
      if(!info || !(Ch.ehF1() || d.k === 'fabrica') || C.ano < info.de) return erro('instalacao');
      const prox = (C.obras[d.k] ? C.obras[d.k].nivel : (C.instal[d.k] || 0)) + 1;
      if(prox > 5) return erro('instalacao');
      if(C.caixa < Ch.custoInstal(d.k, prox)) return erro('caixa');
      const r = Ch.construir(d.k); if(!r) return erro('instalacao');
      return { ok: true, nv: r.nv };
    }),
    modernizar: acao(INV, d => texto(d.k), (J, C, d) => {
      const Ch = J.Chefe;
      if(!Object.hasOwn(Ch.INSTAL, d.k) || !(Ch.ehF1() || d.k === 'fabrica')) return erro('instalacao');
      if(C.caixa < Ch.custoModernizar(d.k)) return erro('caixa');
      const r = Ch.modernizar(d.k); if(!r) return erro('instalacao');
      return { ok: true, nv: r.nv };
    }),
    patroAceitar: acao(INV, d => texto(d.nome), (J, C, d) => {
      const s = C.inv.patro.find(x => x.nome === d.nome); if(!s) return erro('patrocinio');
      if(!J.Chefe.aceitarPatro(s)) return erro('vagas');
      return { ok: true };
    }),
    patroPedir: acao(INV, d => texto(d.nome), (J, C, d) => {
      const s = C.inv.patro.find(x => x.nome === d.nome); if(!s || s.negociado) return erro('patrocinio');
      const r = J.Chefe.pedirMaisPatro(s);
      return { titulo: r.titulo, t: r.t };
    }),
    patroContrato: acao(['inverno', 'temporada'], d => texto(d.nome) && ['renov', 'romper'].includes(d.acao), (J, C, d) => {
      const s = C.patro.find(x => x.nome === d.nome);
      if(!s || s.rompido || s.calote) return erro('patrocinio');
      if(d.acao === 'renov') s.semRenovar = !s.semRenovar;
      else {
        J.Chefe.noticia('Contrato com ' + s.nome + ' rescindido.', 'rd');
        /* na pré-temporada a vaga abre na hora; durante o ano o contrato fica no livro, sem pagar */
        if(C.fase === 'inverno') C.patro.splice(C.patro.indexOf(s), 1); else s.rompido = true;
      }
      return { ok: true };
    }),
    academia: acao(INV, d => texto(d.nome), (J, C, d) => {
      const p = C.inv.olheiros.find(x => x.nome === d.nome); if(!p) return erro('piloto');
      if(!J.Chefe.levarParaAcademia(p)) return erro('academia');
      return { ok: true };
    }),
    academiaPapel: acao(INV, d => idOk(d.id) && texto(d.para), (J, C, d) => {
      const Ch = J.Chefe, p = pilotoProprio(C, d.id);
      if(!p) return erro('piloto');
      const idMin = C.ano >= 2016 ? 18 : 17;
      if(d.para === 'fora') Ch.dispensar(p);
      else if(d.para === 'emprestado'){
        if(!(Ch.ehF1() && p.papel === 'academia' && Ch.hab(p) >= 64 && Ch.idade(p) >= idMin)) return erro('piloto');
        p.papel = 'emprestado'; p.ate = C.ano;
        Ch.noticia(p.nome + ' é emprestado para correr na ' + Ch.topoNome() + ' por outra equipe.', '');
      } else if(d.para === 'titular' || d.para === 'teste'){
        if(p.papel !== 'academia' && p.papel !== 'emprestado') return erro('piloto');
        if(Ch.idade(p) < idMin) return erro('piloto', 'novo demais');
        if(d.para === 'titular' && Ch.titulares().filter(x => !x.venceu).length >= 2) return erro('vaga');
        if(d.para === 'teste' && Ch.pilotoDe('teste')) return erro('vaga');
        p.papel = d.para;
        /* contrato de quem sobe da academia: dois anos, salário de estreante e a multa de sempre */
        p.sal = Ch.salarioEstreante(p); p.ate = C.ano + 2; p.cria = C.eq.nome;
        if(d.para === 'titular'){ const u = Ch.titulares().filter(x => x !== p && !x.venceu).map(x => x.carro); p.carro = u.indexOf(0) < 0 ? 0 : 1; }
        Ch.noticia(p.nome + ' sobe da academia para ' + (d.para === 'titular' ? 'um carro titular' : 'o posto de reserva') + '.', 'g');
      } else return erro('dados');
      return { ok: true };
    }),
    saida: acao(INV, d => inteiro(d.i, 0, 50) && texto(d.op), (J, C, d) => {
      const dec = C.inv.decisoes[d.i]; if(!dec) return erro('saida');
      if(!['liberar', 'aumento', 'segurar'].includes(d.op)) return erro('dados');
      return { t: J.Chefe.resolverSaida(dec, d.op) };
    }),

    /* ── começo da temporada e a temporada ── */
    meta: acao(TEMP, d => texto(d.k), (J, C, d) => {
      const sea = C.temporada;
      if(!sea || sea.round !== 0 || !C.dir || !sea.meta || sea.metaNeg) return erro('meta');
      if(!['aceitar', 'mais', 'menos'].includes(d.k) || (d.k === 'mais' && sea.meta <= 1)) return erro('dados');
      J.Chefe.ajustarMeta(d.k);
      return { ok: true, meta: sea.meta };
    }),
    dec: acao(TEMP, d => texto(d.g) && (d.k === undefined || d.k === null || typeof d.k === 'string' || typeof d.k === 'number')
      && (d.v === null || typeof d.v === 'string' || typeof d.v === 'number'), (J, C, d) => {
      const Ch = J.Chefe, sea = C.temporada, dec = C.decisao, v = d.v, car = carroDe(d.k);
      if(!emCurso(C)) return erro('fase');
      if(d.g === 'fds'){
        const f = sea.fds;
        if(!f || f.rd !== sea.round || !f.evento || f.resolvido) return erro('fds');
        const e = Ch.FDS.find(x => x.k === f.evento.k);
        if(!e || !e.o(sea).some(o => o.k === v)) return erro('dados');
        f.evento.escolha = v;
      } else if(d.g === 'tl1'){
        if(v === 'nao') dec.tl1 = null;
        else {
          const m = /^([01]):(.+)$/.exec(String(v)), p = m ? pilotoProprio(C, m[2]) : null;
          const apto = p && Ch.ehF1() && C.ano >= 2003 && (p.papel === 'teste' || (p.papel === 'academia' && Ch.idade(p) >= 18)) && !(p.lesao > 0);
          if(!apto) return erro('dados');
          dec.tl1 = { carro: Number(m[1]), pid: p.id };
        }
      } else if(d.g === 'treino' || d.g === 'acerto'){
        const T = d.g === 'treino' ? Ch.TREINO : Ch.ACERTO;
        if(car === null || typeof v !== 'string' || !Object.hasOwn(T, v)) return erro('dados');
        const antes = d.g === 'treino' ? J.Acerto.saidasPrograma(car) : 0;
        dec[d.g] = dec[d.g] || {}; dec[d.g][car] = v;
        /* trocar o programa muda as saídas que ainda dá para fazer no acerto deste fim de semana */
        const st = d.g === 'treino' && sea.ac && sea.ac.rd === sea.round ? sea.ac.c[car] : null;
        if(st) st.saidas = Math.max(st.usadas, 1, st.saidas + J.Acerto.saidasPrograma(car) - antes);
      } else if(d.g === 'estr'){
        if(car === null || !['normal', 'ataque', 'poupar'].includes(v)) return erro('dados');
        dec.estr[car] = v;
      } else if(d.g === 'n1'){
        if(v === null) C.n1 = null;
        else {
          const p = pilotoProprio(C, v);
          if(!p || p.papel !== 'titular') return erro('dados');
          C.n1 = p.id;
        }
      } else if(d.g === 'motor'){
        if(!['normal', 'max', 'poupar'].includes(v)) return erro('dados');
        dec.motor = v;
      } else if(d.g === 'ordem'){
        if(!['livre', 'n1'].includes(v)) return erro('dados');
        dec.ordem = v;
      } else return erro('dados');
      return { ok: true };
    }),
    janela: acao(TEMP, d => (d.carro === 0 || d.carro === 1) && texto(d.k), (J, C, d) => {
      if(!emCurso(C)) return erro('fase');
      if(!J.Engine.JANELAS.some(j => j.k === d.k)) return erro('dados');
      /* o sábado da etapa nasce na primeira decisão de qualquer lado (o imprevisto do outro lado
         só é resolvido na hora de correr, em corrida()) */
      J.Chefe.qualiDaEtapa(C.temporada);
      const qs = C.temporada.qs;
      if(!qs || qs.concluida) return erro('quali');
      qs.janelas = qs.janelas || {};
      qs.janelas[d.carro] = d.k;
      return { ok: true };
    }),
    pacote: acao(TEMP, d => texto(d.area) && Number.isInteger(d.nivel), (J, C, d) => {
      const Ch = J.Chefe;
      if(!Ch.areasAtivas().filter(a => a !== 'futuro').includes(d.area) || !inteiro(d.nivel, 1, Ch.PACOTE_CUSTO.length - 1)) return erro('dados');
      const r = Ch.levarPacote(d.area, d.nivel);
      if(!r) return erro('pacote');
      return { tier: r.tier, area: r.area };
    }),
    pecasProjetar: acao(TEMP, d => texto(d.parte) && texto(d.foco) && Number.isInteger(d.nivel), (J, C, d) => {
      if(!J.Pecas.ativo()) return erro('pecas');
      if(!inteiro(d.nivel, 0, J.Pecas.INT.length - 1)) return erro('dados');
      const r = J.Pecas.projetar(d.parte, d.foco, d.nivel);
      if(!r.ok) return erro('pecas', r.motivo);
      return { ok: true };
    }),
    pecasFabricar: acao(TEMP, d => texto(d.eid) && inteiro(d.q, 1, 6) && typeof d.rapido === 'boolean', (J, C, d) => {
      if(!J.Pecas.ativo()) return erro('pecas');
      const r = J.Pecas.fabricar(d.eid, d.q, d.rapido);
      if(!r.ok) return erro('pecas', r.motivo);
      return { ok: true };
    }),
    pecasArquivar: acao(TEMP, d => Number.isInteger(d.pid), (J, C, d) => {
      if(!J.Pecas.ativo()) return erro('pecas');
      J.Pecas.arquivar(d.pid);
      return { ok: true };
    }),
    pecasPrio: acao(TEMP, d => d.k === 0 || d.k === 1, (J, C, d) => {
      const P = J.Pecas.ativo() ? J.Pecas.P() : null; if(!P) return erro('pecas');
      P.prio = d.k; J.Pecas.montar();
      return { ok: true };
    }),
    acertoMudar: acao(TEMP, d => carroDe(d.k) !== null && inteiro(d.j, 0, 4) && typeof d.v === 'number' && d.v >= 1 && d.v <= 20, (J, C, d) => {
      if(!emCurso(C) || !J.Acerto.ativo()) return erro('fase');
      J.Acerto.mudar(carroDe(d.k), d.j, d.v);
      return { ok: true };
    }),
    acertoSaida: acao(TEMP, d => carroDe(d.k) !== null, (J, C, d) => {
      if(!emCurso(C) || !J.Acerto.saida(carroDe(d.k))) return erro('acerto');
      return { ok: true };
    }),
    acertoAuto: acao(TEMP, d => carroDe(d.k) !== null, (J, C, d) => {
      if(!emCurso(C) || !J.Acerto.ativo()) return erro('fase');
      J.Acerto.auto(carroDe(d.k));
      return { ok: true };
    }),
    evento: acao(TEMP, d => Number.isInteger(d.i), (J, C, d) => {
      if(!C.evento) return erro('evento');
      const def = J.CH_EVENTOS.find(e => e.k === C.evento.k);
      if(!def || !inteiro(d.i, 0, def.ops.length - 1)) return erro('dados');
      const r = J.Chefe.resolverEvento(d.i); if(!r) return erro('evento');
      return { titulo: r.titulo, tier: r.tier, txt: r.txt };
    }),

    /* ── balanço do ano ── */
    teto: acao(BAL, d => ['declarar', 'maquiar'].includes(d.op), (J, C, d) => {
      if(!C.balanco || !C.balanco.estouro) return erro('teto');
      return { t: J.Chefe.resolverTeto(d.op) };
    }),
    falencia: acao(BAL, d => texto(d.op), (J, C, d) => {
      if(d.op === 'fechar') return erro('mp', 'fechar a equipe não existe no multiplayer');
      if(d.op !== 'resgate') return erro('dados');
      if(!C.balanco || !C.balanco.falencia) return erro('falencia');
      return { ok: true, pct: J.Chefe.resgatar() };
    })
  };

  /* uma virada de fase deixa pronto o que cada equipe decide na etapa seguinte: o imprevisto do
     fim de semana (sorteado uma vez por rodada, só dela) e sem nenhuma contraproposta velha */
  const prepararEtapa = (J, mundo) => {
    for(const slot of [mundo.anfitriao, mundo.convidado]){
      agir(J, mundo, slot, (J, C) => {
        C.mpContra = null;
        if(emCurso(C)) J.Chefe.fdsDe(C.temporada);
      });
    }
  };

  return {
    nome: 'chefe',

    /* jogadores: [{ slot, nome }]; ctx: { config: { sk, ano, equipes: { slot: idx } }, codigo, anfitriao } */
    iniciar(jogadores, ctx){
      const J = obterMotor(), { config } = ctx;
      const equipes = {};
      for(const j of jogadores) equipes[j.slot] = { chefe: j.nome, idx: config.equipes[j.slot] };
      const outro = jogadores.find(j => j.slot !== ctx.anfitriao);
      return comSemente(J, criarRnd(ctx.codigo, 'inicio'), () => criarMundo(J, {
        sk: config.sk, ano: config.ano, anfitriao: ctx.anfitriao, convidado: outro.slot, equipes
      }));
    },

    acoes,

    /* null, ou { erro, detalhe? } quando o jogador ainda não pode ficar pronto */
    podeFicarPronto(mundo, slot){
      const J = obterMotor(), C = perspectiva(mundo, slot);
      J.C = C;
      if(C.fase === 'inverno'){
        const falta = J.Chefe.pendencias();
        if(C.inv && C.inv.decisoes.length) falta.push('responder as propostas pelos seus pilotos');
        if(falta.length) return { erro: 'pendencias', detalhe: falta };
      } else if(C.fase === 'temporada' && C.evento) return { erro: 'evento' };
      return null;
    },

    /* muda o mundo que recebeu (a sala passa uma cópia) e devolve o resultado público da rodada */
    processar(mundo, rodada, rnd){
      const J = obterMotor();
      return comSemente(J, rnd, () => {
        const fase = mundo.base.fase, ordem = [mundo.anfitriao, mundo.convidado];
        let resultado;
        if(fase === 'inverno'){
          faseDupla(J, mundo, J => J.Chefe.comecarTemporada());
          prepararEtapa(J, mundo);
          resultado = { tipo: 'inicio', ano: mundo.base.ano };
        } else if(fase === 'temporada'){
          const sea = () => mundo.base.temporada;
          if(sea().round < sea().calendar.length){
            const recs = corrida(J, mundo);
            for(const slot of ordem) agir(J, mundo, slot, (J, C) => J.Chefe.sortearEvento(recs[slot]));
            const h = recs[mundo.anfitriao];
            /* só o que todo mundo viu na pista: nada de dinheiro nem de notas da equipe */
            resultado = { tipo: 'corrida', etapa: h.r, gp: h.gp, venc: h.venc, pole: h.pole,
              top: h.top.map(x => ({ pos: x.pos, nome: x.n, cc: x.cc, equipe: x.t, dnf: x.dnf || null })) };
          } else resultado = { tipo: 'fimTemporada' };
          if(sea().round >= sea().calendar.length){
            faseDupla(J, mundo, J => J.Chefe.fimDeTemporada());
            resultado.fimTemporada = true;
          }
          prepararEtapa(J, mundo);
        } else if(fase === 'balanco'){
          /* o que o jogador deixou pendente se resolve sozinho (demissão fica de fora por enquanto) */
          for(const slot of ordem){
            agir(J, mundo, slot, (J, C) => {
              if(C.balanco && C.balanco.estouro) J.Chefe.resolverTeto('declarar');
              if(C.balanco && C.balanco.falencia){
                if(C.modo === 'assumir' && C.dir && C.dir.dono !== 'conselho') J.Chefe.socorroDono();
                else J.Chefe.resgatar();
              }
            });
          }
          faseDupla(J, mundo, J => J.Chefe.proximoAno());
          prepararEtapa(J, mundo);
          resultado = { tipo: 'anoNovo', ano: mundo.base.ano };
        } else throw new Error('fase desconhecida: ' + fase);
        return { mundo, resultado };
      });
    },

    /* tudo o que o jogador pode ver: a perspectiva dele (o pacote da outra equipe nunca entra) */
    vista(mundo, slot){
      return { fase: mundo.base.fase, C: perspectiva(mundo, slot) };
    }
  };
}
