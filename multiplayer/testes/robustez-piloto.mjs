/* Robustez do modo piloto (Fase 6), sem servidor: o motor do jogo no Node.
   - Um dos dois encerra a carreira no meio do ano: ele passa a contar como pronto, o ano do outro
     chega ao fim, o ano novo vem só para o outro, e quem saiu fica com a última temporada parada.
   - Uma proposta de outra série vale: o piloto muda de série no ano novo.
   Uso: node testes/robustez-piloto.mjs   (gere o motor antes: node ferramentas/gerar-motor.mjs) */
import { criarMotor } from '../src/gerado/motor-jogo.js';
import { ambienteFalso } from '../src/pagina-falsa.js';
import { criarRnd } from '../src/aleatorio.js';
import { criarRegrasPiloto } from '../src/regras-piloto.js';
import { perspectiva, agir } from '../src/piloto-mp.js';

let ok = 0, falhas = 0;
const checar = (nome, cond, detalhe) => { if(cond){ ok++; console.log('  ✓ ' + nome); } else { falhas++; console.log('  ✗ ' + nome + (detalhe === undefined ? '' : ' — ' + JSON.stringify(detalhe).slice(0, 400))); } return !!cond; };
const amb = ambienteFalso({ seed: 9 }); const J = criarMotor(amb); J.amb = amb; J.Saves.auto = false;
const regras = criarRegrasPiloto(() => J);

/* joga até o mercado; no mercado, cada um (que pode) escolhe com escolher(slot, P) */
function ate(mundo, codigo, N, cond, escolher){
  let g = 0;
  while(!cond(mundo) && g++ < 40){
    if(mundo.fase === 'mercado') for(const s of ['0', '1']){
      const P = perspectiva(mundo, s);
      if(P.retired) continue;
      if(P.academyOffers && P.academyOffers.length) regras.acoes.academia.aplicar(mundo, s, { i: null }, { codigo, id: 'a' + N + s });
      const i = escolher(s, perspectiva(mundo, s));
      if(i !== undefined) regras.acoes.escolherOferta.aplicar(mundo, s, { i }, { codigo, id: 'e' + N + s });
    }
    mundo = regras.processar(mundo, N, criarRnd(codigo, N)).mundo; N++;
  }
  return { mundo, N };
}
const melhor = (s, P) => { const of = P.pendingOffers || []; const i = of.findIndex(o => o.podeP !== false && !o.retirada); return i < 0 ? undefined : i; };

console.log('\nUm piloto encerra a carreira no meio do ano');
{
  const codigo = 'ROBUSTA1';
  let mundo = regras.iniciar([{ slot: 0 }, { slot: 1 }], { config: { serie: 'f1', ano: 2024, pilotos: { 0: { nome: 'Ana Silva', cc: 'BR', idade: 20 }, 1: { nome: 'Bia Costa', cc: 'PT', idade: 20 } } }, codigo, anfitriao: 0 });
  let x = ate(mundo, codigo, 1, m => perspectiva(m, '0').season.round >= 2, melhor); mundo = x.mundo;
  agir(J, mundo, '1', (J, S) => { J.Game.endCareer('escolha'); J.UI.limparFila(); J.UI.close(); });
  checar('a carreira da Bia acabou; ela conta como pronta e o pronto dela não é recusado', mundo.pilotos['1'].raiz.retired && regras.dispensado(mundo, '1') && regras.podeFicarPronto(mundo, '1') === null && !regras.dispensado(mundo, '0'));
  const anoA = perspectiva(mundo, '0').year, anoB = perspectiva(mundo, '1').year;
  x = ate(mundo, codigo, x.N, m => perspectiva(m, '0').year > anoA, melhor); mundo = x.mundo;
  const A = perspectiva(mundo, '0'), B = perspectiva(mundo, '1');
  checar(`o ano da Ana chega ao fim e o ano novo começa só para ela (${anoA} → ${A.year}); a Bia fica em ${B.year}, com a última temporada`,
    A.year === anoA + 1 && A.season.round === 0 && B.year === anoB && B.retired && B.season && B.season.results.length >= 2, { A: A.year, B: B.year, rB: B.season && B.season.results.length });
  x = ate(mundo, codigo, x.N, m => perspectiva(m, '0').season.round >= 2, melhor); mundo = x.mundo;
  const A2 = perspectiva(mundo, '0');
  checar('o ano novo da Ana anda, e o carro da Bia não aparece como dela', A2.season.round >= 2 && !A2.season.field.some(f => f.id === 'ME2' && f.name === 'Bia Costa' && f.isMe));
}

console.log('\nUma proposta de outra série');
{
  const codigo = 'ROBUSTA2';
  let mundo = regras.iniciar([{ slot: 0 }, { slot: 1 }], { config: { serie: 'f1', ano: 1995, pilotos: { 0: { nome: 'Caio Lima', cc: 'BR', idade: 14 }, 1: { nome: 'Duda Reis', cc: 'AR', idade: 26 } } }, codigo, anfitriao: 0 });
  let viu = null;
  const fora = (s, P) => {
    const of = P.pendingOffers || [], ok = of.map((o, i) => i).filter(i => of[i].podeP !== false && !of[i].retirada);
    const outra = ok.find(i => of[i].sk && of[i].sk !== P.series);
    if(s === '1' && outra !== undefined && !viu) viu = { de: P.series, para: of[outra].sk };
    return s === '1' && outra !== undefined ? outra : ok[0];
  };
  const x = ate(mundo, codigo, 1, m => perspectiva(m, '0').year >= 1997, fora); mundo = x.mundo;
  const B = perspectiva(mundo, '1');
  checar(`a proposta de outra série é aceita e o piloto muda de série no ano novo (${viu ? viu.de + ' → ' + viu.para : 'sem proposta de outra série'})`,
    !!viu && B.series !== 'f1' && !B.retired && B.season && B.season.calendar.length > 0, { viu, serie: B.series });
}

console.log(falhas ? `\n${falhas} de ${ok + falhas} verificações falharam` : `\nrobustez do piloto: ${ok} verificações, tudo certo`);
process.exit(falhas ? 1 : 0);
