/* e-AKHA v5.10.86 — LOCK OFFDAY HAKIKI JUN 2026. Timecard on offday = OT/abaikan, never HADIR. */
(function(){
'use strict';
var PATCH='v5.10.86-OFFDAY-HAKIKI-JUN-LOCK';
var CYCLE=['PT','PT','PG','PG','M','M','OFFDAY','OFFDAY'];
var OFFSET={ALPHA:0,BRAVO:4,CHARLIE:2,DELTA:6};
function up(v){return String(v==null?'':v).toUpperCase().trim()}
function norm(v){return up(v).replace(/[^A-Z0-9]+/g,' ').replace(/\s+/g,' ').trim()}
function target(){var f=document.getElementById('system')||document.querySelector('iframe');try{if(f&&f.contentWindow&&f.contentDocument)return f.contentWindow}catch(e){}return window}
function get(W,n){try{return W.eval('typeof '+n+'!=="undefined"?'+n+':undefined')}catch(e){return W[n]}}
function set(W,n,v){try{W.__EAKHA_51086_TMP__=v;W.eval(n+'=window.__EAKHA_51086_TMP__');delete W.__EAKHA_51086_TMP__}catch(e){try{W[n]=v}catch(_){}}}
function realShift(komp,d){var off=OFFSET[up(komp)]||0;var idx=(13+(Number(d)||1)-1+off)%8;return CYCLE[idx]}
function hasPunch(c){return !!(c.tc_in||c.tc_out||(Array.isArray(c.tc_all)&&c.tc_all.length))}
function isHadir(v){var s=up(v);return s==='HADIR'||s==='✓'||s==='✔'||s==='PRESENT'||s==='/'||s==='YA'}
function setOff(c){
 c.shift='OFFDAY';c.shift_live='OFFDAY';c.live_shift_label='OFFDAY';
 c.kzp='OF';c.kzk='OF';
 c.tc_shift='O';c.ot=hasPunch(c);c.offday_ot_ignored=hasPunch(c);
 c.tc_audit_done=true;c.tc_audit_status=hasPunch(c)?'OFFDAY / OT ABAIKAN':'OFFDAY';c.tc_issue=c.tc_audit_status;
 c.no_perhatian=true;c.audit_ignore_attention=true;c.attention_suppressed_reason='OFFDAY HAKIKI JUN: punch/timecard dikira OT dan diabaikan, bukan HADIR';
 c.audit_status='OFFDAY';c.audit_final='OFFDAY';c.final_audit='OFFDAY';c.audit_class='af-off';c.audit_incomplete=false;c.audit_reason=PATCH;
}
function apply(W){
 var M=get(W,'MASTER'),D=get(W,'D'); if(!Array.isArray(M)||!D||typeof get(W,'renderMaster')!=='function')return false;
 var rep={patch:PATCH,at:new Date().toISOString(),offdayForced:0,hadirRemoved:0,otDetected:0};
 set(W,'ACTIVE_MONTH',6);set(W,'ACTIVE_YEAR',2026);set(W,'daysInActiveMonth',function(){return 30});
 M.forEach(function(m){if(!D[m.bil])D[m.bil]={};for(var d=1;d<=30;d++){var c=D[m.bil][d]||(D[m.bil][d]={});var rs=realShift(m.komp,d);c.shift=rs;c.shift_live=rs;c.live_shift_label=rs;if(rs==='OFFDAY'){if(isHadir(c.kzp)||isHadir(c.kzk))rep.hadirRemoved++;if(hasPunch(c))rep.otDetected++;setOff(c);rep.offdayForced++;}}});
 set(W,'gSh',function(bil,a,b,c){var d=(c!=null?c:(b!=null&&a>2000?b:a));var m=(M||[]).find(function(x){return String(x.bil)===String(bil)})||{};return realShift(m.komp,d)});
 set(W,'auditFinal',function(bil,d){var m=(M||[]).find(function(x){return String(x.bil)===String(bil)})||{};var c=(D[bil]&&D[bil][d])||{};if(realShift(m.komp,d)==='OFFDAY')return{txt:'OFFDAY',cls:'af-off',inc:false,reason:PATCH};return{txt:c.audit_status||c.audit_final||'SEMAK',cls:c.audit_class||'af-inc',inc:!!c.audit_incomplete,reason:c.audit_reason||''}});
 set(W,'tcAudit',function(bil,d){var m=(M||[]).find(function(x){return String(x.bil)===String(bil)})||{};var c=(D[bil]&&D[bil][d])||{};if(realShift(m.komp,d)==='OFFDAY')return{txt:hasPunch(c)?'OFFDAY / OT ABAIKAN':'OFFDAY',cls:'tc-off',ok:true,inc:false};return{txt:c.tc_audit_status||c.tc_issue||'-',cls:c.audit_incomplete?'tc-warn':'tc-ok',ok:!c.audit_incomplete,inc:!!c.audit_incomplete}});
 set(W,'checkLayersComplete',function(bil,d){var m=(M||[]).find(function(x){return String(x.bil)===String(bil)})||{};if(realShift(m.komp,d)==='OFFDAY')return{complete:true,missing:[],offday:true,special:true,forced:true};return{complete:true,missing:[],offday:false,special:false}});
 W.__EAKHA_51086_REPORT__=rep;try{localStorage.setItem('eakha_51086_offday_hakiki_jun_lock',JSON.stringify(rep));localStorage.setItem('eakha_active_month','6');localStorage.setItem('eakha_data',JSON.stringify(D))}catch(e){}
 try{get(W,'renderMaster')(null);if(typeof get(W,'renderDash')==='function')get(W,'renderDash')();if(typeof get(W,'renderOutput')==='function')get(W,'renderOutput')('');if(typeof get(W,'updFlags')==='function')get(W,'updFlags')()}catch(e){}
 try{var toast=get(W,'toast');if(typeof toast==='function'&&!W.__EAKHA_51086_TOASTED__){W.__EAKHA_51086_TOASTED__=true;toast('51086: OFFDAY hakiki Jun dikunci · punch offday = OT abaikan','ok')}}catch(e){}
 try{console.log('[e-AKHA '+PATCH+']',rep)}catch(e){}
 return true;
}
var tries=0,timer=setInterval(function(){tries++;try{var ok=apply(target());if(ok&&tries>10)clearInterval(timer);if(tries>180)clearInterval(timer)}catch(e){console.warn('[51086]',e);if(tries>180)clearInterval(timer)}},450);
try{var f=document.getElementById('system')||document.querySelector('iframe');if(f)f.addEventListener('load',function(){setTimeout(function(){apply(target())},900);setTimeout(function(){apply(target())},2200);setTimeout(function(){apply(target())},5000)})}catch(e){}
document.addEventListener('click',function(){setTimeout(function(){try{apply(target())}catch(e){}},250)},true);
})();
