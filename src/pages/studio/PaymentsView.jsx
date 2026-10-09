import { studioFetch } from "./api";
import { WalletCards } from "lucide-react";
import { useState, Fragment } from "react";
import { PaymentDetails, WorkspaceDisclosure } from "./BusinessWorkspace";
import {} from "../../data/commercialStudioPrototype";

import { money, StatusChip, Metric } from "./shared";
export default function PaymentsView({ language, payments, onPaymentUpdated, storageMode }) {
  const isArabic = language === "ar";
  const rows = Array.isArray(payments) ? payments : null;
  const list = rows || [];
  const waiting = !rows;
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const paid = list
    .filter((item) => !item.isTest && item.status === "paid")
    .reduce((sum, item) => sum + item.amount, 0);
  const pending = list
    .filter((item) => !item.isTest && ["pending", "overdue"].includes(item.status))
    .reduce((sum, item) => sum + item.amount, 0);
  const update = async (payment) => {
    if (busyId !== null) return;
    setBusyId(payment.id);
    setError("");
    try {
      let updated = {
        ...payment,
        status: payment.status === "paid" ? "pending" : "paid",
        paidAt: payment.status === "paid" ? null : new Date().toISOString(),
      };
      if (storageMode === "cloud") {
        const response = await studioFetch(`/api/studio/payments/${payment.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: updated.status }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok)
          throw new Error(
            result.error || (isArabic ? "تعذر تسجيل الدفعة." : "Could not update payment."),
          );
        updated = result.payment;
      }
      onPaymentUpdated?.(updated);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusyId(null);
    }
  };
  return (
    <div className="csp-view-enter">
      <header className="csp-page-head">
        <div>
          <p className="csp-kicker">FINANCE / PAYMENTS</p>
          <h1>{isArabic ? "المدفوعات" : "PAYMENTS"}</h1>
          <p className="csp-page-description">
            {isArabic
              ? "تابع المقدم وباقي الرصيد وسجّل التحصيل من نفس المكان."
              : "Track deposits and balances, then record collection in one place."}
          </p>
        </div>
      </header>
      {error && (
        <p className="csp-warning" role="alert">
          {error}
        </p>
      )}
      {waiting && (
        <p className="csp-mode-note" role="status">
          {isArabic
            ? "الأرقام تتاح بعد ربط القاعدة."
            : "Numbers become available after the database is connected."}
        </p>
      )}
      <section className="csp-metrics-grid">
        <Metric
          label={isArabic ? "تم تحصيله" : "COLLECTED"}
          value={waiting ? "—" : money(paid)}
          note="EGP"
          accent
        />
        <Metric
          label={isArabic ? "قيد التحصيل" : "PENDING"}
          value={waiting ? "—" : money(pending)}
          note="EGP"
        />
        <Metric
          label={isArabic ? "دفعات متأخرة" : "OVERDUE"}
          value={
            waiting
              ? "—"
              : String(list.filter((item) => !item.isTest && item.status === "overdue").length)
          }
          note={isArabic ? "تحتاج متابعة" : "Need follow-up"}
        />
      </section>
      <section className="csp-panel csp-table-wrap">
        <div className="csp-table-head csp-payments-head">
          <span>{isArabic ? "المشروع" : "Project"}</span>
          <span>{isArabic ? "الدفعة" : "Payment"}</span>
          <span>{isArabic ? "القيمة" : "Amount"}</span>
          <span>{isArabic ? "الحالة" : "Status"}</span>
          <span>{isArabic ? "الإجراء" : "Action"}</span>
        </div>
        {list.map((payment) => (
          <Fragment key={payment.id}>
            <div
              id={`studio-record-${payment.id}`}
              className="csp-table-row csp-payments-row"
              key={payment.id}
            >
              <span className="csp-item-name">
                <strong>{payment.projectName}</strong>
                <small>
                  {payment.reference} · {payment.clientName}
                  {payment.isTest && <StatusChip>{isArabic ? "اختبار QA" : "TEST QA"}</StatusChip>}
                  {payment.dueAt
                    ? ` · ${isArabic ? "استحقاق" : "Due"} ${new Date(payment.dueAt).toLocaleDateString("en-GB")}`
                    : ""}
                </small>
              </span>
              <span>
                {payment.type === "deposit"
                  ? isArabic
                    ? "المقدم"
                    : "Deposit"
                  : isArabic
                    ? "باقي الرصيد"
                    : "Balance"}
              </span>
              <b className="csp-sensitive-number">{money(payment.amount)} EGP</b>
              <StatusChip accent={payment.status === "paid"} warning={payment.status === "overdue"}>
                {payment.status}
              </StatusChip>
              <button
                type="button"
                className="csp-button"
                disabled={busyId !== null}
                onClick={() => update(payment)}
              >
                {payment.status === "paid"
                  ? isArabic
                    ? "إلغاء التسجيل"
                    : "Mark pending"
                  : isArabic
                    ? "تسجيل كمُسددة"
                    : "Mark paid"}
              </button>
            </div>
            {storageMode === "cloud" && (
              <WorkspaceDisclosure
                label={isArabic ? "بيانات التحصيل والإيصال" : "Collection details & receipt"}
              >
                <PaymentDetails payment={payment} language={language} />
              </WorkspaceDisclosure>
            )}
          </Fragment>
        ))}
        {rows && !rows.length && (
          <div className="csp-empty-state">
            <WalletCards />
            <strong>{isArabic ? "لا توجد دفعات" : "No payments yet"}</strong>
          </div>
        )}
        {waiting && (
          <div className="csp-empty-state">
            <WalletCards />
            <strong>{isArabic ? "بانتظار ربط القاعدة" : "Awaiting database"}</strong>
            <span>
              {isArabic
                ? "المبالغ وحالات التحصيل تتاح بعد ربط القاعدة."
                : "Amounts and collection status appear after the database is connected."}
            </span>
          </div>
        )}
      </section>
    </div>
  );
}
