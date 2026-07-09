/* e-AKHA v5.10.91 — force visible CUTI HRMIS row after render */
(function(){
'use strict';
var PATCH='v5.10.91-HRMIS-DOM-FORCE';
var HR={
 'MOHAMMAD ALLIF BIN MOHTAR':{4:'CR SAH',8:'CR SAH',24:'CR SAH'},
 'LATIFA ROBANIA BINTI ABDUL RAZAK':{1:'CR SAH',2:'CR SAH',3:'CR SAH'},
 'MOHD SHAFIK BIN IBRAM':{1:'CR SAH',2:'CR SAH'},
 'ZULHILMI BIN ZAINUDIN':{1:'CR SAH',11:'CR SAH',13:'CR SAH',27:'CR SAH'},
 'NOR AINA NAZIRA BINTI MOHD TARMIZI':{2:'CR SAH',5:'CR SAH'},
 'NUR AZIM BIN NASIRUDDIN':{3:'CR SAH',20:'CR SAH',28:'CR SAH'},
 'MUHAMMAD AFIQ FAIZ BIN BADARUDDIN':{4:'CR SAH',5:'CR SAH',6:'CR SAH',7:'CR SAH'},
 'MOHD SHAIFUL NIZAM BIN HAMID':{4:'CR SAH',5:'CR SAH',6:'CR SAH',7:'CR SAH',28:'CR SAH'},
 'MUHAMMAD ASHLEY BIN BASHIR':{4:'CR SAH',5:'CR SAH',26:'CR SAH'},
 'FARRAH NATASHA BINTI ZULKAFLI':{5:'CR SAH',13:'CR SAH',20:'CR SAH',26:'CR SAH'},
 'ROSARIZAM BIN SAMSUDIN':{6:'CR SAH',7:'CR SAH'},
 'WAN NOR FATHIYYAH BINTI WAN AHMAD':{6:'CR SAH',7:'CR SAH'},
 'AHMAD SHAMIL BIN NADZRI':{8:'CR SAH',22:'CR SAH'},
 'ROHISHAM BIN MOHAMAD AROF':{9:'CR SAH'},
 'HAZLAN BIN MOHD RESDI':{10:'CR SAH'},
 'AZELI BIN ZABER':{11:'CR SAH',30:'CR SAH'},
 'KHAIROL ISZUWAN BIN ZAKARIA':{11:'CR SAH'},
 'AZLANNOR HADY BIN ABDUL TALIB':{12:'CR SAH'},
 'YUSRI BIN YUNUS':{12:'CR SAH'},
 'ZULKIFLI BIN YUSOF':{12:'CR SAH',13:'CR SAH'},
 'ABDULLAH BIN BAHUDIN':{16:'CR SAH'},
 'NORAZARIN BIN HUSSIN':{16:'CR SAH'},
 'MOHD KHADAFEE BIN MD SAAD':{24:'CR SAH',25:'CR SAH',26:'CR SAH',27:'CR SAH',28:'CR SAH',29:'CR SAH'},
 'MUHAMMAD AMIRULLAH BIN ABDUL SALIM':{24:'CR SAH'},
 'MUHAMMAD BADRI BIN ARIS':{27:'CR SAH',28:'CR SAH'},
 'MUHAMMAD ZULHELMI BIN AHMAD AFAMI':{27:'CR SAH'},
 'RIMA BINTI OTHMAN':{27:'CR SAH'},
 'MUHAMMAD TARMIZI BIN ABDULLAH':{28:'CR SAH'},
 'SHAHRUL FITRI BIN ROSLI':{28:'CR SAH'},
 'MUHAMAD FAHMIE BIN SAHRAN':{30:'CR SAH'},
 'NUR SYUHADA BINTI MISNAN':{30:'CR SAH'}
};
function up(v){return String(v==null?'':v).toUpperCase().trim()}
function norm(v){var s=up(v);[['MOHAMMAD','MOHAMAD'],['MUHAMMAD','MOHAMAD'],['MUHAMAD','MOHAMAD'],['MOHD','MOHAMAD'],['MUHD','MOHAMAD'],['ALLIF','ALIFF'],['AROP','AROF'],['YUSOFF','YUSOF'],['LATIFAH','LATIFA'],['LATIPAH','LATIFA']].forEach(function(p){s=s.replaceAll(p[0],p[1])});return s.replace(/\bBIN\b|\bBINTI\b|\bBT\b|\bA\s*\/\s*L\b|\bAL\b|@/g,' ').replace(/[^A-Z0-9]+/g,' ').replace(/\s+/g,' ').trim()}
function target(){var f=document.getElementById('system')||document.querySelector('iframe');try{if(f&&f.contentWindow&&f.contentDocument)return f.contentWindow}catch(e){}return window}
function get(W,n){try{return W.eval('typeof '+n+'!=="undefined"?'+n+':undefined')}catch(e){return W[n]}}
function setAudit(c,a){c.audit_status=a;c.audit_final=a;c.final_audit=a;c.audit_class='af-sah';c.audit_incomplete=false;c.audit_reason=PATCH}
function ownerKey(n){var k=norm(n),best=null,bs=0;Object.keys(HR).forEach(function(x){var A=norm(x).split(' '),B=k.split(' '),S={},h=0;A.forEach(function(a){S[a]=1});B.forEach(function(b){if(S[b])h++});var sc=100*h/Math.max(A.length,B.length);if(sc>bs){bs=sc;best=x}});return bs>=80?best:null}
function syncData(W){var M=get(W,'MASTER'),D=get(W,'D');if(!Array.isArray(M)||!D)return 0;var n=0;M.forEach(function(m){var key=ownerKey(m.nama),map=key&&HR[key];if(!map)return;if(!D[m.bil])D[m.bil]={};Object.keys(map).forEach(function(d){var c=D[m.bil][d]||(D[m.bil][d]={});if(c.shift==='OFFDAY')return;c.hrmis=map[d];c._hrmis_rec={bil:m.bil,nama:m.nama,d:+d,m:6,type:map[d].split(' ')[0],jenis:map[d].split(' ')[0],status:'IMPORT',source:PATCH};if(!c._mc&&!c.mc){c.kzp=map[d].split(' ')[0];c.kzk=map[d].split(' ')[0];setAudit(c,'SAH '+map[d].split(' ')[0])}n++})});return n}
function paint(td,text){td.textContent=text;td.style.background='#12346a';td.style.color='#facc15';td.style.fontWeight='800';td.title='HRMIS owner linked by '+PATCH}
function forceDom(W){var doc=W.document, rows=Array.from(doc.querySelectorAll('tr')), cur=null, fixed=0;rows.forEach(function(tr){var txt=up(tr.textContent);var memberHit=Object.keys(HR).find(function(n){return txt.indexOf(up(n).slice(0,18))>=0 || norm(txt).indexOf(norm(n).slice(0,18))>=0});if(memberHit)cur=memberHit; if(!cur)return; if(txt.indexOf('CUTI HRMIS')<0)return; var map=HR[cur]; var cells=Array.from(tr.children); var start=0; for(var i=0;i<cells.length;i++){if(up(cells[i].textContent).indexOf('CUTI HRMIS')>=0){start=i+1;break}} Object.keys(map).forEach(function(d){var td=cells[start+(+d)-1]; if(td){paint(td,map[d]);fixed++}})});return fixed}
function apply(W){var dataSet=syncData(W);var domSet=0;try{if(typeof get(W,'renderMaster')==='function')get(W,'renderMaster')(null);if(typeof get(W,'renderDash')==='function')get(W,'renderDash')();if(typeof get(W,'renderOutput')==='function')get(W,'renderOutput')('')}catch(e){}try{domSet=forceDom(W)}catch(e){}var rep={patch:PATCH,at:new Date().toISOString(),dataSet:dataSet,domSet:domSet};W.__EAKHA_51091_REPORT__=rep;try{localStorage.setItem('eakha_51091_hrmis_dom_force',JSON.stringify(rep));localStorage.setItem('eakha_data',JSON.stringify(get(W,'D')||{}))}catch(e){}try{var toast=get(W,'toast');if(typeof toast==='function'&&!W.__EAKHA_51091_TOASTED__){W.__EAKHA_51091_TOASTED__=true;toast('51091: Master CUTI HRMIS dipaparkan ikut owner asal','ok')}}catch(e){}try{console.log('[e-AKHA '+PATCH+']',rep)}catch(e){}return true}
var tries=0,timer=setInterval(function(){tries++;try{var ok=apply(target());if(ok&&tries>12)clearInterval(timer);if(tries>220)clearInterval(timer)}catch(e){console.warn('[51091]',e);if(tries>220)clearInterval(timer)}},450);
try{var f=document.getElementById('system')||document.querySelector('iframe');if(f)f.addEventListener('load',function(){[900,2200,5000,8000].forEach(function(t){setTimeout(function(){apply(target())},t)})})}catch(e){}
document.addEventListener('click',function(){setTimeout(function(){try{apply(target())}catch(e){}},250)},true);
})();