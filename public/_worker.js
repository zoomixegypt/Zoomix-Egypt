const JSON_HEADERS = {
  "Content-Type": "application/json; charset=UTF-8",
  "Cache-Control": "no-store",
};

const STATUS_VALUES = new Set(["new", "contacted", "in-progress", "won", "archived"]);
const CONTACT_VALUES = new Set(["whatsapp", "call", "email"]);

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...JSON_HEADERS, ...extraHeaders },
  });
}

function text(value, maxLength = 5000) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function now() {
  return new Date().toISOString();
}

function cookieValue(request, name) {
  const cookies = request.headers.get("Cookie") || "";
  const match = cookies.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : "";
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function sessionCookie(token, request, maxAge = 60 * 60 * 24 * 7) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `zoomix_studio=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure}`;
}

function clearSessionCookie(request) {
  return sessionCookie("", request, 0);
}

function referenceCode() {
  const year = new Date().getUTCFullYear();
  const suffix = crypto.randomUUID().replaceAll("-", "").slice(0, 6).toUpperCase();
  return `ZMX-${year}-${suffix}`;
}

function briefFromPayload(payload, reference) {
  return {
    referenceCode: reference,
    name: text(payload.name, 120),
    project: text(payload.project, 160),
    phone: text(payload.phone, 40),
    email: text(payload.email, 160).toLowerCase(),
    contactPreference: text(payload.contactPreference, 30),
    preferredTime: text(payload.preferredTime, 40),
    activity: text(payload.activity, 160),
    service: text(payload.service, 80),
    route: text(payload.route, 40),
    offerId: text(payload.offerId || payload.packageId, 100),
    offerName: text(payload.offerName, 180),
    showType: text(payload.showType, 40),
    contentSource: text(payload.contentSource, 50),
    eventType: text(payload.eventType, 50),
    eventDate: text(payload.eventDate, 40),
    eventLocation: text(payload.eventLocation, 180),
    coverageType: text(payload.coverageType, 50),
    stage: text(payload.stage, 50),
    budget: text(payload.budget, 50),
    launchTimeline: text(payload.launchDate, 50),
    source: text(payload.source, 50),
    projectLink: text(payload.projectLink, 500),
    goal: text(payload.goal, 500),
    description: text(payload.description, 5000),
    consent: payload.consent ? 1 : 0,
    status: "new",
    notes: "",
    createdAt: now(),
  };
}

function validateBrief(brief, payload) {
  if (text(payload.website, 200)) return "Invalid submission.";
  if (!brief.name || !brief.service || !brief.description) return "Please complete the required brief fields.";
  if (!CONTACT_VALUES.has(brief.contactPreference)) return "Choose a contact method.";
  if (["whatsapp", "call"].includes(brief.contactPreference) && !brief.phone) return "A phone number is required for this contact method.";
  if (brief.contactPreference === "email" && !/^\S+@\S+\.\S+$/.test(brief.email)) return "A valid email is required.";
  if (!brief.consent) return "Consent is required before sending.";
  if (brief.route === "show" && !brief.showType) return "Choose a show request type.";
  if (brief.showType === "events" && !brief.eventDate) return "An event date is required.";
  return "";
}

function briefText(brief) {
  return [
    "ZOOMIX PROJECT BRIEF",
    `Reference: ${brief.referenceCode}`,
    `Name: ${brief.name}`,
    `Project: ${brief.project}`,
    `Phone: ${brief.phone}`,
    `Email: ${brief.email}`,
    `Contact: ${brief.contactPreference}`,
    `Activity: ${brief.activity}`,
    `Service: ${brief.service}`,
    `Path: ${brief.route}`,
    `Offer: ${brief.offerName || brief.offerId}`,
    `Stage: ${brief.stage}`,
    `Budget: ${brief.budget}`,
    `Timeline: ${brief.launchTimeline}`,
    `Goal: ${brief.goal}`,
    `Description: ${brief.description}`,
  ].filter((line) => !line.endsWith(": ")).join("\n");
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

async function sendBriefEmails(brief, env) {
  if (!env.EMAIL || !env.EMAIL_FROM || !env.ADMIN_EMAIL) return false;
  const body = briefText(brief);
  const html = `<pre style="font-family:Arial,sans-serif;white-space:pre-wrap">${escapeHtml(body)}</pre>`;
  const messages = [
    env.EMAIL.send({
      to: env.ADMIN_EMAIL,
      from: { email: env.EMAIL_FROM, name: "ZOOMIX Studio" },
      subject: `New Zoomix brief — ${brief.referenceCode}`,
      text: body,
      html,
    }),
  ];
  if (brief.contactPreference === "email" && brief.email) {
    messages.push(env.EMAIL.send({
      to: brief.email,
      from: { email: env.EMAIL_FROM, name: "ZOOMIX" },
      subject: `We received your Zoomix brief — ${brief.referenceCode}`,
      text: `We received your project brief. Reference: ${brief.referenceCode}\n\nWe will review it and follow up with the next move.`,
      html: `<p>We received your project brief.</p><p>Reference: <strong>${escapeHtml(brief.referenceCode)}</strong></p><p>We will review it and follow up with the next move.</p>`,
    }));
  }
  await Promise.all(messages);
  return true;
}

async function createBrief(request, env, ctx) {
  if (!env.DB) return json({ error: "Brief storage is not configured yet." }, 503);
  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }
  const brief = briefFromPayload(payload, referenceCode());
  const validationError = validateBrief(brief, payload);
  if (validationError) return json({ error: validationError }, 400);

  await env.DB.prepare(`
    INSERT INTO brief_requests (
      reference_code, name, project, phone, email, contact_preference, preferred_time,
      activity, service, route, offer_id, offer_name, show_type, content_source,
      event_type, event_date, event_location, coverage_type, stage, budget,
      launch_timeline, source, project_link, goal, description, consent, status,
      notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    brief.referenceCode, brief.name, brief.project, brief.phone, brief.email, brief.contactPreference, brief.preferredTime,
    brief.activity, brief.service, brief.route, brief.offerId, brief.offerName, brief.showType, brief.contentSource,
    brief.eventType, brief.eventDate, brief.eventLocation, brief.coverageType, brief.stage, brief.budget,
    brief.launchTimeline, brief.source, brief.projectLink, brief.goal, brief.description, brief.consent, brief.status,
    brief.notes, brief.createdAt, brief.createdAt,
  ).run();

  if (brief.contactPreference === "email") {
    ctx.waitUntil(sendBriefEmails(brief, env).catch((error) => console.error("Zoomix email notification failed", error)));
  } else if (env.EMAIL && env.EMAIL_FROM && env.ADMIN_EMAIL) {
    ctx.waitUntil(sendBriefEmails(brief, env).catch((error) => console.error("Zoomix email notification failed", error)));
  }

  return json({ ok: true, referenceCode: brief.referenceCode }, 201);
}

async function authenticateStudio(request, env) {
  if (!env.DB || !env.STUDIO_PASSWORD) return { ok: false, status: 503, error: "Studio access is not configured yet." };
  const token = cookieValue(request, "zoomix_studio");
  if (!token) return { ok: false, status: 401, error: "Studio login required." };
  const tokenHash = await sha256(token);
  const session = await env.DB.prepare("SELECT token_hash FROM studio_sessions WHERE token_hash = ? AND expires_at > ? LIMIT 1").bind(tokenHash, now()).first();
  return session ? { ok: true } : { ok: false, status: 401, error: "Studio login required." };
}

async function studioLogin(request, env) {
  if (!env.DB || !env.STUDIO_PASSWORD) return json({ error: "Studio access is not configured yet." }, 503);
  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }
  const passwordHash = await sha256(text(payload.password, 200));
  const expectedHash = await sha256(env.STUDIO_PASSWORD);
  if (passwordHash !== expectedHash) return json({ error: "Incorrect studio password." }, 401);

  const token = `${crypto.randomUUID()}.${crypto.randomUUID()}`;
  const tokenHash = await sha256(token);
  const createdAt = now();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await env.DB.prepare("DELETE FROM studio_sessions WHERE expires_at <= ?").bind(createdAt).run();
  await env.DB.prepare("INSERT INTO studio_sessions (token_hash, created_at, expires_at) VALUES (?, ?, ?)").bind(tokenHash, createdAt, expiresAt).run();
  return json({ ok: true }, 200, { "Set-Cookie": sessionCookie(token, request) });
}

async function studioLogout(request, env) {
  if (env.DB) {
    const token = cookieValue(request, "zoomix_studio");
    if (token) await env.DB.prepare("DELETE FROM studio_sessions WHERE token_hash = ?").bind(await sha256(token)).run();
  }
  return json({ ok: true }, 200, { "Set-Cookie": clearSessionCookie(request) });
}

async function studioRequests(request, env) {
  const auth = await authenticateStudio(request, env);
  if (!auth.ok) return json({ error: auth.error }, auth.status);
  const url = new URL(request.url);
  const status = text(url.searchParams.get("status"), 30);
  const search = text(url.searchParams.get("q"), 120);
  const conditions = [];
  const params = [];
  if (STATUS_VALUES.has(status)) {
    conditions.push("status = ?");
    params.push(status);
  }
  if (search) {
    conditions.push("(reference_code LIKE ? OR name LIKE ? OR project LIKE ? OR phone LIKE ? OR email LIKE ? OR service LIKE ?)");
    const query = `%${search}%`;
    params.push(query, query, query, query, query, query);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const result = await env.DB.prepare(`SELECT * FROM brief_requests ${where} ORDER BY created_at DESC LIMIT 200`).bind(...params).all();
  return json({ requests: result.results || [] });
}

async function studioRequestUpdate(request, env, id) {
  const auth = await authenticateStudio(request, env);
  if (!auth.ok) return json({ error: auth.error }, auth.status);
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) return json({ error: "Invalid request id." }, 400);
  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }
  const status = text(payload.status, 30);
  if (!STATUS_VALUES.has(status)) return json({ error: "Invalid request status." }, 400);
  const updatedAt = now();
  await env.DB.prepare("UPDATE brief_requests SET status = ?, updated_at = ? WHERE id = ?").bind(status, updatedAt, numericId).run();
  const updated = await env.DB.prepare("SELECT * FROM brief_requests WHERE id = ? LIMIT 1").bind(numericId).first();
  if (!updated) return json({ error: "Request not found." }, 404);
  return json({ request: updated });
}

async function api(request, env, ctx) {
  const url = new URL(request.url);
  if (request.method === "OPTIONS") return new Response(null, { status: 204 });
  if (request.method === "POST" && url.pathname === "/api/briefs") return createBrief(request, env, ctx);
  if (request.method === "POST" && url.pathname === "/api/studio/login") return studioLogin(request, env);
  if (request.method === "POST" && url.pathname === "/api/studio/logout") return studioLogout(request, env);
  if (request.method === "GET" && url.pathname === "/api/studio/requests") return studioRequests(request, env);
  const updateMatch = url.pathname.match(/^\/api\/studio\/requests\/(\d+)$/);
  if (request.method === "PATCH" && updateMatch) return studioRequestUpdate(request, env, updateMatch[1]);
  return json({ error: "Not found." }, 404);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) return api(request, env, ctx);
    const asset = await env.ASSETS.fetch(request);
    if (asset.status !== 404 || request.method !== "GET" || url.pathname.includes(".")) return asset;
    return env.ASSETS.fetch(new Request(new URL("/index.html", request.url), request));
  },
};
