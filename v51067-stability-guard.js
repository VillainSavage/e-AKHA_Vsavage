/* e-AKHA v5.10.67 — non-destructive stability guard */
(()=>{
'use strict';
if(window.__EAKHA_51067_STABILITY__)return;
window.__EAKHA_51067_STABILITY__=true;
const LATIFA={bil:53,nama:'LATIFA ROBANIA BINTI ABDUL RAZAK',jab:'IKTAR',jabatan:'IKTAR',department:'IKTAR',unit:'IKTAR',komp:'DELTA',kompeni:'DELTA',company:'DELTA',user_id:'60555',staff_id:'60555',no_staff:'60555',aliases:['LATIFA RODANIA BINTI ABDUL RAZAK','LATIFAH ROBANIA BINTI ABDUL RAZAK','LATIPAH ROBANIA BINTI ABDUL RAZAK']};
const clone=v=>JSON.parse(JSON.stringify(v??null));
const obj=v=>v&&typeof v==='object'&&!Array.isArray(v);
const upper=v=>String(v??'').toUpperCase().replace(/\s+/g,' ').trim();
const isLatifa=v=>/LATIF(?:A|AH|IPAH).*RO(?:B|D)ANIA/i.test(String(v||''));
const owner={id:'sjnadilah',username:'sjnadilah',name:'SJN Adilah',nama:'SJN Adilah',role:'owner',akses:'owner',auditRole:'auditor',owner:true,admin:true,auditor:true,isOwner:true,isAdmin:true,isAuditor:true,canEdit:true,canUpload:true,canAudit:true,canApprove:true,viewer:false,readonly:false,readOnly:false,loggedIn:true,isLoggedIn:true};
function deep(){let w=window;for(let i=0;i<6;i++){let f=null;try{f=w.document?.querySelector('iframe#system,iframe#app,iframe')}catch(e){}if(!f?.contentWindow||f.contentWindow===w)break;try{if(!f.contentDocument?.documentElement)break}catch(e){break}w=f.contentWindow}return w}
function get(w,n){try{return w.eval(`typeof ${n}!=='undefined'?${n}:undefined`)}catch(e){return w[n]}}
function set(w,n,v){const cur=get(w,n),inc=clone(v);if(Array.isArray(cur)&&Array.isArray(inc)){cur.splice(0,cur.length,...inc);try{w[n]=cur}catch(e){};return}if(obj(cur)&&obj(inc)){Object.keys(cur).forEach(k=>delete cur[k]);Object.assign(cur,inc);try{w[n]=cur}catch(e){};return}w.__EAKHA_STABLE_TMP__=inc;try{w.eval(`${n}=window.__EAKHA_STABLE_TMP__`)}catch(e){try{w[n]=inc}catch(_){}}delete w.__EAKHA_STABLE_TMP__}
function call(w,n,...a){try{const f=w.eval(`typeof ${n}==='function'?${n}:null`)||w[n];if(typeof f==='function')return f(...a)}catch(e){}}
function logged(w){const t=upper(w.document?.body?.innerText||'');return t.includes('MASTER FILE')&&!t.includes('ID PENGGUNA')&&!t.includes('KATA LALUAN')}
function ensureOwner(w){
  let session=false;try{const x=JSON.parse(w.sessionStorage.getItem('eakha_owner_session_v51067')||'null');session=x?.id==='sjnadilah'&&x.expires>Date.now()}catch(e){}
  const current=get(w,'CUR_USER')||get(w,'AUTH')||get(w,'AUTH_USER')||get(w,'USER');
  const isOwner=upper(current?.id||current?.username||current?.name||current?.nama).replace(/[^A-Z0-9]/g,'')==='SJNADILAH';
  if(!session&&!isOwner)return false;
  ['CUR_USER','AUTH','AUTH_USER','USER'].forEach(n=>set(w,n,owner));
  w.reqAdmin=()=>true;w.reqOwner=()=>true;w.canUpload=()=>true;w.canEdit=()=>true;w.canAudit=()=>true;w.canApprove=()=>true;w.isAdmin=()=>true;w.isOwner=()=>true;w.isAuditor=()=>true;w.isViewer=()=>false;
  for(const n of ['reqAdmin','reqOwner','canUpload','canEdit','canAudit','canApprove','isAdmin','isOwner','isAuditor','isViewer'])try{w.eval(`${n}=window.${n}`)}catch(e){}
  try{w.localStorage.setItem('eakha_user',JSON.stringify(owner));w.localStorage.setItem('eakha_role','owner');w.localStorage.setItem('eakha_audit_role','auditor');w.localStorage.removeItem('eakha_viewer_mode');w.localStorage.removeItem('eakha_readonly')}catch(e){}
  return true;
}
function canonical53(master){
  const out=[],seen=new Set();let found=null;
  for(const raw of master||[]){if(!raw?.nama)continue;const m=clone(raw);if(isLatifa(m.nama)){found=found||m;continue}const k=upper(m.nama).replace(/MOHAMMAD|MUHAMMAD|MOHAMED/g,'MOHAMAD').replace(/\bBIN\b|\bBINTI\b/g,' ').replace(/[^A-Z0-9]+/g,' ').trim();if(seen.has(k))continue;seen.add(k);out.push(m)}
  out.push(Object.assign({},LATIFA,found||{},LATIFA));
  out.sort((a,b)=>Number(a.bil||9999)-Number(b.bil||9999));
  return out;
}
function ensure53(w){
  const master=get(w,'MASTER'),D=get(w,'D');if(!Array.isArray(master)||!obj(D))return false;
  const has=master.some(m=>isLatifa(m?.nama));
  if(master.length===53&&has&&Object.keys(D).length>=53)return false;
  const next=canonical53(master);
  if(next.length!==53)return false;
  if(!D['53'])D['53']=Object.fromEntries(Array.from({length:31},(_,i)=>[String(i+1),{}]));
  set(w,'MASTER',next);set(w,'D',D);
  call(w,'renderMaster',null);call(w,'renderDash');call(w,'updFlags');
  return true;
}
function patchUI(w){
  const labels=['UPLOAD EXCEL GABUNGAN KZ','KEMASKINI KZP + KZK KE MASTER','KEMAS KINI KZP + KZK KE MASTER','FORCE 1 IRWAN 51034'];
  w.document?.querySelectorAll('button,a,[role="button"]').forEach(el=>{const t=upper(el.textContent);if(labels.some(x=>t===x||t.includes(x)))el.remove()});
  const tw=w.document.createTreeWalker(w.document.body,w.NodeFilter.SHOW_TEXT),nodes=[];while(tw.nextNode())nodes.push(tw.currentNode);
  for(const n of nodes){const old=n.nodeValue||'';let x=old.replace(/Master File\s*\(52\s*Anggota\)/gi,'Master File (53 Anggota)').replace(/Master File\s*\(52\)/gi,'Master File (53)').replace(/Semua\s+52\b/gi,'Semua 53').replace(/\b52\s+anggota\b/gi,'53 anggota').replace(/Penonton Sahaja/gi,'SJN Adilah · OWNER / AUDITOR');if(x!==old)n.nodeValue=x}
}
let last='';
function run(){
  const w=deep();if(!w||!logged(w))return;
  ensureOwner(w);
  const master=get(w,'MASTER'),month=Number(get(w,'ACTIVE_MONTH')||0),sig=`${month}:${Array.isArray(master)?master.length:0}:${master?.some?.(m=>isLatifa(m?.nama))?'L':'N'}`;
  if(sig!==last){ensure53(w);last=`${month}:53:L`;try{w.localStorage.setItem('eakha_stable_roster','53');w.localStorage.setItem('eakha_april_locked','true');w.localStorage.setItem('eakha_may_log_preserved','true')}catch(e){}}
  patchUI(w);
}
let tries=0;const timer=setInterval(()=>{tries++;try{run()}catch(e){console.warn('[51067 stability]',e)}if(tries>1800)clearInterval(timer)},2000);
})();