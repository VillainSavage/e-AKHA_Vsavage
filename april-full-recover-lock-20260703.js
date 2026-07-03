/* e-AKHA April 2026 full 7-layer recovery + lock. Does not touch Mei. */
(async () => {
  'use strict';

  if (window.__EAKHA_APRIL_FULL_LOCK_RUNNING__) return;
  window.__EAKHA_APRIL_FULL_LOCK_RUNNING__ = true;

  const DB_NAME = 'eakha_vsavage_safe_store';
  const STORE = 'snapshots';
  const YEAR = 2026;
  const MONTH = 4;
  const DAYS = 30;
  const clone = (v) => JSON.parse(JSON.stringify(v ?? null));
  const upper = (v) => String(v ?? '').toUpperCase().replace(/\s+/g, ' ').trim();
  const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
  const notEmpty = (v) => Array.isArray(v) ? v.length > 0 : isObj(v) ? Object.keys(v).length > 0 : v !== null && v !== undefined && String(v).trim() !== '';

  function openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME);
      req.onerror = () => reject(req.error);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE, { keyPath: 'id' });
      };
      req.onsuccess = () => resolve(req.result);
    });
  }

  function getAll(db) {
    return new Promise((resolve, reject) => {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  function put(db, row) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(row);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  function monthOf(s) {
    const n = Number(s?.bulan ?? s?.month ?? s?.activeMonth);
    if (n >= 1 && n <= 12) return n;
    const m = [s?.id, s?.reason, s?.sourceSnapshot].join(' ').match(/2026[_/-](0?[1-9]|1[0-2])/);
    return m ? Number(m[1]) : null;
  }

  function stamp(s) {
    const m = String(s?.id || '').match(/(17\d{11,})$/);
    return m ? Number(m[1]) : Date.parse(s?.savedAt || '') || 0;
  }

  function validApril(s) {
    return !!(
      s && monthOf(s) === MONTH && Array.isArray(s.MASTER) && s.MASTER.length >= 50 &&
      s.D && Object.keys(s.D).length >= 45 && !/BROKEN|DRAFT|LOCK_POINTER/i.test(`${s.id || ''} ${s.reason || ''}`)
    );
  }

  function nameKey(v) {
    return upper(v)
      .replace(/LATIFAH/g, 'LATIFA')
      .replace(/MOHAMMAD|MUHAMMAD|MOHAMED/g, 'MOHAMAD')
      .replace(/\bBIN\b|\bBINTI\b|\bAL\b/g, ' ')
      .replace(/[^A-Z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function isLatifa(v) {
    const n = nameKey(v);
    return n.includes('LATIFA') && n.includes('ROBANIA');
  }

  function normalizeMaster(rows) {
    const out = [];
    const seen = new Set();
    for (const raw of rows || []) {
      if (!raw || !raw.nama) continue;
      const m = clone(raw);
      const k = isLatifa(m.nama) ? 'LATIFA ROBANIA' : nameKey(m.nama);
      if (seen.has(k)) continue;
      seen.add(k);
      if (isLatifa(m.nama)) {
        m.nama = 'LATIFA ROBANIA BINTI ABDUL RAZAK';
        m.jab = m.jabatan = m.department = 'IKTAR';
        m.komp = m.kompeni = m.company = 'DELTA';
      }
      out.push(m);
    }
    out.sort((a, b) => Number(a.bil || 9999) - Number(b.bil || 9999));
    return out;
  }

  const PLACEHOLDER = /^(?:-|TM|TIADA MAKLUMAN|TIADA PUNCH|TIADA IN DAN OUT|TIADA PERMOHONAN|OFF|OFFDAY|OF|REHAT)$/i;
  function quality(field, value) {
    if (!notEmpty(value)) return 0;
    if (Array.isArray(value)) return value.length ? 5 : 0;
    if (isObj(value)) return Object.keys(value).length ? 6 : 0;
    const t = upper(value);
    if (PLACEHOLDER.test(t)) return 1;
    if (/\b([01]?\d|2[0-3]):[0-5]\d\b/.test(t)) return 7;
    if (field === 'kzp' || field === 'kzk') {
      if (/^(?:✓|HADIR|MC|CR|EL|CTR|CB|CBR|TH|TT|L|LL|BER|K\/P)$/.test(t)) return 7;
      return 4;
    }
    if (field.startsWith('tc_') || field === 'ot') return 6;
    if (field.includes('mc') || field === '_mc') return 7;
    if (field.includes('hrmis') || field === '_hrmis_rec') return 7;
    if (field.includes('audit')) return 5;
    return 3;
  }

  function metric(snapshot, layer) {
    let score = 0;
    for (const days of Object.values(snapshot.D || {})) {
      for (const cell of Object.values(days || {})) {
        if (!cell || typeof cell !== 'object') continue;
        if (layer === 'kzp') score += quality('kzp', cell.kzp) + quality('kzp_jam', cell.kzp_jam);
        if (layer === 'kzk') score += quality('kzk', cell.kzk) + quality('kzk_jam', cell.kzk_jam);
        if (layer === 'tc') {
          score += quality('tc_in', cell.tc_in) + quality('tc_out', cell.tc_out) + quality('tc_all', cell.tc_all);
          if (cell.tc_problem) score += 1;
        }
        if (layer === 'mc') score += quality('_mc', cell._mc) + quality('mc_display', cell.mc_display) + quality('mc_status', cell.mc_status);
        if (layer === 'hrmis') score += quality('_hrmis_rec', cell._hrmis_rec) + quality('hrmis', cell.hrmis) + quality('hrmis_display', cell.hrmis_display);
        if (layer === 'audit') score += quality('audit_final', cell.audit_final) + quality('final_audit', cell.final_audit);
      }
    }
    const arrays = {
      kzp: ['KZP_PRELOAD'], kzk: ['KZK_PRELOAD'], tc: ['TIMECARD_PRELOAD', 'TC_PRELOAD'],
      mc: ['MC_PRELOAD', 'MC_DATA'], hrmis: ['HRMIS_PRELOAD', 'HRMIS_DATA', 'CUTI_HRMIS_PRELOAD'], audit: []
    }[layer] || [];
    for (const name of arrays) score += (Array.isArray(snapshot[name]) ? snapshot[name].length : 0) * 3;
    return score;
  }

  function chooseBest(candidates, layer) {
    return candidates.slice().sort((a, b) => {
      const qa = metric(a, layer), qb = metric(b, layer);
      if (qb !== qa) return qb - qa;
      return stamp(b) - stamp(a);
    })[0] || null;
  }

  function copyFields(target, source, predicate) {
    if (!source) return;
    for (const [field, value] of Object.entries(source)) {
      if (!predicate(field)) continue;
      const incomingQ = quality(field, value);
      const currentQ = quality(field, target[field]);
      if (incomingQ > currentQ || (incomingQ === currentQ && incomingQ >= 5)) target[field] = clone(value);
    }
  }

  function ownerMap(master) {
    const byBil = new Map();
    const byName = new Map();
    for (const m of master || []) {
      byBil.set(String(m.bil), m);
      byName.set(nameKey(m.nama), m);
      if (isLatifa(m.nama)) byName.set('LATIFA ROBANIA', m);
    }
    return { byBil, byName };
  }

  function resolveOwner(sourceMaster, targetMaps, sourceBil) {
    const src = (sourceMaster || []).find(m => String(m.bil) === String(sourceBil));
    if (src) {
      const k = isLatifa(src.nama) ? 'LATIFA ROBANIA' : nameKey(src.nama);
      if (targetMaps.byName.has(k)) return targetMaps.byName.get(k);
    }
    return targetMaps.byBil.get(String(sourceBil)) || null;
  }

  function mergeLayer(targetD, targetMaster, sourceSnapshot, predicate) {
    if (!sourceSnapshot) return;
    const maps = ownerMap(targetMaster);
    for (const [srcBil, days] of Object.entries(sourceSnapshot.D || {})) {
      const owner = resolveOwner(sourceSnapshot.MASTER, maps, srcBil);
      if (!owner) continue;
      const bil = String(owner.bil);
      if (!targetD[bil]) targetD[bil] = {};
      for (let d = 1; d <= DAYS; d++) {
        if (!targetD[bil][d]) targetD[bil][d] = {};
        copyFields(targetD[bil][d], days?.[d] || days?.[String(d)] || {}, predicate);
      }
    }
  }

  function dedupeRows(rows) {
    const out = [];
    const seen = new Set();
    for (const row of rows || []) {
      if (!row || typeof row !== 'object') continue;
      const k = [row.bil ?? row.owner_bil ?? '', row.tarikh ?? row.date ?? row.d ?? '', row.dari ?? '', row.hingga ?? '', row.status ?? row.jenis ?? row.kzp ?? row.kzk ?? '', row.no_mc ?? row.no_rujukan ?? row.klinik ?? ''].join('|');
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(clone(row));
    }
    return out;
  }

  function unionArray(candidates, names) {
    const rows = [];
    for (const s of candidates.sort((a, b) => stamp(a) - stamp(b))) {
      for (const name of names) if (Array.isArray(s[name])) rows.push(...s[name]);
    }
    return dedupeRows(rows);
  }

  function getBinding(name) {
    try { return window.eval(`typeof ${name} !== 'undefined' ? ${name} : undefined`); }
    catch (_) { return window[name]; }
  }

  function mutateBinding(name, value) {
    const current = getBinding(name);
    const incoming = clone(value);
    if (Array.isArray(current) && Array.isArray(incoming)) {
      current.splice(0, current.length, ...incoming);
      try { window[name] = current; } catch (_) {}
      return true;
    }
    if (isObj(current) && isObj(incoming)) {
      for (const k of Object.keys(current)) delete current[k];
      Object.assign(current, incoming);
      try { window[name] = current; } catch (_) {}
      return true;
    }
    window.__EAKHA_BINDING_TMP__ = incoming;
    try { window.eval(`${name} = window.__EAKHA_BINDING_TMP__`); delete window.__EAKHA_BINDING_TMP__; return true; }
    catch (_) { try { window[name] = incoming; delete window.__EAKHA_BINDING_TMP__; return true; } catch (_) { delete window.__EAKHA_BINDING_TMP__; return false; } }
  }

  function call(name, ...args) {
    try {
      const f = window.eval(`typeof ${name} === 'function' ? ${name} : null`) || window[name];
      if (typeof f === 'function') return f(...args);
    } catch (e) { console.warn(name, e); }
  }

  const db = await openDB();
  const allSnapshots = await getAll(db);
  const candidates = allSnapshots.filter(validApril);
  if (!candidates.length) throw new Error('Tiada snapshot April yang sah dalam IndexedDB.');

  const base = candidates.find(s => s.id === 'safe_snapshot_2026_04_FINAL_LOCKED') ||
    candidates.slice().sort((a, b) => (b.MASTER?.length || 0) - (a.MASTER?.length || 0) || stamp(b) - stamp(a))[0];

  let master = normalizeMaster(base.MASTER || []);
  const bestMaster = candidates.slice().sort((a, b) => {
    const sa = (a.MASTER?.length === 53 ? 1000 : 0) + (a.MASTER || []).some(m => isLatifa(m.nama)) * 100;
    const sb = (b.MASTER?.length === 53 ? 1000 : 0) + (b.MASTER || []).some(m => isLatifa(m.nama)) * 100;
    return sb - sa || stamp(b) - stamp(a);
  })[0];
  if (bestMaster) master = normalizeMaster(bestMaster.MASTER);

  const sourceKZP = chooseBest(candidates, 'kzp');
  const sourceKZK = chooseBest(candidates, 'kzk');
  const sourceTC = chooseBest(candidates, 'tc');
  const sourceMC = chooseBest(candidates, 'mc');
  const sourceHR = chooseBest(candidates, 'hrmis');
  const sourceAudit = chooseBest(candidates, 'audit');

  const compositeD = {};
  for (const m of master) {
    const bil = String(m.bil);
    compositeD[bil] = {};
    for (let d = 1; d <= DAYS; d++) compositeD[bil][d] = {};
  }

  mergeLayer(compositeD, master, base, () => true);
  mergeLayer(compositeD, master, sourceKZP, f => f === 'kzp' || f.startsWith('kzp_') || f === 'pengganti' || f === 'pengganti_nama');
  mergeLayer(compositeD, master, sourceKZK, f => f === 'kzk' || f.startsWith('kzk_'));
  mergeLayer(compositeD, master, sourceTC, f => f === 'ot' || f === 'tc_problem' || f.startsWith('tc_') || f === 'timecard_display' || f === 'timecard_text');
  mergeLayer(compositeD, master, sourceMC, f => f === '_mc' || /^mc(?:_|$)/i.test(f) || /klinik|clinic|rujukan/i.test(f));
  mergeLayer(compositeD, master, sourceHR, f => f === '_hrmis_rec' || /^hrmis(?:_|$)/i.test(f));
  mergeLayer(compositeD, master, sourceAudit, f => /audit/i.test(f) || f === 'final_audit');

  const KZP_PRELOAD = unionArray(candidates, ['KZP_PRELOAD']);
  const KZK_PRELOAD = unionArray(candidates, ['KZK_PRELOAD']);
  const TIMECARD_PRELOAD = unionArray(candidates, ['TIMECARD_PRELOAD', 'TC_PRELOAD']);
  const MC_DATA = unionArray(candidates, ['MC_DATA', 'MC_PRELOAD']);
  const HRMIS_DATA = unionArray(candidates, ['HRMIS_DATA', 'HRMIS_PRELOAD', 'CUTI_HRMIS_PRELOAD']);

  const beforeId = `backup_before_april_full_lock_${Date.now()}`;
  await put(db, {
    id: beforeId, tahun: YEAR, bulan: MONTH, savedAt: new Date().toISOString(),
    reason: 'Backup before April full 7-layer composite recovery',
    MASTER: clone(getBinding('MASTER') || window.MASTER || []),
    D: clone(getBinding('D') || window.D || {}),
    MC_DATA: clone(getBinding('MC_DATA') || []),
    HRMIS_DATA: clone(getBinding('HRMIS_DATA') || []),
    KZP_PRELOAD: clone(getBinding('KZP_PRELOAD') || []),
    KZK_PRELOAD: clone(getBinding('KZK_PRELOAD') || []),
    TIMECARD_PRELOAD: clone(getBinding('TIMECARD_PRELOAD') || [])
  });

  const finalId = `safe_snapshot_2026_04_FULL_7_LAYERS_LOCKED_${Date.now()}`;
  const finalSnapshot = {
    id: finalId, type: 'EAKHA_LOCKED_MONTH_DATABASE', tahun: YEAR, bulan: MONTH,
    savedAt: new Date().toISOString(), lockedAt: new Date().toISOString(), locked: true, immutable: true,
    reason: 'April 2026 full 7-layer composite recovery. Mei untouched.',
    sourceSnapshot: base.id,
    sources: {
      master: bestMaster?.id || base.id, kzp: sourceKZP?.id || '', kzk: sourceKZK?.id || '',
      timecard: sourceTC?.id || '', mc: sourceMC?.id || '', hrmis: sourceHR?.id || '', audit: sourceAudit?.id || ''
    },
    MASTER: master, D: compositeD,
    KZP_PRELOAD, KZK_PRELOAD, TIMECARD_PRELOAD,
    MC_PRELOAD: MC_DATA, MC_DATA,
    HRMIS_PRELOAD: HRMIS_DATA, HRMIS_DATA,
    CUTI_HRMIS_PRELOAD: HRMIS_DATA
  };

  await put(db, finalSnapshot);
  await put(db, {
    id: 'LOCK_POINTER_2026_04_FULL', type: 'MONTH_LOCK_POINTER', tahun: YEAR, bulan: MONTH,
    targetSnapshotId: finalId, savedAt: new Date().toISOString()
  });
  db.close();

  mutateBinding('MASTER', master);
  mutateBinding('D', compositeD);
  mutateBinding('MC_DATA', MC_DATA);
  mutateBinding('HRMIS_DATA', HRMIS_DATA);
  mutateBinding('HRMIS_PRELOAD', HRMIS_DATA);
  mutateBinding('KZP_PRELOAD', KZP_PRELOAD);
  mutateBinding('KZK_PRELOAD', KZK_PRELOAD);
  mutateBinding('TIMECARD_PRELOAD', TIMECARD_PRELOAD);
  mutateBinding('ACTIVE_YEAR', YEAR);
  mutateBinding('ACTIVE_MONTH', MONTH);

  try {
    localStorage.setItem('eakha_locked_snapshot_2026_04', finalId);
    localStorage.setItem('eakha_active_snapshot_2026_04', finalId);
    localStorage.setItem('eakha_last_good_snapshot', finalId);
    localStorage.setItem('eakha_active_month', '4');
    localStorage.setItem('eakha_dataset_2026_4', JSON.stringify({
      version: 'APRIL_FULL_7_LAYER_LOCK', tahun: YEAR, bulan: MONTH, savedAt: new Date().toISOString(),
      D: compositeD, MC_DATA, HRMIS_DATA, CUSTOM_ANGGOTA: clone(getBinding('CUSTOM_ANGGOTA') || [])
    }));
  } catch (e) { console.warn('Local pointer/cache write:', e); }

  const render = () => {
    call('normalizeHRMISAll');
    call('renderMaster', null);
    call('renderDash');
    call('renderOutput', '');
    call('renderMCReg');
    call('renderHRMISReg');
    call('renderKZPStaging');
    call('renderKZKStaging');
    call('renderTCStaging');
    call('updFlags');
  };
  render();
  [700, 1800, 3500].forEach(ms => setTimeout(render, ms));

  const counts = { kzp: 0, kzk: 0, punchDays: 0, punchMarks: 0, mcCells: 0, hrmisCells: 0 };
  for (const days of Object.values(compositeD)) {
    for (const cell of Object.values(days || {})) {
      if (notEmpty(cell.kzp)) counts.kzp++;
      if (notEmpty(cell.kzk)) counts.kzk++;
      const times = [cell.tc_in, cell.tc_out, ...(Array.isArray(cell.tc_all) ? cell.tc_all : [])].filter(notEmpty);
      if (times.length) counts.punchDays++;
      counts.punchMarks += times.length;
      if (notEmpty(cell._mc) || notEmpty(cell.mc_display) || notEmpty(cell.mc_status)) counts.mcCells++;
      if (notEmpty(cell._hrmis_rec) || notEmpty(cell.hrmis) || notEmpty(cell.hrmis_display)) counts.hrmisCells++;
    }
  }

  window.APRIL_FULL_7_LAYER_LOCK_REPORT = {
    snapshot: finalId, backup: beforeId, master: master.length, owners: Object.keys(compositeD).length,
    ...counts, KZP_PRELOAD: KZP_PRELOAD.length, KZK_PRELOAD: KZK_PRELOAD.length,
    TIMECARD_PRELOAD: TIMECARD_PRELOAD.length, MC_DATA: MC_DATA.length, HRMIS_DATA: HRMIS_DATA.length,
    sources: finalSnapshot.sources
  };
  console.log('=== APRIL FULL 7-LAYER LOCK ===');
  console.table([window.APRIL_FULL_7_LAYER_LOCK_REPORT]);

  setTimeout(() => {
    alert(
      'APRIL FULL DATA SIAP & LOCKED.\n' +
      `Master: ${master.length} | Owner: ${Object.keys(compositeD).length}\n` +
      `KZP: ${counts.kzp} | KZK: ${counts.kzk}\n` +
      `Timecard hari: ${counts.punchDays} | Punch: ${counts.punchMarks}\n` +
      `MC cell: ${counts.mcCells} | HRMIS cell: ${counts.hrmisCells}\n\n` +
      `Snapshot:\n${finalId}\n\nMei tidak disentuh.`
    );
  }, 4200);
})().catch(error => {
  console.error(error);
  alert('Fix April gagal:\n' + (error?.message || error));
}).finally(() => {
  window.__EAKHA_APRIL_FULL_LOCK_RUNNING__ = false;
});