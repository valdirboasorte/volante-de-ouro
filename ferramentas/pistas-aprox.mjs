/* ═════════════════════════════════════════════════════════════════
   TRAÇADOS APROXIMADOS (circuitos que o OpenStreetMap não tem como pista)
   Circuitos de estrada fechada, aeródromos e ovais que já não existem ou nunca
   foram mapeados como pista de corrida. Em vez do desenho genérico do jogo:
   - estrada: a linha passa pelas coordenadas reais dos lugares por onde a prova
     passava (cidades, vilas, curvas famosas), na ordem da volta;
   - oval: a forma do oval (círculo, oval de milha, oval em D) no comprimento oficial;
   - aeródromo: a reta da pista de pouso e a volta pela pista de táxi.
   Tudo é escalado para o comprimento oficial pelo jogo (Pista.construir).
   O jogo mostra esses traçados como "aproximados".
   Uso: node ferramentas/pistas-aprox.mjs   (grava dados/tracados-aprox.js) */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const R0 = 6371008.8;

/* lat/lon → metros (x leste, y norte), em volta do centro */
function geo(lista){
  const lat0 = lista.reduce((a, p) => a + p[0], 0) / lista.length, lon0 = lista.reduce((a, p) => a + p[1], 0) / lista.length;
  const c = Math.cos(lat0 * Math.PI / 180);
  return lista.map(([la, lo]) => [(lo - lon0) * Math.PI / 180 * R0 * c, (la - lat0) * Math.PI / 180 * R0]);
}
/* oval de retas e curvas iguais: reta = fração do comprimento nas retas */
function oval(L, reta, n = 48){
  const r = L * (1 - reta) / (2 * Math.PI), s = L * reta / 2, pts = [];
  for(let i = 0; i < n; i++){
    const t = i / n;
    if(t < .25){ const a = -Math.PI / 2 + t * 4 * Math.PI; pts.push([s / 2 + r * Math.cos(a), r * Math.sin(a)]); }
    else if(t < .5){ const u = (t - .25) * 4; pts.push([s / 2 - u * s, r]); }
    else if(t < .75){ const a = Math.PI / 2 + (t - .5) * 4 * Math.PI; pts.push([-s / 2 + r * Math.cos(a), r * Math.sin(a)]); }
    else { const u = (t - .75) * 4; pts.push([-s / 2 + u * s, -r]); }
  }
  return pts;
}
/* oval em D (Michigan, Texas World): a reta dos boxes levemente curva */
function ovalD(L){
  return oval(L, .36, 56).map(([x, y]) => [x, y < 0 ? y * .72 - Math.abs(x) * .05 : y]);
}
/* aeródromo: reta da pista de pouso, retorno pela pista de táxi com duas chicanes */
function aerodromo(L){
  const c = L * .42, d = L * .06;
  return [[0, 0], [c * .5, 0], [c, 0], [c + d * .4, d * .3], [c, d], [c * .7, d], [c * .62, d * 1.6], [c * .55, d],
          [c * .3, d], [c * .22, d * .4], [c * .15, d], [0, d], [-d * .4, d * .5]];
}
/* um longo grampo de autoestrada: duas pistas paralelas, a curva inclinada e o grampo */
function grampo(a, b, sep){
  const [la1, lo1] = a, [la2, lo2] = b, out = [];
  const m = geo([a, b]), dx = m[1][0] - m[0][0], dy = m[1][1] - m[0][1], Lh = Math.hypot(dx, dy), nx = -dy / Lh * sep, ny = dx / Lh * sep;
  for(let i = 0; i <= 10; i++){ const t = i / 10; out.push([m[0][0] + dx * t + nx, m[0][1] + dy * t + ny]); }
  out.push([m[1][0] + dx / Lh * sep * 1.2, m[1][1] + dy / Lh * sep * 1.2]);
  for(let i = 10; i >= 0; i--){ const t = i / 10; out.push([m[0][0] + dx * t - nx, m[0][1] + dy * t - ny]); }
  out.push([m[0][0] - dx / Lh * sep * 2.5, m[0][1] - dy / Lh * sep * 2.5]);
  return out;
}

const PISTAS = {
  /* ── estradas fechadas, pelos lugares por onde a volta passava ── */
  fr_rei: { nome: 'Reims-Gueux', comp: 8302, tipo: 'estrada', sentido: 'hor',
    nota: 'triângulo Thillois – Gueux – Muizon, pelas estradas D27, D26 e N31',
    pts: geo([[49.2560, 3.9600], [49.2546, 3.9306], [49.2528, 3.9150], [49.2560, 3.9020], [49.2700, 3.8905], [49.2668, 3.9110], [49.2600, 3.9420]]) },
  it_pes: { nome: 'Circuito di Pescara', comp: 25579, tipo: 'estrada', sentido: 'anti',
    nota: 'Pescara – Spoltore – Cappelle sul Tavo – Montesilvano, e a reta da costa de volta a Pescara',
    pts: geo([[42.4680, 14.2150], [42.4450, 14.1900], [42.4440, 14.1600], [42.4560, 14.1380], [42.4660, 14.1060], [42.4900, 14.1250], [42.5130, 14.1480], [42.4900, 14.1830]]) },
  it_tar: { nome: 'Piccolo Circuito delle Madonie', comp: 72000, tipo: 'estrada', sentido: 'anti',
    nota: 'Cerda – Caltavuturo – Scillato – Collesano – Campofelice – a reta de Buonfornello',
    pts: geo([[37.9045, 13.8155], [37.8600, 13.8500], [37.8196, 13.8913], [37.8569, 13.9078], [37.8900, 13.9600], [37.9180, 13.9890], [37.9700, 13.9300], [38.0050, 13.8790], [37.9960, 13.8300], [37.9500, 13.8100]]) },
  it_mil: { nome: 'Mille Miglia (Brescia – Roma – Brescia)', comp: 1597000, tipo: 'estrada', sentido: 'hor',
    nota: 'o percurso dos anos 50, cidade por cidade',
    pts: geo([[45.54, 10.22], [45.44, 10.99], [45.55, 11.55], [45.41, 11.88], [44.84, 11.62], [44.42, 12.20], [43.91, 12.91], [43.62, 13.52],
              [42.46, 14.21], [42.35, 13.40], [42.40, 12.86], [41.90, 12.50], [42.42, 12.10], [43.32, 11.33], [43.77, 11.25], [44.49, 11.34],
              [44.65, 10.92], [44.80, 10.33], [45.05, 9.70], [45.13, 10.02], [45.16, 10.79]]) },
  de_avu: { nome: 'AVUS', comp: 8300, tipo: 'estrada', sentido: 'anti',
    nota: 'as duas pistas da autoestrada A115 entre o Funkturm e Nikolassee, com a curva inclinada ao norte',
    pts: grampo([52.5030, 13.2780], [52.4340, 13.2050], 22) },
  /* ── aeródromos ── */
  at: { nome: 'Zeltweg (aeródromo)', comp: 3200, tipo: 'aerodromo', sentido: 'hor', nota: 'a pista de pouso e a volta pela pista de táxi', pts: aerodromo(3200) },
  dt_die: { nome: 'Flugplatz Diepholz', comp: 2580, tipo: 'aerodromo', sentido: 'hor', nota: 'a pista de pouso e a volta pela pista de táxi', pts: aerodromo(2580) },
  dt_wun: { nome: 'Fliegerhorst Wunstorf', comp: 3100, tipo: 'aerodromo', sentido: 'hor', nota: 'a pista de pouso e a volta pela pista de táxi', pts: aerodromo(3100) },
  us_cle: { nome: 'Burke Lakefront Airport', comp: 3390, tipo: 'aerodromo', sentido: 'hor', nota: 'a pista de pouso e a volta pela pista de táxi', pts: aerodromo(3390) },
  ca_edm: { nome: 'Edmonton City Centre Airport', comp: 3138, tipo: 'aerodromo', sentido: 'hor', nota: 'a pista de pouso e a volta pela pista de táxi', pts: aerodromo(3138) },
  /* ── ovais ── */
  us_lan: { nome: 'Langhorne Speedway', comp: 1609, tipo: 'oval', sentido: 'anti', nota: 'a milha quase circular ("Big Left Turn")', pts: oval(1609, .04, 40) },
  us_spr: { nome: 'Springfield Mile', comp: 1609, tipo: 'oval', sentido: 'anti', nota: 'oval de terra de uma milha', pts: oval(1609, .32) },
  us_syr: { nome: 'Syracuse Mile', comp: 1609, tipo: 'oval', sentido: 'anti', nota: 'oval de terra de uma milha', pts: oval(1609, .32) },
  us_sac: { nome: 'Sacramento Mile', comp: 1609, tipo: 'oval', sentido: 'anti', nota: 'oval de terra de uma milha', pts: oval(1609, .32) },
  us_txw: { nome: 'Texas World Speedway', comp: 3219, tipo: 'oval', sentido: 'anti', nota: 'oval em D de duas milhas', pts: ovalD(3219) },
  br_rio: { nome: 'Autódromo de Jacarepaguá (oval)', comp: 3000, tipo: 'oval', sentido: 'anti', nota: 'o oval Emerson Fittipaldi', pts: ovalD(3000) },
  ns_col: { nome: 'Los Angeles Memorial Coliseum', comp: 402, tipo: 'oval', sentido: 'anti', nota: 'o oval de um quarto de milha dentro do estádio', pts: oval(402, .3, 32) }
};

/* nas estradas, pontos ao longo de cada reta: a curva fica só nos lugares de verdade
   (sem isso a suavização do jogo arredonda a reta inteira) */
function densa(pts){
  const out = [];
  pts.forEach((p, i) => {
    const q = pts[(i + 1) % pts.length], d = Math.hypot(q[0] - p[0], q[1] - p[1]);
    out.push(p);
    const n = Math.max(0, Math.floor(d / Math.max(150, d / 8)) - 1);
    for(let k = 1; k <= n; k++){ const t = k / (n + 1); if(t > .12 && t < .88) out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]); }
  });
  return out;
}
Object.keys(PISTAS).forEach(id => { if(PISTAS[id].tipo === 'estrada' && id !== 'de_avu') PISTAS[id].pts = densa(PISTAS[id].pts); });

/* pontos em decímetros, diferenças (o formato dos outros traçados) */
const out = {};
for(const id of Object.keys(PISTAS)){
  const p = PISTAS[id];
  const cx = p.pts.reduce((a, q) => a + q[0], 0) / p.pts.length, cy = p.pts.reduce((a, q) => a + q[1], 0) / p.pts.length;
  let px = 0, py = 0; const v = [];
  p.pts.forEach(q => { const x = Math.round((q[0] - cx) * 10), y = Math.round((q[1] - cy) * 10); v.push(x - px, y - py); px = x; py = y; });
  out[id] = { f: 'aprox', tipo: p.tipo, nome: p.nome, comp: p.comp, sentido: p.sentido, nota: p.nota, pts: v.join(',') };
}
/* o mesmo circuito com outro id no jogo */
out.dt_ave = { alias: 'de_avu' };
writeFileSync(join(RAIZ, 'dados', 'tracados-aprox.js'), `/* Traçados aproximados de circuitos que o OpenStreetMap não tem como pista de corrida
   (estradas fechadas, aeródromos e ovais que já não existem), gerados por
   ferramentas/pistas-aprox.mjs. Pontos em decímetros (diferenças, x leste, y norte);
   o jogo escala para o comprimento oficial e mostra como traçado aproximado.
   As coordenadas dos lugares vêm do OpenStreetMap (© colaboradores, ODbL). */
var PISTAS_APROX = ${JSON.stringify(out)};
`);
console.log(Object.keys(out).length + ' traçados aproximados');
