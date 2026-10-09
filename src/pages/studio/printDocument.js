// Browser-native PDF output: text stays searchable and Arabic shaping stays native.
// Print a detached, public-safe DOM copy, not the surrounding admin workspace.
export function printDocument(element) {
  if (!element) return false;
  const copy = element.cloneNode(true);
  const originals = [...element.querySelectorAll(".is-optional")];
  [...copy.querySelectorAll(".is-optional")].forEach((row, index) => {
    if (originals[index]?.querySelector("input")?.checked === false) row.remove();
  });
  copy
    .querySelectorAll(
      "button,input,textarea,.cq-actions,.cq-terms,.cq-error,.cq-no-print,.csp-no-print,script",
    )
    .forEach((node) => node.remove());
  const preview = window.open("", "_blank", "width=900,height=1000");
  if (!preview) return false;
  preview.opener = null;
  preview.document
    .write(`<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><title>ZOOMIX Document</title><style>
 @page{size:A4;margin:16mm}body{font:15px/1.7 Tahoma,Arial,sans-serif;color:#151515;background:white;max-width:780px;margin:24px auto;padding:20px}h1{font-size:28px;line-height:1.35}h2{font-size:21px}h3{font-size:17px}p{white-space:pre-wrap;overflow-wrap:anywhere}article{break-inside:avoid;border-bottom:1px solid #ddd;padding:14px 0;display:flex;gap:16px;justify-content:space-between}article>div{flex:1}article svg{display:none}strong,b,dd{font-family:Arial,Tahoma,sans-serif}dl>div{display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid #ddd}.cq-layout{display:block}.cq-top{display:flex;justify-content:space-between;font-weight:bold}.cq-summary{margin-top:24px}.cq-hero{margin-block:30px}.is-total{font-size:20px;font-weight:bold}.cq-result{border:1px solid #999;padding:10px}.cq-result svg{display:none}@media print{body{padding:0;margin:0;max-width:none}}
 </style></head><body>${copy.outerHTML}</body></html>`);
  preview.document.close();
  preview.focus();
  preview.print();
  return true;
}
