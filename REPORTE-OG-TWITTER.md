# Reporte: Auditoría y corrección Open Graph & Twitter Cards

Fecha: 26 de mayo de 2026
Repositorio: CraneoAi/xalisco-trips (branch main)

## Resumen ejecutivo
- Objetivo: Alinear `og:*` y `twitter:*` con `<title>` y `meta description`, normalizar `og:url` canónica (sin .html), asegurar `twitter:card=summary_large_image`, y aplicar `og:locale` según idioma.
- Acciones realizadas: se aplicaron parches automáticos a meta tags en múltiples archivos HTML; se realizaron commits y push a `main`.

## Commit reciente
- Hash y mensaje: 7d83505 - fix: Open Graph y Twitter Cards alineados con SEO
- Archivos modificados en el commit:
  - mazamitla.html
  - tequila-en.html
  - tequila.html
  - tlaquepaque-en.html
  - tlaquepaque.html
  - tonala-tlaquepaque-en.html

## Archivos detectados con `twitter:card`
(estas páginas ya contienen `twitter:card: summary_large_image`)

- airport-transfer.html
- airport-transfer-en.html
- chapala-tonala-en.html
- chapala-tonala.html
- gracias.html
- guachimontones.html
- foodie-tour.html
- guachimontones-en.html
- foodie-tour-en.html
- blog/index.html
- index.html
- index-en.html
- blog/excursiones-desde-guadalajara/index.html
- mazamitla-en.html
- mazamitla.html
- tequila-guachimontones.html
- tequila-guachimontones-en.html
- tequila-en.html
- en/blog/index.html
- tequila.html
- tlaquepaque-en.html
- en/blog/best-day-trips-from-guadalajara/index.html
- tlaquepaque.html
- tonala-tlaquepaque-en.html
- tonala-tlaquepaque.html
- world-cup-2026-guadalajara-tours.html
- world-cup-2026-guadalajara-tours-es.html

> Nota: la lista incluye archivos que ya tenían `twitter:card` y archivos a los que se les añadieron las etiquetas durante la sesión.

## Reglas verificadas y cobertura
- `og:title` == `<title>`: verificado y sincronizado en los archivos modificados.
- `og:description` == `meta name="description"`: verificado y sincronizado en los archivos modificados.
- `og:url`: normalizado a la forma canónica sin `.html` cuando fue necesario (ej. `https://xaliscotrips.lat/mazamitla`).
- `og:image`: apuntan a imágenes en `img/` o URL absoluta; no se reemplazaron imágenes salvo confirmación de existencia mínima (se preservó el valor original).
- `og:type`: `website` para páginas generales y `article` para entradas de blog (las páginas de `blog/` ya usan `article` cuando aplica).
- `og:locale`: `es_MX` para páginas en español; `en_US` para páginas en inglés.
- `twitter:card`: establecido a `summary_large_image` en todas las páginas auditadas.
- `twitter:title`, `twitter:description`, `twitter:image`: añadidos o ajustados para coincidir con `og:*` cuando faltaban.

## Acciones pendientes (sugeridas)
- Completar auditoría de todos los HTML en el repo (estado: in-progress). Hay ~27 archivos con `twitter:card`, pero conviene revisar los que aún no contienen `og:image` apuntando a una imagen válida.
- Verificar existencia física de los archivos referenciados en `og:image` dentro de `img/` (comprobación automática recomendada).
- Revisar JSON-LD y `canonical` para asegurar que `og:url` coincide con la canonical en todos los archivos.

## Archivos modificados ahora (detalles)
- `mazamitla.html`: se añadió/alineó bloque `twitter:*` y se confirmó `og:*` coincide con `<title>` y `meta description`.
- `tequila.html` / `tequila-en.html`: añadidos `twitter:*` y normalizado `og:url` a forma canónica correspondiente.
- `tlaquepaque.html` / `tlaquepaque-en.html`: añadidos `twitter:*` y verificación de títulos/descriptions.
- `tonala-tlaquepaque-en.html`: añadido bloque `twitter:*`.

---
Si deseas, puedo:
- Ejecutar una verificación automática de existencia de cada `og:image` en `img/` y listar los que faltan.
- Completar la auditoría restante y aplicar los parches faltantes en el resto de HTML (crear commit separado).

