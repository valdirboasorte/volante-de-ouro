# SEO e infraestrutura pública

## Escopo desta atualização

O site continua estático, publicado a partir da raiz do repositório, sem comando
de build, framework, Functions ou Worker. Não há mudança na simulação nem nas
chaves dos saves. Nenhuma configuração de painel ou DNS foi alterada nesta
atualização local. Publicação e validação do conteúdo novo em produção ainda
dependem de um deploy autorizado.

### Arquivos no repositório

- `robots.txt`: permite rastrear o conteúdo e os recursos; indica o sitemap do
  domínio oficial. Não serve como controle de acesso nem bloqueia a leitura de
  diretivas `noindex`.
- `sitemap.xml`: lista apenas `https://volantedeouro.com/`, a página pública
  canônica real. Menus, carreiras, doação e roadmap são telas/seções da mesma
  aplicação, não páginas independentes para inventar URLs no sitemap.
  Não há `lastmod`: não existe fonte confiável de data de modificação editorial.
- `_headers`: aplica cabeçalhos aos arquivos estáticos do Cloudflare Pages.
  HTML, JavaScript, dados e ícones possuem nomes estáveis e são revalidados
  (`public, max-age=0, must-revalidate`). Não há cache `immutable`, CSP que
  bloqueie scripts inline, nem mudanças na política de acesso ao armazenamento.
  `X-Content-Type-Options`, `Referrer-Policy` e `X-Frame-Options: SAMEORIGIN`
  são definidos sem interferir em scripts, fontes e imagens externos.
- `vercel.json`: aplica os mesmos cabeçalhos de revalidação e segurança na
  hospedagem alternativa e acrescenta `X-Robots-Tag: noindex`. A Vercel mantém
  acesso normal ao jogo e aos dados locais; não há novo redirecionamento.
  Este arquivo não configura o Cloudflare Pages.

No Cloudflare, as regras por hostname de `_headers` marcam endereços
`pages.dev` e previews como `noindex`, sem atingir o domínio oficial.
Recuperação e arquivos de infraestrutura/teste também recebem `noindex`.
Esses cabeçalhos não substituem a política canônica do HTML e não são
proteção contra acesso a arquivos públicos. Em uma futura publicação com
diretório de saída separado, ferramentas e testes poderão ficar fora do pacote
público, preservando as rotas e os recursos necessários.

## Redirecionamento e saves: preservar a configuração existente

O redirecionamento de `volante-de-ouro.pages.dev` **já existe**, apesar de ser
descrito como objetivo futuro em alguns pedidos. A regra de conta usa Bulk
Redirects e foi previamente autorizada com exceções exatas para:

- `/recuperar-progresso`
- `/recuperar-progresso/`
- `/recuperar-progresso/index.html`

Esta atualização não cria `_redirects` nem modifica o CSV, o JSON ou a regra
implantada. O procedimento e a expressão estão em [README.md](README.md).

O arquivo `_redirects` aceita caminhos de origem, não condições por hostname.
Adicionar uma regra global para o domínio oficial afetaria também o próprio
domínio oficial do mesmo projeto. `_headers`, por outro lado, aceita padrões
HTTPS com hostname, conforme a documentação da Cloudflare.

O `localStorage` pertence a cada origem. Cabeçalhos, canonical e redirects não
copiam dados entre domínios. A recuperação antiga precisa continuar acessível.
Não limpar dados do navegador nem revogar essa exceção.

Na Vercel, o jogo continua acessível e a página `recuperar-progresso/` permite
exportar o backup integral das nove chaves do jogo. São aceitas apenas as
origens HTTPS exatas do oficial, do Pages antigo e da Vercel alternativa.
A importação permanece exclusiva do domínio oficial, com prévia, validação,
preservação de conflitos por padrão e backup obrigatório antes de substituí-los.
Depois do deploy, usar o mesmo navegador/perfil do endereço antigo para exportar
e abrir a recuperação no oficial para importar. Nenhum arquivo é enviado a
servidores e não há transferência automática entre origens.

## Observação pública antes das mudanças locais

Consulta HTTP GET em 20/10/2026, com redirects desativados:

| URL | Estado observado |
| --- | --- |
| `https://volantedeouro.com/` | 200, HTML, Brotli, `max-age=0, must-revalidate`; sem canonical no HTML observado |
| `https://volantedeouro.com/robots.txt` | 200, mas HTML do jogo pelo fallback da SPA, não robots válido |
| `https://volantedeouro.com/sitemap.xml` | 200, mas HTML do jogo pelo fallback da SPA, não XML válido |
| `https://volante-de-ouro.pages.dev/` | 301 para `https://volantedeouro.com/` |
| `https://volante-de-ouro.pages.dev/recuperar-progresso/` | 200, página correta com marcador `vdo-progress-recovery` |
| `https://volante-de-ouro.vercel.app/` | 200, HTML, Brotli, sem canonical ou `X-Robots-Tag` observado |

Esses resultados são o estado anterior, não comprovação do deploy das mudanças.
O 200 de uma SPA não comprova que um arquivo exista: verificar também o tipo
de conteúdo e o corpo da resposta. Não foi necessário alterar compressão:
ela já era oferecida pela infraestrutura.

## Verificação após publicação autorizada

1. Confirmar no Pages que o domínio personalizado permanece ativo, com HTTPS,
   raiz do projeto e diretório de saída `.`, sem novo comando de build.
2. Solicitar `/robots.txt` e `/sitemap.xml` no oficial: exigir 200, conteúdo
   correto, tipos textuais apropriados e ausência de fallback HTML.
3. Verificar no HTML recebido a URL canônica oficial, os metadados e o JSON-LD.
4. Verificar `Cache-Control` e cabeçalhos de segurança. O domínio oficial não
   deve receber `X-Robots-Tag: noindex`.
5. Executar `node ferramentas/verificar-dominio.js` para o redirect e as três
   variantes de recuperação. Não seguir silenciosamente o redirect e confundir
   um 200 final com o 301 de origem.
6. Na Vercel, confirmar 200 no jogo, `X-Robots-Tag: noindex`, canonical oficial
   no HTML e funcionamento do exportador. Publicar na Cloudflare não comprova
   que o projeto alternativo Vercel recebeu o mesmo commit.
7. Conferir eventuais Cache Rules ou Transform Rules personalizadas no painel.
   Regras externas podem alterar os cabeçalhos definidos no repositório. Não
   criar uma política genérica de "Cache Everything" com TTL longo para o jogo.

O Pages fornece ETag e compressão Gzip/Brotli automaticamente. A revalidação
permite reutilização por 304 sem prender arquivos mutáveis em cache. Uma
política de longa duração exigiria versionamento dos nomes e validação do
conjunto HTML/scripts; não foi introduzida nesta atualização.

## Google Search Console: configuração manual

Não foi gerado token nem declarada propriedade verificada.

1. Acessar o Search Console com a conta responsável e adicionar uma propriedade
   do tipo **Domínio**, informando `volantedeouro.com` sem esquema ou caminho.
2. Copiar o valor TXT fornecido pelo Google. No Cloudflare, abrir a zona
   `volantedeouro.com` → DNS → Records → Add record. Selecionar TXT, nome `@`,
   conteúdo exatamente como fornecido, TTL automático. Preservar os demais
   registros e tokens existentes. Não há opção de proxy para TXT.
3. Voltar ao Search Console e verificar após a propagação DNS. Manter esse TXT
   para que a propriedade continue validada. Não inventar um valor de exemplo.
4. Depois do deploy, abrir **Sitemaps** e enviar
   `https://volantedeouro.com/sitemap.xml`. Conferir a leitura sem erros.
5. Em **Inspeção de URL**, inspecionar a raiz oficial, executar o teste ao vivo
   e solicitar indexação quando elegível.
6. Acompanhar **Indexação de páginas**, **Sitemaps**, **Desempenho** e os
   relatórios de experiência disponíveis. Comparar canonical declarada e a
   escolhida pelo Google. Indexação e posição não são garantidas pelo sitemap.

Não é necessário mexer no domínio antigo nem na implantação alternativa para
concluir a verificação DNS do domínio oficial.

## Fontes oficiais consultadas

- [Cloudflare Pages: headers e padrões por hostname](https://developers.cloudflare.com/pages/configuration/headers/)
- [Cloudflare Pages: redirects e formato de origem](https://developers.cloudflare.com/pages/configuration/redirects/)
- [Cloudflare Pages: respostas, fallback, cache e compressão](https://developers.cloudflare.com/pages/configuration/serving-pages/)
- [Vercel: configuração estática e cabeçalhos](https://vercel.com/docs/project-configuration/vercel-json)
- [Google: robots.txt](https://developers.google.com/crawling/docs/robots-txt/create-robots-txt)
- [Google: sitemap e URLs canônicas](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google: canonicalização](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google: X-Robots-Tag](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)
- [Search Console: verificar propriedade](https://support.google.com/webmasters/answer/9008080)
- [Search Console: relatório de sitemaps](https://support.google.com/webmasters/answer/7451001)
