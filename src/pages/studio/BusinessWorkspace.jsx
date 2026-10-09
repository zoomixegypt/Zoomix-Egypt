import { useEffect, useState, useRef } from "react";
import { printDocument } from "./printDocument";
import { studioRequest } from "./api";
import { money } from "./shared";
import PrivateAttachments from "./PrivateAttachments";
const write = (url, data) => studioRequest(url, { method: "POST", body: JSON.stringify(data) });
const localDateInput = (value) => {
  if (!value) return "";
  const d = new Date(value);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
export function WorkspaceDisclosure({ label, children }) {
  const [open, setOpen] = useState(false);
  return (
    <details className="csp-brief-details" onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>{label}</summary>
      {open && children}
    </details>
  );
}
function Field({ label, ...props }) {
  return (
    <label>
      {label}
      <input {...props} />
    </label>
  );
}
export function BusinessReport({ language }) {
  const ar = language === "ar";
  const [data, setData] = useState(null),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    studioRequest("/api/studio/business-report")
      .then((d) => active && setData(d))
      .catch((e) => active && setError(e.message));
    return () => {
      active = false;
    };
  }, []);
  return (
    <section className="csp-panel csp-operation-panel">
      <h2>{ar ? "المصروفات والربحية التشغيلية" : "Recorded costs & operational profit"}</h2>
      <p>
        {ar
          ? "الربح المحسوب هنا = القيمة دون الضريبة ناقص المصروفات المسجلة فقط؛ لا يمثل الربح النهائي قبل اكتمال التسجيل. بيانات الاختبار مستبعدة."
          : "Profit here is net contract value minus recorded expenses only. It is not final until expenses are complete. Test records are excluded."}
      </p>
      {error && <p role="alert">{error}</p>}
      {data?.projects.map((row) => (
        <article key={row.id} className="csp-operation-row">
          <strong>{row.name}</strong>
          <p className="csp-sensitive-number">
            {ar
              ? "متوقع / مسجل / ربح حسب المسجل"
              : "Expected cost / recorded cost / recorded profit"}
            : {money(row.expectedCost)} / {money(row.recordedCost)} /{" "}
            {money(row.netValue - row.recordedCost)} EGP
          </p>
        </article>
      ))}
      <h3>{ar ? "مصادر الطلبات" : "Lead sources"}</h3>
      {data?.sources.map((row, i) => (
        <p key={i}>
          {row.source || "—"}: {row.count}
        </p>
      ))}
      <h3>{ar ? "أسباب عدم الإتمام" : "Loss reasons"}</h3>
      {data?.losses.map((row, i) => (
        <p key={i}>
          {row.loss_reason}: {row.count}
        </p>
      ))}
    </section>
  );
}
export function LeadFollowUp({ id, language }) {
  const ar = language === "ar";
  const [row, setRow] = useState({ owner: "", followUpAt: "", lossReason: "" });
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    studioRequest("/api/studio/lead-operations")
      .then((data) => {
        const found = data.rows.find((r) => String(r.brief_id) === String(id));
        if (active && found)
          setRow({
            owner: found.owner,
            followUpAt: localDateInput(found.follow_up_at),
            lossReason: found.loss_reason,
          });
      })
      .catch((e) => active && setError(e.message));
    return () => {
      active = false;
    };
  }, [id]);
  return (
    <form
      className="csp-operation-panel"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
          await write(`/api/studio/lead-operations/${id}`, {
            ...row,
            followUpAt: row.followUpAt ? new Date(row.followUpAt).toISOString() : null,
          });
          setError(ar ? "تم حفظ المتابعة" : "Follow-up saved");
        } catch (e) {
          setError(e.message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <h3>{ar ? "مسؤول الطلب والمتابعة" : "Ownership & follow-up"}</h3>
      <div className="csp-operation-grid">
        <Field
          label={ar ? "المسؤول" : "Owner"}
          value={row.owner}
          onChange={(e) => setRow({ ...row, owner: e.target.value })}
        />
        <Field
          label={ar ? "موعد المتابعة — بالتوقيت المحلي" : "Follow-up — local time"}
          type="datetime-local"
          value={row.followUpAt}
          onChange={(e) => setRow({ ...row, followUpAt: e.target.value })}
        />
        <Field
          label={ar ? "سبب عدم الإتمام" : "Loss reason"}
          value={row.lossReason}
          onChange={(e) => setRow({ ...row, lossReason: e.target.value })}
        />
      </div>
      <button className="csp-button" disabled={busy}>
        {ar ? "حفظ المتابعة" : "Save follow-up"}
      </button>
      <p role="status">{error}</p>
    </form>
  );
}
export function DueFollowUps({ language, requests = [] }) {
  const ar = language === "ar";
  const [rows, setRows] = useState([]),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    studioRequest("/api/studio/lead-operations")
      .then((data) => active && setRows(data.rows))
      .catch((e) => active && setError(e.message));
    return () => {
      active = false;
    };
  }, []);
  const due = rows.filter(
    (row) =>
      row.follow_up_at &&
      Date.parse(row.follow_up_at) <= Date.now() &&
      requests.some(
        (r) =>
          Number(r.id) === row.brief_id && !r.is_test && !["won", "archived"].includes(r.status),
      ),
  );
  return (
    <section className="csp-panel csp-operation-panel">
      <h2>{ar ? "متابعات اليوم" : "Due follow-ups"}</h2>
      {error && <p role="alert">{error}</p>}
      {due.map((row) => (
        <p key={row.brief_id}>
          {requests.find((r) => Number(r.id) === row.brief_id)?.name} · {row.owner || "—"} ·{" "}
          {new Date(row.follow_up_at).toLocaleString("en-GB")}
        </p>
      ))}
      {!due.length && !error && <p>{ar ? "لا توجد متابعات مستحقة" : "No due follow-ups"}</p>}
    </section>
  );
}
export function BusinessDocument({ document, language }) {
  const ar = language === "ar";
  const element = useRef(null);
  const [printError, setPrintError] = useState("");
  const data = JSON.parse(document.snapshot_json);
  return (
    <section
      ref={element}
      className="csp-panel csp-operation-panel csp-print-document"
      dir={ar ? "rtl" : "ltr"}
    >
      <h2>ZOOMIX / {data.type.toUpperCase()}</h2>
      <p>{data.reference}</p>
      {data.isTest && <strong>TEST QA — {ar ? "غير حقيقي" : "NOT REAL"}</strong>}
      <h3>
        {data.clientName} · {data.projectName}
      </h3>
      <p>
        {data.projectReference} · {new Date(data.createdAt).toLocaleDateString("en-GB")}
      </p>
      <h3 className="csp-sensitive-number">{money(data.totalMinor / 100)} EGP</h3>
      {data.scope?.map((row, index) => (
        <article className="csp-operation-row" key={index}>
          <strong>{row.name[language] || row.name.ar}</strong>
          <p>{row.description[language] || row.description.ar}</p>
          <b className="csp-sensitive-number">
            {row.quantity} × {money(row.unitPriceMinor / 100)} EGP ·{" "}
            {money(row.lineTotalMinor / 100)} EGP
          </b>
        </article>
      ))}
      {data.type !== "receipt" && data.subtotalMinor !== undefined && (
        <p className="csp-sensitive-number">
          {ar ? "الإجمالي / الخصم / الضريبة" : "Subtotal / discount / tax"}:{" "}
          {money(data.subtotalMinor / 100)} / {money(data.discountMinor / 100)} /{" "}
          {money(data.taxMinor / 100)} EGP
        </p>
      )}
      <p>
        {data.method} {data.collectionReference}
      </p>
      <h3>{ar ? "الشروط" : "Conditions"}</h3>
      <p style={{ whiteSpace: "pre-wrap" }}>{data.conditions}</p>
      <h3>{ar ? "الاستبعادات" : "Exclusions"}</h3>
      <p style={{ whiteSpace: "pre-wrap" }}>{data.exclusions}</p>
      {data.paymentSchedule.map((row, i) => (
        <p key={i}>
          {row.label} · {row.percent}% · {row.days} {ar ? "يوم" : "days"}
        </p>
      ))}
      <p>
        {ar
          ? "مستند تشغيلي، ليس فاتورة ضريبية معتمدة أو توقيعًا إلكترونيًا."
          : "Operational document, not a certified tax invoice or electronic signature."}
      </p>
      <button
        type="button"
        className="csp-button csp-no-print"
        onClick={() => {
          if (!printDocument(element.current))
            setPrintError(
              ar ? "اسمح بفتح نافذة الطباعة ثم حاول مرة أخرى." : "Allow the print popup and retry.",
            );
        }}
      >
        {ar ? "طباعة / حفظ PDF" : "Print / Save PDF"}
      </button>
      {printError && (
        <p role="alert" className="csp-no-print">
          {printError}
        </p>
      )}
    </section>
  );
}
export function ProjectWorkspace({ id, language }) {
  const ar = language === "ar";
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [document, setDocument] = useState(null);
  const initial = { type: "task", title: "", detail: "", owner: "", dueAt: "", amount: 0 };
  const [form, setForm] = useState(initial);
  const load = () => studioRequest(`/api/studio/project-workspace/${id}`).then(setData);
  useEffect(() => {
    let active = true;
    studioRequest(`/api/studio/project-workspace/${id}`)
      .then((value) => active && setData(value))
      .catch((e) => active && setError(e.message));
    return () => {
      active = false;
    };
  }, [id]);
  const mutate = async (payload) => {
    setBusy(true);
    setError("");
    try {
      await write(`/api/studio/project-workspace/${id}`, payload);
      await load();
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      setBusy(false);
    }
  };
  if (!data)
    return <p role="status">{error || (ar ? "جارٍ تحميل مساحة المشروع" : "Loading workspace")}</p>;
  const cost = data.entries
    .filter((r) => r.entry_type === "expense" && r.status !== "cancelled")
    .reduce((sum, r) => sum + r.amount_minor, 0);
  return (
    <section className="csp-panel csp-operation-panel">
      <h2>{ar ? "مساحة تنفيذ المشروع" : "Project delivery workspace"}</h2>
      <p role="status">{error}</p>
      <label>
        {ar ? "مرحلة التنفيذ" : "Delivery phase"}
        <select
          value={data.project.status}
          disabled={busy}
          onChange={(e) => mutate({ projectStatus: e.target.value })}
        >
          {["confirmed", "planning", "production", "review", "delivered", "closed"].map((s, i) => (
            <option key={s} value={s}>
              {ar ? ["مؤكد", "تخطيط", "إنتاج", "مراجعة", "تسليم", "مغلق"][i] : s}
            </option>
          ))}
        </select>
      </label>
      <p className="csp-sensitive-number">
        {ar ? "التكلفة المتوقعة" : "Expected cost"}: {money(data.project.expected_cost_minor / 100)}{" "}
        EGP · {ar ? "المصروفات المسجلة" : "Recorded expenses"}: {money(cost / 100)} EGP ·{" "}
        {ar ? "الفرق" : "Variance"}: {money((cost - data.project.expected_cost_minor) / 100)} EGP
      </p>
      <p>
        {ar
          ? "الربح الفعلي يعتمد على اكتمال تسجيل المصروفات؛ هذه ليست محاسبة ضريبية."
          : "Actual profitability depends on complete expense recording; this is not tax accounting."}
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (
            await mutate({ ...form, dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : null })
          )
            setForm(initial);
        }}
      >
        <div className="csp-operation-grid">
          <label>
            {ar ? "النوع" : "Type"}
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {["task", "team", "file", "expense"].map((s, i) => (
                <option key={s} value={s}>
                  {ar ? ["مهمة", "فريق / مورد", "رابط ملف", "مصروف"][i] : s}
                </option>
              ))}
            </select>
          </label>
          <Field
            label={ar ? "العنوان" : "Title"}
            required
            maxLength={180}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Field
            label={ar ? "المسؤول / المورد" : "Owner / supplier"}
            value={form.owner}
            onChange={(e) => setForm({ ...form, owner: e.target.value })}
          />
          <Field
            label={ar ? "الموعد" : "Due"}
            type="datetime-local"
            value={form.dueAt}
            onChange={(e) => setForm({ ...form, dueAt: e.target.value })}
          />
        </div>
        <Field
          label={
            form.type === "file"
              ? ar
                ? "رابط HTTPS — لا تضع روابط سرية"
                : "HTTPS link — no secret URLs"
              : ar
                ? "التفاصيل"
                : "Details"
          }
          required={form.type === "file"}
          type={form.type === "file" ? "url" : "text"}
          value={form.detail}
          onChange={(e) => setForm({ ...form, detail: e.target.value })}
        />
        {form.type === "expense" && (
          <Field
            label={ar ? "المبلغ EGP" : "Amount EGP"}
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
          />
        )}
        <button className="csp-button" disabled={busy}>
          {ar ? "إضافة" : "Add"}
        </button>
      </form>
      {data.entries.map((row) => (
        <article className="csp-operation-row" key={row.id}>
          <strong>{row.title}</strong>
          <span>
            {row.owner} ·{" "}
            {row.entry_type === "expense" ? `${money(row.amount_minor / 100)} EGP` : row.detail}
          </span>
          {row.entry_type === "file" && (
            <a href={row.detail} target="_blank" rel="noreferrer">
              {ar ? "فتح الملف" : "Open file"}
            </a>
          )}
          <label>
            {ar ? "الحالة" : "Status"}
            <select
              value={row.status}
              disabled={busy}
              onChange={(e) => mutate({ entryId: row.id, status: e.target.value })}
            >
              {["open", "done", "cancelled"].map((s, i) => (
                <option key={s} value={s}>
                  {ar ? ["قائم", "مكتمل", "ملغى"][i] : s}
                </option>
              ))}
            </select>
          </label>
        </article>
      ))}
      <PrivateAttachments projectId={id} language={language} />
      <h3>{ar ? "المستندات" : "Documents"}</h3>
      {["invoice", "contract"].map((type, i) => (
        <button
          key={type}
          className="csp-button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              setDocument((await write(`/api/studio/documents/${id}`, { type })).document);
              await load();
            } catch (e) {
              setError(e.message);
            } finally {
              setBusy(false);
            }
          }}
        >
          {ar ? ["إنشاء فاتورة تشغيلية", "إنشاء مسودة عقد"][i] : `Create ${type}`}
        </button>
      ))}
      {data.documents.map((doc) => (
        <button key={doc.id} className="csp-button" onClick={() => setDocument(doc)}>
          {doc.reference}
        </button>
      ))}
      {document && <BusinessDocument document={document} language={language} />}
    </section>
  );
}
export function PaymentDetails({ payment, language }) {
  const ar = language === "ar";
  const [data, setData] = useState({ method: "", reference: "", receiptUrl: "" }),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [document, setDocument] = useState(null);
  useEffect(() => {
    let active = true;
    studioRequest(`/api/studio/payment-details/${payment.id}`)
      .then(
        ({ payment: p }) =>
          active &&
          setData({
            method: p.method,
            reference: p.collection_reference,
            receiptUrl: p.receipt_url,
          }),
      )
      .catch((e) => active && setError(e.message));
    return () => {
      active = false;
    };
  }, [payment.id]);
  return (
    <form
      className="csp-operation-panel"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          await write(`/api/studio/payment-details/${payment.id}`, data);
          setError(ar ? "تم الحفظ" : "Saved");
        } catch (e) {
          setError(e.message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="csp-operation-grid">
        <Field
          label={ar ? "طريقة التحصيل" : "Collection method"}
          value={data.method}
          onChange={(e) => setData({ ...data, method: e.target.value })}
        />
        <Field
          label={ar ? "مرجع العملية" : "Transaction reference"}
          value={data.reference}
          onChange={(e) => setData({ ...data, reference: e.target.value })}
        />
        <Field
          label={ar ? "رابط إيصال HTTPS" : "Receipt HTTPS link"}
          type="url"
          value={data.receiptUrl}
          onChange={(e) => setData({ ...data, receiptUrl: e.target.value })}
        />
      </div>
      <button disabled={busy} className="csp-button">
        {ar ? "حفظ بيانات التحصيل" : "Save collection details"}
      </button>
      <button
        type="button"
        className="csp-button"
        disabled={busy || payment.status !== "paid"}
        onClick={async () => {
          setBusy(true);
          try {
            setDocument(
              (
                await write(`/api/studio/documents/${payment.projectId}`, {
                  type: "receipt",
                  paymentId: payment.id,
                })
              ).document,
            );
          } catch (e) {
            setError(e.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {ar ? "إصدار إيصال للدفعة المحصلة" : "Issue paid receipt"}
      </button>
      <p role="status">{error}</p>
      <PrivateAttachments
        projectId={payment.projectId}
        paymentId={payment.id}
        language={language}
      />
      {document && <BusinessDocument document={document} language={language} />}
    </form>
  );
}
