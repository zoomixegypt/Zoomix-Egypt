export const emptyTerms = {
  conditions: "",
  exclusions: "",
  internalNotes: "",
  expiryDays: 14,
  paymentSchedule: [],
};
export default function CommercialTermsEditor({ value, onChange, language }) {
  const ar = language === "ar";
  const change = (key, next) => onChange({ ...value, [key]: next });
  return (
    <section className="csp-panel csp-operation-panel">
      <h2>{ar ? "الشروط وخطة الدفعات" : "Terms & instalments"}</h2>
      {[
        ["conditions", "الشروط", "Conditions"],
        ["exclusions", "الاستبعادات", "Exclusions"],
        ["internalNotes", "ملاحظات داخلية — لا تظهر للعميل", "Internal notes — never shared"],
      ].map(([key, arabic, en]) => (
        <label key={key}>
          {ar ? arabic : en}
          <textarea
            rows={3}
            maxLength={6000}
            value={value[key] || ""}
            onChange={(e) => change(key, e.target.value)}
          />
        </label>
      ))}
      <label>
        {ar ? "صلاحية العرض بالأيام" : "Validity in days"}
        <input
          type="number"
          min="1"
          max="90"
          value={value.expiryDays}
          onChange={(e) => change("expiryDays", Number(e.target.value))}
        />
      </label>
      <p>
        {ar
          ? "اختياري: دفعات مجموعها 100%. الأيام محسوبة من قبول العرض. بدون تخصيص تُستخدم دفعتا المقدم والمتبقي."
          : "Optional: instalments must total 100%. Days count from acceptance. Otherwise the deposit/balance schedule applies."}
      </p>
      {value.paymentSchedule?.map((row, index) => (
        <div className="csp-operation-grid" key={index}>
          <label>
            {ar ? "اسم الدفعة" : "Label"}
            <input
              value={row.label}
              onChange={(e) =>
                change(
                  "paymentSchedule",
                  value.paymentSchedule.map((r, i) =>
                    i === index ? { ...r, label: e.target.value } : r,
                  ),
                )
              }
            />
          </label>
          <label>
            {ar ? "النسبة %" : "Percent %"}
            <input
              type="number"
              min="0.01"
              max="100"
              value={row.percent}
              onChange={(e) =>
                change(
                  "paymentSchedule",
                  value.paymentSchedule.map((r, i) =>
                    i === index ? { ...r, percent: Number(e.target.value) } : r,
                  ),
                )
              }
            />
          </label>
          <label>
            {ar ? "بعد أيام" : "Days after acceptance"}
            <input
              type="number"
              min="0"
              max="730"
              value={row.days}
              onChange={(e) =>
                change(
                  "paymentSchedule",
                  value.paymentSchedule.map((r, i) =>
                    i === index ? { ...r, days: Number(e.target.value) } : r,
                  ),
                )
              }
            />
          </label>
          <button
            type="button"
            className="csp-button"
            onClick={() =>
              change(
                "paymentSchedule",
                value.paymentSchedule.filter((_, i) => i !== index),
              )
            }
          >
            {ar ? "حذف" : "Remove"}
          </button>
        </div>
      ))}
      <button
        type="button"
        className="csp-button"
        disabled={value.paymentSchedule?.length >= 12}
        onClick={() =>
          change("paymentSchedule", [
            ...(value.paymentSchedule || []),
            { label: "", percent: 0, days: 0 },
          ])
        }
      >
        {ar ? "إضافة دفعة" : "Add instalment"}
      </button>
    </section>
  );
}
