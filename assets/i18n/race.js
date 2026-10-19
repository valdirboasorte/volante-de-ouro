/* Cronometragem, rádio e comandos ao vivo; códigos de pneus não mudam. */
(function(){
  const rows = `
Torre de tempos|Timing tower|Torre de tiempos
O que a torre mostra|Timing tower display|Qué muestra la torre
Para o líder|To leader|Respecto al líder
Tempo de prova|Race time|Tiempo de carrera
Acontecimentos|Events|Acontecimientos
A corrida inteira em|The full race in|La carrera completa en
Duração da corrida na tela|On-screen race duration|Duración de la carrera en pantalla
Última|Last lap|Última
Boxes|Pits|Boxes
Box|Pit|Box
Verde|Green|Verde
Amarela|Yellow|Amarilla
Vermelha|Red|Roja
Luzes apagadas. Os carros largam.|Lights out. The race is underway.|Se apagan las luces. Empieza la carrera.
Luzes apagadas.|Lights out.|Se apagan las luces.
Volta {0}: {fala}|Lap {0}: {fala}|Vuelta {0}: {fala}
{piloto} passa {rival}.|{piloto} overtakes {rival}.|{piloto} adelanta a {rival}.
{piloto} coloca uma volta em {rival}.|{piloto} laps {rival}.|{piloto} dobla a {rival}.
{piloto} para nos boxes.|{piloto} pits.|{piloto} entra en boxes.
{piloto} para nos boxes: {pneu}.|{piloto} pits for {pneu} tyres.|{piloto} para en boxes: {pneu}.
Parada lenta para {piloto}: {tempo} s perdidos.|Slow stop for {piloto}: {tempo} s lost.|Parada lenta para {piloto}: {tempo} s perdidos.
{piloto} bate e está fora.|{piloto} crashes out.|{piloto} choca y abandona.
{piloto} para com problema mecânico.|{piloto} stops with a mechanical problem.|{piloto} se detiene por un problema mecánico.
{piloto} para {motivo}.|{piloto} stops {motivo}.|{piloto} se detiene {motivo}.
Safety car: {piloto} parou na pista.|Safety car: {piloto} stopped on track.|Coche de seguridad: {piloto} se detuvo en pista.
Safety car na pista.|Safety car on track.|Coche de seguridad en pista.
Safety car na pista: detritos na pista.|Safety car on track: debris.|Coche de seguridad en pista: restos en la pista.
Safety car virtual.|Virtual safety car.|Coche de seguridad virtual.
Safety car virtual: detritos na pista.|Virtual safety car: debris on track.|Coche de seguridad virtual: restos en la pista.
Bandeira verde. A corrida recomeça.|Green flag. Racing resumes.|Bandera verde. Se reanuda la carrera.
Bandeira verde. Corrida liberada.|Green flag. Racing resumes.|Bandera verde. Se reanuda la carrera.
Bandeirada para {piloto}.|Chequered flag for {piloto}.|Bandera a cuadros para {piloto}.
{piloto} erra e perde tempo.|{piloto} makes a mistake and loses time.|{piloto} comete un error y pierde tiempo.
Toque entre {piloto} e {rival}: pneu furado.|Contact between {piloto} and {rival}: a puncture.|Toque entre {piloto} y {rival}: neumático pinchado.
Toque entre {piloto} e {rival}: asa danificada.|Contact between {piloto} and {rival}: wing damage.|Toque entre {piloto} y {rival}: alerón dañado.
{piloto} com pneu furado.|{piloto} has a puncture.|{piloto} tiene un pinchazo.
{piloto} punido: {tempo} s por {motivo}.|{piloto} penalised: {tempo} s for {motivo}.|{piloto} sancionado: {tempo} s por {motivo}.
não usar dois compostos|not using two compounds|no usar dos compuestos
limites de pista|track limits|límites de pista
Começou a chover.|It has started raining.|Ha empezado a llover.
A chuva parou. A pista vai secar.|The rain has stopped. The track will dry.|Ha parado de llover. La pista se secará.
{piloto} com problema no motor.|{piloto} has an engine problem.|{piloto} tiene un problema de motor.
{piloto}: {fala}.|{piloto}: {fala}.|{piloto}: {fala}.
Ordem de equipe: {piloto} abre passagem para {rival}.|Team order: {piloto} lets {rival} through.|Orden de equipo: {piloto} deja pasar a {rival}.
Rádio para {piloto}: {fala}|Radio to {piloto}: {fala}|Radio para {piloto}: {fala}
box nesta volta para {pneu}. É a nossa janela.|pit this lap for {pneu} tyres. This is our window.|box en esta vuelta para {pneu}. Es nuestra ventana.
o pneu acabou. Box para {pneu}.|the tyres are gone. Pit for {pneu}.|los neumáticos están agotados. Box para {pneu}.
pneu furado! Box nesta volta para {pneu}.|puncture! Pit this lap for {pneu} tyres.|¡pinchazo! Box en esta vuelta para {pneu}.
o combustível está no fim. Box nesta volta ({pneu}).|running out of fuel. Pit this lap ({pneu}).|se acaba el combustible. Box en esta vuelta ({pneu}).
a chuva apertou: hora do {pneu}.|the rain is getting heavier: time for {pneu} tyres.|llueve más fuerte: toca poner {pneu}.
a pista está secando: hora do {pneu}.|the track is drying: time for {pneu} tyres.|la pista se seca: toca poner {pneu}.
só usamos um composto. Se não pararmos para {pneu}, vem punição.|we have only used one compound. Pit for {pneu} or face a penalty.|solo hemos usado un compuesto. Hay que parar para poner {pneu} o habrá sanción.
safety car! Parar agora custa menos: {pneu}.|safety car! Pitting now costs less time: {pneu}.|¡coche de seguridad! Parar ahora cuesta menos tiempo: {pneu}.
box para {pneu}.|pit for {pneu} tyres.|box para {pneu}.
Você assiste: nenhum carro seu está na pista.|You are spectating: none of your cars are on track.|Estás mirando: no tienes coches en pista.
A equipe assume as paradas até a bandeirada|The team manages pit stops to the finish|El equipo gestiona las paradas hasta el final
O companheiro precisa estar colado atrás para a ordem valer.|Your teammate must be right behind for the order to work.|Tu compañero debe estar pegado detrás para que funcione la orden.
Desgaste do pneu|Tyre wear|Desgaste del neumático
Combustível|Fuel|Combustible
Entrando nos boxes.|Entering the pits.|Entrando en boxes.
Nos boxes: trocando os pneus.|In the pits: changing tyres.|En boxes: cambiando neumáticos.
Saindo dos boxes.|Leaving the pits.|Saliendo de boxes.
Você chamou: box nesta volta|Your call: pit this lap|Tu orden: box en esta vuelta
para pôr {pneu}.|for {pneu} tyres.|para poner {pneu}.
Parar: {pneu}|Pit for: {pneu}|Parar: {pneu}
Estratégia da equipe: parar na volta {volta} para pôr {pneu}. Quem chama é você.|Team strategy: pit on lap {volta} for {pneu} tyres. You make the call.|Estrategia del equipo: parar en la vuelta {volta} para poner {pneu}. Tú das la orden.
A equipe não planeja mais paradas.|The team plans no more stops.|El equipo no planea más paradas.
Ar|Air|Aire
Seca|Dry|Seca
Úmida|Damp|Húmeda
Molhada|Wet|Mojada
Encharcada|Soaked|Encharcada
Chovendo|Raining|Lloviendo
Sem chuva|No rain|Sin lluvia
Radar: chuva em cerca de {0} min|Radar: rain in around {0} min|Radar: lluvia en unos {0} min
Radar: a chuva para em cerca de {0} min|Radar: rain stops in around {0} min|Radar: dejará de llover en unos {0} min
Radar: sem mudança à vista|Radar: no change expected|Radar: sin cambios a la vista
Volta {volta}: {piloto} lidera com {tempo} s sobre {rival}.|Lap {volta}: {piloto} leads {rival} by {tempo} s.|Vuelta {volta}: {piloto} lidera con {tempo} s sobre {rival}.
Volta {volta}: {piloto} lidera, seguido de {rival}.|Lap {volta}: {piloto} leads, followed by {rival}.|Vuelta {volta}: {piloto} lidera, seguido de {rival}.
Bandeirada: {piloto} vence em {tempo}.|Chequered flag: {piloto} wins in {tempo}.|Bandera a cuadros: {piloto} gana en {tempo}.
Bandeirada: {piloto} vence em {tempo}. Volta mais rápida de {rival}, {volta}.|Chequered flag: {piloto} wins in {tempo}. Fastest lap by {rival}, {volta}.|Bandera a cuadros: {piloto} gana en {tempo}. Vuelta rápida de {rival}, {volta}.
vence em {tempo}.|wins in {tempo}.|gana en {tempo}.
vence em {tempo} · volta mais rápida de {rival}, {volta}.|wins in {tempo} · fastest lap by {rival}, {volta}.|gana en {tempo} · vuelta rápida de {rival}, {volta}.
  `.trim().split('\n').map(line => line.trim().split('|'));
  for(const [lang,col] of [['en',1],['es',2]]) window.VDO_LOCALES[lang].pairs.push(...rows.map(r => [r[0],r[col]]));
})();
