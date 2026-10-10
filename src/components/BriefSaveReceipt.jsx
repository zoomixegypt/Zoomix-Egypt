import { Check } from "lucide-react";

export default function BriefSaveReceipt({ language, contactPreference, whatsappBlocked, referenceCode }) {
  const ar = language === "ar";
  const message = contactPreference !== "whatsapp"
    ? (ar ? "تم حفظ البريف. هنتواصل معاك بالطريقة اللي اخترتها." : "Brief saved. We will follow up using your preferred contact method.")
    : whatsappBlocked
      ? (ar ? "تم حفظ البريف. افتح واتساب من الرابط أو انسخ الرسالة لإكمال التواصل." : "Brief saved. Open WhatsApp using the link or copy the message to continue.")
      : (ar ? "تم حفظ البريف وتجهيز رسالة واتساب؛ اضغط إرسال داخل واتساب لإرسالها." : "Brief saved and a WhatsApp draft prepared; press Send in WhatsApp to send it.");
  return (
    <div className="public-save-receipt">
      <p className="flex items-start gap-2">
        <Check className="brief-success-icon shrink-0" size={16} aria-hidden="true" />
        <span>{message}</span>
      </p>
      {referenceCode && (
        <p className="mt-2">
          <span>{ar ? "رقم الطلب: " : "Reference: "}</span>
          <bdi dir="ltr" className="public-number whitespace-nowrap font-bold">{referenceCode}</bdi>
        </p>
      )}
    </div>
  );
}
