/* Carreiras jogadas de verdade atravessando o fim dos dados: o grid que o
   jogador vê tem duplicados? Continua de um ano para o outro? */
const H = require('./base');
const N = +(process.argv[2] || 6), ANO = +(process.argv[3] || 2023), IDADE = +(process.argv[4] || 18);
let erros = 0, dupTot = 0, temporadas = 0;
const t0 = Date.now();
for(let k = 0; k < N; k++){
  const J = H.carregar();
  try {
    H.novaCarreira(J, { era:7, ano:ANO, idade:IDADE, rapido:true });
    let antes = null;
    const lin = [];
    for(let a = 0; a < 12; a++){
      const S = J.run('S');
      if(S.retired) break;
      const sea = S.season;
      const nomes = sea.field.filter(f => !f.isMe).map(f => f.name);
      const dup = nomes.filter((n, i) => nomes.indexOf(n) !== i);
      if(dup.length){ dupTot++; lin.push('  DUPLICADO em ' + sea.year + ': ' + dup.join(',')); }
      let cont = '';
      if(antes && antes.cat === sea.cat){
        const ficou = nomes.filter(n => antes.nomes.has(n)).length;
        cont = ` ${ficou}/${nomes.length} do grid anterior`;
      }
      lin.push(`  ${sea.year} ${sea.cat.padEnd(18)} doc ${sea.docN}/${sea.gridN}${cont}`);
      antes = { cat: sea.cat, nomes: new Set(nomes) };
      const r = H.temporada(J);
      temporadas++;
      if(r.fim) { lin.push('  fim: ' + r.fim); break; }
    }
    if(k < 3) console.log(`carreira ${k + 1}:\n` + lin.join('\n'));
  } catch(e){ erros++; console.log('ERRO', e.stack.split('\n').slice(0, 5).join(' | ')); }
}
console.log(`${N} carreiras, ${temporadas} temporadas, ${erros} erros, ${dupTot} grids com duplicado, ${((Date.now() - t0) / 1000).toFixed(1)}s`);

if(erros || dupTot) process.exitCode = 1;
