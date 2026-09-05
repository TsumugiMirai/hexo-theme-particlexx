import './style.css';
const messages: Record<string,string> = JSON.parse(document.body.dataset.messages || '{}');
const t=(key:string)=>messages[key] || key;
const themeButton=document.querySelector<HTMLButtonElement>('#appearance-toggle');
const media=matchMedia('(prefers-color-scheme: dark)');
const dark=()=>document.documentElement.dataset.theme==='dark' || (document.documentElement.dataset.theme!=='light' && media.matches);
if(themeButton){
  themeButton.hidden=false;
  const sync=()=>themeButton.setAttribute('aria-pressed',String(dark()));
  sync();media.addEventListener('change',sync);
  themeButton.addEventListener('click',()=>{
    const value=dark()?'light':'dark';document.documentElement.dataset.theme=value;
    try{localStorage.setItem('particlexx-appearance',value);}catch{/* Appearance still works when storage is blocked. */}
    sync();document.dispatchEvent(new Event('particlexx:appearance'));
  });
}
document.addEventListener('keydown',event=>{if(event.key==='Escape')document.querySelectorAll<HTMLDetailsElement>('.nav-links[open]').forEach(x=>x.open=false);});
document.querySelectorAll('.nav-items a').forEach(a=>a.addEventListener('click',()=>{const details=document.querySelector<HTMLDetailsElement>('.nav-links');if(details)details.open=false;}));
const header=document.querySelector('#menu'), hero=document.querySelector('#home-head');
if(hero && header){new IntersectionObserver(([entry])=>header.classList.toggle('menu-color',entry.isIntersecting),{threshold:0.1}).observe(hero);}
if(hero){new IntersectionObserver(([entry])=>hero.classList.toggle('paused',!entry.isIntersecting)).observe(hero);}
document.addEventListener('visibilitychange',()=>document.documentElement.classList.toggle('page-hidden',document.hidden));
for(const pre of document.querySelectorAll<HTMLPreElement>('.content pre')){
  const code=pre.querySelector('code');if(!code)continue;
  const button=document.createElement('button');button.className='copy-button';button.textContent=t('copy');
  pre.append(button);
  button.addEventListener('click',async()=>{
    button.disabled=true;
    try{
      if(navigator.clipboard && window.isSecureContext)await navigator.clipboard.writeText(code.textContent || '');
      else{
        const area=document.createElement('textarea');area.value=code.textContent || '';area.className='clipboard-fallback';document.body.append(area);area.select();
        try{if(!document.execCommand('copy'))throw Error('Clipboard unavailable');}finally{area.remove();button.focus();}
      }
      button.textContent=t('copied');
    }catch{button.textContent=t('copy_failed');}
    finally{button.disabled=false;window.setTimeout(()=>button.textContent=t('copy'),2200);}
  });
}
if(document.body.dataset.preview==='true'){
  let dialog:HTMLDialogElement|undefined;
  const show=(target:HTMLImageElement)=>{
    if(!dialog){dialog=document.createElement('dialog');dialog.className='lightbox';dialog.setAttribute('aria-label',t('close'));const close=document.createElement('button');close.className='dialog-close';close.textContent='×';close.setAttribute('aria-label',t('close'));close.addEventListener('click',()=>dialog?.close());dialog.append(close,document.createElement('img'));document.body.append(dialog);dialog.addEventListener('click',e=>{if(e.target===dialog)dialog?.close();});}
    const image=dialog.querySelector('img')!;image.src=target.currentSrc||target.src;image.alt=target.alt;dialog.showModal();
  };
  for(const img of document.querySelectorAll<HTMLImageElement>('.content img')){
    if(img.closest('a'))continue;img.tabIndex=0;img.setAttribute('role','button');img.addEventListener('click',()=>show(img));img.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();show(img);}});
  }
}
const tocLinks=[...document.querySelectorAll<HTMLAnchorElement>('.toc-card a')];
if(tocLinks.length){
  const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;for(const link of tocLinks){const active=decodeURIComponent(link.hash.slice(1))===entry.target.id;link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');}}},{rootMargin:'-70px 0px -65% 0px'});
  for(const a of tocLinks){const node=document.getElementById(decodeURIComponent(a.hash.slice(1)));if(node)observer.observe(node);}
}
const searchButton=document.querySelector<HTMLButtonElement>('#search-toggle');
if(searchButton){searchButton.hidden=false;searchButton.addEventListener('click',async()=>{try{const {openSearch}=await import('./search');openSearch(t);}catch{searchButton.title=t('search_error');}});}
for(const section of document.querySelectorAll<HTMLElement>('[data-comments]')){
  let loading=false,loaded=false;
  const button=section.querySelector<HTMLButtonElement>('.load-comments')!;
  const status=section.querySelector<HTMLElement>('.comment-status')!;
  const load=async()=>{if(loading||loaded)return;loading=true;button.disabled=true;status.textContent='';try{const {mountComments}=await import('./comments');await mountComments(section);loaded=true;button.hidden=true;}catch{status.textContent=t('comment_error');}finally{loading=false;button.disabled=false;}};
  button.addEventListener('click',load);
  const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();void load();}},{rootMargin:'200px'});observer.observe(section);
}
// Prefetch only a few same-origin document links after explicit pointer interest.
const prefetched=new Set<string>();
document.addEventListener('pointerover',event=>{
  if(prefetched.size>=3 || (navigator as Navigator & {connection?:{saveData?:boolean,effectiveType?:string}}).connection?.saveData)return;
  const a=(event.target as Element).closest<HTMLAnchorElement>('.nav-items a, .post a');if(!a)return;
  const url=new URL(a.href);if(url.origin!==location.origin || url.hash || url.search || !/\/$|\.html$/.test(url.pathname) || prefetched.has(url.href))return;
  prefetched.add(url.href);const link=document.createElement('link');link.rel='prefetch';link.href=url.href;document.head.append(link);
},{passive:true});
