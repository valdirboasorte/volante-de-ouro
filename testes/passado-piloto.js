/* Assumir um piloto real: ele chega com o que já tinha antes do ano em que você
   assume (banco histórico), e a carreira soma por cima, sem zerar. As telas
   mostram os números somados; o save guarda o passado à parte.
   Uso: node testes/passado-piloto.js   Não modifica arquivos nem saves. */
const H = require('./base');
let falhas = 0, n = 0;
const ok = (c, m) => { n++; if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };
const temporadaNaPrincipal = J => J.run('Game.simSeason(); UI.limparFila(); UI.close(); Game.endSeason(); UI.limparFila(); UI.close();');

{
  console.log('Verstappen, assumido em 2023');
  const store = {};
  const J = H.carregar({ silencioso: true, seed: 5, store });
  J.run(`Saves.antesDeNovo = () => true; Game.startTakeOver('f1', 2023, 'Verstappen'); UI.limparFila(); UI.close();`);
  const r = J.run('Passado.atual()');
  ok(!!r && r.pessoa && r.pessoa.nome === 'Max Verstappen', 'o nome do grid vira a pessoa do banco (Max, não o Jos)');
  const f1 = r.porSerie.f1;
  ok(f1.titulos === 2 && f1.wins === 35 && f1.provas === 163 && f1.temporadas === 8 && f1.de === 2015 && f1.ate === 2022,
     `F1 antes de 2023: 2 títulos, 35 vitórias, 163 provas, 8 temporadas (${f1.titulos}/${f1.wins}/${f1.provas}/${f1.temporadas})`);
  const f3 = r.linhas.find(l => l.ano === 2014);
  ok(f3 && !f3.topo && f3.pos === 3 && f3.wins == null && f3.provas == null, 'a F3 de 2014 entra com a posição (3º), sem inventar vitórias nem provas');
  ok(r.linhas.every(l => l.ano < 2023), 'nada do ano em que você assume, nem depois, entra no passado');
  ok(J.run('S.career.wins === 0 && S.career.titles === 0 && S.career.gps === 0'), 'o S.career do save guarda só o que é seu (a simulação não muda)');
  const c0 = J.run('Passado.carreira(S.career)');
  ok(c0.titles === 2 && c0.wins === 35 && c0.gps === 163 && c0.seasons === 9 && c0.porSerie.f1.wins === 35 && c0.porSerie.f1.titles === 2,
     `a carreira que as telas mostram já chega somada: ${c0.titles} títulos, ${c0.wins} vitórias, ${c0.gps} provas, ${c0.seasons} temporadas`);
  ok(J.run('S.vPassado') === 1, 'o save marca a versão do passado');

  const e0 = J.run('(() => { const e = Engine.estatisticas(); const f = e.grupos.find(g => g.topo && g.sk === "f1"); return { f, total: e.total, n: e.linhas.length, base: e.grupos.find(g => g.rot === "Categorias de base") }; })()');
  ok(e0.f && e0.f.wins === 35 && e0.f.largadas === 163 && e0.f.titulos === 2 && e0.f.temporadas === 8 && e0.f.de === 2015,
     'estatísticas completas: a linha da F1 já soma 2015–2022 (35 vitórias, 163 provas, 2 títulos)');
  ok(e0.f.podiums === '—' && e0.base && e0.base.wins === '—' && e0.total.temporadas === 9,
     'o que o banco não tem fica "—", não zero; 9 temporadas no total');
  J.run('UI.estatisticas()');
  const html = J.E('modal').innerHTML;
  ok(/Inclui a carreira real até 2022/.test(html) && />35</.test(html) && />163</.test(html) && /Van Amersfoort/.test(html),
     'a tela mostra os números somados, as temporadas de antes e de onde eles vêm');
  J.run('UI.close(); UI.records()');
  const rec0 = J.E('modal').innerHTML;
  ok(/<b>35<\/b><span>Vitórias/.test(rec0) && /<b>163<\/b><span>Provas/.test(rec0) && /Pódios por prova<\/span><b>0\.0%/.test(rec0),
     '"Números da carreira" somados, sem dividir pódios só seus pelas provas de antes');
  J.run('UI.close()');
  ok(/2× campeão mundial/.test(J.run('UI.trophyList()')) && J.run('S.career.titles') === 0, 'a ficha da tela antiga também soma, sem gravar no S.career');

  /* real: no lugar do Max Verstappen da lista, você, com o que ele tinha */
  const real0 = J.run(`(() => { const r = rankingLendas('f1', { name: S.driver.name, cc: S.driver.cc, porSerie: S.career.porSerie || null, titles: S.career.titles, wins: S.career.wins, serie: 'f1' });
    return { status: r.status, eu: r.eu, max: r.lista.filter(x => /Verstappen/.test(x.nome)).length }; })()`);
  ok(real0.status === 'correu' && real0.eu && real0.eu.t === 2 && real0.eu.v === 35 && real0.max === 1,
     `história real: você entra com 2 títulos e 35 vitórias, sem um segundo Verstappen na lista (${JSON.stringify(real0.eu)})`);

  temporadaNaPrincipal(J);
  const c = J.run('({ wins: S.career.wins, titles: S.career.titles, gps: S.career.gps, seasons: S.career.seasons })');
  ok(c.gps > 0 && c.seasons === 1, `2023 jogado com você: ${c.gps} provas, ${c.wins} vitórias, ${c.titles} título(s)`);
  const T = J.run('Passado.carreira(S.career)');
  ok(T.wins === 35 + c.wins && T.titles === 2 + c.titles && T.gps === 163 + c.gps && T.seasons === 9 + 1,
     `a carreira soma por cima: ${T.titles} títulos, ${T.wins} vitórias, ${T.gps} provas, ${T.seasons} temporadas`);
  const g1 = J.run('Engine.estatisticas().grupos.find(g => g.topo && g.sk === "f1")');
  ok(g1.wins === 35 + c.wins && g1.largadas === 163 + c.gps && g1.temporadas === 9 && typeof g1.podiums === 'number',
     `e a linha da F1 nas estatísticas também (${g1.wins} vitórias, ${g1.largadas} provas; pódios só os seus: ${g1.podiums})`);
  ok(J.run('Passado.atual().porSerie.f1.wins') === 35, 'o passado não muda depois de jogar');

  /* o ranking deste save: a sua linha leva os títulos e vitórias reais de antes */
  const u = J.run(`(() => { const u = rankingUniverso('f1', { name: S.driver.name }); return { eu: u.eu, ver: u.linhas.filter(x => x.nome === 'Verstappen').length,
    ham: (u.linhas.find(x => x.nome === 'Hamilton') || {}).tAntes }; })()`);
  ok(u.eu && u.eu.tAntes === 2 && u.eu.vAntes === 35 && u.eu.t === 2 + c.titles && u.eu.v >= 35 + c.wins && u.ver === 1,
     `neste save: uma linha só para você, com os 2 títulos e as 35 vitórias de antes (${JSON.stringify(u.eu)})`);
  ok(u.ham === 7, 'os outros continuam com o que tinham (Hamilton com 7 títulos antes de 2023)');

  /* save de antes desta versão: sem o passado, ele é montado ao abrir */
  J.run('Game.save()');
  const velho = JSON.parse(store.vdo_save);
  delete velho.passado; delete velho.vPassado;
  const store2 = { vdo_save: JSON.stringify(velho) };
  const N = H.carregar({ silencioso: true, seed: 6, store: store2 });
  N.run('Game.continueSave(); UI.limparFila(); UI.close();');
  const m = N.run('Passado.atual()');
  ok(N.run('S.vPassado') === 1 && m && m.porSerie.f1.wins === 35 && m.porSerie.f1.titulos === 2 && m.porSerie.f1.provas === 163,
     'save antigo de carreira real abre e ganha o passado (35 vitórias, 2 títulos, 163 provas)');
  ok(N.run('S.career.wins') === c.wins && N.run('S.career.gps') === c.gps, 'e o que foi feito com você continua igual');
  H.temporada(N);
  ok(N.run('S.career.seasons') === 2, 'o save migrado segue jogando');

  /* galeria: a carreira encerrada leva o total e o passado identificado */
  J.run('Game.endCareer("aposentou"); UI.limparFila(); UI.close();');
  const hall = JSON.parse(store.vdo_hall || '[]').find(x => x.name === 'Verstappen');
  ok(hall && hall.antes && hall.antes.wins === 35 && hall.titles === 2 + c.titles && hall.wins === 35 + c.wins && hall.porSerie.f1.wins === 35 + c.wins,
     `na galeria: ${hall && hall.titles} títulos e ${hall && hall.wins} vitórias, com o que veio de antes guardado à parte`);
  const real = J.run(`(() => { const r = rankingLendas('f1', S.fimRec); return { eu: r.eu, max: r.lista.filter(x => /Verstappen/.test(x.nome)).length }; })()`);
  ok(real.eu && real.eu.t === 2 + c.titles && real.eu.v === 35 + c.wins && real.max === 1, 'o ranking real da carreira encerrada não soma duas vezes');
}
{
  console.log('Senna, cenário de 1994');
  const J = H.carregar({ silencioso: true, seed: 5 });
  J.run(`Saves.antesDeNovo = () => true; Game.startScenario('senna94'); UI.limparFila(); UI.close();`);
  const r = J.run('Passado.atual()');
  ok(r && r.porSerie.f1.titulos === 3 && r.porSerie.f1.wins === 41 && r.porSerie.f1.de === 1984 && r.porSerie.f1.ate === 1993,
     'chega a 1994 com os 3 títulos e as 41 vitórias de 1984 a 1993');
  ok(r.linhas.some(l => l.cid === 'f3_brit' && l.ano === 1983 && l.titulo), 'e com o título da F3 Britânica de 1983');
}
{
  console.log('NASCAR: onde o banco não tem o dado, fica sem');
  const J = H.carregar({ silencioso: true, seed: 5 });
  J.run(`Saves.antesDeNovo = () => true; Game.startTakeOver('nascar', 1995, 'Dale Earnhardt'); UI.limparFila(); UI.close();`);
  const r = J.run('Passado.atual()');
  const x = r && r.porSerie.nascar;
  ok(x && x.titulos === 7 && x.provas == null, 'Dale Earnhardt chega a 1995 com 7 títulos; provas da Copa não estão no banco e ficam sem número');
  ok(x && x.winsParcial && r.linhas.some(l => l.topo === 'nascar' && l.wins == null), 'os anos sem o vencedor corrida a corrida ficam marcados, não zerados');
}
{
  console.log('Carreira criada do zero e piloto fora do banco');
  const J = H.carregar({ silencioso: true, seed: 5 });
  H.novaCarreira(J, { era: 7, ano: 2023, idade: 17, rapido: true });
  ok(J.run('S.passado') == null && J.run('Passado.atual()') === null, 'piloto novo não ganha passado');
  ok(J.run('Engine.estatisticas().passado') === null, 'nem bloco de antes nas estatísticas');
  const vazio = J.run(`Passado.montar('f1', 'Ninguém Inventado', 2023)`);
  ok(vazio.pessoa === null && vazio.temporadas.length === 0, 'nome que o banco não conhece: passado vazio, nada inventado');
}

console.log(`\n${n - falhas}/${n} verificações passaram`);
if(falhas) process.exitCode = 1;
