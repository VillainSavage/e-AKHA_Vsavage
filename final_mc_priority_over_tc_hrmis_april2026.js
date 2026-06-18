/* e-AKHA April 2026 FINAL: MC priority over TC/HRMIS
   Rules:
   - KZ Penyelia/Koperal MC SAKIT or MC DITERIMA => Audit Final = MC SAH.
   - Do not classify as ADA THUMB if TC is incomplete/invalid/abs/tiada thumb.
   - Cuti HRMIS row for MC date = TIADA PERMOHONAN, except HAZLAN.
   - KZ layers must not contain CR SAH/HRMIS SAH; restore to backup if available, else TM.
   - Saves to IndexedDB only to avoid localStorage quota.
*/
(function(){
'use strict';
const P='final-mc-priority-over-tc-hrmis-april2026-v1';
if(!confirm('Apply final MC priority fix? MC/KZ MC => MC SAH, HRMIS=TIADA PERMOHONAN kecuali Hazlan, buang CR SAH dari KZ.'))return;
const U=v=>String(v==null?'':v).toUpperCase().replace(/MOHAMMAD|MUHAMMAD|MOHAMED|MOHAMMAAD/g,'MOHAMAD').replace(/\bMUHD\b/g,'MOHD').replace(/[^A-Z0-9: ]+/g,' ').replace(/\s+/g,' ').trim();
const min=t=>{let m=String(t||'').match(/^(\d{1,2}):(\d{2})$/);return m?(+m[1])*60+(+m[2]):null};
const C=(b,d)=>{if(!D[b])D[b]={};if(!D[b][d])D[b][d]={};return D[b][d]};
const isHazlan=m=>/HAZLAN/.test(U(m&&m.nama));
const isTH=c=>/\bTH\b|\bTT\b|TAHAN TUGAS/.test(U([c&&c.kzp,c&&c.kzk,c&&c.audit_final,c&&c.audit_status,c&&c.note].join(' ')));
function hasMC(c){let s=U([c&&c.kzp,c&&c.kzk,c&&c.mc,c&&c.mc_diterima,c&&c.mc_status_51038,c&&c.mc_rule_51038,c&&c.audit_final,c&&c.final_audit].join(' '));return !!(c&&(c._mc||c.mc_obj||c.mc_data||c.mc_record||s.includes('MC SAKIT')||s==='MC'||s.includes(' MC ')||s.includes('MC SAH')))}
function kzIsMC(c){let s=U([c&&c.kzp,c&&c.kzk].join(' '));return /MC|SAKIT/.test(s)}
function badKZ(v){let x=U(v);return x==='CR SAH'||x==='EL SAH'||x==='CTR SAH'||x==='HRMIS SAH'||x==='CUTI HRMIS SAH'||x==='CUTI REHAT SAH'}
function findBackup(c,key){let keys=Object.keys(c||{}).filter(k=>{let x=k.toLowerCase();return x.includes(key.toLowerCase())&&(x.includes('before')||x.includes('asal')||x.includes('raw')||x.includes('original'))});for(let k of keys){let v=c[k];if(v&&!badKZ(v))return v}return ''}
function resetKZ(c,key){if(!badKZ(c[key]))return false;let old=c[key];c[key]=findBackup(c,key)||'TM';c[key+'_fixed_from_hrmis_leak']=old;return true}
function rawThumbs(c){let arr=[];if(Array.isArray(c.tc_all))arr=arr.concat(c.tc_all);if(c.tc_in)arr.push(c.tc_in);if(c.tc_out)arr.push(c.tc_out);arr=arr.map(String).filter(t=>/^\d{1,2}:\d{2}$/.test(t));return [...new Set(arr)]}
function validThumbPair(c){let inn=min(c.tc_in),out=min(c.tc_out);if(inn==null||out==null)return false;if(out<=inn)return false;return true}
function thumbText(c){return rawThumbs(c).join(' | ')}
function cleanFlags(c,reason){c.no_perhatian=true;c.audit_ignore_attention=true;c.attention_suppressed_reason=reason;if(Array.isArray(c.flags))c.flags=c.flags.filter(f=>!/MC ADA THUMB|ADA THUMB|SEMAK TC|TIADA IN|TIADA OUT|ABS|HRMIS/i.test(String(f)))}
function clearHRMISForMC(c){Object.keys(c).forEach(k=>{if(/hrmis/i.test(k)){if(typeof c[k]==='object')delete c[k];else c[k]=''}});c.hrmis='TIADA PERMOHONAN';c.hrmis_display='TIADA PERMOHONAN';c.hrmis_text='TIADA PERMOHONAN';c.cuti_hrmis='TIADA PERMOHONAN';c.hrmis_status='TIADA PERMOHONAN';c.hrmis_note='MC/Cuti Sakit bukan Cuti HRMIS'}
async function saveIDB(snap){return new Promise((resolve,reject)=>{const r=indexedDB.open('eakha_vsavage_safe_store');r.onerror=()=>reject(r.error);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains('snapshots'))db.createObjectStore('snapshots',{keyPath:'id'})};r.onsuccess=()=>{const db=r.result;const tx=db.transaction('snapshots','readwrite');tx.objectStore('snapshots').put(snap);tx.oncomplete=()=>{db.close();resolve(true)};tx.onerror=()=>{db.close();reject(tx.error)}}})}
if(typeof MASTER==='undefined'||typeof D==='undefined'){alert('Buka Master File April dahulu.');return}
let fixedMC=[], keptHazlan=[], kzFixed=[], possibleRealThumb=[];
(MASTER||[]).forEach(m=>{for(let d=1;d<=30;d++){let c=C(m.bil,d);let mc=hasMC(c)||kzIsMC(c);if(!mc)continue;if(isTH(c))continue;
  let kp=resetKZ(c,'kzp'),kk=resetKZ(c,'kzk');if(kp||kk)kzFixed.push({bil:m.bil,nama:m.nama,d,kzp:c.kzp,kzk:c.kzk});
  if(isHazlan(m)){keptHazlan.push({bil:m.bil,nama:m.nama,d,hrmis:c.hrmis||''})}else{clearHRMISForMC(c)}
  // Requested priority: MC overrides TC. Only keep a separate console note if a valid chronological pair exists.
  let validPair=validThumbPair(c);
  if(validPair){possibleRealThumb.push({bil:m.bil,nama:m.nama,d,thumb:thumbText(c),note:'Valid pair exists but audit kept MC SAH by MC priority'})}
  c.audit_final='MC SAH';c.final_audit='MC SAH';c.audit_status='MC SAH';c.tc_audit_status='MC SAH';c.tc_issue=validPair?'MC sah; TC/biometrik tidak mengubah status akhir':'MC sah; TC abs/tiada thumb/tidak valid diabaikan';c.audit_reason='MC/KZ MC SAKIT diberi keutamaan berbanding TC/HRMIS';c.audit_source=P;c.mc_priority_fix=true;c.tc_has_raw_thumb_on_mc=thumbText(c)||'';cleanFlags(c,'MC SAH priority - tidak flag ADA THUMB jika TC tidak valid/abs');fixedMC.push({bil:m.bil,nama:m.nama,tarikh:String(d).padStart(2,'0')+'/04/2026',kzp:c.kzp||'',kzk:c.kzk||'',tc:thumbText(c),audit:c.audit_final,hrmis:c.hrmis||''});
}});
const snap={id:'safe_snapshot_2026_04_FINAL_ACTIVE',tahun:2026,bulan:4,savedAt:new Date().toISOString(),reason:'FINAL MC PRIORITY OVER TC HRMIS APRIL 2026',D:D,MC_PRELOAD:window.MC_PRELOAD||[]};
saveIDB(snap).then(()=>{try{localStorage.setItem('eakha_active_saved_in_idb','safe_snapshot_2026_04_FINAL_ACTIVE');localStorage.setItem('eakha_last_dataset_key','safe_snapshot_2026_04_FINAL_ACTIVE')}catch(e){}try{if(typeof renderMaster==='function')renderMaster(null);if(typeof renderDash==='function')renderDash();if(typeof updFlags==='function')updFlags()}catch(e){}window.FINAL_MC_PRIORITY_FIX_REPORT={fixedMC,keptHazlan,kzFixed,possibleRealThumb};console.log('FINAL_MC_PRIORITY_FIX_REPORT',window.FINAL_MC_PRIORITY_FIX_REPORT);console.table(fixedMC);console.log('KZ fixed');console.table(kzFixed);console.log('Hazlan kept');console.table(keptHazlan);console.log('Possible real thumb but MC kept SAH');console.table(possibleRealThumb);alert('MC priority fix siap. MC fixed: '+fixedMC.length+' | KZ CR/HRMIS leak fixed: '+kzFixed.length+' | Hazlan kept: '+keptHazlan.length+'. Semak Master.')}).catch(e=>{console.error(e);alert('IDB save gagal: '+e.message)});
})();