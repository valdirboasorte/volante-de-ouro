# Multiplayer do Volante de Ouro (em construção)

O servidor das partidas com amigos: um Worker da Cloudflare na frente e um Durable
Object (`Sala`) por partida, com o motor do jogo rodando sem tela. O servidor é a
autoridade: os navegadores mandam pedidos e mostram o que ele responde.

**Publicado em 31/10/2026, em teste:** o servidor está em `https://mp.volantedeouro.com`
(plano Workers Paid: o motor não cabe nos 10 ms de CPU do plano gratuito). No site, o botão
Multiplayer só aparece com o link `https://volantedeouro.com/?mp=1`. Para desenvolver, o
mesmo servidor roda no seu computador com `wrangler dev`. Ver [Publicar](#publicar).

## Fases

| Fase | O quê | Situação |
|---|---|---|
| 1 | Motor no servidor (viabilidade), salas, código de convite, conexão e reconexão | feita |
| 2 | Rodadas: pronto, espera, processamento único (com regras de teste) | feita |
| 3 | Modo chefe com duas equipes humanas | feita (local; as corridas ainda pelo caminho rápido) |
| 4 | Modo piloto com dois pilotos humanos | feita (local; as corridas ainda pelo caminho rápido) |
| 5 | Corridas ao vivo no servidor | feita e publicada (botão só com o link ?mp=1) |
| 6 | Robustez e testes com dois aparelhos | em andamento (parte 1 publicada em 31/10/2026) |
| 7 | A carreira de piloto atual (folha nova, piloto real) e a corrida 2D com todos pilotando | feita localmente, não publicada |

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

## Corridas ao vivo (Fase 5)

A corrida do jogo (`Gp`) é determinística: o passo dela (`Gp.passo`, 0,25 s de prova) só lê a
própria corrida. Não usa `Math.random` (tem gerador próprio, semeado na entrada), relógio ou
carreira. A mesma entrada (`Gp.entrada`, só dados) com as mesmas ordens nos mesmos passos dá a
mesma corrida no servidor e em cada navegador. Daí o **passo travado** (`src/corrida-mp.js`):

- **Preparar e concluir.** Com os dois prontos, a sala processa a rodada numa cópia do mundo
  com os ganchos do motor ligados (`Engine.mpCorrida` no piloto, `Chefe.mpCorrida` no chefe).
  Cada corrida com carro humano vira uma definição: a entrada e o dono de cada carro humano.
  A sala passa para `corrida` e roda cada corrida no relógio dela. No fim, processa a rodada de
  novo, com a mesma semente, e cada corrida devolve a chegada ao vivo. Cada categoria tem a sua
  semente, e por isso a montagem das corridas é a mesma nas duas passadas (a entrada é
  conferida). Sem corrida com humano, o que saiu da preparação já é a rodada.
- **Ordens.** Box, ritmo, trato do pneu, mistura e ordem de equipe:
  - o servidor confere o dono do carro e a lista fechada de cada comando;
  - a ordem vale num passo que nenhuma tela alcançou: as telas só andam até o passo
    **liberado**, que fica 0,8 s (tempo real) à frente da corrida oficial;
  - todas aplicam a ordem nesse passo, na ordem em que o servidor registrou.
- **Rádio.** A corrida para no passo da pergunta, no servidor e nas telas. Vale a resposta do
  dono do carro, ou a padrão depois de 20 s; o outro jogador vê que a corrida espera.
- **Largada.** Cada jogador reage às próprias luzes e larga só os carros dele
  (`Gp.largar(..., so)`). A sala espera os dois por até 45 s; quem não reagiu larga com a
  reação sorteada da corrida.
- **Velocidade.** É da sala (1× a 16×), e qualquer um que está correndo muda. Ela não muda o
  resultado.
- **Pular para o fim.** Só com o voto de todos os humanos daquela corrida.
- **Quem cai.**
  - Desconectado por mais de 15 s, a equipe assume as paradas dele (`equipe` no comando, por
    carro); na volta, devolve.
  - A tela que volta recebe a entrada e o registro inteiro e refaz a corrida até o passo liberado.
- **Conferência.** A cada 64 passos o servidor manda uma soma do estado, e a tela compara com a
  dela. Se não bater, a tela pede tudo de novo e refaz (até duas vezes). Depois disso avisa que
  o resultado que vale é o do servidor.
- **Reinício do servidor.** A entrada, o registro e o passo ficam guardados (o passo a cada
  2 s). Um alarme retoma a corrida refazendo-a com o registro, e as telas recebem tudo de novo.
- **Ganchos no `index.html`**, todos inertes no single-player:
  - `Engine.runRace` e `Chefe.correr` aceitam a chegada do servidor;
  - `Gp` com duas equipes humanas: a ordem de equipe é de cada uma (`ent.mpEquipes`), e
    "ceder" só vale entre carros da mesma equipe;
  - `Gp.largar` aceita só alguns carros, e cada carro pode deixar as paradas com a equipe;
  - a tela da corrida (`AoVivo`) com `opc.mp`:
    - os carros "seus" são os do jogador (`AoVivo.eMeu`), e as ordens passam por `AoVivo.comandar`;
    - o relógio só anda até o passo liberado;
    - não tem pausa, velocidade automática nem 32×/64×.
  - `node testes/ouro.js` deu as 16 carreiras idênticas depois de cada gancho.
- **Na sala:** "Corridas: Ao vivo / Rápidas" (`config.aoVivo`, padrão ao vivo). No modo rápido a
  corrida é calculada na hora, como nas Fases 3 e 4.

**Ainda de fora:**
- A classificação e o treino ao vivo (`Sessao`): o sábado continua calculado.
- Assistir à corrida do outro quando cada um está numa categoria: quem não corre vê a volta na
  barra da partida.
- O "nº 1 automático" do chefe (a ordem sai na hora certa sozinha). A ordem de equipe na mão
  vale.
- Uma tela num navegador cuja matemática de ponto flutuante difere da do servidor (o Safari usa
  outra biblioteca para seno, cosseno e logaritmo) pode se afastar aos poucos. A conferência
  pega, e o resultado oficial é sempre o do servidor. Fica para medir na Fase 6, com aparelhos
  de verdade.

## O que foi testado na Fase 5

- **`node testes/corrida-mp.mjs`: 27 verificações, todas passando.** Sem servidor:
  - piloto com os dois na mesma corrida;
  - chefe com duas equipes;
  - uma corrida inteira de chefe com uma pergunta de rádio.

  Em cada uma, a corrida do servidor e duas telas, uma colada no liberado e outra atrás:
  - mesmo resultado e as mesmas somas de conferência (339 na corrida de 56 voltas com 46
    ordens e rádio);
  - ordem para o carro do outro recusada;
  - "manter posições" de uma equipe não vale para a outra;
  - a corrida refeita do estado salvo no meio é a mesma;
  - a rodada concluída com a chegada ao vivo não diverge da preparada.
- **`npm run testes`.** A sala de piloto ao vivo por WebSocket (`testes/corrida-sala.mjs`):
  - largada com reação e automática;
  - ordens e recusas (carro do outro, comando inválido, velocidade fora da lista);
  - a tela que cai e volta com o registro inteiro;
  - o voto dos dois para pular;
  - a rodada processada com a chegada que a tela refaz.

  Depois de reiniciar o servidor, uma corrida que estava na pista volta, segue andando e a
  rodada é processada uma vez só. As salas por turnos das Fases 3 e 4 rodam com
  `aoVivo: false`.
- **No navegador, com duas abas (Gil Matos e Hana Sato, 20 anos, Fórmula Regional 2024):**
  - os dois prontos abriram a corrida nas duas telas;
  - Hana segurou e soltou nas luzes (queimou: 5 s só para ela), Gil largou no automático;
  - "Atacar" do Gil e o box da Hana chegaram à outra tela;
  - a Hana mudou a sala para 16×;
  - na última volta, um furo do Gil parou as duas telas: ele respondeu, e a Hana viu "o outro
    jogador está respondendo";
  - na bandeirada, o top 10 das duas telas e o oficial do servidor foram idênticos, sem
    nenhuma correção;
  - "Ver o resultado" abriu a tela de resultado da rodada (7º, 6 pontos).

## Publicar

**A primeira publicação (31/10/2026):** o Worker `volante-mp` e o site saíram do commit
a0855fe (versão da página 35c65ecb68f256da). Conferido no ar:
- uma origem estranha é recusada, e a rota de teste não existe;
- sem o link, o botão some; com `?mp=1`, a sala é criada, a corrida ao vivo abre em 1,7 s e a
  rodada é processada com a mesma chegada da tela.

No Windows, se o PowerShell recusar o `npx` (política de execução de scripts), use `npx.cmd`.

O servidor de produção usa `wrangler.producao.jsonc`:
- endereço `https://mp.volantedeouro.com` (domínio próprio do Worker na zona do site);
- só o site oficial abre salas;
- sem as rotas e mensagens de teste.

A página já aponta para esse endereço quando roda em volantedeouro.com. Por enquanto o botão
**Multiplayer** só aparece para quem abrir `https://volantedeouro.com/?mp=1`: o aparelho
lembra, e `?mp=0` esquece. Para abrir a todos, `ABERTO_A_TODOS = true` em
`assets/multiplayer.js`.

```bash
cd multiplayer
npx wrangler login     # uma vez: liga este computador à conta da Cloudflare (o dono aprova no navegador)
npm run publicar       # gera o motor e publica o Worker com wrangler.producao.jsonc
```

Depois, o site (Cloudflare Pages, a partir da branch `main`) precisa da versão da página igual
à do motor publicado. As duas saem do mesmo `index.html`: publique o Worker e o site a partir do
mesmo commit. `npx wrangler deploy --dry-run -c wrangler.producao.jsonc` confere a configuração
sem publicar (1,7 MB comprimido).

## Robustez (Fase 6, parte 1)

- **Proposta de outra série:** vale. Antes, a escolha era recusada e o ano novo rodava sem
  aplicá-la: o piloto ficava preso na série velha. Testado: F1 → NASCAR, e numa simulação F1 →
  Endurance → NASCAR, sem erro.
- **Sem nenhuma proposta:** a carreira acaba (`semvaga`), como no jogo solo. Em 12 salas
  simuladas (35 anos de carreira, idades de 14 a 30, F1 e Indy, de 1978 a 2024) isso não
  aconteceu nenhuma vez.
- **Carreira encerrada** (aposentadoria, acidente fatal, sem vaga):
  - o jogador conta como pronto (`regras.dispensado`), e a sala segue com o outro;
  - quem saiu fica com a última temporada, parada, e o carro dele corre com a IA;
  - a barra mostra "carreira encerrada".
- **Testes:**
  - `node testes/robustez-piloto.mjs`: 4 verificações, todas passando;
  - `piloto-mp` 48/48 e `corrida-mp` 27/27;
  - `npm run testes` 177 ok e 2 falhas na verificação "cada equipe com o seu resultado" da
    sala de chefe (Fase 3). Ela supõe que quem correu ainda está no elenco, e um acontecimento
    do fim de semana pode trocar um piloto. Passou em outras rodadas com acontecimento. Não
    mexe no código desta parte, mas fica para corrigir.

**Ainda falta (parte 2):**
- a sala de chefe ao vivo num navegador de verdade;
- o teste com dois aparelhos (celular e computador) e com o Safari;
- a limpeza das salas paradas;
- o aviso quando o outro jogador cai no meio da corrida;
- o reserva no carro do convidado machucado numa temporada dividida.

## A carreira de piloto atual e a corrida 2D (Fase 7)

Local, ainda não publicada. A sala de piloto passa a ter a carreira de um jogador inteira: a folha
nova do piloto (`assets/painel-piloto.js`), o piloto real com o passado dele
(`assets/passado-piloto.js`) e a corrida interativa 2D, com cada jogador pilotando o próprio carro
na mesma pista, contra a IA nos outros carros.

### No lobby

- **Corridas:** "Pilotando (2D)", "Ao vivo" (a clássica, em passo travado) ou "Rápidas". Na 2D, o
  anfitrião escolhe a distância (de 10% a 100% da prova) e o nível dos rivais (Fácil a Lenda).
  - Na configuração: `config.corrida2d`, `config.dist2d` (0,1, 0,2, 0,35, 0,5 ou 1) e
    `config.ia2d` (`facil`, `medio`, `dificil` ou `lenda`).
  - Pista que a 2D não monta (as estradas longas, acima de 26 km) corre ao vivo na clássica.
- **Piloto real:** além do piloto criado, cada um pode assumir um piloto de verdade do grid da
  série e do ano da sala (`escolherPiloto { piloto: { real: nome } }`, com o nome como está em
  `eraOfSeries(ano, serie).pilots`).
  - O mesmo piloto não pode ser de dois jogadores.
  - Mudar a série ou o ano tira as escolhas de piloto real.
  - O servidor monta a carreira com `Game.startTakeOver`: a equipe real e `S.passado`, porque
    `passado-piloto.js` agora entra no motor gerado.
  - A folha, as estatísticas e as conquistas mostram a carreira somada, como no jogo solo
    (testado com Verstappen e Hamilton em 2023, e com Leclerc no navegador).

### A arquitetura da 2D em rede: a sala com a IA, cada jogador dono do próprio carro

A corrida clássica é em passo travado: o mesmo `Gp` em todo lugar, com as ordens marcadas num
passo futuro. Isso não serve para a 2D, por três motivos:
- a física roda a 120 passos por segundo, com toques, e é caótica: um erro de arredondamento vira
  outra corrida. O Safari usa outra biblioteca para seno e cosseno, e o resultado diverge;
- o estado é grande e tem sorteios dentro de funções (a IA, a sessão), então guardar e voltar o
  estado (o rollback) é caro e frágil;
- e o que mais pesa: atrasar o volante para todos esperarem as ordens (input delay) estraga a
  pilotagem.

Também não dá para a tela do anfitrião rodar a IA: aba no fundo para o `requestAnimationFrame`, e a
IA de todos pararia junto. Então:

- **A sala** (o Durable Object, `src/corrida2d-mp.js`) roda a sessão oficial a 120 passos por
  segundo, com a física da 2D que agora entra no motor gerado (`MODULOS_2D` em
  `ferramentas/gerar-motor.mjs`, mais `assets/corrida2d/rede2d.js`).
  - A sala decide os carros da IA, o safety car, as bandeiras, as punições, a ordem e o resultado.
  - Os carros humanos lá são **fantoches** (`c.remoto`): andam com o estado que o dono manda.
- **Cada tela** roda a mesma sessão (`C2D.Rede.Cliente`).
  - O carro do jogador tem a física local: o comando não espera a rede, atraso zero no volante.
  - Todos os outros carros são fantoches, levados até o "agora".
- **O relógio** é o tempo de prova da sala. A tela estima a diferença para o relógio dela pelo
  eco, como no NTP: pega a amostra de menor ida e volta entre as 24 últimas, e a estimativa anda
  devagar (2 ms por quadro) e só pula quando erra mais de 150 ms. A tela roda a sessão no agora da
  sala.
- **O fantoche**:
  - chega como `[sTot, d, x, y, rumo, ângulo com a pista, vx, vy, giro, ṡ, ḋ, aceleração,
    esterço, acelerador, freio, deslize, bits]`, em números inteiros;
  - fica no x, y exato e anda pela pista: s + ṡ·t e d + ḋ·t, com a curva da pista. Na curva ele
    segue a curva, coisa que uma reta não faz;
  - é levado até 0,8 s adiante: perda no TCP segura os pacotes de trás por meio segundo. Depois
    disso, espera;
  - recebe a correção suavizada, com τ de 120 ms e no máximo 25 m/s além do carro (não vira
    puxão). Erro maior que 14 m (o box, a volta à pista) pula de uma vez.
- **Os toques:** cada lado resolve só os pares em que entra um carro que ele simula.
  - A sala resolve a IA contra a IA e a IA contra o humano. A tela resolve o próprio carro contra
    qualquer outro.
  - O dano do fantoche é do lado que o simula. As peças soltas chegam na meta (`ms`).
  - O toque entre dois humanos, a tela conta para a sala (`tq`), e a sala julga a punição com os
    dois fantoches dela.
- **As punições** são todas da sala.
  - Drive-through e stop-and-go de um humano viram o tempo da regra na hora, porque cumprir no box
    dependeria da tela do dono.
  - Os avisos de limites de pista nascem na tela do dono e a sala soma as punições.
- **Quem some** (caiu, aba no fundo, menu aberto) não trava ninguém.
  - Sem estado do dono por 1 s, a sala assume o carro com a IA (`assumir`).
  - A tela que volta pega o carro do ponto em que a sala deixou, com as voltas, o cronômetro, o
    pneu e as peças, e avisa (`ad`). A sala então devolve.
  - A tela só pega de volta depois de meio segundo em dia com o relógio da sala, e nunca com o
    carro no pit lane. Assim a aba no fundo, a 1 quadro por segundo, não fica trocando o carro de
    mão.
  - Com o menu aberto, a equipe leva o carro (a prova não para).
- **O resultado** é o `C2D.Corrida.resultado`, no formato de `Gp.resultado`.
  - Ele entra na rodada como a chegada ao vivo da clássica: `ligarCorridas` no modo `'concluir'`,
    depois `vivoDe`, `Gp.chegada` e `Engine.runRace`, nos dois campeonatos.
  - A definição da corrida (`C2D.Rede.definir`) é a mesma conta da 2D do jogo solo
    (`carreira2d.js`): o carro de cada equipe vira o fator de tempo de volta, o talento vira a
    competência da IA, o azar sorteado vira o destino do carro e o tempo do dia vem de `Gp.clima`.
    O acerto e a equipe de cada humano (`carR`) vêm da perspectiva dele.

### Protocolo da 2D

Tudo pelo WebSocket da sala.

- **`corridaInicio` / `corridaEstado`:** as corridas 2D trazem `modo: '2d'`, a definição (`c2d`)
  e o quadro inteiro (`quadro`). As fases são:
  - `carregando`: espera todos mandarem `pronto2d`, até 60 s;
  - `correndo`: 3 s de contagem e as luzes;
  - `fim`.
- **Da tela:**
  - `c2dEu { k, ts, tl, e, m?, ad?, tq? }`: o estado do carro, ~30 por segundo;
    - não tem `id` nem resposta, e não grava no storage;
    - tem limite próprio de 60 por segundo, fora do limite comum de 20 mensagens a cada 10 s.
  - `corrida { tipo: 'pronto2d' | 'pular' | 'abandonar' }`. O `pular` do anfitrião com
    `forcar` leva a corrida ao fim para todos.
- **Da sala:**
  - `c2dQ`: o quadro de todos os carros, a cada ~50 ms. Traz:
    - `t2`: o tempo do estado;
    - `tq`: a hora do envio, para o eco;
    - `e`: os carros que andaram;
    - `m`: só as metas que mudaram, e todas a cada 2 s;
    - `g`: a prova (luzes, bandeira, safety car, fim);
    - `ev`: os eventos;
    - `pun`: as decisões da direção de prova;
    - `eco`.
  - `c2dH`: o estado de um humano, repassado na hora aos outros, sem esperar o tique.
- **O tique** da sala é de 50 ms. O temporizador do Durable Object atrasa às vezes, então o quadro
  também sai quando chega o estado de um jogador e já passaram 60 ms. O último quadro, com a ordem
  final, sai uma vez quando a corrida acaba por voto.
- **Reinício do servidor:** a cada 2 s a sala guarda uma foto (posição, meta e prova de cada carro).
  Ao voltar, a corrida segue dessa foto. É aproximado (até 2 s atrás), não exato como na clássica.

### O que foi testado na Fase 7

- **`node testes/corrida2d-mp.mjs [atraso] [variação] [perda%]`**, sem servidor HTTP. São a sala
  e duas telas num relógio falso, com uma rede de mentira: atraso, variação e perda. A perda vira
  um pacote 200 a 300 ms atrasado que segura os de trás, como no TCP. Os dois robôs pilotam e a
  tela 1 some 4 s logo depois da largada. São 15 verificações:
  - a corrida 2D tem os dois humanos;
  - a definição só tem dados;
  - os fantoches estão certos;
  - o relógio acha o da sala;
  - a sala assume e devolve;
  - quem sumiu não perde volta;
  - o resultado entra na rodada sem divergência;
  - o top 10 da rodada é o da 2D;
  - a posição na carreira de cada um é a da 2D.

  | Rede | Erro do outro humano (p95) | Erro da IA (p95) | Salto por quadro (p99) | Relógio (p95) |
  |---|---|---|---|---|
  | perfeita | 0,27 m | 0,43 m | < 0,1 m | 0 ms |
  | 40 ms ±15, 1% de perda | 0,84 m | 0,67 m | < 0,1 m | 3 ms |
  | 100 ms ±40, 3% de perda | 2,2 m | 1,1 m | < 0,1 m | 7 ms |

  O carro tem 5 m. Um erro de 1 m a 250 km/h são 15 ms de prova.
- **`node testes/corrida2d-sala.mjs [atraso] [variação] [perda%] [segundos]`**, contra um
  `wrangler dev` próprio (porta 8792). São dois clientes Node com a sessão 2D inteira e robôs no
  volante, com a mesma rede de mentira. O teste confere:
  - a 2D ligada no lobby;
  - a largada esperando os dois;
  - uma queda de verdade do WebSocket por 3 s, com a mesma ficha: a sala assume e devolve o carro;
  - o voto dos dois para pular;
  - a rodada processada;
  - a posição da 2D na carreira de cada um.

  Com 40 ms ±15 e 1% de perda, ele mediu:
  - a ida e volta medida pelo eco: ~100 ms;
  - recebido por tela: ~30 KB/s;
  - as duas telas veem o mesmo carro da IA no mesmo lugar: p95 de 0,3 a 0,4 m;
  - o outro humano: p95 de 0,95 m quando a máquina estava livre.

  Quando o próprio teste trava (outro programa pesado no computador), a cadência e o erro do
  humano saem como "não verificável".
- **`node testes/piloto-real-mp.mjs`**, 9 verificações:
  - Verstappen e Hamilton em 2023: a equipe real, `S.passado`, a mesma temporada sem ninguém
    repetido e três rodadas;
  - a carreira somada é a de antes mais a de agora;
  - um piloto real e um criado na mesma sala, cada um no calendário da sua categoria.
- **No navegador** (`127.0.0.1:4321`, `wrangler dev` em 8787), com um segundo jogador robô no
  Node:
  - lobby com "Pilotando (2D)" e o piloto real;
  - a folha nova com o passado do Leclerc: vice em 2022, campeão da F2 e da GP3;
  - a corrida 2D no Bahrein 2024 com o Norris do outro jogador, que andou liso: a 45 quadros por
    segundo, o salto além do movimento ficou em p99 0,17 m e no máximo 0,32 m;
  - o menu sem pausa;
  - o pulo até o fim;
  - no GP Bahrein, Leclerc largou em P3, chegou em P1 e somou 25 pontos, com 6 vitórias na
    carreira somada. O Norris chegou em 2º, também na carreira dele.

  Na Bélgica, com piloto criado, a mesma coisa, em 16º.

### Limites que ficam

- **Classificação e treino** continuam calculados no multiplayer. A 2D é só o domingo.
- **Todos os humanos da sala correm na 2D.** Quem não quer pilotar abre o menu: a equipe leva o
  carro.
- **Sem pulo do safety car (a cortina) e sem câmera lenta**, porque o tempo é um só para todos.
- **Toque entre dois humanos:** cada um sente o toque no próprio carro, com a posição estimada do
  outro (de 0,3 a 2 m de erro). Com a rede ruim, um pode ver um toque que o outro não sentiu.
- **Drive-through e stop-and-go de humano viram tempo.** Cumprir no box não existe na rede.
- **Ajudas** (freio assistido, danos reduzidos, câmera) são de cada um, como no jogo solo.
- **Reinício do servidor no meio da 2D:** a corrida volta da foto de até 2 s antes. Não há refazer
  exato.
- **Versão:** os módulos da 2D ficam fora do hash da página. Por isso a 2D publicada precisa sair
  junto com o Worker (`VERSAO_2D` no motor gerado; a tela tem `Corrida2D.V`). Uma tela com cache
  velho pode ter outra física, mas não diverge, porque cada lado simula o seu.
- **Medido só aqui:**
  - a Cloudflare de verdade e dois aparelhos (celular e Safari);
  - com 8 jogadores, cada estado é repassado a 7 telas;
  - o custo da sala: 20 carros a 120 passos por segundo, uns 20 ms de CPU por segundo no Node.
- **Falhas que já existiam:** `testes/piloto-mp.mjs` tem 2 falhas em "categorias diferentes"
  (16 e 21 anos acabam na mesma categoria em 2025). Elas já falham no HEAD limpo, sem estas
  mudanças.

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
