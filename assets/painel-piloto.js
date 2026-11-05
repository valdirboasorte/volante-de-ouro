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
  const PP = { pag: 'inicio', anima: true, topo: false, tema: 'base' };
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
  /* as fotos de cada categoria com ambiente próprio (livres, do Commons, com crédito na capa).
     Na F1 a capa é o carro de verdade da equipe naquele ano; sem ele, a foto de época. */
  const FOTO_TEMA = {
    nascar: { src: "assets/temas/2018-coke-zero-sugar-400-beginning-from.jpg", alt: 'Largada das 400 milhas de Daytona, 2018', pagina: "https://commons.wikimedia.org/wiki/File:2018_Coke_Zero_Sugar_400_beginning_from_frontstretch.jpg", autor: "Dough4872", lic: "CC BY-SA 3.0" },
    fe: { src: "assets/temas/2023-04-21-motorsport-abb-fia-formula.jpg", alt: 'Fórmula E no E-Prix de Berlim, 2023', pagina: "https://commons.wikimedia.org/wiki/File:2023-04-21_Motorsport,_ABB_FIA_Formula_E_World_Championship,_Berlin_E-Prix_2023_1DX_0749_by_Stepro.jpg", autor: "Steffen Prößdorf", lic: "CC BY-SA 4.0" },
    stock: { src: "assets/temas/stock-car-interlagos-7963788896.jpg", alt: 'Stock Car em Interlagos, 2012', pagina: "https://commons.wikimedia.org/wiki/File:Stock_Car_Interlagos_(7963788896).jpg", autor: "Pedro Henrique Ponchio from São Paulo, Brazil", lic: "CC BY 2.0" },
    wec: { src: "assets/temas/le-mans-esses-at-night.jpg", alt: 'Os Esses de Le Mans à noite, 2014', pagina: "https://commons.wikimedia.org/wiki/File:Le_Mans_Esses_at_night.jpg", autor: "Nic Redhead", lic: "CC BY-SA 2.0" },
    dtm: { src: "assets/temas/dtm-2010-hockenheim-amk.jpg", alt: 'DTM em Hockenheim, 2010', pagina: "https://commons.wikimedia.org/wiki/File:DTM_2010_Hockenheim_amk.jpg", autor: "AngMoKio", lic: "CC BY-SA 3.0" },
    indy: { src: "assets/temas/2020-indycar-harvestgp-race2.jpg", alt: 'Largada da IndyCar em Indianápolis, 2020', pagina: "https://commons.wikimedia.org/wiki/File:2020-IndyCar-HarvestGP-Race2.jpg", autor: "Doctorindy", lic: "CC BY-SA 4.0" }
  };
  function fotoCapa(){
    const ep = UIC.fotoEpoca(S.year), ft = FOTO_TEMA[PP.tema];
    if(ft) return { src: ft.src, alt: ft.alt,
      credito: `<span>Foto da categoria</span>: <a href="${esc(ft.pagina)}" target="_blank" rel="noopener noreferrer" data-i18n-ignore>${esc(ft.alt)}</a> · <span data-i18n-ignore>${esc(ft.autor)}, ${esc(ft.lic)}</span>, via Wikimedia Commons` };
    if(PP.tema !== 'f1' || !S.team || S.team.livre) return ep;
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
    const c = img.parentNode && img.parentNode.querySelector('.pp-credito .carro');
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
  const nums = (itens, cls) => `<dl class="pp-nums${cls ? ' ' + cls : ''}">${itens.filter(Boolean).map(([v, r, c]) => `<div class="${c || ''}"><dt>${r}</dt><dd${typeof v === 'number' ? ` data-conta="${v}" data-i18n-ignore` : ''}>${v}</dd></div>`).join('')}</dl>`;
  const slot = id => `<div class="pp-slot" data-slot="${id}"></div>`;

  /* os enfeites de cada categoria na capa: só desenho, nada de dado */
  const ORNAMENTOS = {
    f1: () => [8, 19, 31, 46, 58, 71, 83].map((y, k) => `<i style="--y:${y}%;--d:${-k * .37}s;--t:${2.2 + (k % 3) * .45}s"></i>`).join('') + '<b></b>',
    nascar: d => `<div class="pp-xadrez"><i></i></div><div class="pp-portanum" data-i18n-ignore>${d.num}</div>`,
    fe: () => {
      const rotas = ['M0 70 H180 L230 120 H460 L500 80 H760 L800 120 H1000', 'M0 470 H120 L170 420 H380 L420 460 H640', 'M1000 300 H860 L820 260 H650 L610 300 H520',
        'M300 560 V500 L340 460 H560', 'M1000 520 H900 L860 480 H720', 'M640 0 V40 L680 80 H900'];
      return `<svg viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice">${rotas.map(r => `<path d="${r}"/>`).join('')}${
        rotas.map((r, k) => `<path class="e" d="${r}" style="--d:${-k * .9}s;--t:${4 + (k % 3)}s"/>`).join('')}</svg>`;
    },
    indy: () => '<i style="--n:0"></i><i style="--n:1"></i><i style="--n:2"></i>',
    stock: () => '<div class="pp-zebra"><i></i></div><b></b>',
    wec: () => [14, 27, 41, 58, 72, 86].map((y, k) => `<i style="--y:${y}%;--d:${-k * .9}s;--t:${4.2 + (k % 3) * .8}s"></i>`).join(''),
    dtm: () => '<i style="--x:30%;--w:9%;--n:0"></i><i style="--x:22%;--w:4%;--n:1"></i><i style="--x:12%;--w:12%;--n:2"></i><b></b>'
  };
  function capa(){
    const d = S.driver, sea = S.season, t = S.team || { name: '', color: '#3a3f46' }, foto = fotoCapa();
    const rosto = rostoHtml(d, t.color), ret = rosto.commons;
    const papel = papelTxt(), din = dinheiro();
    const faixa = [
      ['Fama', `<span data-conta="${d.fame}" data-i18n-ignore>${d.fame}</span>`, `<s><i style="width:${clamp(d.fame, 0, 100)}%"></i></s>`],
      ['Moral', `<span data-conta="${d.morale}" data-i18n-ignore>${d.morale}</span>`, `<s><i style="width:${clamp(d.morale, 0, 100)}%"></i></s>`],
      ['Contrato', `<span>${contratoTxt()}</span>`],
      din ? [din[0], `<span data-i18n-ignore>${din[1]}</span>`] : null,
      ['Fase', `<span>${fase()}</span>`]
    ].filter(Boolean);
    const cred = [`<span class="carro">${foto.credito}</span>`];
    if(ret) cred.push(`<span><span>Retrato:</span> <span data-i18n-ignore>${Fotos.credito(Engine.sobrenome(d.name), ret)}${ret.pagina ? ', via Wikimedia Commons' : ''}</span></span>`);
    const orn = ORNAMENTOS[PP.tema] ? ORNAMENTOS[PP.tema](d) : '';
    return `<section class="pp-capa" style="--tc:${esc(t.color)}" aria-label="O piloto">
      <img src="${esc(foto.src)}" alt="${esc(foto.alt)}" decoding="async"${foto.externa ? ` referrerpolicy="no-referrer" onerror="PP.fotoFalhou(this)"` : ''}>
      <div class="pp-orn pp-orn-${PP.tema}" aria-hidden="true">${orn}</div>
      <div class="pp-capa-tx">
        <button type="button" class="pp-ret" onclick="PP.retAbrir()" title="Editar retrato" aria-label="Editar retrato"><span data-i18n-ignore aria-hidden="true">${esc(Fotos.iniciais(d.name))}</span>${rosto.html}<i aria-hidden="true">${d.num}</i></button>
        <div class="pp-nome"><h2 data-i18n-ignore>${esc(d.name)}</h2>
          <p class="pp-meta">${fg(d.cc)}<span>${esc(nomePais(d.cc))}</span><s></s><span>${d.age} anos</span><s></s><span data-i18n-ignore>${esc(t.name || '—')}</span><s></s><span>${esc(sea.cat)}</span> <span>${sea.year}</span>${papel ? `<span class="papel-chip">${esc(papel)}</span>` : ''}</p>
          ${S.papel && S.papel.tipo !== 'livre' ? `<p class="pp-nota-capa">Você não é titular: só corre se for chamado.</p>` : ''}
        </div>
        <div class="pp-geral"><svg class="pp-anel" viewBox="0 0 100 100" aria-hidden="true"><circle class="t" cx="50" cy="50" r="46"/><circle class="v" cx="50" cy="50" r="46" pathLength="100" style="stroke-dasharray:${clamp(d.ovr, 0, 100)} 100"/></svg><b data-conta="${d.ovr}" data-i18n-ignore>${d.ovr}</b><span>Geral</span></div>
      </div>
      <dl class="pp-faixa">${faixa.map(([a, b, x], i) => `<div style="--i:${i}"><dt>${a}</dt><dd>${b}</dd>${x || ''}</div>`).join('')}</dl>
      <p class="pp-credito">${cred.join(' · ')}</p>
    </section>`;
  }

  /* a classificação do campeonato como torre de tempos: os primeiros e você */
  function torre(){
    const sea = S.season, st = tenta(() => Engine.standings(sea), []) || [];
    if(!st.length) return '';
    const iEu = st.findIndex(x => x.me);
    let lista = st.slice(0, 7).map((x, i) => [x, i]);
    if(iEu >= 7) lista = st.slice(0, 5).map((x, i) => [x, i]).concat([[null, -1], [st[iEu], iEu]]);
    const li = lista.map(([x, i], k) => x ? `<li class="${x.me ? 'eu' : ''}" style="--tc:${esc(x.team && x.team.color || '#555')};--i:${k}"><b>${i + 1}</b><s></s><span data-i18n-ignore>${esc(Engine.sobrenome(x.name))}</span><em>${x.pts}</em></li>`
      : '<li class="sep" aria-hidden="true"></li>').join('');
    return `<section class="chx-p pp-torre" aria-label="Classificação">${cab('Classificação', 'resultados', `<span>${sea.year}</span>`)}<ol>${li}</ol></section>`;
  }

  /* o ritmo da temporada: a posição no campeonato etapa a etapa, como um traço de telemetria */
  function ritmo(){
    const rs = S.season.results.filter(r => r.champ);
    let corpo;
    if(!rs.length) corpo = '<p class="pp-vazio">Nenhuma etapa disputada ainda.</p>';
    else {
      const nn = rs.length, maxP = Math.max(...rs.map(r => r.champ), 5), W = 600, H = 150;
      const x = i => nn === 1 ? W / 2 : (i / (nn - 1)) * W, y = q => 8 + ((q - 1) / ((maxP - 1) || 1)) * (H - 16);
      const pts = rs.map((r, i) => [x(i), y(r.champ)]);
      const ln = pts.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' ');
      corpo = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><line class="gl" x1="0" y1="8" x2="${W}" y2="8" vector-effect="non-scaling-stroke"/><line class="gl" x1="0" y1="${H - 8}" x2="${W}" y2="${H - 8}" vector-effect="non-scaling-stroke"/>
        <path class="ar" d="${ln} L${pts[pts.length - 1][0].toFixed(1)},${H} L${pts[0][0].toFixed(1)},${H} Z"/><path class="ln" d="${ln}" vector-effect="non-scaling-stroke"/></svg>
        <div class="eixo"><span>1º (topo)</span><span>${ord(maxP)} (base)</span></div>`;
    }
    return `<section class="chx-p pp-ritmo" aria-label="Ritmo da temporada">${cab('Ritmo da temporada', 'resultados', '<span>Sua posição no campeonato, etapa a etapa</span>')}${corpo}</section>`;
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
    let forca = '', barras;
    if(f){
      const o = FICHA_KEYS.slice().sort((x, y) => f[y] - f[x]);
      forca = `<p class="pp-forca"><span>Forte em</span>: <b>${esc(FICHA[o[0]].n)}</b> · <b>${esc(FICHA[o[1]].n)}</b><br><span>Fraco em</span>: <b>${esc(FICHA[o[o.length - 1]].n)}</b></p>`;
      const L = [['Ritmo de corrida', a.pace], [FICHA.quali.n, f.quali], ['Consistência', a.cons], ['Chuva', a.wet], ['Ultrapassagem', a.race], [FICHA.defesa.n, f.defesa],
        [FICHA.pneu.n, f.pneu], [FICHA.adapt.n, f.adapt], [FICHA.feedback.n, f.feedback], [FICHA.cabeca.n, f.cabeca], ['Desenvolvimento', a.dev]];
      barras = L.map(([nm, v], i) => barra(nm, v, i)).join('');
    } else barras = barra('Ritmo', a.pace, 0) + barra('Ultrapassagem', a.race, 1) + barra('Consistência', a.cons, 2) + barra('Chuva', a.wet, 3) + barra('Desenvolvimento', a.dev, 4);
    return `<section class="chx-p pp-hab" aria-label="Habilidades">
      ${cab('Habilidades', resumo ? 'perfil' : null, `<span>Geral</span> <b>${S.driver.ovr}</b>`)}
      <div class="chx-barras">${barras}</div>
      ${forca}
    </section>`;
  }

  /* no Início: temporada e carreira lado a lado, uma linha por número */
  const conta = v => typeof v === 'number' ? `<span data-conta="${v}" data-i18n-ignore>${v}</span>` : v;
  function blocoEstatisticas(){
    const s = Engine.summary(S.season), c = S.career;
    const L = [['Vitórias', s.wins, c.wins, 'ouro'], ['Pódios', s.podiums, c.podiums], ['Poles', s.poles, c.poles],
      ['Voltas mais rápidas', s.fls, c.fls], ['Abandonos', s.dnfs, n(c.dnfs), 'neg'],
      [S.season && !S.season.isTop ? 'Provas · topo' : 'Provas', `${conta(s.races)}<small>/${s.total}</small>`, c.gps]];
    return `<section class="chx-p" aria-label="Estatísticas">
      ${cab('Estatísticas', 'estatisticas')}
      <table class="pp-tab pp-stats"><thead><tr><th></th><th class="n">${S.season.year}</th><th class="n">Carreira</th></tr></thead>
        <tbody>${L.map(([r, a, b, cl]) => `<tr><td>${r}</td><td class="n${cl && n(a) ? ' ' + cl : ''}">${conta(a)}</td><td class="n${cl && n(b) ? ' ' + cl : ''}">${conta(b)}</td></tr>`).join('')}</tbody></table>
    </section>`;
  }

  function numerosTemporada(){
    const s = Engine.summary(S.season);
    return nums([[s.wins, 'Vitórias', s.wins ? 'ouro' : ''], [s.podiums, 'Pódios'], [s.poles, 'Poles'], [s.fls, 'Voltas mais rápidas'], [s.dnfs, 'Abandonos', s.dnfs ? 'neg' : ''], [`${s.races}<small style="font-size:15px;color:var(--pp-fraca)">/${s.total}</small>`, 'Etapas']]);
  }
  function numerosCarreira(){
    const c = S.career;
    return nums([[c.wins, 'Vitórias', c.wins ? 'ouro' : ''], [c.podiums, 'Pódios'], [c.poles, 'Poles'], [c.fls, 'Voltas mais rápidas'], [n(c.dnfs), 'Abandonos', c.dnfs ? 'neg' : ''], [c.gps, S.season && !S.season.isTop ? 'Provas · topo' : 'Provas']]);
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
      return `${capa()}
        <div class="pp-linha pp-l1">${cartaoProxima()}${blocoHabilidades(true)}<div class="pp-col">${torre()}${ritmo()}</div></div>
        ${faixaTemporada()}
        <div class="pp-linha pp-l2">${blocoEstatisticas()}<div class="pp-col">${blocoHistorico()}${blocoConquistas(4)}</div>${blocoNoticias()}</div>
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
          <section class="chx-p" aria-label="Situação">${cab('Situação')}${situacao}${sl ? `<div>${sl}</div>` : ''}<div class="pp-botoes"><button class="btn btn-ghost btn-sm" onclick="PP.retAbrir()">Editar retrato</button></div></section>
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

  /* ── o ambiente da categoria ── */
  const TEMAS = { f1: 'Fórmula 1', nascar: 'NASCAR', fe: 'Fórmula E', indy: 'IndyCar', stock: 'Stock Car', wec: 'Endurance', dtm: 'DTM' };
  /* o tema vem da categoria real: só a principal de cada série tem ambiente próprio; a base
     (kart, fórmulas de acesso, divisões de baixo) e as séries sem ambiente usam o do Volante de Ouro.
     Uma série nova ganha ambiente com uma entrada em TEMAS, outra em FOTO_TEMA e o bloco dela no CSS. */
  function temaDe(){ const sea = S.season; return sea && sea.isTop && TEMAS[S.series] ? S.series : 'base'; }
  const semMov = () => document.documentElement.classList.contains('sem-mov') || !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  function fonteTema(tema){
    if(tema !== 'fe' || document.getElementById('ppFonteFE')) return;
    const l = document.createElement('link');
    l.id = 'ppFonteFE'; l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&display=swap';
    document.head.appendChild(l);
  }
  /* a abertura da categoria: só quando a carreira entra num ambiente diferente do último que este navegador mostrou */
  function abertura(tema, raiz){
    let antes = null;
    try { antes = localStorage.getItem('vdo_painel_tema'); localStorage.setItem('vdo_painel_tema', tema); } catch(e){ return; }
    if(antes === tema || semMov() || document.body.dataset.tela !== 'career') return;
    const sea = S.season, nome = TEMAS[tema];
    raiz.insertAdjacentHTML('beforeend', `<div class="pp-intro" aria-hidden="true"><div>${nome ? `<b data-i18n-ignore>${nome}</b>` : `<b>${esc(sea.cat)}</b>`}<span><span data-i18n-ignore>${esc(S.team ? S.team.name : '')}</span> · <span>temporada</span> <span>${sea.year}</span></span></div></div>`);
    setTimeout(() => { const e = raiz.querySelector('.pp-intro'); if(e) e.remove(); }, 1250);
  }
  /* os números sobem de zero quando a página abre (não a cada corrida simulada) */
  function contar(raiz){
    if(semMov()) return;
    raiz.querySelectorAll('[data-conta]').forEach(e => {
      const fim = +e.dataset.conta; if(!(fim > 0)) return;
      const t0 = performance.now(), dur = 700;
      e.textContent = '0';
      const passo = t => { const p = Math.min(1, (t - t0) / dur); e.textContent = String(Math.round(fim * (1 - Math.pow(1 - p, 3)))); if(p < 1) requestAnimationFrame(passo); };
      requestAnimationFrame(passo);
    });
  }
  /* o traçado da próxima etapa se desenha, e um ponto dá a volta nele */
  function tracado(raiz, anima){
    const p = raiz.querySelector('.pp-prox .chx-tracado path'); if(!p) return;
    p.id = 'ppTr';
    if(semMov()) return;
    if(anima && p.animate){
      p.setAttribute('pathLength', '1'); p.style.strokeDasharray = '1';
      p.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 1500, easing: 'cubic-bezier(0.23, 1, 0.32, 1)', fill: 'both' });
    }
    const svg = p.ownerSVGElement;
    if(svg) svg.insertAdjacentHTML('beforeend', '<circle class="pp-volta" r="5"><animateMotion dur="7s" repeatCount="indefinite"><mpath href="#ppTr"/></animateMotion></circle>');
  }

  /* ── desenhar ── */
  function desenhar(){
    guardar();
    const tema = PP.tema = temaDe(), raiz = $('scr-career').querySelector('.pp');
    raiz.dataset.tema = tema; fonteTema(tema);
    /* as janelas abertas daqui herdam o ambiente da categoria */
    document.body.classList.add('pp-modo'); document.body.dataset.ppTema = tema;
    $('ppRail').innerHTML = trilho();
    $('ppTopo').innerHTML = topo();
    const pg = PAGINAS[PP.pag] ? PP.pag : 'inicio', anima = PP.anima;
    $('ppPrincipal').innerHTML = `<div class="chx-pg${anima ? ' pp-anima' : ''}" data-pg="${pg}">${PAGINAS[pg]()}</div>`;
    /* cada painel entra na sua vez, com o movimento da categoria */
    $('ppPrincipal').querySelectorAll('.pp-capa, .chx-p').forEach((e, i) => { e.classList.add('pp-entra'); e.style.setProperty('--i', Math.min(i, 9)); });
    encaixar();
    /* as peças de antes enchem os encaixes */
    UI.retro(); UI.sumBar(); UI.curve(); UI.panes();
    PP.anima = false;
    if(anima) contar($('ppPrincipal'));
    tracado($('ppPrincipal'), anima);
    if(PP.pag === 'inicio') pedirFotos();
    abertura(tema, raiz);
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
    document.body.classList.add('pp-antigo'); document.body.classList.remove('pp-modo');
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
    if(nome !== 'career') document.body.classList.remove('pp-modo');
    const r = show.apply(this, arguments);
    if(nome === 'new') tenta(() => passoNovo());
    return r;
  };

  /* ═══ o retrato do piloto ═══
     Um rosto desenhado (montado pelo jogador, nunca gerado) ou uma foto que ele escolhe.
     Fica neste navegador (vdo_retrato), fora do save: não pesa na carreira, não vai para o
     multiplayer nem para a internet. A chave liga o retrato ao piloto da carreira atual. */
  const PELES = ['#f3d5bd', '#e9bf9c', '#d39d76', '#b07448', '#82502f', '#563421'];
  const CABELOS = ['#15100c', '#3a2315', '#6a4224', '#a5692f', '#d9b462', '#a9aeb4', '#7d2a1d'];
  const OLHOS = ['#4a2f1b', '#7a5228', '#3f7a4a', '#3a6ea5', '#6b7580'];
  const ESTILOS = [['curto', 'Curto'], ['topete', 'Topete'], ['raspado', 'Raspado'], ['comprido', 'Comprido'], ['cacheado', 'Cacheado'], ['careca', 'Careca']];
  const BARBAS = [['nenhuma', 'Nenhuma'], ['bigode', 'Bigode'], ['cavanhaque', 'Cavanhaque'], ['curta', 'Curta'], ['cheia', 'Cheia']];
  const OCULOS = [['nenhum', 'Sem óculos'], ['grau', 'De grau'], ['escuros', 'Escuros'], ['esportivos', 'Esportivos']];
  const CABECA = [['nada', 'Nada'], ['bone', 'Boné da equipe'], ['fone', 'Fone de rádio']];
  const PADRAO = { pele: 1, cor: 1, olhos: 0, estilo: 'curto', barba: 'nenhuma', oculos: 'nenhum', cabeca: 'nada' };
  const chaveDe = d => d ? [d.name, d.cc, d.num].join('|') : '';
  function lerRetrato(){ try { return JSON.parse(localStorage.getItem('vdo_retrato') || 'null'); } catch(e){ return null; } }
  function retratoDe(s){ const r = lerRetrato(); return r && s && s.driver && r.chave === chaveDe(s.driver) ? r : null; }
  function gravarRetrato(r){
    try { localStorage.setItem('vdo_retrato', JSON.stringify(r)); return true; }
    catch(e){ UI.toast('Não coube no navegador. Tente uma foto menor.'); return false; }
  }
  /* sem retrato escolhido, um rosto desenhado e estável para o piloto (sai do nome, não da nacionalidade) */
  function avatarPadrao(d){
    const h = tenta(() => seedOf(String(d.name) + ':' + d.num), 7) >>> 0;
    return Object.assign({}, PADRAO, { pele: h % PELES.length, cor: (h >> 3) % 6, olhos: (h >> 5) % OLHOS.length,
      estilo: ESTILOS[(h >> 7) % 5][0], barba: BARBAS[(h >> 10) % BARBAS.length][0] });
  }
  /* o boneco: um retrato de piloto em traço chapado, as cores da paleta e a cor da equipe */
  function avatarSvg(a, cor, vb){
    a = Object.assign({}, PADRAO, a || {});
    cor = esc(cor || '#3a3f46');
    const pele = PELES[a.pele] || PELES[1], cab = CABELOS[a.cor] || CABELOS[1], olho = OLHOS[a.olhos] || OLHOS[0];
    const somb = 'rgba(0,0,0,.16)', somb2 = 'rgba(0,0,0,.09)', luz = 'rgba(255,255,255,.16)';
    const atras = a.estilo === 'comprido' && a.cabeca !== 'bone' ? `<path d="M33 100c-7-30-4-64 27-66 31 2 34 36 27 66-3-15-4-27-5-35-6-8-13-12-22-12s-16 4-22 12c-1 8-2 20-5 35z" fill="${cab}"/>` : '';
    const cabelo = a.cabeca === 'bone' ? '' : ({
      curto: `<path d="M36 60c-1-16 9-26 24-26s25 10 24 26c-2-7-7-11-12-12-5 4-15 5-25 2-5 2-9 5-11 10z" fill="${cab}"/><path d="M49 39q11-4 22 0" stroke="${luz}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
      topete: `<path d="M35 60c-2-18 8-30 26-31 11-1 21 6 23 15 1 6 0 11-1 16-2-8-7-12-13-13 3-6 0-10-5-11-9 5-18 7-24 9-3 4-5 9-6 15z" fill="${cab}"/><path d="M52 33q9-3 17 1" stroke="${luz}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
      raspado: `<path d="M37 57c1-14 10-21 23-21s22 7 23 21c-6-6-14-9-23-9s-17 3-23 9z" fill="${cab}" opacity=".6"/>`,
      comprido: `<path d="M37 62c0-17 9-27 23-27 15 0 24 10 23 27-5-9-12-14-23-14-8 0-15 3-23 14z" fill="${cab}"/><path d="M50 39q10-4 20 0" stroke="${luz}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
      cacheado: `<g fill="${cab}">${[[40, 53, 9], [47, 41, 10], [59, 35, 11], [71, 40, 10], [80, 52, 9], [36, 63, 6.5], [84, 63, 6.5]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g><g fill="rgba(0,0,0,.14)">${[[45, 45, 3], [58, 38, 3.4], [70, 44, 3], [79, 55, 2.6], [41, 57, 2.6]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>`,
      careca: `<path d="M45 42q15-7 30 0" stroke="${luz}" stroke-width="3" fill="none" stroke-linecap="round"/>`
    }[a.estilo] || '');
    const barba = {
      bigode: `<path d="M52 79q8-4 16 0q-3 3-8 2q-5 1-8-2z" fill="${cab}"/>`,
      cavanhaque: `<path d="M53 79q7-3 14 0q-2 2-7 2q-5 0-7-2z" fill="${cab}"/><path d="M55 87q5 2 10 0q0 7-5 9q-5-2-5-9z" fill="${cab}"/>`,
      curta: `<path d="M39 74c1 15 9 26 21 26s20-11 21-26c-4 11-10 16-21 16s-17-5-21-16z" fill="${cab}" opacity=".55"/>`,
      cheia: `<path d="M38 67c0 25 10 37 22 37s22-12 22-37c-3 12-9 19-22 19s-19-7-22-19z" fill="${cab}"/><path d="M53 84q7 4 14 0" stroke="${pele}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
    }[a.barba] || '';
    const oculos = {
      grau: `<g fill="rgba(255,255,255,.08)" stroke="#1b1e23" stroke-width="1.7"><rect x="44.5" y="59.5" width="13" height="9" rx="2.5"/><rect x="62.5" y="59.5" width="13" height="9" rx="2.5"/></g><path d="M57.5 63q2.5-1.5 5 0" stroke="#1b1e23" stroke-width="1.5" fill="none"/>`,
      escuros: `<g fill="#14161a"><path d="M43.5 60h15c0 6-3 9-7.5 9s-7.5-3-7.5-9z"/><path d="M61.5 60h15c0 6-3 9-7.5 9s-7.5-3-7.5-9z"/></g><path d="M58.5 61h3" stroke="#14161a" stroke-width="1.6"/><path d="M46 62l4 0M64 62l4 0" stroke="rgba(255,255,255,.35)" stroke-width="1.2" stroke-linecap="round"/>`,
      esportivos: `<path d="M41 60q19-5 38 0l-1.5 7q-17.5 4-35 0z" fill="#16181c"/><path d="M43 61.5q17-4 34 0l-1 4q-16 3-32 0z" fill="${cor}" opacity=".75"/><path d="M47 62.5q6-1 11-1" stroke="rgba(255,255,255,.5)" stroke-width="1.2" stroke-linecap="round"/>`
    }[a.oculos] || '';
    const cabeca = {
      bone: `<path d="M35 58c0-15 11-24 25-24s25 9 25 24z" fill="${cor}"/><path d="M35 58c0-15 11-24 25-24s25 9 25 24" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="1.2"/><path d="M33 57q27-7 54 0q-27 5-54 0z" fill="#16181c"/><circle cx="60" cy="45" r="4" fill="#f2f4f6"/><path d="M60 34v4" stroke="rgba(0,0,0,.2)" stroke-width="1.2"/>`,
      fone: `<path d="M35 64c0-21 10-30 25-30s25 9 25 30" fill="none" stroke="#202328" stroke-width="4.5" stroke-linecap="round"/><rect x="29" y="58" width="10" height="16" rx="4.5" fill="#202328"/><rect x="81" y="58" width="10" height="16" rx="4.5" fill="#202328"/><rect x="30.5" y="61" width="7" height="10" rx="3" fill="${cor}"/><rect x="82.5" y="61" width="7" height="10" rx="3" fill="${cor}"/><path d="M34 73q3 13 16 12" stroke="#202328" stroke-width="2.2" fill="none" stroke-linecap="round"/><circle cx="51.5" cy="85" r="2.6" fill="#202328"/>`
    }[a.cabeca] || '';
    return `<svg class="pp-avatar" viewBox="${vb || '0 0 120 150'}" aria-hidden="true">
      <rect width="120" height="150" fill="${cor}"/><path d="M80 0h22L50 150H28z" fill="#000" opacity=".12"/><rect y="104" width="120" height="46" fill="#000" opacity=".14"/>
      ${atras}
      <path d="M8 150c3-25 19-39 52-41 33 2 49 16 52 41z" fill="#1b1e23"/>
      <path d="M13 134c9-11 20-16 32-18M107 134c-9-11-20-16-32-18" stroke="${cor}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M60 120v30" stroke="rgba(255,255,255,.22)" stroke-width="1.5"/><rect x="69" y="128" width="17" height="9" rx="2" fill="#e9ecef" opacity=".85"/>
      <path d="M49 91h22v18c-6 5-16 5-22 0z" fill="${pele}"/><path d="M49 96c7 5 15 5 22 0v7c-7 4-15 4-22 0z" fill="${somb}"/>
      <path d="M43 111c5 7 29 7 34 0l-2 9c-7 6-23 6-30 0z" fill="${cor}"/>
      <path d="M38 64c-5-2-8 3-7 9s5 9 9 8z" fill="${pele}"/><path d="M82 64c5-2 8 3 7 9s-5 9-9 8z" fill="${pele}"/>
      <path d="M36 70q-1 4 2 7M84 70q1 4-2 7" stroke="${somb}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <path d="M60 36c-14 0-24 10-24 26 0 10 2 20 7 27 5 7 11 11 17 11s12-4 17-11c5-7 7-17 7-27 0-16-10-26-24-26z" fill="${pele}"/>
      <path d="M73 74c4 6 5 12 2 19 4-4 7-11 8-20z" fill="${somb2}"/><path d="M47 74c-4 6-5 12-2 19-4-4-7-11-8-20z" fill="${somb2}"/>
      <ellipse cx="51" cy="64.5" rx="3.8" ry="2.6" fill="#f6f2ec"/><ellipse cx="69" cy="64.5" rx="3.8" ry="2.6" fill="#f6f2ec"/>
      <circle cx="51.3" cy="64.6" r="2" fill="${olho}"/><circle cx="69.3" cy="64.6" r="2" fill="${olho}"/>
      <circle cx="51.3" cy="64.6" r=".95" fill="#111"/><circle cx="69.3" cy="64.6" r=".95" fill="#111"/>
      <circle cx="52" cy="63.8" r=".55" fill="#fff"/><circle cx="70" cy="63.8" r=".55" fill="#fff"/>
      <path d="M46.8 63q4.2-2.8 8.4 0M64.8 63q4.2-2.8 8.4 0" stroke="rgba(0,0,0,.4)" stroke-width="1.2" fill="none" stroke-linecap="round"/>
      <path d="M45.5 58q5.5-3.2 11-.6M63.5 57.4q5.5-2.6 11 .6" stroke="${a.estilo === 'careca' && a.barba === 'nenhuma' ? '#3a2315' : cab}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M60.5 66v8q-3 1.6-.4 3" stroke="${somb}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <path d="M53.5 82q6.5 4.2 13 0" stroke="#8c3f33" stroke-width="2.1" fill="none" stroke-linecap="round"/><path d="M56 85q4 1.6 8 0" stroke="${somb2}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      ${barba}${cabelo}${cabeca}${oculos}
    </svg>`;
  }
  /* o rosto que a capa mostra: o escolhido, a foto real do Commons ou o desenho padrão */
  function rostoHtml(d, cor){
    const meu = retratoDe(S);
    if(meu && meu.tipo === 'foto' && meu.foto) return { html: `<img src="${meu.foto}" alt="">`, commons: null };
    if(meu) return { html: avatarSvg(meu.avatar, cor), commons: null };
    const f = tenta(() => Fotos.piloto(d.name), null);
    if(f) return { html: `${avatarSvg(avatarPadrao(d), cor)}<img src="${esc(f.url)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.remove()">`, commons: f };
    return { html: avatarSvg(avatarPadrao(d), cor), commons: null };
  }

  /* ── o editor: o mesmo na nova carreira e na janela do perfil ──
     À esquerda o cartão do piloto, ao vivo; à direita as abas, com cada opção mostrada no próprio boneco */
  PP.retEd = null;
  const ABAS = [['rosto', 'Rosto'], ['cabelo', 'Cabelo'], ['equip', 'Equipamentos'], ['foto', 'Foto']];
  function identidade(){
    if(PP.retCtx === 'novo'){
      const nm = ($('inName') && $('inName').value.trim()) || 'Seu piloto', num = ($('inNum') && $('inNum').value.trim()) || '–';
      return { nome: nm, num, cc: (typeof UI !== 'undefined' && UI.country) || '', cor: '#3a3f46' };
    }
    const d = S.driver; return { nome: d.name, num: d.num, cc: d.cc, cor: (S.team && S.team.color) || '#3a3f46' };
  }
  function editorHtml(){
    const e = PP.retEd, a = e.avatar, id = identidade(), aba = e.aba || 'rosto';
    const prev = e.tipo === 'foto' && e.foto ? `<img src="${e.foto}" alt="">` : avatarSvg(a, id.cor);
    const sw = (lista, k, rot) => `<div class="pp-sw" role="group" aria-label="${rot}">${lista.map((c, i) => `<button type="button" style="--c:${c}" aria-pressed="${e.tipo !== 'foto' && a[k] === i}" aria-label="${rot} ${i + 1}" onclick="PP.retSet('${k}', ${i})"></button>`).join('')}</div>`;
    /* cada opção aparece no boneco de agora, recortado no rosto */
    const op = (lista, k) => `<div class="pp-opcoes">${lista.map(([v, nm]) => {
      /* no cabelo, o boné sai da miniatura para o estilo aparecer */
      const b = Object.assign({}, a, { [k]: v }, k === 'estilo' && a.cabeca === 'bone' ? { cabeca: 'nada' } : {});
      return `<button type="button" class="pp-opcao" aria-pressed="${e.tipo !== 'foto' && a[k] === v}" onclick="PP.retSet('${k}', '${v}')">${avatarSvg(b, id.cor, '24 22 72 82')}<span>${nm}</span></button>`;
    }).join('')}</div>`;
    const painel = {
      rosto: `<p class="pp-h3">Tom de pele</p>${sw(PELES, 'pele', 'Tom de pele')}<p class="pp-h3">Olhos</p>${sw(OLHOS, 'olhos', 'Olhos')}<p class="pp-h3">Barba</p>${op(BARBAS, 'barba')}`,
      cabelo: `<p class="pp-h3">Estilo</p>${op(ESTILOS, 'estilo')}<p class="pp-h3">Cor do cabelo</p>${sw(CABELOS, 'cor', 'Cor do cabelo')}`,
      equip: `<p class="pp-h3">Óculos</p>${op(OCULOS, 'oculos')}<p class="pp-h3">Na cabeça</p>${op(CABECA, 'cabeca')}`,
      foto: `<p class="pp-vazio" style="font-size:14px">Use uma foto sua no lugar do desenho. Ela é recortada no formato do retrato.</p>
        <div class="pp-botoes"><label class="btn btn-ghost btn-sm pp-file">${e.foto ? 'Trocar a foto' : 'Escolher foto'}<input type="file" accept="image/*" onchange="PP.retFoto(this)"></label>
        ${e.foto ? `<button type="button" class="btn btn-ghost btn-sm" onclick="PP.retTipo('${e.tipo === 'foto' ? 'avatar' : 'foto'}')">${e.tipo === 'foto' ? 'Usar o desenho' : 'Usar a foto'}</button>` : ''}</div>
        <p class="pp-sub">A foto fica só neste navegador. Não vai para o save nem para a internet.</p>`
    }[aba];
    return `<div class="pp-reted${e.pop ? ' pp-pop' : ''}">
      <div class="pp-reted-card">
        <figure class="pp-reted-prev" style="--tc:${esc(id.cor)}">${prev}</figure>
        <div class="pp-reted-nome"><i data-i18n-ignore>${esc(String(id.num))}</i><b data-i18n-ignore>${esc(id.nome)}</b>${id.cc ? fg(id.cc) : ''}</div>
        ${e.tipo === 'foto' ? '' : '<button type="button" class="btn btn-ghost btn-sm pp-sortear" onclick="PP.retSortear()">Sortear</button>'}
      </div>
      <div class="pp-reted-ops">
        <div class="pp-tabs" role="tablist" aria-label="Retrato">${ABAS.map(([k, nm]) => `<button type="button" role="tab" aria-selected="${aba === k}" onclick="PP.retAba('${k}')">${nm}</button>`).join('')}</div>
        <div class="pp-tabpainel" role="tabpanel">${painel}</div>
      </div>
    </div>`;
  }
  function redesenharEditor(pop){
    const box = $(PP.retCtx === 'novo' ? 'ppRetEdNovo' : 'ppRetEd');
    if(!box || !PP.retEd) return;
    PP.retEd.pop = !!pop; box.innerHTML = editorHtml(); PP.retEd.pop = false;
  }
  PP.retSet = function(k, v){ if(!PP.retEd) return; PP.retEd.avatar[k] = v; PP.retEd.tipo = 'avatar'; redesenharEditor(true); };
  PP.retTipo = function(t){ if(!PP.retEd) return; PP.retEd.tipo = t; redesenharEditor(true); };
  PP.retAba = function(k){ if(!PP.retEd) return; PP.retEd.aba = k; redesenharEditor(); };
  PP.retSortear = function(){
    if(!PP.retEd) return; const r = n => Math.floor(Math.random() * n);
    PP.retEd.avatar = { pele: r(PELES.length), cor: r(CABELOS.length), olhos: r(OLHOS.length), estilo: ESTILOS[r(ESTILOS.length)][0], barba: BARBAS[r(BARBAS.length)][0],
      oculos: r(3) ? 'nenhum' : OCULOS[1 + r(3)][0], cabeca: r(4) ? 'nada' : CABECA[1 + r(2)][0] };
    PP.retEd.tipo = 'avatar'; redesenharEditor(true);
  };
  /* a foto escolhida vira um retrato de 240 × 300, recortada no centro e um pouco acima (onde o rosto costuma estar) */
  PP.retFoto = function(input){
    const f = input.files && input.files[0]; if(!f) return;
    if(!/^image\//.test(f.type)) return UI.toast('Escolha uma imagem.');
    const fr = new FileReader();
    fr.onload = () => {
      const img = new Image();
      img.onload = () => {
        const W = 240, H = 300, c = document.createElement('canvas'); c.width = W; c.height = H;
        const k = Math.max(W / img.width, H / img.height), w = img.width * k, h = img.height * k;
        c.getContext('2d').drawImage(img, (W - w) / 2, (H - h) * .3, w, h);
        PP.retEd.foto = c.toDataURL('image/jpeg', .84); PP.retEd.tipo = 'foto';
        redesenharEditor(true);
      };
      img.onerror = () => UI.toast('Escolha uma imagem.');
      img.src = fr.result;
    };
    fr.readAsDataURL(f);
  };
  /* a janela do perfil */
  PP.retAbrir = function(){
    if(!S || !S.driver) return;
    const meu = retratoDe(S);
    PP.retCtx = 'carreira';
    PP.retEd = { tipo: meu ? meu.tipo : 'avatar', aba: meu && meu.tipo === 'foto' ? 'foto' : 'rosto',
      avatar: Object.assign({}, avatarPadrao(S.driver), meu && meu.avatar || {}), foto: meu && meu.foto || null };
    UI.modal(UI.head('Retrato do piloto', 'Monte o rosto do seu piloto ou use uma foto sua.') +
      `<div class="mbd"><div id="ppRetEd">${editorHtml()}</div></div>
       <div class="mft">${meu ? '<button class="btn btn-ghost" onclick="PP.retRemover()">Voltar ao padrão</button>' : ''}<span class="sp"></span>
         <button class="btn btn-primary" onclick="PP.retSalvar()">Salvar retrato</button></div>`, true);
  };
  PP.retSalvar = function(){
    const e = PP.retEd; if(!e || !S) return;
    if(e.tipo === 'foto' && !e.foto) return UI.toast('Escolha uma imagem.');
    if(gravarRetrato({ chave: chaveDe(S.driver), tipo: e.tipo, avatar: e.avatar, foto: e.tipo === 'foto' ? e.foto : null })){ UI.close(); UI.render(); }
  };
  PP.retRemover = function(){ try { localStorage.removeItem('vdo_retrato'); } catch(e){} UI.close(); UI.render(); };
  /* na nova carreira: um passo a mais, logo depois do nome e do número; o cartão acompanha o que se digita */
  function passoNovo(){
    const sec = $('scr-new'); if(!sec) return;
    if(!PP.retEd || PP.retCtx !== 'novo'){ PP.retCtx = 'novo'; PP.retEd = { tipo: 'avatar', aba: 'rosto', avatar: Object.assign({}, PADRAO), foto: null }; }
    let p = sec.querySelector('.pp-passo-ret');
    if(!p){
      const primeiro = sec.querySelector('.passo'); if(!primeiro) return;
      primeiro.insertAdjacentHTML('afterend', `<div class="passo pp-passo-ret"><div class="passo-n"><span>Retrato</span></div>
        <div class="card pad"><div id="ppRetEdNovo"></div></div></div>`);
      ['inName', 'inNum'].forEach(id => { const i = $(id); if(i) i.addEventListener('input', () => { if(PP.retCtx === 'novo') redesenharEditor(); }); });
    }
    redesenharEditor();
  }
  /* ao assinar o contrato, o retrato montado no formulário passa a ser o do novo piloto */
  if(typeof Game !== 'undefined' && Game.start){
    const comecar = Game.start;
    Game.start = function(){
      const ed = PP.retCtx === 'novo' ? PP.retEd : null;
      const r = comecar.apply(this, arguments);
      if(ed && S && S.driver && document.body.dataset.tela === 'career'){
        gravarRetrato({ chave: chaveDe(S.driver), tipo: ed.tipo === 'foto' && ed.foto ? 'foto' : 'avatar', avatar: ed.avatar, foto: ed.tipo === 'foto' ? ed.foto : null });
        PP.retEd = null; PP.retCtx = null; UI.render();
      }
      return r;
    };
  }

  window.PP = PP;
})();
