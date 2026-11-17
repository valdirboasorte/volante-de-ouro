/* Corrida 2D: a direção de prova (assets/corrida2d/punicoes2d.js).
   - cada categoria e época tem o sistema de punições que usava na vida real;
   - a culpa: batida por trás é de quem vem atrás, lado a lado é de quem fecha a porta,
     os dois indo um para o outro (ou um já rodando) é incidente de corrida;
   - a gravidade sai do que aconteceu com o outro carro, e o modo (rigoroso, tolerante,
     desligado) muda a régua;
   - drive-through e stop-and-go: a IA cumpre no box; tarde demais viram tempo; sem
     cumprir em três voltas, bandeira preta; no kart (sem pit lane) tudo é tempo;
   - sob safety car o jogador a fundo não passa o carro da frente;
   - o desclassificado vai para o fim da classificação, com o dnf 'DSQ'.
   Uso: node testes/punicoes2d.js   Não modifica arquivos nem saves. */
const { carregar2D } = require('./corrida2d');

let falhas = 0, n = 0;
const ok = (cond, msg) => { n++; if(!cond){ falhas++; console.log('✗ ' + msg); } };
const J = carregar2D();

/* 1. o sistema de cada categoria e época */
const sis = J.run(`[
  C2D.Punicoes.sistema('f1', 2024, 0, false), C2D.Punicoes.sistema('f1', 2005, 0, false), C2D.Punicoes.sistema('f1', 1991, 0, false),
  C2D.Punicoes.sistema('f1', 1978, 0, false), C2D.Punicoes.sistema('f1', 2019, 2, false), C2D.Punicoes.sistema('indy', 2010, 0, false),
  C2D.Punicoes.sistema('indy', 1965, 0, false), C2D.Punicoes.sistema('nascar', 2020, 0, false), C2D.Punicoes.sistema('f1', 2020, 4, true),
  C2D.Punicoes.sistema('f1', 2008, 4, true), C2D.Punicoes.sistema('fe', 2016, 0, false), C2D.Punicoes.sistema('wec', 2000, 0, false)
]`);
ok(JSON.stringify(sis) === JSON.stringify(['fia14', 'fia94', 'fia89', 'antigo', 'fia14', 'indy', 'antigo', 'nascar', 'kart15', 'kart', 'fia14', 'fia94']), 'sistema por categoria e época: ' + sis.join(','));
const tab = J.run(`(() => { const S = C2D.Punicoes.SISTEMAS; return {
  f14: S.fia14.contato.map(p => p ? p.t + (p.s || '') : '-').join(' '), kart: S.kart15.contato.map(p => p ? p.t + (p.s || '') : '-').join(' '),
  nascar: S.nascar.contato.every(p => !p), nascarSC: S.nascar.scPasse.t, kartTemDT: [S.kart15, S.kart].some(s => s.contato.concat([s.scPasse, s.vantagem]).some(p => p && (p.t === 'dt' || p.t === 'sg'))),
  tarde14: S.fia14.tarde.dt + '/' + S.fia14.tarde.sg }; })()`);
ok(tab.f14 === 'tempo5 tempo5 tempo10 dt sg10', 'FIA desde 2014: 5 s, 5 s, 10 s, drive-through, stop-and-go (' + tab.f14 + ')');
ok(tab.kart === 'tempo5 tempo5 tempo10 tempo10 dsq', 'kart: só tempo e bandeira preta (' + tab.kart + ')');
ok(!tab.kartTemDT, 'kart não tem drive-through nem stop-and-go');
ok(tab.nascar && tab.nascarSC === 'dt', 'NASCAR: contato não é punido; passar sob amarela custa pass-through');
ok(tab.tarde14 === '20/30', 'drive-through e stop-and-go convertidos: 20 s e 30 s desde 2014');

/* 2. a culpa e a decisão, em casos montados */
const casos = J.run(`(() => {
  const mk = (modo, ano, sk) => {
    const carros = [{ id: 'A', nome: 'A', grid: 2, ia: { ritmo: .9 } }, { id: 'B', nome: 'B', grid: 1, ia: { ritmo: .9 } }, { id: 'ME', me: true, nome: 'Eu', grid: 3 }];
    const S = C2D.Sessao.criar({ trkId: 'br_int', ano: ano || 2024, sk: sk || 'f1', nivel: 0, tipo: 'corrida', voltas: 10, carros, semente: 2, punicoes: modo });
    S.estado = 'pista'; S.verdeEm = 0; S.ordem = C2D.Corrida.ordem(S); S.ordem.forEach((c, k) => c.pos = k + 1);
    return S;
  };
  const out = {};
  /* culpa: por trás */
  let S = mk('tolerante'); const A = S.carros[0], B = S.carros[1];
  C2D.Carro.posicionar(B, S.P, 600, 0); C2D.Carro.posicionar(A, S.P, 594, 0);
  A.pw = 0; B.pw = 0; A.prel = 0; B.prel = 0;
  let j = C2D.Punicoes.culpa(S, A, B); out.traseira = j && j.culpado.id + ':' + j.tipo;
  /* culpa: lado a lado, A fecha a porta em B */
  C2D.Carro.posicionar(B, S.P, 600, -1.5); C2D.Carro.posicionar(A, S.P, 600, 1.5);
  A.pw = -2.2; B.pw = 0; j = C2D.Punicoes.culpa(S, A, B); out.lateral = j && j.culpado.id + ':' + j.tipo;
  /* os dois indo um para o outro: incidente de corrida */
  A.pw = -1.6; B.pw = 1.6; j = C2D.Punicoes.culpa(S, A, B); out.dois = j;
  /* um já vinha rodando: incidente */
  A.pw = -2.2; B.pw = 0; A.prel = 1.1; j = C2D.Punicoes.culpa(S, A, B); out.rodando = j; A.prel = 0;

  /* decisão: A tirou B da corrida, em cada modo e época */
  const decide = (modo, ano, sk, efeito, imp, sc) => {
    const S = mk(modo, ano, sk), A = S.carros[0], B = S.carros[1];
    const caso = { t0: S.t, imp: imp || 9, sc: !!sc, feito: false, a: A, b: B, tipo: 'traseira', posA0: 2, posB0: 1, vB0: 40, danoB0: 0, rodou: false };
    if(efeito === 'abandono'){ B.estado = 'fora'; B.foraTipo = 'ACID'; }
    if(efeito === 'rodou') caso.rodou = true;
    if(efeito === 'posicao'){ A.pos = 1; B.pos = 2; }
    C2D.Punicoes.decidir(S, caso);
    const l = S.pun.lista[0];
    return l ? (l.pun.t + (l.pun.s || '')) : '-';
  };
  out.f14 = ['leve', 'posicao', 'rodou', 'abandono'].map(e => decide('rigoroso', 2024, 'f1', e)).join(' ');
  out.f14tol = ['leve', 'posicao', 'rodou', 'abandono'].map(e => decide('tolerante', 2024, 'f1', e)).join(' ');
  out.f14perigosa = decide('rigoroso', 2024, 'f1', 'abandono', 20);
  out.f14sc = decide('rigoroso', 2024, 'f1', 'rodou', 9, true);
  out.f05 = ['posicao', 'rodou', 'abandono'].map(e => decide('rigoroso', 2005, 'f1', e)).join(' ');
  out.f78 = decide('rigoroso', 1978, 'f1', 'abandono', 9) + ' ' + decide('rigoroso', 1978, 'f1', 'abandono', 20);
  out.nascar = decide('rigoroso', 2020, 'nascar', 'abandono', 20);
  out.desligado = decide('desligado', 2024, 'f1', 'abandono', 20);
  return out;
})()`);
ok(casos.traseira === 'A:traseira', 'batida por trás é de quem vem atrás (' + casos.traseira + ')');
ok(casos.lateral === 'A:lateral', 'lado a lado é de quem fecha a porta (' + casos.lateral + ')');
ok(casos.dois === null, 'os dois indo um para o outro é incidente de corrida');
ok(casos.rodando === null, 'quem já vinha rodando não gera punição de contato');
ok(casos.f14 === 'tempo5 tempo5 tempo10 dt', 'FIA 2024 rigoroso: toque 5 s, posição 5 s, rodada 10 s, abandono drive-through (' + casos.f14 + ')');
ok(casos.f14tol === '- tempo5 tempo5 tempo10', 'FIA 2024 tolerante: um degrau a menos (' + casos.f14tol + ')');
ok(casos.f14perigosa === 'sg10', 'tirar o outro da corrida a muita velocidade: stop-and-go (' + casos.f14perigosa + ')');
ok(casos.f14sc === 'sg10', 'rodar alguém sob safety car: stop-and-go (' + casos.f14sc + ')');
ok(casos.f05 === 'dt dt sg10', 'FIA 2005: drive-through e stop-and-go (' + casos.f05 + ')');
ok(casos.f78 === '- dsq', 'F1 1978: só a bandeira preta para a condução perigosa (' + casos.f78 + ')');
ok(casos.nascar === '-', 'NASCAR: contato não é punido');
ok(casos.desligado === '-', 'desligado: nada');

/* 3. drive-through e stop-and-go: cumprir, converter, bandeira preta, kart */
const cum = J.run(`(() => {
  const out = {};
  const mk = (trk, nivel, voltas) => {
    const carros = [{ id: 'ME', me: true, nome: 'Eu', grid: 6 }];
    for(let k = 1; k < 5; k++) carros.push({ id: 'c' + k, nome: 'P' + k, grid: k, ia: { ritmo: .96, ruido: .2, erros: 0 } });
    const S = C2D.Sessao.criar({ trkId: trk, ano: 2024, sk: 'f1', nivel, tipo: 'corrida', voltas, carros, semente: 3, punicoes: 'tolerante' });
    S.eu.ia = C2D.IA.criar({ ritmo: .9 }); S.eu.autopiloto = true;
    return S;
  };
  /* a IA cumpre no box */
  let S = mk('br_int', 0, 8), dado = false;
  for(let k = 0; k < 120 * 60 * 12 && !S.acabou; k++){
    C2D.Sessao.passo(S, null, C2D.DT);
    if(!dado && S.carros[1].voltas >= 1){ dado = true; C2D.Punicoes.aplicar(S, S.carros[1], { t: 'dt' }, 'colisao'); C2D.Punicoes.aplicar(S, S.carros[2], { t: 'sg', s: 10 }, 'colisao'); }
  }
  out.cumpriu = S.eventos.filter(e => e.tipo === 'cumpriu').map(e => e.a + ':' + e.pun).join(' ');
  out.pendentes = S.carros.reduce((a, c) => a + c.punPend.length, 0);
  out.acabou = S.acabou;
  /* nas três últimas voltas o drive-through vira tempo */
  S = mk('br_int', 0, 8); const c = S.carros[1]; c.voltas = 6;
  C2D.Punicoes.aplicar(S, c, { t: 'dt' }, 'colisao'); out.tarde = c.penal + '/' + c.punPend.length;
  /* sem cumprir em três voltas: bandeira preta */
  S = mk('br_int', 0, 12); const d = S.carros[2];
  C2D.Punicoes.aplicar(S, d, { t: 'dt' }, 'colisao'); d.voltas = d.punPend[0].ate;
  C2D.Punicoes.depois(S, null); out.preta = d.estado + ':' + d.foraTipo;
  S.ordem = C2D.Corrida.ordem(S); out.dsqUltimo = S.ordem[S.ordem.length - 1] === d;
  out.dnf = C2D.Corrida.resultado(S).ordem.find(o => o.id === d.id).fora;
  out.torre = C2D.Corrida.torre(S).find(l => l.c === d).dif;
  /* kart: sem pit lane, o drive-through é tempo */
  S = mk('kt_int', 4, 10); const e = S.carros[1];
  C2D.Punicoes.aplicar(S, e, { t: 'dt' }, 'colisao'); out.kart = e.penal + '/' + e.punPend.length;
  /* simular até a bandeirada: o pendente vira tempo */
  S = mk('br_int', 0, 10); const f = S.carros[3];
  C2D.Punicoes.aplicar(S, f, { t: 'sg', s: 10 }, 'colisao');
  C2D.Corrida.projetar(S); out.projetar = f.penal + '/' + f.punPend.length;
  return out;
})()`);
ok(cum.acabou, 'a corrida com punições chegou ao fim');
ok(cum.cumpriu === 'c1:dt c2:sg', 'a IA cumpre drive-through e stop-and-go no box (' + cum.cumpriu + ')');
ok(cum.pendentes === 0, 'nenhuma punição ficou pendente no fim');
ok(cum.tarde === '20/0', 'drive-through nas três últimas voltas vira 20 s (' + cum.tarde + ')');
ok(cum.preta === 'fora:DSQ', 'quem não cumpre em três voltas leva bandeira preta (' + cum.preta + ')');
ok(cum.dsqUltimo, 'o desclassificado fica no fim da classificação');
ok(cum.dnf === 'DSQ' && cum.torre === 'DSQ', 'o resultado e a torre mostram DSQ');
ok(cum.kart === '10/0', 'kart: o drive-through vira tempo (' + cum.kart + ')');
ok(cum.projetar === '30/0', 'simular até a bandeirada converte o stop-and-go em 30 s (' + cum.projetar + ')');

/* 4. sob safety car o jogador a fundo não passa o carro da frente */
const sc = J.run(`(() => {
  const carros = [{ id: 'ME', me: true, nome: 'Eu', grid: 3 }];
  for(let k = 1; k < 8; k++) carros.push({ id: 'c' + k, nome: 'P' + k, grid: k < 3 ? k : k + 1, ia: { ritmo: .95, ruido: .2, erros: 0 } });
  const S = C2D.Sessao.criar({ trkId: 'br_int', ano: 2024, sk: 'f1', nivel: 0, tipo: 'corrida', voltas: 10, carros, semente: 9, punicoes: 'desligado' });
  S.eu.ia = C2D.IA.criar({ ritmo: .97 }); S.eu.autopiloto = true;
  for(let g = 0; g < 120 * 50; g++) C2D.Sessao.passo(S, null, C2D.DT);
  S.eu.autopiloto = false;
  S.sc = { fase: 'ativo', desde: S.t, ateVolta: 99 }; S.houveSC = true;
  const me = S.eu, pos0 = me.pos; let segurou = 0, minGap = Infinity;
  for(let k = 0; k < 120 * 40; k++){
    const fr = S.ordem[me.pos - 2];
    const ia = C2D.IA.comandar(me.ia, me, S.P, S.amb);
    C2D.Sessao.passo(S, { steer: ia.steer, acel: 1, freio: 0 }, C2D.DT);
    if(me.segurandoSC) segurou++;
    if(fr && fr.estado === 'pista' && !fr.box) minGap = Math.min(minGap, fr.sTot - me.sTot);
  }
  return { pos0, pos: me.pos, segurou, minGap };
})()`);
ok(sc.pos === sc.pos0, 'sob safety car o jogador não ganha posição (' + sc.pos0 + ' → ' + sc.pos + ')');
ok(sc.segurou > 0 && sc.minGap > 3, 'o carro segura a distância sozinho (mínimo ' + sc.minGap.toFixed(1) + ' m)');

console.log(falhas ? falhas + ' de ' + n + ' verificações falharam' : 'direção de prova: ' + n + ' verificações, tudo certo');
process.exitCode = falhas ? 1 : 0;
