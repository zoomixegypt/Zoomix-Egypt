import assert from "node:assert/strict";
import { openBriefWhatsApp } from "../src/utils/briefWhatsApp.js";
let cases = 0;
for (const message of ["QA local only — ZMX-QA-001", "اختبار فقط + 50% & سطر\nZMX-QA-002"]) {
  let calls = 0;
  assert.equal(openBriefWhatsApp(message, (...args) => {
    calls++;
    const url = new URL(args[0]);
    assert.equal(url.origin, "https://wa.me");
    assert.equal(url.pathname, "/201555451535");
    assert.equal(url.searchParams.get("text"), message);
    assert.equal(args[1], "_blank");
    assert.equal(args[2], "noopener,noreferrer");
    return {};
  }), true);
  assert.equal(calls, 1);
  cases++;
  assert.equal(openBriefWhatsApp(message, () => null), false); cases++;
  assert.equal(openBriefWhatsApp(message, () => {throw new Error("blocked");}), false); cases++;
}
console.log(`PASS: ${cases} bilingual WhatsApp-draft cases: exact destination, encoding, opener isolation, null popup and thrown popup. No browser opened or message sent.`);
