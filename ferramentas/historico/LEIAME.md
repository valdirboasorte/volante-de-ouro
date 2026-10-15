# Banco histórico — como funciona

Gera `dados/historico.js`, o banco de campeonatos reais que o jogo carrega.
Nada aqui roda no site: são ferramentas de Node (22+) que precisam de rede só
para baixar o que ainda não está no cache, e de um Chrome instalado (a leitura
das tabelas roda num Chrome sem interface, pela biblioteca da skill de design;
o caminho pode ser trocado com a variável `TASTE_SKILL`).

## Passo a passo

```bash
node ferramentas/historico/importar.mjs todos            # baixa e lê as temporadas
node ferramentas/historico/descobrir.mjs pendentes       # acha páginas pelas categorias da Wikipedia
node ferramentas/historico/importar.mjs todos            # lê o que a descoberta achou
node ferramentas/historico/gerar.mjs                     # valida, junta pessoas e escreve o banco
```

Um campeonato ou um período só: `importar.mjs f3_brit,f3_alema 1980-1989`.
Para reler tudo do cache depois de mudar o leitor, sem nenhuma requisição:
`reler.mjs todos`.

## Arquivos

| Arquivo | O que faz |
|---|---|
| `catalogo.mjs` | Os campeonatos: período, nomes oficiais por época, país, região, nível, tipo, sucessor, artigo e o padrão do título das temporadas. Os anos vêm do que se sabe do campeonato; o importador confere temporada por temporada. |
| `importar.mjs` | Acha a página de cada temporada (padrão do catálogo → caixa de navegação do artigo → categoria "… seasons") e confere que é mesmo daquele campeonato e daquele ano: um redirecionamento para o artigo geral, ou para outro campeonato (a Fórmula Azzurra redireciona para a F3 Italiana), conta como sem página. |
| `analisar.js` | Lê a página no navegador: lista de inscritos (equipe, construtor, carro, motor, número, etapas — inclusive tabelas com vários pilotos por célula), calendário, classificação final e campeão. Não completa nada: o que a tabela não diz fica vazio. |
| `descobrir.mjs` | Lista as páginas das categorias "… seasons" da Wikipedia para os campeonatos cujos títulos não seguem padrão. Em categoria compartilhada (por exemplo "Formula Renault seasons"), só vale o título que tem o nome do campeonato. |
| `gerar.mjs` | Valida (campeão na lista, tamanho do grid, nacionalidades), junta a mesma pessoa lida de jeitos diferentes, dá a cada uma o nome que o jogo já usa e escreve o banco, o relatório e a auditoria. |
| `paises.mjs` | Nome do país na bandeira → código do jogo; países extintos guardam o nome histórico. |
| `corrigir-escalacoes.mjs` | Propõe (e com `--aplicar` aplica) correções nas escalações do jogo a partir da auditoria. Os casos ambíguos ficam numa lista para revisão manual. |
| `diff-escalacoes.mjs` | Lista o que mudou nas escalações desde um commit. |
| `RELATORIO.md` | Contagens, cobertura por campeonato, pendências, alertas, auditoria e os anos de teste. Gerado. |
| `CORRECOES-ESCALACOES.md` | As correções feitas nas escalações do jogo. |
| `auditoria.json`, `nomes-do-jogo.json` | A auditoria das escalações e como cada pessoa real foi ligada a um nome do jogo. Gerados. |
| `descobertas.json` | Ano → título achado pelas categorias. |
| `cache/`, `brutos/` | Páginas baixadas (comprimidas) e o que foi lido de cada uma. Fora do repositório; o importador refaz. |

## As regras que o banco segue

- **Fonte registrada em cada temporada:** a página e a revisão lidas. A janela
  Campeonatos do jogo leva direto à revisão.
- **Status, não suposição:** `L` lista de inscritos, `C` só a classificação
  final (parcial), `V` página sem tabela legível, `X` sem página. Temporada
  pendente tem o grid simulado no jogo, como antes; nenhum nome é inventado
  no lugar.
- **Verificado é outra coisa:** exigiria duas fontes independentes
  concordando. Por enquanto há uma, então o banco não marca nada como
  verificado.
- **Identidade:** a pessoa é a página dela na Wikipedia. Registros sem link,
  ou ligados a páginas diferentes, só se juntam quando o nome completo é o
  mesmo, o país é compatível e os anos são próximos (bandeiras diferentes só
  quando os dois correram o mesmo campeonato na mesma época). O que não dá para
  juntar com segurança fica separado, com o país entre parênteses no nome.
- **Nomes do jogo:** quem já existe no jogo (escalações da F1 e da Indy, listas
  de época de cada série, grids de base) mantém o nome que tinha, para os
  saves continuarem valendo. Sobrenome sozinho só casa se os anos baterem
  (Giuliano Alesi não vira o Jean).
- **Respeito à fonte:** só a API pública do MediaWiki, uma requisição por vez
  com pausa de 0,7 s, identificação no User-Agent e cache em disco para nunca
  pedir duas vezes a mesma página.

## Próximos passos possíveis

- Uma segunda fonte para conferir as temporadas (e só então marcá-las como
  verificadas). A Wikipedia em português cobre bem os campeonatos brasileiros
  que faltam na inglesa (Stock Car dos anos 90, Fórmula Ford Brasil).
- Kart e as F3 nacionais antigas quase não têm página por temporada na
  Wikipedia em inglês; ficam pendentes até haver fonte.
- As linhas que sobraram na auditoria são de equipes privadas que não existem
  nos dados do jogo; resolver exige criar essas equipes nas épocas certas.
