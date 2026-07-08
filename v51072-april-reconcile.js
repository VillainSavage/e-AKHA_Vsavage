(()=>{
'use strict';
if(window.__EAKHA_51072_APRIL_RECONCILE__)return;
window.__EAKHA_51072_APRIL_RECONCILE__=true;
const MONTH=Number(new URL(location.href).searchParams.get('month'))===5?5:4;
if(MONTH!==4)return;
const DB='eakha_vsavage_safe_store',STORE='snapshots';
const CY=['P','P','S','S','M','M','O','O'];
const KO={ALPHA:0,CHARLIE:2,BRAVO:4,DELTA:6};
const SOURCE_ID='safe_FINAL_BEFORE_CLEAN_RELOAD_1782960660745';
const clone=v=>JSON.parse(JSON.stringify(v??null));
const obj=v=>v&&typeof v==='object'&&!Array.isArray(v);
const text=v=>String(v??'').trim();
const U=v=>text(v).toUpperCase().replace(/MOHAMMAD|MOHAMED|MUHAMMAD/g,'MOHAMAD').replace(/MUHD\b/g,'MOHD').replace(/MOHD\./g,'MOHD').replace(/HAIKAL/g,'HAIQAL').replace(/[^A-Z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();
function deep(){let w=window;for(let i=0;i<8;i++){let f=null;try{f=w.document?.querySelector('iframe#system,iframe#app,iframe')}catch(e){}if(!f?.contentWindow||f.contentWindow===w)break;try{if(!f.contentDocument?.documentElement)break}catch(e){break}w=f.contentWindow}return w}
function get(w,n){try{return w.eval(`typeof ${n}!=='undefined'?${n}:undefined`)}catch(e){return w[n]}}
function set(w,n,v){const cur=get(w,n),inc=clone(v);if(Array.isArray(cur)&&Array.isArray(inc)){cur.splice(0,cur.length,...inc);return cur}if(obj(cur)&&obj(inc)){Object.keys(cur).forEach(k=>delete cur[k]);Object.assign(cur,inc);return cur}w.__EAKHA_51072_TMP__=inc;try{w.eval(`${n}=window.__EAKHA_51072_TMP__`)}catch(e){try{w[n]=inc}catch(_){}}delete w.__EAKHA_51072_TMP__;return inc}
function call(w,n,...a){try{const f=w.eval(`typeof ${n}==='function'?${n}:null`)||w[n];if(typeof f==='function')return f(...a)}catch(e){}return undefined}
function logged(w){const t=U(w.document?.body?.innerText||'');return t.includes('MASTER FILE')&&!t.includes('ID PENGGUNA')}
function masters(w){const m=get(w,'MASTER');return Array.isArray(m)?m:[]}
function data(w){const d=get(w,'D');return obj(d)?d:null}
function memberByBil(w,b){return masters(w).find(m=>Number(m.bil)===Number(b))||null}
function company(m){return U(m?.komp||m?.kompeni||m?.company||'')}
function shiftForMember(m,d){const off=KO[company(m)]??0;const diff=d-1;return CY[((diff+off)%8+8)%8]}
function shiftFor(w,b,d){return shiftForMember(memberByBil(w,b),d)}
function installSchedule(w){
  const gs=function(bil,y,m,d){const mem=memberByBil(w,bil);if(!mem)return 'O';const ref=new Date(2026,3,1),dt=new Date(Number(y)||2026,(Number(m)||4)-1,Number(d)||1),diff=Math.round((dt-ref)/86400000),off=KO[company(mem)]??0;return CY[((diff+off)%8+8)%8]};
  const g=function(bil,d){return gs(bil,2026,4,d)};
  w.gShift=gs;w.gSh=g;try{w.eval('gShift=window.gShift;gSh=window.gSh')}catch(e){}
  const D=data(w);if(!D)return 0;let changed=0;
  masters(w).forEach(m=>{for(let d=1;d<=30;d++){const c=D[m.bil]?.[d]||D[String(m.bil)]?.[String(d)];if(!c)continue;const sh=shiftForMember(m,d);if(c.shift_hakiki!==sh){c.shift_hakiki=sh;changed++}if(!c.tc_shift||!['S','P','M','O','TH','TT'].includes(String(c.tc_shift).toUpperCase()))c.tc_shift=sh}});
  return changed;
}
function sig(n){return U(n).split(' ').filter(x=>x.length>=4&&!/^(BIN|BINTI|BT|BTE|MOHD|MOHAMAD|AL|A L)$/.test(x))}
function scoreName(a,b){a=U(a);b=U(b);if(!a||!b)return 0;if(a===b)return 100;if(a.includes(b)||b.includes(a))return 96;const x=sig(a),y=sig(b),hit=x.filter(w=>y.includes(w)).length;return Math.round(100*hit/Math.max(2,Math.max(x.length,y.length)))}
function recName(r){return r&&(r.nama||r.owner_name||r.patient_name||r.pemilik||r.owner||r.patient)||''}
function recNo(r){return U(r&&(r.no_mc||r.siri||r.no_siri||r.rujukan)||'')}
function recClinic(r){return U(r&&(r.klinik||r.clinic||r.fasiliti)||'')}
function dateObj(s){if(!s)return null;const x=text(s);let m;if((m=x.match(/^(\d{1,2})[.\/-](\d{1,2})(?:[.\/-](\d{2,4}))?$/))){let y=m[3]?Number(m[3]):2026;if(y<100)y+=2000;return {d:Number(m[1]),m:Number(m[2]),y}}if((m=x.match(/^(20\d{2})-(\d{1,2})-(\d{1,2})$/)))return {d:Number(m[3]),m:Number(m[2]),y:Number(m[1])};return null}
function recDates(r){let a=dateObj(r?.dari)||dateObj(r?.tarikh),z=dateObj(r?.hingga)||a,out=[];if(!a)return out;if(!z)z=a;let da=new Date(a.y,a.m-1,a.d),dz=new Date(z.y,z.m-1,z.d);if(dz<da)dz=da;for(let q=new Date(da);q<=dz&&out.length<40;q.setDate(q.getDate()+1))out.push({d:q.getDate(),m:q.getMonth()+1,y:q.getFullYear()});return out}
function bestMember(w,name){let best=null,score=0,ties=0;for(const m of masters(w)){const s=scoreName(name,m.nama);if(s>score){best=m;score=s;ties=0}else if(s===score&&s>=78)ties++}return best&&score>=78&&!ties?{m:best,score}:null}
function repairMC(w){const list=get(w,'MC_DATA');const D=data(w);if(!Array.isArray(list)||!D)return {records:0,remapped:0,duplicates:0,low:0};let remapped=0,low=0;const mapped=[];
  for(const raw of list){const r=clone(raw),nm=recName(r);if(nm){const hit=bestMember(w,nm);if(hit){if(Number(r.bil)!==Number(hit.m.bil))remapped++;r.bil=hit.m.bil;r.nama=hit.m.nama;r.jab=hit.m.jab||hit.m.jabatan||'';r.komp=hit.m.komp||hit.m.kompeni||'';r._owner_confidence_51072=hit.score}else{r._owner_low_confidence_51072=true;low++}}else if(!memberByBil(w,r.bil)){r._owner_low_confidence_51072=true;low++}mapped.push(r)}
  const seen={},keep=[],dups=[];for(const r of mapped){const ds=recDates(r),dt=ds[0]?`${ds[0].y}-${String(ds[0].m).padStart(2,'0')}-${String(ds[0].d).padStart(2,'0')}`:U(r.tarikh||r.dari||'');const key=`${U(recName(r))}|${dt}|${recNo(r)}|${recClinic(r)}`;if(seen[key])dups.push(r);else{seen[key]=1;keep.push(r)}}
  list.splice(0,list.length,...keep);for(const days of Object.values(D))for(const c of Object.values(days||{}))if(obj(c))delete c._mc;
  for(const r of keep){const b=Number(r.bil);if(!D[b]&&!D[String(b)])continue;for(const x of recDates(r)){if(x.y!==2026||x.m!==4)continue;const c=D[b]?.[x.d]||D[String(b)]?.[String(x.d)];if(c)c._mc=r}}
  try{w.localStorage.setItem('eakha_mc',JSON.stringify(list))}catch(e){}
  w.__EAKHA_MC_DUP_51072=dups;w.__EAKHA_MC_LOW_51072=keep.filter(r=>r._owner_low_confidence_51072);
  return {records:keep.length,remapped,duplicates:dups.length,low};
}
function enforceAsree(w){const D=data(w),list=get(w,'MC_DATA');if(!D)return 0;let count=0;for(const m of masters(w)){if(!(/\bASREE\b|\bASRI\b/.test(U(m.nama))&&/\bHAZIR\b/.test(U(m.nama))))continue;count++;for(let d=1;d<=30;d++){const c=D[m.bil]?.[d]||D[String(m.bil)]?.[String(d)];if(!c)continue;c.kzp='TH';c.kzk='TH';c.tc_in='';c.tc_out='';c.tc_all=[];c.tc_shift='TH';c.hrmis='';delete c._mc;c.note='TAHAN TUGAS'}if(Array.isArray(list)){for(let i=list.length-1;i>=0;i--)if(Number(list[i].bil)===Number(m.bil)||scoreName(recName(list[i]),m.nama)>=90)list.splice(i,1)}}return count}
function protectApril(w){
  const lock=function(msg){return function(){try{call(w,'toast',msg,'warn')}catch(e){}return false}};
  w.resetSystemData=lock('Reset April dikunci untuk elak data dipadam. Gunakan snapshot April yang dilindungi.');
  w.recompareAll=lock('Bandingkan Semula lama dikunci kerana pernah mengosongkan data April.');
  try{w.eval('resetSystemData=window.resetSystemData;recompareAll=window.recompareAll')}catch(e){}
}
async function syncSupabase(w){const client=get(w,'supa'),ok=get(w,'SUPA_OK');if(!client||!ok)return {ok:false,reason:'SUPABASE_NOT_READY',rows:0};const D=data(w),ms=masters(w);if(!D||ms.length<52)return {ok:false,reason:'DATA_NOT_READY',rows:0};let existing=[];try{const q=await client.from('audit_cells').select('bil,hari,shift_hakiki').eq('tahun',2026).eq('bulan',4);if(q.error)throw q.error;existing=q.data||[]}catch(e){return {ok:false,reason:'SELECT_FAILED',error:String(e?.message||e),rows:0}}
  const rows=[];for(const m of ms){for(let d=1;d<=30;d++){const c=D[m.bil]?.[d]||D[String(m.bil)]?.[String(d)]||{};const af=call(w,'auditFinal',m.bil,d)||{};rows.push({bil:Number(m.bil),tahun:2026,bulan:4,hari:d,shift_hakiki:shiftForMember(m,d),kz_penyelia:text(c.kzp),kz_koperal:text(c.kzk),tc_in:text(c.tc_in),tc_out:text(c.tc_out),ot_sambung:!!c.ot,hrmis:text(c.hrmis),pengganti:!!c.pengganti,note:text(c.note),audit_final:text(af.txt),updated_at:new Date().toISOString()})}}
  try{for(let i=0;i<rows.length;i+=100){const part=rows.slice(i,i+100);const q=await client.from('audit_cells').upsert(part,{onConflict:'bil,tahun,bulan,hari'});if(q.error)throw q.error}}catch(e){return {ok:false,reason:'UPSERT_FAILED',error:String(e?.message||e),rows:0}}
  const valid=new Set(ms.map(m=>Number(m.bil)));const invalid=existing.filter(r=>!valid.has(Number(r.bil))).length;return {ok:true,rows:rows.length,existing:existing.length,invalid};
}
function openDB(){return new Promise((ok,no)=>{const r=indexedDB.open(DB);r.onerror=()=>no(r.error);r.onsuccess=()=>ok(r.result)})}
function put(db,row){return new Promise((ok,no)=>{if(!db.objectStoreNames.contains(STORE)){ok(false);return}const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(row);tx.oncomplete=()=>ok(true);tx.onerror=()=>no(tx.error)})}
async function saveLockedSnapshot(w,report){try{const D=data(w),MASTER=masters(w);if(!D||MASTER.length<52)return null;const now=Date.now(),id=`safe_snapshot_2026_04_RECONCILED_51072_${now}`;const s={id,type:'EAKHA_LOCKED_MONTH_DATABASE',tahun:2026,bulan:4,savedAt:new Date().toISOString(),lockedAt:new Date().toISOString(),locked:true,immutable:true,reason:'APRIL 2026 reconciled from authoritative pre-clear snapshot, canonical duty schedule and current audit rules.',sourceSnapshot:SOURCE_ID,engineVersion:'5.10.72',MASTER:clone(MASTER),D:clone(D),report:clone(report)};for(const n of ['MC_DATA','HRMIS_DATA','CTR_DATA','KZP_PRELOAD','KZK_PRELOAD','TIMECARD_PRELOAD','MC_PRELOAD','HRMIS_PRELOAD','CUTI_HRMIS_PRELOAD']){const v=get(w,n);if(v!==undefined)s[n]=clone(v)}const db=await openDB();const ok=await put(db,s);db.close();if(!ok)return null;try{localStorage.setItem('eakha_locked_snapshot_2026_04',id);localStorage.setItem('eakha_active_snapshot_2026_04',id);localStorage.setItem('eakha_last_good_snapshot',id)}catch(e){}return id}catch(e){return null}}
function render(w){for(const n of ['renderMaster','renderDash','renderOutput','renderMCReg','renderHRMISReg','renderKZPStaging','renderKZKStaging','renderTCStaging','updFlags'])call(w,n,n==='renderOutput'?'':null)}
function banner(msg,ok=true){let el=document.getElementById('april-reconcile-status');if(!el){el=document.createElement('div');el.id='april-reconcile-status';el.style.cssText='position:fixed;left:10px;bottom:8px;z-index:99999;max-width:520px;padding:7px 10px;border-radius:6px;font:11px/1.35 system-ui;background:rgba(7,20,38,.96);border:1px solid '+(ok?'rgba(52,211,153,.45)':'rgba(248,113,113,.45)')+';color:'+(ok?'#6ee7b7':'#fca5a5');document.body.appendChild(el)}el.textContent=msg}
let running=false,done=false;
async function reconcile(){if(running||done)return false;const w=deep();if(!w||!logged(w))return false;const restore=window.EAKHA_51066_REPORT;if(!restore||restore.source!==SOURCE_ID){banner('Menunggu snapshot April sebelum data tersalah clear…',false);return false}const M=masters(w),D=data(w);if(M.length!==53||!D||Object.keys(D).length<52){banner('Snapshot April belum lengkap dimuatkan…',false);return false}running=true;try{const shifts=installSchedule(w),mc=repairMC(w),asree=enforceAsree(w);protectApril(w);try{w.localStorage.setItem('eakha_data',JSON.stringify(D));w.localStorage.setItem('eakha_mc',JSON.stringify(get(w,'MC_DATA')||[]))}catch(e){}render(w);const db=await syncSupabase(w);const report={ok:true,version:'5.10.72',source:restore.source,snapshotRestored:restore.snapshot,master:M.length,owners:Object.keys(D).length,shiftCellsFixed:shifts,mc,asree,db};const snap=await saveLockedSnapshot(w,report);report.lockedSnapshot=snap;window.EAKHA_51072_REPORT=report;done=true;banner(`April dipulihkan & disemak: ${M.length} anggota, ${db.ok?db.rows+' sel DB diselaraskan':'DB belum diselaraskan'}, MC remap ${mc.remapped}, duplicate ${mc.duplicates}.`,db.ok);console.log('[EAKHA 51072 APRIL RECONCILE]',report);render(w);return true}catch(e){window.EAKHA_51072_REPORT={ok:false,error:String(e?.message||e)};banner('Semakan April gagal: '+String(e?.message||e),false);console.error('[51072]',e);return false}finally{running=false}}
window.eakhaReconcileApril51072=reconcile;
let tries=0;const timer=setInterval(()=>{tries++;reconcile().then(ok=>{if(ok)clearInterval(timer)});if(tries>240)clearInterval(timer)},1500);
})();
