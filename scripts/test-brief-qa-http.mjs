// Run only against scripts/serve-brief-qa.mjs. Never accepts an external URL.
import assert from "node:assert/strict";
import { submitBrief } from "../src/utils/submitBrief.js";
const origin = "http://127.0.0.1:5175";
const status = async () => {
  const response = await fetch(`${origin}/api/qa-status`);
  const data = await response.json();
  assert.equal(data.isolated, true, "Refuse any non-QA server");
  return data.submissions;
};
const before = await status();
const payload = {
  name:"QA HTTP local only",project:"QA FAIL",activity:"Test cafe",description:"Isolated integration test; no real lead.",
  route:"show",showType:"content",service:"content-start",offerId:"content-start",offerName:"CONTENT START",
  budget:"5000-10000",launchDate:"within-month",contentSource:"new-shoot",contactPreference:"email",
  email:"qa@example.com",consent:true,
};
const fetchImpl = (path, init) => {assert.equal(path,"/api/briefs");return fetch(`${origin}${path}`,init);};
await assert.rejects(submitBrief(payload,"ar",{fetchImpl}),/تعذر تأكيد حفظ الطلب/);
assert.equal(await status(),before+1,"No automatic retry after failure");
const email = await submitBrief({...payload,project:"QA SUCCESS"},"ar",{fetchImpl});
assert.match(email.referenceCode,/^ZMX-QA-\d+$/);
assert.equal(await status(),before+2,"One manual retry only");
const call = await submitBrief({...payload,project:"QA SUCCESS CALL",contactPreference:"call",phone:"+12025550101",email:""},"en",{fetchImpl});
assert.match(call.referenceCode,/^ZMX-QA-\d+$/);
assert.notEqual(email.referenceCode,call.referenceCode);
assert.equal(await status(),before+3);
console.log("PASS: isolated real-HTTP failure → manual retry → valid email save; English call save; distinct references and exactly 3 POSTs. Not browser interaction or production backend verification.");
