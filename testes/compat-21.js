/* Um save de chefe gravado pela versão de antes do Manager 2.1 (testes/fixtures,
   gerado com o index.html anterior: 2021, no meio da temporada, com peças em
   projeto, um garoto na academia e a punição de túnel antiga, a que ficava para
   sempre) abre e segue na versão nova:
   — continuar, correr o resto do ano, virar o ano e jogar mais duas temporadas;
   — os campos novos (moral com motivos, staff com idade, convites) nascem sozinhos;
   — a punição de túnel antiga acaba na primeira virada de ano;
   — os números da carreira e a galeria funcionam com o histórico antigo.
   Uso: node testes/compat-21.js   Não modifica arquivos nem saves. */
const H = require('./base');
const fs = require('fs'), path = require('path');
let falhas = 0, n = 0;
const ok = (c, m) => { n++; if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };

const antigo = fs.readFileSync(path.join(__dirname, 'fixtures', 'chefe-v5-2026-10.json'), 'utf8');
const store = { vdo_chefe: antigo };
const J = H.carregar({ silencioso: true, seed: 31, store });
J.run(require('./chefe-comum'));
const a = JSON.parse(antigo);
ok(a.v === 5 && a.fase === 'temporada' && a.penalTunel && a.penalTunelAno === a.ano, `a fixture é um save v5 de ${a.ano}, na etapa ${a.temporada.round + 1}, com a punição de túnel antiga`);

let erro = null;
try {
  J.run('UIC.continuar(); UI.limparFila(); UI.close();');
} catch(e){ erro = e.message; }
ok(!erro && J.run('C && C.chefe.nome') === 'Fixture', 'o save antigo abre na versão nova' + (erro ? ': ' + erro : ''));

const r = JSON.parse(J.run(`(() => { const sea = C.temporada; const out = {};
  out.pagina = (() => { try { ['visao','pilotos','desenvolvimento','financas','historico'].forEach(k => UIC.pagina(k)); return true; } catch(e){ return e.message; } })();
  while(sea.round < sea.calendar.length){ Chefe.correr(); }
  Chefe.fimDeTemporada(); Chefe.proximoAno(); UI.limparFila(); UI.close();
  out.penal = !!(C.penalTunel && C.penalTunelAno === C.ano);
  out.convites = Array.isArray(C.inv.convites);
  for(let k = 0; k < 2; k++){ __inverno(); __temporada(); Chefe.proximoAno(); UI.limparFila(); UI.close(); }
  out.ano = C.ano; out.hist = C.hist.length;
  out.moral = C.pilotos.some(p => Array.isArray(p.moralLog) && p.moralLog.length);
  out.staffIdade = Object.values(C.staff).filter(s => s && !s.real).every(s => s.nasc != null);
  out.reg = Chefe.registroCarreira('aposentou');
  out.nan = !Object.values(C.carro).concat([C.caixa, C.rep]).every(Number.isFinite);
  UIC.salvar(); out.tam = (localStorage.getItem('vdo_chefe') || '').length;
  __inverno(); UIC.recordes(); out.recordes = /Números da carreira/.test(document.getElementById('modal').innerHTML);
  UIC.fimCarreira('aposentou'); return JSON.stringify(out); })()`));
ok(r.pagina === true, 'as páginas do hub abrem com o save antigo' + (r.pagina !== true ? ': ' + r.pagina : ''));
ok(!r.penal, 'a punição de túnel antiga acabou na virada do ano (antes, ela ficava para sempre)');
ok(r.convites, 'o inverno da versão nova cria a lista de convites');
ok(r.ano === a.ano + 3 && r.hist === a.hist.length + 3 && !r.nan, `três temporadas depois (${r.ano}), o histórico segue (${r.hist} temporadas) e nenhum número virou NaN`);
ok(r.moral && r.staffIdade, 'a moral ganha motivos e o staff gerado ganha idade, sem migração manual');
ok(r.reg.anos === r.hist && r.reg.v >= 0 && r.reg.de === a.inicio, `o registro da carreira usa o histórico antigo (${r.reg.de}–${r.reg.ate}, ${r.reg.anos} temporadas)`);
ok(r.recordes, 'os números da carreira abrem');
const g = JSON.parse(store.vdo_chefe_hall || '[]');
ok(g.length === 1 && g[0].nome === 'Fixture' && !store.vdo_chefe, 'a carreira antiga, encerrada, vai para a galeria');

console.log(falhas ? `\n${falhas} de ${n} verificações falharam` : `\nsave de antes do Manager 2.1: ${n} verificações, tudo certo`);
process.exit(falhas ? 1 : 0);
