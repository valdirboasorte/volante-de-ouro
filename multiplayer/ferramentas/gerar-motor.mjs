/* Gera src/gerado/motor-jogo.js: o jogo inteiro (os blocos <script> sem atributo do
   index.html, os mesmos que testes/base.js roda) embrulhado numa função, para o
   servidor rodar o motor de verdade sem tela. O Worker não aceita eval, então isso
   precisa acontecer aqui, antes de subir.

   - Os dados entram antes dos blocos, como no harness de testes. As fotos e as
     traduções ficam de fora: só a tela usa.
   - VERSAO_JOGO é o hash dos blocos (com quebras de linha normalizadas, como o
     navegador faz). A página calcula o mesmo hash dos seus scripts e o servidor
     recusa quem estiver noutra versão do jogo.
   Uso: node ferramentas/gerar-motor.mjs   (rode de novo sempre que o index.html mudar) */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, '..', '..');
const SAIDA = path.join(AQUI, '..', 'src', 'gerado', 'motor-jogo.js');
const lf = s => s.replace(/\r\n?/g, '\n');

const html = lf(fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8'));
const blocos = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const VERSAO = versaoDosBlocos(blocos);

const DADOS = ['historico.js', 'escalacoes.js', 'vencedores.js', 'tracados.js', 'tracados-aprox.js', 'tracados-svg.js']
  .map(f => path.join(RAIZ, 'dados', f)).filter(f => fs.existsSync(f));
const codigo = DADOS.map(f => lf(fs.readFileSync(f, 'utf8'))).concat(blocos);

/* os nomes declarados no topo de cada arquivo (coluna 0), para devolver todos */
const declarados = new Map();
for(const c of codigo){
  for(const m of c.matchAll(/^(const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/gm)){
    if(!declarados.has(m[2])) declarados.set(m[2], m[1]);
  }
}
/* o que a página falsa oferece no lugar do navegador, menos o que o jogo declara */
const AMBIENTE = ['window', 'self', 'document', 'localStorage', 'sessionStorage', 'setTimeout', 'clearTimeout',
  'setInterval', 'clearInterval', 'requestAnimationFrame', 'cancelAnimationFrame', 'addEventListener',
  'removeEventListener', 'dispatchEvent', 'scrollTo', 'scrollY', 'innerWidth', 'innerHeight', 'devicePixelRatio',
  'performance', 'navigator', 'location', 'history', 'matchMedia', 'getComputedStyle', 'alert', 'confirm',
  'prompt', 'Audio', 'Image', 'fetch', 'Math'].filter(n => !declarados.has(n));

const acesso = [...declarados].map(([n, tipo]) =>
  (tipo === 'let' || tipo === 'var') ? `get ${n}(){ return ${n}; }, set ${n}(v){ ${n} = v; }` : `get ${n}(){ return ${n}; }`);

const saida = `/* GERADO por multiplayer/ferramentas/gerar-motor.mjs a partir do index.html e de dados/.
   Não edite: rode o gerador de novo. */
export const VERSAO_JOGO = '${VERSAO}';
export function criarMotor(amb){
  const { ${AMBIENTE.join(', ')} } = amb;
${codigo.join('\n;\n')}
;
  return {
    ${acesso.join(',\n    ')}
  };
}
`;
fs.mkdirSync(path.dirname(SAIDA), { recursive: true });
fs.writeFileSync(SAIDA, saida);
console.log(`motor gerado: ${path.relative(RAIZ, SAIDA)} · ${(saida.length / 1048576).toFixed(1)} MB · ${blocos.length} blocos do jogo + ${DADOS.length} de dados · ${declarados.size} nomes · versão ${VERSAO}`);

/* o mesmo cálculo que assets/multiplayer.js faz na página */
export function versaoDosBlocos(bs){
  return crypto.createHash('sha256').update(bs.map(lf).join('\n/*--*/\n')).digest('hex').slice(0, 16);
}
