/* As carreiras de chefe na galeria de lendas e nos recordes (Manager 2.1, item 1):
   — encerrar por vontade própria, na pré-temporada, grava a carreira e apaga o save;
   — o registro sai do que as temporadas guardaram: títulos de construtores e de
     pilotos, vitórias, pódios, poles, pontos, equipes, categorias e reputação;
   — a troca de equipe no meio da carreira não perde nada;
   — a galeria mostra os chefes numa seção própria, ao lado dos pilotos;
   — o registro antigo (só título, vitória e anos) continua abrindo, sem inventar números;
   — na tela do chefe, "Recordes" abre os números da carreira de chefe.
   Uso: node testes/chefe-lendas.js   Não modifica arquivos nem saves. */
const H = require('./base');
let falhas = 0, n = 0;
const ok = (c, m) => { n++; if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };

const store = {};
const J = H.carregar({ silencioso: true, seed: 21, store });
J.run(require('./chefe-comum'));
J.run(`(() => { const l = eraOfSeries(1988, 'f1').teams.map((t, i) => [i, Engine.resolveTeam(t, i, 1988, 'f1')]).filter(x => x[1]).sort((a, b) => b[1].str - a[1].str);
  Chefe.novo({ chefe:{ nome:'Teste Lenda', cc:'BR' }, realismo:true, modo:'assumir', sk:'f1', ano:1988, idx:l[2][0] }); })()`);
for(let a = 0; a < 6; a++){
  J.run('__inverno(); __temporada();');
  /* no meio, uma troca de equipe, no lugar da virada do ano (como depois de uma demissão): a carreira continua a mesma */
  if(a === 2) J.run(`(() => { const ano = C.ano + 1; const t = eraOfSeries(ano, 'f1').teams.map((t, i) => [i, Engine.resolveTeam(t, i, ano, 'f1')]).find(x => x[1] && x[1].name !== C.eq.nome); Chefe.assumirOutra({ idx: t[0] }); })()`);
  else J.run('Chefe.proximoAno();');
  J.run('UI.limparFila(); UI.close();');
}
J.run('__inverno(); UIC.salvar();');

const r = JSON.parse(J.run('JSON.stringify(Chefe.registroCarreira("aposentou"))'));
const hist = JSON.parse(J.run('JSON.stringify(C.hist)'));
const soma = k => hist.reduce((s, h) => s + (h[k] || 0), 0);
ok(r.anos === hist.length && r.anos === 6, `seis temporadas no registro (${r.anos})`);
ok(r.v === soma('v') && r.pod === soma('pod') && r.poles === soma('poles') && r.pts === Math.round(soma('pts')), `vitórias ${r.v}, pódios ${r.pod}, poles ${r.poles} e pontos ${r.pts} batem com as temporadas`);
ok(r.tit === hist.filter(h => h.pos === 1 && !h.excluida).length, `títulos de construtores (${r.tit}) batem com as temporadas em 1º`);
ok(r.titP === J.run('C.total.titP'), `títulos de pilotos da equipe (${r.titP})`);
ok(Array.isArray(r.equipes) && r.equipes.length >= 2 && r.equipes.indexOf(J.run('C.eq.nome')) >= 0, `as duas equipes ficam no registro (${r.equipes.join(', ')})`);
ok(r.cats.length === 1 && r.cats[0] === 'Fórmula 1' && r.de === 1988 && r.ate === J.run('C.ano'), `categoria e período (${r.de}–${r.ate})`);
ok(typeof r.rep === 'number' && r.melhor && r.melhor.pos >= 1, `reputação final ${r.rep} e melhor temporada (${r.melhor && r.melhor.pos}º em ${r.melhor && r.melhor.ano})`);

/* o botão de encerrar só existe na pré-temporada; na temporada, só avisa */
J.run('UIC.aposentarModal()');
ok(/Encerrar a carreira/.test(J.E('modal').innerHTML) && /galeria de lendas/.test(J.E('modal').innerHTML), 'na pré-temporada, encerrar pede confirmação e explica o que acontece');
J.run('UI.close(); UIC.fimCarreira("aposentou")');
const galeria = JSON.parse(store.vdo_chefe_hall || '[]');
ok(galeria.length === 1 && galeria[0].ver === 2 && galeria[0].motivo === 'aposentou' && galeria[0].v === r.v, 'a carreira foi para a galeria dos chefes, com o registro completo');
ok(!store.vdo_chefe, 'o save da carreira encerrada foi apagado só depois de gravar a galeria');

/* um registro antigo, da versão anterior, ao lado do novo */
store.vdo_chefe_hall = JSON.stringify(galeria.concat([{ nome:'Chefe Antigo', eq:'Equipe Velha', cor:'#888888', de:1970, ate:1979, tit:3, v:20, anos:10, motivo:'venda' }]));
store.vdo_hall = JSON.stringify([{ name:'Piloto X', cc:'BR', num:7, from:2000, to:2010, titles:1, wins:9, podiums:20, poles:5, gps:180, seasons:11 }]);
J.run('C = null; UI.hall()');
const h = J.E('modal').innerHTML;
ok(/Chefes de equipe/.test(h) && /Teste Lenda/.test(h) && /Chefe Antigo/.test(h) && /Piloto X/.test(h), 'a galeria mostra pilotos e chefes, cada um na sua seção');
ok(h.indexOf('Chefe Antigo') < h.indexOf('Teste Lenda') || r.tit > 3, 'os chefes ficam ordenados por títulos de construtores');
ok(!/undefined|NaN/.test(h), 'o registro antigo abre sem "undefined" nem números inventados');
const antigo = h.slice(h.indexOf('Chefe Antigo'), h.indexOf('Chefe Antigo') + 900);
ok(!/pódios|poles/.test(antigo.slice(0, antigo.indexOf('</div>', antigo.indexOf('class="od"')) + 1)), 'o registro antigo não ganha pódios nem poles que não tinha');

/* na tela do chefe, "Recordes" mostra a carreira de chefe */
J.run(`(() => { Chefe.novo({ modo:'criar', ano:2005, chefe:{ nome:'Outro', cc:'BR' }, eq:{ nome:'Nova', cor:'#123456', cc:'BR' } }); __inverno(); __temporada(); Chefe.proximoAno(); UI.limparFila(); UI.close(); document.body.dataset.tela = 'chefe'; UI.records(); })()`);
const rc = J.E('modal').innerHTML;
ok(/Números da carreira/.test(rc) && /Títulos de construtores/.test(rc) && /Nova/.test(rc), 'na tela do chefe, Recordes abre os números da carreira de chefe');
J.run(`document.body.dataset.tela = 'intro'; S = null; UI.records()`);
ok(/Galeria de lendas/.test(J.E('modal').innerHTML), 'fora do chefe e sem carreira de piloto, Recordes leva à galeria');

console.log(falhas ? `\n${falhas} de ${n} verificações falharam` : `\nlendas e recordes do chefe: ${n} verificações, tudo certo`);
process.exit(falhas ? 1 : 0);
