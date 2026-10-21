# Validação da prévia Cloudflare

Executada em 20/10/2026 (America/Sao_Paulo). **Somente a prévia foi publicada.**

- URL final: <https://cd749057.volante-de-ouro.pages.dev/>.
- Branch: `preview/seo-roadmap-20261020`.
- Commit da prévia: `7bb70bc3efd5783daa21f2ee568d440226e85228`.
- Produção e `main`: `8fc8fe9a6c23fb32d1b84b55e173f5058372b124`.
- Nenhum merge, promoção de deploy, alteração de domínio, DNS ou regra de redirect.

## Implementado e testado

- A prévia final passou **566/566 verificações HTTP**, com 56 URLs consultadas
  por GET, sem seguir redirects. Os 56 arquivos conferidos correspondem aos
  arquivos locais por SHA-256, normalizando apenas as quebras de linha textuais.
- HTML, canonical oficial, metadados sociais, JSON-LD, scripts, robots, sitemap,
  manifest, favicons, ícones e imagem social foram servidos corretamente.
- Headers de revalidação e segurança presentes; prévia com `noindex`.
- No navegador: início, roadmap, menu móvel, apoio por Pix e criação de piloto
  e chefe abriram. Roadmap testado em PT, EN, ES e JP.
- Piloto descartável `QA Preview`: corrida concluída em 9º, 7 pontos. Após
  salvar, recarregar e continuar, a mesma carreira e o resultado permaneceram.
- Chefe descartável `QA Chefe`: equipe criada, temporada iniciada, Q1/Q2/Q3,
  grid, pneus e corrida completos. Após sair, recarregar e continuar, os
  resultados (Hamilton 11º, Rosberg 2º, 18 pontos) permaneceram.
- Esses percursos de carreira foram executados na primeira prévia `e0fa39ff`.
  Depois, somente a margem do roadmap e o rodapé responsivo foram corrigidos;
  o código de jogo não mudou. A prévia final teve seus arquivos comparados e
  sua interface inspecionada novamente.
- Dimensões verificadas: 390×844, 768×1024 e 1440×900. Também foi observada a
  largura padrão de 1280 px. Menu e link do roadmap ativados por Enter; foco
  transferido ao roadmap e menu fechado. Temas claro e escuro conferidos.
- Nenhum erro ou aviso nos logs capturados do navegador nos percursos testados.
- Teste local de presença web repetido após as correções: **406 verificações**.
- O oficial respondeu 200 e seu HTML correspondeu exatamente ao HTML anterior
  da `main`; não contém o novo roadmap e não recebeu `noindex`.

## Correções encontradas durante a prévia

1. A seção usava `ini-secao`, classe inexistente. Passou a usar `ini-sec`,
   recebendo a mesma largura e margens das demais seções públicas.
2. O novo link do rodapé comprimia o texto central no tablet. O rodapé agora
   adota uma coluna até 1120 px, mantendo texto e links legíveis.

Foi observado um excedente lateral de 2 px no celular causado pelas margens
negativas de `.ini-item` no CSS antigo. Não vem do roadmap; não foi alterado
neste trabalho para preservar o escopo. Não impediu os percursos testados.

## Limites e próximos passos

- Instalação PWA em aparelho físico e métricas de campo LCP/INP/CLS não medidas.
- A recuperação recusa origens de prévia intencionalmente. Não foi liberada
  nem usada para importar dados de jogadores. Seus testes locais anteriores
  passaram em 263 verificações; repetir nas origens autorizadas após produção.
- A imagem social foi testada pelo caminho da prévia; sua URL absoluta oficial
  só conterá o arquivo novo depois da publicação no oficial.
- Vercel não atualizada nesta etapa. Publicar no Cloudflare não valida os
  headers da implantação alternativa.
- Autorizar separadamente a publicação na `main`/domínio oficial, então conferir
  os mesmos arquivos e percursos nesse ambiente. Não há garantia de risco zero.

## Evidências

- [Relatório HTTP final](validacao-previa-http.json).
- [Produção preservada](validacao-producao-preservada.json).
- [Roadmap em celular](previa-roadmap-celular.jpg).
- [Rodapé em tablet](previa-rodape-tablet.jpg).

Repetir as verificações sem dependências:

```sh
node ferramentas/verificar-previa.js https://cd749057.volante-de-ouro.pages.dev/
node testes/presenca-web.js
```
