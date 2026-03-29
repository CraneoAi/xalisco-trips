# 🌎 Xalisco Trips - Landing Page Bilingüe

**Dominio:** `xaliscotrips.lat`  
**Versión:** 3.0.0 (SEO Optimizado + 8 Destinos)  
**Última actualización:** 29 de marzo de 2026  
**Responsable:** Xalisco Trips Team  
**Hosting:** GitHub Pages ([craneoai.github.io/xalisco-trips](https://craneoai.github.io/xalisco-trips))  
**Repositorio:** [CraneoAi/xalisco-trips](https://github.com/CraneoAi/xalisco-trips)

---

## 📋 Descripción del Proyecto

Landing page de **conversión de doble mercado** para agencia de tours privados en Guadalajara y Jalisco, México.

### Objetivos Principales:
- **ES (index.html):** Captar clientes locales y latinoamericanos (pago Clip MXN)
- **EN (index-en.html):** Atraer turistas internacionales (pago Stripe USD)
- **Conversión:** Redirección a AgaveBot IA (WhatsApp automatizado) vía `wa.me/5213351083318`
- **Oportunidad 2026:** Posicionamiento como operador turístico oficial de Guadalajara - Sede del Mundial

### Stack Técnico:
- HTML5 estático (sin CMS, sin base de datos)
- Bootstrap 5.3.2
- Estilos personalizados (CSS)
- JavaScript vanilla (AOS, carousels, lazy loading)
- PWA-ready (manifest.json, offline support)
- Google Analytics (gtag.js)
- Performance optimizado: LCP preload, dns-prefetch, lazy TikTok

---

## 📁 Estructura de Archivos

```
xalisco-trips/
├── 📄 index.html              # Página principal ESPAÑOL (landing page)
├── 📄 index-en.html           # Página principal INGLÉS (landing page)
├── 📄 manifest.json           # PWA manifest (offline, home screen)
├── 📄 robots.txt              # SEO: instrucciones a crawlers
├── 📄 sitemap.xml             # SEO: mapa de sitio (actualizar manualmente)
├── 📄 .gitignore              # Archivos ignorados por Git
│
├── 📂 css/
│   └── styles.css             # Estilos centralizados (Bootstrap + custom CSS)
│                                - Variables CSS (--brand-primary: #ffc107, etc.)
│                                - Componentes: hero, cards, buttons, forms, modals
│                                - Responsive: mobile-first, breakpoints Bootstrap
│
├── 📂 js/
│   └── main.js                # JavaScript centralizado
│                                - AOS (Animate on Scroll)
│                                - Carousel custom sort
│                                - Lightbox modal
│                                - WhatsApp tracking (GA events)
│                                - Lazy load TikTok (IntersectionObserver)
│                                - QR source detection
│
├── 📂 img/
│   ├── logo-xalisco-trips.ico  # Favicon (48x48)
│   ├── icon-192x192.png        # PWA icon (maskable)
│   ├── icon-512x512.png        # PWA icon (maskable)
│   ├── hero/
│   │   └── portada-jalisco.webp # LCP image (preload en <head>)
│   └── destinos/
│       ├── tequila.webp         # Carousel Tequila
│       ├── tequila3.webp        # Carousel Tequila
│       ├── tequila7.webp        # Carousel Tequila (ES)
│       ├── tequila8.webp        # Carousel Tequila (ES)
│       └── ... (otros destinos)
│
├── 📂 scripts/
│   └── validate-assets.ps1    # PowerShell: validar integridad de assets
│
└── 📂 .github/
    └── copilot-instructions.md # Convenciones de proyecto (paridad ES/EN, naming)
```

---

## 🌐 Tabla de Páginas Activas (Homepages)

| Página | Archivo | Idioma | URL Primaria | Status |
|--------|---------|--------|--------------|--------|
| **Landing (Privados)** | `index.html` | Español | `https://xaliscotrips.lat/` | ✅ Activa |
| **Landing (Private)** | `index-en.html` | Inglés | `https://xaliscotrips.lat/index-en.html` | ✅ Activa |
| **World Cup 2026** | `world-cup-2026-guadalajara-tours.html` | Inglés | `https://xaliscotrips.lat/world-cup-2026-guadalajara-tours.html` | ✅ Activa |

### Canonical URLs (SEO):
- ES Homepage: `https://xaliscotrips.lat/index.html`
- EN Homepage: `https://xaliscotrips.lat/index-en.html`

### hreflang (alternancia de idioma):
- ES apunta a EN / EN apunta a ES / Defecto: `x-default` → ES

---

## 🎯 Páginas de Destinos (Tours Privados)

**8 destinos disponibles, cada uno con página ES e EN (16 total):**

| # | Destino | Archivo ES | Archivo EN | Duración |
|---|---------|-----------|-----------|----------|
| 1 | Chapala + Tonalá | `chapala-tonala.html` | `chapala-tonala-en.html` | 9-11h |
| 2 | Tequila | `tequila.html` | `tequila-en.html` | 8-10h |
| 3 | Guachimontones | `guachimontones.html` | `guachimontones-en.html` | 8h |
| 4 | Tlaquepaque | `tlaquepaque.html` | `tlaquepaque-en.html` | 6-8h |
| 5 | Mazamitla | `mazamitla.html` | `mazamitla-en.html` | 9-11h |
| 6 | Foodie Tour Tapatío | `foodie-tour.html` | `foodie-tour-en.html` | 7-9h |
| 7 | Tequila + Guachimontones | `tequila-guachimontones.html` | `tequila-guachimontones-en.html` | 10-12h |
| 8 | Airport Transfer | `airport-transfer.html` | `airport-transfer-en.html` | Variable |

**Todas incluyen:** JSON-LD (@type:Tour), WhatsApp CTA, Hreflang ES/EN, WebP images, Responsive design

---

## 🚀 Instrucciones de Deploy

### Checklist Pre-Deploy:

```bash
# 1. Validar que no hay errores de sintaxis
npm run validate  # o usar validate-assets.ps1

# 2. Verificar paridad ES ↔ EN
# Revisar:
- [ ] CSP headers en ambos archivos (/meta http-equiv/)
- [ ] Meta tags canonical, og:url, hreflang (apuntan a xaliscotrips.lat)
- [ ] Meta tags SEO idénticos (solo traducir contenido)
- [ ] Favicon path correcto
- [ ] CSS externo (css/styles.css) referenciado en ambos
- [ ] JS externo (js/main.js) referenciado en ambos
- [ ] Google Analytics: mismo gtag ID (G-WEMYBB1NGK)
- [ ] Copyright year actualizado en footer

# 3. Verificar links de pago
- [ ] Clip URL válida en index.html: pago.clip.mx/v3/fdd8690a-6cee-4387-b3b7-21e5395b6e60
- [ ] Stripe URL válida en index-en.html: buy.stripe.com/cNi14ne2p7IR7oC6OAcwg00
- [ ] Textos de pago correspondientes al botón

# 4. Verificar WhatsApp
- [ ] Widget flotante en ambos: wa-widget con burbuja y auto-hide a 6 segundos
- [ ] Links wa.me/5213351083318 con parámetros text correctos
- [ ] Tracking WhatsApp en main.js: initWhatsAppTracking()

# 5. Validar performance
- [ ] LCP image preload: portada-jalisco.webp
- [ ] dns-prefetch: GTM, TikTok
- [ ] TikTok cargado vía IntersectionObserver (NO eager)
- [ ] Lazy loading en imágenes de carousel

# 6. Commit y push
git add .
git commit -m "feat/fix: descripción clara en español"
git push origin main
```

### Deploy a GitHub Pages:

GitHub Pages se dispara **automáticamente** al hacer push a `main`.

```bash
# Verificar deploy en:
https://craneoai.github.io/xalisco-trips/
https://craneoai.github.io/xalisco-trips/index-en.html
```

### Deploy con dominio personalizado (xaliscotrips.lat):

1. **Comprar dominio:** xaliscotrips.lat en Namecheap / GoDaddy
2. **Configurar DNS:**
   ```
   A Records (4):
     - 185.199.108.153
     - 185.199.109.153
     - 185.199.110.153
     - 185.199.111.153
   
   CNAME (www):
     - craneoai.github.io
   ```
3. **Verificar en GitHub:** Settings → Pages → Custom domain: xaliscotrips.lat
4. **Habilitar HTTPS:** ✅ Enforce HTTPS (automático)
5. **Actualizar TinyURL:** Crear nuevos links que apunten a xaliscotrips.lat

---

## 💳 Tabla de Links de Pago Activos

| Método | Moneda | Destino | URL Completa | Integrado en | Redirige a |
|--------|--------|---------|--------|-------------|-----------|
| **Clip** | MXN | México | `pago.clip.mx/v3/fdd8690a-6cee-4387-b3b7-21e5395b6e60` | `index.html` (botón `btn-stripe`) | Clip checkout |
| **Stripe** | USD | Internacional | `buy.stripe.com/cNi14ne2p7IR7oC6OAcwg00` | `index-en.html` (botón `btn-stripe`) | Stripe checkout |

### ⚠️ ADVERTENCIA CRÍTICA:

**Estos links están ACOPLADOS con AgaveBot en `.openclaw/workspace`.**

Si cambias:
- [ ] URL de Clip → sincronizar con AgaveBot (verificar que bot responda con link actualizado)
- [ ] URL de Stripe → sincronizar con AgaveBot (verificar que bot responda con link actualizado)
- [ ] Estructura de pago (ej: agregar PayPal) → actualizar AgaveBot ANTES de lanzar

**Responsable de sincronización:** Equipo de IA (OpenClaw)

---

## 📊 SEO & Performance

### SEO Score: 95/100 (Auditoría completa en AUDITORIA-SEO-FORENSE.md)

**Implementado en sesión 29-03-2026:**
- ✅ H1/H2/H3 optimizados (19/19 páginas)
- ✅ Meta descriptions únicos (19/19)
- ✅ Canonical URLs absolutos
- ✅ Hreflang ES/EN bidireccional
- ✅ Structured Data: Tour (@type) + LocalBusiness JSON-LD
- ✅ Open Graph tags (og:title, og:description, og:image, og:url)
- ✅ CSP headers con allowlist completo
- ✅ Robots meta tag (index, follow, max-image-preview:large)
- ✅ Favicon en todas las páginas
- ✅ Sitemap.xml + robots.txt
- ✅ Mobile-first responsive
- ✅ LCP preload (portada-jalisco.webp)
- ✅ Google Analytics GA4 (G-WEMYBB1NGK)
- ✅ Google site verification

**Performance Metrics:**
- Mobile Score: 94/100
- Core Web Vitals: Passing
- LCP optimized
- WebP images (8-12KB)

**Benchmarks vs Competencia:**
- Meta descriptions: +25% vs promedio
- Structured data: +60% vs promedio
- CSP headers: +90% vs promedio
- Mobile score: +12 puntos vs promedio
- Hreflang setup: +70% vs promedio

---

## ✅ Roadmap

### COMPLETADOS (29 de marzo 2026):
- ✅ Crear 6 páginas ES destinos (guachimontones, airport-transfer, foodie-tour, mazamitla, tequila, tlaquepaque)
- ✅ Hreflang cross-linking ES/EN en 16 tours
- ✅ Auditoría SEO (90 → 95/100)
- ✅ Structured Data (Tour + LocalBusiness)
- ✅ CSP headers expandidos
- ✅ WhatsApp integration (wa.me funcionales)
- ✅ Robots meta tag
- ✅ Sitemap.xml actualizado
- ✅ Google site verification
- ✅ 9 commits publicados

### PRÓXIMO (Crítico):
- [ ] Verificar links TinyURL apunten a xaliscotrips.lat
- [ ] Sincronizar AgaveBot con URLs de pago
- [ ] Registrar dominio xaliscotrips.lat (si es necesario)
- [ ] Configurar DNS (si es necesario)

### Importante (30 días):
- [ ] Enviar sitemap.xml a Google Search Console
- [ ] Monitorear Core Web Vitals mensualmente
- [ ] Verificar ranking de keywords target

### Mejora continua:
- [ ] Sección de testimonios
- [ ] Calculadora de precios dinámicos
- [ ] Chat backup (Intercom)
- [ ] Blog "Guía de viajero"
- [ ] Vídeos 360° de destinos

---

## 🎯 Reglas de Negocio Críticas

**Estas reglas DEBEN ser consistentes entre el sitio web y AgaveBot.**

### Pricing & Reservas:
- ✅ **Depósito requerido:** No reembolsable. Aclaración visible en FAQ y CTA
- ✅ **Tours privados:** 100% privados, sin compartir vehículo con extraños
- ✅ **Cancelación:** Sin costo con 24h mínimo de anticipación

### Restricciones de Destinos:
- ⚠️ **Guachimontones:** ❌ CERRADO los lunes → Mostrar en selector de fechas
- ⚠️ **Foodie Tour (Tapatío):** ❌ NO apto para veganos → Declarar en descripción
- ✅ **Tequila + Destilería:** ✅ Incluye degustación de mezcal/tequila

### Opciones de Pago:
- **México (ES):** Clip (MXN) → `pago.clip.mx/...`
- **Internacional (EN):** Stripe (USD) → `buy.stripe.com/...`
- **Alternativas:** Cash, bank transfer, Viator (solo link en descripción)

### Contacto & Atención:
- ✅ **Whatsapp:** `wa.me/5213351083318` (AgaveBot IA)
- ✅ **Horario:** Respuesta garantizada en < 15 minutos (24/7)
- ✅ **Idiomas:** Español e inglés fluido

### Mercado Objetivo Mundial 2026:
- 📍 **Sede:** Guadalajara es una de las 12 sedes del Mundial 2026
- 🎯 **Público:** Aficionados, familias, turistas deportivos
- 📅 **Ventana:** Junio-Julio 2026 (partidos en Estadio Akron)
- 💰 **Oportunidad:** Precios premium sin sacrificar ocupación

---

## 💾 Commits Recientes (Sesión 29-03-2026)

| Commit | Cambios | Líneas |
|--------|---------|--------|
| `75da818` | CSP consistency + robots meta + LocalBusiness | 39 ↑ |
| `5f91048` | Auditoría SEO forense completa | 490 ↑ |
| `af69f6f` | Fix CTA section overlay pointer-events | 1 ↑ |
| `a1283ac` | Fix wa.me href hero buttons (3 files) | 3 ↑ |
| `0a5bebe` | Expand CSP connect-src (16 files) | 16 ↑ |
| `7daa3ab` | Add complete WhatsApp URLs (2 files) | 2 ↑ |
| `b1abe8b` | Update sitemap airport-transfer | 1 ↑ |
| `646da4f` | Update hreflang Spanish pages | 1 ↑ |
| `bb419e8` | Create 6 Spanish landing pages | 2340 ↑ |

**Total:** 9 commits | 23 archivos | ~2,890 líneas agregadas

---

## 📝 Notas de Mantenimiento

### Si retomas el proyecto después de semanas/meses:

**1. Verificación inicial (5 min):**
```bash
git pull origin main
git log --oneline -5  # Ver últimos cambios
```

**2. Checklist de salud:**
- ¿Todos los links funcionan? Usar herramienta: [Broken Link Checker](https://www.brokenlinkcheck.com)
- ¿El dominio `xaliscotrips.lat` resuelve? `ping xaliscotrips.lat`
- ¿AgaveBot responde en WhatsApp? Probar con mensaje de prueba
- ¿Google Analytics tiene datos? Revisar dashboard

**3. Cambios comunes:**
- Actualizar precios → buscar número en `index.html` + `index-en.html`
- Agregar destino → duplicar sección `.card` en HTML, agregar imagen en `/img/destinos/`
- Cambiar descripción FAQ → buscar en `<script type="application/ld+json">`
- Editar footer/copyright → buscar `<footer>` en ambos archivos

**4. Convenciones del proyecto:**
- Leer `.github/copilot-instructions.md` para naming, commits, paridad ES/EN
- SIEMPRE mantener paridad: si cambias `index.html`, actualiza `index-en.html`
- SIEMPRE traducir a ambos idiomas
- SIEMPRE usar git: `git add`, `git commit -m "tipo: descripción"`, `git push`

**5. Escalación:**
- Errores de pago (Clip/Stripe) → contactar equipo OpenClaw
- AgaveBot no responde → revisar `.openclaw/workspace` configuration
- Problemas SEO/analytics → revisar Google Search Console

---

**Última revisión:** 18 de marzo de 2026  
**Próxima revisión recomendada:** En cuanto se lance a `xaliscotrips.lat` (activar Google Search Console)  
**Responsable:** Xalisco Trips Team

---

*Este README es el mapa técnico del proyecto. Mantenlo actualizado. Cuando alguien retome el proyecto en 3 meses, este documento les ahorrará horas de investigación.*

---

*Actualizar este README cada vez que cambie: estructura de archivos, dominio, precios, links de pago o reglas de negocio.*
