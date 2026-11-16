class BuddyVoicePCM extends AudioWorkletProcessor{
 constructor(){super();this.samples=new Int16Array(1600);this.offset=0;this.port.onmessage=event=>{if(event.data==='flush'){this.flush();this.port.postMessage('flushed');}};}
 flush(){if(this.offset){const chunk=this.samples.slice(0,this.offset);this.port.postMessage(chunk.buffer,[chunk.buffer]);this.offset=0;}}
 process(inputs){const input=inputs[0]?.[0];if(input)for(const value of input){this.samples[this.offset++]=Math.round(Math.max(-1,Math.min(1,value))*32767);if(this.offset===this.samples.length)this.flush();}return true;}
}
registerProcessor('buddy-voice-pcm',BuddyVoicePCM);
