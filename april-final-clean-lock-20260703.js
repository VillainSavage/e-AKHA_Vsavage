(async()=>{
"use strict";
if(window.__APRIL_FINAL_CLEAN__)return;
window.__APRIL_FINAL_CLEAN__=1;

const DB="eakha_vsavage_safe_store", ST="snapshots", Y=2026, M=4, DAYS=30;
const C=v=>JSON.parse(JSON.stringify(v??null));
const T=v=>String(v??"").trim();
const U=v=>T(v).toUpperCase().replace(/\s+/g," ");
const OBJ=v=>v&&typeof v==="object"&&!Array.isArray(v);
const OBJDATA=v=>OBJ(v)&&Object.values(v).some(x=>Array.isArray(x)?x.length:OBJ(x)?Object.keys(x).length:T(x)!=="");
const PH=/^(?:-|OFF|OF|OFFDAY|REHAT|TM|TIADA MAKLUMAN|TIADA PUNCH|TIADA IN DAN OUT|TIADA PERMOHONAN|TIADA DOKUMEN|MOHON HANTAR MC)$/i;
const TRX=/\b(?:[01]?\d|2[0-3]):[0-5]\d\b/g;

const open=()=>new Promise((ok,no)=>{const r=indexedDB.open(DB);r.onerror=()=>no(r.error);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(ST))r.result.createObjectStore(ST,{keyPath:"id"})};r.onsuccess=()=>ok(r.result)});
const all=db=>new Promise((ok,no)=>{const r=db.transaction(ST,"readonly").objectStore(ST).getAll();r.onsuccess=()=>ok(r.result||[]);r.onerror=()=>no(r.error)});
const put=(db,row)=>new Promise((ok,no)=>{const tx=db.transaction(ST,"readwrite");tx.objectStore(ST).put(row);tx.oncomplete=()=>ok();tx.onerror=()=>no(tx.error)});
const month=s=>{const n=Number(s?.bulan??s?.month??s?.activeMonth);if(n>=1&&n<=12)return n;const m=[s?.id,s?.reason,s?.sourceSnapshot].join(" ").match(/2026[_/-](0?[1-9]|1[0-2])/);return m?Number(m[1]):null};
const stamp=s=>{const m=String(s?.id||"").match(/(17\d{11,})$/);return m?Number(m[1]):Date.parse(s?.savedAt||"")||0};
const valid=s=>s&&month(s)===4&&Array.isArray(s.MASTER)&&s.MASTER.length===53&&s.D&&Object.keys(s.D).length===53&&!/BROKEN|DRAFT|LOCK_POINTER/i.test(`${s.id||""} ${s.reason||""}`);

function get(name){try{return window.eval(`typeof ${name}!=="undefined"?${name}:undefined`)}catch(e){return window[name]}}
function set(name,val){
  const cur=get(name), inc=C(val);
  if(Array.isArray(cur)&&Array.isArray(inc)){cur.splice(0,cur.length,...inc);try{window[name]=cur}catch(e){};return}
  if(OBJ(cur)&&OBJ(inc)){Object.keys(cur).forEach(k=>delete cur[k]);Object.assign(cur,inc);try{window[name]=cur}catch(e){};return}
  window.__TMP_APRIL__=inc;
  try{window.eval(`${name}=window.__TMP_APRIL__`)}catch(e){try{window[name]=inc}catch(_){}}
  delete window.__TMP_APRIL__;
}
function fn(name,...args){try{const f=window.eval(`typeof ${name}==="function"?${name}:null`)||window[name];if(typeof f==="function")return f(...args)}catch(e){console.warn(name,e)}}

function nt(v){const m=T(v).match(TRX);if(!m)return"";const [h,mi]=m[0].split(":");return `${String(+h).padStart(2,"0")}:${mi}`}
function realMC(c){
  if(OBJDATA(c?._mc)&&!/TIADA DOKUMEN|MOHON HANTAR MC/.test(U(JSON.stringify(c._mc))))return true;
  const s=U([c?.mc_status,c?.mc_display,c?.mc_diterima,c?.mc_text,c?.klinik,c?.clinic,c?.no_mc,c?.no_rujukan].join(" "));
  return !!s&&!PH.test(s)&&!/TIADA DOKUMEN|MOHON HANTAR MC/.test(s)&&/KLINIK|CLINIC|NO RUJUKAN|NO MC|MC \d+ HARI|[A-Z]\d{3,}|\d{4,}/.test(s);
}
function realHR(c){
  if(OBJDATA(c?._hrmis_rec)&&!/TIADA PERMOHONAN/.test(U(JSON.stringify(c._hrmis_rec))))return true;
  const s=U([c?.hrmis,c?.hrmis_status,c?.hrmis_display,c?.hrmis_text].join(" "));
  return !!s&&!PH.test(s)&&!/TIADA PERMOHONAN/.test(s)&&/CR SAH|EL SAH|CTR SAH|CB SAH|BERSALIN|CUTI REHAT|CUTI KECEMASAN|CUTI TANPA REKOD|PERMOHONAN/.test(s);
}
function cleanCell(c){
  const fakeMC=!realMC(c)&&[c.mc_status,c.mc_display,c.mc_diterima,c.mc_text,c._mc].some(v=>v!==undefined&&v!==null&&(OBJ(v)||T(v)!==""));
  const fakeHR=!realHR(c)&&[c.hrmis,c.hrmis_status,c.hrmis_display,c.hrmis_text,c._hrmis_rec].some(v=>v!==undefined&&v!==null&&(OBJ(v)||T(v)!==""));
  if(fakeMC){
    delete c._mc;
    ["mc_status","mc_display","mc_diterima","mc_text","mc_label","klinik","clinic","no_mc","no_rujukan"].forEach(k=>delete c[k]);
  }
  if(fakeHR){
    delete c._hrmis_rec;
    ["hrmis","hrmis_status","hrmis_display","hrmis_text","hrmis_label"].forEach(k=>delete c[k]);
  }
  const a=[];const seen=new Set();
  [c.tc_in,c.tc_out,...(Array.isArray(c.tc_all)?c.tc_all:[])].forEach(v=>{const x=nt(v);if(x&&!seen.has(x)){seen.add(x);a.push(x)}});
  if(a.length)c.tc_all=a;else delete c.tc_all;
  const i=nt(c.tc_in),o=nt(c.tc_out);
  if(i)c.tc_in=i;else delete c.tc_in;
  if(o)c.tc_out=o;else delete c.tc_out;
  return {fakeMC,fakeHR};
}
function realMCRow(r){
  if(!r||typeof r!=="object")return false;
  const s=U([r.klinik,r.clinic,r.no_mc,r.no_rujukan,r.status,r.jenis,r.catatan].join(" "));
  return !!(r.tarikh||r.date||r.dari||r.hingga||r.d)&&!!s&&!/TIADA DOKUMEN|MOHON HANTAR MC/.test(s)&&/KLINIK|CLINIC|NO RUJUKAN|NO MC|MC|[A-Z]\d{3,}|\d{4,}/.test(s);
}
function realHRRow(r){
  if(!r||typeof r!=="object")return false;
  const s=U([r.jenis,r.status,r.cuti,r.hrmis,r.catatan].join(" "));
  return !!(r.tarikh||r.date||r.dari||r.hingga||r.d)&&!!s&&!/TIADA PERMOHONAN/.test(s)&&/CR|CUTI REHAT|EL|KECEMASAN|CTR|TANPA REKOD|CB|BERSALIN|HAJI/.test(s);
}
function rows(arr,pred){
  const out=[],seen=new Set();
  for(const r of arr||[]){
    if(!pred(r))continue;
    const k=[r.bil??r.owner_bil??r.nama??"",r.tarikh??r.date??r.d??"",r.dari??"",r.hingga??"",r.status??r.jenis??r.cuti??"",r.no_mc??r.no_rujukan??r.klinik??r.clinic??""].join("|");
    if(seen.has(k))continue;seen.add(k);out.push(C(r));
  }
  return out;
}

const db=await open(), list=await all(db);
let src=null;
try{const p=localStorage.getItem("eakha_locked_snapshot_2026_04");src=list.find(s=>s.id===p&&valid(s))||null}catch(e){}
if(!src)src=list.filter(valid).sort((a,b)=>(/FULL_7_LAYERS_LOCKED/.test(b.id||"")?1:0)-(/FULL_7_LAYERS_LOCKED/.test(a.id||"")?1:0)||stamp(b)-stamp(a))[0]||null;
if(!src)throw Error("Snapshot April FULL 7 LAYERS tidak dijumpai.");

const work=C(src), backup=`backup_before_april_final_clean_${Date.now()}`;
await put(db,{...C(src),id:backup,savedAt:new Date().toISOString(),reason:"Backup before April final cleanup"});

let fakeMC=0,fakeHR=0,punchDays=0,punches=0,mcCells=0,hrCells=0;
for(const ds of Object.values(work.D||{})){
  for(const c of Object.values(ds||{})){
    if(!c||typeof c!=="object")continue;
    const r=cleanCell(c);if(r.fakeMC)fakeMC++;if(r.fakeHR)fakeHR++;
    const ts=[c.tc_in,c.tc_out,...(Array.isArray(c.tc_all)?c.tc_all:[])].filter(Boolean);
    const uq=[...new Set(ts)];if(uq.length)punchDays++;punches+=uq.length;
    if(realMC(c))mcCells++;if(realHR(c))hrCells++;
  }
}
const MC=rows([...(work.MC_DATA||[]),...(work.MC_PRELOAD||[])],realMCRow);
const HR=rows([...(work.HRMIS_DATA||[]),...(work.HRMIS_PRELOAD||[]),...(work.CUTI_HRMIS_PRELOAD||[])],realHRRow);
work.MC_DATA=MC;work.MC_PRELOAD=C(MC);
work.HRMIS_DATA=HR;work.HRMIS_PRELOAD=C(HR);work.CUTI_HRMIS_PRELOAD=C(HR);

set("MASTER",work.MASTER);set("D",work.D);set("MC_DATA",MC);set("MC_PRELOAD",MC);set("HRMIS_DATA",HR);set("HRMIS_PRELOAD",HR);set("CUTI_HRMIS_PRELOAD",HR);set("ACTIVE_YEAR",Y);set("ACTIVE_MONTH",M);
fn("normalizeHRMISAll");

let auditBuilt=0;
for(const m of work.MASTER||[]){
  const bil=String(m.bil);if(!work.D[bil])continue;
  for(let d=1;d<=DAYS;d++){
    const c=work.D[bil][d]||work.D[bil][String(d)];if(!c)continue;
    const a=fn("auditFinal",+m.bil,d);
    if(a&&a.txt){c.audit_final=a.txt;c.final_audit=a.txt;c.audit_status=a.txt;c.audit_class=a.cls||"";auditBuilt++}
  }
}

const id=`safe_snapshot_2026_04_FINAL_CLEAN_LOCKED_${Date.now()}`;
const final={...work,id,tahun:Y,bulan:M,savedAt:new Date().toISOString(),lockedAt:new Date().toISOString(),locked:true,immutable:true,type:"EAKHA_LOCKED_MONTH_DATABASE",reason:"April 2026 final clean lock. Mei untouched.",sourceSnapshot:src.id,reports:{...(work.reports||{}),finalCleanup:{fakeMC,fakeHR,punchDays,punches,mcCells,hrCells,MC_DATA:MC.length,HRMIS_DATA:HR.length,auditBuilt}}};
await put(db,final);
await put(db,{id:"LOCK_POINTER_2026_04_FINAL_CLEAN",type:"MONTH_LOCK_POINTER",tahun:Y,bulan:M,targetSnapshotId:id,savedAt:new Date().toISOString()});
db.close();

try{
  localStorage.setItem("eakha_locked_snapshot_2026_04",id);
  localStorage.setItem("eakha_active_snapshot_2026_04",id);
  localStorage.setItem("eakha_last_good_snapshot",id);
  localStorage.setItem("eakha_active_month","4");
  localStorage.setItem("eakha_dataset_2026_4",JSON.stringify({version:"APRIL_FINAL_CLEAN_LOCK",tahun:Y,bulan:M,savedAt:new Date().toISOString(),D:final.D,MC_DATA:MC,HRMIS_DATA:HR,CUSTOM_ANGGOTA:C(get("CUSTOM_ANGGOTA")||[])}));
}catch(e){console.warn("April pointer/cache",e)}

const render=()=>["renderMaster","renderDash","renderOutput","renderMCReg","renderHRMISReg","renderKZPStaging","renderKZKStaging","renderTCStaging","updFlags"].forEach(n=>fn(n,n==="renderOutput"?"":null));
render();[700,1800,3500].forEach(ms=>setTimeout(render,ms));

window.APRIL_FINAL_CLEAN_LOCK_REPORT={snapshot:id,backup,source:src.id,master:final.MASTER.length,owners:Object.keys(final.D||{}).length,fakeMC,fakeHR,punchDays,punches,mcCells,hrCells,MC_DATA:MC.length,HRMIS_DATA:HR.length,auditBuilt};
console.table([window.APRIL_FINAL_CLEAN_LOCK_REPORT]);

setTimeout(()=>alert(
`APRIL FINAL CLEAN & LOCKED.
Master: ${final.MASTER.length} | Owner: ${Object.keys(final.D||{}).length}
Hari ada punch: ${punchDays} | Punch unik: ${punches}
MC berdokumen: ${mcCells} | HRMIS sah: ${hrCells}
MC placeholder dibuang: ${fakeMC}
HRMIS placeholder dibuang: ${fakeHR}
Audit dibina: ${auditBuilt}

Snapshot:
${id}

Mei tidak disentuh.`),4300);

})().catch(e=>{console.error(e);alert("Final clean April gagal:\n"+(e?.message||e))}).finally(()=>{window.__APRIL_FINAL_CLEAN__=0});