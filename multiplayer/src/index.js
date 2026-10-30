/* O Worker do multiplayer. Só encaminha: as salas vivem cada uma no seu Durable
   Object (src/sala.js), que guarda o estado oficial e fala com os jogadores por
   WebSocket. A rota /__viabilidade mede o motor do jogo dentro do workerd e só
   existe no desenvolvimento (VIABILIDADE = "1" no wrangler.jsonc). */
import { rotasSalas } from './rotas-salas.js';
import { viabilidade } from './viabilidade.js';
export { Sala } from './sala.js';

export default {
  async fetch(request, env){
    const url = new URL(request.url);
    if(url.pathname.startsWith('/api/salas')) return rotasSalas(request, env, url);
    if(url.pathname === '/__viabilidade' && env.VIABILIDADE === '1'){
      const seed = Number(url.searchParams.get('seed')) || 7;
      const t0 = Date.now();
      const r = await viabilidade(seed);
      return Response.json(Object.assign(r, { msParede: Date.now() - t0 }));
    }
    return new Response('não encontrado', { status: 404 });
  }
};
