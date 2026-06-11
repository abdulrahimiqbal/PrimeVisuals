/* Drive the running dev server headlessly and screenshot the key flows. */
import { chromium } from "playwright";

const BASE = "http://localhost:5173/";
const shots = "/tmp/pv";
const errors = [];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1480, height: 920 } });
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => { if (m.type() === "error") errors.push(`console: ${m.text()}`); });

await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
await page.screenshot({ path: `${shots}-1-default-rh.png` });

// raise K on the explicit formula and watch the curve tighten
await page.locator('input[type="range"]').nth(1).fill("120");
await page.waitForTimeout(800);
await page.screenshot({ path: `${shots}-2-rh-k120.png` });

// residual mode on psi
await page.getByText("RESIDUAL", { exact: true }).click();
await page.waitForTimeout(700);
await page.screenshot({ path: `${shots}-3-psi-residual.png` });
await page.getByText("RESIDUAL", { exact: true }).click();

// drop chips: log on y for the gap skyline + twin overlay
await page.locator("span.truncate", { hasText: "Gap skyline" }).first().click();
await page.waitForTimeout(900);
await page.getByText("log", { exact: true }).first().click();
await page.waitForTimeout(600);
await page.getByText("TWIN", { exact: true }).click();
await page.waitForTimeout(900);
await page.screenshot({ path: `${shots}-4-gaps-chip-twin.png` });

// family heatmap
await page.locator("span.truncate", { hasText: "Family sweep mod q" }).first().click();
await page.waitForTimeout(2500);
await page.screenshot({ path: `${shots}-5-family.png` });

// polar sweep + CF readout
await page.locator("span.truncate", { hasText: "Polar α-dial" }).first().click();
await page.waitForTimeout(800);
await page.screenshot({ path: `${shots}-6-polar.png` });

// persistence panel
await page.locator("span.truncate", { hasText: "Sacks spiral" }).first().click();
await page.waitForTimeout(500);
await page.getByText("×2×4×8", { exact: true }).click();
await page.waitForTimeout(3500);
await page.screenshot({ path: `${shots}-7-persistence.png` });
await page.getByText("✕", { exact: true }).first().click().catch(() => {});

// anomaly scan end-to-end (worker)
await page.getByRole("button", { name: "Run scan" }).click();
await page.waitForFunction(
  () => document.body.textContent.includes("holdout") || document.body.textContent.includes("error:"),
  { timeout: 60000 },
);
await page.waitForTimeout(600);
await page.screenshot({ path: `${shots}-8-scan.png` });

// open the top anomaly + pin it
const viewBtn = page.getByText("view", { exact: true }).first();
if (await viewBtn.count()) {
  await viewBtn.click();
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${shots}-9-anomaly-view.png` });
}

// URL round-trip: copy current state via hash and reload
const url = page.url();
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(900);
await page.screenshot({ path: `${shots}-10-url-roundtrip.png` });

console.log("URL state length:", url.length, "hash present:", url.includes("#v="));
console.log(errors.length ? `ERRORS:\n${errors.join("\n")}` : "no console/page errors");
await browser.close();
