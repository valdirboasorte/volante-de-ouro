# Banco histórico — relatório

Gerado em 2026-10-18 por `ferramentas/historico/gerar.mjs`.

## O que estes números são

- **Fonte:** uma só, a Wikipedia em inglês, lida pela API pública do MediaWiki (uma requisição por vez, com pausa e identificação). Cada temporada guarda a página e o número da revisão lida.
- **Nada aqui está "verificado".** Verificado exigiria uma segunda fonte independente concordando. As temporadas com lista de inscritos são **fonte única**; as que só têm a classificação final são **parciais** (quem não pontuou pode faltar); o resto está **pendente**.
- **Cadastrado não é verificado:** o catálogo lista 124 campeonatos; ter um campeonato no catálogo não quer dizer que as temporadas dele foram importadas.
- Os dados de pilotos que o jogo já tinha à mão (escalações da F1 e da Indy, grids de F2/F3/F. Regional de 2017 em diante) continuam como estavam; o banco novo não os substitui, e a auditoria abaixo mostra onde eles discordam da fonte.

## Totais

| | |
|---|---|
| Campeonatos no catálogo | 124 |
| Campeonatos com ao menos uma temporada lida | 103 |
| Temporadas cobertas pelo catálogo (campeonato × ano, até 2026) | 2759 |
| Temporadas com lista de inscritos (fonte única) | 1393 |
| Temporadas só com a classificação final (parcial) | 198 |
| Temporadas com página mas sem tabela legível (pendente) | 151 |
| Temporadas sem página própria (pendente) | 1017 |
| Temporadas verificadas por duas fontes | 0 |
| Pilotos reais distintos | 21061 (com nacionalidade lida: 16871) |
| Pilotos ligados a um nome que o jogo já usava | 731 (escalação ano a ano: 324; listas de época: 328; grids de base do jogo: 79) |
| Equipes (nomes de inscrição distintos) | 11637 |
| Carros (chassi · motor distintos) | 6764 |
| Circuitos (nomes distintos nos calendários) | 1045 |

## Por campeonato

L = lista de inscritos · C = só classificação · P = pendente (sem página ou sem tabela legível)

| Campeonato | Nível | Período | L | C | P | Anos com dados |
|---|---|---|---|---|---|---|
| Fórmula 1 (`f1`) | topo mundial | 1950–hoje | 77 | 0 | 0 | 1950–2026 |
| Campeonato Europeu de Fórmula 2 (`euro_f2`) | F2 / topo nacional | 1967–1984 | 8 | 10 | 0 | 1967–1984 |
| Fórmula 3000 Internacional (`f3000`) | F2 / topo nacional | 1985–2004 | 20 | 0 | 0 | 1985–2004 |
| GP2 Series (`gp2`) | F2 / topo nacional | 2005–2016 | 12 | 0 | 0 | 2005–2016 |
| FIA Fórmula 2 (`f2`) | F2 / topo nacional | 2017–hoje | 10 | 0 | 0 | 2017–2026 |
| GP2 Asia Series (`gp2_asia`) | F2 / topo nacional | 2008–2011 | 4 | 0 | 0 | 2008–2011 |
| Fórmula 3000 Britânica (`f3000_brit`) | F2 / topo nacional | 1989–1996 | 3 | 0 | 5 | 1989–1991 |
| Fórmula 3000 Italiana / Euro F3000 (`f3000_italia`) | F2 / topo nacional | 1999–2009 | 0 | 0 | 11 | — |
| World Series by Nissan (`wsbn`) | F2 / topo nacional | 1998–2004 | 7 | 0 | 0 | 1998–2004 |
| World Series by Renault / Fórmula Renault 3.5 (`wsr`) | F2 / topo nacional | 2005–2017 | 13 | 0 | 0 | 2005–2017 |
| A1 Grand Prix (`a1gp`) | F2 / topo nacional | 2005–2009 | 4 | 0 | 1 | 2006–2009 |
| Formula Nippon / Super Formula (`fnippon`) | F2 / topo nacional | 1996–hoje | 31 | 0 | 0 | 1996–2026 |
| Fórmula 2 Japonesa / F3000 Japonesa (`jp_f2`) | F2 / topo nacional | 1973–1995 | 0 | 0 | 23 | — |
| FIA Fórmula 3 (`f3`) | F3 | 2019–hoje | 8 | 0 | 0 | 2019–2026 |
| GP3 Series (`gp3`) | F3 | 2010–2018 | 9 | 0 | 0 | 2010–2018 |
| Fórmula 3 Europeia da FIA (`f3_euro_fia`) | F3 | 2012–2018 | 7 | 0 | 0 | 2012–2018 |
| Fórmula 3 Euro Series (`f3_euroseries`) | F3 | 2003–2012 | 10 | 0 | 0 | 2003–2012 |
| Campeonato Europeu de Fórmula 3 (`f3_euro_7584`) | F3 | 1975–1984 | 0 | 10 | 0 | 1975–1984 |
| Fórmula 3 Britânica (`f3_brit`) | F3 | 1951–2014 | 17 | 31 | 16 | 1962–1963, 1968–1970, 1972–2014 |
| Fórmula 3 Alemã (`f3_alema`) | F3 | 1950–2014 | 36 | 8 | 21 | 1971–2014 |
| Fórmula 3 Italiana (`f3_italiana`) | F3 | 1964–2012 | 12 | 0 | 37 | 1984, 2002–2012 |
| Fórmula 3 Japonesa (`f3_japao`) | F3 | 1979–2019 | 12 | 7 | 22 | 2000–2007, 2009–2019 |
| Super Formula Lights (`sf_lights`) | F3 | 2020–hoje | 7 | 0 | 0 | 2020–2026 |
| Fórmula 3 Sul-Americana (`f3_sudam`) | F3 | 1987–2013 | 6 | 0 | 21 | 2008–2013 |
| Fórmula 3 Brasil (`f3_brasil`) | F3 | 2014–2017 | 0 | 0 | 4 | — |
| Euroformula Open (`euroformula`) | F3 | 2001–hoje | 25 | 1 | 0 | 2001–2026 |
| GB3 / BRDC F3 (`gb3`) | F3 | 2016–hoje | 11 | 0 | 0 | 2016–2026 |
| Eurocup-3 (`eurocup3`) | F3 | 2023–hoje | 4 | 0 | 0 | 2023–2026 |
| Fórmula Regional Europeia (`frec`) | regional | 2019–hoje | 8 | 0 | 0 | 2019–2026 |
| Eurocup Fórmula Renault 2.0 (`fr_eurocup`) | regional | 1991–2020 | 19 | 1 | 10 | 2000–2002, 2004–2020 |
| Fórmula Renault Britânica (`fr_uk`) | regional | 1989–2011 | 12 | 0 | 11 | 2000–2011 |
| Fórmula Renault 2.0 NEC (`fr_nec`) | regional | 2006–2018 | 13 | 0 | 0 | 2006–2018 |
| Fórmula Renault 2.0 Alps (`fr_alps`) | regional | 2011–2015 | 5 | 0 | 0 | 2011–2015 |
| Fórmula Renault Brasil (`fr_brasil`) | regional | 2002–2006 | 0 | 0 | 5 | — |
| Fórmula Regional do Oriente Médio (`frme`) | regional | 2023–hoje | 4 | 0 | 0 | 2023–2026 |
| Fórmula Regional das Américas (`fram`) | regional | 2018–hoje | 9 | 0 | 0 | 2018–2026 |
| Fórmula Regional Japonesa (`frjp`) | regional | 2020–hoje | 7 | 0 | 0 | 2020–2026 |
| Fórmula Regional da Oceania / Toyota Racing Series (`froc`) | regional | 2005–hoje | 22 | 0 | 0 | 2005–2026 |
| Fórmula Regional Indiana (`frin`) | regional | 2023–hoje | 0 | 0 | 4 | — |
| Fórmula BMW ADAC (`fbmw_adac`) | entrada (F4, Ford, Vee) | 1991–2007 | 6 | 0 | 11 | 2002–2007 |
| Fórmula BMW Europa (`fbmw_europe`) | entrada (F4, Ford, Vee) | 2008–2010 | 3 | 0 | 0 | 2008–2010 |
| Fórmula BMW Britânica (`fbmw_uk`) | entrada (F4, Ford, Vee) | 2004–2007 | 4 | 0 | 0 | 2004–2007 |
| Fórmula BMW EUA (`fbmw_usa`) | entrada (F4, Ford, Vee) | 2004–2007 | 4 | 0 | 0 | 2004–2007 |
| F4 Italiana (`f4_italia`) | entrada (F4, Ford, Vee) | 2014–hoje | 13 | 0 | 0 | 2014–2026 |
| F4 Britânica (`f4_brit`) | entrada (F4, Ford, Vee) | 2015–hoje | 12 | 0 | 0 | 2015–2026 |
| ADAC F4 (`f4_adac`) | entrada (F4, Ford, Vee) | 2015–2022 | 8 | 0 | 0 | 2015–2022 |
| F4 Espanhola (`f4_espanha`) | entrada (F4, Ford, Vee) | 2016–hoje | 11 | 0 | 0 | 2016–2026 |
| F4 Francesa (`f4_franca`) | entrada (F4, Ford, Vee) | 2011–hoje | 16 | 0 | 0 | 2011–2026 |
| F4 Japonesa (`f4_japao`) | entrada (F4, Ford, Vee) | 2015–hoje | 10 | 2 | 0 | 2015–2026 |
| F4 Chinesa (`f4_china`) | entrada (F4, Ford, Vee) | 2015–hoje | 11 | 0 | 1 | 2016–2026 |
| F4 dos Estados Unidos (`f4_eua`) | entrada (F4, Ford, Vee) | 2016–hoje | 11 | 0 | 0 | 2016–2026 |
| F4 NACAM (`f4_nacam`) | entrada (F4, Ford, Vee) | 2015–hoje | 11 | 0 | 1 | 2016–2026 |
| F4 CEZ (`f4_cez`) | entrada (F4, Ford, Vee) | 2017–hoje | 4 | 0 | 6 | 2023–2026 |
| F4 dos Emirados Árabes Unidos (`f4_uae`) | entrada (F4, Ford, Vee) | 2016–hoje | 10 | 0 | 1 | 2017–2026 |
| F4 do Oriente Médio (`f4_meio`) | entrada (F4, Ford, Vee) | 2024–hoje | 1 | 0 | 2 | 2025 |
| F4 Indiana (`f4_india`) | entrada (F4, Ford, Vee) | 2023–hoje | 0 | 0 | 4 | — |
| F4 do Sudeste Asiático (`f4_sea`) | entrada (F4, Ford, Vee) | 2016–2019 | 2 | 1 | 1 | 2017–2019 |
| F4 Australiana (`f4_australia`) | entrada (F4, Ford, Vee) | 2015–hoje | 6 | 0 | 6 | 2015–2019, 2024 |
| W Series (`w_series`) | regional | 2019–2022 | 3 | 0 | 0 | 2019, 2021–2022 |
| F1 Academy (`f1_academy`) | entrada (F4, Ford, Vee) | 2023–hoje | 4 | 0 | 0 | 2023–2026 |
| F4 Brasil (`f4_brasil`) | entrada (F4, Ford, Vee) | 2022–hoje | 5 | 0 | 0 | 2022–2026 |
| F4 Dinamarquesa (`f4_danish`) | entrada (F4, Ford, Vee) | 2017–hoje | 9 | 0 | 1 | 2017–2025 |
| F4 Holandesa / SMP F4 (`f4_neerlandesa`) | entrada (F4, Ford, Vee) | 2015–2018 | 4 | 0 | 0 | 2015–2018 |
| Fórmula Ford Britânica (`ff_brit`) | entrada (F4, Ford, Vee) | 1967–2015 | 10 | 0 | 39 | 2002–2004, 2008–2014 |
| Formula Ford Festival (`ff_festival`) | entrada (F4, Ford, Vee) | 1972–hoje | 0 | 0 | 55 | — |
| Fórmula Ford Brasil (`ff_brasil`) | entrada (F4, Ford, Vee) | 1971–1995 | 0 | 5 | 20 | 1977, 1992–1995 |
| Fórmula Vee Brasil (`fvee_brasil`) | entrada (F4, Ford, Vee) | 1964–1980 | 0 | 4 | 13 | 1971–1974 |
| Fórmula Vee (`fvee`) | entrada (F4, Ford, Vee) | 1963–hoje | 0 | 4 | 60 | 1971–1974 |
| Fórmula Super Vee (`super_vee`) | regional | 1970–1990 | 0 | 4 | 17 | 1971–1974 |
| Fórmula Opel / Lotus (`fopel`) | entrada (F4, Ford, Vee) | 1988–1997 | 0 | 0 | 10 | — |
| Fórmula Abarth (`fabarth`) | entrada (F4, Ford, Vee) | 2005–2013 | 4 | 0 | 5 | 2010–2013 |
| Fórmula Masters / ATS Formel 3 (`fmasters`) | F3 | 2007–2013 | 3 | 0 | 4 | 2007–2009 |
| Fórmula Júnior (`fjunior`) | regional | 1958–1963 | 0 | 0 | 6 | — |
| Fórmula 3 (500cc) (`f3_500`) | F3 | 1950–1960 | 0 | 0 | 11 | — |
| Fórmula Atlantic (`atlantic`) | F3 | 1974–2009 | 8 | 5 | 23 | 1974, 1991–1995, 2003–2009 |
| Barber Dodge Pro Series (`barber`) | regional | 1986–2003 | 3 | 15 | 0 | 1986–2003 |
| Fórmula Delta (`fdelta`) | entrada (F4, Ford, Vee) | 2017–hoje | 0 | 0 | 10 | — |
| IndyCar Series (`indy`) | topo mundial | 1996–hoje | 31 | 0 | 0 | 1996–2026 |
| CART / Champ Car (`cart`) | topo mundial | 1979–2007 | 29 | 0 | 0 | 1979–2007 |
| Campeonato Nacional da AAA (`aaa`) | topo mundial | 1950–1955 | 0 | 6 | 0 | 1950–1955 |
| USAC Championship Car (`usac`) | topo mundial | 1956–1979 | 10 | 14 | 0 | 1956–1979 |
| Indy Lights / INDY NXT (`indy_lights`) | F2 / topo nacional | 1986–hoje | 31 | 0 | 10 | 1996–2026 |
| Star Mazda / Indy Pro 2000 / USF Pro 2000 (`ip2000`) | regional | 1991–hoje | 18 | 2 | 16 | 2007–2026 |
| USF2000 (`usf2000`) | entrada (F4, Ford, Vee) | 1990–hoje | 17 | 9 | 11 | 1990–1992, 1994–1995, 1997, 2004–2006, 2010–2026 |
| USF Juniors (`usf_juniors`) | entrada (F4, Ford, Vee) | 2022–hoje | 5 | 0 | 0 | 2022–2026 |
| NASCAR Cup Series (`nascar_cup`) | topo mundial | 1949–hoje | 51 | 10 | 17 | 1950–1954, 1963, 1971, 1973–2026 |
| NASCAR Xfinity Series (`nascar_xfinity`) | F2 / topo nacional | 1982–hoje | 34 | 4 | 7 | 1988–2025 |
| NASCAR Truck Series (`nascar_truck`) | F3 | 1995–hoje | 31 | 0 | 1 | 1996–2026 |
| ARCA Menards Series (`arca`) | F3 | 1953–hoje | 18 | 11 | 45 | 1998–2026 |
| Stock Car Brasil (`stock_car`) | topo mundial | 1979–hoje | 30 | 3 | 15 | 1979–1983, 1985–1986, 2001–2026 |
| Stock Light / Stock Series (`stock_light`) | F2 / topo nacional | 1993–hoje | 26 | 0 | 8 | 2001–2026 |
| Turismo Nacional (`turismo_nac`) | F3 | 2021–hoje | 0 | 0 | 6 | — |
| Porsche Carrera Cup Brasil (`porsche_br`) | F3 | 2005–hoje | 0 | 0 | 22 | — |
| Brasileiro de Marcas e Pilotos (`marcas_br`) | F3 | 1984–2014 | 0 | 0 | 31 | — |
| Porsche Supercup (`porsche_supercup`) | F3 | 1993–hoje | 26 | 0 | 8 | 2001–2026 |
| DTM (`dtm`) | topo mundial | 1984–hoje | 34 | 1 | 8 | 1986, 1990–1996, 2000–2026 |
| BTCC (`btcc`) | F2 / topo nacional | 1958–hoje | 47 | 1 | 21 | 1963, 1969, 1981–2026 |
| WTCC / WTCR (`wtcc`) | F2 / topo nacional | 2005–2022 | 18 | 0 | 0 | 2005–2022 |
| TCR World Tour (`tcr_world`) | F2 / topo nacional | 2023–hoje | 4 | 0 | 0 | 2023–2026 |
| TCR South America (`tcr_sa`) | F3 | 2021–hoje | 6 | 0 | 0 | 2021–2026 |
| Campeonato Europeu de Turismo (`etcc`) | F2 / topo nacional | 1963–2004 | 6 | 1 | 35 | 1977, 1986, 2000–2004 |
| Supercars (`supercars`) | topo mundial | 1960–hoje | 52 | 14 | 1 | 1961–2026 |
| Super GT / JGTC (`super_gt`) | topo mundial | 1993–hoje | 34 | 0 | 0 | 1993–2026 |
| FIA GT (`fia_gt`) | F2 / topo nacional | 1997–2012 | 16 | 0 | 0 | 1997–2012 |
| GT World Challenge Europe (`gtwc_europe`) | F2 / topo nacional | 2011–hoje | 8 | 0 | 8 | 2019–2026 |
| GT World Challenge America (`gtwc_america`) | F2 / topo nacional | 1990–hoje | 8 | 0 | 29 | 2019–2026 |
| British GT (`british_gt`) | F3 | 1993–hoje | 25 | 1 | 8 | 1998–2000, 2004–2026 |
| International GT Open (`gt_open`) | F3 | 2006–hoje | 16 | 2 | 3 | 2009–2026 |
| FIA WEC (`wec`) | topo mundial | 2012–hoje | 14 | 0 | 1 | 2012–2017, 2019–2026 |
| Mundial de Sport (WSC, Marcas, WEC, WSPC) (`wsc`) | topo mundial | 1953–1992 | 11 | 0 | 29 | 1967, 1983–1992 |
| ELMS (`elms`) | F2 / topo nacional | 2004–hoje | 18 | 5 | 0 | 2004–2026 |
| Asian Le Mans Series (`asian_lms`) | F2 / topo nacional | 2009–hoje | 13 | 0 | 5 | 2013–2014, 2016–2026 |
| IMSA (`imsa`) | topo mundial | 1971–hoje | 15 | 2 | 39 | 1991, 1993–1994, 1998, 2014–2026 |
| American Le Mans Series (`alms`) | F2 / topo nacional | 1999–2013 | 15 | 0 | 0 | 1999–2013 |
| Grand-Am (`grand_am`) | F2 / topo nacional | 2000–2013 | 8 | 2 | 4 | 2004–2013 |
| Can-Am (`canam`) | F2 / topo nacional | 1966–1987 | 8 | 2 | 12 | 1966–1974, 1979 |
| Fórmula E (`fe`) | topo mundial | 2014–hoje | 12 | 0 | 1 | 2015–2026 |
| Campeonato Mundial de Kart FIA (`kart_mundial`) | kart | 1964–hoje | 0 | 0 | 63 | — |
| Campeonato Europeu de Kart FIA (`kart_europeu`) | kart | 1972–hoje | 0 | 0 | 55 | — |
| WSK Super Master Series (`wsk_super`) | kart | 2010–hoje | 0 | 0 | 17 | — |
| WSK Euro Series (`wsk_euro`) | kart | 2009–hoje | 0 | 0 | 18 | — |
| Champions of the Future (`cotf`) | kart | 2020–hoje | 0 | 0 | 7 | — |
| Campeonato Brasileiro de Kart (`kart_brasil`) | kart | 1960–hoje | 0 | 0 | 67 | — |
| Copa Brasil de Kart (`copa_brasil_kart`) | kart | 1985–hoje | 0 | 0 | 42 | — |

## Pendências: temporadas sem página própria na Wikipedia em inglês

- **Fórmula 3000 Britânica:** 1992–1996
- **Fórmula 3000 Italiana / Euro F3000:** 1999–2009
- **A1 Grand Prix:** 2005
- **Fórmula 2 Japonesa / F3000 Japonesa:** 1973–1995
- **Fórmula 3 Britânica:** 1951–1961, 1965–1967, 1971
- **Fórmula 3 Alemã:** 1950–1970
- **Fórmula 3 Italiana:** 1964–1978, 1980–1983, 1985–2001
- **Fórmula 3 Japonesa:** 1979–1999
- **Fórmula 3 Sul-Americana:** 1987–2007
- **Fórmula 3 Brasil:** 2014–2017
- **Eurocup Fórmula Renault 2.0:** 1991–1999, 2003
- **Fórmula Renault Britânica:** 1989–1999
- **Fórmula Renault Brasil:** 2002–2006
- **Fórmula Regional Indiana:** 2023–2026
- **Fórmula BMW ADAC:** 1991–2001
- **F4 Chinesa:** 2015
- **F4 NACAM:** 2015
- **F4 CEZ:** 2017–2022
- **F4 dos Emirados Árabes Unidos:** 2016
- **F4 do Oriente Médio:** 2024, 2026
- **F4 Indiana:** 2023–2026
- **F4 do Sudeste Asiático:** 2016
- **F4 Australiana:** 2020–2023, 2025–2026
- **F4 Dinamarquesa:** 2026
- **Fórmula Ford Britânica:** 1967–2001, 2005–2007, 2015
- **Formula Ford Festival:** 1972–2026
- **Fórmula Ford Brasil:** 1988
- **Fórmula Vee Brasil:** 1964–1970, 1975–1980
- **Fórmula Vee:** 1963–1970, 1975–2026
- **Fórmula Super Vee:** 1970, 1975–1990
- **Fórmula Opel / Lotus:** 1988–1997
- **Fórmula Abarth:** 2005–2009
- **Fórmula Masters / ATS Formel 3:** 2010–2013
- **Fórmula Júnior:** 1958–1963
- **Fórmula 3 (500cc):** 1950–1960
- **Fórmula Atlantic:** 1979–1982, 1984–1990
- **Fórmula Delta:** 2017–2026
- **Star Mazda / Indy Pro 2000 / USF Pro 2000:** 1991–2006
- **USF2000:** 1993, 1996, 1998–2003, 2007–2009
- **NASCAR Cup Series:** 1949, 1958, 1962, 1964, 1967–1969
- **NASCAR Xfinity Series:** 1982–1987, 2026
- **NASCAR Truck Series:** 1995
- **ARCA Menards Series:** 1953–1997
- **Stock Car Brasil:** 1984, 1987–2000
- **Stock Light / Stock Series:** 1993–2000
- **Turismo Nacional:** 2021–2026
- **Porsche Carrera Cup Brasil:** 2005–2026
- **Brasileiro de Marcas e Pilotos:** 1984–2014
- **Porsche Supercup:** 1993–2000
- **DTM:** 1997–1999
- **Campeonato Europeu de Turismo:** 1964–1976, 1978–1985, 1988–1999
- **GT World Challenge Europe:** 2011–2018
- **GT World Challenge America:** 1990–2018
- **British GT:** 1993–1997, 2001–2003
- **FIA WEC:** 2018
- **Asian Le Mans Series:** 2009–2012, 2015
- **IMSA:** 1999–2013
- **Grand-Am:** 2000–2001
- **Can-Am:** 1975–1976
- **Fórmula E:** 2014
- **Campeonato Mundial de Kart FIA:** 1964–2026
- **Campeonato Europeu de Kart FIA:** 1972–2026
- **WSK Super Master Series:** 2010–2026
- **WSK Euro Series:** 2009–2026
- **Champions of the Future:** 2020–2026
- **Campeonato Brasileiro de Kart:** 1960–2026
- **Copa Brasil de Kart:** 1985–2026

## Alertas da validação (253)

- `a1gp` 2006: 24 pilotos sem nacionalidade legível
- `a1gp` 2007: 30 pilotos sem nacionalidade legível
- `a1gp` 2008: 18 pilotos sem nacionalidade legível
- `a1gp` 2009: 13 pilotos sem nacionalidade legível
- `f3_alema` 2013: 7 pilotos sem nacionalidade legível
- `euroformula` 2025: 4 pilotos sem nacionalidade legível
- `froc` 2022: só 1 pilotos na lista de inscritos
- `f4_japao` 2018: 34 pilotos sem nacionalidade legível
- `f4_japao` 2022: 38 pilotos sem nacionalidade legível
- `f4_japao` 2023: 45 pilotos sem nacionalidade legível
- `f4_china` 2025: 5 pilotos sem nacionalidade legível
- `f4_australia` 2015: 13 pilotos sem nacionalidade legível
- `f4_australia` 2016: 10 pilotos sem nacionalidade legível
- `f4_danish` 2019: 18 pilotos sem nacionalidade legível
- `ff_brasil` 1977: 10 pilotos sem nacionalidade legível
- `atlantic` 1974: 54 pilotos sem nacionalidade legível
- `atlantic` 1996: campeão "Patrick Carpentier" não está na lista lida
- `atlantic` 1997: campeão "Alex Barron" não está na lista lida
- `atlantic` 1998: campeão "Lee Bentham" não está na lista lida
- `atlantic` 1999: campeão "Anthony Lazzaro" não está na lista lida
- `atlantic` 2000: campeão "Buddy Rice" não está na lista lida
- `atlantic` 2001: campeão "Hoover Orsi" não está na lista lida
- `atlantic` 2002: campeão "Jon Fogarty" não está na lista lida
- `barber` 1987: 4 pilotos sem nacionalidade legível
- `nascar_cup` 1950: 60 pilotos sem nacionalidade legível
- `nascar_cup` 1951: 9 pilotos sem nacionalidade legível
- `nascar_cup` 1952: 19 pilotos sem nacionalidade legível
- `nascar_cup` 1953: 17 pilotos sem nacionalidade legível
- `nascar_cup` 1954: 343 pilotos: lista grande demais, conferir a tabela lida
- `nascar_cup` 1954: 337 pilotos sem nacionalidade legível
- `nascar_cup` 1971: 28 pilotos sem nacionalidade legível
- `nascar_cup` 1973: 130 pilotos sem nacionalidade legível
- `nascar_cup` 1974: 140 pilotos sem nacionalidade legível
- `nascar_cup` 1975: 126 pilotos sem nacionalidade legível
- `nascar_cup` 1976: 144 pilotos sem nacionalidade legível
- `nascar_cup` 1977: 137 pilotos sem nacionalidade legível
- `nascar_cup` 1978: 149 pilotos sem nacionalidade legível
- `nascar_cup` 1979: 158 pilotos sem nacionalidade legível
- `nascar_cup` 1980: 138 pilotos sem nacionalidade legível
- `nascar_cup` 1981: 120 pilotos sem nacionalidade legível
- `nascar_cup` 1982: 129 pilotos sem nacionalidade legível
- `nascar_cup` 1983: 131 pilotos sem nacionalidade legível
- `nascar_cup` 1984: 136 pilotos sem nacionalidade legível
- `nascar_cup` 1985: 146 pilotos sem nacionalidade legível
- `nascar_cup` 1986: 156 pilotos sem nacionalidade legível
- `nascar_cup` 1987: 150 pilotos sem nacionalidade legível
- `nascar_cup` 1988: 157 pilotos sem nacionalidade legível
- `nascar_cup` 1989: 140 pilotos sem nacionalidade legível
- `nascar_cup` 1990: 141 pilotos sem nacionalidade legível
- `nascar_cup` 1991: 131 pilotos sem nacionalidade legível
- `nascar_cup` 1992: 115 pilotos sem nacionalidade legível
- `nascar_cup` 1993: 118 pilotos sem nacionalidade legível
- `nascar_cup` 1994: 132 pilotos sem nacionalidade legível
- `nascar_cup` 1995: 112 pilotos sem nacionalidade legível
- `nascar_cup` 1996: 100 pilotos sem nacionalidade legível
- `nascar_cup` 1997: 84 pilotos sem nacionalidade legível
- `nascar_cup` 1998: 102 pilotos sem nacionalidade legível
- `nascar_cup` 1999: 98 pilotos sem nacionalidade legível
- `nascar_cup` 2000: 79 pilotos sem nacionalidade legível
- `nascar_cup` 2001: 72 pilotos sem nacionalidade legível
- `nascar_cup` 2002: 90 pilotos sem nacionalidade legível
- `nascar_cup` 2003: 80 pilotos sem nacionalidade legível
- `nascar_cup` 2004: 101 pilotos sem nacionalidade legível
- `nascar_cup` 2005: 108 pilotos sem nacionalidade legível
- `nascar_cup` 2006: 97 pilotos sem nacionalidade legível
- `nascar_cup` 2007: 83 pilotos sem nacionalidade legível
- `nascar_cup` 2008: 89 pilotos sem nacionalidade legível
- `nascar_cup` 2009: 70 pilotos sem nacionalidade legível
- `nascar_cup` 2010: 64 pilotos sem nacionalidade legível
- `nascar_cup` 2011: 71 pilotos sem nacionalidade legível
- `nascar_cup` 2012: 68 pilotos sem nacionalidade legível
- `nascar_cup` 2013: 63 pilotos sem nacionalidade legível
- `nascar_cup` 2014: 65 pilotos sem nacionalidade legível
- `nascar_cup` 2015: 68 pilotos sem nacionalidade legível
- `nascar_cup` 2016: 54 pilotos sem nacionalidade legível
- `nascar_cup` 2017: 60 pilotos sem nacionalidade legível
- `nascar_cup` 2018: 66 pilotos sem nacionalidade legível
- `nascar_cup` 2019: 59 pilotos sem nacionalidade legível
- `nascar_cup` 2020: 48 pilotos sem nacionalidade legível
- `nascar_cup` 2021: 59 pilotos sem nacionalidade legível
- `nascar_cup` 2022: 53 pilotos sem nacionalidade legível
- `nascar_cup` 2023: 54 pilotos sem nacionalidade legível
- `nascar_cup` 2024: 53 pilotos sem nacionalidade legível
- `nascar_cup` 2025: 52 pilotos sem nacionalidade legível
- `nascar_cup` 2026: 50 pilotos sem nacionalidade legível
- `nascar_xfinity` 1988: 163 pilotos sem nacionalidade legível
- `nascar_xfinity` 1989: 106 pilotos sem nacionalidade legível
- `nascar_xfinity` 1990: 176 pilotos sem nacionalidade legível
- `nascar_xfinity` 1991: 127 pilotos sem nacionalidade legível
- `nascar_xfinity` 1992: 133 pilotos sem nacionalidade legível
- `nascar_xfinity` 1993: 139 pilotos sem nacionalidade legível
- `nascar_xfinity` 1994: 159 pilotos sem nacionalidade legível
- `nascar_xfinity` 1995: 155 pilotos sem nacionalidade legível
- `nascar_xfinity` 1996: 136 pilotos sem nacionalidade legível
- `nascar_xfinity` 1997: 142 pilotos sem nacionalidade legível
- `nascar_xfinity` 1998: 156 pilotos sem nacionalidade legível
- `nascar_xfinity` 1999: 174 pilotos sem nacionalidade legível
- `nascar_xfinity` 2000: 160 pilotos sem nacionalidade legível
- `nascar_xfinity` 2001: 170 pilotos sem nacionalidade legível
- `nascar_xfinity` 2002: 160 pilotos sem nacionalidade legível
- `nascar_xfinity` 2003: 176 pilotos sem nacionalidade legível
- `nascar_xfinity` 2004: 188 pilotos sem nacionalidade legível
- `nascar_xfinity` 2005: 167 pilotos sem nacionalidade legível
- `nascar_xfinity` 2006: 159 pilotos sem nacionalidade legível
- `nascar_xfinity` 2007: 138 pilotos sem nacionalidade legível
- `nascar_xfinity` 2008: 142 pilotos sem nacionalidade legível
- `nascar_xfinity` 2009: 142 pilotos sem nacionalidade legível
- `nascar_xfinity` 2010: 137 pilotos sem nacionalidade legível
- `nascar_xfinity` 2011: 125 pilotos sem nacionalidade legível
- `nascar_xfinity` 2012: 129 pilotos sem nacionalidade legível
- `nascar_xfinity` 2013: 114 pilotos sem nacionalidade legível
- `nascar_xfinity` 2014: 111 pilotos sem nacionalidade legível
- `nascar_xfinity` 2015: 112 pilotos sem nacionalidade legível
- `nascar_xfinity` 2016: 118 pilotos sem nacionalidade legível
- `nascar_xfinity` 2017: 106 pilotos sem nacionalidade legível
- `nascar_xfinity` 2018: 106 pilotos sem nacionalidade legível
- `nascar_xfinity` 2019: 104 pilotos sem nacionalidade legível
- `nascar_xfinity` 2020: 82 pilotos sem nacionalidade legível
- `nascar_xfinity` 2021: 103 pilotos sem nacionalidade legível
- `nascar_xfinity` 2022: 108 pilotos sem nacionalidade legível
- `nascar_xfinity` 2023: 115 pilotos sem nacionalidade legível
- `nascar_xfinity` 2024: 102 pilotos sem nacionalidade legível
- `nascar_xfinity` 2025: 97 pilotos sem nacionalidade legível
- `nascar_truck` 1996: 144 pilotos sem nacionalidade legível
- `nascar_truck` 1997: 59 pilotos sem nacionalidade legível
- `nascar_truck` 1998: 132 pilotos sem nacionalidade legível
- `nascar_truck` 1999: 114 pilotos sem nacionalidade legível
- `nascar_truck` 2000: 131 pilotos sem nacionalidade legível
- `nascar_truck` 2001: 131 pilotos sem nacionalidade legível
- `nascar_truck` 2002: 127 pilotos sem nacionalidade legível
- `nascar_truck` 2003: 152 pilotos sem nacionalidade legível
- `nascar_truck` 2004: 132 pilotos sem nacionalidade legível
- `nascar_truck` 2005: 115 pilotos sem nacionalidade legível
- `nascar_truck` 2006: 98 pilotos sem nacionalidade legível
- `nascar_truck` 2007: 118 pilotos sem nacionalidade legível
- `nascar_truck` 2008: 110 pilotos sem nacionalidade legível
- `nascar_truck` 2009: 117 pilotos sem nacionalidade legível
- `nascar_truck` 2010: 125 pilotos sem nacionalidade legível
- `nascar_truck` 2011: 116 pilotos sem nacionalidade legível
- `nascar_truck` 2012: 109 pilotos sem nacionalidade legível
- `nascar_truck` 2013: 119 pilotos sem nacionalidade legível
- `nascar_truck` 2014: 107 pilotos sem nacionalidade legível
- `nascar_truck` 2015: 111 pilotos sem nacionalidade legível
- `nascar_truck` 2016: 115 pilotos sem nacionalidade legível
- `nascar_truck` 2017: 105 pilotos sem nacionalidade legível
- `nascar_truck` 2018: 126 pilotos sem nacionalidade legível
- `nascar_truck` 2019: 113 pilotos sem nacionalidade legível
- `nascar_truck` 2020: 92 pilotos sem nacionalidade legível
- `nascar_truck` 2021: 121 pilotos sem nacionalidade legível
- `nascar_truck` 2022: 115 pilotos sem nacionalidade legível
- `nascar_truck` 2023: 117 pilotos sem nacionalidade legível
- `nascar_truck` 2024: 87 pilotos sem nacionalidade legível
- `nascar_truck` 2025: 100 pilotos sem nacionalidade legível
- `nascar_truck` 2026: 119 pilotos sem nacionalidade legível
- `arca` 1998: 179 pilotos sem nacionalidade legível
- `arca` 1999: 167 pilotos sem nacionalidade legível
- `arca` 2000: 170 pilotos sem nacionalidade legível
- `arca` 2001: 204 pilotos: lista grande demais, conferir a tabela lida
- `arca` 2001: 193 pilotos sem nacionalidade legível
- `arca` 2002: 182 pilotos sem nacionalidade legível
- `arca` 2003: 213 pilotos: lista grande demais, conferir a tabela lida
- `arca` 2003: 204 pilotos sem nacionalidade legível
- `arca` 2004: 211 pilotos: lista grande demais, conferir a tabela lida
- `arca` 2004: 205 pilotos sem nacionalidade legível
- `arca` 2005: 204 pilotos: lista grande demais, conferir a tabela lida
- `arca` 2005: 198 pilotos sem nacionalidade legível
- `arca` 2006: 185 pilotos sem nacionalidade legível
- `arca` 2007: 204 pilotos: lista grande demais, conferir a tabela lida
- `arca` 2007: 191 pilotos sem nacionalidade legível
- `arca` 2008: 174 pilotos sem nacionalidade legível
- `arca` 2009: 158 pilotos sem nacionalidade legível
- `arca` 2010: 153 pilotos sem nacionalidade legível
- `arca` 2011: 169 pilotos sem nacionalidade legível
- `arca` 2012: 159 pilotos sem nacionalidade legível
- `arca` 2013: 140 pilotos sem nacionalidade legível
- `arca` 2014: 149 pilotos sem nacionalidade legível
- `arca` 2015: 156 pilotos sem nacionalidade legível
- `arca` 2016: 145 pilotos sem nacionalidade legível
- `arca` 2017: 124 pilotos sem nacionalidade legível
- `arca` 2018: 107 pilotos sem nacionalidade legível
- `arca` 2019: 82 pilotos sem nacionalidade legível
- `arca` 2020: 89 pilotos sem nacionalidade legível
- `arca` 2021: 116 pilotos sem nacionalidade legível
- `arca` 2022: 124 pilotos sem nacionalidade legível
- `arca` 2023: 114 pilotos sem nacionalidade legível
- `arca` 2024: 119 pilotos sem nacionalidade legível
- `arca` 2025: 146 pilotos sem nacionalidade legível
- `arca` 2026: 145 pilotos sem nacionalidade legível
- `stock_car` 1979: 36 pilotos sem nacionalidade legível
- `stock_car` 1980: 40 pilotos sem nacionalidade legível
- `stock_car` 1981: 34 pilotos sem nacionalidade legível
- `stock_car` 1982: 40 pilotos sem nacionalidade legível
- `stock_car` 1983: 42 pilotos sem nacionalidade legível
- `stock_car` 1986: 38 pilotos sem nacionalidade legível
- `stock_car` 2001: 27 pilotos sem nacionalidade legível
- `stock_car` 2002: 27 pilotos sem nacionalidade legível
- `stock_car` 2003: 22 pilotos sem nacionalidade legível
- `stock_car` 2006: 30 pilotos sem nacionalidade legível
- `stock_car` 2007: 31 pilotos sem nacionalidade legível
- `stock_car` 2008: 14 pilotos sem nacionalidade legível
- `stock_car` 2009: 20 pilotos sem nacionalidade legível
- `stock_car` 2010: 10 pilotos sem nacionalidade legível
- `stock_car` 2011: 13 pilotos sem nacionalidade legível
- `stock_car` 2012: 14 pilotos sem nacionalidade legível
- `stock_car` 2013: 11 pilotos sem nacionalidade legível
- `stock_car` 2024: 5 pilotos sem nacionalidade legível
- `stock_light` 2001: 27 pilotos sem nacionalidade legível
- `stock_light` 2002: 27 pilotos sem nacionalidade legível
- `stock_light` 2003: 22 pilotos sem nacionalidade legível
- `stock_light` 2006: 28 pilotos sem nacionalidade legível
- `stock_light` 2007: 29 pilotos sem nacionalidade legível
- `stock_light` 2008: 12 pilotos sem nacionalidade legível
- `stock_light` 2009: 18 pilotos sem nacionalidade legível
- `stock_light` 2010: 8 pilotos sem nacionalidade legível
- `stock_light` 2011: 11 pilotos sem nacionalidade legível
- `stock_light` 2012: 12 pilotos sem nacionalidade legível
- `stock_light` 2013: 8 pilotos sem nacionalidade legível
- `supercars` 1969: 13 pilotos sem nacionalidade legível
- `supercars` 1970: 11 pilotos sem nacionalidade legível
- `supercars` 1971: 9 pilotos sem nacionalidade legível
- `supercars` 1972: 25 pilotos sem nacionalidade legível
- `supercars` 1973: 64 pilotos sem nacionalidade legível
- `supercars` 1974: 56 pilotos sem nacionalidade legível
- `supercars` 1975: 69 pilotos sem nacionalidade legível
- `supercars` 1976: 90 pilotos sem nacionalidade legível
- `supercars` 1977: 127 pilotos sem nacionalidade legível
- `supercars` 1978: 31 pilotos sem nacionalidade legível
- `supercars` 1979: 43 pilotos sem nacionalidade legível
- `supercars` 1980: 22 pilotos sem nacionalidade legível
- `supercars` 1981: 38 pilotos sem nacionalidade legível
- `supercars` 1982: 21 pilotos sem nacionalidade legível
- `supercars` 1983: 33 pilotos sem nacionalidade legível
- `supercars` 1984: 43 pilotos sem nacionalidade legível
- `supercars` 1985: 23 pilotos sem nacionalidade legível
- `supercars` 1986: 27 pilotos sem nacionalidade legível
- `supercars` 1987: 20 pilotos sem nacionalidade legível
- `supercars` 1988: 10 pilotos sem nacionalidade legível
- `supercars` 1989: 5 pilotos sem nacionalidade legível
- `supercars` 1990: 4 pilotos sem nacionalidade legível
- `supercars` 1991: 4 pilotos sem nacionalidade legível
- `supercars` 1992: 20 pilotos sem nacionalidade legível
- `supercars` 1993: 12 pilotos sem nacionalidade legível
- `supercars` 1994: 5 pilotos sem nacionalidade legível
- `supercars` 1995: 9 pilotos sem nacionalidade legível
- `supercars` 1996: 6 pilotos sem nacionalidade legível
- `supercars` 1997: 20 pilotos sem nacionalidade legível
- `supercars` 2000: 40 pilotos sem nacionalidade legível
- `supercars` 2002: 19 pilotos sem nacionalidade legível
- `british_gt` 2016: 10 pilotos sem nacionalidade legível
- `asian_lms` 2013: 8 pilotos sem nacionalidade legível
- `asian_lms` 2016: 6 pilotos sem nacionalidade legível
- `asian_lms` 2017: 4 pilotos sem nacionalidade legível
- `canam` 1979: 72 pilotos sem nacionalidade legível

## Auditoria das escalações do jogo contra a fonte (62)

O jogo põe o piloto na equipe da coluna "jogo"; a Wikipedia o lista inscrito pela equipe da última coluna. Nem toda linha é erro do jogo (o jogo resume cada temporada em equipes e pilotos principais), mas cada uma merece conferência.

| Série | Ano | Piloto (jogo) | Equipe no jogo | Na Wikipedia |
|---|---|---|---|---|
| f1 | 1951 | Gerard | BRM | Bob Gerard |
| f1 | 1952 | Salvadori | Connaught | G. Caprara |
| f1 | 1952 | Rosier | Talbot-Lago | Écurie Rosier |
| f1 | 1953 | Rosier | Talbot-Lago | Ecurie Rosier |
| f1 | 1954 | Schell | Vanwall | Officine Alfieri Maserati / Harry Schell |
| f1 | 1954 | Salvadori | Connaught | Gilby Engineering |
| f1 | 1955 | Salvadori | Connaught | Gilby Engineering |
| f1 | 1956 | Salvadori | Connaught | Gilby Engineering |
| f1 | 1956 | Bonnier | Cooper | Officine Alfieri Maserati |
| f1 | 1956 | Musso | Kurtis Kraft | Scuderia Ferrari |
| f1 | 1957 | Bonnier | Porsche | Scuderia Centro Sud / Jo Bonnier |
| f1 | 1957 | Gregory | BRM | Scuderia Centro Sud |
| f1 | 1958 | Gregory | Porsche | H.H. Gould / Scuderia Centro Sud / Temple Buell |
| f1 | 1960 | Bianchi | Scuderia Centro Sud | Fred Tuck Cars / Equipe Nationale Belge |
| f1 | 1961 | Bianchi | Scuderia Centro Sud | Equipe Nationale Belge / UDT Laystall Racing Team |
| f1 | 1962 | Siffert | Rob Walker | Ecurie Nationale Suisse / Ecurie Filipinetti |
| f1 | 1963 | Bianchi | Scirocco | Reg Parnell Racing |
| f1 | 1963 | Siffert | Rob Walker | Siffert Racing Team |
| f1 | 1969 | Courage | Parnell | Frank Williams Racing Cars |
| f1 | 1973 | Beuttler | Ensign | Clarke-Mordaunt-Guthrie Racing / Team Pierre Robert |
| f1 | 1974 | Watson | Surtees | John Goldie Racing with Hexagon / John Goldie Racing with Radio Luxembourg / Allied Polymer Group |
| f1 | 1974 | Schenken | Ensign | John Player Team Lotus / Trojan-Tauranac Racing |
| f1 | 1976 | Ribeiro | Ensign | Hesketh Racing / Penthouse Rizla+. Racing with Hesketh |
| f1 | 1977 | Tambay | McLaren | Durex Team Surtees / Beta Team Surtees / Team Tissot Ensign with Castrol / Theodore Racing Hong Kong |
| f1 | 1977 | Fittipaldi | Copersucar | Fittipaldi Automotive |
| f1 | 1977 | Merzario | Williams | Ambrosio Shadow Racing / Ambrosio Tabatip Shadow Racing / Ambrosio Villiger Shadow Racing / Team Merzario |
| f1 | 1978 | Fittipaldi | Copersucar | Fittipaldi Automotive |
| f1 | 1978 | Rebaque | Hesketh | Team Rebaque |
| f1 | 1978 | Merzario | Williams | Team Merzario |
| f1 | 1979 | Fittipaldi | Copersucar | Fittipaldi Automotive |
| f1 | 1981 | Salazar | ATS | Ensign Racing / March Grand Prix Team / Guinness RIzla+. March |
| f1 | 2006 | Monteiro | Midland | MF1 Racing |
| f1 | 2006 | Albers | Midland | MF1 Racing |
| indy | 1996 | Fernández | Galles Racing | Tasman Motorsports Group |
| indy | 1996 | Papis | All American Racers | Arciero-Wells Racing |
| indy | 1997 | Fernández | All American Racers | Tasman Motorsports |
| indy | 1997 | Franchitti | Team Green | Hogan Racing |
| indy | 1998 | Papis | Payton/Coyne | Arciero-Wells Racing |
| indy | 2000 | Hornish Jr. | Panther | ? |
| indy | 2000 | Sharp | Foyt | ? |
| indy | 2000 | Fernández | Forsythe | Patrick Racing |
| indy | 2001 | Sharp | Foyt | Kelley Racing |
| indy | 2001 | M. Andretti | Newman/Haas | Team Motorola |
| indy | 2001 | Fernández | Forsythe | Fernández Racing |
| indy | 2002 | Sharp | Foyt | Kelley Racing |
| indy | 2002 | Meira | Dreyer & Reinbold | Team Menard |
| indy | 2002 | Fernández | Forsythe | Fernández Racing |
| indy | 2003 | Meira | Foyt | Team Menard |
| indy | 2003 | Fernández | Forsythe | Fernández Racing |
| indy | 2004 | Fernández | Forsythe | Fernández Racing |
| indy | 2005 | Sharp | Dreyer & Reinbold | Aguri-Fernández Racing / Delphi Fernández Racing |
| indy | 2006 | Rice | Rahal Letterman | Forsythe Championship Racing |
| indy | 2006 | Scheckter | Dreyer & Reinbold | Vision Racing |
| indy | 2008 | Junqueira | Foyt | Dale Coyne Racing |
| indy | 2009 | Junqueira | Foyt | Conquest Racing |
| indy | 2009 | Matos | Dreyer & Reinbold | Luczo-Dragon Racing |
| indy | 2009 | Rahal | Vision | Newman/Haas/Lanigan Racing |
| indy | 2010 | Rahal | Dale Coyne | Dreyer & Reinbold Racing / Newman/Haas Racing / Newman/Haas/Lanigan Racing / Rahal Letterman Racing / Sarah Fisher Racing / Newman/Haas Racing |
| indy | 2015 | Newgarden | Ed Carpenter | CFH Racing |
| indy | 2018 | Chilton | Dale Coyne | Carlin |
| indy | 2018 | Kimball | A.J. Foyt | Carlin |
| indy | 2025 | Ilott | Juncos Hollinger | PREMA Racing |

## Nomes de país não reconhecidos

- surrender: 74
- Chinese Taipei for Olympic Games: 59
- North Carolina: 18
- State of Georgia: 12
- Guyana: 11
- Ohio: 9
- Saint Kitts and Nevis: 9
- Rhodesia and Nyasaland: 8
- New Jersey: 8
- New York: 7
- Florida: 6
- Kosovo: 4
- Pennsylvania: 4
- Antigua and Barbuda: 3
- Virginia: 3
- California: 3
- Russian Automobile Federation: 2
- South Carolina: 2
- Côte d'Ivoire: 2
- Grenada: 2
- Rwanda: 1
- Wisconsin: 1
- Louisiana: 1
- West Virginia: 1
- United States Virgin Islands: 1

## Anos de teste

Cada degrau da escada de cada carreira do jogo (resolvida para um piloto britânico; outras nacionalidades trocam os degraus nacionais), o campeonato real que ele representa e o que o banco tem daquela temporada. **L** lista de inscritos · **C** só classificação · **—** sem fonte (o grid é simulado).

### 1950

- **Fórmula 1:** Corridas Regionais (sem campeonato no catálogo) · Corridas Nacionais (sem campeonato no catálogo) · Fórmula 3 (500cc) (sem campeonato no catálogo) · Fórmula 2 (sem campeonato no catálogo) · Fórmula 1 → `f1` (L, 91 pilotos)
- **IndyCar:** Corridas de Bairro (sem campeonato no catálogo) · Corridas Regionais (sem campeonato no catálogo) · Midgets (sem campeonato no catálogo) · Sprint Cars (sem campeonato no catálogo) · IndyCar → `aaa` (C, 137 pilotos)
- **NASCAR:** Corridas de Terra (sem campeonato no catálogo) · Corridas Regionais (sem campeonato no catálogo) · Modificados (sem campeonato no catálogo) · Sportsman (sem campeonato no catálogo) · NASCAR Cup → `nascar_cup` (C, 65 pilotos)

### 1960

- **Fórmula 1:** Kart Regional (sem campeonato no catálogo) · Britânico de Kart (sem campeonato no catálogo) · Fórmula Júnior → `fjunior` (—) · Fórmula 2 (sem campeonato no catálogo) · Fórmula 1 → `f1` (L, 91 pilotos)
- **IndyCar:** Kart Regional (sem campeonato no catálogo) · Britânico de Kart (sem campeonato no catálogo) · Midgets (sem campeonato no catálogo) · Sprint Cars (sem campeonato no catálogo) · IndyCar → `usac` (C, 89 pilotos)
- **Endurance:** Corridas Regionais (sem campeonato no catálogo) · Corridas Nacionais (sem campeonato no catálogo) · Turismo (sem campeonato no catálogo) · Sport Nacional (sem campeonato no catálogo) · Mundial de Sport → `wsc` (—)
- **NASCAR:** Corridas de Terra (sem campeonato no catálogo) · Corridas Regionais (sem campeonato no catálogo) · Modificados (sem campeonato no catálogo) · Sportsman (sem campeonato no catálogo) · NASCAR Cup → `nascar_cup` (—)

### 1975

- **Fórmula 1:** Kart Regional (sem campeonato no catálogo) · Britânico de Kart (sem campeonato no catálogo) · Mundial de Kart → `kart_mundial` (—) · Fórmula Ford Britânica → `ff_brit` (—) · Fórmula 3 → `f3_euro_7584` (C, 24 pilotos) · Fórmula 2 → `euro_f2` (C, 26 pilotos) · Fórmula 1 → `f1` (L, 52 pilotos)
- **IndyCar:** Kart Regional (sem campeonato no catálogo) · Britânico de Kart (sem campeonato no catálogo) · Mundial de Kart → `kart_mundial` (—) · Fórmula Ford Britânica → `ff_brit` (—) · Super Vee → `super_vee` (—) · Fórmula Atlantic → `atlantic` (—) · IndyCar → `usac` (L, 65 pilotos)
- **Endurance:** Kart Regional (sem campeonato no catálogo) · Britânico de Kart (sem campeonato no catálogo) · Mundial de Kart → `kart_mundial` (—) · Fórmula Ford Britânica → `ff_brit` (—) · Fórmula 3 → `f3_euro_7584` (C, 24 pilotos) · Sport Nacional (sem campeonato no catálogo) · Mundial de Sport → `wsc` (—)
- **NASCAR:** Kart Regional (sem campeonato no catálogo) · Britânico de Kart (sem campeonato no catálogo) · Late Models (sem campeonato no catálogo) · Sportsman (sem campeonato no catálogo) · NASCAR Cup → `nascar_cup` (L, 138 pilotos)

### 1985

- **Fórmula 1:** Kart Regional (sem campeonato no catálogo) · Britânico de Kart (sem campeonato no catálogo) · Mundial de Kart → `kart_mundial` (—) · Fórmula Ford Britânica → `ff_brit` (—) · Fórmula 3 → `f3_brit` (C, 16 pilotos) · Fórmula 3000 → `f3000` (L, 35 pilotos) · Fórmula 1 → `f1` (L, 36 pilotos)
- **IndyCar:** Kart Regional (sem campeonato no catálogo) · Britânico de Kart (sem campeonato no catálogo) · Mundial de Kart → `kart_mundial` (—) · Fórmula Ford Britânica → `ff_brit` (—) · Super Vee → `super_vee` (—) · Fórmula Atlantic → `atlantic` (—) · IndyCar → `cart` (L, 65 pilotos)
- **Endurance:** Kart Regional (sem campeonato no catálogo) · Britânico de Kart (sem campeonato no catálogo) · Mundial de Kart → `kart_mundial` (—) · Fórmula Ford Britânica → `ff_brit` (—) · Fórmula 3 → `f3_brit` (C, 16 pilotos) · Fórmula 3000 → `f3000` (L, 35 pilotos) · Mundial de Sport → `wsc` (L, 246 pilotos)
- **Stock Car:** Kart Regional (sem campeonato no catálogo) · Britânico de Kart (sem campeonato no catálogo) · Fórmula Vee (sem campeonato no catálogo) · Fórmula Ford Brasil → `ff_brasil` (—) · Stock Car → `stock_car` (L, 41 pilotos)
- **NASCAR:** Kart Regional (sem campeonato no catálogo) · Britânico de Kart (sem campeonato no catálogo) · Mundial de Kart → `kart_mundial` (—) · Late Models (sem campeonato no catálogo) · Busch Series → `nascar_xfinity` (—) · NASCAR Cup → `nascar_cup` (L, 145 pilotos)
- **DTM:** Kart Regional (sem campeonato no catálogo) · Britânico de Kart (sem campeonato no catálogo) · Mundial de Kart → `kart_mundial` (—) · Fórmula Ford Britânica → `ff_brit` (—) · Fórmula 3 → `f3_brit` (C, 16 pilotos) · DTM → `dtm` (—)

### 1995

- **Fórmula 1:** Kart Regional (sem campeonato no catálogo) · Britânico de Kart (sem campeonato no catálogo) · Mundial de Kart → `kart_mundial` (—) · Fórmula Ford Britânica → `ff_brit` (—) · Fórmula 3 → `f3_brit` (L, 47 pilotos) · Fórmula 3000 → `f3000` (L, 35 pilotos) · Fórmula 1 → `f1` (L, 39 pilotos)
- **IndyCar:** Kart Regional (sem campeonato no catálogo) · Britânico de Kart (sem campeonato no catálogo) · Mundial de Kart → `kart_mundial` (—) · Fórmula Ford Britânica → `ff_brit` (—) · Barber Dodge → `barber` (C, 59 pilotos) · Indy Lights → `indy_lights` (—) · IndyCar → `cart` (L, 54 pilotos)
- **Endurance:** Kart Regional (sem campeonato no catálogo) · Britânico de Kart (sem campeonato no catálogo) · Mundial de Kart → `kart_mundial` (—) · Fórmula Ford Britânica → `ff_brit` (—) · Fórmula 3 → `f3_brit` (L, 47 pilotos) · Fórmula 3000 → `f3000` (L, 35 pilotos) · Endurance (sem campeonato no catálogo)
- **Stock Car:** Kart Regional (sem campeonato no catálogo) · Britânico de Kart (sem campeonato no catálogo) · Mundial de Kart → `kart_mundial` (—) · Fórmula Ford Brasil → `ff_brasil` (C, 33 pilotos) · Fórmula 3 Brasil → `f3_sudam` (—) · Stock Car → `stock_car` (—)
- **NASCAR:** Kart Regional (sem campeonato no catálogo) · Britânico de Kart (sem campeonato no catálogo) · Mundial de Kart → `kart_mundial` (—) · Late Models (sem campeonato no catálogo) · Busch Series → `nascar_xfinity` (L, 160 pilotos) · NASCAR Cup → `nascar_cup` (L, 111 pilotos)
- **DTM:** Kart Regional (sem campeonato no catálogo) · Britânico de Kart (sem campeonato no catálogo) · Mundial de Kart → `kart_mundial` (—) · Fórmula Ford Britânica → `ff_brit` (—) · Fórmula 3 → `f3_brit` (L, 47 pilotos) · DTM → `dtm` (L, 32 pilotos)

### 2005

- **Fórmula 1:** Kart Regional (sem campeonato no catálogo) · Britânico de Kart (sem campeonato no catálogo) · Mundial de Kart → `kart_mundial` (—) · Fórmula Renault → `fr_uk` (L, 38 pilotos) · Fórmula 3 → `f3_euroseries` (L, 31 pilotos) · World Series → `wsr` (L, 46 pilotos) · GP2 Series → `gp2` (L, 27 pilotos) · Fórmula 1 → `f1` (L, 29 pilotos)
- **IndyCar:** Kart Regional (sem campeonato no catálogo) · Britânico de Kart (sem campeonato no catálogo) · Mundial de Kart → `kart_mundial` (—) · Fórmula Ford Britânica → `ff_brit` (—) · Star Mazda → `ip2000` (—) · Indy Lights → `indy_lights` (L, 37 pilotos) · IndyCar → `indy` (L, 40 pilotos)
- **Endurance:** Kart Regional (sem campeonato no catálogo) · Britânico de Kart (sem campeonato no catálogo) · Mundial de Kart → `kart_mundial` (—) · Fórmula Renault → `fr_uk` (L, 38 pilotos) · Fórmula 3 → `f3_euroseries` (L, 31 pilotos) · GP2 Series → `gp2` (L, 27 pilotos) · Endurance (sem campeonato no catálogo)
- **Stock Car:** Kart Regional (sem campeonato no catálogo) · Britânico de Kart (sem campeonato no catálogo) · Mundial de Kart → `kart_mundial` (—) · Fórmula Renault Brasil → `fr_brasil` (—) · Fórmula 3 Sul-Americana → `f3_sudam` (—) · Stock Car Light → `stock_light` (L, 52 pilotos) · Stock Car → `stock_car` (L, 52 pilotos)
- **NASCAR:** Kart Regional (sem campeonato no catálogo) · Britânico de Kart (sem campeonato no catálogo) · Mundial de Kart → `kart_mundial` (—) · Late Models (sem campeonato no catálogo) · ARCA → `arca` (C, 204 pilotos) · Xfinity Series → `nascar_xfinity` (L, 187 pilotos) · NASCAR Cup → `nascar_cup` (L, 105 pilotos)
- **DTM:** Kart Regional (sem campeonato no catálogo) · Britânico de Kart (sem campeonato no catálogo) · Mundial de Kart → `kart_mundial` (—) · Fórmula Renault → `fr_uk` (L, 38 pilotos) · Fórmula 3 → `f3_euroseries` (L, 31 pilotos) · GP2 Series → `gp2` (L, 27 pilotos) · DTM → `dtm` (L, 21 pilotos)

### 2015

- **Fórmula 1:** Kart Regional (sem campeonato no catálogo) · Britânico de Kart (sem campeonato no catálogo) · Mundial de Kart → `kart_mundial` (—) · Fórmula 4 Britânica → `f4_brit` (L, 26 pilotos) · Fórmula Renault 2.0 → `fr_eurocup` (L, 49 pilotos) · Fórmula 3 → `f3_euro_fia` (L, 47 pilotos) · GP2 Series → `gp2` (L, 37 pilotos) · Fórmula 1 → `f1` (L, 23 pilotos)
- **IndyCar:** Kart Regional (sem campeonato no catálogo) · Britânico de Kart (sem campeonato no catálogo) · Mundial de Kart → `kart_mundial` (—) · USF2000 → `usf2000` (L, 26 pilotos) · Indy Pro 2000 → `ip2000` (L, 29 pilotos) · Indy Lights → `indy_lights` (L, 16 pilotos) · IndyCar → `indy` (L, 41 pilotos)
- **Endurance:** Kart Regional (sem campeonato no catálogo) · Britânico de Kart (sem campeonato no catálogo) · Mundial de Kart → `kart_mundial` (—) · Fórmula 4 Britânica → `f4_brit` (L, 26 pilotos) · Fórmula Renault 2.0 → `fr_eurocup` (L, 49 pilotos) · Fórmula 3 → `f3_euro_fia` (L, 47 pilotos) · LMP2 / ELMS → `elms` (L, 121 pilotos) · WEC → `wec` (L, 133 pilotos)
- **Stock Car:** Kart Regional (sem campeonato no catálogo) · Britânico de Kart (sem campeonato no catálogo) · Mundial de Kart → `kart_mundial` (—) · Fórmula Vee (sem campeonato no catálogo) · Fórmula 3 Brasil → `f3_brasil` (—) · Stock Car Light → `stock_light` (L, 72 pilotos) · Stock Car → `stock_car` (L, 72 pilotos)
- **NASCAR:** Kart Regional (sem campeonato no catálogo) · Britânico de Kart (sem campeonato no catálogo) · Mundial de Kart → `kart_mundial` (—) · Late Models (sem campeonato no catálogo) · ARCA → `arca` (L, 159 pilotos) · Xfinity Series → `nascar_xfinity` (L, 122 pilotos) · NASCAR Cup → `nascar_cup` (L, 78 pilotos)
- **DTM:** Kart Regional (sem campeonato no catálogo) · Britânico de Kart (sem campeonato no catálogo) · Mundial de Kart → `kart_mundial` (—) · Fórmula 4 Britânica → `f4_brit` (L, 26 pilotos) · Fórmula Renault 2.0 → `fr_eurocup` (L, 49 pilotos) · Fórmula 3 → `f3_euro_fia` (L, 47 pilotos) · DTM → `dtm` (L, 25 pilotos)
- **Fórmula E:** Kart Regional (sem campeonato no catálogo) · Britânico de Kart (sem campeonato no catálogo) · Mundial de Kart → `kart_mundial` (—) · Fórmula 4 Britânica → `f4_brit` (L, 26 pilotos) · Fórmula Renault 2.0 → `fr_eurocup` (L, 49 pilotos) · Fórmula 3 → `f3_euro_fia` (L, 47 pilotos) · GP2 Series → `gp2` (L, 37 pilotos) · Fórmula E → `fe` (L, 36 pilotos)

### 2026

- **Fórmula 1:** Kart Regional (sem campeonato no catálogo) · Britânico de Kart (sem campeonato no catálogo) · Mundial de Kart → `kart_mundial` (—) · Fórmula 4 Britânica → `f4_brit` (L, 46 pilotos) · Fórmula Regional → `frec` (L, 37 pilotos) · Fórmula 3 → `f3` (L, 36 pilotos) · Fórmula 2 → `f2` (L, 24 pilotos) · Fórmula 1 → `f1` (L, 25 pilotos)
- **IndyCar:** Kart Regional (sem campeonato no catálogo) · Britânico de Kart (sem campeonato no catálogo) · Mundial de Kart → `kart_mundial` (—) · USF2000 → `usf2000` (L, 34 pilotos) · Indy Pro 2000 → `ip2000` (L, 29 pilotos) · Indy NXT → `indy_lights` (L, 28 pilotos) · IndyCar → `indy` (L, 33 pilotos)
- **Endurance:** Kart Regional (sem campeonato no catálogo) · Britânico de Kart (sem campeonato no catálogo) · Mundial de Kart → `kart_mundial` (—) · Fórmula 4 Britânica → `f4_brit` (L, 46 pilotos) · Fórmula Regional → `frec` (L, 37 pilotos) · Fórmula 3 → `f3` (L, 36 pilotos) · LMP2 / ELMS → `elms` (L, 168 pilotos) · WEC → `wec` (L, 113 pilotos)
- **Stock Car:** Kart Regional (sem campeonato no catálogo) · Britânico de Kart (sem campeonato no catálogo) · Mundial de Kart → `kart_mundial` (—) · Fórmula Delta → `fdelta` (—) · Fórmula 4 Britânica → `f4_brit` (L, 46 pilotos) · Stock Series → `stock_light` (L, 19 pilotos) · Stock Car → `stock_car` (L, 64 pilotos)
- **NASCAR:** Kart Regional (sem campeonato no catálogo) · Britânico de Kart (sem campeonato no catálogo) · Mundial de Kart → `kart_mundial` (—) · Late Models (sem campeonato no catálogo) · ARCA → `arca` (L, 150 pilotos) · Xfinity Series → `nascar_xfinity` (—) · NASCAR Cup → `nascar_cup` (L, 61 pilotos)
- **DTM:** Kart Regional (sem campeonato no catálogo) · Britânico de Kart (sem campeonato no catálogo) · Mundial de Kart → `kart_mundial` (—) · Fórmula 4 Britânica → `f4_brit` (L, 46 pilotos) · Fórmula Regional → `frec` (L, 37 pilotos) · Fórmula 3 → `f3` (L, 36 pilotos) · DTM → `dtm` (L, 24 pilotos)
- **Fórmula E:** Kart Regional (sem campeonato no catálogo) · Britânico de Kart (sem campeonato no catálogo) · Mundial de Kart → `kart_mundial` (—) · Fórmula 4 Britânica → `f4_brit` (L, 46 pilotos) · Fórmula Regional → `frec` (L, 37 pilotos) · Fórmula 3 → `f3` (L, 36 pilotos) · Fórmula 2 → `f2` (L, 24 pilotos) · Fórmula E → `fe` (L, 21 pilotos)

