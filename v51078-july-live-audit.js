/* e-AKHA v5.10.78 — July 2026 live 7-layer audit seed */
(function(){
  'use strict';
  var PATCH='v5.10.78-JULY-LIVE-AUDIT';
  function target(){var f=document.getElementById('system')||document.querySelector('iframe');try{if(f&&f.contentWindow&&f.contentDocument)return f.contentWindow}catch(e){}return window}
  function get(W,name){try{return W.eval('typeof '+name+'!=="undefined"?'+name+':undefined')}catch(e){return W[name]}}
  function set(W,name,value){try{W.__EAKHA_51078_TMP__=value;W.eval(name+'=window.__EAKHA_51078_TMP__');delete W.__EAKHA_51078_TMP__}catch(e){try{W[name]=value}catch(_){}}}
  function clean(v){return String(v==null?'':v).trim()}
  function up(v){return clean(v).toUpperCase()}
  function shift(v){var s=up(v);if(s==='PG'||s==='PAGI'||s==='S')return'S';if(s==='PT'||s==='PETANG'||s==='P')return'P';if(s==='M'||s==='MALAM')return'M';if(s==='OFFDAY'||s==='OFF'||s==='OF'||s==='O')return'O';return s||'O'}
  function kz(v){var s=up(v);if(!s||s==='-'||s==='NULL')return'';if(s.indexOf('BELUM UPLOAD')>=0)return'BELUM UPLOAD';if(s==='HADIR'||s==='PRESENT'||s==='✓'||s==='✔'||s==='/')return'✓';if(s==='OFFDAY'||s==='OFF'||s==='OF'||s==='O')return'OF';if(s==='K'||s==='KP')return'K/P';return s}
  function isOffVal(v){return shift(v)==='O'}
  function decode(W){
    if(window.__EAKHA_JULY_LIVE_DATA__)return window.__EAKHA_JULY_LIVE_DATA__;
    var s=window.__EAKHA_JUL_LIVE_B64||''; if(!s)throw new Error('July seed B64 belum dimuatkan');
    var bin=Uint8Array.from(atob(s),function(c){return c.charCodeAt(0)}),txt='';
    if(W&&W.fflate&&W.fflate.gunzipSync)txt=new TextDecoder().decode(W.fflate.gunzipSync(bin));
    else if(window.fflate&&window.fflate.gunzipSync)txt=new TextDecoder().decode(window.fflate.gunzipSync(bin));
    else throw new Error('fflate belum sedia');
    window.__EAKHA_JULY_LIVE_DATA__=JSON.parse(txt);
    return window.__EAKHA_JULY_LIVE_DATA__;
  }
  function source(data,bil,d){return data&&data.D&&data.D[String(bil)]?data.D[String(bil)][String(d)]||{}:{}}
  function mcObj(data,bil,d,m,row){
    if(!row.mc||row.mc==='-'||row.mc==='OFFDAY')return null;
    var found=(data.mcRecords||[]).find(function(r){return String(r.BIL_OWNER)===String(bil)&&String(r.DARI||'').indexOf(String(d).padStart(2,'0')+'/07')===0});
    return {bil:+bil,nama:m.nama,jab:m.jab,komp:m.komp,d:+d,m:7,dari:(found&&found.DARI)||String(d).padStart(2,'0')+'/07',hingga:(found&&found.HINGGA)||String(d).padStart(2,'0')+'/07',hari:+((found&&found.BIL_HARI)||1),klinik:(found&&found.KLINIK)||'MC DITERIMA',siri:(found&&found.NO_RUJUKAN)||row.mc,jenis:'Julai',source:'MC PADANAN JUL'};
  }
  function hrObj(data,bil,d,m,row){
    if(!row.hrmis||row.hrmis==='-'||row.hrmis==='OFFDAY')return null;
    var type=row.hrmis.replace(/\s+SAH.*$/,'');
    return {bil:+bil,nama:m.nama,d:+d,m:7,type:type,jenis:type,status:'IMPORT JULAI',source:'HRMIS PADANAN JUL'};
  }
  function forceOff(c){
    c.kzp='OF';c.kzk='OF';c.tc_in='';c.tc_out='';c.tc_all=[];c.tc_shift='O';c.ot=false;c.hrmis='';delete c._hrmis_rec;delete c._mc;delete c.mc;
    c.note='OFFDAY HAKIKI - OT ABAIKAN';c.tc_audit_done=true;c.tc_audit_status='OFFDAY / OT ABAIKAN';c.tc_issue='OFFDAY';
    c.audit_final='LENGKAP';c.final_audit='LENGKAP';c.audit_status='LENGKAP';c.audit_class='af-off';c.audit_incomplete=false;c.audit_reason='OFFDAY_HAKIKI';c.no_perhatian=true;c.audit_ignore_attention=true;
  }
  function buildCell(data,m,d){
    var r=source(data,m.bil,d),sh=shift(r.shift),c={kzp:kz(r.kzp),kzk:kz(r.kzk),tc_in:'',tc_out:'',tc_all:[],tc_shift:sh,ot:false,hrmis:'',pengganti:false,note:'',shift_live:sh,live_shift_label:r.shift||'',audit_final:r.audit||'',final_audit:r.audit||'',audit_status:r.audit||'',audit_class:(r.audit==='LENGKAP'?'af-sah':'af-inc'),audit_incomplete:r.audit!=='LENGKAP',tc_audit_done:true,tc_audit_status:r.tc||'',tc_issue:r.tc||''};
    if(sh==='O'){forceOff(c);return c;}
    if(r.hrmis&&r.hrmis!=='-'&&r.hrmis!=='OFFDAY'){c.hrmis=r.hrmis;c._hrmis_rec=hrObj(data,m.bil,d,m,r)}
    var mc=mcObj(data,m.bil,d,m,r);if(mc)c._mc=mc;
    if(up(r.tc).indexOf('TH - TIDAK HADIR')>=0){c.tc_issue='TH - TIDAK HADIR TUGAS';c.tc_audit_status=c.tc_issue}
    return c;
  }
  function install(W){
    var MASTER=get(W,'MASTER'),D=get(W,'D');
    if(!Array.isArray(MASTER)||!D||typeof get(W,'renderMaster')!=='function')return false;
    var data=decode(W); if(W.__EAKHA_51078_APPLIED__===data.version)return true;
    set(W,'ACTIVE_MONTH',7);set(W,'ACTIVE_YEAR',2026);set(W,'daysInActiveMonth',function(){return 31});
    MASTER.splice(0,MASTER.length);data.members.forEach(function(m){MASTER.push({bil:+m.bil,jab:m.jab,komp:m.komp,nama:m.nama,mykad:'',staff_id:''})});
    try{var BK=get(W,'BK')||{};Object.keys(BK).forEach(function(k){delete BK[k]});MASTER.forEach(function(m){BK[m.bil]=m.komp});set(W,'BK',BK)}catch(e){}
    Object.keys(D).forEach(function(k){delete D[k]});
    MASTER.forEach(function(m){D[m.bil]={};for(var d=1;d<=31;d++)D[m.bil][d]=buildCell(data,m,d)});
    set(W,'MC_DATA',(data.mcRecords||[]).map(function(r){return r}));set(W,'HRMIS_DATA',(data.hrmisRecords||[]).map(function(r){return r}));set(W,'CUTI_HRMIS_PRELOAD',(data.hrmisRecords||[]).map(function(r){return r}));
    set(W,'gSh',function(bil,a,b,c){var d=(c!=null?c:(b!=null&&a>2000?b:a));return shift(source(data,bil,d).shift)});
    set(W,'getMC',function(bil,d){var m=MASTER.find(function(x){return String(x.bil)===String(bil)})||{};return mcObj(data,bil,d,m,source(data,bil,d))});
    set(W,'tcAudit',function(bil,d){var r=source(data,bil,d),sh=shift(r.shift);if(sh==='O')return{txt:'OFFDAY / OT ABAIKAN',cls:'tc-off',ok:true,inc:false};if(up(r.tc).indexOf('BELUM UPLOAD')>=0)return{txt:'BELUM UPLOAD TIMECARD JUL',cls:'tc-bp',ok:false,inc:true};if(up(r.tc).indexOf('TH - TIDAK HADIR')>=0)return{txt:'TH - TIDAK HADIR TUGAS',cls:'tc-off',ok:true,inc:false};return{txt:r.tc||'-',cls:(r.audit==='LENGKAP'?'tc-ok':'tc-bp'),ok:r.audit==='LENGKAP',inc:r.audit!=='LENGKAP'}});
    set(W,'auditFinal',function(bil,d){var r=source(data,bil,d),sh=shift(r.shift);if(sh==='O')return{txt:'LENGKAP\nOFFDAY',cls:'af-off',inc:false,reason:'OFFDAY'};if(r.audit==='LENGKAP')return{txt:'LENGKAP',cls:'af-sah',inc:false,reason:'COMPLETE'};var miss=[];if(up(r.kzp).indexOf('BELUM UPLOAD')>=0)miss.push('KZP');if(up(r.tc).indexOf('BELUM UPLOAD')>=0)miss.push('TC');if(!miss.length)miss.push('SEMAK');return{txt:'X TIDAK LENGKAP\n'+miss.join(', '),cls:'af-inc',inc:true,reason:miss.join(',')}});
    set(W,'checkLayersComplete',function(){return{complete:true,missing:[],offday:false,special:false,liveJulai:true}});
    W.__EAKHA_51078_APPLIED__=data.version;W.__EAKHA_JULY_LIVE_REPORT__=data.counts;
    try{localStorage.setItem('eakha_active_month','7');localStorage.setItem('eakha_july_2026_live_seed',JSON.stringify({version:data.version,at:new Date().toISOString(),counts:data.counts,hrmisIssues:(data.hrmisKzkIssues||[]).length}))}catch(e){}
    try{if(typeof get(W,'saveDataset')==='function')get(W,'saveDataset')('JULAI 2026 · LIVE AUDIT LENGKAP/X');if(typeof get(W,'saveMonthData')==='function')get(W,'saveMonthData')()}catch(e){}
    try{if(typeof get(W,'renderMaster')==='function')get(W,'renderMaster')(null);if(typeof get(W,'renderDash')==='function')get(W,'renderDash')();if(typeof get(W,'renderOutput')==='function')get(W,'renderOutput')('');if(typeof get(W,'updFlags')==='function')get(W,'updFlags')()}catch(e){}
    try{var b=W.document.getElementById('active-month-badge');if(b)b.textContent='Julai 2026';W.document.title='e-AKHA Vsavage — Julai 2026 · Audit Lengkap/X'}catch(e){}
    try{var t=get(W,'toast');if(typeof t==='function')t('Julai live: 52 anggota · 7 lapisan · Audit Lengkap/X aktif','ok')}catch(e){}
    try{console.log('[e-AKHA '+PATCH+']',data.counts)}catch(e){}
    return true;
  }
  var tries=0,timer=setInterval(function(){tries++;try{if(install(target())||tries>120)clearInterval(timer)}catch(e){console.warn('[51078]',e);if(tries>120)clearInterval(timer)}},400);
  try{var f=document.getElementById('system')||document.querySelector('iframe');if(f)f.addEventListener('load',function(){setTimeout(function(){install(target())},700);setTimeout(function(){install(target())},1800);setTimeout(function(){install(target())},3500)})}catch(e){}
  document.addEventListener('click',function(){setTimeout(function(){try{install(target())}catch(e){}},250)},true);
})();
