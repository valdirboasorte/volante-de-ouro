/* O mundo de pilotos ao longo dos anos: continuidade, duplicados, vagas, renovação */
const H = require('./base');
const J = H.carregar();
const ANO0 = +(process.argv[2] || 2023), ANO1 = +(process.argv[3] || 2035), SK = process.argv[4] || 'f1';
H.novaCarreira(J, { era: SK === 'f1' ? 7 : 7, ano: Math.min(ANO0, 2026), idade:20, serie:SK });
const run = J.run;
let falhas = 0;
const linhas = [];
let antes = null;
for(let y = ANO0; y <= ANO1; y++){
  run(`S.year = ${y}; Engine.garantirMundo();`);
  const r = JSON.parse(run(`(function(){
    const W = Engine.mundo();
    const D = Mundo.degraus(W.sk, ${y});
    const ativos = Object.values(W.p).filter(r => r.st === 'a' && r.g != null);
    const porG = {}; ativos.forEach(r => (porG[r.g] = porG[r.g] || []).push(r));
    const nomes = ativos.map(r => r.n);
    const dup = nomes.filter((n, i) => nomes.indexOf(n) !== i);
    const ids = Object.keys(W.p);
    const nomesTodos = Object.values(W.p).map(r => r.n);
    const dupTodos = nomesTodos.filter((n, i) => nomesTodos.indexOf(n) !== i);
    return JSON.stringify({
      cats: D.map(d => d.cat), alvo: D.map(d => d.alvo),
      porG: Object.fromEntries(Object.keys(porG).map(g => [g, porG[g].map(r => ({ id:r.id, n:r.n, cc:r.cc, idade:${y} - r.nasc, h:Math.round(r.h), doc:r.doc, real:r.r, eq:r.eq }))])),
      dup, dupTodos, total: ids.length, livres: Object.values(W.p).filter(r => r.st === 'l').length,
      fora: Object.values(W.p).filter(r => r.st === 'f').length
    });
  })()`));
  const N = r.cats.length - 1;
  const partes = [];
  for(let g = 0; g <= Math.min(N, 4); g++){
    const lista = r.porG[g] || [];
    let cont = '';
    if(antes){
      const prevIds = new Set(Object.values(antes.porG).flat().map(x => x.id));
      const ficaram = lista.filter(x => prevIds.has(x.id)).length;
      cont = ` ${ficaram}/${lista.length} continuam`;
    }
    const real = lista.filter(x => x.real).length;
    const idadeM = lista.length ? (lista.reduce((s, x) => s + x.idade, 0) / lista.length).toFixed(1) : '-';
    const hM = lista.length ? (lista.reduce((s, x) => s + x.h, 0) / lista.length).toFixed(0) : '-';
    partes.push(`g${g} ${r.cats[g].slice(0, 12)}: ${lista.length}/${g ? r.alvo[g] : '-'} (reais ${real}, idade ${idadeM}, nível ${hM})${cont}`);
  }
  linhas.push(`${y} | ${partes.join(' | ')} | total ${r.total} livres ${r.livres}${r.dup.length ? ' | DUPLICADOS ATIVOS: ' + r.dup.join(',') : ''}${r.dupTodos.length ? ' | NOMES REPETIDOS NO REGISTRO: ' + r.dupTodos.length : ''}`);
  if(r.dup.length || r.dupTodos.length) falhas++;
  if(y === 2026 || y === ANO1){
    linhas.push('   F2 ' + y + ': ' + (r.porG[1] || []).slice(0, 10).map(x => `${x.n}(${x.idade},${x.h}${x.doc ? ',doc' : ''})`).join(', '));
    linhas.push('   F1 ' + y + ': ' + (r.porG[0] || []).slice(0, 22).map(x => `${x.n}@${x.eq}(${x.idade})`).join(', '));
  }
  antes = r;
}
console.log(linhas.join('\n'));
console.log(falhas ? `\n${falhas} ano(s) com duplicação` : '\nsem duplicação em nenhum ano');
