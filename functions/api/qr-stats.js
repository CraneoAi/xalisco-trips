export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (token !== env.QR_DASHBOARD_TOKEN) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
      headers: { "content-type": "application/json" }
    });
  }

  const totalPorSlug = await env.QR_DB.prepare(
    `SELECT slug, COUNT(*) as total FROM qr_scans GROUP BY slug ORDER BY total DESC`
  ).all();

  const totalPorCiudad = await env.QR_DB.prepare(
    `SELECT city, region, country, COUNT(*) as total FROM qr_scans GROUP BY city, region, country ORDER BY total DESC LIMIT 20`
  ).all();

  const recientes = await env.QR_DB.prepare(
    `SELECT slug, scanned_at, city, region, country FROM qr_scans ORDER BY scanned_at DESC LIMIT 50`
  ).all();

  const totalGeneral = await env.QR_DB.prepare(
    `SELECT COUNT(*) as total FROM qr_scans`
  ).first();

  return new Response(JSON.stringify({
    total: totalGeneral.total,
    por_slug: totalPorSlug.results,
    por_ciudad: totalPorCiudad.results,
    recientes: recientes.results
  }), {
    headers: { "content-type": "application/json" }
  });
}
