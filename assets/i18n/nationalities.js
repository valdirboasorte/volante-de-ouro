/* Gentilícios e referências à origem do piloto. */
(function(){
  const rows = [
  [
    "sul-africano",
    "South African",
    "sudafricano"
  ],
  [
    "SUL-AFRICANO",
    "SOUTH AFRICAN",
    "SUDAFRICANO"
  ],
  [
    "um sul-africano",
    "a South African driver",
    "un sudafricano"
  ],
  [
    "Poucos sul-africanos",
    "Few South African drivers",
    "Pocos sudafricanos"
  ],
  [
    "sul-africana",
    "South African",
    "sudafricana"
  ],
  [
    "SUL-AFRICANA",
    "SOUTH AFRICAN",
    "SUDAFRICANA"
  ],
  [
    "uma sul-africana",
    "a South African driver",
    "una sudafricana"
  ],
  [
    "Poucas sul-africanas",
    "Few South African drivers",
    "Pocas sudafricanas"
  ],
  [
    "a África do Sul",
    "South Africa",
    "Sudáfrica"
  ],
  [
    "alemão",
    "German",
    "alemán"
  ],
  [
    "ALEMÃO",
    "GERMAN",
    "ALEMÁN"
  ],
  [
    "Poucos alemães",
    "Few German drivers",
    "Pocos alemanes"
  ],
  [
    "alemã",
    "German",
    "alemana"
  ],
  [
    "ALEMÃ",
    "GERMAN",
    "ALEMANA"
  ],
  [
    "uma alemã",
    "a German driver",
    "una alemana"
  ],
  [
    "Poucas alemãs",
    "Few German drivers",
    "Pocas alemanas"
  ],
  [
    "a Alemanha",
    "Germany",
    "Alemania"
  ],
  [
    "angolano",
    "Angolan",
    "angoleño"
  ],
  [
    "ANGOLANO",
    "ANGOLAN",
    "ANGOLEÑO"
  ],
  [
    "um angolano",
    "an Angolan driver",
    "un angoleño"
  ],
  [
    "Poucos angolanos",
    "Few Angolan drivers",
    "Pocos angoleños"
  ],
  [
    "angolana",
    "Angolan",
    "angoleña"
  ],
  [
    "ANGOLANA",
    "ANGOLAN",
    "ANGOLEÑA"
  ],
  [
    "uma angolana",
    "an Angolan driver",
    "una angoleña"
  ],
  [
    "Poucas angolanas",
    "Few Angolan drivers",
    "Pocas angoleñas"
  ],
  [
    "saudita",
    "Saudi",
    "saudí"
  ],
  [
    "SAUDITA",
    "SAUDI",
    "SAUDÍ"
  ],
  [
    "um saudita",
    "a Saudi driver",
    "un saudí"
  ],
  [
    "Poucos sauditas",
    "Few Saudi drivers",
    "Pocos saudíes"
  ],
  [
    "uma saudita",
    "a Saudi driver",
    "una saudí"
  ],
  [
    "Poucas sauditas",
    "Few Saudi drivers",
    "Pocas saudíes"
  ],
  [
    "a Arábia Saudita",
    "Saudi Arabia",
    "Arabia Saudí"
  ],
  [
    "ARGENTINO",
    "ARGENTINE",
    "ARGENTINO"
  ],
  [
    "Poucos argentinos",
    "Few Argentine drivers",
    "Pocos argentinos"
  ],
  [
    "argentina",
    "Argentine",
    "argentina"
  ],
  [
    "ARGENTINA",
    "ARGENTINE",
    "ARGENTINA"
  ],
  [
    "Poucas argentinas",
    "Few Argentine drivers",
    "Pocas argentinas"
  ],
  [
    "a Argentina",
    "Argentina",
    "Argentina"
  ],
  [
    "armênio",
    "Armenian",
    "armenio"
  ],
  [
    "ARMÊNIO",
    "ARMENIAN",
    "ARMENIO"
  ],
  [
    "um armênio",
    "an Armenian driver",
    "un armenio"
  ],
  [
    "Poucos armênios",
    "Few Armenian drivers",
    "Pocos armenios"
  ],
  [
    "armênia",
    "Armenian",
    "armenia"
  ],
  [
    "ARMÊNIA",
    "ARMENIAN",
    "ARMENIA"
  ],
  [
    "uma armênia",
    "an Armenian driver",
    "una armenia"
  ],
  [
    "Poucas armênias",
    "Few Armenian drivers",
    "Pocas armenias"
  ],
  [
    "a Armênia",
    "Armenia",
    "Armenia"
  ],
  [
    "australiano",
    "Australian",
    "australiano"
  ],
  [
    "AUSTRALIANO",
    "AUSTRALIAN",
    "AUSTRALIANO"
  ],
  [
    "Poucos australianos",
    "Few Australian drivers",
    "Pocos australianos"
  ],
  [
    "australiana",
    "Australian",
    "australiana"
  ],
  [
    "AUSTRALIANA",
    "AUSTRALIAN",
    "AUSTRALIANA"
  ],
  [
    "uma australiana",
    "an Australian driver",
    "una australiana"
  ],
  [
    "Poucas australianas",
    "Few Australian drivers",
    "Pocas australianas"
  ],
  [
    "a Austrália",
    "Australia",
    "Australia"
  ],
  [
    "austríaco",
    "Austrian",
    "austríaco"
  ],
  [
    "AUSTRÍACO",
    "AUSTRIAN",
    "AUSTRÍACO"
  ],
  [
    "um austríaco",
    "an Austrian driver",
    "un austríaco"
  ],
  [
    "Poucos austríacos",
    "Few Austrian drivers",
    "Pocos austríacos"
  ],
  [
    "austríaca",
    "Austrian",
    "austríaca"
  ],
  [
    "AUSTRÍACA",
    "AUSTRIAN",
    "AUSTRÍACA"
  ],
  [
    "uma austríaca",
    "an Austrian driver",
    "una austríaca"
  ],
  [
    "Poucas austríacas",
    "Few Austrian drivers",
    "Pocas austríacas"
  ],
  [
    "a Áustria",
    "Austria",
    "Austria"
  ],
  [
    "azerbaijano",
    "Azerbaijani",
    "azerbaiyano"
  ],
  [
    "AZERBAIJANO",
    "AZERBAIJANI",
    "AZERBAIYANO"
  ],
  [
    "um azerbaijano",
    "an Azerbaijani driver",
    "un azerbaiyano"
  ],
  [
    "Poucos azerbaijanos",
    "Few Azerbaijani drivers",
    "Pocos azerbaiyanos"
  ],
  [
    "azerbaijana",
    "Azerbaijani",
    "azerbaiyana"
  ],
  [
    "AZERBAIJANA",
    "AZERBAIJANI",
    "AZERBAIYANA"
  ],
  [
    "uma azerbaijana",
    "an Azerbaijani driver",
    "una azerbaiyana"
  ],
  [
    "Poucas azerbaijanas",
    "Few Azerbaijani drivers",
    "Pocas azerbaiyanas"
  ],
  [
    "o Azerbaijão",
    "Azerbaijan",
    "Azerbaiyán"
  ],
  [
    "bareinita",
    "Bahraini",
    "bareiní"
  ],
  [
    "BAREINITA",
    "BAHRAINI",
    "BAREINÍ"
  ],
  [
    "um bareinita",
    "a Bahraini driver",
    "un bareiní"
  ],
  [
    "Poucos bareinitas",
    "Few Bahraini drivers",
    "Pocos bareiníes"
  ],
  [
    "uma bareinita",
    "a Bahraini driver",
    "una bareiní"
  ],
  [
    "Poucas bareinitas",
    "Few Bahraini drivers",
    "Pocas bareiníes"
  ],
  [
    "o Bahrein",
    "Bahrain",
    "Baréin"
  ],
  [
    "belga",
    "Belgian",
    "belga"
  ],
  [
    "BELGA",
    "BELGIAN",
    "BELGA"
  ],
  [
    "um belga",
    "a Belgian driver",
    "un belga"
  ],
  [
    "Poucos belgas",
    "Few Belgian drivers",
    "Pocos belgas"
  ],
  [
    "uma belga",
    "a Belgian driver",
    "una belga"
  ],
  [
    "Poucas belgas",
    "Few Belgian drivers",
    "Pocas belgas"
  ],
  [
    "a Bélgica",
    "Belgium",
    "Bélgica"
  ],
  [
    "boliviano",
    "Bolivian",
    "boliviano"
  ],
  [
    "BOLIVIANO",
    "BOLIVIAN",
    "BOLIVIANO"
  ],
  [
    "um boliviano",
    "a Bolivian driver",
    "un boliviano"
  ],
  [
    "Poucos bolivianos",
    "Few Bolivian drivers",
    "Pocos bolivianos"
  ],
  [
    "boliviana",
    "Bolivian",
    "boliviana"
  ],
  [
    "BOLIVIANA",
    "BOLIVIAN",
    "BOLIVIANA"
  ],
  [
    "uma boliviana",
    "a Bolivian driver",
    "una boliviana"
  ],
  [
    "Poucas bolivianas",
    "Few Bolivian drivers",
    "Pocas bolivianas"
  ],
  [
    "a Bolívia",
    "Bolivia",
    "Bolivia"
  ],
  [
    "BRASILEIRO",
    "BRAZILIAN",
    "BRASILEÑO"
  ],
  [
    "Poucos brasileiros",
    "Few Brazilian drivers",
    "Pocos brasileños"
  ],
  [
    "brasileira",
    "Brazilian",
    "brasileña"
  ],
  [
    "BRASILEIRA",
    "BRAZILIAN",
    "BRASILEÑA"
  ],
  [
    "Poucas brasileiras",
    "Few Brazilian drivers",
    "Pocas brasileñas"
  ],
  [
    "o Brasil",
    "Brazil",
    "Brasil"
  ],
  [
    "búlgaro",
    "Bulgarian",
    "búlgaro"
  ],
  [
    "BÚLGARO",
    "BULGARIAN",
    "BÚLGARO"
  ],
  [
    "um búlgaro",
    "a Bulgarian driver",
    "un búlgaro"
  ],
  [
    "Poucos búlgaros",
    "Few Bulgarian drivers",
    "Pocos búlgaros"
  ],
  [
    "búlgara",
    "Bulgarian",
    "búlgara"
  ],
  [
    "BÚLGARA",
    "BULGARIAN",
    "BÚLGARA"
  ],
  [
    "uma búlgara",
    "a Bulgarian driver",
    "una búlgara"
  ],
  [
    "Poucas búlgaras",
    "Few Bulgarian drivers",
    "Pocas búlgaras"
  ],
  [
    "a Bulgária",
    "Bulgaria",
    "Bulgaria"
  ],
  [
    "cabo-verdiano",
    "Cape Verdean",
    "caboverdiano"
  ],
  [
    "CABO-VERDIANO",
    "CAPE VERDEAN",
    "CABOVERDIANO"
  ],
  [
    "um cabo-verdiano",
    "a Cape Verdean driver",
    "un caboverdiano"
  ],
  [
    "Poucos cabo-verdianos",
    "Few Cape Verdean drivers",
    "Pocos caboverdianos"
  ],
  [
    "cabo-verdiana",
    "Cape Verdean",
    "caboverdiana"
  ],
  [
    "CABO-VERDIANA",
    "CAPE VERDEAN",
    "CABOVERDIANA"
  ],
  [
    "uma cabo-verdiana",
    "a Cape Verdean driver",
    "una caboverdiana"
  ],
  [
    "Poucas cabo-verdianas",
    "Few Cape Verdean drivers",
    "Pocas caboverdianas"
  ],
  [
    "camaronês",
    "Cameroonian",
    "camerunés"
  ],
  [
    "CAMARONÊS",
    "CAMEROONIAN",
    "CAMERUNÉS"
  ],
  [
    "um camaronês",
    "a Cameroonian driver",
    "un camerunés"
  ],
  [
    "Poucos camaroneses",
    "Few Cameroonian drivers",
    "Pocos cameruneses"
  ],
  [
    "camaronesa",
    "Cameroonian",
    "camerunesa"
  ],
  [
    "CAMARONESA",
    "CAMEROONIAN",
    "CAMERUNESA"
  ],
  [
    "uma camaronesa",
    "a Cameroonian driver",
    "una camerunesa"
  ],
  [
    "Poucas camaronesas",
    "Few Cameroonian drivers",
    "Pocas camerunesas"
  ],
  [
    "os Camarões",
    "Cameroon",
    "Camerún"
  ],
  [
    "canadense",
    "Canadian",
    "canadiense"
  ],
  [
    "CANADENSE",
    "CANADIAN",
    "CANADIENSE"
  ],
  [
    "um canadense",
    "a Canadian driver",
    "un canadiense"
  ],
  [
    "Poucos canadenses",
    "Few Canadian drivers",
    "Pocos canadienses"
  ],
  [
    "uma canadense",
    "a Canadian driver",
    "una canadiense"
  ],
  [
    "Poucas canadenses",
    "Few Canadian drivers",
    "Pocas canadienses"
  ],
  [
    "o Canadá",
    "Canada",
    "Canadá"
  ],
  [
    "cazaque",
    "Kazakh",
    "kazajo"
  ],
  [
    "CAZAQUE",
    "KAZAKH",
    "KAZAJO"
  ],
  [
    "um cazaque",
    "a Kazakh driver",
    "un kazajo"
  ],
  [
    "Poucos cazaques",
    "Few Kazakh drivers",
    "Pocos kazajos"
  ],
  [
    "uma cazaque",
    "a Kazakh driver",
    "una kazaja"
  ],
  [
    "Poucas cazaques",
    "Few Kazakh drivers",
    "Pocas kazajas"
  ],
  [
    "o Cazaquistão",
    "Kazakhstan",
    "Kazajistán"
  ],
  [
    "chileno",
    "Chilean",
    "chileno"
  ],
  [
    "CHILENO",
    "CHILEAN",
    "CHILENO"
  ],
  [
    "um chileno",
    "a Chilean driver",
    "un chileno"
  ],
  [
    "Poucos chilenos",
    "Few Chilean drivers",
    "Pocos chilenos"
  ],
  [
    "chilena",
    "Chilean",
    "chilena"
  ],
  [
    "CHILENA",
    "CHILEAN",
    "CHILENA"
  ],
  [
    "uma chilena",
    "a Chilean driver",
    "una chilena"
  ],
  [
    "Poucas chilenas",
    "Few Chilean drivers",
    "Pocas chilenas"
  ],
  [
    "o Chile",
    "Chile",
    "Chile"
  ],
  [
    "chinês",
    "Chinese",
    "chino"
  ],
  [
    "CHINÊS",
    "CHINESE",
    "CHINO"
  ],
  [
    "um chinês",
    "a Chinese driver",
    "un chino"
  ],
  [
    "Poucos chineses",
    "Few Chinese drivers",
    "Pocos chinos"
  ],
  [
    "chinesa",
    "Chinese",
    "china"
  ],
  [
    "CHINESA",
    "CHINESE",
    "CHINA"
  ],
  [
    "uma chinesa",
    "a Chinese driver",
    "una china"
  ],
  [
    "Poucas chinesas",
    "Few Chinese drivers",
    "Pocas chinas"
  ],
  [
    "a China",
    "China",
    "China"
  ],
  [
    "cipriota",
    "Cypriot",
    "chipriota"
  ],
  [
    "CIPRIOTA",
    "CYPRIOT",
    "CHIPRIOTA"
  ],
  [
    "um cipriota",
    "a Cypriot driver",
    "un chipriota"
  ],
  [
    "Poucos cipriotas",
    "Few Cypriot drivers",
    "Pocos chipriotas"
  ],
  [
    "uma cipriota",
    "a Cypriot driver",
    "una chipriota"
  ],
  [
    "Poucas cipriotas",
    "Few Cypriot drivers",
    "Pocas chipriotas"
  ],
  [
    "o Chipre",
    "Cyprus",
    "Chipre"
  ],
  [
    "colombiano",
    "Colombian",
    "colombiano"
  ],
  [
    "COLOMBIANO",
    "COLOMBIAN",
    "COLOMBIANO"
  ],
  [
    "um colombiano",
    "a Colombian driver",
    "un colombiano"
  ],
  [
    "Poucos colombianos",
    "Few Colombian drivers",
    "Pocos colombianos"
  ],
  [
    "colombiana",
    "Colombian",
    "colombiana"
  ],
  [
    "COLOMBIANA",
    "COLOMBIAN",
    "COLOMBIANA"
  ],
  [
    "uma colombiana",
    "a Colombian driver",
    "una colombiana"
  ],
  [
    "Poucas colombianas",
    "Few Colombian drivers",
    "Pocas colombianas"
  ],
  [
    "a Colômbia",
    "Colombia",
    "Colombia"
  ],
  [
    "sul-coreano",
    "South Korean",
    "surcoreano"
  ],
  [
    "SUL-COREANO",
    "SOUTH KOREAN",
    "SURCOREANO"
  ],
  [
    "um sul-coreano",
    "a South Korean driver",
    "un surcoreano"
  ],
  [
    "Poucos sul-coreanos",
    "Few South Korean drivers",
    "Pocos surcoreanos"
  ],
  [
    "sul-coreana",
    "South Korean",
    "surcoreana"
  ],
  [
    "SUL-COREANA",
    "SOUTH KOREAN",
    "SURCOREANA"
  ],
  [
    "uma sul-coreana",
    "a South Korean driver",
    "una surcoreana"
  ],
  [
    "Poucas sul-coreanas",
    "Few South Korean drivers",
    "Pocas surcoreanas"
  ],
  [
    "a Coreia do Sul",
    "South Korea",
    "Corea del Sur"
  ],
  [
    "costarriquenho",
    "Costa Rican",
    "costarricense"
  ],
  [
    "COSTARRIQUENHO",
    "COSTA RICAN",
    "COSTARRICENSE"
  ],
  [
    "um costarriquenho",
    "a Costa Rican driver",
    "un costarricense"
  ],
  [
    "Poucos costarriquenhos",
    "Few Costa Rican drivers",
    "Pocos costarricenses"
  ],
  [
    "costarriquenha",
    "Costa Rican",
    "costarricense"
  ],
  [
    "COSTARRIQUENHA",
    "COSTA RICAN",
    "COSTARRICENSE"
  ],
  [
    "uma costarriquenha",
    "a Costa Rican driver",
    "una costarricense"
  ],
  [
    "Poucas costarriquenhas",
    "Few Costa Rican drivers",
    "Pocas costarricenses"
  ],
  [
    "a Costa Rica",
    "Costa Rica",
    "Costa Rica"
  ],
  [
    "croata",
    "Croatian",
    "croata"
  ],
  [
    "CROATA",
    "CROATIAN",
    "CROATA"
  ],
  [
    "um croata",
    "a Croatian driver",
    "un croata"
  ],
  [
    "Poucos croatas",
    "Few Croatian drivers",
    "Pocos croatas"
  ],
  [
    "uma croata",
    "a Croatian driver",
    "una croata"
  ],
  [
    "Poucas croatas",
    "Few Croatian drivers",
    "Pocas croatas"
  ],
  [
    "a Croácia",
    "Croatia",
    "Croacia"
  ],
  [
    "cubano",
    "Cuban",
    "cubano"
  ],
  [
    "CUBANO",
    "CUBAN",
    "CUBANO"
  ],
  [
    "um cubano",
    "a Cuban driver",
    "un cubano"
  ],
  [
    "Poucos cubanos",
    "Few Cuban drivers",
    "Pocos cubanos"
  ],
  [
    "cubana",
    "Cuban",
    "cubana"
  ],
  [
    "CUBANA",
    "CUBAN",
    "CUBANA"
  ],
  [
    "uma cubana",
    "a Cuban driver",
    "una cubana"
  ],
  [
    "Poucas cubanas",
    "Few Cuban drivers",
    "Pocas cubanas"
  ],
  [
    "dinamarquês",
    "Danish",
    "danés"
  ],
  [
    "DINAMARQUÊS",
    "DANISH",
    "DANÉS"
  ],
  [
    "um dinamarquês",
    "a Danish driver",
    "un danés"
  ],
  [
    "Poucos dinamarqueses",
    "Few Danish drivers",
    "Pocos daneses"
  ],
  [
    "dinamarquesa",
    "Danish",
    "danesa"
  ],
  [
    "DINAMARQUESA",
    "DANISH",
    "DANESA"
  ],
  [
    "uma dinamarquesa",
    "a Danish driver",
    "una danesa"
  ],
  [
    "Poucas dinamarquesas",
    "Few Danish drivers",
    "Pocas danesas"
  ],
  [
    "a Dinamarca",
    "Denmark",
    "Dinamarca"
  ],
  [
    "egípcio",
    "Egyptian",
    "egipcio"
  ],
  [
    "EGÍPCIO",
    "EGYPTIAN",
    "EGIPCIO"
  ],
  [
    "um egípcio",
    "an Egyptian driver",
    "un egipcio"
  ],
  [
    "Poucos egípcios",
    "Few Egyptian drivers",
    "Pocos egipcios"
  ],
  [
    "egípcia",
    "Egyptian",
    "egipcia"
  ],
  [
    "EGÍPCIA",
    "EGYPTIAN",
    "EGIPCIA"
  ],
  [
    "uma egípcia",
    "an Egyptian driver",
    "una egipcia"
  ],
  [
    "Poucas egípcias",
    "Few Egyptian drivers",
    "Pocas egipcias"
  ],
  [
    "o Egito",
    "Egypt",
    "Egipto"
  ],
  [
    "salvadorenho",
    "Salvadoran",
    "salvadoreño"
  ],
  [
    "SALVADORENHO",
    "SALVADORAN",
    "SALVADOREÑO"
  ],
  [
    "um salvadorenho",
    "a Salvadoran driver",
    "un salvadoreño"
  ],
  [
    "Poucos salvadorenhos",
    "Few Salvadoran drivers",
    "Pocos salvadoreños"
  ],
  [
    "salvadorenha",
    "Salvadoran",
    "salvadoreña"
  ],
  [
    "SALVADORENHA",
    "SALVADORAN",
    "SALVADOREÑA"
  ],
  [
    "uma salvadorenha",
    "a Salvadoran driver",
    "una salvadoreña"
  ],
  [
    "Poucas salvadorenhas",
    "Few Salvadoran drivers",
    "Pocas salvadoreñas"
  ],
  [
    "emiradense",
    "Emirati",
    "emiratí"
  ],
  [
    "EMIRADENSE",
    "EMIRATI",
    "EMIRATÍ"
  ],
  [
    "um emiradense",
    "an Emirati driver",
    "un emiratí"
  ],
  [
    "Poucos emiradenses",
    "Few Emirati drivers",
    "Pocos emiratíes"
  ],
  [
    "uma emiradense",
    "an Emirati driver",
    "una emiratí"
  ],
  [
    "Poucas emiradenses",
    "Few Emirati drivers",
    "Pocas emiratíes"
  ],
  [
    "os Emirados Árabes",
    "United Arab Emirates",
    "Emiratos Árabes Unidos"
  ],
  [
    "equatoriano",
    "Ecuadorian",
    "ecuatoriano"
  ],
  [
    "EQUATORIANO",
    "ECUADORIAN",
    "ECUATORIANO"
  ],
  [
    "um equatoriano",
    "an Ecuadorian driver",
    "un ecuatoriano"
  ],
  [
    "Poucos equatorianos",
    "Few Ecuadorian drivers",
    "Pocos ecuatorianos"
  ],
  [
    "equatoriana",
    "Ecuadorian",
    "ecuatoriana"
  ],
  [
    "EQUATORIANA",
    "ECUADORIAN",
    "ECUATORIANA"
  ],
  [
    "uma equatoriana",
    "an Ecuadorian driver",
    "una ecuatoriana"
  ],
  [
    "Poucas equatorianas",
    "Few Ecuadorian drivers",
    "Pocas ecuatorianas"
  ],
  [
    "o Equador",
    "Ecuador",
    "Ecuador"
  ],
  [
    "eslovaco",
    "Slovak",
    "eslovaco"
  ],
  [
    "ESLOVACO",
    "SLOVAK",
    "ESLOVACO"
  ],
  [
    "um eslovaco",
    "a Slovak driver",
    "un eslovaco"
  ],
  [
    "Poucos eslovacos",
    "Few Slovak drivers",
    "Pocos eslovacos"
  ],
  [
    "eslovaca",
    "Slovak",
    "eslovaca"
  ],
  [
    "ESLOVACA",
    "SLOVAK",
    "ESLOVACA"
  ],
  [
    "uma eslovaca",
    "a Slovak driver",
    "una eslovaca"
  ],
  [
    "Poucas eslovacas",
    "Few Slovak drivers",
    "Pocas eslovacas"
  ],
  [
    "a Eslováquia",
    "Slovakia",
    "Eslovaquia"
  ],
  [
    "esloveno",
    "Slovenian",
    "esloveno"
  ],
  [
    "ESLOVENO",
    "SLOVENIAN",
    "ESLOVENO"
  ],
  [
    "um esloveno",
    "a Slovenian driver",
    "un esloveno"
  ],
  [
    "Poucos eslovenos",
    "Few Slovenian drivers",
    "Pocos eslovenos"
  ],
  [
    "eslovena",
    "Slovenian",
    "eslovena"
  ],
  [
    "ESLOVENA",
    "SLOVENIAN",
    "ESLOVENA"
  ],
  [
    "uma eslovena",
    "a Slovenian driver",
    "una eslovena"
  ],
  [
    "Poucas eslovenas",
    "Few Slovenian drivers",
    "Pocas eslovenas"
  ],
  [
    "a Eslovênia",
    "Slovenia",
    "Eslovenia"
  ],
  [
    "espanhol",
    "Spanish",
    "español"
  ],
  [
    "ESPANHOL",
    "SPANISH",
    "ESPAÑOL"
  ],
  [
    "Poucos espanhóis",
    "Few Spanish drivers",
    "Pocos españoles"
  ],
  [
    "espanhola",
    "Spanish",
    "española"
  ],
  [
    "ESPANHOLA",
    "SPANISH",
    "ESPAÑOLA"
  ],
  [
    "uma espanhola",
    "a Spanish driver",
    "una española"
  ],
  [
    "Poucas espanholas",
    "Few Spanish drivers",
    "Pocas españolas"
  ],
  [
    "a Espanha",
    "Spain",
    "España"
  ],
  [
    "estadunidense",
    "American",
    "estadounidense"
  ],
  [
    "ESTADUNIDENSE",
    "AMERICAN",
    "ESTADOUNIDENSE"
  ],
  [
    "um estadunidense",
    "an American driver",
    "un estadounidense"
  ],
  [
    "Poucos estadunidenses",
    "Few American drivers",
    "Pocos estadounidenses"
  ],
  [
    "uma estadunidense",
    "an American driver",
    "una estadounidense"
  ],
  [
    "Poucas estadunidenses",
    "Few American drivers",
    "Pocas estadounidenses"
  ],
  [
    "os Estados Unidos",
    "United States",
    "Estados Unidos"
  ],
  [
    "estoniano",
    "Estonian",
    "estonio"
  ],
  [
    "ESTONIANO",
    "ESTONIAN",
    "ESTONIO"
  ],
  [
    "um estoniano",
    "an Estonian driver",
    "un estonio"
  ],
  [
    "Poucos estonianos",
    "Few Estonian drivers",
    "Pocos estonios"
  ],
  [
    "estoniana",
    "Estonian",
    "estonia"
  ],
  [
    "ESTONIANA",
    "ESTONIAN",
    "ESTONIA"
  ],
  [
    "uma estoniana",
    "an Estonian driver",
    "una estonia"
  ],
  [
    "Poucas estonianas",
    "Few Estonian drivers",
    "Pocas estonias"
  ],
  [
    "a Estônia",
    "Estonia",
    "Estonia"
  ],
  [
    "filipino",
    "Filipino",
    "filipino"
  ],
  [
    "FILIPINO",
    "FILIPINO",
    "FILIPINO"
  ],
  [
    "um filipino",
    "a Filipino driver",
    "un filipino"
  ],
  [
    "Poucos filipinos",
    "Few Filipino drivers",
    "Pocos filipinos"
  ],
  [
    "filipina",
    "Filipino",
    "filipina"
  ],
  [
    "FILIPINA",
    "FILIPINO",
    "FILIPINA"
  ],
  [
    "uma filipina",
    "a Filipino driver",
    "una filipina"
  ],
  [
    "Poucas filipinas",
    "Few Filipino drivers",
    "Pocas filipinas"
  ],
  [
    "as Filipinas",
    "Philippines",
    "Filipinas"
  ],
  [
    "finlandês",
    "Finnish",
    "finlandés"
  ],
  [
    "FINLANDÊS",
    "FINNISH",
    "FINLANDÉS"
  ],
  [
    "um finlandês",
    "a Finnish driver",
    "un finlandés"
  ],
  [
    "Poucos finlandeses",
    "Few Finnish drivers",
    "Pocos finlandeses"
  ],
  [
    "finlandesa",
    "Finnish",
    "finlandesa"
  ],
  [
    "FINLANDESA",
    "FINNISH",
    "FINLANDESA"
  ],
  [
    "uma finlandesa",
    "a Finnish driver",
    "una finlandesa"
  ],
  [
    "Poucas finlandesas",
    "Few Finnish drivers",
    "Pocas finlandesas"
  ],
  [
    "a Finlândia",
    "Finland",
    "Finlandia"
  ],
  [
    "francês",
    "French",
    "francés"
  ],
  [
    "FRANCÊS",
    "FRENCH",
    "FRANCÉS"
  ],
  [
    "Poucos franceses",
    "Few French drivers",
    "Pocos franceses"
  ],
  [
    "francesa",
    "French",
    "francesa"
  ],
  [
    "FRANCESA",
    "FRENCH",
    "FRANCESA"
  ],
  [
    "uma francesa",
    "a French driver",
    "una francesa"
  ],
  [
    "Poucas francesas",
    "Few French drivers",
    "Pocas francesas"
  ],
  [
    "a França",
    "France",
    "Francia"
  ],
  [
    "ganês",
    "Ghanaian",
    "ghanés"
  ],
  [
    "GANÊS",
    "GHANAIAN",
    "GHANÉS"
  ],
  [
    "um ganês",
    "a Ghanaian driver",
    "un ghanés"
  ],
  [
    "Poucos ganeses",
    "Few Ghanaian drivers",
    "Pocos ghaneses"
  ],
  [
    "ganesa",
    "Ghanaian",
    "ghanesa"
  ],
  [
    "GANESA",
    "GHANAIAN",
    "GHANESA"
  ],
  [
    "uma ganesa",
    "a Ghanaian driver",
    "una ghanesa"
  ],
  [
    "Poucas ganesas",
    "Few Ghanaian drivers",
    "Pocas ghanesas"
  ],
  [
    "georgiano",
    "Georgian",
    "georgiano"
  ],
  [
    "GEORGIANO",
    "GEORGIAN",
    "GEORGIANO"
  ],
  [
    "um georgiano",
    "a Georgian driver",
    "un georgiano"
  ],
  [
    "Poucos georgianos",
    "Few Georgian drivers",
    "Pocos georgianos"
  ],
  [
    "georgiana",
    "Georgian",
    "georgiana"
  ],
  [
    "GEORGIANA",
    "GEORGIAN",
    "GEORGIANA"
  ],
  [
    "uma georgiana",
    "a Georgian driver",
    "una georgiana"
  ],
  [
    "Poucas georgianas",
    "Few Georgian drivers",
    "Pocas georgianas"
  ],
  [
    "a Geórgia",
    "Georgia",
    "Georgia"
  ],
  [
    "grego",
    "Greek",
    "griego"
  ],
  [
    "GREGO",
    "GREEK",
    "GRIEGO"
  ],
  [
    "um grego",
    "a Greek driver",
    "un griego"
  ],
  [
    "Poucos gregos",
    "Few Greek drivers",
    "Pocos griegos"
  ],
  [
    "grega",
    "Greek",
    "griega"
  ],
  [
    "GREGA",
    "GREEK",
    "GRIEGA"
  ],
  [
    "uma grega",
    "a Greek driver",
    "una griega"
  ],
  [
    "Poucas gregas",
    "Few Greek drivers",
    "Pocas griegas"
  ],
  [
    "a Grécia",
    "Greece",
    "Grecia"
  ],
  [
    "guatemalteco",
    "Guatemalan",
    "guatemalteco"
  ],
  [
    "GUATEMALTECO",
    "GUATEMALAN",
    "GUATEMALTECO"
  ],
  [
    "um guatemalteco",
    "a Guatemalan driver",
    "un guatemalteco"
  ],
  [
    "Poucos guatemaltecos",
    "Few Guatemalan drivers",
    "Pocos guatemaltecos"
  ],
  [
    "guatemalteca",
    "Guatemalan",
    "guatemalteca"
  ],
  [
    "GUATEMALTECA",
    "GUATEMALAN",
    "GUATEMALTECA"
  ],
  [
    "uma guatemalteca",
    "a Guatemalan driver",
    "una guatemalteca"
  ],
  [
    "Poucas guatemaltecas",
    "Few Guatemalan drivers",
    "Pocas guatemaltecas"
  ],
  [
    "a Guatemala",
    "Guatemala",
    "Guatemala"
  ],
  [
    "holandês",
    "Dutch",
    "neerlandés"
  ],
  [
    "HOLANDÊS",
    "DUTCH",
    "NEERLANDÉS"
  ],
  [
    "um holandês",
    "a Dutch driver",
    "un neerlandés"
  ],
  [
    "Poucos holandeses",
    "Few Dutch drivers",
    "Pocos neerlandeses"
  ],
  [
    "holandesa",
    "Dutch",
    "neerlandesa"
  ],
  [
    "HOLANDESA",
    "DUTCH",
    "NEERLANDESA"
  ],
  [
    "uma holandesa",
    "a Dutch driver",
    "una neerlandesa"
  ],
  [
    "Poucas holandesas",
    "Few Dutch drivers",
    "Pocas neerlandesas"
  ],
  [
    "a Holanda",
    "Netherlands",
    "Países Bajos"
  ],
  [
    "hondurenho",
    "Honduran",
    "hondureño"
  ],
  [
    "HONDURENHO",
    "HONDURAN",
    "HONDUREÑO"
  ],
  [
    "um hondurenho",
    "a Honduran driver",
    "un hondureño"
  ],
  [
    "Poucos hondurenhos",
    "Few Honduran drivers",
    "Pocos hondureños"
  ],
  [
    "hondurenha",
    "Honduran",
    "hondureña"
  ],
  [
    "HONDURENHA",
    "HONDURAN",
    "HONDUREÑA"
  ],
  [
    "uma hondurenha",
    "a Honduran driver",
    "una hondureña"
  ],
  [
    "Poucas hondurenhas",
    "Few Honduran drivers",
    "Pocas hondureñas"
  ],
  [
    "honconguês",
    "Hong Kong",
    "hongkonés"
  ],
  [
    "HONCONGUÊS",
    "HONG KONG",
    "HONGKONÉS"
  ],
  [
    "um honconguês",
    "a Hong Kong driver",
    "un hongkonés"
  ],
  [
    "Poucos honcongueses",
    "Few Hong Kong drivers",
    "Pocos hongkoneses"
  ],
  [
    "honconguesa",
    "Hong Kong",
    "hongkonesa"
  ],
  [
    "HONCONGUESA",
    "HONG KONG",
    "HONGKONESA"
  ],
  [
    "uma honconguesa",
    "a Hong Kong driver",
    "una hongkonesa"
  ],
  [
    "Poucas honconguesas",
    "Few Hong Kong drivers",
    "Pocas hongkonesas"
  ],
  [
    "húngaro",
    "Hungarian",
    "húngaro"
  ],
  [
    "HÚNGARO",
    "HUNGARIAN",
    "HÚNGARO"
  ],
  [
    "um húngaro",
    "a Hungarian driver",
    "un húngaro"
  ],
  [
    "Poucos húngaros",
    "Few Hungarian drivers",
    "Pocos húngaros"
  ],
  [
    "húngara",
    "Hungarian",
    "húngara"
  ],
  [
    "HÚNGARA",
    "HUNGARIAN",
    "HÚNGARA"
  ],
  [
    "uma húngara",
    "a Hungarian driver",
    "una húngara"
  ],
  [
    "Poucas húngaras",
    "Few Hungarian drivers",
    "Pocas húngaras"
  ],
  [
    "a Hungria",
    "Hungary",
    "Hungría"
  ],
  [
    "indiano",
    "Indian",
    "indio"
  ],
  [
    "INDIANO",
    "INDIAN",
    "INDIO"
  ],
  [
    "um indiano",
    "an Indian driver",
    "un indio"
  ],
  [
    "Poucos indianos",
    "Few Indian drivers",
    "Pocos indios"
  ],
  [
    "indiana",
    "Indian",
    "india"
  ],
  [
    "INDIANA",
    "INDIAN",
    "INDIA"
  ],
  [
    "uma indiana",
    "an Indian driver",
    "una india"
  ],
  [
    "Poucas indianas",
    "Few Indian drivers",
    "Pocas indias"
  ],
  [
    "a Índia",
    "India",
    "India"
  ],
  [
    "indonésio",
    "Indonesian",
    "indonesio"
  ],
  [
    "INDONÉSIO",
    "INDONESIAN",
    "INDONESIO"
  ],
  [
    "um indonésio",
    "an Indonesian driver",
    "un indonesio"
  ],
  [
    "Poucos indonésios",
    "Few Indonesian drivers",
    "Pocos indonesios"
  ],
  [
    "indonésia",
    "Indonesian",
    "indonesia"
  ],
  [
    "INDONÉSIA",
    "INDONESIAN",
    "INDONESIA"
  ],
  [
    "uma indonésia",
    "an Indonesian driver",
    "una indonesia"
  ],
  [
    "Poucas indonésias",
    "Few Indonesian drivers",
    "Pocas indonesias"
  ],
  [
    "a Indonésia",
    "Indonesia",
    "Indonesia"
  ],
  [
    "irlandês",
    "Irish",
    "irlandés"
  ],
  [
    "IRLANDÊS",
    "IRISH",
    "IRLANDÉS"
  ],
  [
    "um irlandês",
    "an Irish driver",
    "un irlandés"
  ],
  [
    "Poucos irlandeses",
    "Few Irish drivers",
    "Pocos irlandeses"
  ],
  [
    "irlandesa",
    "Irish",
    "irlandesa"
  ],
  [
    "IRLANDESA",
    "IRISH",
    "IRLANDESA"
  ],
  [
    "uma irlandesa",
    "an Irish driver",
    "una irlandesa"
  ],
  [
    "Poucas irlandesas",
    "Few Irish drivers",
    "Pocas irlandesas"
  ],
  [
    "a Irlanda",
    "Ireland",
    "Irlanda"
  ],
  [
    "islandês",
    "Icelandic",
    "islandés"
  ],
  [
    "ISLANDÊS",
    "ICELANDIC",
    "ISLANDÉS"
  ],
  [
    "um islandês",
    "an Icelandic driver",
    "un islandés"
  ],
  [
    "Poucos islandeses",
    "Few Icelandic drivers",
    "Pocos islandeses"
  ],
  [
    "islandesa",
    "Icelandic",
    "islandesa"
  ],
  [
    "ISLANDESA",
    "ICELANDIC",
    "ISLANDESA"
  ],
  [
    "uma islandesa",
    "an Icelandic driver",
    "una islandesa"
  ],
  [
    "Poucas islandesas",
    "Few Icelandic drivers",
    "Pocas islandesas"
  ],
  [
    "a Islândia",
    "Iceland",
    "Islandia"
  ],
  [
    "israelense",
    "Israeli",
    "israelí"
  ],
  [
    "ISRAELENSE",
    "ISRAELI",
    "ISRAELÍ"
  ],
  [
    "um israelense",
    "an Israeli driver",
    "un israelí"
  ],
  [
    "Poucos israelenses",
    "Few Israeli drivers",
    "Pocos israelíes"
  ],
  [
    "uma israelense",
    "an Israeli driver",
    "una israelí"
  ],
  [
    "Poucas israelenses",
    "Few Israeli drivers",
    "Pocas israelíes"
  ],
  [
    "italiano",
    "Italian",
    "italiano"
  ],
  [
    "ITALIANO",
    "ITALIAN",
    "ITALIANO"
  ],
  [
    "Poucos italianos",
    "Few Italian drivers",
    "Pocos italianos"
  ],
  [
    "italiana",
    "Italian",
    "italiana"
  ],
  [
    "ITALIANA",
    "ITALIAN",
    "ITALIANA"
  ],
  [
    "uma italiana",
    "an Italian driver",
    "una italiana"
  ],
  [
    "Poucas italianas",
    "Few Italian drivers",
    "Pocas italianas"
  ],
  [
    "a Itália",
    "Italy",
    "Italia"
  ],
  [
    "jamaicano",
    "Jamaican",
    "jamaicano"
  ],
  [
    "JAMAICANO",
    "JAMAICAN",
    "JAMAICANO"
  ],
  [
    "um jamaicano",
    "a Jamaican driver",
    "un jamaicano"
  ],
  [
    "Poucos jamaicanos",
    "Few Jamaican drivers",
    "Pocos jamaicanos"
  ],
  [
    "jamaicana",
    "Jamaican",
    "jamaicana"
  ],
  [
    "JAMAICANA",
    "JAMAICAN",
    "JAMAICANA"
  ],
  [
    "uma jamaicana",
    "a Jamaican driver",
    "una jamaicana"
  ],
  [
    "Poucas jamaicanas",
    "Few Jamaican drivers",
    "Pocas jamaicanas"
  ],
  [
    "a Jamaica",
    "Jamaica",
    "Jamaica"
  ],
  [
    "japonês",
    "Japanese",
    "japonés"
  ],
  [
    "JAPONÊS",
    "JAPANESE",
    "JAPONÉS"
  ],
  [
    "Poucos japoneses",
    "Few Japanese drivers",
    "Pocos japoneses"
  ],
  [
    "japonesa",
    "Japanese",
    "japonesa"
  ],
  [
    "JAPONESA",
    "JAPANESE",
    "JAPONESA"
  ],
  [
    "uma japonesa",
    "a Japanese driver",
    "una japonesa"
  ],
  [
    "Poucas japonesas",
    "Few Japanese drivers",
    "Pocas japonesas"
  ],
  [
    "o Japão",
    "Japan",
    "Japón"
  ],
  [
    "letão",
    "Latvian",
    "letón"
  ],
  [
    "LETÃO",
    "LATVIAN",
    "LETÓN"
  ],
  [
    "um letão",
    "a Latvian driver",
    "un letón"
  ],
  [
    "Poucos letões",
    "Few Latvian drivers",
    "Pocos letones"
  ],
  [
    "letã",
    "Latvian",
    "letona"
  ],
  [
    "LETÃ",
    "LATVIAN",
    "LETONA"
  ],
  [
    "uma letã",
    "a Latvian driver",
    "una letona"
  ],
  [
    "Poucas letãs",
    "Few Latvian drivers",
    "Pocas letonas"
  ],
  [
    "a Letônia",
    "Latvia",
    "Letonia"
  ],
  [
    "libanês",
    "Lebanese",
    "libanés"
  ],
  [
    "LIBANÊS",
    "LEBANESE",
    "LIBANÉS"
  ],
  [
    "um libanês",
    "a Lebanese driver",
    "un libanés"
  ],
  [
    "Poucos libaneses",
    "Few Lebanese drivers",
    "Pocos libaneses"
  ],
  [
    "libanesa",
    "Lebanese",
    "libanesa"
  ],
  [
    "LIBANESA",
    "LEBANESE",
    "LIBANESA"
  ],
  [
    "uma libanesa",
    "a Lebanese driver",
    "una libanesa"
  ],
  [
    "Poucas libanesas",
    "Few Lebanese drivers",
    "Pocas libanesas"
  ],
  [
    "o Líbano",
    "Lebanon",
    "Líbano"
  ],
  [
    "lituano",
    "Lithuanian",
    "lituano"
  ],
  [
    "LITUANO",
    "LITHUANIAN",
    "LITUANO"
  ],
  [
    "um lituano",
    "a Lithuanian driver",
    "un lituano"
  ],
  [
    "Poucos lituanos",
    "Few Lithuanian drivers",
    "Pocos lituanos"
  ],
  [
    "lituana",
    "Lithuanian",
    "lituana"
  ],
  [
    "LITUANA",
    "LITHUANIAN",
    "LITUANA"
  ],
  [
    "uma lituana",
    "a Lithuanian driver",
    "una lituana"
  ],
  [
    "Poucas lituanas",
    "Few Lithuanian drivers",
    "Pocas lituanas"
  ],
  [
    "a Lituânia",
    "Lithuania",
    "Lituania"
  ],
  [
    "luxemburguês",
    "Luxembourgish",
    "luxemburgués"
  ],
  [
    "LUXEMBURGUÊS",
    "LUXEMBOURGISH",
    "LUXEMBURGUÉS"
  ],
  [
    "um luxemburguês",
    "a Luxembourgish driver",
    "un luxemburgués"
  ],
  [
    "Poucos luxemburgueses",
    "Few Luxembourgish drivers",
    "Pocos luxemburgueses"
  ],
  [
    "luxemburguesa",
    "Luxembourgish",
    "luxemburguesa"
  ],
  [
    "LUXEMBURGUESA",
    "LUXEMBOURGISH",
    "LUXEMBURGUESA"
  ],
  [
    "uma luxemburguesa",
    "a Luxembourgish driver",
    "una luxemburguesa"
  ],
  [
    "Poucas luxemburguesas",
    "Few Luxembourgish drivers",
    "Pocas luxemburguesas"
  ],
  [
    "macaense",
    "Macanese",
    "macaense"
  ],
  [
    "MACAENSE",
    "MACANESE",
    "MACAENSE"
  ],
  [
    "um macaense",
    "a Macanese driver",
    "un macaense"
  ],
  [
    "Poucos macaenses",
    "Few Macanese drivers",
    "Pocos macaenses"
  ],
  [
    "uma macaense",
    "a Macanese driver",
    "una macaense"
  ],
  [
    "Poucas macaenses",
    "Few Macanese drivers",
    "Pocas macaenses"
  ],
  [
    "malaio",
    "Malaysian",
    "malasio"
  ],
  [
    "MALAIO",
    "MALAYSIAN",
    "MALASIO"
  ],
  [
    "um malaio",
    "a Malaysian driver",
    "un malasio"
  ],
  [
    "Poucos malaios",
    "Few Malaysian drivers",
    "Pocos malasios"
  ],
  [
    "malaia",
    "Malaysian",
    "malasia"
  ],
  [
    "MALAIA",
    "MALAYSIAN",
    "MALASIA"
  ],
  [
    "uma malaia",
    "a Malaysian driver",
    "una malasia"
  ],
  [
    "Poucas malaias",
    "Few Malaysian drivers",
    "Pocas malasias"
  ],
  [
    "a Malásia",
    "Malaysia",
    "Malasia"
  ],
  [
    "maltês",
    "Maltese",
    "maltés"
  ],
  [
    "MALTÊS",
    "MALTESE",
    "MALTÉS"
  ],
  [
    "um maltês",
    "a Maltese driver",
    "un maltés"
  ],
  [
    "Poucos malteses",
    "Few Maltese drivers",
    "Pocos malteses"
  ],
  [
    "maltesa",
    "Maltese",
    "maltesa"
  ],
  [
    "MALTESA",
    "MALTESE",
    "MALTESA"
  ],
  [
    "uma maltesa",
    "a Maltese driver",
    "una maltesa"
  ],
  [
    "Poucas maltesas",
    "Few Maltese drivers",
    "Pocas maltesas"
  ],
  [
    "marroquino",
    "Moroccan",
    "marroquí"
  ],
  [
    "MARROQUINO",
    "MOROCCAN",
    "MARROQUÍ"
  ],
  [
    "um marroquino",
    "a Moroccan driver",
    "un marroquí"
  ],
  [
    "Poucos marroquinos",
    "Few Moroccan drivers",
    "Pocos marroquíes"
  ],
  [
    "marroquina",
    "Moroccan",
    "marroquí"
  ],
  [
    "MARROQUINA",
    "MOROCCAN",
    "MARROQUÍ"
  ],
  [
    "uma marroquina",
    "a Moroccan driver",
    "una marroquí"
  ],
  [
    "Poucas marroquinas",
    "Few Moroccan drivers",
    "Pocas marroquíes"
  ],
  [
    "o Marrocos",
    "Morocco",
    "Marruecos"
  ],
  [
    "mexicano",
    "Mexican",
    "mexicano"
  ],
  [
    "MEXICANO",
    "MEXICAN",
    "MEXICANO"
  ],
  [
    "Poucos mexicanos",
    "Few Mexican drivers",
    "Pocos mexicanos"
  ],
  [
    "mexicana",
    "Mexican",
    "mexicana"
  ],
  [
    "MEXICANA",
    "MEXICAN",
    "MEXICANA"
  ],
  [
    "uma mexicana",
    "a Mexican driver",
    "una mexicana"
  ],
  [
    "Poucas mexicanas",
    "Few Mexican drivers",
    "Pocas mexicanas"
  ],
  [
    "o México",
    "Mexico",
    "México"
  ],
  [
    "moçambicano",
    "Mozambican",
    "mozambiqueño"
  ],
  [
    "MOÇAMBICANO",
    "MOZAMBICAN",
    "MOZAMBIQUEÑO"
  ],
  [
    "um moçambicano",
    "a Mozambican driver",
    "un mozambiqueño"
  ],
  [
    "Poucos moçambicanos",
    "Few Mozambican drivers",
    "Pocos mozambiqueños"
  ],
  [
    "moçambicana",
    "Mozambican",
    "mozambiqueña"
  ],
  [
    "MOÇAMBICANA",
    "MOZAMBICAN",
    "MOZAMBIQUEÑA"
  ],
  [
    "uma moçambicana",
    "a Mozambican driver",
    "una mozambiqueña"
  ],
  [
    "Poucas moçambicanas",
    "Few Mozambican drivers",
    "Pocas mozambiqueñas"
  ],
  [
    "monegasco",
    "Monegasque",
    "monegasco"
  ],
  [
    "MONEGASCO",
    "MONEGASQUE",
    "MONEGASCO"
  ],
  [
    "um monegasco",
    "a Monegasque driver",
    "un monegasco"
  ],
  [
    "Poucos monegascos",
    "Few Monegasque drivers",
    "Pocos monegascos"
  ],
  [
    "monegasca",
    "Monegasque",
    "monegasca"
  ],
  [
    "MONEGASCA",
    "MONEGASQUE",
    "MONEGASCA"
  ],
  [
    "uma monegasca",
    "a Monegasque driver",
    "una monegasca"
  ],
  [
    "Poucas monegascas",
    "Few Monegasque drivers",
    "Pocas monegascas"
  ],
  [
    "nicaraguense",
    "Nicaraguan",
    "nicaragüense"
  ],
  [
    "NICARAGUENSE",
    "NICARAGUAN",
    "NICARAGÜENSE"
  ],
  [
    "um nicaraguense",
    "a Nicaraguan driver",
    "un nicaragüense"
  ],
  [
    "Poucos nicaraguenses",
    "Few Nicaraguan drivers",
    "Pocos nicaragüenses"
  ],
  [
    "uma nicaraguense",
    "a Nicaraguan driver",
    "una nicaragüense"
  ],
  [
    "Poucas nicaraguenses",
    "Few Nicaraguan drivers",
    "Pocas nicaragüenses"
  ],
  [
    "a Nicarágua",
    "Nicaragua",
    "Nicaragua"
  ],
  [
    "nigeriano",
    "Nigerian",
    "nigeriano"
  ],
  [
    "NIGERIANO",
    "NIGERIAN",
    "NIGERIANO"
  ],
  [
    "um nigeriano",
    "a Nigerian driver",
    "un nigeriano"
  ],
  [
    "Poucos nigerianos",
    "Few Nigerian drivers",
    "Pocos nigerianos"
  ],
  [
    "nigeriana",
    "Nigerian",
    "nigeriana"
  ],
  [
    "NIGERIANA",
    "NIGERIAN",
    "NIGERIANA"
  ],
  [
    "uma nigeriana",
    "a Nigerian driver",
    "una nigeriana"
  ],
  [
    "Poucas nigerianas",
    "Few Nigerian drivers",
    "Pocas nigerianas"
  ],
  [
    "a Nigéria",
    "Nigeria",
    "Nigeria"
  ],
  [
    "norueguês",
    "Norwegian",
    "noruego"
  ],
  [
    "NORUEGUÊS",
    "NORWEGIAN",
    "NORUEGO"
  ],
  [
    "um norueguês",
    "a Norwegian driver",
    "un noruego"
  ],
  [
    "Poucos noruegueses",
    "Few Norwegian drivers",
    "Pocos noruegos"
  ],
  [
    "norueguesa",
    "Norwegian",
    "noruega"
  ],
  [
    "NORUEGUESA",
    "NORWEGIAN",
    "NORUEGA"
  ],
  [
    "uma norueguesa",
    "a Norwegian driver",
    "una noruega"
  ],
  [
    "Poucas norueguesas",
    "Few Norwegian drivers",
    "Pocas noruegas"
  ],
  [
    "a Noruega",
    "Norway",
    "Noruega"
  ],
  [
    "neozelandês",
    "New Zealand",
    "neozelandés"
  ],
  [
    "NEOZELANDÊS",
    "NEW ZEALAND",
    "NEOZELANDÉS"
  ],
  [
    "um neozelandês",
    "a New Zealand driver",
    "un neozelandés"
  ],
  [
    "Poucos neozelandeses",
    "Few New Zealand drivers",
    "Pocos neozelandeses"
  ],
  [
    "neozelandesa",
    "New Zealand",
    "neozelandesa"
  ],
  [
    "NEOZELANDESA",
    "NEW ZEALAND",
    "NEOZELANDESA"
  ],
  [
    "uma neozelandesa",
    "a New Zealand driver",
    "una neozelandesa"
  ],
  [
    "Poucas neozelandesas",
    "Few New Zealand drivers",
    "Pocas neozelandesas"
  ],
  [
    "a Nova Zelândia",
    "New Zealand",
    "Nueva Zelanda"
  ],
  [
    "panamenho",
    "Panamanian",
    "panameño"
  ],
  [
    "PANAMENHO",
    "PANAMANIAN",
    "PANAMEÑO"
  ],
  [
    "um panamenho",
    "a Panamanian driver",
    "un panameño"
  ],
  [
    "Poucos panamenhos",
    "Few Panamanian drivers",
    "Pocos panameños"
  ],
  [
    "panamenha",
    "Panamanian",
    "panameña"
  ],
  [
    "PANAMENHA",
    "PANAMANIAN",
    "PANAMEÑA"
  ],
  [
    "uma panamenha",
    "a Panamanian driver",
    "una panameña"
  ],
  [
    "Poucas panamenhas",
    "Few Panamanian drivers",
    "Pocas panameñas"
  ],
  [
    "o Panamá",
    "Panama",
    "Panamá"
  ],
  [
    "paraguaio",
    "Paraguayan",
    "paraguayo"
  ],
  [
    "PARAGUAIO",
    "PARAGUAYAN",
    "PARAGUAYO"
  ],
  [
    "um paraguaio",
    "a Paraguayan driver",
    "un paraguayo"
  ],
  [
    "Poucos paraguaios",
    "Few Paraguayan drivers",
    "Pocos paraguayos"
  ],
  [
    "paraguaia",
    "Paraguayan",
    "paraguaya"
  ],
  [
    "PARAGUAIA",
    "PARAGUAYAN",
    "PARAGUAYA"
  ],
  [
    "uma paraguaia",
    "a Paraguayan driver",
    "una paraguaya"
  ],
  [
    "Poucas paraguaias",
    "Few Paraguayan drivers",
    "Pocas paraguayas"
  ],
  [
    "o Paraguai",
    "Paraguay",
    "Paraguay"
  ],
  [
    "peruano",
    "Peruvian",
    "peruano"
  ],
  [
    "PERUANO",
    "PERUVIAN",
    "PERUANO"
  ],
  [
    "um peruano",
    "a Peruvian driver",
    "un peruano"
  ],
  [
    "Poucos peruanos",
    "Few Peruvian drivers",
    "Pocos peruanos"
  ],
  [
    "peruana",
    "Peruvian",
    "peruana"
  ],
  [
    "PERUANA",
    "PERUVIAN",
    "PERUANA"
  ],
  [
    "uma peruana",
    "a Peruvian driver",
    "una peruana"
  ],
  [
    "Poucas peruanas",
    "Few Peruvian drivers",
    "Pocas peruanas"
  ],
  [
    "o Peru",
    "Peru",
    "Perú"
  ],
  [
    "polonês",
    "Polish",
    "polaco"
  ],
  [
    "POLONÊS",
    "POLISH",
    "POLACO"
  ],
  [
    "um polonês",
    "a Polish driver",
    "un polaco"
  ],
  [
    "Poucos poloneses",
    "Few Polish drivers",
    "Pocos polacos"
  ],
  [
    "polonesa",
    "Polish",
    "polaca"
  ],
  [
    "POLONESA",
    "POLISH",
    "POLACA"
  ],
  [
    "uma polonesa",
    "a Polish driver",
    "una polaca"
  ],
  [
    "Poucas polonesas",
    "Few Polish drivers",
    "Pocas polacas"
  ],
  [
    "a Polônia",
    "Poland",
    "Polonia"
  ],
  [
    "português",
    "Portuguese",
    "portugués"
  ],
  [
    "PORTUGUÊS",
    "PORTUGUESE",
    "PORTUGUÉS"
  ],
  [
    "Poucos portugueses",
    "Few Portuguese drivers",
    "Pocos portugueses"
  ],
  [
    "portuguesa",
    "Portuguese",
    "portuguesa"
  ],
  [
    "PORTUGUESA",
    "PORTUGUESE",
    "PORTUGUESA"
  ],
  [
    "uma portuguesa",
    "a Portuguese driver",
    "una portuguesa"
  ],
  [
    "Poucas portuguesas",
    "Few Portuguese drivers",
    "Pocas portuguesas"
  ],
  [
    "catariano",
    "Qatari",
    "catarí"
  ],
  [
    "CATARIANO",
    "QATARI",
    "CATARÍ"
  ],
  [
    "um catariano",
    "a Qatari driver",
    "un catarí"
  ],
  [
    "Poucos catarianos",
    "Few Qatari drivers",
    "Pocos cataríes"
  ],
  [
    "catariana",
    "Qatari",
    "catarí"
  ],
  [
    "CATARIANA",
    "QATARI",
    "CATARÍ"
  ],
  [
    "uma catariana",
    "a Qatari driver",
    "una catarí"
  ],
  [
    "Poucas catarianas",
    "Few Qatari drivers",
    "Pocas cataríes"
  ],
  [
    "o Catar",
    "Qatar",
    "Catar"
  ],
  [
    "queniano",
    "Kenyan",
    "keniano"
  ],
  [
    "QUENIANO",
    "KENYAN",
    "KENIANO"
  ],
  [
    "um queniano",
    "a Kenyan driver",
    "un keniano"
  ],
  [
    "Poucos quenianos",
    "Few Kenyan drivers",
    "Pocos kenianos"
  ],
  [
    "queniana",
    "Kenyan",
    "keniana"
  ],
  [
    "QUENIANA",
    "KENYAN",
    "KENIANA"
  ],
  [
    "uma queniana",
    "a Kenyan driver",
    "una keniana"
  ],
  [
    "Poucas quenianas",
    "Few Kenyan drivers",
    "Pocas kenianas"
  ],
  [
    "o Quênia",
    "Kenya",
    "Kenia"
  ],
  [
    "britânico",
    "British",
    "británico"
  ],
  [
    "BRITÂNICO",
    "BRITISH",
    "BRITÁNICO"
  ],
  [
    "Poucos britânicos",
    "Few British drivers",
    "Pocos británicos"
  ],
  [
    "britânica",
    "British",
    "británica"
  ],
  [
    "BRITÂNICA",
    "BRITISH",
    "BRITÁNICA"
  ],
  [
    "uma britânica",
    "a British driver",
    "una británica"
  ],
  [
    "Poucas britânicas",
    "Few British drivers",
    "Pocas británicas"
  ],
  [
    "o Reino Unido",
    "United Kingdom",
    "Reino Unido"
  ],
  [
    "dominicano",
    "Dominican",
    "dominicano"
  ],
  [
    "DOMINICANO",
    "DOMINICAN",
    "DOMINICANO"
  ],
  [
    "um dominicano",
    "a Dominican driver",
    "un dominicano"
  ],
  [
    "Poucos dominicanos",
    "Few Dominican drivers",
    "Pocos dominicanos"
  ],
  [
    "dominicana",
    "Dominican",
    "dominicana"
  ],
  [
    "DOMINICANA",
    "DOMINICAN",
    "DOMINICANA"
  ],
  [
    "uma dominicana",
    "a Dominican driver",
    "una dominicana"
  ],
  [
    "Poucas dominicanas",
    "Few Dominican drivers",
    "Pocas dominicanas"
  ],
  [
    "a Rep. Dominicana",
    "Dominican Republic",
    "República Dominicana"
  ],
  [
    "romeno",
    "Romanian",
    "rumano"
  ],
  [
    "ROMENO",
    "ROMANIAN",
    "RUMANO"
  ],
  [
    "um romeno",
    "a Romanian driver",
    "un rumano"
  ],
  [
    "Poucos romenos",
    "Few Romanian drivers",
    "Pocos rumanos"
  ],
  [
    "romena",
    "Romanian",
    "rumana"
  ],
  [
    "ROMENA",
    "ROMANIAN",
    "RUMANA"
  ],
  [
    "uma romena",
    "a Romanian driver",
    "una rumana"
  ],
  [
    "Poucas romenas",
    "Few Romanian drivers",
    "Pocas rumanas"
  ],
  [
    "a Romênia",
    "Romania",
    "Rumanía"
  ],
  [
    "russo",
    "Russian",
    "ruso"
  ],
  [
    "RUSSO",
    "RUSSIAN",
    "RUSO"
  ],
  [
    "um russo",
    "a Russian driver",
    "un ruso"
  ],
  [
    "Poucos russos",
    "Few Russian drivers",
    "Pocos rusos"
  ],
  [
    "russa",
    "Russian",
    "rusa"
  ],
  [
    "RUSSA",
    "RUSSIAN",
    "RUSA"
  ],
  [
    "uma russa",
    "a Russian driver",
    "una rusa"
  ],
  [
    "Poucas russas",
    "Few Russian drivers",
    "Pocas rusas"
  ],
  [
    "a Rússia",
    "Russia",
    "Rusia"
  ],
  [
    "sérvio",
    "Serbian",
    "serbio"
  ],
  [
    "SÉRVIO",
    "SERBIAN",
    "SERBIO"
  ],
  [
    "um sérvio",
    "a Serbian driver",
    "un serbio"
  ],
  [
    "Poucos sérvios",
    "Few Serbian drivers",
    "Pocos serbios"
  ],
  [
    "sérvia",
    "Serbian",
    "serbia"
  ],
  [
    "SÉRVIA",
    "SERBIAN",
    "SERBIA"
  ],
  [
    "uma sérvia",
    "a Serbian driver",
    "una serbia"
  ],
  [
    "Poucas sérvias",
    "Few Serbian drivers",
    "Pocas serbias"
  ],
  [
    "a Sérvia",
    "Serbia",
    "Serbia"
  ],
  [
    "singapurense",
    "Singaporean",
    "singapurense"
  ],
  [
    "SINGAPURENSE",
    "SINGAPOREAN",
    "SINGAPURENSE"
  ],
  [
    "um singapurense",
    "a Singaporean driver",
    "un singapurense"
  ],
  [
    "Poucos singapurenses",
    "Few Singaporean drivers",
    "Pocos singapurenses"
  ],
  [
    "uma singapurense",
    "a Singaporean driver",
    "una singapurense"
  ],
  [
    "Poucas singapurenses",
    "Few Singaporean drivers",
    "Pocas singapurenses"
  ],
  [
    "sueco",
    "Swedish",
    "sueco"
  ],
  [
    "SUECO",
    "SWEDISH",
    "SUECO"
  ],
  [
    "um sueco",
    "a Swedish driver",
    "un sueco"
  ],
  [
    "Poucos suecos",
    "Few Swedish drivers",
    "Pocos suecos"
  ],
  [
    "sueca",
    "Swedish",
    "sueca"
  ],
  [
    "SUECA",
    "SWEDISH",
    "SUECA"
  ],
  [
    "uma sueca",
    "a Swedish driver",
    "una sueca"
  ],
  [
    "Poucas suecas",
    "Few Swedish drivers",
    "Pocas suecas"
  ],
  [
    "a Suécia",
    "Sweden",
    "Suecia"
  ],
  [
    "suíço",
    "Swiss",
    "suizo"
  ],
  [
    "SUÍÇO",
    "SWISS",
    "SUIZO"
  ],
  [
    "um suíço",
    "a Swiss driver",
    "un suizo"
  ],
  [
    "Poucos suíços",
    "Few Swiss drivers",
    "Pocos suizos"
  ],
  [
    "suíça",
    "Swiss",
    "suiza"
  ],
  [
    "SUÍÇA",
    "SWISS",
    "SUIZA"
  ],
  [
    "uma suíça",
    "a Swiss driver",
    "una suiza"
  ],
  [
    "Poucas suíças",
    "Few Swiss drivers",
    "Pocas suizas"
  ],
  [
    "a Suíça",
    "Switzerland",
    "Suiza"
  ],
  [
    "tailandês",
    "Thai",
    "tailandés"
  ],
  [
    "TAILANDÊS",
    "THAI",
    "TAILANDÉS"
  ],
  [
    "um tailandês",
    "a Thai driver",
    "un tailandés"
  ],
  [
    "Poucos tailandeses",
    "Few Thai drivers",
    "Pocos tailandeses"
  ],
  [
    "tailandesa",
    "Thai",
    "tailandesa"
  ],
  [
    "TAILANDESA",
    "THAI",
    "TAILANDESA"
  ],
  [
    "uma tailandesa",
    "a Thai driver",
    "una tailandesa"
  ],
  [
    "Poucas tailandesas",
    "Few Thai drivers",
    "Pocas tailandesas"
  ],
  [
    "a Tailândia",
    "Thailand",
    "Tailandia"
  ],
  [
    "taiwanês",
    "Taiwanese",
    "taiwanés"
  ],
  [
    "TAIWANÊS",
    "TAIWANESE",
    "TAIWANÉS"
  ],
  [
    "um taiwanês",
    "a Taiwanese driver",
    "un taiwanés"
  ],
  [
    "Poucos taiwaneses",
    "Few Taiwanese drivers",
    "Pocos taiwaneses"
  ],
  [
    "taiwanesa",
    "Taiwanese",
    "taiwanesa"
  ],
  [
    "TAIWANESA",
    "TAIWANESE",
    "TAIWANESA"
  ],
  [
    "uma taiwanesa",
    "a Taiwanese driver",
    "una taiwanesa"
  ],
  [
    "Poucas taiwanesas",
    "Few Taiwanese drivers",
    "Pocas taiwanesas"
  ],
  [
    "tcheco",
    "Czech",
    "checo"
  ],
  [
    "TCHECO",
    "CZECH",
    "CHECO"
  ],
  [
    "um tcheco",
    "a Czech driver",
    "un checo"
  ],
  [
    "Poucos tchecos",
    "Few Czech drivers",
    "Pocos checos"
  ],
  [
    "tcheca",
    "Czech",
    "checa"
  ],
  [
    "TCHECA",
    "CZECH",
    "CHECA"
  ],
  [
    "uma tcheca",
    "a Czech driver",
    "una checa"
  ],
  [
    "Poucas tchecas",
    "Few Czech drivers",
    "Pocas checas"
  ],
  [
    "a Tchéquia",
    "Czechia",
    "Chequia"
  ],
  [
    "trinitário",
    "Trinidadian",
    "trinitense"
  ],
  [
    "TRINITÁRIO",
    "TRINIDADIAN",
    "TRINITENSE"
  ],
  [
    "um trinitário",
    "a Trinidadian driver",
    "un trinitense"
  ],
  [
    "Poucos trinitários",
    "Few Trinidadian drivers",
    "Pocos trinitenses"
  ],
  [
    "trinitária",
    "Trinidadian",
    "trinitense"
  ],
  [
    "TRINITÁRIA",
    "TRINIDADIAN",
    "TRINITENSE"
  ],
  [
    "uma trinitária",
    "a Trinidadian driver",
    "una trinitense"
  ],
  [
    "Poucas trinitárias",
    "Few Trinidadian drivers",
    "Pocas trinitenses"
  ],
  [
    "tunisiano",
    "Tunisian",
    "tunecino"
  ],
  [
    "TUNISIANO",
    "TUNISIAN",
    "TUNECINO"
  ],
  [
    "um tunisiano",
    "a Tunisian driver",
    "un tunecino"
  ],
  [
    "Poucos tunisianos",
    "Few Tunisian drivers",
    "Pocos tunecinos"
  ],
  [
    "tunisiana",
    "Tunisian",
    "tunecina"
  ],
  [
    "TUNISIANA",
    "TUNISIAN",
    "TUNECINA"
  ],
  [
    "uma tunisiana",
    "a Tunisian driver",
    "una tunecina"
  ],
  [
    "Poucas tunisianas",
    "Few Tunisian drivers",
    "Pocas tunecinas"
  ],
  [
    "a Tunísia",
    "Tunisia",
    "Túnez"
  ],
  [
    "turco",
    "Turkish",
    "turco"
  ],
  [
    "TURCO",
    "TURKISH",
    "TURCO"
  ],
  [
    "um turco",
    "a Turkish driver",
    "un turco"
  ],
  [
    "Poucos turcos",
    "Few Turkish drivers",
    "Pocos turcos"
  ],
  [
    "turca",
    "Turkish",
    "turca"
  ],
  [
    "TURCA",
    "TURKISH",
    "TURCA"
  ],
  [
    "uma turca",
    "a Turkish driver",
    "una turca"
  ],
  [
    "Poucas turcas",
    "Few Turkish drivers",
    "Pocas turcas"
  ],
  [
    "a Turquia",
    "Türkiye",
    "Turquía"
  ],
  [
    "ucraniano",
    "Ukrainian",
    "ucraniano"
  ],
  [
    "UCRANIANO",
    "UKRAINIAN",
    "UCRANIANO"
  ],
  [
    "um ucraniano",
    "a Ukrainian driver",
    "un ucraniano"
  ],
  [
    "Poucos ucranianos",
    "Few Ukrainian drivers",
    "Pocos ucranianos"
  ],
  [
    "ucraniana",
    "Ukrainian",
    "ucraniana"
  ],
  [
    "UCRANIANA",
    "UKRAINIAN",
    "UCRANIANA"
  ],
  [
    "uma ucraniana",
    "a Ukrainian driver",
    "una ucraniana"
  ],
  [
    "Poucas ucranianas",
    "Few Ukrainian drivers",
    "Pocas ucranianas"
  ],
  [
    "a Ucrânia",
    "Ukraine",
    "Ucrania"
  ],
  [
    "uruguaio",
    "Uruguayan",
    "uruguayo"
  ],
  [
    "URUGUAIO",
    "URUGUAYAN",
    "URUGUAYO"
  ],
  [
    "um uruguaio",
    "a Uruguayan driver",
    "un uruguayo"
  ],
  [
    "Poucos uruguaios",
    "Few Uruguayan drivers",
    "Pocos uruguayos"
  ],
  [
    "uruguaia",
    "Uruguayan",
    "uruguaya"
  ],
  [
    "URUGUAIA",
    "URUGUAYAN",
    "URUGUAYA"
  ],
  [
    "uma uruguaia",
    "a Uruguayan driver",
    "una uruguaya"
  ],
  [
    "Poucas uruguaias",
    "Few Uruguayan drivers",
    "Pocas uruguayas"
  ],
  [
    "o Uruguai",
    "Uruguay",
    "Uruguay"
  ],
  [
    "venezuelano",
    "Venezuelan",
    "venezolano"
  ],
  [
    "VENEZUELANO",
    "VENEZUELAN",
    "VENEZOLANO"
  ],
  [
    "um venezuelano",
    "a Venezuelan driver",
    "un venezolano"
  ],
  [
    "Poucos venezuelanos",
    "Few Venezuelan drivers",
    "Pocos venezolanos"
  ],
  [
    "venezuelana",
    "Venezuelan",
    "venezolana"
  ],
  [
    "VENEZUELANA",
    "VENEZUELAN",
    "VENEZOLANA"
  ],
  [
    "uma venezuelana",
    "a Venezuelan driver",
    "una venezolana"
  ],
  [
    "Poucas venezuelanas",
    "Few Venezuelan drivers",
    "Pocas venezolanas"
  ],
  [
    "a Venezuela",
    "Venezuela",
    "Venezuela"
  ],
  [
    "vietnamita",
    "Vietnamese",
    "vietnamita"
  ],
  [
    "VIETNAMITA",
    "VIETNAMESE",
    "VIETNAMITA"
  ],
  [
    "um vietnamita",
    "a Vietnamese driver",
    "un vietnamita"
  ],
  [
    "Poucos vietnamitas",
    "Few Vietnamese drivers",
    "Pocos vietnamitas"
  ],
  [
    "uma vietnamita",
    "a Vietnamese driver",
    "una vietnamita"
  ],
  [
    "Poucas vietnamitas",
    "Few Vietnamese drivers",
    "Pocas vietnamitas"
  ],
  [
    "o Vietnã",
    "Vietnam",
    "Vietnam"
  ],
  [
    "zimbabuano",
    "Zimbabwean",
    "zimbabuense"
  ],
  [
    "ZIMBABUANO",
    "ZIMBABWEAN",
    "ZIMBABUENSE"
  ],
  [
    "um zimbabuano",
    "a Zimbabwean driver",
    "un zimbabuense"
  ],
  [
    "Poucos zimbabuanos",
    "Few Zimbabwean drivers",
    "Pocos zimbabuenses"
  ],
  [
    "zimbabuana",
    "Zimbabwean",
    "zimbabuense"
  ],
  [
    "ZIMBABUANA",
    "ZIMBABWEAN",
    "ZIMBABUENSE"
  ],
  [
    "uma zimbabuana",
    "a Zimbabwean driver",
    "una zimbabuense"
  ],
  [
    "Poucas zimbabuanas",
    "Few Zimbabwean drivers",
    "Pocas zimbabuenses"
  ],
  [
    "o Zimbábue",
    "Zimbabwe",
    "Zimbabue"
  ]
];
  for(const [lang,col] of [["en",1],["es",2]]) window.VDO_LOCALES[lang].pairs.push(...rows.map(r => [r[0],r[col]]));
})();
