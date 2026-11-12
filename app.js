(()=>{
const cfg=window.GAIUS_CONFIG,sb=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
const T={
en:{hub:'Staff Hub',signIn:'Sign in',requestAccess:'Request access',fullName:'Full name',username:'Username',password:'Password',signOut:'Sign out',
 pendingT:'Waiting for approval',pendingD:'An admin must approve your account before you can enter. Please check back soon.',
 meetings:'Meetings',members:'Members',next:'Next Monday',newMeeting:'Create meeting',date:'Date',type:'Type',title:'Title (optional)',
 staff_meeting:'Monday staff meeting',program:'Monday program',create:'Create',none:'No meetings yet.',
 checkIn:'I am present',checkedIn:'You are checked in',onlyToday:'Check-in opens on the meeting day.',autoTime:'The time is recorded automatically.',
 joined:'Joined',notJoined:'Did not join',markPresent:'Mark present',markAbsent:'Remove',comments:'Comments',write:'Write a comment…',send:'Send',
 leaderNote:'Leader comments appear with a badge.',leader:'Leader',admin:'Admin',staff:'Staff',approve:'Approve',suspend:'Suspend',pending:'Pending',role:'Role',
 badLogin:'Wrong username or password.',exists:'This username or meeting already exists.',err:'Something went wrong. Please try again.',
 userRule:'Username: 3-30 letters, numbers, dot, dash.',signedUp:'Request sent. Wait for an admin to approve you, then sign in.',saved:'Saved'},
am:{hub:'የሠራተኞች መድረክ',signIn:'ግባ',requestAccess:'መዳረሻ ጠይቅ',fullName:'ሙሉ ስም',username:'የተጠቃሚ ስም',password:'የይለፍ ቃል',signOut:'ውጣ',
 pendingT:'ፈቃድ በመጠበቅ ላይ',pendingD:'ለመግባት አድሚን አካውንትህን ማጽደቅ አለበት። እባክህ ትንሽ ቆይተህ ተመልሰህ ሞክር።',
 meetings:'ስብሰባዎች',members:'አባላት',next:'መጪው ሰኞ',newMeeting:'ስብሰባ ፍጠር',date:'ቀን',type:'ዓይነት',title:'ርዕስ (አማራጭ)',
 staff_meeting:'የሰኞ የሠራተኞች ስብሰባ',program:'የሰኞ ፕሮግራም',create:'ፍጠር',none:'እስካሁን ስብሰባ የለም።',
 checkIn:'መገኘቴን አስመዝግብ',checkedIn:'መገኘትህ ተመዝግቧል',onlyToday:'መገኘት መመዝገብ የሚቻለው በስብሰባው ቀን ብቻ ነው።',autoTime:'ሰዓቱ automatically ይመዘገባል።',
 joined:'የተገኙ',notJoined:'ያልተገኙ',markPresent:'ተገኝቷል',markAbsent:'አስወግድ',comments:'አስተያየቶች',write:'አስተያየት ጻፍ…',send:'ላክ',
 leaderNote:'የመሪ አስተያየቶች በምልክት ይታያሉ።',leader:'መሪ',admin:'አድሚን',staff:'ሠራተኛ',approve:'ፍቀድ',suspend:'አግድ',pending:'በመጠባበቅ ላይ',role:'ሚና',
 badLogin:'የተጠቃሚ ስም ወይም የይለፍ ቃል ልክ አይደለም።',exists:'ይህ የተጠቃሚ ስም ወይም ስብሰባ አስቀድሞ አለ።',err:'ችግር ተፈጥሯል። እባክህ እንደገና ሞክር።',
 userRule:'የተጠቃሚ ስም፦ 3-30 ፊደል (ላቲን)፣ ቁጥር፣ ነጥብ ወይም ሰረዝ።',signedUp:'ጥያቄው ተልኳል። አድሚን እስኪፈቅድ ጠብቅና ግባ።',saved:'ተቀምጧል'}};
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let lang=localStorage.getItem('lang')||'en',mode='in',tab='meetings',me=null,meetings=[],cur=null,det={att:[],com:[],mem:[]},people=[];
const t=k=>T[lang][k]??T.en[k]??k,isL=()=>me&&['leader','admin'].includes(me.role);
const tz='Africa/Addis_Ababa',today=()=>new Date().toLocaleDateString('en-CA',{timeZone:tz});
const nextMon=()=>{const d=new Date(today()+'T12:00:00');d.setDate(d.getDate()+((8-d.getDay())%7));return d.toISOString().slice(0,10)};
const fd=(s,eth)=>{try{return new Intl.DateTimeFormat(lang==='am'?'am-ET'+(eth?'-u-ca-ethiopic':''):'en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(s+'T12:00:00Z'))}catch{return s}};
const hm=s=>new Date(s).toLocaleTimeString(lang==='am'?'am-ET':'en-GB',{hour:'2-digit',minute:'2-digit',timeZone:tz});
const toast=m=>{const e=$('#toast');e.textContent=m;e.className='show';setTimeout(()=>e.className='',2600)};
const fail=e=>toast(e&&e.code==='23505'?t('exists'):t('err'));
const app=h=>$('#app').innerHTML=h;
const roleName=r=>t(r);

function head(){$('#lang').textContent=lang==='en'?'አማ':'EN';$('#out').textContent=t('signOut');$('#out').hidden=!me;document.documentElement.lang=lang==='am'?'am':'en';document.title='Gaius Ministry · '+t('hub')}
function authView(msg=''){head();const up=mode==='up';
 app(`<div class="card"><h2>${t('hub')}</h2><div class="tabs"><button data-act="mode" data-m="in" class="${up?'':'on'}">${t('signIn')}</button><button data-act="mode" data-m="up" class="${up?'on':''}">${t('requestAccess')}</button></div>
 <form data-form="${mode}">${up?`<label>${t('fullName')}<input name="full" required maxlength="80"></label>`:''}
 <label>${t('username')}<input name="user" required autocapitalize="none" autocomplete="username" pattern="[A-Za-z0-9._\\-]{3,30}" title="${t('userRule')}"></label>
 <label>${t('password')}<input name="pw" type="password" required minlength="6" autocomplete="${up?'new-password':'current-password'}"></label>
 <button class="btn" style="width:100%">${up?t('requestAccess'):t('signIn')}</button></form><p class="mute">${esc(msg)||(up?t('userRule'):'')}</p></div>`)}
function pendingView(){head();app(`<div class="card hero"><h2>${t('pendingT')}</h2><p>${t('pendingD')}</p><p class="mute">${esc(me?.full_name||'')}</p></div>`)}

function meetingsHtml(){
 const lead=isL()?`<details class="card"><summary><b>${t('newMeeting')}</b></summary><form data-form="meeting"><div class="two"><label>${t('date')}<input type="date" name="date" value="${nextMon()}" required></label>
 <label>${t('type')}<select name="kind"><option value="staff_meeting">${t('staff_meeting')}</option><option value="program">${t('program')}</option></select></label></div>
 <label>${t('title')}<input name="title" maxlength="100"></label><button class="btn">${t('create')}</button></form></details>`:'';
 const nm=nextMon();
 const hero=`<div class="card hero"><div class="mute">${t('next')}</div><h2>${esc(fd(nm))}</h2>${lang==='am'?`<div class="mute">${esc(fd(nm,1))}</div>`:''}</div>`;
 if(!meetings.length)return hero+lead+`<p class="mute">${t('none')}</p>`;
 const pick=`<div class="pick">${meetings.map(m=>`<button class="chip ${cur&&m.id===cur.id?'on':''}" data-act="pick" data-id="${m.id}">${esc(m.meeting_date)} · ${t(m.kind)}</button>`).join('')}</div>`;
 return hero+lead+pick+detailHtml()}
function detailHtml(){const m=cur,mine=det.att.find(a=>a.user_id===me.id),live=m.meeting_date===today();
 let h=`<div class="card"><h3>${t(m.kind)}${m.title?' · '+esc(m.title):''}</h3><div class="mute">${esc(fd(m.meeting_date))}${lang==='am'?' · '+esc(fd(m.meeting_date,1)):''}</div>`;
 h+=mine?`<p class="ok">✓ ${t('checkedIn')} · ${hm(mine.checked_in_at)}</p>`:live?`<button class="btn" data-act="checkin">${t('checkIn')}</button><p class="mute">${t('autoTime')}</p>`:`<p class="mute">${t('onlyToday')}</p>`;
 h+='</div>';
 if(isL()){const ids=new Set(det.att.map(a=>a.user_id)),at=Object.fromEntries(det.att.map(a=>[a.user_id,a.checked_in_at]));
  const yes=det.mem.filter(p=>ids.has(p.id)),no=det.mem.filter(p=>!ids.has(p.id));
  h+=`<div class="two"><div class="card"><h3>${t('joined')}<span class="cnt">${yes.length}/${det.mem.length}</span></h3>${yes.map(p=>`<div class="row"><span>${esc(p.full_name)} <span class="mute">${hm(at[p.id])}</span></span><button class="btn sm out" data-act="toggle" data-id="${p.id}" data-on="1">${t('markAbsent')}</button></div>`).join('')}</div>
  <div class="card"><h3>${t('notJoined')}<span class="cnt no">${no.length}</span></h3>${no.map(p=>`<div class="row"><span>${esc(p.full_name)}</span><button class="btn sm" data-act="toggle" data-id="${p.id}">${t('markPresent')}</button></div>`).join('')}</div></div>`}
 h+=`<div class="card"><h3>${t('comments')}</h3><div class="mute">${t('leaderNote')}</div>${det.com.map(c=>{const l=['leader','admin'].includes(c.profiles?.role);
  return `<div class="cm ${l?'ld':''}"><b>${esc(c.profiles?.full_name||'?')}</b>${l?`<span class="badge">${t('leader')}</span>`:''} <span class="mute">${esc(new Date(c.created_at).toLocaleDateString('en-GB',{timeZone:tz}))} ${hm(c.created_at)}</span>${c.author_id===me.id||isL()?` <a href="#" data-act="delc" data-id="${c.id}" class="mute">×</a>`:''}<div>${esc(c.body).replace(/\n/g,'<br>')}</div></div>`}).join('')}
  <form data-form="comment"><textarea name="body" required maxlength="2000" rows="3" placeholder="${t('write')}"></textarea><button class="btn">${t('send')}</button></form></div>`;
 return h}
function membersHtml(){const rows=[...people].sort((a,b)=>a.approved-b.approved||a.full_name.localeCompare(b.full_name));
 return `<div class="card"><h3>${t('members')}<span class="cnt">${people.filter(p=>p.approved).length}</span></h3>${rows.map(p=>`<div class="row"><span>${esc(p.full_name)} <span class="mute">@${esc(p.username)}</span>${p.approved?'':` <span class="badge" style="background:#B3261E">${t('pending')}</span>`}</span>
 <span style="display:flex;gap:6px"><select data-role="${p.id}" style="width:auto;min-height:34px" ${p.id===me.id?'disabled':''}>${['staff','leader','admin'].map(r=>`<option value="${r}" ${p.role===r?'selected':''}>${roleName(r)}</option>`).join('')}</select>
 ${p.id===me.id?'':`<button class="btn sm ${p.approved?'out':''}" data-act="appr" data-id="${p.id}" data-v="${p.approved?0:1}">${p.approved?t('suspend'):t('approve')}</button>`}</span></div>`).join('')}</div>`}
function mainView(){head();const tabs=me.role==='admin'?`<nav class="tabs"><button data-act="tab" data-t="meetings" class="${tab==='meetings'?'on':''}">${t('meetings')}</button><button data-act="tab" data-t="members" class="${tab==='members'?'on':''}">${t('members')}</button></nav>`:'';
 app(tabs+(tab==='members'&&me.role==='admin'?membersHtml():meetingsHtml()))}

async function loadDetail(){if(!cur){det={att:[],com:[],mem:[]};return}
 const [a,c,m]=await Promise.all([sb.from('attendance').select('*').eq('meeting_id',cur.id),
  sb.from('comments').select('id,body,created_at,author_id,profiles(full_name,role)').eq('meeting_id',cur.id).order('created_at'),
  isL()?sb.from('profiles').select('id,full_name,role').eq('approved',true).order('full_name'):Promise.resolve({data:[]})]);
 det={att:a.data||[],com:c.data||[],mem:m.data||[]}}
async function loadMeetings(keep){const {data}=await sb.from('meetings').select('*').order('meeting_date',{ascending:false}).limit(30);meetings=data||[];
 const id=keep&&cur?.id;cur=meetings.find(m=>m.id===id)||meetings.find(m=>m.meeting_date===today())||[...meetings].reverse().find(m=>m.meeting_date>=today())||meetings[0]||null;await loadDetail()}
async function loadPeople(){if(me.role==='admin'){const {data}=await sb.from('profiles').select('*');people=data||[]}}
async function route(){const {data:{session}}=await sb.auth.getSession();
 if(!session){me=null;return authView()}
 const {data}=await sb.from('profiles').select('*').eq('id',session.user.id).maybeSingle();me=data;
 if(!me||!me.approved)return pendingView();
 await Promise.all([loadMeetings(),loadPeople()]);mainView()}
async function refresh(){await Promise.all([loadMeetings(true),loadPeople()]);mainView()}

document.addEventListener('click',async e=>{const b=e.target.closest('[data-act],#lang,#out');if(!b)return;
 if(b.tagName==='A')e.preventDefault();
 try{
 if(b.id==='lang'){lang=lang==='en'?'am':'en';localStorage.setItem('lang',lang);return me?.approved?mainView():me?pendingView():authView()}
 if(b.id==='out'){await sb.auth.signOut();me=null;return authView()}
 const a=b.dataset.act,d=b.dataset;
 if(a==='mode'){mode=d.m;authView()}
 else if(a==='tab'){tab=d.t;mainView()}
 else if(a==='pick'){cur=meetings.find(m=>m.id===d.id);await loadDetail();mainView()}
 else if(a==='checkin'){const {error}=await sb.from('attendance').insert({meeting_id:cur.id,user_id:me.id});if(error&&error.code!=='23505')throw error;await refresh()}
 else if(a==='toggle'){const q=d.on?sb.from('attendance').delete().eq('meeting_id',cur.id).eq('user_id',d.id):sb.from('attendance').insert({meeting_id:cur.id,user_id:d.id});const {error}=await q;if(error)throw error;await loadDetail();mainView()}
 else if(a==='delc'){const {error}=await sb.from('comments').delete().eq('id',d.id);if(error)throw error;await loadDetail();mainView()}
 else if(a==='appr'){const {error}=await sb.from('profiles').update({approved:d.v==='1'}).eq('id',d.id);if(error)throw error;await refresh()}
 }catch(x){fail(x)}});
document.addEventListener('change',async e=>{const id=e.target.dataset.role;if(!id)return;const {error}=await sb.from('profiles').update({role:e.target.value}).eq('id',id);if(error)fail(error);else{toast(t('saved'));await refresh()}});
document.addEventListener('submit',async e=>{e.preventDefault();const f=e.target,k=f.dataset.form,v=Object.fromEntries(new FormData(f));
 try{
 if(k==='in'||k==='up'){const user=v.user.trim().toLowerCase(),email=`${user}@${cfg.EMAIL_DOMAIN}`;
  if(k==='in'){const {error}=await sb.auth.signInWithPassword({email,password:v.pw});if(error)return authView(t('badLogin'));return route()}
  const {data,error}=await sb.auth.signUp({email,password:v.pw,options:{data:{username:user,full_name:v.full.trim()}}});
  if(error)return authView(/registered|exists/i.test(error.message)?t('exists'):error.message);
  if(data.session)return route();mode='in';return authView(t('signedUp'))}
 if(k==='meeting'){const {error}=await sb.from('meetings').insert({meeting_date:v.date,kind:v.kind,title:v.title.trim()||null,created_by:me.id});if(error)throw error;await loadMeetings();cur=meetings.find(m=>m.meeting_date===v.date&&m.kind===v.kind)||cur;await loadDetail();mainView()}
 if(k==='comment'){const {error}=await sb.from('comments').insert({meeting_id:cur.id,author_id:me.id,body:v.body.trim()});if(error)throw error;await loadDetail();mainView()}
 }catch(x){fail(x)}});
head();sb.auth.onAuthStateChange(ev=>{if(ev==='SIGNED_OUT'){me=null;authView()}});route();
})();
