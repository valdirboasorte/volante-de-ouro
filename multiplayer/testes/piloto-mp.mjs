/* Dois pilotos humanos no mesmo mundo do modo piloto, sem servidor (o motor no Node).
   Duas variantes de dois anos cada: na mesma categoria (uma temporada dividida) e em
   categorias diferentes (cada um na sua, com as etapas andando juntas).
   Uso: node testes/piloto-mp.mjs   (gere o motor antes: node ferramentas/gerar-motor.mjs) */
import { criarMotor } from '../src/gerado/motor-jogo.js';
import { ambienteFalso } from '../src/pagina-falsa.js';
import { criarMundo, perspectiva, rodadaDeCorridas, anoAcabou, fimDoAno, anoNovo, agir, chaveDe, MUNDO, TEMP_PILOTO } from '../src/piloto-mp.js';

let ok = 0, falhas = 0;
const checar = (nome, cond, detalhe) => { if(cond){ ok++; console.log('  ✓ ' + nome); } else { falhas++; console.log('  ✗ ' + nome + (detalhe === undefined ? '' : ' — ' + JSON.stringify(detalhe).slice(0, 500))); } return !!cond; };

function novoMotor(seed){ const amb = ambienteFalso({ seed }); const J = criarMotor(amb); J.amb = amb; J.Saves.auto = false; return J; }

/* a melhor proposta da mesma série, como o piloto automático dos testes do jogo */
function escolher(S){
  let melhor = -1, nota = -1e9;
  (S.pendingOffers || []).forEach((of, i) => {
    if(of.podeP === false || (of.sk && of.sk !== S.series)) return;
    let v = of.team ? of.team.str : 0;
    if(of.up || of.pulo) v += 50; if(of.down) v -= 30;
    if(v > nota){ nota = v; melhor = i; }
  });
  return melhor;
}
const nomesDoRegistro = S => Object.values((S.mundos[S.series] || {}).p || {}).map(r => r.n);

function variante(titulo, seed, cfgA, cfgB, anos){
  console.log('\n' + titulo);
  const J = novoMotor(seed);
  const mundo = criarMundo(J, { serie: 'f1', ano: 2024, anfitriao: 0, convidado: 1, pilotos: { 0: cfgA, 1: cfgB } });
  for(let ano = 1; ano <= anos; ano++){
    const A0 = perspectiva(mundo, 0), B0 = perspectiva(mundo, 1);
    const mesma = chaveDe(A0) === chaveDe(B0);
    console.log(`  ano ${A0.year}: ${cfgA.nome} na ${A0.season.cat} (${A0.team && A0.team.name}), ${cfgB.nome} na ${B0.season.cat} (${B0.team && B0.team.name})`);
    checar('a categoria de cada um é a da temporada dele', A0.season.cat === A0.ladder[A0.catIdx] && B0.season.cat === B0.ladder[B0.catIdx], [A0.season.cat, A0.ladder[A0.catIdx]]);
    {
      const soltas = Object.keys(A0).filter(k => k === 'season' || k === 'mpOutros').length === 2;
      checar('a perspectiva traz a temporada e o outro piloto humano', soltas && A0.mpOutros[0].name === cfgB.nome && A0.mpOutros[0].aqui === mesma);
    }
    if(mesma){
      const a = A0.season.field, b = B0.season.field;
      checar('mesma categoria: uma temporada só, com os dois — cada um é o ME do seu lado e o ME2 do outro',
        a.find(f => f.id === 'ME').name === cfgA.nome && a.find(f => f.id === 'ME2').name === cfgB.nome
        && b.find(f => f.id === 'ME').name === cfgB.nome && b.find(f => f.id === 'ME2').name === cfgA.nome
        && a.filter(f => f.isMe).length === 1 && b.filter(f => f.isMe).length === 1
        && JSON.stringify(A0.season.calendar) === JSON.stringify(B0.season.calendar),
        a.filter(f => f.id === 'ME' || f.id === 'ME2').map(f => f.id + ':' + f.name));
    } else {
      checar('categorias diferentes: cada um sozinho na sua, e nenhum dos dois aparece como piloto da IA na do outro',
        !A0.season.field.some(f => f.id === 'ME2' || f.name === cfgB.nome) && !B0.season.field.some(f => f.id === 'ME2' || f.name === cfgA.nome));
    }
    const nomes = A0.season.field.map(f => f.name);
    checar('ninguém repetido no grid', nomes.length === new Set(nomes).size, nomes.filter((n, i) => nomes.indexOf(n) !== i));

    let rodadas = 0; const erros = [];
    const dinheiro0 = [A0.money && A0.money.saldo, B0.money && B0.money.saldo];
    const nmax = Math.max(A0.season.calendar.length, B0.season.calendar.length);
    while(!anoAcabou(mundo) && rodadas < 40){
      rodadaDeCorridas(J, mundo); rodadas++;
      const A = perspectiva(mundo, 0), B = perspectiva(mundo, 1), sA = A.season, sB = B.season;
      if(mesma){
        if(sA.round !== sB.round) erros.push(`rodada ${rodadas}: etapas ${sA.round}/${sB.round}`);
        if((sA.dstand.ME || 0) !== (sB.dstand.ME2 || 0) || (sA.dstand.ME2 || 0) !== (sB.dstand.ME || 0)) erros.push(`rodada ${rodadas}: pontos ${[sA.dstand.ME, sA.dstand.ME2, sB.dstand.ME, sB.dstand.ME2]}`);
        if(sA.results.length !== sA.round || sB.results.length !== sB.round) erros.push(`rodada ${rodadas}: históricos ${sA.results.length}/${sB.results.length}`);
        const rA = sA.results[sA.results.length - 1], rB = sB.results[sB.results.length - 1];
        if(rA && rB && JSON.stringify(rA.top.map(x => x.n + x.pos)) !== JSON.stringify(rB.top.map(x => x.n + x.pos))) erros.push(`rodada ${rodadas}: chegadas diferentes`);
        if(rA && rB && (rA.pos !== (rB.top.find(x => x.n === cfgA.nome) || {}).pos) && rA.pos && rA.pos <= 10) erros.push(`rodada ${rodadas}: a posição de ${cfgA.nome} difere entre os lados`);
      } else {
        const fa = sA.round / sA.calendar.length, fb = sB.round / sB.calendar.length;
        if(Math.abs(fa - fb) > 1 / Math.min(sA.calendar.length, sB.calendar.length) + 1e-9) erros.push(`rodada ${rodadas}: compasso ${sA.round}/${sA.calendar.length} × ${sB.round}/${sB.calendar.length}`);
      }
      const nm = sA.field.map(f => f.name); if(nm.length !== new Set(nm).size) erros.push(`rodada ${rodadas}: repetidos`);
    }
    checar(`${rodadas} rodadas da sala: as temporadas acabam juntas, na rodada do calendário mais longo (${nmax})`, anoAcabou(mundo) && rodadas === nmax, rodadas);
    checar('em toda rodada: as duas visões batem (etapa, pontos, chegada, histórico) e ninguém repetido', !erros.length, erros.slice(0, 4));
    const A1 = perspectiva(mundo, 0), B1 = perspectiva(mundo, 1);
    const somaA = A1.season.results.reduce((s, r) => s + (r.pts || 0), 0), somaB = B1.season.results.reduce((s, r) => s + (r.pts || 0), 0);
    checar(`cada um com os próprios resultados: os pontos do histórico batem com a tabela (${cfgA.nome} ${somaA}, ${cfgB.nome} ${somaB})`,
      somaA === (A1.season.dstand.ME || 0) && somaB === (B1.season.dstand.ME || 0) && A1.season.results.length === A1.season.calendar.length,
      { somaA, somaB, tA: A1.season.dstand.ME, tB: B1.season.dstand.ME });
    checar('nenhum dos dois pilotos humanos entrou no registro do mundo como piloto da IA', !nomesDoRegistro(A1).includes(cfgA.nome) && !nomesDoRegistro(A1).includes(cfgB.nome));
    const hist0 = [A1.history.length, B1.history.length];
    fimDoAno(J, mundo);
    /* a academia, se aparecer, fica de lado: as propostas vêm direto */
    for(const s of [0, 1]) agir(J, mundo, s, (J, S) => {
      if(S.academyOffers && S.academyOffers.length){ S.academyOffers = null; S.lastSum = J.Engine.summary(S.season); J.Game.showOffers(S.lastSum); }
    }, { temporada: false });
    const A2 = perspectiva(mundo, 0), B2 = perspectiva(mundo, 1);
    checar('fim do ano: cada um com o seu balanço no histórico e as suas propostas', A2.history.length === hist0[0] + 1 && B2.history.length === hist0[1] + 1
      && (A2.pendingOffers || []).length > 0 && (B2.pendingOffers || []).length > 0, { h: [A2.history.length, B2.history.length], of: [(A2.pendingOffers || []).length, (B2.pendingOffers || []).length] });
    checar('fim do ano: a tela de balanço de cada um fica guardada (o ano, a posição e a evolução da ficha)',
      [A2, B2].every(P => P.mpBalanco && P.mpBalanco.sum.year === A0.year && P.mpBalanco.sum.pos === P.lastSum.pos && P.mpBalanco.growth && P.mpBalanco.growth.ficha),
      [A2.mpBalanco && A2.mpBalanco.sum && A2.mpBalanco.sum.pos, B2.mpBalanco && B2.mpBalanco.sum && B2.mpBalanco.sum.pos]);
    const esc = { 0: escolher(A2), 1: escolher(B2) };
    const vaiA = A2.pendingOffers[esc[0]], vaiB = B2.pendingOffers[esc[1]];
    anoNovo(J, mundo, esc);
    const A3 = perspectiva(mundo, 0), B3 = perspectiva(mundo, 1);
    checar(`ano novo (${A3.year}) para os dois: ${cfgA.nome} na ${vaiA.team && vaiA.team.name}, ${cfgB.nome} na ${vaiB.team && vaiB.team.name}, temporadas novas montadas`,
      A3.year === A0.year + 1 && B3.year === A3.year && A3.season.year === A3.year && B3.season.year === A3.year && A3.season.round === 0 && B3.season.round === 0
      && !A3.pendingOffers && !B3.pendingOffers && !A3.mpBalanco && !B3.mpBalanco, { anos: [A3.year, B3.year, A3.season.year, B3.season.year] });
    const conhecidas = Object.keys(A3).filter(k => !MUNDO.includes(k));
    checar('o mundo (registro de pilotos) é um só para os dois', JSON.stringify(A3.mundos).length === JSON.stringify(B3.mundos).length && conhecidas.length > 20);
  }
}

variante('Mesma categoria (os dois com 20 anos)', 21, { nome: 'Ana Silva', idade: 20, cc: 'BR' }, { nome: 'Bia Costa', idade: 20, cc: 'PT' }, 2);
variante('Categorias diferentes (16 e 21 anos)', 22, { nome: 'Caio Lima', idade: 16, cc: 'BR' }, { nome: 'Duda Reis', idade: 21, cc: 'AR' }, 2);

console.log(falhas ? `\n${falhas} de ${ok + falhas} verificações falharam` : `\npiloto com dois humanos: ${ok} verificações, tudo certo`);
process.exit(falhas ? 1 : 0);
