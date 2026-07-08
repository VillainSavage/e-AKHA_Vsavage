(()=>{
  const s=(window.__JUN_LOADER_B64_PARTS__||[]).join('');
  window.__JUN_LOADER_B64_PARTS__=[];
  const b=Uint8Array.from(atob(s),c=>c.charCodeAt(0));
  let patch=new TextDecoder().decode(b);
  patch=patch.replace(
    "/function parseRow\\(layer,row,rowNo\\)\\{[\\s\\S]*?\\}function renderStaging/",
    "/function parseRow\\(layer,row,rowNo\\)\\{[\\s\\S]*?\\}\\s*function renderStaging/"
  );
  const offdayPatch=[
    "code=code.replace(/function renderAudit\\(\\)/,'function kzkDisplay(member,day,value){return shiftFor(member,day)===\\'OFF\\'?\\'OFFDAY\\':normalizeKz(value)}\\nfunction renderAudit()');",
    "code=code.replace(/<td>\\$\\{normalizeKz\\(c\\.kzk\\)\\}<\\/td>/g,'<td>${kzkDisplay(m,d,c.kzk)}</td>');",
    "code=code.replace(/normalizeKz\\(c\\.kzk\\),tcAudit\\(m,d,c\\)\\.text/g,'kzkDisplay(m,d,c.kzk),tcAudit(m,d,c).text');",
    "code=code.replace(/if\\(sh==='OFF'\\)return'OFF';/g,\"if(sh==='OFF')return'OFFDAY';\");"
  ].join("\n");
  patch=patch.replace("new Function(code)();\n})();",offdayPatch+"\nnew Function(code)();\n})();");
  new Function(patch)();
})();