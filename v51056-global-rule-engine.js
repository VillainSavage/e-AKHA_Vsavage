/* e-AKHA v5.10.56 — consolidated attendance and audit rules */
(()=>{
  'use strict';
  if(window.__EAKHA_51056_BOOT__) return;
  window.__EAKHA_51056_BOOT__=true;

  const VERSION='5.10.56';
  const clone=v=>JSON.parse(JSON.stringify(v??null));
  const upper=v=>String(v??'').toUpperCase().replace(/\s+/g,' ').trim();
  const isObj=v=>v&&typeof v==='object'&&!Array.isArray(v);
  const pad=n=>String(n).padStart(2,'0');
  const BUTTON_TEXTS=[
    'UPLOAD EXCEL GABUNGAN KZ',
    'KEMASKINI KZP + KZK KE MASTER',
    'KEMAS KINI KZP + KZK KE MASTER',
    'FORCE 1 IRWAN 51034'
  ];
  const LEAVE_CODES=new Set(['CR','EL','CTR','CB','BER','BERSALIN','PELEPASAN','KP','K/P','CUTI']);
  const OFF_CODES=new Set(['O','OF','OFF','OFFDAY']);
  const SPECIAL_CODES=new Set(['TH','TT']);

  function deepWindow(){
    let W=window;
    for(let i=0;i<5;i++){
      let f=null;
      try{f=W.document?.querySelector('iframe#app,iframe')}catch(e){}
      if(!f?.contentWindow||f.contentWindow===W) break;
      try{if(!f.contentDocument?.documentElement)break}catch(e){break}
      W=f.contentWindow;
    }
    return W;
  }
  function get(W,name){
    try{return W.eval(`typeof ${name}!=='undefined'?${name}:undefined`)}catch(e){return W[name]}
  }
  function set(W,name,value){
    const cur=get(W,name),inc=clone(value);
    if(Array.isArray(cur)&&Array.isArray(inc)){
      cur.splice(0,cur.length,...inc);try{W[name]=cur}catch(e){};return cur;
    }
    if(isObj(cur)&&isObj(inc)){
      Object.keys(cur).forEach(k=>delete cur[k]);Object.assign(cur,inc);try{W[name]=cur}catch(e){};return cur;
    }
    W.__EAKHA_51056_TMP__=inc;
    try{W.eval(`${name}=window.__EAKHA_51056_TMP__`)}catch(e){try{W[name]=inc}catch(_){} }
    delete W.__EAKHA_51056_TMP__;
    return get(W,name)||inc;
  }
  function fn(W,name){
    try{return W.eval(`typeof ${name}==='function'?${name}:null`)||W[name]}catch(e){return W[name]}
  }
  function call(W,name,...args){
    try{const f=fn(W,name);if(typeof f==='function')return f(...args)}catch(e){console.warn('[51056]',name,e)}
  }
  function currentMonth(W){
    const n=Number(get(W,'ACTIVE_MONTH'));
    if(n>=1&&n<=12)return n;
    const t=W.document?.body?.innerText||'';
    if(/Bulan audit:\s*April\s*2026/i.test(t))return 4;
    if(/Bulan audit:\s*Mei\s*2026/i.test(t))return 5;
    return 0;
  }
  function currentYear(W){
    const n=Number(get(W,'ACTIVE_YEAR'));
    return n>=2020?n:2026;
  }
  function daysInMonth(W){
    try{const n=Number(fn(W,'daysInActiveMonth')?.());if(n>=28&&n<=31)return n}catch(e){}
    return new Date(currentYear(W),currentMonth(W),0).getDate()||31;
  }
  function shiftOf(W,bil,day){
    try{return String(fn(W,'gSh')?.(Number(bil),Number(day))||'').toUpperCase()}catch(e){return ''}
  }
  function isOffShift(sh){return OFF_CODES.has(upper(sh))}
  function toMin(t){
    const m=String(t||'').match(/^(\d{1,2}):(\d{2})$/);
    return m?(+m[1])*60+(+m[2]):null;
  }
  function normalizeTime(t){
    const m=String(t||'').match(/(\d{1,2}):(\d{2})/);
    return m?`${pad(+m[1])}:${m[2]}`:'';
  }
  function uniqTimes(values){
    return [...new Set((values||[]).map(normalizeTime).filter(Boolean))].sort((a,b)=>toMin(a)-toMin(b));
  }
  function dateKey(W,day){return `${currentYear(W)}-${pad(currentMonth(W))}-${pad(day)}`}
  function parseDate(value){
    const s=String(value||'').trim();
    let m=s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if(m)return `${m[1]}-${pad(+m[2])}-${pad(+m[3])}`;
    m=s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if(m)return `${m[3]}-${pad(+m[2])}-${pad(+m[1])}`;
    return '';
  }
  function nameKey(v){
    return upper(v)
      .replace(/LATIFAH/g,'LATIFA')
      .replace(/MOHAMMAD|MUHAMMAD|MOHAMED/g,'MOHAMAD')
      .replace(/\bBIN\b|\bBINTI\b|\bAL\b/g,' ')
      .replace(/[^A-Z0-9]+/g,' ')
      .replace(/\s+/g,' ')
      .trim();
  }
  function member(W,bil){return (get(W,'MASTER')||[]).find(m=>String(m.bil)===String(bil))||null}
  function sameOwner(row,m){
    if(!row||!m)return false;
    const rb=row.bil??row.owner_bil??row.staff_bil??row.id_anggota;
    if(rb!==undefined&&rb!==null&&String(rb)===String(m.bil))return true;
    const rn=row.nama??row.name??row.nama_anggota??row.owner_name;
    return rn&&nameKey(rn)===nameKey(m.nama);
  }

  function normalizeKZ(raw){
    const s=upper(raw);
    if(!s||s==='-'||s==='TIADA MAKLUMAN'||s==='T/M'||s==='TM')return 'TM';
    if(/[✓✔]/.test(s)||s==='HADIR'||s==='MASUK')return 'HADIR';
    if(/OFFDAY|OFF DAY|REHAT|^OF$|^OFF$/.test(s))return 'OF';
    if(/TIDAK HADIR TUGAS|^TH$/.test(s))return 'TH';
    if(/TAHAN TUGAS|^TT$/.test(s))return 'TT';
    if(/MC|SAKIT/.test(s))return 'MC';
    if(/CUTI KECEMASAN|^EL$/.test(s))return 'EL';
    if(/CUTI TANPA REKOD|^CTR$/.test(s))return 'CTR';
    if(/BERSALIN|^CB$|^BER$/.test(s))return 'CB';
    if(/PELEPASAN/.test(s))return 'PELEPASAN';
    if(/CUTI REHAT|^CR$/.test(s))return 'CR';
    if(/^KP$|^K\/P$/.test(s))return 'KP';
    if(/^L$|LEWAT/.test(s))return 'L';
    if(/^LL$/.test(s))return 'LL';
    return s;
  }
  function isLeave(v){return LEAVE_CODES.has(normalizeKZ(v))}
  function isSpecial(v){return SPECIAL_CODES.has(normalizeKZ(v))}
  function isAttend(v){return normalizeKZ(v)==='HADIR'}

  function validMCRecord(r){
    if(!r||typeof r!=='object')return false;
    const clinic=String(r.klinik??r.clinic??r.nama_klinik??'').trim();
    const ref=String(r.no_mc??r.no_rujukan??r.siri??r.reference??r.ref??'').trim();
    return !!clinic&&!!ref&&!/TIADA|MOHON HANTAR/i.test(`${clinic} ${ref}`);
  }
  function rowDateMatch(r,key){
    const start=parseDate(r.dari??r.start??r.tarikh??r.date??r.tanggal??'');
    const end=parseDate(r.hingga??r.end??r.tarikh_akhir??r.date_to??r.tarikh??r.date??'')||start;
    return !!start&&key>=start&&key<=end;
  }
  function mcRecord(W,bil,day){
    const m=member(W,bil),key=dateKey(W,day);
    const original=W.__EAKHA_51056_ORIG_GETMC__;
    if(typeof original==='function'){
      try{const r=original(Number(bil),Number(day));if(validMCRecord(r))return r}catch(e){}
    }
    const D=get(W,'D')||{},c=D?.[String(bil)]?.[day]||{};
    if(validMCRecord(c._mc))return c._mc;
    const rows=[...(get(W,'MC_DATA')||[]),...(get(W,'MC_PRELOAD')||[])];
    return rows.find(r=>sameOwner(r,m)&&rowDateMatch(r,key)&&validMCRecord(r))||null;
  }
  function validHRRecord(r){
    if(!r||typeof r!=='object')return false;
    const s=upper([r.jenis,r.status,r.cuti,r.hrmis,r.catatan].join(' '));
    return !!parseDate(r.dari??r.start??r.tarikh??r.date??'')&&!/TIADA PERMOHONAN|DITOLAK|BATAL/.test(s);
  }
  function hrType(value){
    const s=upper(typeof value==='string'?value:JSON.stringify(value||{}));
    if(/CUTI KECEMASAN|\bEL\b/.test(s))return 'EL SAH';
    if(/CUTI TANPA REKOD|\bCTR\b/.test(s))return 'CTR SAH';
    if(/BERSALIN|\bCB\b|\bBER\b/.test(s))return 'CB SAH';
    if(/PELEPASAN/.test(s))return 'PELEPASAN SAH';
    if(/CUTI REHAT|\bCR\b/.test(s))return 'CR SAH';
    return 'CR SAH';
  }
  function hrRecord(W,bil,day){
    const m=member(W,bil),key=dateKey(W,day),D=get(W,'D')||{},c=D?.[String(bil)]?.[day]||{};
    if(isObj(c._hrmis_rec)&&validHRRecord(c._hrmis_rec))return c._hrmis_rec;
    if(c.hrmis&&!/TIADA PERMOHONAN/i.test(String(c.hrmis)))return {tarikh:key,dari:key,hingga:key,status:c.hrmis,jenis:c.hrmis};
    const rows=[...(get(W,'HRMIS_DATA')||[]),...(get(W,'HRMIS_PRELOAD')||[]),...(get(W,'CUTI_HRMIS_PRELOAD')||[])];
    return rows.find(r=>sameOwner(r,m)&&rowDateMatch(r,key)&&validHRRecord(r))||null;
  }

  const SHIFT_RULES={
    S:{label:'PG',start:420,early:360,late:427,end:900,endMax:960},
    PG:{label:'PG',start:420,early:360,late:427,end:900,endMax:960},
    P:{label:'PT',start:900,early:840,late:907,end:1380,endMax:1440},
    PT:{label:'PT',start:900,early:840,late:907,end:1380,endMax:1440},
    M:{label:'M',start:1380,early:1320,late:1387,end:420,endMax:480}
  };
  function timecardAudit(W,bil,day){
    const D=get(W,'D')||{},c=D?.[String(bil)]?.[day]||{},sh=shiftOf(W,bil,day);
    if(isOffShift(sh)){
      const raw=uniqTimes([...(Array.isArray(c.tc_all)?c.tc_all:[]),c.tc_in,c.tc_out]);
      return {txt:raw.length||c.ot?'OFFDAY / OT ABAIKAN':'OFFDAY',cls:'tc-off',inc:false,code:'OFF'};
    }
    const rule=SHIFT_RULES[sh];
    if(!rule)return {txt:'SEMAK SHIFT',cls:'tc-l',inc:true,code:'SHIFT'};

    const raw=uniqTimes([...(Array.isArray(c.tc_all)?c.tc_all:[]),c.tc_in,c.tc_out]);
    let inT=normalizeTime(c.tc_in),outT=normalizeTime(c.tc_out);
    if(!inT){
      const cand=raw.filter(t=>{const x=toMin(t);return x>=rule.early&&x<=Math.min(rule.start+240,1439)});
      inT=cand[0]||'';
    }
    if(!outT){
      let cand=[];
      if(rule.label==='PG')cand=raw.filter(t=>{const x=toMin(t);return x>=rule.end&&x<=rule.endMax});
      if(rule.label==='PT')cand=raw.filter(t=>{const x=toMin(t);return x>=rule.end&&x<=1439});
      if(rule.label==='M'){
        const next=D?.[String(bil)]?.[day+1]||{};
        const nextRaw=uniqTimes([...(Array.isArray(next.tc_all)?next.tc_all:[]),next.tc_in,next.tc_out]);
        cand=nextRaw.filter(t=>{const x=toMin(t);return x>=rule.end&&x<=rule.endMax});
      }
      outT=cand[0]||'';
    }

    if(!inT&&!outT){
      return raw.length
        ?{txt:'SEMAK TC - PUNCH LUAR TINGKAP',cls:'tc-l',inc:true,code:'OUTSIDE',raw}
        :{txt:'ABS - TIADA IN DAN OUT',cls:'tc-abs',inc:true,code:'ABS'};
    }
    if(!inT)return {txt:'SEMAK TC - TIADA IN',cls:'tc-abs',inc:true,code:'NO_IN',out:outT};
    if(!outT)return {txt:'SEMAK TC - TIADA OUT',cls:'tc-l',inc:true,code:'NO_OUT',in:inT};

    const i=toMin(inT),o0=toMin(outT),o=rule.label==='PT'&&o0<360?o0+1440:o0;
    if(i<rule.early)return {txt:'SEMAK TC - IN AWAL LUAR TINGKAP',cls:'tc-l',inc:true,code:'EARLY_OUTSIDE',in:inT,out:outT};
    const issues=[];
    if(i>rule.late)issues.push('LEWAT');
    if(o<rule.end)issues.push('OUT AWAL');
    if(o>rule.endMax)issues.push('OUT LUAR TINGKAP');
    if(issues.length)return {txt:`${issues.join(' + ')} (TC SAHKAN)`,cls:'tc-l',inc:true,code:issues.join('_'),in:inT,out:outT};
    return {txt:'SAH',cls:'tc-ok',inc:false,code:'SAH',in:inT,out:outT};
  }

  function auditRule(W,bil,day){
    const D=get(W,'D')||{},c=D?.[String(bil)]?.[day]||{},sh=shiftOf(W,bil,day);
    if(isOffShift(sh))return {txt:'OFF',cls:'af-off',inc:false,reason:'OFFDAY'};

    const kzp=normalizeKZ(c.kzp),kzk=normalizeKZ(c.kzk);
    if(kzp==='TH'||kzk==='TH')return {txt:'TH - TIDAK HADIR TUGAS',cls:'af-th',inc:false,reason:'TH'};
    if(kzp==='TT'||kzk==='TT')return {txt:'TT - TAHAN TUGAS',cls:'af-tt',inc:false,reason:'TT'};

    const mc=mcRecord(W,bil,day);
    if(mc){
      const clinic=String(mc.klinik??mc.clinic??mc.nama_klinik??'').trim();
      const ref=String(mc.no_mc??mc.no_rujukan??mc.siri??mc.reference??mc.ref??'').trim();
      return {txt:`MC SAH\n${clinic}\n${ref}`,cls:'af-mc',inc:false,reason:'MC_DOC'};
    }
    if(kzp==='MC'||kzk==='MC')return {txt:'MC TIDAK SAH\nMOHON HANTAR MC',cls:'af-abs',inc:true,reason:'MC_NO_DOC'};

    const hr=hrRecord(W,bil,day);
    if(hr)return {txt:hrType(hr),cls:'af-cr',inc:false,reason:'HRMIS'};
    if(isLeave(kzp)||isLeave(kzk))return {txt:'SILA MOHON HRMIS',cls:'af-warn',inc:true,reason:'LEAVE_NO_HRMIS'};

    const conflict=(isAttend(kzp)&&(kzk==='MC'||isLeave(kzk)||isSpecial(kzk)))||(isAttend(kzk)&&(kzp==='MC'||isLeave(kzp)||isSpecial(kzp)));
    if(conflict)return {txt:'SEMAK KZ - STATUS BERCANGGAH',cls:'af-warn',inc:true,reason:'KZ_CONFLICT'};

    const tc=timecardAudit(W,bil,day);
    if(tc.code==='ABS')return {txt:'ABS - SILA MOHON CUTI',cls:'af-abs',inc:true,reason:'ABS'};
    if(tc.code!=='SAH')return {txt:tc.txt,cls:'af-warn',inc:true,reason:tc.code};

    if(kzp==='TM'&&kzk==='TM')return {txt:'SEMAK KZ - TIADA MAKLUMAN',cls:'af-inc',inc:true,reason:'NO_KZ'};
    if(isAttend(kzp)||isAttend(kzk))return {txt:'SAH',cls:'af-sah',inc:false,reason:'PRESENT'};
    return {txt:'SEMAK KZ',cls:'af-inc',inc:true,reason:'KZ_UNKNOWN'};
  }

  function normalizeCell(W,bil,day,mutate=true){
    const D=get(W,'D')||{};
    if(!D[String(bil)])D[String(bil)]={};
    if(!D[String(bil)][day])D[String(bil)][day]={};
    const c=D[String(bil)][day],sh=shiftOf(W,bil,day);
    const off=isOffShift(sh);

    if(mutate){
      if(off){
        if(c.kzp&&!OFF_CODES.has(normalizeKZ(c.kzp)))c.offday_ignored_kzp=c.kzp;
        if(c.kzk&&!OFF_CODES.has(normalizeKZ(c.kzk)))c.offday_ignored_kzk=c.kzk;
        c.kzp='OF';c.kzk='OF';delete c.kzp_jam;delete c.kzk_jam;
        const raw=uniqTimes([...(Array.isArray(c.tc_all)?c.tc_all:[]),c.tc_in,c.tc_out]);
        c.tc_offday_raw_punches=raw;
        c.offday_ot_ignored=!!(c.ot||raw.length);
        c.ot_ignored=!!(c.ot||raw.length);
        c.no_perhatian=true;c.audit_ignore_attention=true;
        c.attention_suppressed_reason='OFFDAY: OT/punch diabaikan dan tidak dikira hadir';
      }else{
        c.kzp=normalizeKZ(c.kzp);
        c.kzk=normalizeKZ(c.kzk);
      }
      const hr=hrRecord(W,bil,day);
      if(hr)c.hrmis=hrType(hr);
      else if(isLeave(c.kzp)||isLeave(c.kzk))c.hrmis='TIADA PERMOHONAN';
      else if(/TIADA PERMOHONAN/i.test(String(c.hrmis||'')))delete c.hrmis;

      const tc=timecardAudit(W,bil,day);
      c.tc_audit_done=true;c.tc_audit_status=tc.txt;c.tc_issue=tc.txt;
      if(tc.in)c.tc_in=tc.in;if(tc.out)c.tc_out=tc.out;
      const af=auditRule(W,bil,day);
      c.audit_final=af.txt;c.final_audit=af.txt;c.audit_status=af.txt;c.audit_class=af.cls;c.audit_incomplete=!!af.inc;c.audit_reason=af.reason;c.rule_engine_version=VERSION;
    }
    return c;
  }

  function removeButtons(W){
    let n=0;
    W.document?.querySelectorAll('button,a,[role="button"]').forEach(el=>{
      const t=upper(el.textContent);
      if(BUTTON_TEXTS.some(x=>t===x||t.includes(x))){el.remove();n++}
    });
    return n;
  }
  function fixUI(W){
    removeButtons(W);
    const MASTER=get(W,'MASTER')||[],count=MASTER.length||53;
    const walker=W.document.createTreeWalker(W.document.body,W.NodeFilter.SHOW_TEXT);
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(n=>{
      const old=n.nodeValue||'';
      let next=old
        .replace(/Master File\s*\(52\s*Anggota\)/gi,`Master File (${count} Anggota)`)
        .replace(/Master File\s*\(52\)/gi,`Master File (${count})`)
        .replace(/Semua\s+52\b/gi,`Semua ${count}`)
        .replace(/\b52\s+anggota\b/gi,`${count} anggota`)
        .replace(/Audit sah hanya jika semua 6 data ada\.?/gi,'Audit Final mengikut rule KZ, Timecard, MC, HRMIS, OFFDAY dan status khas.');
      if(next!==old)n.nodeValue=next;
    });
  }

  function installWrappers(W){
    if(W.__EAKHA_51056_RULES__)return;
    W.__EAKHA_51056_RULES__=true;
    W.__EAKHA_51056_ORIG_AUDIT__=fn(W,'auditFinal');
    W.__EAKHA_51056_ORIG_TC__=fn(W,'tcAudit');
    W.__EAKHA_51056_ORIG_GETMC__=fn(W,'getMC');
    W.__EAKHA_51056_ORIG_LAYERS__=fn(W,'checkLayersComplete');
    W.__EAKHA_51056_ORIG_RENDER__=fn(W,'renderMaster');

    W.__EAKHA_51056_AUDIT__=(bil,day)=>auditRule(W,bil,day);
    W.__EAKHA_51056_TC__=(bil,day)=>timecardAudit(W,bil,day);
    W.__EAKHA_51056_GETMC__=(bil,day)=>mcRecord(W,bil,day);
    W.__EAKHA_51056_LAYERS__=(bil,day)=>({complete:true,missing:[],offday:isOffShift(shiftOf(W,bil,day)),special:false,dynamic:true});
    W.__EAKHA_51056_RENDER__=(...args)=>{
      if(currentMonth(W)===4)normalizeAll(W,true);
      const r=typeof W.__EAKHA_51056_ORIG_RENDER__==='function'?W.__EAKHA_51056_ORIG_RENDER__(...args):undefined;
      setTimeout(()=>fixUI(W),0);
      return r;
    };
    try{W.eval('auditFinal=window.__EAKHA_51056_AUDIT__')}catch(e){W.auditFinal=W.__EAKHA_51056_AUDIT__}
    try{W.eval('tcAudit=window.__EAKHA_51056_TC__')}catch(e){W.tcAudit=W.__EAKHA_51056_TC__}
    try{W.eval('getMC=window.__EAKHA_51056_GETMC__')}catch(e){W.getMC=W.__EAKHA_51056_GETMC__}
    try{W.eval('checkLayersComplete=window.__EAKHA_51056_LAYERS__')}catch(e){W.checkLayersComplete=W.__EAKHA_51056_LAYERS__}
    try{W.eval('renderMaster=window.__EAKHA_51056_RENDER__')}catch(e){W.renderMaster=W.__EAKHA_51056_RENDER__}
  }

  function normalizeAll(W,mutate){
    const MASTER=get(W,'MASTER')||[],D=get(W,'D');
    if(!Array.isArray(MASTER)||!D)return {cells:0};
    let cells=0,offday=0,mc=0,hrmis=0,abs=0,late=0,sah=0,semak=0;
    for(const m of MASTER){
      for(let d=1;d<=daysInMonth(W);d++){
        normalizeCell(W,m.bil,d,mutate);cells++;
        const a=auditRule(W,m.bil,d),t=upper(a.txt);
        if(t==='OFF')offday++;else if(t.startsWith('MC SAH'))mc++;else if(/ SAH$/.test(t)&&/CR|EL|CTR|CB|PELEPASAN/.test(t))hrmis++;else if(t.startsWith('ABS'))abs++;else if(t.includes('LEWAT'))late++;else if(t==='SAH')sah++;else if(t.includes('SEMAK')||a.inc)semak++;
      }
    }
    set(W,'D',D);
    return {cells,offday,mc,hrmis,abs,late,sah,semak};
  }

  async function saveApril(W,report){
    if(currentMonth(W)!==4)return null;
    const pointer=localStorage.getItem('eakha_locked_snapshot_2026_04')||'';
    if(/GLOBAL_RULES_LOCKED/.test(pointer))return pointer;
    const MASTER=get(W,'MASTER'),D=get(W,'D');
    if(!Array.isArray(MASTER)||!D)return null;
    const db=await new Promise((ok,no)=>{const r=indexedDB.open('eakha_vsavage_safe_store');r.onerror=()=>no(r.error);r.onsuccess=()=>ok(r.result)});
    const id=`safe_snapshot_2026_04_GLOBAL_RULES_LOCKED_${Date.now()}`;
    const s={id,type:'EAKHA_LOCKED_MONTH_DATABASE',tahun:2026,bulan:4,savedAt:new Date().toISOString(),lockedAt:new Date().toISOString(),locked:true,immutable:true,reason:'April 2026 consolidated rule engine v5.10.56. Mei data not rewritten.',MASTER:clone(MASTER),D:clone(D),reports:{globalRuleEngine51056:report}};
    ['KZP_PRELOAD','KZK_PRELOAD','TIMECARD_PRELOAD','MC_PRELOAD','MC_DATA','MC_REF','HRMIS_PRELOAD','HRMIS_DATA','HRMIS_REF','CUTI_HRMIS_PRELOAD','CUTI_HRMIS_REF'].forEach(k=>s[k]=clone(get(W,k)||[]));
    await new Promise((ok,no)=>{const tx=db.transaction('snapshots','readwrite');tx.objectStore('snapshots').put(s);tx.oncomplete=()=>ok();tx.onerror=()=>no(tx.error)});
    db.close();
    try{
      localStorage.setItem('eakha_locked_snapshot_2026_04',id);
      localStorage.setItem('eakha_active_snapshot_2026_04',id);
      localStorage.setItem('eakha_last_good_snapshot',id);
      localStorage.setItem('eakha_active_month','4');
      localStorage.setItem('eakha_rule_engine_version',VERSION);
    }catch(e){console.warn('[51056] pointer',e)}
    return id;
  }

  async function boot(){
    const W=deepWindow();
    const MASTER=get(W,'MASTER'),D=get(W,'D');
    if(!Array.isArray(MASTER)||!D||typeof fn(W,'gSh')!=='function'||typeof fn(W,'renderMaster')!=='function')return false;
    installWrappers(W);
    const mutate=currentMonth(W)===4;
    const report=normalizeAll(W,mutate);
    call(W,'renderMaster',null);call(W,'renderDash');call(W,'renderOutput','');call(W,'updFlags');
    fixUI(W);
    const snapshot=mutate?await saveApril(W,report):null;

    if(!W.__EAKHA_51056_OBSERVER__){
      W.__EAKHA_51056_OBSERVER__=new W.MutationObserver(()=>fixUI(W));
      W.__EAKHA_51056_OBSERVER__.observe(W.document.documentElement,{childList:true,subtree:true});
    }
    W.document.addEventListener('click',()=>setTimeout(()=>{fixUI(W);if(currentMonth(W)===4)normalizeAll(W,true)},250),true);
    window.EAKHA_51056_REPORT={version:VERSION,month:currentMonth(W),snapshot,...report};
    console.log('[e-AKHA v5.10.56]',window.EAKHA_51056_REPORT);
    if(snapshot){
      alert(`Semua rule & logic Audit Final siap.\nMaster: ${MASTER.length}\nSel dinilai: ${report.cells}\nOFFDAY: ${report.offday}\nMC sah: ${report.mc}\nHRMIS sah: ${report.hrmis}\nABS: ${report.abs}\nLEWAT: ${report.late}\nSAH: ${report.sah}\nSEMAK: ${report.semak}\n\nSnapshot:\n${snapshot}\n\nMei tidak ditulis semula.`);
    }
    return true;
  }

  let tries=0;
  const timer=setInterval(()=>{
    tries++;
    boot().then(ok=>{if(ok)clearInterval(timer)}).catch(e=>console.error('[51056]',e));
    if(tries>120)clearInterval(timer);
  },500);
})();