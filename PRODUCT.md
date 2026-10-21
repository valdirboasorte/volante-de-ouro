# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Brazilian motorsport fans (Portuguese first; English, Spanish and Japanese supported) playing a career simulator in the browser, on desktop and on the phone. Two jobs:

- **Driver career:** guide a driver from karting to the top category.
- **Team principal career (modo chefe):** run a team season after season. This means hiring drivers and engineers, developing the car, managing money, sponsors and the board, and calling the race from the pit wall.

## Product Purpose

Volante de Ouro is a free career simulator for motorsport from 1950 to 2026 and beyond, across seven series: F1, IndyCar, NASCAR, WEC, Formula E, DTM and Stock Car Brasil.

Success means the player feels the real history behind every season and makes decisions that visibly change results. Those decisions include strategy, development, contracts and race calls.

## Positioning

The game is built on a historical database of 122 real championships, with real grids, calendars, points systems and regulations per year. On top of it run:

- a live 2D race the player commands from the pit wall;
- a persistent world of drivers that continues after the last documented year.

Before 2027 nothing contradicts documented history. The player's own team is the exception, along with whatever the player changes.

## Operating Context

The game runs as one static `index.html` (vanilla JS, no framework or build step) plus data and asset files. It is served as a static site and works offline.

Saves live in the browser's localStorage:

- `vdo_save` holds the driver career; `vdo_chefe` holds the team principal career.
- A backup/import page lives at `recuperar-progresso/`.

Tests run in Node against a fake DOM (`node testes/rodar.js`).

## Capabilities and Constraints

- **No frameworks.** The game stays a single HTML file with inline JS and CSS.
- **Saves must keep working.** The chefe save is versioned (`Chefe.V`, `Chefe.migrar`). Every new field needs a migration and a test.
- **Translation.** The i18n runtime translates rendered text nodes. Keep each sentence in one text node, and mark names with `data-i18n-ignore`.
- **No invented history.** Real data is never marked "verified". Free images are credited.
- **Publishing.** Nothing is pushed or deployed without the owner's explicit approval.
- **Donations.** The donation page uses only the owner-supplied Pix data. Nothing about payments is invented.
- **Real mechanics only.** Interfaces must show existing mechanics and real game data. Never show a panel for a feature that does not exist.
- **Live race.** The race engine (`Gp`) is shared by both modes. Chefe-only mechanics are gated by `ent.gestao`.

## Brand Commitments

- The name is Volante de Ouro.
- The visual chosen and published is carbon, red and gold. The type is Archivo. The user rejected glass. The live race stays dark, like a TV broadcast.
- Real photographs come from free licences (Wikimedia Commons and similar) and are credited on screen. Where no free photo exists, a monogram in the team colour is used instead. No AI-generated faces or liveries.
- For the team principal hub, the user's reference is a sidebar-navigated management screen with these parts: team hero with a car photo, driver cards, a next-round card holding the main action, car performance, finances, constructors table, staff, facilities and messages. It must not look AI-made.

## Evidence on Hand

- `dados/historico.js` holds grids, calendars, regulations and results. `dados/vencedores.js` holds race winners. `dados/escalacoes.js` holds round-by-round F1 and IndyCar lineups and car counts.
- `assets/eras/` and `assets/cartoes/` hold credited motorsport photos. Their credits are in `assets/credits.json` and `assets/apoio/credits.json`. `assets/apoio/` holds the donation page photos.
- `assets/logos/` holds series logos only. There are no team crests or driver portraits in the project.
- `assets/doacao.js` holds the owner's Pix configuration.

## Product Principles

1. History first: real seasons are the stage, and the player's choices are the only deviation.
2. Every screen must lead to a decision that changes the next result.
3. Honest data: show what the game knows, in ranges where it is uncertain, and never decorate with fake numbers.
4. Old saves keep playing.
5. Plays well on the phone as well as the desktop.

## Accessibility & Inclusion

- Portuguese, English, Spanish and Japanese.
- Animations follow the game's own motion switch and the reduced-motion setting.
- Text is never conveyed only by colour, for example tyre compounds carry letters.
