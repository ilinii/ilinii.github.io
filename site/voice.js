export function setupVoiceDemo(){
 const host=document.querySelector('#voice-demo');if(!host)return;
 const gateway=new URL(host.dataset.gateway||location.origin);
 const endpoint=path=>new URL(path,gateway);
 const button=host.querySelector('button'),status=host.querySelector('[role=status]'),output=host.querySelector('.voice-words'),clock=host.querySelector('time'),speakerLabel=host.querySelector('.voice-speakers');
 let run=null,disposed=false;
 const draw=text=>{const words=text.trim().split(/\s+/).filter(Boolean),nodes=[...output.children];let stable=0;while(stable<words.length&&nodes[stable]?.textContent===words[stable]+' ')stable++;nodes.slice(stable).forEach(n=>n.remove());for(const word of words.slice(stable)){const span=document.createElement('span');span.textContent=word+' ';output.append(span);}output.scrollTop=output.scrollHeight;};
 const cleanup=async sample=>{clearInterval(sample.timer);clearTimeout(sample.connectTimer);sample.stream?.getTracks().forEach(t=>t.stop());try{sample.node?.disconnect();sample.source?.disconnect();await sample.context?.close();}catch{};};
 const reset=(sample,message)=>{if(run!==sample)return;run=null;void cleanup(sample);button.disabled=false;button.textContent='Try your voice again';host.dataset.state='idle';status.textContent=message;};
 async function stop(){const sample=run;if(!sample||sample.stopping)return;sample.stopping=true;button.disabled=true;status.textContent='Saving the final words…';host.dataset.state='finishing';if(sample.node){await new Promise(resolve=>{sample.flush=resolve;sample.node.port.postMessage('flush');setTimeout(resolve,250);});}sample.audioClosed=true;await cleanup(sample);if(sample.socket?.readyState===WebSocket.OPEN){sample.socket.send('stop');sample.closeTimer=setTimeout(()=>{sample.socket?.close();reset(sample,'The connection ended before finalization. Only finalized words are shown.');},9000);}else{sample.socket?.close();reset(sample,'Demo stopped.');}}
 async function start(){
  if(run){await stop();return;}
  const sample={stopping:false,finals:new Map(),speakers:new Set(),elapsed:0};run=sample;
  host.dataset.state='connecting';button.textContent='Cancel';status.textContent='Checking the voice demo…';draw('');speakerLabel.textContent='';clock.textContent='00:45';
  try{
   if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia||!window.AudioWorkletNode)throw Error('Use a current browser with microphone access over HTTPS.');
   const configuration=await fetch(endpoint('/api/voice/config'),{cache:'no-store',credentials:'omit'}).then(r=>{if(!r.ok)throw Error('The voice demo is temporarily unavailable.');return r.json();});
   if(run!==sample||sample.stopping)return;
   if(!configuration.available)throw Error('The live voice demo is temporarily unavailable. You can still explore Buddy below.');
   sample.stream=await navigator.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
   if(run!==sample||sample.stopping){await cleanup(sample);return;}
   sample.context=new AudioContext({sampleRate:16000});if(sample.context.sampleRate!==16000)throw Error('This browser cannot prepare the demo audio format. Try Chrome or Safari.');await sample.context.resume();await sample.context.audioWorklet.addModule('/site/voice-worklet.js?v=voice-1');
   if(run!==sample||sample.stopping){await cleanup(sample);return;}
   let ticket='';
   if(host.dataset.gateway){
    const response=await fetch(endpoint('/api/voice/session'),{method:'POST',credentials:'omit',headers:{'Content-Type':'application/json'},body:'{}'});
    const session=await response.json();
    if(!response.ok)throw Error(session.error||'The demo could not start.');
    if(typeof session.ticket!=='string')throw Error('The demo session was not created.');
    ticket=session.ticket;
   }
   if(run!==sample||sample.stopping)return;
   const ws=endpoint('/api/voice/stream');ws.protocol=gateway.protocol==='https:'?'wss:':'ws:';if(ticket)ws.searchParams.set('ticket',ticket);
   const socket=sample.socket=new WebSocket(ws);socket.binaryType='arraybuffer';
   sample.connectTimer=setTimeout(()=>{if(run===sample&&host.dataset.state==='connecting'){sample.failed=true;socket.close();reset(sample,'The speech service took too long to connect. Please retry.');}},12000);
   socket.onopen=()=>{
    clearTimeout(sample.connectTimer);
    if(run!==sample||sample.stopping){socket.close();return;}
    sample.node=new AudioWorkletNode(sample.context,'buddy-voice-pcm');sample.source=sample.context.createMediaStreamSource(sample.stream);const silent=sample.context.createGain();silent.gain.value=0;
    sample.node.port.onmessage=event=>{if(event.data==='flushed'){sample.flush?.();return;}if(event.data instanceof ArrayBuffer&&socket.readyState===WebSocket.OPEN&&!sample.audioClosed){if(socket.bufferedAmount>128000){void stop();return;}socket.send(event.data);}};
    sample.source.connect(sample.node);sample.node.connect(silent);silent.connect(sample.context.destination);
    sample.stream.getAudioTracks().forEach(track=>{track.onended=()=>{if(!sample.stopping)void stop();};});
    host.dataset.state='listening';button.textContent='Stop demo';status.textContent='Listening. Say a few words.';
    sample.timer=setInterval(()=>{sample.elapsed++;clock.textContent=`00:${String(Math.max(0,45-sample.elapsed)).padStart(2,'0')}`;if(sample.elapsed>=45)void stop();},1000);
   };
   socket.onmessage=event=>{
    if(run!==sample||typeof event.data!=='string')return;
    try{const data=JSON.parse(event.data);if(data.type==='error'){status.textContent=data.message;return;}if(data.type!=='result'||typeof data.text!=='string'||data.text.length>12000)return;
     if(data.final&&data.text.trim()){sample.finals.set(`${data.start}:${data.duration}`,data.text);for(const speaker of data.speakers??[])if(Number.isInteger(speaker))sample.speakers.add(speaker);}
     const finalized=[...sample.finals.values()].join(' ');draw(finalized+(data.final?'':` ${data.text}`));sample.interim=!data.final;
     status.textContent=sample.stopping?'Saving the final words…':'Transcribing your voice live';speakerLabel.textContent=sample.speakers.size?`${sample.speakers.size} anonymous voice${sample.speakers.size===1?'':'s'} detected · estimate`:'';
    }catch{/* Provider data is inert, never HTML. */}
   };
   socket.onerror=()=>{sample.failed=true;};
   socket.onclose=()=>{clearTimeout(sample.connectTimer);if(run!==sample)return;clearTimeout(sample.closeTimer);draw([...sample.finals.values()].join(' '));reset(sample,sample.failed?'The speech connection failed. Please try again later.':sample.finals.size?'Demo complete. This transcript stays only in this tab.':'No finalized speech received. Check your microphone and try again.');};
  }catch(error){sample.socket?.close();reset(sample,error.name==='NotAllowedError'?'Microphone access was declined. You can try again when ready.':error.message??'The voice demo could not start.');}
 }
 button.addEventListener('click',start);
 const hidden=()=>{if(document.hidden&&run)void stop();};document.addEventListener('visibilitychange',hidden);
 const unload=()=>{disposed=true;const sample=run;if(sample){run=null;clearTimeout(sample.closeTimer);void cleanup(sample);sample.socket?.close();}};window.addEventListener('pagehide',unload);
 window.addEventListener('pageshow',event=>{if(event.persisted&&disposed){disposed=false;button.disabled=false;button.textContent='Try live transcription';status.textContent='Ready when you are.';}});
}
