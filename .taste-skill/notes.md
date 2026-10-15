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
