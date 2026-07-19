document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);
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

});