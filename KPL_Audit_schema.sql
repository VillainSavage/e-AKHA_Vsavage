-- ================================================================
-- SISTEM AUDIT KEHADIRAN KPL — HKL
-- Supabase Schema (Projek Baru)
-- Jalankan: Supabase Dashboard → SQL Editor → Paste → Run
-- ================================================================

-- ── ANGGOTA ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS anggota (
  bil        INTEGER PRIMARY KEY,
  nama       TEXT NOT NULL,
  jabatan    TEXT NOT NULL CHECK (jabatan IN ('IKTAR','MHKL','RT')),
  kompeni    TEXT NOT NULL CHECK (kompeni IN ('ALPHA','BRAVO','CHARLIE','DELTA')),
  catatan    TEXT DEFAULT '',
  aktif      BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── AUDIT CELLS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_cells (
  id              SERIAL PRIMARY KEY,
  bil             INTEGER NOT NULL REFERENCES anggota(bil) ON DELETE CASCADE,
  tahun           INTEGER NOT NULL DEFAULT 2026,
  bulan           INTEGER NOT NULL,
  hari            INTEGER NOT NULL,
  shift_hakiki    TEXT DEFAULT '',
  kz_penyelia     TEXT DEFAULT '',
  kz_koperal      TEXT DEFAULT '',
  tc_in           TEXT DEFAULT '',
  tc_out          TEXT DEFAULT '',
  ot_sambung      BOOLEAN DEFAULT FALSE,
  flags           TEXT[] DEFAULT '{}',
  audit_final     TEXT DEFAULT '',
  dikemaskini_oleh TEXT DEFAULT '',
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(bil, tahun, bulan, hari)
);

-- ── BAKI CUTI ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS baki_cuti (
  id           SERIAL PRIMARY KEY,
  bil          INTEGER NOT NULL REFERENCES anggota(bil),
  tahun        INTEGER NOT NULL DEFAULT 2026,
  baki_asal    NUMERIC(4,1) NOT NULL DEFAULT 0,
  diambil_cr   NUMERIC(4,1) DEFAULT 0,
  diambil_el   NUMERIC(4,1) DEFAULT 0,
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(bil, tahun)
);

-- ── AUDIT LOG ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id          SERIAL PRIMARY KEY,
  bil         INTEGER,
  bulan       INTEGER,
  hari        INTEGER,
  field_ubah  TEXT,
  nilai_lama  TEXT,
  nilai_baru  TEXT,
  diubah_oleh TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── RLS ──────────────────────────────────────────────────────────
ALTER TABLE anggota     ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_cells ENABLE ROW LEVEL SECURITY;
ALTER TABLE baki_cuti   ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_all" ON anggota     FOR ALL TO anon USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "anon_all" ON audit_cells FOR ALL TO anon USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "anon_all" ON baki_cuti   FOR ALL TO anon USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "anon_ins" ON audit_log   FOR INSERT TO anon WITH CHECK (TRUE);
CREATE POLICY "anon_sel" ON audit_log   FOR SELECT TO anon USING (TRUE);

-- ── INDEXES ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_cells_bil_bln ON audit_cells(bil, tahun, bulan);
CREATE INDEX IF NOT EXISTS idx_cells_flags   ON audit_cells USING GIN(flags);
CREATE INDEX IF NOT EXISTS idx_baki_bil      ON baki_cuti(bil, tahun);

-- ── SEED: 52 ANGGOTA ─────────────────────────────────────────────
INSERT INTO anggota (bil,nama,jabatan,kompeni,catatan) VALUES
(1,'MOHAMAD ALIFF BIN MOHTAR','IKTAR','ALPHA',''),
(2,'ABDULLAH BIN BAHUDIN','IKTAR','ALPHA',''),
(3,'MUHAMMAD TARMIZI BIN ABDULLAH','IKTAR','ALPHA',''),
(4,'MOHD AMINUDIN BIN DAUD','IKTAR','ALPHA','TAHAN TUGAS Apr 2026'),
(5,'IRWAN SYAMIR BIN MOHD ZAINAL','IKTAR','ALPHA','5x lewat Apr 2026'),
(6,'AALIYA AUNI BINTI MAT ZABIR','IKTAR','ALPHA',''),
(7,'ZULKIFLI BIN YUSOF','IKTAR','BRAVO',''),
(8,'MOHD ILHAM BIN YUSOFF','IKTAR','BRAVO',''),
(9,'NORAZARIN BIN HUSSIN','IKTAR','BRAVO',''),
(10,'MUHAMAD ASREE BIN HAZIR','IKTAR','BRAVO','TIDAK HADIR TUGAS Apr 2026'),
(11,'AZLANNOOR HADY BIN ABDUL TALIB','IKTAR','BRAVO',''),
(12,'NOR AINA NAZIRA BINTI MOHD TARMIZI','IKTAR','BRAVO',''),
(13,'AZROL NAIM BIN AB MALEK','IKTAR','CHARLIE',''),
(14,'WAN NOR FATHIYYAH BINTI WAN AHMAD PENAMA','IKTAR','CHARLIE',''),
(15,'MOHD RASIDI BIN MOHD NASIR','IKTAR','CHARLIE',''),
(16,'MUHAMMAD ASHLEY BIN BASHIR','IKTAR','CHARLIE',''),
(17,'MUHAMMAD BADRI BIN ARIS','IKTAR','CHARLIE',''),
(18,'MUHAMMAD ZULHELMI BIN AHMAD AFAMI','IKTAR','CHARLIE','CR+Thumb 4x'),
(19,'RIMA BINTI OTHMAN','IKTAR','DELTA',''),
(20,'MOHAMMAD FITHRI BIN ABD LATIF @ ABD LATIF','IKTAR','DELTA',''),
(21,'MOHAMAD ALIFF HAIQAL BIN MD JAMIL','IKTAR','DELTA',''),
(22,'LATIFA RODANIA BINTI ABDUL RAZAK','IKTAR','DELTA',''),
(23,'AHMAD SHAMIL BIN NADZRI','IKTAR','DELTA',''),
(24,'ROHISHAM BIN MOHAMAD AROF','IKTAR','DELTA',''),
(25,'MUHAMMAD AMIRULLAH BIN ABDUL SALIM','MHKL','ALPHA',''),
(26,'MOHD SOFIE BIN MOHD SHUKRI','MHKL','ALPHA',''),
(27,'MUHAMAD FAHMIE BIN SAHRAN','MHKL','ALPHA',''),
(28,'HAZLAN BIN MOHD RESDI','MHKL','BRAVO','19 kes Apr 2026'),
(29,'ANASHATOL ARNAEDA BINTI JAFRI','MHKL','BRAVO',''),
(30,'MOHAMAD ALIF BIN NASARUDDIN','MHKL','BRAVO',''),
(31,'MOHAMAD IZAT AFIFUDDIN BIN MOHAMAD AZMI','MHKL','CHARLIE',''),
(32,'AZELI BIN ZABER','MHKL','CHARLIE',''),
(33,'NORAZLIDA BINTI RAZAB','MHKL','CHARLIE',''),
(34,'MOHD LUKMAN BIN HAMDAN','MHKL','DELTA',''),
(35,'SUHAIRI BIN ISMAIL','MHKL','DELTA',''),
(36,'NURSYUHADA BINTI MISNAN','MHKL','DELTA',''),
(37,'YUSRI BIN YUNUS','RT','ALPHA',''),
(38,'MOHD SHAIFUL NIZAM BIN HAMID','RT','ALPHA',''),
(39,'NANTHA GOPAL A/L AYASAMY','RT','ALPHA',''),
(40,'SHAHRUL FITRI BIN ROSLI','RT','ALPHA',''),
(41,'MOHD KHADAFEE BIN MD SAAD','RT','BRAVO',''),
(42,'NOR AZURA BINTI TAMAN @ MUHAMMAD','RT','BRAVO',''),
(43,'MOHD SHAFIK BIN IBRAM','RT','BRAVO',''),
(44,'ZULHILMI BIN ZAINUDIN','RT','BRAVO',''),
(45,'NUR AZIM BIN NASIRUDDIN','RT','CHARLIE',''),
(46,'FARRAH NATASHA BINTI ZULKAFLI','RT','CHARLIE',''),
(47,'SAIFUL YUSRIZAL BIN YAACOB','RT','CHARLIE',''),
(48,'MUHAMMAD AFIQ FAIZ BIN BADARUDDIN','RT','CHARLIE',''),
(49,'ROSARIZAM BIN SAMSUDIN','RT','DELTA',''),
(50,'MUHAMMAD TARMIZI BIN SAZALI','RT','DELTA',''),
(51,'KHAIROL ISZUWAN BIN ZAKARIA','RT','DELTA','9x lewat Apr 2026'),
(52,'MOHD NAZRI BIN ISMAIL','RT','DELTA','')
ON CONFLICT (bil) DO NOTHING;

-- ================================================================
-- AUTH USERS — Buat dalam Authentication → Users → Add User
-- Email format: [id]@kpl.hkl.gov.my
-- Kemudian jalankan SQL ini untuk tambah metadata:
-- ================================================================
/*
UPDATE auth.users SET raw_user_meta_data = '{"nama":"SM Amierul","jawatan":"PELULUS"}'
WHERE email = 'sm.amierul@kpl.hkl.gov.my';

UPDATE auth.users SET raw_user_meta_data = '{"nama":"SJN Adilah","jawatan":"PENYOKONG"}'
WHERE email = 'sjn.adilah@kpl.hkl.gov.my';
*/
