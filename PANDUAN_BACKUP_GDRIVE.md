# 🔐 Panduan Setup Backup Google Drive — e-AKHA Vsavage

---

## Gambaran Keseluruhan Seni Bina

```
Browser (GitHub Pages)
    │
    │  POST /functions/v1/backup-drive
    │  { tahun, bulan, user_id, role }
    ▼
Supabase Edge Function  ◄── GOOGLE_SERVICE_ACCOUNT_JSON (secret)
    │                   ◄── GOOGLE_DRIVE_FOLDER_ID (secret)
    │
    ├── Fetch data dari Supabase DB
    ├── Jana Excel + CSV + JSON
    └── Upload ke Google Drive (Service Account)
            │
            ▼
    📁 Google Drive
       └── eAKHA Vsavage / 2026 / 04_Apr_2026 /
              ├── eAKHA_2026_Apr_Audit_xxx.xlsx
              ├── eAKHA_2026_Apr_Audit_xxx.csv
              └── eAKHA_2026_Apr_Audit_xxx.json
```

**Kenapa Service Account, bukan OAuth biasa?**
- Service Account tidak perlu log masuk manual
- Token dijana oleh Edge Function — tidak pernah sampai ke browser
- Google credentials simpan dalam Supabase Secrets — selamat

---

## LANGKAH 1 — Buat Google Cloud Project

1. Pergi ke **https://console.cloud.google.com**
2. Klik **Select a project** → **New Project**
   - Project name: `eakha-vsavage`
   - Klik **Create**
3. Tunggu project dicipta, kemudian pilihnya

---

## LANGKAH 2 — Aktifkan Google Drive API

1. Dalam menu kiri: **APIs & Services** → **Library**
2. Cari **Google Drive API**
3. Klik **Enable**

---

## LANGKAH 3 — Cipta Service Account

1. **APIs & Services** → **Credentials**
2. Klik **+ Create Credentials** → **Service Account**
   - Name: `eakha-backup`
   - Description: `Backup audit KPL ke Google Drive`
   - Klik **Create and Continue**
   - Skip bahagian "Grant access" → klik **Done**

3. Klik pada service account yang baru dicipta
4. Pergi ke tab **Keys** → **Add Key** → **Create new key**
   - Key type: **JSON**
   - Klik **Create** → fail JSON akan muat turun automatik

5. **Simpan fail JSON ini dengan selamat** — ini adalah `GOOGLE_SERVICE_ACCOUNT_JSON`

---

## LANGKAH 4 — Persediakan Google Drive Folder

1. Pergi ke **https://drive.google.com**
2. Cipta folder baharu: **eAKHA Vsavage**
3. Klik kanan folder → **Share**
   - Tambah email Service Account: `eakha-backup@eakha-vsavage.iam.gserviceaccount.com`
     *(email ada dalam fail JSON tadi, field: `client_email`)*
   - Role: **Editor**
   - Klik **Send**
4. Buka folder → salin **ID folder** dari URL:
   ```
   https://drive.google.com/drive/folders/FOLDER_ID_DI_SINI
   ```

---

## LANGKAH 5 — Tambah SQL Backup Log dalam Supabase

1. Supabase Dashboard → SQL Editor → New Query
2. Paste kandungan fail `backup_log.sql` → Run

---

## LANGKAH 6 — Deploy Edge Function

### Install Supabase CLI
```bash
# macOS
brew install supabase/tap/supabase

# Windows — muat turun dari:
# https://github.com/supabase/cli/releases
```

### Login dan link project
```bash
supabase login
supabase link --project-ref [PROJECT_REF_ANDA]
# PROJECT_REF ada dalam Supabase Dashboard → Settings → General
```

### Set Supabase Secrets (PENTING — ini yang jaga keselamatan)
```bash
# Supabase Service Role Key (bukan anon key!)
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="eyJhbGci..."

# Google Service Account JSON (keseluruhan kandungan fail JSON tadi)
supabase secrets set GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"eakha-vsavage",...}'

# Google Drive Folder ID (dari URL folder tadi)
supabase secrets set GOOGLE_DRIVE_FOLDER_ID="1aBcDeFgHiJkLmNo..."
```

### Deploy Edge Function
```bash
# Dari folder projek (sama level dengan folder supabase/)
supabase functions deploy backup-drive --no-verify-jwt
```

### Verify deployment
```bash
supabase functions list
# Patut ada: backup-drive | Active
```

---

## LANGKAH 7 — Kemaskini index.html

Cari dan tukar dua nilai ini dalam `index.html`:
```javascript
const SUPA_URL    = 'https://[PROJECT_REF].supabase.co';
const EDGE_FN_URL = 'https://[PROJECT_REF].supabase.co/functions/v1/backup-drive';
const SUPA_KEY    = 'eyJhbGci...'; // anon public key
```

---

## LANGKAH 8 — Test Backup

1. Buka sistem → Log masuk sebagai SM Amierul atau SJN Adilah
2. Pergi ke **Backup Google Drive** (sidebar)
3. Pilih bulan → klik **Backup ke Google Drive**
4. Tunggu ~10-30 saat (Edge Function menjana fail)
5. Semak Google Drive folder **eAKHA Vsavage**

---

## Keselamatan

| Perkara | Di mana disimpan |
|---|---|
| Google Service Account JSON | Supabase Secrets (server) |
| Google Drive Folder ID | Supabase Secrets (server) |
| Supabase Service Role Key | Supabase Secrets (server) |
| Supabase Anon Key | index.html (selamat untuk public) |
| Password Admin (6438670) | index.html (local auth) |
| Password Viewer (633283) | index.html |

> ⚠️ **Cadangan**: Untuk keselamatan lebih tinggi dalam production, pindahkan pengesahan password ke Supabase Auth (email + password). Hubungi untuk bantuan setup.

---

## Struktur Fail Projek GitHub

```
audit-kpl-hkl/          ← nama repo GitHub
├── index.html           ← Sistem penuh (rename dari eAKHA_Vsavage.html)
├── README.md
├── schema.sql           ← DB schema utama
└── supabase/
    ├── functions/
    │   └── backup-drive/
    │       └── index.ts ← Edge Function
    └── migrations/
        └── backup_log.sql
```

---

## Troubleshooting

| Masalah | Penyelesaian |
|---|---|
| "Edge Function URL belum dikonfigurasi" | Tukar `EDGE_FN_URL` dalam index.html |
| "Google Drive belum dikonfigurasi" | Semak Supabase secrets ada GOOGLE_SERVICE_ACCOUNT_JSON |
| "Token error" | Service account JSON tidak sah / Drive API belum enabled |
| "403 Forbidden" | Folder belum share kepada service account email |
| "404 Tiada data" | Data audit belum dimasukkan untuk bulan tersebut |
| Fail tiada dalam Drive | Semak folder ID betul, service account ada Editor access |

---

## Kos

| Servis | Kos |
|---|---|
| Supabase Free Tier | Percuma (500MB DB, 500K Edge invocations/bulan) |
| Google Drive | Percuma (15GB) |
| GitHub Pages | Percuma |
| Google Cloud (Drive API) | Percuma untuk penggunaan biasa |

**Anggaran kos bulanan: RM 0** 🎉
