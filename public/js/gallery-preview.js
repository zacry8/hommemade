document.addEventListener("DOMContentLoaded", () => {
  // Portfolio data will be loaded from JSON
  let portfolioData = null;
  
  // Intersection Observer for lazy loading
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
      // Fallback to sample data if JSON fails
      return createFallbackData();
    }
  }
  
  // Fallback data structure
  function createFallbackData() {
    return {
      gallery: {
        sections: [
          {
            id: "web-design",
            title: "Web Design",
            media: [
              {
                src: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400&h=400&fit=crop",
                title: "Modern Web Interface",
                description: "Clean, responsive web design"
              },
              {
                src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop",
                title: "Dashboard Design",
                description: "Analytics and data visualization"
              }
            ]
          },
          {
            id: "branding",
            title: "Branding",
            media: [
              {
                src: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=400&fit=crop",
                title: "Brand Identity",
                description: "Logo and brand system design"
              }
            ]
          }
        ]
      }
    };
  }
  
  // Get featured items across all sections
  function getFeaturedItems(data, limit = 9) {
    if (!data || !data.gallery || !data.gallery.sections) return [];
    
    const allMedia = [];
    data.gallery.sections.forEach(section => {
      if (section.media && section.media.length > 0) {
        section.media.forEach(item => {
          allMedia.push({
            ...item,
            section: section.title
          });
        });
      }
    });
    
    // Shuffle and take first `limit` items
    const shuffled = allMedia.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
  }
  
  // Create gallery preview item element
  function createPreviewItem(mediaItem) {
    const item = document.createElement('div');
    item.className = 'gallery-preview-item';
    item.innerHTML = `
      <img data-src="${mediaItem.src}" alt="${mediaItem.title}" loading="lazy">
    `;
    
    // Add click handler to navigate to gallery
    item.addEventListener('click', () => {
      window.location.href = 'gallery.html';
    });
    
    // Start observing for lazy loading
    const img = item.querySelector('img');
    if (img) {
      imageObserver.observe(img);
    }
    
    return item;
  }
  
  // Populate gallery preview
  function populateGalleryPreview() {
    const container = document.getElementById('galleryPreview');
    if (!container || !portfolioData) return;
    
    const featuredItems = getFeaturedItems(portfolioData, 9);
    
    // Clear loading placeholders
    container.innerHTML = '';
    
    if (featuredItems.length === 0) {
      // If no items found, show placeholder message
      container.innerHTML = `
        <div class="gallery-preview-item" style="grid-column: 1 / -1; aspect-ratio: auto;">
          <div style="padding: 2rem; text-align: center; color: var(--text-muted);">
            <p>Gallery items will appear here once you add images to your portfolio folders.</p>
            <p style="font-size: 0.8rem; margin-top: 1rem;">Drop images into <code>/portfolio/[category]/</code> folders to get started.</p>
          </div>
        </div>
      `;
      return;
    }
    
    // Add featured items
    featuredItems.forEach(item => {
      const previewItem = createPreviewItem(item);
      container.appendChild(previewItem);
    });
    
    // Fill remaining slots with duplicates if needed
    while (container.children.length < 9 && featuredItems.length > 0) {
      const randomItem = featuredItems[Math.floor(Math.random() * featuredItems.length)];
      const previewItem = createPreviewItem(randomItem);
      container.appendChild(previewItem);
    }
  }
  
  // Initialize gallery preview
  async function initGalleryPreview() {
    try {
      await loadPortfolioData();
      populateGalleryPreview();
      console.log('Gallery preview initialized successfully');
    } catch (error) {
      console.error('Failed to initialize gallery preview:', error);
      // Keep loading placeholders visible on error
    }
  }
  
  // Start initialization
  initGalleryPreview();
});