document.addEventListener("DOMContentLoaded", () => {
  // Device detection and performance optimization
  const isMobile = window.innerWidth <= 768;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Portfolio data - will be loaded from JSON
  let portfolioData = null;
  let currentSectionIndex = 0;
  let currentMediaIndex = 0;

  // Intersection Observer for lazy loading and performance
  const observerOptions = {
    rootMargin: '50px',
    threshold: 0.1
  };
  
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const imgItem = entry.target;
        const img = imgItem.querySelector('img');
        if (img && img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imgItem.classList.remove('loading');
          imageObserver.unobserve(imgItem);
        }
      }
    });
  }, observerOptions);
  
  // Load portfolio data from JSON
  async function loadPortfolioData() {
    try {
      const response = await fetch('data/portfolio.json');
      portfolioData = await response.json();
      return portfolioData;
    } catch (error) {
      console.error('Failed to load portfolio data:', error);
      // Fallback to hardcoded data if JSON fails
      return null;
    }
  }
  
  // Create image item element
  function createImageItem(mediaItem, index) {
    const imgItem = document.createElement('div');
    imgItem.className = 'img-item loading';
    imgItem.innerHTML = `
      <img data-src="${mediaItem.src}" alt="${mediaItem.title}" loading="lazy">
      <div class="img-overlay">
        <div class="img-title">${mediaItem.title}</div>
        <div class="img-description">${mediaItem.description}</div>
        ${mediaItem.tags && mediaItem.tags.length ? `
          <div class="img-tags">
            ${mediaItem.tags.map(tag => `<span class="img-tag">${tag}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    `;
    
    // Add click handler for fullscreen view (future feature)
    imgItem.addEventListener('click', () => {
      // Could implement lightbox/fullscreen view here
      console.log('Clicked image:', mediaItem.title);
    });
    
    return imgItem;
  }
  
  // Distribute media items across columns
  function distributeMediaAcrossColumns(media) {
    const col1 = document.getElementById('col1');
    const col2 = document.getElementById('col2');
    const col3 = document.getElementById('col3');
    
    // Clear existing content
    [col1, col2, col3].forEach(col => {
      if (col) col.innerHTML = '';
    });
    
    if (!media || media.length === 0) return;
    
    // Distribute items across 3 columns in a balanced way
    media.forEach((mediaItem, index) => {
      const imgItem = createImageItem(mediaItem, index);
      
      // Distribute across columns
      const columnIndex = index % 3;
      const targetCol = columnIndex === 0 ? col1 : columnIndex === 1 ? col2 : col3;
      
      if (targetCol) {
        targetCol.appendChild(imgItem);
        // Start observing for lazy loading
        imageObserver.observe(imgItem);
      }
    });
  }
  
  // Update main columns with selected section media
  function updateMainColumns(sectionIndex) {
    if (!portfolioData || !portfolioData.gallery.sections[sectionIndex]) {
      console.warn('Portfolio data not loaded or section not found');
      return;
    }
    
    currentSectionIndex = sectionIndex;
    const section = portfolioData.gallery.sections[sectionIndex];
    const media = section.media || [];
    
    // Update navigation active state
    document.querySelectorAll('.nav-item').forEach((item, index) => {
      item.classList.toggle('active', index === sectionIndex);
    });
    
    // Distribute media across columns
    distributeMediaAcrossColumns(media);
  }
  
  // Generate navigation items from portfolio data
  function generateNavigation() {
    if (!portfolioData) return;
    
    const navContainer = document.querySelector('.nav-container');
    if (!navContainer) return;
    
    // Clear existing nav items
    navContainer.innerHTML = '';
    
    portfolioData.gallery.sections.forEach((section, index) => {
      const navItem = document.createElement('div');
      navItem.className = 'nav-item';
      navItem.dataset.section = index;
      navItem.textContent = section.title;
      
      // Add click handler
      navItem.addEventListener('click', () => {
        updateMainColumns(index);
      });
      
      navContainer.appendChild(navItem);
    });
    
    // Set first section as active
    if (portfolioData.gallery.sections.length > 0) {
      updateMainColumns(0);
    }
  }
  
  // Initialize smooth scrolling with Lenis (if available)
  function initSmoothScrolling() {
    if (typeof Lenis !== 'undefined' && !isMobile && !prefersReducedMotion) {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
      });

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }
  
  // Initialize GSAP ScrollTrigger animations (if available)
  function initScrollAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (prefersReducedMotion) return;
    
    gsap.registerPlugin(ScrollTrigger);
    
    // Animate image items as they come into view
    gsap.utils.toArray('.img-item').forEach((item, index) => {
      gsap.fromTo(item, 
        {
          y: 100,
          opacity: 0,
          scale: 0.8
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          delay: index * 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: item,
            start: "top 90%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });
    
    // Animate navigation items
    gsap.fromTo('.nav-item', 
      {
        x: -50,
        opacity: 0
      },
      {
        x: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.3
      }
    );
  }
  
  // Handle keyboard navigation
  function initKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      if (!portfolioData) return;
      
      const totalSections = portfolioData.gallery.sections.length;
      
      switch(e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          currentSectionIndex = (currentSectionIndex + 1) % totalSections;
          updateMainColumns(currentSectionIndex);
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          currentSectionIndex = currentSectionIndex === 0 ? totalSections - 1 : currentSectionIndex - 1;
          updateMainColumns(currentSectionIndex);
          break;
        case 'Home':
          e.preventDefault();
          updateMainColumns(0);
          break;
        case 'End':
          e.preventDefault();
          updateMainColumns(totalSections - 1);
          break;
      }
    });
  }
  
  // Handle window resize
  function handleResize() {
    // Reinitialize ScrollTrigger on resize
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  }
  
  // Initialize everything
  async function init() {
    try {
      // Load portfolio data
      await loadPortfolioData();
      
      if (!portfolioData) {
        console.error('Failed to load portfolio data');
        return;
      }
      
      // Generate navigation and content
      generateNavigation();
      
      // Initialize features
      initSmoothScrolling();
      initKeyboardNavigation();
      
      // Add resize handler
      window.addEventListener('resize', handleResize);
      
      // Initialize animations after a short delay to ensure DOM is ready
      setTimeout(() => {
        initScrollAnimations();
      }, 100);
      
      console.log('Gallery initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize gallery:', error);
    }
  }
  
  // Start initialization
  init();
});