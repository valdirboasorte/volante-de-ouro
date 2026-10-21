/* Conteúdo público e SEO. As traduções alteram apenas a apresentação. */
(function(){
  'use strict';
  const rows = [
    ['Volante de Ouro — Simulador de Carreira no Automobilismo','Volante de Ouro — Motorsport Career Simulator','Volante de Ouro — Simulador de carrera automovilística','Volante de Ouro — モータースポーツ・キャリアシミュレーター'],
    ['Seja piloto ou chefe de equipe, dispute campeonatos históricos e construa sua carreira no Volante de Ouro, um simulador gratuito de automobilismo para navegador.','Become a driver or team principal, race in historic championships and build your career in Volante de Ouro, a free browser-based motorsport simulator.','Sé piloto o jefe de equipo, disputa campeonatos históricos y construye tu carrera en Volante de Ouro, un simulador gratuito de automovilismo para navegador.','ドライバーやチーム代表となって歴史的な選手権に挑み、Volante de Ouroで自分だけのキャリアを築こう。ブラウザーで無料で遊べるモータースポーツシミュレーターです。'],
    ['Volante de Ouro. Sua carreira. Sua história. volantedeouro.com.','Volante de Ouro. Your career. Your story. volantedeouro.com.','Volante de Ouro. Tu carrera. Tu historia. volantedeouro.com.','Volante de Ouro。あなたのキャリア。あなたの物語。volantedeouro.com。'],
    ['Um simulador gratuito de carreira no automobilismo para navegador. Seja piloto ou chefe de equipe, da base à Fórmula 1 e a outras categorias, em temporadas de 1950 a 2026.','A free browser-based motorsport career simulator. Become a driver or team principal, from junior racing to Formula 1 and other categories, in seasons from 1950 to 2026.','Un simulador gratuito de carrera automovilística para navegador. Sé piloto o jefe de equipo, desde las categorías de formación hasta la Fórmula 1 y otras categorías, en temporadas de 1950 a 2026.','ブラウザーで無料で遊べるモータースポーツ・キャリアシミュレーター。1950年から2026年のシーズンで、ドライバーやチーム代表となり、育成カテゴリーからF1やさまざまな選手権に挑もう。'],
    ['Pular para o conteúdo','Skip to content','Saltar al contenido','本文へ移動'],
    ['Volante de Ouro, início','Volante de Ouro, home','Volante de Ouro, inicio','Volante de Ouro、ホーム'],
    ['Rodapé','Footer','Pie de página','フッター'],
    ['Para jogar ou transferir progresso, ative o JavaScript no navegador.','To play or transfer progress, enable JavaScript in your browser.','Para jugar o transferir el progreso, activa JavaScript en el navegador.','プレイや進行状況の移行には、ブラウザーでJavaScriptを有効にしてください。'],
  ];
  for(const [lang,column] of [['en',1],['es',2],['ja',3]]){
    const locale = window.VDO_LOCALES[lang];
    const existing = new Map(locale.pairs);
    for(const row of rows){
      if(existing.get(row[0]) !== row[column]){
        locale.pairs.push([row[0],row[column]]);
        existing.set(row[0],row[column]);
      }
    }
    locale.title = rows[0][column];
  }
})();
