/* Follows the operating-system reduced-motion preference. No simulation, save writes, telemetry or payment data. */
(function(){
  'use strict';
  function init(){
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
