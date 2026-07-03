(async()=>{
"use strict";
if(window.__APRIL_AUDIT_FINALIZE__)return;
window.__APRIL_AUDIT_FINALIZE__=1;

const DB="eakha_vsavage_safe_store",ST="snapshots",Y=2026,M=4,DAYS=30;
const C=v=>JSON.parse(JSON.stringify(v??null));
const OBJ=v=>v&&typeof v==="object"&&!Array.isArray(v);
const open=()=>new Promise((ok,no)=>{const r=indexedDB.open(DB);r.onerror=()=>no(r.error);r.onsuccess=()=>ok(r.result)});
const all=db=>new Promise((ok,no)=>{const r=db.transaction(ST,"readonly").objectStore(ST).getAll();r.onsuccess=()=>ok(r.result||[]);r.onerror=()=>no(r.error)});
const put=(db,row)=>new Promise((ok,no)=>{const tx=db.transaction(ST,"readwrite");tx.objectStore(ST).put(row);tx.oncomplete=()=>ok();tx.onerror=()=>no(tx.error)});
const month=s=>{const n=Number(s?.bulan??s?.month??s?.activeMonth);if(n>=1&&n<=12)return n;const m=[s?.id,s?.reason,s?.sourceSnapshot].join(" ").match(/2026[_/-](0?[1-9]|1[0-2])/);return m?Number(m[1]):null};
const stamp=s=>{const m=String(s?.id||"").match(/(17\d{11,})$/);return m?Number(m[1]):Date.parse(s?.savedAt||"")||0};
const valid=s=>s&&month(s)===4&&Array.isArray(s.MASTER)&&s.MASTER.length===53&&s.D&&Object.keys(s.D).length===53&&!/BROKEN|DRAFT|LOCK_POINTER/i.test(`${s.id||""} ${s.reason||""}`);

const frame=document.querySelector("iframe#app,iframe");
const W=frame?.contentWindow||window;
function getCtx(name){try{return W.eval(`typeof ${name}!=="undefined"?${name}:undefined`)}catch(e){return W[name]}}
function setCtx(name,val){
  const cur=getCtx(name),inc=C(val);
  if(Array.isArray(cur)&&Array.isArray(inc)){cur.splice(0,cur.length,...inc);try{W[name]=cur}catch(e){};return cur}
  if(OBJ(cur)&&OBJ(inc)){Object.keys(cur).forEach(k=>delete cur[k]);Object.assign(cur,inc);try{W[name]=cur}catch(e){};return cur}
  W.__APRIL_TMP__=inc;
  try{W.eval(`${name}=window.__APRIL_TMP__`)}catch(e){try{W[name]=inc}catch(_){} }
  delete W.__APRIL_TMP__;
  return getCtx(name)||inc;
}
function callCtx(name,...args){try{const f=W.eval(`typeof ${name}==="function"?${name}:null`)||W[name];if(typeof f==="function")return f(...args)}catch(e){console.warn(name,e)}return undefined}

const db=await open(),list=await all(db);
let src=null;
try{const p=localStorage.getItem("eakha_locked_snapshot_2026_04");src=list.find(s=>s.id===p&&valid(s))||null}catch(e){}
if(!src)src=list.filter(valid).sort((a,b)=>(/FINAL_CLEAN_LOCKED/.test(b.id||"")?1:0)-(/FINAL_CLEAN_LOCKED/.test(a.id||"")?1:0)||stamp(b)-stamp(a))[0]||null;
if(!src)throw Error("Snapshot April FINAL CLEAN tidak dijumpai.");

const backup=`backup_before_april_audit_finalize_${Date.now()}`;
await put(db,{...C(src),id:backup,savedAt:new Date().toISOString(),reason:"Backup before April audit finalize"});

setCtx("MASTER",src.MASTER);
setCtx("D",src.D);
setCtx("MC_DATA",src.MC_DATA||src.MC_PRELOAD||[]);
setCtx("MC_PRELOAD",src.MC_PRELOAD||src.MC_DATA||[]);
setCtx("HRMIS_DATA",src.HRMIS_DATA||src.HRMIS_PRELOAD||[]);
setCtx("HRMIS_PRELOAD",src.HRMIS_PRELOAD||src.HRMIS_DATA||[]);
setCtx("CUTI_HRMIS_PRELOAD",src.CUTI_HRMIS_PRELOAD||src.HRMIS_DATA||[]);
setCtx("ACTIVE_YEAR",Y);
setCtx("ACTIVE_MONTH",M);

const bk=getCtx("BK");
if(OBJ(bk))for(const m of src.MASTER)bk[m.bil]=m.komp;
callCtx("normalizeHRMISAll");

const auditFn=(()=>{try{return W.eval('typeof auditFinal==="function"?auditFinal:null')||W.auditFinal}catch(e){return W.auditFinal}})();
if(typeof auditFn!=="function")throw Error("Audit engine tidak dijumpai dalam paparan sistem. Buka page stabil utama, bukan page placeholder.");

const liveD=getCtx("D");
let built=0,errors=0;
const samples=[];
for(const m of src.MASTER){
  const bil=String(m.bil);
  if(!liveD?.[bil])continue;
  for(let d=1;d<=DAYS;d++){
    const cell=liveD[bil][d]||liveD[bil][String(d)];
    if(!cell)continue;
    try{
      const a=auditFn(Number(m.bil),d);
      if(a&&a.txt){
        cell.audit_final=a.txt;
        cell.final_audit=a.txt;
        cell.audit_status=a.txt;
        cell.audit_class=a.cls||"";
        cell.audit_incomplete=!!a.inc;
        built++;
        if(samples.length<20)samples.push({bil:m.bil,nama:m.nama,hari:d,audit:a.txt,cls:a.cls||""});
      }
    }catch(e){errors++;if(errors<10)console.warn("audit",m.bil,d,e)}
  }
}
if(built===0)throw Error("Audit engine wujud tetapi tiada rekod berjaya dibina.");

const finalD=C(liveD);
const id=`safe_snapshot_2026_04_FINAL_AUDIT_LOCKED_${Date.now()}`;
const final={...C(src),id,tahun:Y,bulan:M,savedAt:new Date().toISOString(),lockedAt:new Date().toISOString(),locked:true,immutable:true,type:"EAKHA_LOCKED_MONTH_DATABASE",reason:"April 2026 final audit rebuilt and locked. Mei untouched.",sourceSnapshot:src.id,D:finalD,reports:{...(src.reports||{}),auditFinalize:{built,errors,samples}}};
await put(db,final);
await put(db,{id:"LOCK_POINTER_2026_04_FINAL_AUDIT",type:"MONTH_LOCK_POINTER",tahun:Y,bulan:M,targetSnapshotId:id,savedAt:new Date().toISOString()});
db.close();

try{
  localStorage.setItem("eakha_locked_snapshot_2026_04",id);
  localStorage.setItem("eakha_active_snapshot_2026_04",id);
  localStorage.setItem("eakha_last_good_snapshot",id);
  localStorage.setItem("eakha_active_month","4");
  localStorage.setItem("eakha_dataset_2026_4",JSON.stringify({version:"APRIL_FINAL_AUDIT_LOCK",tahun:Y,bulan:M,savedAt:new Date().toISOString(),D:finalD,MC_DATA:final.MC_DATA||[],HRMIS_DATA:final.HRMIS_DATA||[],CUSTOM_ANGGOTA:C(getCtx("CUSTOM_ANGGOTA")||[])}));
}catch(e){console.warn("April audit pointer/cache",e)}

["renderMaster","renderDash","renderOutput","renderMCReg","renderHRMISReg","renderKZPStaging","renderKZKStaging","renderTCStaging","updFlags"].forEach(n=>callCtx(n,n==="renderOutput"?"":null));
setTimeout(()=>["renderMaster","renderDash","renderOutput","updFlags"].forEach(n=>callCtx(n,n==="renderOutput"?"":null)),900);

window.APRIL_FINAL_AUDIT_LOCK_REPORT={snapshot:id,backup,source:src.id,built,errors,master:final.MASTER.length,owners:Object.keys(finalD).length,samples};
console.log("=== APRIL FINAL AUDIT LOCK ===");
console.table([window.APRIL_FINAL_AUDIT_LOCK_REPORT]);
console.table(samples);

setTimeout(()=>alert(
`APRIL AUDIT FINAL SIAP & LOCKED.
Master: ${final.MASTER.length} | Owner: ${Object.keys(finalD).length}
Audit dibina: ${built}
Ralat audit: ${errors}

Snapshot:
${id}

Mei tidak disentuh.`),1800);

})().catch(e=>{console.error(e);alert("Finalize Audit April gagal:\n"+(e?.message||e))}).finally(()=>{window.__APRIL_AUDIT_FINALIZE__=0});