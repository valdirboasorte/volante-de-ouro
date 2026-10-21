---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: []
---

# Surface: hub do modo chefe de equipe (index.html, #scr-chefe)

Mode: Operate. The team principal reads the state of the team and decides what to do before the next round.

Audience and task: a player running a team season by season, on desktop and on the phone. Most visits sit between two rounds and answer three things: how are we doing, what changed, and what must I decide before the next race.

Constraints:
- Only real game data and existing mechanics.
- Sidebar pages reuse the existing systems: calendar, drivers and market, staff, development and packages, facilities, finances, sponsors, regulations, the race weekend, standings, history and news.
- Saves, i18n text nodes and Node tests must keep working.
- Free Commons photos are credited on screen; a monogram is used where no free photo exists.

## Direction contract

THESIS: The hub is the team's pit wall between races. The season runs across it as a strip of every round, like a timing tower laid on its side, and the next round is the one place the eye lands. It refuses the generic dashboard of equal tiles and glowing gradients.

OWN-WORLD:
- Grounds: carbon ground #0b0c0e and sidebar #0f1113. The hub is one timing sheet with no boxes: blocks and list rows are separated by 1px hairlines (#24272d, #34383f under block titles). This was chosen by the owner on 2026-10-21 to remove the generic dashboard look.
- Colour roles: Archivo, tabular figures. Gold #f0c12e only for the selected nav item and the one primary action. The team colour marks what is ours (the hero, our rows, our cars). State colours only where they mean something.
- Pictures: real credited photographs of the team's actual car of that year and of its drivers.

STORY: The player sees their team, both drivers and where the season stands. They see the next round and what the sponsor and the board expect from it. Then they press one button to prepare the weekend; every other area is one click away in the sidebar.

FIRST VIEWPORT (1440x900):
- Left rail, 232px: the team identity, then twelve text-only nav items (the current one in gold text), then reputation and leave at the foot.
- Scoreboard line: the page title, then hairline-separated cells. On the overview these are constructors position, points, board target, cash and board confidence.
- Left two thirds: the hero. The year's car photo runs full bleed, with the team name in condensed caps and the chassis name. The two drivers sit as timing-tower rows in a carbon band at its foot.
- Right third: the next-round card. It holds the real circuit outline drawn from the game's geometry, the weather chance, the sponsor's round target and the board target, then the gold button "Preparar o fim de semana".
- Below, full width: the season strip.

FORM: User-pinned composition (the user's reference mockup), executed as a timing sheet (owner's choice, 2026-10-21), Operate mode. Signature move: the season strip of every round, with both cars' results and the next round marked. Each block title is the link to its area; there are no "→" footers, no nav icons, no gold pill and no hero stat trio. seed: none (unavailable)

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
