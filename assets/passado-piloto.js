/* ═══════════════════════════════════════════════════════════════════
   O PASSADO DO PILOTO REAL QUE VOCÊ ASSUME
   Ao assumir um piloto que existiu (cenário ou "assumir qualquer piloto do
   grid"), a carreira começava zerada: Verstappen chegava a 2023 sem nenhuma
   vitória. Aqui ele chega com o que o banco histórico registra de antes do
   ano em que você assume, e a carreira soma por cima.

   - De onde vem: dados/historico.js (inscritos com a posição final e o
     campeão de cada temporada, de todos os campeonatos do banco),
     dados/vencedores.js (vencedor de cada corrida das categorias principais)
     e dados/escalacoes.js (etapas de cada piloto na F1 e na Indy).
   - Conta só o que a fonte diz. Pódios, poles, voltas mais rápidas, pontos e
     abandonos de antes não estão no banco: ficam como "—", nunca como zero.
     Vitórias e provas, só onde o banco tem o dado daquela temporada.
   - Fica guardado no save (S.passado, S.vPassado = 1), separado do que você
     faz: S.career continua sendo só "com você", então nada da simulação
     (fama, ofertas, marcos de primeira vitória) muda. As telas mostram tudo
     SOMADO (Passado.carreira): painel, estatísticas, números, rankings e galeria.
   - Saves de carreira real de antes disto ganham o passado ao abrir.

   Fica fora dos blocos <script> do index.html para não mudar a versão do
   multiplayer; os testes (testes/base.js) carregam este arquivo depois do jogo.
   ═══════════════════════════════════════════════════════════════════ */
const Passado = (function(){
  const ok = () => typeof Hist !== 'undefined' && Hist.ok() && typeof HIST !== 'undefined' && HIST.T;
  const b36 = s => s ? parseInt(s, 36) : -1;
  const tira = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s*\([^)]*\)\s*$/, '').toLowerCase().trim();

  /* o campeonato é a categoria principal de alguma série naquele ano? */
  const _topo = {};
  function topoDe(cid, ano){
    const k = cid + ':' + ano;
    if(k in _topo) return _topo[k];
    let r = null;
    if(typeof SERIES !== 'undefined' && typeof campDaCat === 'function'){
      for(const sk of (typeof SERIES_KEYS !== 'undefined' ? SERIES_KEYS : Object.keys(SERIES))){
        const s = SERIES[sk];
        if(!s || ano < (s.from || 0)) continue;
        let c = null;
        try { c = campDaCat(s.name, ano); } catch(e){}
        if(c === cid){ r = sk; break; }
      }
    }
    return (_topo[k] = r);
  }

  /* quem é esse piloto no banco: a pessoa que corria com esse nome na série,
     naquele ano ou nos vizinhos (assets/idades.js já resolve os homônimos) */
  function pessoa(sk, nome, ano){
    if(!ok() || !nome) return null;
    try { if(typeof Idades !== 'undefined' && Idades.pessoa){ const P = Idades.pessoa(sk, nome, ano); if(P) return P; } } catch(e){}
    return null;
  }

  /* as vitórias da pessoa numa temporada; null quando o banco não tem o vencedor de cada corrida */
  function vitorias(cid, ano, P){
    const V = typeof HIST_V !== 'undefined' ? HIST_V : null;
    const l = V && V[cid] && V[cid][ano];
    if(!l) return null;
    const nomes = [tira(P.nome), tira(P.jogo)];
    let n = 0;
    l.forEach(w => { if([].concat(w).some(x => typeof x === 'number' ? x === P.i : nomes.indexOf(tira(x)) >= 0)) n++; });
    return n;
  }
  /* as etapas em que a pessoa esteve inscrita; null sem a escalação etapa a etapa */
  function provas(cid, ano, P){
    const E = typeof HIST_ESC !== 'undefined' ? HIST_ESC : null;
    const t = E && E[cid] && E[cid][ano];
    if(!t || !t.l) return null;
    let n = 0, achou = false;
    t.l.forEach(eq => (eq[4] || []).forEach(x => { if(x[0] === P.i || (typeof x[0] === 'string' && tira(x[0]) === tira(P.nome))){ n += x[1] || 0; achou = true; } }));
    if(!achou) return null;
    const cal = Hist.temporada(cid, ano);
    const lim = cal && cal.calendario && cal.calendario.length;
    return lim ? Math.min(n, lim) : n;
  }

  /* o passado inteiro: uma linha por campeonato e ano, antes do ano em que você assume */
  function montar(sk, nome, ano){
    const out = { v: 1, nome, sk, ate: ano - 1, pessoa: null, temporadas: [] };
    const P = pessoa(sk, nome, ano);
    if(!P) return out;
    out.pessoa = { i: P.i, nome: P.nome, pagina: P.pagina };
    const nomeT = tira(P.nome);
    Object.keys(HIST.T).forEach(cid => {
      const anos = HIST.T[cid];
      Object.keys(anos).forEach(a => {
        const y = +a;
        if(!(y < ano)) return;
        const row = anos[a];
        if(!row) return;
        const [st, , , ich, chTxt, ents] = row;
        let pos = null, equipes = [], inscrito = false;
        if(ents) ents.split('|').forEach(s => {
          const c = s.split(',');
          if(b36(c[0]) !== P.i) return;
          inscrito = true;
          const p = c[4] ? +c[4] : null;
          if(p && (pos == null || p < pos)) pos = p;
          const eq = c[1] ? HIST.E[b36(c[1])] : null;
          if(eq && equipes.indexOf(eq) < 0) equipes.push(eq);
        });
        const titulo = typeof ich === 'number' ? ich === P.i : !!(chTxt && tira(chTxt) === nomeT);
        const topo = topoDe(cid, y);
        const w = topo ? vitorias(cid, y, P) : null;
        if(!inscrito && !titulo && !w) return;
        out.temporadas.push({ ano: y, cid, topo, st, equipe: equipes.join(' / ') || null,
          pos: titulo ? 1 : pos, titulo, wins: w, provas: topo ? provas(cid, y, P) : null });
      });
    });
    out.temporadas.sort((a, b) => a.ano - b.ano || (b.topo ? 1 : 0) - (a.topo ? 1 : 0) || String(a.cid).localeCompare(String(b.cid)));
    return out;
  }

  const nomeCamp = cid => { const c = ok() && Hist.camp(cid); return c ? c.n : cid; };

  /* o resumo que as telas usam: por campeonato, por série (só a categoria
     principal) e os totais. wins/provas null = sem o dado em nenhuma temporada;
     *Parcial = faltou o dado em alguma. */
  function resumo(pass){
    if(!pass || !pass.temporadas) return null;
    const ls = pass.temporadas;
    const soma = (g, t) => {
      g.temporadas++;
      if(t.titulo) g.titulos++;
      if(t.wins == null) g.winsParcial = true; else g.wins = (g.wins || 0) + t.wins;
      if(t.provas == null) g.provasParcial = true; else g.provas = (g.provas || 0) + t.provas;
      if(t.pos && (g.best == null || t.pos < g.best)) g.best = t.pos;
      g.de = g.de == null ? t.ano : Math.min(g.de, t.ano); g.ate = g.ate == null ? t.ano : Math.max(g.ate, t.ano);
    };
    const vazio = o => Object.assign({ temporadas: 0, titulos: 0, wins: null, provas: null, best: null, winsParcial: false, provasParcial: false, de: null, ate: null }, o);
    const porCamp = {}, porSerie = {}, topo = vazio({ rot: 'Categorias principais' }), base = vazio({ rot: 'Outras categorias' });
    ls.forEach(t => {
      soma(porCamp[t.cid] = porCamp[t.cid] || vazio({ cid: t.cid, rot: nomeCamp(t.cid), topo: t.topo }), t);
      if(t.topo){ soma(porSerie[t.topo] = porSerie[t.topo] || vazio({ sk: t.topo }), t); soma(topo, t); }
      else soma(base, t);
    });
    const grupos = Object.values(porCamp).sort((a, b) => (b.topo ? 1 : 0) - (a.topo ? 1 : 0) || b.temporadas - a.temporadas || a.de - b.de);
    /* anos distintos: um ano com F1 e Le Mans é uma temporada da carreira, não duas */
    const anos = [...new Set(ls.map(t => t.ano))];
    return { pessoa: pass.pessoa, ate: pass.ate, linhas: ls, grupos, porSerie, topo, base,
             anos: anos.length, de: anos.length ? Math.min(...anos) : null, titulos: topo.titulos + base.titulos };
  }

  function doSave(){ return typeof S !== 'undefined' && S && S.passado && S.passado.temporadas && S.passado.temporadas.length ? S.passado : null; }
  function atual(){ return resumo(doSave()); }

  /* o que entra no registro da galeria e no ranking real: só a categoria principal de cada série */
  function antesDoRec(r){
    if(!r) return null;
    const ps = {};
    Object.keys(r.porSerie).forEach(sk => { const x = r.porSerie[sk]; ps[sk] = { titles: x.titulos, wins: x.wins || 0, seasons: x.temporadas, gps: x.provas || 0 }; });
    return { pessoa: r.pessoa ? r.pessoa.nome : null, ate: r.ate, titles: r.topo.titulos, jrTitles: r.base.titulos,
             wins: r.topo.wins || 0, gps: r.topo.provas || 0, seasons: r.anos, porSerie: ps };
  }

  /* a carreira somada: o S.career (com você) mais o que o banco registra de antes.
     Só soma o que a fonte tem: títulos, temporadas, vitórias e provas da categoria
     principal; pódios, poles, voltas mais rápidas, abandonos e pontos ficam os seus. */
  function carreira(c){
    const r = atual();
    if(!c || !r) return c;
    const x = JSON.parse(JSON.stringify(c)), t = r.topo;
    x.titles = (x.titles || 0) + t.titulos;
    x.jrTitles = (x.jrTitles || 0) + r.base.titulos;
    x.wins = (x.wins || 0) + (t.wins || 0);
    x.gps = (x.gps || 0) + (t.provas || 0);
    x.seasons = (x.seasons || 0) + r.anos;
    if(t.wins) x.best = 1;
    /* os anos só na base entram na conta da base (a tela de números separa principal e base) */
    const anosTopo = new Set(r.linhas.filter(l => l.topo).map(l => l.ano));
    const soBase = new Set(r.linhas.filter(l => !l.topo && !anosTopo.has(l.ano)).map(l => l.ano)).size;
    if(soBase){ x.base = x.base || (Engine.cartelVazio ? Engine.cartelVazio() : { seasons: 0 }); x.base.seasons = (x.base.seasons || 0) + soBase; }
    x.porSerie = x.porSerie || {};
    Object.keys(r.porSerie).forEach(sk => {
      const y = r.porSerie[sk], z = x.porSerie[sk] = Object.assign({ titles: 0, wins: 0, podiums: 0, seasons: 0 }, x.porSerie[sk] || {});
      z.titles += y.titulos; z.wins += y.wins || 0; z.seasons += y.temporadas; z.gps = (z.gps || 0) + (y.provas || 0); z.topo = (z.topo || 0) + y.temporadas;
    });
    x.comPassado = { ate: r.ate };
    return x;
  }
  /* desenha uma tela antiga com a carreira somada no lugar do S.career, e devolve o original */
  function comSomado(fn){
    if(!S || !S.career || !atual()) return fn();
    const orig = S.career;
    S.career = carreira(orig);
    try { return fn(); } finally { S.career = orig; }
  }

  /* as temporadas de antes como linhas das estatísticas completas; o que o banco não tem fica "—" */
  function topoNome(sk, ano){
    try { const e = eraOfSeries(ano, sk); return resolveRung(e.ladder[e.ladder.length - 1], (S.driver && S.driver.cc) || 'BR', ano); }
    catch(e){ return SERIES[sk] ? SERIES[sk].name : sk; }
  }
  function linhasEstat(r){
    const nd = '—';
    return r.linhas.map(l => ({ ano: l.ano, cat: l.topo ? topoNome(l.topo, l.ano) : nomeCamp(l.cid), sk: l.topo || null,
      tipo: l.topo ? 'topo' : /^kart/.test(l.cid) ? 'kart' : 'base', equipe: l.equipe, papel: null, emAndamento: false, antes: true,
      inscricoes: l.provas, largadas: l.provas != null ? l.provas : nd, wins: l.wins != null ? l.wins : nd,
      podiums: nd, poles: nd, fls: nd, dnfs: nd, pts: nd, pos: l.pos, titulo: l.titulo, antigo: false }));
  }
  /* o mesmo agrupamento de Engine.estatisticas, com as linhas de antes somadas */
  const CAMPOS = ['largadas', 'wins', 'podiums', 'poles', 'fls', 'dnfs', 'pts'];
  function reagrupar(e, extra){
    const linhas = e.linhas.concat(extra).sort((a, b) => a.ano - b.ano);
    const vazio = rot => ({ rot, temporadas: 0, inscricoes: 0, inscDesconhecidas: false, largadas: 0, wins: 0, podiums: 0, poles: 0, fls: 0, dnfs: 0, pts: 0, titulos: 0,
      equipes: new Set(), campeonatos: new Set(), anos: [], _sem: {}, _n: 0, _anosAntes: new Set() });
    const somar = (g, l) => {
      /* um ano com dois campeonatos de antes (F1 e Le Mans) é uma temporada só */
      if(l.antes){ if(!g._anosAntes.has(l.ano)) g.temporadas++; g._anosAntes.add(l.ano); }
      else if(!l.convocacao) g.temporadas++;
      if(l.inscricoes == null) g.inscDesconhecidas = true; else g.inscricoes += l.inscricoes;
      CAMPOS.forEach(k => { const v = l[k]; if(typeof v === 'number') g[k] += v; else if(l.antes) g._sem[k] = (g._sem[k] || 0) + 1; });
      g._n++;
      if(l.titulo) g.titulos++;
      if(l.equipe && l.equipe !== 'Sem equipe') g.equipes.add(l.equipe);
      g.campeonatos.add(l.cat); g.anos.push(l.ano);
    };
    const grupos = { kart: vazio('Kart'), base: vazio('Categorias de base') }, topos = {}, total = vazio('Todas as categorias');
    linhas.forEach(l => {
      if(l.tipo === 'topo'){ const k = l.sk + '|' + l.cat; (topos[k] = topos[k] || vazio(l.cat)); somar(topos[k], l); topos[k].sk = l.sk; }
      else somar(grupos[l.tipo] || grupos.base, l);
      somar(total, l);
    });
    /* um grupo só de antes, sem o dado em nenhuma linha, mostra "—" e não zero */
    const fecha = g => {
      CAMPOS.forEach(k => { if(g._n && g._sem[k] === g._n) g[k] = '—'; });
      delete g._sem; delete g._n; delete g._anosAntes;
      return Object.assign(g, { equipes: [...g.equipes], campeonatos: [...g.campeonatos],
        de: g.anos.length ? Math.min(...g.anos) : null, ate: g.anos.length ? Math.max(...g.anos) : null });
    };
    const out = [];
    if(grupos.kart.temporadas) out.push(fecha(grupos.kart));
    if(grupos.base.temporadas) out.push(fecha(grupos.base));
    Object.values(topos).forEach(g => out.push(Object.assign(fecha(g), { topo: true })));
    return Object.assign(e, { grupos: out, total: fecha(total), linhas });
  }

  /* ─── o save ─── */
  function preencher(sk, nome, ano){
    if(!S) return;
    try { S.passado = montar(sk, nome, ano); } catch(e){ S.passado = { v: 1, nome, sk, ate: ano - 1, pessoa: null, temporadas: [], erro: true }; }
    S.vPassado = 1;
  }
  /* save de carreira real de antes disto: o passado sai do nome, da série e do ano em que começou */
  function migrar(){
    if(!S || !S.real || S.vPassado === 1) return false;
    const ano = S.startYear || S.goalYear || S.year;
    const a0 = (S.archive || [])[0];
    const sk = (a0 && a0.sk) || S.series || 'f1';
    preencher(sk, S.realName || (S.driver && S.driver.name), ano);
    return true;
  }

  /* ─── as trocas ─── */
  function instalar(){
    if(typeof Game === 'undefined' || typeof Engine === 'undefined' || typeof UI === 'undefined') return false;

    const begin = Game.beginReal;
    if(begin) Game.beginReal = function(o){
      const r = begin.apply(this, arguments);
      if(S && S.real && o) preencher(o.sk, o.name, o.year);
      return r;
    };
    const migHist = Engine.migrarHistorico;
    if(migHist) Engine.migrarHistorico = function(){
      const r = migHist.apply(this, arguments);
      try { migrar(); } catch(e){}
      return r;
    };
    const est = Engine.estatisticas;
    if(est) Engine.estatisticas = function(){
      const e = est.apply(this, arguments);
      if(!e) return e;
      const r = e.passado = atual();
      return r ? reagrupar(e, linhasEstat(r)) : e;
    };

    /* os maiores da história real: você no lugar da pessoa que assumiu, com o que ela tinha antes */
    if(typeof rankingLendas === 'function'){
      const orig = rankingLendas;
      rankingLendas = function(sk, rec){
        let antes = null, somado = false, quem = null;
        if(rec && rec.antes){ antes = rec.antes; somado = !!rec.antesSomado; quem = rec.antes.pessoa; }
        else if(rec && S && S.driver && rec.name === S.driver.name){ const r = atual(); if(r){ antes = antesDoRec(r); quem = antes.pessoa; } }
        let rec2 = rec;
        const a = antes && antes.porSerie[sk];
        if(a && !somado){
          const ps = Object.assign({}, rec.porSerie || {});
          const x = Object.assign({ titles: 0, wins: 0, podiums: 0, seasons: 0 }, ps[sk] || {});
          x.titles = (x.titles || 0) + a.titles; x.wins = (x.wins || 0) + a.wins;
          x.topo = (x.topo || 0) + a.seasons;
          ps[sk] = x;
          rec2 = Object.assign({}, rec, { porSerie: ps });
        }
        const res = orig(sk, rec2);
        if(quem && res && res.lista){
          const t = tira(quem);
          const fora = res.lista.filter(x => !x.eu && tira(x.nome) === t);
          if(fora.length){
            res.lista = res.lista.filter(x => fora.indexOf(x) < 0);
            res.lista.forEach((x, i) => x.pos = i + 1);
            res.pos = res.eu ? res.lista.indexOf(res.eu) + 1 : null;
            res.total = res.lista.length;
          }
        }
        if(res && res.eu && a){ res.eu.tAntes = a.titles; res.eu.vAntes = a.wins; }
        return res;
      };
    }

    /* o ranking deste save: a história real de antes já está lá pelo nome; ela passa para a sua linha */
    if(typeof rankingUniverso === 'function'){
      const orig = rankingUniverso;
      rankingUniverso = function(sk, rec){
        const res = orig.apply(this, arguments);
        const r = atual(), a = r && r.porSerie[sk];
        if(!res || res.status !== 'ok' || !a || !S || !S.driver) return res;
        const nome = S.driver.name, t = a.titulos, v = a.wins || 0;
        const velho = res.linhas.find(x => !x.eu && x.nome === nome);
        if(velho){
          velho.t = Math.max(0, velho.t - t); velho.tAntes = Math.max(0, (velho.tAntes || 0) - t);
          velho.v = Math.max(0, velho.v - v); velho.vAntes = Math.max(0, (velho.vAntes || 0) - v);
          if(velho.anosT) velho.anosT = velho.anosT.filter(y => !r.linhas.some(l => l.titulo && l.topo === sk && l.ano === y));
        }
        let eu = res.eu;
        if(!eu){ eu = { nome, cc: S.driver.cc, t: 0, v: 0, eu: true }; res.linhas.push(eu); }
        eu.t += t; eu.v += v; eu.tAntes = t; eu.vAntes = v;
        res.linhas = res.linhas.filter(x => x.eu || x.t || x.v);
        res.linhas.forEach(x => x.p = pontosLenda(x.t, x.v));
        res.linhas.sort((x, y) => y.t - x.t || y.v - x.v || x.nome.localeCompare(y.nome));
        res.linhas.forEach((x, i) => x.pos = i + 1);
        res.eu = eu; res.pos = res.linhas.indexOf(eu) + 1;
        return res;
      };
    }

    /* a galeria: a carreira encerrada leva o que o piloto tinha antes, somado e identificado */
    if(typeof Store !== 'undefined' && Store.galeria){
      const gal = Store.galeria;
      Store.galeria = function(k, rec){
        try {
          if(k === 'vdo_hall' && rec && !rec.antes && S && S.driver && rec.name === S.driver.name){
            const r = atual();
            if(r){
              const a = antesDoRec(r);
              rec.antes = a; rec.antesSomado = true;
              rec.titles = (rec.titles || 0) + a.titles; rec.jrTitles = (rec.jrTitles || 0) + a.jrTitles;
              rec.wins = (rec.wins || 0) + a.wins; rec.gps = (rec.gps || 0) + a.gps; rec.seasons = (rec.seasons || 0) + a.seasons;
              const ps = rec.porSerie = Object.assign({}, rec.porSerie || {});
              Object.keys(a.porSerie).forEach(sk => {
                const x = ps[sk] = Object.assign({ titles: 0, wins: 0, podiums: 0, seasons: 0 }, ps[sk] || {}), y = a.porSerie[sk];
                x.titles += y.titles; x.wins += y.wins; x.seasons += y.seasons; x.gps = (x.gps || 0) + y.gps; x.topo = (x.topo || 0) + y.seasons;
              });
              rec.score = (rec.score || 0) + a.titles * 100 + a.wins * 12 + a.seasons * 2;
            }
          }
        } catch(e){}
        return gal.apply(this, arguments);
      };
    }

    /* as estatísticas completas já vêm somadas; a nota diz de onde vem o que é de antes */
    const comNota = orig => function(){
      const r = atual();
      if(!r) return orig.apply(this, arguments);
      const modal = UI.modal;
      UI.modal = function(html, ...resto){
        const i = typeof html === 'string' ? html.indexOf('<div class="mbd">') : -1;
        if(i >= 0){ const j = i + '<div class="mbd">'.length; html = html.slice(0, j) + `<p class="mut" style="font-size:14px;margin:0 0 10px">${nota(r)}</p>` + html.slice(j); }
        return modal.call(this, html, ...resto);
      };
      try { return comSomado(() => orig.apply(this, arguments)); } finally { UI.modal = modal; }
    };
    if(UI.estatisticas) UI.estatisticas = comNota(UI.estatisticas);
    /* "Números da carreira": somados, mas as taxas por prova só com o que tem pódio e abandono registrados */
    if(UI.records){
      const rec = comNota(UI.records);
      UI.records = function(){
        if(document.body && document.body.dataset && document.body.dataset.tela === 'chefe') return rec.apply(this, arguments);
        const c = S && S.career, modal = UI.modal;
        if(c && atual()) UI.modal = function(html, ...resto){
          if(typeof html === 'string'){
            const pct = v => c.gps ? ((v / c.gps) * 100).toFixed(1) : '0.0';
            html = html.replace(/(Pódios por prova<\/span><b>)[\d.]+%/, `$1${pct(c.podiums)}%`)
                       .replace(/(Taxa de abandono<\/span><b>)[\d.]+%/, `$1${pct(c.dnfs)}%`);
          }
          return modal.call(this, html, ...resto);
        };
        try { return rec.apply(this, arguments); } finally { UI.modal = modal; }
      };
    }
    /* a ficha da tela antiga */
    ['drvCard', 'trophyList'].forEach(k => {
      if(typeof UI[k] !== 'function') return;
      const orig = UI[k];
      UI[k] = function(){ return comSomado(() => orig.apply(this, arguments)); };
    });
    return true;
  }

  /* ─── a nota que acompanha os números somados ─── */
  function nota(r){
    return `<span>Inclui a carreira real até ${r.ate}, do banco histórico (Wikipedia). Vitórias e provas de antes entram onde o banco tem o dado; pódios, poles, voltas mais rápidas, abandonos e pontos contam a partir de ${r.ate + 1}.</span>`;
  }

  const instalado = instalar();
  return { instalado, montar, resumo, atual, carreira, comSomado, migrar, pessoa, antesDoRec, nota, nomeCamp };
})();
