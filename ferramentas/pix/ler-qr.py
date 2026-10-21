"""Lê um QR Code limpo (gerado por computador, sem perspectiva) e devolve o texto.
Sem bibliotecas além do PIL. Uso: python qrler.py imagem.png"""
import sys
from PIL import Image

img = Image.open(sys.argv[1]).convert('L')
W, H = img.size
px = img.load()
esc = lambda x, y: px[x, y] < 128

# a área do código: o primeiro e o último pixel escuro
xs = [x for x in range(W) if any(esc(x, y) for y in range(0, H, 2))]
ys = [y for y in range(H) if any(esc(x, y) for x in range(0, W, 2))]
x0, x1, y0, y1 = xs[0], xs[-1], ys[0], ys[-1]
# módulo: largura do padrão de localização (7 módulos) na primeira linha escura
y = y0 + 2
run = 0
while esc(x0 + run, y): run += 1
mod = run / 7.0
N = round((x1 - x0 + 1) / mod)
mod = (x1 - x0 + 1) / N
V = (N - 17) // 4
assert (N - 17) % 4 == 0, ('tamanho estranho', N)
M = [[1 if esc(int(x0 + (c + .5) * mod), int(y0 + (r + .5) * mod)) else 0 for c in range(N)] for r in range(N)]

# informação de formato (em volta do localizador de cima à esquerda)
coords = [(8, 0), (8, 1), (8, 2), (8, 3), (8, 4), (8, 5), (8, 7), (8, 8), (7, 8), (5, 8), (4, 8), (3, 8), (2, 8), (1, 8), (0, 8)]
bits = [M[r][c] for (r, c) in coords]
fmt = int(''.join(map(str, bits)), 2)
def bch(d):
    g = 0b10100110111
    v = d << 10
    for i in range(14, 9, -1):
        if v & (1 << i): v ^= g << (i - 10)
    return ((d << 10) | v) ^ 0b101010000010010
melhor = min(range(32), key=lambda d: bin(bch(d) ^ fmt).count('1'))
nivel = {1: 'L', 0: 'M', 3: 'Q', 2: 'H'}[melhor >> 3]
mascara = melhor & 7

# o que não é dado
ALINH = {2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30], 6: [6, 34], 7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 46], 10: [6, 28, 50],
         11: [6, 30, 54], 12: [6, 32, 58], 13: [6, 34, 62], 14: [6, 26, 46, 66]}
F = [[False] * N for _ in range(N)]
def area(r0, c0, h, w):
    for r in range(r0, r0 + h):
        for c in range(c0, c0 + w):
            if 0 <= r < N and 0 <= c < N: F[r][c] = True
area(0, 0, 9, 9); area(0, N - 8, 9, 8); area(N - 8, 0, 8, 9)
for i in range(N): F[6][i] = True; F[i][6] = True
for r in ALINH.get(V, []):
    for c in ALINH.get(V, []):
        if (r < 9 and c < 9) or (r < 9 and c > N - 10) or (r > N - 10 and c < 9): continue
        area(r - 2, c - 2, 5, 5)
if V >= 7: area(0, N - 11, 6, 3); area(N - 11, 0, 3, 6)
F[N - 8][8] = True

MASK = [lambda r, c: (r + c) % 2 == 0, lambda r, c: r % 2 == 0, lambda r, c: c % 3 == 0, lambda r, c: (r + c) % 3 == 0,
        lambda r, c: (r // 2 + c // 3) % 2 == 0, lambda r, c: (r * c) % 2 + (r * c) % 3 == 0,
        lambda r, c: ((r * c) % 2 + (r * c) % 3) % 2 == 0, lambda r, c: ((r + c) % 2 + (r * c) % 3) % 2 == 0]
dados = []
c = N - 1
subindo = True
while c > 0:
    if c == 6: c -= 1
    linhas = range(N - 1, -1, -1) if subindo else range(N)
    for r in linhas:
        for cc in (c, c - 1):
            if not F[r][cc]:
                dados.append(M[r][cc] ^ (1 if MASK[mascara](r, cc) else 0))
    subindo = not subindo
    c -= 2
cw = [int(''.join(map(str, dados[i:i + 8])), 2) for i in range(0, len(dados) - 7, 8)]

# blocos: [ec por bloco, (n blocos, dados por bloco), ...]
TAB = {
 (1,'L'):(7,[(1,19)]),(1,'M'):(10,[(1,16)]),(1,'Q'):(13,[(1,13)]),(1,'H'):(17,[(1,9)]),
 (2,'L'):(10,[(1,34)]),(2,'M'):(16,[(1,28)]),(2,'Q'):(22,[(1,22)]),(2,'H'):(28,[(1,16)]),
 (3,'L'):(15,[(1,55)]),(3,'M'):(26,[(1,44)]),(3,'Q'):(18,[(2,17)]),(3,'H'):(22,[(2,13)]),
 (4,'L'):(20,[(1,80)]),(4,'M'):(18,[(2,32)]),(4,'Q'):(26,[(2,24)]),(4,'H'):(16,[(4,9)]),
 (5,'L'):(26,[(1,108)]),(5,'M'):(24,[(2,43)]),(5,'Q'):(18,[(2,15),(2,16)]),(5,'H'):(22,[(2,11),(2,12)]),
 (6,'L'):(18,[(2,68)]),(6,'M'):(16,[(4,27)]),(6,'Q'):(24,[(4,19)]),(6,'H'):(28,[(4,15)]),
 (7,'L'):(20,[(2,78)]),(7,'M'):(18,[(4,31)]),(7,'Q'):(18,[(2,14),(4,15)]),(7,'H'):(26,[(4,13),(1,14)]),
 (8,'L'):(24,[(2,97)]),(8,'M'):(22,[(2,38),(2,39)]),(8,'Q'):(22,[(4,18),(2,19)]),(8,'H'):(26,[(4,14),(2,15)]),
 (9,'L'):(30,[(2,116)]),(9,'M'):(22,[(3,36),(2,37)]),(9,'Q'):(20,[(4,16),(4,17)]),(9,'H'):(24,[(4,12),(4,13)]),
 (10,'L'):(18,[(2,68),(2,69)]),(10,'M'):(26,[(4,43),(1,44)]),(10,'Q'):(24,[(6,19),(2,20)]),(10,'H'):(28,[(6,15),(2,16)]),
 (11,'L'):(20,[(4,81)]),(11,'M'):(30,[(1,50),(4,51)]),(11,'Q'):(28,[(4,22),(4,23)]),(11,'H'):(24,[(3,12),(8,13)]),
 (12,'L'):(24,[(2,92),(2,93)]),(12,'M'):(22,[(6,36),(2,37)]),(12,'Q'):(26,[(4,20),(6,21)]),(12,'H'):(28,[(7,14),(4,15)]),
 (13,'L'):(26,[(4,107)]),(13,'M'):(22,[(8,37),(1,38)]),(13,'Q'):(24,[(8,20),(4,21)]),(13,'H'):(22,[(12,11),(4,12)]),
 (14,'L'):(30,[(3,115),(1,116)]),(14,'M'):(24,[(4,40),(5,41)]),(14,'Q'):(20,[(11,16),(5,17)]),(14,'H'):(24,[(11,12),(5,13)]),
}
ec, grupos = TAB[(V, nivel)]
tam = [d for (n, d) in grupos for _ in range(n)]
blocos = [[] for _ in tam]
i = 0
for k in range(max(tam)):
    for b, t in enumerate(tam):
        if k < t: blocos[b].append(cw[i]); i += 1
seq = [x for b in blocos for x in b]
bs = ''.join(format(x, '08b') for x in seq)
ALNUM = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:'
grande = V >= 10
p = 0; partes = []
while p + 4 <= len(bs):
    modo = int(bs[p:p + 4], 2); p += 4
    if modo == 0: break
    if modo == 1:
        nb = 12 if grande else 10; n = int(bs[p:p + nb], 2); p += nb; t = ''
        while n >= 3: t += '%03d' % int(bs[p:p + 10], 2); p += 10; n -= 3
        if n == 2: t += '%02d' % int(bs[p:p + 7], 2); p += 7
        elif n == 1: t += '%d' % int(bs[p:p + 4], 2); p += 4
        partes.append(t)
    elif modo == 2:
        nb = 11 if grande else 9; n = int(bs[p:p + nb], 2); p += nb; t = ''
        while n >= 2: v = int(bs[p:p + 11], 2); p += 11; n -= 2; t += ALNUM[v // 45] + ALNUM[v % 45]
        if n == 1: t += ALNUM[int(bs[p:p + 6], 2)]; p += 6
        partes.append(t)
    elif modo == 4:
        nb = 16 if grande else 8; n = int(bs[p:p + nb], 2); p += nb
        partes.append(bytes(int(bs[p + 8 * k:p + 8 * k + 8], 2) for k in range(n)).decode('utf-8')); p += 8 * n
    else:
        raise SystemExit('modo nao suportado: %d' % modo)
texto = ''.join(partes)
print(f'versao {V} nivel {nivel} mascara {mascara}', file=sys.stderr)
print(texto)
