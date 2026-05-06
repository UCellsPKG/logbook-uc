# Logbook UC — Setup Guide

A complete walkthrough for going from "empty folder" to "live app that engineers can use." Estimated time: **45–60 minutes** end-to-end if everything cooperates.

---

## What You'll Need Before You Start

| Account | Why | Cost |
|---|---|---|
| **GitHub** (your work email) | Hosts the code and the live site | Free |
| **Google account** | Hosts the Sheet and Apps Script backend | Free |
| **Microsoft Teams access** | Receives the webhook notifications | Already have via Ultium M365 |
| **Claude Code installed locally** | Builds the project | You already have this on WSL2 |
| **A Teams channel** where you have permission to add a webhook connector | Where notifications appear | Ask Mark or whoever owns the channel |

You'll be jumping between several browser tabs. Recommend opening these in advance:

- https://github.com (logged in with work email)
- https://sheets.google.com
- https://script.google.com
- Microsoft Teams (desktop or web)

---

## Phase 1 — Scaffold the Project Locally

### Step 1.1 — Create the GitHub repo

1. On github.com (logged in with work email), click **New repository**
2. Name it: `logbook-uc` (or whatever you prefer — just remember it)
3. Visibility: **Public** (required for free GitHub Pages — we'll add the security banner inside)
4. Check **Add a README file** so the repo isn't empty
5. Click **Create repository**
6. Copy the clone URL (HTTPS, looks like `https://github.com/YourUser/logbook-uc.git`)

### Step 1.2 — Clone it locally

In WSL2 / Ubuntu terminal:

```bash
cd ~/projects   # or wherever you keep code
git clone https://github.com/YourUser/logbook-uc.git
cd logbook-uc
```

### Step 1.3 — Run Claude Code with the prompt

In the same folder:

```bash
claude
```

When Claude Code is ready, paste the **entire contents** of `claude-code-prompt.md` as your first message. It will scaffold all the files.

When it finishes, you should have these files in your folder:

```
logbook-uc/
├── README.md
├── index.html
├── style.css
├── app.js
├── config.js
└── apps-script.gs
```

### Step 1.4 — Test locally before going further

Open `index.html` directly in your browser (just double-click it, or `wslview index.html` from WSL). Walk through the 8-item testing checklist Claude Code gave you. Make sure:

- ✅ Korean characters render correctly
- ✅ Both tabs work
- ✅ Validation errors appear when fields are empty
- ✅ Copy to Clipboard works
- ✅ It looks OK on mobile width (resize browser)

If any of that fails, ask Claude Code to fix it before moving on. **Don't deploy a broken version.**

---

## Phase 2 — Set Up the Google Sheet (Backend Storage)

### Step 2.1 — Create the Sheet

1. Go to https://sheets.google.com
2. Click **Blank** to create a new spreadsheet
3. Rename it: `Logbook UC Data` (top-left, click "Untitled spreadsheet")
4. **Critical:** rename the default tab from "Sheet1" to **`ParaChange`** (exact spelling, case-sensitive)
5. Click the **+** at the bottom-left to add a second tab. Rename it to **`Downtime`** (exact spelling)
6. Add column headers in row 1 of each tab:

**ParaChange tab — paste these into row 1:**
```
server_timestamp	client_timestamp	site	line	machine	unit	assy	change_time	changed_by	param	previous_value	new_value	reason
```

**Downtime tab — paste these into row 1:**
```
server_timestamp	client_timestamp	site	line	machine	unit	assy	type	occurrence_time	recovery_time	duration_minutes	technician	symptom	cause	countermeasure
```

(The tab character separates columns when you paste into row 1 — it should auto-fill across A1, B1, C1, etc.)

7. Bold row 1 and freeze it: **View → Freeze → 1 row**

### Step 2.2 — Set up Apps Script

1. In your Google Sheet, click **Extensions → Apps Script**
2. A new tab opens with a code editor showing a blank `Code.gs` file
3. Delete everything in `Code.gs`
4. Open the `apps-script.gs` file from your local repo (the one Claude Code generated)
5. Copy its **entire contents** and paste into the Apps Script editor
6. Click the **disk icon (Save)** or press `Ctrl+S`
7. Rename the project (top-left, click "Untitled project") to: `Logbook UC Backend`

### Step 2.3 — Add the Teams webhook URL as a Script Property

(Skip this for now if you haven't created the Teams webhook yet — we'll do that in Phase 3 and come back.)

1. In Apps Script, click the **gear icon** on the left sidebar (Project Settings)
2. Scroll down to **Script Properties**
3. Click **Add script property**
4. Property: `TEAMS_WEBHOOK_URL`
5. Value: paste your Teams Incoming Webhook URL (from Phase 3)
6. Click **Save script properties**

### Step 2.4 — Deploy as a Web App

1. Top-right of Apps Script editor: click **Deploy → New deployment**
2. Click the gear icon next to "Select type" → choose **Web app**
3. Fill in:
   - **Description:** `Logbook UC v1`
   - **Execute as:** `Me (your-email@example.com)` ← important, must be Me
   - **Who has access:** `Anyone` ← important, otherwise the form can't reach it
4. Click **Deploy**
5. Google will ask you to authorize the script. Click **Authorize access** → pick your account → **Advanced** → **Go to Logbook UC Backend (unsafe)** (this warning is normal for unverified personal scripts) → **Allow**
6. After authorization, you'll see a **Web app URL** that looks like:
   ```
   https://script.google.com/macros/s/AKfycbx.....veryLongRandomString..../exec
   ```
7. **Copy that URL.** You need it for the next step.

### Step 2.5 — Test the backend in isolation

In your terminal:

```bash
curl -L "PASTE_THE_WEB_APP_URL_HERE"
```

You should get back something like:
```json
{"status": "alive", "time": "2026-05-06T18:23:11.000Z"}
```

If you get an HTML page back instead, the deployment access wasn't set to "Anyone" — go back and redeploy.

---

## Phase 3 — Set Up the Microsoft Teams Webhook

### Step 3.1 — Create the webhook in Teams

1. Open Microsoft Teams (desktop or web)
2. Navigate to the Teams channel where notifications should appear (e.g., `Cell Assembly - Controls` or whatever channel makes sense — check with Mark/Dae Joon)
3. Click the **⋯ (more options)** next to the channel name → **Manage channel** OR right at the top of the channel **... → Connectors**
4. Find **Incoming Webhook** → click **Add** (or **Configure** if already added)
5. Name it: `Logbook UC`
6. Optional: upload an icon
7. Click **Create**
8. **Copy the webhook URL** (it looks like `https://ultiumcellsllc.webhook.office.com/webhookb2/.....`)
9. Click **Done**

### Step 3.2 — Wire it into Apps Script

Go back to your Apps Script tab (Step 2.3 above) and add the webhook URL as the `TEAMS_WEBHOOK_URL` script property. **Save script properties.**

### Step 3.3 — Test the Teams notification

After saving the property, you don't need to redeploy. The script will pick up the new value on the next request.

You can test by sending a manual POST to the Web App URL:

```bash
curl -X POST -L \
  -H "Content-Type: application/json" \
  -d '{"formType":"para_change","site":"UC1-Lordstown","line":"1-1","machine":"TW","unit":"TBD","assy":"TBD","change_time":"2026-05-06 14:00","changed_by":"Adam Test","param":"WeldCurrent","previous_value":"100","new_value":"105","reason":"Backend wire-up test","client_timestamp":"2026-05-06T18:00:00.000Z"}' \
  "PASTE_THE_WEB_APP_URL_HERE"
```

Check:
- ✅ A new row appears in the **ParaChange** tab of your Google Sheet
- ✅ A blue card appears in your Teams channel saying "🔧 Parameter Change Logged"

If both work, the backend is solid.

---

## Phase 4 — Connect the Frontend to the Backend

### Step 4.1 — Update config.js

Open `config.js` in your local repo and paste the Apps Script Web App URL:

```javascript
apiUrl: "https://script.google.com/macros/s/AKfycbx..../exec",
```

### Step 4.2 — Test locally end-to-end

Reopen `index.html` in your browser. Fill out the form with test data and hit **Generate**. You should see:
- ✅ Green "Saved to Sheet & posted to Teams" message
- ✅ Formatted Kakao text in the result panel with a working Copy button
- ✅ A new row in your Google Sheet (refresh the Sheet tab)
- ✅ A new card in your Teams channel

If something fails, check the browser console (F12 → Console tab) for the actual error.

---

## Phase 5 — Push to GitHub & Enable Pages

### Step 5.1 — Commit and push

In WSL2:

```bash
cd ~/projects/logbook-uc
git add .
git commit -m "Initial Logbook UC build with Google Apps Script backend"
git push origin main
```

### Step 5.2 — Enable GitHub Pages

1. On github.com, navigate to your repo
2. Click **Settings** (top-right of the repo nav)
3. Left sidebar: **Pages**
4. Under **Source**, choose:
   - Branch: `main`
   - Folder: `/ (root)`
5. Click **Save**
6. Wait ~1 minute. Refresh the Pages settings page. You should see a green banner:
   ```
   ✅ Your site is live at https://YourUser.github.io/logbook-uc/
   ```

### Step 5.3 — Test the live site

Open the live URL on your phone (or send it to yourself). Fill the form and submit. Verify the Sheet row and Teams notification both appear.

---

## Phase 6 — Roll It Out

### Step 6.1 — Pin the link in Kakao

Send the live URL to Dae Joon. Ask him to pin it as an announcement in the relevant KakaoTalk group chat. Recommended message:

```
📋 New tool: UC PKG Parameter Change & Downtime Logger
🔗 https://YourUser.github.io/logbook-uc/

How to use:
1. Open the link on your phone
2. Pick the right tab (Para Change or Downtime)
3. Fill the form
4. Hit Generate
5. Tap the Copy button and paste into this Kakao chat

The data also auto-syncs to a tracking sheet — no double-entry needed.
```

### Step 6.2 — Brief the engineers

Send a 2-minute walkthrough screen recording or do a 5-minute Teams call with the engineers. Show them:
- The two tabs and when to use each
- That they need to copy and paste into Kakao for visibility
- That they don't need to email anyone — the Sheet auto-updates

---

## Phase 7 — Iterate on the Dropdowns

After a few days of real use, you'll have a clearer idea of which Unit/Assy values engineers actually need. To update:

1. Edit `config.js` locally
2. `git add config.js && git commit -m "Update Unit/Assy dropdowns" && git push`
3. GitHub Pages auto-redeploys in ~1 minute
4. Engineers refresh the page, see the new dropdowns

---

## Common Issues & Fixes

### ❌ "Backend not configured" blue panel keeps showing

You forgot to paste the Apps Script URL into `config.js`, or you pasted it with extra quotes/spaces. Check the file, push, wait 1 minute, hard-refresh the page (Ctrl+Shift+R).

### ❌ Form submits but nothing appears in the Sheet

- Check Apps Script execution log: in Apps Script editor, left sidebar → **Executions**. Look for failed runs and click them for the error.
- Most common cause: the Sheet tab names aren't *exactly* `ParaChange` and `Downtime` (case-sensitive, no spaces). Rename them.
- Second most common: you redeployed Apps Script but didn't update `apiUrl` in `config.js`. Each deployment can produce a new URL — to avoid this, use **Deploy → Manage deployments → edit existing → New version** instead of "New deployment."

### ❌ Sheet row appears but no Teams notification

- Check that `TEAMS_WEBHOOK_URL` script property is set correctly (no extra spaces, full URL including `https://`)
- Test the webhook directly with curl:
  ```bash
  curl -X POST -H "Content-Type: application/json" \
    -d '{"text":"test from terminal"}' \
    "PASTE_TEAMS_WEBHOOK_URL"
  ```
  If the test message doesn't appear in Teams, the webhook URL is wrong or the connector was disabled.

### ❌ Korean characters showing as boxes or question marks

Either:
- The `<meta charset="UTF-8">` tag is missing from `index.html` (have Claude Code add it)
- Or your phone doesn't have a Korean font installed (rare on modern phones, but possible on older Android)

### ❌ Mobile layout is broken

- Make sure the viewport meta tag is in `index.html`:
  ```html
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ```
- Have Claude Code review the CSS for any fixed widths that should be percentages

### ❌ Apps Script throws "Authorization required" on every request

You deployed with **Execute as: User accessing the web app** instead of **Me**. Redeploy with the correct setting.

### ❌ The yellow security banner is annoying — can I remove it?

**No.** Keep it until you've migrated to internal Ultium hosting. It's protecting you legally and reminding engineers not to put proprietary process recipes into a public-internet form.

---

## Phase 2 Roadmap (When You're Ready)

Once Dae Joon greenlights this and engineers are using it consistently, the next move is migrating to Ultium internal infrastructure:

1. **Storage:** Google Sheet → SharePoint List in your team's SharePoint site
2. **Backend:** Apps Script → Power Automate flow with HTTP trigger
3. **Hosting:** GitHub Pages → SharePoint-hosted SPFx web part OR an internal IIS server
4. **Auth:** Anonymous → Microsoft Entra ID single sign-on
5. **Reporting:** Manual download → Power BI dashboard reading directly from the SharePoint List

That migration is a 2-3 day effort. The frontend code stays mostly the same — only the `apiUrl` and authentication code changes.

---

## When You're Stuck

In order:

1. Check the browser console (F12) for JS errors
2. Check the Apps Script Executions log for backend errors
3. Test the Apps Script URL with curl (Phase 2 Step 2.5)
4. Test the Teams webhook with curl (Common Issues section)
5. Bring the actual error message back to Claude — vague descriptions ("it's broken") are hard to debug; specific errors get fixed in one round.
