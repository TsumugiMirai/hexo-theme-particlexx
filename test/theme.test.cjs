const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const {safeURL,summary,sortedPosts}=require('../lib/helpers.cjs');
const Hexo=require('hexo');
test('URLs reject script protocols, protocol-relative origins and whitespace obfuscation',()=>{
  for(const url of ['javascript:alert(1)','data:text/html,x','//evil.test','java\nscript:alert(1)','\\evil'])assert.equal(safeURL(url),'#');
  assert.equal(safeURL('https://example.com/a'),'https://example.com/a');assert.equal(safeURL('/about/'),'/about/');assert.equal(safeURL('mailto:a@example.com'),'mailto:a@example.com');
});
test('private content cannot become a summary; ordering does not mutate source',()=>{
  assert.equal(summary({secret:'pw',content:'PRIVATE'}),'');assert.equal(summary({content:'<b>hello</b>'}),'hello');
  const data=[{date:3},{date:1,pinned:1},{date:2}];assert.deepEqual(sortedPosts({toArray:()=>data}).map(p=>p.date),[1,3,2]);assert.deepEqual(data.map(p=>p.date),[3,1,2]);
});
async function fixture({posts=0,perPage=2,root='/',secret=false}={}){
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'particlexx-fixture-'));
  fs.writeFileSync(path.join(dir,'package.json'),JSON.stringify({name:'particlexx-fixture',hexo:{version:'8.1.2'}}));
  fs.mkdirSync(path.join(dir,'themes'),{recursive:true});
  fs.symlinkSync(path.resolve(__dirname,'..'),path.join(dir,'themes','particlexx'),'junction');
  fs.mkdirSync(path.join(dir,'source','_posts'),{recursive:true});
  fs.mkdirSync(path.join(dir,'source','about'),{recursive:true});
  fs.writeFileSync(path.join(dir,'_config.yml'),`title: Fixture\nurl: https://example.test${root}\nroot: ${root}\ntheme: particlexx\nlanguage: en\nsyntax_highlighter: ''\nindex_generator:\n  per_page: ${perPage}\n  order_by: -date\n`);
  fs.writeFileSync(path.join(dir,'source/about/index.md'),'---\ntitle: About\ntype: about\n---\nAbout fixture.');
  for(let i=0;i<posts;i++)fs.writeFileSync(path.join(dir,`source/_posts/post-${i}.md`),`---\ntitle: 'Post "${i}" <angle>'\ndate: 2026-01-${String(i+1).padStart(2,'0')}\ntags: [test]\n${secret?'secret: pw\n':''}---\n## Heading ${i}\n\nUniqueContent${i}\n\n\`\`\`unknown\n<img src=x onerror=alert(1)>\n\`\`\`\n`);
  const hexo=new Hexo(dir,{silent:true});
  await hexo.init();
  for(const plugin of ['hexo-generator-index','hexo-generator-archive','hexo-generator-tag','hexo-generator-category','hexo-renderer-ejs','hexo-renderer-marked']) await hexo.loadPlugin(require.resolve(plugin));
  return {dir,hexo,cleanup:async()=>{await hexo.exit();fs.rmSync(dir,{recursive:true,force:true});}};
}
async function readRoute(hexo,name){const stream=hexo.route.get(name);assert.ok(stream,`Missing route ${name}`);let out='';for await(const part of stream)out+=part;return out;}
test('real Hexo build: empty site still has homepage and About, without blocking JS',async()=>{
  const f=await fixture();try{await f.hexo.call('generate');const html=await readRoute(f.hexo,'index.html');assert.match(html,/No posts yet/);assert.doesNotMatch(html,/id="loading"|vue\.global|v-show|unsafe-eval/);assert.match(await readRoute(f.hexo,'about/index.html'),/About fixture/);}finally{await f.cleanup();}
});
test('real Hexo build: pagination, subdirectory links, safe code and full-text index',async()=>{
  const f=await fixture({posts:5,root:'/blog/'});try{await f.hexo.call('generate');const html=await readRoute(f.hexo,'index.html');assert.equal((html.match(/class="post"/g)||[]).length,2);assert.match(html,/href="\/blog\/page\/2\//);assert.match(html,/href="\/blog\/about\//);assert.doesNotMatch(html,/<img src=x onerror/);assert.ok(f.hexo.route.list().includes('page/3/index.html'));const search=JSON.parse(await readRoute(f.hexo,'search.json'));assert.equal(search.length,5);assert.ok(search.every(p=>p.url.startsWith('/blog/')));const post=await readRoute(f.hexo,search[0].url.slice('/blog/'.length)+'index.html');assert.match(post,/&lt;img/);assert.match(post,/toc-card/);assert.match(post,/Post (?:&#34;|&quot;)/);}finally{await f.cleanup();}
});
test('real Hexo build: unlimited pagination renders all posts',async()=>{
  const f=await fixture({posts:3,perPage:0});try{await f.hexo.call('generate');assert.equal(((await readRoute(f.hexo,'index.html')).match(/class="post"/g)||[]).length,3);}finally{await f.cleanup();}
});
test('legacy encrypted posts fail closed before producing a public site',async()=>{
  const f=await fixture({posts:1,secret:true});try{await assert.rejects(()=>f.hexo.call('generate'),/secret|encrypted/);}finally{await f.cleanup();}
});
