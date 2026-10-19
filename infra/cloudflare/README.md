# Migração para volantedeouro.com

## Estado publicado

Publicada e ativada em 19/10/2026. A recuperação dos saves foi publicada antes
da ativação da regra **Volante de Ouro - dominio oficial e recuperacao**,
associada à lista `vdo_dominio_antigo`. A Cloudflare mostra a regra como
`Enabled` e a lista como `Active`.

As 22 verificações HTTP de `node ferramentas/verificar-dominio.js` passaram:
URLs antigas retornam 301 com o destino esperado, o domínio oficial retorna
200 e as três variantes da recuperação permanecem na própria origem.
Caminhos, Unicode codificado, parâmetros repetidos e escapes foram conferidos.

## Estado e arquitetura

O projeto é HTML/CSS/JavaScript estático: `index.html`, `assets/`, `dados/` e
`manifest.json`. Não há framework, `package.json`, comando de build, backend,
Pages Functions ou Worker. `vercel.json` contém apenas cabeçalhos de uma
hospedagem anterior e não configura a Cloudflare.

No Pages, o conteúdo publicado é o diretório que contém `index.html`.
O painel foi conferido: comando de build vazio, saída `.`, diretório raiz
vazio, branch de produção `main` e deploys automáticos habilitados. Não foi
necessário alterar essa configuração.

O redirecionamento é aplicado por **Bulk Redirects, no nível da conta**.
Este diretório é uma configuração para importar no painel; publicar o CSV ou
o JSON como arquivos estáticos **não ativa a regra**. O JSON começa com
`enabled: false`, como modelo seguro para uma nova instalação. O status real
da regra já ativada deve ser consultado no painel.

`_redirects` do Pages não suporta condições por hostname. Uma regra global
`/* https://volantedeouro.com/:splat 301` também atingiria o domínio oficial
do mesmo projeto, provocando redirecionamento para a própria URL. Não adicionar
essa regra nem configurar um redirecionamento JavaScript no jogo.

## Proteção do progresso

Nesta versão não existem contas, login, OAuth, cookies de sessão, APIs ou banco
remoto. O progresso reside no `localStorage` de cada origem HTTPS. Os principais
dados são `vdo_save`, `vdo_chefe`, `vdo_hall` e `vdo_chefe_hall`; existem ainda
preferências de idioma, tema, animações e velocidade/duração da corrida.

O servidor não recebe esse armazenamento. Um 301, mesmo preservando caminhos
e query strings, não transfere esses dados para o domínio novo.

Foi autorizada uma exceção permanente para recuperação. Estas URLs do domínio
antigo devem continuar sendo servidas pelo Pages:

- `/recuperar-progresso`
- `/recuperar-progresso/`
- `/recuperar-progresso/index.html`

Todos os outros caminhos do hostname antigo recebem 301 para o mesmo caminho
no oficial. A exceção é exata: `/recuperar-progresso-outra` continua sendo
redirecionado. Subdomínios de preview não são afetados.

A página `recuperar-progresso/index.html` é autônoma, sem scripts externos:
no antigo, exporta um arquivo de backup; no oficial, permite sua importação.
O arquivo não é enviado a servidores nem colocado em URLs. Os dados antigos
continuam guardados. A página também permite fazer backup dos dados atuais
do domínio oficial. O acesso é pelo endereço direto `/recuperar-progresso/`;
a tela inicial do jogo não exibe um link de recuperação.

O jogador precisa usar o mesmo navegador/perfil em que jogava no endereço
antigo para exportar seu save. A recuperação não consegue recuperar dados
que já tenham sido apagados pelo navegador, por limpeza de dados ou pelo
encerramento de uma sessão privada.

## Ordem de publicação

1. Publicar `recuperar-progresso/index.html`. Não é necessário alterar o motor,
   chaves de armazenamento ou formato de saves.
2. Conferir que `https://volante-de-ouro.pages.dev/recuperar-progresso/` e
   `https://volantedeouro.com/recuperar-progresso/` servem a página de recuperação,
   identificada pela meta `vdo-progress-recovery=1`, e não o fallback do jogo.
3. Testar com uma carreira antiga e um backup do progresso oficial. Verificar
   no domínio oficial a carreira, equipe e os históricos importados.
4. Só então ativar a regra abaixo. Manter a exceção de recuperação enquanto
   houver jogadores com dados no endereço antigo.

## Configuração exata na Cloudflare

1. Entrar na conta dona do projeto em **Workers & Pages → volante-de-ouro →
   Custom domains** e confirmar que `volantedeouro.com` está ativo. Não remover
   o domínio nem alterar os registros DNS existentes.
2. Na mesma conta, abrir **Bulk redirects** (também pode aparecer em
   **Rules → Settings → Bulk Redirects**).
3. Em **Bulk Redirect Lists**, selecionar **Create Bulk Redirect List** e usar
   o nome `vdo_dominio_antigo`.
4. Importar `redirects.csv`, **sem linha de cabeçalho**. A linha contém, nesta
   ordem: origem, destino, status, preservar query, incluir subdomínios,
   corresponder subcaminhos, preservar sufixo do caminho.

   | Campo | Valor |
   | --- | --- |
   | Source URL | `volante-de-ouro.pages.dev/` |
   | Target URL | `https://volantedeouro.com/` |
   | Status | `301` |
   | Preserve query string | Ativado |
   | Include subdomains | Desativado |
   | Subpath matching | Ativado |
   | Preserve path suffix | Ativado |

   A origem sem esquema também cobre HTTP; o destino é sempre HTTPS.
5. Criar uma **Bulk Redirect Rule** usando essa lista. Abrir o editor de
   expressão e colar:

   ```text
   (http.host eq "volante-de-ouro.pages.dev" and http.request.full_uri in $vdo_dominio_antigo and not (http.request.uri.path in {"/recuperar-progresso" "/recuperar-progresso/" "/recuperar-progresso/index.html"}))
   ```

   Manter a chave da regra como `http.request.full_uri`. O objeto completo
   está em `regra-redirecionamento.json`. Não usar apenas o filtro padrão da
   lista: ele também redirecionaria a recuperação.
6. Antes da recuperação estar publicada, usar **Save as Draft**. Depois das
   verificações da etapa anterior, usar **Save and Deploy**.

Essa configuração não cria uma zona DNS para `pages.dev`, não associa Worker
ao domínio oficial e não muda a forma como o Pages serve o jogo no oficial.

## Verificação HTTP

Sem dependências, usando Node 18 ou posterior:

```sh
node testes/dominio.js
node testes/verificador-dominio.js
node testes/recuperacao-progresso.js
node testes/rodar.js
node ferramentas/verificar-dominio.js --baseline
```

Depois de publicar a recuperação e ativar a regra:

```sh
node ferramentas/verificar-dominio.js
```

O último comando só retorna sucesso quando as URLs antigas retornam **301**,
com `Location` exato, as oficiais continuam retornando **200**, e a recuperação
é servida nos dois domínios. O verificador não segue redirects das URLs do jogo:
isso permite verificar o 301 real sem confundi-lo com o 200 do destino.
Nas três variantes da recuperação, aceita apenas a canonicalização do Pages
dentro da mesma origem e das rotas autorizadas, exigindo a página de recuperação
no destino. Ele testa GET/HEAD,
`/carreira`, `/login`, caminhos aninhados, Unicode, parâmetros repetidos,
`+`, escapes `%xx` e o parâmetro `next`. `--baseline` apenas observa a situação
atual; seu sucesso não comprova que a migração esteja ativa.

A Cloudflare pode normalizar representações incomuns de caminhos, como `..`
ou escapes de caracteres não reservados. As flags preservam caminhos e parâmetros
normais; a verificação publicada também inclui Unicode codificado e escapes.

Uma requisição ao caminho `/login` atualmente recebe o fallback estático do
jogo, não um serviço de autenticação. Nenhuma configuração de cookies/OAuth
foi alterada. Se outro backend for adicionado, revisar os hosts de callbacks
e APIs antes de redirecioná-los: clientes podem converter POST em GET ao
seguir um 301.

## Reversão

Desabilitar somente a Bulk Redirect Rule **Volante de Ouro - dominio oficial e
recuperacao**, associada à lista `vdo_dominio_antigo`. Manter o domínio
oficial, os DNS e a página de recuperação. Não limpar nenhum `localStorage`.
Alguns clientes podem conservar o 301 em cache; a recuperação continua
disponível pela sua URL própria, que foi excluída da regra desde o início.

## Documentação usada

- [Pages: domínio pages.dev para domínio próprio](https://developers.cloudflare.com/pages/how-to/redirect-to-custom-domain/)
- [Limitações de _redirects](https://developers.cloudflare.com/pages/configuration/redirects/)
- [Formato do CSV](https://developers.cloudflare.com/rules/url-forwarding/bulk-redirects/reference/csv-file-format/)
- [Criar Bulk Redirects no painel](https://developers.cloudflare.com/rules/url-forwarding/bulk-redirects/create-dashboard/)
- [Campos aceitos nas expressões](https://developers.cloudflare.com/rules/url-forwarding/bulk-redirects/reference/fields-functions/)
- [Parâmetros de paths, query strings e status](https://developers.cloudflare.com/rules/url-forwarding/bulk-redirects/reference/parameters/)
- [localStorage é separado por origem](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
