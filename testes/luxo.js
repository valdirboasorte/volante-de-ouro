/* Bens de luxo: idade, época, momento da carreira, compra repetida e saves antigos.
   Uso: node testes/luxo.js   Não modifica arquivos nem saves. */
const H = require('./base');
let falhas = 0, n = 0;
const ok = (c, m) => { n++; if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };

const J = H.carregar({ silencioso:true, seed: 11 });
H.novaCarreira(J, { era: 7, ano: 2020, idade: 10, cc: 'BR', modo: 'realista' });
const i = nome => J.run(`LUXOS.findIndex(x => x.n === ${JSON.stringify(nome)})`);
J.run('S.money.saldo = 50e6;');
{
  const antes = J.run('({ saldo:S.money.saldo, fama:S.driver.fame, moral:S.driver.morale })');
  J.run(`Game.comprarLuxo(${i('Carro esportivo')}); UI.limparFila(); UI.close();`);
  const depois = J.run('({ saldo:S.money.saldo, fama:S.driver.fame, moral:S.driver.morale, luxo:S.money.luxo.slice() })');
  ok(depois.saldo === antes.saldo && depois.luxo.length === 0 && depois.fama === antes.fama, 'aos 10 anos a compra é recusada na própria função, não só na tela');
  const m = J.run(`luxoDisponivel(LUXOS[${i('Lancha')}]).motivo`);
  ok(/18 anos/.test(m), 'a tela explica o porquê: ' + m);
}
{
  J.run('S.driver.age = 19; S.catIdx = 0;');
  const mon = J.run(`luxoDisponivel(LUXOS[${i('Apartamento em Mônaco')}])`);
  ok(!mon.ok && /kart/.test(mon.motivo), 'adulto ainda no kart: Mônaco espera o profissional');
  const heli = J.run(`(S.driver.fame = 10, luxoDisponivel(LUXOS[${i('Helicóptero')}]))`);
  ok(!heli.ok, 'aos 19, sem fama, nada de helicóptero');
  const antes = J.run('({ fama:S.driver.fame, moral:S.driver.morale, saldo:S.money.saldo })');
  J.run(`Game.comprarLuxo(${i('Relógio suíço')}); UI.limparFila(); UI.close();`);
  const meio = J.run('({ fama:S.driver.fame, moral:S.driver.morale, saldo:S.money.saldo })');
  ok(meio.saldo === antes.saldo - 90e3 && meio.fama === Math.min(100, antes.fama + 2), 'adulto compra o relógio e ganha a fama uma vez');
  J.run(`Game.comprarLuxo(${i('Relógio suíço')}); Game.comprarLuxo(${i('Relógio suíço')}); UI.limparFila(); UI.close();`);
  const fim = J.run('({ fama:S.driver.fame, moral:S.driver.morale, saldo:S.money.saldo, n:S.money.luxo.filter(x => x === "Relógio suíço").length })');
  ok(fim.saldo === meio.saldo && fim.fama === meio.fama && fim.moral === meio.moral && fim.n === 1, 'comprar de novo não cobra nem dá fama ou moral outra vez');
}
{
  /* época: sem kart e sem helicóptero particular antes de 1960 */
  const K = H.carregar({ silencioso:true, seed: 12 });
  H.novaCarreira(K, { era: 0, ano: 1950, idade: 30, cc: 'GB', modo: 'realista' });
  K.run('S.money.saldo = 50e6; S.driver.fame = 90;');
  const kd = K.run('luxoDisponivel(LUXOS.find(x => x.n === "Kartódromo próprio"))');
  const hd = K.run('luxoDisponivel(LUXOS.find(x => x.n === "Helicóptero"))');
  ok(K.run('S.year') < 1960 && !kd.ok && !hd.ok, `em ${K.run('S.year')} não há kartódromo nem helicóptero à venda`);
}
{
  /* save antigo: bens já registrados ficam, mesmo comprados por um menor */
  J.run('S.driver.age = 12; S.money.luxo = ["Lancha", "Lancha", "Iate antigo"];');
  const l = J.run(`({ lancha: luxoDisponivel(LUXOS[${i('Lancha')}]), luxo: S.money.luxo.slice() })`);
  ok(l.lancha.tem && l.luxo.length === 3, 'save antigo: os bens continuam registrados e aparecem como seus');
  J.run('UI.financas();');
  ok(J.run('true'), 'a tela de finanças abre com bens antigos e desconhecidos');
}

console.log(falhas ? falhas + ' falha(s) de ' + n : `luxo: ${n} verificações, tudo certo`);
if(falhas) process.exitCode = 1;
