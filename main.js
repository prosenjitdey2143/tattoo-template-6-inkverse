/**
 * INKVERSE | Premium Tattoo Studio
 * Core Application Logic
 * Refactored for High Performance & Maintainability
 */

class InkverseApp {
    constructor() {
        this.initLenis();
        this.initCursor();
        this.initMagneticElements();
        this.initAnimations();
        this.initSwipers();
        this.initVideoPlayer();
        this.initFormHandler();
        this.initBarba();
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

        const update = () => {
            // Lerp for high-fidelity smoothness
            posX += (mouseX - posX) * 1;
            posY += (mouseY - posY) * 1;
            fPosX += (mouseX - fPosX) * 0.12;
            fPosY += (mouseY - fPosY) * 0.12;

            if (cursor && follower) {
                cursor.style.transform = `translate3d(${posX}px, ${posY}px, 0) translate(-50%, -50%)`;
                follower.style.transform = `translate3d(${fPosX}px, ${fPosY}px, 0) translate(-50%, -50%)`;
            }
            requestAnimationFrame(update);
        };
        update();

        // Interaction States
        const interactiveSelectors = 'a, button, .magnetic, .tattoo-card, .artist-card, .video-mini';
        document.querySelectorAll(interactiveSelectors).forEach(el => {
            el.addEventListener('mouseenter', () => follower.classList.add('hover'));
            el.addEventListener('mouseleave', () => follower.classList.remove('hover'));
        });
    }

    // --- 3. MAGNETIC MICRO-INTERACTIONS ---
    initMagneticElements() {
        document.querySelectorAll('.magnetic').forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const strength = el.dataset.strength || 20;
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const x = (e.clientX - centerX) / (rect.width / 2);
                const y = (e.clientY - centerY) / (rect.height / 2);

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
        const float = (targets, translateY, rotate = 0, duration = 4000) => {
            anime({ targets, translateY, rotate, duration, direction: 'alternate', loop: true, easing: 'easeInOutSine' });
        };
        float('.skull-obj', [-15, 15], [0, 8], 4500);
        float('.rings-obj', [20, -20], [0, -12], 5500);
        float('.machine-obj', [-10, 10], 0, 3800);
        float('.needle-obj', 0, [0, 15], 6000);
        float('.port-ring-obj', [-25, 25], 5, 6500);
        float('.a-rose-obj', [18, -18], 15, 5200);
        float('.rev-sphere', [-20, 20], 0, 5000);
    }

    // --- 5. SWIPER GALLERY CONFIGURATIONS ---
    initSwipers() {
        const defaults = { grabCursor: true, speed: 1000, loop: true };

        this.tattooSwiper = new Swiper('.tattoo-swiper', {
            ...defaults,
            slidesPerView: 'auto',
            spaceBetween: 40,
            centeredSlides: true,
            speed: 8000,
            autoplay: { delay: 0, disableOnInteraction: false }
        });

        this.videoStackSwiper = new Swiper('.video-stack-swiper', {
            ...defaults,
            direction: 'vertical',
            slidesPerView: 3,
            spaceBetween: 20,
            mousewheel: true,
            navigation: { nextEl: '.v-stack-next', prevEl: '.v-stack-prev' },
            autoplay: { delay: 4000 }
        });

        this.artistSwiper = new Swiper('.artist-swiper', {
            ...defaults,
            slidesPerView: 'auto',
            spaceBetween: 50,
            navigation: { nextEl: '.a-next', prevEl: '.a-prev' }
        });

        this.reviewsSwiper = new Swiper('.reviews-swiper', {
            ...defaults,
            slidesPerView: 1,
            centeredSlides: true,
            effect: "coverflow",
            coverflowEffect: { rotate: 0, stretch: 0, depth: 120, modifier: 2, slideShadows: false },
            autoplay: { delay: 5000 }
        });
    }

    // --- 6. ADVANCED VIDEO PLAYER ---
    initVideoPlayer() {
        const main = document.querySelector('.custom-video-player');
        if (!main) return;

        const togglePlay = () => {
            const btn = document.querySelector('.v-play-pause');
            if (main.paused) {
                main.play();
                btn.querySelector('.icon-play').style.display = 'none';
                btn.querySelector('.icon-pause').style.display = 'block';
            } else {
                main.pause();
                btn.querySelector('.icon-play').style.display = 'block';
                btn.querySelector('.icon-pause').style.display = 'none';
            }
        };

        document.querySelectorAll('.v-play-pause, .big-play-btn').forEach(b => b.addEventListener('click', togglePlay));

        document.querySelectorAll('.video-mini').forEach(mini => {
            mini.addEventListener('click', () => {
                const { videoSrc, posterSrc, title } = mini.dataset;
                anime({
                    targets: '.v-main-wrapper',
                    opacity: [1, 0, 1],
                    scale: [1, 0.98, 1],
                    duration: 800,
                    easing: 'easeInOutCubic',
                    update: (anim) => {
                        if (anim.progress > 50 && main.src !== videoSrc) {
                            main.src = videoSrc;
                            main.poster = posterSrc;
                            const titleEl = document.querySelector('.v-info-title');
                            if (titleEl) titleEl.innerText = title;
                            main.load();
                            main.play();
                        }
                    }
                });
            });
        });

        main.addEventListener('timeupdate', () => {
            const fill = document.querySelector('.v-progress-filled');
            if (fill) fill.style.width = `${(main.currentTime / main.duration) * 100}%`;
        });
    }

    // --- 7. FORM & WHATSAPP INTEGRATION ---
    initFormHandler() {
        const form = document.getElementById('bookingForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            
            btn.innerHTML = '<span class="btn-text">Processing...</span>';
            btn.style.opacity = '0.7';

            const data = {
                name: document.getElementById('fullName').value,
                style: document.getElementById('tattooStyle').value,
                phone: document.getElementById('phone').value,
                msg: document.getElementById('message').value
            };

            const text = encodeURIComponent(`*New Ink Inquiry*\n\n*Client:* ${data.name}\n*Style:* ${data.style}\n*Phone:* ${data.phone}\n*Idea:* ${data.msg}`);
            
            setTimeout(() => {
                window.open(`https://wa.me/9163253013?text=${text}`, '_blank');
                btn.innerHTML = originalText;
                btn.style.opacity = '1';
                form.reset();
            }, 1000);
        });
    }

    // --- 8. PAGE TRANSITIONS ---
    initBarba() {
        barba.init({
            transitions: [{
                name: 'fade',
                leave: (data) => anime({ targets: data.current.container, opacity: 0, duration: 600, easing: 'linear' }).finished,
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
