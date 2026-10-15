/* Gera ferramentas/pistas-inspecao.html: todos os traçados do bacinger/f1-circuits
   desenhados em metros, com o primeiro ponto e o sentido da lista marcados.
   Serve para conferir sentido de circulação e a linha de chegada de cada um. */
const fs = require('fs'), path = require('path');
const DIR = path.join(__dirname, 'terceiros', 'f1c', 'f1-circuits-master', 'circuits');
const arqs = fs.readdirSync(DIR).filter(f => f.endsWith('.geojson')).sort();
const cards = arqs.map(a => {
  const f = JSON.parse(fs.readFileSync(path.join(DIR, a), 'utf8')).features[0];
  const c = f.geometry.coordinates;
  const lat0 = c.reduce((s, p) => s + p[1], 0) / c.length * Math.PI / 180;
  const R = 6371008.8;
  const pts = c.map(p => [p[0] * Math.PI / 180 * R * Math.cos(lat0), p[1] * Math.PI / 180 * R]);
  let comp = 0, area = 0;
  for(let i = 1; i < pts.length; i++){
    comp += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    area += pts[i - 1][0] * pts[i][1] - pts[i][0] * pts[i - 1][1];
  }
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const esc = 280 / Math.max(x1 - x0, y1 - y0);
  const P = p => [(p[0] - x0) * esc + 10, (y1 - p[1]) * esc + 10];
  const d = pts.map((p, i) => (i ? 'L' : 'M') + P(p).map(v => v.toFixed(1)).join(' ')).join('');
  /* setas de sentido a cada 1/8 da lista */
  const setas = [];
  for(let k = 1; k < 8; k++){
    const i = Math.floor(k * (pts.length - 1) / 8), a1 = P(pts[i]), b1 = P(pts[Math.min(pts.length - 1, i + 1)]);
    const ang = Math.atan2(b1[1] - a1[1], b1[0] - a1[0]) * 180 / Math.PI;
    setas.push(`<path d="M-6 -4 L4 0 L-6 4 Z" fill="#e2231a" transform="translate(${a1[0].toFixed(1)} ${a1[1].toFixed(1)}) rotate(${ang.toFixed(0)})"/>`);
  }
  const s0 = P(pts[0]), s1 = P(pts[1]);
  return `<div class="c"><svg viewBox="0 0 300 300" width="300" height="300"><path d="${d}" fill="none" stroke="#ddd" stroke-width="3"/>
    ${setas.join('')}<circle cx="${s0[0]}" cy="${s0[1]}" r="6" fill="#22c46e"/><line x1="${s0[0]}" y1="${s0[1]}" x2="${s1[0]}" y2="${s1[1]}" stroke="#22c46e" stroke-width="3"/></svg>
    <b>${a.replace('.geojson', '')}</b> ${f.properties.Name}<br>${c.length} pontos · medido ${comp.toFixed(0)} m · oficial ${f.properties.length} m · ${area > 0 ? 'anti-horário' : 'horário'} na lista</div>`;
});
fs.writeFileSync(path.join(__dirname, 'pistas-inspecao.html'), `<!doctype html><meta charset="utf-8"><title>Traçados</title>
<style>body{background:#111;color:#ddd;font:12px system-ui;display:flex;flex-wrap:wrap;gap:10px;padding:10px}.c{width:300px}</style>${cards.join('')}`);
console.log('ok', arqs.length);
