(()=>{
'use strict';
let code=(window.__JUN_APP_PARTS__||[]).join('');
window.__JUN_APP_PARTS__=[];

function replaceRequired(pattern,replacement,label){
  const next=code.replace(pattern,replacement);
  if(next===code)throw new Error(`Patch e-AKHA gagal: ${label}`);
  code=next;
}
function addAlias(member,alias){
  member.aliases=Array.isArray(member.aliases)?member.aliases:[];
  if(alias&&!member.aliases.includes(alias))member.aliases.push(alias);
}

/* Roster sebenar: buang MOHD FAHMIE BIN HAMIL, kekalkan 52 anggota aktif. */
const rosterMatch=code.match(/const ROSTER=(\[[\s\S]*?\]);\nconst CYCLE=/);
if(!rosterMatch)throw new Error('Patch e-AKHA gagal: ROSTER tidak ditemui');
let roster=JSON.parse(rosterMatch[1]).filter(m=>String(m.nama||'').toUpperCase()!=='MOHD FAHMIE BIN HAMIL');
for(const m of roster){
  const oldName=String(m.nama||'');
  if(oldName==='ROHISYAM BIN MOHAMAD AROF'){
    m.nama='ROHISHAM BIN MOHAMAD AROF';
    addAlias(m,oldName);
  }
  if(oldName==='WAN NOR FATHIYYAH BINTI WAN AHMAD PENAMA'){
    m.nama='WAN NOR FATHIYYAH BINTI WAN AHMAD';
    addAlias(m,oldName);
  }
  if(m.nama==='AZLANNOR HADY BIN ABDUL TALIB')addAlias(m,'AZLANNOOR HADY BIN ABDUL TALIB');
  if(m.nama==='MOHAMMAD FITHRI BIN AB LATIF @ ABD LATIF')addAlias(m,'MOHAMMAD FITHRI BIN ABD LATIF @ ABD LATIF');
  if(m.nama==='NORAZLIDA BT RAZAB')addAlias(m,'NORAZLIDA BINTI RAZAB');
  if(m.nama==='NUR SYUHADA BINTI MISNAN')addAlias(m,'NURSYUHADA BINTI MISNAN');
  if(m.nama==='NANTHAGOPAL A/L AYASAMY')addAlias(m,'NANTHA GOPAL A/L AYASAMY');
}
roster=roster.map((m,i)=>({...m,bil:i+1}));
code=code.replace(rosterMatch[0],`const ROSTER=${JSON.stringify(roster)};\nconst CYCLE=`);

/* Semua paparan dan validasi mesti menggunakan 52 anggota. */
code=code
  .replace(/Master File \(53\)/g,'Master File (52)')
  .replace(/53 anggota/g,'52 anggota')
  .replace(/53 Anggota/g,'52 Anggota')
  .replace(/card\('Anggota',53\)/g,"card('Anggota',state.master.length)")
  .replace(/Backup bukan Jun 53 anggota/g,'Backup bukan Jun 52 anggota')
  .replace(/state\.master\.length!==53/g,'state.master.length!==52')
  .replace(/APP_VERSION='JUN-2026-STABLE-1\.0'/,"APP_VERSION='JUN-2026-STABLE-1.1-52'");

/* Tarikh mesti betul-betul berada dalam Jun 2026. */
replaceRequired(
  /const dayFromDate=v=>\{[\s\S]*?\};\n\nasync function sha256/,
  `const dayFromDate=v=>{const s=String(v||'').trim();const m=s.match(/^2026[-/]0?6[-/](\\d{1,2})$/);const n=m?Number(m[1]):NaN;return n>=1&&n<=30?n:null};\n\nasync function sha256`,
  'tarikh Jun'
);

/* Migrasi roster 53 -> 52 tanpa mengalih data anggota yang salah, dan seed KZ Koperal sebenar. */
replaceRequired(
  /async function loadState\(\)\{[\s\S]*?\}\nfunction ensureShape\(\)\{[\s\S]*?\}\n\nfunction nameKey/,
  `function looseName(v){return upper(v)
    .replace(/PENAMA/g,'')
    .replace(/MOHAMMAD|MUHAMMAD|MUHAMAD|MOHAMED/g,'MOHAMAD')
    .replace(/ROHISYAM/g,'ROHISHAM')
    .replace(/AZLANNOOR/g,'AZLANNOR')
    .replace(/NUR\\s*SYUHADA/g,'NURSYUHADA')
    .replace(/NANTHA\\s*GOPAL/g,'NANTHAGOPAL')
    .replace(/\\bBINTI\\b|\\bBT\\b|\\bBIN\\b/g,' ')
    .replace(/\\bAB\\b|\\bABD\\b/g,' ABD ')
    .replace(/[^A-Z0-9]+/g,'')
    .trim()}
function memberByIdentity(list,target){
  const sid=String(target?.staff_id||'').replace(/^0+/,'');
  if(sid){const byId=(list||[]).find(x=>String(x.staff_id||'').replace(/^0+/,'')===sid);if(byId)return byId}
  const keys=[target?.nama,...(target?.aliases||[])].map(looseName).filter(Boolean);
  return(list||[]).find(x=>[x?.nama,...(x?.aliases||[])].map(looseName).some(k=>keys.includes(k)))||null
}
function migrateJuneState(s){
  const version='ROSTER-52-NO-FAHMIE-20260709';
  const hasFahmie=(s.master||[]).some(m=>upper(m.nama)==='MOHD FAHMIE BIN HAMIL');
  if(s.rosterVersion===version&&Array.isArray(s.master)&&s.master.length===52&&!hasFahmie)return false;
  const oldMaster=Array.isArray(s.master)?clone(s.master):[];
  const oldD=s.D||{};
  const nextD={};
  for(const m of ROSTER){
    const old=memberByIdentity(oldMaster,m);
    nextD[m.bil]=clone(old&&oldD[old.bil]?oldD[old.bil]:{});
  }
  s.master=clone(ROSTER);
  s.D=nextD;
  s.staging=s.staging||{kzp:[],kzk:[],timecard:[],mc:[],hrmis:[]};
  for(const layer of Object.keys(LAYERS)){
    const oldRows=Array.isArray(s.staging[layer])?s.staging[layer]:[];
    s.staging[layer]=oldRows.map(r=>{
      if(r&&r.raw)return parseRow(layer,r.raw,r.rowNo||0);
      const old=oldMaster.find(x=>String(x.bil)===String(r?.bil))||memberByIdentity(oldMaster,{nama:r?.name||''});
      const now=old?memberByIdentity(ROSTER,old):memberByIdentity(ROSTER,{nama:r?.name||''});
      return now?{...r,bil:now.bil,matched:true,reason:r?.reason==='Nama/ID tidak dipadankan'?'':r?.reason}:r
    }).filter(Boolean);
  }
  s.rosterVersion=version;
  s.auditLog=Array.isArray(s.auditLog)?s.auditLog:[];
  s.auditLog.unshift({time:new Date().toISOString(),user:'SJN Adilah',action:'MIGRATE_ROSTER_52',detail:'MOHD FAHMIE BIN HAMIL dibuang; data anggota lain dipadan semula melalui ID/nama'});
  return true
}
function applyJuneKzkSeed(){
  const seed=window.__EAKHA_JUNE_KZK_SEED__;
  if(!seed||!Array.isArray(seed.records))return false;
  state.seedVersions=state.seedVersions||{};
  if(state.seedVersions.kzk===seed.version)return false;
  let cells=0,missing=[];
  for(const rec of seed.records){
    const recName=Array.isArray(rec)?rec[0]:rec.name;
    const member=state.master.find(m=>looseName(m.nama)===looseName(recName)||(m.aliases||[]).some(a=>looseName(a)===looseName(recName)));
    if(!member){missing.push(recName);continue}
    const codes=Array.isArray(rec)?String(rec[3]||''):'';
    for(let d=1;d<=DAYS;d++){
      const c=state.D[member.bil][d];
      const status=codes?(seed.statuses?.[parseInt(codes[d-1],36)]||'TM'):(rec.days?.[d]||rec.days?.[String(d)]||'TM');
      c.kzk=String(status).toUpperCase();
      cells++;
    }
  }
  state.seedVersions.kzk=seed.version;
  state.auditLog=Array.isArray(state.auditLog)?state.auditLog:[];
  state.auditLog.unshift({time:new Date().toISOString(),user:'SJN Adilah',action:'IMPORT_KZ_KOPERAL',detail:`${cells} sel · ${seed.source||seed.version}${missing.length?' · tidak padan: '+missing.join(', '):''}`});
  return true
}
async function loadState(){
  state=await idbGet(STORE,'JUNE_2026');
  let changed=false;
  if(!state||state.month!==6||!Array.isArray(state.master)){state=blankState();changed=true}
  else changed=migrateJuneState(state)||changed;
  ensureShape();
  changed=applyJuneKzkSeed()||changed;
  if(changed)await saveState()
}
function ensureShape(){
  state.master=clone(ROSTER);
  state.D=state.D||{};
  for(const m of ROSTER){
    state.D[m.bil]=state.D[m.bil]||{};
    for(let d=1;d<=DAYS;d++){
      state.D[m.bil][d]=state.D[m.bil][d]||{};
      const c=state.D[m.bil][d],off=shiftFor(m,d)==='OFF';
      if(!('kzp' in c))c.kzp=off?'OFF':'TM';
      if(!('kzk' in c))c.kzk=off?'OFF':'TM';
      if(off&&c.kzp==='TM')c.kzp='OFF';
      if(off&&c.kzk==='TM')c.kzk='OFF';
      if(!Array.isArray(c.tc_all))c.tc_all=[]
    }
  }
  state.staging=state.staging||{kzp:[],kzk:[],timecard:[],mc:[],hrmis:[]};
  for(const layer of Object.keys(LAYERS))if(!Array.isArray(state.staging[layer]))state.staging[layer]=[]
}\n\nfunction nameKey`,
  'migrasi roster dan seed KZK'
);

/* HRMIS hanya dikira sah selepas diluluskan. */
replaceRequired(
  /function validHr\(c\)\{[\s\S]*?\}\n\nfunction tcAudit/,
  `function validHr(c){const s=upper(c?.hrmis?.status);return !!(c?.hrmis?.type&&['SAH','LULUS','DILULUSKAN','APPROVED'].includes(s))}\n\nfunction tcAudit`,
  'validasi HRMIS'
);

/* Kiraan bulk staging mesti hanya rekod yang benar-benar sah. */
code=code.replace(/stag\.filter\(x=>x\.matched\)\.length/g,'stag.filter(x=>x.valid).length');

/* Parse staging MC/HRMIS berdasarkan tarikh sebenar, split julat silang bulan kepada bahagian Jun sahaja. */
replaceRequired(
  /function parseRow\(layer,row,rowNo\)\{[\s\S]*?\}function renderStaging/,
  `function juneRange(startValue,endValue){
    const start=parseDate(startValue),end=parseDate(endValue)||start;
    const rx=/^(\\d{4})-(\\d{2})-(\\d{2})$/;
    const sm=String(start||'').match(rx),em=String(end||'').match(rx);
    if(!sm||!em)return null;
    const a=Date.UTC(Number(sm[1]),Number(sm[2])-1,Number(sm[3]));
    const b=Date.UTC(Number(em[1]),Number(em[2])-1,Number(em[3]));
    if(!Number.isFinite(a)||!Number.isFinite(b)||b<a)return null;
    const js=Date.UTC(2026,5,1),je=Date.UTC(2026,5,30);
    const from=Math.max(a,js),to=Math.min(b,je);
    if(from>to)return null;
    return{start,end,fromDay:new Date(from).getUTCDate(),toDay:new Date(to).getUTCDate(),partial:a<js||b>je}
  }
function parseRow(layer,row,rowNo){
  const name=val(row,['NAMAANGGOTA','NAMA','NAME']),bil=val(row,['BIL','NO']),staff=val(row,['STAFFID','NOSTAF','IDSTAF']);
  const m=findMember(name,bil,staff);
  const base={rowNo,raw:row,name:String(name||''),bil:m?.bil||null,matched:!!m,reason:m?'':'Nama/ID tidak dipadankan'};
  if(layer==='kzp'||layer==='kzk'){
    const date=parseDate(val(row,['TARIKH','DATE'])),day=dayFromDate(date),status=normalizeKz(val(row,['STATUS','KZ','CATATAN']));
    const reason=base.reason||(!day?'Tarikh bukan Jun 2026':'');
    return{...base,date,day,status,reason,valid:!!m&&!!day}
  }
  if(layer==='timecard'){
    const date=parseDate(val(row,['TARIKH','DATE'])),day=dayFromDate(date),tin=normTime(val(row,['MASUK','IN','CLOCKIN'])),tout=normTime(val(row,['KELUAR','OUT','CLOCKOUT'])),all=uniqTimes(String(val(row,['PUNCH','THUMB','MASA'])).split(/[,;\\s]+/));
    const reason=base.reason||(!day?'Tarikh bukan Jun 2026':!(tin||tout||all.length)?'Tiada punch':'');
    return{...base,date,day,tin,tout,all,reason,valid:!!m&&!!day&&!!(tin||tout||all.length)}
  }
  if(layer==='mc'){
    const start=parseDate(val(row,['DARI','MULA','START','TARIKH'])),end=parseDate(val(row,['HINGGA','AKHIR','END']))||start,range=juneRange(start,end),clinic=String(val(row,['KLINIK','CLINIC'])||'').trim(),ref=String(val(row,['NOMC','NORUJUKAN','RUJUKAN','SIRI'])||'').trim();
    const reason=base.reason||(!range?'Tarikh MC tidak melibatkan Jun 2026':!clinic?'Nama klinik tiada':!ref?'No. rujukan MC tiada':'');
    return{...base,start,end,clinic,ref,fromDay:range?.fromDay||null,toDay:range?.toDay||null,partial:!!range?.partial,reason,valid:!!m&&!!range&&!!clinic&&!!ref}
  }
  if(layer==='hrmis'){
    const start=parseDate(val(row,['DARI','MULA','START','TARIKH'])),end=parseDate(val(row,['HINGGA','AKHIR','END']))||start,range=juneRange(start,end),type=normalizeKz(val(row,['JENIS','CUTI','TYPE'])),status=upper(val(row,['STATUS','KELULUSAN']))||'SAH',approved=['SAH','LULUS','DILULUSKAN','APPROVED'].includes(status);
    const reason=base.reason||(!range?'Tarikh cuti tidak melibatkan Jun 2026':!type?'Jenis cuti tiada':!approved?'HRMIS belum diluluskan':'');
    return{...base,start,end,type,status,fromDay:range?.fromDay||null,toDay:range?.toDay||null,partial:!!range?.partial,reason,valid:!!m&&!!range&&!!type&&approved}
  }
  return null
}
function renderStaging`,
  'parser staging'
);

/* Paparan staging berasingan: sah, tiada padanan, tarikh luar bulan, belum lengkap; sokong commit satu rekod. */
replaceRequired(
  /function renderStaging\(layer\)\{[\s\S]*?\}\nfunction stagingInfo/,
  `function renderStaging(layer){
    const rows=state.staging[layer]||[];
    const sah=rows.filter(r=>r.valid).length,unmatched=rows.filter(r=>!r.matched).length,outMonth=rows.filter(r=>/bukan Jun|tidak melibatkan Jun/i.test(r.reason||'')).length,incomplete=rows.length-sah-unmatched-outMonth;
    $('staging').innerHTML=rows.length?\`<div class="stage-summary"><b>Jumlah \${rows.length}</b> · Sah \${sah} · Tiada padanan \${unmatched} · Luar Jun \${outMonth} · Belum lengkap \${Math.max(0,incomplete)}</div><table><thead><tr><th>Baris</th><th>Nama</th><th>Padanan</th><th>Maklumat</th><th>Status</th><th>Tindakan</th></tr></thead><tbody>\${rows.slice(0,500).map((r,i)=>\`<tr class="\${r.valid?'ok':'badrow'}"><td>\${r.rowNo}</td><td>\${esc(r.name)}</td><td>\${r.matched?\`Bil \${r.bil}\`:esc(r.reason||'Nama/ID tidak dipadankan')}</td><td>\${esc(stagingInfo(layer,r))}</td><td>\${r.valid?'SAH':esc(r.reason||'SEMAK')}</td><td>\${r.valid?\`<button data-stage-row="\${i}">+ Masuk Master</button>\`:'-'}</td></tr>\`).join('')}</tbody></table>\`:'<p>Tiada rekod staging.</p>';
    document.querySelectorAll('[data-stage-row]').forEach(b=>b.onclick=()=>commitOneStaging(layer,Number(b.dataset.stageRow)))
  }
function stagingInfo`,
  'paparan staging'
);

replaceRequired(
  /function stagingInfo\(layer,r\)\{[\s\S]*?\}\nfunction commitStaging/,
  `function stagingInfo(layer,r){if(layer==='kzp'||layer==='kzk')return\`\${r.date} · \${r.status}\`;if(layer==='timecard')return\`\${r.date} · IN \${r.tin||'-'} · OUT \${r.tout||'-'} · \${r.all.join(', ')}\`;if(layer==='mc')return\`\${r.start}–\${r.end}\${r.partial?\` · bahagian Jun: \${r.fromDay}–\${r.toDay}\`:''} · \${r.clinic||'-'} · \${r.ref||'-'}\`;return\`\${r.start}–\${r.end}\${r.partial?\` · bahagian Jun: \${r.fromDay}–\${r.toDay}\`:''} · \${r.type||'-'} · \${r.status||'-'}\`}
function applyStagingRow(layer,r){let n=0;if(!r?.valid||!state.D[r.bil])return n;if(layer==='kzp'||layer==='kzk'){state.D[r.bil][r.day][layer]=r.status;n++}if(layer==='timecard'){const c=state.D[r.bil][r.day];c.tc_in=r.tin;c.tc_out=r.tout;c.tc_all=r.all;n++}if(layer==='mc'){for(let d=r.fromDay;d<=r.toDay;d++){state.D[r.bil][d].mc={clinic:r.clinic,ref:r.ref,start:r.start,end:r.end};n++}}if(layer==='hrmis'){for(let d=r.fromDay;d<=r.toDay;d++){state.D[r.bil][d].hrmis={type:r.type,status:r.status,start:r.start,end:r.end};n++}}return n}
function commitOneStaging(layer,index){const rows=state.staging[layer]||[],r=rows[index];if(!r?.valid)return toast('Rekod belum sah untuk dimasukkan',true);const n=applyStagingRow(layer,r);rows.splice(index,1);logAction('COMMIT_STAGING_ONE',\`\${layer}: \${r.name} · \${n} sel\`);debounceSave();renderLayer(layer);toast(\`\${n} rekod/sel dimasukkan\`)}
function commitStaging`,
  'tindakan staging satu rekod'
);

/* Bulk commit hanya rekod sah; rekod semak kekal dalam staging. */
replaceRequired(
  /function commitStaging\(layer\)\{[\s\S]*?\}\n\nfunction renderAudit/,
  `function commitStaging(layer){const all=state.staging[layer]||[],valid=all.filter(r=>r.valid);let n=0;for(const r of valid)n+=applyStagingRow(layer,r);state.staging[layer]=all.filter(r=>!r.valid);logAction('COMMIT_STAGING',\`\${layer}: \${n} sel\`);debounceSave();renderLayer(layer);toast(\`\${n} rekod/sel dimasukkan\`)}\n\nfunction renderAudit`,
  'commit staging'
);

/* Restore backup lama 53 masih dibenarkan, kemudian dimigrasi automatik ke 52. */
code=code.replace(
  /if\(s\.month!==6\|\|!Array\.isArray\(s\.master\)\|\|s\.master\.length!==52\)throw new Error\('Backup bukan Jun 52 anggota'\);state=s;ensureShape\(\);/,
  `if(s.month!==6||!Array.isArray(s.master)||![52,53].includes(s.master.length))throw new Error('Backup bukan data Jun yang sah');state=s;migrateJuneState(state);ensureShape();applyJuneKzkSeed();`
);

new Function(code)();
})();
