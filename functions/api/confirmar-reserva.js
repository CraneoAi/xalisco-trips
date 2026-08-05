export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    const { email, nombreCompleto, tourNombre, detalles } = data;

    if (!email || !nombreCompleto || !tourNombre) {
      return new Response(JSON.stringify({ ok: false, error: "missing_fields" }), { status: 400 });
    }

    const detallesHtml = (detalles || "")
      .split("\n")
      .filter((linea) => linea.trim() !== "" && !linea.startsWith("Hola Octavio"))
      .map((linea) => `<p style="margin:4px 0;">${linea}</p>`)
      .join("");

    const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
      <h2>¡Gracias, ${nombreCompleto}!</h2>
      <p>Tu depósito para <strong>${tourNombre}</strong> quedó confirmado.</p>
      <div style="background:#f8f9fa;border-radius:8px;padding:16px;margin:16px 0;">
        ${detallesHtml}
      </div>
      <p>Te contactaremos por WhatsApp en menos de 15 minutos para coordinar la fecha final.</p>
      <p>¿Dudas? Escríbenos: <a href="https://wa.me/message/XKMPMDIT6NRNE1">WhatsApp</a></p>
      <p style="color:#888;font-size:12px;">Xalisco Trips · Tours privados certificados Sectur</p>
    </div>`;

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Xalisco Trips <reservas@xaliscotrips.lat>",
        to: [email],
        subject: `Reserva confirmada — ${tourNombre}`,
        html,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return new Response(JSON.stringify({ ok: false, error: errText }), { status: 502 });
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500 });
  }
}
