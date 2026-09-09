const DESTINOS = {
  "asiento-copiloto": "https://wa.me/message/XKMPMDIT6NRNE1",
  "asiento-conductor": "https://wa.me/message/XKMPMDIT6NRNE1"
};

export async function onRequestGet(context) {
  const { params, request, env } = context;
  const slug = params.slug;
  const destino = DESTINOS[slug];

  if (!destino) {
    return new Response("Not found", { status: 404 });
  }

  const cf = request.cf || {};
  try {
    await env.QR_DB.prepare(
      `INSERT INTO qr_scans (slug, scanned_at, country, region, city, timezone, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      slug,
      new Date().toISOString(),
      cf.country || null,
      cf.region || null,
      cf.city || null,
      cf.timezone || null,
      request.headers.get("user-agent") || null
    ).run();
  } catch (e) {
    console.error("QR log error:", e);
  }

  return Response.redirect(destino, 302);
}
