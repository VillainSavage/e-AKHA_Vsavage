/* e-AKHA v5.11.01 — JUNE MC OWNER TRUTH LOCK
   Source: MC_LENGKAP_1_SHEET_SEHINGGA_6_JULAI_2026.xlsx / sheet MC_CLEAN_ONLY.
   Fix salah paut MC: owner ditentukan oleh NO RUJUKAN MC + tarikh + nama sumber.
   MC14811 official owner = NOR AINA NAZIRA BINTI MOHD TARMIZI, bukan YUSRI.
*/
(function(){
'use strict';
var PATCH='v5.11.01-JUNE-MC-OWNER-TRUTH-LOCK';
var OFFICIAL=[{"no":"93609","nama":"MOHD RASIDI BIN MOHD NASIR","jab":"IKTAR","komp":"CHARLIE","dari":"2026-06-02","hingga":"2026-06-02","klinik":"POLIKLINIK & SURGERI TELUK PULAI","hari":1,"srcNo":83},{"no":"MC14811","nama":"NOR AINA NAZIRA BINTI MOHD TARMIZI","jab":"MHKL","komp":"BRAVO","dari":"2026-06-03","hingga":"2026-06-04","klinik":"POLIKLINIK MEDI IHSAN","hari":2,"srcNo":84},{"no":"105714","nama":"FARRAH NATASHA BINTI ZULKAFLI","jab":"RT","komp":"CHARLIE","dari":"2026-06-04","hingga":"2026-06-04","klinik":"POLIKLINIK AN-NISA'","hari":1,"srcNo":85},{"no":"41740","nama":"AHMAD SHAMIL BIN NADZRI","jab":"IKTAR","komp":"DELTA","dari":"2026-06-06","hingga":"2026-06-07","klinik":"TWEEDIE KLINIK","hari":2,"srcNo":86},{"no":"AC1186052","nama":"IRWAN SYAMIR BIN MOHD ZAINAL","jab":"IKTAR","komp":"ALPHA","dari":"2026-06-07","hingga":"2026-06-07","klinik":"H.K.L","hari":1,"srcNo":87},{"no":"IP0453578","nama":"NANTHAGOPAL A/L AYASAMY","jab":"RT","komp":"ALPHA","dari":"2026-06-08","hingga":"2026-06-08","klinik":"IJN","hari":1,"srcNo":88},{"no":"AF754571","nama":"AIZELI BIN ZABER","jab":"IKTAR","komp":"CHARLIE","dari":"2026-06-09","hingga":"2026-06-10","klinik":"K.K KUALA LUMPUR","hari":2,"srcNo":89},{"no":"MC53607","nama":"NUR SYUHADA BINTI MISNAN","jab":"MHKL","komp":"DELTA","dari":"2026-06-09","hingga":"2026-06-09","klinik":"KLINIK KITA","hari":1,"srcNo":90},{"no":"AC1183715","nama":"AALIYA AAUNI BINTI MAT ZABIR","jab":"IKTAR","komp":"ALPHA","dari":"2026-06-09","hingga":"2026-06-10","klinik":"KLINIK OSH","hari":2,"srcNo":91},{"no":"AC1184109","nama":"MOHD ILHAM BIN YUSOFF","jab":"MHKL","komp":"BRAVO","dari":"2026-06-09","hingga":"2026-06-09","klinik":"KLINIK OSH","hari":1,"srcNo":92},{"no":"AC1184109","nama":"MOHD ILHAM BIN YUSOFFF","jab":"MHKL","komp":"BRAVO","dari":"2026-06-09","hingga":"2026-06-09","klinik":"KLINIK OSH","hari":1,"srcNo":93},{"no":"IP0453578","nama":"NANTHAGOPAL A/L AYASAMY","jab":"RT","komp":"ALPHA","dari":"2026-06-09","hingga":"2026-06-19","klinik":"IJN","hari":11,"srcNo":94},{"no":"MC17164","nama":"MOHAMMAD ALIF BIN NASARUDDIN","jab":"MHKL","komp":"BRAVO","dari":"2026-06-11","hingga":"2026-06-11","klinik":"KLINIK AZMAN","hari":1,"srcNo":95},{"no":"","nama":"AALIYA AAUNI BINTI MAT ZABIR","jab":"IKTAR","komp":"ALPHA","dari":"2026-06-12","hingga":"2026-06-13","klinik":"POLIKLINIK UTARA","hari":2,"srcNo":96},{"no":"BH777018","nama":"MUHAMMAD FIRDAUS BIN SHUIB","jab":"MHKL","komp":"CHARLIE","dari":"2026-06-12","hingga":"2026-06-13","klinik":"KLINIK KESIHATAN SETAPAK","hari":2,"srcNo":97},{"no":"53252","nama":"MOHD AMINUDDIN BIN DAUD","jab":"IKTAR","komp":"ALPHA","dari":"2026-06-14","hingga":"2026-06-14","klinik":"KLINIK KITA","hari":1,"srcNo":98},{"no":"BB035033","nama":"MOHD KHADAFEE BIN MD SAAD","jab":"RT","komp":"BRAVO","dari":"2026-06-15","hingga":"2026-06-15","klinik":"KLINIK KESIHATAN JINJANG","hari":1,"srcNo":99},{"no":"MC 5424","nama":"MOHAMMAD ALIF BIN NASARUDDIN","jab":"MHKL","komp":"BRAVO","dari":"2026-06-16","hingga":"2026-06-16","klinik":"KLINIK EVE","hari":1,"srcNo":100},{"no":"2030906/25","nama":"MUHAMMAD ASHLEY BIN BASHIR","jab":"IKTAR","komp":"CHARLIE","dari":"2026-06-17","hingga":"2026-06-17","klinik":"KLINIK FAMILI WANGSA MELAWATI","hari":1,"srcNo":101},{"no":"7764","nama":"ANASHATOL ARNAEDA BINTI JAFRI","jab":"MHKL","komp":"BRAVO","dari":"2026-06-18","hingga":"2026-06-18","klinik":"KLINIK ZAHIDA","hari":1,"srcNo":102},{"no":"26/6044","nama":"YUSRI BIN YUNUS","jab":"RT","komp":"ALPHA","dari":"2026-06-18","hingga":"2026-06-18","klinik":"POLIKLINIK PRIMA","hari":1,"srcNo":103},{"no":"MC53827","nama":"MOHD AMINUDIN BIN DAUD","jab":"IKTAR","komp":"ALPHA","dari":"2026-06-19","hingga":"2026-06-19","klinik":"KLINIK KITA","hari":1,"srcNo":104},{"no":"MC15764","nama":"AALIYA AAUNI BINTI MAT ZABIR","jab":"IKTAR","komp":"ALPHA","dari":"2026-06-20","hingga":"2026-06-21","klinik":"KK PERUBATAN PRIMAKASIH","hari":2,"srcNo":105},{"no":"45238","nama":"FARRAH NATASHA BINTI ZULKAFLI","jab":"RT","komp":"CHARLIE","dari":"2026-06-21","hingga":"2026-06-21","klinik":"KLINIK SALLEH","hari":1,"srcNo":106},{"no":"BJ560714","nama":"AHMAD SHAMIL BIN NADZRI","jab":"IKTAR","komp":"DELTA","dari":"2026-06-23","hingga":"2026-06-23","klinik":"H. SUNGAI SIPUT","hari":1,"srcNo":107},{"no":"37068","nama":"KHAIROL ISZUWAN BIN ZAKARIA","jab":"RT","komp":"DELTA","dari":"2026-06-26","hingga":"2026-06-27","klinik":"KLINIK MUTIARA","hari":2,"srcNo":108},{"no":"105965","nama":"FARRAH NATASHA BINTI ZULKAFLI","jab":"RT","komp":"CHARLIE","dari":"2026-06-29","hingga":"2026-06-29","klinik":"POLIKLINIK AN-NISA","hari":1,"srcNo":109}];
function target(){var f=document.getElementById('system')||document.querySelector('iframe');try{if(f&&f.contentWindow&&f.contentDocument)return f.contentWindow}catch(e){}return window}
function get(W,n){try{return W.eval('typeof '+n+'!=="undefined"?'+n+':undefined')}catch(e){return W[n]}}
function put(W,n,v){try{W[n]=v;W.eval(n+'=window["'+n+'"]')}catch(e){W[n]=v}}
function up(s){return String(s==null?'':s).toUpperCase().replace(/MOHAMMAD|MUHAMMAD|MUHAMAD|MOHD|MUHD/g,'MOHAMAD').replace(/YUSOFFF/g,'YUSOFF').replace(/YUSOF/g,'YUSOFF').replace(/[^A-Z0-9 ]+/g,' ').replace(/\s+/g,' ').trim()}
function sig(s){return up(s).split(' ').filter(function(w){return w.length>=4&&!/^(BIN|BINTI|BT|BTE|A L|AL|MOHAMAD|KPL|KONST|PB|KPB|DAN)$/.test(w)})}
function daysOf(r){var a=new Date(r.dari+'T00:00:00Z'),b=new Date(r.hingga+'T00:00:00Z'),out=[];for(var t=a.getTime();t<=b.getTime();t+=86400000){var d=new Date(t);if(d.getUTCFullYear()===2026&&d.getUTCMonth()===5)out.push(d.getUTCDate())}return out}
function master(W){var M=get(W,'MASTER');return Array.isArray(M)?M:[]}
function data(W){var D=get(W,'D');return D&&typeof D==='object'?D:null}
function mcData(W){var M=get(W,'MC_DATA');if(Array.isArray(M))return M;try{var x=JSON.parse(W.localStorage.getItem('eakha_mc')||'[]');if(Array.isArray(x)){put(W,'MC_DATA',x);return x}}catch(e){}var a=[];put(W,'MC_DATA',a);return a}
function findMember(W,name){var M=master(W),rn=up(name);var exact=M.find(function(m){return up(m.nama)===rn});if(exact)return exact;var best=null,score=0,amb=false,rw=sig(rn);M.forEach(function(m){var mn=up(m.nama),mw=sig(m.nama),sc=0;if(mn.indexOf(rn)>=0||rn.indexOf(mn)>=0)sc=98;var hits=0;mw.forEach(function(w){if(rn.indexOf(w)>=0)hits++});if(mw.length)sc=Math.max(sc,Math.round((hits/mw.length)*100));var hits2=0;rw.forEach(function(w){if(mn.indexOf(w)>=0)hits2++});if(rw.length)sc=Math.max(sc,Math.round((hits2/rw.length)*100));if(hits>=2||hits2>=2)sc=Math.max(sc,85+Math.max(hits,hits2));if(sc>score){best=m;score=sc;amb=false}else if(sc===score&&sc>=85){amb=true}});return best&&score>=78&&!amb?best:null}
function recNo(x){return String((x&&(x.no_mc||x.siri||x.mc_no||x.no||x['NO RUJUKAN MC']))||'').toUpperCase().trim()}
function cellHasNo(c,no){if(!no)return false;try{return JSON.stringify(c&&((c._mc)||c.mc||c.mc_rec||'')).toUpperCase().indexOf(no.toUpperCase())>=0}catch(e){return false}}
function removeWrongCells(W,no,ownerBil,days){
  var D=data(W),removed=[];
  if(!D||!no)return removed;
  Object.keys(D).forEach(function(b){
    Object.keys(D[b]||{}).forEach(function(dd){
      var d=+dd,c=D[b][dd];
      if(!c)return;
      if(days.indexOf(d)<0)return;
      if(cellHasNo(c,no)&&+b!==+ownerBil){
        removed.push({fromBil:+b,day:d,no:no});
        delete c._mc;delete c.mc;delete c.mc_rec;
        if(c.audit_final&&String(c.audit_final).toUpperCase().indexOf('MC')>=0){
          delete c.audit_final;delete c.audit_status;delete c.final_audit;
        }
      }
    });
  });
  return removed;
}
function ensureMCRecord(W,off,owner,days){var arr=mcData(W),no=String(off.no||'').trim();var found=null;if(no)found=arr.find(function(r){return recNo(r)===no});if(!found){found={};arr.push(found)}found.no_mc=no;found.siri=no;found.bil=owner.bil;found.nama=owner.nama;found.jab=owner.jab||off.jab;found.komp=owner.komp||off.komp;found.d=days[0];found.m=6;found.y=2026;found.tarikh=String(days[0]).padStart(2,'0')+'/06/2026';found.dari=found.tarikh;found.hingga=String(days[days.length-1]).padStart(2,'0')+'/06/2026';found.hari=days.length;found.klinik=off.klinik||'';found.source='MC_OWNER_TRUTH_XLSX_51101';found._official_owner=off.nama;found._src_row=off.srcNo;found._days=days.slice();return found}
function apply(W,render){
  var D=data(W);if(!W||!W.document||!D||!master(W).length)return false;
  var fixed=[],failed=[];
  OFFICIAL.forEach(function(off){
    var no=String(off.no||'').trim(),days=daysOf(off),owner=findMember(W,off.nama);
    if(!owner||!days.length){failed.push({no:no,nama:off.nama,days:days.join(',')});return}
    var mcRec=ensureMCRecord(W,off,owner,days);
    var removed=removeWrongCells(W,no,owner.bil,days);
    days.forEach(function(d){
      if(!D[owner.bil])D[owner.bil]={};
      if(!D[owner.bil][d])D[owner.bil][d]={};
      var c=D[owner.bil][d];
      c._mc=mcRec;c.mc_src=PATCH;c.mc_owner_locked=off.nama;c.mc_owner_locked_at=new Date().toISOString();
      if(c.audit_final&&String(c.audit_final).toUpperCase().indexOf('MC')<0){delete c.audit_final;delete c.audit_status;delete c.final_audit}
    });
    if(removed.length||no==='MC14811')fixed.push({no:no,owner:owner.nama,bil:owner.bil,days:days.join(','),removed:removed.map(function(x){return x.fromBil+'@'+x.day}).join(' ')});
  });
  try{W.localStorage.setItem('eakha_mc',JSON.stringify(mcData(W)));W.localStorage.setItem('eakha_data',JSON.stringify(D))}catch(e){console.warn('[51101 save]',e)}
  try{if(render){var rm=get(W,'renderMaster');if(typeof rm==='function')rm(null);var rr=get(W,'renderMCReg');if(typeof rr==='function')rr();var uf=get(W,'updFlags');if(typeof uf==='function')uf()}}catch(e){}
  W.__EAKHA_51101_MC_OWNER_REPORT__={patch:PATCH,fixed:fixed,failed:failed,source:'MC_LENGKAP_1_SHEET_SEHINGGA_6_JULAI_2026.xlsx',at:new Date().toISOString()};
  try{console.table(fixed);if(failed.length)console.table(failed);console.log('[e-AKHA '+PATCH+']',W.__EAKHA_51101_MC_OWNER_REPORT__)}catch(e){}
  return true;
}
function install(W){
  if(W.__EAKHA_51101_INSTALLED__)return;
  W.__EAKHA_51101_INSTALLED__=true;
  W.eakhaApplyMCOwnerTruth51101=function(){return apply(W,true)};
  var oldGet=get(W,'getMC');
  if(typeof oldGet==='function'){
    put(W,'getMC',function(bil,d){
      var r=oldGet.apply(this,arguments);
      if(r&&recNo(r)){
        var off=OFFICIAL.find(function(o){return String(o.no||'').toUpperCase()===recNo(r)});
        if(off){var own=findMember(W,off.nama);if(own&&+own.bil!==+bil)return null}
      }
      return r;
    });
  }
}
function boot(render){var W=target();if(!W||!W.document)return false;install(W);return apply(W,render)}
var tries=0,timer=setInterval(function(){tries++;try{var ok=boot(tries>3);if(ok&&tries>30)clearInterval(timer);if(tries>240)clearInterval(timer)}catch(e){console.warn('[51101]',e);if(tries>240)clearInterval(timer)}},450);
try{var f=document.getElementById('system')||document.querySelector('iframe');if(f)f.addEventListener('load',function(){[500,1500,3000,6000,10000,16000].forEach(function(t){setTimeout(function(){try{boot(true)}catch(e){}},t)})})}catch(e){}
})();
