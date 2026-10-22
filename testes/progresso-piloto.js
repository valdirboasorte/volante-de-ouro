/* A carreira de piloto evolui, as decisões mudam a carreira e o save guarda tudo.
   Reproduz o relato "o piloto parou de evoluir e as decisões não mudam nada":
   com o aparelho sem espaço (vários jogos guardados), o salvamento falhava calado
   e "Continuar" voltava para o save velho, de antes da evolução e das decisões.
   Uso: node testes/progresso-piloto.js */
const H = require('./base');
let falhas = 0, n = 0;
const ok = (c, m) => { n++; if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };

function carreira(seed){
  const J = H.carregar({ silencioso: true, seed });
  const era = J.run('ERAS.reduce((k, e, i) => e.y <= 2005 ? i : k, 0)');
  H.novaCarreira(J, { era, ano: 2005, idade: 16, serie: 'f1' });
  return J;
}
const attrs = J => J.run('JSON.stringify(S.driver.attr)');

/* 1. treino, experiência e resultado mexem nos atributos, e a ficha mostra o valor novo */
{
  const J = carreira(2);
  const a0 = JSON.parse(attrs(J)), o0 = J.run('S.driver.ovr');
  for(let i = 0; i < 3; i++) H.temporada(J);
  const a1 = JSON.parse(attrs(J)), o1 = J.run('S.driver.ovr');
  ok(o1 > o0 && Object.keys(a0).some(k => a1[k] !== a0[k]), `três anos de base: geral ${o0} → ${o1}`);
  J.run('UI.render()');
  ok(J.E('drvCard').innerHTML.indexOf('<b>' + o1 + '</b>') >= 0, 'a ficha do piloto mostra o geral atual');
  /* o inverno de treino entra no crescimento: com preparação, o ganho do ano é maior */
  const ganho = prep => J.run(`(() => { const s = JSON.stringify(S);
    S.prep = ${prep ? '{ fis:3, sim:3, race:3, wet:3, eng:3 }' : 'Engine.prepZerado()'};
    const a = Object.assign({}, S.driver.attr); Engine.progress({ races: 10, pos: 5 });
    const g = Object.keys(a).reduce((t, k) => t + S.driver.attr[k] - a[k], 0); S = JSON.parse(s); return g; })()`);
  let com = 0, sem = 0;
  for(let i = 0; i < 60; i++){ com += ganho(true); sem += ganho(false); }
  ok(com > sem, `preparação de inverno aumenta a evolução (${com.toFixed(1)} com, ${sem.toFixed(1)} sem, 60 anos)`);
}

/* 2. a decisão aplica o efeito de verdade: atributo, moral, fama, equipe e dinheiro */
{
  const J = carreira(4);
  const r = J.run(`(() => {
    const antes = { pace: S.driver.attr.pace, moral: S.driver.morale, fama: S.driver.fame, rel: S.teamRel || 50, saldo: S.money ? S.money.saldo : 0, ovr: S.driver.ovr };
    S.driver.morale = 50; S.driver.fame = 40; S.teamRel = 50; antes.moral = 50; antes.fama = 40; antes.rel = 50;
    UI._ev = { id:'teste', ops:[{ e:{ pace: 3, moral: 6, fama: 5, teamRel: 4, dinheiro: 100000 } }] };
    Game.escolherEvento(0); UI.limparFila(); UI.close();
    return { antes, depois: { pace: S.driver.attr.pace, moral: S.driver.morale, fama: S.driver.fame, rel: S.teamRel, saldo: S.money ? S.money.saldo : 0, ovr: S.driver.ovr } };
  })()`);
  const a = r.antes, d = r.depois;
  ok(d.pace > a.pace && d.moral > a.moral && d.fama > a.fama && d.rel > a.rel, 'a escolha mexe em ritmo, moral, fama e relação com a equipe');
  ok(d.saldo === a.saldo + 100000, 'a escolha mexe no dinheiro');
  ok(d.ovr >= a.ovr, 'o geral é recalculado depois da escolha');
  /* 3. e o save guarda: sair e continuar traz o mesmo piloto */
  J.run('Game.save(); Game.continueSave();');
  const v = J.run('({ pace: S.driver.attr.pace, moral: S.driver.morale, saldo: S.money ? S.money.saldo : 0 })');
  ok(v.pace === d.pace && v.moral === d.moral && v.saldo === d.saldo, 'salvar e continuar mantém atributos, moral e dinheiro');
}

/* 4. aparelho sem espaço: o salvamento avisa e "Continuar" não volta ao save velho */
{
  const J = carreira(6);
  H.temporada(J);
  J.run('Game.save()');
  const velho = J.run('S.driver.attr.pace');
  /* o espaço acaba (outras carreiras guardadas ocupando o aparelho) */
  J.run(`(() => { const ls = localStorage, set = ls.setItem;
    ls.setItem = (k, v) => { if(String(v).length > 2000){ const e = new Error('cheio'); e.name = 'QuotaExceededError'; throw e; } return set(k, v); }; })()`);
  J.run('UI._toasts = []; const t0 = UI.toast; UI.toast = m => { UI._toasts.push(m); };');
  H.temporada(J);
  J.run(`UI._ev = { id:'teste', ops:[{ e:{ pace: 4, moral: 6 } }] }; Game.escolherEvento(0); UI.limparFila(); UI.close();`);
  const novo = J.run('S.driver.attr.pace');
  J.run('Game.goHome(); Game.continueSave(); UI.limparFila(); UI.close();');
  const depois = J.run('S.driver.attr.pace');
  ok(novo !== velho && depois === novo, `continuar depois de um salvamento que falhou traz a carreira atual (${velho} → ${novo}, abriu ${depois})`);
  ok(J.run('UI._toasts.some(m => /espaço/.test(m))'), 'o jogador fica sabendo que faltou espaço para salvar');
  ok(J.run('Store.ok') === true && J.run('Store.cheio') === true, 'aparelho cheio não é tratado como armazenamento bloqueado');
  /* sem espaço, começar outra carreira não joga a atual só para a memória */
  J.run('Saves.auto = true;');
  ok(J.run('Saves.antesDeNovo("piloto")') === false, 'sem espaço, a carreira nova não começa por cima da atual');
}

console.log(falhas ? falhas + ' falha(s) de ' + n : `progresso do piloto: ${n} verificações, tudo certo`);
if(falhas) process.exitCode = 1;
