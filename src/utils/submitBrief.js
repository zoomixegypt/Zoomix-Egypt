// Never retry a POST automatically: a lost response can follow a successful save.
export async function submitBrief(payload, language, { fetchImpl = fetch, timeoutMs = 30000 } = {}) {
  const ar = language === "ar";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl("/api/briefs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(response.status === 429
        ? (ar ? "محاولات كتير في وقت قصير. انتظر قليلًا قبل المحاولة مرة أخرى." : "Too many attempts. Please wait before trying again.")
        : (ar ? "تعذر تأكيد حفظ الطلب. بياناتك ما زالت موجودة؛ انسخها أو تواصل معنا للمساعدة." : "We could not confirm the save. Your details are still here; copy them or contact us for help."));
    }
    if (result?.ok !== true || typeof result.referenceCode !== "string" || !result.referenceCode.trim()) {
      throw new Error(ar ? "لم يصل تأكيد صالح من الخادم. قد يكون الطلب محفوظًا؛ تواصل معنا قبل إعادة الإرسال." : "No valid save confirmation arrived. The brief may have been saved; contact us before resubmitting.");
    }
    return result;
  } catch (error) {
    if (controller.signal.aborted || error?.name === "AbortError") {
      throw new Error(ar ? "استغرق تأكيد الطلب وقتًا طويلًا. قد يكون محفوظًا؛ انسخ بياناتك وتواصل معنا قبل إعادة الإرسال." : "Save confirmation timed out. Your brief may have been saved; copy your details and contact us before resubmitting.");
    }
    if (error instanceof TypeError) {
      throw new Error(ar ? "انقطع الاتصال قبل تأكيد الحفظ. بياناتك موجودة؛ تحقق من اتصالك وتواصل معنا قبل إعادة الإرسال." : "Connection lost before save confirmation. Your details are preserved; check your connection and contact us before resubmitting.");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
