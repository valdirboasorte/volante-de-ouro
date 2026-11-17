/* Apoie o projeto: os dois caminhos de doação, lado a lado.
   Pix para quem está no Brasil, Ko-fi (ou outro link) para quem está fora.
   Só mostra o que está em assets/doacao.js, conferido por Doacao.config(): a chave,
   o QR Code e o link do responsável. Fica fora dos blocos sem atributo do index.html
   (o hash do multiplayer não muda) e troca só a montagem dos meios. */
(function(){
  if(typeof Doacao === 'undefined') return;
  const e = typeof esc === 'function' ? esc : s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  Doacao.meiosHtml = function(c){
    if(!c.pix && !c.link) return `<div class="apoio-indisp" role="status">
        <span class="lbl">Doações</span>
        <b>Ainda não disponível</b>
        <p>Nenhum meio de pagamento foi configurado. Quando o responsável pelo projeto cadastrar uma chave Pix ou um link de apoio reais, eles aparecem aqui.</p>
        <p class="mut">Até lá não há como doar por aqui. Não use chaves ou links que circulem em nome do jogo fora desta página.</p>
      </div>`;
    let endereco = c.link ? c.link.dominio : '';
    if(c.link){ try { const u = new URL(c.link.url); endereco = (u.hostname.replace(/^www\./, '') + u.pathname).replace(/\/$/, ''); } catch(err){} }
    const pix = c.pix ? `<section class="ap-meio ap-meio-pix" aria-labelledby="apoioPixT" data-ap>
        <div class="ap-meio-tx">
          <h2 id="apoioPixT">No Brasil: Pix</h2>
          <span class="lbl">Chave Pix</span>
          <code class="apoio-chave" id="apoioChave" data-i18n-ignore>${e(c.pix.chave)}</code>
          <div class="apoio-acoes">
            <button class="btn btn-primary btn-lg" id="apoioCopiar" onclick="Doacao.copiar()">Copiar chave Pix</button>
            <span id="apoioAviso" class="apoio-aviso" role="status" aria-live="polite"></span>
          </div>
          <ol class="apoio-passos">
            <li>Abra o aplicativo do seu banco.</li>
            <li>Escolha a opção Pix.</li>
            <li>Escaneie o QR Code ou cole a chave.</li>
            <li>Confira os dados do destinatário e escolha o valor.</li>
          </ol>
        </div>
        ${c.pix.qr ? `<figure class="apoio-qrbox">
          <img class="apoio-qr" src="${e(c.pix.qr)}" width="380" height="380" alt="QR Code Pix para apoiar o Volante de Ouro">
          <figcaption>Escaneie com o app do seu banco.</figcaption>
        </figure>` : ''}
      </section>` : '';
    const link = c.link ? `<section class="ap-meio ap-meio-link" aria-labelledby="apoioLinkT" data-ap>
        <h2 id="apoioLinkT">${c.link.nome ? `Fora do Brasil: ${e(c.link.nome)}` : 'Fora do Brasil'}</h2>
        <p>Para quem mora em outro país: uma doação no valor que você escolher.</p>
        <a class="btn btn-primary btn-lg" href="${e(c.link.url)}" target="_blank" rel="noopener noreferrer">${c.link.nome ? `Doar pelo ${e(c.link.nome)}` : 'Abrir página de apoio'} <span aria-hidden="true">↗</span></a>
        <p class="ap-meio-nota">Abre uma página externa, fora do jogo: <span data-i18n-ignore>${e(endereco)}</span></p>
      </section>` : '';
    return `<div class="ap-meios${c.pix && c.link ? ' ap-meios-2' : ''}">${pix}${link}</div>`;
  };
  /* o endereço #apoie abre a página antes deste arquivo (defer) rodar: monta de novo */
  try {
    const m = document.getElementById('apoioMeios');
    if(m && document.body && document.body.dataset.tela === 'apoio'){
      m.innerHTML = Doacao.meiosHtml(Doacao.config());
      if(Doacao.revelar) Doacao.revelar();
    }
  } catch(err){}
})();
