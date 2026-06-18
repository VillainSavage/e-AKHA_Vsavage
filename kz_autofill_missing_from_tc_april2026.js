/* e-AKHA April 2026 KZ autofill helper
   Purpose: lengkapkan KZ Penyelia/Koperal yang kosong/TM sahaja, tanpa sentuh TIMECARD/MC/HRMIS.
   Fallback order: existing KZ source > TH/TT existing > MC > HRMIS > OFF > TC present = HADIR > no TC = TIADA MAKLUMAN.
*/
(function(){
  'use strict';
  const PATCH='kz-autofill-missing-from-tc-april2026-v1';
  if(!confirm('Lengkapkan KZ Penyelia + KZ Koperal yang kosong/TM sahaja? Data TIMECARD/MC/HRMIS tidak disentuh. Semak Master sebelum Simpan Snapshot.')) return;

  function U(v){return String(v==null?'':v).toUpperCase().replace(/\s+/g,' ').trim();}
  function daysN(){try{return typeof daysInActiveMonth==='function'?daysInActiveMonth():30}catch(e){return 30}}
  function sh(m,d){try{return U(typeof gSh==='function'?gSh(m.bil,d):'')}catch(e){return ''}}
  function isOff(s){return /\bOF\b|OFF|OFFDAY|REHAT/.test(U(s));}
  function isBlankLike(v){let x=U(v);return !x||x==='-'||x==='TM'||x==='TIADA MAKLUMAN'||x==='T/M'||x==='N/A';}
  function isTH(v){let x=U(v);return x==='TH'||x==='TT'||x.includes('TAHAN TUGAS');}
  function hasTC(c){return !!(c&&(c.tc_in||c.tc_out||(Array.isArray(c.tc_all)&&c.tc_all.length)));}
  function mcStatus(c){return !!(c&&(c._mc||c.mc_status_51038||c.mc_rule_51038||U(c.mc)==='MC'||U(c.mc_diterima)==='MC'));}
  function hrStatus(c){let h=U(c&&c.hrmis); if(!h)return ''; if(h.includes('CUTI REHAT'))return 'CR'; if(h.includes('KECEMASAN'))return 'EL'; if(h.includes('TANPA REKOD'))return 'CTR'; if(['CR','EL','CTR','CB','CBR','CG','K'].includes(h))return h; return h;}
  function fallback(m,d,c){
    if(isTH(c.kzp)||isTH(c.kzk)) return 'TH';
    if(mcStatus(c)) return 'MC';
    let h=hrStatus(c); if(h) return h;
    if(isOff(sh(m,d))) return 'OF';
    if(hasTC(c)) return 'HADIR';
    return 'TM';
  }
  function setIfNeed(c,key,val,log){
    let old=c[key];
    if(isBlankLike(old)){
      c[key]=val;
      c[key+'_autofill_'+PATCH]=true;
      c[key+'_before_'+PATCH]=old||'';
      log[key]++;
      return true;
    }
    return false;
  }

  if(typeof MASTER==='undefined'||typeof D==='undefined'){alert('MASTER/D tidak dijumpai. Buka Master File April dahulu.');return;}
  try{localStorage.setItem('eakha_backup_before_'+PATCH+'_'+Date.now(),JSON.stringify(D));}catch(e){}

  const log={kzp:0,kzk:0,days:0,hadir:0,mc:0,hrmis:0,off:0,tm:0,th:0};
  const sample=[];
  (MASTER||[]).forEach(m=>{
    for(let d=1;d<=daysN();d++){
      if(!D[m.bil])D[m.bil]={};
      if(!D[m.bil][d])D[m.bil][d]={};
      let c=D[m.bil][d];
      let val=fallback(m,d,c);
      if(val==='HADIR')log.hadir++; else if(val==='MC')log.mc++; else if(['CR','EL','CTR','CB','CBR','CG','K'].includes(val))log.hrmis++; else if(val==='OF')log.off++; else if(val==='TH')log.th++; else log.tm++;
      let a=setIfNeed(c,'kzp',val,log), b=setIfNeed(c,'kzk',val,log);
      if(a||b){log.days++; if(sample.length<30)sample.push({bil:m.bil,nama:m.nama,d,status:val,kzp:a,kzk:b,tc_in:c.tc_in||'',tc_out:c.tc_out||'',hrmis:c.hrmis||'',mc:!!c._mc});}
    }
  });

  try{
    localStorage.setItem('eakha_data',JSON.stringify(D));
    let snap={}; try{snap=JSON.parse(localStorage.getItem('eakha_dataset_2026_4')||'{}')}catch(e){}
    snap.tahun=2026; snap.bulan=4; snap.D=D; snap.savedAt=new Date().toISOString(); snap.reason='KZ AUTOFILL MISSING FROM TC APRIL 2026';
    localStorage.setItem('eakha_dataset_2026_4',JSON.stringify(snap));
    localStorage.setItem('eakha_last_dataset_key','eakha_dataset_2026_4');
  }catch(e){console.warn(e)}

  try{if(typeof renderMaster==='function')renderMaster(null); if(typeof renderDash==='function')renderDash(); if(typeof updFlags==='function')updFlags();}catch(e){}
  window.KZ_AUTOFILL_REPORT_APRIL_2026={log,sample};
  console.log('KZ_AUTOFILL_REPORT_APRIL_2026',window.KZ_AUTOFILL_REPORT_APRIL_2026);
  console.table(sample);
  alert('KZ autofill siap. KZP diisi: '+log.kzp+' | KZK diisi: '+log.kzk+' | Semak Master File dulu. JANGAN Simpan Snapshot jika salah.');
})();
