/* Equilíbrio da simulação: quem vence, por quê, e quanto o acaso pesa */
const H = require('./base');
const K = +(process.argv[2] || 12);
const casos = (process.argv[3] || 'f1:1988,f1:2008,f1:2024,indy:2015,nascar:2005,fe:2022').split(',').map(x => x.split(':'));
function spearman(a, b){
  const n = a.length; if(n < 3) return 0;
  const rk = v => { const o = v.map((x, i) => [x, i]).sort((p, q) => p[0] - q[0]); const r = []; o.forEach((p, i) => r[p[1]] = i); return r; };
  const ra = rk(a), rb = rk(b);
  let d = 0; for(let i = 0; i < n; i++) d += (ra[i] - rb[i]) ** 2;
  return 1 - 6 * d / (n * (n * n - 1));
}
for(const [sk, ano] of casos){
  const ag = { campCarro:[], campHab:[], vencedores:[], topWin:[], mec:0, aci:0, n:0, rho:[], h2h:{ p:[0,0], m:[0,0], g:[0,0] }, poleVence:0, corridas:0 };
  for(let k = 0; k < K; k++){
    const J = H.carregar();
    const eraIdx = J.run(`ERAS.reduce((k, e, i) => e.y <= ${ano} ? i : k, 0)`);
    H.novaCarreira(J, { era:eraIdx, ano:+ano, idade:29, serie:sk, rapido:false });
    const r = JSON.parse(J.run(`JSON.stringify((function(){
      const sea = S.season;
      /* o jogador vira um piloto médio, para não distorcer a conta */
      const skills = sea.field.filter(f => !f.isMe).map(f => f.skill).sort((a, b) => a - b);
      const out = { porCorrida:[], skill:{}, carro:{}, time:{} };
      sea.field.forEach(f => { out.skill[f.id] = f.isMe ? null : f.skill; out.time[f.id] = f.teamId; });
      sea.teams.forEach(t => out.carro[t.id] = Engine.carStr(sea, t.id, 0));
      while(sea.round < sea.calendar.length){
        const rec = Engine.runRace(sea);
        if(rec.tl) out.porCorrida.push(rec.tl.carros.map(c => [c.id, c.grid, c.fim, c.dnf]));
      }
      out.st = Engine.standings(sea).map(d => d.id);
      return out;
    })())`));
    const ids = Object.keys(r.skill).filter(id => r.skill[id] != null);
    const carros = Object.values(r.carro).sort((a, b) => b - a);
    const camp = r.st[0];
    if(camp !== 'ME'){
      ag.campCarro.push(carros.indexOf(r.carro[r.time[camp]]) + 1);
      const hs = ids.map(id => r.skill[id]).sort((a, b) => b - a);
      ag.campHab.push(hs.indexOf(r.skill[camp]) + 1);
    }
    const venc = {};
    r.porCorrida.forEach(cor => {
      ag.corridas++;
      const v = cor.find(c => c[2] === 1);
      if(v){ venc[v[0]] = (venc[v[0]] || 0) + 1; if(v[1] === 1) ag.poleVence++; }
      cor.forEach(c => { ag.n++; if(c[3] === 'MEC') ag.mec++; if(c[3] === 'ACID') ag.aci++; });
      const fin = cor.filter(c => !c[3]);
      ag.rho.push(spearman(fin.map(c => c[1]), fin.map(c => c[2])));
      /* companheiros de equipe: mesmo carro, a diferença é o piloto */
      const porTime = {};
      cor.forEach(c => { if(c[0] !== 'ME' && !c[3]) (porTime[r.time[c[0]]] = porTime[r.time[c[0]]] || []).push(c); });
      Object.values(porTime).forEach(l => {
        if(l.length < 2) return;
        const [a, b] = l, d = r.skill[a[0]] - r.skill[b[0]];
        if(d === 0) return;
        const melhor = d > 0 ? a : b, pior = d > 0 ? b : a, ad = Math.abs(d);
        const faixa = ad <= 2 ? 'p' : ad <= 6 ? 'm' : 'g';
        ag.h2h[faixa][1]++; if(melhor[2] < pior[2]) ag.h2h[faixa][0]++;
      });
    });
    ag.vencedores.push(Object.keys(venc).length);
    ag.topWin.push(Math.max(...Object.values(venc)) / Math.max(1, r.porCorrida.length));
  }
  const med = a => a.length ? (a.reduce((s, x) => s + x, 0) / a.length) : 0;
  const pct = (a, f) => (a.filter(f).length / Math.max(1, a.length) * 100).toFixed(0) + '%';
  const h = k => ag.h2h[k][1] ? (ag.h2h[k][0] / ag.h2h[k][1] * 100).toFixed(0) + '% (' + ag.h2h[k][1] + ')' : '-';
  console.log(`${sk} ${ano}: campeão com o melhor carro ${pct(ag.campCarro, x => x === 1)}, top-3 ${pct(ag.campCarro, x => x <= 3)}; `
    + `campeão é o melhor piloto ${pct(ag.campHab, x => x === 1)}, top-5 ${pct(ag.campHab, x => x <= 5)}; `
    + `vencedores/temporada ${med(ag.vencedores).toFixed(1)}; maior fatia de vitórias ${(med(ag.topWin) * 100).toFixed(0)}%; `
    + `pole vence ${(ag.poleVence / ag.corridas * 100).toFixed(0)}%; grid×chegada ρ=${med(ag.rho).toFixed(2)}; `
    + `quebra ${(ag.mec / ag.n * 100).toFixed(1)}% acidente ${(ag.aci / ag.n * 100).toFixed(1)}% por carro/corrida; `
    + `companheiro melhor vence: Δ≤2 ${h('p')}, Δ3-6 ${h('m')}, Δ>6 ${h('g')}`);
}
