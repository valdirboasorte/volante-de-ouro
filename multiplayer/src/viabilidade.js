/* Teste de viabilidade da Fase 1: o motor do jogo roda no servidor?
   Monta o cenário Brawn 2009 do modo chefe, corre a primeira etapa ao vivo passo a
   passo (Gp.passo, 0,25 s por passo, como a transmissão faz) e fecha a etapa. Roda igual
   no Node e no workerd: com a mesma semente, o hash da chegada tem de ser o mesmo. */
import { criarMotor, VERSAO_JOGO } from './gerado/motor-jogo.js';
import { ambienteFalso } from './pagina-falsa.js';

async function sha(txt){
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(txt));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

export async function viabilidade(seed = 7, relogio = () => Date.now()){
  const t = [relogio()];
  const J = criarMotor(ambienteFalso({ seed }));
  t.push(relogio());
  J.Saves.auto = false;
  J.Cenario.iniciar('brawn09', { nome: 'Servidor', cc: 'BR' });
  J.Chefe.comecarTemporada(); J.UI.limparFila(); J.UI.close();
  const sea = J.C.temporada;
  J.Chefe.gridDaEtapa(sea);
  const M = J.Chefe.montar();
  const R = J.Gp.criar(J.Gp.entrada(sea, M, J.Chefe.sk(), sea.ano, f => f.teamId === 'EU', { gestao: true }));
  t.push(relogio());
  let passos = 0, perguntas = 0;
  while(!R.fim && passos < 400000){
    if(R.pergunta){ perguntas++; J.Gp.responder(R, 0); }
    J.Gp.passo(R); passos++;
  }
  t.push(relogio());
  const res = J.Gp.resultado(R);
  const rec = J.Chefe.correr({ montagem: M, finish: J.Gp.chegada(M, res), flId: res.flId, sc: res.sc });
  t.push(relogio());
  const chegada = res.ordem.map(o => [o.id, o.pos == null ? null : o.pos, o.paradas, (o.pneus || []).join('')]);
  return {
    versao: VERSAO_JOGO, seed, pista: R.ent.trkId, ano: sea.ano, voltas: R.N, carros: R.carros.length,
    passos, perguntas, eventos: R.eventos.length, provaMin: Math.round(R.t / 60),
    vencedor: res.ordem[0] && (res.ordem[0].nome || res.ordem[0].id), pontosEquipe: rec && rec.pts,
    caixa: Math.round(J.C.caixa), hash: await sha(JSON.stringify(chegada)),
    ms: { carregar: t[1] - t[0], montar: t[2] - t[1], correr: t[3] - t[2], fechar: t[4] - t[3] }
  };
}
