/* e-AKHA v5.10.53 month-aware snapshot loader */
(()=>{
  'use strict';
  if(window.__EAKHA_MONTH_LOADER_51053)return;
  window.__EAKHA_MONTH_LOADER_51053=true;

  const DB='eakha_vsavage_safe_store';
  const STORE='snapshots';
  const FIELDS=['KZP_PRELOAD','KZK_PRELOAD','TIMECARD_PRELOAD','MC_PRELOAD','MC_DATA','MC_REF','HRMIS_PRELOAD','HRMIS_DATA','HRMIS_REF','CUTI_HRMIS_PRELOAD','CUTI_HRMIS_REF'];
  const clone=v=>JSON.parse(JSON.stringify(v));

  function openDb(){
    return new Promise((resolve,reject)=>{
      const req=indexedDB.open(DB);
      req.onerror=()=>reject(req.error);
      req.onsuccess=()=>resolve(req.result);
    });
  }

  function getSnapshot(db,id){
    return new Promise((resolve,reject)=>{
      const req=db.transaction(STORE,'readonly').objectStore(STORE).get(id);
      req.onsuccess=()=>resolve(req.result||null);
      req.onerror=()=>reject(req.error);
    });
  }

  function detectMonth(){
    const body=document.body?.innerText||'';
    if(/Bulan audit:\s*April\s*2026/i.test(body))return 4;
    if(/Bulan audit:\s*Mei\s*2026/i.test(body))return 5;
    const url=new URL(location.href);
    const q=Number(url.searchParams.get('month'));
    if(q===4||q===5)return q;
    const saved=Number(localStorage.getItem('eakha_active_month'));
    return saved===4||saved===5?saved:5;
  }

  function pointer(month){
    const mm=String(month).padStart(2,'0');
    return localStorage.getItem(`eakha_locked_snapshot_2026_${mm}`)||localStorage.getItem(`eakha_active_snapshot_2026_${mm}`)||'';
  }

  function render(){
    ['renderAllSafe','renderMaster','renderDash','updFlags','renderAuditFinal','renderHRMIS','renderCutiHRMIS'].forEach(name=>{
      try{if(typeof window[name]==='function')window[name](null);}catch(error){console.warn(name,error);}
    });
  }

  function fixLabels(month,count){
    const label=month===4?'April':'Mei';
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(node=>{
      const old=node.nodeValue||'';
      let next=old
        .replace(/Master File\s*\(\d+\s*Anggota\)/gi,`Master File (${count} Anggota)`)
        .replace(/Semua\s+\d+\b/gi,`Semua ${count}`)
        .replace(/\b\d+\s+anggota\b/gi,`${count} anggota`)
        .replace(/Bulan audit:\s*(April|Mei)\s*2026/gi,`Bulan audit: ${label} 2026`);
      if(next!==old)node.nodeValue=next;
    });
  }

  async function loadMonth(month){
    month=Number(month);
    if(month!==4&&month!==5)throw new Error('Bulan tidak sah');
    const id=pointer(month);
    if(!id)throw new Error(`Pointer bulan ${month} tidak dijumpai`);
    const db=await openDb();
    const snapshot=await getSnapshot(db,id);
    db.close();
    if(!snapshot)throw new Error(`Snapshot ${id} tidak dijumpai`);

    window.MASTER=clone(snapshot.MASTER||[]);
    window.D=clone(snapshot.D||{});
    FIELDS.forEach(name=>window[name]=clone(snapshot[name]||[]));
    window.ACTIVE_YEAR=2026;
    window.ACTIVE_MONTH=month;
    try{MASTER=window.MASTER;D=window.D;ACTIVE_YEAR=2026;ACTIVE_MONTH=month;}catch(error){}
    localStorage.setItem('eakha_active_month',String(month));
    localStorage.setItem('eakha_last_good_snapshot',id);

    render();
    setTimeout(render,700);
    setTimeout(()=>fixLabels(month,window.MASTER.length),150);
    setTimeout(()=>fixLabels(month,window.MASTER.length),900);

    window.EAKHA_MONTH_REPORT={version:'5.10.53',month,snapshot:id,master:window.MASTER.length,owners:Object.keys(window.D||{}).length};
    console.log('[e-AKHA month loader]',window.EAKHA_MONTH_REPORT);
    return snapshot;
  }

  window.eakhaLoadApril=()=>loadMonth(4);
  window.eakhaLoadMei=()=>loadMonth(5);
  window.eakhaLoadMonth=loadMonth;

  document.addEventListener('click',event=>{
    const target=event.target?.closest?.('button,a,[role="button"]');
    if(!target)return;
    const text=String(target.textContent||'').trim();
    if(/\bAPRIL\b/i.test(text))setTimeout(()=>loadMonth(4).catch(console.error),500);
    if(/\bMEI\b|\bMAY\b/i.test(text))setTimeout(()=>loadMonth(5).catch(console.error),500);
    if(/MASTER:\s*BULAN AKTIF|PULIH SNAPSHOT|PULIH DATA AUTO/i.test(text))setTimeout(()=>loadMonth(detectMonth()).catch(console.error),700);
  },true);

  setTimeout(()=>loadMonth(detectMonth()).catch(console.error),1200);
})();