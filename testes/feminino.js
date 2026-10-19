/* Pilota e os campeonatos só de mulheres (F1 Academy, W Series).
   — o gênero escolhido fica no piloto;
   — F1 Academy aparece na estreia e nas propostas só para quem é mulher;
   — o grid dela só tem mulheres: o real enquanto existe, depois as inventadas;
   — um homem não consegue escolher a F1 Academy pela janela de campeonatos;
   — W Series não existe em 2020 (temporada cancelada);
   — as contas das redes escrevem no feminino. */
const H = require('./base');
let falhas = 0;
const ok = (c, m) => { if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };

function carreira(g, ano, idade){
  const J = H.carregar({ silencioso: true });
  J.run(`UI.genero = '${g}';`);
  H.novaCarreira(J, { era: 7, ano, idade, cc: 'BR', rapido: true });
  return J;
}
{
  const J = carreira('f', 2023, 15);
  ok(J.run('S.driver.genero') === 'f', 'o gênero escolhido fica no piloto');
  ok(J.run(`UI.estreiasPossiveis(2024, 16, 'f1').some(x => x.c.id === 'f1_academy')`), 'pilota pode estrear na F1 Academy');
  const M = carreira('m', 2023, 15);
  ok(!M.run(`UI.estreiasPossiveis(2024, 16, 'f1').some(x => x.c.fem)`), 'piloto não vê campeonato só de mulheres na estreia');
  /* propostas: várias temporadas de um piloto, nenhuma de campeonato feminino */
  let femH = 0;
  for(let k = 0; k < 4; k++){
    const r = H.temporada(M, (ofs) => { femH += ofs.filter(o => o.fem || (o.camp && M.run(`!!(Hist.camp('${o.camp}') || {}).fem`))).length; return -1; });
    if(r.fim) break;
  }
  ok(femH === 0, 'piloto nunca recebe proposta de campeonato só de mulheres');
  M.run(`UIH.escolher('F4_NAC', 'f1_academy');`);
  ok(!(M.run('(Engine.escolhas(S.series) || {}).F4_NAC') === 'f1_academy'), 'piloto não consegue escolher a F1 Academy na janela de campeonatos');
}
{
  /* a pilota vai para a F1 Academy e corre três anos: 2024-2026 com o grid real, 2027 só com inventadas */
  const J = carreira('f', 2023, 15);
  const FEM = new Set(J.run('[].concat(...Object.values(NOMES_PROPRIOS_F))'));
  let viu = false, anos = [];
  for(let k = 0; k < 4; k++){
    const r = H.temporada(J, ofs => { const i = ofs.findIndex(o => o.camp === 'f1_academy' || o.cat === 'F1 Academy'); if(i >= 0) viu = true; return i; });
    if(r.fim) break;
    if(J.run('S.season.cat') !== 'F1 Academy') continue;
    const nomes = J.run('S.season.field.filter(f => !f.isMe).map(f => f.name)');
    const ano = J.run('S.year');
    /* quem correu de verdade em qualquer ano da F1 Academy (as reais seguem no grid depois de 2026) */
    const real = J.run(`[2023, 2024, 2025, 2026].flatMap(a => (elencoReal('F1 Academy', a) || []).map(x => x.name))`);
    /* Taylor, por exemplo, pertence aos dois repertórios. Estar no masculino
       não torna inválido um nome também gerado pelo repertório feminino. */
    const homens = nomes.filter(n => real.indexOf(n) < 0 && !FEM.has(n.split(' ')[0]));
    anos.push(ano + (homens.length ? ' (homens: ' + homens.join(', ') + ')' : ''));
  }
  ok(viu, 'a F1 Academy aparece nas propostas da pilota');
  ok(anos.length >= 2 && anos.every(a => !/homens/.test(a)), `grid da F1 Academy só com mulheres: ${anos.join('; ')}`);
}
{
  const J = carreira('f', 2023, 15);
  ok(!J.run(`Hist.existe(Hist.camp('w_series'), 2020)`) && J.run(`Hist.existe(Hist.camp('w_series'), 2021)`), 'W Series: sem temporada em 2020');
  ok(J.run(`preencher('a {equipe} devia agradecer por ter o {eu}, CAMPEÃO', { eu: 'Silva', equipe: 'Prema' })`) === 'a Prema devia agradecer por ter a Silva, CAMPEÃ', 'as redes escrevem no feminino');
}

console.log(falhas ? falhas + ' falha(s)' : 'pilota: gênero, F1 Academy e W Series funcionando');
if(falhas) process.exitCode = 1;
