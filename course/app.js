const API='https://api.github.com/repos/LaxmanNepal/Videos/contents/course/youtube?ref=main';
const RAW='https://raw.githubusercontent.com/LaxmanNepal/Videos/main/course/youtube/';
const player=document.querySelector('#player'), list=document.querySelector('#lessonList'), search=document.querySelector('#search');
const title=document.querySelector('#lessonTitle'), meta=document.querySelector('#lessonMeta'), num=document.querySelector('#lessonNumber');
const count=document.querySelector('#lessonCount'), progress=document.querySelector('#progressText'), ring=document.querySelector('#ring'), playlistMeta=document.querySelector('#playlistMeta');
const prev=document.querySelector('#prevBtn'), next=document.querySelector('#nextBtn'), overlay=document.querySelector('#playerOverlay'), themeBtn=document.querySelector('#themeBtn');
let lessons=[], current=0;
const doneKey='laxman-youtube-course-done-v1', posKey='laxman-youtube-course-position-v1';
let done=JSON.parse(localStorage.getItem(doneKey)||'[]'), positions=JSON.parse(localStorage.getItem(posKey)||'{}');
function cleanName(name){return name.replace(/\.mp4$/i,'').replace(/[_-]+/g,' ').replace(/\s+/g,' ').trim()}
function natural(a,b){return a.name.localeCompare(b.name,undefined,{numeric:true,sensitivity:'base'})}
function esc(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function updateProgress(){const p=lessons.length?Math.round(done.filter(i=>i<lessons.length).length/lessons.length*100):0;progress.textContent=p+'%';ring.textContent=p+'%';playlistMeta.textContent=`${done.length} of ${lessons.length} completed`}
function render(){const q=search.value.trim().toLowerCase();list.innerHTML='';lessons.forEach((l,i)=>{if(q&&!l.title.toLowerCase().includes(q))return;const b=document.createElement('button');b.className='lesson '+(i===current?'active ':'')+(done.includes(i)?'done':'');b.dataset.i=i;b.innerHTML=`<span class="lesson-num">${String(i+1).padStart(2,'0')}</span><span class="lesson-copy"><span class="lesson-title">${esc(l.title)}</span><span class="lesson-status">${done.includes(i)?'✓ Completed':'Watch lesson'}</span></span>`;b.onclick=()=>select(i);list.appendChild(b)});updateProgress()}
function select(i,autoplay=false){if(!lessons[i])return;current=i;const l=lessons[i];player.src=l.url;player.poster='';title.textContent=l.title;num.textContent='LESSON '+String(i+1).padStart(2,'0');meta.textContent=`Lesson ${i+1} of ${lessons.length} · YouTube Creator Course`;overlay.classList.add('hidden');prev.disabled=i===0;next.disabled=i===lessons.length-1;player.currentTime=positions[i]||0;render();document.querySelector('.player-col').scrollIntoView({behavior:'smooth',block:'start'});if(autoplay)player.play().catch(()=>{})}
player.addEventListener('timeupdate',()=>{if(lessons[current]&&player.currentTime>2){positions[current]=Math.floor(player.currentTime);localStorage.setItem(posKey,JSON.stringify(positions))}});
player.addEventListener('ended',()=>{if(!done.includes(current))done.push(current);localStorage.setItem(doneKey,JSON.stringify(done));updateProgress();render();if(current<lessons.length-1)setTimeout(()=>select(current+1,true),500)});
prev.onclick=()=>select(current-1);next.onclick=()=>select(current+1,true);search.oninput=render;
themeBtn.onclick=()=>{document.body.classList.toggle('light');localStorage.setItem('course-theme',document.body.classList.contains('light')?'light':'dark')};
if(localStorage.getItem('course-theme')==='light')document.body.classList.add('light');
async function load(){try{const r=await fetch(API,{headers:{Accept:'application/vnd.github+json'}});if(!r.ok)throw new Error('GitHub API '+r.status);const files=await r.json();lessons=files.filter(x=>x.type==='file'&&/\.mp4$/i.test(x.name)).sort(natural).map(x=>({name:x.name,title:cleanName(x.name),url:RAW+encodeURIComponent(x.name).replace(/%20/g,'%20')}));count.textContent=lessons.length;playlistMeta.textContent=`${lessons.length} lessons`;render();if(lessons.length)select(0)}catch(e){console.error(e);playlistMeta.textContent='Could not load lessons';list.innerHTML='<div style="padding:20px;color:#9aa3b2;font-size:12px">Unable to load the course playlist. Please refresh the page.</div>'}}
load();
