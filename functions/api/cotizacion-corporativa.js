const SERVICIOS = {
  aeropuerto: "Llegadas y salidas aeropuerto GDL",
  shuttles: "Shuttles hotel ↔ sede",
  tours: "City tours y programa de acompañantes",
  cenas: "Cenas y eventos nocturnos",
  "multi-unidad": "Logística multi-unidad",
};

const REQUERIDOS = [
  "empresa",
  "contacto",
  "email",
  "whatsapp",
  "evento",
  "sede",
  "fecha_inicio",
  "pasajeros",
  "factura",
  "lang",
];

const WHATSAPP_URL = "https://wa.me/5213351083318";

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function str(value) {
  return typeof value === "string" ? value.trim() : "";
}

function fechaValida(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

function validar(data) {
  const fields = [];
  const v = {
    empresa: str(data.empresa),
    contacto: str(data.contacto),
    email: str(data.email),
    whatsapp: str(data.whatsapp),
    evento: str(data.evento),
    sede: str(data.sede),
    fecha_inicio: str(data.fecha_inicio),
    fecha_fin: str(data.fecha_fin),
    pasajeros: Number(data.pasajeros),
    servicios: Array.isArray(data.servicios) ? data.servicios : [],
    factura: str(data.factura),
    comentarios: str(data.comentarios),
    lang: str(data.lang),
  };

  for (const campo of REQUERIDOS) {
    if (campo === "pasajeros") continue;
    if (!v[campo]) fields.push(campo);
  }
  for (const campo of ["empresa", "contacto", "email", "whatsapp", "evento", "sede"]) {
    if (v[campo].length > 200 && !fields.includes(campo)) fields.push(campo);
  }
  if (v.comentarios.length > 2000) fields.push("comentarios");

  if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) fields.push("email");
  if (v.whatsapp && !/^[0-9+ ()-]{8,20}$/.test(v.whatsapp)) fields.push("whatsapp");
  if (!Number.isInteger(v.pasajeros) || v.pasajeros < 1 || v.pasajeros > 5000) {
    fields.push("pasajeros");
  }
  if (v.fecha_inicio && !fechaValida(v.fecha_inicio)) fields.push("fecha_inicio");
  if (v.fecha_fin) {
    if (!fechaValida(v.fecha_fin)) fields.push("fecha_fin");
    else if (fechaValida(v.fecha_inicio) && v.fecha_fin < v.fecha_inicio) fields.push("fecha_fin");
  }
  if (
    v.servicios.length < 1 ||
    !v.servicios.every((s) => Object.prototype.hasOwnProperty.call(SERVICIOS, s))
  ) {
    fields.push("servicios");
  }
  if (v.factura && !["si", "no"].includes(v.factura)) fields.push("factura");
  if (v.lang && !["es", "en"].includes(v.lang)) fields.push("lang");

  v.servicios = [...new Set(v.servicios)];
  return { valores: v, fields: [...new Set(fields)] };
}

async function enviar(env, payload) {
  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

function htmlInterno(v) {
  const filas = [
    ["Empresa", v.empresa],
    ["Contacto", v.contacto],
    ["Email", v.email],
    ["WhatsApp", v.whatsapp],
    ["Evento", v.evento],
    ["Sede", v.sede],
    ["Fecha inicio", v.fecha_inicio],
    ["Fecha fin", v.fecha_fin || "—"],
    ["Pasajeros", v.pasajeros],
    ["Servicios", v.servicios.map((s) => SERVICIOS[s]).join(", ")],
    ["Factura CFDI", v.factura === "si" ? "Sí" : "No"],
    ["Idioma", v.lang.toUpperCase()],
    ["Comentarios", v.comentarios || "—"],
  ]
    .map(
      ([k, val]) =>
        `<tr><th style="text-align:left;padding:6px 10px;background:#f8f9fa;border:1px solid #dee2e6;vertical-align:top;">${esc(k)}</th><td style="padding:6px 10px;border:1px solid #dee2e6;white-space:pre-wrap;">${esc(val)}</td></tr>`,
    )
    .join("");

  return `
    <div style="font-family:sans-serif;max-width:640px;margin:0 auto;">
      <h2>Nueva solicitud de cotización corporativa</h2>
      <table style="border-collapse:collapse;width:100%;font-size:14px;">${filas}</table>
      <p style="color:#888;font-size:12px;">Enviado desde xaliscotrips.lat/eventos-corporativos</p>
    </div>`;
}

function htmlAcuse(v) {
  if (v.lang === "en") {
    return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
      <h2>Thank you, ${esc(v.contacto)}!</h2>
      <p>We received your transportation quote request for <strong>${esc(v.evento)}</strong>.</p>
      <p>Our team will get back to you within 24 hours.</p>
      <p>Questions? Message us on <a href="${WHATSAPP_URL}">WhatsApp</a>.</p>
      <p style="color:#888;font-size:12px;">Xalisco Trips · Transportation and tours in Jalisco</p>
    </div>`;
  }
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
      <h2>¡Gracias, ${esc(v.contacto)}!</h2>
      <p>Recibimos tu solicitud de cotización de transporte para <strong>${esc(v.evento)}</strong>.</p>
      <p>Nuestro equipo te responderá en menos de 24 h.</p>
      <p>¿Dudas? Escríbenos por <a href="${WHATSAPP_URL}">WhatsApp</a>.</p>
      <p style="color:#888;font-size:12px;">Xalisco Trips · Transporte y tours en Jalisco</p>
    </div>`;
}

export async function onRequestPost({ request, env }) {
  try {
    let data;
    try {
      data = await request.json();
    } catch {
      return json({ ok: false, error: "invalid_json" }, 400);
    }
    if (!data || typeof data !== "object") {
      return json({ ok: false, error: "invalid_json" }, 400);
    }

    // Honeypot: los bots llenan "website"; respondemos ok sin enviar nada.
    if (str(data.website)) {
      return json({ ok: true });
    }

    const { valores: v, fields } = validar(data);
    if (fields.length) {
      return json({ ok: false, error: "invalid_fields", fields }, 400);
    }

    const resp = await enviar(env, {
      from: "Xalisco Trips <reservas@xaliscotrips.lat>",
      to: ["octavio@xaliscotrips.lat"],
      bcc: ["xaliscotrips@gmail.com"],
      reply_to: v.email,
      subject: `Cotización corporativa — ${v.evento.replace(/\s+/g, " ")} (${v.pasajeros} pax)`,
      html: htmlInterno(v),
    });

    if (!resp.ok) {
      console.error("Resend interno falló:", resp.status, await resp.text());
      return json({ ok: false, error: "send_failed" }, 502);
    }

    try {
      const acuse = await enviar(env, {
        from: "Xalisco Trips <reservas@xaliscotrips.lat>",
        to: [v.email],
        subject:
          v.lang === "en"
            ? "We received your corporate quote request — Xalisco Trips"
            : "Recibimos tu solicitud de cotización — Xalisco Trips",
        html: htmlAcuse(v),
      });
      if (!acuse.ok) {
        console.error("Resend acuse falló:", acuse.status, await acuse.text());
      }
    } catch (err) {
      console.error("Resend acuse error:", err);
    }

    return json({ ok: true });
  } catch (err) {
    console.error("cotizacion-corporativa error:", err);
    return json({ ok: false, error: "server_error" }, 500);
  }
}

// Cualquier método distinto de POST (onRequestPost tiene prioridad sobre onRequest).
export async function onRequest() {
  const resp = json({ ok: false, error: "method_not_allowed" }, 405);
  resp.headers.set("Allow", "POST");
  return resp;
}
