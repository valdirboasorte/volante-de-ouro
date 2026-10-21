/* Modo chefe fora da Fórmula 1: as sete séries, nos três caminhos (assumir uma
   equipe real, fundar no topo, começar na base), com decisões ao acaso.
   — nada quebra e nenhum grid tem piloto repetido;
   — as equipes, os pilotos e o calendário são os da série escolhida;
   — fora da F1 não há mercado de motores, regulamento que zera o carro nem teto de gastos;
   — subir da base leva ao topo da própria série, não à F1;
   — o dinheiro tem o tamanho da série;
   — save antigo de chefe (sem série) abre como Fórmula 1.
   Uso: node testes/chefe-series.js [carreiras por série=4]   Não modifica arquivos nem saves. */
const H = require('./base');
const N = +(process.argv[2] || 4);
let falhas = 0, n = 0;
const ok = (c, m) => { n++; if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };

const J = H.carregar({ silencioso:true, seed: 77 });
const run = J.run;
run(require('./chefe-comum'));

const SERIES = ['indy', 'nascar', 'wec', 'fe', 'dtm', 'stock'];
const t0 = Date.now();
const resumo = {};
for(const sk of SERIES){
  const r = resumo[sk] = { erros:0, temporadas:0, dup:0, subiu:0, topoSerie:0, motor:0, teto:0, calendario:true, equipes:true, caixa:[] };
  const de = run(`SERIES['${sk}'].from`);
  for(let k = 0; k < N; k++){
    const modo = ['assumir','criar','base'][k % 3];
    const ano = Math.min(2024, Math.max(de, 1975) + ((k * 7) % Math.max(1, 2024 - Math.max(de, 1975))));
    try {
      const o = { modo, sk, ano, chefe:{ nome:'T', cc:'BR' }, realismo:true, eq:{ nome:'Equipe ' + sk + k, cor:'#123456', cc: sk === 'stock' ? 'BR' : 'US' } };
      if(modo === 'assumir'){
        const lista = JSON.parse(run(`JSON.stringify(eraOfSeries(${ano},'${sk}').teams.map((t,i) => Engine.resolveTeam(t, i, ${ano}, '${sk}') ? i : -1).filter(i => i >= 0))`));
        o.idx = lista[k % lista.length];
      }
      if(modo === 'base'){
        const cats = JSON.parse(run(`JSON.stringify(Chefe.escadaBase(${ano}, '${o.eq.cc}', '${sk}'))`));
        o.cat = cats[cats.length - 1];
      }
      run(`Chefe.novo(${JSON.stringify(o)})`);
      const ini = JSON.parse(run(`JSON.stringify({ sk:C.sk, cat:C.cat, topo:Chefe.ehTopo(), f1:Chefe.ehF1(), motor:C.motor.nome, caixa:C.caixa, topoNome:Chefe.topoNome() })`));
      if(ini.sk !== sk || ini.f1) r.equipes = false;
      if(modo !== 'base' && ini.cat !== ini.topoNome) r.equipes = false;
      r.caixa.push(ini.caixa);
      for(let a = 0; a < 4; a++){
        run('__inverno()');
        const t = JSON.parse(run(`JSON.stringify((() => { const x = __temporada(); const sea = C.temporada;
          const docs = (lineupOf('${sk}', sea.ano) || {});
          const nossosNomes = new Set(C.pilotos.map(p => p.nome));
          const reais = sea.isTop ? sea.field.filter(f => f.teamId !== 'EU').filter(f => docs[f.name]).length : 0;
          return { dup:x.dup, cat:x.cat, ano:x.ano, isTop: sea.isTop, sk: sea.sk, reais, campo: sea.field.length,
            pistas: sea.calendar.length, motorF1: !!C.motor.nome || !!C.motor.proprio, teto: Chefe.teto() != null,
            est: !!x.b.estouro, fal: !!x.b.falencia, dem: !!(x.b.aval && x.b.aval.demitido) }; })())`));
        r.temporadas++;
        if(t.dup.length){ r.dup++; console.log('  DUPLICADO', sk, t.ano, t.cat, t.dup.join(',')); }
        if(t.sk !== sk) r.calendario = false;
        if(t.isTop) r.topoSerie++;
        if(t.motorF1) r.motor++;
        if(t.teto) r.teto++;
        if(modo === 'base' && t.isTop) r.subiu++;
        if(t.fal){ if(run(`C.modo === 'assumir' && C.dir && C.dir.dono !== 'conselho'`)) run(`Chefe.lancar('dono', C.balanco.falencia.divida); C.balanco.falencia = null;`); else run('Chefe.resgatar()'); }
        if(t.est) run(`Chefe.resolverTeto('declarar')`);
        if(run('!!C.vendida')) break;
        if(t.dem){ const props = JSON.parse(run('JSON.stringify(Chefe.propostasEmprego())')); if(!props.length) break; run(`Chefe.assumirOutra(${JSON.stringify(props[0])})`); continue; }
        run('Chefe.proximoAno()');
      }
      run('C = JSON.parse(JSON.stringify(C))');
    } catch(e){ r.erros++; console.log('ERRO', sk, modo, ano, '→', e.stack.split('\n').slice(0, 4).join(' | ')); }
  }
}
SERIES.forEach(sk => {
  const r = resumo[sk];
  ok(r.erros === 0 && r.dup === 0, `${sk}: ${N} carreiras, ${r.temporadas} temporadas, ${r.erros} erros, ${r.dup} grids com repetido`);
  ok(r.equipes && r.calendario, `${sk}: a equipe, a categoria e o calendário são da série`);
  ok(r.motor === 0 && r.teto === 0, `${sk}: sem mercado de motores e sem teto de gastos da F1`);
});
/* o dinheiro tem o tamanho da série */
{
  const caixaF1 = JSON.parse(run(`JSON.stringify((() => { Chefe.novo({ modo:'criar', sk:'f1', ano:2015, chefe:{ nome:'T', cc:'BR' }, realismo:true, eq:{ nome:'X', cor:'#123456', cc:'GB' } }); return C.caixa; })())`));
  const caixaStock = JSON.parse(run(`JSON.stringify((() => { Chefe.novo({ modo:'criar', sk:'stock', ano:2015, chefe:{ nome:'T', cc:'BR' }, realismo:true, eq:{ nome:'Y', cor:'#123456', cc:'BR' } }); return C.caixa; })())`));
  ok(caixaStock < caixaF1 * .1, `fundar na Stock Car custa uma fração da F1 (${Math.round(caixaStock / 1e6)} mi contra ${Math.round(caixaF1 / 1e6)} mi)`);
}
/* subir da base vai ao topo da própria série */
{
  const r = JSON.parse(run(`JSON.stringify((() => {
    Chefe.novo({ modo:'base', sk:'indy', ano:2012, cat:null, chefe:{ nome:'T', cc:'BR' }, realismo:true, eq:{ nome:'Z', cor:'#123456', cc:'US' } });
    C.cat = C.escada[C.escada.length - 1]; C.hist = [{ ano:2011, pos:1 }]; C.rep = 80; C.caixa = 1e9;
    C.inv.subir = Chefe.opcaoSubir();
    const alvo = C.inv.subir && C.inv.subir.alvo;
    const res = Chefe.subir(false);
    return { alvo, ok: res.ok || res.negado, cat: C.cat, topo: Chefe.ehTopo(), f1: Chefe.ehF1() }; })())`));
  ok(r.alvo && r.alvo !== 'Fórmula 1' && (!r.topo || (r.cat === r.alvo && !r.f1)), `da Indy Lights o próximo degrau é ${r.alvo}, não a F1`);
}
/* save antigo de chefe, sem série, abre como F1 */
{
  const r = JSON.parse(run(`JSON.stringify((() => {
    Chefe.novo({ modo:'criar', sk:'f1', ano:2010, chefe:{ nome:'T', cc:'BR' }, realismo:true, eq:{ nome:'Velha', cor:'#123456', cc:'GB' } });
    delete C.sk; delete C.topo;
    return { sk: Chefe.sk(), f1: Chefe.ehF1(), topo: Chefe.ehTopo(), cat: C.cat }; })())`));
  ok(r.sk === 'f1' && r.f1 && r.topo && r.cat === 'Fórmula 1', 'save de chefe sem série abre como Fórmula 1');
}
console.log(falhas ? falhas + ' falha(s) de ' + n : `chefe nas séries: ${n} verificações, tudo certo (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
if(falhas) process.exitCode = 1;
