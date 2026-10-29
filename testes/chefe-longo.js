/* Carreiras longas de chefe (Manager 2.1, item 19): dez cenários, vários horizontes e
   mais de uma semente. Mede e procura o que é implausível; não força nenhuma
   distribuição de campeões.
   — nada quebra, nenhum número vira NaN, o save atravessa o JSON e a migração;
   — dinastia é possível, mas não infinita: nenhuma sequência de títulos sem fim;
   — o carro não fica muito acima da melhor rival por anos a fio;
   — veterano não segue no auge depois do último ano da história;
   — o mercado de funcionários tem elite às vezes, sem garantia;
   — quem tem nome recebe convite; a carreira encerrada vai para a galeria.
   Uso: node testes/chefe-longo.js [completo]   (completo: 3 sementes e 73 temporadas)
   Não modifica arquivos nem saves. */
const H = require('./base');
const COMPLETO = process.argv[2] === 'completo';
const SEMENTES = COMPLETO ? 3 : 1, MAXANOS = COMPLETO ? 73 : 40;
const HORIZONTES = [1, 5, 10, 25, 50, 73];
let falhas = 0, n = 0;
const ok = (c, m) => { n++; if(!c){ falhas++; console.log('  ✗ ' + m); } else console.log('  ✓ ' + m); };

/* as políticas de jogador, sobre o piloto automático dos testes (__inverno/__temporada) */
const POL = `
  globalThis.__pol = {
    esperto(o){
      const inv = C.inv;
      /* primeiro o que entra: os patrocínios */
      inv.patro.slice().forEach(sp => Chefe.aceitarPatro(sp));
      /* staff e pilotos: o melhor que o mercado tem */
      inv.staffMerc.slice().sort((a, b) => Chefe.nivelStaff(b) - Chefe.nivelStaff(a)).forEach(s => { const at = C.staff[s.funcao]; if(inv.tent.staff < 6 && (!at || at.venceu || Chefe.nivelStaff(at) + 2 < Chefe.nivelStaff(s))) Chefe.contratarStaff(s, o.semFreio ? 1.5 : 1.15); });
      Object.keys(C.staff).forEach(k => { const s = C.staff[k]; if(s && s.venceu && !s.aposentou) Chefe.renovarStaff(k); });
      const nota = p => Chefe.hab(p) + (o.jovens ? (25 - Chefe.idade(p)) * 1.5 : 0) + (o.veteranos ? (Chefe.idade(p) - 30) * 1.5 : 0);
      const merc = inv.mercado.slice().sort((a, b) => nota(b) - nota(a)).slice(0, 4);
      for(const p of merc){
        const tit = Chefe.titulares().filter(x => !x.venceu).sort((a, b) => nota(a) - nota(b));
        if(tit.length >= 2 && nota(tit[0]) + 2 >= nota(p)) break;
        if(inv.tent.pil >= 6) break;
        /* quem olha as finanças não contrata o que não pode pagar */
        const troca = tit.length >= 2 ? Chefe.multaDispensa(tit[0]) + (tit[0].sal || 0) * 0 : 0;
        if(!o.semFreio && C.caixa + Chefe.projecao().saldo - (p.pede || 0) - Chefe.multaRival(p) - troca < Chefe.escala(C.ano) * 10e6) continue;
        const r = Chefe.negociar(p, { sal: o.semFreio ? 1.3 : 1, anos:3, n1:false, papel:'titular' });
        if(r.ok && tit.length >= 2) Chefe.dispensar(tit[0]);
      }
      while(Chefe.titulares().filter(p => !p.venceu).length < 2 && C.inv.mercado.length) Chefe.assinar(C.inv.mercado[0], { sal:1, anos:1, n1:false, papel:'titular' }, 1);
      /* por último, o que sobra vai para o carro: o maior plano que fecha o ano no azul */
      const areas = Chefe.areasAtivas().filter(a => a !== 'futuro');
      const lvMax = o.plano != null ? o.plano : 5;
      for(let lv = lvMax; lv >= 0; lv--){ areas.forEach(a => C.plano[a] = lv); if(o.semFreio || C.caixa + Chefe.projecao().saldo > 0) break; }
      if(o.futuro && Chefe.areasAtivas().indexOf('futuro') >= 0) C.plano.futuro = o.futuro;
      ['fabrica','tunel','sim'].forEach(k => { if(C.ano >= Chefe.INSTAL[k].de && !C.obras[k] && (C.instal[k] || 0) < 5){ const c = Chefe.custoInstal(k, (C.instal[k] || 0) + 1); if(o.semFreio ? C.caixa > c * 1.3 : C.caixa + Chefe.projecao().saldo > c * 1.5) Chefe.construir(k); } });
    },
    acaso(){}
  };`;

/* os cenários: equipe, ano, política e um ajuste no começo (a equipe própria cobre os 73 anos: dono não é demitido) */
const CENARIOS = [
  { k:'pequena',      ano:1950, pos:-2, pol:'esperto' },
  { k:'media',        ano:1950, pos:4,  pol:'esperto' },
  { k:'grande',       ano:1950, pos:0,  pol:'esperto' },
  { k:'dominante',    ano:1988, pos:0,  pol:'esperto' },
  { k:'crise',        ano:1990, pos:5,  pol:'acaso', ini:'C.caixa = -30e6 * Chefe.escala(C.ano);' },
  { k:'jovens',       ano:2000, pos:3,  pol:'esperto', o:{ jovens:true } },
  { k:'veteranos',    ano:1975, pos:3,  pol:'esperto', o:{ veteranos:true } },
  { k:'staffElite',   ano:1980, pos:4,  pol:'esperto', o:{ plano:2 }, ini:"Chefe.funcoesAtivas().forEach(f => { C.staff[f] = Chefe.staffGerado(f, 93, C.ano); C.staff[f].ate = C.ano + 6; });" },
  { k:'conservador',  ano:1970, pos:3,  pol:'esperto', o:{ plano:1 } },
  { k:'agressivo',    ano:1970, pos:3,  pol:'esperto', o:{ plano:5, semFreio:true } },
  { k:'propria',      ano:1950, criar:true, pol:'esperto' }
];

const resumo = {};
const t0 = Date.now();
let maxCarreira = 0, maxSeqGeral = 0, convites = 0, elite = 0, mercados = 0, vetAuge = [], margemAlta = 0, margemN = 0, erros = 0, nan = 0, saveMax = 0;
for(const cen of CENARIOS){
  resumo[cen.k] = { tit:0, temp:0, seq:0, horiz:{}, fal:0, dem:0 };
  for(let sem = 1; sem <= SEMENTES; sem++){
    const J = H.carregar({ silencioso:true, seed: 700 + sem * 31 + cen.ano });
    J.run(require('./chefe-comum'));
    J.run(POL);
    J.run(`(() => { const l = eraOfSeries(${cen.ano}, 'f1').teams.map((t, i) => [i, Engine.resolveTeam(t, i, ${cen.ano}, 'f1')]).filter(x => x[1]).sort((a, b) => b[1].str - a[1].str);
      const i = ${cen.pos} < 0 ? Math.max(0, l.length + ${cen.pos}) : Math.min(l.length - 1, ${cen.pos});
      if(${!!cen.criar}) Chefe.novo({ chefe:{ nome:'Longo', cc:'BR' }, realismo:true, modo:'criar', sk:'f1', ano:${cen.ano}, eq:{ nome:'Própria', cor:'#123456', cc:'BR' } });
      else Chefe.novo({ chefe:{ nome:'Longo', cc:'BR' }, realismo:true, modo:'assumir', sk:'f1', ano:${cen.ano}, idx:l[i][0] }); ${cen.ini || ''} })()`);
    const anos = Math.min(MAXANOS, 2026 - cen.ano);
    let seq = 0, tit = 0, jogadas = 0;
    for(let a = 0; a < anos; a++){
      try {
        J.run(`__inverno(); __pol.${cen.pol}(${JSON.stringify(cen.o || {})});`);
        const r = JSON.parse(J.run(`(() => { const inv = C.inv; const merc = (inv.staffMerc || []).map(s => Chefe.nivelStaff(s));
          const x = __temporada(); const h = C.hist[C.hist.length - 1] || {};
          const top = Math.max(...Chefe.equipesIA(C.ano).map(t => t.str));
          const vet = Chefe.titulares().filter(p => p.real && Chefe.idade(p) >= 42 && (ativoDe('f1')[p.nome] || [0, 9999])[1] < C.ano).map(p => [p.nome, Chefe.idade(p), Chefe.hab(p)]);
          return JSON.stringify({ ano: x.ano, tit: h.pos === 1 && !h.excluida, forca: Chefe.forca(), top, merc, conv: (inv.convites || []).length, vet,
            caixa: C.caixa, rep: C.rep, car: C.carro, fal: !!x.b.falencia, dem: !!(x.b.aval && x.b.aval.demitido) }); })()`));
        if(![r.caixa, r.rep, r.forca, r.car.aero, r.car.chassi, r.car.motor].every(Number.isFinite)) nan++;
        jogadas++; tit += r.tit ? 1 : 0; seq = r.tit ? seq + 1 : 0; maxSeqGeral = Math.max(maxSeqGeral, seq); resumo[cen.k].seq = Math.max(resumo[cen.k].seq, seq);
        if(r.forca - r.top > 4) margemAlta++; margemN++;
        mercados++; if(r.merc.some(v => v >= 85)) elite++;
        convites += r.conv; vetAuge = vetAuge.concat(r.vet.filter(v => v[2] >= 90));
        /* como no jogo (UIC.falencia): na equipe assumida o dono socorre (Chefe.socorroDono),
           sem dono um investidor resgata. Demitido, a carreira acaba ali: o teste não aceita
           outro emprego */
        if(r.fal){
          resumo[cen.k].fal++;
          J.run(`(() => { const f = C.balanco && C.balanco.falencia; if(!f) return;
            if(C.modo === 'assumir' && C.dir && C.dir.dono !== 'conselho') Chefe.socorroDono(); else Chefe.resgatar(); })()`);
        }
        if(J.run('!!C.vendida')) break;
        /* demitido: como um jogador faria, aceita a primeira proposta e segue a carreira; sem proposta, acaba */
        if(J.run('!!(C.balanco && C.balanco.aval && C.balanco.aval.demitido)')){
          resumo[cen.k].dem++;
          if(!J.run(`(() => { const p = Chefe.propostasEmprego(); if(!p.length) return false; Chefe.assumirOutra(p[0]); UI.limparFila(); UI.close(); return true; })()`)) break;
        } else J.run('Chefe.proximoAno(); UI.limparFila(); UI.close();');
        const h = a + 1;
        if(HORIZONTES.indexOf(h) >= 0) resumo[cen.k].horiz[h] = (resumo[cen.k].horiz[h] || 0) + tit;
      } catch(e){ erros++; console.log('  ERRO', cen.k, J.run('C && C.ano'), e.message); break; }
    }
    /* o save atravessa o JSON e a migração; a carreira encerrada vai para a galeria */
    const sv = J.run(`(() => { const txt = JSON.stringify(C); const c = JSON.parse(txt); Chefe.migrar(c); return JSON.stringify({ tam: txt.length, v: c.v, hist: c.hist.length }); })()`);
    const s = JSON.parse(sv); saveMax = Math.max(saveMax, s.tam);
    if(cen.k === 'media' && sem === 1){
      J.run(`if(C.fase === 'balanco') UIC.fimCarreira('demitido'); else { __inverno(); UIC.fimCarreira('aposentou'); } UI.limparFila(); UI.close();`);
      const g = JSON.parse(J.store.vdo_chefe_hall || '[]');
      ok(g.length === 1 && g[0].anos === s.hist && g[0].tit === tit, `carreira de ${s.hist} temporadas encerrada e gravada na galeria (${g[0] && g[0].tit} títulos)`);
    }
    resumo[cen.k].tit += tit; resumo[cen.k].temp += jogadas; maxCarreira = Math.max(maxCarreira, jogadas);
  }
}
console.log('\n  cenário        títulos/temporadas  maior sequência  títulos em 1/5/10/25/50/73 anos');
for(const k in resumo){ const r = resumo[k];
  console.log(`  ${k.padEnd(14)} ${String(r.tit).padStart(3)}/${String(r.temp).padEnd(14)} ${String(r.seq).padStart(3)}              ${String(r.fal).padStart(3)}        ${String(r.dem).padStart(3)}      ${HORIZONTES.map(h => r.horiz[h] != null ? r.horiz[h] : '–').join(' / ')}`); }
console.log('');
ok(!erros && !nan, `${CENARIOS.length * SEMENTES} carreiras sem erro e sem número inválido`);
ok(maxCarreira >= (COMPLETO ? 50 : 40), `a carreira mais longa durou ${maxCarreira} temporadas: os horizontes longos foram cobertos`);
/* o relato era de cerca de 50 títulos seguidos; o recorde real da F1 é 8. O melhor jogador, com a
   melhor equipe, ainda pode emendar uma dinastia longa, mas não uma carreira inteira */
ok(maxSeqGeral <= 16, `a maior sequência de títulos foi ${maxSeqGeral}: dinastia possível, mas não infinita`);
ok(margemAlta / margemN < .15, `o carro ficou mais de 4 pontos acima da melhor rival em ${(margemAlta / margemN * 100).toFixed(1)}% das temporadas`);
ok(vetAuge.length === 0, `nenhum veterano de 42+ no auge (90+) depois da história${vetAuge.length ? ': ' + vetAuge.slice(0, 3).map(v => v.join(' ')).join(', ') : ''}`);
ok(elite / mercados > .1 && elite / mercados < .9, `funcionário de elite (85+) no mercado em ${(elite / mercados * 100).toFixed(0)}% dos invernos: aparece, sem garantia`);
ok(convites > 0 && convites < margemN * .5, `${convites} convites em ${margemN} invernos: quem tem nome é chamado, sem que seja todo ano`);
ok(saveMax < 3e6, `o maior save de chefe tem ${(saveMax / 1e6).toFixed(2)} MB`);
ok(resumo.pequena.tit <= resumo.grande.tit + resumo.dominante.tit, 'a equipe pequena não ganha mais que as grandes: o tamanho ainda pesa');
/* investir sem freio tem preço: quebra o caixa mais vezes do que o conservador */
ok(resumo.agressivo.fal + resumo.agressivo.dem > resumo.conservador.fal + resumo.conservador.dem, `gastar sem olhar o caixa cobra: ${resumo.agressivo.fal} falências e ${resumo.agressivo.dem} demissões (${resumo.agressivo.temp} temporadas jogadas), contra ${resumo.conservador.fal} e ${resumo.conservador.dem} do conservador (${resumo.conservador.temp})`);
console.log(`  (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
console.log(falhas ? `\n${falhas} de ${n} verificações falharam` : `\ncarreiras longas do chefe: ${n} verificações, tudo certo`);
process.exit(falhas ? 1 : 0);
