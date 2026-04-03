/* =============================================
   CHARANJEET SINGH — Portfolio JS
   Three.js + GSAP + ScrollTrigger
   ============================================= */

gsap.registerPlugin(ScrollTrigger);

/* =============================================
   1. CUSTOM CURSOR
   ============================================= */
const cursor     = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let ringX  = mouseX;
let ringY  = mouseY;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    gsap.to(cursor, { x: mouseX, y: mouseY, duration: 0.08, ease: 'none' });
});

// Smooth-follow ring
(function animateRing() {
    ringX += (mouseX - ringX) * 0.09;
    ringY += (mouseY - ringY) * 0.09;
    gsap.set(cursorRing, { x: ringX, y: ringY });
    requestAnimationFrame(animateRing);
})();

// Hover states for interactive elements
document.querySelectorAll('a, button, .project-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
        gsap.to(cursor,     { scale: 3.5, duration: 0.35, ease: 'power2.out' });
        gsap.to(cursorRing, { scale: 1.6, opacity: 0.4, duration: 0.35, ease: 'power2.out' });
    });
    el.addEventListener('mouseleave', () => {
        gsap.to(cursor,     { scale: 1, duration: 0.35, ease: 'power2.out' });
        gsap.to(cursorRing, { scale: 1, opacity: 1, duration: 0.35, ease: 'power2.out' });
    });
});

/* =============================================
   2. NAVIGATION SCROLL STATE
   ============================================= */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

/* =============================================
   3. THREE.JS — HERO SCENE (golden, bright)
   ============================================= */
(function initHeroScene() {
    const canvas   = document.getElementById('hero-canvas');
    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.position.set(0, 0, 6);

    // ---- Materials — brighter, more golden
    const wireMat1 = new THREE.MeshBasicMaterial({
        color: 0xDDB96A, wireframe: true, transparent: true, opacity: 0.55
    });
    const wireMat2 = new THREE.MeshBasicMaterial({
        color: 0xF5E6A3, wireframe: true, transparent: true, opacity: 0.22
    });
    const torusMat = new THREE.MeshBasicMaterial({
        color: 0xE8C96B, transparent: true, opacity: 0.5, wireframe: false
    });
    const torusMat2 = new THREE.MeshBasicMaterial({
        color: 0xC9A84C, transparent: true, opacity: 0.28, wireframe: false
    });

    // ---- Central icosahedron — brighter core
    const icoGeo  = new THREE.IcosahedronGeometry(1.8, 2);
    const icoMesh = new THREE.Mesh(icoGeo, wireMat1);
    scene.add(icoMesh);

    // ---- Solid inner glow icosahedron
    const icoInnerMesh = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.75, 2),
        new THREE.MeshBasicMaterial({ color: 0xC9A84C, transparent: true, opacity: 0.04, wireframe: false })
    );
    scene.add(icoInnerMesh);

    // ---- Outer halo icosahedron
    const icoGeo2  = new THREE.IcosahedronGeometry(3.2, 1);
    const icoMesh2 = new THREE.Mesh(icoGeo2, wireMat2);
    scene.add(icoMesh2);

    // ---- Tilted torus ring — much thicker & brighter
    const torusGeo  = new THREE.TorusGeometry(3.8, 0.025, 3, 140);
    const torusMesh = new THREE.Mesh(torusGeo, torusMat);
    torusMesh.rotation.x = Math.PI * 0.28;
    scene.add(torusMesh);

    // ---- Second torus
    const torusMesh2 = new THREE.Mesh(
        new THREE.TorusGeometry(4.3, 0.014, 3, 140),
        torusMat2
    );
    torusMesh2.rotation.y = Math.PI * 0.5;
    torusMesh2.rotation.z = Math.PI * 0.15;
    scene.add(torusMesh2);

    // ---- Third thin orbital ring
    const torusMesh3 = new THREE.Mesh(
        new THREE.TorusGeometry(2.6, 0.008, 2, 100),
        new THREE.MeshBasicMaterial({ color: 0xF5E6A3, transparent: true, opacity: 0.3 })
    );
    torusMesh3.rotation.x = Math.PI * 0.55;
    torusMesh3.rotation.z = Math.PI * 0.1;
    scene.add(torusMesh3);

    // ---- Particle field — closer, brighter, more of them
    const PARTICLE_COUNT = 800;
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const r   = 3.5 + Math.random() * 8;
        const phi = Math.acos(2 * Math.random() - 1);
        const th  = Math.random() * Math.PI * 2;
        positions[i * 3]     = r * Math.sin(phi) * Math.cos(th);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(th);
        positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const partGeo = new THREE.BufferGeometry();
    partGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const partMat  = new THREE.PointsMaterial({ color: 0xE8C96B, size: 0.04, transparent: true, opacity: 0.9 });
    const partMesh = new THREE.Points(partGeo, partMat);
    scene.add(partMesh);

    // ---- Group for parallax
    const group = new THREE.Group();
    group.add(icoMesh, icoInnerMesh, icoMesh2, torusMesh, torusMesh2, torusMesh3, partMesh);
    scene.add(group);

    // ---- Mouse parallax
    let targetRX = 0, targetRY = 0;
    document.addEventListener('mousemove', (e) => {
        targetRX = (e.clientY / window.innerHeight - 0.5) * 0.5;
        targetRY = (e.clientX / window.innerWidth  - 0.5) * 0.5;
    }, { passive: true });

    // ---- Render loop
    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        icoMesh.rotation.y      =  t * 0.14;
        icoMesh.rotation.x      =  t * 0.07;
        icoInnerMesh.rotation.y =  t * 0.14;
        icoInnerMesh.rotation.x =  t * 0.07;
        icoMesh2.rotation.y     = -t * 0.08;
        icoMesh2.rotation.z     =  t * 0.05;
        torusMesh.rotation.z    =  t * 0.05;
        torusMesh2.rotation.x   = -t * 0.07;
        torusMesh3.rotation.y   =  t * 0.09;
        partMesh.rotation.y     =  t * 0.022;

        group.rotation.x += (targetRX - group.rotation.x) * 0.04;
        group.rotation.y += (targetRY - group.rotation.y) * 0.04;

        renderer.render(scene, camera);
    }
    animate();

    // ---- Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
})();

/* =============================================
   4. THREE.JS — ABOUT SCENE
   ============================================= */
(function initAboutScene() {
    const canvas = document.getElementById('about-canvas');
    if (!canvas) return;

    const scene    = new THREE.Scene();
    const w        = canvas.parentElement.offsetWidth;
    const h        = canvas.parentElement.offsetHeight;
    const camera   = new THREE.PerspectiveCamera(55, w / h, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.position.z = 4;

    // Grid plane
    const gridMat = new THREE.MeshBasicMaterial({ color: 0xC9A84C, wireframe: true, transparent: true, opacity: 0.07 });
    const gridGeo = new THREE.PlaneGeometry(8, 8, 20, 20);
    const gridMesh = new THREE.Mesh(gridGeo, gridMat);
    gridMesh.rotation.x = -Math.PI * 0.35;
    gridMesh.position.y = -1.5;
    scene.add(gridMesh);

    // Octahedron
    const octGeo  = new THREE.OctahedronGeometry(1.2, 0);
    const octMat  = new THREE.MeshBasicMaterial({ color: 0xC9A84C, wireframe: true, transparent: true, opacity: 0.35 });
    const octMesh = new THREE.Mesh(octGeo, octMat);
    scene.add(octMesh);

    // Floating diamonds (small)
    const smallOctMat = new THREE.MeshBasicMaterial({ color: 0xE8C96B, wireframe: true, transparent: true, opacity: 0.2 });
    const floaters = [];
    for (let i = 0; i < 6; i++) {
        const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.15, 0), smallOctMat);
        m.position.set(
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 3,
            (Math.random() - 0.5) * 2
        );
        m._offset = Math.random() * Math.PI * 2;
        scene.add(m);
        floaters.push(m);
    }

    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();
        octMesh.rotation.y = t * 0.3;
        octMesh.rotation.x = t * 0.18;
        gridMesh.rotation.z = t * 0.02;
        floaters.forEach(f => {
            f.position.y += Math.sin(t + f._offset) * 0.002;
            f.rotation.y = t * 0.5;
        });
        renderer.render(scene, camera);
    }
    animate();
})();

/* =============================================
   5. SCROLL-TRIGGERED ANIMATIONS
   ============================================= */

// Work header
gsap.from('.work-header .section-tag', {
    scrollTrigger: { trigger: '#work', start: 'top 82%' },
    opacity: 0, x: -24, duration: 0.7, ease: 'power2.out'
});
gsap.from('.work-header .section-title', {
    scrollTrigger: { trigger: '#work', start: 'top 78%' },
    opacity: 0, y: 40, duration: 1, ease: 'power3.out', delay: 0.1
});

// Project cards — staggered slide-up
document.querySelectorAll('.project-card').forEach((card, i) => {
    gsap.from(card, {
        scrollTrigger: { trigger: card, start: 'top 85%' },
        opacity: 0, y: 70, duration: 1,
        delay: i * 0.1,
        ease: 'power3.out'
    });
});

// About section
gsap.from('.about-visual-col', {
    scrollTrigger: { trigger: '#about', start: 'top 72%' },
    opacity: 0, x: -60, duration: 1.1, ease: 'power3.out'
});
gsap.from(['.about-text-col .section-tag', '.about-heading', '.about-body', '.about-skills'], {
    scrollTrigger: { trigger: '#about', start: 'top 72%' },
    opacity: 0, x: 60,
    duration: 1.1,
    stagger: 0.12,
    ease: 'power3.out'
});

// Impact
gsap.from('.impact-num', {
    scrollTrigger: { trigger: '#impact', start: 'top 72%' },
    opacity: 0, scale: 0.75, duration: 1.2,
    ease: 'expo.out'
});
gsap.from('.impact-text-wrap', {
    scrollTrigger: { trigger: '#impact', start: 'top 70%' },
    opacity: 0, x: 50, duration: 1,
    delay: 0.2, ease: 'power3.out'
});

// Awards
gsap.from('.awards-list .award-row', {
    scrollTrigger: { trigger: '#awards', start: 'top 78%' },
    opacity: 0, y: 24,
    stagger: 0.09,
    duration: 0.7,
    ease: 'power2.out'
});
gsap.from('#awards .section-tag', {
    scrollTrigger: { trigger: '#awards', start: 'top 85%' },
    opacity: 0, x: -20, duration: 0.6
});
gsap.from('#awards .section-title', {
    scrollTrigger: { trigger: '#awards', start: 'top 80%' },
    opacity: 0, y: 30, duration: 0.8, delay: 0.1
});

// Contact
gsap.from('.contact-heading', {
    scrollTrigger: { trigger: '#contact', start: 'top 75%' },
    opacity: 0, y: 60, duration: 1.1,
    ease: 'power3.out'
});
gsap.from('.contact-btn', {
    scrollTrigger: { trigger: '#contact', start: 'top 65%' },
    opacity: 0, y: 30, duration: 0.8,
    delay: 0.25, ease: 'power2.out'
});
gsap.from('.contact-links', {
    scrollTrigger: { trigger: '#contact', start: 'top 60%' },
    opacity: 0, y: 20, duration: 0.7,
    delay: 0.4, ease: 'power2.out'
});

/* =============================================
   7. PROJECT CARD — 3D TILT + GLOW
   ============================================= */
document.querySelectorAll('.project-card').forEach(card => {
    const glow = card.querySelector('.project-glow');

    card.addEventListener('mousemove', (e) => {
        const rect    = card.getBoundingClientRect();
        const x       = e.clientX - rect.left;
        const y       = e.clientY - rect.top;
        const cx      = rect.width  / 2;
        const cy      = rect.height / 2;
        const rotX    = ((y - cy) / cy) * -6;
        const rotY    = ((x - cx) / cx) *  6;

        gsap.to(card, {
            rotateX: rotX,
            rotateY: rotY,
            transformPerspective: 1200,
            duration: 0.4,
            ease: 'power1.out'
        });

        gsap.to(glow, {
            x: x, y: y,
            opacity: 1,
            duration: 0.3,
            ease: 'power1.out'
        });
    });

    card.addEventListener('mouseleave', () => {
        gsap.to(card, {
            rotateX: 0, rotateY: 0,
            duration: 0.7,
            ease: 'power3.out'
        });
        gsap.to(glow, {
            opacity: 0,
            duration: 0.45,
            ease: 'power2.out'
        });
    });
});

/* =============================================
   8. SMOOTH ANCHOR SCROLL
   ============================================= */
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
        const id = link.getAttribute('href');
        const el = document.querySelector(id);
        if (!el) return;
        e.preventDefault();
        const top = el.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top, behavior: 'smooth' });
    });
});

/* =============================================
   9. LETTER HOVER — UX TOOLTIP
   ============================================= */
(function initLetterHover() {
    const tooltip = document.getElementById('letter-tooltip');
    const ltTitle = tooltip.querySelector('.lt-title');
    const ltDesc  = tooltip.querySelector('.lt-desc');
    let hideTimer = null;

    document.querySelectorAll('.name-letter').forEach(letter => {
        letter.addEventListener('mouseenter', (e) => {
            clearTimeout(hideTimer);
            ltTitle.textContent = letter.dataset.title;
            ltDesc.textContent  = letter.dataset.desc;
            tooltip.classList.add('visible');
            positionTooltip(e);
        });

        letter.addEventListener('mousemove', positionTooltip);

        letter.addEventListener('mouseleave', () => {
            hideTimer = setTimeout(() => {
                tooltip.classList.remove('visible');
            }, 120);
        });
    });

    function positionTooltip(e) {
        const tw = tooltip.offsetWidth  || 280;
        const th = tooltip.offsetHeight || 90;
        let x = e.clientX + 20;
        let y = e.clientY - th - 16;

        // Keep inside viewport
        if (x + tw > window.innerWidth  - 16) x = e.clientX - tw - 20;
        if (y < 12) y = e.clientY + 24;

        tooltip.style.left = x + 'px';
        tooltip.style.top  = y + 'px';
    }
})();

/* =============================================
   11. PARALLAX — HERO STATS ON SCROLL
   ============================================= */
gsap.to('.hero-stats', {
    scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
    },
    y: -60,
    opacity: 0
});

gsap.to('.hero-content', {
    scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
    },
    y: -80,
    opacity: 0
});

/* =============================================
   SLOT MACHINE LOGO  (CS → CX → UX → CS loop)

   Left  reel rows: C(0)  C(1)  U(2)  C(3)
   Right reel rows: S(0)  X(1)  X(2)  S(3)

   Step 1: CS → CX  — only RIGHT scrolls (S exits up, X enters)
   Step 2: CX → UX  — only LEFT  scrolls (C exits up, U enters)
   Step 3: UX → CS  — BOTH scroll (staggered) to row 3
   Then:   snap both back to row 0 (same letter = invisible reset)
   ============================================= */
(function () {
    const L = document.getElementById('slotLeft');
    const R = document.getElementById('slotRight');
    if (!L || !R) return;

    const H    = 24;                               // must match CSS height: 24px
    const DUR  = '0.65s';
    const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
    const GAP  = 2000;                             // ms between each step

    let lRow = 0, rRow = 0, step = 0;

    function slide(el, row) {
        el.style.transition = `transform ${DUR} ${EASE}`;
        el.style.transform  = `translateY(${-(row * H)}px)`;
    }

    function snap(el, row) {
        el.style.transition = 'none';
        el.style.transform  = `translateY(${-(row * H)}px)`;
    }

    function tick() {
        if (step === 0) {
            // CS → CX: only right moves
            slide(R, 1); rRow = 1;

        } else if (step === 1) {
            // CX → UX: only left moves
            slide(L, 2); lRow = 2;

        } else if (step === 2) {
            // UX → CS: left first, right 100ms later
            slide(L, 3); lRow = 3;
            setTimeout(() => { slide(R, 3); rRow = 3; }, 100);

            // After animation finishes, snap both back to row 0 (C,S — invisible reset)
            setTimeout(() => {
                snap(L, 0); lRow = 0;
                snap(R, 0); rRow = 0;
            }, 750);
        }

        step = (step + 1) % 3;
    }

    // Begin after 2s, then every GAP ms
    setTimeout(() => {
        tick();
        setInterval(tick, GAP);
    }, 2000);
}());
