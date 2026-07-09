/* e-AKHA v5.10.83 — canonical 52 members; Latifa = BIL 43; remove duplicate names */
(function(){
'use strict';
var PATCH='v5.10.83-CANONICAL-52-LATIFA-43';
var CANON=[[1, "MOHAMMAD ALLIF BIN MOHTAR", "IKTAR", "ALPHA"], [2, "ABDULLAH BIN BAHUDIN", "IKTAR", "ALPHA"], [3, "MUHAMMAD TARMIZI BIN ABDULLAH", "IKTAR", "ALPHA"], [4, "MOHD AMINUDIN BIN DAUD", "IKTAR", "ALPHA"], [5, "IRWAN SYAMIR BIN MOHD ZAINAL", "IKTAR", "ALPHA"], [6, "AALIYA AAUNI BINTI MAT ZABIR", "IKTAR", "ALPHA"], [7, "MUHAMMAD AMIRULLAH BIN ABDUL SALIM", "MHKL", "ALPHA"], [8, "MOHD SOFIE BIN MOHD SHUKRI", "MHKL", "ALPHA"], [9, "MUHAMAD FAHMIE BIN SAHRAN", "MHKL", "ALPHA"], [10, "YUSRI BIN YUNUS", "RT", "ALPHA"], [11, "MOHD SHAIFUL NIZAM BIN HAMID", "RT", "ALPHA"], [12, "SHAHRUL FITRI BIN ROSLI", "RT", "ALPHA"], [13, "NANTHA GOPAL A/L AYASAMY", "RT", "ALPHA"], [14, "ZULKIFLI BIN YUSOF", "IKTAR", "BRAVO"], [15, "MOHD ILHAM BIN YUSOF", "IKTAR", "BRAVO"], [16, "MUHAMMAD ASREE BIN HAZIR", "IKTAR", "BRAVO"], [17, "NOR AINA NAZIRA BINTI MOHD TARMIZI", "IKTAR", "BRAVO"], [18, "AZLANNOR HADY BIN ABDUL TALIB", "IKTAR", "BRAVO"], [19, "NORAZARIN BIN HUSSIN", "IKTAR", "BRAVO"], [20, "HAZLAN BIN MOHD RESDI", "MHKL", "BRAVO"], [21, "ANASHATOL ARNAEDA BINTI JAFRI", "MHKL", "BRAVO"], [22, "MOHAMMAD ALIF BIN NASARUDDIN", "MHKL", "BRAVO"], [23, "MOHD KHADAFEE BIN MD SAAD", "RT", "BRAVO"], [24, "NOR AZURA BINTI MAMAT @ MUHAMMAD", "RT", "BRAVO"], [25, "MOHD SHAFIK BIN IBRAM", "RT", "BRAVO"], [26, "ZULHILMI BIN ZAINUDIN", "RT", "BRAVO"], [27, "AZROL NAIM BIN AB MALEK", "IKTAR", "CHARLIE"], [28, "WAN NOR FATHIYYAH BINTI WAN AHMAD", "IKTAR", "CHARLIE"], [29, "MUHAMMAD ASHLEY BIN BASHIR", "IKTAR", "CHARLIE"], [30, "MOHD RASIDI BIN MOHD NASIR", "IKTAR", "CHARLIE"], [31, "MUHAMMAD ZULHELMI BIN AHMAD AFAMI", "IKTAR", "CHARLIE"], [32, "MUHAMMAD BADRI BIN ARIS", "IKTAR", "CHARLIE"], [33, "MOHAMAD IZAT AFIFUDDIN BIN MOHAMAD AZMI", "MHKL", "CHARLIE"], [34, "AZELI BIN ZABER", "MHKL", "CHARLIE"], [35, "NORAZLIDA BINTI RAZAB", "MHKL", "CHARLIE"], [36, "NUR AZIM BIN NASIRUDDIN", "RT", "CHARLIE"], [37, "SAIFUL YUSRIZAL BIN YAACOB", "RT", "CHARLIE"], [38, "FARRAH NATASHA BINTI ZULKAFLI", "RT", "CHARLIE"], [39, "MUHAMMAD AFIQ FAIZ BIN BADARUDDIN", "RT", "CHARLIE"], [40, "RIMA BINTI OTHMAN", "IKTAR", "DELTA"], [41, "MOHAMMAD FITHRI BIN AB LATIF", "IKTAR", "DELTA"], [42, "MOHAMAD ALIFF HAIQAL BIN JAMIL", "IKTAR", "DELTA"], [43, "LATIFA ROBANIA BINTI ABDUL RAZAK", "IKTAR", "DELTA"], [44, "AHMAD SHAMIL BIN NADZRI", "IKTAR", "DELTA"], [45, "ROHISHAM BIN MOHAMAD AROF", "IKTAR", "DELTA"], [46, "MOHD LUKMAN BIN HAMDAN", "MHKL", "DELTA"], [47, "SUHAIRI BIN ISMAIL", "MHKL", "DELTA"], [48, "NUR SYUHADA BINTI MISNAN", "MHKL", "DELTA"], [49, "ROSARIZAM BIN SAMSUDIN", "RT", "DELTA"], [50, "MUHAMMAD TARMIZI BIN SAZALI", "RT", "DELTA"], [51, "KHAIROL ISZUWAN BIN ZAKARIA", "RT", "DELTA"], [52, "MOHD NAZRI BIN ISMAIL", "RT", "DELTA"]];
var SEQ=['M','M','OFFDAY','OFFDAY','PT','PT','PG','PG'], OFF={ALPHA:1,BRAVO:5,CHARLIE:3,DELTA:7};
function up(v){return String(v==null?'':v).toUpperCase().trim()}
function norm(v){var s=up(v);[['NANTHAGOPAL','NANTHA GOPAL'],['NANATA','NANTHA'],['LATIFAH','LATIFA'],['LATIPAH','LATIFA'],['MOHAMMAD','MOHAMAD'],['MUHAMMAD','MOHAMAD'],['MUHAMAD','MOHAMAD'],['MOHD','MOHAMAD'],['MUHD','MOHAMAD'],['ALLIF','ALIFF'],['YUSOFFF','YUSOF'],['YUSOFF','YUSOF'],['AROP','AROF'],['HAIKAL','HAIQAL'],['BADARUDDIN','BADRUDDIN']].forEach(function(p){s=s.replaceAll(p[0],p[1])});return s.replace(/\bA\s*\/\s*L\b/g,' ').replace(/\bBIN\b|\bBINTI\b|\bBT\b|\bAL\b|@/g,' ').replace(/[^A-Z0-9]+/g,' ').replace(/\s+/g,' ').trim()}
function target(){var f=document.getElementById('system')||document.querySelector('iframe');try{if(f&&f.contentWindow&&f.contentDocument)return f.contentWindow}catch(e){}return window}
function get(W,n){try{return W.eval('typeof '+n+'!=="undefined"?'+n+':undefined')}catch(e){return W[n]}}
function set(W,n,v){try{W.__EAKHA_51083_TMP__=v;W.eval(n+'=window.__EAKHA_51083_TMP__');delete W.__EAKHA_51083_TMP__}catch(e){try{W[n]=v}catch(_){}}}
function shift(komp,d){return SEQ[((OFF[up(komp)]||1)+(d-1))%8]}
function cls(a){var s=up(a);if(s.indexOf('OFFDAY')>=0)return'af-off';if(s==='TH')return'af-tt';if(s.indexOf('TIADA')>=0||s.indexOf('ABSENT')>=0||s.indexOf('SEMAK')>=0)return'af-inc';if(s.indexOf('MC')>=0)return'af-mc';return'af-sah'}
function inc(a){return /TIADA|ABSENT|SEMAK/i.test(String(a||''))}
function setAudit(c,a){c.audit_status=a;c.audit_final=a;c.final_audit=a;c.audit_class=cls(a);c.audit_incomplete=inc(a);c.audit_reason=PATCH}
function hasPunch(c){return !!(c.tc_in||c.tc_out||(Array.isArray(c.tc_all)&&c.tc_all.length))}
function apply(W){
 var M=get(W,'MASTER'),D=get(W,'D'); if(!Array.isArray(M)||!D||typeof get(W,'renderMaster')!=='function')return false;
 set(W,'ACTIVE_MONTH',6);set(W,'ACTIVE_YEAR',2026);set(W,'daysInActiveMonth',function(){return 30});
 var oldM=M.slice(), oldD=D, byName={}, byBil={};
 oldM.forEach(function(m){byBil[String(m.bil)]=m;byName[norm(m.nama)]=m});
 var newD={}, rep={patch:PATCH, members:52, latifaBil:43, at:new Date().toISOString()};
 CANON.forEach(function(x){
   var bil=x[0], nama=x[1], jab=x[2], komp=x[3], key=norm(nama);
   var old=byName[key]||byBil[String(bil)]||null;
   var srcD=(old&&oldD[old.bil])||oldD[bil]||{};
   newD[bil]={};
   for(var d=1;d<=30;d++){
     var c=Object.assign({}, srcD[d]||{});
     c.shift=shift(komp,d); c.shift_live=c.shift; c.live_shift_label=c.shift;
     if(c.shift==='OFFDAY'){
       c.kzp='OF'; c.kzk='OF'; c.tc_shift='O'; c.ot=false; c.tc_audit_status='OFFDAY / OT ABAIKAN'; c.tc_issue='OFFDAY';
       c.no_perhatian=true; c.audit_ignore_attention=true; setAudit(c,'OFFDAY');
     }
     if(norm(nama).indexOf('LATIFA ROBANIA')>=0){ delete c.mc; delete c._mc; }
     if(norm(nama).indexOf('ASREE')>=0 && c.shift!=='OFFDAY'){c.kzp='TH';c.kzk='TH';c.tc_in='';c.tc_out='';c.tc_all=[];c.hrmis='';delete c._mc;delete c.mc;delete c._hrmis_rec;setAudit(c,'TH');}
     if(c.shift!=='OFFDAY' && norm(nama).indexOf('ASREE')<0){
       if(c._mc||c.mc){c.kzp='MC';c.kzk='MC';setAudit(c,hasPunch(c)?'MC ADA PUNCH - SEMAK':'SAH MC')}
       else if(c._hrmis_rec||c.hrmis){var cd=up(c.hrmis||((c._hrmis_rec&&c._hrmis_rec.type)||'CR')).replace(/\s+SAH.*/,'')||'CR';c.kzp=cd;c.kzk=cd;c.hrmis=cd+' SAH';setAudit(c,hasPunch(c)?cd+' ADA PUNCH - SEMAK':'SAH '+cd)}
     }
     newD[bil][d]=c;
   }
 });
 M.splice(0,M.length); CANON.forEach(function(x){M.push({bil:x[0],nama:x[1],jab:x[2],komp:x[3],mykad:'',staff_id:''})});
 Object.keys(D).forEach(function(k){delete D[k]}); Object.keys(newD).forEach(function(k){D[k]=newD[k]});
 set(W,'gSh',function(bil,a,b,c){var d=(c!=null?c:(b!=null&&a>2000?b:a));var m=M.find(function(x){return String(x.bil)===String(bil)})||{};return shift(m.komp,d)});
 set(W,'getMC',function(bil,d){var c=(D[bil]&&D[bil][d])||{};return c._mc||null});
 set(W,'auditFinal',function(bil,d){var c=(D[bil]&&D[bil][d])||{};return {txt:c.audit_status||c.audit_final||'SEMAK',cls:c.audit_class||'af-inc',inc:!!c.audit_incomplete,reason:c.audit_reason||''}});
 set(W,'tcAudit',function(bil,d){var c=(D[bil]&&D[bil][d])||{};if(c.shift==='OFFDAY')return {txt:'OFFDAY / OT ABAIKAN',cls:'tc-off',ok:true,inc:false};return {txt:c.tc_audit_status||c.tc_issue||'-',cls:c.audit_incomplete?'tc-warn':'tc-ok',ok:!c.audit_incomplete,inc:!!c.audit_incomplete}});
 W.__EAKHA_51083_REPORT__=rep; try{localStorage.setItem('eakha_51083_canonical_52',JSON.stringify(rep));localStorage.setItem('eakha_data',JSON.stringify(D))}catch(e){}
 try{get(W,'renderMaster')(null); if(typeof get(W,'renderDash')==='function')get(W,'renderDash')(); if(typeof get(W,'renderOutput')==='function')get(W,'renderOutput')(''); if(typeof get(W,'updFlags')==='function')get(W,'updFlags')();}catch(e){}
 try{var t=get(W,'toast'); if(typeof t==='function'&&!W.__EAKHA_51083_TOASTED__){W.__EAKHA_51083_TOASTED__=true;t('51083: nama anggota 52 clean · Latifa BIL 43 IKTAR Delta','ok')}}catch(e){}
 try{console.log('[e-AKHA '+PATCH+']',rep)}catch(e){}
 return true;
}
var tries=0,timer=setInterval(function(){tries++;try{var ok=apply(target());if(ok&&tries>8)clearInterval(timer);if(tries>160)clearInterval(timer)}catch(e){console.warn('[51083]',e);if(tries>160)clearInterval(timer)}},450);
try{var f=document.getElementById('system')||document.querySelector('iframe');if(f)f.addEventListener('load',function(){setTimeout(function(){apply(target())},900);setTimeout(function(){apply(target())},2200);setTimeout(function(){apply(target())},5000)})}catch(e){}
document.addEventListener('click',function(){setTimeout(function(){try{apply(target())}catch(e){}},250)},true);
})();
