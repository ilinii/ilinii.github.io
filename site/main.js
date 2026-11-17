import {initAppDemos,revealSample} from './app-demo.js?v=showcase-3';
import {initSiteChrome} from './chrome.js?v=devices-2';
import {setupVoiceDemo} from './voice.js?v=compact-1';
import {createHands} from './hands.js?v=open-fingers-1';
const preference=matchMedia('(prefers-reduced-motion: reduce)');
let paused=preference.matches,answerTimer;
const toggle=document.querySelector('#motion-toggle');
function applyMotion(){const quiet=paused||preference.matches;document.documentElement.dataset.motion=quiet?'paused':'playing';toggle.setAttribute('aria-pressed',String(quiet));toggle.setAttribute('aria-label',quiet?'Resume ambient animation':'Pause ambient animation');toggle.querySelector('span').textContent=quiet?'▶':'Ⅱ';toggle.querySelector('.motion-label').textContent=quiet?'Resume motion':'Pause motion';}
toggle.addEventListener('click',()=>{paused=!paused;applyMotion();});preference.addEventListener('change',()=>{paused=preference.matches;applyMotion();});applyMotion();
let hands=createHands(document.querySelector('#ascii-hands'),()=>!paused&&!preference.matches);
window.addEventListener('pagehide',()=>{hands.dispose();clearTimeout(answerTimer);});
window.addEventListener('pageshow',event=>{if(event.persisted)hands=createHands(document.querySelector('#ascii-hands'),()=>!paused&&!preference.matches);});
function addWave(host){if(!host)return;for(let i=0;i<42;i++){const bar=document.createElement('i');bar.style.setProperty('--h',`${7+(Math.sin(i*2.7)*.5+.5)*22+Math.sin(i*.44)**2*12}px`);bar.style.setProperty('--delay',`${-i*.079}s`);host.append(bar);}}
const answers={
 scope:{text:'The team is focusing this release on a simpler welcome flow. The check-in confirms the scope set in the launch brief.',sources:[['meeting','Product check-in','04:12'],['brief','Launch brief','p. 2']]},
 next:{text:'Test the welcome flow with the team before adding more features. The design review asks everyone to note where the first five minutes feel confusing.',sources:[['meeting','Product check-in','04:12'],['review','Design review','09:25']]}
};
const citation=([id,title,location],index)=>`<button class="demo-ask-citation" data-source="${id}"><span>${String(index+1).padStart(2,'0')}</span>${title}<span>${location} ↗</span></button>`;
const screens={
 record:`<p class="eyebrow">YOUR MEETING SPACE</p><h3>Product check-in</h3><div class="demo-small-meta"><span>Today · 10:30</span><span>12 min</span><span>Team sync</span></div><div class="demo-record-columns"><div class="demo-recorder"><div><span class="capture-led"></span><span>Transcript</span><span>04:12</span></div><div class="waveform" aria-hidden="true"></div><p class="sample-caption" data-text="Let’s test the new welcome flow with the team before we add anything else.">Let’s test the new welcome flow with the team before we add anything else.</p></div><div class="demo-note-panel"><p class="eyebrow">YOUR NOTES</p><p>Keep the first release focused.</p><div class="demo-note-line"><span aria-hidden="true"></span><strong>Test the welcome flow with the team.</strong></div><p class="demo-note-foot">The next step, kept in context.</p></div></div>`,
 ask:`<p class="eyebrow">MEETINGS + DOCUMENTS</p><h3>Ask across your context.</h3><div class="question-options" aria-label="Choose an illustrative question"><button data-question="scope" aria-pressed="true">Why keep the launch small?</button><button data-question="next" aria-pressed="false">What happens next?</button></div><div class="answer-status" id="answer-status">FROM YOUR CONTEXT</div><p class="sample-answer" id="sample-answer">${answers.scope.text}</p><div class="answer-sources" id="answer-sources">${answers.scope.sources.map(citation).join('')}</div>`
};
function tabKeys(buttons,select){buttons.forEach((button,index)=>{button.addEventListener('click',()=>select(button));button.addEventListener('keydown',event=>{let next;if(['ArrowRight','ArrowDown'].includes(event.key))next=(index+1)%buttons.length;if(['ArrowLeft','ArrowUp'].includes(event.key))next=(index+buttons.length-1)%buttons.length;if(event.key==='Home')next=0;if(event.key==='End')next=buttons.length-1;if(next!==undefined){event.preventDefault();buttons[next].focus();select(buttons[next]);}});});}
const stepButtons=[...document.querySelectorAll('[data-step]')],screen=document.querySelector('#workflow-screen');
function setStep(button){clearTimeout(answerTimer);stepButtons.forEach(tab=>{tab.setAttribute('aria-selected',String(tab===button));tab.tabIndex=tab===button?0:-1;});screen.innerHTML=screens[button.dataset.step];screen.classList.remove('state-enter');void screen.offsetWidth;screen.classList.add('state-enter');addWave(screen.querySelector('.waveform'));document.querySelector('#workflow-panel').setAttribute('aria-labelledby',button.id);}
tabKeys(stepButtons,setStep);setStep(stepButtons[0]);
screen.addEventListener('click',event=>{const button=event.target.closest('[data-question]');if(!button)return;clearTimeout(answerTimer);screen.querySelectorAll('[data-question]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));document.querySelector('#answer-status').textContent='FINDING THE RELEVANT MOMENTS';answerTimer=setTimeout(()=>{const text=document.querySelector('#sample-answer');if(!text)return;const answer=answers[button.dataset.question];revealSample(text,answer.text,paused||preference.matches);text.classList.remove('state-enter');void text.offsetWidth;text.classList.add('state-enter');document.querySelector('#answer-status').textContent='FROM YOUR CONTEXT';document.querySelector('#answer-sources').innerHTML=answer.sources.map(citation).join('');},paused||preference.matches?0:350);});
const sourceData={
 meeting:{kind:'MEETING TRANSCRIPT',title:'Product check-in',location:'04:12 · Final transcript',quote:'“Let’s test the new welcome flow with the team before we add anything else.”'},
 brief:{kind:'DOCUMENT EXCERPT',title:'Launch brief',location:'Page 2 · Scope & first test',quote:'“Focus this release on the welcome flow. Run the first test with the internal team before inviting external testers.”'},
 review:{kind:'MEETING TRANSCRIPT',title:'Design review',location:'09:25 · Final transcript',quote:'“For the first test, let’s all note where the first five minutes feel confusing. We can decide what to add after that.”'}
};
const dialog=document.querySelector('#source-dialog');
document.addEventListener('click',event=>{const trigger=event.target.closest('[data-source]');if(!trigger)return;const source=sourceData[trigger.dataset.source];if(!source)return;for(const [selector,key]of[['#source-kind','kind'],['#source-title','title'],['#source-location','location'],['#source-quote','quote']])document.querySelector(selector).textContent=source[key];dialog.showModal();});
document.querySelector('.close-source').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
const setupContent={
 managed:`<span class="setup-status">COMING SOON</span><h3>Buddy handles it for you.</h3><div class="setup-price"><span>Starting at</span><strong>$8.90</strong><span>/ month</span></div><p>Transcription and answers, with no separate provider accounts to manage.</p>`,
 keys:`<span class="setup-status">AVAILABLE IN NATIVE BUILDS</span><h3>Use locally for free.</h3><p>Write notes, transcribe locally and search your sources. Connect your own providers for optional cloud AI.</p><div class="setup-detail"><span>01</span><span>Optional: add your keys in Settings</span></div><div class="setup-detail"><span>02</span><span>Choose your models and get started</span></div>`
};
const setupTabs=[...document.querySelectorAll('[data-setup]')];
function selectSetup(button){setupTabs.forEach(tab=>{tab.setAttribute('aria-selected',String(tab===button));tab.tabIndex=tab===button?0:-1;});const panel=document.querySelector('#setup-panel');panel.innerHTML=setupContent[button.dataset.setup];panel.setAttribute('aria-labelledby',button.id);panel.classList.remove('state-enter');void panel.offsetWidth;panel.classList.add('state-enter');}
tabKeys(setupTabs,selectSetup);selectSetup(setupTabs[0]);
initSiteChrome();
initAppDemos();
setupVoiceDemo();
