/* Carreiras de piloto inteiras, sem navegador: uma página falsa e um piloto
   automático que sempre escolhe a melhor vaga rumo à categoria principal. */
const B = require('./base');
const M = (() => { const J = B.carregar(); return { ctx: J.ctx, run: J.run }; })();
const run = M.run;

function carreira(o){
  run(`S = null; UI.eraSel = ${o.era}; UI.year = ${o.ano}; UI.serie = '${o.serie || 'f1'}'; UI.country = '${o.cc || 'BR'}';
       UI.style = '${o.estilo || 'equilibrado'}'; UI.modo = '${o.modo || 'classico'}'; UI.origem = 'media';`);
  const E = id => M.ctx.document.getElementById(id); E('inName').value = 'Teste'; E('inNum').value = '7'; E('inAge').value = String(o.idade);
  E('chkRisk').checked = false; E('chkFast').checked = true;
  run('Game.start(); UI.limparFila(); UI.close();');
  const S = () => run('S');
  const out = { f1:0, anosF1:0, v:0, tit:0, melhorF1:99, ovr0:S().driver.ovr, ovrMax:S().driver.ovr, chegouF1Idade:null, fim:'' };
  for(let ano = 0; ano < 25; ano++){
    const s = S();
    if(s.retired){ out.fim = 'aposentou'; break; }
    run('Game.simSeason(); UI.limparFila(); UI.close();');
    if(S().retired){ out.fim = 'acabou'; break; }
    const sea = S().season;
    run('Game.endSeason(); UI.limparFila(); UI.close();');
    const sum = S().history[S().history.length - 1];
    if(sea.isTop && S().series === (o.serie || 'f1')){
      out.anosF1++; out.v += sum.wins || 0; if(sum.champion) out.tit++;
      out.melhorF1 = Math.min(out.melhorF1, sum.pos);
      if(out.chegouF1Idade == null) out.chegouF1Idade = S().driver.age - 1;
    }
    out.ovrMax = Math.max(out.ovrMax, S().driver.ovr);
    /* academia: aceita a primeira */
    if((S().academyOffers || []).length){ run('S._acadList = S.academyOffers; S.academyOffers = null; Game.joinAcademy(0); UI.limparFila(); UI.close();'); }
    run('S.lastSum = Engine.summary(S.season); Game.showOffers(S.lastSum); UI.limparFila();');
    if(S().retired){ out.fim = 'sem vaga aos ' + S().driver.age; break; }
    const ofs = S().pendingOffers || [];
    const top = run('Engine.topCat()');
    let melhor = -1, nota = -1e9;
    ofs.forEach((of, i) => {
      if(of.podeP === false) return;
      let v = (of.team ? of.team.str : 0);
      if(of.sk && of.sk !== S().series) v -= 200;           /* não troca de categoria */
      if(of.cat === top) v += 100; else if(of.up || of.pulo) v += 50;
      if(of.down) v -= 30;
      if(v > nota){ nota = v; melhor = i; }
    });
    if(melhor < 0){ out.fim = 'nada cabia'; break; }
    if(ofs[melhor].sk && ofs[melhor].sk !== S().series){ out.trocou = 1; out.fim = 'trocou de categoria'; break; }
    run(`Game.takeOffer(${melhor}); UI.limparFila(); UI.close();`);
  }
  if(!out.fim) out.fim = 'fim do teste';
  out.f1 = out.anosF1 > 0 ? 1 : 0;
  out.idadeFim = S().driver.age;
  return out;
}

function lote(rot, o, n){
  const rs = [];
  for(let i = 0; i < n; i++){ try { rs.push(carreira(o)); } catch(e){ console.log('ERRO', rot, e.message.split('\n')[0]); } }
  const m = f => rs.reduce((s, r) => s + f(r), 0) / Math.max(1, rs.length);
  const ok = rs.filter(r => r.f1);
  console.log(`${rot.padEnd(26)} n=${rs.length} | ovr ini ${m(r => r.ovr0).toFixed(0)} máx ${m(r => r.ovrMax).toFixed(0)} | chega F1 ${(m(r => r.f1) * 100).toFixed(0)}% `
    + `| anos F1 ${m(r => r.anosF1).toFixed(1)} | vence corrida ${(m(r => r.v > 0 ? 1 : 0) * 100).toFixed(0)}% | título ${(m(r => r.tit > 0 ? 1 : 0) * 100).toFixed(0)}% `
    + `| saiu da F1 ${(m(r => r.trocou || 0) * 100).toFixed(0)}% | top5 ${(m(r => r.melhorF1 <= 5 ? 1 : 0) * 100).toFixed(0)}% | idade chega ${ok.length ? (ok.reduce((s, r) => s + r.chegouF1Idade, 0) / ok.length).toFixed(1) : '-'}`);
  return rs;
}

const N = +process.argv[2] || 30;
const modo = process.argv[3] || 'classico';
const anos = [[6, 2014], [3, 1985]];
for(const [era, ano] of anos){
  for(const idade of (process.argv[4] || '14,17,21,24,27,30').split(',').map(Number)){
    lote(`${ano} idade ${idade} ${modo}`, { era, ano, idade, modo }, N);
  }
}
