/* ══════════════════════════════════════════════════════════════════
   O QUE NÃO É INSCRITO NEM EQUIPE
   As tabelas da Wikipedia têm linhas que não são gente: o rodapé
   ("Sources:", "Source:", "Reference:"), a legenda ("Under caution"), o
   título de um bloco ("Guest drivers ineligible to score points",
   "Am class", "GT4") e o cabeçalho repetido no meio ("Driver" / "Team").
   Essas linhas ocupam a tabela inteira, então o leitor as lia como um
   inscrito cuja equipe, carro e número eram o mesmo texto. Há também
   tabelas da NASCAR com uma coluna a mais, em que o número do carro caía
   na coluna da equipe e o chefe de equipe na do piloto.

   Aqui ficam as duas regras, usadas pelo gerador (gerar.mjs) e pela
   limpeza do banco já gerado (limpar-banco.mjs):
     naoEPiloto(nome)         a linha inteira sai
     equipeDesconhecida(eq)   o piloto fica, sem equipe (o jogo lê eq: null)
   Nada é adivinhado no lugar: o que a tabela não diz fica vazio.
   O piloto de verdade com um marcador grudado no nome ("Jay Fogleman 1",
   "Dana Patten (R)", "Nicola Zonzini J") não é nota: nomeLimpo() tira o
   marcador e ele continua sendo a mesma pessoa. equipeLimpa() faz o mesmo
   com a conta de corridas nas equipes da NASCAR ("Brewco Motorsports 34").
   ══════════════════════════════════════════════════════════════════ */

/* o "nome" é uma nota da tabela, não uma pessoa */
const NOTA_PILOTO = [
  /:$/,                                   /* Sources: · Source: · Reference: */
  /^(?:sources?|references?)$/i,
  /\b(?:in|un)?el[ie]gible\b/i,           /* … ineligible to score points (e "inelegible") */
  /\bdrivers\b|\bentries\b/i,             /* Guest drivers · Unregistered drivers · Formula Nordic entries */
  /^drivers?$/i,                          /* o cabeçalho repetido */
  /\bdid not\b/i,                         /* Did Not Participate · … who did not race */
  /\bunder caution\b/i,
  /\bno qualifying\b/i,
  /\bno team name\b/i,
  /^etc\.?$/i,
  /^\?+$/,
  /^[—–-]?\s*n\/a$/i,
  /^tb[acd](?: \d+)?$/i,                  /* TBA · "TBA 3" */
  /^(?:unknown|none)$/i,
  /^\d+$/,                                /* só o número do carro */
  /^\d+\s/,                               /* "1 Post entry, driver and owner did not score points." */
  /\s\d+\s.*\s\d+$/,                      /* várias pessoas, cada uma com a conta de corridas: "Joe Garone 20 Jerry Baxter 11" */
  /^(?:formula|class) [a-z0-9]+$/i,       /* Formula 4 · Class 2 · Class B: o título do bloco */
  /\bclass \(|\(best \w+ results\)/i,     /* Production Class (BTC-P) · Expert (best ten results) */
  /^fastest lap\b/i,                      /* Fastest Lap: Kory Enders (1:47.688) */
  /^chase for the\b|\bseries chase$|\bplayoffs$/i,   /* a linha que separa os classificados para o playoff */
  /\b(?:class|trophy)$/i,                 /* Am class · Pro-Am class · F4 Trophy */
  /^GT[A-Z0-9]?$/,                        /* GT4 · GTO: o título da classe */
  /\bGT[1-4]$|\bLMS$/                     /* um carro na coluna do piloto: "BMW Z4 GT3", "Audi R8 LMS" */
];

/* a "equipe" é um marcador de quem não tinha equipe conhecida, ou uma nota */
const NOTA_EQUIPE = [
  /:$/,
  /^(?:sources?|references?)$/i,
  /\b(?:in|un)?el[ie]gible\b/i,
  /\bround-only drivers\b|^guest drivers\b/i,
  /\bdid not\b/i,
  /\bunder caution\b/i,
  /\bno team name\b/i,
  /^etc\.?$/i,
  /^\?+$/,
  /^[—–-]+$/,
  /^[—–-]?\s*n\/a$/i,
  /^tb[acd]$/i,
  /^none$/i,
  /^unknown(?: teams?)?$/i,
  /^private(?:ers?| entry| entries| entrants?)?$/i,
  /^(?:drivers?|teams?|entrants?)$/i,     /* o cabeçalho repetido */
  /\bclass$/i,
  /^GT[A-Z0-9]?$/,
  /^\d+$/                                 /* o número do carro na coluna da equipe */
];

const limpo = s => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();

export function naoEPiloto(nome){
  const n = limpo(nome);
  return !n || NOTA_PILOTO.some(re => re.test(n));
}

export function equipeDesconhecida(eq){
  const e = limpo(eq);
  return !!e && NOTA_EQUIPE.some(re => re.test(e));
}

/* a linha lida não é um inscrito: nota no lugar do piloto, ou colunas
   deslocadas (o número do carro na coluna da equipe põe o chefe de equipe
   na coluna do piloto) */
export function linhaInvalida(x){
  return naoEPiloto(x && x.nome) || /^\d+$/.test(limpo(x && x.eq));
}

/* O nome sem os marcadores que as tabelas grudam nele:
     "(R)" "(G)" "(N)" "(E)" "(S)" "(F5)"   estreante, convidado, a classe
     " R" " J" " G" " M"                     o mesmo, sem parênteses
     " 1" … " 36"                            quantas corridas fez (NASCAR, ARCA)
     "Rochat1"                               a chamada de uma nota de rodapé
   Só vale para quem já passou por naoEPiloto(): "TBA 3" e "Class B" são notas. */
export function nomeLimpo(nome){
  let n = limpo(nome), antes;
  do {
    antes = n;
    n = n.replace(/\s*\([A-Z]\d?\)$/, '')
      .replace(/^(\S+ \S.*?)\s+[RJGM]$/, '$1')
      .replace(/^(\S+ \S.*?)\s+\d{1,2}$/, '$1')
      .replace(/([a-zà-ÿ.])\d+$/, '$1')
      .trim();
  } while(n && n !== antes);
  return n || limpo(nome);
}

/* Nas tabelas da NASCAR, da ARCA e dos Supercars a célula da equipe traz
   quantas corridas o piloto fez por cada uma ("Brewco Motorsports 34 /
   Michael Waltrip Racing 1"). O banco guarda uma equipe por piloto: quando
   todas as partes têm a conta, fica a de mais corridas; senão, só a conta
   sai. "Team 34" e "Channel 7" são nomes: o que sobraria seria uma palavra. */
const COM_CONTA = /^(?:nascar_|arca$|supercars$)/;
export function equipeLimpa(eq, camp){
  const e = limpo(eq);
  if(!e || !COM_CONTA.test(String(camp || ''))) return e;
  const partes = e.split(' / ').map(p => { const m = p.match(/^(\S+ \S.*?) (\d{1,2})$/); return m ? { n: m[1], k: +m[2] } : { n: p, k: null }; });
  if(partes.every(p => p.k == null)) return e;
  if(partes.every(p => p.k != null)) return partes.reduce((a, p) => p.k > a.k ? p : a).n;
  return partes.map(p => p.n).filter((p, i, l) => l.indexOf(p) === i).join(' / ');
}
