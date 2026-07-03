(()=>{
'use strict';
if(window.__EAKHA_51060_MASTER53__)return;
window.__EAKHA_51060_MASTER53__=true;
const DB='eakha_vsavage_safe_store',STORE='snapshots';
const W=()=>document.querySelector('iframe#app,iframe')?.contentWindow||window;
const U=v=>String(v??'').toUpperCase().replace(/\s+/g,' ').trim();
const C=v=>JSON.parse(JSON.stringify(v??null));
const isLatifa=v=>/LATIF(?:A|AH|AH?)\s+RO(?:B|D)ANIA/i.test(String(v||''));
const isAmirah=v=>/^AMIRAH\b/i.test(U(v));
const alias=v=>U(v).replace(/LATIFAH|LATIPAH/g,'LATIFA').replace(/RODANIA/g,'ROBANIA').replace(/MOHAMMAD|MUHAMMAD|MOHAMED/g,'MOHAMAD').replace(/\bALLIF\b/g,'ALIFF').replace(/\s+/g,' ');
function currentMonth(w){const n=Number(w.ACTIVE_MONTH);if(n===4||n===5)return n;const t=w.document?.body?.innerText||'';return /Bulan audit:\s*Mei/i.test(t)?5:4}
function monthOf(s){const n=Number(s?.bulan??s?.month??s?.activeMonth);if(n===4||n===5)return n;const m=[s?.id,s?.reason,s?.sourceSnapshot].join(' ').match(/2026[_\/-](0?[45])/);return m?Number(m[1]):0}
async function snapshots(){const db=await new Promise((ok,no)=>{const r=indexedDB.open(DB);r.onerror=()=>no(r.error);r.onsuccess=()=>ok(r.result)});if(!db.objectStoreNames.contains(STORE)){db.close();return []}const rows=await new Promise((ok,no)=>{const r=db.transaction(STORE,'readonly').objectStore(STORE).getAll();r.onsuccess=()=>ok(r.result||[]);r.onerror=()=>no(r.error)});db.close();return rows}
function latifaData(rows,month){for(const s of rows.filter(x=>monthOf(x)===month).sort((a,b)=>Date.parse(b.savedAt||0)-Date.parse(a.savedAt||0))){const person=(s.MASTER||[]).find(x=>isLatifa(x.nama??x.name));if(person){const d=s.D?.[String(person.bil)]??s.D?.[person.bil];if(d&&Object.keys(d).length)return C(d)}}return {}}
function labels(w){const walk=w.document.createTreeWalker(w.document.body,w.NodeFilter.SHOW_TEXT),nodes=[];while(walk.nextNode())nodes.push(walk.currentNode);for(const n of nodes)n.nodeValue=(n.nodeValue||'').replace(/Master File\s*\(52\s*Anggota\)/gi,'Master File (53 Anggota)').replace(/Master File\s*\(52\)/gi,'Master File (53)').replace(/Semua\s+52\b/gi,'Semua 53').replace(/\b52\s+anggota\b/gi,'53 anggota')}
function removeOld(w){const bad=['UPLOAD EXCEL GABUNGAN KZ','KEMASKINI KZP + KZK KE MASTER','KEMAS KINI KZP + KZK KE MASTER','FORCE 1 IRWAN 51034'];w.document.querySelectorAll('button,a,[role=button]').forEach(el=>{const t=U(el.textContent);if(bad.some(x=>t.includes(x)))el.remove()})}
async function fix(){const w=W(),master=Array.isArray(w.MASTER)?w.MASTER:null,D=w.D;if(!master||!D)return false;const month=currentMonth(w);let changed=false;for(let i=master.length-1;i>=0;i--){const n=master[i]?.nama??master[i]?.name;if(isAmirah(n)){master.splice(i,1);changed=true}}
const latifas=master.filter(x=>isLatifa(x.nama??x.name));if(latifas.length){const keep=latifas[0];keep.bil=53;keep.nama='LATIFA ROBANIA BINTI ABDUL RAZAK';keep.jab=keep.jabatan=keep.department='IKTAR';keep.komp=keep.kompeni=keep.company='DELTA';keep.aliases=['LATIFA RODANIA BINTI ABDUL RAZAK','LATIFAH ROBANIA BINTI ABDUL RAZAK','LATIPAH ROBANIA BINTI ABDUL RAZAK'];for(let i=master.length-1;i>=0;i--)if(master[i]!==keep&&isLatifa(master[i]?.nama??master[i]?.name)){master.splice(i,1);changed=true}}
else{master.push({bil:53,nama:'LATIFA ROBANIA BINTI ABDUL RAZAK',jab:'IKTAR',jabatan:'IKTAR',department:'IKTAR',komp:'DELTA',kompeni:'DELTA',company:'DELTA',aliases:['LATIFA RODANIA BINTI ABDUL RAZAK','LATIFAH ROBANIA BINTI ABDUL RAZAK','LATIPAH ROBANIA BINTI ABDUL RAZAK']});changed=true}
const seen=new Set();for(let i=master.length-1;i>=0;i--){const k=alias(master[i]?.nama??master[i]?.name);if(!k||seen.has(k)){if(!isLatifa(k)){master.splice(i,1);changed=true}}else seen.add(k)}
if(master.length>53){for(let i=master.length-1;i>=0&&master.length>53;i--)if(!isLatifa(master[i]?.nama??master[i]?.name)){master.splice(i,1);changed=true}}
if(!D['53']||!Object.keys(D['53']).length){const rows=await snapshots();D['53']=latifaData(rows,month);changed=true}
w.MASTER=master;w.D=D;labels(w);removeOld(w);for(const f of ['renderMaster','renderDash','updFlags'])try{if(typeof w[f]==='function')w[f](null)}catch(e){}labels(w);removeOld(w);window.EAKHA_51060_REPORT={month,master:master.length,latifa:master.filter(x=>isLatifa(x.nama)).length,owner53:!!D['53'],changed};console.log('[e-AKHA 51060]',window.EAKHA_51060_REPORT);return true}
let tries=0;const timer=setInterval(()=>{tries++;fix().then(ok=>{if(ok)clearInterval(timer)}).catch(console.error);if(tries>120)clearInterval(timer)},500);
const root=document.querySelector('iframe#app,iframe');root?.addEventListener('load',()=>setTimeout(fix,1000));
})();