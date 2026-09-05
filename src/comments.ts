type ArtalkInstance={setDarkMode:(dark:boolean)=>void};
declare global {interface Window {Artalk?:{init:(options:Record<string,unknown>)=>ArtalkInstance};}}
const scripts=new Map<string,Promise<void>>();
function script(src:string){
  if(!scripts.has(src))scripts.set(src,new Promise<void>((resolve,reject)=>{
    const node=document.createElement('script');node.src=src;node.async=true;
    const timer=window.setTimeout(()=>{node.remove();scripts.delete(src);reject(Error('Comment script timeout'));},12000);
    node.onload=()=>{clearTimeout(timer);resolve();};node.onerror=()=>{clearTimeout(timer);node.remove();scripts.delete(src);reject(Error('Comment script unavailable'));};document.head.append(node);
  }));return scripts.get(src)!;
}
const isDark=()=>document.documentElement.dataset.theme==='dark' || (document.documentElement.dataset.theme!=='light' && matchMedia('(prefers-color-scheme: dark)').matches);
export async function mountComments(section:HTMLElement){
  const mount=section.querySelector<HTMLElement>('.comment-mount')!;
  if(section.dataset.comments==='artalk'){
    const css=section.dataset.artalkCss!;
    if(!document.querySelector('link[data-artalk]')){const link=document.createElement('link');link.rel='stylesheet';link.href=css;link.dataset.artalk='true';document.head.append(link);}
    await script(section.dataset.artalkJs!);
    if(!window.Artalk)throw Error('Artalk did not initialize');
    const server=new URL(section.dataset.server!,location.href).href;
    const response=await fetch(server.replace(/\/$/,'')+'/api/v2/conf',{signal:AbortSignal.timeout(10000)});
    if(!response.ok)throw Error('Artalk server unavailable');
    const instance=window.Artalk.init({el:mount,server,site:section.dataset.site,pageKey:section.dataset.pageKey,pageTitle:section.dataset.pageTitle,darkMode:isDark(),locale:document.documentElement.lang.startsWith('zh')?'zh-CN':'en',imgLazyLoad:'native'});
    const sync=()=>instance.setDarkMode(isDark());document.addEventListener('particlexx:appearance',sync);matchMedia('(prefers-color-scheme: dark)').addEventListener('change',sync);
  }else{
    const config=JSON.parse(section.dataset.giscus||'{}');mount.classList.add('giscus');
    const node=document.createElement('script');node.src='https://giscus.app/client.js';node.async=true;node.crossOrigin='anonymous';
    const values:Record<string,string>={repo:config.repo,'repo-id':config.repo_id,category:config.category||'','category-id':config.category_id,mapping:'specific',term:section.dataset.pageKey!,strict:'1','reactions-enabled':'1','emit-metadata':'0',theme:isDark()?'dark':'light',lang:document.documentElement.lang.startsWith('zh')?'zh-CN':'en'};
    for(const [key,value] of Object.entries(values))node.setAttribute('data-'+key,value);
    await new Promise<void>((resolve,reject)=>{const timer=window.setTimeout(()=>{node.remove();reject(Error('Giscus timeout'));},12000);node.onload=()=>{clearTimeout(timer);resolve();};node.onerror=()=>{clearTimeout(timer);node.remove();reject(Error('Giscus unavailable'));};mount.append(node);});
    const sync=()=>mount.querySelector('iframe')?.contentWindow?.postMessage({giscus:{setConfig:{theme:isDark()?'dark':'light'}}},'https://giscus.app');document.addEventListener('particlexx:appearance',sync);matchMedia('(prefers-color-scheme: dark)').addEventListener('change',sync);
  }
}
