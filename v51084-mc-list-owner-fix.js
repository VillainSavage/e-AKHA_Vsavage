/* e-AKHA v5.10.84 — fix MC source listing owner: Nantha vs Latifa */
(function(){
'use strict';
var PATCH='v5.10.84-MC-LIST-NANTHA-LATIFA-FIX';
var NANTHA='NANTHA GOPAL A/L AYASAMY', LATIFA='LATIFA ROBANIA BINTI ABDUL RAZAK';
var FIX=[
 {nama:NANTHA,jab:'RT',komp:'ALPHA',dari:'08/06/2026',hingga:'08/06/2026',klinik:'IJN',siri:'IP0453578',hari:1,jenis:'MC'},
 {nama:NANTHA,jab:'RT',komp:'ALPHA',dari:'09/06/2026',hingga:'19/06/2026',klinik:'IJN',siri:'IP0453578',hari:11,jenis:'MC'},
 {nama:NANTHA,jab:'RT',komp:'ALPHA',dari:'20/06/2026',hingga:'20/06/2026',klinik:'CARECLINICS KLINIK SERI INDAH SAMUDRA',siri:'D11EB7',hari:1,jenis:'MC'},
 {nama:NANTHA,jab:'RT',komp:'ALPHA',dari:'27/05/2026',hingga:'07/06/2026',klinik:'H.K.L',siri:'AC1109722',hari:12,jenis:'MC'}
];
function up(v){return String(v==null?'':v).toUpperCase().trim()}
function norm(v){var s=up(v);[['NANATA','NANTHA'],['NANTHAGOPAL','NANTHA GOPAL'],['LATIFAH','LATIFA'],['LATIPAH','LATIFA'],['MOHAMMAD','MOHAMAD'],['MUHAMMAD','MOHAMAD'],['MUHAMAD','MOHAMAD'],['MOHD','MOHAMAD'],['MUHD','MOHAMAD'],['AROP','AROF']].forEach(function(p){s=s.replaceAll(p[0],p[1])});return s.replace(/\bA\s*\/\s*L\b/g,' ').replace(/\bBIN\b|\bBINTI\b|\bBT\b|\bAL\b|@/g,' ').replace(/[^A-Z0-9]+/g,' ').replace(/\s+/g,' ').trim()}
function target(){var f=document.getElementById('system')||document.querySelector('iframe');try{if(f&&f.contentWindow&&f.contentDocument)return f.contentWindow}catch(e){}return window}
function get(W,n){try{return W.eval('typeof '+n+'!=="undefined"?'+n+':undefined')}catch(e){return W[n]}}
function set(W,n,v){try{W.__EAKHA_51084_TMP__=v;W.eval(n+'=window.__EAKHA_51084_TMP__');delete W.__EAKHA_51084_TMP__}catch(e){try{W[n]=v}catch(_){}}}
function findM(M,name){var k=norm(name),best=null,bs=0;M.forEach(function(m){var A=norm(m.nama).split(' '),B=k.split(' '),S={},hit=0;A.forEach(function(x){S[x]=1});B.forEach(function(x){if(S[x])hit++});var sc=100*hit/Math.max(A.length,B.length);if(sc>bs){bs=sc;best=m}});return bs>=60?best:null}
function recName(r){return r.nama||r.NAMA||r['NAMA ANGGOTA']||r.nama_anggota||r.NAMA_OWNER||r.nama_owner||''}
function recSiri(r){return r.siri||r.SIRI||r['NO RUJUKAN MC']||r.NO_RUJUKAN||r.no_rujukan||r.noRujukan||''}
function recClinic(r){return r.klinik||r.KLINIK||r['NAMA KLINIK']||r.NAMA_KLINIK||r.source||''}
function isBadLatifa(r){var n=norm(recName(r)), s=up(recSiri(r)), k=up(recClinic(r));return n.indexOf('LATIFA ROBANIA')>=0 && (s.indexOf('IP0453578')>=0||s.indexOf('D11EB7')>=0||s.indexOf('AC1109722')>=0||k.indexOf('IJN')>=0||k.indexOf('CARECLINICS')>=0||k.indexOf('H.K.L')>=0)}
function sameKey(r,f){var s=up(recSiri(r)), d=String(r.dari||r.DARI||r['TARIKH DARI']||'');return s.indexOf(f.siri)>=0 && d.indexOf(f.dari.slice(0,5))>=0}
function mk(f,m){return {bil:m?m.bil:13,nama:NANTHA,NAMA:NANTHA,'NAMA ANGGOTA':NANTHA,jab:m?m.jab:'RT',komp:m?m.komp:'ALPHA',dari:f.dari,DARI:f.dari,'TARIKH DARI':f.dari,hingga:f.hingga,HINGGA:f.hingga,'TARIKH HINGGA':f.hingga,hari:f.hari,BIL_HARI:f.hari,'BIL HARI':f.hari,klinik:f.klinik,KLINIK:f.klinik,'NAMA KLINIK':f.klinik,siri:f.siri,SIRI:f.siri,'NO RUJUKAN MC':f.siri,jenis:'MC',source:'OWNER FIX NANTHA v51084'} }
function setRecNantha(r,m){r.nama=NANTHA;r.NAMA=NANTHA;r['NAMA ANGGOTA']=NANTHA;r.nama_anggota=NANTHA;r.jab=m?m.jab:'RT';r.komp=m?m.komp:'ALPHA';r.bil=m?m.bil:13;r.BIL_OWNER=m?m.bil:13;return r}
function fixArr(arr,M){if(!Array.isArray(arr))return arr;var nan=findM(M,NANTHA);var out=[], removed=0, changed=0;
 arr.forEach(function(r){if(!r||typeof r!=='object'){out.push(r);return} if(isBadLatifa(r)){var s=up(recSiri(r)); var matched=FIX.find(function(f){return s.indexOf(f.siri)>=0}); if(matched){out.push(setRecNantha(Object.assign({},r),nan)); changed++;} else removed++; return} out.push(r)});
 FIX.forEach(function(f){if(!out.some(function(r){return sameKey(r,f)}))out.push(mk(f,nan))});
 return out}
function cleanDom(W){try{var doc=W.document;doc.querySelectorAll('tr').forEach(function(tr){var t=up(tr.textContent);if(t.indexOf('LATIFA ROBANIA')>=0&&(t.indexOf('IP0453578')>=0||t.indexOf('D11EB7')>=0||t.indexOf('AC1109722')>=0||t.indexOf(' IJN')>=0||t.indexOf('CARECLINICS')>=0||t.indexOf('H.K.L')>=0)){tr.querySelectorAll('td,th').forEach(function(td,i){if(i===0||up(td.textContent).indexOf('LATIFA')>=0)td.textContent=NANTHA})}})}catch(e){}}
function apply(W){var M=get(W,'MASTER')||[], D=get(W,'D')||{}; if(!Array.isArray(M))return false; var nan=findM(M,NANTHA), lat=findM(M,LATIFA); var report={patch:PATCH,at:new Date().toISOString(),nanthaBil:nan&&nan.bil,latifaBil:lat&&lat.bil};
 ['MC_DATA','MC_LIST','MC_ROWS','MC_DITERIMA','mcData','mcList','mcRows'].forEach(function(n){var a=get(W,n);if(Array.isArray(a)){var b=fixArr(a,M);a.splice.apply(a,[0,a.length].concat(b));set(W,n,a);report[n]=a.length}});
 if(nan&&D[nan.bil]){FIX.forEach(function(f){var a=Number(f.dari.slice(0,2)),b=Number(f.hingga.slice(0,2)); if(f.dari.indexOf('/05/')>=0)a=1; for(var d=a;d<=b&&d<=30;d++){var c=D[nan.bil][d]||(D[nan.bil][d]={});c.mc=f.klinik+' '+f.siri;c._mc=mk({dari:String(d).padStart(2,'0')+'/06/2026',hingga:String(d).padStart(2,'0')+'/06/2026',hari:1,klinik:f.klinik,siri:f.siri},nan); if(c.shift!=='OFFDAY'){c.kzp='MC';c.kzk='MC';c.audit_status='SAH MC';c.audit_final='SAH MC';c.final_audit='SAH MC';c.audit_class='af-mc';c.audit_incomplete=false}}})}
 if(lat&&D[lat.bil]){for(var d=1;d<=30;d++){var c=D[lat.bil][d];if(c&&(c.mc||c._mc)){delete c.mc;delete c._mc} }}
 set(W,'getMC',function(bil,d){var c=(D[bil]&&D[bil][d])||{};return c._mc||null});
 cleanDom(W); try{localStorage.setItem('eakha_51084_mc_list_owner_fix',JSON.stringify(report));localStorage.setItem('eakha_data',JSON.stringify(D))}catch(e){}
 try{if(typeof get(W,'renderMaster')==='function')get(W,'renderMaster')(null);if(typeof get(W,'renderDash')==='function')get(W,'renderDash')();if(typeof get(W,'renderOutput')==='function')get(W,'renderOutput')('');cleanDom(W)}catch(e){}
 try{var toast=get(W,'toast');if(typeof toast==='function'&&!W.__EAKHA_51084_TOASTED__){W.__EAKHA_51084_TOASTED__=true;toast('51084: MC list Nantha/Latifa fixed','ok')}}catch(e){}
 try{console.log('[e-AKHA '+PATCH+']',report)}catch(e){} return true}
var tries=0,timer=setInterval(function(){tries++;try{var ok=apply(target());if(ok&&tries>10)clearInterval(timer);if(tries>160)clearInterval(timer)}catch(e){console.warn('[51084]',e);if(tries>160)clearInterval(timer)}},450);
try{var f=document.getElementById('system')||document.querySelector('iframe');if(f)f.addEventListener('load',function(){setTimeout(function(){apply(target())},900);setTimeout(function(){apply(target())},2200);setTimeout(function(){apply(target())},5000)})}catch(e){}
document.addEventListener('click',function(){setTimeout(function(){try{apply(target())}catch(e){}},250)},true);
})();
