/* As escalações reais da F1 e da IndyCar, refeitas etapa por etapa
   (dados/escalacoes.js): cada piloto na equipe em que fez mais etapas, e cada
   equipe com os carros que tinha na maior parte do ano.
   — 2014: a Marussia com Bianchi e Chilton, a Williams com Bottas e Massa;
   — 2016: a Toro Rosso com Sainz e Kvyat, a Red Bull com Ricciardo e Verstappen;
   — 2020: a Williams com Russell e Latifi (uma corrida pela Mercedes não o tira de lá);
   — 1994: a Lotus com Herbert e Zanardi; 1988: a Coloni com um carro só;
   — IndyCar 2008: o Meira na Panther (a corrida fora do campeonato pela Foyt não conta);
   — IndyCar 2019: a Penske com três carros e a Andretti com quatro;
   — IndyCar 2021: a A.J. Foyt com Bourdais e Kellett; a Rahal com Rahal e Sato e o
     terceiro carro do Ferrucci, que correu em 9 das 16 etapas; a Meyer Shank com um
     carro (o do Castroneves correu 6 das 16);
   — o cenário A.J. Foyt 2021 começa com Bourdais e Kellett;
   — nenhum nome inventado no grid de um ano documentado.
   Uso: node testes/escalacoes-reais.js   Não modifica arquivos nem saves. */
const H = require('./base');
let falhas = 0, n = 0;
const ok = (c, m) => { n++; if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };

/* o grid que o modo chefe monta, equipe por equipe (sem contratar ninguém) */
function grid(sk, ano, eq){
  const J = H.carregar({ silencioso: true, seed: 3 });
  return J.run(`(() => { const l = eraOfSeries(${ano}, '${sk}').teams.map((t, i) => [i, Engine.resolveTeam(t, i, ${ano}, '${sk}')]).filter(x => x[1]);
    const alvo = l.find(x => x[1].name === '${eq}') || l[0];
    Chefe.novo({ modo:'assumir', sk:'${sk}', ano:${ano}, idx: alvo[0], chefe:{ nome:'T', cc:'BR' }, realismo:true });
    const inv = C.inv; while(inv.decisoes.length) Chefe.resolverSaida(inv.decisoes[0], 'segurar');
    if(Chefe.ehF1() && !C.motor.proprio && !C.motor.nome) Chefe.escolherMotor(Chefe.motorObrigado().nome, 1);
    Chefe.comecarTemporada(); UI.limparFila(); UI.close();
    const sea = C.temporada; Chefe.escalar(sea);
    const por = {}; sea.field.filter(f => !f.nosso || f.ativo).forEach(f => { const t = sea.teams.find(x => x.id === f.teamId); (por[t ? t.name : f.teamId] = por[t ? t.name : f.teamId] || []).push(f.name); });
    const reais = new Set((Hist.temporada(campDaCat(C.cat, ${ano}), ${ano}) || { inscritos: [] }).inscritos.map(i => i.name));
    const inventados = sea.field.filter(f => (!f.nosso || f.ativo) && !reais.has(f.name) && !eraOfSeries(${ano}, '${sk}').pilots.some(p => p[0] === f.name)).map(f => f.name);
    return { por, inventados }; })()`);
}
const dupla = (g, eq, nomes) => { const l = (g.por[eq] || []).slice().sort(); return l.join(',') === nomes.slice().sort().join(','); };

const g14 = grid('f1', 2014, 'Ferrari');
ok(dupla(g14, 'Marussia', ['J. Bianchi', 'Chilton']), `F1 2014: Marussia com ${(g14.por.Marussia || []).join(' e ')}`);
ok(dupla(g14, 'Williams', ['Bottas', 'Massa']), `F1 2014: Williams com ${(g14.por.Williams || []).join(' e ')}`);
ok(!g14.inventados.length, `F1 2014: ninguém inventado no grid (${g14.inventados.join(', ') || 'nenhum'})`);
const g16 = grid('f1', 2016, 'Mercedes');
ok(dupla(g16, 'Toro Rosso', ['Sainz', 'Kvyat']), `F1 2016: Toro Rosso com ${(g16.por['Toro Rosso'] || []).join(' e ')}`);
ok(dupla(g16, 'Haas', ['Grosjean', 'Gutiérrez']), `F1 2016: Haas com ${(g16.por.Haas || []).join(' e ')}`);
ok(dupla(g16, 'Red Bull', ['Ricciardo', 'Verstappen']), `F1 2016: Red Bull com ${(g16.por['Red Bull'] || []).join(' e ')}`);
const g20 = grid('f1', 2020, 'Ferrari');
ok(dupla(g20, 'Williams', ['Russell', 'Latifi']), `F1 2020: Williams com ${(g20.por.Williams || []).join(' e ')}`);
const g94 = grid('f1', 1994, 'Pacific');
ok(dupla(g94, 'Lotus', ['Herbert', 'Zanardi']), `F1 1994: Lotus com ${(g94.por.Lotus || []).join(' e ')}`);
ok(dupla(g94, 'Ligier', ['Panis', 'Bernard']), `F1 1994: Ligier com ${(g94.por.Ligier || []).join(' e ')}`);
const g88 = grid('f1', 1988, 'McLaren');
ok(dupla(g88, 'Coloni', ['Tarquini']), `F1 1988: Coloni com um carro só (${(g88.por.Coloni || []).join(', ')})`);
const g08 = grid('indy', 2008, 'Penske');
ok(dupla(g08, 'Panther', ['Meira']), `IndyCar 2008: Panther com ${(g08.por.Panther || []).join(' e ')}`);
ok(dupla(g08, 'Foyt', ['Manning']), `IndyCar 2008: Foyt com ${(g08.por.Foyt || []).join(' e ')}`);
const g19 = grid('indy', 2019, 'Juncos');
ok(dupla(g19, 'Penske', ['Newgarden', 'Pagenaud', 'Power']), `IndyCar 2019: Penske com ${(g19.por.Penske || []).join(', ')}`);
ok(dupla(g19, 'Andretti', ['Rossi', 'Hunter-Reay', 'M. Andretti', 'Veach']), `IndyCar 2019: Andretti com ${(g19.por.Andretti || []).join(', ')}`);
ok(dupla(g19, 'A.J. Foyt', ['Kanaan', 'Matheus Leist']), `IndyCar 2019: A.J. Foyt com ${(g19.por['A.J. Foyt'] || []).join(' e ')}`);
const gi = grid('indy', 2021, 'Penske');
ok(dupla(gi, 'A.J. Foyt', ['Bourdais', 'Dalton Kellett']), `IndyCar 2021: A.J. Foyt com ${(gi.por['A.J. Foyt'] || []).join(' e ')}`);
ok(dupla(gi, 'Rahal Letterman Lanigan', ['Rahal', 'Sato', 'Ferrucci']), `IndyCar 2021: Rahal com ${(gi.por['Rahal Letterman Lanigan'] || []).join(', ')}`);
ok(dupla(gi, 'Meyer Shank', ['Jack Harvey']), `IndyCar 2021: Meyer Shank com ${(gi.por['Meyer Shank'] || []).join(' e ')}`);

/* o cenário */
{
  const J = H.carregar({ silencioso: true, seed: 2 });
  const r = J.run(`(() => { Cenario.iniciar('foyt21', { nome:'T', cc:'BR' }); return Chefe.titulares().map(p => p.nome).sort().join(','); })()`);
  ok(r === 'Bourdais,Dalton Kellett', `o cenário A.J. Foyt 2021 começa com ${r.replace(',', ' e ')}`);
}

console.log(falhas ? `\n${falhas} de ${n} verificações falharam` : `escalações reais: ${n} verificações, tudo certo`);
process.exit(falhas ? 1 : 0);
