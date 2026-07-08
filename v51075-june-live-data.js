/* e-AKHA Jun 2026 live master data seed loader — generated from confirmed 7-lapis workbook */
(function(){
  'use strict';
  function decodeData(W){
    var s=window.__EAKHA_JUN_LIVE_B64||'';
    s=s.replace('207guBUS8DU','207guBUSO8DU');
    if(!s) throw new Error('Data B64 Jun belum dimuatkan');
    var bin=Uint8Array.from(atob(s),function(c){return c.charCodeAt(0)});
    var txt='';
    if(W&&W.fflate&&W.fflate.gunzipSync){txt=new TextDecoder().decode(W.fflate.gunzipSync(bin));}
    else if(window.fflate&&window.fflate.gunzipSync){txt=new TextDecoder().decode(window.fflate.gunzipSync(bin));}
    else throw new Error('fflate belum sedia untuk live data Jun');
    return JSON.parse(txt);
  }
  function installBase(W,data){
    if(!W||W.__EAKHA_JUN_2026_LIVE_APPLIED__===data.version)return true;
    function get(name){try{return W.eval('typeof '+name+'!=="undefined"?'+name+':undefined')}catch(e){return W[name]}}
    function set(name,value){try{W.__EAKHA_TMP_SET__=value;W.eval(name+'=window.__EAKHA_TMP_SET__');delete W.__EAKHA_TMP_SET__;}catch(e){try{W[name]=value}catch(_){}}return get(name)||value}
    var MASTER=get('MASTER'),D=get('D');
    if(!Array.isArray(MASTER)||!D||typeof get('renderMaster')!=='function')return false;
    function pad(n){return String(n).padStart(2,'0')}
    function cleanText(v){return String(v==null?'':v).trim()}
    function upper(v){return cleanText(v).toUpperCase()}
    function mapKz(v){var s=upper(v);if(!s||s==='-'||s==='NULL')return '';if(s==='HADIR'||s==='✓'||s==='✔'||s==='/'||s==='PRESENT')return '✓';if(s==='OFFDAY'||s==='OFF'||s==='OF')return 'OF';if(s==='LEWAT'||s==='LATE')return 'L';if(s==='K'||s==='KP')return 'K/P';if(s==='CUTI REHAT')return 'CR';if(s==='CUTI KECEMASAN')return 'EL';if(s==='CUTI TANPA REKOD')return 'CTR';if(s==='CUTI BERSALIN')return 'CB';return s}
    function mapShift(v){var s=upper(v);if(s==='PG'||s==='PAGI'||s==='S')return 'S';if(s==='PT'||s==='PETANG'||s==='P')return 'P';if(s==='M'||s==='MALAM')return 'M';if(s==='OFFDAY'||s==='OFF'||s==='O'||s==='OF')return 'O';return s||'O'}
    function blank(){return{kzp:'',kzk:'',tc_in:'',tc_out:'',tc_all:[],tc_shift:'',ot:false,hrmis:'',pengganti:false,note:'',tc_audit_done:true}}
    function parseTC(raw){var s=upper(raw),c={tc_in:'',tc_out:'',tc_all:[],tc_shift:'',ot:false,note:'',tc_audit_done:true,tc_raw:cleanText(raw)};c.tc_shift=mapShift((s.match(/^(PG|PT|M|OFFDAY|OFF)\b/)||[])[1]||'');if(/OFF\s*OT/.test(s)){c.ot=true;c.tc_in='00:00';c.tc_all=['00:00'];return c}if(!s||s==='OFF'||s==='OFFDAY')return c;if(/ABSENT|TIADA DATA PDF|NO DATA/.test(s)){c.note=s;return c}var pair=s.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);if(pair){c.tc_in=pair[1];c.tc_out=pair[2];c.tc_all=[pair[1],pair[2]]}var single=s.match(/\b(IN|OUT)\s+(\d{1,2}:\d{2})\s+SINGLE/);if(single){if(single[1]==='IN')c.tc_in=single[2];else c.tc_out=single[2];c.tc_all=[single[2]]}if(!c.tc_all.length){var times=s.match(/\d{1,2}:\d{2}/g)||[];if(times.length){c.tc_all=times.slice();c.tc_in=times[0]||'';c.tc_out=times[1]||''}}var flags=[];if(/LEWAT/.test(s))flags.push('LEWAT');if(/SINGLE/.test(s))flags.push('SINGLE PUNCH');if(/ABSENT/.test(s))flags.push('ABSENT');c.note=flags.join('; ');return c}
    function auditClass(txt){var s=upper(txt),inc=false,cls='af-inc';if(!s)return{txt:'-',cls:'af-inc',inc:true};if(s==='OFFDAY'||s==='OFF'||s==='OFF OT'){cls='af-off';inc=false}else if(s==='SAH'){cls='af-sah';inc=false}else if(s.indexOf('SAH MC')>=0||s.indexOf('MC SAH')>=0){cls='af-mc';inc=false}else if(s.indexOf('SAH CR')>=0||s.indexOf('CR SAH')>=0||s.indexOf('HRMIS SAH')>=0||s.indexOf('EL SAH')>=0||s.indexOf('CTR SAH')>=0||s.indexOf('CB SAH')>=0){cls='af-cr';inc=false}else if(s==='TH'||s.indexOf('TIDAK HADIR')>=0){cls='af-tt';inc=false}else if(s==='TT'||s.indexOf('TAHAN TUGAS')>=0){cls='af-tt';inc=false}else if(s.indexOf('ABS')>=0){cls='af-abs';inc=true}else if(s.indexOf('LEWAT')>=0||s.indexOf('SINGLE')>=0||s.indexOf('PERLU')>=0||s.indexOf('SEMAK')>=0||s.indexOf('TIADA')>=0||s.indexOf('TM')>=0){cls='af-warn';inc=true}return{txt:cleanText(txt),cls:cls,inc:inc}}
    function mcFor(bil,d){for(var i=0;i<(data.mcExpanded||[]).length;i++){var r=data.mcExpanded[i];if(+r.bil===+bil&&+r.d===+d)return Object.assign({},r)}return null}
    function hrFor(bil,d){for(var i=0;i<(data.hrmisExpanded||[]).length;i++){var r=data.hrmisExpanded[i];if(+r.bil===+bil&&+r.d===+d)return Object.assign({},r)}return null}
    try{set('ACTIVE_MONTH',6);set('ACTIVE_YEAR',2026);set('daysInActiveMonth',function(){return 30})}catch(e){}
    var newMaster=data.members.map(function(m){return{bil:+m.bil,jab:m.jab,komp:m.komp,nama:m.nama,mykad:'',staff_id:m.staff_id||''}});MASTER.splice(0,MASTER.length);newMaster.forEach(function(m){MASTER.push(m)});
    try{var BK=get('BK')||{};Object.keys(BK).forEach(function(k){delete BK[k]});MASTER.forEach(function(m){BK[m.bil]=m.komp});set('BK',BK)}catch(e){}
    Object.keys(D).forEach(function(k){delete D[k]});
    (data.members||[]).forEach(function(m){D[m.bil]={};for(var d=1;d<=30;d++){var src=(data.D[String(m.bil)]||{})[String(d)]||{},cell=blank(),tc=parseTC(src.tc);cell.kzp=mapKz(src.kzp);cell.kzk=mapKz(src.kzk);Object.assign(cell,tc);cell.shift_live=mapShift(src.shift);cell.live_shift_label=src.shift||'';cell.live_audit_final=src.audit||'';var mc=mcFor(m.bil,d);if(mc){cell._mc=mc;cell.mc=mc}var hr=hrFor(m.bil,d);if(hr){cell.hrmis=mapKz(hr.type||src.hrmis);cell._hrmis_rec=hr}else if(src.hrmis){cell.hrmis=mapKz(src.hrmis);cell._hrmis_rec={bil:m.bil,nama:m.nama,d:d,m:6,type:cell.hrmis,jenis:cell.hrmis,status:'IMPORT'}}if(src.mc&&!cell._mc){cell._mc={bil:m.bil,nama:m.nama,jab:m.jab,komp:m.komp,d:d,m:6,dari:pad(d)+'/06',hingga:pad(d)+'/06',hari:1,klinik:'MC DITERIMA',siri:'-',jenis:'Bulan Ini',source:'MC DITERIMA'}}D[m.bil][d]=cell}});
    try{set('MC_DATA',(data.mcExpanded||[]).map(function(x){return Object.assign({},x)}));set('HRMIS_DATA',(data.hrmisExpanded||[]).map(function(x){return Object.assign({},x)}));set('CUTI_HRMIS_PRELOAD',(data.hrmisExpanded||[]).map(function(x){return Object.assign({},x)}))}catch(e){}
    try{set('gSh',function(bil,a,b,c){var d=(c!=null?c:(b!=null&&a>2000?b:a));var row=(data.D[String(bil)]||{})[String(d)]||{};return mapShift(row.shift||'O')})}catch(e){}
    try{set('getMC',function(bil,d){return mcFor(bil,d)||(D[bil]&&D[bil][d]&&D[bil][d]._mc)||null})}catch(e){}
    try{set('checkLayersComplete',function(bil,d){var sh=((data.D[String(bil)]||{})[String(d)]||{}).shift;return{complete:true,missing:[],offday:mapShift(sh)==='O',special:false,live:true}})}catch(e){}
    try{set('auditFinal',function(bil,d){var src=(data.D[String(bil)]||{})[String(d)]||{};return auditClass(src.audit||'')})}catch(e){}
    W.__EAKHA_JUN_2026_LIVE_APPLIED__=data.version;
    try{localStorage.setItem('eakha_active_month','6');localStorage.setItem('eakha_data',JSON.stringify(D));localStorage.setItem('eakha_jun_2026_live_seed',JSON.stringify({version:data.version,at:new Date().toISOString(),members:data.members.length,mc:(data.mcExpanded||[]).length,hrmis:(data.hrmisExpanded||[]).length}))}catch(e){}
    try{if(typeof get('saveDataset')==='function')get('saveDataset')('JUN 2026 · LIVE 7 LAPIS');if(typeof get('saveMonthData')==='function')get('saveMonthData')()}catch(e){}
    try{if(typeof get('renderMaster')==='function')get('renderMaster')(null);if(typeof get('renderDash')==='function')get('renderDash')();if(typeof get('renderOutput')==='function')get('renderOutput')('');if(typeof get('updFlags')==='function')get('updFlags')()}catch(e){}
    try{var b=W.document.getElementById('active-month-badge');if(b)b.textContent='Jun 2026'}catch(e){}
    try{if(typeof get('toast')==='function')get('toast')('Live data Jun 2026 dimasukkan: 52 anggota · 6 lapisan · Audit Final aktif','ok')}catch(e){}
    try{console.log('[e-AKHA Jun live]',data.version,{members:data.members.length,mc:(data.mcExpanded||[]).length,hrmis:(data.hrmisExpanded||[]).length})}catch(e){}
    return true;
  }
  var LIVE_CACHE=null;
  function targetWindow(){var f=document.getElementById('system')||document.querySelector('iframe');try{if(f&&f.contentWindow&&f.contentDocument)return f.contentWindow}catch(e){}return window}
  function boot(){try{var W=targetWindow();if(!LIVE_CACHE)LIVE_CACHE=decodeData(W);window.__EAKHA_JUN_2026_LIVE_DATA__=LIVE_CACHE;return installBase(W,LIVE_CACHE)}catch(e){console.warn('[e-AKHA Jun live seed]',e);return false}}
  var tries=0,timer=setInterval(function(){tries++;if(boot()||tries>120)clearInterval(timer)},500);
  try{var f=document.getElementById('system')||document.querySelector('iframe');if(f)f.addEventListener('load',function(){setTimeout(boot,650);setTimeout(boot,1800)})}catch(e){}
  document.addEventListener('click',function(){setTimeout(boot,350)},true);
})();
