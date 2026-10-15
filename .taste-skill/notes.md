# Notas do redesign — Volante de Ouro

## 1. Brief e projeto
- Assunto: jogo de carreira no automobilismo, no navegador, em um único index.html.
- Público: quem gosta de automobilismo (brasileiro, em português), joga no computador e no celular.
- A única coisa que a página precisa fazer: pôr a pessoa numa temporada (começar carreira ou continuar).
- Stack: HTML/CSS/JS puro, sem build. Saves no localStorage (vdo_save, vdo_chefe) — não mudar formato.
- Marca existente: o nome "Volante de Ouro". O dourado vem do nome; o resto era preto carbono + vermelho + DIN.
- Imagens que existem de verdade: nenhuma foto própria. Existe a interface real do jogo (tabelas de tempos,
  classificação, contrato, balanço da equipe) e 40 traçados reais de circuitos (bacinger/f1-circuits, MIT).
  Do mundo do assunto: fotos de arquivo de corridas em acervos abertos (Nationaal Archief, Commons).

### Inventário (o que só este jogo tem)
1. O nome: Volante de Ouro — o volante, o troféu dourado.
2. Qualquer temporada de 1950 a 2026: 77 anos, cada um com calendário real (1988: 16 corridas, Jacarepaguá → Adelaide).
3. Grids reais de cada ano (1988: Senna e Prost na McLaren; Berger e Alboreto na Ferrari).
4. Sete campeonatos: Fórmula 1, IndyCar, Endurance, Stock Car Brasil, NASCAR, DTM, Fórmula E — cada um com a sua escada.
5. A escada: kart regional → nacional → mundial → base → topo.
6. Os dois lados do muro dos boxes: piloto (do kart ao grid) e chefe de equipe (contratos, motor, túnel de vento, dono).
7. O impresso do mundo dele: a ficha de inscrição, o contrato, a folha de classificação com tempos, a placa de boxes.
8. Os traçados reais: Interlagos anti-horário, o S do Senna; 40 circuitos desenhados de verdade.
9. Os números: pontuação de cada época (9-6-4-3-2-1 em 1988), 26 carros, voltas, tempos.
10. 14 cenários reais (Massa 2008 — o título por um ponto; Hamilton 2021; Senna a partir de 1994).
11. A restrição: tudo roda no aparelho, o save fica só ali.
12. Cores da cronometragem: roxo = melhor do grid, verde = melhor pessoal, amarelo = bandeira amarela.

## 2. O argumento
1. Você escolhe a temporada, de 1950 a 2026, e o grid é o daquele ano. → a frase do herói muda com o ano e a categoria escolhidos (peça viva).
2. O jogo entrega documentos de verdade: classificação, contrato, campeonato, balanço. → índice de saídas com a folha real ao lado.
3. Do outro lado do muro dos boxes, você decide o carro. → painel fixo do carro que muda com os controles (orçamento por área, motor, piloto nº 1).
4. Sete campeonatos, cada um com sua escada. → lista de duas pontas: campeonato, anos, degraus.
5. A história real pode ser reescrita. → livro de cenários (14), com o traçado da pista ao lado.
6. Comece agora; o save fica só no aparelho. → tile de ação.

## 4. A ideia
Neste site, **a temporada que você escolhe (qualquer ano de 1950 a 2026, com calendário e grid reais)** vira
**os controles sobre a frase**: o ano, a categoria e o lado do muro reescrevem o título e o primeiro botão.
Teste do concorrente: F1 Manager só tem a temporada atual; Motorsport Manager é fictício. A frase não serve para eles.
Peça viva: escolher o ano e a categoria e ver "Fórmula 1, 1988 — 16 corridas, de Jacarepaguá a Adelaide; Senna e Prost na McLaren"
e o botão "Começar em 1988" já leva para a ficha com esse ano e essa categoria marcados. Fallback sem script: o texto padrão e o botão.

## Notas da direção
- Direção: product-performs (seed 2026509223). Escolhida porque o que só este jogo tem é dado; mostrar a interface funcionando prova isso.
- Paleta: proporções da ficha (preto + tinta clara + um acento); o acento vem do assunto: o dourado do nome, no lugar do carmim.
  O carmim fica para o que a cronometragem pinta de vermelho (abandono, bandeira vermelha).
- Tipo: Albert Sans 400/500/600 (Google Fonts); fallback system-ui.

## Redesign 2 — tela única de vidro (2026-10-15)

Pedido: abertura moderna em vidro, cheia de animação, no espírito da floria-landing-page; uma tela só, sem rolar,
com tudo à vista e botões para as outras opções (como a versão publicada); logo antiga (bandeira quadriculada);
o site inteiro no mesmo sistema; não parecer feito por IA.

Direção: sentence-as-layout, seed 1441220769 (sheet em direction.json).
- Paleta: a ficha deu "navy on white", que contradiz o pedido escuro. Mantidas as proporções (um fundo, uma tinta,
  um destaque), cores tiradas do assunto: o preto da corrida noturna e o dourado da logo antiga.
- Tipo: General Sans sem algarismos tabulares (medido: "1" 122px x "0" 233px em 10 dígitos) — a cronometragem precisa.
  Redraw 1: Newsreader (serifa de livro, contra o pedido moderno). Redraw 2: Libre Franklin (sem tabulares).
  Escolhida à mão: Archivo, uma família só, larga (wdth ~112-125) no título como grafismo de corrida, normal no texto.
- Vidro e pílulas: proibidos pelas regras da casa, usados porque o usuário pediu explicitamente. --allow no inspector.

Inventário: o nome (volante de ouro, o dourado); a bandeira quadriculada 4x4 da logo; 1950–2026; sete campeonatos;
o muro dos boxes (piloto ou chefe); grids reais por ano (Senna e Prost na McLaren em 1988); a escada do kart ao topo;
os cenários (Fittipaldi 1976, Hamilton 2021); a cronometragem; o save que fica no aparelho.

Ideia: a temporada escolhida vira a frase da tela — "Fórmula 1 [foto da época] em 1988" — e a foto dentro da frase é
uma janela para o ano: troca com a época e o campeonato. Corrida noturna ao fundo, painéis de vidro como os monitores
do muro dos boxes.
Peça viva: ano, campeonato e lado do muro mudam a frase, a foto da época, o número de corridas, o grid real, a prévia,
a escada.

Copy: título dinâmico (2 linhas); apoio = frase() existente; ação "Começar em 1988" / "Assumir uma equipe em 1988";
painel: Ano, número de corridas com o calendário, Campeonato, Lado do muro; abas Grid, Prévia, Escada, Cenários, Mais.

Verificação (2026-10-15): inspector com movimento emulado (.taste-skill/inspect-motion.mjs, escrito pela outra sessão;
o Windows daqui informa movimento reduzido) — 0 FAIL. Avisos defendidos: vidro, borda de 1px do vidro e pílula do topo
(pedidos do dono); título sobre a foto (a página não rola; véu neutro sob o texto); "primeira ação" no tablet aparece
só no meio da animação de entrada. Lint: 0 FAIL (bordas do vidro marcadas).
Fotos novas: Singapura 2012 (chensiyuan, CC BY-SA 4.0), Le Mans 2011 (Alessandro Prada, CC BY-SA 2.0), Schumacher 2004
(Martin Lee, CC BY-SA 2.0); Sainz 2024 e Prost 1990 copiadas de assets/editorial (outra sessão), com crédito.
Crítica: a abertura lê "temporada + foto da época" em 1 segundo; o console carrega o resto sem rolagem. Falta: o vão
no pé da aba Ano no tablet em pé; a lista do console corta a última linha (rola por dentro).

## Redesign 3 — a versão publicada, moderna (2026-10-15)

Pedido: o vidro de tela única ficou "esquisito"; voltar ao layout e à arte da versão publicada (carbono, vermelho,
dourado, DIN condensada, tudo à vista com botões), sem quadradão: cantos redondos, fotos reais, logos das categorias,
uma foto por época; referência visual: um mock feito por IA (só a composição; nenhuma imagem gerada).
Composição seguida: a do mock e da versão publicada (pedido explícito), não um novo sorteio. Paleta e tipo mantidos da
marca (equivalente a --keep palette,type): carbono #0b0c0e, vermelho #e2231a (ação), dourado #f0c12e (vitória/título,
e a palavra "Ouro" do nome — a palavra é a cor); Archivo condensada (wdth 72) no lugar da Bahnschrift, que só existe
no Windows.
Primeiro quadro (1440x900 sem rolar): nome, Iniciar carreira / Chefe de equipe, 7 logos (cada uma abre a ficha naquela
categoria), 3 cartões com foto (Piloto, Chefe, Cenário). Embaixo: 8 décadas com foto, cenários, mais caminhos, rodapé.
Inspector (movimento emulado): 0 FAIL, 0 WARN. Lint: 0 FAIL (avisos: travessões do texto do jogo).

Correções (2026-10-15): animações ligadas por padrão (pedido do dono; botão para desligar); modo cenário chamava UI.startScenario (o certo é Game.startScenario); a barra de ano do "assumir piloto" redesenhava a janela no meio do arraste; exemplos com pilotos reais; tamanhos de fonte < 13px dos estilos do JS subiram para 13-14px; botões do modo chefe arredondados.
