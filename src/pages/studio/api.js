export async function studioFetch(path, options = {}) {
  const response = await fetch(path, { credentials: "same-origin", ...options });
  if (response.status === 401 && typeof window !== "undefined")
    window.dispatchEvent(new Event("studio-session-expired"));
  if (!(response.headers.get("content-type") || "").includes("application/json"))
    throw new Error("تعذر الاتصال بخدمة Studio. تحقق من تشغيل خادم Cloudflare.");
  return response;
}
export async function studioRequest(path, options = {}) {
  const response = await studioFetch(path, options);
  const type = response.headers.get("content-type") || "";
  const payload = type.includes("application/json") ? await response.json() : null;
  if (!response.ok || !payload) {
    const error = new Error(
      payload?.error || "تعذر الاتصال بخدمة Studio. تحقق من تشغيل خادم Cloudflare.",
    );
    error.status = response.status;
    throw error;
  }
  return payload;
}
