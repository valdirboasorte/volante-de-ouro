/* Decisões de carreira e mensagens da corrida. */
(function(){
  const rows = `
O briefing acabou e a garagem esvaziou.|The briefing is over and the garage is empty.|Terminó la reunión y el garaje se vació.
Sentar com ele depois do briefing|Sit down with him after the briefing|Sentarse con él después de la reunión
"Me explica o que você viu no dado."|"Explain what you saw in the data."|"Explícame qué viste en los datos."
"Foi mal, o erro de ontem foi meu."|"Sorry, yesterday's mistake was mine."|"Lo siento, el error de ayer fue mío."
"Preciso que você me dê um carro melhor."|"I need you to give me a better car."|"Necesito que me des un coche mejor."
Fora do circuito as pessoas falam outra coisa.|People talk differently away from the circuit.|Fuera del circuito la gente habla de otras cosas.
Chamar para jantar fora do circuito|Invite him to dinner away from the circuit|Invitarlo a cenar fuera del circuito
Falar de tudo, menos de corrida|Talk about anything except racing|Hablar de todo menos de carreras
Perguntar o que ele quer da carreira dele|Ask what he wants from his career|Preguntar qué quiere de su carrera
Prometer que leva ele junto se você subir|Promise to take him with you if you move up|Prometer llevártelo contigo si asciendes
O acerto do fim de semana não funcionou, e os dois sabem.|The weekend's setup did not work, and you both know it.|La puesta a punto no funcionó y ambos lo sabéis.
Cobrar o acerto que não funcionou|Challenge him over the failed setup|Reclamar por la puesta a punto fallida
Cobrar na frente da equipe|Confront him in front of the team|Reclamar delante del equipo
Chamar num canto e falar sério|Take him aside for a serious talk|Hablar en serio con él en privado
Assumir junto: "erramos os dois"|Share responsibility: "we both got it wrong"|Compartir la responsabilidad: "nos equivocamos los dos"
Metade da garagem é dele. Metade da informação também.|Half the garage is his. So is half the information.|La mitad del garaje es suya. La mitad de la información también.
Falar sobre dividir dados|Discuss sharing data|Hablar de compartir datos
Abrir os seus primeiro|Share yours first|Compartir los tuyos primero
Propor troca, item por item|Propose an exchange, item by item|Proponer un intercambio, punto por punto
Não propor nada e observar o que ele faz|Say nothing and watch what he does|No proponer nada y observar qué hace
Cedo ou tarde vocês dois vão brigar pela mesma curva.|Sooner or later, you will fight for the same corner.|Tarde o temprano lucharéis por la misma curva.
Falar sobre ordem de equipe|Discuss team orders|Hablar de las órdenes de equipo
Propor: quem estiver melhor no campeonato tem prioridade|Propose priority for whoever leads in the championship|Proponer prioridad para quien vaya mejor en el campeonato
Deixar claro que você não vai dar passagem nunca|Make it clear you will never give way|Dejar claro que nunca cederás el paso
Oferecer apoio a ele este ano em troca do ano que vem|Offer support this year in exchange for next year|Ofrecer apoyo este año a cambio del siguiente
O toque da última corrida ainda não foi resolvido.|The contact in the last race remains unresolved.|El toque de la última carrera sigue sin resolverse.
Resolver o toque da última corrida|Resolve the contact from the last race|Resolver el toque de la última carrera
Pedir desculpa mesmo achando que não foi culpa sua|Apologise even though you think it was not your fault|Disculparte aunque creas que no fue tu culpa
Bater de frente: "foi você e você sabe"|Confront him: "it was you and you know it"|Enfrentarte: "fuiste tú y lo sabes"
Não falar nada e deixar a equipe resolver|Say nothing and let the team decide|No decir nada y dejar que el equipo decida
Tem gente olhando, e ele sabe disso.|People are watching, and he knows it.|Hay gente mirando y él lo sabe.
Encarar o rival no paddock|Face your rival in the paddock|Encarar al rival en el paddock
Estender a mão|Offer a handshake|Tender la mano
Provocar de volta|Provoke him back|Devolver la provocación
Não dizer nada e prometer para si mesmo resolver na pista|Stay silent and promise yourself to settle it on track|Callarte y prometerte resolverlo en la pista
Ele não está aqui para fazer você se sentir bem.|He is not here to make you feel good.|No está aquí para hacerte sentir bien.
Ouvir o que ele tem para dizer|Listen to what he has to say|Escuchar lo que tenga que decir
"Fala. Sem filtro."|"Say it. No filter."|"Habla. Sin filtro."
Contar o que está te travando de verdade|Tell him what is really holding you back|Contarle qué te está frenando de verdad
Pedir para ele abrir portas|Ask him to open doors|Pedirle que te abra puertas
Ninguém fala de contrato na hora certa. Fala antes ou tarde demais.|Nobody talks contracts at the right time. It is early or too late.|Nadie habla de contratos en el momento justo. Es pronto o demasiado tarde.
Falar de contrato antes da hora|Bring up your contract early|Hablar del contrato antes de tiempo
Mostrar números: seus resultados contra o companheiro|Show the numbers: your results against your teammate|Mostrar cifras: tus resultados frente a tu compañero
Pedir garantia de igualdade de material|Ask for a guarantee of equal equipment|Pedir garantías de igualdad de material
Ameaçar procurar o mercado|Threaten to look elsewhere|Amenazar con buscar en el mercado
Informação no paddock circula em troca de informação.|Information in the paddock is traded for information.|La información en el paddock se intercambia por información.
Trocar informação no motorhome|Exchange information in the motorhome|Intercambiar información en el motorhome
Perguntar o que se fala de você no paddock|Ask what the paddock says about you|Preguntar qué se dice de ti en el paddock
Passar uma informação sua para ganhar crédito|Share inside information to earn credit|Compartir información interna para ganar crédito
Ele quer o crédito|He wants the credit|Quiere el mérito
— Se der certo domingo, fala do carro na entrevista. Fala da equipe de pista. Não fala só de você.|— If Sunday goes well, mention the car in the interview. Mention the track team. Do not just talk about yourself.|— Si el domingo sale bien, habla del coche en la entrevista. Habla del equipo de pista. No hables solo de ti.
Falar dele na entrevista|Mention him in the interview|Mencionarlo en la entrevista
Falar da equipe, sem citar ninguém|Praise the team without naming anyone|Hablar del equipo sin citar a nadie
Levar o crédito todo|Take all the credit|Llevarte todo el mérito
Ele recebeu uma proposta|He has received an offer|Ha recibido una oferta
— Me chamaram de uma equipe grande. Eu vou, a não ser que você me dê um motivo para ficar.|— A big team called. I am going unless you give me a reason to stay.|— Me llamó un equipo grande. Me voy, salvo que me des un motivo para quedarme.
Pedir para ele ficar, e prometer levá-lo junto um dia|Ask him to stay and promise to take him with you one day|Pedirle que se quede y prometer llevarlo contigo algún día
Falar com o chefe para cobrir a proposta|Ask the boss to match the offer|Pedir al jefe que iguale la oferta
Desejar boa sorte|Wish him good luck|Desearle buena suerte
Ele quer o seu lugar, e não esconde mais|He wants your seat and no longer hides it|Quiere tu asiento y ya no lo oculta
— Um de nós dois não fica aqui ano que vem. Você sabe disso tão bem quanto eu.|— One of us will not be here next year. You know it as well as I do.|— Uno de los dos no estará aquí el año que viene. Lo sabes tan bien como yo.
"Então que seja na pista"|"Then let us settle it on track"|"Entonces que sea en la pista"
Propor uma trégua até o meio do ano|Propose a truce until mid-season|Proponer una tregua hasta mitad de año
Ir ao chefe antes dele|Go to the boss before he does|Ir al jefe antes que él
Ele está afundando e pediu ajuda|He is struggling and has asked for help|Se está hundiendo y ha pedido ayuda
— Se eu não pontuar em três corridas, estou fora. Me ajuda com o acerto. Eu sei o que estou pedindo.|— If I do not score in three races, I am out. Help with my setup. I know what I am asking.|— Si no puntúo en tres carreras, estoy fuera. Ayúdame con la puesta a punto. Sé lo que estoy pidiendo.
Ajudar de verdade|Give real help|Ayudar de verdad
Ajudar pela metade|Give limited help|Ayudar a medias
Não ajudar|Do not help|No ayudar
O patrocinador quer você um dia inteiro|The sponsor wants you for a whole day|El patrocinador te quiere un día entero
— Segunda-feira, evento em Milão, dia inteiro. Sei que você ia treinar. Eu preciso que você vá.|— Monday, an all-day event in Milan. I know you planned to train. I need you there.|— El lunes, evento en Milán todo el día. Sé que ibas a entrenar. Necesito que vayas.
Ir, e ser bom no evento|Attend and make a good impression|Ir y hacerlo bien en el evento
Ir de corpo presente|Attend without enthusiasm|Ir solo de cuerpo presente
Recusar e treinar|Decline and train|Rechazar y entrenar
Ele quer saber se você está levando a sério|He wants to know if you are taking this seriously|Quiere saber si te lo tomas en serio
— Eu abri portas para você. Agora me diz, olhando na minha cara, onde você quer estar em três anos.|— I opened doors for you. Now look me in the eye and tell me where you want to be in three years.|— Te abrí puertas. Ahora mírame a los ojos y dime dónde quieres estar en tres años.
Dizer a verdade, inclusive o medo|Tell the truth, including your fears|Decir la verdad, incluido el miedo
Dizer o que ele quer ouvir|Say what he wants to hear|Decir lo que quiere oír
"Não devo satisfação a ninguém"|"I owe nobody an explanation"|"No debo explicaciones a nadie"
Convite para a noite|A night out|Invitación para salir
Terminada a etapa, metade do paddock vai para uma festa na cidade. Você tem treino de simulador marcado para as sete da manhã.|After the race, half the paddock is going to a party in town. You have simulator training at seven in the morning.|Después de la carrera, medio paddock va a una fiesta en la ciudad. Tienes simulador a las siete de la mañana.
Vai, e fica até o fim|Go and stay until the end|Ir y quedarse hasta el final
A noite é boa. O simulador de amanhã não vai ser.|A good night out. Tomorrow's simulator session will not be.|La noche será buena. El simulador de mañana no.
Aparece uma hora e sai|Show up for an hour and leave|Aparecer una hora y marcharse
Mostra a cara, aperta as mãos certas e dorme cedo.|Show your face, shake the right hands and sleep early.|Aparecer, estrechar las manos adecuadas y dormir pronto.
Não vai|Do not go|No ir
Sete da manhã, simulador, ninguém por perto.|Seven in the morning, the simulator, nobody around.|Siete de la mañana, simulador y nadie cerca.
Provocação pública|Public provocation|Provocación pública
Um piloto do grid disse numa entrevista que você "anda bem em pista fácil". A frase viralizou.|A driver said in an interview that you are "good on easy tracks". The remark went viral.|Un piloto dijo en una entrevista que "se te dan bien las pistas fáciles". La frase se hizo viral.
Responde na mesma moeda|Respond in kind|Responder de la misma manera
A imprensa adora. Ele também não vai esquecer.|The press loves it. He will not forget either.|A la prensa le encanta. Él tampoco lo olvidará.
Responde na pista|Answer on the track|Responder en la pista
Nada de declaração. Você guarda.|No statement. You remember.|Sin declaraciones. Lo guardas.
Ignora|Ignore it|Ignorar
Não vale a energia.|It is not worth the energy.|No merece tu energía.
Um ex-piloto se oferece para ajudar|A former driver offers help|Un expiloto se ofrece a ayudar
Um nome respeitado, já aposentado, procurou você. Diz que vê algo ali e quer acompanhar sua temporada de perto — sem cobrar nada por enquanto.|A respected retired driver approached you. He sees something in you and wants to follow your season closely, without charging for now.|Un piloto retirado y respetado se acercó a ti. Ve algo en ti y quiere seguir tu temporada de cerca, sin cobrar por ahora.
Aceita a ajuda|Accept the help|Aceptar la ayuda
Ele vai falar verdades que ninguém mais fala.|He will tell truths nobody else will.|Dirá verdades que nadie más dice.
Agradece e recusa|Thank him and decline|Agradecer y rechazar
Você prefere fazer do seu jeito.|You prefer to do things your way.|Prefieres hacerlo a tu manera.
Cobrança em casa|Pressure at home|Presión en casa
Sua família hipotecou coisas para você chegar até aqui e o assunto veio à mesa no jantar.|Your family mortgaged possessions to get you here, and it came up over dinner.|Tu familia hipotecó bienes para que llegaras hasta aquí y el tema salió durante la cena.
Manda dinheiro para casa|Send money home|Enviar dinero a casa
É o mínimo. E é caro.|It is the least you can do. And expensive.|Es lo mínimo. Y sale caro.
Promete que vai valer a pena|Promise it will be worth it|Prometer que valdrá la pena
Palavras custam menos e pesam mais.|Words cost less and weigh more.|Las palabras cuestan menos y pesan más.
Muda de assunto|Change the subject|Cambiar de tema
Você não tem o que responder agora.|You have no answer right now.|Ahora no tienes respuesta.
Entrevista difícil|A difficult interview|Entrevista difícil
Um jornalista pergunta, ao vivo, se você não está ali só porque alguém paga a sua vaga.|A journalist asks live whether you are only here because someone pays for your seat.|Un periodista pregunta en directo si solo estás aquí porque alguien paga tu asiento.
Sai da entrevista|Walk out of the interview|Abandonar la entrevista
Vira manchete. Da pior forma.|You make headlines. In the worst way.|Sales en los titulares. De la peor forma.
Responde com números|Answer with results|Responder con cifras
Você lista os resultados. Frio e certeiro.|You list the results. Cold and precise.|Enumeras los resultados. Frío y preciso.
Concorda em parte|Partly agree|Estar de acuerdo en parte
Honestidade desarma. E custa um pouco.|Honesty disarms people. And costs a little.|La honestidad desarma. Y cuesta un poco.
Proposta de investimento|Investment offer|Propuesta de inversión
Um conhecido do paddock oferece participação numa rede de kartódromos. Parece bom demais.|A paddock acquaintance offers a stake in a kart circuit business. It seems too good.|Un conocido del paddock ofrece participación en una red de kartódromos. Parece demasiado bueno.
Entra com tudo que pode|Invest all you can|Invertir todo lo posible
Alto risco, alto retorno.|High risk, high return.|Alto riesgo, alto rendimiento.
Entra com pouco|Invest a little|Invertir poco
O suficiente para não doer se der errado.|Little enough not to hurt if it fails.|Lo suficiente para que no duela si sale mal.
Passa|Pass on it|Dejarlo pasar
Você já tem risco suficiente no trabalho.|Your job already has enough risk.|Tu trabajo ya tiene suficiente riesgo.
Atrito na garagem|Friction in the garage|Roce en el garaje
Seu companheiro de equipe reclamou publicamente que você recebe peça nova antes dele. Não é verdade — mas a equipe não desmentiu.|Your teammate complained publicly that you get new parts first. It is untrue, but the team has not denied it.|Tu compañero se quejó públicamente de que recibes piezas nuevas antes que él. No es verdad, pero el equipo no lo desmintió.
Exige que a equipe se pronuncie|Demand a statement from the team|Exigir que el equipo se pronuncie
Você tem razão. E vai cobrar por ela.|You are right, and will demand recognition.|Tienes razón y vas a reclamarla.
Conversa com ele em particular|Talk to him privately|Hablar con él en privado
Sem plateia, sem manchete.|No audience, no headlines.|Sin público ni titulares.
Deixa passar|Let it go|Dejarlo pasar
Não vale a briga agora.|It is not worth a fight now.|Ahora no merece una pelea.
Compromisso com patrocinador|Sponsor commitment|Compromiso con un patrocinador
Um patrocinador quer você numa convenção de vendas na quinta-feira antes da corrida. Do outro lado do país.|A sponsor wants you at a sales convention on Thursday before the race, across the country.|Un patrocinador te quiere en una convención el jueves anterior a la carrera, al otro lado del país.
Vai e sorri o dia inteiro|Go and smile all day|Ir y sonreír todo el día
Eles pagam a conta. Você paga com cansaço.|They pay the bills. You pay in fatigue.|Ellos pagan las facturas. Tú pagas con cansancio.
Manda um vídeo gravado|Send a recorded video|Enviar un vídeo grabado
Meio-termo que ninguém adora.|A compromise nobody loves.|Un término medio que no entusiasma a nadie.
Recusa: fim de semana de corrida|Decline: it is a race weekend|Rechazar: es fin de semana de carrera
Profissionalismo tem preço.|Professionalism has a price.|La profesionalidad tiene un precio.
Queda no treino|A training accident|Caída en el entrenamiento
Andando de bicicleta na preparação, você caiu feio. O médico fala em duas semanas de repouso.|You had a nasty cycling fall while training. The doctor recommends two weeks of rest.|Sufriste una fuerte caída en bicicleta entrenando. El médico recomienda dos semanas de reposo.
Cumpre o repouso|Take the prescribed rest|Cumplir el reposo
Perde uma etapa e volta inteiro.|Miss one round and return fit.|Pierdes una prueba y vuelves recuperado.
Corre dopado de analgésico|Race on painkillers|Correr con analgésicos
Ninguém precisa saber.|Nobody needs to know.|Nadie tiene por qué saberlo.
Uma carta|A letter|Una carta
Uma criança escreveu dizendo que começou a andar de kart por sua causa. Mandou junto um desenho do seu carro.|A child wrote saying they started karting because of you, enclosing a drawing of your car.|Un niño escribió que empezó en karting por ti y adjuntó un dibujo de tu coche.
Responde e convida para os boxes|Reply and invite them to the pits|Responder e invitar a boxes
Custa um dia e vale um ano.|Costs a day, worth a year.|Cuesta un día y vale un año.
Responde por carta|Reply by letter|Responder por carta
Um envelope, dez minutos.|One envelope, ten minutes.|Un sobre y diez minutos.
Não vê a tempo|Do not see it in time|No verla a tiempo
A caixa de correio tem centenas dessas.|There are hundreds like it in the mailbox.|Hay cientos de cartas así en el buzón.
Telefonema de outro campeonato|A call from another series|Llamada de otro campeonato
Uma equipe de outra categoria ligou. Oferecem vaga paga para o ano que vem — agora, antes de você terminar a temporada.|A team from another series called. A paid seat for next year, offered before you finish this season.|Llamó un equipo de otra categoría. Ofrecen un asiento pagado para el año siguiente, antes de que termines esta temporada.
Escuta e agradece|Listen and thank them|Escuchar y agradecer
Guarda o número. Nunca se sabe.|Keep the number. You never know.|Guarda el número. Nunca se sabe.
Diz que só pensa nesta temporada|Say you are focused on this season|Decir que solo piensas en esta temporada
Foco.|Focus.|Concentración.
Seu engenheiro recebeu proposta|Your engineer has an offer|Tu ingeniero recibió una oferta
O engenheiro que entende do seu jeito de pilotar foi sondado por uma equipe maior.|The engineer who understands your driving has been approached by a bigger team.|Un equipo más grande contactó al ingeniero que entiende tu conducción.
Pede à equipe que cubra a oferta|Ask the team to match the offer|Pedir al equipo que iguale la oferta
Você se expõe por ele.|You put yourself on the line for him.|Te expones por él.
Deseja boa sorte|Wish him good luck|Desearle buena suerte
Cada um cuida da própria carreira.|Everyone looks after their own career.|Cada uno cuida su propia carrera.
Fala com ele fora do trabalho|Talk to him away from work|Hablar con él fuera del trabajo
Uma conversa longa e honesta.|A long, honest conversation.|Una conversación larga y sincera.
Projeto social|Community project|Proyecto social
Um kartódromo de periferia pede ajuda para manter as aulas para crianças. É onde você aprendeu — ou poderia ter aprendido.|A neighbourhood kart circuit needs help to keep teaching children. It is where you learned, or could have learned.|Un kartódromo de barrio pide ayuda para mantener las clases infantiles. Es donde aprendiste o podrías haber aprendido.
Banca o ano inteiro|Fund the whole year|Financiar todo el año
Sai caro. Vale.|Expensive. Worth it.|Sale caro. Merece la pena.
Faz um dia de visita|Visit for a day|Hacer una visita de un día
Dá o nome, não o dinheiro.|Lend your name rather than your money.|Das tu nombre en lugar de dinero.
Não é o momento|Not the right time|No es el momento
A conta ainda não fecha nem para você.|You are still struggling to cover your own costs.|Todavía no te salen las cuentas ni a ti.
Alguém importante|Someone important|Alguien importante
Você conheceu alguém. O calendário tem 22 fins de semana ocupados e três continentes.|You met someone. The calendar has 22 busy weekends across three continents.|Conociste a alguien. El calendario ocupa 22 fines de semana en tres continentes.
Leva a sério|Take it seriously|Tomárselo en serio
Alguém para voltar. E menos tempo para tudo.|Someone to come home to. And less time for everything.|Alguien con quien volver. Y menos tiempo para todo.
Deixa fluir|See where it goes|Dejar que fluya
Sem promessa nenhuma.|No promises.|Sin promesas.
Agora não dá|Not possible right now|Ahora no puede ser
A carreira come tudo.|The career takes everything.|La carrera lo consume todo.
Cassino em Mônaco|Casino in Monaco|Casino en Mónaco
Depois do GP, a mesa está posta e as fichas são altas. Todo mundo que importa está ali.|After the GP, the table is ready and the stakes are high. Everyone who matters is there.|Después del GP, la mesa está lista y las apuestas son altas. Todos los que importan están allí.
Joga alto|Bet big|Apostar fuerte
Pode dar muito certo. Costuma não dar.|It could go very well. It usually does not.|Puede salir muy bien. No suele hacerlo.
Fica só na conversa|Stick to conversation|Limitarse a conversar
Você aperta mãos e não perde nada.|Shake hands and lose nothing.|Estrechas manos y no pierdes nada.
Vai embora cedo|Leave early|Marcharse pronto
Não é o seu ambiente.|It is not your scene.|No es tu ambiente.
Câmeras dentro de casa|Cameras at home|Cámaras en casa
Uma produtora quer fazer um documentário sobre a sua temporada, com acesso total.|A production company wants full access for a documentary about your season.|Una productora quiere acceso total para un documental sobre tu temporada.
Acesso total|Full access|Acceso total
Sua vida vira conteúdo. Seu nome, também.|Your life becomes content. So does your name.|Tu vida se convierte en contenido. Tu nombre también.
Só o que acontece na pista|On-track coverage only|Solo lo que ocurre en la pista
Limite claro.|A clear boundary.|Un límite claro.
Recusa|Decline|Rechazar
Silêncio é um luxo.|Silence is a luxury.|El silencio es un lujo.
Ordem no rádio|Team order on the radio|Orden por radio
A equipe pede que você segure a posição e deixe o companheiro passar. Faltam oito voltas.|The team asks you to hold position and let your teammate through. Eight laps remain.|El equipo pide que mantengas la posición y dejes pasar a tu compañero. Quedan ocho vueltas.
Obedece|Obey|Obedecer
Você engole e cumpre.|Swallow your pride and comply.|Te tragas el orgullo y cumples.
Ignora e ataca|Ignore it and attack|Ignorar y atacar
A rádio explode. A imprensa também.|The radio erupts. So does the press.|La radio estalla. La prensa también.
Finge que o rádio falhou|Pretend the radio failed|Fingir que falló la radio
Um clássico do esporte.|A motorsport classic.|Un clásico del deporte.
Um olheiro na arquibancada|A scout in the grandstand|Un ojeador en la tribuna
Correu o boato de que há um observador de equipe grande acompanhando a etapa. Você não sabe qual piloto ele veio ver.|Rumour has it a big team's scout is watching this round. You do not know which driver he came to see.|Se rumorea que un ojeador de un equipo grande sigue la prueba. No sabes a qué piloto vino a ver.
Arrisca tudo para aparecer|Risk everything to stand out|Arriesgarlo todo para destacar
Ou brilha, ou bate.|Shine or crash.|O brillas o chocas.
Corre como sempre|Race as usual|Correr como siempre
Consistência também chama atenção.|Consistency attracts attention too.|La constancia también llama la atención.
Vai falar com ele nos boxes|Talk to him in the pits|Hablar con él en boxes
Cara a cara, sem intermediário.|Face to face, no middleman.|Cara a cara, sin intermediarios.
A balança|The scales|La báscula
A equipe avisou, sem meias palavras, que você está três quilos acima do ideal.|The team told you plainly that you are three kilos above your ideal weight.|El equipo te dijo sin rodeos que pesas tres kilos más de lo ideal.
Dieta severa|Strict diet|Dieta estricta
Funciona. E é miserável.|It works. It is miserable.|Funciona. Y es miserable.
Ajusta aos poucos|Adjust gradually|Ajustar poco a poco
Nem milagre, nem desleixo.|No miracle, no neglect.|Ni milagro ni descuido.
Você acha que não é isso.|You do not think that is the problem.|Crees que ese no es el problema.
Renovação antecipada|Early renewal|Renovación anticipada
A equipe oferece renovar agora, no meio do ano, por um valor abaixo do que você poderia pedir depois de uma boa temporada.|The team offers a mid-season renewal for less than you could ask after a strong year.|El equipo ofrece renovar a mitad de año por menos de lo que podrías pedir tras una buena temporada.
Assina agora|Sign now|Firmar ahora
Segurança vale desconto.|Security is worth a discount.|La seguridad vale un descuento.
Espera o fim da temporada|Wait until season end|Esperar al final de la temporada
Aposta em si mesmo.|Back yourself.|Apuesta por ti.
Um rival vira gente|A rival becomes a person|Un rival se vuelve humano
Depois de uma briga dura na pista, o piloto do carro ao lado chamou você para tomar alguma coisa e rir do assunto.|After a hard fight on track, the other driver invited you for a drink and a laugh about it.|Después de una dura lucha en pista, el otro piloto te invitó a tomar algo y reírse del asunto.
Vai|Go|Ir
Rivalidade não impede amizade.|Rivalry does not rule out friendship.|La rivalidad no impide la amistad.
Recusa educadamente|Decline politely|Rechazar educadamente
Você prefere manter distância de quem disputa a sua vaga.|You prefer to keep your distance from those competing for your seat.|Prefieres mantener la distancia con quienes compiten por tu asiento.
Madrugada no simulador|Late night in the simulator|Madrugada en el simulador
A equipe liberou o simulador fora do horário. Dá para virar a noite estudando o traçado.|The team has opened the simulator after hours. You could study the track all night.|El equipo abrió el simulador fuera de horario. Puedes pasar la noche estudiando el trazado.
Vira a noite|Stay up all night|Pasar la noche despierto
Você chega sabendo cada zebra.|Arrive knowing every kerb.|Llegas conociendo cada piano.
Duas horas e vai dormir|Two hours, then sleep|Dos horas y a dormir
Meio-termo sensato.|A sensible compromise.|Un término medio sensato.
Vai descansar|Get some rest|Ir a descansar
Corpo também é ferramenta.|Your body is a tool too.|El cuerpo también es una herramienta.
Poupar o motor até o fim|Save the engine to the finish|Conservar el motor hasta el final
Uns décimos por volta, e o carro provavelmente chega.|Lose a few tenths per lap and the car will probably finish.|Pierdes unas décimas por vuelta y el coche probablemente termina.
Seguir no ritmo|Maintain the pace|Mantener el ritmo
Nada muda na pista. Pode quebrar.|No change in pace. It may break.|No cambia el ritmo. Puede romperse.
Parar nesta volta|Pit this lap|Parar en esta vuelta
Troca o pneu e volta para a pista.|Change the tyre and rejoin.|Cambiar el neumático y volver a pista.
Troca a asa: alguns segundos a mais no box.|Change the wing: a few extra seconds in the pits.|Cambiar el ala: unos segundos más en boxes.
Seguir assim|Keep going|Seguir así
Muito lento, e a roda pode se soltar.|Very slow, and the wheel could come off.|Muy lento y la rueda puede soltarse.
Perde tempo em toda curva até a próxima parada.|Lose time in every corner until the next stop.|Pierdes tiempo en cada curva hasta la siguiente parada.
{0}: "Estou perdendo potência. O motor está estranho."|{0}: "I am losing power. Something is wrong with the engine."|{0}: "Estoy perdiendo potencia. El motor va raro."
{0}: "Bateram em mim! {1}"|{0}: "I have been hit! {1}"|{0}: "¡Me han golpeado! {1}"
O pneu está furado.|I have a puncture.|El neumático está pinchado.
A asa da frente está quebrada.|The front wing is broken.|El alerón delantero está roto.
Bandeirada · {0} voltas|Chequered flag · {0} laps|Bandera a cuadros · {0} vueltas
Volta {0}/{1}|Lap {0}/{1}|Vuelta {0}/{1}
Chegou em {0}|Finished {0}|Terminó en {0}
{0} s de punição|{0} s penalty|{0} s de sanción
fora|out|fuera
bandeira verde|green flag|bandera verde
Bandeira verde|Green flag|Bandera verde
Bandeira amarela|Yellow flag|Bandera amarilla
Bandeira vermelha|Red flag|Bandera roja
Pista livre|Track clear|Pista libre
  `.trim().split('\n').map(line => line.trim().split('|'));
  for(const [lang,column] of [['en',1],['es',2]]) window.VDO_LOCALES[lang].pairs.push(...rows.map(row => [row[0],row[column]]));
})();
