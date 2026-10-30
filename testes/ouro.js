/* Rede de segurança para refatorações: carreiras com semente fixa nos dois modos, e a
   impressão digital (hash) do save no fim. Antes de mexer no motor, grave as impressões;
   depois, confira: no single-player, a mesma semente tem de dar exatamente o mesmo save.
   Não entra em testes/rodar.js: qualquer mudança de regra muda as impressões de propósito.
   Uso: node testes/ouro.js --gravar   (antes)   ·   node testes/ouro.js   (depois) */
'use strict';
const H = require('./base');
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ARQ = path.join(__dirname, 'fixtures', 'ouro.json');
const hash = s => crypto.createHash('sha256').update(s).digest('hex').slice(0, 16);

const CHEFE = [
  ['F1 2024, equipe do meio', 'f1', 2024, 4], ['F1 2019, equipe de trás', 'f1', 2019, 8], ['F1 1995, equipe da frente', 'f1', 1995, 1],
  ['IndyCar 2015', 'indy', 2015, 3], ['WEC 2019', 'wec', 2019, 2], ['F1 2026, equipe nova no futuro', 'f1', 2026, 6]
];
const PILOTO = [[7, 2024, 17, 'f1'], [5, 1988, 18, 'f1'], [7, 2015, 16, 'indy']];

function chefe(seed, sk, ano, pos){
  const J = H.carregar({ silencioso: true, seed });
  J.run(require('./chefe-comum'));
  J.run(`(() => { const l = eraOfSeries(${ano}, '${sk}').teams.map((t, i) => [i, Engine.resolveTeam(t, i, ${ano}, '${sk}')]).filter(x => x[1]).sort((a, b) => b[1].str - a[1].str);
    Chefe.novo({ chefe:{ nome:'Ouro', cc:'BR' }, realismo:true, modo:'assumir', sk:'${sk}', ano:${ano}, idx:l[Math.min(l.length - 1, ${pos})][0] });
    for(let k = 0; k < 2; k++){ __inverno(); __temporada(); UI.limparFila(); UI.close(); if(k === 0) Chefe.proximoAno(); }
  })()`);
  return J.run('JSON.stringify(C)');
}
/* uma temporada de chefe com todas as corridas pelo motor ao vivo (Gp), como a transmissão */
function chefeAoVivo(seed){
  const J = H.carregar({ silencioso: true, seed });
  J.run(require('./chefe-comum'));
  J.run(`(() => { Cenario.iniciar('brawn09', { nome:'Ouro', cc:'BR' }); Chefe.comecarTemporada(); UI.limparFila(); UI.close();
    const sea = C.temporada;
    while(sea.round < sea.calendar.length){
      Chefe.gridDaEtapa(sea); const M = Chefe.montar();
      const R = Gp.criar(Gp.entrada(sea, M, Chefe.sk(), sea.ano, f => f.teamId === 'EU', { gestao: true }));
      while(!R.fim){ if(R.pergunta) Gp.responder(R, 0); Gp.passo(R); }
      const res = Gp.resultado(R); const rec = Chefe.correr({ montagem: M, finish: Gp.chegada(M, res), flId: res.flId, sc: res.sc }); delete rec.tl;
    }
    Chefe.fimDeTemporada(); UI.limparFila(); UI.close(); })()`);
  return J.run('JSON.stringify(C)');
}
function piloto(seed, era, ano, idade, serie){
  const J = H.carregar({ silencioso: true, seed });
  H.novaCarreira(J, { era, ano, idade, serie, nome: 'Ouro' });
  for(let k = 0; k < 3; k++) H.temporada(J);
  return J.run('JSON.stringify(S)');
}

const atual = {};
CHEFE.forEach(([nome, sk, ano, pos], i) => { for(const seed of [1, 2]) atual['chefe · ' + nome + ' · semente ' + seed] = hash(chefe(seed + i * 10, sk, ano, pos)); });
atual['chefe · Brawn 2009 com as corridas ao vivo · semente 5'] = hash(chefeAoVivo(5));
PILOTO.forEach(([era, ano, idade, serie], i) => { atual[`piloto · ${serie} ${ano} · semente ${i + 1}`] = hash(piloto(i + 1, era, ano, idade, serie)); });

if(process.argv.includes('--gravar')){
  fs.writeFileSync(ARQ, JSON.stringify(atual, null, 1) + '\n');
  console.log('impressões gravadas em testes/fixtures/ouro.json: ' + Object.keys(atual).length + ' carreiras');
} else {
  const antes = JSON.parse(fs.readFileSync(ARQ, 'utf8'));
  let falhas = 0;
  for(const k of Object.keys(antes)){
    const ok = antes[k] === atual[k];
    if(!ok) falhas++;
    console.log((ok ? '  ✓ ' : '  ✗ ') + k + (ok ? '' : ` (antes ${antes[k]}, agora ${atual[k]})`));
  }
  console.log(falhas ? `\n${falhas} carreira(s) mudaram` : `\nimpressões iguais: ${Object.keys(antes).length} carreiras idênticas`);
  process.exit(falhas ? 1 : 0);
}
