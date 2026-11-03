/* A barra lateral do site (o trilho): as seções do jogo em todas as telas, a mesma que nasceu na página
   do multiplayer. Só monta a navegação e chama o que o jogo já tem (Game, Abertura, UIC, UI, MP);
   marca a seção da tela atual a cada UI.show. Na tela do chefe, que tem o menu da equipe ao lado,
   ela fica só com os ícones; no celular, vira uma faixa rolável embaixo do topo. */
(function(){
  'use strict';
  if(typeof UI === 'undefined' || typeof ico !== 'function') return;
  const el = id => document.getElementById(id);
  const ITENS = [
    { k: 'inicio', ic: 'casa', nome: 'Início', telas: ['intro'] },
    { k: 'carreira', ic: 'trofeu', nome: 'Carreira', telas: ['new', 'career'] },
    { k: 'chefe', ic: 'maleta', nome: 'Chefe de equipe', telas: ['chefe-novo', 'chefe'] },
    { k: 'mp', ic: 'pessoas', nome: 'Multiplayer', telas: ['multiplayer'] },
    { k: 'recordes', ic: 'barras', nome: 'Recordes', telas: [] },
    { k: 'lendas', ic: 'coroa', nome: 'Lendas', telas: [] },
    { k: 'ajuda', ic: 'livros', nome: 'Como funciona', telas: [] }
  ];
  const visivel = b => !!b && b.style.display !== 'none' && !b.hidden;
  const mpLigado = () => typeof MP !== 'undefined' && MP && typeof MP.disponivel === 'function' && MP.disponivel();

  const Trilho = {
    /* cada seção pelo caminho de sempre: a carreira e a equipe guardadas continuam; sem jogo, começa um */
    ir(k){
      const tela = document.body.dataset.tela;
      if(k === 'inicio') return Game.goHome();
      if(k === 'carreira'){
        if(tela === 'career' || tela === 'new') return;
        Game.goHome();
        return visivel(el('btnContinue')) ? Game.continueSave() : Abertura.comecar();
      }
      if(k === 'chefe'){
        if(tela === 'chefe' || tela === 'chefe-novo') return;
        Game.goHome();
        return visivel(el('btnChefeCont')) ? UIC.continuar() : Abertura.chefe();
      }
      if(k === 'mp') return mpLigado() ? MP.tela() : null;
      if(k === 'recordes') return UI.records();
      if(k === 'lendas') return UI.hall();
      if(k === 'ajuda') return UI.help();
    },
    montar(){
      if(el('trilho')) return;
      const topo = el('topBar'); if(!topo) return;
      const nav = document.createElement('nav');
      nav.id = 'trilho'; nav.className = 'trilho'; nav.setAttribute('aria-label', 'Navegação principal');
      nav.innerHTML = ITENS.map(i => `<button class="trilho-i" data-k="${i.k}" title="${i.nome}" onclick="Trilho.ir('${i.k}')">${ico(i.ic)}<span>${i.nome}</span></button>`).join('')
        + '<p class="trilho-lema"><span>Do kart ao topo.</span> <span>Em qualquer época.</span> <span>Com quem você quiser.</span></p>';
      topo.insertAdjacentElement('afterend', nav);
      document.body.classList.add('com-trilho');
      Trilho.marcar();
    },
    /* a seção da tela atual fica marcada; o multiplayer só aparece para quem tem ele liberado */
    marcar(){
      const nav = el('trilho'); if(!nav) return;
      const tela = document.body.dataset.tela || 'intro';
      nav.querySelectorAll('.trilho-i').forEach(b => {
        const it = ITENS.find(i => i.k === b.dataset.k), on = it.telas.includes(tela);
        b.classList.toggle('on', on);
        if(on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
        if(it.k === 'mp') b.hidden = !mpLigado();
      });
    }
  };
  window.Trilho = Trilho;

  const show = UI.show;
  UI.show = function(){ const r = show.apply(this, arguments); Trilho.marcar(); return r; };

  const st = document.createElement('style');
  st.textContent = `
    body.com-trilho{--trilho:232px}
    .trilho{position:fixed; left:0; top:0; bottom:0; z-index:50; width:var(--trilho); display:flex; flex-direction:column; gap:4px;
      padding:84px 14px 24px; background:var(--rail, var(--s1)); overflow-y:auto; scrollbar-width:none}
    .trilho::-webkit-scrollbar{display:none}
    .trilho-i{display:flex; align-items:center; gap:14px; min-height:48px; padding:0 14px; border-radius:10px; font-size:16px; font-weight:600;
      color:var(--soft); text-align:left; white-space:nowrap; transition:background .2s,color .2s,transform .2s var(--ease, ease)}
    .trilho-i .ico{width:22px; height:22px; fill:currentColor; flex:none}
    .trilho-i:hover{background:var(--s2); color:var(--ink); transform:translateX(3px)}
    .trilho-i:focus-visible{outline:2px solid var(--accent); outline-offset:2px}
    .trilho-i.on{background:var(--accent); color:var(--accent-ink)}
    .trilho-i.on:hover{transform:none}
    .trilho-i:active{transform:scale(.98)}
    .trilho-lema{margin:auto 0 0; padding:20px 14px 0; display:grid; gap:2px; font-size:14px; line-height:1.4; font-style:italic; color:var(--faint)}
    /* o conteúdo começa depois do trilho e continua centrado no espaço que sobra */
    body.com-trilho #conteudo{margin-left:var(--trilho); margin-right:0; max-width:none;
      padding-left:max(var(--m), calc((100vw - var(--trilho) - 1240px) / 2 + var(--m)));
      padding-right:max(var(--m), calc((100vw - var(--trilho) - 1240px) / 2 + var(--m)))}
    body.com-trilho[data-tela="chefe"] #conteudo,body.com-trilho[data-tela="multiplayer"] #conteudo,body.com-trilho[data-tela="intro"] #conteudo{padding-left:0; padding-right:0}
    /* a página do multiplayer usa este trilho no lugar do dela */
    body.com-trilho .mpp{grid-template-columns:minmax(0,1fr)}
    body.com-trilho .mpp::before,body.com-trilho .mpp-nav{display:none}
    /* na tela do chefe (que tem o menu da equipe) o trilho fica só com os ícones */
    body.com-trilho[data-tela="chefe"]{--trilho:72px}
    body.com-trilho[data-tela="chefe"] .trilho{padding-left:10px; padding-right:10px}
    body.com-trilho[data-tela="chefe"] .trilho-i{justify-content:center; padding:0}
    body.com-trilho[data-tela="chefe"] .trilho-i span,body.com-trilho[data-tela="chefe"] .trilho-lema{display:none}
    @media (max-width:1100px){
      body.com-trilho{--trilho:0px}
      .trilho{position:static; width:auto; flex-direction:row; gap:4px; padding:6px var(--m); overflow-x:auto; overflow-y:hidden}
      .trilho-i{flex:none; min-height:40px; padding:0 12px; gap:8px; font-size:14px}
      .trilho-i .ico{width:18px; height:18px}
      .trilho-i:hover{transform:none}
      .trilho-lema{display:none}
      /* na abertura do celular o topo fica sobre a foto, e os botões dos modos já estão ali */
      body.com-trilho[data-tela="intro"] .trilho{display:none}
      body.com-trilho[data-tela="chefe"] .trilho-i{padding:0 12px}
      body.com-trilho[data-tela="chefe"] .trilho-i span{display:inline}
      body.com-trilho #conteudo{margin-left:auto; margin-right:auto; max-width:1240px; padding-left:var(--m); padding-right:var(--m)}
      body.com-trilho[data-tela="chefe"] #conteudo,body.com-trilho[data-tela="multiplayer"] #conteudo,body.com-trilho[data-tela="intro"] #conteudo{max-width:none; padding-left:0; padding-right:0}
    }
    @media (prefers-reduced-motion:reduce){ .trilho-i{transition:none} .trilho-i:hover{transform:none} }
  `;
  document.head.appendChild(st);

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => Trilho.montar());
  else Trilho.montar();
})();
