/* Regras de TESTE: um jogo mínimo e determinístico só para provar o protocolo de turnos
   (planejar, pronto, processamento único). Cada jogador planeja um valor de 1 a 10 em
   segredo; ao processar, o servidor sorteia de 1 a 6 e soma. As regras de verdade (Fase 3)
   terão a mesma interface: nome, iniciar, acoes, processar e vista. */

const chaves = mundo => Object.keys(mundo.pontos).sort((a, b) => Number(a) - Number(b));

export const regrasTeste = {
  nome: 'teste',

  /* jogadores: [{ slot, nome }]; as chaves do mundo são os slots como texto */
  iniciar(jogadores){
    const pontos = {};
    for(const j of jogadores) pontos[j.slot] = 0;
    return { pontos, planos: {}, historico: [] };
  },

  acoes: {
    planejar: {
      validar(dados){
        const ok = dados && typeof dados === 'object' && Number.isInteger(dados.valor) && dados.valor >= 1 && dados.valor <= 10;
        return ok ? null : 'dados';
      },
      aplicar(mundo, slot, dados){
        mundo.planos[slot] = dados.valor;
        return { plano: dados.valor };
      }
    }
  },

  /* muda o mundo que recebeu (o servidor passa uma cópia) e devolve o resultado público da rodada */
  processar(mundo, rodada, rnd){
    const jogadas = [];
    for(const k of chaves(mundo)){
      const plano = mundo.planos[k] ?? 0;
      const sorte = 1 + Math.floor(rnd() * 6);
      const ganho = plano + sorte;
      mundo.pontos[k] += ganho;
      jogadas.push({ slot: Number(k), plano, sorte, ganho });
    }
    mundo.historico.push({ rodada, jogadas: jogadas.map(j => Object.assign({}, j)) });
    mundo.planos = {};
    return { mundo, resultado: { rodada, jogadas, pontos: Object.assign({}, mundo.pontos) } };
  },

  /* o que um jogador pode ver: o próprio plano e só se o rival já decidiu, nunca o valor dele */
  vista(mundo, slot){
    return {
      meuPlano: mundo.planos[slot] ?? null,
      pontos: Object.assign({}, mundo.pontos),
      rivalDecidiu: Object.keys(mundo.planos).some(k => k !== String(slot)),
      historico: mundo.historico.slice(-5)
    };
  }
};
