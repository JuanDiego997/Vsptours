// JavaScript específico para la página de inicio
console.log('Cargando scripts específicos de inicio...');

// Función de inicialización que será llamada por main.js
function initInicioPage() {
  console.log('Inicializando página de inicio...');

  // Configurar animaciones de scroll personalizadas
  setupScrollAnimations();

  // Configurar carrusel con efectos adicionales
  setupCarouselEffects();

  // Configurar efectos de hover en las tarjetas
  setupCardHoverEffects();

  // Configurar smooth scroll para enlaces internos
  setupSmoothScroll();
}

// Configurar animaciones de scroll
function setupScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-visible');

        // Agregar delay escalonado para elementos hermanos
        const siblings = Array.from(entry.target.parentNode.children);
        const index = siblings.indexOf(entry.target);
        entry.target.style.animationDelay = `${index * 0.1}s`;
      }
    });
  }, observerOptions);

  // Observar elementos con animación
  const animatedElements = document.querySelectorAll(
    '.fade-in, .slide-in-left, .feature-card-modern'
  );
  animatedElements.forEach((el) => observer.observe(el));
}

// Configurar efectos del carrusel
function setupCarouselEffects() {
  const carousel = document.getElementById('carouselDestinos');
  if (carousel) {
    // Agregar efectos de transición personalizados
    carousel.addEventListener('slide.bs.carousel', function (e) {
      const activeItem = e.relatedTarget;
      if (activeItem) {
        // Efecto de entrada para el contenido
        const caption = activeItem.querySelector('.modern-caption');
        if (caption) {
          caption.style.opacity = '0';
          caption.style.transform = 'translateY(30px)';

          setTimeout(() => {
            caption.style.transition = 'all 0.6s ease';
            caption.style.opacity = '1';
            caption.style.transform = 'translateY(0)';
          }, 300);
        }
      }
    });

    // Pausar carrusel al hover
    carousel.addEventListener('mouseenter', () => {
      bootstrap.Carousel.getInstance(carousel).pause();
    });

    carousel.addEventListener('mouseleave', () => {
      bootstrap.Carousel.getInstance(carousel).cycle();
    });
  }
}

// Configurar efectos de hover en tarjetas
function setupCardHoverEffects() {
  const featureCards = document.querySelectorAll('.feature-card-modern');

  featureCards.forEach((card) => {
    card.addEventListener('mouseenter', () => {
      // Efecto de elevación
      card.style.transform = 'translateY(-15px) scale(1.02)';

      // Efecto en la imagen
      const image = card.querySelector('.feature-image');
      if (image) {
        image.style.transform = 'scale(1.1)';
      }

      // Efecto en botones
      const buttons = card.querySelectorAll(
        '.btn-feature-primary, .btn-feature-secondary'
      );
      buttons.forEach((btn) => {
        btn.style.transform = 'translateY(-2px)';
      });
    });

    card.addEventListener('mouseleave', () => {
      // Restaurar estado original
      card.style.transform = 'translateY(0) scale(1)';

      const image = card.querySelector('.feature-image');
      if (image) {
        image.style.transform = 'scale(1)';
      }

      const buttons = card.querySelectorAll(
        '.btn-feature-primary, .btn-feature-secondary'
      );
      buttons.forEach((btn) => {
        btn.style.transform = 'translateY(0)';
      });
    });
  });
}

// Configurar smooth scroll
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');

      // Si es un enlace a otra página (como #flota), manejarlo diferente
      if (href.length > 1 && !document.querySelector(href)) {
        // Es un enlace a otra página, no hacer scroll
        return;
      }

      // Si es un enlace interno de la misma página
      if (href.length > 1) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }
    });
  });
}

// Efectos adicionales para botones
document.addEventListener('DOMContentLoaded', () => {
  // Efecto ripple para botones
  const buttons = document.querySelectorAll(
    '.btn-hero, .btn-carousel, .btn-feature-primary, .btn-feature-secondary'
  );

  buttons.forEach((button) => {
    button.addEventListener('click', function (e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
      `;

      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
});

// Agregar CSS para animaciones
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  .animate-visible {
    opacity: 1 !important;
    transform: translateY(0) !important;
  }
  
  .fade-in {
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.6s ease;
  }
  
  .slide-in-left {
    opacity: 0;
    transform: translateX(-30px);
    transition: all 0.6s ease;
  }
`;
document.head.appendChild(style);

console.log('Scripts específicos de inicio cargados correctamente');
