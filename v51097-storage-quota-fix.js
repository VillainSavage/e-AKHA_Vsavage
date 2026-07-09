/* e-AKHA v5.10.97 — STORAGE QUOTA FIX
   Fix QuotaExceededError localStorage penuh.
   - Buang snapshot/guard/backup localStorage yang besar.
   - Jangan simpan duplicate besar eakha_dataset_2026_6 / eakha_master_2026_6 ke localStorage.
   - Paut semula HRMIS Jun selepas ruang dibersihkan.
*/
(function(){
'use strict';
var PATCH='v5.10.97-STORAGE-QUOTA-FIX';
function target(){var f=document.getElementById('system')||document.querySelector('iframe');try{if(f&&f.contentWindow&&f.contentDocument)return f.contentWindow}catch(e){}return window}
function get(W,n){try{return W.eval('typeof '+n+'!=="undefined"?'+n+':undefined')}catch(e){return W[n]}}
function put(W,n,v){try{W[n]=v;W.eval(n+'=window["'+n+'"]')}catch(e){W[n]=v}}
function shouldDelete(k){k=String(k||'');if(k==='eakha_data'||k==='eakha_hrmis'||k==='eakha_mc'||k==='eakha_ctr'||k==='eakha_raya')return false;return /^(eakha_guard_|eakha_backup_|eakha_archive_|eakha_boot_predeploy_backup|eakha_master_|eakha_dataset_|eakha_snapshot_|eakha_safe_snapshot_|eakha_last_good_|eakha_files_backup_)/i.test(k)||/backup|snapshot|predeploy|last_good|guard_last/i.test(k)}
function byteLen(s){try{return new Blob([String(s||'')]).size}catch(e){return String(s||'').length}}
function prune(W){var removed=[],freed=0;try{var LS=W.localStorage, keys=[];for(var i=0;i<LS.length;i++)keys.push(LS.key(i));keys.forEach(function(k){if(shouldDelete(k)){var v=LS.getItem(k)||'';freed+=byteLen(v);try{LS.removeItem(k);removed.push(k)}catch(e){}}})}catch(e){console.warn('[51097 prune]',e)}return {removed:removed,freed:freed}}
function installSetGuard(W){try{if(W.__EAKHA_51097_STORAGE_GUARD__)return;W.__EAKHA_51097_STORAGE_GUARD__=true;var native=W.Storage&&W.Storage.prototype&&W.Storage.prototype.setItem;if(!native)return;W.__EAKHA_51097_NATIVE_SETITEM__=native;W.Storage.prototype.setItem=function(k,v){k=String(k||'');if(/^(eakha_dataset_|eakha_master_|eakha_guard_|eakha_backup_|eakha_snapshot_|eakha_safe_snapshot_)/i.test(k)||/backup|snapshot|predeploy|last_good|guard_last/i.test(k)){try{return native.call(this,'eakha_51097_skip_'+k,JSON.stringify({skipped:k,reason:PATCH,at:new Date().toISOString()}))}catch(e){return}}
      try{return native.call(this,k,v)}catch(e){if(String(e&&e.name).indexOf('Quota')>=0||/quota/i.test(String(e&&e.message))){prune(W);try{return native.call(this,k,v)}catch(e2){console.warn('[51097 setItem blocked after prune]',k,e2);return}}throw e}
    }}catch(e){console.warn('[51097 installSetGuard]',e)}}
function toast(W,msg,type){try{var t=get(W,'toast');if(typeof t==='function')t(msg,type||'ok');else console.log(msg)}catch(e){console.log(msg)}}
function showBox(W,html){try{var doc=W.document||document;var old=doc.getElementById('quota-fix-51097');if(old)old.remove();var box=doc.createElement('div');box.id='quota-fix-51097';box.style.cssText='position:fixed;right:12px;top:12px;z-index:999999;background:#071426;color:#fff;border:2px solid #34d399;border-radius:10px;padding:12px;width:330px;font:12px Arial;line-height:1.45;box-shadow:0 10px 30px rgba(0,0,0,.45)';box.innerHTML=html+'<br><button onclick="this.parentElement.remove()" style="margin-top:8px;padding:5px 9px">Tutup</button>';doc.body.appendChild(box)}catch(e){}}
function apply(W){if(!W||!W.document)return false;installSetGuard(W);var p=prune(W);var rep={patch:PATCH,removed:p.removed.length,freed:p.freed,at:new Date().toISOString()};W.__EAKHA_51097_QUOTA_REPORT__=rep;try{W.localStorage.setItem('eakha_51097_quota_report',JSON.stringify(rep))}catch(e){}
  try{var link=W.eakhaLinkHRMISJunToMaster51096||get(W,'eakhaLinkHRMISJunToMaster51096');if(typeof link==='function'){var r=link();rep.hrmis=r;}}
  catch(e){console.warn('[51097 HRMIS relink]',e)}
  try{var rm=get(W,'renderMaster');if(typeof rm==='function')rm(null);var hr=get(W,'renderHRMISReg');if(typeof hr==='function')hr();var uf=get(W,'updFlags');if(typeof uf==='function')uf()}catch(e){}
  toast(W,'51097: storage quota dibersihkan. Removed '+rep.removed+' keys.','ok');showBox(W,'✅ <b>Storage quota dibersihkan</b><br>Key besar dibuang: <b>'+rep.removed+'</b><br>Anggaran ruang bebas: <b>'+Math.round(rep.freed/1024)+' KB</b><br>HRMIS Jun dipaut semula jika staging wujud.');try{console.log('[e-AKHA '+PATCH+']',rep)}catch(e){}return true}
function boot(){try{apply(target())}catch(e){console.warn('[51097]',e)}}
var tries=0,timer=setInterval(function(){tries++;try{var ok=apply(target());if(ok&&tries>8)clearInterval(timer);if(tries>120)clearInterval(timer)}catch(e){console.warn('[51097 interval]',e);if(tries>120)clearInterval(timer)}},900);
try{var f=document.getElementById('system')||document.querySelector('iframe');if(f)f.addEventListener('load',function(){[600,1600,3500,7000,12000].forEach(function(t){setTimeout(boot,t)})})}catch(e){}
})();
