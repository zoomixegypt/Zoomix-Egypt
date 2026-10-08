import { calculateCommercial } from "../../public/commercial-rules";
import { useEffect, useMemo, useState } from "react";
import { Check, LoaderCircle, MessageSquareText } from "lucide-react";
import { useParams } from "react-router-dom";
import "./clientQuote.css";

const money = (value) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(Number(value || 0));
const itemTotal = (item) => Math.max(0, item.unitPrice * item.quantity - item.discount);

export default function ClientQuote() {
  const { reference, token } = useParams();
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState(null); // { kind: "invalid" | "network" } — مفيش أي نص تقني بيظهر للعميل
  const [reloadToken, setReloadToken] = useState(0);
  const [selected, setSelected] = useState([]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const fail = (kind) => {
      const failure = new Error("quote-load");
      failure.kind = kind;
      throw failure;
    };
    setError(null);
    fetch(`/api/quotes/${encodeURIComponent(reference)}/${encodeURIComponent(token)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) fail("network"); // مش JSON (زي HTML fallback) = مشكلة اتصال
        const payload = await response.json().catch(() => null);
        if (!response.ok)
          fail(response.status >= 400 && response.status < 500 ? "invalid" : "network");
        if (!payload || !payload.quote || !Array.isArray(payload.quote.items)) fail("network");
        setQuote(payload.quote);
        setSelected(payload.quote.items.filter((item) => item.optional).map((item) => item.id));
      })
      .catch((requestError) => {
        if (requestError?.name === "AbortError") return;
        console.error("ClientQuote load failed:", requestError); // التفاصيل التقنية للـ console فقط
        setError({ kind: requestError?.kind === "invalid" ? "invalid" : "network" });
      });
    return () => controller.abort();
  }, [reference, token, reloadToken]);

  const isArabic = quote?.language !== "en";
  const selectedItems = useMemo(
    () => quote?.items.filter((item) => !item.optional || selected.includes(item.id)) || [],
    [quote, selected],
  );
  const selectedSubtotal = calculateCommercial(selectedItems).subtotalMinor / 100;
  const discountRatio = quote?.subtotal ? quote.discount / quote.subtotal : 0;
  const selectedDiscount = quote?.discountPlan
    ? calculateCommercial(selectedItems, null, quote.taxPercent, quote.discountPlan).discountMinor /
      100
    : Math.round(selectedSubtotal * discountRatio * 100) / 100;
  const selectedTax =
    Math.round((selectedSubtotal - selectedDiscount) * 100 * ((quote?.taxPercent || 0) / 100)) /
    100;
  const selectedTotal = selectedSubtotal - selectedDiscount + selectedTax;

  const respond = async (action) => {
    setSubmitting(true);
    setError(null);
    setResult("");
    const failResponse = () => {
      const failure = new Error("quote-response");
      failure.kind = "network";
      throw failure;
    };
    try {
      const response = await fetch(
        `/api/quotes/${encodeURIComponent(reference)}/${encodeURIComponent(token)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            termsAccepted,
            message,
            selectedOptionalItemIds: selected,
          }),
        },
      );
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) failResponse();
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload || !payload.status) failResponse();
      setResult(payload.status);
      setQuote((current) => ({ ...current, status: payload.status }));
    } catch (requestError) {
      console.error("ClientQuote response failed:", requestError); // التفاصيل التقنية للـ console فقط
      setError({ kind: "network" });
    } finally {
      setSubmitting(false);
    }
  };

  if (error && !quote) {
    const invalid = error.kind === "invalid";
    return (
      <main className="cq-state" dir={isArabic ? "rtl" : "ltr"}>
        <strong>ZOOMIX / QUOTE</strong>
        <h1>
          {invalid
            ? isArabic
              ? "الرابط غير متاح"
              : "QUOTE UNAVAILABLE"
            : isArabic
              ? "تعذر تحميل العرض"
              : "COULDN'T LOAD QUOTE"}
        </h1>
        <p>
          {invalid
            ? isArabic
              ? "هذا العرض غير متاح أو تم إغلاقه. لو محتاج مساعدة كلّمنا على واتساب."
              : "This quote is not available or has expired. Message us on WhatsApp if you need help."
            : isArabic
              ? "حصلت مشكلة أثناء تحميل العرض — جرّب تاني."
              : "Something went wrong while loading this quote — please try again."}
        </p>
        {invalid ? (
          <a
            className="cq-retry"
            href="https://wa.me/201555451535"
            target="_blank"
            rel="noreferrer"
          >
            {isArabic ? "تواصل معنا" : "Contact us"}
          </a>
        ) : (
          <button
            type="button"
            className="cq-retry"
            onClick={() => {
              setError(null);
              setReloadToken((value) => value + 1);
            }}
          >
            {isArabic ? "إعادة المحاولة" : "Retry"}
          </button>
        )}
      </main>
    );
  }
  if (!quote)
    return (
      <main className="cq-state">
        <LoaderCircle className="cq-spin" />
        <p>Loading quote…</p>
      </main>
    );

  return (
    <main className="cq-root" dir={isArabic ? "rtl" : "ltr"}>
      <header className="cq-top">
        <strong>ZOOMIX</strong>
        <span>
          {quote.reference} · V{quote.version}
        </span>
      </header>
      <section className="cq-hero">
        <p>PROPOSAL / {quote.clientName}</p>
        <h1>{isArabic ? "عرض واضح، ونطاق جاهز للتنفيذ." : "A CLEAR SCOPE, READY TO MOVE."}</h1>
        <span>{quote.projectName}</span>
      </section>
      <section className="cq-layout">
        <div className="cq-scope">
          <p className="cq-kicker">SCOPE / DELIVERABLES</p>
          <h2>{isArabic ? "نطاق العمل" : "Project scope"}</h2>
          {quote.items.map((item) => (
            <article key={item.id} className={item.optional ? "is-optional" : ""}>
              {item.optional ? (
                <input
                  type="checkbox"
                  checked={selected.includes(item.id)}
                  onChange={(event) =>
                    setSelected((current) =>
                      event.target.checked
                        ? [...current, item.id]
                        : current.filter((id) => id !== item.id),
                    )
                  }
                  disabled={Boolean(result)}
                />
              ) : (
                <Check />
              )}
              <div>
                <strong>{item.name[quote.language]}</strong>
                <p>{item.description[quote.language]}</p>
                <small>
                  {item.quantity} × {money(item.unitPrice)} EGP
                </small>
              </div>
              <b>{money(itemTotal(item))} EGP</b>
            </article>
          ))}
        </div>
        <aside className="cq-summary">
          <p className="cq-kicker">COMMERCIAL / SUMMARY</p>
          <dl>
            <div>
              <dt>{isArabic ? "الإجمالي" : "Subtotal"}</dt>
              <dd>{money(selectedSubtotal)} EGP</dd>
            </div>
            {selectedDiscount > 0 && (
              <div>
                <dt>{isArabic ? "الخصم" : "Discount"}</dt>
                <dd>−{money(selectedDiscount)} EGP</dd>
              </div>
            )}
            {selectedTax > 0 && (
              <div>
                <dt>{isArabic ? "الضريبة" : "Tax"}</dt>
                <dd>{money(selectedTax)} EGP</dd>
              </div>
            )}
            <div className="is-total">
              <dt>{isArabic ? "الإجمالي النهائي" : "Final total"}</dt>
              <dd>{money(selectedTotal)} EGP</dd>
            </div>
          </dl>
          <ul>
            <li>
              {quote.depositPercent}% {isArabic ? "مقدم" : "deposit"}
            </li>
            <li>{quote.timeline}</li>
            <li>
              {quote.revisions} {isArabic ? "مراجعات" : "revisions"}
            </li>
          </ul>
          {result ? (
            <div className="cq-result">
              <Check />
              <strong>
                {result === "accepted"
                  ? isArabic
                    ? "تم قبول العرض بنجاح"
                    : "Quote accepted"
                  : isArabic
                    ? "تم إرسال طلب التعديل"
                    : "Revision request sent"}
              </strong>
            </div>
          ) : (
            <>
              <label className="cq-terms">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(event) => setTermsAccepted(event.target.checked)}
                />
                <span>
                  {isArabic
                    ? "راجعت النطاق والشروط وأوافق على العرض."
                    : "I reviewed the scope and terms and accept this quote."}
                </span>
              </label>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={isArabic ? "ملاحظات أو تعديل مطلوب…" : "Notes or requested change…"}
                rows={3}
              />
              {error && (
                <p className="cq-error" role="alert">
                  {isArabic
                    ? "تعذر تنفيذ العملية — جرّب مرة تانية."
                    : "The action could not be completed — please try again."}
                </p>
              )}
              <div className="cq-actions">
                <button
                  type="button"
                  onClick={() => respond("revision")}
                  disabled={submitting || !message.trim()}
                >
                  <MessageSquareText />
                  {isArabic ? "طلب تعديل" : "Request change"}
                </button>
                <button
                  type="button"
                  className="is-primary"
                  onClick={() => respond("accept")}
                  disabled={submitting || !termsAccepted}
                >
                  <Check />
                  {isArabic ? "قبول العرض" : "Accept quote"}
                </button>
              </div>
            </>
          )}
        </aside>
      </section>
    </main>
  );
}
