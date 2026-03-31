// Products Data
const products = [
    { id:1, name:"Quantum Smartwatch", brand:"TechBit", category:"Wearables", price:199, rating:4.5, image:"https://picsum.photos/id/20/300/200", desc:"Advanced health tracking with 7-day battery.", stock:true },
    { id:2, name:"AeroPods Pro", brand:"TechBit", category:"Audio", price:129, rating:4.8, image:"https://picsum.photos/id/1/300/200", desc:"Noise cancellation, spatial audio.", stock:true },
    { id:3, name:"Infinity Display", brand:"VisionX", category:"Displays", price:399, rating:4.2, image:"https://picsum.photos/id/0/300/200", desc:"4K HDR curved monitor.", stock:true },
    { id:4, name:"ChargerX 65W", brand:"PowerCore", category:"Accessories", price:49, rating:4.6, image:"https://picsum.photos/id/26/300/200", desc:"GaN fast charger for all devices.", stock:true },
    { id:5, name:"Cyber Keyboard", brand:"TechBit", category:"Peripherals", price:89, rating:4.4, image:"https://picsum.photos/id/96/300/200", desc:"Mechanical RGB keyboard.", stock:true },
    { id:6, name:"Glide Mouse", brand:"TechBit", category:"Peripherals", price:59, rating:4.3, image:"https://picsum.photos/id/77/300/200", desc:"Ergonomic wireless mouse.", stock:false },
    { id:7, name:"VR Headset X1", brand:"VisionX", category:"Gaming", price:499, rating:4.9, image:"https://picsum.photos/id/42/300/200", desc:"Immersive VR experience.", stock:true }
];

const videos = [
    { id:1, title:"Quantum Smartwatch Review", desc:"See the future of wearable tech.", url:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", thumb:"https://picsum.photos/id/20/300/200" },
    { id:2, title:"AeroPods Pro Unboxing", desc:"Best audio experience.", url:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFunflies.mp4", thumb:"https://picsum.photos/id/1/300/200" },
    { id:3, title:"Infinity Display Review", desc:"Crisp 4K visuals.", url:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", thumb:"https://picsum.photos/id/0/300/200" }
];

let filteredProducts = [...products];
let currentPage = 1, itemsPerPage = 6;
let currentUser = JSON.parse(localStorage.getItem('techbit_user')) || null;
let videoPlayer = null;

// Helper functions
function showNotification(msg) {
    const n = document.getElementById('notification');
    document.getElementById('notifyText').innerText = msg;
    n.style.display = 'block';
    setTimeout(() => n.style.display = 'none', 3000);
}

function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'flex' : 'none';
}

function renderStars(rating) {
    let full = Math.floor(rating);
    let html = '';
    for(let i=0;i<5;i++) html += `<i class="fas ${i<full ? 'fa-star star-filled' : 'fa-star star-empty'}"></i>`;
    return html;
}

function renderProductCard(p) {
    return `<div class="product-card" data-id="${p.id}">
        <div class="product-img"><img src="${p.image}" alt="${p.name}" loading="lazy"></div>
        <div class="product-info">
            <h3>${p.name}</h3>
            <div class="product-quality">${renderStars(p.rating)} ${p.rating}</div>
            <div class="product-price">$${p.price}</div>
            <div class="product-actions">
                <button class="btn btn-primary buy-now-btn" data-id="${p.id}">Buy Now</button>
                <button class="btn btn-secondary detail-btn" data-id="${p.id}">Details</button>
            </div>
        </div>
    </div>`;
}

function renderProducts(gridId, productList, paginate=false, page=1) {
    const grid = document.getElementById(gridId);
    if(!grid) return;
    let items = productList;
    if(paginate) {
        const start = (page-1)*itemsPerPage;
        items = productList.slice(start, start+itemsPerPage);
        const totalPages = Math.ceil(productList.length/itemsPerPage);
        const paginationDiv = document.getElementById('pagination');
        if(paginationDiv) {
            paginationDiv.style.display = productList.length>itemsPerPage ? 'block' : 'none';
            document.getElementById('pageInfo').innerText = `Page ${page} of ${totalPages||1}`;
            document.getElementById('prevPage').disabled = page===1;
            document.getElementById('nextPage').disabled = page===totalPages;
        }
    }
    if(items.length===0) grid.innerHTML = '<div class="empty-message">No products found.</div>';
    else grid.innerHTML = items.map(p=>renderProductCard(p)).join('');
    attachProductEvents();
}

function attachProductEvents() {
    document.querySelectorAll('.buy-now-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            const prod = products.find(p=>p.id===id);
            if(prod) window.open(`https://wa.me/923082528844?text=I'm%20interested%20in%20${encodeURIComponent(prod.name)}%20for%20$${prod.price}`, '_blank');
        });
    });
    document.querySelectorAll('.detail-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            showProductDetail(id);
        });
    });
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if(!e.target.closest('.btn')) {
                const id = parseInt(card.dataset.id);
                showProductDetail(id);
            }
        });
    });
}

function showProductDetail(id) {
    const p = products.find(pr=>pr.id===id);
    if(!p) return;
    const modal = document.getElementById('productModal');
    document.getElementById('productDetailContent').innerHTML = `
        <img class="detail-image" src="${p.image}">
        <h2>${p.name}</h2>
        <div class="detail-rating">${renderStars(p.rating)} ${p.rating}</div>
        <p><strong>Price:</strong> $${p.price}</p>
        <p><strong>Brand:</strong> ${p.brand}</p>
        <p><strong>Category:</strong> ${p.category}</p>
        <p>${p.desc}</p>
        <p><strong>Stock:</strong> ${p.stock ? 'In Stock' : 'Out of Stock'}</p>
        <button class="btn btn-primary buy-now-detail" data-id="${p.id}">Buy Now on WhatsApp</button>
    `;
    modal.style.display = 'flex';
    document.querySelector('.buy-now-detail')?.addEventListener('click', () => {
        window.open(`https://wa.me/923082528844?text=I'm%20interested%20in%20${encodeURIComponent(p.name)}`, '_blank');
    });
}

function initFilters() {
    const brands = [...new Set(products.map(p=>p.brand))];
    const cats = [...new Set(products.map(p=>p.category))];
    const brandSel = document.getElementById('brandFilter');
    const catSel = document.getElementById('categoryFilter');
    if(brandSel) brandSel.innerHTML = '<option value="">All Brands</option>' + brands.map(b=>`<option value="${b}">${b}</option>`).join('');
    if(catSel) catSel.innerHTML = '<option value="">All Categories</option>' + cats.map(c=>`<option value="${c}">${c}</option>`).join('');
}

function applyFilters() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const brand = document.getElementById('brandFilter').value;
    const cat = document.getElementById('categoryFilter').value;
    filteredProducts = products.filter(p => (p.name.toLowerCase().includes(search) || p.brand.toLowerCase().includes(search)) && (!brand || p.brand===brand) && (!cat || p.category===cat));
    currentPage = 1;
    renderProducts('productsGrid', filteredProducts, true, currentPage);
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('brandFilter').value = '';
    document.getElementById('categoryFilter').value = '';
    filteredProducts = [...products];
    currentPage = 1;
    renderProducts('productsGrid', filteredProducts, true, currentPage);
}

// Video Player
function initVideoPlayer() {
    videoPlayer = document.getElementById('mainVideo');
    const playBtn = document.getElementById('playPauseBtn');
    const progressBar = document.getElementById('progressBar');
    const progress = document.getElementById('progress');
    const timeDisplay = document.getElementById('timeDisplay');
    const volumeSlider = document.getElementById('volumeSlider');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    
    function updateProgress() {
        if(videoPlayer.duration) {
            const percent = (videoPlayer.currentTime / videoPlayer.duration)*100;
            progress.style.width = percent+'%';
            const curM = Math.floor(videoPlayer.currentTime/60);
            const curS = Math.floor(videoPlayer.currentTime%60);
            const durM = Math.floor(videoPlayer.duration/60);
            const durS = Math.floor(videoPlayer.duration%60);
            timeDisplay.innerText = `${curM}:${curS<10?'0'+curS:curS} / ${durM}:${durS<10?'0'+durS:durS}`;
        }
    }
    videoPlayer.addEventListener('timeupdate', updateProgress);
    playBtn.addEventListener('click', () => {
        videoPlayer.paused ? videoPlayer.play() : videoPlayer.pause();
        playBtn.innerHTML = videoPlayer.paused ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';
    });
    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const pos = (e.clientX - rect.left)/rect.width;
        videoPlayer.currentTime = pos * videoPlayer.duration;
    });
    volumeSlider.addEventListener('input', () => { videoPlayer.volume = volumeSlider.value/100; });
    fullscreenBtn.addEventListener('click', () => { if(videoPlayer.requestFullscreen) videoPlayer.requestFullscreen(); });
    videoPlayer.addEventListener('ended', () => { playBtn.innerHTML = '<i class="fas fa-play"></i>'; });
}

function loadVideo(video) {
    videoPlayer.src = video.url;
    videoPlayer.load();
    videoPlayer.play().catch(e=>console.log);
    document.getElementById('playPauseBtn').innerHTML = '<i class="fas fa-pause"></i>';
    document.getElementById('videoTitle').innerText = video.title;
    document.getElementById('videoDesc').innerText = video.desc;
    document.getElementById('buyVideoBtn').onclick = () => window.open(`https://wa.me/923082528844?text=I'm%20interested%20in%20${encodeURIComponent(video.title)}`, '_blank');
}

function renderVideoList() {
    const container = document.getElementById('videoList');
    if(!container) return;
    container.innerHTML = videos.map(v => `<div class="video-item" data-id="${v.id}"><div class="video-thumbnail"><i class="fas fa-play-circle"></i></div><div class="video-item-info"><h4>${v.title}</h4><p>${v.desc.substring(0,50)}...</p></div></div>`).join('');
    document.querySelectorAll('.video-item').forEach(el => {
        el.addEventListener('click', () => {
            const id = parseInt(el.dataset.id);
            const vid = videos.find(v=>v.id===id);
            if(vid) loadVideo(vid);
        });
    });
    if(videos.length) loadVideo(videos[0]);
}

// Auth
function renderAuth() {
    const container = document.getElementById('authContainer');
    if(!container) return;
    if(currentUser) {
        container.innerHTML = `<div style="text-align:center"><i class="fas fa-user-circle fa-3x"></i><h3>Welcome ${currentUser.name}</h3><p>Email: ${currentUser.email}</p><button id="logoutBtn" class="btn btn-primary">Logout</button></div>`;
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            localStorage.removeItem('techbit_user');
            currentUser = null;
            renderAuth();
            showNotification('Logged out');
        });
    } else {
        container.innerHTML = `<form id="loginForm"><div class="form-group"><label>Name</label><input id="authName" class="form-control" required></div><div class="form-group"><label>Email</label><input id="authEmail" class="form-control" type="email" required></div><button type="submit" class="btn btn-primary">Login / Register</button></form>`;
        document.getElementById('loginForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('authName').value;
            const email = document.getElementById('authEmail').value;
            if(name && email) {
                currentUser = { name, email };
                localStorage.setItem('techbit_user', JSON.stringify(currentUser));
                renderAuth();
                showNotification(`Welcome ${name}!`);
            }
        });
    }
}

// Settings
function applySettings() {
    const theme = localStorage.getItem('theme') || 'light';
    const fontSize = localStorage.getItem('fontSize') || 'medium';
    const animSpeed = localStorage.getItem('animSpeed') || '0.3s';
    document.body.className = `theme-${theme}`;
    document.documentElement.style.setProperty('--animation-speed', animSpeed);
    const fontSizes = { small:'14px', medium:'16px', large:'18px' };
    document.body.style.fontSize = fontSizes[fontSize];
    const themeSelect = document.getElementById('themeSelect');
    const fontSizeSelect = document.getElementById('fontSizeSelect');
    const animSpeedSelect = document.getElementById('animSpeedSelect');
    if(themeSelect) themeSelect.value = theme;
    if(fontSizeSelect) fontSizeSelect.value = fontSize;
    if(animSpeedSelect) animSpeedSelect.value = animSpeed;
}

function initSettingsModal() {
    const modal = document.getElementById('settingsModal');
    const settingsBtn = document.getElementById('settingsBtn');
    const closeBtn = document.getElementById('closeSettings');
    if(settingsBtn) settingsBtn.onclick = () => modal.style.display = 'flex';
    if(closeBtn) closeBtn.onclick = () => modal.style.display = 'none';
    const themeSelect = document.getElementById('themeSelect');
    const fontSizeSelect = document.getElementById('fontSizeSelect');
    const animSpeedSelect = document.getElementById('animSpeedSelect');
    if(themeSelect) themeSelect.onchange = (e) => { localStorage.setItem('theme', e.target.value); applySettings(); };
    if(fontSizeSelect) fontSizeSelect.onchange = (e) => { localStorage.setItem('fontSize', e.target.value); applySettings(); };
    if(animSpeedSelect) animSpeedSelect.onchange = (e) => { localStorage.setItem('animSpeed', e.target.value); applySettings(); };
    window.onclick = (e) => { if(e.target === modal) modal.style.display = 'none'; };
}

// Navigation
function navigateTo(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    document.querySelectorAll('.nav-link, .mobile-nav-item').forEach(link => {
        link.classList.remove('active');
        if(link.dataset.page === pageId) link.classList.add('active');
    });
    if(pageId === 'products') renderProducts('productsGrid', filteredProducts, true, currentPage);
    if(pageId === 'home') renderProducts('homeProducts', products.slice(0,3), false);
    if(pageId === 'video') renderVideoList();
    if(pageId === 'auth') renderAuth();
}

// Contact Form (mock)
function initContactForm() {
    const form = document.getElementById('contactForm');
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('contactName').value;
            showLoading(true);
            setTimeout(() => {
                showLoading(false);
                showNotification(`Thanks ${name}, we'll reply soon!`);
                form.reset();
            }, 800);
        });
    }
}

// Share
const shareBtn = document.getElementById('shareSite');
if(shareBtn) {
    shareBtn.addEventListener('click', () => {
        if(navigator.share) navigator.share({ title: 'The Tech Bit', url: window.location.href });
        else { navigator.clipboard.writeText(window.location.href); showNotification('Link copied!'); }
    });
}

// Event Listeners on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initFilters();
    resetFilters();
    renderProducts('productsGrid', filteredProducts, true, 1);
    renderProducts('homeProducts', products.slice(0,3), false);
    initVideoPlayer();
    renderVideoList();
    initContactForm();
    renderAuth();
    initSettingsModal();
    applySettings();

    document.getElementById('applyFilters')?.addEventListener('click', applyFilters);
    document.getElementById('resetFilters')?.addEventListener('click', resetFilters);
    document.getElementById('prevPage')?.addEventListener('click', () => { if(currentPage>1) { currentPage--; renderProducts('productsGrid', filteredProducts, true, currentPage); } });
    document.getElementById('nextPage')?.addEventListener('click', () => { const total=Math.ceil(filteredProducts.length/itemsPerPage); if(currentPage<total) { currentPage++; renderProducts('productsGrid', filteredProducts, true, currentPage); } });

    document.querySelectorAll('.nav-link, .mobile-nav-item').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            if(page) navigateTo(page);
        });
    });

    document.getElementById('menuBtn')?.addEventListener('click', () => {
        document.getElementById('navLinks').classList.toggle('active');
    });

    document.getElementById('homeVideoBtn')?.addEventListener('click', () => navigateTo('video'));
    document.getElementById('homeProductsBtn')?.addEventListener('click', () => navigateTo('products'));
    document.getElementById('offerVideoBtn')?.addEventListener('click', () => navigateTo('video'));
    document.getElementById('offerProductsBtn')?.addEventListener('click', () => navigateTo('products'));

    const modal = document.getElementById('productModal');
    document.querySelector('.modal-close')?.addEventListener('click', () => modal.style.display = 'none');
    window.onclick = (e) => { if(e.target === modal) modal.style.display = 'none'; };
});

// Service Worker registration
if('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW error:', err));
}