# Manager 2.0 — auditoria do modo chefe de equipe

Fase 0 da reformulação. Data: 2026-10-20. Escopo: o modo chefe que já existe em
`index.html` (arquivo único, ~26,7 mil linhas) e o motor de corrida que ele divide
com o modo piloto. Nada aqui foi reescrito: este documento mapeia o que existe,
classifica, aponta problemas e define o plano por fases.

Classificação usada:

- **profundo**: funcional e profundo
- **superficial**: funcional, mas superficial
- **parcial**: parcialmente implementado
- **desconectado**: existe, mas não conversa com o resto
- **ausente**

## 1. Mapa do código

| Objeto | Linha | Papel |
| --- | --- | --- |
| `Engine` (modo piloto) | ~7900–12400 | regulamento do fim de semana (`regulamento` 10880, `janelasDe` 10997, `resumoRegras` 10939), corrida estatística (`montarCorrida` 11683, `runRace` 11848, `aplicarSC` 10749, `descreverProva` 10760, `fracFora` 10758, `chanceErro` 10425) |
| `Mundo` | 13815 | o mundo de pilotos (trajetórias, mercado, registro por temporada); usado pelos dois modos |
| `Pista` | 14561 | geometria do traçado (pontos, curvatura, zonas de ultrapassagem, box) |
| `Prova` | 14762 | física por época/categoria (`fisica`, `perfil`, `voltas`, `segPorPonto`, `estrategia`) |
| `Gp` | 15219 | **motor de corrida ao vivo** (passo fixo de 0,25 s), compartilhado pelos dois modos |
| `Cenario` | 21246 | cenários históricos do chefe (objetivos, prazo, avaliação) |
| `Chefe` | 21340 | regras e simulação do modo chefe (dinheiro, carro, pilotos, mundo, fim de semana, mercado, temporada) |
| `UIC` | 24126 | telas do modo chefe, save (`salvar` 24132, `continuar` 24147) |
| `Central` | 26051 | resumo animado da corrida estatística |
| `AoVivo` | 26281 | central de corrida ao vivo (mapa, torre, cartões, rádio, velocidades) |
| `recuperar-progresso/index.html` | — | backup/importação; valida `vdo_chefe` e `vdo_velcorrida` |

Funções do `Chefe` por bloco (linha inicial):

- **Dinheiro:** `escala` 21346, `M/M1/MT/MS/MP`, `fatorSerie`, `fatorCat`.
- **Carro:** `pesos` 21405, `ritmo`, `forca` 21418, `forcaSerie`, `carroPara` 21452.
- **Motores:** `motoresDe/motorInfo/custoMotor` 21472+.
- **Staff:** `nivelStaff` 21497, `salarioStaff`, `staffGerado` 21510, `staffReal`, `eficiencia` 21525.
- **Instalações:** `INSTAL` 21542, `custoInstal`, `manutencao` 21550.
- **Desenvolvimento:** `DEV_CUSTO/AREAS` 21560, `areasAtivas`, `custoPlano` 21577, `aplicarPlano` 21583.
- **Pilotos:** `hab` 21642, `novoPiloto`, `pilotoReal`, `salarioPedido`, `aportePagante`, `evoluir` 21696, `perfilar` 21721.
- **Mundo:** `equipesIA` 21750, `forcaHistorica`, `mundoW` 21777, `montarGrid` 21889.
- **Temporada:** `montarTemporada` 22034, `escalar` 22081, `pesosPista` 22118.
- **Fim de semana:** `FDS` 22141, `fdsResolver` 22202, `chuvaDaEtapa` 22242, `qualiDaEtapa` 22249, `rodarSessao` 22301, `gridDaEtapa` 22308.
- **Corrida:** `montar` 22327, `correr` 22412.
- **Caixa:** `lancar` 22579, `pagarPatrocinios` 22585, `pagarSalarios` 22594, `projecao` 22603, `premio` 22628, `teto` 22637.
- **Patrocínio:** `ofertasPatrocinio` 22644.
- **Banco:** `emprestimos` 22682.
- **Academia:** `custoAcademia`, `olheiros` 22723, `temporadaAcademia` 22768.
- **Início:** `novo` 22807, `iniciarAssumir` 22836, `iniciarCriar` 22911, `iniciarBase` 22937, `abrirInverno` 22957.
- **Mercado:** `aporteDono` 23062, `mercadoPilotos` 23083, `chanceAssinar` 23261, `negociar` 23280, `assinar` 23293, `dispensar` 23327, `mercadoStaff` 23382, `contratarStaff` 23395.
- **Inverno:** `escolherMotor` 23421, `construir` 23449, `aceitarPatro` 23461, `subir` 23516.
- **Ciclo do ano:** `comecarTemporada` 23575, `ajustarMeta` 23629, `janelaPacote/levarPacote` 23640/23647, `fimDeTemporada` 23665, `resolverTeto` 23761, `resgatar` 23787, `proximoAno` 23800.
- **Emprego e eventos:** `propostasEmprego` 23810, `sortearEvento` 23841.

Fluxo de uma etapa no chefe:

1. `UIC.preCorrida` mostra as decisões de estratégia, motor, ordem e TL1.
2. `UIC.irQuali` leva às sessões (`UIC.rodarSessao` / `Chefe.rodarSessao`) e ao grid (`UIC.gridFinal`).
3. `UIC.prepCorrida` usa `Gp.dadosLargada` para a escolha dos pneus.
4. `UIC.largar` chama `Chefe.montar` uma vez e passa por `Gp.entrada` até `AoVivo.abrir`.
5. Ao fim, `Gp.resultado` e `Gp.chegada` voltam para `Chefe.correr(vivo)`, que cuida de pontos, caixa, moral e registro.
6. "Simular o resto do ano" usa `Chefe.correr(null)`, o caminho estatístico.

## 2. Os 20 sistemas

| # | Sistema | Classificação | Onde | Observação |
| --- | --- | --- | --- | --- |
| 1 | Início | **profundo** | `iniciarAssumir/Criar/Base`, `Cenario`, `UIC.form` | Três modos e cenários reais nas sete séries. |
| 2 | Estado | **superficial** | global `C` | Objeto único sem esquema nem versão. Caches soltos (`UIC._M`, `Chefe._mediaIA`). Campos novos aparecem por `||` espalhados. |
| 3 | Saves | **parcial** | `UIC.salvar/continuar` | `JSON.stringify(C)` puro. **Sem número de versão e sem migração**: `continuar` só faz `JSON.parse`. O backup externo valida só `chefe.nome`, `eq.nome` e `ano`. |
| 4 | Fluxo da temporada | **profundo** | `abrirInverno` → `comecarTemporada` → etapas → `fimDeTemporada` → `proximoAno` | Balanço com "ver os resultados" já existe. |
| 5 | Calendários | **profundo** | `calendarFor(ano, sk)` | Calendários reais por série e ano. |
| 6 | Equipes | **superficial** | `equipesIA`, `Engine.resolveTeam` | As rivais têm a força histórica do ano, fixa na temporada. Não têm orçamento, plano, pacotes nem personalidade. Depois de 2026 seguem a extrapolação do banco. |
| 7 | Avaliação de pilotos | **profundo** | `hab`, `skillEm`, `Mundo` | Curvas reais, fama, moral, olheiros, academia. |
| 8 | Contratos | **profundo** | `mercadoPilotos`, `negociar`, `assinar`, `multaDispensa`, `pedidosDeSaida`, staff | Negociação com chance, multa, saída pedida. |
| 9 | Orçamento | **profundo** (anual) / **superficial** (no ano) | `livro`, `projecao`, `teto`, `emprestimos`, falência | A projeção é só do ano inteiro. Não mostra o caixa corrida a corrida nem o efeito de uma decisão antes de tomá-la. |
| 10 | Patrocinadores | **superficial** | `ofertasPatrocinio`, `fimDeTemporada` | Metas avaliadas só no fim do ano, risco de calote. Sem relação ao longo do ano e sem objetivo por corrida. |
| 11 | Desenvolvimento do carro | **profundo** (F1) / **parcial** (outras) | `aplicarPlano`, `levarPacote`, `eficiencia` | F1 com regulamento que zera o carro e teto. Nas séries de carro único (F2/F3, IndyCar desde 2012) o "chassi" ainda é desenvolvido livremente, só com peso menor; o certo seria acerto e engenharia, com teto baixo. |
| 12 | Staff | **superficial** | `nivelStaff`, `eficiencia`, `mercadoStaff` | Afeta só a eficiência do desenvolvimento. Não afeta boxes, estratégia nem confiabilidade de corrida; sem moral. |
| 13 | Classificação | **profundo** | `qualiDaEtapa`, `rodarSessao`, `Engine.regulamento` | Formatos históricos (sessões, pré-classificação, eliminação, soma), janelas de saída. |
| 14 | Corrida | **profundo**, com **problema de integração** | `Chefe.montar` + `Gp` | O ao vivo é profundo, mas quebras e batidas são **sorteadas antes da largada** pelo `montar` (`fora`, `fracFora`). Os modos escolhidos na corrida não mudam o risco de quebra. |
| 15 | Tempos de volta | **profundo** | `Prova.perfil`, `Gp.passo` (marcas `cp`), `Gp.torre` | Física por traçado; volta mais rápida válida. |
| 16 | Pneus e desgaste | **profundo** | `Gp.COMP`, `degr`, `gastoVolta`, fio/estouro | Compostos por época, chuva, regra dos dois compostos, estouro no limite. Falta **gestão de pneus separada do ritmo**: hoje só o modo de ritmo mexe no desgaste. |
| 17 | Pit stops | **profundo** | `Gp.passo` (estados 1/2/5), `perdaBox`, `regras.parado` | Pit lane com limite, parada lenta, reabastecimento. Equipe de boxes não depende de nada da gestão. |
| 18 | Decisões da IA | **parcial** | `Gp.planejar` (viés), `decidir`, `quererParar` | Estratégia de pneus e reação ao SC e à chuva existem. **Os carros da IA nunca mudam de ritmo** (sempre `normal`), não fazem undercut/overcut de propósito e não defendem. Na gestão, a IA não decide nada (ver 6). |
| 19 | Registro de resultados | **profundo** | `Chefe.correr` → `sea.results`, `dstand/cstand/porCorrida/fin`, `C.hist`, `Mundo.registrarTemporada` | `rec.top` guarda só os 10 primeiros (de propósito, pelo tamanho do save). |
| 20 | Regras por categoria/época | **profundo**, com lacunas | `Engine.regulamento`, `Gp.regras`, `Chefe.teto` | Pontos, formato de classificação, SC desde 1993, VSC desde 2015, DRS desde 2011, reabastecimento 1994–2009, teto 2021+. **Falta**: limite de combustível da era turbo (1984–88), gestão de energia da F1 desde 2014 e da Fórmula E. |

## 3. Dependências e pontos de integração

- **`Gp` é o único motor ao vivo.** O modo piloto entra por `Game.entradaDaEtapa`/`Engine.montarCorrida` e o chefe por `UIC.largar`/`Chefe.montar`; os dois chegam a `Gp.entrada` → `AoVivo.abrir`. Toda melhoria do motor vale para os dois modos. Mudança de equilíbrio que for só do chefe precisa vir de um campo da entrada (`ent`), e não de outro motor.
- **Dois caminhos de corrida no chefe:** o ao vivo (`Gp`) e o estatístico (`Chefe.correr(null)`, usado em "simular o resto do ano"). As taxas de abandono e a ordem esperada precisam continuar parecidas entre eles.
- **Determinismo:** `Gp.criar` usa `rngDe(seed)` e `sea.gpSeed[rd]` fica no save. Mas:
  - `AoVivo.cartoes` dispara a ordem de equipe automática ("favorecer o nº 1") no **ritmo de atualização da tela** (a cada 250 ms reais). Isso depende da velocidade: a mesma semente pode dar resultados diferentes a 1× e a 16×.
  - `Chefe.montar` usa o acaso global (`R`), então recarregar a página no meio de uma etapa sorteia outras quebras.
- **Preparação ↔ corrida:** `Gp.dadosLargada` cria uma prévia com a mesma semente. Qualquer mudança em `Gp.criar` precisa manter a prévia igual à largada.
- **Fim de semana ↔ corrida:** `Chefe.fdsEf` (ritmo, confiabilidade, grid) entra no `montar`; `Engine.efeitoFds` (pneu usado, modo, calor) só no modo piloto.
- **Velocidade salva:** `vdo_velcorrida` é validado em `recuperar-progresso/index.html` contra `['1','4','8','16','32','64']`. Uma velocidade nova precisa entrar nessa lista, senão o backup é recusado.

## 4. Problemas encontrados

1. O risco não vive na corrida: quebra e batida decididas antes, ritmo sem custo mecânico.
2. A IA de corrida não tem ritmo próprio, não ataca, não defende, não faz undercut.
3. Só três ritmos, e o pneu não tem gestão própria.
4. Combustível e energia só existem com reabastecimento; faltam as eras com limite.
5. A ordem de equipe automática depende da taxa de quadros (resultado muda com a velocidade).
6. A central não tem câmera: o mapa mostra sempre o circuito inteiro.
7. A estratégia mostra um plano só, sem previsão do resultado de parar agora e sem incerteza.
8. Os treinos livres quase não existem para o chefe (só a escolha do TL1 desde 2003).
9. As rivais não gerenciam nada.
10. O staff não pesa na corrida (boxes, estratégia).
11. Os patrocinadores só aparecem no fim do ano.
12. O save do chefe não tem versão nem migração.
13. Séries de carro único permitem desenvolver o chassi livremente.

## 5. Redundâncias

- `Chefe.correr(null)` e `Engine.runRace` são dois caminhos estatísticos parecidos. Não serão fundidos agora: o do chefe tem pontos de equipe, ordem de equipe e finanças; fundir é risco sem ganho para o jogador.
- `Central` (resumo animado da corrida estatística) e `AoVivo` (corrida real) coexistem de propósito: `Central` é a corrida que não foi assistida.
- As decisões do `preCorrida` (`estr` ataque/normal/poupar, `motor`) duplicam o modo de ritmo da central ao vivo. O plano é que o `preCorrida` passe a ser o **ponto de partida** dos controles da central, sem um segundo sistema.

## 6. Riscos para o save

| Risco | Medida |
| --- | --- |
| Save sem versão | Criar `C.v`, `Chefe.migrar(C)` chamado em `continuar` e no início; preencher campos novos com valores neutros. Teste com saves antigos gerados pela versão anterior. |
| Campo novo lido sem padrão | Todo campo novo é opcional na leitura (`x || padrão`) e criado pela migração. |
| Velocidade nova rejeitada pelo backup | Atualizar a lista de `vdo_velcorrida` em `recuperar-progresso`. |
| Save maior | Nada de voltas inteiras no save. Só resumos e as escolhas do fim de semana. Teste `save.js` continua valendo. |
| Corrida interrompida | A corrida ao vivo não é salva no meio, como hoje. As escolhas de treino e largada ficam no `sea` e sobrevivem. |
| Modo piloto | Nenhum campo de `S` muda de forma. Melhorias do motor entram com padrão igual ao comportamento atual quando o campo não existe. |

## 7. Plano de reformulação

Cada fase termina com o jogo funcionando, a suíte `node testes/rodar.js` passando e testes novos para o que mudou.

### Fase 1 — Motor de corrida (`Gp`)

- **Risco vivo:**
  - O `montar` do chefe passa a entregar a *probabilidade* de quebra e de batida de cada carro, e não mais a volta sorteada.
  - O `Gp` converte essa probabilidade em risco por volta, multiplicado pelo ritmo e pela carga do motor.
  - A taxa média de abandonos fica a mesma; atacar passa a custar.
  - Só quando a entrada pede: o modo piloto continua como está.
- **Quatro ritmos:** Conservar / Equilibrado / Atacar / Ataque máximo. As chaves antigas (`poupar`, `normal`, `atacar`) continuam valendo e `maximo` é nova. Cada ritmo mexe no tempo, no pneu, no erro, no motor e no consumo.
- **Gestão de pneus**, separada do ritmo: Cuidar / Normal / Forçar.
- **Combustível e energia, só onde a regra existia:**
  - limite de combustível na F1 de 1984 a 1988, sem reabastecimento: quem gasta demais fica sem gasolina;
  - limite de combustível e energia na F1 desde 2014 e na Fórmula E: quem gasta demais é obrigado a tirar o pé;
  - nas eras com reabastecimento, a mistura estica ou encurta o trecho.
- **IA de corrida com personalidade por equipe:**
  - ataca quando está perto e defende quando é atacada;
  - poupa pneu quando o desgaste foge do plano;
  - faz undercut quando a janela está perto e o carro da frente está ao alcance;
  - administra a energia.
  - Tudo decidido na passagem pela linha, com o sorteio da própria corrida.
- **Ordem de equipe dentro da simulação:** livre, manter posições, ceder. A automática do "nº 1" sai da tela e vai para o `Gp.passo`.
- **Testes:**
  - mesma semente = mesmo resultado a 1×, 2×, 4×, 8× e 16×;
  - abandonos médios iguais aos de antes;
  - o Ataque máximo é mais rápido e quebra/gasta mais;
  - Cuidar faz o pneu durar mais;
  - na era turbo, quem anda rico demais fica sem combustível;
  - a IA muda de ritmo.

### Fase 2 — Central de corrida (`AoVivo`), com a skill de design

- Torre ao vivo com intervalo, líder, pneus e última/melhor volta, e o número de paradas.
- Mapa 2D com câmera: visão geral, líder, carro 1, carro 2 (zoom que segue a distância simulada).
- Cartão de cada carro seu:
  - ritmo em 4 níveis, pneus em 3, mistura/energia quando a regra existe;
  - box com o composto, ordem de equipe.
- Estratégia com previsão incerta, em faixas e nunca em número exato:
  - "parar agora: volta em ~P9 (P8–P11)";
  - quanto o pneu ainda dura;
  - 1 parada contra 2.
- Velocidades: pausa, 1×, 2×, 4×, 8×, 16× (32× e 64× continuam).
- Visual carbono/dourado/vermelho, próprio, sem copiar jogos existentes. Verificado em 1440, 768 e 390 px.

### Fase 3 — Treinos e classificação

- **Programa de treino por carro:**
  - acerto de classificação, equilíbrio ou ritmo de corrida;
  - corridas longas dão dados de pneu: a faixa de previsão da fase 2 fica mais estreita e o plano melhor.
- **Acerto em compromisso:**
  - mais classificação = mais ritmo no sábado;
  - mais corrida = menos desgaste no domingo.
- **Classificação:** os formatos históricos ficam; a decisão de saída ganha consequência no uso de pneus.

### Fase 4 — Administração

- **Caixa:** projeção do caixa etapa a etapa (o que entra e sai em cada corrida) e o efeito de uma decisão antes de confirmar.
- **Patrocinadores:** relação ao longo do ano, objetivos por corrida, renovação que depende disso.
- **Staff:**
  - moral e assédio das rivais;
  - o chefe de mecânicos e o treino da equipe de boxes passam a valer na parada.
- **Instalações:** obra que leva tempo.
- **Diretoria:** prioridades declaradas e confiança ao longo do ano.

### Fase 5 — Decisões da IA

- **Durante os anos documentados:** a força histórica continua sendo a referência (nada de inventar outro campeão). A IA decide mercado, pacotes e reação às suas contratações.
- **Depois de 2026:**
  - equipes com orçamento e personalidade (agressiva, conservadora, de fábrica, independente);
  - regulamento que zera;
  - consequências de longo prazo.

### Fase 6 — Interface do modo chefe (skill de design)

Hub, mercado, finanças, fábrica: carbono/dourado/vermelho, fotos reais quando houver, sem ornamento vazio, legível no celular.

### Fase 7 — Testes e equilíbrio

- Suíte completa, saves antigos (gerados antes da reforma) abrindo e progredindo.
- Corrida determinística por semente.
- Taxa de vitória por força de carro.
- Tempo de execução das temporadas simuladas.

## 8. O que não muda

- Nada de framework, nada de segundo motor de corrida, de finanças, de banco de pilotos ou de contratos.
- Regulamento histórico: sem DRS/ERS onde não havia, sem teto antes de 2021, sem desenvolvimento livre em carro único, formatos de classificação da época.
- O modo piloto só recebe o que vem do motor compartilhado, com o comportamento atual como padrão.
- Tudo local: sem commit, push ou deploy.

## 9. Depois da reforma (2026-10-21)

As sete fases foram feitas sobre os sistemas existentes, sem segundo motor,
sem framework e sem tocar no comportamento da corrida do modo piloto. A suíte
`node testes/rodar.js` passa inteira (49 arquivos), com quatro testes novos.

### Sistemas que mudaram de classificação

| # | Sistema | Antes | Agora | O que mudou |
| --- | --- | --- | --- | --- |
| 2 | Estado | superficial | profundo | Save com versão e migração em passos |
| 3 | Saves | parcial | profundo | `Chefe.V = 4`; `Chefe.migrar` em `continuar`; teste de save v1 jogando na v4; velocidade 2× aceita no backup |
| 6 | Equipes | superficial | profundo depois de 2026 | Gestão das rivais (`iaGarantir`, `iaInverno`, `iaPacotes`); história intacta até 2026 |
| 9 | Orçamento | profundo anual | profundo | `Chefe.fluxo`: caixa etapa a etapa, faixa no fim do ano, efeito de decisões |
| 10 | Patrocinadores | superficial | profundo | Objetivo por etapa, satisfação, renovação pela satisfação |
| 12 | Staff | superficial | funcional e mais profundo | Chefe de mecânicos pesando nas paradas (o assédio já existia como evento) |
| 14 | Corrida | integração ruim | profundo | Risco por volta no lugar da quebra marcada; abandonos ao vivo perto dos da simulação rápida |
| 16 | Pneus | profundo | profundo | Gestão de pneus separada do ritmo; acerto muda o desgaste |
| 17 | Pit stops | profundo | profundo | Equipe de boxes da gestão |
| 18 | IA | parcial | profundo | Ritmo, defesa, undercut, cobertura e energia por personalidade de equipe; rivais geridas depois de 2026 |
| 20 | Regras | lacunas | profundo | Combustível da era turbo (1984–88), F1 desde 2014, Fórmula E desde 2018 |

Os dois itens da última coluna que eram "faltando" na auditoria também foram
resolvidos:

- **Determinismo:** a ordem do nº 1 saiu da tela e foi para `Gp.passo`. A mesma
  semente com as mesmas ordens dá o mesmo resultado a 1×, 2×, 4×, 8× e 16×.
- **Treinos livres:** programa e acerto por carro, com efeito no sábado, no
  domingo e na qualidade das previsões.

### Medidas

`testes/medir-gp.js` compara as duas formas de correr na mesma montagem:

| Ano | Abandonos ao vivo | Abandonos na simulação rápida |
| --- | --- | --- |
| 1986 | 30% | 34% |
| 2016 | 11% | 13% |
| 2024 | 6–8% | 6–7% |

As paradas por carro são as mesmas com e sem a gestão.

`testes/medir-justica.js` mede a justiça. Com o muro no automático, os seus
carros terminam, contra o lugar que o ritmo previa, como os da IA:

- no geral: +0,3 posição para os seus carros e 0,0 para a IA;
- na mesma faixa de ritmo: +0,22 contra +0,19.

Em 24 anos simulados depois de 2026, a gestão das rivais teve quatro líderes
diferentes. Houve mobilidade no meio do grid, sem convergência e sem domínio
eterno.

### O que ficou de fora, de propósito

- Mudança de regulamento inventada depois de 2026.
- As novidades do motor no modo piloto: elas exigem só a flag `gestao` na
  entrada, mas mudariam o equilíbrio já calibrado da carreira.
- O redesenho do hub inteiro do chefe: ele divide estilos com o modo piloto.
  Entraram o painel da próxima etapa, o gráfico de caixa e o painel das
  rivais; a central de corrida foi redesenhada por inteiro.
