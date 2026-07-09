/* e-AKHA v5.10.94 — clear false CG where no accepted HRMIS owner record */
(function(){
'use strict';
var PATCH='v5.10.94-CLEAR-FALSE-CG';
var VALID_CG={};
function up(v){return String(v==null?'':v).toUpperCase().trim()}
function norm(v){var s=up(v);[['MOHAMMAD','MOHAMAD'],['MUHAMMAD','MOHAMAD'],['MUHAMAD','MOHAMAD'],['MOHD','MOHAMAD'],['MUHD','MOHAMAD'],['ALLIF','ALIFF'],['AROP','AROF']].forEach(function(p){s=s.replaceAll(p[0],p[1])});return s.replace(/\bBIN\b|\bBINTI\b|\bBT\b|\bA\s*\/\s*L\b|\bAL\b|@/g,' ').replace(/[^A-Z0-9]+/g,' ').replace(/\s+/g,' ').trim()}
function target(){var f=document.getElementById('system')||document.querySelector('iframe');try{if(f&&f.contentWindow&&f.contentDocument)return f.contentWindow}catch(e){}return window}
function get(W,n){try{return W.eval('typeof '+n+'!=="undefined"?'+n+':undefined')}catch(e){return W[n]}}
function isCG(v){return /^CG\b|\bCG\b/.test(up(v||''))}
function hasPunch(c){return !!(c.tc_in||c.tc_out||(Array.isArray(c.tc_all)&&c.tc_all.length))}
function setAudit(c,a){c.audit_status=a;c.audit_final=a;c.final_audit=a;c.audit_class=/ABSENT|TIADA|SEMAK|LEWAT/i.test(a)?'af-inc':'af-sah';c.audit_incomplete=/ABSENT|TIADA|SEMAK|LEWAT/i.test(a);c.audit_reason=PATCH}
function acceptedHrmis(c){return c&&c._hrmis_rec&&/CR|EL|CB|CTR|CSG|CG/.test(up(c._hrmis_rec.type||c._hrmis_rec.jenis||c.hrmis||''))}
function cleanData(W){var M=get(W,'MASTER'),D=get(W,'D');if(!Array.isArray(M)||!D)return 0;var n=0;M.forEach(function(m){var mk=norm(m.nama);for(var d=1;d<=30;d++){var c=D[m.bil]&&D[m.bil][d];if(!c)continue;var hasValidCG=VALID_CG[mk]&&VALID_CG[mk][d];if(!hasValidCG&&(isCG(c.kzp)||isCG(c.kzk)||isCG(c.hrmis)||isCG(c.audit_status)||isCG(c.audit_final))){if(isCG(c.kzp))c.kzp=hasPunch(c)?'HADIR':'TM';if(isCG(c.kzk))c.kzk=hasPunch(c)?'HADIR':'TM';if(isCG(c.hrmis)){c.hrmis='';delete c._hrmis_rec}if(isCG(c.audit_status)||isCG(c.audit_final)){setAudit(c,hasPunch(c)?'SAH':'ABSENT')}n++}}});return n}
function forceDom(W){var doc=W.document;if(!doc)return 0;var rows=Array.from(doc.querySelectorAll('tr')), fixed=0;rows.forEach(function(tr){var txt=up(tr.textContent);if(txt.indexOf('CG')<0)return;var cells=Array.from(tr.children);cells.forEach(function(td){var t=up(td.textContent);if(t==='CG'||t.indexOf('CG')>=0){td.textContent='TM';td.style.color='#94a3b8';td.title='CG dibersihkan: tiada permohonan HRMIS sah';fixed++}})});return fixed}
function apply(W){var data=cleanData(W);try{if(typeof get(W,'renderMaster')==='function')get(W,'renderMaster')(null);if(typeof get(W,'renderDash')==='function')get(W,'renderDash')();if(typeof get(W,'renderOutput')==='function')get(W,'renderOutput')('')}catch(e){}var dom=0;try{dom=forceDom(W)}catch(e){}var rep={patch:PATCH,at:new Date().toISOString(),dataCleared:data,domCleared:dom};W.__EAKHA_51094_REPORT__=rep;try{localStorage.setItem('eakha_51094_clear_false_cg',JSON.stringify(rep));localStorage.setItem('eakha_data',JSON.stringify(get(W,'D')||{}))}catch(e){}try{var toast=get(W,'toast');if(typeof toast==='function'&&!W.__EAKHA_51094_TOASTED__){W.__EAKHA_51094_TOASTED__=true;toast('51094: CG palsu dibuang jika tiada HRMIS sah','ok')}}catch(e){}try{console.log('[e-AKHA '+PATCH+']',rep)}catch(e){}return true}
var tries=0,timer=setInterval(function(){tries++;try{var ok=apply(target());if(ok&&tries>14)clearInterval(timer);if(tries>240)clearInterval(timer)}catch(e){console.warn('[51094]',e);if(tries>240)clearInterval(timer)}},450);
try{var f=document.getElementById('system')||document.querySelector('iframe');if(f)f.addEventListener('load',function(){[900,2200,5000,8000,12000].forEach(function(t){setTimeout(function(){apply(target())},t)})})}catch(e){}
document.addEventListener('click',function(){setTimeout(function(){try{apply(target())}catch(e){}},250)},true);
})();