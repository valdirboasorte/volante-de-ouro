/* Frases compartilhadas pelos dois catálogos: português | inglês | espanhol.
   Os marcadores representam valores do jogo; nomes próprios são preservados. */
(function(){
  const rows = `
Idioma|Language|Idioma
GP {gp}|GP {gp}|GP {gp}
{0} a {1}|{0} to {1}|{0} a {1}
Argentino de Kart|Argentine Karting Championship|Campeonato Argentino de Karting
1.500 cv na classificação, fumaça branca e três nomes decidindo tudo: Prost, Senna, Piquet.|1,500 horsepower in qualifying, white smoke and three names deciding everything: Prost, Senna, Piquet.|1.500 CV en clasificación, humo blanco y tres nombres que lo deciden todo: Prost, Senna, Piquet.
ainda está formando opinião|is still forming an opinion|todavía se está formando una opinión
{0}% do que você ganha|{0}% of your earnings|{0}% de tus ingresos
Você ganhou posições em quase toda corrida. O seu domingo vale mais que o seu sábado.|You gained places in almost every race. Your Sundays are worth more than your Saturdays.|Ganaste posiciones en casi todas las carreras. Tu domingo vale más que tu sábado.
O seu companheiro levou a melhor em {0} dos {1} domingos, e isso pesa mais do que qualquer coisa.|Your teammate beat you on {0} of {1} Sundays, and that matters more than anything.|Tu compañero te superó en {0} de los {1} domingos y eso pesa más que cualquier otra cosa.
Você ainda está aprendendo esta categoria — e isso apareceu em quase todo fim de semana.|You are still learning this series, and it showed almost every weekend.|Todavía estás aprendiendo esta categoría y se notó casi todos los fines de semana.
Avaliação da equipe|Team review|Evaluación del equipo
A equipe esperava mais. Você entra no próximo ano sob pressão.|The team expected more. You start next year under pressure.|El equipo esperaba más. Empiezas el próximo año bajo presión.
Descer para {cat}|Move down to {cat}|Bajar a {cat}
Continuar na {cat}|Stay in {cat}|Seguir en {cat}
Nenhuma equipe da {cat} te quer. Descer uma categoria, ganhar e voltar pela porta da frente.|No {cat} team wants you. Move down a level, win, and earn your way back.|Ningún equipo de {cat} te quiere. Baja una categoría, gana y vuelve por la puerta grande.
Outro campeonato do mesmo nível: a {0} quer você no {1} ({2}). A carreira passa a seguir a escada de {3}. Grid real daquele ano.|Another championship at the same level: {0} wants you in {1} ({2}). Your career switches to the {3} ladder, with that year's real grid.|Otro campeonato del mismo nivel: {0} te quiere en {1} ({2}). Tu carrera pasa a seguir la escalera de {3}, con la parrilla real de ese año.
diz seu empresário|says your manager|dice tu representante
Nem considerou: você está bem abaixo do que eles procuram.|Never considered it: you are far below their requirements.|Ni lo consideraron: estás muy por debajo de lo que buscan.
Gosta do seu trabalho, mas quer mais resultado — ou mais nome — antes.|Likes your work, but wants more results or a bigger reputation first.|Le gusta tu trabajo, pero primero quiere más resultados o más fama.
Melhor temporada|Best season|Mejor temporada
{0} — de {1} até hoje|{0} — from {1} to today|{0} — desde {1} hasta hoy
{0} de {1} titulares|{0} of {1} race drivers|{0} de {1} titulares
sem reserva|no reserve driver|sin reserva
{0} ano|{0} year|{0} año
{0} conversa(s) sobrando nesta pré-temporada|{0} conversation(s) left this pre-season|{0} conversación(es) disponibles esta pretemporada
{0} de {1} vagas|{0} of {1} places|{0} de {1} plazas
IndyCar 50-40-35-32-30… até o último + 1 pela pole (Indianápolis vale em dobro)|IndyCar 50-40-35-32-30… down to last place + 1 for pole (double points at Indianapolis)|IndyCar 50-40-35-32-30… hasta el último + 1 por la pole (Indianápolis vale doble)
25-18-15-12-10… + 1 pela pole (Le Mans vale em dobro)|25-18-15-12-10… + 1 for pole (double points at Le Mans)|25-18-15-12-10… + 1 por la pole (Le Mans vale doble)
O calendário da Fórmula 1 é o calendário real de cada ano, prova por prova, de 1950 em diante. Nas outras três, os circuitos, o número de etapas e o regulamento são os da época — o sorteio de cada temporada é fixo, então 1987 é sempre 1987.|Formula 1 uses the real calendar for each year from 1950 onwards. The other series use circuits, season lengths and rules suited to the era. Each year's schedule is fixed, so 1987 is always 1987.|La Fórmula 1 usa el calendario real de cada año desde 1950. Las otras categorías usan circuitos, número de pruebas y reglamento de su época. Cada calendario anual es fijo, así que 1987 siempre es 1987.
7 carreiras|7 career paths|7 trayectorias
{0} campeonatos reais|{0} real championships|{0} campeonatos reales
País desconhecido|Unknown country|País desconocido
Volante de Ouro, início|Volante de Ouro, home|Volante de Ouro, inicio
Bem-vindo ao paddock|Welcome to the paddock|Bienvenido al paddock
Vamos correr|Let's race|Vamos a correr
Entendi|Got it|Entendido
Consist.|Consist.|Constancia
Escolha um sobrenome (mínimo 2 letras).|Choose a surname (at least 2 letters).|Elige un apellido (mínimo 2 letras).
O número precisa ser entre 1 e 99.|Your number must be between 1 and 99.|El número debe estar entre 1 y 99.
Escolha uma nacionalidade da lista.|Choose a nationality from the list.|Elige una nacionalidad de la lista.
Suba de categoria terminando entre os primeiros. Cada corrida entra no seu retrospecto — e ele fica guardado para sempre no arquivo da carreira.|Finish near the front to move up the ranks. Every race goes into your record, which stays in your career archive.|Termina entre los primeros para ascender. Cada carrera entra en tu historial y queda guardada en el archivo de tu trayectoria.
Você começa na {0} em {1}, mirando a {2}.|You start in {0} in {1}, aiming for {2}.|Empiezas en {0} en {1}, con la vista puesta en {2}.
, {0} anos, {1}. Você começa na {2} em {3}, mirando a {4}. {5}|, age {0}, {1}. You start in {2} in {3}, aiming for {4}. {5}|, {0} años, {1}. Empiezas en {2} en {3}, con la vista puesta en {4}. {5}
Um resumo rápido antes de entrar no carro.|A quick guide before getting in the car.|Un resumen rápido antes de subir al coche.
A carreira.|The career.|La carrera.
Academias.|Academies.|Academias.
O retrospecto.|Your race record.|El historial.
As sete carreiras.|The seven career paths.|Las siete trayectorias.
O calendário.|The calendar.|El calendario.
O grid.|The grid.|La parrilla.
Você escolhe quando começar.|You choose when to start.|Tú eliges cuándo empezar.
Modo Cenário.|Scenario mode.|Modo escenario.
As décadas.|The decades.|Las décadas.
A vaga não é sua para sempre.|Your seat is never guaranteed.|Tu asiento no está garantizado para siempre.
Os atributos.|Your attributes.|Los atributos.
O carro.|The car.|El coche.
O mercado não vira de cabeça para baixo todo ano.|The market does not turn upside down every year.|El mercado no cambia por completo cada año.
Cada piloto continua onde estava; por temporada mudam de casa umas quatro a sete pessoas. E as transferências que aconteceram de verdade acontecem no ano certo: Senna vai para a Williams em 1994, Schumacher para a Ferrari em 1996, Hamilton para a Ferrari em 2025.|Most drivers stay with their teams; around four to seven move each season. Historical transfers happen in the right year: Senna to Williams in 1994, Schumacher to Ferrari in 1996 and Hamilton to Ferrari in 2025.|La mayoría de los pilotos se queda en su equipo; entre cuatro y siete cambian cada temporada. Los fichajes históricos ocurren en su año: Senna a Williams en 1994, Schumacher a Ferrari en 1996 y Hamilton a Ferrari en 2025.
Toda corrida entra na tabela da temporada: classificação, chegada, clima, pontos e o confronto direto com seu companheiro de equipe. Toque em qualquer linha para rever a prova. Quando o ano acaba, a temporada inteira vai para o arquivo e nunca se perde.|Every race is recorded in the season table: qualifying, finish, weather, points and your head-to-head against your teammate. Select a row to review it. At the end of the year, the entire season goes into the archive.|Cada carrera queda en la tabla de la temporada: clasificación, llegada, clima, puntos y duelo con tu compañero. Selecciona una fila para revisarla. Al terminar el año, la temporada completa pasa al archivo.
Nas categorias de base o material é parecido e o talento aparece. Na Fórmula 1, um carro ruim segura qualquer um — por isso a escolha da equipe no fim de cada ano é a decisão mais importante da carreira.|In junior series, the equipment is similar and talent shows. In Formula 1, a poor car holds anyone back, making your team choice at the end of each year your most important career decision.|En las categorías inferiores el material es parecido y el talento destaca. En Fórmula 1, un mal coche frena a cualquiera: elegir equipo al final del año es la decisión más importante de tu carrera.
Ritmo manda na classificação; ultrapassagem e consistência mandam na corrida; chuva vira tudo do avesso; desenvolvimento faz seu carro melhorar ao longo do ano. Eles crescem enquanto você é jovem e caem depois dos trinta e poucos.|Pace matters in qualifying; overtaking and consistency matter in races; wet weather changes everything; development improves your car over the year. Attributes grow while you are young and decline after your early thirties.|El ritmo manda en clasificación; adelantamiento y constancia mandan en carrera; la lluvia lo cambia todo; el desarrollo mejora el coche durante el año. Los atributos crecen mientras eres joven y bajan después de los treinta y pocos.
No fim de cada ano a equipe compara o que você entregou com o que aquele carro deveria render — e com o seu companheiro, que é a única régua justa. Um ano ruim é advertência. Dois seguidos, ou um desastre completo, e o contrato acaba. Nos casos mais graves, você perde o carro antes mesmo de a temporada terminar.|At the end of each year, the team compares your results with the car's potential and your teammate. One poor year brings a warning. Two in a row, or a disastrous season, can end your contract. In serious cases you can lose your seat before the season ends.|Al final de cada año, el equipo compara tus resultados con el potencial del coche y con tu compañero. Un mal año supone una advertencia. Dos seguidos, o un desastre completo, pueden acabar con el contrato. En casos graves pierdes el asiento antes de terminar la temporada.
Assuma um piloto real num ponto exato da história — Massa em 2008, Hamilton em 2021, Senna a partir de 1994 — ou pegue qualquer piloto de qualquer grid desde 1950 e conduza a carreira do seu jeito.|Take over a real driver at a precise moment in history: Massa in 2008, Hamilton in 2021 or Senna from 1994. Or choose any driver from any grid since 1950 and shape their career your way.|Toma el control de un piloto real en un momento de la historia: Massa en 2008, Hamilton en 2021 o Senna desde 1994. También puedes elegir cualquier piloto de cualquier parrilla desde 1950 y dirigir su carrera a tu manera.
Cada época tem suas equipes, seus rivais, sua pontuação e sua confiabilidade. Nos anos 50, metade do grid abandona e o risco é real; nos anos 2020, quase todo mundo termina e o carro decide quase tudo. Se sua carreira atravessar uma virada de década, o mundo muda ao seu redor.|Each era has its own teams, rivals, scoring and reliability. In the 1950s, half the grid retires and the danger is real; in the 2020s, almost everyone finishes and the car decides almost everything. As your career crosses decades, the world changes around you.|Cada época tiene sus equipos, rivales, puntuación y fiabilidad. En los años 50, la mitad abandona y el peligro es real; en los años 2020, casi todos terminan y el coche decide casi todo. Al cambiar de década, el mundo cambia a tu alrededor.
O ano exato dentro da década e a idade de estreia, de 8 a 30 anos: quem começa criança fica no kart até ter idade para um carro. Começar cedo dá muitos anos de base; começar tarde te coloca direto numa categoria alta, com menos tempo para provar seu valor. E o fim não tem idade fixa: há quem apague antes dos 35 e quem ainda corra depois dos 50.|Choose the exact year and a starting age from 8 to 30. Children stay in karting until they are old enough for cars. Starting early gives you more development time; starting late puts you straight into a higher series with less time to prove yourself. Retirement has no fixed age: some fade before 35 and others race beyond 50.|Elige el año exacto y una edad de debut de 8 a 30 años. Los niños siguen en karting hasta tener edad para los coches. Empezar pronto da más años de formación; empezar tarde te sitúa en una categoría alta, con menos tiempo para demostrar tu valor. No hay edad fija de retirada: algunos decaen antes de los 35 y otros corren después de los 50.
O tamanho do pelotão e o número de carros por equipe seguem a época: 29 carros e escuderias com três monopostos nos anos 50, 20 carros e dois por equipe hoje. E só entram os pilotos que realmente corriam naquele ano — Schumacher não divide a pista com Antonelli.|Grid size and cars per team follow the era: 29 cars and three-car teams in the 1950s, 20 cars and two per team today. Only drivers who raced in that year take part: Schumacher does not share the track with Antonelli.|El tamaño de la parrilla y los coches por equipo siguen la época: 29 coches y equipos con tres monoplazas en los años 50, 20 coches y dos por equipo hoy. Solo participan pilotos que corrían ese año: Schumacher no comparte pista con Antonelli.
Na Fórmula 1 é o calendário real de cada ano, prova por prova: 1950 tem sete etapas e termina em Monza; 2024 tem vinte e quatro e começa no Bahrein. Nas outras seis, os circuitos, o número de etapas e o regulamento são os da época, e o calendário de cada ano é sempre o mesmo.|Formula 1 uses each year's real calendar, race by race: seven rounds ending at Monza in 1950; twenty-four starting in Bahrain in 2024. The other six series use circuits, season lengths and rules suited to their era, with a consistent calendar for each year.|La Fórmula 1 usa el calendario real de cada año: siete pruebas acabando en Monza en 1950; veinticuatro empezando en Baréin en 2024. Las otras seis categorías usan circuitos, número de pruebas y reglamento de su época, con un calendario fijo para cada año.
A escada é longa e depende de onde você nasceu. Um brasileiro em 2024 sobe pelo Kart Regional, pelo Brasileiro de Kart, pelo Mundial de Kart, pela Fórmula 4 Brasil (que existe desde 2022), pela Fórmula Regional, F3 e F2 até chegar à Fórmula 1. Um italiano faz o mesmo caminho pelo Italiano de Kart e pela F4 Italiana; quem não tem campeonato nacional próprio pega o equivalente internacional.|The ladder is long and depends on your home country. A Brazilian starting in 2024 goes through regional, Brazilian and world karting, Brazilian Formula 4 (available from 2022), Formula Regional, F3 and F2 before Formula 1. An Italian follows Italian karting and Italian F4; countries without a national championship use an international equivalent.|La escalera es larga y depende de tu país. Un brasileño en 2024 pasa por karting regional, brasileño y mundial, Fórmula 4 Brasil (desde 2022), Fórmula Regional, F3 y F2 antes de Fórmula 1. Un italiano pasa por el karting italiano y la F4 italiana; donde no hay campeonato nacional se usa un equivalente internacional.
Uma boa temporada de base chama a atenção de um programa de formação — Red Bull Junior, Ferrari Driver Academy, Mercedes Junior, Programa Petrobras, Road to Indy. Entrar acelera sua evolução, pesa no mercado e abre a porta da equipe-mãe. Convites podem aparecer em diferentes categorias da base, conforme seus resultados, seu nível e seu potencial, com programas diferentes e sem garantia. Trocar de equipe não rompe o vínculo, mas a academia pode dispensar quem não corresponde. Anos ruins seguidos aumentam o risco; potencial e adaptação contam para receber outra chance. Ao estrear na Fórmula 1 ou em outra categoria principal, a formação é concluída sem penalidade.|A strong junior season can attract a development programme such as Red Bull Junior, Ferrari Driver Academy, Mercedes Junior, Programa Petrobras or Road to Indy. Joining boosts your development and market prospects and opens a path to the parent team. Offers can arrive at different junior levels, based on results, ability and potential, without any guaranteed programme. Changing teams keeps your membership, but poor performance can lead to release. Consecutive poor years increase that risk; potential and adaptation can earn another chance. Reaching Formula 1 or another top series completes your training without a penalty.|Una buena temporada puede atraer a un programa como Red Bull Junior, Ferrari Driver Academy, Mercedes Junior, Programa Petrobras o Road to Indy. Entrar acelera tu evolución y mejora tus oportunidades. Los programas pueden invitarte en distintas categorías según tus resultados, nivel y potencial, sin garantías. Cambiar de equipo conserva el vínculo, pero el mal rendimiento puede causar tu baja. Varios años malos aumentan el riesgo; el potencial y la adaptación pueden darte otra oportunidad. Al llegar a Fórmula 1 u otra categoría principal completas la formación sin penalización.
Anos {0}|{0}s|Años {0}
A Era Heroica|The Heroic Era|La era heroica
Motor Traseiro|Rear Engines|Motor trasero
Asas e Efeito Solo|Wings and Ground Effect|Alas y efecto suelo
Era Turbo|Turbo Era|Era turbo
Eletrônica e Rivalidade|Electronics and Rivalry|Electrónica y rivalidad
Domínio e Reação|Dominance and Response|Dominio y reacción
Híbridos e Dinastias|Hybrids and Dynasties|Híbridos y dinastías
Efeito Solo de Volta|Ground Effect Returns|El regreso del efecto suelo
Motor na frente, capacete de couro e nenhuma proteção. Metade do grid não vê a bandeirada.|Front engines, leather helmets and no protection. Half the grid never sees the chequered flag.|Motor delantero, cascos de cuero y ninguna protección. La mitad de la parrilla no ve la bandera a cuadros.
A revolução do motor traseiro. Carros leves, pilotos-engenheiros e Nürburgring de 22 km.|The rear-engine revolution. Light cars, driver-engineers and the 22 km Nürburgring.|La revolución del motor trasero. Coches ligeros, pilotos ingenieros y los 22 km de Nürburgring.
Patrocínio, aerodinâmica e efeito solo. A F1 vira espetáculo global — e segue mortal.|Sponsorship, aerodynamics and ground effect. F1 becomes a global spectacle, and remains deadly.|Patrocinio, aerodinámica y efecto suelo. La F1 se convierte en un espectáculo global y sigue siendo mortal.
Suspensão ativa, controle de tração e o duelo que definiu uma geração. Depois, Imola muda tudo.|Active suspension, traction control and the rivalry that defined a generation. Then Imola changes everything.|Suspensión activa, control de tracción y el duelo que definió una generación. Después, Imola lo cambia todo.
V10 a 19 mil giros, pit stops com reabastecimento e uma vermelha que ganhou cinco seguidos.|V10s at 19,000 rpm, refuelling stops and a red car that wins five in a row.|V10 a 19.000 rpm, repostajes y un coche rojo que ganó cinco seguidos.
DRS, pneus que se degradam de propósito e motores híbridos. Duas equipes ganham quase tudo.|DRS, deliberately degrading tyres and hybrid engines. Two teams win almost everything.|DRS, neumáticos diseñados para degradarse y motores híbridos. Dos equipos ganan casi todo.
Teto orçamentário, efeito solo e um grid que se renova. A história ainda está sendo escrita.|A budget cap, ground effect and a changing grid. History is still being written.|Límite presupuestario, efecto suelo y una parrilla que se renueva. La historia sigue escribiéndose.
Estrear nos {0}: {1}|Debut in the {0}: {1}|Debutar en los {0}: {1}
Começar uma carreira na {0}|Start a career in {0}|Empezar una carrera en {0}
O topo do automobilismo mundial. Monopostos, circuitos consagrados e a pressão máxima.|The pinnacle of motorsport. Single-seaters, legendary circuits and maximum pressure.|La cima del automovilismo. Monoplazas, circuitos legendarios y la máxima presión.
Ovais a 380 km/h, circuitos de rua e as 500 Milhas de Indianápolis valendo o dobro.|Ovals at 380 km/h, street circuits and double points at the Indianapolis 500.|Óvalos a 380 km/h, circuitos urbanos y puntos dobles en las 500 Millas de Indianápolis.
Protótipos, revezamento e provas de 6, 12 e 24 horas. Le Mans decide a temporada.|Prototypes, shared driving and races of 6, 12 and 24 hours. Le Mans decides the season.|Prototipos, relevos y pruebas de 6, 12 y 24 horas. Le Mans decide la temporada.
Carros de teto, grid invertido e o campeonato mais disputado das Américas.|Touring cars, reverse grids and the most competitive championship in the Americas.|Turismos, parrillas invertidas y el campeonato más disputado de las Américas.
Ovais lotados, corridas de 500 milhas em pelotão e o campeonato mais popular dos Estados Unidos.|Packed ovals, 500-mile pack races and America's most popular championship.|Óvalos llenos, carreras de 500 millas en pelotón y el campeonato más popular de Estados Unidos.
Turismo alemão: carros de teto, corridas curtas e o roçar de para-lamas como regra.|German touring cars: short races and door-to-door contact as standard.|Turismos alemanes: carreras cortas y contacto entre coches como norma.
Monopostos elétricos dentro das cidades, com a energia contada até a última volta.|Electric single-seaters racing in cities, managing energy to the last lap.|Monoplazas eléctricos en las ciudades, administrando la energía hasta la última vuelta.
F2 e topo nacional|F2 and national top series|F2 y cima nacional
Entrada|Entry level|Iniciación
Internacional|International|Internacional
Assumir um piloto real|Take over a real driver|Tomar el control de un piloto real
Qualquer piloto de qualquer grid, de 1950 até hoje, conduzido do seu jeito.|Any driver from any grid, from 1950 to today, with you in control.|Cualquier piloto de cualquier parrilla, desde 1950 hasta hoy, a tu manera.
As sete carreiras|The seven career paths|Las siete trayectorias
De Mônaco a Daytona: cada categoria com sua escada, seus rivais e seu regulamento.|From Monaco to Daytona: each series has its own ladder, rivals and rules.|De Mónaco a Daytona: cada categoría con su escalera, rivales y reglamento.
O retrospecto corrida a corrida de cada ano que você disputou.|Your race-by-race record for every season you have contested.|El historial carrera a carrera de cada temporada que disputaste.
Galeria de lendas|Hall of legends|Galería de leyendas
As carreiras que você encerrou, ranqueadas pelo que conquistaram.|Your completed careers, ranked by their achievements.|Tus trayectorias terminadas, ordenadas por sus logros.
Os seus números e os da história.|Your statistics and the historical records.|Tus estadísticas y las de la historia.
O fim de semana, o mercado, o dinheiro e o modo chefe.|Race weekends, the market, money and team principal mode.|El fin de semana, el mercado, el dinero y el modo jefe.
Mercado de {0}|{0} driver market|Mercado de {0}
Escolha onde você vai correr no ano que vem.|Choose where you will race next year.|Elige dónde correrás el año que viene.
Quem não ligou|Who did not call|Quién no llamó
Salto duplo|Double promotion|Salto doble
Promoção|Promotion|Ascenso
Recomeço|Fresh start|Nuevo comienzo
Mais um ano|Another year|Un año más
Descer para|Move down to|Bajar a
Continuar na|Stay in|Seguir en
Convite|Invitation|Invitación
Primeiro piloto.|Number one driver.|Primer piloto.
Contrato exclusivo|Exclusive contract|Contrato exclusivo
Contrato padrão|Standard contract|Contrato estándar
Contrato livre|Open contract|Contrato libre
Nenhuma outra categoria durante o ano.|No other series during the year.|Ninguna otra categoría durante el año.
Provas avulsas de endurance liberadas.|One-off endurance races allowed.|Se permiten pruebas sueltas de resistencia.
Você pode correr em paralelo onde quiser.|You can race in other series alongside this one.|Puedes correr en otras categorías en paralelo.
Negociar com a {0}|Negotiate with {0}|Negociar con {0}
Já negociado|Already negotiated|Ya negociado
{0} do seu bolso|{0} out of your pocket|{0} de tu bolsillo
a academia banca {0}|the academy covers {0}|la academia aporta {0}
fora do orçamento|beyond your budget|fuera de tu presupuesto
aqui a equipe paga você|here the team pays you|aquí el equipo te paga
Pendurar o capacete|Hang up your helmet|Colgar el casco
Encerrar a carreira agora e entrar para a galeria de lendas.|End your career now and enter the hall of legends.|Terminar tu carrera ahora y entrar en la galería de leyendas.
Renovar onde você já está. Eles conhecem o seu jeito.|Renew with your current team. They know how you work.|Renovar con tu equipo actual. Conocen tu estilo.
Repetir a categoria com outra equipe e provar seu valor.|Stay in the series with another team and prove yourself.|Repetir categoría con otro equipo y demostrar tu valor.
Você não faz ideia do que cada equipe está construindo. Está no escuro.|You have no idea what each team is building. You are in the dark.|No sabes qué está construyendo cada equipo. Estás a oscuras.
A força de cada carro é o que você conseguiu apurar, não o que ela é — e o que te prometem para assinar nem sempre acontece.|The car's strength reflects what you have learned about it, and promises made to secure your signature do not always come true.|La fuerza del coche refleja lo que has podido averiguar; las promesas para conseguir tu firma no siempre se cumplen.
um ano bom aqui e você vai para a equipe principal|one good year here and you move to the main team|un buen año aquí y pasarás al equipo principal
três engenheiros de uma equipe grande já assinaram com a gente|three engineers from a top team have already signed with us|tres ingenieros de un equipo grande ya han firmado con nosotros
diz a própria equipe|says the team itself|dice el propio equipo
diz um jornalista|says a journalist|dice un periodista
a própria equipe|the team itself|el propio equipo
um jornalista|a journalist|un periodista
As finanças só existem no modo realista.|Finances are available in realistic mode.|Las finanzas están disponibles en el modo realista.
Saldo|Balance|Saldo
Caixa|Cash|Caja
Receitas|Income|Ingresos
Despesas|Expenses|Gastos
Salário|Salary|Salario
Patrocínio|Sponsorship|Patrocinio
Patrocinadores|Sponsors|Patrocinadores
Investimentos|Investments|Inversiones
Investir|Invest|Invertir
Retirar|Withdraw|Retirar
Comprar|Buy|Comprar
Vender|Sell|Vender
Disponível|Available|Disponible
Custo|Cost|Coste
Total|Total|Total
por ano|per year|al año
por temporada|per season|por temporada
Ano que vem|Next year|El año que viene
Academia|Academy|Academia
Academias|Academies|Academias
Aceitar|Accept|Aceptar
Recusar|Decline|Rechazar
Agora não|Not now|Ahora no
Sem academia|No academy|Sin academia
Programa de formação|Development programme|Programa de formación
Vínculo com a {0}|Affiliation with {0}|Vínculo con {0}
ligado à {0}|linked to {0}|vinculada a {0}
Quem anda com você, quem anda contra, e o que cada um quer.|Who is on your side, who is against you, and what each person wants.|Quién está de tu lado, quién está en tu contra y qué quiere cada uno.
Confiança|Trust|Confianza
Respeito|Respect|Respeto
Afeto|Affection|Afecto
O que ele quer|What he wants|Lo que quiere
Você ainda não sabe. Descobre conversando, ou tarde demais.|You do not know yet. Find out by talking, or when it is too late.|Todavía no lo sabes. Lo descubrirás hablando o cuando sea demasiado tarde.
Conversar|Talk|Conversar
Conversar · {0}|Talk · {0}|Conversar · {0}
Fechado|Reserved|Reservado
Inseguro|Insecure|Inseguro
Fala pouco e só sobre trabalho. Não confunda silêncio com desprezo.|Speaks little, and only about work. Do not mistake silence for contempt.|Habla poco y solo del trabajo. No confundas el silencio con el desprecio.
Precisa ouvir que está fazendo certo, inclusive quando está.|Needs reassurance that he is doing well, even when he is.|Necesita oír que lo está haciendo bien, incluso cuando así es.
acha que você está aqui por sorte|thinks you are only here through luck|cree que estás aquí por suerte
mede as palavras perto de você|chooses his words carefully around you|mide sus palabras contigo
evita você fora do trabalho|avoids you outside work|te evita fuera del trabajo
não te leva a sério como piloto|does not take you seriously as a driver|no te toma en serio como piloto
é cordial|is polite|es cordial
Assumir uma equipe real|Take over a real team|Asumir un equipo real
Escolha qualquer equipe de qualquer grid desde 1950. Ela vem com os pilotos, o carro, o dono e a expectativa que tinha naquele ano.|Choose any team from any grid since 1950. You inherit its drivers, car, owner and expectations for that year.|Elige cualquier equipo de cualquier parrilla desde 1950. Heredas sus pilotos, coche, dueño y expectativas de ese año.
Fundar uma equipe na Fórmula 1|Start a Formula 1 team|Fundar un equipo en Fórmula 1
Nome, cor e bandeira são seus. O dinheiro é de investidores, o carro é o pior do grid e ninguém quer correr por você. Ainda.|You choose the name, colour and flag. Investors supply the money, the car is the worst on the grid and nobody wants to drive for you. Yet.|Tú eliges nombre, color y bandera. Los inversores ponen el dinero, el coche es el peor de la parrilla y nadie quiere correr para ti. Todavía.
Começar na base|Start in the junior ranks|Empezar en las categorías inferiores
Uma equipe pequena numa categoria de acesso. Pilotos que pagam para correr, orçamento curto e a Fórmula 1 lá em cima, do outro lado de alguns títulos.|A small junior team. Paying drivers, a tight budget and Formula 1 waiting several titles away.|Un equipo pequeño en una categoría inferior. Pilotos que pagan por correr, poco presupuesto y la Fórmula 1 al otro lado de varios títulos.
Sua equipe|Your team|Tu equipo
Nome da equipe|Team name|Nombre del equipo
Ex.: Fittipaldi Racing|E.g. Fittipaldi Racing|Ej.: Fittipaldi Racing
País|Country|País
Cor|Colour|Color
Categoria de estreia|Starting series|Categoría del debut
Quanto mais baixo, mais barato — e mais longe da Fórmula 1.|The lower the series, the cheaper it is, and the further from Formula 1.|Cuanto más abajo, más barato y más lejos de la Fórmula 1.
De onde vem o dinheiro|Where the money comes from|De dónde viene el dinero
Dinheiro seu e de sócios pequenos|Your savings and small investors|Tu dinero y el de pequeños socios
Menos caixa, mas a equipe é toda sua: ninguém te tira do cargo.|Less cash, but the team is all yours: nobody can fire you.|Menos dinero, pero el equipo es tuyo: nadie puede despedirte.
Um investidor forte|A major investor|Un inversor fuerte
O caixa de uma equipe nova. Você fica com 70% e manda sozinho.|The funding of a new team. You keep 70% and full control.|El capital de un equipo nuevo. Conservas el 70% y el mando.
Um fundo bilionário|A billionaire investment fund|Un fondo multimillonario
Dinheiro de sobra desde o primeiro dia — e um conselho acima de você, que cobra resultado e pode te demitir.|Plenty of money from day one, with a board above you that demands results and can fire you.|Dinero de sobra desde el primer día y un consejo que exige resultados y puede despedirte.
Você começa com pouco: o dinheiro de uma temporada modesta, e pilotos que pagam pela vaga.|You start small: enough for a modest season, and drivers who pay for their seats.|Empiezas con poco: el dinero de una temporada modesta y pilotos que pagan por su asiento.
Começa com {0}. É isso para sobreviver até o dinheiro de patrocínio e de prêmio aparecer.|Starts with {0}. That must keep you alive until sponsorship and prize money arrive.|Empieza con {0}. Debe alcanzar hasta que lleguen los patrocinios y los premios.
Diga quem é o chefe da equipe.|Enter the team principal's name.|Indica quién es el jefe del equipo.
Escolha a equipe que vai comandar.|Choose the team you will run.|Elige el equipo que dirigirás.
A equipe precisa de um nome.|Your team needs a name.|El equipo necesita un nombre.
Não consegui abrir a equipe salva.|Could not load the saved team.|No pude abrir el equipo guardado.
Equipe salva neste aparelho.|Team saved on this device.|Equipo guardado en este dispositivo.
Candidata ao título|Title contender|Candidato al título
Pelotão da frente|Front runners|Grupo delantero
Meio do grid|Midfield|Zona media
Fundo do grid|Backmarkers|Fondo de la parrilla
Escalação a definir|Line-up to be confirmed|Alineación por definir
equipe de fábrica, motor próprio|works team, own engine|equipo de fábrica, motor propio
As equipes de {0}, da mais forte para a mais fraca. Quem você escolher sai do grid da história: a partir daqui, quem decide é você.|The teams of {0}, from strongest to weakest. Your chosen team leaves its historical path: from now on, you decide.|Los equipos de {0}, del más fuerte al más débil. El equipo elegido abandona su trayectoria histórica: desde ahora decides tú.
Muro dos boxes|Pit wall|Muro de boxes
Ao trabalho|Let's get to work|Manos a la obra
pré-temporada de {0}|{0} pre-season|pretemporada de {0}
A pré-temporada é uma lista de tarefas. Quando os dois carros tiverem piloto{0}, dá para largar.|Pre-season is a checklist. When both cars have drivers{0}, you can go racing.|La pretemporada es una lista de tareas. Cuando los dos coches tengan piloto{0}, podrás correr.
e motor|and an engine|y motor
Você é o novo chefe da {0}. O carro, os pilotos e o dono já estão aqui — a diretoria vai dizer o que espera depois dos testes de pré-temporada. Contratos, motor, patrocínio e o dinheiro de desenvolvimento passam pela sua mesa a partir de agora.|You are the new team principal at {0}. The car, drivers and owner are already here; the board will set its expectations after pre-season testing. Contracts, engines, sponsorship and development spending are now your responsibility.|Eres el nuevo jefe de {0}. El coche, los pilotos y el dueño ya están aquí; la directiva fijará sus expectativas después de los test de pretemporada. Contratos, motor, patrocinio y desarrollo pasan ahora por tu mesa.
A {0} existe no papel e numa fábrica alugada. Falta quase tudo: pilotos, um contrato de motor que faça sentido e patrocinadores. O dinheiro dos investidores parece muito. Não é.|{0} exists on paper and in a rented factory. Almost everything is missing: drivers, a sensible engine deal and sponsors. The investors' money looks like a lot. It is not.|{0} existe en el papel y en una fábrica alquilada. Falta casi todo: pilotos, un contrato de motor razonable y patrocinadores. El dinero de los inversores parece mucho. No lo es.
A {0} tem dois carros, um caminhão e um sonho. Na {1} os pilotos pagam para correr: escolher entre o talentoso e o que traz dinheiro é a primeira decisão de toda pré-temporada.|{0} has two cars, a truck and a dream. In {1}, drivers pay to race: choosing between talent and funding is the first decision of every pre-season.|{0} tiene dos coches, un camión y un sueño. En {1} los pilotos pagan por correr: elegir entre talento y dinero es la primera decisión de cada pretemporada.
Motor|Engine|Motor
Chassi|Chassis|Chasis
Aerodinâmica|Aerodynamics|Aerodinámica
Instalações|Facilities|Instalaciones
Engenharia|Engineering|Ingeniería
Funcionários|Staff|Personal
Fábrica|Factory|Fábrica
Túnel de vento|Wind tunnel|Túnel de viento
Simulador|Simulator|Simulador
Projetista|Designer|Diseñador
Diretor técnico|Technical director|Director técnico
Aerodinamicista|Aerodynamicist|Aerodinamicista
Motorista|Engine specialist|Especialista de motor
Diretoria|Board|Directiva
Objetivo|Objective|Objetivo
Metas|Targets|Metas
Confiança do dono|Owner's confidence|Confianza del dueño
Reputação|Reputation|Reputación
Mercado|Market|Mercado
Contratar|Hire|Contratar
Renovar|Renew|Renovar
Dispensar|Release|Dar de baja
Promover|Promote|Ascender
Rebaixar|Demote|Descender
Titular|Race driver|Titular
Reserva|Reserve|Reserva
Piloto de teste|Test driver|Piloto de pruebas
Emprestado|On loan|Cedido
Sem contrato|Out of contract|Sin contrato
Negociar|Negotiate|Negociar
Fazer proposta|Make an offer|Hacer una oferta
Proposta|Offer|Oferta
Aceitar proposta|Accept offer|Aceptar oferta
Recusar proposta|Decline offer|Rechazar oferta
Duração|Duration|Duración
Papel|Role|Papel
Primeiro piloto|Number one driver|Primer piloto
Segundo piloto|Second driver|Segundo piloto
Sem preferência|No preference|Sin preferencia
Contratos|Contracts|Contratos
Contrato|Contract|Contrato
Situação|Status|Situación
Livre|Free|Libre
Livre no fim do ano|Available at year end|Disponible al terminar el año
Contrato até {0}|Contract until {0}|Contrato hasta {0}
até {0}|until {0}|hasta {0}
interesse|interest|interés
Interesse|Interest|Interés
Idade|Age|Edad
Potencial|Potential|Potencial
Nível|Level|Nivel
Mínimo|Minimum|Mínimo
Máximo|Maximum|Máximo
Continuar negociando|Continue negotiations|Seguir negociando
Cancelar|Cancel|Cancelar
Confirmar|Confirm|Confirmar
Futuro|Future|Futuro
Ano atual|Current year|Año actual
Investimento|Investment|Inversión
Construir|Build|Construir
Melhorar|Upgrade|Mejorar
Em construção|Under construction|En construcción
Concluído|Complete|Completado
Orçamento|Budget|Presupuesto
Teto orçamentário|Budget cap|Límite presupuestario
Empréstimo|Loan|Préstamo
Pedir empréstimo|Take out a loan|Pedir un préstamo
Investidores|Investors|Inversores
Sem propostas|No offers|Sin ofertas
Nenhuma proposta.|No offers.|Ninguna oferta.
Você perde a maioria.|You lose majority ownership.|Pierdes la mayoría.
Seu patrimônio|Your wealth|Tu patrimonio
Seu dinheiro|Your money|Tu dinero
Próxima temporada|Next season|Próxima temporada
Fim da temporada|End of season|Fin de temporada
Balanço|Review|Balance
Resultado|Result|Resultado
Resultados|Results|Resultados
Histórico|History|Historial
Calendário|Calendar|Calendario
Treino livre|Free practice|Entrenamiento libre
Treinos|Practice|Entrenamientos
Volta|Lap|Vuelta
Voltas|Laps|Vueltas
Volta {0} de {1}|Lap {0} of {1}|Vuelta {0} de {1}
volta {0} de {1}|lap {0} of {1}|vuelta {0} de {1}
Rádio|Radio|Radio
Pneus|Tyres|Neumáticos
Pneu|Tyre|Neumático
Macio|Soft|Blando
Médios|Mediums|Medios
Médio|Medium|Medio
Duro|Hard|Duro
Duros|Hards|Duros
Intermediário|Intermediate|Intermedio
Chuva extrema|Full wet|Lluvia extrema
Parada|Pit stop|Parada
parada|stop|parada
paradas|stops|paradas
Parar e pôr {0}|Pit for {0} tyres|Parar y poner {0}
À frente|Ahead|Delante
Atrás|Behind|Detrás
Liderando|Leading|Liderando
Líder|Leader|Líder
Intervalo|Interval|Intervalo
Diferença|Gap|Diferencia
Tempo|Time|Tiempo
Melhor volta|Best lap|Mejor vuelta
Última volta|Last lap|Última vuelta
Pausar|Pause|Pausar
Velocidade|Speed|Velocidad
Simular até o fim|Simulate to the finish|Simular hasta el final
Ver o resultado|View result|Ver el resultado
Bandeirada|Chequered flag|Bandera a cuadros
abandonou|retired|abandonó
Pista|Track|Pista
Estratégia|Strategy|Estrategia
Estratégia de corrida|Race strategy|Estrategia de carrera
Ordens de equipe|Team orders|Órdenes de equipo
Ordem de equipe: deixar {0} passar|Team order: let {0} through|Orden de equipo: dejar pasar a {0}
Ritmo de {0}|Pace for {0}|Ritmo de {0}
Forçar|Push|Atacar
Normal|Normal|Normal
Poupar|Conserve|Conservar
Conservar|Conserve|Conservar
Atacar|Attack|Atacar
Defender|Defend|Defender
Equilibrar|Balance|Equilibrar
Sem mudanças|No changes|Sin cambios
Sexta|Friday|Viernes
Sábado de manhã|Saturday morning|Sábado por la mañana
Corrida|Race|Carrera
Corrida ao vivo|Live race|Carrera en directo
Largar|Start race|Tomar la salida
Ir para a corrida|Go to the race|Ir a la carrera
Próxima etapa|Next round|Próxima prueba
Fim de semana|Race weekend|Fin de semana
Sair da corrida|Exit race|Salir de la carrera
Campeão|Champion|Campeón
Campeã|Champion|Campeona
Título|Title|Título
Títulos|Titles|Títulos
Vice-campeão|Runner-up|Subcampeón
Foi demitido|Fired|Despedido
Você foi demitido|You have been fired|Te han despedido
Temporada {0}|{0} season|Temporada {0}
Temporada de {0}|{0} season|Temporada de {0}
análise|analysis|análisis
boato|rumour|rumor
notícia|news|noticia
Comentário|Comment|Comentario
Comentários|Comments|Comentarios
sem dado|no data|sin datos
Encerrar|Finish|Terminar
Mais detalhes|More details|Más detalles
Nenhum|None|Ninguno
Nenhuma|None|Ninguna
Todos|All|Todos
Todas|All|Todas
Buscar|Search|Buscar
Busca|Search|Búsqueda
Filtrar|Filter|Filtrar
Região|Region|Región
Nacional|National|Nacional
Continental|Continental|Continental
Mundial|World|Mundial
Mundial de Kart|World Karting|Mundial de Karting
Fórmula Regional|Formula Regional|Fórmula Regional
Brasileiro de Kart|Brazilian Karting Championship|Campeonato Brasileño de Karting
Italiano de Kart|Italian Karting Championship|Campeonato Italiano de Karting
Britânico de Kart|British Karting Championship|Campeonato Británico de Karting
Fórmula 4 Brasil|Brazilian Formula 4|Fórmula 4 Brasil
Fórmula 4 Italiana|Italian Formula 4|Fórmula 4 Italiana
Fórmula 4 Britânica|British Formula 4|Fórmula 4 Británica
Fórmula 4 Alemã|German Formula 4|Fórmula 4 Alemana
Fórmula 4 Francesa|French Formula 4|Fórmula 4 Francesa
Fórmula 4 Espanhola|Spanish Formula 4|Fórmula 4 Española
Fórmula 4 Japonesa|Japanese Formula 4|Fórmula 4 Japonesa
Internacional de Kart|International Karting|Karting Internacional
Etapa de {0}|{0} round|Prueba de {0}
Norte|North|Norte
Sul|South|Sur
Leste|East|Este
Oeste|West|Oeste
Kartódromo Central|Central Kart Circuit|Kartódromo Central
Kartódromo do Norte|Northern Kart Circuit|Kartódromo del Norte
Kartódromo do Sul|Southern Kart Circuit|Kartódromo del Sur
Kartódromo do Leste|Eastern Kart Circuit|Kartódromo del Este
Kartódromo do Oeste|Western Kart Circuit|Kartódromo del Oeste
Kart Clube|Kart Club|Club de Karting
Oficina Central|Central Workshop|Taller Central
Time da Cidade|City Team|Equipo de la Ciudad
Preparadora Local|Local Racing Workshop|Preparador Local
Equipe do Kartódromo|Kart Circuit Team|Equipo del Kartódromo
Time Amador|Amateur Team|Equipo Aficionado
Equipe Familiar|Family Team|Equipo Familiar
Em caixa|Cash on hand|En caja
Investido|Invested|Invertido
Por temporada|Per season|Por temporada
O ano de {0}|The year {0}|El año {0}
Custo da temporada ({0})|Season cost ({0})|Coste de la temporada ({0})
Apoio da família|Family support|Apoyo familiar
Resultado do ano|Annual balance|Balance del año
Nenhum patrocinador ainda. Apareça na pista.|No sponsors yet. Make your mark on track.|Todavía no tienes patrocinadores. Destaca en la pista.
Propostas na mesa|Offers on the table|Ofertas sobre la mesa
Contrato de {0} temporada.|{0}-season contract.|Contrato de {0} temporada.
Contrato de {0} temporadas.|{0}-season contract.|Contrato de {0} temporadas.
Dinheiro parado não rende. Investido, rende cerca de 6% ao ano — com anos ruins pelo meio.|Idle money earns nothing. Investments return around 6% a year, with some bad years along the way.|El dinero parado no rinde. Invertido, da cerca de un 6% anual, con algunos años malos.
Dia extra de testes|Extra test day|Día extra de pruebas
Comprar pista é o jeito mais direto de transformar dinheiro em ritmo: o carro evolui mais rápido nesta temporada. Vale por um ano só.|Buying track time turns money directly into pace: the car develops faster this season. The benefit lasts one year.|Comprar tiempo de pista convierte dinero en ritmo: el coche mejora más rápido esta temporada. Dura solo un año.
Luxo — o nome também se constrói fora da pista|Luxury — building your reputation off the track|Lujo: el nombre también se construye fuera de la pista
Relógio suíço|Swiss watch|Reloj suizo
Carro esportivo|Sports car|Coche deportivo
Apartamento em Mônaco|Apartment in Monaco|Apartamento en Mónaco
Lancha|Motorboat|Lancha
Helicóptero|Helicopter|Helicóptero
Kartódromo próprio|Your own kart circuit|Kartódromo propio
+{0} de fama|+{0} reputation|+{0} de fama
+{0} de moral|+{0} morale|+{0} de moral
Relações|Relationships|Relaciones
Político|Political|Político
Sabe de onde vem o dinheiro e para onde vai o vento antes de todo mundo.|Knows where the money comes from and which way the wind is blowing before anyone else.|Sabe de dónde viene el dinero y hacia dónde sopla el viento antes que nadie.
não te suporta|cannot stand you|no te soporta
trata você como profissional, e só|treats you as a professional, and nothing more|te trata como profesional y nada más
O que fazer nesta temporada|What to do this season|Qué hacer esta temporada
Jantar com o grupo de engenharia|Dinner with the engineering team|Cena con el equipo de ingeniería
Uma noite fora da pista rende mais confiança do que dez reuniões.|One evening away from the track builds more trust than ten meetings.|Una noche fuera de la pista da más confianza que diez reuniones.
Semana na fábrica|A week at the factory|Una semana en la fábrica
Você aparece, pergunta, atrapalha um pouco e aprende muito.|You show up, ask questions, get in the way a little and learn a lot.|Apareces, preguntas, molestas un poco y aprendes mucho.
Treinar junto com o companheiro|Train with your teammate|Entrenar con tu compañero
Dividir preparação física derruba muralha entre os dois lados da garagem.|Training together breaks down the wall between the two sides of the garage.|Entrenar juntos derriba el muro entre los dos lados del garaje.
Abrir seus dados de telemetria|Share your telemetry|Compartir tu telemetría
de graça|free|gratis
Ele vai ficar mais rápido com isso. Você também.|It will make him faster. You too.|Le hará más rápido. A ti también.
Circular pelo paddock|Spend time in the paddock|Moverse por el paddock
Conversa fiada com quem decide contratação. Funciona mais do que parece.|Small talk with the people who make hiring decisions. It works better than you might think.|Conversar con quienes deciden los fichajes. Funciona más de lo que parece.
Almoço com a imprensa|Lunch with the press|Almuerzo con la prensa
Quem escreve bem sobre você amanhã foi tratado bem hoje.|Tomorrow's favourable coverage starts with how you treat people today.|La buena prensa de mañana empieza con cómo tratas a la gente hoy.
Empresários|Managers|Representantes
Antes de comandar o esporte inteiro, ele cuidava da carreira de um piloto só. Negocia como quem já sabe o preço de tudo.|Before running the whole sport, he managed just one driver. Negotiates as though he already knows the price of everything.|Antes de dirigir todo el deporte, gestionaba la carrera de un solo piloto. Negocia como quien ya conoce el precio de todo.
Chefe de competição virado formador. Não é o que consegue o maior contrato, é o que consegue o telefonema certo de uma fábrica alemã.|A racing boss turned talent developer. He may not secure the biggest deal, but gets the right call from a German manufacturer.|Un jefe de competición convertido en formador. Quizá no consiga el mayor contrato, pero sí la llamada adecuada de una fábrica alemana.
Trânsito livre no paddock italiano. Se a vaga for numa equipe de Maranello ou vizinhança, ele fica sabendo primeiro.|Well connected in the Italian paddock. If a seat opens at Maranello or nearby, he hears first.|Se mueve libremente por el paddock italiano. Si hay un asiento en Maranello o cerca, se entera primero.
Construiu a maior carreira da história do esporte e cobra como quem sabe disso. Não assina com qualquer um.|Built the greatest career in the sport's history and charges accordingly. Does not sign with just anyone.|Construyó la mayor carrera de la historia del deporte y cobra en consecuencia. No firma con cualquiera.
Campeão do mundo que passou a cuidar de finlandeses rápidos. Fala pouco e resolve.|A world champion who went on to manage fast Finns. Says little and gets things done.|Un campeón mundial que pasó a gestionar a finlandeses rápidos. Habla poco y resuelve.
Tirou um finlandês de um currículo curto e o colocou numa equipe grande em dois anos. Aposta em talento cru.|Took a Finn with little experience into a major team in two years. Backs raw talent.|Llevó a un finlandés con poca experiencia a un gran equipo en dos años. Apuesta por el talento puro.
Trabalhou em três empregos para bancar o kart do filho e aprendeu o resto no caminho. Briga por quem representa.|Worked three jobs to fund his son's karting and learned the rest along the way. Fights for his drivers.|Trabajó en tres empleos para pagar el karting de su hijo y aprendió el resto por el camino. Lucha por sus pilotos.
Investidor antes de ser chefe de equipe. Enxerga a carreira como um ativo e negocia como tal.|An investor before becoming a team principal. Sees a career as an asset and negotiates accordingly.|Inversor antes de ser jefe de equipo. Ve la carrera como un activo y negocia como tal.
Empresário é quem atende o telefone quando uma equipe liga, quem sabe quanto pedir e quem consegue a reunião que você não conseguiria. Cobra uma fatia de tudo que você ganha — e costuma valer.|A manager answers when a team calls, knows what to ask for and gets meetings you could not arrange alone. They take a share of everything you earn, and are usually worth it.|Un representante responde cuando llama un equipo, sabe cuánto pedir y consigue reuniones a las que no llegarías solo. Se lleva una parte de tus ingresos y suele merecer la pena.
Aceitam representar você|Willing to represent you|Aceptan representarte
Fora do seu alcance hoje|Currently out of reach|Fuera de tu alcance por ahora
Já cuidou de: {0}|Has represented: {0}|Ha representado a: {0}
Dinheiro|Money|Dinero
Portas|Connections|Contactos
Só assina com fama {0}|Requires reputation {0}|Exige fama {0}
Só assina com geral {0}|Requires overall rating {0}|Exige nivel general {0}
Trabalho de formiga, contrato bem lido e nenhuma manchete. Muita carreira longa começou com ele.|Quiet hard work, carefully read contracts and no headlines. Many long careers began with him.|Trabajo discreto, contratos bien leídos y ningún titular. Muchas carreras largas empezaron con él.
Bicampeão do mundo que nunca deixou de olhar para os garotos do Brasil. Abre porta onde brasileiro costuma esbarrar.|A two-time world champion who never stopped looking out for young Brazilians. Opens doors that are usually closed to them.|Bicampeón mundial que nunca dejó de apoyar a los jóvenes brasileños. Abre puertas que suelen encontrar cerradas.
Cuidou dos assuntos de Ayrton Senna e nunca mais saiu do primeiro escalão. Discreto, metódico e caro.|Managed Ayrton Senna's affairs and has stayed at the top ever since. Discreet, methodical and expensive.|Gestionó los asuntos de Ayrton Senna y nunca dejó la primera línea. Discreto, metódico y caro.
Abre portas que não deviam estar abertas e leva a maior fatia do esporte. Com ele você vai longe — e paga por isso.|Opens doors that should not be open and takes the sport's biggest cut. He can take you far, at a price.|Abre puertas que deberían estar cerradas y se lleva la mayor parte. Con él llegas lejos y pagas por ello.
A porta mais rápida do grid e a mais estreita. Ele te leva ao topo em dois anos — ou te descarta no primeiro ano ruim.|The fastest route to the top, and the narrowest. He gets you there in two years or drops you after your first poor season.|La puerta más rápida y la más estrecha. Te lleva a la cima en dos años o te descarta tras el primer año malo.
Sobrenome que abre qualquer porta e um histórico de colocar jovens em equipes grandes cedo demais para o currículo.|A surname that opens any door, with a record of placing youngsters in big teams before their CV justifies it.|Un apellido que abre cualquier puerta y un historial de colocar jóvenes en grandes equipos antes de que lo justifique su trayectoria.
Acompanha um piloto só de cada vez, desde o kart. Quem entra na lista dele entra para ficar.|Follows one driver at a time, from karting. Anyone who joins him is there to stay.|Acompaña a un solo piloto a la vez desde el karting. Quien entra en su lista se queda.
Correu nove anos na Fórmula 1 e sabe exatamente onde as equipes apertam num contrato. Do outro lado da mesa agora.|Raced nine years in Formula 1 and knows exactly where teams squeeze a contract. Now on the other side of the table.|Corrió nueve años en Fórmula 1 y sabe dónde aprietan los equipos en un contrato. Ahora está al otro lado de la mesa.
Ainda corre e já cuida da carreira dos outros. Ninguém no grid conhece melhor o preço de uma escolha errada.|Still racing while already managing others. Nobody on the grid knows the cost of a wrong choice better.|Todavía corre y ya gestiona la carrera de otros. Nadie conoce mejor el precio de una mala elección.
Dez vitórias como piloto, décadas de paddock como dirigente. Conhece todo mundo e não deve nada a ninguém.|Ten wins as a driver, decades in the paddock as a boss. Knows everyone and owes nobody anything.|Diez victorias como piloto y décadas en el paddock como dirigente. Conoce a todos y no debe nada a nadie.
Ele não está trabalhando nesta época.|He is not working in this era.|No trabaja en esta época.
Ele não assina com você ainda.|He is not willing to sign with you yet.|Todavía no acepta representarte.
{0} passa a representar você. Ele fica com {1}% do que entrar.|{0} now represents you. He takes {1}% of your income.|{0} pasa a representarte. Recibe el {1}% de tus ingresos.
Mesa de patrocínio|Sponsorship desk|Mesa de patrocinio
Quem vai bem atrai dinheiro, e dinheiro é o que compra a próxima temporada. Cabem três logos no macacão: escolha com cuidado, porque contrato longo garante o ano que vem e contrato curto deixa você livre para pedir mais depois.|Results attract money, and money buys the next season. There is room for three logos on your overalls: long contracts secure next year, while short deals let you ask for more later.|Los resultados atraen dinero y el dinero paga la próxima temporada. Caben tres logotipos en tu mono: los contratos largos aseguran el año siguiente; los cortos permiten pedir más después.
apoio local|local support|apoyo local
contrato de {0} temporada|{0}-season contract|contrato de {0} temporada
contrato de {0} temporadas|{0}-season contract|contrato de {0} temporadas
Seguir para a temporada|Continue to the season|Seguir a la temporada
Escolha uma no início — ou troque no meio, se o mercado abrir a porta.|Choose one at the start, or switch later if the market opens a door.|Elige una al empezar o cambia después si el mercado abre la puerta.
Escada em {0}|Career ladder in {0}|Escalera en {0}
Épocas|Eras|Épocas
Criar piloto|Create driver|Crear piloto
Um ponto exato da história. O que vem depois é com você.|A precise moment in history. What comes next is up to you.|Un momento exacto de la historia. Lo que viene después depende de ti.
Escolha a categoria, o ano e o piloto. A carreira continua a partir dali.|Choose the series, year and driver. The career continues from there.|Elige categoría, año y piloto. La carrera continúa desde ahí.
Ano anterior|Previous year|Año anterior
Próximo ano|Next year|Próximo año
Números da carreira|Career statistics|Estadísticas de la carrera
base|junior|inferiores
Temporadas|Seasons|Temporadas
Pódios por prova|Podiums per race|Podios por carrera
Taxa de abandono|Retirement rate|Tasa de abandono
Melhor resultado|Best result|Mejor resultado
Pontos somados|Total points|Puntos totales
As carreiras que você já encerrou, ordenadas pelo que conquistaram.|Your completed careers, ranked by their achievements.|Tus trayectorias terminadas, ordenadas por sus logros.
Nenhuma carreira encerrada ainda.|No completed careers yet.|Todavía no hay trayectorias terminadas.
Cada ano disputado fica guardado aqui, com todas as corridas.|Every season you contest is stored here, including all its races.|Cada temporada que disputas queda guardada aquí con todas sus carreras.
Nenhuma temporada encerrada ainda.|No completed seasons yet.|Todavía no hay temporadas terminadas.
Termine seu primeiro ano e ele aparece aqui.|Finish your first season and it will appear here.|Termina tu primer año y aparecerá aquí.
O que a temporada disse sobre você|What the season revealed about you|Lo que la temporada reveló sobre ti
Os seus melhores fins de semana foram em {0}.|Your best weekends were on {0}.|Tus mejores fines de semana fueron en {0}.
O seu ponto fraco continua sendo {0}.|Your weak point is still {0}.|Tu punto débil sigue siendo {0}.
Você bateu {0} vezes. Uma é acidente; {1} é um padrão.|You crashed {0} times. One is an accident; {1} is a pattern.|Chocaste {0} veces. Una es un accidente; {1} es un patrón.
Retrospecto completo de {0}|Full {0} race record|Historial completo de {0}
Evolução do piloto — {0} → {1} anos|Driver development — age {0} → {1}|Evolución del piloto — {0} → {1} años
Ver o mercado de {0}|View the {0} market|Ver el mercado de {0}
Ultrap.|Overtaking|Adelant.
Desenv.|Develop.|Desarr.
circuitos técnicos|technical circuits|circuitos técnicos
circuitos mistos|road courses|circuitos permanentes
chefe de equipe|team principal|jefe de equipo
Pré-temporada de {0}|{0} pre-season|Pretemporada de {0}
motor {0}|{0} engine|motor {0}
disponível|available|disponible
confiança|confidence|confianza
Nível atual|Current level|Nivel actual
Projetista-chefe|Chief designer|Diseñador jefe
Chefe de aerodinâmica|Head of aerodynamics|Jefe de aerodinámica
Saldo previsto|Projected balance|Saldo previsto
{0} até {1}|{0} until {1}|{0} hasta {1}
Desenvolvimento do carro|Car development|Desarrollo del coche
Banco|Bank|Banco
Sem dívida · dá para pedir dinheiro emprestado|No debt · borrowing available|Sin deuda · puedes pedir un préstamo
Academia de pilotos|Driver academy|Academia de pilotos
Deve entrar|Expected income|Ingresos previstos
Deve sair|Expected outgoings|Gastos previstos
Caixa hoje|Cash today|Caja actual
Começar a temporada {0}|Start the {0} season|Empezar la temporada {0}
O campeonato ainda não começou.|The championship has not started yet.|El campeonato todavía no ha empezado.
Fornecedores de {0}|{0} suppliers|Proveedores de {0}
Duração do contrato|Contract length|Duración del contrato
Rendimento|Performance|Rendimiento
Seu fornecedor atual, até {0}.|Your current supplier, until {0}.|Tu proveedor actual, hasta {0}.
Fornece para quem pagar.|Supplies anyone who can pay.|Suministra a quien pague.
Atende qualquer equipe que pedir.|Supplies any team that asks.|Atiende a cualquier equipo que lo pida.
Motor próprio|Own engine|Motor propio
Caro e lento no começo, mas é seu: ninguém te dá a especificação de ontem e ninguém te abandona. Exige fábrica nível 2.|Expensive and slow at first, but yours: nobody supplies an outdated specification or abandons you. Requires a level 2 factory.|Caro y lento al principio, pero tuyo: nadie te entrega una especificación antigua ni te abandona. Requiere fábrica de nivel 2.
Para onde vai o dinheiro da fábrica em {0}|Factory spending in {0}|Dónde va el dinero de la fábrica en {0}
O dinheiro define até onde cada área pode chegar; a engenharia e as instalações decidem quanto disso vira ritmo. Nada chega de uma vez, e quem para de gastar fica para trás devagar.|Money sets each area's potential; engineering and facilities decide how much becomes pace. Improvements take time, and stopping investment means gradually falling behind.|El dinero fija el potencial de cada área; ingeniería e instalaciones deciden cuánto se convierte en ritmo. Las mejoras tardan y dejar de invertir supone quedarse atrás poco a poco.
hoje {0}|currently {0}|hoy {0}
engenharia|engineering|ingeniería
muito eficiente|very efficient|muy eficiente
eficiente|efficient|eficiente
pouco eficiente|inefficient|poco eficiente
Nada|Nothing|Nada
Teto de gastos de {0}|{0} spending cap|Límite de gastos de {0}
A sua equipe técnica|Your technical team|Tu equipo técnico
Organiza a fábrica inteira. Pesa em tudo o que o carro vira.|Organises the whole factory. Influences every part of the car.|Organiza toda la fábrica. Influye en todo lo que llega a ser el coche.
Chassi, suspensão e a confiabilidade que sai da prancheta.|Chassis, suspension and reliability at the design stage.|Chasis, suspensión y fiabilidad desde el diseño.
O túnel de vento é dele. Da década de 70 em diante, é quem mais decide.|Runs the wind tunnel. From the 1970s onwards, the most influential specialist.|Dirige el túnel de viento. Desde los años 70, es quien más decide.
Disponíveis|Available|Disponibles
Obra leva um ano. O que você constrói agora aparece no carro do ano que vem — e a conta de manutenção sobe para sempre.|Construction takes a year. Today's facilities improve next year's car and permanently increase maintenance costs.|Las obras duran un año. Lo que construyas hoy mejorará el coche del año siguiente y aumentará permanentemente el mantenimiento.
Onde o carro é construído. Pesa no chassi, na confiabilidade e no motor, se ele for seu.|Where the car is built. Affects chassis, reliability and your engine if you build it yourself.|Donde se construye el coche. Influye en chasis, fiabilidad y motor si es propio.
No máximo.|At maximum level.|En el nivel máximo.
Da década de 70 em diante, a aerodinâmica passa por aqui.|From the 1970s onwards, this is where aerodynamics happen.|Desde los años 70, la aerodinámica pasa por aquí.
Correlação entre o que a fábrica acha e o que a pista mostra.|Correlates factory predictions with real track performance.|Relaciona las previsiones de la fábrica con los resultados en pista.
Principal {0} · secundários {1}|Title sponsor {0} · secondary sponsors {1}|Principal {0} · secundarios {1}
Propostas|Offers|Ofertas
Assinar|Sign|Firmar
Pedir mais|Ask for more|Pedir más
Energético|Energy drink|Bebida energética
secundário|secondary|secundario
principal|title sponsor|principal
Tecnologia|Technology|Tecnología
ano(s)|year(s)|año(s)
Mais investimento abre vagas (3, 4, 6 ou 8 garotos), faz os garotos evoluírem mais rápido e deixa os olheiros mais certeiros. Os melhores da F2 e da F3 com até 21 anos também podem vir direto do mercado de pilotos.|More investment opens places for 3, 4, 6 or 8 youngsters, speeds up development and improves scouting. Top F2 and F3 drivers aged 21 or younger can also join directly from the driver market.|Más inversión abre plazas para 3, 4, 6 u 8 jóvenes, acelera su evolución y mejora el trabajo de los ojeadores. Los mejores de F2 y F3 de hasta 21 años también pueden llegar desde el mercado.
Na academia|In the academy|En la academia
Ninguém ainda.|Nobody yet.|Todavía nadie.
Observados pelos olheiros|Scouted drivers|Pilotos observados
Os olheiros acham que ele pode chegar a|Scouts believe he can reach|Los ojeadores creen que puede llegar a
Trazer para a academia|Bring into the academy|Traer a la academia
Você tem {0}% da equipe|You own {0}% of the team|Tienes el {0}% del equipo
Com menos de 50%, você passa a responder a um conselho — que pode te tirar do cargo.|Below 50% ownership, you answer to a board that can fire you.|Con menos del 50%, respondes ante un consejo que puede despedirte.
Dinheiro agora, conta depois|Money now, repayments later|Dinero ahora, pagos después
Três parcelas anuais, juros de 9% ao ano. A primeira vence no começo da próxima temporada. A diretoria não gosta de dívida.|Three annual repayments at 9% interest. The first is due at the start of next season. The board dislikes debt.|Tres cuotas anuales con un 9% de interés. La primera vence al empezar la próxima temporada. A la directiva no le gustan las deudas.
Um fôlego para fechar o ano.|Breathing room to finish the year.|Un respiro para terminar el año.
O suficiente para um pacote de desenvolvimento a mais.|Enough for one more development package.|Lo suficiente para otro paquete de desarrollo.
Uma aposta grande: ou vira carro, ou vira problema.|A big gamble: it either improves the car or becomes a problem.|Una apuesta grande: o mejora el coche o se convierte en un problema.
Seus pilotos|Your drivers|Tus pilotos
Passar a reserva|Move to reserve|Pasar a reserva
Fazer nº 1|Make number one|Nombrar número 1
No mercado|On the market|En el mercado
A leitura é o que os seus engenheiros acham que ele vale. O interesse depende do tamanho da sua equipe perto do lugar em que ele correria.|The assessment is your engineers' estimate. Interest depends on your team's standing compared with his alternatives.|La valoración es la estimación de tus ingenieros. El interés depende del nivel de tu equipo frente a sus alternativas.
Aberto a conversar|Open to talks|Dispuesto a hablar
Ver trajetória|View career path|Ver trayectoria
Quer vir|Wants to join|Quiere venir
Levar para a academia|Bring into the academy|Llevar a la academia
Nível {0} na {1}; a leitura já está na escala da Fórmula 1.|Level {0} in {1}; the assessment is already on the Formula 1 scale.|Nivel {0} en {1}; la valoración ya está en la escala de Fórmula 1.
Convite de academia|Academy invitation|Invitación de una academia
Um programa de formação quer o seu nome.|A development programme wants to sign you.|Un programa de formación quiere ficharte.
O título chamou atenção.|Your title attracted attention.|El título llamó la atención.
O {0} lugar não passou despercebido.|Your {0} place did not go unnoticed.|Tu {0} puesto no pasó desapercibido.
Entrar num programa acelera sua evolução, abre portas no mercado e coloca seu nome na fila de uma equipe grande. Trocar de equipe na base mantém o vínculo. A academia avalia seus resultados e seu potencial a cada temporada e pode dispensar você se não corresponder. A formação termina ao chegar à Fórmula 1 ou a outra categoria principal.|Joining a programme accelerates your development and opens doors to bigger teams. Changing junior teams keeps your affiliation. The academy reviews results and potential each season and may release you for poor performance. Reaching Formula 1 or another top series completes your development programme.|Entrar en un programa acelera tu evolución y abre puertas a grandes equipos. Cambiar de equipo en las categorías inferiores conserva el vínculo. La academia evalúa tus resultados y potencial cada temporada y puede darte de baja por mal rendimiento. La formación termina al llegar a Fórmula 1 u otra categoría principal.
Programa independente|Independent programme|Programa independiente
Evolução +{0}% ao ano|Development +{0}% per year|Evolución +{0}% al año
caminho aberto para a {0}|a path to {0}|camino abierto hacia {0}
Seguir por conta própria|Continue independently|Seguir por tu cuenta
Sem programa, sem cobrança de fora. O mérito é todo seu.|No programme and no outside pressure. All the credit is yours.|Sin programa ni presión externa. Todo el mérito es tuyo.
Você entrou na {0}.|You have joined {0}.|Te has unido a {0}.
Formação intensa e cobrança alta, com caminho para as equipes do grupo.|Intense training and high expectations, with a path to the group's teams.|Formación intensa y grandes exigencias, con camino a los equipos del grupo.
Estrutura completa em Maranello, com a pressão de vestir vermelho um dia.|Full facilities at Maranello, with the pressure of wearing red one day.|Instalaciones completas en Maranello y la presión de vestir de rojo algún día.
O programa que formou um campeão do mundo saído do kart.|The programme that took a karter all the way to a world title.|El programa que llevó a un piloto del karting al título mundial.
Escola francesa de formação, forte nas categorias de acesso europeias.|French development programme with a strong presence in European junior series.|Escuela francesa con fuerza en las categorías inferiores europeas.
Poucos pilotos, muito investimento e um caminho curto até o topo.|Few drivers, substantial investment and a short route to the top.|Pocos pilotos, mucha inversión y un camino corto hasta la cima.
Programa suíço discreto, com espaço real para quem se destaca.|A quiet Swiss programme with genuine opportunities for outstanding drivers.|Un discreto programa suizo con oportunidades para quienes destacan.
Aposta em jovens e entrega volante de verdade mais rápido que os rivais.|Invests in youngsters and gives them a real seat sooner than rivals.|Apuesta por jóvenes y ofrece un asiento real antes que sus rivales.
O programa mais novo do grid, construído para a próxima década.|The grid's newest programme, built for the next decade.|El programa más nuevo de la parrilla, pensado para la próxima década.
A escola que abasteceu a França de campeões por três décadas.|The school that supplied France with champions for three decades.|La escuela que dio campeones a Francia durante tres décadas.
Dinheiro de patrocínio bancando jovens promissores até a Fórmula 1.|Sponsorship money funding promising youngsters all the way to Formula 1.|Dinero de patrocinio que lleva a jóvenes promesas hasta Fórmula 1.
O caminho clássico do kart paulista para a Europa.|The classic route from São Paulo karting to Europe.|El camino clásico del karting paulista a Europa.
Apoio brasileiro para levar talento nacional às categorias de acesso europeias.|Brazilian support to bring national talent into European junior series.|Apoyo brasileño para llevar talento nacional a las categorías inferiores europeas.
Formação de pilotos dentro de casa, com passagem direta pela Stock Series.|Homegrown driver development with a direct route through Stock Series.|Formación de pilotos en casa con paso directo por Stock Series.
A escada oficial americana, com bolsa para o campeão de cada degrau.|The official American ladder, with a scholarship for each level's champion.|La escalera oficial estadounidense, con beca para el campeón de cada nivel.
Programa de formação que virou porta de entrada para o pelotão principal.|A development programme that became a gateway to the main grid.|Programa de formación que se convirtió en puerta de entrada a la categoría principal.
O título por um ponto|A title decided by one point|El título por un punto
A última volta de Abu Dhabi|The final lap in Abu Dhabi|La última vuelta de Abu Dabi
A carreira que a história interrompeu|The career history cut short|La carrera que la historia interrumpió
O talento interrompido no auge|Talent interrupted at its peak|El talento interrumpido en su apogeo
Um ponto de diferença, três pilotos|One point between three drivers|Un punto entre tres pilotos
A rivalidade dentro da própria garagem|Rivalry within the garage|La rivalidad dentro del garaje
A equipe que nasceu das cinzas|The team that rose from the ashes|El equipo que nació de las cenizas
A decisão mais discutida do automobilismo brasileiro|Brazilian motorsport's most debated decision|La decisión más debatida del automovilismo brasileño
O piloto mais amado que nunca foi campeão|The most beloved driver never to be champion|El piloto más querido que nunca fue campeón
E se ele tivesse ido para a Europa?|What if he had gone to Europe?|¿Y si hubiera ido a Europa?
Onze tentativas até o leite|Eleven attempts for a taste of milk|Once intentos hasta la leche
O recordista absoluto|The ultimate record holder|El dueño absoluto del récord
Da F1 de volta para casa|From F1 back home|De la F1 de vuelta a casa
O domínio total na América|Total domination in America|El dominio total en América
{0}, a partir de {1}|{0}, from {1}|{0}, a partir de {1}
Kanaan na F1 dos anos 90|Kanaan in 1990s F1|Kanaan en la F1 de los años 90
Barrichello na Stock, 2012|Barrichello in Stock Car, 2012|Barrichello en Stock Car, 2012
Piloto de capacete no cockpit de um monoposto|Helmeted driver in a single-seater cockpit|Piloto con casco en el habitáculo de un monoplaza
Equipe trocando os pneus de um carro vermelho num pit stop|Team changing tyres on a red car during a pit stop|Equipo cambiando los neumáticos de un coche rojo en boxes
Alberto Ascari contornando uma curva em Zandvoort, 1953|Alberto Ascari taking a corner at Zandvoort, 1953|Alberto Ascari en una curva de Zandvoort, 1953
Jackie Stewart levantando água na reta de Zandvoort, 1968|Jackie Stewart in the spray on the Zandvoort straight, 1968|Jackie Stewart levantando agua en la recta de Zandvoort, 1968
Niki Lauda na Ferrari seguido de Jarier em Zandvoort, 1975|Niki Lauda's Ferrari followed by Jarier at Zandvoort, 1975|Niki Lauda en Ferrari seguido de Jarier en Zandvoort, 1975
Ayrton Senna no Lotus 97T preto e dourado, 1985|Ayrton Senna in the black and gold Lotus 97T, 1985|Ayrton Senna en el Lotus 97T negro y dorado, 1985
Alain Prost no cockpit da Ferrari em Phoenix, 1990|Alain Prost in the Ferrari cockpit at Phoenix, 1990|Alain Prost en el habitáculo de Ferrari en Phoenix, 1990
Michael Schumacher na Ferrari F2004 em Silverstone, 2004|Michael Schumacher in the Ferrari F2004 at Silverstone, 2004|Michael Schumacher en el Ferrari F2004 en Silverstone, 2004
Lewis Hamilton na Mercedes em Silverstone, 2016|Lewis Hamilton in the Mercedes at Silverstone, 2016|Lewis Hamilton en Mercedes en Silverstone, 2016
Max Verstappen soltando faíscas no Red Bull Ring, 2023|Max Verstappen throwing sparks at the Red Bull Ring, 2023|Max Verstappen soltando chispas en el Red Bull Ring, 2023
Foto: Carlos Sainz em Zandvoort, 2024, por Steffen Prößdorf (CC BY-SA 4.0)|Photo: Carlos Sainz at Zandvoort, 2024, by Steffen Prößdorf (CC BY-SA 4.0)|Foto: Carlos Sainz en Zandvoort, 2024, por Steffen Prößdorf (CC BY-SA 4.0)
Filme de 1906: um carro na pista de tábuas do primeiro Grand Prix, na França|1906 film: a car on the board track at the first Grand Prix in France|Película de 1906: un coche en la pista de tablas del primer Grand Prix en Francia
  `.trim().split('\n').map(line => line.trim().split('|'));
  for(const [lang, column] of [['en',1], ['es',2]]){
    window.VDO_LOCALES[lang].pairs.push(...rows.map(row => [row[0], row[column]]));
  }
})();
