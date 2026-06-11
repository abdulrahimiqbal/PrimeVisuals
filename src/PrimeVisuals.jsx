import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Eye, EyeOff } from "lucide-react";

import { T, FONT_CSS, hslPx } from "./core/theme.js";
import { loadPresets, savePresets } from "./core/storage.js";
import { ZEROS } from "./core/math.js";
import { parseExpr, evalAst, astUses, makeFns, computeLabSeries } from "./core/engine.js";
import {
  SOURCES, PLANES, LENSES, LIBRARY, NB, ramp, fmt,
  padBounds, baseline, withDefaults, caption,
} from "./core/registry.js";
import {
  withLabDefaults, LAB_TEMPLATES, cloneGraph, compileGraphToLab,
  NODE_PALETTE, createNodeFromPalette, nodeInputPorts, nextInputPort, gedge,
} from "./core/labkit.js";
import { patchGuide, labGuide, hoverInfo, sceneProjector } from "./core/guides.js";

/* ════════════════════════════════════════════════════════════════
   PRIMEVISUALS — a patchable instrument for prime-number structure
   Pipeline:  SOURCE (what numbers) → PLANE (where they live) → LENS (how they glow)
   Every module is one entry in a registry. Adding a visualization = adding an entry.
   ════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════ THE INSTRUMENT ═══════════════════════════════ */

export default function PrimeVisuals() {
  const [cfg, setCfg] = useState(() => withDefaults(LIBRARY[0].cfg));
  const [mode, setMode] = useState("patch"); // 'patch' | 'lab'
  const [lab, setLab] = useState(() => withLabDefaults(LAB_TEMPLATES[0].lab));
  const [labGraph, setLabGraph] = useState(() => cloneGraph(LAB_TEMPLATES[0].graph));
  const [labEditor, setLabEditor] = useState("canvas");
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [connectFrom, setConnectFrom] = useState(null);
  const [fieldNote, setFieldNote] = useState(""); // complex-field render status
  const [saved, setSaved] = useState([]);
  const [saveName, setSaveName] = useState("");
  const [storageOk, setStorageOk] = useState(true);
  const [tick, setTick] = useState(0); // forces caption refresh after walk end value lands
  const [uiVisible, setUiVisible] = useState(true);
  const [hoverTip, setHoverTip] = useState(null);

  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const graphRef = useRef(null);
  const view = useRef({ z: 1, ox: 0, oy: 0 });
  const drag = useRef(null);
  const drawRef = useRef(() => {});
  const fieldCanvas = useRef(null);  // offscreen canvas for domain coloring
  const fieldGen = useRef(0);        // cancels stale progressive renders
  const focusRef = useRef(null);     // which formula field gets object-chip inserts
  const lastLab = useRef(null);      // last good lab result, kept through typos
  const hoverFrame = useRef(0);
  const hoverPoint = useRef(null);

  /* ----- pipeline computation (each stage re-runs only when ITS params change) ----- */
  const srcKey = (SOURCES[cfg.source].params || []).map((d) => cfg.p[d.key]).join("|");
  const planeKey = (PLANES[cfg.plane].params || []).map((d) => cfg.p[d.key]).join("|");
  const lensKey = (LENSES[cfg.lens].params || []).map((d) => cfg.p[d.key]).join("|");

  const data = useMemo(() => {
    const d = SOURCES[cfg.source].gen(cfg.p);
    let a = 0; for (let i = 0; i < d.ww.length; i++) a += d.ww[i];
    d._end = a;
    return d;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg.source, srcKey]);

  const mapped = useMemo(
    () => PLANES[cfg.plane].map(data, cfg.p),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, cfg.plane, planeKey]
  );

  const colors = useMemo(() => {
    const lens = LENSES[cfg.lens];
    const pal = lens.palette(cfg.p);
    const L = mapped.xs.length;
    const buckets = new Uint8Array(L);
    let lo = 0, span = 1;
    if (lens.needsRange) {
      lo = Infinity; let hi = -Infinity;
      for (let i = 0; i < L; i++) { if (data.w[i] < lo) lo = data.w[i]; if (data.w[i] > hi) hi = data.w[i]; }
      span = hi - lo || 1;
    }
    const intLens = cfg.lens === "residue" && data.domain !== "int";
    for (let i = 0; i < L; i++) {
      buckets[i] = intLens
        ? Math.min(NB - 1, Math.floor((i / L) * NB))      // residue on a curve falls back to sequence
        : lens.bucket(data, i, L, cfg.p, lo, span);
    }
    return { pal: intLens ? LENSES.aurora.palette() : pal, buckets };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, mapped, cfg.lens, lensKey]);

  /* ----- LAB evaluation: formulas → series (or a field spec for ℂ) ----- */
  const labData = useMemo(() => {
    if (mode !== "lab") return null;
    try {
      if (lab.domain === "complex") {
        const ast = parseExpr(lab.ew && lab.ew.trim() ? lab.ew : "s");
        const out = {
          field: { ast, sMin: 0.05, sMax: lab.sMax, tMax: lab.tMax, usesZ: astUses(ast, "zeta") },
          err: null,
        };
        lastLab.current = out; return out;
      }
      const series = computeLabSeries(lab);
      const out = { series, err: null };
      lastLab.current = out; return out;
    } catch (e) {
      return { ...(lastLab.current || {}), err: e.message };
    }
  }, [mode, lab]);

  useEffect(() => {
    if (mode !== "lab" || labEditor !== "canvas") return;
    const compiled = compileGraphToLab(labGraph);
    setLab((prev) => {
      const next = withLabDefaults({ ...prev, ...compiled });
      const keys = ["domain", "ex", "ey", "eh", "ew"];
      return keys.every((k) => prev[k] === next[k]) ? prev : next;
    });
  }, [mode, labEditor, labGraph]);

  /* ----- unified scene: what draw() renders, whichever mode we're in ----- */
  const scene = useMemo(() => {
    if (mode === "patch") {
      return { xs: mapped.xs, ys: mapped.ys, mode: mapped.mode, bounds: mapped.bounds, decor: mapped.decor, pal: colors.pal, buckets: colors.buckets };
    }
    if (!labData) return { xs: new Float64Array(0), ys: new Float64Array(0), mode: "points", pal: [], buckets: new Uint8Array(0) };
    if (labData.field) {
      const f = labData.field;
      const AR = 0.72; // display the strip at a fixed pleasant aspect; axes carry the real units
      return { fieldMeta: f, bounds: { x0: 0, x1: AR, y0: 0, y1: 1 } };
    }
    const S = labData.series;
    if (!S) return { xs: new Float64Array(0), ys: new Float64Array(0), mode: "points", pal: [], buckets: new Uint8Array(0) };
    const buckets = new Uint8Array(S.L);
    const span = S.hueSpan;
    for (let i = 0; i < S.L; i++) {
      buckets[i] = span > 1e-12 ? Math.min(NB - 1, Math.floor(((S.hue[i] - S.hueLo) / span) * NB)) : 24;
    }
    const pal = span > 1e-12 ? ramp((t) => `hsl(${(190 + 320 * t) % 360} 88% 60%)`) : new Array(NB).fill(T.ion);
    const showZeros = lab.domain === "real" && /zeta/.test(lab.ey || "") && (lab.ex || "").trim() === "t";
    const decor = (ctx, px, th2) => {
      baseline(ctx, px, th2, S.xs[0] || 0, S.xs[S.L - 1] || 1);
      if (showZeros) {
        ctx.fillStyle = th2.rose;
        ZEROS.filter((z) => z <= lab.tMax).forEach((z) => {
          const [sx, sy] = px(z, 0);
          ctx.beginPath(); ctx.arc(sx, sy, 2.6, 0, 7); ctx.fill();
        });
        ctx.fillStyle = th2.dim; ctx.font = `10px ${th2.mono}`; ctx.textAlign = "left";
        const [lx, ly] = px(ZEROS[0], 0);
        ctx.fillText("known zeros (they live at σ = ½)", lx + 8, ly + 14);
      }
    };
    return { xs: S.xs, ys: S.ys, mode: S.mode, bounds: padBounds(S.xs, S.ys, 0.07, { y0: 0 }), decor, pal, buckets };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, mapped, colors, labData, lab.tMax, lab.ey, lab.ex, lab.domain]);

  /* ----- renderer ----- */
  const draw = useCallback(() => {
    const cv = canvasRef.current, wrap = wrapRef.current;
    if (!cv || !wrap) return;
    const dpr = window.devicePixelRatio || 1;
    const W = wrap.clientWidth, H = wrap.clientHeight;
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    const ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = T.void; ctx.fillRect(0, 0, W, H);
    const g = ctx.createRadialGradient(W * 0.5, H * 0.45, 0, W * 0.5, H * 0.45, Math.max(W, H) * 0.75);
    g.addColorStop(0, "rgba(60,80,140,0.10)"); g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    const { xs, ys, mode: dmode } = scene.fieldMeta ? { xs: null, ys: null, mode: "field" } : scene;
    const b = scene.bounds || (xs ? padBounds(xs, ys, 0.06) : { x0: 0, x1: 1, y0: 0, y1: 1 });
    const M = 26;
    const sc = Math.min((W - 2 * M) / (b.x1 - b.x0 || 1), (H - 2 * M) / (b.y1 - b.y0 || 1));
    const cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2;
    const v = view.current;
    const px = (x, y) => [(x - cx) * sc * v.z + W / 2 + v.ox, -(y - cy) * sc * v.z + H / 2 + v.oy];

    /* ── complex field: blit the progressively-rendered domain coloring ── */
    if (scene.fieldMeta) {
      const f = scene.fieldMeta;
      const [X0, Y0] = px(b.x0, b.y1), [X1, Y1] = px(b.x1, b.y0);
      if (fieldCanvas.current) {
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(fieldCanvas.current, X0, Y0, X1 - X0, Y1 - Y0);
      }
      const sigToX = (s) => b.x0 + ((s - f.sMin) / (f.sMax - f.sMin)) * (b.x1 - b.x0);
      const tToY = (t) => (t / f.tMax) * (b.y1 - b.y0);
      ctx.font = `10px ${T.mono}`;
      // σ ticks
      ctx.fillStyle = T.dim; ctx.textAlign = "center";
      [0.5, 1, 1.5].filter((s) => s <= f.sMax).forEach((s) => {
        const [sx, sy] = px(sigToX(s), 0);
        ctx.fillText(s === 0.5 ? "½" : String(s), sx, sy + 14);
      });
      // t ticks
      ctx.textAlign = "right";
      for (let t = 10; t <= f.tMax; t += 10) {
        const [sx, sy] = px(b.x0, tToY(t));
        ctx.fillText(`t=${t}`, sx - 6, sy + 3);
      }
      // the critical line
      const [clx, clTop] = px(sigToX(0.5), b.y1); const [, clBot] = px(sigToX(0.5), b.y0);
      ctx.strokeStyle = T.ion; ctx.setLineDash([6, 5]); ctx.lineWidth = 1.2; ctx.globalAlpha = 0.85;
      ctx.beginPath(); ctx.moveTo(clx, clTop); ctx.lineTo(clx, clBot); ctx.stroke();
      ctx.setLineDash([]); ctx.globalAlpha = 1;
      ctx.fillStyle = T.ion; ctx.textAlign = "left";
      ctx.fillText("σ = ½ — the dark points sit only here", clx + 8, clTop + 14);
      // pole marker at s = 1 (if it's in frame)
      if (f.sMax >= 1) {
        const [pxx, pyy] = px(sigToX(1), tToY(0));
        ctx.fillStyle = T.amber; ctx.textAlign = "left";
        ctx.fillText("← pole at s = 1", pxx + 6, pyy - 8);
      }
      return;
    }

    const L = xs.length; if (!L) return;
    const { pal, buckets } = scene;

    if (dmode === "points") {
      ctx.globalCompositeOperation = "lighter";
      const s = L < 2500 ? 3 : L < 16000 ? 2.3 : 1.7;
      const groups = []; for (let k = 0; k < NB; k++) groups.push([]);
      for (let i = 0; i < L; i++) groups[buckets[i]].push(i);
      for (let k = 0; k < NB; k++) {
        const idx = groups[k]; if (!idx.length) continue;
        ctx.fillStyle = pal[k]; ctx.globalAlpha = 0.92;
        for (let j = 0; j < idx.length; j++) {
          const [sx, sy] = px(xs[idx[j]], ys[idx[j]]);
          if (sx < -4 || sy < -4 || sx > W + 4 || sy > H + 4) continue;
          ctx.fillRect(sx - s / 2, sy - s / 2, s, s);
        }
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    } else if (dmode === "orbs") {
      ctx.globalCompositeOperation = "source-over";
      for (let i = 0; i < L; i++) {
        const [sx, sy] = px(xs[i], ys[i]);
        ctx.fillStyle = pal[buckets[i]];
        ctx.shadowColor = pal[buckets[i]]; ctx.shadowBlur = 14;
        ctx.beginPath(); ctx.arc(sx, sy, 4, 0, 7); ctx.fill();
      }
      ctx.shadowBlur = 0;
    } else {
      const heavyPath = L > 24000;
      const simplifyPx = heavyPath ? 0.85 : 0;
      ctx.lineWidth = heavyPath ? 1.1 : 1.6; ctx.lineJoin = "round";
      ctx.shadowBlur = heavyPath ? 0 : 7;
      let i0 = 0;
      while (i0 < L - 1) {
        let i1 = i0 + 1;
        while (i1 < L - 1 && buckets[i1] === buckets[i0] && i1 - i0 < 80) i1++;
        ctx.strokeStyle = pal[buckets[i0]]; ctx.shadowColor = pal[buckets[i0]];
        ctx.beginPath();
        let [sx, sy] = px(xs[i0], ys[i0]); ctx.moveTo(sx, sy);
        let lastDrawX = sx, lastDrawY = sy;
        for (let i = i0 + 1; i <= i1; i++) {
          const [nx, ny] = px(xs[i], ys[i]);
          if (simplifyPx && i < i1 && Math.abs(nx - lastDrawX) < simplifyPx && Math.abs(ny - lastDrawY) < simplifyPx) continue;
          if (dmode === "step") ctx.lineTo(nx, sy);
          ctx.lineTo(nx, ny); sx = nx; sy = ny;
          lastDrawX = nx; lastDrawY = ny;
        }
        ctx.stroke();
        i0 = i1;
      }
      ctx.shadowBlur = 0;
    }

    if (scene.decor) scene.decor(ctx, px, T);
  }, [scene]);

  useEffect(() => { drawRef.current = draw; draw(); }, [draw]);
  useEffect(() => { view.current = { z: 1, ox: 0, oy: 0 }; setTick((t) => t + 1); }, [cfg.source, cfg.plane, mode, lab.domain]);

  /* ----- progressive domain coloring of w(s) over the strip ----- */
  useEffect(() => {
    if (mode !== "lab" || !labData || !labData.field) { fieldGen.current++; setFieldNote(""); return; }
    const f = labData.field;
    const gen = ++fieldGen.current;
    const COLS = 170, ROWS = 230;
    if (!fieldCanvas.current) fieldCanvas.current = document.createElement("canvas");
    const oc = fieldCanvas.current; oc.width = COLS; oc.height = ROWS;
    const octx = oc.getContext("2d");
    const img = octx.createImageData(COLS, ROWS);
    for (let i = 3; i < img.data.length; i += 4) img.data[i] = 255;
    const fns = makeFns(null);
    const env = { i: [0, 1], pi: [Math.PI, 0], e: [Math.E, 0], a: [lab.a, 0], b: [lab.b, 0], s: [0, 0] };
    let col = 0;
    const t0 = performance.now();
    const stepFn = () => {
      if (gen !== fieldGen.current) return; // a newer render superseded this one
      const start = performance.now();
      while (col < COLS && performance.now() - start < 14) {
        const sig = f.sMin + (col / (COLS - 1)) * (f.sMax - f.sMin);
        for (let row = 0; row < ROWS; row++) {
          env.s = [sig, (1 - row / (ROWS - 1)) * f.tMax];
          let z; try { z = evalAst(f.ast, env, fns); } catch (e) { z = [0, 0]; }
          let r, g2, bl;
          if (!isFinite(z[0]) || !isFinite(z[1])) { r = g2 = bl = 255; }
          else {
            const mag = Math.hypot(z[0], z[1]);
            const h = (Math.atan2(z[1], z[0]) + Math.PI) / (2 * Math.PI);
            const l0 = mag / (1 + mag);
            const bb = Math.log2(mag + 1e-9), mf = bb - Math.floor(bb);
            const Lt = Math.min(0.97, (0.10 + 0.78 * l0) * (0.84 + 0.16 * mf));
            const St = Math.min(1, 0.95 - 0.55 * l0);
            const rgb = hslPx(h, St, Lt); r = rgb[0]; g2 = rgb[1]; bl = rgb[2];
          }
          const o = (row * COLS + col) * 4;
          img.data[o] = r; img.data[o + 1] = g2; img.data[o + 2] = bl;
        }
        col++;
      }
      octx.putImageData(img, 0, 0);
      drawRef.current();
      if (col < COLS) {
        setFieldNote(`painting w(s) over the strip … ${Math.round((100 * col) / COLS)}%`);
        requestAnimationFrame(stepFn);
      } else {
        setFieldNote(`${COLS}×${ROWS} field · ${Math.round(performance.now() - t0)} ms · hue = arg, brightness = |w|`);
      }
    };
    requestAnimationFrame(stepFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, labData]);

  useEffect(() => {
    const wrap = wrapRef.current; if (!wrap) return;
    const ro = new ResizeObserver(() => drawRef.current());
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const onWheel = (e) => {
      e.preventDefault();
      const r = cv.getBoundingClientRect();
      const mx = e.clientX - r.left, my = e.clientY - r.top;
      const f = Math.exp(-e.deltaY * 0.0014);
      const v = view.current;
      const W = r.width, H = r.height;
      v.ox = mx - (mx - (v.ox + W / 2)) * f - W / 2;
      v.oy = my - (my - (v.oy + H / 2)) * f - H / 2;
      v.z *= f;
      drawRef.current();
    };
    cv.addEventListener("wheel", onWheel, { passive: false });
    return () => cv.removeEventListener("wheel", onWheel);
  }, []);

  const onPointerDown = (e) => {
    setHoverTip(null);
    drag.current = { x: e.clientX, y: e.clientY, ox: view.current.ox, oy: view.current.oy };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (drag.current) {
      setHoverTip(null);
      view.current.ox = drag.current.ox + (e.clientX - drag.current.x);
      view.current.oy = drag.current.oy + (e.clientY - drag.current.y);
      drawRef.current();
      return;
    }
    scheduleInspect(e);
  };
  const onPointerUp = () => { drag.current = null; };
  const onPointerLeave = () => {
    hoverPoint.current = null;
    if (hoverFrame.current) {
      cancelAnimationFrame(hoverFrame.current);
      hoverFrame.current = 0;
    }
    if (!drag.current) setHoverTip(null);
  };
  const zoomBy = (f) => { view.current.z *= f; drawRef.current(); };
  const resetView = () => { view.current = { z: 1, ox: 0, oy: 0 }; drawRef.current(); };

  const scheduleInspect = (e) => {
    hoverPoint.current = { clientX: e.clientX, clientY: e.clientY };
    if (hoverFrame.current) return;
    hoverFrame.current = requestAnimationFrame(() => {
      hoverFrame.current = 0;
      inspectPointer();
    });
  };

  const inspectPointer = () => {
    if (!uiVisible || scene.fieldMeta || !scene.xs || !scene.ys) { setHoverTip(null); return; }
    const wrap = wrapRef.current;
    const projector = sceneProjector(scene, wrap, view.current);
    const point = hoverPoint.current;
    if (!wrap || !projector || !point) { setHoverTip(null); return; }
    const rect = wrap.getBoundingClientRect();
    const mx = point.clientX - rect.left, my = point.clientY - rect.top;
    const threshold = scene.mode === "orbs" ? 11 : scene.mode === "points" ? 8 : 10;
    const threshold2 = threshold * threshold;
    let best = -1, bestD = threshold2;
    const xs = scene.xs, ys = scene.ys;
    const maxChecks = scene.mode === "points" ? 30000 : 9000;
    const stride = Math.max(1, Math.ceil(xs.length / maxChecks));
    for (let i = 0; i < xs.length; i += stride) {
      const sx = projector.projectX(xs[i]);
      const sy = projector.projectY(ys[i]);
      if (sx < -threshold || sy < -threshold || sx > projector.W + threshold || sy > projector.H + threshold) continue;
      const dx = sx - mx, dy = sy - my, d2 = dx * dx + dy * dy;
      if (d2 <= bestD) { best = i; bestD = d2; }
    }
    if (best < 0) { setHoverTip(null); return; }
    const info = hoverInfo(mode, cfg, data, lab, labData, best);
    if (!info) { setHoverTip(null); return; }
    setHoverTip({
      ...info,
      index: best,
      x: Math.max(8, Math.min(mx + 12, projector.W - 250)),
      y: Math.max(8, Math.min(my + 12, projector.H - 116)),
    });
  };

  /* ----- presets: persistent storage ----- */
  useEffect(() => {
    (async () => {
      try {
        const r = await loadPresets();
        if (r && r.value) setSaved(JSON.parse(r.value));
      } catch (e) { setStorageOk(false); }
    })();
  }, []);

  const persist = async (list) => {
    setSaved(list);
    try { await savePresets(list); setStorageOk(true); }
    catch (e) { setStorageOk(false); }
  };
  const savePreset = () => {
    const auto = mode === "patch"
      ? `${SOURCES[cfg.source].label} → ${PLANES[cfg.plane].label}`
      : labEditor === "canvas" ? `Canvas · ${labGraph.domain}` : (lab.domain === "complex" ? `w = ${lab.ew}` : `y = ${lab.ey}`).slice(0, 30);
    const name = saveName.trim() || auto;
    const item = mode === "patch"
      ? { name, ts: Date.now(), cfg: JSON.parse(JSON.stringify(cfg)) }
      : { name, ts: Date.now(), lab: JSON.parse(JSON.stringify(lab)), graph: cloneGraph(labGraph), editor: labEditor };
    persist([...saved, item]);
    setSaveName("");
  };
  const deletePreset = (ts) => persist(saved.filter((s) => s.ts !== ts));
  const applyAny = (item) => {
    if (item.lab) {
      setMode("lab");
      setLab(withLabDefaults(JSON.parse(JSON.stringify(item.lab))));
      if (item.graph) setLabGraph(cloneGraph(item.graph));
      setLabEditor(item.graph ? (item.editor || "canvas") : "formula");
      setSelectedNodeId(null);
      setConnectFrom(null);
    }
    else { setMode("patch"); setCfg(withDefaults(JSON.parse(JSON.stringify(item.cfg)))); }
  };

  /* ----- config plumbing ----- */
  const setSource = (id) => {
    let plane = cfg.plane;
    if (!PLANES[plane].accepts.includes(SOURCES[id].domain)) {
      plane = Object.keys(PLANES).find((k) => PLANES[k].accepts.includes(SOURCES[id].domain));
    }
    setCfg(withDefaults({ ...cfg, source: id, plane }));
  };
  const setPlane = (id) => setCfg(withDefaults({ ...cfg, plane: id }));
  const setLens = (id) => setCfg(withDefaults({ ...cfg, lens: id }));
  const setParam = (key, val) => setCfg({ ...cfg, p: { ...cfg.p, [key]: val } });

  const dv = lab.domain === "int" ? "n" : lab.domain === "real" ? "t" : "s";
  const insertTok = (txt) => {
    const f = focusRef.current;
    const key = (f && f.key) || (lab.domain === "complex" ? "ew" : "ey");
    const cur = lab[key] || "";
    let pos = cur.length;
    if (f && f.el && typeof f.el.selectionStart === "number") pos = f.el.selectionStart;
    setLab({ ...lab, [key]: cur.slice(0, pos) + txt + cur.slice(pos) });
    if (f && f.el) setTimeout(() => { try { f.el.focus(); f.el.setSelectionRange(pos + txt.length, pos + txt.length); } catch (e) {} }, 0);
  };

  const setGraphDomain = (domain) => {
    setLabGraph((g) => ({ ...g, domain }));
    setLab((l) => ({ ...l, domain }));
  };
  const applyLabTemplate = (tpl) => {
    setMode("lab");
    setLab(withLabDefaults(JSON.parse(JSON.stringify(tpl.lab))));
    setLabGraph(cloneGraph(tpl.graph));
    setLabEditor("canvas");
    setSelectedNodeId(null);
    setConnectFrom(null);
  };
  const updateNode = (id, patch) => setLabGraph((g) => ({
    ...g,
    nodes: g.nodes.map((n) => n.id === id ? { ...n, ...patch, params: { ...n.params, ...(patch.params || {}) } } : n),
  }));
  const deleteNode = (id) => setLabGraph((g) => ({
    ...g,
    nodes: g.nodes.filter((n) => n.id !== id),
    edges: g.edges.filter((e) => e.from !== id && e.to !== id),
  }));
  const addEdge = (from, to, preferredPort) => setLabGraph((g) => {
    if (!from || !to || from === to) return g;
    const target = g.nodes.find((n) => n.id === to);
    if (!target || !nodeInputPorts(target).length) return g;
    const toPort = preferredPort || nextInputPort(g, target);
    const edges = g.edges.filter((e) => !(e.to === to && e.toPort === toPort));
    return { ...g, edges: [...edges, gedge(from, to, toPort)] };
  });
  const deleteEdge = (id) => setLabGraph((g) => ({ ...g, edges: g.edges.filter((e) => e.id !== id) }));
  const handlePaletteDrag = (e, defId) => {
    e.dataTransfer.setData("application/x-primevisuals-node", defId);
    e.dataTransfer.effectAllowed = "copy";
  };
  const handleNodeOutputDrag = (e, nodeId) => {
    e.stopPropagation();
    e.dataTransfer.setData("application/x-primevisuals-edge", nodeId);
    e.dataTransfer.effectAllowed = "link";
  };
  const handleGraphDrop = (e) => {
    e.preventDefault();
    const defId = e.dataTransfer.getData("application/x-primevisuals-node");
    if (!defId || !graphRef.current) return;
    const r = graphRef.current.getBoundingClientRect();
    const node = createNodeFromPalette(defId, Math.max(8, e.clientX - r.left - 70), Math.max(8, e.clientY - r.top - 20));
    setLabGraph((g) => ({ ...g, nodes: [...g.nodes, node] }));
    setSelectedNodeId(node.id);
  };
  const handleNodeDragStart = (e, node) => {
    e.preventDefault();
    const start = {
      x: e.clientX, y: e.clientY, nx: node.x, ny: node.y,
      move: null, up: null,
    };
    start.move = (ev) => {
      setLabGraph((g) => ({
        ...g,
        nodes: g.nodes.map((n) => n.id === node.id ? { ...n, x: Math.max(4, start.nx + ev.clientX - start.x), y: Math.max(4, start.ny + ev.clientY - start.y) } : n),
      }));
    };
    start.up = () => {
      window.removeEventListener("pointermove", start.move);
      window.removeEventListener("pointerup", start.up);
    };
    window.addEventListener("pointermove", start.move);
    window.addEventListener("pointerup", start.up);
  };

  const cap = useMemo(() => {
    if (mode === "lab") {
      if (labData && labData.err) return `⚠ ${labData.err}`;
      if (labData && labData.field) return fieldNote || "complex field";
      const S = labData && labData.series;
      if (!S) return "";
      const onLine = Math.abs(lab.a - 0.5) < 1e-9;
      const sig = lab.domain === "real" && /zeta/.test(lab.ey || "")
        ? ` · σ = a = ${(+lab.a).toFixed(3)} ${onLine ? "— on the critical line" : "— off the line: the dips stop touching 0"}`
        : "";
      return `${S.L} samples · ${S.ms} ms${S.usesZ ? " · ζ summed live" : ""}${sig}`;
    }
    return caption(cfg, data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, labData, lab, fieldNote, cfg, data, tick]);

  const readingSections = useMemo(
    () => mode === "patch" ? patchGuide(cfg, data) : labGuide(lab, labData),
    [mode, cfg, data, lab, labData]
  );

  useEffect(() => {
    setHoverTip(null);
    requestAnimationFrame(() => drawRef.current());
  }, [uiVisible]);

  /* ───────────────────────────── UI ───────────────────────────── */
  const slot = (num, title, children) => (
    <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10 }} className="p-3">
      <div className="flex items-baseline justify-between mb-2">
        <span style={{ fontFamily: T.mono, color: T.dim, fontSize: 10, letterSpacing: "0.18em" }}>{num} · {title}</span>
      </div>
      {children}
    </div>
  );

  const readingPanel = (
    <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10 }} className="p-3 mt-4">
      <div style={{ fontFamily: T.mono, color: T.dim, fontSize: 10, letterSpacing: "0.18em" }} className="mb-2">
        READING THIS VIEW
      </div>
      <div className="flex flex-col gap-1">
        {readingSections.map(([title, body]) => (
          <div key={title} className="rounded-md px-2 py-1" style={{ background: T.panel2, border: `1px solid ${T.line}` }}>
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ion, letterSpacing: "0.12em" }}>{title.toUpperCase()}</div>
            <div style={{ fontSize: 11, color: T.dim, lineHeight: 1.45 }}>{body}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const select = (value, onChange, entries, disabledFn) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md px-2 py-2 text-sm outline-none"
      style={{ background: T.panel2, color: T.ink, border: `1px solid ${T.line}`, fontFamily: T.sans }}
    >
      {entries.map(([id, m]) => {
        const off = disabledFn ? disabledFn(id, m) : false;
        return (
          <option key={id} value={id} disabled={off} style={{ color: off ? T.faint : T.ink, background: T.panel2 }}>
            {m.label}{off ? `  — needs ${m.accepts.join("/")}` : ""}
          </option>
        );
      })}
    </select>
  );

  const sliders = (defs) =>
    defs.map((d) => (
      <div key={d.key} className="mt-3">
        <div className="flex justify-between mb-1" style={{ fontFamily: T.mono, fontSize: 10, color: T.dim }}>
          <span>{d.label}</span>
          <span style={{ color: T.ink }}>{d.step < 1 ? (+cfg.p[d.key]).toFixed(3) : fmt(+cfg.p[d.key])}</span>
        </div>
        <input
          type="range" min={d.min} max={d.max} step={d.step} value={cfg.p[d.key]}
          onChange={(e) => setParam(d.key, +e.target.value)}
          className="w-full" style={{ accentColor: T.ion, height: 14 }}
        />
      </div>
    ));

  const labSlider = (key, label, min, max, step) => (
    <div className="mt-3" key={key}>
      <div className="flex justify-between mb-1" style={{ fontFamily: T.mono, fontSize: 10, color: T.dim }}>
        <span>{label}</span>
        <span style={{ color: T.ink }}>{step < 1 ? (+lab[key]).toFixed(3) : fmt(+lab[key])}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={lab[key]}
        onChange={(e) => setLab({ ...lab, [key]: +e.target.value })}
        className="w-full" style={{ accentColor: T.ion, height: 14 }}
      />
    </div>
  );

  const formulaField = (key, labelTxt) => (
    <div className="mt-2" key={key}>
      <div style={{ fontFamily: T.mono, fontSize: 10, color: T.dim }} className="mb-1">{labelTxt}</div>
      <input
        value={lab[key] || ""}
        onChange={(e) => setLab({ ...lab, [key]: e.target.value })}
        onFocus={(e) => { focusRef.current = { key, el: e.target }; }}
        spellCheck={false}
        className="w-full rounded-md px-2 py-2 outline-none"
        style={{ background: T.panel2, border: `1px solid ${T.line}`, color: T.ink, fontFamily: T.mono, fontSize: 11 }}
      />
    </div>
  );

  const connector = (
    <div className="flex flex-col items-center" style={{ height: 18 }}>
      <div style={{ width: 1, flex: 1, background: `linear-gradient(${T.ion}66, ${T.line})` }} />
      <div style={{ color: T.ion, fontSize: 9, lineHeight: "8px", opacity: 0.8 }}>▼</div>
    </div>
  );

  const chip = (id, label, onClick, onDelete) => (
    <div
      key={id}
      onClick={onClick}
      className="flex items-center justify-between rounded-md px-2 py-1 text-xs cursor-pointer select-none"
      style={{ background: T.panel2, border: `1px solid ${T.line}`, color: T.ink, fontFamily: T.sans }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = T.ion)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = T.line)}
    >
      <span className="truncate">{label}</span>
      {onDelete && (
        <span onClick={(e) => { e.stopPropagation(); onDelete(); }} className="ml-2" style={{ color: T.faint }}>✕</span>
      )}
    </div>
  );

  const graphBuilder = (() => {
    const groups = NODE_PALETTE.reduce((acc, item) => {
      (acc[item.group] ||= []).push(item);
      return acc;
    }, {});
    const selected = labGraph.nodes.find((n) => n.id === selectedNodeId);
    const nodeMap = Object.fromEntries(labGraph.nodes.map((n) => [n.id, n]));
    const compiled = (() => { try { return compileGraphToLab(labGraph); } catch (e) { return { err: e.message }; } })();
    return (
      <div>
        <div className="flex gap-1 mb-2">
          {["canvas", "formula"].map((m) => (
            <button
              key={m}
              onClick={() => setLabEditor(m)}
              className="px-2 py-1 rounded-md"
              style={{
                background: labEditor === m ? T.panel2 : "transparent",
                border: `1px solid ${labEditor === m ? T.ion + "66" : T.line}`,
                color: labEditor === m ? T.ion : T.dim,
                fontFamily: T.mono,
                fontSize: 10,
                letterSpacing: "0.12em",
              }}
            >
              {m === "canvas" ? "CANVAS" : "FORMULAS"}
            </button>
          ))}
        </div>

        {labEditor === "canvas" ? (
          <>
            <div style={{ fontFamily: T.mono, fontSize: 10, color: T.dim, letterSpacing: "0.18em" }} className="mb-2">
              TEMPLATES
            </div>
            <div className="grid grid-cols-2 gap-1 mb-3">
              {LAB_TEMPLATES.map((tpl) => chip(tpl.name, tpl.name, () => applyLabTemplate(tpl)))}
            </div>

            <div style={{ fontFamily: T.mono, fontSize: 10, color: T.dim, letterSpacing: "0.18em" }} className="mb-2">
              PALETTE
            </div>
            <div className="flex flex-col gap-1 mb-3">
              {Object.entries(groups).map(([group, items]) => (
                <div key={group}>
                  <div style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, letterSpacing: "0.12em" }}>{group.toUpperCase()}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {items.map((item) => (
                      <button
                        key={item.id}
                        draggable
                        onDragStart={(e) => handlePaletteDrag(e, item.id)}
                        onClick={() => {
                          const node = createNodeFromPalette(item.id, 24 + (labGraph.nodes.length % 3) * 76, 48 + (labGraph.nodes.length % 4) * 54);
                          setLabGraph((g) => ({ ...g, nodes: [...g.nodes, node] }));
                          setSelectedNodeId(node.id);
                        }}
                        className="rounded px-1"
                        style={{ background: T.panel2, border: `1px solid ${T.line}`, color: T.ion, fontFamily: T.mono, fontSize: 10, lineHeight: "18px" }}
                        title="Drag onto the canvas, or click to add"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div
              ref={graphRef}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleGraphDrop}
              className="relative rounded-md mb-2"
              style={{ height: 330, background: "#090B12", border: `1px solid ${T.line}`, overflow: "auto" }}
            >
              <svg width="640" height="460" className="absolute" style={{ left: 0, top: 0, pointerEvents: "none" }}>
                {labGraph.edges.map((edge) => {
                  const a = nodeMap[edge.from], b = nodeMap[edge.to];
                  if (!a || !b) return null;
                  const x1 = a.x + 132, y1 = a.y + 22, x2 = b.x, y2 = b.y + 22;
                  const mx = (x1 + x2) / 2;
                  return (
                    <path
                      key={edge.id}
                      d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
                      fill="none"
                      stroke={T.ion}
                      strokeOpacity="0.45"
                      strokeWidth="1.5"
                    />
                  );
                })}
              </svg>
              {labGraph.nodes.map((node) => {
                const selectedNode = selectedNodeId === node.id;
                const hasInput = nodeInputPorts(node).length > 0;
                return (
                  <div
                    key={node.id}
                    className="absolute rounded-md"
                    onClick={() => setSelectedNodeId(node.id)}
                    style={{
                      left: node.x,
                      top: node.y,
                      width: 132,
                      background: selectedNode ? "#111827" : T.panel2,
                      border: `1px solid ${selectedNode ? T.ion : T.line}`,
                      color: T.ink,
                      boxShadow: selectedNode ? "0 0 0 1px rgba(125,211,252,0.2)" : "none",
                    }}
                  >
                    <div
                      onPointerDown={(e) => handleNodeDragStart(e, node)}
                      className="px-2 py-1 cursor-pointer select-none"
                      style={{ borderBottom: `1px solid ${T.line}` }}
                    >
                      <div className="truncate" style={{ fontFamily: T.mono, fontSize: 10, color: node.kind === "channel" ? T.amber : T.ion }}>
                        {node.label}
                      </div>
                      <div style={{ fontFamily: T.mono, fontSize: 8, color: T.faint }}>{node.kind}</div>
                    </div>
                    <div className="flex items-center justify-between px-2 py-1">
                      {hasInput ? (
                        <button
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            addEdge(e.dataTransfer.getData("application/x-primevisuals-edge"), node.id);
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (connectFrom) { addEdge(connectFrom, node.id); setConnectFrom(null); }
                          }}
                          className="rounded px-1"
                          style={{ border: `1px solid ${connectFrom ? T.ion : T.line}`, color: T.dim, fontSize: 9, fontFamily: T.mono }}
                          title="Drop a relationship here"
                        >
                          IN
                        </button>
                      ) : <span />}
                      {node.kind !== "channel" && (
                        <button
                          draggable
                          onDragStart={(e) => handleNodeOutputDrag(e, node.id)}
                          onClick={(e) => { e.stopPropagation(); setConnectFrom(connectFrom === node.id ? null : node.id); }}
                          className="rounded px-1"
                          style={{ border: `1px solid ${connectFrom === node.id ? T.ion : T.line}`, color: T.ion, fontSize: 9, fontFamily: T.mono }}
                          title="Drag to another node input"
                        >
                          OUT
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {compiled.err ? (
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.rose }}>Graph error: {compiled.err}</div>
            ) : (
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, lineHeight: 1.45 }}>
                Compiles to {labGraph.domain === "complex" ? `w(s) = ${compiled.ew}` : `x = ${compiled.ex} · y = ${compiled.ey}${compiled.eh ? ` · hue = ${compiled.eh}` : ""}`}
              </div>
            )}

            {selected && (
              <div className="mt-2 rounded-md p-2" style={{ background: T.panel2, border: `1px solid ${T.line}` }}>
                <div className="flex items-center justify-between mb-1">
                  <div style={{ fontFamily: T.mono, fontSize: 10, color: T.ion, letterSpacing: "0.12em" }}>SELECTED NODE</div>
                  <button onClick={() => { deleteNode(selected.id); setSelectedNodeId(null); }} style={{ color: T.rose, fontFamily: T.mono, fontSize: 10 }}>Delete</button>
                </div>
                <input
                  value={selected.label}
                  onChange={(e) => updateNode(selected.id, { label: e.target.value })}
                  className="w-full rounded-md px-2 py-1 outline-none mb-1"
                  style={{ background: T.panel, border: `1px solid ${T.line}`, color: T.ink, fontSize: 11 }}
                />
                {(selected.kind === "custom" || selected.kind === "source") && (
                  <input
                    value={selected.params.expr || ""}
                    onChange={(e) => updateNode(selected.id, { params: { expr: e.target.value } })}
                    className="w-full rounded-md px-2 py-1 outline-none"
                    style={{ background: T.panel, border: `1px solid ${T.line}`, color: T.ink, fontFamily: T.mono, fontSize: 11 }}
                  />
                )}
                {selected.kind === "const" && (
                  <input
                    value={selected.params.value || ""}
                    onChange={(e) => updateNode(selected.id, { params: { value: e.target.value } })}
                    className="w-full rounded-md px-2 py-1 outline-none"
                    style={{ background: T.panel, border: `1px solid ${T.line}`, color: T.ink, fontFamily: T.mono, fontSize: 11 }}
                  />
                )}
                {selected.kind === "binary" && (
                  <select
                    value={selected.params.op || "+"}
                    onChange={(e) => updateNode(selected.id, { params: { op: e.target.value } })}
                    className="w-full rounded-md px-2 py-1 outline-none"
                    style={{ background: T.panel, border: `1px solid ${T.line}`, color: T.ink, fontFamily: T.mono, fontSize: 11 }}
                  >
                    {["+", "-", "*", "/", "^", "mod", "gcd", "dot"].map((op) => <option key={op} value={op}>{op}</option>)}
                  </select>
                )}
                <div className="mt-2">
                  <div style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, letterSpacing: "0.12em" }}>RELATIONSHIPS</div>
                  {labGraph.edges.filter((e) => e.from === selected.id || e.to === selected.id).length === 0 ? (
                    <div style={{ fontFamily: T.mono, fontSize: 9, color: T.faint }}>No links yet.</div>
                  ) : labGraph.edges.filter((e) => e.from === selected.id || e.to === selected.id).map((edge) => (
                    <button
                      key={edge.id}
                      onClick={() => deleteEdge(edge.id)}
                      className="block w-full truncate text-left rounded px-1 mt-1"
                      style={{ background: T.panel, border: `1px solid ${T.line}`, color: T.dim, fontFamily: T.mono, fontSize: 9 }}
                      title="Click to remove this relationship"
                    >
                      {(nodeMap[edge.from] && nodeMap[edge.from].label) || edge.from} {"->"} {(nodeMap[edge.to] && nodeMap[edge.to].label) || edge.to}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {lab.domain === "complex"
              ? formulaField("ew", "w(s) =")
              : (<>
                {formulaField("ex", `x(${dv}) =`)}
                {formulaField("ey", `y(${dv}) =`)}
                {formulaField("eh", `hue(${dv}) =   (optional)`)}
              </>)}
            <div className="mt-2 flex flex-wrap gap-1">
              {[`zeta(${dv})`, "abs()", "re()", "im()", "arg()", "conj()", "dot(,)", "mod(,)", "gcd(,)", "exp()", "log()", "sin()", "cos()", "sqrt()", "i", "a", "b", "^"]
                .concat(lab.domain === "int" ? ["mu(n)", "M(n)", "isprime(n)", "pi(n)", "gap(n)", "omega(n)", "tau(n)", "phi(n)", "rad(n)"] : [])
                .map((o) => (
                  <button key={o} onClick={() => insertTok(o)}
                    className="px-1 rounded"
                    style={{ background: T.panel2, border: `1px solid ${T.line}`, color: T.ion, fontFamily: T.mono, fontSize: 10, lineHeight: "18px" }}>
                    {o}
                  </button>
                ))}
            </div>
          </>
        )}
      </div>
    );
  })();

  return (
    <div className="w-full h-screen flex flex-col" style={{ background: T.void, color: T.ink, fontFamily: T.sans }}>
      <style>{FONT_CSS}</style>
      <button
        type="button"
        className="pv-eye-toggle fixed top-3 right-3 w-7 h-7 rounded-md flex items-center justify-center"
        onClick={() => setUiVisible((v) => !v)}
        aria-label={uiVisible ? "Hide interface" : "Show interface"}
        title={uiVisible ? "Hide interface" : "Show interface"}
        style={{
          zIndex: 30,
          background: "rgba(12,15,23,0.9)",
          border: `1px solid ${uiVisible ? T.ion + "77" : T.line}`,
          color: uiVisible ? T.ion : T.dim,
        }}
      >
        {uiVisible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>

      {/* header */}
      {uiVisible && <header className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${T.line}`, paddingRight: 56 }}>
        <div className="flex items-baseline gap-3">
          <span style={{ fontFamily: T.mono, fontWeight: 600, fontSize: 15, letterSpacing: "0.22em" }}>
            PRIME<span style={{ color: T.ion }}>VISUALS</span>
          </span>
          <div className="flex gap-1">
            {["patch", "lab"].map((m) => (
              <button
                key={m} onClick={() => setMode(m)}
                className="px-2 py-1 rounded-md"
                style={{
                  fontFamily: T.mono, fontSize: 10, letterSpacing: "0.18em",
                  background: mode === m ? T.panel2 : "transparent",
                  border: `1px solid ${mode === m ? T.ion + "66" : T.line}`,
                  color: mode === m ? T.ion : T.dim,
                }}
              >
                {m.toUpperCase()}
              </button>
            ))}
          </div>
          <span className="hidden sm:inline" style={{ fontFamily: T.mono, fontSize: 10, color: T.faint, letterSpacing: "0.08em" }}>
            {mode === "patch" ? "patch a source into a plane · turn the lens" : "write the math · turn the knobs"}
          </span>
        </div>
        <span style={{ fontFamily: T.mono, fontSize: 10, color: T.dim }} className="truncate text-right ml-3">{cap}</span>
      </header>}

      <div className={uiVisible ? "flex-1 flex flex-col lg:flex-row min-h-0" : "flex-1 min-h-0"}>
        {/* ── rail: the patch chain ── */}
        {uiVisible && <aside
          className="w-full lg:w-80 lg:h-full max-h-96 lg:max-h-none overflow-y-auto p-3 flex-none"
          style={{ borderRight: `1px solid ${T.line}` }}
        >
          <div className="flex flex-col">
            {mode === "patch" && (<>
              {slot("01", "SOURCE", (
                <>
                  {select(cfg.source, setSource, Object.entries(SOURCES))}
                  <div className="mt-1" style={{ fontFamily: T.mono, fontSize: 9, color: T.faint }}>
                    {SOURCES[cfg.source].blurb}
                  </div>
                  {sliders(SOURCES[cfg.source].params || [])}
                </>
              ))}
              {connector}
              {slot("02", "PLANE", (
                <>
                  {select(cfg.plane, setPlane, Object.entries(PLANES),
                    (id, m) => !m.accepts.includes(SOURCES[cfg.source].domain))}
                  {sliders(PLANES[cfg.plane].params || [])}
                </>
              ))}
              {connector}
              {slot("03", "LENS", (
                <>
                  {select(cfg.lens, setLens, Object.entries(LENSES))}
                  {sliders(LENSES[cfg.lens].params || [])}
                </>
              ))}
              {readingPanel}

              {/* library */}
              <div className="mt-4">
                <div style={{ fontFamily: T.mono, fontSize: 10, color: T.dim, letterSpacing: "0.18em" }} className="mb-2">LIBRARY</div>
                <div className="grid grid-cols-2 gap-1">
                  {LIBRARY.map((it) => chip(it.name, it.name, () => applyAny(it)))}
                </div>
              </div>
            </>)}

            {mode === "lab" && (<>
              {slot("01", "DOMAIN", (
                <>
                  {select(lab.domain, setGraphDomain, [
                    ["int", { label: "Integers  n = 1 … N" }],
                    ["real", { label: "Real line  t ∈ [0, T]" }],
                    ["complex", { label: "Complex plane  s = σ + it" }],
                  ])}
                  <div className="mt-1" style={{ fontFamily: T.mono, fontSize: 9, color: T.faint }}>
                    {lab.domain === "int" ? "drop integer relationships, sequences, operators, and visual channels"
                      : lab.domain === "real" ? "build curves from t, knobs, functions, and comparisons"
                        : "paint a complex relationship w(s) across a plane"}
                  </div>
                  {lab.domain === "int" && labSlider("N", "range n ≤", 500, 20000, 500)}
                  {lab.domain !== "int" && labSlider("tMax", "height t ≤", 10, lab.domain === "complex" ? 60 : 100, 1)}
                  {lab.domain === "complex" && labSlider("sMax", "σ up to", 0.8, 3, 0.05)}
                </>
              ))}
              {connector}
              {slot("02", "CANVAS LAB", (
                <>
                  {graphBuilder}
                  {labData && labData.err && (
                    <div className="mt-1" style={{ fontFamily: T.mono, fontSize: 9, color: T.rose }}>
                      ⚠ {labData.err} — showing the last good render
                    </div>
                  )}
                  <div className="mt-1" style={{ fontFamily: T.mono, fontSize: 9, color: T.faint }}>
                    drag palette items onto the canvas · drag OUT to IN to make relationships
                  </div>
                </>
              ))}
              {connector}
              {slot("03", "KNOBS", (
                <>
                  {labSlider("a", "knob a", 0, 2, 0.001)}
                  {labSlider("b", "knob b", 0, 6.283, 0.001)}
                  <div className="mt-1" style={{ fontFamily: T.mono, fontSize: 9, color: T.faint }}>
                    drop a or b into any formula, then turn
                  </div>
                </>
              ))}
              {readingPanel}
            </>)}

              {/* saved */}
              <div className="mt-4">
                <div style={{ fontFamily: T.mono, fontSize: 10, color: T.dim, letterSpacing: "0.18em" }} className="mb-2">SAVED</div>
                {saved.length === 0 ? (
                  <div style={{ fontFamily: T.mono, fontSize: 10, color: T.faint }}>
                    Nothing saved yet — compose something worth keeping.
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    {saved.map((s) => chip(s.ts, s.name, () => applyAny(s), () => deletePreset(s.ts)))}
                  </div>
                )}
                <div className="flex gap-1 mt-2">
                  <input
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder="Name this view"
                    className="flex-1 rounded-md px-2 py-1 text-xs outline-none min-w-0"
                    style={{ background: T.panel2, border: `1px solid ${T.line}`, color: T.ink }}
                  />
                  <button
                    onClick={savePreset}
                    className="rounded-md px-2 py-1 text-xs"
                    style={{ background: T.panel2, border: `1px solid ${T.ion}55`, color: T.ion, fontFamily: T.mono }}
                  >
                    Save view
                  </button>
                </div>
                {!storageOk && (
                  <div className="mt-1" style={{ fontFamily: T.mono, fontSize: 9, color: T.faint }}>
                    Persistent storage unavailable here — saves last for this session only.
                  </div>
                )}
              </div>

              <div className="mt-5 pb-2" style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, lineHeight: 1.6 }}>
                Extend it: a new visualization is one entry in the SOURCES, PLANES, or LENSES registry. Presets are plain JSON of the patch.
              </div>
          </div>
        </aside>}

        {/* ── canvas ── */}
        <section
          ref={wrapRef}
          className={uiVisible ? "relative flex-1 min-h-0" : "relative w-full h-full min-h-0"}
          style={{ minHeight: uiVisible ? 320 : "100%" }}
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full block touch-none"
            style={{ cursor: "grab" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onPointerLeave={onPointerLeave}
            onDoubleClick={resetView}
          />
          {uiVisible && hoverTip && (
            <div
              className="absolute rounded-md px-2 py-1"
              style={{
                left: hoverTip.x,
                top: hoverTip.y,
                zIndex: 15,
                width: 238,
                maxWidth: "calc(100% - 16px)",
                pointerEvents: "none",
                background: "rgba(7,8,15,0.88)",
                border: `1px solid ${T.ion}55`,
                boxShadow: "0 12px 34px rgba(0,0,0,0.35)",
              }}
            >
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ion, letterSpacing: "0.12em" }}>
                {hoverTip.title.toUpperCase()}
              </div>
              {hoverTip.lines.map((line) => (
                <div key={line} style={{ fontFamily: T.mono, fontSize: 10, color: T.dim, lineHeight: 1.45 }}>
                  {line}
                </div>
              ))}
            </div>
          )}
          {uiVisible && <div className="absolute top-3 right-3 flex gap-1" style={{ paddingRight: 36 }}>
            {[["−", () => zoomBy(1 / 1.35)], ["+", () => zoomBy(1.35)], ["⟲", resetView]].map(([t, fn]) => (
              <button key={t} onClick={fn}
                className="w-7 h-7 rounded-md text-sm"
                style={{ background: "rgba(12,15,23,0.85)", border: `1px solid ${T.line}`, color: T.dim, fontFamily: T.mono }}>
                {t}
              </button>
            ))}
          </div>}
          {uiVisible && <div className="absolute bottom-3 left-3 px-2 py-1 rounded-md truncate"
            style={{ background: "rgba(7,8,15,0.7)", border: `1px solid ${T.line}`, fontFamily: T.mono, fontSize: 10, color: T.dim, maxWidth: "calc(100% - 24px)" }}>
            {mode === "patch"
              ? `${SOURCES[cfg.source].label} → ${PLANES[cfg.plane].label} → ${LENSES[cfg.lens].label}`
              : lab.domain === "complex" ? `LAB · w(s) = ${lab.ew}` : `LAB · x = ${lab.ex} · y = ${lab.ey}`}
            <span className="hidden sm:inline" style={{ color: T.faint }}>  ·  drag to pan, scroll to zoom, double-click to reset</span>
          </div>}
        </section>
      </div>
    </div>
  );
}
