/* Textos compartilhados e metadados da página. */
(function(){
  const rows = [
    ['Volante de Ouro · Construa sua carreira no automobilismo','Volante de Ouro · Build your motorsport career','Volante de Ouro · Construye tu carrera en el automovilismo','Volante de Ouro · モータースポーツのキャリアを築こう'],
    ['Do kart à glória. Sete décadas de automobilismo, uma carreira só sua — com o retrospecto completo de cada corrida de cada temporada.','From karting to glory. Seven decades of motorsport, a career of your own — with a full record of every race in every season.','Del karting a la gloria. Siete décadas de automovilismo, una carrera propia: con el historial completo de cada carrera y temporada.','カートから栄光へ。70年にわたるモータースポーツで自分だけのキャリアを築き、全シーズン・全レースの記録を振り返ろう。'],
    ['Do kart à glória. Sete décadas, uma carreira só sua — com o retrospecto de cada corrida.','From karting to glory. Seven decades, a career of your own — with a record of every race.','Del karting a la gloria. Siete décadas, una carrera propia: con el historial de cada carrera.','カートから栄光へ。70年の歴史の中で自分だけのキャリアを築き、すべてのレースを振り返ろう。'],
    ['{0} ano(s)','{0} year(s)','{0} año(s)','{0}年'],
    [', {0} anos, {1}.',', {0} years old, {1}.',', {0} años, {1}.','、{0}歳、{1}。'],
    [', {0} ano, {1}.',', {0} year old, {1}.',', {0} año, {1}.','、{0}歳、{1}。'],
    ['{0} anos de contrato','{0} years under contract','{0} años de contrato','契約残り{0}年'],
    ['{0} ano de contrato','{0} year under contract','{0} año de contrato','契約残り{0}年'],
    ['{0} min','{0} min','{0} min','{0}分'],
    ['rodada {0}','round {0}','ronda {0}','第{0}戦'],
    ['temporada guardada','saved season','temporada guardada','保存されたシーズン'],
    ['O asfalto passa dos 55 °C. Os pneus vão sofrer como em nenhuma outra corrida do ano.','The track temperature exceeds 55 °C. The tyres will face their toughest race of the year.','El asfalto supera los 55 °C. Los neumáticos sufrirán más que en cualquier otra carrera del año.','路面温度は55°Cを超える。タイヤにとって今季で最も過酷なレースになる。'],
    ['por {0} anos','for {0} years','por {0} años','{0}年契約で'],
    ['por um ano','for one year','por un año','1年契約で'],
    ['uma temporada','one season','una temporada','1シーズン'],
    ['Patrocinador principal','Title sponsor','Patrocinador principal','タイトルスポンサー'],
    ['Novo patrocinador','New sponsor','Nuevo patrocinador','新スポンサー'],
    ['{0} é campeão {1} com a {2}.','{0} wins the {1} title with {2}.','{0} es campeón {1} con {2}.','{0}が{2}で{1}王者に輝いた。'],
    ['Troca {0} {1} pela Fórmula 1.','Moves from {0} {1} to Formula 1.','Cambia {0} {1} por la Fórmula 1.','{0}{1}からF1へ移る。'],
    ['aqui a equipe paga você','here the team pays you','aquí el equipo te paga','こちらはチームから報酬を受け取る'],
    ['Escuderia Municipal','Municipal Racing Team','Escudería Municipal','市営レーシングチーム'],
    ['Garagem 12','Garage 12','Garaje 12','ガレージ12'],
    ['Escola de Pilotagem','Racing School','Escuela de Pilotaje','レーシングスクール'],
    ['Escuderia do Bairro','Neighborhood Racing Team','Escudería del Barrio','地元レーシングチーム'],
    ['Equipe do Interior','Countryside Team','Equipo del Interior','地方チーム'],
    ['© colaboradores do OpenStreetMap · ODbL','© OpenStreetMap contributors · ODbL','© colaboradores de OpenStreetMap · ODbL','© OpenStreetMap協力者 · ODbL'],
    ['€ {0} por ano','€ {0} per year','€ {0} al año','年額€{0}'],
    ['−€ {0} por ano','−€ {0} per year','−€ {0} al año','年額−€{0}'],
    ['sem combustível','out of fuel','sin combustible','燃料切れ'],
    ['Você tem contrato com a','You have a contract with','Tienes contrato con','契約先：'],
    ['por mais {0} anos. Assinar com outra equipe é quebrar o contrato: a multa é de','for another {0} years. Signing with another team breaks the contract: the penalty is','por otros {0} años. Firmar con otro equipo supone romper el contrato: la penalización es de','との契約はあと{0}年。別のチームと契約すると違反となり、違約金は'],
    ['por mais {0} ano. Assinar com outra equipe é quebrar o contrato: a multa é de','for another {0} year. Signing with another team breaks the contract: the penalty is','por otro {0} año. Firmar con otro equipo supone romper el contrato: la penalización es de','との契約はあと{0}年。別のチームと契約すると違反となり、違約金は'],
    [', a sua fama sofre e a {equipe} não volta a te chamar tão cedo.',', your reputation suffers and {equipe} will not approach you again anytime soon.',', tu reputación se resiente y {equipe} no volverá a llamarte en mucho tiempo.','。知名度が下がり、{equipe}からも当分声がかかりません。'],
    ['por mais {0} anos. Assinar com outra equipe é quebrar o contrato: a sua fama sofre e a {equipe} não volta a te chamar tão cedo.','for another {0} years. Signing with another team breaks the contract: your reputation suffers and {equipe} will not approach you again anytime soon.','por otros {0} años. Firmar con otro equipo supone romper el contrato: tu reputación se resiente y {equipe} no volverá a llamarte en mucho tiempo.','との契約はあと{0}年。別のチームと契約すると違反となり、知名度が下がって{equipe}からも当分声がかかりません。'],
    ['por mais {0} ano. Assinar com outra equipe é quebrar o contrato: a sua fama sofre e a {equipe} não volta a te chamar tão cedo.','for another {0} year. Signing with another team breaks the contract: your reputation suffers and {equipe} will not approach you again anytime soon.','por otro {0} año. Firmar con otro equipo supone romper el contrato: tu reputación se resiente y {equipe} no volverá a llamarte en mucho tiempo.','との契約はあと{0}年。別のチームと契約すると違反となり、知名度が下がって{equipe}からも当分声がかかりません。']
  ];
  for(const [lang,column] of [['en',1],['es',2],['ja',3]]){
    const locale=window.VDO_LOCALES[lang];
    locale.pairs.push(...rows.map(row=>[row[0],row[column]]));
  }
})();
