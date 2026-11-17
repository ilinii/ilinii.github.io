import {initSiteChrome} from './chrome.js?v=showcase-3';
import {initAppDemos} from './app-demo.js?v=showcase-3';
initSiteChrome();initAppDemos();
const preference=matchMedia('(prefers-reduced-motion: reduce)');
const toggle=document.querySelector('#motion-toggle');let paused=preference.matches;
function applyMotion(){const quiet=paused||preference.matches;document.documentElement.dataset.motion=quiet?'paused':'playing';toggle.setAttribute('aria-pressed',String(quiet));toggle.setAttribute('aria-label',quiet?'Resume ambient animation':'Pause ambient animation');toggle.querySelector('span').textContent=quiet?'▶':'Ⅱ';toggle.querySelector('.motion-label').textContent=quiet?'Resume motion':'Pause motion';}
toggle.addEventListener('click',()=>{paused=!paused;applyMotion();});preference.addEventListener('change',()=>{paused=preference.matches;applyMotion();});applyMotion();
for(const host of document.querySelectorAll('.waveform'))for(let i=0;i<42;i++){const bar=document.createElement('i');bar.style.setProperty('--h',`${8+Math.sin(i*1.47)**2*26}px`);bar.style.setProperty('--delay',`${-i*.083}s`);host.append(bar);}
const tabs=[...document.querySelectorAll('[data-platform]')],stage=document.querySelector('#device-preview');
function select(tab){tabs.forEach(item=>{item.setAttribute('aria-selected',String(item===tab));item.tabIndex=item===tab?0:-1;});stage.dataset.device=['ios','android'].includes(tab.dataset.platform)?'phone':'desktop';stage.setAttribute('aria-labelledby',tab.id);for(const label of document.querySelectorAll('.selected-platform,.device-preview-name'))label.textContent=`Buddy for ${tab.dataset.name}`;}
tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>select(tab));tab.addEventListener('keydown',event=>{let next;if(['ArrowRight','ArrowDown'].includes(event.key))next=(index+1)%tabs.length;if(['ArrowLeft','ArrowUp'].includes(event.key))next=(index+tabs.length-1)%tabs.length;if(event.key==='Home')next=0;if(event.key==='End')next=tabs.length-1;if(next!==undefined){event.preventDefault();tabs[next].focus();select(tabs[next]);}});});
// A bounded CSS light response; no rotation or pointer-following content.
let lightFrame;
stage.addEventListener('pointermove',event=>{if(paused||preference.matches||event.pointerType==='touch'||lightFrame)return;const {clientX,clientY}=event;lightFrame=requestAnimationFrame(()=>{const rect=stage.getBoundingClientRect();stage.style.setProperty('--light-x',`${Math.max(0,Math.min(100,(clientX-rect.left)/rect.width*100))}%`);stage.style.setProperty('--light-y',`${Math.max(0,Math.min(100,(clientY-rect.top)/rect.height*100))}%`);lightFrame=undefined;});});
stage.addEventListener('pointerleave',()=>{cancelAnimationFrame(lightFrame);lightFrame=undefined;stage.style.removeProperty('--light-x');stage.style.removeProperty('--light-y');});
window.addEventListener('pagehide',()=>cancelAnimationFrame(lightFrame));
