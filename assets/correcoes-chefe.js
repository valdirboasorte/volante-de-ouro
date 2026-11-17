/* ═══════════════════════════════════════════════════════════════════
   CORREÇÕES DO MODO CHEFE (2026-11-12)
   Ficam fora dos blocos <script> do index.html para não mudar a versão do
   multiplayer; a página, os testes (testes/base.js) e o motor do servidor
   (multiplayer/ferramentas/gerar-motor.mjs) carregam este arquivo depois do jogo.

   1. Renovar o contrato de um piloto que não veio do mercado (os da equipe
      assumida, os promovidos da academia) usava p.pede, que só o mercado
      preenche: a tela de proposta mostrava NaN e a assinatura gravava salário
      NaN, que contaminava o caixa da equipe dali em diante. Agora, sem pedido,
      vale o que ele pediria no mercado (salarioPedido), com o mesmo desconto de
      quem traz patrocínio.
   2. Titular sem superlicença travava a temporada: o cartão dele só oferecia
      "Passar a reserva" quando a equipe não tinha reserva, e emprestar só existia
      na academia; a única saída era demitir (o Leclerc promovido da academia, por
      exemplo). Agora o cartão diz por que ele não pode correr e oferece passar a
      reserva sempre, ou voltar a correr na F2 pela academia para somar os pontos.
      E a academia não promove a titular quem não tem a licença.
   3. Toques demais nas corridas ao vivo do chefe: a F1 de 2018 tinha uns 14 toques
      por corrida (5 pneus furados e 9 bicos quebrados), e quase toda corrida um dos
      seus carros saía danificado. Só no modo chefe, 60% das disputas que encostariam
      passam limpas (sorteado pelo gerador da própria corrida, que o multiplayer repete).
   ═══════════════════════════════════════════════════════════════════ */
const CorrecoesChefe = (function(){
  const CORTE_TOQUE = .6;

  function garantirPedido(p){
    if(!p || Number.isFinite(p.pede) || typeof Chefe === 'undefined' || typeof C === 'undefined' || !C) return;
    let v = Chefe.salarioPedido(p, C.ano);
    if(p.aporte) v = Math.round(v * .25 / 1000) * 1000;
    p.pede = Number.isFinite(v) ? v : 0;
  }

  /* titular da F1 que não pode correr: devolve a conta da licença */
  function semLicenca(p){
    if(!p || typeof Chefe === 'undefined' || !Chefe.ehF1() || p.papel !== 'titular' || p.venceu) return null;
    const sl = Chefe.superlicenca(p);
    return sl && !sl.ok ? sl : null;
  }
  /* os botões que faltavam no cartão do titular sem superlicença (tela do mercado) */
  function cartoesSemLicenca(html){
    if(typeof C === 'undefined' || !C || !C.pilotos) return html;
    const mp = typeof UIC !== 'undefined' && UIC.emMP && UIC.emMP();
    C.pilotos.forEach(p => {
      const sl = semLicenca(p); if(!sl) return;
      const alvo = `<button class="ch-opt rd" onclick="UIC.dispensar('${p.id}')">`;
      const i = html.indexOf(alvo); if(i < 0) return;
      let extra = `<span class="mut" style="flex-basis:100%;font-size:13px;margin:0 0 4px"><b style="color:var(--gold)">Sem superlicença (${sl.total || 0} de 40 pontos):</b> não pode correr como titular na F1. Passe a reserva ou mande correr na F2 pela academia.</span>`;
      if(html.indexOf(`UIC.rebaixar('${p.id}')`) < 0) extra += `<button class="ch-opt" onclick="UIC.rebaixar('${p.id}')">Passar a reserva</button>`;
      if(!mp && Chefe.idade(p) <= 23) extra += `<button class="ch-opt" onclick="CorrecoesChefe.paraF2('${p.id}')">Correr na F2 pela academia</button>`;
      html = html.slice(0, i) + extra + html.slice(i);
    });
    return html;
  }
  /* o titular sem licença volta para a academia: corre na base, soma pontos, e o contrato segue */
  function paraF2(id){
    const p = C && C.pilotos.find(x => x.id === id); if(!p || !semLicenca(p)) return;
    p.papel = 'academia'; if(C.n1 === id) C.n1 = null;
    Chefe.noticia(p.nome + ' volta para a academia para correr na base e somar os pontos de superlicença.', '');
    if(typeof UIC !== 'undefined'){ UIC.salvar(); UIC.render(); if(UIC.mercado) UIC.mercado(); }
  }

  function instalar(){
    if(typeof Chefe === 'undefined') return false;
    ['negociar', 'assinar'].forEach(k => {
      const orig = Chefe[k];
      if(typeof orig !== 'function') return;
      Chefe[k] = function(p){ garantirPedido(p); return orig.apply(this, arguments); };
    });
    if(typeof Gp !== 'undefined' && typeof Gp.toque === 'function'){
      const toque = Gp.toque;
      Gp.toque = function(R){
        if(R && R.ent && R.ent.gestao && typeof R.rnd === 'function' && R.rnd() < CORTE_TOQUE) return;
        return toque.apply(this, arguments);
      };
    }
    if(typeof UIC === 'undefined') return true;
    if(typeof UIC.negociar === 'function'){
      const orig = UIC.negociar;
      UIC.negociar = function(ref){
        const p = typeof ref === 'number' ? (C && C.inv && C.inv.mercado || [])[ref] : (C && C.pilotos || []).find(x => x.id === ref);
        garantirPedido(p);
        return orig.apply(this, arguments);
      };
    }
    if(typeof UIC.mostrar === 'function'){
      const mostrar = UIC.mostrar;
      UIC.mostrar = function(chave, html){
        if(chave === 'mercado' && typeof html === 'string'){ try { arguments[1] = cartoesSemLicenca(html); } catch(e){ /* a tela sai como estava */ } }
        return mostrar.apply(this, arguments);
      };
    }
    if(typeof UIC.acad === 'function'){
      const acad = UIC.acad;
      UIC.acad = function(id, para){
        const p = para === 'titular' && C && C.pilotos.find(x => x.id === id);
        if(p && Chefe.ehF1()){
          const sl = Chefe.superlicenca(p);
          if(sl && !sl.ok) return UI.toast(p.nome + ' não tem superlicença (' + (sl.total || 0) + ' de 40 pontos). Pode ser reserva ou seguir na academia.');
        }
        return acad.apply(this, arguments);
      };
    }
    return true;
  }
  return { instalado: instalar(), garantirPedido, paraF2, cartoesSemLicenca, semLicenca, CORTE_TOQUE };
})();
