/* O piloto automático do modo chefe, usado pelos testes de carreiras de chefe:
   decide o inverno ao acaso (__inverno) e corre uma temporada inteira (__temporada),
   com projetos de peça e o acerto deixado com o engenheiro de vez em quando. */
module.exports = `
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
      /* com as peças (F1 e Endurance): projeta de vez em quando e fabrica o que fica pronto e é melhor */
      if(Pecas.ativo()){
        const P = Pecas.P();
        if(Math.random() < .35 && C.caixa > 0){ const ps = Pecas.partes(), p = __pick(ps); Pecas.projetar(p, __pick(Object.keys(Pecas.PARTES[p].w)), __pick([0, 1, 2])); }
        P.proj.filter(x => x.st === 'pronto').forEach(x => { if(x.dif > 0) Pecas.fabricar(x.e, __pick([1, 2])); else Pecas.arquivar(x.id); });
        if(Math.random() < .5) [0, 1].forEach(k => { if(Acerto.ativo()) Acerto.auto(k); });
      }
      const rec = Chefe.correr(); delete rec.tl;
      Chefe.sortearEvento(rec);
      if(C.evento){ const def = CH_EVENTOS.find(e => e.k === C.evento.k); Chefe.resolverEvento(Math.floor(Math.random() * def.ops.length)); }
    }
    const b = Chefe.fimDeTemporada();
    return { b, dup, cat: sea.cat, ano: sea.ano, nomes };
  };
`;
