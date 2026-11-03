/* As 7 séries do jogo no multiplayer, sem servidor: o motor do jogo no Node.
   Para cada série, uma sala de chefe com 3 jogadores (2 dividindo a equipe do anfitrião) e uma de
   piloto com 3 pilotos (dois da mesma idade) jogam o começo do ano: o inverno, algumas corridas,
   e a chegada é a mesma para todos os lados; e a corrida ao vivo preparada é a concluída.
   Uso: node testes/series-mp.mjs [serie...]   (gere o motor antes: node ferramentas/gerar-motor.mjs) */
import { criarMotor } from '../src/gerado/motor-jogo.js';
import { ambienteFalso } from '../src/pagina-falsa.js';
import { criarRnd } from '../src/aleatorio.js';
import { criarRegrasChefe } from '../src/regras-chefe.js';
import { criarRegrasPiloto } from '../src/regras-piloto.js';
import { perspectiva as vistaChefe } from '../src/chefe-mp.js';
import { perspectiva as vistaPiloto } from '../src/piloto-mp.js';
import { ligarCorridas, desligarCorridas } from '../src/corrida-mp.js';

let ok = 0, falhas = 0;
const checar = (nome, cond, detalhe) => { if(cond){ ok++; console.log('  ✓ ' + nome); } else { falhas++; console.log('  ✗ ' + nome + (detalhe === undefined ? '' : ' — ' + JSON.stringify(detalhe).slice(0, 500))); } return !!cond; };
const amb = ambienteFalso({ seed: 21 }); const J = criarMotor(amb); J.amb = amb; J.Saves.auto = false;
const chefe = criarRegrasChefe(() => J), piloto = criarRegrasPiloto(() => J);
const jogadores = n => Array.from({ length: n }, (_, i) => ({ slot: i, nome: ['Ana', 'Bia', 'Caio'][i] }));
const ANO = 2024;
const pedidas = process.argv.slice(2);
const SERIES = (pedidas.length ? pedidas : J.SERIES_KEYS);

function aoVivo(regras, mundo, codigo, N){
  const passada = (modo, res) => { const ctl = ligarCorridas(J, modo, res); try { regras.processar(structuredClone(mundo), N, criarRnd(codigo, N)); return ctl; } finally { desligarCorridas(J); } };
  const prep = passada('preparar'), res = {};
  for(const d of prep.defs){ const R = J.Gp.criar(structuredClone(d.ent)); J.Gp.terminar(R); res[d.chave] = { ent: d.ent, res: J.Gp.resultado(R), notas: {} }; }
  return { prep, conc: prep.defs.length ? passada('concluir', res) : null };
}
/* a equipe mais forte e a quinta da série no ano, como o lobby oferece */
function equipesDa(sk){
  const era = J.eraOfSeries(ANO, sk);
  return era.teams.map((t, i) => [i, J.Engine.resolveTeam(t, i, ANO, sk)]).filter(x => x[1]).sort((a, b) => b[1].str - a[1].str).map(x => x[0]);
}

for(const sk of SERIES){
  console.log(`\n${J.SERIES[sk] ? J.SERIES[sk].name : sk} (${sk})`);
  /* chefe */
  try{
    const ids = equipesDa(sk), codigo = 'SERIE' + sk.toUpperCase();
    let mundo = chefe.iniciar(jogadores(3), { config: { sk, ano: ANO, equipes: { 0: ids[0], 1: ids[0], 2: ids[Math.min(4, ids.length - 1)] } }, codigo, anfitriao: 0 });
    let N = 1, corridas = 0, iguais = true, vivo = null;
    for(; N <= 6; N++){
      if(!vivo && mundo.base.fase === 'temporada' && corridas >= 1) vivo = aoVivo(chefe, mundo, codigo, N);
      const r = chefe.processar(mundo, N, criarRnd(codigo, N)); mundo = r.mundo;
      if(r.resultado.tipo === 'corrida'){
        corridas++;
        const base = mundo.base.temporada.cstand || {}, pts = s => (vistaChefe(mundo, String(s)).temporada.cstand || {}).EU || 0;
        if(!(pts(0) === (base.EU || 0) && pts(2) === (base.EU2 || 0))) iguais = false;
      }
    }
    checar(`chefe: 3 jogadores, ${corridas} corridas, os pontos batem entre os lados`, corridas >= 3 && iguais, { corridas, iguais, fase: mundo.base.fase });
    checar('chefe: a corrida ao vivo preparada é a concluída', !!vivo && vivo.prep.defs.length >= 1 && !!vivo.conc && !vivo.conc.divergencias.length && !vivo.conc.faltas.length,
      vivo && { defs: vivo.prep.defs.length, div: vivo.conc && vivo.conc.divergencias });
  }catch(e){ checar('chefe: roda sem erro', false, String(e && e.stack || e).slice(0, 400)); }
  /* piloto */
  try{
    const codigo = 'PILOTO' + sk.toUpperCase();
    const fichas = { 0: { nome: 'Ana Serie', cc: 'BR', idade: 22 }, 1: { nome: 'Bia Serie', cc: 'PT', idade: 22 }, 2: { nome: 'Caio Serie', cc: 'AR', idade: 17 } };
    let mundo = piloto.iniciar(jogadores(3), { config: { serie: sk, ano: ANO, pilotos: fichas }, codigo, anfitriao: 0 });
    let N = 1, corridas = 0, mesma = true, vivo = null;
    for(; N <= 5; N++){
      if(mundo.fase === 'mercado') for(const s of ['0', '1', '2']) piloto.autoPronto(mundo, s, { codigo, rodada: N, id: 'a' + N + s });
      if(!vivo && mundo.fase === 'temporada' && N > 1) vivo = aoVivo(piloto, mundo, codigo, N);
      const r = piloto.processar(mundo, N, criarRnd(codigo, N)); mundo = r.mundo;
      if(r.resultado.tipo === 'corridas'){
        corridas++;
        const porChave = {};
        for(const e of r.resultado.etapas){ const c = mundo.pilotos[String(e.slot)].chaveTemporada; (porChave[c] = porChave[c] || []).push(JSON.stringify(e.top)); }
        if(Object.values(porChave).some(l => l.some(x => x !== l[0]))) mesma = false;
      }
    }
    const S = s => vistaPiloto(mundo, String(s));
    checar(`piloto: 3 pilotos (${['0', '1', '2'].map(s => S(s).season && S(s).season.cat).join(' / ')}), ${corridas} rodadas, a mesma chegada em cada categoria`,
      corridas >= 3 && mesma && ['0', '1', '2'].every(s => S(s).season && S(s).season.field.filter(f => f.isMe).length === 1), { corridas, mesma });
    checar('piloto: a corrida ao vivo preparada é a concluída', !!vivo && vivo.prep.defs.length >= 1 && !!vivo.conc && !vivo.conc.divergencias.length && !vivo.conc.faltas.length,
      vivo && { defs: vivo.prep.defs.length, div: vivo.conc && vivo.conc.divergencias });
  }catch(e){ checar('piloto: roda sem erro', false, String(e && e.stack || e).slice(0, 400)); }
}

console.log(falhas ? `\n${falhas} de ${ok + falhas} verificações falharam` : `\nséries: ${ok} verificações, tudo certo`);
process.exit(falhas ? 1 : 0);
