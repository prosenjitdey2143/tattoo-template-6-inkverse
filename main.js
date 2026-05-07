/**
 * INKVERSE | Premium Tattoo Studio
 * Core Application Logic
 * Refactored for High Performance & Maintainability
 */

class InkverseApp {
    constructor() {
        // Defensive checks for library availability
        this.hasLenis = typeof Lenis !== 'undefined';
        this.hasSwiper = typeof Swiper !== 'undefined';
        this.hasBarba = typeof barba !== 'undefined';
        this.hasAnime = typeof anime !== 'undefined';

        if (this.hasLenis) this.initLenis();
        this.initCursor();
        this.initMagneticElements();
        this.initAnimations();
        this.initSwipers();
        this.initVideoPlayer();
        this.initFormHandler();
        if (this.hasBarba) this.initBarba();
        
        // Safety Fallback: Force reveal after 3 seconds if JS animation fails
        setTimeout(() => {
            const selectors = '.word, .about-label, .p-label, .a-label, .r-label, .c-label, .about-desc, .p-desc, .a-desc, .feature-card, .tattoo-swiper, .artist-swiper, .reviews-swiper, .video-showcase, .c-machine-wrapper, .input-wrapper, .c-brand-lockup';
            document.querySelectorAll(selectors).forEach(el => {
                if (window.getComputedStyle(el).opacity === '0') {
                    el.style.opacity = '1';
                    el.style.transform = 'none';
                }
            });
        }, 3000);
    }

    // --- 1. SMOOTH SCROLLING (Lenis) ---
    initLenis() {
        this.lenis = new Lenis({
            duration: 1.4,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        });

        const raf = (time) => {
            this.lenis.raf(time);
            requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);

        // Global link handling for internal anchors
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) this.lenis.scrollTo(target);
            });
        });
    }

    // --- 2. PREMIUM CUSTOM CURSOR ---
    initCursor() {
        const cursor = document.querySelector('.cursor');
        const follower = document.querySelector('.cursor-follower');
        
        let mouseX = 0, mouseY = 0;
        let posX = 0, posY = 0;
        let fPosX = 0, fPosY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        const render = () => {
            // Lerp (Linear Interpolation) for smooth movement
            posX += (mouseX - posX) * 0.2;
            posY += (mouseY - posY) * 0.2;
            fPosX += (mouseX - fPosX) * 0.1;
            fPosY += (mouseY - fPosY) * 0.1;

            if (cursor) cursor.style.transform = `translate3d(${posX}px, ${posY}px, 0)`;
            if (follower) follower.style.transform = `translate3d(${fPosX}px, ${fPosY}px, 0) translate(-50%, -50%)`;

            requestAnimationFrame(render);
        };
        render();

        // Hover states
        document.querySelectorAll('a, button, .magnetic, .video-mini, .tattoo-card, .artist-card').forEach(el => {
            el.addEventListener('mouseenter', () => follower.classList.add('hover'));
            el.addEventListener('mouseleave', () => follower.classList.remove('hover'));
        });
    }

    // --- 3. MAGNETIC MICRO-INTERACTIONS ---
    initMagneticElements() {
        if (!this.hasAnime) return;
        
        const magneticElements = document.querySelectorAll('.magnetic');
        magneticElements.forEach(el => {
            const strength = el.dataset.strength || 30;
            
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                anime({
                    targets: el,
                    translateX: x * strength,
                    translateY: y * strength,
                    duration: 600,
                    easing: 'easeOutQuad'
                });

                const text = el.querySelector('.btn-text');
                if (text) {
                    anime({
                        targets: text,
                        translateX: x * (strength * 0.4),
                        translateY: y * (strength * 0.4),
                        duration: 600,
                        easing: 'easeOutQuad'
                    });
                }
            });

            el.addEventListener('mouseleave', () => {
                anime({
                    targets: [el, el.querySelector('.btn-text')],
                    translateX: 0,
                    translateY: 0,
                    duration: 1000,
                    easing: 'easeOutElastic(1, .6)'
                });
            });
        });
    }

    // --- 4. ANIMATION ENGINE (anime.js + IntersectionObserver) ---
    initAnimations() {
        if (!this.hasAnime) return;

        // Scroll Reveal Manager
        const reveal = (selector, props, threshold = 0.25) => {
            const elements = document.querySelectorAll(selector);
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        anime({ targets: entry.target, ...props, easing: 'easeOutExpo' });
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold, rootMargin: '0px 0px -80px 0px' });
            
            elements.forEach(el => {
                el.style.opacity = '0';
                observer.observe(el);
            });
        };

        const staggerReveal = (parent, child, props, delay = 100) => {
            const groups = document.querySelectorAll(parent);
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const targets = entry.target.querySelectorAll(child);
                        anime({ targets, ...props, delay: anime.stagger(delay), easing: 'easeOutExpo' });
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.2 });
            groups.forEach(g => observer.observe(g));
        };

        // Hero Sequence
        anime.timeline({ easing: 'easeOutExpo' })
            .add({ targets: '.main-heading .word', translateY: [120, 0], opacity: [0, 1], duration: 1400, delay: anime.stagger(120, { start: 400 }) })
            .add({ targets: '.character-wrapper', translateY: [80, 0], opacity: [0, 1], duration: 1200 }, '-=1000')
            .add({ targets: '.navbar', translateY: [-40, 0], opacity: [0, 1], duration: 800 }, '-=1200')
            .add({ 
                targets: '.info-item', 
                translateY: [30, 0], 
                opacity: [0, 1], 
                duration: 800, 
                delay: anime.stagger(150),
                begin: () => this.initCounters()
            }, '-=800');

        // Scroll Triggers
        reveal('.about-label, .p-label, .a-label, .r-label, .c-label', { translateY: [30, 0], opacity: [0, 1], duration: 800 });
        reveal('.about-desc, .p-desc, .a-desc', { translateY: [40, 0], opacity: [0, 1], duration: 1000 });
        staggerReveal('.feature-cards', '.feature-card', { translateY: [50, 0], opacity: [0, 1] }, 150);
        
        ['.about-heading', '.p-heading', '.a-heading', '.r-heading', '.c-heading'].forEach(h => {
            staggerReveal(h, '.word', { translateY: [80, 0], opacity: [0, 1] }, 100);
        });

        reveal('.tattoo-swiper, .artist-swiper, .reviews-swiper, .video-showcase', { translateY: [60, 0], opacity: [0, 1], duration: 1200 });
        reveal('.c-machine-wrapper', { scale: [0.9, 1], opacity: [0, 1], duration: 1400 });
        staggerReveal('.booking-form', '.input-wrapper', { translateY: [20, 0], opacity: [0, 1] }, 100);

        // Continuous Background/Idle Animations
        this.initIdleAnimations();
    }

    initCounters() {
        document.querySelectorAll('.counter').forEach(el => {
            const target = parseInt(el.dataset.target);
            anime({ targets: el, innerText: [0, target], round: 1, duration: 2500, easing: 'easeOutExpo' });
        });
    }

    initIdleAnimations() {
        if (!this.hasAnime) return;
        
        anime({
            targets: '.floating-obj',
            translateY: [-20, 20],
            duration: 3000,
            direction: 'alternate',
            loop: true,
            easing: 'easeInOutQuad',
            delay: anime.stagger(500)
        });
    }

    // --- 5. SWIPER CONFIGURATIONS ---
    initSwipers() {
        if (!this.hasSwiper) return;

        // Portfolio Swiper
        new Swiper('.tattoo-swiper', {
            slidesPerView: 'auto',
            spaceBetween: 30,
            centeredSlides: true,
            loop: true,
            speed: 800,
            autoplay: { delay: 3000, disableOnInteraction: false },
        });

        // Artist Swiper
        new Swiper('.artist-swiper', {
            slidesPerView: 'auto',
            spaceBetween: 40,
            navigation: { nextEl: '.a-next', prevEl: '.a-prev' },
            speed: 1000,
        });

        // Reviews Swiper
        new Swiper('.reviews-swiper', {
            slidesPerView: 1,
            spaceBetween: 30,
            loop: true,
            autoplay: { delay: 4000 },
            speed: 800,
        });

        // Video Stack Swiper
        this.videoStack = new Swiper('.v-stack-swiper', {
            direction: 'vertical',
            slidesPerView: 4,
            spaceBetween: 15,
            navigation: { nextEl: '.v-stack-next', prevEl: '.v-stack-prev' },
            speed: 600,
        });
    }

    // --- 6. VIDEO PLAYER LOGIC ---
    initVideoPlayer() {
        const mainVideo = document.querySelector('.v-main-video');
        const mainTitle = document.querySelector('.v-main-title');
        const playBtn = document.querySelector('.v-play-btn');
        const progressBar = document.querySelector('.v-progress-filled');

        document.querySelectorAll('.video-mini').forEach(mini => {
            mini.addEventListener('click', () => {
                const src = mini.dataset.videoSrc;
                const title = mini.dataset.title;
                const poster = mini.dataset.posterSrc;

                anime({
                    targets: '.video-main',
                    opacity: [1, 0],
                    duration: 300,
                    easing: 'linear',
                    complete: () => {
                        mainVideo.src = src;
                        mainVideo.poster = poster;
                        mainTitle.innerText = title;
                        mainVideo.play();
                        anime({ targets: '.video-main', opacity: [0, 1], duration: 300 });
                    }
                });
            });
        });

        if (mainVideo) {
            mainVideo.addEventListener('timeupdate', () => {
                const progress = (mainVideo.currentTime / mainVideo.duration) * 100;
                if (progressBar) progressBar.style.width = `${progress}%`;
            });
        }
    }

    // --- 7. FORM HANDLING ---
    initFormHandler() {
        const form = document.getElementById('bookingForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('fullName').value;
            const style = document.getElementById('tattooStyle').value;
            const msg = `Hi Inkverse! I'm ${name}. I want to book a ${style} session.`;
            window.open(`https://wa.me/9163253013?text=${encodeURIComponent(msg)}`);
        });
    }

    // --- 8. PAGE TRANSITIONS (Barba) ---
    initBarba() {
        if (!this.hasBarba || !this.hasAnime) return;
        
        barba.init({
            transitions: [{
                name: 'opacity-transition',
                leave: (data) => {
                    return anime({ targets: data.current.container, opacity: [1, 0], duration: 600, easing: 'linear' }).finished;
                },
                enter: (data) => {
                    window.scrollTo(0, 0);
                    return anime({ targets: data.next.container, opacity: [0, 1], duration: 600, easing: 'linear' }).finished;
                }
            }]
        });
    }
}

// Instantiate Application
document.addEventListener('DOMContentLoaded', () => {
    window.app = new InkverseApp();
});
