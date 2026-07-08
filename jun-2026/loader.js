(()=>{
  const s=(window.__JUN_LOADER_B64_PARTS__||[]).join('');
  window.__JUN_LOADER_B64_PARTS__=[];
  const b=Uint8Array.from(atob(s),c=>c.charCodeAt(0));
  let patch=new TextDecoder().decode(b);
  patch=patch.replace(
    "/function parseRow\\(layer,row,rowNo\\)\\{[\\s\\S]*?\\}function renderStaging/",
    "/function parseRow\\(layer,row,rowNo\\)\\{[\\s\\S]*?\\}\\s*function renderStaging/"
  );
  new Function(patch)();
})();
