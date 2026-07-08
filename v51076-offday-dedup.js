/* e-AKHA v5.10.76 — de-duplicate Asree and force OFFDAY hakiki */
(function(){
  'use strict';
  var PATCH='v5.10.76-OFFDAY-DEDUP-ASREE';
  function up(v){return String(v==null?'':v).toUpperCase().replace(/PENAMA/g,'').replace(/[^A-Z0-9]+/g,'').trim()}
  function status(v){return String(v==null?'':v).toUpperCase().trim()}
  function isOff(v){var s=status(v);return s==='O'||s==='OF'||s==='OFF'||s==='OFFDAY'}
  function target(){var f=document.getElementById('system')||document.querySelector('iframe');try{if(f&&f.contentWindow&&f.contentDocument)return f.contentWindow}catch(e){}return window}
  function get(W,name){try{return W.eval('typeof '+name+'!=="undefined"?'+name+':undefined')}catch(e){return W[name]}}
  function call(W,name){try{var fn=get(W,name);if(typeof fn==='function')return fn.apply(W,[].slice.call(arguments,2))}catch(e){}}
  function shiftOf(W,bil,d,c){
    c=c||{};
    try{var f=get(W,'gSh');if(typeof f==='function'){var s=f(Number(bil),Number(d));if(s)return status(s)}}catch(e){}
    return status(c.shift_live||c.live_shift_label||c.shift||'');
  }
  function install(W){
    if(!W||W.__EAKHA_51076_DONE__)return true;
    var MASTER=get(W,'MASTER'),D=get(W,'D');
    if(!Array.isArray(MASTER)||!D||typeof get(W,'renderMaster')!=='function')return false;

    var before=MASTER.length,seen={},unique=[],removed=[];
    MASTER.forEach(function(m){
      var k=up(m&&m.nama);
      if(k.indexOf('ASREE')>=0){
        if(seen[k]){removed.push(m);try{delete D[m.bil]}catch(e){};return;}
        seen[k]=1;
      }
      unique.push(m);
    });
    if(unique.length!==MASTER.length)MASTER.splice.apply(MASTER,[0,MASTER.length].concat(unique));

    var forced=0;
    MASTER.forEach(function(m){
      if(!D[m.bil])D[m.bil]={};
      for(var d=1;d<=30;d++){
        var c=D[m.bil][d]||(D[m.bil][d]={});
        if(isOff(shiftOf(W,m.bil,d,c))){
          c.kzp='OF';
          c.kzk='OF';
          c.tc_in='';
          c.tc_out='';
          c.tc_all=[];
          c.tc_shift='O';
          c.ot=false;
          c.hrmis='';
          delete c._hrmis_rec;
          delete c._mc;
          delete c.mc;
          c.note='OFFDAY HAKIKI - ABAIKAN';
          c.tc_audit_done=true;
          c.tc_audit_status='OFFDAY';
          c.tc_issue='OFFDAY';
          c.audit_final='OFFDAY';
          c.final_audit='OFFDAY';
          c.audit_status='OFFDAY';
          c.audit_class='af-off';
          c.audit_incomplete=false;
          c.audit_reason='OFFDAY_HAKIKI';
          c.no_perhatian=true;
          c.audit_ignore_attention=true;
          c.attention_suppressed_reason='OFFDAY HAKIKI: abaikan KZ/TC/HRMIS/MC dan tidak dikira hadir';
          forced++;
        }
      }
    });

    if(!W.__EAKHA_51076_ORIG_AUDIT__)W.__EAKHA_51076_ORIG_AUDIT__=get(W,'auditFinal');
    var audit=function(bil,d){
      var c=(D[bil]&&D[bil][d])||{};
      if(isOff(shiftOf(W,bil,d,c)))return{txt:'OFFDAY',cls:'af-off',inc:false,reason:'OFFDAY_HAKIKI'};
      var o=W.__EAKHA_51076_ORIG_AUDIT__;
      if(typeof o==='function')return o(Number(bil),Number(d));
      return{txt:c.audit_status||'SEMAK',cls:c.audit_class||'af-inc',inc:!!c.audit_incomplete};
    };
    try{W.eval('auditFinal=window.__EAKHA_51076_AUDIT__')}catch(e){W.auditFinal=audit}
    W.__EAKHA_51076_AUDIT__=audit;
    try{W.eval('auditFinal=window.__EAKHA_51076_AUDIT__')}catch(e){W.auditFinal=audit}

    if(!W.__EAKHA_51076_ORIG_LAYERS__)W.__EAKHA_51076_ORIG_LAYERS__=get(W,'checkLayersComplete');
    var layers=function(bil,d){var c=(D[bil]&&D[bil][d])||{};if(isOff(shiftOf(W,bil,d,c)))return{complete:true,missing:[],offday:true,special:true,forced:true};var o=W.__EAKHA_51076_ORIG_LAYERS__;return typeof o==='function'?o(Number(bil),Number(d)):{complete:true,missing:[],offday:false,special:false};};
    W.__EAKHA_51076_LAYERS__=layers;
    try{W.eval('checkLayersComplete=window.__EAKHA_51076_LAYERS__')}catch(e){W.checkLayersComplete=layers}

    try{localStorage.setItem('eakha_51076_offday_dedup',JSON.stringify({at:new Date().toISOString(),members_before:before,members_after:MASTER.length,asree_removed:removed.length,offday_cells_forced:forced}))}catch(e){}
    W.__EAKHA_51076_DONE__={patch:PATCH,removed:removed.length,forced:forced};
    call(W,'renderMaster',null);call(W,'renderDash');call(W,'renderOutput','');call(W,'updFlags');
    try{var t=get(W,'toast');if(typeof t==='function')t('Patch 51076: Asree duplicate dibuang · OFFDAY hakiki dipaksa abaikan','ok')}catch(e){}
    try{console.log('[e-AKHA '+PATCH+']',W.__EAKHA_51076_DONE__)}catch(e){}
    return true;
  }
  var tries=0,timer=setInterval(function(){tries++;try{if(install(target())||tries>120)clearInterval(timer)}catch(e){console.warn('[51076]',e);if(tries>120)clearInterval(timer)}},450);
  try{var f=document.getElementById('system')||document.querySelector('iframe');if(f)f.addEventListener('load',function(){setTimeout(function(){install(target())},1200);setTimeout(function(){install(target())},2600)})}catch(e){}
  document.addEventListener('click',function(){setTimeout(function(){try{install(target())}catch(e){}},300)},true);
})();
