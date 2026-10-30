/* As regras do modo piloto com dois pilotos humanos (Fase 4). Mesma interface das regras do chefe
   (nome, iniciar, acoes, podeFicarPronto, processar, vista). O motor do jogo chega por uma função
   (obterMotor) porque a sala só o cria quando precisa.

   Cada ação roda o MESMO manipulador do jogo (Game.setResp, Game.investir...) na perspectiva do
   jogador (agir, de piloto-mp.js); os avisos (toasts) que o jogo daria voltam como resultado
   { avisos }. Um manipulador que recusa só deixa o estado como estava. Os dados de cada ação são
   conferidos contra uma lista fechada. Todo sorteio sai de uma semente da sala.

   Duas fases: 'temporada' (entre as corridas) e 'mercado' (depois do ano: academia, propostas).
   Cada rodada da sala em 'temporada' corre uma etapa de cada categoria (rodadaDeCorridas); a
   última etapa leva direto ao 'mercado'. No 'mercado', a rodada seguinte monta o ano novo com a
   proposta que cada um escolheu (S.mpEscolha, chave pessoal da carreira).

   Fora do multiplayer por enquanto: propostas de outra série e de dupla (reserva + titular).
   Quem fica sem nenhuma proposta que possa escolher pode ficar pronto sem escolha: o ano novo
   não chama takeOffer por ele (escolha indefinida). */
import { criarRnd } from './aleatorio.js';
import { criarMundo, perspectiva, agir, rodadaDeCorridas, anoAcabou, fimDoAno, anoNovo, comSemente } from './piloto-mp.js';

/* o modo de carreira de cada piloto (o mesmo do formulário do jogo); 'realista' liga as finanças */
export const MODO_CARREIRA = 'classico';

const erro = (codigo, detalhe) => detalhe === undefined ? { erro: codigo } : { erro: codigo, detalhe };
const ehObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const inteiro = (v, a, b) => Number.isInteger(v) && v >= a && v <= b;
const texto = v => typeof v === 'string' && v.length > 0 && v.length <= 40;
const PEDIDOS = ['anos', 'n1', 'livre'];

/* a oferta que o jogador pode escolher: existe, cabe no orçamento, não foi retirada e é da mesma série */
function ofertaEscolhivel(R, i){
  const o = Number.isInteger(i) && Array.isArray(R.pendingOffers) ? R.pendingOffers[i] : null;
  if(!o || o.podeP === false || o.retirada) return { erro: 'proposta' };
  return { o };
}
const temEscolhivel = R => Array.isArray(R.pendingOffers) && R.pendingOffers.some((_, i) => !ofertaEscolhivel(R, i).erro);

/* roda fn com o toast do jogo preso: devolve { valor, avisos } */
function comAvisos(J, fn){
  const antes = J.UI.toast, avisos = [];
  J.UI.toast = msg => { if(avisos.length < 10) avisos.push(String(msg).slice(0, 200)); };
  try { return { valor: fn(), avisos }; } finally { J.UI.toast = antes; }
}

export function criarRegrasPiloto(obterMotor){
  /* define uma ação: fase em que vale, forma dos dados (rápida, sem o motor) e o corpo, que roda
     na perspectiva do jogador com o sorteio preso à semente desta ação. O corpo devolve
     { erro } para recusar ou um objeto extra (o resultado leva { avisos } mais isso). */
  const acao = (fase, forma, corpo) => ({
    validar: dados => ehObj(dados) && forma(dados) ? null : 'dados',
    aplicar(mundo, slot, dados, ctx){
      if(mundo.fase !== fase) return erro('fase');
      const J = obterMotor();
      /* no mercado a temporada (do mundo) já acabou: só a carreira do jogador volta */
      const opcoes = fase === 'mercado' ? { temporada: false } : undefined;
      return comSemente(J, criarRnd(ctx.codigo, 'acao:' + ctx.id), () => agir(J, mundo, slot, (J, S) => {
        const { valor, avisos } = comAvisos(J, () => corpo(J, S, dados));
        if(valor && valor.erro) return valor;
        J.UI.limparFila();
        return Object.assign({ avisos }, valor);
      }, opcoes));
    }
  });
  const TEMP = 'temporada', MERC = 'mercado';
  const chaveEm = (obj, k) => Object.keys(obj).includes(k);
  /* ações que só chamam o manipulador do jogo com uma chave de uma lista fechada */
  const porChave = (fase, nome, tabela) => acao(fase, d => typeof d.k === 'string', (J, S, d) => {
    if(!chaveEm(tabela(J, S), d.k)) return erro('dados');
    J.Game[nome](d.k);
  });
  const filosofias = J => Object.fromEntries(J.Engine.FILOSOFIAS.map(f => [f.k, 1]));
  const compromissos = J => Object.fromEntries(J.COMPROMISSOS.map(c => [c.k, 1]));

  const acoes = {
    /* ── temporada: acerto, foco, finanças ── */
    setResp: acao(TEMP, d => inteiro(d.i, 0, 9) && [0, 1, 2].includes(d.v), (J, S, d) => {
      if(!S.season || !inteiro(d.i, 0, J.Engine.SETOR_NOME.length - 1)) return erro('dados');
      J.Game.setResp(d.i, d.v);
    }),
    setupEngenheiro: acao(TEMP, () => true, (J, S) => {
      if(!S.season) return erro('dados');
      J.Game.setupNoEngenheiro();
    }),
    setFilo: porChave(TEMP, 'setFilo', filosofias),
    setMotor: acao(TEMP, d => Number.isInteger(d.i), (J, S, d) => {
      if(!S.season || !inteiro(d.i, 0, J.Engine.MOTOR_ROT.length - 1)) return erro('dados');
      J.Game.setMotor(d.i);
    }),
    escolherFoco: porChave(TEMP, 'escolherFoco', J => J.FOCOS),
    pedirDirecao: porChave(TEMP, 'pedirDirecao', J => J.DIRECOES),
    investir: acao(TEMP, d => Number.isInteger(d.v), (J, S, d) => {
      const retirada = S.money && S.money.invest > 0 ? -Math.min(S.money.invest, 1000000) : null;
      if(!S.money || !([100000, 500000, 2000000].includes(d.v) || (retirada !== null && d.v === retirada))) return erro('dados');
      J.Game.investir(d.v);
    }),
    pagarTeste: acao(TEMP, d => Number.isInteger(d.v), (J, S, d) => {
      if(!S.money || ![300000, 900000, 2500000].includes(d.v)) return erro('dados');
      J.Game.pagarTeste(d.v);
    }),
    comprarLuxo: acao(TEMP, d => inteiro(d.i, 0, 99), (J, S, d) => {
      if(!J.LUXOS[d.i] || !S.money) return erro('dados');
      J.Game.comprarLuxo(d.i);
    }),
    assinarPatro: acao(TEMP, d => inteiro(d.i, 0, 99), (J, S, d) => {
      if(!(S.patroOfertas || [])[d.i] || !S.money) return erro('dados');
      J.Game.assinarPatro(d.i);
    }),
    contratarPessoal: porChave(TEMP, 'contratarPessoal', J => J.EQUIPE_PESSOAL),
    dispensarPessoal: porChave(TEMP, 'dispensarPessoal', J => J.EQUIPE_PESSOAL),
    relacionar: porChave(TEMP, 'relacionar', J => J.RELACOES),
    setCompromisso: porChave(TEMP, 'setCompromisso', compromissos),

    /* ── mercado: academia e propostas ── */
    academia: acao(MERC, d => d.i === null || Number.isInteger(d.i), (J, S, d) => {
      const lista = S.academyOffers;
      if(S.retired || !Array.isArray(lista) || !lista.length) return erro('academia');
      if(d.i !== null && !inteiro(d.i, 0, lista.length - 1)) return erro('dados');
      if(d.i === null){
        S.academyOffers = null; S.lastSum = J.Engine.summary(S.season); J.Game.showOffers(S.lastSum);
      } else {
        /* como o piloto automático dos testes do jogo: entra na academia e segue para as propostas */
        S._acadList = S.academyOffers; S.academyOffers = null;
        J.Game.joinAcademy(d.i);
        S._acadList = null;
        /* se o jogo não mostrou as propostas (recusou a vaga, ou foi demitido), elas vêm daqui */
        if(!S.pendingOffers){ S.lastSum = J.Engine.summary(S.season); J.Game.showOffers(S.lastSum); }
      }
      J.UI.limparFila(); J.UI.close();
    }),
    pedirOferta: acao(MERC, d => Number.isInteger(d.i) && PEDIDOS.includes(d.k), (J, S, d) => {
      const o = (S.pendingOffers || [])[d.i];
      if(S.retired || !o || o.negociou) return erro('proposta');
      J.Game.pedirOferta(d.i, d.k);
      J.UI.close();
    }),
    escolherOferta: acao(MERC, d => Number.isInteger(d.i), (J, S, d) => {
      if(S.retired) return erro('carreira');
      const r = ofertaEscolhivel(S, d.i);
      if(r.erro) return erro(r.erro);
      S.mpEscolha = d.i;
      return { escolha: d.i };
    })
  };

  return {
    nome: 'piloto',

    /* jogadores: [{ slot, nome }]; ctx: { config: { serie, ano, pilotos: { slot: {nome, cc, idade, estilo} } }, codigo, anfitriao } */
    iniciar(jogadores, ctx){
      const J = obterMotor(), { config } = ctx;
      const outro = jogadores.find(j => j.slot !== ctx.anfitriao);
      const pilotos = {};
      for(const j of jogadores) pilotos[j.slot] = Object.assign({ modo: MODO_CARREIRA }, config.pilotos[j.slot]);
      return comSemente(J, criarRnd(ctx.codigo, 'inicio'), () => criarMundo(J, {
        serie: config.serie, ano: config.ano, anfitriao: ctx.anfitriao, convidado: outro.slot, pilotos
      }));
    },

    acoes,

    /* null, ou { erro, detalhe? } quando o jogador ainda não pode ficar pronto. Lê a raiz do
       piloto direto (as chaves pessoais moram nela), sem montar a perspectiva. */
    podeFicarPronto(mundo, slot){
      const R = mundo.pilotos[slot].raiz;
      if(mundo.fase === 'temporada' || R.retired) return null;
      if(mundo.fase === 'mercado'){
        if(Array.isArray(R.academyOffers) && R.academyOffers.length) return erro('academia');
        if(!temEscolhivel(R)) return null;          // sem nenhuma proposta que possa escolher: segue sem escolha
        return Number.isInteger(R.mpEscolha) && !ofertaEscolhivel(R, R.mpEscolha).erro ? null : erro('proposta');
      }
      return null;
    },

    /* quem encerrou a carreira não tem mais decisões: a sala o conta como pronto */
    dispensado(mundo, slot){ const P = mundo.pilotos[slot]; return !!(P && P.raiz.retired); },

    /* muda o mundo que recebeu (a sala passa uma cópia) e devolve o resultado público da rodada */
    processar(mundo, rodada, rnd){
      const J = obterMotor(), ordem = [mundo.anfitriao, mundo.convidado];
      if(ordem.every(s => mundo.pilotos[s].raiz.retired)) return { mundo, resultado: { tipo: 'fim' } };
      return comSemente(J, rnd, () => {
        let resultado;
        if(mundo.fase === 'temporada'){
          const recs = rodadaDeCorridas(J, mundo);
          const etapas = [];
          /* uma entrada por piloto que correu; numa categoria dividida as duas são a mesma corrida */
          for(const slot of ordem){
            const rec = recs[slot]; if(!rec || !Array.isArray(rec.top)) continue;
            const T = mundo.temporadas[mundo.pilotos[slot].chaveTemporada];
            etapas.push({ slot: Number(slot), cat: T ? T.sea.cat : null, gp: rec.gp, etapa: rec.r,
              venc: rec.top[0] ? rec.top[0].n : null,
              top: rec.top.slice(0, 10).map(x => ({ pos: x.pos, nome: x.n, equipe: x.t, cc: x.cc, dnf: x.dnf || null })) });
          }
          resultado = { tipo: 'corridas', etapas };
          if(anoAcabou(mundo)){ fimDoAno(J, mundo); resultado.fimAno = true; }
        } else if(mundo.fase === 'mercado'){
          const escolhas = {};
          for(const slot of ordem){
            const R = mundo.pilotos[slot].raiz;
            escolhas[slot] = !R.retired && !ofertaEscolhivel(R, R.mpEscolha).erro ? R.mpEscolha : undefined;
          }
          anoNovo(J, mundo, escolhas);
          for(const slot of ordem) delete mundo.pilotos[slot].raiz.mpEscolha;
          resultado = { tipo: 'anoNovo', ano: mundo.pilotos[mundo.anfitriao].raiz.year };
        } else throw new Error('fase desconhecida: ' + mundo.fase);
        return { mundo, resultado };
      });
    },

    /* tudo o que o jogador pode ver: a perspectiva dele (a carreira da outra nunca entra) */
    vista(mundo, slot){
      return { fase: mundo.fase, S: perspectiva(mundo, slot) };
    }
  };
}
