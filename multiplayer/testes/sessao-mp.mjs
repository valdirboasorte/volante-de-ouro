/* A classificação ao vivo do chefe (sessao-mp.js), sem servidor: o motor do jogo no Node.
   Faz o que a sala faz numa rodada com corridas ao vivo: a passada de preparar abre a primeira
   sessão que falta; a sessão anda no relógio (avancar) com as ordens dos jogadores; o valor de
   cada carro fica guardado e a passada seguinte abre a próxima; sem sessão faltando, vem a corrida
   ao vivo, e a passada de concluir dá o mesmo grid.
   Uso: node testes/sessao-mp.mjs   (gere o motor antes: node ferramentas/gerar-motor.mjs) */
import { criarMotor } from '../src/gerado/motor-jogo.js';
import { ambienteFalso } from '../src/pagina-falsa.js';
import { criarRnd } from '../src/aleatorio.js';
import { criarRegrasChefe } from '../src/regras-chefe.js';
import { perspectiva } from '../src/chefe-mp.js';
import { ligarCorridas, desligarCorridas } from '../src/corrida-mp.js';

let ok = 0, falhas = 0;
const checar = (nome, cond, detalhe) => { if(cond){ ok++; console.log('  ✓ ' + nome); } else { falhas++; console.log('  ✗ ' + nome + (detalhe === undefined ? '' : ' — ' + JSON.stringify(detalhe).slice(0, 500))); } return !!cond; };
const amb = ambienteFalso({ seed: 41 }); const J = criarMotor(amb); J.amb = amb; J.Saves.auto = false;
const regras = criarRegrasChefe(() => J);
const codigo = 'SESSAO01';
const lista = J.eraOfSeries(2024, 'f1').teams.map((t, i) => [i, J.Engine.resolveTeam(t, i, 2024, 'f1')]).filter(x => x[1]).sort((a, b) => b[1].str - a[1].str);
let mundo = regras.iniciar([{ slot: 0, nome: 'Ana' }, { slot: 1, nome: 'Bia' }, { slot: 2, nome: 'Caio' }],
  { config: { sk: 'f1', ano: 2024, equipes: { 0: lista[1][0], 1: lista[1][0], 2: lista[6][0] } }, codigo, anfitriao: 0 });
let N = 1;
mundo = regras.processar(mundo, N, criarRnd(codigo, N)).mundo; N++;   // o inverno

const passada = (modo, res) => {
  const ctl = ligarCorridas(J, modo, res, { qualiAoVivo: true });
  try { const r = regras.processar(structuredClone(mundo), N, criarRnd(codigo, N)); ctl.r = r; return ctl; } finally { desligarCorridas(J); }
};

console.log('\nAs sessões da classificação, uma de cada vez');
const resultados = {}, nomes = [], ordens = {};
let ctl = passada('preparar', resultados), guarda = 0, primeira = null;
while(ctl.sessoes.length && guarda++ < 8){
  const s = ctl.sessoes[0];
  if(!primeira){
    primeira = s;
    const humanos = s.S.carros.map((c, i) => [c, i]).filter(([c]) => c.ctrl);
    const meus = s.meus('2'), daAna = s.meus('0'), daBia = s.meus('1');
    checar(`a ${s.S.ses.n} tem os carros das duas equipes humanas como de controle (${humanos.length}); a Ana e a Bia mandam nos mesmos dois, o Caio nos dele`,
      humanos.length === 4 && meus.length === 2 && daAna.length === 2 && daAna.join() === daBia.join() && !meus.some(i => daAna.includes(i)),
      { humanos: humanos.map(([c, i]) => i + ':' + c.nome), meus, daAna, daBia });
    const r1 = s.ordem('2', 'sair', { i: daAna[0] }, 0), r2 = s.ordem('2', 'sair', { i: meus[0] }, 0), r3 = s.ordem('2', 'sair', { i: meus[0] }, 0);
    checar('o Caio não manda no carro da Ana; manda o dele para a pista, e uma segunda ordem com ele já na pista é recusada',
      r1.erro === 'carro' && r2.ok && r3.erro === 'fase' && s.S.carros[meus[0]].estado === 'pista', { r1, r2, r3 });
  }
  /* o relógio da sala: 200 ms de cada vez a 64× */
  let agora = 1000, g = 0;
  while(s.fase !== 'fim' && g++ < 5000){ agora += 200; s.avancar(agora, 64); }
  const res = s.resultado();
  nomes.push(s.S.ses.n);
  resultados[s.def.chave] = res;
  ordens[s.def.chave] = Object.keys(res.valores).length;
  ctl = passada('preparar', resultados);
}
checar(`as sessões vão uma depois da outra (${nomes.join(', ')}), cada uma com o valor de cada carro guardado`,
  nomes.length >= 2 && Object.values(resultados).every(r => r && Object.keys(r.valores).length > 0), { nomes, ordens });
const humanosComTempo = primeira && primeira.S.carros.filter(c => c.ctrl && c.vBest != null).length;
checar('quem não mandou sair saiu sozinho no meio da sessão: todos os carros humanos marcaram tempo', humanosComTempo === 4, { humanosComTempo });

console.log('\nDepois da classificação, a corrida ao vivo');
checar('sem sessão faltando, a passada de preparar traz a corrida ao vivo', ctl.sessoes.length === 0 && ctl.defs.length === 1, { sessoes: ctl.sessoes.length, defs: ctl.defs.length });
const d = ctl.defs[0];
const R = J.Gp.criar(structuredClone(d.ent)); J.Gp.terminar(R);
const tudo = Object.assign({}, resultados, { [d.chave]: { ent: d.ent, res: J.Gp.resultado(R), notas: {} } });
const conc = passada('concluir', tudo);
checar('a passada de concluir aplica as sessões e a corrida sem diferença (o grid é o mesmo das sessões ao vivo)',
  !conc.divergencias.length && !conc.faltas.length && conc.sessoes.length === 0, { div: conc.divergencias, faltas: conc.faltas });
mundo = conc.r.mundo;
const qs = perspectiva(mundo, '0').temporada.qsHist || [];
checar('a rodada fecha com a corrida processada', conc.r.resultado.tipo === 'corrida' && conc.r.resultado.top.length > 0, conc.r.resultado.tipo);

console.log(falhas ? `\n${falhas} de ${ok + falhas} verificações falharam` : `\nsessões: ${ok} verificações, tudo certo`);
process.exit(falhas ? 1 : 0);
