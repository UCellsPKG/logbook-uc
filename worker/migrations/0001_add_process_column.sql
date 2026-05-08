-- Add `process` column (PKG / LnS) to para_changes and downtimes.
-- Existing rows are backfilled to 'PKG' since that was the only process
-- before the LnS logbook page shipped.
--
-- Run with:
--   cd worker
--   wrangler d1 execute logbook-uc-db --remote --file=./migrations/0001_add_process_column.sql
--
-- (drop --remote to apply locally first if testing).

ALTER TABLE para_changes ADD COLUMN process TEXT NOT NULL DEFAULT 'PKG';
ALTER TABLE downtimes    ADD COLUMN process TEXT NOT NULL DEFAULT 'PKG';

CREATE INDEX IF NOT EXISTS idx_para_process ON para_changes(process);
CREATE INDEX IF NOT EXISTS idx_dt_process   ON downtimes(process);
