/* e-AKHA April 2026 TC night-pairing fix
   Fixes M shift only:
   - Night IN is taken from same date 22:00-23:05.
   - Night OUT is taken from next calendar date 07:00-08:00.
   - For consecutive M shifts: D1 OUT uses D2 07:xx, D2 IN uses D2 22:xx, D2 OUT uses D3 07:xx.
   - Does not touch KZ/MC/HRMIS and does not rebuild raw punches.
*/
(function(){
  'use strict';
  const PATCH='tc-fix-night-pairing-april2026-v1';
  if(!confirm('Betulkan pairing TIMECARD shift MALAM sahaja? IN malam ikut hari sama 2200-2305, OUT ikut pagi esok 0700-0800. KZ/MC/HRMIS tidak disentuh.')) return;

  function U(v){return String(v==null?'':v).toUpperCase().replace(/\s+/g,' ').trim();}
  function toMin(t){let m=String(t||'').match(/^(\d{1,2}):(\d{2})$/);return m?(+m[1])*60+(+m[2]):null;}
  function between(t,a,b){let x=toMin(t);return x!=null&&x>=a&&x<=b;}
  function onlyTimes(arr){return (Array.isArray(arr)?arr:[]).map(String).filter(t=>/^\d{1,2}:\d{2}$/.test(t)).sort((a,b)=>toMin(a)-toMin(b));}
  function nearest(arr,target){arr=onlyTimes(arr);if(!arr.length)return '';return arr.slice().sort((a,b)=>Math.abs(toMin(a)-target)-Math.abs(toMin(b)-target))[0]||'';}
  function firstIn(arr,a,b){return onlyTimes(arr).filter(t=>between(t,a,b))[0]||'';}
  function shiftOf(m,d,c){
    let s='';
    try{s=U(typeof gSh==='function'?gSh(m.bil,d):'')}catch(e){}
    if(!s&&c)s=U(c.shift||c.jadual||c.tc_shift||'');
    if(/MALAM|NIGHT|\bM\b|2300\s*[-–]\s*0700/.test(s))return 'M';
    return s;
  }
  function getCell(b,d){if(!D[b])D[b]={};if(!D[b][d])D[b][d]={};return D[b][d];}
  function daysN(){try{return typeof daysInActiveMonth==='function'?daysInActiveMonth():30}catch(e){return 30}}
  if(typeof MASTER==='undefined'||typeof D==='undefined'){alert('MASTER/D tidak dijumpai. Buka Master File April dahulu.');return;}
  try{localStorage.setItem('eakha_backup_before_'+PATCH+'_'+Date.now(),JSON.stringify(D));}catch(e){}

  const report=[];
  let fixed=0, blankOut=0, nightCells=0;
  (MASTER||[]).forEach(m=>{
    for(let d=1;d<=daysN();d++){
      let c=getCell(m.bil,d);
      if(shiftOf(m,d,c)!=='M')continue;
      nightCells++;
      let today=onlyTimes(c.tc_all||[]);
      let nextC=(D[m.bil]&&D[m.bil][d+1])?D[m.bil][d+1]:null;
      let next=onlyTimes(nextC&&nextC.tc_all||[]);

      // Correct rule: 07:xx on current date belongs to previous night, not this date's IN.
      let oldIn=c.tc_in||'', oldOut=c.tc_out||'';
      let inn=firstIn(today,22*60,23*60+5) || firstIn(today,21*60+30,23*60+59) || nearest(today.filter(t=>toMin(t)>=20*60),23*60);
      let out=firstIn(next,7*60,8*60) || firstIn(next,6*60+30,8*60+30) || nearest(next.filter(t=>toMin(t)>=6*60&&toMin(t)<=9*60),7*60);

      // If only an early-morning punch exists on this date and no night IN, keep IN blank.
      // If OUT not found on next day, keep OUT blank for audit warning.
      c.tc_in=inn||'';
      c.tc_out=out||'';
      c.tc_shift='SHIFT M (2300-0700) | IN hari sama 2200-2305, OUT esok 0700-0800';
      c.tc_night_pairing_fixed=true;
      c.tc_pairing_patch=PATCH;
      c.tc_pairing_old={in:oldIn,out:oldOut};
      c.tc_pairing_src={today:today,next:next};
      if(!out)blankOut++;
      if(oldIn!==c.tc_in||oldOut!==c.tc_out){fixed++; if(report.length<80)report.push({bil:m.bil,nama:m.nama,d,oldIn,oldOut,newIn:c.tc_in,newOut:c.tc_out,today:today.join(' '),next:next.join(' ')});}
    }
  });

  try{
    localStorage.setItem('eakha_data',JSON.stringify(D));
    let snap={}; try{snap=JSON.parse(localStorage.getItem('eakha_dataset_2026_4')||'{}')}catch(e){}
    snap.tahun=2026; snap.bulan=4; snap.D=D; snap.savedAt=new Date().toISOString(); snap.reason='TC NIGHT PAIRING FIX APRIL 2026';
    localStorage.setItem('eakha_dataset_2026_4',JSON.stringify(snap));
    localStorage.setItem('eakha_last_dataset_key','eakha_dataset_2026_4');
  }catch(e){console.warn(e)}
  try{if(typeof renderMaster==='function')renderMaster(null); if(typeof renderDash==='function')renderDash(); if(typeof updFlags==='function')updFlags();}catch(e){}
  window.TC_NIGHT_PAIRING_FIX_REPORT_APRIL_2026={nightCells,fixed,blankOut,report};
  console.log('TC_NIGHT_PAIRING_FIX_REPORT_APRIL_2026',window.TC_NIGHT_PAIRING_FIX_REPORT_APRIL_2026);
  console.table(report);
  alert('Night pairing siap. Shift M disemak: '+nightCells+' | berubah: '+fixed+' | OUT kosong: '+blankOut+'. Semak Master dahulu, jangan Simpan Snapshot jika salah.');
})();
