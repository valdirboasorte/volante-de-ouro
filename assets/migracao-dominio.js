/* A recuperação é independente do jogo e só aparece no domínio oficial. */
(function(){
  'use strict';
  if(location.origin !== 'https://volantedeouro.com') return;
  const labels = {
    pt:'Recuperar progresso do site antigo',
    en:'Recover progress from the old site',
    es:'Recuperar el progreso del sitio anterior',
    ja:'旧サイトのセーブデータを復元'
  };
  function update(){
    const link = document.getElementById('legacyProgressLink');
    if(!link) return;
    const lang = document.documentElement.lang.split('-')[0];
    link.textContent = labels[lang] || labels.pt;
  }
  function init(){
    const actions = document.querySelector('.ini-acoes');
    if(!actions || document.getElementById('legacyProgressLink')) return;
    const link = document.createElement('a');
    link.id = 'legacyProgressLink';
    link.href = '/recuperar-progresso/';
    link.className = 'ini-continuar';
    link.setAttribute('data-i18n-ignore','');
    actions.appendChild(link); update();
  }
  window.addEventListener('vdo:languagechange', update);
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
