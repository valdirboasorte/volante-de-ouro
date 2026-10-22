/* Roda as verificações do jogo. Uso: node testes/rodar.js  (precisa só do Node)
   Para medir o equilíbrio da simulação (mais lento): node testes/equilibrio.js 15
   Para medir a dificuldade por idade de estreia:     node testes/dificuldade.js 25 classico */
const { spawnSync } = require('child_process');
const path = require('path');
const testes = [
  ['SEO e identidade', 'presenca-web.js'],
  ['preferência e controles de animação', 'movimento.js'],
  ['configuração da migração de domínio', 'dominio.js'],
  ['verificador HTTP da migração', 'verificador-dominio.js'],
  ['recuperação do progresso antigo', 'recuperacao-progresso.js'],
  ['regras do campeonato', 'regras.js'],
  ['mundo de pilotos (2023-2034)', 'mundo.js', ['2023', '2034']],
  ['carreiras jogadas além de 2026', 'carreiras.js', ['5', '2023', '16']],
  ['mercado do piloto', 'mercado.js'],
  ['academias até a categoria principal', 'academias.js'],
  ['porta da principal, reserva e substituições', 'mercado-topo.js'],
  ['estatísticas e rankings por categoria', 'estatisticas.js'],
  ['bens de luxo coerentes com a idade', 'luxo.js'],
  ['apoiar o projeto (doação)', 'doacao.js'],
  ['pneu de largada e depois de um toque', 'pneus.js'],
  ['relações com contexto e memória', 'relacoes.js'],
  ['regulamento do fim de semana', 'regulamento.js'],
  ['resultados com estados explícitos', 'resultados.js'],
  ['safety car agrupa o pelotão', 'safety-car.js'],
  ['idade e caminho de entrada por época', 'entrada-epoca.js'],
  ['nacionalidade na imprensa', 'nacionalidade.js'],
  ['kart regional e nacional no próprio país', 'kart-local.js'],
  ['grid regional com maioria local', 'grid-kart.js'],
  ['português, inglês, espanhol e japonês', 'idiomas.js'],
  ['tradução durante as carreiras e corridas', 'idiomas-cobertura.js'],
  ['tradução das telas novas', 'idiomas-novidades.js'],
  ['tradução do chefe e sessões ao vivo', 'idiomas-chefe.js'],
  ['modo chefe (carreiras aleatórias)', 'chefe.js', ['30']],
  ['modo chefe nas sete séries', 'chefe-series.js', ['3']],
  ['classificação do chefe e preparação da largada', 'chefe-quali.js'],
  ['cenários do modo chefe', 'chefe-cenarios.js'],
  ['reserva de equipe grande e categoria menor', 'reserva-dupla.js'],
  ['pneu no limite estoura quando acabar', 'pneu-limite.js'],
  ['velocidade da transmissão ao vivo', 'velocidade-aovivo.js'],
  ['motor com o muro gerenciando', 'gestao-corrida.js'],
  ['largada pelas luzes', 'largada.js'],
  ['peças do carro e acerto', 'pecas-chefe.js'],
  ['treino e classificação ao vivo', 'sessao-ao-vivo.js'],
  ['escalações reais da F1 e da IndyCar', 'escalacoes-reais.js'],
  ['treinos do chefe e versão do save', 'treinos-chefe.js'],
  ['administração do chefe', 'administracao-chefe.js'],
  ['rivais com gestão própria', 'ia-chefe.js'],
  ['dificuldade da carreira', 'dificuldade-nivel.js'],
  ['maiores da história com títulos reais de antes', 'lendas-save.js'],
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
  ['vários jogos salvos', 'saves.js'],
  ['evolução, decisões e save do piloto', 'progresso-piloto.js'],
  ['evolução em cenários e dificuldades', 'evolucao-cenarios.js'],
  ['superlicença pela tabela real de cada ano', 'superlicenca.js'],
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
