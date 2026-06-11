# PrimeVisuals

An instrument for seeing structure in the primes — and for hunting
structure that current theory doesn't explain.

The default scene is Riemann's explicit formula: the prime staircase ψ(x)
assembling out of zeta-zero waves as you raise the zero count. From there:
drag math ops onto any axis (transform chips), subtract the best-known
prediction (RESIDUAL), compare against Cramér pseudoprimes (TWIN), check
persistence and holdout at growing range (×2×4×8), and run the anomaly
scanner — a worker that sweeps residue classes, exponential-sum angles,
and gap correlations, then re-scores every candidate on an unseen range of
primes. Every view is a shareable URL; pinned finds live in the notebook
with OEIS lookup links.

## User guide

See [HOW_TO_USE.md](HOW_TO_USE.md) for a practical guide to the controls,
presets, and what each dot represents. [ROADMAP.md](ROADMAP.md) tracks what
is built and what comes next.

## Run locally

```sh
npm install
npm run dev
```

Then open http://localhost:5173/.

## Tests

```sh
npm test
```

Unit tests cover the number-theory kernel (sieves, Möbius, ζ on the
critical line, the explicit formula), the expression engine, the statistics
battery, and the anomaly scanner, plus jsdom interaction tests of the UI.
`scripts/verify.mjs` drives a headless Chromium through the main flows
(requires `npx playwright install chromium` and a running dev server).
`scripts/genzeros.mjs` regenerates the bundled zeta-zero table.

## Build for production

```sh
npm run build
npm run preview
```

The production build is written to `dist/`.

## Deploy

Use a static hosting target. The usual settings are:

- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

Vercel, Netlify, Cloudflare Pages, GitHub Pages, S3, and similar static hosts can serve the built `dist/` folder.
