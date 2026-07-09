/* e-AKHA v5.10.88 — FINAL HAKIKI JUN: restore source layers, then apply company shift only. */
(function(){
'use strict';
var PATCH='v5.10.88-FINAL-HAKIKI-JUN';
var CYCLE=['PT','PT','PG','PG','M','M','OFFDAY','OFFDAY'];
var OFFSET={ALPHA:0,BRAVO:4,CHARLIE:2,DELTA:6};
function up(v){return String(v==null?'':v).toUpperCase().trim()}
function norm(v){var s=up(v);[['LATIFAH','LATIFA'],['LATIPAH','LATIFA'],['NANATA','NANTHA'],['NANTHAGOPAL','NANTHA GOPAL'],['MOHAMMAD','MOHAMAD'],['MUHAMMAD','MOHAMAD'],['MUHAMAD','MOHAMAD'],['MOHD','MOHAMAD'],['MUHD','MOHAMAD'],['ALLIF','ALIFF'],['AROP','AROF'],['YUSOFF','YUSOF'],['HAIKAL','HAIQAL'],['BADARUDDIN','BADRUDDIN']].forEach(function(p){s=s.replaceAll(p[0],p[1])});return s.replace(/\bA\s*\/\s*L\b/g,' ').replace(/\bBIN\b|\bBINTI\b|\bBT\b|\bAL\b|@/g,' ').replace(/[^A-Z0-9]+/g,' ').replace(/\s+/g,' ').trim()}
function hakiki(komp,d){return CYCLE[(13+(+d||1)-1+(OFFSET[up(komp)]||0))%8]}
function target(){var f=document.getElementById('system')||document.querySelector('iframe');try{if(f&&f.contentWindow&&f.contentDocument)return f.contentWindow}catch(e){}return window}
function get(W,n){try{return W.eval('typeof '+n+'!=="undefined"?'+n+':undefined')}catch(e){return W[n]}}
function set(W,n,v){try{W.__EAKHA_51088_TMP__=v;W.eval(n+'=window.__EAKHA_51088_TMP__');delete W.__EAKHA_51088_TMP__}catch(e){try{W[n]=v}catch(_){}}}
function isNantha(n){var x=norm(n);return x.indexOf('NANTHA GOPAL')>=0&&x.indexOf('AYASAMY')>=0}
function isAsree(n){return norm(n).indexOf('ASREE')>=0}
function isLatifa(n){return norm(n).indexOf('LATIFA ROBANIA')>=0}
function nanthaMc(t){var s=up(t);return s.indexOf('IP0453578')>=0||s.indexOf('D11EB7')>=0||s.indexOf('AC1109722')>=0||s.indexOf('CARECLINICS KLINIK SERI INDAH SAMUDRA')>=0||s.indexOf(' IJN')>=0||s==='IJN'||s.indexOf('H.K.L')>=0}
function isHadir(v){var s=up(v);return s==='HADIR'||s==='✓'||s==='✔'||s==='PRESENT'||s==='/'||s==='YA'}
function hasPunch(c){return !!(c.tc_in||c.tc_out||(Array.isArray(c.tc_all)&&c.tc_all.length))}
function parseTC(raw){var s=up(raw),o={tc_in:'',tc_out:'',tc_all:[],tc_shift:'',ot:false,note:'',tc_raw:String(raw||'')};if(!raw)return o;if(s.indexOf('OFF')>=0){o.tc_shift='O';o.ot=s.indexOf('OT')>=0;return o}var m=s.match(/^(PG|PT|M)\b/);if(m)o.tc_shift=m[1];var p=s.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);if(p){o.tc_in=p[1];o.tc_out=p[2];o.tc_all=[p[1],p[2]]}else{var q=s.match(/\b(IN|OUT)\s+(\d{1,2}:\d{2})/);if(q){if(q[1]==='IN')o.tc_in=q[2];else o.tc_out=q[2];o.tc_all=[q[2]]}}if(s.indexOf('ABSENT')>=0||s.indexOf('LEWAT')>=0||s.indexOf('SINGLE')>=0)o.note=s;return o}
function cls(a){var s=up(a);if(s.indexOf('OFFDAY')>=0)return'af-off';if(s==='TH')return'af-tt';if(s.indexOf('TIADA')>=0||s.indexOf('ABSENT')>=0||s.indexOf('SEMAK')>=0)return'af-inc';if(s.indexOf('MC')>=0)return'af-mc';if(s.indexOf('CR')>=0||s.indexOf('EL')>=0||s.indexOf('CB')>=0||s.indexOf('CTR')>=0)return'af-cr';return'af-sah'}
function inc(a){return /TIADA|ABSENT|SEMAK|PERLU/i.test(String(a||''))}
function setAudit(c,a){c.audit_status=a;c.audit_final=a;c.final_audit=a;c.audit_class=cls(a);c.audit_incomplete=inc(a);c.audit_reason=PATCH}
function mcObj(m,d,txt){if(!txt||txt==='-'||txt==='OFF')return null;return {bil:m.bil,nama:m.nama,jab:m.jab,komp:m.komp,d:d,m:6,dari:String(d).padStart(2,'0')+'/06/2026',hingga:String(d).padStart(2,'0')+'/06/2026',hari:1,klinik:txt,siri:'SOURCE'}}
function applySource(c,m,d,r){
 c.kzp=r&&r.kzp?r.kzp:'';c.kzk=r&&r.kzk?r.kzk:'';c.hrmis=r&&r.hrmis?r.hrmis:'';c.mc=r&&r.mc?r.mc:'';Object.assign(c,parseTC(r&&r.tc?r.tc:''));c.tc_audit_done=true;c.tc_audit_status=r&&r.tc?r.tc:'';c.tc_issue=c.tc_audit_status;delete c._mc;delete c._hrmis_rec;if(c.mc)c._mc=mcObj(m,d,c.mc);if(c.hrmis)c._hrmis_rec={bil:m.bil,nama:m.nama,d:d,m:6,type:String(c.hrmis).replace(/\s+SAH.*$/,''),jenis:c.hrmis,status:'IMPORT'};setAudit(c,r&&r.audit?r.audit:'SEMAK')
}
function findSource(data,m){if(!data||!data.members)return null;var k=norm(m.nama),best=null,bs=0;data.members.forEach(function(sm){var a=norm(sm.nama);var A=a.split(' '),B=k.split(' '),S={},hit=0;A.forEach(function(x){S[x]=1});B.forEach(function(x){if(S[x])hit++});var sc=100*hit/Math.max(A.length,B.length);if(sc>bs){bs=sc;best=sm}});return bs>=70?best:null}
function apply(W){
 var M=get(W,'MASTER'),D=get(W,'D');if(!Array.isArray(M)||!D||typeof get(W,'renderMaster')!=='function')return false;var data=W.__EAKHA_JUN_2026_LIVE_DATA__||window.__EAKHA_JUN_2026_LIVE_DATA__||{};var rep={patch:PATCH,at:new Date().toISOString(),members:M.length,offday:0,asreeClear:0,badMcRemoved:0,workingRestored:0};
 set(W,'ACTIVE_MONTH',6);set(W,'ACTIVE_YEAR',2026);set(W,'daysInActiveMonth',function(){return 30});
 M.forEach(function(m){var sm=findSource(data,m),src=sm&&data.D&&data.D[String(sm.bil)]?data.D[String(sm.bil)]:null;if(!D[m.bil])D[m.bil]={};for(var d=1;d<=30;d++){var c=D[m.bil][d]||(D[m.bil][d]={});if(src&&src[String(d)])applySource(c,m,d,src[String(d)]);var hs=hakiki(m.komp,d);c.shift=hs;c.shift_live=hs;c.live_shift_label=hs;if(nanthaMc((c.mc||'')+' '+(c._mc?JSON.stringify(c._mc):''))&&!isNantha(m.nama)){delete c.mc;delete c._mc;if(up(c.kzp)==='MC')c.kzp='';if(up(c.kzk)==='MC')c.kzk='';rep.badMcRemoved++}if(isLatifa(m.nama)){delete c.mc;delete c._mc}if(isAsree(m.nama)){delete c.mc;delete c._mc;delete c._hrmis_rec;c.hrmis='';if(hs!=='OFFDAY'){c.kzp='TH';c.kzk='TH';c.tc_in='';c.tc_out='';c.tc_all=[];c.tc_audit_status='TH - TIDAK HADIR TUGAS';setAudit(c,'TH');rep.asreeClear++}}if(hs==='OFFDAY'){c.kzp='OF';c.kzk='OF';c.tc_shift='O';c.ot=hasPunch(c);c.offday_ot_ignored=hasPunch(c);c.tc_audit_status=hasPunch(c)?'OFFDAY / OT ABAIKAN':'OFFDAY';c.tc_issue=c.tc_audit_status;c.no_perhatian=true;c.audit_ignore_attention=true;setAudit(c,'OFFDAY');rep.offday++}else{rep.workingRestored++;if(!isAsree(m.nama)){if(c._mc||c.mc){c.kzp='MC';c.kzk='MC';setAudit(c,hasPunch(c)?'MC ADA PUNCH - SEMAK':'SAH MC')}else if(c._hrmis_rec||c.hrmis){var cd=up(c.hrmis).replace(/\s+SAH.*/,'')||'CR';if(isHadir(c.kzp)||!c.kzp)c.kzp=cd;if(isHadir(c.kzk)||!c.kzk)c.kzk=cd;c.hrmis=cd+' SAH';setAudit(c,hasPunch(c)?cd+' ADA PUNCH - SEMAK':'SAH '+cd)}}}}
 });
 set(W,'gSh',function(bil,a,b,c){var d=(c!=null?c:(b!=null&&a>2000?b:a));var m=(M||[]).find(function(x){return String(x.bil)===String(bil)})||{};return hakiki(m.komp,d)});
 set(W,'getMC',function(bil,d){var m=(M||[]).find(function(x){return String(x.bil)===String(bil)})||{};var c=(D[bil]&&D[bil][d])||{};if(nanthaMc((c.mc||'')+' '+(c._mc?JSON.stringify(c._mc):''))&&!isNantha(m.nama))return null;return c._mc||null});
 set(W,'auditFinal',function(bil,d){var c=(D[bil]&&D[bil][d])||{};return{txt:c.audit_status||c.audit_final||'SEMAK',cls:c.audit_class||'af-inc',inc:!!c.audit_incomplete,reason:c.audit_reason||''}});
 set(W,'tcAudit',function(bil,d){var m=(M||[]).find(function(x){return String(x.bil)===String(bil)})||{};var c=(D[bil]&&D[bil][d])||{};if(hakiki(m.komp,d)==='OFFDAY')return{txt:hasPunch(c)?'OFFDAY / OT ABAIKAN':'OFFDAY',cls:'tc-off',ok:true,inc:false};return{txt:c.tc_audit_status||c.tc_issue||'-',cls:c.audit_incomplete?'tc-warn':'tc-ok',ok:!c.audit_incomplete,inc:!!c.audit_incomplete}});
 set(W,'checkLayersComplete',function(bil,d){var m=(M||[]).find(function(x){return String(x.bil)===String(bil)})||{};if(hakiki(m.komp,d)==='OFFDAY')return{complete:true,missing:[],offday:true,special:true,forced:true};return{complete:true,missing:[],offday:false,special:false}});
 W.__EAKHA_51088_REPORT__=rep;try{localStorage.setItem('eakha_51088_final_hakiki_jun',JSON.stringify(rep));localStorage.setItem('eakha_active_month','6');localStorage.setItem('eakha_data',JSON.stringify(D))}catch(e){}
 try{get(W,'renderMaster')(null);if(typeof get(W,'renderDash')==='function')get(W,'renderDash')();if(typeof get(W,'renderOutput')==='function')get(W,'renderOutput')('');if(typeof get(W,'updFlags')==='function')get(W,'updFlags')()}catch(e){}
 try{var toast=get(W,'toast');if(typeof toast==='function'&&!W.__EAKHA_51088_TOASTED__){W.__EAKHA_51088_TOASTED__=true;toast('51088: final hakiki Jun ikut kompeni/shift, bukan sama offday','ok')}}catch(e){}
 try{console.log('[e-AKHA '+PATCH+']',rep)}catch(e){}return true}
var tries=0,timer=setInterval(function(){tries++;try{var ok=apply(target());if(ok&&tries>10)clearInterval(timer);if(tries>180)clearInterval(timer)}catch(e){console.warn('[51088]',e);if(tries>180)clearInterval(timer)}},450);
try{var f=document.getElementById('system')||document.querySelector('iframe');if(f)f.addEventListener('load',function(){setTimeout(function(){apply(target())},900);setTimeout(function(){apply(target())},2200);setTimeout(function(){apply(target())},5000)})}catch(e){}
document.addEventListener('click',function(){setTimeout(function(){try{apply(target())}catch(e){}},250)},true);
})();