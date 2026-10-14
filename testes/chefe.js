/* Carreiras de chefe com decisões aleatórias: erros, duplicados, continuidade */
const H = require('./base');
const N = +(process.argv[2] || 20), SEMENTE_ANO = process.argv[3] ? +process.argv[3] : null;
const J = H.carregar();
const run = J.run;
run(`
  globalThis.__pick = a => a[Math.floor(Math.random() * a.length)];
  globalThis.__inverno = function(){
    const inv = C.inv;
    while(inv.decisoes.length) Chefe.resolverSaida(inv.decisoes[0], __pick(['liberar','aumento','segurar']));
    C.pilotos.filter(p => p.venceu).forEach(p => { if(Math.random() < .6) Chefe.negociar(p, { sal:1, anos:__pick([1,2]), n1:false, papel:p.papel }); });
    if(Math.random() < .15 && Chefe.titulares().length) Chefe.dispensar(__pick(Chefe.titulares()));
    let g = 0;
    while(Chefe.titulares().filter(p => !p.venceu).length < 2 && g++ < 25){
      const p = __pick(inv.mercado); if(!p) break;
      const r = inv.tent.pil < 6 ? Chefe.negociar(p, { sal:__pick([.85,1,1.3]), anos:__pick([1,2,3]), n1:Math.random() < .3, papel:'titular' }) : { ok:false };
      if(!r.ok){ if(r.contra) Chefe.assinar(p, { sal:1, anos:1, n1:false, papel:'titular', salFixo:r.contra }, 1);
                 else if(inv.tent.pil >= 6) Chefe.assinar(p, { sal:1, anos:1, n1:false, papel:'titular' }, 1); }
    }
    if(!Chefe.pilotoDe('teste') && inv.mercado.length && Math.random() < .5) Chefe.assinar(__pick(inv.mercado), { sal:1, anos:1, n1:false, papel:'teste' }, 1);
    if(Chefe.ehF1() && !C.motor.proprio && !C.motor.nome){
      const r = Chefe.escolherMotor(__pick(Chefe.motoresDe(C.ano)).nome, __pick([1,2,3]));
      if(!r.ok) Chefe.escolherMotor(Chefe.motorObrigado().nome, 1);
    }
    Chefe.areasAtivas().forEach(a => C.plano[a] = Math.floor(Math.random() * 5));
    if(Math.random() < .3 && inv.staffMerc.length && inv.tent.staff < 4) Chefe.contratarStaff(__pick(inv.staffMerc), __pick([1, 1.25, 1.5]));
    inv.patro.slice().forEach(sp => { if(Math.random() < .6) Chefe.aceitarPatro(sp); });
    C.acad = Math.floor(Math.random() * 4);
    if(Math.random() < .5 && inv.olheiros.length && Chefe.academia().length < 4){
      const p = inv.olheiros.shift(); p.papel = 'academia'; p.ate = C.ano + 3; p.sal = 0; C.pilotos.push(p); Chefe.ligar(p);
    }
    Chefe.academia().forEach(p => { if(Chefe.idade(p) >= 18 && Math.random() < .2 && Chefe.ehF1() && Chefe.hab(p) >= 64){ p.papel = 'emprestado'; p.ate = C.ano; } });
    if(inv.investidores.length && Math.random() < .15) Chefe.aceitarInvestidor(__pick(inv.investidores));
    if(inv.subir && inv.subir.ok && Math.random() < .8){
      Chefe.subir(inv.subir.topo ? true : C.caixa < inv.subir.custo);
      if(Chefe.ehF1() && !C.motor.nome && !C.motor.proprio) Chefe.escolherMotor(Chefe.motorObrigado().nome, 1);
    }
    while(Chefe.titulares().filter(p => !p.venceu).length < 2 && C.inv.mercado.length)
      Chefe.assinar(C.inv.mercado[0], { sal:1, anos:1, n1:false, papel:'titular' }, 1);
  };
  globalThis.__temporada = function(){
    Chefe.comecarTemporada();
    const sea = C.temporada;
    const nomes = sea.field.map(f => f.name);
    const dup = nomes.filter((x, i) => nomes.indexOf(x) !== i);
    while(sea.round < sea.calendar.length){
      if(Chefe.janelaPacote() != null && Math.random() < .5) Chefe.levarPacote(__pick(Chefe.areasAtivas().filter(x => x !== 'futuro')), __pick([1,2,3]));
      const rec = Chefe.correr(); delete rec.tl;
      Chefe.sortearEvento(rec);
      if(C.evento){ const def = CH_EVENTOS.find(e => e.k === C.evento.k); Chefe.resolverEvento(Math.floor(Math.random() * def.ops.length)); }
    }
    const b = Chefe.fimDeTemporada();
    return { b, dup, cat: sea.cat, ano: sea.ano, nomes };
  };
`);
let erros = 0, temporadas = 0, dupTot = 0, contTot = 0, contN = 0;
const t0 = Date.now();
const eras = JSON.parse(run('JSON.stringify(ERAS.map(e => e.y))'));
for(let k = 0; k < N; k++){
  const modo = ['assumir','criar','base'][k % 3];
  const ano = SEMENTE_ANO || Math.min(2026, eras[Math.floor(Math.random() * eras.length)] + Math.floor(Math.random() * 10));
  try {
    const o = { modo, ano, chefe:{ nome:'T', cc:'BR' }, realismo: Math.random() < .7, eq:{ nome:'Equipe ' + k, cor:'#123456', cc:'BR' } };
    if(modo === 'assumir'){
      const lista = JSON.parse(run(`JSON.stringify(eraOfSeries(${ano},'f1').teams.map((t,i) => Engine.resolveTeam(t, i, ${ano}, 'f1') ? i : -1).filter(i => i >= 0))`));
      o.idx = lista[Math.floor(Math.random() * lista.length)];
    }
    if(modo === 'base'){
      const cats = JSON.parse(run(`JSON.stringify(Chefe.escadaBase(${ano}, 'BR'))`));
      o.cat = cats[Math.floor(Math.random() * cats.length)];
    }
    run(`Chefe.novo(${JSON.stringify(o)})`);
    let antes = null;
    const anos = 4 + Math.floor(Math.random() * 7);
    for(let a = 0; a < anos; a++){
      run('__inverno()');
      const r = JSON.parse(run('JSON.stringify((() => { const x = __temporada(); return { dup:x.dup, cat:x.cat, ano:x.ano, nomes:x.nomes, est:!!x.b.estouro, fal:!!x.b.falencia, dem:!!(x.b.aval && x.b.aval.demitido) }; })())'));
      temporadas++;
      if(r.dup.length){ dupTot++; console.log('  DUPLICADO', modo, r.ano, r.cat, r.dup.join(',')); }
      if(antes && antes.cat === r.cat){ contTot += r.nomes.filter(x => antes.nomes.includes(x)).length / r.nomes.length; contN++; }
      antes = r;
      if(r.est) run(`Chefe.resolverTeto('declarar')`);
      if(r.fal){ if(run(`C.modo === 'assumir' && C.dir && C.dir.dono !== 'conselho'`)) run(`Chefe.lancar('dono', C.balanco.falencia.divida); C.balanco.falencia = null;`); else run('Chefe.resgatar()'); }
      if(run('!!C.vendida')) break;
      if(r.dem){ const props = JSON.parse(run('JSON.stringify(Chefe.propostasEmprego())')); if(!props.length) break; run(`Chefe.assumirOutra(${JSON.stringify(props[0])})`); continue; }
      run('Chefe.proximoAno()');
    }
    /* o save tem de caber e reabrir */
    const tam = run('JSON.stringify(C).length');
    run('C = JSON.parse(JSON.stringify(C))');
    if(tam > 2.5e6) console.log('  save grande:', tam);
  } catch(e){ erros++; console.log('ERRO', modo, ano, '→', e.stack.split('\n').slice(0, 4).join(' | ')); }
}
console.log(`${N} carreiras, ${temporadas} temporadas, ${erros} erros, ${dupTot} grids com duplicado, continuidade média na mesma categoria ${(contTot / Math.max(1, contN) * 100).toFixed(0)}%, ${((Date.now() - t0) / 1000).toFixed(1)}s`);

if(erros || dupTot) process.exitCode = 1;
