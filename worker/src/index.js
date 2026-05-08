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
         (client_timestamp, site, line, section, anode_cathode, unit, assy, change_time, changed_by, param, previous_value, new_value, reason)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        body.client_timestamp ?? null,
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
         (client_timestamp, site, line, section, anode_cathode, unit, assy, type, occurrence_time, recovery_time, duration_minutes, technician, symptom, cause, countermeasure)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        body.client_timestamp ?? null,
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
  const title = isPara ? '🔧 Parameter Change Logged' : '🚨 Downtime Event Logged';

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
    dbColumns: ['id', 'server_timestamp', 'client_timestamp', 'site', 'line', 'section', 'anode_cathode', 'unit', 'assy', 'change_time', 'changed_by', 'param', 'previous_value', 'new_value', 'reason'],
    headers:   ['ID', 'Logged At (Server)', 'Logged At (Client)', 'Site', 'Line', 'Section', 'A/C',          'Unit', 'Component', 'Change Time', 'Changed By', 'Parameter', 'Previous Value', 'New Value', 'Reason'],
    widths:    [ 6,    22,                   22,                   14,     8,      18,        8,              40,     22,          18,            16,           22,          18,               18,          50 ],
  },
  downtimes: {
    sheetName: 'Downtime Log',
    dbColumns: ['id', 'server_timestamp', 'client_timestamp', 'site', 'line', 'section', 'anode_cathode', 'unit', 'assy', 'type', 'occurrence_time', 'recovery_time', 'duration_minutes', 'technician', 'symptom', 'cause', 'countermeasure'],
    headers:   ['ID', 'Logged At (Server)', 'Logged At (Client)', 'Site', 'Line', 'Section', 'A/C',          'Unit', 'Component', 'Type', 'Occurrence',     'Recovery',       'Duration (min)',   'Technician', 'Symptom', 'Cause', 'Countermeasure'],
    widths:    [ 6,    22,                   22,                   14,     8,      18,        8,              40,     22,          28,     18,                18,                14,                 16,           50,        50,      50 ],
  },
};

async function handleExport(url, env) {
  const type = url.searchParams.get('type');
  const cfg = EXPORT_COLUMNS[type];
  if (!cfg) {
    return jsonResponse({ ok: false, error: 'Use ?type=para_changes or ?type=downtimes' }, 400);
  }

  const result = await env.DB.prepare(
    `SELECT ${cfg.dbColumns.join(', ')} FROM ${type} ORDER BY server_timestamp DESC`
  ).all();

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Logbook UC';
  wb.created = new Date();

  // Freeze the top row so the header stays put while scrolling.
  const ws = wb.addWorksheet(cfg.sheetName, {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  // Define columns (header text + key + width).
  ws.columns = cfg.dbColumns.map((dbCol, i) => ({
    header: cfg.headers[i],
    key: dbCol,
    width: cfg.widths[i],
  }));

  // Add data rows keyed by db column.
  for (const row of (result.results || [])) {
    const rowObj = {};
    for (const col of cfg.dbColumns) {
      rowObj[col] = row[col] == null ? '' : row[col];
    }
    ws.addRow(rowObj);
  }

  // Style the header row: bold white on Ultium-blue, with a darker bottom border.
  const headerRow = ws.getRow(1);
  headerRow.height = 22;
  headerRow.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.alignment = { horizontal: 'left', vertical: 'middle' };
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF003DA5' },
    };
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FF002A73' } },
    };
  });

  const buffer = await wb.xlsx.writeBuffer();

  const filename = `logbook-uc-${type}-${new Date().toISOString().slice(0, 10)}.xlsx`;

  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      ...CORS_HEADERS,
    },
  });
}

