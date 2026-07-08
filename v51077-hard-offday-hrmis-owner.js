/* e-AKHA v5.10.77 — HARD OFFDAY HAKIKI + HRMIS owner guard */
(function(){
  'use strict';
  var PATCH='v5.10.77-HARD-OFFDAY-HRMIS-OWNER';
  function norm(v){return String(v==null?'':v).toUpperCase().trim()}
  function key(v){return norm(v).replace(/PENAMA/g,'').replace(/MOHAMMAD|MUHAMMAD|MOHAMED/g,'MOHAMAD').replace(/\bBIN\b|\bBINTI\b|\bBT\b|\bA\/L\b|\bAL\b/g,' ').replace(/[^A-Z0-9]+/g,' ').replace(/\s+/g,' ').trim()}
  function isOff(v){var s=norm(v);return s==='O'||s==='OF'||s==='OFF'||s==='OFFDAY'||s==='REHAT'}
  function toShift(v){var s=norm(v);if(s==='PG'||s==='PAGI'||s==='S')return'S';if(s==='PT'||s==='PETANG'||s==='P')return'P';if(s==='M'||s==='MALAM')return'M';if(isOff(s))return'O';return s||''}
  function target(){var f=document.getElementById('system')||document.querySelector('iframe');try{if(f&&f.contentWindow&&f.contentDocument)return f.contentWindow}catch(e){}return window}
  function get(W,name){try{return W.eval('typeof '+name+'!=="undefined"?'+name+':undefined')}catch(e){return W[name]}}
  function set(W,name,value){try{W.__EAKHA_51077_TMP__=value;W.eval(name+'=window.__EAKHA_51077_TMP__');delete W.__EAKHA_51077_TMP__}catch(e){try{W[name]=value}catch(_){}}}
  function liveData(){return window.__EAKHA_JUN_2026_LIVE_DATA__||null}
  function sourceRow(bil,d){var data=liveData();return data&&data.D&&data.D[String(bil)]?data.D[String(bil)][String(d)]||null:null}
  function sourceShift(W,bil,d,c){var r=sourceRow(bil,d);if(r&&r.shift)return toShift(r.shift);c=c||{};if(c.shift_live||c.live_shift_label||c.shift)return toShift(c.shift_live||c.live_shift_label||c.shift);try{var g=get(W,'gSh');if(typeof g==='function'){var s=g(Number(bil),Number(d));if(s)return toShift(s)}}catch(e){}return''}
  function ownerNameByBil(bil){var data=liveData();var m=data&&data.members?(data.members||[]).find(function(x){return String(x.bil)===String(bil)}):null;return m?m.nama:''}
  function ownerOk(bil,rec){if(!rec)return false;var o=ownerNameByBil(bil);if(!o)return true;var rn=rec.nama||rec.name||rec.owner_name||'';return !rn||key(rn)===key(o)}
  function forceOffCell(c,W,bil,d){
    c.shift_live='OFFDAY';c.live_shift_label='OFFDAY';c.shift='OFFDAY';
    c.kzp='OF';c.kzk='OF';
    c.tc_in='';c.tc_out='';c.tc_all=[];c.tc_shift='O';c.ot=false;
    c.hrmis='';delete c._hrmis_rec;delete c.hrmis_rec;
    delete c._mc;delete c.mc;
    c.mc_ignored_offday=true;c.hrmis_ignored_offday=true;c.ot_ignored=true;c.offday_ot_ignored=true;
    c.note='OFFDAY HAKIKI - ABAIKAN OT/HRMIS/MC';
    c.tc_audit_done=true;c.tc_audit_status='OFFDAY';c.tc_issue='OFFDAY';
    c.audit_final='OFFDAY';c.final_audit='OFFDAY';c.audit_status='OFFDAY';c.audit_class='af-off';c.audit_incomplete=false;c.audit_reason='OFFDAY_HAKIKI';
    c.no_perhatian=true;c.audit_ignore_attention=true;c.attention_suppressed_reason='OFFDAY HAKIKI: OT, punch, HRMIS dan MC diabaikan; tidak dikira hadir';
  }
  function dedup(MASTER,D){
    var seen={},unique=[],removed=0;
    MASTER.forEach(function(m){var k=key(m.nama);if(k.indexOf('ASREE')>=0){if(seen[k]){removed++;try{delete D[m.bil]}catch(e){};return}seen[k]=1}unique.push(m)});
    if(unique.length!==MASTER.length)MASTER.splice.apply(MASTER,[0,MASTER.length].concat(unique));
    return removed;
  }
  function enforce(W){
    var MASTER=get(W,'MASTER'),D=get(W,'D');
    if(!Array.isArray(MASTER)||!D)return null;
    var removed=dedup(MASTER,D),forced=0,hrOwnerRejected=0;
    MASTER.forEach(function(m){if(!D[m.bil])D[m.bil]={};for(var d=1;d<=30;d++){var c=D[m.bil][d]||(D[m.bil][d]={});if(sourceShift(W,m.bil,d,c)==='O'){forceOffCell(c,W,m.bil,d);forced++;continue}if(c._hrmis_rec&&!ownerOk(m.bil,c._hrmis_rec)){delete c._hrmis_rec;c.hrmis='';hrOwnerRejected++}if(c.hrmis&&c._hrmis_rec&&!ownerOk(m.bil,c._hrmis_rec)){c.hrmis='';delete c._hrmis_rec;hrOwnerRejected++}}});
    try{localStorage.setItem('eakha_51077_hard_offday',JSON.stringify({at:new Date().toISOString(),members:MASTER.length,asree_removed:removed,offday_forced:forced,hrmis_owner_rejected:hrOwnerRejected}))}catch(e){}
    W.__EAKHA_51077_REPORT__={patch:PATCH,members:MASTER.length,asree_removed:removed,offday_forced:forced,hrmis_owner_rejected:hrOwnerRejected,at:new Date().toISOString()};
    return W.__EAKHA_51077_REPORT__;
  }
  function wrap(W,name){
    var cur=get(W,name);if(typeof cur!=='function')return;
    var origName='__EAKHA_51077_ORIG_'+name;
    if(!W[origName])W[origName]=cur;
    if(cur.__eakha51077)return;
    var wrapped=function(){enforce(W);var r=W[origName].apply(W,arguments);enforce(W);return r};
    wrapped.__eakha51077=true;
    set(W,name,wrapped);
  }
  function install(W){
    var MASTER=get(W,'MASTER'),D=get(W,'D');
    if(!Array.isArray(MASTER)||!D||typeof get(W,'renderMaster')!=='function')return false;
    if(!W.__EAKHA_51077_ORIG_gSh){W.__EAKHA_51077_ORIG_gSh=get(W,'gSh')}
    var gsh=function(bil,a,b,c){var d=(c!=null?c:(b!=null&&a>2000?b:a));var sh=sourceShift(W,bil,d,(D[bil]&&D[bil][d])||{});if(sh)return sh;var o=W.__EAKHA_51077_ORIG_gSh;return typeof o==='function'?o.apply(W,arguments):'O'};gsh.__eakha51077=true;set(W,'gSh',gsh);
    if(!W.__EAKHA_51077_ORIG_auditFinal)W.__EAKHA_51077_ORIG_auditFinal=get(W,'auditFinal');
    var af=function(bil,d){var c=(D[bil]&&D[bil][d])||{};if(sourceShift(W,bil,d,c)==='O')return{txt:'OFFDAY',cls:'af-off',inc:false,reason:'OFFDAY_HAKIKI'};var o=W.__EAKHA_51077_ORIG_auditFinal;return typeof o==='function'?o(Number(bil),Number(d)):{txt:c.audit_status||'SEMAK',cls:c.audit_class||'af-inc',inc:!!c.audit_incomplete}};af.__eakha51077=true;set(W,'auditFinal',af);
    if(!W.__EAKHA_51077_ORIG_tcAudit)W.__EAKHA_51077_ORIG_tcAudit=get(W,'tcAudit');
    var tc=function(bil,d){var c=(D[bil]&&D[bil][d])||{};if(sourceShift(W,bil,d,c)==='O')return{txt:'OFFDAY',cls:'tc-off',ok:true,inc:false,code:'OFFDAY_HAKIKI'};var o=W.__EAKHA_51077_ORIG_tcAudit;return typeof o==='function'?o(Number(bil),Number(d)):{txt:c.tc_audit_status||'',cls:'tc-bp',ok:true}};tc.__eakha51077=true;set(W,'tcAudit',tc);
    if(!W.__EAKHA_51077_ORIG_getMC)W.__EAKHA_51077_ORIG_getMC=get(W,'getMC');
    var gm=function(bil,d){var c=(D[bil]&&D[bil][d])||{};if(sourceShift(W,bil,d,c)==='O')return null;var o=W.__EAKHA_51077_ORIG_getMC;return typeof o==='function'?o(Number(bil),Number(d)):null};gm.__eakha51077=true;set(W,'getMC',gm);
    if(!W.__EAKHA_51077_ORIG_checkLayersComplete)W.__EAKHA_51077_ORIG_checkLayersComplete=get(W,'checkLayersComplete');
    var lc=function(bil,d){var c=(D[bil]&&D[bil][d])||{};if(sourceShift(W,bil,d,c)==='O')return{complete:true,missing:[],offday:true,special:true,forced:true};var o=W.__EAKHA_51077_ORIG_checkLayersComplete;return typeof o==='function'?o(Number(bil),Number(d)):{complete:true,missing:[],offday:false,special:false}};lc.__eakha51077=true;set(W,'checkLayersComplete',lc);
    ['renderGrid','renderMaster','renderMiniGrid','renderDash','renderOutput','updFlags'].forEach(function(n){wrap(W,n)});
    var rep=enforce(W);
    try{if(typeof get(W,'renderMaster')==='function')get(W,'renderMaster')(null);if(typeof get(W,'renderDash')==='function')get(W,'renderDash')()}catch(e){}
    try{var toast=get(W,'toast');if(typeof toast==='function'&&!W.__EAKHA_51077_TOASTED__){W.__EAKHA_51077_TOASTED__=true;toast('51077: OFFDAY hakiki dikunci, OT/HRMIS/MC offday diabaikan','ok')}}catch(e){}
    try{console.log('[e-AKHA '+PATCH+']',rep)}catch(e){}
    return true;
  }
  var tries=0,timer=setInterval(function(){tries++;try{var ok=install(target());if(ok&&tries>10)clearInterval(timer);if(tries>180)clearInterval(timer)}catch(e){console.warn('[51077]',e);if(tries>180)clearInterval(timer)}},500);
  try{var f=document.getElementById('system')||document.querySelector('iframe');if(f)f.addEventListener('load',function(){setTimeout(function(){install(target())},800);setTimeout(function(){install(target())},2200);setTimeout(function(){install(target())},5000)})}catch(e){}
  document.addEventListener('click',function(){setTimeout(function(){try{install(target())}catch(e){}},250)},true);
})();
