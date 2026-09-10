# ESMI Bordados — sitio web

Sitio estático de una sola página (HTML, CSS y JavaScript sin dependencias),
publicado en GitHub Pages sobre `https://alesgsi.github.io/esmi-bordados-site/`.

## Estructura

```
index.html          Página completa, con metadatos SEO y JSON-LD
styles.css          Hoja de estilos única, organizada en 8 bloques
scripts.js          Menú, revelado por scroll, nav activa y lightbox
robots.txt          Permite el rastreo y apunta al sitemap
sitemap.xml         Una URL, con las imágenes principales declaradas
site.webmanifest    Iconos y datos para instalar la página
images/             Fotos originales (12 MP, sin tocar: son los másters)
images/opt/         Derivados web que consume la página
images/brand/       Favicons, logo claro e imagen para redes
tools/              Scripts que generan lo que hay en opt/ y brand/
```

## Imágenes

La página **nunca** referencia `images/*.JPG` directamente: esos archivos pesan
entre 2 y 5 MB cada uno. Se usan los derivados de `images/opt/`, generados en
cuatro anchos (400, 640, 900 y 1440 px) y servidos con `srcset` + `sizes` para
que cada dispositivo baje solo la medida que necesita.

Al agregar o reemplazar una foto:

```bash
python3 tools/optimize-images.py
```

El script reduce con BOX y aplica un filtro de mediana antes de comprimir. Son
fotos de celular con bastante ruido de sensor, y ese ruido es lo que más pesa al
comprimir: el filtro baja el archivo casi a la mitad sin perder definición de
puntada. El logo y otros gráficos con transparencia se procesan con LANCZOS y
calidad alta, sin filtrar.

Para regenerar favicons, el logo en versión clara y la imagen de redes:

```bash
python3 tools/make-brand-assets.py
```

## Al cambiar de dominio

La URL aparece en cuatro lugares y hay que actualizarla en todos:

1. `index.html` — `<link rel="canonical">`, las etiquetas `og:` y `twitter:`,
   y los campos `url`/`@id`/`image` del JSON-LD.
2. `robots.txt` — la línea `Sitemap:`.
3. `sitemap.xml` — el `<loc>` y cada `<image:loc>`.
4. `README.md` — esta misma sección.

## Datos de contacto

El teléfono publicado es **(0982) 394 506** (`+595982394506` en formato
internacional). Aparece en tres lugares y hay que mantenerlos sincronizados:

- `index.html` — campos `telephone` y `contactPoint` del JSON-LD
- `index.html` — lista `.contact-details` de la sección de contacto
- `index.html` — bloque `.footer-contact` del pie de página

El WhatsApp apunta a `https://wa.link/93fo85`.

**Ojo:** la foto del hero (`closerbackpack`) muestra bordado otro número,
`(0981) 657-297`. Si ya no está vigente conviene reemplazar esa foto, porque es
lo primero que ve quien entra.

### Pendiente: dirección y horarios

Todavía no se publican porque no había datos. Google los usa para armar el panel
de negocio local, así que suman bastante en búsquedas del tipo "bordados cerca
de mí". Para agregarlos hacen falta dos cosas:

1. En el JSON-LD, completar `PostalAddress` con `streetAddress` y
   `addressLocality`, y sumar un bloque `openingHoursSpecification`.
2. En la sección de contacto y en el pie, agregar las filas correspondientes.

Mientras tanto el schema declara `addressCountry: "PY"` y `areaServed:
Paraguay`, que es correcto aunque menos específico.

## Desarrollo

```bash
python3 -m http.server 4173
```
