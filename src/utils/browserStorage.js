// Browser storage is optional: privacy settings/quota must not block core flows.
export function readBrowserValue(key, fallback = null) {
  try {
    return typeof window === "undefined" ? fallback : window.localStorage.getItem(key) ?? fallback;
  } catch { return fallback; }
}

export function writeBrowserValue(key, value) {
  try {
    if (typeof window === "undefined") return false;
    window.localStorage.setItem(key, value);
    return true;
  } catch { return false; }
}

export function removeBrowserValue(key) {
  try {
    if (typeof window === "undefined") return false;
    window.localStorage.removeItem(key);
    return true;
  } catch { return false; }
}
