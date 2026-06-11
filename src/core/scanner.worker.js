/* Anomaly scanner worker: keeps the sweep off the UI thread. */

import { runScan, prepareScan, sequenceFor } from "./anomaly.js";

self.onmessage = (e) => {
  const { N } = e.data;
  try {
    const results = runScan(N, (frac, note) => self.postMessage({ type: "progress", frac, note }));
    const prep = prepareScan(N);
    for (const r of results) {
      try { r.seq = sequenceFor(r, prep); } catch (err) { r.seq = null; }
    }
    self.postMessage({ type: "done", results });
  } catch (err) {
    self.postMessage({ type: "error", message: err.message });
  }
};
