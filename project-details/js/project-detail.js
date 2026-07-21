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
    syncPrototypeIframeScale();

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
} // END initProjectStorytelling

// ==========================================================================
// PROPORTIONAL IFRAME SCALE SYNCHRONIZER (EXACT 1-TO-1 PERFECT FIT)
// ==========================================================================
function syncPrototypeIframeScale() {
    document.querySelectorAll('.iphone13-mockup-wrapper, .restease-mockup-wrapper').forEach(wrapper => {
        const currentWidth = wrapper.getBoundingClientRect().width;
        if (!currentWidth || currentWidth === 0) return;
        
        // Exact 1-to-1 scale ratio matching 400px base phone frame
        const scaleRatio = currentWidth / 400;
        
        const iframe = wrapper.querySelector('iframe');
        if (iframe) {
            if (Math.abs(scaleRatio - 1) > 0.005) {
                const inversePct = (100 / scaleRatio).toFixed(3);
                iframe.style.width = inversePct + '%';
                iframe.style.height = inversePct + '%';
                iframe.style.transform = 'scale(' + scaleRatio.toFixed(4) + ')';
                iframe.style.transformOrigin = 'top left';
            } else {
                iframe.style.width = '100%';
                iframe.style.height = '100%';
                iframe.style.transform = 'none';
            }
        }
    });
}

window.addEventListener('resize', syncPrototypeIframeScale);
window.addEventListener('load', syncPrototypeIframeScale);
document.addEventListener('DOMContentLoaded', syncPrototypeIframeScale);
if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.addEventListener('refresh', syncPrototypeIframeScale);
}
