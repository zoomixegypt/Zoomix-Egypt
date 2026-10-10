import assert from "node:assert/strict";
import { submitBrief } from "../src/utils/submitBrief.js";
let cases = 0;
for (const language of ["ar", "en"]) {
  let calls = 0;
  const payload = { name: "QA isolated", contactPreference: "email" };
  const result = await submitBrief(payload, language, { fetchImpl: async (url, init) => {
    calls++;
    assert.equal(url, "/api/briefs");
    assert.equal(init.method, "POST");
    assert.deepEqual(JSON.parse(init.body), payload);
    assert.ok(init.signal);
    return new Response(JSON.stringify({ ok: true, referenceCode: "ZMX-QA", editUrl: "" }), { status: 201 });
  }});
  assert.equal(result.referenceCode, "ZMX-QA");
  assert.equal(calls, 1);
  cases++;
  for (const response of [new Response("<html>fallback</html>"), new Response("{}"), new Response('{"ok":true}'), new Response('{"error":"private server trace"}', {status:500}), new Response("{}",{status:429})]) {
    await assert.rejects(submitBrief(payload, language, {fetchImpl: async()=>response}), error=>!error.message.includes("private server trace"));
    cases++;
  }
  await assert.rejects(submitBrief(payload,language,{fetchImpl:async()=>{throw new TypeError("Failed to fetch");}}),language==="ar" ? /انقطع الاتصال/ : /Connection lost/);
  cases++;
  let timeoutCalls = 0;
  await assert.rejects(submitBrief(payload,language,{timeoutMs:5,fetchImpl:async(_url,{signal})=>{
    timeoutCalls++;
    return new Promise((_resolve,reject)=>signal.addEventListener("abort",()=>reject(new DOMException("Aborted","AbortError")),{once:true}));
  }}),language==="ar" ? /قد يكون محفوظًا/ : /may have been saved/);
  assert.equal(timeoutCalls,1);
  cases++;
}
console.log(`PASS: ${cases} isolated bilingual submission cases; valid receipt, HTML/malformed/empty response, server rejection, rate limit, offline and timeout. No network calls or automatic retries.`);
