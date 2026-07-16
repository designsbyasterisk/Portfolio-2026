/* ==========================================================================
   PLAYFUL GSAP CUSTOM CURSOR
   Uses GSAP's high-performance quickTo helper for buttery-smooth mouse lag
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Disable custom cursor on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) {
        return;
    }

    // Create cursor elements in DOM
    const cursorBubble = document.createElement('div');
    const cursorTrail = document.createElement('div');
    
    cursorBubble.className = 'cursor-playful';
    cursorTrail.className = 'cursor-trail';
    
    document.body.appendChild(cursorBubble);
    document.body.appendChild(cursorTrail);

    // Initial state: hide cursor elements until mouse moves
    gsap.set([cursorBubble, cursorTrail], { opacity: 0, xPercent: -50, yPercent: -50 });

    // GSAP quickTo setup (extremely optimized for high frequency updates like mousemoves)
    const xToBubble = gsap.quickTo(cursorBubble, "x", { duration: 0.15, ease: "power2.out" });
    const yToBubble = gsap.quickTo(cursorBubble, "y", { duration: 0.15, ease: "power2.out" });

    const xToTrail = gsap.quickTo(cursorTrail, "x", { duration: 0.45, ease: "power3.out" });
    const yToTrail = gsap.quickTo(cursorTrail, "y", { duration: 0.45, ease: "power3.out" });

    let isVisible = false;

    window.addEventListener('mousemove', (e) => {
        if (!isVisible) {
            gsap.to([cursorBubble, cursorTrail], { opacity: 1, duration: 0.3 });
            isVisible = true;
        }

        // Direct position update using quickTo
        xToBubble(e.clientX);
        yToBubble(e.clientY);

        xToTrail(e.clientX);
        yToTrail(e.clientY);
    });

    // Fade out when leaving the browser window
    document.addEventListener('mouseleave', () => {
        gsap.to([cursorBubble, cursorTrail], { opacity: 0, duration: 0.3 });
        isVisible = false;
    });

    // Interactive Hover binds
    const bindHoverEffects = () => {
        const hoverables = document.querySelectorAll(
            'a, button, .btn-pop, .pill-tag, .bento-card, .jigsaw-item, .theme-picker-dot, .interactive-item'
        );

        hoverables.forEach((el) => {
            el.addEventListener('mouseenter', () => {
                cursorBubble.classList.add('hovering');
                // Expand main bubble and scale down trail dot using GSAP
                gsap.to(cursorBubble, { scale: 1, duration: 0.25, ease: "power2.out" });
                gsap.to(cursorTrail, { scale: 0, duration: 0.2, ease: "power2.in" });
            });

            el.addEventListener('mouseleave', () => {
                cursorBubble.classList.remove('hovering');
                // Revert sizes using GSAP
                gsap.to(cursorBubble, { scale: 1, duration: 0.25, ease: "power2.out" });
                gsap.to(cursorTrail, { scale: 1, duration: 0.2, ease: "power2.out" });
            });
        });
    };

    // Initialize hover bindings
    bindHoverEffects();

    // Re-bind when dynamic nodes are added/modified
    const observer = new MutationObserver(() => {
        bindHoverEffects();
    });
    observer.observe(document.body, { childList: true, subtree: true });
});
