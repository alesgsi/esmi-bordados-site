#!/usr/bin/env python3
"""Genera favicons e imagen para redes (Open Graph / Twitter) desde el logo."""
import os
from PIL import Image, ImageOps, ImageDraw, ImageFont

os.makedirs("images/brand", exist_ok=True)
BG = (247, 244, 239)
logo = Image.open("images/logo.png").convert("RGBA")

def light_logo(src):
    """Versión del logo para fondos oscuros: el texto negro pasa a blanco roto,
    el rojo de marca se mantiene."""
    out = src.copy()
    px = out.load()
    for y in range(out.height):
        for x in range(out.width):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            mx, mn = max(r, g, b), min(r, g, b)
            if mx - mn < 46 and mx < 150:          # gris/negro, no el rojo
                v = 245 - int(mx * 0.16)
                px[x, y] = (v, v - 3, v - 6, a)
    return out

def on_bg(size, pad_ratio, bg):
    canvas = Image.new("RGBA", (size, size), bg)
    inner = round(size * (1 - pad_ratio * 2))
    l = ImageOps.contain(logo, (inner, inner), Image.LANCZOS)
    canvas.paste(l, ((size - l.width) // 2, (size - l.height) // 2), l)
    return canvas.convert("RGB")

# Favicon multi-resolución
ico = [on_bg(s, 0.06, BG) for s in (16, 32, 48)]
ico[0].save("images/brand/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)],
            append_images=ico[1:])
on_bg(32, 0.06, BG).save("images/brand/favicon-32.png", optimize=True)
on_bg(180, 0.10, BG).save("images/brand/apple-touch-icon.png", optimize=True)
on_bg(192, 0.08, BG).save("images/brand/icon-192.png", optimize=True)
on_bg(512, 0.08, BG).save("images/brand/icon-512.png", optimize=True)

# Open Graph 1200x630: foto del taller + degradado + logo y titular
FONT_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_R = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

photo = ImageOps.exif_transpose(Image.open("images/taller1.JPG")).convert("RGB")
og = ImageOps.fit(photo, (1200, 630), Image.LANCZOS, centering=(0.5, 0.5))

# Panel oscuro a la izquierda: casi opaco donde va el texto y difuminado al centro
grad = Image.new("L", (1200, 1))
HOLD, FADE = 560, 420
for x in range(1200):
    if x <= HOLD:
        a = 0.90
    else:
        t = min(1.0, (x - HOLD) / FADE)
        a = 0.90 - 0.68 * (t * t * (3 - 2 * t))
    grad.putpixel((x, 0), int(round(a * 255)))
grad = grad.resize((1200, 630))
shade = Image.new("RGB", (1200, 630), (13, 12, 12))
og = Image.composite(shade, og, grad)

logo_light = light_logo(logo)
logo_light.save("images/brand/logo-light.png", optimize=True)
mark = ImageOps.contain(logo_light, (300, 300), Image.LANCZOS)
og.paste(mark, (72, 66), mark)

d = ImageDraw.Draw(og)
d.text((72, 330), "Bordados industriales", font=ImageFont.truetype(FONT_B, 30),
       fill=(255, 138, 128))
d.text((72, 384), "para uniformes y marcas", font=ImageFont.truetype(FONT_B, 54),
       fill=(255, 255, 255))
d.text((72, 452), "Bordado y DTF con terminación profesional",
       font=ImageFont.truetype(FONT_R, 30), fill=(226, 220, 214))
d.rectangle([72, 528, 232, 534], fill=(217, 37, 28))

og.save("images/brand/og-image.jpg", "JPEG", quality=84, optimize=True, progressive=True)
print("Listo:", ", ".join(sorted(os.listdir("images/brand"))))
