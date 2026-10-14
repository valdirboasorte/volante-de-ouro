/* O mercado de pilotos do modo chefe: de onde vêm os candidatos, quem é
   real e quem é regen, a academia e uma temporada jogada com eles */
const H = require('./base');
let falhas = 0;
const ok = (c, m) => { if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };

function assumir(J, ano, nome){
  J.run(`Chefe.novo({ modo:'assumir', ano:${ano}, idx: eraOfSeries(${ano},'f1').teams.findIndex((t,i) => { const r = Engine.resolveTeam(t,i,${ano},'f1'); return r && r.name === '${nome}'; }), chefe:{ nome:'T', cc:'BR' } });
         UI.show = () => {}; UIC.render = () => {};`);
}
const merc = J => JSON.parse(J.run(`JSON.stringify(C.inv.mercado.map(p => ({ n:p.nome, o:p.orig || 'f1', t:p.origTxt || '', regen:!!p.regen,
  real: !!(p.real || (p.mid && C.W.p[p.mid] && C.W.p[p.mid].r) || p.orig === 'outra'), idade: Chefe.idade(p), hab: Chefe.hab(p), serie:p.serie || null,
  f1doc: !!Mundo.doc('f1')[p.nome] })))`));

/* A. 2024: os quatro lugares de onde vêm pilotos, todos reais */
{
  const J = H.carregar();
  assumir(J, 2024, 'Alpine');
  const m = merc(J);
  const por = o => m.filter(x => x.o === o);
  ok(por('f1').length >= 12 && por('base').length >= 6 && por('outra').length >= 5,
    `2024: ${por('f1').length} da F1, ${por('livre').length} sem vaga, ${por('base').length} da F2/F3, ${por('outra').length} de outras categorias`);
  const nomes = m.map(x => x.n);
  ok(nomes.every((n, i) => nomes.indexOf(n) === i), 'ninguém aparece duas vezes no mercado');
  ok(m.every(x => !x.regen), 'antes de 2027 não há regen no mercado');
  const noGrid = new Set(JSON.parse(J.run('JSON.stringify(Chefe.pilotosDoAno(2024).map(p => p.nome))')));
  ok(m.filter(x => x.o !== 'f1').every(x => !noGrid.has(x.n)), 'quem está no grid da F1 não aparece como piloto de outro lugar');
  ok(por('base').some(x => x.f1doc), 'a F2 traz gente que a história leva à F1: ' + por('base').filter(x => x.f1doc).map(x => x.n).join(', '));
  ok(por('base').every(x => /Fórmula [23]/.test(x.t)), 'cada um da base diz a categoria: ' + por('base').slice(0, 3).map(x => x.t).join(' / '));
  const series = new Set(por('outra').map(x => x.serie));
  ok(series.size >= 3 && !series.has('nascar'), 'outras categorias: ' + [...series].join(', ') + ' (a NASCAR não tem como converter)');
  ok(por('outra').every(x => x.hab >= 70 && x.hab <= 92), 'notas convertidas na escala da F1: ' + por('outra').map(x => x.n + ' ' + x.hab).join(', '));
  const olh = JSON.parse(J.run('JSON.stringify(C.inv.olheiros.map(p => ({ n:p.nome, regen:!!p.regen, t:p.origTxt })))'));
  ok(olh.length >= 5 && olh.every(x => !x.regen), `olheiros: ${olh.length} garotos reais (${olh.slice(0, 4).map(x => x.n).join(', ')})`);
  ok(!JSON.parse(J.run(`JSON.stringify(Object.values(C.W.p).filter(r => r.st === 'a' && r.g >= 1 && 2024 - r.nasc > 40).map(r => r.n))`)).length,
    'nenhum veterano de 40 anos perdido na base (o Mansell da F3 é o Christian)');

  /* UI: abas, ficha de quem vem de outra categoria */
  J.run(`UIC.abaMerc = 'outra'; UIC.mercado();`);
  const html = J.E('modal').innerHTML;
  ok(/Outras categorias · \d+/.test(html) && /Pilotos reais de outras categorias/.test(html), 'a aba de outras categorias abre');
  const iOutra = J.run(`C.inv.mercado.findIndex(p => p.orig === 'outra' && !p.real)`);
  J.run(`UIC.fichaMercado(${iOutra})`);
  ok(/Piloto real/.test(J.E('modal').innerHTML) && /escala|Fórmula 1/.test(J.E('modal').innerHTML), 'a ficha de quem vem de outra categoria explica a conversão');

  /* assinar um de outra categoria e um da F2, no lugar dos titulares de verdade */
  J.run('Chefe.titulares().slice().forEach(p => Chefe.dispensar(p))');
  const outro = J.run(`(function(){ const p = C.inv.mercado.find(p => p.orig === 'outra' && !p.real); Chefe.assinar(p, { sal:1, anos:2, n1:false, papel:'titular' }, 1); return p.nome; })()`);
  const jovem = J.run(`(function(){ const p = C.inv.mercado.find(p => p.orig === 'base'); Chefe.assinar(p, { sal:1, anos:2, n1:false, papel:'titular' }, 1); return p.nome; })()`);
  ok(J.run('Chefe.titulares().length') === 2, `assinados ${outro} e ${jovem}`);
  ok(/Troca .* pela Fórmula 1/.test(J.run('C.news.map(n => n.t).join(" ")')), 'a notícia diz de onde ele veio');
  ok(!J.run('C.inv.mercado').some(p => p.nome === outro || p.nome === jovem), 'quem assinou sai do mercado');

  /* academia: vagas pelo investimento */
  J.run('C.acad = 0');
  ok(J.run('Chefe.vagasAcademia()') === 3, 'sem investimento, 3 vagas');
  const garotos = J.run(`C.inv.mercado.filter(p => p.orig === 'base' && Chefe.idade(p) <= 21).length + C.inv.olheiros.length`);
  let entraram = 0;
  for(let k = 0; k < 5; k++){
    const r = J.run(`(function(){ const p = C.inv.mercado.find(p => p.orig === 'base' && Chefe.idade(p) <= 21) || C.inv.olheiros[0]; return p ? Chefe.levarParaAcademia(p) : null; })()`);
    if(r) entraram++;
  }
  ok(garotos >= 3 && entraram === 3 && J.run('Chefe.academia().length') === 3, 'a academia enche nas 3 vagas e recusa o quarto');
  J.run('C.acad = 2');
  ok(J.run('Chefe.vagasAcademia()') === 6, 'investimento forte abre 6 vagas');

  /* a temporada inteira, e o ano seguinte */
  J.run(`if(!C.motor.proprio && !C.motor.nome) Chefe.escolherMotor(Chefe.motorObrigado().nome, 2);
         Chefe.comecarTemporada();
         while(C.temporada.round < C.temporada.calendar.length){ const r = Chefe.correr(); delete r.tl; }
         var bb = Chefe.fimDeTemporada(); if(bb.falencia) Chefe.resgatar(); C.balanco.estouro = null; Chefe.proximoAno();`);
  const grid = JSON.parse(J.run('JSON.stringify(C.temporada ? C.temporada.field.map(f => f.name) : [])'));
  ok(J.run('C.ano') === 2025, 'a temporada de 2024 fechou e 2025 abriu');
  const m2 = merc(J);
  const n2 = m2.map(x => x.n);
  ok(n2.every((n, i) => n2.indexOf(n) === i) && !n2.includes(outro) && !n2.includes(jovem), 'mercado de 2025 sem repetidos e sem os seus pilotos');
  const acad = JSON.parse(J.run(`JSON.stringify(Chefe.academia().map(p => { const r = Chefe.recDe(p); return r ? r.hs.slice(-1)[0] : null; }))`));
  ok(acad.length === 3 && acad.every(h => h && /Academia/.test(h[2])), 'o ano dos garotos da academia entrou na trajetória deles');
}

/* B. 1990: a F3000 tem os futuros pilotos de F1 */
{
  const J = H.carregar();
  assumir(J, 1990, 'Ligier');
  const m = merc(J);
  const base = m.filter(x => x.o === 'base');
  ok(base.length >= 4 && base.every(x => x.real), '1990: ' + base.map(x => x.n + ' (' + x.t + ')').slice(0, 5).join(', '));
  ok(m.filter(x => x.o === 'outra').length >= 3, '1990: ' + m.filter(x => x.o === 'outra').map(x => x.n + ' (' + x.t + ')').slice(0, 4).join(', '));
  ok(m.every(x => !x.regen), '1990: nenhum regen');
}

/* C. depois de 2026 o mundo cria os seus */
{
  const J = H.carregar();
  J.run(`Chefe.novo({ modo:'criar', ano:2026, chefe:{ nome:'T', cc:'BR' }, eq:{ nome:'Teste', cor:'#123456', cc:'BR' }, fin:'fundo' });
         UI.show = () => {}; UIC.render = () => {};`);
  for(let a = 0; a < 4; a++){
    J.run(`while(Chefe.titulares().filter(p => !p.venceu).length < 2 && C.inv.mercado.length) Chefe.assinar(C.inv.mercado[0], { sal:1, anos:1, n1:false, papel:'titular' }, 1);
           if(Chefe.ehF1() && !C.motor.proprio && !C.motor.nome) Chefe.escolherMotor(Chefe.motorObrigado().nome, 1);
           Chefe.comecarTemporada();
           while(C.temporada.round < C.temporada.calendar.length){ const r = Chefe.correr(); delete r.tl; }
           var bb = Chefe.fimDeTemporada(); if(bb.falencia) Chefe.resgatar(); C.balanco.estouro = null; Chefe.proximoAno();`);
  }
  const ano = J.run('C.ano');
  const m = merc(J);
  const regens = m.filter(x => x.regen).length + J.run('C.inv.olheiros.filter(p => p.regen).length');
  const nomes = m.map(x => x.n);
  ok(regens > 0, `${ano}: ${regens} regen(s) entre mercado e olheiros, ao lado de ${m.filter(x => x.real).length} pilotos reais`);
  ok(nomes.every((n, i) => nomes.indexOf(n) === i), `${ano}: ninguém repetido no mercado`);
}

/* D. equipe na base: quem vem e de onde */
{
  const J = H.carregar();
  J.run(`Chefe.novo({ modo:'base', ano:2022, cat:'Fórmula 3', chefe:{ nome:'T', cc:'GB' }, eq:{ nome:'Teste', cor:'#123456', cc:'GB' } });`);
  const m = merc(J);
  ok(m.length >= 8 && m.every(x => x.t), `base 2022: ${m.length} candidatos, todos com a categoria (${m.slice(0, 2).map(x => x.n + ' · ' + x.t).join(' / ')})`);
  ok(m.filter(x => x.real).length >= 6, 'base 2022: ' + m.filter(x => x.real).length + ' de ' + m.length + ' são pilotos reais da F3 e da Regional');
}
console.log(falhas ? falhas + ' falha(s)' : 'mercado do chefe: tudo certo');
process.exitCode = falhas ? 1 : 0;
