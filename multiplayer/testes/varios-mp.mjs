/* Salas com vários jogadores (até 8), sem servidor: o motor do jogo no Node.
   - Chefe com 4 jogadores e 3 equipes: dois dividem a equipe do anfitrião. Cada equipe se vê como
     'EU' e vê as outras como 'EU2', 'EU3'; a decisão de um membro vale para a equipe toda; o ano
     inteiro roda (inverno, corridas, balanço, ano novo) e a chegada é a mesma para todas.
   - Piloto com 4 pilotos, três da mesma idade (dividem a categoria) e um mais novo: cada um é o 'ME'
     da sua temporada, os outros do grupo aparecem com o nome deles, a chegada de cada corrida é a
     mesma nos três lados, e o ano novo monta as temporadas de novo.
   - A corrida ao vivo com esses grupos: a preparada e a concluída são a mesma, e o carro da equipe
     dividida tem os dois membros como donos.
   - O tempo de uma rodada com 8 jogadores (o servidor tem um teto de CPU por pedido).
   Uso: node testes/varios-mp.mjs   (gere o motor antes: node ferramentas/gerar-motor.mjs) */
import { criarMotor } from '../src/gerado/motor-jogo.js';
import { ambienteFalso } from '../src/pagina-falsa.js';
import { criarRnd } from '../src/aleatorio.js';
import { criarRegrasChefe } from '../src/regras-chefe.js';
import { criarRegrasPiloto } from '../src/regras-piloto.js';
import { perspectiva as vistaChefe, agir as agirChefe } from '../src/chefe-mp.js';
import { perspectiva as vistaPiloto } from '../src/piloto-mp.js';
import { ligarCorridas, desligarCorridas } from '../src/corrida-mp.js';

let ok = 0, falhas = 0;
const checar = (nome, cond, detalhe) => { if(cond){ ok++; console.log('  ✓ ' + nome); } else { falhas++; console.log('  ✗ ' + nome + (detalhe === undefined ? '' : ' — ' + JSON.stringify(detalhe).slice(0, 500))); } return !!cond; };
const amb = ambienteFalso({ seed: 11 }); const J = criarMotor(amb); J.amb = amb; J.Saves.auto = false;
const chefe = criarRegrasChefe(() => J), piloto = criarRegrasPiloto(() => J);
const jogadores = n => Array.from({ length: n }, (_, i) => ({ slot: i, nome: ['Ana', 'Bia', 'Caio', 'Duda', 'Eva', 'Gil', 'Ivo', 'Lia'][i] }));
const medir = fn => { const t = Date.now(); const r = fn(); return { r, ms: Date.now() - t }; };
/* as duas passadas da corrida ao vivo de uma rodada, sobre cópias do mundo */
function aoVivo(regras, mundo, codigo, N){
  const passada = (modo, res) => { const ctl = ligarCorridas(J, modo, res); try { regras.processar(structuredClone(mundo), N, criarRnd(codigo, N)); return ctl; } finally { desligarCorridas(J); } };
  const prep = passada('preparar');
  const res = {};
  for(const d of prep.defs){ const R = J.Gp.criar(structuredClone(d.ent)); J.Gp.terminar(R); res[d.chave] = { ent: d.ent, res: J.Gp.resultado(R), notas: {} }; }
  return { prep, conc: prep.defs.length ? passada('concluir', res) : null };
}

console.log('\nChefe: 4 jogadores, 3 equipes (Ana e Bia dividem a equipe do anfitrião)');
{
  const codigo = 'VARIOS01';
  let mundo = chefe.iniciar(jogadores(4), { config: { sk: 'f1', ano: 2024, equipes: { 0: 0, 1: 0, 2: 3, 3: 5 } }, codigo, anfitriao: 0 });
  checar('o mundo tem 3 equipes na ordem (a do anfitrião primeiro) e a Bia é membro da equipe da Ana',
    JSON.stringify(mundo.ordem) === '["0","2","3"]' && mundo.membros['1'] === '0' && Object.keys(mundo.equipes).sort().join() === '0,2,3', { ordem: mundo.ordem, membros: mundo.membros });
  const V = s => vistaChefe(mundo, String(s));
  checar('Ana e Bia veem a mesma equipe; Caio e Duda, cada um a sua; cada um vê as outras duas como EU2 e EU3',
    V(0).eq.nome === V(1).eq.nome && V(0).eq.nome !== V(2).eq.nome && V(2).eq.nome !== V(3).eq.nome
    && [0, 1, 2, 3].every(s => V(s).mpOutras.map(o => o.id).sort().join() === 'EU2,EU3'), [0, 1, 2, 3].map(s => [V(s).eq.nome, V(s).mpOutras.map(o => o.id + ':' + o.nome)]));
  const antes = V(0).caixa;
  mundo.equipes['0'].raiz.caixa = antes;   // nada mudou ainda
  agirChefe(J, mundo, '1', (J, C) => { C.caixa += 12345; });
  checar('uma decisão da Bia vale para a equipe: a Ana vê o caixa mudado', V(0).caixa === antes + 12345 && V(1).caixa === antes + 12345, { antes, depois: V(0).caixa });
  agirChefe(J, mundo, '1', (J, C) => { C.caixa -= 12345; });

  let N = 1, g = 0, ano = mundo.base.ano, tempos = [], vivo = null, corridas = 0, iguais = true;
  while(mundo.base.ano === ano && g++ < 60){
    if(!vivo && mundo.base.fase === 'temporada' && N > 2) vivo = aoVivo(chefe, mundo, codigo, N);
    const { r, ms } = medir(() => chefe.processar(mundo, N, criarRnd(codigo, N)));
    tempos.push(ms); mundo = r.mundo;
    if(r.resultado.tipo === 'corrida'){
      corridas++;
      /* a mesma chegada para as três equipes: a pontuação de construtores bate entre os lados */
      const pts = s => { const C = V(s), t = C.temporada; return t && t.cstand ? t.cstand.EU || 0 : 0; };
      const base = mundo.base.temporada && mundo.base.temporada.cstand;
      if(base && !(pts(0) === (base.EU || 0) && pts(2) === (base.EU2 || 0) && pts(3) === (base.EU3 || 0))) iguais = false;
    }
    N++;
  }
  checar(`o ano inteiro roda (${corridas} corridas) e chega ao ano novo (${ano} → ${mundo.base.ano})`, corridas >= 20 && mundo.base.ano === ano + 1, { corridas, ano: mundo.base.ano, fase: mundo.base.fase });
  checar('a cada corrida, os pontos de construtores de cada equipe batem entre o lado dela e o mundo do anfitrião', iguais);
  /* o ano novo começa no inverno (sem temporada): mais uma rodada e a temporada nova está montada */
  mundo = chefe.processar(mundo, N, criarRnd(codigo, N)).mundo; N++;
  const C2 = V(2);
  checar('depois do inverno do ano novo, cada equipe tem a sua temporada com as outras duas no grid',
    [0, 2, 3].every(s => { const t = V(s).temporada; return t && t.teams.some(x => x.id === 'EU' && x.nossa) && t.teams.filter(x => x.humana).length === 2; }), C2.temporada && C2.temporada.teams.filter(x => x.humana || x.nossa).map(x => x.id));
  checar('na corrida ao vivo, os carros da equipe dividida têm a Ana e a Bia como donas, e a preparada é a concluída',
    !!vivo && vivo.prep.defs.length === 1 && Object.values(vivo.prep.defs[0].donos).some(d => Array.isArray(d) && d.join() === '0,1')
    && vivo.prep.defs[0].slots.join() === '0,1,2,3' && vivo.conc && !vivo.conc.divergencias.length && !vivo.conc.faltas.length,
    vivo && { donos: vivo.prep.defs[0] && vivo.prep.defs[0].donos, slots: vivo.prep.defs[0] && vivo.prep.defs[0].slots, div: vivo.conc && vivo.conc.divergencias });
  const media = Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length);
  console.log(`    tempo por rodada com 3 equipes: média ${media} ms, máximo ${Math.max(...tempos)} ms`);
}

console.log('\nPiloto: 4 pilotos, três de 22 anos e um de 15');
{
  const codigo = 'VARIOS02';
  const fichas = { 0: { nome: 'Ana Silva', cc: 'BR', idade: 22 }, 1: { nome: 'Bia Costa', cc: 'PT', idade: 22 }, 2: { nome: 'Caio Lima', cc: 'AR', idade: 22 }, 3: { nome: 'Duda Reis', cc: 'BR', idade: 15 } };
  let mundo = piloto.iniciar(jogadores(4), { config: { serie: 'f1', ano: 2024, pilotos: fichas }, codigo, anfitriao: 0 });
  const V = s => vistaPiloto(mundo, String(s));
  const grupos = {}; for(const s of ['0', '1', '2', '3']){ const c = mundo.pilotos[s].chaveTemporada; (grupos[c] = grupos[c] || []).push(s); }
  const grupo = Object.values(grupos).sort((a, b) => b.length - a.length)[0];
  checar(`os da mesma idade dividem a categoria (grupos: ${Object.values(grupos).map(x => x.join('+')).join(' | ')})`, grupo.length >= 2, grupos);
  const humanosNa = s => V(s).season.field.filter(f => f.isMe || f.humano).map(f => (f.isMe ? 'ME:' : f.id + ':') + f.name).sort();
  checar('no grupo, cada um é o ME da temporada e vê os outros do grupo com o nome deles (ME2, ME3...)',
    grupo.every(s => { const F = V(s).season.field, eu = F.filter(f => f.isMe); return eu.length === 1 && eu[0].name === fichas[s].nome && F.filter(f => f.humano).length === grupo.length - 1; }),
    grupo.map(s => humanosNa(s)));
  let N = 1, g = 0, ano = V(0).year, mesma = true, corridas = 0, tempos = [], vivo = null;
  while(V(0).year === ano && g++ < 60){
    if(mundo.fase === 'mercado') for(const s of ['0', '1', '2', '3']) piloto.autoPronto(mundo, s, { codigo, rodada: N, id: 'auto:' + N + ':' + s });
    if(!vivo && mundo.fase === 'temporada' && N > 2) vivo = aoVivo(piloto, mundo, codigo, N);
    const { r, ms } = medir(() => piloto.processar(mundo, N, criarRnd(codigo, N)));
    tempos.push(ms); mundo = r.mundo;
    if(r.resultado.tipo === 'corridas'){
      corridas++;
      const et = r.resultado.etapas.filter(e => grupo.includes(String(e.slot)));
      if(et.length > 1 && !et.every(e => JSON.stringify(e.top) === JSON.stringify(et[0].top))) mesma = false;
    }
    N++;
  }
  checar(`o ano roda (${corridas} rodadas de corrida) e a chegada é a mesma em todos os lados do grupo`, corridas >= 5 && mesma, { corridas, mesma, cal: grupo.map(s => mundo.temporadas[mundo.pilotos[s].chaveTemporada] && mundo.temporadas[mundo.pilotos[s].chaveTemporada].sea.calendar.length) });
  checar(`o ano novo começa para os quatro (${ano} → ${V(0).year}), cada um com temporada e uma só linha ME`,
    ['0', '1', '2', '3'].every(s => { const S = V(s); return S.year === ano + 1 && S.season && S.season.round === 0 && S.season.field.filter(f => f.isMe).length === 1; }),
    ['0', '1', '2', '3'].map(s => { const S = V(s); return [S.year, S.retired, S.season && S.season.round]; }));
  checar('na corrida ao vivo do grupo, cada piloto do grupo é dono do seu carro, e a preparada é a concluída',
    !!vivo && vivo.prep.defs.some(d => grupo.every(s => d.slots.includes(s))) && vivo.conc && !vivo.conc.divergencias.length && !vivo.conc.faltas.length,
    vivo && { defs: vivo.prep.defs.map(d => d.slots), div: vivo.conc && vivo.conc.divergencias });
  const media = Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length);
  console.log(`    tempo por rodada com 4 pilotos: média ${media} ms, máximo ${Math.max(...tempos)} ms`);
}

console.log('\nOito jogadores: o tempo de uma rodada');
{
  const codigo = 'VARIOS03';
  let mc = chefe.iniciar(jogadores(8), { config: { sk: 'f1', ano: 2024, equipes: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7 } }, codigo, anfitriao: 0 });
  const tc = [];
  for(let N = 1; N <= 4; N++){ const { r, ms } = medir(() => chefe.processar(mc, N, criarRnd(codigo, N))); mc = r.mundo; tc.push(ms); }
  const fichas = {}; jogadores(8).forEach((j, i) => { fichas[i] = { nome: j.nome + ' Teste', cc: 'BR', idade: 18 + (i % 3) * 4 }; });
  let mp = piloto.iniciar(jogadores(8), { config: { serie: 'f1', ano: 2024, pilotos: fichas }, codigo, anfitriao: 0 });
  const tp = [];
  for(let N = 1; N <= 4; N++){ const { r, ms } = medir(() => piloto.processar(mp, N, criarRnd(codigo, N))); mp = r.mundo; tp.push(ms); }
  console.log(`    chefe, 8 equipes: ${tc.join(' / ')} ms · piloto, 8 pilotos: ${tp.join(' / ')} ms`);
  checar('com 8 jogadores, nenhuma rodada passa de 20 s no Node (o teto do servidor é 30 s de CPU por pedido)', Math.max(...tc, ...tp) < 20000, { tc, tp });
  checar('as 8 equipes se veem como EU, com 7 outras', ['0', '3', '7'].every(s => vistaChefe(mc, s).mpOutras.length === 7));
}

console.log(falhas ? `\n${falhas} de ${ok + falhas} verificações falharam` : `\nvários jogadores: ${ok} verificações, tudo certo`);
process.exit(falhas ? 1 : 0);
