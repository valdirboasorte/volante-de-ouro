/* Lista o que mudou nas escalações (LINEUPS) entre um commit e o arquivo atual.
   Uso: node ferramentas/historico/diff-escalacoes.mjs [commit] > saída.md */
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const commit = process.argv[2] || '1de47cc';
const lineups = html => {
  const i = html.indexOf('const LINEUPS = {'), j = html.indexOf('\n};', i) + 3;
  const ctx = {}; vm.createContext(ctx); vm.runInContext(html.slice(i, j).replace('const LINEUPS', 'var LINEUPS'), ctx);
  return ctx.LINEUPS;
};
const antes = lineups(execSync(`git show ${commit}:index.html`, { cwd: RAIZ, maxBuffer: 64e6 }).toString());
const agora = lineups(readFileSync(join(RAIZ, 'index.html'), 'utf8'));
const parse = t => Object.fromEntries(String(t || '').split('|').filter(Boolean).map(b => { const i = b.indexOf(':'); return [b.slice(0, i), b.slice(i + 1).split(',').filter(Boolean)]; }));
const linhas = [];
for(const sk of Object.keys(agora)){
  for(const ano of Object.keys(agora[sk])){
    const a = parse(antes[sk] && antes[sk][ano]), b = parse(agora[sk][ano]);
    const onde = (m, p) => Object.keys(m).find(e => m[e].includes(p));
    const pilotos = new Set([...Object.values(a).flat(), ...Object.values(b).flat()]);
    const mud = [];
    for(const p of pilotos){
      const ea = onde(a, p), eb = onde(b, p);
      if(ea === eb) continue;
      mud.push(!eb ? `${p} sai da ${ea}` : !ea ? `${p} entra na ${eb}` : `${p}: ${ea} → ${eb}`);
    }
    if(mud.length) linhas.push(`| ${sk === 'f1' ? 'F1' : 'Indy'} | ${ano} | ${mud.join('; ')} |`);
  }
}
console.log(`# Correções nas escalações do jogo\n\nComparação entre a versão ${commit} e a atual. Cada mudança veio da auditoria contra a lista de inscritos da temporada (ver RELATORIO.md); só entrou o que a fonte mostra e o jogo já tinha como representar (equipe existente naquele ano, piloto já presente nos dados do jogo). Os casos ambíguos ficaram como estavam e seguem na auditoria.\n\n| Série | Ano | Mudança |\n|---|---|---|\n${linhas.join('\n')}\n\n${linhas.length} temporadas alteradas.`);
