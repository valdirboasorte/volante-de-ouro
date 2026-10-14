/* Os recursos novos do modo chefe, um por um, e as janelas que os mostram */
const H = require('./base');
let falhas = 0;
const ok = (c, m) => { if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };
const J = H.carregar();
const run = J.run, html = () => J.E('modal').innerHTML;

/* A. dinheiro de quem funda */
const caixas = {};
['proprio', 'investidor', 'fundo'].forEach(f => {
  run(`Chefe.novo({ modo:'criar', ano:2015, chefe:{ nome:'T', cc:'BR' }, eq:{ nome:'Teste ${f}', cor:'#123456', cc:'BR' }, fin:'${f}' })`);
  caixas[f] = { caixa: run('C.caixa'), part: run('C.part'), conselho: run('!!(C.dir && C.dir.dono === "conselho")') };
});
ok(caixas.proprio.caixa < caixas.investidor.caixa && caixas.investidor.caixa < caixas.fundo.caixa, 'mais dinheiro com o fundo, menos com dinheiro próprio');
ok(caixas.proprio.part === 100 && caixas.fundo.part === 40 && caixas.fundo.conselho, 'o fundo fica com 60% e põe um conselho acima de você');
run(`UIC.n.modo = 'criar'; UIC.n.fin = 'fundo'; UIC.abrir(); UIC.formEquipe();`);
ok(/Um fundo bilionário/.test(J.E('chnEquipe').innerHTML), 'a escolha aparece na ficha de criação');

/* uma equipe para os testes */
run(`Chefe.novo({ modo:'assumir', ano:2018, idx: eraOfSeries(2018,'f1').teams.findIndex((t,i) => { const r = Engine.resolveTeam(t,i,2018,'f1'); return r && r.name === 'Williams'; }), chefe:{ nome:'T', cc:'BR' } })`);
run('UI.show = () => {}; UIC.render = () => {};');

/* B. candidatos com o ano anterior e a ficha */
run('UIC.mercado()');
ok(/Ver trajetória/.test(html()), 'o mercado tem a trajetória de cada candidato');
const comAno = run('C.inv.mercado.filter(p => Chefe.ultimoAno(p)).length');
ok(comAno > 0, comAno + ' candidato(s) com o resultado do ano anterior');
run('UIC.fichaMercado(0)');
ok(/Voltar ao mercado/.test(html()), 'a ficha do candidato volta ao mercado');

/* D. pedir mais ao patrocinador */
const res = { otimo:0, bom:0, morno:0, sumiu:0 };
for(let k = 0; k < 40; k++){
  run(`C.inv.patro = Chefe.ofertasPatrocinio(1)`);
  const v0 = run('C.inv.patro[0].valor');
  run('UIC.pedirPatro(0)');
  const sp = run('C.inv.patro[0]');
  if(!sp) res.sumiu++; else if(sp.valor > v0 * 1.2) res.otimo++; else if(sp.valor > v0) res.bom++; else res.morno++;
}
ok(res.otimo + res.bom > 0 && res.sumiu > 0, `pedir mais: ${res.otimo} aceitaram 25%, ${res.bom} 12%, ${res.morno} mantiveram, ${res.sumiu} desistiram`);

/* E. empréstimo */
const c0 = run('C.caixa');
run('UIC.banco()');
ok(/3 ×/.test(html()), 'o banco mostra as opções com as parcelas');
run('UIC.pegarEmprestimo(1)');
ok(run('C.caixa') > c0 && run('C.divida.restam') === 3, 'o empréstimo entra no caixa e cria 3 parcelas');
ok(run('Chefe.emprestimos().length') === 0, 'não dá para pegar outro antes de quitar');
ok(run('Chefe.projecao().c.banco') > 0, 'a parcela aparece na previsão do ano');

/* F. a meta com a diretoria, e C. o primeiro treino livre */
run(`while(Chefe.titulares().filter(p => !p.venceu).length < 2) Chefe.assinar(C.inv.mercado[0], { sal:1, anos:1, n1:false, papel:'titular' }, 1);
     if(!Chefe.pilotoDe('teste')) Chefe.assinar(C.inv.mercado[0], { sal:1, anos:1, n1:false, papel:'teste' }, 1);
     if(!C.motor.proprio && !C.motor.nome) Chefe.escolherMotor(Chefe.motorObrigado().nome, 1);`);
const parc = run('C.divida.parcela'), c1 = run('C.caixa');
run('UIC.comecar()');
ok(run('C.divida.restam') === 2, 'a primeira parcela venceu no começo do ano');
ok(/A meta com a diretoria/.test(html()), 'a pré-temporada oferece negociar a meta');
const meta0 = run('C.temporada.meta'), aporte0 = run('C.dir.aporte');
run(`UIC.meta('mais')`);
ok(run('C.temporada.meta') === meta0 - 1 && run('C.dir.aporte') > aporte0, 'prometer mais sobe a meta e a verba');
ok(/Para a primeira corrida/.test(html()), 'depois de negociar, dá para seguir');
run('UIC.preCorrida()');
ok(/Primeiro treino livre/.test(html()), 'o fim de semana oferece o primeiro treino ao reserva');
const pid = run('Chefe.pilotoDe("teste").id');
run(`UIC.dec('tl1','','0:${pid}')`);
ok(run('C.decisao.tl1 && C.decisao.tl1.pid') === pid, 'a escolha do treino fica guardada');
const tl0 = run('Chefe.pilotoDe("teste").est.tl1 || 0');
run('const r = Chefe.correr(); delete r.tl;');
ok(run('Chefe.pilotoDe("teste").est.tl1') === tl0 + 1, 'o reserva rodou o treino');
run('while(C.temporada.round < C.temporada.calendar.length){ const r = Chefe.correr(); delete r.tl; }');
const b = run('JSON.stringify(Chefe.fimDeTemporada())');
ok(!!b, 'a temporada fecha com a promessa cobrada');
console.log(falhas ? falhas + ' falha(s)' : 'modo chefe: tudo certo');

if(typeof falhas !== 'undefined' && falhas) process.exitCode = 1;
