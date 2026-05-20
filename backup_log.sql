-- ================================================================
-- e-AKHA Vsavage — Tambahan Schema: Backup Log
-- Jalankan dalam Supabase SQL Editor (selepas schema utama)
-- ================================================================

CREATE TABLE IF NOT EXISTS backup_log (
  id              SERIAL PRIMARY KEY,
  tahun           INTEGER NOT NULL,
  bulan           INTEGER NOT NULL,
  dilakukan_oleh  TEXT NOT NULL,
  fail_excel      TEXT DEFAULT '',
  fail_csv        TEXT DEFAULT '',
  fail_json       TEXT DEFAULT '',
  status          TEXT DEFAULT 'BERJAYA',
  jumlah_rekod    INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE backup_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all_backup_log" ON backup_log FOR ALL TO anon USING (TRUE) WITH CHECK (TRUE);
CREATE INDEX IF NOT EXISTS idx_backup_thn_bln ON backup_log(tahun, bulan);
