/* e-AKHA April 2026 OFFDAY OUT HAKIKI V2
   Detects shifts by company cycle, not by display text.
   Cycle April 2026: PT,PT,PG,PG,M,M,OF,OF with offsets Alpha=0 Bravo=4 Charlie=2 Delta=6.
*/
(function(){
'use strict';
const P='tc-offday-out-hakiki-malam-april2026-v2';
if(!confirm('V2: OUT pagi 0700-0800 pada OFF selepas shift MALAM = OUT SAH HAKIKI. Guna cycle kompeni, bukan display.'))return;
const U=v=>String(v==null?'':v).toUpperCase().replace(/\s+/g,' ').trim();
const min=t=>{let m=String(t||'').match(/^(\d{1,2}):(\d{2})$/);return m?(+m[1])*60+(+m[2]):null};
const sort=a=>(Array.isArray(a)?a:[]).map(String).filter(x=>/^\d{1,2}:\d{2}$/.test(x)).sort((a,b)=>min(a)-min(b));
function c(b,d){if(!D[b])D[b]={};if(!D[b][d])D[b][d]={};return D[b][d]}
function comp(m){return U(m.komp||m.kompeni||m.company||'')}
function sh(m,d){let k=comp(m),off=0;if(/BRAVO/.test(k))off=4;else if(/CHARLIE/.test(k))off=2;else if(/DELTA/.test(k))off=6;else off=0;let cyc=['PT','PT','PG','PG','M','M','OF','OF'];return cyc[((d-1+off)%8+8)%8]}
function morning(cell){let arr=sort([...(cell.tc_all||[]),cell.tc_in,cell.tc_out].filter(Boolean));return arr.filter(t=>{let x=min(t);return x>=420&&x<=480})[0]||''}
function nightIn(cell){let arr=sort([...(cell.tc_all||[]),cell.tc_in].filter(Boolean));return arr.filter(t=>{let x=min(t);return x>=1320&&x<=1385})[0]||cell.tc_in||''}
function clean(cell,reason){cell.no_perhatian=true;cell.audit_ignore_attention=true;cell.attention_suppressed_reason=reason;if(Array.isArray(cell.flags))cell.flags=cell.flags.filter(f=>!/OT|OFFDAY|ABS|SEMAK|TIADA|LEWAT|OUT/i.test(String(f)))}
function save(){try{localStorage.setItem('eakha_data',JSON.stringify(D));let snap={};try{snap=JSON.parse(localStorage.getItem('eakha_dataset_2026_4')||'{}')}catch(e){}snap.tahun=2026;snap.bulan=4;snap.D=D;snap.savedAt=new Date().toISOString();snap.reason='OFFDAY OUT HAKIKI M V2';localStorage.setItem('eakha_dataset_2026_4',JSON.stringify(snap));localStorage.setItem('eakha_last_dataset_key','eakha_dataset_2026_4')}catch(e){console.warn('save warning',e)}}
if(typeof MASTER==='undefined'||typeof D==='undefined'){alert('Buka Master File April dahulu.');return}
let checked=0,applied=[],noOut=[];
(MASTER||[]).forEach(m=>{
 for(let d=2;d<=30;d++){
   if(sh(m,d-1)!=='M'||sh(m,d)!=='OF')continue;
   checked++;
   let off=c(m.bil,d),prev=c(m.bil,d-1),out=morning(off);
   if(!out){noOut.push({bil:m.bil,nama:m.nama,malam:d-1,off:d,off_all:sort(off.tc_all||[]).join(' '),off_in:off.tc_in||'',off_out:off.tc_out||''});return}
   let inn=nightIn(prev);
   prev.tc_in=inn;prev.tc_out=out;prev.tc_shift='SHIFT M (2300-0700) | OUT esok jatuh OFFDAY';prev.tc_audit_status=inn?'SAH':'SEMAK TC - TIADA IN';prev.tc_issue=inn?'TC malam sah: OUT pada OFFDAY esok':'OUT ada pada OFFDAY esok tetapi IN malam tiada';prev.audit_final=inn?'SAH':'SEMAK TC - TIADA IN';prev.final_audit=prev.audit_final;prev.tc_offday_out_linked=true;prev.tc_offday_out_day=d;prev.tc_audit_patch=P;
   off.tc_shift='OUT SAH HAKIKI - SHIFT MALAM SEBELUMNYA';off.tc_in='';off.tc_out=out;off.tc_audit_status='OUT SAH HAKIKI - MALAM SEBELUMNYA';off.tc_issue='Bukan OT. OUT hakiki untuk shift malam hari sebelumnya.';off.audit_final='OFF / OUT HAKIKI M SEBELUMNYA';off.final_audit='OFF / OUT HAKIKI M SEBELUMNYA';off.audit_status='OFF / OUT HAKIKI M SEBELUMNYA';off.tc_offday_out_hakiki=true;off.tc_pair_prev_day=d-1;off.tc_audit_patch=P;clean(off,'OUT hakiki shift malam sebelumnya jatuh pada OFFDAY');
   applied.push({bil:m.bil,nama:m.nama,komp:m.komp||m.kompeni,malam:d-1,offday:d,in:inn,out:out});
 }
});
save();try{if(typeof renderMaster==='function')renderMaster(null);if(typeof renderDash==='function')renderDash();if(typeof updFlags==='function')updFlags()}catch(e){}
window.TC_OFFDAY_OUT_HAKIKI_V2_REPORT={checked,applied,noOut};console.log('TC_OFFDAY_OUT_HAKIKI_V2_REPORT',window.TC_OFFDAY_OUT_HAKIKI_V2_REPORT);console.table(applied);console.log('No morning OUT found');console.table(noOut);
alert('V2 OUT hakiki OFFDAY siap. M->OFF disemak: '+checked+' | applied: '+applied.length+' | tiada OUT pagi: '+noOut.length+'. Semak Master sebelum Simpan Snapshot.');
})();