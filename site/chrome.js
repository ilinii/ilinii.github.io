export function initSiteChrome(){
const menuButton=document.querySelector('.menu-toggle'),menu=document.querySelector('#mobile-nav');
function closeMenu(){menu.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Open navigation');document.body.classList.remove('menu-open');}
menuButton.addEventListener('click',()=>{if(menuButton.getAttribute('aria-expanded')==='true')closeMenu();else{menu.hidden=false;menuButton.setAttribute('aria-expanded','true');menuButton.setAttribute('aria-label','Close navigation');document.body.classList.add('menu-open');menu.querySelector('a').focus();}});
menu.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
document.addEventListener('keydown',event=>{if(menu.hidden)return;if(event.key==='Escape'){closeMenu();menuButton.focus();}if(event.key==='Tab'){const links=[menuButton,...menu.querySelectorAll('a')],first=links[0],last=links.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}});
matchMedia('(min-width:601px)').addEventListener('change',event=>{if(event.matches)closeMenu();});
document.querySelector('#year').textContent=String(new Date().getFullYear());
// Public repository metadata only; no token, cookies or meeting data is sent.
const githubLink=document.querySelector('.github-link');
fetch('https://api.github.com/repos/ilinii/buddy',{credentials:'omit',signal:AbortSignal.timeout(3000),headers:{Accept:'application/vnd.github+json'}}).then(response=>{if(!response.ok)throw Error('Repository metadata unavailable');return response.json();}).then(repo=>{const count=repo?.stargazers_count;if(!Number.isSafeInteger(count)||count<0)throw Error('Invalid repository metadata');githubLink.querySelector('.github-count').hidden=false;githubLink.querySelector('.github-count').textContent=new Intl.NumberFormat('en',{notation:count>=1000?'compact':'standard',maximumFractionDigits:1}).format(count);githubLink.setAttribute('aria-label',`Buddy on GitHub, ${count} stars`);}).catch(()=>{githubLink.querySelector('.github-count').hidden=true;githubLink.setAttribute('aria-label','Buddy on GitHub');});
}
