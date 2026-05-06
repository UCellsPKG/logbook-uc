# Logbook UC — Worker Backend

Cloudflare Worker that receives form submissions, writes to D1 SQLite, and optionally posts to Microsoft Teams.

## One-Time Setup

```bash
cd worker
npm install
wrangler login                    # opens browser for OAuth
npm run db:create                 # copy database_id from output into wrangler.toml
npm run db:migrate                # apply schema to remote DB
npm run secret:teams              # paste Teams webhook URL when prompted (optional)
npm run deploy                    # deploys & prints worker URL
```

After deploy, paste the worker URL into root `config.js` as `apiUrl`.

## Endpoints

- `GET /` — health check
- `POST /` — submit form (frontend uses this)
- `GET /export?type=para_changes` — CSV download
- `GET /export?type=downtimes` — CSV download

## Local Development

```bash
npm run db:migrate-local
npm run dev    # runs at http://localhost:8787
```
