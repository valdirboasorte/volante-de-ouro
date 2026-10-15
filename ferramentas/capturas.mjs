/* Capturas das telas internas do jogo em estados reais, no Chrome headless.
   Uso: node ferramentas/capturas.mjs [url]   (padrão http://localhost:4321/)
   Saída: .taste-skill/telas/*.jpg  — usa o cliente CDP da skill design-taste-frontend. */
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const SKILL = process.env.TASTE_SKILL || 'C:/Users/Usuário/.claude/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const { Browser, sleep } = await import(pathToFileURL(SKILL).href);
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const SAIDA = join(RAIZ, '.taste-skill', 'telas');
mkdirSync(SAIDA, { recursive: true });
const URL0 = process.argv[2] || 'http://localhost:4321/';
const so = process.argv[3] ? new Set(process.argv[3].split(',')) : null;

/* cada cena prepara o estado pela própria API do jogo */
const CENAS = {
  ficha: `Abertura.ano = 1988; Abertura.comecar();`,
  hub: `S = null; UI.eraSel = ERAS.reduce((k,e,i)=>e.y<=2024?i:k,0); UI.year = 2024; UI.serie = 'f1'; UI.country = 'BR';
        UI.style = 'equilibrado'; UI.modo = 'classico'; UI.origem = 'media';
        el('inName').value = 'Senna'; el('inNum').value = '7'; el('inAge').value = '29'; el('chkFast').checked = true;
        Game.start(); UI.limparFila(); UI.close();
        for(let k = 0; k < 6; k++){ const r = Engine.runRace(S.season); Game.tally ? Game.tally(r) : 0; }
        UI.render(); UI.close();`,
  classif: `UI.tab('drv');`,
  resultado: `UI.raceResult(S.season.results[S.season.results.length - 1]);`,
  /* a corrida ao vivo: larga, espera o cálculo, e para no meio da prova */
  largada: `UI.close(); S.opts.fast = false; const rec = Engine.runRace(S.season); Game.tally(rec); UI.render();
            window.__rec = rec; UI.centralCorrida(rec, () => UI.raceResult(rec));`,
  corrida: `Central.t = Central.P.t * .42; Central.alternar(); Central.painel();`,
  bandeirada: `Central.alternar(); Central.t = Central.P.t; Central.alternar();`,
  resultadoTempos: `Central.pular();`,
  chefe: `Chefe.novo({ modo:'assumir', ano:2024, idx: eraOfSeries(2024,'f1').teams.findIndex((t,i)=>{ const r = Engine.resolveTeam(t,i,2024,'f1'); return r && r.name === 'Alpine'; }), chefe:{ nome:'Toto Wolff', cc:'AT' } });
          UI.show('chefe'); UIC.render(); UI.close();`,
  chefeLargada: `UI.close(); if(C.fase !== 'temporada') Chefe.comecarTemporada(); const rec = Chefe.correr(); UIC.render();
                 UI.centralCorrida(rec, () => { UIC.salvar(); UIC.resultado(rec); }, { chefe: true });`,
  chefeCorrida: `Central.t = Central.P.t * .6; Central.alternar(); Central.painel();`,
  chefeResultado: `Central.pular();`,
  mercado: `UI.close(); UIC.mercado();`,
  chefeNovo: `UI.close(); UIC.abrir();`
};
const ORDEM = ['ficha', 'hub', 'classif', 'resultado', 'largada', 'corrida', 'bandeirada', 'resultadoTempos', 'chefe', 'mercado', 'chefeLargada', 'chefeCorrida', 'chefeResultado', 'chefeNovo'];
const ESPERA = { largada: 2600, bandeirada: 900, chefeLargada: 2600 };

const b = await Browser.launch();
for(const [nome, w, h, mobile] of [['desktop', 1440, 900, false], ['celular', 390, 844, true]]){
  const p = await b.newPage({ width: w, height: h, mobile, dsf: mobile ? 2 : 1 });
  await p.goto(URL0, { settleMs: 1800 });
  for(const cena of ORDEM){
    try{ await p.eval(`(()=>{ ${CENAS[cena]} })()`); }catch(e){ console.log('  !', cena, e.message.slice(0, 200)); }
    await sleep(ESPERA[cena] || 700);
    if(so && !so.has(cena)) continue;
    const arq = join(SAIDA, `${nome}-${cena}.jpg`);
    await p.screenshot({ path: arq, quality: 70 });
    console.log(arq);
  }
  if(p.consoleErrors.length) console.log('erros no console:', p.consoleErrors.slice(0, 5));
  await p.close();
}
await b.close();
