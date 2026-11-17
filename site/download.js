import {initSiteChrome} from './chrome.js?v=devices-2';
initSiteChrome();
const preference=matchMedia('(prefers-reduced-motion: reduce)');
const toggle=document.querySelector('#motion-toggle');
let paused=preference.matches;
function applyMotion(){const quiet=paused||preference.matches;document.documentElement.dataset.motion=quiet?'paused':'playing';toggle.setAttribute('aria-pressed',String(quiet));toggle.setAttribute('aria-label',quiet?'Resume ambient animation':'Pause ambient animation');toggle.querySelector('span').textContent=quiet?'▶':'Ⅱ';toggle.querySelector('.motion-label').textContent=quiet?'Resume motion':'Pause motion';}
toggle.addEventListener('click',()=>{paused=!paused;applyMotion();});
preference.addEventListener('change',()=>{paused=preference.matches;applyMotion();});
applyMotion();
const wave=document.querySelector('.pocket-wave');
for(let i=0;i<47;i++){const bar=document.createElement('i');bar.style.setProperty('--h',`${8+Math.sin(i*1.47)**2*23+Math.cos(i*.35)**2*5}px`);bar.style.setProperty('--delay',`${-i*.083}s`);wave.append(bar);}
