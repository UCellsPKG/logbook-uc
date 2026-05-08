/**
 * Logbook UC — Cloudflare Worker backend
 *
 * Routes:
 *   GET  /                              health check
 *   POST /                              submit form (JSON body, formType field routes to table)
 *   GET  /export?type=para_changes      XLSX download (opens directly in Excel)
 *   GET  /export?type=downtimes         XLSX download (opens directly in Excel)
 *
 * Bindings (configured in wrangler.toml):
 *   env.DB                  D1 database
 *   env.TEAMS_WEBHOOK_URL   optional, set via `wrangler secret put TEAMS_WEBHOOK_URL`
 */

import ExcelJS from 'exceljs';

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

    if (request.method === 'GET' && url.pathname === '/send-test-email') {
      return await handleSendTestEmail(url, env);
    }

    if (request.method === 'POST' && url.pathname === '/') {
      return await handleSubmit(request, env);
    }

    return jsonResponse({ ok: false, error: 'Not found' }, 404);
  },

  // Cron handler — runs on the schedule defined in wrangler.toml.
  // Currently unwired (no `crons` set yet); will fire daily once enabled.
  async scheduled(_event, env, _ctx) {
    try {
      await sendDailyEmail(env);
    } catch (e) {
      console.error('Daily email failed:', e.message);
    }
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

  // process tags the row as PKG or LnS so the two logbook pages stay
  // independently filterable on export. Old clients may not send it;
  // default to PKG for backward compatibility.
  const VALID_PROCESSES = new Set(['PKG', 'LnS']);
  const process = VALID_PROCESSES.has(body.process) ? body.process : 'PKG';

  try {
    let result;
    if (formType === 'para_change') {
      result = await env.DB.prepare(
        `INSERT INTO para_changes
         (client_timestamp, process, site, line, section, anode_cathode, unit, assy, change_time, changed_by, param, previous_value, new_value, reason)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        body.client_timestamp ?? null,
        process,
        body.site ?? null,
        body.line ?? null,
        body.section ?? null,
        body.anode_cathode ?? null,
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
         (client_timestamp, process, site, line, section, anode_cathode, unit, assy, type, occurrence_time, recovery_time, duration_minutes, technician, symptom, cause, countermeasure)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        body.client_timestamp ?? null,
        process,
        body.site ?? null,
        body.line ?? null,
        body.section ?? null,
        body.anode_cathode ?? null,
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
  const title = isPara ? 'Parameter Change Logged' : 'Downtime Event Logged';

  const fields = isPara
    ? ['site', 'line', 'section', 'anode_cathode', 'unit', 'assy', 'change_time', 'changed_by', 'param', 'previous_value', 'new_value', 'reason']
    : ['site', 'line', 'section', 'anode_cathode', 'unit', 'assy', 'type', 'occurrence_time', 'recovery_time', 'duration_minutes', 'technician', 'symptom', 'cause', 'countermeasure'];

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

// Column metadata for the XLSX export — DB column names mapped to friendly
// header labels and sensible Excel column widths (in characters).
const EXPORT_COLUMNS = {
  para_changes: {
    sheetName: 'Parameter Changes',
    dbColumns: ['id', 'server_timestamp', 'client_timestamp', 'process', 'site', 'line', 'section', 'anode_cathode', 'unit', 'assy', 'change_time', 'changed_by', 'param', 'previous_value', 'new_value', 'reason'],
    headers:   ['ID', 'Logged At (Server)', 'Logged At (Client)', 'Process', 'Site', 'Line', 'Section', 'A/C',          'Unit', 'Component', 'Change Time', 'Changed By', 'Parameter', 'Previous Value', 'New Value', 'Reason'],
    widths:    [ 6,    22,                   22,                   8,         14,     8,      18,        8,              40,     22,          18,            16,           22,          18,               18,          50 ],
  },
  downtimes: {
    sheetName: 'Downtime Log',
    dbColumns: ['id', 'server_timestamp', 'client_timestamp', 'process', 'site', 'line', 'section', 'anode_cathode', 'unit', 'assy', 'type', 'occurrence_time', 'recovery_time', 'duration_minutes', 'technician', 'symptom', 'cause', 'countermeasure'],
    headers:   ['ID', 'Logged At (Server)', 'Logged At (Client)', 'Process', 'Site', 'Line', 'Section', 'A/C',          'Unit', 'Component', 'Type', 'Occurrence',     'Recovery',       'Duration (min)',   'Technician', 'Symptom', 'Cause', 'Countermeasure'],
    widths:    [ 6,    22,                   22,                   8,         14,     8,      18,        8,              40,     22,          28,     18,                18,                14,                 16,           50,        50,      50 ],
  },
};

async function handleExport(url, env) {
  // Optional &process=PKG or &process=LnS narrows the export to one logbook.
  // Omitted = full export (PKG + LnS combined).
  const VALID_PROCESSES = new Set(['PKG', 'LnS']);
  const procParam = url.searchParams.get('process');
  const processFilter = VALID_PROCESSES.has(procParam) ? procParam : null;

  // ?type= picks one table; omitted/invalid = bundle both as separate tabs
  // (the default for the UI download link — one click, one file, two tabs).
  const ALL_TYPES = ['para_changes', 'downtimes'];
  const typeParam = url.searchParams.get('type');
  const types = ALL_TYPES.includes(typeParam) ? [typeParam] : ALL_TYPES;

  const buffer = await buildXlsxBuffer(types, env, processFilter);
  const today = new Date().toISOString().slice(0, 10);
  const slug = types.length === 1 ? `-${types[0]}` : '';
  const procSlug = processFilter ? `-${processFilter}` : '';
  const filename = `logbook-uc${procSlug}${slug}-${today}.xlsx`;

  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      ...CORS_HEADERS,
    },
  });
}

// Generates a styled XLSX ArrayBuffer with one sheet per table type.
// Reused by both the /export endpoint (download) and the daily email path.
// processFilter (optional) narrows to one logbook (PKG / LnS).
async function buildXlsxBuffer(typeOrTypes, env, processFilter = null) {
  const types = Array.isArray(typeOrTypes) ? typeOrTypes : [typeOrTypes];

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Logbook UC';
  wb.created = new Date();

  for (const type of types) {
    const cfg = EXPORT_COLUMNS[type];
    if (!cfg) continue;

    const sql = processFilter
      ? `SELECT ${cfg.dbColumns.join(', ')} FROM ${type} WHERE process = ? ORDER BY server_timestamp DESC`
      : `SELECT ${cfg.dbColumns.join(', ')} FROM ${type} ORDER BY server_timestamp DESC`;
    const stmt = processFilter
      ? env.DB.prepare(sql).bind(processFilter)
      : env.DB.prepare(sql);
    const result = await stmt.all();

    const ws = wb.addWorksheet(cfg.sheetName, {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    ws.columns = cfg.dbColumns.map((dbCol, i) => ({
      header: cfg.headers[i],
      key: dbCol,
      width: cfg.widths[i],
    }));

    for (const row of (result.results || [])) {
      const rowObj = {};
      for (const col of cfg.dbColumns) {
        rowObj[col] = row[col] == null ? '' : row[col];
      }
      ws.addRow(rowObj);
    }

    const headerRow = ws.getRow(1);
    headerRow.height = 22;
    headerRow.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.alignment = { horizontal: 'left', vertical: 'middle' };
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF003DA5' } };
      cell.border = { bottom: { style: 'thin', color: { argb: 'FF002A73' } } };
    });
  }

  return await wb.xlsx.writeBuffer();
}

// ───────────────────────── Daily email (Resend) ─────────────────────────

async function sendDailyEmail(env) {
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY secret is not set');

  const recipientsRaw = env.RECIPIENT_EMAILS || '';
  const recipients = recipientsRaw.split(',').map(s => s.trim()).filter(Boolean);
  if (recipients.length === 0) throw new Error('RECIPIENT_EMAILS secret is not set');

  // Counts in the last 24 hours for the email body.
  const paraCount = await env.DB.prepare(
    "SELECT COUNT(*) AS c FROM para_changes WHERE server_timestamp >= datetime('now', '-1 day')"
  ).first();
  const dtCount = await env.DB.prepare(
    "SELECT COUNT(*) AS c FROM downtimes WHERE server_timestamp >= datetime('now', '-1 day')"
  ).first();

  const today = new Date().toISOString().slice(0, 10);
  const subject = `Logbook UC — Daily Export (${today})`;

  // Generate both Excel files
  const paraXlsx = await buildXlsxBuffer('para_changes', env);
  const dtXlsx = await buildXlsxBuffer('downtimes', env);

  const text = [
    `Logbook UC — daily export for ${today}.`,
    ``,
    `Last 24 hours:`,
    `  • Parameter changes: ${paraCount.c}`,
    `  • Downtime entries: ${dtCount.c}`,
    ``,
    `Two Excel files are attached. Each contains the full history (not just the last 24 hours).`,
    ``,
    `— Logbook UC (automated)`,
  ].join('\n');

  const html = `
    <p>Logbook UC — daily export for <strong>${today}</strong>.</p>
    <p><strong>Last 24 hours:</strong></p>
    <ul>
      <li>Parameter changes: <strong>${paraCount.c}</strong></li>
      <li>Downtime entries: <strong>${dtCount.c}</strong></li>
    </ul>
    <p>Two Excel files are attached. Each contains the full history (not just the last 24 hours).</p>
    <p style="color:#888;font-size:12px;margin-top:24px">— Logbook UC (automated)</p>
  `;

  const payload = {
    from: 'Logbook UC <onboarding@resend.dev>',
    to: recipients,
    subject,
    text,
    html,
    attachments: [
      {
        filename: `logbook-uc-para_changes-${today}.xlsx`,
        content: arrayBufferToBase64(paraXlsx),
      },
      {
        filename: `logbook-uc-downtimes-${today}.xlsx`,
        content: arrayBufferToBase64(dtXlsx),
      },
    ],
  };

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend ${res.status}: ${err}`);
  }
  return await res.json();
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

async function handleSendTestEmail(url, env) {
  // Lightweight protection: require ?token=<TEST_EMAIL_TOKEN secret>
  const token = url.searchParams.get('token');
  const expected = env.TEST_EMAIL_TOKEN;
  if (!expected) return jsonResponse({ ok: false, error: 'TEST_EMAIL_TOKEN secret is not set' }, 500);
  if (token !== expected) return jsonResponse({ ok: false, error: 'Invalid or missing token' }, 401);

  try {
    const result = await sendDailyEmail(env);
    return jsonResponse({ ok: true, resend: result });
  } catch (e) {
    return jsonResponse({ ok: false, error: e.message }, 500);
  }
}

