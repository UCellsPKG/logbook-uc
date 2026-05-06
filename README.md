# Logbook UC

Parameter Change & Downtime Logger for Ultium Cells PKG (Packaging) line at the UC1-Lordstown plant. Engineers fill the form on phones, data lands in a Cloudflare D1 SQLite database, optional Teams notifications fire, and a copyable Kakao text message is generated for chat visibility.

## Architecture

```
Engineer phone (Kakao announcement link)
   ↓
GitHub Pages (static frontend)
   ↓ POST JSON
Cloudflare Worker (free serverless)
   ├──→ Cloudflare D1 SQLite database
   └──→ Microsoft Teams Webhook (optional)

Manager → Worker /export?type=... → CSV → opens in Excel
```

## Setup

See [worker/README.md](worker/README.md) for backend setup. Once the Worker is deployed, paste its URL into `config.js` as `apiUrl`, push to GitHub, enable Pages.

## Updating Dropdowns

Edit `config.js`, commit, push. GitHub Pages auto-redeploys in ~1 minute.

## Known Limitations

- KakaoTalk notification is manual paste (no native API for non-business accounts)
- Public GitHub hosting — keep the security banner; do not enter proprietary parameter values until migrated to internal infra
- Cloudflare Workers free tier: 100k requests/day
- D1 free tier: 5GB storage
