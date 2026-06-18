/* e-AKHA April 2026: CHECK LATEST HRMIS/CUTI SOURCE vs MASTER
   Report only; no data changes. It checks uploaded/stored HRMIS source records,
   compares with Master D, and flags records belum masuk / master extra / MC conflicts.
*/
(async function(){
'use strict';
const U=v=>String(v==null?'':v).toUpperCase().replace(/MOHAMMAD|MUHAMMAD|MOHAMED|MOHAMMAAD/g,'MOHAMAD').replace(/\bMUHD\b/g,'MOHD').replace(/[^A-Z0-9 /@.-]+/g,' ').replace(/\s+/g,' ').trim();
const cell=(b,d)=>((D||{})[b]||{})[d]||{};
const hasMC=c=>!!(c&&(c._mc||c.mc_obj||c.mc_data||c.mc_record||U(c.mc)==='MC'||U(c.mc_diterima)==='MC'||U(c.mc_status_51038).includes('MC SAH')||U(c.audit_final).includes('MC SAH')));
const isHR=v=>{let x=U(v);return x&&x!=='-'&&x!=='TM'&&x!=='TIADA MAKLUMAN'&&x!=='TIADA PERMOHONAN'&&x!=='KOSONG'};
const hrStatus=v=>{let x=U(v);if(/BERSALIN|\bCB\b/.test(x))return 'CB SAH';if(/KECEMASAN|\bEL\b/.test(x))return 'EL SAH';if(/TANPA REKOD|\bCTR\b/.test(x))return 'CTR SAH';if(/KURSUS|PROG/.test(x))return 'KURSUS/PROG';if(/KUARANTIN|\bK\b/.test(x))return 'K';return 'CR SAH'};
const recName=r=>r.nama||r.name||r.pemohon||r.applicant||r.staff_name||r.nama_pemohon||r.owner||r.raw_nama||'';
const recType=r=>r.jenis||r.type||r.leave_type||r.cuti||r.kategori||r.sebab||r.reason||r.status||r.nama_cuti||r.leaveName||'';
function parseDate(s){let m=String(s||'').match(/(\d{1,2})[\/\-.](\d{1,2})(?:[\/\-.](20\d{2}|\d{2}))?/);if(!m)return null;let y=m[3]?+m[3]:2026;if(y<100)y+=2000;return {d:+m[1],m:+m[2],y}}
function datesFromRecord(r){
  if(Array.isArray(r._days)&&r._days.length)return r._days.map(d=>({d:+d,m:4,y:2026})).filter(x=>x.d>=1&&x.d<=30);
  let a=parseDate(r.dari||r.start||r.tarikh_mula||r.from||r.begin||r.tarikh||r.date||r.tkh_mula||r.mula), b=parseDate(r.hingga||r.end||r.tarikh_akhir||r.to||r.finish||r.tkh_akhir||r.akhir)||a;
  if(!a){let s='';try{s=JSON.stringify(r)}catch(e){};let all=[...s.matchAll(/(\d{1,2}[\/\-.]\d{1,2}(?:[\/\-.](?:20\d{2}|\d{2}))?)/g)].map(x=>parseDate(x[1])).filter(Boolean);if(all.length){a=all[0];b=all[1]||a}else return []}
  let out=[];if(a.y===b.y&&a.m===b.m){for(let d=a.d;d<=b.d;d++)out.push({d,m:a.m,y:a.y})}else out.push(a);
  return out.filter(x=>x.y===2026&&x.m===4&&x.d>=1&&x.d<=30)
}
function score(a,b){a=U(a);b=U(b);if(!a||!b)return 0;if(a===b)return 100;if(a.includes(b)||b.includes(a))return 95;let A=a.split(' ').filter(w=>w.length>3&&!/^(BIN|BINTI|BT|MOHD|MOHAMAD|A L|AL)$/.test(w));let B=b.split(' ');let h=A.filter(w=>B.includes(w)).length;return Math.round(h/Math.max(A.length,1)*100)}
function bestMember(n){let best={bil:'',nama:'',score:0};(MASTER||[]).forEach(m=>{let s=score(n,m.nama);if(s>best.score)best={bil:m.bil,nama:m.nama,score:s}});return best}
function isLikelyHRMISRecord(r){let s='';try{s=JSON.stringify(r).toUpperCase()}catch(e){};return /HRMIS|CUTI|REHAT|KECEMASAN|TANPA REKOD|CTR|KURSUS|BERSALIN|EL|CR/.test(s)&&!/(MC SAH|MC SAKIT|KLINIK|SIJIL SAKIT)/.test(s)}
function uniqueRecordKey(r,src){let ds=datesFromRecord(r).map(x=>x.d).join(',');return [src,recName(r),recType(r),r.no||r.id||r.rujukan||'',ds].map(U).join('|')}
function collectSources(){let out=[], seen=new Set();
  Object.keys(window).forEach(k=>{try{let v=window[k];if(Array.isArray(v)&&/HRMIS|CUTI|LEAVE/i.test(k)){v.forEach((r,i)=>{if(r&&typeof r==='object'&&isLikelyHRMISRecord(r)){let key=uniqueRecordKey(r,k);if(!seen.has(key)){seen.add(key);out.push({src:k,idx:i,r})}}})}}catch(e){}});
  Object.keys(localStorage).forEach(k=>{if(!/hrmis|cuti|leave/i.test(k))return;try{let v=JSON.parse(localStorage.getItem(k)||'null');let arr=Array.isArray(v)?v:(v&&Array.isArray(v.data)?v.data:(v&&Array.isArray(v.records)?v.records:null));if(arr)arr.forEach((r,i)=>{if(r&&typeof r==='object'&&isLikelyHRMISRecord(r)){let key=uniqueRecordKey(r,k);if(!seen.has(key)){seen.add(key);out.push({src:'localStorage:'+k,idx:i,r})}}})}catch(e){}});
  return out;
}
function idbFiles(){return new Promise(resolve=>{let req=indexedDB.open('eakha_files');req.onerror=()=>resolve([]);req.onsuccess=()=>{let db=req.result;if(!db.objectStoreNames.contains('files')){db.close();resolve([]);return}let tx=db.transaction('files','readonly');let q=tx.objectStore('files').getAll();q.onsuccess=()=>{db.close();resolve(q.result||[])};q.onerror=()=>{db.close();resolve([])}}})}
if(typeof MASTER==='undefined'||typeof D==='undefined'){alert('Buka Master File April dahulu.');return}
const files=(await idbFiles()).map(x=>({id:x.id||'',name:x.name||x.filename||x.fileName||'',k:x.k||x.kind||'',type:x.type||'',size:x.size||x.fileSize||(x.blob&&x.blob.size)||'',stored:x.stored||x.savedAt||'',is_hrmis:/hrmis|cuti|leave/i.test([x.id,x.name,x.filename,x.fileName,x.k,x.kind].join(' '))}));
const sources=collectSources();
let sourceSummary=sources.map(x=>{let bm=bestMember(recName(x.r));let ds=datesFromRecord(x.r);return {src:x.src,idx:x.idx,nama_src:recName(x.r),best_bil:bm.bil,best_nama:bm.nama,score:bm.score,jenis:recType(x.r),tarikh:ds.map(z=>String(z.d).padStart(2,'0')+'/04').join(','),raw_dari:x.r.dari||x.r.tarikh_mula||x.r.tarikh||'',raw_hingga:x.r.hingga||x.r.tarikh_akhir||'',status:x.r.status||x.r.kelulusan||x.r.approval||''}});
let sourceBelumMasuk=[], sourceConflictMC=[], sourceLowScore=[];
sources.forEach(x=>{let r=x.r,bm=bestMember(recName(r)),ds=datesFromRecord(r);if(bm.score<70||!ds.length){sourceLowScore.push({src:x.src,idx:x.idx,nama_src:recName(r),best_bil:bm.bil,best_nama:bm.nama,score:bm.score,jenis:recType(r),tarikh:ds.map(z=>z.d).join(',')});return}ds.forEach(z=>{let c=cell(bm.bil,z.d), hr=isHR(c.hrmis||c.cuti_hrmis||c.hrmis_status||c.hrmis_display);if(hasMC(c)){sourceConflictMC.push({bil:bm.bil,nama:bm.nama,tarikh:String(z.d).padStart(2,'0')+'/04/2026',jenis:recType(r),current_hrmis:c.hrmis||'',mc:'ADA MC',src:x.src,idx:x.idx})}else if(!hr){sourceBelumMasuk.push({bil:bm.bil,nama:bm.nama,tarikh:String(z.d).padStart(2,'0')+'/04/2026',jenis:hrStatus(recType(r)),raw_jenis:recType(r),src:x.src,idx:x.idx,status:r.status||r.kelulusan||''})}})});
let masterHrmis=[];let masterHrmisNoSource=[];
(MASTER||[]).forEach(m=>{for(let d=1;d<=30;d++){let c=cell(m.bil,d), hv=c.hrmis||c.cuti_hrmis||c.hrmis_status||c.hrmis_display||'';if(isHR(hv)){let found=sources.some(x=>{let bm=bestMember(recName(x.r));return +bm.bil===+m.bil&&datesFromRecord(x.r).some(z=>z.d===d)});let rec={bil:m.bil,nama:m.nama,tarikh:String(d).padStart(2,'0')+'/04/2026',hrmis:hv,audit:c.audit_final||c.final_audit||'',mc:hasMC(c)?'ADA MC':''};masterHrmis.push(rec);if(!found)masterHrmisNoSource.push(rec)}}});
window.HRMIS_LATEST_CHECK_APRIL_2026_REPORT={files,sourceSummary,sourceBelumMasuk,sourceConflictMC,sourceLowScore,masterHrmis,masterHrmisNoSource};
console.log('HRMIS_LATEST_CHECK_APRIL_2026_REPORT',window.HRMIS_LATEST_CHECK_APRIL_2026_REPORT);
console.log('=== FAIL TERSIMPAN / UPLOAD HRMIS ===');console.table(files.filter(x=>x.is_hrmis));
console.log('=== HRMIS SOURCE TERBACA ===');console.table(sourceSummary);
console.log('=== HRMIS SOURCE BELUM MASUK MASTER ===');console.table(sourceBelumMasuk);
console.log('=== HRMIS SOURCE BERTINDIH DENGAN MC ===');console.table(sourceConflictMC);
console.log('=== HRMIS LOW SCORE / MANUAL ===');console.table(sourceLowScore);
console.log('=== MASTER HRMIS SEDIA ADA ===');console.table(masterHrmis);
console.log('=== MASTER HRMIS TANPA SOURCE / MUNGKIN BOCOR ===');console.table(masterHrmisNoSource);
alert('Semakan HRMIS siap. Source terbaca: '+sources.length+' | Belum masuk Master: '+sourceBelumMasuk.length+' | Conflict MC: '+sourceConflictMC.length+' | Low score: '+sourceLowScore.length+' | Master HRMIS tanpa source: '+masterHrmisNoSource.length+'. Semak Console.');
})();