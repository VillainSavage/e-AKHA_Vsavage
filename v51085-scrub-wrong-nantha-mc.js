/* e-AKHA v5.10.85b — scrub wrong Nantha MC + lock OFFDAY hakiki Jun */
(function(){
'use strict';
var PATCH='v5.10.85b-SCRUB-NANTHA-LOCK-OFFDAY';
var CYCLE=['PT','PT','PG','PG','M','M','OFFDAY','OFFDAY'];
var OFFSET={ALPHA:0,BRAVO:4,CHARLIE:2,DELTA:6};
function up(v){return String(v==null?'':v).toUpperCase().trim()}
function norm(v){var s=up(v);[['NANATA','NANTHA'],['NANTHAGOPAL','NANTHA GOPAL'],['MOHAMMAD','MOHAMAD'],['MUHAMMAD','MOHAMAD'],['MUHAMAD','MOHAMAD'],['MOHD','MOHAMAD'],['MUHD','MOHAMAD'],['A/L',' '],['AL',' ']].forEach(function(p){s=s.replaceAll(p[0],p[1])});return s.replace(/\bBIN\b|\bBINTI\b|\bBT\b|@/g,' ').replace(/[^A-Z0-9]+/g,' ').replace(/\s+/g,' ').trim()}
function isNanthaName(n){var x=norm(n);return x.indexOf('NANTHA GOPAL')>=0&&x.indexOf('AYASAMY')>=0}
function isNanthaMcText(v){var s=up(v);return s.indexOf('IP0453578')>=0||s.indexOf('D11EB7')>=0||s.indexOf('AC1109722')>=0||s.indexOf('CARECLINICS KLINIK SERI INDAH SAMUDRA')>=0||s.indexOf(' IJN')>=0||s==='IJN'||s.indexOf('H.K.L')>=0}
function hakiki(komp,d){return CYCLE[(13+(+d||1)-1+(OFFSET[up(komp)]||0))%8]}
function target(){var f=document.getElementById('system')||document.querySelector('iframe');try{if(f&&f.contentWindow&&f.contentDocument)return f.contentWindow}catch(e){}return window}
function get(W,n){try{return W.eval('typeof '+n+'!=="undefined"?'+n+':undefined')}catch(e){return W[n]}}
function set(W,n,v){try{W.__EAKHA_51085B_TMP__=v;W.eval(n+'=window.__EAKHA_51085B_TMP__');delete W.__EAKHA_51085B_TMP__}catch(e){try{W[n]=v}catch(_){}}}
function recName(r){return r&&typeof r==='object'?(r.nama||r.NAMA||r['NAMA ANGGOTA']||r.nama_anggota||r.NAMA_OWNER||r.nama_owner||''):''}
function recText(r){if(!r)return'';if(typeof r==='string')return r;var t='';Object.keys(r).forEach(function(k){t+=' '+r[k]});return t}
function removeBadArray(a){if(!Array.isArray(a))return 0;var before=a.length;for(var i=a.length-1;i>=0;i--){var r=a[i];if(isNanthaMcText(recText(r))&&!isNanthaName(recName(r)))a.splice(i,1)}return before-a.length}
function hasPunch(c){return !!(c.tc_in||c.tc_out||(Array.isArray(c.tc_all)&&c.tc_all.length))}
function setAudit(c,a){c.audit_status=a;c.audit_final=a;c.final_audit=a;c.audit_class=a==='OFFDAY'?'af-off':(a.indexOf('MC')>=0?'af-mc':'af-sah');c.audit_incomplete=/TIADA|SEMAK|ABSENT/i.test(a);c.audit_reason=PATCH}
function clearWrongMc(c){delete c.mc;delete c._mc;if(up(c.kzp)==='MC')c.kzp='';if(up(c.kzk)==='MC')c.kzk='';if(up(c.audit_status).indexOf('MC')>=0)setAudit(c,'SEMAK')}
function lockOff(c){c.shift='OFFDAY';c.shift_live='OFFDAY';c.live_shift_label='OFFDAY';c.kzp='OF';c.kzk='OF';c.tc_shift='O';c.ot=hasPunch(c);c.offday_ot_ignored=hasPunch(c);c.tc_audit_status=hasPunch(c)?'OFFDAY / OT ABAIKAN':'OFFDAY';c.tc_issue=c.tc_audit_status;c.no_perhatian=true;c.audit_ignore_attention=true;setAudit(c,'OFFDAY')}
function apply(W){var M=get(W,'MASTER'),D=get(W,'D');if(!Array.isArray(M)||!D||typeof get(W,'renderMaster')!=='function')return false;var rep={patch:PATCH,at:new Date().toISOString(),badMcRemoved:0,offdayLocked:0,otOffday:0};
['MC_DATA','MC_LIST','MC_ROWS','MC_DITERIMA','mcData','mcList','mcRows'].forEach(function(n){var a=get(W,n);if(Array.isArray(a)){rep.badMcRemoved+=removeBadArray(a);set(W,n,a)}});
M.forEach(function(m){if(!D[m.bil])D[m.bil]={};for(var d=1;d<=30;d++){var c=D[m.bil][d]||(D[m.bil][d]={});var hs=hakiki(m.komp,d);if(isNanthaMcText(recText(c._mc)+' '+up(c.mc))&&!isNanthaName(m.nama)){clearWrongMc(c);rep.badMcRemoved++}if(hs==='OFFDAY'){if(hasPunch(c))rep.otOffday++;lockOff(c);rep.offdayLocked++}else{c.shift=hs;c.shift_live=hs;c.live_shift_label=hs}}});
set(W,'gSh',function(bil,a,b,c){var d=(c!=null?c:(b!=null&&a>2000?b:a));var m=(M||[]).find(function(x){return String(x.bil)===String(bil)})||{};return hakiki(m.komp,d)});
set(W,'getMC',function(bil,d){var m=(M||[]).find(function(x){return String(x.bil)===String(bil)})||{};var c=(D[bil]&&D[bil][d])||{};if(isNanthaMcText(recText(c._mc)+' '+up(c.mc))&&!isNanthaName(m.nama))return null;return c._mc||null});
set(W,'auditFinal',function(bil,d){var m=(M||[]).find(function(x){return String(x.bil)===String(bil)})||{};var c=(D[bil]&&D[bil][d])||{};if(hakiki(m.komp,d)==='OFFDAY')return{txt:'OFFDAY',cls:'af-off',inc:false,reason:PATCH};return{txt:c.audit_status||c.audit_final||'SEMAK',cls:c.audit_class||'af-inc',inc:!!c.audit_incomplete,reason:c.audit_reason||''}});
set(W,'tcAudit',function(bil,d){var m=(M||[]).find(function(x){return String(x.bil)===String(bil)})||{};var c=(D[bil]&&D[bil][d])||{};if(hakiki(m.komp,d)==='OFFDAY')return{txt:hasPunch(c)?'OFFDAY / OT ABAIKAN':'OFFDAY',cls:'tc-off',ok:true,inc:false};return{txt:c.tc_audit_status||c.tc_issue||'-',cls:c.audit_incomplete?'tc-warn':'tc-ok',ok:!c.audit_incomplete,inc:!!c.audit_incomplete}});
set(W,'checkLayersComplete',function(bil,d){var m=(M||[]).find(function(x){return String(x.bil)===String(bil)})||{};if(hakiki(m.komp,d)==='OFFDAY')return{complete:true,missing:[],offday:true,special:true,forced:true};return{complete:true,missing:[],offday:false,special:false}});
W.__EAKHA_51085B_REPORT__=rep;try{localStorage.setItem('eakha_51085b_scrub_lock_offday',JSON.stringify(rep));localStorage.setItem('eakha_data',JSON.stringify(D))}catch(e){}
try{get(W,'renderMaster')(null);if(typeof get(W,'renderDash')==='function')get(W,'renderDash')();if(typeof get(W,'renderOutput')==='function')get(W,'renderOutput')('');if(typeof get(W,'updFlags')==='function')get(W,'updFlags')()}catch(e){}
try{var toast=get(W,'toast');if(typeof toast==='function'&&!W.__EAKHA_51085B_TOASTED__){W.__EAKHA_51085B_TOASTED__=true;toast('51085b: OFFDAY hakiki Jun dikunci, punch offday = OT abaikan','ok')}}catch(e){}
try{console.log('[e-AKHA '+PATCH+']',rep)}catch(e){}return true}
var tries=0,timer=setInterval(function(){tries++;try{var ok=apply(target());if(ok&&tries>10)clearInterval(timer);if(tries>180)clearInterval(timer)}catch(e){console.warn('[51085b]',e);if(tries>180)clearInterval(timer)}},450);
try{var f=document.getElementById('system')||document.querySelector('iframe');if(f)f.addEventListener('load',function(){setTimeout(function(){apply(target())},900);setTimeout(function(){apply(target())},2200);setTimeout(function(){apply(target())},5000)})}catch(e){}
document.addEventListener('click',function(){setTimeout(function(){try{apply(target())}catch(e){}},250)},true);
})();
