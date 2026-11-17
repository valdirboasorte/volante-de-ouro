/* Corrida 2D: o grafismo da tela por categoria e época.
   Cada campeonato teve a sua cara na transmissão: as legendas amarelas dos anos 80, as
   caixas cinza do começo dos 90, a torre preta com a cor da equipe de hoje, a faixa
   corrida no alto da NASCAR, a torre de números da Indy. Aqui só se escolhe o tema e
   como a torre se monta; as cores e as formas ficam em corrida2d.css ([data-hud=...]).
   Nada aqui copia marca ou logotipo: são desenhos próprios, no espírito de cada época. */
(function(raiz){
  const C2D = raiz.C2D;

  /* torre: modo 'coluna' (à esquerda) ou 'faixa' (corrida no alto); n = linhas no máximo;
     nome 'sigla' (três letras) ou 'sobrenome'; num = mostra o número do carro; cab = cabeçalho
     com a sessão e a volta; pneu = letra do composto; seta = posições ganhas desde a largada;
     lider = o que vai na linha do primeiro; casas = decimais do intervalo */
  const T = (o) => Object.assign({ modo: 'coluna', n: 10, nome: 'sigla', num: false, cab: false, pneu: false, seta: false, lider: '', casas: 3 }, o);
  const DEF = {
    /* até o fim dos anos 70: quase nada na tela, uma legenda de vez em quando */
    'classico': { fam: 'legenda', torre: T({ n: 6, nome: 'sobrenome', casas: 1 }) },
    /* anos 80: letras amarelas com contorno, sem fundo */
    'tv-80':    { fam: 'legenda', torre: T({ n: 6, nome: 'sobrenome', casas: 1 }) },
    /* F1 1990–1993: caixas cinza chanfradas, nome amarelo, tempo azul-claro */
    'f1-90':    { fam: 'caixa', torre: T({ n: 6, nome: 'sobrenome', num: true }) },
    /* F1 1994–2000: barra escura, posição num quadrado amarelo, letras largas */
    'f1-94':    { fam: 'barra', torre: T({ n: 8, nome: 'sobrenome' }) },
    /* F1 2001–2003: quadradinhos oliva e texto amarelo-claro */
    'f1-01':    { fam: 'barra', torre: T({ n: 8, nome: 'sobrenome', casas: 1 }) },
    /* F1 2004–2008: nome em caixa branca, intervalo em caixa preta */
    'f1-04':    { fam: 'ficha', torre: T({ n: 8, nome: 'sobrenome', casas: 1 }) },
    /* F1 2009: linhas brancas, posição em vermelho */
    'f1-09':    { fam: 'ficha', torre: T({ n: 8, nome: 'sobrenome' }) },
    /* F1 2010–2014: grafite brilhante, traço amarelo inclinado */
    'f1-10':    { fam: 'vidro', torre: T({ n: 10, lider: 'Volta' }) },
    /* F1 2015–2017: torre translúcida fina, setas de posição */
    'f1-15':    { fam: 'vidro', torre: T({ n: 10, seta: true, cab: true }) },
    /* F1 2018 em diante: torre preta, barra da equipe, estados com moldura colorida */
    'f1-18':    { fam: 'torre', torre: T({ n: 20, cab: true, pneu: true, lider: 'Líder' }) },
    'f2-18':    { fam: 'torre', torre: T({ n: 20, cab: true, pneu: true, lider: 'Líder' }) },
    'f3-18':    { fam: 'torre', torre: T({ n: 20, cab: true, lider: 'Líder' }) },
    /* Indy: a CART dos anos 80 e 90, a faixa no alto dos anos 2000, a torre de números */
    'cart-80':  { fam: 'legenda', torre: T({ n: 6, nome: 'sobrenome', num: true, casas: 1 }) },
    'indy-96':  { fam: 'faixa', torre: T({ modo: 'faixa', n: 8, nome: 'sobrenome', num: true, casas: 1 }) },
    'indy-08':  { fam: 'pilone', torre: T({ n: 12, nome: 'sobrenome', num: true, cab: true }) },
    'indy-18':  { fam: 'torre', torre: T({ n: 16, nome: 'sobrenome', num: true, cab: true, lider: 'Líder' }) },
    /* NASCAR: letras grossas, depois a faixa corrida no alto, depois a torre de números */
    'nascar-80': { fam: 'legenda', torre: T({ n: 6, nome: 'sobrenome', num: true, casas: 1 }) },
    'nascar-01': { fam: 'faixa', torre: T({ modo: 'faixa', n: 8, nome: 'sobrenome', num: true, casas: 2 }) },
    'nascar-15': { fam: 'pilone', torre: T({ n: 14, nome: 'sobrenome', num: true, cab: true, casas: 2 }) },
    /* resistência */
    'lemans-99': { fam: 'ficha', torre: T({ n: 8, nome: 'sobrenome', num: true, casas: 1 }) },
    'wec-12':    { fam: 'torre', torre: T({ n: 14, num: true, cab: true, lider: 'Líder' }) },
    /* Fórmula E */
    'fe-14':    { fam: 'vidro', torre: T({ n: 10, cab: true }) },
    'fe-18':    { fam: 'torre', torre: T({ n: 14, cab: true, lider: 'Líder' }) },
    /* turismo */
    'dtm-90':   { fam: 'barra', torre: T({ n: 8, nome: 'sobrenome', num: true, casas: 1 }) },
    'dtm-00':   { fam: 'ficha', torre: T({ n: 10, nome: 'sobrenome', num: true }) },
    'dtm-21':   { fam: 'torre', torre: T({ n: 14, num: true, cab: true, lider: 'Líder' }) },
    'stock-00': { fam: 'vidro', torre: T({ n: 10, nome: 'sobrenome', num: true, cab: true }) },
    'stock-15': { fam: 'torre', torre: T({ n: 14, num: true, cab: true, lider: 'Líder' }) },
    /* kart: o monitor de cronometragem do kartódromo */
    'kart':     { fam: 'monitor', torre: T({ n: 10, nome: 'sobrenome', num: true, cab: true }) }
  };

  /* a F1 de cada época (as mesmas faixas de anos da transmissão) */
  const f1 = ano => ano < 1978 ? 'classico' : ano < 1990 ? 'tv-80' : ano < 1994 ? 'f1-90' : ano < 2001 ? 'f1-94' : ano < 2004 ? 'f1-01'
                  : ano < 2009 ? 'f1-04' : ano < 2010 ? 'f1-09' : ano < 2015 ? 'f1-10' : ano < 2018 ? 'f1-15' : 'f1-18';

  function tema(sk, ano, nivel, kart){
    ano = ano || 2024; nivel = nivel || 0;
    if(kart) return ano < 1978 ? 'classico' : ano < 1995 ? 'tv-80' : 'kart';
    if(sk === 'nascar') return ano < 1979 ? 'classico' : ano < 2001 ? 'nascar-80' : ano < 2015 ? 'nascar-01' : 'nascar-15';
    if(sk === 'indy'){
      /* (as categorias de acesso da Indy seguem a principal) */
      return ano < 1979 ? 'classico' : ano < 1996 ? 'cart-80' : ano < 2008 ? 'indy-96' : ano < 2018 ? 'indy-08' : 'indy-18';
    }
    if(sk === 'wec') return ano < 1979 ? 'classico' : ano < 1999 ? 'tv-80' : ano < 2012 ? 'lemans-99' : 'wec-12';
    if(sk === 'fe') return nivel >= 1 ? f1(ano) : ano < 2018 ? 'fe-14' : 'fe-18';
    if(sk === 'dtm') return ano < 1984 ? 'classico' : ano < 2000 ? 'dtm-90' : ano < 2021 ? 'dtm-00' : 'dtm-21';
    if(sk === 'stock') return ano < 1979 ? 'classico' : ano < 2000 ? 'tv-80' : ano < 2015 ? 'stock-00' : 'stock-15';
    /* a F1 e a escada dela: a F2 e a F3 de hoje têm a mesma família de grafismo, cada uma na sua cor */
    if(nivel >= 1 && ano >= 2018) return nivel === 1 ? 'f2-18' : 'f3-18';
    return f1(ano);
  }

  C2D.Hud = {
    DEF, tema,
    de(sk, ano, nivel, kart){ const id = tema(sk, ano, nivel, kart); return Object.assign({ id }, DEF[id] || DEF['f1-18']); },
    /* um número de carro para quem não tem (sempre o mesmo para o mesmo piloto, sem repetir no grid) */
    numeros(carros){
      /* o seu número fica; entre os outros, quem repete um número ganha outro */
      const usados = new Set();
      for(const c of carros.slice().sort((a, b) => (b.me ? 1 : 0) - (a.me ? 1 : 0))){
        if(c.num != null && !usados.has(+c.num)){ usados.add(+c.num); continue; }
        c.num = null;
      }
      for(const c of carros){
        if(c.num != null) continue;
        let h = 2166136261; for(const ch of String(c.id)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
        let n = 2 + h % 98, g = 0;
        while(usados.has(n) && g++ < 100) n = n >= 99 ? 2 : n + 1;
        usados.add(n); c.num = n;
      }
      return carros;
    },
    /* o sobrenome como a transmissão escreve (maiúsculas, sem acento, cabendo na linha) */
    sobrenome(nome){
      const p = String(nome || '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().split(/\s+/);
      let s = p[p.length - 1] || '???';
      /* "de", "van", "da" antes do sobrenome contam junto se couber */
      if(p.length > 2 && /^(de|da|do|dos|van|von|di|del|della|le|la)$/i.test(p[p.length - 2]) && (p[p.length - 2] + ' ' + s).length <= 11) s = p[p.length - 2] + ' ' + s;
      return s.toUpperCase().slice(0, 11);
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
