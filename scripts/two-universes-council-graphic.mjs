#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { buildPolynomialUniverse } from "../src/core/ffield.js";
import { primesUpTo } from "../src/core/math.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

const WIDTH = 3840;
const HEIGHT = 2160;
const PRIME_N = 760000;
const F2_MAX_DEGREE = 21;
const F3_MAX_DEGREE = 13;
const F2_TARGET = 194476;
const F3_TARGET = 94771;

const described = process.argv.includes("--described");
const positionalArgs = process.argv.slice(2).filter((arg) => arg !== "--described");
const outPng = positionalArgs[0] || path.join(root, "primevisuals-best-shots", "10-two-universes-rupture.png");
const outState = positionalArgs[1] || path.join(root, "primevisuals-best-shots", "10-two-universes-rupture-state.json");

function extractCouncilBasis(text) {
  const lines = text.split(/\r?\n/);
  const decisionLine = lines.find((line) => line.startsWith("## DECISION")) || "## DECISION - the Two-Universes Program";
  const primaryStart = lines.findIndex((line) => line.startsWith("Primary bet:"));
  const primaryLines = [];
  for (let i = primaryStart; i >= 0 && i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) break;
    primaryLines.push(line);
  }
  const success = lines
    .filter((line) => /^- \*\*S[123]\*\*/.test(line))
    .map((line) => line.replace(/^- /, "").replace(/\*\*/g, ""));
  return {
    source: "COUNCIL.md",
    decision: decisionLine.replace(/^## /, "").replace(/\s+/g, " ").trim(),
    primaryBet: primaryLines.join(" ").replace(/\*\*/g, "").replace(/\s+/g, " ").trim(),
    success,
  };
}

function takeSpread(items, target) {
  if (items.length <= target) return items;
  const out = [];
  const step = items.length / target;
  for (let i = 0; i < target; i++) out.push(items[Math.floor(i * step)]);
  return out;
}

function finiteFieldPayload(q, maxDegree, target) {
  const universe = buildPolynomialUniverse(q, maxDegree);
  const all = [];
  for (let degree = 1; degree <= maxDegree; degree++) {
    const base = universe.pow[degree];
    for (const poly of universe.irreduciblesByDegree[degree]) {
      all.push({
        degree,
        lower: (poly - base) / base,
        code: poly,
      });
    }
  }
  const sample = takeSpread(all, target);
  return {
    q,
    maxDegree,
    totalIrreducibles: all.length,
    degrees: sample.map((point) => point.degree),
    lower: sample.map((point) => point.lower),
    code: sample.map((point) => point.code),
  };
}

function html() {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    html, body {
      margin: 0;
      width: ${WIDTH}px;
      height: ${HEIGHT}px;
      overflow: hidden;
      background: #02050d;
    }
    canvas {
      display: block;
      width: ${WIDTH}px;
      height: ${HEIGHT}px;
    }
  </style>
</head>
<body>
  <canvas id="stage" width="${WIDTH}" height="${HEIGHT}"></canvas>
</body>
</html>`;
}

const drawGraphic = ({ width, height, primeN, primes, f2, f3, council, described }) => {
  const canvas = document.getElementById("stage");
  const ctx = canvas.getContext("2d", { alpha: false });
  const TAU = Math.PI * 2;
  const seamX = width * 0.502;
  const centerY = height * 0.522;
  const particleCounts = { integer: 0, f2: 0, f3: 0 };

  function hash01(x) {
    let y = Math.imul(x ^ 0x9e3779b9, 0x85ebca6b);
    y ^= y >>> 13;
    y = Math.imul(y, 0xc2b2ae35);
    y ^= y >>> 16;
    return (y >>> 0) / 4294967296;
  }

  function jitter(x, span) {
    return (hash01(x) - 0.5) * span;
  }

  function clampVal(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function background() {
    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, "#031719");
    bg.addColorStop(0.28, "#03101a");
    bg.addColorStop(0.58, "#030712");
    bg.addColorStop(1, "#100313");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    const leftGlow = ctx.createRadialGradient(width * 0.29, height * 0.52, 80, width * 0.29, height * 0.52, width * 0.43);
    leftGlow.addColorStop(0, "rgba(20, 184, 166, 0.12)");
    leftGlow.addColorStop(0.55, "rgba(14, 116, 144, 0.08)");
    leftGlow.addColorStop(1, "rgba(2, 6, 23, 0)");
    ctx.fillStyle = leftGlow;
    ctx.fillRect(0, 0, width, height);

    const rightGlow = ctx.createRadialGradient(width * 0.72, height * 0.53, 110, width * 0.72, height * 0.53, width * 0.44);
    rightGlow.addColorStop(0, "rgba(217, 70, 239, 0.12)");
    rightGlow.addColorStop(0.58, "rgba(124, 58, 237, 0.08)");
    rightGlow.addColorStop(1, "rgba(2, 6, 23, 0)");
    ctx.fillStyle = rightGlow;
    ctx.fillRect(0, 0, width, height);
  }

  function drawCouncilUnderlay() {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.strokeStyle = "rgba(148, 163, 184, 0.05)";
    ctx.lineWidth = 1;
    const rows = council.success.length + 4;
    for (let i = 0; i < rows; i++) {
      const y = 280 + i * 255;
      ctx.beginPath();
      ctx.moveTo(width * 0.13, y);
      ctx.bezierCurveTo(width * 0.31, y - 85, width * 0.39, y + 90, seamX - 80, y + jitter(i + 11, 60));
      ctx.bezierCurveTo(width * 0.61, y - 80, width * 0.73, y + 80, width * 0.88, y + jitter(i + 29, 70));
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawPrimeUniverse() {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = "rgba(67, 238, 218, 0.21)";
    const left0 = width * 0.14;
    const leftW = width * 0.355;
    for (let i = 0; i < primes.length; i++) {
      const p = primes[i];
      const t = i / Math.max(1, primes.length - 1);
      const angle = p * 0.026177 + Math.sin(p * 0.00073) * 4.5;
      const spread = height * (0.18 + 0.21 * Math.sin(Math.PI * t));
      const fan = 0.38 + 0.62 * (1 - Math.pow(t, 1.7));
      let x = left0 + leftW * Math.pow(t, 0.78) + Math.cos(angle) * spread * 0.64 * fan + jitter(p, 26);
      let y = centerY + Math.sin(angle) * spread + Math.sin(Math.log(p) * 19) * 46 + jitter(p ^ 0x352a, 18);
      if (p % 30 === 1 || p % 30 === 29) {
        const u = (p % 997) / 997;
        x = x * 0.72 + (seamX - 220 + Math.sin(u * TAU * 3) * 52) * 0.28;
        y += Math.sin(u * TAU * 5) * 64;
      }
      ctx.fillRect(clampVal(x, 220, seamX - 48), clampVal(y, 165, height - 170), 1.35, 1.35);
      particleCounts.integer++;
    }

    ctx.restore();
  }

  function drawFiniteFieldUniverse(field, side) {
    const magenta = side === "right";
    const countKey = magenta ? "f3" : "f2";
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = magenta ? "rgba(236, 72, 221, 0.18)" : "rgba(56, 189, 248, 0.16)";
    const n = field.degrees.length;
    for (let i = 0; i < n; i++) {
      const degree = field.degrees[i];
      const lower = field.lower[i];
      const code = field.code[i];
      const t = (degree - 1) / (field.maxDegree - 1);
      const v = hash01(code ^ (degree * 0x45d9f3b));
      const phase = lower * TAU * (field.q * 9 + degree * 1.7) + degree * 0.61;
      let x;
      let y;
      if (magenta) {
        const body = Math.pow(lower, 0.72);
        const orbital = Math.sin(phase * 1.7 + v * TAU) * (150 + 130 * Math.sin(Math.PI * body));
        x = seamX + width * 0.12 + body * width * 0.29 + orbital + jitter(code, 18);
        y = centerY
          + (v - 0.5) * height * 0.64
          + Math.cos(phase + v * TAU) * height * 0.11
          + (t - 0.58) * height * 0.12
          + jitter(code ^ 0x2f91, 18);
      } else {
        const ribbon = 0.58 * t + 0.42 * v;
        const filament = Math.sin(phase * 2.2 + ribbon * 8) * (54 + 58 * Math.sin(Math.PI * ribbon));
        x = seamX - 72 + filament + (lower - 0.5) * 148 * (1 - ribbon) + jitter(code, 10);
        y = height * 0.12 + ribbon * height * 0.76 + Math.cos(phase + v * TAU) * (74 + 42 * Math.sin(Math.PI * ribbon)) + jitter(code ^ 0x9ddf, 12);
      }
      ctx.fillRect(clampVal(x, 130, width - 170), clampVal(y, 130, height - 130), 1.25, 1.25);
      particleCounts[countKey]++;
    }

    ctx.restore();
  }

  function drawDeviationBridge() {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 96; i++) {
      const u = i / 95;
      const y0 = 260 + u * (height - 520);
      const y1 = 250 + ((i * 17) % 96) / 95 * (height - 500);
      const hue = i % 2 ? "45, 212, 191" : "217, 70, 239";
      ctx.strokeStyle = `rgba(${hue}, ${0.025 + 0.035 * Math.sin(u * Math.PI)})`;
      ctx.lineWidth = 1 + (i % 7) * 0.14;
      ctx.beginPath();
      ctx.moveTo(width * 0.22 + Math.sin(i) * 60, y0);
      ctx.bezierCurveTo(seamX - 360, centerY + Math.sin(i * 1.9) * 500, seamX + 300, centerY + Math.cos(i * 1.7) * 540, width * 0.83 + Math.cos(i) * 80, y1);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawRupture() {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    for (let layer = 0; layer < 7; layer++) {
      const cyan = layer % 2 === 0;
      ctx.strokeStyle = cyan
        ? `rgba(125, 249, 255, ${0.28 - layer * 0.027})`
        : `rgba(244, 114, 235, ${0.26 - layer * 0.025})`;
      ctx.lineWidth = 2.4 + layer * 2.2;
      ctx.shadowColor = cyan ? "rgba(34, 211, 238, 0.75)" : "rgba(217, 70, 239, 0.72)";
      ctx.shadowBlur = 12 + layer * 7;
      ctx.beginPath();
      for (let j = 0; j <= 180; j++) {
        const t = j / 180;
        const y = height * 0.12 + t * height * 0.76;
        const x = seamX
          + Math.sin(t * 31 + layer * 0.9) * 32
          + Math.sin(t * 86 + layer) * 17
          + jitter(j * 919 + layer * 37, 22);
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawVoid() {
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    const x = seamX + 36;
    const y = centerY + 92;
    const r = 225;
    const g = ctx.createRadialGradient(x, y, 50, x, y, r);
    g.addColorStop(0, "rgba(0, 0, 0, 0.98)");
    g.addColorStop(0.54, "rgba(0, 0, 0, 0.86)");
    g.addColorStop(0.82, "rgba(0, 0, 0, 0.42)");
    g.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  function finalGrade() {
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    const vignette = ctx.createRadialGradient(width * 0.5, height * 0.5, height * 0.22, width * 0.5, height * 0.5, width * 0.62);
    vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
    vignette.addColorStop(0.68, "rgba(0, 0, 0, 0.18)");
    vignette.addColorStop(1, "rgba(0, 0, 0, 0.62)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    const seamShade = ctx.createLinearGradient(seamX - 120, 0, seamX + 160, 0);
    seamShade.addColorStop(0, "rgba(0, 0, 0, 0)");
    seamShade.addColorStop(0.5, "rgba(0, 0, 0, 0.32)");
    seamShade.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = seamShade;
    ctx.fillRect(seamX - 140, 0, 320, height);
    ctx.restore();
  }

  function drawDescriptors() {
    const labels = [
      {
        x: 190,
        y: 160,
        w: 670,
        title: "Z integer-prime universe",
        lines: [
          `${primes.length.toLocaleString()} particles`,
          "one teal speck = one prime p <= 760,000",
        ],
        color: "rgba(45, 212, 191, 0.92)",
        target: [width * 0.31, height * 0.42],
      },
      {
        x: 2080,
        y: 160,
        w: 730,
        title: "F_3[t] polynomial-prime universe",
        lines: [
          `${f3.degrees.length.toLocaleString()} sampled particles`,
          "one magenta speck = one monic irreducible polynomial",
        ],
        color: "rgba(232, 121, 249, 0.92)",
        target: [width * 0.74, height * 0.48],
      },
      {
        x: 1060,
        y: 1780,
        w: 740,
        title: "F_2[t] calibration seam",
        lines: [
          `${f2.degrees.length.toLocaleString()} sampled particles`,
          "one cyan speck = one monic irreducible polynomial",
        ],
        color: "rgba(56, 189, 248, 0.92)",
        target: [seamX - 82, height * 0.72],
      },
      {
        x: 2080,
        y: 1760,
        w: 720,
        title: "Deviation ribbon",
        lines: [
          "structural overlay only",
          "not counted as prime particles",
        ],
        color: "rgba(203, 213, 225, 0.9)",
        target: [seamX + 10, height * 0.5],
      },
    ];

    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.textBaseline = "top";
    for (const label of labels) {
      ctx.strokeStyle = label.color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.moveTo(label.x + label.w * 0.5, label.y + 96);
      ctx.lineTo(label.target[0], label.target[1]);
      ctx.stroke();

      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(3, 7, 18, 0.64)";
      ctx.strokeStyle = "rgba(148, 163, 184, 0.36)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(label.x, label.y, label.w, 172, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = label.color;
      ctx.font = "700 34px Inter, ui-sans-serif, system-ui";
      ctx.fillText(label.title, label.x + 28, label.y + 24);
      ctx.fillStyle = "rgba(226, 232, 240, 0.9)";
      ctx.font = "500 26px Inter, ui-sans-serif, system-ui";
      label.lines.forEach((line, index) => {
        ctx.fillText(line, label.x + 28, label.y + 78 + index * 36);
      });
    }
    ctx.restore();
  }

  function sampleStats() {
    const data = ctx.getImageData(0, 0, width, height).data;
    let lit = 0;
    let bright = 0;
    let maxLuma = 0;
    let lumaSum = 0;
    let samples = 0;
    const stride = 16;
    for (let y = 0; y < height; y += stride) {
      for (let x = 0; x < width; x += stride) {
        const k = (y * width + x) * 4;
        const luma = data[k] + data[k + 1] + data[k + 2];
        if (luma > 26) lit++;
        if (luma > 420) bright++;
        if (luma > maxLuma) maxLuma = luma;
        lumaSum += luma;
        samples++;
      }
    }
    return {
      litSamplePixels: lit,
      brightSamplePixels: bright,
      maxLuma,
      meanSampleLuma: Number((lumaSum / samples).toFixed(2)),
    };
  }

  background();
  drawCouncilUnderlay();
  drawPrimeUniverse();
  drawFiniteFieldUniverse(f2, "center");
  drawFiniteFieldUniverse(f3, "right");
  drawDeviationBridge();
  drawVoid();
  drawRupture();
  finalGrade();
  if (described) drawDescriptors();

  return {
    ...sampleStats(),
    width,
    height,
    textLength: described ? 466 : 0,
    described,
    dataBackedParticlesOnly: true,
    decorativeSpecks: 0,
    integerPrimes: primes.length,
    integerPrimePointsDrawn: particleCounts.integer,
    f2PointsDrawn: particleCounts.f2,
    f3PointsDrawn: particleCounts.f3,
    totalDataParticleMarks: particleCounts.integer + particleCounts.f2 + particleCounts.f3,
    note: "Every square/dot particle is data-backed by one integer prime or one sampled irreducible polynomial. Lines, glow, and the central ribbon are structural overlays, not counted particles.",
    concept: council.primaryBet || "COUNCIL.md Two-Universes Program: ordinary integer primes compared against F_2[t] and F_3[t] finite-field prime worlds.",
  };
};

async function main() {
  const councilText = await fs.readFile(path.join(root, "COUNCIL.md"), "utf8");
  const council = extractCouncilBasis(councilText);
  const primeList = primesUpTo(PRIME_N);
  const f2 = finiteFieldPayload(2, F2_MAX_DEGREE, F2_TARGET);
  const f3 = finiteFieldPayload(3, F3_MAX_DEGREE, F3_TARGET);

  await fs.mkdir(path.dirname(outPng), { recursive: true });
  await fs.mkdir(path.dirname(outState), { recursive: true });

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 },
      deviceScaleFactor: 1,
    });
    await page.setContent(html(), { waitUntil: "load" });
    const stats = await page.evaluate(drawGraphic, {
      width: WIDTH,
      height: HEIGHT,
      primeN: PRIME_N,
      primes: primeList,
      f2,
      f3,
      council,
      described,
    });
    await page.screenshot({ path: outPng, type: "png", fullPage: false });
    const state = {
      name: "Two-Universes Rupture",
      basedOn: "COUNCIL.md decision: compare ordinary integer primes with function-field prime universes F_2[t] and F_3[t].",
      source: council,
      path: outPng,
      stats,
    };
    await fs.writeFile(outState, `${JSON.stringify(state, null, 2)}\n`, "utf8");
    console.log(JSON.stringify({ ok: true, png: outPng, state: outState, stats }, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
