/* Atualização da comunidade (fase 5): qualidade de vida e novos caminhos.
   — largada com um toque: o jeito fica guardado no aparelho; um toque com as cinco luzes
     acesas queima a largada, cedo demais recomeça, e a reação vale do mesmo jeito;
   — de piloto a chefe: só por escolha, sem acidente fatal, na mesma categoria e no ano
     seguinte, com reputação, conquistas e o engenheiro de confiança; a carreira de chefe
     anterior vai para "Jogos salvos";
   — interface: chance de chuva das próximas etapas no calendário (sem sortear nada),
     faixa de números no resultado, atalhos da barra de ações agrupados;
   — as telas novas em inglês, espanhol e japonês.
   Uso: node testes/comunidade5.js   Não modifica arquivos nem saves. */
'use strict';
const H = require('./base');
let falhas = 0, n = 0;
const ok = (c, m) => { n++; if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };
const js = (J, code) => JSON.parse(J.run('JSON.stringify(' + code + ')'));

/* 1. largada com um toque */
{
  const store = {};
  const J = H.carregar({ silencioso: true, seed: 1, store });
  ok(J.run('AoVivo.modoLargada()') === 'segurar', 'sem tela de toque, o padrão continua segurar e soltar');
  J.run('Store.set("vdo_largada", "toque")');
  ok(J.run('AoVivo.modoLargada()') === 'toque' && store.vdo_largada === 'toque', 'a escolha de um toque fica guardada no aparelho');
  J.run('globalThis.matchMedia = q => ({ matches: /coarse/.test(q) }); Store.del ? Store.del("vdo_largada") : Store.set("vdo_largada", "")');
  ok(J.run('AoVivo.modoLargada()') === 'toque', 'no celular (tela de toque) o padrão é um toque');
  const src = J.run('String(AoVivo.luzes)');
  ok(/est === 'acesas'\) fim\(true, 0\)/.test(src.slice(src.indexOf('const tocar'))) && /timers\.push\(setTimeout\(acender, 1400\)\)/.test(src) && /performance\.now\(\) - t0/.test(src.slice(src.indexOf('const tocar'))),
    'no toque, cinco luzes acesas queimam a largada, cedo demais recomeça, e a reação é medida das luzes apagadas');
}

/* 2. de piloto a chefe */
{
  const store = {};
  const J = H.carregar({ silencioso: true, seed: 8, store });
  J.run(require('./chefe-comum'));
  H.novaCarreira(J, { era: 7, ano: 2010, idade: 30, serie: 'f1', modo: 'realista' });
  J.run('Game.simSeason(false); UI.limparFila(); UI.close();');
  ok(!J.run('ExPiloto.pode()'), 'piloto em atividade não vira chefe');
  J.run('S.career.titles = 2; S.career.wins = 15; S.driver.fame = 80; Game.endCareer("escolha"); UI.close();');
  ok(J.run('ExPiloto.pode()') && !J.run('typeof C !== "undefined" && C'), 'aposentado, a opção aparece, mas nada acontece sem o jogador escolher');
  J.run('UI.careerEnd(S.fimRec, S.fimRazao)');
  ok(/Virar chefe de equipe/.test(J.E('modal').innerHTML), 'o fim da carreira oferece "Virar chefe de equipe"');
  const eqs = js(J, 'ExPiloto.equipes()');
  ok(eqs.length >= 2 && eqs.some(e => e.antiga), `quem chama: ${eqs.map(e => e.nome).join(', ')} (a última equipe dele também)`);
  /* um bicampeão é chamado por equipe maior que um piloto sem nome */
  const forte = Math.max(...eqs.map(e => e.str));
  const fraco = js(J, '(() => { const t = S.fimRec.titles, w = S.fimRec.wins, f = S.driver.fame; S.fimRec.titles = 0; S.fimRec.wins = 0; S.driver.fame = 5; const r = ExPiloto.equipes(); S.fimRec.titles = t; S.fimRec.wins = w; S.driver.fame = f; return Math.max(...r.filter(x => !x.antiga).map(x => x.str)); })()');
  ok(forte > fraco, `quanto maior o nome, maior a equipe que liga (${forte} contra ${fraco})`);
  J.run('(() => { const e = Engine.gente().find(p => p.papel === "eng"); if(e){ e.rel.conf = 92; e.rel.afeto = 90; e.rel.resp = 90; e.rel.tens = 0; } })()');
  const antes = J.run('S.year');
  J.run(`ExPiloto.comecar(${eqs[0].idx})`);
  const c = js(J, '{ nome: C.chefe.nome, ano: C.ano, sk: C.sk, rep: C.rep, ex: C.exPiloto, proj: C.staff.proj && C.staff.proj.nome }');
  ok(c.nome === 'Teste' && c.ano === antes + 1 && c.sk === 'f1', 'o chefe é o mesmo nome, na mesma categoria, no ano seguinte');
  ok(c.rep >= 60 && c.ex && c.ex.titulos === 2 && c.ex.vitorias === 15 && c.ex.rel.length >= 1, `reputação ${c.rep} e as conquistas de piloto na ficha do chefe`);
  ok(c.ex.engenheiro && c.proj === c.ex.engenheiro, `o engenheiro de confiança vem para a fábrica (${c.ex.engenheiro})`);
  ok(!!store.vdo_hall && JSON.parse(store.vdo_hall).some(x => x.name === 'Teste' && x.titles === 2), 'a carreira de piloto ficou na galeria');
  ok(js(J, 'Chefe.registroCarreira("aposentou").exPiloto.tit') === 2, 'o registro da galeria de chefes guarda o piloto que ele foi');
  const K = H.carregar({ silencioso: true, seed: 9 });
  H.novaCarreira(K, { era: 7, ano: 2010, idade: 30, serie: 'f1' });
  K.run('Game.endCareer("acidente"); UI.close();');
  ok(!K.run('ExPiloto.pode()'), 'depois de um acidente fatal, não há passagem para chefe');
}

/* 3. interface */
{
  const J = H.carregar({ silencioso: true, seed: 9 });
  H.novaCarreira(J, { era: 7, ano: 2018, idade: 24, serie: 'f1' });
  const antes = js(J, 'S.season.clima || {}');
  const h = J.run('(() => { UI.render(); return UI.chanceChuva(S.season.calendar[1], true) + UI.chanceChuva({ rainP: .4 }, false); })()');
  ok(/Chance de chuva: \d+%/.test(h) && /wx-prev on/.test(h) && JSON.stringify(js(J, 'S.season.clima || {}')) === JSON.stringify(antes),
    'o calendário mostra a chance de chuva das próximas etapas, sem sortear o tempo antes da hora');
  J.run('Game.simSeason(false, true); UI.limparFila(); UI.close();');
  const r = J.run('UI.resumoCorrida(S.season.results[0], S.season)');
  ok(/Largada/.test(r) && /Chegada/.test(r) && /Pontos/.test(r) && /Campeonato/.test(r), 'o resultado mostra largada, chegada, pontos e campeonato logo abaixo da posição');
  const src = J.run('String(UI.render) + String(UI.agruparAcoes)');
  ok(/UI\.agruparAcoes\(el\('actBar'\)\)/.test(J.run('Object.values(UI).filter(f => typeof f === "function").map(String).join("\\n")')) && /act-sec/.test(src),
    'os atalhos da barra de ações ficam numa fileira só no celular');
}

/* 4. as telas novas nos outros idiomas */
{
  const sources = new Set();
  const normalize = s => String(s).replace(/\s+/g, ' ').trim();
  const decode = s => s.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (_, e) => e[0] === '#'
    ? String.fromCodePoint(parseInt(e.slice(/^#x/i.test(e) ? 2 : 1), /^#x/i.test(e) ? 16 : 10))
    : ({ amp:'&', lt:'<', gt:'>', quot:'"', apos:"'", nbsp:' ' }[e.toLowerCase()]));
  const record = v => { const s = normalize(decode(String(v))); if(/\p{L}/u.test(s)) sources.add(s); };
  const html = v => {
    const clean = String(v).replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
      .replace(/<([a-z]+)[^>]*data-i18n-ignore[^>]*>[^<]*<\/\1>/gi, '');
    for(const m of clean.matchAll(/<(?:[^>"']|"[^"]*"|'[^']*')*>|[^<]+/g)){
      if(m[0][0] !== '<') record(m[0]);
      else for(const a of m[0].matchAll(/\b(?:title|aria-label|placeholder|alt|label)\s*=\s*(["'])(.*?)\1/g)) record(a[2]);
    }
  };
  let ligado = false;
  const J = H.carregar({ silencioso: true, seed: 8, onWrite: w => { if(!ligado) return; w.property === 'innerHTML' ? html(w.value) : record(w.value); } });
  J.run(require('./chefe-comum'));
  H.novaCarreira(J, { era: 7, ano: 2010, idade: 30, serie: 'f1', modo: 'realista' });
  J.run('Game.simSeason(false, true); UI.limparFila(); UI.close();');
  ligado = true;
  J.run(`UI.render(); UI.raceResult(S.season.results[0]); UI.close();
    ['Toque uma vez quando as luzes apagarem. Sua reação vale para os dois carros; cada piloto soma o próprio jeito de largar.',
     'Toque uma vez quando as luzes apagarem. Quanto mais rápido, melhor a largada.', 'Toque quando apagar', 'Segurar e soltar', 'Um toque', 'Jeito de largar',
     'Cedo demais. Toque só quando as luzes apagarem.'].forEach(t => UI.toast(t));
    S.career.titles = 1; S.career.wins = 5; Game.endCareer('escolha'); UI.close(); UI.careerEnd(S.fimRec, S.fimRazao); UI.virarChefe();
    ExPiloto.comecar(ExPiloto.equipes()[0].idx); UIC.render();
    Chefe.noticia('Teste, 1× campeão como piloto, assume a Renault.', 'g'); Chefe.noticia('Teste troca o capacete pelo fone de ouvido e assume a Renault.', 'g'); UIC.render();`);
  const api = J.ctx.VDO_I18N;
  const nomes = Array.from(J.run('VDO_LANGUAGE_NAMES()')).concat(['Teste', 'Renault']).sort((a, b) => b.length - a.length);
  const residual = /\b(?:você|vocês|não|também|equipe|temporada|corrida|piloto|largada|luzes|toque|segurar|soltar|cedo|demais|reação|capacete|muro|boxes|carreira|galeria|chefe|categoria|reputação|conquistas|engenheiro|campeão|vitórias|chuva|chegada|pontos|campeonato|jogos|salvos|nenhuma|força)\b/iu;
  const residualEs = /(?:você|vocês|não|também|equipe|segurar|reação|capacete|muro dos|galeria\b|conquistas|engenheiro|campeão|vitórias|chuva|chegada|jogos salvos|nenhuma|força)/iu;
  const ruins = [];
  let k = 0;
  for(const s of sources) for(const lang of ['en', 'es', 'ja']){
    let t = api.audit(s, lang).text; nomes.forEach(x => t = t.split(x).join('')); k++;
    if((lang === 'es' ? residualEs : residual).test(t)) ruins.push(`${lang}: ${s} => ${t}`);
  }
  for(const precisa of ['Virar chefe de equipe', 'Do capacete ao muro dos boxes', 'O nome que você fez vira reputação', 'Chance de chuva', 'Um toque']){
    k++; if(![...sources].some(s => s.indexOf(precisa) >= 0)) ruins.push('não renderizou: ' + precisa);
  }
  ruins.slice(0, 25).forEach(x => console.log('    ' + x));
  ok(!ruins.length, `as telas e mensagens da fase 5 em inglês, espanhol e japonês (${k} textos verificados${ruins.length ? ', ' + ruins.length + ' com português sobrando' : ''})`);
}

console.log(falhas ? `\n${falhas} de ${n} verificações falharam` : `\ncomunidade, fase 5: ${n} verificações, tudo certo`);
process.exit(falhas ? 1 : 0);
