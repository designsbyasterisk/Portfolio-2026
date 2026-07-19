/* ==========================================================================
   CORE PORTFOLIO INTERACTIONS (GSAP + SCROLLTRIGGER)
   Handles Entrance timelines, Horizontal scroll, Scroll triggers, Theme swaps
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // Disable automatic browser scroll restoration on reload to prevent GSAP pin overlap glitches
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // Register ScrollTrigger plugin with GSAP
    gsap.registerPlugin(ScrollTrigger);

    // Global morph state for particles (0 = free blue particles, 1 = snapped white grid columns)
    const particleState = { morph: 0 };

    /* ----------------------------------------------------------------------
       1. Staggered Hero Entrance Animations (Page Load)
       ---------------------------------------------------------------------- */
    const entranceTimeline = gsap.timeline();

    entranceTimeline
        .from("header", {
            y: -30,
            opacity: 0,
            duration: 0.35,
            ease: "power3.out"
        })
        .from(".text-lead", {
            y: 15,
            opacity: 0,
            duration: 0.4,
            ease: "power3.out"
        }, 0.1)
        .from(".btn-pop", {
            scale: 0.9,
            opacity: 0,
            stagger: 0.05,
            duration: 0.35,
            ease: "back.out(1.5)"
        }, 0.2)
        .from(".jigsaw-item", {
            scale: 0.7,
            y: 20,
            opacity: 0,
            stagger: 0.05,
            duration: 0.5,
            ease: "back.out(1.5)"
        }, 0.15);

    /* ----------------------------------------------------------------------
       2. ScrollTrigger Section Reveals & Staggered Bento Card Reveals
       ---------------------------------------------------------------------- */
    const revealSections = gsap.utils.toArray('.reveal').filter(section => {
        // Skip hero container so it doesn't animate twice
        return !section.closest('section:first-of-type');
    });

    revealSections.forEach((section) => {
        const cards = section.querySelectorAll('.bento-card, .timeline-card');
        if (cards.length > 0) {
            // Animate card children with stagger for an organic reveal flow
            gsap.from(cards, {
                y: 50,
                opacity: 0,
                scale: 0.98,
                duration: 0.8,
                stagger: 0.15,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: section,
                    start: "top 80%",
                    toggleActions: "play none none none"
                }
            });
        } else {
            // Fallback for sections with no cards
            gsap.from(section, {
                y: 50,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: section,
                    start: "top 85%",
                    toggleActions: "play none none none"
                }
            });
        }
    });

    /* ----------------------------------------------------------------------
       3. ScrollTrigger SVG Scribble Drawing (Linked to Scrub)
       ---------------------------------------------------------------------- */
    const scribble = document.querySelector('.scribble-path');
    if (scribble) {
        gsap.fromTo(scribble, 
            { strokeDashoffset: 1000 },
            {
                strokeDashoffset: 0,
                scrollTrigger: {
                    trigger: ".scribble-container",
                    start: "top 80%",
                    end: "bottom 30%",
                    scrub: 1
                }
            }
        );
    }

    /* ----------------------------------------------------------------------
       4. GSAP Horizontal Scroll Showcase (Responsive via MatchMedia)
       ---------------------------------------------------------------------- */
    const scrollWrapper = document.querySelector('.horizontal-scroll-wrapper');
    const scrollContainer = document.querySelector('.horizontal-scroll-container');

    if (scrollWrapper && scrollContainer) {
        // Dynamic helper to calculate exact scroll distance so last panel (HONÉE) centers perfectly on screen
        const getEndScroll = () => {
            const lastPanel = scrollWrapper.querySelector('.horizontal-scroll-panel:last-child');
            if (!lastPanel) return scrollWrapper.scrollWidth - window.innerWidth;
            const lastPanelCenter = lastPanel.offsetLeft + (lastPanel.offsetWidth / 2);
            const viewportCenter = window.innerWidth / 2;
            return Math.max(0, lastPanelCenter - viewportCenter);
        };

        ScrollTrigger.matchMedia({
            // Desktop & Laptop Viewports (769px and above)
            "(min-width: 769px)": function() {
                const scrollTween = gsap.to(scrollWrapper, {
                    x: () => -getEndScroll(),
                    ease: "none",
                    scrollTrigger: {
                        trigger: scrollContainer,
                        pin: true,
                        scrub: 1,
                        start: "top top",
                        end: () => "+=" + getEndScroll(),
                        invalidateOnRefresh: true,
                        anticipatePin: 1
                    }
                });

                // Horizontal project card entrance motion
                const panels = gsap.utils.toArray('.horizontal-scroll-panel');
                panels.forEach((panel) => {
                    const card = panel.querySelector('.horizontal-project-card');
                    if (card) {
                        gsap.fromTo(card, 
                            { scale: 0.94, opacity: 0.85 },
                            {
                                scale: 1,
                                opacity: 1,
                                scrollTrigger: {
                                    trigger: panel,
                                    containerAnimation: scrollTween,
                                    start: "left 85%",
                                    end: "left 20%",
                                    scrub: 0.5
                                }
                            }
                        );
                    }

                    // Update project indicator tracker text per panel
                    const projectNum = panel.dataset.projectNum;
                    const projectDesc = panel.dataset.projectDesc;
                    if (projectNum && projectDesc) {
                        ScrollTrigger.create({
                            trigger: panel,
                            containerAnimation: scrollTween,
                            start: "left 75%",
                            end: "right 25%",
                            onEnter: () => updateProjectTrackerText(projectNum, projectDesc),
                            onEnterBack: () => updateProjectTrackerText(projectNum, projectDesc)
                        });
                    }
                });

                // Theme background transition (Light -> Midnight Navy -> Light)
                ScrollTrigger.create({
                    trigger: scrollContainer,
                    start: "top 60%",
                    end: () => "+=" + (getEndScroll() + window.innerHeight * 0.8),
                    onEnter: () => gsap.to("body", { backgroundColor: "#0A1128", color: "#FAF6EE", duration: 0.4 }),
                    onLeaveBack: () => gsap.to("body", { backgroundColor: "var(--bg-canvas)", color: "#0A1128", duration: 0.4 }),
                    onLeave: () => gsap.to("body", { backgroundColor: "var(--bg-canvas)", color: "#0A1128", duration: 0.4 }),
                    onEnterBack: () => gsap.to("body", { backgroundColor: "#0A1128", color: "#FAF6EE", duration: 0.4 })
                });

                function updateProjectTrackerText(num, desc) {
                    const numEl = document.getElementById("current-project-num");
                    const descEl = document.getElementById("current-project-desc");
                    const barEl = document.getElementById("project-progress-bar");
                    if (numEl && descEl) {
                        numEl.textContent = num;
                        descEl.textContent = desc;

                        const numVal = parseInt(num, 10);
                        if (barEl && !isNaN(numVal)) {
                            const pct = (numVal / 4) * 100;
                            gsap.to(barEl, { width: pct + "%", duration: 0.35, ease: "power2.out" });
                        }

                        gsap.fromTo([numEl, descEl], 
                            { opacity: 0, y: 6 }, 
                            { opacity: 1, y: 0, duration: 0.3, stagger: 0.04, ease: "power2.out" }
                        );
                    }
                }
            }
        });
    }

    /* ----------------------------------------------------------------------
       4.5. Interactive Storytelling Scroll Additions
       ---------------------------------------------------------------------- */
    
    // ==========================================
    // B. ROTATING TEXT ORBITER (Scroll-Linked)
    // ==========================================
    const circularBadge = document.querySelector('.circular-text-badge');
    let badgeTween;
    if (circularBadge) {
        badgeTween = gsap.to(circularBadge, {
            rotation: 360,
            duration: 20,
            repeat: -1,
            ease: "none"
        });

        // Speed up rotation during active scrolling
        ScrollTrigger.create({
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            onUpdate: (self) => {
                const velocity = Math.abs(self.getVelocity());
                const targetTimeScale = 1 + Math.min(6.5, velocity / 180);
                
                // Snappy time scale ramp up
                gsap.to(badgeTween, { timeScale: targetTimeScale, duration: 0.2, overwrite: "auto" });
                // Calm easing back down
                gsap.to(badgeTween, { timeScale: 1, duration: 1.0, delay: 0.25, overwrite: "auto" });
            }
        });
    }

    // ==========================================
    // C. LIQUID SCROLL BACKGROUND THEMING
    // ==========================================
    // Transition 1: White -> Midnight Navy for Featured Projects
    const projectsBgTl = gsap.timeline({
        scrollTrigger: {
            trigger: "#projects",
            start: "top 80%",
            end: "top 25%",
            scrub: true
        }
    });

    projectsBgTl.to("body", { backgroundColor: "#0A1128", color: "#FAF6EE" })
                
                .to(".showcase-header h2 span", { color: "#FAF6EE" }, 0);

    // Transition 2: Midnight Navy -> White for Section 02 (Work History)
    const experienceBgTl = gsap.timeline({
        scrollTrigger: {
            trigger: "#experience-summary",
            start: "top 85%",
            end: "top 35%",
            scrub: true
        }
    });

    experienceBgTl.to("body", { backgroundColor: "var(--bg-canvas)", color: "#0A1128" })
                  
                  .to(".showcase-header h2 span", { color: "#0A1128" }, 0);

    // ==========================================
    // D. DYNAMIC PROJECT PROGRESS BAR & DESCRIPTIONS
    // ==========================================
    if (scrollWrapper && scrollContainer) {
        // Tie horizontal scroll timeline to progress bar filling
        gsap.to("#project-progress-bar", {
            width: "100%",
            ease: "none",
            scrollTrigger: {
                trigger: scrollContainer,
                start: "top top",
                end: () => "+=" + (scrollWrapper.scrollWidth - window.innerWidth),
                scrub: true
            }
        });
    }

    // Heading word-by-word reveal transitions
    const revealHeaders = document.querySelectorAll('.showcase-header h2');
    revealHeaders.forEach((header) => {
        const text = header.textContent.trim();
        header.textContent = '';
        header.style.overflow = 'hidden';
        header.style.display = 'inline-block';
        header.style.verticalAlign = 'top';
        
        const words = text.split(' ');
        words.forEach((word) => {
            const wordSpan = document.createElement('span');
            wordSpan.textContent = word + ' ';
            wordSpan.style.display = 'inline-block';
            wordSpan.style.transform = 'translateY(105%)';
            wordSpan.style.opacity = '0';
            wordSpan.style.transition = 'color var(--transition-slow)';
            header.appendChild(wordSpan);
        });
        
        gsap.to(header.querySelectorAll('span'), {
            y: '0%',
            opacity: 1,
            duration: 0.6,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: {
                trigger: header,
                start: "top 88%",
                toggleActions: "play none none none"
            }
        });
    });

    /* ----------------------------------------------------------------------
       5. Bouncy Magnetic Hover Effect (GSAP Elastic Return)
       ---------------------------------------------------------------------- */
    const magneticElements = document.querySelectorAll('.magnetic');
    
    magneticElements.forEach((el) => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            // Calculate cursor offset relative to button center
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            // Move button smoothly towards cursor
            gsap.to(el, {
                x: x * 0.35,
                y: y * 0.35,
                duration: 0.3,
                ease: "power2.out"
            });
        });
        
        el.addEventListener('mouseleave', () => {
            // Elastic snap-back
            gsap.to(el, {
                x: 0,
                y: 0,
                duration: 0.75,
                ease: "elastic.out(1.1, 0.45)"
            });
        });
    });

    /* ----------------------------------------------------------------------
       6. Accent Theme Color Swapping
       ---------------------------------------------------------------------- */
    const themePickerDots = document.querySelectorAll('.theme-picker-dot');
    const defaultTheme = localStorage.getItem('accent-theme') || 'blue';

    applyTheme(defaultTheme);

    themePickerDots.forEach(dot => {
        dot.addEventListener('click', () => {
            const chosenTheme = dot.dataset.theme;
            applyTheme(chosenTheme);
            localStorage.setItem('accent-theme', chosenTheme);
        });
    });

    function applyTheme(themeName) {
        // Swap accent classes on body
        document.body.classList.remove('theme-highlighter', 'theme-blue', 'theme-tangerine');
        document.body.classList.add(`theme-${themeName}`);

        // Update indicator states
        themePickerDots.forEach(dot => {
            if (dot.dataset.theme === themeName) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        // Micro-pop theme select animation
        const activeDot = document.querySelector(`.theme-picker-dot[data-theme="${themeName}"]`);
        if (activeDot) {
            gsap.fromTo(activeDot, 
                { scale: 0.8 }, 
                { scale: 1.12, duration: 0.4, ease: "back.out(2)" }
            );
        }
    }

    /* ----------------------------------------------------------------------
       7. Click-to-Copy Hex Clipboard Utility
       ---------------------------------------------------------------------- */
    const copyBadges = document.querySelectorAll('.copy-hex');
    copyBadges.forEach(badge => {
        badge.addEventListener('click', () => {
            const textToCopy = badge.dataset.hex || badge.textContent;
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalText = badge.textContent;
                badge.textContent = 'COPIED!';
                
                gsap.fromTo(badge, 
                    { scale: 0.9 }, 
                    { scale: 1.05, duration: 0.25, ease: "back.out(2)" }
                );

                badge.style.color = 'var(--accent-contrast)';
                badge.style.backgroundColor = 'var(--accent)';
                
                setTimeout(() => {
                    badge.textContent = originalText;
                    badge.style.color = '';
                    badge.style.backgroundColor = '';
                }, 1200);
            });
        });
    });

    /* ----------------------------------------------------------------------
       8. Playful Typewriter Greeting Rotator
       ---------------------------------------------------------------------- */
    const greetings = ["HI THERE!", "WELCOME!", "EXPLORE!"];
    const greetingEl = document.getElementById('hero-greeting');
    let greetingIndex = 0;

    if (greetingEl) {
        setInterval(() => {
            greetingIndex = (greetingIndex + 1) % greetings.length;
            
            // GSAP slide-up fade out
            gsap.to(greetingEl, {
                y: -15,
                opacity: 0,
                duration: 0.25,
                ease: "power2.in",
                onComplete: () => {
                    greetingEl.textContent = greetings[greetingIndex];
                    // Re-split and setup the loops for the new text so vector morphs continue working
                    setupSplitPortfolioElement(greetingEl);
                    // Reset position and slide up fade-in
                    gsap.fromTo(greetingEl, 
                        { y: 15, opacity: 0 }, 
                        { y: 0, opacity: 1, duration: 0.35, ease: "back.out(1.5)" }
                    );
                }
            });

        }, 4000); // Increased rotator duration to 4s to let morph animations play
    }

    /* ----------------------------------------------------------------------
       9. Neo-Geometric GSAP Vector-to-Letter Flip Animation (Page Load)
       ---------------------------------------------------------------------- */
    const flipElements = document.querySelectorAll('.gsap-split-flip');
    
    flipElements.forEach((el) => {
        const text = el.textContent.trim();
        el.textContent = '';
        el.style.display = 'inline-flex';
        el.style.flexWrap = 'wrap';
        el.style.alignItems = 'baseline';
        
        // Custom Neo-Geometric vectors colored with brand swatches (100% height and width)
        const shapes = [
            // Circle (Hyper Blue)
            '<svg viewBox="0 0 24 24" style="width: 100%; height: 100%; fill: var(--color-blue);"><circle cx="12" cy="12" r="10"/></svg>',
            // Triangle (Acid Tangerine)
            '<svg viewBox="0 0 24 24" style="width: 100%; height: 100%; fill: var(--color-tangerine);"><polygon points="12,2 2,22 22,22"/></svg>',
            // Square (Midnight Navy)
            '<svg viewBox="0 0 24 24" style="width: 90%; height: 90%; fill: var(--text-main);"><rect x="2" y="2" width="20" height="20"/></svg>',
            // Diamond (Highlighter Yellow)
            '<svg viewBox="0 0 24 24" style="width: 100%; height: 100%; fill: var(--color-highlighter);"><polygon points="12,2 22,12 12,22 2,12"/></svg>',
            // Four-point Star (Hyper Blue)
            '<svg viewBox="0 0 24 24" style="width: 100%; height: 100%; fill: var(--color-blue);"><path d="M12,2 L15.5,8.5 L22,12 L15.5,15.5 L12,22 L8.5,15.5 L2,12 L8.5,8.5 Z"/></svg>'
        ];
        
        // Define exactly 4 character indices to be vector-flip elements (S, Y, U, R)
        // Shreya Kulkarni: S(0), h(1), r(2), e(3), y(4), a(5),  (6), K(7), u(8), l(9), k(10), a(11), r(12), n(13), i(14)
        const flipIndices = [0, 4, 8, 12];
        
        const chars = Array.from(text);
        let shapeIndex = 0;
        
        chars.forEach((char, index) => {
            if (char === ' ') {
                const spaceSpan = document.createElement('span');
                spaceSpan.innerHTML = '&nbsp;';
                spaceSpan.style.display = 'inline-block';
                spaceSpan.style.width = '0.5em';
                el.appendChild(spaceSpan);
            } else if (flipIndices.includes(index)) {
                // This character will be a flipping vector shape
                const charWrapper = document.createElement('span');
                charWrapper.style.display = 'inline-block';
                charWrapper.style.position = 'relative';
                charWrapper.style.perspective = '1000px';
                charWrapper.style.verticalAlign = 'baseline';
                charWrapper.style.lineHeight = '1';
                
                // Adjust margin-right for index 4 (y) to correct kerning with 'a'
                if (index === 4) {
                    charWrapper.style.marginRight = '-0.03em';
                } else {
                    charWrapper.style.marginRight = '0.08em';
                }
                
                // Assign unique class names for individual animations
                if (index === 0) charWrapper.className = 'flip-char-container anim-slide-y';
                else if (index === 4) charWrapper.className = 'flip-char-container anim-flip-x';
                else if (index === 8) charWrapper.className = 'flip-char-container anim-spin-scale';
                else if (index === 12) charWrapper.className = 'flip-char-container anim-wipe-x';
                
                // Select a shape
                const shapeHtml = shapes[shapeIndex % shapes.length];
                shapeIndex++;
                
                const front = document.createElement('span');
                front.className = 'flip-char-front';
                front.style.position = 'absolute';
                front.style.top = '0';
                front.style.left = '0';
                front.style.width = '100%';
                front.style.height = '100%';
                front.style.display = 'flex';
                front.style.alignItems = 'center';
                front.style.justifyContent = 'center';
                front.style.backfaceVisibility = 'hidden';
                front.style.webkitBackfaceVisibility = 'hidden';
                front.style.lineHeight = '0';
                front.innerHTML = shapeHtml;
                
                const back = document.createElement('span');
                back.className = 'flip-char-back';
                back.style.position = 'relative';
                back.style.display = 'inline-block';
                back.style.backfaceVisibility = 'hidden';
                back.style.webkitBackfaceVisibility = 'hidden';
                back.textContent = char;
                
                // Set initial transform styles according to target unique animation type
                if (index === 0) {
                    charWrapper.style.overflow = 'hidden';
                    front.style.transform = 'translateY(0%)';
                    back.style.transform = 'translateY(-100%)';
                    back.style.opacity = '1';
                } else if (index === 4) {
                    front.style.transform = 'rotateX(0deg)';
                    back.style.transform = 'rotateX(-90deg)';
                    back.style.opacity = '0';
                } else if (index === 8) {
                    front.style.transform = 'scale(1) rotate(0deg)';
                    back.style.transform = 'scale(0) rotate(-90deg)';
                    back.style.opacity = '0';
                } else if (index === 12) {
                    charWrapper.style.overflow = 'hidden';
                    front.style.transform = 'translateX(0%)';
                    back.style.transform = 'translateX(-100%)';
                    back.style.opacity = '1';
                }
                
                charWrapper.appendChild(front);
                charWrapper.appendChild(back);
                el.appendChild(charWrapper);
            } else {
                // Normal character that slides/fades in
                const normalWrapper = document.createElement('span');
                normalWrapper.className = 'normal-char';
                normalWrapper.style.display = 'inline-block';
                normalWrapper.style.opacity = '0';
                normalWrapper.style.transform = 'translateY(12px)';
                normalWrapper.style.verticalAlign = 'baseline';
                normalWrapper.style.lineHeight = '1';
                normalWrapper.style.marginRight = '0.08em';
                normalWrapper.textContent = char;
                el.appendChild(normalWrapper);
            }
        });
        
        // Snappy, fast GSAP Animation Timeline
        const tl = gsap.timeline({ delay: 0.15 });
        const normalChars = el.querySelectorAll('.normal-char');
        
        // 1. Normal characters slide up and fade in quickly, while fronts scale in
        tl.to(normalChars, {
            opacity: 1,
            y: 0,
            duration: 0.2,
            stagger: 0.01,
            ease: "power2.out"
        })
        .from(el.querySelectorAll('.flip-char-front'), {
            scale: 0,
            rotation: -90,
            opacity: 0,
            stagger: 0.03,
            duration: 0.25,
            ease: "back.out(1.5)"
        }, 0); // Executed simultaneously with step 1
        
        // 2. Chain reaction of unique mechanical animations for each of the 4 shapes
        
        // --- Shape 1: S (Index 0) - Slide Reveal (Scroll Down) ---
        const wrapper0 = el.querySelector('.anim-slide-y');
        if (wrapper0) {
            const f = wrapper0.querySelector('.flip-char-front');
            const b = wrapper0.querySelector('.flip-char-back');
            tl.to(f, { y: '100%', duration: 0.22, ease: "power2.inOut" }, "+=0.02")
              .to(b, { y: '0%', duration: 0.22, ease: "power2.inOut" }, "<")
              .to(wrapper0, { scale: 1.1, duration: 0.12, yoyo: true, repeat: 1, ease: "power1.out" }, "<");
        }
        
        // --- Shape 2: y (Index 4) - 3D Vertical Flip (rotateX) ---
        const wrapper4 = el.querySelector('.anim-flip-x');
        if (wrapper4) {
            const f = wrapper4.querySelector('.flip-char-front');
            const b = wrapper4.querySelector('.flip-char-back');
            tl.to(f, { rotateX: 90, duration: 0.12, ease: "power2.in" }, "-=0.18")
              .set(f, { opacity: 0 })
              .set(b, { opacity: 1 })
              .to(b, { rotateX: 0, duration: 0.15, ease: "back.out(1.4)" })
              .to(wrapper4, { scale: 1.1, duration: 0.12, yoyo: true, repeat: 1, ease: "power1.out" }, "<");
        }
        
        // --- Shape 3: u (Index 8) - Spin & Scale Morph ---
        const wrapper8 = el.querySelector('.anim-spin-scale');
        if (wrapper8) {
            const f = wrapper8.querySelector('.flip-char-front');
            const b = wrapper8.querySelector('.flip-char-back');
            tl.to(f, { scale: 0, rotation: 90, duration: 0.12, ease: "power2.in" }, "-=0.18")
              .set(f, { opacity: 0 })
              .set(b, { opacity: 1 })
              .to(b, { scale: 1, rotation: 0, duration: 0.15, ease: "back.out(1.4)" })
              .to(wrapper8, { scale: 1.1, duration: 0.12, yoyo: true, repeat: 1, ease: "power1.out" }, "<");
        }
        
        // --- Shape 4: r (Index 12) - Slide Horizontal Wipe ---
        const wrapper12 = el.querySelector('.anim-wipe-x');
        if (wrapper12) {
            const f = wrapper12.querySelector('.flip-char-front');
            const b = wrapper12.querySelector('.flip-char-back');
            tl.to(f, { x: '100%', duration: 0.22, ease: "power2.inOut" }, "-=0.18")
              .to(b, { x: '0%', duration: 0.22, ease: "power2.inOut" }, "<")
              .to(wrapper12, { scale: 1.1, duration: 0.12, yoyo: true, repeat: 1, ease: "power1.out" }, "<");
        }
    });

    /* ----------------------------------------------------------------------
       10. GSAP Wildly Popular Text-Vector Looping Animation
       ---------------------------------------------------------------------- */
    
    // Encapsulate split portfolio generation into a reusable function
    function setupSplitPortfolioElement(el) {
        if (el.flipIntervalId) {
            clearInterval(el.flipIntervalId);
        }

        const text = el.textContent.trim();
        
        // If animations are stopped, restore original text representation and skip loop creation
        if (window.stopMorphAnimations) {
            el.textContent = text;
            el.style.display = '';
            return;
        }

        el.textContent = '';
        el.style.display = 'inline-flex';
        el.style.flexWrap = 'wrap';
        el.style.alignItems = 'baseline';
        
        const shapes = [
            '<svg viewBox="0 0 24 24" style="width: 100%; height: 100%; fill: var(--color-blue);"><circle cx="12" cy="12" r="10"/></svg>',
            '<svg viewBox="0 0 24 24" style="width: 100%; height: 100%; fill: var(--color-tangerine);"><polygon points="12,2 2,22 22,22"/></svg>',
            '<svg viewBox="0 0 24 24" style="width: 100%; height: 100%; fill: var(--color-highlighter);"><polygon points="12,2 22,12 12,22 2,12"/></svg>',
            '<svg viewBox="0 0 24 24" style="width: 100%; height: 100%; fill: var(--color-blue);"><path d="M12,2 L15.5,8.5 L22,12 L15.5,15.5 L12,22 L8.5,15.5 L2,12 L8.5,8.5 Z"/></svg>'
        ];
        
        const chars = Array.from(text);
        const charWrappers = [];
        const allWrappers = [];
        const animTypes = ['slide-y', 'flip-x', 'spin-scale', 'wipe-x', 'fade-morph'];
        
        chars.forEach((char, index) => {
            if (char === ' ') {
                const spaceSpan = document.createElement('span');
                spaceSpan.innerHTML = '&nbsp;';
                spaceSpan.style.display = 'inline-block';
                spaceSpan.style.width = '0.5em';
                el.appendChild(spaceSpan);
                allWrappers.push(spaceSpan);
            } else if (char === '*') {
                const asteriskSpan = document.createElement('span');
                asteriskSpan.textContent = '*';
                asteriskSpan.style.display = 'inline-block';
                asteriskSpan.style.position = 'relative';
                asteriskSpan.style.verticalAlign = 'baseline';
                asteriskSpan.style.lineHeight = '1';
                asteriskSpan.style.color = 'var(--accent-text)'; // Keep its accent styling
                el.appendChild(asteriskSpan);
                allWrappers.push(asteriskSpan);
            } else {
                const charWrapper = document.createElement('span');
                charWrapper.style.display = 'inline-block';
                charWrapper.style.position = 'relative';
                charWrapper.style.verticalAlign = 'baseline';
                charWrapper.style.lineHeight = '1';
                charWrapper.style.marginRight = '0.04em';
                
                const front = document.createElement('span');
                front.className = 'flip-char-front';
                front.style.position = 'absolute';
                front.style.top = '0';
                front.style.left = '0';
                front.style.width = '100%';
                front.style.height = '100%';
                front.style.display = 'flex';
                front.style.alignItems = 'center';
                front.style.justifyContent = 'center';
                front.style.opacity = '0';
                front.style.transform = 'scale(0) rotate(-90deg)';
                
                const back = document.createElement('span');
                back.className = 'flip-char-back';
                back.style.position = 'relative';
                back.style.display = 'inline-block';
                back.textContent = char;
                
                charWrapper.appendChild(front);
                charWrapper.appendChild(back);
                el.appendChild(charWrapper);
                
                // Assign unique animation types sequentially
                const animType = animTypes[index % animTypes.length];
                
                // Enable strict overflow masking only on sliding and wiping elements to avoid clipping 3D rotation
                if (animType === 'slide-y' || animType === 'wipe-x') {
                    charWrapper.style.overflow = 'hidden';
                }
                
                charWrappers.push({ wrapper: charWrapper, front, back, animType });
                allWrappers.push(charWrapper);
            }
        });

        // Smooth flip helper with unique animation styles per character
        function flipCharacter(target) {
            if (target.isAnimating) return;
            target.isAnimating = true;
            
            const randShape = shapes[Math.floor(Math.random() * shapes.length)];
            target.front.innerHTML = randShape;
            
            const tl = gsap.timeline({ onComplete: () => { target.isAnimating = false; }});
            const type = target.animType;
            
            // Calm, fluid transitions to avoid "glitch" aesthetic
            const durationIn = 0.28;
            const holdDuration = 0.8;
            const durationOut = 0.28;

            if (type === 'slide-y') {
                gsap.set(target.front, { yPercent: -100, xPercent: 0, scale: 1, rotation: 0, opacity: 1 });
                gsap.set(target.back, { yPercent: 0, xPercent: 0, scale: 1, rotation: 0, opacity: 1 });
                
                tl.to(target.back, { yPercent: 100, duration: durationIn, ease: "power2.inOut" })
                  .to(target.front, { yPercent: 0, duration: durationIn, ease: "power2.inOut" }, "<")
                  .to({}, { duration: holdDuration })
                  .to(target.front, { yPercent: -100, duration: durationOut, ease: "power2.inOut" })
                  .to(target.back, { yPercent: 0, duration: durationOut, ease: "power2.inOut" }, "<")
                  .set(target.front, { opacity: 0 });
            } 
            else if (type === 'flip-x') {
                gsap.set(target.front, { rotateX: -90, scale: 1, rotation: 0, opacity: 0, yPercent: 0, xPercent: 0 });
                gsap.set(target.back, { rotateX: 0, scale: 1, rotation: 0, opacity: 1, yPercent: 0, xPercent: 0 });
                
                tl.to(target.back, { rotateX: 90, duration: durationIn, ease: "power2.inOut" })
                  .set(target.back, { opacity: 0 })
                  .set(target.front, { opacity: 1 })
                  .to(target.front, { rotateX: 0, duration: durationIn, ease: "power2.out" })
                  .to({}, { duration: holdDuration })
                  .to(target.front, { rotateX: -90, duration: durationOut, ease: "power2.inOut" })
                  .set(target.front, { opacity: 0 })
                  .set(target.back, { opacity: 1 })
                  .to(target.back, { rotateX: 0, duration: durationOut, ease: "power2.out" });
            } 
            else if (type === 'spin-scale') {
                gsap.set(target.front, { scale: 0, rotation: -45, opacity: 0, yPercent: 0, xPercent: 0 });
                gsap.set(target.back, { scale: 1, rotation: 0, opacity: 1, yPercent: 0, xPercent: 0 });
                
                tl.to(target.back, { scale: 0, rotation: 45, duration: durationIn, ease: "power2.inOut" })
                  .set(target.back, { opacity: 0 })
                  .set(target.front, { opacity: 1 })
                  .to(target.front, { scale: 1, rotation: 0, duration: durationIn, ease: "power2.out" })
                  .to({}, { duration: holdDuration })
                  .to(target.front, { scale: 0, rotation: -45, duration: durationOut, ease: "power2.inOut" })
                  .set(target.front, { opacity: 0 })
                  .set(target.back, { opacity: 1 })
                  .to(target.back, { scale: 1, rotation: 0, duration: durationOut, ease: "power2.out" });
            } 
            else if (type === 'wipe-x') {
                gsap.set(target.front, { xPercent: 100, yPercent: 0, scale: 1, rotation: 0, opacity: 1 });
                gsap.set(target.back, { xPercent: 0, yPercent: 0, scale: 1, rotation: 0, opacity: 1 });
                
                tl.to(target.back, { xPercent: -100, duration: durationIn, ease: "power2.inOut" })
                  .to(target.front, { xPercent: 0, duration: durationIn, ease: "power2.inOut" }, "<")
                  .to({}, { duration: holdDuration })
                  .set(target.back, { xPercent: 100 }) // Position back of box to wipe left back in
                  .to(target.front, { xPercent: -100, duration: durationOut, ease: "power2.inOut" })
                  .to(target.back, { xPercent: 0, duration: durationOut, ease: "power2.inOut" }, "<")
                  .set(target.front, { opacity: 0 });
            } 
            else if (type === 'fade-morph') {
                // Calm cross-dissolve with scale/rotations
                gsap.set(target.front, { scale: 0.8, rotation: 15, opacity: 0, yPercent: 0, xPercent: 0 });
                gsap.set(target.back, { scale: 1, rotation: 0, opacity: 1, yPercent: 0, xPercent: 0 });
                
                tl.to(target.back, { opacity: 0, scale: 0.8, duration: durationIn, ease: "power2.inOut" })
                  .to(target.front, { opacity: 1, scale: 1, rotation: 0, duration: durationIn, ease: "power2.inOut" }, "<")
                  .to({}, { duration: holdDuration })
                  .to(target.front, { opacity: 0, scale: 0.8, rotation: -15, duration: durationOut, ease: "power2.inOut" })
                  .to(target.back, { opacity: 1, scale: 1, rotation: 0, duration: durationOut, ease: "power2.inOut" }, "<");
            }
        }

        if (charWrappers.length > 0) {
            if (!el.closest('header')) {
                // Set initial state: off-screen top and invisible
                gsap.set(allWrappers, { y: -100, opacity: 0 });
 
                // 1. Fall from top and bounce lock into place (duration: 0.4s, stagger: 0.012s, total ~0.5s)
                gsap.to(allWrappers, {
                    y: 0,
                    opacity: 1,
                    duration: 0.4,
                    stagger: 0.012,
                    ease: "bounce.out",
                    delay: 0.05
                });
            } else {
                // For header logo, just slide up and fade in nicely
                gsap.from(allWrappers, {
                    y: 15,
                    opacity: 0,
                    duration: 0.4,
                    stagger: 0.02,
                    ease: "power3.out",
                    delay: 0.05
                });
            }
 
            // 2. Loop kicks off after the drop animation completes (~1.0s total delay to let things settle)
            // It selects random letters but strictly avoids adjacent characters to prevent overlap clusters.
            el.flipIntervalId = setInterval(() => {
                const numToFlip = Math.random() > 0.5 ? 2 : 1;
                for (let i = 0; i < numToFlip; i++) {
                    setTimeout(() => {
                        let randIndex;
                        let attempts = 0;
                        do {
                            randIndex = Math.floor(Math.random() * charWrappers.length);
                            attempts++;
                        } while (
                            (charWrappers[randIndex].isAnimating || 
                             (randIndex > 0 && charWrappers[randIndex - 1].isAnimating) || 
                             (randIndex < charWrappers.length - 1 && charWrappers[randIndex + 1].isAnimating)) && 
                            attempts < 15
                        );
                        
                        if (attempts < 15) {
                            flipCharacter(charWrappers[randIndex]);
                        }
                    }, i * 180);
                }
            }, 1800);
        }
    }

    // Initialize global flag to stop all morph animations after 5 seconds
    window.stopMorphAnimations = false;
    
    setTimeout(() => {
        window.stopMorphAnimations = true;
        document.querySelectorAll('.gsap-split-portfolio').forEach((el) => {
            if (el.flipIntervalId) {
                clearInterval(el.flipIntervalId);
            }
        });
    }, 5000);

    const portfolioFlipElements = document.querySelectorAll('.gsap-split-portfolio');
    portfolioFlipElements.forEach((el) => {
        setupSplitPortfolioElement(el);
    });
});

// Refresh ScrollTrigger after fonts and all media assets load completely to prevent overlap bugs
window.addEventListener('load', () => {
    ScrollTrigger.refresh(true);
});
if (document.fonts) {
    document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
    });
}
