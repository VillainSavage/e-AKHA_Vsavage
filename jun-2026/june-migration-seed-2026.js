(()=>{
  'use strict';
  const parts=window.__JUN_APP_PARTS__||[];
  if(!parts.length) throw new Error('June migration patch: app source belum dimuat');
  let code=parts.join('');
  const marker="if(sessionValid())bootApp().catch(e=>{console.error(e);showLogin()});else showLogin();";
  if(!code.includes(marker)) throw new Error('June migration patch: boot marker tidak ditemui');

  function installJuneCompletion(){
    const LEGACY_ROSTER_53=[
      {bil:1,nama:'AZROL NAIM BIN AB MALEK',staff_id:'05711'},
      {bil:2,nama:'MOHAMMAD ALIFF BIN MOHTAR',staff_id:'05734'},
      {bil:3,nama:'RIMA BINTI OTHMAN',staff_id:'05761'},
      {bil:4,nama:'ABDULLAH BIN BAHUDIN',staff_id:'05601'},
      {bil:5,nama:'MOHAMAD ALIFF HAIQAL BIN JAMIL',staff_id:'05529'},
      {bil:6,nama:'MUHAMMAD ASREE BIN HAZIR',staff_id:''},
      {bil:7,nama:'MOHD AMINUDIN BIN DAUD',staff_id:'05506'},
      {bil:8,nama:'MOHAMMAD FITHRI BIN AB LATIF @ ABD LATIF',staff_id:'05603'},
      {bil:9,nama:'MUHAMMAD ASHLEY BIN BASHIR',staff_id:'05477'},
      {bil:10,nama:'AHMAD SHAMIL BIN NADZRI',staff_id:'00013'},
      {bil:11,nama:'WAN NOR FATHIYYAH BINTI WAN AHMAD PENAMA',staff_id:'05564'},
      {bil:12,nama:'MUHAMMAD ZULHELMI BIN AHMAD AFAMI',staff_id:'00061'},
      {bil:13,nama:'MOHD RASIDI BIN MOHD NASIR',staff_id:'05531'},
      {bil:14,nama:'MUHAMMAD BADRI BIN ARIS',staff_id:'00019'},
      {bil:15,nama:'AALIYA AAUNI BINTI MAT ZABIR',staff_id:'00074'},
      {bil:16,nama:'AZLANNOR HADY BIN ABDUL TALIB',staff_id:'60569'},
      {bil:17,nama:'NORAZARIN BIN HUSSIN',staff_id:''},
      {bil:18,nama:'ROHISYAM BIN MOHAMAD AROF',staff_id:''},
      {bil:19,nama:'IRWAN SYAMIR BIN MOHD ZAINAL',staff_id:'05484'},
      {bil:20,nama:'NOR AINA NAZIRA BINTI MOHD TARMIZI',staff_id:'00071'},
      {bil:21,nama:'MOHD ILHAM BIN YUSOFF',staff_id:'05557'},
      {bil:22,nama:'MUHAMMAD TARMIZI BIN ABDULLAH',staff_id:'05573'},
      {bil:23,nama:'ZULKIFLI BIN YUSOF',staff_id:'05606'},
      {bil:24,nama:'HAZLAN BIN MOHD RESDI',staff_id:'05727'},
      {bil:25,nama:'MUHAMMAD AMIRULLAH BIN ABDUL SALIM',staff_id:'05718'},
      {bil:26,nama:'MOHD LUKMAN BIN HAMDAN',staff_id:'00002'},
      {bil:27,nama:'MOHAMAD IZAT AFIFUDDIN BIN MOHAMAD AZMI',staff_id:'05619'},
      {bil:28,nama:'MOHD SOFIE BIN MOHD SHUKRI',staff_id:'05512'},
      {bil:29,nama:'MOHAMMAD ALIF BIN NASARUDDIN',staff_id:'00014'},
      {bil:30,nama:'AZELI BIN ZABER',staff_id:'05610'},
      {bil:31,nama:'SUHAIRI BIN ISMAIL',staff_id:'05754'},
      {bil:32,nama:'NORAZLIDA BT RAZAB',staff_id:'00067'},
      {bil:33,nama:'ANASHATOL ARNAEDA BINTI JAFRI',staff_id:'05463'},
      {bil:34,nama:'MUHAMAD FAHMIE BIN SAHRAN',staff_id:'05473'},
      {bil:35,nama:'NUR SYUHADA BINTI MISNAN',staff_id:'00027'},
      {bil:36,nama:'ROSARIZAM BIN SAMSUDIN',staff_id:'05651'},
      {bil:37,nama:'YUSRI BIN YUNUS',staff_id:'05765'},
      {bil:38,nama:'MOHD KHADAFEE BIN MD SAAD',staff_id:'05607'},
      {bil:39,nama:'MOHD FAHMIE BIN HAMIL',staff_id:'05752'},
      {bil:40,nama:'SHAHRUL FITRI BIN ROSLI',staff_id:'05570'},
      {bil:41,nama:'MOHD SHAFIK BIN IBRAM',staff_id:'05554'},
      {bil:42,nama:'MUHAMMAD AFIQ FAIZ BIN BADRUDDIN',staff_id:'05530'},
      {bil:43,nama:'KHAIROL ISZUWAN BIN ZAKARIA',staff_id:'05549'},
      {bil:44,nama:'MUHAMMAD TARMIZI BIN SAZALI',staff_id:'05745'},
      {bil:45,nama:'MOHD SHAIFUL NIZAM BIN HAMID',staff_id:'05661'},
      {bil:46,nama:'NANTHAGOPAL A/L AYASAMY',staff_id:'05748'},
      {bil:47,nama:'ZULHILMI BIN ZAINUDIN',staff_id:'05561'},
      {bil:48,nama:'SAIFUL YUSRIZAL BIN YAACOB',staff_id:'05523'},
      {bil:49,nama:'NOR AZURA BINTI MAMAT @ MUHAMMAD',staff_id:'05550'},
      {bil:50,nama:'FARRAH NATASHA BINTI ZULKAFLI',staff_id:'05700'},
      {bil:51,nama:'MOHD NAZRI BIN ISMAIL',staff_id:'05632'},
      {bil:52,nama:'NUR AZIM BIN NASIRUDDIN',staff_id:'05715'},
      {bil:53,nama:'LATIFA ROBANIA BINTI ABDUL RAZAK',staff_id:'60555'}
    ];
    const EXCLUDED_NAMES=['NURUL AMIRAH BINTI MOHAMMAD','NORASHIKIN BINTI SHARUL','MOHAMAD AMIERUL BIN ADNAN','MUHAMMAD AMIERUL BIN ADNAN','MOHAMAD AMIRUL BIN ADNAN','MUHAMMAD AMIRUL BIN ADNAN','AMIRUL BIN ADNAN','MOHD FAHMIE BIN HAMIL'];
    const KZP_CONFIRMED={
      'MOHAMMAD ALIFF BIN MOHTAR':{4:'CR',6:'L',13:'L',16:'CR',17:'CR',29:'CR'},
      'ABDULLAH BIN BAHUDIN':{4:'L',15:'L',16:'CR',17:'CR',27:'L'},
      'MUHAMMAD TARMIZI BIN ABDULLAH':{15:'TM',21:'TM',29:'CR',30:'TM'},
      'MUHAMMAD TARMIZI BIN SAZALI':{2:'CR',14:'L',23:'L',25:'MC',26:'MC',27:'TM'}
    };
    const FIXED_KZP={'MUHAMMAD ASREE BIN HAZIR':'TH','MOHD AMINUDIN BIN DAUD':'TH','MOHD NAZRI BIN ISMAIL':'TH'};
    const HRMIS_CONFIRMED=[
      ['NUR AZIM BIN NASIRUDDIN','2026-06-20','2026-06-20','CR'],['MOHD KHADAFEE BIN MD SAAD','2026-06-24','2026-06-29','CR'],
      ['MUHAMMAD AMIRULLAH BIN ABDUL SALIM','2026-06-24','2026-06-24','CR'],['MOHAMMAD ALIFF BIN MOHTAR','2026-06-24','2026-06-24','CR'],
      ['MUHAMMAD TARMIZI BIN ABDULLAH','2026-06-28','2026-06-28','CR'],['NUR SYUHADA BINTI MISNAN','2026-06-30','2026-06-30','CR'],
      ['MUHAMMAD ASHLEY BIN BASHIR','2026-06-26','2026-06-26','CR'],['MUHAMMAD ZULHELMI BIN AHMAD AFAMI','2026-06-27','2026-06-27','CR'],
      ['MUHAMMAD BADRI BIN ARIS','2026-06-27','2026-06-28','CR'],['SHAHRUL FITRI BIN ROSLI','2026-06-28','2026-06-28','CR'],
      ['RIMA BINTI OTHMAN','2026-06-27','2026-06-27','CR'],['ZULHILMI BIN ZAINUDIN','2026-06-27','2026-06-27','CR'],
      ['MOHD SHAIFUL NIZAM BIN HAMID','2026-06-28','2026-06-28','CR'],['NUR AZIM BIN NASIRUDDIN','2026-06-28','2026-06-28','CR'],
      ['FARRAH NATASHA BINTI ZULKAFLI','2026-06-26','2026-06-26','CR'],['AZELI BIN ZABER','2026-06-30','2026-06-30','CR'],
      ['MUHAMAD FAHMIE BIN SAHRAN','2026-06-30','2026-06-30','CR']
    ];
    const MC_CONFIRMED=[
      ['NANTHAGOPAL A/L AYASAMY','2026-06-09','2026-06-19','IJN','IP0453578'],
      ['NANTHAGOPAL A/L AYASAMY','2026-06-20','2026-06-20','CARECLINICS KLINIK SERI INDAH SAMUDRA','D11EB7'],
      ['AALIYA AAUNI BINTI MAT ZABIR','2026-06-12','2026-06-13','POLIKLINIK UTARA','TIADA NO RUJUKAN PADA SUMBER'],
      ['NORAZLIDA BT RAZAB','2026-06-15','2026-06-15','HOSPITAL KUALA LIPIS','BH538654']
    ];

    function keyName(v){return upper(v).replace(/PENAMA/g,'').replace(/MOHAMMAD|MUHAMMAD|MUHAMAD|MOHAMED/g,'MOHAMAD').replace(/ROHISYAM/g,'ROHISHAM').replace(/YUSOFF/g,'YUSOF').replace(/NUR\s*SYUHADA/g,'NURSYUHADA').replace(/NANTHA\s*GOPAL/g,'NANTHAGOPAL').replace(/\bBINTI\b|\bBT\b|\bBIN\b/g,' ').replace(/\bAB\b|\bABD\b/g,' ABD ').replace(/[^A-Z0-9]+/g,'').trim()}
    function isExcluded(v){const k=keyName(v);return EXCLUDED_NAMES.some(x=>keyName(x)===k)}
    function memberByNameOrId(name,staff){const sid=String(staff||'').replace(/^0+/,'');if(sid){const x=state.master.find(m=>String(m.staff_id||'').replace(/^0+/,'')===sid);if(x)return x}const k=keyName(name);return state.master.find(m=>keyName(m.nama)===k||(m.aliases||[]).some(a=>keyName(a)===k))||null}
    function parseJsonDeep(v){let x=v;for(let i=0;i<4&&typeof x==='string';i++){try{x=JSON.parse(x)}catch(e){break}}return x}
    function findJunePayload(root){root=parseJsonDeep(root);if(!root||typeof root!=='object')return null;const direct=[root,root.state,root.dataset,root.payload,root.data].map(parseJsonDeep).filter(Boolean);for(const x of direct){if(x&&x.D&&Number(x.tahun||x.year||2026)===2026&&Number(x.bulan||x.month)===6)return x}const bags=[root.localStorage,root.local_storage,root.storage,root.items,root.data];for(const bag0 of bags){const bag=parseJsonDeep(bag0);if(!bag||typeof bag!=='object')continue;for(const [k,v] of Object.entries(bag)){if(/guard_last_good_dataset|snapshot.*2026.*06|dataset.*2026.*6|june|jun/i.test(k)){const x=parseJsonDeep(v);if(x&&x.D&&Number(x.tahun||x.year||2026)===2026&&Number(x.bulan||x.month)===6)return x}}}for(const [k,v] of Object.entries(root)){if(/guard_last_good_dataset|snapshot.*2026.*06|dataset.*2026.*6|june|jun/i.test(k)){const x=parseJsonDeep(v);if(x&&x.D&&Number(x.tahun||x.year||2026)===2026&&Number(x.bulan||x.month)===6)return x}}return null}
    function isoDate(v){if(!v)return'';let s=String(v).trim(),m;if((m=s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/)))return m[1]+'-'+pad(+m[2])+'-'+pad(+m[3]);if((m=s.match(/^(\d{1,2})[-/.](\d{1,2})(?:[-/.](\d{4}))?$/)))return (m[3]||'2026')+'-'+pad(+m[2])+'-'+pad(+m[1]);return s}
    function juneDays(start,end){const a=isoDate(start),b=isoDate(end||start),rx=/^2026-06-(\d{2})$/;const am=a.match(rx),bm=b.match(rx);if(!am||!bm)return[];const x=+am[1],y=+bm[1];if(x<1||y>30||y<x)return[];return Array.from({length:y-x+1},(_,i)=>x+i)}
    function normalizeOldMc(raw){if(!raw||typeof raw!=='object')return null;const clinic=String(raw.clinic||raw.klinik||raw.nama_klinik||'').trim();const ref=String(raw.ref||raw.no_mc||raw.siri||raw.no_rujukan||'').trim();const start=isoDate(raw.start||raw.dari||raw.tarikh||''),end=isoDate(raw.end||raw.hingga||raw.dari||raw.tarikh||'');if(!clinic)return null;return{clinic,ref:ref||'TIADA NO RUJUKAN PADA SUMBER',start,end}}
    function normalizeOldHr(raw){if(!raw)return null;if(typeof raw==='string'){const type=normalizeKz(raw);if(!isLeave(type))return null;return{type,status:'SAH',start:'',end:''}}const type=normalizeKz(raw.type||raw.jenis||raw.kodCuti||raw.kod_cuti||raw.cuti||''),status=upper(raw.status||raw.kelulusan||raw.keputusan||'SAH');if(!isLeave(type)||['DITOLAK','BATAL','REJECTED'].includes(status))return null;return{type,status:['SAH','LULUS','DILULUSKAN','APPROVED'].includes(status)?status:'SAH',start:isoDate(raw.start||raw.dari||''),end:isoDate(raw.end||raw.hingga||raw.dari||'')}}
    function mergeMcArray(rows,stats){for(const r of Array.isArray(rows)?rows:[]){if(isExcluded(r.nama||r.name))continue;const m=memberByNameOrId(r.nama||r.name,r.staff_id);if(!m)continue;const mc=normalizeOldMc(r);if(!mc)continue;for(const d of juneDays(mc.start,mc.end)){state.D[m.bil][d].mc=mc;state.D[m.bil][d].mc_checked=true;stats.mc++}}}
    function mergeHrArray(rows,stats){for(const r of Array.isArray(rows)?rows:[]){if(isExcluded(r.nama||r.name))continue;const m=memberByNameOrId(r.nama||r.name,r.staff_id);if(!m)continue;const hr=normalizeOldHr(r);if(!hr)continue;const start=isoDate(r.start||r.dari||r.tarikh_mula||''),end=isoDate(r.end||r.hingga||r.tarikh_tamat||start);for(const d of juneDays(start,end)){state.D[m.bil][d].hrmis={...hr,start,end};state.D[m.bil][d].hrmis_checked=true;stats.hrmis++}}}
    function applyConfirmedSeeds(stats){for(const [name,start,end,type] of HRMIS_CONFIRMED){const m=memberByNameOrId(name,'');if(!m||isExcluded(name))continue;for(const d of juneDays(start,end)){state.D[m.bil][d].hrmis={type,status:'SAH',start,end,source:'HRMIS DITERIMA'};state.D[m.bil][d].hrmis_checked=true;stats.hrmis++}}for(const [name,start,end,clinic,ref] of MC_CONFIRMED){const m=memberByNameOrId(name,'');if(!m||isExcluded(name))continue;for(const d of juneDays(start,end)){state.D[m.bil][d].mc={clinic,ref,start,end,source:'MC DITERIMA'};state.D[m.bil][d].mc_checked=true;stats.mc++}}}
    function applyKzpCompletion(stats,legacyD,oldRoster){for(const m of state.master){const fixed=FIXED_KZP[m.nama];for(let d=1;d<=DAYS;d++){const c=state.D[m.bil][d],off=shiftFor(m,d)==='OFF';if(off){c.kzp='OFF';c.kzp_checked=true;continue}if(fixed){c.kzp=fixed;c.kzp_checked=true;continue}if(!c.kzp||normalizeKz(c.kzp)==='TM'){const old=oldRoster.find(x=>memberByNameOrId(x.nama,x.staff_id)?.bil===m.bil),src=old&&legacyD?.[old.bil]?.[d],explicit=src&&String(src.kzp||'').trim();c.kzp=explicit?normalizeKz(explicit):'HADIR'}c.kzp_checked=true}}for(const [name,days] of Object.entries(KZP_CONFIRMED)){const m=memberByNameOrId(name,'');if(!m)continue;for(const [d,v] of Object.entries(days)){state.D[m.bil][+d].kzp=normalizeKz(v);state.D[m.bil][+d].kzp_checked=true;stats.kzp++}}}
    function mergeLegacyJune(payload,sourceLabel){const p=findJunePayload(payload);if(!p||!p.D)return{found:false,source:sourceLabel||'tiada',kzp:0,kzk:0,timecard:0,mc:0,hrmis:0,members:0};const oldRoster=Array.isArray(p.MASTER)?p.MASTER:Array.isArray(p.master)?p.master:LEGACY_ROSTER_53;const stats={found:true,source:sourceLabel||'legacy',kzp:0,kzk:0,timecard:0,mc:0,hrmis:0,members:0,savedAt:p.savedAt||''},seen=new Set();for(const [oldBil,days] of Object.entries(p.D||{})){const old=oldRoster.find(x=>String(x.bil)===String(oldBil))||LEGACY_ROSTER_53.find(x=>String(x.bil)===String(oldBil));if(!old||isExcluded(old.nama))continue;const m=memberByNameOrId(old.nama,old.staff_id);if(!m)continue;seen.add(m.bil);for(let d=1;d<=DAYS;d++){const src=days?.[d]||days?.[String(d)]||{},dst=state.D[m.bil][d],kz1=String(src.kzp||'').trim(),kz2=String(src.kzk||'').trim();if(kz1){dst.kzp=normalizeKz(kz1);stats.kzp++}if(kz2&&(!dst.kzk||normalizeKz(dst.kzk)==='TM')){dst.kzk=normalizeKz(kz2);stats.kzk++}const all=uniqTimes([...(Array.isArray(src.tc_all)?src.tc_all:[]),src.tc_in,src.tc_out]);if(all.length||src.tc_in||src.tc_out){dst.tc_in=normTime(src.tc_in)||all[0]||'';dst.tc_out=normTime(src.tc_out)||(all.length>1?all[all.length-1]:'');dst.tc_all=all;dst.tc_shift=src.tc_shift||dst.tc_shift||'';stats.timecard++}dst.tc_checked=true;dst.mc_checked=true;dst.hrmis_checked=true;const mc=normalizeOldMc(src.mc||src._mc);if(mc){dst.mc=mc;stats.mc++}const hr=normalizeOldHr(src.hrmis);if(hr){dst.hrmis=hr;stats.hrmis++}if(src.note&&!dst.note)dst.note=src.note;if(src.pengganti)dst.pengganti=src.pengganti}}stats.members=seen.size;mergeMcArray(p.MC_DATA||p.mc_data,stats);mergeHrArray(p.HRMIS_DATA||p.hrmis_data,stats);applyKzpCompletion(stats,p.D,oldRoster);applyConfirmedSeeds(stats);for(const m of state.master)for(let d=1;d<=DAYS;d++){const c=state.D[m.bil][d];if(shiftFor(m,d)==='OFF'){c.kzp='OFF';c.kzk='OFF';c.tc_checked=c.mc_checked=c.hrmis_checked=true}else{if(!('tc_checked' in c))c.tc_checked=true;if(!('mc_checked' in c))c.mc_checked=true;if(!('hrmis_checked' in c))c.hrmis_checked=true}}state.legacyJuneMigration={version:'JUNE-COMPLETE-20260709-1',...stats,importedAt:new Date().toISOString()};logAction('IMPORT_JUNE_LEGACY',stats.members+' anggota · KZP '+stats.kzp+' · KZK '+stats.kzk+' · TC '+stats.timecard+' · MC '+stats.mc+' · HRMIS '+stats.hrmis+' · '+stats.source);return stats}
    function localLegacyPayload(){const keys=['eakha_guard_last_good_dataset','eakha_dataset_2026_6','eakha_dataset_2026_06','eakha_snapshot_latest_2026_06'];for(const k of keys){try{const v=localStorage.getItem(k);if(v){const p=findJunePayload(v);if(p)return{payload:p,label:'localStorage:'+k}}}catch(e){}}try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(!/eakha/i.test(k||''))continue;const v=localStorage.getItem(k),p=findJunePayload(v);if(p)return{payload:p,label:'localStorage:'+k}}}catch(e){}return null}
    function layerStats(){const total=state.master.length*DAYS,out={total,shift:total,kzp:0,kzk:0,timecard:0,mc:0,hrmis:0,audit:total};for(const m of state.master)for(let d=1;d<=DAYS;d++){const c=state.D[m.bil][d],off=shiftFor(m,d)==='OFF';if(c.kzp||off)out.kzp++;if(c.kzk||off)out.kzk++;if(c.tc_checked||off)out.timecard++;if(c.mc_checked||off)out.mc++;if(c.hrmis_checked||off)out.hrmis++}return out}
    function bosRows(){return state.master.map(m=>{let sah=0,mc=0,cuti=0,abs=0,semak=0,off=0;for(let d=1;d<=DAYS;d++){const a=auditCell(m,d);if(a==='SAH')sah++;else if(a.startsWith('MC SAH'))mc++;else if(/^(CR|EL|CTR|CB|PELEPASAN|KP) SAH/.test(a))cuti++;else if(a.startsWith('ABS'))abs++;else if(a==='OFF')off++;else semak++}return{m,sah,mc,cuti,abs,semak,off}})}
    function renderBosSnapshot(){const c=counts(),ls=layerStats(),rows=bosRows(),complete=ls.shift===ls.total&&ls.kzp===ls.total&&ls.kzk===ls.total&&ls.timecard===ls.total&&ls.mc===ls.total&&ls.hrmis===ls.total&&ls.audit===ls.total,mig=state.legacyJuneMigration||{};$('view').innerHTML='<div class="panel print"><div class="row"><div><h2>SNAPSHOT BOS — JUN 2026</h2><p>Dijana '+esc(new Date().toLocaleString('ms-MY'))+' · Owner: SJN Adilah</p></div><button id="bosPrint">PDF / Print Snapshot</button></div><div class="cards">'+card('Anggota',state.master.length)+card('Hadir Sah',c.SAH)+card('MC Sah',c.MC)+card('Cuti Sah',c.HRMIS)+card('ABS',c.ABS)+card('OFFDAY',c.OFF)+card('TH/TT',c.TH)+card('Semak',c.SEMAK)+'</div><div class="panel"><h2>Semakan 7 Lapisan</h2><table><thead><tr><th>Lapisan</th><th>Sel Lengkap</th><th>Jumlah</th><th>Status</th></tr></thead><tbody>'+[['1. Shift Jadual',ls.shift],['2. KZ Penyelia',ls.kzp],['3. KZ Koperal',ls.kzk],['4. Timecard',ls.timecard],['5. MC Diterima',ls.mc],['6. Cuti HRMIS',ls.hrmis],['7. Audit Final',ls.audit]].map(x=>'<tr><td>'+x[0]+'</td><td>'+x[1]+'</td><td>'+ls.total+'</td><td>'+(x[1]===ls.total?'LENGKAP':'BELUM LENGKAP')+'</td></tr>').join('')+'</tbody></table><p><b>Status keseluruhan: '+(complete?'LENGKAP':'BELUM LENGKAP')+'</b></p><p>Sumber pemulihan: '+esc(mig.source||'Tiada backup lama ditemui')+(mig.savedAt?' · simpanan '+esc(mig.savedAt):'')+'</p></div><div class="panel"><h2>Ringkasan Mengikut Anggota</h2><div class="wide"><table><thead><tr><th>Bil</th><th>Nama</th><th>Jabatan</th><th>Komp</th><th>Hadir</th><th>MC</th><th>Cuti</th><th>ABS</th><th>Semak</th><th>OFF</th></tr></thead><tbody>'+rows.map(r=>'<tr><td>'+r.m.bil+'</td><td>'+esc(r.m.nama)+'</td><td>'+r.m.jab+'</td><td>'+r.m.komp+'</td><td>'+r.sah+'</td><td>'+r.mc+'</td><td>'+r.cuti+'</td><td>'+r.abs+'</td><td>'+r.semak+'</td><td>'+r.off+'</td></tr>').join('')+'</tbody></table></div></div></div>';$('bosPrint').onclick=()=>window.print()}

    const baseLoadState=loadState;
    loadState=async function(){await baseLoadState();const version='JUNE-COMPLETE-20260709-1';if(state.legacyJuneMigration?.version!==version){const src=localLegacyPayload();if(src)mergeLegacyJune(src.payload,src.label);else{const stats={found:false,source:'Tiada localStorage Jun lama',kzp:0,kzk:0,timecard:0,mc:0,hrmis:0,members:0};applyKzpCompletion(stats,null,LEGACY_ROSTER_53);applyConfirmedSeeds(stats);state.legacyJuneMigration={version,...stats,importedAt:new Date().toISOString()};logAction('IMPORT_JUNE_SEED','KZP lengkap asas + MC/HRMIS diterima; backup lama tidak ditemui')}await saveState()}};
    const baseRenderPage=renderPage;renderPage=function(){if(currentPage==='bos')return renderBosSnapshot();return baseRenderPage()};
    const baseRenderShell=renderShell;renderShell=function(){baseRenderShell();const aside=document.querySelector('aside'),backup=aside?.querySelector('[data-page="backup"]');if(aside&&!aside.querySelector('[data-page="bos"]')){const b=document.createElement('button');b.className='nav';b.dataset.page='bos';b.textContent='Snapshot BOS Jun';b.onclick=()=>{currentPage='bos';renderPage()};aside.insertBefore(b,backup||null)}};
    const baseRenderBackup=renderBackup;renderBackup=function(){baseRenderBackup();const view=$('view');if(!view||$('legacyJuneFile'))return;const p=document.createElement('div');p.className='panel';p.innerHTML='<h2>Import Backup Lama Jun</h2><p>Gunakan backup e-AKHA lama jika pemulihan automatik localStorage tidak dijumpai.</p><div class="upload"><input id="legacyJuneFile" type="file" accept=".json"><button id="legacyJuneImport">Import Data Jun Lama</button></div><div id="legacyJuneResult"></div>';view.prepend(p);$('legacyJuneImport').onclick=async()=>{const f=$('legacyJuneFile').files[0];if(!f)return toast('Pilih backup JSON lama dahulu',true);try{const obj=JSON.parse(await f.text()),s=mergeLegacyJune(obj,'Fail:'+f.name);if(!s.found)throw new Error('Dataset Jun 2026 tidak ditemui dalam fail');await saveState();$('legacyJuneResult').textContent='Berjaya: '+s.members+' anggota · TC '+s.timecard+' · MC '+s.mc+' · HRMIS '+s.hrmis;toast('Backup lama Jun berjaya dimasukkan');renderBackup()}catch(e){toast(e.message,true)}}};
  }

  const injected='('+installJuneCompletion.toString()+')();\n';
  code=code.replace(marker,injected+marker);
  window.__JUN_APP_PARTS__=[code];
})();
