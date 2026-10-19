/* Textos de formação, pré-temporada e personalidade. */
(function(){
  const rows = `
A Fórmula 1 premia a volta rápida e o melhor carro.|Formula 1 rewards a fast lap and the best car.|La Fórmula 1 premia la vuelta rápida y el mejor coche.
Na IndyCar o carro é quase igual para todo mundo, e o oval é outro esporte.|In IndyCar, the cars are almost equal, and ovals are a different sport.|En IndyCar, los coches son casi iguales y los óvalos son otro deporte.
Quinhentas milhas em pelotão: sobreviver vale mais do que ser rápido.|Five hundred miles in a pack: survival matters more than speed.|Quinientas millas en pelotón: sobrevivir importa más que ser rápido.
A Fórmula E se decide na energia, e o mais rápido raramente ganha.|Formula E is decided by energy, and the fastest rarely wins.|La Fórmula E se decide con la energía y el más rápido rara vez gana.
No DTM os carros são irmãos e o para-lama resolve o que o motor não resolve.|In DTM, the cars are siblings and bodywork settles what the engine cannot.|En DTM, los coches son hermanos y la carrocería resuelve lo que no resuelve el motor.
Stock Car: grid invertido, carro igual e ninguém dá passagem.|Stock Car: reverse grids, equal cars and nobody giving way.|Stock Car: parrilla invertida, coches iguales y nadie cede el paso.
No endurance a corrida é longa demais para um herói e curta demais para um erro.|In endurance, the race is too long for a hero and too short for a mistake.|En resistencia, la carrera es demasiado larga para un héroe y demasiado corta para un error.
Meteoro|Meteor|Meteoro
Metrônomo|Metronome|Metrónomo
Piloto de corrida|Race specialist|Piloto de carreras
Especialista de sábado|Qualifying specialist|Especialista del sábado
Bate e leva|Bump and run|Golpea y pasa
Irregular|Inconsistent|Irregular
Voa numa volta e joga corridas fora.|Flies over one lap and throws races away.|Vuela a una vuelta y tira carreras por la borda.
Nunca é o mais rápido e nunca falta.|Never the fastest, always there.|Nunca es el más rápido y nunca falla.
Larga mal e chega bem.|Starts poorly, finishes well.|Sale mal y termina bien.
Pole atrás de pole, domingo esquecível.|Pole after pole, forgettable Sundays.|Pole tras pole, domingos para olvidar.
Ninguém passa por ele. Nem ele passa incólume.|Nobody gets past him. He does not escape unscathed either.|Nadie lo adelanta. Él tampoco sale ileso.
Bom em tudo, excepcional em nada.|Good at everything, exceptional at nothing.|Bueno en todo, excepcional en nada.
Um fim de semana genial, três esquecíveis.|One brilliant weekend, three forgettable ones.|Un fin de semana genial y tres para olvidar.
ovais|ovals|óvalos
circuitos rápidos|fast circuits|circuitos rápidos
circuitos de rua|street circuits|circuitos urbanos
Homem da chuva|Rain master|Maestro de la lluvia
Quando a pista molha, você vira outro piloto.|When the track gets wet, you become a different driver.|Cuando se moja la pista, te conviertes en otro piloto.
Na chuva você tem andado acima do que o carro permite.|You have been outperforming the car in the wet.|Bajo la lluvia rindes por encima de lo que permite el coche.
Uma volta só|One-lap wonder|Una sola vuelta
Você monta uma volta perfeita quando precisa. Manter isso 60 voltas é outra história.|You deliver a perfect lap when needed. Keeping it up for 60 laps is another story.|Haces una vuelta perfecta cuando hace falta. Mantenerlo 60 vueltas es otra historia.
Você larga sempre à frente do que o carro justifica.|You consistently qualify ahead of the car's potential.|Siempre sales por delante de lo que justifica el coche.
Piloto de domingo|Sunday driver|Piloto del domingo
Você não é o mais rápido no sábado. No domingo, o cronômetro esquece disso.|You are not the fastest on Saturday. On Sunday, the stopwatch forgets that.|No eres el más rápido el sábado. El domingo, el cronómetro lo olvida.
Você tem ganhado posições em quase toda corrida.|You have been gaining places in almost every race.|Ganas posiciones en casi todas las carreras.
Sangue-frio|Cool under pressure|Sangre fría
Quanto mais pesa o momento, mais limpo você anda.|The higher the pressure, the cleaner you drive.|Cuanto mayor es la presión, más limpio conduces.
Você não erra quando está sob pressão. Nunca.|You never make mistakes under pressure.|Nunca cometes errores bajo presión.
Mão pesada|Heavy handed|Mano pesada
Você tira do carro o que ele não tem, e o carro cobra.|You demand more than the car has, and it pays you back.|Exiges más de lo que tiene el coche y este te pasa factura.
Seu carro quebra mais que o do seu companheiro, e não é azar.|Your car breaks more often than your teammate's, and it is not bad luck.|Tu coche se rompe más que el de tu compañero y no es mala suerte.
Cuida do pneu|Tyre whisperer|Cuida los neumáticos
Você chega no fim do stint com borracha que ninguém mais tem.|You reach the end of the stint with grip nobody else has.|Llegas al final del stint con goma que nadie más conserva.
Você cresce no fim das corridas longas.|You get stronger towards the end of long races.|Mejoras al final de las carreras largas.
Larga como poucos|Exceptional starter|Gran salida
Os primeiros duzentos metros são seus.|The first two hundred metres are yours.|Los primeros doscientos metros son tuyos.
Você ganha posições na primeira volta com frequência demais para ser sorte.|You gain places on the first lap too often for it to be luck.|Ganas posiciones en la primera vuelta demasiado a menudo para ser suerte.
Racha sob pressão|Cracks under pressure|Cede bajo presión
Quando o campeonato aperta, alguma coisa em você cede.|When the championship gets tight, something gives.|Cuando se aprieta el campeonato, algo en ti cede.
Nas corridas que mais valiam, você foi pior do que era.|In the races that mattered most, you underperformed.|En las carreras más importantes rendiste por debajo de tu nivel.
Não escuta ninguém|Listens to nobody|No escucha a nadie
Você monta o carro do seu jeito. Às vezes o seu jeito é melhor.|You set the car up your way. Sometimes your way is better.|Preparas el coche a tu manera. A veces tu manera es mejor.
Você parou de seguir o engenheiro faz tempo.|You stopped following the engineer a long time ago.|Hace tiempo que dejaste de seguir al ingeniero.
Se move bem no paddock|Well connected|Se mueve bien por el paddock
Você aprendeu a falar com quem decide.|You learned how to talk to the decision-makers.|Aprendiste a hablar con quienes deciden.
Portas se abrem para você antes de você bater nelas.|Doors open before you even knock.|Las puertas se abren antes de que llames.
Não abre mão|Never gives way|No cede
Ninguém passa por fora em você. Isso custa lataria.|Nobody goes around your outside. It costs bodywork.|Nadie te adelanta por fuera. Eso cuesta carrocería.
Você tem se metido em briga de roda demais.|You have been getting into too many wheel-to-wheel fights.|Te metes en demasiadas luchas rueda a rueda.
Metódico|Methodical|Metódico
Você virou parte do time técnico sem deixar de ser piloto.|You became part of the technical team while remaining a driver.|Te convertiste en parte del equipo técnico sin dejar de ser piloto.
Seu acerto tem sido melhor que o da garagem ao lado.|Your setup has been better than the other side of the garage.|Tu puesta a punto ha sido mejor que la del otro lado del garaje.
Morar perto da fábrica|Live near the factory|Vivir cerca de la fábrica
Você aparece todo dia, atrapalha, pergunta e aprende. Some da própria vida por quatro meses.|You show up every day, get in the way, ask and learn. Your own life disappears for four months.|Apareces cada día, molestas, preguntas y aprendes. Tu propia vida desaparece durante cuatro meses.
Você saiu da pré-temporada sabendo desenhar meia asa. A engenharia passou a te tratar como par.|You left pre-season able to design half a wing. Engineering started treating you as an equal.|Saliste de la pretemporada sabiendo diseñar media ala. Ingeniería empezó a tratarte como a un igual.
Você entendeu o carro de um jeito que não entendia. Ninguém mais fala com você em outubro.|You understood the car in a new way. Nobody else talks to you by October.|Entendiste el coche de una forma nueva. Nadie más te habla en octubre.
Quatro meses de reunião. Você aprendeu o suficiente para não ser ignorado.|Four months of meetings. You learned enough not to be ignored.|Cuatro meses de reuniones. Aprendiste lo suficiente para que no te ignoren.
Você atrapalhou mais do que ajudou, e a engenharia deixou isso claro em fevereiro.|You hindered more than you helped, and engineering made that clear in February.|Molestaste más de lo que ayudaste e ingeniería lo dejó claro en febrero.
Preparador físico de verdade|A professional fitness coach|Un preparador físico profesional
Um profissional caro, com um plano que não tem folga. Pescoço, coração, sono, comida.|An expensive professional with a relentless plan. Neck, heart, sleep, food.|Un profesional caro con un plan sin descanso. Cuello, corazón, sueño y comida.
Você chegou em março com um corpo que aguenta a última volta como aguenta a primeira.|You reached March fit enough to handle the last lap like the first.|Llegaste a marzo con un cuerpo que aguanta la última vuelta como la primera.
A diferença aparece na segunda metade de cada corrida.|The difference shows in the second half of every race.|La diferencia aparece en la segunda mitad de cada carrera.
Você seguiu o plano até dezembro. Depois foi seguindo mais ou menos.|You followed the plan until December. After that, more or less.|Seguiste el plan hasta diciembre. Después, más o menos.
Você exagerou e passou fevereiro parado com uma lesão idiota.|You overdid it and spent February sidelined by a silly injury.|Te excediste y pasaste febrero parado por una lesión absurda.
Simulador até enjoar|Simulator until you drop|Simulador hasta hartarse
Todo traçado do calendário, mil voltas cada, até a mão saber sozinha.|Every track on the calendar, a thousand laps each, until your hands know the way.|Cada trazado del calendario, mil vueltas en cada uno, hasta que tus manos se lo sepan.
Você chega em cada pista nova já sabendo onde o carro reclama.|You arrive at every new track knowing where the car will struggle.|Llegas a cada pista sabiendo dónde se quejará el coche.
A primeira sessão de cada fim de semana deixou de ser desperdício.|The first session of each weekend is no longer wasted.|La primera sesión de cada fin de semana dejó de desperdiciarse.
Muita volta, pouco proveito: o simulador da equipe não é dos melhores.|Many laps, little benefit: the team's simulator is not very good.|Muchas vueltas y poco provecho: el simulador del equipo no es de los mejores.
Você decorou o simulador, não a pista. Em março a diferença ficou embaraçosa.|You memorised the simulator rather than the track. By March, the difference was embarrassing.|Memorizaste el simulador en vez de la pista. En marzo, la diferencia fue vergonzosa.
Temporada paralela em outra categoria|Race in another series over winter|Correr en otra categoría durante el invierno
Correr de verdade na pré-temporada: carro diferente, gente diferente, risco de verdade.|Real pre-season racing: a different car, different people and real risk.|Carreras de verdad en pretemporada: otro coche, otra gente y riesgo real.
Você voltou com quilometragem de corrida que nenhum simulador dá — e com uma taça.|You returned with race mileage no simulator can provide, and a trophy.|Volviste con kilómetros de carrera que ningún simulador ofrece y con una copa.
Duas corridas boas, uma ruim, e uma leitura de corrida melhor do que a de dezembro.|Two good races, one poor one, and better racecraft than in December.|Dos carreras buenas, una mala y una lectura de carrera mejor que en diciembre.
Carro ruim, resultado ruim, e a pré-temporada passou.|A bad car, bad results, and pre-season was over.|Mal coche, malos resultados y se acabó la pretemporada.
Batida feia na terceira etapa. Você começa a temporada se recuperando.|A nasty crash in round three. You start the season recovering.|Un fuerte accidente en la tercera prueba. Empiezas la temporada recuperándote.
Semanas de kart na chuva|Weeks of wet-weather karting|Semanas de karting bajo la lluvia
Uma pista pequena, um kart velho e água. Barato, humilhante e eficiente.|A small track, an old kart and water. Cheap, humbling and effective.|Una pista pequeña, un kart viejo y agua. Barato, humillante y eficaz.
Você achou a aderência onde não havia. Vai fazer diferença num domingo qualquer.|You found grip where there was none. It will make a difference one Sunday.|Encontraste agarre donde no lo había. Marcará la diferencia algún domingo.
A sensibilidade de traseira melhorou muito.|Your feel for the rear improved greatly.|Mejoró mucho tu sensibilidad con el tren trasero.
Choveu pouco. Você treinou no seco a maior parte do tempo.|There was little rain. You trained in the dry most of the time.|Llovió poco. Entrenaste en seco casi todo el tiempo.
Você pegou os piores karts da Europa e passou a pré-temporada com raiva.|You got Europe's worst karts and spent pre-season angry.|Te tocaron los peores karts de Europa y pasaste la pretemporada enfadado.
Sumir do mundo por dois meses|Disappear for two months|Desaparecer durante dos meses
Nem fábrica, nem academia, nem imprensa. Gente que você quase esqueceu que existia.|No factory, no gym, no press. People you almost forgot existed.|Sin fábrica, gimnasio ni prensa. Gente que casi olvidaste que existía.
Você voltou inteiro de um jeito que não sabia que precisava. A cabeça faz o resto.|You returned refreshed in a way you never knew you needed. Your mind does the rest.|Volviste renovado de una forma que no sabías que necesitabas. La cabeza hace el resto.
Descanso de verdade. Março começou leve.|Real rest. March began with a clear head.|Descanso de verdad. Marzo empezó con la mente despejada.
Você descansou e se sentiu culpado o tempo todo.|You rested and felt guilty the whole time.|Descansaste y te sentiste culpable todo el tiempo.
Você sumiu, a equipe estranhou, e alguém comentou com a imprensa.|You disappeared, the team noticed, and someone told the press.|Desapareciste, el equipo lo notó y alguien se lo contó a la prensa.
Temporada de eventos e entrevistas|A winter of events and interviews|Un invierno de eventos y entrevistas
Aparecer. Falar. Ser lembrado por quem assina contrato e por quem paga a conta.|Show up. Talk. Be remembered by those who sign contracts and pay the bills.|Aparecer. Hablar. Ser recordado por quienes firman contratos y pagan las cuentas.
Seu nome circulou a pré-temporada inteira. Duas portas se abriram sem você bater.|Your name circulated all winter. Two doors opened without you knocking.|Tu nombre circuló toda la pretemporada. Se abrieron dos puertas sin que llamaras.
Você virou nome conhecido fora do paddock.|You became a recognised name outside the paddock.|Te hiciste conocido fuera del paddock.
Muito avião, pouca repercussão.|Lots of flights, little impact.|Muchos vuelos y poca repercusión.
Uma frase mal colocada em janeiro rendeu manchete até março.|One ill-judged remark in January made headlines until March.|Una frase mal elegida en enero dio titulares hasta marzo.
Em você|On yourself|En ti
A pré-temporada inteira é sua. A equipe que se vire com o carro.|The whole pre-season is yours. The team can handle the car.|La pretemporada es tuya. Que el equipo se ocupe del coche.
Você evolui mais rápido e a fábrica sente a sua falta.|You develop faster and the factory misses you.|Evolucionas más rápido y la fábrica nota tu ausencia.
Dividido|Split your time|Repartido
Metade no seu preparo, metade dentro da equipe.|Half on your preparation, half with the team.|Mitad en tu preparación y mitad con el equipo.
Nem um extremo nem outro.|Neither extreme.|Ni un extremo ni el otro.
Na equipe|On the team|En el equipo
Você entrega a pré-temporada para a fábrica e para o desenvolvimento do carro.|You devote pre-season to the factory and car development.|Dedicas la pretemporada a la fábrica y al desarrollo del coche.
O carro melhora, a relação melhora, e você evolui menos.|The car and relationship improve, while you develop less.|Mejoran el coche y la relación, pero tú evolucionas menos.
Orgulhoso|Proud|Orgulloso
Não admite erro na frente dos outros. Em particular, às vezes admite.|Never admits mistakes in public. Sometimes does in private.|No admite errores delante de los demás. En privado, a veces sí.
Leal|Loyal|Leal
Fica do seu lado enquanto você ficar do lado dele.|Stays on your side as long as you stay on his.|Se queda a tu lado mientras tú te quedes al suyo.
Ambicioso|Ambitious|Ambicioso
Você é degrau ou obstáculo. Colega, nunca.|You are a stepping stone or an obstacle. Never a colleague.|Eres un escalón o un obstáculo. Nunca un compañero.
Veterano cansado|Weary veteran|Veterano cansado
Já viu isso tudo antes e não se impressiona com quase nada.|Has seen it all before and is impressed by almost nothing.|Ya lo ha visto todo y casi nada lo impresiona.
Engenheiro de pista|Race engineer|Ingeniero de pista
Companheiro de equipe|Teammate|Compañero de equipo
Rival|Rival|Rival
Mentor|Mentor|Mentor
Amigo no paddock|Paddock friend|Amigo del paddock
Quem cobre a categoria|Series journalist|Periodista de la categoría
provar que é o melhor da garagem|to prove he is the best in the garage|demostrar que es el mejor del garaje
Ele quer o crédito quando o carro anda. E quer que se saiba.|He wants credit when the car is quick. And wants everyone to know.|Quiere el mérito cuando el coche corre. Y quiere que se sepa.
ser chamado por uma equipe grande|to be hired by a big team|que lo fiche un equipo grande
Você é currículo. Ele vai embora no dia em que der certo.|You are his CV. He leaves the day it works out.|Eres su currículum. Se irá en cuanto funcione.
não perder o emprego|to keep his job|no perder el empleo
Tem família, tem conta, e a equipe demite fácil.|He has a family, bills, and a team that fires easily.|Tiene familia, facturas y un equipo que despide con facilidad.
trabalhar do jeito certo|to work the right way|trabajar de la forma correcta
Detesta improviso. Prefere um segundo a mais e uma resposta correta.|Hates improvisation. Prefers an extra second and the right answer.|Odia improvisar. Prefiere un segundo más y una respuesta correcta.
a sua vaga|your seat|tu asiento
Ele acha que o carro bom é seu e o talento é dele.|He thinks you have the good car and he has the talent.|Cree que tú tienes el buen coche y él el talento.
ser o número um da equipe|to be the team's number one|ser el número uno del equipo
Não é pessoal. É que só cabe um na frente.|It is not personal. There is only room for one at the front.|No es personal. Solo cabe uno delante.
segurar o contrato mais um ano|to keep his contract for another year|conservar el contrato un año más
Está a duas corridas ruins de ficar sem lugar no grid.|Two bad races away from losing his place on the grid.|Está a dos malas carreras de quedarse sin asiento.
ser levado a sério|to be taken seriously|que lo tomen en serio
Cansou de ser o segundo piloto na conversa de todo mundo.|Tired of being everyone's second driver.|Cansado de ser el segundo piloto en boca de todos.
te bater na sua cara|to beat you in front of everyone|ganarte delante de todos
Não quer só vencer. Quer vencer você, e que todos vejam.|He does not just want to win. He wants to beat you where everyone can see.|No solo quiere ganar. Quiere ganarte a ti y que todos lo vean.
o título, com ou sem você|the title, with or without you|el título, contigo o sin ti
Você é obstáculo, não inimigo. O que é pior.|You are an obstacle rather than an enemy. Which is worse.|Eres un obstáculo, no un enemigo. Eso es peor.
provar que o de 2 anos atrás valeu|to prove the result from two years ago mattered|demostrar que lo de hace dos años valió
Carrega uma história antiga com você e não largou.|Carries old history with you and has not let go.|Arrastra una vieja historia contigo y no la ha soltado.
pontos, e rápido|points, quickly|puntos y pronto
Não paga para ouvir explicação. Paga para ver o carro na frente.|Pays for the car to run at the front, not for explanations.|Paga por ver el coche delante, no por escuchar explicaciones.
fechar o orçamento do ano que vem|to fund next year's budget|cerrar el presupuesto del año siguiente
Patrocinador feliz vale mais que pódio azarão.|A happy sponsor matters more than an unlikely podium.|Un patrocinador contento vale más que un podio inesperado.
que a equipe pareça grande|to make the team look big|que el equipo parezca grande
Odeia sair na imprensa por motivo errado.|Hates making the press for the wrong reason.|Odia aparecer en la prensa por el motivo equivocado.
ver alguém fazer o que ele não fez|to see someone achieve what he could not|ver a alguien lograr lo que él no pudo
Parou cedo demais e sabe exatamente onde errou.|Stopped too early and knows exactly where he went wrong.|Se retiró demasiado pronto y sabe dónde se equivocó.
te poupar dos erros dele|to spare you his mistakes|ahorrarte sus errores
Vai falar verdades que ninguém mais tem coragem de falar.|Will tell truths nobody else dares to say.|Dirá verdades que nadie más se atreve a decir.
alguém para conversar no paddock|someone to talk to in the paddock|alguien con quien hablar en el paddock
O circo é solitário para todo mundo, não só para você.|The circus is lonely for everyone, not just you.|El circo es solitario para todos, no solo para ti.
trocar informação|to exchange information|intercambiar información
Ele sabe de coisa. Você também. Isso vale.|He knows things. So do you. That has value.|Él sabe cosas. Tú también. Eso vale.
a informação antes de todo mundo|the information before anyone else|la información antes que nadie
Você é fonte antes de ser assunto. Cuidado com o que fala perto dele.|You are a source before you are a story. Watch what you say around him.|Antes que noticia eres una fuente. Cuidado con lo que dices cerca de él.
contar o que realmente aconteceu|to tell what really happened|contar lo que ocurrió de verdad
Não vai te poupar, e também não vai inventar nada.|Will not spare you, and will not make things up either.|No te perdonará, pero tampoco inventará nada.
a manchete que roda o mundo|the headline that travels the world|el titular que da la vuelta al mundo
A sua carreira é matéria-prima. Boa ou ruim, tanto faz.|Your career is raw material. Good or bad makes no difference.|Tu carrera es materia prima. Buena o mala, le da igual.
ser o jornalista de confiança de alguém|to be someone's trusted journalist|ser el periodista de confianza de alguien
Quer estar por dentro, e paga com cobertura generosa.|Wants inside access, and pays with generous coverage.|Quiere información interna y paga con cobertura generosa.
  `.trim().split('\n').map(line => line.trim().split('|'));
  for(const [lang, column] of [['en',1],['es',2]]) window.VDO_LOCALES[lang].pairs.push(...rows.map(row => [row[0],row[column]]));
})();
