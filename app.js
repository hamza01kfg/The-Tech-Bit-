let products = [], videos = [], filteredProducts = [], currentPage = 1;
const itemsPerPage = 6;
let currentUser = JSON.parse(localStorage.getItem('techbit_user')) || null;
let videoPlayer = null;

emailjs.init("q_cI26sBuHJYeJ7OG");

function showNotification(msg, isError=false) {
    const n=document.getElementById('notification'), t=document.getElementById('notifyText');
    if(!n||!t) return;
    t.innerText=msg;
    n.style.background=isError?'#dc3545':'var(--primary)';
    n.style.display='block';
    setTimeout(()=>n.style.display='none',4000);
}

function showLoading(show) {
    const loader=document.getElementById('loading');
    if(loader) loader.style.display=show?'flex':'none';
}

function renderStars(rating){
    let html='';
    for(let i=0;i<5;i++) html+=`<i class="fas ${i<Math.floor(rating)?'fa-star star-filled':'fa-star star-empty'}"></i>`;
    return html;
}

function renderProductCard(p){
    return `<div class="product-card" data-id="${p.id}">
        <div class="product-img"><img src="${p.image}" alt="${p.name}" loading="lazy"></div>
        <div class="product-info">
            <h3>${p.name}${p.badge?`<span class="badge">${p.badge}</span>`:''}</h3>
            <div class="product-quality">${renderStars(p.rating)} ${p.rating}</div>
            <div class="product-price">$${p.price.toFixed(2)}</div>
            <div class="product-actions">
                <button class="btn btn-primary buy-now-btn" data-id="${p.id}">Buy Now</button>
                <button class="btn btn-secondary detail-btn" data-id="${p.id}">Details</button>
            </div>
        </div>
    </div>`;
}

function renderProducts(gridId, list, paginate=false, page=1){
    const grid=document.getElementById(gridId);
    if(!grid) return;
    let items=list;
    const totalPages=Math.ceil(list.length/itemsPerPage);
    if(paginate && totalPages>1){
        const start=(page-1)*itemsPerPage;
        items=list.slice(start,start+itemsPerPage);
        const pagDiv=document.getElementById('pagination');
        if(pagDiv){
            pagDiv.style.display='block';
            document.getElementById('prevPage').disabled=page===1;
            document.getElementById('nextPage').disabled=page>=totalPages;
            renderPageNumbers(page,totalPages);
        }
    } else if(paginate){
        const pagDiv=document.getElementById('pagination');
        if(pagDiv) pagDiv.style.display='none';
    }
    if(items.length===0) grid.innerHTML='<div class="empty-message">No products found.</div>';
    else grid.innerHTML=items.map(p=>renderProductCard(p)).join('');
    attachProductEvents();
}

function renderPageNumbers(cur,total){
    const c=document.getElementById('pageNumbers');
    if(!c) return;
    let html='';
    for(let i=1;i<=total;i++) html+=`<button class="page-btn ${i===cur?'active':''}" data-page="${i}">${i}</button>`;
    c.innerHTML=html;
    c.querySelectorAll('.page-btn').forEach(btn=>btn.addEventListener('click',()=>goToPage(parseInt(btn.dataset.page))));
}

function goToPage(page){ currentPage=page; renderProducts('productsGrid',filteredProducts,true,currentPage); document.getElementById('productsGrid')?.scrollIntoView({behavior:'smooth'}); }

function attachProductEvents(){
    document.querySelectorAll('.buy-now-btn').forEach(btn=>btn.addEventListener('click',(e)=>{ e.stopPropagation(); const prod=products.find(p=>p.id===parseInt(btn.dataset.id)); if(prod) shareProduct(prod); }));
    document.querySelectorAll('.detail-btn').forEach(btn=>btn.addEventListener('click',(e)=>{ e.stopPropagation(); showProductDetail(parseInt(btn.dataset.id)); }));
    document.querySelectorAll('.product-card').forEach(card=>card.addEventListener('click',(e)=>{ if(!e.target.closest('.btn')) showProductDetail(parseInt(card.dataset.id)); }));
}

function showProductDetail(id){
    const p=products.find(pr=>pr.id===id);
    if(!p) return;
    const modal=document.getElementById('productModal');
    document.getElementById('productDetailContent').innerHTML=`
        <img class="detail-image" src="${p.image}"><h2>${p.name}</h2>${p.badge?`<span class="badge">${p.badge}</span>`:''}
        <div>${renderStars(p.rating)} ${p.rating}</div><p><strong>Price:</strong> $${p.price.toFixed(2)}</p>
        <p><strong>Brand:</strong> ${p.brand}</p><p><strong>Category:</strong> ${p.category}</p><p>${p.description}</p>
        ${p.features?`<ul>${p.features.map(f=>`<li>${f}</li>`).join('')}</ul>`:''}
        <button class="btn btn-primary buy-now-detail" data-id="${p.id}">Buy Now on WhatsApp</button>`;
    modal.style.display='flex';
    document.querySelector('.buy-now-detail')?.addEventListener('click',()=>shareProduct(p));
}

async function shareProduct(product){
    const text=`🔥 ${product.name}\n💰 Price: $${product.price.toFixed(2)}\n📝 ${product.description}\n🛒 Buy now at The Tech Bit!`;
    window.location.href=`https://api.whatsapp.com/send?phone=923082528844&text=${encodeURIComponent(text)}`;
}

function initFilters(){
    const brands=[...new Set(products.map(p=>p.brand))], cats=[...new Set(products.map(p=>p.category))];
    const brandSel=document.getElementById('brandFilter'), catSel=document.getElementById('categoryFilter');
    if(brandSel) brandSel.innerHTML='<option value="">All Brands</option>'+brands.map(b=>`<option value="${b}">${b}</option>`).join('');
    if(catSel) catSel.innerHTML='<option value="">All Categories</option>'+cats.map(c=>`<option value="${c}">${c}</option>`).join('');
}
function applyFilters(){
    const search=document.getElementById('searchInput').value.toLowerCase(), brand=document.getElementById('brandFilter').value, cat=document.getElementById('categoryFilter').value;
    filteredProducts=products.filter(p=>(p.name.toLowerCase().includes(search)||p.brand.toLowerCase().includes(search)||p.category.toLowerCase().includes(search)) && (!brand||p.brand===brand) && (!cat||p.category===cat));
    currentPage=1; renderProducts('productsGrid',filteredProducts,true,currentPage);
}
function resetFilters(){
    document.getElementById('searchInput').value=''; document.getElementById('brandFilter').value=''; document.getElementById('categoryFilter').value='';
    filteredProducts=[...products]; currentPage=1; renderProducts('productsGrid',filteredProducts,true,currentPage);
}

function initVideoPlayer(){
    videoPlayer=document.getElementById('mainVideo');
    const playBtn=document.getElementById('playPauseBtn'), progressBar=document.getElementById('progressBar'), progress=document.getElementById('progress'), timeDisplay=document.getElementById('timeDisplay'), volumeSlider=document.getElementById('volumeSlider'), fullscreenBtn=document.getElementById('fullscreenBtn');
    videoPlayer.addEventListener('timeupdate',()=>{
        if(videoPlayer.duration){
            progress.style.width=(videoPlayer.currentTime/videoPlayer.duration)*100+'%';
            const curM=Math.floor(videoPlayer.currentTime/60), curS=videoPlayer.currentTime%60, durM=Math.floor(videoPlayer.duration/60), durS=videoPlayer.duration%60;
            timeDisplay.innerText=`${curM}:${String(curS).padStart(2,'0')} / ${durM}:${String(durS).padStart(2,'0')}`;
        }
    });
    playBtn.onclick=()=>{ videoPlayer.paused?videoPlayer.play():videoPlayer.pause(); playBtn.innerHTML=videoPlayer.paused?'<i class="fas fa-play"></i>':'<i class="fas fa-pause"></i>'; };
    progressBar.onclick=(e)=>{ const rect=progressBar.getBoundingClientRect(); videoPlayer.currentTime=((e.clientX-rect.left)/rect.width)*videoPlayer.duration; };
    volumeSlider.oninput=()=>videoPlayer.volume=volumeSlider.value/100;
    fullscreenBtn.onclick=()=>videoPlayer.requestFullscreen?.()||videoPlayer.webkitRequestFullscreen?.();
    videoPlayer.onended=()=>playBtn.innerHTML='<i class="fas fa-play"></i>';
}
function loadVideo(v){
    if(!videoPlayer||!v) return;
    videoPlayer.src=v.videoUrl||v.url; videoPlayer.load(); videoPlayer.play().catch(()=>{});
    document.getElementById('playPauseBtn').innerHTML='<i class="fas fa-pause"></i>';
    document.getElementById('videoTitle').innerText=v.title;
    document.getElementById('videoDesc').innerText=v.description||v.desc||'';
    document.getElementById('buyVideoBtn').onclick=()=>window.location.href=`https://api.whatsapp.com/send?phone=923082528844&text=${encodeURIComponent(`I'm interested in ${v.title}`)}`;
}
function renderVideoList(){
    const container=document.getElementById('videoList');
    if(!container) return;
    container.innerHTML=videos.map(v=>`<div class="video-item" data-id="${v.id}"><div class="video-thumbnail" style="background-image:url('${v.videoThumbnail||v.thumb||''}');background-size:cover;"><i class="fas fa-play-circle"></i></div><div class="video-item-info"><h4>${v.title}</h4><p>${(v.description||'').substring(0,50)}...</p></div></div>`).join('');
    document.querySelectorAll('.video-item').forEach(el=>el.addEventListener('click',()=>{ const vid=videos.find(v=>v.id===parseInt(el.dataset.id)); if(vid) loadVideo(vid); }));
    if(videos.length) loadVideo(videos[0]);
}

function renderAuth(){
    const c=document.getElementById('authContainer');
    if(!c) return;
    if(currentUser){
        c.innerHTML=`<div><i class="fas fa-user-circle fa-3x"></i><h3>Welcome ${currentUser.name}</h3><p>Email: ${currentUser.email}</p><button id="logoutBtn" class="btn btn-primary">Logout</button></div>`;
        document.getElementById('logoutBtn')?.addEventListener('click',()=>{ localStorage.removeItem('techbit_user'); currentUser=null; renderAuth(); showNotification('Logged out'); });
    } else {
        c.innerHTML=`<form id="loginForm"><div class="form-group"><label>Name</label><input id="authName" required></div><div class="form-group"><label>Email</label><input id="authEmail" type="email" required></div><button type="submit" class="btn btn-primary">Login / Register</button></form>`;
        document.getElementById('loginForm')?.addEventListener('submit',(e)=>{ e.preventDefault(); const name=document.getElementById('authName').value.trim(), email=document.getElementById('authEmail').value.trim(); if(name&&email){ currentUser={name,email}; localStorage.setItem('techbit_user',JSON.stringify(currentUser)); renderAuth(); showNotification(`Welcome ${name}!`); } });
    }
}

function applySettings(){
    const theme=localStorage.getItem('theme')||'light', fontSize=localStorage.getItem('fontSize')||'medium', animSpeed=localStorage.getItem('animSpeed')||'0.3s';
    document.body.className=`theme-${theme}`;
    document.documentElement.style.setProperty('--animation-speed',animSpeed);
    document.body.style.fontSize={small:'14px',medium:'16px',large:'18px'}[fontSize];
    document.documentElement.style.setProperty('--heading-scale',{small:'0.85',medium:'1',large:'1.15'}[fontSize]);
    ['themeSelect','fontSizeSelect','animSpeedSelect'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=localStorage.getItem(id.replace('Select',''))||(id==='themeSelect'?theme:(id==='fontSizeSelect'?fontSize:animSpeed)); });
}
function initSettingsModal(){
    const modal=document.getElementById('settingsModal'), settingsBtn=document.getElementById('settingsBtn'), close=document.getElementById('closeSettings');
    if(settingsBtn) settingsBtn.onclick=()=>modal.style.display='flex';
    if(close) close.onclick=()=>modal.style.display='none';
    document.getElementById('themeSelect').onchange=e=>{ localStorage.setItem('theme',e.target.value); applySettings(); };
    document.getElementById('fontSizeSelect').onchange=e=>{ localStorage.setItem('fontSize',e.target.value); applySettings(); };
    document.getElementById('animSpeedSelect').onchange=e=>{ localStorage.setItem('animSpeed',e.target.value); applySettings(); };
    window.onclick=e=>{ if(e.target===modal) modal.style.display='none'; };
}

function navigateTo(pageId){
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    document.querySelectorAll('.nav-link, .mobile-nav-item, .footer-links a').forEach(link=>{ link.classList.remove('active'); if(link.dataset.page===pageId) link.classList.add('active'); });
    if(pageId==='products') renderProducts('productsGrid',filteredProducts,true,currentPage);
    if(pageId==='home') renderProducts('homeProducts',products.slice(0,3),false);
    if(pageId==='video') renderVideoList();
    if(pageId==='auth') renderAuth();
    window.scrollTo({top:0,behavior:'smooth'});
}

function initContactForm(){
    const form=document.getElementById('contactForm'), submitBtn=document.getElementById('contactSubmitBtn'), cancelBtn=document.getElementById('cancelContactBtn');
    if(!form) return;
    let isSending=false, isCancelled=false;
    cancelBtn?.addEventListener('click',()=>{ if(isSending){ isCancelled=true; showNotification('Cancelled'); submitBtn.innerHTML='<i class="fas fa-paper-plane"></i> Send Message'; submitBtn.disabled=false; cancelBtn.style.display='none'; isSending=false; } });
    form.addEventListener('submit',async(e)=>{
        e.preventDefault(); if(isSending) return;
        const name=document.getElementById('contactName').value.trim(), email=document.getElementById('contactEmail').value.trim(), phone=document.getElementById('contactPhone').value.trim(), subject=document.getElementById('contactSubject').value.trim(), message=document.getElementById('contactMessage').value.trim();
        if(!name||!email||!subject||!message){ showNotification('Please fill all required fields.',true); return; }
        isSending=true; isCancelled=false; const original=submitBtn.innerHTML;
        submitBtn.innerHTML='<i class="fas fa-spinner fa-spin"></i> Sending...'; submitBtn.disabled=true; if(cancelBtn) cancelBtn.style.display='inline-block';
        try{
            if(typeof emailjs!=='undefined') await emailjs.send('service_n2r2our','template_rqvrxoh',{from_name:name,from_email:email,phone,subject,message,to_name:'The Tech Bit Team'});
            else await new Promise(r=>setTimeout(r,800));
            if(!isCancelled){ showNotification(`Thanks ${name}, we'll reply soon!`); form.reset(); }
            else showNotification('Cancelled',true);
        } catch(err){ if(!isCancelled){ console.error(err); showNotification('Failed. Try WhatsApp.',true); } }
        finally{ if(!isCancelled){ submitBtn.innerHTML=original; submitBtn.disabled=false; if(cancelBtn) cancelBtn.style.display='none'; } isSending=false; isCancelled=false; }
    });
}

document.getElementById('shareSite')?.addEventListener('click',()=>{ if(navigator.share) navigator.share({title:'The Tech Bit',text:'Discover innovative tech products!',url:window.location.href}); else navigator.clipboard.writeText(window.location.href).then(()=>showNotification('Link copied!')); });

async function loadData(){
    showLoading(true);
    try{
        let productsFromFirestore=[];
        if(typeof firebase!=='undefined' && firebase.firestore){
            const db=firebase.firestore();
            const snapshot=await db.collection('products').get();
            if(!snapshot.empty){
                snapshot.forEach(doc=>{
                    const d=doc.data();
                    productsFromFirestore.push({
                        id:d.id||parseInt(doc.id), name:d.name, brand:d.brand, category:d.category,
                        price:d.price, description:d.description, badge:d.badge||'', image:d.image,
                        videoUrl:d.videoUrl||'', videoThumbnail:d.videoThumbnail||d.image,
                        features:d.features||[], rating:d.rating||4.0
                    });
                });
            }
        }
        if(productsFromFirestore.length>0) products=productsFromFirestore;
        else{
            const res=await fetch('products.json');
            if(!res.ok) throw new Error();
            const data=await res.json();
            products=data.products||[];
        }
        videos=products.filter(p=>p.videoUrl&&p.videoUrl.trim()!=='').map(p=>({id:p.id,title:p.name,description:p.description,videoUrl:p.videoUrl,videoThumbnail:p.videoThumbnail||p.image,thumb:p.image}));
        if(videos.length===0) videos=[{id:101,title:'Product Showcase',description:'See our latest products.',videoUrl:'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',thumb:products[0]?.image||''}];
    } catch(err){
        console.error(err);
        try{
            const res=await fetch('products.json');
            const data=await res.json();
            products=data.products||[];
        } catch(e){
            products=[
                {id:1,name:'Quantum Smartwatch',brand:'TechBit',category:'Wearables',price:199,rating:4.5,image:'https://picsum.photos/id/20/300/200',description:'Advanced health tracking.',badge:'Popular'},
                {id:2,name:'AeroPods Pro',brand:'TechBit',category:'Audio',price:129,rating:4.8,image:'https://picsum.photos/id/1/300/200',description:'Noise cancellation.',badge:'New'}
            ];
        }
    }
    showLoading(false);
    filteredProducts=[...products];
    initFilters();
    renderProducts('productsGrid',filteredProducts,true,1);
    renderProducts('homeProducts',products.slice(0,3),false);
    renderVideoList();
}

document.addEventListener('DOMContentLoaded',()=>{
    initVideoPlayer(); renderVideoList(); initContactForm(); renderAuth(); initSettingsModal(); applySettings();
    loadData().then(()=>{
        document.getElementById('applyFilters')?.addEventListener('click',applyFilters);
        document.getElementById('resetFilters')?.addEventListener('click',resetFilters);
        document.getElementById('prevPage')?.addEventListener('click',()=>{ if(currentPage>1) goToPage(currentPage-1); });
        document.getElementById('nextPage')?.addEventListener('click',()=>{ const total=Math.ceil(filteredProducts.length/itemsPerPage); if(currentPage<total) goToPage(currentPage+1); });
    });
    document.querySelectorAll('.nav-link, .mobile-nav-item, .footer-links a').forEach(link=>link.addEventListener('click',(e)=>{ e.preventDefault(); const page=link.dataset.page; if(page) navigateTo(page); document.getElementById('navLinks')?.classList.remove('active'); }));
    document.getElementById('menuBtn')?.addEventListener('click',()=>document.getElementById('navLinks')?.classList.toggle('active'));
    document.getElementById('homeVideoBtn')?.addEventListener('click',()=>navigateTo('video'));
    document.getElementById('homeProductsBtn')?.addEventListener('click',()=>navigateTo('products'));
    document.getElementById('offerVideoBtn')?.addEventListener('click',()=>navigateTo('video'));
    document.getElementById('offerProductsBtn')?.addEventListener('click',()=>navigateTo('products'));
    const modal=document.getElementById('productModal');
    document.querySelector('.modal-close')?.addEventListener('click',()=>modal.style.display='none');
    window.addEventListener('click',(e)=>{ if(e.target===modal) modal.style.display='none'; });
});
if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('/The-Tech-Bit-/sw.js').catch(e=>console.log(e)));
if(window.matchMedia('(display-mode: standalone)').matches) document.querySelector('footer')?.remove();
const overlay=document.getElementById('logoOverlay');
if(overlay) setTimeout(()=>{ overlay.classList.add('hide-overlay'); overlay.addEventListener('transitionend',()=>overlay.remove()); },2500);