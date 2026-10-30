/* Duas equipes humanas no mesmo mundo do modo chefe, sem servidor (o motor no Node):
   duas temporadas inteiras com decisões automáticas, conferindo a cada etapa que o mundo
   é um só e cada equipe é só dela.
   Uso: node testes/chefe-mp.mjs   (gere o motor antes: node ferramentas/gerar-motor.mjs) */
import { criarMotor } from '../src/gerado/motor-jogo.js';
import { ambienteFalso } from '../src/pagina-falsa.js';
import { criarMundo, perspectiva, agir, faseDupla, corrida, CHAVES, MUNDO } from '../src/chefe-mp.js';

let ok = 0, falhas = 0;
const checar = (nome, cond, detalhe) => { if(cond){ ok++; console.log('  ✓ ' + nome); } else { falhas++; console.log('  ✗ ' + nome + (detalhe === undefined ? '' : ' — ' + JSON.stringify(detalhe).slice(0, 500))); } return !!cond; };

const amb = ambienteFalso({ seed: 11 });
const J = criarMotor(amb); J.amb = amb; J.Saves.auto = false;

/* duas equipes reais de 2024: uma do meio e uma de trás */
const l = J.eraOfSeries(2024, 'f1').teams.map((t, i) => [i, J.Engine.resolveTeam(t, i, 2024, 'f1')]).filter(x => x[1]).sort((a, b) => b[1].str - a[1].str);
const equipes = { 0: { chefe: 'Ana', idx: l[3][0] }, 1: { chefe: 'Bia', idx: l[7][0] } };
const mundo = criarMundo(J, { sk: 'f1', ano: 2024, anfitriao: 0, convidado: 1, equipes });
const nomeEq = s => perspectiva(mundo, s).eq.nome;
console.log(`\nMundo criado: ${nomeEq(0)} (Ana, anfitriã) × ${nomeEq(1)} (Bia)`);

/* nenhuma chave do save fica sem dono */
{
  const C = perspectiva(mundo, 0), conhecidas = new Set([...CHAVES.raiz, ...MUNDO, 'mpOutras']);
  const soltas = Object.keys(C).filter(k => !conhecidas.has(k));
  checar('toda chave do save é do mundo ou da equipe', !soltas.length, soltas);
}
{
  const A = perspectiva(mundo, 0), B = perspectiva(mundo, 1);
  const pilA = A.pilotos.map(p => p.nome), pilB = B.pilotos.map(p => p.nome);
  checar('cada equipe começa com os pilotos dela, sem ninguém nas duas', pilA.length >= 2 && pilB.length >= 2 && !pilA.some(n => pilB.includes(n)), { pilA, pilB });
  checar('o mercado não oferece os pilotos de nenhuma das duas', !A.inv.mercado.some(p => pilA.includes(p.nome) || pilB.includes(p.nome)) && !B.inv.mercado.some(p => pilA.includes(p.nome) || pilB.includes(p.nome)));
  const idsA = A.pilotos.map(p => p.id), idsB = B.pilotos.map(p => p.id);
  checar('os ids de pilotos das duas equipes não se cruzam', !idsA.some(i => idsB.includes(i)), { idsA, idsB });
}

/* o inverno automático, por equipe (o mesmo espírito do piloto automático dos testes do jogo) */
function inverno(J, C){
  const inv = C.inv, Ch = J.Chefe;
  while(inv.decisoes.length) Ch.resolverSaida(inv.decisoes[0], 'segurar');
  C.pilotos.filter(p => p.venceu).forEach(p => Ch.negociar(p, { sal: 1.2, anos: 2, n1: false, papel: p.papel }));
  let g = 0;
  while(Ch.titulares().filter(p => !p.venceu).length < 2 && g++ < 30 && inv.mercado.length){
    const p = inv.mercado[(g * 7) % inv.mercado.length];
    const r = inv.tent.pil < 6 ? Ch.negociar(p, { sal: 1.3, anos: 2, n1: false, papel: 'titular' }) : { ok: false };
    if(!r.ok) Ch.assinar(p, { sal: 1, anos: 1, n1: false, papel: 'titular', salFixo: r.contra }, 1);
  }
  if(Ch.ehF1() && !C.motor.proprio && !C.motor.nome){
    const r = Ch.escolherMotor(Ch.motoresDe(C.ano)[0].nome, 1);
    if(!r.ok) Ch.escolherMotor(Ch.motorObrigado().nome, 1);
  }
  inv.patro.slice().forEach(sp => Ch.aceitarPatro(sp));
}

/* 1. o mercado é um só: quem uma equipe contrata some do mercado da outra */
{
  const alvo = perspectiva(mundo, 0).inv.mercado.find(p => p.real) || perspectiva(mundo, 0).inv.mercado[0];
  const r = agir(J, mundo, 0, (J, C) => J.Chefe.assinar(C.inv.mercado.find(p => p.nome === alvo.nome), { sal: 1, anos: 1, n1: false, papel: 'teste' }, 1));
  const B = perspectiva(mundo, 1);
  checar(`mercado único: a Ana contrata ${alvo.nome} e ele some do mercado da Bia`, !B.inv.mercado.some(p => p.nome === alvo.nome) && perspectiva(mundo, 0).pilotos.some(p => p.nome === alvo.nome), r);
  checar('e entra na lista de quem é da outra equipe, para a Bia', B.mpOutras[0].reservados.includes(alvo.nome));
}

const caixa = s => perspectiva(mundo, s).caixa;
for(let temporada = 1; temporada <= 2; temporada++){
  console.log(`\nTemporada ${temporada}`);
  const cx0 = [caixa(0), caixa(1)];
  for(const s of [0, 1]) agir(J, mundo, s, inverno);
  checar('no inverno, a decisão de uma equipe não mexe no caixa da outra', (() => {
    const antes = caixa(1); agir(J, mundo, 0, (J) => { J.Chefe.contratarStaff && J.C.inv.staffMerc[0] && J.Chefe.contratarStaff(J.C.inv.staffMerc[0], 1); }); return caixa(1) === antes; })());
  faseDupla(J, mundo, J => J.Chefe.comecarTemporada());
  const A0 = perspectiva(mundo, 0), B0 = perspectiva(mundo, 1);
  checar('a temporada começa igual para as duas (mesmo calendário, mesmas equipes)', A0.temporada.calendar.map(c => c.id).join() === B0.temporada.calendar.map(c => c.id).join()
    && A0.temporada.teams.length === B0.temporada.teams.length && A0.temporada.teams.some(t => t.id === 'EU2' && t.name === B0.eq.nome), { ta: A0.temporada.teams.map(t => t.id + ':' + t.name) });
  let etapas = 0, errosEtapa = [];
  while(mundo.base.temporada.round < mundo.base.temporada.calendar.length && etapas < 30){
    const rec = corrida(J, mundo); etapas++;
    const A = perspectiva(mundo, 0), B = perspectiva(mundo, 1), sA = A.temporada, sB = B.temporada;
    const ativos = (s, id) => s.field.filter(f => f.teamId === id && f.ativo !== false).length;
    const nomes = sA.field.map(f => f.name), dup = nomes.filter((n, i) => nomes.indexOf(n) !== i);
    const titA = A.pilotos.map(p => p.nome), titB = B.pilotos.map(p => p.nome);
    const prob = [];
    if(ativos(sA, 'EU') !== 2 || ativos(sA, 'EU2') !== 2 || ativos(sB, 'EU') !== 2 || ativos(sB, 'EU2') !== 2) prob.push('carros ' + [ativos(sA, 'EU'), ativos(sA, 'EU2'), ativos(sB, 'EU'), ativos(sB, 'EU2')]);
    if(dup.length) prob.push('repetidos ' + dup);
    if((sA.cstand.EU || 0) !== (sB.cstand.EU2 || 0) || (sA.cstand.EU2 || 0) !== (sB.cstand.EU || 0)) prob.push('construtores ' + JSON.stringify([sA.cstand.EU, sA.cstand.EU2, sB.cstand.EU, sB.cstand.EU2]));
    if(sA.round !== sB.round) prob.push('rodadas ' + sA.round + '/' + sB.round);
    if(!rec[0].nossos.every(x => titA.includes(x.nome) || !x.pid) || !rec[1].nossos.every(x => titB.includes(x.nome) || !x.pid)) prob.push('nossos trocados');
    if(rec[0].venc !== rec[1].venc || rec[0].pole !== rec[1].pole) prob.push('corridas diferentes: ' + rec[0].venc + '/' + rec[1].venc);
    if((sA.results || []).length !== (sB.results || []).length) prob.push('históricos ' + sA.results.length + '/' + sB.results.length);
    if(prob.length) errosEtapa.push('etapa ' + sA.round + ': ' + prob.join('; '));
  }
  const A = perspectiva(mundo, 0), B = perspectiva(mundo, 1);
  checar(`${etapas} etapas corridas, as duas na mesma rodada até o fim`, etapas === A.temporada.calendar.length && A.temporada.round === etapas && B.temporada.round === etapas);
  checar('em todas: dois carros de cada humana, ninguém repetido, construtores e vencedores iguais nos dois lados, cada uma com os seus', !errosEtapa.length, errosEtapa.slice(0, 4));
  const ptsA = (A.temporada.results || []).reduce((s, r) => s + r.pts, 0), ptsB = (B.temporada.results || []).reduce((s, r) => s + r.pts, 0);
  checar(`os pontos de cada equipe batem com a tabela: ${A.eq.nome} ${ptsA}, ${B.eq.nome} ${ptsB}`, ptsA === (A.temporada.cstand.EU || 0) && ptsB === (B.temporada.cstand.EU || 0), { ptsA, ptsB, cs: A.temporada.cstand });
  checar('o caixa das duas mudou com a temporada (prêmios, salários, patrocínios)', caixa(0) !== cx0[0] && caixa(1) !== cx0[1], { antes: cx0, depois: [caixa(0), caixa(1)] });
  faseDupla(J, mundo, J => J.Chefe.fimDeTemporada());
  const bA = perspectiva(mundo, 0).balanco, bB = perspectiva(mundo, 1).balanco;
  checar('cada equipe tem o seu balanço do ano', !!bA && !!bB && JSON.stringify(bA) !== JSON.stringify(bB));
  faseDupla(J, mundo, J => J.Chefe.proximoAno());
  const A2 = perspectiva(mundo, 0), B2 = perspectiva(mundo, 1);
  checar(`ano novo para as duas (${A2.ano}), com inverno e mercado únicos`, A2.ano === 2024 + temporada && B2.ano === A2.ano && A2.fase === 'inverno' && B2.fase === 'inverno'
    && A2.inv.mercado.map(p => p.nome).join() === B2.inv.mercado.map(p => p.nome).join(), { a: A2.fase, b: B2.fase });
  const soltas = Object.keys(A2).filter(k => !new Set([...CHAVES.raiz, ...MUNDO, 'mpOutras']).has(k));
  checar('depois de um ano inteiro, toda chave do save continua com dono', !soltas.length, soltas);
}

console.log(falhas ? `\n${falhas} de ${ok + falhas} verificações falharam` : `\nchefe com duas equipes: ${ok} verificações, tudo certo`);
process.exit(falhas ? 1 : 0);
