/* Um save feito antes do banco histórico (commit 1de47cc) abre na versão
   nova e segue: a escada é refeita sem anacronismo, o degrau do jogador é
   achado e nenhum piloto aparece duas vezes no grid. */
const H = require('./base');
const path = require('path');
const ANTIGO = path.join(require('os').tmpdir(), 'vdo_antes_do_historico.html');
require('fs').writeFileSync(ANTIGO, require('child_process').execSync('git show 1de47cc:index.html', { cwd: path.join(__dirname, '..'), maxBuffer: 64e6 }));
const casos = [
  /* em 2003 a escada antiga chamava de "GP2 Series" o degrau que era a F3000 */
  { nome:'piloto perto do topo, save de 2003', o:{ era:5, ano:2002, idade:21, rapido:true, cc:'BR' }, anos:1 },
  { nome:'piloto na base, save de 1983', o:{ era:3, ano:1982, idade:18, rapido:true, cc:'GB' }, anos:1 },
  { nome:'piloto na base, save de 2016', o:{ era:6, ano:2015, idade:18, rapido:true, cc:'IT' }, anos:1 }
];
let falhas = 0;
for(const c of casos){
  const store = {};
  const A = H.carregar({ arquivo: ANTIGO, store, semHistorico: true, silencioso: true });
  H.novaCarreira(A, c.o);
  for(let i = 0; i < c.anos; i++) H.temporada(A);
  A.run('Game.save()');
  const N = H.carregar({ store, silencioso: true });
  try {
    N.run('Game.continueSave(); UI.limparFila(); UI.close();');
    const S0 = N.run('S');
    if(!S0 || !S0.season) throw new Error('não abriu');
    if(!S0.campEscolhido || !(S0.vHist >= 2)) throw new Error('migração do banco histórico não rodou');
    const linhas = [];
    for(let i = 0; i < 4; i++){
      const r = H.temporada(N);
      if(r.fim){ linhas.push('fim: ' + r.fim); break; }
      const sea = N.run('S.season'), esc = N.run('S.ladder');
      const nomes = sea.field.filter(f => !f.isMe).map(f => f.name);
      const dup = nomes.filter((n, k) => nomes.indexOf(n) !== k);
      const anacr = esc.filter(x => (/GP2/.test(x) && (sea.year < 2005 || sea.year > 2016)) || (x === 'Fórmula 3000' && (sea.year < 1985 || sea.year > 2004)));
      const cid = N.run(`campDaCat(${JSON.stringify(sea.cat)}, ${sea.year})`);
      const t = cid ? N.run(`Hist.temporada('${cid}', ${sea.year})`) : null;
      const reais = t ? nomes.filter(n => t.inscritos.some(x => x.name === n)).length : 0;
      linhas.push(`${sea.year} ${sea.cat}: ${nomes.length} no grid, ${reais} reais${dup.length ? ' DUPLICADOS ' + dup : ''}${anacr.length ? ' ANACRONISMO ' + anacr : ''}`);
      if(dup.length || anacr.length) falhas++;
    }
    console.log(`✓ ${c.nome}: abriu em ${S0.season.year} (${S0.season.cat})\n   ` + linhas.join('\n   '));
  } catch(e){ falhas++; console.log('✗ ' + c.nome + ': ' + e.stack.split('\n').slice(0, 4).join(' | ')); }
}
console.log(falhas ? falhas + ' falha(s)' : 'saves de antes do banco histórico abrem sem falhas');
if(falhas) process.exitCode = 1;
