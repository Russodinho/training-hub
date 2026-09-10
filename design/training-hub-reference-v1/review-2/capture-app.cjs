// Read-only visual audit of the local app in a separate headless Chrome profile.
const fs = require('node:fs');
const path = require('node:path');
const {spawn} = require('node:child_process');
const root = __dirname;
const out = path.join(root,'screenshots');
fs.mkdirSync(out,{recursive:true});
const routes = JSON.parse(fs.readFileSync(path.join(root,'../route-manifest.json'),'utf8'));
const pause = ms => new Promise(resolve=>setTimeout(resolve,ms));
let chrome;
(async()=>{
  chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',[
    '--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check',
    '--remote-debugging-port=0','--remote-debugging-address=127.0.0.1',
    '--user-data-dir='+path.join(root,'chrome-audit-profile'),'about:blank'
  ],{windowsHide:true,stdio:['ignore','ignore','pipe']});
  const endpoint=await new Promise((resolve,reject)=>{
    let log=''; const timer=setTimeout(()=>reject(new Error('Chrome startup timed out')),15000);
    chrome.on('error',reject);
    chrome.stderr.on('data',chunk=>{log+=chunk;const match=log.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(match){clearTimeout(timer);resolve(match[1]);}});
  });
  const ws=new WebSocket(endpoint); await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
  let seq=0; const pending=new Map();
  ws.onmessage=e=>{const msg=JSON.parse(e.data);if(msg.id&&pending.has(msg.id)){const p=pending.get(msg.id);pending.delete(msg.id);clearTimeout(p.timer);msg.error?p.reject(new Error(JSON.stringify(msg.error))):p.resolve(msg.result);}};
  const cdp=(method,params={},sessionId)=>new Promise((resolve,reject)=>{const id=++seq;const timer=setTimeout(()=>{pending.delete(id);reject(new Error('Timed out: '+method));},30000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params,...(sessionId?{sessionId}:{})}));});
  const {targetId}=await cdp('Target.createTarget',{url:'about:blank'});
  const {sessionId}=await cdp('Target.attachToTarget',{targetId,flatten:true});
  const send=(method,params={})=>cdp(method,params,sessionId);
  await send('Page.enable');await send('Runtime.enable');
  const records=[];
  for(const viewport of (process.argv.includes('--details')?[]:[{width:1100,height:900},{width:390,height:844},{width:320,height:800}])){
    await send('Emulation.setDeviceMetricsOverride',{...viewport,deviceScaleFactor:1,mobile:false});
    for(const [i,route] of routes.entries()){
      const slug=route.route==='/'?'dashboard':route.route.slice(1).replaceAll('/','-');
      await send('Page.navigate',{url:'http://localhost:3000'+route.route});
      await pause(1400);
      await send('Runtime.evaluate',{expression:'Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,3000))])',awaitPromise:true});
      const {result}=await send('Runtime.evaluate',{returnByValue:true,expression:`JSON.stringify((()=>{
        const all=[...document.querySelectorAll('body *')];
        const visible=el=>{const r=el.getBoundingClientRect();const s=getComputedStyle(el);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none';};
        const describe=el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return {tag:el.tagName,cls:el.className?.baseVal??el.className,text:el.textContent.trim().slice(0,85),x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),font:s.fontFamily,size:s.fontSize,bg:s.backgroundImage!=='none'?s.backgroundImage:s.backgroundColor};};
        return {url:location.pathname,width:innerWidth,scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,title:document.title,fonts:[...document.fonts].map(f=>({family:f.family,status:f.status})),headings:[...document.querySelectorAll('h1,h2,h3')].filter(visible).map(describe),overflow:all.filter(el=>{if(!visible(el))return false;const r=el.getBoundingClientRect();return r.right>innerWidth+2&&r.left>=0&&!el.closest('.mobile-subnav');}).slice(0,18).map(describe),tabs:[...document.querySelectorAll('.mh-tab-btn,.mobile-tab')].filter(visible).map(describe),images:[...document.images].map(im=>({src:im.getAttribute('src'),loaded:im.complete&&im.naturalWidth>0})),bodyText:document.body.innerText.slice(0,700)};
      })())`});
      const record=JSON.parse(result.value);record.viewport=viewport;records.push(record);
      const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
      const file=`${String(i+1).padStart(2,'0')}-${slug}-${viewport.width}.png`;
      fs.writeFileSync(path.join(out,file),Buffer.from(shot.data,'base64'));
      console.log(`${viewport.width} ${route.route}: document ${record.scrollWidth}px; ${record.overflow.length} overflowing elements`);
      fs.writeFileSync(path.join(root,'observations.json'),JSON.stringify(records,null,2));
    }
  }
  if(process.argv.includes('--details')){
    await send('DOM.enable');await send('CSS.enable');
    const details=[];
    for(const item of [
      {route:'/wind-down',name:'wind-down-expanded',selector:'.wind-row'},
      {route:'/fuel',name:'fuel-meals',text:'Meals'},
      {route:'/fuel',name:'fuel-supplements',text:'Supplements'},
      {route:'/training-log',name:'training-history',text:'History'},
      {route:'/training-log',name:'training-tri',text:'Tri Sessions'},
      {route:'/training-log',name:'training-bodycomp',text:'Body Comp'},
      {route:'/log',name:'log-header'},
      {route:'/sleep',name:'sleep-header'},
      {route:'/race-calendar',name:'calendar-narrow',width:320},
      {route:'/fuel',name:'fuel-narrow',width:320}
    ].filter(item=>!process.argv.includes('--probe')||item.name==='fuel-meals')){
      const width=item.width||390;
      await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:false});
      await send('Page.navigate',{url:'http://localhost:3000'+item.route});await pause(1800);
      if(item.text)await send('Runtime.evaluate',{expression:`[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===${JSON.stringify(item.text)})?.click()`});
      if(item.selector)await send('Runtime.evaluate',{expression:`document.querySelector(${JSON.stringify(item.selector)})?.click()`});
      await pause(900);
      const {result}=await send('Runtime.evaluate',{returnByValue:true,expression:`JSON.stringify((()=>{
        const bounds=el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return {tag:el.tagName,cls:el.className?.baseVal??el.className,text:el.textContent.trim().slice(0,70),x:r.x,y:r.y,w:r.width,h:r.height,font:s.fontFamily,size:s.fontSize,color:s.color,overflow:s.overflowX,tabIndex:el.tabIndex};};
        return {url:location.pathname,client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,heading:[...document.querySelectorAll('.page-header>*')].map(bounds),controls:[...document.querySelectorAll('.page-header input,.wind-row,.wind-rules-title,.wind-check,.mh-info,.mh-name,.mh-subtitle,.mh-pills')].map(bounds),fontRules:[...document.styleSheets].flatMap(s=>{try{return [...s.cssRules].filter(r=>r.type===3||r.type===5).map(r=>r.cssText)}catch{return []}}),out:[...document.querySelectorAll('main *')].filter(el=>{let r=el.getBoundingClientRect();return r.width>0&&r.right>document.documentElement.clientWidth+1}).slice(0,20).map(bounds)};
      })())`});
      const detail=JSON.parse(result.value);detail.name=item.name;
      const {root:doc}=await send('DOM.getDocument');
      detail.platformFonts=[];
      for(const selector of ['h2','.card-title','.wind-name','.race-name']){
        const {nodeId}=await send('DOM.querySelector',{nodeId:doc.nodeId,selector});
        if(nodeId){const font=await send('CSS.getPlatformFontsForNode',{nodeId});detail.platformFonts.push({selector,...font});}
      }
      details.push(detail);
      const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
      fs.writeFileSync(path.join(out,`${item.name}-${width}.png`),Buffer.from(shot.data,'base64'));
      console.log(item.name+': client '+detail.client+' / scroll '+detail.scroll);
      fs.writeFileSync(path.join(root,process.argv.includes('--probe')?'meal-probe.json':'detail-observations.json'),JSON.stringify(details,null,2));
    }
  }
  await cdp('Browser.close').catch(()=>{});ws.close();
  console.log('Saved '+records.length+' route/viewport observations.');
})().catch(error=>{console.error(error.message);if(chrome)chrome.kill();process.exitCode=1;});
