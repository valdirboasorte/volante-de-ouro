/* Public navigation only. No simulation, save writes, telemetry or payment data. */
(function(){
  'use strict';
  function goToRoadmap(event){
    if(event && (event.button > 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)) return;
    const section = document.getElementById('roadmap');
    if(!section) return;
    if(event) event.preventDefault();
    if(typeof AoVivo !== 'undefined' && AoVivo.R){
      UI.toast('Termine a corrida antes de abrir o roadmap.');
      return;
    }
    if(typeof UI !== 'undefined'){
      if((typeof UI.aberta === 'function' && UI.aberta()) || (UI._fila && UI._fila.length) || UI._aoEsvaziar){
        UI.toast('Conclua a decisão atual antes de abrir o roadmap.');
        return;
      }
      UI.show('intro'); UI.menuTopo(false);
    }
    try{ if(location.hash !== '#roadmap') history.pushState(null, '', '#roadmap'); }catch(e){}
    section.scrollIntoView({behavior:'auto',block:'start'});
    section.focus({preventScroll:true});
  }
  function init(){
    document.querySelectorAll('a[href="#roadmap"]').forEach(link => link.addEventListener('click',goToRoadmap));
    addEventListener('hashchange',()=>{ if(location.hash === '#roadmap') goToRoadmap(); });
    if(location.hash === '#roadmap') goToRoadmap();
    const pref = matchMedia('(prefers-reduced-motion: reduce)');
    if(pref.addEventListener) pref.addEventListener('change',()=>{
      if(typeof UI !== 'undefined') UI.aplicarMovimento();
      if(typeof Abertura !== 'undefined'){
        Abertura.reduzido = !UI.movimentoLigado();
        Abertura.filme();
      }
    });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();
