// Safe element getter — prevents null reference crashes
function el(id){ return document.getElementById(id); }
function set(id,prop,val){ var e=el(id); if(e) e[prop]=val; }
function brandLogoHTML(heightPx){
  heightPx=heightPx||28;
  return '<img src="'+LOGO_B64.black+'" class="brand-logo-img brand-logo-light" style="height:'+heightPx+'px" alt="SpaceMush">'+
         '<img src="'+LOGO_B64.white+'" class="brand-logo-img brand-logo-dark" style="height:'+heightPx+'px" alt="SpaceMush">';
}
function setStyle(id,prop,val){ var e=el(id); if(e) e.style[prop]=val; }
function addClass(id,cls){ var e=el(id); if(e) e.classList.add(cls); }
function removeClass(id,cls){ var e=el(id); if(e) e.classList.remove(cls); }

// ============================================================
// DATA — Mush Posts
// ============================================================









// ============================================================
// STATE
// ============================================================
let liked=new Set();
let currentOpenPostIdx=-1;
let loggedInUser=null; // {name, email, avatar, profession, verified, empStatus}

let saved=new Set();
let isFollowingSpaceMush=false; // tracks Follow/Following state on the SpaceMush account (project modal)
let currentPage='home';
let toastTimer=null;
let studioLoggedIn=false;
let adminLoggedIn=false;
let currentEditIndex=-1; // -1 = new post, >=0 = editing existing
let storyViewerMushIndex=-1;
let storyTimerRef=null;
let currentStorySegment=0;
let notifPanelOpen=false;
let cardImgIdx={}; // {postIndex: currentImageIndex} for feed/grid card carousels
let projCardImgIdx={}; // {postIndex: currentImageIndex} for the Projects-page post carousels (kept separate from cardImgIdx so Home + Projects can render the same project independently without DOM id clashes)
let modalImgIdx=0; // current image index inside the project modal carousel

// ── AUTH: registered users persist in localStorage; no demo accounts ──
function loadRegisteredUsers(){
  try{
    var raw=localStorage.getItem('sm-users');
    return raw?JSON.parse(raw):[];
  }catch(e){ return []; }
}
function saveRegisteredUsers(list){
  try{ localStorage.setItem('sm-users',JSON.stringify(list)); }catch(e){}
}
const STUDIO_CREDS={email:'ssrstudio@gmail.com',password:'Ember1149!Sm'};
const ADMIN_CREDS={email:'adminsm9@gmail.com',password:'Cobalt4682*Sm'};

// ══════════════════════════════════════════════════════════════
// OWNER NOTIFICATIONS — emails contact-form leads and account
// sign-up/sign-in activity to the studio's two inboxes. This site has
// no backend, so delivery goes through Web3Forms (web3forms.com), a
// free form-to-email relay that needs no server code.
//
// Web3Forms' free plan routes one access key to exactly one verified
// inbox (sending to multiple recipients on one key needs a paid plan),
// so two separate free Web3Forms accounts/keys are used here — one
// per inbox below. Sign up free at web3forms.com with each address,
// verify it, and paste the resulting access key in place of the
// placeholders. Until both are filled in, this silently does nothing
// (the site still works normally either way).
//
// IMPORTANT: this must never be passed a password field. Only name,
// email, and phone number are ever sent.
// ══════════════════════════════════════════════════════════════
const OWNER_NOTIFY_EMAILS = ['g.manager@spacemush.com','foundersoffice@bcmc.in'];
const OWNER_NOTIFY_KEYS = [
  'PASTE_WEB3FORMS_ACCESS_KEY_FOR_g.manager', // key from the account verified with g.manager@spacemush.com
  'PASTE_WEB3FORMS_ACCESS_KEY_FOR_foundersoffice' // key from the account verified with foundersoffice@bcmc.in
];
function notifyOwners(subject, fields){
  try{
    if(fields && 'password' in fields) delete fields.password; // hard safety net — never email a password
    OWNER_NOTIFY_KEYS.forEach(function(key){
      if(!key || key.indexOf('PASTE_')===0) return; // not configured yet — skip quietly
      var body=Object.assign({access_key:key, subject:subject, from_name:'SpaceMush Website'}, fields||{});
      fetch('https://api.web3forms.com/submit', {
        method:'POST',
        headers:{'Content-Type':'application/json','Accept':'application/json'},
        body:JSON.stringify(body)
      }).catch(function(){ /* never block the visitor's flow on a delivery failure */ });
    });
  }catch(e){ /* notifications are best-effort only */ }
}

// ── ADMIN ARCHIVE: persists comments/messages/notifications to localStorage so
// the studio/admin always sees full history, even after a visitor's own tab/session
// (and its live, in-memory copy of the data) is gone. The public-facing feed and
// comment threads never read from this archive — only the admin panel does —
// so a visitor's own view still resets to empty on refresh as expected. ──
function loadAdminArchive(key){
  try{
    var raw=localStorage.getItem('sm-archive-'+key);
    return raw?JSON.parse(raw):[];
  }catch(e){ return []; }
}
function saveAdminArchive(key,list){
  try{ localStorage.setItem('sm-archive-'+key,JSON.stringify(list)); }catch(e){}
}
function archiveAdd(key,item){
  var list=loadAdminArchive(key);
  list.unshift(item);
  saveAdminArchive(key,list);
}
function archiveRemove(key,id){
  var list=loadAdminArchive(key).filter(function(item){return item.id!==id;});
  saveAdminArchive(key,list);
}
// Merges this page-load's live (in-memory) items with everything ever archived,
// de-duplicated by id, newest first — this is what admin views should render from.
function archiveMerged(key,liveList){
  var archived=loadAdminArchive(key);
  var byId={};
  archived.forEach(function(item){ byId[item.id]=item; });
  liveList.forEach(function(item){ byId[item.id]=item; });
  return Object.values(byId).sort(function(a,b){return b.id-a.id;});
}

// Notifications array
let notifications=[];

// Verification requests
let empRequests=[];

// Sample comments (for admin panel)
let allComments=[];

// "Reach Us" contact form submissions (shown only in admin panel)
let reachUsMessages=[];

// ============================================================
// INIT
// ============================================================

function toggleTheme(){
  var doc=document.documentElement;
  var isDark=doc.getAttribute('data-theme')==='dark';
  doc.setAttribute('data-theme',isDark?'light':'dark');
  localStorage.setItem('sm-theme',isDark?'light':'dark');
  var icon=document.getElementById('themeIcon');
  if(icon){
    icon.innerHTML=isDark
      ?'<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>'
      :'<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
  }
}
// Load saved theme
(function(){
  var saved=localStorage.getItem('sm-theme')||'light';
  document.documentElement.setAttribute('data-theme',saved);
  if(saved==='dark'){
    var icon=document.getElementById('themeIcon');
    if(icon) icon.innerHTML='<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
  }
})();

function scrollStories(dir){
  var bar=document.getElementById('stories-bar');
  if(!bar) return;
  var amount=dir * 300; /* scroll 300px per click */
  bar.scrollBy({left:amount, behavior:'smooth'});
  /* update arrow visibility after scroll */
  setTimeout(updateStoryArrows, 350);
}

function updateStoryArrows(){
  var bar=document.getElementById('stories-bar');
  if(!bar) return;
  var atStart=bar.scrollLeft<=4;
  var atEnd=bar.scrollLeft+bar.clientWidth>=bar.scrollWidth-4;
  var leftBtn=document.querySelector('.story-arrow-left');
  var rightBtn=document.querySelector('.story-arrow-right');
  /* Fade arrows based on scroll position */
  if(leftBtn)  leftBtn.style.opacity  = atStart ? '0':'';
  if(rightBtn) rightBtn.style.opacity = atEnd   ? '0':'';
}

function initStoryArrows(){
  var bar=document.getElementById('stories-bar');
  if(!bar) return;
  bar.addEventListener('scroll', updateStoryArrows, {passive:true});
  updateStoryArrows();
}

// ── Projects "Types" filter row — horizontal slider ──
function scrollFilters(dir){
  var bar=document.getElementById('projectFilters');
  if(!bar) return;
  bar.scrollBy({left:dir*220, behavior:'smooth'});
  setTimeout(updateFilterArrows, 350);
}
function updateFilterArrows(){
  var bar=document.getElementById('projectFilters');
  if(!bar) return;
  var atStart=bar.scrollLeft<=4;
  var atEnd=bar.scrollLeft+bar.clientWidth>=bar.scrollWidth-4;
  var leftBtn=document.querySelector('.filter-arrow-left');
  var rightBtn=document.querySelector('.filter-arrow-right');
  if(leftBtn)  leftBtn.style.visibility  = atStart ? 'hidden':'visible';
  if(rightBtn) rightBtn.style.visibility = atEnd   ? 'hidden':'visible';
}
function initFilterArrows(){
  var bar=document.getElementById('projectFilters');
  if(!bar) return;
  bar.addEventListener('scroll', updateFilterArrows, {passive:true});
  updateFilterArrows();
}


function init(){
  // Render the public feed first. The feed renderer is resilient per-post, so one
  // malformed optional item cannot prevent the rest of the website from loading.
  try { if(!renderFeed()) setTimeout(function(){try{renderFeed();}catch(e){console.error('SpaceMush feed retry error:',e);}},50); } catch(e) { console.error('SpaceMush feed init error:', e); }
  var splashLogo=el('splashLogo'); if(splashLogo) splashLogo.src=LOGO_B64.badge;
  var sbLogoImg=el('sbLogoImg'); if(sbLogoImg) sbLogoImg.src=LOGO_B64.badge;
  var adminLogoImg=el('adminLogoImg'); if(adminLogoImg) adminLogoImg.src=LOGO_B64.black;
  var adminLogoImgDark=el('adminLogoImgDark'); if(adminLogoImgDark) adminLogoImgDark.src=LOGO_B64.white;
  var founderSSR=el('founderPhotoSSR'); if(founderSSR) founderSSR.src=FOUNDER_B64.ssr;
  var storyViewerAvatar=el('storyViewerAvatar');
  if(storyViewerAvatar){
    storyViewerAvatar.style.backgroundImage="url('"+LOGO_B64.badge+"')";
    storyViewerAvatar.style.backgroundColor='#fff';
  }
  var founderShyam=el('founderPhotoShyam'); if(founderShyam) founderShyam.src=FOUNDER_B64.shyam;
  var parkingImg=el('parkingGuidanceImg'); if(parkingImg) parkingImg.src=OFFICE_B64.parking_guidance;
  var favicon=document.createElement('link');
  favicon.rel='icon'; favicon.href=LOGO_B64.badge;
  document.head.appendChild(favicon);
  try { renderStories(); } catch(e) { console.error('Stories init error:', e); }
  setTimeout(function(){ try { initStoryArrows(); } catch(e) {} }, 100);
  setTimeout(function(){ try { initFilterArrows(); } catch(e) {} }, 100);
  // The remaining systems are enhancements; isolate them so one failure cannot
  // lock the visitor behind the loading screen.
  try { renderProjectsGrid(); } catch(e) { console.error('Projects init error:', e); }
  try { renderHomeIntroPost(); } catch(e) { console.error('Home post init error:', e); }
  try { renderAboutPost(); } catch(e) { console.error('About post init error:', e); }
  try { renderContactPost(); } catch(e) { console.error('Contact post init error:', e); }
  try { renderStyles(); } catch(e) { console.error('Styles init error:', e); }
  try { setupSectionScrollSpy(); } catch(e) { console.error('Scroll spy init error:', e); }
  try { setupScrollListener(); } catch(e) { console.error('Scroll listener init error:', e); }
  try { setupScrollReveal(); } catch(e) { console.error('Scroll reveal init error:', e); }
  try { updateNavForStudio(); } catch(e) { console.error('Nav init error:', e); }
  try { updateFollowerDisplay(); } catch(e) { console.error('Follower init error:', e); }
  try { updateUserUI(); } catch(e) { console.error('User UI init error:', e); }
  // Normal hide after a short, intentional splash. A separate failsafe script
  // below also removes it if any unexpected runtime issue occurs.
  setTimeout(hideSplashScreen, 1100);
}
function hideSplashScreen(){
  var splash=el('splashScreen');
  if(!splash) return;
  splash.classList.add('splash-hide');
  setTimeout(function(){ if(splash.parentNode) splash.parentNode.removeChild(splash); },600);
}

// ============================================================
// STUDIO LOGIN LOGIC
// ============================================================
function updateNavForStudio(){
  var ss=el('sidebarStudioBtns');
  var sp=el('sidebarPublicBtns');
  var sl=el('sidebarLogoutBtn');
  if(studioLoggedIn){
    if(ss) ss.style.display='flex';
    if(sp) sp.style.display='none';
    if(sl) sl.style.display='block';
  } else {
    if(ss) ss.style.display='none';
    if(sp) sp.style.display='block';
    if(sl) sl.style.display='none';
  }
  updateUserUI();
  updateBadges();
}

function updateUserUI(){
  var isLoggedIn = studioLoggedIn || !!loggedInUser;

  // ── Toggle login prompt vs profile bar ──────────────────────
  var authBar    = el('userAuthBar');
  var loggedBar  = el('userLoggedBar');
  if(authBar)   authBar.style.display   = isLoggedIn ? 'none'  : 'block';
  if(loggedBar) loggedBar.style.display = isLoggedIn ? 'flex'  : 'none';

  // ── Fill in avatar / name / handle ──────────────────────────
  var rAvatar = el('rsAvatarEl');
  var rName   = el('rsNameEl');
  var rHandle = el('rsHandleEl');

  if(studioLoggedIn){
    if(rAvatar){rAvatar.textContent='SM';rAvatar.style.background='linear-gradient(135deg,var(--coral),#c44545)';}
    if(rName)   rName.textContent='SpaceMush Studio';
    if(rHandle) rHandle.textContent='@spacemush_architects_chennai';
  } else if(loggedInUser){
    if(rAvatar){
      rAvatar.textContent=loggedInUser.avatar;
      rAvatar.style.background=loggedInUser.verified
        ?'linear-gradient(135deg,#1d9bf0,#0080cc)'
        :'linear-gradient(135deg,#8b5cf6,#6d28d9)';
    }
    if(rName)   rName.textContent=loggedInUser.name;
    if(rHandle) rHandle.textContent='@'+loggedInUser.email.replace(/@.*/,'');
  }

  // ── Show Studio Analytics only for studio/admin ─────────────
  var analyticsCard = el('studioAnalyticsCard');
  if(analyticsCard) analyticsCard.style.display = studioLoggedIn||adminLoggedIn ? 'block' : 'none';
  var sbUserLogout = el('sidebarUserLogout');
  if(sbUserLogout) sbUserLogout.style.display = (loggedInUser&&!studioLoggedIn) ? 'block' : 'none';
}

function studioLogout(){
  studioLoggedIn=false;
  updateNavForStudio();
  renderFeed(); // re-render to remove edit/delete menus
  toast('👋 Logged out of Studio mode');
}

function userLogout(){
  loggedInUser=null;
  updateUserUI();
  renderFeed();
  toast('👋 Signed out successfully');
}

function unreadCount(){
  return archiveMerged('notifications',notifications).filter(n=>n.unread).length;
}
function pendingVerifCount(){
  return empRequests.filter(r=>r.status==='pending').length;
}
function unreadReachUsCount(){
  return archiveMerged('reachus',reachUsMessages).filter(m=>!m.read).length;
}

// ============================================================
// RENDER STORIES (auto-story logic)
// ============================================================
function renderStories(){
  const c=document.getElementById('storiesContainer');
  if(!c) return;
  const ringGradients=[
    'linear-gradient(135deg,#f9c950,#e95b5b)',
    'linear-gradient(135deg,#e95b5b,#c44545)',
    'linear-gradient(135deg,#a855f7,#e95b5b)',
    'linear-gradient(135deg,#3b82f6,#a855f7)',
    'linear-gradient(135deg,#10b981,#3b82f6)',
    'linear-gradient(135deg,#f59e0b,#ef4444)',
    'linear-gradient(135deg,#8b5cf6,#ec4899)',
    'linear-gradient(135deg,#06b6d4,#6366f1)',
    'linear-gradient(135deg,#f97316,#eab308)',
  ];
  let html='';
  // SpaceMush studio story always first
  html+=`<div class="story-item" onclick="openStudioStory()">
    <div class="story-ring" style="background:linear-gradient(135deg,var(--coral),#ff9a9a,var(--coral-dark))">
      <div class="story-avatar" style="background-image:url('${LOGO_B64.badge}');background-size:70%;background-repeat:no-repeat;background-position:center;background-color:#fff"></div>
    </div>
    <div class="story-name">SpaceMush</div>
  </div>`;
  // Per-Mush stories
  mushData.forEach((m,i)=>{
    const grad=m.storySeen?'linear-gradient(135deg,#d0d0d0,#a8a8a8)':ringGradients[i%ringGradients.length];
    const label=projectDisplayName(m);
    html+=`<div class="story-item" onclick="viewStory(${i})">
      <div class="story-ring" style="background:${grad}">
        <div class="story-avatar">${m.emoji}</div>
      </div>
      <div class="story-name">${label}</div>
    </div>`;
  });
  c.innerHTML=html;
}

function openStudioStory(){
  // Show studio's general story
  viewStoryContent(-1,'SpaceMush Studio','just now','✨','Our latest projects are live! Swipe through the Mush feed to explore.',null);
}

function viewStory(i){
  const m=mushData[i];
  if(m.hasStory){
    // Manual story
    viewStoryContent(i,projectDisplayName(m),m.times,m.emoji,m.storyCaption||'Latest from '+projectDisplayName(m),i);
  } else {
    // Auto story — uses mush emoji, links directly to the post
    viewStoryContent(i,projectDisplayName(m),m.times,m.emoji,'Tap to view this project →',i);
  }
  mushData[i].storySeen=true;
  renderStories();
}

function viewStoryContent(mushIdx,name,time,emoji,caption,linkMushIdx){
  storyViewerMushIndex=linkMushIdx;
  set('svName','textContent',name);
  set('svTime','textContent',time);
  const storyImg = mushIdx>=0 && mushData[mushIdx] && mushData[mushIdx].images && mushData[mushIdx].images.length ? mushData[mushIdx].images[0] : null;
  set('svContent','innerHTML',storyImg ? '<img class="story-project-image" src="'+storyImg+'" alt="'+name+'">' : '<div style="font-size:100px;margin-bottom:20px">'+emoji+'</div>');
  setStyle('svContent','background',mushIdx>=0&&mushData[mushIdx]?('linear-gradient('+mushData[mushIdx].bg+')'):'linear-gradient(135deg,#1a0a0a,#0a0a1a)');
  set('svCaption','textContent',caption);
  // View post button
  const viewBtn=document.getElementById('svViewBtn');
  if(linkMushIdx!==null&&linkMushIdx>=0){
    viewBtn.style.display='inline-flex';
    viewBtn.textContent='View Project →';
  } else {
    viewBtn.style.display='none';
  }
  // Progress bar — single segment animated
  const pb=document.getElementById('storyProgressBar');
  pb.innerHTML=`<div class="story-prog-seg"><div class="story-prog-fill" id="spf0"></div></div>`;
  addClass('storyViewerOverlay','open');
  document.body.style.overflow='hidden';
  // Start progress animation
  clearTimeout(storyTimerRef);
  setTimeout(()=>{
    const fill=document.getElementById('spf0');
    if(fill){fill.style.width='100%';fill.classList.add('animating');}
  },50);
  storyTimerRef=setTimeout(()=>closeStoryViewer(),5100);
}

function storyViewPost(){
  closeStoryViewer();
  if(storyViewerMushIndex>=0) openProject(storyViewerMushIndex);
}

function closeStoryViewer(e){
  if(!e||e.target===document.getElementById('storyViewerOverlay')){
    clearTimeout(storyTimerRef);
    removeClass('storyViewerOverlay','open');
    document.body.style.overflow='';
  }
}

// ============================================================
// RENDER FEED
// ============================================================
function renderFeed(){
  const c=document.getElementById('feedContainer');
  if(!c) return false;
  // Feed order and content are both controlled from data.js.
  const mixed=(typeof FEED_CONFIG!=='undefined' && Array.isArray(FEED_CONFIG))
    ? FEED_CONFIG
    : ['where-it-all-begins','la-perle','who-ssr','anna-nagar','how-we-design','nathans-home','who-we-are','how-to-find-us','contact','faq'];
  const parts=[];
  mixed.forEach((item,position)=>{
    try{
      const key=typeof item==='string' ? item : (item.key || item.id);
      const post=(typeof POSTS!=='undefined' && POSTS) ? POSTS[key] : null;
      if(post) parts.push(buildUniversalPostCard(post,key,position));
    }catch(err){
      console.error('SpaceMush feed post '+position+' failed:',err);
      // Keep the rest of the feed usable if one post contains bad data.
      parts.push(`<article class="mush-card sr"><div class="post-header"><div class="post-avatar-ring"><div class="post-avatar"><span class="post-avatar-label">SM</span></div></div><div class="post-info"><div class="post-handle">SpaceMush Architects</div><div class="post-subloc">Chennai</div></div></div><div class="post-image-wrap"><div class="info-carousel-wrap" style="display:flex;align-items:center;justify-content:center;padding:40px;text-align:center"><div><div class="info-slide-heading">SpaceMush Architects</div><div class="info-slide-body"><p>Small Spaces Deserve Design.</p></div></div></div></div></article>`);
    }
  });
  c.innerHTML=parts.join('');
  try{initTouchCarousels();}catch(e){console.error('Carousel init error:',e);}
  try{setupScrollReveal();}catch(e){document.querySelectorAll('.sr').forEach(x=>x.classList.add('in'));}
  return parts.length>0;
}

function buildUniversalPostCard(post,key,position){
  const isProject=post.type==='project';
  const projectIndex=isProject
    ? mushData.findIndex(project=>String(project.id)===String(post.project.id))
    : -1;
  const project=isProject ? post.project : null;
  const author=post.author||{};
  const title=isProject ? project.title : author.name;
  const subtitle=isProject ? `📍 ${project.location||''}` : post.subtitle;
  const action=post.action&&post.action.onClick ? post.action.onClick : 'bookConsultationWhatsApp()';
  const media=isProject && projectIndex>=0
    ? buildCardCarousel(mushData[projectIndex],projectIndex)
    : renderInfoCarousel(key);
  const caption=isProject
    ? `<span class="handle">${title}</span> ${post.caption||''} ${(post.hashtags||[]).map(h=>`<span class="hashtag">${h}</span>`).join(' ')}`
    : post.caption||'';
  const metadata=isProject ? `
    <div class="project-feed-meta">
      ${project.client?`<span><strong>Client</strong> ${projectClientName({client:project.client})}</span>`:''}
      ${project.architect?`<span><strong>Architect</strong> ${project.architect}</span>`:''}
      ${project.area?`<span><strong>Area</strong> ${project.area}</span>`:''}
      ${project.year?`<span><strong>Year</strong> ${project.year}</span>`:''}
    </div>
    <div class="post-time">${project.times||''}</div>` : '';
  const click=isProject&&projectIndex>=0 ? `openProject(${projectIndex})` : action;
  return `<article class="mush-card sr" data-post-id="${key}" data-index="${projectIndex}">
    <div class="post-header">
      <div class="post-avatar-ring"><div class="post-avatar"><span class="post-avatar-label">${author.avatar||'SM'}</span></div></div>
      <div class="post-info">
        <div class="post-handle"${isProject?` onclick="openProject(${projectIndex})" style="cursor:pointer"`:''}>${title}
          <div class="verified-badge"><svg viewBox="0 0 10 10"><polyline points="2,5 4,7 8,3" stroke="white" stroke-width="1.5" fill="none"/></svg></div>
        </div>
        <div class="post-subloc">${subtitle}</div>
        ${isProject&&project.client?`<div class="post-client-line"><strong>Client</strong> ${projectClientName({client:project.client})}</div>`:''}
      </div>
      ${isProject?`<div class="mush-badge">MUSH #${mushNumber(mushData[projectIndex])}</div>`:''}
    </div>
    <div class="post-image-wrap">${media}</div>
    <div class="post-actions">
      <button class="action-btn" onclick="${click}" title="${post.action&&post.action.title||''}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg></button>
    </div>
    <div class="post-caption">${caption}${isProject?`<span class="show-more" onclick="openProject(${projectIndex})"> more</span>`:''}</div>
    ${metadata}
  </article>`;
}

const silhouetteSVG=`<svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="25" r="14" fill="currentColor"/><path d="M14 70c2-17 12-27 26-27s24 10 26 27H14z" fill="currentColor"/></svg>`;

// ============================================================
// DATA-DRIVEN INFORMATION CAROUSELS
// ============================================================
// Active carousel posts live in canonical POSTS in js/data.js.
// app.js is the permanent rendering engine. Do not edit this section
// when adding a new carousel post.
function configureMixedInfoPosts(){
  const source=(typeof POSTS!=='undefined' && POSTS) ? POSTS : {};

  const escapeAttr=(value)=>String(value||'')
    .replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  const renderSlide=(slide)=>{
    if(!slide) return defaultSlideInner('','SpaceMush','<p>Slide content unavailable.</p>');

    if(slide.type==='image'){
      const src=slide.src||'';
      const alt=escapeAttr(slide.alt||'SpaceMush');
      const fit=slide.fit==='contain' ? 'contain' : 'cover';
      return `<div class="info-slide-media"><img src="${src}" alt="${alt}" loading="lazy" draggable="false" style="object-fit:${fit}"></div>`;
    }

    if(slide.type==='html') return slide.html||'';

    return defaultSlideInner(slide.icon||'',slide.heading||'',slide.bodyHtml||'');
  };

  Object.keys(source).filter(key=>source[key]&&source[key].type==='carousel').forEach(function(key){
    const cfg=source[key]||{};
    infoPosts[key]={
      idx:0,
      slides:Array.isArray(cfg.slides) && cfg.slides.length
        ? cfg.slides.map(renderSlide).map(function(inner,idx){
            const raw=cfg.slides[idx]||{};
            return {inner:inner,formVariant:!!raw.formVariant};
          })
        : [
            {inner:defaultSlideInner('','SpaceMush','<p>Add slides in <strong>js/data.js</strong>.</p>')}
          ]
    };

  });

  // Contact retains the existing form-enabled carousel defined in app.js.
  // All normal informational carousels are now controlled by data.js.
}

function initTouchCarousels(){
  document.querySelectorAll('.img-carousel, .info-carousel-wrap').forEach(elm=>{
    if(elm.dataset.touchReady==='1') return;
    elm.dataset.touchReady='1';
    let startX=0,startY=0,dx=0,dragging=false;
    elm.addEventListener('touchstart',e=>{
      if(!e.touches||!e.touches[0]) return;
      startX=e.touches[0].clientX; startY=e.touches[0].clientY; dx=0; dragging=true;
    },{passive:true});
    elm.addEventListener('touchmove',e=>{
      if(!dragging||!e.touches||!e.touches[0]) return;
      dx=e.touches[0].clientX-startX;
      const dy=e.touches[0].clientY-startY;
      if(Math.abs(dx)>Math.abs(dy) && Math.abs(dx)>8) e.preventDefault();
    },{passive:false});
    elm.addEventListener('touchend',e=>{
      if(!dragging) return;
      dragging=false;
      if(Math.abs(dx)<45) return;
      if(elm.classList.contains('img-carousel')){
        const id=elm.id||'';
        if(id.startsWith('cardImgWrap')){ const i=Number(id.replace('cardImgWrap','')); dx<0?cardNextImg(i):cardPrevImg(i); }
        else if(id.startsWith('pcImgWrap')){ const i=Number(id.replace('pcImgWrap','')); dx<0?projCardNextImg(i):projCardPrevImg(i); }
      } else {
        const id=elm.id||'';
        if(id.startsWith('infoWrap_')){ const key=id.replace('infoWrap_',''); dx<0?infoNextSlide(key):infoPrevSlide(key); }
      }
    },{passive:true});
  });
}

function buildCardCarousel(m,i){
  const imgs=m.images;
  if(!imgs||!imgs.length){
    // Fallback to original emoji/gradient placeholder if no real photos exist
    return `<div class="post-img" style="background:${m.gradient}" onclick="openProject(${i})">
      <div class="post-img-inner">${m.emoji}</div>
      <div class="post-img-label">${m.tag}</div>
      <div class="post-img-sqft">📐 ${m.area}</div>
    </div>`;
  }
  const idx=cardImgIdx[i]||0;
  const dots=imgs.length>1?`<div class="carousel-dots">${imgs.map((_,di)=>`<span class="carousel-dot${di===idx?' active':''}" onclick="event.stopPropagation();cardGotoImg(${i},${di})"></span>`).join('')}</div>`:'';
  const arrows=imgs.length>1?`
      <button class="carousel-arrow carousel-arrow-left" onclick="event.stopPropagation();cardPrevImg(${i})" aria-label="Previous image">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button class="carousel-arrow carousel-arrow-right" onclick="event.stopPropagation();cardNextImg(${i})" aria-label="Next image">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="9 18 15 12 9 6"/></svg>
      </button>`:'';
  return `<div class="post-img img-carousel" id="cardImgWrap${i}">
      <div class="post-img-photo" id="cardImg${i}" style="background-image:url('${imgs[idx]}')" onclick="openProject(${i})"></div>
      <div class="post-img-label">${m.tag}</div>
      <div class="post-img-sqft">📐 ${m.area}</div>
      ${imgs.length>1?`<div class="carousel-counter" id="cardCounter${i}">${idx+1}/${imgs.length}</div>`:''}
      ${arrows}
      ${dots}
    </div>`;
}
function cardSetImg(i,newIdx){
  const m=mushData[i];
  if(!m||!m.images||!m.images.length) return;
  const len=m.images.length;
  const wrapped=((newIdx%len)+len)%len;
  cardImgIdx[i]=wrapped;
  const photoEl=document.getElementById('cardImg'+i);
  if(photoEl) photoEl.style.backgroundImage=`url('${m.images[wrapped]}')`;
  const counterEl=document.getElementById('cardCounter'+i);
  if(counterEl) counterEl.textContent=(wrapped+1)+'/'+len;
  const wrapEl=document.getElementById('cardImgWrap'+i);
  if(wrapEl) wrapEl.querySelectorAll('.carousel-dot').forEach((d,di)=>d.classList.toggle('active',di===wrapped));
}
function cardNextImg(i){ cardSetImg(i,(cardImgIdx[i]||0)+1); }
function cardPrevImg(i){ cardSetImg(i,(cardImgIdx[i]||0)-1); }
function cardGotoImg(i,idx){ cardSetImg(i,idx); }

function projectDisplayName(m){
  return (m && m.title) || (m && m.handle ? m.handle.replace(/^Mush_\d+_/i,'').replace(/([a-z])([A-Z])/g,'$1 $2') : 'SpaceMush Project');
}
function projectClientName(m){
  return m && m.client ? String(m.client).replace(/^—\s*/,'') : '';
}

function buildPostCard(m,i){
  const tags=m.hashtags.map(h=>`<span class="hashtag">${h}</span>`).join(' ');
  const moreMenu=studioLoggedIn?`
    <div style="position:absolute;top:44px;right:0;background:var(--white);border:1px solid var(--border2);border-radius:var(--radius-sm);box-shadow:var(--shadow);min-width:160px;z-index:10;display:none" id="postMenu${i}">
      <button style="display:flex;width:100%;align-items:center;gap:8px;padding:10px 14px;font-size:13.5px;color:var(--dark);border:none;background:transparent;cursor:pointer;border-bottom:1px solid var(--border2)" onclick="openEditPost(${i});closeMenu(${i})">✏️ Edit Mush</button>
      <button style="display:flex;width:100%;align-items:center;gap:8px;padding:10px 14px;font-size:13.5px;color:var(--dark);border:none;background:transparent;cursor:pointer;border-bottom:1px solid var(--border2)" onclick="openStoryCreate(${i});closeMenu(${i})">📖 Post Story for this</button>
      <button style="display:flex;width:100%;align-items:center;gap:8px;padding:10px 14px;font-size:13.5px;color:#991b1b;border:none;background:transparent;cursor:pointer" onclick="deleteMush(${i});closeMenu(${i})">🗑️ Delete</button>
    </div>`:''
  ;
  const commentBox=studioLoggedIn?`
    <div class="comment-box">
      <div class="comment-user-avatar">😊</div>
      <input class="comment-input" placeholder="Reply as SpaceMush Studio…" oninput="togglePostBtn(this,'postBtn${i}')" id="commentInput${i}">
      <button class="comment-post-btn" id="postBtn${i}" onclick="postComment(${i})">Post</button>
    </div>`:''
  ;
  return `<article class="mush-card sr" data-index="${i}" data-cat="${m.category}">
    <div class="post-header">
      <div class="post-avatar-ring"><div class="post-avatar"><span class="post-avatar-label">${mushNumber(m)?'MUSH '+mushNumber(m):'SM'}</span></div></div>
      <div class="post-info">
        <div class="post-handle" onclick="openProject(${i})" style="cursor:pointer" title="View ${projectDisplayName(m)}">${projectDisplayName(m)}
          <div class="verified-badge"><svg viewBox="0 0 10 10"><polyline points="2,5 4,7 8,3" stroke="white" stroke-width="1.5" fill="none"/></svg></div>
        </div>
        <div class="post-subloc">📍 ${m.loc}</div>
        ${m.client?`<div class="post-client-line"><strong>Client</strong> ${projectClientName(m)}</div>`:''}
      </div>
      <div style="position:relative">
        <button class="post-more" onclick="toggleMenu(${i})" id="moreBtn${i}">···</button>
        ${moreMenu}
      </div>
    </div>
    <div class="post-image-wrap">
      ${buildCardCarousel(m,i)}
    </div>
    <div class="post-actions">
      <button class="action-btn" onclick="openProject(${i})"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></button>
    </div>
    <div class="post-caption"><span class="handle">${projectDisplayName(m)}</span> ${m.caption} ${tags}<span class="show-more" onclick="openProject(${i})"> more</span></div>
    <div class="project-feed-meta">
      ${m.client?`<span><strong>Client</strong> ${projectClientName(m)}</span>`:''}
      ${m.architect?`<span><strong>Architect</strong> ${m.architect}</span>`:''}
      ${m.area?`<span><strong>Area</strong> ${m.area}</span>`:''}
      ${m.year?`<span><strong>Year</strong> ${m.year}</span>`:''}
    </div>
    <div class="post-time">${m.times}</div>
    ${commentBox}
  </article>`;
}

function toggleMenu(i){
  const menu=document.getElementById('postMenu'+i);
  if(menu) menu.style.display=menu.style.display==='none'||!menu.style.display?'block':'none';
}
function closeMenu(i){
  const menu=document.getElementById('postMenu'+i);
  if(menu) menu.style.display='none';
}
document.addEventListener('click',e=>{
  if(!e.target.closest('[id^="moreBtn"]')&&!e.target.closest('[id^="postMenu"]')){
    document.querySelectorAll('[id^="postMenu"]').forEach(m=>m.style.display='none');
  }
});

// ============================================================
// PROJECTS FEED — each project rendered as its own full post
// (same visual language as the Home feed), with its Mush number
// called out on the card. Uses its own carousel state/element ids
// (projCardImgIdx, pcImg*, pcCounter*) so it can render the same
// mushData alongside the Home feed without id collisions.
// ============================================================
function mushNumber(m){
  const match=(m&&m.handle||'').match(/Mush_(\d+)/i);
  return match?match[1]:(m&&m.id)||'';
}
function buildProjectCardCarousel(m,i){
  const imgs=m.images;
  if(!imgs||!imgs.length){
    return `<div class="post-img" style="background:${m.gradient}" onclick="openProject(${i})">
      <div class="post-img-inner">${m.emoji}</div>
      <div class="post-img-label">${m.tag}</div>
      <div class="post-img-sqft">📐 ${m.area}</div>
    </div>`;
  }
  const idx=projCardImgIdx[i]||0;
  const dots=imgs.length>1?`<div class="carousel-dots">${imgs.map((_,di)=>`<span class="carousel-dot${di===idx?' active':''}" onclick="event.stopPropagation();projCardGotoImg(${i},${di})"></span>`).join('')}</div>`:'';
  const arrows=imgs.length>1?`
      <button class="carousel-arrow carousel-arrow-left" onclick="event.stopPropagation();projCardPrevImg(${i})" aria-label="Previous image">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button class="carousel-arrow carousel-arrow-right" onclick="event.stopPropagation();projCardNextImg(${i})" aria-label="Next image">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="9 18 15 12 9 6"/></svg>
      </button>`:'';
  return `<div class="post-img img-carousel" id="pcImgWrap${i}">
      <div class="post-img-photo" id="pcImg${i}" style="background-image:url('${imgs[idx]}')" onclick="openProject(${i})"></div>
      <div class="post-img-label">${m.tag}</div>
      <div class="post-img-sqft">📐 ${m.area}</div>
      ${imgs.length>1?`<div class="carousel-counter" id="pcCounter${i}">${idx+1}/${imgs.length}</div>`:''}
      ${arrows}
      ${dots}
    </div>`;
}
function projCardSetImg(i,newIdx){
  const m=mushData[i];
  if(!m||!m.images||!m.images.length) return;
  const len=m.images.length;
  const wrapped=((newIdx%len)+len)%len;
  projCardImgIdx[i]=wrapped;
  const photoEl=document.getElementById('pcImg'+i);
  if(photoEl) photoEl.style.backgroundImage=`url('${m.images[wrapped]}')`;
  const counterEl=document.getElementById('pcCounter'+i);
  if(counterEl) counterEl.textContent=(wrapped+1)+'/'+len;
  const wrapEl=document.getElementById('pcImgWrap'+i);
  if(wrapEl) wrapEl.querySelectorAll('.carousel-dot').forEach((d,di)=>d.classList.toggle('active',di===wrapped));
}
function projCardNextImg(i){ projCardSetImg(i,(projCardImgIdx[i]||0)+1); }
function projCardPrevImg(i){ projCardSetImg(i,(projCardImgIdx[i]||0)-1); }
function projCardGotoImg(i,idx){ projCardSetImg(i,idx); }

function buildProjectPostCard(m,i){
  const tags=m.hashtags.map(h=>`<span class="hashtag">${h}</span>`).join(' ');
  return `<article class="mush-card sr" data-index="${i}" data-cat="${m.category}">
    <div class="post-header">
      <div class="post-avatar-ring"><div class="post-avatar"><span class="post-avatar-label">${m.id}</span></div></div>
      <div class="post-info">
        <div class="post-handle" onclick="openProject(${i})" style="cursor:pointer" title="View ${projectDisplayName(m)}">${projectDisplayName(m)}
          <div class="verified-badge"><svg viewBox="0 0 10 10"><polyline points="2,5 4,7 8,3" stroke="white" stroke-width="1.5" fill="none"/></svg></div>
        </div>
        <div class="post-subloc">📍 ${m.loc}</div>
      </div>
      <div class="mush-badge">MUSH #${mushNumber(m)}</div>
    </div>
    <div class="post-image-wrap">
      ${buildProjectCardCarousel(m,i)}
    </div>
    <div class="post-actions">
      <button class="action-btn" onclick="openProject(${i})"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></button>
    </div>
    <div class="post-caption"><span class="handle">${projectDisplayName(m)}</span> ${m.caption} ${tags}<span class="show-more" onclick="openProject(${i})"> more</span></div>
    <div class="project-feed-meta">
      ${m.client?`<span><strong>Client</strong> ${projectClientName(m)}</span>`:''}
      ${m.architect?`<span><strong>Architect</strong> ${m.architect}</span>`:''}
      ${m.area?`<span><strong>Area</strong> ${m.area}</span>`:''}
      ${m.year?`<span><strong>Year</strong> ${m.year}</span>`:''}
    </div>
    <div class="post-time">${m.times}</div>
  </article>`;
}
function renderProjectsGrid(){
  const g=document.getElementById('projectsGrid');
  if(!g) return;
  const subEl=document.getElementById('projectsSubCount');
  if(subEl) subEl.textContent=mushData.length+' completed project'+(mushData.length===1?'':'s')+' in Chennai';
  g.innerHTML=mushData.map((m,i)=>buildProjectPostCard(m,i)).join('');
}
function filterProjects(cat,btn){
  document.querySelectorAll('#projectFilters .tag-pill').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('#projectsGrid .mush-card').forEach((el,i)=>{
    if(!mushData[i]){el.style.display='none';return;}
    const mCat=mushData[i].category||'';
    let show=false;
    if(cat==='all') show=true;
    else if(cat==='residential') show=mCat.includes('residential');
    else if(cat==='commercial') show=mCat.includes('commercial');
    else if(cat==='renovation') show=mCat.includes('renovation');
    else if(cat==='interior') show=mCat.includes('interior')||mCat.includes('bedroom')||mCat.includes('kitchen')||mCat.includes('living');
    else if(cat==='designbuild') show=mCat.includes('designbuild')||mCat.includes('luxury');
    else if(cat==='kitchen') show=mCat.includes('kitchen');
    else if(cat==='bedroom') show=mCat.includes('bedroom');
    else if(cat==='living') show=mCat.includes('living');
    else if(cat==='luxury') show=mCat.includes('luxury');
    else if(cat==='office') show=mCat.includes('office')||mCat.includes('commercial');
    else show=mCat.includes(cat);
    el.style.display=show?'':'none';
  });
}

// ============================================================
// INFO CAROUSEL POSTS — Home intro / About / Contact
// Same "post" shell as a project card (header, media, actions,
// caption), but the media area swipes through branded coral
// slides instead of real photos. All slides for a post stay in
// the DOM (display toggled, not re-rendered) so anything typed
// into the Contact form isn't lost while swiping between slides.
// ============================================================
function defaultSlideInner(icon,heading,bodyHtml){
  return `<div class="info-slide-icon">${icon}</div>
    <div class="info-slide-heading">${heading}</div>
    <div class="info-slide-body">${bodyHtml}</div>`;
}
const infoPosts={
  home:{ idx:0, slides:[
    {inner:defaultSlideInner('🏠','SpaceMush Architects','<p><strong>Chennai · Est. 2020</strong></p><p>Design, documentation &amp; end-to-end construction for small and constrained homes.</p>')},
    {inner:defaultSlideInner('✨','55+ Projects Delivered','<p>From tight urban plots to full home renovations — one Chennai studio, one accountable team, start to finish.</p>')},
    {inner:defaultSlideInner('📐','Small Spaces Deserve Design',"<p>Every inch matters. We believe good design shouldn't be reserved only for large homes and big budgets.</p>")},
    {inner:defaultSlideInner('🛠️','Explore Our Work','<p>Swipe through our projects below, or head to the Projects tab to browse every Mush by category.</p>')}
  ]},
  about:{ idx:0, slides:[
    {inner:defaultSlideInner('🍄','What is SpaceMush?',"<p>The term Mush comes from Mushroom, signifying small, fast-growing entities of various shapes and sizes.</p><p>The name came from Architect Sivaraman's 7-year-old daughter Saraa, who dreams of designing a cute mushroom house. We believe small spaces deserve design too — so we became SpaceMush.</p>")},
    {inner:defaultSlideInner('🏗️','What We Do','<p>We design and execute small spaces — new buildings needing meticulous, functional design with daylight, ventilation and smart construction on high-value urban plots, or existing buildings needing personalised interiors in modular-interior time and cost. We have it covered.</p>')},
    {inner:defaultSlideInner('📋','Our Services','<ul><li><strong>Design Only</strong> — architectural concept and drawings. You execute independently with your own contractor.</li><li><strong>Design + Documentation</strong> — full concept plus construction-ready documentation. You hire and manage your own contractor.</li><li><strong>Full End-to-End</strong> — design, documentation, execution, site supervision and construction, delivered directly by our team.</li></ul>')},
    {inner:defaultSlideInner('❤️','Why SpaceMush?','<p style="font-weight:700;font-size:15px">Every small space deserves design!</p><p>That\'s our honest mission. Why should only the affluent deserve design? Just because a space is small doesn\'t mean it shouldn\'t be designed due to time or cost constraints.</p>')},
    {inner:defaultSlideInner('🏆','Why Choose SpaceMush?','<ul><li><strong>Genuine small-space specialization</strong> — while most firms compete for large villas, we\'ve built our entire practice around small and constrained spaces.</li><li><strong>Founder-led attention</strong> — every project gets senior involvement, not a junior hand-off.</li><li><strong>True end-to-end delivery</strong> — one accountable team, concept to construction.</li><li><strong>Ventilation &amp; livability expertise</strong> — airflow and light are core requirements, not afterthoughts.</li><li><strong>Proven track record</strong> — 55+ projects delivered across India, rooted in Chennai.</li></ul>')},
    {inner:defaultSlideInner('💡','Idea Behind SpaceMush','<p>SpaceMush is the brainchild of Ar. Sivaraman aka SSR, who learnt how to dream big from a small space — and wants to do the same for every small space that comes his way.</p>')},
    {inner:defaultSlideInner('👥','Who We Are','<p><strong>Architect SSR</strong> — Founder<br>18+ years, 350+ projects. A domain expert in Design &amp; Construction who has worked across esteemed firms in India and London. Now heads SpaceMush.</p><p><strong>Ar. Shyam Sundar</strong> — Principal Architect<br>14 years in Architecture &amp; Construction. Known for a meticulous eye for detail, site coordination, documentation and client communication. Steers the SpaceMush team.</p>')}
  ]},
  contact:{ idx:0, slides:[
    {inner:`<div class="info-slide-icon">💬</div>
      <div class="info-slide-heading">Reach Us</div>
      <div class="info-slide-tiles">
        <div class="info-slide-tile" onclick="window.open('https://www.instagram.com/spacemush_architects_chennai/','_blank')"><div class="info-slide-tile-icon">📸</div><div class="info-slide-tile-title">Instagram</div><div class="info-slide-tile-sub">@spacemush_architects_chennai</div></div>
        <div class="info-slide-tile" onclick="window.open('https://wa.me/919080430134','_blank')"><div class="info-slide-tile-icon">💬</div><div class="info-slide-tile-title">WhatsApp</div><div class="info-slide-tile-sub">+91 90804 30134</div></div>
        <div class="info-slide-tile" onclick="window.location.href='tel:+919080430134'"><div class="info-slide-tile-icon">📞</div><div class="info-slide-tile-title">Call Us</div><div class="info-slide-tile-sub">Mon–Sat 10am–7pm</div></div>
        <div class="info-slide-tile" onclick="window.location.href='mailto:ssr@spacemush.com'"><div class="info-slide-tile-icon">✉️</div><div class="info-slide-tile-title">Email</div><div class="info-slide-tile-sub">ssr@spacemush.com</div></div>
        <div class="info-slide-tile" onclick="window.open('https://maps.app.goo.gl/myANNorCUc2HB3qeA','_blank')"><div class="info-slide-tile-icon">📍</div><div class="info-slide-tile-title">Office</div><div class="info-slide-tile-sub">Alwarpet, Chennai</div></div>
        <div class="info-slide-tile" onclick="bookConsultationWhatsApp()"><div class="info-slide-tile-icon">📅</div><div class="info-slide-tile-title">Book a Call</div><div class="info-slide-tile-sub">Free 30-min consult</div></div>
      </div>`},
    {inner:`<div class="info-slide-icon">📍</div>
      <div class="info-slide-heading">Visit Our Office</div>
      <div class="info-slide-body">
        <p><strong>55, A3 Swati Sahana Apartments</strong><br>2nd Floor, KB Dasan Road<br>Alwarpet, Chennai – 600018</p>
        <p>Corner building on KB Dasan Road. From SIET College Road, it's on your LEFT. From TTK Road, it's on your RIGHT.</p>
        <p>Ground floor identifiers: <strong>Dakshin Art Gallery</strong> and <strong>Dental Clinic</strong>. SpaceMush is on the 2nd Floor.</p>
        <button class="info-slide-btn" onclick="window.open('https://maps.app.goo.gl/myANNorCUc2HB3qeA','_blank')">📍 Open in Google Maps</button>
      </div>`},
    {formVariant:true, inner:`<div class="info-slide-icon">✉️</div>
      <div class="info-slide-heading">Send a Message</div>
      <div class="fgroup"><label class="flabel">Your Name</label><input class="finput" id="rm-name" placeholder="Ramesh Kumar"></div>
      <div class="form-row-2"><div class="fgroup"><label class="flabel">Phone</label><input class="finput" id="rm-phone" placeholder="+91 99999 00000"></div><div class="fgroup"><label class="flabel">Email</label><input class="finput" id="rm-email" placeholder="you@example.com"></div></div>
      <div class="fgroup"><label class="flabel">Budget Range</label><select class="fselect" id="rm-budget"><option>Select budget</option><option>Under ₹5 Lakhs</option><option>₹5–10 Lakhs</option><option>₹10–25 Lakhs</option><option>₹25–50 Lakhs</option><option>₹50 Lakhs+</option></select></div>
      <div class="fgroup"><label class="flabel">Message</label><textarea class="finput" id="rm-message" rows="3" placeholder="Tell us about your space..." style="resize:vertical"></textarea></div>
      <button class="auth-submit" onclick="submitReachUsMessage()">Send Message</button>`}
  ]}
};

configureMixedInfoPosts();

function renderInfoCarousel(key){
  const post=infoPosts[key];
  const idx=post.idx||0;
  const slides=post.slides;
  const frames=slides.map((s,si)=>`<div class="info-slide${s.formVariant?' info-slide-form':''}" id="infoFrame_${key}_${si}" style="display:${si===idx?'flex':'none'}">${s.inner}</div>`).join('');
  const dots=slides.length>1?`<div class="carousel-dots">${slides.map((_,di)=>`<span class="carousel-dot${di===idx?' active':''}" onclick="event.stopPropagation();infoGotoSlide('${key}',${di})"></span>`).join('')}</div>`:'';
  const arrows=slides.length>1?`
      <button class="carousel-arrow carousel-arrow-left" onclick="event.stopPropagation();infoPrevSlide('${key}')" aria-label="Previous slide">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button class="carousel-arrow carousel-arrow-right" onclick="event.stopPropagation();infoNextSlide('${key}')" aria-label="Next slide">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="9 18 15 12 9 6"/></svg>
      </button>`:'';
  const counter=slides.length>1?`<div class="carousel-counter" id="infoCounter_${key}">${idx+1}/${slides.length}</div>`:'';
  return `<div class="info-carousel-wrap" id="infoWrap_${key}">
      ${frames}
      ${counter}
      ${arrows}
      ${dots}
    </div>`;
}
function infoSetSlide(key,newIdx){
  const post=infoPosts[key];
  if(!post) return;
  const len=post.slides.length;
  const wrapped=((newIdx%len)+len)%len;
  const prevIdx=post.idx||0;
  if(wrapped===prevIdx) return;
  post.idx=wrapped;
  const prevFrame=document.getElementById('infoFrame_'+key+'_'+prevIdx);
  if(prevFrame) prevFrame.style.display='none';
  const nextFrame=document.getElementById('infoFrame_'+key+'_'+wrapped);
  if(nextFrame) nextFrame.style.display='flex';
  const counterEl=document.getElementById('infoCounter_'+key);
  if(counterEl) counterEl.textContent=(wrapped+1)+'/'+len;
  const wrapEl=document.getElementById('infoWrap_'+key);
  if(wrapEl) wrapEl.querySelectorAll('.carousel-dot').forEach((d,di)=>d.classList.toggle('active',di===wrapped));
}
function infoNextSlide(key){ infoSetSlide(key,(infoPosts[key].idx||0)+1); }
function infoPrevSlide(key){ infoSetSlide(key,(infoPosts[key].idx||0)-1); }
function infoGotoSlide(key,idx){ infoSetSlide(key,idx); }

function buildInfoPostCard(key,opts){
  return `<article class="mush-card sr" data-key="${key}">
    <div class="post-header">
      <div class="post-avatar-ring"><div class="post-avatar"><span class="post-avatar-label">${opts.avatarText}</span></div></div>
      <div class="post-info">
        <div class="post-handle" style="cursor:default">${opts.handle}
          <div class="verified-badge"><svg viewBox="0 0 10 10"><polyline points="2,5 4,7 8,3" stroke="white" stroke-width="1.5" fill="none"/></svg></div>
        </div>
        <div class="post-subloc">${opts.subtitle}</div>
      </div>
    </div>
    <div class="post-image-wrap">
      ${renderInfoCarousel(key)}
    </div>
    <div class="post-actions">
      <button class="action-btn" onclick="${opts.actionOnClick}" title="${opts.actionTitle||''}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg></button>
    </div>
    <div class="post-caption">${opts.caption}</div>
    ${opts.time?`<div class="post-time">${opts.time}</div>`:''}
  </article>`;
}
function renderHomeIntroPost(){
  const c=document.getElementById('homeIntroPost');
  if(!c) return;
  c.innerHTML=buildInfoPostCard('home',{
    avatarText:'SM',
    handle:'spacemush_architects_chennai',
    subtitle:'📍 Chennai · Est. 2020',
    caption:'<span class="handle">spacemush_architects_chennai</span> Small Spaces Deserve Design ✨ <span class="hashtag">#SmallSpacesDeserveDesign</span> <span class="hashtag">#SpaceMush</span> <span class="hashtag">#Chennai</span>',
    actionOnClick:"bookConsultationWhatsApp()",
    actionTitle:'Chat with us on WhatsApp',
    time:'Studio Intro'
  });
}
function renderAboutPost(){
  const c=document.getElementById('aboutPost');
  if(!c) return;
  c.innerHTML=buildInfoPostCard('about',{
    avatarText:'SM',
    handle:'spacemush_architects_chennai',
    subtitle:'About Us · Where every inch matters',
    caption:'<span class="handle">spacemush_architects_chennai</span> Designing small spaces beautifully. <span class="hashtag">#AboutSpaceMush</span> <span class="hashtag">#DesignSmallSpaces</span>',
    actionOnClick:"bookConsultationWhatsApp()",
    actionTitle:'Ask us about SpaceMush on WhatsApp'
  });
}
function renderContactPost(){
  const c=document.getElementById('contactPost');
  if(!c) return;
  c.innerHTML=buildInfoPostCard('contact',{
    avatarText:'SM',
    handle:'spacemush_architects_chennai',
    subtitle:"Get in touch · We'd love to hear about your space",
    caption:'<span class="handle">spacemush_architects_chennai</span> Let\'s build something beautiful. <span class="hashtag">#ContactSpaceMush</span> <span class="hashtag">#BookAConsultation</span>',
    actionOnClick:"bookConsultationWhatsApp()",
    actionTitle:'Chat with us on WhatsApp'
  });
}

// ============================================================
// SUGGESTIONS + STYLES
// ============================================================
function renderStyles(){
  const c=document.getElementById('stylesContainer');
  if(!c) return;
  c.innerHTML=stylesData.map(s=>`<span class="tag-pill" onclick="this.classList.toggle('active');toast('🎨 ${s} style selected')">${s}</span>`).join('');
}

// ============================================================
// INTERACTIONS
// ============================================================
function toggleFollowSpaceMush(){
  isFollowingSpaceMush=!isFollowingSpaceMush;
  applyFollowButtonState();
  toast(isFollowingSpaceMush?'✅ Following SpaceMush!':'Unfollowed');
}
function applyFollowButtonState(){
  var btn=el('pmrFollowBtn');
  if(!btn) return;
  if(isFollowingSpaceMush){
    btn.textContent='Following';
    btn.style.background='var(--bg2)';
    btn.style.color='var(--text)';
    btn.style.border='1px solid var(--border)';
  } else {
    btn.textContent='Follow';
    btn.style.background='var(--coral)';
    btn.style.color='#fff';
    btn.style.border='none';
  }
}
function togglePostBtn(input,btnId){
  const btn=document.getElementById(btnId);
  if(btn) btn.classList.toggle('active',input.value.trim().length>0);
}
function postComment(i){
  var inp=el('commentInput'+i);
  if(!inp||!inp.value.trim()) return;
  var txt=inp.value.trim();
  if(!commitComment(i,txt)) return;
  inp.value='';
  var btn=el('postBtn'+i);
  if(btn) btn.classList.remove('active');
}

function postModalComment(){
  var i=currentOpenPostIdx;
  var inp=el('pmrCommentInput');
  if(i<0||!inp||!inp.value.trim()) return;
  var txt=inp.value.trim();
  if(!commitComment(i,txt)) return;
  inp.value='';
  var commentsSection=el('pmrCommentsSection');
  if(commentsSection) commentsSection.style.display='block';
  // Refresh the modal's own comment count + thread immediately
  set('pmrComments','textContent',mushData[i].comments);
  var pcl=el('pmrCommentsList');
  if(pcl){
    var postComments=allComments.filter(c=>c.mushIdx===i);
    pcl.innerHTML=postComments.length?postComments.map(c=>`
    <div class="modal-comment">
      <div style="display:flex;align-items:flex-start;gap:8px">
        <div style="width:28px;height:28px;border-radius:50%;background:${c.verified?'linear-gradient(135deg,var(--coral),#c44545)':'var(--bg)'};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:${c.verified?'#fff':'var(--lightgray)'};flex-shrink:0">${c.user[0]}</div>
        <div style="flex:1">
          <div style="font-size:13.5px">
            <span class="mc-user">${c.user}</span>
            ${c.verified?`<span style="display:inline-flex;align-items:center;justify-content:center;width:13px;height:13px;background:#1d9bf0;border-radius:50%;vertical-align:middle;margin:0 3px"><svg viewBox="0 0 10 10" width="8" height="8"><polyline points="2,5 4,7 8,3" stroke="white" stroke-width="1.5" fill="none"/></svg></span><span style="font-size:11px;font-weight:700;color:var(--coral)">${c.profession}</span>`:''}
            <span class="mc-text"> ${c.text}</span>
          </div>
          <div style="display:flex;gap:14px;margin-top:5px">
            <span class="mc-time">${c.time}</span>
            <span class="mc-like" onclick="toast('❤️ Liked!')">Like</span>
            <span class="mc-reply" onclick="toast('💬 Sign in to reply')">Reply</span>
          </div>
        </div>
      </div>
    </div>`).join(''):'<div style="padding:20px 0;text-align:center;color:var(--text4);font-size:13px">No comments yet. Be the first to comment!</div>';
  }
}

// Shared comment-commit logic used by both the feed card and the project modal.
// Returns true on success, false if the person isn't signed in (and redirects to login).
function commitComment(i,txt){
  if(studioLoggedIn){
    addNotification({type:'comment',user:'Studio',avatar:'SM',
      text:'Studio replied on <b>'+mushData[i].handle+'</b>: "'+txt.substring(0,40)+'"',
      time:'just now',mushIdx:i,thumb:mushData[i].emoji});
    mushData[i].comments++;
    injectFeedComment(i,'SpaceMush Studio',txt,true,'Studio');
    toast('💬 Posted as SpaceMush Studio!');
    return true;
  }
  return false;
}

function injectFeedComment(i,user,text,verified,profession){
  // Update "View all X comments" count
  var vc=document.querySelector('[data-index="'+i+'"] .view-comments');
  if(vc) vc.textContent='View all '+mushData[i].comments+' comments';
  // Show the latest comment as a preview line under the post
  var tick=verified?'<span class="comm-verified-small"><svg viewBox="0 0 10 10" width="7" height="7"><polyline points="2,5 4,7 8,3" stroke="white" stroke-width="1.5" fill="none"/></svg></span>':'' ;
  var prof=verified&&profession?'<span class="comm-profession-badge">'+profession+'</span>':'';
  var prev=document.querySelector('[data-index="'+i+'"] .comment-preview');
  if(!prev){
    prev=document.createElement('div');
    prev.className='comment-preview';
    if(vc&&vc.parentNode) vc.parentNode.insertBefore(prev,vc.nextSibling);
  }
  prev.innerHTML='<span class="comm-user">'+user+'</span>'+tick+prof+' <span class="comm-text">'+text+'</span>';
  // Record in this session's live list (used by the public feed/modal)
  var newComment={
    id:Date.now(),user:user,verified:!!verified,profession:profession||'',
    mushIdx:i,mushHandle:mushData[i].handle,text:text,time:'just now'
  };
  allComments.unshift(newComment);
  // Also archive it so admin still sees it after this visitor's tab/session ends
  archiveAdd('comments',newComment);
}

// ============================================================
// NOTIFICATION PANEL
// ============================================================
function toggleNotifPanel(){
  const panel=document.getElementById('notifPanel');
  notifPanelOpen=!notifPanelOpen;
  if(notifPanelOpen){
    renderNotifPanel();
    panel.classList.add('open');
  } else {
    panel.classList.remove('open');
  }
}
document.addEventListener('click',e=>{
  if(notifPanelOpen&&!e.target.closest('#notifPanel')&&!e.target.closest('.notif-bell-wrap')){
    removeClass('notifPanel','open');
    notifPanelOpen=false;
  }
});

function renderNotifPanel(){
  var list=el('notifList');
  if(!list) return;
  var icons={like:'❤️',comment:'💬',save:'🔖',verify:'🔵',new:'✨',edit:'✏️',story:'📖',enquiry:'📩'};
  var bgMap={like:'#fee2e2',comment:'#dbeafe',save:'#fef9c3',verify:'#fdf0f0',new:'#d1fae5',edit:'#f3e8ff',story:'#fce7f3',enquiry:'#ffe4d6'};
  list.innerHTML='';
  if(!notifications.length){
    var empty=document.createElement('div');
    empty.className='notif-empty';
    empty.innerHTML='<div style="font-size:28px;margin-bottom:8px">🔔</div><div>No notifications yet</div>';
    list.appendChild(empty);
    return;
  }
  notifications.slice(0,20).forEach(function(n){
    var item=document.createElement('div');
    item.className='notif-item'+(n.unread?' unread':'');
    item.onclick=function(){notifClick(n.id);};

    var avatarWrap=document.createElement('div');
    avatarWrap.style.cssText='position:relative;flex-shrink:0';
    var av=document.createElement('div');
    av.className='notif-avatar';
    av.textContent=n.avatar;
    var badge=document.createElement('div');
    badge.style.cssText='position:absolute;bottom:-2px;right:-2px;width:16px;height:16px;border-radius:50%;background:'+(bgMap[n.type]||'#d1fae5')+';display:flex;align-items:center;justify-content:center;font-size:9px;border:2px solid var(--bg)';
    badge.textContent=(icons[n.type]||'✨');
    avatarWrap.appendChild(av);
    avatarWrap.appendChild(badge);
    item.appendChild(avatarWrap);

    var body=document.createElement('div');
    body.className='notif-body';
    var txt=document.createElement('div');
    txt.className='notif-text';
    txt.innerHTML=n.text;
    var time=document.createElement('div');
    time.className='notif-time';
    time.textContent=n.time;
    body.appendChild(txt);
    body.appendChild(time);
    item.appendChild(body);

    if(n.thumb&&n.mushIdx>=0){
      var thumb=document.createElement('div');
      thumb.className='notif-thumb';
      thumb.textContent=n.thumb;
      item.appendChild(thumb);
    }
    list.appendChild(item);
  });
}
function notifClick(id){
  var n=notifications.find(function(x){return x.id===id;});
  if(!n) return;
  n.unread=false;
  updateBadges();
  renderNotifPanel();
  if(n.type==='verify'){
    // Close notif panel and open admin verification tab
    var panel=el('notifPanel');
    if(panel) panel.classList.remove('open');
    notifPanelOpen=false;
    openAdminPanel();
    setTimeout(function(){
      var btn=el('adminNavVerif');
      if(btn) adminTab('verification',btn);
    },250);
  } else if(n.mushIdx>=0&&n.mushIdx<mushData.length){
    var panel=el('notifPanel');
    if(panel) panel.classList.remove('open');
    notifPanelOpen=false;
    openProject(n.mushIdx);
  }
}

function markAllRead(){
  notifications.forEach(n=>n.unread=false);
  updateBadges();
  renderNotifPanel();
  toast('✅ All notifications marked as read');
}

function addNotification(n){
  n.id=Date.now();
  n.unread=true;
  notifications.unshift(n);
  archiveAdd('notifications',n);
  updateBadges();
}

function updateBadges(){
  var count=unreadCount();
  var pCount=pendingVerifCount();
  var rCount=unreadReachUsCount();
  // Sidebar notification badge on bell icon
  var sbBadge=document.getElementById('sidebarNotifBadge');
  if(sbBadge){sbBadge.textContent=count;sbBadge.style.display=count>0?'flex':'none';}
  // Admin panel badges
  var adminBadge=document.getElementById('adminNotifBadge');
  if(adminBadge){adminBadge.textContent=count;adminBadge.style.display=count>0?'flex':'none';}
  var verifBadge=document.getElementById('adminVerifBadge');
  if(verifBadge){verifBadge.textContent=pCount;verifBadge.style.display=pCount>0?'flex':'none';}
  var reachUsBadge=document.getElementById('adminReachUsBadge');
  if(reachUsBadge){reachUsBadge.textContent=rCount;reachUsBadge.style.display=rCount>0?'flex':'none';}
  // Also update any nav badge that exists
  var navBadge=document.getElementById('navNotifBadge');
  if(navBadge){navBadge.textContent=count;navBadge.style.display=count>0?'flex':'none';}
}

// ============================================================
// CREATE / EDIT POST
// ============================================================
function openCreatePost(editIndex){
  if(!studioLoggedIn){toast('🔐 Please log in to Studio first');openAuth('studio');return;}
  currentEditIndex=editIndex!==undefined?editIndex:-1;
  const isEdit=currentEditIndex>=0;
  document.getElementById('createPostTitle').textContent=isEdit?'✏️ Edit Mush Post':'✦ New Mush Post';
  // Reset emoji picker
  document.getElementById('uploadIcon').style.display='block';
  document.getElementById('uploadPreview').style.display='none';
  document.getElementById('uploadZone').classList.remove('has-img');
  document.getElementById('cp-story-toggle').checked=false;
  document.getElementById('cp-story-note').style.display='none';
  if(isEdit){
    const m=mushData[currentEditIndex];
    document.getElementById('cp-handle').value=m.handle;
    document.getElementById('cp-loc').value=m.loc;
    document.getElementById('cp-area').value=m.area;
    document.getElementById('cp-budget').value=m.budget;
    document.getElementById('cp-year').value=m.year;
    document.getElementById('cp-timeline').value=m.timeline;
    document.getElementById('cp-architect').value=m.architect;
    document.getElementById('cp-designer').value=m.designer;
    document.getElementById('cp-caption').value=m.caption;
    document.getElementById('cp-desc').value=m.desc;
    // Set emoji preview
    document.getElementById('uploadIcon').style.display='none';
    const prev=document.getElementById('uploadPreview');
    prev.textContent=m.emoji;prev.style.display='block';
    document.getElementById('uploadZone').classList.add('has-img');
  } else {
    document.getElementById('cp-handle').value='';
    document.getElementById('cp-loc').value='';
    document.getElementById('cp-area').value='';
    document.getElementById('cp-budget').value='';
    document.getElementById('cp-year').value=new Date().getFullYear();
    document.getElementById('cp-timeline').value='';
    document.getElementById('cp-architect').value='Karthik R.';
    document.getElementById('cp-designer').value='Harish S.';
    document.getElementById('cp-caption').value='';
    document.getElementById('cp-desc').value='';
  }
  document.getElementById('cp-story-toggle').addEventListener('change',function(){
    document.getElementById('cp-story-note').style.display=this.checked?'block':'none';
  });
  addClass('createPostOverlay','open');
  document.body.style.overflow='hidden';
}

function openEditPost(i){
  openCreatePost(i);
}

const emojiOptions=['🏠','🍳','🛏️','🪴','🏢','✨','💼','🏗️','🌿','🛁','🏡','🎨'];
let emojiPickIdx=0;
function pickEmoji(){
  emojiPickIdx=(emojiPickIdx+1)%emojiOptions.length;
  const em=emojiOptions[emojiPickIdx];
  document.getElementById('uploadIcon').style.display='none';
  const prev=document.getElementById('uploadPreview');
  prev.textContent=em;prev.style.display='block';
  document.getElementById('uploadZone').classList.add('has-img');
}

function saveDraft(){
  toast('💾 Draft saved!');
  closeCreatePost();
}

function publishMush(){
  const handle=document.getElementById('cp-handle').value.trim();
  if(!handle){toast('⚠️ Please enter a Mush handle');return;}
  const isEdit=currentEditIndex>=0;
  const previewEmoji=document.getElementById('uploadPreview').textContent||emojiOptions[0];
  const newMush={
    id:String(mushData.length+1).padStart(3,'0'),
    handle:handle,
    loc:document.getElementById('cp-loc').value||'Chennai',
    emoji:previewEmoji,
    tag:document.getElementById('cp-tag').value,
    gradient:'linear-gradient(160deg,#f5e6e6 0%,#ffe8cc 100%)',
    bg:'135deg,#3a1010,#2a1800',
    category:tagToCategory(document.getElementById('cp-tag').value),
    area:document.getElementById('cp-area').value||'—',
    year:document.getElementById('cp-year').value||'2024',
    budget:document.getElementById('cp-budget').value||'—',
    type:document.getElementById('cp-type').value,
    timeline:document.getElementById('cp-timeline').value||'—',
    architect:document.getElementById('cp-architect').value||'Karthik R.',
    designer:document.getElementById('cp-designer').value||'Harish S.',
    contractor:'M/s BuildRight',
    likes:0,comments:0,
    hasStory:document.getElementById('cp-story-toggle').checked,
    storyCaption:document.getElementById('cp-story-toggle').checked?'Check out our latest project!':'',
    caption:document.getElementById('cp-caption').value||'A new Mush project is live!',
    hashtags:['#SpaceMush','#InteriorDesign'],
    desc:document.getElementById('cp-desc').value||'An exceptional interior design project by SpaceMush Studio.',
    philosophy:'Thoughtful design for every space.',
    materials:['Quality Materials','Expert Craftsmanship'],
    palette:['#c4805a','#f5e6d3','#3a2a1a'],
    gallery:['🏠','✨','💡','🌿','🛋️','🪟'],
    testimonial:'"Another exceptional SpaceMush project."',
    client:'— Happy Client',times:'just now',
  };
  if(isEdit){
    // Merge into existing, preserve some fields
    Object.assign(mushData[currentEditIndex],{...newMush,
      id:mushData[currentEditIndex].id,
      likes:mushData[currentEditIndex].likes,
      comments:mushData[currentEditIndex].comments,
    });
    addNotification({type:'edit',user:'Studio',avatar:'SM',text:`Post <b>${handle}</b> was updated by Studio`,time:'just now',mushIdx:currentEditIndex,thumb:previewEmoji});
    toast('✅ Mush post updated!');
  } else {
    mushData.push(newMush);
    addNotification({type:'new',user:'Studio',avatar:'SM',text:`New post published: <b>${handle}</b>`,time:'just now',mushIdx:mushData.length-1,thumb:previewEmoji});
    if(newMush.hasStory){
      addNotification({type:'story',user:'Studio',avatar:'SM',text:`Story auto-posted for <b>${handle}</b>`,time:'just now',mushIdx:mushData.length-1,thumb:previewEmoji});
    }
    toast('🚀 New Mush published!');
  }
  closeCreatePost();
  renderFeed();
  renderStories();
  renderProjectsGrid();
  renderAdminPosts();
  setupScrollReveal();
}

function tagToCategory(tag){
  const map={'Residential':'residential','Kitchen':'kitchen','Bedroom':'bedroom','Living Room':'living','Commercial':'commercial','Luxury':'luxury','Office':'commercial','Renovation':'residential'};
  return map[tag]||'residential';
}

function deleteMush(i){
  if(!confirm(`Delete ${mushData[i].handle}? This cannot be undone.`)) return;
  mushData.splice(i,1);
  renderFeed();
  renderStories();
  renderProjectsGrid();
  renderAdminPosts();
  toast('🗑️ Mush post deleted');
}

function closeCreatePost(e){
  if(!e||e.target===document.getElementById('createPostOverlay')){
    removeClass('createPostOverlay','open');
    document.body.style.overflow='';
  }
}

// ============================================================
// STORY CREATE
// ============================================================
function openStoryCreate(linkedMushIdx){
  if(!studioLoggedIn){toast('🔐 Studio login required');return;}
  // Populate mush picker
  const picker=document.getElementById('st-mush-select');
  picker.innerHTML=mushData.map((m,i)=>`<option value="${i}">${m.handle}</option>`).join('');
  if(linkedMushIdx!==undefined) picker.value=linkedMushIdx;
  addClass('storyCreateOverlay','open');
  document.body.style.overflow='hidden';
}

function updateStoryMushPicker(){
  const type=document.getElementById('st-type').value;
  document.getElementById('st-mush-picker').style.display=type==='mush'?'block':'none';
}

function publishStory(){
  const type=document.getElementById('st-type').value;
  const caption=document.getElementById('st-caption').value||'New story from SpaceMush!';
  let linkedMushIdx=-1;
  if(type==='mush'){
    linkedMushIdx=parseInt(document.getElementById('st-mush-select').value);
    if(!isNaN(linkedMushIdx)&&mushData[linkedMushIdx]){
      mushData[linkedMushIdx].hasStory=true;
      mushData[linkedMushIdx].storyCaption=caption;
    }
  }
  addNotification({type:'story',user:'Studio',avatar:'SM',
    text:`Story posted: "${caption.substring(0,50)}..."`,
    time:'just now',mushIdx:linkedMushIdx,
    thumb:linkedMushIdx>=0&&mushData[linkedMushIdx]?mushData[linkedMushIdx].emoji:'📖'});
  renderStories();
  closeStoryCreate();
  toast('📖 Story published!');
}

function closeStoryCreate(e){
  if(!e||e.target===document.getElementById('storyCreateOverlay')){
    removeClass('storyCreateOverlay','open');
    document.body.style.overflow='';
  }
}

// ============================================================
// PROJECT DETAIL MODAL
// ============================================================
function renderModalCarousel(i){
  const m=mushData[i];
  var pmlImg=document.getElementById('pmlImg');
  if(!pmlImg) return;
  if(m.images&&m.images.length){
    const imgs=m.images;
    const arrows=imgs.length>1?`
      <button class="carousel-arrow carousel-arrow-left" onclick="event.stopPropagation();modalPrevImg()" aria-label="Previous image">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button class="carousel-arrow carousel-arrow-right" onclick="event.stopPropagation();modalNextImg()" aria-label="Next image">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="9 18 15 12 9 6"/></svg>
      </button>`:'';
    pmlImg.style.background='#111';
    pmlImg.innerHTML=`<div class="post-img-photo" id="pmlPhoto" style="width:100%;height:100%;background-image:url('${imgs[0]}')"></div>
      ${imgs.length>1?`<div class="carousel-counter" id="pmlCounter">1/${imgs.length}</div>`:''}
      ${arrows}`;
  } else {
    pmlImg.style.background=`linear-gradient(${m.bg})`;
    pmlImg.innerHTML=`<span style="font-size:100px">${m.emoji}</span>`;
  }
}
function modalSetImg(newIdx){
  const m=mushData[currentOpenPostIdx];
  if(!m||!m.images||!m.images.length) return;
  const len=m.images.length;
  modalImgIdx=((newIdx%len)+len)%len;
  const photoEl=document.getElementById('pmlPhoto');
  if(photoEl) photoEl.style.backgroundImage=`url('${m.images[modalImgIdx]}')`;
  const counterEl=document.getElementById('pmlCounter');
  if(counterEl) counterEl.textContent=(modalImgIdx+1)+'/'+len;
  document.querySelectorAll('#pmrGallery .modal-gallery-item').forEach((t,ti)=>t.classList.toggle('active-thumb',ti===modalImgIdx));
}
function modalNextImg(){ modalSetImg(modalImgIdx+1); }
function modalPrevImg(){ modalSetImg(modalImgIdx-1); }
function modalGotoImg(idx){ modalSetImg(idx); }

function openProject(i){
  currentOpenPostIdx=i;
  const m=mushData[i];
  var pmlImg=document.getElementById('pmlImg');
  if(!pmlImg) return;
  var commentRow=el('pmrCommentInputRow');
  if(commentRow) commentRow.style.display=studioLoggedIn?'flex':'none';
  modalImgIdx=0;
  renderModalCarousel(i);
  set('pmlTag','textContent',m.tag);
  set('pmlName','textContent',projectDisplayName(m));
  set('pmlLoc','textContent',m.loc);
  set('pmrNum','textContent',m.id);
  set('pmrHandle','innerHTML',projectDisplayName(m)+' <span style="display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;background:#1d9bf0;border-radius:50%;"><svg viewBox="0 0 10 10" width="10" height="10"><polyline points="2,5 4,7 8,3" stroke="white" stroke-width="1.5" fill="none"/></svg></span>');
  applyFollowButtonState();
  set('pmrDesc','textContent',m.desc);
  set('pmrPhilosophy','textContent',m.philosophy);
  var pmeta=el('pmrMeta'); if(pmeta) pmeta.innerHTML=[
    ['Location',m.loc],['Client',m.client || 'Not disclosed'],['Area',m.area],['Year',m.year],
    ['Budget',m.budget],['Type',m.type],['Timeline',m.timeline],
    ['Architect',m.architect],['Designer',m.designer],['Contractor',m.contractor],
  ].map(([l,v])=>`<div class="pmr-meta-item"><div class="pmr-meta-label">${l}</div><div class="pmr-meta-val">${v}</div></div>`).join('');
  var pmat=el('pmrMaterials'); if(pmat) pmat.innerHTML=m.materials.map(mat=>`<span class="mat-chip">${mat}</span>`).join('');
  var ppal=el('pmrPalette'); if(ppal) ppal.innerHTML=m.palette.map(c=>`<div class="palette-swatch" style="background:${c}" title="${c}" onclick="toast('Color: ${c}')"></div>`).join('')+`<span style="font-size:12px;color:var(--lightgray);margin-left:8px">${m.palette.length} colors</span>`;
  var pgal=el('pmrGallery');
  if(pgal){
    if(m.images&&m.images.length){
      pgal.innerHTML=m.images.map((src,gi)=>`<div class="modal-gallery-item${gi===0?' active-thumb':''}" id="galThumb${gi}" style="background-image:url('${src}');background-size:cover;background-position:center" onclick="modalGotoImg(${gi})"></div>`).join('');
    } else {
      pgal.innerHTML=m.gallery.map(e=>`<div class="modal-gallery-item" style="background:${m.gradient}">${e}</div>`).join('');
    }
  }
  var pmrTestimonialBox=document.querySelector('.pmr-testimonial');
  if(m.testimonial){
    if(pmrTestimonialBox) pmrTestimonialBox.style.display='block';
    set('pmrTestimonial','textContent',m.testimonial);
    set('pmrClient','textContent',m.client);
  } else {
    if(pmrTestimonialBox) pmrTestimonialBox.style.display='none';
  }

  // Studio edit button (use the existing static button in the header; its onclick already resolves the current post)
  const pmrEditBtn=document.getElementById('pmrEditBtn');
  if(pmrEditBtn) pmrEditBtn.style.display=studioLoggedIn?'inline-block':'none';

  // Build comments from real submitted comments for this post — verified members show tick + profession
  const postComments=allComments.filter(c=>c.mushIdx===i);
  var pcl=el('pmrCommentsList');
  var commentsSection=el('pmrCommentsSection');
  if(pcl){
    if(commentsSection) commentsSection.style.display=postComments.length?'block':'none';
    if(!postComments.length){
      pcl.innerHTML='';
    } else {
      pcl.innerHTML=postComments.map(c=>`
    <div class="modal-comment">
      <div style="display:flex;align-items:flex-start;gap:8px">
        <div style="width:28px;height:28px;border-radius:50%;background:${c.verified?'linear-gradient(135deg,var(--coral),#c44545)':'var(--bg)'};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:${c.verified?'#fff':'var(--lightgray)'};flex-shrink:0">${c.user[0]}</div>
        <div style="flex:1">
          <div style="font-size:13.5px">
            <span class="mc-user">${c.user}</span>
            ${c.verified?`<span style="display:inline-flex;align-items:center;justify-content:center;width:13px;height:13px;background:#1d9bf0;border-radius:50%;vertical-align:middle;margin:0 3px"><svg viewBox="0 0 10 10" width="8" height="8"><polyline points="2,5 4,7 8,3" stroke="white" stroke-width="1.5" fill="none"/></svg></span><span style="font-size:11px;font-weight:700;color:var(--coral)">${c.profession}</span>`:''}
            <span class="mc-text"> ${c.text}</span>
          </div>
          <div style="display:flex;gap:14px;margin-top:5px">
            <span class="mc-time">${c.time}</span>
            <span class="mc-like" onclick="toast('❤️ Liked!')">Like</span>
            <span class="mc-reply" onclick="toast('💬 Sign in to reply')">Reply</span>
          </div>
        </div>
      </div>
    </div>`).join('');
    }
  }

  currentOpenPostIdx=i;
  // Show edit button only for studio
  var editBtn=el('pmrEditBtn');
  if(editBtn) editBtn.style.display=studioLoggedIn?'inline-flex':'none';
  addClass('projectOverlay','open');
  document.body.style.overflow='hidden';
}
function editCurrentPost(){
  var i=currentOpenPostIdx!==undefined?currentOpenPostIdx:-1;
  if(i<0){toast('No post selected');return;}
  closeProjectModal();
  setTimeout(function(){openCreatePost(i);},300);
}
function closeProjectModal(e){
  if(!e||e.target===document.getElementById('projectOverlay')){
    removeClass('projectOverlay','open');
    document.body.style.overflow='';
  }
}

// ============================================================
// AUTH MODAL (includes Studio login tab)
// ============================================================
function openAuth(type){
  el('stEmail').value='';
  el('stPass').value='';
  addClass('studioLoginOverlay','open');
  document.body.style.overflow='hidden';
}
function closeStudioLogin(e){
  if(!e||e.target===el('studioLoginOverlay')){
    removeClass('studioLoginOverlay','open');
    document.body.style.overflow='';
  }
}
function openAdminLogin(){
  addClass('adminLoginOverlay','open');
  document.body.style.overflow='hidden';
}

function submitStudioLogin(){
  var stEl=el('stEmail');var stPa=el('stPass');
  var email=stEl?stEl.value.trim():'';
  var pass=stPa?stPa.value:'';
  if(email===STUDIO_CREDS.email&&pass===STUDIO_CREDS.password){
    studioLoggedIn=true;
    closeStudioLogin();
    updateNavForStudio();
    updateBadges();
    toast('🏗️ Welcome to SpaceMush Studio!');
  } else {
    toast('❌ Invalid studio credentials');
  }
}

// Follower count — starts at base + signup count
let baseFollowers=0;
let signupCount=0;

function updateFollowerDisplay(){
  const total=baseFollowers+signupCount;
  var display=el('liveFollowersDisplay');
  if(display){
    display.textContent=total>=1000?(total/1000).toFixed(1)+'K':total.toLocaleString('en-IN');
  }
  // Update admin dashboard too
  var adminDisplay=el('adminFollowersCount');
  if(adminDisplay) adminDisplay.textContent=(2847+signupCount).toLocaleString('en-IN');
}

function closeAuthModal(e){
  if(!e||e.target===document.getElementById('authOverlay')){
    removeClass('authOverlay','open');
    document.body.style.overflow='';
  }
}

// ============================================================
// ADMIN PANEL — Full working implementation
// ============================================================
function openAdminPanel(){
  if(!studioLoggedIn&&!adminLoggedIn){
    var aEl=el('adminLoginEmail');
    var aPa=el('adminLoginPass');
    if(aEl) aEl.value='';
    if(aPa) aPa.value='';
    addClass('adminLoginOverlay','open');
    document.body.style.overflow='hidden';
    return;
  }
  launchAdminPanel(adminLoggedIn?'SpaceMush Admin':'SpaceMush Studio');
}

function submitAdminLogin(){
  var aEl=el('adminLoginEmail');
  var aPa=el('adminLoginPass');
  if(!aEl||!aPa) return;
  var em=aEl.value.trim();
  var pw=aPa.value;
  if(em===ADMIN_CREDS.email&&pw===ADMIN_CREDS.password){
    adminLoggedIn=true;
    closeAdminLogin();
    launchAdminPanel('SpaceMush Admin');
    toast('👑 Admin access granted. Welcome!');
  } else if(em===STUDIO_CREDS.email&&pw===STUDIO_CREDS.password){
    adminLoggedIn=true;
    closeAdminLogin();
    launchAdminPanel('SpaceMush Studio');
    toast('🏗️ Studio admin access granted!');
  } else {
    toast('❌ Wrong credentials.');
  }
}

function launchAdminPanel(userLabel){
  var lbl=el('adminUserLabel');
  if(lbl) lbl.textContent=userLabel;
  addClass('adminPanel','open');
  document.body.style.overflow='hidden';
  updateUserUI();
  // activate Dashboard tab
  document.querySelectorAll('.admin-nav-item').forEach(function(b){b.classList.remove('active');});
  var db=el('adnav-dashboard');
  if(db) db.classList.add('active');
  document.querySelectorAll('.admin-section').forEach(function(s){s.classList.remove('active');});
  var sec=el('adminSec-dashboard');
  if(sec) sec.classList.add('active');
  // render all sections so they are ready
  renderAdminDashboard();
  renderAdminNotifications();
  renderAdminVerification();
  renderAdminPosts();
  renderAdminComments();
  renderAdminAnalytics();
  updateBadges();
}

function closeAdminPanel(){
  removeClass('adminPanel','open');
  document.body.style.overflow='';
}

function closeAdminLogin(e){
  if(!e||e.target===el('adminLoginOverlay')){
    removeClass('adminLoginOverlay','open');
    document.body.style.overflow='';
  }
}

function adminTab(name,btn){
  document.querySelectorAll('.admin-nav-item').forEach(function(b){b.classList.remove('active');});
  if(btn) btn.classList.add('active');
  document.querySelectorAll('.admin-section').forEach(function(s){s.classList.remove('active');});
  var sec=el('adminSec-'+name);
  if(sec) sec.classList.add('active');
  var renders={
    dashboard:renderAdminDashboard,
    notifications:renderAdminNotifications,
    verification:renderAdminVerification,
    posts:renderAdminPosts,
    comments:renderAdminComments,
    reachus:renderAdminReachUs,
    analytics:renderAdminAnalytics
  };
  if(renders[name]) renders[name]();
}

// ─── DASHBOARD ────────────────────────────────────────────────
function renderAdminDashboard(){
  var asg=el('adminStatsGrid');
  if(!asg) return;
  var totalLikes=mushData.reduce(function(s,m){return s+m.likes;},0);
  var totalComments=mushData.reduce(function(s,m){return s+m.comments;},0);
  var unread=unreadCount();
  var pending=pendingVerifCount();
  var approved=empRequests.filter(function(r){return r.status==='approved';}).length;
  asg.innerHTML=[
    {icon:'🏗️',num:mushData.length,label:'Mush Posts Live',ch:mushData.length+' published',ok:true},
    {icon:'👥',num:(baseFollowers+signupCount).toLocaleString('en-IN'),label:'Total Followers',ch:'Grows with signups',ok:true},
    {icon:'❤️',num:totalLikes.toLocaleString('en-IN'),label:'Total Likes',ch:'Across all posts',ok:true},
    {icon:'💬',num:totalComments,label:'Total Comments',ch:allComments.length+' from real users',ok:true},
    {icon:'🔔',num:unread,label:'Unread Notifications',ch:unread>0?'⚠️ Needs attention':'All caught up',ok:unread===0},
    {icon:'⏳',num:pending,label:'Pending Verifications',ch:pending>0?'⚠️ Awaiting approval':'All reviewed',ok:pending===0},
    {icon:'✅',num:approved,label:'Verified Members',ch:'Blue tick holders',ok:true},
    {icon:'👤',num:saved.size,label:'Saves This Session',ch:'Live session count',ok:true},
  ].map(function(s){
    return '<div class="admin-stat-card" style="cursor:default">'+
      '<div style="display:flex;align-items:flex-start;justify-content:space-between">'+
        '<div class="asc-num">'+s.num+'</div>'+
        '<div style="font-size:22px;opacity:0.5">'+s.icon+'</div>'+
      '</div>'+
      '<div class="asc-label">'+s.label+'</div>'+
      '<div class="asc-change '+(s.ok?'up':'warn')+'">'+s.ch+'</div>'+
    '</div>';
  }).join('');
  // Top posts table
  var sorted=[].concat(mushData).sort(function(a,b){return b.likes-a.likes;}).slice(0,5);
  var atp=el('adminTopPostsTable');
  if(atp) atp.innerHTML=sorted.map(function(m){
    var idx=mushData.indexOf(m);
    return '<tr onclick="closeAdminPanel();openProject('+idx+')" style="cursor:pointer">'+
      '<td><b>'+m.handle+'</b></td>'+
      '<td>'+m.emoji+' '+m.loc.split(',')[0]+'</td>'+
      '<td style="color:var(--coral);font-weight:700">❤️ '+m.likes.toLocaleString('en-IN')+'</td>'+
      '<td>💬 '+m.comments+'</td>'+
      '<td>🔖 '+(saved.has(idx)?'Saved':'—')+'</td>'+
    '</tr>';
  }).join('');
  // Quick action buttons
  var qa=el('adminQuickActions');
  if(qa){
    qa.innerHTML='';
    [{label:'+ New Mush',fn:function(){closeAdminPanel();openCreatePost();}},{label:'Review Verif ('+pending+')',fn:function(){adminGoVerif();}},{label:'Notifications ('+unread+')',fn:function(){adminGoNotifs();}},{label:'Post Story',fn:function(){closeAdminPanel();openStoryCreate();}}].forEach(function(a){
      var btn=document.createElement('button');
      btn.className='admin-action-btn edit';
      btn.style.cssText='padding:9px 16px;font-size:13px;margin:0 6px 6px 0;border-radius:8px;';
      btn.textContent=a.label;
      btn.onclick=a.fn;
      qa.appendChild(btn);
    });
  }
}

// ─── NOTIFICATIONS ────────────────────────────────────────────


function renderAdminNotifications(){
  var list=el('adminNotifList');
  if(!list) return;
  var icons={like:'❤️',comment:'💬',save:'🔖',verify:'🔵',new:'✨',edit:'✏️',story:'📖',enquiry:'📩'};
  var bgMap={like:'#fee2e2',comment:'#dbeafe',save:'#fef9c3',verify:'#fdf0f0',new:'#d1fae5',edit:'#f3e8ff',story:'#fce7f3',enquiry:'#ffe4d6'};
  list.innerHTML='';
  // Header
  var mergedNotifs=archiveMerged('notifications',notifications);
  var hdr=document.createElement('div');
  hdr.style.cssText='display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;padding:0 2px';
  var info=document.createElement('div');
  info.style.cssText='font-size:13px;color:var(--text3)';
  info.innerHTML=mergedNotifs.length+' total &middot; <b style="color:var(--text)">'+unreadCount()+'</b> unread';
  var markBtn=document.createElement('button');
  markBtn.className='admin-action-btn edit';
  markBtn.style.cssText='padding:7px 14px';
  markBtn.textContent='Mark all read';
  markBtn.onclick=markAllNotifsRead;
  hdr.appendChild(info);
  hdr.appendChild(markBtn);
  list.appendChild(hdr);
  if(!mergedNotifs.length){
    var empty=document.createElement('div');
    empty.style.cssText='text-align:center;padding:48px 20px;color:var(--text3)';
    empty.innerHTML='<div style="font-size:40px;margin-bottom:12px">🔔</div><div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:4px">No notifications yet</div><div style="font-size:13px">User activity will appear here</div>';
    list.appendChild(empty);
    return;
  }
  mergedNotifs.forEach(function(n){
    var row=document.createElement('div');
    row.style.cssText='display:flex;align-items:flex-start;gap:12px;padding:12px 14px;border-bottom:1px solid var(--border);cursor:pointer;transition:background 0.15s;'+(n.unread?'background:var(--bg2);border-left:3px solid var(--coral);':'border-left:3px solid transparent;');
    row.onmouseenter=function(){this.style.background='var(--hover-bg)';};
    row.onmouseleave=function(){this.style.background=n.unread?'var(--bg2)':'';};
    row.onclick=function(){markNotifRead(n.id);};
    // Avatar + badge
    var avWrap=document.createElement('div');
    avWrap.style.cssText='position:relative;flex-shrink:0';
    var av=document.createElement('div');
    av.style.cssText='width:42px;height:42px;border-radius:50%;background:var(--bg2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:var(--text)';
    av.textContent=n.avatar;
    var bdg=document.createElement('div');
    bdg.style.cssText='position:absolute;bottom:-2px;right:-2px;width:18px;height:18px;border-radius:50%;background:'+(bgMap[n.type]||'#d1fae5')+';display:flex;align-items:center;justify-content:center;font-size:10px;border:2px solid var(--bg)';
    bdg.textContent=(icons[n.type]||'✨');
    avWrap.appendChild(av);avWrap.appendChild(bdg);row.appendChild(avWrap);
    // Body
    var body=document.createElement('div');
    body.style.cssText='flex:1;min-width:0';
    var txt=document.createElement('div');
    txt.style.cssText='font-size:13.5px;color:var(--text);line-height:1.5';
    txt.innerHTML=n.text;
    var tm=document.createElement('div');
    tm.style.cssText='font-size:11px;color:var(--text3);margin-top:3px';
    tm.textContent=n.time;
    body.appendChild(txt);body.appendChild(tm);row.appendChild(body);
    // Unread dot
    if(n.unread){
      var dot=document.createElement('div');
      dot.style.cssText='width:8px;height:8px;border-radius:50%;background:#0095f6;flex-shrink:0;margin-top:6px';
      row.appendChild(dot);
    }
    // Action button
    var aBtn=null;
    if(n.type==='verify'){
      aBtn=document.createElement('button');
      aBtn.className='admin-action-btn approve';
      aBtn.style.cssText='padding:5px 10px;font-size:11px;white-space:nowrap;flex-shrink:0';
      aBtn.textContent='Review \u2192';
      aBtn.onclick=function(e){e.stopPropagation();adminGoVerif();};
    } else if(n.mushIdx>=0&&n.mushIdx<mushData.length){
      aBtn=document.createElement('button');
      aBtn.className='admin-action-btn edit';
      aBtn.style.cssText='padding:5px 10px;font-size:11px;white-space:nowrap;flex-shrink:0';
      aBtn.textContent='View Post';
      var idx=n.mushIdx;
      aBtn.onclick=function(e){e.stopPropagation();closeAdminPanel();openProject(idx);};
    }
    if(aBtn) row.appendChild(aBtn);
    list.appendChild(row);
  });
}

function adminGoVerif(){
  adminTab('verification', el('adnav-verification'));
}
function adminGoNotifs(){
  adminTab('notifications', el('adnav-notifications'));
}
function markAllNotifsRead(){
  notifications.forEach(function(n){n.unread=false;});
  var archived=loadAdminArchive('notifications');
  archived.forEach(function(n){n.unread=false;});
  saveAdminArchive('notifications',archived);
  updateBadges();
  renderAdminNotifications();
  renderNotifPanel();
  toast('All notifications marked as read');
}
function markNotifRead(id){
  var n=notifications.find(function(x){return x.id===id;});
  if(n) n.unread=false;
  var archived=loadAdminArchive('notifications');
  var an=archived.find(function(x){return x.id===id;});
  if(an){ an.unread=false; saveAdminArchive('notifications',archived); }
  updateBadges();
  renderAdminNotifications();
}

// ─── VERIFICATION ────────────────────────────────────────────
function renderAdminVerification(){
  var pvl=el('pendingVerifList');
  var avl=el('approvedVerifList');
  var pending=empRequests.filter(function(r){return r.status==='pending';});
  var approved=empRequests.filter(function(r){return r.status==='approved';});
  var revoked=empRequests.filter(function(r){return r.status==='revoked';});

  // Policy notice
  var policyEl=el('verifPolicy');
  if(policyEl){
    policyEl.innerHTML='<div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:14px;margin-bottom:20px;font-size:13px;color:var(--text3);line-height:1.6">'+
      '<strong style="color:var(--text)">🔵 Blue Tick Policy:</strong> Only current SpaceMush employees approved by you get the blue tick. '+
      'Once approved, their name shows <span style="display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;background:#1d9bf0;border-radius:50%;vertical-align:middle"><svg viewBox="0 0 10 10" width="9" height="9"><polyline points="2,5 4,7 8,3" stroke="white" stroke-width="1.5" fill="none"/></svg></span> '+
      'and profession badge in coral on all their comments. Revoked members lose the tick permanently.'+
    '</div>';
  }

  // Pending
  if(!pvl) return;
  if(!pending.length){
    pvl.innerHTML='<div class="empty-state" style="padding:28px 0"><div class="empty-state-icon">✅</div><div class="empty-state-text">No pending requests</div><div class="empty-state-sub">All verification requests have been reviewed.</div></div>';
  } else {
    pvl.innerHTML=pending.map(function(r){
      return '<div class="verif-card" style="margin-bottom:10px">'+
        '<div class="verif-avatar" style="background:linear-gradient(135deg,var(--coral-pale),var(--coral-ultra));font-size:20px;font-weight:700;color:var(--coral)">'+r.avatar+'</div>'+
        '<div style="flex:1;min-width:0">'+
          '<div class="verif-name">'+r.name+
            (r.employeeType==='current'?'<span style="font-size:10px;background:#dbeafe;color:#1e40af;padding:2px 7px;border-radius:100px;margin-left:8px;font-weight:600">Current</span>':
             r.employeeType==='past'?'<span style="font-size:10px;background:#f3f4f6;color:#6b7280;padding:2px 7px;border-radius:100px;margin-left:8px;font-weight:600">Past</span>':'')+'</div>'+
          '<div class="verif-sub" style="color:var(--text3)">'+r.email+'</div>'+
          '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px">'+
            '<span class="verif-badge">'+r.profession+'</span>'+
            '<span style="font-size:11.5px;color:var(--text3);padding:3px 8px;background:var(--bg2);border-radius:100px;border:1px solid var(--border)">'+r.exp+' exp</span>'+
            (r.company?'<span style="font-size:11.5px;color:var(--text3);padding:3px 8px;background:var(--bg2);border-radius:100px;border:1px solid var(--border)">'+r.company+'</span>':'')+
          '</div>'+
          '<div style="font-size:11px;color:var(--text4);margin-top:5px">Requested '+r.time+'</div>'+
        '</div>'+
        '<div class="verif-actions" style="flex-direction:column;gap:6px">'+
          '<button class="admin-action-btn approve" style="padding:7px 14px" onclick="approveVerif('+r.id+')">✅ Approve</button>'+
          '<button class="admin-action-btn reject" style="padding:7px 14px" onclick="rejectVerif('+r.id+')">✕ Reject</button>'+
        '</div>'+
      '</div>';
    }).join('');
  }

  // Approved
  if(!avl) return;
  var approvedHtml='';
  if(!approved.length){
    approvedHtml='<div style="color:var(--text3);font-size:14px;padding:16px 0">No approved members yet.</div>';
  } else {
    approvedHtml=approved.map(function(r){
      return '<div class="verif-card" style="margin-bottom:10px">'+
        '<div class="verif-avatar" style="background:linear-gradient(135deg,#dbeafe,#bfdbfe);font-size:18px;font-weight:700;color:#1e40af">'+r.avatar+'</div>'+
        '<div style="flex:1;min-width:0">'+
          '<div class="verif-name" style="display:flex;align-items:center;gap:6px">'+r.name+
            '<span style="display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;background:#1d9bf0;border-radius:50%;flex-shrink:0">'+
              '<svg viewBox="0 0 10 10" width="10" height="10"><polyline points="2,5 4,7 8,3" stroke="white" stroke-width="1.5" fill="none"/></svg>'+
            '</span>'+
          '</div>'+
          '<div class="verif-sub">'+r.email+'</div>'+
          '<div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">'+
            '<span class="verif-approved-badge">✅ '+r.profession+'</span>'+
            (r.employeeType==='current'?'<span style="font-size:11px;color:#0f766e;background:#d1fae5;padding:2px 8px;border-radius:100px;border:1px solid #6ee7b7">Current Employee</span>':'')+
          '</div>'+
        '</div>'+
        '<div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end;flex-shrink:0">'+
          '<span style="font-size:10.5px;color:var(--text4)">'+r.time+'</span>'+
          '<button class="admin-action-btn reject" style="padding:6px 12px;font-size:12px" onclick="revokeVerif('+r.id+')">Remove Tick</button>'+
        '</div>'+
      '</div>';
    }).join('');
  }

  // Revoked
  var revokedHtml='';
  if(revoked.length){
    revokedHtml='<div style="font-size:12px;font-weight:700;color:var(--text3);margin:20px 0 12px;text-transform:uppercase;letter-spacing:1px">🚫 Revoked Members</div>';
    revokedHtml+=revoked.map(function(r){
      return '<div class="verif-card" style="opacity:0.7;margin-bottom:8px">'+
        '<div class="verif-avatar" style="background:#fee2e2;color:#991b1b;font-size:16px">'+r.avatar+'</div>'+
        '<div style="flex:1;min-width:0">'+
          '<div class="verif-name">'+r.name+'</div>'+
          '<div class="verif-sub">'+r.email+'</div>'+
          '<div style="font-size:11.5px;color:#991b1b;margin-top:4px;font-weight:600">❌ Removed — '+(r.revokeReason||'Revoked')+'</div>'+
        '</div>'+
      '</div>';
    }).join('');
  }

  avl.innerHTML=approvedHtml+revokedHtml;
  updateBadges();
}

function approveVerif(id){
  var r=empRequests.find(function(x){return x.id===id;});
  if(!r) return;
  r.status='approved';
  if(!r.employeeType) r.employeeType='current';
  // Grant blue tick to matching comments
  allComments.filter(function(c){return c.user===r.name||c.user.split(' ')[0]===r.name.split(' ')[0];})
    .forEach(function(c){c.verified=true;c.profession=r.profession;});
  addNotification({type:'verify',user:r.name,avatar:r.avatar,
    text:'✅ <b>'+r.name+'</b> approved — blue tick granted as <b>'+r.profession+'</b>',
    time:'just now',mushIdx:-1,thumb:'🔵'});
  renderAdminVerification();
  renderAdminDashboard();
  renderAdminComments();
  toast('✅ '+r.name+' now has the blue tick as '+r.profession+'!');
}

function rejectVerif(id){
  var r=empRequests.find(function(x){return x.id===id;});
  if(!r) return;
  r.status='rejected';
  addNotification({type:'verify',user:r.name,avatar:r.avatar,
    text:'✕ <b>'+r.name+"</b>'s verification request rejected",
    time:'just now',mushIdx:-1,thumb:'❌'});
  renderAdminVerification();
  renderAdminDashboard();
  toast("✕ "+r.name+"'s request rejected");
}

function revokeVerif(id){
  var r=empRequests.find(function(x){return x.id===id;});
  if(!r) return;
  var reasons=['Resigned voluntarily','Terminated / Fired','Contract ended','Other'];
  var overlay=document.createElement('div');
  overlay.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:3000;display:flex;align-items:center;justify-content:center';
  var box=document.createElement('div');
  box.style.cssText='background:var(--surface);border-radius:12px;padding:24px;max-width:380px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.4)';
  var title=document.createElement('div');
  title.style.cssText='font-size:17px;font-weight:700;color:var(--text);margin-bottom:6px';
  title.textContent='Remove Blue Tick';
  var sub=document.createElement('div');
  sub.style.cssText='font-size:13px;color:var(--text3);margin-bottom:16px';
  sub.innerHTML='Select reason for removing <b>'+r.name+"</b>'s verification:";
  box.appendChild(title);
  box.appendChild(sub);
  reasons.forEach(function(reason,i){
    var btn=document.createElement('button');
    btn.style.cssText='display:block;width:100%;text-align:left;padding:10px 14px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;font-size:13.5px;color:var(--text);cursor:pointer;margin-bottom:6px;transition:all 0.15s;font-family:inherit';
    btn.textContent=(i+1)+'. '+reason;
    btn.onmouseenter=function(){this.style.background='#fee2e2';this.style.borderColor='#fca5a5';};
    btn.onmouseleave=function(){this.style.background='var(--bg2)';this.style.borderColor='var(--border)';};
    btn.onclick=function(){overlay.remove();doRevokeVerif(id,reason);};
    box.appendChild(btn);
  });
  var cancel=document.createElement('button');
  cancel.style.cssText='display:block;width:100%;padding:10px;border-radius:8px;background:transparent;border:1px solid var(--border);color:var(--text3);cursor:pointer;font-size:13px;margin-top:4px;font-family:inherit';
  cancel.textContent='Cancel';
  cancel.onclick=function(){overlay.remove();};
  box.appendChild(cancel);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
}
function doRevokeVerif(id,reason){
  document.querySelector('[style*="position:fixed"][style*="z-index:2000"]').remove();
  var r=empRequests.find(function(x){return x.id===id;});
  if(!r) return;
  r.status='revoked';
  r.revokeReason=reason;
  allComments.filter(function(c){return c.user===r.name||c.user.split(' ')[0]===r.name.split(' ')[0];})
    .forEach(function(c){c.verified=false;c.profession='';});
  addNotification({type:'verify',user:r.name,avatar:r.avatar,
    text:'🚫 <b>'+r.name+'</b> blue tick revoked — Reason: <b>'+reason+'</b>',
    time:'just now',mushIdx:-1,thumb:'🚫'});
  renderAdminVerification();
  renderAdminDashboard();
  renderAdminComments();
  renderFeed();
  toast('Blue tick removed for '+r.name+' ('+reason+')');
}

// ─── MANAGE POSTS ─────────────────────────────────────────────
function renderAdminPosts(){
  var apg=el('adminPostsGrid');
  if(!apg) return;
  apg.innerHTML=mushData.map(function(m,i){
    return '<div class="admin-post-card">'+
      '<div class="admin-post-img" style="background:'+m.gradient+'">'+m.emoji+'</div>'+
      '<div class="admin-post-info">'+
        '<div class="admin-post-handle">'+m.handle+'</div>'+
        '<div class="admin-post-meta">❤️ '+m.likes+' · 💬 '+m.comments+' · 📐 '+m.area+'</div>'+
        '<div class="admin-post-meta" style="margin-top:3px">'+m.tag+' · '+m.loc.split(',')[0]+'</div>'+
      '</div>'+
      '<div class="admin-post-actions">'+
        '<button class="admin-action-btn edit" onclick="closeAdminPanel();openEditPost('+i+')">✏️ Edit</button>'+
        '<button class="admin-action-btn delete" onclick="adminDeleteMush('+i+')">🗑️ Delete</button>'+
      '</div>'+
    '</div>';
  }).join('');
}

function adminDeleteMush(i){
  var m=mushData[i];
  if(!confirm('Delete '+m.handle+'? This cannot be undone.')) return;
  deleteMush(i);
  renderAdminPosts();
  renderAdminDashboard();
  toast('🗑️ '+m.handle+' deleted');
}

// ─── COMMENTS ─────────────────────────────────────────────────
function renderAdminComments(){
  var act=el('adminCommentsTable');
  if(!act) return;
  var merged=archiveMerged('comments',allComments);
  if(!merged.length){
    act.innerHTML='<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--text3)">No comments yet</td></tr>';
    return;
  }
  act.innerHTML=merged.map(function(c){
    var verifiedBadge=c.verified?
      '<span style="display:inline-flex;align-items:center;gap:4px">'+
        '<span style="width:12px;height:12px;border-radius:50%;background:#1d9bf0;display:inline-flex;align-items:center;justify-content:center"><svg viewBox="0 0 10 10" width="8" height="8"><polyline points="2,5 4,7 8,3" stroke="white" stroke-width="1.5" fill="none"/></svg></span>'+
        '<span style="font-size:11px;font-weight:700;color:var(--coral)">'+c.profession+'</span>'+
      '</span>':'<span style="color:var(--text3);font-size:12px">Public</span>';
    return '<tr>'+
      '<td style="font-weight:700;color:var(--text)">'+c.user+'</td>'+
      '<td>'+verifiedBadge+'</td>'+
      '<td style="font-size:12px;color:var(--text3)">'+c.mushHandle+'</td>'+
      '<td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text)">'+c.text+'</td>'+
      '<td><button class="admin-action-btn reject" style="white-space:nowrap" onclick="removeComment('+c.id+')">Remove</button></td>'+
    '</tr>';
  }).join('');
}

function removeComment(id){
  allComments=allComments.filter(function(c){return c.id!==id;});
  archiveRemove('comments',id);
  renderAdminComments();
  toast('🗑️ Comment removed');
}

// ─── REACH US MESSAGES ──────────────────────────────────────
function renderAdminReachUs(){
  var list=el('adminReachUsList');
  if(!list) return;
  // Mark all as read once the admin opens this tab (persist to archive so the
  // unread badge doesn't resurrect after a reload)
  reachUsMessages.forEach(function(m){ m.read=true; });
  var archived=loadAdminArchive('reachus');
  archived.forEach(function(m){ m.read=true; });
  saveAdminArchive('reachus',archived);
  updateBadges();
  var merged=archiveMerged('reachus',reachUsMessages);
  if(!merged.length){
    list.innerHTML='<div class="empty-state" style="padding:28px 0"><div class="empty-state-icon">✉️</div><div class="empty-state-text">No messages yet</div><div class="empty-state-sub">Submissions from the "Send a Message" contact form will appear here.</div></div>';
    return;
  }
  list.innerHTML=merged.map(function(m){
    var contactLine=(m.email||m.phone)
      ? [(m.email||''),(m.phone||'')].filter(Boolean).join(' · ')
      : '<em style="color:var(--text4)">No contact info shared — replied to directly on WhatsApp</em>';
    return '<div class="verif-card" style="align-items:flex-start;flex-wrap:wrap">'+
      '<div class="verif-avatar" style="background:linear-gradient(135deg,var(--coral-pale),var(--coral-ultra));font-size:18px;font-weight:700;color:var(--coral);flex-shrink:0">'+(m.name?m.name[0].toUpperCase():'?')+'</div>'+
      '<div style="flex:1;min-width:220px">'+
        '<div class="verif-name">'+(m.name||'Unknown')+'</div>'+
        '<div class="verif-sub" style="color:var(--text3)">'+contactLine+'</div>'+
        '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px">'+
          (m.budget?'<span class="verif-badge">'+m.budget+'</span>':'')+
          (m.source?'<span style="font-size:11px;color:var(--text3);padding:3px 8px;background:var(--bg2);border-radius:100px;border:1px solid var(--border)">'+m.source+'</span>':'')+
        '</div>'+
        '<div style="margin-top:8px;font-size:13.5px;color:var(--text);line-height:1.6;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px 12px">'+(m.message||'<em style="color:var(--text4)">No message</em>')+'</div>'+
        '<div style="font-size:11px;color:var(--text4);margin-top:6px">Received '+m.time+'</div>'+
      '</div>'+
      '<div class="verif-actions" style="flex-direction:column;gap:6px">'+
        (m.phone?'<button class="admin-action-btn approve" style="padding:7px 14px;white-space:nowrap" onclick="window.open(\'https://wa.me/'+m.phone.replace(/[^0-9]/g,'')+'\',\'_blank\')">💬 WhatsApp</button>':'')+
        (m.email?'<button class="admin-action-btn" style="padding:7px 14px;white-space:nowrap;background:var(--bg2);color:var(--text);border:1px solid var(--border)" onclick="window.location.href=\'mailto:'+m.email+'\'">✉️ Email</button>':'')+
        '<button class="admin-action-btn reject" style="padding:7px 14px;white-space:nowrap" onclick="removeReachUsMessage('+m.id+')">Remove</button>'+
      '</div>'+
    '</div>';
  }).join('');
}
function removeReachUsMessage(id){
  reachUsMessages=reachUsMessages.filter(function(m){return m.id!==id;});
  archiveRemove('reachus',id);
  renderAdminReachUs();
  toast('🗑️ Message removed');
}

// ─── ANALYTICS ────────────────────────────────────────────────
function renderAdminAnalytics(){
  var totalLikes=mushData.reduce(function(s,m){return s+m.likes;},0);
  var totalComments=mushData.reduce(function(s,m){return s+m.comments;},0);
  var aag=el('adminAnalyticsGrid');
  if(aag) aag.innerHTML=[
    {icon:'❤️',num:totalLikes.toLocaleString('en-IN'),label:'Total Likes',ch:mushData.length+' Mush posts'},
    {icon:'🔖',num:saved.size,label:'Saves This Session',ch:'Live session count'},
    {icon:'💬',num:totalComments,label:'Total Comments',ch:allComments.length+' from real users'},
    {icon:'👤',num:(baseFollowers+signupCount).toLocaleString('en-IN'),label:'Total Followers',ch:'Grows with signups'},
    {icon:'🏗️',num:mushData.length,label:'Active Posts',ch:mushData.length+' live Mush posts'},
    {icon:'✅',num:empRequests.filter(function(r){return r.status==='approved';}).length,label:'Verified Staff',ch:'Blue tick holders'},
  ].map(function(s){
    return '<div class="admin-stat-card">'+
      '<div style="display:flex;align-items:flex-start;justify-content:space-between">'+
        '<div class="asc-num">'+s.num+'</div>'+
        '<div style="font-size:22px;opacity:0.5">'+s.icon+'</div>'+
      '</div>'+
      '<div class="asc-label">'+s.label+'</div>'+
      '<div class="asc-change up">'+s.ch+'</div>'+
    '</div>';
  }).join('');
  var act2=el('adminCityTable');
  if(act2) act2.innerHTML=[
    ['Chennai',mushData.length,mushData.reduce(function(s,m){return s+m.likes;},0),mushData.reduce(function(s,m){return s+m.comments;},0)],
  ].map(function(row){
    return '<tr>'+
      '<td style="font-weight:700;color:var(--text)">'+row[0]+'</td>'+
      '<td>'+row[1]+'</td>'+
      '<td style="color:var(--coral);font-weight:600">❤️ '+row[2].toLocaleString('en-IN')+'</td>'+
      '<td>💬 '+row[3]+'</td>'+
    '</tr>';
  }).join('');
}

// ============================================================
// PAGE NAVIGATION
// ============================================================
function showFeedPost(postId){
  var post=document.querySelector('[data-post-id="'+postId+'"]');
  if(post) post.scrollIntoView({behavior:'smooth', block:'start'});
}

function showPage(page){
  currentPage=page;
  const feed=document.getElementById('feed');
  if(feed) feed.scrollIntoView({behavior:'smooth', block:'start'});
  ['home','projects','about','contact','location'].forEach(p=>{
    const nl=document.getElementById('nav-'+p);
    const sb=document.getElementById('sb-'+p);
    if(nl) nl.classList.toggle('active',p===page);
    if(sb) sb.classList.toggle('active',p===page);
  });
}

// Keeps the sidebar/bottom-nav highlight in sync with whichever section is
// actually in view as the person scrolls through the single continuous page.
function setupSectionScrollSpy(){
  const sections=['home','projects','about','contact'];
  if(!('IntersectionObserver' in window)) return;
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const page=entry.target.id.replace('page-','');
        currentPage=page;
        sections.forEach(p=>{
          const nl=document.getElementById('nav-'+p);
          const sb=document.getElementById('sb-'+p);
          if(nl) nl.classList.toggle('active',p===page);
          if(sb) sb.classList.toggle('active',p===page);
        });
      }
    });
  }, {rootMargin:'-45% 0px -45% 0px', threshold:0});
  sections.forEach(p=>{
    const el=document.getElementById('page-'+p);
    if(el) observer.observe(el);
  });
}

// ============================================================
// CONTACT PAGE: BOOK CONSULTATION + REACH US FORM
// ============================================================
// Triggers a real browser download of the project's PDF brochure.
// Falls back to a friendly message if a brochure hasn't been uploaded for that project yet.
function downloadBrochure(i){
  var m=mushData[i];
  if(!m){return;}
  var entry=m.brochureKey&&BROCHURE_B64[m.brochureKey];
  if(!entry){
    toast('📥 Brochure coming soon for this project!');
    return;
  }
  var a=document.createElement('a');
  a.href=entry.data;
  a.download=entry.filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  toast('📥 Downloading '+m.handle+' brochure...');
}

function bookConsultationWhatsApp(){
  var prefill="Hi SpaceMush! 👋 I'd like to book a free 30-minute design consultation. Could you share your available slots? Looking forward to discussing my space with your team.";
  var url='https://wa.me/919080430134?text='+encodeURIComponent(prefill);
  window.open(url,'_blank');
}

// Always-visible top-right WhatsApp button — a fast, general-purpose way to
// start a chat from anywhere on the site.
function floatingWhatsappClick(){
  var prefill="Hi SpaceMush! 👋 I'm on your website and would love to chat about my space.";
  var url='https://wa.me/919080430134?text='+encodeURIComponent(prefill);
  window.open(url,'_blank');
}

// Records a Reach Us lead in this session's live list (used by the admin view while
// this tab is open) and archives it to localStorage so admin still sees it later,
// even after this visitor's tab/session is gone.
function addReachUsMessage(msg){
  msg.id=Date.now();
  reachUsMessages.unshift(msg);
  archiveAdd('reachus',msg);
  updateBadges();
}

// "Book Similar Design" — from inside a project modal. Opens WhatsApp with a
// professional message referencing the specific project, and logs the lead
// into the same Reach Us inbox the contact form uses.
function bookSimilarDesignWhatsApp(i){
  var m=mushData[i];
  if(!m) return;
  var visitorName=(loggedInUser&&loggedInUser.name)||'';
  if(!visitorName){
    visitorName=(window.prompt('Your name, so SpaceMush knows who\'s asking:')||'').trim();
    if(!visitorName){toast('⚠️ Please share your name to continue');return;}
  }
  var prefill="Hi SpaceMush! 👋 I'm "+visitorName+". I saw "+m.handle+" ("+m.loc+") on your page and I'd love to discuss building something similar for my own space. Could we set up a time to talk?";
  var url='https://wa.me/919080430134?text='+encodeURIComponent(prefill);
  window.open(url,'_blank');

  addReachUsMessage({
    name:visitorName,
    phone:(loggedInUser&&loggedInUser.phone)||'',
    email:(loggedInUser&&loggedInUser.email)||'',
    budget:'',
    message:'Interested in a similar design to '+m.handle+' ('+m.loc+'). Contacted via WhatsApp.',
    time:'just now',read:false,source:'Book Similar Design · '+m.handle
  });
  toast('💬 Opening WhatsApp...');
}

// "Enquire Now" — from inside a project modal. Confirms the visitor's name,
// opens WhatsApp with a project-specific message, logs the lead, and raises
// a named notification in the admin bell mentioning who is enquiring and about what.
function enquireAboutProject(i){
  var m=mushData[i];
  if(!m) return;
  var visitorName=(loggedInUser&&loggedInUser.name)||'';
  if(!visitorName){
    visitorName=(window.prompt('Your name, so SpaceMush knows who\'s asking:')||'').trim();
    if(!visitorName){toast('⚠️ Please share your name to continue');return;}
  }
  var prefill="Hi SpaceMush! 👋 I'm "+visitorName+". I'm enquiring about "+m.handle+" ("+m.loc+") — could you share more details, pricing, and timelines?";
  var url='https://wa.me/919080430134?text='+encodeURIComponent(prefill);
  window.open(url,'_blank');

  addReachUsMessage({
    name:visitorName,
    phone:(loggedInUser&&loggedInUser.phone)||'',
    email:(loggedInUser&&loggedInUser.email)||'',
    budget:'',
    message:'Enquiring about '+m.handle+' ('+m.loc+'). Contacted via WhatsApp.',
    time:'just now',read:false,source:'Enquire Now · '+m.handle
  });

  addNotification({
    type:'enquiry',user:visitorName,avatar:visitorName[0].toUpperCase(),
    text:'<b>'+visitorName+'</b> is enquiring about <b>'+m.handle+'</b>',
    time:'just now',mushIdx:i,thumb:m.emoji
  });

  toast('📩 Enquiry sent! Opening WhatsApp...');
}

function submitReachUsMessage(){
  var name=(el('rm-name')&&el('rm-name').value.trim())||'';
  var phone=(el('rm-phone')&&el('rm-phone').value.trim())||'';
  var email=(el('rm-email')&&el('rm-email').value.trim())||'';
  var budgetSel=el('rm-budget');
  var budget=(budgetSel&&budgetSel.selectedIndex>0)?budgetSel.value:'';
  var message=(el('rm-message')&&el('rm-message').value.trim())||'';

  if(!name){toast('⚠️ Please enter your name');return;}
  if(!phone&&!email){toast('⚠️ Please share a phone number or email so we can reach you');return;}
  if(!message){toast('⚠️ Please tell us a bit about your space');return;}

  addReachUsMessage({
    name:name,phone:phone,email:email,budget:budget,message:message,
    time:'just now',read:false,source:'Contact form'
  });
  notifyOwners('New Contact Form Lead — SpaceMush Website', {
    name:name, email:email, phone:phone, budget:budget, message:message
  });

  // Clear the form
  if(el('rm-name')) el('rm-name').value='';
  if(el('rm-phone')) el('rm-phone').value='';
  if(el('rm-email')) el('rm-email').value='';
  if(budgetSel) budgetSel.selectedIndex=0;
  if(el('rm-message')) el('rm-message').value='';

  toast('✅ Message sent! We\'ll reply within 2 hours.');
}

// ============================================================
// TOAST
// ============================================================
function toast(msg){
  const el=document.getElementById('toast');
  document.getElementById('toast-msg').textContent=msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>el.classList.remove('show'),3000);
}

// ============================================================
// SCROLL + REVEAL
// ============================================================
function setupScrollListener(){
  // No fixed navbar in this layout — nothing to do
}
function setupScrollReveal(){
  setTimeout(()=>{
    const obs=new IntersectionObserver(entries=>{
      entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');obs.unobserve(e.target);}});
    },{threshold:0.05,rootMargin:'0px 0px -20px 0px'});
    document.querySelectorAll('.sr').forEach(el=>{el.classList.remove('in');obs.observe(el);});
  },100);
}
function toggleMobileMenu(){toast('📱 Use the sidebar icons to navigate');}

// ============================================================
// KEYBOARD
// ============================================================
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    closeProjectModal();closeAuthModal();closeCreatePost();
    closeStoryCreate();closeStoryViewer();closeAdminLogin();
    if(notifPanelOpen){document.getElementById('notifPanel').classList.remove('open');notifPanelOpen=false;}
  }
});

// ============================================================
// BOOT
// ============================================================
init();
