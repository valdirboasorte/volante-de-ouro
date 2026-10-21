/* Conteúdo público, SEO e roadmap. As traduções alteram apenas a apresentação. */
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
    ['Roadmap','Roadmap','Hoja de ruta','ロードマップ'],
    ['roadmap','roadmap','hoja de ruta','ロードマップ'],
    ['Roadmap — o futuro do Volante de Ouro','Roadmap — the future of Volante de Ouro','Hoja de ruta — el futuro de Volante de Ouro','ロードマップ — Volante de Ouroの未来'],
    ['Uma carreira já está esperando por você. Veja o que está disponível e os próximos caminhos que queremos explorar.','A career is already waiting for you. Discover what is available and the next paths we want to explore.','Ya te espera una carrera. Descubre lo que está disponible y los próximos caminos que queremos explorar.','あなたのキャリアはもう始められます。現在遊べる内容と、これから目指す方向をご覧ください。'],
    ['Disponível','Available','Disponible','利用可能'],
    ['Planejado','Planned','Planeado','計画中'],
    ['Em desenvolvimento','In development','En desarrollo','開発中'],
    ['Já está no jogo','Already in the game','Ya está en el juego','すでに遊べる機能'],
    ['Carreira de piloto','Driver career','Carrera de piloto','ドライバーキャリア'],
    ['Evolua, escolha equipes e construa sua trajetória.','Develop your skills, choose teams and build your own career.','Mejora, elige equipos y construye tu trayectoria.','腕を磨き、チームを選び、自分だけのキャリアを築こう。'],
    ['Chefe de equipe','Team principal','Jefe de equipo','チーム代表'],
    ['Contrate pilotos e administre o desenvolvimento e as finanças.','Sign drivers and manage development and finances.','Contrata pilotos y gestiona el desarrollo y las finanzas.','ドライバーを起用し、開発と資金を管理しよう。'],
    ['Campeonatos históricos','Historic championships','Campeonatos históricos','歴史的な選手権'],
    ['Dispute temporadas e cenários de diferentes décadas.','Race in seasons and scenarios spanning different decades.','Disputa temporadas y escenarios de distintas décadas.','さまざまな年代のシーズンやシナリオに挑もう。'],
    ['Simulação de corridas','Race simulation','Simulación de carreras','レースシミュレーション'],
    ['Acompanhe a prova e tome decisões de estratégia.','Follow the race and make strategic decisions.','Sigue la carrera y toma decisiones de estrategia.','レースを見守り、戦略を決めよう。'],
    ['Mercado de pilotos','Driver market','Mercado de pilotos','ドライバー市場'],
    ['Avalie propostas e oportunidades entre temporadas.','Assess offers and opportunities between seasons.','Evalúa ofertas y oportunidades entre temporadas.','シーズンの合間にオファーやチャンスを検討しよう。'],
    ['Sistema de contratos','Contract system','Sistema de contratos','契約システム'],
    ['Negocie seu próximo passo no automobilismo.','Negotiate your next move in motorsport.','Negocia tu próximo paso en el automovilismo.','モータースポーツでの次の一歩を交渉しよう。'],
    ['Estatísticas e recordes','Statistics and records','Estadísticas y récords','統計と記録'],
    ['Consulte resultados, conquistas e o histórico da carreira.','Review results, achievements and your career history.','Consulta resultados, logros y el historial de tu carrera.','結果、実績、キャリアの歩みを振り返ろう。'],
    ['Multiplayer cooperativo','Co-op multiplayer','Multijugador cooperativo','協力マルチプレイ'],
    ['Compartilhar uma carreira com outros jogadores, tomando decisões e vivendo a mesma história. O formato ainda será definido.','Share a career with other players, making decisions and experiencing the same story. The format has yet to be decided.','Compartir una carrera con otros jugadores, tomando decisiones y viviendo la misma historia. El formato aún está por definir.','ほかのプレイヤーとキャリアを共有し、一緒に決断して同じ物語を歩む構想です。具体的な形式は今後検討します。'],
    ['Saves na nuvem','Cloud saves','Partidas en la nube','クラウドセーブ'],
    ['Guardar a carreira online e continuar em outros dispositivos. Hoje o progresso fica no navegador e pode ser transferido por arquivo.','Store your career online and continue on other devices. Currently, progress is stored in the browser and can be transferred using a file.','Guardar la carrera en línea y continuar en otros dispositivos. Actualmente, el progreso se guarda en el navegador y puede transferirse mediante un archivo.','キャリアをオンラインに保存し、ほかの端末で続きを遊べるようにする構想です。現在の進行状況はブラウザーに保存され、ファイルで移行できます。'],
    ['Infraestrutura para crescer','Infrastructure for growth','Infraestructura para crecer','成長を支える基盤'],
    ['Preparar a manutenção do domínio e os serviços necessários às próximas funcionalidades, preservando o jogo atual.','Plan domain maintenance and the services needed for future features while preserving the current game.','Preparar el mantenimiento del dominio y los servicios necesarios para las próximas funciones, preservando el juego actual.','現在のゲームを維持しながら、ドメインの管理や今後の機能に必要なサービスを整えていく計画です。'],
    ['O apoio voluntário ajuda na manutenção do domínio, na infraestrutura e no desenvolvimento das ideias do roadmap. O jogo continua gratuito; doar não é comprar uma funcionalidade futura.','Voluntary support helps maintain the domain, infrastructure and development of roadmap ideas. The game remains free; donating does not purchase a future feature.','El apoyo voluntario ayuda a mantener el dominio, la infraestructura y el desarrollo de las ideas de la hoja de ruta. El juego sigue siendo gratuito; donar no es comprar una función futura.','任意のご支援は、ドメインの維持、基盤整備、ロードマップにある構想の開発に役立ちます。ゲームは引き続き無料です。寄付は将来の機能の購入を意味しません。'],
    ['Apoie o projeto','Support the project','Apoya el proyecto','プロジェクトを支援'],
    ['O roadmap apresenta planos para o futuro do Volante de Ouro. Funcionalidades e prioridades podem mudar durante o desenvolvimento.','The roadmap outlines plans for the future of Volante de Ouro. Features and priorities may change during development.','La hoja de ruta presenta planes para el futuro de Volante de Ouro. Las funciones y prioridades pueden cambiar durante el desarrollo.','ロードマップはVolante de Ouroの将来の計画を示すものです。開発中に機能や優先順位が変わる場合があります。'],
    ['Como proteger e transferir sua carreira','How to protect and transfer your career','Cómo proteger y transferir tu carrera','キャリアの保護と移行方法'],
    ['O progresso fica separado em cada navegador e endereço. Antes de trocar de dispositivo ou domínio, exporte um backup. A importação preserva os dados existentes por padrão.','Progress is stored separately for each browser and web address. Export a backup before changing devices or domains. Importing preserves existing data by default.','El progreso se guarda por separado en cada navegador y dirección web. Exporta una copia de seguridad antes de cambiar de dispositivo o dominio. La importación conserva los datos existentes de forma predeterminada.','進行状況はブラウザーやサイトのアドレスごとに別々に保存されます。端末やドメインを変える前にバックアップを書き出してください。読み込み時は、初期設定では既存のデータが保持されます。'],
    ['Abrir backup e importação de progresso','Open progress backup and import','Abrir copia de seguridad e importación del progreso','進行状況のバックアップと読み込みを開く'],
    ['Termine a corrida antes de abrir o roadmap.','Finish the race before opening the roadmap.','Termina la carrera antes de abrir la hoja de ruta.','ロードマップを開く前に、レースを終了してください。'],
    ['Conclua a decisão atual antes de abrir o roadmap.','Complete the current decision before opening the roadmap.','Completa la decisión actual antes de abrir la hoja de ruta.','ロードマップを開く前に、現在の選択を完了してください。'],
    ['Para jogar ou transferir progresso, ative o JavaScript no navegador. O roadmap pode ser consultado abaixo.','To play or transfer progress, enable JavaScript in your browser. You can view the roadmap below.','Para jugar o transferir el progreso, activa JavaScript en el navegador. Puedes consultar la hoja de ruta a continuación.','プレイや進行状況の移行には、ブラウザーでJavaScriptを有効にしてください。ロードマップは下で確認できます。']
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
