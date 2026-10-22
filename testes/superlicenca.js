/* A superlicença pela tabela real da FIA de cada ano:
   — 2016 (anúncio de jan/2015), 2017 (revisão de jun/2016), 2018 (Conselho Mundial de set/2017)
     e 2019 em diante (Apêndice L: F3 da FIA, Fórmula Regional);
   — três temporadas antes da licença; de 2021 a 2023, os três melhores de quatro anos;
   — a carreira de piloto usa o campeonato real de cada temporada (a "Fórmula 3" é a F3 Europeia até 2018);
   — no modo chefe, quem a história põe na F1 está habilitado; quem não tem os 40 pontos
     não pode ser titular, e a temporada não começa com ele no carro.
   Uso: node testes/superlicenca.js   Não modifica arquivos nem saves. */
const H = require('./base');
let falhas = 0, n = 0;
const ok = (c, m) => { n++; if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };
const J = H.carregar({ silencioso: true, seed: 7 });
const pts = (id, anoRes, pos, anoLic) => J.run(`Engine.slPontosTemporada('${id}', ${anoRes}, ${pos}, ${anoLic})`);

/* as tabelas */
ok(pts('gp2', 2015, 1, 2016) === 50, 'licença de 2016: campeão da GP2 leva 50');
ok(pts('f3_euro_fia', 2015, 1, 2016) === 40 && pts('f4_italia', 2015, 1, 2016) === 10, 'licença de 2016: F3 Europeia 40 e F4 10 para o campeão');
ok(pts('fr_eurocup', 2015, 1, 2016) === 5 && pts('fr_eurocup', 2016, 1, 2017) === 10, 'Fórmula Renault 2.0: 5 em 2016, 10 depois da revisão de 2016');
ok(pts('wsr', 2016, 1, 2017) === 35 && pts('wsr', 2017, 1, 2018) === 20, 'Fórmula V8 3.5: 35 em 2017, 20 a partir de 2018');
ok(pts('f2', 2017, 3, 2018) === 40 && pts('f2', 2017, 4, 2018) === 30, 'F2: 40 para os três primeiros, 30 para o quarto');
ok(pts('f3_euro_fia', 2017, 1, 2018) === 30 && pts('f3_euro_fia', 2017, 4, 2018) === 10, 'F3 Europeia na tabela de 2018: 30 e 10 para o quarto');
ok(pts('f3', 2020, 2, 2021) === 25 && pts('frec', 2021, 1, 2022) === 25, 'F3 da FIA: 25 para o vice; Fórmula Regional: 25 para o campeão');
ok(pts('f4_brit', 2018, 1, 2019) === 12 && pts('f4_brit', 2018, 8, 2019) === 0, 'F4 nacional na tabela de 2018: 12 para o campeão, nada para o oitavo');
ok(pts('indy', 2026, 3, 2027) === 25 && pts('indy', 2025, 3, 2026) === 20, 'IndyCar: tabela nova a partir dos resultados de 2026');
ok(pts('ff_brit', 2018, 1, 2019) === 0 && pts('stock_car', 2020, 1, 2021) === 0, 'campeonato fora da lista não dá pontos');

/* a janela e a regra da pandemia */
const conta = (temps, lic) => J.run(`Engine.slConta(${JSON.stringify(temps)}, ${lic}, []).total`);
const t3 = [{ ano: 2015, id: 'f3_euro_fia', pos: 1 }, { ano: 2016, id: 'gp2', pos: 9 }, { ano: 2017, id: 'f2', pos: 10 }, { ano: 2018, id: 'f2', pos: 9 }];
ok(conta(t3, 2019) === 3 + 3 + 4, 'licença de 2019: só as três temporadas anteriores (2016 a 2018)');
const covid = [{ ano: 2018, id: 'f2', pos: 1 }, { ano: 2019, id: 'f2', pos: 20 }, { ano: 2020, id: 'f2', pos: 20 }, { ano: 2021, id: 'f2', pos: 20 }];
ok(conta(covid, 2022) === 40 && conta(covid, 2024) === 0, 'licença de 2022: vale o melhor ano entre quatro (pandemia); em 2024, não');

/* a carreira de piloto: o nome da categoria vira o campeonato real */
J.run(`S = { series:'f1', year:2018, history:[
  { year:2016, cat:'Fórmula 3', pos:2, races:30 },
  { year:2017, cat:'Fórmula 3', pos:1, races:30 },
  { year:2018, cat:'Fórmula 2', pos:5, races:24 } ], fp1Hist:[2018, 2018], ladder:['Fórmula 3','Fórmula 2','Fórmula 1'] };
  Engine.topCat = () => 'Fórmula 1';`);
const c = J.run('Engine.superlicencaConta(2019)');
ok(c.total === 25 + 30 + 20 + 2, `carreira: F3 Europeia 2016 (2º) + 2017 (1º) + F2 2018 (5º) + 2 treinos = ${c.total}`);

/* o modo chefe */
const C2 = H.carregar({ silencioso: true, seed: 7 });
C2.run(require('./chefe-comum'));
C2.run(`(() => { const idx = eraOfSeries(2019, 'f1').teams.findIndex((t, i) => { const r = Engine.resolveTeam(t, i, 2019, 'f1'); return r && r.name === 'Williams'; });
  Chefe.novo({ chefe:{ nome:'T', cc:'BR' }, realismo:true, modo:'assumir', sk:'f1', ano:2019, idx }); })()`);
ok(C2.run(`Chefe.titulares().every(p => Chefe.superlicenca(p).ok) && Chefe.pendencias().every(t => t.indexOf('superlicença') < 0)`),
  'chefe: os titulares que a história pôs no carro têm a licença');
const semSL = C2.run(`(() => { const p = Chefe.novoPiloto({ nome:'Novato Sem Pontos', cc:'BR', nasc:2000, real:false, hab:70, pot:80, papel:'titular', carro:0 });
  const t = Chefe.titulares(); t[0].papel = 'teste'; C.pilotos.push(p);
  return { sl: Chefe.superlicenca(p), falta: Chefe.pendencias() }; })()`);
ok(!semSL.sl.ok && semSL.falta.some(t => /Novato Sem Pontos sem superlicença/.test(t)), 'chefe: titular sem os 40 pontos trava o começo da temporada');
ok(C2.run(`Chefe.superlicenca({ nome:'Qualquer', orig:'base' }, 2015).ok`), 'chefe: antes de 2016 não há exigência');
const dv = C2.run(`Chefe.superlicenca({ nome:'de Vries', real:true, orig:'base' }, 2019)`);
ok(dv.ok && dv.total === 43, `piloto real pelo banco histórico: de Vries para 2019 = GP3 2016 (6º) + F2 2017 (7º) + F2 2018 (4º) = ${dv.total}`);

console.log(falhas ? `${falhas} de ${n} verificações falharam` : `superlicença: ${n} verificações, tudo certo`);
process.exit(falhas ? 1 : 0);
