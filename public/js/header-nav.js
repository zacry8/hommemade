/* Universal Header Navigation JavaScript Module */

function toggleMobileMenu() {
  const mobileMenu = document.getElementById('mobileMenu');
  const hamburger = document.querySelector('.hamburger');
  
  mobileMenu.classList.toggle('active');
  hamburger.classList.toggle('active');
}

// Initialize navigation functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  
  // Add click event to hamburger button
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', toggleMobileMenu);
  }
  
  // Close mobile menu when clicking outside
  document.addEventListener('click', function(event) {
    const mobileMenu = document.getElementById('mobileMenu');
    const hamburger = document.querySelector('.hamburger');
    const floatingNav = document.querySelector('.floating-nav');
    
    if (!floatingNav.contains(event.target) && !mobileMenu.contains(event.target)) {
      mobileMenu.classList.remove('active');
      hamburger.classList.remove('active');
    }
  });

  // Close mobile menu when clicking on a link
  document.querySelectorAll('.mobile-menu a').forEach(link => {
    link.addEventListener('click', function() {
      const mobileMenu = document.getElementById('mobileMenu');
      const hamburger = document.querySelector('.hamburger');
      
      mobileMenu.classList.remove('active');
      hamburger.classList.remove('active');
    });
  });

  // Smooth scroll for anchor links (for index.html)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Add active state to current page navigation link
  const currentPage = window.location.pathname.split('/').pop();
  const navLinks = document.querySelectorAll('.floating-nav .nav-links a, .mobile-menu a');
  
  navLinks.forEach(link => {
    const linkHref = link.getAttribute('href');
    const isActive = (
      // Index page (home) - highlight anchor links and home references
      (currentPage === 'index.html' || currentPage === '') && 
      (linkHref.startsWith('#') || linkHref === 'index.html')
    ) || (
      // Direct page matches
      currentPage === 'pricing-menu.html' && linkHref === 'pricing-menu.html'
    ) || (
      currentPage === 'gallery.html' && linkHref === 'gallery.html'  
    ) || (
      // Chatbot pages - highlight AI Assistants link
      (currentPage === 'chatbot.html' || currentPage.startsWith('chatbot-')) && 
      linkHref === 'chatbot.html'
    ) || (
      // Special pages that don't have direct nav links
      (currentPage === 'onboarding-form.html' || currentPage === 'admin.html') && 
      linkHref === 'index.html'
    );
    
    if (isActive) {
      link.style.background = 'rgba(211, 255, 0, 0.1)';
      link.style.color = 'var(--accent-lime)';
    }
  });
});