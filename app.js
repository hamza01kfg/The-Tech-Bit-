// The Tech Bit - Main App with Full Settings

let currentUser = null;
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const perPage = 9;
let brands = new Set();
let categories = new Set();
let videosList = [];
let currentLanguage = 'en';
let searchTimeout = null;

// Offer Configuration
const offerConfig = {
    active: true,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    percentage: 30,
    description: "Special year-end discount on all products"
};

// Translations
const translations = {
    en: {
        brand: "The Tech Bit", home: "Home", products: "Products", offer: "Offer", video: "Video",
        contact: "Contact", account: "Account", settings: "Settings", appearance: "Appearance",
        display: "Display", language: "Language", advanced: "Advanced", theme: "Theme",
        default: "Default", light: "Light", dark: "Dark", nature: "Nature", ocean: "Ocean",
        font_family: "Font Family", font_size: "Font Size", border_radius: "Border Radius",
        brightness: "Brightness", contrast: "Contrast", saturation: "Saturation",
        animation_speed: "Animation Speed", english: "English", urdu: "Urdu", roman_urdu: "Roman Urdu",
        reset_all: "Reset All Settings", save: "Save", cancel: "Cancel"
    },
    ur: {
        brand: "دی ٹیک بٹ", home: "ہوم", products: "مصنوعات", offer: "آفر", video: "ویڈیو",
        contact: "رابطہ", account: "اکاؤنٹ", settings: "ترتیبات", appearance: "ظہور",
        display: "ڈسپلے", language: "زبان", advanced: "اعلی", theme: "تھیم",
        default: "طے شدہ", light: "ہلکا", dark: "گہرا", nature: "فطرت", ocean: "سمندر",
        font_family: "فونٹ", font_size: "سائز", border_radius: "بارڈر",
        brightness: "چمک", contrast: "کنٹراسٹ", saturation: "سیریشن",
        animation_speed: "اینی میشن", english: "انگریزی", urdu: "اردو", roman_urdu: "رومن اردو",
        reset_all: "ری سیٹ", save: "محفوظ کریں", cancel: "منسوخ"
    },
    roman: {
        brand: "The Tech Bit", home: "Home", products: "Products", offer: "Offer", video: "Video",
        contact: "Contact", account: "Account", settings: "Settings", appearance: "Appearance",
        display: "Display", language: "Language", advanced: "Advanced", theme: "Theme",
        default: "Default", light: "Light", dark: "Dark", nature: "Nature", ocean: "Ocean",
        font_family: "Font Family", font_size: "Font Size", border_radius: "Border Radius",
        brightness: "Brightness", contrast: "Contrast", saturation: "Saturation",
        animation_speed: "Animation Speed", english: "English", urdu: "Urdu", roman_urdu: "Roman Urdu",
        reset_all: "Reset All Settings", save: "Save", cancel: "Cancel"
    }
};

// DOM Elements
const loading = document.getElementById('loading');
const notification = document.getElementById('notification');
const notifyText = document.getElementById('notifyText');

// Helper functions
function showLoading(show) {
    loading.style.display = show ? 'flex' : 'none';
}

function showMessage(msg, isError = false) {
    notifyText.innerText = msg;
    notification.style.backgroundColor = isError ? '#dc3545' : '#6a11cb';
    notification.style.display = 'block';
    setTimeout(() => notification.style.display = 'none', 3000);
}

// ========== SETTINGS SYSTEM ==========
function applyTheme(theme) {
    document.body.className = '';
    if (theme !== 'default') document.body.classList.add(`theme-${theme}`);
    localStorage.setItem('theme', theme);
    document.querySelectorAll('.theme-option').forEach(opt => {
        if (opt.dataset.theme === theme) opt.classList.add('active');
        else opt.classList.remove('active');
    });
}

function applyLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) el.innerText = translations[lang][key];
    });
    document.querySelectorAll('.language-option').forEach(opt => {
        if (opt.dataset.lang === lang) opt.classList.add('active');
        else opt.classList.remove('active');
    });
}

function applyFontFamily(font) {
    let fontFamily = '';
    switch(font) {
        case 'serif': fontFamily = 'Georgia, serif'; break;
        case 'monospace': fontFamily = 'Courier New, monospace'; break;
        case 'jameel': fontFamily = 'Jameel Noori Nastaleeq, "Noto Nastaliq Urdu", serif'; break;
        default: fontFamily = '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif';
    }
    document.documentElement.style.setProperty('--font', fontFamily);
    localStorage.setItem('fontFamily', font);
    document.querySelectorAll('.font-option').forEach(opt => {
        if (opt.dataset.font === font) opt.classList.add('active');
        else opt.classList.remove('active');
    });
}

function updateDisplayFilters() {
    const brightness = localStorage.getItem('brightness') || '100';
    const contrast = localStorage.getItem('contrast') || '100';
    const saturation = localStorage.getItem('saturation') || '100';
    document.body.style.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
}

function applySlider(id, property, unit = 'px') {
    const slider = document.getElementById(id);
    const valueSpan = document.getElementById(id + 'Value');
    if (!slider) return;
    const val = slider.value;
    if (valueSpan) valueSpan.innerText = val + unit;
    if (property === '--font-size') {
        document.documentElement.style.setProperty(property, val + unit);
        localStorage.setItem('font-size', val);
    } else if (property === '--radius') {
        document.documentElement.style.setProperty('--radius', val + unit);
        localStorage.setItem('border-radius', val);
    } else if (property === '--animation-speed') {
        document.documentElement.style.setProperty('--animation-speed', val + 's');
        localStorage.setItem('animation-speed', val);
    } else {
        localStorage.setItem(property.replace('--', ''), val);
        updateDisplayFilters();
    }
}

function loadSettings() {
    const theme = localStorage.getItem('theme') || 'default';
    applyTheme(theme);
    const lang = localStorage.getItem('language') || 'en';
    applyLanguage(lang);
    const font = localStorage.getItem('fontFamily') || 'sans-serif';
    applyFontFamily(font);
    
    const fontSize = localStorage.getItem('font-size') || '16';
    document.getElementById('fontSizeSlider').value = fontSize;
    document.getElementById('fontSizeValue').innerText = fontSize + 'px';
    document.documentElement.style.setProperty('--font-size', fontSize + 'px');
    
    const borderRadius = localStorage.getItem('border-radius') || '12';
    document.getElementById('borderRadiusSlider').value = borderRadius;
    document.getElementById('borderRadiusValue').innerText = borderRadius + 'px';
    document.documentElement.style.setProperty('--radius', borderRadius + 'px');
    
    const brightness = localStorage.getItem('brightness') || '100';
    document.getElementById('brightnessSlider').value = brightness;
    document.getElementById('brightnessValue').innerText = brightness + '%';
    const contrast = localStorage.getItem('contrast') || '100';
    document.getElementById('contrastSlider').value = contrast;
    document.getElementById('contrastValue').innerText = contrast + '%';
    const saturation = localStorage.getItem('saturation') || '100';
    document.getElementById('saturationSlider').value = saturation;
    document.getElementById('saturationValue').innerText = saturation + '%';
    updateDisplayFilters();
    
    const animSpeed = localStorage.getItem('animation-speed') || '0.3';
    document.getElementById('animSpeedSlider').value = animSpeed;
    document.getElementById('animSpeedValue').innerText = animSpeed + 's';
    document.documentElement.style.setProperty('--animation-speed', animSpeed + 's');
}

function resetSettings() {
    localStorage.clear();
    loadSettings();
    showMessage('Settings reset to default');
}

function initSettingsModal() {
    const modal = document.getElementById('settingsModal');
    const settingsBtn = document.getElementById('settingsBtn');
    const closeBtn = document.getElementById('closeSettings');
    settingsBtn.onclick = () => modal.style.display = 'flex';
    closeBtn.onclick = () => modal.style.display = 'none';
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
    
    document.querySelectorAll('.theme-option').forEach(opt => {
        opt.onclick = () => applyTheme(opt.dataset.theme);
    });
    document.querySelectorAll('.language-option').forEach(opt => {
        opt.onclick = () => applyLanguage(opt.dataset.lang);
    });
    document.querySelectorAll('.font-option').forEach(opt => {
        opt.onclick = () => applyFontFamily(opt.dataset.font);
    });
    document.getElementById('fontSizeSlider').oninput = () => applySlider('fontSizeSlider', '--font-size', 'px');
    document.getElementById('borderRadiusSlider').oninput = () => applySlider('borderRadiusSlider', '--radius', 'px');
    document.getElementById('brightnessSlider').oninput = () => applySlider('brightnessSlider', '--brightness', '%');
    document.getElementById('contrastSlider').oninput = () => applySlider('contrastSlider', '--contrast', '%');
    document.getElementById('saturationSlider').oninput = () => applySlider('saturationSlider', '--saturation', '%');
    document.getElementById('animSpeedSlider').oninput = () => applySlider('animSpeedSlider', '--animation-speed', 's');
    document.getElementById('resetAllSettings').onclick = resetSettings;
    
    // Settings tabs
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const tabName = tab.dataset.tab;
            document.querySelectorAll('.settings-tab-content').forEach(content => content.style.display = 'none');
            document.getElementById(tabName + 'Tab').style.display = 'block';
        });
    });
}

// ========== PRODUCTS & VIDEOS ==========
async function loadProducts() {
    showLoading(true);
    try {
        const res = await fetch('products.json');
        const data = await res.json();
        const unique = new Map();
        data.products.forEach(p => { if (!unique.has(p.id)) unique.set(p.id, p); });
        allProducts = Array.from(unique.values());
        brands.clear(); categories.clear();
        allProducts.forEach(p => {
            if (p.brand) brands.add(p.brand);
            if (p.category) categories.add(p.category);
        });
        videosList = allProducts.filter(p => p.videoUrl);
        updateFilters();
        filteredProducts = [...allProducts];
        displayProducts();
    } catch(e) {
        console.error("Error loading products:", e);
        allProducts = [
            { id:1, name:"BOYA BY-MW3", brand:"BOYA", category:"Audio", price:2299, description:"Wireless mic", badge:"Bestseller", image:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600", videoUrl:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", rating:4.7, features:["Wireless","Noise cancellation"] },
            { id:2, name:"The Tech Bit Air Pro", brand:"The Tech Bit", category:"Audio", price:199, description:"Noise cancelling headphones", badge:"New", image:"https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600", videoUrl:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", rating:4.5, features:["ANC","30h battery"] },
            { id:3, name:"Smart Watch Pro", brand:"The Tech Bit", category:"Wearables", price:349, description:"Health monitoring", badge:"Sale", image:"https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600", videoUrl:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", rating:4.8, features:["Heart rate","GPS"] }
        ];
        brands.clear(); categories.clear();
        allProducts.forEach(p => { brands.add(p.brand); categories.add(p.category); });
        videosList = allProducts.filter(p => p.videoUrl);
        updateFilters();
        filteredProducts = [...allProducts];
        displayProducts();
    }
    showLoading(false);
}

function updateFilters() {
    const brandSel = document.getElementById('brandFilter');
    const catSel = document.getElementById('categoryFilter');
    if (!brandSel) return;
    brandSel.innerHTML = '<option value="">All Brands</option>';
    catSel.innerHTML = '<option value="">All Categories</option>';
    brands.forEach(b => { let opt = document.createElement('option'); opt.value = b; opt.textContent = b; brandSel.appendChild(opt); });
    categories.forEach(c => { let opt = document.createElement('option'); opt.value = c; opt.textContent = c; catSel.appendChild(opt); });
}

function createProductCard(p) {
    const card = document.createElement('div');
    card.className = 'product-card';
    let quality = '', stars = '';
    if (p.rating >= 4.5) quality = '⭐ Premium';
    else if (p.rating >= 3.5) quality = '✔️ Good';
    else quality = '👍 Standard';
    stars = '★'.repeat(Math.floor(p.rating)) + '☆'.repeat(5 - Math.floor(p.rating));
    card.innerHTML = `
        ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ''}
        <div class="product-img"><img src="${p.image}" alt="${p.name}" loading="lazy"></div>
        <div class="product-info">
            <h3>${p.name}</h3>
            <p><strong>Brand:</strong> ${p.brand} | <strong>Type:</strong> ${p.category}</p>
            <p>${p.description.substring(0, 80)}...</p>
            <div class="product-price">PKR ${p.price.toFixed(2)}</div>
            <div class="product-quality">${quality} (${stars} ${p.rating})</div>
            <div class="product-actions">
                ${p.videoUrl ? `<button class="btn btn-primary watch-video" data-id="${p.id}"><i class="fas fa-play-circle"></i> See Video</button>` : ''}
                <button class="btn btn-whatsapp share-product" data-name="${p.name}"><i class="fab fa-whatsapp"></i> Share</button>
            </div>
        </div>
    `;
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.watch-video') && !e.target.closest('.share-product')) {
            showProductDetail(p);
        }
    });
    card.querySelectorAll('.watch-video').forEach(btn => {
        btn.addEventListener('click', (e) => { e.stopPropagation(); playVideoById(parseInt(btn.dataset.id)); });
    });
    card.querySelectorAll('.share-product').forEach(btn => {
        btn.addEventListener('click', (e) => { e.stopPropagation(); shareProduct(btn.dataset.name); });
    });
    return card;
}

function displayProducts() {
    const container = document.getElementById('productsGrid');
    const homeContainer = document.getElementById('homeProducts');
    if (!container) return;
    const start = (currentPage-1)*perPage;
    const paginated = filteredProducts.slice(start, start+perPage);
    container.innerHTML = '';
    if (paginated.length === 0) {
        container.innerHTML = '<div class="empty-message">No products found. Try changing your filters.</div>';
    } else {
        paginated.forEach(p => container.appendChild(createProductCard(p)));
    }
    if (homeContainer) {
        homeContainer.innerHTML = '';
        allProducts.slice(0, 3).forEach(p => homeContainer.appendChild(createProductCard(p)));
    }
    const totalPages = Math.ceil(filteredProducts.length / perPage);
    const paginationDiv = document.getElementById('pagination');
    if (totalPages > 1) {
        paginationDiv.style.display = 'block';
        document.getElementById('pageInfo').innerText = `Page ${currentPage} of ${totalPages}`;
        document.getElementById('prevPage').disabled = currentPage === 1;
        document.getElementById('nextPage').disabled = currentPage === totalPages;
    } else {
        paginationDiv.style.display = 'none';
    }
}

function applyFilters() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const brand = document.getElementById('brandFilter').value;
    const cat = document.getElementById('categoryFilter').value;
    filteredProducts = allProducts.filter(p => {
        return (!search || p.name.toLowerCase().includes(search) || p.description.toLowerCase().includes(search)) &&
               (!brand || p.brand === brand) &&
               (!cat || p.category === cat);
    });
    currentPage = 1;
    displayProducts();
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('brandFilter').value = '';
    document.getElementById('categoryFilter').value = '';
    filteredProducts = [...allProducts];
    currentPage = 1;
    displayProducts();
}

function showProductDetail(p) {
    showMessage(`Opening ${p.name} - PKR ${p.price}`, false);
}

function playVideoById(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product || !product.videoUrl) return;
    navigateTo('video');
    setTimeout(() => {
        const videoElem = document.getElementById('mainVideo');
        if (videoElem) {
            videoElem.src = product.videoUrl;
            videoElem.load();
            document.getElementById('videoTitle').innerText = product.name;
            document.getElementById('videoDesc').innerText = product.description;
            document.getElementById('buyVideoBtn').onclick = () => shareProduct(product.name);
        }
    }, 100);
}

function loadVideos() {
    const container = document.getElementById('videoList');
    if (!container) return;
    container.innerHTML = '';
    if (videosList.length === 0) {
        container.innerHTML = '<div class="empty-message">No videos available</div>';
        return;
    }
    videosList.forEach(v => {
        const item = document.createElement('div');
        item.className = 'video-item';
        item.innerHTML = `
            <div class="video-thumbnail"><i class="fas fa-play-circle"></i></div>
            <div class="video-item-info">
                <h4>${v.name}</h4>
                <p>${v.description.substring(0, 80)}</p>
            </div>
        `;
        item.addEventListener('click', () => playVideoById(v.id));
        container.appendChild(item);
    });
}

function setupVideoPlayer() {
    const video = document.getElementById('mainVideo');
    const playBtn = document.getElementById('playPauseBtn');
    const progressBar = document.getElementById('progressBar');
    const progress = document.getElementById('progress');
    const timeDisplay = document.getElementById('timeDisplay');
    const volumeSlider = document.getElementById('volumeSlider');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (!video) return;
    
    playBtn.onclick = () => video.paused ? video.play() : video.pause();
    video.onplay = () => playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    video.onpause = () => playBtn.innerHTML = '<i class="fas fa-play"></i>';
    video.onended = () => playBtn.innerHTML = '<i class="fas fa-play"></i>';
    
    video.ontimeupdate = () => {
        if (video.duration && isFinite(video.duration)) {
            progress.style.width = (video.currentTime / video.duration) * 100 + '%';
            timeDisplay.innerText = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
        }
    };
    
    progressBar.onclick = (e) => {
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        if (video.duration && isFinite(video.duration)) {
            video.currentTime = percent * video.duration;
        }
    };
    
    volumeSlider.oninput = () => video.volume = volumeSlider.value / 100;
    
    fullscreenBtn.onclick = () => {
        if (!document.fullscreenElement) {
            video.parentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };
}

function formatTime(sec) {
    if (isNaN(sec)) return "0:00";
    let m = Math.floor(sec / 60);
    let s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0'+s : s}`;
}

function shareProduct(name) {
    const url = window.location.href;
    const text = `Check out ${name} from The Tech Bit! ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

function shareWebsite() {
    shareProduct('The Tech Bit');
}

function navigateTo(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    document.querySelectorAll('.nav-link, .mobile-nav-item').forEach(link => link.classList.remove('active'));
    document.querySelectorAll(`[data-page="${pageId}"]`).forEach(link => link.classList.add('active'));
    if (pageId === 'products') applyFilters();
    if (pageId === 'video') { loadVideos(); setupVideoPlayer(); }
    if (pageId === 'offer') updateOfferPage();
    closeMobileMenu();
}

function closeMobileMenu() {
    document.getElementById('navLinks').classList.remove('active');
}

function renderAuth() {
    const container = document.getElementById('authContainer');
    container.innerHTML = `
        <div style="display:flex; gap:10px; margin-bottom:20px;">
            <button id="loginTabBtn" class="btn btn-primary" style="flex:1">Login</button>
            <button id="signupTabBtn" class="btn btn-secondary" style="flex:1">Sign Up</button>
        </div>
        <div id="loginForm">
            <input type="email" id="loginEmail" placeholder="Email" class="form-control" style="margin-bottom:10px;">
            <input type="password" id="loginPass" placeholder="Password" class="form-control" style="margin-bottom:10px;">
            <button id="doLogin" class="btn btn-primary">Login</button>
        </div>
        <div id="signupForm" style="display:none;">
            <input type="text" id="signupName" placeholder="Full Name" class="form-control" style="margin-bottom:10px;">
            <input type="email" id="signupEmail" placeholder="Email" class="form-control" style="margin-bottom:10px;">
            <input type="password" id="signupPass" placeholder="Password" class="form-control" style="margin-bottom:10px;">
            <button id="doSignup" class="btn btn-primary">Sign Up</button>
        </div>
    `;
    document.getElementById('loginTabBtn').onclick = () => { document.getElementById('loginForm').style.display='block'; document.getElementById('signupForm').style.display='none'; };
    document.getElementById('signupTabBtn').onclick = () => { document.getElementById('loginForm').style.display='none'; document.getElementById('signupForm').style.display='block'; };
    document.getElementById('doLogin').onclick = () => showMessage('Demo: Login successful', false);
    document.getElementById('doSignup').onclick = () => showMessage('Demo: Account created', false);
}

function updateOfferPage() {
    if (offerConfig.active) {
        document.getElementById('offerPercentage').innerText = `${offerConfig.percentage}% OFF`;
        document.getElementById('offerText').innerText = `On all The Tech Bit products`;
        document.getElementById('offerDescription').innerText = offerConfig.description;
    }
}

function setupContact() {
    // Initialize EmailJS
    emailjs.init("q_cI26sBuHJYeJ7OG");
    
    const form = document.getElementById('contactForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('contactName').value;
        const email = document.getElementById('contactEmail').value;
        const phone = document.getElementById('contactPhone').value;
        const subject = document.getElementById('contactSubject').value;
        const message = document.getElementById('contactMessage').value;
        
        showLoading(true);
        try {
            await emailjs.send("service_n2r2our", "template_rqvrxoh", {
                from_name: name,
                from_email: email,
                phone: phone,
                subject: subject,
                message: message
            });
            showMessage('Message sent successfully! We will contact you soon.', false);
            form.reset();
        } catch (error) {
            console.error("EmailJS error:", error);
            showMessage('Failed to send message. Please try again later.', true);
        } finally {
            showLoading(false);
        }
    });
}

function bindEvents() {
    document.getElementById('applyFilters')?.addEventListener('click', applyFilters);
    document.getElementById('resetFilters')?.addEventListener('click', resetFilters);
    document.getElementById('prevPage')?.addEventListener('click', () => { if(currentPage>1){ currentPage--; displayProducts(); } });
    document.getElementById('nextPage')?.addEventListener('click', () => { if(currentPage < Math.ceil(filteredProducts.length/perPage)){ currentPage++; displayProducts(); } });
    document.getElementById('homeVideoBtn')?.addEventListener('click', () => navigateTo('video'));
    document.getElementById('homeProductsBtn')?.addEventListener('click', () => navigateTo('products'));
    document.getElementById('offerVideoBtn')?.addEventListener('click', () => navigateTo('video'));
    document.getElementById('offerProductsBtn')?.addEventListener('click', () => navigateTo('products'));
    document.getElementById('shareSite')?.addEventListener('click', shareWebsite);
    document.getElementById('menuBtn')?.addEventListener('click', () => document.getElementById('navLinks').classList.toggle('active'));
    document.querySelectorAll('.nav-link, .mobile-nav-item').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            if (page) navigateTo(page);
        });
    });
    document.getElementById('searchInput')?.addEventListener('input', () => {
        if (searchTimeout) clearTimeout(searchTimeout);
        searchTimeout = setTimeout(applyFilters, 300);
    });
    setupContact();
    renderAuth();
    setupVideoPlayer();
    initSettingsModal();
    loadSettings();
    updateOfferPage();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    bindEvents();
});