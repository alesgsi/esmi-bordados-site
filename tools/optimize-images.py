#!/usr/bin/env python3
"""Genera los derivados web de las fotos de ESMI Bordados.

Las fotos originales son tomas de celular a 12 MP con bastante ruido de sensor,
que es lo que más pesa al comprimir. El pipeline reduce con BOX (que promedia y
por lo tanto ya atenúa ruido) y aplica un filtro de mediana: baja el peso a casi
la mitad sin perder definición de puntada. Los gráficos (logo) no se filtran.

Uso:  python3 tools/optimize-images.py
Salida: images/opt/<nombre>-<ancho>.webp
"""
import os
from PIL import Image, ImageOps, ImageFilter

SRC = "images"
OUT = os.path.join(SRC, "opt")
WIDTHS = [400, 640, 900, 1440]
# El logo se muestra chico: no necesita las medidas grandes de las fotos.
WIDTHS_GRAPHIC = [240, 400, 640]
WEBP_Q = 68

os.makedirs(OUT, exist_ok=True)

def is_graphic(im):
    return im.mode in ("RGBA", "LA", "P")

def resize(im, w, graphic):
    h = round(im.size[1] * w / im.size[0])
    if graphic:
        return im.resize((w, h), Image.LANCZOS)
    return im.resize((w, h), Image.BOX).filter(ImageFilter.MedianFilter(3))

total_in = total_out = 0
rows = []

for fname in sorted(os.listdir(SRC)):
    path = os.path.join(SRC, fname)
    if not os.path.isfile(path) or not fname.lower().endswith((".jpg", ".jpeg", ".png")):
        continue
    base = os.path.splitext(fname)[0].lower()
    im = ImageOps.exif_transpose(Image.open(path))
    graphic = is_graphic(im)
    if not graphic:
        im = im.convert("RGB")
    w0, h0 = im.size
    total_in += os.path.getsize(path)
    made = 0

    for w in (WIDTHS_GRAPHIC if graphic else WIDTHS):
        if w > w0:
            continue
        rs = resize(im, w, graphic)
        wp = os.path.join(OUT, f"{base}-{w}.webp")
        rs.save(wp, "WEBP", quality=90 if graphic else WEBP_Q, method=6)
        made += os.path.getsize(wp)

    total_out += made
    rows.append((base, w0, h0, os.path.getsize(path), made))

for base, w, h, a, b in rows:
    print(f"  {base:22} {w}x{h}  {a/1e6:5.1f}MB -> {b/1e6:5.2f}MB (todas las medidas)")
print(f"\nOriginales: {total_in/1e6:.0f} MB   Derivados: {total_out/1e6:.0f} MB")
