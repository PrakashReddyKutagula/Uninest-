// Configuration
const framesSeq1 = 160;
const framesSeq2 = 160;
const framesSeq3 = 136;
const framesSeq4 = 160;
const framesSeq5 = 160;
const framesSeq6 = 168;
const framesSeq7 = 168;
const framesSeq8 = 160;
const totalImages = framesSeq1 + framesSeq2 + framesSeq3 + framesSeq4 + framesSeq5 + framesSeq6 + framesSeq7 + framesSeq8;

const sequence1 = [];
const sequence2 = [];
const sequence3 = [];
const sequence4 = [];
const sequence5 = [];
const sequence6 = [];
const sequence7 = [];
const sequence8 = [];
let loadedImagesCount = 0;
let isLoaded = false;

// DOM Elements
const loader = document.getElementById('loader');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const progressRing = document.getElementById('progress-ring');
const canvas = document.getElementById('scroll-canvas');
const ctx = canvas.getContext('2d');
const storySections = document.querySelectorAll('.story-section');
const navLinks = document.querySelectorAll('.nav-link');
const scrollIndicator = document.getElementById('scroll-indicator');
const preRegisterForm = document.getElementById('pre-register-form');
const formMessage = document.getElementById('form-message');

// Animation State
let state = {
    currentPercent: 0,
    targetPercent: 0,
};

// SVG Progress Ring calculations
const ringRadius = 45;
const ringCircumference = 2 * Math.PI * ringRadius;

// 1. Preload Images
function getFramePath(index, seqNumber) {
    const paddedIndex = index.toString().padStart(3, '0');
    const supabaseBase = "https://dmoswfffmjtxsuhmjpbx.supabase.co/storage/v1/object/public/assetss/";
    
    if (seqNumber === 1) {
        return `${supabaseBase}ezgif-8f0b3e753462f6ae-jpg/ezgif-frame-${paddedIndex}.jpg`;
    } else if (seqNumber === 2) {
        return `${supabaseBase}finding%20classmates/ezgif-frame-${paddedIndex}.jpg`;
    } else if (seqNumber === 3) {
        return `${supabaseBase}smart%20timetable/ezgif-frame-${paddedIndex}.jpg`;
    } else if (seqNumber === 4) {
        return `${supabaseBase}clubs/ezgif-frame-${paddedIndex}.jpg`;
    } else if (seqNumber === 5) {
        return `${supabaseBase}msgs/ezgif-frame-${paddedIndex}.jpg`;
    } else if (seqNumber === 6) {
        return `${supabaseBase}hangout%20planner/ezgif-frame-${paddedIndex}.jpg`;
    } else if (seqNumber === 7) {
        return `${supabaseBase}events/ezgif-frame-${paddedIndex}.jpg`;
    } else {
        return `${supabaseBase}pulse%20feed/ezgif-frame-${paddedIndex}.jpg`;
    }
}

function initPreloader() {
    progressRing.style.strokeDasharray = ringCircumference;
    progressRing.style.strokeDashoffset = ringCircumference;

    const onLoad = () => {
        loadedImagesCount++;
        updateProgress(loadedImagesCount / totalImages);
    };

    const onError = (path) => {
        console.error(`Failed to load frame: ${path}`);
        loadedImagesCount++;
        updateProgress(loadedImagesCount / totalImages);
    };

    // Load Sequence 1: Campus Nest
    for (let i = 1; i <= framesSeq1; i++) {
        const img = new Image();
        const path = getFramePath(i, 1);
        img.onload = onLoad;
        img.onerror = () => onError(path);
        img.src = path;
        sequence1.push(img);
    }

    // Load Sequence 2: Classmate Finder
    for (let i = 1; i <= framesSeq2; i++) {
        const img = new Image();
        const path = getFramePath(i, 2);
        img.onload = onLoad;
        img.onerror = () => onError(path);
        img.src = path;
        sequence2.push(img);
    }

    // Load Sequence 3: Smart Timetable
    for (let i = 1; i <= framesSeq3; i++) {
        const img = new Image();
        const path = getFramePath(i, 3);
        img.onload = onLoad;
        img.onerror = () => onError(path);
        img.src = path;
        sequence3.push(img);
    }

    // Load Sequence 4: Student Clubs
    for (let i = 1; i <= framesSeq4; i++) {
        const img = new Image();
        const path = getFramePath(i, 4);
        img.onload = onLoad;
        img.onerror = () => onError(path);
        img.src = path;
        sequence4.push(img);
    }

    // Load Sequence 5: Campus Messaging
    for (let i = 1; i <= framesSeq5; i++) {
        const img = new Image();
        const path = getFramePath(i, 5);
        img.onload = onLoad;
        img.onerror = () => onError(path);
        img.src = path;
        sequence5.push(img);
    }

    // Load Sequence 6: Hangout Planner
    for (let i = 1; i <= framesSeq6; i++) {
        const img = new Image();
        const path = getFramePath(i, 6);
        img.onload = onLoad;
        img.onerror = () => onError(path);
        img.src = path;
        sequence6.push(img);
    }

    // Load Sequence 7: Campus Events
    for (let i = 1; i <= framesSeq7; i++) {
        const img = new Image();
        const path = getFramePath(i, 7);
        img.onload = onLoad;
        img.onerror = () => onError(path);
        img.src = path;
        sequence7.push(img);
    }

    // Load Sequence 8: Campus Pulse Feed
    for (let i = 1; i <= framesSeq8; i++) {
        const img = new Image();
        const path = getFramePath(i, 8);
        img.onload = onLoad;
        img.onerror = () => onError(path);
        img.src = path;
        sequence8.push(img);
    }
}

function updateProgress(progress) {
    const percentage = Math.round(progress * 100);
    progressBar.style.width = `${percentage}%`;
    progressText.innerText = `Preparing Classrooms... ${percentage}%`;
    
    const offset = ringCircumference - (progress * ringCircumference);
    progressRing.style.strokeDashoffset = offset;

    if (loadedImagesCount === totalImages) {
        setTimeout(onLoadingComplete, 800);
    }
}

function onLoadingComplete() {
    isLoaded = true;
    loader.classList.add('fade-out');
    
    resizeCanvas();
    renderCanvasState(0);
    updateUI(0);
    
    setTimeout(updateNavIndicator, 150);
    
    requestAnimationFrame(updateLoop);
}

// 2. Canvas Rendering Engine
function resizeCanvas() {
    const dpi = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpi;
    canvas.height = window.innerHeight * dpi;
    
    ctx.scale(dpi, dpi);
    
    if (isLoaded) {
        renderCanvasState(state.currentPercent);
    }
}

function drawFrame(img, opacity = 1.0) {
    if (!img || !img.complete) return;

    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight;
    const imgWidth = img.naturalWidth || img.width;
    const imgHeight = img.naturalHeight || img.height;

    if (imgWidth === 0 || imgHeight === 0) return;

    ctx.globalAlpha = opacity;

    const imgRatio = imgWidth / imgHeight;
    const canvasRatio = canvasWidth / canvasHeight;
    let drawWidth, drawHeight, drawX, drawY;

    if (canvasRatio > imgRatio) {
        drawWidth = canvasWidth;
        drawHeight = canvasWidth / imgRatio;
        drawX = 0;
        drawY = (canvasHeight - drawHeight) / 2;
    } else {
        drawWidth = canvasHeight * imgRatio;
        drawHeight = canvasHeight;
        drawX = (canvasWidth - drawWidth) / 2;
        drawY = 0;
    }

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
}

function renderCanvasState(percent) {
    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Transition cross-fade ranges
    const transitionStart1 = 0.11;
    const transitionEnd1 = 0.14;
    const transitionDuration1 = transitionEnd1 - transitionStart1;

    const transitionStart2 = 0.23;
    const transitionEnd2 = 0.26;
    const transitionDuration2 = transitionEnd2 - transitionStart2;

    const transitionStart3 = 0.35;
    const transitionEnd3 = 0.38;
    const transitionDuration3 = transitionEnd3 - transitionStart3;

    const transitionStart4 = 0.47;
    const transitionEnd4 = 0.50;
    const transitionDuration4 = transitionEnd4 - transitionStart4;

    const transitionStart5 = 0.59;
    const transitionEnd5 = 0.62;
    const transitionDuration5 = transitionEnd5 - transitionStart5;

    const transitionStart6 = 0.71;
    const transitionEnd6 = 0.74;
    const transitionDuration6 = transitionEnd6 - transitionStart6;

    const transitionStart7 = 0.83;
    const transitionEnd7 = 0.86;
    const transitionDuration7 = transitionEnd7 - transitionStart7;

    if (percent < transitionStart1) {
        // Purely Sequence 1
        const t = percent / transitionStart1;
        const frameIndex = Math.max(1, Math.min(framesSeq1, Math.round(1 + t * (framesSeq1 - 1))));
        drawFrame(sequence1[frameIndex - 1], 1.0);
    } else if (percent >= transitionStart1 && percent <= transitionEnd1) {
        // Dissolve Sequence 1 to Sequence 2
        const t = (percent - transitionStart1) / transitionDuration1;
        drawFrame(sequence1[framesSeq1 - 1], 1 - t);
        drawFrame(sequence2[0], t);
    } else if (percent > transitionEnd1 && percent < transitionStart2) {
        // Purely Sequence 2
        const t = (percent - transitionEnd1) / (transitionStart2 - transitionEnd1);
        const frameIndex = Math.max(1, Math.min(framesSeq2, Math.round(1 + t * (framesSeq2 - 1))));
        drawFrame(sequence2[frameIndex - 1], 1.0);
    } else if (percent >= transitionStart2 && percent <= transitionEnd2) {
        // Dissolve Sequence 2 to Sequence 3
        const t = (percent - transitionStart2) / transitionDuration2;
        drawFrame(sequence2[framesSeq2 - 1], 1 - t);
        drawFrame(sequence3[0], t);
    } else if (percent > transitionEnd2 && percent < transitionStart3) {
        // Purely Sequence 3
        const t = (percent - transitionEnd2) / (transitionStart3 - transitionEnd2);
        const frameIndex = Math.max(1, Math.min(framesSeq3, Math.round(1 + t * (framesSeq3 - 1))));
        drawFrame(sequence3[frameIndex - 1], 1.0);
    } else if (percent >= transitionStart3 && percent <= transitionEnd3) {
        // Dissolve Sequence 3 to Sequence 4
        const t = (percent - transitionStart3) / transitionDuration3;
        drawFrame(sequence3[framesSeq3 - 1], 1 - t);
        drawFrame(sequence4[0], t);
    } else if (percent > transitionEnd3 && percent < transitionStart4) {
        // Purely Sequence 4
        const t = (percent - transitionEnd3) / (transitionStart4 - transitionEnd3);
        const frameIndex = Math.max(1, Math.min(framesSeq4, Math.round(1 + t * (framesSeq4 - 1))));
        drawFrame(sequence4[frameIndex - 1], 1.0);
    } else if (percent >= transitionStart4 && percent <= transitionEnd4) {
        // Dissolve Sequence 4 to Sequence 5
        const t = (percent - transitionStart4) / transitionDuration4;
        drawFrame(sequence4[framesSeq4 - 1], 1 - t);
        drawFrame(sequence5[0], t);
    } else if (percent > transitionEnd4 && percent < transitionStart5) {
        // Purely Sequence 5
        const t = (percent - transitionEnd4) / (transitionStart5 - transitionEnd4);
        const frameIndex = Math.max(1, Math.min(framesSeq5, Math.round(1 + t * (framesSeq5 - 1))));
        drawFrame(sequence5[frameIndex - 1], 1.0);
    } else if (percent >= transitionStart5 && percent <= transitionEnd5) {
        // Dissolve Sequence 5 to Sequence 6
        const t = (percent - transitionStart5) / transitionDuration5;
        drawFrame(sequence5[framesSeq5 - 1], 1 - t);
        drawFrame(sequence6[0], t);
    } else if (percent > transitionEnd5 && percent < transitionStart6) {
        // Purely Sequence 6
        const t = (percent - transitionEnd5) / (transitionStart6 - transitionEnd5);
        const frameIndex = Math.max(1, Math.min(framesSeq6, Math.round(1 + t * (framesSeq6 - 1))));
        drawFrame(sequence6[frameIndex - 1], 1.0);
    } else if (percent >= transitionStart6 && percent <= transitionEnd6) {
        // Dissolve Sequence 6 to Sequence 7
        const t = (percent - transitionStart6) / transitionDuration6;
        drawFrame(sequence6[framesSeq6 - 1], 1 - t);
        drawFrame(sequence7[0], t);
    } else if (percent > transitionEnd6 && percent < transitionStart7) {
        // Purely Sequence 7
        const t = (percent - transitionEnd6) / (transitionStart7 - transitionEnd6);
        const frameIndex = Math.max(1, Math.min(framesSeq7, Math.round(1 + t * (framesSeq7 - 1))));
        drawFrame(sequence7[frameIndex - 1], 1.0);
    } else if (percent >= transitionStart7 && percent <= transitionEnd7) {
        // Dissolve Sequence 7 to Sequence 8
        const t = (percent - transitionStart7) / transitionDuration7;
        drawFrame(sequence7[framesSeq7 - 1], 1 - t);
        drawFrame(sequence8[0], t);
    } else {
        // Purely Sequence 8
        const t = (percent - transitionEnd7) / (1 - transitionEnd7);
        const frameIndex = Math.max(1, Math.min(framesSeq8, Math.round(1 + t * (framesSeq8 - 1))));
        drawFrame(sequence8[frameIndex - 1], 1.0);
    }

    // Reset alpha
    ctx.globalAlpha = 1.0;
}

// 3. Animation Loop (Lerped Scroll)
function updateLoop() {
    if (!isLoaded) return;

    const scrollTop = window.scrollY || window.pageYOffset;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    state.targetPercent = maxScroll > 0 ? scrollTop / maxScroll : 0;

    const lerpFactor = 0.12;
    const diff = state.targetPercent - state.currentPercent;
    
    let progressChanged = false;

    if (Math.abs(diff) > 0.0001) {
        state.currentPercent += diff * lerpFactor;
        progressChanged = true;
    } else {
        state.currentPercent = state.targetPercent;
    }

    if (progressChanged) {
        renderCanvasState(state.currentPercent);
        updateUI(state.currentPercent);
    }

    requestAnimationFrame(updateLoop);
}

function updateNavIndicator() {
    const activeLink = document.querySelector('.nav-link.active-link');
    const indicator = document.querySelector('.nav-indicator');
    if (activeLink && indicator) {
        indicator.style.left = `${activeLink.offsetLeft}px`;
        indicator.style.width = `${activeLink.offsetWidth}px`;
    }
}

// 4. UI Synchronization
function updateUI(percent) {
    let activeIndex = -1;

    // Define scrolling ranges for features text fade-in
    if (percent < 0.05) {
        activeIndex = 0; // Hero
    } else if (percent >= 0.05 && percent < 0.18) {
        activeIndex = 1; // Nest
    } else if (percent >= 0.18 && percent < 0.30) {
        activeIndex = 2; // Finder
    } else if (percent >= 0.30 && percent < 0.42) {
        activeIndex = 3; // Timetable
    } else if (percent >= 0.42 && percent < 0.54) {
        activeIndex = 4; // Clubs
    } else if (percent >= 0.54 && percent < 0.66) {
        activeIndex = 5; // Messages
    } else if (percent >= 0.66 && percent < 0.78) {
        activeIndex = 6; // Hangouts
    } else if (percent >= 0.78 && percent < 0.89) {
        activeIndex = 7; // Events
    } else if (percent >= 0.89 && percent < 0.95) {
        activeIndex = 8; // Pulse Feed
    } else {
        activeIndex = 9; // CTA
    }

    storySections.forEach((section, idx) => {
        if (idx === activeIndex) {
            section.classList.add('active');
        } else {
            section.classList.remove('active');
        }
    });

    navLinks.forEach((link, idx) => {
        if (idx === activeIndex) {
            link.classList.add('active-link');
        } else {
            link.classList.remove('active-link');
        }
    });

    updateNavIndicator();

    // Hide scroll mouse indicator if user has scrolled
    if (percent > 0.05) {
        scrollIndicator.classList.add('hidden-hud');
    } else {
        scrollIndicator.classList.remove('hidden-hud');
    }
}

// 5. Event Listeners
window.addEventListener('resize', () => {
    resizeCanvas();
    updateNavIndicator();
});
window.addEventListener('load', updateNavIndicator);

// Smooth navigation anchor scrolling
navLinks.forEach((link, idx) => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Close mobile navigation drawer if open
        const navbarElement = document.querySelector('.navbar');
        const hamburgerBtn = document.querySelector('.hamburger-btn');
        if (navbarElement) {
            navbarElement.classList.remove('nav-open');
            if (hamburgerBtn) {
                hamburgerBtn.setAttribute('aria-expanded', 'false');
            }
        }

        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        let targetScroll = 0;
        
        if (idx === 0) targetScroll = 0;
        else if (idx === 1) targetScroll = maxScroll * 0.09; // Middle of Section 2 (The Nest)
        else if (idx === 2) targetScroll = maxScroll * 0.22; // Middle of Section 3 (Classmate Finder)
        else if (idx === 3) targetScroll = maxScroll * 0.34; // Middle of Section 4 (Timetable)
        else if (idx === 4) targetScroll = maxScroll * 0.46; // Middle of Section 5 (Student Clubs)
        else if (idx === 5) targetScroll = maxScroll * 0.58; // Middle of Section 6 (Campus Messages)
        else if (idx === 6) targetScroll = maxScroll * 0.70; // Middle of Section 7 (Hangout Planner)
        else if (idx === 7) targetScroll = maxScroll * 0.80; // Middle of Section 8 (Campus Events)
        else if (idx === 8) targetScroll = maxScroll * 0.92; // Middle of Section 9 (Pulse Feed)
        else if (idx === 9) targetScroll = maxScroll * 0.98; // Middle of Section 10 (Join CTA)

        window.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
        });
    });
});

// Auto-hide navbar HUD on scroll inactivity
let hudTimeout;
const navbar = document.querySelector('.navbar');

function resetHudTimeout() {
    navbar.classList.remove('hidden-hud');
    clearTimeout(hudTimeout);
    
    if (window.scrollY > 80) {
        hudTimeout = setTimeout(() => {
            navbar.classList.add('hidden-hud');
        }, 2500);
    }
}

window.addEventListener('scroll', resetHudTimeout);
window.addEventListener('mousemove', resetHudTimeout);

// Pre-registration Form Submit
preRegisterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('user-email');
    const email = emailInput.value.trim();

    if (email) {
        formMessage.innerText = "Welcome aboard! You've joined the Nest. 🚀";
        formMessage.className = "form-message success";
        emailInput.value = '';
        setTimeout(() => { formMessage.innerText = ''; }, 5000);
    } else {
        formMessage.innerText = "Please enter a valid email address.";
        formMessage.className = "form-message error";
    }
});

// Mobile Hamburger Navigation Toggle
const hamburgerBtn = document.querySelector('.hamburger-btn');
const navbarElement = document.querySelector('.navbar');

if (hamburgerBtn && navbarElement) {
    hamburgerBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Avoid triggering document-level click
        const isOpen = navbarElement.classList.toggle('nav-open');
        hamburgerBtn.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when clicking outside of it
    document.addEventListener('click', (e) => {
        if (navbarElement.classList.contains('nav-open') && 
            !navbarElement.contains(e.target)) {
            navbarElement.classList.remove('nav-open');
            hamburgerBtn.setAttribute('aria-expanded', 'false');
        }
    });
}

// Start
initPreloader();
resetHudTimeout();
