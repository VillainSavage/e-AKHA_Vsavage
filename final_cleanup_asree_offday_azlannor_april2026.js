/* e-AKHA April 2026 final cleanup
   - ASREE = TH only; remove wrongly linked MC from ASREE.
   - OFFDAY after night: only 07:00-08:00 is valid hakiki OUT for previous M.
     <07:00 invalid for hakiki; >08:00 outside window; no flag because OFFDAY.
     extra thumbs after OUT on OFFDAY treated as OT/ignored.
   - Night IN valid only 22:00-23:05. 21:xx is IN AWAL LUAR TINGKAP, not hakiki.
*/
(function(){
'use strict';
const P='final-cleanup-asree-offday-azlannor-april2026-v1';
if(!confirm('Apply cleanup: ASREE TH bukan MC, OFFDAY out hakiki hanya 0700-0800, 21xx malam = IN awal luar tingkap?'))return;
const U=v=>String(v==null?'':v).toUpperCase().replace(/\s+/g,' ').trim();
const toMin=t=>{let m=String(t||'').match(/^(\d{1,2}):(\d{2})$/);return m?(+m[1])*60+(+m[2]):null};
const sort=a=>(Array.isArray(a)?a:[]).map(String).filter(x=>/^\d{1,2}:\d{2}$/.test(x)).sort((a,b)=>toMin(a)-toMin(b));
const cell=(b,d)=>{if(!D[b])D[b]={};if(!D[b][d])D[b][d]={};return D[b][d]};
const comp=m=>U(m.komp||m.kompeni||m.company||'');
function sh(m,d){let k=comp(m),off=0;if(/BRAVO/.test(k))off=4;else if(/CHARLIE/.test(k))off=2;else if(/DELTA/.test(k))off=6;let cyc=['PT','PT','PG','PG','M','M','OF','OF'];return cyc[((d-1+off)%8+8)%8]}
function clean(c,reason){c.no_perhatian=true;c.audit_ignore_attention=true;c.attention_suppressed_reason=reason;if(Array.isArray(c.flags))c.flags=c.flags.filter(f=>!/ABS|MC|SEMAK|TIADA|LEWAT|OUT|OT|OFFDAY/i.test(String(f)))}
function save(){try{localStorage.setItem('eakha_data',JSON.stringify(D));let snap={};try{snap=JSON.parse(localStorage.getItem('eakha_dataset_2026_4')||'{}')}catch(e){}snap.tahun=2026;snap.bulan=4;snap.D=D;snap.savedAt=new Date().toISOString();snap.reason='FINAL CLEANUP ASREE OFFDAY AZLANNOR APRIL 2026';localStorage.setItem('eakha_dataset_2026_4',JSON.stringify(snap));localStorage.setItem('eakha_last_dataset_key','eakha_dataset_2026_4')}catch(e){console.warn('save warning',e)}}
if(typeof MASTER==='undefined'||typeof D==='undefined'){alert('Buka Master File April dahulu.');return}
let log={asree:0,offday:0,nightEarly:0,nightFixed:0},sample=[];
(MASTER||[]).forEach(m=>{
 const name=U(m.nama);
 for(let d=1;d<=30;d++){
  let c=cell(m.bil,d);
  if(/ASREE/.test(name)){
   delete c._mc; delete c.mc_status_51038; delete c.mc_rule_51038; c.mc=''; c.mc_diterima='';
   c.kzp='TH'; c.kzk='TH'; c.tc_audit_status='TH/TT - ABAIKAN'; c.audit_final='TH - TIDAK HADIR TUGAS'; c.final_audit='TH - TIDAK HADIR TUGAS'; c.audit_status='TH - TIDAK HADIR TUGAS'; c.audit_reason='ASREE tahan tugas; MC tersalah paut dibuang'; c.audit_source='ASREE_TH_FIX'; c.tc_issue='Tahan tugas - bukan MC'; c.tc_audit_patch=P; clean(c,'ASREE TH - MC bukan milik anggota'); log.asree++;
   if(sample.length<30)sample.push({bil:m.bil,nama:m.nama,d,status:c.audit_final,src:'ASREE_TH'});
   continue;
  }
  // Night shift audit: 21:xx is early outside allowed window.
  if(sh(m,d)==='M'){
   let arr=sort(c.tc_all||[]), validIn=arr.filter(t=>{let x=toMin(t);return x>=1320&&x<=1385})[0]||'', early=arr.filter(t=>{let x=toMin(t);return x>=1260&&x<1320})[0]||'';
   if(!validIn&&early){c.tc_in=''; c.tc_early_in=early; c.tc_audit_status='SEMAK TC - IN AWAL LUAR TINGKAP'; c.tc_issue='IN '+early+' lebih awal daripada tetingkap 2200-2305, tidak dikira hakiki'; c.audit_final='SEMAK TC - IN AWAL LUAR TINGKAP'; c.final_audit=c.audit_final; c.audit_status=c.audit_final; c.tc_audit_patch=P; log.nightEarly++; if(sample.length<80)sample.push({bil:m.bil,nama:m.nama,d,status:c.audit_final,early,all:arr.join(' ')});} 
   if(validIn&&c.tc_in!==validIn){c.tc_in=validIn;log.nightFixed++;}
  }
  // OFF day after night: valid OUT 07:00-08:00 is hakiki for previous M. Other offday thumbs ignored/no flag.
  if(d>1&&sh(m,d-1)==='M'&&sh(m,d)==='OF'){
   let arr=sort([...(c.tc_all||[]),c.tc_in,c.tc_out].filter(Boolean));
   let validOut=arr.filter(t=>{let x=toMin(t);return x>=420&&x<=480})[0]||'';
   let before7=arr.filter(t=>{let x=toMin(t);return x!=null&&x<420}).join(' ');
   let after8=arr.filter(t=>{let x=toMin(t);return x>480}).join(' ');
   if(validOut){let p=cell(m.bil,d-1);p.tc_out=validOut;p.tc_offday_out_linked=true;p.tc_offday_out_day=d;p.tc_issue='OUT hakiki pada OFFDAY esok '+validOut;p.tc_audit_patch=P;if(p.tc_in){p.tc_audit_status='SAH';p.audit_final='SAH';p.final_audit='SAH';p.audit_status='SAH'};c.tc_out=validOut;c.tc_in='';c.tc_audit_status='OUT SAH HAKIKI - MALAM SEBELUMNYA';c.audit_final='OFF / OUT HAKIKI M SEBELUMNYA';c.final_audit=c.audit_final;c.audit_status=c.audit_final;c.tc_issue='Bukan OT. OUT untuk shift malam hari sebelumnya.';}
   else {c.tc_audit_status='OFFDAY - ABAIKAN';c.audit_final='OFF';c.final_audit='OFF';c.audit_status='OFF';c.tc_issue='OFFDAY selepas malam: tiada OUT sah 0700-0800. Punch luar tetingkap tidak flag.';}
   c.tc_offday_extra_thumb_ignored=after8||before7||''; c.tc_audit_patch=P; clean(c,'OFFDAY selepas M: punch luar tetingkap/OT diabaikan'); log.offday++; if(sample.length<80)sample.push({bil:m.bil,nama:m.nama,offday:d,outHakiki:validOut,before7,after8,all:arr.join(' ')});
  }
 }
});
save();try{if(typeof renderMaster==='function')renderMaster(null);if(typeof renderDash==='function')renderDash();if(typeof updFlags==='function')updFlags()}catch(e){}
window.FINAL_CLEANUP_ASREE_OFFDAY_AZLANNOR_REPORT={log,sample};console.log('FINAL_CLEANUP_ASREE_OFFDAY_AZLANNOR_REPORT',window.FINAL_CLEANUP_ASREE_OFFDAY_AZLANNOR_REPORT);console.table(log);console.table(sample);
alert('Cleanup siap. Asree TH cells:'+log.asree+' | OFFDAY after M:'+log.offday+' | IN awal luar tingkap:'+log.nightEarly+'. Semak Master sebelum Simpan Snapshot.');
})();