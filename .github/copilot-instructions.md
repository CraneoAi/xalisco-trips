# Instrucciones del repositorio

## Regla operativa obligatoria al cerrar una sesión de trabajo

Siempre que se confirme con el usuario que los cambios están correctos y listos, antes de cerrar el chat se debe:

1. Verificar que no haya errores relevantes en los archivos modificados.
2. Hacer `git add` de los cambios correspondientes.
3. Crear `git commit` con mensaje claro y descriptivo.
4. Ejecutar `git push` a la rama de trabajo acordada (por defecto `main` si el usuario no indica otra).

No finalizar la sesión dejando cambios listos sin publicar, salvo que el usuario lo pida explícitamente.

## Regla de paridad ES ↔ EN

Toda mejora aplicada a `index.html` DEBE replicarse en `index-en.html` y viceversa.
Antes de cerrar cualquier sesión que modifique alguno de los dos archivos, verificar:

- [ ] CSP headers (`Content-Security-Policy`)
- [ ] Meta tags SEO (`canonical`, `hreflang` absolutos, `og:image` absoluta)
- [ ] PWA tags (`manifest`, `theme-color`)
- [ ] Performance (`preload` LCP image, `dns-prefetch` para GTM y TikTok)
- [ ] CSS externo referenciado (`css/styles.css`)
- [ ] JS externo referenciado (`js/main.js`), sin scripts inline duplicados
- [ ] Favicon path correcto (`logo-xalisco-trips.ico`, sin espacios)
- [ ] TikTok cargado vía IntersectionObserver (NO eager load)
- [ ] Textos en el idioma correcto (no mezclar ES en EN ni viceversa)
- [ ] Copyright year actualizado en footer

## Naming conventions

- Archivos de imagen: `kebab-case.webp` (sin espacios, sin mayúsculas)
- IDs de carousel: `carousel{Destino}` en camelCase
- Clases CSS: `kebab-case` siguiendo el patrón de Bootstrap
- Commits: `tipo: descripción breve en español` (feat, fix, perf, docs, style)
