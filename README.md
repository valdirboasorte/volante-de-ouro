# 🏁 Volante de Ouro

Um simulador de carreira no automobilismo que roda inteiro em um arquivo HTML.
Sem servidor, sem build, sem dependência: abra o `index.html` com a pasta
`assets` ao lado, onde ficam as fotografias.

A interface usa fotografias reais de corridas, nenhuma gerada por IA. Autor,
licença e página de cada uma estão em `assets/credits.json`, no fim deste
arquivo e nos créditos dentro do jogo.

## A tela de abertura

O primeiro quadro tem tudo para começar: o nome, **Iniciar carreira** e
**Chefe de equipe**, as logos das sete categorias (cada uma abre a ficha já
naquela categoria) e três cartões com foto — **Piloto**, **Chefe de equipe** e
**Modo cenário**. Embaixo, as oito décadas, cada uma com uma foto real daquela
época (Ascari em 1953, Stewart em 1968, Lauda em 1975, Senna em 1985, Prost em
1990, Schumacher em 2004, Hamilton em 2016, Verstappen em 2023), os cenários
históricos e os outros caminhos: assumir um piloto real, as sete carreiras,
arquivo, lendas, recordes e como funciona.

As cores são as da primeira versão — preto carbono, vermelho para agir,
dourado para vitória e título — com cantos redondos, botões em pílula e
títulos condensados em maiúsculas. As animações vêm ligadas; quem preferir
desliga no botão ao lado do tema (ou no rodapé), e a escolha fica guardada no
aparelho.

## O que tem dentro

- **Oito décadas jogáveis**, cada uma com seu regulamento, sua confiabilidade,
  seu nível de risco e seu sistema de pontuação.
- **Calendários reais** — as 77 temporadas de F1, corrida por corrida, nos
  circuitos que existiam em cada ano.
- **Escalações reais, ano a ano** — F1 de 1950 a 2026 e IndyCar de 1996 a 2025.
  Em 2001 o Barrichello está na Ferrari e o Alonso na Minardi, como foi.
- **Idade e fase de carreira certas** — a tabela de nascimento e estreia cobre
  521 pilotos. Senna tem 34 anos em 1994; o Alonso de 2001 é um estreante de 19,
  não o bicampeão de 2005.
- **Retrospecto completo** de cada corrida de cada temporada.
- **Sexta-feira na garagem**, antes de cada prova. Não são três barras: é o
  engenheiro chegando com o boletim dividido por trecho de pista — o que ele
  mediu na telemetria, o que ele só achou olhando você passar, e o que não deu
  tempo de olhar. Você responde trecho por trecho, e não dá para atacar tudo:
  dois trechos por fim de semana é o que a equipe consegue. Nenhum número
  aparece na tela; o ponto certo existe e fica escondido. Uma em cada quatro
  impressões dele aponta para o lado errado, e nem a telemetria é sagrada.
  Junto vêm cinco maneiras de montar o carro — do sábado, do domingo, de janela
  larga, de faca no osso — e um boletim do tempo em prosa, sem porcentagem, que
  erra mais nos anos 50 do que hoje. Depois da bandeirada o dado real volta e
  diz o que era verdade: o que fica guardado é o conhecimento da pista e o
  histórico de acertos do engenheiro.
- **A pré-temporada** no lugar de uma planilha. Quatro meses e duas ou
  três decisões: morar perto da fábrica, um preparador físico de verdade,
  simulador até enjoar, uma temporada paralela com risco real, semanas de kart
  na chuva, sumir do mundo, ou passar a pré-temporada aparecendo. Cada uma pode sair
  melhor do que devia, funcionar, ficar no meio do caminho ou dar errado, e
  março responde em prosa. Passar a pré-temporada num lugar acaba formando você.
- **Traços que ninguém te contou**: todo piloto nasce com uma ou duas coisas —
  homem de chuva, piloto de uma volta só, piloto de domingo, sangue-frio, mão
  pesada, racha sob pressão. Valem desde a primeira corrida e não aparecem em
  lugar nenhum. Nenhum é bônus: cada um dá numa ponta e tira na outra. A
  descoberta vem do que acontece, e o controle é o companheiro de equipe —
  mesmo carro, mesma garagem. Primeiro vira suspeita; depois de muitos
  domingos, deixa de ser coincidência.
- **Modo rápido**, que se liga e desliga no meio da carreira: a equipe monta o
  carro e distribui o treino, e você cuida só de contrato, mercado e das
  decisões do piloto.
- **Modo realista**, onde correr custa dinheiro. A escada europeia pede de
  € 15 mil no kart regional a € 2,4 milhões na Fórmula 2, e quem paga é o
  piloto: só na categoria principal a equipe passa a pagar você. Patrocínio,
  apoio da academia e a origem da família decidem até onde a conta fecha — e
  quando não fecha, o mercado passa a mostrar as escadas mais baratas
  (Stock Car brasileira, NASCAR, endurance), que é como muita carreira rápida
  e sem dinheiro realmente acontece. Inclui relações com o engenheiro-chefe e
  o companheiro de equipe, amizades no paddock, investimentos, dias extras de
  teste e o que se faz com o dinheiro fora da pista.
- **Um mundo de pilotos que continua** depois dos dados: cada piloto tem
  identidade, idade, nível, teto e trajetória; quem está na base sobe, fica ou
  para conforme os resultados, gente nova entra por baixo aos poucos, e depois
  de 2026 a categoria principal tem um mercado com contratos e renovações (veja
  "Um mundo que continua").
- **Ranking dos maiores da história** por categoria, com o seu piloto encaixado
  na posição real — títulos valem 100 pontos, vitórias valem 8, para todo mundo.
- **Modo cenário**: assuma Massa em 2008, Hamilton em 2021, Senna a partir de
  1994, Kubica a partir de 2011 — e reescreva o que veio depois.
- **Assumir qualquer piloto real** do grid de qualquer ano, em qualquer categoria.
- Mercado de pilotos com memória, academias de formação, contratos, demissão por
  desempenho e aposentadoria com curvas de carreira diferentes para cada piloto.
- Área de imprensa que muda com a época: rádio até 1989, TV nos anos 90, portais
  nos anos 2000 e 2010, redes sociais de 2020 em diante — com quase 300 falas
  diferentes e memória para não repetir a mesma piada.
- **Modo chefe de equipe**: o outro lado do muro dos boxes. Assuma qualquer
  equipe real de qualquer ano, funde uma e estreie direto na Fórmula 1, ou
  comece numa categoria de base e suba degrau por degrau (veja abaixo).

## Ganhar campeonato é difícil

Um piloto muito bom tem vantagem e nenhuma garantia. Com o melhor carro do
grid e adaptação completa, o título da Fórmula 1 sai em cerca de um terço das
temporadas — o resto se divide entre vice, azar mecânico e a temporada em que
nada funciona. Nas categorias de carro igual é mais difícil ainda: NASCAR e
Fórmula E chegam à última prova com três ou quatro pilotos vivos, contra um ou
dois na Fórmula 1.

O equilíbrio foi conferido em temporadas simuladas repetidas, não escolhido em
percentual. Na Fórmula 1, o campeão sai de um dos três melhores carros quase
sempre; companheiros de equipe separados por até dois pontos de habilidade
dividem os duelos (50% a 60%), e o melhor por mais de seis vence 77% a 89%
deles. Na IndyCar, com carro igual, saem nove a dez vencedores por ano, a pole
vence 15% a 17% das corridas e o companheiro mais de seis pontos melhor vence
78% dos duelos. Na NASCAR são catorze vencedores por ano e a diferença de
piloto pesa menos, porque oval de pelotão e especialidade de traçado contam
muito.

No kart, o título no primeiro ano fica entre 20% e 45% conforme talento e
equipamento, com vice e pódio muito prováveis. O grid de base acompanha o
nível de quem está correndo nele: um campeonato de kart é cheio de gente
talentosa, e sempre tem alguém tão rápido quanto você.

Começar tarde é mais difícil, não impossível. Quem cria um piloto de 24 anos
estreia na Fórmula 2; com 27 ou mais, direto na categoria principal — sempre
numa equipe do meio para trás. Ele chega mais perto do próprio teto, aprende
depressa nos primeiros anos e tem o auge depois da estreia. Nos testes, cerca
de um em cada cinco desses pilotos termina algum ano no top 5 da Fórmula 1,
contra quase metade de quem começou no kart.

### Dificuldade

Na ficha da carreira (e a qualquer momento, pela barra da carreira) dá para
escolher **Tranquilo**, **Equilibrado** (o padrão, também para saves antigos)
ou **Desafio** (o jogo sem ajuda, como era antes). O mundo, a IA e as regras
são os mesmos nas três; muda só o que pesa do seu lado:

| | Tranquilo | Equilibrado | Desafio |
|---|---|---|---|
| Ritmo na classificação e na corrida | +2,5 | +1,2 | 0 |
| Quebras do seu carro | metade | ¾ | iguais |
| Suas batidas | 60% | 80% | iguais |
| Evolução até o potencial | +25% | +10% | igual |
| Interesse das equipes no mercado | +3 | +1,5 | 0 |
| Paciência da equipe antes de dispensar | alta | média | a de sempre |
| Chance de lesão | metade | ¾ | igual |
| Pneu no limite aguenta, em média | 3 voltas | 2 voltas | 1 volta |
| Quanto sai do bolso pela vaga (modo com dinheiro) | 50% | 70% | 100% |

Medido na escada simulada (`node testes/escada.js`, estreia aos 8 em 2012,
modo com dinheiro): no Desafio 42% das carreiras ficavam presas no kart e 38%
chegavam à F1; no Equilibrado 92% chegam à F4 e 67% à F1; no Tranquilo, 75%.

### Como o equilíbrio de carreira foi calibrado

Em 200 carreiras simuladas por lote (`node testes/balanco.js 40 8,12,15,18,22
2000 3`), olhando o título por temporada de quem teve carro entre os dois
melhores, apareceram três causas — e nenhuma foi resolvida com teto ou cota de
títulos:

- o seu piloto evoluía até um teto mais baixo e mais devagar que um piloto da
  IA com o mesmo talento (o mesmo potencial terminava 2 a 3 pontos abaixo);
- a faixa de "talento de ponta" ficava abaixo do nível dos bons pilotos reais
  da categoria principal;
- só a IA tinha a "fome de campeonato" (menos acidente e erro mais barato para
  quem briga por título): o seu carro de ponta abandonava o dobro.

Depois da correção (lote de 200 carreiras, estreia em 2000): 68% chegam à F1
(9% dos menos talentosos, 57% dos medianos); quem tem talento de ponta (84–88
de potencial) ganha pelo menos um título em 30% das carreiras e 6% das
temporadas com carro top-2 (antes, 4% e 0%); talento geracional é raro (3% no
sorteio) e domina quando tem carro (39% das temporadas com carro top-2). 12%
das carreiras ganham algum título e 6% chegam a quatro ou mais. A cauda
extraordinária existe (o recorde do lote foi 15 títulos, em 1 de 200
carreiras): o piloto geracional quase sempre consegue mudar para o melhor
carro, e a reação dos rivais depois de títulos seguidos é pequena.

## Talento não é a mesma coisa que saber correr ali

Cada categoria tem identidade própria — variância, peso da experiência, peso
da consistência, idade ideal, tempo de adaptação e o quanto o grid é apertado.
E cada piloto tem uma **adaptação** por categoria, construída correndo e
perdida ficando longe. Um campeão de Fórmula 1 que desembarca na IndyCar sabe
pilotar; não sabe oval, bandeira, combustível nem os caras que vão brigar com
ele. Chegar ao nível dos nativos não dá vantagem — apenas para de atrasar.

O parentesco entre categorias decide quanto do que você sabe serve: um
monoposto ensina outro monoposto, um carro de teto ensina outro carro de teto,
e um oval não se parece com nada.

Há também a **especialidade de traçado**, medida contra o companheiro de
equipe — mesmo carro, mesma garagem, mesmo fim de semana. É o que permite a um
especialista de oval bater um campeão de F1 em Indianápolis tendo overall
inferior.

## Quem está no grid

Sete arquétipos: meteoro, metrônomo, piloto de domingo, especialista de
sábado, o que bate, o completo e o irregular. Cada rival tem consistência
própria, especialidade de traçado para a vida inteira e forma do ano. O erro
de piloto é coisa separada do acidente — a curva perdida que custa quinze
segundos é o que separa rápido de campeão.

Três a seis candidatos ao título por temporada concentram os pontos, para que
o campeonato vá até o fim.

## Os campeonatos reais

O jogo traz um catálogo de 122 campeonatos reais, de 1950 a hoje: F1 e tudo o
que leva a ela (F2, F3000, GP2, F3 europeias e nacionais, Fórmula Regional,
Fórmula Renault, F4, Fórmula Ford, Vee, kart), a escada americana (AAA, USAC,
CART, IndyCar, Indy Lights, Indy Pro 2000, USF2000, Atlantic), turismo, GT,
endurance, stock e Fórmula E. Cada um tem o nome oficial de cada época, país,
nível, tipo, sucessor e, temporada a temporada, o que se sabe dela: a lista de
inscritos com equipe, carro e número, a classificação final, o campeão e o
calendário.

Esses dados saem da Wikipedia em inglês, uma página por temporada, e cada
temporada guarda de onde veio (a página e a revisão lida). **Nada ali é dado
como verificado**: é uma fonte só. Uma temporada aparece como *grid real* quando
a lista de inscritos foi lida; como *só a classificação* quando a página tem
apenas a tabela final (quem não pontuou pode faltar); e como *pendente* quando
não há página ou a tabela não pôde ser lida. Nessas, o grid continua simulado,
como sempre foi, e o jogo não inventa nome nenhum no lugar.

No jogo isso aparece de três jeitos:

- **O grid ao seu lado é o de verdade.** Na F3 britânica de 1995 você corre
  contra da Matta, Firman e Castroneves; na F3 Euro Series de 2005, contra
  Hamilton, Vettel e Sutil. Quem chegou à F1 no jogo tem o mesmo nome nos dois
  lugares, então o garoto que você enfrentou na base é o mesmo que aparece no
  grid da F1 anos depois.
- **A janela Campeonatos** (no menu do topo) lista todos, com filtros por ano,
  região, país, nível, tipo e situação, e mostra cada temporada: pilotos na
  ordem do campeonato, equipe e carro, campeão, calendário, campeões de todos os
  anos e a faixa de cobertura (verde: grid lido; amarelo: só a classificação).
- **Todos os campeonatos são jogáveis.** No formulário de carreira, o
  campeonato de estreia pode ser qualquer um que existia naquele ano e aceita
  a sua idade, de qualquer país e de qualquer tipo de carro — F3 japonesa,
  BTCC, Super GT, Supercars, Fórmula Ford, kart. O jogo encaixa cada um numa
  carreira e num degrau: o BTCC na escada do DTM, o Super GT na do endurance,
  a F3 japonesa na da F1. Durante a carreira, a janela Campeonatos oferece
  trocar o campeonato do seu degrau por outro do mesmo nível.
- **Convites conforme o desempenho.** No fim de cada temporada, campeonatos
  reais de qualquer país podem ligar, com uma equipe que de fato corria ali:
  quem foi bem recebe convites do mesmo nível e de um acima, quem foi muito bem
  recebe mais e de equipes melhores, quem foi mal às vezes recebe um convite
  para recomeçar um degrau abaixo. Aceitar pode mudar de carreira — do BTCC
  para a Stock Car, por exemplo.
- **Grid, equipes e calendário reais.** Quando a temporada tem fonte, o grid é
  o de verdade e as pistas são as daquele ano, na ordem real (BTCC 2020:
  Donington, Brands Hatch, Oulton Park, Knockhill…), desde que o jogo tenha os
  circuitos; senão, o calendário é montado como antes.
- **Dos 8 anos em diante.** A carreira pode começar aos 8, no kart. Ninguém
  sobe antes da idade do degrau: kart até os 14 (o Mundial a partir dos 12), F4
  e Fórmula Ford aos 15, F3 aos 16, F2 aos 17 e F1 aos 17 (18 a partir de 2016).

A escada também deixou de ter anacronismo: o degrau abaixo da F1 é a Fórmula 2
europeia até 1984, a F3000 de 1985 a 2004, a GP2 de 2005 a 2016 e a Fórmula 2
a partir de 2017; a Fórmula Júnior some em 1963; a Fórmula Ford Brasil só
existe de 1971 a 1995. O que falta, campeonato por campeonato, está em
[`ferramentas/historico/RELATORIO.md`](ferramentas/historico/RELATORIO.md).

## Um mundo que continua

Os pilotos vivem num registro persistente, um por categoria principal. Cada um
tem identidade estável (nome único, país, ano de nascimento), nível, teto,
curva de carreira e a trajetória ano a ano: categoria, equipe e posição final.
Clicar em qualquer nome da classificação abre a ficha dele.

**O que é real e o que é projeção.** Enquanto há dado, o mundo segue a
história: o grid real da F2 (2017-2025), da F3 (2019-2025) e da Regional
(2020-2025), a escalação da Fórmula 1 (1950-2026) e da IndyCar (1996-2025), e a
estreia de quem chegou à categoria principal — Senna corre a F3 de 1983 porque
estreou na F1 em 1984. O que falta é simulado, e o jogo diz isso: o cabeçalho
da temporada mostra se o grid é o real daquele ano, real em parte ou projetado,
e a ficha de cada piloto diz se a carreira dele é registro ou construída pelo
jogo. Nenhum grid de 2026 em diante para a base, nem da categoria principal
depois de 2026, é dado histórico.

**Quem só tem o dado da base** (Hauger, Maini, Fornaroli) recebe uma nota na
mesma escala de quem a história levou à F1: o campeão da F2 fica perto de 72,
como um estreante, e o teto sai da colocação. O resultado de cada ano real
puxa a nota e o teto para cima: quem venceu a F3 não continua com a nota de
quando estreou no fundo da Regional. Na base corre muito filho de piloto
famoso, então o Mansell da F3 de 2024 é o Christian, não o Nigel; o mesmo vale
para Giuliano Alesi, Marino Sato, Brando Badoer e Charlie Wurz, entre outros.

**A passagem de ano**, quando o dado acaba, é progressiva. Todo mundo envelhece
e evolui (ou estagna, ou cai, conforme a idade e o teto). Na base, sobem os que
terminaram no terço de cima — o resultado que você viu na pista é o que conta
—; quem passou da idade ou fica três anos no mesmo degrau sai; quem é bom e
fica sem lugar na Fórmula 2 vira opção de reserva; e gente nova entra pelo kart
conforme as vagas abrem. De 2025 para 2026 a Fórmula 2 continua com os mesmos
pilotos de 2025, menos os que subiram ou pararam. Os degraus são contados a
partir do topo, para que a continuidade sobreviva à troca de nome das
categorias (F3000, GP2, F2).

**O mercado da categoria principal** depois de 2026 vale para todas as
equipes: contratos são cumpridos até o fim, quem termina contrato pode renovar
ou sair, e as equipes escolhem da mais forte para a mais fraca, cada uma
levando o melhor nome disponível para ela — com peso para resultado, idade,
experiência na categoria, continuidade e o teto dos jovens. Um piloto fraco não
chega a uma equipe de ponta, porque ela tem opção melhor; um campeão não acaba
numa equipe pior, porque as melhores escolhem antes. Real ou não, quem fica
sem vaga por dois anos para.

**As equipes também mudam**: depois de 2026 a força de cada uma deriva com
memória, a cada cinco anos um regulamento novo mexe mais no grid, e a
hierarquia herdada se dilui com o tempo — em quarenta anos simulados, seis
equipes diferentes têm o melhor carro. Nas categorias de base, a forma de cada
estrutura muda de um ano para o outro.

Saves feitos antes do mundo existir abrem normalmente: o mundo nasce do último
grid salvo, e quem estava nele continua.

## O fim de semana

Sexta tem duas ou três sessões de treino, e cada uma serve para uma coisa só:
acerto, simulação de classificação, simulação de corrida, teste de compostos,
trabalho em tráfego ou poupar o carro. O engenheiro conclui alguma coisa ao
fim de cada sessão — e nem sempre é o que aconteceu.

A classificação é a daquele ano: duas tardes cronometradas até 1995, uma hora
com doze voltas até 2002, a volta única de 2003, as duas voltas somadas de
2004-2005, Q1/Q2/Q3 com combustível de corrida até 2009, a eliminação
progressiva de 2016, tomada de tempo individual na NASCAR, quatro voltas
cronometradas na IndyCar até 1997, grupos por posição no campeonato na
Fórmula E. Onde o regulamento permite, você decide quando entrar na pista —
pista limpa e sem borracha, o fim da sessão com a pista no ponto e o risco de
não completar a volta, vácuo na reta, ou espaço para andar sozinho.

Metade dos fins de semana traz um imprevisto — na sexta, no sábado ou na
manhã de domingo — e sempre com uma escolha: o motor com leitura estranha
(trocar e perder posições no grid, ou arriscar), a peça nova que chegou antes,
a batida no treino, a frente fria que obriga a fechar o acerto antes de saber
se chove, a onda de calor que derrete o pneu, os comissários, o patrocinador
que quer você num evento no meio do treino, a febre, o vazamento no câmbio, o
jogo de pneus que sobrou, o acerto radical do engenheiro. O efeito vai para
onde tem de ir: grid, ritmo, confiabilidade, pneu de largada, temperatura do
asfalto. O chefe de equipe tem os seus, resolvidos na tela antes da largada.

No modo completo o domingo é comandado do muro. A tela mostra o mapa do
circuito com os carros andando, a torre de cronometragem (intervalo, diferença
para o líder ou o pneu de cada um), o tempo e o radar de chuva, os lances da
corrida e um cartão para cada carro seu: posição, composto e desgaste do pneu,
combustível nas épocas de reabastecimento, quem está à frente e atrás.

**Quem chama o carro para os boxes é você.** A equipe faz a conta da
estratégia e avisa no rádio quando acha que é hora — a janela do plano, o pneu
no fim, o furo, o combustível acabando, a chuva apertando ou a pista secando, o
safety car que barateia a parada, a regra dos dois compostos — e o botão de
parar fica no cartão, com o composto. Se você passa da janela, a equipe refaz
as contas. O carro nunca para sozinho; só em *Simular até o fim* o muro assume
as paradas até a bandeirada. Você escolhe também o ritmo de cada carro
(atacar, normal, poupar) e, no modo chefe, a ordem de equipe quando um carro
seu está colado atrás do outro.

**Entre o grid e a largada existe a preparação.** Depois da classificação o
grid fica fechado e aparece, para cada carro seu, a posição de largada, o
tempo (pista, chuva agora, radar, temperatura do asfalto), os compostos que o
regulamento permite com aderência e duração estimadas, a sugestão da equipe,
o plano de paradas e as restrições (dois compostos, pneu de chuva). A corrida
só começa quando você confirma; o pneu confirmado é o que vai para a pista,
abrir a corrida não refaz o grid e confirmar duas vezes não corre a etapa duas
vezes. No modo piloto a escolha é do seu carro; no chefe, de cada carro.

**Cada resultado tem um estado explícito.** Terminou (com posição), abandono
por acidente, abandono por problema mecânico, não largou por lesão, não se
classificou (DNQ), não passou da pré-classificação (DNPQ), não largou (DNS) e
reserva, piloto de testes ou sem equipe (RES, TST, S/E) — quem estava no box
não aparece como abandono, e nenhuma narrativa fala de pódio sem posição
válida. Os saves antigos não são reescritos: o que faltava ali aparece como
"sem resultado registrado".

**O safety car agrupa de verdade.** O líder segue o ritmo do carro de
segurança e quem vem atrás anda mais rápido até alcançar a fila, que se forma
ao longo das voltas com a distância de seguir segura — ninguém é
teletransportado. A ordem na pista se mantém, os boxes funcionam, e
retardatário à frente do líder só vai para o fim da fila e recupera a volta
nas épocas em que o regulamento deixava (F1 2007–2009 e desde 2012, IndyCar
desde 2000, NASCAR desde 2009); a relargada sai com o pelotão agrupado. O
safety car virtual não agrupa: todo mundo anda no mesmo ritmo reduzido e os
intervalos ficam. O resultado é o mesmo de 1× a 64× e no modo rápido.

**O pneu no limite estoura quando acabar.** O desgaste trava em 100%; dali
em diante quanto o pneu ainda aguenta é sorteado uma vez (em média uma volta,
sem memória): pode estourar no segundo seguinte ou, com sorte, durar várias
voltas — e o ritmo continua caindo enquanto ele resiste. É a aposta de quem
estica o stint. O ponto do estouro é o mesmo em qualquer velocidade de
transmissão.

**Reserva de uma equipe grande, correndo numa categoria menor.** Quando há
proposta de reserva da categoria principal e vaga de corrida numa categoria
menor da mesma série, dá para acumular as duas (como Bearman em 2024, reserva
da Ferrari e titular na F2): você corre a temporada de baixo inteira e a equipe
grande chama você quando um titular dela não puder correr. A convocação corre
na principal e devolve a temporada de baixo intacta; o ano conta na avaliação
da equipe e no mercado seguinte. O vínculo acaba ao virar titular na principal,
ao assinar outro papel ou ao trocar de série — e o papel de reserva nunca
acompanha você para outra série.

A corrida não tem resultado marcado: o que acontece na pista é o resultado.
Cada carro freia, acelera, gasta pneu por quilômetro (o macio anda mais e dura
menos, o duro o contrário, e todo pneu despenca no fim da vida), pega vácuo e
ar sujo, ultrapassa onde dá para frear mais tarde, erra, fura pneu, quebra e
toma volta. O tempo muda durante a prova, a pista molha depressa e seca
devagar, e safety car e safety car virtual só entram nas épocas em que
existiam. A física é calibrada pelo tempo de volta real de cada época da F1 e
ajustada para cada categoria e nível, e o regulamento de pneus e de
reabastecimento é o daquele ano. A transmissão vai de 1× a 64×. No modo
rápido a corrida continua sendo calculada direto, sem tela.

## Campeonatos com regulamento de verdade

A **NASCAR** deixou de ser somatório: Chase de dez a partir de 2004, de doze
com bônus por vitória até 2010, com convidados até 2013, e o playoff
eliminatório de dezesseis desde 2014 — três cortes e quatro finalistas
decidindo numa corrida só. O líder da temporada regular perde o título em 85%
dos anos no formato eliminatório.

Na fase de doze a pontuação volta a 3000, na de oito a 4000 — sempre mais os
pontos de playoff guardados (cinco por vitória e, desde 2017, 15, 10, 8… pela
colocação na temporada regular) — e os quatro finalistas voltam a 5000 cada:
o campeão moderno termina perto de 5040, como na vida real. No Chase de 2004 a
2010 os dez ou doze classificados voltavam a 5000 e somavam o sistema Latford,
de até 185 por corrida: campeão perto de 6000 era o normal (Jimmie Johnson
fechou 2006 com 6475). Todo o grid pontua — até o 43º no Latford e de 2011 a
2016, até o 36º desde 2017, quando também entram os pontos de etapa.

Cada categoria pontua como pontuava na época: na Fórmula 1, até 1990, só os
melhores resultados contam para o campeonato de pilotos (os onze melhores de
1981 a 1990 — Senna é campeão de 1988 com menos pontos brutos que Prost, e a
tabela mostra os dois números), e o ponto da volta mais rápida vale de 2019 a
2024. Na IndyCar todo mundo que larga pontua, e as 500 Milhas valem dobrado de
2014 a 2023. Na Fórmula E a volta mais rápida valia dois pontos até 2017; no
DTM a escala foi 10-8-6 de 2000 a 2014. As categorias de base também seguem a
época: 9-6-4 até 1990, 10-6-4 nos anos 90, 10-8-6 nos 2000 e 25-18-15 depois.

O playoff é só da Copa NASCAR. Quem faz carreira na NASCAR passa pelo kart,
pelos Late Models e pela ARCA com pontuação normal, e a Busch Series (hoje
Xfinity) usa a tabela da Copa daquele ano. O **kart** pontua como kart: a
escala da CIK-FIA para a final, em que pontuam os quinze primeiros
(25-20-16-13-11-10-9-8-7-6-5-4-3-2-1), com o pior resultado do ano descartado,
como no Europeu da FIA e no Brasileiro de Kart. O campeão de uma temporada de
oito etapas termina com algo entre 120 e 175 pontos.

A **IndyCar** nunca foi uma coisa só: AAA até 1955, USAC até 1978, a CART até
1995, a cisão com a IRL de 1996 a 2007 e a reunificação em 2008. Nos anos da
cisão existem dois campeonatos, com equipes, calendários e força de carro
diferentes — e as 500 Milhas de um lado só.

## Correr em dois lugares

Todo contrato tem cláusula: exclusivo, padrão ou livre. No meio da temporada
chega convite para as 24 Horas, as 500 Milhas, etapas do DTM, a Corrida de
Duplas ou um oval da NASCAR. Aceitar rende fama, dinheiro e adaptação naquela
categoria, e cobra cansaço e risco num carro que você não conhece.

O mercado do fim de ano também não olha só para a sua categoria: IndyCar,
NASCAR, endurance, DTM, Fórmula E e Stock Car podem ligar, conforme a sua
reputação e o parentesco entre as categorias.

## Chefe de equipe

Um segundo jogo dentro do mesmo arquivo, com save próprio. Você não pilota:
contrata quem pilota, paga a conta e responde por ela.

- **Sete séries.** Fórmula 1, IndyCar, Endurance, Stock Car Brasil, NASCAR,
  DTM e Fórmula E, cada uma com as próprias equipes, pilotos, escalações,
  calendário, pontuação, escada de acesso e mundo de pilotos. Dá para fazer a
  carreira inteira fora da F1: subir da base leva ao topo da própria série.
  Saves de chefe anteriores, que não tinham série, abrem como Fórmula 1.
- **Três portas.** Assumir uma equipe real (a McLaren de 1988 vem com Senna,
  Prost, motor Honda e uma diretoria que espera título), fundar uma equipe e
  largar na categoria principal com o pior carro do grid e dinheiro de
  investidor, ou começar numa categoria de acesso daquela época e subir.
- **O mundo segue a história até você mexer nele.** As outras equipes têm a
  força que tinham em cada ano, e os pilotos vão para onde foram de verdade. A
  sua equipe sai do grid da história; quem você contratar deixa um buraco na
  equipe de origem, e ela preenche com o melhor que sobrou.
- **O carro**: aerodinâmica, chassi, motor e confiabilidade. O peso de cada
  parte muda com o regulamento — asa não existia antes de 1968, na era turbo o
  motor era meio carro, e com o efeito solo de volta em 2022 o assoalho decide.
  Nos anos de regulamento novo (1961, 1966, 1983, 1989, 1995, 1998, 2009,
  2014, 2017, 2022 e 2026) todo carro recomeça perto do zero, e quem guardou
  dinheiro para o carro do ano seguinte sai na frente.
- **Motor**: fornecedores reais de cada época, com rendimento, preço e
  exigência — a Honda de 1988 não vende para qualquer um, e o fornecedor menos
  procurado é obrigado a atender quem pedir. Ou faça o seu próprio.
- **Engenharia e instalações**: diretor técnico, projetista, aerodinâmica e
  motores, com engenheiros reais em cada janela de carreira (Forghieri, Murray,
  Barnard, Byrne, Brawn, Newey…). Fábrica, túnel de vento e simulador levam um
  ano para ficar prontos e custam manutenção para sempre.
- **Dinheiro**: patrocinadores de cada época (cigarro até a proibição europeia,
  energético nos anos 2000, cripto nos 2020, e alguns dão calote), prêmio de
  construtores, pilotos pagantes, dono ou fábrica, investidores que compram
  parte da equipe. Teto de gastos a partir de 2021, com auditoria. Falência de
  verdade.
- **Pilotos**: mercado com leitura dos engenheiros, interesse que depende do
  tamanho da equipe, contraproposta, recusa que vira manchete, piloto nº 1,
  reserva que substitui quem se machuca, pedido de saída quando uma equipe
  maior chama.
- **De onde vêm os pilotos**: o mercado da Fórmula 1 tem cinco abas — o grid,
  quem ficou sem vaga, a F2 e a F3 (Schumacher e Häkkinen na F3000 de 1990,
  Antonelli e Bortoleto na F2 de 2024) e pilotos de **outras categorias**
  (IndyCar, Endurance, Fórmula E, DTM e Stock Car: Palou, O'Ward, Rast). A
  nota de quem vem de fora é convertida para a escala da F1 pela diferença
  de quem correu nas duas na mesma época (Zanardi, Montoya, Bourdais;
  Buemi, Vergne, Vandoorne), pelo quartil de baixo, porque quem nunca chegou
  à F1 tende a valer menos do que quem foi e voltou. A NASCAR fica de fora:
  ninguém da lista correu nas duas, então não há como comparar. Quem já
  passou pela F1 leva a nota que tinha lá.
- **Reais até 2026, regens depois**: até 2026 o mercado e os olheiros só
  mostram gente que existe. De 2027 em diante entram também os pilotos que o
  mundo cria, marcados como **Regen**.
- **Academia**: de 3 a 8 vagas conforme o investimento, olheiros que erram
  menos quanto mais você investe, garotos de verdade na idade certa (Vettel e
  Hamilton aparecem na F3 de 2003; em 2024, Lindblad, Fornaroli e Taponen),
  e os melhores da F2 e da F3 com até 21 anos podem ir direto do mercado para
  a academia. A temporada de cada garoto entra na trajetória dele, com
  promoção a titular ou reserva e empréstimo para outra equipe.
- **Fim de semana**: estratégia por carro, modo de motor e ordem de equipe, a
  mesma cronometragem ao vivo do modo piloto com os dois carros em destaque, e pacotes
  de atualização que podem render mais do que o túnel prometia ou deixar o
  carro pior.
- **Acontecimentos**: espionagem, brecha no regulamento, patrocinador na
  primeira página, piloto na festa às quatro da manhã, uma equipe grande
  querendo o seu projetista, a guerra FISA-FOCA. Cada escolha tem chance
  escondida e resultado em quatro graus.
- **Diretoria**: meta de construtores definida depois dos testes e negociada
  na pré-temporada (aceitar, prometer mais em troca de verba, ou pedir
  paciência e perder um pouco de confiança), confiança que sobe e desce,
  último aviso e demissão — com propostas de outras equipes, se a sua
  reputação ainda valer alguma coisa. Quem é dono não é demitido, até vender
  parte demais da equipe.
- **De onde vem o dinheiro** de quem funda a equipe: próprio (menos caixa, a
  equipe é toda sua), um investidor forte (70%) ou um fundo bilionário (muito
  dinheiro e um conselho que pode te demitir desde o primeiro ano).
- **Banco**: empréstimo em três parcelas anuais com juros; a diretoria não
  gosta de dívida.
- **Patrocínio negociado**: pedir mais pode render 12% ou 25%, não mudar nada
  ou fazer a marca desistir.
- **Reservas e academia com função**: o reserva substitui quem se machuca,
  ajuda no desenvolvimento e, de 2003 em diante, pode rodar o primeiro treino
  livre no lugar de um titular — ganha experiência, e o titular chega ao
  sábado com menos acerto.
- **Candidatos com história**: no mercado, cada piloto mostra o que fez no ano
  anterior e abre a trajetória inteira, além da leitura incerta de nível dos
  seus engenheiros.
- **O mesmo mundo do modo piloto**: a base do modo chefe continua de um ano
  para o outro, os olheiros encontram garotos que existem no mundo (e seguem
  existindo se você não contratar), quem você contrata é seu — nem a história
  nem as outras equipes tomam de volta — e quem você dispensa volta ao mundo
  com a carreira que tiver. Depois de 2026 as equipes da IA contratam no
  mercado do mundo e mudam de força ano a ano.

### Fora da Fórmula 1

O que só a F1 tem fica só na F1: mercado de motores (comprado ou próprio),
regulamentos que zeram o carro, teto de gastos desde 2021, eventos ligados a
eles e o mercado que traz pilotos de outras séries. Nas outras séries:

- o carro pesa menos: a força da sua equipe sai da média do grid real e o
  desenvolvimento de chassi e confiabilidade move o carro na medida de
  `SERIES[sk].spec` (chassi quase único na IndyCar, na Stock e na Fórmula E);
- o dinheiro tem o tamanho da série (`Chefe.FATOR_SERIE`): orçamento, prêmios,
  patrocínio, custo de operação e de inscrição; salários de piloto caem menos
  que o orçamento;
- a tabela de equipes conta os dois melhores carros de cada uma por corrida,
  porque há equipes de três e quatro carros.

### A classificação do chefe

O fim de semana do chefe segue a ordem de verdade: decisões de sexta,
pré-classificação quando o regulamento tem, as sessões do formato daquele ano
e daquela etapa (Q1/Q2/Q3 com eliminação, a eliminação progressiva das duas
primeiras etapas de 2016, as voltas somadas de 2005, as voltas únicas de 2003
e 2004, as duas sessões até 1995, as fases da IndyCar e da NASCAR), grid
final, preparação e largada. Em cada sessão você escolhe a janela de cada
carro (sair cedo, no meio, no fim, procurar vácuo); um carro pode passar
enquanto o outro cai, e quem caiu não volta na sessão seguinte. Dá para rodar
uma sessão por vez ou simular a classificação inteira, salvar no meio e
continuar depois. A série, o ano e a etapa vão explícitos para o regulamento:
nada depende do save do modo piloto nem supõe Fórmula 1. A isenção da
pré-classificação sai do histórico da equipe (estreante não é isenta; quem
terminou o ano anterior entre as treze primeiras é).

### Cenários de chefe

Pontos de partida reais com objetivos e prazo, em "Cenários de chefe" (na
tela do modo chefe e em "Mais caminhos"):

| Cenário | Série / ano | Dificuldade | Objetivo principal | Prazo |
|---|---|---|---|---|
| Brawn GP | F1 2009 | Média | Título de construtores | 2009 |
| Andrea Moda | F1 1992 | Extrema | Chegar viva a 1993 | 1993 |
| McLaren | F1 1988 | Média | Começar 1989 com Senna e Prost | 1989 |
| Minardi | F1 2001 | Alta | Chegar viva a 2004 | 2003 |
| Williams | F1 2019 | Alta | Entre as seis primeiras de construtores | 2021 |
| A.J. Foyt | IndyCar 2021 | Alta | Entre as oito primeiras equipes | 2022 |

Cada um tem contexto ("o que aconteceu de verdade"), condições iniciais
("o seu ponto de partida"), restrições, objetivos intermediários
acompanhados durante o ano e critérios de sucesso e fracasso. A Brawn começa
com o carro entre os melhores, sem patrocinador principal, motor Mercedes de
cliente e caixa curto, sem dono rico; a Andrea Moda paga (ou não) o depósito
de equipe nova antes da primeira etapa e disputa uma pré-classificação com a
Brabham nas oito primeiras (condição do cenário, simplificada). Nenhum
resultado é decidido: nos testes a Brawn ganha o título em alguns lotes e
perde para a Ferrari em outros. O cenário salva e retoma com o save do chefe,
e depois do resultado a carreira continua sem prazo.

### Limitações conhecidas

- Sua equipe tem dois carros em todas as séries; as equipes da IA usam o
  número real de carros de cada época. No Endurance, cada carro tem um piloto
  principal: duplas e trios não são simulados.
- O playoff da NASCAR existe no modo piloto, não no modo chefe; os pontos de
  dono por carro da NASCAR e da IndyCar viram uma tabela de equipes.
- A gestão de energia da Fórmula E e as provas especiais da IndyCar estão na
  corrida ao vivo (regras de pneus, reabastecimento e safety car por série),
  mas não têm decisões próprias no muro do chefe.
- Antes de 2027, as equipes da IA seguem a história: força e pilotos de cada
  ano são os reais (menos quem você tirou delas). Elas não têm orçamento
  próprio; depois de 2026 a força delas deriva ano a ano, sem economia
  individual.
- O mundo é um por categoria principal: a Fórmula 2 que alimenta a F1 e a que
  alimenta a Fórmula E são registros separados.
- Não há grid documentado da base para 2026 no projeto; ele é projeção.
- As equipes da IA não contratam pilotos de outras categorias, e quem vem da
  IndyCar ou do DTM para a sua equipe não tem a carreira anterior simulada
  no mundo da F1 — a ficha mostra o registro real da categoria dele.
- Antes de 2017 não há grid real da F2 e da F3 no projeto: o mercado mostra só
  quem a história leva à F1 nos anos seguintes, e o resto do grid de base é
  criado pelo jogo (no modo de base, esses aparecem depois dos reais).
- A negociação de propostas do modo piloto vale para a categoria principal.
- Pilotos da IA não trocam de equipe no meio do ano.
- A força das equipes da IA vem da tabela de cada década: na F1 de 2000 a
  2009 a Ferrari tem a mesma força o tempo todo, então em 2009 ela é mais
  forte do que foi de verdade (e é a rival da Brawn no cenário).
- No primeiro ano de uma equipe assumida, fundada ou promovida o carro é o
  daquela temporada: o plano de desenvolvimento só pode melhorar, não refaz
  o carro do zero no primeiro inverno.

## O regulamento do fim de semana

Antes da classificação há um resumo do regulamento daquela etapa: formato de
classificação, quantos largam, pré-classificação, regra dos 107%, pneus,
reabastecimento e pontos. O formato é por etapa, não por ano:

- 2005: tempos somados (sábado com pouco combustível + domingo de manhã com o
  da corrida) só nas seis primeiras etapas; depois, volta única no sábado;
- 2016: eliminação progressiva só nas duas primeiras etapas; depois, Q1/Q2/Q3;
- 2003 e 2004 com voltas únicas, 1996–2002 com doze voltas, até 1995 duas
  sessões, 2006–2009 com o combustível do Q3 na largada;
- F1 de 1977 a 1995: largam no máximo 26; de 1977 a 1992, com mais de 30
  inscritos, as equipes fora da cota passam pela pré-classificação (DNPQ) e
  os mais lentos ficam fora do grid (DNQ);
- 500 Milhas: 33 largam, média de quatro voltas; Bump Day até 2009, Fast Nine
  2010–2021, Last Row Shootout desde 2019, Top 12 e Fast Six desde 2022;
- NASCAR: 43 largam de 1998 a 2015; 40 desde 2016, com vaga garantida para os
  times com licença.

O formato usado em cada etapa jogada fica guardado no save (`qualiFmt`), e
quem ficou fora do grid também (`naoLarga`).

Fontes: [história dos formatos de classificação (formula1.com)](https://www.formula1.com/en/latest/article/deciding-the-grid-a-history-of-f1-qualifying-formats.1oh1hemlnZ4x9rt2nff8vn),
[pré-classificação (grandprix.com)](https://www.grandprix.com/features/joe-saward/news-feature-pre-qualifying.html),
[Bump Day (indycar.com, 2013)](https://www.indycar.com/News/2013/05/5-18-Bump-Day-primer),
[formato de 2022 das 500 Milhas (the-race.com)](https://the-race.com/indycar/indy-500-gets-revised-qualifying-format-for-2022/).

Simplificações: o jogo não mede tempo absoluto, então a regra dos 107% aparece
no resumo mas não tira ninguém do grid; limites de largada de provas
específicas (Mônaco e outras dos anos 50 a 70) não são modelados; a isenção da
pré-classificação sai do resultado da equipe no ano anterior (o regulamento
usava os semestres anteriores); nas 500 Milhas as inscrições avulsas não são
simuladas, então o bumping só acontece se o grid do jogo passar de 33 carros;
corridas sprint não existem no jogo.

## Apoie o projeto

"Apoie o projeto" fica no menu superior com destaque amarelo (também no menu
do celular), no rodapé e na tela inicial, e abre uma página própria (atalho:
`#apoie`): por que apoiar (manutenção do site e ideias para o futuro, como
multiplayer cooperativo e saves na nuvem — marcadas como ideia, sem data nem
promessa), o cartão do Pix com QR Code, chave e o botão "Copiar chave Pix",
as instruções de pagamento, a transparência (o jogo continua
gratuito; doar é opcional e não dá vantagem nenhuma) e o agradecimento, com o
botão de voltar ao menu principal.

A configuração inteira está em [`assets/doacao.js`](assets/doacao.js):

- `pix.chave` e `pix.beneficiario`: a chave como está no banco e o nome do
  recebedor, para a pessoa conferir (os dois são obrigatórios para o Pix aparecer);
- `pix.copiaecola`: o "Pix Copia e Cola" gerado pelo banco. O jogo confere o
  código (CRC16, arranjo `BR.GOV.BCB.PIX` e a mesma chave) antes de mostrar o QR
  Code — se não bater, a imagem não aparece;
- `pix.qrcode`: a imagem do QR Code gerada pelo banco, dentro do projeto. Ela
  só aparece com um código conferido, e o teste lê a imagem pixel a pixel
  (`ferramentas/pix/ler-qr.py`, só com Python e PIL) para garantir que é o
  mesmo código;
- `link.url` e `link.nome` (opcionais): uma página de doação externa, com `https://`.

O jogo não gera chave, QR Code nem link, não processa pagamento, não pede dado
nenhum e não dá vantagem a quem doa. Sem nada configurado, a página diz que as
doações ainda não estão disponíveis. A cópia só é confirmada quando funciona.

## Rodar localmente

Abra o `index.html` no navegador. É só isso.

Se preferir servir por HTTP (para testar o comportamento de PWA, por exemplo):

```bash
npx serve .
```

## Publicar

O projeto é estático. Qualquer hospedagem de site serve — Vercel, Netlify,
Cloudflare Pages ou GitHub Pages. Na Vercel não é preciso configurar nada:
o `index.html` na raiz é detectado sozinho.

A migração de `volante-de-ouro.pages.dev` para `volantedeouro.com`, incluindo
a proteção dos saves antigos e a regra no painel da Cloudflare, está descrita
em [infra/cloudflare/README.md](infra/cloudflare/README.md).

## Estrutura

```
index.html      o jogo inteiro — HTML, CSS, dados e motor de simulação
assets/         fotografias, filme de 1906, logos das categorias e credits.json
manifest.json   manifesto PWA, para instalar como aplicativo
vercel.json     cabeçalhos de cache
dados/          o banco histórico (historico.js), gerado por ferramentas/historico
testes/         verificações que rodam no Node, sem navegador (não vão para o site)
ferramentas/    geração dos traçados reais, do banco histórico e capturas de tela
```

## Testes

O jogo continua sem dependência nenhuma; os testes só precisam do Node. Eles
carregam o `index.html` inteiro numa página falsa e jogam de verdade:

```bash
node testes/rodar.js
```

Conferem as regras do campeonato (pontos, construtores, desempate, a tabela ao
vivo terminando no resultado calculado, o histórico salvo), a continuidade e a
ausência de duplicados no mundo de pilotos ano a ano, carreiras jogadas além de
2026 nos dois modos, o mercado e a negociação, as decisões do modo chefe, o
mercado do chefe (de onde vem cada candidato, nada de regen antes de 2027,
academia cheia recusando garoto, uma temporada jogada com um piloto da
IndyCar e um da F2), a corrida contada volta a volta (de 1975 a 2024, do kart
à F1: termina na ordem do resultado, volta mais rápida certa, todo abandono
acontece na pista, a tabela da bandeirada é a classificação final, ninguém fica
trocando de posição com o mesmo carro volta sim, volta não), o clique duplo nos
botões que avançam o jogo, um save feito pela versão anterior abrindo na atual,
o tamanho do save em carreiras de 25 anos e o banco histórico (nenhum
anacronismo nas escadas de 1950, 1960, 1975, 1985, 1995, 2005, 2015 e 2026, o
grid real aparecendo na carreira, a escolha de campeonato de estreia e um save
de antes do banco abrindo e seguindo sem piloto duplicado).

Também conferem a porta da categoria principal (campeão da F2 sem vaga, grid
todo contratado, rápido promovido, campeão tardio contra jovem excepcional,
reserva e testes sem promoção garantida, substituição de titular machucado e
convocação de academia), as estatísticas separadas por categoria e os rankings
sem participação indevida, bens de luxo por idade e época, o apoio ao projeto
escondido sem configuração, pneu de largada e depois de um toque, relações com
contexto e memória, o regulamento por etapa (2005, 2016, pré-classificação de
1989, 500 Milhas), o modo chefe nas sete séries e as telas novas em inglês,
espanhol e japonês.

Os testes desta rodada reproduzem os relatos: resultados com estado explícito
(`resultados.js`: temporada de reserva sem ABD nem "Pnull", DNQ e DNPQ fora da
conta de abandonos, abandono de um carro de ponta em temporada normal,
o mesmo resultado em velocidades diferentes), classificação do chefe e
preparação (`chefe-quali.js`: Q1/Q2/Q3, 2016, 2005, pré-classificação de 1989,
IndyCar e NASCAR, um carro passa e o outro cai, salvar no meio, grid
preservado, pneu por carro sem corrida duplicada), safety car
(`safety-car.js`: agrupamento progressivo, ordem, retardatário por
regulamento, relargada, safety car virtual, 1×/8×/25×), idade por época
(`entrada-epoca.js`), cenários (`chefe-cenarios.js`) e a página de
apoio (`doacao.js`).

Para atualizar o banco histórico (baixa só o que não está no cache; veja
[`ferramentas/historico/LEIAME.md`](ferramentas/historico/LEIAME.md)):

```bash
node ferramentas/historico/importar.mjs todos
node ferramentas/historico/gerar.mjs
```

Para refazer os traçados reais a partir dos arquivos de origem, e as capturas
das telas internas (precisa do Chrome e da skill de design instalada):

```bash
node ferramentas/pistas-gerar.js
node ferramentas/capturas.mjs
```

Para medir o equilíbrio da simulação em temporadas repetidas, e a dificuldade
de carreira por idade de estreia:

```bash
node testes/equilibrio.js 15
node testes/dificuldade.js 25 classico
```

Lotes reproduzíveis de carreiras inteiras (talento, chegada à principal,
títulos, idade de estreia, anos de reserva), o mesmo piloto em carros de
níveis diferentes e a economia do modo chefe em cada série:

```bash
node testes/balanco.js 40 8,12,15,18,22 2000 3
node testes/carro.js 16 2024 1
node testes/chefe-economia.js 4 4
```

## Créditos e uso de imagens

Os nomes de pilotos, equipes e circuitos são referências históricas usadas em
contexto de simulação. A área de imprensa exibe nomes, @s e fotos de perfis e
veículos de comunicação reais; esse material pertence aos seus respectivos
donos e é usado aqui sem vínculo, patrocínio ou endosso. As mensagens exibidas
são geradas pelo jogo e **não são declarações reais dessas pessoas ou veículos**.

Se você é dono de alguma dessas imagens ou perfis e quer que seja retirado,
abra uma issue — sai na hora.

**Campeonatos e temporadas.** As listas de inscritos, classificações,
campeões e calendários do banco histórico foram lidos das páginas de
temporada da Wikipedia em inglês (texto sob CC BY-SA 4.0), pela API pública
do MediaWiki; cada temporada guarda a página e a revisão de origem, e a janela
Campeonatos do jogo leva direto a ela.

**Traçados.** Os 40 traçados reais usados na corrida (50 circuitos do jogo,
cada versão com o ano em que entrou em uso) vêm do
[bacinger/f1-circuits](https://github.com/bacinger/f1-circuits), licença MIT,
com a cópia da licença em `ferramentas/terceiros/f1c`. A escala é ajustada ao
comprimento oficial e o sentido de corrida foi conferido.

Outros 127 traçados (149 circuitos do jogo, contando os que aparecem com outro
nome) vêm do **OpenStreetMap — © colaboradores do OpenStreetMap, dados sob a
licença ODbL** ([openstreetmap.org/copyright](https://www.openstreetmap.org/copyright)).
`ferramentas/pistas-osm.mjs` localiza cada circuito pela Wikipedia, baixa as
vias de corrida pela API Overpass (pedidos em lote, com pausa e cache), monta o
anel e só aceita o que confere com o comprimento oficial; o resultado fica em
`dados/tracados.js` e o que deu certo ou não, em
`ferramentas/pistas-osm/RELATORIO.md`. O mapa mostra a fonte e o que é
aproximado (linha de chegada, boxes, sentido quando a via não indica mão única).

Os 98 circuitos que ainda não têm traçado real — ruas montadas para uma corrida,
circuitos de estrada antigos e os kartódromos genéricos do jogo — correm num
traçado esquemático, e o jogo diz por quê.

**Fotos e filme** (`assets/credits.json` tem título, autor, licença e página
de cada um; `assets/eras` e `assets/cartoes` guardam versões reduzidas):

- Carlos Sainz em Zandvoort, 2024 (foto do alto) — Steffen Prößdorf, CC BY-SA 4.0, via Wikimedia Commons
- Alberto Ascari em Zandvoort, 1953 — Harry Pot / Anefo, CC0, via Wikimedia Commons
- Jackie Stewart na chuva, Zandvoort 1968 — Joost Evers / Anefo, CC0, via Wikimedia Commons
- Niki Lauda e Jean-Pierre Jarier em Zandvoort, 1975 — Rob Croes / Anefo, CC0, via Wikimedia Commons
- Ayrton Senna no Lotus 97T, 1985 — Dima Moroz, CC BY 2.0, via Wikimedia Commons
- Alain Prost em Phoenix, 1990 — Stuart Seeger, CC BY 2.0, via Wikimedia Commons
- Michael Schumacher em Silverstone, 2004 — Martin Lee, CC BY-SA 2.0, via Wikimedia Commons
- Lewis Hamilton em Silverstone, 2016 — Andrew e Alan Frost, CC BY 2.0, via Wikimedia Commons
- Max Verstappen no Red Bull Ring, 2023 — Lukas Raich, CC BY-SA 4.0, via Wikimedia Commons
- Capacete no cockpit — Carl Gelin, licença Unsplash
- Pit stop da Emil Frey Racing — Paul Krüger, licença Unsplash
- Grande Prêmio da França de 1906 (filme) — Shell Video Library, domínio público, via Wikimedia Commons

As fotos mostram o mundo real das corridas e não indicam apoio de pilotos,
equipes ou fotógrafos ao jogo.

**Logos das categorias** (`assets/logos`): Fórmula 1, IndyCar, NASCAR, FIA
WEC, Stock Car, DTM e Fórmula E, via Wikimedia Commons, em domínio público por
serem logos de texto. São marcas registradas dos seus titulares e aparecem só
para identificar cada campeonato.

**Tipografia:** Archivo, de Omnibus-Type, licença SIL Open Font.

**Bandeiras** (`assets/flags`): SVGs do [flag-icons](https://github.com/lipis/flag-icons/tree/v7.3.2),
versão 7.3.2, de Panayiotis Lipiridis, licença MIT (cópia em `assets/flags/LICENSE`).
Os arquivos ficam junto do jogo para funcionar sem conexão e sem depender de
suporte a emojis de bandeiras no aparelho.

**Kartódromos argentinos:** Zárate, Ciudad Evita, Colonia Caroya e Río Cuarto.
Os nomes e locais foram conferidos na [Copa RF](https://rfmotores.wordpress.com/kartodromos/),
na [CAFAEC](https://cafaec.com.ar/autodromos/), no
[município de Colonia Caroya](https://www.cdcoloniacaroya.gob.ar/Ordenanza/Detalles/927)
e no [município de Río Cuarto](https://transparencia.riocuarto.gov.ar/100-obras/obra.php?id=45).
A presença de Zárate em 2005 consta na [revista oficial do ACA](https://www.autoclub.org.ar/digital/autoclub/AutoClub_186_Jul-Sep05.pdf).
O ano da primeira evidência consultada limita o uso desses nomes no jogo;
não é apresentado como data de inauguração. Os traçados são esquemáticos.

## Modo realista — como o dinheiro funciona

Correr custa dinheiro, e quem paga é o piloto até chegar à categoria principal.
Mas **campeão não compra vaga**: quem ganha o campeonato é disputado pelas
equipes do degrau seguinte e sobe sem pagar. Vitórias e títulos pagam prêmio,
e toda temporada aparece uma mesa de patrocinadores para escolher — apoio
local, marca nacional ou grande anunciante, conforme o que você entregou na
pista. Quem não vence continua sentindo o bolso: sem orçamento, o mercado
mostra as escadas mais baratas em vez de encerrar a carreira.

## Parceiros

O paddock não é uma barra de 0 a 100. Cada pessoa tem um jeito — fechado,
orgulhoso, leal, político, inseguro, ambicioso, veterano cansado — que muda
como ela te recebe no primeiro dia e o que funciona com ela depois. Cada uma
quer alguma coisa que não é o que você quer: o engenheiro que quer o crédito,
o que quer sair para uma equipe grande, o companheiro que quer a sua vaga, o
chefe que precisa agradar patrocinador.

E cada uma guarda quatro coisas separadas a seu respeito: **confiança**,
**respeito**, **afeto** e **tensão**. Dá para ser respeitado e detestado ao
mesmo tempo, que é como funciona. Nenhuma aparece como número — aparece como
frase.

Doze conversas, cada uma com três respostas de tom diferente: no técnico,
direto, na pressão, na frieza, na aliança, na frente de todos. A chance de
funcionar sai do jeito da pessoa, do que ela já pensa de você, do que ela
lembra e de quem você é como piloto, e não é mostrada em lugar nenhum. O
resultado tem quatro alturas, não duas. Errar o tom com a pessoa errada custa
caro — e é assim que você descobre que ela não reage bem a cobrança pública.

Pedidos aparecem no meio da temporada. Promessas ficam anotadas: prometer
levar o engenheiro junto e trocar de equipe sem ele custa a relação, a memória
dele e um pedaço da sua fama. Garagem em guerra anda menos — tensão alta tira
tempo de pista e confiabilidade.

Trocar de equipe troca engenheiro e chefe, e o antigo fica guardado com tudo
que lembra. Se você voltar, ele ainda está lá.

## Imprensa

Quem cobre a sua carreira são os veículos de cada época — rádio até 1989,
TV nos anos 90, portais nos 2000 e 2010 — e, de 2020 em diante, as contas da
F1 brasileira nas redes, cada uma reagindo do seu jeito ao seu domingo. Não há
jornalistas inventados pelo jogo.

## A vida fora da pista

Entre uma corrida e outra acontecem duas a quatro coisas por temporada que não
têm nada a ver com o cronômetro. As antigas continuam lá: o convite para a
noite antes do simulador, a provocação que vira rivalidade, o mentor que
aparece, a cobrança em casa.

E há sete em que **nenhuma escolha tem desfecho garantido**: o homem com
dinheiro e sem pressa, correr com a costela trincada, a noite que três
celulares filmaram, a ordem no rádio a oito voltas do fim, o programa de
formação que paga tudo e cobra tudo, o teste que a sua equipe não pode saber.
Cada opção resolve em quatro alturas, a chance nunca aparece, e catorze delas
plantam **semente**: pegar dinheiro sem perguntar nada volta três anos depois
com o triplo na pasta; correr machucado sem contar volta como a costela que
nunca mais deixa de doer; o vídeo daquela noite reaparece quando você já é
alguém.

## O mercado é feito de informação, não de planilha

A força do carro do ano que vem deixou de ser um número exato. O que você vê é
uma **faixa**, e a largura dela é o quanto você enxerga o mercado: quem tem
empresário, amigos no paddock, cabeça técnica e nome lê o grid quase exato;
quem não tem ninguém escolhe no escuro.

E toda vaga vem com uma ou duas coisas que alguém garantiu para você assinar —
o motor novo que chega em maio, o número um da equipe, o patrocínio já
fechado, a liberação se aparecer coisa melhor. Cada garantia tem uma fonte (a
equipe, seu empresário, um jornalista, o paddock, gente da engenharia) e uma
verdade escondida. Em julho a temporada mostra o que era projeto e o que era
conversa — e fica anotado quem te enganou, para a próxima vez que essa fonte
falar.

Na categoria principal, cada proposta mostra o **interesse** da equipe, e a
tela lista **quem não ligou e por quê**: você está abaixo do que eles
procuram, eles querem mais resultado antes, acham que você passou do auge,
preferiram manter a dupla ou fecharam com outro, ou não perdoaram uma quebra
de contrato. Dá para **negociar** uma vez por proposta — mais um ano, status
de primeiro piloto ou contrato livre —, e a equipe cede, mantém ou retira a
oferta conforme o quanto ela te quer. Assinar com outra equipe no meio do
contrato tem preço: multa no modo realista, fama, e a equipe antiga não volta
a chamar por dois anos.

## Empresários

Dezoito empresários reais da Fórmula 1, cada um só nos anos em que atuou de
verdade: Bernie Ecclestone cuidando de um piloto só no fim dos anos 60, Willi
Weber e Julian Jakobi nos 90, Flavio Briatore e Nicolas Todt depois, e hoje
ex-pilotos que viraram empresários — Mark Webber — ou pilotos ainda na ativa
que já cuidam da carreira de outros, como Fernando Alonso.

Cada um tem três números: **mercado** (quem atende o telefone dele),
**dinheiro** (quanto arranca no contrato e no patrocínio) e **portas** (quanto
consegue onde normalmente não se entra). Em troca fica com 10% a 22% de tudo
que você ganha. Os melhores não assinam com qualquer um: exigem fama ou nível
para atender.

## Academias até a categoria principal

Os convites são sorteados entre os programas disponíveis na época, no país e
na carreira do piloto. Podem aparecer no kart, na F4, na Fórmula Regional,
na F3, na F2 ou nas outras categorias de base. Resultados, confronto com o
companheiro, nível atual e potencial oculto influenciam o interesse; programas
com mais estrutura são mais seletivos. Um piloto excepcional costuma atrair
mais interesse, mas nenhum convite ou programa é garantido.

Aceitar uma academia salva o vínculo imediatamente. Renovar ou trocar de
equipe na base não o desfaz. A academia avalia o desempenho ao fim de cada
temporada: pode manter a aposta depois de um ano fraco ou dispensar o piloto.
Anos ruins seguidos aumentam o risco, enquanto potencial e adaptação dão mais
paciência. Pódios no campeonato e títulos protegem o vínculo. A avaliação
considera o tamanho do grid, o companheiro e as quebras mecânicas, e fica salva
para não mudar ao reabrir o jogo. Quem foi dispensado não recebe um novo
convite do mesmo programa nas duas temporadas seguintes.

A formação termina na estreia na Fórmula 1 ou em outra categoria principal,
independentemente da equipe, sem multa ou perda de moral, fama ou relações
por sair da academia. O painel mostra o programa ativo durante a base e a
formação concluída depois de chegar ao topo. A escolha é salva assim que o
convite é aceito. O balanço da temporada informa cobranças e dispensas.

Saves antigos recuperam o vínculo perdido por incompatibilidade com uma
equipe da base quando guardam o registro dessa saída. Dispensar por desempenho
continua sendo uma decisão válida e não é revertido ao carregar o save. Se a
data de entrada não foi preservada, ela não é inventada. Carreiras que já
chegaram ao topo não voltam à formação.

## Onde e com que idade a carreira começa

O kart nasceu nos Estados Unidos em 1956, chegou à Europa por volta de 1960,
ganhou comissão internacional (CIK) em 1962 e Mundial em 1964. Antes disso, e
nos países onde ele ainda não tinha chegado, a carreira começa nas corridas
regionais de carros. A criação mostra o mínimo da época e do país e o motivo,
e a largada não aceita menos. Simplificações do jogo, não regras legais de
cada década:

| Época e lugar | Primeiro degrau | Idade mínima |
|---|---|---|
| Antes de 1960, qualquer país | Corridas regionais de carros | 16 |
| 1960–1964: EUA, Canadá e Europa ocidental | Kart | 12 |
| 1960–1964: demais países | Corridas regionais de carros | 16 |
| 1965–1969: também Brasil, Argentina, Austrália, Japão, México, África do Sul e o resto da Europa | Kart | 12 |
| 1970–1984, qualquer país | Kart | 10 |
| Desde 1985, qualquer país | Kart (categorias infantis) | 8 |

Nos anos 50 e 60 as carreiras também começavam mais tarde e iam mais longe:
auge e fim de carreira ficam três anos depois antes de 1965 e um ano depois
até 1979. Quem entra mais tarde ainda evolui (nos testes, carreiras criadas em
1955 aos 16 e 18 anos chegam à F1 em boa parte dos casos). Saves antigos
criados com outra idade abrem iguais.

## O kart é passagem, não carreira

Duas temporadas de kart e a escada segue, campeão ou não — e nunca se volta
para o kart. Um garoto que entra aos treze está em carro aos quinze, que é
como acontece de verdade. As categorias de acesso seguintes admitem mais
tempo, e se a conta não fecha o mercado mostra rotas mais baratas.

## Uma janela por vez

Nada nunca abre por cima do que você está lendo. Acontecimento, cobrança de
promessa, convite de outra categoria, mesa de patrocínio, pré-temporada: quem chega
e encontra a tela ocupada entra numa fila e espera a vez.

## As categorias nacionais são nacionais

O Kart Regional corre apenas no país do piloto: um argentino começa na
Argentina, um brasileiro no Brasil e assim por diante. O kart nacional
também fica no país do campeonato escolhido; o Mundial continua viajando
por diferentes países. Se faltarem kartódromos cadastrados naquele país ou
ano, o calendário usa pistas locais esquemáticas, com o país correto, sem
completar as rodadas com provas no exterior. Poucas pistas podem receber
mais de uma etapa. Ao abrir um save antigo, só as etapas futuras são
corrigidas; resultados e fins de semana já iniciados ficam preservados.

O grid do Kart Regional tem pelo menos 85% dos rivais do país do piloto,
com nomes locais e identidades persistentes de uma temporada para a outra.
Os estrangeiros conservam sua nacionalidade: a maioria local é formada pela
seleção de inscritos, sem trocar a bandeira de pessoas existentes. Saves
antigos recebem o ajuste do grid antes do primeiro fim de semana; temporadas
já iniciadas preservam seus participantes e resultados.

A imprensa usa a nacionalidade e o gênero do seu piloto nas referências
à sua origem, inclusive nas mensagens antigas que tinham texto fixo de
piloto brasileiro. Os veículos e seus públicos continuam sendo os de cada
época; isso não muda a nacionalidade de quem está correndo.

A Fórmula 4 brasileira corre no Brasil, com grid 90% brasileiro. A italiana
corre na Itália e é a mais internacional das F4 — 55% de italianos, o resto
vindo de fora, como na vida real. Alemã, britânica, espanhola, francesa e
japonesa seguem a mesma regra: calendário só no próprio país, com autódromo
em atividade, e a maioria do grid local, com nomes que combinam com a
bandeira. Os campeonatos com poucos autódromos repetem circuito em fim de
semana duplo, que é o que acontece de verdade.

Fórmula Regional continua europeia e Fórmula 3 e Fórmula 2 continuam rodando
o mundo nos fins de semana da Fórmula 1, porque é isso que elas são.

## Idiomas

O seletor PT / EN / ES / JP na barra superior muda a apresentação entre português,
inglês, espanhol e japonês. A preferência fica salva no navegador, separada da carreira,
e pode ser alterada durante o jogo. Os catálogos são arquivos locais em
`assets/i18n/`, disponíveis também ao abrir `index.html` diretamente.

A tradução cobre a abertura, criação de piloto/equipe, painéis, tabelas,
contratos, academias, finanças, pré-temporada, rádio, notícias, imprevistos e
trocas de temporada dos modos piloto e chefe. Nomes reais e nomes escolhidos
pelo jogador mantêm sua identidade; os nomes genéricos das equipes de kart
são localizados apenas na apresentação. Códigos de país, valores dos
formulários e dados do save permanecem originais. As buscas de países e
campeonatos aceitam os nomes em português
ou no idioma selecionado, com ou sem acento. Atributos acessíveis e mensagens
criadas dinamicamente acompanham o idioma; retornar a PT recupera o texto
original. Novos textos precisam de entradas nos três catálogos para evitar
o retorno ao texto original em português.

O japonês inclui menus, carreira, decisões, conversas, imprensa e corrida ao
vivo. Os arquivos `ja*.js` contêm pares português/japonês; os arquivos
`complete-*.js` reúnem as mensagens complementares dos três idiomas. A apresentação usa
fontes japonesas do sistema e distingue idade (歳) de duração de contratos
(年). A busca também aceita katakana de meia largura e letras de largura inteira.

Para ampliar a tradução, acrescente pares nos catálogos ou linhas
`português|inglês|espanhol` nos arquivos compartilhados, incluindo o par
correspondente nos catálogos japoneses. Marcadores como `{0}`
e `{eu}` precisam ser preservados. `node testes/idiomas.js` verifica a troca
de idioma, texto dinâmico, formulários, preservação do save e os marcadores.
`node testes/idiomas-cobertura.js` exercita mensagens realmente geradas em
carreiras das sete séries, nos três modos de chefe, nos imprevistos e no rádio,
além de regressões de pontuação, números, nomes e busca traduzida;
`node testes/grid-kart.js` verifica os grids locais dos 96 países.
