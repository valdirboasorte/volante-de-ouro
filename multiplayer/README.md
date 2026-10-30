# Multiplayer do Volante de Ouro (em construção)

O servidor das partidas com amigos: um Worker da Cloudflare na frente e um Durable
Object (`Sala`) por partida, com o motor do jogo rodando sem tela. O servidor é a
autoridade: os navegadores mandam pedidos e mostram o que ele responde.

**Nada disso está publicado.** Roda só no seu computador com `wrangler dev`. Publicar
exige o plano Workers Paid (o motor não cabe nos 10 ms de CPU do plano gratuito) e a
sua autorização.

## Fases

| Fase | O quê | Situação |
|---|---|---|
| 1 | Motor no servidor (viabilidade), salas, código de convite, conexão e reconexão | feita |
| 2 | Rodadas: pronto, espera, processamento único (com regras de teste) | feita |
| 3 | Modo chefe com duas equipes humanas | feita (local; as corridas ainda pelo caminho rápido) |
| 4 | Modo piloto com dois pilotos humanos | feita (local; as corridas ainda pelo caminho rápido) |
| 5 | Corridas ao vivo no servidor | a fazer |
| 6 | Robustez e testes com dois aparelhos | a fazer |

## Rodar

```bash
cd multiplayer
npm install          # só o wrangler, para desenvolvimento
npm run dev          # gera o motor e sobe em http://127.0.0.1:8787
npm run testes       # sobe um servidor de teste próprio e confere as salas
```

O jogo servido em `http://127.0.0.1:4338` (configuração `volante-main`) mostra o botão
**Multiplayer** na abertura. O servidor também sobe pela configuração `volante-mp` do
`.claude/launch.json`. Para dois jogadores no mesmo navegador, abra cada aba com um
perfil (`?mpperfil=ana`, `?mpperfil=bia`): cada perfil usa a sua ficha.

## O que foi testado na Fase 1

- **`npm run testes`: 51 verificações, todas passando.**
  - criar e entrar;
  - erros de versão, nome, código e corpo;
  - WebSocket com e sem ficha;
  - configuração só do anfitrião;
  - mensagens inválidas e grandes demais;
  - a mesma vaga em outro socket;
  - reconexão;
  - origem fora da lista;
  - limites de mensagens e de criação;
  - sair e passar a vez de anfitrião;
  - três entradas ao mesmo tempo (uma vaga, duas recusas);
  - aviso ao anfitrião quando alguém entra;
  - reinício do servidor com o mesmo armazenamento;
  - o hash da corrida igual no Node e no workerd.
- **No navegador, com duas abas (Ana anfitriã e Bia convidada):**
  - criar pela tela e entrar digitando o código em minúsculas e com hífen;
  - as duas se veem conectadas;
  - a velocidade escolhida pelo anfitrião chega na hora para a outra;
  - fechar e reabrir a aba volta sozinho para a mesma vaga, e a outra vê "desconectado" e depois "conectado";
  - derrubar e subir o servidor faz as duas voltarem sozinhas, com tudo igual;
  - a mesma vaga aberta numa segunda aba faz a primeira mostrar "aberta em outra aba", com o botão "Usar nesta aba" para pegar de volta.

## O que foi testado na Fase 2

- **`npm run testes`: 98 verificações (51 das salas, 47 dos turnos), todas passando.** Os
  turnos rodam contra o wrangler dev de verdade, antes e depois de derrubá-lo:
  - iniciar (anfitrião, estado, jogadores, entrar depois de começar);
  - ação secreta: o plano do rival nunca chega ao outro (nem na sala, nem na vista);
  - erros de dados, tipo e rodada; ação repetida com o mesmo id aplicada uma vez;
  - pronto, cancelar, esperar e processar uma vez só, igual para os dois;
  - rajada de 12 `pronto` ao mesmo tempo: rodada processada uma vez;
  - pedidos de rodada velha, reconexão com pronto guardado, resultado igual ao das regras no Node;
  - falha no processamento com nova tentativa depois de 1,5 s, processando uma vez;
  - reinício do servidor: partida, prontos, planos e pontos intactos, e uma rodada que ficou
    travada em `processing` (falha mais queda) é terminada uma vez só.
- Os testes criam suas salas com um `CF-Connecting-IP` próprio, para não gastar o limite de
  criação das outras verificações (na Cloudflare de verdade esse cabeçalho vem do servidor).
- **No navegador, com as duas abas:**
  - a anfitriã inicia a partida e as duas abrem a rodada 1;
  - a Ana escolhe 7 e a Bia vê "O adversário já decidiu", sem o número chegar a ela;
  - a Ana confirma com clique duplo: conta uma vez, a rodada fica em 1, os números dela
    travam e a Bia vê "O adversário já está pronto";
  - a conexão da Ana cai e volta com ela ainda pronta e com o 7 guardado;
  - a Bia escolhe 3 e confirma (clique duplo de novo): a rodada é processada uma vez e as
    duas veem o mesmo resultado (7+5=12 e 3+2=5);
  - "Voltar ao gerenciamento" abre a rodada 2 com o placar mantido.

- **Ainda não testado:** dois aparelhos diferentes e a rede de verdade (só faz sentido com
  o servidor publicado).

Sempre que o `index.html` mudar, o motor precisa ser gerado de novo
(`npm run motor`, que o `npm run dev` já faz). Página e servidor conferem a mesma versão
do jogo: o hash dos blocos `<script>` sem atributo. Se não baterem, a sala recusa a
entrada e pede para recarregar a página.

## Duas equipes no motor (Fase 3)

O jogo só conhece uma equipe humana, a `'EU'`. Em vez de reescrevê-lo, `src/chefe-mp.js`
guarda duas coisas separadas:
- **o mundo:** a temporada, o registro de pilotos, a IA e o mercado;
- **um pacote por equipe:** caixa, carro, pilotos, patrocínios, decisões e as partes da temporada
  e do inverno que são dela.

Para agir por uma equipe, ele monta a perspectiva dela: o mundo com o pacote dela, em que ela é
a `'EU'` e a outra aparece como `'EU2'`. O anfitrião guarda o mundo com os ids dele, e o
convidado vê os ids trocados.

- **Viradas de fase** (começo e fim de temporada, ano novo): rodam primeiro do lado do
  anfitrião, que decide o mundo. Depois rodam do lado do convidado, sobre a foto de antes, e
  dali só sai o que é dele.
- **Corrida:** a classificação roda uma vez, com cada carro humano avaliado pela própria equipe
  (acerto, peças, modo de motor, moral). Os dois lados montam o domingo, e a montagem mesclada
  corre uma vez. A mesma chegada é aplicada depois à economia do convidado.
- **Ganchos no `index.html`**, todos inertes no single-player:
  - a equipe humana de fora (`C.mpOutras`) entra na temporada com a força e os carros dela;
  - os pilotos dela não correm por ninguém mais nem aparecem no mercado;
  - a IA não mexe nela;
  - `Chefe.correr` aceita uma montagem pronta e devolve a chegada fora do save;
  - o contador de ids do convidado começa em 500000.
- **Prova de que o single-player não mudou:** `node testes/ouro.js` (na raiz) roda 16 carreiras
  com semente fixa nos dois modos, uma delas com todas as corridas ao vivo, e compara a
  impressão digital do save. Elas deram idênticas antes e depois de cada gancho.
- **Na tela do chefe:** cada decisão passa por `UIC.mp(tipo, dados, depois)`, vai para o servidor,
  e a resposta só aparece quando a equipe atualizada volta. Nada é salvo no aparelho
  (`UIC.salvar` não grava no multiplayer). Os botões de virada (começar a temporada, seguir
  para a classificação, largar, seguir depois do balanço) viram "pronto".

**Ainda de fora no multiplayer:**
- A corrida e a classificação ao vivo, que chegam na Fase 5. Por enquanto elas rodam pelo
  caminho rápido no servidor.
- O treino ao vivo, "simular o resto" e a ordem de equipe, que só valeria para um dos lados.
- Subir de categoria, convites de outras séries e investidores.
- Demissão e fim de carreira. Fechar a equipe numa falência é recusado.

## O que foi testado na Fase 3

- **`node testes/chefe-mp.mjs`: 24 verificações, todas passando.** São duas equipes reais de 2024
  (Mercedes e Haas) por duas temporadas inteiras, sem servidor. Em todas as 48 etapas:
  - dois carros de cada humana e ninguém repetido;
  - construtores e vencedores iguais dos dois lados;
  - cada equipe com os seus resultados, e os pontos batendo com a tabela;
  - o mercado único;
  - balanço e ano novo para as duas;
  - nenhuma chave do save sem dono.
- **`npm run testes`: 137 a 140 verificações, conforme os acontecimentos sorteados, todas
  passando.** Incluem a sala de chefe por WebSocket:
  - configuração e escolha de equipes;
  - dados privados que não vazam;
  - ações do inverno, contraproposta e mercado único;
  - pendências que bloqueiam o pronto;
  - começo da temporada e três corridas idênticas para os dois;
  - o reinício do servidor no meio da temporada, com a etapa seguinte processada uma vez.
- **No navegador, com duas abas (Carla na Williams, Davi na RB, F1 2024):**
  - escolher a equipe bloqueia a mesma para o outro;
  - a tela do chefe abre com a equipe de cada um e a barra da partida;
  - mudar o plano do carro só vale depois que o servidor responde, e não mexe na RB;
  - "Começar a temporada" vira pronto, e os dois veem os testes de pré-temporada com a meta de
    cada diretoria;
  - decisões do fim de semana e "seguir para a classificação" viram pronto;
  - o GP do Bahrein é processado uma vez, com o mesmo vencedor e a mesma pole nas duas telas.
    Cada um vê os seus pilotos e o seu caixa, e a tabela de construtores bate dos dois lados;
  - o save do modo chefe guardado no navegador continua intacto.

## Dois pilotos no motor (Fase 4)

O jogo só conhece um piloto humano, o `'ME'`. `src/piloto-mp.js` separa:
- **o mundo:** o registro de pilotos de cada série (`mundos`, `gridMem`…) e uma temporada por
  categoria em que há um humano;
- **a carreira de cada piloto:** ficha, contrato, dinheiro e histórico, mais a parte pessoal da
  temporada (resultados, acerto, fim de semana, forma do ano).

Para agir por um piloto, ele monta a perspectiva dele: a carreira dele com a temporada da
categoria dele, em que ele é o `'ME'` e o outro humano, se correr ali, é o `'ME2'`.

- **Mesma idade:** os dois começam na mesma categoria e dividem uma temporada só, cada um na
  sua equipe.
- **Categorias diferentes:** cada um na sua temporada. A rodada da sala anda pelo calendário
  mais longo, e o mais curto corre quando chega a vez dele. Uma categoria de 7 etapas fica de
  fora em 2 das 9 rodadas, e quem não correu fica sabendo por um aviso.
- **Corrida dividida:** a classificação e o domingo do convidado são calculados do lado dele
  (acerto, forma, ficha). Eles entram como uma linha fixa na corrida do anfitrião, que roda uma
  vez. A mesma chegada é aplicada depois à carreira do convidado.
- **Fim do ano:** cada um tem o seu balanço, e a temporada dividida entra no registro do mundo
  uma vez só. Nenhum dos humanos vira piloto da IA. Depois vêm a academia e as propostas, e o
  ano novo começa com a proposta que cada um escolheu.
- **Ganchos no `index.html`**, todos inertes no single-player:
  - o outro humano (`S.mpOutros`) ganha vaga e carro na temporada e nunca é escalado pela IA;
  - `montarCorrida` aceita linhas prontas (`mpLinhas`) e grava a do jogador (`mpGravar`);
  - `runRace` aceita uma chegada pronta;
  - `startSeason`, `takeOffer` e `endSeason` aceitam rodar sem montar a temporada nem
    registrar o ano (`mpTemporada`, `mpSemTemporada`, `mpSemRegistro`);
  - a forma do ano saiu de dentro de `montarCorrida` para `Engine.formaDoAno`.
- **Prova de que o single-player não mudou:** `node testes/ouro.js` deu as 16 carreiras
  idênticas depois de cada gancho.
- **Na tela da carreira:** cada decisão passa por `Game.mp(tipo, dados, depois)` e só aparece
  quando a carreira atualizada volta do servidor. Nada é salvo no aparelho.
  - "Correr" abre o acerto, e o botão dele vira "Pronto para a corrida".
  - Machucado ou sem carro na etapa, "Correr" só deixa você pronto.
  - A pré-temporada é resolvida no servidor, como no modo rápido. O resumo dela aparece uma vez
    por ano, porque explica uma lesão ou uma moral baixa antes da primeira corrida.
  - O balanço do ano é a mesma tela do jogo solo, e escolher a proposta deixa você pronto.
  - Os botões de simular, dificuldade, modo rápido, pré-temporada e salvar somem.
  - O que o servidor ainda não aplica mostra "Indisponível no multiplayer por enquanto.": eventos,
    conversas, empresário, rival, negociação, reserva, convocações e aposentadoria.

**Ainda de fora no multiplayer:**
- A corrida e a classificação ao vivo, que chegam na Fase 5. A classificação na mão também
  fica de fora: o fim de semana é o acerto.
- Acontecimentos fora da pista, dilemas, pedidos, conversas, convocações e corridas paralelas.
- Propostas de outra série e de dupla (reserva + titular), que são recusadas.
- O modo de carreira é sempre o clássico, sem finanças. No realista, ficar sem dinheiro poderia
  encerrar a carreira e travar a sala.
- **Lesão numa temporada dividida:** se o anfitrião se machuca, o reserva corre no carro dele,
  como no jogo solo. Se o convidado se machuca, o carro dele fica parado.
- **Sem caminho testado (fica para a Fase 6):**
  - um piloto que se aposenta ou morre num acidente: o pronto dele é recusado (`carreira`), e a
    sala para;
  - um piloto sem nenhuma proposta que possa escolher.

## O que foi testado na Fase 4

- **`node testes/piloto-mp.mjs`: 48 verificações, todas passando.** Sem servidor, duas
  variantes de dois anos cada: a mesma categoria (os dois com 20 anos) e categorias diferentes
  (16 e 21). Em todas as rodadas:
  - as duas visões batem: etapa, pontos, chegada e histórico;
  - ninguém aparece repetido no grid;
  - os pontos de cada um batem com a tabela;
  - os dois humanos ficam fora do registro da IA;
  - balanço, tela de balanço, propostas e ano novo funcionam para os dois.
- **`npm run testes`: 166 verificações, todas passando.** Incluem a sala de piloto por
  WebSocket:
  - a escolha dos pilotos;
  - ações que mudam só quem agiu, inclusive "deixar com o engenheiro";
  - valores inválidos e ação na fase errada;
  - dados privados que não vazam;
  - dedupe;
  - corridas idênticas para os dois;
  - categorias diferentes (Mundial de Kart e Fórmula Regional) andando juntas até o fim do ano;
  - as propostas de cada um e o ano novo;
  - o reinício do servidor no meio da partida, que volta na mesma rodada com a mesma vista.
- **No navegador, com duas abas (Eva Rocha e Fábio Nunes, 20 anos, F1 2024):**
  - os dois na Fórmula Regional, em equipes diferentes;
  - acerto e "deixar com o engenheiro" aplicados pelo servidor;
  - pronto pelos dois caminhos (o botão do acerto e a barra);
  - nove etapas com a mesma chegada nas duas telas e os pontos espelhados;
  - as propostas de cada um;
  - o ano novo em categorias diferentes (Eva na Fórmula Regional, Fábio na F3), com a F3
    ficando de fora da primeira rodada;
  - duas recargas da página e do servidor no meio da partida, que reconectaram à mesma sala.

  O teste achou e corrigiu:
  - o país do piloto sempre recusado;
  - os estilos sem nome;
  - "deixar com o engenheiro" mudando só a tela;
  - botões do jogo solo (simular, dificuldade, modo rápido) ativos na partida.

  Também explicou um "não largou" na primeira corrida: era uma lesão da pré-temporada, legítima,
  que o jogador não tinha como ver.

## Como o motor roda no servidor

`ferramentas/gerar-motor.mjs` pega do `index.html` os mesmos blocos `<script>` que
`testes/base.js` roda no Node, mais os dados de `dados/` (sem fotos nem traduções, que só
a tela usa), e escreve `src/gerado/motor-jogo.js`. Ali, uma função `criarMotor(ambiente)`
executa o jogo numa página falsa (`src/pagina-falsa.js`) e devolve `Engine`, `Chefe`,
`Gp`, `S`, `C` e os demais. O Worker não aceita `eval`, por isso o motor é montado
antes, no build. A simulação não é reescrita.

### Viabilidade (Fase 1, medida em 29/10/2026)

`src/viabilidade.js` monta o cenário Brawn 2009 do chefe e corre a primeira etapa ao
vivo, passo a passo (`Gp.passo`, 0,25 s por passo), como a transmissão faz.

| | Node | workerd (wrangler dev) |
|---|---|---|
| Carregar o motor | 0,4 s | 1,06 s frio, 0,3–0,4 s depois |
| Corrida inteira (Melbourne, 58 voltas, 21.577 passos) | 0,7 s | 0,4–0,55 s |
| Hash da chegada, semente 7 | `8412c18fc6523226` | `8412c18fc6523226` |

- Mesma semente e mesmas ordens dão o mesmo resultado no Node e no servidor.
- **Memória:** com uma carreira e uma corrida no meio, o primeiro motor ocupa 15 MB e cada
  motor a mais, 7 MB (medido no Node, que usa o mesmo V8). O limite do Durable Object é
  128 MB por isolate, então cada sala pode ter o seu próprio motor.
- **Ainda não medido:** os limites da produção (1 s para o código no topo do módulo,
  CPU por chamada). O motor só é criado dentro de uma chamada, nunca no topo do módulo.

## Protocolo (Fase 1)

**HTTP**
- `POST /api/salas` com `{nome, modo, versao}` cria a sala. Devolve
  `201 {codigo, ficha, slot:0, sala}`.
- `POST /api/salas/:codigo/entrar` com `{nome, versao}` entra na sala. Devolve
  `200 {codigo, ficha, slot, sala}`.
- Erros possíveis:

  | Status | Erro |
  |---|---|
  | 400 | `nome`, `modo`, `codigo`, `corpo` |
  | 403 | `origem` |
  | 404 | `sala` |
  | 409 | `cheia`, `versao`, `comecou` |
  | 429 | `limite` |

**WebSocket** `GET /api/salas/:codigo/ws`
- O navegador abre com os subprotocolos `['volante.v1', 'ficha.<ficha>']`. A ficha nunca vai
  na URL.
- **Do servidor:**
  - `estado` (ao conectar);
  - `jogadores` (quem entrou, saiu, caiu ou voltou);
  - `sala` (mudança de configuração);
  - `ok` / `erro` (resposta a uma mensagem com `id`).
- **Do jogador:**
  - `configurar` (só o anfitrião: velocidade 1, 2, 4, 8 ou 16×);
  - `sair`;
  - `ping`, respondido sem acordar a sala.

## Protocolo (Fase 2: rodadas)

As regras de verdade chegam na Fase 3. Por enquanto a partida usa `src/regras-teste.js`
(cada um planeja um valor de 1 a 10 em segredo, o servidor sorteia de 1 a 6 e soma), só
para provar o protocolo. As regras reais terão a mesma interface: `nome`, `iniciar`,
`acoes`, `processar` e `vista`.

**Do jogador** (toda mensagem leva `id`; a resposta é `{t:'ok', id, resultado?}` ou `{t:'erro', codigo, id}`)
- `iniciar`: só o anfitrião, só no lobby, só com a sala cheia (erros `anfitriao`, `estado`, `jogadores`).
- `acao {rodada, tipo, dados}`: planeja em segredo. Erros: `estado`, `processando`, `rodada`
  (rodada que já passou), `pronto` (quem está pronto não muda o plano), `acao` (tipo
  desconhecido), `dados`. Reenviar o mesmo `id` com o mesmo conteúdo devolve a resposta
  guardada e não aplica de novo (o servidor lembra os últimos 200).
- `pronto {rodada, pronto}`: marca ou cancela. Repetir o mesmo valor é `ok` sem mudar nada.
  Quando o último fica pronto, a rodada vai para `processing` e é processada uma única vez.

**Do servidor**
- `sala` e `estado` ganham `partida`: `null` no lobby, depois `{estado, rodada, prontos, ultimo, regras}`
  com `estado` em `planning` (ninguém pronto), `waiting` (alguns) ou `processing`.
  Nunca traz os planos de ninguém.
- `vista {v, vista}`: só para o dono do socket, depois de toda mudança e logo após o `estado`
  ao conectar. É o que as regras mostram para aquele jogador (o próprio plano, e só se o
  rival já decidiu, nunca o valor).
- `rodada {v, rodada, resultado}`: uma vez por rodada processada, seguida de `sala` e `vista`.

**Garantias**
- O sorteio vem de uma semente (código da sala + número da rodada), então reprocessar a
  mesma rodada dá o mesmo resultado.
- Se o processamento falhar, a partida fica em `processing` e um alarme tenta de novo,
  esperando 1,5 s e dobrando a cada falha seguida até 10 minutos, para um defeito nas
  regras não virar um laço de requisições. Se a sala cair no meio, ao acordar ela agenda o
  processamento. Uma rodada
  só é processada uma vez: o servidor confere `processing` e o número da rodada antes de gravar,
  tudo de uma vez (sala e mundo na mesma escrita).
- Pronto e planos sobrevivem a desconexões e a reinícios. Ninguém avança a rodada por estar ausente.
- Só no desenvolvimento (`DESENVOLVIMENTO` = "1" no `wrangler.jsonc`): a mensagem `__falhar`
  faz o próximo processamento falhar uma vez, e `partida.falhas` aparece na vista. Em produção
  `__falhar` responde `erro tipo` e `falhas` não aparece.

## Regras do modo chefe (Fase 3)

Salas de modo `chefe` usam `src/regras-chefe.js` (o motor do jogo em `src/chefe-mp.js`: um mundo, um pacote privado por equipe). As de modo `piloto` usam `src/regras-piloto.js` (Fase 4). O modo `teste` só é aceito com `DESENVOLVIMENTO`. O motor é criado sob demanda dentro da sala (nunca no topo do módulo) e recriado depois que a sala dorme.

- **Lobby.** `configurar` aceita só os campos que mudam: `{ velocidade?, sk?, ano? }` (`sk` f1 ou indy; o ano precisa ter equipes naquela série, senão `config`). Mudar `sk` ou `ano` apaga `config.equipes`. Padrão: `{ velocidade: 8, sk: 'f1', ano: 2024, equipes: {} }`. `{ t:'escolherEquipe', id, idx }` (qualquer jogador, só no lobby): erro `equipe` se o índice não existir/não puder ser montado ou já for do outro. `iniciar` sem as duas equipes dá erro `equipes`.
- **Ações** (`{ t:'acao', rodada, tipo, dados }`), todas na perspectiva do jogador e com sorteio preso à semente `codigo + 'acao:' + id`. Uma ação inválida responde `{ t:'erro', codigo, id, detalhe? }` sem mudar nada. Inverno: `negociar`, `aceitarContra`, `recusarContra`, `n1`, `promover`, `rebaixar`, `dispensar`, `motor`, `plano`, `staff`, `renovarStaff`, `construir`, `modernizar`, `patroAceitar`, `patroPedir`, `patroContrato` (também na temporada), `academia`, `academiaPapel`, `saida`. Temporada: `meta` (antes da 1ª etapa), `dec` (fds, tl1, treino, acerto, estr, n1, motor, ordem), `janela`, `pacote`, `pecasProjetar` (`{ parte, foco, nivel }`), `pecasFabricar`, `pecasArquivar`, `pecasPrio`, `acertoMudar`, `acertoSaida`, `acertoAuto`, `evento`. Balanço: `teto`, `falencia` (só `resgate`; `fechar` dá erro `mp`).
- **Pronto.** `podeFicarPronto(mundo, slot)`: no inverno, erro `pendencias` com `detalhe` = lista de textos (`Chefe.pendencias()`, mais propostas de saída por responder); na temporada, erro `evento` com acontecimento pendente.
- **Rodadas.** Inverno → `{ tipo:'inicio', ano }`. Cada etapa → `{ tipo:'corrida', etapa, gp, venc, pole, top[10] }` (só o que é público; na última etapa também `fimTemporada: true` e já entra no balanço). Balanço → pendências resolvidas sozinhas (teto: declarar; falência: socorro do dono ou resgate) e `{ tipo:'anoNovo', ano }`. O contador da sala conta todas as rodadas (inverno, cada etapa, balanço).
- **Vista.** `{ fase, C }`: a perspectiva inteira da equipe do jogador (a outra equipe aparece só como o rival `EU2` em `C.mpOutras` e na tabela). Pesa uns 125 KB.
- **Fora por enquanto:** demissão e fim de carreira são ignorados no multiplayer; fechar a equipe numa falência é recusado. O imprevisto do fim de semana (`fdsDe`) é sorteado por equipe a cada virada de rodada e resolvido na hora de correr.

## Regras do modo piloto (Fase 4)

- **Lobby.** `configurar` aceita `{ velocidade?, serie?, ano? }` (`serie` f1 ou indy).
  `{ t:'escolherPiloto', piloto: { nome?, cc, idade, estilo? } }` vale para cada jogador, só no
  lobby:
  - o nome é limpo e cortado em 24 caracteres; precisa de pelo menos 2, não pode repetir o do
    outro piloto, e sem nome vale o do jogador;
  - `cc` é um país do jogo;
  - a idade vai de 14 a 30;
  - o estilo é um dos quatro do jogo (`equilibrado` se faltar).

  Fora disso responde erro `piloto`. `iniciar` sem os dois pilotos dá erro `pilotos`.
  Padrão: `{ velocidade: 8, serie: 'f1', ano: 2024, pilotos: {} }`.
- **Ações**, na perspectiva do jogador e com sorteio preso à semente da ação. Os dados são
  conferidos contra listas fechadas, e um valor fora delas dá erro `dados`.
  - Temporada: `setResp`, `setupEngenheiro`, `setFilo`, `setMotor`, `escolherFoco`,
    `pedirDirecao`, `investir`, `pagarTeste`, `comprarLuxo`, `assinarPatro`, `contratarPessoal`,
    `dispensarPessoal`, `relacionar`, `setCompromisso`.
  - Mercado: `academia` (`{ i }` ou `{ i: null }` para recusar), `pedirOferta`, `escolherOferta`.

  Os avisos que o jogo daria voltam em `resultado.avisos`. Uma ação da fase errada dá erro
  `fase`.
- **Pronto.**
  - Na temporada, recusado só para quem se aposentou (`carreira`).
  - No mercado, recusado com a academia pendente (`academia`) ou sem proposta escolhida
    (`proposta`). Quem não tem nenhuma proposta que possa escolher fica pronto sem escolha.
- **Rodadas.**
  - Temporada: `{ tipo:'corridas', etapas: [{ slot, cat, gp, etapa, venc, top[10] }] }`, com
    uma entrada por piloto que correu (numa categoria dividida, as duas são a mesma corrida).
    Na última, `fimAno: true` e já vem o balanço.
  - Mercado: `{ tipo:'anoNovo', ano }`.
- **Vista.** `{ fase, S }`: a carreira do jogador com a temporada dele. O outro humano aparece
  só como `ME2` no grid e em `S.mpOutros` (nome, país, equipe, papel, força e se corre na mesma
  categoria). Pesa uns 125 KB no começo e 165 KB no fim do ano.

## Identidade temporária (só para teste)

- **Código da sala:** 8 caracteres de um alfabeto sem 0, 1, I, L e O.
- **Ficha:** 256 bits aleatórios, criada pelo servidor e guardada pelo navegador no
  localStorage (`vdo_mp`). O servidor guarda só o hash SHA-256 e compara em tempo
  constante.
- **Trava:** a sala fecha em 2 jogadores e recusa um terceiro.

**Isto não é autenticação de produção:**
- quem souber o código pode pegar a vaga antes do seu amigo;
- quem copiar a ficha vira você;
- limpar os dados do site perde a vaga;
- não há como recuperar o acesso.

## Proteções que já existem

- **Origem:** se o cabeçalho `Origin` vier e não estiver em `ORIGENS`, o pedido é recusado
  (bloqueia outros sites; um cliente fora do navegador pode forjar a origem).
- **Tamanhos:** corpo HTTP de até 2 KB e mensagens WebSocket de até 16 KB.
- **Abuso:**
  - até 20 mensagens a cada 10 s por jogador, e quem insiste é desconectado;
  - até 10 salas criadas por minuto por IP.
- **Nomes:** limpos no servidor e sempre mostrados como texto.
- **Logs:** sem fichas, hashes ou nomes.
