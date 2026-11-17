/* Corrida 2D: a identidade visual de cada pista.
   Cada pista ganha um tema a partir do que ela é na vida real: o bioma da região (o verde
   do norte da Europa, o seco do Mediterrâneo e da Austrália, o tropical, o deserto do Golfo,
   as dunas de Zandvoort, a terra vermelha do cerrado), as cores das zebras e do público, a
   água (o porto de Mônaco, a ilha de Montreal, os lagos de Albert Park, Interlagos e Daytona),
   as corridas noturnas (Singapura, Bahrein, Jidá, Las Vegas, Catar), os marcos (os tijolos e
   o pagode de Indianápolis, a ponte de Le Mans, a roda-gigante de Suzuka) e a época (fardos
   de feno e zebras de concreto antes de 1968, guard-rail nos anos 70 e 80).
   As pistas mais conhecidas têm o tema escrito à mão (LOCAIS); as outras saem do país, da
   região, do tipo e do ano, com uma variação própria de cada pista. Aqui só há dados: quem
   desenha é o cenário (cenario2d.js e ambiente2d.js). Nada daqui entra na física. */
(function(raiz){
  const C2D = raiz.C2D;
  const hash = t => { let h = 2166136261; for(const ch of String(t)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0; return h; };
  const tomHex = (hex, f) => '#' + [1, 3, 5].map(i => { const c = parseInt(hex.slice(i, i + 2), 16); return Math.max(0, Math.min(255, Math.round(f >= 0 ? c + (255 - c) * f : c * (1 + f)))).toString(16).padStart(2, '0'); }).join('');
  const BRANCO = '#f4f2ec', VERM = '#d6311f';

  /* ── os biomas: o chão, a vegetação, a brita e a água de cada região ── */
  const BIOMAS = {
    temperado:    { solo: 'grama', grama: ['#45843a', '#6aa84e', '#2c5f26'], folhagem: 'verde',    arv: { folha: 6, pinheiro: 2, arbusto: 1 }, dens: 1, agua: '#356f8c', brita: '#c6ad85' },
    mediterraneo: { solo: 'grama', grama: ['#6c8a3e', '#93a955', '#4c672b'], folhagem: 'oliva',    arv: { pinheiro: 3, cipreste: 3, folha: 2, arbusto: 2 }, dens: .8, agua: '#2f7fa6', brita: '#cdb891' },
    tropical:     { solo: 'grama', grama: ['#3c8f3a', '#62b84f', '#236a2a'], folhagem: 'tropical', arv: { palmeira: 4, folha: 5, arbusto: 1 }, dens: 1.3, agua: '#2b8f9c', brita: '#c9b08a' },
    deserto:      { solo: 'areia', grama: ['#d1b88a', '#e6d3aa', '#b0935f'], folhagem: 'seco',     arv: { palmeira: 5, arbusto: 3, rocha: 2 }, dens: .3, agua: '#2f8fa8', brita: '#dcc9a0' },
    semiarido:    { solo: 'seco',  grama: ['#93904f', '#b5ad66', '#6c7639'], folhagem: 'seco',     arv: { eucalipto: 5, arbusto: 3, folha: 1 }, dens: .6, agua: '#3c7f8e', brita: '#c9a577' },
    alpino:       { solo: 'grama', grama: ['#3f8a45', '#63b05c', '#28662f'], folhagem: 'escuro',   arv: { pinheiro: 7, folha: 2 }, dens: 1.4, agua: '#3a7d92', brita: '#b9b4a8' },
    nordico:      { solo: 'grama', grama: ['#4a8848', '#6ea862', '#316636'], folhagem: 'escuro',   arv: { pinheiro: 5, folha: 4 }, dens: 1.2, agua: '#3a6f8a', brita: '#bdb6a6' },
    pradaria:     { solo: 'grama', grama: ['#5d8c3d', '#80ab54', '#416e2c'], folhagem: 'verde',    arv: { folha: 5, arbusto: 2, pinheiro: 1 }, dens: .5, agua: '#3f7a86', brita: '#c6ad85' },
    continental:  { solo: 'grama', grama: ['#5a8a3c', '#7da352', '#40672a'], folhagem: 'verde',    arv: { folha: 6, pinheiro: 2, arbusto: 1 }, dens: .8, agua: '#3d7486', brita: '#c2ac88' },
    cerrado:      { solo: 'grama', grama: ['#5f8f3a', '#84ad4e', '#3f6c29'], terra: '#a4502e', folhagem: 'oliva', arv: { folha: 4, arbusto: 3, palmeira: 2 }, dens: .7, agua: '#4a7f78', brita: '#b3663f' },
    duna:         { solo: 'duna',  grama: ['#d0bf94', '#e4d6b0', '#b39d6e'], folhagem: 'seco',     arv: { arbusto: 5, pinheiro: 2 }, dens: .35, agua: '#3a6f8a', brita: '#d8c8a0' },
    montanha:     { solo: 'rocha', grama: ['#8a8474', '#a8a08c', '#696355'], folhagem: 'escuro',   arv: { pinheiro: 5, rocha: 4, arbusto: 1 }, dens: .55, agua: '#3a7d92', brita: '#a8a294' }
  };
  const PAISES = { temperado: 'GB IE BE NL LU DE DK PL CZ SK JP KR NZ US FR', mediterraneo: 'IT ES PT GR TR MC HR CY MT IL LB CL SM', tropical: 'BR MY SG ID TH PH VN CO VE EC PA CR CU DO PR IN LK MO HK',
                   deserto: 'BH AE QA SA KW OM EG MA', semiarido: 'AU ZA MX AZ IR', alpino: 'AT CH', nordico: 'SE FI NO RU CA EE LV LT IS', pradaria: 'AR UY PY', continental: 'HU RO BG RS UA CN SI' };
  const BIOMA_DE = {}; for(const b in PAISES) PAISES[b].split(' ').forEach(cc => { BIOMA_DE[cc] = b; });

  /* as duas cores de cada país (a cinta dos pneus, as placas e parte do público) */
  const NAC = { BR: ['#1f9d4d', '#f4d21f'], IT: ['#1f8a4b', VERM], FR: ['#1f4fbf', VERM], GB: ['#1f3f8f', VERM], DE: ['#16171a', '#e0b020'], NL: ['#f07a1a', '#1f4fbf'], BE: ['#f2c61f', VERM], ES: ['#f2c61f', VERM],
                PT: ['#1f8a4b', VERM], JP: [VERM, BRANCO], US: ['#1f3f8f', VERM], AU: ['#1f8a4b', '#f2c61f'], AT: [VERM, BRANCO], CH: [VERM, BRANCO], MC: [VERM, BRANCO], CA: [VERM, BRANCO], MX: ['#1f8a4b', VERM],
                AR: ['#6fb7e6', BRANCO], SE: ['#1f5fbf', '#f2c61f'], FI: ['#1f4fbf', BRANCO], ZA: ['#1f8a4b', '#f2c61f'], HU: [VERM, '#1f8a4b'], TR: [VERM, BRANCO], CN: [VERM, '#f2c61f'], MY: ['#1f3f8f', '#f2c61f'],
                SG: [VERM, BRANCO], BH: [VERM, BRANCO], AE: ['#1f8a4b', VERM], QA: ['#7a1f3d', BRANCO], SA: ['#1f8a4b', BRANCO], AZ: ['#2f9fd6', VERM], RU: ['#1f4fbf', VERM], UY: ['#6fb7e6', '#f2c61f'],
                CL: ['#1f3f8f', VERM], NZ: ['#16171a', BRANCO], IN: ['#f08a1a', '#1f8a4b'], KR: ['#1f3f8f', VERM], CZ: ['#1f3f8f', VERM], PL: [VERM, BRANCO], DK: [VERM, BRANCO], IE: ['#1f8a4b', '#f08a1a'], MA: [VERM, '#1f8a4b'] };
  /* zebras nas cores do país (muitos autódromos nacionais pintam assim); as pistas de GP ficam no vermelho e branco */
  const ZEBRA_NAC = { BR: ['#f4d21f', '#1f9d4d'], AR: [BRANCO, '#6fb7e6'], UY: [BRANCO, '#6fb7e6'], SE: ['#f2c61f', '#1f5fbf'], ES: ['#f2c61f', VERM], BE: ['#f2c61f', VERM], FR: [BRANCO, '#1f4fbf', VERM],
                      IT: [BRANCO, '#1f8a4b', VERM], MX: [BRANCO, '#1f8a4b', VERM], NL: [BRANCO, VERM, '#1f4fbf'], FI: [BRANCO, '#1f4fbf'], ZA: ['#f2c61f', '#1f8a4b'], HU: [BRANCO, VERM, '#1f8a4b'], PT: ['#1f8a4b', VERM],
                      CL: [BRANCO, '#1f3f8f'], US: [BRANCO, '#1f3f8f'], GB: [BRANCO, '#1f3f8f'], CA: [BRANCO, VERM], DE: [BRANCO, VERM], JP: [BRANCO, VERM] };
  const FAMOSAS = /m[oô]naco|monte.?carlo|monza|silverstone|suzuka|interlagos|imola|hungaroring|red bull ring|n[uü]rburg|hockenheim|catalunya|albert park|villeneuve|marina bay|sakhir|jeddah|am[eé]ricas|miami|hermanos|baku|sarthe|le mans|zandvoort|ricard|sepang|shanghai|istanbul|sochi|losail|las vegas|indian[aá]polis|long beach|laguna|road america|watkins|sebring|daytona|brands|donington|estoril|kyalami|adelaide|fuji|zolder|magny|buenos aires|jacarepagu|mugello|barcelona|zeltweg|\bfuji\b|xangai|istambul|lusail|jed[aá]|cidade do m[eé]xico|austin|spa-franc/i;
  /* o sol de cada região: [o comprimento da sombra (1 = um metro de altura dá um metro de sombra), a força dela] */
  const SOL = { deserto: [.8, .42], mediterraneo: [.9, .4], tropical: [.8, .37], semiarido: [.9, .4], cerrado: [.85, .38], temperado: [1.1, .31], nordico: [1.3, .29], alpino: [1.05, .34],
                pradaria: [1, .34], continental: [1, .33], duna: [1.1, .31], montanha: [1.05, .34] };
  const PUB = {
    misto:    ['#d8473c', '#f0c12e', '#eef0f2', '#3d8ef7', '#2b2f36', '#e88a3a', '#7a4fb8', '#35a36a'],
    vermelho: [VERM, '#c22a1c', '#e2483a', '#eef0f2', VERM, '#f0c12e', '#b3241a', '#2b2f36'],
    laranja:  ['#f07a1a', '#f08a2a', '#e86a10', '#eef0f2', '#f07a1a', '#f59a3a', '#2b2f36', '#f07a1a'],
    brasil:   ['#f4d21f', '#1f9d4d', '#f4d21f', '#eef0f2', '#1f9d4d', '#3d8ef7', '#f0c12e', '#2b2f36'],
    mexico:   ['#1f8a4b', '#eef0f2', VERM, '#1f8a4b', VERM, '#eef0f2', '#2b2f36', '#f0c12e'],
    antigo:   ['#d9d2c0', '#8a7f6c', '#5c564c', '#efe9da', '#a89a80', '#3f3b35', '#c4b8a0', '#6f6558']
  };
  const PLACAS = [[VERM, BRANCO, '#1f3f8f'], ['#f2c61f', '#16171a', BRANCO], ['#1f8a4b', BRANCO, VERM], ['#1f6fbf', BRANCO, '#f08a1a'], ['#7a2f9f', BRANCO, '#2fb3b0']];

  /* ── o que se sabe de cada lugar: [quem, o que muda, quem não] (os de baixo valem sobre os de cima) ── */
  const LOCAIS = [
    /* regiões dentro dos países */
    [/goi[aâ]n|bras[ií]lia|campo grande|cascavel|londrina|cuiab|ribeir[aã]o preto/i, { bioma: 'cerrado' }],
    [/curitiba|pinhais|tarum[aã]|guapor[eé]|santa cruz do sul|velopark|viam[aã]o|lages|rivera/i, { bioma: 'temperado', arv: { pinheiro: 4, folha: 5, arbusto: 1 } }],
    [/caruaru|fortaleza|eus[eé]bio|jo[aã]o pessoa|para[ií]ba|macei[oó]|aracaju/i, { bioma: 'semiarido', arv: { palmeira: 3, arbusto: 4, folha: 2 } }],
    [/phoenix|tucson|las vegas|caesars|riverside|ontario|fontana|willow springs|thermal|buttonwillow|zonda|villicum|san juan|mendoza|la rioja|marrak/i, { bioma: 'deserto' }],
    [/laguna seca|sonoma|sears point|long beach|texas|austin|am[eé]ricas|houston|dallas|san antonio|sacramento|kyalami|buddh|hermanos rodr|puebla|monterrey|jarama|albacete|arag[oó]n|navarra/i, { bioma: 'semiarido' }],
    [/daytona|homestead|sebring|miami|petersburg|palm beach|tampa|walt disney|surfers|gold coast|townsville/i, { bioma: 'tropical' }],
    [/paul ricard|castellet|n[iî]mes|l[eé]denon|nogaro|\balbi\b|\bpau\b|sochi|baku/i, { bioma: 'mediterraneo' }],
    [/red bull ring|[oö]sterreichring|a1.?ring|zeltweg|spielberg|salzburgring|\bfuji\b|bremgarten|dijon|charade|clermont/i, { bioma: 'alpino' }],
    [/phillip island|symmons|baskerville|pukekohe|taupo|teretonga|manfeild|wigram/i, { bioma: 'temperado', dens: .35 }],
    [/pikes peak|ventoux|hill.?climb|bergrennen/i, { bioma: 'montanha', semArq: true }],
    /* florestas, parques e campos de aviação */
    [/monza/i, { dens: 1.7, publico: 'vermelho' }],
    [/\bspa\b|francorchamps/i, { dens: 1.7, folhagem: 'escuro', arv: { pinheiro: 5, folha: 5 }, zebra: ['#f2c61f', VERM] }],
    [/n[uü]rburgring|nordschleife/i, { dens: 1.8, folhagem: 'escuro' }],
    [/hockenheim/i, { dens: 1.5, arv: { pinheiro: 6, folha: 3 } }],
    [/le mans|sarthe/i, { dens: 1.3, arv: { pinheiro: 6, folha: 3 }, pontes: [{ f: .055, cor: ['#f2c61f', '#16171a'] }] }, /petit|atlanta|^kt_|bugatti/i],
    [/le mans bugatti/i, { dens: 1.3, arv: { pinheiro: 6, folha: 3 }, pontes: [{ f: .15, cor: ['#f2c61f', '#16171a'] }] }],
    [/road america|elkhart|watkins|mosport|lime rock|mid.?ohio|brainerd|tremblant/i, { dens: 1.5 }],
    [/watkins/i, { guard: '#5fa8d8' }],
    [/silverstone|thruxton|snetterton|goodwood|croft|castle combe/i, { dens: .25 }],
    [/sebring/i, { dens: .3, asfalto: 'concreto' }],
    [/imola|enzo e dino/i, { dens: 1.4, publico: 'vermelho' }],
    [/mugello/i, { arv: { cipreste: 5, pinheiro: 2, folha: 3 }, escape: { listras: ['#1f8a4b', BRANCO, VERM] }, publico: 'vermelho' }],
    [/hungaroring/i, { solo: 'seco' }],
    [/kyalami|sonoma|sears point/i, { solo: 'seco', dens: .4 }],
    [/bathurst|panorama/i, { arv: { eucalipto: 7, arbusto: 2 } }],
    [/zandvoort/i, { bioma: 'duna', publico: 'laranja' }],
    /* água */
    [/m[oô]naco|monte.?carlo/i, { bioma: 'mediterraneo', costa: [{ f0: .575, f1: .885, lado: 'E', dist: 6, larg: 320, barcos: 30 }], telha: 7 }],
    [/gilles villeneuve|montr[eé]al/i, { bioma: 'nordico', costa: [{ f0: 0, f1: 1, lado: 'fora', dist: 24, larg: 240 }], lago: 1, dens: 1.2 }],
    [/albert park|melbourne/i, { bioma: 'temperado', lago: 1, lagoR: 150, arv: { eucalipto: 6, folha: 2, palmeira: 1 }, dens: 1.1, escape: { cor: '#2f8a4f' } }],
    [/interlagos|carlos pace/i, { lago: 1, publico: 'brasil', escape: { cor: '#2f8a4f' } }],
    [/jacarepagu|oulton|mallory/i, { lago: 1 }],
    [/daytona/i, { lago: 1, arv: { palmeira: 5, folha: 4 } }],
    [/homestead/i, { lago: 1, arv: { palmeira: 8, folha: 1 }, cinta: ['#e7e4dc', '#2fb3b0'] }],
    [/laguna seca/i, { solo: 'seco', lago: 1, lagoR: 45, arv: { folha: 5, arbusto: 4 }, dens: .5 }],
    [/shanghai|xangai/i, { lago: 1, lagoR: 60 }],
    /* noite */
    [/marina bay|singap/i, { bioma: 'tropical', noite: 1, desde: 2008, roda: { f: .97, lado: 'box', dist: 80, R: 42 } }],
    [/sakhir|bahrain|bahrein|barein/i, { bioma: 'deserto', noite: 1, desde: 2014, arv: { palmeira: 7, arbusto: 2 } }],
    [/yas marina|abu dhabi/i, { bioma: 'deserto', noite: .55, desde: 2009, zebra: [BRANCO, '#1f6fbf'], escape: { cor: '#3f9fc6' }, pontes: [{ f: .76, cor: ['#e9eef2', '#8f6fd6'], larg: 30, hotel: true }], arv: { palmeira: 8, arbusto: 1 } }],
    [/jeddah|je(d|dd)[aá]|jid[aá]/i, { bioma: 'deserto', noite: 1, arv: { palmeira: 8, arbusto: 1 } }],
    [/las vegas/i, { bioma: 'deserto', arv: { palmeira: 8, arbusto: 2 } }],
    [/las vegas strip/i, { noiteRua: 2023, esfera: true }],
    [/losail|lusail|qatar|catar/i, { bioma: 'deserto', noite: 1, desde: 2008 }],
    [/diriyah|riad|riyadh/i, { bioma: 'deserto', noite: 1 }],
    /* a pintura das áreas de escape, os marcos e o público */
    [/paul ricard|castellet/i, { escape: { listras: ['#1f5fbf', VERM] }, arv: { pinheiro: 6, cipreste: 2, arbusto: 2 } }],
    [/am[eé]ricas|\bcota\b|austin/i, { escape: { listras: [VERM, BRANCO, '#1f3f8f'] } }],
    [/miami/i, { escape: { cor: '#2fb3b0' }, estadio: true, arv: { palmeira: 8, folha: 1 } }, /homestead|oval/i],
    [/hermanos rodr|ci(u|)dade? d[eo] m[eé]xico|mixhuca/i, { publico: 'mexico', escape: { cor: '#2f8a4f' }, arqExtra: [{ f0: .8, f1: .9, prof: 22 }] }],
    [/sepang/i, { arv: { palmeira: 8, folha: 2 }, dens: 1.4, escape: { listras: ['#1f3f8f', '#f2c61f', VERM] } }],
    [/istanbul|istambul/i, { escape: { cor: '#2f9fb0' } }],
    [/baku|bak[uú]/i, { rua: '#a89878', lajes: 'areia', telha: 1 }],
    [/long beach|surfers|petersburg/i, { arv: { palmeira: 7, folha: 2 } }],
    [/suzuka/i, { roda: { f: .975, lado: 'arq', dist: 70, R: 34 } }],
    [/^indy\b|indian[aá]polis/i, { tijolos: true, pagode: true, golfe: true, arqExtra: [{ f0: .9, f1: .985, lado: 'arq', prof: 30 }, { f0: .02, f1: .1, lado: 'arq', prof: 30 }] }, /raceway park|lucas oil|\birp\b/i],
    [/talladega/i, { dens: 1.2 }],
    [/bristol/i, { anel: true, asfalto: 'concreto', dens: .3 }],
    [/dover|nashville super/i, { asfalto: 'concreto' }]
  ];

  const cache = new Map();
  C2D.Temas = {
    BIOMAS, LOCAIS, NAC,
    /* o tema da pista P naquele ano */
    de(P){
      const k = P.id + ':' + (P.ano || 0);
      if(cache.has(k)) return cache.get(k);
      const trk = (typeof TRACKS !== 'undefined' && TRACKS[P.id]) || {};
      const txt = [P.id, trk.gp, trk.circ, P.nome].filter(Boolean).join(' ');
      const cc = trk.cc || ((/^([a-z]{2})_/.exec(P.id) || [])[1] || '').toUpperCase();
      const ano = P.ano || 2024, h = hash(P.id), rua = P.tipo === 'street';
      const era = ano < 1968 ? 'antiga' : ano < 1990 ? 'classica' : ano < 2009 ? 'moderna' : 'atual';
      const t = { bioma: BIOMA_DE[cc] || 'temperado' };
      for(const [rx, muda, nao] of LOCAIS) if(rx.test(txt) && !(nao && nao.test(txt + ' ' + P.tipo))) Object.assign(t, muda);
      const B = BIOMAS[t.bioma] || BIOMAS.temperado, nac = NAC[cc] || [VERM, '#1f3f8f'];
      const solo = t.solo || B.solo, varia = ((h >> 3) % 9 - 4) / 100;
      const grama = (solo === 'seco' && B.solo !== 'seco' ? BIOMAS.semiarido.grama : B.grama).map(c => tomHex(c, varia));
      /* as zebras: concreto nas antigas; nas de hoje, o vermelho e branco ou as cores do país */
      let zebra = t.zebra;
      if(!zebra){
        if(era === 'antiga') zebra = ['#cfc9bb', '#b9b2a2'];
        else if(P.kart) zebra = ZEBRA_NAC[cc] && h % 10 < 7 ? ZEBRA_NAC[cc] : [BRANCO, [VERM, '#1f5fbf', '#f2c61f'][h % 3]];
        else if(!FAMOSAS.test(txt) && ZEBRA_NAC[cc] && h % 100 < (era === 'classica' ? 25 : 42)) zebra = ZEBRA_NAC[cc];
        else zebra = [BRANCO, VERM];
      }
      let publico = PUB[t.publico];
      if(!publico){ publico = (era === 'antiga' ? PUB.antigo : PUB.misto).slice(); if(era !== 'antiga'){ publico[1] = nac[0]; publico[5] = nac[1]; } }
      /* a noite: só a partir do ano em que a corrida passou a ser noturna */
      let noite = t.noite || 0;
      if(t.desde && ano < t.desde) noite = 0;
      if(t.noiteRua) noite = rua && ano >= t.noiteRua ? 1 : 0;
      if(P.kart) noite = 0;
      /* a barreira de cada época: fardos de feno, depois guard-rail, depois pneus (o cenário põe o muro nos ovais e na rua) */
      const barreira = P.terra ? 'cerca' : era === 'antiga' && !P.oval ? 'feno' : era === 'classica' && !P.oval && !rua && !P.kart ? 'armco' : null;
      const concreto = t.asfalto === 'concreto';
      /* o asfalto de dia, visto de cima, é um cinza médio (a borracha e as marcas escuras aparecem nele); cada pista tem o seu tom */
      const asfalto = concreto ? '#8f918e' : tomHex(era === 'antiga' ? '#615f59' : era === 'classica' ? '#595955' : t.bioma === 'deserto' ? '#5b5a58' : '#4e5157', ((h >> 7) % 9 - 4) / 100);
      const placas = era === 'antiga' ? (ano >= 1950 ? ['#b23a2a', '#e9e2cf'] : null) : era === 'classica' ? [VERM, '#f2c61f', BRANCO] : /^fe_/.test(P.id) ? ['#1fb6c9', '#16203a', BRANCO] : h % 3 === 0 ? [nac[0], BRANCO, nac[1]] : PLACAS[h % 5];
      const tm = {
        id: P.id, cc, era, bioma: t.bioma, solo, grama, terra: B.terra || null, brita: B.brita, asfalto, concreto, velho: era === 'antiga' || era === 'classica',
        escape: era === 'atual' || era === 'moderna' ? (t.escape || null) : null,
        rua: t.rua || (t.bioma === 'deserto' ? '#a89878' : t.bioma === 'mediterraneo' ? '#8f8a80' : '#7b7c7a'),
        telha: t.telha != null ? t.telha : t.bioma === 'mediterraneo' ? 6 : t.bioma === 'deserto' ? 0 : /^(US|CA|AU)$/.test(cc) ? 1 : 3,
        lajes: t.lajes === 'areia' || t.bioma === 'deserto' ? ['#d9cbb0', '#cbbb9c', '#e6dac2', '#bfae8e', '#d2c4a6', '#c9bda6'] : null,
        zebra, publico, placas, cinta: t.cinta || ['#e7e4dc', h % 4 === 0 ? nac[0] : '#c51f24'], guard: t.guard || '#9aa1a9', barreira,
        arv: t.arv || B.arv, folhagem: t.folhagem || B.folhagem, dens: (t.dens != null ? t.dens : B.dens) * (.8 + (h % 41) / 100), agua: B.agua,
        /* (de noite o sol não faz sombra; no entardecer ela fica comprida e fraca) */
        sol: noite >= 1 ? { comp: .6, forca: .1 } : noite > 0 ? { comp: 1.9, forca: .24 } : { comp: (SOL[t.bioma] || SOL.temperado)[0], forca: (SOL[t.bioma] || SOL.temperado)[1] },
        /* o quanto as sombras das nuvens aparecem (céu limpo no deserto; de noite, nenhuma) */
        nuvens: noite ? 0 : ({ temperado: .32, nordico: .36, alpino: .3, tropical: .3, continental: .26, pradaria: .22, cerrado: .22, mediterraneo: .16, montanha: .26, duna: .28, semiarido: .1 })[t.bioma] || 0,
        noite, costa: P.kart ? null : (t.costa || null), lago: t.lago || 0, lagoR: t.lagoR || 0,
        pontes: era === 'antiga' ? null : (t.pontes || null), roda: era === 'antiga' ? null : (t.roda || null), esfera: !!(t.esfera && rua && ano >= 2023),
        tijolos: !!t.tijolos, pagode: !!t.pagode, golfe: !!t.golfe, estadio: !!(t.estadio && ano >= 2022), anel: !!t.anel, arqExtra: t.arqExtra || null, semArq: !!t.semArq,
        camping: !!(P.oval && /^(US|CA|MX)$/.test(cc) && ano >= 1965 && !P.terra && !P.kart), estac: !P.kart && era !== 'antiga' && !t.semArq,
        nome: String(trk.circ || P.nome || '').replace(/\s+/g, ' ').trim().toUpperCase().slice(0, 26)
      };
      tm.chave = [tm.bioma, solo, grama.join(), tm.terra, tm.brita, asfalto, concreto, JSON.stringify(tm.escape || 0), tm.rua, publico.join(), JSON.stringify(tm.arv), tm.folhagem, tm.agua, era,
                  !!tm.costa, !!tm.lago, tm.estac, tm.camping, barreira, !!noite].join('|');
      cache.set(k, tm);
      if(cache.size > 40) cache.delete(cache.keys().next().value);
      return tm;
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
