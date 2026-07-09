/* e-AKHA v5.10.96 — JUN 2026 HRMIS STAGING LINK TO MASTER
   Auto paut HRMIS staging/localStorage ke Master File Jun 2026.
   Tidak ubah KZ Penyelia/Koperal; hanya isi layer CUTI HRMIS + _hrmis_rec.
*/
(function(){
'use strict';
var PATCH='v5.10.96-JUN-HRMIS-LINK-MASTER';
function target(){var f=document.getElementById('system')||document.querySelector('iframe');try{if(f&&f.contentWindow&&f.contentDocument)return f.contentWindow}catch(e){}return window}
function get(W,n){try{return W.eval('typeof '+n+'!=="undefined"?'+n+':undefined')}catch(e){return W[n]}}
function put(W,n,v){try{W[n]=v;W.eval(n+'=window["'+n+'"]')}catch(e){W[n]=v}}
function up(s){return String(s==null?'':s).toUpperCase().replace(/^'+/,'').replace(/MOHAMMAD|MUHAMMAD|MUHAMAD|MOHD|MUHD/g,'MOHAMAD').replace(/HAIKAL/g,'HAIQAL').replace(/[^A-Z0-9 ]+/g,' ').replace(/\s+/g,' ').trim()}
function esc(s){return String(s==null?'':s)}
function uniq(arr){var seen={},out=[];(arr||[]).forEach(function(x){var k=JSON.stringify(x);if(!seen[k]){seen[k]=1;out.push(x)}});return out}
function parseJSON(raw){try{return JSON.parse(raw||'')}catch(e){return null}}
function lsArrays(W){var out=[];function add(a,src){if(Array.isArray(a))a.forEach(function(r){if(r&&typeof r==='object')out.push(Object.assign({_src_store:src},r))})}
  add(get(W,'HRMIS_DATA'),'HRMIS_DATA');add(get(W,'HRMIS_PRELOAD'),'HRMIS_PRELOAD');
  try{for(var i=0;i<W.localStorage.length;i++){var k=W.localStorage.key(i);if(!/hrmis/i.test(k||''))continue;var v=parseJSON(W.localStorage.getItem(k));if(Array.isArray(v))add(v,k);else if(v&&Array.isArray(v.HRMIS_DATA))add(v.HRMIS_DATA,k)}}catch(e){}
  return uniq(out.map(function(r){return r}))
}
function master(W){var M=get(W,'MASTER');return Array.isArray(M)?M:[]}
function data(W){var D=get(W,'D');return D&&typeof D==='object'?D:null}
function sig(s){return up(s).split(' ').filter(function(w){return w.length>=4&&!/^(BIN|BINTI|BT|BTE|A L|AL|MOHAMAD|MOHD|MUHD|KPL|KONST|KONSTABEL|PB|KPB|DAN)$/.test(w)})}
function nameText(r){return esc(r.nama||r.name||r.pemohon||r.anggota||r.nama_anggota||r.namaPemohon||r.owner||r.nama_owner||r.staff||r.member||r.person||'')}
function memberByBil(M,b){b=+b;if(!b)return null;return M.find(function(m){return +m.bil===b})||null}
function findMember(W,r){var M=master(W);var direct=memberByBil(M,r.bil||r.BIL||r.bil_master||r.master_bil||r.no_bil||r.member_bil);if(direct)return direct;
  var rn=up(nameText(r)); if(!rn)return null;
  var exact=M.find(function(m){return up(m.nama)===rn}); if(exact)return exact;
  var best=null,score=0,amb=false, rw=sig(rn);
  M.forEach(function(m){var mn=up(m.nama), mw=sig(m.nama), sc=0;if(rn.indexOf(mn)>=0||mn.indexOf(rn)>=0)sc=98;var hits=0;mw.forEach(function(w){if(rn.indexOf(w)>=0)hits++});if(mw.length)sc=Math.max(sc,Math.round((hits/mw.length)*100));if(rw.length){var hits2=0;rw.forEach(function(w){if(mn.indexOf(w)>=0)hits2++});sc=Math.max(sc,Math.round((hits2/rw.length)*100));}if(mw.length>=2&&hits>=2)sc=Math.max(sc,85+hits);if(sc>score){best=m;score=sc;amb=false}else if(sc===score&&sc>=80){amb=true}});
  return best&&score>=78&&!amb?best:null
}
function dateFromExcel(n){n=+n;if(!isFinite(n)||n<40000||n>60000)return null;var d=new Date(Math.round((n-25569)*86400*1000));return {d:d.getUTCDate(),m:d.getUTCMonth()+1,y:d.getUTCFullYear()}}
function collectDates(r){var vals=[];Object.keys(r||{}).forEach(function(k){var v=r[k];if(v==null)return;if(typeof v==='number'){var ed=dateFromExcel(v);if(ed)vals.push(ed)}vals.push(esc(v))});var txt=vals.join(' ');var ds=[],m;
  var re=/(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-]?(\d{2,4})?/g;while((m=re.exec(txt))){var dd=+m[1],mm=+m[2],yy=m[3]?+m[3]:2026;if(yy<100)yy+=2000;if(dd>=1&&dd<=31&&mm>=1&&mm<=12)ds.push({d:dd,m:mm,y:yy})}
  var re2=/(2026)[\/\.\-](\d{1,2})[\/\.\-](\d{1,2})/g;while((m=re2.exec(txt))){ds.push({d:+m[3],m:+m[2],y:+m[1]})}
  ds=uniq(ds).filter(function(x){return +x.m===6&&+x.y===2026&&x.d>=1&&x.d<=30});
  if(ds.length>=2){var sorted=ds.slice().sort(function(a,b){return a.d-b.d});var lo=sorted[0].d,hi=sorted[sorted.length-1].d;if(hi-lo>0&&hi-lo<=14&&/hingga|hingga|sampai|to|until|dari|mula|akhir|tamat/i.test(txt)){var all=[];for(var d=lo;d<=hi;d++)all.push({d:d,m:6,y:2026});return all}}
  var hari=+(esc(r.hari||r.tempoh||r.bil_hari||r.jumlah_hari||'').match(/\d+/)||[])[0]||0;
  if(ds.length===1&&hari>1){var a=[];for(var i=0;i<hari;i++)a.push({d:ds[0].d+i,m:6,y:2026});return a.filter(function(x){return x.d<=30})}
  return ds
}
function jenis(r){var s=esc(r.jenis||r.type||r.kodCuti||r.kod_cuti||r.cuti||r.leave_type||r.status_cuti||r.hrmis||'').toUpperCase();if(/BERSALIN|CBR|CB/.test(s))return 'CB';if(/EL|KECEMAS/.test(s))return 'EL';if(/CTR|TANPA REKOD/.test(s))return 'CTR';if(/KURSUS|PROGRAM|K\/P|KP/.test(s))return 'K/P';return s.match(/\b(CR|EL|MC|CTR|CBR|CB|K\/P|KP|CG|CSG)\b/)?.[1]||'CR'}
function link(W,render){var M=master(W),D=data(W),R=lsArrays(W);if(!M.length||!D||!R.length)return {total:R.length,linked:0,already:0,failed:R.length,rows:[]};var rows=[],linked=0,already=0,failed=0;
  R.forEach(function(r,idx){var mem=findMember(W,r), dates=collectDates(r), j=jenis(r);if(!mem||!dates.length){failed++;rows.push({no:idx+1,bil:r.bil||'',nama:nameText(r)||'(tiada nama)',tarikh:'-',jenis:j,status:'❌ GAGAL MATCH / TIADA TARIKH JUN'});return}
    dates.forEach(function(dt){var b=+mem.bil,d=+dt.d;if(!D[b])D[b]={};if(!D[b][d])D[b][d]={};var c=D[b][d];var before=!!(c.hrmis||c._hrmis_rec||c.hrmis_src);var label=j+' SAH';c.hrmis=label;c._hrmis_rec=Object.assign({},r,{bil:b,nama:mem.nama,d:d,m:6,y:2026,jenis:j,linked_by:PATCH});c.hrmis_src=PATCH;c.hrmis_linked_at=new Date().toISOString();if(before)already++;else linked++;rows.push({no:idx+1,bil:b,nama:mem.nama,tarikh:String(d).padStart(2,'0')+'/06/2026',jenis:j,status:before?'✅ SUDAH ADA — DIKEMASKINI':'✅ DIPAUT KE MASTER',master_hrmis:c.hrmis,ada_hrmis_rec:!!c._hrmis_rec})})
  });
  try{W.localStorage.setItem('eakha_data',JSON.stringify(D));W.localStorage.setItem('eakha_dataset_2026_6',JSON.stringify({D:D,HRMIS_DATA:R,updated_at:new Date().toISOString(),reason:PATCH}))}catch(e){}
  try{var save=get(W,'saveDataset');if(typeof save==='function')save('51096 HRMIS LINK MASTER')}catch(e){}
  if(render){try{var rm=get(W,'renderMaster');if(typeof rm==='function')rm(null);var hr=get(W,'renderHRMISReg');if(typeof hr==='function')hr();var uf=get(W,'updFlags');if(typeof uf==='function')uf();var rd=get(W,'renderDash');if(typeof rd==='function')rd()}catch(e){console.warn('[51096 render]',e)}}
  var rep={patch:PATCH,total_stage:R.length,linked:linked,already:already,failed:failed,rows:rows,at:new Date().toISOString()};W.__EAKHA_51096_HRMIS_REPORT__=rep;try{W.localStorage.setItem('eakha_51096_hrmis_report',JSON.stringify(rep))}catch(e){};try{console.table(rows);console.log('RINGKASAN HRMIS JUN 51096',rep)}catch(e){}return rep
}
function install(W){if(W.__EAKHA_51096_INSTALLED__)return;W.__EAKHA_51096_INSTALLED__=true;W.eakhaLinkHRMISJunToMaster51096=function(){return link(W,true)};var oldRM=get(W,'renderMaster');if(typeof oldRM==='function'&&!oldRM.__eakha51096){var wrap=function(){try{link(W,false)}catch(e){}return oldRM.apply(this,arguments)};wrap.__eakha51096=true;put(W,'renderMaster',wrap)}}
function apply(){var W=target();if(!W||!W.document)return false;install(W);link(W,true);return true}
var tries=0,timer=setInterval(function(){tries++;try{var ok=apply();if(ok&&tries>12)clearInterval(timer);if(tries>160)clearInterval(timer)}catch(e){console.warn('[51096]',e);if(tries>160)clearInterval(timer)}},700);
try{var f=document.getElementById('system')||document.querySelector('iframe');if(f)f.addEventListener('load',function(){[900,2200,5000,9000,14000].forEach(function(t){setTimeout(function(){try{apply()}catch(e){}},t)})})}catch(e){}
})();
