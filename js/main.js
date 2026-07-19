/* ==========================================================================
   MAIN INTERACTION SCRIPT
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    // Scroll restoration & GSAP plugin registration
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    gsap.registerPlugin(ScrollTrigger);


});
