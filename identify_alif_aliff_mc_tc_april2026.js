/* e-AKHA April 2026: REPORT ONLY - Identify ALIF NASARUDDIN vs ALIFF MOHTAR MC + TIMECARD ownership
   No data changes. Builds evidence from MASTER, D, MC_PRELOAD, global TC arrays, and optional parsed TC JSON files.
*/
(async function(){
'use strict';
const P='identify-alif-aliff-mc-tc-april2026-v1';
if(!confirm('Run REPORT ONLY untuk bezakan ALIF NASARUDDIN vs ALIFF MOHTAR bagi MC & TIMECARD? Data tidak diubah.')) return;
const U=v=>String(v==null?'':v).toUpperCase()
  .replace(/MOHAMMAD|MUHAMMAD|MOHAMED|MOHAMMAAD/g,'MOHAMAD')
  .replace(/\bMUHD\b/g,'MOHD')
  .replace(/[^A-Z0-9 /@.-]+/g,' ')
  .replace(/\s+/g,' ')
  .trim();
const keyTerms=['ALIF','ALIFF','NASAR','NASARUDDIN','MOHTAR'];
const hasTerm=s=>keyTerms.some(t=>U(s).includes(t));
function tokens(s){return U(s).split(' ').filter(x=>x.length>2&&!/^(BIN|BINTI|BT|MOHD|MOHAMAD|A L|AL)$/.test(x));}
function scoreName(src,target){
  let a=U(src), b=U(target); if(!a||!b) return 0; let sc=0;
  if(a===b) sc+=120;
  if(a.includes(b)||b.includes(a)) sc+=90;
  const A=tokens(a), B=tokens(b); const hit=A.filter(x=>B.includes(x)).length;
  sc+=Math.round(hit/Math.max(A.length,1)*70);
  if(a.includes('NASAR')&&b.includes('NASAR')) sc+=60;
  if(a.includes('MOHTAR')&&b.includes('MOHTAR')) sc+=60;
  if(a.includes('NASAR')&&b.includes('MOHTAR')) sc-=80;
  if(a.includes('MOHTAR')&&b.includes('NASAR')) sc-=80;
  if(a.includes('ALIFF')&&b.includes('ALIFF')) sc+=20;
  if(a.includes('ALIFF')&&b.includes(' ALIF ')&&!b.includes('ALIFF')) sc-=15;
  return Math.max(0,sc);
}
function ownerHint(s){s=U(s); if(/NASAR/.test(s)) return 'ALIF NASARUDDIN'; if(/MOHTAR/.test(s)) return 'ALIFF MOHTAR'; if(/ALIFF/.test(s)) return 'ALIFF/ALIF AMBIGUOUS - perlu surname/ID'; if(/ALIF/.test(s)) return 'ALIF/ALIFF AMBIGUOUS - perlu surname/ID'; return '';}
function bestMember(name,cands){let best={bil:'',nama:'',score:0,hint:ownerHint(name)};(cands||[]).forEach(m=>{let s=scoreName(name,m.nama); if(s>best.score) best={bil:m.bil,nama:m.nama,score:s,hint:ownerHint(name)}}); return best;}
function idFields(o){if(!o) return ''; let ks=['mykad','no_kp','nokp','ic','kadpengenalan','no_staff','staff_id','staffid','id_staff','nopekerja','no_badan','no']; return ks.map(k=>o[k]||o[k.toUpperCase()]||'').filter(Boolean).join(' | ');}
function recName(r){return r&& (r.nama||r.name||r.owner||r.staff_name||r.raw_nama||r.pemohon||r.applicant||r.nama_pemohon||r.pesakit||r.nama_pesakit||r.employee||r.user||r.key||r.label)||'';}
function parseDate(s){s=String(s||''); let ymd=s.match(/(20\d{2})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/); if(ymd) return {y:+ymd[1],m:+ymd[2],d:+ymd[3]}; let dmy=s.match(/(\d{1,2})[\/\-.](\d{1,2})(?:[\/\-.](20\d{2}|\d{2}))?/); if(!dmy) return null; let y=dmy[3]?+dmy[3]:2026; if(y<100)y+=2000; return {d:+dmy[1],m:+dmy[2],y};}
function expandDates(r){ if(Array.isArray(r&&r._days)&&r._days.length) return r._days.map(d=>String(d).padStart(2,'0')+'/04/2026').join(', '); let a=parseDate(r&& (r.dari||r.tarikh_mula||r.tarikh||r.date||r.start||r.from)); let b=parseDate(r&& (r.hingga||r.tarikh_akhir||r.end||r.to))||a; if(!a) return ''; let out=[]; if(a.y===b.y&&a.m===b.m){for(let d=a.d;d<=b.d;d++)out.push(String(d).padStart(2,'0')+'/'+String(a.m).padStart(2,'0')+'/'+a.y)} else out.push(String(a.d).padStart(2,'0')+'/'+String(a.m).padStart(2,'0')+'/'+a.y); return out.join(', ');}
function flatten(obj,src,path='',out=[],limit=20000){
  if(!obj||out.length>limit) return out;
  if(Array.isArray(obj)){obj.forEach((x,i)=>flatten(x,src,path+'['+i+']',out,limit));return out;}
  if(typeof obj==='object'){
    let s=''; try{s=JSON.stringify(obj)}catch(e){}
    if(hasTerm(s)) out.push({src,path,obj});
    Object.keys(obj).slice(0,200).forEach(k=>{let v=obj[k]; if(v&&typeof v==='object') flatten(v,src,path?path+'.'+k:k,out,limit);});
  }
  return out;
}
async function tryFetchJSON(url){try{let r=await fetch(url+'?v='+Date.now()); if(!r.ok) return null; let txt=await r.text(); return JSON.parse(txt);}catch(e){return null}}
function collectArrays(pattern){let arr=[]; Object.keys(window).forEach(k=>{try{let v=window[k]; if(Array.isArray(v)&&pattern.test(k)) arr.push({key:k,arr:v});}catch(e){}}); return arr;}
if(typeof MASTER==='undefined'||typeof D==='undefined'){alert('Buka Master File April dahulu.'); return;}
const candidates=(MASTER||[]).filter(m=>hasTerm(m.nama)).map(m=>({bil:m.bil,nama:m.nama,jab:m.jab||m.jabatan||'',komp:m.komp||m.kompeni||'',id:idFields(m)}));
const candFull=(MASTER||[]).filter(m=>candidates.some(c=>+c.bil===+m.bil));
let mcSources=[]; collectArrays(/MC/i).forEach(src=>{src.arr.forEach((r,i)=>{let s='';try{s=JSON.stringify(r)}catch(e){} if(hasTerm(s)){let bm=bestMember(recName(r)||s,candFull); mcSources.push({source:src.key,idx:i,source_name:recName(r),hint:ownerHint(recName(r)||s),best_bil:bm.bil,best_nama:bm.nama,score:bm.score,klinik:r.klinik||'',no_mc:r.no_mc||r.siri||'',tarikh:expandDates(r),raw_id:idFields(r),raw:r});}})});
let tcMaster=[]; candidates.forEach(m=>{for(let d=1;d<=31;d++){let c=((D||{})[m.bil]||{})[d]; if(!c) continue; let has=!!(c.tc_in||c.tc_out||(Array.isArray(c.tc_all)&&c.tc_all.length)||c.tc_shift||c.tc_audit_status); if(has) tcMaster.push({bil:m.bil,nama:m.nama,tarikh:String(d).padStart(2,'0')+'/04/2026',tc_in:c.tc_in||'',tc_out:c.tc_out||'',tc_all:Array.isArray(c.tc_all)?c.tc_all.join(' | '):'',tc_shift:c.tc_shift||'',tc_status:c.tc_audit_status||'',tc_owner:c.tc_owner||c.tc_name||c.tc_nama||'',raw_id:c.tc_id||c.staff_id||c.no_staff||'',audit:c.audit_final||c.final_audit||''});}});
let tcSources=[]; collectArrays(/TC|TIMECARD|TIMECARE|PUNCH/i).forEach(src=>{src.arr.forEach((r,i)=>{let s='';try{s=JSON.stringify(r)}catch(e){} if(hasTerm(s)){let name=recName(r)||r.nama_anggota||r.employee_name||r.user_name||r.key||'';let bm=bestMember(name||s,candFull); tcSources.push({source:src.key,idx:i,source_name:name,hint:ownerHint(name||s),best_bil:bm.bil,best_nama:bm.nama,score:bm.score,tarikh:r.tarikh||r.date||r.tanggal||'',in:r.in||r.IN||r.tc_in||r.masuk||r.time_in||'',out:r.out||r.OUT||r.tc_out||r.keluar||r.time_out||'',raw_id:idFields(r),raw:r});}})});
// Fetch optional parsed TC JSON files uploaded to repo
let fetched=[];
const urls=['tc_april_2026_all_parsed_by_name.json','tc_april_2026_all_parsed_by_name.json.json'].map(p=>'https://raw.githubusercontent.com/VillainSavage/e-AKHA_Vsavage/main/'+p);
for(let u of urls){let j=await tryFetchJSON(u); if(j){fetched.push({url:u,json:j}); flatten(j,u,'',[]).forEach(x=>{let o=x.obj||{}; let name=recName(o)||x.path; let bm=bestMember(name||JSON.stringify(o),candFull); tcSources.push({source:'FETCHED_JSON',idx:x.path,source_name:name,hint:ownerHint(name||JSON.stringify(o)),best_bil:bm.bil,best_nama:bm.nama,score:bm.score,tarikh:o.tarikh||o.date||'',in:o.in||o.IN||o.tc_in||o.masuk||'',out:o.out||o.OUT||o.tc_out||o.keluar||'',raw_id:idFields(o),raw:o});});}}
// Verdicts
let mcVerdict=mcSources.map(x=>({source:x.source,idx:x.idx,source_name:x.source_name,hint:x.hint,best_bil:x.best_bil,best_nama:x.best_nama,score:x.score,klinik:x.klinik,no_mc:x.no_mc,tarikh:x.tarikh,verdict:(U(x.source_name).includes('NASAR')?'MC cenderung milik ALIF NASARUDDIN':U(x.source_name).includes('MOHTAR')?'MC cenderung milik ALIFF MOHTAR':x.score>=100?'Padanan kuat ikut source/bil':'Perlu semak manual/ID') }));
let tcVerdict=tcSources.map(x=>({source:x.source,idx:String(x.idx).slice(0,80),source_name:x.source_name,hint:x.hint,best_bil:x.best_bil,best_nama:x.best_nama,score:x.score,tarikh:x.tarikh,in:x.in,out:x.out,raw_id:x.raw_id,verdict:(U(x.source_name).includes('NASAR')?'TC cenderung milik ALIF NASARUDDIN':U(x.source_name).includes('MOHTAR')?'TC cenderung milik ALIFF MOHTAR':x.score>=100?'Padanan kuat ikut source/bil':'Perlu semak manual/ID') }));
window.ALIF_ALIFF_MC_TC_OWNER_REPORT={candidates,mcSources,mcVerdict,tcMaster,tcSources,tcVerdict,fetchedFiles:fetched.map(x=>x.url)};
console.log('ALIF_ALIFF_MC_TC_OWNER_REPORT',window.ALIF_ALIFF_MC_TC_OWNER_REPORT);
console.log('=== CALON MASTER ALIF/ALIFF/NASAR/MOHTAR ===');console.table(candidates);
console.log('=== MC SOURCE / VERDICT ===');console.table(mcVerdict);
console.log('=== TIMECARD DALAM MASTER D UNTUK CALON ===');console.table(tcMaster);
console.log('=== TIMECARD SOURCE / VERDICT ===');console.table(tcVerdict);
alert('Report siap. Calon: '+candidates.length+' | MC source: '+mcVerdict.length+' | TC source: '+tcVerdict.length+' | TC Master cells: '+tcMaster.length+'. Semak Console table.');
})();