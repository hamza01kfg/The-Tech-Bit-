// Products Data - Loaded from products.json
let products = [];
let videos = [];
let filteredProducts = [];
let currentPage = 1;
const itemsPerPage = 6;
let currentUser = JSON.parse(localStorage.getItem('techbit_user')) || null;
let videoPlayer = null;

// EmailJS Init
(function() {
    if (typeof emailjs !== 'undefined') {
        emailjs.init("q_cI26sBuHJYeJ7OG");
    }
})();

// Helper functions
function showNotification(msg, isError = false) {
    const n = document.getElementById('notification');
    const text = document.getElementById('notifyText');
    if (!n || !text) return;
    text.innerText = msg;
    n.style.background = isError ? '#dc3545' : 'var(--primary)';
    n.style.display = 'block';
    n.style.animation = 'none';
    n.offsetHeight;
    n.style.animation = 'slideUp 0.3s ease';
    clearTimeout(n._timeout);
    n._timeout = setTimeout(() => { n.style.display = 'none'; }, 4000);
}

function showLoading(show) {
    const loader = document.getElementById('loading');
    if (loader) loader.style.display = show ? 'flex' : 'none';
}

function renderStars(rating) {
    const full = Math.floor(rating);
    let html = '';
    for (let i = 0; i < 5; i++) {
        html += `<i class="fas ${i < full ? 'fa-star star-filled' : 'fa-star star-empty'}"></i>`;
    }
    return html;
}

function renderProductCard(p) {
    const badgeHTML = p.badge ? `<span class="badge">${p.badge}</span>` : '';
    return `<div class="product-card" data-id="${p.id}">
        <div class="product-img"><img src="${p.image}" alt="${p.name} - The Tech Bit" loading="lazy"></div>
        <div class="product-info">
            <h3>${p.name}${badgeHTML}</h3>
            <div class="product-quality">${renderStars(p.rating)} ${p.rating}</div>
            <div class="product-price">$${p.price.toFixed(2)}</div>
            <div class="product-actions">
                <button class="btn btn-primary buy-now-btn" data-id="${p.id}">Buy Now</button>
                <button class="btn btn-secondary detail-btn" data-id="${p.id}">Details</button>
            </div>
        </div>
    </div>`;
}

function renderProducts(gridId, productList, paginate = false, page = 1) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    let items = productList;
    const totalPages = Math.ceil(productList.length / itemsPerPage);

    if (paginate && totalPages > 1) {
        const start = (page - 1) * itemsPerPage;
        items = productList.slice(start, start + itemsPerPage);
        const paginationDiv = document.getElementById('pagination');
        if (paginationDiv) {
            paginationDiv.style.display = 'block';
            document.getElementById('prevPage').disabled = page === 1;
            document.getElementById('nextPage').disabled = page >= totalPages;
            renderPageNumbers(page, totalPages);
        }
    } else if (paginate) {
        const paginationDiv = document.getElementById('pagination');
        if (paginationDiv) paginationDiv.style.display = 'none';
    }

    const errorDiv = document.getElementById('productError');
    if (errorDiv) errorDiv.style.display = 'none';

    if (items.length === 0) {
        grid.innerHTML = '<div class="empty-message">No products found matching your criteria.</div>';
    } else {
        grid.innerHTML = items.map(p => renderProductCard(p)).join('');
    }
    attachProductEvents();
}

function renderPageNumbers(currentPage, totalPages) {
    const container = document.getElementById('pageNumbers');
    if (!container) return;
    let html = '';
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    container.innerHTML = html;
    container.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const page = parseInt(btn.dataset.page);
            goToPage(page);
        });
    });
}

function goToPage(page) {
    currentPage = page;
    renderProducts('productsGrid', filteredProducts, true, currentPage);
    document.getElementById('productsGrid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function attachProductEvents() {
    document.querySelectorAll('.buy-now-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            const prod = products.find(p => p.id === id);
            if (prod) {
                window.open(`https://wa.me/923082528844?text=I'm%20interested%20in%20${encodeURIComponent(prod.name)}%20for%20$${prod.price}`, '_blank');
            }
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
            if (!e.target.closest('.btn')) {
                const id = parseInt(card.dataset.id);
                showProductDetail(id);
            }
        });
    });
}

function showProductDetail(id) {
    const p = products.find(pr => pr.id === id);
    if (!p) return;
    const featuresList = p.features ? p.features.map(f => `<li>${f}</li>`).join('') : '';
    const modal = document.getElementById('productModal');
    document.getElementById('productDetailContent').innerHTML = `
        <img class="detail-image" src="${p.image}" alt="${p.name}">
        <h2>${p.name}</h2>
        ${p.badge ? `<span class="badge" style="font-size:0.85rem; padding:4px 12px;">${p.badge}</span>` : ''}
        <div class="detail-rating" style="margin:10px 0;">${renderStars(p.rating)} ${p.rating}</div>
        <p><strong>Price:</strong> $${p.price.toFixed(2)}</p>
        <p><strong>Brand:</strong> ${p.brand}</p>
        <p><strong>Category:</strong> ${p.category}</p>
        <p>${p.description}</p>
        ${featuresList ? `<ul style="padding-left:20px; margin:10px 0;">${featuresList}</ul>` : ''}
        <button class="btn btn-primary buy-now-detail" data-id="${p.id}" style="margin-top:12px;">Buy Now on WhatsApp</button>
    `;
    modal.style.display = 'flex';
    document.querySelector('.buy-now-detail')?.addEventListener('click', () => {
        window.open(`https://wa.me/923082528844?text=I'm%20interested%20in%20${encodeURIComponent(p.name)}`, '_blank');
    });
}

function initFilters() {
    const brands = [...new Set(products.map(p => p.brand))];
    const cats = [...new Set(products.map(p => p.category))];
    const brandSel = document.getElementById('brandFilter');
    const catSel = document.getElementById('categoryFilter');
    if (brandSel) brandSel.innerHTML = '<option value="">All Brands</option>' + brands.map(b => `<option value="${b}">${b}</option>`).join('');
    if (catSel) catSel.innerHTML = '<option value="">All Categories</option>' + cats.map(c => `<option value="${c}">${c}</option>`).join('');
}

function applyFilters() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const brand = document.getElementById('brandFilter').value;
    const cat = document.getElementById('categoryFilter').value;
    filteredProducts = products.filter(p =>
        (p.name.toLowerCase().includes(search) || p.brand.toLowerCase().includes(search) || p.category.toLowerCase().includes(search)) &&
        (!brand || p.brand === brand) &&
        (!cat || p.category === cat)
    );
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
        if (videoPlayer.duration) {
            const percent = (videoPlayer.currentTime / videoPlayer.duration) * 100;
            progress.style.width = percent + '%';
            const curM = Math.floor(videoPlayer.currentTime / 60);
            const curS = Math.floor(videoPlayer.currentTime % 60);
            const durM = Math.floor(videoPlayer.duration / 60);
            const durS = Math.floor(videoPlayer.duration % 60);
            timeDisplay.innerText = `${curM}:${String(curS).padStart(2,'0')} / ${durM}:${String(durS).padStart(2,'0')}`;
        }
    }
    videoPlayer.addEventListener('timeupdate', updateProgress);
    playBtn.addEventListener('click', () => {
        videoPlayer.paused ? videoPlayer.play() : videoPlayer.pause();
        playBtn.innerHTML = videoPlayer.paused ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';
    });
    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        videoPlayer.currentTime = pos * videoPlayer.duration;
    });
    volumeSlider.addEventListener('input', () => { videoPlayer.volume = volumeSlider.value / 100; });
    fullscreenBtn.addEventListener('click', () => {
        if (videoPlayer.requestFullscreen) videoPlayer.requestFullscreen();
        else if (videoPlayer.webkitRequestFullscreen) videoPlayer.webkitRequestFullscreen();
    });
    videoPlayer.addEventListener('ended', () => { playBtn.innerHTML = '<i class="fas fa-play"></i>'; });
}

function loadVideo(video) {
    if (!videoPlayer || !video) return;
    videoPlayer.src = video.videoUrl || video.url;
    videoPlayer.load();
    videoPlayer.play().catch(() => {});
    document.getElementById('playPauseBtn').innerHTML = '<i class="fas fa-pause"></i>';
    document.getElementById('videoTitle').innerText = video.title;
    document.getElementById('videoDesc').innerText = video.description || video.desc || '';
    document.getElementById('buyVideoBtn').onclick = () =>
        window.open(`https://wa.me/923082528844?text=I'm%20interested%20in%20${encodeURIComponent(video.title)}`, '_blank');
}

function renderVideoList() {
    const container = document.getElementById('videoList');
    if (!container) return;
    container.innerHTML = videos.map(v => {
        const thumb = v.videoThumbnail || v.thumb || '';
        return `<div class="video-item" data-id="${v.id}">
            <div class="video-thumbnail" style="background-image:url('${thumb}'); background-size:cover; background-position:center;">
                ${thumb ? '' : '<i class="fas fa-play-circle"></i>'}
            </div>
            <div class="video-item-info"><h4>${v.title}</h4><p>${(v.description || v.desc || '').substring(0, 50)}...</p></div>
        </div>`;
    }).join('');
    document.querySelectorAll('.video-item').forEach(el => {
        el.addEventListener('click', () => {
            const id = parseInt(el.dataset.id);
            const vid = videos.find(v => v.id === id);
            if (vid) loadVideo(vid);
        });
    });
    if (videos.length) loadVideo(videos[0]);
}

// Auth
function renderAuth() {
    const container = document.getElementById('authContainer');
    if (!container) return;
    if (currentUser) {
        container.innerHTML = `<div style="text-align:center"><i class="fas fa-user-circle fa-3x"></i><h3>Welcome ${currentUser.name}</h3><p>Email: ${currentUser.email}</p><button id="logoutBtn" class="btn btn-primary">Logout</button></div>`;
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            localStorage.removeItem('techbit_user');
            currentUser = null;
            renderAuth();
            showNotification('Logged out successfully');
        });
    } else {
        container.innerHTML = `<form id="loginForm"><div class="form-group"><label>Name</label><input id="authName" class="form-control" required></div><div class="form-group"><label>Email</label><input id="authEmail" class="form-control" type="email" required></div><button type="submit" class="btn btn-primary">Login / Register</button></form>`;
        document.getElementById('loginForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('authName').value.trim();
            const email = document.getElementById('authEmail').value.trim();
            if (name && email) {
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
    const fontSizes = { small: '14px', medium: '16px', large: '18px' };
    const headingScales = { small: '0.85', medium: '1', large: '1.15' };
    document.body.style.fontSize = fontSizes[fontSize];
    document.documentElement.style.setProperty('--heading-scale', headingScales[fontSize]);

    ['themeSelect', 'fontSizeSelect', 'animSpeedSelect'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (id === 'themeSelect') el.value = theme;
            if (id === 'fontSizeSelect') el.value = fontSize;
            if (id === 'animSpeedSelect') el.value = animSpeed;
        }
    });
}

function initSettingsModal() {
    const modal = document.getElementById('settingsModal');
    const settingsBtn = document.getElementById('settingsBtn');
    const closeBtn = document.getElementById('closeSettings');
    if (settingsBtn) settingsBtn.onclick = () => (modal.style.display = 'flex');
    if (closeBtn) closeBtn.onclick = () => (modal.style.display = 'none');
    document.getElementById('themeSelect').onchange = (e) => { localStorage.setItem('theme', e.target.value); applySettings(); };
    document.getElementById('fontSizeSelect').onchange = (e) => { localStorage.setItem('fontSize', e.target.value); applySettings(); };
    document.getElementById('animSpeedSelect').onchange = (e) => { localStorage.setItem('animSpeed', e.target.value); applySettings(); };
    window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
}

// Navigation
function navigateTo(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(pageId);
    if (target) target.classList.add('active');
    document.querySelectorAll('.nav-link, .mobile-nav-item, .footer-links a').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageId) link.classList.add('active');
    });
    if (pageId === 'products') renderProducts('productsGrid', filteredProducts, true, currentPage);
    if (pageId === 'home') {
        const featured = products.slice(0, 3);
        renderProducts('homeProducts', featured, false);
    }
    if (pageId === 'video') renderVideoList();
    if (pageId === 'auth') renderAuth();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Contact Form with EmailJS
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('contactName').value.trim();
        const email = document.getElementById('contactEmail').value.trim();
        const phone = document.getElementById('contactPhone').value.trim();
        const subject = document.getElementById('contactSubject').value.trim();
        const message = document.getElementById('contactMessage').value.trim();
        if (!name || !email || !subject || !message) {
            showNotification('Please fill all required fields.', true);
            return;
        }
        showLoading(true);
        const btn = document.getElementById('contactSubmitBtn');
        if (btn) btn.disabled = true;

        try {
            if (typeof emailjs !== 'undefined') {
                await emailjs.send("service_n2r2our", "template_rqvrxoh", {
                    from_name: name,
                    from_email: email,
                    phone: phone,
                    subject: subject,
                    message: message,
                    to_name: "The Tech Bit Team"
                });
            } else {
                // Fallback: simulate delay
                await new Promise(resolve => setTimeout(resolve, 800));
            }
            showNotification(`Thanks ${name}, we'll reply soon!`);
            form.reset();
        } catch (error) {
            console.error('Contact form error:', error);
            showNotification('Failed to send message. Please try WhatsApp instead.', true);
        } finally {
            showLoading(false);
            if (btn) btn.disabled = false;
        }
    });
}

// Share
const shareBtn = document.getElementById('shareSite');
if (shareBtn) {
    shareBtn.addEventListener('click', () => {
        if (navigator.share) {
            navigator.share({ title: 'The Tech Bit', text: 'Discover innovative tech products!', url: window.location.href });
        } else {
            navigator.clipboard.writeText(window.location.href).then(() => showNotification('Link copied!'));
        }
    });
}

// Load Data
async function loadData() {
    showLoading(true);
    try {
        const response = await fetch('products.json');
        if (!response.ok) throw new Error('Network error');
        const data = await response.json();
        products = data.products || [];

        // Build videos from products that have videoUrl
        videos = products.filter(p => p.videoUrl).map(p => ({
            id: p.id,
            title: p.name,
            description: p.description,
            videoUrl: p.videoUrl,
            videoThumbnail: p.videoThumbnail || p.image,
            thumb: p.image
        }));

        if (videos.length === 0) {
            // Fallback videos
            videos = [
                { id: 101, title: "Product Showcase", description: "See our latest products in action.", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", thumb: products[0]?.image || "" },
                { id: 102, title: "Unboxing", description: "Unboxing experience.", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFunflies.mp4", thumb: products[1]?.image || "" }
            ];
        }
    } catch (err) {
        console.error('Failed to load products:', err);
        document.getElementById('productError').style.display = 'block';
        document.getElementById('productError').innerHTML = '⚠️ Failed to load products. Please check your internet connection and <a href="#" onclick="location.reload()">refresh</a> the page.';
        // Fallback products
        products = [
            { id:1, name:"Quantum Smartwatch", brand:"TechBit", category:"Wearables", price:199, rating:4.5, image:"https://picsum.photos/id/20/300/200", description:"Advanced health tracking.", badge:"Popular" },
            { id:2, name:"AeroPods Pro", brand:"TechBit", category:"Audio", price:129, rating:4.8, image:"https://picsum.photos/id/1/300/200", description:"Noise cancellation.", badge:"New" },
            { id:3, name:"Infinity Display", brand:"VisionX", category:"Displays", price:399, rating:4.2, image:"https://picsum.photos/id/0/300/200", description:"4K HDR monitor.", badge:"" }
        ];
    }
    showLoading(false);
    filteredProducts = [...products];
    initFilters();
    renderProducts('productsGrid', filteredProducts, true, 1);
    renderProducts('homeProducts', products.slice(0, 3), false);
    renderVideoList();
}

// Event Listeners on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initVideoPlayer();
    renderVideoList();
    initContactForm();
    renderAuth();
    initSettingsModal();
    applySettings();

    loadData().then(() => {
        document.getElementById('applyFilters')?.addEventListener('click', applyFilters);
        document.getElementById('resetFilters')?.addEventListener('click', resetFilters);
        document.getElementById('prevPage')?.addEventListener('click', () => {
            if (currentPage > 1) goToPage(currentPage - 1);
        });
        document.getElementById('nextPage')?.addEventListener('click', () => {
            const total = Math.ceil(filteredProducts.length / itemsPerPage);
            if (currentPage < total) goToPage(currentPage + 1);
        });
    });

    document.querySelectorAll('.nav-link, .mobile-nav-item, .footer-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            if (page) navigateTo(page);
            // Close mobile menu if open
            document.getElementById('navLinks')?.classList.remove('active');
        });
    });

    document.getElementById('menuBtn')?.addEventListener('click', () => {
        document.getElementById('navLinks')?.classList.toggle('active');
    });

    document.getElementById('homeVideoBtn')?.addEventListener('click', () => navigateTo('video'));
    document.getElementById('homeProductsBtn')?.addEventListener('click', () => navigateTo('products'));
    document.getElementById('offerVideoBtn')?.addEventListener('click', () => navigateTo('video'));
    document.getElementById('offerProductsBtn')?.addEventListener('click', () => navigateTo('products'));

    const modal = document.getElementById('productModal');
    document.querySelector('.modal-close')?.addEventListener('click', () => { modal.style.display = 'none'; });
    window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
});

// Service Worker registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(reg => {
            console.log('Service Worker registered:', reg.scope);
        }).catch(err => {
            console.log('Service Worker registration failed:', err);
        });
    });
}