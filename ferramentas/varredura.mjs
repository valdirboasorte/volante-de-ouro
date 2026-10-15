/* Varredura visual: telas inteiras e janelas, no desktop e no celular, com as animações ligadas.
   Uso: node ferramentas/varredura.mjs [url]   (padrão http://localhost:4321/)
   Saída: .taste-skill/varredura/*.jpg — usa o cliente CDP da skill design-taste-frontend. */
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const SKILL = process.env.TASTE_SKILL || 'C:/Users/Usuário/.claude/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const { Browser, sleep } = await import(pathToFileURL(SKILL).href);
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const SAIDA = join(RAIZ, '.taste-skill', 'varredura');
mkdirSync(SAIDA, { recursive: true });
const URL0 = process.argv[2] || 'http://localhost:4321/';
const so = process.argv[3] ? new Set(process.argv[3].split(',')) : null;

const carreira = `S = null; UI.eraSel = ERAS.reduce((k,e,i)=>e.y<=2024?i:k,0); UI.year = 2024; UI.serie = 'f1'; UI.country = 'BR';
  UI.style = 'equilibrado'; UI.modo = 'classico'; UI.origem = 'media';
  el('inName').value = 'Senna'; el('inNum').value = '12'; el('inAge').value = '29'; el('chkFast').checked = true;
  Game.start(); UI.limparFila(); UI.close();
  for(let k = 0; k < 5; k++){ const r = Engine.runRace(S.season); Game.tally(r); } UI.render(); UI.close();`;
/* [nome, código, página inteira?] */
const CENAS = [
  ['abertura', `UI.show('intro')`, true],
  ['ficha', `UI.show('intro'); Abertura.comecar()`, true],
  ['hub', carreira, true],
  ['treino', `UI.treinoModal && UI.treinoModal()`, false],
  ['resultado', `UI.raceResult(S.season.results[S.season.results.length - 1])`, false],
  ['arquivo', `UI.close(); UI.archive()`, false],
  ['lendas', `UI.close(); UI.hall()`, false],
  ['recordes', `UI.close(); UI.records()`, false],
  ['ajuda', `UI.close(); UI.help()`, false],
  ['carreiras', `UI.close(); UI.seriesInfo()`, false],
  ['assumir', `UI.close(); UI.takeOver()`, false],
  ['cenarios', `UI.close(); UI.scenarios()`, false],
  ['creditos', `UI.close(); Abertura.creditos()`, false],
  ['chefeNovo', `UI.close(); UIC.abrir()`, true],
  ['chefe', `UI.close(); Chefe.novo({ modo:'assumir', ano:2024, idx: eraOfSeries(2024,'f1').teams.findIndex((t,i)=>{ const r = Engine.resolveTeam(t,i,2024,'f1'); return r && r.name === 'Alpine'; }), chefe:{ nome:'Toto Wolff', cc:'AT' } }); UI.show('chefe'); UIC.render(); UI.close();`, true],
  ['mercado', `UIC.mercado()`, false]
];

const b = await Browser.launch();
for(const [nome, w, h, mobile] of [['desktop', 1440, 900, false], ['celular', 390, 844, true]]){
  const p = await b.newPage({ width: w, height: h, mobile, dsf: 1 });
  await p.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await p.goto(URL0, { settleMs: 2000 });
  for(const [cena, cod, inteira] of CENAS){
    try{ await p.eval(`(()=>{ ${cod} })()`); }catch(e){ console.log('  !', nome, cena, e.message.slice(0, 220)); }
    await sleep(inteira ? 1500 : 800);
    if(inteira){ await p.eval(`(async () => { for(let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * .7){ scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } scrollTo(0, 0); })()`); await sleep(900); }
    if(so && !so.has(cena)) continue;
    const arq = join(SAIDA, `${nome}-${cena}.jpg`);
    await p.screenshot({ path: arq, quality: 62, fullPage: inteira });
    console.log(arq);
  }
  if(p.consoleErrors.length) console.log('erros no console:', p.consoleErrors.slice(0, 6));
  await p.close();
}
await b.close();
