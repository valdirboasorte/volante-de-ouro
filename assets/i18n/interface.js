(function () {
  const rows = `
O título por um ponto|The title by a single point|El título por un punto
A última volta de Abu Dhabi|The final lap in Abu Dhabi|La última vuelta de Abu Dabi
A carreira que a história interrompeu|The career history cut short|La carrera que la historia interrumpió
O talento interrompido no auge|A talent cut short at its peak|Un talento interrumpido en su mejor momento
Um ponto de diferença, três pilotos|Three drivers, one point apart|Tres pilotos separados por un punto
A rivalidade dentro da própria garagem|Rivalry within your own garage|La rivalidad dentro del propio garaje
A equipe que nasceu das cinzas|The team that rose from the ashes|El equipo que renació de las cenizas
A decisão mais discutida do automobilismo brasileiro|Brazilian motorsport's most debated decision|La decisión más discutida del automovilismo brasileño
O piloto mais amado que nunca foi campeão|The most beloved driver never to win a title|El piloto más querido que nunca fue campeón
E se ele tivesse ido para a Europa?|What if he had gone to Europe?|¿Y si se hubiera ido a Europa?
Onze tentativas até o leite|Eleven attempts to taste the milk|Once intentos hasta la leche
O recordista absoluto|The undisputed record holder|El dueño absoluto del récord
Da F1 de volta para casa|From F1 back home|De la F1 de vuelta a casa
O domínio total na América|Total domination in America|El dominio total en América
Senna, a partir de 1994|Senna, from 1994 onwards|Senna, a partir de 1994
Kubica, a partir de 2011|Kubica, from 2011 onwards|Kubica, a partir de 2011
Kanaan na F1 dos anos 90|Kanaan in 1990s F1|Kanaan en la F1 de los años 90
Barrichello na Stock, 2012|Barrichello in Stock Car, 2012|Barrichello en Stock Car, 2012
Interlagos, última volta da temporada. Você cruza a linha como campeão do mundo e perde o título alguns segundos depois, numa curva a 3 km dali. A temporada inteira recomeça agora, do zero.|Interlagos, the final lap of the season. You cross the line as world champion and lose the title a few seconds later, at a corner 3 km away. The entire season now starts again from scratch.|Interlagos, última vuelta de la temporada. Cruzas la meta como campeón del mundo y pierdes el título unos segundos después, en una curva a 3 km de allí. Toda la temporada vuelve a empezar ahora, desde cero.
A temporada mais disputada em décadas, decidida na última volta do último GP. Recomece o ano inteiro e vá buscar o oitavo.|The closest season in decades, decided on the final lap of the final Grand Prix. Restart the entire year and go after number eight.|La temporada más disputada en décadas, decidida en la última vuelta del último GP. Vuelve a empezar todo el año y ve a por el octavo.
Ele havia acabado de assinar com a equipe mais forte do grid, e a temporada mal tinha começado. Aqui a carreira continua, e o que vem depois é você quem escreve.|He had just signed for the strongest team on the grid, and the season had barely begun. Here, his career continues, and you write what comes next.|Acababa de fichar por el equipo más fuerte de la parrilla y la temporada apenas había empezado. Aquí su carrera continúa, y lo que viene después lo escribes tú.
Estava prestes a fazer sua melhor temporada quando um acidente fora da F1 tirou tudo de cena. Aqui esse ano acontece — e todos os outros também.|He was about to have his best season when an accident away from F1 took it all away. Here, that year happens — and all the others do too.|Estaba a punto de hacer su mejor temporada cuando un accidente fuera de la F1 lo cambió todo. Aquí ese año se disputa, y todos los demás también.
Bicampeão, equipe nova, um estreante do outro lado da garagem e uma temporada que virou guerra civil. Os três terminaram separados por um ponto.|A two-time champion, a new team, a rookie across the garage and a season that became a civil war. The three title contenders finished a single point apart.|Bicampeón, equipo nuevo, un debutante al otro lado del garaje y una temporada que se convirtió en una guerra civil. Los tres terminaron separados por un punto.
O melhor carro do grid, e o adversário mais difícil é seu companheiro de equipe. Foi assim que saiu o terceiro título.|The best car on the grid, and your toughest opponent is your teammate. That was the road to the third title.|El mejor coche de la parrilla, y el rival más difícil es tu compañero de equipo. Así llegó el tercer título.
A Honda foi embora, a equipe quase fechou e o carro que sobrou era o melhor do grid. Depois de 16 anos esperando, a chance apareceu.|Honda left, the team almost closed, and the car that remained was the best on the grid. After 16 years of waiting, the chance arrived.|Honda se fue, el equipo casi cerró y el coche que quedó era el mejor de la parrilla. Tras 16 años esperando, llegó la oportunidad.
Bicampeão, ele deixou uma McLaren vencedora para pilotar o carro da equipe da própria família. Nunca mais venceu. E se desse certo?|A two-time champion, he left a winning McLaren to drive for his family's team. He never won again. What if it had worked?|Bicampeón, dejó un McLaren ganador para pilotar el coche del equipo de su propia familia. Nunca volvió a ganar. ¿Y si hubiera salido bien?
Rápido como ninguém, sem nunca ter erguido a taça. A temporada de 1982 recomeça inteira, e o título continua em aberto.|Faster than anyone, yet he never lifted the trophy. The entire 1982 season starts again, with the title still up for grabs.|Rápido como nadie, sin haber levantado nunca la copa. La temporada de 1982 vuelve a empezar entera y el título sigue abierto.
Ele foi para os Estados Unidos e virou lenda nos ovais. Nesta linha do tempo, a ligação veio de Silverstone.|He went to the United States and became a legend on the ovals. In this timeline, the call came from Silverstone.|Se fue a Estados Unidos y se convirtió en leyenda en los óvalos. En esta línea temporal, la llamada llegó de Silverstone.
Onze anos batendo na porta das 500 Milhas de Indianápolis, e ela finalmente abriu. Faça de novo — e depois vá além.|Eleven years knocking on the door of the Indianapolis 500, until it finally opened. Do it again — then go further.|Once años llamando a la puerta de las 500 Millas de Indianápolis, hasta que por fin se abrió. Hazlo de nuevo y después ve más allá.
Doze títulos brasileiros, um número que ninguém chegou perto de alcançar. Comece do meio da lenda e veja até onde vai.|Twelve Brazilian titles, a number nobody came close to matching. Start in the middle of the legend and see how far you can go.|Doce títulos brasileños, una cifra que nadie estuvo cerca de alcanzar. Empieza en medio de la leyenda y descubre hasta dónde llegas.
Depois de 19 temporadas de Fórmula 1, o recordista de GPs volta a correr no Brasil. Sobrou muito para provar.|After 19 Formula 1 seasons, the Grand Prix appearance record holder returns to race in Brazil. There is still plenty to prove.|Después de 19 temporadas de Fórmula 1, el récordman de grandes premios vuelve a correr en Brasil. Todavía queda mucho por demostrar.
Descartado pela Fórmula 1, ele atravessou o Atlântico e virou o piloto mais espetacular do continente. Refaça o bicampeonato.|Rejected by Formula 1, he crossed the Atlantic and became the continent's most spectacular driver. Win those back-to-back titles again.|Descartado por la Fórmula 1, cruzó el Atlántico y se convirtió en el piloto más espectacular del continente. Repite el bicampeonato.
Não foi possível salvar a equipe.|Could not save the team.|No se pudo guardar el equipo.
Não consegui abrir a equipe salva.|Could not load the saved team.|No se pudo abrir el equipo guardado.
Assumir uma equipe real|Take over a real team|Dirigir un equipo real
Fundar uma equipe na Fórmula 1|Found a Formula 1 team|Fundar un equipo de Fórmula 1
Começar na base|Start in the junior ranks|Empezar en las categorías inferiores
Escolha qualquer equipe de qualquer grid desde 1950. Ela vem com os pilotos, o carro, o dono e a expectativa que tinha naquele ano.|Choose any team from any grid since 1950. It comes with the drivers, car, owner and expectations it had that year.|Elige cualquier equipo de cualquier parrilla desde 1950. Incluye los pilotos, el coche, el dueño y las expectativas que tenía aquel año.
Nome, cor e bandeira são seus. O dinheiro é de investidores, o carro é o pior do grid e ninguém quer correr por você. Ainda.|The name, colour and flag are yours. The money belongs to investors, the car is the worst on the grid and nobody wants to race for you. Yet.|El nombre, el color y la bandera son tuyos. El dinero es de inversores, el coche es el peor de la parrilla y nadie quiere correr para ti. Todavía.
Uma equipe pequena numa categoria de acesso. Pilotos que pagam para correr, orçamento curto e a Fórmula 1 lá em cima, do outro lado de alguns títulos.|A small team in a junior series. Drivers who pay to race, a tight budget and Formula 1 at the top, a few titles away.|Un equipo pequeño en una categoría de acceso. Pilotos que pagan por correr, poco presupuesto y la Fórmula 1 allá arriba, al otro lado de unos cuantos títulos.
Sua equipe|Your team|Tu equipo
Candidata ao título|Title contender|Candidato al título
Pelotão da frente|Front runners|Grupo de cabeza
Meio do grid|Midfield|Mitad de parrilla
Fundo do grid|Back of the grid|Fondo de parrilla
As equipes de {0}, da mais forte para a mais fraca. Quem você escolher sai do grid da história: a partir daqui, quem decide é você.|The teams of {0}, from strongest to weakest. The team you choose leaves the historical grid: from here on, you decide.|Los equipos de {0}, del más fuerte al más débil. El que elijas sale de la parrilla histórica: a partir de aquí decides tú.
Escalação a definir|Line-up to be decided|Alineación por definir
equipe de fábrica, motor próprio|works team, own engine|equipo de fábrica, motor propio
Categoria de estreia|Debut series|Categoría de debut
Quanto mais baixo, mais barato — e mais longe da Fórmula 1.|The lower you start, the cheaper it is — and the further from Formula 1.|Cuanto más abajo, más barato y más lejos de la Fórmula 1.
Começa com {0}. É isso para sobreviver até o dinheiro de patrocínio e de prêmio aparecer.|Starts with {0}. That must keep you going until sponsorship and prize money arrive.|Empiezas con {0}. Eso tiene que bastar hasta que lleguen los patrocinios y los premios.
Você começa com pouco: o dinheiro de uma temporada modesta, e pilotos que pagam pela vaga.|You start small: enough money for a modest season, and drivers who pay for their seats.|Empiezas con poco: el dinero para una temporada modesta y pilotos que pagan por su asiento.
De onde vem o dinheiro|Where the money comes from|De dónde viene el dinero
Nome da equipe|Team name|Nombre del equipo
Ex.: Fittipaldi Racing|E.g. Fittipaldi Racing|Ej.: Fittipaldi Racing
Cor|Colour|Color
Cor {0}|Colour {0}|Color {0}
Diga quem é o chefe da equipe.|Enter the team principal's name.|Indica quién es el jefe del equipo.
Escolha a equipe que vai comandar.|Choose the team you will lead.|Elige el equipo que vas a dirigir.
A equipe precisa de um nome.|The team needs a name.|El equipo necesita un nombre.
Muro dos boxes|The pit wall|Muro de boxes
Ao trabalho|Let's get to work|A trabajar
Você é o novo chefe da {0}. O carro, os pilotos e o dono já estão aqui — a diretoria vai dizer o que espera depois dos testes de pré-temporada. Contratos, motor, patrocínio e o dinheiro de desenvolvimento passam pela sua mesa a partir de agora.|You are the new team principal of {0}. The car, drivers and owner are already here — the board will set its expectations after pre-season testing. Contracts, engines, sponsors and development spending now come through your desk.|Eres el nuevo jefe de {0}. El coche, los pilotos y el dueño ya están aquí; la directiva fijará sus expectativas tras los test de pretemporada. Desde ahora, contratos, motor, patrocinios y presupuesto de desarrollo pasan por tu mesa.
A {0} existe no papel e numa fábrica alugada. Falta quase tudo: pilotos, um contrato de motor que faça sentido e patrocinadores. O dinheiro dos investidores parece muito. Não é.|{0} exists on paper and in a rented factory. Almost everything is missing: drivers, a sensible engine deal and sponsors. The investors' money looks like a lot. It is not.|{0} existe sobre el papel y en una fábrica alquilada. Falta casi todo: pilotos, un contrato de motor razonable y patrocinadores. El dinero de los inversores parece mucho. No lo es.
A {0} tem dois carros, um caminhão e um sonho. Na {1} os pilotos pagam para correr: escolher entre o talentoso e o que traz dinheiro é a primeira decisão de toda pré-temporada.|{0} has two cars, a truck and a dream. In {1}, drivers pay to race: choosing between talent and funding is the first decision of every pre-season.|{0} tiene dos coches, un camión y un sueño. En {1} los pilotos pagan por correr: elegir entre el talentoso y el que trae dinero es la primera decisión de cada pretemporada.
A pré-temporada é uma lista de tarefas. Quando os dois carros tiverem piloto, dá para largar.|Pre-season is a to-do list. Once both cars have drivers, you can go racing.|La pretemporada es una lista de tareas. Cuando los dos coches tengan piloto, podrás salir a correr.
A pré-temporada é uma lista de tarefas. Quando os dois carros tiverem piloto e motor, dá para largar.|Pre-season is a to-do list. Once both cars have drivers and engines, you can go racing.|La pretemporada es una lista de tareas. Cuando los dos coches tengan piloto y motor, podrás salir a correr.
motor próprio|own engine|motor propio
sem motor|no engine|sin motor
chassi único|spec chassis|chasis único
motor {0}|{0} engine|motor {0}
Conselho|Board|Consejo
Diretoria|Management|Directiva
confiança|confidence|confianza
A equipe é|Your stake is|El equipo es
sua|yours|tuyo
Pré-temporada de {0}|{0} pre-season|Pretemporada de {0}
Temporada {0}|{0} season|Temporada {0}
{0} · chefe de equipe|{0} · team principal|{0} · jefe de equipo
Aerodinâmica|Aerodynamics|Aerodinámica
Chassi|Chassis|Chasis
Motor|Engine|Motor
Engenharia|Engineering|Ingeniería
Caixa|Cash|Caja
no ano: {0}|this year: {0}|en el año: {0}
disponível|available|disponible
Nº 1|No. 1|N.º 1
fora|out|fuera
contrato acabou|contract expired|contrato terminado
contrato até {0}|contract until {0}|contrato hasta {0}
até {0}|until {0}|hasta {0}
pagante|pay driver|piloto de pago
Nível atual|Current rating|Nivel actual
titular|race driver|titular
reserva|reserve|reserva
Vago|Vacant|Vacante
vago|vacant|vacante
Nenhum piloto contratado.|No drivers signed.|Ningún piloto contratado.
Academia: {0}|Academy: {0}|Academia: {0}
Carro sem patrocinador.|No sponsor on the car.|Coche sin patrocinador.
rompido|terminated|rescindido
chuva|rain|lluvia
Meta da diretoria: {0} nos construtores|Board target: {0} in the constructors' championship|Objetivo de la directiva: {0} en constructores
Nos testes: entre o {0} e o {1} carro do grid|In testing: between the {0} and {1} best cars on the grid|En los test: entre el {0} y el {1} coche de la parrilla
excluída dos construtores|excluded from the constructors' championship|excluido del campeonato de constructores
Balanço de {0} →|{0} season review →|Balance de {0} →
Pacote de atualização|Upgrade package|Paquete de mejoras
Simular o resto|Simulate the rest|Simular el resto
{0} de 2 titulares|{0} of 2 race drivers|{0} de 2 titulares
sem reserva|no reserve driver|sin reserva
reserva: {0}|reserve: {0}|reserva: {0}
{0} contrato(s) para renovar|{0} contract(s) to renew|{0} contrato(s) por renovar
Motor próprio · {0} por ano|Own engine · {0} a year|Motor propio · {0} al año
Sem fornecedor|No supplier|Sin proveedor
{0} contrato(s) · {1} por ano · {2} proposta(s)|{0} contract(s) · {1} a year · {2} offer(s)|{0} contrato(s) · {1} al año · {2} propuesta(s)
Empréstimo: {0} parcela(s) de {1}|Loan: {0} instalment(s) of {1}|Préstamo: {0} cuota(s) de {1}
Sem dívida · dá para pedir dinheiro emprestado|No debt · loans available|Sin deuda · puedes pedir un préstamo
{0} garoto(s) · {1} observado(s) pelos olheiros|{0} young driver(s) · {1} being scouted|{0} jóvenes · {1} observados por ojeadores
Entrar na Fórmula 1|Enter Formula 1|Entrar en la Fórmula 1
Subir para a {0}|Move up to {0}|Subir a {0}
Ainda não|Not yet|Todavía no
{0} proposta(s) de sociedade|{0} investment offer(s)|{0} propuesta(s) de sociedad
Vender a equipe|Sell the team|Vender el equipo
Vale hoje {0} para você|Your stake is worth {0} today|Tu parte vale hoy {0}
Decisões pendentes|Pending decisions|Decisiones pendientes
{0} assunto(s) esperando você|{0} matter(s) awaiting your decision|{0} asunto(s) esperando tu decisión
regulamento novo: {0}|new regulations: {0}|reglamento nuevo: {0}
Saldo previsto|Projected balance|Saldo previsto
Deve entrar|Expected income|Ingresos previstos
Deve sair|Expected spending|Gastos previstos
Caixa hoje|Cash today|Caja actual
Começar a temporada {0}|Start the {0} season|Comenzar la temporada {0}
Falta: {0}|Still needed: {0}|Falta: {0}
Falta {0}.|Still needed: {0}.|Falta {0}.
O carro|The car|El coche
Na base o chassi é igual para todos. O que separa as equipes é a engenharia — o acerto, a leitura dos pneus, o trabalho com o piloto.|In the junior ranks, everyone uses the same chassis. Engineering separates the teams: setup, tyre understanding and work with the driver.|En las categorías inferiores todos usan el mismo chasis. La diferencia está en la ingeniería: la puesta a punto, la lectura de los neumáticos y el trabajo con el piloto.
Em {0}, o ritmo vem {1}% da aerodinâmica, {2}% do chassi e {3}% do motor. A confiabilidade não dá ritmo: decide quem chega.|In {0}, pace comes {1}% from aerodynamics, {2}% from the chassis and {3}% from the engine. Reliability does not add pace: it decides who finishes.|En {0}, el ritmo procede un {1}% de la aerodinámica, un {2}% del chasis y un {3}% del motor. La fiabilidad no da ritmo: decide quién termina.
Pilotos sob contrato|Contracted drivers|Pilotos con contrato
Função|Role|Función
Até|Until|Hasta
Na equipe|With the team|En el equipo
Ninguém.|Nobody.|Nadie.
Dono / fábrica|Owner / manufacturer|Dueño / fábrica
Pilotos pagantes|Pay drivers|Pilotos de pago
Direitos e produtos|Rights and merchandise|Derechos y productos
Prêmio de construtores|Constructors' prize money|Premio de constructores
Banco (empréstimo)|Bank loan|Banco (préstamo)
Salários dos pilotos|Driver salaries|Salarios de los pilotos
Viagens e operação|Travel and operations|Viajes y operaciones
Reparos|Repairs|Reparaciones
Multas|Fines|Multas
Outros|Other|Otros
Saldo|Balance|Saldo
Teto de gastos|Cost cap|Límite presupuestario
Usado|Used|Utilizado
{0} de {1}. Salário de piloto e motor ficam fora da conta.|{0} of {1}. Driver salaries and engines are excluded.|{0} de {1}. Los salarios de los pilotos y el motor quedan fuera del cálculo.
Previsão para {0}|Forecast for {0}|Previsión para {0}
O prêmio de construtores é estimado pelo resultado do ano passado. O resto sai dos contratos que existem hoje.|Constructors' prize money is estimated from last year's results. The rest is based on current contracts.|El premio de constructores se estima según el resultado del año pasado. El resto se calcula con los contratos actuales.
{0} até aqui|{0} so far|{0} hasta ahora
Nenhuma temporada completa ainda.|No completed seasons yet.|Todavía no hay temporadas completas.
Nada ainda.|Nothing yet.|Todavía nada.
rápido|fast|rápido
de rua|street|urbano
técnico|technical|técnico
chuva provável|rain likely|lluvia probable
pode chover|rain possible|puede llover
tempo firme|settled weather|tiempo estable
Estratégia de cada carro|Strategy for each car|Estrategia de cada coche
substituto|substitute|sustituto
Poupar o carro|Preserve the car|Cuidar el coche
Potência máxima|Maximum power|Potencia máxima
Ordem de equipe|Team orders|Órdenes de equipo
Corrida livre|Free to race|Carrera libre
Favorecer o nº 1|Favour the No. 1|Favorecer al n.º 1
Nº 1: {0}|No. 1: {0}|N.º 1: {0}
Atacar ganha posição e bate mais. Potência máxima quebra mais. A ordem de equipe só age quando o segundo piloto está logo à frente do primeiro — e ele não vai gostar.|Attacking gains positions but increases crashes. Maximum power increases failures. Team orders only apply when the second driver is directly ahead of the first — and he will not like it.|Atacar permite ganar posiciones, pero aumenta los accidentes. La potencia máxima aumenta las averías. Las órdenes solo actúan cuando el segundo piloto está justo delante del primero, y no le va a gustar.
Primeiro treino livre|First free practice|Primer entrenamiento libre
Os titulares|The race drivers|Los titulares
no carro de {0}|in {0}'s car|en el coche de {0}
Quem roda o treino ganha quilometragem e experiência. O titular que cede o carro chega ao sábado com menos acerto.|The driver taking part gains mileage and experience. The race driver giving up the car reaches Saturday with less setup work.|Quien disputa el entrenamiento gana kilometraje y experiencia. El titular que cede el coche llega al sábado con menos trabajo de puesta a punto.
Imprevisto do fim de semana|Weekend surprise|Imprevisto del fin de semana
Vencedor:|Winner:|Ganador:
Pole:|Pole:|Pole:
Caixa no fim de semana:|Weekend cash flow:|Balance del fin de semana:
Simular o resto do ano?|Simulate the rest of the year?|¿Simular el resto del año?
As decisões de corrida atuais valem para todas as etapas|Your current race decisions apply to every remaining round|Las decisiones de carrera actuales se aplican a todas las etapas
Faltam {0} corridas. Os acontecimentos do caminho ficam sem a sua decisão — o box resolve do jeito mais prudente.|There are {0} races left. Events along the way will be handled by the pit wall using the most cautious option.|Quedan {0} carreras. El muro resolverá los acontecimientos del camino con la opción más prudente.
Uma peça nova, uma aposta nova|A new part, a new gamble|Una pieza nueva, una apuesta nueva
Onde|Where|Dónde
Tamanho|Size|Tamaño
Carro novo|New car|Coche nuevo
O que funciona no túnel nem sempre funciona na pista. Um pacote pode render mais do que o prometido, pode não mudar nada — ou pode deixar o carro pior.|What works in the wind tunnel does not always work on track. A package may deliver more than promised, change nothing — or make the car worse.|Lo que funciona en el túnel no siempre funciona en pista. Un paquete puede rendir más de lo prometido, no cambiar nada o empeorar el coche.
Parte da fábrica está no carro do ano que vem: isso pesa aqui.|Part of the factory is working on next year's car: that affects this package.|Parte de la fábrica trabaja en el coche del año que viene: eso influye aquí.
Levar para a pista|Bring it to the track|Llevar a la pista
Funcionou melhor do que o túnel prometia. Os pilotos sentiram na primeira volta.|It worked better than the tunnel predicted. The drivers felt it on the first lap.|Funcionó mejor de lo que prometía el túnel. Los pilotos lo notaron en la primera vuelta.
Funcionou como o previsto. Um passo à frente.|It worked as expected. A step forward.|Funcionó según lo previsto. Un paso adelante.
Mal se nota no cronômetro. O dinheiro foi, o ganho não veio.|The stopwatch barely notices. The money is gone; the gain never came.|Apenas se nota en el cronómetro. El dinero se fue y la mejora no llegó.
O carro ficou pior. A correlação entre túnel e pista falhou, e o pacote volta para a fábrica.|The car got worse. Correlation between tunnel and track failed, and the package goes back to the factory.|El coche empeoró. Falló la correlación entre el túnel y la pista, y el paquete vuelve a la fábrica.
Melhor do que o esperado|Better than expected|Mejor de lo esperado
Deu certo|It worked|Salió bien
Mais ou menos|So-so|Más o menos
Deu errado|It went wrong|Salió mal
Decisão do chefe|The team principal's decision|Decisión del jefe
Um ano que vai ficar nos livros pelo motivo errado: a equipe foi excluída do campeonato de construtores.|A year that will enter the history books for the wrong reason: the team was excluded from the constructors' championship.|Un año que quedará en los libros por el motivo equivocado: el equipo fue excluido del campeonato de constructores.
Campeã. A {0} termina {1} no topo{2}. É para isso que se passa a pré-temporada inteira na fábrica.|Champions. {0} finishes {1} on top{2}. This is why you spend all pre-season in the factory.|Campeones. {0} termina {1} en lo más alto{2}. Para esto se pasa toda la pretemporada en la fábrica.
, com o campeão entre os pilotos|, with the drivers' champion as well|, también con el campeón de pilotos
O carro era o {0} do grid e a equipe terminou em {1}. Os pilotos e o box tiraram mais do que o material permitia.|The car ranked {0} on the grid and the team finished {1}. The drivers and pit wall delivered more than the equipment allowed.|El coche era el {0} de la parrilla y el equipo terminó {1}. Los pilotos y el muro sacaron más de lo que permitía el material.
O carro era o {0} do grid e a equipe terminou em {1}. Ficou ponto pelo caminho — quebra, erro ou azar.|The car ranked {0} on the grid and the team finished {1}. Points were lost along the way through failures, mistakes or bad luck.|El coche era el {0} de la parrilla y el equipo terminó {1}. Se perdieron puntos por el camino: averías, errores o mala suerte.
{0} nos construtores, mais ou menos onde o carro permitia. Nem milagre, nem desastre.|{0} in the constructors' championship, roughly where the car belonged. Neither a miracle nor a disaster.|{0} en constructores, más o menos donde permitía el coche. Ni milagro ni desastre.
O conselho|The board|El consejo
A diretoria|Management|La directiva
A meta era {0} e a equipe terminou em {1}. Confiança em {2}% ({3}).|The target was {0} and the team finished {1}. Confidence: {2}% ({3}).|El objetivo era {0} y el equipo terminó {1}. Confianza en el {2}% ({3}).
Não há mais clima para você no cargo.|You can no longer stay in the role.|Ya no hay condiciones para que sigas en el cargo.
É o último aviso.|This is your final warning.|Es el último aviso.
deu calote e rompeu|defaulted and terminated the deal|incumplió el pago y rescindió
cumprido, bônus de {0}|achieved, bonus of {0}|cumplido, bonificación de {0}
não cumprido, contrato reduzido|missed, contract reduced|incumplido, contrato reducido
Campeão:|Champion:|Campeón:
Construtores:|Constructors:|Constructores:
O dinheiro do ano|The year's finances|Las cuentas del año
O dinheiro do ano · prêmio de {0}|The year's finances · prize money of {0}|Las cuentas del año · premio de {0}
A auditoria da federação vai olhar as suas contas|The federation's auditors will inspect your accounts|La auditoría de la federación revisará tus cuentas
A equipe gastou {0} acima do teto de {1} — {2}% a mais. Dá para declarar e aceitar a punição, ou apresentar as contas de um jeito que a auditoria talvez não perceba.|The team spent {0} above the {1} cap — {2}% over. You can declare it and accept the penalty, or present the accounts in a way the auditors might miss.|El equipo gastó {0} por encima del límite de {1}, un {2}% de más. Puedes declararlo y aceptar la sanción o presentar las cuentas de forma que quizá la auditoría no lo detecte.
Declarar o estouro|Declare the overspend|Declarar el exceso
Multa e menos túnel de vento no ano que vem. Acaba aí.|A fine and less wind tunnel time next year. That is the end of it.|Multa y menos túnel de viento el año que viene. Acaba ahí.
Maquiar as contas|Manipulate the accounts|Maquillar las cuentas
Se passar, passou. Se não passar, é escândalo, multa pesada e perda de pontos.|If it gets through, you are clear. If not, expect a scandal, a heavy fine and lost points.|Si cuela, cuela. Si no, habrá escándalo, multa fuerte y pérdida de puntos.
O veredito|The verdict|El veredicto
O rombo|The shortfall|El agujero
A diretoria pagou a conta|Management paid the bill|La directiva pagó la cuenta
O dono cobriu {0} de dívida. Cobriu, e anotou. A confiança caiu para {1}%.|The owner covered {0} in debt. Covered it, and remembered it. Confidence fell to {1}%.|El dueño cubrió {0} de deuda. Lo cubrió y tomó nota. La confianza cayó al {1}%.
Falência|Bankruptcy|Quiebra
A equipe deve {0}|The team owes {0}|El equipo debe {0}
O dinheiro acabou. Os fornecedores cobram, os funcionários perguntam do salário e o banco quer uma resposta até sexta.|The money is gone. Suppliers demand payment, staff ask about wages and the bank wants an answer by Friday.|El dinero se acabó. Los proveedores reclaman, los empleados preguntan por su sueldo y el banco quiere una respuesta antes del viernes.
Aceitar um resgate|Accept a bailout|Aceptar un rescate
Um investidor paga a dívida e fica com {0}% da equipe.|An investor pays the debt and takes {0}% of the team.|Un inversor paga la deuda y se queda con el {0}% del equipo.
Você perde a maioria.|You lose majority ownership.|Pierdes la mayoría.
Fechar as portas|Shut the team down|Cerrar las puertas
A equipe deixa de existir. A sua carreira de chefe termina aqui.|The team ceases to exist. Your career as team principal ends here.|El equipo deja de existir. Tu carrera como jefe termina aquí.
A equipe sobrevive|The team survives|El equipo sobrevive
A dívida foi paga. Você agora tem {0}% da {1}.|The debt has been paid. You now own {0}% of {1}.|La deuda está pagada. Ahora tienes el {0}% de {1}.
Existe um conselho acima de você.|You now answer to a board.|Ahora hay un consejo por encima de ti.
A {0} quer outro nome no muro dos boxes|{0} wants someone else on the pit wall|{0} quiere otro nombre en el muro de boxes
A reunião foi curta.|The meeting was short.|La reunión fue breve.
O telefone, pelo menos, tocou:|At least the phone rang:|Al menos sonó el teléfono:
E o telefone não tocou.|And the phone did not ring.|Y el teléfono no sonó.
Assumir a {0} no lugar do chefe atual.|Take over {0} from its current team principal.|Dirigir {0} en lugar del jefe actual.
Pendurar o fone de ouvido.|Hang up the headset.|Colgar los auriculares.
Você deixou o paddock.|You left the paddock.|Dejaste el paddock.
Fim de carreira.|End of career.|Fin de carrera.
Fim da linha|End of the road|Fin del camino
Você vendeu a {0}.|You sold {0}.|Vendiste {0}.
Você vendeu a {0} para {1} por {2}.|You sold {0} to {1} for {2}.|Vendiste {0} a {1} por {2}.
A {0} fechou as portas.|{0} shut down.|{0} cerró sus puertas.
Voltar ao início|Return home|Volver al inicio
Proposta pelo seu piloto|An offer for your driver|Oferta por tu piloto
A {0} quer {1} para {2}. Ele ainda tem contrato com você até {3} — e quer ir.|{0} wants {1} for {2}. He is still contracted to you until {3} — and wants to leave.|{0} quiere a {1} para {2}. Todavía tiene contrato contigo hasta {3} y quiere irse.
Liberar por {0}|Release for {0}|Liberar por {0}
A multa entra no caixa e a vaga abre.|The buyout goes into the bank and the seat opens up.|La indemnización entra en caja y el asiento queda libre.
Oferecer aumento de 40%|Offer a 40% raise|Ofrecer un aumento del 40%
Pode resolver. Pode só adiar.|It might solve it. It might only postpone it.|Puede resolverlo. Puede solo aplazarlo.
Segurar pelo contrato|Hold him to the contract|Retenerlo por contrato
Ele fica. Contrariado.|He stays. Unhappily.|Se queda. A disgusto.
O que mudou desde a última bandeirada|What changed since the last chequered flag|Qué cambió desde la última bandera a cuadros
Entendido|Understood|Entendido
muito acima do esperado|well above expectations|muy por encima de lo esperado
como o previsto|as expected|según lo previsto
abaixo do esperado|below expectations|por debajo de lo esperado
nasceu com problema|troubled from the start|nació con problemas
segurou melhor do que se temia|held up better than feared|aguantó mejor de lo que se temía
caiu o previsto|declined as expected|cayó lo previsto
caiu mais do que o previsto|declined more than expected|cayó más de lo previsto
desabou|collapsed|se desplomó
Testes de pré-temporada|Pre-season testing|Test de pretemporada
A meta com a diretoria|The board's target|El objetivo con la directiva
Aceitar o {0} lugar|Accept {0} place|Aceptar el {0} puesto
O combinado de sempre.|The usual agreement.|Lo acordado de siempre.
Prometer o {0} lugar|Promise {0} place|Prometer el {0} puesto
Mais 10% de verba agora. No fim do ano, a cobrança pesa mais — para o bem e para o mal.|10% more funding now. At the end of the year, expectations weigh more — for better or worse.|Un 10% más de presupuesto ahora. A final de año, la exigencia será mayor, para bien y para mal.
Pedir paciência: {0} lugar|Ask for patience: {0} place|Pedir paciencia: {0} puesto
Menos 10% de verba e um pouco de confiança a menos agora. Menos risco de demissão.|10% less funding and slightly less confidence now. A lower risk of being fired.|Un 10% menos de presupuesto y algo menos de confianza ahora. Menor riesgo de despido.
Pelos tempos dos testes, o carro está entre o|Based on testing times, the car ranks between|Según los tiempos de los test, el coche está entre el
e o|and|y el
do grid de {0}.|on the {0}-car grid.|de una parrilla de {0} coches.
A diretoria espera o {0} lugar nos construtores.|Management expects {0} place in the constructors' championship.|La directiva espera el {0} puesto en constructores.
Com o regulamento novo, todo mundo ainda está aprendendo.|With the new regulations, everyone is still learning.|Con el reglamento nuevo, todo el mundo sigue aprendiendo.
Para a primeira corrida|On to the first race|A la primera carrera
Mercado de pilotos|Driver market|Mercado de pilotos
Seus pilotos|Your drivers|Tus pilotos
Ninguém sob contrato.|Nobody under contract.|Nadie bajo contrato.
No mercado|On the market|En el mercado
{0} conversa(s) sobrando nesta pré-temporada|{0} negotiation(s) remaining this pre-season|{0} negociación(es) disponible(s) esta pretemporada
recusou renovar|refused to renew|rechazó renovar
Deixar ir|Let go|Dejar ir
Promover a titular|Promote to race driver|Ascender a titular
Passar a reserva|Move to reserve|Pasar a reserva
Fazer nº 1|Make No. 1|Nombrar n.º 1
Fazer reserva|Make reserve driver|Nombrar reserva
Emprestar a outra equipe|Loan to another team|Ceder a otro equipo
Ver trajetória|View career history|Ver trayectoria
Regen|Generated|Generado
Piloto criado pelo jogo|Driver generated by the game|Piloto creado por el juego
Outras categorias|Other series|Otras categorías
A leitura é o que os seus engenheiros acham que ele vale. O interesse depende do tamanho da sua equipe perto do lugar em que ele correria.|The estimate is what your engineers think he is worth. Interest depends on your team's standing compared with his alternatives.|La estimación es lo que tus ingenieros creen que vale. El interés depende del nivel de tu equipo frente a sus alternativas.
Quem está no grid. Tirar alguém de uma equipe maior é caro e quase nunca dá certo.|Drivers already on the grid. Poaching someone from a bigger team is expensive and rarely works.|Quienes están en la parrilla. Fichar a alguien de un equipo mayor sale caro y casi nunca funciona.
Ficaram sem carro. Querem voltar e aceitam quase qualquer proposta.|Left without a seat. They want to return and will accept almost any offer.|Se quedaron sin coche. Quieren volver y aceptan casi cualquier oferta.
A fila da Fórmula 1: os melhores da F2 e da F3. Quem tem até 21 anos pode ir direto para a academia.|The Formula 1 waiting list: the best of F2 and F3. Drivers aged 21 or under can go straight into the academy.|La fila de la Fórmula 1: los mejores de F2 y F3. Quienes tienen hasta 21 años pueden ir directamente a la academia.
Pilotos reais de outras categorias. A nota foi convertida para a escala da Fórmula 1 pela diferença de quem correu nas duas.|Real drivers from other series. Ratings are converted to the Formula 1 scale using drivers who raced in both.|Pilotos reales de otras categorías. La nota se ha convertido a la escala de Fórmula 1 según las diferencias de quienes corrieron en ambas.
Na base quase todo mundo paga para correr. O garoto rápido nem sempre é o que traz dinheiro.|In the junior ranks, almost everyone pays to race. The fast youngster is not always the one bringing money.|En las categorías inferiores casi todos pagan por correr. El joven rápido no siempre es quien trae dinero.
{0} anos · leitura {1}–{2}|Age {0} · estimated rating {1}–{2}|{0} años · estimación {1}–{2}
Na história, corre pela {0} em {1}.|Historically, races for {0} in {1}.|En la historia, corre para {0} en {1}.
Nível {0} na {1}; a leitura já está na escala da Fórmula 1.|Rating {0} in {1}; the estimate is already on the Formula 1 scale.|Nivel {0} en {1}; la estimación ya está en la escala de Fórmula 1.
Dinheiro agora, conta depois|Money now, bills later|Dinero ahora, cuentas después
Você já deve: faltam {0} parcela(s) de {1}. O banco não empresta de novo antes de quitar.|You already owe money: {0} instalment(s) of {1} remain. The bank will not lend again until it is repaid.|Ya tienes deuda: quedan {0} cuota(s) de {1}. El banco no volverá a prestar hasta que la liquides.
Três parcelas anuais, juros de 9% ao ano. A primeira vence no começo da próxima temporada.|Three annual instalments, at 9% interest a year. The first is due at the start of next season.|Tres cuotas anuales, con un interés del 9% anual. La primera vence al comienzo de la próxima temporada.
A diretoria não gosta de dívida.|Management dislikes debt.|A la directiva no le gustan las deudas.
A academia está cheia. Mais investimento abre mais vagas.|The academy is full. More investment opens more places.|La academia está llena. Una mayor inversión abre más plazas.
Leitura na F1|F1 rating estimate|Estimación en F1
Nível na {0}|Rating in {0}|Nivel en {0}
Voltar ao mercado|Back to the market|Volver al mercado
renovação|renewal|renovación
proposta|offer|oferta
Pede:|Asking:|Pide:
Traz:|Brings:|Aporta:
Interesse:|Interest:|Interés:
Reserva e testes|Reserve and testing|Reserva y pruebas
Abaixo|Below asking|Por debajo
O pedido|Asking amount|Lo que pide
Acima|Above asking|Por encima
1 ano|1 year|1 año
2 anos|2 years|2 años
3 anos|3 years|3 años
Igual ao companheiro|Equal to teammate|Igual que el compañero
Piloto nº 1|No. 1 driver|Piloto n.º 1
Ninguém diz sim antes de ouvir a proposta. E um não, às vezes, vira manchete.|Nobody says yes before hearing the offer. And a no sometimes makes headlines.|Nadie dice que sí antes de oír la oferta. Y un no, a veces, se convierte en titular.
Fazer a proposta|Make the offer|Hacer la oferta
{0} aceitou na hora. Contrato até {1}.|{0} accepted immediately. Contract until {1}.|{0} aceptó al instante. Contrato hasta {1}.
{0} aceitou. Contrato até {1}.|{0} accepted. Contract until {1}.|{0} aceptó. Contrato hasta {1}.
O empresário dele respondeu: fecha por {0} por ano. Nem um euro a menos.|His manager replied: {0} a year seals it. Not one euro less.|Su representante respondió: firma por {0} al año. Ni un euro menos.
Não. Nem quis ouvir a segunda parte da proposta.|No. He did not even want to hear the second half of the offer.|No. Ni siquiera quiso escuchar la segunda parte de la oferta.
Agradeceu e disse que vai esperar outras conversas.|He thanked you and said he would wait for other talks.|Dio las gracias y dijo que esperaría otras conversaciones.
Fornecedores de {0}|Suppliers in {0}|Proveedores de {0}
Duração do contrato|Contract length|Duración del contrato
Seu fornecedor atual, até {0}.|Your current supplier, until {0}.|Tu proveedor actual, hasta {0}.
Atende qualquer equipe que pedir.|Supplies any team that asks.|Suministra a cualquier equipo que lo solicite.
Só fornece para equipes maiores que a sua.|Only supplies teams bigger than yours.|Solo suministra a equipos más grandes que el tuyo.
Pode aceitar. Pode preferir outro cliente.|Might agree. Might prefer another customer.|Puede aceptar. Puede preferir otro cliente.
Fornece para quem pagar.|Supplies anyone who pays.|Suministra a quien pague.
Trocar agora custa {0} de rescisão com a {1}.|Switching now costs {0} to terminate the contract with {1}.|Cambiar ahora cuesta {0} por rescindir el contrato con {1}.
Você faz o seu motor. O desenvolvimento dele entra no plano do carro.|You build your own engine. Its development is included in the car plan.|Fabricas tu propio motor. Su desarrollo entra en el plan del coche.
Caro e lento no começo, mas é seu: ninguém te dá a especificação de ontem e ninguém te abandona. Exige fábrica nível 2.|Expensive and slow at first, but it is yours: nobody gives you last year's specification or abandons you. Requires a level 2 factory.|Caro y lento al principio, pero es tuyo: nadie te da una especificación antigua ni te abandona. Requiere una fábrica de nivel 2.
Contrato fechado|Deal done|Contrato cerrado
Não deu|No deal|No pudo ser
muito eficiente|very efficient|muy eficiente
eficiente|efficient|eficiente
mediana|average|media
fraca|weak|débil
hoje {0} · engenharia|currently {0} · engineering|hoy {0} · ingeniería
para o regulamento de {0}|for the {0} regulations|para el reglamento de {0}
Para onde vai o dinheiro da fábrica em {0}|Where factory funding goes in {0}|Adónde va el dinero de la fábrica en {0}
O dinheiro define até onde cada área pode chegar; a engenharia e as instalações decidem quanto disso vira ritmo. Nada chega de uma vez, e quem para de gastar fica para trás devagar.|Money sets each area's potential; engineering and facilities decide how much becomes pace. Nothing arrives all at once, and teams that stop spending gradually fall behind.|El dinero define hasta dónde puede llegar cada área; la ingeniería y las instalaciones deciden cuánto se convierte en ritmo. Nada llega de golpe y quien deja de gastar se queda atrás poco a poco.
Dinheiro no carro do ano que vem sai deste ano — e vale o dobro quando o regulamento mudar.|Money spent on next year's car comes from this year's budget — and is worth twice as much when regulations change.|El dinero del coche del año que viene sale del presupuesto de este año y vale el doble cuando cambia el reglamento.
Total:|Total:|Total:
Teto de gastos de {0}:|{0} cost cap:|Límite presupuestario de {0}:
A sua equipe técnica|Your technical team|Tu equipo técnico
Disponíveis|Available|Disponibles
Renovar por {0}|Renew for {0}|Renovar por {0}
Pede {0} por ano. {1}.|Asks for {0} a year. {1}.|Pide {0} al año. {1}.
{0} começa a trabalhar na segunda-feira.|{0} starts work on Monday.|{0} empieza a trabajar el lunes.
Preferiu ficar onde está. A sua equipe ainda não convence gente desse nível — ou o dinheiro não convenceu.|Chose to stay put. Your team does not yet convince people of that calibre — or the money did not.|Prefirió quedarse donde está. Tu equipo todavía no convence a gente de ese nivel, o no convenció el dinero.
Não existe antes de {0}.|Not available before {0}.|No existe antes de {0}.
No máximo.|At maximum level.|Al máximo.
Construir nível {0} · {1} · pronto em {2}|Build level {0} · {1} · ready in {2}|Construir nivel {0} · {1} · listo en {2}
Manutenção de {0} por ano|Maintenance: {0} a year|Mantenimiento de {0} al año
Obra leva um ano. O que você constrói agora aparece no carro do ano que vem — e a conta de manutenção sobe para sempre.|Construction takes a year. What you build now helps next year's car — and permanently increases maintenance costs.|Las obras duran un año. Lo que construyes ahora aparece en el coche del año que viene y aumenta el mantenimiento para siempre.
patrocinador principal|title sponsor|patrocinador principal
secundário|secondary|secundario
Principal {0}/{1} · secundários {2}/{3}|Title {0}/{1} · secondary {2}/{3}|Principal {0}/{1} · secundarios {2}/{3}
Meta: {0} (bônus de {1})|Target: {0} (bonus of {1})|Objetivo: {0} (bonificación de {1})
Até 1968 o regulamento não deixa pintar o carro com marca. Só fornecedores de combustível, pneu e peças pagam alguma coisa.|Until 1968, the rules prohibit brand names on the car. Only fuel, tyre and parts suppliers pay anything.|Hasta 1968 el reglamento no permite pintar marcas en el coche. Solo pagan algo los proveedores de combustible, neumáticos y piezas.
Nenhum.|None.|Ninguno.
Ninguém bateu na porta.|Nobody came knocking.|Nadie llamó a la puerta.
Último ano: {0} na {1}|Last year: {0} in {1}|Último año: {0} en {1}
Ainda sem resultado pela academia|No academy results yet|Todavía sin resultados en la academia
emprestado em {0}|on loan in {0}|cedido en {0}
Os olheiros acham que ele pode chegar a|Scouts think he could reach|Los ojeadores creen que puede llegar a
. Custa {0} por ano.|. Costs {0} a year.|. Cuesta {0} al año.
Básico|Basic|Básico
Forte|Strong|Fuerte
Referência|Benchmark|Referencia
Na academia|In the academy|En la academia
Observados pelos olheiros|Being scouted|Observados por ojeadores
Trazer para a academia|Bring into the academy|Incorporar a la academia
Mais investimento abre vagas (3, 4, 6 ou 8 garotos), faz os garotos evoluírem mais rápido e deixa os olheiros mais certeiros.|More investment opens places (3, 4, 6 or 8 young drivers), speeds up development and improves scouting accuracy.|Una mayor inversión abre plazas (3, 4, 6 u 8 jóvenes), acelera su evolución y mejora la precisión de los ojeadores.
Os melhores da F2 e da F3 com até 21 anos também podem vir direto do mercado de pilotos.|The best F2 and F3 drivers aged 21 or under can also join directly from the driver market.|Los mejores de F2 y F3 de hasta 21 años también pueden llegar directamente desde el mercado de pilotos.
{0} é emprestado para correr na Fórmula 1 por outra equipe.|{0} is loaned to another team to race in Formula 1.|{0} es cedido a otro equipo para correr en Fórmula 1.
{0} sobe da academia para um carro titular.|{0} moves up from the academy to a race seat.|{0} asciende de la academia a un asiento titular.
{0} sobe da academia para o posto de reserva.|{0} moves up from the academy to the reserve role.|{0} asciende de la academia al puesto de reserva.
Carro novo, grid mais forte, orçamento maior. Os pilotos também pagam mais para correr lá.|A new car, a stronger grid, a larger budget. Drivers also pay more to race there.|Coche nuevo, parrilla más fuerte, presupuesto mayor. Los pilotos también pagan más por correr allí.
A federação já respondeu nesta pré-temporada.|The federation has already answered this pre-season.|La federación ya ha respondido esta pretemporada.
Para subir é preciso terminar entre os três primeiros ou ter reputação {0}. Hoje: {1}.|To move up, finish in the top three or reach reputation {0}. Currently: {1}.|Para subir necesitas acabar entre los tres primeros o tener reputación {0}. Actual: {1}.
Você perde a maioria e passa a responder a um conselho.|You lose majority ownership and must answer to a board.|Pierdes la mayoría y pasas a responder ante un consejo.
Paga a inscrição e põe mais {0} no caixa, em troca de {1}% da equipe.|Pays the entry fee and adds {0} in cash, in exchange for {1}% of the team.|Paga la inscripción y aporta {0} a la caja a cambio del {1}% del equipo.
Subir com esse dinheiro|Move up with this funding|Subir con este dinero
Subir com o próprio caixa|Move up using your own cash|Subir con tu propia caja
Não foi desta vez|Not this time|Esta vez no pudo ser
Entra com {0} em troca de {1}% da equipe.|Invests {0} in exchange for {1}% of the team.|Aporta {0} a cambio del {1}% del equipo.
Negócio fechado|Deal done|Trato cerrado
A sua parte vale {0}|Your stake is worth {0}|Tu parte vale {0}
Vender encerra a sua carreira de chefe. A equipe continua existindo, com outro nome no muro dos boxes.|Selling ends your career as team principal. The team carries on with someone else's name on the pit wall.|Vender termina tu carrera como jefe. El equipo sigue existiendo con otro nombre en el muro de boxes.
um comprador|a buyer|un comprador
Sem trajetória registrada nesta carreira.|No career history recorded in this save.|Sin trayectoria registrada en esta carrera.
CARRO|CAR|COCHE
do seu bolso|out of your pocket|de tu bolsillo
— fora do orçamento|— over budget|— fuera de presupuesto
aqui a equipe paga você|here, the team pays you|aquí el equipo te paga a ti
Voltar às propostas|Back to the offers|Volver a las ofertas
Vamos correr →|Let's race →|Vamos a correr →
Pos|Pos|Pos
Pód|Pod|Pod
Pole|Pole|Pole
Grid|Grid|Parrilla
Evolução do piloto — {0} → {1} anos|Driver development — age {0} → {1}|Evolución del piloto — {0} → {1} años
Fim do vínculo com a academia|End of academy membership|Fin del vínculo con la academia
Cobrança da academia|Academy performance warning|Advertencia de la academia
Ver o mercado de {0} →|View the {0} market →|Ver el mercado de {0} →
CONTRATO ENCERRADO|CONTRACT ENDED|CONTRATO TERMINADO
Patrocinadores — {0} de 3|Sponsors — {0} of 3|Patrocinadores — {0} de 3
{0} / ano|{0} / year|{0} / año
Contrato de {0} ano.|{0}-year contract.|Contrato de {0} año.
Contrato de {0} anos.|{0}-year contract.|Contrato de {0} años.
Aplicar {0}|Invest {0}|Invertir {0}
Já contratado nesta temporada.|Already signed this season.|Ya contratado esta temporada.
O que estava na mesa|What was on the table|Lo que había sobre la mesa
Onde dá para correr com o que você tem|Where you can race with what you have|Dónde puedes correr con lo que tienes
Nenhuma categoria cabe no seu orçamento.|No series fits your budget.|Ninguna categoría cabe en tu presupuesto.
com você desde {0} · fica com {1}%|with you since {0} · takes {1}%|contigo desde {0} · se queda con el {1}%
Você escolheu: {0}|You chose: {0}|Elegiste: {0}
Focar na temporada|Focus on the season|Centrarse en la temporada
Voltar para a temporada|Back to the season|Volver a la temporada
Onde você vai correr|Where you will race|Dónde vas a correr
VENCEU|WON|GANÓ
CAMPEÃO|CHAMPION|CAMPEÓN
FORA|OUT|FUERA
Quem está na briga|Who is still in contention|Quién sigue en la lucha
Campeão da temporada|Season champion|Campeón de la temporada
Como ele escreve sobre você|How he writes about you|Cómo escribe sobre ti
Ele lembra|He remembers|Lo recuerda
Agora não há o que falar|There is nothing to discuss right now|Ahora no hay nada de qué hablar
Ninguém ainda. O paddock se povoa correndo.|Nobody yet. Keep racing and the paddock will fill up.|Nadie todavía. El paddock se va llenando a medida que corres.
Voltar para o paddock|Back to the paddock|Volver al paddock
Já no macacão|Already on your overalls|Ya en el mono
Seguir para a temporada →|Continue to the season →|Continuar a la temporada →
Sua galeria|Your trophy gallery|Tu galería
Antes disso, nas categorias de acesso|Before that, in the junior ranks|Antes, en las categorías de acceso
Entre os maiores da {0}|Among the greatest in {0}|Entre los grandes de {0}
ninguém à sua frente.|nobody ahead of you.|nadie por delante de ti.
Sua carreira entrou na galeria de lendas. O arquivo de temporadas continua disponível nesta página até você começar outra.|Your career has entered the legends gallery. The season archive remains available here until you start a new career.|Tu carrera ha entrado en la galería de leyendas. El archivo de temporadas seguirá disponible aquí hasta que empieces otra.
Os maiores da história|The greatest of all time|Los más grandes de la historia
Corrida a corrida|Race by race|Carrera a carrera
Classificação final do campeonato|Final championship standings|Clasificación final del campeonato
← Todas as temporadas|← All seasons|← Todas las temporadas
Aproveitamento de vitórias|Win percentage|Porcentaje de victorias
Escada em {0}:|Career ladder in {0}:|Escalera en {0}:
Pontuação:|Scoring:|Puntuación:
Épocas:|Eras:|Épocas:
Criar piloto →|Create driver →|Crear piloto →
não existia|did not exist|no existía
pendente: sem fonte|pending: no source|pendiente: sin fuente
pendente: tabela ilegível|pending: unreadable table|pendiente: tabla ilegible
só a classificação · {0}|standings only · {0}|solo la clasificación · {0}
grid real · {0} pilotos|real grid · {0} drivers|parrilla real · {0} pilotos
O banco de campeonatos ainda está carregando. Tente de novo em um instante.|The championship database is still loading. Try again in a moment.|La base de campeonatos todavía está cargando. Vuelve a intentarlo en un momento.
Campeonatos reais|Real championships|Campeonatos reales
{0} campeonatos de 1950 a hoje, com a fonte de cada temporada|{0} championships from 1950 to today, with a source for every season|{0} campeonatos desde 1950 hasta hoy, con la fuente de cada temporada
Região|Region|Región
Todas|All|Todas
Todos|All|Todos
Buscar|Search|Buscar
Ex.: Fórmula 3, GP2, Macau|E.g. Formula 3, GP2, Macau|Ej.: Fórmula 3, GP2, Macao
Todos os níveis|All levels|Todos los niveles
Tipo e situação|Type and status|Tipo y situación
Todos os tipos|All types|Todos los tipos
Existiam no ano|Existed that year|Existían ese año
Extintos hoje|No longer active|Extintos hoy
Dados: Wikipedia em inglês (CC BY-SA 4.0). Uma fonte só: nada aqui é dado como verificado.|Data: English Wikipedia (CC BY-SA 4.0). A single source: nothing here is presented as verified.|Datos: Wikipedia en inglés (CC BY-SA 4.0). Una sola fuente: nada se presenta aquí como verificado.
Prestígio estimado pelo nível|Prestige estimated from level|Prestigio estimado por nivel
Campeão em {0}:|Champion in {0}:|Campeón en {0}:
Nenhum campeonato com esses filtros.|No championships match these filters.|Ningún campeonato coincide con estos filtros.
{0} campeonato|{0} championship|{0} campeonato
{0} campeonatos|{0} championships|{0} campeonatos
{0} com grid real de {1}|{0} with real {1} grids|{0} con parrilla real de {1}
verde: grid lido|green: entry list read|verde: parrilla leída
amarelo: só a classificação|yellow: standings only|amarillo: solo clasificación
cinza: pendente|grey: pending|gris: pendiente
Na sua carreira, este é o campeonato do degrau|In your career, this is the championship for the level|En tu carrera, este es el campeonato del escalón
Voltar ao de sempre|Restore the default|Volver al habitual
Campeonato só para mulheres.|Women-only championship.|Campeonato solo para mujeres.
Este campeonato fica fora da sua escada atual. Ele pode te chamar: os convites chegam no fim de cada temporada, conforme o seu desempenho.|This championship is outside your current career ladder. It may invite you: invitations arrive at the end of each season, based on your performance.|Este campeonato está fuera de tu escalera actual. Puede invitarte: las invitaciones llegan al final de cada temporada, según tu rendimiento.
É o campeonato do degrau|This is the championship for the level|Es el campeonato del escalón
na sua carreira.|in your career.|en tu carrera.
Você ainda não tem idade para este campeonato (mínimo de {0} anos).|You are not old enough for this championship yet (minimum age: {0}).|Todavía no tienes edad para este campeonato (mínimo de {0} años).
Correr este campeonato no lugar de|Race in this championship instead of|Correr este campeonato en lugar de
? Vale da temporada {0} em diante, sempre que você estiver nesse degrau.|? Applies from the {0} season onwards whenever you are at this level.|? Se aplica desde la temporada {0}, siempre que estés en ese escalón.
? Vale da temporada {0} em diante, sempre que você estiver nesse degrau, com o grid real de cada ano.|? Applies from the {0} season onwards whenever you are at this level, with each year's real grid.|? Se aplica desde la temporada {0}, siempre que estés en ese escalón, con la parrilla real de cada año.
Correr este campeonato|Race in this championship|Correr este campeonato
A partir de {0}, esse degrau é {1}.|From {0}, this level becomes {1}.|A partir de {0}, este escalón será {1}.
O degrau volta ao campeonato de sempre.|This level returns to its default championship.|El escalón vuelve al campeonato habitual.
Não há página desta temporada na fonte usada (Wikipedia em inglês).|The source used (English Wikipedia) has no page for this season.|No hay página de esta temporada en la fuente utilizada (Wikipedia en inglés).
Pendente:|Pending:|Pendiente:
no jogo, este grid é simulado.|in the game, this grid is simulated.|en el juego, esta parrilla se simula.
A página|The page|La página
existe, mas nenhuma tabela foi lida.|exists, but no table was read.|existe, pero no se ha leído ninguna tabla.
só tem a classificação final: quem não pontuou pode faltar.|only contains the final standings: drivers who did not score may be missing.|solo contiene la clasificación final: pueden faltar quienes no puntuaron.
Parcial|Partial|Parcial
, e de uma fonte só.|, from a single source.|, y de una sola fuente.
Lista de inscritos lida de|Entry list read from|Lista de inscritos leída de
. É uma fonte só: o dado ainda não foi conferido com uma segunda.|. This is a single source: the data has not yet been checked against a second.|. Es una sola fuente: los datos aún no se han contrastado con otra.
no jogo: {0}|in the game: {0}|en el juego: {0}
Sem lista de pilotos para esta temporada.|No driver list for this season.|Sin lista de pilotos para esta temporada.
Calendário não lido.|Calendar not read.|Calendario no leído.
← Todos os campeonatos|← All championships|← Todos los campeonatos
em atividade|active|en activo
sucedido por|succeeded by|sucedido por
extinto|discontinued|extinto
prestígio estimado {0}|estimated prestige {0}|prestigio estimado {0}
Temporada anterior|Previous season|Temporada anterior
Próxima temporada|Next season|Próxima temporada
classificação final|final standings|clasificación final
na ordem da classificação final|in final standings order|en orden de clasificación final
Campeão de {0}|{0} champion|Campeón de {0}
sem registro na fonte|not recorded in the source|sin registro en la fuente
{0} etapas|{0} rounds|{0} etapas
Campeões|Champions|Campeones
Nenhum lido.|None read.|Ninguno leído.
Dados: Wikipedia em inglês (CC BY-SA 4.0).|Data: English Wikipedia (CC BY-SA 4.0).|Datos: Wikipedia en inglés (CC BY-SA 4.0).
7 carreiras|7 career paths|7 carreras
{0} campeonatos reais|{0} real championships|{0} campeonatos reales
Temporada|Season|Temporada
Improvável|Unlikely|Improbable
Difícil|Difficult|Difícil
Sem vaga desde {0}|Without a seat since {0}|Sin asiento desde {0}
Carro do ano que vem|Next year's car|Coche del año que viene
Pista de testes|Test track|Pista de pruebas
Kart e categorias de base|Karting and junior series|Kart y categorías inferiores
· Os olheiros acham que ele pode chegar a|· Scouts think he could reach|· Los ojeadores creen que puede llegar a
Montadora asiática|Asian car manufacturer|Fabricante de automóviles asiático
Fundo soberano do Golfo|Gulf sovereign wealth fund|Fondo soberano del Golfo
Grupo de investimento americano|American investment group|Grupo inversor estadounidense
Não|No|No
Status|Status|Estado
América do Norte|North America|América del Norte
América do Sul|South America|América del Sur
Mundo|World|Mundo
Oceania|Oceania|Oceanía
Oriente Médio|Middle East|Oriente Medio
Ásia|Asia|Asia
África|Africa|África
Topo mundial|World top level|Élite mundial
F2 e topo nacional|F2 and national top level|F2 y élite nacional
Entrada|Entry level|Iniciación
Regional|Regional|Regional
Monopostos|Single-seaters|Monoplazas
Turismo|Touring cars|Turismos
Pos.|Pos.|Pos.
Fórmula Ford Britânica|British Formula Ford|Fórmula Ford Británica
(revisão {0}). É uma fonte só: o dado ainda não foi conferido com uma segunda.|(revision {0}). This is a single source: the data has not yet been checked against a second.|(revisión {0}). Es una sola fuente: los datos aún no se han contrastado con otra.
Ótimo se chover, ruim se não chover.|Great if it rains, poor if it stays dry.|Muy bueno si llueve, malo si no llueve.
Consist.|Consist.|Consist.
{0} vira {1}|{0} becomes {1}|{0} da paso a {1}
{0}–hoje|{0}–present|{0}–hoy
Trocar de país e de categoria. Custa uma fração do que a escada europeia pede — e daqui também se constrói uma carreira.|Change country and series. It costs a fraction of the European ladder — and you can build a career here too.|Cambiar de país y de categoría. Cuesta una fracción de lo que exige la escalera europea y aquí también se construye una carrera.
{0} · descarta o pior resultado|{0} · worst result dropped|{0} · se descarta el peor resultado
Fórmula Regional da Oceania / Toyota Racing Series|Formula Regional Oceania / Toyota Racing Series|Fórmula Regional de Oceanía / Toyota Racing Series
Fórmula Regional das Américas|Formula Regional Americas|Fórmula Regional de las Américas
Fórmula Regional Europeia|Formula Regional European|Fórmula Regional Europea
Fórmula Regional Japonesa|Formula Regional Japanese|Fórmula Regional Japonesa
Fórmula Regional do Oriente Médio|Formula Regional Middle East|Fórmula Regional de Oriente Medio
Fórmula Regional Indiana|Formula Regional Indian|Fórmula Regional India
Campeonato Brasileiro de Kart|Brazilian Karting Championship|Campeonato Brasileño de Kart
Campeonato Mundial de Kart FIA|FIA Karting World Championship|Campeonato Mundial de Kart FIA
Campeonato Europeu de Kart FIA|FIA Karting European Championship|Campeonato Europeo de Kart FIA
Copa Brasil de Kart|Brazil Karting Cup|Copa Brasil de Kart
`.trim().split('\n').map(function (line) { return line.split('|'); });
  for (const [lang, column] of [['en', 1], ['es', 2]]) {
    const pairs = window.VDO_LOCALES[lang].pairs;
    const present = new Set(pairs.map(function (pair) { return pair[0].replace(/\s+/g, ' ').trim(); }));
    for (const row of rows) {
      if (!present.has(row[0])) {
        pairs.push([row[0], row[column]]);
        present.add(row[0]);
      }
    }
  }
})();
