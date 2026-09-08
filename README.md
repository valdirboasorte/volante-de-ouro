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
- **Acerto do carro** antes de cada prova: asa, suspensão e motor. Asa e
  suspensão têm um ponto certo que muda com o traçado e com a chuva; o motor é
  troca pura entre ritmo e confiabilidade. O engenheiro sugere, mas erra — e o
  boletim do tempo é probabilidade, não promessa.
- **Pré-temporada**: pontos de preparação entre físico, simulador, racecraft,
  pista molhada e trabalho com os engenheiros, mais um compromisso que decide
  se você cuida de si ou da equipe. Investir na fábrica melhora o carro e a
  relação interna, e custa a sua própria evolução.
- **Modo rápido**, que se liga e desliga no meio da carreira: a equipe monta o
  carro e distribui o treino, e você cuida só de contrato, mercado e das
  decisões do piloto.
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
