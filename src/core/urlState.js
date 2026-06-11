/* Shareable links: the whole view state lives in location.hash, so any
   view (including pinned anomalies) is reproducible from its URL. */

function b64encode(s) {
  return btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64decode(s) {
  return decodeURIComponent(escape(atob(s.replace(/-/g, "+").replace(/_/g, "/"))));
}

export function encodeState(state) {
  try { return "#v=" + b64encode(JSON.stringify(state)); } catch (e) { return ""; }
}

export function decodeState(hash = typeof window !== "undefined" ? window.location.hash : "") {
  if (!hash || !hash.startsWith("#v=")) return null;
  try { return JSON.parse(b64decode(hash.slice(3))); } catch (e) { return null; }
}

export function writeStateToUrl(state) {
  if (typeof window === "undefined") return;
  const h = encodeState(state);
  if (h && window.location.hash !== h) window.history.replaceState(null, "", h);
}

export function currentShareUrl(state) {
  if (typeof window === "undefined") return "";
  return window.location.origin + window.location.pathname + encodeState(state);
}
