/* e-AKHA v5.10.90 — force HRMIS layer render from owner records, incl. ALLIF/ALIFF Mohtar */
(function(){
'use strict';
var PATCH='v5.10.90-HRMIS-LAYER-FORCE-RENDER';
var HR={
 'MOHAMMAD ALLIF BIN MOHTAR':{4:'CR',8:'CR',24:'CR'},
 'MOHD SHAFIK BIN IBRAM':{1:'CR',2:'CR'},
 'ZULHILMI BIN ZAINUDIN':{1:'CR',11:'CR',13:'CR',27:'CR'},
 'LATIFA ROBANIA BINTI ABDUL RAZAK':{1:'CR',2:'CR',3:'CR'},
 'NOR AINA NAZIRA BINTI MOHD TARMIZI':{2:'CR',5:'CR'},
 'NUR AZIM BIN NASIRUDDIN':{3:'CR',20:'CR',28:'CR'},
 'MUHAMMAD AFIQ FAIZ BIN BADARUDDIN':{4:'CR',5:'CR',6:'CR',7:'CR'},
 'MOHD SHAIFUL NIZAM BIN HAMID':{4:'CR',5:'CR',6:'CR',7:'CR',28:'CR'},
 'MUHAMMAD ASHLEY BIN BASHIR':{4:'CR',5:'CR',26:'CR'},
 'FARRAH NATASHA BINTI ZULKAFLI':{5:'CR',13:'CR',20:'CR',26:'CR'},
 'ROSARIZAM BIN SAMSUDIN':{6:'CR',7:'CR'},
 'WAN NOR FATHIYYAH BINTI WAN AHMAD':{6:'CR',7:'CR'},
 'AHMAD SHAMIL BIN NADZRI':{8:'CR',22:'CR'},
 'ROHISHAM BIN MOHAMAD AROF':{9:'CR'},
 'HAZLAN BIN MOHD RESDI':{10:'CR'},
 'AZELI BIN ZABER':{11:'CR',30:'CR'},
 'KHAIROL ISZUWAN BIN ZAKARIA':{11:'CR'},
 'AZLANNOR HADY BIN ABDUL TALIB':{12:'CR'},
 'YUSRI BIN YUNUS':{12:'CR'},
 'ZULKIFLI BIN YUSOF':{12:'CR',13:'CR'},
 'ABDULLAH BIN BAHUDIN':{16:'CR'},
 'NORAZARIN BIN HUSSIN':{16:'CR'},
 'MOHD KHADAFEE BIN MD SAAD':{24:'CR',25:'CR',26:'CR',27:'CR',28:'CR',29:'CR'},
 'MUHAMMAD AMIRULLAH BIN ABDUL SALIM':{24:'CR'},
 'MUHAMMAD BADRI BIN ARIS':{27:'CR',28:'CR'},
 'MUHAMMAD ZULHELMI BIN AHMAD AFAMI':{27:'CR'},
 'RIMA BINTI OTHMAN':{27:'CR'},
 'MUHAMMAD TARMIZI BIN ABDULLAH':{28:'CR'},
 'SHAHRUL FITRI BIN ROSLI':{28:'CR'},
 'MUHAMAD FAHMIE BIN SAHRAN':{30:'CR'},
 'NUR SYUHADA BINTI MISNAN':{30:'CR'}
};
function up(v){return String(v==null?'':v).toUpperCase().trim()}
function norm(v){var s=up(v);[['MOHAMMAD','MOHAMAD'],['MUHAMMAD','MOHAMAD'],['MUHAMAD','MOHAMAD'],['MOHD','MOHAMAD'],['MUHD','MOHAMAD'],['ALLIF','ALIFF'],['AROP','AROF'],['YUSOFF','YUSOF'],['NURSYUHADA','NUR SYUHADA'],['LATIFAH','LATIFA'],['LATIPAH','LATIFA']].forEach(function(p){s=s.replaceAll(p[0],p[1])});return s.replace(/\bBIN\b|\bBINTI\b|\bBT\b|\bA\s*\/\s*L\b|\bAL\b|@/g,' ').replace(/[^A-Z0-9]+/g,' ').replace(/\s+/g,' ').trim()}
function target(){var f=document.getElementById('system')||document.querySelector('iframe');try{if(f&&f.contentWindow&&f.contentDocument)return f.contentWindow}catch(e){}return window}
function get(W,n){try{return W.eval('typeof '+n+'!=="undefined"?'+n+':undefined')}catch(e){return W[n]}}
function set(W,n,v){try{W.__EAKHA_51090_TMP__=v;W.eval(n+'=window.__EAKHA_51090_TMP__');delete W.__EAKHA_51090_TMP__}catch(e){try{W[n]=v}catch(_){}}}
function ownerKey(n){var k=norm(n);var best=null,bs=0;Object.keys(HR).forEach(function(x){var A=norm(x).split(' '),B=k.split(' '),S={},h=0;A.forEach(function(a){S[a]=1});B.forEach(function(b){if(S[b])h++});var sc=100*h/Math.max(A.length,B.length);if(sc>bs){bs=sc;best=x}});return bs>=80?best:null}
function hasPunch(c){return !!(c.tc_in||c.tc_out||(Array.isArray(c.tc_all)&&c.tc_all.length))}
function isAsree(n){return norm(n).indexOf('ASREE')>=0}
function isLeave(v){return /\b(CR|CTR|EL|CB|CSG)\b/.test(up(v||''))}
function setAudit(c,a){c.audit_status=a;c.audit_final=a;c.final_audit=a;c.audit_class=a.indexOf('SAH')>=0?'af-sah':(a.indexOf('OFFDAY')>=0?'af-off':'af-inc');c.audit_incomplete=/TIADA|SEMAK|ABSENT|PERLU/i.test(a);c.audit_reason=PATCH}
function apply(W){var M=get(W,'MASTER'),D=get(W,'D');if(!Array.isArray(M)||!D||typeof get(W,'renderMaster')!=='function')return false;var rep={patch:PATCH,at:new Date().toISOString(),cellsSet:0,cellsCleared:0,aliffSet:false};
 M.forEach(function(m){var ok=ownerKey(m.nama), map=ok?HR[ok]:null;if(!D[m.bil])D[m.bil]={};for(var d=1;d<=30;d++){var c=D[m.bil][d]||(D[m.bil][d]={});if(isAsree(m.nama)){c.hrmis='';delete c._hrmis_rec;continue}var code=map&&map[d];if(code&&c.shift!=='OFFDAY'){c.hrmis=code+' SAH';c._hrmis_rec={bil:m.bil,nama:m.nama,d:d,m:6,type:code,jenis:code,status:'IMPORT',source:'HRMIS OWNER AUTHORITY v51090'};if(!c._mc&&!c.mc){if(isLeave(c.kzp)||up(c.kzp)==='HADIR'||c.kzp==='✓'||!c.kzp)c.kzp=code;if(isLeave(c.kzk)||up(c.kzk)==='HADIR'||c.kzk==='✓'||!c.kzk)c.kzk=code;setAudit(c,hasPunch(c)?code+' ADA PUNCH - SEMAK':'SAH '+code)}rep.cellsSet++;if(norm(m.nama).indexOf('ALIFF MOHTAR')>=0&&d===4)rep.aliffSet=true}else{if(c.hrmis||c._hrmis_rec){c.hrmis='';delete c._hrmis_rec;rep.cellsCleared++}if(!c._mc&&!c.mc&&!isAsree(m.nama)&&(isLeave(c.audit_status)||isLeave(c.audit_final)||isLeave(c.kzp)||isLeave(c.kzk))){if(isLeave(c.kzp))c.kzp=hasPunch(c)?'HADIR':'TM';if(isLeave(c.kzk))c.kzk=hasPunch(c)?'HADIR':'TM';setAudit(c,hasPunch(c)?'SAH':'SEMAK')}}}});
 var hrRows=[];M.forEach(function(m){var k=ownerKey(m.nama),map=k&&HR[k];if(!map)return;Object.keys(map).forEach(function(d){hrRows.push({bil:m.bil,nama:m.nama,NAMA:m.nama,'NAMA ANGGOTA':m.nama,d:+d,m:6,type:map[d],jenis:map[d],JENIS:map[d],status:'IMPORT',DARI:String(d).padStart(2,'0')+'/06/2026',HINGGA:String(d).padStart(2,'0')+'/06/2026',source:'HRMIS OWNER AUTHORITY v51090'})})});
 ['HRMIS_DATA','CUTI_HRMIS_PRELOAD','HRMIS_ROWS','hrmisData','hrmisRows'].forEach(function(n){var a=get(W,n);if(Array.isArray(a)){a.splice.apply(a,[0,a.length].concat(hrRows));set(W,n,a)}});
 set(W,'auditFinal',function(bil,d){var c=(D[bil]&&D[bil][d])||{};return{txt:c.audit_status||c.audit_final||'SEMAK',cls:c.audit_class||'af-inc',inc:!!c.audit_incomplete,reason:c.audit_reason||''}});
 W.__EAKHA_51090_REPORT__=rep;try{localStorage.setItem('eakha_51090_hrmis_layer_force',JSON.stringify(rep));localStorage.setItem('eakha_data',JSON.stringify(D))}catch(e){}
 try{get(W,'renderMaster')(null);if(typeof get(W,'renderDash')==='function')get(W,'renderDash')();if(typeof get(W,'renderOutput')==='function')get(W,'renderOutput')('')}catch(e){}
 try{var toast=get(W,'toast');if(typeof toast==='function'&&!W.__EAKHA_51090_TOASTED__){W.__EAKHA_51090_TOASTED__=true;toast('51090: HRMIS layer dipaksa ikut owner asal; Aliff Mohtar CR masuk','ok')}}catch(e){}
 try{console.log('[e-AKHA '+PATCH+']',rep)}catch(e){}return true}
var tries=0,timer=setInterval(function(){tries++;try{var ok=apply(target());if(ok&&tries>10)clearInterval(timer);if(tries>180)clearInterval(timer)}catch(e){console.warn('[51090]',e);if(tries>180)clearInterval(timer)}},450);
try{var f=document.getElementById('system')||document.querySelector('iframe');if(f)f.addEventListener('load',function(){setTimeout(function(){apply(target())},900);setTimeout(function(){apply(target())},2200);setTimeout(function(){apply(target())},5000)})}catch(e){}document.addEventListener('click',function(){setTimeout(function(){try{apply(target())}catch(e){}},250)},true);
})();