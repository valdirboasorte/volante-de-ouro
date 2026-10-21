# Presença web do Volante de Ouro

Implementação local de 20/10/2026. Sem publicação, alteração de DNS ou mudança
do motor da simulação. Os valores do Pix e o QR Code original não foram alterados.

## Resultado e evidências

| Item | Situação | Evidência e limite |
| --- | --- | --- |
| Metadados, canonical, OG e Twitter | Implementado e testado | HTML estático e teste de campos únicos/URLs absolutas; validação do HTML novo em produção depende do deploy |
| JSON-LD WebSite e VideoGame | Implementado e testado | JSON válido; Schema.org Validator: **0 erros e 0 avisos**, com o código público novo |
| robots e sitemap | Implementado e testado | Sitemap XML com namespace e uma URL canônica real; nenhuma data de modificação estimada |
| Ícones e imagem de compartilhamento | Implementado e testado | Dimensões e conteúdo binário PNG/ICO conferidos; imagem OG original de 1200×630 |
| Roadmap público | Implementado e testado | HTML inicial, link real por âncora, sete sistemas disponíveis e três planos sem prazo; navegação e traduções testadas em VM, com bloqueio durante corridas e decisões pendentes |
| Visual móvel e teclado no navegador | Implementado, aguardando validação | CSS responsivo, menu recolhido até 1120 px, foco e navegação testados por estados; falta inspeção visual da versão local em navegador |
| Saves antigos | Implementado e testado | Recuperação com 263 verificações, incluindo Vercel, conflitos, backup, rollback e reabertura de carreiras reais |
| Cloudflare Pages | Implementado, aguardando validação | `_headers` local; a regra 301 publicada e suas exceções foram verificadas em 22 consultas HTTP e não foram alteradas |
| Vercel alternativa | Implementado, aguardando validação | `vercel.json` sem redirects/rewrite, com noindex; confirmação dos headers depende de publicação nesse provedor |
| Manifest e instalação | Implementado e testado | Caminhos, formatos e identidade estável conferidos; instalação em aparelho continua aguardando teste manual |
| Offline | Não introduzido | O projeto tinha manifest, mas não service worker; não se anuncia funcionamento offline |
| Performance | Implementado, aguardando validação | Recursos novos defer, nenhuma biblioteca, hero prioritária preservada, imagem oculta com lazy loading, listener passivo; métricas de campo não medidas |
| Search Console | Pendente de configuração manual | Precisa da conta responsável e do TXT fornecido pelo Google |

## Arquivos criados

- `robots.txt`, `sitemap.xml`, `_headers`.
- `favicon.svg`, `favicon.ico`, `favicon-32x32.png`, `apple-touch-icon.png`.
- `assets/brand/icon-192.png`, `icon-512.png`, `icon-maskable-512.png`,
  `icon-maskable.svg`, `og-volante-de-ouro.png` e sua fonte SVG editável.
- `assets/presenca-web.css`, `assets/presenca-web.js`.
- `assets/i18n/presenca.js`.
- `testes/presenca-web.js`.
- `infra/cloudflare/seo-infraestrutura.md` e este relatório.
- `docs/validacao-schema.jpg`: captura da validação pública sem erros ou avisos.

## Arquivos modificados

- `index.html`: metadados, JSON-LD, ícones, landmark principal, atalho de teclado,
  apresentação estática, roadmap, links, rótulos associados nos formulários de
  criação, mensagens anunciáveis e carregamento dos novos recursos.
- `assets/i18n/runtime.js`: título PT atualizado e tradução dos metadados Twitter
  e descrições das imagens sociais, além dos campos já suportados.
- `manifest.json`: ícones reais, descrição, cores e identidade estável.
- `recuperar-progresso/index.html`: Vercel autorizada para exportar, mantendo a
  importação exclusiva do domínio oficial.
- `vercel.json`: cabeçalhos limitados à implantação alternativa.
- `testes/base.js`, `testes/idiomas.js`, `testes/rodar.js` e
  `testes/recuperacao-progresso.js`: carregamento do catálogo e regressões.
- `testes/eventos.js` e `testes/chefe-decisoes.js`: amostras reproduzíveis,
  sem alteração das probabilidades de produção. O efeito do embalo é comparado
  com o mesmo acaso em cada par, separando seu efeito da variação de uma corrida.
- `README.md` e `infra/cloudflare/README.md`: documentação preservada e ampliada.

## SEO e indexação

O documento inicial é PT-BR e contém conteúdo útil sem JavaScript. O seletor
muda a apresentação para inglês, espanhol ou japonês; não há URLs distintas
por idioma, portanto não foram criados hreflang ou páginas artificiais.

O sitemap inclui somente `https://volantedeouro.com/`. Roadmap e apoio são
estados/âncoras da mesma página. Saves, resultados pessoais e dados de jogadores
não aparecem no HTML público nem nos dados estruturados.

O JSON-LD declara somente o jogo gratuito de navegador, seus idiomas e gênero.
Não declara organização, avaliação, número de jogadores, prêmio ou lançamento.
Ser válido no Schema.org não garante um resultado enriquecido no Google.

## Domínios e proteção do progresso

O Pages antigo **já** possui 301 no nível da conta Cloudflare. A atualização não
cria outro redirect e mantém a exceção `/recuperar-progresso/` e suas variantes.
Não há Worker, backend, cookies de autenticação ou migração automática.

O backup integral usa somente nove chaves autorizadas. A origem HTTPS exata da
Vercel foi acrescentada para exportação; outras origens, previews e variantes
maliciosas continuam recusadas. A importação mantém prévia, preservação de
conflitos, backup antes de substituição e tratamento de falha de armazenamento.

O funcionamento da página de doação, a chave Pix e o QR original permanecem
iguais. Só o carregamento tardio de uma foto da página de apoio foi ajustado.

## Roadmap e identidade

Foi mantida a direção já existente: Archivo, carbono e dourado, com painéis
de superfícies preenchidas. O desenho é uma seção do site atual, sem nova
linguagem de marca, biblioteca ou tema. O estado disponível traz provas por
função; os três planos descrevem intenção, sem fingir desenvolvimento ativo.

Os ícones reutilizam o xadrez do favicon original. A arte de compartilhamento
é vetorial/tipográfica original, rasterizada em PNG; não contém fotos ou marcas
de terceiros. As fontes editáveis permanecem junto dos arquivos finais.

Os rótulos novos do roadmap têm contraste calculado de 10,68:1 (dourado) e
7,93:1 (verde) sobre carbono; no tema claro, os tons locais atingem 6,03:1 e
5,95:1 sobre branco. Isso não substitui uma auditoria visual de todo o jogo.
O lint do skill aplicado aos dois novos arquivos de interface passou sem
falhas nem avisos; o inspector de navegador não foi executado devido ao bloqueio
descrito abaixo. [Captura do Schema.org](validacao-schema.jpg).

## Limites de validação

A suíte completa executou seus **47 grupos com sucesso**. Após a revisão final,
os testes focados passaram novamente: **406** verificações de presença
web/SEO/ativos/navegação e **64.234** de idiomas. A recuperação passou com
**263** verificações. Também foram conferidos os seis scripts inline, os novos
scripts e a existência dos recursos locais referenciados pelo HTML.

A navegação do roadmap não fecha modais nem limpa decisões. Enquanto houver
corrida, modal, escolha enfileirada ou continuação de simulação pendente, ela
apenas avisa o jogador; as referências da fila, do callback e dos dados da
carreira permanecem intactas nos testes de regressão.

O navegador integrado disponível não oferece o preview local utilizado pelo
inspector de design nesta sessão. Não foi usado outro navegador ou servidor
para contornar a restrição anterior de acesso a arquivos locais. Assim, não
se afirma inspeção visual em 390/768/1440 px, ausência de erros no console do
navegador novo, medição de Core Web Vitals ou instalação em celular.

Os testes do jogo usam seu harness Node/VM, e o JSON-LD foi validado no site
Schema.org. A produção observada ainda é a versão anterior: robots e sitemap
recebiam HTML de fallback com status 200. Isso está registrado no documento de
infraestrutura, sem confundir disponibilidade antiga com publicação nova.

## Pendências manuais após publicação

1. Publicar esta versão e conferir os arquivos efetivos no Cloudflare Pages.
2. Conferir `_headers`, tipos de conteúdo e ausência de noindex no oficial.
3. Publicar/conferir a Vercel separadamente, mantendo o acesso e o noindex.
4. Testar inicial, piloto, chefe, roadmap, doações e recuperação no navegador;
   repetir em celular e com JavaScript desabilitado para o conteúdo público.
5. Cadastrar a propriedade de domínio no Search Console, adicionar seu TXT DNS,
   enviar o sitemap e solicitar inspeção/indexação da raiz oficial.
6. Medir LCP/INP/CLS e conferir instalação PWA em aparelho antes de prometer
   melhoria numérica de performance ou comportamento offline.

O passo a passo do Search Console e as fontes oficiais estão em
[`../infra/cloudflare/seo-infraestrutura.md`](../infra/cloudflare/seo-infraestrutura.md).

## Recomendações futuras

- Depois de publicar, medir o comportamento em aparelhos e redes reais antes
  de definir metas numéricas de Core Web Vitals.
- Versionar os nomes dos recursos antes de considerar cache de longa duração.
- Manter a recuperação antiga acessível e testar exportação/importação a cada
  mudança futura no formato de save.
- Definir autenticação e conflitos de sincronização antes de desenvolver saves
  na nuvem; esta atualização não acrescenta contas nem backend.
