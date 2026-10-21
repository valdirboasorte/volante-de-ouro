/* Idade e caminho de entrada pela época e pelo país.
   — sem kart (anos 50, ou país onde ele ainda não chegou): corridas regionais de carros, a partir dos 16;
   — com kart: 12 anos nos anos 60, 10 de 1970 a 1984, 8 desde 1985;
   — a criação mostra o mínimo e o motivo, e a largada respeita;
   — quem entra mais tarde ainda evolui e chega a algum lugar;
   — save antigo criado com outra regra continua abrindo.
   Uso: node testes/entrada-epoca.js [carreiras=16]   Não modifica arquivos nem saves. */
const H = require('./base');
const { carreira } = require('./balanco');
const N = +(process.argv[2] || 16);
let falhas = 0, n = 0;
const ok = (c, m) => { n++; if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };

const J = H.carregar({ silencioso:true });
const e = (ano, cc) => J.run(`Engine.entradaCarreira(${ano}, '${cc}')`);
const escada = (ano, cc) => J.run(`resolveLadder(eraOfSeries(${ano}, 'f1').ladder, '${cc}', ${ano})`);
ok(!e(1955, 'GB').kart && e(1955, 'GB').idadeMin === 16 && escada(1955, 'GB')[0] === 'Corridas Regionais', '1955: sem kart, a carreira começa nas corridas regionais aos 16');
ok(e(1962, 'GB').kart && e(1962, 'GB').idadeMin === 12 && escada(1962, 'GB')[0] === 'Kart Regional', '1962 na Inglaterra: kart a partir dos 12');
ok(!e(1962, 'BR').kart && escada(1962, 'BR')[0] === 'Corridas Regionais', '1962 no Brasil: o kart ainda não chegou, corridas regionais');
ok(e(1968, 'BR').kart && e(1968, 'BR').idadeMin === 12, '1968 no Brasil: kart, ainda sem categoria infantil (12 anos)');
ok(e(1976, 'BR').idadeMin === 10 && e(1992, 'BR').idadeMin === 8 && e(2024, 'JP').idadeMin === 8, 'kart a partir dos 10 de 1970 a 1984, dos 8 desde 1985');
ok(!escada(1955, 'GB').some(c => /Kart/.test(c)) && !escada(1962, 'BR').some(c => /Kart/.test(c)), 'nenhum campeonato de kart antes de existir naquele lugar');
ok(J.run(`Engine.idadeMinCamp({ nv:0, id:'kart_x', n:'Kart' }, 1966)`) === 12 && J.run(`Engine.idadeMinCamp({ nv:0, id:'kart_x', n:'Kart' }, 1995)`) === 8, 'campeonatos de kart do catálogo pedem a idade da época');

/* a criação: o mínimo e o motivo aparecem, e a largada não aceita menos */
{
  const K = H.carregar({ silencioso:true });
  K.run(`UI.eraSel = 0; UI.year = 1955; UI.country = 'BR'; UI.serie = 'f1'; document.getElementById('inAge').value = '8'; UI.ageChanged();`);
  const dica = K.E('ageHint').innerHTML;
  ok(K.run('UI.age') === 16 && /16 anos/.test(dica) && /corridas regionais/.test(dica), 'criação em 1955: o formulário sobe para 16 anos e explica por quê');
  H.novaCarreira(K, { era: 0, ano: 1955, idade: 8, cc: 'BR', rapido: true });
  ok(K.run('S.driver.age') === 16 && K.run('S.season.cat') === 'Corridas Nacionais' || K.run('S.season.cat') === 'Corridas Regionais', `e a carreira começa com ${K.run('S.driver.age')} anos, em ${K.run('S.season.cat')}`);
  ok(K.run('S.driver.peak') >= 27 || K.run('S.driver.lastAge') >= 33, 'carreira dos anos 50: auge e fim mais tarde');
}

/* entrada tardia ainda evolui */
{
  const rs = [];
  for(const idade of [16, 18]) for(let i = 0; i < N; i++){
    try { rs.push(carreira({ ano: 1955, idade, cc: 'GB' }, 9000 + idade * 100 + i)); } catch(err){ console.log('ERRO', err.message.split('\n')[0]); }
  }
  const f1 = rs.filter(r => r.f1).length / rs.length;
  const evolui = rs.filter(r => r.ovrMax >= 60).length / rs.length;
  ok(rs.length === 2 * N && f1 >= .2 && f1 <= .95, `1955, entrando aos 16 e 18: ${Math.round(f1 * 100)}% chegam à F1`);
  ok(evolui >= .5, `${Math.round(evolui * 100)}% evoluem até pelo menos 60 de geral antes de parar`);
}

/* save antigo criado com 8 anos em 1960 continua abrindo */
{
  const K = H.carregar({ silencioso:true });
  K.run(`(() => { S = null; UI.eraSel = 1; UI.year = 1960; UI.country = 'GB'; })()`);
  H.novaCarreira(K, { era: 1, ano: 1962, idade: 12, cc: 'GB', rapido: true });
  K.run('S.driver.age = 8; Game.save();');
  const L = H.carregar({ silencioso:true, store: K.store });
  L.run('Game.continueSave(); UI.limparFila(); UI.close();');
  ok(L.run('S && S.driver.age') === 8, 'save antigo com idade que hoje não seria permitida abre igual');
}

console.log(falhas ? falhas + ' falha(s) de ' + n : `entrada por época: ${n} verificações, tudo certo`);
if(falhas) process.exitCode = 1;
