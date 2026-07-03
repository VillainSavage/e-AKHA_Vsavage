/* e-AKHA v5.10.57 — secure SJN Adilah owner login */
(()=>{
  'use strict';
  if(window.__EAKHA_51057_OWNER_AUTH_BOOT__)return;
  window.__EAKHA_51057_OWNER_AUTH_BOOT__=true;

  const OWNER_ID='sjnadilah';
  const SALT_B64='3GxtprR/jouEgAy7p1pjcQ==';
  const HASH_B64='0d20DtVE75tkbu3UM9Hg2QA55FZrylUTZqHJ12fPsAs=';
  const ITERATIONS=210000;
  const SESSION_KEY='eakha_owner_session_v51057';
  const FAIL_KEY='eakha_owner_fail_v51057';
  const SESSION_MS=12*60*60*1000;

  const b64bytes=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
  const same=(a,b)=>a.length===b.length&&a.reduce((v,x,i)=>v|(x^b[i]),0)===0;
  const normalizeId=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const ownerAlias=v=>normalizeId(v)===OWNER_ID;

  function deepWindow(){
    let W=window;
    for(let i=0;i<6;i++){
      let f=null;
      try{f=W.document?.querySelector('iframe#system,iframe#app,iframe')}catch(e){}
      if(!f?.contentWindow||f.contentWindow===W)break;
      try{if(!f.contentDocument?.documentElement)break}catch(e){break}
      W=f.contentWindow;
    }
    return W;
  }

  function setBinding(W,name,value){
    const copy=JSON.parse(JSON.stringify(value));
    W.__EAKHA_OWNER_TMP__=copy;
    try{W.eval(`${name}=window.__EAKHA_OWNER_TMP__`)}catch(e){try{W[name]=copy}catch(_){} }
    try{W[name]=copy}catch(e){}
    delete W.__EAKHA_OWNER_TMP__;
  }

  function ownerObject(){
    return {
      id:'sjnadilah',username:'sjnadilah',name:'SJN Adilah',nama:'SJN Adilah',
      role:'owner',akses:'owner',owner:true,admin:true,isOwner:true,isAdmin:true,
      canEdit:true,canUpload:true,can_upload:true,loggedIn:true,isLoggedIn:true,
      viewer:false,readonly:false,readOnly:false,ts:Date.now()
    };
  }

  function isOwnerCurrent(W){
    const values=[];
    for(const key of ['CUR_USER','AUTH','AUTH_USER','USER']){
      try{values.push(W.eval(`typeof ${key}!=='undefined'?${key}:null`))}catch(e){values.push(W[key])}
    }
    return values.some(u=>u&&normalizeId(u.id||u.username||u.name||u.nama)===OWNER_ID);
  }

  function grantOwner(W,persist=true){
    const owner=ownerObject();
    ['CUR_USER','AUTH','AUTH_USER','USER'].forEach(k=>setBinding(W,k,owner));

    W.reqAdmin=()=>isOwnerCurrent(W);
    W.reqOwner=()=>isOwnerCurrent(W);
    W.canUpload=()=>isOwnerCurrent(W);
    W.canEdit=()=>isOwnerCurrent(W);
    W.isAdmin=()=>isOwnerCurrent(W);
    W.isOwner=()=>isOwnerCurrent(W);
    W.isViewer=()=>!isOwnerCurrent(W);
    for(const name of ['reqAdmin','reqOwner','canUpload','canEdit','isAdmin','isOwner','isViewer']){
      try{W.eval(`${name}=window.${name}`)}catch(e){}
    }

    try{
      W.localStorage.setItem('eakha_user',JSON.stringify(owner));
      W.localStorage.setItem('eakha_role','owner');
      W.localStorage.setItem('eakha_owner','SJN Adilah');
      W.localStorage.removeItem('eakha_viewer_mode');
      W.localStorage.removeItem('eakha_readonly');
      W.sessionStorage.setItem('eakha_auth',JSON.stringify(owner));
      if(persist)W.sessionStorage.setItem(SESSION_KEY,JSON.stringify({id:OWNER_ID,expires:Date.now()+SESSION_MS}));
    }catch(e){}

    try{
      const wall=W.document.getElementById('auth-wall');
      const app=W.document.getElementById('app');
      if(wall)wall.style.display='none';
      if(app)app.style.display='flex';
      const err=W.document.getElementById('l-err');
      if(err)err.textContent='';
    }catch(e){}

    try{if(typeof W.bootApp==='function')setTimeout(()=>W.bootApp(),20)}catch(e){}
    try{if(typeof W.updFlags==='function')setTimeout(()=>W.updFlags(),80)}catch(e){}
    return owner;
  }

  async function verifyPassword(password){
    if(!window.crypto?.subtle)return false;
    const material=await crypto.subtle.importKey(
      'raw',new TextEncoder().encode(String(password||'')),{name:'PBKDF2'},false,['deriveBits']
    );
    const bits=await crypto.subtle.deriveBits(
      {name:'PBKDF2',hash:'SHA-256',salt:b64bytes(SALT_B64),iterations:ITERATIONS},
      material,256
    );
    return same(new Uint8Array(bits),b64bytes(HASH_B64));
  }

  function failState(W){
    try{return JSON.parse(W.sessionStorage.getItem(FAIL_KEY)||'{}')}catch(e){return {}}
  }
  function recordFail(W){
    const now=Date.now(),old=failState(W);
    const count=old.until&&old.until>now?old.count||0:(old.first&&now-old.first<10*60*1000?old.count||0:0);
    const next={count:count+1,first:old.first&&now-old.first<10*60*1000?old.first:now,until:0};
    if(next.count>=5)next.until=now+30*1000;
    try{W.sessionStorage.setItem(FAIL_KEY,JSON.stringify(next))}catch(e){}
    return next;
  }

  function install(W){
    if(!W?.document?.getElementById('l-id')||W.__EAKHA_51057_OWNER_AUTH__)return false;
    W.__EAKHA_51057_OWNER_AUTH__=true;
    const original=typeof W.doLogin==='function'?W.doLogin:null;
    W.__EAKHA_51057_ORIGINAL_LOGIN__=original;

    W.doLogin=async function(){
      const idEl=W.document.getElementById('l-id');
      const pwEl=W.document.getElementById('l-pw');
      const err=W.document.getElementById('l-err');
      const btn=W.document.getElementById('l-btn');
      const rawId=idEl?.value||'';

      if(!ownerAlias(rawId)){
        let result=false;
        try{result=await W.__EAKHA_51057_ORIGINAL_LOGIN__?.()}catch(e){}
        if(err)err.textContent='ID pengguna atau kata laluan salah.';
        return result;
      }

      const fs=failState(W),now=Date.now();
      if(fs.until&&fs.until>now){
        const sec=Math.ceil((fs.until-now)/1000);
        if(err)err.textContent=`Terlalu banyak cubaan. Cuba semula dalam ${sec} saat.`;
        return false;
      }

      try{
        if(btn){btn.disabled=true;btn.textContent='Menyemak...'}
        const ok=await verifyPassword(pwEl?.value||'');
        if(!ok){
          const next=recordFail(W);
          if(err)err.textContent=next.until?'Terlalu banyak cubaan. Akaun dikunci selama 30 saat.':'ID pengguna atau kata laluan salah.';
          if(pwEl){pwEl.value='';pwEl.focus()}
          return false;
        }
        try{W.sessionStorage.removeItem(FAIL_KEY)}catch(e){}
        grantOwner(W,true);
        return true;
      }catch(e){
        console.error('[51057 owner login]',e);
        if(err)err.textContent='Log masuk gagal. Sila cuba semula.';
        return false;
      }finally{
        if(btn){btn.disabled=false;btn.textContent='Log Masuk'}
      }
    };
    try{W.eval('doLogin=window.doLogin')}catch(e){}

    try{
      const idEl=W.document.getElementById('l-id');
      if(idEl){idEl.autocomplete='username';idEl.placeholder='sjnadilah';}
      const pwEl=W.document.getElementById('l-pw');
      if(pwEl){pwEl.autocomplete='current-password';}
      const err=W.document.getElementById('l-err');
      if(err&&/912012|889888|CUBA/i.test(err.textContent||''))err.textContent='';
    }catch(e){}

    try{
      const s=JSON.parse(W.sessionStorage.getItem(SESSION_KEY)||'null');
      if(s?.id===OWNER_ID&&s.expires>Date.now())grantOwner(W,false);
    }catch(e){}
    return true;
  }

  let tries=0;
  const timer=setInterval(()=>{
    tries++;
    try{if(install(deepWindow()))clearInterval(timer)}catch(e){console.warn('[51057 auth install]',e)}
    if(tries>180)clearInterval(timer);
  },400);
})();