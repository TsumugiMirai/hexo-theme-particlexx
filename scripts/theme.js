/* global hexo */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const { escapeHTML, stripHTML }=require('hexo-util');
const cheerio=require('cheerio');
const hljs=require('highlight.js');
const {safeURL,summary,sortedPosts}=require('../lib/helpers.cjs');
const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'../lib/manifest.json'),'utf8'));
const icons=JSON.parse(fs.readFileSync(path.join(__dirname,'../lib/icons.json'),'utf8'));
const messages={
  'zh':{home:'首页',about:'关于我',friends:'友情链接',search:'搜索',search_placeholder:'搜索文章内容',empty:'暂无文章',read:'阅读全文',comments:'评论',load_comments:'加载评论',comment_error:'评论暂时无法加载，请重试。',copy:'复制',copied:'已复制',copy_failed:'复制失败，请手动选择代码',close:'关闭',toc:'文章目录',appearance:'切换明暗模式',blog:'Blog',no_results:'没有找到相关文章',menu:'打开导航',skip:'跳到正文',archives:'归档',tags:'标签',categories:'分类',more:'更多友情链接',search_error:'搜索加载失败，请重试'},
  'en':{home:'Home',about:'About',friends:'Friends',search:'Search',search_placeholder:'Search articles',empty:'No posts yet',read:'Read more',comments:'Comments',load_comments:'Load comments',comment_error:'Comments are unavailable. Please retry.',copy:'Copy',copied:'Copied',copy_failed:'Copy failed. Please select the code manually.',close:'Close',toc:'On this page',appearance:'Switch color scheme',blog:'Blog',no_results:'No matching articles',menu:'Open navigation',skip:'Skip to content',archives:'Archives',tags:'Tags',categories:'Categories',more:'More friends',search_error:'Search is unavailable. Please retry'}
};
function language(){return String(hexo.config.language || 'en').startsWith('zh')?'zh':'en';}
hexo.extend.helper.register('px_t', key=>messages[language()][key] || key);
hexo.extend.helper.register('px_messages',()=>JSON.stringify(messages[language()]));
hexo.extend.helper.register('px_url', function(value){return this.url_for(safeURL(value));});
hexo.extend.helper.register('px_safe_url',safeURL);
hexo.extend.helper.register('px_icon',name=>icons[name] || icons.link || '');
hexo.extend.helper.register('px_asset',function(entry){if(!manifest[entry]) throw Error(`Missing built asset: ${entry}`);return this.url_for('assets/'+manifest[entry].file);});
hexo.extend.helper.register('px_styles',function(){return (manifest['src/main.ts'].css||[]).map(x=>this.url_for('assets/'+x));});
hexo.extend.helper.register('px_summary',function(post){return summary(post,Number(this.theme.excerpt_length)||180);});
hexo.extend.helper.register('px_posts',function(){
  const all=sortedPosts(this.site.posts);
  const n=Number(this.config.index_generator?.per_page ?? 10);
  const start=((this.page.current||1)-1)*n;
  return n===0?all:all.slice(start,start+n);
});
hexo.extend.helper.register('px_background',function(){const values=this.theme.background || [];return Array.isArray(values)?values[0]:values;});
hexo.extend.helper.register('px_friends',function(){return this.site.data.friends || this.theme.friends || [];});
hexo.extend.filter.register('before_generate',function(){
  const t=this.theme.config;
  if(!['none','artalk','giscus'].includes(t.comments?.provider)) throw Error('ParticleXX: comments.provider must be none, artalk or giscus.');
  if(t.comments.provider==='artalk' && (!t.comments.artalk?.server || safeURL(t.comments.artalk.server)==='#')) throw Error('ParticleXX: a valid Artalk server URL is required.');
  if(t.comments.provider==='giscus' && ['repo','repo_id','category_id'].some(k=>!t.comments.giscus?.[k])) throw Error('ParticleXX: Giscus repository and category identifiers are required.');
  if(!Array.isArray(t.hero_lines)) throw Error('ParticleXX: hero_lines must be a list.');
  if(!Number.isInteger(Number(this.config.index_generator?.per_page ?? 10)) || Number(this.config.index_generator?.per_page ?? 10)<0) throw Error('ParticleXX: per_page must be a non-negative integer.');
  for(const p of this.locals.get('posts').toArray()) if(p.secret!==undefined) throw Error(`ParticleXX: refusing to publish legacy encrypted post "${p.source}". Remove it from public source or migrate to server-side access control. A theme cannot safely protect all generated copies.`);
});
hexo.extend.filter.register('after_post_render',function(data){
  if(data.secret!==undefined) throw Error(`ParticleXX: legacy secret field detected in ${data.source}; build stopped to prevent disclosure.`);
  if(!data.content) return data;
  const $=cheerio.load(data.content,null,false);
  $('pre > code').each((_,el)=>{
    const code=$(el), raw=code.text(), className=code.attr('class')||'';
    const requested=(className.match(/(?:^|\s)language-([^\s]+)/)||[])[1]||'plaintext';
    const lang=hljs.getLanguage(requested)?requested:'plaintext';
    code.html(hljs.highlight(raw,{language:lang,ignoreIllegals:true}).value).addClass('hljs');
    code.parent().attr('data-language',lang);
  });
  $('img').each((_,el)=>{const img=$(el);if(!img.attr('loading'))img.attr('loading','lazy');img.attr('decoding','async');});
  data.content=$.html();return data;
},20);
hexo.extend.generator.register('particlexx-empty-index',function(locals){
  if(locals.posts.length) return [];
  return {path:'index.html',layout:['index'],data:{__index:true,current:1,total:1,posts:locals.posts}};
});
hexo.extend.generator.register('particlexx-data',function(locals){
  const t=this.theme.config, root=this.config.root || '/', url=new URL(this.config.url);
  const pathURL=p=>root.replace(/\/$/,'')+'/'+String(p||'').replace(/^\//,'');
  const absolute=p=>new URL(pathURL(p),url).href;
  const posts=locals.posts.toArray().filter(p=>p.secret===undefined && p.published!==false).sort((a,b)=>Number(b.date)-Number(a.date));
  const routes=[];
  if(t.search.enable) routes.push({path:'search.json',data:JSON.stringify(posts.map(p=>({title:p.title,url:pathURL(p.path),text:stripHTML(p.content||'').replace(/\s+/g,' '),tags:(p.tags?.toArray()||[]).map(x=>x.name)})))});
  if(t.rss.enable) routes.push({path:'atom.xml',data:`<?xml version="1.0" encoding="utf-8"?><feed xmlns="http://www.w3.org/2005/Atom"><title>${escapeHTML(this.config.title)}</title><id>${escapeHTML(absolute(''))}</id><updated>${(posts[0]?.updated || posts[0]?.date || new Date()).toISOString()}</updated><link href="${escapeHTML(absolute('atom.xml'))}" rel="self"/>${posts.slice(0,20).map(p=>`<entry><title>${escapeHTML(p.title)}</title><id>${escapeHTML(absolute(p.path))}</id><link href="${escapeHTML(absolute(p.path))}"/><updated>${(p.updated||p.date).toISOString()}</updated><summary>${escapeHTML(summary(p,500))}</summary><author><name>${escapeHTML(this.config.author||'')}</name></author></entry>`).join('')}</feed>`});
  if(t.sitemap.enable){const paths=['',...posts.map(p=>p.path),...locals.pages.toArray().filter(p=>p.sitemap!==false).map(p=>p.path)];routes.push({path:'sitemap.xml',data:`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...new Set(paths)].map(p=>`<url><loc>${escapeHTML(absolute(p))}</loc></url>`).join('')}</urlset>`});}
  return routes;
});
