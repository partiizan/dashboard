# Florida Watch

Static GitHub Pages dashboard.

## Deploy
1. Create a GitHub repo, e.g. `florida-watch`.
2. Upload `index.html`, `styles.css`, and `app.js` to the repo root.
3. Go to **Settings → Pages**.
4. Choose **Deploy from a branch**.
5. Select branch `main` and folder `/ (root)`.
6. Save.

Your site will appear at:
`https://YOUR-USERNAME.github.io/florida-watch/`

## Data
- NOAA/NHC 7-day Atlantic outlook image
- Yahoo Finance quotes:
  - Brent: `BZ=F`
  - Gold: `GC=F`
  - Silver: `SI=F`
  - Platinum: `PL=F`

Note: GitHub Pages is static. If Yahoo blocks cross-origin browser requests in the future, move just the market request to a small serverless function.
