/* ================================================================
   e-AKHA v5.11.10
   STRICT NAME MATCH + DUPLICATE GUARD + PERMANENT TH

   PERMANENT TH:
   1. MUHAMAD ASREE BIN HAZIR
   2. MOHD AMINUDIN BIN DAUD
   3. MOHD NAZRI BIN ISMAIL
   ================================================================ */

(function () {
  'use strict';

  if (window.__EAKHA_51110_STRICT_IMPORT__) return;
  window.__EAKHA_51110_STRICT_IMPORT__ = true;

  const PATCH = 'v5.11.10-STRICT-NAME-PERMANENT-TH';
  const YEAR = 2026;
  const MONTH = 6;
  const LAST_DAY = 30;

  /* ================================================================
     AKSES SISTEM DALAM IFRAME
     ================================================================ */

  function systemWindow() {
    const frame =
      document.getElementById('system') ||
      document.querySelector('iframe');

    try {
      if (
        frame &&
        frame.contentWindow &&
        frame.contentDocument &&
        frame.contentDocument.documentElement
      ) {
        return frame.contentWindow;
      }
    } catch (error) {
      console.warn('[51110] Tidak dapat akses iframe:', error);
    }

    return window;
  }

  function systemDocument() {
    const frame =
      document.getElementById('system') ||
      document.querySelector('iframe');

    try {
      if (frame && frame.contentDocument) {
        return frame.contentDocument;
      }
    } catch (error) {}

    return document;
  }

  function getGlobal(w, name) {
    try {
      return w.eval(
        'typeof ' + name + ' !== "undefined" ? ' + name + ' : undefined'
      );
    } catch (error) {
      return w[name];
    }
  }

  function setGlobal(w, name, value) {
    try {
      w[name] = value;
      w.eval(name + '=window["' + name + '"]');
    } catch (error) {
      w[name] = value;
    }
  }

  /* ================================================================
     NORMALISASI NAMA — TIADA FUZZY MATCH BERISIKO
     ================================================================ */

  function cleanText(value) {
    return String(value == null ? '' : value)
      .toUpperCase()
      .trim();
  }

  function normaliseName(value) {
    let name = cleanText(value);

    /*
      Bahagian selepas @ biasanya nama alias.
      Nama sebelum @ digunakan sebagai identiti utama.
    */
    name = name.split('@')[0];

    name = name
      .replace(/\bA\s*\/\s*L\b/g, 'AL')
      .replace(/\bA\s*\/\s*P\b/g, 'AP')

      .replace(
        /\b(MOHAMMAD|MOHAMED|MUHAMMAD|MUHAMAD|MOHD|MUHD)\b/g,
        'MOHAMAD'
      )

      .replace(/\bAAUNI\b/g, 'AUNI')
      .replace(/\bHAIKAL\b/g, 'HAIQAL')
      .replace(/\bYUSOFF\b/g, 'YUSOF')
      .replace(/\bAZLANNOOR\b/g, 'AZLANNOR')
      .replace(/\bLATIFAH\b/g, 'LATIFA')
      .replace(/\bRODANIA\b/g, 'ROBANIA')
      .replace(/\bROSHISYAM\b/g, 'ROHISHAM')
      .replace(/\bNORAZARIN\b/g, 'NOR AZARIN')
      .replace(/\bALLIF\b/g, 'ALIFF')
      .replace(/\bPENAMA\b/g, '')

      .replace(/[^A-Z0-9 ]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return name;
  }

  function compactName(value) {
    return normaliseName(value).replace(/\s+/g, '');
  }

  function normaliseUserId(value) {
    return cleanText(value)
      .replace(/[^A-Z0-9]/g, '')
      .trim();
  }

  /* ================================================================
     RULE TH KEKAL
     ================================================================ */

  function isPermanentTH(member) {
    const name = normaliseName(member && member.nama);

    return (
      (name.includes('ASREE') && name.includes('HAZIR')) ||
      (name.includes('AMINUDIN') && name.includes('DAUD')) ||
      (name.includes('NAZRI') && name.includes('ISMAIL'))
    );
  }

  function lockPermanentTH(cell) {
    if (!cell || typeof cell !== 'object') return cell;

    Object.assign(cell, {
      kzp: 'TH',
      kzk: 'TH',

      tc_in: '',
      tc_out: '',
      tc_all: [],
      tc_raw: '',
      tc_shift: 'TH',
      tc_source: PATCH,
      tc_audit_status: 'TH',
      tc_issue: 'TAHAN TUGAS',
      tc_audit_done: true,

      audit_final: 'TH',
      audit_status: 'TH',
      final_audit: 'TH',
      audit_class: 'af-th',
      audit_incomplete: false,

      note: 'TAHAN TUGAS — KEKAL',
      locked_by: PATCH,
      permanent_th: true,

      offday_locked: false,
      no_perhatian: true,
      audit_ignore_attention: true
    });

    return cell;
  }

  function forceAllPermanentTH(w) {
    const MASTER = getGlobal(w, 'MASTER');
    const D = getGlobal(w, 'D');

    if (!Array.isArray(MASTER) || !D) return;

    MASTER.forEach(function (member) {
      if (!isPermanentTH(member)) return;

      if (!D[member.bil]) D[member.bil] = {};

      for (let day = 1; day <= LAST_DAY; day++) {
        if (!D[member.bil][day]) D[member.bil][day] = {};
        lockPermanentTH(D[member.bil][day]);
      }
    });
  }

  /* ================================================================
     BACA SHIFT HAKIKI
     ================================================================ */

  function getShift(w, member, day) {
    const gSh = getGlobal(w, 'gSh');

    try {
      if (typeof gSh === 'function') {
        const result = cleanText(gSh(member.bil, day));
        if (result) return result;
      }
    } catch (error) {}

    const D = getGlobal(w, 'D') || {};
    const cell =
      (D[member.bil] && D[member.bil][day]) ||
      (D[String(member.bil)] && D[String(member.bil)][day]) ||
      {};

    return cleanText(
      cell.shift_hakiki ||
      cell.hakiki_shift ||
      cell.shift_live ||
      cell.shift ||
      ''
    );
  }

  function isOffShift(shift) {
    const value = cleanText(shift);
    return value === 'O' || value === 'OF' || value === 'OFF';
  }

  /* ================================================================
     PARSE NILAI TIMECARD
     ================================================================ */

  function parseTimecard(rawValue) {
    const raw = String(rawValue == null ? '' : rawValue).trim();

    const result = {
      raw: raw,
      shift: '',
      in: '',
      out: '',
      all: [],
      status: '',
      issue: '',
      note: ''
    };

    if (!raw) return result;

    let working = raw;
    const shiftMatch = raw.match(/^(M|PG|PT)\s+(.*)$/i);

    if (shiftMatch) {
      result.shift = shiftMatch[1].toUpperCase();
      working = shiftMatch[2].trim();
    } else if (/^OFF|^OF\b/i.test(raw)) {
      result.shift = 'O';
    }

    const times = working.match(/\d{1,2}:\d{2}/g) || [];
    result.all = times.slice();

    if (/^OFF|^OF\b/i.test(raw)) {
      result.status = /OT/i.test(raw) ? 'OFF_OT' : 'OFFDAY';
      result.issue = 'OFFDAY';
      result.note = /OT/i.test(raw)
        ? 'OFFDAY OT DIABAIKAN'
        : 'OFFDAY';

      return result;
    }

    if (/TIADA DATA PDF/i.test(working)) {
      result.status = 'TIADA_DATA';
      result.issue = 'TIADA DATA PDF';
      result.note = 'TIADA DATA PDF';
      return result;
    }

    if (/THUMB LUAR SHIFT/i.test(working)) {
      result.status = 'LUAR_SHIFT';
      result.issue = 'THUMB LUAR SHIFT';
      result.note = 'THUMB LUAR SHIFT';
      return result;
    }

    if (/ABSENT|TIDAK HADIR/i.test(working)) {
      result.status = 'ABSENT';
      result.issue = 'ABSENT';
      result.note = 'ABSENT';
      return result;
    }

    if (/IN\s+\d{1,2}:\d{2}\s+SINGLE/i.test(working)) {
      result.status = 'SINGLE_IN';
      result.in = times[0] || '';
      result.issue = 'SINGLE PUNCH IN';
      result.note = 'SINGLE PUNCH IN';
      return result;
    }

    if (/OUT\s+\d{1,2}:\d{2}\s+SINGLE/i.test(working)) {
      result.status = 'SINGLE_OUT';
      result.out = times[0] || '';
      result.issue = 'SINGLE PUNCH OUT';
      result.note = 'SINGLE PUNCH OUT';
      return result;
    }

    if (times.length >= 2) {
      result.status = /LEWAT/i.test(working) ? 'LEWAT' : 'HADIR';
      result.in = times[0];
      result.out = times[1];
      result.issue = result.status;
      result.note = result.status === 'LEWAT' ? 'LEWAT' : '';
      return result;
    }

    if (times.length === 1) {
      result.status = 'SINGLE';
      result.in = times[0];
      result.issue = 'SINGLE PUNCH';
      result.note = 'SINGLE PUNCH';
      return result;
    }

    result.status = 'SEMAK';
    result.issue = 'SEMAK';
    result.note = working;

    return result;
  }

  /* ================================================================
     BACA EXCEL
     ================================================================ */

  function findHeaderColumn(headers, patterns, fallback) {
    for (let index = 0; index < headers.length; index++) {
      const text = cleanText(headers[index]);

      if (
        patterns.some(function (pattern) {
          return pattern.test(text);
        })
      ) {
        return index;
      }
    }

    return fallback;
  }

  function extractDay(headerValue) {
    const text = String(headerValue == null ? '' : headerValue).trim();

    let match = text.match(
      /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](2026|\d{2})$/
    );

    if (match && Number(match[2]) === MONTH) {
      const day = Number(match[1]);
      if (day >= 1 && day <= LAST_DAY) return day;
    }

    match = text.match(/^(\d{1,2})\/06\/2026/);

    if (match) {
      const day = Number(match[1]);
      if (day >= 1 && day <= LAST_DAY) return day;
    }

    return 0;
  }

  function parseWorkbook(w, workbook) {
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const data = w.XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      raw: false,
      defval: ''
    });

    if (!data.length) return [];

    const headers = data[0] || [];

    const jabColumn = findHeaderColumn(
      headers,
      [/^JAB$/, /JABATAN/],
      0
    );

    const companyColumn = findHeaderColumn(
      headers,
      [/KOMP/, /KOMPENI/, /SHIFT/],
      1
    );

    const nameColumn = findHeaderColumn(
      headers,
      [/^NAMA$/, /NAMA ANGGOTA/, /ANGGOTA/],
      2
    );

    const userColumn = findHeaderColumn(
      headers,
      [/USER/, /STAFF ID/, /NO PEKERJA/, /ID ANGGOTA/],
      3
    );

    const dateColumns = {};

    headers.forEach(function (header, columnIndex) {
      const day = extractDay(header);
      if (day) dateColumns[day] = columnIndex;
    });

    /*
      Fallback format asal:
      A = Jabatan
      B = Kompeni
      C = Nama
      D = User ID
      E-AH = 1 hingga 30 Jun
    */
    if (Object.keys(dateColumns).length < 20) {
      for (let day = 1; day <= LAST_DAY; day++) {
        dateColumns[day] = day + 3;
      }
    }

    return data
      .slice(1)
      .filter(function (row) {
        return row && String(row[nameColumn] || '').trim();
      })
      .map(function (row, sourceIndex) {
        const days = {};

        for (let day = 1; day <= LAST_DAY; day++) {
          const columnIndex = dateColumns[day];
          days[day] = String(
            columnIndex == null ? '' : row[columnIndex] || ''
          ).trim();
        }

        return {
          sourceRow: sourceIndex + 2,
          jab: row[jabColumn] || '',
          komp: row[companyColumn] || '',
          nama: row[nameColumn] || '',
          user: row[userColumn] || '',
          days: days
        };
      });
  }

  /* ================================================================
     INDEX MASTER DAN STRICT MATCH
     ================================================================ */

  function pushMap(map, key, member) {
    if (!key) return;

    if (!map.has(key)) map.set(key, []);
    map.get(key).push(member);
  }

  function buildMasterIndex(MASTER) {
    const byName = new Map();
    const byCompactName = new Map();
    const byUserId = new Map();

    MASTER.forEach(function (member) {
      pushMap(byName, normaliseName(member.nama), member);
      pushMap(byCompactName, compactName(member.nama), member);

      const ids = [
        member.user_id,
        member.staff_id,
        member.no_pekerja,
        member.mykad
      ];

      ids.forEach(function (id) {
        pushMap(byUserId, normaliseUserId(id), member);
      });
    });

    return {
      byName: byName,
      byCompactName: byCompactName,
      byUserId: byUserId
    };
  }

  function uniqueMember(list) {
    if (!Array.isArray(list) || list.length !== 1) return null;
    return list[0];
  }

  function matchMember(row, index) {
    const userId = normaliseUserId(row.user);

    if (userId) {
      const byUser = uniqueMember(index.byUserId.get(userId));
      if (byUser) {
        return {
          member: byUser,
          method: 'USER_ID'
        };
      }
    }

    const exactName = normaliseName(row.nama);
    const byExactName = uniqueMember(index.byName.get(exactName));

    if (byExactName) {
      return {
        member: byExactName,
        method: 'EXACT_NAME'
      };
    }

    /*
      Hanya membetulkan perbezaan jarak.
      Tiada fuzzy matching dan tiada padanan separuh nama.
    */
    const compact = compactName(row.nama);
    const byCompact = uniqueMember(index.byCompactName.get(compact));

    if (byCompact) {
      return {
        member: byCompact,
        method: 'COMPACT_EXACT_NAME'
      };
    }

    return {
      member: null,
      method: 'UNMATCHED'
    };
  }

  /* ================================================================
     RESET TIMECARD SAHAJA
     KZP, KZK, MC DAN HRMIS TIDAK DIPADAM
     ================================================================ */

  function resetMemberTimecard(w, member) {
    const D = getGlobal(w, 'D');

    if (!D[member.bil]) D[member.bil] = {};

    for (let day = 1; day <= LAST_DAY; day++) {
      if (!D[member.bil][day]) D[member.bil][day] = {};

      const cell = D[member.bil][day];

      if (isPermanentTH(member)) {
        lockPermanentTH(cell);
        continue;
      }

      const shift = getShift(w, member, day);

      Object.assign(cell, {
        tc_in: '',
        tc_out: '',
        tc_all: [],
        tc_raw: '',
        tc_source: '',
        tc_issue: '',
        tc_audit_done: true,

        audit_final: '',
        audit_status: '',
        final_audit: '',
        audit_class: 'af-pending',
        audit_incomplete: true
      });

      if (/^TIME CARD/i.test(String(cell.note || ''))) {
        cell.note = '';
      }

      if (isOffShift(shift)) {
        Object.assign(cell, {
          tc_shift: 'O',
          tc_audit_status: 'OFFDAY',
          tc_issue: 'OFFDAY',
          audit_final: 'OFFDAY',
          audit_status: 'OFFDAY',
          final_audit: 'OFFDAY',
          audit_class: 'af-off',
          audit_incomplete: false
        });
      } else {
        cell.tc_shift = '';
        cell.tc_audit_status = '';
      }
    }
  }

  /* ================================================================
     MASUKKAN TIMECARD KEPADA ANGGOTA YANG BETUL
     ================================================================ */

  function applyTimecardRow(w, member, row, report) {
    const D = getGlobal(w, 'D');

    if (!D[member.bil]) D[member.bil] = {};

    for (let day = 1; day <= LAST_DAY; day++) {
      if (!D[member.bil][day]) D[member.bil][day] = {};

      const cell = D[member.bil][day];

      if (isPermanentTH(member)) {
        lockPermanentTH(cell);
        report.thLocked++;
        continue;
      }

      const shift = getShift(w, member, day);
      const parsed = parseTimecard(row.days[day]);

      cell.tc_raw = parsed.raw;
      cell.tc_source = PATCH;
      cell.user_id = row.user || member.user_id || member.staff_id || '';

      if (isOffShift(shift) || parsed.shift === 'O') {
        Object.assign(cell, {
          tc_shift: 'O',
          tc_in: '',
          tc_out: '',
          tc_all: parsed.all || [],
          tc_audit_status:
            parsed.status === 'OFF_OT' ? 'OFF_OT' : 'OFFDAY',
          tc_issue: 'OFFDAY',
          tc_audit_done: true,
          note:
            parsed.status === 'OFF_OT'
              ? 'TIME CARD: OFFDAY OT DIABAIKAN'
              : 'TIME CARD: OFFDAY'
        });

        report.offday++;
        continue;
      }

      Object.assign(cell, {
        tc_shift: parsed.shift || shift || '',
        tc_in: parsed.in || '',
        tc_out: parsed.out || '',
        tc_all: parsed.all || [],
        tc_audit_status: parsed.status || '',
        tc_issue: parsed.issue || '',
        tc_audit_done: true,
        note: parsed.note
          ? 'TIME CARD: ' + parsed.note
          : parsed.raw
            ? 'TIME CARD IMPORT'
            : ''
      });

      if (parsed.in && parsed.out) report.pair++;
      if (/^SINGLE/.test(parsed.status)) report.single++;
      if (parsed.status === 'ABSENT') report.absent++;
      if (parsed.status === 'LEWAT') report.lewat++;
      if (parsed.status === 'LUAR_SHIFT') report.luarShift++;
      if (parsed.raw) report.cells++;
    }
  }

  /* ================================================================
     SIMPAN LOCAL STORAGE
     ================================================================ */

  function saveLocal(w, report) {
    try {
      w.localStorage.setItem('eakha_active_month', String(MONTH));
      w.localStorage.setItem(
        'eakha_data',
        JSON.stringify(getGlobal(w, 'D') || {})
      );

      w.localStorage.setItem(
        'eakha_jun_strict_import_51110',
        '1'
      );

      w.localStorage.setItem(
        'eakha_jun_strict_import_51110_report',
        JSON.stringify(report)
      );
    } catch (error) {
      console.warn('[51110] LocalStorage gagal:', error);
    }
  }

  /* ================================================================
     SYNC DATABASE — TANPA DELETE SEMUA DATA JUN
     ================================================================ */

  function rowsForDatabase(w) {
    const MASTER = getGlobal(w, 'MASTER') || [];
    const D = getGlobal(w, 'D') || [];
    const output = [];

    MASTER.forEach(function (member) {
      for (let day = 1; day <= LAST_DAY; day++) {
        const cell =
          (D[member.bil] && D[member.bil][day]) ||
          {};

        output.push({
          bil: Number(member.bil),
          tahun: YEAR,
          bulan: MONTH,
          hari: day,

          shift_hakiki: getShift(w, member, day),

          kz_penyelia: cell.kzp || '',
          kz_koperal: cell.kzk || '',

          tc_in: cell.tc_in || '',
          tc_out: cell.tc_out || '',

          ot_sambung: Boolean(cell.ot),
          hrmis: cell.hrmis || '',
          pengganti: Boolean(cell.pengganti),

          note: cell.note || cell.tc_raw || '',

          audit_final:
            cell.audit_final ||
            cell.audit_status ||
            cell.final_audit ||
            '',

          updated_at: new Date().toISOString()
        });
      }
    });

    return output;
  }

  async function syncDatabase(w) {
    const supa = getGlobal(w, 'supa');

    if (!supa) {
      return {
        ok: false,
        reason: 'SUPABASE_NOT_READY',
        rows: 0
      };
    }

    const rows = rowsForDatabase(w);

    try {
      for (let index = 0; index < rows.length; index += 100) {
        const batch = rows.slice(index, index + 100);

        const response = await supa
          .from('audit_cells')
          .upsert(batch, {
            onConflict: 'bil,tahun,bulan,hari'
          });

        if (response && response.error) {
          throw response.error;
        }
      }

      return {
        ok: true,
        rows: rows.length
      };
    } catch (error) {
      console.error('[51110] Database sync gagal:', error);

      return {
        ok: false,
        reason: 'DB_SYNC_FAILED',
        error: String(error && error.message ? error.message : error),
        rows: 0
      };
    }
  }

  /* ================================================================
     AUDIT DAN RENDER
     ================================================================ */

  async function rerunAudit(w) {
    const procAll = getGlobal(w, 'procAll');

    try {
      if (typeof procAll === 'function') {
        await procAll();
      }
    } catch (error) {
      console.warn('[51110] procAll gagal:', error);
    }

    /*
      ProcAll tidak dibenarkan menukar ketiga-tiga anggota TH.
    */
    forceAllPermanentTH(w);

    [
      'renderMaster',
      'renderDash',
      'renderTCStaging',
      'renderOutput',
      'updFlags'
    ].forEach(function (functionName) {
      try {
        const fn = getGlobal(w, functionName);

        if (typeof fn === 'function') {
          if (functionName === 'renderOutput') {
            fn('');
          } else {
            fn();
          }
        }
      } catch (error) {
        console.warn('[51110] Render gagal:', functionName, error);
      }
    });
  }

  /* ================================================================
     STATUS PANEL
     ================================================================ */

  function setStatus(message, success) {
    const element = document.getElementById('jun-panel-51110-status');

    if (!element) return;

    element.style.color = success ? '#6ee7b7' : '#fbbf24';
    element.textContent = message;
  }

  function setReport(report) {
    const box = document.getElementById('jun-panel-51110-report');
    if (!box) return;

    const unmatched =
      report.unmatched.length > 0
        ? '\n\nTIDAK DIPADANKAN:\n- ' +
          report.unmatched.join('\n- ')
        : '';

    const duplicates =
      report.duplicates.length > 0
        ? '\n\nDUPLICATE DITOLAK:\n- ' +
          report.duplicates.join('\n- ')
        : '';

    box.textContent =
      'Anggota Excel: ' + report.sourceRows +
      '\nBerjaya dipadankan: ' + report.matched +
      '\nTidak dipadankan: ' + report.unmatched.length +
      '\nDuplicate ditolak: ' + report.duplicates.length +
      '\nPair IN/OUT: ' + report.pair +
      '\nSingle punch: ' + report.single +
      '\nAbsent: ' + report.absent +
      '\nLewat: ' + report.lewat +
      '\nTH dikunci: ' + report.thMembers.join(', ') +
      unmatched +
      duplicates;
  }

  /* ================================================================
     PROSES IMPORT
     ================================================================ */

  async function importStrict(file) {
    const w = systemWindow();

    try {
      const XLSX = w.XLSX;
      const MASTER = getGlobal(w, 'MASTER');
      const D = getGlobal(w, 'D');

      if (!XLSX) {
        setStatus(
          'XLSX belum tersedia. Tunggu beberapa saat dan cuba semula.',
          false
        );
        return;
      }

      if (!Array.isArray(MASTER) || !MASTER.length || !D) {
        setStatus(
          'MASTER sistem belum tersedia. Import dibatalkan.',
          false
        );
        return;
      }

      setStatus(
        'Membaca Excel menggunakan padanan nama dan User ID yang ketat…',
        false
      );

      const workbook = XLSX.read(await file.arrayBuffer(), {
        type: 'array'
      });

      const sourceRows = parseWorkbook(w, workbook);

      if (!sourceRows.length) {
        setStatus(
          'Tiada rekod anggota dijumpai dalam Excel.',
          false
        );
        return;
      }

      const masterIndex = buildMasterIndex(MASTER);
      const matchedRows = [];
      const usedMemberIds = new Set();

      const report = {
        ok: false,
        patch: PATCH,
        file: file.name,
        at: new Date().toISOString(),

        sourceRows: sourceRows.length,
        matched: 0,

        unmatched: [],
        duplicates: [],

        pair: 0,
        single: 0,
        absent: 0,
        lewat: 0,
        luarShift: 0,
        offday: 0,
        cells: 0,
        thLocked: 0,

        thMembers: []
      };

      sourceRows.forEach(function (row) {
        const result = matchMember(row, masterIndex);

        if (!result.member) {
          report.unmatched.push(
            'Baris ' + row.sourceRow + ': ' + row.nama
          );
          return;
        }

        if (usedMemberIds.has(Number(result.member.bil))) {
          report.duplicates.push(
            'Baris ' +
              row.sourceRow +
              ': ' +
              row.nama +
              ' → ' +
              result.member.nama
          );
          return;
        }

        usedMemberIds.add(Number(result.member.bil));

        matchedRows.push({
          row: row,
          member: result.member,
          method: result.method
        });
      });

      if (!matchedRows.length) {
        setStatus(
          'Tiada nama dapat dipadankan. Data tidak dimasukkan.',
          false
        );

        setReport(report);
        return;
      }

      /*
        Fail lengkap:
        reset Timecard semua anggota supaya data salah attach lama dibuang.

        Fail separa:
        reset anggota yang berjaya dipadankan sahaja.
      */
      const isFullFile =
        sourceRows.length >= Math.max(
          40,
          Math.floor(MASTER.length * 0.75)
        );

      const membersToReset = isFullFile
        ? MASTER
        : matchedRows.map(function (item) {
            return item.member;
          });

      membersToReset.forEach(function (member) {
        resetMemberTimecard(w, member);
      });

      matchedRows.forEach(function (item) {
        applyTimecardRow(w, item.member, item.row, report);
      });

      forceAllPermanentTH(w);

      report.thMembers = MASTER
        .filter(isPermanentTH)
        .map(function (member) {
          return member.nama;
        });

      report.matched = matchedRows.length;

      setGlobal(w, '__EAKHA_51110_REPORT__', report);
      saveLocal(w, report);

      await rerunAudit(w);

      forceAllPermanentTH(w);
      saveLocal(w, report);

      const database = await syncDatabase(w);
      report.database = database;
      report.ok = true;

      setGlobal(w, '__EAKHA_51110_REPORT__', report);
      saveLocal(w, report);

      setReport(report);

      setStatus(
        'SIAP: ' +
          report.matched +
          ' anggota dipadankan. ' +
          report.unmatched.length +
          ' tidak dipadankan. ' +
          report.duplicates.length +
          ' duplicate ditolak. DB: ' +
          (database.ok ? database.rows + ' rekod' : 'belum sync'),
        database.ok
      );

      console.log('[e-AKHA ' + PATCH + ']', report);
    } catch (error) {
      console.error('[51110] Import gagal:', error);

      setStatus(
        'Import gagal: ' +
          String(error && error.message ? error.message : error),
        false
      );
    }
  }

  /* ================================================================
     PANEL IMPORT BAHARU
     ================================================================ */

  function removeOldPanel() {
    const oldPanel = document.getElementById('jun-panel-51109');

    if (oldPanel) {
      oldPanel.remove();
    }

    try {
      const innerOldPanel =
        systemDocument().getElementById('jun-panel-51109');

      if (innerOldPanel) innerOldPanel.remove();
    } catch (error) {}
  }

  function createPanel() {
    if (document.getElementById('jun-panel-51110')) return;

    removeOldPanel();

    const panel = document.createElement('div');
    const input = document.createElement('input');

    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.style.display = 'none';

    input.addEventListener('change', function () {
      if (input.files && input.files[0]) {
        importStrict(input.files[0]);
      }

      input.value = '';
    });

    panel.id = 'jun-panel-51110';

    panel.style.cssText =
      'position:fixed;' +
      'right:14px;' +
      'top:52px;' +
      'z-index:2147483647;' +
      'width:370px;' +
      'max-height:80vh;' +
      'overflow:auto;' +
      'background:#071426;' +
      'border:2px solid #22c55e;' +
      'border-radius:10px;' +
      'padding:11px 12px;' +
      'color:#ffffff;' +
      'font:12px system-ui;' +
      'box-shadow:0 8px 30px rgba(0,0,0,.5)';

    panel.innerHTML =
      '<div style="font-weight:900;color:#6ee7b7;margin-bottom:5px">' +
        'IMPORT TIMECARD JUN — STRICT MATCH' +
      '</div>' +

      '<div style="font-size:10px;line-height:1.45;color:#cbd5e1">' +
        'Padanan hanya melalui User ID atau nama penuh tepat.<br>' +
        'Tiada padanan ikut susunan baris.<br>' +
        'Asree, Aminudin dan Nazri dikunci TH pada semua tarikh.' +
      '</div>' +

      '<button id="jun-panel-51110-button" ' +
        'style="' +
          'width:100%;' +
          'margin-top:9px;' +
          'padding:9px;' +
          'border:0;' +
          'border-radius:7px;' +
          'font-weight:900;' +
          'cursor:pointer;' +
          'background:#22c55e;' +
          'color:#052e16' +
        '">' +
        'PILIH FAIL EXCEL TIMECARD JUN' +
      '</button>' +

      '<div id="jun-panel-51110-status" ' +
        'style="margin-top:8px;font-size:10px;color:#fbbf24">' +
        'Sedia untuk import.' +
      '</div>' +

      '<pre id="jun-panel-51110-report" ' +
        'style="' +
          'white-space:pre-wrap;' +
          'font-size:9px;' +
          'line-height:1.45;' +
          'margin:8px 0 0;' +
          'padding:7px;' +
          'border-radius:6px;' +
          'background:rgba(0,0,0,.35);' +
          'color:#cbd5e1' +
        '"></pre>';

    panel.appendChild(input);
    document.body.appendChild(panel);

    document
      .getElementById('jun-panel-51110-button')
      .addEventListener('click', function () {
        input.click();
      });
  }

  /* ================================================================
     PASTIKAN TH TIDAK DITUKAR OLEH SCRIPT LAIN
     ================================================================ */

  function installTHGuard() {
    const w = systemWindow();

    forceAllPermanentTH(w);

    const renderMaster = getGlobal(w, 'renderMaster');

    if (
      typeof renderMaster === 'function' &&
      !renderMaster.__EAKHA_TH_GUARD__
    ) {
      const originalRenderMaster = renderMaster;

      const guardedRenderMaster = function () {
        forceAllPermanentTH(w);
        const result = originalRenderMaster.apply(this, arguments);
        forceAllPermanentTH(w);
        return result;
      };

      guardedRenderMaster.__EAKHA_TH_GUARD__ = true;

      setGlobal(w, 'renderMaster', guardedRenderMaster);
    }
  }

  function boot() {
    createPanel();
    removeOldPanel();
    installTHGuard();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  let attempts = 0;

  const bootTimer = setInterval(function () {
    boot();

    attempts++;

    if (attempts > 240) {
      clearInterval(bootTimer);
    }
  }, 500);

  /*
    Guard ringan:
    Pastikan TH kekal walaupun pengguna tekan proses semula.
  */
  setInterval(function () {
    try {
      forceAllPermanentTH(systemWindow());
    } catch (error) {}
  }, 1500);
})();
Fix duplicate data and lock permanent TH
