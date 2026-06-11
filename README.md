# PrimeVisuals

Interactive React/Vite version of the `Prime Visuals.jsx` component.

## User guide

See [HOW_TO_USE.md](HOW_TO_USE.md) for a practical guide to the controls,
presets, and what each dot represents.

## Run locally

```sh
npm install
npm run dev
```

Then open http://localhost:5173/.

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
