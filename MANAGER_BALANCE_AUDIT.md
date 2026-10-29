# Manager 2.1 — auditoria de bugs e de equilíbrio de longo prazo

Fase 0 da atualização pedida a partir do relato de um jogador que levou uma
carreira de chefe de 1950 a 2022. Data: 2026-10-27. Base: a versão do GitHub
(`volante-de-ouro-main`), `index.html` com 30,5 mil linhas.

Nada aqui foi corrigido ainda: este documento diz o que o código faz, o que
causa cada relato e o que será mudado. As linhas citadas são do `index.html`
antes das mudanças.

**Legenda**

- **BUG** — erro confirmado no código, reproduzido ou lido sem ambiguidade.
- **EQUILÍBRIO** — comportamento medido em simulação que produz o relato; a
  causa é de projeto, não um erro de digitação.
- **UX** — o sistema existe e funciona, mas a tela não mostra o que o jogador
  precisa para decidir.
- **AUSENTE** — o sistema pedido não existe.

Gravidade: **alta** (perde dados ou quebra o jogo de longo prazo), **média**
(decisões sem efeito ou estratégia dominante), **baixa** (informação faltando).

## Como medi

Antes de mexer em qualquer coisa, a suíte (`node testes/rodar.js`) passou em
59 dos 61 grupos. Os dois que falharam (`migracao.js` e `migracao-historico.js`)
montam saves antigos com `git show <commit>:index.html`, e esta cópia veio do
GitHub como zip, sem `.git`. É uma limitação do ambiente, não do código.

Para os relatos de longo prazo escrevi um medidor de carreira longa: quatro
sementes, de 1950 a 2022, numa equipe que começa como a quarta mais forte do
grid. Ele foi rodado com três políticas de jogador:

| Política | O que faz | Títulos em 73 anos | Maior sequência | Posição média 2000–2022 |
| --- | --- | --- | --- | --- |
| ao acaso (o piloto automático dos testes) | decide o inverno ao acaso | 0 a 1 | 1 | 8,4 |
| máximo | o mesmo, com todo o desenvolvimento no nível 4 | 0 a 3 | 3 | 5,3 |
| **competente** | constrói as instalações, contrata o melhor staff, desenvolve no máximo que o caixa permite e contrata os dois melhores pilotos do mercado | **22 a 36** | **7 a 18** | **1,3** |

O relato se confirma, mas só com quem joga bem: a partir dos anos 1990 a equipe
competente termina em 1º quase todo ano, com reputação 100. Em 2000–2022 as
quatro sementes somam 63 títulos em 92 temporadas.

## 1. Carreiras de chefe não aparecem em Lendas e Recordes

| | |
| --- | --- |
| Relato | Uma carreira de chefe de 1950 a 2022 não apareceu em Lendas nem em Recordes. |
| Código | `UIC.fimCarreira` (28584) grava em `vdo_chefe_hall`. `UI.hall` (22199), `UI.records` (22237) e `UI.lendas` (21796) só leem `vdo_hall` (pilotos) e o save de piloto. **Nenhuma tela lê `vdo_chefe_hall`.** |
| Segunda causa | `fimCarreira` só é chamada na venda da equipe, na falência ("fechar as portas") e no "Encerrar a carreira" depois de uma demissão (28520, 28561, 28576, 29134). **Não existe aposentadoria voluntária.** Quem joga até 2022 sem ser demitido nunca chega a registrar a carreira: ela continua só em `vdo_chefe`. |
| Dados | O registro grava `nome, eq, cor, de, ate, tit, v, anos, motivo`. Não guarda pódios, poles, pontos, títulos de pilotos, equipes, categorias nem reputação. Mas `C.hist` (25671) guarda tudo isso por temporada, e `C.total` guarda `v, pod, tit, titP, gps, temporadas`. Os dois atravessam a troca de equipe (`assumirOutra`). |
| Armazenamento | O registro é pequeno; 73 temporadas não estouram a galeria. `Store.galeria` devolve `false` sem espaço e o save é mantido (está certo). |
| Classificação | **BUG**, gravidade **alta** |
| Correção | Botão "Encerrar a carreira" no chefe, com confirmação. O registro passa a ser reconstruído de `C.hist` + `C.total`: temporadas, títulos de construtores, títulos de pilotos da equipe, vitórias, pódios, poles, pontos, equipes, categorias, período e reputação final. A galeria ganha uma seção própria de chefes, sem pontuação de piloto (as estatísticas não são equivalentes). Recordes de chefe ficam numa tela própria, aberta também com a carreira em andamento. Registros antigos de `vdo_chefe_hall` (com menos campos) aparecem com o que têm, sem inventar nada. Uma carreira ainda guardada em `vdo_chefe` pode ser encerrada e registrada com os dados reais do save. |
| Arquivos | `index.html` (`UIC.fimCarreira`, `UI.hall`, `UI.records`, menu do chefe), `assets/i18n/novidades.js` |
| Teste | Carreira de chefe longa → encerrar → `vdo_chefe_hall` com as estatísticas que batem com `C.hist`; `UI.hall` mostra a seção; registro antigo de 9 campos abre. |

## 2 e 3. Evolução dos carros e domínio permanente

| | |
| --- | --- |
| Relato | Equipes pequenas não surpreendem, as grandes dominam por décadas, e o jogador foi campeão de 1970 a 2022. |
| Código: o teto | O carro do jogador mira `teto = 30 + 62·(1 − e^(−1,6·rel))·ef` (23166) e fecha 45% da distância por ano (23177). `ef` (eficiência, 23094) vai até **1,55** com staff e instalações de elite. No nível 5 de gasto, `1 − e^(−1,92) = 0,85`, então o alvo chega a `30 + 62·0,85·1,55 = 112`, preso em 100. `Chefe.forca` (22987) leva o carro 100 a uma força de **99**. |
| Código: as rivais | Até 2026 as rivais têm a força histórica fixa. As melhores ficam entre **92 e 97** por ano (medido: 1985 94, 2000 95, 2015 97, 2022 94), a média entre 71 e 82. Nada liga o carro do jogador à fronteira técnica da época: ele é absoluto, e pode passar de todo mundo por cinco pontos, todo ano. |
| Código: regulamento | Nos anos de `CH_REGRAS` (22631) o carro recua só metade do caminho até 45 (`v = 45 + (v − 45)·0,5`) e fecha 70% da distância no mesmo inverno. Um carro de 100 cai para 72 e volta a ~90 no primeiro ano. O comentário diz "todo carro recomeça perto do zero", mas o código não faz isso. A virada de regulamento não tem risco de conceito: um staff de elite sempre acerta. |
| Código: rendimentos | O gasto já tem retorno decrescente (os primeiros 28 milhões dão +37 de alvo, os últimos 18 dão +7), mas o retorno não diminui perto do limite técnico: o 99º ponto custa o mesmo que o 70º. |
| Medição | Política competente: a força média do carro sobe de 4º–6º no ranking (anos 60) para 1º–2º (anos 2000 em diante) e fica lá. |
| Classificação | **EQUILÍBRIO**, gravidade **alta** |
| Correção | (a) **Fronteira técnica por época**: o carro passa a ter retorno decrescente perto do melhor carro da época (a força histórica da melhor equipe do ano, ou a melhor rival gerida depois de 2026). Acima da fronteira, cada ponto custa mais. Dá para ser o melhor carro, mas não cinco pontos à frente de todos por décadas, e manter a liderança exige continuar investindo e acertando. (b) **Conceito no regulamento novo**: o carro de um regulamento novo sai de um sorteio de conceito, centrado no trabalho (staff técnico, túnel, verba guardada em `futuro`), com espalhamento que diminui com a qualidade do staff mas nunca zera. Uma equipe pequena e bem preparada pode acertar, e uma grande pode errar. Nada de embaralhar a cada ano: só nos anos de regulamento novo. (c) As rivais depois de 2026 recebem o mesmo sorteio de conceito em `iaInverno`. A história até 2026 não muda. |
| Arquivos | `index.html` (`aplicarPlano`, `iaInverno`, nova `Chefe.fronteira`) |
| Teste | Carreira longa com a política competente: a força do carro não fica acima da fronteira por mais que uma faixa; o domínio cai, mas a equipe competente continua brigando por título; nos anos de regulamento novo, a ordem muda às vezes, sem virar loteria. |

## 4. Moral dos pilotos com pouco impacto

| | |
| --- | --- |
| Código | A moral muda em muitos lugares: resultado da corrida (24200), ordem de equipe (−11), renovação, aumento, rebaixamento e eventos. Ela é **lida** só em dois lugares: classificação, `(moral − 60)·0,04` (23986), e corrida, por `moralDe` (24050). |
| Efeito | Moral 30 contra 90 dá 2,4 pontos de habilidade no total. A moral não entra no erro de pilotagem, nas batidas, na consistência, na vontade de renovar (`chanceAssinarBase`, `negociar`), nos pedidos de saída nem na reação a ordens de equipe. |
| Tela | Mostra só o número "Moral", sem dizer o que fez ela subir ou cair. |
| Classificação | **EQUILÍBRIO** (efeito pequeno demais) + **UX**, gravidade **média** |
| Correção | A moral passa a pesar na **consistência** (erro e batida, por `Gp`, só no modo gestão), na **chance de renovar e no salário pedido**, e no **pedido de saída**. Ordem de equipe com moral baixa pode ser contestada. Na velocidade pura o efeito continua pequeno. A ficha do piloto mostra os fatores: últimos resultados contra o esperado, papel na equipe, contrato e ordens recebidas. |
| Teste | Mesma corrida com moral 30 e 90: mais erros com a baixa, sem perda grande de velocidade; renovação mais difícil com moral baixa. |

## 5. Teto de gastos confuso

| | |
| --- | --- |
| Código | `Chefe.teto` (24459) só na F1, desde 2021, com o valor real de cada ano. O gasto contado entra por `lancar(..., true)`: staff, manutenção, desenvolvimento e peças. Os salários dos pilotos ficam de fora, como na regra real. A barra da temporada (`tetoHtml`, 27966) aparece só durante o ano, e o veredito (28526) só depois. |
| Falta | Não há aviso quando a regra entra em vigor, não há projeção até o fim do ano no inverno (quando se decide o plano), e não há lista do que conta e do que não conta. |
| Bug ligado | A punição de túnel (`penalTunel`, 25713/25724) vira **permanente**: `proximoAno` (25751) carimba o ano de novo todo ano, e o campo nunca é limpo. A tela diz "no ano que vem". **BUG**, gravidade **média**. |
| Classificação | **UX** + **BUG** |
| Correção | Painel do teto no inverno e na temporada: limite do ano, gasto contado, gasto excluído (salários de pilotos, motor do cliente, prêmios), restante, projeção até o fim do ano pelo plano escolhido, alerta a partir de 90% e as consequências. Aviso "Novo regulamento financeiro" no primeiro inverno com teto. A punição de túnel passa a valer só no ano seguinte ao estouro. |
| Teste | Antes de 2021 o painel não aparece; em 2021 aparece o aviso; a projeção bate com o gasto real; a punição de túnel some no segundo ano. |

## 6. Veteranos no auge por tempo demais

| | |
| --- | --- |
| Código | O piloto real usa `skillEm` (4645): a nota do auge menos `min(9, (idade − lim)·1,1)`, com `lim` de 42, 38 ou 36 pela época. **O declínio tem teto de 9 pontos** e é o mesmo para todos: um piloto de nota 98 nunca cai abaixo de 89, nem aos 50 anos. |
| Medição | Na carreira longa: Senna 95 aos 39 (1999), Stewart 94 aos 40, G. Hill 92 aos 40, M. Schumacher 93 aos 40. |
| Aposentadoria | `aposentouEm` (11173) sorteia o fim da carreira entre 33 e 43 anos, fixo por piloto. No mundo, um piloto real ainda num grid não se aposenta por idade. Um Senna mantido vivo depois de 1994 corre com 89–92 até os 44. |
| Classificação | **EQUILÍBRIO** (declínio limitado e igual para todos), gravidade **média** |
| Correção | Declínio individual e sem teto fixo, depois dos anos documentados (antes, a curva real manda). Cada piloto tem a sua idade de início do declínio e o seu ritmo, tirados de uma semente do nome (estável entre saves), e uma longevidade rara. A queda é crescente com a idade (o que se perde aos 42 é maior do que aos 37) e a experiência segura parte dela. A nota da época documentada não muda; só a extrapolação depois do último ano real de cada piloto. |
| Teste | Distribuição de notas aos 36, 40 e 44 anos: a média cai, alguns longevos seguem bons, ninguém com 92 aos 44 como regra; os cenários históricos (Senna de 1994) continuam com a nota real até onde há história. |

## 7. Pilotos da academia sem salário nem multa

| | |
| --- | --- |
| Código | `levarParaAcademia` (24529) zera `sal` (certo: academia não paga como titular; o custo é `custoAcademia`). Ao subir por `UIC.acad` (29083), o salário vem de `salarioPedido`, que **devolve 0 nas categorias de base** (23247; na base quem paga é o piloto, o que é histórico), com contrato de **1 ano**. Na categoria principal o salário existe, mas o contrato de 1 ano vence logo e o piloto fica `venceu` (24888): sai sem multa e entra no mercado. `multaDispensa` (25211) também é 0 para quem está na academia. |
| Classificação | **BUG** (contrato de 1 ano automático: o garoto formado vence no ano seguinte e sai sem multa) + **EQUILÍBRIO**, gravidade **média**. O salário zero que o jogador viu é o da base, onde ele é correto. |
| Correção | Promoção com contrato coerente: duração de 2 anos (o padrão das academias reais), salário de estreante da categoria e da época, pelo mesmo `salarioPedido` (que ganha um piso fora da F1 quando a série tem titular pago), cláusula de multa de rescisão e opção de renovação da equipe. Fora da F1, onde o piloto traz patrocínio (`aportePagante`), o contrato continua sem salário: é a regra histórica da base. |
| Teste | Promover na F1 e na IndyCar: salário > 0 onde a categoria paga, contrato de 2 anos, multa de rescisão > 0; promover na base: salário 0, como antes. |

## 8. Falta de decisões depois de muitas temporadas

| | |
| --- | --- |
| Medição | Com caixa de 150 a 250 milhões a partir de 2000, a política competente põe tudo no nível 5 sem custo de oportunidade: o dinheiro sobra, e o nível 5 é sempre o melhor. |
| Causa | O retorno do gasto satura, mas não existe limite de capacidade além do dinheiro, nem escolha entre o carro deste ano e o do próximo fora dos anos de regulamento. |
| Classificação | **EQUILÍBRIO**, gravidade **média** |
| Correção | Com a fronteira técnica (item 2), o nível 5 perto da fronteira rende pouco: o mesmo dinheiro vale mais guardado para o regulamento novo (`futuro`), nas instalações ou nas peças da temporada. A verba `futuro` passa a valer em qualquer ano anterior a um regulamento novo, e o conceito do regulamento novo depende dela. Com o teto de gastos, o limite já existe (e passa a ser mostrado). |
| Teste | Na carreira longa, comparar "nível 5 sempre" com "nível 3 + futuro": nenhuma das duas domina sempre. |

## 9. Mercado de funcionários limitado

| | |
| --- | --- |
| Código | `mercadoStaff` (25269) gera um candidato por função com `R.range(54, 82)`: **o máximo possível é 82**. O chefe de mecânicos (`box`) não tem nenhum nome real em `CH_ENGENHEIROS`, então nunca passa de 82. O staff gerado não evolui, não envelhece e não se aposenta. As rivais não contratam staff. |
| Suspeita descartada | Parecia que `pagarSalarios` (24377) pagava o staff com contrato vencido. **Não se confirmou**: o contrato vence no inverno e, na largada da temporada, `comecarTemporada` troca quem não renovou. O salário só é pago durante o ano. Não há bug. |
| Classificação | **BUG** (teto 82) + **EQUILÍBRIO**, gravidade **média** |
| Correção | O mercado ganha uma distribuição com cauda: a maioria entre 55 e 78, alguns bons, e um nome de elite (85–94) em parte dos invernos, mais comum para a reputação alta e para a função mais escassa. O staff gerado ganha idade e carreira: os jovens evoluem, os veteranos perdem um pouco e se aposentam, e o nível evolui na equipe. Um staff de elite pode ser levado por uma rival (o evento de assédio já existe). O staff vencido deixa de receber e de trabalhar até renovar. |
| Teste | 200 invernos: o máximo passa de 82, a elite aparece com frequência plausível (sem garantia), o staff envelhece e se aposenta; staff vencido não entra na folha. |

## 10. Patrocínios que não acompanham a equipe

| | |
| --- | --- |
| Código | `ofertasPatrocinio` (24466): `valor = M(base·(0,15 + rep/100)·setor·U(0,8; 1,2))`, convertido para o dinheiro da época. O valor é fixo durante o contrato, e na renovação sobe ×1,04 ou ×1,1 sobre o valor antigo (25624): **o preço de mercado do ano da renovação nunca é consultado**. Os custos são todos convertidos pela escala do ano, que vai de 0,07 (1970) para 0,18 (1980) e 0,38 (1990): um contrato renovado várias vezes perde metade do valor real numa década. |
| Medição | Nos anos 70 e 80 a equipe competente fica com caixa negativo, e o patrocínio é 15% a 35% da receita; depois de 2000, com reputação 100, ele explode para 100–160 milhões. |
| Classificação | **BUG** (renovação sem reajuste da época e da reputação) + **EQUILÍBRIO**, gravidade **média** |
| Correção | A renovação passa a usar o valor de mercado do ano, pela reputação atual, ajustado pela satisfação (satisfeito: acima do mercado; morno: abaixo), nunca acima de um teto por setor. O valor de mercado da reputação passa a ter rendimento decrescente no alto: reputação 100 não vale o dobro de 60. O número de contratos já tem limite (4 vagas). |
| Teste | Contrato assinado em 1975 e renovado até 1990 acompanha a escala; patrocínio total por reputação com teto plausível; receita não cresce sem limite. |

## 11. Compra e venda de participação

| | |
| --- | --- |
| Código | O modelo de propriedade **já existe em parte**: `C.part` (participação do chefe, 100/70/40 pelo financiamento), `C.dir.dono` (fábrica, dono ou conselho), investidores no inverno (`ofertasInvestidor`/`aceitarInvestidor`, 25361), resgate na falência que tira 22% ou 35% (25733) e a venda da equipe pela participação (`valorEquipe`). Não existe **recompra**, e a venda a investidor não mostra a avaliação nem os direitos de quem entra. O chefe contratado (`assumir`, com dono ou conselho) já não recebe ofertas de investidor (24914). |
| Classificação | **AUSENTE** (recompra) + **UX** |
| Correção | Recompra de participação a preço de avaliação (`valorEquipe` por ponto percentual, com prêmio de controle), só para quem é dono ou sócio. Os investidores passam a receber a sua parte do prêmio e do patrocínio todo ano (direitos econômicos): vender participação deixa de ser dinheiro grátis e vira uma despesa permanente até a recompra. Abaixo de 50% a equipe ganha um conselho (já existe). A avaliação aparece na tela. O chefe contratado não vê nada disso. |
| Teste | Vender 20% e recomprar custa mais do que se recebeu; dividendos saem todo ano; o chefe contratado não tem a opção. |

## 12. Peças que não ficam prontas para o GP seguinte

| | |
| --- | --- |
| Código | Um projeto leva de 21 a 42 dias (`PARTES.dias`), ajustados pela intensidade e pela eficiência (`previsao`, 26338), mínimo 7. A temporada tem 266 dias divididos pelas etapas (`diasPorEtapa`, 26415): de 12 dias por etapa num calendário de 22 corridas a 28 num de 9. A peça ainda precisa ser fabricada (no mínimo 4 dias). A dica do que a pista pede (`dpCarro`, 27493) olha **só a próxima etapa**. Um projeto leva de 2 a 4 etapas, então a dica chega tarde. Projetos inacabados no fim do ano são **perdidos** (`novoCarro` zera `proj`), com o dinheiro já gasto. |
| Classificação | **UX** + **BUG** (projeto pago e perdido na virada), gravidade **média** |
| Correção | A previsão mostra a data de conclusão e a **primeira etapa em que a peça pode correr** (projeto + fabricação), e a tabela das próximas etapas mostra o que cada pista pede. Fabricação acelerada: menos dias, custo maior e chance de unidade com defeito. Projeto inacabado na virada passa para o ano seguinte, se não houver regulamento novo; com regulamento novo, o dinheiro já gasto vira conhecimento (`conhec`), não some sem nada. |
| Teste | A previsão bate com o dia em que a peça fica pronta; a primeira etapa mostrada é a correta; a fabricação acelerada é mais cara e mais rápida; o projeto atravessa o ano sem regulamento novo. |

## 13. Classificação com pouca informação

| | |
| --- | --- |
| Código | O quadro da classificação (28169–28211) mostra a sequência das sessões, o estado de cada carro, a janela de saída e o resultado. Não mostra clima, temperatura, evolução da pista, pneus disponíveis e usados, tráfego, risco de chuva nem tempo restante. A chuva existe por etapa (`chuvaDaEtapa`, 23941) e aparece em outra tela. |
| Classificação | **UX**, gravidade **média** |
| Correção | Painel da sessão com previsão do tempo (com a incerteza da época), temperatura da pista, evolução da aderência por janela, pneus (os compostos da época e quantos jogos novos sobram, só onde havia limite) e tráfego por janela. A janela de saída já muda o resultado; o painel passa a dizer por quê (pista melhor no fim, risco de chuva ou bandeira, tráfego no começo). |
| Teste | O painel aparece em 1960, 1995 e 2024 só com as informações da época; a escolha de janela muda o resultado na direção que o painel indica. |

## 14. Treinos livres sem programas diferentes

| | |
| --- | --- |
| Código | Os programas **existem** e estão na tela: `TREINO` (23903) tem classificação, equilíbrio e corrida, com efeitos diferentes no sábado, no domingo e nos dados (`dadosTreino`), que estreitam a faixa de previsão da estratégia. Não existem avaliação de pneus, teste de configuração nem coleta de dados. |
| Classificação | **UX** (os efeitos não são explicados) + **AUSENTE** (dois programas), gravidade **baixa** |
| Correção | Dois programas novos com efeito próprio: **avaliação de pneus** (degradação medida de cada composto: o plano de pneus fica mais certo e a previsão mais estreita, sem ritmo de sábado) e **teste de configuração** (mais saídas para o acerto, menos ritmo de corrida). Cada programa diz na tela o que ele entrega. Simulação de classificação e de corrida continuam como estão. |
| Teste | Os cinco programas dão resultados diferentes entre si (ritmo de sábado, ritmo de domingo, faixa da previsão, saídas do acerto). |

## 15. Potência máxima e forçar sem consequência

| | |
| --- | --- |
| Código | Os modos existem e mexem em tudo (16292): atacar `m 0,9955` (0,45% mais rápido), desgaste ×1,35, erro ×1,7, motor ×1,5; máximo `m 0,992`, desgaste ×1,75, erro e motor ×2,5. Pneu: forçar ×1,3 de desgaste, cuidar ×0,76. O risco mecânico por volta escala com o modo (16965). Mas existe uma falha aleatória por volta (`acaso`, 17035), de 2% por volta para o grid inteiro, que **não depende do modo**. |
| Medição | Mesma semente, 10 corridas de 2019, dois carros: automático média P8,9, atacar P9,9, máximo P8,6, poupar P8,4, cuidar P8,3; os abandonos variam de 1 a 4 em 20 carros-corrida. **A diferença entre os comandos fica dentro do ruído**: o ganho de 0,45% por volta é comido pela parada a mais, e as quebras mais comuns são as aleatórias, que não dependem do comando. |
| Classificação | **EQUILÍBRIO**, gravidade **média** |
| Correção | Os comandos passam a ter efeito claro e situacional: o ganho do ataque fica maior por volta e o custo vai para o pneu e o motor desta corrida (temperatura, desgaste), não só para a chance de quebra. A falha aleatória passa a escolher os carros pelo estresse acumulado, para que quem forçou o motor quebre mais. Ataque máximo curto (poucas voltas, para uma ultrapassagem ou um undercut) compensa; o tempo todo, não. Poupar não ganha corridas, mas salva uma corrida com motor no limite. A medição com a mesma semente passa a ser um teste. |
| Teste | Com a mesma semente e muitas corridas: ataque curto melhora a posição; ataque o tempo todo gasta mais pneu e quebra mais; poupar quebra menos e anda menos. Nenhum modo domina em todas as situações. |

## 16. Túnel de vento com limites pouco claros

| | |
| --- | --- |
| Código | `horasDoAno` (26276): antes de 2021, `900 + 320·túnel` (até 2.500 horas); desde 2021, a escala real por posição (1.400 a 2.300). As horas valem para o ano inteiro e não passam para o seguinte. Projetos de aero gastam de 80 a 180 horas, e só 2 a 4 projetos andam ao mesmo tempo (`capacidade`, 26336, pela fábrica). Com a fábrica abaixo de 3 só há 2 vagas, e 2 projetos de 3 semanas por vez não chegam a gastar 2.500 horas no ano. |
| Classificação | **EQUILÍBRIO** (capacidade da fábrica menor que as horas do túnel) + **UX**, gravidade **média** |
| Correção | A tela mostra horas disponíveis, usadas, comprometidas, a projeção do ano no ritmo atual e o que vai expirar. A capacidade de projetos passa a acompanhar o túnel além da fábrica (um túnel grande dá vagas de projeto de aero). O limite regulatório (horas por posição desde 2021) continua intransponível. |
| Teste | Com túnel nível 5 e fábrica nível 3, as horas do ano conseguem ser usadas; desde 2021 o limite por posição é respeitado. |

## 17. Nenhum convite para outras categorias

| | |
| --- | --- |
| Código | `propostasEmprego` (25756) só olha a **mesma série** (`Chefe.sk()`) e só é chamada depois de uma **demissão** (25658, 28521). Fora disso, nenhum chefe recebe convite. O teto de força da equipe que convida (`58 + rep·0,38`) faz sentido. |
| Classificação | **AUSENTE**, gravidade **média** |
| Correção | Convites no inverno, sem demissão, para quem tem reputação e resultados: equipes de outras séries do topo (IndyCar, Endurance, Fórmula E etc., só nas séries que existem no ano) e de equipes maiores na mesma série. A chance depende da reputação, dos títulos e do tempo de casa, e não é garantida. O convite fica no inverno como decisão: aceitar troca de equipe (e de série) com a carreira, o histórico e os totais preservados, como `assumirOutra` já faz. |
| Teste | Em 200 invernos com reputação alta aparecem convites de outras séries; com reputação baixa, quase nenhum; aceitar leva a outra série com o histórico intacto; o save abre depois. |

## 18. Automação melhor do que decidir

| | |
| --- | --- |
| Código | Na corrida ao vivo, o carro do jogador em automático usa `Gp.iaRitmo` (17002), o mesmo da IA, com o plano estimado (com incerteza, 16490), e não a degradação real. O engenheiro do acerto (`Acerto.auto`, 26545) lê o piloto com ruído, **mas consulta o ideal escondido** para nunca fechar os cinco ajustes (26557): ele usa a informação escondida só para piorar o próprio resultado, e para em ~88% de estimativa. Não encontrei bônus escondido para o automático. |
| Medição | Na mesma semente o automático (P8,9) ficou entre os comandos manuais fixos (P8,1 a P9,9): o manual "burro" (o mesmo comando a corrida inteira) não ganha do automático, e é isso que o jogador sente. |
| Classificação | **EQUILÍBRIO** (comandos com pouco efeito; ver o item 15) + **BUG** pequeno (o engenheiro consulta o ideal), gravidade **média** |
| Correção | O engenheiro do acerto passa a parar só pela própria estimativa (sem olhar o ideal), com o limite de saídas que já existe. Com os comandos do item 15 com efeito real, o jogador que muda o ritmo na hora certa ganha do automático; o automático continua decente e às vezes erra (já usa o plano estimado). |
| Teste | Na mesma semente, o manual inteligente (atacar perto de quem está à frente, poupar sozinho) ganha do automático em média; o automático ganha do manual fixo ruim. O engenheiro não lê `Acerto.ideal`. |

## Resumo

| # | Relato | Tipo | Gravidade |
| --- | --- | --- | --- |
| 1 | Lendas e Recordes | BUG (duas causas) | alta |
| 2–3 | Carros, bola de neve | EQUILÍBRIO | alta |
| 4 | Moral | EQUILÍBRIO + UX | média |
| 5 | Teto de gastos | UX + BUG (punição permanente) | média |
| 6 | Veteranos | EQUILÍBRIO | média |
| 7 | Academia | BUG + EQUILÍBRIO | média |
| 8 | Decisões | EQUILÍBRIO | média |
| 9 | Staff | BUG (teto 82) + EQUILÍBRIO | média |
| 10 | Patrocínio | BUG (renovação) + EQUILÍBRIO | média |
| 11 | Participação | AUSENTE (recompra) | média |
| 12 | Peças | UX + BUG (projeto perdido) | média |
| 13 | Classificação | UX | média |
| 14 | Treinos | UX + AUSENTE | baixa |
| 15 | Comandos | EQUILÍBRIO | média |
| 16 | Túnel | EQUILÍBRIO + UX | média |
| 17 | Convites | AUSENTE | média |
| 18 | Automação | EQUILÍBRIO + BUG pequeno | média |

Bugs confirmados sem ambiguidade: 1 (as duas causas), a punição de túnel
permanente, o teto de 82 do staff, a renovação de patrocínio sem reajuste, o
contrato de academia de 1 ano, o projeto de peça perdido na virada e o
engenheiro que consulta o ideal. O staff vencido na folha foi suspeita
descartada (ver o item 9).

## Ordem de implementação

1. **Bugs e integridade:** Lendas e Recordes, academia, progressão de pilotos,
   comandos de corrida, automação, punição de túnel, staff vencido, projeto
   perdido.
2. **Equilíbrio:** fronteira técnica e conceito do regulamento, moral, staff,
   patrocínio, investimento.
3. **Experiência:** teto de gastos, planejamento das peças, classificação,
   programas de treino, túnel.
4. **Estrutura:** convites entre séries, recompra e direitos dos investidores.
5. **Validação:** carreira longa com várias sementes e horizontes (1, 5, 10,
   25, 50 e 73 anos), comandos com a mesma semente, saves antigos e a suíte
   inteira.

Cada etapa termina com `node testes/rodar.js` passando e com testes novos para
o que mudou. Save: todo campo novo é opcional na leitura e criado pela migração
(`Chefe.migrar`); nada de `S` (modo piloto) muda de forma.

## Depois da atualização (2026-10-27)

### Correções e o que se mediu

| # | Correção | Prova |
| --- | --- | --- |
| 1 | "Encerrar a carreira" no inverno; registro completo tirado de `C.hist`/`C.total` (`Chefe.registroCarreira`); seção de chefes na galeria; "Recordes" na tela do chefe abre `UIC.recordes` | `chefe-lendas.js` (16 verificações), registro antigo de 9 campos abre sem números inventados |
| 2–3 | `Chefe.fronteira`: o melhor carro real do ano (inclusive o da própria equipe); alvo saturado em F+6, peças em F+6; conceito sorteado no regulamento novo | carro no máximo +0,8 acima da fronteira com tudo no máximo; conceito de −4 a +9 em 14 equipes do meio em 2014 |
| 3 | Mercado: contrato vigente (−22 pontos de chance e rescisão de 80% do salário à rival); estrela não divide o box (−40, ou −15 como nº 1); nº 1 para quem chega derruba a moral de quem estava | estrela sob contrato: 29% contra 51% livre |
| 3, 8 | `Chefe.socorroDono`: socorro descontado do aporte dos anos seguintes; segundo socorro em menos de 4 anos demite | gastar sempre no máximo: 49 falências e 24 demissões em 78 temporadas, contra 3 e 4 do conservador |
| 4 | Moral na consistência (`moralCons`, neutra em 65), na renovação e no pedido de saída; motivos na ficha | moral 30 contra 90: erro 4,4% contra 3,7%; renovação muito mais difícil com moral baixa |
| 5 | `Chefe.tetoConta`, painel no inverno e na temporada, aviso no primeiro ano; punição de túnel só no ano seguinte | `manager-21.js` e `compat-21.js` (a punição antiga acaba na primeira virada) |
| 6 | Declínio individual e sem teto depois do último ano da história (`skillEm`) | Senna aos 44: 78 (era 89); média 78 aos 44 para nota 92 no auge, com longevos |
| 7 | Promoção da academia: 2 anos, salário de estreante, multa; base continua sem salário | `manager-21.js` |
| 9 | Mercado com cauda (elite 85–94 às vezes), staff com idade, evolução e aposentadoria | elite em ~65% dos invernos, nunca garantida; antes, máximo 82 |
| 10 | Renovação pelo valor de mercado do ano; reputação com retorno decrescente | contrato defasado renovado perto do preço de hoje |
| 11 | Recompra pela avaliação + 15%; sócios levam metade do lucro deles todo ano; chefe contratado não tem a opção | recomprar 20% custou 72 mi contra 30 mi da venda |
| 12, 16 | Primeira etapa em que a peça corre; próximas 5 etapas; fabricação às pressas; projeto atravessa o inverno; horas de túnel que expiram; vaga de projeto pelo túnel | `manager-21.js` |
| 13 | `Chefe.leituraQuali`: pista, tráfego, bandeira e chuva, com o erro da época | a leitura muda por etapa e é estável ao reabrir |
| 14 | Avaliação de pneus e teste de configuração | dados de pneu 83% contra 29%; +2 saídas de acerto |
| 15 | Falha do acaso pesada pelo estresse do motor | em 80.000 sorteios: 180 no carro em ataque máximo, 49 no que poupou, 76 na média |
| 17 | Convites no inverno (outras categorias e equipes maiores), aceitar leva a carreira | ~40% dos invernos de quem tem nome; o save segue na série nova |
| 18 | Engenheiro do acerto sem olhar o ideal | média 92% (antes 90%), às vezes perfeito |

### O automático contra o manual (item 18)

Mesma montagem, mesmo fim de semana, o jogador aceitando as chamadas de box
(abandono conta como 20º):

| Ano | Automático | Lê a corrida | Atacar sempre | Máximo sempre | Poupar sempre |
| --- | --- | --- | --- | --- | --- |
| 2019 (42 carros-corrida) | 9,6 | 10,5 | 12,6 | 16,7 | 13,7 |
| 2008 (36) | 8,6 | 9,2 | 9,4 | 13,7 | 12,1 |
| 1995 (32) | 9,7 | 9,4 | 10,2 | 13,0 | 9,6 |

Não há bônus escondido: o automático usa o plano estimado, o desgaste e as
distâncias que a tela mostra. Ele é bom porque decide a cada volta. Um comando
fixo é sempre pior, e quebra mais quando agride (o ataque máximo a corrida
inteira teve 16 abandonos em 42). Um jogador que decide bem chega no nível
dele, mas não há garantia de ganhar.

### Carreiras longas (`node testes/chefe-longo.js completo`)

Três sementes por cenário, até 73 temporadas, com a falência e a demissão
seguindo as regras do jogo (demitido aceita a primeira proposta):

| Cenário | Títulos / temporadas | Maior sequência |
| --- | --- | --- |
| Equipe pequena de 1950 | 42 / 103 | 10 |
| Equipe média de 1950 | 4 / 45 | 2 |
| Equipe grande de 1950 | 129 / 219 | 15 |
| Dominante (McLaren 1988) | 51 / 78 | 13 |
| Crise (1990, caixa negativo) | 0 / 70 | 0 |
| Pilotos jovens | 6 / 78 | 2 |
| Pilotos veteranos | 32 / 108 | 6 |
| Staff de elite e plano baixo | 12 / 98 | 2 |
| Investimento conservador | 8 / 130 | 2 |
| Investimento sem freio | 30 / 78 | 6, com 49 falências e 24 demissões |
| Equipe própria | 3 / 91 | 3 |

Antes da atualização, o mesmo jogador competente numa equipe grande somava de
22 a 36 títulos em 73 anos, com sequências de até 18, e a partir dos anos 1990
terminava em 1º quase todo ano. Agora a dinastia ainda existe para quem joga
muito bem com a melhor equipe (até 15 seguidos, contra uns 50 no relato e 8 no
recorde real), mas os regulamentos novos, os contratos e o dinheiro a
interrompem. A equipe pequena só chega lá em algumas sementes, quem gasta sem
olhar o caixa é demitido, e o carro passou de 4 pontos acima da melhor rival
em menos de 1% das temporadas.

### Suíte

`node testes/rodar.js`: 64 de 66 grupos passam. Os dois que falham
(`migracao.js` e `migracao-historico.js`) montam saves antigos com
`git show <commit>`, e esta cópia veio do GitHub como zip, sem `.git`; eles
falhavam igual antes das mudanças. No lugar deles, `compat-21.js` abre uma
fixture gravada pela versão anterior (2021, no meio da temporada) e joga mais
três anos.

### Pendências e limites

- As rivais seguem a história até 2026: não reagem ao seu domínio nem sorteiam
  conceito. Depois de 2026 não há regulamento novo inventado.
- A moral não faz recusar ordem de equipe durante a corrida.
- A classificação não conta jogos de pneus por época, nem temperatura de pista:
  o motor não simula isso, e a tela não mostra dado que não pesa.
- Convites só para o chefe contratado; o dono vende antes de sair.
- A taxa de título da Brawn 2009 no cenário foi de ~60% para ~75% em 30
  sementes, dentro do ruído; o teste do cenário agora amostra até aparecerem
  os dois desfechos.

