import assert from "node:assert/strict";
import { readBrowserValue, writeBrowserValue, removeBrowserValue } from "../src/utils/browserStorage.js";

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
let checks = 0;
const check = (actual, expected) => { assert.equal(actual, expected); checks++; };
try {
  delete globalThis.window;
  check(readBrowserValue("language", "ar"), "ar");
  check(writeBrowserValue("language", "en"), false);
  check(removeBrowserValue("draft"), false);
  const values = new Map();
  globalThis.window = { localStorage: {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
  }};
  check(readBrowserValue("missing", "fallback"), "fallback");
  check(writeBrowserValue("language", "en"), true);
  check(readBrowserValue("language"), "en");
  check(writeBrowserValue("empty", ""), true);
  check(readBrowserValue("empty", "fallback"), "");
  check(removeBrowserValue("language"), true);
  check(readBrowserValue("language"), null);
  for (const name of ["SecurityError", "QuotaExceededError"]) {
    const fail = () => { throw new DOMException("blocked", name); };
    globalThis.window = {localStorage:{getItem:fail,setItem:fail,removeItem:fail}};
    check(readBrowserValue("language", "ar"), "ar");
    check(writeBrowserValue("language", "en"), false);
    check(removeBrowserValue("draft"), false);
  }
  globalThis.window = Object.defineProperty({}, "localStorage", {get(){throw new Error("storage getter blocked");}});
  check(readBrowserValue("draft"), null);
  check(writeBrowserValue("language", "en"), false);
  check(removeBrowserValue("draft"), false);
  console.log(`PASS: ${checks} browser-storage checks: SSR, normal persistence, empty values, privacy denial, quota and blocked storage getter. No network.`);
} finally {
  delete globalThis.window;
  if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
}
