---
name: Volante de Ouro
description: Simulador de carreira no automobilismo, 1950 a 2026, em carbono, vermelho e dourado.
colors:
  carbono: "#0b0c0e"
  trilho: "#0f1113"
  superficie-1: "#141619"
  superficie-2: "#1a1c20"
  superficie-3: "#212429"
  superficie-4: "#2b2f35"
  tinta: "#eef0f2"
  tinta-suave: "#a8aeb7"
  tinta-fraca: "#8a919b"
  ouro: "#f0c12e"
  ouro-hover: "#ffd34d"
  ouro-velho: "#b98f14"
  tinta-sobre-ouro: "#15110a"
  vermelho-acao: "#e2231a"
  vermelho-acao-hover: "#f5372d"
  vermelho-texto: "#ff5244"
  verde-ganho: "#22c46e"
  roxo-melhor: "#b75cf2"
  amarelo-bandeira: "#f5d000"
  azul: "#3d8ef7"
  laranja: "#ff8a1f"
  prata: "#c9ccd1"
  bronze: "#c98a52"
  linha: "#25282e"
  linha-2: "#353941"
  regua: "#24272d"
  regua-forte: "#34383f"
typography:
  display:
    fontFamily: "Archivo, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
    fontSize: "clamp(60px, 9vw, 150px)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "0"
    fontVariation: "'wdth' 72"
  headline:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(44px, 4.6vw, 64px)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.02em"
  page-title:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0"
    fontVariation: "'wdth' 72"
  title:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.2
  number:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 800
    lineHeight: 1.05
    fontFeature: "'tnum'"
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(16px, 15.2px + .25vw, 18px)"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "'tnum'"
  body-sm:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.3
  button:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "0.03em"
    fontVariation: "'wdth' 85"
rounded:
  reto: "0px"
  peca: "12px"
  cartao: "20px"
  janela: "26px"
  pilula: "999px"
spacing:
  fio: "2px"
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  painel: "18px 20px 20px"
  pagina: "22px 26px 56px"
  margem: "clamp(16px, 3vw, 32px)"
components:
  botao-principal:
    backgroundColor: "{colors.ouro}"
    textColor: "{colors.tinta-sobre-ouro}"
    typography: "{typography.button}"
    rounded: "{rounded.pilula}"
    padding: "0 22px"
    height: "46px"
  botao-principal-hover:
    backgroundColor: "{colors.ouro-hover}"
  botao-agir:
    backgroundColor: "{colors.vermelho-acao}"
    textColor: "#ffffff"
    typography: "{typography.button}"
    rounded: "{rounded.pilula}"
    padding: "0 22px"
    height: "46px"
  botao-agir-hover:
    backgroundColor: "{colors.vermelho-acao-hover}"
  botao-neutro:
    backgroundColor: "{colors.superficie-3}"
    textColor: "{colors.tinta}"
    typography: "{typography.button}"
    rounded: "{rounded.pilula}"
    padding: "0 22px"
    height: "46px"
  botao-neutro-hover:
    backgroundColor: "{colors.superficie-4}"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.tinta-suave}"
    rounded: "{rounded.pilula}"
    padding: "0 12px"
    height: "42px"
  nav-item-hover:
    backgroundColor: "{colors.superficie-2}"
    textColor: "{colors.tinta}"
  nav-item-atual:
    backgroundColor: "{colors.ouro}"
    textColor: "{colors.tinta-sobre-ouro}"
  painel-chefe:
    backgroundColor: "{colors.superficie-1}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.reto}"
    padding: "{spacing.painel}"
  chip-topo:
    backgroundColor: "{colors.superficie-1}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.reto}"
    padding: "8px 14px"
  vista-selecionada:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.carbono}"
    rounded: "{rounded.pilula}"
    padding: "0 16px"
    height: "36px"
  cartao-jogo:
    backgroundColor: "{colors.superficie-1}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.cartao}"
  campo:
    backgroundColor: "{colors.carbono}"
    textColor: "{colors.tinta}"
    rounded: "14px"
    height: "44px"
---

# Design System: Volante de Ouro

## Overview

**Creative North Star: "O muro dos boxes"**

Carbono escuro, uma família tipográfica só e fotos reais de corrida. O jogo se lê como uma tela de cronometragem: superfícies separadas por tom e não por contorno, números tabulares em tudo que é tempo, ponto e dinheiro, e cores de cronometragem que guardam o seu sentido (roxo é o melhor do grid, verde é ganho, amarelo é bandeira, vermelho é abandono ou perda). Vermelho é a cor de agir; dourado é a cor do que vale ouro.

O modo chefe, a superfície mais nova, leva isso ao limite como **folha de cronometragem**: um trilho lateral só em texto, e a página inteira como uma folha única dividida por fios de 1px (`regua`), sem caixas, com títulos e números condensados, a cor da equipe em amostras sólidas e o dourado reservado para o item escolhido do trilho e para a única ação principal da tela. Escolhido pelo dono em 2026-10-21 para tirar a cara de painel genérico ("sem cara de IA"). O resto do jogo (carreira de piloto, cartões de série, página de apoio) é anterior e mais arredondado: cartões com raio de 20px e janelas de 26px. Os dois convivem sobre os mesmos tokens.

Rejeitado pelo dono: vidro (glassmorphism), visual 3D, rostos e pinturas gerados por IA. A corrida ao vivo continua escura, como uma transmissão de TV.

**Key Characteristics:**
- Fundo carbono com quatro degraus de superfície; profundidade por tom.
- Archivo em uma família só: títulos condensados (largura 72%) e em maiúsculas, como o letreiro de um carro; botões a 85%.
- Algarismos tabulares no corpo inteiro.
- Fotos reais do Wikimedia Commons, com crédito na tela; monograma na cor da equipe quando não há foto livre.
- Tema claro completo, com a capa fotográfica sempre escura.

## Colors

Carbono quase neutro, com um vermelho de ação e um dourado de vitória; o resto são cores de cronometragem com significado fixo.

### Primary
- **Dourado de Vitória** (`ouro`): título, vitória, a marca. No hub do chefe, só o item atual do trilho e a ação principal (botão "Preparar o fim de semana", "Começar a temporada", "Balanço"). Hover em `ouro-hover`. Texto sobre ele sempre em `tinta-sobre-ouro`. `ouro-velho` marca campeão/parcial em tabelas históricas, misturado ao fundo.

### Secondary
- **Vermelho de Largada** (`vermelho-acao`): a ação no resto do jogo (`btn-primary` global), aba e chip escolhidos, interruptor ligado, foco de campo, selo de pendência no trilho. Em texto usa-se `vermelho-texto`, que tem contraste sobre carbono: caixa negativo, vaga aberta, abandono.

### Tertiary
- **Cores de cronometragem**: `roxo-melhor` (melhor do grid), `verde-ganho` (ganho, tarefa feita), `amarelo-bandeira` (bandeira), `azul`, `laranja`, `prata` e `bronze` (pódio). Nunca decorativas; nunca sozinhas para passar informação (compostos de pneu levam letra).
- **Cor da equipe** (`--tc`, em tempo de execução, vinda dos dados da equipe): o que é nosso. Barra de 8px da identidade no trilho, fundo do monograma do piloto, capa sem foto, a linha da nossa equipe nos construtores (`--tc` a 24% sobre `superficie-1`) e a amostra de 4px de cada equipe na tabela.

### Neutral
- **Carbono** (`carbono`): fundo da página, fundo do traçado do circuito, etapas futuras da faixa.
- **Trilho** (`trilho`): a barra lateral do hub, que desce até o fim da página.
- **Superfícies 1 a 4** (`superficie-1` a `superficie-4`): painel, peça dentro do painel, trilha de barra/estado neutro, hover. Cada degrau é um nível de profundidade.
- **Tinta** (`tinta`, `tinta-suave`, `tinta-fraca`): texto principal; rótulos e texto secundário; legendas, `dt` e números de etapa.
- **Linhas** (`linha`, `linha-2`): só em tabelas, campos e na borda dos cartões e janelas antigos.
- **Régua** (`regua`, `regua-forte`; no tema claro `#d6d9de` e `#bfc3c9`): os fios de 1px da folha do chefe. `regua` separa blocos e linhas de lista; `regua-forte` fica sob o título de cada bloco. Desenhados com `box-shadow: inset` ou com o vão de 1px de uma grade sobre fundo `regua`, nunca como faixa colorida.

O tema claro (`html[data-theme="light"]`) redefine os mesmos papéis; os valores estão no sidecar `.impeccable/design.json`.

### Named Rules
**A Regra do Ouro Raro.** No hub, o dourado aparece em exatamente dois lugares: o texto do item atual do trilho e a ação principal da página. Seleção e destaque usam `tinta` (vista escolhida, opção escolhida, etapa atual, 1º lugar).

**A Regra do Que É Nosso.** A cor da equipe marca só o que pertence ao jogador. Nunca vira cor de botão ou de estado.

**A Regra da Cor Que Significa.** Vermelho em texto é perda, roxo é o melhor, verde é ganho. Cor de estado só onde há estado.

## Typography

**Display Font:** Archivo (eixo de largura 62 a 125, peso 100 a 900), carregada do Google Fonts, com system-ui, Segoe UI, Roboto e Arial de reserva
**Body Font:** Archivo, a mesma família

**Character:** Uma família só, mudando de largura: condensada e pesada nos títulos, normal no texto, com algarismos tabulares sempre.

### Hierarchy
- **Display** (800, largura 72%, `clamp(60px, 9vw, 150px)`, 0.9, maiúsculas): título da abertura e grandes títulos de formulário.
- **Headline** (800, `clamp(44px, 4.6vw, 64px)`, 0.95, maiúsculas, máx. 12ch): o nome da equipe sobre a foto da capa.
- **Page title** (800, largura 72%, 30px; 24px no celular, maiúsculas): o título de cada página do hub e os `h1` em geral.
- **Title** (700, 18px, 1.2): título de painel. Janela hospedada: 26px, sem maiúsculas. Próxima etapa: 26px/800.
- **Number** (800, 28 a 30px, tabular): números grandes com rótulo abaixo (posição, pontos, caixa). Nos cartões de piloto, 19px.
- **Body** (400, `clamp(16px, …, 18px)`, 1.5): texto corrido. Nos painéis do hub, 15px; notas a 14px, máx. 60ch.
- **Label** (400, 12 a 13px, `tinta-suave` ou `tinta-fraca`, sem maiúsculas): `dt`, legenda, crédito de foto (12px).
- **Button** (700, largura 85%, maiúsculas, 0.03em): todos os botões `.btn`. O trilho e os links "mais" ficam em 500 a 600, sem maiúsculas.

### Named Rules
**A Regra do Letreiro.** Maiúsculas e largura condensada são para títulos e botões. Rótulos e texto nunca vão em maiúsculas espaçadas. Na folha do chefe, o título de bloco é condensado (75%), 16px/800, em maiúsculas com 0.02em; os números grandes (placar, caixa, atributos, construtores, pilotos) vão a 72 a 80% de largura, 800.

**A Regra do Tabular.** Todo número que se compara (tempo, ponto, dinheiro, posição) é tabular.

## Layout

O hub é uma grade de duas colunas: trilho fixo de 232px (`trilho`, sticky abaixo da barra de 64px) e a folha, que encosta no trilho e nas bordas, sem margem. A folha começa com a linha de placar (título da área à esquerda, células de dado separadas por fio à direita) e segue em blocos que encostam uns nos outros com um fio de 1px entre eles (grade com `gap:1px` sobre fundo `regua`). A visão geral é capa + próxima etapa (`1fr 380px`), a faixa da temporada em largura total e então três pilhas: carro e instalações; caixa e engenharia; construtores e notícias. Cada bloco tem padding de 18px 24px 22px.

Quebras observadas: 1240px (três colunas viram duas), 1100px (a capa e a próxima etapa empilham), 980px (o trilho vira uma faixa horizontal rolável no alto, sem identidade nem rodapé), 700px (uma coluna; a próxima etapa e o botão sobem antes da capa; a foto da capa vira uma faixa de 56vw no alto). O resto do jogo usa `.wrap` com máx. 1240px e margem `margem`.

Ritmo: 2px entre linhas de lista (o tom separa), 4px entre etapas da faixa, 8 a 12px dentro de painel, 16px entre painéis.

## Elevation & Depth

Plano. A profundidade vem do tom: carbono, trilho, superfície 1, 2, 3 e 4, cada uma um degrau acima. Não há sombra em repouso nem no hover. A única sombra projetada é a de janela e menu flutuante. Contornos internos de 1 a 2px em `inset` marcam estado (etapa atual, instalação em obra), nunca decoração. Na folha do chefe, a separação é o fio (`regua`), não o tom: os blocos ficam todos no carbono.

### Shadow Vocabulary
- **Janela** (`box-shadow: 0 30px 80px rgba(0,0,0,.6)`; no tema claro, `rgba(16,18,21,.18)`): janelas modais e menu aberto do topo.
- **Marca de estado** (`box-shadow: inset 0 0 0 2px var(--ink)`): a etapa atual na faixa da temporada.

### Named Rules
**A Regra do Tom.** Fora do chefe, superfícies se separam por degrau de tom, não por linha. Se um painel precisa de borda para se destacar, ele está no degrau errado.

**A Regra do Fio.** Na folha do chefe não há caixa: o que separa bloco de bloco e linha de linha é um fio de 1px em `regua`, como numa tela de cronometragem. Nada de cartão com fundo próprio, raio ou sombra dentro da folha.

**A Regra do Véu Neutro.** O único degradê é o véu de carbono (`rgba(11,12,14,…)`) sob texto sobre foto. Nada de degradê colorido ou brilho.

## Shapes

Duas famílias de forma, em escopos diferentes. No hub tudo é reto (0px): blocos, placar, tarefas, etapas, linhas de piloto, botões, opções e vistas; as opções de uma escolha encostam com 1px entre elas, como um seletor de cronometragem. Barras de valor têm 3px. No resto do jogo, cartões têm 20px com borda de 1px em `linha`, janelas 26px, peças internas 12px, campos 14px, e pílulas para botão, aba, selo e posição. Barras de progresso são retângulos de 6px (trilha `superficie-3`, valor `tinta`); níveis de instalação são cinco blocos de 18x8px.

## Components

### Buttons
Pílulas firmes, condensadas e em maiúsculas.
- **Shape:** pílula (999px), altura 46px; grande 58px, pequeno 38px.
- **Principal (hub):** dourado com tinta escura, reto, 54px, largura total na próxima etapa, termina com "→". Uma por página.
- **Agir (resto do jogo):** vermelho de ação com texto branco.
- **Neutro / ghost:** `superficie-3` / `superficie-2`, um degrau acima no hover.
- **Hover / Press:** cor em 150 a 200ms com `--ease`; no hover global sobe 1px. No hub o hover só existe sob `(hover:hover) and (pointer:fine)`, e o toque comprime para `scale(.97)` (tarefa: `.99`) em 120ms com `--ease-out`.
- **Desabilitado:** opacidade .4.

### Chips
- **Placar do topo do hub:** células sem fundo separadas por fio, rótulo de 12px em `tinta-fraca` sobre valor de 24px condensado (72%) e, quando há, uma linha de 12px embaixo (a tendência da diretoria). Na visão geral: construtores, pontos, meta, caixa e diretoria; nas outras áreas: próxima etapa, caixa e diretoria. As clicáveis vão a `superficie-1` no hover.
- **Vistas de página / filtros:** pílulas de 34 a 36px em `superficie-2`; a escolhida vira `tinta` com texto `carbono` no hub e vermelho no catálogo de campeonatos.
- **Selos:** pílulas de 26px, tom misturado ao fundo (`color-mix`) para estado.

### Cards / Containers
- **Bloco da folha (hub):** sem fundo próprio, padding 18px 24px 22px, título condensado em maiúsculas com fio `regua-forte` embaixo e um dado em `tinta-suave` à direita. O título é o atalho para a área (botão com uma seta desenhada em CSS que anda 3px no hover); não há link "→" no pé. Listas em linhas separadas por fio.
- **Cartão do jogo:** `superficie-1`, raio 20px, borda de 1px em `linha`.
- **Janela:** `superficie-1`, raio 26px, borda de 1px, sombra de janela, fundo coberto por `rgba(5,6,8,.72)`. Quando a janela mora numa página do hub, perde fechar, borda, raio e marca, e a ação principal vira dourada.

### Inputs / Fields
- **Style:** fundo `carbono`, borda de 1px em `linha-2`, raio 14px (12px nos filtros), altura 42 a 44px.
- **Focus:** a borda passa para `vermelho-acao`; foco de teclado global com contorno de 2px em `ouro` e afastamento de 2px.
- **Range:** trilha de 6px, parte cheia em `vermelho-acao`.

### Navigation
- **Trilho do hub:** identidade da equipe no alto (amostra de 6px na cor da equipe, nome condensado em 24px/800 maiúsculo), doze itens só em texto (15px/500, `tinta-suave`, 38px de altura, sem ícone). Atual: texto dourado, 700, sobre `superficie-1`, com `aria-current="page"`. Selo de pendência: quadrado vermelho com o número branco. Rodapé separado por fio: reputação (barra de 3px) e "Sair do modo chefe" em texto. Abaixo de 980px vira faixa horizontal rolável, com o atual marcado por um traço dourado de 2px embaixo.
- **Barra do topo:** 64px, carbono a 90% com linha inferior, marca condensada, links em pílula condensados.

### Capa da equipe
A foto real do carro daquele ano em sangria total, com o véu neutro, o nome da equipe em headline condensada (até 88px) e, embaixo, o nome do chassi. No pé, uma faixa de carbono a 88% com os dois pilotos como linhas de torre de tempos: retrato quadrado de 52px (ou monograma na cor da equipe), nome condensado em maiúsculas, idade e contrato, e nível, moral e pontos à direita. Os números da equipe (posição, pontos, meta) ficam no placar do topo, não na foto. O crédito da foto (12px, link sublinhado) fica sempre visível no pé. Sem foto: fundo na cor da equipe com véu de 55%. A capa fica escura nos dois temas.

### Faixa da temporada
Uma célula por etapa (mínimo 36px, rolagem horizontal), encostadas com fio de 1px: bandeira, posição de cada carro em número condensado e número da etapa. Etapas corridas em `superficie-1`, futuras em `carbono`; 1º lugar em `tinta` invertida, abandono em `vermelho-texto`, e a próxima com contorno interno de 2px em `tinta`.

### Próxima etapa
Bandeira e GP em título condensado, o traçado real do circuito em traço `tinta` de 3px entre dois fios (com crédito da geometria), os fatos em linhas de rótulo e valor separadas por fio (tempo, meta do patrocinador, meta da diretoria, alerta de caixa em vermelho) e o botão dourado reto no pé.

## Do's and Don'ts

### Do:
- **Do** separar superfícies por degrau de tom (`carbono` → `superficie-4`), sem contorno; na folha do chefe, separar blocos e linhas por fio de 1px em `regua`.
- **Do** reservar o dourado, no hub, para o item atual do trilho e para uma única ação principal por página.
- **Do** marcar o que é do jogador com a cor da equipe e a seleção e o destaque com `tinta`.
- **Do** creditar na tela toda foto do Commons (autor, licença, link) e cair no monograma na cor da equipe ou na foto da era quando não houver foto livre.
- **Do** usar algarismos tabulares em todo número comparável.
- **Do** manter as transições curtas e com `--ease-out` (cor em 150ms, toque em 120ms com `scale(.97)`), com hover só em `(hover:hover) and (pointer:fine)`, e desligá-las com a chave de movimento do jogo (`.sem-mov`). Elas vêm ligadas por padrão, mesmo com o movimento reduzido do sistema; a chave do jogo é quem desliga.

### Don't:
- **Don't** usar vidro, desfoque de fundo ou visual 3D; o dono rejeitou.
- **Don't** usar rosto, pintura ou foto gerados por IA.
- **Don't** usar faixa lateral colorida (`border-left`) em painel, aviso ou linha de tabela no hub; a linha nossa é preenchida no tom.
- **Don't** usar degradê fora do véu neutro de carbono sob texto sobre foto.
- **Don't** usar cor de cronometragem como decoração, nem cor sozinha para passar informação.
- **Don't** mostrar painel de recurso que o jogo não tem, nem número inventado.
- **Don't** voltar, na folha do chefe, ao painel genérico: caixas iguais com título e link "→" no pé, ícone em cada item do menu, pílula amarela no item atual, trio de números grandes na foto.
