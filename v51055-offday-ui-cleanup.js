/* e-AKHA v5.10.55 — remove obsolete buttons + OFFDAY/OT ignore rule */
(()=>{
  'use strict';
  if(window.__EAKHA_51055_BOOT__)return;
  window.__EAKHA_51055_BOOT__=true;

  const clone=v=>JSON.parse(JSON.stringify(v??null));
  const upper=v=>String(v??'').toUpperCase().replace(/\s+/g,' ').trim();
  const isObj=v=>v&&typeof v==='object'&&!Array.isArray(v);
  const targetWindow=()=>document.querySelector('iframe#app,iframe')?.contentWindow||window;

  function get(W,name){try{return W.eval(`typeof ${name}!=='undefined'?${name}:undefined`)}catch(e){return W[name]}}
  function set(W,name,val){
    const cur=get(W,name),inc=clone(val);
    if(Array.isArray(cur)&&Array.isArray(inc)){cur.splice(0,cur.length,...inc);try{W[name]=cur}catch(e){};return cur}
    if(isObj(cur)&&isObj(inc)){Object.keys(cur).forEach(k=>delete cur[k]);Object.assign(cur,inc);try{W[name]=cur}catch(e){};return cur}
    W.__TMP_51055__=inc;
    try{W.eval(`${name}=window.__TMP_51055__`)}catch(e){try{W[name]=inc}catch(_){} }
    delete W.__TMP_51055__;
    return get(W,name)||inc;
  }
  function fn(W,name){try{return W.eval(`typeof ${name}==='function'?${name}:null`)||W[name]}catch(e){return W[name]}}
  function call(W,name,...args){try{const f=fn(W,name);if(typeof f==='function')return f(...args)}catch(e){console.warn('[51055]',name,e)}}
  function currentMonth(W){
    const text=W.document?.body?.innerText||'';
    if(/Bulan audit:\s*April\s*2026/i.test(text))return 4;
    if(/Bulan audit:\s*Mei\s*2026/i.test(text))return 5;
    const n=Number(get(W,'ACTIVE_MONTH'));
    return n>=1&&n<=12?n:0;
  }
  function toMin(t){const m=String(t||'').match(/^(\d{1,2}):(\d{2})$/);return m?(+m[1])*60+(+m[2]):null}
  function times(c){return [...new Set([...(Array.isArray(c.tc_all)?c.tc_all:[]),c.tc_in,c.tc_out].filter(Boolean).map(String).filter(x=>/^\d{1,2}:\d{2}$/.test(x)))].sort((a,b)=>toMin(a)-toMin(b))}

  const BUTTON_TEXTS=[
    'UPLOAD EXCEL GABUNGAN KZ',
    'KEMASKINI KZP + KZK KE MASTER',
    'KEMAS KINI KZP + KZK KE MASTER',
    'FORCE 1 IRWAN 51034'
  ];
  function removeButtons(W){
    let n=0;
    W.document?.querySelectorAll('button,a,[role="button"]').forEach(el=>{
      const t=upper(el.textContent);
      if(BUTTON_TEXTS.some(x=>t===x||t.includes(x))){el.remove();n++}
    });
    return n;
  }

  function applyOffday(W){
    const MASTER=get(W,'MASTER'),D=get(W,'D'),gSh=fn(W,'gSh');
    if(!Array.isArray(MASTER)||!D||typeof gSh!=='function')return null;
    let fixed=0,ignored=0,linked=0;
    for(const m of MASTER){
      const bil=String(m.bil);
      if(!D[bil])D[bil]={};
      for(let d=1;d<=30;d++){
        let sh='';try{sh=String(gSh(Number(m.bil),d)||'').toUpperCase()}catch(e){}
        if(!['O','OF','OFF','OFFDAY'].includes(sh))continue;
        if(!D[bil][d])D[bil][d]={};
        const c=D[bil][d],raw=times(c);
        if(raw.length){ignored++;c.tc_offday_raw_punches=raw}
        if(c.kzp&&!/^(?:OF|OFF|OFFDAY)$/i.test(String(c.kzp)))c.offday_ignored_kzp=c.kzp;
        if(c.kzk&&!/^(?:OF|OFF|OFFDAY)$/i.test(String(c.kzk)))c.offday_ignored_kzk=c.kzk;
        c.kzp='OF';c.kzk='OF';delete c.kzp_jam;delete c.kzk_jam;
        c.tc_shift='O';c.offday_ot_ignored=!!(c.ot||raw.length);c.ot_ignored=!!(c.ot||raw.length);
        c.no_perhatian=true;c.audit_ignore_attention=true;
        c.attention_suppressed_reason='OFFDAY: OT/punch diabaikan dan tidak dikira hadir';

        let prev='';if(d>1)try{prev=String(gSh(Number(m.bil),d-1)||'').toUpperCase()}catch(e){}
        const out=prev==='M'?raw.find(t=>{const x=toMin(t);return x>=420&&x<=480}):'';
        if(out&&d>1){
          if(!D[bil][d-1])D[bil][d-1]={};
          D[bil][d-1].tc_out=out;
          D[bil][d-1].tc_offday_out_linked=true;
          D[bil][d-1].tc_offday_out_day=d;
          c.tc_offday_out_for_previous_night=out;
          linked++;
        }

        c.tc_audit_done=true;
        c.tc_audit_status=raw.length?'OFFDAY / OT ABAIKAN':'OFFDAY';
        c.tc_issue=raw.length?'OFFDAY: semua punch/OT diabaikan; tidak dikira hadir.':'OFFDAY';
        c.audit_final='OFF';c.final_audit='OFF';c.audit_status='OFF';c.audit_class='af-off';c.audit_incomplete=false;
        if(Array.isArray(c.flags))c.flags=c.flags.filter(f=>!/HADIR|OT|ABS|LEWAT|TIADA|SEMAK|OUT|IN/i.test(String(f)));
        c.offday_rule_51055=true;
        fixed++;
      }
    }
    set(W,'D',D);
    return {fixed,ignoredPunchDays:ignored,linkedNightOut:linked};
  }

  function installRules(W){
    if(W.__EAKHA_51055_RULES__)return;
    W.__EAKHA_51055_RULES__=true;
    const originalAudit=fn(W,'auditFinal');
    if(typeof originalAudit==='function'){
      W.__EAKHA_51055_ORIG_AUDIT__=originalAudit;
      W.__EAKHA_51055_AUDIT__=(bil,d)=>{
        const g=fn(W,'gSh');let sh='';try{sh=String(g?.(Number(bil),Number(d))||'').toUpperCase()}catch(e){}
        if(currentMonth(W)===4&&['O','OF','OFF','OFFDAY'].includes(sh))return {txt:'OFF',cls:'af-off',inc:false};
        return W.__EAKHA_51055_ORIG_AUDIT__(bil,d);
      };
      try{W.eval('auditFinal=window.__EAKHA_51055_AUDIT__')}catch(e){W.auditFinal=W.__EAKHA_51055_AUDIT__}
    }
    const originalTC=fn(W,'tcAudit');
    if(typeof originalTC==='function'){
      W.__EAKHA_51055_ORIG_TC__=originalTC;
      W.__EAKHA_51055_TC__=(bil,d)=>{
        const g=fn(W,'gSh');let sh='';try{sh=String(g?.(Number(bil),Number(d))||'').toUpperCase()}catch(e){}
        if(currentMonth(W)===4&&['O','OF','OFF','OFFDAY'].includes(sh)){
          const D=get(W,'D')||{},c=D?.[String(bil)]?.[d]||{};
          const has=!!(c.ot||c.tc_in||c.tc_out||(Array.isArray(c.tc_all)&&c.tc_all.length));
          return {txt:has?'OFFDAY / OT ABAIKAN':'OFFDAY',cls:'tc-off',inc:false};
        }
        return W.__EAKHA_51055_ORIG_TC__(bil,d);
      };
      try{W.eval('tcAudit=window.__EAKHA_51055_TC__')}catch(e){W.tcAudit=W.__EAKHA_51055_TC__}
    }
  }

  async function saveApril(W,report){
    const MASTER=get(W,'MASTER'),D=get(W,'D');
    if(currentMonth(W)!==4||!Array.isArray(MASTER)||!D)return null;
    const pointer=localStorage.getItem('eakha_locked_snapshot_2026_04')||'';
    if(/OFFDAY_RULE_LOCKED/.test(pointer))return pointer;
    const db=await new Promise((ok,no)=>{const r=indexedDB.open('eakha_vsavage_safe_store');r.onerror=()=>no(r.error);r.onsuccess=()=>ok(r.result)});
    const id=`safe_snapshot_2026_04_OFFDAY_RULE_LOCKED_${Date.now()}`;
    const s={id,type:'EAKHA_LOCKED_MONTH_DATABASE',tahun:2026,bulan:4,savedAt:new Date().toISOString(),lockedAt:new Date().toISOString(),locked:true,immutable:true,reason:'April 2026 OFFDAY/OT ignore rule locked. Mei untouched.',MASTER:clone(MASTER),D:clone(D),reports:{offdayRule51055:report}};
    ['KZP_PRELOAD','KZK_PRELOAD','TIMECARD_PRELOAD','MC_PRELOAD','MC_DATA','MC_REF','HRMIS_PRELOAD','HRMIS_DATA','HRMIS_REF','CUTI_HRMIS_PRELOAD','CUTI_HRMIS_REF'].forEach(k=>s[k]=clone(get(W,k)||[]));
    await new Promise((ok,no)=>{const tx=db.transaction('snapshots','readwrite');tx.objectStore('snapshots').put(s);tx.oncomplete=()=>ok();tx.onerror=()=>no(tx.error)});
    db.close();
    try{localStorage.setItem('eakha_locked_snapshot_2026_04',id);localStorage.setItem('eakha_active_snapshot_2026_04',id);localStorage.setItem('eakha_last_good_snapshot',id);localStorage.setItem('eakha_active_month','4')}catch(e){console.warn('[51055] pointer',e)}
    return id;
  }

  let tries=0;
  const timer=setInterval(async()=>{
    tries++;
    const W=targetWindow();
    removeButtons(W);
    const MASTER=get(W,'MASTER'),D=get(W,'D'),gSh=fn(W,'gSh');
    if(!Array.isArray(MASTER)||!D||typeof gSh!=='function'){
      if(tries>80)clearInterval(timer);
      return;
    }
    clearInterval(timer);
    installRules(W);
    const report=currentMonth(W)===4?applyOffday(W):{fixed:0,ignoredPunchDays:0,linkedNightOut:0,skipped:true};
    call(W,'renderMaster',null);call(W,'renderDash');call(W,'renderOutput','');call(W,'updFlags');
    removeButtons(W);
    const snapshot=await saveApril(W,report);

    if(!W.__EAKHA_51055_OBSERVER__){
      W.__EAKHA_51055_OBSERVER__=new W.MutationObserver(()=>removeButtons(W));
      W.__EAKHA_51055_OBSERVER__.observe(W.document.documentElement,{childList:true,subtree:true});
    }
    W.document.addEventListener('click',()=>setTimeout(()=>{removeButtons(W);if(currentMonth(W)===4)applyOffday(W)},250),true);

    window.EAKHA_V51055_REPORT={...report,snapshot,buttonsRemoved:true,month:currentMonth(W)};
    console.log('[e-AKHA v5.10.55]',window.EAKHA_V51055_REPORT);
    if(currentMonth(W)===4&&snapshot){
      alert(`Kemaskini siap.\n3 button dibuang.\nOFFDAY April dibetulkan: ${report.fixed}\nHari punch/OT diabaikan: ${report.ignoredPunchDays}\nOUT malam dipaut: ${report.linkedNightOut}\n\nSnapshot:\n${snapshot}\n\nMei tidak disentuh.`);
    }
  },500);
})();