/* Relê do cache as temporadas já importadas, com a versão atual do leitor.
   Não faz nenhuma requisição: o que não está no cache é pulado.
   Uso: node ferramentas/historico/reler.mjs [ids|todos] [anoIni-anoFim] [--mostrar] */
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';
import { analisarHTML, fechar } from './importar.mjs';

const AQUI = dirname(fileURLToPath(import.meta.url));
const BRUTOS = join(AQUI, 'brutos'), CACHE = join(AQUI, 'cache');
const arq = t => join(CACHE, t.replace(/[^\w.-]+/g, '_').slice(0, 180) + '.json.gz');
const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
const mostrar = process.argv.includes('--mostrar');
const [qual = 'todos', faixa] = args;
const [a0, a1] = faixa ? faixa.split('-').map(Number) : [1900, 2100];
const ids = qual === 'todos' ? readdirSync(BRUTOS) : qual.split(',');
let n = 0;
for(const id of ids){
  if(!existsSync(join(BRUTOS, id))) continue;
  for(const f of readdirSync(join(BRUTOS, id)).filter(x => x.endsWith('.json')).sort()){
    const ano = +f.slice(0, 4);
    if(ano < a0 || ano > (a1 || a0)) continue;
    const velho = JSON.parse(readFileSync(join(BRUTOS, id, f), 'utf8'));
    if(!velho.pagina || !existsSync(arq(velho.titulo))) continue;
    const pg = JSON.parse(gunzipSync(readFileSync(arq(velho.titulo))).toString('utf8'));
    const novo = { campeonato: velho.campeonato, ano: velho.ano, titulo: velho.titulo, pagina: pg.final, revid: pg.revid, baixado: pg.baixado, via: velho.via },
      lido = await analisarHTML(pg.html);
    Object.assign(novo, lido);
    if(!novo.inscritos.length) novo.pendente = novo.classificacao.length ? 'parcial: sem lista de inscritos, só a classificação final' : 'página sem tabela de inscritos legível';
    writeFileSync(join(BRUTOS, id, f), JSON.stringify(novo, null, 1));
    n++;
    if(mostrar) console.log(id.padEnd(14), ano, `${novo.inscritos.length} inscritos, ${novo.classificacao.length} classif., ${novo.calendario.length} etapas, campeão ${novo.campeao || '?'}`);
  }
}
await fechar();
console.log(n + ' temporadas relidas do cache');
