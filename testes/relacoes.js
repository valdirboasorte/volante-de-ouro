/* Relações: conversas de momento, assunto que descansa, uma conversa por pessoa
   a cada fim de semana, acaso que pesa o contexto, memória salva e relação que
   não exige ritual toda temporada.
   Uso: node testes/relacoes.js   Não modifica arquivos nem saves. */
const H = require('./base');
let falhas = 0, n = 0;
const ok = (c, m) => { n++; if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };

const J = H.carregar({ silencioso:true, seed: 5 });
H.novaCarreira(J, { era: 7, ano: 2022, idade: 24, rapido: false });
J.run('Engine.gente(); Engine.sincronizarGente();');

{
  /* mais de uma maneira viável de lidar com cada pessoa */
  const r = J.run(`(() => { const ruins = []; CONVERSAS.concat(CONVERSAS_JORNAL).forEach(c => PERSONA_KEYS.forEach(k => {
      const per = PERSONAS[k]; const v = c.ops.filter(o => per.odeia.indexOf(o.tom) < 0).length; if(v < 2) ruins.push(c.id + ':' + k); }));
    const porPapel = {}; CONVERSAS.concat(CONVERSAS_JORNAL).forEach(c => porPapel[c.papel] = (porPapel[c.papel] || 0) + 1);
    return { ruins, porPapel, total: CONVERSAS.length + CONVERSAS_JORNAL.length }; })()`);
  ok(r.ruins.length === 0, 'toda conversa tem ao menos dois caminhos que a personalidade da pessoa não rejeita' + (r.ruins.length ? ' — falta: ' + r.ruins.join(', ') : ''));
  ok(['eng','comp','rival','mentor','chefe','amigo'].every(k => r.porPapel[k] >= 3), `cada papel tem ao menos três conversas (${JSON.stringify(r.porPapel)})`);
}
{
  /* conversas ligadas ao que aconteceu */
  const r = J.run(`(() => { const sea = S.season, eng = Engine.pessoa('eng'), chefe = Engine.pessoa('chefe');
    sea.round = 6; sea.results = [{ pos: 9 }, { pos: 7 }, { pos: 2 }];
    S.falasFeitas = {}; S.falasTema = {}; S.falasN = {}; S.falasPessoa = {};
    const podio = { eng: Engine.conversasDe(eng).map(c => c.id), chefe: Engine.conversasDe(chefe).map(c => c.id) };
    sea.results = [{ pos: 14 }, { dnf: 'MEC' }, { pos: 16 }];
    const crise = { eng: Engine.conversasDe(eng).map(c => c.id), chefe: Engine.conversasDe(chefe).map(c => c.id) };
    sea.results = [{ pos: 6 }];
    const nada = { eng: Engine.conversasDe(eng).map(c => c.id), chefe: Engine.conversasDe(chefe).map(c => c.id) };
    return { podio, crise, nada }; })()`);
  ok(r.podio.eng[0] === 'eng_podio' && r.podio.chefe[0] === 'chefe_podio', 'depois de um pódio, a conversa do pódio vem primeiro com o engenheiro e com o chefe');
  ok(r.crise.eng.indexOf('eng_crise') >= 0 && r.crise.chefe.indexOf('chefe_crise') >= 0, 'três corridas ruins abrem a conversa de crise');
  ok(!r.nada.eng.some(id => /podio|crise/.test(id)) && !r.nada.chefe.some(id => /podio|crise/.test(id)), 'sem o momento, as conversas de momento não aparecem');
  ok([r.podio.eng, r.crise.eng, r.nada.eng].every(l => l.length <= 3), 'no máximo três assuntos de cada vez');
}
{
  /* repetição: uma conversa por pessoa no fim de semana; o assunto descansa; a mesma conversa demora mais a voltar */
  const r = J.run(`(() => { const sea = S.season, eng = Engine.pessoa('eng');
    S.falasFeitas = {}; S.falasTema = {}; S.falasN = {}; S.falasPessoa = {};
    sea.round = 8; sea.results = [{ pos: 6 }];
    const antes = Engine.conversasDe(eng).map(c => c.id);
    const c = CONVERSAS.find(x => x.id === 'eng_abrir');
    UI._fala = { pid: eng.id, cid: 'eng_abrir' }; Game.escolherFala(0); UI.close();
    const mesma = Engine.conversasDe(eng).length, porque = Engine.porqueSemFala(eng);
    sea.round = 9; const r9 = Engine.conversasDe(eng).map(x => x.id);
    sea.round = 11; const r11 = Engine.conversasDe(eng).map(x => x.id);
    /* usada muitas vezes, a mesma conversa espera mais */
    S.falasN[eng.id + '|eng_abrir'] = 8; S.falasFeitas[eng.id + '|eng_abrir'] = Engine.agoraFala() - 3; S.falasTema = {}; S.falasPessoa = {};
    const gasta = Engine.conversasDe(eng).some(x => x.id === 'eng_abrir');
    return { antes, mesma, porque, r9, r11, gasta, tema: c.tema || c.id }; })()`);
  ok(r.antes.indexOf('eng_abrir') >= 0 && r.mesma === 0 && /neste fim de semana/.test(r.porque), 'depois de conversar, a mesma pessoa espera o próximo fim de semana, e a tela diz por quê');
  ok(r.r9.indexOf('eng_abrir') < 0, 'na rodada seguinte, o mesmo assunto ainda descansa');
  ok(r.r11.indexOf('eng_abrir') >= 0, 'três rodadas depois, o assunto pode voltar');
  ok(!r.gasta, 'uma conversa repetida muitas vezes demora mais a voltar');
}
{
  /* o acaso pesa o contexto: boa leitura raramente dá no pior; má leitura raramente dá no melhor */
  const r = J.run(`(() => { const cont = ch => { const c = { otimo:0, bom:0, morno:0, ruim:0 }; for(let i = 0; i < 6000; i++) c[Engine.resolverFala(ch)]++; return c; };
    return { alta: cont(.78), baixa: cont(.28), meio: cont(.5) }; })()`);
  ok(r.alta.ruim / 6000 < .03 && r.alta.morno > 0, `leitura boa: pior resultado em ${(r.alta.ruim / 60).toFixed(1)}%, mas ainda há resposta morna (${(r.alta.morno / 60).toFixed(1)}%)`);
  ok(r.baixa.otimo / 6000 < .05 && r.baixa.bom + r.baixa.otimo > 0, `leitura ruim: melhor resultado em ${(r.baixa.otimo / 60).toFixed(1)}%, sem ser impossível`);
  const ch = J.run(`(() => { const eng = Engine.pessoa('eng'); const op = { tom:'resultado', base:.5, dim:'resp' };
    S.season.results = [{ pos: 2 }]; const bom = Engine.chanceFala(eng, op);
    S.season.results = [{ pos: 15 }, { pos: 14 }, { dnf: 'ACID' }]; const ruim = Engine.chanceFala(eng, op);
    eng.toms = { resultado: 'ruim' }; const lembrou = Engine.chanceFala(eng, op); eng.toms = {};
    return { bom, ruim, lembrou }; })()`);
  ok(ch.bom > ch.ruim + .15 && ch.lembrou < ch.ruim, 'falar de resultado depois de um pódio pesa mais do que numa fase ruim; e a pessoa lembra o tom que deu errado');
}
{
  /* reações sem conversa e relação estável */
  const r = J.run(`(() => { const chefe = Engine.pessoa('chefe'), eng = Engine.pessoa('eng');
    const a = { ...chefe.rel }; Engine.reagirGente({ pos: 1, gp: 'Teste' }); const b = { ...chefe.rel };
    chefe.rel.tens = 40; const c0 = { ...chefe.rel }; Engine.virarAnoGente(); const c1 = { ...chefe.rel };
    return { a, b, c0, c1, mem: (eng.mem || []).some(m => m.k === 'vitoria') }; })()`);
  ok(r.b.resp > r.a.resp && r.mem, 'uma vitória mexe com o chefe e fica na memória do engenheiro, sem conversa nenhuma');
  ok(r.c1.tens < r.c0.tens && r.c1.conf === r.c0.conf && r.c1.afeto === r.c0.afeto && r.c1.resp === r.c0.resp, 'a virada do ano baixa a tensão e não apaga confiança, afeto ou respeito');
}
{
  /* memória das pessoas sobrevive ao save */
  J.run(`(() => { const eng = Engine.pessoa('eng'); Engine.lembrar(eng, 'teste_mem', 'algo que ele não esquece', 2); eng.toms = { tecnico: 'otimo' }; Game.save(); })()`);
  const K = H.carregar({ silencioso:true, store: J.store });
  K.run('Game.continueSave(); UI.limparFila && UI.limparFila(); UI.close();');
  const m = K.run(`(() => { const eng = (S.gente || []).find(p => p.papel === 'eng' && !p.saiu); return eng ? { mem: eng.mem.some(x => x.k === 'teste_mem'), toms: eng.toms } : null; })()`);
  ok(m && m.mem && m.toms && m.toms.tecnico === 'otimo', 'memórias e tons aprendidos voltam ao abrir o save');
}

console.log(falhas ? falhas + ' falha(s) de ' + n : `relações: ${n} verificações, tudo certo`);
if(falhas) process.exitCode = 1;
