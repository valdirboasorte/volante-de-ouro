/* A escada de base no modo rápido: com que idade as carreiras chegam a cada
   degrau (kart → F4 → Regional → F3 → F2 → principal) e onde empacam.
   Uso: node testes/escada.js [carreiras=24] [ano=2012] [idade=8] [dificuldade=equilibrado]
   Não modifica arquivos nem saves. */
const H = require('./base');
const N = +(process.argv[2] || 24), ANO = +(process.argv[3] || 2012), IDADE = +(process.argv[4] || 8), DIF = process.argv[5] || 'equilibrado';
const grupo = cat => /Kart/i.test(cat) ? 'kart' : /F4|Fórmula 4|Fórmula Ford|Fórmula Vee|Fórmula Renault 1\.6|Formula 4|Ginetta|Fórmula Júnior/i.test(cat) ? 'f4'
  : /Regional|FRECA|Renault|Eurocup|Fórmula Renault 2\.0|Toyota Racing|Formula Regional/i.test(cat) ? 'regional'
  : /Fórmula 3|F3|GP3/i.test(cat) ? 'f3' : /Fórmula 2|F2|GP2|3000|Fórmula 3000/i.test(cat) ? 'f2' : 'outro';
const ordem = ['kart', 'f4', 'regional', 'f3', 'f2', 'topo'];
const res = [];
for(let i = 0; i < N; i++){
  const J = H.carregar({ silencioso:true, seed: 5000 + i });
  const era = J.run(`ERAS.reduce((k, e, i) => e.y <= ${ANO} ? i : k, 0)`);
  H.novaCarreira(J, { era, ano: ANO, idade: IDADE, cc: process.env.CC || 'BR', rapido: true, serie: 'f1', modo: process.env.MODO || 'classico' });
  J.run(`S.dif = '${DIF}'`);
  const chegou = {}, anos = {}, cats = [];
  for(let k = 0; k < 22; k++){
    if(J.run('S.retired')) break;
    const st = J.run('({ cat: S.season.cat, top: S.season.isTop, age: S.driver.age, papel: S.papel && S.papel.tipo })');
    const gp = st.top ? 'topo' : grupo(st.cat);
    if(chegou[gp] == null && !st.papel) chegou[gp] = st.age;
    anos[gp] = (anos[gp] || 0) + 1; cats.push(st.age + ':' + st.cat);
    if(st.top && !st.papel) break;
    J.run('Game.simSeason(); UI.limparFila(); UI.close(); Game.endSeason(); UI.limparFila(); UI.close();');
    if((J.run('S.academyOffers') || []).length) J.run('S._acadList = S.academyOffers; S.academyOffers = null; Game.joinAcademy(0); UI.limparFila(); UI.close();');
    J.run('S.lastSum = Engine.summary(S.season); Game.showOffers(S.lastSum); UI.limparFila();');
    if(J.run('S.retired')) break;
    const ofs = J.run('S.pendingOffers || []'), top = J.run('Engine.topCat()'), ladder = J.run('S.ladder'), cur = J.run('S.catIdx');
    let melhor = -1, nota = -1e9;
    ofs.forEach((of, j) => {
      if(of.podeP === false || (of.sk && of.sk !== 'f1') || of.livre) return;
      const idx = ladder.indexOf(of.cat);
      let v = (idx >= 0 ? idx : cur) * 100 + (of.team ? of.team.str : 0);
      if(of.papel) v -= 150;
      if(v > nota){ nota = v; melhor = j; }
    });
    if(melhor < 0) break;
    J.run(`Game.takeOffer(${melhor}); UI.limparFila(); UI.close();`);
  }
  res.push({ chegou, anos, cats, pot: J.run('Math.round(Object.values(S.driver.pot).reduce((a,b)=>a+b,0)/5)') });
}
const pct = f => Math.round(res.filter(f).length / res.length * 100) + '%';
const med = a => { a = a.slice().sort((x, y) => x - y); return a.length ? a[Math.floor(a.length / 2)] : '-'; };
console.log(`${N} carreiras, ${ANO}, estreia aos ${IDADE}, dificuldade ${DIF}`);
for(const g of ordem.slice(1)){
  const ids = res.filter(r => r.chegou[g] != null).map(r => r.chegou[g]);
  console.log(`  ${g.padEnd(9)} chegam ${pct(r => r.chegou[g] != null)} · idade mediana ${med(ids)} · anos no degrau anterior (mediana) ${med(res.map(r => r.anos[ordem[ordem.indexOf(g) - 1]] || 0).filter(x => x))}`);
}
console.log('  exemplos:', res.slice(0, 3).map(r => `pot ${r.pot}: ${r.cats.join(' > ')}`).join('\n            '));
module.exports = { res };
