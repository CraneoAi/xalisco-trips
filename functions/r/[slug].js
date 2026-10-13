const DESTINOS = {
  "asiento-copiloto": "https://wa.me/message/XKMPMDIT6NRNE1",
  "asiento-conductor": "https://wa.me/message/XKMPMDIT6NRNE1",
  tarjeta: "https://wa.me/message/XKMPMDIT6NRNE1",
  cumbre:
    "https://wa.me/5213351083318?text=Hola%2C%20asistir%C3%A9%20a%20la%20Cumbre%20Iberoamericana%20de%20Seguros%20y%20quiero%20solicitar%20la%20tarifa%20de%20traslado%20para%20asistentes.",
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
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        slug,
        new Date().toISOString(),
        cf.country || null,
        cf.region || null,
        cf.city || null,
        cf.timezone || null,
        request.headers.get("user-agent") || null,
      )
      .run();
  } catch (e) {
    console.error("QR log error:", e);
  }

  return Response.redirect(destino, 302);
}
