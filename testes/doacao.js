/* Apoie o projeto: página própria e item amarelo no menu superior (que é o mesmo
   menu do celular); sem configuração a página diz que ainda não há como doar,
   nada inventado, cópia confirmada só quando funciona, link externo avisado,
   volta para onde estava e nenhuma vantagem no jogo.
   Uso: node testes/doacao.js   Não modifica arquivos nem saves. */
const fs = require('fs');
const path = require('path');
const H = require('./base');
let falhas = 0, n = 0;
const ok = (c, m) => { n++; if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };

const CONF = path.join(__dirname, '..', 'assets', 'doacao.js');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
ok(fs.existsSync(CONF) && /<script src="assets\/doacao\.js"><\/script>\s*<script>/.test(html), 'a configuração fica num arquivo só e carrega antes do jogo');

/* o menu: o item está dentro do nav do topo (o mesmo que abre no botão de menu do celular) */
{
  const nav = (html.match(/<nav class="topnav" id="topMenu"[\s\S]*?<\/nav>/) || [''])[0];
  ok(/class="topnav-apoio" id="navApoio" onclick="Doacao\.pagina\(\)">Apoie o projeto</.test(nav) && !/navApoio[^>]*hidden/.test(nav), 'o item "Apoie o projeto" fica sempre no menu superior');
  ok(/\.topnav button\.topnav-apoio\{[^}]*background:#f5c518/.test(html) && /@media\(max-width:999px\)\{ \.topnav button\.topnav-apoio/.test(html), 'com destaque amarelo, também no menu do celular');
  ok(/aria-controls="topMenu"/.test(html), 'o botão de menu do celular abre o mesmo menu');
  ok(/<button onclick="Doacao\.pagina\(\)" id="peApoio">/.test(html), 'o rodapé também leva à página');
}

const PAGINA = (html.match(/<section class="screen" id="scr-apoio"[\s\S]*?(?=<!-- ═════════ FICHA DE INSCRIÇÃO)/) || [''])[0];
{
  /* a configuração do projeto: a chave, o QR Code e o Pix Copia e Cola do dono, conferidos entre si */
  const J = H.carregar({ silencioso:true });
  require('vm').runInContext(fs.readFileSync(CONF, 'utf8'), J.ctx);
  const c = J.run('window.VDO_DOACAO'), d = J.run('Doacao.config()'), lido = J.run(`Doacao.lerPix(window.VDO_DOACAO.pix.copiaecola)`);
  ok(lido && lido.chave === c.pix.chave, 'o Pix Copia e Cola configurado passa no CRC16 e traz a mesma chave configurada');
  ok(d.pix && d.pix.copia && d.pix.qr === 'assets/pix-qrcode.png' && fs.existsSync(path.join(__dirname, '..', d.pix.qr)), 'com o código conferido, o QR Code do projeto aparece');
  /* a imagem é o mesmo código (quando há Python para ler o QR) */
  let decod = null;
  try { decod = require('child_process').execFileSync('python', [path.join(__dirname, '..', 'ferramentas', 'pix', 'ler-qr.py'), path.join(__dirname, '..', c.pix.qrcode)], { stdio:['ignore','pipe','ignore'] }).toString().trim(); } catch(e){}
  if(decod != null) ok(decod === c.pix.copiaecola, 'a imagem do QR Code, lida pixel a pixel, é exatamente o Pix Copia e Cola configurado');
  else console.log('  · sem Python: a leitura da imagem do QR Code ficou de fora deste teste');
  ok(J.run(`(() => { const o = window.VDO_DOACAO.pix.chave; window.VDO_DOACAO.pix.chave = 'outra@exemplo.com'; const x = Doacao.config(); window.VDO_DOACAO.pix.chave = o; return !x.pix.copia && !x.pix.qr; })()`), 'se a chave não bate com o código, nem o QR Code nem o Copia e Cola aparecem');
  ok(J.run(`(() => { const o = window.VDO_DOACAO.pix.copiaecola; window.VDO_DOACAO.pix.copiaecola = o.replace('SAO PAULO', 'SAO PAULX'); const x = Doacao.config(); window.VDO_DOACAO.pix.copiaecola = o; return !x.pix.copia && !x.pix.qr; })()`), 'um código adulterado (CRC errado) é recusado');
  J.run(`document.body.dataset.tela = 'intro'; Doacao.pagina();`);
  const m = J.E('apoioMeios').innerHTML, mot = PAGINA;
  ok(/Faça parte dessa história/.test(m) && /Copiar chave Pix/.test(m) && /Copiar Pix Copia e Cola/.test(m) && /apoio-qr/.test(m), 'a página mostra o cartão do Pix com QR Code, chave e os dois botões de copiar');
  ok(/Abra o aplicativo do seu banco/.test(m) && /Confira os dados do destinatário/.test(m) && /não pede CPF, senha, cartão/.test(m), 'com as instruções e o aviso de que nenhum dado é pedido');
  ok((mot.match(/<li class="ap-motivo/g) || []).length === 4 && (mot.match(/Ideia para o futuro, sem data definida/g) || []).length === 2, 'os quatro motivos, cada um com foto real, e os planos marcados como ideia, sem data nem promessa');
  J.run(`navigator.clipboard = { writeText: t => { globalThis._cc = t; return Promise.resolve(); } }; Doacao.copiar('cc'); Doacao.copiar();`);
  ok(J.run('globalThis._cc') === c.pix.chave && J.run(`(() => { navigator.clipboard = { writeText: t => { globalThis._cc2 = t; return Promise.resolve(); } }; Doacao.copiar('cc'); return globalThis._cc2; })()`) === c.pix.copiaecola,
     '"Copiar Pix Copia e Cola" copia o código inteiro, e "Copiar chave Pix" só a chave');
}
{
  /* sem nada configurado — a página diz que ainda não há como doar */
  const J = H.carregar({ silencioso:true });
  J.run('window.VDO_DOACAO = { pix:{ chave:"", beneficiario:"", qrcode:"" }, link:{ url:"" } };');
  J.run('Doacao.mostrar()');
  ok(!J.run('Doacao.ativa()') && J.E('abApoio').hidden === true, 'sem configuração, o atalho da tela inicial fica escondido');
  J.run(`document.body.dataset.tela = 'intro'; Doacao.pagina();`);
  const p = J.E('apoioMeios').innerHTML;
  ok(J.run('document.body.dataset.tela') === 'apoio' && J.E('scr-apoio').classList.contains('on'), 'o item abre a página de apoio');
  ok(/Ainda não disponível/.test(p) && /Nenhum meio de pagamento foi configurado/.test(p) && /role="status"/.test(p), 'sem configuração, a página diz com clareza que ainda não há como doar');
  ok(!/apoioChave|Copiar chave|href=/.test(p), 'e não mostra chave, botão de cópia nem link');
  ok(J.E('navApoio').getAttribute('aria-current') === 'page', 'o item do menu fica marcado como página atual');
  ok(J.E('apoioVoltarTx').textContent === 'Voltar ao início', 'vindo da abertura, o botão volta ao início');
  const pag = PAGINA;
  ok(/continuará gratuito/.test(pag) && /totalmente opcionais/.test(pag) && /Obrigado por fazer parte do grid/.test(pag) && /Doacao\.irInicio\(\)/.test(pag),
     'a página diz que o jogo segue gratuito e que doar é opcional, agradece e tem o botão de voltar ao menu principal');
  J.run('Doacao.voltar();');
  ok(J.run('document.body.dataset.tela') === 'intro' && J.E('navApoio').getAttribute('aria-current') == null, 'voltar leva de novo à abertura');
}
{
  /* configurações inválidas não contam */
  const J = H.carregar({ silencioso:true });
  const casos = [
    { pix:{ chave:'  ', beneficiario:'Alguém' } },
    { pix:{ chave:'chave-de-teste', beneficiario:'' } },
    { link:{ url:'http://exemplo.invalid/doar' } },
    { link:{ url:'javascript:alert(1)' } },
    { link:{ url:'https://localhost' } }
  ];
  const r = casos.map(cf => J.run(`window.VDO_DOACAO = ${JSON.stringify(cf)}; Doacao.ativa()`));
  ok(r.every(x => x === false), 'chave sem beneficiário, link sem https e endereços estranhos não contam como configuração');
  J.run(`window.VDO_DOACAO = { pix:{ chave:'chave-de-teste', beneficiario:'' } }; Doacao.pagina();`);
  ok(/Ainda não disponível/.test(J.E('apoioMeios').innerHTML), 'configuração incompleta: a página continua dizendo que não há como doar');
}
{
  /* configurado (valores de teste só aqui dentro): aparece, explica e copia de verdade */
  const J = H.carregar({ silencioso:true, seed: 3 });
  H.novaCarreira(J, { era: 7, ano: 2020, idade: 16, rapido: true });
  const antes = J.run('JSON.stringify({ d:S.driver, m:S.money, t:S.team })');
  J.run(`window.VDO_DOACAO = { pix:{ chave:'chave-de-teste-123', beneficiario:'Pessoa de Teste', qrcode:'../fora.png' },
    link:{ url:'https://exemplo.invalid/apoio', nome:'Plataforma' } }; Doacao.mostrar();`);
  ok(J.E('abApoio').hidden === false, 'configurado, o atalho aparece também na tela inicial');
  J.run(`UI.show('career'); Doacao.pagina();`);
  const m = J.E('apoioMeios').innerHTML;
  ok(/data-i18n-ignore>chave-de-teste-123/.test(m) && !/Pessoa de Teste|Recebedor/.test(m), 'a chave aparece como foi escrita, sem tradução, e a linha do recebedor não aparece');
  ok(!/Ainda não disponível/.test(m), 'com meio configurado, não aparece o aviso de indisponível');
  ok(!/fora\.png/.test(m), 'QR Code fora da pasta do projeto é ignorado');
  ok(/target="_blank" rel="noopener noreferrer"/.test(m) && /página externa/.test(m) && /exemplo\.invalid/.test(m), 'o link avisa que abre uma página externa e mostra o endereço');
  ok(J.E('apoioVoltarTx').textContent === 'Voltar ao jogo', 'vindo da carreira, o botão volta ao jogo');
  /* cópia que funciona */
  J.run(`navigator.clipboard = { writeText: t => { globalThis._copiado = t; return Promise.resolve(); } }; UI._ultToast = '';
    const _t = UI.toast; UI.toast = m => { UI._ultToast = m; };
    Doacao.copiar();`);
  setImmediate(() => {
    ok(J.run('globalThis._copiado') === 'chave-de-teste-123' && J.run('UI._ultToast') === 'Chave Pix copiada.' && J.E('apoioAviso').textContent === 'Chave copiada.', 'copiou: confirma depois que a cópia deu certo');
    /* cópia que falha: nenhuma confirmação falsa */
    J.run(`UI._ultToast = ''; navigator.clipboard = { writeText: () => Promise.reject(new Error('negado')) };
      document.execCommand = () => false; document.createRange = () => ({ selectNodeContents(){} });
      getSelection = () => ({ removeAllRanges(){}, addRange(){} }); Doacao.copiar();`);
    setImmediate(() => {
      ok(J.run('UI._ultToast') === '' && /Não deu para copiar/.test(J.E('apoioAviso').textContent), 'a cópia falhou: avisa e não confirma');
      J.run('Doacao.voltar();');
      ok(J.run('document.body.dataset.tela') === 'career', 'voltar leva de novo à carreira, onde estava');
      ok(J.run('JSON.stringify({ d:S.driver, m:S.money, t:S.team })') === antes, 'abrir a página e copiar não mexe em piloto, dinheiro nem equipe');
      console.log(falhas ? falhas + ' falha(s) de ' + n : `apoio ao projeto: ${n} verificações, tudo certo`);
      if(falhas) process.exitCode = 1;
    });
  });
}
