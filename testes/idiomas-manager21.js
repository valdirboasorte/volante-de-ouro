/* As telas e mensagens novas do Manager 2.1, renderizadas em inglês, espanhol e
   japonês: galeria e recordes do chefe, encerrar a carreira, teto de gastos, condições
   da classificação, planejamento das peças, programas de treino, moral, mercado,
   convites e recompra de participação. Procura português que tenha sobrado.
   Uso: node testes/idiomas-manager21.js   (VDO_FALTAS=1 lista o que falta traduzir)
   Não modifica arquivos nem saves. */
'use strict';
const H = require('./base');
const languages = ['en', 'es', 'ja'];
const sources = new Set();
const normalize = s => String(s).replace(/\s+/g, ' ').trim();
const decode = s => s.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (_, e) => e[0] === '#'
  ? String.fromCodePoint(parseInt(e.slice(/^#x/i.test(e) ? 2 : 1), /^#x/i.test(e) ? 16 : 10))
  : ({ amp:'&', lt:'<', gt:'>', quot:'"', apos:"'", nbsp:' ' }[e.toLowerCase()]));
function record(value){ const s = normalize(decode(String(value))); if(/\p{L}/u.test(s)) sources.add(s); }
function html(value){
  const clean = String(value).replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<([a-z]+)[^>]*data-i18n-ignore[^>]*>[^<]*<\/\1>/gi, '');
  for(const m of clean.matchAll(/<(?:[^>"']|"[^"]*"|'[^']*')*>|[^<]+/g)){
    if(m[0][0] !== '<') record(m[0]);
    else for(const attr of m[0].matchAll(/\b(?:title|aria-label|placeholder|alt|label)\s*=\s*(["'])(.*?)\1/g)) record(attr[2]);
  }
}
const store = {};
const J = H.carregar({ silencioso:true, seed:2121, store, onWrite:w => w.property === 'innerHTML' ? html(w.value) : record(w.value) });
const run = code => J.run(code);
run(require('./chefe-comum'));
run(`globalThis.cancelAnimationFrame = () => {};
  const l = eraOfSeries(2020, 'f1').teams.map((t, i) => [i, Engine.resolveTeam(t, i, 2020, 'f1')]).filter(x => x[1]).sort((a, b) => b[1].str - a[1].str);
  Chefe.novo({ modo:'assumir', sk:'f1', ano:2020, idx:l[1][0], chefe:{ nome:'T', cc:'BR' }, realismo:true });
  UI.limparFila(); UI.close(); UI.show('chefe');
  __inverno(); __temporada(); Chefe.proximoAno(); UI.limparFila(); UI.close();`);

/* o inverno de 2021: o aviso do teto, o painel, os convites, encerrar a carreira */
run(`C.rep = 90; C.total.temporadas = 6; C.total.tit = 2;
  C.inv.convites = [{ sk:'indy', idx:0, nome:'Penske', cor:'#ffcc00', str:90 }, { sk:'f1', idx:0, nome:'Mercedes', cor:'#00d2be', str:96 }];
  UIC.inverno(); UIC.pagina('financas'); UIC.convites(); UIC.aposentarModal(); UIC.recordes(); UIC.pagina('historico');
  /* a mensagem do primeiro ano com teto */
  C.inv.msgs.forEach(m => Chefe.noticia(m.t, ''));`);

/* a estrela sob contrato no mercado e o nº 1 */
run(`(() => { const m = C.inv.mercado.find(p => Chefe.sobContrato(p)) || C.inv.mercado[0];
  const est = Chefe.titulares()[0]; if(est){ est.base = 95; est.real = true; }
  if(m){ m.skill = 95; UIC.negociar(C.inv.mercado.indexOf(m)); }
  if(m && Chefe.multaRival(m)) Chefe.assinar(m, { sal:1, anos:2, n1:true, papel:'titular' }, 1); })()`);

/* a temporada: moral, classificação, treinos e peças */
run(`__inverno(); Chefe.comecarTemporada(); UI.limparFila(); UI.close();
  const tit = Chefe.titulares();
  tit.forEach(p => { Chefe.mexerMoral(p, 6, 'resultados acima do carro'); Chefe.mexerMoral(p, -11, 'ordem de equipe'); Chefe.mexerMoral(p, -2, 'quebras do carro');
    Chefe.mexerMoral(p, -3, 'perder para o companheiro'); Chefe.mexerMoral(p, -10, 'perdeu o status de nº 1'); Chefe.mexerMoral(p, 8, 'contrato novo');
    Chefe.mexerMoral(p, 6, 'aumento'); Chefe.mexerMoral(p, -6, 'queria sair e ficou'); Chefe.mexerMoral(p, -16, 'segurado contra a vontade');
    Chefe.mexerMoral(p, -12, 'rebaixado a reserva'); Chefe.mexerMoral(p, 4, 'contrato renovado'); Chefe.mexerMoral(p, -4, 'resultados abaixo do carro'); });
  UIC.pagina('pilotos');
  Chefe.qualiDaEtapa(C.temporada); UIC.quali();
  UIC.preCorrida();
  ['pneus', 'configuracao'].forEach((v, k) => UIC.dec('treino', k, v));
  const P = Pecas.P(); Pecas.projetar('asaD', 'lenta', 1); Pecas.projetar('susp', 'pneu', 2);
  Chefe.correr(); Chefe.correr();
  P.proj.filter(x => x.st === 'proj').forEach(x => { x.fim = P.dia; }); Pecas.avancar(0);
  UIC.pagina('desenvolvimento');
  const pr = P.proj.find(x => x.st === 'pronto'); if(pr) Pecas.fabricar(pr.e, 2, true);
  P.proj.filter(x => x.st === 'fab').forEach(x => { x.fim = P.dia; }); Pecas.avancar(0);
  UIC.pagina('desenvolvimento'); UIC.pagina('financas');
  C.conceito = null; Chefe.noticia('O carro novo nasceu certo: o conceito para o regulamento de 2022 deu mais do que a fábrica esperava.', 'g');
  Chefe.noticia('O conceito do carro novo não funcionou na pista como no túnel. Vai ser um ano de correr atrás.', 'rd');
  UIC.pagina('historico');`);

/* a galeria com chefes (um registro novo e um antigo) */
run(`(() => { const r = Chefe.registroCarreira('aposentou');
  localStorage.setItem('vdo_chefe_hall', JSON.stringify([r, { nome:'Velho', eq:'Antiga', cor:'#777777', de:1970, ate:1979, tit:3, v:20, anos:10, motivo:'venda' }]));
  UI.hall(); document.body.dataset.tela = 'chefe'; UI.records(); })()`);

/* uma equipe própria com sócios: recompra e lucro dos sócios */
run(`Chefe.novo({ modo:'criar', sk:'f1', ano:2010, chefe:{ nome:'T', cc:'BR' }, eq:{ nome:'Própria', cor:'#123456', cc:'BR' }, realismo:true });
  UI.limparFila(); UI.close(); C.part = 70; C.caixa = 500e6; __inverno();
  UIC.inverno(); UIC.recompraModal(); UIC.investidores(); UIC.recomprar(5);
  __temporada(); UIC.pagina('historico'); UIC.pagina('financas');
  UIC.fimCarreira('aposentou');`);

const api = J.ctx.VDO_I18N;
const knownNames = Array.from(run('VDO_LANGUAGE_NAMES()')).sort((a, b) => b.length - a.length);
const residual = /\b(?:você|vocês|não|também|equipe|temporada|corrida|pneu|piloto|pilotos|saídas|classificação|carreira|galeria|lendas|títulos|vitórias|pódios|construtores|reputação|encerrar|sócios|lucro|recomprar|participação|convites|categoria|limite|gastos|projeção|salários|motor|academia|multa|túnel|pista|tráfego|bandeira|chuva|previsão|etapa|etapas|peça|peças|fábrica|pressas|defeito|horas|moral|contrato|rescisão|estrela|companheiro|aumento|rebaixado|conceito|regulamento|fecha|ritmo|dados|acerto|configuração|avaliação)\b/iu;
const residualEs = /(?:você|vocês|não|também|equipe|pneu|saídas|classificação|galeria|vitórias|pódios|construtores|reputação|encerrar|sócios|lucro|recomprar|participação|convites|projeção|salários|tráfego|bandeira|chuva|previsão|peça|peças|pressas|defeito|companheiro|rebaixado|conceito|regulamento|dados|acerto|configuração|avaliação)/iu;
let checks = 0;
const falhas = [], faltas = new Set();
for(const source of sources){
  for(const lang of languages){
    const a = api.audit(source, lang);
    let t = a.text;
    for(const name of knownNames) t = t.split(name).join('');
    checks++;
    if(process.env.VDO_FALTAS) (a.missing || []).forEach(m => faltas.add(m));
    if((lang === 'es' ? residualEs : residual).test(t)) falhas.push(`${lang}: ${source} => ${t}`);
  }
}
/* as telas novas foram mesmo renderizadas */
for(const precisa of ['Chefes de equipe', 'Números da carreira', 'Encerrar a carreira', 'Convites', 'Condições da sessão', 'Próximas etapas', 'Recomprar participação', 'Avaliação de pneus', 'Teste de configuração']){
  checks++; if(![...sources].some(s => s.indexOf(precisa) >= 0)) falhas.push('não renderizou: ' + precisa);
}
if(process.env.VDO_FALTAS){ console.log([...faltas].join('\n')); }
falhas.slice(0, 40).forEach(f => console.log('  ✗ ' + f));
console.log(falhas.length ? `\n${falhas.length} de ${checks} verificações falharam` : `\n${checks} verificações: as telas do Manager 2.1 traduzidas nos três idiomas`);
process.exit(falhas.length ? 1 : 0);
