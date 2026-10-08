// Read-only probes: no quote sends, payment changes or Telegram calls.
import { pathToFileURL } from "node:url";
export async function checkResponse(response, expectedStatus, key) {
  const payload = await response.json().catch(() => null);
  return (
    response.status === expectedStatus &&
    response.headers.get("content-type")?.includes("application/json") &&
    payload !== null &&
    typeof payload === "object" &&
    (!key || Array.isArray(payload[key]))
  );
}
export async function runChecks(base = process.env.BASE || "http://127.0.0.1:8788") {
  const routes = [
    ["/api/catalog", 200, "items"],
    ...["requests", "catalog", "quotes", "projects", "payments", "promotions", "audit"].map(
      (route) => [`/api/studio/${route}`, 401],
    ),
  ];
  let failed = 0;
  for (const [path, expected, key] of routes) {
    let pass = false;
    try {
      const response = await fetch(base + path, {
        redirect: "manual",
        signal: AbortSignal.timeout(8000),
        headers: { Accept: "application/json" },
      });
      pass = await checkResponse(response, expected, key);
    } catch {
      /* Network errors fail without exposing payloads. */
    }
    console.log(`${pass ? "PASS" : "FAIL"} GET ${path}`);
    if (!pass) failed++;
  }
  return failed;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  process.exitCode = (await runChecks()) ? 1 : 0;
