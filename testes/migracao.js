/* Um save feito pela versão antiga abre na nova e continua sem quebrar */
const H = require('./base');
const ANTIGO = require('path').join(require('os').tmpdir(), 'vdo_antes_do_mundo.html');
/* a última versão antes do registro de pilotos: commit 88cfd7b */
require('fs').writeFileSync(ANTIGO, require('child_process').execSync('git show 88cfd7b:index.html', { cwd: require('path').join(__dirname, '..'), maxBuffer: 64e6 }));
const casos = [
  { nome:'piloto na base, save de 2026', o:{ era:7, ano:2024, idade:19, rapido:true }, anos:2 },
  { nome:'piloto na F1, save de 2028', o:{ era:7, ano:2024, idade:27, rapido:true }, anos:4 },
  { nome:'piloto no kart, save de 1986', o:{ era:3, ano:1985, idade:14, rapido:true }, anos:1 }
];
let falhas = 0;
for(const c of casos){
  const store = {};
  const A = H.carregar({ arquivo: ANTIGO, store });
  H.novaCarreira(A, c.o);
  for(let i = 0; i < c.anos; i++) H.temporada(A);
  A.run('Game.save()');
  const velho = JSON.parse(store.vdo_save);
  const gridVelho = velho.season.field.filter(f => !f.isMe).map(f => f.name);
  /* a versão nova abre o mesmo armazenamento */
  const N = H.carregar({ store });
  try {
    N.run('Game.continueSave(); UI.limparFila(); UI.close();');
    const S0 = N.run('S');
    if(!S0 || !S0.season) throw new Error('não abriu');
    const linhas = [];
    let antes = new Set(gridVelho), catAntes = S0.season.cat;
    for(let i = 0; i < 4; i++){
      const r = H.temporada(N);
      if(r.fim) { linhas.push('fim: ' + r.fim); break; }
      const sea = N.run('S.season');
      const nomes = sea.field.filter(f => !f.isMe).map(f => f.name);
      const dup = nomes.filter((n, k) => nomes.indexOf(n) !== k);
      const cont = sea.cat === catAntes ? nomes.filter(n => antes.has(n)).length + '/' + nomes.length + ' continuam' : 'mudou de categoria';
      linhas.push(`${sea.year} ${sea.cat}: ${cont}${dup.length ? ' DUPLICADOS ' + dup : ''}`);
      if(dup.length) falhas++;
      antes = new Set(nomes); catAntes = sea.cat;
    }
    const W = N.run('S.mundos && Object.keys(S.mundos)');
    console.log(`✓ ${c.nome}: abriu em ${S0.season.year} (${S0.season.cat}); mundo: ${W}; jrPool removido: ${!N.run('S.jrPool')}\n   ` + linhas.join('\n   '));
  } catch(e){ falhas++; console.log('✗ ' + c.nome + ': ' + e.stack.split('\n').slice(0, 4).join(' | ')); }
}
console.log(falhas ? falhas + ' falha(s)' : 'migração sem falhas');

if(falhas) process.exitCode = 1;
