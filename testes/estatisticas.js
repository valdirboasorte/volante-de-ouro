/* Estatísticas separadas por categoria e rankings sem participação indevida.
   Uso: node testes/estatisticas.js   Não modifica arquivos nem saves. */
const H = require('./base');
let falhas = 0, n = 0;
const ok = (c, m) => { n++; if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };

{
  /* carreira do kart à principal, com temporadas de verdade */
  const J = H.carregar({ silencioso:true, seed: 42 });
  H.novaCarreira(J, { era: 5, ano: 2000, idade: 13, cc: 'BR', rapido: true });
  J.run('for(const k in S.driver.attr){ S.driver.attr[k] = 90; S.driver.pot[k] = 95; } S.driver.ovr = Engine.ovr(S.driver.attr);');
  let viuTopo = false;
  for(let k = 0; k < 14 && !viuTopo; k++){
    const r = H.temporada(J);
    if(r.fim) break;
    viuTopo = J.run('S.archive.some(a => a.isTop && !a.papel)');
  }
  /* mais uma temporada na principal, se chegou */
  if(viuTopo) H.temporada(J);
  const e = J.run('(() => { const x = Engine.estatisticas(); return { grupos: x.grupos.map(g => ({ rot:g.rot, t:g.titulos, w:g.wins, l:g.largadas, topo:!!g.topo, temp:g.temporadas })), total: { rot:x.total.rot, t:x.total.titulos, w:x.total.wins, l:x.total.largadas, temp:x.total.temporadas } }; })()');
  const kart = e.grupos.find(g => g.rot === 'Kart'), base = e.grupos.find(g => g.rot === 'Categorias de base'), topo = e.grupos.find(g => g.topo);
  ok(!!kart && !!base, 'kart e categorias de base aparecem separados');
  const soma = e.grupos.reduce((a, g) => a + g.w, 0);
  ok(e.total.rot === 'Todas as categorias' && e.total.w === soma, `o total é identificado e é a soma das linhas (${e.total.w} vitórias)`);
  if(topo){
    const porSerie = J.run('S.career.porSerie.f1');
    ok(topo.w === porSerie.wins && topo.t === porSerie.titles, `vitórias e títulos da principal batem com o placar da série (${topo.w}/${topo.t})`);
    const tBase = (kart ? kart.t : 0) + (base ? base.t : 0);
    ok(J.run('S.career.titles') === topo.t, `títulos da base (${tBase}) não entram nos títulos da principal (${topo.t})`);
  } else ok(true, 'carreira não chegou à principal neste lote (comparação da principal pulada)');
  /* ranking real: só a série disputada */
  const naIndy = J.run(`rankingLendas('indy', { name:S.driver.name, cc:S.driver.cc, porSerie:S.career.porSerie, titles:S.career.titles, wins:S.career.wins, serie:'f1' })`);
  ok(naIndy.status === 'nunca' && naIndy.eu === null, 'o ranking da IndyCar não inclui quem nunca correu lá');
  /* save antigo, sem placar por categoria */
  const antigo = J.run(`rankingLendas('nascar', { name:'Velho', cc:'BR', titles:3, wins:20, serie:'f1' })`);
  ok(antigo.status === 'nunca' && !antigo.eu, 'save antigo: títulos totais não vão para outra categoria');
  const antigoF1 = J.run(`rankingLendas('f1', { name:'Velho', cc:'BR', titles:3, wins:20, serie:'f1' })`);
  ok(antigoF1.status === 'semDados' && antigoF1.eu && antigoF1.eu.t === 3, 'save antigo: os totais valem só na série da carreira, identificados');
  /* só base, sem principal: o placar da série não conta como participação */
  const soBase = J.run(`rankingLendas('f1', { name:'Base', cc:'BR', porSerie:{ f1:{ titles:0, wins:0, podiums:0, seasons:4, topo:0 } }, serie:'f1' })`);
  ok(soBase.status === 'nunca', 'quatro temporadas de base não contam como participação na principal');
  const semConq = J.run(`rankingLendas('f1', { name:'Fundo', cc:'BR', porSerie:{ f1:{ titles:0, wins:0, podiums:0, seasons:6, topo:3 } }, serie:'f1' })`);
  ok(semConq.status === 'semConquistas' && semConq.eu, 'correu sem conquistas: aparece com zero e o aviso certo');
  /* ranking do save */
  if(viuTopo){
    const u = J.run('(() => { const r = rankingUniverso("f1", {}); const nomes = r.linhas.map(x => x.nome); return { status:r.status, n:nomes.length, unicos:new Set(nomes).size, eu: r.eu, desde:r.desde, ate:r.ate, antes:r.comAntes }; })()');
    ok(u.status === 'ok' && u.n === u.unicos, `ranking do save sem duplicados (${u.n} pilotos, ${u.desde}–${u.ate})`);
    ok(!!u.eu, 'quem correu na principal aparece no ranking do save');
    /* o ano em que o jogador foi campeão não vira título de outro */
    const dup = J.run(`(() => {
      const anosMeus = S.archive.filter(a => a.isTop && a.summary && a.summary.champion).map(a => a.year);
      const W = S.mundos.f1; let conflitos = 0;
      Object.values(W.p).forEach(r => (r.hs || []).forEach(h => { if(h[1] === 0 && h[3] === 1 && anosMeus.indexOf(h[0]) >= 0) conflitos++; }));
      return { anosMeus, conflitos };
    })()`);
    ok(dup.conflitos === 0, `nenhum rival herda o título dos anos em que você foi campeão (${dup.anosMeus.join(', ') || 'nenhum título'})`);
  }
}
{
  /* não largou: lesão não é largada nem abandono */
  const J = H.carregar({ silencioso:true, seed: 7 });
  H.novaCarreira(J, { era: 7, ano: 2023, idade: 24, rapido: true });
  J.run('S.driver.injured = 2; Game.simSeason(); UI.limparFila(); UI.close();');
  const s = J.run('Engine.summary(S.season)');
  ok(s.inscricoes === s.races + s.naoLargou && s.naoLargou >= 2, `inscrições ${s.inscricoes} = largadas ${s.races} + não largou ${s.naoLargou}`);
  const dnfLes = J.run('S.season.results.filter(r => r.dnf === "LES").length');
  ok(s.dnfs <= s.races && dnfLes >= 2 && J.run('S.season.results.filter(r => r.dnf && r.dnf !== "LES").length') === s.dnfs, 'abandonos contam só corridas largadas');
}

console.log(falhas ? falhas + ' falha(s) de ' + n : `estatísticas e rankings: ${n} verificações, tudo certo`);
if(falhas) process.exitCode = 1;
