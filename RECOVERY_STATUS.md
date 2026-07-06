# e-AKHA Recovery Status

## Safety state

- Live `main` is not used as the rebuild workspace.
- Safety branch: `backup-pre-recovery-20260706`.
- Rebuild branch: `recovery-clean-v6`.
- Browser-data diagnostic exporter: `/diagnostics/eakha-audit-export.html` on `main`.
- No April/May data may be overwritten until the browser audit bundle is reviewed.

## Immutable recovery rules

1. April, May and June must use separate month datasets.
2. The canonical roster has 53 active audit members.
3. Records use a stable `member_id`; display `bil` is not an ownership key.
4. Raw KZP, KZK, Timecard, MC and HRMIS records are immutable source records.
5. Staging never writes directly into approved Master data.
6. Audit Final is derived and read-only; it cannot edit source layers.
7. Timecard cannot create KZP or KZK attendance.
8. OFFDAY remains OFFDAY; OT/punch on OFFDAY is ignored for attendance.
9. MC is valid only with an owner match, covered date, clinic and reference number.
10. HRMIS leave is valid only with an owner match, leave type and covered start/end dates.
11. Owner matching must report exact, alias, unresolved and ambiguous results separately.
12. A locked month is never rewritten by opening another month.

## Recovery phases

### Phase 1 — Acquire browser evidence

Export IndexedDB and localStorage using the read-only diagnostic page. The export must include:

- all `eakha_vsavage_safe_store` snapshots;
- `eakha_files` file metadata;
- `eakha_clean_v6` stores, if present;
- localStorage snapshot pointers;
- per-snapshot layer counts;
- duplicate roster and owner-conflict reports.

### Phase 2 — Establish canonical roster

Produce one canonical roster of 53 people with:

- `member_id`;
- official name;
- aliases;
- staff ID;
- department;
- company;
- active dates;
- legacy Bil mappings for every historical roster.

### Phase 3 — Recover April

Recover raw layers separately from the most reliable evidence. Do not copy existing Audit Final as a source. Rebuild Audit Final only after KZP, KZK, Timecard, MC and HRMIS are reconciled.

### Phase 4 — Recover May

Repeat recovery using only May evidence. No April preload, shift, date or storage key may be reused as May data.

### Phase 5 — Build clean monthly engine

Required stores:

- `members`;
- `month_rosters`;
- `raw_files`;
- `staging_records`;
- `approved_layer_records`;
- `audit_results`;
- `audit_log`;
- `month_locks`;
- `backups`.

### Phase 6 — Acceptance tests

For April and May:

- roster count = 53;
- no duplicate owner;
- no ambiguous source record;
- correct number of days;
- switching months does not alter either month;
- five refresh cycles produce identical hashes;
- logout/login produces identical hashes;
- exported backup restores to identical hashes;
- audit regeneration is deterministic.

### Phase 7 — Enable June

June is enabled only after April and May pass all acceptance tests.
