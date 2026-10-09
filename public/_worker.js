import { calculateCommercial, promotionError } from "./commercial-rules.js";
import { businessOperations, quoteCommercialTerms, instalments, limitedJson } from "./business-operations.js";
import { DurableObject } from "cloudflare:workers";

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=UTF-8",
  "Cache-Control": "no-store",
};

const STATUS_VALUES = new Set(["new", "contacted", "in-progress", "won", "archived"]);
const CONTACT_VALUES = new Set(["whatsapp", "call", "email"]);
const ANALYTICS_EVENTS = new Set([
  "analytics_consent",
  "start_project",
  "view_work",
  "open_project",
  "choose_package",
  "start_brief",
  "validation_error",
  "send_to_whatsapp",
  "brief_submitted",
  "language_change",
  "reach_project_brief",
  "route_finder_start",
  "route_finder_answer",
  "route_finder_recommendation",
]);
const STUDIO_EVENTS_ROOM = "studio-live";
const EDIT_LINK_TTL_DAYS = 30;
const CATALOG_TYPES = new Set(["package", "service", "addon", "expense"]);
const CATALOG_STATUSES = new Set(["draft", "published", "archived"]);

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

function editToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function editUrl(request, token) {
  const url = new URL(request.url);
  url.pathname = `/brief/edit/${token}`;
  url.search = "";
  url.hash = "";
  return url.toString();
}

function editableBrief(row) {
  return {
    referenceCode: row.reference_code,
    name: row.name || "",
    project: row.project || "",
    phone: row.phone || "",
    email: row.email || "",
    contactPreference: row.contact_preference || "",
    preferredTime: row.preferred_time || "",
    activity: row.activity || "",
    service: row.service || "",
    route: row.route || "",
    offerId: row.offer_id || "",
    offerName: row.offer_name || "",
    showType: row.show_type || "",
    contentSource: row.content_source || "",
    eventType: row.event_type || "",
    eventDate: row.event_date || "",
    eventLocation: row.event_location || "",
    coverageType: row.coverage_type || "",
    stage: row.stage || "",
    budget: row.budget || "",
    launchDate: row.launch_timeline || "",
    source: row.source || "",
    projectLink: row.project_link || "",
    goal: row.goal || "",
    description: row.description || "",
    updatedAt: row.updated_at || row.created_at || "",
    editLinkExpiresAt: row.edit_token_expires_at || "",
  };
}

function editableBriefValues(payload, current) {
  return cleanBriefFields({
    name: text(payload.name ?? current.name, 120),
    project: text(payload.project ?? current.project, 160),
    phone: text(payload.phone ?? current.phone, 40),
    email: text(payload.email ?? current.email, 160).toLowerCase(),
    contactPreference: text(payload.contactPreference ?? current.contact_preference, 30),
    preferredTime: text(payload.preferredTime ?? current.preferred_time, 40),
    activity: text(payload.activity ?? current.activity, 160),
    service: text(payload.service ?? current.service, 80),
    route: text(payload.route ?? current.route, 40),
    offerId: text(payload.offerId ?? current.offer_id, 100),
    offerName: text(payload.offerName ?? current.offer_name, 180),
    showType: text(payload.showType ?? current.show_type, 40),
    contentSource: text(payload.contentSource ?? current.content_source, 50),
    eventType: text(payload.eventType ?? current.event_type, 50),
    eventDate: text(payload.eventDate ?? current.event_date, 40),
    eventLocation: text(payload.eventLocation ?? current.event_location, 180),
    coverageType: text(payload.coverageType ?? current.coverage_type, 50),
    stage: text(payload.stage ?? current.stage, 50),
    budget: text(payload.budget ?? current.budget, 50),
    launchTimeline: text(payload.launchDate ?? current.launch_timeline, 50),
    source: text(payload.source ?? current.source, 50),
    projectLink: text(payload.projectLink ?? current.project_link, 500),
    goal: text(payload.goal ?? payload.description ?? current.goal, 500),
    description: text(payload.description ?? current.description, 5000),
  });
}

function cleanBriefFields(brief) {
  const isShow = brief.route === "show";
  const isEvent = isShow && brief.showType === "events";
  if (!isShow) { brief.showType = ""; brief.contentSource = ""; }
  if (!isEvent) for (const key of ["eventType", "eventDate", "eventLocation", "coverageType"]) brief[key] = "";
  return brief;
}

function briefFromPayload(payload, reference) {
  return cleanBriefFields({
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
  });
}

function validateBrief(brief, payload) {
  if (text(payload.website, 200)) return "Invalid submission.";
  if (!brief.name || !brief.service || !brief.description) return "Please complete the required brief fields.";
  if (!CONTACT_VALUES.has(brief.contactPreference)) return "Choose a contact method.";
  if (["whatsapp", "call"].includes(brief.contactPreference) && !brief.phone) return "A phone number is required for this contact method.";
  if (["whatsapp", "call"].includes(brief.contactPreference) && !/^\+?\d{7,15}$/.test(brief.phone.replace(/[\s().-]/g,""))) return "Enter a valid phone number.";
  if (brief.contactPreference === "email" && !/^\S+@\S+\.\S+$/.test(brief.email)) return "A valid email is required.";
  if (!brief.consent) return "Consent is required before sending.";
  if (brief.route === "show" && !brief.showType) return "Choose a show request type.";
  if (brief.showType === "events" && !brief.eventDate) return "An event date is required.";
  if (brief.showType === "events") {
    const date = new Date(`${brief.eventDate}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(brief.eventDate) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0,10)!==brief.eventDate) return "Enter a valid event date.";
  }
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

function csvCell(value) {
  const normalized = String(value ?? "").replace(/\r?\n/g, " ").trim();
  const safe = /^[=+@-]/.test(normalized) ? `'${normalized}` : normalized;
  return `"${safe.replaceAll('"', '""')}"`;
}

function clientIp(request) {
  return request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() || "";
}

async function enforceBriefRateLimit(request, env) {
  if (!env.DB) return { allowed: true };
  const ip = clientIp(request);
  // Local development and private previews do not always provide a client IP.
  if (!ip) return { allowed: true };

  const userAgent = text(request.headers.get("User-Agent"), 240);
  const fingerprint = await sha256(`${ip}|${userAgent}`);
  const current = new Date();
  const currentIso = current.toISOString();
  const windowMs = 30 * 60 * 1000;
  const expiresAt = new Date(current.getTime() + windowMs).toISOString();
  const row = await env.DB.prepare("SELECT fingerprint, window_started_at, request_count, expires_at FROM brief_rate_limits WHERE fingerprint = ? LIMIT 1").bind(fingerprint).first();

  await env.DB.prepare("DELETE FROM brief_rate_limits WHERE expires_at <= ?").bind(currentIso).run();
  if (!row || row.expires_at <= currentIso) {
    await env.DB.prepare("INSERT OR REPLACE INTO brief_rate_limits (fingerprint, window_started_at, request_count, expires_at) VALUES (?, ?, ?, ?)").bind(fingerprint, currentIso, 1, expiresAt).run();
    return { allowed: true };
  }
  if (Number(row.request_count) >= 5) {
    return { allowed: false, retryAfter: Math.max(1, Math.ceil((new Date(row.expires_at).getTime() - current.getTime()) / 1000)) };
  }
  await env.DB.prepare("UPDATE brief_rate_limits SET request_count = request_count + 1 WHERE fingerprint = ?").bind(fingerprint).run();
  return { allowed: true };
}

async function sendBriefEmails(brief, env) {
  const adminEmail = env.ADMIN_EMAIL || "zoomix.eg@gmail.com";
  if (!env.EMAIL || !env.EMAIL_FROM) return false;
  const body = briefText(brief);
  const html = `<pre style="font-family:Arial,sans-serif;white-space:pre-wrap">${escapeHtml(body)}</pre>`;
  const messages = [
    env.EMAIL.send({
      to: adminEmail,
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

async function notifyStudio(env, event) {
  if (!env.STUDIO_EVENTS) return;
  const stub = env.STUDIO_EVENTS.getByName(STUDIO_EVENTS_ROOM);
  await stub.broadcast(event);
}

async function createBrief(request, env, ctx) {
  if (!env.DB) return json({ error: "Brief storage is not configured yet." }, 503);
  const rateLimit = await enforceBriefRateLimit(request, env);
  if (!rateLimit.allowed) {
    return json({ error: "Too many requests. Please try again in a little while." }, 429, { "Retry-After": String(rateLimit.retryAfter) });
  }
  let payload;
  try {
    payload = await requestObject(request);
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }
  const brief = briefFromPayload(payload, referenceCode());
  const validationError = validateBrief(brief, payload);
  if (validationError) return json({ error: validationError }, 400);
  const rawEditToken = editToken();
  const editTokenHash = await sha256(rawEditToken);
  const editTokenExpiresAt = new Date(Date.now() + EDIT_LINK_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
  let editLinksReady = true;

  try {
    await env.DB.prepare(`
      INSERT INTO brief_requests (
        reference_code, name, project, phone, email, contact_preference, preferred_time,
        activity, service, route, offer_id, offer_name, show_type, content_source,
        event_type, event_date, event_location, coverage_type, stage, budget,
        launch_timeline, source, project_link, goal, description, consent, status,
        notes, created_at, updated_at, edit_token_hash, edit_token_expires_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?
      )
    `).bind(
      brief.referenceCode, brief.name, brief.project, brief.phone, brief.email, brief.contactPreference, brief.preferredTime,
      brief.activity, brief.service, brief.route, brief.offerId, brief.offerName, brief.showType, brief.contentSource,
      brief.eventType, brief.eventDate, brief.eventLocation, brief.coverageType, brief.stage, brief.budget,
      brief.launchTimeline, brief.source, brief.projectLink, brief.goal, brief.description, brief.consent, brief.status,
      brief.notes, brief.createdAt, brief.createdAt, editTokenHash, editTokenExpiresAt,
    ).run();
  } catch (error) {
    const message = String(error?.message || error);
    if (!/edit_token_hash|edit_token_expires_at|no such column/i.test(message)) throw error;
    // Keep submissions working during the short window before migration 0004 is applied.
    editLinksReady = false;
    await env.DB.prepare(`
      INSERT INTO brief_requests (
        reference_code, name, project, phone, email, contact_preference, preferred_time,
        activity, service, route, offer_id, offer_name, show_type, content_source,
        event_type, event_date, event_location, coverage_type, stage, budget,
        launch_timeline, source, project_link, goal, description, consent, status,
        notes, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `).bind(
      brief.referenceCode, brief.name, brief.project, brief.phone, brief.email, brief.contactPreference, brief.preferredTime,
      brief.activity, brief.service, brief.route, brief.offerId, brief.offerName, brief.showType, brief.contentSource,
      brief.eventType, brief.eventDate, brief.eventLocation, brief.coverageType, brief.stage, brief.budget,
      brief.launchTimeline, brief.source, brief.projectLink, brief.goal, brief.description, brief.consent, brief.status,
      brief.notes, brief.createdAt, brief.createdAt,
    ).run();
  }

  if (env.STUDIO_EVENTS) {
    ctx.waitUntil(notifyStudio(env, {
      type: "brief-created",
      referenceCode: brief.referenceCode,
      createdAt: brief.createdAt,
    }).catch((error) => console.error("Zoomix Studio live update failed", error)));
  }

  if (ctx) ctx.waitUntil(notifyTelegram(env, ["ZOOMIX / NEW REQUEST", brief.referenceCode, brief.fullName || brief.name, brief.projectType || brief.service, brief.phone]).catch(() => console.error("Telegram lead notification failed")));
  if (brief.contactPreference === "email") {
    ctx.waitUntil(sendBriefEmails(brief, env).catch((error) => console.error("Zoomix email notification failed", error)));
  } else if (env.EMAIL && env.EMAIL_FROM && env.ADMIN_EMAIL) {
    ctx.waitUntil(sendBriefEmails(brief, env).catch((error) => console.error("Zoomix email notification failed", error)));
  }

  return json({ ok: true, referenceCode: brief.referenceCode, editUrl: editLinksReady ? editUrl(request, rawEditToken) : "" }, 201);
}

async function findEditableBrief(env, token) {
  if (!env.DB) return null;
  const tokenHash = await sha256(token);
  return env.DB.prepare("SELECT * FROM brief_requests WHERE edit_token_hash = ? AND edit_token_expires_at > ? LIMIT 1").bind(tokenHash, now()).first();
}

async function getBriefForEdit(request, env, token) {
  if (!env.DB) return json({ error: "Brief storage is not configured yet." }, 503);
  let brief;
  try {
    brief = await findEditableBrief(env, token);
  } catch (error) {
    console.error("Zoomix brief edit schema is not ready", error);
    return json({ error: "Brief edit links are not enabled yet." }, 503);
  }
  if (!brief) return json({ error: "This edit link is invalid or has expired." }, 404);
  return json({ brief: editableBrief(brief) });
}

async function updateBriefFromEdit(request, env, ctx, token) {
  if (!env.DB) return json({ error: "Brief storage is not configured yet." }, 503);
  let current;
  try {
    current = await findEditableBrief(env, token);
  } catch (error) {
    console.error("Zoomix brief edit schema is not ready", error);
    return json({ error: "Brief edit links are not enabled yet." }, 503);
  }
  if (!current) return json({ error: "This edit link is invalid or has expired." }, 404);

  let payload;
  try {
    payload = await requestObject(request);
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  const values = editableBriefValues(payload, current);
  const brief = {
    ...values,
    referenceCode: current.reference_code,
    consent: 1,
  };
  const validationError = validateBrief(brief, { ...payload, consent: true, website: "" });
  if (validationError) return json({ error: validationError }, 400);

  const updatedAt = now();
  await env.DB.prepare(`
    UPDATE brief_requests SET
      name = ?, project = ?, phone = ?, email = ?, contact_preference = ?, preferred_time = ?,
      activity = ?, service = ?, route = ?, offer_id = ?, offer_name = ?, show_type = ?, content_source = ?,
      event_type = ?, event_date = ?, event_location = ?, coverage_type = ?, stage = ?, budget = ?,
      launch_timeline = ?, source = ?, project_link = ?, goal = ?, description = ?, updated_at = ?
    WHERE id = ?
  `).bind(
    values.name, values.project, values.phone, values.email, values.contactPreference, values.preferredTime,
    values.activity, values.service, values.route, values.offerId, values.offerName, values.showType, values.contentSource,
    values.eventType, values.eventDate, values.eventLocation, values.coverageType, values.stage, values.budget,
    values.launchTimeline, values.source, values.projectLink, values.goal, values.description, updatedAt, current.id,
  ).run();

  const updated = await env.DB.prepare("SELECT * FROM brief_requests WHERE id = ? LIMIT 1").bind(current.id).first();
  if (!updated) return json({ error: "Request not found." }, 404);

  if (env.STUDIO_EVENTS) {
    ctx.waitUntil(notifyStudio(env, {
      type: "brief-updated",
      referenceCode: updated.reference_code,
      updatedAt,
    }).catch((error) => console.error("Zoomix Studio live update failed", error)));
  }

  return json({ ok: true, brief: editableBrief(updated) });
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
    payload = await requestObject(request);
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

async function notifyTelegram(env, lines) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return false;
  const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: lines.filter(Boolean).join("\n"), disable_web_page_preview: true }),
    signal: AbortSignal.timeout(10000),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || result?.ok !== true) throw new Error(`Telegram notification failed (${response.status}).`);
  return true;
}

function quoteReference() {
  const year = new Date().getUTCFullYear();
  const suffix = crypto.randomUUID().replaceAll("-", "").slice(0, 6).toUpperCase();
  return `QT-${year}-${suffix}`;
}

function catalogItem(row) {
  let included = { ar: [], en: [] };
  try { included = JSON.parse(row.included_json || '{"ar":[],"en":[]}'); } catch { included = { ar: [], en: [] }; }
  return {
    id: row.id,
    type: row.item_type,
    category: row.category || "",
    name: { ar: row.name_ar || "", en: row.name_en || "" },
    description: { ar: row.description_ar || "", en: row.description_en || "" },
    price: Number(row.price_minor || 0) / 100,
    cost: Number(row.cost_minor || 0) / 100,
    costPending: row.cost_reviewed === 0,
    costReviewed: row.cost_reviewed !== 0,
    minimumPrice: Number(row.minimum_price_minor || 0) / 100,
    currency: row.currency || "EGP",
    unit: row.unit || "project",
    status: row.status,
    visible: Boolean(row.visible_on_site),
    featured: Boolean(row.featured),
    included: { ar: Array.isArray(included.ar) ? included.ar : [], en: Array.isArray(included.en) ? included.en : [] },
    exclusions: { ar: row.exclusions_ar || "", en: row.exclusions_en || "" },
    duration: { ar: row.duration_ar || "", en: row.duration_en || "" },
    revisions: Number(row.revisions || 0),
    sortOrder: Number(row.sort_order || 0),
    draft: row.status === "draft",
    hasPublishedVersion: Boolean(row.published_snapshot_json),
    publishedPrice: row.published_snapshot_json ? Number((()=>{ const published=JSON.parse(row.published_snapshot_json); return published.price_minor !== undefined ? published.price_minor / 100 : published.price; })()) : null,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
  };
}

async function studioCatalog(request, env) {
  const auth = await authenticateStudio(request, env);
  if (!auth.ok) return json({ error: auth.error }, auth.status);
  const result = await env.DB.prepare("SELECT * FROM commercial_catalog_items ORDER BY sort_order ASC, updated_at DESC").all();
  return json({ items: (result.results || []).map(catalogItem) });
}

async function publicCatalog(env) {
  if (!env.DB) return json({ error: "Catalog storage is not configured." }, 503);
  const result = await env.DB.prepare("SELECT * FROM commercial_catalog_items WHERE published_snapshot_json IS NOT NULL AND status != 'archived' ORDER BY sort_order ASC").all();
  const items=(result.results || []).map(row => {
    const snapshot = JSON.parse(row.published_snapshot_json);
    const item = snapshot.name ? snapshot : catalogItem(snapshot);
    return { id:item.id,type:item.type,category:item.category,name:item.name,description:item.description,price:item.price,currency:item.currency,unit:item.unit,visible:item.visible,featured:item.featured,included:item.included,exclusions:item.exclusions,duration:item.duration,revisions:item.revisions,sortOrder:item.sortOrder,updatedAt:item.updatedAt };
  });
  const archived=(await env.DB.prepare("SELECT id FROM commercial_catalog_items WHERE status='archived' AND visible_on_site=1").all()).results||[];
  return json({items:items.filter(item=>item.visible),unavailableIds:[...new Set([...items.filter(item=>!item.visible).map(item=>item.id),...archived.map(item=>item.id)])]});
}

async function studioCatalogCreate(request, env) {
  const auth = await authenticateStudio(request, env);
  if (!auth.ok) return json({ error: auth.error }, auth.status);
  let payload;
  try {
    payload = await requestObject(request);
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  const id = text(payload.id, 80).toLowerCase();
  const type = text(payload.type || "service", 30);
  const nameAr = text(payload.name?.ar, 180);
  const nameEn = text(payload.name?.en, 180);
  if (!/^[a-z0-9][a-z0-9-]{1,79}$/.test(id) || !CATALOG_TYPES.has(type) || !nameAr || !nameEn) {
    return json({ error: "A valid id, type and Arabic/English names are required." }, 400);
  }
  const exists = await env.DB.prepare("SELECT id FROM commercial_catalog_items WHERE id = ? LIMIT 1").bind(id).first();
  if (exists) return json({ error: "Catalog item id already exists." }, 409);

  const numericMinor = (value) => {
    const numeric = Number(value || 0);
    return Number.isFinite(numeric) && numeric >= 0 ? Math.round(numeric * 100) : null;
  };
  const priceMinor = numericMinor(payload.price);
  const costMinor = numericMinor(payload.cost);
  const minimumPriceMinor = numericMinor(payload.minimumPrice);
  if ([priceMinor, costMinor, minimumPriceMinor].some((value) => value === null)) return json({ error: "Prices must be positive numbers." }, 400);

  const createdAt = now();
  const row = {
    id,
    item_type: type,
    category: text(payload.category, 80),
    name_ar: nameAr,
    name_en: nameEn,
    description_ar: text(payload.description?.ar, 2000),
    description_en: text(payload.description?.en, 2000),
    price_minor: priceMinor,
    cost_minor: costMinor,
    minimum_price_minor: minimumPriceMinor,
    currency: "EGP",
    unit: text(payload.unit, 50) || "project",
    status: "draft",
    visible_on_site: payload.visible ? 1 : 0,
    featured: payload.featured ? 1 : 0,
    included_json: JSON.stringify({ ar: Array.isArray(payload.included?.ar) ? payload.included.ar.map((value) => text(value, 300)).filter(Boolean).slice(0, 50) : [], en: Array.isArray(payload.included?.en) ? payload.included.en.map((value) => text(value, 300)).filter(Boolean).slice(0, 50) : [] }),
    exclusions_ar: text(payload.exclusions?.ar, 2000),
    exclusions_en: text(payload.exclusions?.en, 2000),
    duration_ar: text(payload.duration?.ar, 120),
    duration_en: text(payload.duration?.en, 120),
    revisions: Math.max(0, Math.min(100, Math.round(Number(payload.revisions || 0)))),
    sort_order: Number.isFinite(Number(payload.sortOrder)) ? Math.round(Number(payload.sortOrder)) : 999,
    created_at: createdAt,
    updated_at: createdAt,
    published_at: null,
  };
  const snapshot = JSON.stringify(catalogItem(row));
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO commercial_catalog_items (id, item_type, category, name_ar, name_en, description_ar, description_en, price_minor, cost_minor, minimum_price_minor, currency, unit, status, visible_on_site, featured, sort_order, included_json, exclusions_ar, exclusions_en, duration_ar, duration_en, revisions, created_at, updated_at, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'EGP', ?, 'draft', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`).bind(id, type, row.category, nameAr, nameEn, row.description_ar, row.description_en, priceMinor, costMinor, minimumPriceMinor, row.unit, row.visible_on_site, row.featured, row.sort_order, row.included_json, row.exclusions_ar, row.exclusions_en, row.duration_ar, row.duration_en, row.revisions, createdAt, createdAt),
    env.DB.prepare("INSERT INTO commercial_catalog_versions (catalog_item_id, version_number, snapshot_json, change_type, created_at) VALUES (?, 1, ?, 'created', ?)").bind(id, snapshot, createdAt),
    env.DB.prepare("INSERT INTO commercial_audit_log (entity_type, entity_id, action, before_json, after_json, created_at) VALUES ('catalog_item', ?, 'created', NULL, ?, ?)").bind(id, snapshot, createdAt),
  ]);
  return json({ item: catalogItem(row), version: 1 }, 201);
}

async function studioCatalogUpdate(request, env, id) {
  const auth = await authenticateStudio(request, env);
  if (!auth.ok) return json({ error: auth.error }, auth.status);
  if (!/^[a-z0-9][a-z0-9-]{1,79}$/i.test(id)) return json({ error: "Invalid catalog item id." }, 400);

  let payload;
  try {
    payload = await requestObject(request);
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  const current = await env.DB.prepare("SELECT * FROM commercial_catalog_items WHERE id = ? LIMIT 1").bind(id).first();
  if (!current) return json({ error: "Catalog item not found." }, 404);
  if((payload.publish===true || payload.status==='published') && !(payload.costReviewed===undefined ? current.cost_reviewed : payload.costReviewed===true))return json({error:'Review and confirm the internal cost before publication.'},400);

  const type = text(payload.type ?? current.item_type, 30);
  const requestedStatus = text(payload.status ?? current.status, 30);
  const status = payload.publish === true ? "published" : requestedStatus;
  const nameAr = text(payload.name?.ar ?? current.name_ar, 180);
  const nameEn = text(payload.name?.en ?? current.name_en, 180);
  if (!CATALOG_TYPES.has(type) || !CATALOG_STATUSES.has(status) || !nameAr || !nameEn) {
    return json({ error: "Invalid catalog item data." }, 400);
  }

  const toMinor = (value, fallback) => {
    if (value === undefined) return Number(fallback || 0);
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric >= 0 ? Math.round(numeric * 100) : null;
  };
  const priceMinor = toMinor(payload.price, current.price_minor);
  const costMinor = toMinor(payload.cost, current.cost_minor);
  const minimumPriceMinor = toMinor(payload.minimumPrice, current.minimum_price_minor);
  if ([priceMinor, costMinor, minimumPriceMinor].some((value) => value === null)) return json({ error: "Prices must be positive numbers." }, 400);

  const updatedAt = now();
  const next = {
    id,
    cost_reviewed: payload.costReviewed===undefined ? current.cost_reviewed : payload.costReviewed===true ? 1 : 0,
    item_type: type,
    category: text(payload.category ?? current.category, 80),
    name_ar: nameAr,
    name_en: nameEn,
    description_ar: text(payload.description?.ar ?? current.description_ar, 2000),
    description_en: text(payload.description?.en ?? current.description_en, 2000),
    price_minor: priceMinor,
    cost_minor: costMinor,
    minimum_price_minor: minimumPriceMinor,
    currency: "EGP",
    unit: text(payload.unit ?? current.unit, 50) || "project",
    status,
    visible_on_site: payload.visible === undefined ? Number(current.visible_on_site) : (payload.visible ? 1 : 0),
    featured: payload.featured === undefined ? Number(current.featured) : (payload.featured ? 1 : 0),
    included_json: JSON.stringify({ ar: Array.isArray(payload.included?.ar) ? payload.included.ar.map((value) => text(value, 300)).filter(Boolean).slice(0, 50) : (catalogItem(current).included.ar), en: Array.isArray(payload.included?.en) ? payload.included.en.map((value) => text(value, 300)).filter(Boolean).slice(0, 50) : (catalogItem(current).included.en) }),
    exclusions_ar: text(payload.exclusions?.ar ?? current.exclusions_ar, 2000),
    exclusions_en: text(payload.exclusions?.en ?? current.exclusions_en, 2000),
    duration_ar: text(payload.duration?.ar ?? current.duration_ar, 120),
    duration_en: text(payload.duration?.en ?? current.duration_en, 120),
    revisions: payload.revisions === undefined ? Number(current.revisions || 0) : Math.max(0, Math.min(100, Math.round(Number(payload.revisions || 0)))),
    sort_order: Number.isFinite(Number(payload.sortOrder)) ? Math.round(Number(payload.sortOrder)) : Number(current.sort_order || 0),
    updated_at: updatedAt,
    published_at: status === "published" ? updatedAt : current.published_at,
  };
  const version = await env.DB.prepare("SELECT COALESCE(MAX(version_number), 0) + 1 AS next_version FROM commercial_catalog_versions WHERE catalog_item_id = ?").bind(id).first();
  next.published_snapshot_json = status === 'published' ? JSON.stringify({...next,published_snapshot_json:undefined}) : status === 'archived' ? null : current.published_snapshot_json;
  const snapshot = JSON.stringify(catalogItem(next));
  const changeType = status === "published" ? "published" : status === "archived" ? "archived" : "draft_saved";

  await env.DB.batch([
    env.DB.prepare('UPDATE commercial_catalog_items SET cost_reviewed=? WHERE id=?').bind(next.cost_reviewed,id),
    env.DB.prepare("UPDATE commercial_catalog_items SET published_snapshot_json = ? WHERE id = ?").bind(next.published_snapshot_json, id),
    env.DB.prepare(`UPDATE commercial_catalog_items SET item_type = ?, category = ?, name_ar = ?, name_en = ?, description_ar = ?, description_en = ?, price_minor = ?, cost_minor = ?, minimum_price_minor = ?, unit = ?, status = ?, visible_on_site = ?, featured = ?, sort_order = ?, included_json = ?, exclusions_ar = ?, exclusions_en = ?, duration_ar = ?, duration_en = ?, revisions = ?, updated_at = ?, published_at = ? WHERE id = ?`).bind(type, next.category, nameAr, nameEn, next.description_ar, next.description_en, priceMinor, costMinor, minimumPriceMinor, next.unit, status, next.visible_on_site, next.featured, next.sort_order, next.included_json, next.exclusions_ar, next.exclusions_en, next.duration_ar, next.duration_en, next.revisions, updatedAt, next.published_at, id),
    env.DB.prepare("INSERT INTO commercial_catalog_versions (catalog_item_id, version_number, snapshot_json, change_type, created_at) VALUES (?, ?, ?, ?, ?)").bind(id, Number(version?.next_version || 1), snapshot, changeType, updatedAt),
    env.DB.prepare("INSERT INTO commercial_audit_log (entity_type, entity_id, action, before_json, after_json, created_at) VALUES ('catalog_item', ?, ?, ?, ?, ?)").bind(id, changeType, JSON.stringify(catalogItem(current)), snapshot, updatedAt),
  ]);

  return json({ item: catalogItem(next), version: Number(version?.next_version || 1) });
}

function quoteItemFromPayload(item, index) {
  if (!item || typeof item !== "object" || item.costPending || item.cost === null) return null;
  const quantity = Number(item.quantity ?? 1);
  const unitPrice = Number(item.unitPrice ?? 0);
  const cost = Number(item.cost ?? 0);
  const itemDiscount = Number(item.discount ?? 0);
  if (![quantity, unitPrice, cost, itemDiscount].every((value) => Number.isFinite(value) && value >= 0)) return null;
  if (quantity <= 0 || quantity > 10000) return null;
  const toMinor = (value) => Math.round(value * 100);
  return {
    catalogItemId: text(item.catalogId, 80) || null,
    category: text(item.category, 80),
    sortOrder: index,
    nameAr: text(item.name?.ar, 180),
    nameEn: text(item.name?.en, 180),
    descriptionAr: text(item.description?.ar, 2000),
    descriptionEn: text(item.description?.en, 2000),
    quantity,
    unitPriceMinor: toMinor(unitPrice),
    costMinor: toMinor(cost),
    discountMinor: toMinor(itemDiscount),
    optional: item.optional ? 1 : 0,
  };
}

function quoteCalculation(items, payload) {
  const subtotalMinor = items.reduce((sum, item) => sum + Math.max(0, Math.round(item.unitPriceMinor * item.quantity) - item.discountMinor), 0);
  const internalCostMinor = items.reduce((sum, item) => sum + Math.round(item.costMinor * item.quantity), 0);
  const discountMinor = Math.min(subtotalMinor, Math.max(0, Math.round(Number(payload.discount || 0) * 100)));
  const taxPercent = Math.min(100, Math.max(0, Number(payload.taxPercent || 0)));
  const taxMinor = Math.round((subtotalMinor - discountMinor) * (taxPercent / 100));
  return { subtotalMinor, discountMinor, taxMinor, totalMinor: subtotalMinor - discountMinor + taxMinor, internalCostMinor, taxPercent };
}

function promotionItem(row) {
  let scope = {};
  try { scope = JSON.parse(row.scope_json || "{}"); } catch { scope = {}; }
  return {
    id: row.id,
    code: row.code,
    kind: row.promotion_type === "free_item" ? "free-item" : row.promotion_type,
    value: row.promotion_type === "percentage" ? Number(row.percentage_value || 0) : Number(row.value_minor || 0) / 100,
    description: { ar: scope.descriptionAr || "", en: scope.descriptionEn || "" },
    scope: scope.scope || "all",
    catalogIds: scope.catalogIds || [],
    freeItemId: scope.freeItemId || null,
    access: scope.access || "private",
    status: row.ends_at && row.ends_at < now() ? 'expired' : row.status === 'scheduled' && (!row.starts_at || row.starts_at <= now()) ? 'active' : row.status,
    uses: Number(row.usage_count || 0),
    limit: row.usage_limit === null ? null : Number(row.usage_limit),
    startsAt: row.starts_at,
    endsAt: row.ends_at,
  };
}

async function resolvePromotion(env, code, items) {
  if (!code) return { discountMinor:0, promotion:null, allocations:items.map(()=>0) };
  const row = await env.DB.prepare("SELECT * FROM commercial_promotions WHERE code = ? LIMIT 1").bind(text(code,80).toUpperCase()).first();
  const promotion = row ? promotionItem(row) : null;
  const error = promotionError(promotion);
  if(error) return {error};
  const ids = [...new Set(items.map(item=>item.catalogItemId).filter(Boolean))];
  const categories = {};
  for(const id of ids) { const item = await env.DB.prepare("SELECT category FROM commercial_catalog_items WHERE id = ?").bind(id).first(); categories[id] = item?.category; }
  const lines = items.map(item=>({catalogId:item.catalogItemId, category:item.catalogItemId ? categories[item.catalogItemId] : item.category, unitPrice:item.unitPriceMinor/100,quantity:item.quantity,discount:item.discountMinor/100}));
  const calculation = calculateCommercial(lines,promotion);
  if (!calculation.discountMinor) return {error:"Promotion does not apply to these items. Add the eligible package/free item first."};
  return { ...calculation, promotion };
}

async function studioPromotions(request, env) {
  const auth = await authenticateStudio(request, env);
  if (!auth.ok) return json({ error: auth.error }, auth.status);
  const result = await env.DB.prepare("SELECT * FROM commercial_promotions ORDER BY updated_at DESC").all();
  return json({ promotions: (result.results || []).map(promotionItem) });
}

async function studioIntegrations(request, env) {
  const auth = await authenticateStudio(request, env);
  if (!auth.ok) return json({ error: auth.error }, auth.status);
  return json({ telegram: { configured: Boolean(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) } });
}

async function studioAudit(request, env) {
  const auth = await authenticateStudio(request, env); if (!auth.ok) return json({ error: auth.error }, auth.status);
  const result = await env.DB.prepare("SELECT entity_type, entity_id, action, created_at FROM commercial_audit_log ORDER BY created_at DESC LIMIT 50").all();
  return json({ entries: (result.results || []).map((item) => ({ entity: item.entity_type, entityId: item.entity_id, action: item.action, at: item.created_at })) });
}

async function studioTelegramTest(request, env) {
  const auth = await authenticateStudio(request, env);
  if (!auth.ok) return json({ error: auth.error }, auth.status);
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return json({ error: "Telegram secrets are not configured." }, 409);
  await notifyTelegram(env, ["ZOOMIX / TELEGRAM TEST", "Studio notifications are connected successfully.", now()]);
  return json({ ok: true });
}

async function studioPromotionCreate(request, env) {
  const auth = await authenticateStudio(request, env);
  if (!auth.ok) return json({ error: auth.error }, auth.status);
  let payload;
  try { payload = await requestObject(request); } catch { return json({ error: "Invalid request body." }, 400); }
  const code = text(payload.code, 80).toUpperCase();
  const kind = payload.kind === "free-item" ? "free_item" : payload.kind;
  const value = Number(payload.value || 0);
  const limit = Number(payload.limit);
  if (!/^[A-Z0-9][A-Z0-9_-]{2,79}$/.test(code) || !["percentage", "fixed", "free_item"].includes(kind) || !Number.isFinite(value) || value <= 0 || !Number.isInteger(limit) || limit <= 0) return json({ error: "Invalid promotion data." }, 400);
  if (kind === "percentage" && value > 80) return json({ error: "Percentage discount cannot exceed 80%." }, 400);
  if((payload.startsAt && !Number.isFinite(Date.parse(payload.startsAt))) || (payload.endsAt && !Number.isFinite(Date.parse(payload.endsAt)))) return json({error:'Invalid promotion date.'},400);
  const startsAt = payload.startsAt ? new Date(payload.startsAt).toISOString() : now();
  const endsAt = payload.endsAt ? new Date(String(payload.endsAt).includes('T') ? payload.endsAt : `${payload.endsAt}T23:59:59.999Z`).toISOString() : null;
  if (endsAt && endsAt <= startsAt) return json({ error: "End date must be after the start date." }, 400);
  const createdAt = now();
  const id = `${code.toLowerCase().replaceAll("_", "-")}-${crypto.randomUUID().slice(0, 6)}`;
  const status = startsAt > createdAt ? "scheduled" : "active";
  const catalogIds = Array.isArray(payload.catalogIds) ? payload.catalogIds.map(id=>text(id,80)).filter(Boolean).slice(0,100) : [];
  const freeItemId = text(payload.freeItemId,80);
  if (payload.scope === "selected" && !catalogIds.length) return json({error:"Select at least one eligible catalog item."},400);
  if (kind === "free_item" && !freeItemId) return json({error:"Select the free catalog item."},400);
  for(const catalogId of catalogIds){if(!await env.DB.prepare('SELECT id FROM commercial_catalog_items WHERE id = ?').bind(catalogId).first())return json({error:'Eligible catalog item does not exist.'},400);}
  if(kind==='free_item'){const item=await env.DB.prepare('SELECT item_type FROM commercial_catalog_items WHERE id = ?').bind(freeItemId).first();if(!item || item.item_type!=='addon')return json({error:'The free item must be a catalog addon.'},400);}
  if (!["all","foundation","content","events","operations","production","digital","partnership","selected"].includes(payload.scope || "all")) return json({error:"Invalid promotion scope."},400);
  const scopeJson = JSON.stringify({ catalogIds, freeItemId, descriptionAr: text(payload.description?.ar, 500), descriptionEn: text(payload.description?.en, 500), scope: text(payload.scope, 100) || "all", access: text(payload.access, 50) || "private" });
  try {
    await env.DB.batch([
      env.DB.prepare(`INSERT INTO commercial_promotions (id, code, promotion_type, value_minor, percentage_value, scope_json, usage_limit, usage_count, starts_at, ends_at, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?)`).bind(id, code, kind, kind === "percentage" ? 0 : Math.round(value * 100), kind === "percentage" ? value : 0, scopeJson, limit, startsAt, endsAt, status, createdAt, createdAt),
      env.DB.prepare("INSERT INTO commercial_audit_log (entity_type, entity_id, action, after_json, created_at) VALUES ('promotion', ?, 'created', ?, ?)").bind(id, JSON.stringify({ code, kind, value, status }), createdAt),
    ]);
  } catch (error) {
    if (String(error).toLowerCase().includes("unique")) return json({ error: "Promotion code already exists." }, 409);
    throw error;
  }
  const row = await env.DB.prepare("SELECT * FROM commercial_promotions WHERE id = ?").bind(id).first();
  return json({ promotion: promotionItem(row) }, 201);
}

async function studioPromotionUpdate(request, env, id) {
  const auth = await authenticateStudio(request, env);
  if (!auth.ok) return json({ error: auth.error }, auth.status);
  const current = await env.DB.prepare("SELECT * FROM commercial_promotions WHERE id = ? LIMIT 1").bind(id).first();
  if (!current) return json({ error: "Promotion not found." }, 404);
  let payload;
  try { payload = await requestObject(request); } catch { return json({ error: "Invalid request body." }, 400); }
  const status = text(payload.status ?? current.status, 30);
  if (!["draft", "scheduled", "active", "paused", "expired", "archived"].includes(status)) return json({ error: "Invalid promotion status." }, 400);
  const updatedAt = now();
  await env.DB.batch([
    env.DB.prepare("UPDATE commercial_promotions SET status = ?, updated_at = ? WHERE id = ?").bind(status, updatedAt, id),
    env.DB.prepare("INSERT INTO commercial_audit_log (entity_type, entity_id, action, before_json, after_json, created_at) VALUES ('promotion', ?, 'status_changed', ?, ?, ?)").bind(id, JSON.stringify({ status: current.status }), JSON.stringify({ status }), updatedAt),
  ]);
  const updated = await env.DB.prepare("SELECT * FROM commercial_promotions WHERE id = ?").bind(id).first();
  return json({ promotion: promotionItem(updated) });
}

async function requestObject(request) {
  const payload = await limitedJson(request);
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("Invalid request body.");
  return payload;
}

function validateQuotePayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return { error: "Invalid request body." };
  if (!text(payload.clientName, 180) || !text(payload.projectName, 180) || !text(payload.timeline, 240)) return { error: "Client, project and duration are required." };
  try { quoteCommercialTerms(payload); } catch(error) { return {error:error.message}; }
  const taxPercent=Number(payload.taxPercent || 0);
  if(!Number.isFinite(taxPercent) || taxPercent < 0 || taxPercent > 100) return {error:'Tax must be between 0 and 100.'};
  if (!Array.isArray(payload.items) || !payload.items.length || payload.items.length > 100) return { error: "A quote must include between 1 and 100 items." };
  const items = payload.items.map(quoteItemFromPayload);
  if (items.some((item) => !item || !item.nameAr || !item.nameEn)) return { error: "Every quote item needs valid names, quantity and prices." };
  const depositPercent = Number(payload.depositPercent || 0);
  const revisions = Number(payload.revisions || 0);
  if (!Number.isFinite(depositPercent) || depositPercent < 0 || depositPercent > 100 || !Number.isInteger(revisions) || revisions < 0 || revisions > 100) {
    return { error: "Invalid deposit percentage or revisions count." };
  }
  return { items, depositPercent, revisions, calculation: quoteCalculation(items, payload) };
}

function quoteVersionStatements(env, reference, versionNumber, payload, normalized) {
  const createdAt = now();
  const terms = JSON.stringify({
    ...quoteCommercialTerms(payload),
    taxPercent: normalized.calculation.taxPercent,
    promoCode: text(payload.promoCode, 80),
    notes: text(payload.notes, 5000),
    promotionId: normalized.promotion?.id || null,
    discountPlan: normalized.calculation.allocations || [],
    itemCategories: normalized.items.map(item => item.category || ""),
  });
  return [
    env.DB.prepare(`INSERT INTO commercial_quote_versions (quote_id, version_number, subtotal_minor, discount_minor, tax_minor, total_minor, internal_cost_minor, deposit_percent, timeline_text, revisions, terms_json, created_at) VALUES ((SELECT id FROM commercial_quotes WHERE reference_code = ?), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(reference, versionNumber, normalized.calculation.subtotalMinor, normalized.calculation.discountMinor, normalized.calculation.taxMinor, normalized.calculation.totalMinor, normalized.calculation.internalCostMinor, normalized.depositPercent, text(payload.timeline, 240), normalized.revisions, terms, createdAt),
    ...normalized.items.map((item) => env.DB.prepare(`INSERT INTO commercial_quote_items (quote_version_id, catalog_item_id, sort_order, name_ar, name_en, description_ar, description_en, quantity, unit_price_minor, cost_minor, discount_minor, optional) VALUES ((SELECT v.id FROM commercial_quote_versions v JOIN commercial_quotes q ON q.id=v.quote_id WHERE q.reference_code=? AND v.version_number=?), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(reference, versionNumber, item.catalogItemId, item.sortOrder, item.nameAr, item.nameEn, item.descriptionAr, item.descriptionEn, item.quantity, item.unitPriceMinor, item.costMinor, item.discountMinor, item.optional)),
  ];
}

function quoteResponse(quote, version, calculation) {
  return {
    isTest: Boolean(quote.is_test),
    id: Number(quote.id),
    reference: quote.reference_code,
    status: quote.status,
    version: Number(version),
    clientName: quote.client_name || "",
    projectName: quote.project_name || "",
    subtotal: calculation.subtotalMinor / 100,
    discount: calculation.discountMinor / 100,
    tax: calculation.taxMinor / 100,
    total: calculation.totalMinor / 100,
    internalCost: calculation.internalCostMinor / 100,
    discountPlan: calculation.allocations || null,
    updatedAt: quote.updated_at,
  };
}

async function studioQuoteCreate(request, env) {
  const auth = await authenticateStudio(request, env);
  if (!auth.ok) return json({ error: auth.error }, auth.status);
  let payload;
  try { payload = await requestObject(request); } catch { return json({ error: "Invalid request body." }, 400); }
  const normalized = validateQuotePayload(payload);
  if (normalized.error) return json({ error: normalized.error }, 400);
  for (const item of normalized.items) if (item.catalogItemId && !await env.DB.prepare("SELECT id FROM commercial_catalog_items WHERE id = ?").bind(item.catalogItemId).first()) return json({ error: "A catalog item no longer exists." }, 400);
  const promotion = await resolvePromotion(env, payload.promoCode, normalized.items);
  if (promotion.error) return json({ error: promotion.error }, 400);
  normalized.promotion = promotion.promotion;
  normalized.calculation.allocations = promotion.allocations;
  normalized.calculation.discountMinor = promotion.discountMinor;
  normalized.calculation.taxMinor = Math.round((normalized.calculation.subtotalMinor - promotion.discountMinor) * (normalized.calculation.taxPercent / 100));
  normalized.calculation.totalMinor = normalized.calculation.subtotalMinor - promotion.discountMinor + normalized.calculation.taxMinor;
  const createdAt = now();
  const reference = quoteReference();
  const briefRequestId = payload.briefRequestId == null || payload.briefRequestId === "" ? null : Number(payload.briefRequestId);
  if (briefRequestId !== null && (!Number.isInteger(briefRequestId) || briefRequestId <= 0)) return json({error:"Invalid linked brief id."},400);
  const linkedBrief = briefRequestId !== null ? await env.DB.prepare("SELECT id,is_test FROM brief_requests WHERE id = ?").bind(briefRequestId).first() : null;
  if (briefRequestId !== null && (!Number.isInteger(briefRequestId) || briefRequestId <= 0 || !linkedBrief)) return json({ error: "The linked brief does not exist." }, 400);
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO commercial_quotes (reference_code, brief_request_id, client_name, project_name, language, is_test, status, current_version, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'draft', 1, ?, ?)`).bind(reference, briefRequestId, text(payload.clientName, 180), text(payload.projectName, 180), payload.language === "en" ? "en" : "ar", linkedBrief?.is_test ? 1 : 0, createdAt, createdAt),
    ...quoteVersionStatements(env, reference, 1, payload, normalized),
    env.DB.prepare("INSERT INTO commercial_audit_log (entity_type, entity_id, action, after_json, created_at) VALUES ('quote', (SELECT CAST(id AS TEXT) FROM commercial_quotes WHERE reference_code=?), 'created', ?, ?)").bind(reference, JSON.stringify({reference,version:1,status:'draft'}), createdAt),
  ]);
  const quote = await env.DB.prepare("SELECT * FROM commercial_quotes WHERE reference_code = ?").bind(reference).first();
  return json({ quote: quoteResponse(quote, 1, normalized.calculation) }, 201);
}

async function studioQuotes(request, env) {
  const auth = await authenticateStudio(request, env);
  if (!auth.ok) return json({ error: auth.error }, auth.status);
  const result = await env.DB.prepare(`
    SELECT q.id, q.is_test, q.reference_code, q.client_name, q.project_name, q.language, q.status, q.current_version, q.expires_at, q.created_at, q.updated_at,
      v.total_minor, v.tax_minor, v.internal_cost_minor,
      (SELECT event_type FROM commercial_quote_events e WHERE e.quote_id = q.id ORDER BY e.created_at DESC, e.id DESC LIMIT 1) AS last_event,
      (SELECT created_at FROM commercial_quote_events e WHERE e.quote_id = q.id ORDER BY e.created_at DESC, e.id DESC LIMIT 1) AS last_event_at
    FROM commercial_quotes q
    LEFT JOIN commercial_quote_versions v ON v.quote_id = q.id AND v.version_number = q.current_version
    ORDER BY q.updated_at DESC
  `).all();
  return json({ quotes: (result.results || []).map((quote) => ({ id: Number(quote.id), isTest: Boolean(quote.is_test), reference: quote.reference_code, clientName: quote.client_name || "", projectName: quote.project_name || "", language: quote.language || "ar", status: quote.expires_at && quote.expires_at < now() && !["draft", "accepted", "cancelled"].includes(quote.status) ? "expired" : quote.status, version: Number(quote.current_version), total: Number(quote.total_minor || 0) / 100, netValue: (Number(quote.total_minor || 0) - Number(quote.tax_minor || 0)) / 100, internalCost: Number(quote.internal_cost_minor || 0) / 100, expiresAt: quote.expires_at, createdAt: quote.created_at, updatedAt: quote.updated_at, lastEvent: quote.last_event || "", lastEventAt: quote.last_event_at || "" })) });
}

async function studioQuoteTestMode(request, env, id) {
  const auth = await authenticateStudio(request, env);
  if (!auth.ok) return json({error:auth.error},auth.status);
  let payload; try { payload = await requestObject(request); } catch { return json({error:"Invalid request body."},400); }
  if(typeof payload.isTest!=="boolean") return json({error:"A boolean test flag is required."},400);
  const quote = await env.DB.prepare("SELECT * FROM commercial_quotes WHERE id=?").bind(id).first();
  if(!quote) return json({error:"Quote not found."},404);
  const at=now();
  await env.DB.batch([
    env.DB.prepare("UPDATE commercial_quotes SET is_test=? WHERE id=?").bind(payload.isTest?1:0,id),
    ...(quote.brief_request_id ? [env.DB.prepare("UPDATE brief_requests SET is_test=? WHERE id=?").bind(payload.isTest?1:0,quote.brief_request_id)] : []),
    env.DB.prepare("INSERT INTO commercial_audit_log (entity_type,entity_id,action,before_json,after_json,created_at) VALUES ('quote',?,'test_mode_changed',?,?,?)").bind(String(id),JSON.stringify({isTest:Boolean(quote.is_test)}),JSON.stringify({isTest:payload.isTest}),at),
  ]);
  return json({ok:true,isTest:payload.isTest});
}

async function studioQuoteDetail(request,env,id) {
 const auth=await authenticateStudio(request,env); if(!auth.ok)return json({error:auth.error},auth.status);
 const quote=await env.DB.prepare("SELECT * FROM commercial_quotes WHERE id = ?").bind(id).first();
 if(!quote)return json({error:"Quote not found."},404);
 const version=await env.DB.prepare("SELECT * FROM commercial_quote_versions WHERE quote_id = ? AND version_number = ?").bind(id,quote.current_version).first();
 if(!version)return json({error:"Quote version not found."},404);
 const rows=await env.DB.prepare("SELECT * FROM commercial_quote_items WHERE quote_version_id = ? ORDER BY sort_order").bind(version.id).all();
 const terms=JSON.parse(version.terms_json || "{}");
 const commercial=quoteCommercialTerms(terms);
 const revision = await env.DB.prepare("SELECT message,created_at FROM commercial_quote_events WHERE quote_id=? AND event_type='revision_requested' ORDER BY id DESC LIMIT 1").bind(id).first();
 const rejection = await env.DB.prepare('SELECT reason,created_at FROM commercial_quote_rejections WHERE quote_id=?').bind(id).first();
 return json({draft:{commercial,rejection,revisionRequest:revision || null,briefRequestId:quote.brief_request_id,clientName:quote.client_name,projectName:quote.project_name,items:(rows.results||[]).map((item,index)=>({rowId:`saved-${item.id}`,catalogId:item.catalog_item_id,category:terms.itemCategories?.[index] || "",name:{ar:item.name_ar,en:item.name_en},description:{ar:item.description_ar,en:item.description_en},quantity:item.quantity,unitPrice:item.unit_price_minor/100,cost:item.cost_minor/100,discount:item.discount_minor/100,optional:Boolean(item.optional)})),taxPercent:terms.taxPercent,depositPercent:version.deposit_percent,duration:version.timeline_text,revisions:version.revisions,promoCode:terms.promoCode,discountPlan:terms.discountPlan||null,record:{id:quote.id,isTest:Boolean(quote.is_test),reference:quote.reference_code,version:quote.current_version,status:quote.status},cloudDirty:false}});
}

async function studioProjects(request, env) {
  const auth = await authenticateStudio(request, env); if (!auth.ok) return json({ error: auth.error }, auth.status);
  const result = await env.DB.prepare(`SELECT p.*, q.is_test, v.terms_json FROM commercial_projects p
    JOIN commercial_quotes q ON q.id=p.quote_id
    LEFT JOIN commercial_quote_events e ON e.id = (SELECT id FROM commercial_quote_events WHERE quote_id = p.quote_id AND event_type = 'accepted' ORDER BY id DESC LIMIT 1)
    LEFT JOIN commercial_quote_versions v ON v.id = e.quote_version_id ORDER BY p.updated_at DESC`).all();
  return json({ projects: (result.results || []).map((item) => {
    const terms = JSON.parse(item.terms_json || "{}");
    const netMinor = Math.round(Number(item.contract_value_minor || 0) / (1 + Number(terms.taxPercent || 0) / 100));
    return { isTest: Boolean(item.is_test), id: Number(item.id), quoteId: Number(item.quote_id), reference: item.reference_code, clientName: item.client_name, projectName: item.project_name, status: item.status, contractValue: Number(item.contract_value_minor || 0) / 100, netContractValue: netMinor / 100, expectedCost: Number(item.expected_cost_minor || 0) / 100, createdAt: item.created_at, updatedAt: item.updated_at };
  }) });
}

async function studioPayments(request, env) {
  const auth = await authenticateStudio(request, env); if (!auth.ok) return json({ error: auth.error }, auth.status);
  const result = await env.DB.prepare("SELECT p.*, q.is_test, j.reference_code, j.client_name, j.project_name FROM commercial_payments p JOIN commercial_projects j ON j.id = p.project_id JOIN commercial_quotes q ON q.id=j.quote_id ORDER BY p.created_at DESC").all();
  return json({ payments: (result.results || []).map((item) => ({ isTest: Boolean(item.is_test), id: Number(item.id), projectId: Number(item.project_id), reference: item.reference_code, clientName: item.client_name, projectName: item.project_name, type: item.payment_type, amount: Number(item.amount_minor || 0) / 100, status: item.status === "pending" && item.due_at && item.due_at < now() ? "overdue" : item.status, dueAt: item.due_at, paidAt: item.paid_at, createdAt: item.created_at })) });
}

async function studioPaymentUpdate(request, env, id) {
  const auth = await authenticateStudio(request, env); if (!auth.ok) return json({ error: auth.error }, auth.status);
  const paymentId = Number(id); if (!Number.isInteger(paymentId)) return json({ error: "Invalid payment id." }, 400);
  let payload; try { payload = await requestObject(request); } catch { return json({ error: "Invalid request body." }, 400); }
  const status = text(payload.status, 30);
  if (!["pending", "paid", "overdue", "cancelled"].includes(status)) return json({ error: "Invalid payment status." }, 400);
  const before = await env.DB.prepare("SELECT * FROM commercial_payments WHERE id=?").bind(paymentId).first();
  if(!before)return json({error:"Payment not found."},404);
  const updatedAt = now();
  await env.DB.batch([
    env.DB.prepare("UPDATE commercial_payments SET status = ?, paid_at = ?, updated_at = ? WHERE id = ?").bind(status, status === "paid" ? updatedAt : null, updatedAt, paymentId),
    env.DB.prepare("INSERT INTO commercial_audit_log (entity_type,entity_id,action,before_json,after_json,created_at) VALUES ('payment',?,'status_changed',?,?,?)").bind(String(paymentId),JSON.stringify({status:before.status}),JSON.stringify({status}),updatedAt),
  ]);
  const item = await env.DB.prepare("SELECT p.*, q.is_test, j.reference_code, j.client_name, j.project_name FROM commercial_payments p JOIN commercial_projects j ON j.id = p.project_id JOIN commercial_quotes q ON q.id=j.quote_id WHERE p.id = ?").bind(paymentId).first();
  if (!item) return json({ error: "Payment not found." }, 404);
  return json({ payment: { isTest: Boolean(item.is_test), id: Number(item.id), projectId: Number(item.project_id), reference: item.reference_code, clientName: item.client_name, projectName: item.project_name, type: item.payment_type, amount: Number(item.amount_minor || 0) / 100, status: item.status === "pending" && item.due_at && item.due_at < now() ? "overdue" : item.status, dueAt: item.due_at, paidAt: item.paid_at, createdAt: item.created_at } });
}

export async function processPaymentReminders(env) {
  if (!env.DB || !env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return { sent: 0, configured: false };
  const current = now();
  const repeatBefore = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const owner = crypto.randomUUID();
  const lock = await env.DB.prepare(`INSERT INTO commercial_job_locks (name, owner, expires_at) VALUES ('payment-reminders', ?, ?)
    ON CONFLICT(name) DO UPDATE SET owner=excluded.owner, expires_at=excluded.expires_at WHERE commercial_job_locks.expires_at <= ?`)
    .bind(owner, new Date(Date.now() + 300000).toISOString(), current).run();
  if (!lock.meta?.changes) return { sent: 0, configured: true, busy: true };
  try {
  const result = await env.DB.prepare(`SELECT p.id, p.amount_minor, p.payment_type, p.due_at, q.is_test, j.reference_code, j.client_name, j.project_name FROM commercial_payments p JOIN commercial_projects j ON j.id = p.project_id JOIN commercial_quotes q ON q.id=j.quote_id WHERE q.is_test=0 AND p.status IN ('pending','overdue') AND p.due_at IS NOT NULL AND p.due_at <= ? AND (p.reminder_sent_at IS NULL OR p.reminder_sent_at < ?) ORDER BY p.due_at ASC LIMIT 50`).bind(current, repeatBefore).all();
  const rows = result.results || [];
  if (!rows.length) return { sent: 0, configured: true };
  for (let start = 0; start < rows.length; start += 10) {
    const group = rows.slice(start, start + 10);
    const lines = ["ZOOMIX / OVERDUE PAYMENTS", ...group.map((item) => `${item.reference_code} · ${String(item.client_name).slice(0, 120)}\n${item.payment_type.toUpperCase()} · ${Number(item.amount_minor) / 100} EGP · due ${String(item.due_at).slice(0, 10)}`)];
    await notifyTelegram(env, lines);
    await env.DB.batch(group.map((item) => env.DB.prepare("UPDATE commercial_payments SET status = 'overdue', reminder_sent_at = ?, updated_at = ? WHERE id = ? AND status IN ('pending','overdue')").bind(current, current, item.id)));
  }
  return { sent: rows.length, configured: true };
  } finally {
    await env.DB.prepare("DELETE FROM commercial_job_locks WHERE name = 'payment-reminders' AND owner = ?").bind(owner).run();
  }
}

async function studioPaymentReminders(request, env) {
  const auth = await authenticateStudio(request, env); if (!auth.ok) return json({ error: auth.error }, auth.status);
  const result = await processPaymentReminders(env);
  if (!result.configured) return json({ error: "Telegram secrets are not configured." }, 409);
  return json({ ok: true, remindersSent: result.sent });
}

async function studioQuoteNewVersion(request, env, id) {
  const auth = await authenticateStudio(request, env);
  if (!auth.ok) return json({ error: auth.error }, auth.status);
  const quoteId = Number(id);
  if (!Number.isInteger(quoteId)) return json({ error: "Invalid quote id." }, 400);
  const quote = await env.DB.prepare("SELECT * FROM commercial_quotes WHERE id = ? LIMIT 1").bind(quoteId).first();
  if (!quote) return json({ error: "Quote not found." }, 404);
  if (quote.status === "accepted") return json({ error: "Accepted quotes cannot be changed. Create a new quote instead." }, 409);
  let payload;
  try { payload = await requestObject(request); } catch { return json({ error: "Invalid request body." }, 400); }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return json({ error: "Invalid request body." }, 400);
  if (Number(payload.baseVersion) !== Number(quote.current_version)) return json({error:'This quote changed elsewhere. Reopen the latest version before saving.'},409);
  const normalized = validateQuotePayload(payload);
  if (normalized.error) return json({ error: normalized.error }, 400);
  for (const item of normalized.items) if (item.catalogItemId && !await env.DB.prepare("SELECT id FROM commercial_catalog_items WHERE id = ?").bind(item.catalogItemId).first()) return json({ error: "A catalog item no longer exists." }, 400);
  const promotion = await resolvePromotion(env, payload.promoCode, normalized.items);
  if (promotion.error) return json({ error: promotion.error }, 400);
  normalized.promotion = promotion.promotion;
  normalized.calculation.allocations = promotion.allocations;
  normalized.calculation.discountMinor = promotion.discountMinor;
  normalized.calculation.taxMinor = Math.round((normalized.calculation.subtotalMinor - promotion.discountMinor) * (normalized.calculation.taxPercent / 100));
  normalized.calculation.totalMinor = normalized.calculation.subtotalMinor - promotion.discountMinor + normalized.calculation.taxMinor;
  const nextVersion = Number(quote.current_version || 0) + 1;
  const updatedAt = now();
  const updated = { ...quote, status:"draft", public_token_hash:null, expires_at:null, client_name: text(payload.clientName, 180), project_name: text(payload.projectName, 180), language: payload.language === "en" ? "en" : "ar", current_version: nextVersion, updated_at: updatedAt };
  try { await env.DB.batch([
    ...quoteVersionStatements(env, quote.reference_code, nextVersion, payload, normalized),
    env.DB.prepare("UPDATE commercial_quotes SET client_name = ?, project_name = ?, language = ?, current_version = ?, updated_at = ?, status = 'draft', public_token_hash = NULL, expires_at = NULL WHERE id = ?").bind(text(payload.clientName, 180), text(payload.projectName, 180), payload.language === "en" ? "en" : "ar", nextVersion, updatedAt, quoteId),
    env.DB.prepare("INSERT INTO commercial_audit_log (entity_type, entity_id, action, before_json, after_json, created_at) VALUES ('quote', ?, 'version_created', ?, ?, ?)").bind(String(quoteId), JSON.stringify({ version: quote.current_version }), JSON.stringify(quoteResponse(updated, nextVersion, normalized.calculation)), updatedAt),
  ]); } catch(error) { if(/UNIQUE|accepted|Quote changed/i.test(String(error))) return json({error:"This quote changed elsewhere. Reopen it before saving."},409); throw error; }
  return json({ quote: quoteResponse(updated, nextVersion, normalized.calculation) });
}

async function studioQuoteSend(request, env, ctx, id) {
  const auth = await authenticateStudio(request, env);
  if (!auth.ok) return json({ error: auth.error }, auth.status);
  const quoteId = Number(id);
  if (!Number.isInteger(quoteId)) return json({ error: "Invalid quote id." }, 400);
  const quote = await env.DB.prepare("SELECT * FROM commercial_quotes WHERE id = ? LIMIT 1").bind(quoteId).first();
  if (!quote) return json({ error: "Quote not found." }, 404);
  if (quote.status === "accepted") return json({ error: "Accepted quotes cannot be sent again." }, 409);
  if(quote.status==='cancelled')return json({error:'Create a new version before sending a declined quote.'},409);
  const pricing=await quotePricingWarnings(env,quote);
  if(pricing.length && quote.pricing_approved_version!==quote.current_version)return json({error:'Pricing approval required: '+pricing.join('; ')},409);
  const token = editToken();
  const tokenHash = await sha256(token);
  const sentAt = now();
  const version = await env.DB.prepare("SELECT id,terms_json FROM commercial_quote_versions WHERE quote_id = ? AND version_number = ? LIMIT 1").bind(quoteId, quote.current_version).first();
  const expiresAt = new Date(Date.now() + (JSON.parse(version?.terms_json || '{}').expiryDays || 14) * 86400000).toISOString();
  if(!version)return json({error:"Quote version not found."},409);
  try { const sent = await env.DB.batch([
    env.DB.prepare("UPDATE commercial_quotes SET status = 'sent', public_token_hash = ?, expires_at = ?, updated_at = ? WHERE id = ? AND current_version=? AND status!='accepted'").bind(tokenHash, expiresAt, sentAt, quoteId,quote.current_version),
    env.DB.prepare("INSERT INTO commercial_quote_events (quote_id, quote_version_id, event_type, created_at) SELECT ?, ?, 'sent', ? WHERE changes()>0").bind(quoteId, version.id, sentAt),
    env.DB.prepare("INSERT INTO commercial_audit_log (entity_type, entity_id, action, before_json, after_json, created_at) SELECT 'quote', ?, 'sent', ?, ?, ? WHERE changes()>0").bind(String(quoteId), JSON.stringify({ status: quote.status }), JSON.stringify({ status: "sent", version: quote.current_version, expiresAt }), sentAt),
  ]);
  if(!sent[0]?.meta?.changes)return json({error:"This quote changed. Reopen the latest version."},409);
  } catch(error) { if(/already accepted|Quote changed/i.test(String(error)))return json({error:"This quote changed. Reopen the latest version."},409);throw error; }
  const url = new URL(request.url);
  url.pathname = `/q/${quote.reference_code}/${token}`;
  url.search = "";
  url.hash = "";
  if (ctx) ctx.waitUntil(notifyTelegram(env, ["ZOOMIX / QUOTE SENT", quote.reference_code, quote.client_name, `Version ${quote.current_version}`, url.toString()]).catch((error) => console.error(error)));
  return json({ ok: true, reference: quote.reference_code, version: quote.current_version, clientUrl: url.toString(), expiresAt });
}

async function quotePricingWarnings(env,quote) {
 const version=await env.DB.prepare('SELECT * FROM commercial_quote_versions WHERE quote_id=? AND version_number=?').bind(quote.id,quote.current_version).first();
 if(!version)return ['Missing quote version'];
 const rows=(await env.DB.prepare('SELECT i.*,c.minimum_price_minor FROM commercial_quote_items i LEFT JOIN commercial_catalog_items c ON c.id=i.catalog_item_id WHERE i.quote_version_id=? ORDER BY i.sort_order').bind(version.id).all()).results||[];
 const terms=JSON.parse(version.terms_json||'{}');const warnings=[];
 for(const row of rows) { const allocation=Number(terms.discountPlan?.[row.sort_order]||0);const net=Math.max(0,Math.round(row.unit_price_minor*row.quantity)-row.discount_minor-allocation);if(net<Number(row.minimum_price_minor||0)*row.quantity)warnings.push(`${row.name_en}: below minimum price`); }
 const discounts=Number(version.discount_minor)+rows.reduce((sum,row)=>sum+Number(row.discount_minor),0);
 const gross=rows.reduce((sum,row)=>sum+Math.round(row.unit_price_minor*row.quantity),0);
 if(gross>0 && discounts/gross>0.2)warnings.push('Total discount exceeds 20%');
 return warnings;
}

async function studioPricingApproval(request,env,id) {
 const auth=await authenticateStudio(request,env);if(!auth.ok)return json({error:auth.error},auth.status);
 let payload;try{payload=await requestObject(request);}catch{return json({error:'Invalid body.'},400);}
 const quote=await env.DB.prepare('SELECT * FROM commercial_quotes WHERE id=?').bind(id).first();
 if(!quote)return json({error:'Quote not found.'},404);
 if(quote.status==='accepted'||Number(payload.baseVersion)!==quote.current_version)return json({error:'Quote changed or accepted.'},409);
 const reason=text(payload.reason,2000);if(!reason)return json({error:'Approval reason required.'},400);
 const at=now();const result=await env.DB.batch([
 env.DB.prepare("UPDATE commercial_quotes SET pricing_approved_version=?,pricing_approval_reason=? WHERE id=? AND current_version=? AND status!='accepted'").bind(quote.current_version,reason,id,quote.current_version),
 env.DB.prepare("INSERT INTO commercial_audit_log(entity_type,entity_id,action,after_json,created_at) SELECT 'quote',?,'pricing_approved',?,? WHERE changes()>0").bind(String(id),JSON.stringify({version:quote.current_version,reason}),at)]);
 return result[0]?.meta?.changes?json({ok:true}):json({error:'Quote changed.'},409);
}

async function studioCatalogHistory(request,env,id) {
 const auth=await authenticateStudio(request,env);if(!auth.ok)return json({error:auth.error},auth.status);
 if(request.method==='GET') {const rows=(await env.DB.prepare('SELECT * FROM commercial_catalog_versions WHERE catalog_item_id=? ORDER BY version_number DESC').bind(id).all()).results||[];return json({versions:rows.map(row=>({...row,snapshot:JSON.parse(row.snapshot_json)}))});}
 let payload;try{payload=await requestObject(request);}catch{return json({error:'Invalid body.'},400);}
 const version=await env.DB.prepare('SELECT * FROM commercial_catalog_versions WHERE catalog_item_id=? AND version_number=?').bind(id,Number(payload.version)).first();
 if(!version)return json({error:'Version not found.'},404);
 const snapshot=JSON.parse(version.snapshot_json);const restored=snapshot.name?snapshot:catalogItem(snapshot);
 const update=new Request(request.url,{method:'PATCH',headers:request.headers,body:JSON.stringify({...restored,status:'draft',publish:false})});
 return studioCatalogUpdate(update,env,id);
}

async function findPublicQuote(env, reference, token) {
  const quote = await env.DB.prepare("SELECT * FROM commercial_quotes WHERE reference_code = ? AND public_token_hash = ? LIMIT 1").bind(reference, await sha256(token)).first();
  if (!quote || !quote.expires_at || quote.expires_at <= now()) return null;
  return quote;
}

async function publicQuote(request, env, ctx, reference, token) {
  if (!env.DB) return json({ error: "Quote storage is not configured." }, 503);
  const quote = await findPublicQuote(env, reference, token);
  if (!quote) return json({ error: "This quote link is invalid or has expired." }, 404);
  const version = await env.DB.prepare("SELECT * FROM commercial_quote_versions WHERE quote_id = ? AND version_number = ? LIMIT 1").bind(quote.id, quote.current_version).first();
  if (!version) return json({ error: "Quote version not found." }, 404);
  const itemResult = await env.DB.prepare("SELECT id, sort_order, name_ar, name_en, description_ar, description_en, quantity, unit_price_minor, discount_minor, optional FROM commercial_quote_items WHERE quote_version_id = ? ORDER BY sort_order ASC").bind(version.id).all();
  const firstView = !["viewed", "revision_requested", "accepted"].includes(quote.status);
  if (firstView) {
    const viewedAt = now();
    const viewed = await env.DB.batch([
      env.DB.prepare("UPDATE commercial_quotes SET status = 'viewed', updated_at = ? WHERE id = ? AND status='sent' AND current_version=?").bind(viewedAt, quote.id, quote.current_version),
      env.DB.prepare("INSERT INTO commercial_quote_events (quote_id, quote_version_id, event_type, created_at) SELECT ?, ?, 'viewed', ? WHERE changes()>0").bind(quote.id, version.id, viewedAt),
    ]);
    const changed = Boolean(viewed[0]?.meta?.changes);
    quote.status = changed ? "viewed" : (await env.DB.prepare("SELECT status FROM commercial_quotes WHERE id=?").bind(quote.id).first())?.status || quote.status;
    if (changed && ctx) ctx.waitUntil(notifyTelegram(env, ["ZOOMIX / QUOTE VIEWED", quote.reference_code, quote.client_name, `Version ${quote.current_version}`]).catch((error) => console.error(error)));
  }
  let terms = {};
  try { terms = JSON.parse(version.terms_json || "{}"); } catch { terms = {}; }
  const acceptance = quote.status === "accepted" ? await env.DB.prepare("SELECT selection_json FROM commercial_quote_events WHERE quote_id=? AND event_type='accepted' ORDER BY id DESC LIMIT 1").bind(quote.id).first() : null;
  let acceptedSelection = [];
  try { acceptedSelection = JSON.parse(acceptance?.selection_json || "{}").selectedOptionalItemIds || []; } catch {}
  return json({
    quote: {
      selectedOptionalItemIds: acceptedSelection,
      reference: quote.reference_code,
      version: Number(quote.current_version),
      status: quote.status,
      clientName: quote.client_name || "",
      projectName: quote.project_name || "",
      language: quote.language || "ar",
      expiresAt: quote.expires_at,
      subtotal: Number(version.subtotal_minor || 0) / 100,
      discount: Number(version.discount_minor || 0) / 100,
      tax: Number(version.tax_minor || 0) / 100,
      total: Number(version.total_minor || 0) / 100,
      depositPercent: Number(version.deposit_percent || 0),
      timeline: version.timeline_text || "",
      revisions: Number(version.revisions || 0),
      taxPercent: Number(terms.taxPercent || 0),
      discountPlan: terms.discountPlan || null,
      conditions: terms.conditions || '',
      exclusions: terms.exclusions || '',
      paymentSchedule: terms.paymentSchedule || [],
      items: (itemResult.results || []).map((item) => ({ id: Number(item.id), sortOrder:Number(item.sort_order), name: { ar: item.name_ar, en: item.name_en }, description: { ar: item.description_ar, en: item.description_en }, quantity: Number(item.quantity), unitPrice: Number(item.unit_price_minor) / 100, discount: Number(item.discount_minor) / 100, optional: Boolean(item.optional) })),
    },
  });
}

async function publicQuoteRespond(request, env, ctx, reference, token) {
 if (!env.DB) return json({error:"Quote storage is not configured."},503);
 const quote=await findPublicQuote(env,reference,token);
 if(!quote)return json({error:"This quote link is invalid or has expired."},404);
 if(quote.status==="accepted")return json({error:"This quote has already been accepted."},409);
 if(quote.status==="cancelled")return json({error:"This quote has been declined."},409);
 let payload; try{payload=await requestObject(request);}catch{return json({error:"Invalid request body."},400);}
 if(!payload || typeof payload!=="object" || Array.isArray(payload))return json({error:"Invalid request body."},400);
 if(payload.action==='reject') {
   const reason=text(payload.message,2000);if(!reason)return json({error:'A rejection reason is required.'},400);
   try { const rejected=await env.DB.batch([
     env.DB.prepare("UPDATE commercial_quotes SET status='cancelled',updated_at=? WHERE id=? AND current_version=? AND status NOT IN ('accepted','cancelled')").bind(now(),quote.id,quote.current_version),
     env.DB.prepare("INSERT INTO commercial_quote_rejections(quote_id,version_number,reason,created_at) SELECT ?,?,?,? WHERE changes()>0 ON CONFLICT(quote_id) DO UPDATE SET version_number=excluded.version_number,reason=excluded.reason,created_at=excluded.created_at").bind(quote.id,quote.current_version,reason,now()),
     env.DB.prepare("INSERT INTO commercial_audit_log(entity_type,entity_id,action,after_json,created_at) SELECT 'quote',?,'client_rejected',?,? WHERE changes()>0").bind(String(quote.id),JSON.stringify({reason,version:quote.current_version}),now()),
   ]);if(!rejected[0]?.meta?.changes)return json({error:'Quote changed. Reload.'},409); }catch{return json({error:'Quote changed. Reload.'},409);}
   if(ctx)ctx.waitUntil(notifyTelegram(env,['ZOOMIX / QUOTE DECLINED',quote.reference_code,reason]).catch(console.error));
   return json({status:'cancelled'});
 }
 const action=payload.action==="accept"?"accepted":payload.action==="revision"?"revision_requested":"";
 if(!action || (action==="accepted" && payload.termsAccepted!==true)) return json({error:"Valid action and acceptance of terms required."},400);
 const version=await env.DB.prepare("SELECT * FROM commercial_quote_versions WHERE quote_id = ? AND version_number = ?").bind(quote.id,quote.current_version).first();
 if(!version)return json({error:"Quote version not found."},404);
 const respondedAt=now(), message=text(payload.message,2000);
 if(action==="revision_requested" && !message)return json({error:"Describe the requested change."},400);
 const ids=Array.isArray(payload.selectedOptionalItemIds)?[...new Set(payload.selectedOptionalItemIds.map(Number).filter(Number.isInteger))].slice(0,100):[];
 const selection=JSON.stringify({selectedOptionalItemIds:ids});
 const statements=[];
 if(action==="accepted") {
   const rows=await env.DB.prepare("SELECT * FROM commercial_quote_items WHERE quote_version_id = ? ORDER BY sort_order").bind(version.id).all();
   if(ids.some(id=>!(rows.results||[]).some(item=>Number(item.id)===id && item.optional)))return json({error:"Invalid optional item selection."},400);
   const items=(rows.results||[]).filter(item=>!item.optional || ids.includes(Number(item.id)));
   const terms=JSON.parse(version.terms_json||"{}");
   const lines=items.map(item=>({sortOrder:item.sort_order,unitPrice:item.unit_price_minor/100,quantity:item.quantity,discount:item.discount_minor/100}));
   let calc=calculateCommercial(lines,null,Number(terms.taxPercent||0),terms.discountPlan || {});
   if(!terms.discountPlan) {const discount=Math.round(calc.subtotalMinor*(Number(version.subtotal_minor)>0?Number(version.discount_minor)/Number(version.subtotal_minor):0));const tax=Math.round((calc.subtotalMinor-discount)*Number(terms.taxPercent||0)/100);calc={...calc,discountMinor:discount,taxMinor:tax,totalMinor:calc.subtotalMinor-discount+tax};}
   const cost=items.reduce((sum,item)=>sum+Math.round(item.cost_minor*item.quantity),0);
   if(terms.promotionId && calc.discountMinor > 0)statements.push(env.DB.prepare("INSERT INTO commercial_promotion_redemptions (quote_id,promotion_id,redeemed_at) VALUES (?,?,?)").bind(quote.id,terms.promotionId,respondedAt));
   statements.push(env.DB.prepare("UPDATE commercial_quotes SET status = 'accepted', updated_at = ? WHERE id = ?").bind(respondedAt,quote.id));
   if(quote.brief_request_id)statements.push(env.DB.prepare("UPDATE brief_requests SET status = 'won', updated_at = ? WHERE id = ?").bind(respondedAt,quote.brief_request_id));
   const projectReference=`PRJ-${new Date().getUTCFullYear()}-${crypto.randomUUID().slice(0,8).toUpperCase()}`;
   statements.push(env.DB.prepare("INSERT INTO commercial_projects (quote_id,reference_code,client_name,project_name,contract_value_minor,expected_cost_minor,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)").bind(quote.id,projectReference,quote.client_name,quote.project_name,calc.totalMinor,cost,respondedAt,respondedAt));
   for(const row of instalments(calc.totalMinor,terms,Number(version.deposit_percent),respondedAt))statements.push(env.DB.prepare("INSERT INTO commercial_payments (project_id,payment_type,amount_minor,status,due_at,label,created_at,updated_at) SELECT id,?,?, 'pending',?,?,?,? FROM commercial_projects WHERE quote_id = ?").bind(row.type,row.amount,row.due,row.label,respondedAt,respondedAt,quote.id));
 } else statements.push(env.DB.prepare("UPDATE commercial_quotes SET status = ?, updated_at = ? WHERE id = ? AND status != 'accepted'").bind(action,respondedAt,quote.id));
 statements.push(env.DB.prepare("INSERT INTO commercial_quote_events (quote_id,quote_version_id,event_type,message,selection_json,created_at) VALUES (?,?,?,?,?,?)").bind(quote.id,version.id,action,message,selection,respondedAt));
 statements.push(env.DB.prepare("INSERT INTO commercial_audit_log (entity_type,entity_id,action,before_json,after_json,created_at) VALUES ('quote',?,?,?,?,?)").bind(String(quote.id),action,JSON.stringify({status:quote.status}),JSON.stringify({status:action,version:quote.current_version}),respondedAt));
 try{await env.DB.batch(statements);}catch(error){if(/Promotion|already accepted|Quote changed|UNIQUE/i.test(String(error)))return json({error:"Quote already accepted or promotion unavailable. Ask Studio for an updated quote."},409);throw error;}
 if(ctx)ctx.waitUntil(notifyTelegram(env,[action==="accepted"?"ZOOMIX / QUOTE ACCEPTED":"ZOOMIX / REVISION REQUESTED",quote.reference_code,quote.client_name,message]).catch(console.error));
 return json({ok:true,status:action,respondedAt});
}

async function studioEvents(request, env) {
  const auth = await authenticateStudio(request, env);
  if (!auth.ok) return json({ error: auth.error }, auth.status);
  if (!env.STUDIO_EVENTS) return json({ error: "Studio live updates are not configured yet." }, 503);
  const stub = env.STUDIO_EVENTS.getByName(STUDIO_EVENTS_ROOM);
  return stub.fetch(new Request("https://zoomix-studio-live/events", {
    method: "GET",
    headers: { Accept: "text/event-stream" },
  }));
}

async function studioInsights(request, env) {
  const auth = await authenticateStudio(request, env);
  if (!auth.ok) return json({ error: auth.error }, auth.status);
  const [summary, routes, services, sources, contacts, events] = await Promise.all([
    env.DB.prepare("SELECT COUNT(*) AS total, SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) AS new_count, SUM(CASE WHEN status = 'contacted' THEN 1 ELSE 0 END) AS contacted_count, SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) AS in_progress_count, SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) AS won_count FROM brief_requests WHERE is_test=0").first(),
    env.DB.prepare("SELECT route AS key, COUNT(*) AS count FROM brief_requests WHERE is_test=0 AND route != '' GROUP BY route ORDER BY count DESC").all(),
    env.DB.prepare("SELECT service AS key, COUNT(*) AS count FROM brief_requests WHERE is_test=0 AND service != '' GROUP BY service ORDER BY count DESC LIMIT 8").all(),
    env.DB.prepare("SELECT source AS key, COUNT(*) AS count FROM brief_requests WHERE is_test=0 AND source != '' GROUP BY source ORDER BY count DESC").all(),
    env.DB.prepare("SELECT contact_preference AS key, COUNT(*) AS count FROM brief_requests WHERE is_test=0 AND contact_preference != '' GROUP BY contact_preference ORDER BY count DESC").all(),
    env.DB.prepare("SELECT event_name AS key, COUNT(*) AS count FROM analytics_events WHERE created_at >= datetime('now', '-30 day') GROUP BY event_name ORDER BY count DESC").all(),
  ]);
  return json({
    summary: summary || {},
    routes: routes.results || [],
    services: services.results || [],
    sources: sources.results || [],
    contacts: contacts.results || [],
    events: events.results || [],
  });
}

function safeAnalyticsProperties(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const allowedKeys = new Set(["choice", "source_section", "language", "from_language", "to_language", "project_slug", "package_id", "route", "step", "answer", "field_name"]);
  return Object.fromEntries(Object.entries(value)
    .filter(([key, item]) => allowedKeys.has(key) && ["string", "number", "boolean"].includes(typeof item))
    .map(([key, item]) => [key, String(item).slice(0, 120)])
    .slice(0, 12));
}

async function analyticsEvent(request, env) {
  if (!env.DB) return json({ error: "Analytics storage is not configured yet." }, 503);
  let payload;
  try {
    payload = await requestObject(request);
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }
  const eventName = text(payload.event, 60);
  const language = text(payload.language, 2) === "en" ? "en" : "ar";
  if (!payload.consent || !ANALYTICS_EVENTS.has(eventName)) return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  const properties = JSON.stringify(safeAnalyticsProperties(payload.properties));
  await env.DB.prepare("INSERT INTO analytics_events (event_name, language, properties_json, created_at) VALUES (?, ?, ?, ?)").bind(eventName, language, properties, now()).run();
  return json({ ok: true }, 201);
}

async function studioExport(request, env) {
  const auth = await authenticateStudio(request, env);
  if (!auth.ok) return json({ error: auth.error }, auth.status);
  const url = new URL(request.url);
  const status = text(url.searchParams.get("status"), 30);
  const conditions = [];
  const params = [];
  if (STATUS_VALUES.has(status)) {
    conditions.push("status = ?");
    params.push(status);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const result = await env.DB.prepare(`SELECT reference_code, created_at, status, name, project, phone, email, contact_preference, service, route, offer_name, budget, launch_timeline, source, description, notes FROM brief_requests ${where} ORDER BY created_at DESC`).bind(...params).all();
  const headers = ["reference_code", "created_at", "status", "name", "project", "phone", "email", "contact_preference", "service", "route", "offer_name", "budget", "launch_timeline", "source", "description", "notes"];
  const rows = [headers.join(","), ...(result.results || []).map((item) => headers.map((key) => csvCell(item[key])).join(","))];
  return new Response(`\ufeff${rows.join("\n")}`, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=UTF-8",
      "Content-Disposition": `attachment; filename="zoomix-briefs-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

async function studioBackup(request, env) {
  const auth = await authenticateStudio(request, env);
  if (!auth.ok) return json({ error: auth.error }, auth.status);
  const tables = ["brief_requests", "analytics_events", "commercial_catalog_items", "commercial_catalog_versions", "commercial_quotes", "commercial_quote_versions", "commercial_quote_items", "commercial_quote_events", "commercial_promotions", "commercial_promotion_redemptions", "commercial_projects", "commercial_payments", "commercial_audit_log", "commercial_lead_operations", "commercial_project_entries", "commercial_documents", "commercial_quote_rejections", "commercial_attachments"];
  // D1 batch provides one consistent transaction rather than independent reads.
  const snapshots = await env.DB.batch(tables.map(table => env.DB.prepare(`SELECT * FROM ${table}`)));
  const payload = {
    format: "zoomix-studio-backup",
    schemaVersion: 1,
    exportedAt: now(),
    requests: snapshots[0].results || [],
    analyticsEvents: snapshots[1].results || [],
  };
  payload.tables = {};
  tables.forEach((table,index) => { payload.tables[table] = snapshots[index].results || []; });
  return new Response(`\ufeff${JSON.stringify(payload, null, 2)}`, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "Content-Disposition": `attachment; filename="zoomix-studio-backup-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "no-store",
    },
  });
}

async function studioRequestUpdate(request, env, id) {
  const auth = await authenticateStudio(request, env);
  if (!auth.ok) return json({ error: auth.error }, auth.status);
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) return json({ error: "Invalid request id." }, 400);
  let payload;
  try {
    payload = await requestObject(request);
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }
  const status = payload.status === undefined ? "" : text(payload.status, 30);
  const notes = payload.notes === undefined ? null : text(payload.notes, 4000);
  if (status && !STATUS_VALUES.has(status)) return json({ error: "Invalid request status." }, 400);
  if (payload.isTest !== undefined && typeof payload.isTest !== "boolean") return json({error:"A boolean test flag is required."},400);
  if (!status && notes === null && payload.isTest === undefined) return json({ error: "Nothing to update." }, 400);
  const current=await env.DB.prepare("SELECT * FROM brief_requests WHERE id=?").bind(numericId).first();
  if(!current)return json({error:"Request not found."},404);
  const updatedAt = now();
  const isTest=payload.isTest===undefined?Number(current.is_test):payload.isTest?1:0;
  await env.DB.batch([
    env.DB.prepare("UPDATE brief_requests SET status=?, notes=?, is_test=?, updated_at=? WHERE id=?").bind(status||current.status,notes??current.notes,isTest,updatedAt,numericId),
    ...(payload.isTest===undefined?[]:[env.DB.prepare("UPDATE commercial_quotes SET is_test=? WHERE brief_request_id=?").bind(isTest,numericId)]),
    env.DB.prepare("INSERT INTO commercial_audit_log (entity_type,entity_id,action,before_json,after_json,created_at) VALUES ('brief',?,'updated',?,?,?)").bind(String(numericId),JSON.stringify({status:current.status,isTest:Boolean(current.is_test)}),JSON.stringify({status:status||current.status,isTest:Boolean(isTest),notesChanged:notes!==null}),updatedAt),
  ]);
  const updated = await env.DB.prepare("SELECT * FROM brief_requests WHERE id = ? LIMIT 1").bind(numericId).first();
  if (!updated) return json({ error: "Request not found." }, 404);
  return json({ request: updated });
}

async function api(request, env, ctx) {
  const url = new URL(request.url);
  if (request.method === "OPTIONS") return new Response(null, { status: 204 });
  if(['POST','PATCH','PUT','DELETE'].includes(request.method)) {
    const origin=request.headers.get('Origin');
    if(origin&&origin!==url.origin)return json({error:'Cross-origin writes are not allowed.'},403);
    if(Number(request.headers.get('Content-Length')||0)>1048576)return json({error:'Request too large.'},413);
  }
  const history=url.pathname.match(/^\/api\/studio\/catalog\/([a-z0-9-]+)\/history$/i);
  if(history&&['GET','POST'].includes(request.method))return studioCatalogHistory(request,env,history[1]);
  const approval=url.pathname.match(/^\/api\/studio\/quotes\/(\d+)\/pricing-approval$/);
  if(approval&&request.method==='POST')return studioPricingApproval(request,env,approval[1]);
  const operation=await businessOperations(request,env,authenticateStudio);if(operation)return operation;
  if (request.method === "POST" && url.pathname === "/api/briefs") return createBrief(request, env, ctx);
  if (request.method === "GET" && url.pathname === "/api/catalog") return publicCatalog(env);
  const editMatch = url.pathname.match(/^\/api\/briefs\/edit\/([a-f0-9]{64})$/i);
  if (editMatch && request.method === "GET") return getBriefForEdit(request, env, editMatch[1]);
  if (editMatch && request.method === "PATCH") return updateBriefFromEdit(request, env, ctx, editMatch[1]);
  const detailMatch = url.pathname.match(new RegExp('^/api/studio/quotes/([0-9]+)$'));
  if(request.method === "GET" && detailMatch) return studioQuoteDetail(request,env,Number(detailMatch[1]));
  if (request.method === "POST" && url.pathname === "/api/studio/login") return studioLogin(request, env);
  if (request.method === "GET" && url.pathname === "/api/studio/session") {
    const auth = await authenticateStudio(request, env);
    return json(auth.ok ? { authenticated: true } : { error: auth.error }, auth.ok ? 200 : auth.status, { "Cache-Control": "no-store" });
  }
  if (request.method === "POST" && url.pathname === "/api/studio/logout") return studioLogout(request, env);
  if (request.method === "GET" && url.pathname === "/api/studio/requests") return studioRequests(request, env);
  if (request.method === "GET" && url.pathname === "/api/studio/catalog") return studioCatalog(request, env);
  if (request.method === "POST" && url.pathname === "/api/studio/catalog") return studioCatalogCreate(request, env);
  if (request.method === "POST" && url.pathname === "/api/studio/quotes") return studioQuoteCreate(request, env);
  if (request.method === "GET" && url.pathname === "/api/studio/quotes") return studioQuotes(request, env);
  if (request.method === "GET" && url.pathname === "/api/studio/projects") return studioProjects(request, env);
  if (request.method === "GET" && url.pathname === "/api/studio/payments") return studioPayments(request, env);
  if (request.method === "GET" && url.pathname === "/api/studio/promotions") return studioPromotions(request, env);
  if (request.method === "POST" && url.pathname === "/api/studio/promotions") return studioPromotionCreate(request, env);
  if (request.method === "GET" && url.pathname === "/api/studio/integrations") return studioIntegrations(request, env);
  if (request.method === "GET" && url.pathname === "/api/studio/audit") return studioAudit(request, env);
  if (request.method === "POST" && url.pathname === "/api/studio/integrations/telegram/test") return studioTelegramTest(request, env);
  if (request.method === "POST" && url.pathname === "/api/studio/payments/reminders") return studioPaymentReminders(request, env);
  const publicQuoteMatch = url.pathname.match(/^\/api\/quotes\/(QT-[A-Z0-9-]+)\/([a-f0-9]{64})$/i);
  if (request.method === "GET" && publicQuoteMatch) return publicQuote(request, env, ctx, publicQuoteMatch[1], publicQuoteMatch[2]);
  if (request.method === "POST" && publicQuoteMatch) return publicQuoteRespond(request, env, ctx, publicQuoteMatch[1], publicQuoteMatch[2]);
  if (request.method === "GET" && url.pathname === "/api/studio/events") return studioEvents(request, env);
  if (request.method === "GET" && url.pathname === "/api/studio/insights") return studioInsights(request, env);
  if (request.method === "GET" && url.pathname === "/api/studio/export.csv") return studioExport(request, env);
  if (request.method === "GET" && url.pathname === "/api/studio/backup.json") return studioBackup(request, env);
  if (request.method === "POST" && url.pathname === "/api/analytics/events") return analyticsEvent(request, env);
  const updateMatch = url.pathname.match(/^\/api\/studio\/requests\/(\d+)$/);
  if (request.method === "PATCH" && updateMatch) return studioRequestUpdate(request, env, updateMatch[1]);
  const catalogMatch = url.pathname.match(/^\/api\/studio\/catalog\/([a-z0-9][a-z0-9-]{1,79})$/i);
  if (request.method === "PATCH" && catalogMatch) return studioCatalogUpdate(request, env, catalogMatch[1]);
  const quoteMatch = url.pathname.match(/^\/api\/studio\/quotes\/(\d+)\/versions$/);
  const testModeMatch = url.pathname.match(/^\/api\/studio\/quotes\/(\d+)\/test-mode$/);
  if (request.method === "PATCH" && testModeMatch) return studioQuoteTestMode(request, env, Number(testModeMatch[1]));
  if (request.method === "POST" && quoteMatch) return studioQuoteNewVersion(request, env, quoteMatch[1]);
  const quoteSendMatch = url.pathname.match(/^\/api\/studio\/quotes\/(\d+)\/send$/);
  if (request.method === "POST" && quoteSendMatch) return studioQuoteSend(request, env, ctx, quoteSendMatch[1]);
  const promotionMatch = url.pathname.match(/^\/api\/studio\/promotions\/([a-z0-9-]+)$/i);
  if (request.method === "PATCH" && promotionMatch) return studioPromotionUpdate(request, env, promotionMatch[1]);
  const paymentMatch = url.pathname.match(/^\/api\/studio\/payments\/(\d+)$/);
  if (request.method === "PATCH" && paymentMatch) return studioPaymentUpdate(request, env, paymentMatch[1]);
  return json({ error: "Not found." }, 404);
}

export class StudioLiveUpdates extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.clients = new Set();
  }

  async fetch(request) {
    const url = new URL(request.url);
    if (request.method !== "GET" || url.pathname !== "/events") {
      return new Response("Not found.", { status: 404 });
    }

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const client = { writer, heartbeat: null, closed: false };
    this.clients.add(client);

    const removeClient = () => {
      if (client.closed) return;
      client.closed = true;
      if (client.heartbeat) clearInterval(client.heartbeat);
      this.clients.delete(client);
      void writer.close().catch(() => {});
    };

    const write = async (chunk) => {
      if (client.closed) return false;
      try {
        await writer.write(chunk);
        return true;
      } catch {
        removeClient();
        return false;
      }
    };

    await write(": connected\n\n");
    client.heartbeat = setInterval(() => {
      void write(": heartbeat\n\n");
    }, 25000);

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream; charset=UTF-8",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  }

  async broadcast(event) {
    const payload = `data: ${JSON.stringify(event)}\n\n`;
    const clients = [...this.clients];
    const results = await Promise.all(clients.map((client) => this.writeToClient(client, payload)));
    return { delivered: results.filter(Boolean).length };
  }

  async writeToClient(client, payload) {
    if (client.closed) return false;
    try {
      await client.writer.write(payload);
      return true;
    } catch {
      client.closed = true;
      if (client.heartbeat) clearInterval(client.heartbeat);
      this.clients.delete(client);
      void client.writer.close().catch(() => {});
      return false;
    }
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      try { return await api(request, env, ctx); }
      catch(error) { console.error('API request failed', error?.name || 'Error');return json({error:'The operation could not be completed. Please retry.'},500); }
    }
    const isHtmlRoute = request.method === "GET" && !url.pathname.includes(".");
    if (isHtmlRoute && url.pathname !== "/") {
      // Pages normalizes /index.html to / with a 308. Fetch the root asset
      // internally so the browser keeps the requested client-side route.
      return env.ASSETS.fetch(new Request(new URL("/", request.url), request));
    }
    const asset = await env.ASSETS.fetch(request);
    const needsSpaFallback = asset.status === 404 || (asset.status >= 300 && asset.status < 400);
    if (!isHtmlRoute || !needsSpaFallback) return asset;
    return env.ASSETS.fetch(new Request(new URL("/", request.url), request));
  },
  async scheduled(controller, env, ctx) {
    ctx.waitUntil(processPaymentReminders(env).catch((error) => console.error("Payment reminder run failed", error)));
  },
};
