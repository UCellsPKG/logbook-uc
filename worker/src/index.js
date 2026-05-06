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
  const csv = '﻿' + lines.join('\n'); // BOM for Excel UTF-8

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
