/* Textos do passado real do piloto que você assume (assets/passado-piloto.js).
   Linhas [pt, en, es, ja]. Fica num arquivo próprio, carregado antes de runtime.js. */
(function(){
  const rows = [
    ["Inclui a carreira real até {0}, do banco histórico (Wikipedia). Vitórias e provas de antes entram onde o banco tem o dado; pódios, poles, voltas mais rápidas, abandonos e pontos contam a partir de {1}.",
     "Includes the real career up to {0}, from the historical database (Wikipedia). Earlier wins and race entries are counted where the database has them; podiums, poles, fastest laps, retirements and points count from {1}.",
     "Incluye la carrera real hasta {0}, del banco histórico (Wikipedia). Las victorias y carreras anteriores cuentan donde el banco tiene el dato; podios, poles, vueltas rápidas, abandonos y puntos cuentan desde {1}.",
     "{0}年までの実際のキャリアを含む（歴史データベース、Wikipedia）。それ以前の勝利と出走数はデータがある場合のみ。表彰台、ポール、ファステストラップ、リタイア、ポイントは{1}年から集計。"]
  ];
  for(const [lang, column] of [['en', 1], ['es', 2], ['ja', 3]]){
    const locale = window.VDO_LOCALES[lang];
    locale.pairs.push(...rows.map(row => [row[0], row[column]]));
  }
})();
