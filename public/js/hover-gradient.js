/**
 * Future-Proofed Hover Gradient Module
 * Exact replication of example.html gradient logic with extensible architecture
 * @version 2.0.0
 * @author Homme Made
 */

class HoverGradient {
  /**
   * @param {Object} options - Configuration options
   * @param {string} options.selector - CSS selector for target elements
   * @param {string} options.primaryColor - Primary gradient color
   * @param {string} options.secondaryColor - Secondary gradient color  
   * @param {string} options.gradientSize - Gradient size (closest-corner, closest-side, farthest-corner, etc.)
   * @param {string} options.transition - CSS transition timing
   * @param {boolean} options.useRAF - Use RequestAnimationFrame for smoother performance
   * @param {number} options.throttleMs - Throttle mousemove events (ms)
   * @param {boolean} options.preserveBackground - Preserve original element background
   * @param {boolean} options.autoInit - Auto-initialize on instantiation
   */
  constructor(options = {}) {
    // Core configuration with future-proof defaults
    this.options = {
      selector: options.selector || '.hover-gradient',
      primaryColor: options.primaryColor || '#d3ff00',
      secondaryColor: options.secondaryColor || 'transparent', 
      gradientSize: options.gradientSize || 'closest-corner', // Key: exact match to example.html
      transition: options.transition || '0.3s ease',
      useRAF: options.useRAF !== false,
      throttleMs: options.throttleMs || 16, // ~60fps
      preserveBackground: options.preserveBackground !== false,
      autoInit: options.autoInit !== false
    };

    // Internal state management
    this.state = {
      elements: new Map(), // WeakMap for better memory management
      isInitialized: false,
      rafId: null,
      boundHandlers: new WeakMap()
    };

    // Plugin system for future extensibility
    this.plugins = new Map();
    
    // Performance monitoring hooks
    this.metrics = {
      updateCount: 0,
      lastUpdate: 0,
      avgUpdateTime: 0
    };

    if (this.options.autoInit) {
      this.init();
    }
  }

  /**
   * Initialize the hover gradient system
   * @returns {HoverGradient} Instance for chaining
   */
  init() {
    if (this.state.isInitialized) {
      console.warn('[HoverGradient] Already initialized');
      return this;
    }

    this.setupCSS();
    this.findElements();
    this.bindEvents();
    this.setupAccessibility();
    
    this.state.isInitialized = true;
    this.emit('initialized', { instance: this });
    
    return this;
  }

  /**
   * Set up CSS custom properties for theming
   */
  setupCSS() {
    const root = document.documentElement;
    
    // Define CSS custom properties for theming system
    const cssVars = {
      '--hover-gradient-primary': this.options.primaryColor,
      '--hover-gradient-secondary': this.options.secondaryColor,
      '--hover-gradient-transition': this.options.transition,
      '--hover-gradient-size': this.options.gradientSize
    };

    Object.entries(cssVars).forEach(([prop, value]) => {
      root.style.setProperty(prop, value);
    });
  }

  /**
   * Find and register elements for gradient effects
   */
  findElements() {
    const elements = document.querySelectorAll(this.options.selector);
    
    elements.forEach(element => {
      this.addElement(element);
    });

    return this;
  }

  /**
   * Add gradient effect to a specific element
   * @param {HTMLElement} element - Target element
   * @returns {HoverGradient} Instance for chaining
   */
  addElement(element) {
    if (!(element instanceof HTMLElement)) {
      console.warn('[HoverGradient] Invalid element provided');
      return this;
    }

    if (this.state.elements.has(element)) {
      return this; // Already registered
    }

    // Store original background for restoration
    const originalStyle = {
      background: element.style.background || '',
      transition: element.style.transition || ''
    };

    // Create element configuration from data attributes
    const config = this.getElementConfig(element);
    
    // Register element with its configuration
    this.state.elements.set(element, {
      originalStyle,
      config,
      isActive: false
    });

    // Set up event handlers
    this.bindElementEvents(element);
    
    return this;
  }

  /**
   * Extract configuration from element data attributes
   * @param {HTMLElement} element - Target element
   * @returns {Object} Element-specific configuration
   */
  getElementConfig(element) {
    return {
      primaryColor: element.dataset.gradientPrimary || this.options.primaryColor,
      secondaryColor: element.dataset.gradientSecondary || this.options.secondaryColor,
      gradientSize: element.dataset.gradientSize || this.options.gradientSize,
      transition: element.dataset.gradientTransition || this.options.transition,
      intensity: parseFloat(element.dataset.gradientIntensity) || 1.0
    };
  }

  /**
   * Bind events for the entire system
   */
  bindEvents() {
    // Global event delegation for dynamic content
    document.addEventListener('mouseover', this.handleGlobalMouseOver.bind(this));
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', this.destroy.bind(this));
    
    // Handle visibility changes for performance
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  /**
   * Global mouse over handler for dynamic content support
   * @param {MouseEvent} event - Mouse event
   */
  handleGlobalMouseOver(event) {
    const element = event.target.closest(this.options.selector);
    if (element && !this.state.elements.has(element)) {
      this.addElement(element);
    }
  }

  /**
   * Bind events to a specific element
   * @param {HTMLElement} element - Target element
   */
  bindElementEvents(element) {
    const handlers = {
      mouseenter: this.createMouseEnterHandler(element),
      mousemove: this.createMouseMoveHandler(element),
      mouseleave: this.createMouseLeaveHandler(element)
    };

    // Store handlers for cleanup
    this.state.boundHandlers.set(element, handlers);

    // Bind events
    Object.entries(handlers).forEach(([event, handler]) => {
      element.addEventListener(event, handler, { passive: true });
    });
  }

  /**
   * Create mouse enter handler for element
   * @param {HTMLElement} element - Target element
   * @returns {Function} Event handler
   */
  createMouseEnterHandler(element) {
    return (event) => {
      const elementData = this.state.elements.get(element);
      if (!elementData) return;

      elementData.isActive = true;
      
      // Set transition for smooth activation
      element.style.transition = `background ${elementData.config.transition}`;
      
      this.emit('mouseenter', { element, event });
    };
  }

  /**
   * Create optimized mouse move handler for element
   * @param {HTMLElement} element - Target element
   * @returns {Function} Event handler
   */
  createMouseMoveHandler(element) {
    let lastUpdate = 0;
    
    return (event) => {
      const now = performance.now();
      
      // Throttle updates for performance
      if (now - lastUpdate < this.options.throttleMs) {
        return;
      }
      
      lastUpdate = now;
      
      if (this.options.useRAF) {
        this.scheduleUpdate(element, event);
      } else {
        this.updateGradient(element, event);
      }
    };
  }

  /**
   * Schedule gradient update using RAF for smooth performance
   * @param {HTMLElement} element - Target element
   * @param {MouseEvent} event - Mouse event
   */
  scheduleUpdate(element, event) {
    if (this.state.rafId) {
      cancelAnimationFrame(this.state.rafId);
    }
    
    this.state.rafId = requestAnimationFrame(() => {
      this.updateGradient(element, event);
      this.state.rafId = null;
    });
  }

  /**
   * Update gradient effect - Enhanced layered approach for glass elements
   * @param {HTMLElement} element - Target element
   * @param {MouseEvent} event - Mouse event
   */
  updateGradient(element, event) {
    const startTime = performance.now();
    
    const elementData = this.state.elements.get(element);
    if (!elementData || !elementData.isActive) return;

    const rect = element.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / element.clientWidth) * 100;
    const y = ((event.clientY - rect.top) / element.clientHeight) * 100;

    const { config } = elementData;
    
    // EXACT match to example.html gradient implementation
    const gradient = `radial-gradient(circle ${config.gradientSize} at ${x}% ${y}%, 
      ${config.primaryColor}, 
      ${config.secondaryColor})`;

    // For glass elements, use CSS variable to apply gradient to ::after pseudo-element
    if (element.classList.contains('glass') || element.classList.contains('glass-terracotta')) {
      element.style.setProperty('--dynamic-gradient', gradient);
    } else {
      // For non-glass elements, apply gradient directly (preserves existing behavior)
      if (this.options.preserveBackground && elementData.originalStyle.background) {
        element.style.background = `${gradient}, ${elementData.originalStyle.background}`;
      } else {
        element.style.background = gradient;
      }
    }

    // Dynamic border color refraction based on mouse position
    if (element.classList.contains('glass') || element.classList.contains('glass-terracotta')) {
      const borderIntensity = Math.min(1, Math.sqrt((x-50)*(x-50) + (y-50)*(y-50)) / 50);
      const borderOpacity = 0.3 + (borderIntensity * 0.4);
      
      // Use terracotta border for terracotta elements, lime for regular glass
      if (element.classList.contains('glass-terracotta')) {
        element.style.borderColor = `rgba(226, 114, 91, ${borderOpacity})`;
      } else {
        element.style.borderColor = `rgba(211, 255, 0, ${borderOpacity})`;
      }
      
      // Add subtle box-shadow intensity variation
      const shadowIntensity = 0.2 + (borderIntensity * 0.2);
      const shadowColor = element.classList.contains('glass-terracotta') ? 
        'rgba(226, 114, 91, ' : 'rgba(211, 255, 0, ';
      
      element.style.boxShadow = `
        0 16px 48px var(--shadow-medium),
        0 0 20px ${shadowColor}${shadowIntensity}),
        inset 0 1px 0 ${shadowColor}${borderOpacity * 0.5}),
        inset 0 -1px 0 ${shadowColor}${borderOpacity * 0.3})
      `;
    }

    // Update performance metrics
    const updateTime = performance.now() - startTime;
    this.updateMetrics(updateTime);
    
    this.emit('gradientUpdate', { element, event, gradient, position: { x, y } });
  }

  /**
   * Create mouse leave handler for element
   * @param {HTMLElement} element - Target element
   * @returns {Function} Event handler
   */
  createMouseLeaveHandler(element) {
    return (event) => {
      const elementData = this.state.elements.get(element);
      if (!elementData) return;

      elementData.isActive = false;
      
      // For glass elements, clear the dynamic gradient variable
      if (element.classList.contains('glass') || element.classList.contains('glass-terracotta')) {
        element.style.removeProperty('--dynamic-gradient');
      } else {
        // For non-glass elements, restore original background
        element.style.background = elementData.originalStyle.background;
      }
      
      this.emit('mouseleave', { element, event });
    };
  }

  /**
   * Set up accessibility features
   */
  setupAccessibility() {
    // Respect reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleReducedMotion = (e) => {
      if (e.matches) {
        document.documentElement.style.setProperty('--hover-gradient-transition', 'none');
      } else {
        document.documentElement.style.setProperty('--hover-gradient-transition', this.options.transition);
      }
    };

    handleReducedMotion(mediaQuery);
    mediaQuery.addEventListener('change', handleReducedMotion);
  }

  /**
   * Handle visibility change for performance optimization
   */
  handleVisibilityChange() {
    if (document.hidden) {
      // Cancel any pending RAF when page is hidden
      if (this.state.rafId) {
        cancelAnimationFrame(this.state.rafId);
        this.state.rafId = null;
      }
    }
  }

  /**
   * Update performance metrics
   * @param {number} updateTime - Time taken for update
   */
  updateMetrics(updateTime) {
    this.metrics.updateCount++;
    this.metrics.lastUpdate = performance.now();
    this.metrics.avgUpdateTime = (this.metrics.avgUpdateTime + updateTime) / 2;
  }

  /**
   * Plugin system for extensibility
   * @param {string} name - Plugin name
   * @param {Function} plugin - Plugin function
   */
  use(name, plugin) {
    if (typeof plugin !== 'function') {
      throw new Error('[HoverGradient] Plugin must be a function');
    }
    
    this.plugins.set(name, plugin);
    plugin.call(this, this);
    
    return this;
  }

  /**
   * Update configuration dynamically
   * @param {Object} newOptions - New configuration options
   * @returns {HoverGradient} Instance for chaining
   */
  updateConfig(newOptions) {
    this.options = { ...this.options, ...newOptions };
    this.setupCSS();
    
    // Reapply configuration to all elements
    this.state.elements.forEach((data, element) => {
      data.config = { ...data.config, ...this.getElementConfig(element) };
    });
    
    this.emit('configUpdated', { options: this.options });
    
    return this;
  }

  /**
   * Remove element from gradient system
   * @param {HTMLElement} element - Element to remove
   * @returns {HoverGradient} Instance for chaining
   */
  removeElement(element) {
    const elementData = this.state.elements.get(element);
    if (!elementData) return this;

    // Remove event listeners
    const handlers = this.state.boundHandlers.get(element);
    if (handlers) {
      Object.entries(handlers).forEach(([event, handler]) => {
        element.removeEventListener(event, handler);
      });
      this.state.boundHandlers.delete(element);
    }

    // Restore original styles
    element.style.background = elementData.originalStyle.background;
    element.style.transition = elementData.originalStyle.transition;

    // Remove from tracking
    this.state.elements.delete(element);
    
    return this;
  }

  /**
   * Event emitter for extensibility
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  emit(event, data) {
    const customEvent = new CustomEvent(`hovergradient:${event}`, { 
      detail: data 
    });
    document.dispatchEvent(customEvent);
  }

  /**
   * Get performance metrics
   * @returns {Object} Performance data
   */
  getMetrics() {
    return { ...this.metrics };
  }

  /**
   * Refresh the gradient system (useful for dynamic content)
   * @returns {HoverGradient} Instance for chaining
   */
  refresh() {
    this.findElements();
    return this;
  }

  /**
   * Clean up and destroy the gradient system
   */
  destroy() {
    // Cancel any pending animations
    if (this.state.rafId) {
      cancelAnimationFrame(this.state.rafId);
    }

    // Remove all element event listeners and restore styles
    this.state.elements.forEach((data, element) => {
      this.removeElement(element);
    });

    // Clear global event listeners
    document.removeEventListener('mouseover', this.handleGlobalMouseOver);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('beforeunload', this.destroy);

    // Clean up CSS variables
    const root = document.documentElement;
    [
      '--hover-gradient-primary',
      '--hover-gradient-secondary', 
      '--hover-gradient-transition',
      '--hover-gradient-size'
    ].forEach(prop => {
      root.style.removeProperty(prop);
    });

    // Reset state
    this.state.isInitialized = false;
    this.state.elements.clear();
    this.plugins.clear();
    
    this.emit('destroyed', { instance: this });
  }
}

// Static factory methods for convenience
HoverGradient.create = function(options = {}) {
  return new HoverGradient(options);
};

// Preset configurations for common use cases
HoverGradient.presets = {
  lime: { primaryColor: '#d3ff00', secondaryColor: 'transparent' },
  glass: { gradientSize: 'closest-corner', transition: '0.3s ease' },
  subtle: { primaryColor: 'rgba(211, 255, 0, 0.3)' },
  intense: { primaryColor: '#d3ff00', gradientSize: 'farthest-corner' }
};

// Auto-initialization with enhanced detection
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll('.hover-gradient');
    if (elements.length > 0) {
      window.hoverGradientInstance = HoverGradient.create();
      
      // Expose for debugging and testing
      if (typeof window !== 'undefined') {
        window.HoverGradient = HoverGradient;
      }
    }
  });
}

// Export for multiple module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HoverGradient;
} else if (typeof define === 'function' && define.amd) {
  define([], () => HoverGradient);
} else if (typeof window !== 'undefined') {
  window.HoverGradient = HoverGradient;
}