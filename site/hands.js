// Anatomical Creation-of-Adam pose sampled from original generated artwork.
// The published asset is an alpha/luminance field, rendered as real ASCII glyphs.
export function createHands(canvas,motionAllowed){
  const ctx=canvas.getContext('2d');
  if(!ctx)return {draw(){},dispose(){}};
  let width=0,height=0,columns=0,rows=0,source=null,frame=0,last=0,time=0;
  let visible=true,disposed=false,pointer=0,targetPointer=0,dirty=true;
  const controller=new AbortController();
  const ramp=' .,:;i!l/|tjrxnuvczXYUJQ08W@';
  function resize(){
    const box=canvas.getBoundingClientRect();width=box.width;height=box.height;
    const ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
    ctx.setTransform(ratio,0,0,ratio,0,0);
    columns=Math.min(420,Math.ceil(width/(width<600?2.6:3.8)));
    ctx.font='10px Consolas,monospace';const cw=width/columns;
    const fontSize=cw/(ctx.measureText('M').width/10);ctx.font=`${fontSize}px Consolas,monospace`;
    rows=Math.ceil(height/(fontSize*.86));ctx.textBaseline='top';dirty=true;draw();
  }
  function draw(){
    if(!width||!source||disposed)return;
    ctx.clearRect(0,0,width,height);
    const mobile=width<600,cw=width/columns,ch=height/rows;
    const artWidth=width*(mobile?1.8:1.08),artHeight=artWidth*source.height/source.width;
    const tipY=height*(mobile?.46:.58),artY=tipY-artHeight*.49,artX=(width-artWidth)/2;
    // Move each whole hand gently; preserve the sampled finger anatomy and fingertip gap.
    const driftLeft=Math.sin(time*.55)*2.6,driftRight=Math.sin(time*.55+.7)*2.6;
    const separation=4.5+Math.sin(time*.65)*3+pointer*.65;
    for(let row=0;row<rows;row++){
      const y=row*ch;
      const syLeft=Math.floor((y-artY-driftLeft)/artHeight*source.height),syRight=Math.floor((y-artY-driftRight)/artHeight*source.height);
      let line='';
      for(let col=0;col<columns;col++){
        const x=col*cw,side=x<width/2?-1:1;
        const sy=side<0?syLeft:syRight;
        const sx=Math.floor((x-artX-separation*side)/artWidth*source.width);
        if(sy<0||sy>=source.height||sx<0||sx>=source.width){line+=' ';continue;}
        const i=(sy*source.width+sx)*2,alpha=source.data[i]/255;
        if(alpha<.25){line+=' ';continue;}
        const luminance=source.data[i+1]/255;
        // Continuous tonal shaping retains tendons, nails, finger creases and soft volume.
        const shade=Math.pow(1-luminance,.75),density=(.12+shade*.88)*alpha;
        line+=ramp[Math.max(1,Math.min(ramp.length-1,Math.round(density*(ramp.length-1))))];
      }
      ctx.fillStyle='#80817b';ctx.fillText(line,0,y);
    }
    dirty=false;
  }
  function tick(now){
    if(disposed)return;
    if(visible&&!document.hidden&&now-last>=1000/18){
      const moving=motionAllowed();
      if(moving){time+=Math.min((now-last)/1000,.08);pointer+=(targetPointer-pointer)*.055;dirty=true;}
      last=now;if(dirty)draw();
    }
    frame=requestAnimationFrame(tick);
  }
  const ro=new ResizeObserver(resize);ro.observe(canvas);
  const io=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??false;if(visible){dirty=true;draw();}});io.observe(canvas);
  const move=e=>{targetPointer=(e.clientX/window.innerWidth-.5)*2;};window.addEventListener('pointermove',move,{passive:true});
  fetch(new URL('./creation-hands.bin?v=open-fingers-1',import.meta.url),{signal:controller.signal}).then(r=>{if(!r.ok)throw Error('Hand artwork unavailable');return r.arrayBuffer();}).then(buffer=>{
    if(disposed)return;const head=new DataView(buffer),w=head.getUint32(0,true),h=head.getUint32(4,true);
    if(!w||!h||w>2048||h>1024||buffer.byteLength!==8+w*h*2)throw Error('Invalid hand artwork');
    source={width:w,height:h,data:new Uint8Array(buffer,8)};canvas.dataset.artwork='anatomical';dirty=true;draw();
  }).catch(error=>{if(error.name!=='AbortError')canvas.dataset.artwork='unavailable';});
  resize();frame=requestAnimationFrame(tick);
  return {draw,dispose(){disposed=true;controller.abort();cancelAnimationFrame(frame);ro.disconnect();io.disconnect();window.removeEventListener('pointermove',move);}};
}
