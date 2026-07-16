document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.slide');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const currentIndicator = document.querySelector('.current-indicator');
  const totalIndicator = document.querySelector('.total-indicator');
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  
  let currentSlideIndex = 0;
  const totalSlides = slides.length;
  
  // Set total slide count
  totalIndicator.textContent = totalSlides;

  // Function to navigate to a specific slide index
  function goToSlide(index) {
    if (index < 0 || index >= totalSlides) return;
    
    // Remove active class from current slide
    slides[currentSlideIndex].classList.remove('active');
    
    // Set new index
    currentSlideIndex = index;
    
    // Add active class to new slide
    slides[currentSlideIndex].classList.add('active');
    
    // Update navigation controls & indicator
    currentIndicator.textContent = currentSlideIndex + 1;
    
    // Scroll content inside slide back to top if it overflowed
    const activeContent = slides[currentSlideIndex].querySelector('.slide-content');
    if (activeContent) {
      activeContent.scrollTop = 0;
    }
  }

  // Next slide helper
  function nextSlide() {
    if (currentSlideIndex < totalSlides - 1) {
      goToSlide(currentSlideIndex + 1);
    }
  }

  // Previous slide helper
  function prevSlide() {
    if (currentSlideIndex > 0) {
      goToSlide(currentSlideIndex - 1);
    }
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowRight':
      case ' ': // Spacebar
      case 'PageDown':
        e.preventDefault();
        nextSlide();
        break;
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault();
        prevSlide();
        break;
      case 'Home':
        e.preventDefault();
        goToSlide(0);
        break;
      case 'End':
        e.preventDefault();
        goToSlide(totalSlides - 1);
        break;
      case 'f':
      case 'F':
        e.preventDefault();
        toggleFullscreen();
        break;
    }
  });

  // Mouse controls
  nextBtn.addEventListener('click', nextSlide);
  prevBtn.addEventListener('click', prevSlide);

  // Fullscreen support
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }

  fullscreenBtn.addEventListener('click', toggleFullscreen);

  // Dynamic status indicators inside breathing circle
  const breathingCore = document.querySelector('.breathing-circle-core');
  if (breathingCore) {
    const phases = ["Inhale", "Hold", "Exhale", "Hold"];
    let phaseIndex = 0;
    setInterval(() => {
      phaseIndex = (phaseIndex + 1) % phases.length;
      breathingCore.textContent = phases[phaseIndex];
    }, 4000); // Transitions every 4 seconds, matching CSS box breathing keyframe loops
  }

  // Interactive Pain Points cards on Slide 2
  const painCards = document.querySelectorAll('.pain-card');
  painCards.forEach(card => {
    card.addEventListener('click', () => {
      painCards.forEach(c => c.classList.remove('accent-card'));
      card.classList.add('accent-card');
    });
  });
});

