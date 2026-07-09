/* e-AKHA v5.10.95 — JUN 2026 HAKIKI LOCK
   Tujuan: kunci paparan Master File Jun 2026 ikut jadual tugas hakiki final.
   - OFFDAY hanya ikut jadual hakiki Jun 2026 yang disahkan.
   - KZP/KZK lama yang tersalah isi OF/OFF pada hari bertugas akan dibersihkan kepada TM.
   - Cycle tidak reset; untuk Jun 2026 guna jadual final explicit seperti disahkan.
*/
(function(){
'use strict';
var PATCH='v5.10.95-JUN-2026-HAKIKI-LOCK';
var TABLE={
  1:{ALPHA:'M',BRAVO:'P',CHARLIE:'O',DELTA:'S'},
  2:{ALPHA:'O',BRAVO:'S',CHARLIE:'P',DELTA:'M'},
  3:{ALPHA:'O',BRAVO:'S',CHARLIE:'P',DELTA:'M'},
  4:{ALPHA:'P',BRAVO:'M',CHARLIE:'S',DELTA:'O'},
  5:{ALPHA:'P',BRAVO:'M',CHARLIE:'S',DELTA:'O'},
  6:{ALPHA:'S',BRAVO:'O',CHARLIE:'M',DELTA:'P'},
  7:{ALPHA:'S',BRAVO:'O',CHARLIE:'M',DELTA:'P'},
  8:{ALPHA:'M',BRAVO:'P',CHARLIE:'O',DELTA:'S'},
  9:{ALPHA:'M',BRAVO:'P',CHARLIE:'O',DELTA:'S'},
 10:{ALPHA:'O',BRAVO:'S',CHARLIE:'P',DELTA:'M'},
 11:{ALPHA:'O',BRAVO:'S',CHARLIE:'P',DELTA:'M'},
 12:{ALPHA:'P',BRAVO:'M',CHARLIE:'S',DELTA:'O'},
 13:{ALPHA:'P',BRAVO:'M',CHARLIE:'S',DELTA:'O'},
 14:{ALPHA:'S',BRAVO:'O',CHARLIE:'M',DELTA:'P'},
 15:{ALPHA:'S',BRAVO:'O',CHARLIE:'M',DELTA:'P'},
 16:{ALPHA:'M',BRAVO:'P',CHARLIE:'O',DELTA:'S'},
 17:{ALPHA:'M',BRAVO:'P',CHARLIE:'O',DELTA:'S'},
 18:{ALPHA:'O',BRAVO:'S',CHARLIE:'P',DELTA:'M'},
 19:{ALPHA:'O',BRAVO:'S',CHARLIE:'P',DELTA:'M'},
 20:{ALPHA:'P',BRAVO:'M',CHARLIE:'S',DELTA:'O'},
 21:{ALPHA:'P',BRAVO:'M',CHARLIE:'S',DELTA:'O'},
 22:{ALPHA:'S',BRAVO:'O',CHARLIE:'M',DELTA:'P'},
 23:{ALPHA:'S',BRAVO:'O',CHARLIE:'M',DELTA:'P'},
 24:{ALPHA:'M',BRAVO:'P',CHARLIE:'O',DELTA:'S'},
 25:{ALPHA:'M',BRAVO:'P',CHARLIE:'O',DELTA:'S'},
 26:{ALPHA:'O',BRAVO:'S',CHARLIE:'P',DELTA:'M'},
 27:{ALPHA:'O',BRAVO:'S',CHARLIE:'P',DELTA:'M'},
 28:{ALPHA:'P',BRAVO:'M',CHARLIE:'S',DELTA:'O'},
 29:{ALPHA:'P',BRAVO:'M',CHARLIE:'S',DELTA:'O'},
 30:{ALPHA:'S',BRAVO:'O',CHARLIE:'M',DELTA:'P'}
};
var LABEL={P:'PT',S:'PG',M:'M',O:'OF'};
var LONG={P:'PETANG',S:'PAGI',M:'MALAM',O:'OFFDAY'};
var TIME={P:'1500-2300',S:'0700-1500',M:'2300-0700',O:'Rehat'};
function target(){var f=document.getElementById('system')||document.querySelector('iframe');try{if(f&&f.contentWindow&&f.contentDocument)return f.contentWindow}catch(e){}return window}
function get(W,n){try{return W.eval('typeof '+n+'!=="undefined"?'+n+':undefined')}catch(e){return W[n]}}
function put(W,n,v){try{W[n]=v;W.eval(n+'=window["'+n+'"]')}catch(e){W[n]=v}}
function up(v){return String(v==null?'':v).toUpperCase().replace(/<[^>]*>/g,' ').replace(/[^A-Z0-9✓]+/g,' ').replace(/\s+/g,' ').trim()}
function isJune(y,m){return (+y===2026 && +m===6)}
function activeYear(W){return +(get(W,'ACTIVE_YEAR')||2026)}
function activeMonth(W){return +(get(W,'ACTIVE_MONTH')||6)}
function master(W){var M=get(W,'MASTER');return Array.isArray(M)?M:[]}
function data(W){return get(W,'D')||null}
function kompByBil(W,bil){var M=master(W), b=+bil, m=null;for(var i=0;i<M.length;i++){if(+M[i].bil===b){m=M[i];break}}return up(m&&m.komp)}
function fixedShift(W,bil,y,m,d){if(!isJune(y,m))return null;var k=kompByBil(W,bil);return (TABLE[+d]&&TABLE[+d][k])?TABLE[+d][k]:null}
function fixedShiftByKomp(komp,y,m,d){if(!isJune(y,m))return null;var k=up(komp);return (TABLE[+d]&&TABLE[+d][k])?TABLE[+d][k]:null}
function isOffMarker(v){var s=up(v);return s==='O'||s==='OF'||s==='OFF'||s==='OFFDAY'||s==='REHAT'}
function isBlankish(v){var s=up(v);return !s||s==='TM'||s==='TIADA MAKLUMAN'||s==='TIDAK MAKLUM'||s==='NO INFO'||s==='N A'||s==='NA'||s==='-'||s==='—'}
function installShift(W){
  if(!W.__EAKHA_51095_OLD_GSHIFT__)W.__EAKHA_51095_OLD_GSHIFT__=get(W,'gShift');
  if(!W.__EAKHA_51095_OLD_GSH__)W.__EAKHA_51095_OLD_GSH__=get(W,'gSh');
  W.__EAKHA_JUN_2026_HAKIKI_FINAL__=TABLE;
  var oldShift=W.__EAKHA_51095_OLD_GSHIFT__;
  var gShift=function(bil,y,m,d){var f=fixedShift(W,bil,y,m,d);if(f)return f;return typeof oldShift==='function'?oldShift.apply(this,arguments):''};
  var gSh=function(bil,d){var y=activeYear(W),m=activeMonth(W);var f=fixedShift(W,bil,y,m,d);if(f)return f;return gShift(bil,y,m,d)};
  put(W,'gShift',gShift); put(W,'gSh',gSh);
  W.eakhaHakikiShiftKomp=function(komp,y,m,d){var f=fixedShiftByKomp(komp,y,m,d);if(f)return f;return ''};
  W.eakhaHakikiShiftLabel=function(komp,y,m,d){var s=W.eakhaHakikiShiftKomp(komp,y,m,d);return LABEL[s]||s||''};
  W.eakhaHakikiShiftText=function(komp,y,m,d){var s=W.eakhaHakikiShiftKomp(komp,y,m,d);return {code:s,label:LABEL[s]||s,long:LONG[s]||s,time:TIME[s]||''}};
  try{if(get(W,'BK'))master(W).forEach(function(m){get(W,'BK')[m.bil]=up(m.komp)})}catch(e){}
}
function cleanWrongOff(W){
  var M=master(W), D=data(W); if(!M.length||!D)return 0;
  var changed=0;
  M.forEach(function(m){
    var b=+m.bil; if(!D[b])D[b]={};
    for(var d=1;d<=30;d++){
      var sh=fixedShift(W,b,2026,6,d); if(!sh)continue;
      if(!D[b][d])D[b][d]={};
      var c=D[b][d];
      if(sh!=='O'){
        if(isOffMarker(c.kzp)){c.kzp='TM';c.kzp_src='51095 cleared false OFF; hakiki '+(LABEL[sh]||sh);changed++}
        if(isOffMarker(c.kzk)){c.kzk='TM';c.kzk_src='51095 cleared false OFF; hakiki '+(LABEL[sh]||sh);changed++}
        if(isOffMarker(c.tc_shift)){c.tc_shift=sh;changed++}
        if(isOffMarker(c.shift_hakiki)){c.shift_hakiki=sh;changed++}
        if(isOffMarker(c.audit_final)||isOffMarker(c.audit_status)){delete c.audit_final;delete c.audit_status;delete c.final_audit;changed++}
      }else{
        // Jangan paksa simpan OF dalam KZ. Paparan renderGrid akan tunjuk OF/OFFDAY sendiri ikut hakiki.
        if(isBlankish(c.kzp))delete c.kzp;
        if(isBlankish(c.kzk))delete c.kzk;
        c.tc_shift='O';
      }
      c.hakiki_shift_51095=sh;
    }
  });
  try{W.localStorage.setItem('eakha_data',JSON.stringify(D))}catch(e){}
  try{var save=get(W,'saveDataset'); if(typeof save==='function'&&changed)save('51095 JUN HAKIKI LOCK')}catch(e){}
  return changed;
}
function installRenderHooks(W){
  if(W.__EAKHA_51095_RENDER_HOOKS__)return;
  W.__EAKHA_51095_RENDER_HOOKS__=true;
  ['renderMaster','renderGrid','renderMiniGrid','renderOutput','renderDash','updFlags','ensureAuditReady'].forEach(function(fn){
    try{var old=get(W,fn); if(typeof old!=='function'||old.__eakha51095)return;
      var wrap=function(){try{installShift(W);cleanWrongOff(W)}catch(e){} return old.apply(this,arguments)};
      wrap.__eakha51095=true; put(W,fn,wrap);
    }catch(e){}
  });
}
function badge(W,n){try{
  var doc=W.document, bar=doc.querySelector('#page-master > div[style*="display:flex"]')||doc.querySelector('#page-master .ph')||doc.getElementById('page-master');
  if(bar&&!doc.getElementById('badge-51095-hakiki')){var x=doc.createElement('div');x.id='badge-51095-hakiki';x.style.cssText='display:inline-flex;align-items:center;margin-left:6px;padding:4px 8px;border-radius:5px;background:rgba(5,150,105,.18);border:1px solid rgba(52,211,153,.35);color:#6ee7b7;font:700 7.5px system-ui';x.textContent='JUN HAKIKI LOCK 51095';bar.appendChild(x)}
  var mi=doc.getElementById('master-info'); if(mi&&mi.textContent.indexOf('Hakiki Jun dikunci')<0)mi.textContent=mi.textContent+' · Hakiki Jun dikunci';
}catch(e){}}
function apply(W,render){
  if(!W||!W.document)return false;
  installShift(W);installRenderHooks(W);
  var n=cleanWrongOff(W);
  if(render&&!W.__EAKHA_51095_RENDERING__){
    try{W.__EAKHA_51095_RENDERING__=true;var rm=get(W,'renderMaster');if(typeof rm==='function')rm(null);var rd=get(W,'renderDash');if(typeof rd==='function')rd();var uf=get(W,'updFlags');if(typeof uf==='function')uf()}catch(e){console.warn('[51095 render]',e)}finally{W.__EAKHA_51095_RENDERING__=false}
  }
  badge(W,n);
  W.__EAKHA_51095_REPORT__={patch:PATCH,changed:n,at:new Date().toISOString(),table:TABLE};
  try{console.log('[e-AKHA '+PATCH+'] changed='+n)}catch(e){}
  return true;
}
var tries=0,timer=setInterval(function(){tries++;try{var W=target();var ok=apply(W,tries>3);if(ok&&tries>24)clearInterval(timer);if(tries>240)clearInterval(timer)}catch(e){console.warn('[51095]',e);if(tries>240)clearInterval(timer)}},450);
try{var f=document.getElementById('system')||document.querySelector('iframe');if(f)f.addEventListener('load',function(){[300,900,1800,3500,6500,10000,15000].forEach(function(t){setTimeout(function(){try{apply(target(),true)}catch(e){}},t)})})}catch(e){}
document.addEventListener('click',function(){setTimeout(function(){try{apply(target(),false)}catch(e){}},200)},true);
})();
