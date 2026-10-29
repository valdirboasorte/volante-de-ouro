/* Atualização da comunidade (fase 4): dinheiro.
   — patrocinadores por país: a sua terra primeiro, a terra da equipe, o mercado da
     categoria, as multinacionais com fama, a aposta de fora, e o setor da época;
   — o dinheiro do piloto: investimento sem crédito duplo, bônus por vitória pago, o preço
     combinado da vaga cobrado, equipe pessoal com efeito, dia de teste com retorno decrescente;
   — o chefe: instalações envelhecem e se modernizam, empréstimo a 9% de verdade, teto com a
     operação na projeção, academia que muda de tamanho no inverno;
   — as telas novas em inglês, espanhol e japonês.
   Uso: node testes/comunidade4.js   Não modifica arquivos nem saves. */
'use strict';
const H = require('./base');
let falhas = 0, n = 0;
const ok = (c, m) => { n++; if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };
const carreira = (seed, o, extra) => { const J = H.carregar(Object.assign({ silencioso: true, seed }, extra || {})); H.novaCarreira(J, o); return J; };
const js = (J, code) => JSON.parse(J.run('JSON.stringify(' + code + ')'));
const REAL = { era: 7, ano: 2016, idade: 17, serie: 'f1', modo: 'realista' };

/* 1. patrocinadores por país */
{
  const contar = (cc, ano, extra) => { let tot = 0, daqui = 0; const nomes = [];
    for(let k = 0; k < 6; k++){
      const J = carreira(10 + k, Object.assign({}, REAL, { cc, ano: ano || 2016, nome: 'Piloto ' + cc + k }));
      const o = js(J, `(() => { ${extra || ''} return Engine.ofertasPatrocinio().map(o => ({ n: o.n, cc: o.cc, de: o.de, setor: o.setor })); })()`);
      o.forEach(x => { tot++; if(x.cc === cc) daqui++; nomes.push(x.n); });
    }
    return { tot, daqui, nomes }; };
  const gb = contar('GB'), it = contar('IT'), jp = contar('JP'), br = contar('BR');
  ok(gb.tot >= 10 && gb.daqui / gb.tot >= .7 && it.daqui / it.tot >= .7 && jp.daqui / jp.tot >= .7 && br.daqui / br.tot >= .7,
    `na base a marca vem da terra do piloto: Grã-Bretanha ${gb.daqui}/${gb.tot}, Itália ${it.daqui}/${it.tot}, Japão ${jp.daqui}/${jp.tot}, Brasil ${br.daqui}/${br.tot}`);
  const velhos = ['Café Serrano', 'Óticas Clara', 'Cimento Titã', 'Nordeste Bebidas', 'Grupo Amazonas'];
  ok(!gb.nomes.some(x => velhos.indexOf(x) >= 0) && gb.nomes.some(x => /Haulage|Insurance|Construction|Foods|Brewing|Lubricants|Bank|Apparel|Systems|Telecom|Energy/.test(x))
    && it.nomes.some(x => /Trasporti|Assicurazioni|Costruzioni|Alimentari|Birra|Lubrificanti|Banca|Moda|Tecnologie|Telecomunicazioni|Energia/.test(x)),
    `um britânico não recebe marca regional brasileira; o nome tem o jeito da língua (${gb.nomes.slice(0, 2).join(', ')}; ${it.nomes.slice(0, 2).join(', ')})`);
  /* a vitrine da principal, a fama e o mercado da categoria */
  const topo = de => { const out = []; for(let k = 0; k < 8; k++){
      const J = carreira(30 + k, { era: 7, ano: 2012, idade: 24, serie: de, modo: 'realista', cc: 'BR', nome: 'Topo ' + k });
      out.push(...js(J, `(() => { S.season.isTop = true; S.driver.fame = 85; S.history = [{ champion: true, pos: 1 }]; return Engine.ofertasPatrocinio().map(o => ({ cc: o.cc, de: o.de, setor: o.setor })); })()`)); }
    return out; };
  const f1 = topo('f1'), nas = topo('nascar');
  ok(f1.some(x => x.de === 'inter') && f1.filter(x => x.de === 'inter').every(x => /^ch:/.test(x.setor)),
    `campeão famoso na principal atrai multinacional (${f1.filter(x => x.de === 'inter').length} de ${f1.length} propostas)`);
  ok(nas.some(x => x.de === 'mercado' && x.cc === 'US'), 'na NASCAR, um brasileiro também recebe marca do mercado americano');
  const todos = f1.concat(nas);
  ok(todos.some(x => x.de === 'fora') || gb.tot + it.tot > 0 && [gb, it, jp, br].some(x => x.daqui < x.tot), 'a marca inesperada, de fora, continua possível');
  const epoca = (ano, cc) => { const J = carreira(41, { era: 7, ano: 2016, idade: 24, serie: 'f1', modo: 'realista', cc });
    return js(J, `(() => { const r = () => Math.random(), out = []; for(let k = 0; k < 400; k++){ const m = Engine.marcaLocal('${cc}', r, ${ano}); out.push(m.setor); } return [...new Set(out)]; })()`); };
  const s1960 = epoca(1960, 'IT'), s2000 = epoca(2000, 'IT'), s2015 = epoca(2015, 'IT'), s2022 = epoca(2022, 'IT');
  ok(s1960.every(x => ['transporte', 'construcao', 'alimentos', 'bebida', 'oleo'].indexOf(x) >= 0) && s2000.indexOf('tabaco') >= 0 && s2015.indexOf('tabaco') < 0
    && s2015.indexOf('cripto') < 0 && s2022.indexOf('cripto') >= 0, 'o setor respeita a época: cigarro até 2006, cripto depois de 2018, quase nada antes de 1968');
  const J = carreira(12, Object.assign({}, REAL, { cc: 'DE' }));
  const a = js(J, 'Engine.ofertasPatrocinio()'), b = js(J, 'Engine.ofertasPatrocinio()');
  ok(JSON.stringify(a) === JSON.stringify(b), 'a mesa de patrocínio não muda se o jogo for recarregado');
  ok(js(J, 'paisDaEquipe("Scuderia Ferrari")') === 'IT' && js(J, 'paisDaEquipe("Team Penske")') === 'US' && js(J, 'paisDaEquipe("Equipe Desconhecida")') === null,
    'a terra da equipe sai do nome das equipes conhecidas');
}

/* 2. dinheiro do piloto */
{
  const J = carreira(13, REAL);
  const p = js(J, `(() => { S.patroOfertas = [{ n:'Teste Bank', cc:'GB', setor:'banco', de:'eu', anos:2, faixa:'apoio local', valor:100000, bonus:25000 }];
    Game.assinarPatro(0); UI.close(); const c = S.money.patros[0];
    return { bonus: c.bonus, cc: c.cc, venceu: Engine.bonusPatro({ pos: 1 }), segundo: Engine.bonusPatro({ pos: 2 }) }; })()`);
  ok(p.bonus === 25000 && p.cc === 'GB' && p.venceu === 25000 && p.segundo === 0, 'o bônus por vitória fica no contrato e é pago quando você vence');
  const inv = js(J, `(() => { const m = S.money; m.invest = 1e6; m.saldo = 400e3; const b = Engine.balancoAno(), org = ORIGENS[S.origem] || ORIGENS.media;
    const fam = S.driver.age <= org.ate ? org.apoio : 0, i0 = m.invest, s0 = m.saldo; Game.fecharAno();
    return { dSaldo: m.saldo - s0, esperado: b.liquido + fam, dInv: m.invest - i0, rend: m.hist[0].rend }; })()`);
  ok(inv.dSaldo === inv.esperado && inv.dInv === inv.rend, `o rendimento fica investido e não entra de novo no caixa (investimento ${inv.rend >= 0 ? '+' : ''}${inv.rend})`);
  const vg = js(J, `(() => { const ano = S.season.year, cat = S.season.cat, r = {};
    S.vagaFator = { ano, cat, f: 0 }; r.campeao = Engine.balancoAno();
    S.vagaFator = { ano, cat, f: .5 }; r.meio = Engine.balancoAno();
    delete S.vagaFator; const d0 = S.dif; S.dif = 'tranquilo'; r.tranquilo = Engine.fatorVaga(); S.dif = 'realista'; r.realista = Engine.fatorVaga(); S.dif = d0;
    return r; })()`);
  ok(vg.campeao.custo > 0 && vg.campeao.desconto === vg.campeao.custo - vg.campeao.apoio && Math.abs(vg.meio.desconto - (vg.meio.custo - vg.meio.apoio) / 2) <= 1000,
    'o que sai do bolso pela vaga é o que a proposta mostrou: campeão não paga, e a dificuldade alivia de verdade');
  ok(vg.tranquilo < 1 && vg.realista === 1, `a dificuldade alivia o custo da vaga (${vg.tranquilo} no Tranquilo, ${vg.realista} no Realista)`);
  const te = js(J, '(() => { const m = S.money, r = []; for(const t of [0, 1, 2, 3, 6, 20]){ m.teste = t; r.push(Engine.testeEf()); } m.teste = 0; return r; })()');
  ok(te[1] > 0 && te[2] - te[1] < te[1] && te[3] - te[2] < te[2] - te[1] && te[5] < 2.2, `dia de teste comprado rende menos a cada dia a mais (${te.map(x => x.toFixed(2)).join(' → ')})`);
}

/* 3. a equipe pessoal */
{
  const J = carreira(14, REAL);
  const c = js(J, `(() => { const m = S.money; m.saldo = 5e6; const s0 = m.saldo; S.season.round = Math.floor(S.season.calendar.length / 2);
    const custo = Engine.custoPessoal('fisico'); Game.contratarPessoal('fisico'); UI.close(); const pago = s0 - m.saldo;
    const frac = Engine.pessoal('fisico'); const b = Engine.balancoAno(); S.season.round = 0;
    return { custo, pago, frac, pessoal: b.pessoal }; })()`);
  ok(c.pago > 0 && c.pago < c.custo && c.frac > .3 && c.frac < .7 && c.pessoal === c.custo,
    `contratar no meio do ano cobra a parte que falta (${c.pago} de ${c.custo}); o ano cheio entra no balanço`);
  const efeito = coach => { const K = carreira(15, { era: 7, ano: 2016, idade: 17, serie: 'f1', modo: 'realista' });
    return js(K, `(() => { S.money.saldo = 5e6; ${coach ? "S.pessoal = { coach: { ano: S.season.year - 1, rd: 0 } };" : ''}
      const a0 = Object.assign({}, S.driver.attr); Engine.progress(Engine.summary(S.season)); return S.driver.attr.pace - a0.pace; })()`); };
  const sem = efeito(false), com = efeito(true);
  ok(com > sem, `o coach faz o piloto crescer mais no ano (ritmo +${com.toFixed(2)} contra +${sem.toFixed(2)})`);
  const r = js(J, `(() => { const d = S.driver; d.condicao = 70; Engine.recuperar(true); const com = d.condicao; d.condicao = 70; const p = S.pessoal; S.pessoal = {}; Engine.recuperar(true); const sem = d.condicao;
    S.pessoal = { imprensa: { ano: S.season.year - 1, rd: 0 } }; const v1 = Engine.patrocinioValor(); S.pessoal = {}; const v0 = Engine.patrocinioValor(); S.pessoal = p; d.condicao = 100;
    return { com, sem, v1, v0 }; })()`);
  ok(r.com > r.sem, `o preparador físico acelera a volta de uma lesão (condição ${r.sem} → ${r.com})`);
  ok(r.v1 > r.v0, 'o assessor de imprensa faz os patrocínios valerem mais');
  J.run('Game.dispensarPessoal("fisico"); UI.close();');
  ok(!js(J, 'S.pessoal.fisico || null') && js(J, 'Engine.balancoAno().pessoal') === 0, 'dispensado, o custo sai do balanço do ano seguinte');
  const K = carreira(16, { era: 7, ano: 2016, idade: 17, serie: 'f1' });
  ok(js(K, 'Engine.pessoal("fisico")') === 0 && js(K, '(() => { S.pessoal = { fisico: { ano: 2000, rd: 0 } }; return Engine.pessoal("fisico"); })()') === 0,
    'fora do modo realista (sem dinheiro) a equipe pessoal não existe');
}

/* 4. o chefe */
{
  const J = H.carregar({ silencioso: true, seed: 5 });
  J.run(require('./chefe-comum'));
  J.run(`(() => { const l = eraOfSeries(2005, 'f1').teams.map((t, i) => [i, Engine.resolveTeam(t, i, 2005, 'f1')]).filter(x => x[1]);
    Chefe.novo({ chefe:{ nome:'T', cc:'BR' }, realismo:true, modo:'assumir', sk:'f1', ano:2005, idx:l[3][0] }); UI.limparFila(); UI.close(); })()`);
  const a = js(J, `(() => { const nova = { obs: Chefe.obsoleto('fabrica'), ef: Chefe.eficiencia('chassi') };
    C.instalAno = { fabrica: C.ano - 9, tunel: C.ano - 4, sim: C.ano - 2 };
    const velha = { obs: Chefe.obsoleto('fabrica'), ef: Chefe.eficiencia('chassi'), tunel: Chefe.obsoleto('tunel') };
    C.instalAno.fabrica = C.ano - 30; const max = Chefe.obsoleto('fabrica'); C.instalAno.fabrica = C.ano - 9;
    const cedo = Chefe.modernizar('sim'); C.caixa = 500e6; const c0 = C.caixa, mod = Chefe.modernizar('fabrica'), pago = c0 - C.caixa;
    return { nova, velha, max, cedo, mod, pago, obra: C.obras.fabrica }; })()`);
  ok(a.nova.obs === 0 && Math.abs(a.velha.obs - .2) < 1e-9 && a.velha.tunel === 0 && a.max === .35 && a.velha.ef < a.nova.ef,
    `instalação com 9 anos de equipamento perde 20% do efeito (eficiência ${a.nova.ef} → ${a.velha.ef}); o máximo é 35%`);
  ok(a.cedo === null && a.mod && a.pago === a.mod.custo && a.obra && a.obra.moderniza, `modernizar custa ${(a.pago / 1e6).toFixed(1)} mi, leva um ano, e não existe para equipamento novo`);
  J.run('__inverno(); __temporada(); Chefe.proximoAno(); UI.limparFila(); UI.close();');
  ok(js(J, 'Chefe.obsoleto("fabrica")') === 0 && js(J, 'C.instalAno.fabrica') === js(J, 'C.ano'), 'no ano seguinte o equipamento é novo de novo');
  const e = js(J, `(() => { const o = Chefe.emprestimos()[0]; const r = .09; const vp = o.parcela / (1 + r) + o.parcela / Math.pow(1 + r, 2) + o.parcela / Math.pow(1 + r, 3); return { v: o.valor, vp }; })()`);
  ok(Math.abs(e.vp - e.v) / e.v < .002, `empréstimo: as três parcelas valem o empréstimo a 9% ao ano, como a tela diz (antes, uns 14%)`);
  const ac = js(J, `(() => { const a0 = C.acad || 0; C.fase = 'temporada'; UIC.acadNivel(a0 === 3 ? 2 : a0 + 1); const t = C.acad; C.fase = 'inverno'; UIC.acadNivel(a0 === 3 ? 2 : a0 + 1); const w = C.acad; C.acad = a0; UI.close(); return { a0, t, w }; })()`);
  ok(ac.t === ac.a0 && ac.w !== ac.a0, 'o tamanho da academia muda no inverno, quando o orçamento é fechado (antes, no meio do ano ficava de graça)');
  const K = H.carregar({ silencioso: true, seed: 6 });
  K.run(require('./chefe-comum'));
  K.run(`(() => { const l = eraOfSeries(2022, 'f1').teams.map((t, i) => [i, Engine.resolveTeam(t, i, 2022, 'f1')]).filter(x => x[1]);
    Chefe.novo({ chefe:{ nome:'T', cc:'BR' }, realismo:true, modo:'assumir', sk:'f1', ano:2022, idx:l[2][0] }); UI.limparFila(); UI.close(); })()`);
  const t = js(K, `(() => { const c = Chefe.tetoConta(); const nR = calendarFor(C.ano, Chefe.sk()).length; const fixo = Object.values(C.staff).filter(Boolean).reduce((a, x) => a + (x.sal || 0), 0) + Chefe.manutencao();
    return { proj: c && c.proj, base: Chefe.custoPlano() + fixo, opera: Chefe.M(1.05e6) * nR }; })()`);
  ok(t.proj && Math.abs(t.proj - (t.base + t.opera)) < 1, `teto de gastos: a projeção do inverno inclui a operação de cada corrida (+${(t.opera / 1e6).toFixed(1)} mi)`);
}

/* 5. as telas novas nos outros idiomas */
{
  const sources = new Set();
  const normalize = s => String(s).replace(/\s+/g, ' ').trim();
  const decode = s => s.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (_, e) => e[0] === '#'
    ? String.fromCodePoint(parseInt(e.slice(/^#x/i.test(e) ? 2 : 1), /^#x/i.test(e) ? 16 : 10))
    : ({ amp:'&', lt:'<', gt:'>', quot:'"', apos:"'", nbsp:' ' }[e.toLowerCase()]));
  const record = v => { const s = normalize(decode(String(v))); if(/\p{L}/u.test(s)) sources.add(s); };
  const html = v => {
    const clean = String(v).replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
      .replace(/<([a-z]+)[^>]*data-i18n-ignore[^>]*>[^<]*<\/\1>/gi, '');
    for(const m of clean.matchAll(/<(?:[^>"']|"[^"]*"|'[^']*')*>|[^<]+/g)){
      if(m[0][0] !== '<') record(m[0]);
      else for(const a of m[0].matchAll(/\b(?:title|aria-label|placeholder|alt|label)\s*=\s*(["'])(.*?)\1/g)) record(a[2]);
    }
  };
  let ligado = false;
  const J = carreira(17, Object.assign({}, REAL, { cc: 'GB' }), { onWrite: w => { if(!ligado) return; w.property === 'innerHTML' ? html(w.value) : record(w.value); } });
  J.run(require('./chefe-comum'));
  ligado = true;
  J.run(`S.money.saldo = 5e6; S.driver.fame = 70; S.history = [{ champion: true, pos: 1 }]; S.patroOfertas = Engine.ofertasPatrocinio();
    S.patroOfertas.push({ n:'X', cc:'US', setor:'ch:bebida', de:'inter', anos:1, faixa:'grande anunciante', valor:1e6, bonus:5e4 }, { n:'Y', cc:'JP', setor:'telecom', de:'fora', anos:2, faixa:'marca nacional', valor:1e6, bonus:0 },
      { n:'Z', cc:'US', setor:'oleo', de:'mercado', anos:3, faixa:'apoio local', valor:1e6, bonus:0 }, { n:'W', cc:'IT', setor:'moda', de:'time', anos:1, faixa:'apoio local', valor:1e6, bonus:0 });
    Object.keys(PATRO_SETORES).forEach(k => UI.toast(PATRO_SETORES[k].n));
    UI.patroModal(); Game.assinarPatro(0); Game.contratarPessoal('fisico'); Game.contratarPessoal('coach');
    S.money.hist.unshift({ ano: 2015, rend: 12000 }); S.vagaFator = { ano: S.season.year, cat: S.season.cat, f: 0 }; S.empresario = { id: EMPRESARIOS[0].id };
    UI.financas(); Game.dispensarPessoal('coach'); UI.patroModal();
    UI.toast('Preparador físico contratado.'); UI.toast('Coach e simulador dispensado. O contrato não se renova.');`);
  J.run(`(() => { const l = eraOfSeries(2005, 'f1').teams.map((t, i) => [i, Engine.resolveTeam(t, i, 2005, 'f1')]).filter(x => x[1]);
    Chefe.novo({ chefe:{ nome:'T', cc:'BR' }, realismo:true, modo:'assumir', sk:'f1', ano:2005, idx:l[3][0] }); UI.limparFila(); UI.close();
    C.instalAno = { fabrica: C.ano - 9, tunel: C.ano - 1, sim: C.ano - 6 }; C.caixa = 500e6; UIC.instalacoes(); Chefe.modernizar('fabrica'); UIC.instalacoes();
    C.fase = 'temporada'; UIC.acadNivel(((C.acad || 0) + 1) % 4); C.fase = 'inverno';
    Chefe.noticia('Modernização: fábrica nível 3 ganha equipamento novo.', ''); UI.toast('Modernização concluída: fábrica.'); })()`);
  const api = J.ctx.VDO_I18N;
  const nomes = Array.from(J.run('VDO_LANGUAGE_NAMES()')).sort((a, b) => b.length - a.length);
  const residual = /\b(?:você|vocês|não|também|equipe|temporada|temporadas|corrida|piloto|patrocínio|patrocinadores|contrato|vitória|bônus|terra|mercado|categoria|multinacional|aposta|fora|preparador|físico|assessor|imprensa|contratado|dispensado|desde|dispensar|contratar|desconto|vaga|título|dificuldade|comissão|empresário|rendimento|investido|último|equipamento|modernizar|modernização|pronto|efeito|academia|inverno|orçamento|transportes|seguros|construção|alimentos|bebidas|lubrificantes|moda|cigarros|tecnologia|telecomunicações|energia|criptomoedas)\b/iu;
  const residualEs = /(?:você|vocês|não|também|equipe|patrocínio|vitória|bônus|preparador físico fica|assessor|dispensado|comissão|empresário|equipamento de \d|modernização|orçamento|construção|lubrificantes|cigarros|tecnologia\b|telecomunicações|energia\b|criptomoedas)/iu;
  const ruins = [];
  let k = 0;
  for(const s of sources) for(const lang of ['en', 'es', 'ja']){
    let t = api.audit(s, lang).text; nomes.forEach(x => t = t.split(x).join('')); k++;
    if((lang === 'es' ? residualEs : residual).test(t)) ruins.push(`${lang}: ${s} => ${t}`);
  }
  for(const precisa of ['Sua equipe pessoal', 'Preparador físico', 'da sua terra', 'multinacional', 'aposta de fora', 'Comissão do empresário', 'Desconto da vaga', 'Equipamento de', 'Modernizar']){
    k++; if(![...sources].some(s => s.indexOf(precisa) >= 0)) ruins.push('não renderizou: ' + precisa);
  }
  ruins.slice(0, 25).forEach(x => console.log('    ' + x));
  ok(!ruins.length, `as telas e mensagens da fase 4 em inglês, espanhol e japonês (${k} textos verificados${ruins.length ? ', ' + ruins.length + ' com português sobrando' : ''})`);
}

console.log(falhas ? `\n${falhas} de ${n} verificações falharam` : `\ncomunidade, fase 4: ${n} verificações, tudo certo`);
process.exit(falhas ? 1 : 0);
