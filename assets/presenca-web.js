/* Segue o sistema sem substituir a escolha explícita de animações no site. */
(function(){
  'use strict';
  function init(){
    const pref = matchMedia('(prefers-reduced-motion: reduce)');
    if(pref.addEventListener) pref.addEventListener('change',()=>{
      if(typeof UI === 'undefined') return;
      const on = UI.aplicarMovimento();
      if(typeof Abertura !== 'undefined'){
        Abertura.reduzido = !on;
        Abertura.mais();
        Abertura.filme();
        Abertura.revelar();
      }
    });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();
