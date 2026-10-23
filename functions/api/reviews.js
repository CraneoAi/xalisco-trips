// GET /api/reviews -> { rating, count, url, source }
// Datos en vivo desde Google Places API (New) cuando existe el secreto GOOGLE_PLACES_KEY
// (opcional GOOGLE_PLACE_ID; si no existe, se busca "Xalisco Trips" por texto).
// Sin key o si Google falla -> respaldo estatico.
// Cache en el edge: 6 h si vino de Google, 5 min si es respaldo (para reintentar pronto).
const FALLBACK = {
  rating: 5.0,
  count: 18,
  url: "https://share.google/TA5sNpJLj3WsmmqO4",
  source: "static",
};
const TTL_GOOGLE = 6 * 60 * 60;
const TTL_STATIC = 5 * 60;

export async function onRequestGet({ env, request, waitUntil }) {
  const cache = caches.default;
  const cacheKey = new Request(new URL("/api/reviews?cache=v2", request.url).toString());
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  let data = FALLBACK;
  let diag = env.GOOGLE_PLACES_KEY ? "key-ok" : "sin-key";
  const key = env.GOOGLE_PLACES_KEY;
  if (key) {
    try {
      let placeId = env.GOOGLE_PLACE_ID;
      if (!placeId) {
        const r = await fetch("https://places.googleapis.com/v1/places:searchText", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": key,
            "X-Goog-FieldMask": "places.id",
          },
          body: JSON.stringify({ textQuery: "Xalisco Trips Guadalajara Jalisco", languageCode: "es" }),
        });
        const j = await r.json();
        if (!r.ok) diag = `search-${r.status}-${(j.error && j.error.status) || ""}`;
        placeId = j.places && j.places[0] && j.places[0].id;
        if (r.ok && !placeId) diag = "search-sin-resultados";
      }
      if (placeId) {
        const r = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
          headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": "id,rating,userRatingCount,googleMapsUri" },
        });
        const p = await r.json();
        if (!r.ok) diag = `details-${r.status}-${(p.error && p.error.status) || ""}`;
        if (p && p.rating && p.userRatingCount) {
          data = { rating: p.rating, count: p.userRatingCount, url: p.googleMapsUri || FALLBACK.url, placeId: p.id, source: "google" };
          diag = "ok";
        }
      }
    } catch (e) {
      diag = "excepcion";
    }
  }

  const ttl = data.source === "google" ? TTL_GOOGLE : TTL_STATIC;
  const res = new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": `public, max-age=${ttl}`,
      "X-Reviews-Source": data.source,
      "X-Reviews-Diag": diag,
    },
  });
  waitUntil(cache.put(cacheKey, res.clone()));
  return res;
}
