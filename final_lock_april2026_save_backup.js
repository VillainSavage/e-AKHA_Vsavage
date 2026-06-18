/* e-AKHA April 2026 FINAL LOCK SAVE + BACKUP
   - Saves active D/MC/HRMIS state to IndexedDB only.
   - Downloads JSON backup.
   - Marks April 2026 as FINAL_LOCKED.
   - Stores future routing rule note: MC/HRMIS must route by actual leave/MC date, not upload date.
*/
(async function(){
'use strict';
const P='final-lock-april2026-save-backup-v1';
if(!confirm('Lock & backup April 2026 sekarang? Data akan disimpan ke IndexedDB dan backup JSON akan download.'))return;
function collectGlobals(){
  const out={};
  Object.keys(window).forEach(k=>{
    try{
      if(/MC|HRMIS|CUTI|LEAVE|SOURCE|REPORT|PRELOAD/i.test(k)){
        const v=window[k];
        if(Array.isArray(v)|| (v&&typeof v==='object'&&k.includes('REPORT'))) out[k]=v;
      }
    }catch(e){}
  });
  return out;
}
async function putIDB(dbName,storeName,obj){return new Promise((resolve,reject)=>{const r=indexedDB.open(dbName);r.onerror=()=>reject(r.error);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains(storeName))db.createObjectStore(storeName,{keyPath:'id'})};r.onsuccess=()=>{const db=r.result;const tx=db.transaction(storeName,'readwrite');tx.objectStore(storeName).put(obj);tx.oncomplete=()=>{db.close();resolve(true)};tx.onerror=()=>{db.close();reject(tx.error)}}})}
if(typeof D==='undefined'){alert('Data D tidak jumpa. Buka Master File dahulu.');return}
let snap={
  id:'safe_snapshot_2026_04_FINAL_LOCKED',
  active_id:'safe_snapshot_2026_04_FINAL_ACTIVE',
  tahun:2026,
  bulan:4,
  status:'FINAL_LOCKED',
  patch:P,
  savedAt:new Date().toISOString(),
  reason:'APRIL 2026 FINAL LOCKED AFTER MC/HRMIS/TC CLEANUP',
  routingRule:'Future MC and HRMIS uploads must be inserted by actual MC/leave date(s), not upload date. Late submissions route to the month/date of the MC/leave. Cross-month leave must be split by month.',
  D:D,
  MASTER: typeof MASTER!=='undefined'?MASTER:null,
  globals:collectGlobals()
};
try{
  await putIDB('eakha_vsavage_safe_store','snapshots',snap);
  const active=Object.assign({},snap,{id:'safe_snapshot_2026_04_FINAL_ACTIVE',status:'FINAL_ACTIVE_COPY_OF_LOCKED'});
  await putIDB('eakha_vsavage_safe_store','snapshots',active);
  try{
    localStorage.setItem('eakha_active_saved_in_idb','safe_snapshot_2026_04_FINAL_ACTIVE');
    localStorage.setItem('eakha_last_dataset_key','safe_snapshot_2026_04_FINAL_ACTIVE');
    localStorage.setItem('eakha_april_2026_final_locked','safe_snapshot_2026_04_FINAL_LOCKED');
    localStorage.setItem('eakha_future_upload_routing_rule','MC/HRMIS route by actual date, not upload date; cross-month split by month.');
  }catch(e){}
  const blob=new Blob([JSON.stringify(snap)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='EAKHA_APRIL_2026_FINAL_LOCKED_BACKUP.json';
  a.click();
  window.EAKHA_APRIL_2026_FINAL_LOCKED=snap;
  console.log('EAKHA_APRIL_2026_FINAL_LOCKED',snap);
  alert('April 2026 siap dikunci & backup download. IDB: safe_snapshot_2026_04_FINAL_LOCKED + FINAL_ACTIVE. Untuk upload baru nanti: ikut tarikh sebenar MC/cuti, bukan tarikh upload.');
}catch(e){console.error(e);alert('Gagal save final lock: '+e.message)}
})();