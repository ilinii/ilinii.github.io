// Original Buddy interaction. The live frame runs the actual app with ephemeral SQLite.
export function initAppDemos(){
 for(const host of document.querySelectorAll('[data-app-demo]')){
  const open=host.querySelector('[data-demo-open]'),back=host.querySelector('[data-demo-back]');
  const slot=host.querySelector('[data-demo-slot]'),status=host.querySelector('[data-demo-status]');
  status.setAttribute('role','status');
  let frame,observer,timer;
  function close(){clearTimeout(timer);observer?.disconnect();frame?.remove();frame=undefined;host.dataset.demo='tour';delete host.dataset.ready;slot.hidden=true;back.hidden=true;open.hidden=false;status.textContent='Sample content · No microphone needed';open.focus();}
  open.addEventListener('click',()=>{
   if(frame)return;
   host.dataset.demo='live';slot.hidden=false;back.hidden=false;open.hidden=true;status.textContent='Opening your sample workspace…';
   frame=document.createElement('iframe');frame.title='Buddy interactive demo — temporary sample workspace';
   frame.setAttribute('allow',"microphone 'none'; camera 'none'; geolocation 'none'");
   frame.src='/app/?demo=meeting&showcase=1';
   frame.addEventListener('load',()=>{
    const ready=()=>{
     if(!frame)return;
     if(frame.contentDocument?.querySelector('.app-shell')){clearTimeout(timer);observer?.disconnect();status.textContent='Interactive demo · Changes reset when closed';host.dataset.ready='true';}
     const error=frame.contentDocument?.querySelector('.boot-screen [role=alert]');
     if(error){clearTimeout(timer);observer?.disconnect();status.textContent='Demo could not open. Try opening the workspace in a new tab.';}
    };
    observer=new MutationObserver(ready);if(frame.contentDocument)observer.observe(frame.contentDocument,{childList:true,subtree:true});ready();
   },{once:true});
   slot.replaceChildren(frame);
   timer=setTimeout(()=>{status.textContent='Still opening? Use “Open in a tab” below.';},20000);
  });
  back.addEventListener('click',close);
  for(const trigger of document.querySelectorAll('[data-launch-demo]'))trigger.addEventListener('click',()=>{if(!frame)open.click();});
  host.querySelector('[data-demo-replay]')?.addEventListener('click',()=>{
   const caption=host.querySelector('.sample-caption');if(!caption)return;
   revealSample(caption,caption.dataset.text||caption.textContent,document.documentElement.dataset.motion==='paused');
  });
  window.addEventListener('pagehide',()=>{clearTimeout(timer);observer?.disconnect();frame?.remove();});
 }
}

// Finite, cancellable reveal of clearly labelled sample text; no model calls.
const reveals=new WeakMap();
export function revealSample(element,text,quiet=false){
 reveals.get(element)?.();
 element.replaceChildren();
 if(quiet){element.textContent=text;return;}
 const words=text.split(/(\s+)/);let index=0,timer;
 const cancel=()=>{clearTimeout(timer);observer.disconnect();reveals.delete(element);};
 const observer=new MutationObserver(()=>{if(!element.isConnected){clearTimeout(timer);observer.disconnect();}});
 reveals.set(element,cancel);
 observer.observe(document.body,{childList:true,subtree:true});
 function next(){
  if(!element.isConnected){cancel();return;}
  if(matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.dataset.motion==='paused'){element.textContent=text;cancel();return;}
  for(let n=0;n<4&&index<words.length;n++,index++){const span=document.createElement('span');span.className='sample-word';span.textContent=words[index];element.append(span);}
  if(index<words.length)timer=setTimeout(next,65);else cancel();
 }
 next();
}
