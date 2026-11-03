/* Começar na base, com campeonatos separados (chefe), sem servidor: o motor do jogo no Node.
   - Uma sala com 3 equipes: a Ana assume uma equipe da categoria principal; a Bia e o Caio fundam
     equipes na mesma categoria de acesso. Cada categoria tem o seu campeonato: a Bia e o Caio se
     veem no grid (EU2), a equipe da Ana fica de fora do grid deles (mas os pilotos dela não estão à
     venda para eles), e os pontos batem dentro de cada categoria.
   - As temporadas, de tamanhos diferentes, acabam na mesma rodada da sala; o ano novo chega para
     todos, e a corrida ao vivo de uma rodada tem uma corrida por categoria (a preparada é a concluída).
   - Quem sobe de categoria muda de campeonato no começo da temporada seguinte.
   Uso: node testes/base-mp.mjs   (gere o motor antes: node ferramentas/gerar-motor.mjs) */
import { criarMotor } from '../src/gerado/motor-jogo.js';
import { ambienteFalso } from '../src/pagina-falsa.js';
import { criarRnd } from '../src/aleatorio.js';
import { criarRegrasChefe } from '../src/regras-chefe.js';
import { perspectiva, gruposDe, doGrupo, temporadaDo, grupoDe, agir } from '../src/chefe-mp.js';
import { ligarCorridas, desligarCorridas } from '../src/corrida-mp.js';

let ok = 0, falhas = 0;
const checar = (nome, cond, detalhe) => { if(cond){ ok++; console.log('  ✓ ' + nome); } else { falhas++; console.log('  ✗ ' + nome + (detalhe === undefined ? '' : ' — ' + JSON.stringify(detalhe).slice(0, 500))); } return !!cond; };
const amb = ambienteFalso({ seed: 31 }); const J = criarMotor(amb); J.amb = amb; J.Saves.auto = false;
const regras = criarRegrasChefe(() => J);
const ANO = 2024, codigo = 'BASEMP01';
const escada = J.Chefe.escadaBase(ANO, 'BR');
const cat0 = escada[0], cat1 = escada[1];
console.log(`\nA escada da F1 em ${ANO}: ${escada.join(' → ')}`);

const lista = J.eraOfSeries(ANO, 'f1').teams.map((t, i) => [i, J.Engine.resolveTeam(t, i, ANO, 'f1')]).filter(x => x[1]);
const config = { sk: 'f1', ano: ANO, equipes: { 0: lista[2][0], 1: 'n1', 2: 'n2' },
  fundadas: { 1: { nome: 'Bia Junior', cor: J.UIC.CORES[3], cc: 'BR', fin: 'investidor', base: cat0 }, 2: { nome: 'Caio Junior', cor: J.UIC.CORES[5], cc: 'BR', fin: 'proprio', base: cat0 } } };
let mundo = regras.iniciar([{ slot: 0, nome: 'Ana' }, { slot: 1, nome: 'Bia' }, { slot: 2, nome: 'Caio' }], { config, codigo, anfitriao: 0 });
const V = s => perspectiva(mundo, String(s));

console.log('\nTrês equipes, duas categorias');
checar(`dois campeonatos: ${gruposDe(mundo).join(' e ')}; a Bia e o Caio no mesmo`, gruposDe(mundo).length === 2 && grupoDe(mundo, '1') === grupoDe(mundo, '2') && grupoDe(mundo, '0') !== grupoDe(mundo, '1') && V(1).cat === cat0,
  { grupos: gruposDe(mundo), cats: [V(0).cat, V(1).cat, V(2).cat] });
let N = 1;
mundo = regras.processar(mundo, N, criarRnd(codigo, N)).mundo; N++;   // o inverno: as temporadas montadas
const daqui = s => V(s).temporada.teams.filter(t => t.nossa || t.humana).map(t => t.id + ':' + t.name).sort();
checar('cada um vê só a sua categoria: a Bia vê o Caio como EU2 no grid; a equipe da Ana não está no grid deles',
  V(1).temporada.cat === cat0 && V(0).temporada.isTop && daqui(1).join() === ['EU:Bia Junior', 'EU2:Caio Junior'].sort().join() && daqui(0).length === 1
  && !V(1).temporada.teams.some(t => t.name === V(0).eq.nome), { b: daqui(1), a: daqui(0), catB: V(1).temporada.cat });
checar('os pilotos da Ana estão reservados para a Bia (a equipe dela vem fora do grid)', V(1).mpOutras.some(o => o.fora && o.nome === V(0).eq.nome && o.reservados.length > 0),
  V(1).mpOutras.map(o => [o.id, o.fora, o.nome]));

console.log('\nO ano inteiro');
let vivo = null, corridas = 0, iguais = true, g = 0;
const anoAntes = mundo.base.ano;
while(mundo.base.ano === anoAntes && g++ < 60){
  /* a corrida ao vivo numa rodada em que as duas categorias correm (a da base anda pela fração do calendário) */
  if((!vivo || vivo.prep.defs.length < 2) && mundo.base.fase === 'temporada' && corridas >= 1){
    const passada = (modo, res) => { const ctl = ligarCorridas(J, modo, res); try { regras.processar(structuredClone(mundo), N, criarRnd(codigo, N)); return ctl; } finally { desligarCorridas(J); } };
    const prep = passada('preparar'), res = {};
    for(const d of prep.defs){ const R = J.Gp.criar(structuredClone(d.ent)); J.Gp.terminar(R); res[d.chave] = { ent: d.ent, res: J.Gp.resultado(R), notas: {} }; }
    vivo = { prep, conc: passada('concluir', res) };
  }
  const r = regras.processar(mundo, N, criarRnd(codigo, N)); mundo = r.mundo; N++;
  if(r.resultado.tipo === 'corrida'){
    corridas++;
    for(const cat of gruposDe(mundo)){
      const base = temporadaDo(mundo, cat).cstand || {};
      for(const k of doGrupo(mundo, cat)){ const id = mundo.grupos[cat].ids[k], pts = (V(k).temporada.cstand || {}).EU || 0; if(pts !== (base[id] || 0)) iguais = false; }
    }
  }
}
checar(`as duas categorias correm o ano (${corridas} rodadas de corrida) e o ano novo chega para todos (${anoAntes} → ${mundo.base.ano})`, corridas >= 10 && mundo.base.ano === anoAntes + 1, { corridas, ano: mundo.base.ano, fase: mundo.base.fase });
checar('a cada rodada, os pontos de cada equipe batem com o campeonato da categoria dela', iguais);
checar('a corrida ao vivo de uma rodada tem uma corrida por categoria, e a preparada é a concluída',
  !!vivo && vivo.prep.defs.length === 2 && !vivo.conc.divergencias.length && !vivo.conc.faltas.length,
  vivo && { defs: vivo.prep.defs.map(d => d.slots), div: vivo.conc.divergencias, faltas: vivo.conc.faltas });

console.log('\nSubir de categoria');
/* a Bia aceita subir (forçado aqui: a oferta depende do resultado do ano) */
agir(J, mundo, '1', (J, C) => { C.cat = cat1; });
mundo = regras.processar(mundo, N, criarRnd(codigo, N)).mundo; N++;
checar(`no começo da temporada a Bia está no campeonato da ${cat1}, sozinha, e o Caio segue na ${cat0}`,
  grupoDe(mundo, '1') === cat1 && grupoDe(mundo, '2') === cat0 && V(1).temporada && V(1).temporada.cat === cat1 && V(2).temporada.cat === cat0
  && daqui(1).join() === 'EU:Bia Junior' && daqui(2).join() === 'EU:Caio Junior', { g1: grupoDe(mundo, '1'), g2: grupoDe(mundo, '2'), b: daqui(1), c: daqui(2), fase: mundo.base.fase });
const vistas = new Set();
for(let i = 0; i < 8; i++){ const r2 = regras.processar(mundo, N, criarRnd(codigo, N)); mundo = r2.mundo; N++; (r2.resultado.etapas || [{ cat: grupoDe(mundo, '0') }]).forEach(e => vistas.add(e.cat)); }
checar(`e as rodadas seguintes correm nas três categorias (${[...vistas].join(', ')})`, vistas.size === 3, [...vistas]);

console.log(falhas ? `\n${falhas} de ${ok + falhas} verificações falharam` : `\nbase: ${ok} verificações, tudo certo`);
process.exit(falhas ? 1 : 0);
