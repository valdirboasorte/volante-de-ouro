# Atualização da comunidade — auditoria e andamento

Data: 2026-10-28. Base: `volante-de-ouro-main` depois do Manager 2.1. Cada item
foi conferido no código (`index.html`) antes de qualquer mudança; as linhas
citadas são aproximadas, porque o arquivo muda a cada etapa.

**Estado encontrado:** **funciona** (o sistema existe e faz o que promete),
**quebrado** (bug confirmado), **superficial** (existe, mas raso ou sem efeito
real), **ausente** (não existe).

## Resumo

| # | Item | Estado encontrado | Nesta etapa |
| --- | --- | --- | --- |
| 1 | Contratos e transferências | superficial | corrigido em parte |
| 2 | Fórmula E na chuva | **quebrado** | **corrigido** |
| 3 | Página voltando ao topo | **quebrado** | **corrigido** |
| 4 | Dificuldade fácil | superficial (só na corrida rápida) | corrigido em parte |
| 5 | Progressão e idade | **quebrado** | **corrigido** |
| 6 | Classificação em tempo real | ausente | **feito (fase 2)** |
| 7 | Cores dos setores | ausente | **feito (fase 2)** |
| 8 | Clima | superficial | **feito em parte (fase 2)** |
| 9 | Alertas na corrida | superficial | **feito (fase 2)** |
| 10 | Corrida isolada | ausente | **feito (fase 2)** |
| 11 | Áudio | ausente | **feito (fase 2)** |
| 12 | Características dos pilotos | superficial | **feito (fase 3)** |
| 13 | Especialização na base | funciona em parte | **feito (fase 3)** |
| 14 | Piloto e carro | ausente | **feito (fase 3)** |
| 15 | Piloto no desenvolvimento | superficial | **feito (fase 3)** |
| 16 | Lesões | funciona em parte | **feito (fase 3)** |
| 17 | Relacionamentos | superficial | **feito (fase 3)** |
| 18 | Dinheiro do piloto | superficial | **feito (fase 4)** |
| 19 | Patrocínio por nacionalidade | **quebrado** no modo piloto | **feito (fase 4)** |
| 20 | Economia de longo prazo (chefe) | feito no Manager 2.1 | **completado (fase 4)** |
| 21 | Largada no celular | funciona, mas exige segurar | **feito (fase 5)** |
| 22 | De piloto a chefe | ausente | **feito (fase 5)** |
| 23 | Interface | superficial | **feito (fases 1 e 5)** |

## Fase 1 — o que foi encontrado e o que foi feito

### 1. Contratos e transferências

**Encontrado.**
- O jogador sai no meio do contrato pagando multa só no modo com dinheiro (`takeOffer`); nos outros, perde 3 de fama e a equipe abandonada fecha a porta por dois anos (`S.rompeu`). O resto do mercado nem fica sabendo.
- Até 2026 as duplas das equipes são as da história, ano a ano (`LINEUPS`): quando a equipe real trocou de piloto, o companheiro do jogador também troca. Isso é fiel e fica.
- Depois de 2026 (`Mundo.mercadoTopo`), todo contrato da IA que vence vai direto para o mercado, os contratos eram curtos (1 a 3 anos; 1 ano a partir dos 34) e as equipes mais fortes escolhem primeiro. Resultado medido: **27% dos pilotos da F1 trocavam de equipe a cada temporada**.
- A renovação antecipada do jogador já existe ("Renovar onde você já está", no inverno).

**Feito.**
- `Mundo.renova`: antes de o mercado abrir, a equipe renova quem terminou o contrato e foi bem (a chance cai para quem foi mal e com a idade). Contratos novos de 2 a 3 anos (1 a 2 a partir dos 34). Trocas por piloto e temporada: **de 27% para 9%**, sem proibir mudança: um ano ruim, a idade ou uma vaga melhor ainda mexem no grid.
- Romper contrato agora pesa no mercado inteiro por duas temporadas (−2,5 no valor para todas as equipes), com o motivo na tela ("Desconfia de quem rompeu um contrato há pouco tempo.").

**Falta.** Renovação antecipada no meio da temporada e multa paga pela equipe que compra o piloto (hoje só existe no modo chefe).

### 2. Fórmula E na chuva

**Causa.** A Fórmula E corre com um pneu só, para seco e molhado (`Gp.regras`: `chuva: []`). Mas `Gp.quererParar` mandava parar "por chuva" sempre que a pista passava de 42% molhada e o pneu atual não era de chuva, sem checar se havia pneu de chuva. O pneu escolhido era o mesmo, e a cada volta molhada a parada se repetia: **15 paradas por carro, até 21**.

**Feito.** A troca por chuva (e de volta ao seco) só acontece quando existe outro pneu para pôr e ele é diferente do atual. Fórmula E molhada: **0 parada**. F1 molhada continua trocando para o pneu de chuva, sem ciclo.

### 3. Página voltando ao topo

**Causas.**
- `UI.modal` redesenha a janela inteira a cada opção escolhida (patrocínio, acerto, proposta), e a rolagem de dentro dela voltava ao zero.
- `UI.show` levava ao topo sempre, mesmo reabrindo a tela em que o jogador já estava.
- A página do chefe, redesenhada com fotos ainda carregando, encolhia por um instante e o navegador puxava a rolagem para cima.

**Feito.** A mesma janela redesenhada fica onde estava (janela nova começa do alto); `UI.show` só leva ao topo quando a tela muda; `UI.manterRolagem` devolve a posição depois de redesenhar a página do chefe e a tela da carreira. Trocar de página no chefe continua levando ao topo, de propósito.

### 4. Dificuldade fácil

**Medido.** Na escada de base o Tranquilo já ajuda muito: chegam à F1 81% a 88% das carreiras (sem e com dinheiro), contra 63% e 25% no Equilibrado. Na corrida rápida ele dá +3,2 de ritmo, metade das quebras, das batidas e das lesões, evolução 50% mais rápida, equipes mais pacientes e vagas pela metade do preço.

**Causa do "fácil difícil".** Na **corrida ao vivo** quase nada disso valia: o erro de pilotagem a cada volta era igual nas três dificuldades, e as rivais tinham a mesma estratégia.

**Feito.** Ao vivo, o erro do jogador segue a dificuldade (metade no Tranquilo, 80% no Equilibrado, como na corrida rápida), e no Tranquilo e no Equilibrado as rivais leem o pneu com mais erro (paradas fora da hora às vezes). O Desafio ficou como era. Nada disso garante vitória: o carro e o grid continuam os mesmos.

**Falta.** Medir o Tranquilo na categoria principal ao vivo com jogadores reais; ajustar se ainda pesar.

### 5. Progressão e idade

**Causa (reproduzida).** Ao assumir um piloto real (inclusive o Senna de 1994, 34 anos), o jogo sorteava a curva de carreira como a de um estreante: auge entre 24 e 32, declínio logo depois e uma idade-limite (`lastAge`) que podia cair em 35. Passada essa idade, **nenhuma proposta da principal aparecia, ganhasse o que ganhasse**. Em 2 de 8 sementes o Senna saía da F1 aos 35, depois de dois vice-campeonatos.

**Feito.**
- Piloto real começa com a curva partindo da idade e do nível de agora (o Senna de 1994: declínio entre 36 e 40).
- O corte por idade virou regra de desempenho (`Engine.fimDaLinha`): passado o ponto em que o corpo de cada um costuma pedir para parar, só fecha o mercado para quem já não anda na frente (sem título nem top 5 nas duas últimas temporadas e sem nível de ponta).
- Passado o declínio, um ano fraco pesa na renovação e no interesse das outras equipes, e o convite de "estrela" de outra categoria não aparece mais para quem já caiu.
- Resultado: o Senna de 1994 fica na F1 até os 43–46, com 2 a 4 títulos, e sai quando cai para o meio do grid. Não há idade fixa.

## Fase 2 — corrida, clima e som

**6. Campeonato ao vivo.** A corrida recebe da temporada um retrato do campeonato antes da largada (`Gp.retratoCampeonato`: pontos de cada piloto e equipe e a tabela da época, com dobro, volta mais rápida e pole). `Gp.campeonatoAgora` soma os pontos da ordem de agora, com abandonos, punições e a volta mais rápida. A torre ganhou os modos **Campeonato** e **Construtores**: total, pontos desta corrida (+15) e quanto cada um sobe ou cai desde a largada. Prova: na bandeirada, os totais provisórios de todos os pilotos e equipes são exatamente os que o jogo grava.

**7. Setores.** `Gp.passo` divide a volta em três terços da distância e registra o tempo de cada setor no próprio passo da simulação, sem sorteio. Cor: roxo, o melhor da corrida; verde, o melhor do piloto; amarelo, sem melhora. Setor no box ou com safety car não conta como melhor. No modo **Voltas** da torre, os três setores da última volta aparecem ao lado do tempo. Prova: os setores somam a volta, e a mesma semente dá os mesmos setores.

**8. Clima.**
- `chuvaRegiao`: no deserto (Bahrein, Abu Dhabi, Catar, Arábia Saudita) a chance cai a um quinto (Bahrein: de 2% para 0,4%); na Europa chove mais na primavera e no outono do que no verão (a época sai da posição da etapa no calendário).
- O radar (`Gp.previsao`) erra a hora da chuva conforme a época (cerca de 16% nos anos 70, 5% hoje) e, antes de 1990, só vê 12 minutos à frente. Ele só aparece na tela; as decisões da IA não usam o radar.
- Já existiam: transições graduais, intensidade e secagem lenta da pista.
- **Falta:** temperatura do asfalto que evolui ao longo da prova e aderência separada da umidade.

**9. Alertas.** Novos: largada com pista molhada (antes era silenciosa), pista encharcando, pista secando. Os importantes (clima, safety car e o que acontece com os seus carros: furo, quebra, batida, punição, toque, chamada de box) aparecem por 6 segundos numa faixa discreta no alto da central (no celular, embaixo, longe do botão de pausa), sem pausar a corrida.

**10. Corrida isolada.**
- Na carreira de piloto: **Simular só esta corrida**, pelo mesmo caminho do "Simular o resto do ano".
- No menu: **Corrida avulsa**, qualquer GP de qualquer ano e categoria, com o grid real, o regulamento e o clima daquele ano (`Chefe.corridaAvulsa`). Ela monta uma temporada de passagem e devolve só o resultado; a carreira em andamento e os saves ficam intactos (testado).

**11. Som.** Tudo sintetizado pelo navegador (Web Audio), sem arquivo nem gravação de terceiros:
- clique dos botões principais;
- luzes da largada e apagão;
- largada queimada;
- alerta, rádio, parada no box e bandeirada;
- ronco de motor ao fundo, baixo.

Ele só começa depois do primeiro toque (regra dos navegadores). Volume, mudo e ronco ficam no botão do topo, no rodapé ("Som") e na central de corrida, e a escolha fica guardada no aparelho.

Testes: `testes/comunidade2.js` (18 verificações).

## Fase 3 — o piloto por dentro

**12. Ficha do piloto.** Além dos cinco atributos, seis características: ritmo de classificação, gestão de pneus, defesa, adaptação, feedback técnico e controle emocional (`FICHA`, `Engine.ficha`).
- Nascem do próprio piloto (atributos, estilo, experiência e o nome, sem sorteio). Save antigo ganha a ficha na primeira vez que é aberto.
- Evoluem todo ano rumo a um teto tirado do potencial (`Engine.crescerFicha`); cabeça e feedback seguem aprendendo com a estrada e caem mais devagar na velhice.
- Cada uma age no seu lugar: classificação no sábado (`meSkill`), pneu e defesa no domingo, cabeça na constância, na batida e no aperto do campeonato, ataque na posição de largada, adaptação na categoria nova, feedback no carro durante o ano.
- Na corrida ao vivo o seu carro leva pneu (desgaste), ataque e defesa (`Engine.fichaVivo`).
- O geral reflete a ficha (12%), mas as contas usam cada número. Cada característica conta pelo quanto está acima ou abaixo do nível do próprio piloto: muda o formato, não o tamanho, e a IA continua comparável.
- No cartão: forte em, fraco em, condição física e foco. "Ficha completa" mostra as onze.

**13. Foco do ano.** Sete focos (velocidade, constância, pneus, chuva, combate, técnica, adaptação), escolhidos no inverno; depois da primeira corrida o foco do ano fica decidido.
- Acelera o que escolheu e freia o lado oposto.
- Rende mais na base do que na categoria principal (×1,31 contra ×1,17 no teste).
- Retorno decrescente: repetir o mesmo foco ou já estar perto do topo rende menos.

**14. Piloto e carro.** Cada carro tem um jeito, tirado da equipe e do regulamento (estável/nervoso; forte em reta, curva rápida ou curva lenta). Muda quando o regulamento muda.
- O estilo prefere um jeito (agressivo gosta de carro nervoso, consistente de carro estável) e cada piloto prefere curvas rápidas ou lentas.
- Efeito máximo ±0,8 de nota, zero na média; na base, metade.
- Carro que não combina: a adaptação ameniza e todo mundo aprende o carro ao longo do ano.
- Em ano de regulamento novo, quem se adapta sai na frente na primeira metade.
- O jeito do carro também pesa por traçado na principal, e o carro confortável faz evoluir até 6% mais.

**15. Rumo do desenvolvimento.** Uma vez por temporada, só na categoria principal (na base os carros são iguais): reta, curvas lentas, curvas rápidas, confiabilidade ou desgaste de pneus.
- A equipe decide pelo seu feedback, pela relação, pelo seu nome e pelo que o carro já tem; no fim do ano ela já pensa no carro seguinte.
- O tamanho do passo depende da força da equipe e do feedback. As peças chegam a partir da corrida seguinte e crescem em três etapas.
- O carro melhora nas pistas do pedido e perde um pouco nas outras; confiabilidade reduz quebras; pneus reduzem desgaste.

**16. Lesões.** A chance continua proporcional à época, à categoria, ao estilo e à dificuldade (era o que já existia). Agora:
- condição física cai com a lesão, volta a cada corrida (mais devagar na fisioterapia, mais depressa correndo e com treino físico) e custa ritmo enquanto não chega a 100; o inverno devolve tudo;
- o reserva da equipe leva o seu carro e pontua para ela; quando você volta, ele vai para o box;
- a confiança cai menos em quem tem controle emocional;
- todas as origens de lesão passam por `Engine.lesionar`, com histórico na ficha.

**17. Rivais.** Rival ativo e rivais históricos (`Engine.atualizarRivais`, a cada início de temporada).
- O rival que sai do seu grid ou se aposenta vira histórico, com o placar guardado. De volta ao mesmo grid, ou três vezes colado em você no ano, a rivalidade volta.
- Um ano inteiro de disputa perto esquenta; um ano sem se cruzar esfria até virar história. Ganhar o duelo do ano dá fama.
- Rival que muda de equipe gera aviso; rival que vira seu companheiro deixa a garagem tensa.
- Na pista o rival acende o piloto (um pouco mais de ritmo e de risco; quem tem cabeça arrisca menos).
- No mercado, a proposta da equipe do rival avisa que ele está lá.
- Ações novas, só com rival ativo: provocar na imprensa e propor trégua.
- A imprensa noticia o que muda, e a pessoa guarda na memória. Quem saiu da sua vida vai virando lembrança: a relação volta devagar ao neutro.
- A tela de parceiros mostra o rival ativo e os históricos.

**Limitações.**
- A ficha e o encaixe são do jogador; a IA continua com o perfil que já tinha (sábado, domingo, consistência, especialidade).
- O nome do reserva sai da lista de sobrenomes da base, não do banco histórico.
- A condição física não aparece na corrida ao vivo como algo separado: ela entra no ritmo.

Testes: `testes/comunidade3.js` (48 verificações). O teste do safety car passou a olhar a bandeira verde depois da janela do safety car: antes ele olhava no exato passo em que o líder fechava a volta, e o ritmo novo do seu carro mudou em qual passo isso acontecia (a regra do safety car não mudou).

## Fase 4 — dinheiro

**Auditoria do modo piloto.**
- Bug: o rendimento do investimento entrava no investimento **e** de novo no caixa (o dinheiro crescia duas vezes).
- Bug: o bônus por vitória aparecia na proposta de patrocínio, mas sumia na assinatura e nunca era pago.
- Bug: o preço da vaga mostrado como "do seu bolso" já tinha o desconto do título e da dificuldade, mas a cobrança do ano cobrava o valor cheio. O campeão que "não compra a vaga" pagava a vaga inteira.
- Superficial: dia de teste pago sem limite (quem tinha dinheiro comprava ritmo à vontade); a comissão do empresário e o rendimento não apareciam na tela; não havia em que gastar com retorno de verdade além de relações, luxo e testes.

**Auditoria do modo chefe** (a maior parte foi feita no Manager 2.1).
- Instalações nunca envelheciam: construídas uma vez, valiam para sempre.
- O empréstimo dizia 9% ao ano, mas as parcelas (três terços de 1,09³) embutiam uns 14%.
- A projeção do teto de gastos no inverno deixava de fora a operação de cada corrida (uns 24 milhões por ano em 2022).
- O tamanho da academia mudado no meio do ano ficava de graça até o ano seguinte.
- Conferido e mantido: o chefe de mecânicos tem efeito (encurta o pit stop na corrida ao vivo); staff, plano, peças, contratos, patrocínio pelo valor de mercado, socorro do dono e demissão continuam como no Manager 2.1.

**18. Usos do dinheiro com retorno real.**
- Piloto: equipe pessoal (preparador físico, coach e simulador, assessor de imprensa), com custo anual pela categoria e efeito concreto: lesões e recuperação, evolução de atributos e ficha, fama e valor dos patrocínios. Contratar no meio do ano cobra a parte que falta. Só no modo realista.
- Piloto: dia de teste com retorno decrescente (o quinto dia rende quase nada); rendimento e comissão do empresário aparecem no balanço do ano.
- Chefe: modernizar instalações (abaixo).
- Nenhum gasto sem efeito foi criado.

**19. Patrocinadores por nacionalidade.** A lista fixa de 18 marcas brasileiras saiu. Cada proposta agora tem origem:
- da sua terra (a maioria na base);
- da terra da equipe (equipes conhecidas, pelo nome);
- do mercado da categoria (NASCAR e IndyCar nos EUA, Stock no Brasil, DTM na Alemanha);
- multinacional (as marcas do modo chefe, pela época), mais comum para quem é famoso e está na principal;
- e às vezes uma aposta de fora.

O nome da marca segue a língua do país (Hodges Bank, Trasporti Fabbri, Tanaka Apparel), e o setor respeita a época: cigarro até 2006, cripto depois de 2018, e antes de 1968 quase só transporte, óleo, construção, comida e bebida. A mesa usa um sorteio próprio, preso ao piloto e ao ano: recarregar o jogo não troca as propostas.

**20. Economia de longo prazo.** Análise item a item:
- crescimento das despesas: custos pela escala da época (Manager 2.1);
- custos de desenvolvimento: retorno decrescente e fronteira técnica (Manager 2.1);
- contratos de pilotos: mercado com contrato vigente, multa e estrela que não divide o box (Manager 2.1);
- mudanças de regulamento: conceito sorteado e verba de futuro (Manager 2.1);
- patrocínios: valor de mercado com retorno decrescente da reputação (Manager 2.1);
- limitações financeiras: teto de gastos, agora com a operação na projeção (fase 4);
- decadência das instalações (nova, fase 4): cinco anos depois da obra ou da modernização, a instalação perde 5% do efeito por ano, até 35%. Modernizar custa 30% do que ela custou para chegar ao nível atual e leva um ano. Quem fica rico e para de cuidar da fábrica perde alguns décimos de eficiência por ano;
- risco de decisões ruins: socorro do dono descontado e demissão; empréstimo cobrando o juro que promete (fase 4).

Testes: `testes/comunidade4.js` (26 verificações).

**Limitações.**
- As rivais da IA usam o próprio modelo de orçamento, sem instalações: o envelhecimento vale para a sua equipe.
- A equipe pessoal e o dinheiro do piloto só existem no modo realista.

## Fase 5 — qualidade de vida e novos caminhos

**21. Largada com um toque.** Dois jeitos de largar, escolhidos na própria tela das luzes e guardados no aparelho. "Segurar e soltar" continua o padrão no computador; "Um toque" é o padrão no celular. No modo de um toque, as luzes acendem sozinhas e basta tocar quando apagam. Tocar enquanto acendem recomeça a sequência; tocar com as cinco acesas queima a largada (5 s). A reação é medida do mesmo jeito, então o erro e a diferença de reação continuam valendo.

**22. De piloto a chefe.** No fim da carreira aparece "Virar chefe de equipe" (menos depois de um acidente fatal). Nada acontece sem o jogador escolher.
- A carreira de piloto continua na galeria. Uma carreira de chefe que já existia vai para "Jogos salvos" antes de começar a nova.
- Mesma categoria, no ano seguinte. Quanto maior o nome, maior a equipe que liga; a última equipe em que ele correu também liga.
- A reputação inicial sai do que o piloto conquistou (títulos, vitórias, pódios, fama).
- Os títulos, vitórias e anos de piloto ficam na ficha do chefe (no topo da tela) e no registro da galeria de chefes.
- O engenheiro com quem a relação era boa vem para a fábrica, se for melhor que quem está lá. As principais relações da carreira (engenheiro, companheiros, rivais, chefes) ficam guardadas.

**23. Interface.**
- Rolagem: corrigida na fase 1.
- Clima: o calendário mostra a chance de chuva de cada etapa que ainda vai acontecer, em destaque na próxima. É a chance do circuito naquela época, a mesma que o jogo usa para sortear; ela não revela nem antecipa o sorteio.
- Resultado: logo abaixo da posição, uma faixa com largada, chegada (com quantas posições ganhou ou perdeu), pontos e a posição no campeonato.
- Celular: os atalhos da barra de ações viram uma fileira que desliza para o lado, em vez de empilhar cinco linhas de botões.
- Estatísticas: já tinham atalho na barra de ações e no fim da carreira.
- Interações repetitivas: "Simular só esta corrida" (fase 2) e a largada de um toque, guardada no aparelho.

## Fase 6 — testes e compatibilidade

Os dez pontos do pedido e onde cada um é verificado:

| # | O que testar | Onde |
| --- | --- | --- |
| 1 | Saves antigos | `fase6.js`: um save de piloto e um de chefe gravados pela versão de antes das fases 3 e 4 (em `testes/fixtures`) abrem, ganham os campos novos e seguem jogando; `compat-21.js` faz o mesmo com um save de antes do Manager 2.1 |
| 2 | Carreiras longas | `fase6.js` (piloto, modo realista, com risco, até a aposentadoria e a passagem para chefe), `chefe-longo.js`, `carreiras.js` |
| 3 | Simulação rápida e interativa | `prova.js`, `gp.js`, `comunidade2.js` (a corrida ao vivo termina no mesmo resultado que o jogo grava), `comunidade3.js` (a ficha no carro ao vivo) |
| 4 | Temporadas históricas | `historico.js`, `escalacoes-reais.js`, `lendas-save.js` |
| 5 | Regulamentos diferentes | `regulamento.js`, `regras.js`, `chefe-series.js` |
| 6 | Transferências e renovações | `mercado.js`, `mercado-topo.js`, `mercado-chefe.js`, `comunidade.js` |
| 7 | Clima e pneus na Fórmula E | `comunidade.js` (nenhuma parada por chuva na FE), `pneus.js`, `pneu-limite.js` |
| 8 | Rolagem no celular | `comunidade.js` e conferido no navegador (fases 1 e 5) |
| 9 | Progressão e aposentadoria | `comunidade.js` (Senna), `progresso-piloto.js`, `evolucao-cenarios.js`, `fase6.js` |
| 10 | Classificação ao vivo | `comunidade2.js` |

**As fórmulas não dependem de sorteio sem relação com o piloto** (`fase6.js`):
- Mesma semente, mesmo carro: o piloto 12 pontos melhor chega na frente em 5 de 6 temporadas, por cerca de 4 posições por corrida.
- Mesma semente e mesmas escolhas: a mesma temporada, corrida por corrida.
- O acerto certo dá mais carro que o errado (+1,6 contra −4,7).
- No nível do próprio piloto, a ficha não soma nada: ela muda o formato do piloto, não o tamanho.
- Os sorteios novos destas fases não mexem na sorte da corrida. O jeito do carro, o envelhecimento das instalações e a mesa de patrocínio saem de sorteios presos a uma chave (equipe e época; piloto e ano), por isso recarregar o jogo não muda nada.

**Achado nos testes desta fase:** numa categoria com playoff (NASCAR), um piloto que ficou "sem equipe" quebrava a tabela do campeonato e o arquivo do fim do ano, porque a tabela procurava a cor da equipe dele e não encontrava. Corrigido (`Engine.timeNaTabela`), com verificação em `fase6.js`.

**No navegador** (origem de teste 127.0.0.1:4338, sem tocar nos saves do jogador):
- largada com um toque: tocar cedo demais recomeça; a reação foi medida em 0,191 s; tocar com as cinco luzes acesas queima a largada;
- tela de parceiros com rival ativo e histórico, ficha do piloto, barra de ações deslizando no celular, chance de chuva no calendário.

O topo da tela não cabia em celulares de até 380 px depois que o botão de som entrou (fase 2). No celular estreito, os botões de som e de animações do topo agora ficam ocultos; eles continuam no rodapé e na central de corrida.

**Suíte:** todos os grupos passam, menos `migracao.js` e `migracao-historico.js`. Esses dois montam saves antigos com `git show` e esta cópia veio do GitHub sem `.git`; no lugar deles, `fase6.js` e `compat-21.js` usam fixtures gravadas pelas versões anteriores.

## As outras fases (diagnóstico)

| # | O que existe hoje | O que falta |
| --- | --- | --- |
| 6 | A torre da corrida mostra posição, intervalo, pneus e última volta | Campeonato provisório de pilotos e construtores durante a prova |
| 7 | Só tempo de volta; roxo para a volta mais rápida | Setores com amarelo/verde/roxo a partir dos tempos simulados |
| 8 | Chance de chuva por circuito × época (`rainP`, Bahrein 2%), chuva que chega e para durante a prova, secagem gradual, radar de 25 minutos | Mês e região; temperatura da pista que evolui; aderência; previsão imperfeita |
| 9 | Eventos de chuva, SC, furo, quebra, punição, toque, bandeira, rádio | O começo da chuva logo na largada é silencioso; não há aviso de pista secando ou encharcando |
| 10 | Não há corrida avulsa | Corrida isolada sem tocar na carreira |
| 11 | Nenhum áudio | Sons de interface, largada e rádio, com volume e mudo |

## Testes desta etapa

`testes/comunidade.js` (14 verificações): Fórmula E molhada, F1 molhada, a
rolagem das janelas e da página, a dificuldade ao vivo, a curva do piloto
real, o fim da linha por desempenho, a renovação da IA e a desconfiança depois
de romper contrato.

## Saves

Fase 3: campos novos opcionais (`S.driver.perf`, `perfPot`, `condicao`, `lesoes`, `S.foco`, `S.focoAnt`, `S.direcao`, `S.rel.antigos`, a entrada do reserva no grid da temporada). Saves antigos ganham a ficha calculada do piloto na primeira vez; sem mudança de versão.

Fases 1 e 2: nenhum campo novo obrigatório. Saves antigos com uma idade-limite baixa
(`lastAge`) passam a seguir a regra de desempenho sem migração; a curva do
piloto real só muda em carreiras novas.
