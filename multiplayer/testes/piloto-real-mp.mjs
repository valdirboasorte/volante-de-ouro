/* A carreira de piloto atual no multiplayer, com piloto real (Fase 7), sem servidor: o motor no Node.
   - dois jogadores assumem pilotos de verdade do grid da sala (Verstappen e Hamilton, F1 2023): cada um
     começa na equipe real, com o passado do banco histórico (S.passado, assets/passado-piloto.js);
   - os dois dividem a temporada da F1 sem ninguém repetido no grid (a pessoa real não fica na IA);
   - três rodadas de corridas: a carreira de cada um anda e o passado continua no save;
   - a carreira somada (Passado.carreira) é a de antes mais a de agora (títulos e vitórias);
   - um piloto real e um criado na mesma sala (categorias diferentes) também começam.
   Uso: node testes/piloto-real-mp.mjs   (gere o motor antes: node ferramentas/gerar-motor.mjs) */
import { criarMotor } from '../src/gerado/motor-jogo.js';
import { ambienteFalso } from '../src/pagina-falsa.js';
import { criarRnd } from '../src/aleatorio.js';
import { criarRegrasPiloto } from '../src/regras-piloto.js';

let ok = 0, falhas = 0;
const checar = (nome, cond, detalhe) => { if(cond){ ok++; console.log('  ✓ ' + nome); } else { falhas++; console.log('  ✗ ' + nome + (detalhe === undefined ? '' : ' — ' + JSON.stringify(detalhe).slice(0, 400))); } return !!cond; };
function novoMotor(seed){ const amb = ambienteFalso({ seed }); const J = criarMotor(amb); J.amb = amb; J.Saves.auto = false; return J; }

console.log('\nPiloto real no multiplayer: Verstappen e Hamilton, F1 2023');
{
  const J = novoMotor(11), regras = criarRegrasPiloto(() => J), codigo = 'REALTEST';
  const config = { serie: 'f1', ano: 2023, pilotos: { 0: { real: 'Verstappen', nome: 'Verstappen', cc: 'NL', estilo: 'equilibrado' }, 1: { real: 'Hamilton', nome: 'Hamilton', cc: 'GB', estilo: 'equilibrado' } } };
  let mundo = regras.iniciar([{ slot: 0 }, { slot: 1 }], { config, codigo, anfitriao: 0 });
  const r0 = mundo.pilotos['0'].raiz, r1 = mundo.pilotos['1'].raiz;
  checar('cada um começa na equipe real daquele ano', r0.real && r1.real && r0.team.name === 'Red Bull' && r1.team.name === 'Mercedes', [r0.team && r0.team.name, r1.team && r1.team.name]);
  checar('cada um chega com o passado do banco histórico (S.passado)', r0.passado && r0.passado.temporadas.length >= 8 && r1.passado && r1.passado.temporadas.length >= 16,
    [r0.passado && r0.passado.temporadas.length, r1.passado && r1.passado.temporadas.length]);
  checar('a carreira "com você" começa zerada (o passado fica à parte, como no jogo solo)', r0.career.gps === 0 && r1.career.wins === 0);
  const v0 = regras.vista(mundo, 0), v1 = regras.vista(mundo, 1);
  const nomes = v0.S.season.field.map(f => f.name);
  checar('os dois na mesma temporada da F1, cada um uma vez no grid', v0.S.season.cat === v1.S.season.cat && nomes.filter(n => n === 'Verstappen').length === 1 && nomes.filter(n => n === 'Hamilton').length === 1,
    { cat: [v0.S.season.cat, v1.S.season.cat], v: nomes.filter(n => n === 'Verstappen').length, h: nomes.filter(n => n === 'Hamilton').length });
  checar('a vista de cada um leva o passado (a tela mostra somado)', !!v0.S.passado && !!v1.S.passado);
  for(let N = 1; N <= 3; N++){ const r = regras.processar(structuredClone(mundo), N, criarRnd(codigo, N)); mundo = r.mundo; }
  const w0 = regras.vista(mundo, 0), w1 = regras.vista(mundo, 1);
  checar('três rodadas: três corridas na carreira de cada um', w0.S.season.results.length === 3 && w1.S.season.results.length === 3, [w0.S.season.results.length, w1.S.season.results.length]);
  J.S = w0.S;
  const som = J.Passado.carreira(w0.S.career), antes = J.Passado.atual();
  checar('a carreira somada é a de antes mais a de agora', som && antes && som.titles === antes.topo.titulos + w0.S.career.titles && som.wins === (antes.topo.wins || 0) + w0.S.career.wins,
    { som: som && { t: som.titles, w: som.wins }, antes: antes && { t: antes.topo.titulos, w: antes.topo.wins }, agora: { t: w0.S.career.titles, w: w0.S.career.wins } });
}

console.log('\nUm piloto real e um criado na mesma sala');
{
  const J = novoMotor(12), regras = criarRegrasPiloto(() => J), codigo = 'REALMIX1';
  const config = { serie: 'f1', ano: 2024, pilotos: { 0: { real: 'Leclerc', nome: 'Leclerc', cc: 'MC', estilo: 'equilibrado' }, 1: { nome: 'Rui Prado', cc: 'BR', idade: 17, estilo: 'equilibrado' } } };
  let mundo = regras.iniciar([{ slot: 0 }, { slot: 1 }], { config, codigo, anfitriao: 0 });
  const v0 = regras.vista(mundo, 0), v1 = regras.vista(mundo, 1);
  checar('o real na F1 e o criado numa categoria de base, cada um na sua temporada', v0.S.season.cat === 'Fórmula 1' && v1.S.season.cat !== 'Fórmula 1' && v0.S.real && !v1.S.real, [v0.S.season.cat, v1.S.season.cat]);
  /* (a categoria de calendário mais curto corre quando chega a vez dela: com 24 etapas na F1, umas 10 na base,
     a base corre na 3ª rodada da sala) */
  for(let N = 1; N <= 5; N++){ const r = regras.processar(structuredClone(mundo), N, criarRnd(codigo, N)); mundo = r.mundo; }
  const n0 = regras.vista(mundo, 0).S.season.results.length, n1 = regras.vista(mundo, 1).S.season.results.length;
  checar('as rodadas andam para os dois (cada um no calendário da sua categoria)', n0 === 5 && n1 >= 1 && n1 < 5, [n0, n1]);
}
console.log(`\n${ok} ok, ${falhas} falha(s)`);
process.exit(falhas ? 1 : 0);
