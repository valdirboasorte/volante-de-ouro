/* Economia do modo chefe por série: com as mesmas decisões ao acaso, quantas
   temporadas fecham no vermelho (falência) e onde a equipe termina.
   Uso: node testes/chefe-economia.js [carreiras por série e caminho=4] [anos=4]
   Mede lotes, não carreiras isoladas. Não modifica arquivos nem saves. */
const H = require('./base');
const N = +(process.argv[2] || 4), ANOS = +(process.argv[3] || 4);
const J = H.carregar({ silencioso:true, seed: 101 });
J.run(require('./chefe-comum'));
const linhas = [];
for(const sk of ['f1','indy','nascar','wec','fe','dtm','stock']){
  for(const modo of ['assumir','criar','base']){
    let temp = 0, fal = 0, pos = 0, posN = 0, caixa = [];
    const de = J.run(`SERIES['${sk}'].from`);
    for(let k = 0; k < N; k++){
      const ano = Math.min(2022, Math.max(de, 1980) + ((k * 11) % Math.max(1, 2022 - Math.max(de, 1980))));
      const o = { modo, sk, ano, chefe:{ nome:'T', cc:'BR' }, realismo:true, eq:{ nome:'E' + k, cor:'#123456', cc: sk === 'stock' ? 'BR' : 'GB' } };
      if(modo === 'assumir'){ const l = JSON.parse(J.run(`JSON.stringify(eraOfSeries(${ano},'${sk}').teams.map((t,i) => Engine.resolveTeam(t, i, ${ano}, '${sk}') ? i : -1).filter(i => i >= 0))`)); o.idx = l[(k * 3) % l.length]; }
      if(modo === 'base') o.cat = JSON.parse(J.run(`JSON.stringify(Chefe.escadaBase(${ano}, '${o.eq.cc}', '${sk}'))`)).slice(-1)[0];
      try {
        J.run(`Chefe.novo(${JSON.stringify(o)})`);
        for(let a = 0; a < ANOS; a++){
          J.run('__inverno()');
          const t = J.run(`(() => { const x = __temporada(); return { fal: !!x.b.falencia, dem: !!(x.b.aval && x.b.aval.demitido), pos: C.ultimaPos, n: C.temporada.teams.length, caixa: C.caixa / Chefe.escala(C.ano) }; })()`);
          temp++; if(t.fal) fal++; pos += t.pos / t.n; posN++; caixa.push(t.caixa);
          if(t.fal){ if(J.run(`C.modo === 'assumir' && C.dir && C.dir.dono !== 'conselho'`)) J.run(`Chefe.lancar('dono', C.balanco.falencia.divida); C.balanco.falencia = null;`); else J.run('Chefe.resgatar()'); }
          if(J.run('!!C.vendida') || t.dem) break;
          J.run('Chefe.proximoAno()');
        }
      } catch(e){ console.log('ERRO', sk, modo, e.message); }
    }
    caixa.sort((a, b) => a - b);
    linhas.push(`${sk.padEnd(7)} ${modo.padEnd(8)} temporadas ${String(temp).padStart(3)} | no vermelho ${String(Math.round(fal / Math.max(1, temp) * 100)).padStart(3)}% | posição média ${(pos / Math.max(1, posN) * 100).toFixed(0)}% do grid | caixa mediano ${(caixa[Math.floor(caixa.length / 2)] / 1e6 || 0).toFixed(1)} mi (moeda de hoje)`);
  }
}
console.log(linhas.join('\n'));
