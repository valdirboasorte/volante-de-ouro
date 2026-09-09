# 🏁 Volante de Ouro

Um simulador de carreira no automobilismo que roda inteiro em um arquivo HTML.
Sem servidor, sem build, sem dependência: abrir o `index.html` já é o jogo.

Você começa no kart, sobe pelas categorias de base e briga por um lugar no grid
da **Fórmula 1**, **IndyCar**, **NASCAR**, **Endurance**, **Stock Car**, **DTM**
ou **Fórmula E** — em qualquer ano entre 1950 e 2026.

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
- **O inverno** no lugar da planilha de pré-temporada. Quatro meses e duas ou
  três decisões: morar perto da fábrica, um preparador físico de verdade,
  simulador até enjoar, uma temporada paralela com risco real, semanas de kart
  na chuva, sumir do mundo, ou passar o inverno aparecendo. Cada uma pode sair
  melhor do que devia, funcionar, ficar no meio do caminho ou dar errado, e
  março responde em prosa. Passar o inverno num lugar acaba formando você.
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
- **Gerações que se renovam**: passado o último ano documentado, os pilotos de
  hoje envelhecem, param e dão lugar a nomes novos — com um fenômeno aparecendo
  de tempos em tempos para brigar com você pelo título.
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

## Estrutura

```
index.html      o jogo inteiro — HTML, CSS, dados e motor de simulação
manifest.json   manifesto PWA, para instalar como aplicativo
vercel.json     cabeçalhos de cache
```

## Créditos e uso de imagens

Os nomes de pilotos, equipes e circuitos são referências históricas usadas em
contexto de simulação. A área de imprensa exibe nomes, @s e fotos de perfis e
veículos de comunicação reais; esse material pertence aos seus respectivos
donos e é usado aqui sem vínculo, patrocínio ou endosso. As mensagens exibidas
são geradas pelo jogo e **não são declarações reais dessas pessoas ou veículos**.

Se você é dono de alguma dessas imagens ou perfis e quer que seja retirado,
abra uma issue — sai na hora.

## Modo realista — como o dinheiro funciona

Correr custa dinheiro, e quem paga é o piloto até chegar à categoria principal.
Mas **campeão não compra vaga**: quem ganha o campeonato é disputado pelas
equipes do degrau seguinte e sobe sem pagar. Vitórias e títulos pagam prêmio,
e toda temporada aparece uma mesa de patrocinadores para escolher — apoio
local, marca nacional ou grande anunciante, conforme o que você entregou na
pista. Quem não vence continua sentindo o bolso: sem orçamento, o mercado
mostra as escadas mais baratas em vez de encerrar a carreira.

## Gente

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

## Jornalistas

Quem cobre a categoria não é um alto-falante neutro. Cada um tem um critério
próprio do que é um bom piloto — o cronômetro, o pódio, a pessoa, a polêmica —
e escreve a partir dele: o mesmo quarto lugar vira "sólido" para um e "mais do
mesmo" para outro. Eles lembram como você os tratou, e o que escrevem chega ao
mercado antes de você. Dá para conversar em off, cobrar uma matéria, ou perder
um deles para sempre.

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

## As categorias nacionais são nacionais

A Fórmula 4 brasileira corre no Brasil, com grid 90% brasileiro. A italiana
corre na Itália e é a mais internacional das F4 — 55% de italianos, o resto
vindo de fora, como na vida real. Alemã, britânica, espanhola, francesa e
japonesa seguem a mesma regra: calendário só no próprio país, com autódromo
em atividade, e a maioria do grid local, com nomes que combinam com a
bandeira. Os campeonatos com poucos autódromos repetem circuito em fim de
semana duplo, que é o que acontece de verdade.

Fórmula Regional continua europeia e Fórmula 3 e Fórmula 2 continuam rodando
o mundo nos fins de semana da Fórmula 1, porque é isso que elas são.
