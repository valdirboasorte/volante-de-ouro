/* Vários jogos salvos:
   — começar uma carreira nova guarda a anterior (piloto e chefe, cada um no seu);
   — carregar um jogo guarda o atual e traz o escolhido, sem cópia dobrada;
   — o jogo carregado volta para o mesmo espaço na troca seguinte (não duplica);
   — apagar remove só o escolhido;
   — sem espaço no aparelho, a carreira anterior não se perde: a nova não começa;
   — carreira encerrada (save apagado) leva junto o espaço ligado a ela.
   Uso: node testes/saves.js   Não modifica arquivos nem saves. */
const H = require('./base');
let falhas = 0, n = 0;
const ok = (c, m) => { n++; if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };

const store = {};
const J = H.carregar({ silencioso: true, seed: 3, saves: true, store });
const nome = () => JSON.parse(store.vdo_save).driver.name;
const lista = () => J.run('Saves.jogos().guard.map(x => x.nome)');

H.novaCarreira(J, { era: 7, ano: 2020, idade: 14, nome: 'Alfa' });
J.run('Game.save()');
ok(!store.vdo_saves || !lista().length, 'a primeira carreira não guarda nada: não havia outra');

H.novaCarreira(J, { era: 7, ano: 2020, idade: 14, nome: 'Bravo' });
ok(nome() === 'Bravo' && JSON.stringify(lista()) === '["Alfa"]', 'carreira nova: a anterior (Alfa) fica guardada e Bravo está em andamento');

const idAlfa = J.run('Saves.jogos().guard[0].id');
J.run(`Saves.carregar('${idAlfa}'); UI.limparFila(); UI.close();`);
ok(nome() === 'Alfa' && J.run('S.driver.name') === 'Alfa', 'carregar Alfa: ela volta a ser o jogo em andamento');
ok(JSON.stringify(lista()) === '["Bravo"]', 'Bravo foi guardado ao trocar, e Alfa não aparece duas vezes');
ok(J.run(`Saves.ler().lista.find(x => x.id === '${idAlfa}').dado === null`), 'enquanto Alfa está em andamento, o espaço dela não guarda cópia dobrada');

H.novaCarreira(J, { era: 7, ano: 2020, idade: 14, nome: 'Charlie' });
ok(JSON.stringify(lista().slice().sort()) === '["Alfa","Bravo"]', 'a terceira carreira devolve Alfa ao mesmo espaço: dois guardados, sem repetir');

const idBravo = J.run(`Saves.jogos().guard.find(x => x.nome === 'Bravo').id`);
J.run(`Saves.apagar('${idBravo}', true); UI.limparFila(); UI.close();`);
ok(JSON.stringify(lista()) === '["Alfa"]' && nome() === 'Charlie', 'apagar Bravo não mexe em Alfa nem em Charlie');

/* o modo chefe tem o seu jogo em andamento e os seus guardados */
J.run(`Chefe.novo({ modo:'criar', ano:2015, chefe:{ nome:'T', cc:'BR' }, eq:{ nome:'Equipe Um', cor:'#123456', cc:'BR' } }); UIC.salvar();`);
J.run(`Saves.antesDeNovo('chefe'); Chefe.novo({ modo:'criar', ano:2015, chefe:{ nome:'T', cc:'BR' }, eq:{ nome:'Equipe Dois', cor:'#123456', cc:'BR' } }); UIC.salvar(); UI.limparFila(); UI.close();`);
ok(JSON.parse(store.vdo_chefe).eq.nome === 'Equipe Dois' && lista().indexOf('Equipe Um') >= 0 && nome() === 'Charlie', 'chefe: a equipe anterior fica guardada e o piloto em andamento não muda');

/* sem espaço: a nova carreira não começa e nada se perde */
const set = J.ctx.localStorage.setItem;
J.ctx.localStorage.setItem = (k, v) => { if(k === 'vdo_saves') throw new Error('QuotaExceededError'); return set(k, v); };
const antes = store.vdo_save;
J.E('inName').value = 'Delta';
J.run('Game.start(); UI.limparFila(); UI.close();');
ok(store.vdo_save === antes && nome() === 'Charlie', 'sem espaço no aparelho, Charlie continua salvo e Delta não começa');
J.ctx.localStorage.setItem = set;

/* a carreira encerrada apaga o save; o espaço ligado a ela vai junto */
const idAlfa2 = J.run(`Saves.jogos().guard.find(x => x.nome === 'Alfa').id`);
J.run(`Saves.carregar('${idAlfa2}'); UI.limparFila(); UI.close(); Store.del('vdo_save');`);
ok(J.run('Saves.ler().ativo.piloto') == null && lista().indexOf('Alfa') < 0 && lista().indexOf('Charlie') >= 0, 'carreira encerrada: o espaço de Alfa sai; Charlie, guardado na troca, fica');

console.log(falhas ? `${falhas} de ${n} verificações falharam` : `jogos salvos: ${n} verificações, tudo certo`);
process.exit(falhas ? 1 : 0);
