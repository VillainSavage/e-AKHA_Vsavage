/* e-AKHA v5.11.02 — CRASH SAFE MC14811 ONLY
   Emergency safe patch after Chrome Aw Snap.
   No intervals, no localStorage writes, no render loops.
   Only blocks MC14811 from YUSRI and exposes manual function to fix MC14811 owner.
*/
(function(){
'use strict';
var PATCH='v5.11.02-CRASH-SAFE-MC14811-ONLY';
function target(){var f=document.getElementById('system')||document.querySelector('iframe');try{if(f&&f.contentWindow&&f.contentDocument)return f.contentWindow}catch(e){}return window}
function get(W,n){try{return W.eval('typeof '+n+'!=="undefined"?'+n+':undefined')}catch(e){return W[n]}}
function put(W,n,v){try{W[n]=v;W.eval(n+'=window["'+n+'"]')}catch(e){W[n]=v}}
function up(s){return String(s==null?'':s).toUpperCase().replace(/MOHAMMAD|MUHAMMAD|MUHAMAD|MOHD|MUHD/g,'MOHAMAD').replace(/[^A-Z0-9 ]+/g,' ').replace(/\s+/g,' ').trim()}
function findMember(W,name){var M=get(W,'MASTER')||[],n=up(name);return M.find(function(m){return up(m.nama)===n})||M.find(function(m){var mn=up(m.nama);return mn.indexOf('NOR AINA')>=0&&mn.indexOf('NAZIRA')>=0&&mn.indexOf('TARMIZI')>=0})||null}
function findYusri(W){var M=get(W,'MASTER')||[];return M.find(function(m){var n=up(m.nama);return n.indexOf('YUSRI')>=0&&n.indexOf('YUNUS')>=0})||null}
function mcNo(r){return String((r&&(r.no_mc||r.siri||r.mc_no||r.no||''))||'').toUpperCase().trim()}
function fix(W,render){var D=get(W,'D'), MC=get(W,'MC_DATA');if(!Array.isArray(MC))MC=[];if(!D)return {ok:false,reason:'D not loaded'};var nor=findMember(W,'NOR AINA NAZIRA BINTI MOHD TARMIZI'), yusri=findYusri(W);if(!nor)return {ok:false,reason:'Nor Aina not found'};var rec=MC.find(function(r){return mcNo(r)==='MC14811'});if(!rec){rec={no_mc:'MC14811',siri:'MC14811',klinik:'POLIKLINIK MEDI IHSAN',source:PATCH};MC.push(rec);put(W,'MC_DATA',MC)}rec.bil=nor.bil;rec.nama=nor.nama;rec.jab=nor.jab;rec.komp=nor.komp;rec.d=3;rec.m=6;rec.y=2026;rec.tarikh='03/06/2026';rec.dari='03/06/2026';rec.hingga='04/06/2026';rec.hari=2;rec.klinik='POLIKLINIK MEDI IHSAN';rec._official_owner='NOR AINA NAZIRA BINTI MOHD TARMIZI';rec._days=[3,4];[3,4].forEach(function(d){if(yusri&&D[yusri.bil]&&D[yusri.bil][d]){var c=D[yusri.bil][d];try{if(JSON.stringify(c._mc||c.mc||'').toUpperCase().indexOf('MC14811')>=0){delete c._mc;delete c.mc;delete c.mc_rec;if(String(c.audit_final||'').toUpperCase().indexOf('MC')>=0){delete c.audit_final;delete c.audit_status;delete c.final_audit}}}catch(e){}}if(!D[nor.bil])D[nor.bil]={};if(!D[nor.bil][d])D[nor.bil][d]={};D[nor.bil][d]._mc=rec;D[nor.bil][d].mc_src=PATCH;});if(render){try{var rm=get(W,'renderMaster');if(typeof rm==='function')rm(null);var rr=get(W,'renderMCReg');if(typeof rr==='function')rr();var uf=get(W,'updFlags');if(typeof uf==='function')uf()}catch(e){}}return {ok:true,owner:nor.nama,bil:nor.bil,removed_from_yusri:!!yusri}}
function install(){var W=target();if(!W||!W.document)return false;W.eakhaFixMC14811Safe51102=function(){return fix(W,true)};put(W,'eakhaFixMC14811Safe51102',W.eakhaFixMC14811Safe51102);var oldGet=get(W,'getMC');if(typeof oldGet==='function'&&!oldGet.__safe51102){var wrap=function(bil,d){var r=oldGet.apply(this,arguments);if(r&&mcNo(r)==='MC14811'){var nor=findMember(W,'NOR AINA NAZIRA BINTI MOHD TARMIZI');if(nor&&+bil!==+nor.bil)return null}return r};wrap.__safe51102=true;put(W,'getMC',wrap)}setTimeout(function(){try{fix(W,false);console.log('[e-AKHA '+PATCH+'] ready')}catch(e){console.warn('[51102]',e)}},2500);return true}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();try{var f=document.getElementById('system')||document.querySelector('iframe');if(f)f.addEventListener('load',function(){setTimeout(install,1200);setTimeout(function(){try{fix(target(),false)}catch(e){}},4500)})}catch(e){}
})();
