/* Cenários de chefe: começam com a equipe, o ano e as condições certas, acompanham
   os objetivos, não decidem resultado de antemão, salvam, retomam e deixam
   seguir a carreira depois do objetivo.
   Uso: node testes/chefe-cenarios.js   Não modifica arquivos nem saves. */
const H = require('./base');
let falhas = 0, n = 0;
const ok = (c, m) => { n++; if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };
const temporada = J => J.run(`(() => { Chefe.comecarTemporada(); const sea = C.temporada;
  while(sea.round < sea.calendar.length){ const r = Chefe.correr(); delete r.tl; }
  Chefe.fimDeTemporada(); return C.cenario ? { estado: C.cenario.estado, feitos: Object.keys(C.cenario.feitos), caixa: Math.round(C.caixa / 1e6) } : null; })()`);

/* 1. todos começam com a equipe, o ano e a série certos */
{
  const J = H.carregar({ silencioso:true, seed: 2 });
  const lista = J.run('CHEFE_CENARIOS.map(d => d.id)');
  ok(lista.length >= 5 && ['brawn09','andrea92'].every(id => lista.indexOf(id) >= 0), `${lista.length} cenários, entre eles Brawn 2009 e Andrea Moda 1992`);
  const r = lista.map(id => J.run(`(() => { const ok = Cenario.iniciar('${id}', { nome:'T', cc:'BR' }); const d = Cenario.def();
    return { id:'${id}', ok, eq: C.eq.nome, ano: C.ano, sk: Chefe.sk(), esperado: d.equipe || d.criar.nome, anoD: d.ano, skD: d.sk, obj: d.objetivos.length,
      principal: d.objetivos.some(o => !o.meio), estado: C.cenario.estado }; })()`));
  ok(r.every(x => x.ok && x.eq === x.esperado && x.ano === x.anoD && x.sk === x.skD), 'cada cenário começa com a equipe, o ano e a série dele: ' + r.map(x => x.eq + ' ' + x.ano).join(', '));
  ok(r.every(x => x.obj >= 3 && x.principal && x.estado === 'andamento'), 'todos têm objetivos intermediários e principais');
}

/* 2. Brawn 2009: carro forte, dinheiro curto, sem patrocinador; o resultado não está escrito */
{
  const estados = new Set();
  let checou = false;
  /* lotes até aparecerem os dois desfechos (no máximo 20): com sementes fixas, qualquer
     sorteio novo em outra parte do jogo troca qual lote dá título, mas não a variedade */
  for(let seed = 1; seed <= 20 && (seed <= 4 || estados.size < 2); seed++){
    const J = H.carregar({ silencioso:true, seed });
    J.run(`Cenario.iniciar('brawn09', { nome:'T', cc:'BR' })`);
    if(!checou){
      const c = J.run(`(() => { const ia = Chefe.equipesIA(2009).map(t => t.str).sort((a, b) => b - a); return { forca: Chefe.forca(), segunda: ia[1], patro: C.patro.length, motor: C.motor.nome, titulares: Chefe.titulares().map(p => p.nome) }; })()`);
      ok(c.forca >= c.segunda - 3 && c.patro === 0 && c.motor === 'Mercedes', `Brawn: carro entre os melhores (${Math.round(c.forca)}), sem patrocinador principal, motor Mercedes de cliente`);
      ok(c.titulares.some(n => /Button/.test(n)) && c.titulares.some(n => /Barrichello/.test(n)), 'com Button e Barrichello');
      checou = true;
    }
    const r = temporada(J);
    estados.add(r.estado);
    ok(r.estado === 'sucesso' || r.estado === 'fracasso', `lote ${seed}, fim de 2009: ${r.estado} (objetivos: ${r.feitos.join(', ') || 'nenhum'}; caixa ${r.caixa} mi)`);
  }
  ok(estados.size === 2, 'em lotes diferentes a temporada não tem roteiro: às vezes o título vem, às vezes não (' + [...estados].join(', ') + ')');
}

/* 3. Andrea Moda: depósito, pré-classificação forçada, objetivos graduais */
{
  const J = H.carregar({ silencioso:true, seed: 5 });
  J.run(`Cenario.iniciar('andrea92', { nome:'T', cc:'BR' }); C.cenario.deposito = 'nao'; Chefe.comecarTemporada();`);
  const r0 = J.run(`(() => { const sea = C.temporada; const qs = Chefe.qualiDaEtapa(sea);
    const nossos = sea.field.filter(f => f.teamId === 'EU' && f.ativo).map(f => f.id);
    const rec = Chefe.correr(); return { fora: nossos.map(id => qs.fora[id]), correram: rec.nossos.length, nota: qs.nota }; })()`);
  ok(r0.fora.every(x => x === 'DNS') && r0.correram === 0 && /depósito/.test(r0.nota || ''), 'sem o depósito, a equipe fica fora da primeira etapa');
  const r1 = J.run(`(() => { const sea = C.temporada; const qs = Chefe.qualiDaEtapa(sea);
    const pre = qs.sessoes[0]; Chefe.rodarSessao(); const res = qs.res[0];
    return { k: pre.k, part: res.ordem.length, passam: res.passam.length }; })()`);
  ok(r1.k === 'preq' && r1.part === 4 && r1.passam === 2, 'nas etapas seguintes: pré-classificação de quatro carros por duas vagas');
  J.run(`(() => { const sea = C.temporada; while(sea.round < sea.calendar.length){ const r = Chefe.correr(); delete r.tl; } Chefe.fimDeTemporada(); })()`);
  const f = J.run('({ feitos: Object.keys(C.cenario.feitos), estado: C.cenario.estado, ano: C.ano })');
  ok(f.feitos.indexOf('prep') >= 0, `objetivos graduais acompanhados ao longo do ano: ${f.feitos.join(', ')}`);
  ok(f.estado === 'andamento', 'o objetivo principal (chegar a 1993) ainda não se decide em 1992');
  /* salva, recarrega e o cenário continua */
  J.run('UIC.salvar();');
  const K = H.carregar({ silencioso:true, seed: 6, store: J.store });
  K.run('UIC.continuar(); UI.limparFila(); UI.close();');
  ok(K.run('C.cenario && C.cenario.id') === 'andrea92' && K.run('Object.keys(C.cenario.feitos).length') === f.feitos.length, 'salvar e retomar: o cenário volta com os objetivos já cumpridos');
  K.run(`(() => { C.vendida = false; Chefe.proximoAno(); })()`);
  const fim = K.run(`(() => { Chefe.comecarTemporada(); return { estado: C.cenario.estado, ano: C.ano }; })()`);
  ok(fim.ano === 1993 && fim.estado === 'sucesso', 'chegando a 1993, o objetivo principal se cumpre');
  K.run('UIC.cenarioFim(); UI.close();');
  const seguir = K.run(`(() => { const sea = C.temporada; const r = Chefe.correr(); return { visto: C.cenario.visto, correu: sea.results.length }; })()`);
  ok(seguir.visto && seguir.correu === 1, 'depois do objetivo, a carreira continua normalmente');
}

/* 4. McLaren 1988: manter os dois é conferido no começo de 1989 */
{
  const J = H.carregar({ silencioso:true, seed: 9 });
  J.run(`Cenario.iniciar('mclaren88', { nome:'T', cc:'BR' })`);
  ok(J.run('Chefe.titulares().map(p => Engine.sobrenome(p.nome)).sort().join(",")') === 'Prost,Senna', 'McLaren 1988 começa com Senna e Prost');
  const r = temporada(J);
  ok(r.estado === 'andamento' && r.feitos.indexOf('manter') < 0, 'o objetivo "começar 1989 com os dois" fica para 1989');
}

/* 5. depois de simular o ano, dá para ver os resultados antes de virar a temporada */
{
  const J = H.carregar({ silencioso:true, seed: 3 });
  J.run(require('./chefe-comum'));
  const r = J.run(`(() => { Chefe.novo({ modo:'assumir', sk:'f1', ano:2010, idx:0, chefe:{ nome:'T', cc:'BR' }, realismo:true }); __inverno(); Chefe.comecarTemporada(); UI.limparFila(); UI.close();
    UIC.simularJa(); UIC.fimTemporada(); const m1 = document.getElementById('modal').innerHTML;
    UIC.verResultados(); const ano = C.ano, fase = C.fase, res = C.temporada.results.length, hub = document.getElementById('chPrincipal').innerHTML;
    UIC.fimTemporada(); UIC.aposBalanco(); return { botoes: /verResultados/.test(m1) && /aposBalanco/.test(m1), fase, ano, res, hub: /Balanço e próxima temporada/.test(hub), depois: C.ano }; })()`);
  ok(r.botoes, 'o balanço do ano tem "Ver os resultados" ao lado de "Próxima temporada"');
  ok(r.fase === 'balanco' && r.ano === 2010 && r.res > 10 && r.hub, `ver os resultados não vira o ano: o painel mostra as ${r.res} corridas e volta ao balanço`);
  ok(r.depois === 2011, 'só seguir no balanço passa para a próxima temporada');
}

console.log(falhas ? falhas + ' falha(s) de ' + n : `cenários de chefe: ${n} verificações, tudo certo`);
if(falhas) process.exitCode = 1;
