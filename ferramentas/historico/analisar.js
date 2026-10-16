/* Roda dentro do navegador (Chrome sem interface): recebe o HTML de uma página
   da Wikipedia e devolve o que dá para ler dela com segurança.
   — inscritos: a tabela "Teams and drivers" / "Entries" (equipe, número,
     piloto, bandeira, chassi, motor, etapas disputadas)
   — calendário: a tabela de etapas (rodada, circuito, local, data)
   — campeão: o que o infobox da temporada diz
   — infobox do campeonato: temporada inaugural e encerramento
   Nada é completado: o que a tabela não diz fica vazio. */
function analisar(html){
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('sup.reference, .mw-editsection, style, .sortkey, .noprint, sup.noprint').forEach(n => n.remove());
  const txt = n => (n ? n.textContent : '').replace(/\[[^\]]*\]/g, '').replace(/[ \s]+/g, ' ').replace(/[†‡*#~^]+/g, '').trim();

  /* bandeira de uma célula: pelo nome do arquivo da imagem */
  const bandeira = cell => {
    if(!cell) return null;
    const img = cell.querySelector('.flagicon img, img[src*="Flag_of"], img[src*="flag_of"]');
    if(img){
      const m = decodeURIComponent(img.getAttribute('src') || '').match(/Flag_of_(?:the_)?([^/]+?)\.svg/i);
      if(m) return m[1].replace(/_/g, ' ').replace(/\s*\(.*$/, '').trim();
      if(/Flag_of_FIA|FIA_flag/i.test(img.getAttribute('src'))) return 'FIA';
    }
    const a = cell.querySelector('.flagicon a[title]');
    return a ? a.getAttribute('title') : null;
  };

  /* uma tabela vira grade, com rowspan e colspan desdobrados */
  const grade = table => {
    const g = [];
    [...table.rows].forEach((tr, ri) => {
      g[ri] = g[ri] || [];
      let ci = 0;
      [...tr.cells].forEach(cell => {
        while(g[ri][ci]) ci++;
        const rs = Math.min(+cell.rowSpan || 1, 60), cs = Math.min(+cell.colSpan || 1, 30);
        for(let a = 0; a < rs; a++) for(let b = 0; b < cs; b++) (g[ri + a] = g[ri + a] || [])[ci + b] = { cell, th: cell.tagName === 'TH', ini: a === 0 && b === 0 };
        ci += cs;
      });
    });
    return g;
  };
  /* as linhas de cabeçalho no topo e o nome de cada coluna */
  const cabecalho = g => {
    let n = 0;
    while(n < g.length && g[n] && g[n].length && g[n].filter(Boolean).every(x => x.th)) n++;
    if(!n) return null;
    const larg = Math.max(...g.slice(0, n + 1).map(r => (r || []).length));
    const nomes = [];
    for(let c = 0; c < larg; c++){
      const partes = [];
      for(let r = 0; r < n; r++){ const x = g[r][c]; if(x){ const t = txt(x.cell); if(t && partes[partes.length - 1] !== t) partes.push(t); } }
      nomes.push(partes.join(' / ').toLowerCase());
    }
    return { n, nomes };
  };
  const col = (nomes, re, nao) => nomes.findIndex(h => re.test(h) && !(nao && nao.test(h)));
  /* um link que é nome de gente, não arquivo, bandeira ou predefinição */
  const ehNome = a => !a.closest('.flagicon') && !/^\/wiki\/(File|Image|Help|Template|Wikipedia|Category|Special):/i.test(a.getAttribute('href'));
  /* o texto de uma célula linha por linha (as quebras <br> e os blocos contam) */
  const linhasDe = cell => {
    if(!cell) return [];
    const c = cell.cloneNode(true);
    c.querySelectorAll('br').forEach(b => b.replaceWith('\n'));
    c.querySelectorAll('div, p, li').forEach(d => d.append('\n'));
    return c.textContent.split('\n').map(s => s.replace(/\[[^\]]*\]/g, '').replace(/[ \s]+/g, ' ').replace(/[†‡*#~^]+/g, '').trim()).filter(Boolean);
  };
  const juntas = cell => linhasDe(cell).join(' / ');
  /* cada piloto citado numa célula, com a bandeira que vem logo antes dele */
  const pilotosDaCelula = cell => {
    const out = []; let flag = null;
    cell.querySelectorAll('.flagicon, a[href^="/wiki/"]').forEach(n => {
      /* bandeira com moldura (.flagicon) ou solta, como link para o arquivo */
      if(n.classList.contains('flagicon')){ flag = bandeira(n); return; }
      if(/^\/wiki\/File:Flag_of/i.test(n.getAttribute('href') || '')){ if(!n.closest('.flagicon')) flag = bandeira(n.parentElement); return; }
      if(!ehNome(n)) return;
      out.push({ nome: txt(n), pagina: decodeURIComponent(n.getAttribute('href').replace('/wiki/', '').split('#')[0]), cc: flag });
      flag = null;
    });
    return out;
  };

  /* percorre a página na ordem: título de seção atual + tabelas */
  const blocos = [];
  let secao = '', subsecao = '';
  doc.body.querySelectorAll('h2, h3, h4, table').forEach(el => {
    if(/^H[234]$/.test(el.tagName)){ if(el.tagName === 'H2'){ secao = txt(el); subsecao = ''; } else subsecao = txt(el); return; }
    if(el.closest('table') !== el) return;            /* tabela dentro de tabela */
    blocos.push({ el, secao, subsecao });
  });

  /* ── infobox ── */
  const infobox = {};
  const ib = doc.querySelector('table.infobox');
  if(ib) [...ib.rows].forEach(tr => {
    const th = tr.querySelector('th'), td = tr.querySelector('td');
    if(th && td){ const k = txt(th).toLowerCase(); if(k && !(k in infobox)) infobox[k] = { t: txt(td), cc: bandeira(td) }; }
  });
  const ibPega = re => { const k = Object.keys(infobox).find(x => re.test(x)); return k ? infobox[k] : null; };
  const campeao = ibPega(/^drivers'? ?champion|^champion$|^drivers'? champions?$|^champion\(s\)$/);

  /* ── inscritos ── */
  const inscritos = [];
  const tabelasUsadas = [];
  blocos.forEach(({ el, secao, subsecao }) => {
    if(!el.classList.contains('wikitable')) return;
    const sec = (secao + ' ' + subsecao).toLowerCase();
    if(/standings|results|classification|championship|calendar|schedule|summary|statistics|winners/.test(sec) && !/entr|team|driver/.test(secao.toLowerCase())) return;
    const g = grade(el), cab = cabecalho(g);
    if(!cab) return;
    const N = cab.nomes;
    const cPil = col(N, /driver|pilot/, /round|of the day|champion|test|reserve|points|pos|(^|\/ )no\.?$|number|(^|\/ )#$/);
    const cEq = col(N, /team|entrant|constructor|équipe/, /principal|points|champion|pos/);
    const cNum = col(N, /(^|\/ )no\.?$|^no\. |number|(^|\/ )#|car no/);
    const cRod = col(N, /round|races?$|events?/);
    const cCha = col(N, /chassis/), cMot = col(N, /engine|power unit/), cCar = col(N, /^car$|^car \/|model/);
    /* o construtor, quando a tabela separa inscrito e construtor (F1 e afins) */
    const cConCol = col(N, /constructor|manufacturer|make/, /points|champion|pos/);
    const cCon = cConCol !== cEq ? cConCol : -1;
    const cNat = col(N, /^nat|nation/);
    if(cPil < 0 || (cEq < 0 && cNum < 0)) return;
    if(N.some(h => /^pos|points|pts/.test(h))) return;
    const teste = /test|reserve|third|practice/.test(sec);
    let usou = false;
    for(let r = cab.n; r < g.length; r++){
      const row = g[r]; if(!row || !row[cPil]) continue;
      if(row.filter(Boolean).every(x => x.th)) continue;
      const pc = row[cPil].cell;
      const eq = cEq >= 0 && row[cEq] ? juntas(row[cEq].cell) : '';
      const cha = cCha >= 0 && row[cCha] ? juntas(row[cCha].cell) : (cCar >= 0 && row[cCar] ? juntas(row[cCar].cell) : '');
      const mot = cMot >= 0 && row[cMot] ? juntas(row[cMot].cell) : '';
      const con = cCon >= 0 && row[cCon] ? juntas(row[cCon].cell) : '';
      const ccNat = cNat >= 0 && row[cNat] ? bandeira(row[cNat].cell) : null;
      const varios = pilotosDaCelula(pc);
      if(varios.length > 1){
        /* vários pilotos na mesma célula: número e etapas vêm uma linha para cada */
        const nums = cNum >= 0 && row[cNum] ? linhasDe(row[cNum].cell) : [];
        const rods = cRod >= 0 && row[cRod] ? linhasDe(row[cRod].cell) : [];
        varios.forEach((p, k) => {
          if(!p.nome || p.nome.length > 60) return;
          inscritos.push({ nome: p.nome, pagina: p.pagina, cc: p.cc || ccNat, eq, con,
            num: nums.length === varios.length ? nums[k] : nums.join(' / '),
            rod: rods.length === varios.length ? rods[k] : rods.join(' / '), cha, mot, teste: teste || undefined });
          usou = true;
        });
        continue;
      }
      const links = [...pc.querySelectorAll('a[href^="/wiki/"]')].filter(ehNome);
      let nome = links.length ? txt(links[0]) : txt(pc);
      nome = nome.replace(/\((?:R|res|rookie|guest)\)$/i, '').trim();
      if(!nome || /^tba$|^tbc$|^none$|^—$|^-$/i.test(nome) || nome.length > 60) continue;
      const pagina = links.length ? decodeURIComponent(links[0].getAttribute('href').replace('/wiki/', '').split('#')[0]) : null;
      const cc = bandeira(pc) || ccNat;
      const num = cNum >= 0 && row[cNum] ? juntas(row[cNum].cell) : '';
      const rod = cRod >= 0 && row[cRod] ? juntas(row[cRod].cell) : '';
      inscritos.push({ nome, pagina, cc, eq, con, num, rod, cha, mot, teste: teste || undefined });
      usou = true;
    }
    if(usou) tabelasUsadas.push((secao + ' / ' + subsecao).trim());
  });

  /* ── calendário ── */
  let calendario = [];
  blocos.forEach(({ el, secao, subsecao }) => {
    if(calendario.length || !el.classList.contains('wikitable')) return;
    const sec = (secao + ' ' + subsecao).toLowerCase();
    if(!/calendar|schedule|season summary|results|rounds|race/.test(sec)) return;
    const g = grade(el), cab = cabecalho(g);
    if(!cab) return;
    const N = cab.nomes;
    const cRd = col(N, /^round|^rnd|^r\.?$|^no\.?$|^race no|^race$|^rd\.?$/), cCi = col(N, /circuit|track|venue/), cLo = col(N, /location|city|country/), cDt = col(N, /date/);
    if(cRd < 0 || cCi < 0) return;
    if(N.some(h => /^pos|points/.test(h))) return;
    const vistos = new Set();
    for(let r = cab.n; r < g.length; r++){
      const row = g[r]; if(!row || !row[cCi] || !row[cRd]) continue;
      const rd = txt(row[cRd].cell).replace(/^(?:rd|rnd|round|r)\.?\s*/i, '');
      if(!/^\d+[a-z]?$/i.test(rd) || vistos.has(rd)) continue;
      vistos.add(rd);
      const ci = row[cCi].cell, l = ci.querySelector('a[href^="/wiki/"]:not(.flagicon a)');
      calendario.push({ rd, circuito: l ? txt(l) : txt(ci), pagina: l ? decodeURIComponent(l.getAttribute('href').replace('/wiki/', '')) : null,
        cc: bandeira(ci) || (cLo >= 0 && row[cLo] ? bandeira(row[cLo].cell) : null), local: cLo >= 0 && row[cLo] ? txt(row[cLo].cell) : '', data: cDt >= 0 && row[cDt] ? txt(row[cDt].cell) : '' });
    }
  });

  /* ── classificação de pilotos: dá o campeão e, quando não há tabela de
     inscritos, a lista parcial de quem pontuou ── */
  let classificacao = [];
  blocos.forEach(({ el, secao, subsecao }) => {
    if(classificacao.length || !el.classList.contains('wikitable')) return;
    const sec = (secao + ' ' + subsecao).toLowerCase();
    if(!/standing|championship|classification|results|tables/.test(sec) || /team|constructor|nation|manufacturer|rookie|trophy|class b|class c|cup|junior|masters|national class/.test(subsecao.toLowerCase())) return;
    const g = grade(el), cab = cabecalho(g);
    if(!cab) return;
    const N = cab.nomes;
    const cPos = col(N, /^pos|^place|^rank|^pl\.?$/), cPil = col(N, /driver|^name$/, /team/);
    const cEq = col(N, /team|entrant|constructor/, /points/), cCha = col(N, /chassis|^car$/), cMot = col(N, /engine/);
    if(cPos < 0 || cPil < 0) return;
    const vistos = new Set();
    for(let r = cab.n; r < g.length; r++){
      const row = g[r]; if(!row || !row[cPil] || !row[cPos]) continue;
      const pos = txt(row[cPos].cell);
      const pc = row[cPil].cell;
      const l = [...pc.querySelectorAll('a[href^="/wiki/"]')].find(ehNome);
      const nome = l ? txt(l) : txt(pc);
      if(!nome || /^pos/i.test(pos) || vistos.has(nome) || nome.length > 60) continue;
      vistos.add(nome);
      classificacao.push({ pos, nome, pagina: l ? decodeURIComponent(l.getAttribute('href').replace('/wiki/', '')) : null, cc: bandeira(pc),
        eq: cEq >= 0 && row[cEq] ? juntas(row[cEq].cell) : '', cha: cCha >= 0 && row[cCha] ? juntas(row[cCha].cell) : '', mot: cMot >= 0 && row[cMot] ? juntas(row[cMot].cell) : '' });
    }
  });

  const ibInaug = ibPega(/inaugural season|^founded$|^inaugural/), ibFim = ibPega(/^folded$|last season|^final season|^ended$|^defunct/);
  const primeiro = classificacao.find(x => x.pos === '1');
  return JSON.stringify({ inscritos, tabelas: tabelasUsadas, calendario, classificacao,
    campeao: campeao ? campeao.t : primeiro ? primeiro.nome : null, campeaoCC: campeao ? campeao.cc : primeiro ? primeiro.cc : null,
    campeaoFonte: campeao ? 'infobox' : primeiro ? 'classificação' : null,
    inaugural: ibInaug ? ibInaug.t : null, encerrado: ibFim ? ibFim.t : null });
}

/* Caixas de navegação do artigo de um campeonato: ano → título da página da
   temporada. Um link só vale se o título tiver TODAS as palavras distintivas
   do nome do campeonato (em alguma das formas aceitas): "British Formula
   Ford" não aceita "Australian Formula Ford". Numerais por extenso contam
   como algarismos (Three = 3). */
function navboxAnos(html, formas){
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const genericas = /^(championship|series|the|of|and|fia|international|world|cup|trophy|season|seasons|de|da|do|wiki)$/;
  const NUM = { one:'1', two:'2', three:'3', four:'4', five:'5' };
  const pal = t => String(t).toLowerCase().replace(/\(.*?\)/g, ' ').replace(/[^a-z0-9áéíóúâêôãõçüäöß]+/g, ' ').split(' ').filter(Boolean).map(w => NUM[w] || w);
  const conjuntos = (Array.isArray(formas) ? formas : [formas]).map(f => { const todas = pal(f), fortes = todas.filter(w => !genericas.test(w));
    return fortes.length >= 2 || fortes.some(w => w.length >= 4) ? fortes : todas; }).filter(x => x.length);
  const anos = {};
  doc.querySelectorAll('div.navbox a[href^="/wiki/"], table.navbox a[href^="/wiki/"]').forEach(a => {
    const t = a.textContent.trim();
    const m = t.match(/^(\d{4})(?:[–-](\d{2}|\d{4}))?$/);
    if(!m) return;
    const fim = m[2] ? +(m[2].length === 2 ? m[1].slice(0, 2) + m[2] : m[2]) : +m[1];
    const titulo = decodeURIComponent(a.getAttribute('href').replace('/wiki/', '').split('#')[0]).replace(/_/g, ' ');
    const p = pal(titulo);
    if(!conjuntos.some(c => c.every(w => p.includes(w)))) return;
    if(!anos[fim]) anos[fim] = titulo;
  });
  return JSON.stringify(anos);
}
