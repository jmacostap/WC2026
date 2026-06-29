# WC2026 — Sticker Exchange

A tiny static site to swap World Cup 2026 stickers. Live at
**https://jmacostap.github.io/WC2026/**

## Updating my lists

Edit **`data.js`** — that's the only file you ever need to touch.
Put your codes between the backticks of `MY_MISSING` and `MY_REPEATS`.

Codes are 3 letters + a 1-2 digit number (e.g. `MAR13`). Separate them with
spaces, commas, or new lines. Lines starting with `#` are comments and ignored.

Commit the change and GitHub Pages redeploys the site automatically.

## How it works

All comparison runs in the browser (`app.js`); nothing is uploaded anywhere.
A visitor pastes their own missing/spare codes and the page shows:

- **I can give you** — my spares that they're missing
- **You can give me** — their spares that I'm missing
