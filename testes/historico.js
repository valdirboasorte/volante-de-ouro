/* O banco histórico dentro do jogo.
   Uso: node testes/historico.js
   — anos de teste (1950, 1960, 1975, 1985, 1995, 2005, 2015, 2026): a escada
     não tem anacronismo (nada de GP2 antes de 2005, F3000 antes de 1985,
     Fórmula Júnior depois de 1963, F4 antes de existir);
   — cada categoria da escada aponta para um campeonato que existia naquele ano;
   — uma carreira começando na base mostra o grid real daquele campeonato
     (quando o banco tem a temporada) e nenhum piloto aparece duas vezes;
   — o piloto do jogador nunca é mexido pelo dado real. */
const H = require('./base.js');
const J = H.carregar();
let erros = 0;
const falha = m => { erros++; console.log('  ✗ ' + m); };

if(!J.run('Hist.ok()')){ console.log('dados/historico.js não carregou'); process.exit(1); }

/* 1. escadas sem anacronismo */
const ANOS = [1950, 1960, 1975, 1985, 1995, 2005, 2015, 2026];
const proibido = [
  [/GP2/, a => a < 2005 || a > 2016],
  [/^Fórmula 3000$/, a => a < 1985 || a > 2004],
  [/^Fórmula Júnior$/, a => a < 1958 || a > 1963],
  [/^Fórmula 4/, a => a < 2014],
  [/^Fórmula Regional$/, a => a < 2019],
  [/^Mundial de Kart$/, a => a < 1964],
  [/^Fórmula 2$/, a => a > 2004 && a < 2017]
];
const series = Object.keys(J.run('SERIES'));
for(const sk of series){
  for(const ano of ANOS){
    for(const cc of ['GB', 'BR', 'IT', 'JP', 'US', 'DE']){
      const esc = J.run(`(() => { const e = eraOfSeries(${ano}, '${sk}'); return e && ${ano} >= e.y - 0 ? resolveLadder(e.ladder, '${cc}', ${ano}) : []; })()`);
      esc.forEach(cat => proibido.forEach(([re, fora]) => { if(re.test(cat) && fora(ano)) falha(`${sk} ${ano} ${cc}: "${cat}" não existia`); }));
      /* a categoria aponta para um campeonato que existia naquele ano */
      esc.forEach(cat => {
        const id = J.run(`campDaCat(${JSON.stringify(cat)}, ${ano})`);
        if(id && !J.run(`Hist.existe(Hist.camp('${id}'), ${ano})`)) falha(`${sk} ${ano}: "${cat}" → ${id}, que não existia`);
      });
    }
  }
}

/* 2. o grid real aparece na carreira */
const casos = [
  [1983, 18], [1983, 21], [1995, 21], [2005, 20], [2008, 22], [2015, 18], [2024, 21], [2024, 17]
];
let comReal = 0;
for(const [ano, idade] of casos){
  const era = J.run(`SERIES.f1.eras.findIndex((e, i, a) => ${ano} >= e.y && (!a[i + 1] || ${ano} < a[i + 1].y))`);
  H.novaCarreira(J, { era, ano, idade, cc:'GB', rapido:true });
  const S = J.run('S');
  const sea = S.season;
  const cid = J.run(`campDaCat(S.season.cat, S.year)`);
  const t = cid ? J.run(`Hist.temporada('${cid}', ${ano})`) : null;
  const nomes = sea.field.filter(f => !f.isMe).map(f => f.name);
  const dup = nomes.filter((n, i) => nomes.indexOf(n) !== i);
  if(dup.length) falha(`${ano}: piloto repetido no grid: ${dup.join(', ')}`);
  if(t && t.inscritos.length){
    const reais = new Set(t.inscritos.map(x => x.name));
    const n = nomes.filter(x => reais.has(x)).length;
    if(n < Math.min(8, reais.size)) falha(`${ano} ${sea.cat}: só ${n} pilotos reais no grid (o banco tem ${reais.size})`);
    else comReal++;
    console.log(`  ${ano} ${sea.cat} (${cid}, ${t.st}): ${n}/${nomes.length} do grid são reais — ${nomes.slice(0, 6).join(', ')}…`);
  } else console.log(`  ${ano} ${sea.cat}: categoria ${cid || '—'}, temporada ${t ? t.st : 'ausente'} — grid simulado`);
  if(sea.field.find(f => f.isMe).name !== S.driver.name) falha(`${ano}: o jogador sumiu do grid`);
}
/* 3. progressão global: um brasileiro escolhe estrear na F3 japonesa */
{
  const era = J.run('SERIES.f1.eras.findIndex((e, i, a) => 2004 >= e.y && (!a[i + 1] || 2004 < a[i + 1].y))');
  J.run("UI.estreia = 'f3_japao'");
  H.novaCarreira(J, { era, ano: 2004, idade: 20, cc: 'BR', rapido: true });
  J.run("UI.estreia = ''");
  const sea = J.run('S.season'), cid = J.run(`campDaCat(S.season.cat, 2004)`);
  const t = J.run("Hist.temporada('f3_japao', 2004)");
  const nomes = sea.field.filter(f => !f.isMe).map(f => f.name);
  const reais = t ? nomes.filter(n => t.inscritos.some(x => x.name === n)).length : 0;
  if(cid !== 'f3_japao') falha(`estreia escolhida: a categoria é ${sea.cat} (${cid}), não a F3 japonesa`);
  else if(t && t.inscritos.length && reais < Math.min(8, t.inscritos.length)) falha(`estreia na F3 japonesa: só ${reais} reais no grid`);
  else console.log(`  estreia escolhida: ${sea.cat} 2004, ${reais}/${nomes.length} do grid são reais — ${nomes.slice(0, 5).join(', ')}…`);
  const jp = sea.field.filter(f => !f.isMe && f.cc === 'JP').length;
  if(jp < nomes.length / 3) falha(`F3 japonesa com só ${jp} japoneses no grid`);
}
/* 4. estreia aos 8 anos: kart até ter idade de carro (15) */
{
  const era = J.run('SERIES.f1.eras.findIndex((e, i, a) => 2000 >= e.y && (!a[i + 1] || 2000 < a[i + 1].y))');
  H.novaCarreira(J, { era, ano: 2000, idade: 8, cc: 'BR', rapido: true });
  const linha = [];
  let primeiroCarro = null;
  for(let i = 0; i < 9; i++){
    const S = J.run('S');
    const idade = S.driver.age, cat = S.season.cat, kart = /kart/i.test(cat);
    linha.push(idade + ':' + (kart ? 'kart' : cat));
    if(!kart && primeiroCarro == null) primeiroCarro = idade;
    if(!kart && idade < 15) falha(`estreia aos 8: aos ${idade} já num carro (${cat})`);
    const r = H.temporada(J);
    if(r.fim) break;
  }
  console.log(`  estreia aos 8 anos (2000): ${linha.join(' · ')}`);
  if(J.run('S.driver.startAge') !== 8) falha('a idade de estreia não ficou em 8');
}

/* 5. convites de campeonatos reais: aparecem conforme o desempenho, e aceitar
   um leva àquele campeonato no ano seguinte, com o grid dele */
{
  let vistos = 0, aceitos = 0, certos = 0;
  const exemplos = [];
  for(let k = 0; k < 6; k++){
    const ano = [1988, 1996, 2004, 2009, 2014, 2019][k];
    const era = J.run(`SERIES.f1.eras.findIndex((e, i, a) => ${ano} >= e.y && (!a[i + 1] || ${ano} < a[i + 1].y))`);
    H.novaCarreira(J, { era, ano, idade: 18, cc: ['GB', 'BR', 'IT', 'JP', 'DE', 'FR'][k], rapido: true });
    /* um piloto forte, para o telefone tocar */
    J.run("for(const a in S.driver.attr){ S.driver.attr[a] = Math.max(S.driver.attr[a], 86); } S.driver.ovr = Engine.ovr(S.driver.attr); S.driver.fame = 60;");
    let pendente = null;
    for(let t = 0; t < 4; t++){
      const antes = J.run('S.season.field').filter(f => !f.isMe).map(f => f.name);
      const r = H.temporada(J, ofs => {
        const i = ofs.findIndex(o => o.convite);
        vistos += ofs.filter(o => o.convite).length;
        if(i >= 0 && !pendente){ pendente = Object.assign({}, ofs[i], { antes }); aceitos++; return i; }
        return null;
      });
      if(r.fim) break;
      if(pendente && !pendente.ok){
        const S = J.run('S');
        const cid = J.run(`campDaCat(${JSON.stringify(S.season.cat)}, ${S.year})`);
        const nomes = S.season.field.filter(f => !f.isMe).map(f => f.name);
        const dup = nomes.filter((n, i) => nomes.indexOf(n) !== i);
        if(dup.length) falha(`convite: piloto repetido no grid de ${S.season.cat}: ${dup.join(', ')}`);
        /* trocou de carreira: os rivais do campeonato antigo não vêm junto */
        if(pendente.sk){
          const vieram = nomes.filter(x => pendente.antes.includes(x));
          if(vieram.length > 2) falha(`convite para outra carreira levou junto ${vieram.length} rivais do campeonato antigo: ${vieram.slice(0, 4).join(', ')}`);
        }
        if(cid === pendente.camp) certos++;
        else falha(`aceitou o convite de ${pendente.cat} (${pendente.camp}) e acordou em ${S.season.cat} (${cid})`);
        const tt = J.run(`Hist.temporada('${pendente.camp}', ${S.year})`);
        const reais = tt ? nomes.filter(n => tt.inscritos.some(x => x.name === n)).length : 0;
        exemplos.push(`${S.year} ${S.season.cat} (${S.series}, ${reais}/${nomes.length} reais)`);
        pendente.ok = true;
      }
    }
  }
  console.log(`  convites: ${vistos} recebidos em 6 carreiras, ${aceitos} aceitos, ${certos} levaram ao campeonato certo — ${exemplos.slice(0, 4).join('; ')}`);
  if(!vistos) falha('nenhum convite de campeonato real em 6 carreiras de piloto forte');
}
console.log(erros ? erros + ' problema(s)' : `banco histórico: escadas sem anacronismo em ${ANOS.length} anos, ${comReal} grids reais na carreira`);
process.exitCode = erros ? 1 : 0;
