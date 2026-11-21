/* A corrida 2D em rede (Fase 7), sem servidor HTTP: o motor no Node, a corrida da sala
   (corrida2d-mp.js) e duas telas (rede2d.js, Rede.Cliente) num relógio falso, com uma rede de
   mentira entre eles: atraso, variação e perda (no WebSocket a perda vira um pacote que chega
   tarde e segura os de trás, como no TCP).
   - a rodada preparada numa sala com a 2D dá uma corrida 2D com os dois humanos e o dono certo;
   - cada tela pilota o próprio carro (um robô no volante) e vê o outro andando liso: o erro de
     posição do outro humano e dos carros da IA, e os saltos entre um quadro e outro, ficam
     dentro do limite;
   - o relógio de cada tela acha o relógio da sala (com o relógio do aparelho deslocado);
   - a sala assume o carro de quem some (aba escondida) e devolve quando a tela volta;
   - o resultado sai da sala, entra na rodada (ligarCorridas 'concluir') e nos dois campeonatos.
   Uso: node testes/corrida2d-mp.mjs [atrasoMs] [variacaoMs] [perda%]
        (gere o motor antes: node ferramentas/gerar-motor.mjs) */
import { criarMotor } from '../src/gerado/motor-jogo.js';
import { ambienteFalso } from '../src/pagina-falsa.js';
import { criarRnd } from '../src/aleatorio.js';
import { criarRegrasPiloto } from '../src/regras-piloto.js';
import { ligarCorridas, desligarCorridas } from '../src/corrida-mp.js';
import { Corrida2D } from '../src/corrida2d-mp.js';

const ATRASO = +(process.argv[2] || 40), VARIA = +(process.argv[3] || 15), PERDA = +(process.argv[4] || 1) / 100;
let ok = 0, falhas = 0;
const checar = (nome, cond, detalhe) => { if(cond){ ok++; console.log('  ✓ ' + nome); } else { falhas++; console.log('  ✗ ' + nome + (detalhe === undefined ? '' : ' — ' + JSON.stringify(detalhe).slice(0, 500))); } return !!cond; };
const clone = o => structuredClone(o);
function novoMotor(seed){ const amb = ambienteFalso({ seed }); const J = criarMotor(amb); J.amb = amb; J.Saves.auto = false; return J; }
const pct = (a, p) => { if(!a.length) return 0; const s = a.slice().sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
const media = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;

/* uma direção da rede: entrega em ordem; um pacote perdido chega um RTO depois e segura os de trás */
function canal(rnd, atraso, varia, perda){
  let ultimo = 0; const fila = [];
  return {
    mandar(agora, msg){
      let t = agora + atraso + rnd() * varia;
      if(rnd() < perda) t += 200 + rnd() * 100;
      t = Math.max(t, ultimo); ultimo = t;
      fila.push({ t, txt: JSON.stringify(msg) });
    },
    receber(agora){ const out = []; while(fila.length && fila[0].t <= agora) out.push(JSON.parse(fila.shift().txt)); return out; }
  };
}

console.log(`\nCorrida 2D em rede · atraso ${ATRASO} ms ±${VARIA} ms · perda ${(PERDA * 100).toFixed(1)}%`);
const J = novoMotor(41), regras = criarRegrasPiloto(() => J), codigo = 'TESTE2D1';
const C2D = J.amb.C2D;
const config = { serie: 'f1', ano: 2024, pilotos: { 0: { nome: 'Ana Silva', cc: 'BR', idade: 20, estilo: 'equilibrado' }, 1: { nome: 'Bia Costa', cc: 'PT', idade: 20, estilo: 'agressivo' } } };
const mundo = regras.iniciar([{ slot: 0 }, { slot: 1 }], { config, codigo, anfitriao: 0 });
/* a lesão da pré-temporada (legítima) deixaria um dos dois fora da primeira corrida: aqui os dois correm */
for(const s of Object.keys(mundo.pilotos)) mundo.pilotos[s].raiz.driver.injured = 0;

const t0p = Date.now();
const ctl = ligarCorridas(J, 'preparar', null, { c2d: { dist: .1, ia: 'medio' } });
let defs;
try { regras.processar(clone(mundo), 1, criarRnd(codigo, 1)); defs = ctl.defs; } finally { desligarCorridas(J); }
const def = defs[0];
checar('a rodada preparada tem uma corrida 2D com os dois humanos', defs.length === 1 && def.c2d && def.c2d.carros.filter(c => c.dono != null).map(c => c.dono).sort().join() === '0,1',
  defs.map(d => [!!d.c2d, d.donos]));
checar('a definição só tem dados (vai para o storage e para as telas)', JSON.stringify(JSON.parse(JSON.stringify(def.c2d))) === JSON.stringify(def.c2d));
console.log(`  · ${def.c2d.trkId} ${def.c2d.ano}, ${def.c2d.N} voltas (${def.c2d.Ncl} na prova inteira), ${def.c2d.carros.length} carros, IA ${def.c2d.nivelIA}, preparo ${Date.now() - t0p} ms`);

/* a sala e as duas telas */
let agora = 1_000_000;
const srv = new Corrida2D(J, def); srv.prazo = agora + 60000;
const rnd = criarRnd('rede', 1);
const desloc = [123456.7, -98765.4];          // o relógio de cada aparelho começa num ponto diferente
const ida = [0, 1].map(() => canal(rnd, ATRASO, VARIA, PERDA)), volta = [0, 1].map(() => canal(rnd, ATRASO, VARIA, PERDA));
const telas = [0, 1].map(s => {
  const R = C2D.Rede.Cliente(def.c2d, { slot: s, k: def.chave, agora: () => agora + desloc[s], enviar: m => ida[s].mandar(agora, m) });
  const carros = def.c2d.carros.map(o => o.dono === String(s) ? Object.assign({}, o, { assist: { abs: true, tc: true, estab: true, direcao: true, freioAuto: false } }) : o);
  const S = R.sessao(carros);
  const eu = S.eu;
  eu.ia = C2D.IA.criar({ ritmo: s ? .965 : .975, semente: 70 + s }); eu.autopiloto = true;   // o robô no volante
  return { R, S, eu, s, hist: [], fotos: [] };
});
checar('cada tela tem o próprio carro e o do outro como fantoche', telas.every(T => T.eu.dono === String(T.s) && !T.eu.remoto && T.S.carros.filter(c => c.humano && c.remoto).length === 1));
/* a abertura: o corridaInicio com o quadro inteiro, depois "pronto" */
for(const T of telas){ const ini = srv.inicio(agora); T.R.receber(ini.quadro, agora + desloc[T.s]); srv.ordem(T.s, 'pronto2d', {}, agora); }

/* o relógio falso: a sala a cada 50 ms, cada tela a cada ~16,7 ms */
const historicoSrv = new Map();     // tempo de prova (ms) → posições da IA na sala
const erros = { humano: [], ia: [], saltoH: [], saltoIA: [], theta: [] };
let proxSrv = agora, proxTela = [agora, agora + 7], fim = false, sumiu = null, voltou = null, assumiuViu = false, devolveu = false;
const LIMITE = agora + 60 * 60 * 1000;
const ultPos = new Map();
while(!fim && agora < LIMITE){
  agora += 1;
  /* a rede entrega */
  for(const s of [0, 1]){
    for(const m of ida[s].receber(agora)){ const r = srv.eu(s, m, agora); if(r) volta[1 - s].mandar(agora, r); }
    for(const m of volta[s].receber(agora)) telas[s].R.receber(m, agora + desloc[s]);
  }
  if(agora >= proxSrv){
    proxSrv += 50;
    srv.avancar(agora);
    const q = srv.quadro(agora);
    volta[0].mandar(agora, q); volta[1].mandar(agora, q);
    const S = srv.S;
    historicoSrv.set(Math.round(S.t * 1000), S.carros.map(c => [c.x, c.y, c.sTot, c.d, c.v, c.psi]));
    if(srv.fase === 'fim') fim = true;
  }
  for(const s of [0, 1]){
    if(agora < proxTela[s]) continue;
    proxTela[s] += 1000 / 60;
    const T = telas[s], S = T.S;
    /* a tela 1 some por 4 s logo depois da largada (aba escondida): não anda nem manda nada, e a sala
       cruza a linha por ela (a volta e o cronômetro precisam voltar junto com o carro) */
    if(s === 1 && S.t > 7 && sumiu == null){ sumiu = agora; }
    if(s === 1 && sumiu != null && voltou == null){ if(agora - sumiu < 4000) continue; voltou = agora; }
    const n = T.R.relogio.quadro(agora + desloc[s]);
    for(let k = 0; k < n; k++){
      C2D.Sessao.passo(S, null, C2D.DT);
      T.hist.push([Math.round(S.t * 1000), T.eu.x, T.eu.y]);
    }
    if(T.R.theta != null && T.R.iniciou) erros.theta.push(Math.abs((T.R.theta * 1000) - (srv.t0 != null ? -(srv.t0 + desloc[s]) : 0)));
    /* o que esta tela desenha agora, para medir */
    if(n && S.t > 8 && !S.acabou) T.fotos.push({ t: Math.round(S.t * 1000), idade: S.carros.map(c => c.rd && c.rd.base ? Math.round((S.t - c.rd.base.t) * 1000) : null), carros: S.carros.map(c => [c.x, c.y, c.remoto, c.humano, c.v, c.estado, c.box ? 1 : 0, c.recolhido ? 1 : 0]) });
    if(T.R.assumido) assumiuViu = true;
  }
}
console.log(`  · corrida de ${srv.S.t.toFixed(1)} s de prova; quadros recebidos: ${telas.map(T => T.R.medidas.quadros + ' + ' + T.R.medidas.humanos + ' humanos').join(' / ')}`);

/* a medida: o que cada tela desenhou contra a verdade (a outra tela para o humano, a sala para a IA) */
for(const T of telas){
  /* a posição verdadeira do outro no mesmo tempo de prova (interpolada: depois de um pulo de relógio
     os passos das duas telas não caem nos mesmos instantes) */
  const outra = telas[1 - T.s], H = outra.hist;
  const porT = { get(t){
    let lo = 0, hi = H.length - 1;
    if(hi < 1 || t < H[0][0] || t > H[hi][0]) return null;
    while(hi - lo > 1){ const m = (lo + hi) >> 1; if(H[m][0] <= t) lo = m; else hi = m; }
    const a = H[lo], b = H[hi], dt = b[0] - a[0];
    if(dt > 40) return null;
    const f = dt > 0 ? (t - a[0]) / dt : 0;
    return [t, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
  } };
  let ant = null;
  for(const f of T.fotos){
    if(f.t > 7000 && f.t < 13000) continue;      // a janela em que a tela 1 sumiu (a sala pilotou o carro dela)
    const verdadeH = porT.get(f.t), srvF = historicoSrv.get(f.t - (f.t % 1)) || null;
    f.carros.forEach((c, i) => {
      if(c[5] !== 'pista' || c[6] || c[7]) return;
      if(c[3] && c[2] && verdadeH && outra.eu.idx === i){ const er = Math.hypot(c[0] - verdadeH[1], c[1] - verdadeH[2]); erros.humano.push(er); if(er > 6 && process.env.DETALHE) console.log(`    erro tela ${T.s} t=${(f.t / 1000).toFixed(2)} humano ${er.toFixed(1)} m idade ${f.idade[i]} ms v ${c[4].toFixed(1)}`); }
      if(!c[3] && srvF && srvF[i]){ const er = Math.hypot(c[0] - srvF[i][0], c[1] - srvF[i][1]); erros.ia.push(er); if(er > 5 && process.env.DETALHE2) console.log(`    erroIA tela ${T.s} t=${(f.t / 1000).toFixed(2)} carro ${i} ${er.toFixed(1)} m idade ${f.idade[i]} v ${c[4].toFixed(1)}`); }
    });
    if(ant && f.t - ant.t > 0 && f.t - ant.t < 40){
      const dt = (f.t - ant.t) / 1000;
      f.carros.forEach((c, i) => {
        const a = ant.carros[i]; if(!a || !c[2] || c[5] !== 'pista' || a[5] !== 'pista' || c[6] || a[6]) return;
        const anda = Math.hypot(c[0] - a[0], c[1] - a[1]), esperado = Math.max(c[4], a[4]) * dt;
        const sal = Math.max(0, anda - esperado - .05);
        (c[3] ? erros.saltoH : erros.saltoIA).push(sal);
        if(sal > 2 && process.env.DETALHE) console.log(`    salto tela ${T.s} t=${(f.t / 1000).toFixed(2)} carro ${i}${c[3] ? ' (humano)' : ''} ${sal.toFixed(1)} m v=${c[4].toFixed(1)}`);
      });
    }
    ant = f;
  }
}
const fmt = a => `média ${media(a).toFixed(2)} m · p95 ${pct(a, .95).toFixed(2)} m · máx ${pct(a, 1).toFixed(2)} m (${a.length})`;
console.log('  · erro do outro humano na tela: ' + fmt(erros.humano));
console.log('  · erro dos carros da IA na tela: ' + fmt(erros.ia));
console.log('  · salto além do movimento, por quadro: humano ' + fmt(erros.saltoH) + ' | IA ' + fmt(erros.saltoIA));
const thetaFim = erros.theta.slice(-200);
console.log(`  · relógio da tela contra o da sala: erro p95 ${pct(thetaFim, .95).toFixed(1)} ms`);
const lim = ATRASO + VARIA <= 120;
checar('a corrida chegou ao fim na sala', srv.fase === 'fim' && !!srv.res);
checar('o relógio de cada tela acha o da sala (erro p95 < metade do atraso + 25 ms)', pct(thetaFim, .95) < ATRASO / 2 + VARIA + 25, pct(thetaFim, .95));
if(lim){
  checar('o outro humano aparece perto de onde está (p95 < 3 m)', erros.humano.length > 1000 && pct(erros.humano, .95) < 3, fmt(erros.humano));
  checar('os carros da IA aparecem perto de onde estão (p95 < 3 m)', pct(erros.ia, .95) < 3, fmt(erros.ia));
  checar('sem engasgo: p99 do salto além do movimento < 0,5 m por quadro', pct(erros.saltoH.concat(erros.saltoIA), .99) < .5, [pct(erros.saltoH, .99), pct(erros.saltoIA, .99)]);
}
checar('a sala assumiu o carro de quem sumiu e devolveu quando a tela voltou', srv.assumiuAlguem && telas[1].R.medidas.adocoes >= 1, telas[1].R.medidas);

if(process.env.DETALHE) for(const T of telas){
  const c = T.eu, ev = {};
  T.S.eventos.filter(e => e.a === c.id || e.b === c.id).forEach(e => ev[e.tipo] = (ev[e.tipo] || 0) + 1);
  console.log(`  · tela ${T.s}: ${c.id} voltas ${c.voltas} estado ${c.estado} sTot ${c.sTot.toFixed(0)} v ${c.v.toFixed(1)} d ${c.d.toFixed(1)} box ${c.box && c.box.fase} eventos ${JSON.stringify(ev)}`);
  console.log('    primeiros: ' + T.S.eventos.filter(e => e.a === c.id || e.b === c.id).slice(0, 12).map(e => e.tipo + '@' + e.t.toFixed(1) + (e.b ? '/' + (e.a === c.id ? e.b : e.a) : '')).join(' '));
}
/* o resultado */
const res = srv.res, ids = def.c2d.carros.filter(c => c.dono != null).map(c => c.id);
const linha = id => res.ordem.find(o => o.id === id);
checar('os dois humanos estão no resultado com voltas e posição', ids.every(id => linha(id) && (linha(id).voltas > 0 || linha(id).fora)), ids.map(linha));
const e1 = telas[1].eu, s1 = srv.S.carros[e1.idx];
checar('quem sumiu na largada não perdeu volta: a tela e a sala contam as mesmas', e1.voltas === s1.voltas && (e1.estado !== 'chegou' || e1.voltas >= def.c2d.N), { tela: [e1.voltas, e1.estado], sala: [s1.voltas, s1.estado], N: def.c2d.N });
for(const T of telas){
  const tor = C2D.Corrida.ordem(T.S).map(c => c.id).slice(0, 6).join(','), oficial = res.ordem.slice(0, 6).map(o => o.id).join(',');
  console.log(`  · tela ${T.s}: top 6 na tela ${tor} · oficial ${oficial}`);
}
const ctl2 = ligarCorridas(J, 'concluir', { [def.chave]: { ent: def.ent, res, notas: srv.notas } });
let r;
try { r = regras.processar(clone(mundo), 1, criarRnd(codigo, 1)); } finally { desligarCorridas(J); }
checar('a rodada concluída com a chegada da 2D: sem divergência nem falta', !ctl2.divergencias.length && !ctl2.faltas.length, [ctl2.divergencias, ctl2.faltas]);
const etapas = r.resultado.etapas || [];
const posOficial = id => res.ordem.findIndex(o => o.id === id) + 1;
const nomes = Object.fromEntries(def.ent.carros.map(c => [c.id, c.nome]));
checar('cada um dos dois campeonatos recebeu a corrida', etapas.length === 2, etapas);
const top = (etapas[0] || {}).top || [];
checar('o top 10 da rodada é o da corrida 2D', top.map(t => t.nome).join('|') === res.ordem.slice(0, 10).map(o => nomes[o.id]).join('|'), [top.map(t => t.nome), res.ordem.slice(0, 10).map(o => nomes[o.id])]);
/* na carreira de cada um, a posição de chegada é a da 2D */
const M2 = r.mundo || r.estado || null;
const posCarreira = s => {
  const m = M2 && M2.pilotos ? M2.pilotos[s] : null;
  const t = m && M2.temporadas[m.chaveTemporada];
  const resS = m && m.temporada && m.temporada.results;
  const ult = resS && resS[resS.length - 1];
  return ult ? ult.pos : null;
};
const esperado = [posOficial('ME'), posOficial('ME2')];
const vistos = [posCarreira('0'), posCarreira('1')];
checar('na carreira de cada um, a posição é a que a 2D deu', vistos[0] === esperado[0] && vistos[1] === esperado[1], { esperado, vistos });

console.log(`\n${ok} ok, ${falhas} falha(s)`);
process.exit(falhas ? 1 : 0);
