/* Apoio ao projeto: a única configuração da página "Apoie o projeto".

   Preencha só com dados reais e seus. O jogo não gera chave, QR Code nem link:
   ele só mostra o que estiver escrito aqui, e o pagamento acontece no seu banco
   ou na plataforma escolhida, fora do jogo. Doar não dá vantagem nenhuma no jogo.
   Sem nada preenchido, a página diz que as doações ainda não estão disponíveis.

   Basta preencher UM dos meios (Pix ou link). Os dois também funcionam juntos. */
window.VDO_DOACAO = {
  pix: {
    /* a chave Pix exatamente como está cadastrada no banco (e-mail, telefone com +55,
       CPF/CNPJ ou chave aleatória) */
    chave: '4c907b45-21bd-4aee-a868-0b02edc47f40',
    /* o nome do recebedor, para a pessoa conferir no app do banco. Veio do próprio
       código Pix abaixo, que corta o nome em 25 letras: troque pelo nome completo
       como o banco mostra, se quiser. */
    beneficiario: 'Valdir Fernandes Boa Sort',
    /* o "Pix Copia e Cola" gerado pelo banco. O jogo confere o código (CRC16 e a
       chave dentro dele) antes de mostrar o QR Code e o botão de copiar; se não
       bater com a chave acima, nenhum dos dois aparece. */
    copiaecola: '00020126580014BR.GOV.BCB.PIX01364c907b45-21bd-4aee-a868-0b02edc47f405204000053039865802BR5925Valdir Fernandes Boa Sort6009SAO PAULO62140510a84BTY4d6C6304BFDF',
    /* a imagem do QR Code gerada pelo próprio banco, salva no projeto. Ela é o mesmo
       código acima (conferido com ferramentas/pix/ler-qr.py). */
    qrcode: 'assets/pix-qrcode.png'
  },
  link: {
    /* opcional: página de doação numa plataforma externa, com https:// */
    url: '',
    /* o nome da plataforma, mostrado no botão (ex.: 'Ko-fi', 'Apoia.se') */
    nome: ''
  }
};
