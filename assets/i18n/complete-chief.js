(function(){
  const rows = [
  [
    "A pressão de óleo oscilou no fim do treino. O motor ainda gira, mas os engenheiros não confiam nele.",
    "Oil pressure fluctuated at the end of practice. The engine still runs, but the engineers do not trust it.",
    "La presión de aceite osciló al final del entrenamiento. El motor sigue funcionando, pero los ingenieros no se fían de él.",
    "走行終盤に油圧が変動した。エンジンは動くが、エンジニアは信頼していない。"
  ],
  [
    "O motor de {piloto} acusou um problema",
    "{piloto}'s engine showed a problem",
    "El motor de {piloto} mostró un problema",
    "{piloto}のエンジンに問題発生"
  ],
  [
    "Motor novo e {0} posições a menos no grid para ele.",
    "A new engine and a {0}-place grid penalty for him.",
    "Motor nuevo y {0} puestos de sanción en parrilla.",
    "新品エンジンと引き換えに、グリッド{0}位降格。"
  ],
  [
    "Usar nos dois carros",
    "Use on both cars",
    "Usar en los dos coches",
    "両マシンに使用"
  ],
  [
    "Mais rápido, se funcionar. Peça nova também quebra mais.",
    "Faster, if it works. New parts also fail more often.",
    "Más rápido, si funciona. Las piezas nuevas también fallan más.",
    "機能すれば速くなる。新品パーツは故障も増える。"
  ],
  [
    "A meteorologia dá sete em dez de chuva para domingo. O acerto tem de ser fechado hoje.",
    "The forecast gives a seven-in-ten chance of rain on Sunday. Setup must be finalised today.",
    "El pronóstico da siete posibilidades de diez de lluvia el domingo. La puesta a punto debe cerrarse hoy.",
    "日曜日の降水確率は7割。セットアップは今日決める必要がある。"
  ],
  [
    "Largar os dois poupando pneu",
    "Start both cars conserving tyres",
    "Salir con ambos coches cuidando neumáticos",
    "両マシンともタイヤ温存でスタート"
  ],
  [
    "Ritmo menor no começo e menos paradas.",
    "Slower early pace and fewer pit stops.",
    "Menos ritmo al principio y menos paradas.",
    "序盤は遅くなるが、ピットストップが減る。"
  ],
  [
    "O muro ajusta durante a corrida.",
    "The pit wall adjusts during the race.",
    "El muro ajusta durante la carrera.",
    "レース中にピットウォールが調整する。"
  ],
  [
    "Os comissários chamaram {piloto}",
    "The stewards summoned {piloto}",
    "Los comisarios llamaron a {piloto}",
    "スチュワードが{piloto}を召喚"
  ],
  [
    "Dizem que ele atrapalhou um rival numa volta rápida. A decisão sai antes da largada.",
    "They say he impeded a rival on a flying lap. The decision comes before the start.",
    "Dicen que estorbó a un rival en una vuelta rápida. La decisión llegará antes de la salida.",
    "アタック中のライバルを妨害した疑い。裁定はスタート前に出る。"
  ],
  [
    "O patrocinador quer {piloto} num evento",
    "The sponsor wants {piloto} at an event",
    "El patrocinador quiere a {piloto} en un evento",
    "スポンサーがイベントに{piloto}を求めている"
  ],
  [
    "Duas horas de fotos com clientes, bem no meio da tarde de treinos.",
    "Two hours of photos with clients, right in the middle of afternoon practice.",
    "Dos horas de fotos con clientes, en plena tarde de entrenamientos.",
    "午後の走行の真っ最中に、顧客との写真撮影が2時間。"
  ],
  [
    "Mandar o piloto",
    "Send the driver",
    "Enviar al piloto",
    "ドライバーを派遣"
  ],
  [
    "Entram {0} no caixa. Ele perde um treino e chega ao sábado com menos acerto.",
    "{0} comes in. He misses a practice session and reaches Saturday with less setup work.",
    "Entran {0} en caja. Pierde un entrenamiento y llega al sábado con menos trabajo de puesta a punto.",
    "{0}が入る。走行を1回失い、土曜日のセットアップ準備が減る。"
  ],
  [
    "O piloto treina tudo. O dinheiro fica para outra vez.",
    "The driver completes all practice. The money can wait.",
    "El piloto hace todos los entrenamientos. El dinero queda para otra ocasión.",
    "全セッションを走る。資金は別の機会に。"
  ],
  [
    "{piloto} acordou com febre",
    "{piloto} woke up with a fever",
    "{piloto} se despertó con fiebre",
    "{piloto}が発熱"
  ],
  [
    "Melhora bastante, mas ele chega abatido.",
    "It helps a lot, but he arrives drained.",
    "Mejora bastante, pero llega agotado.",
    "かなり回復するが、消耗した状態で臨む。"
  ],
  [
    "Os comissários aceitaram a explicação: nenhuma punição.",
    "The stewards accepted the explanation: no penalty.",
    "Los comisarios aceptaron la explicación: sin sanción.",
    "説明が認められ、ペナルティなし。"
  ],
  [
    "Recurso negado e a punição dobrou: seis posições no grid.",
    "Appeal rejected and the penalty doubled: six grid places.",
    "Recurso rechazado y sanción duplicada: seis puestos en parrilla.",
    "抗議は却下され、ペナルティはグリッド6位降格に倍増。"
  ],
  [
    "{piloto} destruiu o carro.",
    "{piloto} destroyed the car.",
    "{piloto} destrozó el coche.",
    "{piloto}がマシンを大破させた。"
  ],
  [
    "O carro de {piloto} quebrou.",
    "{piloto}'s car broke down.",
    "El coche de {piloto} se averió.",
    "{piloto}のマシンが故障した。"
  ],
  [
    "{piloto} errou e perdeu posições.",
    "{piloto} made a mistake and lost positions.",
    "{piloto} cometió un error y perdió posiciones.",
    "{piloto}がミスで順位を落とした。"
  ],
  [
    "{piloto} abriu passagem para {rival}.",
    "{piloto} let {rival} through.",
    "{piloto} dejó pasar a {rival}.",
    "{piloto}が{rival}を先行させた。"
  ],
  [
    "A ordem de equipe pela vitória foi vaiada. A imprensa não perdoou.",
    "The team order for the win was booed. The press was unforgiving.",
    "La orden de equipo por la victoria fue abucheada. La prensa no perdonó.",
    "優勝を巡るチームオーダーにブーイング。メディアも容赦しなかった。"
  ],
  [
    "Vitória no GP {gp} com {piloto}.",
    "Victory in the {gp} GP with {piloto}.",
    "Victoria en el GP de {gp} con {piloto}.",
    "{piloto}が{gp}GPで優勝。"
  ],
  [
    "{piloto} morreu depois do acidente no GP {gp}. A equipe corre de luto.",
    "{piloto} died following the accident at the {gp} GP. The team races in mourning.",
    "{piloto} murió tras el accidente del GP de {gp}. El equipo corre de luto.",
    "{gp}GPの事故後、{piloto}が亡くなった。チームは喪に服して走る。"
  ],
  [
    "{piloto} se machucou no GP {gp} e fica fora por {0} corrida(s).",
    "{piloto} was injured at the {gp} GP and will miss {0} race(s).",
    "{piloto} se lesionó en el GP de {gp} y se perderá {0} carrera(s).",
    "{piloto}が{gp}GPで負傷し、{0}戦を欠場する。"
  ],
  [
    "Terminar entre os {0} primeiros construtores",
    "Finish in the top {0} constructors",
    "Terminar entre los {0} primeros constructores",
    "コンストラクターで上位{0}位以内"
  ],
  [
    "Ter no carro um piloto do país da marca ({0})",
    "Field a driver from the brand's country ({0})",
    "Alinear a un piloto del país de la marca ({0})",
    "ブランドの国（{0}）出身のドライバーを起用"
  ],
  [
    "Subir ao pódio pelo menos uma vez",
    "Reach the podium at least once",
    "Subir al podio al menos una vez",
    "最低1回の表彰台"
  ],
  [
    "Toparam 25% a mais sem discutir. Talvez desse para pedir mais.",
    "They agreed to 25% more without arguing. Perhaps you could have asked for more.",
    "Aceptaron un 25% más sin discutir. Quizá se podía pedir más.",
    "交渉なしで25%増を承諾。もっと要求できたかもしれない。"
  ],
  [
    "Meio caminho",
    "Halfway there",
    "A medio camino",
    "中間の合意"
  ],
  [
    "Subiram 12%. Disseram que é o teto.",
    "They raised it by 12%. They say that is the limit.",
    "Subieron un 12%. Dicen que es el límite.",
    "12%増額。これが上限とのこと。"
  ],
  [
    "Não mexeram",
    "No change",
    "Sin cambios",
    "変更なし"
  ],
  [
    "Ouviram e mantiveram a proposta como estava.",
    "They listened and kept the offer unchanged.",
    "Escucharon y mantuvieron la propuesta tal cual.",
    "話は聞いたが、条件はそのまま。"
  ],
  [
    "Acharam caro e foram conversar com outra equipe.",
    "They found it expensive and went to talk to another team.",
    "Les pareció caro y se fueron a hablar con otro equipo.",
    "高すぎると判断し、別チームとの交渉へ。"
  ],
  [
    "A {equipe} pega {0} emprestados no banco.",
    "{equipe} borrows {0} from the bank.",
    "{equipe} pide {0} prestados al banco.",
    "{equipe}が銀行から{0}を借り入れる。"
  ],
  [
    "{piloto}, {0} anos, entra para a academia da {equipe}.",
    "{piloto}, aged {0}, joins the {equipe} academy.",
    "{piloto}, de {0} años, entra en la academia de {equipe}.",
    "{piloto}、{0}歳が{equipe}のアカデミーに加入。"
  ],
  [
    "{piloto}, {0} anos, entra para a academia da {equipe} (vem da {cat}).",
    "{piloto}, aged {0}, joins the {equipe} academy from {cat}.",
    "{piloto}, de {0} años, entra en la academia de {equipe} procedente de {cat}.",
    "{piloto}、{0}歳が{cat}から{equipe}のアカデミーに加入。"
  ],
  [
    "{piloto}, {0} anos, entra para a academia da {equipe} (vem do {cat}).",
    "{piloto}, aged {0}, joins the {equipe} academy from {cat}.",
    "{piloto}, de {0} años, entra en la academia de {equipe} procedente de {cat}.",
    "{piloto}、{0}歳が{cat}から{equipe}のアカデミーに加入。"
  ],
  [
    "ainda no kart",
    "still in karting",
    "todavía en kart",
    "まだカートに参戦中"
  ],
  [
    "Nasce a {equipe}. A equipe estreia na Fórmula 1 em {0}.",
    "{equipe} is born. The team makes its Formula 1 debut in {0}.",
    "Nace {equipe}. El equipo debuta en Fórmula 1 en {0}.",
    "{equipe}誕生。{0}年にF1へデビューする。"
  ],
  [
    "Nasce a {equipe}, na {cat}. A Fórmula 1 fica lá em cima.",
    "{equipe} is born in {cat}. Formula 1 is a long way up.",
    "Nace {equipe}, en {cat}. La Fórmula 1 queda muy arriba.",
    "{cat}に{equipe}が誕生。F1はまだ遠い頂点にある。"
  ],
  [
    "A {0} deixou de existir. A equipe passa a correr na {1}.",
    "{0} no longer exists. The team now races in {1}.",
    "{0} dejó de existir. El equipo pasa a correr en {1}.",
    "{0}が廃止された。チームは{1}に移る。"
  ],
  [
    "{piloto} anunciou a aposentadoria, aos {0} anos.",
    "{piloto} announced retirement at age {0}.",
    "{piloto} anunció su retirada a los {0} años.",
    "{piloto}が{0}歳で引退を発表。"
  ],
  [
    "{piloto} se aposenta.",
    "{piloto} retires.",
    "{piloto} se retira.",
    "{piloto}が引退。"
  ],
  [
    "{piloto} estreia na Fórmula 1. Saiu da sua equipe direto para o grid.",
    "{piloto} makes a Formula 1 debut, moving straight from your team to the grid.",
    "{piloto} debuta en Fórmula 1, directamente de tu equipo a la parrilla.",
    "{piloto}があなたのチームから直接F1デビュー。"
  ],
  [
    "{piloto} estreia na Fórmula 1 pela {equipe}. Saiu da sua equipe direto para o grid.",
    "{piloto} makes a Formula 1 debut with {equipe}, moving straight from your team to the grid.",
    "{piloto} debuta en Fórmula 1 con {equipe}, directamente de tu equipo a la parrilla.",
    "{piloto}があなたのチームから直接{equipe}でF1デビュー。"
  ],
  [
    "{piloto}, revelado pela {equipe}, chega à Fórmula 1.",
    "{piloto}, developed by {equipe}, reaches Formula 1.",
    "{piloto}, formado en {equipe}, llega a la Fórmula 1.",
    "{equipe}が育てた{piloto}がF1へ到達。"
  ],
  [
    "{piloto} deixou a equipe para tentar a sorte em outro lugar.",
    "{piloto} left the team to try elsewhere.",
    "{piloto} dejó el equipo para probar suerte en otro lugar.",
    "{piloto}が別の場所で挑戦するためチームを去った。"
  ],
  [
    "{piloto} deixou a academia sem chegar ao carro titular.",
    "{piloto} left the academy without reaching a race seat.",
    "{piloto} dejó la academia sin llegar a un asiento titular.",
    "{piloto}がレギュラーになれないままアカデミーを去った。"
  ],
  [
    "{0} nível {1} pronto.",
    "Level {1} {0} completed.",
    "{0} de nivel {1} terminado.",
    "{0}のレベル{1}が完成。"
  ],
  [
    "A {equipe} parou de fornecer motores. É preciso achar outro fornecedor.",
    "{equipe} stopped supplying engines. You need another supplier.",
    "{equipe} dejó de suministrar motores. Hay que buscar otro proveedor.",
    "{equipe}がエンジン供給を終了。別の供給元が必要。"
  ],
  [
    "Regulamento novo em {0}: {1}. Todo carro recomeça perto do zero.",
    "New regulations in {0}: {1}. Every car starts again close to zero.",
    "Reglamento nuevo en {0}: {1}. Todos los coches vuelven casi a cero.",
    "{0}年の新規則：{1}。どのマシンもほぼゼロから出直す。"
  ],
  [
    "Em {0} vem regulamento novo ({1}). Dá para separar dinheiro agora para o carro do ano que vem.",
    "New regulations arrive in {0} ({1}). You can set aside money now for next year's car.",
    "En {0} llega un reglamento nuevo ({1}). Ya puedes reservar dinero para el coche del año que viene.",
    "{0}年に新規則（{1}）。来年のマシンに今から資金を確保できる。"
  ],
  [
    "Vazou que a {equipe} tentou contratar {piloto} e ouviu um não.",
    "It leaked that {equipe} tried to sign {piloto} and was turned down.",
    "Se filtró que {equipe} intentó fichar a {piloto} y recibió un no.",
    "{equipe}が{piloto}の獲得を断られたことが漏れた。"
  ],
  [
    "{piloto} renova com a {equipe} por {0} anos.",
    "{piloto} renews with {equipe} for {0} years.",
    "{piloto} renueva con {equipe} por {0} años.",
    "{piloto}が{equipe}と{0}年の契約更新。"
  ],
  [
    "{piloto} assina com a {equipe} por {0} anos.",
    "{piloto} signs with {equipe} for {0} years.",
    "{piloto} firma con {equipe} por {0} años.",
    "{piloto}が{equipe}と{0}年契約。"
  ],
  [
    "{piloto} renova com a {equipe} por um ano.",
    "{piloto} renews with {equipe} for one year.",
    "{piloto} renueva con {equipe} por un año.",
    "{piloto}が{equipe}と1年の契約更新。"
  ],
  [
    "{piloto} assina com a {equipe} por um ano.",
    "{piloto} signs with {equipe} for one year.",
    "{piloto} firma con {equipe} por un año.",
    "{piloto}が{equipe}と1年契約。"
  ],
  [
    "Troca a {cat} pela Fórmula 1.",
    "Leaves {cat} for Formula 1.",
    "Cambia {cat} por la Fórmula 1.",
    "{cat}からF1へ転向。"
  ],
  [
    "Troca o {cat} pela Fórmula 1.",
    "Leaves {cat} for Formula 1.",
    "Cambia {cat} por la Fórmula 1.",
    "{cat}からF1へ転向。"
  ],
  [
    "Sobe direto da {cat}.",
    "Moves straight up from {cat}.",
    "Sube directamente desde {cat}.",
    "{cat}から直接昇格。"
  ],
  [
    "Sobe direto do {cat}.",
    "Moves straight up from {cat}.",
    "Sube directamente desde {cat}.",
    "{cat}から直接昇格。"
  ],
  [
    "Volta ao grid depois de um tempo sem vaga.",
    "Returns to the grid after a spell without a seat.",
    "Vuelve a la parrilla tras un tiempo sin asiento.",
    "シートのない期間を経てグリッドに復帰。"
  ],
  [
    "{piloto} deixa a {equipe}.",
    "{piloto} leaves {equipe}.",
    "{piloto} deja {equipe}.",
    "{piloto}が{equipe}を去る。"
  ],
  [
    "{piloto} paga a multa e vai para a {equipe}.",
    "{piloto} pays the buyout and joins {equipe}.",
    "{piloto} paga la cláusula y se va a {equipe}.",
    "{piloto}が契約解除金を払い、{equipe}へ移籍。"
  ],
  [
    "{piloto} vai para a {equipe}. A multa de {0} entra no caixa, e a vaga fica aberta.",
    "{piloto} joins {equipe}. The {0} buyout goes into the bank, and the seat is open.",
    "{piloto} se va a {equipe}. La cláusula de {0} entra en caja y el asiento queda libre.",
    "{piloto}が{equipe}へ移籍。解除金{0}が入り、シートが空く。"
  ],
  [
    "O aumento resolveu. {piloto} fica, e fica feliz.",
    "The raise worked. {piloto} stays, happily.",
    "El aumento funcionó. {piloto} se queda, y contento.",
    "昇給で解決。{piloto}は満足して残留。"
  ],
  [
    "{piloto} aceitou o dinheiro, mas a cabeça ficou na {equipe}.",
    "{piloto} accepted the money but still has {equipe} on his mind.",
    "{piloto} aceptó el dinero, pero sigue pensando en {equipe}.",
    "{piloto}は資金を受け入れたが、心は{equipe}にある。"
  ],
  [
    "Contrato é contrato. {piloto} fica, contrariado — e todo mundo no box percebe.",
    "A contract is a contract. {piloto} stays unhappily, and everyone in the garage notices.",
    "Un contrato es un contrato. {piloto} se queda a disgusto y todo el garaje lo nota.",
    "契約は契約。{piloto}は不満を抱えて残り、ガレージの全員が気づいている。"
  ],
  [
    "{nome} é o novo {0} da {equipe}.",
    "{nome} is the new {0} at {equipe}.",
    "{nome} es el nuevo {0} de {equipe}.",
    "{nome}が{equipe}の新しい{0}に就任。"
  ],
  [
    "A fábrica é pequena demais para fazer motor. Amplie antes.",
    "The factory is too small to build engines. Expand it first.",
    "La fábrica es demasiado pequeña para fabricar motores. Amplíala primero.",
    "工場が小さすぎてエンジンを造れません。先に拡張してください。"
  ],
  [
    "A {equipe} vai construir o próprio motor.",
    "{equipe} will build its own engine.",
    "{equipe} fabricará su propio motor.",
    "{equipe}が自社エンジンを開発する。"
  ],
  [
    "Motor próprio. O primeiro ano costuma ser duro: ninguém acerta um motor de primeira.",
    "Your own engine. The first year is usually tough: nobody gets an engine right first time.",
    "Motor propio. El primer año suele ser duro: nadie acierta con un motor a la primera.",
    "自社エンジン。初年度は厳しい。最初から正解のエンジンを造れる人はいない。"
  ],
  [
    "Fornecedor indisponível.",
    "Supplier unavailable.",
    "Proveedor no disponible.",
    "供給元を利用できません。"
  ],
  [
    "A {equipe} não fornece para uma equipe do seu tamanho. Ainda.",
    "{equipe} does not supply teams of your size. Yet.",
    "{equipe} no suministra a equipos de tu tamaño. Todavía.",
    "{equipe}はあなたの規模のチームにはまだ供給しません。"
  ],
  [
    "A {equipe} preferiu outro cliente. Por pouco.",
    "{equipe} preferred another customer. It was close.",
    "{equipe} prefirió a otro cliente. Por poco.",
    "{equipe}は僅差で別の顧客を選びました。"
  ],
  [
    "A {equipe} fecha com a {team} para {0} temporadas.",
    "{equipe} agrees a {0}-season deal with {team}.",
    "{equipe} cierra con {team} por {0} temporadas.",
    "{equipe}が{team}と{0}シーズン契約。"
  ],
  [
    "A {equipe} fecha com a {team} para uma temporada.",
    "{equipe} agrees a one-season deal with {team}.",
    "{equipe} cierra con {team} por una temporada.",
    "{equipe}が{team}と1シーズン契約。"
  ],
  [
    "Contrato assinado com a {equipe}.",
    "Contract signed with {equipe}.",
    "Contrato firmado con {equipe}.",
    "{equipe}と契約しました。"
  ],
  [
    "Obra iniciada: {0} nível {1}.",
    "Construction started: level {1} {0}.",
    "Obra iniciada: {0} de nivel {1}.",
    "建設開始：{0}レベル{1}。"
  ],
  [
    "Patrocinador principal: {nome}.",
    "Title sponsor: {nome}.",
    "Patrocinador principal: {nome}.",
    "メインスポンサー：{nome}。"
  ],
  [
    "Novo patrocinador: {nome}.",
    "New sponsor: {nome}.",
    "Nuevo patrocinador: {nome}.",
    "新スポンサー：{nome}。"
  ],
  [
    "Banco privado suíço",
    "Swiss private bank",
    "Banco privado suizo",
    "スイスのプライベートバンク"
  ],
  [
    "Bilionário do petróleo",
    "Oil billionaire",
    "Multimillonario del petróleo",
    "石油業界の大富豪"
  ],
  [
    "Magnata da tecnologia",
    "Technology tycoon",
    "Magnate tecnológico",
    "テクノロジー業界の大物"
  ],
  [
    "Família de industriais italianos",
    "Italian industrial family",
    "Familia de industriales italianos",
    "イタリアの実業家一家"
  ],
  [
    "{0} compra {1}% da {equipe}.",
    "{0} buys {1}% of {equipe}.",
    "{0} compra el {1}% de {equipe}.",
    "{0}が{equipe}の{1}%を取得。"
  ],
  [
    "Você não tem mais a maioria. A partir de agora existe um conselho — e ele pode te tirar do cargo.",
    "You no longer have a majority. There is now a board, and it can remove you.",
    "Ya no tienes la mayoría. Ahora hay un consejo y puede destituirte.",
    "過半数を失いました。今後は取締役会が置かれ、あなたを解任できます。"
  ],
  [
    "{0} entra com {1}.",
    "{0} invests {1}.",
    "{0} aporta {1}.",
    "{0}が{1}を出資。"
  ],
  [
    "Um grupo de investidores",
    "A group of investors",
    "Un grupo de inversores",
    "投資家グループ"
  ],
  [
    "Um fundo do Golfo",
    "A Gulf fund",
    "Un fondo del Golfo",
    "湾岸のファンド"
  ],
  [
    "Uma montadora que quer voltar à F1",
    "A manufacturer seeking an F1 return",
    "Un fabricante que quiere volver a la F1",
    "F1復帰を望む自動車メーカー"
  ],
  [
    "Um bilionário da tecnologia",
    "A technology billionaire",
    "Un multimillonario tecnológico",
    "テクノロジー業界の大富豪"
  ],
  [
    "Ninguém se ofereceu para bancar.",
    "Nobody offered funding.",
    "Nadie se ofreció a financiarlo.",
    "資金を出す相手がいません。"
  ],
  [
    "Falta dinheiro: são {0} e o caixa tem {1}.",
    "Not enough money: {0} is required and you have {1}.",
    "Falta dinero: se necesitan {0} y hay {1} en caja.",
    "資金不足：必要額{0}、現金{1}。"
  ],
  [
    "A federação recusou a inscrição. Faltou estrutura — ou faltaram amigos.",
    "The federation rejected the entry. Not enough infrastructure, or not enough friends.",
    "La federación rechazó la inscripción. Faltó infraestructura, o faltaron amigos.",
    "連盟が参戦申請を拒否。設備が足りなかったか、味方が足りなかった。"
  ],
  [
    "A inscrição foi aceita, mas só vale a partir do ano que vem. Nenhum dinheiro saiu.",
    "The entry was accepted for next year only. No money was spent.",
    "La inscripción fue aceptada, pero solo para el año que viene. No se gastó dinero.",
    "参戦は認められたが、来年から。支出は発生していない。"
  ],
  [
    "{0} compra {1}% da {equipe} e banca a entrada na Fórmula 1.",
    "{0} buys {1}% of {equipe} and funds its Formula 1 entry.",
    "{0} compra el {1}% de {equipe} y financia su entrada en Fórmula 1.",
    "{0}が{equipe}の{1}%を取得し、F1参戦資金を支援。"
  ],
  [
    "A {equipe} está na Fórmula 1.",
    "{equipe} is in Formula 1.",
    "{equipe} está en Fórmula 1.",
    "{equipe}がF1に参戦。"
  ],
  [
    "Inscrição aceita. A {equipe} é equipe de Fórmula 1. Falta um motor, e talvez falte piloto.",
    "Entry accepted. {equipe} is a Formula 1 team. It still needs an engine, and perhaps drivers.",
    "Inscripción aceptada. {equipe} es un equipo de Fórmula 1. Falta un motor y quizá pilotos.",
    "参戦承認。{equipe}はF1チームになった。エンジンと、場合によってはドライバーも必要。"
  ],
  [
    "A {equipe} sobe da {0} para a {1}.",
    "{equipe} moves up from {0} to {1}.",
    "{equipe} sube de {0} a {1}.",
    "{equipe}が{0}から{1}へ昇格。"
  ],
  [
    "A equipe sobe para a {cat}. Carros novos, grid mais forte, conta maior.",
    "The team moves up to {cat}. New cars, tougher rivals, bigger bills.",
    "El equipo sube a {cat}. Coches nuevos, rivales más fuertes y cuentas mayores.",
    "チームは{cat}へ昇格。新マシン、強いライバル、大きな支出。"
  ],
  [
    "dois pilotos titulares com contrato",
    "two contracted race drivers",
    "dos pilotos titulares con contrato",
    "契約済みレギュラードライバー2人"
  ],
  [
    "um fornecedor de motor",
    "an engine supplier",
    "un proveedor de motor",
    "エンジン供給元"
  ],
  [
    "{piloto} deixa a equipe no fim do contrato.",
    "{piloto} leaves when the contract expires.",
    "{piloto} deja el equipo al terminar el contrato.",
    "{piloto}が契約満了でチームを去る。"
  ],
  [
    "{nome} se aposentou. A vaga foi preenchida às pressas.",
    "{nome} retired. The vacancy was filled in a hurry.",
    "{nome} se retiró. La vacante se cubrió con prisas.",
    "{nome}が引退。急きょ後任を確保した。"
  ],
  [
    "{nome} saiu no fim do contrato. A vaga foi preenchida às pressas.",
    "{nome} left at the end of the contract. The vacancy was filled in a hurry.",
    "{nome} salió al terminar su contrato. La vacante se cubrió con prisas.",
    "{nome}が契約満了で退任。急きょ後任を確保した。"
  ],
  [
    "{nome} deixou de pagar a última parcela e rompeu o contrato.",
    "{nome} failed to pay the last instalment and terminated the contract.",
    "{nome} dejó de pagar la última cuota y rescindió el contrato.",
    "{nome}が最終支払いを履行せず、契約を解除した。"
  ],
  [
    "A {equipe} é campeã mundial de construtores de {0}.",
    "{equipe} is the {0} world constructors' champion.",
    "{equipe} es campeona mundial de constructores de {0}.",
    "{equipe}が{0}年の世界コンストラクター王者。"
  ],
  [
    "A {equipe} é campeã da {cat} de {0}.",
    "{equipe} is the {0} {cat} champion.",
    "{equipe} es campeona de {cat} de {0}.",
    "{equipe}が{0}年の{cat}王者。"
  ],
  [
    "{piloto} é campeão mundial com a {equipe}.",
    "{piloto} is world champion with {equipe}.",
    "{piloto} es campeón mundial con {equipe}.",
    "{piloto}が{equipe}で世界王者。"
  ],
  [
    "{piloto} é campeão da {cat} com a {equipe}.",
    "{piloto} wins the {cat} title with {equipe}.",
    "{piloto} es campeón de {cat} con {equipe}.",
    "{piloto}が{equipe}で{cat}王者。"
  ],
  [
    "A {equipe} admite ter estourado o teto de gastos e aceita a punição.",
    "{equipe} admits breaching the cost cap and accepts the penalty.",
    "{equipe} admite haber superado el límite presupuestario y acepta la sanción.",
    "{equipe}が予算超過を認め、処分を受け入れる。"
  ],
  [
    "Multa de {0} e {1}% a menos de túnel de vento no ano que vem. Dói, mas acabou.",
    "A {0} fine and {1}% less wind tunnel time next year. Painful, but over.",
    "Multa de {0} y un {1}% menos de túnel el año que viene. Duele, pero acaba ahí.",
    "罰金{0}と来年の風洞時間{1}%削減。痛いが、これで決着。"
  ],
  [
    "Auditoria da federação encerrada sem apontamentos na {equipe}.",
    "The federation's audit of {equipe} found no issues.",
    "La auditoría de la federación terminó sin observaciones en {equipe}.",
    "連盟の{equipe}監査は指摘なしで終了。"
  ],
  [
    "A auditoria não encontrou nada. Desta vez.",
    "The audit found nothing. This time.",
    "La auditoría no encontró nada. Esta vez.",
    "監査は何も発見しなかった。今回は。"
  ],
  [
    "Escândalo: a {equipe} maquiou as contas do teto de gastos.",
    "Scandal: {equipe} manipulated its cost-cap accounts.",
    "Escándalo: {equipe} maquilló las cuentas del límite presupuestario.",
    "スキャンダル：{equipe}が予算上限の会計を操作。"
  ],
  [
    "A auditoria achou tudo. Multa de {0}, dez pontos a menos no campeonato e 30% menos túnel de vento. A imprensa vai lembrar disso por anos.",
    "The audit uncovered everything. A {0} fine, ten championship points deducted and 30% less wind tunnel time. The press will remember for years.",
    "La auditoría lo descubrió todo. Multa de {0}, diez puntos menos y un 30% menos de túnel. La prensa lo recordará durante años.",
    "監査ですべて発覚。罰金{0}、選手権10ポイント減点、風洞時間30%削減。メディアは何年も忘れない。"
  ],
  [
    "Credores aceitam acordo e a {equipe} é salva por um investidor.",
    "Creditors accept a deal and an investor saves {equipe}.",
    "Los acreedores aceptan un acuerdo y un inversor salva a {equipe}.",
    "債権者が合意し、投資家が{equipe}を救済。"
  ],
  [
    "{nome} é o novo chefe da {equipe}.",
    "{nome} is the new team principal of {equipe}.",
    "{nome} es el nuevo jefe de {equipe}.",
    "{nome}が{equipe}の新チーム代表。"
  ],
  [
    "Um pacote sem remetente",
    "A package with no sender",
    "Un paquete sin remitente",
    "差出人のない包み"
  ],
  [
    "Um engenheiro da {equipe} procurou gente da sua fábrica. Ele diz ter o projeto inteiro do carro deles — desenhos, dados de túnel, acerto — e quer {0} por tudo.",
    "An engineer from {equipe} contacted your factory. He claims to have the entire car project — drawings, wind tunnel data, setup — and wants {0} for everything.",
    "Un ingeniero de {equipe} contactó con tu fábrica. Dice tener todo el proyecto del coche: planos, datos de túnel y reglajes. Pide {0} por todo.",
    "{equipe}のエンジニアが工場に接触。図面、風洞データ、セットアップを含む全設計を持ち、{0}を求めている。"
  ],
  [
    "Comprar o material",
    "Buy the material",
    "Comprar el material",
    "資料を買う"
  ],
  [
    "Pode ser o atalho de uma década. Pode ser o fim da equipe.",
    "It could save a decade. It could end the team.",
    "Puede ahorrar una década. Puede acabar con el equipo.",
    "10年分の近道にも、チームの終わりにもなり得る。"
  ],
  [
    "O material é ouro e ninguém percebeu. Nas próximas corridas o carro parece outro.",
    "The material is gold and nobody noticed. The car feels transformed over the next races.",
    "El material vale oro y nadie lo notó. En las próximas carreras el coche parece otro.",
    "資料は宝だった。誰にも気づかれず、次の数戦でマシンが見違える。"
  ],
  [
    "Metade do que veio já estava velho, a outra metade serviu. Ninguém desconfia.",
    "Half was outdated; the other half helped. Nobody suspects anything.",
    "La mitad estaba anticuada; la otra mitad sirvió. Nadie sospecha.",
    "半分は古かったが、残りは役立った。誰も疑っていない。"
  ],
  [
    "Os desenhos eram de um carro que nunca foi para a pista. Dinheiro jogado fora — pelo menos em silêncio.",
    "The drawings were for a car that never raced. Money wasted, at least quietly.",
    "Los planos eran de un coche que nunca corrió. Dinero tirado, al menos en silencio.",
    "図面は実戦投入されなかったマシンのもの。金は無駄になったが、少なくとも表沙汰にはならなかった。"
  ],
  [
    "Espionagem: a {equipe} é excluída do campeonato de construtores e multada em {0}.",
    "Espionage: {equipe} is excluded from the constructors' championship and fined {0}.",
    "Espionaje: {equipe} queda excluida del campeonato de constructores y recibe una multa de {0}.",
    "スパイ行為：{equipe}はコンストラクター選手権から除外され、罰金{0}。"
  ],
  [
    "A federação descobriu. Multa de {0} e exclusão do campeonato de construtores. Os pilotos seguem pontuando, a equipe não.",
    "The federation found out. A {0} fine and exclusion from the constructors' championship. Drivers still score; the team does not.",
    "La federación lo descubrió. Multa de {0} y exclusión de constructores. Los pilotos siguen puntuando; el equipo no.",
    "連盟に発覚。罰金{0}とコンストラクター選手権からの除外。ドライバーの得点は残るが、チームには加算されない。"
  ],
  [
    "Mandar embora e esquecer",
    "Send him away and forget it",
    "Echarlo y olvidarlo",
    "追い返して忘れる"
  ],
  [
    "Ninguém fica sabendo de nada.",
    "Nobody finds out.",
    "Nadie se entera de nada.",
    "誰にも知られない。"
  ],
  [
    "Você manda o sujeito embora. Nunca mais se fala nisso — a não ser que alguém fale.",
    "You send him away. It is never mentioned again, unless someone talks.",
    "Lo echas. No se vuelve a hablar del tema, salvo que alguien hable.",
    "男を追い返した。誰かが話さない限り、二度と話題にはならない。"
  ],
  [
    "Avisar a federação",
    "Inform the federation",
    "Avisar a la federación",
    "連盟に知らせる"
  ],
  [
    "A rival vai ter semanas difíceis. Você ganha um amigo poderoso.",
    "Your rival faces difficult weeks. You gain a powerful friend.",
    "La rival tendrá semanas difíciles. Ganas un amigo poderoso.",
    "ライバルは苦しい数週間を迎え、あなたは強い味方を得る。"
  ],
  [
    "A federação abriu investigação na {equipe}. O carro deles perde peças polêmicas e o seu nome ganha crédito.",
    "The federation opened an investigation into {equipe}. Their car loses disputed parts and your standing improves.",
    "La federación abrió una investigación sobre {equipe}. Su coche pierde piezas polémicas y tu nombre gana crédito.",
    "連盟が{equipe}を調査。疑惑のパーツが撤去され、あなたの評価が上がる。"
  ],
  [
    "A federação agradeceu e arquivou. A {equipe} segue como estava.",
    "The federation thanked you and closed the case. {equipe} carries on unchanged.",
    "La federación dio las gracias y archivó el caso. {equipe} sigue igual.",
    "連盟は礼を述べて調査を終了。{equipe}は変わらない。"
  ],
  [
    "Ninguém acreditou na história, e ainda ficou parecendo inveja.",
    "Nobody believed the story. It even looked like jealousy.",
    "Nadie creyó la historia. Encima pareció envidia.",
    "誰も信じず、嫉妬しているようにさえ見られた。"
  ],
  [
    "Uma brecha no regulamento",
    "A loophole in the rules",
    "Una laguna en el reglamento",
    "規則の抜け穴"
  ],
  [
    "saias móveis que selam o assoalho",
    "movable skirts sealing the floor",
    "faldillas móviles que sellan el fondo",
    "フロアを密閉する可動スカート"
  ],
  [
    "um combustível resfriado abaixo da temperatura ambiente",
    "fuel cooled below ambient temperature",
    "combustible enfriado por debajo de la temperatura ambiente",
    "外気温より冷却した燃料"
  ],
  [
    "uma suspensão ativa que ninguém sabe se é legal",
    "an active suspension whose legality is unclear",
    "una suspensión activa cuya legalidad no está clara",
    "合法性が不明なアクティブサスペンション"
  ],
  [
    "um controle de largada escondido no software",
    "launch control hidden in the software",
    "un control de salida oculto en el software",
    "ソフトウェアに隠したローンチコントロール"
  ],
  [
    "um amortecedor de massa no bico",
    "a mass damper in the nose",
    "un amortiguador de masa en el morro",
    "ノーズ内部のマスダンパー"
  ],
  [
    "um difusor duplo",
    "a double diffuser",
    "un difusor doble",
    "ダブルディフューザー"
  ],
  [
    "escapamento soprando o difusor",
    "exhaust blowing the diffuser",
    "escapes que soplan sobre el difusor",
    "排気でディフューザーを吹く仕組み"
  ],
  [
    "um sistema que muda a convergência das rodas pelo volante",
    "a system that changes wheel toe through the steering wheel",
    "un sistema que cambia la convergencia mediante el volante",
    "ステアリングでトー角を変えるシステム"
  ],
  [
    "um assoalho que flexiona na reta",
    "a floor that flexes on straights",
    "un fondo que flexiona en las rectas",
    "直線でたわむフロア"
  ],
  [
    "O seu departamento de aerodinâmica achou uma interpretação criativa do regulamento: {0}. Ganha tempo de verdade. A pergunta é se é legal.",
    "Your aero department found a creative reading of the rules: {0}. It brings real lap time. The question is whether it is legal.",
    "Tu departamento aerodinámico encontró una interpretación creativa: {0}. Da tiempo de verdad. La duda es si es legal.",
    "空力部門が規則を創造的に解釈した：{0}。確かな速さがあるが、合法かどうかが問題だ。"
  ],
  [
    "Usar sem perguntar",
    "Use it without asking",
    "Usarlo sin preguntar",
    "確認せずに使う"
  ],
  [
    "Se ninguém protestar, é seu. Se protestarem…",
    "If nobody protests, it is yours. If they do…",
    "Si nadie protesta, es tuyo. Si protestan…",
    "抗議されなければ使える。抗議されたら…"
  ],
  [
    "Ninguém protestou. Quando os rivais copiarem, o ano já terá acabado.",
    "Nobody protested. By the time rivals copy it, the year will be over.",
    "Nadie protestó. Cuando los rivales lo copien, el año habrá acabado.",
    "抗議はなかった。ライバルが模倣する頃にはシーズンが終わっている。"
  ],
  [
    "Os rivais reclamaram, a federação considerou legal. Vantagem sua.",
    "Rivals complained; the federation ruled it legal. Your advantage.",
    "Los rivales protestaron; la federación lo consideró legal. Ventaja tuya.",
    "ライバルは抗議したが、連盟は合法と判断。優位はあなたのもの。"
  ],
  [
    "A federação proibiu na semana seguinte. Ficou só o custo da peça.",
    "The federation banned it the following week. All that remained was the bill.",
    "La federación lo prohibió la semana siguiente. Solo quedó el coste de la pieza.",
    "翌週に禁止された。パーツ代だけが残った。"
  ],
  [
    "A {equipe} é desclassificada do GP {gp} por peça irregular.",
    "{equipe} is disqualified from the {gp} GP for an illegal part.",
    "{equipe} queda descalificada del GP de {gp} por una pieza ilegal.",
    "違法パーツにより、{equipe}は{gp}GP失格。"
  ],
  [
    "Protesto aceito: os dois carros desclassificados da última corrida, e multa. A peça vai para o museu.",
    "Protest upheld: both cars disqualified from the last race, plus a fine. The part goes in the museum.",
    "Protesta aceptada: ambos coches descalificados de la última carrera y multa. La pieza va al museo.",
    "抗議が認められ、前戦の両マシンが失格、さらに罰金。パーツは博物館行きだ。"
  ],
  [
    "Consultar a federação antes",
    "Ask the federation first",
    "Consultar antes a la federación",
    "先に連盟に確認"
  ],
  [
    "Mais lento e mais seguro. Às vezes a resposta é não.",
    "Slower and safer. Sometimes the answer is no.",
    "Más lento y seguro. A veces la respuesta es no.",
    "遅いが安全。断られることもある。"
  ],
  [
    "Aprovado por escrito. Menos surpresa, menos ganho — mas é seu.",
    "Approved in writing. Less surprise, less gain, but it is yours.",
    "Aprobado por escrito. Menos sorpresa, menos ganancia, pero es tuyo.",
    "書面で承認。驚きも効果も控えめだが、正式に使える。"
  ],
  [
    "A resposta foi não. Ficou a ideia e a conta do projeto.",
    "The answer was no. You keep the idea and the design bill.",
    "La respuesta fue no. Quedaron la idea y la factura del proyecto.",
    "返答は否。アイデアと設計費だけが残った。"
  ],
  [
    "Não vale o risco.",
    "It is not worth the risk.",
    "No merece el riesgo.",
    "危険を冒す価値はない。"
  ],
  [
    "O projeto vai para a gaveta. Talvez outra equipe tenha a mesma ideia.",
    "The project is shelved. Perhaps another team has the same idea.",
    "El proyecto queda guardado. Quizá otro equipo tenga la misma idea.",
    "計画を棚上げ。別のチームも同じことを考えるかもしれない。"
  ],
  [
    "O piloto abriu a boca",
    "The driver spoke out",
    "El piloto habló de más",
    "ドライバーの発言"
  ],
  [
    "{piloto} deu entrevista depois da corrida e disse que o carro \"não serve nem para andar no pelotão\". A frase já está em todo lugar.",
    "{piloto} said after the race that the car \"is not even fit to run in the pack\". The quote is everywhere.",
    "{piloto} dijo tras la carrera que el coche \"no sirve ni para ir en el pelotón\". La frase ya está en todas partes.",
    "{piloto}がレース後に「集団で走ることすらできないマシン」と発言。言葉はすでに広まっている。"
  ],
  [
    "Multar publicamente",
    "Fine him publicly",
    "Multarlo públicamente",
    "公に罰金を科す"
  ],
  [
    "Mostra quem manda. E quem manda às vezes fica sozinho.",
    "Show who is in charge. Being in charge can be lonely.",
    "Demuestra quién manda. Y quien manda a veces se queda solo.",
    "誰が指揮するかを示す。ただし孤立することもある。"
  ],
  [
    "{piloto} pagou a multa e parou de falar com o engenheiro. O box ficou gelado.",
    "{piloto} paid the fine and stopped talking to the engineer. The garage turned cold.",
    "{piloto} pagó la multa y dejó de hablar con el ingeniero. El garaje se enfrió.",
    "{piloto}は罰金を払い、エンジニアと話さなくなった。ガレージは冷え切った。"
  ],
  [
    "A multa foi paga e a diretoria gostou. {piloto} ficou quieto — e emburrado.",
    "The fine was paid and management approved. {piloto} went quiet and sulked.",
    "La multa se pagó y la directiva lo aprobó. {piloto} se calló, enfadado.",
    "罰金は支払われ、経営陣は評価した。{piloto}は黙ったまま、不機嫌だ。"
  ],
  [
    "Conversar a portas fechadas",
    "Talk behind closed doors",
    "Hablar a puerta cerrada",
    "非公開で話す"
  ],
  [
    "Às vezes ele tem razão.",
    "Sometimes he is right.",
    "A veces tiene razón.",
    "彼が正しいこともある。"
  ],
  [
    "Conversa franca. Ele pediu desculpas e trouxe duas ideias boas para o acerto.",
    "An honest talk. He apologised and brought two good setup ideas.",
    "Una charla sincera. Se disculpó y aportó dos buenas ideas de reglaje.",
    "率直に話し合い、彼は謝罪。セットアップに有効な案も2つ出した。"
  ],
  [
    "A conversa não resolveu nada. Ele acha que tem razão — e talvez tenha.",
    "The talk solved nothing. He thinks he is right, and perhaps he is.",
    "La charla no resolvió nada. Cree tener razón, y quizá la tenga.",
    "何も解決しなかった。彼は自分が正しいと考えており、本当にそうかもしれない。"
  ],
  [
    "Na semana que vem ninguém lembra.",
    "Nobody will remember next week.",
    "La semana que viene nadie lo recordará.",
    "来週には誰も覚えていない。"
  ],
  [
    "Ninguém lembrou na semana seguinte. Quase ninguém.",
    "Nobody remembered the following week. Almost nobody.",
    "Nadie lo recordó la semana siguiente. Casi nadie.",
    "翌週には忘れられた。ほとんどの人には。"
  ],
  [
    "O patrocinador na primeira página",
    "The sponsor on the front page",
    "El patrocinador en portada",
    "スポンサーが一面に"
  ],
  [
    "A {nome} está sendo investigada por fraude. O logotipo dela está no seu carro — e na foto de todas as matérias.",
    "{nome} is under investigation for fraud. Its logo is on your car and in every news photo.",
    "{nome} está siendo investigada por fraude. Su logo está en tu coche y en las fotos de todas las noticias.",
    "{nome}に詐欺疑惑。ロゴはあなたのマシンにあり、すべての報道写真にも写っている。"
  ],
  [
    "Romper o contrato",
    "Terminate the contract",
    "Rescindir el contrato",
    "契約解除"
  ],
  [
    "Perde o dinheiro que falta. Salva o nome.",
    "Lose the remaining money. Save your name.",
    "Pierdes el dinero pendiente. Salvas tu nombre.",
    "残りの資金は失うが、評判を守る。"
  ],
  [
    "Contrato rompido e carro repintado para a próxima corrida. O dinheiro some, o nome fica limpo.",
    "Contract terminated, car repainted for the next race. The money disappears; your name stays clean.",
    "Contrato rescindido y coche repintado para la próxima carrera. El dinero desaparece; el nombre queda limpio.",
    "契約を解除し、次戦までに塗装変更。資金は消えたが、名は汚れずに済んだ。"
  ],
  [
    "Manter e esperar",
    "Keep it and wait",
    "Mantenerlo y esperar",
    "継続して待つ"
  ],
  [
    "Talvez não dê em nada.",
    "Perhaps nothing will come of it.",
    "Quizá no quede en nada.",
    "何も起きないかもしれない。"
  ],
  [
    "A investigação não deu em nada. O dinheiro continua caindo na conta.",
    "The investigation came to nothing. The money keeps arriving.",
    "La investigación no llegó a nada. El dinero sigue llegando.",
    "捜査は不発。入金は続く。"
  ],
  [
    "O caso se arrasta. O dinheiro vem, mas cada foto do carro é uma matéria negativa.",
    "The case drags on. Money comes in, but every car photo brings negative coverage.",
    "El caso se alarga. Llega el dinero, pero cada foto del coche trae prensa negativa.",
    "事件は長期化。金は入るが、マシンの写真が毎回悪い記事につながる。"
  ],
  [
    "A empresa quebrou. Parou de pagar e o seu carro ficou na capa com o logo de uma fraude.",
    "The company collapsed and stopped paying. Your car made the cover carrying a fraud's logo.",
    "La empresa quebró y dejó de pagar. Tu coche acabó en portada con el logo de un fraude.",
    "会社が破綻し、入金停止。詐欺企業のロゴを載せたマシンが一面に出た。"
  ],
  [
    "Querem levar o seu engenheiro",
    "They want your engineer",
    "Quieren llevarse a tu ingeniero",
    "エンジニアの引き抜き"
  ],
  [
    "uma equipe grande",
    "a big team",
    "un equipo grande",
    "大手チーム"
  ],
  [
    "A {equipe} ofereceu o dobro do salário para {nome}, o seu {0}. Ele ainda não respondeu.",
    "{equipe} offered double the salary to {nome}, your {0}. He has not answered yet.",
    "{equipe} ofreció el doble de sueldo a {nome}, tu {0}. Aún no ha respondido.",
    "{equipe}があなたの{0}、{nome}に給与2倍を提示。まだ返事はない。"
  ],
  [
    "Cobrir a oferta",
    "Match the offer",
    "Igualar la oferta",
    "提示額に対抗"
  ],
  [
    "Caro. Mas projetista bom não se acha na esquina.",
    "Expensive. But good designers are hard to find.",
    "Caro. Pero no se encuentra un buen diseñador en cualquier esquina.",
    "高い。だが優秀な設計者は簡単には見つからない。"
  ],
  [
    "{nome} agradeceu e foi mesmo assim. Dinheiro não era o problema.",
    "{nome} thanked you and left anyway. Money was not the issue.",
    "{nome} dio las gracias y se fue igualmente. El dinero no era el problema.",
    "{nome}は礼を述べ、それでも去った。金の問題ではなかった。"
  ],
  [
    "{nome} fica, com contrato novo e salário de estrela.",
    "{nome} stays with a new contract and a star's salary.",
    "{nome} se queda con contrato nuevo y sueldo de estrella.",
    "{nome}が新契約とスター級の給与で残留。"
  ],
  [
    "Deixar ir e cobrar a multa",
    "Let him go and collect the buyout",
    "Dejarlo ir y cobrar la cláusula",
    "移籍を認め解除金を受け取る"
  ],
  [
    "Entra dinheiro, sai conhecimento.",
    "Money comes in, expertise goes out.",
    "Entra dinero, sale conocimiento.",
    "金は入るが、知識は失われる。"
  ],
  [
    "{nome} vai para a {equipe}. A multa entra no caixa; o substituto chega na semana que vem.",
    "{nome} joins {equipe}. The buyout is paid; the replacement arrives next week.",
    "{nome} se va a {equipe}. La cláusula entra en caja; el sustituto llega la semana que viene.",
    "{nome}が{equipe}へ。解除金が入り、後任は来週到着する。"
  ],
  [
    "Um pai com dinheiro",
    "A wealthy father",
    "Un padre con dinero",
    "資金を持つ父親"
  ],
  [
    "Um industrial ofereceu {0} por ano para o filho, {piloto}, ser o seu piloto reserva. O garoto é rápido o suficiente para não passar vergonha. Quase.",
    "An industrialist offered {0} a year for his son, {piloto}, to be your reserve driver. The boy is fast enough to avoid embarrassment. Almost.",
    "Un industrial ofreció {0} al año para que su hijo, {piloto}, sea tu reserva. El chico es lo bastante rápido para no hacer el ridículo. Casi.",
    "実業家が息子{piloto}をリザーブにするため年{0}を提示。恥をかかない程度には速い。ほぼ。"
  ],
  [
    "Aceitar como reserva",
    "Accept as reserve",
    "Aceptarlo como reserva",
    "リザーブとして承諾"
  ],
  [
    "Dinheiro na mão, reserva fraco no box.",
    "Cash in hand, a weak reserve in the garage.",
    "Dinero en mano, un reserva flojo en el garaje.",
    "資金は入るが、リザーブは力不足。"
  ],
  [
    "{piloto} é o novo piloto reserva. O dinheiro entra corrida a corrida.",
    "{piloto} is the new reserve. The money comes in race by race.",
    "{piloto} es el nuevo reserva. El dinero entra carrera a carrera.",
    "{piloto}が新リザーブ。資金はレースごとに入る。"
  ],
  [
    "{piloto} teve de sair para abrir a vaga.",
    "{piloto} had to leave to make room.",
    "{piloto} tuvo que salir para dejar sitio.",
    "枠を空けるため{piloto}が退団した。"
  ],
  [
    "O carro reserva é para quem sabe correr.",
    "The reserve car is for someone who can race.",
    "El coche reserva es para quien sabe correr.",
    "リザーブは走れる人のための席だ。"
  ],
  [
    "O industrial foi bater em outra porta. Achou em uma semana.",
    "The industrialist tried another door. He found one in a week.",
    "El industrial llamó a otra puerta. La encontró en una semana.",
    "実業家は別の扉をたたき、1週間で相手を見つけた。"
  ],
  [
    "Quatro da manhã",
    "Four in the morning",
    "Las cuatro de la mañana",
    "午前4時"
  ],
  [
    "{piloto} foi fotografado saindo de uma festa às quatro da manhã, na véspera da corrida. As fotos já estão rodando.",
    "{piloto} was photographed leaving a party at four in the morning before the race. The photos are circulating.",
    "Fotografiaron a {piloto} saliendo de una fiesta a las cuatro de la mañana antes de la carrera. Las fotos ya circulan.",
    "レース前夜、午前4時にパーティーを出る{piloto}が撮影され、写真はすでに出回っている。"
  ],
  [
    "Suspender por uma corrida",
    "Suspend for one race",
    "Suspenderlo una carrera",
    "1戦出場停止"
  ],
  [
    "O reserva entra. O recado fica dado.",
    "The reserve steps in. The message is clear.",
    "Entra el reserva. El mensaje queda claro.",
    "リザーブを起用し、意思を示す。"
  ],
  [
    "{piloto} assiste a próxima corrida do box. A diretoria gostou.",
    "{piloto} watches the next race from the garage. Management approves.",
    "{piloto} ve la próxima carrera desde el garaje. La directiva lo aprobó.",
    "{piloto}は次戦をガレージから見る。経営陣は評価した。"
  ],
  [
    "Multar e seguir",
    "Fine him and move on",
    "Multarlo y seguir",
    "罰金で済ませる"
  ],
  [
    "O meio-termo de sempre.",
    "The usual compromise.",
    "El término medio de siempre.",
    "いつもどおりの妥協。"
  ],
  [
    "Ele pagou rindo. Ninguém no box entendeu como punição.",
    "He paid with a laugh. Nobody in the garage saw it as punishment.",
    "Pagó riéndose. Nadie en el garaje lo vio como castigo.",
    "笑って支払った。誰も処罰とは受け取らなかった。"
  ],
  [
    "Multa paga, pedido de desculpas no dia seguinte.",
    "Fine paid, apology the next day.",
    "Multa pagada, disculpas al día siguiente.",
    "罰金を払い、翌日に謝罪。"
  ],
  [
    "Proteger o piloto",
    "Protect the driver",
    "Proteger al piloto",
    "ドライバーを守る"
  ],
  [
    "Todo mundo tem uma noite ruim.",
    "Everyone has a bad night.",
    "Todos tienen una mala noche.",
    "誰にでも悪い夜はある。"
  ],
  [
    "{piloto} nunca vai esquecer que você segurou a barra.",
    "{piloto} will never forget that you stood by him.",
    "{piloto} nunca olvidará que lo apoyaste.",
    "{piloto}は守ってもらったことを忘れない。"
  ],
  [
    "A imprensa caiu em cima de você, não dele.",
    "The press came after you, not him.",
    "La prensa fue a por ti, no a por él.",
    "メディアは彼ではなくあなたを責めた。"
  ],
  [
    "Uma proposta pela equipe",
    "An offer for the team",
    "Una oferta por el equipo",
    "チームへの買収提案"
  ],
  [
    "uma montadora alemã",
    "a German car manufacturer",
    "un fabricante alemán",
    "ドイツの自動車メーカー"
  ],
  [
    "um fundo americano",
    "an American fund",
    "un fondo estadounidense",
    "アメリカのファンド"
  ],
  [
    "um bilionário do Golfo",
    "a Gulf billionaire",
    "un multimillonario del Golfo",
    "湾岸の大富豪"
  ],
  [
    "uma marca de bebida energética",
    "an energy drink brand",
    "una marca de bebida energética",
    "エナジードリンクブランド"
  ],
  [
    "{0} quer comprar a {equipe} inteira por {1}. Você receberia a sua parte e sairia de cena.",
    "{0} wants to buy all of {equipe} for {1}. You would receive your share and leave.",
    "{0} quiere comprar toda {equipe} por {1}. Cobrarías tu parte y te retirarías.",
    "{0}が{equipe}全体を{1}で買収したい。持分の代金を受け取り、退くことになる。"
  ],
  [
    "Encerra a sua carreira de chefe com o dinheiro no bolso.",
    "End your career as team principal with the money in your pocket.",
    "Termina tu carrera como jefe con el dinero en el bolsillo.",
    "代金を受け取り、チーム代表のキャリアを終える。"
  ],
  [
    "Negócio fechado. A {equipe} muda de dono no fim do ano.",
    "Deal done. {equipe} changes owner at the end of the year.",
    "Trato cerrado. {equipe} cambia de dueño a final de año.",
    "取引成立。{equipe}は年末にオーナーが変わる。"
  ],
  [
    "Ela não está à venda.",
    "It is not for sale.",
    "No está en venta.",
    "売り物ではない。"
  ],
  [
    "Você recusou. A notícia vazou e o paddock passou a olhar para a equipe de outro jeito.",
    "You refused. The news leaked and the paddock saw the team differently.",
    "Rechazaste. La noticia se filtró y el paddock empezó a mirar al equipo de otra forma.",
    "拒否した。話が漏れ、パドックはチームを違う目で見るようになった。"
  ],
  [
    "Uma oferta pelo seu piloto",
    "An offer for your driver",
    "Una oferta por tu piloto",
    "所属ドライバーへのオファー"
  ],
  [
    "A {equipe} oferece {0} para tirar {piloto} do contrato no fim do ano. Ele sabe da proposta.",
    "{equipe} offers {0} to buy {piloto} out of the contract at year end. He knows about it.",
    "{equipe} ofrece {0} para liberar a {piloto} a final de año. Él conoce la oferta.",
    "{equipe}が年末に{piloto}の契約を解除するため{0}を提示。本人も知っている。"
  ],
  [
    "Vender o passe",
    "Sell his contract",
    "Vender sus derechos",
    "契約を売却"
  ],
  [
    "O dinheiro entra; a vaga abre na pré-temporada.",
    "The money comes in; the seat opens in pre-season.",
    "Entra el dinero; el asiento se libera en pretemporada.",
    "資金が入り、プレシーズンにシートが空く。"
  ],
  [
    "{piloto} corre com vocês até o fim do ano e depois vai para a {equipe}.",
    "{piloto} races for you until year end, then joins {equipe}.",
    "{piloto} corre con vosotros hasta final de año y después se va a {equipe}.",
    "{piloto}は年末まで走り、その後{equipe}へ移籍する。"
  ],
  [
    "Ele fica. Feliz ou não.",
    "He stays. Happy or not.",
    "Se queda. Contento o no.",
    "満足しているかどうかに関係なく、残る。"
  ],
  [
    "{piloto} gostou de ser segurado. Sentiu-se valorizado.",
    "{piloto} liked being kept. He felt valued.",
    "A {piloto} le gustó que lo retuvieran. Se sintió valorado.",
    "{piloto}は引き留められ、評価されたと感じた。"
  ],
  [
    "{piloto} queria ir. O resto do ano vai ser longo.",
    "{piloto} wanted to leave. The rest of the year will be long.",
    "{piloto} quería irse. El resto del año será largo.",
    "{piloto}は移籍を望んでいた。長い残りシーズンになりそうだ。"
  ],
  [
    "FISA contra FOCA",
    "FISA versus FOCA",
    "FISA contra FOCA",
    "FISA対FOCA"
  ],
  [
    "A guerra entre a federação e a associação dos construtores chegou ao seu motorhome. As equipes inglesas ameaçam boicotar a próxima corrida. De que lado a sua equipe fica?",
    "The war between the federation and constructors' association reaches your motorhome. British teams threaten to boycott the next race. Which side will you take?",
    "La guerra entre la federación y los constructores llegó a tu motorhome. Los equipos británicos amenazan con boicotear la próxima carrera. ¿De qué lado está tu equipo?",
    "連盟とコンストラクター協会の対立がモーターホームにも届いた。英国勢は次戦のボイコットを示唆。あなたはどちらに付く？"
  ],
  [
    "Com os construtores",
    "With the constructors",
    "Con los constructores",
    "コンストラクター側"
  ],
  [
    "O dinheiro da televisão está do lado deles.",
    "They have the television money.",
    "El dinero de la televisión está de su lado.",
    "テレビ放映権の資金は彼らの側にある。"
  ],
  [
    "Multa por não comparecer. E a corrida aconteceu sem você.",
    "A fine for not attending. The race went ahead without you.",
    "Multa por no presentarse. La carrera se disputó sin ti.",
    "欠場の罰金。レースはあなた抜きで開催された。"
  ],
  [
    "O bloco dos construtores ganhou. A sua equipe tem lugar na mesa em que o dinheiro é dividido.",
    "The constructors won. Your team has a seat at the table where money is shared.",
    "Ganó el bloque de constructores. Tu equipo tiene sitio en la mesa donde se reparte el dinero.",
    "コンストラクター側が勝利。資金配分の交渉卓にあなたのチームの席がある。"
  ],
  [
    "Com a federação",
    "With the federation",
    "Con la federación",
    "連盟側"
  ],
  [
    "Quem faz a regra lembra de quem ficou do lado dela.",
    "The rule makers remember who stood with them.",
    "Quien hace las reglas recuerda quién lo apoyó.",
    "規則を作る側は、味方した相手を覚えている。"
  ],
  [
    "A federação lembrou. A próxima mudança de regra não te pegou de surpresa.",
    "The federation remembered. The next rule change did not catch you unprepared.",
    "La federación lo recordó. El próximo cambio de reglas no te pilló por sorpresa.",
    "連盟は覚えていた。次の規則変更に不意を突かれずに済んだ。"
  ],
  [
    "As outras equipes te trataram como traidor por meses.",
    "The other teams treated you as a traitor for months.",
    "Los demás equipos te trataron como traidor durante meses.",
    "他チームは数か月にわたり裏切り者として扱った。"
  ],
  [
    "Acidente no pit stop",
    "Pit stop accident",
    "Accidente en el pit stop",
    "ピットストップ中の事故"
  ],
  [
    "Um mecânico foi atingido durante o pit stop. Nada grave, mas as imagens correram o mundo e a federação quer explicações.",
    "A mechanic was hit during the pit stop. Nothing serious, but the images went worldwide and the federation wants answers.",
    "Un mecánico fue golpeado durante el pit stop. Nada grave, pero las imágenes recorrieron el mundo y la federación exige explicaciones.",
    "ピット作業中にメカニックが接触を受けた。軽傷だが映像は世界に広まり、連盟が説明を求めている。"
  ],
  [
    "Investir em segurança",
    "Invest in safety",
    "Invertir en seguridad",
    "安全に投資"
  ],
  [
    "Treino, equipamento, procedimento novo.",
    "Training, equipment, a new procedure.",
    "Formación, equipamiento y un procedimiento nuevo.",
    "訓練、装備、新しい手順。"
  ],
  [
    "Procedimento novo, equipamento novo. Os mecânicos notaram.",
    "New procedure, new equipment. The mechanics noticed.",
    "Procedimiento nuevo, equipo nuevo. Los mecánicos lo notaron.",
    "手順も装備も一新。メカニックは気づいている。"
  ],
  [
    "Culpar o mecânico",
    "Blame the mechanic",
    "Culpar al mecánico",
    "メカニックの責任にする"
  ],
  [
    "Resolve a imprensa. Não resolve o box.",
    "It satisfies the press, not the garage.",
    "Resuelve la prensa, no el garaje.",
    "メディアへの対応にはなるが、ガレージの問題は解決しない。"
  ],
  [
    "A federação aceitou a explicação.",
    "The federation accepted the explanation.",
    "La federación aceptó la explicación.",
    "連盟は説明を受け入れた。"
  ],
  [
    "O box inteiro ficou do lado do colega. O clima azedou.",
    "The whole garage stood by their colleague. The atmosphere soured.",
    "Todo el garaje apoyó al compañero. El ambiente empeoró.",
    "ガレージ全員が仲間を支持。雰囲気は悪化した。"
  ],
  [
    "A fábrica adiantou o pacote aerodinâmico. Funciona no túnel; ninguém sabe se funciona na pista.",
    "The factory brought the aero package forward. It works in the tunnel; nobody knows if it works on track.",
    "La fábrica adelantó el paquete aerodinámico. Funciona en el túnel; nadie sabe si funcionará en pista.",
    "工場が空力パッケージを前倒しした。風洞では機能するが、実走ではまだ不明。"
  ],
  [
    "Cigarros",
    "Tobacco",
    "Tabaco",
    "たばこ"
  ],
  [
    "Petróleo",
    "Oil",
    "Petróleo",
    "石油"
  ],
  [
    "Indústria",
    "Industry",
    "Industria",
    "工業"
  ],
  [
    "Bebidas",
    "Beverages",
    "Bebidas",
    "飲料"
  ],
  [
    "Telecomunicações",
    "Telecommunications",
    "Telecomunicaciones",
    "通信"
  ],
  [
    "Relógios",
    "Watches",
    "Relojes",
    "腕時計"
  ],
  [
    "Luxo",
    "Luxury",
    "Lujo",
    "高級品"
  ],
  [
    "Aviação",
    "Aviation",
    "Aviación",
    "航空"
  ],
  [
    "Turismo de governo",
    "Government tourism promotion",
    "Promoción turística pública",
    "政府観光事業"
  ],
  [
    "Criptomoedas",
    "Cryptocurrency",
    "Criptomonedas",
    "暗号資産"
  ],
  [
    "Varejo",
    "Retail",
    "Comercio minorista",
    "小売"
  ],
  [
    "Logística",
    "Logistics",
    "Logística",
    "物流"
  ],
  [
    "Energia",
    "Energy",
    "Energía",
    "エネルギー"
  ],
  [
    "motores de 1,5 litro",
    "1.5-litre engines",
    "motores de 1,5 litros",
    "1.5リッターエンジン"
  ],
  [
    "motores de 3 litros",
    "3-litre engines",
    "motores de 3 litros",
    "3リッターエンジン"
  ],
  [
    "fundo plano, fim do efeito solo",
    "flat floor, end of ground effect",
    "fondo plano, fin del efecto suelo",
    "フラットフロア、グラウンドエフェクトの終了"
  ],
  [
    "fim do turbo",
    "end of turbo engines",
    "fin del turbo",
    "ターボの終了"
  ],
  [
    "motores de 3 litros e menos aerodinâmica",
    "3-litre engines and reduced aerodynamics",
    "motores de 3 litros y menos aerodinámica",
    "3リッターエンジンと空力削減"
  ],
  [
    "carros estreitos e pneus com sulcos",
    "narrower cars and grooved tyres",
    "coches estrechos y neumáticos rayados",
    "狭いマシンと溝付きタイヤ"
  ],
  [
    "aerodinâmica simplificada, KERS e pneus lisos",
    "simplified aerodynamics, KERS and slick tyres",
    "aerodinámica simplificada, KERS y neumáticos lisos",
    "空力簡素化、KERS、スリックタイヤ"
  ],
  [
    "motores híbridos turbo",
    "turbo hybrid engines",
    "motores híbridos turbo",
    "ハイブリッドターボエンジン"
  ],
  [
    "carros largos e mais pressão aerodinâmica",
    "wider cars and more downforce",
    "coches más anchos y más carga aerodinámica",
    "幅広マシンとダウンフォース増加"
  ],
  [
    "volta do efeito solo",
    "return of ground effect",
    "regreso del efecto suelo",
    "グラウンドエフェクトの復活"
  ],
  [
    "motor meio elétrico e aerodinâmica ativa",
    "half-electric powertrain and active aerodynamics",
    "motor parcialmente eléctrico y aerodinámica activa",
    "動力の半分を電気で賄い、アクティブ空力を導入"
  ],
  [
    "Academia {equipe}",
    "{equipe} Academy",
    "Academia {equipe}",
    "{equipe}アカデミー"
  ],
  [
    "Categorias de base",
    "Junior series",
    "Categorías inferiores",
    "育成カテゴリー"
  ],
  [
    "Carro {0}",
    "Car {0}",
    "Coche {0}",
    "マシン{0}"
  ],
  [
    "{0}V {1}P",
    "{0}W {1}P",
    "{0}V {1}P",
    "{0}勝・表彰台{1}回"
  ],
  [
    "etapa {0}",
    "round {0}",
    "etapa {0}",
    "第{0}戦"
  ],
  [
    "{0} · circuito {1} · {2} · etapa {3} de {4}",
    "{0} · {1} circuit · {2} · round {3} of {4}",
    "{0} · circuito {1} · {2} · etapa {3} de {4}",
    "{0} · {1}コース · {2} · 全{4}戦中の第{3}戦"
  ],
  [
    "{nome} no carro de {piloto}",
    "{nome} in {piloto}'s car",
    "{nome} en el coche de {piloto}",
    "{piloto}のマシンで{nome}が走行"
  ],
  [
    "Dobradinha. {piloto} na frente, {rival} logo atrás. O tipo de domingo que paga uma pré-temporada inteira.",
    "A one-two. {piloto} leads, {rival} right behind. A Sunday that repays a whole pre-season.",
    "Doblete. {piloto} delante, {rival} justo detrás. Un domingo que compensa toda una pretemporada.",
    "ワンツー。{piloto}が先頭、{rival}がすぐ後ろ。プレシーズンの努力が報われる日曜日。"
  ],
  [
    "{piloto} venceu debaixo de chuva. O outro carro não chegou, mas ninguém vai lembrar disso.",
    "{piloto} won in the rain. The other car did not finish, but nobody will remember that.",
    "{piloto} ganó bajo la lluvia. El otro coche no terminó, pero nadie lo recordará.",
    "{piloto}が雨の中で優勝。もう1台は完走しなかったが、そのことは忘れられるだろう。"
  ],
  [
    "{piloto} venceu. O outro carro não chegou, mas ninguém vai lembrar disso.",
    "{piloto} won. The other car did not finish, but nobody will remember that.",
    "{piloto} ganó. El otro coche no terminó, pero nadie lo recordará.",
    "{piloto}が優勝。もう1台は完走しなかったが、そのことは忘れられるだろう。"
  ],
  [
    "{piloto} venceu debaixo de chuva. A fábrica vai trabalhar sorrindo amanhã.",
    "{piloto} won in the rain. The factory will be smiling tomorrow.",
    "{piloto} ganó bajo la lluvia. La fábrica trabajará sonriendo mañana.",
    "{piloto}が雨の中で優勝。明日の工場は笑顔に包まれる。"
  ],
  [
    "{piloto} venceu. A fábrica vai trabalhar sorrindo amanhã.",
    "{piloto} won. The factory will be smiling tomorrow.",
    "{piloto} ganó. La fábrica trabajará sonriendo mañana.",
    "{piloto}が優勝。明日の工場は笑顔に包まれる。"
  ],
  [
    "Pódio com {piloto} em {0}.",
    "A podium with {piloto} in {0}.",
    "Podio con {piloto} en {0}.",
    "{piloto}が{0}で表彰台。"
  ],
  [
    "Pódio com {piloto} em {0}. {rival} terminou em {1}.",
    "A podium with {piloto} in {0}. {rival} finished {1}.",
    "Podio con {piloto} en {0}. {rival} terminó {1}.",
    "{piloto}が{0}で表彰台。{rival}は{1}でフィニッシュ。"
  ],
  [
    "Os dois carros fora. Um domingo que custa pontos, dinheiro de reparo e a paciência de quem assina os cheques.",
    "Both cars out. A Sunday that costs points, repair money and the patience of those signing the cheques.",
    "Los dos coches fuera. Un domingo que cuesta puntos, reparaciones y la paciencia de quienes firman los cheques.",
    "両マシンがリタイア。ポイント、修理費、資金を出す人の忍耐を失う日曜日。"
  ],
  [
    "{piloto} em {0}. Pontos na conta.",
    "{piloto} in {0}. Points in the bank.",
    "{piloto} en {0}. Puntos sumados.",
    "{piloto}が{0}。ポイント獲得。"
  ],
  [
    "{piloto} em {0}, {rival} em {1}. Pontos na conta.",
    "{piloto} in {0}, {rival} in {1}. Points in the bank.",
    "{piloto} en {0}, {rival} en {1}. Puntos sumados.",
    "{piloto}が{0}、{rival}が{1}。ポイント獲得。"
  ],
  [
    "{piloto} chegou em {0}. Sem pontos.",
    "{piloto} finished {0}. No points.",
    "{piloto} terminó {0}. Sin puntos.",
    "{piloto}は{0}でフィニッシュ。得点なし。"
  ],
  [
    "{piloto} chegou em {0} e {rival} em {1}. Sem pontos.",
    "{piloto} finished {0} and {rival} {1}. No points.",
    "{piloto} terminó {0} y {rival} {1}. Sin puntos.",
    "{piloto}は{0}、{rival}は{1}。得点なし。"
  ],
  [
    "Um domingo para esquecer.",
    "A Sunday to forget.",
    "Un domingo para olvidar.",
    "忘れたい日曜日。"
  ],
  [
    "{0} · {1} · etapa {2} de {3}",
    "{0} · {1} · round {2} of {3}",
    "{0} · {1} · etapa {2} de {3}",
    "{0} · {1} · 全{3}戦中の第{2}戦"
  ],
  [
    "{piloto} não resistiu aos ferimentos.",
    "{piloto} died from the injuries.",
    "{piloto} falleció por sus heridas.",
    "{piloto}が負傷により亡くなった。"
  ],
  [
    "{piloto} está machucado: {0} corrida(s) fora.",
    "{piloto} is injured: out for {0} race(s).",
    "{piloto} está lesionado: {0} carrera(s) fuera.",
    "{piloto}が負傷し、{0}戦を欠場。"
  ],
  [
    "Ajuste",
    "Adjustment",
    "Ajuste",
    "調整"
  ],
  [
    "Pacote",
    "Package",
    "Paquete",
    "パッケージ"
  ],
  [
    "Resgate",
    "Bailout",
    "Rescate",
    "救済"
  ],
  [
    "Demitido",
    "Fired",
    "Despedido",
    "解任"
  ],
  [
    "Decidido",
    "Decided",
    "Decidido",
    "決定"
  ],
  [
    "Subiu",
    "Moved up",
    "Ascendió",
    "昇格"
  ],
  [
    "Sociedade",
    "Partnership",
    "Sociedad",
    "出資提携"
  ],
  [
    "Assinado",
    "Signed",
    "Firmado",
    "契約成立"
  ],
  [
    "Contraproposta",
    "Counter-offer",
    "Contraoferta",
    "対案"
  ],
  [
    "Recusou",
    "Declined",
    "Rechazó",
    "拒否"
  ],
  [
    "Contratado",
    "Hired",
    "Contratado",
    "採用"
  ],
  [
    "Aceitou",
    "Accepted",
    "Aceptó",
    "承諾"
  ],
  [
    "Desistiram",
    "Withdrew",
    "Desistieron",
    "撤退"
  ],
  [
    "€ {0} por ano",
    "€ {0} a year",
    "€ {0} al año",
    "年額€{0}"
  ],
  [
    "pede {0} por ano",
    "asks for {0} a year",
    "pide {0} al año",
    "年額{0}を要求"
  ],
  [
    "pede {0}",
    "asks for {0}",
    "pide {0}",
    "{0}を要求"
  ],
  [
    "traz {0} e pede {1}",
    "brings {0} and asks for {1}",
    "aporta {0} y pide {1}",
    "{0}を持ち込み、{1}を要求"
  ],
  [
    "traz {0}",
    "brings {0}",
    "aporta {0}",
    "持込資金{0}"
  ],
  [
    "e pede {0}",
    "and asks for {0}",
    "y pide {0}",
    "要求額{0}"
  ],
  [
    "{0} ano(s)",
    "{0} year(s)",
    "{0} año(s)",
    "{0}年"
  ],
  [
    "{0} anos · leitura {1}–{2} · pede {3} por ano",
    "Age {0} · estimated rating {1}–{2} · asks for {3} a year",
    "{0} años · estimación {1}–{2} · pide {3} al año",
    "{0}歳 · 推定{1}〜{2} · 年額{3}を要求"
  ],
  [
    "· {0} anos · leitura {1}–{2} · pede {3} por ano",
    "· age {0} · estimated rating {1}–{2} · asks for {3} a year",
    "· {0} años · estimación {1}–{2} · pide {3} al año",
    "· {0}歳 · 推定{1}〜{2} · 年額{3}を要求"
  ],
  [
    "{0} anos · leitura {1}–{2} · traz {3} e pede {4}",
    "Age {0} · estimated rating {1}–{2} · brings {3} and asks for {4}",
    "{0} años · estimación {1}–{2} · aporta {3} y pide {4}",
    "{0}歳 · 推定{1}〜{2} · 持込{3}、要求{4}"
  ],
  [
    "· {0} anos · leitura {1}–{2} · traz {3} e pede {4}",
    "· age {0} · estimated rating {1}–{2} · brings {3} and asks for {4}",
    "· {0} años · estimación {1}–{2} · aporta {3} y pide {4}",
    "· {0}歳 · 推定{1}〜{2} · 持込{3}、要求{4}"
  ],
  [
    "{0} anos · leitura {1}–{2} · traz {3}",
    "Age {0} · estimated rating {1}–{2} · brings {3}",
    "{0} años · estimación {1}–{2} · aporta {3}",
    "{0}歳 · 推定{1}〜{2} · 持込{3}"
  ],
  [
    "· {0} anos · leitura {1}–{2} · traz {3}",
    "· age {0} · estimated rating {1}–{2} · brings {3}",
    "· {0} años · estimación {1}–{2} · aporta {3}",
    "· {0}歳 · 推定{1}〜{2} · 持込{3}"
  ],
  [
    "F2 e F3",
    "F2 and F3",
    "F2 y F3",
    "F2・F3"
  ],
  [
    "do Endurance",
    "from Endurance",
    "de Endurance",
    "耐久レース出身"
  ],
  [
    "da {cat}",
    "from {cat}",
    "de {cat}",
    "{cat}出身"
  ],
  [
    "do {cat}",
    "from {cat}",
    "de {cat}",
    "{cat}出身"
  ],
  [
    "Piloto real {0}.",
    "Real driver {0}.",
    "Piloto real {0}.",
    "実在のドライバー、{0}。"
  ],
  [
    "Piloto real {0}, na categoria desde {1}.",
    "Real driver {0}, in the series since {1}.",
    "Piloto real {0}, en la categoría desde {1}.",
    "実在のドライバー、{0}。{1}年から参戦。"
  ],
  [
    "Piloto real {0}, hoje na {equipe}.",
    "Real driver {0}, currently at {equipe}.",
    "Piloto real {0}, actualmente en {equipe}.",
    "実在のドライバー、{0}。現在は{equipe}所属。"
  ],
  [
    "Piloto real {0}, na categoria desde {1}, hoje na {equipe}.",
    "Real driver {0}, in the series since {1}, currently at {equipe}.",
    "Piloto real {0}, en la categoría desde {1}, actualmente en {equipe}.",
    "実在のドライバー、{0}。{1}年から参戦し、現在は{equipe}所属。"
  ],
  [
    "Depois de {0} a carreira dele é projeção do jogo.",
    "After {0}, his career is a game projection.",
    "Después de {0}, su carrera es una proyección del juego.",
    "{0}年以降のキャリアはゲームによる予測です。"
  ],
  [
    "A conversão usa quem correu nas duas categorias na mesma época, pelo lado conservador: um piloto {0} vale uns {1} pontos a menos na Fórmula 1.",
    "The conversion conservatively uses drivers who raced in both series in the same era: a driver {0} rates about {1} points lower in Formula 1.",
    "La conversión usa de forma conservadora a quienes corrieron en ambas categorías en la misma época: un piloto {0} vale unos {1} puntos menos en Fórmula 1.",
    "換算は同時期に両カテゴリーを走った選手を保守的に比較。{0}の選手はF1では約{1}ポイント低い評価になる。"
  ],
  [
    "A inscrição, a fábrica maior e o primeiro carro de verdade. A Fórmula 1 exige estrutura. Os garotos da base vão ter de provar que servem para o grid — ou dar lugar a quem sirva.",
    "Entry fees, a larger factory and the first proper car. Formula 1 demands infrastructure. The junior drivers must prove they belong or make room for others.",
    "La inscripción, una fábrica mayor y el primer coche de verdad. La Fórmula 1 exige infraestructura. Los jóvenes deben demostrar que sirven o dejar sitio.",
    "参戦料、大きな工場、初めての本格マシン。F1には設備が必要。若手は実力を示すか、席を譲ることになる。"
  ],
  [
    "A inscrição, a fábrica maior e o primeiro carro de verdade. A Fórmula 1 exige estrutura, e a federação decide quem entra. Os garotos da base vão ter de provar que servem para o grid — ou dar lugar a quem sirva.",
    "Entry fees, a larger factory and the first proper car. Formula 1 demands infrastructure, and the federation decides who gets in. Junior drivers must prove they belong or make room.",
    "La inscripción, una fábrica mayor y el primer coche de verdad. La Fórmula 1 exige infraestructura y la federación decide quién entra. Los jóvenes deben demostrar que sirven o dejar sitio.",
    "参戦料、大きな工場、初めての本格マシン。F1には設備が必要で、参戦の可否は連盟が決める。若手は実力を示すか、席を譲ることになる。"
  ],
  [
    "Carreira com registro real até onde os dados vão; daí em diante, simulada.",
    "A career based on real records as far as the data goes, then simulated.",
    "Carrera con registros reales hasta donde llegan los datos; después, simulada.",
    "データがある範囲は実際の記録、それ以降はシミュレーション。"
  ],
  [
    "Piloto real. A carreira na categoria principal segue os registros.",
    "Real driver. The top-level career follows recorded history.",
    "Piloto real. Su carrera en la categoría principal sigue los registros.",
    "実在のドライバー。トップカテゴリーの経歴は記録に従う。"
  ],
  [
    "Piloto criado pelo jogo: trajetória, nível e futuro são projeção.",
    "Game-generated driver: career, rating and future are projections.",
    "Piloto creado por el juego: trayectoria, nivel y futuro son proyecciones.",
    "ゲーム生成のドライバー。経歴、実力、将来は予測によるもの。"
  ],
  [
    "Parou de correr",
    "Retired from racing",
    "Dejó de correr",
    "引退"
  ],
  [
    "Parou de correr em {0}",
    "Retired from racing in {0}",
    "Dejó de correr en {0}",
    "{0}年に引退"
  ],
  [
    "Sem vaga no momento",
    "Currently without a seat",
    "Actualmente sin asiento",
    "現在シートなし"
  ],
  [
    "— diz {0}",
    "— says {0}",
    "— dice {0}",
    "— {0}の話"
  ],
  [
    "— diz {0}, que {1}",
    "— says {0}, who {1}",
    "— dice {0}, que {1}",
    "— {1}という{0}の話"
  ],
  [
    "Arquivo de temporadas",
    "Season archive",
    "Archivo de temporadas",
    "シーズンアーカイブ"
  ],
  [
    "Créditos",
    "Credits",
    "Créditos",
    "クレジット"
  ],
  [
    "De onde vem o que aparece no jogo",
    "Sources of the game's content",
    "De dónde procede el contenido del juego",
    "ゲーム内コンテンツの出典"
  ],
  [
    "Fotos",
    "Photos",
    "Fotos",
    "写真"
  ],
  [
    "(todas reais; nenhuma gerada por IA):",
    "(all real; none AI-generated):",
    "(todas reales; ninguna generada por IA):",
    "（すべて実写、AI生成なし）："
  ],
  [
    "Traçados das pistas:",
    "Circuit layouts:",
    "Trazados de los circuitos:",
    "コース形状："
  ],
  [
    "bacinger/f1-circuits, licença MIT.",
    "bacinger/f1-circuits, MIT licence.",
    "bacinger/f1-circuits, licencia MIT.",
    "bacinger/f1-circuits、MITライセンス。"
  ],
  [
    "Tipografia:",
    "Typography:",
    "Tipografía:",
    "書体："
  ],
  [
    "Archivo, de Omnibus-Type, licença SIL Open Font.",
    "Archivo by Omnibus-Type, SIL Open Font License.",
    "Archivo, de Omnibus-Type, licencia SIL Open Font.",
    "Omnibus-TypeのArchivo、SIL Open Font License。"
  ],
  [
    "Projeto de fã, sem qualquer vínculo com os campeonatos, a FIA ou as equipes. As fotos mostram o mundo real das corridas e não indicam apoio de ninguém ao jogo. Resultados, contratos e balanços do jogo são simulação.",
    "A fan project unaffiliated with the championships, FIA or teams. Photos show real racing and imply no endorsement. Game results, contracts and financial reports are simulated.",
    "Proyecto de aficionados sin vínculo con los campeonatos, la FIA o los equipos. Las fotos muestran carreras reales y no implican apoyo al juego. Resultados, contratos y balances son simulados.",
    "選手権、FIA、チームとは無関係のファン制作です。写真は実際のレースを示し、ゲームへの支持を意味しません。成績、契約、決算はシミュレーションです。"
  ],
  [
    "Carlos Sainz em Zandvoort, 2024",
    "Carlos Sainz at Zandvoort, 2024",
    "Carlos Sainz en Zandvoort, 2024",
    "2024年ZandvoortのCarlos Sainz"
  ],
  [
    "Alberto Ascari em Zandvoort, 1953",
    "Alberto Ascari at Zandvoort, 1953",
    "Alberto Ascari en Zandvoort, 1953",
    "1953年ZandvoortのAlberto Ascari"
  ],
  [
    "Harry Pot / Anefo, Arquivo Nacional da Holanda",
    "Harry Pot / Anefo, National Archives of the Netherlands",
    "Harry Pot / Anefo, Archivo Nacional de los Países Bajos",
    "Harry Pot / Anefo、オランダ国立公文書館"
  ],
  [
    "domínio público (CC0)",
    "public domain (CC0)",
    "dominio público (CC0)",
    "パブリックドメイン（CC0）"
  ],
  [
    "Jackie Stewart em Zandvoort, 1968",
    "Jackie Stewart at Zandvoort, 1968",
    "Jackie Stewart en Zandvoort, 1968",
    "1968年ZandvoortのJackie Stewart"
  ],
  [
    "Niki Lauda e Jean-Pierre Jarier em Zandvoort, 1975",
    "Niki Lauda and Jean-Pierre Jarier at Zandvoort, 1975",
    "Niki Lauda y Jean-Pierre Jarier en Zandvoort, 1975",
    "1975年ZandvoortのNiki LaudaとJean-Pierre Jarier"
  ],
  [
    "Ayrton Senna no Lotus 97T, 1985",
    "Ayrton Senna in the Lotus 97T, 1985",
    "Ayrton Senna en el Lotus 97T, 1985",
    "1985年Lotus 97TのAyrton Senna"
  ],
  [
    "Alain Prost em Phoenix, 1990",
    "Alain Prost at Phoenix, 1990",
    "Alain Prost en Phoenix, 1990",
    "1990年PhoenixのAlain Prost"
  ],
  [
    "Michael Schumacher em Silverstone, 2004",
    "Michael Schumacher at Silverstone, 2004",
    "Michael Schumacher en Silverstone, 2004",
    "2004年SilverstoneのMichael Schumacher"
  ],
  [
    "Lewis Hamilton em Silverstone, 2016",
    "Lewis Hamilton at Silverstone, 2016",
    "Lewis Hamilton en Silverstone, 2016",
    "2016年SilverstoneのLewis Hamilton"
  ],
  [
    "Max Verstappen no Red Bull Ring, 2023",
    "Max Verstappen at the Red Bull Ring, 2023",
    "Max Verstappen en el Red Bull Ring, 2023",
    "2023年Red Bull RingのMax Verstappen"
  ],
  [
    "Andrew e Alan Frost",
    "Andrew and Alan Frost",
    "Andrew y Alan Frost",
    "AndrewとAlan Frost"
  ],
  [
    "Capacete no cockpit",
    "Helmet in the cockpit",
    "Casco en el cockpit",
    "コックピットのヘルメット"
  ],
  [
    "licença Unsplash",
    "Unsplash licence",
    "licencia Unsplash",
    "Unsplashライセンス"
  ],
  [
    "Pit stop da Emil Frey Racing",
    "Emil Frey Racing pit stop",
    "Pit stop de Emil Frey Racing",
    "Emil Frey Racingのピットストップ"
  ],
  [
    "O primeiro Grand Prix, França, 1906 (filme)",
    "The first Grand Prix, France, 1906 (film)",
    "El primer Grand Prix, Francia, 1906 (película)",
    "最初のグランプリ、1906年フランス（映像）"
  ],
  [
    "domínio público, via Wikimedia Commons",
    "public domain, via Wikimedia Commons",
    "dominio público, vía Wikimedia Commons",
    "パブリックドメイン、Wikimedia Commons経由"
  ],
  [
    "CC BY-SA 4.0, via Wikimedia Commons",
    "CC BY-SA 4.0, via Wikimedia Commons",
    "CC BY-SA 4.0, vía Wikimedia Commons",
    "CC BY-SA 4.0、Wikimedia Commons経由"
  ],
  [
    "CC BY 2.0, via Wikimedia Commons",
    "CC BY 2.0, via Wikimedia Commons",
    "CC BY 2.0, vía Wikimedia Commons",
    "CC BY 2.0、Wikimedia Commons経由"
  ],
  [
    "CC BY-SA 2.0, via Wikimedia Commons",
    "CC BY-SA 2.0, via Wikimedia Commons",
    "CC BY-SA 2.0, vía Wikimedia Commons",
    "CC BY-SA 2.0、Wikimedia Commons経由"
  ],
  [
    "Em {0}: {1} na {cat} ({equipe}).",
    "In {0}: {1} in {cat} ({equipe}).",
    "En {0}: {1} en {cat} ({equipe}).",
    "{0}年：{cat}で{1}（{equipe}）。"
  ],
  [
    "Em {0}: {1} na {cat}.",
    "In {0}: {1} in {cat}.",
    "En {0}: {1} en {cat}.",
    "{0}年：{cat}で{1}。"
  ],
  [
    "Em {0}: correu na {cat} ({equipe}).",
    "In {0}: raced in {cat} ({equipe}).",
    "En {0}: corrió en {cat} ({equipe}).",
    "{0}年：{cat}に参戦（{equipe}）。"
  ],
  [
    "Em {0}: correu na {cat}.",
    "In {0}: raced in {cat}.",
    "En {0}: corrió en {cat}.",
    "{0}年：{cat}に参戦。"
  ],
  [
    "Dispensar ({0})",
    "Release ({0})",
    "Rescindir ({0})",
    "契約解除（{0}）"
  ],
  [
    "REP",
    "REP",
    "REP",
    "評判"
  ],
  [
    "do grid de {0}. A diretoria espera o {pos} lugar nos construtores. Com o regulamento novo, todo mundo ainda está aprendendo.",
    "on the {0}-car grid. Management expects {pos} place in the constructors’ championship. With the new regulations, everyone is still learning.",
    "de una parrilla de {0} coches. La directiva espera el {pos} puesto en constructores. Con el nuevo reglamento, todos siguen aprendiendo.",
    "、全{0}台のグリッド。経営陣はコンストラクター{pos}を期待している。新レギュレーションのもと、全員がまだ学んでいる。"
  ],
  [
    "do grid de {0}. A diretoria espera o {pos} lugar nos construtores.",
    "on the {0}-car grid. Management expects {pos} place in the constructors’ championship.",
    "de una parrilla de {0} coches. La directiva espera el {pos} puesto en constructores.",
    "、全{0}台のグリッド。経営陣はコンストラクター{pos}を期待している。"
  ],
  [
    "do grid de {0}. Com o regulamento novo, todo mundo ainda está aprendendo.",
    "on the {0}-car grid. With the new regulations, everyone is still learning.",
    "de una parrilla de {0} coches. Con el nuevo reglamento, todos siguen aprendiendo.",
    "、全{0}台のグリッド。新レギュレーションのもと、全員がまだ学んでいる。"
  ],
  [
    "A diretoria espera o {pos} lugar nos construtores.",
    "Management expects {pos} place in the constructors’ championship.",
    "La directiva espera el {pos} puesto en constructores.",
    "経営陣はコンストラクター{pos}を期待している。"
  ],
  [
    "Com o regulamento novo, todo mundo ainda está aprendendo.",
    "With the new regulations, everyone is still learning.",
    "Con el nuevo reglamento, todos siguen aprendiendo.",
    "新レギュレーションのもと、全員がまだ学んでいる。"
  ],
  [
    "{piloto} assina com a {equipe} por {0} anos. Troca a {cat} pela Fórmula 1.",
    "{piloto} signs with {equipe} for {0} years. Leaves {cat} for Formula 1.",
    "{piloto} firma con {equipe} por {0} años. Cambia {cat} por la Fórmula 1.",
    "{piloto}が{equipe}と{0}年契約。{cat}からF1へ転向。"
  ],
  [
    "{piloto} assina com a {equipe} por {0} anos. Troca o {cat} pela Fórmula 1.",
    "{piloto} signs with {equipe} for {0} years. Leaves {cat} for Formula 1.",
    "{piloto} firma con {equipe} por {0} años. Cambia {cat} por la Fórmula 1.",
    "{piloto}が{equipe}と{0}年契約。{cat}からF1へ転向。"
  ],
  [
    "{piloto} assina com a {equipe} por {0} anos. Sobe direto da {cat}.",
    "{piloto} signs with {equipe} for {0} years. Moves straight up from {cat}.",
    "{piloto} firma con {equipe} por {0} años. Sube directamente desde {cat}.",
    "{piloto}が{equipe}と{0}年契約。{cat}から直接昇格。"
  ],
  [
    "{piloto} assina com a {equipe} por {0} anos. Sobe direto do {cat}.",
    "{piloto} signs with {equipe} for {0} years. Moves straight up from {cat}.",
    "{piloto} firma con {equipe} por {0} años. Sube directamente desde {cat}.",
    "{piloto}が{equipe}と{0}年契約。{cat}から直接昇格。"
  ],
  [
    "{piloto} assina com a {equipe} por um ano. Troca a {cat} pela Fórmula 1.",
    "{piloto} signs with {equipe} for one year. Leaves {cat} for Formula 1.",
    "{piloto} firma con {equipe} por un año. Cambia {cat} por la Fórmula 1.",
    "{piloto}が{equipe}と1年契約。{cat}からF1へ転向。"
  ],
  [
    "{piloto} assina com a {equipe} por um ano. Troca o {cat} pela Fórmula 1.",
    "{piloto} signs with {equipe} for one year. Leaves {cat} for Formula 1.",
    "{piloto} firma con {equipe} por un año. Cambia {cat} por la Fórmula 1.",
    "{piloto}が{equipe}と1年契約。{cat}からF1へ転向。"
  ],
  [
    "{piloto} assina com a {equipe} por um ano. Sobe direto da {cat}.",
    "{piloto} signs with {equipe} for one year. Moves straight up from {cat}.",
    "{piloto} firma con {equipe} por un año. Sube directamente desde {cat}.",
    "{piloto}が{equipe}と1年契約。{cat}から直接昇格。"
  ],
  [
    "{piloto} assina com a {equipe} por um ano. Sobe direto do {cat}.",
    "{piloto} signs with {equipe} for one year. Moves straight up from {cat}.",
    "{piloto} firma con {equipe} por un año. Sube directamente desde {cat}.",
    "{piloto}が{equipe}と1年契約。{cat}から直接昇格。"
  ],
  [
    "Um fundo americano",
    "An American fund",
    "Un fondo estadounidense",
    "米国のファンド"
  ],
  [
    "Uma montadora alemã",
    "A German car manufacturer",
    "Un fabricante alemán de automóviles",
    "ドイツの自動車メーカー"
  ],
  [
    "Um bilionário do Golfo",
    "A Gulf billionaire",
    "Un multimillonario del Golfo",
    "湾岸諸国の大富豪"
  ],
  [
    "Uma marca de bebida energética",
    "An energy drink brand",
    "Una marca de bebidas energéticas",
    "エナジードリンクブランド"
  ],
  [
    "um comprador",
    "a buyer",
    "un comprador",
    "買い手"
  ],
  [
    "Simular",
    "Simulate",
    "Simular",
    "シミュレート"
  ],
  [
    "Logos das categorias:",
    "Championship logos:",
    "Logotipos de los campeonatos:",
    "選手権のロゴ："
  ],
  [
    "Fórmula 1, IndyCar, NASCAR, FIA WEC, Stock Car, DTM e Fórmula E, via Wikimedia Commons, em domínio público por serem logos de texto. São marcas registradas dos seus titulares e aparecem só para identificar cada campeonato.",
    "Formula 1, IndyCar, NASCAR, FIA WEC, Stock Car, DTM and Formula E, via Wikimedia Commons, in the public domain as text logos. These are trademarks of their respective owners, used solely to identify each championship.",
    "Fórmula 1, IndyCar, NASCAR, FIA WEC, Stock Car, DTM y Fórmula E, a través de Wikimedia Commons, en dominio público por ser logotipos de texto. Son marcas registradas de sus respectivos titulares y aparecen solo para identificar cada campeonato.",
    "F1、IndyCar、NASCAR、FIA WEC、Stock Car、DTM、Formula E。Wikimedia Commonsより。文字のみのロゴのためパブリックドメイン。各権利者の登録商標であり、選手権を識別する目的でのみ表示。"
  ],
  [
    "{nome}: {0} — cumprido, bônus de {1}",
    "{nome}: {0} — achieved, bonus of {1}",
    "{nome}: {0} — cumplido, bonificación de {1}",
    "{nome}：{0} — 達成、ボーナス{1}"
  ],
  [
    "{nome}: {0} — não cumprido, contrato reduzido",
    "{nome}: {0} — missed, contract value reduced",
    "{nome}: {0} — incumplido, contrato reducido",
    "{nome}：{0} — 未達、契約金を減額"
  ],
  [
    "{nome}: deu calote e rompeu",
    "{nome}: defaulted and terminated the contract",
    "{nome}: dejó de pagar y rescindió el contrato",
    "{nome}：支払いを停止し契約を解除"
  ],
  [
    "{piloto}: {pos} na {cat}",
    "{piloto}: {pos} in {cat}",
    "{piloto}: {pos} en {cat}",
    "{piloto}：{cat}で{pos}"
  ],
  [
    "A meta era {0} e a equipe terminou em {1}. Confiança em {2}% ({3}).",
    "The target was {0} and the team finished {1}. Confidence is at {2}% ({3}).",
    "El objetivo era el {0} puesto y el equipo terminó {1}. La confianza está en el {2}% ({3}).",
    "目標は{0}、結果は{1}。経営陣の信頼は{2}%（{3}）。"
  ],
  [
    "A meta era {0} e a equipe terminou em {1}. Confiança em {2}% ({3}). É o último aviso.",
    "The target was {0} and the team finished {1}. Confidence is at {2}% ({3}). This is your final warning.",
    "El objetivo era el {0} puesto y el equipo terminó {1}. La confianza está en el {2}% ({3}). Es el último aviso.",
    "目標は{0}、結果は{1}。経営陣の信頼は{2}%（{3}）。最後の警告だ。"
  ],
  [
    "A meta era {0} e a equipe terminou em {1}. Confiança em {2}% ({3}). Não há mais clima para você no cargo.",
    "The target was {0} and the team finished {1}. Confidence is at {2}% ({3}). You can no longer stay in the role.",
    "El objetivo era el {0} puesto y el equipo terminó {1}. La confianza está en el {2}% ({3}). Ya no puedes seguir en el cargo.",
    "目標は{0}、結果は{1}。経営陣の信頼は{2}%（{3}）。これ以上、役職に留まることはできない。"
  ],
  [
    "— {0}, domínio público (CC0)",
    "— {0}, public domain (CC0)",
    "— {0}, dominio público (CC0)",
    "— {0}、パブリックドメイン（CC0）"
  ],
  [
    "— {0}, licença Unsplash",
    "— {0}, Unsplash License",
    "— {0}, licencia de Unsplash",
    "— {0}、Unsplashライセンス"
  ],
  [
    "— {0}, domínio público, via Wikimedia Commons",
    "— {0}, public domain, via Wikimedia Commons",
    "— {0}, dominio público, a través de Wikimedia Commons",
    "— {0}、パブリックドメイン、Wikimedia Commonsより"
  ]
];
  /* Trechos que também aparecem sozinhos em nós de texto ou combinados
     com notícias de outro catálogo. Não dependem do parágrafo completo. */
  rows.push(
    ["Carro do ano que vem: {0}", "Next year's car: {0}", "Coche del año que viene: {0}", "来季のマシン：{0}"],
    ["O dinheiro define até onde cada área pode chegar; a engenharia e as instalações decidem quanto disso vira ritmo.", "The budget sets each area's potential; engineering and facilities determine how much becomes performance.", "El presupuesto marca el potencial de cada área; la ingeniería y las instalaciones determinan cuánto se convierte en rendimiento.", "予算は各部門の可能性を決め、技術力と設備がそれをどこまで速さに変えられるかを決める。"],
    ["Nada chega de uma vez, e quem para de gastar fica para trás devagar.", "Progress takes time, and teams that stop investing gradually fall behind.", "El progreso lleva tiempo, y los equipos que dejan de invertir se van quedando atrás.", "進歩には時間がかかる。投資を止めたチームは徐々に遅れを取る。"],
    ["Falta: dois pilotos titulares com contrato e um fornecedor de motor", "Needed: two contracted race drivers and an engine supplier", "Faltan: dos pilotos titulares con contrato y un proveedor de motores", "必要：契約済みのレギュラードライバー2人とエンジン供給元"],
    ["Falta dois pilotos titulares com contrato e um fornecedor de motor.", "You need two contracted race drivers and an engine supplier.", "Necesitas dos pilotos titulares con contrato y un proveedor de motores.", "契約済みのレギュラードライバー2人とエンジン供給元が必要。"],
    ["A dívida foi paga.", "The debt has been paid.", "La deuda está pagada.", "借金は返済された。"],
    ["Você agora tem {0}% da {equipe}.", "You now own {0}% of {equipe}.", "Ahora tienes el {0}% de {equipe}.", "現在、あなたは{equipe}の{0}%を保有している。"],
    ["O outro carro não chegou, mas ninguém vai lembrar disso.", "The other car did not finish, but nobody will remember that.", "El otro coche no terminó, pero nadie se acordará de eso.", "もう1台は完走できなかったが、それを覚えている人はいないだろう。"],
    ["A fábrica vai trabalhar sorrindo amanhã.", "Everyone at the factory will be smiling tomorrow.", "Mañana se trabajará con una sonrisa en la fábrica.", "明日の工場は笑顔で仕事に取り組めるだろう。"],
    ["{piloto} terminou em {pos}.", "{piloto} finished {pos}.", "{piloto} terminó {pos}.", "{piloto}は{pos}でフィニッシュ。"],
    ["{piloto} venceu debaixo de chuva.", "{piloto} won in the rain.", "{piloto} ganó bajo la lluvia.", "{piloto}が雨のレースを制した。"],
    ["{piloto} venceu.", "{piloto} won.", "{piloto} ganó.", "{piloto}が優勝。"],
    ["Imprevisto do fim de semana", "Weekend incident", "Imprevisto del fin de semana", "週末の予期せぬ出来事"],
    ["O que funciona no túnel nem sempre funciona na pista.", "What works in the wind tunnel does not always work on track.", "Lo que funciona en el túnel de viento no siempre funciona en pista.", "風洞で機能しても、サーキットで機能するとは限らない。"],
    ["Um pacote pode render mais do que o prometido, pode não mudar nada — ou pode deixar o carro pior.", "An upgrade can deliver more than promised, change nothing, or make the car worse.", "Una mejora puede rendir más de lo prometido, no cambiar nada o empeorar el coche.", "改良は期待以上の効果を生むことも、何も変えないことも、マシンを悪化させることもある。"],
    ["A reunião foi curta.", "The meeting was brief.", "La reunión fue breve.", "会議は短かった。"],
    ["A meta era {0} e a equipe terminou em {1}.", "The target was {0} and the team finished {1}.", "El objetivo era el {0} puesto y el equipo terminó {1}.", "目標は{0}、チームの結果は{1}だった。"],
    ["Confiança em {0}% ({1}).", "Confidence is at {0}% ({1}).", "La confianza está en el {0}% ({1}).", "信頼は{0}%（{1}）。"],
    ["O dinheiro do ano", "The year's finances", "Las finanzas del año", "年間収支"],
    ["· prêmio de {0}", "· prize money of {0}", "· premio de {0}", "・賞金{0}"],
    ["Três parcelas anuais, juros de 9% ao ano.", "Three annual instalments, with 9% annual interest.", "Tres cuotas anuales, con un interés del 9% anual.", "年利9%、年払い3回。"],
    ["A primeira vence no começo da próxima temporada.", "The first payment is due at the start of next season.", "La primera vence al comienzo de la próxima temporada.", "初回の支払期限は来季の開幕時。"],
    ["Contrato até {0}.", "Contract until {0}.", "Contrato hasta {0}.", "契約は{0}年まで。"],
    ["{piloto} aceitou na hora.", "{piloto} accepted immediately.", "{piloto} aceptó en el acto.", "{piloto}が即座に承諾した。"],
    ["{piloto} aceitou.", "{piloto} accepted.", "{piloto} aceptó.", "{piloto}が承諾した。"],
    ["Mais investimento abre vagas (3, 4, 6 ou 8 garotos), faz os garotos evoluírem mais rápido e deixa os olheiros mais certeiros.", "More investment creates places for 3, 4, 6 or 8 young drivers, speeds up their development and makes scouting more accurate.", "Una mayor inversión abre plazas para 3, 4, 6 u 8 jóvenes, acelera su desarrollo y hace más precisas las evaluaciones de los ojeadores.", "投資を増やすと育成枠が3人、4人、6人、8人と増え、成長が速まり、スカウトの評価も正確になる。"],
    ["um carro titular", "a race seat", "un asiento titular", "レギュラーシート"],
    ["o posto de reserva", "the reserve role", "el puesto de reserva", "リザーブの役割"],
    ["{piloto} sobe da academia para um carro titular.", "{piloto} is promoted from the academy to a race seat.", "{piloto} asciende de la academia a un asiento titular.", "{piloto}がアカデミーからレギュラーに昇格。"],
    ["{piloto} sobe da academia para o posto de reserva.", "{piloto} is promoted from the academy to the reserve role.", "{piloto} asciende de la academia al puesto de reserva.", "{piloto}がアカデミーからリザーブに昇格。"],
    ["A inscrição, a fábrica maior e o primeiro carro de verdade.", "The entry fee, a bigger factory and your first proper car.", "La inscripción, una fábrica más grande y el primer coche de verdad.", "参戦料、大きな工場、初めての本格マシン。"],
    ["A Fórmula 1 exige estrutura.", "Formula 1 requires proper facilities.", "La Fórmula 1 exige infraestructura.", "F1には十分な設備が必要。"],
    ["A Fórmula 1 exige estrutura, e a federação decide quem entra.", "Formula 1 requires proper facilities, and the federation decides who gets in.", "La Fórmula 1 exige infraestructura, y la federación decide quién entra.", "F1には十分な設備が必要で、参戦の可否は連盟が決める。"],
    ["Os garotos da base vão ter de provar que servem para o grid — ou dar lugar a quem sirva.", "Your young drivers must prove they belong on the grid or make way for those who do.", "Los jóvenes tendrán que demostrar que están a la altura de la parrilla o dejar su sitio a quien lo esté.", "若手はグリッドにふさわしい実力を示すか、実力のある選手に席を譲ることになる。"],
    ["Um investidor paga a dívida e fica com {0}% da equipe.", "An investor pays the debt in exchange for {0}% of the team.", "Un inversor paga la deuda a cambio del {0}% del equipo.", "投資家が借金を返済する代わりにチームの{0}%を取得する。"],
    ["Paga a inscrição e põe mais {0} no caixa, em troca de {1}% da equipe.", "Pays the entry fee and adds {0} to the budget in exchange for {1}% of the team.", "Paga la inscripción y aporta {0} a la caja a cambio del {1}% del equipo.", "参戦料を払い、さらに{0}を拠出する代わりに、チームの{1}%を取得する。"],
    ["Entra com {0} em troca de {1}% da equipe.", "Invests {0} in exchange for {1}% of the team.", "Aporta {0} a cambio del {1}% del equipo.", "{0}を出資する代わりにチームの{1}%を取得する。"],
    ["Saiu da sua equipe direto para o grid.", "Went straight from your team to the grid.", "Pasó directamente de tu equipo a la parrilla.", "あなたのチームから直接グリッド入りを果たした。"],
    ["O dinheiro entra corrida a corrida.", "The money comes in race by race.", "El dinero entra carrera a carrera.", "資金はレースごとに入る。"],
    ["{piloto} é o novo piloto reserva.", "{piloto} is the new reserve driver.", "{piloto} es el nuevo piloto reserva.", "{piloto}が新リザーブドライバーに就任。"],
    ["O motor de {piloto} acusou um problema: {0}.", "{piloto}'s engine showed a problem: {0}.", "El motor de {piloto} mostró un problema: {0}.", "{piloto}のエンジンに問題発生：{0}。"],
    ["A peça nova chegou antes: {0}.", "The new part arrived early: {0}.", "La pieza nueva llegó antes: {0}.", "新パーツが早く到着：{0}。"],
    ["O radar mudou: frente fria chegando: {0}.", "The radar changed: a cold front is approaching: {0}.", "El radar cambió: se acerca un frente frío: {0}.", "レーダーが変化、寒冷前線が接近：{0}。"],
    ["Calor de 38 graus: {0}.", "38-degree heat: {0}.", "Calor de 38 grados: {0}.", "気温38度の暑さ：{0}。"],
    ["Os comissários chamaram {piloto}: {0}.", "The stewards summoned {piloto}: {0}.", "Los comisarios llamaron a {piloto}: {0}.", "スチュワードが{piloto}を召喚：{0}。"],
    ["O patrocinador quer {piloto} num evento: {0}.", "The sponsor wants {piloto} at an event: {0}.", "El patrocinador quiere a {piloto} en un evento: {0}.", "スポンサーがイベントに{piloto}を求めている：{0}。"],
    ["{piloto} acordou com febre: {0}.", "{piloto} woke up with a fever: {0}.", "{piloto} se despertó con fiebre: {0}.", "{piloto}が発熱：{0}。"],
    ["{0} por ano traz {1}", "{0} per year, brings {1}", "{0} al año y aporta {1}", "年俸{0}、持参資金{1}"]
  );
  for(const [lang,column] of [["en",1],["es",2],["ja",3]]) window.VDO_LOCALES[lang].pairs.push(...rows.map(row=>[row[0],row[column]]));
})();
