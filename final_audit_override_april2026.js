/* e-AKHA April 2026 FINAL AUDIT OVERRIDE
   Rules requested:
   - Azura = Cuti Bersalin, no perhatian flag.
   - Timecard problem 27-31, no perhatian flag.
   - If KZ Penyelia/Koperal has data, fill Audit Final from KZ.
   - If MC exists, Audit Final = MC SAH.
   - If HRMIS leave exists, Audit Final = CR/EL/CTR/CB SAH.
   - TH/TT/Tahan Tugas no ABS/perhatian flag.
*/
(function(){
'use strict';
const P='final-audit-override-april2026-v1';
if(!confirm('Apply FINAL audit override April? Azura CB, TC problem 27-31 no flag, MC=MC SAH, HRMIS=CR/EL/CTR/CB SAH, KZ data digunakan.'))return;
const U=v=>String(v==null?'':v).toUpperCase().replace(/MOHAMMAD|MUHAMMAD|MOHAMED|MOHAMMAAD/g,'MOHAMAD').replace(/\bMUHD\b/g,'MOHD').replace(/[^A-Z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();
const days=()=>{try{return typeof daysInActiveMonth==='function'?daysInActiveMonth():30}catch(e){return 30}};
const C=(b,d)=>{if(!D[b])D[b]={};if(!D[b][d])D[b][d]={};return D[b][d]};
const blank=v=>{let x=U(v);return !x||x==='-'||x==='TM'||x==='TIADA MAKLUMAN'||x==='T M'||x==='N A'};
const hasTC=c=>!!(c&&(c.tc_in||c.tc_out||(Array.isArray(c.tc_all)&&c.tc_all.length)));
const hasMC=c=>!!(c&&(c._mc||c.mc_status_51038||c.mc_rule_51038||U(c.mc)==='MC'||U(c.mc_diterima)==='MC'));
const hasHR=c=>{let h=U(c&&c.hrmis);return h&&h!=='-'&&h!=='TM'?h:''};
const isTH=c=>/\bTH\b|\bTT\b|TAHAN TUGAS/.test(U([c&&c.kzp,c&&c.kzk,c&&c.audit_final,c&&c.audit,c&&c.note].join(' ')));
const isAzura=m=>/AZURA/.test(U(m&&m.nama));
function cleanFlags(c,reason){c.no_perhatian=true;c.audit_ignore_attention=true;c.attention_suppressed_reason=reason;if(Array.isArray(c.flags))c.flags=c.flags.filter(f=>!/ABS|TIADA PUNCH|SEMAK TC|SEMAK TIMECARD|TIDAK HADIR|TIADA IN|TIADA OUT/i.test(String(f)));}
function kzVal(c){let a=U(c.kzp),b=U(c.kzk),x=!blank(a)?a:(!blank(b)?b:'');if(!x)return'';if(/HADIR|✓|CHECK/.test(x))return'HADIR';if(/MC|SAKIT/.test(x))return'MC';if(/CR|CUTI REHAT/.test(x))return'CR';if(/EL|KECEMASAN/.test(x))return'EL';if(/CTR|TANPA REKOD/.test(x))return'CTR';if(/CB|BERSALIN/.test(x))return'CB';if(/LEWAT|\bL\b/.test(x))return'LEWAT';if(/TH|TT|TAHAN TUGAS/.test(x))return'TH';if(/OFF|OF|REHAT/.test(x))return'OF';if(/ABS|TIDAK HADIR/.test(x))return'ABS';return x;}
function hrStatus(h){h=U(h);if(/BERSALIN|\bCB\b/.test(h))return'CB SAH';if(/KECEMASAN|\bEL\b/.test(h))return'EL SAH';if(/TANPA REKOD|\bCTR\b/.test(h))return'CTR SAH';return'CR SAH';}
function setFinal(c,status,reason,src){c.audit_final=status;c.audit_final_override=status;c.final_audit=status;c.audit_status=status;c.audit_reason=reason||'';c.audit_source=src||P;c.audit_patch=P;}
if(typeof MASTER==='undefined'||typeof D==='undefined'){alert('Buka Master File April dahulu.');return;}
try{localStorage.setItem('eakha_backup_before_'+P+'_'+Date.now(),JSON.stringify(D))}catch(e){}
let count={total:0,azura:0,tcProblem:0,mc:0,hrmis:0,kz:0,th:0,absSuppressed:0},sample=[];
(MASTER||[]).forEach(m=>{for(let d=1;d<=days();d++){let c=C(m.bil,d),kv=kzVal(c),hr=hasHR(c),status='',reason='',src='';count.total++;
  if(isAzura(m)){status='CB SAH';reason='Azura cuti bersalin - tidak flag perhatian';src='AZURA_CB';cleanFlags(c,reason);count.azura++;}
  else if(isTH(c)||kv==='TH'){status='TH/TT - ABAIKAN';reason='Tahan tugas - tidak flag perhatian';src='TH_TT';cleanFlags(c,reason);count.th++;}
  else if(hasMC(c)||kv==='MC'){status='MC SAH';reason='MC ada dalam Master/KZ';src='MC';cleanFlags(c,reason);count.mc++;}
  else if(hr){status=hrStatus(hr);reason='Cuti HRMIS ada dalam Master';src='HRMIS';cleanFlags(c,reason);count.hrmis++;}
  else if(kv&&kv!=='TM'){status=(kv==='HADIR')?'SAH':(kv==='CR'?'CR SAH':kv==='EL'?'EL SAH':kv==='CTR'?'CTR SAH':kv==='CB'?'CB SAH':kv==='OF'?'OFF':kv);reason='Diisi berdasarkan KZ Penyelia/Koperal';src='KZ';if(['CR SAH','EL SAH','CTR SAH','CB SAH','OFF','TH/TT - ABAIKAN'].includes(status))cleanFlags(c,reason);count.kz++;}
  else if(d>=27&&d<=31){status='TIMEKAD PROBLEM - ABAIKAN';reason='Tarikh 27-31 timecard problem, tidak flag perhatian';src='TC_PROBLEM_27_31';cleanFlags(c,reason);count.tcProblem++;}
  else if(!hasTC(c)){status='ABS - SEMAK';reason='Tiada TC/KZ/MC/HRMIS';src='AUDIT';}
  else {status=c.tc_audit_status||'SEMAK TIMECARD';reason=c.tc_issue||'Semak TC';src='TC_AUDIT';}
  setFinal(c,status,reason,src);
  if(status.includes('ABS')&&(isTH(c)||isAzura(m)||d>=27)){cleanFlags(c,'Suppress ABS flag');count.absSuppressed++;}
  if(sample.length<100&&(src!=='TC_AUDIT'||status.includes('ABS')||status.includes('PROBLEM')))sample.push({bil:m.bil,nama:m.nama,d,status,src,kzp:c.kzp||'',kzk:c.kzk||'',tc_in:c.tc_in||'',tc_out:c.tc_out||'',hrmis:c.hrmis||'',mc:!!c._mc});
}});
try{localStorage.setItem('eakha_data',JSON.stringify(D));let snap={};try{snap=JSON.parse(localStorage.getItem('eakha_dataset_2026_4')||'{}')}catch(e){}snap.tahun=2026;snap.bulan=4;snap.D=D;snap.savedAt=new Date().toISOString();snap.reason='FINAL AUDIT OVERRIDE APRIL 2026';localStorage.setItem('eakha_dataset_2026_4',JSON.stringify(snap));localStorage.setItem('eakha_last_dataset_key','eakha_dataset_2026_4')}catch(e){console.warn(e)}
try{if(typeof renderMaster==='function')renderMaster(null);if(typeof renderDash==='function')renderDash();if(typeof updFlags==='function')updFlags()}catch(e){}
window.FINAL_AUDIT_OVERRIDE_REPORT_APRIL_2026={count,sample};console.log('FINAL_AUDIT_OVERRIDE_REPORT_APRIL_2026',window.FINAL_AUDIT_OVERRIDE_REPORT_APRIL_2026);console.table(count);console.table(sample);alert('Final audit override siap. Azura CB:'+count.azura+' | TC problem 27-31:'+count.tcProblem+' | MC SAH:'+count.mc+' | HRMIS sah:'+count.hrmis+' | KZ filled:'+count.kz+' | TH ignore:'+count.th+'. Semak Master/Output Perhatian sebelum Simpan Snapshot.');
})();