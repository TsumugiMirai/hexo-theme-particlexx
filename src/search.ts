type Entry={title:string,url:string,text:string,tags:string[]};
let setup=false,entries:Entry[]|undefined,pending:Promise<Entry[]>|undefined;
export function openSearch(t:(key:string)=>string){
  const dialog=document.querySelector<HTMLDialogElement>('#search-dialog')!;
  const input=dialog.querySelector<HTMLInputElement>('input')!;
  if(!setup){
    setup=true;dialog.querySelector('[data-close]')!.addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
    let timer=0,sequence=0;
    input.addEventListener('input',()=>{window.clearTimeout(timer);const id=++sequence;timer=window.setTimeout(async()=>{
      const results=dialog.querySelector('#search-results')!,status=dialog.querySelector('#search-status')!;
      results.replaceChildren();const words=input.value.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);if(!words.length){status.textContent='';return;}
      try{
        pending ||= fetch(dialog.dataset.index!,{signal:AbortSignal.timeout(10000)}).then(async r=>{if(!r.ok)throw Error('Search unavailable');return await r.json() as Entry[];}).catch(e=>{pending=undefined;throw e;});
        entries ||= await pending;if(id!==sequence)return;
        const selected=entries.filter(e=>words.every(w=>(e.title+' '+e.text+' '+e.tags.join(' ')).toLocaleLowerCase().includes(w))).slice(0,Number(dialog.dataset.limit)||30);
        status.textContent=selected.length?'':t('no_results');
        for(const result of selected){
          const li=document.createElement('li'),a=document.createElement('a'),p=document.createElement('p');a.textContent=result.title;
          const url=new URL(result.url,location.origin);if(url.origin!==location.origin)continue;a.href=url.href;
          const hit=result.text.toLocaleLowerCase().indexOf(words[0]);p.textContent=result.text.slice(Math.max(0,hit-40),Math.max(0,hit-40)+180);li.append(a,p);results.append(li);
        }
      }catch{if(id===sequence)status.textContent=t('search_error');}
    },120);});
  }
  dialog.showModal();input.focus();
}
