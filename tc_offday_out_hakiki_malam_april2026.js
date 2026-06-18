/* e-AKHA April 2026: OFFDAY morning punch after night shift = OUT SAH HAKIKI.
   Rule: If previous day is SHIFT M and current day is OFF/OF, any 07:00-08:00 punch on the OFF day belongs to previous night's OUT, not OT.
*/
(function(){
'use strict';
const P='tc-offday-out-hakiki-malam-april2026-v1';
if(!confirm('Apply rule: OUT pagi 0700-0800 pada OFF selepas shift MALAM = OUT SAH HAKIKI, bukan OT/flag?')) return;
const U=v=>String(v==null?'':v).toUpperCase().replace(/\s+/g,' ').trim();
const mins=t=>{let m=String(t||'').match(/^(\d{1,2}):(\d{2})$/);return m?(+m[1])*60+(+m[2]):null};
const times=a=>(Array.isArray(a)?a:[]).map(String).filter(t=>/^\d{1,2}:\d{2}$/.test(t)).sort((a,b)=>mins(a)-mins(b));
const outMorning=a=>times(a).filter(t=>{let x=mins(t);return x>=420&&x<=480})[0]||'';
const days=()=>{try{return typeof daysInActiveMonth==='function'?daysInActiveMonth():30}catch(e){return 30}};
const cell=(b,d)=>{if(!D[b])D[b]={}; if(!D[b][d])D[b][d]={}; return D[b][d]};
function sh(mem,d,c){let s='';try{s=U(typeof gSh==='function'?gSh(mem.bil,d):'')}catch(e){} if(!s&&c)s=U(c.shift||c.jadual||c.tc_shift||''); if(/OFF|OFFDAY|\bOF\b|REHAT/.test(s))return'OF'; if(/MALAM|NIGHT|\bM\b|2300.*0700/.test(s))return'M'; if(/PETANG|\bPT\b|1500.*2300/.test(s))return'PT'; if(/PAGI|\bPG\b|0700.*1500/.test(s))return'PG'; return s;}
function clean(c,reason){c.no_perhatian=true;c.audit_ignore_attention=true;c.attention_suppressed_reason=reason;if(Array.isArray(c.flags))c.flags=c.flags.filter(f=>!/OT|OFFDAY|ABS|SEMAK|TIADA|LEWAT|OUT/i.test(String(f)));}
if(typeof MASTER==='undefined'||typeof D==='undefined'){alert('Buka Master File April dahulu.');return;}
try{localStorage.setItem('eakha_backup_before_'+P+'_'+Date.now(),JSON.stringify(D))}catch(e){}
let applied=[], checked=0;
(MASTER||[]).forEach(mem=>{
 for(let d=2; d<=days(); d++){
   let c=cell(mem.bil,d), prev=cell(mem.bil,d-1);
   if(sh(mem,d,c)!=='OF' || sh(mem,d-1,prev)!=='M') continue;
   checked++;
   let out=outMorning(c.tc_all||[]);
   if(!out) continue;
   prev.tc_out=out;
   prev.tc_shift='SHIFT M (2300-0700) | OUT esok jatuh OFFDAY';
   prev.tc_audit_status=prev.tc_in?'SAH':'SEMAK TC - TIADA IN';
   prev.tc_issue=prev.tc_in?'TC malam sah: OUT pada OFFDAY esok':'OUT ada di OFFDAY esok tetapi IN malam tiada';
   prev.tc_offday_out_linked=true;
   prev.tc_offday_out_day=d;
   c.tc_in='';
   c.tc_out=out;
   c.tc_shift='OUT SAH HAKIKI - SHIFT MALAM SEBELUMNYA';
   c.tc_audit_status='OUT SAH HAKIKI - MALAM SEBELUMNYA';
   c.tc_issue='Bukan OT. OUT untuk shift malam hari sebelumnya.';
   c.audit_final='OFF / OUT HAKIKI M SEBELUMNYA';
   c.final_audit='OFF / OUT HAKIKI M SEBELUMNYA';
   c.audit_status='OFF / OUT HAKIKI M SEBELUMNYA';
   c.tc_offday_out_hakiki=true;
   c.tc_pair_prev_day=d-1;
   c.tc_pair_prev_bil=mem.bil;
   c.tc_audit_patch=P;
   clean(c,'OUT hakiki shift malam sebelumnya jatuh pada OFFDAY');
   applied.push({bil:mem.bil,nama:mem.nama,malam:d-1,offday:d,out:out});
 }
});
try{localStorage.setItem('eakha_data',JSON.stringify(D));let snap={};try{snap=JSON.parse(localStorage.getItem('eakha_dataset_2026_4')||'{}')}catch(e){}snap.tahun=2026;snap.bulan=4;snap.D=D;snap.savedAt=new Date().toISOString();snap.reason='OFFDAY OUT HAKIKI SHIFT MALAM APRIL 2026';localStorage.setItem('eakha_dataset_2026_4',JSON.stringify(snap));localStorage.setItem('eakha_last_dataset_key','eakha_dataset_2026_4')}catch(e){console.warn(e)}
try{if(typeof renderMaster==='function')renderMaster(null);if(typeof renderDash==='function')renderDash();if(typeof updFlags==='function')updFlags()}catch(e){}
window.TC_OFFDAY_OUT_HAKIKI_REPORT_APRIL_2026={checked,applied};console.log('TC_OFFDAY_OUT_HAKIKI_REPORT_APRIL_2026',window.TC_OFFDAY_OUT_HAKIKI_REPORT_APRIL_2026);console.table(applied);
alert('OUT hakiki OFFDAY siap. OFF selepas M disemak: '+checked+' | applied: '+applied.length+'. Semak Master sebelum Simpan Snapshot.');
})();