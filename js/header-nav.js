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
    if (
      (currentPage === 'index.html' || currentPage === '') && linkHref.startsWith('#') ||
      (currentPage === 'pricing-menu.html' && linkHref === 'pricing-menu.html')
    ) {
      link.style.background = 'rgba(211, 255, 0, 0.1)';
      link.style.color = 'var(--accent-lime)';
    }
  });
});