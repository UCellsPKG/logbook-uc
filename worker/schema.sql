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
