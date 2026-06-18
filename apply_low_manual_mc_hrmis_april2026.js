/* e-AKHA April 2026: Apply LOW/MANUAL source records confirmed by user
   Rules:
   - MC_PRELOAD with Klinik/Hospital/KK/Poliklinik => MC SAH, except MOHAMAD AMIERUL BIN ADNAN ignored.
   - HRMIS_PRELOAD => Cuti HRMIS sah from dari-hingga, except Azura ignored/kept CB because cuti bersalin case.
   - Supports YYYY-MM-DD and DD/MM/YYYY date formats.
   - Saves to IndexedDB only.
*/
(async function(){
'use strict';
const P='apply-low-manual-mc-hrmis-april2026-v1';
if(!confirm('Apply LOW/MANUAL yang disahkan? MC_PRELOAD jadi MC kecuali Amierul Adnan; HRMIS_PRELOAD jadi cuti sah kecuali Azura.'))return;
const U=v=>String(v==null?'':v).toUpperCase().replace(/MOHAMMAD|MUHAMMAD|MOHAMED|MOHAMMAAD/g,'MOHAMAD').replace(/\bMUHD\b/g,'MOHD').replace(/[^A-Z0-9 /@.-]+/g,' ').replace(/\s+/g,' ').trim();
const C=(b,d)=>{if(!D[b])D[b]={};if(!D[b][d])D[b][d]={};return D[b][d]};
const getName=r=>r&& (r.nama||r.name||r.owner||r.staff_name||r.raw_nama||r.pemohon||r.applicant||r.nama_pemohon)||'';
function parseDate(s){s=String(s||'').trim();let ymd=s.match(/(20\d{2})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/);if(ymd)return {y:+ymd[1],m:+ymd[2],d:+ymd[3]};let dmy=s.match(/(\d{1,2})[\/\-.](\d{1,2})(?:[\/\-.](20\d{2}|\d{2}))?/);if(!dmy)return null;let y=dmy[3]?+dmy[3]:2026;if(y<100)y+=2000;return {d:+dmy[1],m:+dmy[2],y};}
function scanDates(r){let s='';try{s=JSON.stringify(r)}catch(e){};let out=[];for(let m of s.matchAll(/(20\d{2}[\/\-.]\d{1,2}[\/\-.]\d{1,2}|\d{1,2}[\/\-.]\d{1,2}[\/\-.](?:20\d{2}|\d{2}))/g)){let p=parseDate(m[1]);if(p)out.push(p)}return out;}
function expandDates(r,u){
  if(Array.isArray(r&&r._days)&&r._days.length)return r._days.map(d=>({d:+d,m:4,y:2026})).filter(x=>x.d>=1&&x.d<=30);
  let a=parseDate(r&& (r.dari||r.tarikh_mula||r.tarikh||r.date||r.start||r.from)||u&&u.tarikh), b=parseDate(r&& (r.hingga||r.tarikh_akhir||r.end||r.to)||u&&u.hingga)||a;
  if(!a){let all=scanDates(r);a=all[0];b=all[1]||a}
  if(!a)return [];
  let out=[];if(a.y===b.y&&a.m===b.m){for(let d=a.d;d<=b.d;d++)out.push({d,m:a.m,y:a.y})}else out.push(a);
  return out.filter(x=>x.y===2026&&x.m===4&&x.d>=1&&x.d<=30);
}
function scoreName(a,b){a=U(a);b=U(b);if(!a||!b)return 0;if(a===b)return 100;if(a.includes(b)||b.includes(a))return 95;let A=a.split(' ').filter(x=>x.length>3&&!/^(BIN|BINTI|BT|MOHD|MOHAMAD|A L|AL)$/.test(x));let B=b.split(' ');let hit=A.filter(x=>B.includes(x)).length;return Math.round(hit/Math.max(A.length,1)*100)}
function bestMember(name){let best={m:null,score:0};(MASTER||[]).forEach(m=>{let s=scoreName(name,m.nama);if(s>best.score)best={m,score:s}});return best.score>=50?best:{m:null,score:best.score}}
function memberFromLow(u,r){let byBil=(MASTER||[]).find(m=>+m.bil===+((u&&u.best_bil)||(r&&r.bil)));if(byBil)return {m:byBil,score:100};return bestMember((u&&u.nama)||(u&&u.nama_mc)||getName(r));}
function hasThumb(c){return !!(c.tc_in||c.tc_out||(Array.isArray(c.tc_all)&&c.tc_all.length))}
function thumbText(c){let a=[];if(Array.isArray(c.tc_all))a=a.concat(c.tc_all);if(c.tc_in)a.push('IN:'+c.tc_in);if(c.tc_out)a.push('OUT:'+c.tc_out);return [...new Set(a)].join(' | ')}
function hrType(r,u){let s=U([r&&r.jenis,r&&r.type,r&&r.leave_type,r&&r.cuti,r&&r.kategori,r&&r.sebab,r&&r.reason,u&&u.jenis].join(' '));if(/BERSALIN|\bCB\b/.test(s))return 'CB SAH';if(/KECEMASAN|\bEL\b/.test(s))return 'EL SAH';if(/TANPA REKOD|\bCTR\b/.test(s))return 'CTR SAH';if(/KURSUS|PROG/.test(s))return 'KURSUS/PROG';return 'CR SAH'}
function hasMC(c){return !!(c._mc||c.mc_obj||c.mc_data||c.mc_record||U(c.mc)==='MC'||U(c.mc_diterima)==='MC'||U(c.mc_status_51038).includes('MC SAH'))}
function isAzura(n){return /AZURA/.test(U(n))}
function isAmierul(n){let x=U(n);return /AMIERUL/.test(x)&&/ADNAN/.test(x)}
if(typeof MASTER==='undefined'||typeof D==='undefined'){alert('Buka Master File April dahulu.');return}
let lows=(window.SOURCE_MC_HRMIS_APPLY_REPORT&&Array.isArray(window.SOURCE_MC_HRMIS_APPLY_REPORT.low))?window.SOURCE_MC_HRMIS_APPLY_REPORT.low:[];
if(!lows.length){alert('SOURCE_MC_HRMIS_APPLY_REPORT.low tak jumpa. Run apply source/report dahulu.');return}
let appliedMC=[],appliedHRMIS=[],ignored=[],manual=[];
for(let u of lows){
  let arrName=String(u.source||'').split(':')[0];let srcArr=window[arrName];let r=Array.isArray(srcArr)?srcArr[u.idx]:null;let nama=(u.nama||u.nama_mc||getName(r));
  if(/^MC_PRELOAD$/i.test(arrName)||/MC_PRELOAD/i.test(u.source||'')){
    if(isAmierul(nama)){ignored.push({source:u.source,idx:u.idx,nama,reason:'AMIERUL ADNAN diabaikan ikut arahan'});continue;}
    if(!r){manual.push({...u,reason2:'Source MC record tak jumpa'});continue;}
    let mt=memberFromLow(u,r), dates=expandDates(r,u);if(!mt.m||!dates.length){manual.push({...u,reason2:'Nama/tarikh masih gagal',score:mt.score,dates:dates.map(x=>x.d).join(',')});continue;}
    dates.forEach((x,i)=>{let c=C(mt.m.bil,x.d), total=dates.length, no=r.no_mc||r.siri||u.no_mc||'', klinik=r.klinik||u.klinik||'';let obj=Object.assign({},r,{bil:mt.m.bil,nama:mt.m.nama,name:mt.m.nama,owner:mt.m.nama,staff_name:mt.m.nama,d:x.d,m:x.m,y:x.y,_days:dates.map(z=>z.d),source:P,match_score:mt.score});
      c._mc=obj;c.mc_obj=obj;c.mc_data=obj;c.mc_record=obj;c.mc='MC';c.mc_diterima='MC';c.mc_type='MC';c.no_mc=no;c.klinik=klinik;c.mc_display='MC '+total+' HARI (H'+(i+1)+'/'+total+') '+klinik+' '+no;c.mc_text=c.mc_display;c.mc_status_51038='MC SAH';c.mc_rule_51038='MC SAH';
      c.audit_final='MC SAH';c.final_audit='MC SAH';c.audit_status='MC SAH';c.tc_audit_status='MC SAH';c.tc_issue=hasThumb(c)?'MC sah; thumb/TC direkod tetapi MC diberi keutamaan: '+thumbText(c):'MC sah; TC tidak wajib semasa MC';c.audit_source=P;c.audit_reason='LOW/MANUAL MC disahkan dan dipaut';c.no_perhatian=true;c.audit_ignore_attention=true;
      appliedMC.push({bil:mt.m.bil,nama:mt.m.nama,tarikh:String(x.d).padStart(2,'0')+'/04/2026',no_mc:no,klinik,thumb:thumbText(c),audit:c.audit_final});
    });
  } else if(/HRMIS|CUTI|LEAVE/i.test(u.source||'')){
    if(isAzura(nama)){ignored.push({source:u.source,idx:u.idx,nama,reason:'Azura cuti bersalin - HRMIS CR diabaikan/semak manual'});continue;}
    if(!r){manual.push({...u,reason2:'Source HRMIS record tak jumpa'});continue;}
    let mt=memberFromLow(u,r), dates=expandDates(r,u), status=hrType(r,u);if(!mt.m||!dates.length){manual.push({...u,reason2:'Nama/tarikh HRMIS masih gagal',score:mt.score,dates:dates.map(x=>x.d).join(',')});continue;}
    dates.forEach(x=>{let c=C(mt.m.bil,x.d);c.hrmis=status;c.hrmis_display=status;c.hrmis_text=status;c.cuti_hrmis=status;c.hrmis_status=status;c.hrmis_obj=Object.assign({},r,{bil:mt.m.bil,nama:mt.m.nama,d:x.d,m:x.m,y:x.y,source:P});
      if(hasMC(c)){c.audit_final='MC + HRMIS SAH - SEMAK';c.final_audit=c.audit_final;c.audit_status=c.audit_final}else{c.audit_final=status;c.final_audit=status;c.audit_status=status}
      c.audit_source=P;c.audit_reason='LOW/MANUAL HRMIS disahkan dan dipaut';c.no_perhatian=true;c.audit_ignore_attention=true;
      appliedHRMIS.push({bil:mt.m.bil,nama:mt.m.nama,tarikh:String(x.d).padStart(2,'0')+'/04/2026',hrmis:status,audit:c.audit_final});
    });
  } else manual.push({...u,reason2:'Source tidak dikenali'});
}
const snap={id:'safe_snapshot_2026_04_FINAL_ACTIVE',tahun:2026,bulan:4,savedAt:new Date().toISOString(),reason:'APPLY LOW MANUAL MC HRMIS APRIL 2026',D:D,MC_PRELOAD:window.MC_PRELOAD||[]};
await new Promise((resolve,reject)=>{const req=indexedDB.open('eakha_vsavage_safe_store');req.onerror=()=>reject(req.error);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains('snapshots'))db.createObjectStore('snapshots',{keyPath:'id'})};req.onsuccess=()=>{const db=req.result;const tx=db.transaction('snapshots','readwrite');tx.objectStore('snapshots').put(snap);tx.oncomplete=()=>{db.close();resolve(true)};tx.onerror=()=>{db.close();reject(tx.error)}}});
try{localStorage.setItem('eakha_active_saved_in_idb','safe_snapshot_2026_04_FINAL_ACTIVE');localStorage.setItem('eakha_last_dataset_key','safe_snapshot_2026_04_FINAL_ACTIVE')}catch(e){}
try{if(typeof renderMaster==='function')renderMaster(null);if(typeof renderDash==='function')renderDash();if(typeof updFlags==='function')updFlags()}catch(e){}
window.APPLY_LOW_MANUAL_MC_HRMIS_APRIL_2026_REPORT={appliedMC,appliedHRMIS,ignored,manual};
console.log('APPLY_LOW_MANUAL_MC_HRMIS_APRIL_2026_REPORT',window.APPLY_LOW_MANUAL_MC_HRMIS_APRIL_2026_REPORT);console.log('=== MC APPLIED ===');console.table(appliedMC);console.log('=== HRMIS APPLIED ===');console.table(appliedHRMIS);console.log('=== IGNORED ===');console.table(ignored);console.log('=== STILL MANUAL ===');console.table(manual);
alert('LOW/MANUAL applied. MC: '+appliedMC.length+' | HRMIS: '+appliedHRMIS.length+' | Ignored: '+ignored.length+' | Still manual: '+manual.length+'. Semak Console/Master.');
})();