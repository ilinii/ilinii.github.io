import {setupVoiceDemo} from './voice.js?v=voice-public-2';
import {createHands} from './hands.js?v=open-fingers-1';

const preference=matchMedia('(prefers-reduced-motion: reduce)');
let paused=preference.matches;
const toggle=document.querySelector('#motion-toggle');
function applyMotion(){document.documentElement.dataset.motion=paused||preference.matches?'paused':'playing';toggle.setAttribute('aria-pressed',String(paused||preference.matches));toggle.setAttribute('aria-label',paused?'Resume ambient animation':'Pause ambient animation');toggle.querySelector('span').textContent=paused?'▶':'Ⅱ';toggle.querySelector('.motion-label').textContent=paused?'Resume motion':'Pause motion';}
toggle.addEventListener('click',()=>{paused=!paused;applyMotion();});preference.addEventListener('change',()=>{paused=preference.matches;applyMotion();});applyMotion();
let hands=createHands(document.querySelector('#ascii-hands'),()=>!paused&&!preference.matches);
window.addEventListener('pagehide',()=>{hands.dispose();clearInterval(replayTimer);clearTimeout(answerTimer);});
window.addEventListener('pageshow',event=>{if(event.persisted)hands=createHands(document.querySelector('#ascii-hands'),()=>!paused&&!preference.matches);});

function addWave(host,count=42){
  if(!host)return;for(let i=0;i<count;i++){const bar=document.createElement('i');bar.style.setProperty('--h',`${6+(Math.sin(i*2.7)*.5+.5)*22+Math.sin(i*.44)**2*13}px`);bar.style.setProperty('--delay',`${-i*.079}s`);host.append(bar);}
}
addWave(document.querySelector('#hero-wave'),43);
const transcript='“Let’s test the new welcome flow with the team before we add anything else.”';
let replayTimer;
document.querySelector('#replay-sample').addEventListener('click',()=>{
  clearInterval(replayTimer);const button=document.querySelector('#replay-sample'),text=document.querySelector('#rolling-text');
  const words=transcript.split(' ');let index=0;text.replaceChildren();button.disabled=true;button.querySelector('span:nth-child(2)').textContent='Replaying sample…';document.querySelector('#sample-state').textContent='Sample replay';
  replayTimer=setInterval(()=>{
    const word=document.createElement('span');word.textContent=words[index]+' ';word.style.setProperty('--word','0');word.style.whiteSpace='pre';text.append(word);index++;
    document.querySelector('#sample-time').textContent=`04:${String(12+Math.floor(index/3)).padStart(2,'0')}`;
    if(index>=words.length){clearInterval(replayTimer);button.disabled=false;button.querySelector('span:nth-child(2)').textContent='Replay the moment';document.querySelector('#sample-state').textContent='A conversation, kept.';document.querySelector('#sample-time').textContent='04:12';}
  },preference.matches?35:160);
});

const screens={
  record:`<p class="eyebrow">YOUR MEETING SPACE</p><h3>Product check-in</h3><div class="demo-small-meta"><span>Today · 10:30</span><span>12 min</span><span>Team sync</span></div><div class="demo-recorder"><div><span class="capture-led"></span><span>Sample recording</span><span>04:12</span></div><div class="waveform"></div><p>“Let’s test the new welcome flow with the team…”</p></div><p class="demo-personal-note">Keep the first meeting simple.</p>`,
  review:`<p class="eyebrow">YOUR MEETING NOTES</p><h3>A smaller, clearer launch.</h3><div class="demo-review"><div><span class="check-icon">✓</span><span><strong>DECIDED</strong>Focus this release on the welcome flow.</span><button data-source="meeting">04:12 ↗</button></div><div><span class="check-icon">✓</span><span><strong>NEXT STEP</strong>Test the first meeting with the team.</span><button data-source="meeting">04:12 ↗</button></div><div><span class="check-icon">↗</span><span><strong>STILL OPEN</strong>What should we add after the first test?</span><button data-source="review">09:25 ↗</button></div></div>`,
  ask:`<p class="eyebrow">BUDDY / YOUR CONTEXT</p><h3>One question. The right context.</h3><div class="demo-ask-question">What did we decide about the launch?</div><p class="demo-ask-answer">Keep the first release focused on a simpler welcome flow. The next step is to test it with the team before adding anything else.</p><button class="demo-ask-citation" data-source="meeting"><span>01</span> Product check-in <span>04:12 ↗</span></button>`
};
const stepButtons=[...document.querySelectorAll('[data-step]')];
function setStep(button){
  stepButtons.forEach(b=>{b.setAttribute('aria-selected',String(b===button));b.tabIndex=b===button?0:-1;});
  const screen=document.querySelector('#workflow-screen');screen.innerHTML=screens[button.dataset.step];screen.classList.remove('state-enter');void screen.offsetWidth;screen.classList.add('state-enter');addWave(screen.querySelector('.waveform'),41);
  document.querySelector('#workflow-panel').setAttribute('aria-labelledby',button.id);document.querySelector('#visual-number').textContent=String(stepButtons.indexOf(button)+1).padStart(2,'0');
}
stepButtons.forEach((button,index)=>{button.addEventListener('click',()=>setStep(button));button.addEventListener('keydown',event=>{let next;if(event.key==='ArrowDown'||event.key==='ArrowRight')next=(index+1)%stepButtons.length;if(event.key==='ArrowUp'||event.key==='ArrowLeft')next=(index+stepButtons.length-1)%stepButtons.length;if(event.key==='Home')next=0;if(event.key==='End')next=stepButtons.length-1;if(next!==undefined){event.preventDefault();stepButtons[next].focus();setStep(stepButtons[next]);}});});setStep(stepButtons[0]);

const answers={
  scope:{text:'The team wants to make the first meeting easier before expanding the product. The launch brief prioritizes the welcome flow, and the check-in confirmed that focus.',sources:[['meeting','Product check-in','04:12'],['brief','Launch brief','p. 2']]},
  next:{text:'Test the new welcome flow with the team before adding more features. The design review also asks everyone to note where the first five minutes feel confusing.',sources:[['meeting','Product check-in','04:12'],['review','Design review','09:25']]},
  test:{text:'The first test is for the internal team. The launch brief calls for an internal pass before inviting people outside the team to try the welcome flow.',sources:[['brief','Launch brief','p. 2']]}
};
let answerTimer;
document.querySelectorAll('[data-question]').forEach(button=>button.addEventListener('click',()=>{
  clearTimeout(answerTimer);document.querySelectorAll('[data-question]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  document.querySelector('#answer-status').lastChild.textContent=' FINDING THE RELEVANT MOMENTS';
  answerTimer=setTimeout(()=>{const answer=answers[button.dataset.question],text=document.querySelector('#sample-answer');text.textContent=answer.text;text.classList.remove('state-enter');void text.offsetWidth;text.classList.add('state-enter');document.querySelector('#answer-status').lastChild.textContent=' FROM YOUR CONTEXT';
    const sources=document.querySelector('#answer-sources');sources.replaceChildren();answer.sources.forEach(([id,title,location],index)=>{const source=document.createElement('button');source.dataset.source=id;const n=document.createElement('span'),t=document.createTextNode(title),l=document.createElement('span');n.textContent=String(index+1).padStart(2,'0');l.textContent=`${location} ↗`;source.append(n,t,l);sources.append(source);});
  },paused||preference.matches?0:420);
}));

const sourceData={
  hero:{kind:'MEETING TRANSCRIPT',title:'Product check-in',location:'04:12 · Final transcript',quote:'“Let’s test the new welcome flow with the team before we add anything else.”'},
  meeting:{kind:'MEETING TRANSCRIPT',title:'Product check-in',location:'04:12 · Final transcript',quote:'“Let’s test the new welcome flow with the team before we add anything else.”'},
  brief:{kind:'DOCUMENT EXCERPT',title:'Launch brief',location:'Page 2 · Scope & first test',quote:'“Focus this release on the welcome flow. Run the first test with the internal team before inviting external testers.”'},
  review:{kind:'MEETING TRANSCRIPT',title:'Design review',location:'09:25 · Final transcript',quote:'“For the first test, let’s all note where the first five minutes feel confusing. We can decide what to add after that.”'}
};
const dialog=document.querySelector('#source-dialog');
document.addEventListener('click',event=>{const trigger=event.target.closest('[data-source]');if(!trigger)return;const source=sourceData[trigger.dataset.source];if(!source)return;for(const [selector,key]of[['#source-kind','kind'],['#source-title','title'],['#source-location','location'],['#source-quote','quote']])document.querySelector(selector).textContent=source[key];dialog.showModal();});
document.querySelector('.close-source').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
const setupContent={
  keys:`<span class="setup-status">AVAILABLE IN NATIVE BUILDS</span><h3>Bring your own keys.</h3><p>Connect supported AI providers for transcription and answers. Your keys stay in your device’s credential store.</p><div class="setup-detail"><span>01</span><span>Choose your providers</span></div><div class="setup-detail"><span>02</span><span>Connect once in Settings</span></div><div class="setup-detail"><span>03</span><span>Get back to the conversation</span></div>`,
  managed:`<span class="setup-status planned">PLANNED / NOT YET AVAILABLE</span><h3>Leave the setup to Buddy.</h3><p>The same meeting workspace, with transcription and answers built in. No separate provider accounts to manage.</p><div class="setup-roadmap"><span aria-hidden="true">↗</span><p>This is where we’re headed. Buddy-managed AI isn’t available yet.</p></div>`
};
const setupTabs=[...document.querySelectorAll('[data-setup]')];
function selectSetup(button){
  setupTabs.forEach(tab=>{tab.setAttribute('aria-selected',String(tab===button));tab.tabIndex=tab===button?0:-1;});
  const panel=document.querySelector('#setup-panel');panel.innerHTML=setupContent[button.dataset.setup];panel.setAttribute('aria-labelledby',button.id);panel.classList.remove('state-enter');void panel.offsetWidth;panel.classList.add('state-enter');
}
setupTabs.forEach((button,index)=>{button.addEventListener('click',()=>selectSetup(button));button.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight'||event.key==='ArrowDown')next=(index+1)%setupTabs.length;if(event.key==='ArrowLeft'||event.key==='ArrowUp')next=(index+setupTabs.length-1)%setupTabs.length;if(event.key==='Home')next=0;if(event.key==='End')next=setupTabs.length-1;if(next!==undefined){event.preventDefault();setupTabs[next].focus();selectSetup(setupTabs[next]);}});});

const menuButton=document.querySelector('.menu-toggle'),menu=document.querySelector('#mobile-nav');
function closeMenu(){menu.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Open navigation');document.body.classList.remove('menu-open');}
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')==='true';if(open)closeMenu();else{menu.hidden=false;menuButton.setAttribute('aria-expanded','true');menuButton.setAttribute('aria-label','Close navigation');document.body.classList.add('menu-open');menu.querySelector('a').focus();}});
menu.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
document.addEventListener('keydown',event=>{if(menu.hidden)return;if(event.key==='Escape'){closeMenu();menuButton.focus();}if(event.key==='Tab'){const links=[menuButton,...menu.querySelectorAll('a')],first=links[0],last=links.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}});
matchMedia('(min-width:601px)').addEventListener('change',e=>{if(e.matches)closeMenu();});
document.querySelector('#year').textContent=String(new Date().getFullYear());

setupVoiceDemo();
