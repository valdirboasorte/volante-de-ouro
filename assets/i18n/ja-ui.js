(function(){
  const pairs = [
  [
    "Arquivo",
    "アーカイブ"
  ],
  [
    "Campeonatos",
    "選手権"
  ],
  [
    "Lendas",
    "レジェンド"
  ],
  [
    "Recordes",
    "記録"
  ],
  [
    "Como funciona",
    "遊び方"
  ],
  [
    "Seções",
    "セクション"
  ],
  [
    "Animações",
    "アニメーション"
  ],
  [
    "Tema claro ou escuro",
    "ライト／ダークテーマ"
  ],
  [
    "Começar em {0}",
    "{0}年に始める"
  ],
  [
    "Iniciar carreira",
    "キャリアを始める"
  ],
  [
    "Chefe de equipe",
    "チーム代表"
  ],
  [
    "Salvo só no seu aparelho",
    "この端末にのみ保存"
  ],
  [
    "Continuar carreira",
    "キャリアを続ける"
  ],
  [
    "Continuar como chefe",
    "チーム代表を続ける"
  ],
  [
    "As sete categorias: escolha uma para começar",
    "7つのカテゴリーからスタート地点を選ぶ"
  ],
  [
    "7 categorias, 77 temporadas de grids reais",
    "7カテゴリー、77シーズンの実際のグリッド"
  ],
  [
    "Comece no kart, suba pelas categorias de base e brigue por um lugar no grid, em qualquer temporada de 1950 a 2026. A vaga é sua enquanto você conseguir segurar.",
    "カートから育成カテゴリーを駆け上がり、1950〜2026年の好きなシーズンでグリッドの一席を争おう。シートを守れる限り、そこはあなたの場所だ。"
  ],
  [
    "Piloto",
    "ドライバー"
  ],
  [
    "Do kart ao topo",
    "カートから頂点へ"
  ],
  [
    "Suba categoria por categoria, negocie contratos e escreva o seu nome na história.",
    "カテゴリーを一段ずつ上がり、契約を交渉し、歴史に自分の名を刻もう。"
  ],
  [
    "Do outro lado do muro",
    "ピットウォールの向こう側"
  ],
  [
    "Contrate pilotos, escolha o motor, construa o carro e responda ao dono.",
    "ドライバーを雇い、エンジンを選び、マシンを造り、オーナーに結果で応えよう。"
  ],
  [
    "Modo cenário",
    "シナリオモード"
  ],
  [
    "Reescreva a história",
    "歴史を書き換える"
  ],
  [
    "Senna em 1994, Massa em 2008, Hamilton em 2021: o que vem depois é com você.",
    "1994年のSenna、2008年のMassa、2021年のHamilton。その後の物語はあなた次第。"
  ],
  [
    "Escolha a década",
    "年代を選ぶ"
  ],
  [
    "Estreie em qualquer época, com as equipes, os rivais, os circuitos, a pontuação e as categorias de base de cada uma.",
    "どの時代にも、その時代のチーム、ライバル、サーキット、得点制度、育成カテゴリーがある。"
  ],
  [
    "Antes de tudo: o primeiro Grand Prix, França, 1906",
    "すべての始まり：最初のグランプリ、1906年フランス"
  ],
  [
    "Assuma um piloto real num ponto exato da história e reescreva o que veio depois.",
    "歴史のある瞬間から実在のドライバーを引き継ぎ、その後の物語を書き換えよう。"
  ],
  [
    "Mais caminhos",
    "ほかの楽しみ方"
  ],
  [
    "Créditos das fotos",
    "写真のクレジット"
  ],
  [
    "Rodapé",
    "フッター"
  ],
  [
    "Projeto de fã, sem vínculo com a Fórmula 1, a FIA, a IndyCar, a NASCAR, o WEC, a Stock Car, o DTM, a Fórmula E ou as equipes. Nomes, logos e marcas pertencem a seus titulares e aparecem só para identificar cada campeonato. Tudo roda no seu navegador; a carreira fica salva só no seu aparelho.",
    "F1、FIA、IndyCar、NASCAR、WEC、Stock Car、DTM、Formula Eおよび各チームとは関係のないファンプロジェクトです。名称、ロゴ、商標は各権利者に帰属し、選手権の識別にのみ使用しています。ゲームはブラウザー上で動作し、キャリアはこの端末にのみ保存されます。"
  ],
  [
    "Defina seu piloto",
    "ドライバーを作成"
  ],
  [
    "O nome no capacete, a bandeira no macacão e o jeito de pilotar. O resto quem decide é a pista.",
    "ヘルメットに刻む名前、スーツに掲げる国旗、そして走り方。あとはコースが決める。"
  ],
  [
    "Sobrenome",
    "姓"
  ],
  [
    "Ex.: Senna",
    "例：Senna"
  ],
  [
    "Ex.: Ayrton Senna",
    "例：Ayrton Senna"
  ],
  [
    "Número (1–99)",
    "番号（1〜99）"
  ],
  [
    "Nº",
    "番号"
  ],
  [
    "Gênero",
    "性別"
  ],
  [
    "Masculino",
    "男性"
  ],
  [
    "Feminino",
    "女性"
  ],
  [
    "Nacionalidade",
    "国籍"
  ],
  [
    "Buscar país…",
    "国を検索…"
  ],
  [
    "Nenhum país encontrado",
    "該当する国がありません"
  ],
  [
    "Estilo de pilotagem",
    "ドライビングスタイル"
  ],
  [
    "Agressivo",
    "アグレッシブ"
  ],
  [
    "Técnico",
    "テクニカル"
  ],
  [
    "Consistente",
    "安定型"
  ],
  [
    "Equilibrado",
    "バランス型"
  ],
  [
    "Mais poles e vitórias improváveis, muito mais abandonos. Ou você passa, ou você bate.",
    "ポールや番狂わせの優勝が増える一方、リタイアも大幅に増える。抜くか、ぶつかるか。"
  ],
  [
    "Entende o carro melhor que o engenheiro e brilha na chuva. Evolui rápido e melhora a equipe.",
    "エンジニア以上にマシンを理解し、雨で輝く。成長が早く、チームの開発にも貢献する。"
  ],
  [
    "Quase nunca abandona e pontua sempre. Campeonatos se ganham somando, não brilhando.",
    "めったにリタイアせず、着実に得点する。選手権を制するのは華やかさより積み重ね。"
  ],
  [
    "Sem grandes fraquezas e sem uma arma decisiva. Um piloto completo, que se adapta a tudo.",
    "大きな弱点も決定的な武器もない。あらゆる状況に対応する万能型。"
  ],
  [
    "Época",
    "時代"
  ],
  [
    "Década de estreia",
    "デビューする年代"
  ],
  [
    "Ano exato",
    "デビュー年"
  ],
  [
    "Idade ao começar",
    "開始年齢"
  ],
  [
    "anos",
    "歳"
  ],
  [
    "Anos",
    "年"
  ],
  [
    "Carreira",
    "キャリア"
  ],
  [
    "Cada uma tem suas próprias categorias de base, equipes, rivais, circuitos e regulamento. Dá para trocar no meio do caminho, se o mercado abrir a porta.",
    "それぞれに独自の育成カテゴリー、チーム、ライバル、サーキット、規則がある。移籍市場に道が開ければ、途中で転向することもできる。"
  ],
  [
    "Modo",
    "モード"
  ],
  [
    "Regras",
    "ルール"
  ],
  [
    "Realismo histórico",
    "史実に沿った危険性"
  ],
  [
    "Acidentes graves podem custar corridas — e, nas décadas mais perigosas, encerrar a carreira. Desligue para uma temporada sem consequências.",
    "重大事故で数戦を欠場したり、危険な時代にはキャリアが終わることもある。無効にすると、その影響なしで走れる。"
  ],
  [
    "Modo rápido",
    "クイックモード"
  ],
  [
    "Você cuida só de contrato, mercado e das decisões do piloto: a equipe monta o carro e define a pré-temporada, e as categorias de base têm menos corridas. Dá para ligar e desligar no meio da carreira.",
    "契約、移籍市場、ドライバーの判断に集中するモード。マシンとプレシーズンはチームが担当し、育成カテゴリーのレース数も少なくなる。キャリア中に切り替え可能。"
  ],
  [
    "← Voltar",
    "← 戻る"
  ],
  [
    "Voltar",
    "戻る"
  ],
  [
    "Assinar contrato",
    "契約する"
  ],
  [
    "Pilotos",
    "ドライバー"
  ],
  [
    "Construtores",
    "コンストラクター"
  ],
  [
    "Imprensa",
    "メディア"
  ],
  [
    "Você não pilota. Contrata quem pilota, escolhe o motor, decide para onde vai o dinheiro do túnel de vento e responde por tudo isso no fim do ano.",
    "自分では走らない。走る人を雇い、エンジンを選び、風洞予算の使い道を決め、年末にそのすべての責任を負う。"
  ],
  [
    "Caminho",
    "進路"
  ],
  [
    "Equipe",
    "チーム"
  ],
  [
    "Você",
    "あなた"
  ],
  [
    "Nome do chefe",
    "チーム代表の名前"
  ],
  [
    "Nas décadas perigosas, um acidente pode tirar um piloto de várias corridas — ou da vida. Desligue para uma carreira sem esse peso.",
    "危険な時代には、事故で何戦も欠場したり、命を落とすこともある。無効にすると、その危険性なしでキャリアを楽しめる。"
  ],
  [
    "Assumir o comando",
    "指揮を執る"
  ],
  [
    "Finanças",
    "財務"
  ],
  [
    "História",
    "歴史"
  ],
  [
    "Notícias",
    "ニュース"
  ],
  [
    "Grid de largada",
    "スターティンググリッド"
  ],
  [
    "{0} categorias",
    "{0}カテゴリー"
  ],
  [
    "desde {0}",
    "{0}年から"
  ],
  [
    "Desligar as animações",
    "アニメーションをオフ"
  ],
  [
    "Ligar as animações",
    "アニメーションをオン"
  ],
  [
    "Animações ligadas.",
    "アニメーションをオンにしました。"
  ],
  [
    "Animações desligadas.",
    "アニメーションをオフにしました。"
  ],
  [
    "Criança no kart, como quase todo campeão começou. Anos de kart pela frente: carro, só a partir dos 15.",
    "多くの王者と同じく、子供のうちにカートから始める。マシンに乗れる15歳までは、カートで経験を積もう。"
  ],
  [
    "Comecinho de tudo: muitos anos de base pela frente, e todo o tempo do mundo para evoluir.",
    "すべての始まり。育成カテゴリーで過ごす年月も、成長する時間も十分にある。"
  ],
  [
    "A idade clássica de quem sonha em subir. Tempo de sobra para crescer.",
    "上を目指すドライバーの定番の年齢。成長する時間はたっぷりある。"
  ],
  [
    "Entrada mais tarde, já com alguma bagagem — e menos anos para provar seu valor.",
    "経験を持って少し遅めに参戦。ただし実力を証明する時間は短くなる。"
  ],
  [
    "Começo tardio: você já chega formado, mas o relógio corre contra.",
    "遅いスタート。すでに経験はあるが、時間との勝負になる。"
  ],
  [
    "Estreia muito tarde. Chega quase pronto e vai direto ao ponto — a janela é curta.",
    "かなり遅いデビュー。ほぼ完成した状態ですぐに勝負に入るが、チャンスの期間は短い。"
  ],
  [
    "Campeonato de estreia",
    "デビューする選手権"
  ],
  [
    "Pela idade: {0}",
    "年齢に応じて：{0}"
  ],
  [
    "grid real",
    "実際のグリッド"
  ],
  [
    "Você estreia na",
    "デビューカテゴリー："
  ],
  [
    "em {0}.",
    "{0}年。"
  ],
  [
    "Em {0}: {1} · começa na {2}",
    "{0}年：{1} · {2}から開始"
  ],
  [
    "Só existe a partir de {0}",
    "{0}年から参戦可能"
  ],
  [
    "Clássico",
    "クラシック"
  ],
  [
    "Realista",
    "リアル"
  ],
  [
    "Você contra o cronômetro. Contrato, mercado e pista — sem contas para pagar.",
    "あなたとストップウォッチの勝負。契約、移籍、レースに集中でき、支払いの心配はない。"
  ],
  [
    "Correr custa dinheiro. Patrocínio, academia, salário e uma escada que só sobe quem consegue pagar. Você também constrói relações no paddock e decide o que fazer com o que ganha.",
    "レースにはお金がかかる。スポンサー、アカデミー、給与、そして資金がなければ上がれない階段。パドックで人間関係を築き、収入の使い道も決める。"
  ],
  [
    "De onde você vem",
    "生い立ち"
  ],
  [
    "Origem humilde",
    "恵まれない家庭"
  ],
  [
    "Classe média",
    "中流家庭"
  ],
  [
    "Família rica",
    "裕福な家庭"
  ],
  [
    "Kart emprestado e caminhonete do vizinho. Sem patrocínio ou academia, a escada europeia não fecha.",
    "借りたカートと近所の人のトラック。スポンサーやアカデミーの支援なしでは、ヨーロッパのステップアップは難しい。"
  ],
  [
    "A família banca o começo e aperta o cinto. Dá para começar, não para chegar sozinho.",
    "家族が生活を切り詰め、最初の資金を出してくれる。始めるには十分だが、それだけで頂点には届かない。"
  ],
  [
    "Dinheiro não é o problema. Talento continua sendo.",
    "お金は問題ではない。才能は依然として必要だ。"
  ],
  [
    "começa com {0}",
    "初期資金：{0}"
  ],
  [
    "começa com {0} · a família banca {1} por ano até os {2}",
    "初期資金：{0} · {2}歳まで家族が年{1}を支援"
  ],
  [
    "Sair para o início",
    "ホームに戻る"
  ],
  [
    "A carreira fica salva. Você pode continuar depois.",
    "キャリアは保存され、後で続けられます。"
  ],
  [
    "Ficar",
    "続ける"
  ],
  [
    "Salvar e sair",
    "保存して終了"
  ],
  [
    "GERAL",
    "総合"
  ],
  [
    "Geral",
    "総合"
  ],
  [
    "{0} anos",
    "{0}歳"
  ],
  [
    "{0} · carro {1} · contrato de {2} anos",
    "{0} · マシン{1} · {2}年契約"
  ],
  [
    "{0} · carro {1} · contrato de {2} ano",
    "{0} · マシン{1} · {2}年契約"
  ],
  [
    "{0} · contrato de {1} anos",
    "{0} · {1}年契約"
  ],
  [
    "{0} · contrato de {1} ano",
    "{0} · {1}年契約"
  ],
  [
    "Provas · topo",
    "出走 · トップカテゴリー"
  ],
  [
    "Provas",
    "出走"
  ],
  [
    "Vitórias",
    "優勝"
  ],
  [
    "Pódios",
    "表彰台"
  ],
  [
    "Poles",
    "ポール"
  ],
  [
    "Ritmo",
    "ペース"
  ],
  [
    "Ultrapassagem",
    "オーバーテイク"
  ],
  [
    "Consistência",
    "安定性"
  ],
  [
    "Chuva",
    "雨での走り"
  ],
  [
    "Desenvolvim.",
    "開発"
  ],
  [
    "Desenvolvimento",
    "開発"
  ],
  [
    "Fama",
    "知名度"
  ],
  [
    "Moral",
    "士気"
  ],
  [
    "Formação ativa",
    "アカデミーに所属中"
  ],
  [
    "Formação ativa desde {0}",
    "{0}年からアカデミーに所属"
  ],
  [
    "Formação ativa desde {0} · ligado à {1}",
    "{0}年から所属 · 提携先：{1}"
  ],
  [
    "Formação ativa · ligado à {0}",
    "アカデミーに所属 · 提携先：{0}"
  ],
  [
    "Formação concluída em {0} · {1}",
    "{0}年に育成課程を修了 · {1}"
  ],
  [
    "Vínculo encerrado em {0} por desempenho.",
    "成績により{0}年に契約終了。"
  ],
  [
    "Vitrine",
    "トロフィーケース"
  ],
  [
    "Ainda vazia",
    "まだ何もありません"
  ],
  [
    "{0}× campeão mundial",
    "世界王者{0}回"
  ],
  [
    "{0}× campeão de base",
    "育成カテゴリー王者{0}回"
  ],
  [
    "{0} vitórias",
    "{0}勝"
  ],
  [
    "{0} voltas mais rápidas",
    "ファステストラップ{0}回"
  ],
  [
    "{0} temporadas",
    "{0}シーズン"
  ],
  [
    "Alta velocidade",
    "高速"
  ],
  [
    "Circuito de rua",
    "市街地コース"
  ],
  [
    "Misto",
    "ロードコース"
  ],
  [
    "Oval",
    "オーバル"
  ],
  [
    "Próxima etapa · rodada {0} de {1}",
    "次戦 · 全{1}戦中の第{0}戦"
  ],
  [
    "{0}% de chuva",
    "降水確率{0}%"
  ],
  [
    "pontos em dobro",
    "ポイント2倍"
  ],
  [
    "Carreira encerrada",
    "キャリア終了"
  ],
  [
    "Um acidente encerrou sua carreira.",
    "事故によりキャリアが終わりました。"
  ],
  [
    "O dinheiro acabou antes do talento.",
    "才能より先に資金が尽きました。"
  ],
  [
    "Nenhuma equipe ofereceu um lugar no grid.",
    "どのチームからもシートの提示がありませんでした。"
  ],
  [
    "Você pendurou o capacete.",
    "ヘルメットを脱ぐ決断をしました。"
  ],
  [
    "Você não corre mais.",
    "もうレースには出場しません。"
  ],
  [
    "Daqui em diante você só acompanha os números e o retrospecto.",
    "これからは成績や過去のレースを振り返れます。"
  ],
  [
    "Temporada encerrada",
    "シーズン終了"
  ],
  [
    "Todas as {0} etapas disputadas.",
    "全{0}戦を終えました。"
  ],
  [
    "Objetivo do cenário",
    "シナリオの目標"
  ],
  [
    "Pontuação",
    "得点制度"
  ],
  [
    "Confiabilidade",
    "信頼性"
  ],
  [
    "Companheiro",
    "チームメイト"
  ],
  [
    "Parceiros",
    "関係者"
  ],
  [
    "abrir",
    "開く"
  ],
  [
    "apostam em você",
    "あなたに期待している"
  ],
  [
    "observando",
    "様子を見ている"
  ],
  [
    "perdendo a paciência",
    "我慢の限界が近い"
  ],
  [
    "contrato por mais {0} anos",
    "契約はあと{0}年"
  ],
  [
    "contrato no último ano",
    "契約最終年"
  ],
  [
    "contrato exclusivo",
    "専属契約"
  ],
  [
    "contrato padrão",
    "標準契約"
  ],
  [
    "contrato livre",
    "自由契約"
  ],
  [
    "abandono",
    "リタイア"
  ],
  [
    "cansado",
    "疲労あり"
  ],
  [
    "duelos com {0}: {1} a {2}",
    "{0}との対戦成績：{1}対{2}"
  ],
  [
    "Contratar um empresário",
    "マネージャーを雇う"
  ],
  [
    "no campeonato",
    "選手権順位"
  ],
  [
    "No campeonato",
    "選手権順位"
  ],
  [
    "pontos",
    "ポイント"
  ],
  [
    "Pontos",
    "ポイント"
  ],
  [
    "grid real de {0}",
    "{0}年の実際のグリッド"
  ],
  [
    "grid real em parte ({0} de {1}), o resto é projeção",
    "一部が実際のグリッド（{1}人中{0}人）、残りはゲームの予測"
  ],
  [
    "grid projetado pelo jogo",
    "ゲームが生成したグリッド"
  ],
  [
    "Sem vaga",
    "シートなし"
  ],
  [
    "Próxima",
    "次戦"
  ],
  [
    "A disputar",
    "未開催"
  ],
  [
    "Grande Prêmio",
    "グランプリ"
  ],
  [
    "Clima",
    "天候"
  ],
  [
    "Classif.",
    "予選"
  ],
  [
    "Chegada",
    "決勝"
  ],
  [
    "vs Comp.",
    "対チームメイト"
  ],
  [
    "Pts",
    "ポイント"
  ],
  [
    "VMR",
    "FL"
  ],
  [
    "ABD",
    "リタイア"
  ],
  [
    "LES",
    "負傷"
  ],
  [
    "Voltas rápidas",
    "ファステストラップ"
  ],
  [
    "Abandonos",
    "リタイア"
  ],
  [
    "Melhor",
    "ベスト"
  ],
  [
    "Etapas",
    "ラウンド"
  ],
  [
    "Sua posição no campeonato, etapa a etapa",
    "各レース後の選手権順位"
  ],
  [
    "1º (topo)",
    "1位（上位）"
  ],
  [
    "{0} (base)",
    "{0}（下位）"
  ],
  [
    "Fim da carreira",
    "キャリアの終わり"
  ],
  [
    "Números",
    "統計"
  ],
  [
    "Os maiores",
    "歴代の偉大なドライバー"
  ],
  [
    "Nova carreira",
    "新しいキャリア"
  ],
  [
    "Correr — {0}",
    "レース — {0}"
  ],
  [
    "Simular o resto do ano",
    "残りのシーズンをシミュレート"
  ],
  [
    "Encerrar a temporada {0} →",
    "{0}年シーズンを終える →"
  ],
  [
    "sem carro desde a {0} etapa",
    "第{0}戦からシートなし"
  ],
  [
    "Pré-temporada",
    "プレシーズン"
  ],
  [
    "Como você anda",
    "あなたの走りの特徴"
  ],
  [
    "Empresário",
    "マネージャー"
  ],
  [
    "Rápido",
    "クイック"
  ],
  [
    "Completo",
    "フル"
  ],
  [
    "Salvar",
    "保存"
  ],
  [
    "Sair",
    "終了"
  ],
  [
    "No modo rápido a equipe monta o carro e define o treino da pré-temporada",
    "クイックモードではチームがマシンとプレシーズン練習を担当します"
  ],
  [
    "você",
    "あなた"
  ],
  [
    "{0} no total",
    "合計{0}"
  ],
  [
    "No kart o pior resultado de cada piloto é descartado",
    "カートでは各ドライバーの最下位成績を除外する"
  ],
  [
    "Em {0} só os {1} melhores resultados de cada piloto contam para o campeonato",
    "{0}年は各ドライバーのベスト{1}戦の成績だけが選手権に加算される"
  ],
  [
    ". O total aparece embaixo, quando é diferente.",
    "。合計が異なる場合は下に表示されます。"
  ],
  [
    "Carro",
    "マシン"
  ],
  [
    "Ano",
    "年"
  ],
  [
    "Categoria",
    "カテゴリー"
  ],
  [
    "Toque em uma temporada para rever o retrospecto corrida a corrida.",
    "シーズンを選ぶと、レースごとの成績を振り返れます。"
  ],
  [
    "Sua primeira temporada ainda está em disputa.",
    "初シーズンはまだ進行中です。"
  ],
  [
    "O que dizem de você — {0} registros",
    "あなたへの反応 — {0}件"
  ],
  [
    "O que dizem de você — {0} registro",
    "あなたへの反応 — {0}件"
  ],
  [
    "Homenagem à turma da F1 brasileira nas redes. As mensagens são geradas pelo jogo a partir da sua carreira — não são publicações reais dessas contas.",
    "ブラジルのF1コミュニティへのオマージュです。投稿はゲームがキャリアに基づいて生成したもので、実際のアカウントの投稿ではありません。"
  ],
  [
    "Informativo",
    "ニュース"
  ],
  [
    "Ninguém escreveu sobre você ainda.",
    "まだあなたについての記事はありません。"
  ],
  [
    "Vença, quebre ou apronte — a imprensa aparece.",
    "勝つ、壊す、騒ぎを起こす。そうすればメディアがやって来ます。"
  ],
  [
    "Fechar",
    "閉じる"
  ],
  [
    "VITÓRIA",
    "優勝"
  ],
  [
    "SEGUNDO LUGAR",
    "2位"
  ],
  [
    "TERCEIRO LUGAR",
    "3位"
  ],
  [
    "Você não largou. Ainda se recuperando do acidente.",
    "事故からの回復中のため、スタートできませんでした。"
  ],
  [
    "Largou em {0} e o carro parou{1}. Nada que você pudesse fazer no volante.",
    "{1}{0}からスタートしたものの、マシンが停止。コックピットでできることは何もありませんでした。"
  ],
  [
    "Fim de corrida contra a proteção{0}. Largou em {1} e não viu a bandeirada.",
    "{0}バリアへの衝突でレース終了。{1}からスタートしましたが、チェッカーには届きませんでした。"
  ],
  [
    "Pole, liderança na primeira curva e nenhuma ameaça até o fim{0}. Domínio completo.",
    "{0}ポールから第1コーナーを制し、最後まで危なげない走り。完勝です。"
  ],
  [
    "Largou apenas em {0} e venceu{1}. Uma daquelas corridas que ficam.",
    "{1}{0}からのスタートで優勝。記憶に残るレースになりました。"
  ],
  [
    "Venceu depois de largar em {pos}{clima}. A vitória apareceu e você não hesitou.",
    "{clima}{pos}からスタートして優勝。巡ってきたチャンスを逃しませんでした。"
  ],
  [
    "Subiu {0} posições e cravou o pódio em {pos}{clima}.",
    "{clima}{0}つ順位を上げ、{pos}で表彰台を獲得。"
  ],
  [
    "Pódio em {0}, saindo de {pos}{clima}. Corrida limpa e sólida.",
    "{clima}{pos}スタートから{0}で表彰台。クリーンで堅実なレースでした。"
  ],
  [
    "Recuperação enorme: de {0} para {pos}{clima}.",
    "{clima}大逆転：{0}から{pos}へ。"
  ],
  [
    "Ganhou {0} posições e terminou em {pos}{clima}.",
    "{clima}{0}つ順位を上げ、{pos}でフィニッシュ。"
  ],
  [
    "Caiu de {0} para {pos}{clima}. Um domingo para esquecer.",
    "{clima}{0}から{pos}に後退。忘れたい日曜日です。"
  ],
  [
    "Perdeu {0} posições e chegou em {pos}{clima}.",
    "{clima}{0}つ順位を落とし、{pos}でフィニッシュ。"
  ],
  [
    "Segurou a posição e terminou em {pos}{clima}.",
    "{clima}順位を守り、{pos}でフィニッシュ。"
  ],
  [
    "Cravou a volta mais rápida da prova.",
    "レースのファステストラップも記録しました。"
  ],
  [
    "debaixo de água",
    "激しい雨の中で、"
  ],
  [
    "Onde você vai passar a pré-temporada",
    "プレシーズンを過ごす場所"
  ],
  [
    "E onde você põe a si mesmo",
    "自分に何を求めるか"
  ],
  [
    "{0} de {1}",
    "{1}中{0}"
  ],
  [
    "Deixar com a equipe",
    "チームに任せる"
  ],
  [
    "Fechar a pré-temporada →",
    "プレシーズンを終える →"
  ],
  [
    "Março",
    "3月"
  ],
  [
    "saiu melhor do que devia",
    "予想以上の成果"
  ],
  [
    "funcionou",
    "成功"
  ],
  [
    "ficou no meio do caminho",
    "中途半端な成果"
  ],
  [
    "não funcionou",
    "失敗"
  ],
  [
    "A pré-temporada passou sem nada de especial.",
    "特筆すべきこともなくプレシーズンが終わりました。"
  ],
  [
    "Alguma coisa sobre você",
    "自分について分かったこと"
  ],
  [
    "Começar a temporada →",
    "シーズンを始める →"
  ],
  [
    "O que as corridas mostraram sobre o seu jeito de pilotar",
    "レースから見えてきた、あなたのドライビング"
  ],
  [
    "Ninguém te entrega uma ficha com as suas qualidades. Elas aparecem nos resultados, e primeiro como desconfiança.",
    "誰かが長所の一覧を渡してくれるわけではない。結果の中に、まずは予感として表れる。"
  ],
  [
    "confirmado",
    "確定"
  ],
  [
    "suspeita",
    "兆候あり"
  ],
  [
    "Ainda é cedo. Corra mais e alguma coisa vai começar a aparecer.",
    "まだ判断は早い。レースを重ねれば、何かが見えてきます。"
  ],
  [
    "O que vale já valia antes de você desconfiar. Descobrir só muda o que você faz com isso.",
    "気づく前から、その特性はすでに存在していた。発見によって変わるのは、その活かし方だけだ。"
  ],
  [
    "Treino livre {0}",
    "フリー走行{0}"
  ],
  [
    "O céu",
    "空模様"
  ],
  [
    "A cabeça",
    "精神状態"
  ],
  [
    "O que aconteceu fora da pista te deixou embalado: você anda mais",
    "コース外の出来事が追い風となり、速さが増している"
  ],
  [
    "O que aconteceu fora da pista ainda pesa: você anda menos",
    "コース外の出来事がまだ重くのしかかり、速さが落ちている"
  ],
  [
    "nesta corrida",
    "このレース"
  ],
  [
    "por mais {0} corridas",
    "あと{0}レース"
  ],
  [
    "O que já foi feito",
    "これまでに行ったこと"
  ],
  [
    "O que fazer com esta sessão",
    "このセッションの使い方"
  ],
  [
    "Nem toda sessão rende. E o que o engenheiro conclui não é necessariamente o que aconteceu.",
    "毎回のセッションで成果が出るとは限らない。エンジニアの結論が事実とは限らない。"
  ],
  [
    "Deixar a equipe conduzir a sexta",
    "金曜日の進行をチームに任せる"
  ],
  [
    "sessão encerrada",
    "セッション終了"
  ],
  [
    "O engenheiro",
    "エンジニア"
  ],
  [
    "Você vai saber no sábado se ele tinha razão.",
    "彼の見立てが正しかったかどうかは、土曜日に分かります。"
  ],
  [
    "Ir para o acerto →",
    "セットアップへ →"
  ],
  [
    "Próxima sessão →",
    "次のセッション →"
  ],
  [
    "Quando entrar na pista",
    "コースに出るタイミング"
  ],
  [
    "A pista melhora com borracha, e piora com tráfego, bandeira e tempo que vira. Ninguém sabe de antemão qual das três pesa mais hoje.",
    "路面はラバーで改善し、交通、旗、天候変化で悪化する。今日はどれが最も影響するか、事前には誰にも分からない。"
  ],
  [
    "Neste formato você não escolhe a hora: a ordem é definida pelo regulamento e você tem uma tentativa só.",
    "この形式では走行時刻を選べない。規則で順番が決まり、チャンスは1回だけ。"
  ],
  [
    "Fazer a sua volta",
    "アタックラップを走る"
  ],
  [
    "Uma tentativa. É o que existe.",
    "チャンスは1回。それがすべて。"
  ],
  [
    "PRIMEIRA FILA",
    "フロントグリッド"
  ],
  [
    "DENTRO DOS DEZ",
    "トップ10入り"
  ],
  [
    "GRID DE TRÁS",
    "後方グリッド"
  ],
  [
    "Classificação",
    "予選"
  ],
  [
    "Os dez primeiros",
    "トップ10"
  ],
  [
    "Domingo →",
    "日曜日へ →"
  ],
  [
    "Sexta-feira",
    "金曜日"
  ],
  [
    "Sábado",
    "土曜日"
  ],
  [
    "Domingo de manhã",
    "日曜の朝"
  ],
  [
    "O que você faz",
    "どう行動するか"
  ],
  [
    "Continuar →",
    "続ける →"
  ],
  [
    "Continuar",
    "続ける"
  ],
  [
    "medido",
    "測定済み"
  ],
  [
    "impressão",
    "印象"
  ],
  [
    "sem dado",
    "データなし"
  ],
  [
    "Saiu da telemetria. Ele tem dado para sustentar.",
    "テレメトリーに基づいた判断。裏付けとなるデータがある。"
  ],
  [
    "É o que ele achou olhando você passar. Pode não ser isso.",
    "走行を見て抱いた印象。実際は違うかもしれない。"
  ],
  [
    "Não deu tempo de olhar este trecho. Se você mandar mexer, a equipe vai no palpite.",
    "この区間を調べる時間がなかった。変更を指示すれば、チームは勘で対応する。"
  ],
  [
    "é aqui que o tempo está",
    "ここがラップタイムの鍵"
  ],
  [
    "vale um bom tanto de tempo",
    "かなりのタイムに影響する"
  ],
  [
    "vale alguma coisa",
    "多少の効果はある"
  ],
  [
    "quase não vale tempo",
    "タイムへの影響はほとんどない"
  ],
  [
    "e o problema é grande",
    "しかも問題は大きい"
  ],
  [
    "e é ajuste de detalhe",
    "微調整で足りる"
  ],
  [
    "Deixar",
    "そのまま"
  ],
  [
    "Um passo",
    "1段階"
  ],
  [
    "Ir até o fim",
    "大きく変更"
  ],
  [
    "não mexe neste trecho",
    "この区間は変更しない"
  ],
  [
    "ajuste pequeno, sem custo de tempo de pista",
    "走行時間を失わない小さな調整"
  ],
  [
    "muda o carro de verdade — consome tempo de pista",
    "大きくマシンを変えるため、走行時間を消費する"
  ],
  [
    "— Aqui eu não tenho nada. A sexta não deu tempo.",
    "— ここはデータがない。金曜日は時間が足りなかった。"
  ],
  [
    "Na conta dele, {0}, {1}. {2}",
    "彼の見立てでは、{0}、{1}。{2}"
  ],
  [
    "Sexta-feira na garagem",
    "金曜日のガレージ"
  ],
  [
    "O que o engenheiro trouxe",
    "エンジニアからの報告"
  ],
  [
    "{0} ataque restante",
    "大きな変更はあと{0}回"
  ],
  [
    "{0} ataques restantes",
    "大きな変更はあと{0}回"
  ],
  [
    "sem tempo de pista",
    "走行時間なし"
  ],
  [
    "— Sinceramente? O carro já nasceu perto do ponto nesta pista. Não vejo muito a ganhar mexendo, e vejo bastante a perder.",
    "— 正直、このコースでは最初からマシンはほぼ適正だ。いじって得るものは少なく、失うものは多い。"
  ],
  [
    "O histórico dele com você: {0}",
    "あなたとの仕事での実績：{0}"
  ],
  [
    "Como o carro sai da garagem",
    "ガレージを出るマシンの方向性"
  ],
  [
    "Quanto você pede do motor",
    "エンジンをどこまで使うか"
  ],
  [
    "Mais motor é mais ritmo e mais chance de o fim de semana acabar no muro de boxes.",
    "出力を上げれば速くなるが、週末をピットで終える危険も増える。"
  ],
  [
    "O carro que vai para a pista",
    "コースに出るマシン"
  ],
  [
    "Deixar com o engenheiro",
    "エンジニアに任せる"
  ],
  [
    "Ir para a classificação →",
    "予選へ →"
  ],
  [
    "PROBLEMA MECÂNICO",
    "機械トラブル"
  ],
  [
    "NÃO LARGOU",
    "出走せず"
  ],
  [
    "ACIDENTE",
    "事故"
  ],
  [
    "{0} LUGAR",
    "順位：{0}"
  ],
  [
    "pista molhada",
    "ウェット路面"
  ],
  [
    "pista seca",
    "ドライ路面"
  ],
  [
    "molhado",
    "ウェット"
  ],
  [
    "seco",
    "ドライ"
  ],
  [
    "No rádio, depois da bandeirada",
    "チェッカー後の無線"
  ],
  [
    "Acerto",
    "セットアップ"
  ],
  [
    "Acerto (automático)",
    "セットアップ（自動）"
  ],
  [
    "O que o dado real mostrou",
    "実際のデータが示したこと"
  ],
  [
    "Ele não tinha dado aqui.",
    "彼にはこの区間のデータがありませんでした。"
  ],
  [
    "O diagnóstico dele estava certo.",
    "彼の診断は正しかった。"
  ],
  [
    "O diagnóstico dele estava errado — o trecho pedia o contrário.",
    "彼の診断は逆でした。この区間には反対の調整が必要でした。"
  ],
  [
    "Você não mexeu, e este trecho pedia muito.",
    "大きな変更が必要な区間でしたが、変更しませんでした。"
  ],
  [
    "Você não mexeu.",
    "変更しませんでした。"
  ],
  [
    "Você foi até o fim no sentido errado e piorou o carro.",
    "反対方向へ大きく変更し、マシンを悪化させました。"
  ],
  [
    "Você mexeu para o lado errado.",
    "間違った方向に調整しました。"
  ],
  [
    "Você foi até o fim, e era isso que ele pedia.",
    "必要だったとおり、大きく変更しました。"
  ],
  [
    "Um passo no sentido certo, que era o tamanho do problema.",
    "正しい方向への1段階の調整で、問題の大きさに合っていました。"
  ],
  [
    "Sentido certo, mas você parou no meio do caminho.",
    "方向は正しかったものの、変更が足りませんでした。"
  ],
  [
    "Sentido certo, só que você passou do ponto.",
    "方向は正しかったものの、変更しすぎました。"
  ],
  [
    "Era o trecho que decidia a volta.",
    "ラップを決定づける区間でした。"
  ],
  [
    "Contava, mas não era tudo.",
    "影響はありましたが、すべてではありませんでした。"
  ],
  [
    "No fim, era o trecho que menos importava.",
    "結局、最も影響の小さい区間でした。"
  ],
  [
    "Pts no ano",
    "シーズン得点"
  ],
  [
    "Classificação da prova",
    "決勝順位"
  ],
  [
    "Próxima corrida →",
    "次のレース →"
  ],
  [
    "Encerrar a temporada →",
    "シーズンを終える →"
  ],
  [
    "Campeonato",
    "選手権"
  ],
  [
    "Carreira salva neste aparelho.",
    "キャリアをこの端末に保存しました。"
  ],
  [
    "Salvo só nesta sessão — este navegador bloqueou o armazenamento.",
    "ブラウザーが保存を拒否したため、このセッション中のみ保持されます。"
  ],
  [
    "Não foi possível salvar a carreira.",
    "キャリアを保存できませんでした。"
  ],
  [
    "Não consegui abrir o save.",
    "セーブデータを開けませんでした。"
  ],
  [
    "No grid",
    "グリッド人数"
  ],
  [
    "A partir daqui nada está escrito: a carreira segue normalmente, com contratos, mercado, evolução e aposentadoria. O objetivo é só o ponto de partida.",
    "ここからの未来は白紙。契約、移籍、成長、引退を含む通常のキャリアが続きます。目標は出発点にすぎません。"
  ],
  [
    "Entrar na pista →",
    "コースへ →"
  ],
  [
    "Ser campeão mundial em 2008",
    "2008年の世界王者になる"
  ],
  [
    "Conquistar o oitavo título",
    "8度目のタイトルを獲得する"
  ],
  [
    "Escrever a carreira que não aconteceu",
    "実現しなかったキャリアを描く"
  ],
  [
    "Cumprir a carreira que foi prometida",
    "期待されたキャリアを実現する"
  ],
  [
    "Ser tricampeão em 2007",
    "2007年に3度目の王者になる"
  ],
  [
    "Confirmar o terceiro título",
    "3度目のタイトルを決める"
  ],
  [
    "Enfim, o título mundial",
    "ついに世界王者へ"
  ],
  [
    "Provar que a aposta valia a pena",
    "賭ける価値があったと証明する"
  ],
  [
    "O título que faltou",
    "手にできなかったタイトル"
  ],
  [
    "Construir a carreira europeia que não houve",
    "実現しなかったヨーロッパでのキャリアを築く"
  ],
  [
    "Vencer as 500 Milhas de Indianápolis",
    "Indianapolis 500で優勝する"
  ],
  [
    "Mais um título brasileiro",
    "ブラジル選手権でもう一度王者に"
  ],
  [
    "Ser campeão da Stock Car",
    "Stock Car王者になる"
  ],
  [
    "Repetir o título da temporada",
    "再びシーズン王者になる"
  ],
  [
    "Cumprido — campeão.",
    "達成 — チャンピオン。"
  ],
  [
    "As 500 Milhas ainda não foram disputadas.",
    "Indianapolis 500はまだ開催されていません。"
  ],
  [
    "Corridas Regionais",
    "地域レース"
  ],
  [
    "Kart Regional",
    "地域カート"
  ],
  [
    "Kart Nacional",
    "国内カート"
  ],
  [
    "Kart Mundial",
    "世界カート"
  ],
  [
    "Kart Brasileiro",
    "ブラジルカート"
  ],
  [
    "Kart Argentino",
    "アルゼンチンカート"
  ],
  [
    "Fórmula Ford",
    "Formula Ford"
  ],
  [
    "Fórmula Júnior",
    "Formula Junior"
  ],
  [
    "Fórmula 4",
    "Formula 4"
  ],
  [
    "Fórmula Renault",
    "Formula Renault"
  ],
  [
    "Fórmula 3 (500cc)",
    "Formula 3（500cc）"
  ],
  [
    "Fórmula 3",
    "Formula 3"
  ],
  [
    "Fórmula 3000",
    "Formula 3000"
  ],
  [
    "Fórmula 2",
    "Formula 2"
  ],
  [
    "Fórmula 1",
    "Formula 1"
  ],
  [
    "Fórmula E",
    "Formula E"
  ],
  [
    "Mundial de Endurance",
    "世界耐久選手権"
  ],
  [
    "Grã-Bretanha",
    "イギリス"
  ],
  [
    "Europa",
    "ヨーロッパ"
  ],
  [
    "Pacífico",
    "太平洋"
  ],
  [
    "Coreia",
    "韓国"
  ],
  [
    "70º Aniversário",
    "70周年記念"
  ],
  [
    "Emília-Romanha",
    "エミリア・ロマーニャ"
  ],
  [
    "Estíria",
    "シュタイアーマルク"
  ],
  [
    "Toscana",
    "トスカーナ"
  ],
  [
    "Cidade do México",
    "メキシコシティ"
  ],
  [
    "Xangai",
    "上海"
  ],
  [
    "Jedá",
    "ジェッダ"
  ],
  [
    "Indianápolis",
    "Indianapolis"
  ],
  [
    "24 Horas de Le Mans",
    "Le Mans 24時間"
  ],
  [
    "Que orgulho ver {nacionalidade} campeão de novo. Muito bem, {eu}.",
    "再び{nacionalidade}が王者になる姿を見られて誇らしい。よくやった、{eu}。"
  ],
  [
    "Que orgulho ver {nacArtigo} campeão de novo. Muito bem, {eu}.",
    "再び{nacArtigo}が王者になる姿を見られて誇らしい。よくやった、{eu}。"
  ],
  [
    "Que orgulho ver {0} campeão de novo. Muito bem, {1}.",
    "再び{0}が王者になる姿を見られて誇らしい。よくやった、{1}。"
  ],
  [
    "Formação na {0} concluída: você chegou à {1}.",
    "{0}の育成課程を修了：{1}へ到達しました。"
  ],
  [
    "A {0} encerrou seu contrato de formação após resultados abaixo da expectativa. Você segue sem o apoio do programa.",
    "期待を下回る成績により、{0}が育成契約を終了しました。今後はプログラムの支援なしで活動します。"
  ],
  [
    "Idioma",
    "言語"
  ],
  [
    "GP {gp}",
    "{gp}GP"
  ],
  [
    "{0} a {1}",
    "{0}〜{1}"
  ],
  [
    "Argentino de Kart",
    "アルゼンチンカート"
  ],
  [
    "1.500 cv na classificação, fumaça branca e três nomes decidindo tudo: Prost, Senna, Piquet.",
    "予選で1,500馬力、白煙、そしてすべてを決する3人。Prost、Senna、Piquet。"
  ],
  [
    "ainda está formando opinião",
    "まだ判断を保留している"
  ],
  [
    "{0}% do que você ganha",
    "収入の{0}%"
  ],
  [
    "Você ganhou posições em quase toda corrida. O seu domingo vale mais que o seu sábado.",
    "ほぼ毎戦で順位を上げました。あなたは土曜日より日曜日に強いドライバーです。"
  ],
  [
    "O seu companheiro levou a melhor em {0} dos {1} domingos, e isso pesa mais do que qualquer coisa.",
    "全{1}戦中{0}戦でチームメイトに敗れました。何より重い評価材料です。"
  ],
  [
    "Você ainda está aprendendo esta categoria — e isso apareceu em quase todo fim de semana.",
    "まだこのカテゴリーを学んでいる段階で、それがほぼ毎週末に表れました。"
  ],
  [
    "Avaliação da equipe",
    "チームの評価"
  ],
  [
    "A equipe esperava mais. Você entra no próximo ano sob pressão.",
    "チームはもっと期待していました。来年はプレッシャーのかかる年になります。"
  ],
  [
    "Descer para {cat}",
    "{cat}に降格"
  ],
  [
    "Continuar na {cat}",
    "{cat}を継続"
  ],
  [
    "Nenhuma equipe da {cat} te quer. Descer uma categoria, ganhar e voltar pela porta da frente.",
    "{cat}ではどのチームもあなたを求めていません。1カテゴリー下で勝ち、堂々と戻ってきましょう。"
  ],
  [
    "Outro campeonato do mesmo nível: a {0} quer você no {1} ({2}). A carreira passa a seguir a escada de {3}. Grid real daquele ano.",
    "同じレベルの別選手権からの誘い：{0}が{1}（{2}）であなたを求めています。キャリアは{3}への階段に切り替わります。その年の実際のグリッドです。"
  ],
  [
    "diz seu empresário",
    "マネージャーの話"
  ],
  [
    "Nem considerou: você está bem abaixo do que eles procuram.",
    "検討にも至らず。求める水準を大きく下回っています。"
  ],
  [
    "Gosta do seu trabalho, mas quer mais resultado — ou mais nome — antes.",
    "走りは評価していますが、まずは結果や知名度が必要です。"
  ],
  [
    "Melhor temporada",
    "ベストシーズン"
  ],
  [
    "{0} — de {1} até hoje",
    "{0} — {1}年から現在まで"
  ],
  [
    "{0} de {1} titulares",
    "レギュラー{1}人中{0}人"
  ],
  [
    "sem reserva",
    "リザーブなし"
  ],
  [
    "{0} ano",
    "{0}年"
  ],
  [
    "{0} conversa(s) sobrando nesta pré-temporada",
    "このプレシーズンに残る交渉回数：{0}"
  ],
  [
    "{0} de {1} vagas",
    "定員{1}人中{0}人"
  ],
  [
    "IndyCar 50-40-35-32-30… até o último + 1 pela pole (Indianápolis vale em dobro)",
    "IndyCar：50-40-35-32-30…最下位まで得点＋ポール1点（Indianapolisは2倍）"
  ],
  [
    "25-18-15-12-10… + 1 pela pole (Le Mans vale em dobro)",
    "25-18-15-12-10…＋ポール1点（Le Mansは2倍）"
  ],
  [
    "O calendário da Fórmula 1 é o calendário real de cada ano, prova por prova, de 1950 em diante. Nas outras três, os circuitos, o número de etapas e o regulamento são os da época — o sorteio de cada temporada é fixo, então 1987 é sempre 1987.",
    "F1は1950年以降、各年の実際のレース日程に従います。他の3カテゴリーは当時のコース、戦数、規則を使用します。各年の日程は固定なので、1987年は常に同じ1987年です。"
  ],
  [
    "7 carreiras",
    "7つのキャリア"
  ],
  [
    "{0} campeonatos reais",
    "{0}の実在選手権"
  ],
  [
    "País desconhecido",
    "不明な国"
  ],
  [
    "Volante de Ouro, início",
    "Volante de Ouro、ホーム"
  ],
  [
    "Bem-vindo ao paddock",
    "パドックへようこそ"
  ],
  [
    "Vamos correr",
    "レースへ"
  ],
  [
    "Entendi",
    "分かりました"
  ],
  [
    "Consist.",
    "安定性"
  ],
  [
    "Escolha um sobrenome (mínimo 2 letras).",
    "姓を入力してください（2文字以上）。"
  ],
  [
    "O número precisa ser entre 1 e 99.",
    "番号は1〜99にしてください。"
  ],
  [
    "Escolha uma nacionalidade da lista.",
    "リストから国籍を選んでください。"
  ],
  [
    "Suba de categoria terminando entre os primeiros. Cada corrida entra no seu retrospecto — e ele fica guardado para sempre no arquivo da carreira.",
    "上位入賞で次のカテゴリーを目指しましょう。すべてのレースが成績表に記録され、キャリアのアーカイブに残ります。"
  ],
  [
    "Você começa na {0} em {1}, mirando a {2}.",
    "{1}年に{0}から始め、{2}を目指します。"
  ],
  [
    ", {0} anos, {1}. Você começa na {2} em {3}, mirando a {4}. {5}",
    "、{0}歳、{1}。{3}年に{2}から始め、{4}を目指します。{5}"
  ],
  [
    "Um resumo rápido antes de entrar no carro.",
    "マシンに乗り込む前の簡単な説明です。"
  ],
  [
    "A carreira.",
    "キャリア。"
  ],
  [
    "Academias.",
    "アカデミー。"
  ],
  [
    "O retrospecto.",
    "レース記録。"
  ],
  [
    "As sete carreiras.",
    "7つのキャリア。"
  ],
  [
    "O calendário.",
    "カレンダー。"
  ],
  [
    "O grid.",
    "グリッド。"
  ],
  [
    "Você escolhe quando começar.",
    "開始時期を選べます。"
  ],
  [
    "Modo Cenário.",
    "シナリオモード。"
  ],
  [
    "As décadas.",
    "年代。"
  ],
  [
    "A vaga não é sua para sempre.",
    "シートは永久に保証されません。"
  ],
  [
    "Os atributos.",
    "能力。"
  ],
  [
    "O carro.",
    "マシン。"
  ],
  [
    "O mercado não vira de cabeça para baixo todo ano.",
    "毎年すべての移籍が入れ替わるわけではありません。"
  ],
  [
    "Cada piloto continua onde estava; por temporada mudam de casa umas quatro a sete pessoas. E as transferências que aconteceram de verdade acontecem no ano certo: Senna vai para a Williams em 1994, Schumacher para a Ferrari em 1996, Hamilton para a Ferrari em 2025.",
    "多くのドライバーは所属先を維持し、毎シーズン4〜7人ほどが移籍します。史実の移籍も正しい年に起きます。Sennaは1994年にWilliamsへ、Schumacherは1996年にFerrariへ、Hamiltonは2025年にFerrariへ移ります。"
  ],
  [
    "Toda corrida entra na tabela da temporada: classificação, chegada, clima, pontos e o confronto direto com seu companheiro de equipe. Toque em qualquer linha para rever a prova. Quando o ano acaba, a temporada inteira vai para o arquivo e nunca se perde.",
    "各レースの予選、決勝、天候、得点、チームメイトとの比較がシーズン表に記録されます。行を選ぶと詳細を確認できます。年が終わるとシーズン全体がアーカイブに入り、記録は失われません。"
  ],
  [
    "Nas categorias de base o material é parecido e o talento aparece. Na Fórmula 1, um carro ruim segura qualquer um — por isso a escolha da equipe no fim de cada ano é a decisão mais importante da carreira.",
    "育成カテゴリーでは機材の差が小さく、才能が表れます。F1では悪いマシンなら誰でも苦戦するため、年末のチーム選びがキャリアで最も重要な判断になります。"
  ],
  [
    "Ritmo manda na classificação; ultrapassagem e consistência mandam na corrida; chuva vira tudo do avesso; desenvolvimento faz seu carro melhorar ao longo do ano. Eles crescem enquanto você é jovem e caem depois dos trinta e poucos.",
    "ペースは予選、オーバーテイクと安定性は決勝に影響します。雨は勢力図を変え、開発はシーズン中のマシンを改善します。能力は若いうちに伸び、30代以降は低下します。"
  ],
  [
    "No fim de cada ano a equipe compara o que você entregou com o que aquele carro deveria render — e com o seu companheiro, que é a única régua justa. Um ano ruim é advertência. Dois seguidos, ou um desastre completo, e o contrato acaba. Nos casos mais graves, você perde o carro antes mesmo de a temporada terminar.",
    "年末にはチームがマシンの実力と実際の結果を比較し、同じ条件のチームメイトとの成績も評価します。不振の年は警告、2年続く不振や壊滅的な結果なら契約終了。深刻な場合はシーズン途中でもシートを失います。"
  ],
  [
    "Assuma um piloto real num ponto exato da história — Massa em 2008, Hamilton em 2021, Senna a partir de 1994 — ou pegue qualquer piloto de qualquer grid desde 1950 e conduza a carreira do seu jeito.",
    "2008年のMassa、2021年のHamilton、1994年以降のSennaなど、歴史のある瞬間から実在のドライバーを引き継げます。1950年以降の好きなグリッドから選び、自分なりのキャリアを築くこともできます。"
  ],
  [
    "Cada época tem suas equipes, seus rivais, sua pontuação e sua confiabilidade. Nos anos 50, metade do grid abandona e o risco é real; nos anos 2020, quase todo mundo termina e o carro decide quase tudo. Se sua carreira atravessar uma virada de década, o mundo muda ao seu redor.",
    "各時代には、その時代のチーム、ライバル、得点制度、信頼性があります。1950年代は半数がリタイアし、危険も現実的。2020年代はほぼ全員が完走し、マシンが結果を大きく左右します。年代をまたぐと、周囲の世界も変わります。"
  ],
  [
    "O ano exato dentro da década e a idade de estreia, de 8 a 30 anos: quem começa criança fica no kart até ter idade para um carro. Começar cedo dá muitos anos de base; começar tarde te coloca direto numa categoria alta, com menos tempo para provar seu valor. E o fim não tem idade fixa: há quem apague antes dos 35 e quem ainda corra depois dos 50.",
    "年代内の開始年と8〜30歳のデビュー年齢を選べます。子供はマシンに乗れる年齢までカートを続けます。早く始めれば育成期間が長く、遅く始めれば上位から始まる代わりに実力を示す時間は短くなります。引退年齢も固定ではなく、35歳前に衰える人も50歳を過ぎて走る人もいます。"
  ],
  [
    "O tamanho do pelotão e o número de carros por equipe seguem a época: 29 carros e escuderias com três monopostos nos anos 50, 20 carros e dois por equipe hoje. E só entram os pilotos que realmente corriam naquele ano — Schumacher não divide a pista com Antonelli.",
    "参加台数やチームの台数は時代に従います。1950年代は29台や3台体制のチーム、現在は20台と各チーム2台。実際にその年に走っていたドライバーだけが登場するため、SchumacherとAntonelliが同時に走ることはありません。"
  ],
  [
    "Na Fórmula 1 é o calendário real de cada ano, prova por prova: 1950 tem sete etapas e termina em Monza; 2024 tem vinte e quatro e começa no Bahrein. Nas outras seis, os circuitos, o número de etapas e o regulamento são os da época, e o calendário de cada ano é sempre o mesmo.",
    "F1は各年の実際の日程を使用します。1950年は7戦でMonzaが最終戦、2024年は24戦でバーレーンが開幕戦です。他の6カテゴリーも当時のコース、戦数、規則を用い、各年の日程は固定です。"
  ],
  [
    "A escada é longa e depende de onde você nasceu. Um brasileiro em 2024 sobe pelo Kart Regional, pelo Brasileiro de Kart, pelo Mundial de Kart, pela Fórmula 4 Brasil (que existe desde 2022), pela Fórmula Regional, F3 e F2 até chegar à Fórmula 1. Um italiano faz o mesmo caminho pelo Italiano de Kart e pela F4 Italiana; quem não tem campeonato nacional próprio pega o equivalente internacional.",
    "ステップアップの道は長く、出身国によって異なります。2024年のブラジル人なら地域カート、ブラジルカート、世界カート、2022年創設のF4 Brasil、Formula Regional、F3、F2を経てF1へ進みます。イタリア人は国内カートとF4 Italianaを通り、国内選手権のない国では相当する国際カテゴリーを利用します。"
  ],
  [
    "Uma boa temporada de base chama a atenção de um programa de formação — Red Bull Junior, Ferrari Driver Academy, Mercedes Junior, Programa Petrobras, Road to Indy. Entrar acelera sua evolução, pesa no mercado e abre a porta da equipe-mãe. Convites podem aparecer em diferentes categorias da base, conforme seus resultados, seu nível e seu potencial, com programas diferentes e sem garantia. Trocar de equipe não rompe o vínculo, mas a academia pode dispensar quem não corresponde. Anos ruins seguidos aumentam o risco; potencial e adaptação contam para receber outra chance. Ao estrear na Fórmula 1 ou em outra categoria principal, a formação é concluída sem penalidade.",
    "育成カテゴリーで活躍するとRed Bull Junior、Ferrari Driver Academy、Mercedes Junior、Programa Petrobras、Road to Indyなどが注目します。加入すると成長が速まり、移籍で有利になり、親チームへの道も開けます。結果、実力、潜在能力に応じてさまざまなカテゴリーで誘いが届きますが、保証はありません。チーム移籍だけで所属は失いませんが、不振が続けばアカデミーから放出されることもあります。猶予には潜在能力や適応状況も影響します。F1などのトップカテゴリーに到達すると、ペナルティなしで育成課程を修了します。"
  ],
  [
    "Anos {0}",
    "{0}年代"
  ],
  [
    "A Era Heroica",
    "英雄たちの時代"
  ],
  [
    "Motor Traseiro",
    "リアエンジン"
  ],
  [
    "Asas e Efeito Solo",
    "ウイングとグラウンドエフェクト"
  ],
  [
    "Era Turbo",
    "ターボ時代"
  ],
  [
    "Eletrônica e Rivalidade",
    "電子制御とライバル対決"
  ],
  [
    "Domínio e Reação",
    "支配と反撃"
  ],
  [
    "Híbridos e Dinastias",
    "ハイブリッドと王朝"
  ],
  [
    "Efeito Solo de Volta",
    "グラウンドエフェクトの復活"
  ],
  [
    "Motor na frente, capacete de couro e nenhuma proteção. Metade do grid não vê a bandeirada.",
    "フロントエンジン、革のヘルメット、安全装備はほぼなし。半数がチェッカーに届かない。"
  ],
  [
    "A revolução do motor traseiro. Carros leves, pilotos-engenheiros e Nürburgring de 22 km.",
    "リアエンジン革命。軽量マシン、エンジニアでもあるドライバー、22kmのNürburgring。"
  ],
  [
    "Patrocínio, aerodinâmica e efeito solo. A F1 vira espetáculo global — e segue mortal.",
    "スポンサー、空力、グラウンドエフェクト。F1は世界的なショーとなる一方、危険なままだ。"
  ],
  [
    "Suspensão ativa, controle de tração e o duelo que definiu uma geração. Depois, Imola muda tudo.",
    "アクティブサスペンション、トラクションコントロール、世代を象徴する対決。そしてImolaですべてが変わる。"
  ],
  [
    "V10 a 19 mil giros, pit stops com reabastecimento e uma vermelha que ganhou cinco seguidos.",
    "19,000回転のV10、給油ピットストップ、赤いマシンの5連覇。"
  ],
  [
    "DRS, pneus que se degradam de propósito e motores híbridos. Duas equipes ganham quase tudo.",
    "DRS、意図的に劣化するタイヤ、ハイブリッドエンジン。ほぼ2チームが勝利を独占。"
  ],
  [
    "Teto orçamentário, efeito solo e um grid que se renova. A história ainda está sendo escrita.",
    "予算上限、グラウンドエフェクト、新世代のグリッド。歴史は今も続いている。"
  ],
  [
    "Estrear nos {0}: {1}",
    "{0}年代にデビュー：{1}"
  ],
  [
    "Começar uma carreira na {0}",
    "{0}でキャリアを始める"
  ],
  [
    "O topo do automobilismo mundial. Monopostos, circuitos consagrados e a pressão máxima.",
    "世界のモータースポーツの頂点。フォーミュラカー、名門コース、最大のプレッシャー。"
  ],
  [
    "Ovais a 380 km/h, circuitos de rua e as 500 Milhas de Indianápolis valendo o dobro.",
    "時速380kmのオーバル、市街地コース、ポイント2倍のIndianapolis 500。"
  ],
  [
    "Protótipos, revezamento e provas de 6, 12 e 24 horas. Le Mans decide a temporada.",
    "プロトタイプ、ドライバー交代、6・12・24時間のレース。Le Mansがシーズンを決める。"
  ],
  [
    "Carros de teto, grid invertido e o campeonato mais disputado das Américas.",
    "屋根付きマシン、リバースグリッド、南北アメリカ屈指の激戦選手権。"
  ],
  [
    "Ovais lotados, corridas de 500 milhas em pelotão e o campeonato mais popular dos Estados Unidos.",
    "満員のオーバル、集団で争う500マイル、アメリカで最も人気の選手権。"
  ],
  [
    "Turismo alemão: carros de teto, corridas curtas e o roçar de para-lamas como regra.",
    "ドイツのツーリングカー。屋根付きマシン、短距離レース、フェンダー同士の接触も日常茶飯事。"
  ],
  [
    "Monopostos elétricos dentro das cidades, com a energia contada até a última volta.",
    "都市を走る電動フォーミュラ。最終周までエネルギーを管理する。"
  ],
  [
    "F2 e topo nacional",
    "F2・国内トップカテゴリー"
  ],
  [
    "Entrada",
    "入門"
  ],
  [
    "Internacional",
    "国際"
  ],
  [
    "Assumir um piloto real",
    "実在のドライバーを引き継ぐ"
  ],
  [
    "Qualquer piloto de qualquer grid, de 1950 até hoje, conduzido do seu jeito.",
    "1950年から現在まで、どのグリッドの誰を選んでも、自分の道を歩めます。"
  ],
  [
    "As sete carreiras",
    "7つのキャリア"
  ],
  [
    "De Mônaco a Daytona: cada categoria com sua escada, seus rivais e seu regulamento.",
    "MonacoからDaytonaまで。各カテゴリー独自の進路、ライバル、規則。"
  ],
  [
    "O retrospecto corrida a corrida de cada ano que você disputou.",
    "あなたが戦った各年の、レースごとの成績。"
  ],
  [
    "Galeria de lendas",
    "レジェンドの殿堂"
  ],
  [
    "As carreiras que você encerrou, ranqueadas pelo que conquistaram.",
    "終了したキャリアを、実績順に表示。"
  ],
  [
    "Os seus números e os da história.",
    "あなたと歴史上のドライバーの記録。"
  ],
  [
    "O fim de semana, o mercado, o dinheiro e o modo chefe.",
    "レース週末、移籍市場、資金、チーム代表モード。"
  ],
  [
    "Mercado de {0}",
    "{0}年の移籍市場"
  ],
  [
    "Escolha onde você vai correr no ano que vem.",
    "来年走る場所を選びましょう。"
  ],
  [
    "Quem não ligou",
    "連絡がなかったチーム"
  ],
  [
    "Salto duplo",
    "2段階昇格"
  ],
  [
    "Promoção",
    "昇格"
  ],
  [
    "Recomeço",
    "再出発"
  ],
  [
    "Mais um ano",
    "もう1年"
  ],
  [
    "Descer para",
    "降格先："
  ],
  [
    "Continuar na",
    "継続先："
  ],
  [
    "Convite",
    "招待"
  ],
  [
    "Primeiro piloto.",
    "ナンバー1ドライバー。"
  ],
  [
    "Contrato exclusivo",
    "専属契約"
  ],
  [
    "Contrato padrão",
    "標準契約"
  ],
  [
    "Contrato livre",
    "自由契約"
  ],
  [
    "Nenhuma outra categoria durante o ano.",
    "シーズン中は他カテゴリーへの参戦不可。"
  ],
  [
    "Provas avulsas de endurance liberadas.",
    "耐久レースへのスポット参戦可。"
  ],
  [
    "Você pode correr em paralelo onde quiser.",
    "好きなカテゴリーに並行参戦可能。"
  ],
  [
    "Negociar com a {0}",
    "{0}と交渉する"
  ],
  [
    "Já negociado",
    "交渉済み"
  ],
  [
    "{0} do seu bolso",
    "自己負担{0}"
  ],
  [
    "a academia banca {0}",
    "アカデミーが{0}を支援"
  ],
  [
    "fora do orçamento",
    "予算超過"
  ],
  [
    "aqui a equipe paga você",
    "このチームはあなたに給与を支払います"
  ],
  [
    "Pendurar o capacete",
    "ヘルメットを脱ぐ"
  ],
  [
    "Encerrar a carreira agora e entrar para a galeria de lendas.",
    "今すぐ引退し、レジェンドの殿堂に入る。"
  ],
  [
    "Renovar onde você já está. Eles conhecem o seu jeito.",
    "現在のチームと更新。あなたの走りを知っています。"
  ],
  [
    "Repetir a categoria com outra equipe e provar seu valor.",
    "別チームで同じカテゴリーを戦い、実力を証明する。"
  ],
  [
    "Você não faz ideia do que cada equipe está construindo. Está no escuro.",
    "各チームが何を造っているか、まったく分かりません。"
  ],
  [
    "A força de cada carro é o que você conseguiu apurar, não o que ela é — e o que te prometem para assinar nem sempre acontece.",
    "マシンの強さは調査で得た推定であり、実際の数値ではありません。契約時の約束も必ずしも実現しません。"
  ],
  [
    "um ano bom aqui e você vai para a equipe principal",
    "ここで1年活躍すれば、トップチームに行ける"
  ],
  [
    "três engenheiros de uma equipe grande já assinaram com a gente",
    "大手チームのエンジニア3人がすでに加入した"
  ],
  [
    "diz a própria equipe",
    "チーム自身の話"
  ],
  [
    "diz um jornalista",
    "記者の話"
  ],
  [
    "a própria equipe",
    "チーム自身"
  ],
  [
    "um jornalista",
    "記者"
  ],
  [
    "As finanças só existem no modo realista.",
    "財務はリアルモードでのみ利用できます。"
  ],
  [
    "Saldo",
    "残高"
  ],
  [
    "Caixa",
    "現金"
  ],
  [
    "Receitas",
    "収入"
  ],
  [
    "Despesas",
    "支出"
  ],
  [
    "Salário",
    "給与"
  ],
  [
    "Patrocínio",
    "スポンサー契約"
  ],
  [
    "Patrocinadores",
    "スポンサー"
  ],
  [
    "Investimentos",
    "投資"
  ],
  [
    "Investir",
    "投資する"
  ],
  [
    "Retirar",
    "引き出す"
  ],
  [
    "Comprar",
    "購入"
  ],
  [
    "Vender",
    "売却"
  ],
  [
    "Disponível",
    "利用可能"
  ],
  [
    "Custo",
    "費用"
  ],
  [
    "Total",
    "合計"
  ],
  [
    "por ano",
    "年間"
  ],
  [
    "por temporada",
    "シーズンあたり"
  ],
  [
    "Ano que vem",
    "来年"
  ],
  [
    "Academia",
    "アカデミー"
  ],
  [
    "Academias",
    "アカデミー"
  ],
  [
    "Aceitar",
    "承諾"
  ],
  [
    "Recusar",
    "拒否"
  ],
  [
    "Agora não",
    "今はしない"
  ],
  [
    "Sem academia",
    "所属アカデミーなし"
  ],
  [
    "Programa de formação",
    "育成プログラム"
  ],
  [
    "Vínculo com a {0}",
    "{0}との関係"
  ],
  [
    "ligado à {0}",
    "提携先：{0}"
  ],
  [
    "Quem anda com você, quem anda contra, e o que cada um quer.",
    "味方、ライバル、そしてそれぞれの望み。"
  ],
  [
    "Confiança",
    "信頼"
  ],
  [
    "Respeito",
    "敬意"
  ],
  [
    "Afeto",
    "親密度"
  ],
  [
    "O que ele quer",
    "彼の望み"
  ],
  [
    "Você ainda não sabe. Descobre conversando, ou tarde demais.",
    "まだ分かりません。会話で知るか、手遅れになってから知るか。"
  ],
  [
    "Conversar",
    "話す"
  ],
  [
    "Conversar · {0}",
    "{0}と話す"
  ],
  [
    "Fechado",
    "寡黙"
  ],
  [
    "Inseguro",
    "自信がない"
  ],
  [
    "Fala pouco e só sobre trabalho. Não confunda silêncio com desprezo.",
    "話すのは仕事のことだけ。無口を軽蔑と取り違えないように。"
  ],
  [
    "Precisa ouvir que está fazendo certo, inclusive quando está.",
    "正しくできているときでさえ、そう伝えてもらう必要がある。"
  ],
  [
    "acha que você está aqui por sorte",
    "運だけでここにいると思っている"
  ],
  [
    "mede as palavras perto de você",
    "あなたの前では言葉を選ぶ"
  ],
  [
    "evita você fora do trabalho",
    "仕事以外ではあなたを避ける"
  ],
  [
    "não te leva a sério como piloto",
    "ドライバーとして認めていない"
  ],
  [
    "é cordial",
    "礼儀正しい"
  ],
  [
    "Assumir uma equipe real",
    "実在のチームを率いる"
  ],
  [
    "Escolha qualquer equipe de qualquer grid desde 1950. Ela vem com os pilotos, o carro, o dono e a expectativa que tinha naquele ano.",
    "1950年以降のどのグリッドからでもチームを選べます。当時のドライバー、マシン、オーナー、期待を引き継ぎます。"
  ],
  [
    "Fundar uma equipe na Fórmula 1",
    "F1チームを設立"
  ],
  [
    "Nome, cor e bandeira são seus. O dinheiro é de investidores, o carro é o pior do grid e ninguém quer correr por você. Ainda.",
    "名前、色、国旗はあなたのもの。資金は投資家のもの。マシンは最下位で、走りたがるドライバーはいない。まだ今は。"
  ],
  [
    "Começar na base",
    "育成カテゴリーから始める"
  ],
  [
    "Uma equipe pequena numa categoria de acesso. Pilotos que pagam para correr, orçamento curto e a Fórmula 1 lá em cima, do outro lado de alguns títulos.",
    "下位カテゴリーの小さなチーム。資金を持ち込むドライバー、限られた予算、そしていくつかのタイトルの先にあるF1。"
  ],
  [
    "Sua equipe",
    "あなたのチーム"
  ],
  [
    "Nome da equipe",
    "チーム名"
  ],
  [
    "Ex.: Fittipaldi Racing",
    "例：Fittipaldi Racing"
  ],
  [
    "País",
    "国"
  ],
  [
    "Cor",
    "色"
  ],
  [
    "Categoria de estreia",
    "デビューカテゴリー"
  ],
  [
    "Quanto mais baixo, mais barato — e mais longe da Fórmula 1.",
    "下から始めるほど安いが、F1への道は遠くなる。"
  ],
  [
    "De onde vem o dinheiro",
    "資金の出所"
  ],
  [
    "Dinheiro seu e de sócios pequenos",
    "自己資金と少額出資者"
  ],
  [
    "Menos caixa, mas a equipe é toda sua: ninguém te tira do cargo.",
    "資金は少ないがチームはすべて自分のもの。解任されることはない。"
  ],
  [
    "Um investidor forte",
    "有力な投資家"
  ],
  [
    "O caixa de uma equipe nova. Você fica com 70% e manda sozinho.",
    "新チーム相応の資金。持分70%を維持し、単独で指揮を執れる。"
  ],
  [
    "Um fundo bilionário",
    "巨大ファンド"
  ],
  [
    "Dinheiro de sobra desde o primeiro dia — e um conselho acima de você, que cobra resultado e pode te demitir.",
    "初日から豊富な資金。ただし取締役会が結果を求め、解任する権限も持つ。"
  ],
  [
    "Você começa com pouco: o dinheiro de uma temporada modesta, e pilotos que pagam pela vaga.",
    "初期資金は少なく、控えめな1シーズン分。ドライバーもシート代を払う。"
  ],
  [
    "Começa com {0}. É isso para sobreviver até o dinheiro de patrocínio e de prêmio aparecer.",
    "初期資金は{0}。スポンサー収入と賞金が入るまで、これで生き残らなければならない。"
  ],
  [
    "Diga quem é o chefe da equipe.",
    "チーム代表の名前を入力してください。"
  ],
  [
    "Escolha a equipe que vai comandar.",
    "指揮するチームを選んでください。"
  ],
  [
    "A equipe precisa de um nome.",
    "チーム名を入力してください。"
  ],
  [
    "Não consegui abrir a equipe salva.",
    "保存したチームを開けませんでした。"
  ],
  [
    "Equipe salva neste aparelho.",
    "チームをこの端末に保存しました。"
  ],
  [
    "Candidata ao título",
    "タイトル候補"
  ],
  [
    "Pelotão da frente",
    "上位グループ"
  ],
  [
    "Meio do grid",
    "中団"
  ],
  [
    "Fundo do grid",
    "後方グループ"
  ],
  [
    "Escalação a definir",
    "ドライバー未定"
  ],
  [
    "equipe de fábrica, motor próprio",
    "ワークスチーム、自社エンジン"
  ],
  [
    "As equipes de {0}, da mais forte para a mais fraca. Quem você escolher sai do grid da história: a partir daqui, quem decide é você.",
    "{0}年のチームを強い順に表示しています。選んだチームは史実のグリッドから離れ、ここからはあなたが未来を決めます。"
  ],
  [
    "Muro dos boxes",
    "ピットウォール"
  ],
  [
    "Ao trabalho",
    "仕事を始めよう"
  ],
  [
    "pré-temporada de {0}",
    "{0}年プレシーズン"
  ],
  [
    "A pré-temporada é uma lista de tarefas. Quando os dois carros tiverem piloto{0}, dá para largar.",
    "プレシーズンは課題の一覧です。両方のマシンにドライバー{0}が揃えば、レースに出られます。"
  ],
  [
    "e motor",
    "とエンジン"
  ],
  [
    "Você é o novo chefe da {0}. O carro, os pilotos e o dono já estão aqui — a diretoria vai dizer o que espera depois dos testes de pré-temporada. Contratos, motor, patrocínio e o dinheiro de desenvolvimento passam pela sua mesa a partir de agora.",
    "あなたは{0}の新チーム代表です。マシン、ドライバー、オーナーはすでに揃っており、取締役会はプレシーズンテスト後に目標を示します。契約、エンジン、スポンサー、開発資金のすべてがあなたの担当になります。"
  ],
  [
    "A {0} existe no papel e numa fábrica alugada. Falta quase tudo: pilotos, um contrato de motor que faça sentido e patrocinadores. O dinheiro dos investidores parece muito. Não é.",
    "{0}は書類と借りた工場にだけ存在します。ドライバー、適切なエンジン契約、スポンサー。ほぼすべてが足りません。投資家の資金は多く見えますが、実際はそうでもありません。"
  ],
  [
    "A {0} tem dois carros, um caminhão e um sonho. Na {1} os pilotos pagam para correr: escolher entre o talentoso e o que traz dinheiro é a primeira decisão de toda pré-temporada.",
    "{0}にはマシン2台、トラック1台、そして夢があります。{1}ではドライバーが参戦費用を払うため、才能と持込資金のどちらを選ぶかが毎年最初の判断です。"
  ],
  [
    "Motor",
    "エンジン"
  ],
  [
    "Chassi",
    "シャシー"
  ],
  [
    "Aerodinâmica",
    "空力"
  ],
  [
    "Instalações",
    "設備"
  ],
  [
    "Engenharia",
    "エンジニアリング"
  ],
  [
    "Funcionários",
    "スタッフ"
  ],
  [
    "Fábrica",
    "ファクトリー"
  ],
  [
    "Túnel de vento",
    "風洞"
  ],
  [
    "Simulador",
    "シミュレーター"
  ],
  [
    "Projetista",
    "設計者"
  ],
  [
    "Diretor técnico",
    "テクニカルディレクター"
  ],
  [
    "Aerodinamicista",
    "空力エンジニア"
  ],
  [
    "Motorista",
    "運転手"
  ],
  [
    "Diretoria",
    "経営陣"
  ],
  [
    "Objetivo",
    "目標"
  ],
  [
    "Metas",
    "目標"
  ],
  [
    "Confiança do dono",
    "オーナーの信頼"
  ],
  [
    "Reputação",
    "評判"
  ],
  [
    "Mercado",
    "移籍市場"
  ],
  [
    "Contratar",
    "雇う"
  ],
  [
    "Renovar",
    "契約更新"
  ],
  [
    "Dispensar",
    "放出"
  ],
  [
    "Promover",
    "昇格"
  ],
  [
    "Rebaixar",
    "降格"
  ],
  [
    "Titular",
    "レギュラー"
  ],
  [
    "Reserva",
    "リザーブ"
  ],
  [
    "Piloto de teste",
    "テストドライバー"
  ],
  [
    "Emprestado",
    "レンタル移籍中"
  ],
  [
    "Sem contrato",
    "契約なし"
  ],
  [
    "Negociar",
    "交渉"
  ],
  [
    "Fazer proposta",
    "オファーを提示"
  ],
  [
    "Proposta",
    "オファー"
  ],
  [
    "Aceitar proposta",
    "オファーを承諾"
  ],
  [
    "Recusar proposta",
    "オファーを拒否"
  ],
  [
    "Duração",
    "期間"
  ],
  [
    "Papel",
    "役割"
  ],
  [
    "Primeiro piloto",
    "ナンバー1ドライバー"
  ],
  [
    "Segundo piloto",
    "ナンバー2ドライバー"
  ],
  [
    "Sem preferência",
    "優先なし"
  ],
  [
    "Contratos",
    "契約"
  ],
  [
    "Contrato",
    "契約"
  ],
  [
    "Situação",
    "状況"
  ],
  [
    "Livre",
    "フリー"
  ],
  [
    "Livre no fim do ano",
    "年末にフリー"
  ],
  [
    "Contrato até {0}",
    "{0}年まで契約"
  ],
  [
    "até {0}",
    "{0}年まで"
  ],
  [
    "interesse",
    "関心"
  ],
  [
    "Interesse",
    "関心"
  ],
  [
    "Idade",
    "年齢"
  ],
  [
    "Potencial",
    "潜在能力"
  ],
  [
    "Nível",
    "レベル"
  ],
  [
    "Mínimo",
    "最低"
  ],
  [
    "Máximo",
    "最高"
  ],
  [
    "Continuar negociando",
    "交渉を続ける"
  ],
  [
    "Cancelar",
    "キャンセル"
  ],
  [
    "Confirmar",
    "確認"
  ],
  [
    "Futuro",
    "将来"
  ],
  [
    "Ano atual",
    "今年"
  ],
  [
    "Investimento",
    "投資"
  ],
  [
    "Construir",
    "建設"
  ],
  [
    "Melhorar",
    "改善"
  ],
  [
    "Em construção",
    "建設中"
  ],
  [
    "Concluído",
    "完了"
  ],
  [
    "Orçamento",
    "予算"
  ],
  [
    "Teto orçamentário",
    "予算上限"
  ],
  [
    "Empréstimo",
    "融資"
  ],
  [
    "Pedir empréstimo",
    "融資を申し込む"
  ],
  [
    "Investidores",
    "投資家"
  ],
  [
    "Sem propostas",
    "オファーなし"
  ],
  [
    "Nenhuma proposta.",
    "オファーはありません。"
  ],
  [
    "Você perde a maioria.",
    "過半数の持分を失います。"
  ],
  [
    "Seu patrimônio",
    "資産"
  ],
  [
    "Seu dinheiro",
    "所持金"
  ],
  [
    "Próxima temporada",
    "次のシーズン"
  ],
  [
    "Fim da temporada",
    "シーズン終了"
  ],
  [
    "Balanço",
    "総括"
  ],
  [
    "Resultado",
    "結果"
  ],
  [
    "Resultados",
    "結果"
  ],
  [
    "Histórico",
    "履歴"
  ],
  [
    "Calendário",
    "カレンダー"
  ],
  [
    "Treino livre",
    "フリー走行"
  ],
  [
    "Treinos",
    "練習"
  ],
  [
    "Volta",
    "周回"
  ],
  [
    "Voltas",
    "周回"
  ],
  [
    "Volta {0} de {1}",
    "全{1}周中{0}周目"
  ],
  [
    "volta {0} de {1}",
    "全{1}周中{0}周目"
  ],
  [
    "Rádio",
    "無線"
  ],
  [
    "Pneus",
    "タイヤ"
  ],
  [
    "Pneu",
    "タイヤ"
  ],
  [
    "Macio",
    "ソフト"
  ],
  [
    "Médios",
    "ミディアム"
  ],
  [
    "Médio",
    "ミディアム"
  ],
  [
    "Duro",
    "ハード"
  ],
  [
    "Duros",
    "ハード"
  ],
  [
    "Intermediário",
    "インターミディエイト"
  ],
  [
    "Chuva extrema",
    "フルウェット"
  ],
  [
    "Parada",
    "ピットストップ"
  ],
  [
    "parada",
    "ピットストップ"
  ],
  [
    "paradas",
    "ピットストップ"
  ],
  [
    "Parar e pôr {0}",
    "ピットに入り{0}に交換"
  ],
  [
    "À frente",
    "前方"
  ],
  [
    "Atrás",
    "後方"
  ],
  [
    "Liderando",
    "トップ走行中"
  ],
  [
    "Líder",
    "トップ"
  ],
  [
    "Intervalo",
    "間隔"
  ],
  [
    "Diferença",
    "差"
  ],
  [
    "Tempo",
    "タイム"
  ],
  [
    "Melhor volta",
    "ベストラップ"
  ],
  [
    "Última volta",
    "最終ラップ"
  ],
  [
    "Pausar",
    "一時停止"
  ],
  [
    "Velocidade",
    "速度"
  ],
  [
    "Simular até o fim",
    "最後までシミュレート"
  ],
  [
    "Ver o resultado",
    "結果を見る"
  ],
  [
    "Bandeirada",
    "チェッカー"
  ],
  [
    "abandonou",
    "リタイア"
  ],
  [
    "Pista",
    "コース"
  ],
  [
    "Estratégia",
    "戦略"
  ],
  [
    "Estratégia de corrida",
    "レース戦略"
  ],
  [
    "Ordens de equipe",
    "チームオーダー"
  ],
  [
    "Ordem de equipe: deixar {0} passar",
    "チームオーダー：{0}を先行させる"
  ],
  [
    "Ritmo de {0}",
    "{0}のペース"
  ],
  [
    "Forçar",
    "プッシュ"
  ],
  [
    "Normal",
    "通常"
  ],
  [
    "Poupar",
    "温存"
  ],
  [
    "Conservar",
    "保守的"
  ],
  [
    "Atacar",
    "攻める"
  ],
  [
    "Defender",
    "守る"
  ],
  [
    "Equilibrar",
    "バランスを取る"
  ],
  [
    "Sem mudanças",
    "変更なし"
  ],
  [
    "Sexta",
    "金曜日"
  ],
  [
    "Sábado de manhã",
    "土曜の朝"
  ],
  [
    "Corrida",
    "レース"
  ],
  [
    "Corrida ao vivo",
    "ライブレース"
  ],
  [
    "Largar",
    "スタート"
  ],
  [
    "Ir para a corrida",
    "レースへ"
  ],
  [
    "Próxima etapa",
    "次戦"
  ],
  [
    "Fim de semana",
    "レース週末"
  ],
  [
    "Sair da corrida",
    "レースを退出"
  ],
  [
    "Campeão",
    "チャンピオン"
  ],
  [
    "Campeã",
    "チャンピオン"
  ],
  [
    "Título",
    "タイトル"
  ],
  [
    "Títulos",
    "タイトル"
  ],
  [
    "Vice-campeão",
    "年間2位"
  ],
  [
    "Foi demitido",
    "解任された"
  ],
  [
    "Você foi demitido",
    "あなたは解任されました"
  ],
  [
    "Temporada {0}",
    "{0}年シーズン"
  ],
  [
    "Temporada de {0}",
    "{0}年シーズン"
  ],
  [
    "análise",
    "分析"
  ],
  [
    "boato",
    "噂"
  ],
  [
    "notícia",
    "ニュース"
  ],
  [
    "Comentário",
    "コメント"
  ],
  [
    "Comentários",
    "コメント"
  ],
  [
    "Encerrar",
    "終了"
  ],
  [
    "Mais detalhes",
    "詳細"
  ],
  [
    "Nenhum",
    "なし"
  ],
  [
    "Nenhuma",
    "なし"
  ],
  [
    "Todos",
    "すべて"
  ],
  [
    "Todas",
    "すべて"
  ],
  [
    "Buscar",
    "検索"
  ],
  [
    "Busca",
    "検索"
  ],
  [
    "Filtrar",
    "絞り込み"
  ],
  [
    "Região",
    "地域"
  ],
  [
    "Nacional",
    "国内"
  ],
  [
    "Continental",
    "大陸"
  ],
  [
    "Mundial",
    "世界"
  ],
  [
    "Mundial de Kart",
    "世界カート選手権"
  ],
  [
    "Fórmula Regional",
    "Formula Regional"
  ],
  [
    "Brasileiro de Kart",
    "ブラジルカート選手権"
  ],
  [
    "Italiano de Kart",
    "イタリアカート選手権"
  ],
  [
    "Britânico de Kart",
    "イギリスカート選手権"
  ],
  [
    "Fórmula 4 Brasil",
    "F4 Brasil"
  ],
  [
    "Fórmula 4 Italiana",
    "F4 Italiana"
  ],
  [
    "Fórmula 4 Britânica",
    "British F4"
  ],
  [
    "Fórmula 4 Alemã",
    "German F4"
  ],
  [
    "Fórmula 4 Francesa",
    "French F4"
  ],
  [
    "Fórmula 4 Espanhola",
    "Spanish F4"
  ],
  [
    "Fórmula 4 Japonesa",
    "日本F4"
  ],
  [
    "Internacional de Kart",
    "国際カート"
  ],
  [
    "Etapa de {0}",
    "{0}ラウンド"
  ],
  [
    "Norte",
    "北"
  ],
  [
    "Sul",
    "南"
  ],
  [
    "Leste",
    "東"
  ],
  [
    "Oeste",
    "西"
  ],
  [
    "Kartódromo Central",
    "中央カート場"
  ],
  [
    "Kartódromo do Norte",
    "北部カート場"
  ],
  [
    "Kartódromo do Sul",
    "南部カート場"
  ],
  [
    "Kartódromo do Leste",
    "東部カート場"
  ],
  [
    "Kartódromo do Oeste",
    "西部カート場"
  ],
  [
    "Kart Clube",
    "カートクラブ"
  ],
  [
    "Oficina Central",
    "中央ワークショップ"
  ],
  [
    "Time da Cidade",
    "地元チーム"
  ],
  [
    "Preparadora Local",
    "地元チューナー"
  ],
  [
    "Equipe do Kartódromo",
    "カート場チーム"
  ],
  [
    "Time Amador",
    "アマチュアチーム"
  ],
  [
    "Equipe Familiar",
    "家族チーム"
  ],
  [
    "Em caixa",
    "手元資金"
  ],
  [
    "Investido",
    "投資済み"
  ],
  [
    "Por temporada",
    "シーズンあたり"
  ],
  [
    "O ano de {0}",
    "{0}年の成績"
  ],
  [
    "Custo da temporada ({0})",
    "シーズン費用（{0}）"
  ],
  [
    "Apoio da família",
    "家族の支援"
  ],
  [
    "Resultado do ano",
    "年間収支"
  ],
  [
    "Nenhum patrocinador ainda. Apareça na pista.",
    "スポンサーはまだいません。コースで存在感を示しましょう。"
  ],
  [
    "Propostas na mesa",
    "届いているオファー"
  ],
  [
    "Contrato de {0} temporada.",
    "{0}シーズン契約。"
  ],
  [
    "Contrato de {0} temporadas.",
    "{0}シーズン契約。"
  ],
  [
    "Dinheiro parado não rende. Investido, rende cerca de 6% ao ano — com anos ruins pelo meio.",
    "現金を寝かせても増えません。投資なら年約6%の収益が見込めますが、不調な年もあります。"
  ],
  [
    "Dia extra de testes",
    "追加テスト日"
  ],
  [
    "Comprar pista é o jeito mais direto de transformar dinheiro em ritmo: o carro evolui mais rápido nesta temporada. Vale por um ano só.",
    "走行機会への投資は、資金を速さに変える最も直接的な方法です。今シーズンのマシン開発が速まります。効果は1年のみ。"
  ],
  [
    "Luxo — o nome também se constrói fora da pista",
    "ぜいたく品 — コース外でも知名度は高まる"
  ],
  [
    "Relógio suíço",
    "スイス製腕時計"
  ],
  [
    "Carro esportivo",
    "スポーツカー"
  ],
  [
    "Apartamento em Mônaco",
    "Monacoのアパート"
  ],
  [
    "Lancha",
    "ボート"
  ],
  [
    "Helicóptero",
    "ヘリコプター"
  ],
  [
    "Kartódromo próprio",
    "自分のカート場"
  ],
  [
    "+{0} de fama",
    "知名度＋{0}"
  ],
  [
    "+{0} de moral",
    "士気＋{0}"
  ],
  [
    "Relações",
    "人間関係"
  ],
  [
    "Político",
    "政治家タイプ"
  ],
  [
    "Sabe de onde vem o dinheiro e para onde vai o vento antes de todo mundo.",
    "資金の出所も、風向きが変わる先も、誰より早く知っている。"
  ],
  [
    "não te suporta",
    "あなたを嫌っている"
  ],
  [
    "trata você como profissional, e só",
    "仕事相手としてのみ接する"
  ],
  [
    "O que fazer nesta temporada",
    "今シーズンの行動"
  ],
  [
    "Jantar com o grupo de engenharia",
    "エンジニアたちとの夕食"
  ],
  [
    "Uma noite fora da pista rende mais confiança do que dez reuniões.",
    "コース外での一晩は、10回の会議より信頼を育てる。"
  ],
  [
    "Semana na fábrica",
    "ファクトリーで1週間"
  ],
  [
    "Você aparece, pergunta, atrapalha um pouco e aprende muito.",
    "顔を出し、質問し、少し邪魔をして、たくさん学ぶ。"
  ],
  [
    "Treinar junto com o companheiro",
    "チームメイトと一緒にトレーニング"
  ],
  [
    "Dividir preparação física derruba muralha entre os dois lados da garagem.",
    "フィジカルトレーニングの共有が、ガレージの両側を隔てる壁を崩す。"
  ],
  [
    "Abrir seus dados de telemetria",
    "テレメトリーデータを公開"
  ],
  [
    "de graça",
    "無料"
  ],
  [
    "Ele vai ficar mais rápido com isso. Você também.",
    "彼も速くなる。あなたも速くなる。"
  ],
  [
    "Circular pelo paddock",
    "パドックで交流"
  ],
  [
    "Conversa fiada com quem decide contratação. Funciona mais do que parece.",
    "採用を決める人との雑談。思う以上に効果がある。"
  ],
  [
    "Almoço com a imprensa",
    "記者との昼食"
  ],
  [
    "Quem escreve bem sobre você amanhã foi tratado bem hoje.",
    "明日あなたを好意的に書くのは、今日大切に扱った人だ。"
  ],
  [
    "Empresários",
    "マネージャー"
  ],
  [
    "Antes de comandar o esporte inteiro, ele cuidava da carreira de um piloto só. Negocia como quem já sabe o preço de tudo.",
    "スポーツ全体を動かす前は、1人のドライバーを担当していた。何にいくらの価値があるか、すべて知っているように交渉する。"
  ],
  [
    "Chefe de competição virado formador. Não é o que consegue o maior contrato, é o que consegue o telefonema certo de uma fábrica alemã.",
    "競技責任者から育成者へ。最高額の契約ではなく、ドイツのメーカーへの適切な電話を実現する。"
  ],
  [
    "Trânsito livre no paddock italiano. Se a vaga for numa equipe de Maranello ou vizinhança, ele fica sabendo primeiro.",
    "イタリアのパドックに顔が利く。Maranello周辺のチームにシートがあれば、真っ先に知る。"
  ],
  [
    "Construiu a maior carreira da história do esporte e cobra como quem sabe disso. Não assina com qualquer um.",
    "スポーツ史上最大のキャリアを築き、その価値に見合う料金を求める。誰とでも契約するわけではない。"
  ],
  [
    "Campeão do mundo que passou a cuidar de finlandeses rápidos. Fala pouco e resolve.",
    "俊足のフィンランド人を支援する世界王者。口数は少ないが、仕事は果たす。"
  ],
  [
    "Tirou um finlandês de um currículo curto e o colocou numa equipe grande em dois anos. Aposta em talento cru.",
    "実績の少ないフィンランド人を2年で名門チームへ導いた。磨かれていない才能に賭ける。"
  ],
  [
    "Trabalhou em três empregos para bancar o kart do filho e aprendeu o resto no caminho. Briga por quem representa.",
    "息子のカート代のために3つの仕事を掛け持ちし、残りは道中で学んだ。担当ドライバーのために戦う。"
  ],
  [
    "Investidor antes de ser chefe de equipe. Enxerga a carreira como um ativo e negocia como tal.",
    "チーム代表になる前は投資家。キャリアを資産として見て、そのように交渉する。"
  ],
  [
    "Empresário é quem atende o telefone quando uma equipe liga, quem sabe quanto pedir e quem consegue a reunião que você não conseguiria. Cobra uma fatia de tudo que você ganha — e costuma valer.",
    "チームの電話に応え、適正な要求額を知り、自分では実現できない面談を取り付けるのがマネージャーです。収入の一部を受け取りますが、多くの場合はそれだけの価値があります。"
  ],
  [
    "Aceitam representar você",
    "あなたとの契約に応じる"
  ],
  [
    "Fora do seu alcance hoje",
    "今は手が届かない"
  ],
  [
    "Já cuidou de: {0}",
    "過去の担当：{0}"
  ],
  [
    "Dinheiro",
    "資金"
  ],
  [
    "Portas",
    "コネクション"
  ],
  [
    "Só assina com fama {0}",
    "知名度{0}以上が必要"
  ],
  [
    "Só assina com geral {0}",
    "総合{0}以上が必要"
  ],
  [
    "Trabalho de formiga, contrato bem lido e nenhuma manchete. Muita carreira longa começou com ele.",
    "地道な仕事、契約書の精査、派手な見出しはない。彼と始まった長いキャリアは多い。"
  ],
  [
    "Bicampeão do mundo que nunca deixou de olhar para os garotos do Brasil. Abre porta onde brasileiro costuma esbarrar.",
    "2度の世界王者で、ブラジルの若者を見続けている。ブラジル人が苦労しがちな扉を開く。"
  ],
  [
    "Cuidou dos assuntos de Ayrton Senna e nunca mais saiu do primeiro escalão. Discreto, metódico e caro.",
    "Ayrton Sennaの仕事を担当し、その後も第一線を離れなかった。控えめで几帳面、そして高額。"
  ],
  [
    "Abre portas que não deviam estar abertas e leva a maior fatia do esporte. Com ele você vai longe — e paga por isso.",
    "本来開かない扉を開け、業界でも最大級の取り分を求める。遠くまで進めるが、その代償も払う。"
  ],
  [
    "A porta mais rápida do grid e a mais estreita. Ele te leva ao topo em dois anos — ou te descarta no primeiro ano ruim.",
    "グリッドで最速、そして最も狭い扉。2年で頂点へ導くか、最初の不振年で見切る。"
  ],
  [
    "Sobrenome que abre qualquer porta e um histórico de colocar jovens em equipes grandes cedo demais para o currículo.",
    "名前だけでどの扉も開き、実績の割に早い時期から若手を名門へ送り込んできた。"
  ],
  [
    "Acompanha um piloto só de cada vez, desde o kart. Quem entra na lista dele entra para ficar.",
    "カート時代から一度に1人だけを担当する。彼のリストに入れば、長い付き合いになる。"
  ],
  [
    "Correu nove anos na Fórmula 1 e sabe exatamente onde as equipes apertam num contrato. Do outro lado da mesa agora.",
    "F1を9年戦い、チームが契約のどこを突いてくるか知り尽くしている。今は交渉卓の反対側にいる。"
  ],
  [
    "Ainda corre e já cuida da carreira dos outros. Ninguém no grid conhece melhor o preço de uma escolha errada.",
    "今も走りながら他人のキャリアも管理する。間違った選択の代償を、グリッドの誰より知っている。"
  ],
  [
    "Dez vitórias como piloto, décadas de paddock como dirigente. Conhece todo mundo e não deve nada a ninguém.",
    "ドライバーとして10勝、役員として何十年ものパドック経験。誰でも知っており、誰にも借りがない。"
  ],
  [
    "Ele não está trabalhando nesta época.",
    "この時代には活動していません。"
  ],
  [
    "Ele não assina com você ainda.",
    "まだあなたとは契約しません。"
  ],
  [
    "{0} passa a representar você. Ele fica com {1}% do que entrar.",
    "{0}があなたの担当になります。収入の{1}%を受け取ります。"
  ],
  [
    "Mesa de patrocínio",
    "スポンサー交渉"
  ],
  [
    "Quem vai bem atrai dinheiro, e dinheiro é o que compra a próxima temporada. Cabem três logos no macacão: escolha com cuidado, porque contrato longo garante o ano que vem e contrato curto deixa você livre para pedir mais depois.",
    "好成績は資金を呼び、資金が次のシーズンを買う。スーツのロゴ枠は3つ。長期契約は来年を保証し、短期契約は後で増額を求める自由を残すため、慎重に選びましょう。"
  ],
  [
    "apoio local",
    "地元の支援"
  ],
  [
    "contrato de {0} temporada",
    "{0}シーズン契約"
  ],
  [
    "contrato de {0} temporadas",
    "{0}シーズン契約"
  ],
  [
    "Seguir para a temporada",
    "シーズンへ進む"
  ],
  [
    "Escolha uma no início — ou troque no meio, se o mercado abrir a porta.",
    "最初に選ぶか、移籍市場で道が開けば途中で変更できます。"
  ],
  [
    "Escada em {0}",
    "{0}年のステップアップ"
  ],
  [
    "Épocas",
    "時代"
  ],
  [
    "Criar piloto",
    "ドライバーを作成"
  ],
  [
    "Um ponto exato da história. O que vem depois é com você.",
    "歴史のある瞬間。その後はあなた次第。"
  ],
  [
    "Escolha a categoria, o ano e o piloto. A carreira continua a partir dali.",
    "カテゴリー、年、ドライバーを選びましょう。そこからキャリアが続きます。"
  ],
  [
    "Ano anterior",
    "前年"
  ],
  [
    "Próximo ano",
    "翌年"
  ],
  [
    "Números da carreira",
    "キャリア統計"
  ],
  [
    "base",
    "育成カテゴリー"
  ],
  [
    "Temporadas",
    "シーズン"
  ],
  [
    "Pódios por prova",
    "出走あたりの表彰台"
  ],
  [
    "Taxa de abandono",
    "リタイア率"
  ],
  [
    "Melhor resultado",
    "最高成績"
  ],
  [
    "Pontos somados",
    "累計ポイント"
  ],
  [
    "As carreiras que você já encerrou, ordenadas pelo que conquistaram.",
    "終了したキャリアを、実績順に表示します。"
  ],
  [
    "Nenhuma carreira encerrada ainda.",
    "終了したキャリアはまだありません。"
  ],
  [
    "Cada ano disputado fica guardado aqui, com todas as corridas.",
    "戦ったすべての年と、各レースの記録をここに保存します。"
  ],
  [
    "Nenhuma temporada encerrada ainda.",
    "終了したシーズンはまだありません。"
  ],
  [
    "Termine seu primeiro ano e ele aparece aqui.",
    "最初のシーズンを終えると、ここに表示されます。"
  ],
  [
    "O que a temporada disse sobre você",
    "このシーズンが示したあなたの姿"
  ],
  [
    "Os seus melhores fins de semana foram em {0}.",
    "最も好調だったのは{0}でした。"
  ],
  [
    "O seu ponto fraco continua sendo {0}.",
    "弱点は引き続き{0}です。"
  ],
  [
    "Você bateu {0} vezes. Uma é acidente; {1} é um padrão.",
    "{0}回クラッシュしました。1回なら事故ですが、{1}回なら傾向です。"
  ],
  [
    "Retrospecto completo de {0}",
    "{0}年の全記録"
  ],
  [
    "Evolução do piloto — {0} → {1} anos",
    "ドライバーの成長 — {0}歳 → {1}歳"
  ],
  [
    "Ver o mercado de {0}",
    "{0}年の移籍市場を見る"
  ],
  [
    "Ultrap.",
    "追い抜き"
  ],
  [
    "Desenv.",
    "開発"
  ],
  [
    "circuitos técnicos",
    "テクニカルコース"
  ],
  [
    "circuitos mistos",
    "ロードコース"
  ],
  [
    "chefe de equipe",
    "チーム代表"
  ],
  [
    "Pré-temporada de {0}",
    "{0}年プレシーズン"
  ],
  [
    "motor {0}",
    "{0}エンジン"
  ],
  [
    "disponível",
    "利用可能"
  ],
  [
    "confiança",
    "信頼"
  ],
  [
    "Nível atual",
    "現在のレベル"
  ],
  [
    "Projetista-chefe",
    "チーフデザイナー"
  ],
  [
    "Chefe de aerodinâmica",
    "空力責任者"
  ],
  [
    "Saldo previsto",
    "予想残高"
  ],
  [
    "{0} até {1}",
    "{0}〜{1}"
  ],
  [
    "Desenvolvimento do carro",
    "マシン開発"
  ],
  [
    "Banco",
    "銀行"
  ],
  [
    "Sem dívida · dá para pedir dinheiro emprestado",
    "借金なし · 融資を申請できます"
  ],
  [
    "Academia de pilotos",
    "ドライバーアカデミー"
  ],
  [
    "Deve entrar",
    "予想収入"
  ],
  [
    "Deve sair",
    "予想支出"
  ],
  [
    "Caixa hoje",
    "現在の現金"
  ],
  [
    "Começar a temporada {0}",
    "{0}年シーズンを始める"
  ],
  [
    "O campeonato ainda não começou.",
    "選手権はまだ開幕していません。"
  ],
  [
    "Fornecedores de {0}",
    "{0}年の供給元"
  ],
  [
    "Duração do contrato",
    "契約期間"
  ],
  [
    "Rendimento",
    "性能"
  ],
  [
    "Seu fornecedor atual, até {0}.",
    "現在の供給元、{0}年まで。"
  ],
  [
    "Fornece para quem pagar.",
    "支払えば供給を受けられる。"
  ],
  [
    "Atende qualquer equipe que pedir.",
    "希望する全チームに供給する。"
  ],
  [
    "Motor próprio",
    "自社エンジン"
  ],
  [
    "Caro e lento no começo, mas é seu: ninguém te dá a especificação de ontem e ninguém te abandona. Exige fábrica nível 2.",
    "初期は高価で遅いが、自分のもの。古い仕様を渡されたり、供給を打ち切られたりしない。レベル2のファクトリーが必要。"
  ],
  [
    "Para onde vai o dinheiro da fábrica em {0}",
    "{0}年のファクトリー予算の配分"
  ],
  [
    "O dinheiro define até onde cada área pode chegar; a engenharia e as instalações decidem quanto disso vira ritmo. Nada chega de uma vez, e quem para de gastar fica para trás devagar.",
    "資金は各分野の到達点を決め、技術者と設備が実際の速さへの転換率を決める。成果は一度には届かず、投資を止めれば徐々に後退する。"
  ],
  [
    "hoje {0}",
    "現在{0}"
  ],
  [
    "engenharia",
    "エンジニアリング"
  ],
  [
    "muito eficiente",
    "非常に効率的"
  ],
  [
    "eficiente",
    "効率的"
  ],
  [
    "pouco eficiente",
    "効率が低い"
  ],
  [
    "Nada",
    "なし"
  ],
  [
    "Teto de gastos de {0}",
    "{0}年の予算上限"
  ],
  [
    "A sua equipe técnica",
    "あなたの技術陣"
  ],
  [
    "Organiza a fábrica inteira. Pesa em tudo o que o carro vira.",
    "ファクトリー全体をまとめる。マシンのあらゆる性能に影響する。"
  ],
  [
    "Chassi, suspensão e a confiabilidade que sai da prancheta.",
    "シャシー、サスペンション、そして設計段階で決まる信頼性。"
  ],
  [
    "O túnel de vento é dele. Da década de 70 em diante, é quem mais decide.",
    "風洞の責任者。1970年代以降は特に大きな影響を持つ。"
  ],
  [
    "Disponíveis",
    "契約可能"
  ],
  [
    "Obra leva um ano. O que você constrói agora aparece no carro do ano que vem — e a conta de manutenção sobe para sempre.",
    "建設には1年かかる。今造るものは来年のマシンに効くが、維持費は永久に上がる。"
  ],
  [
    "Onde o carro é construído. Pesa no chassi, na confiabilidade e no motor, se ele for seu.",
    "マシンを製造する場所。シャシー、信頼性、自社製ならエンジンにも影響する。"
  ],
  [
    "No máximo.",
    "最大レベル。"
  ],
  [
    "Da década de 70 em diante, a aerodinâmica passa por aqui.",
    "1970年代以降、空力の中心となる設備。"
  ],
  [
    "Correlação entre o que a fábrica acha e o que a pista mostra.",
    "ファクトリーの予測とコースでの実測の相関を高める。"
  ],
  [
    "Principal {0} · secundários {1}",
    "メイン{0} · サブ{1}"
  ],
  [
    "Propostas",
    "オファー"
  ],
  [
    "Assinar",
    "契約する"
  ],
  [
    "Pedir mais",
    "増額を求める"
  ],
  [
    "Energético",
    "エナジードリンク"
  ],
  [
    "secundário",
    "サブ"
  ],
  [
    "principal",
    "メイン"
  ],
  [
    "Tecnologia",
    "テクノロジー"
  ],
  [
    "ano(s)",
    "年"
  ],
  [
    "Mais investimento abre vagas (3, 4, 6 ou 8 garotos), faz os garotos evoluírem mais rápido e deixa os olheiros mais certeiros. Os melhores da F2 e da F3 com até 21 anos também podem vir direto do mercado de pilotos.",
    "投資を増やすと定員が3・4・6・8人と増え、若手の成長とスカウトの精度も向上します。F2・F3の21歳以下の有力選手を移籍市場から直接迎えることもできます。"
  ],
  [
    "Na academia",
    "アカデミー所属"
  ],
  [
    "Ninguém ainda.",
    "まだ誰もいません。"
  ],
  [
    "Observados pelos olheiros",
    "スカウトが注目している選手"
  ],
  [
    "Os olheiros acham que ele pode chegar a",
    "スカウトの推定到達レベル："
  ],
  [
    "Trazer para a academia",
    "アカデミーに迎える"
  ],
  [
    "Você tem {0}% da equipe",
    "チームの{0}%を所有"
  ],
  [
    "Com menos de 50%, você passa a responder a um conselho — que pode te tirar do cargo.",
    "持分が50%未満になると、解任権限を持つ取締役会に従うことになります。"
  ],
  [
    "Dinheiro agora, conta depois",
    "今の資金、後の支払い"
  ],
  [
    "Três parcelas anuais, juros de 9% ao ano. A primeira vence no começo da próxima temporada. A diretoria não gosta de dívida.",
    "3回の年払い、年利9%。初回は次シーズン開始時に返済します。経営陣は借金を好みません。"
  ],
  [
    "Um fôlego para fechar o ano.",
    "年末まで乗り切るための資金。"
  ],
  [
    "O suficiente para um pacote de desenvolvimento a mais.",
    "開発パッケージをもう1つ追加できる額。"
  ],
  [
    "Uma aposta grande: ou vira carro, ou vira problema.",
    "大きな賭け。マシンの速さになるか、問題になるか。"
  ],
  [
    "Seus pilotos",
    "所属ドライバー"
  ],
  [
    "Passar a reserva",
    "リザーブに変更"
  ],
  [
    "Fazer nº 1",
    "ナンバー1に指定"
  ],
  [
    "No mercado",
    "移籍市場"
  ],
  [
    "A leitura é o que os seus engenheiros acham que ele vale. O interesse depende do tamanho da sua equipe perto do lugar em que ele correria.",
    "評価はエンジニアによる推定です。契約への関心は、他の選択肢と比べたあなたのチームの格に左右されます。"
  ],
  [
    "Aberto a conversar",
    "交渉に応じる"
  ],
  [
    "Ver trajetória",
    "経歴を見る"
  ],
  [
    "Quer vir",
    "加入を希望"
  ],
  [
    "Levar para a academia",
    "アカデミーへ迎える"
  ],
  [
    "Nível {0} na {1}; a leitura já está na escala da Fórmula 1.",
    "{1}でのレベル{0}。推定値はF1基準に換算済み。"
  ],
  [
    "Convite de academia",
    "アカデミーからの誘い"
  ],
  [
    "Um programa de formação quer o seu nome.",
    "育成プログラムがあなたを求めています。"
  ],
  [
    "O título chamou atenção.",
    "タイトル獲得が注目されました。"
  ],
  [
    "O {0} lugar não passou despercebido.",
    "{0}という成績が目を引きました。"
  ],
  [
    "Entrar num programa acelera sua evolução, abre portas no mercado e coloca seu nome na fila de uma equipe grande. Trocar de equipe na base mantém o vínculo. A academia avalia seus resultados e seu potencial a cada temporada e pode dispensar você se não corresponder. A formação termina ao chegar à Fórmula 1 ou a outra categoria principal.",
    "加入すると成長が速まり、移籍市場で道が開け、大手チームの候補に入ります。育成中のチーム移籍で所属は失いません。アカデミーは毎年、成績と潜在能力を評価し、不十分なら放出することもあります。F1などのトップカテゴリーに進むと育成課程が修了します。"
  ],
  [
    "Programa independente",
    "独立プログラム"
  ],
  [
    "Evolução +{0}% ao ano",
    "年間成長＋{0}%"
  ],
  [
    "caminho aberto para a {0}",
    "{0}への道が開く"
  ],
  [
    "Seguir por conta própria",
    "独力で進む"
  ],
  [
    "Sem programa, sem cobrança de fora. O mérito é todo seu.",
    "プログラムも外からの要求もない。成功はすべて自分のもの。"
  ],
  [
    "Você entrou na {0}.",
    "{0}に加入しました。"
  ],
  [
    "Formação intensa e cobrança alta, com caminho para as equipes do grupo.",
    "厳しい育成と高い要求。グループ内チームへの道がある。"
  ],
  [
    "Estrutura completa em Maranello, com a pressão de vestir vermelho um dia.",
    "Maranelloの充実した設備と、いつか赤を着るという重圧。"
  ],
  [
    "O programa que formou um campeão do mundo saído do kart.",
    "カート出身の世界王者を育てたプログラム。"
  ],
  [
    "Escola francesa de formação, forte nas categorias de acesso europeias.",
    "ヨーロッパの育成カテゴリーに強い、フランスの育成機関。"
  ],
  [
    "Poucos pilotos, muito investimento e um caminho curto até o topo.",
    "少数のドライバーに大きく投資し、頂点への短い道を用意する。"
  ],
  [
    "Programa suíço discreto, com espaço real para quem se destaca.",
    "控えめなスイスのプログラム。実力を示せば本当のチャンスがある。"
  ],
  [
    "Aposta em jovens e entrega volante de verdade mais rápido que os rivais.",
    "若手に賭け、ライバルより早く実戦のステアリングを渡す。"
  ],
  [
    "O programa mais novo do grid, construído para a próxima década.",
    "次の10年を見据えて作られた、グリッドで最も新しいプログラム。"
  ],
  [
    "A escola que abasteceu a França de campeões por três décadas.",
    "30年にわたりフランスに王者を送り出した育成機関。"
  ],
  [
    "Dinheiro de patrocínio bancando jovens promissores até a Fórmula 1.",
    "スポンサー資金で有望な若手をF1まで支える。"
  ],
  [
    "O caminho clássico do kart paulista para a Europa.",
    "サンパウロのカートからヨーロッパへ向かう伝統の道。"
  ],
  [
    "Apoio brasileiro para levar talento nacional às categorias de acesso europeias.",
    "ブラジルの才能をヨーロッパの育成カテゴリーへ送り出す支援。"
  ],
  [
    "Formação de pilotos dentro de casa, com passagem direta pela Stock Series.",
    "国内で育成し、Stock Seriesへ直接進む道。"
  ],
  [
    "A escada oficial americana, com bolsa para o campeão de cada degrau.",
    "各段階の王者に奨学金を用意する、アメリカの公式ステップアップ。"
  ],
  [
    "Programa de formação que virou porta de entrada para o pelotão principal.",
    "トップカテゴリーへの入り口となった育成プログラム。"
  ],
  [
    "O título por um ponto",
    "わずか1点のタイトル"
  ],
  [
    "A última volta de Abu Dhabi",
    "Abu Dhabiの最終ラップ"
  ],
  [
    "A carreira que a história interrompeu",
    "歴史に断ち切られたキャリア"
  ],
  [
    "O talento interrompido no auge",
    "絶頂で途切れた才能"
  ],
  [
    "Um ponto de diferença, três pilotos",
    "3人のドライバー、わずか1点差"
  ],
  [
    "A rivalidade dentro da própria garagem",
    "同じガレージ内のライバル"
  ],
  [
    "A equipe que nasceu das cinzas",
    "灰から生まれたチーム"
  ],
  [
    "A decisão mais discutida do automobilismo brasileiro",
    "ブラジルのモータースポーツで最も議論された決断"
  ],
  [
    "O piloto mais amado que nunca foi campeão",
    "王者になれなかった、最も愛されたドライバー"
  ],
  [
    "E se ele tivesse ido para a Europa?",
    "もしヨーロッパへ行っていたら？"
  ],
  [
    "Onze tentativas até o leite",
    "ミルクにたどり着くまでの11度の挑戦"
  ],
  [
    "O recordista absoluto",
    "絶対的な記録保持者"
  ],
  [
    "Da F1 de volta para casa",
    "F1から故郷へ"
  ],
  [
    "O domínio total na América",
    "アメリカでの完全支配"
  ],
  [
    "{0}, a partir de {1}",
    "{1}年以降の{0}"
  ],
  [
    "Kanaan na F1 dos anos 90",
    "1990年代F1のKanaan"
  ],
  [
    "Barrichello na Stock, 2012",
    "Stock CarのBarrichello、2012年"
  ],
  [
    "Piloto de capacete no cockpit de um monoposto",
    "フォーミュラカーのコックピットでヘルメットを着けたドライバー"
  ],
  [
    "Equipe trocando os pneus de um carro vermelho num pit stop",
    "ピットストップで赤いマシンのタイヤを交換するチーム"
  ],
  [
    "Alberto Ascari contornando uma curva em Zandvoort, 1953",
    "1953年、Zandvoortでコーナーを曲がるAlberto Ascari"
  ],
  [
    "Jackie Stewart levantando água na reta de Zandvoort, 1968",
    "1968年、Zandvoortの直線で水しぶきを上げるJackie Stewart"
  ],
  [
    "Niki Lauda na Ferrari seguido de Jarier em Zandvoort, 1975",
    "1975年、ZandvoortでJarierを従えるFerrariのNiki Lauda"
  ],
  [
    "Ayrton Senna no Lotus 97T preto e dourado, 1985",
    "1985年、黒と金のLotus 97Tに乗るAyrton Senna"
  ],
  [
    "Alain Prost no cockpit da Ferrari em Phoenix, 1990",
    "1990年、PhoenixでFerrariのコックピットにいるAlain Prost"
  ],
  [
    "Michael Schumacher na Ferrari F2004 em Silverstone, 2004",
    "2004年、SilverstoneでFerrari F2004を駆るMichael Schumacher"
  ],
  [
    "Lewis Hamilton na Mercedes em Silverstone, 2016",
    "2016年、SilverstoneでMercedesを駆るLewis Hamilton"
  ],
  [
    "Max Verstappen soltando faíscas no Red Bull Ring, 2023",
    "2023年、Red Bull Ringで火花を散らすMax Verstappen"
  ],
  [
    "Foto: Carlos Sainz em Zandvoort, 2024, por Steffen Prößdorf (CC BY-SA 4.0)",
    "写真：2024年ZandvoortのCarlos Sainz、撮影Steffen Prößdorf（CC BY-SA 4.0）"
  ],
  [
    "Filme de 1906: um carro na pista de tábuas do primeiro Grand Prix, na França",
    "1906年の映像：フランス初のグランプリの板張りコースを走るマシン"
  ],
  [
    "Senna, a partir de 1994",
    "1994年以降のSenna"
  ],
  [
    "Kubica, a partir de 2011",
    "2011年以降のKubica"
  ],
  [
    "Interlagos, última volta da temporada. Você cruza a linha como campeão do mundo e perde o título alguns segundos depois, numa curva a 3 km dali. A temporada inteira recomeça agora, do zero.",
    "Interlagos、シーズン最後の1周。世界王者としてフィニッシュした数秒後、3km先のコーナーでタイトルを失う。今、シーズン全体がゼロから始まる。"
  ],
  [
    "A temporada mais disputada em décadas, decidida na última volta do último GP. Recomece o ano inteiro e vá buscar o oitavo.",
    "数十年で最も接戦となったシーズンは、最終戦の最終周で決着した。1年をやり直し、8度目のタイトルをつかもう。"
  ],
  [
    "Ele havia acabado de assinar com a equipe mais forte do grid, e a temporada mal tinha começado. Aqui a carreira continua, e o que vem depois é você quem escreve.",
    "グリッド最強チームと契約したばかりで、シーズンは始まったばかりだった。ここではキャリアが続く。その先を書くのはあなただ。"
  ],
  [
    "Estava prestes a fazer sua melhor temporada quando um acidente fora da F1 tirou tudo de cena. Aqui esse ano acontece — e todos os outros também.",
    "最高のシーズンを迎えようとしたとき、F1以外での事故がすべてを奪った。ここではその年も、その後のすべての年も実現する。"
  ],
  [
    "Bicampeão, equipe nova, um estreante do outro lado da garagem e uma temporada que virou guerra civil. Os três terminaram separados por um ponto.",
    "2度の王者、新天地、ガレージの向こうにいる新人。シーズンは内戦となり、3人がわずか1点差で並んだ。"
  ],
  [
    "O melhor carro do grid, e o adversário mais difícil é seu companheiro de equipe. Foi assim que saiu o terceiro título.",
    "最強のマシンに乗り、最大のライバルはチームメイト。そうして3度目のタイトルを手にした。"
  ],
  [
    "A Honda foi embora, a equipe quase fechou e o carro que sobrou era o melhor do grid. Depois de 16 anos esperando, a chance apareceu.",
    "Hondaが去り、チームは閉鎖寸前。しかし残されたマシンは最強だった。16年待ち続けたチャンスがやって来た。"
  ],
  [
    "Bicampeão, ele deixou uma McLaren vencedora para pilotar o carro da equipe da própria família. Nunca mais venceu. E se desse certo?",
    "2度の王者は勝てるMcLarenを離れ、家族のチームのマシンを選んだ。二度と勝つことはなかった。もし成功していたら？"
  ],
  [
    "Rápido como ninguém, sem nunca ter erguido a taça. A temporada de 1982 recomeça inteira, e o título continua em aberto.",
    "誰より速いのに、トロフィーを掲げたことはない。1982年のシーズンが最初から始まり、タイトルの行方はまだ白紙だ。"
  ],
  [
    "Ele foi para os Estados Unidos e virou lenda nos ovais. Nesta linha do tempo, a ligação veio de Silverstone.",
    "アメリカへ渡り、オーバルの伝説となった彼。この時間軸では、Silverstoneから電話がかかってきた。"
  ],
  [
    "Onze anos batendo na porta das 500 Milhas de Indianápolis, e ela finalmente abriu. Faça de novo — e depois vá além.",
    "Indianapolis 500の扉を11年間たたき続け、ついに開いた。もう一度実現し、その先へ進もう。"
  ],
  [
    "Doze títulos brasileiros, um número que ninguém chegou perto de alcançar. Comece do meio da lenda e veja até onde vai.",
    "ブラジル王者12回。誰も近づけなかった数字だ。伝説の途中から始め、どこまで進めるか試そう。"
  ],
  [
    "Depois de 19 temporadas de Fórmula 1, o recordista de GPs volta a correr no Brasil. Sobrou muito para provar.",
    "19シーズンのF1を戦い、GP出走記録を持つドライバーがブラジルに帰ってくる。まだ証明すべきことは多い。"
  ],
  [
    "Descartado pela Fórmula 1, ele atravessou o Atlântico e virou o piloto mais espetacular do continente. Refaça o bicampeonato.",
    "F1に見切られた彼は大西洋を渡り、大陸で最も鮮烈なドライバーとなった。再び2連覇を実現しよう。"
  ],
  [
    "Não foi possível salvar a equipe.",
    "チームを保存できませんでした。"
  ],
  [
    "Cor {0}",
    "色{0}"
  ],
  [
    "A pré-temporada é uma lista de tarefas. Quando os dois carros tiverem piloto, dá para largar.",
    "プレシーズンは課題の一覧です。両方のマシンにドライバーが揃えば、レースに出られます。"
  ],
  [
    "A pré-temporada é uma lista de tarefas. Quando os dois carros tiverem piloto e motor, dá para largar.",
    "プレシーズンは課題の一覧です。両方のマシンにドライバーとエンジンが揃えば、レースに出られます。"
  ],
  [
    "motor próprio",
    "自社エンジン"
  ],
  [
    "sem motor",
    "エンジンなし"
  ],
  [
    "chassi único",
    "共通シャシー"
  ],
  [
    "Conselho",
    "取締役会"
  ],
  [
    "A equipe é",
    "あなたの持分"
  ],
  [
    "sua",
    "あなたのもの"
  ],
  [
    "{0} · chefe de equipe",
    "{0} · チーム代表"
  ],
  [
    "no ano: {0}",
    "今年の収支：{0}"
  ],
  [
    "Nº 1",
    "ナンバー1"
  ],
  [
    "fora",
    "欠場"
  ],
  [
    "contrato acabou",
    "契約終了"
  ],
  [
    "contrato até {0}",
    "{0}年まで契約"
  ],
  [
    "pagante",
    "持込資金あり"
  ],
  [
    "titular",
    "レギュラー"
  ],
  [
    "reserva",
    "リザーブ"
  ],
  [
    "Vago",
    "空席"
  ],
  [
    "vago",
    "空席"
  ],
  [
    "Nenhum piloto contratado.",
    "契約済みドライバーはいません。"
  ],
  [
    "Academia: {0}",
    "アカデミー：{0}"
  ],
  [
    "Carro sem patrocinador.",
    "スポンサーのいないマシン。"
  ],
  [
    "rompido",
    "契約解除"
  ],
  [
    "chuva",
    "雨"
  ],
  [
    "Meta da diretoria: {0} nos construtores",
    "経営陣の目標：コンストラクター{0}"
  ],
  [
    "Nos testes: entre o {0} e o {1} carro do grid",
    "テストの推定：グリッドで{0}〜{1}のマシン"
  ],
  [
    "excluída dos construtores",
    "コンストラクター選手権から除外"
  ],
  [
    "Balanço de {0} →",
    "{0}年の総括 →"
  ],
  [
    "Pacote de atualização",
    "アップデートパッケージ"
  ],
  [
    "Simular o resto",
    "残りをシミュレート"
  ],
  [
    "{0} de 2 titulares",
    "レギュラー2人中{0}人"
  ],
  [
    "reserva: {0}",
    "リザーブ：{0}"
  ],
  [
    "{0} contrato(s) para renovar",
    "更新が必要な契約{0}件"
  ],
  [
    "Motor próprio · {0} por ano",
    "自社エンジン · 年{0}"
  ],
  [
    "Sem fornecedor",
    "供給元なし"
  ],
  [
    "{0} contrato(s) · {1} por ano · {2} proposta(s)",
    "契約{0}件 · 年{1} · オファー{2}件"
  ],
  [
    "Empréstimo: {0} parcela(s) de {1}",
    "融資：残り{0}回、各{1}"
  ],
  [
    "{0} garoto(s) · {1} observado(s) pelos olheiros",
    "若手{0}人 · スカウト中{1}人"
  ],
  [
    "Entrar na Fórmula 1",
    "F1に参戦"
  ],
  [
    "Subir para a {0}",
    "{0}へ昇格"
  ],
  [
    "Ainda não",
    "まだ先"
  ],
  [
    "{0} proposta(s) de sociedade",
    "出資オファー{0}件"
  ],
  [
    "Vender a equipe",
    "チームを売却"
  ],
  [
    "Vale hoje {0} para você",
    "現在の持分価値：{0}"
  ],
  [
    "Decisões pendentes",
    "未決の判断"
  ],
  [
    "{0} assunto(s) esperando você",
    "あなたの判断を待つ案件{0}件"
  ],
  [
    "regulamento novo: {0}",
    "新規則：{0}"
  ],
  [
    "Falta: {0}",
    "必要事項：{0}"
  ],
  [
    "Falta {0}.",
    "{0}が不足しています。"
  ],
  [
    "O carro",
    "マシン"
  ],
  [
    "Na base o chassi é igual para todos. O que separa as equipes é a engenharia — o acerto, a leitura dos pneus, o trabalho com o piloto.",
    "育成カテゴリーではシャシーは全チーム共通。差を生むのはセットアップ、タイヤの理解、ドライバーとの仕事といったエンジニアリングだ。"
  ],
  [
    "Em {0}, o ritmo vem {1}% da aerodinâmica, {2}% do chassi e {3}% do motor. A confiabilidade não dá ritmo: decide quem chega.",
    "{0}年のペースは空力{1}%、シャシー{2}%、エンジン{3}%で決まる。信頼性は速さを生まないが、完走できるかを決める。"
  ],
  [
    "Pilotos sob contrato",
    "契約下のドライバー"
  ],
  [
    "Função",
    "役割"
  ],
  [
    "Até",
    "期限"
  ],
  [
    "Na equipe",
    "所属チームで"
  ],
  [
    "Ninguém.",
    "誰もいません。"
  ],
  [
    "Dono / fábrica",
    "オーナー／メーカー"
  ],
  [
    "Pilotos pagantes",
    "持込資金のあるドライバー"
  ],
  [
    "Direitos e produtos",
    "権利収入・グッズ"
  ],
  [
    "Prêmio de construtores",
    "コンストラクター賞金"
  ],
  [
    "Banco (empréstimo)",
    "銀行融資"
  ],
  [
    "Salários dos pilotos",
    "ドライバー給与"
  ],
  [
    "Viagens e operação",
    "遠征・運営"
  ],
  [
    "Reparos",
    "修理"
  ],
  [
    "Multas",
    "罰金"
  ],
  [
    "Outros",
    "その他"
  ],
  [
    "Teto de gastos",
    "コストキャップ"
  ],
  [
    "Usado",
    "使用済み"
  ],
  [
    "{0} de {1}. Salário de piloto e motor ficam fora da conta.",
    "上限{1}に対し{0}。ドライバー給与とエンジンは対象外。"
  ],
  [
    "Previsão para {0}",
    "{0}年の予測"
  ],
  [
    "O prêmio de construtores é estimado pelo resultado do ano passado. O resto sai dos contratos que existem hoje.",
    "コンストラクター賞金は前年の成績から推定しています。残りは現在の契約に基づきます。"
  ],
  [
    "{0} até aqui",
    "{0}年の現時点"
  ],
  [
    "Nenhuma temporada completa ainda.",
    "完了したシーズンはまだありません。"
  ],
  [
    "Nada ainda.",
    "まだ何もありません。"
  ],
  [
    "rápido",
    "高速"
  ],
  [
    "de rua",
    "市街地"
  ],
  [
    "técnico",
    "テクニカル"
  ],
  [
    "chuva provável",
    "雨の可能性が高い"
  ],
  [
    "pode chover",
    "雨の可能性あり"
  ],
  [
    "tempo firme",
    "安定した天候"
  ],
  [
    "Estratégia de cada carro",
    "各マシンの戦略"
  ],
  [
    "substituto",
    "代役"
  ],
  [
    "Poupar o carro",
    "マシンを温存"
  ],
  [
    "Potência máxima",
    "最大出力"
  ],
  [
    "Ordem de equipe",
    "チームオーダー"
  ],
  [
    "Corrida livre",
    "自由に競争"
  ],
  [
    "Favorecer o nº 1",
    "ナンバー1を優先"
  ],
  [
    "Nº 1: {0}",
    "ナンバー1：{0}"
  ],
  [
    "Atacar ganha posição e bate mais. Potência máxima quebra mais. A ordem de equipe só age quando o segundo piloto está logo à frente do primeiro — e ele não vai gostar.",
    "攻めれば順位を上げやすくなるが、事故も増える。最大出力では故障が増える。チームオーダーはナンバー2がナンバー1のすぐ前にいる場合だけ働くが、本人は喜ばない。"
  ],
  [
    "Primeiro treino livre",
    "第1フリー走行"
  ],
  [
    "Os titulares",
    "レギュラードライバー"
  ],
  [
    "no carro de {0}",
    "{0}のマシンで"
  ],
  [
    "Quem roda o treino ganha quilometragem e experiência. O titular que cede o carro chega ao sábado com menos acerto.",
    "走る選手は走行距離と経験を得る。マシンを譲ったレギュラーは、土曜日までのセットアップ時間が減る。"
  ],
  [
    "Imprevisto do fim de semana",
    "週末の予期せぬ出来事"
  ],
  [
    "Vencedor:",
    "優勝："
  ],
  [
    "Pole:",
    "ポール："
  ],
  [
    "Caixa no fim de semana:",
    "週末の収支："
  ],
  [
    "Simular o resto do ano?",
    "残りの年をシミュレートしますか？"
  ],
  [
    "As decisões de corrida atuais valem para todas as etapas",
    "現在のレース判断を残りの全戦に適用します"
  ],
  [
    "Faltam {0} corridas. Os acontecimentos do caminho ficam sem a sua decisão — o box resolve do jeito mais prudente.",
    "残り{0}戦。途中の出来事はあなたが判断せず、ピットが最も慎重な選択で対応します。"
  ],
  [
    "Uma peça nova, uma aposta nova",
    "新しいパーツ、新しい賭け"
  ],
  [
    "Onde",
    "分野"
  ],
  [
    "Tamanho",
    "規模"
  ],
  [
    "Carro novo",
    "新マシン"
  ],
  [
    "O que funciona no túnel nem sempre funciona na pista. Um pacote pode render mais do que o prometido, pode não mudar nada — ou pode deixar o carro pior.",
    "風洞で有効でもコースで機能するとは限らない。期待以上の成果も、変化なしも、マシンの悪化もあり得る。"
  ],
  [
    "Parte da fábrica está no carro do ano que vem: isso pesa aqui.",
    "ファクトリーの一部は来年のマシンを担当しており、今回の開発に影響する。"
  ],
  [
    "Levar para a pista",
    "コースに投入"
  ],
  [
    "Funcionou melhor do que o túnel prometia. Os pilotos sentiram na primeira volta.",
    "風洞の予測以上に機能し、ドライバーは1周目で感じ取った。"
  ],
  [
    "Funcionou como o previsto. Um passo à frente.",
    "予想どおりに機能。一歩前進。"
  ],
  [
    "Mal se nota no cronômetro. O dinheiro foi, o ganho não veio.",
    "タイムへの影響はほぼなし。資金は消え、成果は来なかった。"
  ],
  [
    "O carro ficou pior. A correlação entre túnel e pista falhou, e o pacote volta para a fábrica.",
    "マシンは悪化。風洞と実走の相関が外れ、パッケージはファクトリーに戻る。"
  ],
  [
    "Melhor do que o esperado",
    "予想以上"
  ],
  [
    "Deu certo",
    "成功"
  ],
  [
    "Mais ou menos",
    "まずまず"
  ],
  [
    "Deu errado",
    "失敗"
  ],
  [
    "Decisão do chefe",
    "チーム代表の判断"
  ],
  [
    "Um ano que vai ficar nos livros pelo motivo errado: a equipe foi excluída do campeonato de construtores.",
    "不名誉な理由で記録に残る1年。チームはコンストラクター選手権から除外された。"
  ],
  [
    "Campeã. A {0} termina {1} no topo{2}. É para isso que se passa a pré-temporada inteira na fábrica.",
    "チャンピオン。{0}は{1}年を頂点で終える{2}。プレシーズンを丸ごとファクトリーで過ごすのは、このためだ。"
  ],
  [
    ", com o campeão entre os pilotos",
    "、ドライバー王者も輩出して"
  ],
  [
    "O carro era o {0} do grid e a equipe terminou em {1}. Os pilotos e o box tiraram mais do que o material permitia.",
    "マシンはグリッドで{0}相当だったが、チームは{1}で終えた。ドライバーとピットが機材以上の力を引き出した。"
  ],
  [
    "O carro era o {0} do grid e a equipe terminou em {1}. Ficou ponto pelo caminho — quebra, erro ou azar.",
    "マシンはグリッドで{0}相当だったが、チームは{1}で終えた。故障、ミス、不運によってポイントを取り逃した。"
  ],
  [
    "{0} nos construtores, mais ou menos onde o carro permitia. Nem milagre, nem desastre.",
    "コンストラクター{0}。ほぼマシン相応の成績で、奇跡でも惨事でもない。"
  ],
  [
    "O conselho",
    "取締役会"
  ],
  [
    "A diretoria",
    "経営陣"
  ],
  [
    "A meta era {0} e a equipe terminou em {1}. Confiança em {2}% ({3}).",
    "目標{0}に対し、チームは{1}。信頼は{2}%（{3}）。"
  ],
  [
    "Não há mais clima para você no cargo.",
    "この役職を続けることはできません。"
  ],
  [
    "É o último aviso.",
    "これが最後の警告です。"
  ],
  [
    "deu calote e rompeu",
    "支払わずに契約解除"
  ],
  [
    "cumprido, bônus de {0}",
    "達成、ボーナス{0}"
  ],
  [
    "não cumprido, contrato reduzido",
    "未達成、契約額減少"
  ],
  [
    "Campeão:",
    "王者："
  ],
  [
    "Construtores:",
    "コンストラクター："
  ],
  [
    "O dinheiro do ano",
    "年間の財務"
  ],
  [
    "O dinheiro do ano · prêmio de {0}",
    "年間の財務 · 賞金{0}"
  ],
  [
    "A auditoria da federação vai olhar as suas contas",
    "連盟の監査が会計を確認します"
  ],
  [
    "A equipe gastou {0} acima do teto de {1} — {2}% a mais. Dá para declarar e aceitar a punição, ou apresentar as contas de um jeito que a auditoria talvez não perceba.",
    "チームは上限{1}を{0}超過し、{2}%の使いすぎです。申告して罰則を受けるか、監査で気づかれないよう会計を見せることもできます。"
  ],
  [
    "Declarar o estouro",
    "超過を申告"
  ],
  [
    "Multa e menos túnel de vento no ano que vem. Acaba aí.",
    "罰金と来年の風洞時間削減。それで決着する。"
  ],
  [
    "Maquiar as contas",
    "会計を操作"
  ],
  [
    "Se passar, passou. Se não passar, é escândalo, multa pesada e perda de pontos.",
    "通れば問題なし。発覚すればスキャンダル、高額罰金、ポイント剥奪。"
  ],
  [
    "O veredito",
    "裁定"
  ],
  [
    "O rombo",
    "資金不足"
  ],
  [
    "A diretoria pagou a conta",
    "経営陣が支払いました"
  ],
  [
    "O dono cobriu {0} de dívida. Cobriu, e anotou. A confiança caiu para {1}%.",
    "オーナーが{0}の借金を肩代わりした。支払ったことは記憶に残る。信頼は{1}%に低下した。"
  ],
  [
    "Falência",
    "破産"
  ],
  [
    "A equipe deve {0}",
    "チームの借金：{0}"
  ],
  [
    "O dinheiro acabou. Os fornecedores cobram, os funcionários perguntam do salário e o banco quer uma resposta até sexta.",
    "資金が尽きた。供給業者が支払いを求め、従業員は給与を心配し、銀行は金曜日までの返答を求めている。"
  ],
  [
    "Aceitar um resgate",
    "救済を受ける"
  ],
  [
    "Um investidor paga a dívida e fica com {0}% da equipe.",
    "投資家が借金を返済し、チームの{0}%を取得する。"
  ],
  [
    "Fechar as portas",
    "チームを閉鎖"
  ],
  [
    "A equipe deixa de existir. A sua carreira de chefe termina aqui.",
    "チームは消滅し、チーム代表としてのキャリアもここで終わる。"
  ],
  [
    "A equipe sobrevive",
    "チームは存続"
  ],
  [
    "A dívida foi paga. Você agora tem {0}% da {1}.",
    "借金は返済された。現在の持分は{1}の{0}%。"
  ],
  [
    "Existe um conselho acima de você.",
    "あなたの上に取締役会が置かれる。"
  ],
  [
    "A {0} quer outro nome no muro dos boxes",
    "{0}はピットウォールに別の人物を求めています"
  ],
  [
    "A reunião foi curta.",
    "会議は短かった。"
  ],
  [
    "O telefone, pelo menos, tocou:",
    "少なくとも電話は鳴った："
  ],
  [
    "E o telefone não tocou.",
    "電話は鳴らなかった。"
  ],
  [
    "Assumir a {0} no lugar do chefe atual.",
    "現在の代表に代わり、{0}を率いる。"
  ],
  [
    "Pendurar o fone de ouvido.",
    "ヘッドセットを外す。"
  ],
  [
    "Você deixou o paddock.",
    "あなたはパドックを去りました。"
  ],
  [
    "Fim de carreira.",
    "キャリア終了。"
  ],
  [
    "Fim da linha",
    "道の終わり"
  ],
  [
    "Você vendeu a {0}.",
    "{0}を売却しました。"
  ],
  [
    "Você vendeu a {0} para {1} por {2}.",
    "{0}を{1}に{2}で売却しました。"
  ],
  [
    "A {0} fechou as portas.",
    "{0}は閉鎖しました。"
  ],
  [
    "Voltar ao início",
    "ホームに戻る"
  ],
  [
    "Proposta pelo seu piloto",
    "所属ドライバーへのオファー"
  ],
  [
    "A {0} quer {1} para {2}. Ele ainda tem contrato com você até {3} — e quer ir.",
    "{0}は{2}年に{1}を求めています。あなたとの契約は{3}年まで残っていますが、本人は移籍を望んでいます。"
  ],
  [
    "Liberar por {0}",
    "{0}で移籍を認める"
  ],
  [
    "A multa entra no caixa e a vaga abre.",
    "契約解除金が入り、シートが空く。"
  ],
  [
    "Oferecer aumento de 40%",
    "40%の昇給を提示"
  ],
  [
    "Pode resolver. Pode só adiar.",
    "解決するかもしれないし、先延ばしにすぎないかもしれない。"
  ],
  [
    "Segurar pelo contrato",
    "契約で引き留める"
  ],
  [
    "Ele fica. Contrariado.",
    "残留する。不満を抱えたまま。"
  ],
  [
    "O que mudou desde a última bandeirada",
    "前回のチェッカー以降の変化"
  ],
  [
    "Entendido",
    "了解"
  ],
  [
    "muito acima do esperado",
    "予想を大幅に上回る"
  ],
  [
    "como o previsto",
    "予想どおり"
  ],
  [
    "abaixo do esperado",
    "予想以下"
  ],
  [
    "nasceu com problema",
    "初めから問題を抱える"
  ],
  [
    "segurou melhor do que se temia",
    "懸念よりうまく持ちこたえた"
  ],
  [
    "caiu o previsto",
    "予想どおり低下"
  ],
  [
    "caiu mais do que o previsto",
    "予想以上に低下"
  ],
  [
    "desabou",
    "大幅に悪化"
  ],
  [
    "Testes de pré-temporada",
    "プレシーズンテスト"
  ],
  [
    "A meta com a diretoria",
    "経営陣との目標設定"
  ],
  [
    "Aceitar o {0} lugar",
    "{0}を受け入れる"
  ],
  [
    "O combinado de sempre.",
    "いつもどおりの合意。"
  ],
  [
    "Prometer o {0} lugar",
    "{0}を約束する"
  ],
  [
    "Mais 10% de verba agora. No fim do ano, a cobrança pesa mais — para o bem e para o mal.",
    "今の資金が10%増える。年末の評価は良くも悪くも厳しくなる。"
  ],
  [
    "Pedir paciência: {0} lugar",
    "猶予を求める：{0}"
  ],
  [
    "Menos 10% de verba e um pouco de confiança a menos agora. Menos risco de demissão.",
    "資金が10%減り、現時点の信頼も少し下がる。解任の危険は減る。"
  ],
  [
    "Pelos tempos dos testes, o carro está entre o",
    "テストタイムによるマシンの推定順位："
  ],
  [
    "e o",
    "〜"
  ],
  [
    "do grid de {0}.",
    "、全{0}台のグリッド。"
  ],
  [
    "A diretoria espera o {0} lugar nos construtores.",
    "経営陣はコンストラクター{0}を期待している。"
  ],
  [
    "Com o regulamento novo, todo mundo ainda está aprendendo.",
    "新規則の下では、全員がまだ学習中だ。"
  ],
  [
    "Para a primeira corrida",
    "開幕戦へ"
  ],
  [
    "Mercado de pilotos",
    "ドライバー市場"
  ],
  [
    "Ninguém sob contrato.",
    "契約下の選手はいません。"
  ],
  [
    "recusou renovar",
    "更新を拒否"
  ],
  [
    "Deixar ir",
    "送り出す"
  ],
  [
    "Promover a titular",
    "レギュラーに昇格"
  ],
  [
    "Fazer reserva",
    "リザーブに指定"
  ],
  [
    "Emprestar a outra equipe",
    "他チームへレンタル"
  ],
  [
    "Regen",
    "生成選手"
  ],
  [
    "Piloto criado pelo jogo",
    "ゲームが生成したドライバー"
  ],
  [
    "Outras categorias",
    "他カテゴリー"
  ],
  [
    "Quem está no grid. Tirar alguém de uma equipe maior é caro e quase nunca dá certo.",
    "現在のグリッドにいる選手。より大きなチームから引き抜くのは高価で、成功することも少ない。"
  ],
  [
    "Ficaram sem carro. Querem voltar e aceitam quase qualquer proposta.",
    "シートを失った選手。復帰を望み、ほぼどんな提示にも応じる。"
  ],
  [
    "A fila da Fórmula 1: os melhores da F2 e da F3. Quem tem até 21 anos pode ir direto para a academia.",
    "F1を待つF2・F3の有力選手。21歳以下なら直接アカデミーに迎えられる。"
  ],
  [
    "Pilotos reais de outras categorias. A nota foi convertida para a escala da Fórmula 1 pela diferença de quem correu nas duas.",
    "他カテゴリーの実在選手。両方で走った選手の差を用いて、評価をF1基準に換算している。"
  ],
  [
    "Na base quase todo mundo paga para correr. O garoto rápido nem sempre é o que traz dinheiro.",
    "育成カテゴリーではほぼ全員が参戦費用を払う。速い若者が資金を持っているとは限らない。"
  ],
  [
    "{0} anos · leitura {1}–{2}",
    "{0}歳 · 推定レベル{1}〜{2}"
  ],
  [
    "Na história, corre pela {0} em {1}.",
    "史実では{1}年に{0}で走る。"
  ],
  [
    "Você já deve: faltam {0} parcela(s) de {1}. O banco não empresta de novo antes de quitar.",
    "すでに借金があります。残り{0}回、各{1}の返済。完済するまで銀行は追加融資しません。"
  ],
  [
    "Três parcelas anuais, juros de 9% ao ano. A primeira vence no começo da próxima temporada.",
    "3回の年払い、年利9%。初回は次シーズン開始時に返済します。"
  ],
  [
    "A diretoria não gosta de dívida.",
    "経営陣は借金を好みません。"
  ],
  [
    "A academia está cheia. Mais investimento abre mais vagas.",
    "アカデミーは満員です。投資を増やすと枠が増えます。"
  ],
  [
    "Leitura na F1",
    "F1での推定評価"
  ],
  [
    "Nível na {0}",
    "{0}でのレベル"
  ],
  [
    "Voltar ao mercado",
    "市場に戻る"
  ],
  [
    "renovação",
    "契約更新"
  ],
  [
    "proposta",
    "オファー"
  ],
  [
    "Pede:",
    "要求額："
  ],
  [
    "Traz:",
    "持込資金："
  ],
  [
    "Interesse:",
    "関心："
  ],
  [
    "Reserva e testes",
    "リザーブ兼テスト"
  ],
  [
    "Abaixo",
    "要求額以下"
  ],
  [
    "O pedido",
    "要求どおり"
  ],
  [
    "Acima",
    "要求額以上"
  ],
  [
    "1 ano",
    "1年"
  ],
  [
    "2 anos",
    "2年"
  ],
  [
    "3 anos",
    "3年"
  ],
  [
    "Igual ao companheiro",
    "チームメイトと同等"
  ],
  [
    "Piloto nº 1",
    "ナンバー1ドライバー"
  ],
  [
    "Ninguém diz sim antes de ouvir a proposta. E um não, às vezes, vira manchete.",
    "提示を聞く前に承諾する人はいない。断られれば見出しになることもある。"
  ],
  [
    "Fazer a proposta",
    "オファーを提示"
  ],
  [
    "{0} aceitou na hora. Contrato até {1}.",
    "{0}は即座に承諾しました。{1}年まで契約。"
  ],
  [
    "{0} aceitou. Contrato até {1}.",
    "{0}は承諾しました。{1}年まで契約。"
  ],
  [
    "O empresário dele respondeu: fecha por {0} por ano. Nem um euro a menos.",
    "マネージャーからの返答：年{0}なら契約する。1ユーロも下げない。"
  ],
  [
    "Não. Nem quis ouvir a segunda parte da proposta.",
    "拒否。提示の後半を聞こうともしなかった。"
  ],
  [
    "Agradeceu e disse que vai esperar outras conversas.",
    "礼を述べ、ほかの交渉を待つと伝えてきた。"
  ],
  [
    "Só fornece para equipes maiores que a sua.",
    "あなたより大きなチームにしか供給しない。"
  ],
  [
    "Pode aceitar. Pode preferir outro cliente.",
    "承諾するかもしれないが、別の顧客を選ぶかもしれない。"
  ],
  [
    "Trocar agora custa {0} de rescisão com a {1}.",
    "今変更すると、{1}への契約解除金{0}が必要です。"
  ],
  [
    "Você faz o seu motor. O desenvolvimento dele entra no plano do carro.",
    "自社でエンジンを造る。その開発はマシン計画に含まれる。"
  ],
  [
    "Contrato fechado",
    "契約成立"
  ],
  [
    "Não deu",
    "合意できず"
  ],
  [
    "mediana",
    "平均的"
  ],
  [
    "fraca",
    "弱い"
  ],
  [
    "hoje {0} · engenharia",
    "現在{0} · 技術効率"
  ],
  [
    "para o regulamento de {0}",
    "{0}年の規則に向けて"
  ],
  [
    "Dinheiro no carro do ano que vem sai deste ano — e vale o dobro quando o regulamento mudar.",
    "来年のマシンへの資金は今年の予算から出る。規則変更時には効果が2倍になる。"
  ],
  [
    "Total:",
    "合計："
  ],
  [
    "Teto de gastos de {0}:",
    "{0}年の予算上限："
  ],
  [
    "Renovar por {0}",
    "{0}で契約更新"
  ],
  [
    "Pede {0} por ano. {1}.",
    "要求額は年{0}。{1}。"
  ],
  [
    "{0} começa a trabalhar na segunda-feira.",
    "{0}は月曜日から働き始めます。"
  ],
  [
    "Preferiu ficar onde está. A sua equipe ainda não convence gente desse nível — ou o dinheiro não convenceu.",
    "現在の職場に残ることを選んだ。今のチームではこの水準の人材を引きつけられないか、金額が足りなかった。"
  ],
  [
    "Não existe antes de {0}.",
    "{0}年より前には存在しません。"
  ],
  [
    "Construir nível {0} · {1} · pronto em {2}",
    "レベル{0}を建設 · {1} · {2}年完成"
  ],
  [
    "Manutenção de {0} por ano",
    "維持費は年{0}"
  ],
  [
    "patrocinador principal",
    "メインスポンサー"
  ],
  [
    "Principal {0}/{1} · secundários {2}/{3}",
    "メイン{0}/{1} · サブ{2}/{3}"
  ],
  [
    "Meta: {0} (bônus de {1})",
    "目標：{0}（ボーナス{1}）"
  ],
  [
    "Até 1968 o regulamento não deixa pintar o carro com marca. Só fornecedores de combustível, pneu e peças pagam alguma coisa.",
    "1968年までは規則によりブランドをマシンに描けません。資金を出すのは燃料、タイヤ、部品の供給元だけです。"
  ],
  [
    "Nenhum.",
    "なし。"
  ],
  [
    "Ninguém bateu na porta.",
    "まだ誰からも連絡はありません。"
  ],
  [
    "Último ano: {0} na {1}",
    "昨年：{1}で{0}"
  ],
  [
    "Ainda sem resultado pela academia",
    "アカデミーでの成績はまだありません"
  ],
  [
    "emprestado em {0}",
    "{0}年はレンタル移籍中"
  ],
  [
    ". Custa {0} por ano.",
    "。費用は年{0}。"
  ],
  [
    "Básico",
    "基本"
  ],
  [
    "Forte",
    "強化"
  ],
  [
    "Referência",
    "最高水準"
  ],
  [
    "Mais investimento abre vagas (3, 4, 6 ou 8 garotos), faz os garotos evoluírem mais rápido e deixa os olheiros mais certeiros.",
    "投資を増やすと定員が3・4・6・8人と増え、若手の成長が速まり、スカウトの精度も上がります。"
  ],
  [
    "Os melhores da F2 e da F3 com até 21 anos também podem vir direto do mercado de pilotos.",
    "F2・F3の21歳以下の有力選手を、移籍市場から直接迎えることもできます。"
  ],
  [
    "{0} é emprestado para correr na Fórmula 1 por outra equipe.",
    "{0}が別のF1チームで走るため、レンタル移籍します。"
  ],
  [
    "{0} sobe da academia para um carro titular.",
    "{0}がアカデミーからレギュラーシートへ昇格します。"
  ],
  [
    "{0} sobe da academia para o posto de reserva.",
    "{0}がアカデミーからリザーブへ昇格します。"
  ],
  [
    "Carro novo, grid mais forte, orçamento maior. Os pilotos também pagam mais para correr lá.",
    "新しいマシン、強いグリッド、大きな予算。ドライバーの持込額も増える。"
  ],
  [
    "A federação já respondeu nesta pré-temporada.",
    "連盟はこのプレシーズンにすでに返答しました。"
  ],
  [
    "Para subir é preciso terminar entre os três primeiros ou ter reputação {0}. Hoje: {1}.",
    "昇格にはトップ3入りか、評判{0}が必要です。現在：{1}。"
  ],
  [
    "Você perde a maioria e passa a responder a um conselho.",
    "過半数の持分を失い、取締役会に従うことになります。"
  ],
  [
    "Paga a inscrição e põe mais {0} no caixa, em troca de {1}% da equipe.",
    "参戦費用を支払い、さらに{0}を出資する代わりに、チームの{1}%を取得する。"
  ],
  [
    "Subir com esse dinheiro",
    "この資金で昇格"
  ],
  [
    "Subir com o próprio caixa",
    "自己資金で昇格"
  ],
  [
    "Não foi desta vez",
    "今回は実現せず"
  ],
  [
    "Entra com {0} em troca de {1}% da equipe.",
    "{0}を出資し、チームの{1}%を取得する。"
  ],
  [
    "Negócio fechado",
    "取引成立"
  ],
  [
    "A sua parte vale {0}",
    "持分の価値は{0}"
  ],
  [
    "Vender encerra a sua carreira de chefe. A equipe continua existindo, com outro nome no muro dos boxes.",
    "売却するとチーム代表としてのキャリアは終了します。チームは別の代表の下で存続します。"
  ],
  [
    "um comprador",
    "買い手"
  ],
  [
    "Sem trajetória registrada nesta carreira.",
    "このキャリアでの経歴記録はありません。"
  ],
  [
    "CARRO",
    "マシン"
  ],
  [
    "do seu bolso",
    "自己負担"
  ],
  [
    "— fora do orçamento",
    "— 予算超過"
  ],
  [
    "Voltar às propostas",
    "オファーに戻る"
  ],
  [
    "Vamos correr →",
    "レースへ →"
  ],
  [
    "Pos",
    "順位"
  ],
  [
    "Pód",
    "表彰台"
  ],
  [
    "Pole",
    "ポール"
  ],
  [
    "Grid",
    "グリッド"
  ],
  [
    "Fim do vínculo com a academia",
    "アカデミーとの関係終了"
  ],
  [
    "Cobrança da academia",
    "アカデミーからの警告"
  ],
  [
    "Ver o mercado de {0} →",
    "{0}年の市場を見る →"
  ],
  [
    "CONTRATO ENCERRADO",
    "契約終了"
  ],
  [
    "Patrocinadores — {0} de 3",
    "スポンサー — 3枠中{0}枠"
  ],
  [
    "{0} / ano",
    "年{0}"
  ],
  [
    "Contrato de {0} ano.",
    "{0}年契約。"
  ],
  [
    "Contrato de {0} anos.",
    "{0}年契約。"
  ],
  [
    "Aplicar {0}",
    "{0}を投資"
  ],
  [
    "Já contratado nesta temporada.",
    "今シーズンはすでに契約済みです。"
  ],
  [
    "O que estava na mesa",
    "提示されていたもの"
  ],
  [
    "Onde dá para correr com o que você tem",
    "現在の資金で走れる場所"
  ],
  [
    "Nenhuma categoria cabe no seu orçamento.",
    "予算内で参戦できるカテゴリーがありません。"
  ],
  [
    "com você desde {0} · fica com {1}%",
    "{0}年から担当 · 取り分{1}%"
  ],
  [
    "Você escolheu: {0}",
    "選択：{0}"
  ],
  [
    "Focar na temporada",
    "シーズンに集中"
  ],
  [
    "Voltar para a temporada",
    "シーズンに戻る"
  ],
  [
    "Onde você vai correr",
    "参戦先"
  ],
  [
    "VENCEU",
    "優勝"
  ],
  [
    "CAMPEÃO",
    "チャンピオン"
  ],
  [
    "FORA",
    "脱落"
  ],
  [
    "Quem está na briga",
    "まだ争っている選手"
  ],
  [
    "Campeão da temporada",
    "シーズン王者"
  ],
  [
    "Como ele escreve sobre você",
    "彼のあなたに対する記事の書き方"
  ],
  [
    "Ele lembra",
    "彼が覚えていること"
  ],
  [
    "Agora não há o que falar",
    "今は話すことがありません"
  ],
  [
    "Ninguém ainda. O paddock se povoa correndo.",
    "まだ誰もいません。レースを重ねるとパドックに人が増えます。"
  ],
  [
    "Voltar para o paddock",
    "パドックに戻る"
  ],
  [
    "Já no macacão",
    "すでにスーツに掲出"
  ],
  [
    "Seguir para a temporada →",
    "シーズンへ進む →"
  ],
  [
    "Sua galeria",
    "あなたのギャラリー"
  ],
  [
    "Antes disso, nas categorias de acesso",
    "その前の育成カテゴリー時代"
  ],
  [
    "Entre os maiores da {0}",
    "{0}の歴代上位に入る"
  ],
  [
    "ninguém à sua frente.",
    "あなたより上には誰もいません。"
  ],
  [
    "Sua carreira entrou na galeria de lendas. O arquivo de temporadas continua disponível nesta página até você começar outra.",
    "あなたのキャリアがレジェンドの殿堂に入りました。新しいキャリアを始めるまで、このページからシーズンのアーカイブを確認できます。"
  ],
  [
    "Os maiores da história",
    "歴代の偉大なドライバー"
  ],
  [
    "Corrida a corrida",
    "レースごと"
  ],
  [
    "Classificação final do campeonato",
    "最終選手権順位"
  ],
  [
    "← Todas as temporadas",
    "← 全シーズン"
  ],
  [
    "Aproveitamento de vitórias",
    "勝率"
  ],
  [
    "Escada em {0}:",
    "{0}年の進路："
  ],
  [
    "Pontuação:",
    "得点制度："
  ],
  [
    "Épocas:",
    "時代："
  ],
  [
    "Criar piloto →",
    "ドライバーを作成 →"
  ],
  [
    "não existia",
    "未創設"
  ],
  [
    "pendente: sem fonte",
    "未確認：出典なし"
  ],
  [
    "pendente: tabela ilegível",
    "未確認：表を読み取れず"
  ],
  [
    "só a classificação · {0}",
    "順位表のみ · {0}人"
  ],
  [
    "grid real · {0} pilotos",
    "実際のグリッド · {0}人"
  ],
  [
    "O banco de campeonatos ainda está carregando. Tente de novo em um instante.",
    "選手権データを読み込み中です。少し待ってから再試行してください。"
  ],
  [
    "Campeonatos reais",
    "実在の選手権"
  ],
  [
    "{0} campeonatos de 1950 a hoje, com a fonte de cada temporada",
    "1950年から現在までの{0}選手権、各シーズンの出典付き"
  ],
  [
    "Ex.: Fórmula 3, GP2, Macau",
    "例：Formula 3、GP2、Macau"
  ],
  [
    "Todos os níveis",
    "全レベル"
  ],
  [
    "Tipo e situação",
    "種別と状態"
  ],
  [
    "Todos os tipos",
    "全種別"
  ],
  [
    "Existiam no ano",
    "その年に存在"
  ],
  [
    "Extintos hoje",
    "現在は廃止"
  ],
  [
    "Dados: Wikipedia em inglês (CC BY-SA 4.0). Uma fonte só: nada aqui é dado como verificado.",
    "データ：英語版Wikipedia（CC BY-SA 4.0）。単一の出典であり、検証済みのデータとは扱っていません。"
  ],
  [
    "Prestígio estimado pelo nível",
    "レベルに基づく推定格付け"
  ],
  [
    "Campeão em {0}:",
    "{0}年の王者："
  ],
  [
    "Nenhum campeonato com esses filtros.",
    "条件に合う選手権がありません。"
  ],
  [
    "{0} campeonato",
    "{0}選手権"
  ],
  [
    "{0} campeonatos",
    "{0}選手権"
  ],
  [
    "{0} com grid real de {1}",
    "{1}年の実際のグリッドあり：{0}件"
  ],
  [
    "verde: grid lido",
    "緑：グリッド読取済み"
  ],
  [
    "amarelo: só a classificação",
    "黄：順位表のみ"
  ],
  [
    "cinza: pendente",
    "灰：未確認"
  ],
  [
    "Na sua carreira, este é o campeonato do degrau",
    "このキャリアでは、次の段階の選手権です："
  ],
  [
    "Voltar ao de sempre",
    "標準に戻す"
  ],
  [
    "Campeonato só para mulheres.",
    "女性限定の選手権です。"
  ],
  [
    "Este campeonato fica fora da sua escada atual. Ele pode te chamar: os convites chegam no fim de cada temporada, conforme o seu desempenho.",
    "この選手権は現在の進路には含まれません。成績に応じてシーズン終了時に招待が届くことがあります。"
  ],
  [
    "É o campeonato do degrau",
    "この選手権の段階："
  ],
  [
    "na sua carreira.",
    "、現在のキャリアで。"
  ],
  [
    "Você ainda não tem idade para este campeonato (mínimo de {0} anos).",
    "この選手権の参加年齢に達していません（最低{0}歳）。"
  ],
  [
    "Correr este campeonato no lugar de",
    "この選手権で、次の代わりに走りますか："
  ],
  [
    "? Vale da temporada {0} em diante, sempre que você estiver nesse degrau.",
    "？ {0}年以降、この段階にいる間に適用されます。"
  ],
  [
    "? Vale da temporada {0} em diante, sempre que você estiver nesse degrau, com o grid real de cada ano.",
    "？ {0}年以降、この段階にいる間、各年の実際のグリッドで適用されます。"
  ],
  [
    "Correr este campeonato",
    "この選手権に参戦"
  ],
  [
    "A partir de {0}, esse degrau é {1}.",
    "{0}年から、この段階は{1}になります。"
  ],
  [
    "O degrau volta ao campeonato de sempre.",
    "この段階は標準の選手権に戻ります。"
  ],
  [
    "Não há página desta temporada na fonte usada (Wikipedia em inglês).",
    "使用している出典（英語版Wikipedia）には、このシーズンのページがありません。"
  ],
  [
    "Pendente:",
    "未確認："
  ],
  [
    "no jogo, este grid é simulado.",
    "ゲームでは、このグリッドをシミュレートします。"
  ],
  [
    "A página",
    "ページ"
  ],
  [
    "existe, mas nenhuma tabela foi lida.",
    "は存在しますが、表は読み取られていません。"
  ],
  [
    "só tem a classificação final: quem não pontuou pode faltar.",
    "には最終順位しかなく、無得点の選手が欠けている可能性があります。"
  ],
  [
    "Parcial",
    "一部のみ"
  ],
  [
    ", e de uma fonte só.",
    "、かつ単一の出典です。"
  ],
  [
    "Lista de inscritos lida de",
    "エントリーリストの出典："
  ],
  [
    ". É uma fonte só: o dado ainda não foi conferido com uma segunda.",
    "。単一の出典であり、別の資料との照合はまだ行っていません。"
  ],
  [
    "no jogo: {0}",
    "ゲーム内：{0}"
  ],
  [
    "Sem lista de pilotos para esta temporada.",
    "このシーズンのドライバー一覧はありません。"
  ],
  [
    "Calendário não lido.",
    "日程未読取。"
  ],
  [
    "← Todos os campeonatos",
    "← 全選手権"
  ],
  [
    "em atividade",
    "開催中"
  ],
  [
    "sucedido por",
    "後継："
  ],
  [
    "extinto",
    "廃止"
  ],
  [
    "prestígio estimado {0}",
    "推定格付け{0}"
  ],
  [
    "Temporada anterior",
    "前のシーズン"
  ],
  [
    "classificação final",
    "最終順位"
  ],
  [
    "na ordem da classificação final",
    "最終順位順"
  ],
  [
    "Campeão de {0}",
    "{0}年の王者"
  ],
  [
    "sem registro na fonte",
    "出典に記録なし"
  ],
  [
    "{0} etapas",
    "{0}戦"
  ],
  [
    "Campeões",
    "歴代王者"
  ],
  [
    "Nenhum lido.",
    "読取済みなし。"
  ],
  [
    "Dados: Wikipedia em inglês (CC BY-SA 4.0).",
    "データ：英語版Wikipedia（CC BY-SA 4.0）。"
  ],
  [
    "Temporada",
    "シーズン"
  ],
  [
    "Improvável",
    "可能性は低い"
  ],
  [
    "Difícil",
    "難しい"
  ],
  [
    "Sem vaga desde {0}",
    "{0}年からシートなし"
  ],
  [
    "Carro do ano que vem",
    "来年のマシン"
  ],
  [
    "Pista de testes",
    "テストコース"
  ],
  [
    "Kart e categorias de base",
    "カート・育成カテゴリー"
  ],
  [
    "· Os olheiros acham que ele pode chegar a",
    "· スカウトの推定到達レベル："
  ],
  [
    "Montadora asiática",
    "アジアの自動車メーカー"
  ],
  [
    "Fundo soberano do Golfo",
    "湾岸の政府系ファンド"
  ],
  [
    "Grupo de investimento americano",
    "アメリカの投資グループ"
  ],
  [
    "Não",
    "いいえ"
  ],
  [
    "Status",
    "ステータス"
  ],
  [
    "América do Norte",
    "北アメリカ"
  ],
  [
    "América do Sul",
    "南アメリカ"
  ],
  [
    "Mundo",
    "世界"
  ],
  [
    "Oceania",
    "オセアニア"
  ],
  [
    "Oriente Médio",
    "中東"
  ],
  [
    "Ásia",
    "アジア"
  ],
  [
    "África",
    "アフリカ"
  ],
  [
    "Topo mundial",
    "世界トップレベル"
  ],
  [
    "Regional",
    "地域"
  ],
  [
    "Monopostos",
    "フォーミュラカー"
  ],
  [
    "Turismo",
    "ツーリングカー"
  ],
  [
    "Pos.",
    "順位"
  ],
  [
    "Fórmula Ford Britânica",
    "British Formula Ford"
  ],
  [
    "(revisão {0}). É uma fonte só: o dado ainda não foi conferido com uma segunda.",
    "（版{0}）。単一の出典であり、別の資料との照合はまだ行っていません。"
  ],
  [
    "Ótimo se chover, ruim se não chover.",
    "雨なら有効、晴れなら不向き。"
  ],
  [
    "{0} vira {1}",
    "{0}年から{1}年へ"
  ],
  [
    "{0}–hoje",
    "{0}年〜現在"
  ],
  [
    "Trocar de país e de categoria. Custa uma fração do que a escada europeia pede — e daqui também se constrói uma carreira.",
    "国とカテゴリーを変える。費用はヨーロッパの進路の一部で済み、ここでもキャリアを築ける。"
  ],
  [
    "{0} · descarta o pior resultado",
    "{0} · 最下位成績を除外"
  ],
  [
    "Fórmula Regional da Oceania / Toyota Racing Series",
    "Formula Regional Oceania / Toyota Racing Series"
  ],
  [
    "Fórmula Regional das Américas",
    "Formula Regional Americas"
  ],
  [
    "Fórmula Regional Europeia",
    "Formula Regional European"
  ],
  [
    "Fórmula Regional Japonesa",
    "Formula Regional Japanese"
  ],
  [
    "Fórmula Regional do Oriente Médio",
    "Formula Regional Middle East"
  ],
  [
    "Fórmula Regional Indiana",
    "Formula Regional Indian"
  ],
  [
    "Campeonato Brasileiro de Kart",
    "ブラジルカート選手権"
  ],
  [
    "Campeonato Mundial de Kart FIA",
    "FIA世界カート選手権"
  ],
  [
    "Campeonato Europeu de Kart FIA",
    "FIAヨーロッパカート選手権"
  ],
  [
    "Copa Brasil de Kart",
    "ブラジルカートカップ"
  ],
  ["{0} ano(s)", "{0}年"],
  ["€ {0} por ano", "年額€{0}"],
  ["−€ {0} por ano", "年額−€{0}"],
  ["A {equipe} fecha com a {0} para {1} temporadas.", "{equipe}が{0}と{1}シーズンの契約を結んだ。"],
  ["A {equipe} fecha com a {0} para uma temporada.", "{equipe}が{0}と1シーズンの契約を結んだ。"],
  ["Hoje: {0} anos. Segurança para você, risco para eles.", "現在は{0}年契約。あなたにとっては安心、チームにとってはリスクになる。"],
  ["Hoje: {0} ano. Segurança para você, risco para eles.", "現在は{0}年契約。あなたにとっては安心、チームにとってはリスクになる。"],
  ["FORA", "敗退"],
  ["sem combustível", "燃料切れ"],
  ["Você tem contrato com a", "契約先："],
  ["por mais {0} anos. Assinar com outra equipe é quebrar o contrato: a multa é de", "との契約はあと{0}年。別のチームと契約すると違反となり、違約金は"],
  ["por mais {0} ano. Assinar com outra equipe é quebrar o contrato: a multa é de", "との契約はあと{0}年。別のチームと契約すると違反となり、違約金は"],
  [", a sua fama sofre e a {equipe} não volta a te chamar tão cedo.", "。知名度が下がり、{equipe}からも当分声がかかりません。"],
  ["por mais {0} anos. Assinar com outra equipe é quebrar o contrato: a sua fama sofre e a {equipe} não volta a te chamar tão cedo.", "との契約はあと{0}年。別のチームと契約すると違反となり、知名度が下がって{equipe}からも当分声がかかりません。"],
  ["por mais {0} ano. Assinar com outra equipe é quebrar o contrato: a sua fama sofre e a {equipe} não volta a te chamar tão cedo.", "との契約はあと{0}年。別のチームと契約すると違反となり、知名度が下がって{equipe}からも当分声がかかりません。"]
];
  window.VDO_LOCALES.ja.pairs.push(...pairs);
})();
