# Mapa de URLs canónicas

Dominio: `https://xaliscotrips.lat`

Las rutas de páginas usan URL sin extensión ni barra final. La raíz es `/`. Las páginas servidas desde directorios `index.html` conservan la barra final (`/blog/`, `/en/blog/` y sus artículos), que es la URL 200 canónica de Cloudflare Pages.

| Archivo | URL canónica limpia / destino final | Idioma | Par hreflang (ES · EN) |
|---|---|---|---|
| `404.html` | `/404` (documento de error, noindex) | ES | — |
| `airport-transfer.html` | `/airport-transfer` | ES | `/airport-transfer` · `/airport-transfer-en` |
| `airport-transfer-en.html` | `/airport-transfer-en` | EN | `/airport-transfer` · `/airport-transfer-en` |
| `blog/excursiones-desde-guadalajara/index.html` | `/blog/excursiones-desde-guadalajara/` | ES | `/blog/excursiones-desde-guadalajara/` · `/en/blog/best-day-trips-from-guadalajara/` |
| `blog/index.html` | `/blog/` | ES | `/blog/` · `/en/blog/` |
| `chapala-tonala.html` | `/chapala-tonala` | ES | `/chapala-tonala` · `/chapala-tonala-en` |
| `chapala-tonala-en.html` | `/chapala-tonala-en` | EN | `/chapala-tonala` · `/chapala-tonala-en` |
| `corporate-event-transportation.html` | `/corporate-event-transportation` | EN | `/eventos-corporativos` · `/corporate-event-transportation` |
| `cumbre-seguros.html` | `/eventos-corporativos` (redirección directa; campaña vencida) | ES | `/eventos-corporativos` · `/corporate-event-transportation` |
| `en/blog/best-day-trips-from-guadalajara/index.html` | `/en/blog/best-day-trips-from-guadalajara/` | EN | `/blog/excursiones-desde-guadalajara/` · `/en/blog/best-day-trips-from-guadalajara/` |
| `en/blog/index.html` | `/en/blog/` | EN | `/blog/` · `/en/blog/` |
| `eventos-corporativos.html` | `/eventos-corporativos` | ES | `/eventos-corporativos` · `/corporate-event-transportation` |
| `foodie-tour.html` | `/foodie-tour` | ES | `/foodie-tour` · `/foodie-tour-en` |
| `foodie-tour-en.html` | `/foodie-tour-en` | EN | `/foodie-tour` · `/foodie-tour-en` |
| `gracias.html` | `/gracias` (noindex) | ES | — |
| `guachimontones.html` | `/guachimontones` | ES | `/guachimontones` · `/guachimontones-en` |
| `guachimontones-en.html` | `/guachimontones-en` | EN | `/guachimontones` · `/guachimontones-en` |
| `guadalajara-airport-transfer-arandas.html` | `/guadalajara-airport-transfer-arandas` | EN | `/traslado-aeropuerto-guadalajara-arandas` · `/guadalajara-airport-transfer-arandas` |
| `guadalajara-airport-transfer-los-altos-jalisco.html` | `/guadalajara-airport-transfer-los-altos-jalisco` | EN | `/traslado-aeropuerto-los-altos-jalisco` · `/guadalajara-airport-transfer-los-altos-jalisco` |
| `index.html` | `/` | ES | `/` · `/index-en` |
| `index-en.html` | `/index-en` | EN | `/` · `/index-en` |
| `links.html` | `/links` (noindex; sin par) | ES | — |
| `mazamitla.html` | `/mazamitla` | ES | `/mazamitla` · `/mazamitla-en` |
| `mazamitla-en.html` | `/mazamitla-en` | EN | `/mazamitla` · `/mazamitla-en` |
| `panel-qr.html` | `/panel-qr` (noindex; sin par) | ES | — |
| `tequila.html` | `/tequila` | ES | `/tequila` · `/tequila-en` |
| `tequila-en.html` | `/tequila-en` | EN | `/tequila` · `/tequila-en` |
| `tequila-guachimontones.html` | `/tequila-guachimontones` | ES | `/tequila-guachimontones` · `/tequila-guachimontones-en` |
| `tequila-guachimontones-en.html` | `/tequila-guachimontones-en` | EN | `/tequila-guachimontones` · `/tequila-guachimontones-en` |
| `tlaquepaque.html` | `/tlaquepaque` | ES | `/tlaquepaque` · `/tlaquepaque-en` |
| `tlaquepaque-en.html` | `/tlaquepaque-en` | EN | `/tlaquepaque` · `/tlaquepaque-en` |
| `tonala-tlaquepaque.html` | `/tonala-tlaquepaque` | ES | `/tonala-tlaquepaque` · `/tonala-tlaquepaque-en` |
| `tonala-tlaquepaque-en.html` | `/tonala-tlaquepaque-en` | EN | `/tonala-tlaquepaque` · `/tonala-tlaquepaque-en` |
| `traslado-aeropuerto-guadalajara-arandas.html` | `/traslado-aeropuerto-guadalajara-arandas` | ES | `/traslado-aeropuerto-guadalajara-arandas` · `/guadalajara-airport-transfer-arandas` |
| `traslado-aeropuerto-los-altos-jalisco.html` | `/traslado-aeropuerto-los-altos-jalisco` | ES | `/traslado-aeropuerto-los-altos-jalisco` · `/guadalajara-airport-transfer-los-altos-jalisco` |

## Alias antiguos sin archivo `.html` físico

Las rutas `/world-cup-2026-guadalajara-tours` y `/world-cup-2026-guadalajara-tours-es` son alias heredados: ambas versiones sin extensión y sus variantes `.html` redirigen directamente a `/chapala-tonala-en` y `/chapala-tonala`, respectivamente. No se incluyen en el sitemap.

`/cumbre-seguros` no sirve una página de campaña independiente: desde el 9 de noviembre de 2026 redirige a `/eventos-corporativos`. Su antigua página no está en el sitemap.

## Regla de redirección

Las rutas `.html` indexables y no indexables apuntan directamente a su destino limpio con 301. `index.html` apunta a `/`, `index-en.html` a `/index-en`, y los `index.html` de blog a su directorio con barra final. La petición explícita a `404.html` redirige a `/404`; Cloudflare Pages conserva el archivo `404.html` como fallback interno para respuestas de error.
