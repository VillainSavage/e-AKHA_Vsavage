/* e-AKHA v5.10.55 — UI cleanup + OFFDAY/OT ignore rule (April lock only) */
(()=>{
  'use strict';
  if(window.__EAKHA_V51055_OFFDAY_UI__) return;
  window.__EAKHA_V51055_OFFDAY_UI__=true;

  const OUTER=window;
  const frame=()=>document.querySelector('iframe#app,iframe');
  const ctx=()=>frame()?.contentWindow||window;
  const clone=v=>JSON.parse(JSON.stringify(v??null));
  const upper=v=>String(v??'').toUpperCase().replace(/\s+/g,' ').trim();
  const isObj=v=>v&&typeof v==='object'&&!Array.isArray(v);

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
    W.__EAKHA_51055_TMP__=inc;
    try{W.eval(`${name}=window.__EAKHA_51055_TMP__`)}catch(e){try{W[name]=inc}catch(_){} }
    delete W.__EAKHA_51055_TMP__;
    return get(W,name)||inc;
  }
  function getFn(W,name){
    try{return W.eval(`typeof ${name}==='function'?${name}:null`)||W[name]}catch(e){return W[name]}
  }
  function call(W,name,...args){
    try{const f=getFn(W,name);if(typeof f==='function')return f(...args)}catch(e){console.warn('[51055]',name,e)}
  }
  function activeMonth(W){
    const body=W.document?.body?.innerText||'';
    if(/Bulan audit:\s*April\s*2026/i.test(body)) return 4;
    if(/Bulan audit:\s*Mei\s*2026/i.test(body)) return 5;
    const n=Number(get(W,'ACTIVE_MONTH'));
    return n>=1&&n<=12?n:0;
  }
  function daysInMonth(W){
    const f=getFn(W,'daysInActiveMonth');
    try{const n=Number(f?.());if(n>=28&&n<=31)return n}catch(e){}
    return activeMonth(W)===4?30:31;
  }
  function shiftOf(W,bil,day){
    const f=getFn(W,'gSh');
    try{if(typeof f==='function')return String(f(Number(bil),Number(day))||'').toUpperCase()}catch(e){}
    return '';
  }
  function toMin(t){
    const m=String(t||'').match(/^(\d{1,2}):(\d{2})$/);
    return m?(+m[1])*60+(+m[2]):null;
  }
  function uniqueTimes(values){
    return [...new Set((values||[]).map(v=>String(v||'').trim()).filter(v=>/^\d{1,2}:\d{2}$/.test(v)))].sort((a,b)=>toMin(a)-toMin(b));
  }

  const removeTexts=[
    'UPLOAD EXCEL GABUNGAN KZ',
    'KEMASKINI KZP + KZK KE MASTER',
    'KEMAS KINI KZP + KZK KE MASTER',
    'FORCE 1 IRWAN 51034'
  ];
  function removeButtons(W){
    const doc=W.document;
    if(!doc) return 0;
    let removed=0;
    doc.querySelectorAll('button,a,[role="button"]').forEach(el=>{
      const text=upper(el.textContent);
      if(removeTexts.some(x=>text===x||text.includes(x))){
        el.remove();removed++;
      }
    });
    return removed;
  }

  function cleanOffdayApril(W){
    if(activeMonth(W)!==4) return {skipped:true,reason:'Bukan April'};
    const MASTER=get(W,'MASTER'),D=get(W,'D');
    if(!Array.isArray(MASTER)||!D) return {skipped:true,reason:'MASTER/D tiada'};

    let fixed=0,ignoredPunchDays=0,linkedNightOut=0;
    for(const m of MASTER){
      const bil=String(m.bil);
      if(!D[bil])D[bil]={};
      for(let day=1;day<=daysInMonth(W);day++){
        const sh=shiftOf(W,m.bil,day);
        if(!['O','OF','OFF','OFFDAY'].includes(sh)) continue;
        if(!D[bil][day])D[bil][day]={};
        const c=D[bil][day];

        const rawTimes=uniqueTimes([...(Array.isArray(c.tc_all)?c.tc_all:[]),c.tc_in,c.tc_out].filter(Boolean));
        if(rawTimes.length){
          ignoredPunchDays++;
          c.tc_offday_raw_punches=rawTimes;
        }

        if(c.kzp&&!/^(?:OF|OFF|OFFDAY)$/i.test(String(c.kzp))) c.offday_ignored_kzp=c.kzp;
        if(c.kzk&&!/^(?:OF|OFF|OFFDAY)$/i.test(String(c.kzk))) c.offday_ignored_kzk=c.kzk;
        if(c.kzp_jam)c.offday_ignored_kzp_jam=c.kzp_jam;
        if(c.kzk_jam)c.offday_ignored_kzk_jam=c.kzk_jam;

        c.kzp='OF';
        c.kzk='OF';
        delete c.kzp_jam;
        delete c.kzk_jam;
        c.tc_shift='O';
        c.offday_ot_ignored=!!(c.ot||rawTimes.length);
        c.ot_ignored=!!(c.ot||rawTimes.length);
        c.no_perhatian=true;
        c.audit_ignore_attention=true;
        c.attention_suppressed_reason='OFFDAY: OT/punch diabaikan dan tidak dikira hadir';

        const prevShift=day>1?shiftOf(W,m.bil,day-1):'';
        const validOut=prevShift==='M'?rawTimes.find(t=>{const x=toMin(t);return x>=420&&x<=480}):'';
        if(validOut&&day>1){
          if(!D[bil][day-1])D[bil][day-1]={};
          const p=D[bil][day-1];
          p.tc_out=validOut;
          p.tc_offday_out_linked=true;
          p.tc_offday_out_day=day;
          p.tc_issue=`OUT hakiki shift malam direkod pada OFFDAY: ${validOut}`;
          linkedNightOut++;
          c.tc_offday_out_for_previous_night=validOut;
        }

        c.tc_audit_done=true;
        c.tc_audit_status=rawTimes.length?'OFFDAY / OT ABAIKAN':'OFFDAY';
        c.tc_issue=rawTimes.length?'OFFDAY: semua punch/OT diabaikan; tidak dikira hadir.':'OFFDAY';
        c.audit_final='OFF';
        c.final_audit='OFF';
        c.audit_status='OFF';
        c.audit_class='af-off';
        c.audit_incomplete=false;
        if(Array.isArray(c.flags))c.flags=c.flags.filter(f=>!/HADIR|OT|ABS|LEWAT|TIADA|SEMAK|OUT|IN/i.test(String(f)));
        fixed++;
      }
    }
    set(W,'D',D);
    return {skipped:false,fixed,ignoredPunchDays,linkedNightOut};
  }

  function installFunctionRules(W){
    if(W.__EAKHA_51055_FUNCTION_RULES__)return;
    W.__EAKHA_51055_FUNCTION_RULES__=true;

    const originalAudit=getFn(W,'auditFinal');
    if(typeof originalAudit==='function'){
      W.__EAKHA_51055_ORIGINAL_AUDIT__=originalAudit;
      W.__EAKHA_51055_AUDIT__=function(bil,day){
        if(activeMonth(W)===4&&['O','OF','OFF','OFFDAY'].includes(shiftOf(W,bil,day)))return {txt:'OFF',cls:'af-off',inc:false};
        return W.__EAKHA_51055_ORIGINAL_AUDIT__(bil,day);
      };
      try{W.eval('auditFinal=window.__EAKHA_51055_AUDIT__')}catch(e){W.auditFinal=W.__EAKHA_51055_AUDIT__}
    }

    const originalTC=getFn(W,'tcAudit');
    if(typeof originalTC==='function'){
      W.__EAKHA_51055_ORIGINAL_TC__=originalTC;
      W.__EAKHA_51055_TC__=function(bil,day){
        if(activeMonth(W)===4&&['O','OF','OFF','OFFDAY'].includes(shiftOf(W,bil,day))){
          const D=get(W,'D')||{},c=D?.[String(bil)]?.[day]||D?.[bil]?.[day]||{};
          const hasPunch=!!(c.ot||c.tc_in||c.tc_out||(Array.isArray(c.tc_all)&&c.tc_all.length));
          return {txt:hasPunch?'OFFDAY / OT ABAIKAN':'OFFDAY',cls:'tc-off',inc:false};
        }
        return W.__EAKHA_51055_ORIGINAL_TC__(bil,day);
      };
      try{W.eval('tcAudit=window.__EAKHA_51055_TC__')}catch(e){W.tcAudit=W.__EAKHA_51055_TC__}
    }

    const originalRender=getFn(W,'renderMaster');
    if(typeof originalRender==='function'){
      W.__EAKHA_51055_ORIGINAL_RENDER__=originalRender;
      W.__EAKHA_51055_RENDER__=function(...args){
        cleanOffdayApril(W);
        const result=W.__EAKHA_51055_ORIGINAL_RENDER__(...args);
        setTimeout(()=>removeButtons(W),0);
        return result;
      };
      try{W.eval('renderMaster=window.__EAKHA_51055_RENDER__')}catch(e){W.renderMaster=W.__EAKHA_51055_RENDER__}
    }
  }

  async function saveAprilLock(W,report){
    if(activeMonth(W)!==4||report?.skipped)return null;
    const MASTER=get(W,'MASTER'),D=get(W,'D');
    if(!Array.isArray(MASTER)||!D)return null;
    const DB='eakha_vsavage_safe_store',STORE='snapshots';
    const db=await new Promise((ok,no)=>{const r=indexedDB.open(DB);r.onerror=()=>no(r.error);r.onsuccess=()=>ok(r.result)});
    const id=`safe_snapshot_2026_04_OFFDAY_RULE_LOCKED_${Date.now()}`;
    const snapshot={
      id,type:'EAKHA_LOCKED_MONTH_DATABASE',tahun:2026,bulan:4,
      savedAt:new Date().toISOString(),lockedAt:new Date().toISOString(),locked:true,immutable:true,
      reason:'April 2026 OFFDAY/OT ignore rule locked. Obsolete buttons removed by v5.10.55. Mei untouched.',
      MASTER:clone(MASTER),D:clone(D),reports:{offdayRule51055:report}
    };
    ['KZP_PRELOAD','KZK_PRELOAD','TIMECARD_PRELOAD','MC_PRELOAD','MC_DATA','MC_REF','HRMIS_PRELOAD','HRMIS_DATA','HRMIS_REF','CUTI_HRMIS_PRELOAD','CUTI_HRMIS_REF'].forEach(name=>snapshot[name]=clone(get(W,name)||[]));
    await new Promise((ok,no)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(snapshot);tx.oncomplete=()=>ok();tx.onerror=()=>no(tx.error)});
    await new Promise((ok,no)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put({id:'LOCK_POINTER_2026_04_OFFDAY_RULE',type:'MONTH_LOCK_POINTER',tahun:2026,bulan:4,targetSnapshotId:id,savedAt:new Date().toISOString()});tx.oncomplete=()=>ok();tx.onerror=()=>no(tx.error)});
    db.close();
    try{
      localStorage.setItem('eakha_locked_snapshot_2026_04',id);
      localStorage.setItem('eakha_active_snapshot_2026_04',id);
      localStorage.setItem('eakha_last_good_snapshot',id);
      localStorage.setItem('eakha_active_month','4');
    }catch(e){console.warn('[51055] pointer localStorage',e)}
    return id;
  }

  function render(W){
    call(W,'renderMaster',null);
    call(W,'renderDash');
    call(W,'renderOutput','');
    call(W,'updFlags');
    removeButtons(W);
  }

  async function apply(){
    const W=ctx();
    if(!W?.document?.body)return false;
    removeButtons(W);
    installFunctionRules(W);
    const report=cleanOffdayApril(W);
    render(W);
    const snapshot=await saveAprilLock(W,report);

    if(!W.__EAKHA_51055_OBSERVER__){
      W.__EAKHA_51055_OBSERVER__=new W.MutationObserver(()=>removeButtons(W));
      W.__EAKHA_51055_OBSERVER__.observe(W.document.documentElement,{childList:true,subtree:true});
    }
    W.document.addEventListener('click',()=>setTimeout(()=>{removeButtons(W);if(activeMonth(W)===4){cleanOffdayApril(W)}},250),true);

    OUTER.EAKHA_V51055_REPORT={...report,snapshot,buttonsRemoved:true,month:activeMonth(W)};
    console.log('[e-AKHA v5.10.55]',OUTER.EAKHA_V51055_REPORT);
    if(snapshot){
      alert(`Kemaskini siap.\n3 button dibuang.\nOFFDAY April dibetulkan: ${report.fixed}\nHari punch/OT diabaikan: ${report.ignoredPunchDays}\nOUT malam dipaut: ${report.linkedNightOut}\n\nSnapshot:\n${snapshot}\n\nMei tidak disentuh.`);
    }
    return true;
  }

  let tries=0;
  const timer=setInterval(()=>{
    tries++;
    apply().then(ok=>{if(ok)clearInterval(timer)}).catch(e=>console.error('[51055]',e));
    if(tries>40)clearInterval(timer);
  },500);
})();