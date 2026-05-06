# Claude Code Prompt — Logbook UC (Modify Existing)

> **How to use this:** In your existing `logbook-uc` folder where Claude Code already scaffolded the frontend, open Claude Code again and paste everything below the `---` line as your next message. It will modify what's there to swap in the Cloudflare backend and add cascading dropdowns. Don't recreate `index.html` or `style.css` — they're solid as-is.

---

# Modify Logbook UC — Switch Backend to Cloudflare + Cascading Dropdowns

The existing project has working frontend files (`index.html`, `style.css`, possibly `app.js`, `config.js`, `apps-script.gs`, `README.md`). We're keeping `index.html` and `style.css` exactly as-is — they're solid. We need to:

1. **Delete** `apps-script.gs` (we're not using Google Apps Script anymore)
2. **Replace** `config.js` entirely with the content below (cascading machine→unit, real LGES equipment data from the official Operation Manual, 27 component types, Cloudflare apiUrl placeholder)
3. **Modify** `app.js` to support cascading Machine → Unit dropdowns AND ensure submit handler POSTs to `CONFIG.apiUrl` (which will be a Cloudflare Worker URL set later)
4. **Create** new `worker/` directory with the Cloudflare Worker backend (5 files)
5. **Update** root `README.md` to describe the new Cloudflare architecture

Don't touch `index.html` or `style.css`. They already have the bilingual UI, language toggle, both tabs, all form fields with correct IDs (`para-*` and `dt-*` prefixes), result panel, and security banner.

---

## File 1: Replace config.js Entirely

Paste this exact content as the new `config.js`:

```javascript
// Logbook UC — Configuration
// Edit this file to update dropdown values, then commit + push.
// GitHub Pages will auto-redeploy in ~1 minute.

const CONFIG = {
  // Set after deploying the Cloudflare Worker
  // (cd worker && npm run deploy → copy the URL from output)
  apiUrl: "",
  
  appTitle: "UC PKG 파라변경이력 부동내역 양식",
  appSubtitle: "Ultium Cells PKG — Parameter Change & Downtime Log",
  site: "UC1-Lordstown",
  
  dropdowns: {
    line: [
      "1-1", "1-2", "2-1", "2-2", "3-1", "3-2", "4-1", "4-2", "5-1", "5-2",
      "6-1", "6-2", "7-1", "7-2", "8-1", "8-2", "9-1", "9-2", "10-1", "10-2"
    ],
    
    machine: [
      "TW — Tab Welder",
      "PC — Pouch / Cell Ass'y",
      "EL — EL Filling & V-Sealer"
    ],
    
    // Cascading: Unit options filter based on the selected Machine.
    // Source: LGES Operation Manual sections 3.1.1-3.1.96
    machineUnits: {
      
      "TW — Tab Welder": [
        // Stacked Tray Loader (3.1.1-3.1.6)
        "Stacked Tray Loader — Stacked Tray Conveyor",
        "Stacked Tray Loader — Stacked Tray Diverter",
        "Stacked Tray Loader — Stacked Tray Separator",
        "Stacked Tray Loader — Tray (Empty) Stacker",
        "Stacked Tray Loader — Box Aligner",
        "Stacked Tray Loader — Stacked Tray Barcode Reader",
        // Cell Loader IN (3.1.7-3.1.12)
        "Cell Loader — Cell Pick & Place (#2-Cell)",
        "Cell Loader — Cell Conveyor",
        "Cell Loader — Cell Aligner",
        "Cell Loader — Corner Sealing",
        "Cell Loader — Cell Pick & Place (#LMS In)",
        "Cell Loader — Cell Buffer Stage",
        // Tab Welder (3.1.13-3.1.28)
        "Tab Welder — Cell Carrier (#Pallet) [#1~30]",
        "Tab Welder — LMS Track",
        "Tab Welder — Air Joint & Carrier Clamp",
        "Tab Welder — Carrier Lift [1,2]",
        "Tab Welder — Cell Aligner",
        "Tab Welder — Tab Pre Welder",
        "Tab Welder — Tab Cutter",
        "Tab Welder — Lead Welder",
        "Tab Welder — Tab/Lead Bead Press",
        "Tab Welder — Lead Tape Attacher",
        "Tab Welder — Lead Tape Press",
        "Tab Welder — Lead Tape Vision",
        "Tab Welder — Cell Pick & Place (#180º Turn)",
        "Tab Welder — Cell Short Checker",
        "Tab Welder — Cell Blower & Suction",
        "Tab Welder — Cell Carrier Blow & Suction",
        // Lead Supplier (3.1.29-3.1.39)
        "Lead Supplier — Lead Pallet Pick & Place",
        "Lead Supplier — Lead Pallet Lift",
        "Lead Supplier — Lead Pallet Table",
        "Lead Supplier — Lead Pallet (Used) Table",
        "Lead Supplier — Lead Buffer Shuttle",
        "Lead Supplier — Lead Pick & Place [02C] (#1)",
        "Lead Supplier — Lead 2매 분리 / Separator",
        "Lead Supplier — Lead Pick & Place [02B] (#2)",
        "Lead Supplier — Lead Align Shuttle",
        "Lead Supplier — Lead Align Vision",
        "Lead Supplier — Lead Pick & Place [01A] (#3)",
        // Cell Loader OUT (3.1.40-3.1.45)
        "Cell Loader — Cell Pick & Place (#LMS Out)",
        "Cell Loader — NG Cell Pick & Place [A,B]",
        "Cell Loader — Cell Shuttle (#3-cell)",
        "Cell Loader — NG Cell Table",
        "Cell Loader — Buffer Table (#3-Cell)",
        "Cell Loader — Cell Aligner (#Mecha Align)"
      ],
      
      "PC — Pouch / Cell Ass'y": [
        // Al Forming (3.1.46-3.1.59)
        "Al Forming — Al Sheet Unwinder",
        "Al Forming — Al Sheet Splicer (Manual)",
        "Al Forming — Al Sheet Feeder",
        "Al Forming — Al Sheet Accumulator",
        "Al Forming — Al Sheet Dancer Roll",
        "Al Forming — Al Sheet Slit Cutter",
        "Al Forming — Pouch Clamp [1,2] (Before/After Forming Press)",
        "Al Forming — Al Sheet Forming Press",
        "Al Forming — Al Sheet Pouch Crack",
        "Al Forming — Pouch Cutter (#Al Sheet Cutter)",
        "Al Forming — Pouch Feeder (#Al Sheet Feeder)",
        "Al Forming — Pouch Embossing Vision",
        "Al Forming — Pouch Align Table",
        "Al Forming — Pouch Pick & Place [1,2]",
        // Cell Ass'y (3.1.60-3.1.69)
        "Cell Ass'y — Pouch Shuttle [1]",
        "Cell Ass'y — Pouch Shuttle [2]",
        "Cell Ass'y — Pouch Top Cutter [A,B]",
        "Cell Ass'y — Cell Pick & Place",
        "Cell Ass'y — Pouch Folding Table",
        "Cell Ass'y — Pouch Folding Knife",
        "Cell Ass'y — Pouch Shuttle [3]",
        "Cell Ass'y — Pouch Sealer [A,B]",
        "Cell Ass'y — Pouch 2nd Sealer [A,B]",
        "Cell Ass'y — Lead Vision"
      ],
      
      "EL — EL Filling & V-Sealer": [
        // EL Filling & V-Sealer (3.1.70-3.1.96)
        "EL Filling — Cell Pick & Place (Pallet In)",
        "EL Filling — Cell Pick & Place",
        "EL Filling — Cell Align & Rotating Table",
        "EL Filling — Cell Pick & Place [02] (#2-Cell, Pallet In)",
        "EL Filling — NG Table [01]",
        "EL Filling — NG Pick & Place [01] (#2-Cell)",
        "EL Filling — Carrier Shifter [01] (#El In)",
        "EL Filling — Carrier Shifter [02] (#EL Out)",
        "EL Filling — Carrier Shuttle [A] (#Transfer)",
        "EL Filling — Carrier Shuttle [B] (#Transfer)",
        "EL Filling — Pouch Barcode Printer [01a]",
        "EL Filling — Pouch Barcode Reader [01A] (Before Filling)",
        "EL Filling — Weight Inspector [01A] (Before Filling)",
        "EL Filling — EL Filler [A]",
        "EL Filling — Weight Inspector [02A] (After Filling)",
        "EL Filling — Carrier Lift [A] (#Sealer)",
        "EL Filling — Vacuum Chamber / Vacuum Sealer [A]",
        "EL Filling — Cell IR Checker [A]",
        "EL Filling — EL Sub Tank [A]",
        "EL Filling — NG Table [02]",
        "EL Filling — NG Pick & Place [02] (#2-Cell)",
        "EL Filling — Cell Pick & Place [01] (EL Out)",
        "EL Filling — Cell Conveyor (#Pitch)",
        "EL Filling — Cell Pick & Place [02] (#Tray In)",
        "EL Filling — Tray (Empty) Conveyor",
        "EL Filling — Stacked Tray Conveyor",
        "EL Filling — Tray Shift (Cell Unloader Out)"
      ]
    },
    
    // Component types — limited dropdown for queryable downtime data
    assy: [
      "Cylinder",
      "Sensor",
      "Servo Motor",
      "Geared Motor",
      "Stepper Motor",
      "Bearing",
      "Cable / Wiring",
      "PLC / Controller",
      "HMI",
      "Power Supply",
      "Drive / VFD",
      "Vision System",
      "Pneumatic Valve",
      "Solenoid",
      "Pneumatic Cylinder",
      "Conveyor / Belt",
      "Chain / Sprocket",
      "Limit Switch",
      "Welder Power Supply",
      "Heater / Heating Element",
      "Vacuum Pump",
      "Cooling System",
      "Robot / Pick & Place Mech",
      "Frame / Mechanical",
      "Software / Logic",
      "Network / Comms",
      "Other"
    ],
    
    type: [
      "BM — Breakdown Maintenance",
      "PD — Production Defect",
      "PM — Preventive Maintenance",
      "잼 / Jam",
      "파단 / Break",
      "생산준비 / Production Prep"
    ]
  }
};
```

---

## File 2: Modify app.js

Two specific changes needed; otherwise leave the existing structure intact.

### Change 2a: Cascading Machine → Unit dropdowns

The existing app.js probably populates the Unit dropdown from a `CONFIG.dropdowns.unit` array (which no longer exists). Replace that logic with cascading: when the Machine select changes, repopulate Unit from `CONFIG.dropdowns.machineUnits[selectedMachine]`.

Apply to BOTH tabs independently. The HTML uses `para-machine` / `para-unit` for the Para tab and `dt-machine` / `dt-unit` for the Downtime tab.

Reference implementation (adapt to existing code style):

```javascript
function populateMachineDropdown(selectId) {
  const select = document.getElementById(selectId);
  select.innerHTML = '<option value="">—</option>';
  CONFIG.dropdowns.machine.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m;
    opt.textContent = m;
    select.appendChild(opt);
  });
}

function populateUnitDropdown(unitSelectId, machineValue) {
  const select = document.getElementById(unitSelectId);
  select.innerHTML = '<option value="">—</option>';
  if (!machineValue) {
    select.disabled = true;
    return;
  }
  select.disabled = false;
  const units = CONFIG.dropdowns.machineUnits[machineValue] || [];
  units.forEach(u => {
    const opt = document.createElement('option');
    opt.value = u;
    opt.textContent = u;
    select.appendChild(opt);
  });
}

['para', 'dt'].forEach(prefix => {
  populateMachineDropdown(`${prefix}-machine`);
  populateUnitDropdown(`${prefix}-unit`, '');
  
  document.getElementById(`${prefix}-machine`).addEventListener('change', (e) => {
    populateUnitDropdown(`${prefix}-unit`, e.target.value);
  });
});
```

The Assy dropdown still populates from `CONFIG.dropdowns.assy` (flat array — existing code likely already handles this; just confirm it works after the refactor).

### Change 2b: Submit handler

The existing submit handler should already POST JSON to `CONFIG.apiUrl`. No URL change needed (it gets set in config.js after Worker deployment). Just ensure:

- POST with `Content-Type: application/json` header
- JSON body includes all form fields plus `formType` (`"para_change"` or `"downtime"`) and `client_timestamp` (ISO string)
- Success response shape is `{ ok: true, id: <number> }`
- Failure response shape is `{ ok: false, error: "..." }`
- If `CONFIG.apiUrl` is empty, skip the POST and show a blue info banner ("Backend not configured — Kakao text below is ready to copy")

---

## File 3: Delete apps-script.gs

If the file exists, delete it.

---

## File 4: Create worker/src/index.js

```javascript
/**
 * Logbook UC — Cloudflare Worker backend
 *
 * Routes:
 *   GET  /                              health check
 *   POST /                              submit form (JSON body, formType field routes to table)
 *   GET  /export?type=para_changes      CSV download
 *   GET  /export?type=downtimes         CSV download
 *
 * Bindings (configured in wrangler.toml):
 *   env.DB                  D1 database
 *   env.TEAMS_WEBHOOK_URL   optional, set via `wrangler secret put TEAMS_WEBHOOK_URL`
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }
    
    if (request.method === 'GET' && url.pathname === '/') {
      return jsonResponse({ status: 'alive', time: new Date().toISOString() });
    }
    
    if (request.method === 'GET' && url.pathname === '/export') {
      return await handleExport(url, env);
    }
    
    if (request.method === 'POST' && url.pathname === '/') {
      return await handleSubmit(request, env);
    }
    
    return jsonResponse({ ok: false, error: 'Not found' }, 404);
  },
};

async function handleSubmit(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: 'Invalid JSON body' }, 400);
  }
  
  const { formType } = body;
  if (!formType) {
    return jsonResponse({ ok: false, error: 'Missing formType' }, 400);
  }
  
  try {
    let result;
    if (formType === 'para_change') {
      result = await env.DB.prepare(
        `INSERT INTO para_changes 
         (client_timestamp, site, line, machine, unit, assy, change_time, changed_by, param, previous_value, new_value, reason)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        body.client_timestamp ?? null,
        body.site ?? null,
        body.line ?? null,
        body.machine ?? null,
        body.unit ?? null,
        body.assy ?? null,
        body.change_time ?? null,
        body.changed_by ?? null,
        body.param ?? null,
        body.previous_value ?? null,
        body.new_value ?? null,
        body.reason ?? null
      ).run();
    } else if (formType === 'downtime') {
      result = await env.DB.prepare(
        `INSERT INTO downtimes 
         (client_timestamp, site, line, machine, unit, assy, type, occurrence_time, recovery_time, duration_minutes, technician, symptom, cause, countermeasure)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        body.client_timestamp ?? null,
        body.site ?? null,
        body.line ?? null,
        body.machine ?? null,
        body.unit ?? null,
        body.assy ?? null,
        body.type ?? null,
        body.occurrence_time ?? null,
        body.recovery_time ?? null,
        body.duration_minutes ?? null,
        body.technician ?? null,
        body.symptom ?? null,
        body.cause ?? null,
        body.countermeasure ?? null
      ).run();
    } else {
      return jsonResponse({ ok: false, error: `Unknown formType: ${formType}` }, 400);
    }
    
    const insertedId = result?.meta?.last_row_id;
    
    if (env.TEAMS_WEBHOOK_URL) {
      try {
        await postToTeams(env.TEAMS_WEBHOOK_URL, formType, body);
      } catch (e) {
        console.error('Teams webhook failed:', e.message);
      }
    }
    
    return jsonResponse({ ok: true, id: insertedId });
  } catch (e) {
    return jsonResponse({ ok: false, error: e.message }, 500);
  }
}

async function postToTeams(webhookUrl, formType, body) {
  const isPara = formType === 'para_change';
  const title = isPara ? '🔧 Parameter Change Logged' : '🚨 Downtime Event Logged';
  
  const fields = isPara
    ? ['site', 'line', 'machine', 'unit', 'assy', 'change_time', 'changed_by', 'param', 'previous_value', 'new_value', 'reason']
    : ['site', 'line', 'machine', 'unit', 'assy', 'type', 'occurrence_time', 'recovery_time', 'duration_minutes', 'technician', 'symptom', 'cause', 'countermeasure'];
  
  const facts = [];
  for (const f of fields) {
    if (body[f] !== undefined && body[f] !== null && body[f] !== '') {
      facts.push({ title: f, value: String(body[f]) });
    }
  }
  
  const card = {
    type: 'message',
    attachments: [{
      contentType: 'application/vnd.microsoft.card.adaptive',
      content: {
        $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
        type: 'AdaptiveCard',
        version: '1.4',
        body: [
          { type: 'TextBlock', text: title, weight: 'Bolder', size: 'Large', color: isPara ? 'Accent' : 'Attention' },
          { type: 'FactSet', facts },
        ],
      },
    }],
  };
  
  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(card),
  });
}

async function handleExport(url, env) {
  const type = url.searchParams.get('type');
  
  let tableName, columns;
  if (type === 'para_changes') {
    tableName = 'para_changes';
    columns = ['id', 'server_timestamp', 'client_timestamp', 'site', 'line', 'machine', 'unit', 'assy', 'change_time', 'changed_by', 'param', 'previous_value', 'new_value', 'reason'];
  } else if (type === 'downtimes') {
    tableName = 'downtimes';
    columns = ['id', 'server_timestamp', 'client_timestamp', 'site', 'line', 'machine', 'unit', 'assy', 'type', 'occurrence_time', 'recovery_time', 'duration_minutes', 'technician', 'symptom', 'cause', 'countermeasure'];
  } else {
    return jsonResponse({ ok: false, error: 'Use ?type=para_changes or ?type=downtimes' }, 400);
  }
  
  const result = await env.DB.prepare(
    `SELECT ${columns.join(', ')} FROM ${tableName} ORDER BY server_timestamp DESC`
  ).all();
  
  const escape = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  
  const lines = [columns.join(',')];
  for (const row of (result.results || [])) {
    lines.push(columns.map(c => escape(row[c])).join(','));
  }
  const csv = '\uFEFF' + lines.join('\n'); // BOM for Excel UTF-8
  
  const filename = `logbook-uc-${type}-${new Date().toISOString().slice(0, 10)}.csv`;
  
  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      ...CORS_HEADERS,
    },
  });
}
```

---

## File 5: Create worker/schema.sql

```sql
CREATE TABLE IF NOT EXISTS para_changes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  server_timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  client_timestamp TEXT,
  site TEXT,
  line TEXT,
  machine TEXT,
  unit TEXT,
  assy TEXT,
  change_time TEXT,
  changed_by TEXT,
  param TEXT,
  previous_value TEXT,
  new_value TEXT,
  reason TEXT
);

CREATE TABLE IF NOT EXISTS downtimes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  server_timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  client_timestamp TEXT,
  site TEXT,
  line TEXT,
  machine TEXT,
  unit TEXT,
  assy TEXT,
  type TEXT,
  occurrence_time TEXT,
  recovery_time TEXT,
  duration_minutes INTEGER,
  technician TEXT,
  symptom TEXT,
  cause TEXT,
  countermeasure TEXT
);

CREATE INDEX IF NOT EXISTS idx_para_server_timestamp ON para_changes(server_timestamp);
CREATE INDEX IF NOT EXISTS idx_para_machine ON para_changes(machine);
CREATE INDEX IF NOT EXISTS idx_para_line ON para_changes(line);
CREATE INDEX IF NOT EXISTS idx_dt_server_timestamp ON downtimes(server_timestamp);
CREATE INDEX IF NOT EXISTS idx_dt_machine ON downtimes(machine);
CREATE INDEX IF NOT EXISTS idx_dt_line ON downtimes(line);
CREATE INDEX IF NOT EXISTS idx_dt_type ON downtimes(type);
```

---

## File 6: Create worker/wrangler.toml

```toml
name = "logbook-uc"
main = "src/index.js"
compatibility_date = "2025-01-01"

[[d1_databases]]
binding = "DB"
database_name = "logbook-uc-db"
database_id = "PASTE_AFTER_RUNNING_npm_run_db_create"
```

---

## File 7: Create worker/package.json

```json
{
  "name": "logbook-uc-worker",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy",
    "db:create": "wrangler d1 create logbook-uc-db",
    "db:migrate": "wrangler d1 execute logbook-uc-db --remote --file=schema.sql",
    "db:migrate-local": "wrangler d1 execute logbook-uc-db --local --file=schema.sql",
    "secret:teams": "wrangler secret put TEAMS_WEBHOOK_URL"
  },
  "devDependencies": {
    "wrangler": "^3.0.0"
  }
}
```

---

## File 8: Create worker/README.md

```markdown
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
```

---

## File 9: Update Root README.md

Replace existing content with:

```markdown
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
```

---

## Testing Checklist

After all changes, walk me through:

1. Confirm `apps-script.gs` is gone
2. Confirm `worker/` directory has 5 files (`src/index.js`, `schema.sql`, `wrangler.toml`, `package.json`, `README.md`)
3. Open `index.html` in a browser. With `CONFIG.apiUrl` empty, confirm:
   - Page renders unchanged from before
   - Machine dropdown shows 3 options (TW / PC / EL)
   - Unit dropdown is empty/disabled until a Machine is selected
   - Picking "TW — Tab Welder" populates Unit with 45 entries
   - Picking "PC — Pouch / Cell Ass'y" populates Unit with 24 entries
   - Picking "EL — EL Filling & V-Sealer" populates Unit with 27 entries
   - Switching Machine clears Unit and repopulates
   - Assy dropdown shows 27 component types
4. Fill out a complete entry on each tab, hit Generate. Confirm:
   - Blue info banner appears ("Backend not configured")
   - Formatted Kakao text shows in result panel
   - Copy to Clipboard works
   - Duration auto-calc works on Downtime tab
