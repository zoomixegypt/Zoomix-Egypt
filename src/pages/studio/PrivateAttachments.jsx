import { useEffect, useState } from "react";
import { studioRequest } from "./api";
export default function PrivateAttachments({ projectId, paymentId, language }) {
  const ar = language === "ar";
  const [rows, setRows] = useState([]),
    [file, setFile] = useState(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    studioRequest(`/api/studio/attachments/${projectId}`)
      .then((data) => active && setRows(data.attachments))
      .catch((error) => active && setMessage(error.message));
    return () => {
      active = false;
    };
  }, [projectId, reload]);
  return (
    <section className="csp-operation-panel">
      <h3>{ar ? "المرفقات الخاصة" : "Private attachments"}</h3>
      <p>
        {ar
          ? "PDF أو PNG أو JPEG، حتى 512 KB. التنزيل للأدمن فقط. لا توجد خدمة فحص فيروسات؛ افتح الملفات الموثوقة فقط."
          : "PDF, PNG or JPEG up to 512 KB. Admin-only downloads. No malware scanner is configured; open trusted files only."}
      </p>
      <label>
        {ar ? "اختر الملف" : "Choose file"}
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          disabled={busy}
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </label>
      <button
        type="button"
        className="csp-button"
        disabled={busy || !file}
        onClick={async () => {
          if (file.size > 524288) {
            setMessage(ar ? "الحد الأقصى 512 KB" : "Maximum 512 KB");
            return;
          }
          setBusy(true);
          setMessage("");
          try {
            const bytes = new Uint8Array(await file.arrayBuffer());
            let text = "";
            for (let index = 0; index < bytes.length; index += 8192)
              text += String.fromCharCode(...bytes.subarray(index, index + 8192));
            await studioRequest(`/api/studio/attachments/${projectId}`, {
              method: "POST",
              body: JSON.stringify({ filename: file.name, paymentId, contentBase64: btoa(text) }),
            });
            setFile(null);
            setReload((r) => r + 1);
            setMessage(ar ? "تم حفظ المرفق" : "Attachment saved");
          } catch (error) {
            setMessage(error.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {ar ? "رفع المرفق" : "Upload attachment"}
      </button>
      <p role="status">{message}</p>
      {rows
        .filter((row) => !paymentId || row.payment_id === paymentId)
        .map((row) => (
          <p key={row.id}>
            <a href={`/api/studio/attachments/${row.id}?download=1`} download>
              {row.filename}
            </a>{" "}
            · {Math.ceil(row.size_bytes / 1024)} KB
          </p>
        ))}
    </section>
  );
}
