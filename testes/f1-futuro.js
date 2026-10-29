/* A F1 depois dos dados reais (modo piloto).
   — até 2026 o grid é o de verdade, e nada muda antes de 2030;
   — a partir de 2030 uma equipe que não é das quatro grandes pode ser vendida e mudar de
     nome e cor (Porsche, Lamborghini, Ford, um grupo privado...);
   — a cada quatro anos (2030, 2034, ...) há 20% de chance de uma equipe nova, até 13
     equipes (26 carros);
   — cada carreira tem a sua história, e recarregar não muda nada;
   — quem corre pela equipe vendida continua nela, com o nome novo, e fica sabendo.
   Uso: node testes/f1-futuro.js   Não modifica arquivos nem saves. */
'use strict';
const H = require('./base');
let falhas = 0, n = 0;
const ok = (c, m) => { n++; if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };
const js = (J, code) => JSON.parse(J.run('JSON.stringify(' + code + ')'));

const J = H.carregar({ silencioso: true, seed: 1 });
H.novaCarreira(J, { era: 7, ano: 2024, idade: 18, serie: 'f1', nome: 'Futuro Teste' });

/* 1. muitas carreiras */
const r = js(J, `(() => { const out = { antes: 0, cedo: 0, nunca: 0, fora: 0, max: 0, novas: 0, janelas: 0, compras: 0, hist: new Set() };
  const real2026 = Engine.teamsFor('Fórmula 1', 2026, 'f1', 7, 8).map(t => t.name).join(',');
  for(let k = 0; k < 80; k++){
    S.driver.name = 'Carreira ' + k; Engine._f1fut = null;
    const f = Engine.f1Futuro(2070);
    if(Engine.teamsFor('Fórmula 1', 2026, 'f1', 7, 8).map(t => t.name).join(',') !== real2026) out.antes++;
    f.eventos.forEach(e => {
      if(e.ano < 2030) out.cedo++;
      if(e.tipo === 'compra' && Engine.F1_FUTURO.nunca[e.de]) out.nunca++;
      if(e.tipo === 'nova'){ out.novas++; if((e.ano - 2030) % 4) out.fora++; }
      else out.compras++;
    });
    for(let y = 2030; y <= 2070; y += 4) out.janelas++;
    for(let y = 2027; y <= 2070; y++) out.max = Math.max(out.max, Engine.teamsFor('Fórmula 1', y, 'f1', 7, 8).length);
    out.hist.add(f.eventos.map(e => e.ano + e.nome).join('|'));
  }
  out.hist = out.hist.size; return out; })()`);
ok(r.antes === 0 && r.cedo === 0, 'até 2026 o grid é o de verdade, e nada muda antes de 2030');
ok(r.nunca === 0 && r.compras > 0, `equipes vendidas e renomeadas (${r.compras} vendas em 80 carreiras); Red Bull, Ferrari, Mercedes e McLaren nunca`);
ok(r.fora === 0 && r.novas > 0, `equipes novas só nos anos de quatro em quatro desde 2030 (${r.novas} em ${r.janelas} janelas: ${Math.round(r.novas / r.janelas * 100)}%, com o grid às vezes cheio)`);
ok(r.max <= 13, `no máximo 13 equipes: ${r.max * 2} carros no grid`);
ok(r.hist >= 60, `cada carreira tem a sua história (${r.hist} diferentes em 80)`);
const a = js(J, '(() => { S.driver.name = "Carreira 7"; Engine._f1fut = null; const x = JSON.stringify(Engine.f1Futuro(2060).eventos); Engine._f1fut = null; return x === JSON.stringify(Engine.f1Futuro(2060).eventos); })()');
ok(a, 'a mesma carreira tem sempre a mesma história (recarregar não muda nada)');

/* 2. uma carreira na equipe que vai ser vendida */
const c = js(J, `(() => { let nome = null, ev = null;
  for(let k = 0; k < 400 && !ev; k++){ S.driver.name = 'Venda ' + k; Engine._f1fut = null;
    ev = Engine.f1Futuro(2045).eventos.find(e => e.tipo === 'compra' && e.idx === 6 && e.ano <= 2040); if(ev) nome = S.driver.name; }
  return { nome, ev }; })()`);
ok(!!c.ev, `achada uma carreira em que a ${c.ev && c.ev.de} vira ${c.ev && c.ev.nome} em ${c.ev && c.ev.ano}`);
if(c.ev){
  const t = js(J, `(() => { S.driver.name = ${JSON.stringify(c.nome)}; Engine._f1fut = null;
    const antes = Engine.teamsFor('Fórmula 1', ${c.ev.ano - 1}, 'f1', 7, 8).find(t => t.id === 't6'), depois = Engine.teamsFor('Fórmula 1', ${c.ev.ano}, 'f1', 7, 8).find(t => t.id === 't6');
    return { antes: antes.name, depois: depois.name, cor: [antes.color, depois.color], antigos: depois.antigos, novid: Engine.f1Novidades(${c.ev.ano}).map(e => e.nome) }; })()`);
  ok(t.antes === c.ev.de && t.depois === c.ev.nome && t.cor[0] !== t.cor[1] && t.antigos.indexOf(c.ev.de) >= 0,
    `a mesma equipe (mesmo carro, mesmo id) muda de nome e de cor: ${t.antes} → ${t.depois}`);
  /* a temporada da venda, com você nela */
  const s = js(J, `(() => { S.driver.name = ${JSON.stringify(c.nome)}; Engine._f1fut = null;
    S.series = 'f1'; S.year = ${c.ev.ano}; S.catIdx = S.ladder.length - 1; S.team = { id: 't6', name: ${JSON.stringify(c.ev.de)}, color: '#000', str: 70 }; S.papel = null;
    S.season = Engine.buildSeason(); const meus = S.season.field.filter(f => f.teamId === 't6').length;
    return { time: S.team.name, meus, n: S.season.field.length, times: S.season.teams.length }; })()`);
  ok(s.time === c.ev.nome && s.meus >= 2, `na temporada da venda você continua no mesmo carro, agora da ${s.time}`);
  ok(s.n <= 26 && s.n === s.times * 2, `o grid tem dois carros por equipe: ${s.n} carros, ${s.times} equipes`);
  const tx = js(J, `(() => { const e = Engine.f1Novidades(${c.ev.ano}).find(x => x.idx === 6); return !!e; })()`);
  ok(tx, 'o começo da temporada avisa a venda');
}

console.log(falhas ? `\n${falhas} de ${n} verificações falharam` : `\nF1 depois de 2026: ${n} verificações, tudo certo`);
process.exit(falhas ? 1 : 0);
