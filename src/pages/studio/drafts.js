const KEY = "zoomix-studio-drafts-v2";
export function readDrafts(storage = globalThis.localStorage) {
  const rows = JSON.parse(storage?.getItem(KEY) || "{}");
  if (!rows || typeof rows !== "object" || Array.isArray(rows))
    throw new Error("Invalid draft storage");
  return rows;
}
export function writeDraft(id, draft, storage = globalThis.localStorage) {
  if (!storage) throw new Error("Local storage unavailable");
  const rows = readDrafts(storage);
  const saved = { ...draft, savedAt: new Date().toISOString() };
  rows[id] = saved;
  storage.setItem(KEY, JSON.stringify(rows));
  return saved;
}
export function removeDraft(id, storage = globalThis.localStorage) {
  const rows = readDrafts(storage);
  delete rows[id];
  storage.setItem(KEY, JSON.stringify(rows));
}
