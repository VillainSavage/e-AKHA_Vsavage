/* e-AKHA v5.10.85 — scrub wrong Nantha MC from all non-Nantha rows; do not force to others */
(function(){
'use strict';
var PATCH='v5.10.85-SCRUB-WRONG-NANTHA-MC';
function up(v){return String(v==null?'':v).toUpperCase().trim()}
function norm(v){var s=up(v);[['NANATA','NANTHA'],['NANTHAGOPAL','NANTHA GOPAL'],['MOHAMMAD','MOHAMAD'],['MUHAMMAD','MOHAMAD'],['MUHAMAD','MOHAMAD'],['MOHD','MOHAMAD'],['MUHD','MOHAMAD'],['A/L',' '],['AL',' ']].forEach(function(p){s=s.replaceAll(p[0],p[1])});return s.replace(/\bBIN\b|\bBINTI\b|\bBT\b|@/g,' ').replace(/[^A-Z0-9]+/g,' ').replace(/\s+/g,' ').trim()}
function isNanthaName(n){var x=norm(n);return x.indexOf('NANTHA GOPAL')>=0&&x.indexOf('AYASAMY')>=0}
function isNanthaMcText(v){var s=up(v);return s.indexOf('IP0453578')>=0||s.indexOf('D11EB7')>=0||s.indexOf('AC1109722')>=0||s.indexOf('CARECLINICS KLINIK SERI INDAH SAMUDRA')>=0||s.indexOf(' IJN')>=0||s==='IJN'||s.indexOf('H.K.L')>=0}
function target(){var f=document.getElementById('system')||document.querySelector('iframe');try{if(f&&f.contentWindow&&f.contentDocument)return f.contentWindow}catch(e){}return window}
function get(W,n){try{return W.eval('typeof '+n+'!=="undefined"?'+n+':undefined')}catch(e){return W[n]}}
function set(W,n,v){try{W.__EAKHA_51085_TMP__=v;W.eval(n+'=window.__EAKHA_51085_TMP__');delete W.__EAKHA_51085_TMP__}catch(e){try{W[n]=v}catch(_){}}}
function recName(r){return r&&typeof r==='object'?(r.nama||r.NAMA||r['NAMA ANGGOTA']||r.nama_anggota||r.NAMA_OWNER||r.nama_owner||''):''}
function recText(r){if(!r)return''; if(typeof r==='string')return r; var t=''; Object.keys(r).forEach(function(k){t+=' '+r[k]}); return t}
function removeBadFromArray(arr){if(!Array.isArray(arr))return 0;var before=arr.length;for(var i=arr.length-1;i>=0;i--){var r=arr[i];if(isNanthaMcText(recText(r))&&!isNanthaName(recName(r)))arr.splice(i,1)}return before-arr.length}
function setAudit(c,a){c.audit_status=a;c.audit_final=a;c.final_audit=a;c.audit_class=a.indexOf('MC')>=0?'af-mc':(a.indexOf('OFFDAY')>=0?'af-off':'af-sah');c.audit_incomplete=/TIADA|SEMAK|ABSENT/i.test(a)}
function clearCell(c){delete c.mc;delete c._mc;if(up(c.kzp)==='MC')c.kzp='';if(up(c.kzk)==='MC')c.kzk='';if(up(c.audit_status).indexOf('MC')>=0)setAudit(c,'SEMAK');}
function apply(W){var M=get(W,'MASTER'),D=get(W,'D');if(!Array.isArray(M)||!D)return false;var rep={patch:PATCH,at:new Date().toISOString(),arrayRemoved:0,cellRemoved:0,domRowsRemoved:0};
 ['MC_DATA','MC_LIST','MC_ROWS','MC_DITERIMA','mcData','mcList','mcRows'].forEach(function(n){var a=get(W,n);if(Array.isArray(a)){rep.arrayRemoved+=removeBadFromArray(a);set(W,n,a)}});
 M.forEach(function(m){var nan=isNanthaName(m.nama);for(var d=1;d<=30;d++){var c=D[m.bil]&&D[m.bil][d];if(!c)continue;var txt=recText(c._mc)+' '+up(c.mc);if(isNanthaMcText(txt)&&!nan){clearCell(c);rep.cellRemoved++}}});
 set(W,'getMC',function(bil,d){var m=(M||[]).find(function(x){return String(x.bil)===String(bil)})||{};var c=(D[bil]&&D[bil][d])||{};if(c._mc&&isNanthaMcText(recText(c._mc))&&!isNanthaName(m.nama))return null;return c._mc||null});
 try{var doc=W.document;doc.querySelectorAll('tr').forEach(function(tr){var t=up(tr.textContent);if(t.indexOf('LATIFA ROBANIA')>=0&&(isNanthaMcText(t))){tr.remove();rep.domRowsRemoved++}else if(t.indexOf('MUHAMMAD AFIQ FAIZ')>=0&&isNanthaMcText(t)){tr.remove();rep.domRowsRemoved++}})}catch(e){}
 try{localStorage.setItem('eakha_51085_scrub_wrong_nantha_mc',JSON.stringify(rep));localStorage.setItem('eakha_data',JSON.stringify(D))}catch(e){}
 try{if(typeof get(W,'renderMaster')==='function')get(W,'renderMaster')(null);if(typeof get(W,'renderDash')==='function')get(W,'renderDash')();if(typeof get(W,'renderOutput')==='function')get(W,'renderOutput')('')}catch(e){}
 try{var toast=get(W,'toast');if(typeof toast==='function'&&!W.__EAKHA_51085_TOASTED__){W.__EAKHA_51085_TOASTED__=true;toast('51085: MC Nantha dibuang dari semua row bukan Nantha','ok')}}catch(e){}
 try{console.log('[e-AKHA '+PATCH+']',rep)}catch(e){}
 return true}
var tries=0,timer=setInterval(function(){tries++;try{var ok=apply(target());if(ok&&tries>10)clearInterval(timer);if(tries>160)clearInterval(timer)}catch(e){console.warn('[51085]',e);if(tries>160)clearInterval(timer)}},450);
try{var f=document.getElementById('system')||document.querySelector('iframe');if(f)f.addEventListener('load',function(){setTimeout(function(){apply(target())},900);setTimeout(function(){apply(target())},2200);setTimeout(function(){apply(target())},5000)})}catch(e){}
document.addEventListener('click',function(){setTimeout(function(){try{apply(target())}catch(e){}},250)},true);
})();
