/* e-AKHA v5.11.04 — HARD OFFDAY LOCK CLEAN
   Single Jun patch. No render loop. No new refix file.
   Rule: OFFDAY ikut jadual hakiki Jun sahaja. Semua layer pada OFFDAY dikunci OFF/OFFDAY.
   Thumb/jari, OT, HADIR, LEWAT, MC, CR, EL, HRMIS pada OFFDAY tidak dipaparkan sebagai hadir/isu/audit.
*/
(function(){
'use strict';
var PATCH='v5.11.04-HARD-OFFDAY-LOCK-CLEAN';
var H={
1:{ALPHA:'M',BRAVO:'P',CHARLIE:'O',DELTA:'S'},2:{ALPHA:'O',BRAVO:'S',CHARLIE:'P',DELTA:'M'},3:{ALPHA:'O',BRAVO:'S',CHARLIE:'P',DELTA:'M'},4:{ALPHA:'P',BRAVO:'M',CHARLIE:'S',DELTA:'O'},5:{ALPHA:'P',BRAVO:'M',CHARLIE:'S',DELTA:'O'},6:{ALPHA:'S',BRAVO:'O',CHARLIE:'M',DELTA:'P'},7:{ALPHA:'S',BRAVO:'O',CHARLIE:'M',DELTA:'P'},8:{ALPHA:'M',BRAVO:'P',CHARLIE:'O',DELTA:'S'},9:{ALPHA:'M',BRAVO:'P',CHARLIE:'O',DELTA:'S'},10:{ALPHA:'O',BRAVO:'S',CHARLIE:'P',DELTA:'M'},11:{ALPHA:'O',BRAVO:'S',CHARLIE:'P',DELTA:'M'},12:{ALPHA:'P',BRAVO:'M',CHARLIE:'S',DELTA:'O'},13:{ALPHA:'P',BRAVO:'M',CHARLIE:'S',DELTA:'O'},14:{ALPHA:'S',BRAVO:'O',CHARLIE:'M',DELTA:'P'},15:{ALPHA:'S',BRAVO:'O',CHARLIE:'M',DELTA:'P'},16:{ALPHA:'M',BRAVO:'P',CHARLIE:'O',DELTA:'S'},17:{ALPHA:'M',BRAVO:'P',CHARLIE:'O',DELTA:'S'},18:{ALPHA:'O',BRAVO:'S',CHARLIE:'P',DELTA:'M'},19:{ALPHA:'O',BRAVO:'S',CHARLIE:'P',DELTA:'M'},20:{ALPHA:'P',BRAVO:'M',CHARLIE:'S',DELTA:'O'},21:{ALPHA:'P',BRAVO:'M',CHARLIE:'S',DELTA:'O'},22:{ALPHA:'S',BRAVO:'O',CHARLIE:'M',DELTA:'P'},23:{ALPHA:'S',BRAVO:'O',CHARLIE:'M',DELTA:'P'},24:{ALPHA:'M',BRAVO:'P',CHARLIE:'O',DELTA:'S'},25:{ALPHA:'M',BRAVO:'P',CHARLIE:'O',DELTA:'S'},26:{ALPHA:'O',BRAVO:'S',CHARLIE:'P',DELTA:'M'},27:{ALPHA:'O',BRAVO:'S',CHARLIE:'P',DELTA:'M'},28:{ALPHA:'P',BRAVO:'M',CHARLIE:'S',DELTA:'O'},29:{ALPHA:'P',BRAVO:'M',CHARLIE:'S',DELTA:'O'},30:{ALPHA:'S',BRAVO:'O',CHARLIE:'M',DELTA:'P'}};
function target(){var f=document.getElementById('system')||document.querySelector('iframe');try{if(f&&f.contentWindow&&f.contentDocument)return f.contentWindow}catch(e){}return window}
function get(W,n){try{return W.eval('typeof '+n+'!=="undefined"?'+n+':undefined')}catch(e){return W[n]}}
function put(W,n,v){try{W[n]=v;W.eval(n+'=window["'+n+'"]')}catch(e){W[n]=v}}
function up(s){return String(s==null?'':s).toUpperCase().replace(/MOHAMMAD|MUHAMMAD|MUHAMAD|MOHD|MUHD/g,'MOHAMAD').replace(/[^A-Z0-9 ]+/g,' ').replace(/\s+/g,' ').trim()}
function M(W){var m=get(W,'MASTER');return Array.isArray(m)?m:[]}
function D(W){var d=get(W,'D');return d&&typeof d==='object'?d:null}
function kompOfText(t){t=up(t);return ['ALPHA','BRAVO','CHARLIE','DELTA'].find(function(k){return t.indexOf(k)>=0})||''}
function shK(k,d){return H[+d]&&H[+d][up(k)]||''}
function shM(m,d){return shK(m&&m.komp,d)}
function isOffBilDay(W,bil,day){var m=M(W).find(function(x){return +x.bil===+bil});return !!(m&&shM(m,+day)==='O')}
function findByName(W,a,b){return M(W).find(function(m){var n=up(m.nama);return n.indexOf(a)>=0&&n.indexOf(b)>=0})||null}
function mcNo(r){return String((r&&(r.no_mc||r.siri||r.mc_no||r.no||''))||'').toUpperCase().trim()}
function forceOffCell(c){
  if(!c)return;
  if(c.tc_in||c.tc_out||(Array.isArray(c.tc_all)&&c.tc_all.length))c._offday_ignored_timecard={in:c.tc_in||'',out:c.tc_out||'',all:Array.isArray(c.tc_all)?c.tc_all.slice():[]};
  if(c._mc||c.mc)c._offday_hidden_mc=c._mc||c.mc;
  if(c.hrmis||c._hrmis_rec)c._offday_hidden_hrmis={hrmis:c.hrmis||'',rec:c._hrmis_rec||null};
  c.kzp='OF';c.kzk='OF';
  c.tc_in='';c.tc_out='';c.tc_all=[];c.tc_shift='O';c.ot=false;
  c.hrmis='';delete c._hrmis_rec;delete c._mc;delete c.mc;delete c.mc_rec;
  c.shift='O';c.shift_live='O';c.live_shift_label='OF';c.hakiki_shift='O';c.shift_hakiki='O';
  c.tc_audit_status='OFFDAY';c.tc_issue='OFFDAY';
  c.audit_final='OFFDAY';c.audit_status='OFFDAY';c.final_audit='OFFDAY';c.audit_class='af-off';c.audit_incomplete=false;c.audit_reason=PATCH;
  c.offday_locked=true;c.locked_by=PATCH;c.no_perhatian=true;c.audit_ignore_attention=true;
}
function applyData(W){
  var d=D(W),m=M(W);if(!d||!m.length)return 0;var n=0;
  m.forEach(function(row){if(!d[row.bil])d[row.bil]={};for(var day=1;day<=30;day++){if(!d[row.bil][day])d[row.bil][day]={};var c=d[row.bil][day],sh=shM(row,day);if(!sh)continue;c.shift_live=sh;c.hakiki_shift=sh;c.shift_hakiki=sh;c.live_shift_label=sh==='O'?'OF':(sh==='S'?'PG':sh==='P'?'PT':sh);if(sh==='O'){forceOffCell(c);n++}else{['kzp','kzk'].forEach(function(k){if(/^(O|OF|OFF|OFFDAY|REHAT)$/i.test(String(c[k]||''))){c[k]='TM';n++}})}}});
  return n;
}
function fixMC14811(W){
  var d=D(W),nor=findByName(W,'NOR AINA','TARMIZI'),y=findByName(W,'YUSRI','YUNUS');if(!d||!nor)return false;
  var arr=get(W,'MC_DATA');if(!Array.isArray(arr)){arr=[];put(W,'MC_DATA',arr)}
  var rec=arr.find(function(r){return mcNo(r)==='MC14811'});if(!rec){rec={no_mc:'MC14811',siri:'MC14811'};arr.push(rec)}
  Object.assign(rec,{bil:nor.bil,nama:nor.nama,jab:nor.jab,komp:nor.komp,d:3,m:6,y:2026,dari:'03/06/2026',hingga:'04/06/2026',tarikh:'03/06/2026',hari:2,klinik:'POLIKLINIK MEDI IHSAN',source:PATCH,_days:[3,4]});
  [3,4].forEach(function(day){if(y&&d[y.bil]&&d[y.bil][day]){delete d[y.bil][day]._mc;delete d[y.bil][day].mc;delete d[y.bil][day].mc_rec}if(!isOffBilDay(W,nor.bil,day)){d[nor.bil]=d[nor.bil]||{};d[nor.bil][day]=d[nor.bil][day]||{};d[nor.bil][day]._mc=rec;d[nor.bil][day].mc_src=PATCH}});
  return true;
}
function lockAsree(W){var d=D(W),a=findByName(W,'ASREE','HAZIR');if(!d||!a)return 0;for(var day=1;day<=30;day++){d[a.bil]=d[a.bil]||{};d[a.bil][day]=d[a.bil][day]||{};var c=d[a.bil][day];c.kzp='TH';c.kzk='TH';c.tc_in='';c.tc_out='';c.tc_all=[];c.hrmis='';delete c._hrmis_rec;delete c._mc;delete c.mc;c.audit_final='TH - TIDAK HADIR TUGAS';c.audit_status=c.audit_final;c.final_audit=c.audit_final;c.audit_class='af-th';c.audit_incomplete=false;c.locked_by=PATCH}return 30}
function writeCell(cell,layer){
  if(!cell)return;cell.dataset.offdayLocked='1';cell.classList.add('dc-noedit','af-off');cell.onclick=null;cell.style.pointerEvents='none';cell.title='OFFDAY dikunci ikut jadual hakiki — bukan hadir; thumb/OT diabaikan';
  layer=up(layer);
  if(layer.indexOf('SHIFT')>=0){cell.innerHTML='<b>OF</b><br><span style="opacity:.65">Rehat</span>';return}
  if(layer.indexOf('KZ PENYELIA')>=0||layer.indexOf('KZ KOPERAL')>=0){cell.innerHTML='<b>OF</b><br><span style="opacity:.65">OFFDAY</span>';return}
  if(layer.indexOf('TIMECARD')>=0){cell.innerHTML='OFFDAY';return}
  if(layer.indexOf('MC DITERIMA')>=0||layer.indexOf('CUTI HRMIS')>=0){cell.innerHTML='<span style="opacity:.55">OFF</span>';return}
  if(layer.indexOf('AUDIT')>=0){cell.innerHTML='<b>OFFDAY</b>';return}
}
function paintDom(W){
  var doc=W.document;if(!doc)return 0;var count=0,currentKomp='';
  doc.querySelectorAll('tr').forEach(function(tr){
    var nameCell=tr.querySelector('.ntd');if(nameCell){var k=kompOfText(nameCell.textContent);if(k)currentKomp=k}
    var layerCell=tr.querySelector('.ltd');if(!layerCell||!currentKomp)return;
    var cells=Array.prototype.slice.call(tr.children),start=cells.indexOf(layerCell)+1,layer=layerCell.textContent;
    for(var day=1;day<=30;day++){if(shK(currentKomp,day)==='O'){writeCell(cells[start+day-1],layer);count++}}
  });
  return count;
}
function install(W){
  if(W.__EAKHA_51104_HARD_OFFDAY_CLEAN__)return;W.__EAKHA_51104_HARD_OFFDAY_CLEAN__=true;
  var oldAF=get(W,'auditFinal');if(typeof oldAF==='function')put(W,'auditFinal',function(bil,day){if(isOffBilDay(W,bil,day))return {txt:'OFFDAY',cls:'af-off',inc:false};return oldAF.apply(this,arguments)});
  var oldTC=get(W,'tcAudit');if(typeof oldTC==='function')put(W,'tcAudit',function(bil,day){if(isOffBilDay(W,bil,day))return {txt:'OFFDAY',cls:'tc-off',ok:true,offday:true,ignore:true};return oldTC.apply(this,arguments)});
  var oldMC=get(W,'getMC');if(typeof oldMC==='function')put(W,'getMC',function(bil,day){if(isOffBilDay(W,bil,day))return null;var r=oldMC.apply(this,arguments);if(r&&mcNo(r)==='MC14811'){var nor=findByName(W,'NOR AINA','TARMIZI');if(nor&&+bil!==+nor.bil)return null}return r});
  put(W,'gSh',function(bil,day){var m=M(W).find(function(x){return +x.bil===+bil});return m?shM(m,+day):''});put(W,'daysInActiveMonth',function(){return 30});
  var oldRender=get(W,'renderMaster');if(typeof oldRender==='function'&&!oldRender.__EAKHA_OFFDAY_51104__){var wrap=function(){applyData(W);lockAsree(W);fixMC14811(W);var out=oldRender.apply(this,arguments);setTimeout(function(){try{applyData(W);paintDom(W)}catch(e){}},50);return out};wrap.__EAKHA_OFFDAY_51104__=true;put(W,'renderMaster',wrap)}
  W.document.addEventListener('click',function(e){var c=e.target&&e.target.closest&&e.target.closest('[data-offday-locked="1"]');if(c){e.preventDefault();e.stopPropagation();return false}},true);
}
function apply(render){var W=target();if(!W||!W.document||!D(W)||!M(W).length)return false;install(W);var rep={offday_cells:applyData(W),asree:lockAsree(W),mc14811:fixMC14811(W),dom:0,patch:PATCH,at:new Date().toISOString()};if(render&&!W.__EAKHA_51104_RENDER_DONE__){W.__EAKHA_51104_RENDER_DONE__=true;try{var rm=get(W,'renderMaster');if(typeof rm==='function')rm(null)}catch(e){}}rep.dom=paintDom(W);W.__EAKHA_51104_REPORT__=rep;try{console.log('[e-AKHA '+PATCH+']',rep)}catch(e){}return true}
function boot(){var tries=0;function tick(){tries++;if(apply(tries>2)||tries>=25)return;setTimeout(tick,650)}tick();setTimeout(function(){try{apply(true)}catch(e){}},5000);setTimeout(function(){try{apply(false)}catch(e){}},9000)}
try{var f=document.getElementById('system')||document.querySelector('iframe');if(f)f.addEventListener('load',function(){setTimeout(boot,700)})}catch(e){}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,700)});else setTimeout(boot,700);
})();
