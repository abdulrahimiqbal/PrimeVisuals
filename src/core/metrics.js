/* Shape metrics for a rendered series: how line-like, flat, monotone, or
   oscillatory it is. Used by the headless explore CLI so goal-directed
   searches ("find another straight line") can score candidates. */

export function seriesMetrics(xs, ys) {
  const L = Math.min(xs.length, ys.length);
  let n = 0, sx = 0, sy = 0, sxx = 0, sxy = 0, syy = 0;
  let yMin = Infinity, yMax = -Infinity, sAbs = 0;
  for (let i = 0; i < L; i++) {
    const x = xs[i], y = ys[i];
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    n++; sx += x; sy += y; sxx += x * x; sxy += x * y; syy += y * y;
    sAbs += Math.abs(y);
    if (y < yMin) yMin = y; if (y > yMax) yMax = y;
  }
  if (n < 3) return { n, finiteFrac: L ? n / L : 0, linearity: 0, slope: 0, intercept: 0, flatness: 0, zeroCrossings: 0, monotonicity: 0, yMin: 0, yMax: 0 };

  const mx = sx / n, my = sy / n;
  const cxx = sxx - n * mx * mx, cxy = sxy - n * mx * my, cyy = syy - n * my * my;
  const slope = cxx > 1e-300 ? cxy / cxx : 0;
  const intercept = my - slope * mx;
  // R² of the least-squares line; a constant series counts as perfectly linear
  const linearity = cyy > 1e-12 ? Math.max(0, Math.min(1, (cxy * cxy) / (cxx * cyy + 1e-300))) : 1;
  const std = Math.sqrt(Math.max(0, cyy / n));
  const flatness = std / (sAbs / n + 1e-12); // ~0 = flat, ≥1 = wild

  let zeroCrossings = 0, up = 0, down = 0, prevY = null, prevSign = 0;
  for (let i = 0; i < L; i++) {
    const y = ys[i];
    if (!Number.isFinite(y)) continue;
    const sign = y > 1e-12 ? 1 : y < -1e-12 ? -1 : 0;
    if (sign !== 0 && prevSign !== 0 && sign !== prevSign) zeroCrossings++;
    if (sign !== 0) prevSign = sign;
    if (prevY !== null) { if (y > prevY) up++; else if (y < prevY) down++; }
    prevY = y;
  }
  const steps = up + down;
  const monotonicity = steps ? (up - down) / steps : 0; // +1 rising, −1 falling, 0 churning

  return { n, finiteFrac: L ? n / L : 0, linearity, slope, intercept, flatness, zeroCrossings, monotonicity, yMin, yMax };
}
