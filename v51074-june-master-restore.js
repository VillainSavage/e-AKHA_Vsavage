(function(){
  'use strict';
  var MONTH=Number(new URLSearchParams(location.search).get('month'));
  if(MONTH!==6||window.__EAKHA_JUNE_MASTER_PARENT_51074__)return;
  window.__EAKHA_JUNE_MASTER_PARENT_51074__=true;

  function installInBase(){
    'use strict';
    if(window.__EAKHA_JUNE_MASTER_51074__)return;
    window.__EAKHA_JUNE_MASTER_51074__=true;
    var PATCH='v5.10.74-JUNE-MASTER-LAYOUT-RESTORE';
    var STORE_KEY='eakha_june_master_restore_51074';

    function up(v){return String(v==null?'':v).toUpperCase().replace(/PENAMA/g,'').replace(/MOHAMMAD|MUHAMMAD|MUHAMAD|MOHAMED/g,'MOHAMAD').replace(/ROHISYAM/g,'ROHISHAM').replace(/AZLANNOOR/g,'AZLANNOR').replace(/YUSOFF/g,'YUSOF').replace(/NUR\s*SYUHADA/g,'NURSYUHADA').replace(/NANTHA\s*GOPAL/g,'NANTHAGOPAL').replace(/\bBINTI\b|\bBT\b|\bBIN\b/g,' ').replace(/\bAB\b|\bABD\b/g,' ABD ').replace(/[^A-Z0-9]+/g,'').trim()}
    function pad(n){return String(n).padStart(2,'0')}
    function mapKz(v){
      var s=String(v||'').toUpperCase().trim();
      if(s==='HADIR')return '✓';
      if(s==='OFF'||s==='OFFDAY')return 'OF';
      if(s==='KP')return 'K/P';
      return s;
    }
    function mapShift(v){var s=String(v||'').toUpperCase();return s==='PG'?'S':s==='PT'?'P':s==='OFF'?'O':s}
    function blankCell(){return{kzp:'',kzk:'',tc_in:'',tc_out:'',tc_all:[],ot:false,hrmis:'',pengganti:false,note:''}}
    function safeToast(msg,type){try{if(typeof toast==='function')toast(msg,type||'ok');else console.log(msg)}catch(e){console.log(msg)}}
    function ready(){try{return typeof MASTER!=='undefined'&&Array.isArray(MASTER)&&typeof D!=='undefined'&&typeof renderMaster==='function'}catch(e){return false}}

    function forceJuneContext(){
      try{ACTIVE_MONTH=6}catch(e){}
      try{ACTIVE_YEAR=2026}catch(e){}
      try{gSh=function(bil,d){return gShift(bil,2026,6,d)}}catch(e){}
      try{dow=function(d){return d%7}}catch(e){}
      try{daysInActiveMonth=function(){return 30}}catch(e){}
      try{
        var badge=document.getElementById('active-month-badge');if(badge)badge.textContent='Jun 2026';
        document.querySelectorAll('.month-item').forEach(function(x){x.classList.toggle('on',String(x.dataset.bulan)==='6')});
        document.title='e-AKHA Vsavage — Jun 2026 · Master File';
      }catch(e){}
    }

    function restoreRoster(){
      var latifa={bil:39,jab:'IKTAR',komp:'DELTA',nama:'LATIFA ROBANIA BINTI ABDUL RAZAK',mykad:'',staff_id:'60555'};
      var slot=MASTER.find(function(m){return /FAHMIE.*HAMIL/i.test(String(m.nama||''))})||MASTER.find(function(m){return +m.bil===39});
      if(slot){Object.keys(slot).forEach(function(k){delete slot[k]});Object.assign(slot,latifa)}
      else MASTER.push(latifa);
      var fixes={'60569':'AZLANNOR HADY BIN ABDUL TALIB','05564':'WAN NOR FATHIYYAH BINTI WAN AHMAD'};
      MASTER.forEach(function(m){
        if(fixes[String(m.staff_id||'')])m.nama=fixes[String(m.staff_id||'')];
        if(/ROHISYAM/i.test(m.nama||''))m.nama='ROHISHAM BIN MOHAMAD AROF';
        if(/FAHMIE.*HAMIL/i.test(m.nama||'')){m.pindah=true}
        if(+m.bil===39){delete m.pindah;m.jab='IKTAR';m.komp='DELTA';m.nama=latifa.nama;m.staff_id='60555'}
      });
      try{Object.keys(BK).forEach(function(k){delete BK[k]});MASTER.forEach(function(m){BK[m.bil]=m.komp})}catch(e){}
      if(!D[39])D[39]={};
      for(var d=1;d<=30;d++)D[39][d]=D[39][d]||blankCell();
      try{if(!BAKI[39])BAKI[39]={asal:0,cr:0,el:0}}catch(e){}
    }

    function findBaseMember(src){
      var sid=String(src&&src.staff_id||'').replace(/^0+/,'');
      if(sid){var byId=MASTER.find(function(m){return String(m.staff_id||'').replace(/^0+/,'')===sid});if(byId)return byId}
      var k=up(src&&src.nama);return MASTER.find(function(m){return up(m.nama)===k})||null;
    }

    function applySeedKzk(){
      var seed=parent&&parent.__EAKHA_JUNE_KZK_SEED__;
      if(!seed||!Array.isArray(seed.records))return 0;
      var count=0;
      seed.records.forEach(function(rec){
        var src={nama:rec[0],staff_id:''},m=findBaseMember(src);if(!m)return;
        var codes=String(rec[3]||'');
        D[m.bil]=D[m.bil]||{};
        for(var d=1;d<=30;d++){
          D[m.bil][d]=D[m.bil][d]||blankCell();
          var idx=parseInt(codes[d-1]||'1',36),v=seed.statuses&&seed.statuses[idx]||'TM';
          D[m.bil][d].kzk=mapKz(v);count++;
        }
      });
      return count;
    }

    function mergeState(st){
      if(!st||!st.D||!Array.isArray(st.master))return{members:0,cells:0,mc:0,hrmis:0};
      var stats={members:0,cells:0,mc:0,hrmis:0},seen={};
      try{if(!Array.isArray(MC_DATA))MC_DATA=[]}catch(e){}
      st.master.forEach(function(sm){
        var bm=findBaseMember(sm);if(!bm||/FAHMIE.*HAMIL/i.test(sm.nama||''))return;
        seen[bm.bil]=1;D[bm.bil]=D[bm.bil]||{};
        for(var d=1;d<=30;d++){
          var src=st.D[sm.bil]&&(st.D[sm.bil][d]||st.D[sm.bil][String(d)]);if(!src)continue;
          var dst=D[bm.bil][d]=D[bm.bil][d]||blankCell();
          if('kzp' in src)dst.kzp=mapKz(src.kzp);
          if('kzk' in src)dst.kzk=mapKz(src.kzk);
          dst.tc_in=src.tc_in||'';dst.tc_out=src.tc_out||'';
          dst.tc_all=Array.isArray(src.tc_all)?src.tc_all.slice():[dst.tc_in,dst.tc_out].filter(Boolean);
          dst.tc_shift=mapShift(src.tc_shift||'');dst.ot=!!src.ot;
          if(src.note&&!dst.note)dst.note=src.note;
          if(src.pengganti)dst.pengganti=src.pengganti;
          if(src.mc&&src.mc.clinic){
            var mc={bil:bm.bil,nama:bm.nama,jab:bm.jab,komp:bm.komp,d:d,m:6,dari:pad(d)+'/06',hingga:pad(d)+'/06',hari:1,klinik:src.mc.clinic,siri:src.mc.ref||'-',jenis:'Bulan Ini',source:src.mc.source||'MC DITERIMA'};
            dst._mc=mc;stats.mc++;
            try{if(!MC_DATA.some(function(x){return +x.bil===+bm.bil&&+x.d===d&&String(x.siri||'')===String(mc.siri)}))MC_DATA.push(mc)}catch(e){}
          }
          if(src.hrmis&&src.hrmis.type){dst.hrmis=mapKz(src.hrmis.type);dst._hrmis_rec=Object.assign({},src.hrmis,{bil:bm.bil,nama:bm.nama,d:d,m:6});stats.hrmis++}
          stats.cells++;
        }
      });
      stats.members=Object.keys(seen).length;return stats;
    }

    function readJuneState(){
      return new Promise(function(resolve){
        try{
          var req=indexedDB.open('eakha_june_2026_v1');
          req.onerror=function(){resolve(null)};
          req.onupgradeneeded=function(){try{req.transaction.abort()}catch(e){}resolve(null)};
          req.onsuccess=function(){
            var db=req.result;
            try{
              if(!db.objectStoreNames.contains('data')){db.close();return resolve(null)}
              var tx=db.transaction('data','readonly'),get=tx.objectStore('data').get('JUNE_2026');
              get.onsuccess=function(){var v=get.result;db.close();resolve(v||null)};
              get.onerror=function(){db.close();resolve(null)};
            }catch(e){try{db.close()}catch(_){}resolve(null)}
          };
        }catch(e){resolve(null)}
      })
    }

    function saveAndRender(stats){
      try{localStorage.setItem('eakha_data',JSON.stringify(D))}catch(e){}
      try{localStorage.setItem(STORE_KEY,JSON.stringify({at:new Date().toISOString(),stats:stats||{}}))}catch(e){}
      try{if(typeof saveDataset==='function')saveDataset('JUN 2026 · RESTORE MASTER LAYOUT')}catch(e){}
      try{if(typeof saveMonthData==='function')saveMonthData()}catch(e){}
      try{if(typeof renderMaster==='function')renderMaster(null)}catch(e){}
      try{if(typeof renderDash==='function')renderDash()}catch(e){}
      try{if(typeof updFlags==='function')updFlags()}catch(e){}
      try{
        var item=document.querySelector('.sb-item[data-pg="master"]');
        var app=document.getElementById('app');
        if(item&&app&&app.style.display!=='none'){
          if(typeof nav==='function')nav(item);else item.click();
        }
      }catch(e){}
      var msg=stats&&stats.members?'Master File asal dipulihkan · '+stats.members+' anggota data Jun dipadankan':'Master File asal dipulihkan · KZ Koperal Jun dimasukkan';
      safeToast(msg,'ok');
    }

    async function run(){
      if(!ready())return false;
      forceJuneContext();restoreRoster();
      var seedCells=applySeedKzk();
      var st=await readJuneState(),stats=mergeState(st);
      stats.seedKzk=seedCells;
      saveAndRender(stats);
      return true;
    }

    var tries=0,t=setInterval(function(){
      tries++;run().then(function(ok){if(ok||tries>30)clearInterval(t)}).catch(function(){if(tries>30)clearInterval(t)});
    },350);
    document.addEventListener('click',function(e){
      var x=e.target&&e.target.closest&&e.target.closest('.month-item[data-bulan="6"],.sb-item[data-pg="master"]');
      if(x)setTimeout(run,500);
    });
    try{console.log('[e-AKHA '+PATCH+'] loaded')}catch(e){}
  }

  var frame=document.getElementById('system');
  function inject(){
    try{
      var d=frame&&frame.contentDocument,w=frame&&frame.contentWindow;if(!d||!w||w.__EAKHA_JUNE_MASTER_51074__)return;
      var s=d.createElement('script');s.textContent='('+installInBase.toString()+')();';(d.head||d.documentElement).appendChild(s);
    }catch(e){console.warn('[51074 inject]',e)}
  }
  if(frame)frame.addEventListener('load',function(){setTimeout(inject,250)});
  [300,900,1800,3500,6500].forEach(function(ms){setTimeout(inject,ms)});
})();
