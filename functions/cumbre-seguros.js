// /cumbre-seguros: activa hasta el fin de la Cumbre Iberoamericana de Seguros.
// Desde el 9 nov 2026 00:00 (hora de Guadalajara) redirige 301 a /airport-transfer.
// Despues de esa fecha se puede borrar este archivo + cumbre-seguros.html y dejar la regla en _redirects.
const FIN_CUMBRE = Date.parse("2026-11-09T00:00:00-06:00");

export async function onRequest({ request, next }) {
  if (Date.now() >= FIN_CUMBRE) {
    const dest = new URL("/airport-transfer", request.url);
    dest.search = new URL(request.url).search;
    return Response.redirect(dest.toString(), 301);
  }
  return next();
}
