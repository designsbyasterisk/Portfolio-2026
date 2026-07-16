/**
 * PORTFOLIO PROJECT DETAIL PAGE INTERACTIVE SCALING & STORYTELLING SCRIPT
 * Dynamically scales iframe viewports to fit CSS mockups exactly on all screen sizes,
 * and handles brand theme color morphs, particle canvas background, and card tilts.
 */

function resizeIframes() {
    // 1. Handle Desktop Browser Viewports
    const browserContainers = document.querySelectorAll('.browser-viewport');
    browserContainers.forEach(container => {
        const iframe = container.querySelector('iframe');
        if (!iframe) return;
        
        const containerWidth = container.offsetWidth;
        if (containerWidth === 0) return; // Hidden or unrendered yet
        
        const targetWidth = 1280; // Desktop virtual design width
        const targetHeight = 800; // Desktop virtual design height
        const scale = containerWidth / targetWidth;
        
        // Apply scaling styles
        iframe.style.width = `${targetWidth}px`;
        iframe.style.height = `${targetHeight}px`;
        iframe.style.transform = `scale(${scale})`;
        iframe.style.transformOrigin = 'top left';
        iframe.style.border = 'none';
        
        // Adjust the container height to match the scaled iframe height
        container.style.height = `${targetHeight * scale}px`;
    });

    // 2. Handle Mobile Phone Viewports
    const phoneContainers = document.querySelectorAll('.phone-viewport');
    phoneContainers.forEach(container => {
        const iframe = container.querySelector('iframe');
        if (!iframe) return;
        
        // If it is a zoomed iframe, bypass scaling to render at native crispness
        if (iframe.classList.contains('zoomed-iframe')) {
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.transform = 'none';
            iframe.style.border = 'none';
            return;
        }
        
        const containerWidth = container.offsetWidth;
        if (containerWidth === 0) return;
        
        const targetWidth = 375; // Mobile virtual design width (iPhone standard)
        const containerHeight = container.offsetHeight;
        let targetHeight = 812; // Mobile virtual design height (iPhone standard)
        if (containerHeight > 0) {
            targetHeight = Math.round(targetWidth * (containerHeight / containerWidth));
        }
        const scale = containerWidth / targetWidth;
        
        // Apply scaling styles
        iframe.style.width = `${targetWidth}px`;
        iframe.style.height = `${targetHeight}px`;
        iframe.style.transform = `scale(${scale})`;
        iframe.style.transformOrigin = 'top left';
        iframe.style.border = 'none';
    });

    // 3. Handle iPad Viewports
    const ipadViewports = document.querySelectorAll('.ipad-viewport');
    ipadViewports.forEach(container => {
        const iframe = container.querySelector('iframe');
        if (!iframe) return;
        
        const containerWidth = container.offsetWidth;
        if (containerWidth === 0) return;
        
        // Target design resolution matching the 2005x1395 aspect ratio (~1.437)
        let targetWidth = 1280;
        let targetHeight = 890;
        if (container.dataset.targetWidth) {
            targetWidth = parseInt(container.dataset.targetWidth, 10);
        }
        if (container.dataset.targetHeight) {
            targetHeight = parseInt(container.dataset.targetHeight, 10);
        }
        const scale = containerWidth / targetWidth;
        
        iframe.style.width = `${targetWidth}px`;
        iframe.style.height = `${targetHeight}px`;
        iframe.style.transform = `scale(${scale})`;
        iframe.style.transformOrigin = 'top left';
        iframe.style.border = 'none';
    });

    // 4. Handle Wireframe Grid Viewports
    const wireframeContainers = document.querySelectorAll('.wireframe-iframe-wrapper');
    wireframeContainers.forEach(container => {
        const iframe = container.querySelector('iframe');
        if (!iframe) return;
        
        const containerWidth = container.offsetWidth;
        if (containerWidth === 0) return;
        
        const targetWidth = 720;
        const targetHeight = 550;
        
        if (containerWidth < targetWidth) {
            const scale = containerWidth / targetWidth;
            iframe.style.width = `${targetWidth}px`;
            iframe.style.height = `${targetHeight}px`;
            iframe.style.transform = `scale(${scale})`;
            iframe.style.transformOrigin = 'top center';
            iframe.style.border = 'none';
            container.style.height = `${targetHeight * scale}px`;
        } else {
            iframe.style.width = `${targetWidth}px`;
            iframe.style.height = `${targetHeight}px`;
            iframe.style.transform = 'none';
            iframe.style.transformOrigin = 'top center';
            iframe.style.border = 'none';
            container.style.height = `${targetHeight}px`;
        }
    });
}

// Attach event listeners
window.addEventListener('resize', resizeIframes);

function initializeAll() {
    resizeIframes();
    
    // Register GSAP ScrollTrigger after the page is fully loaded and layout has settled
    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        initProjectStorytelling();
        
        // Let ScrollTrigger recalculate trigger bounds after layouts settle
        setTimeout(() => {
            ScrollTrigger.refresh();
        }, 150);
        setTimeout(() => {
            ScrollTrigger.refresh();
        }, 600);
    }
}

// Execute once resources (CSS, frames, assets) are fully loaded to prevent early pin calculation issues
if (document.readyState === 'complete') {
    initializeAll();
} else {
    window.addEventListener('load', initializeAll);
}

/**
 * Storytelling Scroll Animations for Project Case Study Page
 */
function initProjectStorytelling() {
    const body = document.body;
    
    // Read brand parameters from body attributes
    const brandBg = body.dataset.brandBg || "#0a1128";
    const brandText = body.dataset.brandText || "#f8fafc";
    const brandAccent = body.dataset.brandAccent || "#316dd5";
    const brandCardBg = body.dataset.brandCardBg || "#1e293b";
    const brandBorder = body.dataset.brandBorder || "rgba(255, 255, 255, 0.08)";

    // Helper to convert hex to RGB string
    function hexToRgb(hex) {
        if (!hex || typeof hex !== 'string') return "255, 255, 255";
        let c = hex.startsWith('#') ? hex.substring(1) : hex;
        if (c.length === 3) {
            c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
        }
        const r = parseInt(c.substring(0, 2), 16);
        const g = parseInt(c.substring(2, 4), 16);
        const b = parseInt(c.substring(4, 6), 16);
        return `${r}, ${g}, ${b}`;
    }

    // Apply colors immediately as CSS custom properties
    if (body.classList.contains('theme-brand')) {
        body.style.setProperty('--brand-bg', brandBg);
        body.style.setProperty('--brand-text', brandText);
        body.style.setProperty('--brand-accent', brandAccent);
        body.style.setProperty('--brand-card-bg', brandCardBg);
        body.style.setProperty('--brand-border', brandBorder);
        
        const brandTextSub = body.dataset.brandTextSub || (brandText === "#5c3a2a" ? "#8c6a5a" : "#cbd5e1");
        body.style.setProperty('--brand-text-sub', brandTextSub);
        
        let gridColor = body.style.getPropertyValue('--brand-grid-color').trim();
        if (!gridColor) {
            gridColor = "rgba(255, 255, 255, 0.02)";
            if (brandBg === "#fff3e3") { // Honee light theme
                gridColor = "rgba(92, 58, 42, 0.035)";
            }
        }
        body.style.setProperty('--brand-grid-color', gridColor);
    }

    // ==========================================
    // A. LIQUID SCROLL BRAND MORPHING
    // ==========================================
    const themeTrigger = document.querySelector('.case-study-grid, .chapter-narrative, .chapter-gallery-pin');
    if (themeTrigger) {
        const morphTl = gsap.timeline({
            scrollTrigger: {
                trigger: themeTrigger,
                start: "top 80%",
                end: "top 30%",
                scrub: true
            }
        });

        morphTl.to("body", { backgroundColor: brandBg, color: brandText })
               .to("header.floating-header", { backgroundColor: brandCardBg, borderColor: brandBorder }, 0)
               .to("header.floating-header .logo", { color: brandAccent }, 0)
               .to("header.floating-header .back-link", { color: brandText }, 0)
               .to(".project-header", { backgroundColor: brandCardBg, borderColor: brandBorder }, 0)
               .to(".project-header p", { color: brandText }, 0)
               .to(".meta-label", { color: brandAccent }, 0)
               .to(".bento-card", { backgroundColor: brandCardBg, borderColor: brandBorder }, 0)
               .to(".bento-card p, .features-list li", { color: brandText }, 0)
               .to(".bento-card h2", { borderBottomColor: brandAccent }, 0)
               .to(".gallery-card", { backgroundColor: brandCardBg, borderColor: brandBorder }, 0)
               .to(".gallery-caption", { color: brandText }, 0)
               .to(".parallax-shape", { borderColor: brandBorder }, 0);
    }

    // ==========================================
    // B. LOAD TIME HEADER TEXT REVEAL
    // ==========================================
    const splitHeader = document.querySelector('.gsap-split-header');
    if (splitHeader) {
        const text = splitHeader.textContent.trim();
        splitHeader.textContent = '';
        splitHeader.style.overflow = 'hidden';
        splitHeader.style.display = 'block';

        const words = text.split(' ');
        words.forEach(word => {
            const wordSpan = document.createElement('span');
            wordSpan.style.display = 'inline-block';
            wordSpan.style.overflow = 'hidden';
            wordSpan.style.verticalAlign = 'bottom';
            wordSpan.style.marginRight = '0.22em';

            const charSpan = document.createElement('span');
            charSpan.textContent = word;
            charSpan.style.display = 'inline-block';
            charSpan.style.transform = 'translateY(110%)';
            charSpan.style.opacity = '0';
            
            wordSpan.appendChild(charSpan);
            splitHeader.appendChild(wordSpan);
        });

        gsap.to(splitHeader.querySelectorAll('span span'), {
            y: '0%',
            opacity: 1,
            duration: 0.75,
            stagger: 0.08,
            ease: "power3.out",
            delay: 0.15
        });
    }

    // ==========================================
    // C. DYNAMIC CANVAS PARTICLE BACKDROP
    // ==========================================
    const canvas = document.getElementById('project-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouse = { x: null, y: null };
        const numParticles = 40;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });
        window.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        class Particle {
            constructor() {
                this.reset(true);
            }
            reset(init = false) {
                this.x = Math.random() * canvas.width;
                this.y = init ? Math.random() * canvas.height : -10;
                this.size = Math.random() * 2 + 0.8;
                this.speedX = Math.random() * 0.4 - 0.2;
                this.speedY = Math.random() * 0.25 + 0.1;
                this.baseAlpha = Math.random() * 0.25 + 0.1;
                this.alpha = this.baseAlpha;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.y > canvas.height) {
                    this.reset(false);
                }
            }
            draw() {
                const scrollProgress = Math.min(1, window.scrollY / 400);
                
                // Color matches brand accent in scrolled state, blue initially
                const activeColor = brandAccent.startsWith('#') ? brandAccent : '#1E63F3';
                const colorStr = scrollProgress > 0.3 ? hexToRgbStr(activeColor) : '42, 101, 212';
                
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${colorStr}, ${this.alpha})`;
                ctx.fill();
            }
        }

        // Helper to convert hex to RGB string
        function hexToRgbStr(hex) {
            let c = hex.substring(1);
            if (c.length === 3) {
                c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
            }
            const r = parseInt(c.substring(0, 2), 16);
            const g = parseInt(c.substring(2, 4), 16);
            const b = parseInt(c.substring(4, 6), 16);
            return `${r}, ${g}, ${b}`;
        }

        for (let i = 0; i < numParticles; i++) {
            particles.push(new Particle());
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animate);
        }
        animate();
    }


    // ==========================================
    // E. STAGGERED SCREENSHOT GALLERY REVEAL
    // ==========================================
    const galleryItems = document.querySelectorAll('.gallery-card');
    if (galleryItems.length > 0 && document.querySelector('.project-gallery')) {
        gsap.from(galleryItems, {
            y: 45,
            opacity: 0,
            scale: 0.98,
            duration: 0.65,
            stagger: 0.12,
            ease: "power2.out",
            scrollTrigger: {
                trigger: ".project-gallery",
                start: "top 85%",
                toggleActions: "play none none none"
            }
        });
    }

    // ==========================================
    // F. BACKGROUND SHAPES PARALLAX
    // ==========================================
    gsap.to(".shape-1", {
        y: 160,
        rotation: 180,
        ease: "none",
        scrollTrigger: {
            trigger: ".shape-1",
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2
        }
    });
    gsap.to(".shape-2", {
        y: -180,
        rotation: -120,
        ease: "none",
        scrollTrigger: {
            trigger: ".shape-2",
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2
        }
    });
    gsap.to(".shape-3", {
        y: 200,
        rotation: 90,
        ease: "none",
        scrollTrigger: {
            trigger: ".shape-3",
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2
        }
    });

    // ==========================================
    // G. CINEMATIC NARRATIVE CHAPTER ANIMATIONS (Emberquit Page)
    // ==========================================
    
    // Toggle header backdrop on scroll
    const headerElement = document.querySelector('.floating-header, .project-sticky-header');
    if (headerElement) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                headerElement.classList.add('scrolled');
            } else {
                headerElement.classList.remove('scrolled');
            }
        });
    }

    // 1. Chapter 1: Hero Parallax Scale
    if (document.querySelector('.chapter-hero')) {
        gsap.to(".chapter-hero-bg", {
            scale: 1.15,
            ease: "none",
            scrollTrigger: {
                trigger: ".chapter-hero",
                start: "top top",
                end: "bottom top",
                scrub: true
            }
        });

        gsap.to(".hero-content", {
            y: -100,
            opacity: 0,
            ease: "none",
            scrollTrigger: {
                trigger: ".chapter-hero",
                start: "top top",
                end: "bottom 20%",
                scrub: true
            }
        });
    }

    // ==========================================================================
    // RESPONSIVE LAYOUTS & CINEMATIC PINS (Desktop only: min-width: 993px)
    // ==========================================================================
    let mm = gsap.matchMedia();

    // Desktop mode (min-width: 993px)
    mm.add("(min-width: 993px)", () => {
        // 2. Chapter 2: Split Narrative Lock & Metric Card Zoom
        if (document.querySelector('.chapter-narrative')) {
            const narrativeTl = gsap.timeline({
                scrollTrigger: {
                    trigger: ".chapter-narrative",
                    start: "top top",
                    end: "+=100%",
                    pin: true,
                    scrub: true,
                    anticipatePin: 1
                }
            });

            narrativeTl.fromTo(".narrative-content-left", 
                { opacity: 0, y: 50 },
                { opacity: 1, y: 0, duration: 0.4 }
            )
            .fromTo(".chapter-narrative .bento-card",
                { scale: 0.35, opacity: 0, rotationY: -45 },
                { scale: 1, opacity: 1, rotationY: 0, duration: 0.6, ease: "power2.out" },
                "-=0.2"
            )
            .fromTo(".brand-metric-card",
                { scale: 0.35, opacity: 0, rotationY: -45 },
                { scale: 1, opacity: 1, rotationY: 0, duration: 0.6, ease: "power2.out" },
                "-=0.3"
            );
        }

        // 3. Chapter Deck Pin (Vertical Stacked Card Deck Reveal)
        const deckSection = document.querySelector('.chapter-deck-pin');
        if (deckSection) {
            const deckCards = deckSection.querySelectorAll('.deck-card');
            if (deckCards.length > 0) {
                const deckTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: deckSection,
                        start: "top top",
                        end: () => `+=${deckCards.length * 100}%`,
                        pin: true,
                        scrub: true,
                        invalidateOnRefresh: true,
                        anticipatePin: 1
                    }
                });

                // Set initial overlapping layers
                deckCards.forEach((card, idx) => {
                    gsap.set(card, {
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        y: 0,
                        opacity: 1, // Keep cards fully opaque to prevent overlapping text
                        scale: idx === 0 ? 1 : (idx === 1 ? 0.95 : 0.9),
                        zIndex: 50 - idx
                    });
                });

                // Animate cards sequentially on scroll progress
                deckCards.forEach((card, idx) => {
                    if (idx < deckCards.length - 1) {
                        const slideDir = idx % 2 === 0 ? "-120%" : "120%";
                        const rotDir = idx % 2 === 0 ? -8 : 8;
                        deckTl.to(card, {
                            x: slideDir,
                            rotation: rotDir,
                            // Do not fade out the card while it is sliding to keep it opaque
                            duration: 1,
                            ease: "power2.inOut"
                        });
                        deckTl.to(deckCards[idx + 1], {
                            scale: 1,
                            duration: 1,
                            ease: "power2.inOut"
                        }, "-=1");

                        if (deckCards[idx + 2]) {
                            deckTl.to(deckCards[idx + 2], {
                                scale: 0.95,
                                duration: 1,
                                ease: "power2.inOut"
                            }, "-=1");
                        }
                    }
                });
            }
        }

        // 4. Chapter 3: Horizontal Gallery Showcase
        const gallerySections = document.querySelectorAll('.chapter-gallery-pin');
        gallerySections.forEach((gallerySection) => {
            const galleryTrack = gallerySection.querySelector('.gallery-horizontal-track');
            if (!galleryTrack) return;

            const getScrollAmount = () => {
                let trackWidth = galleryTrack.scrollWidth;
                let viewportWidth = window.innerWidth;
                return -(trackWidth - viewportWidth);
            };

            const horizontalTween = gsap.to(galleryTrack, {
                x: () => getScrollAmount(),
                ease: "none",
                scrollTrigger: {
                    trigger: gallerySection,
                    start: "top top",
                    end: () => `+=${galleryTrack.scrollWidth - window.innerWidth + 400}`,
                    pin: true,
                    scrub: true,
                    invalidateOnRefresh: true,
                    anticipatePin: 1
                }
            });

            gallerySection.horizontalTween = horizontalTween;
            window.projectHorizontalTween = horizontalTween;

            const slideCards = galleryTrack.querySelectorAll('.gallery-slide-card');
            slideCards.forEach((card) => {
                const img = card.querySelector('.slide-image-wrapper img');
                const wrapper = card.querySelector('.slide-image-wrapper');
                if (img && wrapper) {
                    const isMockup = img.src.includes('mockup') || wrapper.classList.contains('wide-wrapper');
                    const startScale = isMockup ? 1.03 : 1.12; // Lower start scale for mockups to prevent any cropping
                    gsap.fromTo(img,
                        { scale: startScale },
                        {
                            scale: 1.0,
                            ease: "power1.out",
                            scrollTrigger: {
                                trigger: card,
                                containerAnimation: horizontalTween,
                                start: "left 90%",
                                end: "left 40%",
                                scrub: true
                            }
                        }
                    );
                }

                const cardTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: card,
                        containerAnimation: horizontalTween,
                        start: "left 98%",
                        end: "right 2%",
                        scrub: true,
                        invalidateOnRefresh: true
                    }
                });

                cardTl.fromTo(card,
                    { scale: 0.88, opacity: 0.45, rotation: 1.5, transformOrigin: "center center" },
                    { scale: 1.0, opacity: 1, rotation: 0, ease: "power1.out", duration: 0.5 }
                ).to(card,
                    { scale: 0.88, opacity: 0.45, rotation: -1.5, ease: "power1.in", duration: 0.5 }
                );
            });
        });

        // 5. Chapter 4: Interactive Phone Mockup Reveal
        const mockupSection = document.querySelector('.chapter-mockup-pin');
        const phoneMockup = document.querySelector('.iphone13-mockup-wrapper.zoomed-mockup');
        const zoomedIframe = document.querySelector('.zoomed-iframe');

        if (mockupSection && phoneMockup) {
            gsap.set(phoneMockup, {
                scale: 0.35,
                rotation: -10,
                y: 0,
                transformOrigin: "center center"
            });

            const updateMockupSize = () => {
                const viewportHeight = window.innerHeight;
                const viewportWidth = window.innerWidth;
                const headerElement = document.querySelector('.floating-header, .project-sticky-header');
                const headerHeight = headerElement ? headerElement.offsetHeight : 70;
                const visibleHeight = viewportHeight - headerHeight;
                
                const targetHeight = visibleHeight * 0.82;
                const targetWidth = viewportWidth * 0.82;
                
                const finalSize = Math.min(targetHeight, targetWidth, 964);
                phoneMockup.style.setProperty('--mockup-size', `${Math.round(finalSize)}px`);
            };
            
            updateMockupSize();
            window.addEventListener('resize', updateMockupSize);

            const getShiftY = () => {
                const headerElement = document.querySelector('.floating-header, .project-sticky-header');
                const headerHeight = headerElement ? headerElement.offsetHeight : 70;
                return Math.round(headerHeight / 2);
            };

            let scrollTimeout = null;

            const mockupTl = gsap.timeline({
                scrollTrigger: {
                    id: "mockup-scroll-trigger",
                    trigger: mockupSection,
                    start: "top top",
                    end: "+=150%",
                    pin: true,
                    scrub: true,
                    invalidateOnRefresh: true,
                    anticipatePin: 1,
                    onUpdate: (self) => {
                        // Disable pointer events immediately during active scroll to prevent trapping
                        if (zoomedIframe) zoomedIframe.style.pointerEvents = 'none';
                        
                        if (scrollTimeout) clearTimeout(scrollTimeout);
                        
                        // Enable pointer events once the user stops scrolling (if zoomed past 65%)
                        scrollTimeout = setTimeout(() => {
                            if (self.progress >= 0.65) {
                                if (zoomedIframe) zoomedIframe.style.pointerEvents = 'auto';
                            }
                        }, 100); // 100ms provides a snappy, near-instant transition
                    }
                }
            });

            // Add hover handlers to immediately capture/release mouse control when stationary
            phoneMockup.addEventListener('mouseenter', () => {
                const trigger = ScrollTrigger.getById('mockup-scroll-trigger');
                const progress = trigger ? trigger.progress : 0;
                if (progress >= 0.65) {
                    if (zoomedIframe) zoomedIframe.style.pointerEvents = 'auto';
                }
            });

            phoneMockup.addEventListener('mouseleave', () => {
                if (zoomedIframe) zoomedIframe.style.pointerEvents = 'none';
            });

            mockupTl.to(phoneMockup, {
                scale: 1.0, // Always zoom to exactly 1.0 (native CSS pixel size) to prevent browser bitmap scaling and ensure razor-sharp text
                y: () => getShiftY(),
                rotation: 0,
                duration: 0.7, // Complete zoom early (at 70% of scroll) so it has time to rasterize clearly
                ease: "power1.out", // Soft decelerating ease feels premium and aligns smoothly
                force3D: false // Disable GPU layer caching to keep scaling sharp and pixel-aligned
            });
        }
    });

    // Mobile layout resets (max-width: 992px)
    mm.add("(max-width: 992px)", () => {
        // Reset card deck inline GSAP states so CSS rules handle stacking
        const deckCards = document.querySelectorAll('.chapter-deck-pin .deck-card');
        deckCards.forEach(card => {
            gsap.set(card, {
                position: "",
                top: "",
                left: "",
                width: "",
                height: "",
                y: "",
                opacity: "",
                scale: "",
                zIndex: "",
                x: "",
                rotation: ""
            });
        });

        const phoneMockup = document.querySelector('.iphone13-mockup-wrapper.zoomed-mockup');
        if (phoneMockup) {
            gsap.set(phoneMockup, {
                scale: "",
                rotation: "",
                y: "",
                willChange: ""
            });
        }

        const zoomedIframe = document.querySelector('.zoomed-iframe');
        if (zoomedIframe) {
            zoomedIframe.style.pointerEvents = 'auto';
        }
    });

    // ==========================================
    // H. INTERACTIVE BOX BREATHING WIDGET (Emberquit Page)
    // ==========================================
    const breathingCircle = document.querySelector('.breathing-circle-widget');
    const breathingText = document.querySelector('.breathing-text');
    const breathingBtn = document.querySelector('.btn-breathing-control');
    
    if (breathingCircle && breathingText && breathingBtn) {
        let breathingInterval = null;
        let breathingActive = false;
        let step = 0; // 0 = Inhale, 1 = Hold, 2 = Exhale, 3 = Hold
        
        const rgbAccent = hexToRgb(brandAccent);
        const phases = [
            { text: "Inhale", scale: 1.5, bg: `radial-gradient(circle, rgba(${rgbAccent}, 0.6) 0%, rgba(${rgbAccent}, 0.15) 75%)` },
            { text: "Hold", scale: 1.5, bg: `radial-gradient(circle, rgba(${rgbAccent}, 0.6) 0%, rgba(${rgbAccent}, 0.15) 75%)` },
            { text: "Exhale", scale: 1.0, bg: `radial-gradient(circle, rgba(${rgbAccent}, 0.3) 0%, rgba(${rgbAccent}, 0.05) 70%)` },
            { text: "Hold", scale: 1.0, bg: `radial-gradient(circle, rgba(${rgbAccent}, 0.3) 0%, rgba(${rgbAccent}, 0.05) 70%)` }
        ];

        function runBreathingStep() {
            const phase = phases[step];
            breathingText.textContent = phase.text;
            
            // Animate using GSAP for smooth easing
            gsap.to(breathingCircle, {
                scale: phase.scale,
                background: phase.bg,
                duration: 4.0,
                ease: "power1.inOut"
            });
            
            step = (step + 1) % 4;
        }

        function startBreathing() {
            breathingActive = true;
            breathingBtn.textContent = "Stop Guide";
            breathingBtn.style.backgroundColor = "#dc2626"; // High contrast red for Stop
            breathingBtn.style.color = "#ffffff";
            step = 0;
            runBreathingStep();
            breathingInterval = setInterval(runBreathingStep, 4000);
        }

        function stopBreathing() {
            breathingActive = false;
            clearInterval(breathingInterval);
            breathingBtn.textContent = "Start Guide";
            breathingBtn.style.backgroundColor = brandAccent;
            breathingBtn.style.color = "#ffffff";
            breathingText.textContent = "Inhale";
            gsap.to(breathingCircle, {
                scale: 1.0,
                background: `radial-gradient(circle, rgba(${rgbAccent}, 0.4) 0%, rgba(${rgbAccent}, 0.1) 70%)`,
                duration: 0.8,
                ease: "power2.out"
            });
        }

        breathingBtn.addEventListener('click', () => {
            if (breathingActive) {
                stopBreathing();
            } else {
                startBreathing();
            }
        });
    }

    // Check if running via file:// protocol to display CORS warning
    if (window.location.protocol === 'file:') {
        const warningBadge = document.getElementById('cors-warning-badge');
        if (warningBadge) {
            warningBadge.style.display = 'block';
        }
    }
}
