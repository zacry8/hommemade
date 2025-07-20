document.addEventListener("DOMContentLoaded", () => {
  // Device detection and performance optimization
  const isMobile = window.innerWidth <= 768;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Smart Image Optimization System - Future-proof with fallback
  class SmartImage {
    static getOptimizedUrl(originalSrc, options = {}) {
      const { width = 800, quality = 75, format = 'auto' } = options;
      
      // Check if we're on Vercel or production domain
      if (this.hasVercelOptimization()) {
        return `/_vercel/image?url=${encodeURIComponent(originalSrc)}&w=${width}&q=${quality}`;
      }
      
      // Future: Add other CDN optimizations here
      // if (this.hasCloudinary()) return this.getCloudinaryUrl(originalSrc, options);
      // if (this.hasNetlify()) return this.getNetlifyUrl(originalSrc, options);
      
      // Fallback to original - always works
      return originalSrc;
    }
    
    static hasVercelOptimization() {
      const hostname = window.location.hostname;
      // Check for Vercel domains or your production domain
      return hostname.includes('vercel.app') || 
             hostname.includes('hommemade') || // Your domain
             hostname === 'localhost' || // Local testing
             process?.env?.VERCEL === '1'; // Vercel environment
    }
    
    static getResponsiveSrcSet(originalSrc, options = {}) {
      const { quality = 75 } = options;
      const sizes = [400, 800, 1200, 1600];
      
      return sizes.map(size => 
        `${this.getOptimizedUrl(originalSrc, { width: size, quality })} ${size}w`
      ).join(', ');
    }
    
    static getResponsiveSizes() {
      return "(max-width: 480px) 400px, (max-width: 768px) 800px, (max-width: 1200px) 1200px, 1600px";
    }
  }
  
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
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
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
  
  // Get all portfolio items for smooth navigation
  function getAllPortfolioItems() {
    if (!portfolioData) return [];
    
    const allItems = [];
    portfolioData.gallery.sections.forEach(section => {
      section.media.forEach(mediaItem => {
        allItems.push({
          ...mediaItem,
          section: section.title,
          sectionId: section.id
        });
      });
    });
    return allItems;
  }
  
  // Update only Column 1 (left) with portfolio items based on scroll position
  function updateMainColumns(scrollProgress) {
    const allItems = getAllPortfolioItems();
    if (allItems.length === 0) return;
    
    // Calculate which items to show based on scroll position
    const itemsPerView = 3; // Only Column 1 items
    const startIndex = Math.floor(scrollProgress * (allItems.length - itemsPerView + 1));
    
    // Get only Column 1 (left) images
    const leftColumnImages = document.querySelectorAll('.col-left img');
    
    leftColumnImages.forEach((img, index) => {
      const itemIndex = startIndex + index;
      const mediaItem = allItems[itemIndex % allItems.length];
      
      if (mediaItem) {
        img.style.transition = 'opacity 0.3s ease';
        img.style.opacity = '0.7';
        
        setTimeout(() => {
          // Use smart optimization for dynamic content updates
          img.srcset = SmartImage.getResponsiveSrcSet(mediaItem.src, { quality: 80 });
          img.sizes = SmartImage.getResponsiveSizes();
          img.src = SmartImage.getOptimizedUrl(mediaItem.src, { width: 800, quality: 80 });
          img.alt = mediaItem.title;
          img.dataset.title = mediaItem.title;
          img.dataset.description = mediaItem.description;
          img.style.opacity = '1';
        }, 150);
      }
    });
    
    // Update navigation active state based on current section
    if (allItems[startIndex]) {
      const currentSectionId = allItems[startIndex].sectionId;
      const navItems = document.querySelectorAll(".nav-item");
      let activeSectionIndex = 0;
      
      navItems.forEach((item, i) => {
        const section = portfolioData.gallery.sections[i];
        if (section && section.id === currentSectionId) {
          item.classList.add("active");
          activeSectionIndex = i;
        } else {
          item.classList.remove("active");
        }
      });
      
      // Update right columns with current folder content
      generateFolderRightColumns(activeSectionIndex);
    }
  }
  
  // Initialize lazy loading for images
  function initLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    if ('IntersectionObserver' in window) {
      images.forEach(img => {
        imageObserver.observe(img);
      });
    }
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
      
      const img = document.createElement('img');
      // Smaller images for navigation thumbnails
      img.src = SmartImage.getOptimizedUrl(section.thumbnail, { width: 200, quality: 85 });
      img.alt = section.title;
      img.loading = 'lazy';
      img.decoding = 'async';
      
      const label = document.createElement('span');
      label.className = 'nav-label';
      label.textContent = section.title;
      
      navItem.appendChild(img);
      navItem.appendChild(label);
      navContainer.appendChild(navItem);
    });
  }
  
  // Generate main gallery content from portfolio data
  function generateGalleryContent() {
    if (!portfolioData) return;
    
    // Only populate the left column - right columns get static content
    const leftColumn = document.querySelector('#col1');
    
    // Clear existing content
    if (leftColumn) {
      leftColumn.innerHTML = '';
    }
    
    // Create placeholder items for left column (will be updated by updateMainColumns)
    if (leftColumn) {
      for (let i = 0; i < 3; i++) {
        const imgItem = document.createElement('div');
        imgItem.className = 'img-item';
        
        const img = document.createElement('img');
        img.src = '';
        img.alt = 'Portfolio item';
        img.loading = 'lazy';
        img.decoding = 'async';
        
        // Add hover overlay
        const overlay = document.createElement('div');
        overlay.className = 'img-overlay';
        
        const overlayTitle = document.createElement('div');
        overlayTitle.className = 'img-overlay-title';
        
        const overlayDescription = document.createElement('div');
        overlayDescription.className = 'img-overlay-description';
        
        overlay.appendChild(overlayTitle);
        overlay.appendChild(overlayDescription);
        
        imgItem.appendChild(img);
        imgItem.appendChild(overlay);
        leftColumn.appendChild(imgItem);
        
        // Add click handler for modal
        imgItem.addEventListener('click', () => {
          if (img.src && img.dataset.title) {
            openImageModal(img.src, img.dataset.title, img.dataset.description);
          }
        });
      }
    }
  }
  
  // Generate folder-specific content for right columns (Columns 3 & 4)
  function generateFolderRightColumns(sectionIndex = 0) {
    if (!portfolioData || !portfolioData.gallery.sections[sectionIndex]) return;
    
    const rightColumn1 = document.querySelector('#col2');
    const rightColumn2 = document.querySelector('#col3');
    const section = portfolioData.gallery.sections[sectionIndex];
    const folderItems = section.media || [];
    
    // Clear existing content
    if (rightColumn1) rightColumn1.innerHTML = '';
    if (rightColumn2) rightColumn2.innerHTML = '';
    
    // Populate right columns with current folder's content
    folderItems.forEach((mediaItem, index) => {
      // Alternate between the two right columns
      const targetColumn = index % 2 === 0 ? rightColumn1 : rightColumn2;
      if (!targetColumn) return;
      
      const imgItem = document.createElement('div');
      imgItem.className = 'img-item';
      imgItem.dataset.section = sectionIndex;
      
      // Handle different media types
      if (mediaItem.type === 'video') {
        const video = document.createElement('video');
        video.src = mediaItem.src;
        video.alt = mediaItem.title;
        video.setAttribute('playsinline', '');
        video.muted = true;
        video.loop = true;
        video.controls = false;
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'cover';
        
        // Auto-play on hover for desktop
        if (!isMobile) {
          imgItem.addEventListener('mouseenter', () => video.play());
          imgItem.addEventListener('mouseleave', () => video.pause());
        }
        
        imgItem.appendChild(video);
      } else if (mediaItem.type === 'pdf') {
        // Create PDF preview container
        const pdfContainer = document.createElement('div');
        pdfContainer.className = 'pdf-preview';
        
        // PDF icon and title
        pdfContainer.innerHTML = `
          <div class="pdf-icon">📄</div>
          <div class="pdf-title">${mediaItem.title}</div>
          <div class="pdf-subtitle">PDF Document</div>
        `;
        
        // Click to open PDF
        pdfContainer.addEventListener('click', () => {
          window.open(mediaItem.src, '_blank');
        });
        
        imgItem.appendChild(pdfContainer);
      } else {
        // Default to image with smart optimization
        const img = document.createElement('img');
        img.srcset = SmartImage.getResponsiveSrcSet(mediaItem.src, { quality: 80 });
        img.sizes = SmartImage.getResponsiveSizes();
        img.src = SmartImage.getOptimizedUrl(mediaItem.src, { width: 800, quality: 80 });
        img.alt = mediaItem.title;
        img.loading = 'lazy';
        img.decoding = 'async';
        imgItem.appendChild(img);
        
        // Add click handler for modal
        imgItem.addEventListener('click', () => {
          openImageModal(mediaItem.src, mediaItem.title, mediaItem.description);
        });
      }
      
      // Add hover overlay for all types
      const overlay = document.createElement('div');
      overlay.className = 'img-overlay';
      
      const overlayTitle = document.createElement('div');
      overlayTitle.className = 'img-overlay-title';
      overlayTitle.textContent = mediaItem.title;
      
      const overlayDescription = document.createElement('div');
      overlayDescription.className = 'img-overlay-description';
      overlayDescription.textContent = mediaItem.description;
      
      const overlayTags = document.createElement('div');
      overlayTags.className = 'img-overlay-tags';
      if (mediaItem.tags && mediaItem.tags.length > 0) {
        mediaItem.tags.slice(0, 3).forEach(tag => { // Show max 3 tags
          const tagElement = document.createElement('span');
          tagElement.className = 'img-overlay-tag';
          tagElement.textContent = tag;
          overlayTags.appendChild(tagElement);
        });
      }
      
      overlay.appendChild(overlayTitle);
      overlay.appendChild(overlayDescription);
      if (mediaItem.tags && mediaItem.tags.length > 0) {
        overlay.appendChild(overlayTags);
      }
      
      imgItem.appendChild(overlay);
      targetColumn.appendChild(imgItem);
    });
  }
  
  // Fallback navigation system
  function initBasicNavigation() {
    const navItems = document.querySelectorAll(".nav-item");
    
    navItems.forEach((item, i) => {
      item.addEventListener("click", () => {
        // Update main columns immediately
        updateMainColumns(i);
        
        // Then scroll to section
        const targetY = i * window.innerHeight;
        window.scrollTo({
          top: targetY,
          behavior: 'smooth'
        });
      });
    });
    
    // Basic scroll highlighting
    function updateNav() {
      const scrollPos = window.scrollY;
      const viewportHeight = window.innerHeight;
      const section = Math.min(
        Math.floor((scrollPos + viewportHeight * 0.4) / viewportHeight),
        navItems.length - 1
      );
      
      // Update main columns to match scroll position
      updateMainColumns(section);
      
      navItems.forEach((item, i) => {
        if (i === section) {
          item.classList.add("active");
        } else {
          item.classList.remove("active");
        }
      });
    }
    
    window.addEventListener("scroll", updateNav);
    updateNav();
  }
  
  // Enhanced system with mobile optimizations
  function initEnhancedSystem() {
    // Mobile-optimized Lenis configuration
    const lenisConfig = {
      duration: isMobile ? 1.0 : 1.8,
      easing: isMobile ? (t) => t : (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
      direction: "vertical",
      smooth: !isMobile, // Disable smooth scroll on mobile for better performance
      mouseMultiplier: isMobile ? 0.8 : 1.2,
      touchMultiplier: isMobile ? 1.5 : 2,
      wheelMultiplier: isMobile ? 0.5 : 1
    };
    
    const lenis = new Lenis(lenisConfig);
    
    gsap.registerPlugin(ScrollTrigger);
    
    // Only setup Lenis integration if not mobile
    if (!isMobile) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }
    
    const col1 = document.getElementById("col1");
    const col2 = document.getElementById("col2");
    const col3 = document.getElementById("col3");
    const navItems = document.querySelectorAll(".nav-item");
    const sections = navItems.length;
    
    
    
    window.addEventListener("scroll", updateNav);
    updateNav();
    
    // Add swipe gesture support for mobile
    if (isMobile && isTouchDevice) {
      let startY = 0;
      let currentSection = 0;
      
      document.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
      }, { passive: true });
      
      document.addEventListener('touchend', (e) => {
        const endY = e.changedTouches[0].clientY;
        const deltaY = startY - endY;
        const threshold = 50;
        
        if (Math.abs(deltaY) > threshold) {
          if (deltaY > 0 && currentSection < sections - 1) {
            // Swipe up - next section
            currentSection++;
          } else if (deltaY < 0 && currentSection > 0) {
            // Swipe down - previous section
            currentSection--;
          }
          
          updateMainColumns(currentSection);
          window.scrollTo({
            top: currentSection * window.innerHeight,
            behavior: 'smooth'
          });
        }
      }, { passive: true });
    }
    
    window.addEventListener("resize", () => {
      if (!isMobile) {
        ScrollTrigger.refresh();
      }
      updateNav();
    });
  }
  
  // Image Modal Functionality
  let currentImageIndex = 0;
  let currentImages = [];
  
  function openImageModal(src, title, description) {
    // Build array of all images for navigation
    currentImages = [];
    portfolioData.gallery.sections.forEach(section => {
      section.media.forEach(media => {
        if (media.type !== 'video' && media.type !== 'pdf') {
          currentImages.push(media);
        }
      });
    });
    
    // Find current image index
    currentImageIndex = currentImages.findIndex(img => img.src === src);
    
    showImageModal(src, title, description);
  }
  
  function showImageModal(src, title, description) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    
    // Use high-quality optimization for modal images
    modalImage.srcset = SmartImage.getResponsiveSrcSet(src, { quality: 90 });
    modalImage.sizes = SmartImage.getResponsiveSizes();
    modalImage.src = SmartImage.getOptimizedUrl(src, { width: 1200, quality: 90 });
    modalImage.alt = title;
    modalTitle.textContent = title;
    modalDescription.textContent = description;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Reset zoom
    modalImage.classList.remove('zoomed');
    modalImage.style.transform = '';
  }
  
  function closeImageModal() {
    const modal = document.getElementById('imageModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  function navigateModal(direction) {
    if (currentImages.length === 0) return;
    
    currentImageIndex += direction;
    if (currentImageIndex < 0) currentImageIndex = currentImages.length - 1;
    if (currentImageIndex >= currentImages.length) currentImageIndex = 0;
    
    const currentImage = currentImages[currentImageIndex];
    showImageModal(currentImage.src, currentImage.title, currentImage.description);
  }
  
  // Calculate optimal zoom based on image dimensions and aspect ratio
  function calculateOptimalZoom(imageElement) {
    const imageRect = imageElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Calculate aspect ratios
    const imageAspectRatio = imageRect.width / imageRect.height;
    const viewportAspectRatio = viewportWidth / viewportHeight;
    
    // Calculate how much of the viewport the image currently occupies
    const widthRatio = imageRect.width / viewportWidth;
    const heightRatio = imageRect.height / viewportHeight;
    const currentOccupancy = Math.max(widthRatio, heightRatio);
    
    let optimalZoom;
    
    // Dynamic zoom based on image characteristics
    if (imageAspectRatio > 2.0) {
      // Very wide images (panoramic) - conservative zoom
      optimalZoom = 1.4;
    } else if (imageAspectRatio < 0.6) {
      // Very tall images (portrait) - moderate zoom
      optimalZoom = 1.7;
    } else if (imageAspectRatio >= 0.8 && imageAspectRatio <= 1.2) {
      // Square-ish images - standard zoom
      optimalZoom = 2.0;
    } else if (imageAspectRatio > 1.2 && imageAspectRatio <= 2.0) {
      // Landscape images - balanced zoom
      optimalZoom = 1.6;
    } else {
      // Default case
      optimalZoom = 1.8;
    }
    
    // Adjust zoom based on current size
    if (currentOccupancy < 0.3) {
      // Small images can zoom more
      optimalZoom = Math.min(optimalZoom * 1.4, 3.0);
    } else if (currentOccupancy > 0.8) {
      // Large images should zoom less
      optimalZoom = Math.max(optimalZoom * 0.7, 1.2);
    }
    
    // Ensure zoom stays within reasonable bounds
    return Math.max(1.2, Math.min(3.0, optimalZoom));
  }

  // Modal event listeners
  function initModalListeners() {
    const modal = document.getElementById('imageModal');
    const modalBackdrop = modal.querySelector('.modal-backdrop');
    const modalClose = modal.querySelector('.modal-close');
    const modalPrev = modal.querySelector('.modal-prev');
    const modalNext = modal.querySelector('.modal-next');
    const modalImage = document.getElementById('modalImage');
    
    // Close modal
    modalBackdrop.addEventListener('click', closeImageModal);
    modalClose.addEventListener('click', closeImageModal);
    
    // Navigation
    modalPrev.addEventListener('click', () => navigateModal(-1));
    modalNext.addEventListener('click', () => navigateModal(1));
    
    // Image zoom with responsive scaling
    modalImage.addEventListener('click', () => {
      if (modalImage.classList.contains('zoomed')) {
        // Reset zoom
        modalImage.classList.remove('zoomed');
        modalImage.style.transform = '';
      } else {
        // Apply responsive zoom
        const optimalZoom = calculateOptimalZoom(modalImage);
        modalImage.style.transform = `scale(${optimalZoom})`;
        modalImage.classList.add('zoomed');
      }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('active')) return;
      
      switch(e.key) {
        case 'Escape':
          closeImageModal();
          break;
        case 'ArrowLeft':
          navigateModal(-1);
          break;
        case 'ArrowRight':
          navigateModal(1);
          break;
      }
    });
    
    // Touch/wheel zoom support
    if (isTouchDevice) {
      let initialDistance = 0;
      let currentScale = 1;
      
      modalImage.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
          const touch1 = e.touches[0];
          const touch2 = e.touches[1];
          initialDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
          );
        }
      });
      
      modalImage.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
          e.preventDefault();
          const touch1 = e.touches[0];
          const touch2 = e.touches[1];
          const currentDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
          );
          
          const scale = currentDistance / initialDistance;
          currentScale = Math.min(Math.max(scale, 0.5), 3);
          modalImage.style.transform = `scale(${currentScale})`;
        }
      });
    } else {
      // Mouse wheel zoom with responsive baseline
      modalImage.addEventListener('wheel', (e) => {
        e.preventDefault();
        const scale = e.deltaY > 0 ? 0.9 : 1.1;
        const currentTransform = modalImage.style.transform || 'scale(1)';
        const currentScale = parseFloat(currentTransform.match(/scale\(([^)]+)\)/)?.[1] || '1');
        
        // Use responsive zoom as reference point instead of fixed values
        const optimalZoom = calculateOptimalZoom(modalImage);
        const minZoom = 1.0;
        const maxZoom = optimalZoom * 1.5; // Allow zooming beyond optimal by 50%
        
        const newScale = Math.min(Math.max(currentScale * scale, minZoom), maxZoom);
        modalImage.style.transform = `scale(${newScale})`;
      });
    }
  }

  // Initialize the gallery with portfolio data
  async function initializeGallery() {
    // Load portfolio data
    await loadPortfolioData();
    
    if (portfolioData) {
      // Generate dynamic content
      generateNavigation();
      generateGalleryContent(); // Left column placeholders
      generateFolderRightColumns(0); // Start with first folder content for right columns
      
      // Update document title if specified
      if (portfolioData.gallery.title) {
        document.title = `${portfolioData.gallery.title} — Homme Made`;
      }
    }
    
    // Initialize lazy loading
    initLazyLoading();
    
    // Initialize modal listeners
    initModalListeners();
    
    // Initialize scroll isolation for right columns
    initScrollIsolation();
  }
  
  // Isolate right column scroll events from main navigation
  function initScrollIsolation() {
    const rightColumn1 = document.querySelector('.col-right1');
    const rightColumn2 = document.querySelector('.col-right2');
    
    // Prevent right column scroll events from bubbling to main scroll
    if (rightColumn1) {
      rightColumn1.addEventListener('scroll', (e) => {
        e.stopPropagation();
      }, { passive: true });
      
      rightColumn1.addEventListener('wheel', (e) => {
        e.stopPropagation();
      }, { passive: true });
      
      rightColumn1.addEventListener('touchmove', (e) => {
        e.stopPropagation();
      }, { passive: true });
    }
    
    if (rightColumn2) {
      rightColumn2.addEventListener('scroll', (e) => {
        e.stopPropagation();
      }, { passive: true });
      
      rightColumn2.addEventListener('wheel', (e) => {
        e.stopPropagation();
      }, { passive: true });
      
      rightColumn2.addEventListener('touchmove', (e) => {
        e.stopPropagation();
      }, { passive: true });
    }
  }
  
  // Fallback navigation system
  function initBasicNavigation() {
    const navItems = document.querySelectorAll(".nav-item");
    
    navItems.forEach((item, i) => {
      item.addEventListener("click", () => {
        // Update main columns immediately
        updateMainColumns(i);
        
        // Then scroll to section
        const targetY = i * window.innerHeight;
        window.scrollTo({
          top: targetY,
          behavior: 'smooth'
        });
      });
    });
    
    // Basic scroll highlighting
    function updateNav() {
      const scrollPos = window.scrollY;
      const viewportHeight = window.innerHeight;
      const section = Math.min(
        Math.floor((scrollPos + viewportHeight * 0.4) / viewportHeight),
        navItems.length - 1
      );
      
      // Update main columns to match scroll position
      updateMainColumns(section);
      
      navItems.forEach((item, i) => {
        if (i === section) {
          item.classList.add("active");
        } else {
          item.classList.remove("active");
        }
      });
    }
    
    window.addEventListener("scroll", updateNav);
    updateNav();
  }
  
  // Enhanced system with mobile optimizations
  function initEnhancedSystem() {
    // Mobile-optimized Lenis configuration
    const lenisConfig = {
      duration: isMobile ? 1.0 : 1.8,
      easing: isMobile ? (t) => t : (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
      direction: "vertical",
      smooth: !isMobile, // Disable smooth scroll on mobile for better performance
      mouseMultiplier: isMobile ? 0.8 : 1.2,
      touchMultiplier: isMobile ? 1.5 : 2,
      wheelMultiplier: isMobile ? 0.5 : 1
    };
    
    const lenis = new Lenis(lenisConfig);
    
    gsap.registerPlugin(ScrollTrigger);
    
    // Only setup Lenis integration if not mobile
    if (!isMobile) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }
    
    const col1 = document.getElementById("col1");
    const col2 = document.getElementById("col2");
    const col3 = document.getElementById("col3");
    const navItems = document.querySelectorAll(".nav-item");
    const sections = navItems.length;
    
    // GSAP Animations - only for left column (right columns are user-scrollable)
    if (!isMobile && !prefersReducedMotion) {
      const allItems = getAllPortfolioItems();
      const totalItems = allItems.length;
      // Calculate distance based on total portfolio items to ensure smooth scrolling through all content
      const distance = totalItems > 0 ? (totalItems * 0.5) * window.innerHeight : (sections - 1) * window.innerHeight;
      
      // Only animate Column 1 (Left) - right columns are now independently scrollable
      gsap.to(col1, {
        y: -distance,
        ease: "none",
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          end: "bottom bottom",
          scrub: true
        }
      });
      
      // Note: col2 and col3 (right columns) are no longer animated via GSAP
      // They are now user-scrollable containers with folder-specific content
    }
    
    // Enhanced navigation with mobile support
    navItems.forEach((item, i) => {
      const eventType = isTouchDevice ? 'touchend' : 'click';
      
      item.addEventListener(eventType, (e) => {
        e.preventDefault();
        
        // Calculate scroll progress for this section
        const scrollProgress = i / Math.max(sections - 1, 1);
        
        // Update main columns with scroll progress
        updateMainColumns(scrollProgress);
        
        // Mobile uses native scroll, desktop uses Lenis
        if (isMobile) {
          const targetY = i * window.innerHeight;
          window.scrollTo({
            top: targetY,
            behavior: 'smooth'
          });
        } else {
          lenis.scrollTo(i * window.innerHeight, {
            duration: 1.2
          });
        }
      });
    });
    
    function updateNav() {
      const scrollPos = window.scrollY;
      const viewportHeight = window.innerHeight;
      const totalScrollHeight = document.body.scrollHeight - viewportHeight;
      const scrollProgress = totalScrollHeight > 0 ? scrollPos / totalScrollHeight : 0;
      
      // Update main columns with continuous scroll progress
      updateMainColumns(scrollProgress);
      
      // Update navigation active state based on current section
      const section = Math.min(
        Math.floor((scrollPos + viewportHeight * 0.4) / viewportHeight),
        sections - 1
      );
      
      navItems.forEach((item, i) => {
        if (i === section) {
          item.classList.add("active");
        } else {
          item.classList.remove("active");
        }
      });
    }
    
    window.addEventListener("scroll", updateNav);
    updateNav();
    
    window.addEventListener("resize", () => {
      if (!isMobile) {
        ScrollTrigger.refresh();
      }
      updateNav();
    });
  }

  // Initialize gallery
  initializeGallery();
  
  // Progressive enhancement logic - delayed for dynamic content
  setTimeout(() => {
    if (typeof Lenis !== 'undefined' && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      console.log('Enhanced mode: All libraries loaded');
      initEnhancedSystem();
    } else {
      console.log('Fallback mode: Using basic navigation');
      initBasicNavigation();
    }
  }, 300);
});