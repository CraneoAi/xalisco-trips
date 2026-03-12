/**
 * Xalisco Trips - Main JavaScript
 * Optimizado para performance y mantenibilidad
 */

(function() {
  'use strict';

  // ==========================================================================
  // CONFIGURACIÓN
  // ==========================================================================
  const CONFIG = {
    whatsappNumber: '5213351083318',
    aosOptions: {
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      offset: 100
    }
  };

  // ==========================================================================
  // INICIALIZACIÓN
  // ==========================================================================
  document.addEventListener('DOMContentLoaded', function() {
    initAOS();
    initSmoothScroll();
    initCarouselSort();
    initLightbox();
    initWhatsAppTracking();
    detectQRSource();
  });

  // ==========================================================================
  // AOS (Animate on Scroll)
  // ==========================================================================
  function initAOS() {
    if (typeof AOS !== 'undefined') {
      AOS.init(CONFIG.aosOptions);
    }
  }

  // ==========================================================================
  // SMOOTH SCROLL
  // ==========================================================================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);
        
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  // ==========================================================================
  // CAROUSEL SORTING (Combo Cards)
  // ==========================================================================
  function initCarouselSort() {
    const comboCarousels = ['carouselChapalaTonalaCombo', 'carouselTequilaGuachimontones'];
    
    comboCarousels.forEach(carouselId => {
      const carousel = document.getElementById(carouselId);
      if (!carousel) return;

      const inner = carousel.querySelector('.carousel-inner');
      const indicators = carousel.querySelector('.carousel-indicators');
      const items = Array.from(carousel.querySelectorAll('.carousel-inner .carousel-item'));
      
      if (!inner || !indicators || !items.length) return;

      // Sort by filename
      const getFileName = item => {
        const img = item.querySelector('img');
        const src = img?.getAttribute('src') || '';
        return src.split('/').pop() || src;
      };

      items.sort((a, b) => 
        getFileName(a).localeCompare(getFileName(b), 'es', { numeric: true, sensitivity: 'base' })
      );

      // Rebuild carousel
      inner.innerHTML = '';
      items.forEach((item, index) => {
        item.classList.toggle('active', index === 0);
        inner.appendChild(item);
      });

      // Rebuild indicators
      indicators.innerHTML = '';
      items.forEach((_, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.setAttribute('data-bs-target', `#${carouselId}`);
        button.setAttribute('data-bs-slide-to', index.toString());
        if (index === 0) {
          button.classList.add('active');
          button.setAttribute('aria-current', 'true');
        }
        indicators.appendChild(button);
      });
    });
  }

  // ==========================================================================
  // LIGHTBOX FUNCTIONALITY
  // ==========================================================================
  function initLightbox() {
    const lightboxModal = document.getElementById('lightboxModal');
    if (!lightboxModal) return;

    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxCurrent = document.getElementById('lightboxCurrent');
    const lightboxTotal = document.getElementById('lightboxTotal');
    const prevBtn = lightboxModal.querySelector('.lightbox-nav.prev');
    const nextBtn = lightboxModal.querySelector('.lightbox-nav.next');
    
    let currentImages = [];
    let currentIndex = 0;

    // Add zoom badge to carousel items
    document.querySelectorAll('.carousel-item').forEach(item => {
      item.style.position = 'relative';
      const badge = createZoomBadge();
      item.appendChild(badge);
      
      item.addEventListener('mouseenter', () => badge.style.opacity = '1');
      item.addEventListener('mouseleave', () => badge.style.opacity = '0.85');
    });

    // Click handlers for carousel images
    document.querySelectorAll('.carousel-item img').forEach(img => {
      img.addEventListener('click', function(e) {
        e.stopPropagation();
        const carousel = this.closest('.carousel');
        const images = carousel.querySelectorAll('.carousel-item img');
        
        currentImages = Array.from(images).map(img => ({
          src: img.src,
          alt: img.alt
        }));
        
        currentIndex = Array.from(images).indexOf(this);
        updateLightbox();
        
        const modal = new bootstrap.Modal(lightboxModal);
        modal.show();
      });
    });

    function createZoomBadge() {
      const badge = document.createElement('div');
      badge.style.cssText = `
        position: absolute;
        bottom: 8px;
        right: 8px;
        background: var(--brand-primary);
        border-radius: 50%;
        width: 26px;
        height: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        opacity: 0.85;
        z-index: 10;
        transition: opacity 0.2s;
      `;
      badge.innerHTML = '<i class="bi bi-zoom-in" style="font-size:0.65rem;color:#000;"></i>';
      return badge;
    }

    function updateLightbox() {
      if (!currentImages.length) return;
      
      lightboxImage.src = currentImages[currentIndex].src;
      lightboxImage.alt = currentImages[currentIndex].alt;
      lightboxCurrent.textContent = currentIndex + 1;
      lightboxTotal.textContent = currentImages.length;
      
      const showNav = currentImages.length > 1;
      prevBtn.style.display = showNav ? 'flex' : 'none';
      nextBtn.style.display = showNav ? 'flex' : 'none';
    }

    // Navigation
    prevBtn?.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
      updateLightbox();
    });

    nextBtn?.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % currentImages.length;
      updateLightbox();
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
      if (!lightboxModal.classList.contains('show')) return;
      
      switch(e.key) {
        case 'ArrowLeft':
          currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
          updateLightbox();
          break;
        case 'ArrowRight':
          currentIndex = (currentIndex + 1) % currentImages.length;
          updateLightbox();
          break;
        case 'Escape':
          bootstrap.Modal.getInstance(lightboxModal)?.hide();
          break;
      }
    });

    // Expose profile lightbox function globally
    window.openProfileLightbox = function() {
      const img = document.getElementById('octavioProfilePhoto');
      if (!img) return;
      
      lightboxImage.src = img.src;
      lightboxImage.alt = img.alt;
      lightboxCurrent.textContent = '1';
      lightboxTotal.textContent = '1';
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
      
      new bootstrap.Modal(lightboxModal).show();
    };
  }

  // ==========================================================================
  // WHATSAPP TRACKING
  // ==========================================================================
  function initWhatsAppTracking() {
    document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
      link.addEventListener('click', function() {
        // Google Analytics event tracking
        if (typeof gtag !== 'undefined') {
          gtag('event', 'whatsapp_click', {
            'event_category': 'contact',
            'event_label': this.href
          });
        }
      });
    });
  }

  // ==========================================================================
  // QR SOURCE DETECTION
  // ==========================================================================
  function detectQRSource() {
    if (document.referrer === '' || document.referrer.includes('qr')) {
      document.body.classList.add('qr-source');
    }
  }

})();
