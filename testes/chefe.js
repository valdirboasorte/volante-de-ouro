/* Carreiras de chefe com decisões aleatórias: erros, duplicados, continuidade */
const H = require('./base');
const N = +(process.argv[2] || 20), SEMENTE_ANO = process.argv[3] ? +process.argv[3] : null;
const J = H.carregar();
const run = J.run;
run(require('./chefe-comum'));
let erros = 0, temporadas = 0, dupTot = 0, contTot = 0, contN = 0;
const t0 = Date.now();
const eras = JSON.parse(run('JSON.stringify(ERAS.map(e => e.y))'));
for(let k = 0; k < N; k++){
  const modo = ['assumir','criar','base'][k % 3];
  const ano = SEMENTE_ANO || Math.min(2026, eras[Math.floor(Math.random() * eras.length)] + Math.floor(Math.random() * 10));
  try {
    const o = { modo, ano, chefe:{ nome:'T', cc:'BR' }, realismo: Math.random() < .7, eq:{ nome:'Equipe ' + k, cor:'#123456', cc:'BR' } };
    if(modo === 'assumir'){
      const lista = JSON.parse(run(`JSON.stringify(eraOfSeries(${ano},'f1').teams.map((t,i) => Engine.resolveTeam(t, i, ${ano}, 'f1') ? i : -1).filter(i => i >= 0))`));
      o.idx = lista[Math.floor(Math.random() * lista.length)];
    }
    if(modo === 'base'){
      const cats = JSON.parse(run(`JSON.stringify(Chefe.escadaBase(${ano}, 'BR'))`));
      o.cat = cats[Math.floor(Math.random() * cats.length)];
    }
    run(`Chefe.novo(${JSON.stringify(o)})`);
    let antes = null;
    const anos = 4 + Math.floor(Math.random() * 7);
    for(let a = 0; a < anos; a++){
      run('__inverno()');
      const r = JSON.parse(run('JSON.stringify((() => { const x = __temporada(); return { dup:x.dup, cat:x.cat, ano:x.ano, nomes:x.nomes, est:!!x.b.estouro, fal:!!x.b.falencia, dem:!!(x.b.aval && x.b.aval.demitido) }; })())'));
      temporadas++;
      if(r.dup.length){ dupTot++; console.log('  DUPLICADO', modo, r.ano, r.cat, r.dup.join(',')); }
      if(antes && antes.cat === r.cat){ contTot += r.nomes.filter(x => antes.nomes.includes(x)).length / r.nomes.length; contN++; }
      antes = r;
      if(r.est) run(`Chefe.resolverTeto('declarar')`);
      if(r.fal){ if(run(`C.modo === 'assumir' && C.dir && C.dir.dono !== 'conselho'`)) run(`Chefe.lancar('dono', C.balanco.falencia.divida); C.balanco.falencia = null;`); else run('Chefe.resgatar()'); }
      if(run('!!C.vendida')) break;
      if(r.dem){ const props = JSON.parse(run('JSON.stringify(Chefe.propostasEmprego())')); if(!props.length) break; run(`Chefe.assumirOutra(${JSON.stringify(props[0])})`); continue; }
      run('Chefe.proximoAno()');
    }
    /* o save tem de caber e reabrir */
    const tam = run('JSON.stringify(C).length');
    run('C = JSON.parse(JSON.stringify(C))');
    if(tam > 2.5e6) console.log('  save grande:', tam);
  } catch(e){ erros++; console.log('ERRO', modo, ano, '→', e.stack.split('\n').slice(0, 4).join(' | ')); }
}
console.log(`${N} carreiras, ${temporadas} temporadas, ${erros} erros, ${dupTot} grids com duplicado, continuidade média na mesma categoria ${(contTot / Math.max(1, contN) * 100).toFixed(0)}%, ${((Date.now() - t0) / 1000).toFixed(1)}s`);

if(erros || dupTot) process.exitCode = 1;
