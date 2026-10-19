/* Roda as verificações do jogo. Uso: node testes/rodar.js  (precisa só do Node)
   Para medir o equilíbrio da simulação (mais lento): node testes/equilibrio.js 15
   Para medir a dificuldade por idade de estreia:     node testes/dificuldade.js 25 classico */
const { spawnSync } = require('child_process');
const path = require('path');
const testes = [
  ['regras do campeonato', 'regras.js'],
  ['mundo de pilotos (2023-2034)', 'mundo.js', ['2023', '2034']],
  ['carreiras jogadas além de 2026', 'carreiras.js', ['5', '2023', '16']],
  ['mercado do piloto', 'mercado.js'],
  ['academias até a categoria principal', 'academias.js'],
  ['nacionalidade na imprensa', 'nacionalidade.js'],
  ['kart regional e nacional no próprio país', 'kart-local.js'],
  ['grid regional com maioria local', 'grid-kart.js'],
  ['português, inglês e espanhol', 'idiomas.js'],
  ['modo chefe (carreiras aleatórias)', 'chefe.js', ['30']],
  ['modo chefe (decisões)', 'chefe-decisoes.js'],
  ['mercado do chefe', 'mercado-chefe.js'],
  ['corrida volta a volta', 'prova.js'],
  ['corrida ao vivo e fim de semana', 'gp.js'],
  ['piloto machucado', 'lesao.js'],
  ['proposta é o campeonato corrido', 'oferta.js'],
  ['acontecimentos durante a temporada', 'eventos.js'],
  ['pilota, F1 Academy e W Series', 'feminino.js'],
  ['clique duplo', 'clique-duplo.js'],
  ['save antigo abre na versão nova', 'migracao.js'],
  ['banco histórico (escadas e grids reais)', 'historico.js'],
  ['save de antes do banco histórico', 'migracao-historico.js'],
  ['tamanho do save', 'save.js']
];
let falhou = 0;
for(const [nome, arq, args] of testes){
  const t0 = Date.now();
  const r = spawnSync(process.execPath, [path.join(__dirname, arq)].concat(args || []), { encoding: 'utf8', maxBuffer: 64e6 });
  const ok = r.status === 0;
  if(!ok) falhou++;
  const linhas = (r.stdout || '').trim().split('\n');
  console.log((ok ? '✓ ' : '✗ ') + nome.padEnd(36) + ((Date.now() - t0) / 1000).toFixed(1).padStart(6) + 's  ' + (ok ? linhas[linhas.length - 1] : ''));
  if(!ok) console.log(linhas.slice(-15).join('\n') + '\n' + (r.stderr || '').slice(0, 2000));
}
console.log(falhou ? '\n' + falhou + ' verificação(ões) falharam' : '\ntudo certo');
process.exitCode = falhou ? 1 : 0;
