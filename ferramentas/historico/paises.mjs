/* Nome do país como aparece no arquivo da bandeira (Wikipedia em inglês)
   → código de duas letras que o jogo usa. Países que não existem mais
   ficam com o código do sucessor no jogo e o nome histórico guardado à parte
   (um alemão-ocidental de 1975 corre com a bandeira da Alemanha no telão,
   mas a ficha diz "Alemanha Ocidental"). */
export const PAIS_CC = {
  'Argentina':'AR', 'Australia':'AU', 'Austria':'AT', 'Belgium':'BE', 'Brazil':'BR', 'Canada':'CA', 'Chile':'CL',
  'China':'CN', "People's Republic of China":'CN', 'Colombia':'CO', 'Czech Republic':'CZ', 'Czechia':'CZ', 'Denmark':'DK',
  'Finland':'FI', 'France':'FR', 'Germany':'DE', 'Greece':'GR', 'Hungary':'HU', 'India':'IN', 'Indonesia':'ID',
  'Ireland':'IE', 'Republic of Ireland':'IE', 'Israel':'IL', 'Italy':'IT', 'Japan':'JP', 'Liechtenstein':'LI',
  'Luxembourg':'LU', 'Malaysia':'MY', 'Mexico':'MX', 'Monaco':'MC', 'Morocco':'MA', 'Netherlands':'NL',
  'New Zealand':'NZ', 'Norway':'NO', 'Paraguay':'PY', 'Peru':'PE', 'Poland':'PL', 'Portugal':'PT', 'Romania':'RO',
  'Russia':'RU', 'Saudi Arabia':'SA', 'Singapore':'SG', 'Slovakia':'SK', 'Slovenia':'SI', 'South Africa':'ZA',
  'South Korea':'KR', 'Korea':'KR', 'Spain':'ES', 'Sweden':'SE', 'Switzerland':'CH', 'Thailand':'TH', 'Turkey':'TR',
  'Türkiye':'TR', 'Ukraine':'UA', 'United Kingdom':'GB', 'Great Britain':'GB', 'England':'GB', 'Scotland':'GB',
  'Wales':'GB', 'Northern Ireland':'GB', 'Ulster Banner':'GB', 'United States':'US', 'United States of America':'US',
  'Uruguay':'UY', 'Venezuela':'VE', 'Ecuador':'EC', 'Bolivia':'BO', 'Costa Rica':'CR', 'Guatemala':'GT',
  'El Salvador':'SV', 'Panama':'PA', 'Puerto Rico':'PR', 'Dominican Republic':'DO', 'Cuba':'CU', 'Jamaica':'JM',
  'Barbados':'BB', 'Trinidad and Tobago':'TT', 'Estonia':'EE', 'Latvia':'LV', 'Lithuania':'LT', 'Belarus':'BY',
  'Bulgaria':'BG', 'Croatia':'HR', 'Serbia':'RS', 'Bosnia and Herzegovina':'BA', 'Montenegro':'ME',
  'North Macedonia':'MK', 'Cyprus':'CY', 'Malta':'MT', 'Iceland':'IS', 'Andorra':'AD', 'San Marino':'SM',
  'Philippines':'PH', 'Vietnam':'VN', 'Hong Kong':'HK', 'Macau':'MO', 'Macao':'MO', 'Taiwan':'TW',
  'Chinese Taipei':'TW', 'Republic of China':'TW', 'Pakistan':'PK', 'Sri Lanka':'LK', 'Iran':'IR', 'Lebanon':'LB',
  'Jordan':'JO', 'Kuwait':'KW', 'Qatar':'QA', 'Bahrain':'BH', 'Oman':'OM', 'United Arab Emirates':'AE',
  'Egypt':'EG', 'Kenya':'KE', 'Zimbabwe':'ZW', 'Zambia':'ZM', 'Namibia':'NA', 'Angola':'AO', 'Mozambique':'MZ',
  'Nigeria':'NG', 'Ghana':'GH', 'Tunisia':'TN', 'Algeria':'DZ', 'Kazakhstan':'KZ', 'Georgia':'GE', 'Armenia':'AM',
  'Azerbaijan':'AZ', 'Uzbekistan':'UZ', 'Kyrgyzstan':'KG', 'Mongolia':'MN', 'Moldova':'MD', 'Albania':'AL',
  'Nepal':'NP', 'Bangladesh':'BD', 'Brunei':'BN', 'Cambodia':'KH', 'Myanmar':'MM', 'Fiji':'FJ', 'Papua New Guinea':'PG',
  'Guam':'GU', 'Bermuda':'BM', 'Bahamas':'BS', 'Cayman Islands':'KY', 'Aruba':'AW', 'Curaçao':'CW', 'Honduras':'HN',
  'Nicaragua':'NI', 'Haiti':'HT', 'Faroe Islands':'FO', 'Gibraltar':'GI', 'Isle of Man':'IM', 'Jersey':'JE', 'Guernsey':'GG',
  /* países que já não existem: código do sucessor, nome histórico à parte */
  'West Germany':'DE', 'East Germany':'DE', 'Soviet Union':'RU', 'USSR':'RU', 'Czechoslovakia':'CZ',
  'Yugoslavia':'RS', 'Rhodesia':'ZW', 'Southern Rhodesia':'ZW', 'Federation of Rhodesia and Nyasaland':'ZW',
  'Union of South Africa':'ZA', 'Ceylon':'LK', 'Persia':'IR', 'Siam':'TH', 'Burma':'MM', 'Zaire':'CD',
  'Serbia and Montenegro':'RS', 'British Hong Kong':'HK', 'Portuguese Macau':'MO'
};
export const HISTORICOS = {
  'West Germany':'Alemanha Ocidental', 'East Germany':'Alemanha Oriental', 'Soviet Union':'União Soviética',
  'USSR':'União Soviética', 'Czechoslovakia':'Tchecoslováquia', 'Yugoslavia':'Iugoslávia', 'Rhodesia':'Rodésia',
  'Southern Rhodesia':'Rodésia do Sul', 'Federation of Rhodesia and Nyasaland':'Federação da Rodésia e Niassalândia',
  'Union of South Africa':'União Sul-Africana', 'Ceylon':'Ceilão', 'Serbia and Montenegro':'Sérvia e Montenegro',
  'Persia':'Pérsia', 'Siam':'Sião', 'Burma':'Birmânia', 'Zaire':'Zaire', 'British Hong Kong':'Hong Kong britânico',
  'Portuguese Macau':'Macau português', 'FIA':'neutro (bandeira da FIA)', 'England':'Inglaterra', 'Scotland':'Escócia',
  'Wales':'País de Gales', 'Northern Ireland':'Irlanda do Norte', 'Ulster Banner':'Irlanda do Norte'
};
export function ccDe(nomePais){
  if(!nomePais) return { cc: null, nh: null, desconhecido: false };
  const n = String(nomePais).replace(/^the /i, '').trim();
  if(n === 'FIA') return { cc: null, nh: HISTORICOS.FIA, desconhecido: false };
  const cc = PAIS_CC[n];
  return { cc: cc || null, nh: HISTORICOS[n] || null, desconhecido: !cc };
}
