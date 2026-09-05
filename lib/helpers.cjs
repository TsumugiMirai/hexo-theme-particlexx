'use strict';
const { stripHTML } = require('hexo-util');
function safeURL(value) {
  const s=String(value || '').trim();
  if (!s || /[\u0000-\u0020\u007f\\]/.test(s)) return '#';
  if (/^(https?:|mailto:)/i.test(s)) return s;
  if (/^[a-z][a-z\d+.-]*:/i.test(s) || s.startsWith('//')) return '#';
  return s;
}
function summary(post, length=180) {
  if (post.secret !== undefined) return '';
  return stripHTML(String(post.description || post.excerpt || post.content || '')).replace(/\s+/g,' ').trim().slice(0,length);
}
function sortedPosts(posts) {
  return [...posts.toArray()].sort((a,b)=>(Number(b.pinned)||0)-(Number(a.pinned)||0) || Number(b.date)-Number(a.date));
}
module.exports={safeURL,summary,sortedPosts};
