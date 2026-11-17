/* ═══════════════════════════════════════════════════════════════════
   IDADE REAL DE CADA PILOTO, EM QUALQUER ANO
   A tabela de nascimentos do jogo (NASC) é indexada pelo nome curto, e o
   nome curto se repete entre pessoas: na Indy, "M. Andretti" é o Mario na
   tabela e o Michael (e depois o Marco) nas escalações; "Rahal" é o Bobby e
   o Graham. Por isso o Michael aparecia com a idade do pai em 1993, e o
   Graham Rahal perdia nota de veterano aos 26. Quem não está na tabela
   ganhava uma idade sorteada entre 24 e 32, em qualquer época.

   Aqui o nome do jogo vira a pessoa do banco histórico naquele ano (quem
   corria com esse nome naquela temporada da categoria principal) e a idade
   sai do nascimento dela (dados/nascimentos.js, do Wikidata). Sem o dado,
   tudo segue como antes.

   - fichaDe: a ficha da tabela continua valendo para quem ela é de fato; se
     naquele ano o nome é de outra pessoa (nascimento a mais de um ano de
     distância), a ficha passa a ser a dela: nascimento e estreia reais.
     Quem não tem ficha continua sem (a curva de nota não muda de regra).
   - idadeEm e os registros do mundo de pilotos (Mundo) usam o nascimento real.
   - Saves antigos do modo chefe são corrigidos ao abrir (só pilotos reais).

   Fica fora dos blocos <script> do index.html para não mudar a versão do
   multiplayer; o gerador do motor do servidor (multiplayer/ferramentas/
   gerar-motor.mjs) e os testes (testes/base.js) carregam este arquivo
   depois do jogo, como a página.
   ═══════════════════════════════════════════════════════════════════ */
const Idades = (function(){
  const ok = () => typeof HIST_NASC !== 'undefined' && HIST_NASC && HIST_NASC.a
    && typeof Hist !== 'undefined' && Hist.ok() && typeof SERIES !== 'undefined';
  const _tira = new Map();
  const tira = s => {
    s = String(s || '');
    let v = _tira.get(s);
    if(v === undefined){
      v = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s*\([^)]*\)\s*$/, '').replace(/[’']/g, '').toLowerCase().trim();
      _tira.set(s, v);
    }
    return v;
  };
  const cachePes = {}, cacheEst = {};
  let indice = null;

  function nascDaPessoa(P){
    if(!P || !ok()) return null;
    const a = HIST_NASC.a[P.pagina];
    return typeof a === 'number' ? a : null;
  }
  /* a temporada da categoria principal da série naquele ano (a supertemporada
     2018-19 do Mundial de Endurance está guardada em 2019, como nas escalações) */
  const cacheTemp = {};
  function temporada(sk, ano){
    if(!SERIES[sk] || typeof campDaCat !== 'function') return null;
    const k = sk + ano;
    if(k in cacheTemp) return cacheTemp[k];
    const cid = campDaCat(SERIES[sk].name, ano);
    let t = cid ? (Hist.temporada(cid, ano) || (sk === 'wec' ? Hist.temporada(cid, ano + 1) : null)) : null;
    /* na divisão da Indy (1996-2007) o banco segue a IRL, mas o grid do jogo ainda tem
       as equipes da CART (a Newman/Haas do Michael Andretti): as duas listas valem */
    if(sk === 'indy' && cid !== 'cart'){
      const c = Hist.temporada('cart', ano);
      if(c && c.inscritos.length) t = { inscritos: (t ? t.inscritos : []).concat(c.inscritos) };
    }
    return (cacheTemp[k] = t);
  }
  /* quanto o nome do jogo combina com a pessoa: 3 o mesmo nome; 2 a inicial
     (ou as primeiras letras: "Mi." é o Michael) com o sobrenome; 1 só o sobrenome */
  function nota(nome, P){
    const n = tira(nome);
    if(!n) return 0;
    if(tira(P.jogo) === n || tira(P.nome) === n) return 3;
    const comp = tira(P.nome).split(/\s+/);
    const m = n.match(/^([a-z]{1,3})\.\s*(.+)$/);
    if(m){
      const sob = m[2];
      const resto = comp.slice(1).join(' ');
      if(comp.length > 1 && comp[0].indexOf(m[1]) === 0 && (resto === sob || resto.endsWith(' ' + sob))) return 2;
      return 0;
    }
    if(comp.length > 1 && (comp.slice(1).join(' ') === n || tira(P.nome).endsWith(' ' + n))) return 1;
    return 0;
  }
  /* a pessoa que corria com esse nome numa temporada, com exatamente essa nota
     de semelhança; null se ninguém ou se dá empate */
  function naTemporada(t, nome, nivel){
    if(!t || !t.inscritos || !t.inscritos.length) return null;
    const quem = new Map();
    t.inscritos.forEach(i => { if(nota(nome, i.p) === nivel) quem.set(i.p.i, i.p); });
    return quem.size === 1 ? [...quem.values()][0] : null;
  }
  /* sem a temporada: o nome no banco inteiro (igual, ou inicial e sobrenome),
     se der uma pessoa só com idade de correr naquele ano */
  function noBanco(nome, ano){
    if(!indice){
      indice = { nome: {}, sob: {} };
      const pos = (m, k, i) => { if(k){ const l = m[k] = m[k] || []; if(l.indexOf(i) < 0) l.push(i); } };
      HIST.P.forEach((s, i) => {
        const P = Hist.pessoa(i);
        pos(indice.nome, tira(P.jogo), i); pos(indice.nome, tira(P.nome), i);
        pos(indice.sob, tira(P.nome).split(/\s+/).pop(), i);
      });
    }
    const vale = P => { const b = nascDaPessoa(P); return b != null && ano - b >= 15 && ano - b <= 62; };
    for(const nivel of [3, 2]){
      const ids = nivel === 3 ? (indice.nome[tira(nome)] || []) : (indice.sob[tira(nome).split(/\s+/).pop()] || []);
      const ps = ids.map(i => Hist.pessoa(i)).filter(P => nota(nome, P) === nivel && vale(P));
      const nasc = [...new Set(ps.map(nascDaPessoa))];
      if(nasc.length === 1) return ps[0];
      if(nasc.length > 1) return null;
    }
    return null;
  }
  /* quem é esse nome nessa série nesse ano: primeiro o mesmo nome nas temporadas
     mais próximas (o "M. Andretti" de 1993 é o Michael do ano anterior, não o Mario
     que corria com outro nome); depois inicial e sobrenome; depois só o sobrenome */
  /* a ordem da busca: [distância em anos, nota]. O nome idêntico no ano e no vizinho
     vem antes da inicial no mesmo ano (o "M. Andretti" de 1993 é o Michael de 1992, não o
     Mario, que corria como "Andretti"); a inicial no mesmo ano vem antes do nome
     idêntico de três anos atrás (o "M. Andretti" de 2010 é o Marco, não o Michael de 2007) */
  const ORDEM = [[0, 3], [-1, 3], [1, 3], [0, 2], [0, 1], [-2, 3], [2, 3], [-3, 3], [3, 3],
                 [-1, 2], [1, 2], [-2, 2], [2, 2], [-3, 2], [3, 2], [-1, 1], [1, 1], [-2, 1], [2, 1], [-3, 1], [3, 1]];
  /* além da pessoa, se a prova é forte: o nome casa com uma pessoa só na lista
     daquele ano, ou é idêntico na lista do ano vizinho */
  function achar(sk, nome, ano){
    if(!ok() || !nome || !ano) return null;
    const k = sk + '|' + nome + '|' + ano;
    if(k in cachePes) return cachePes[k];
    let r = null;
    try {
      for(const [d, nivel] of ORDEM){
        const P = naTemporada(temporada(sk, ano + d), nome, nivel);
        if(P){ r = { P, forte: d === 0 || (Math.abs(d) <= 1 && nivel === 3) }; break; }
      }
      if(!r){ const P = noBanco(nome, ano); if(P) r = { P, forte: false }; }
    } catch(e){ r = null; }
    return (cachePes[k] = r);
  }
  function pessoa(sk, nome, ano){ const r = achar(sk, nome, ano); return r ? r.P : null; }
  function nasc(sk, nome, ano){ return nascDaPessoa(pessoa(sk, nome, ano)); }
  /* o primeiro ano da pessoa na categoria principal da série */
  function estreia(sk, P){
    if(!P) return null;
    if(!cacheEst[sk]){
      const m = cacheEst[sk] = {};
      for(let a = 1950; a <= 2030; a++){
        const t = temporada(sk, a);
        if(t) t.inscritos.forEach(i => { if(!(i.p.i in m)) m[i.p.i] = a; });
      }
    }
    return cacheEst[sk][P.i] || null;
  }

  /* o ano em que o jogo está pensando quando pede a ficha de alguém */
  let ctxAno = null, nascSave = nasc, naBase = false;
  function comAno(ano, fn){
    const antes = ctxAno;
    ctxAno = ano || antes;
    try { return fn(); } finally { ctxAno = antes; }
  }
  /* a ficha certa para a pessoa daquele ano. A da tabela vale, a não ser que a
     lista daquele ano prove que o nome é de outra pessoa (o Michael, não o Mario) */
  function ficha(sk, nome, f, ano){
    if(!f || !ano) return f;
    const r = achar(sk, nome, ano);
    let b = r && r.forte ? nascDaPessoa(r.P) : null;
    /* a ficha que daria uma idade impossível naquele ano cede para a pessoa achada */
    const cabe = n => n != null && ano - n >= 13 && ano - n <= 62;
    if(b == null && r && !cabe(f[0]) && cabe(nascDaPessoa(r.P))) b = nascDaPessoa(r.P);
    if(b == null || Math.abs(b - f[0]) <= 1) return f;
    return [b, estreia(sk, r.P) || f[1]];
  }
  /* o nascimento que vale: o da ficha (corrigida); sem ficha, o da pessoa achada */
  function nascVale(sk, nome, ano, fichaOrig){
    const f = fichaOrig(sk, nome);
    if(f) return ficha(sk, nome, f, ano)[0];
    return nasc(sk, nome, ano);
  }

  /* ─── as trocas: só quando o jogo e os dados estão carregados ─── */
  function instalar(){
    if(typeof fichaDe !== 'function' || typeof idadeEm !== 'function' || typeof skillEm !== 'function') return false;
    const fichaOrig = fichaDe, idadeOrig = idadeEm, skillOrig = skillEm;
    nascSave = (sk, nome, ano) => nascVale(sk, nome, ano, fichaOrig);
    fichaDe = function(sk, nome){
      const f = fichaOrig(sk, nome);
      return ctxAno ? ficha(sk, nome, f, ctxAno) : f;
    };
    idadeEm = function(sk, nome, ano, p){
      const b = nascVale(sk, nome, ano, fichaOrig);
      if(b != null){ const i = ano - b; if(i >= 10 && i <= 80) return i; }
      return comAno(ano, () => idadeOrig(sk, nome, ano, p));
    };
    skillEm = function(sk, nome, ano, base){ return comAno(ano, () => skillOrig(sk, nome, ano, base)); };
    const embrulha = (obj, metodo, anoDe) => {
      if(!obj || typeof obj[metodo] !== 'function') return;
      const orig = obj[metodo];
      obj[metodo] = function(...a){ return comAno(anoDe(a), () => orig.apply(this, a)); };
    };
    if(typeof Engine !== 'undefined') embrulha(Engine, 'aposentouEm', a => a[2]);
    /* as listas de época de cada série são acertadas na primeira vez que a série é aberta,
       depois que as escalações reais já entraram nelas */
    if(typeof eraOfSeries === 'function'){
      const eraOrig = eraOfSeries;
      eraOfSeries = function(year, sk){
        const e = eraOrig(year, sk);
        if(!acertadas[sk] && typeof ESCALA_HIST !== 'undefined' && ESCALA_HIST.feito[sk] && !ESCALA_HIST.rodando){
          acertadas[sk] = true;
          try { acertarListas(sk, fichaOrig); } catch(err){ /* a lista fica como estava */ }
        }
        return e;
      };
    }
    if(typeof Mundo !== 'undefined'){
      embrulha(Mundo, 'real', a => a[3]);
      /* quem vem de um grid de base (Mundo.criarReal) teve o teto calculado com a idade que
         o jogo estima; com o nascimento real, o auge, o declínio e a aposentadoria andam
         junto, para a carreira dele no tempo continuar a mesma (o equilíbrio das carreiras
         de piloto foi medido assim: ver a varredura de 2026-11-12) */
      { const cr = Mundo.criarReal;
        Mundo.criarReal = function(){ const antes = naBase; naBase = true; try { return cr.apply(this, arguments); } finally { naBase = antes; } }; }
      embrulha(Mundo, 'posicionarFuturos', a => a[1]);
      embrulha(Mundo, 'avancar', a => a[1]);
      /* todo piloto real que entra no mundo nasce no ano em que nasceu */
      const criar = Mundo.criar;
      Mundo.criar = function(W, o){
        if(o && o.r && W && W.sk){
          const b = nascVale(W.sk, o.n, ctxAno || W.ano, fichaOrig);
          if(b != null && naBase && o.nasc != null){
            const d = o.nasc - b;
            o = Object.assign({}, o, { nasc: b, pk: (o.pk || 28) + d, dc: (o.dc || 33) + d, fa: (o.fa || 38) + d });
          } else if(b != null) o = Object.assign({}, o, { nasc: b });
        }
        return criar.call(this, W, o);
      };
    }
    if(typeof Chefe !== 'undefined'){
      embrulha(Chefe, 'pilotoReal', a => a[1]);
      embrulha(Chefe, 'olheiros', () => typeof C !== 'undefined' && C ? C.ano : null);
      /* save antigo: a idade gravada dos pilotos reais é corrigida ao abrir */
      const migrar = Chefe.migrar;
      if(typeof migrar === 'function') Chefe.migrar = function(c){
        const r = migrar.apply(this, arguments);
        try { corrigirSave(r || c); } catch(e){ /* o save abre como estava */ }
        return r;
      };
    }
    return true;
  }
  /* ─── quem a lista de época põe no grid fora de hora ───
     Nome sem janela de anos na lista de época vale a década inteira. Assim apareciam
     o Liam Lawson no DTM aos 10 anos, o Robby Gordon na Indy aos 11 e o Ed Jones em
     2010 aos 15; e o mesmo piloto duas vezes, com o nome da lista ("Mi. Andretti",
     "Barrichello") e com o da escalação real ("M. Andretti", "Rubens Barrichello").
     - ninguém entra antes dos 16 anos: a janela da lista começa no ano em que ele faz 16;
     - nome da lista que nunca está numa escalação real, mas cuja pessoa está nela com
       outro nome naquele ano, sai da lista (a pessoa continua no grid pelo nome real). */
  const acertadas = {}, IDADE_MIN = 16, FORA = 9999;
  const ajustes = [];
  function acertarListas(sk, fichaOrig){
    if(!ok() || !SERIES[sk]) return;
    const eras = SERIES[sk].eras || [];
    const ativo = typeof ativoDe === 'function' ? ativoDe(sk) : {};
    const quemNaEscalacao = {};
    const naEscalacao = ano => {
      if(ano in quemNaEscalacao) return quemNaEscalacao[ano];
      const lu = typeof lineupOf === 'function' ? lineupOf(sk, ano) : null, m = new Map();
      if(lu) Object.keys(lu).forEach(n => { const P = pessoa(sk, n, ano); if(P) m.set(P.i, n); });
      return (quemNaEscalacao[ano] = lu ? m : null);
    };
    eras.forEach((e, k) => {
      const fimEra = eras[k + 1] ? eras[k + 1].y - 1 : 2100;
      e.pilots.forEach(p => {
        const de = Math.max(e.y, p[3] || e.y), ate = Math.min(fimEra, p[4] || fimEra);
        if(de > ate || p[3] === FORA) return;
        const meio = Math.min(ate, 2030, Math.max(de, Math.round((de + Math.min(ate, 2030)) / 2)));
        /* 1. a idade mínima */
        let b = nascVale(sk, p[0], meio, fichaOrig);
        for(let a = de; b == null && a <= ate && a <= 2030; a++) b = nascVale(sk, p[0], a, fichaOrig);
        if(b != null && b + IDADE_MIN > de && b + IDADE_MIN <= ate){
          ajustes.push([sk, p[0], 'de', p[3] || null, b + IDADE_MIN]);
          p[3] = b + IDADE_MIN;
        } else if(b != null && b + IDADE_MIN > ate){
          ajustes.push([sk, p[0], 'fora', p[3] || null, null]);
          p[3] = p[4] = FORA; return;
        }
        /* 2. o mesmo piloto com outro nome na escalação real */
        if(ativo[p[0]]) return;
        for(let a = Math.max(de, p[3] || de); a <= ate; a++){
          const m = naEscalacao(a); if(!m) continue;
          const P = pessoa(sk, p[0], a);
          const outro = P && m.get(P.i);
          if(outro && outro !== p[0]){
            ajustes.push([sk, p[0], 'repetido', a, outro]);
            p[3] = p[4] = FORA; return;
          }
        }
      });
    });
  }

  /* pilotos reais de um save do chefe: os da equipe e os do mundo */
  function corrigirSave(c){
    if(!c || !ok()) return 0;
    const sk = SERIES[c.sk] ? c.sk : 'f1';
    let n = 0;
    (c.pilotos || []).forEach(p => {
      if(!p || !p.real || p.nasc == null) return;
      const b = nascSave(sk, p.nome, c.ano);
      if(b != null && b !== p.nasc){ p.nasc = b; n++; }
    });
    if(c.W && c.W.p) Object.values(c.W.p).forEach(r => {
      if(!r || !r.r || r.jog || r.nasc == null) return;
      const b = nascSave(c.W.sk || sk, r.n, r.entrou || c.inicio || c.ano);
      if(b != null && b !== r.nasc){ r.nasc = b; n++; }
    });
    return n;
  }

  const instalado = instalar();
  return { instalado, pessoa, nasc, estreia, ficha, corrigirSave, comAno, ajustes };
})();
