/* Painel da carreira de piloto.
   A tela de antes (ficha à esquerda, retrospecto e abas à direita) vira uma folha com trilho
   próprio, no mesmo traço do hub do chefe: Início, Perfil, Equipe, Calendário, Resultados,
   Estatísticas, Mercado e Notícias. Só desenha: não muda simulação, save nem multiplayer.
   As tabelas que já existiam (retrospecto, classificação, construtores, histórico, imprensa)
   continuam sendo feitas pelas funções de antes; aqui elas só mudam de lugar.
   Fica fora dos <script> embutidos de propósito: a versão do jogo (o hash que o servidor do
   multiplayer confere) não muda por causa do visual. */
(function(){
  if(typeof UI === 'undefined' || typeof Engine === 'undefined' || !UI.render) return;

  const PAGS = [
    ['inicio', 'Início'], ['perfil', 'Perfil do piloto'], ['equipe', 'Equipe'], ['calendario', 'Calendário'],
    ['resultados', 'Resultados'], ['estatisticas', 'Estatísticas'], ['mercado', 'Mercado'], ['noticias', 'Notícias']
  ];
  /* as peças que as funções antigas desenham por id */
  const LEGADO = ['retroBox', 'sumBar', 'curveBox', 'pane-drv', 'pane-con', 'pane-hist', 'pane-mid'];
  const PP = { pag: 'inicio', anima: true, topo: false };
  const renderAntigo = UI.render;

  const $ = id => document.getElementById(id);
  const n = v => Number.isFinite(v) ? v : 0;
  const tenta = (f, d) => { try { return f(); } catch(e){ return d; } };
  const nomePais = cc => ((typeof COUNTRIES !== 'undefined' && COUNTRIES.find(c => c.cc === String(cc || '').toUpperCase())) || {}).name || '';

  /* ── a casca: monta uma vez, ao lado da tela antiga (que fica escondida e guarda as peças) ── */
  function montar(){
    const sec = $('scr-career');
    if(!sec || sec.querySelector('.pp')) return !!sec;
    sec.classList.add('pp-on');
    sec.insertAdjacentHTML('afterbegin', `<div class="chx pp">
      <aside class="chx-rail" id="ppRail" aria-label="A carreira"></aside>
      <div class="chx-main"><header class="chx-topo" id="ppTopo"></header><div id="ppPrincipal"></div></div>
      <div class="pp-deposito" id="ppDeposito"></div></div>`);
    return true;
  }
  /* antes de redesenhar, as peças antigas voltam para o depósito; depois, vão para os encaixes */
  function guardar(){ const d = $('ppDeposito'); if(d) LEGADO.forEach(id => { const e = $(id); if(e && e.parentNode !== d) d.appendChild(e); }); }
  function encaixar(){
    document.querySelectorAll('#ppPrincipal [data-slot]').forEach(s => { const e = $(s.dataset.slot); if(e) s.appendChild(e); });
    ['pane-drv', 'pane-con', 'pane-hist', 'pane-mid'].forEach(id => { const e = $(id); if(e) e.classList.add('on'); });
  }

  /* ── dados de apoio ── */
  const temporada = () => S.season;
  const proxima = () => { const sea = S.season; return S.retired || sea.fired ? null : sea.calendar[sea.round] || null; };
  const companheiro = () => { const sea = S.season; return sea.teammateId ? sea.field.find(f => f.id === sea.teammateId) : null; };
  function fase(){
    const d = S.driver;
    if(d.age < 20) return 'Em formação';
    if(d.peak != null && d.age <= d.peak) return 'Perto do auge';
    return 'Depois do auge';
  }
  function contratoTxt(){
    const y = S.contract ? S.contract.years : 0;
    if(!S.team || S.team.livre || !y) return 'sem contrato';
    return y > 1 ? 'mais ' + y + ' anos' : 'último ano';
  }
  function papelTxt(){
    if(S.papel) return Engine.PAPEIS[S.papel.tipo] || 'Reserva';
    if(tenta(() => Engine.vinculoReserva(), false) && S.reservaDe) return 'Reserva da ' + S.reservaDe.equipe;
    return '';
  }
  function dinheiro(){
    if(!tenta(() => Engine.ehRealista(), false)) return null;
    const b = tenta(() => Engine.balancoAno(), null);
    if(b && b.salario > 0) return ['Salário', fmtD(b.salario)];
    return ['Saldo', fmtD(n(S.money && S.money.saldo))];
  }
  function fotoCapa(){
    const ep = UIC.fotoEpoca(S.year);
    if(!S.team || S.team.livre) return ep;
    const tm = companheiro();
    const k = tenta(() => Fotos.carro(S.team.name, S.year, [S.driver.name, tm && tm.name].filter(Boolean), S.season.cat), null);
    if(!k) return ep;
    return { src: k.url, alt: k.ano ? `${k.chassi}, ${k.ano}` : k.chassi, externa: true, chassi: k.equipe ? null : k.chassi, anoCarro: k.ano,
      credito: `<a href="${esc(k.pagina)}" target="_blank" rel="noopener noreferrer" data-i18n-ignore>${esc(k.chassi)}${k.ano ? ' (' + k.ano + ')' : ''}</a> · Foto: ${esc(k.autor)}, ${esc(k.lic)}, via Wikimedia Commons` };
  }
  /* a foto do Commons que não carregou vira a foto de época, com o crédito dela */
  PP.fotoFalhou = function(img){
    img.onerror = null;
    const ep = UIC.fotoEpoca(S ? S.year : 2000);
    img.src = ep.src; img.alt = ep.alt;
    const c = img.parentNode && img.parentNode.querySelector('.chx-credito .carro');
    if(c) c.textContent = ep.credito;
  };
  function pedirFotos(){
    if(typeof Fotos === 'undefined' || Fotos.ok()) return;
    Fotos.carregar();
    const sc = document.querySelector('script[src="dados/fotos.js"]');
    if(sc && !sc.dataset.pp){
      sc.dataset.pp = '1';
      sc.addEventListener('load', () => { if(document.body.dataset.tela === 'career' && S && S.season) UI.render(); });
    }
  }

  /* ── o trilho ── */
  function trilho(){
    const d = S.driver, sea = S.season, emMP = Game.emMP();
    const marca = {};
    if((S.pendingOffers || []).length) marca.mercado = S.pendingOffers.length;
    return `<div class="chx-equipe" style="--tc:${esc(S.team && S.team.color || '#3a3f46')}"><s></s><div><b data-i18n-ignore>${esc(d.name)}</b><span><span data-i18n-ignore>nº ${d.num}</span> · <span data-i18n-ignore>${esc(S.team ? S.team.name : '')}</span> · <span>${sea.year}</span></span></div></div>
      <nav class="chx-nav" aria-label="Áreas da carreira">${PAGS.map(([k, nm]) => `<button data-pg="${k}" onclick="PP.ir('${k}')"${PP.pag === k ? ' aria-current="page"' : ''}><span>${nm}</span>${marca[k] ? `<i title="Precisa de você">${marca[k]}</i>` : ''}</button>`).join('')}</nav>
      <div class="chx-rail-pe">${emMP ? '' : `<div class="pp-ajustes">
          <button onclick="UI.difModal()"><span>Dificuldade</span><b>${esc(Engine.dif().n)}</b></button>
          <button onclick="Game.toggleFast()" title="No modo rápido a equipe monta o carro e define o treino da pré-temporada"><span>Modo</span><b>${S.opts.fast ? 'Rápido' : 'Completo'}</b></button>
        </div>`}
        <button class="chx-sair" onclick="PP.trocarTela()">Usar a tela antiga</button>
        <button class="chx-sair" onclick="UI.confirmQuit()">Sair para o início</button>
      </div>`;
  }

  /* ── o placar do alto ── */
  function topo(){
    const sea = S.season, sum = Engine.summary(sea), nx = proxima();
    const nome = (PAGS.find(p => p[0] === PP.pag) || PAGS[0])[1];
    const chips = [
      ['Campeonato', sum.races ? ord(sum.pos) : '–'],
      ['Pontos', sum.pts],
      [nx ? 'Etapa' : 'Etapas', nx ? `${nx.r}/${sea.calendar.length}` : `${sum.races}/${sea.calendar.length}`]
    ];
    if(PP.pag !== 'inicio') chips.push(['Geral', S.driver.ovr]);
    return `<div class="chx-topo-tx"><h1>${nome}</h1><p><span data-i18n-ignore>${esc(S.team ? S.team.name : '')}</span> · <span>${esc(sea.cat)}</span> · <span>temporada</span> <span>${sea.year}</span></p></div>
      <div class="chx-chips pp-chips-${chips.length}">${chips.map(([a, b]) => `<div class="chx-chip"><span>${a}</span><b>${b}</b></div>`).join('')}</div>`;
  }

  /* ── peças ── */
  const cab = (titulo, pg, dado) => `<div class="chx-p-cab"><h2>${pg ? `<button class="chx-ir" onclick="PP.ir('${pg}')">${titulo}</button>` : titulo}</h2>${dado ? `<p>${dado}</p>` : ''}</div>`;
  const barra = (nome, v, i) => `<div class="chx-barra" style="--i:${i}"><span>${nome}</span><b>${Math.round(v)}</b><s><i style="width:${clamp(v, 0, 100)}%"></i></s></div>`;
  const fatos = linhas => `<dl class="chx-fatos">${linhas.filter(Boolean).map(([a, b, cl]) => `<div class="${cl || ''}"><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl>`;
  const nums = (itens, cls) => `<dl class="pp-nums${cls ? ' ' + cls : ''}">${itens.filter(Boolean).map(([v, r, c]) => `<div class="${c || ''}"><dt>${r}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
  const slot = id => `<div class="pp-slot" data-slot="${id}"></div>`;

  function capa(){
    const d = S.driver, t = S.team || { name: '', color: '#3a3f46' }, foto = fotoCapa();
    const ret = tenta(() => Fotos.piloto(d.name), null);
    const papel = papelTxt(), din = dinheiro();
    const faixa = [
      ['Fama', `${d.fame}`, `<s><i style="width:${clamp(d.fame, 0, 100)}%"></i></s>`],
      ['Moral', `${d.morale}`, `<s><i style="width:${clamp(d.morale, 0, 100)}%"></i></s>`],
      ['Equipe', `<span data-i18n-ignore>${esc(t.name || '—')}</span>`],
      ['Contrato', `<span>${contratoTxt()}</span>`],
      din ? [din[0], `<span data-i18n-ignore>${din[1]}</span>`] : null,
      ['Fase', `<span>${fase()}</span>`]
    ].filter(Boolean);
    const cred = [`<span class="carro">${foto.credito}</span>`];
    if(ret) cred.push(`<span><span>Retrato:</span> <span data-i18n-ignore>${Fotos.credito(Engine.sobrenome(d.name), ret)}${ret.pagina ? ', via Wikimedia Commons' : ''}</span></span>`);
    return `<section class="chx-capa pp-capa" style="--tc:${esc(t.color)}" aria-label="O piloto">
      <img src="${esc(foto.src)}" alt="${esc(foto.alt)}" decoding="async"${foto.externa ? ` referrerpolicy="no-referrer" onerror="PP.fotoFalhou(this)"` : ''}>
      <div class="pp-capa-tx">
        <figure class="pp-ret" aria-hidden="true"><span data-i18n-ignore>${esc(Fotos.iniciais(d.name))}</span>${ret ? `<img src="${esc(ret.url)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.remove()">` : ''}<i>${d.num}</i></figure>
        <div class="pp-nome chx-capa-tx" style="padding:0"><h2 data-i18n-ignore>${esc(d.name)}</h2>
          <p class="pp-meta">${fg(d.cc)}<span>${esc(nomePais(d.cc))}</span><s></s><span>${d.age} anos</span>${papel ? `<span class="papel-chip">${esc(papel)}</span>` : ''}</p>
          ${S.papel && S.papel.tipo !== 'livre' ? `<p class="pp-nota-capa">Você não é titular: só corre se for chamado.</p>` : ''}
        </div>
        <div class="pp-geral"><b>${d.ovr}</b><span>Geral</span></div>
      </div>
      <div class="chx-capa-pe">
        <dl class="pp-faixa">${faixa.map(([a, b, x], i) => `<div style="--i:${i}"><dt>${a}</dt><dd>${b}</dd>${x || ''}</div>`).join('')}</dl>
        <p class="chx-credito">${cred.join(' · ')}</p>
      </div>
    </section>`;
  }

  /* o botão do fim de semana e o que mais se pode fazer antes dele (igual à barra de ações de antes) */
  function acoes(principal){
    const sea = S.season, nx = proxima(), emMP = Game.emMP();
    if(S.retired) return `<div class="pp-acoes">
        <button class="btn btn-gold chx-acao" onclick="UI.careerEnd(S.fimRec, S.fimRazao)">Fim da carreira →</button>
        <button class="btn btn-ghost chx-acao2" onclick="UI.close();UI.show('intro');Game.checkSave()">Nova carreira</button></div>`;
    if(nx){
      const reserva = S.papel && tenta(() => Engine.meAusente(sea), false);
      const prep = !S.opts.fast && !Engine.invernoFeito() && !emMP;
      return `<div class="pp-acoes">
        ${prep ? `<button class="btn btn-ghost chx-acao2" onclick="UI.prepModal()">Pré-temporada</button>` : ''}
        <button class="btn btn-gold chx-acao" onclick="Game.nextRace()">${reserva ? 'Fim de semana' : 'Correr'} →</button>
        ${emMP || !principal ? '' : `<button class="btn btn-ghost chx-acao2" onclick="Game.simSeason(false, true)">Simular só esta corrida</button>
        <button class="pp-link" onclick="Game.simSeason(false)">Simular o resto do ano</button>`}</div>`;
    }
    return `<div class="pp-acoes"><button class="btn btn-gold chx-acao" onclick="Game.endSeason()">Encerrar a temporada ${sea.year} →</button></div>`;
  }

  function cartaoProxima(){
    const sea = S.season, nx = proxima();
    if(!nx){
      if(S.retired){
        const razao = { acidente: 'Um acidente encerrou sua carreira.', semdinheiro: 'O dinheiro acabou antes do talento.',
          semvaga: 'Nenhuma equipe ofereceu um lugar no grid.', escolha: 'Você pendurou o capacete.' }[S.fimRazao] || 'Você não corre mais.';
        return `<section class="chx-p chx-prox pp-prox pp-fim" aria-label="Carreira encerrada"><h2>Carreira encerrada</h2>
          <p>${esc(razao)}</p><p>Daqui em diante você só acompanha os números e o retrospecto.</p>${acoes(true)}</section>`;
      }
      return `<section class="chx-p chx-prox pp-prox pp-fim" aria-label="Temporada encerrada"><h2>Temporada encerrada</h2>
        <p>${sea.fired ? `<span>sem carro desde a ${ord(sea.firedAt + 1)} etapa</span>` : `<span>Todas as ${sea.calendar.length} etapas disputadas.</span>`}</p>${acoes(true)}</section>`;
    }
    const tipo = { fast: 'Alta velocidade', street: 'Circuito de rua', tech: 'Técnico', mixed: 'Misto', oval: 'Oval' }[nx.type] || '';
    const fmt = tenta(() => Engine.formatoQuali(sea.year, S.series), null);
    const tm = companheiro();
    const linhas = [
      fmt && fmt.n ? ['Formato da classificação', `<span>${esc(fmt.n)}</span>`] : null,
      ['Corrida', `<span>${tipo}</span>${nx.dbl ? ' · <span>pontos em dobro</span>' : ''}`],
      ['Tempo', `<span>${Math.round((nx.rainP || 0) * 100)}% de chance de chuva</span>`],
      tm ? ['Companheiro', `${fg(tm.cc)}<span data-i18n-ignore>${esc(tm.name)}</span>`] : null
    ];
    if(S.goal && S.goal.type !== 'livre' && S.year === S.goalYear){
      const st = tenta(() => Engine.goalStatus(), null);
      linhas.push(['Objetivo', `<span>${esc(S.goal.txt)}</span>${st ? ` · <b style="color:${st.done ? 'var(--green)' : 'inherit'}">${esc(st.txt)}</b>` : ''}`]);
    }
    return `<section class="chx-p chx-prox pp-prox" aria-label="Próxima etapa">
      <div class="chx-prox-cab">${fg(nx.cc)}<div><h2>${sea.isTop ? 'GP ' : ''}${esc(nx.gp)}</h2><p><span data-i18n-ignore>${esc(nx.circ)}</span> · <span>etapa ${nx.r} de ${sea.calendar.length}</span></p></div></div>
      ${tenta(() => UIC.tracadoSvg(nx.id, sea.year, nx.circ), '')}
      ${fatos(linhas)}
      ${acoes(true)}
    </section>`;
  }

  /* a temporada de ponta a ponta, uma célula por etapa (a mesma faixa do chefe) */
  function faixaTemporada(){
    const sea = S.season, sum = Engine.summary(sea);
    const cel = sea.calendar.map((c, i) => {
      const r = sea.results[i];
      if(r) return `<li class="chx-et"><button onclick="UI.raceDetail(${i})" title="${esc(c.gp)}">${fg(c.cc)}${posBox(r.pos, r.dnf, r.pts > 0, r)}<span class="r">${c.r}</span></button></li>`;
      const prox = !S.retired && !sea.fired && i === sea.round;
      return `<li class="chx-et ${prox ? 'prox' : 'futura'}"><div title="${esc(c.gp)}">${fg(c.cc)}<span class="posbox nl">${prox ? '' : ''}</span><span class="r">${c.r}</span></div></li>`;
    }).join('');
    return `<section class="chx-p chx-faixa" aria-label="A temporada">
      ${cab('Temporada ' + sea.year, 'calendario', `<span>${esc(sea.pts.label)}</span>`)}
      <ol class="chx-etapas" style="--n:${sea.calendar.length}">${cel}</ol>
      <p class="pp-sub">${sum.races ? `<span>Sua chegada em cada etapa.</span> <span>Toque numa etapa para ver a corrida.</span>` : '<span>Nenhuma etapa disputada ainda.</span>'}</p>
    </section>`;
  }

  function blocoHabilidades(resumo){
    const a = S.driver.attr, f = tenta(() => Engine.ficha(), null);
    let forca = '';
    if(f){
      const o = FICHA_KEYS.slice().sort((x, y) => f[y] - f[x]);
      forca = `<p class="pp-forca"><span>Forte em</span>: <b>${esc(FICHA[o[0]].n)}</b> · <b>${esc(FICHA[o[1]].n)}</b><br><span>Fraco em</span>: <b>${esc(FICHA[o[o.length - 1]].n)}</b></p>`;
    }
    return `<section class="chx-p" aria-label="Habilidades">
      ${cab('Habilidades', resumo ? 'perfil' : null, `<span>Geral</span> <b>${S.driver.ovr}</b>`)}
      <div class="chx-barras">${barra('Ritmo', a.pace, 0)}${barra('Ultrapassagem', a.race, 1)}${barra('Consistência', a.cons, 2)}${barra('Chuva', a.wet, 3)}${barra('Desenvolvimento', a.dev, 4)}</div>
      ${forca}
    </section>`;
  }

  function numerosTemporada(){
    const s = Engine.summary(S.season);
    return nums([[s.wins, 'Vitórias', s.wins ? 'ouro' : ''], [s.podiums, 'Pódios'], [s.poles, 'Poles'], [s.fls, 'Voltas mais rápidas'], [s.dnfs, 'Abandonos', s.dnfs ? 'neg' : ''], [`${s.races}<small style="font-size:15px;color:var(--faint)">/${s.total}</small>`, 'Etapas']]);
  }
  function numerosCarreira(){
    const c = S.career;
    return nums([[c.wins, 'Vitórias', c.wins ? 'ouro' : ''], [c.podiums, 'Pódios'], [c.poles, 'Poles'], [c.fls, 'Voltas mais rápidas'], [n(c.dnfs), 'Abandonos', c.dnfs ? 'neg' : ''], [c.gps, S.season && !S.season.isTop ? 'Provas · topo' : 'Provas']]);
  }
  /* no Início: temporada e carreira lado a lado, uma linha por número */
  function blocoEstatisticas(){
    const s = Engine.summary(S.season), c = S.career;
    const L = [['Vitórias', s.wins, c.wins, 'ouro'], ['Pódios', s.podiums, c.podiums], ['Poles', s.poles, c.poles],
      ['Voltas mais rápidas', s.fls, c.fls], ['Abandonos', s.dnfs, n(c.dnfs), 'neg'],
      [S.season && !S.season.isTop ? 'Provas · topo' : 'Provas', `${s.races}<small>/${s.total}</small>`, c.gps]];
    return `<section class="chx-p" aria-label="Estatísticas">
      ${cab('Estatísticas', 'estatisticas')}
      <table class="pp-tab pp-stats"><thead><tr><th></th><th class="n">${S.season.year}</th><th class="n">Carreira</th></tr></thead>
        <tbody>${L.map(([r, a, b, cl]) => `<tr class="${cl || ''}"><td>${r}</td><td class="n${cl && n(parseInt(a, 10)) ? ' ' + cl : ''}">${a}</td><td class="n${cl && n(b) ? ' ' + cl : ''}">${b}</td></tr>`).join('')}</tbody></table>
    </section>`;
  }

  function noticias(max){
    const m = (S.midia || []).slice(0, max);
    if(!m.length) return '<p class="pp-vazio">Ninguém escreveu sobre você ainda.</p>';
    return `<ul class="pp-nots">${m.map(p => `<li>
      ${p.foto ? `<img class="pav" src="${esc(p.foto)}" alt="">` : p.ini ? `<span class="pav" style="background:${esc(p.cor || 'var(--s3)')}">${esc(p.ini)}</span>` : `<span class="pic">${ico(p.ic)}</span>`}
      <header><b data-i18n-ignore>${esc(p.autor)}</b><span>${p.ano}</span></header>
      <p>${esc(textoImprensa(p))}</p></li>`).join('')}</ul>`;
  }
  function blocoNoticias(){
    const m = S.midia || [];
    return `<section class="chx-p" aria-label="Notícias recentes">${cab('Notícias recentes', 'noticias', m.length ? `${m.length}` : '')}${noticias(3)}</section>`;
  }

  function tabelaHistorico(max){
    const h = S.history || [];
    if(!h.length) return '<p class="pp-vazio">Sua primeira temporada ainda está em disputa.</p>';
    const lista = h.map((s, i) => [s, i]).slice(-max).reverse();
    return `<table class="pp-tab"><thead><tr><th>Ano</th><th class="col-cat">Categoria</th><th>Equipe</th><th class="n">Pos.</th><th class="n">V</th><th class="n">Pts</th></tr></thead>
      <tbody>${lista.map(([s, i]) => `<tr class="${s.champion ? 'campeao' : ''}" onclick="UI.archiveSeason(${i})">
        <td class="ano">${s.year}</td><td class="col-cat">${esc(s.cat)}</td>
        <td class="eq"><span class="stripe" style="background:${esc(s.teamColor || 'var(--s4)')}"></span><span data-i18n-ignore>${esc(s.team)}</span></td>
        <td class="n cl">${ord(s.pos)}</td><td class="n">${s.wins}</td><td class="n">${s.pts}</td></tr>`).join('')}</tbody></table>`;
  }
  function blocoHistorico(){
    const h = S.history || [];
    return `<section class="chx-p" aria-label="Histórico da carreira">${cab('Histórico da carreira', 'perfil', h.length ? `<span>${h.length}</span> <span>${h.length > 1 ? 'temporadas' : 'temporada'}</span>` : '')}${tabelaHistorico(6)}</section>`;
  }

  /* conquistas reais: as temporadas no pódio do campeonato e os números da vitrine */
  function conquistas(max){
    const h = S.history || [], c = S.career, out = [];
    h.slice().reverse().forEach(s => {
      if(!posOk(s.pos) || s.pos > 3 || !s.races) return;
      const k = s.pos === 1 ? ['ouro', 'trofeu', 'Campeão'] : s.pos === 2 ? ['prata', 'medalha', 'Vice-campeão'] : ['bronze', 'medalha', '3º lugar'];
      out.push(`<li class="${k[0]}">${ico(k[1])}<div><b><span>${k[2]}</span> · <span>${esc(s.cat)}</span></b><small>${s.year} · <span data-i18n-ignore>${esc(s.team)}</span></small></div></li>`);
    });
    if(c.wins) out.push(`<li>${ico('bandeira')}<div><b>${c.wins} ${c.wins > 1 ? 'vitórias' : 'vitória'}</b><small>${c.podiums} pódios · ${c.poles} poles</small></div></li>`);
    if(c.fls) out.push(`<li>${ico('raio')}<div><b>${c.fls} ${c.fls > 1 ? 'voltas mais rápidas' : 'volta mais rápida'}</b><small>Na carreira</small></div></li>`);
    if(S.academy) out.push(`<li>${ico('formatura')}<div><b data-i18n-ignore>${esc(S.academy.n)}</b><small>Formação ativa${S.academy.desde != null ? ` desde ${S.academy.desde}` : ''}</small></div></li>`);
    else if(S.exAcademia && S.exAcademia.motivo === 'formacao') out.push(`<li>${ico('formatura')}<div><b data-i18n-ignore>${esc(S.exAcademia.n)}</b><small>Formação concluída em ${S.exAcademia.ano}</small></div></li>`);
    if(!out.length) return '<p class="pp-vazio">A vitrine ainda está vazia. Pódios no campeonato, vitórias e voltas mais rápidas aparecem aqui.</p>';
    return `<ul class="pp-conq">${out.slice(0, max).join('')}</ul>`;
  }
  function blocoConquistas(max){
    const c = S.career, tit = n(c.titles) + n(c.jrTitles);
    return `<section class="chx-p" aria-label="Conquistas">${cab('Conquistas', null, tit ? `<b style="color:var(--gold)">${tit}</b> <span>${tit > 1 ? 'títulos' : 'título'}</span>` : '')}${conquistas(max)}</section>`;
  }

  /* quem está com você e quem está contra (o mesmo widget de gente da tela antiga) */
  function blocoPessoas(){
    tenta(() => Engine.gente());
    const rel = clamp(Math.round(S.teamRel || 50), 0, 100);
    const cor = v => v >= 70 ? 'var(--green)' : v >= 40 ? 'var(--gold)' : 'var(--red-txt)';
    const pessoa = (p, papel) => {
      if(!p) return '';
      const per = (typeof PERSONAS !== 'undefined' && (PERSONAS[p.pers] || PERSONAS.frio)) || { ic: 'pessoas' };
      const nota = tenta(() => Engine.nota(p), 50), tenso = p.rel && p.rel.tens >= 35;
      const txt = tenta(() => tenso ? Engine.dimTxt('tens', p.rel.tens) : Engine.dimTxt('resp', p.rel.resp), '');
      return `<div>${fg(p.cc)}<div style="min-width:0"><b><span data-i18n-ignore>${esc(p.n)}</span> · <span>${papel}</span></b><small class="${tenso ? 'tenso' : ''}">${esc(txt)}</small></div><s><i style="width:${clamp(nota, 0, 100)}%"></i></s></div>`;
    };
    const eng = tenta(() => Engine.pessoa('eng'), null), cmp = tenta(() => Engine.pessoa('comp'), null);
    const ativa = tenta(() => Engine.genteAtiva(), []) || [];
    const riv = ativa.find(p => p.papel === 'rival'), men = ativa.find(p => p.papel === 'mentor');
    const linhas = pessoa(eng, 'Engenheiro') + pessoa(cmp, 'Companheiro') + pessoa(riv, 'Rival') + pessoa(men, 'Mentor');
    return `<section class="chx-p" aria-label="Parceiros">${cab('Parceiros')}
      <div class="chx-barra"><span>Equipe</span><b style="color:${cor(rel)};font-size:15px;font-stretch:normal">${rel >= 70 ? 'apostam em você' : rel >= 40 ? 'observando' : 'perdendo a paciência'}</b><s><i style="width:${rel}%"></i></s></div>
      ${linhas ? `<div class="pp-gente">${linhas}</div>` : ''}
      ${riv && riv.duelos ? `<p class="pp-sub">duelos com ${esc(Engine.sobrenome(riv.n))}: ${riv.duelos.v || 0} a ${riv.duelos.p || 0}</p>` : ''}
      <div class="pp-botoes"><button class="btn btn-ghost btn-sm" onclick="UI.pessoas()">Parceiros</button></div>
    </section>`;
  }

  /* ── as páginas ── */
  const PAGINAS = {
    inicio(){
      return `<div class="chx-g chx-visao">${capa()}${cartaoProxima()}</div>
        ${faixaTemporada()}
        <div class="chx-g chx-3">${blocoHabilidades(true)}${blocoEstatisticas()}${blocoNoticias()}</div>
        <div class="chx-g chx-2">${blocoHistorico()}${blocoConquistas(5)}</div>
        ${movel()}`;
    },
    perfil(){
      const d = S.driver, a = d.attr, f = tenta(() => Engine.ficha(), null);
      const grupos = f ? `<div class="pp-grupos">
          <div><h3 class="pp-h3">Pilotagem</h3><div class="chx-barras">${barra('Ritmo de corrida', a.pace, 0)}${barra(FICHA.quali.n, f.quali, 1)}${barra('Consistência', a.cons, 2)}${barra('Chuva', a.wet, 3)}</div></div>
          <div><h3 class="pp-h3">Corrida</h3><div class="chx-barras">${barra('Ultrapassagem', a.race, 4)}${barra(FICHA.defesa.n, f.defesa, 5)}${barra(FICHA.pneu.n, f.pneu, 6)}</div></div>
          <div><h3 class="pp-h3">Fora do carro</h3><div class="chx-barras">${barra(FICHA.adapt.n, f.adapt, 7)}${barra(FICHA.feedback.n, f.feedback, 8)}${barra(FICHA.cabeca.n, f.cabeca, 9)}${barra('Desenvolvimento', a.dev, 10)}</div></div>
        </div>` : `<div class="chx-barras">${barra('Ritmo', a.pace, 0)}${barra('Ultrapassagem', a.race, 1)}${barra('Consistência', a.cons, 2)}${barra('Chuva', a.wet, 3)}${barra('Desenvolvimento', a.dev, 4)}</div>`;
      const fo = tenta(() => Engine.focoAtivo(), false) ? FOCOS[S.foco.k] : null;
      const cond = d.condicao != null && d.condicao < 100 && !(d.injured > 0) ? d.condicao : null;
      const tracos = tenta(() => Engine.tracosSabidos().length, 0);
      const sl = tenta(() => UI.linhaSuperlicenca(), '');
      const situacao = fatos([
        ['Nacionalidade', `${fg(d.cc)}<span>${esc(nomePais(d.cc))}</span>`],
        ['Idade', `<span>${d.age} anos</span>`],
        ['Número', `${d.num}`],
        ['Fama', `${d.fame}`],
        ['Moral', `${d.morale}`],
        ['Fase', `<span>${fase()}</span>`],
        cond != null ? ['Condição física', `<span data-i18n-ignore>${cond}</span> · <span>voltando de lesão</span>`, 'neg'] : null,
        ['Foco do ano', fo ? `<b>${esc(fo.n)}</b>` : '<span>Sem foco escolhido para o ano</span>'],
        S.academy ? ['Academia', `<span data-i18n-ignore>${esc(S.academy.n)}</span>`] : null
      ]);
      return `<div class="chx-g chx-visao">
          <section class="chx-p" aria-label="Habilidades">${cab('Habilidades', null, `<span>Geral</span> <b>${d.ovr}</b>`)}${grupos}
            <div class="pp-botoes"><button class="btn btn-ghost btn-sm" onclick="UI.fichaModal()">Ficha completa</button>${tracos ? `<button class="btn btn-ghost btn-sm" onclick="UI.tracosModal()">Como você anda</button>` : ''}</div></section>
          <section class="chx-p" aria-label="Situação">${cab('Situação')}${situacao}${sl ? `<div>${sl}</div>` : ''}</section>
        </div>
        <div class="chx-g chx-visao">
          <section class="chx-p" aria-label="Histórico da carreira">${cab('Histórico da carreira')}${slot('pane-hist')}</section>
          ${blocoConquistas(12)}
        </div>`;
    },
    equipe(){
      const sea = S.season, t = S.team || {}, sum = Engine.summary(sea);
      const tObj = sea.teams.find(x => x.id === t.id);
      const ct = Engine.constructors(sea), pc = ct.findIndex(x => x.id === t.id) + 1;
      const tm = companheiro();
      const cl = tenta(() => Engine.clausulaAtual(), 'padrao');
      const CL = { exclusivo: 'contrato exclusivo', padrao: 'contrato padrão', livre: 'contrato livre' };
      const dados = fatos([
        tObj ? ['Carro', `${Math.round(tObj.str)}`] : null,
        ['Construtores', pc && sum.races ? ord(pc) : '–'],
        ['Seu papel', `<span>${esc(papelTxt() || 'Titular')}</span>`],
        ['Contrato', `<span>${contratoTxt()}</span> · <span>${CL[cl] || ''}</span>`],
        tm ? ['Companheiro', `${fg(tm.cc)}<span data-i18n-ignore>${esc(tm.name)}</span>`] : null,
        sum.tmRaces ? ['Duelo com o companheiro', `<b data-i18n-ignore>${sum.tmWins}/${sum.tmRaces}</b>`] : null
      ]);
      const indy = S.series === 'indy' && tenta(() => Engine.cisaoAtiva(S.year), false);
      return `<div class="chx-g chx-2">
          <section class="chx-p" aria-label="A equipe">
            <div class="pp-eq" style="--tc:${esc(t.color || '#3a3f46')}"><s></s><div><h3 data-i18n-ignore>${esc(t.name || '—')}</h3><p><span>${esc(sea.cat)}</span> · <span>${sea.year}</span></p></div></div>
            ${dados}
            <div class="pp-botoes">${indy ? `<button class="btn btn-ghost btn-sm" onclick="UI.ladoModal()">${esc(Engine.LADOS[S.ladoIndy || 'cart'].n)}</button>` : ''}</div>
          </section>
          ${blocoPessoas()}
        </div>
        <section class="chx-p" aria-label="Construtores">${cab('Construtores', null, `<span>${esc(sea.cat)}</span> · <span>${sea.year}</span>`)}${slot('pane-con')}</section>`;
    },
    calendario(){
      const sea = S.season, era = Engine.eraOf(sea.year);
      return `<section class="chx-p" aria-label="Calendário">
          ${cab('Calendário ' + sea.year, null, `<span>${sea.calendar.length}</span> <span>etapas</span>`)}
          <dl class="chx-fatos chx-fatos-2">
            <div><dt>Época</dt><dd><span>${esc(era.name)}</span></dd></div>
            <div><dt>Pontuação</dt><dd style="font-size:15px;font-weight:600;font-stretch:normal"><span>${esc(sea.pts.label)}</span></dd></div>
            <div><dt>Confiabilidade</dt><dd>${Math.round(era.rel * 100)}%</dd></div>
          </dl>
          ${slot('retroBox')}
          <div style="max-width:380px">${acoes(false)}</div>
        </section>`;
    },
    resultados(){
      const sea = S.season;
      return `<div class="chx-g chx-2">
          <section class="chx-p" aria-label="Pilotos">${cab('Pilotos', null, `<span>${esc(sea.cat)}</span> · <span>${sea.year}</span>`)}${slot('pane-drv')}</section>
          <section class="chx-p" aria-label="Sua temporada">${cab('Sua temporada')}${slot('sumBar')}${slot('curveBox')}
            ${sea.playoff ? `<div class="pp-botoes"><button class="btn btn-ghost btn-sm" onclick="UI.playoffModal()">${esc(sea.playoff.nome)}</button></div>` : ''}</section>
        </div>`;
    },
    estatisticas(){
      const c = S.career, s = Engine.summary(S.season), ps = c.porSerie || {};
      const linhas = Object.keys(ps).filter(k => typeof SERIES !== 'undefined' && SERIES[k]).map(k => {
        const x = ps[k];
        return `<tr><td class="ano">${esc(SERIES[k].short)}</td><td class="n">${n(x.seasons)}</td><td class="n">${n(x.titles)}</td><td class="n">${n(x.gps)}</td><td class="n">${n(x.wins)}</td><td class="n">${n(x.podiums)}</td><td class="n">${n(x.poles)}</td></tr>`;
      }).join('');
      return `<div class="chx-g chx-2">
          <section class="chx-p" aria-label="Na carreira">${cab('Na carreira')}
            ${nums([[n(c.titles), 'Títulos', c.titles ? 'ouro' : ''], [n(c.jrTitles), 'Títulos de base'], [n(c.seasons), 'Temporadas'], [c.best ? ord(c.best) : '–', 'Melhor chegada']], 'pp-nums-4')}
            ${numerosCarreira()}</section>
          <section class="chx-p" aria-label="Nesta temporada">${cab('Nesta temporada', null, `<span>${S.season.year}</span>`)}
            ${nums([[s.races ? ord(s.pos) : '–', 'No campeonato'], [s.pts, 'Pontos'], [s.best ? ord(s.best) : '–', 'Melhor'], s.tmRaces ? [`${s.tmWins}/${s.tmRaces}`, 'Duelo com o companheiro'] : null], 'pp-nums-4')}
            ${numerosTemporada()}</section>
        </div>
        ${linhas ? `<section class="chx-p" aria-label="Por categoria">${cab('Por categoria')}<div class="tbl-scroll"><table class="pp-tab"><thead><tr><th>Categoria</th><th class="n">Temporadas</th><th class="n">Títulos</th><th class="n">Provas</th><th class="n">V</th><th class="n">Pód.</th><th class="n">Poles</th></tr></thead><tbody>${linhas}</tbody></table></div></section>` : ''}
        <section class="chx-p" aria-label="Mais números"><div class="pp-botoes">
          <button class="btn btn-ghost btn-sm" onclick="UI.estatisticas()">Estatísticas completas</button>
          <button class="btn btn-ghost btn-sm" onclick="UI.records()">Números</button>
          <button class="btn btn-ghost btn-sm" onclick="UI.abrirLendas()">Os maiores</button></div></section>`;
    },
    mercado(){
      const sea = S.season, t = S.team || {}, emp = tenta(() => Engine.emp(), null), din = dinheiro();
      const rel = clamp(Math.round(S.teamRel || 50), 0, 100);
      const cl = tenta(() => Engine.clausulaAtual(), 'padrao');
      const CL = { exclusivo: 'contrato exclusivo', padrao: 'contrato padrão', livre: 'contrato livre' };
      const ofertas = (S.pendingOffers || []).length;
      const par = (S.paralelas || []).slice(-5).reverse();
      const sl = tenta(() => UI.linhaSuperlicenca(), '');
      return `<div class="chx-g chx-2">
          <section class="chx-p" aria-label="Contrato">${cab('Contrato')}
            ${fatos([
              ['Equipe', `<span data-i18n-ignore>${esc(t.name || '—')}</span>`],
              ['Seu papel', `<span>${esc(papelTxt() || 'Titular')}</span>`],
              ['Duração', `<span>${contratoTxt()}</span>`],
              ['Cláusula', `<span>${CL[cl] || ''}</span>`],
              ['Relação com a equipe', `<span>${rel >= 70 ? 'apostam em você' : rel >= 40 ? 'observando' : 'perdendo a paciência'}</span>`],
              din ? [din[0], `<span data-i18n-ignore>${din[1]}</span>`] : null,
              ['Fama', `${S.driver.fame}`]
            ])}
            ${din ? `<div class="pp-botoes"><button class="btn btn-ghost btn-sm" onclick="UI.financas()">Finanças</button></div>` : ''}</section>
          <section class="chx-p" aria-label="Empresário">${cab('Empresário')}
            ${emp ? fatos([['Nome', `${fg(emp.cc)}<span data-i18n-ignore>${esc(emp.n)}</span>`], ['Comissão', `${Math.round(emp.taxa * 100)}%`]])
                  : '<p class="pp-vazio">Sem empresário. Um bom nome abre portas nas equipes, e cobra por isso.</p>'}
            <div class="pp-botoes"><button class="btn btn-ghost btn-sm" onclick="UI.empresarios()">${emp ? 'Empresários' : 'Contratar um empresário'}</button></div></section>
        </div>
        <div class="chx-g chx-2">
          <section class="chx-p" aria-label="Propostas">${cab('Propostas')}
            ${ofertas ? `<p class="pp-vazio"><span>${ofertas}</span> <span>${ofertas > 1 ? 'propostas esperando resposta.' : 'proposta esperando resposta.'}</span></p>
              <div class="pp-botoes"><button class="btn btn-ghost btn-sm" onclick="UI.ofertasModal()">Ver as propostas</button></div>`
              : '<p class="pp-vazio">As equipes fazem as propostas no fim da temporada.</p>'}
            ${sl ? `<div>${sl}</div>` : ''}</section>
          <section class="chx-p" aria-label="Outras categorias">${cab('Outras categorias')}
            ${par.length ? `<table class="pp-tab"><tbody>${par.map(p => `<tr style="cursor:default"><td class="ano">${p.ano}</td><td class="eq">${esc(SERIES[p.sk] ? SERIES[p.sk].short : p.sk)}</td><td class="n cl">${p.bateu ? 'ABD' : ord(p.pos)}</td></tr>`).join('')}</tbody></table>`
              : '<p class="pp-vazio">Nenhuma corrida fora da sua categoria.</p>'}
            <p class="pp-sub"><span>${CL[cl] || ''}</span></p></section>
        </div>`;
    },
    noticias(){
      return `<section class="chx-p" aria-label="Notícias">${cab('Imprensa')}${slot('pane-mid')}</section>`;
    }
  };
  function movel(){
    const emMP = Game.emMP();
    return `<div class="pp-movel">${emMP ? '' : `<button class="btn btn-ghost btn-sm" onclick="UI.difModal()">${esc(Engine.dif().n)}</button>
      <button class="btn btn-ghost btn-sm" onclick="Game.toggleFast()">${S.opts.fast ? 'Rápido' : 'Completo'}</button>`}
      <button class="btn btn-ghost btn-sm" onclick="PP.trocarTela()">Tela antiga</button>
      <button class="btn btn-ghost btn-sm" onclick="UI.confirmQuit()">Sair</button></div>`;
  }

  /* ── desenhar ── */
  function desenhar(){
    guardar();
    $('ppRail').innerHTML = trilho();
    $('ppTopo').innerHTML = topo();
    const pg = PAGINAS[PP.pag] ? PP.pag : 'inicio';
    $('ppPrincipal').innerHTML = `<div class="chx-pg${PP.anima ? ' pp-anima' : ''}" data-pg="${pg}">${PAGINAS[pg]()}</div>`;
    encaixar();
    /* as peças de antes enchem os encaixes */
    UI.retro(); UI.sumBar(); UI.curve(); UI.panes();
    PP.anima = false;
    if(PP.pag === 'inicio') pedirFotos();
  }

  /* se algum dado inesperado (um save muito antigo, uma série nova) quebrar a folha,
     a carreira volta para a tela de antes: o jogador nunca fica sem os botões */
  function seguro(){
    try { desenhar(); }
    catch(e){
      console.error('painel do piloto:', e);
      PP.falhou = true;
      telaAntiga([]);
    }
  }
  /* as peças voltam para os seus lugares na tela antiga */
  function devolver(hub){
    const casa = { retroBox: '#cardTemporada', sumBar: '#cardTemporada', curveBox: '#cardTemporada', 'pane-drv': '#cardAbas', 'pane-con': '#cardAbas', 'pane-hist': '#cardAbas', 'pane-mid': '#cardAbas' };
    LEGADO.forEach(id => { const e = $(id), c = hub.querySelector(casa[id]); if(e && c && e.parentNode !== c) c.appendChild(e); });
    const act = $('actBar'), cart = hub.querySelector('#cardTemporada'); if(act && cart) cart.appendChild(act);
    tenta(() => UI.tab('drv'));
  }

  /* quem prefere a tela de antes escolhe uma vez; a escolha fica neste navegador, fora do save */
  PP.antigo = () => (typeof Store !== 'undefined' ? Store.get('vdo_painel') : null) === 'antigo';
  PP.trocarTela = function(){
    if(typeof Store !== 'undefined') Store.set('vdo_painel', PP.antigo() ? 'novo' : 'antigo');
    PP.pag = 'inicio'; PP.anima = true; PP.topo = true;
    UI.render();
    if(window.Trilho && Trilho.marcar) Trilho.marcar();
  };
  /* a tela de antes: as peças voltam para os lugares delas e a barra ganha o caminho de volta */
  function telaAntiga(args){
    const sec = $('scr-career'), hub = sec && sec.querySelector('.hub'), pp = sec && sec.querySelector('.pp');
    if(sec) sec.classList.remove('pp-on');
    if(pp) pp.style.display = 'none';
    document.body.classList.add('pp-antigo');
    if(hub && LEGADO.some(id => { const e = $(id); return e && !hub.contains(e); })) devolver(hub);
    renderAntigo.apply(UI, args);
    const bar = $('actBar');
    if(!PP.falhou && bar && !bar.querySelector('.pp-volta'))
      bar.insertAdjacentHTML('beforeend', '<button class="btn btn-ghost btn-sm pp-volta" onclick="PP.trocarTela()">Tela nova</button>');
    if(PP.topo){ PP.topo = false; window.scrollTo(0, 0); }
  }

  UI.render = function(){
    if(!S || !S.season) return;
    if(PP.falhou || PP.antigo() || !montar()) return telaAntiga(arguments);
    const sec = $('scr-career'), pp = sec.querySelector('.pp');
    sec.classList.add('pp-on'); if(pp) pp.style.display = '';
    document.body.classList.remove('pp-antigo');
    if(PP.topo){ PP.topo = false; seguro(); window.scrollTo(0, 0); return; }
    UI.manterRolagem(seguro);
  };

  PP.ir = function(pg){
    if(!PAGINAS[pg]) return;
    const mudou = PP.pag !== pg;
    PP.pag = pg; PP.anima = mudou; PP.topo = mudou;
    UI.render();
    /* no celular o trilho é uma faixa rolável: a área escolhida fica à vista */
    const b = document.querySelector('#ppRail [aria-current="page"]');
    if(b && b.scrollIntoView && window.matchMedia && window.matchMedia('(max-width:980px)').matches) b.scrollIntoView({ block: 'nearest', inline: 'center' });
  };

  /* quem entra na carreira (continuar, nova, multiplayer) começa pelo Início */
  const show = UI.show;
  UI.show = function(nome){
    const antes = document.body && document.body.dataset.tela;
    if(nome === 'career' && antes !== 'career'){ PP.pag = 'inicio'; PP.anima = true; }
    return show.apply(this, arguments);
  };

  window.PP = PP;
})();
