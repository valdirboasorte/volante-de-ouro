/* A imprensa acompanha a nacionalidade do piloto; os autores e seu público
   continuam brasileiros. Exercita Engine.noticia e textos já salvos. */
const H = require('./base');
let falhas = 0, verificacoes = 0;
const ok = (c, m) => { verificacoes++; if(!c){ falhas++; console.log('  ✗ ' + m); } };
const J = H.carregar({ silencioso:true });
H.novaCarreira(J, { era:7, ano:2024, idade:19, cc:'AR', nome:'Messi', rapido:true });
J.run(`S.catIdx = S.ladder.indexOf('Fórmula Regional'); S.season.cat = 'Fórmula Regional';
  if(S.catIdx < 0) throw new Error('A escada precisa da Fórmula Regional.');
  S.year = 2010;`);

function noticia(autor, grupo, indice, cc = 'AR', genero = 'm'){
  return J.run(`(() => {
    S.driver.cc = ${JSON.stringify(cc)}; S.driver.genero = ${JSON.stringify(genero)};
    S.ecos = []; S.midia = [];
    const autor = ${JSON.stringify(autor)}, grupo = ${JSON.stringify(grupo)};
    const fonte = CELEBRIDADES.find(c => c.n === autor), fala = fonte[grupo][${indice}];
    const anterior = { ...R };
    R.chance = () => true;
    R.pick = lista => lista.includes(fonte) ? fonte : lista.includes(fala) ? fala : lista[0];
    try {
      Engine.noticia(grupo === 'titulo' ? 'titulo' : grupo === 'neutro' ? 'subiu' : 'vitoria',
        { gp:'Buenos Aires', pos:1, grid:3, cat:'Fórmula Regional' });
      return S.midia[0];
    } finally { Object.assign(R, anterior); }
  })()`);
}

{
  const p = noticia('Emerson Fittipaldi', 'titulo', 3);
  ok(p.txt === 'Que orgulho ver um argentino campeão de novo. Muito bem, Messi.', 'a fala da captura chama o piloto argentino de argentino');
  ok(p.autor === 'Emerson Fittipaldi' && p.info, 'a fonte continua Emerson, com sua marca informativa');
  const f = noticia('Emerson Fittipaldi', 'titulo', 3, 'AR', 'f');
  ok(f.txt === 'Que orgulho ver uma argentina campeã de novo. Muito bem, Messi.', 'a mesma fala respeita o gênero da pilota argentina');
  ok(noticia('Emerson Fittipaldi', 'titulo', 3, 'BR').txt.includes('um brasileiro campeão'), 'piloto brasileiro continua tratado como brasileiro');
  ok(noticia('Emerson Fittipaldi', 'titulo', 3, 'BR', 'f').txt.includes('uma brasileira campeã'), 'pilota brasileira é chamada de brasileira');
}

/* Não exige uma sequência aleatória específica: escolhe deliberadamente
   cada fala nacional na seleção real de veículo e texto. */
const nacionais = [
  ['Galvão Bueno', 'titulo', 1], ['Luciano do Valle', 'titulo', 0],
  ['Luciano do Valle', 'titulo', 3], ['Faustão', 'titulo', 3],
  ['Gugu Liberato', 'bom', 7], ['Gugu Liberato', 'neutro', 3],
  ['Gugu Liberato', 'titulo', 1], ['Emerson Fittipaldi', 'titulo', 1],
  ['Emerson Fittipaldi', 'titulo', 3]
];
for(const [autor, grupo, indice] of nacionais){
  const p = noticia(autor, grupo, indice);
  ok(!/brasileir|Brasil|BRASILEIR/.test(p.txt), `${autor}/${grupo}/${indice}: não atribui nacionalidade brasileira ao argentino`);
  ok(/argentin/i.test(p.txt) && !/[{}]/.test(p.txt), `${autor}/${grupo}/${indice}: mostra a Argentina sem marcadores pendentes`);
}

for(const [cc, genero, esperado] of [
  ['DE','m','Poucos alemães'], ['DE','f','Poucas alemãs'],
  ['FR','m','Poucos franceses'], ['CN','m','Poucos chineses'],
  ['ES','m','Poucos espanhóis'], ['LV','m','Poucos letões'], ['PT','f','Poucas portuguesas']
]) ok(noticia('Emerson Fittipaldi', 'titulo', 1, cc, genero).txt.startsWith(esperado), `plural correto para ${cc}/${genero}`);

for(const cc of J.run('COUNTRIES.map(c => c.cc)')){
  const p = noticia('Emerson Fittipaldi', 'titulo', 3, cc);
  const f = noticia('Emerson Fittipaldi', 'titulo', 3, cc, 'f');
  ok(!/[{}]/.test(p.txt + f.txt) && !/um piloto campeão|uma pilota campeã/.test(p.txt + f.txt), `${cc}: ambas as nacionalidades têm gentilício`);
}
ok(noticia('Galvão Bueno', 'titulo', 1, 'US').txt.includes('para os Estados Unidos'), 'artigo plural do país aparece corretamente');
ok(noticia('Galvão Bueno', 'titulo', 1, 'PT').txt.includes('para Portugal'), 'Portugal aparece sem artigo');
ok(noticia('Luciano do Valle', 'bom', 7).txt.includes('torcedor brasileiro'), 'o torcedor da emissora continua brasileiro');
ok(noticia('Luciano do Valle', 'bom', 0).txt.startsWith('ATENÇÃO, BRASIL!'), 'o narrador continua falando ao público brasileiro');

/* A mesma atualização corrige o feed antigo do save sem sorteá-lo de novo. */
J.run(`S.driver.cc = 'AR'; S.driver.genero = 'm';`);
const antigos = [
  ['Emerson Fittipaldi','Que orgulho ver um brasileiro campeão de novo. Muito bem, Messi.'],
  ['Emerson Fittipaldi','Poucos brasileiros chegaram lá. O Messi chegou. Parabéns de coração.'],
  ['Gugu Liberato','Domingo de vitória brasileira. Messi, 1º lugar!'],
  ['Gugu Liberato','Mais um brasileiro subindo na vida. Parabéns, Messi!'],
  ['Gugu Liberato','O Brasil tem um novo campeão e ele se chama Messi. Que emoção!'],
  ['Galvão Bueno','O Brasil tem um campeão de novo! Messi, 2010! Que emoção, amigos!'],
  ['Faustão','O Brasil tem campeão de novo, e o nome dele é Messi!'],
  ['Luciano do Valle','CAMPEÃO BRASILEIRO DE NOVO, MINHA GENTE! O Messi é campeão de 2010!'],
  ['Luciano do Valle','É título, é festa, é Brasil! Parabéns, Messi!']
];
for(const [autor, txt] of antigos){
  const atualizado = J.run(`textoImprensa(${JSON.stringify({ autor, txt })})`);
  ok(/argentin/i.test(atualizado) && !/Brasil|brasileir|BRASILEIR/.test(atualizado), `${autor}: corrige fala nacional já guardada no save`);
  ok(J.run(`textoImprensa(${JSON.stringify({ autor, txt:atualizado })})`) === atualizado, `${autor}: correção de texto antigo é idempotente`);
}
const historica = 'Emerson Fittipaldi foi o primeiro brasileiro campeão de Fórmula 1.';
ok(J.run(`textoImprensa(${JSON.stringify({ autor:'Emerson Fittipaldi', txt:historica })})`) === historica, 'não muda a nacionalidade de pessoas reais');
const estrangeira = 'Que orgulho ver um brasileiro campeão de novo. Muito bem, Messi.';
ok(J.run(`textoImprensa(${JSON.stringify({ autor:'Outro jornalista', txt:estrangeira })})`) === estrangeira, 'migração fica restrita às falas e aos autores conhecidos');
J.run(`S.midia = [{ autor:'Emerson Fittipaldi', txt:${JSON.stringify(antigos[0][1])}, ano:2010, rot:'TV', tom:'bom' }]; UI.render();`);
ok(J.E('pane-mid').innerHTML.includes('um argentino campeão'), 'a interface exibe corrigida a mensagem que já estava no save');
J.run(`S.driver.genero = 'f';`);
ok(J.run(`textoImprensa(${JSON.stringify({ autor:'Emerson Fittipaldi', txt:'Que orgulho ver um brasileiro campeã de novo. Muito bem, Messi.' })})`).includes('uma argentina campeã'), 'corrige também a antiga frase feminina do save');
console.log(`${verificacoes - falhas}/${verificacoes} verificações de nacionalidade passaram.`);
if(falhas) process.exitCode = 1;
