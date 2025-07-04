// JavaScript específico para la página de flota
console.log('Cargando scripts específicos de flota...');

// Función de inicialización que será llamada por main.js
function initFlotaPage() {
  console.log('Inicializando página de flota...');

  // Inicializar carruseles de Bootstrap
  initializeCarousels();

  // Configurar navegación interna de la página
  setupFlotaNavigation();

  // Configurar efectos hover para las cards
  setupCardEffects();

  // Configurar smooth scroll para navegación interna
  setupSmoothScroll();
}

// Inicializar todos los carruseles de Bootstrap
function initializeCarousels() {
  console.log('Inicializando carruseles de flota...');

  // Obtener todos los carruseles
  const carousels = document.querySelectorAll('.carousel');

  carousels.forEach((carousel, index) => {
    try {
      // Crear instancia de carousel de Bootstrap
      new bootstrap.Carousel(carousel, {
        interval: 5000, // Cambio automático cada 5 segundos
        wrap: true, // Continuar al principio después del último slide
        pause: 'hover', // Pausar al hacer hover
      });

      console.log(`Carousel ${index + 1} inicializado correctamente`);
    } catch (error) {
      console.error(`Error al inicializar carousel ${index + 1}:`, error);
    }
  });
}

// Configurar navegación interna de la página de flota
function setupFlotaNavigation() {
  console.log('Configurando navegación de flota...');

  // Obtener botones de navegación
  const navButtons = document.querySelectorAll('.btn-light');

  navButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();

      const buttonText = button.textContent.trim().toLowerCase();
      let targetId = '';

      // Determinar el ID del objetivo basado en el texto del botón
      if (buttonText.includes('vans') && !buttonText.includes('mini')) {
        targetId = 'vans';
      } else if (buttonText.includes('minivanes')) {
        targetId = 'minivanes';
      } else if (buttonText.includes('minibuses')) {
        targetId = 'minibuses';
      } else if (buttonText.includes('buses')) {
        targetId = 'buses';
      }

      if (targetId) {
        scrollToSection(targetId);
        updateActiveButton(button);
      }
    });
  });
}

// Función para hacer scroll suave a una sección
function scrollToSection(sectionId) {
  const target = document.getElementById(sectionId);
  if (target) {
    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
}

// Actualizar botón activo
function updateActiveButton(activeButton) {
  // Remover clase activa de todos los botones
  document.querySelectorAll('.btn-light').forEach((btn) => {
    btn.classList.remove('active', 'btn-primary');
    btn.classList.add('btn-light');
  });

  // Agregar clase activa al botón seleccionado
  activeButton.classList.remove('btn-light');
  activeButton.classList.add('btn-primary', 'active');
}

// Configurar efectos hover para las cards
function setupCardEffects() {
  console.log('Configurando efectos de cards...');

  const cards = document.querySelectorAll('.card');

  cards.forEach((card) => {
    // Efecto hover
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-5px)';
      card.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
      card.style.transition = 'all 0.3s ease';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = '';
    });
  });
}

// Configurar smooth scroll para toda la página
function setupSmoothScroll() {
  // Agregar scroll listener para detectar secciones visibles
  window.addEventListener('scroll', () => {
    updateActiveButtonOnScroll();
  });
}

// Actualizar botón activo basado en la posición del scroll
function updateActiveButtonOnScroll() {
  const sections = ['vans', 'minivanes', 'minibuses', 'buses'];
  const navButtons = document.querySelectorAll('.btn-light, .btn-primary');

  let currentSection = '';

  sections.forEach((sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 100 && rect.bottom >= 100) {
        currentSection = sectionId;
      }
    }
  });

  if (currentSection) {
    navButtons.forEach((button) => {
      const buttonText = button.textContent.trim().toLowerCase();
      let shouldBeActive = false;

      if (
        currentSection === 'vans' &&
        buttonText.includes('vans') &&
        !buttonText.includes('mini')
      ) {
        shouldBeActive = true;
      } else if (
        currentSection === 'minivanes' &&
        buttonText.includes('minivanes')
      ) {
        shouldBeActive = true;
      } else if (
        currentSection === 'minibuses' &&
        buttonText.includes('minibuses')
      ) {
        shouldBeActive = true;
      } else if (currentSection === 'buses' && buttonText.includes('buses')) {
        shouldBeActive = true;
      }

      if (shouldBeActive) {
        button.classList.remove('btn-light');
        button.classList.add('btn-primary', 'active');
      } else {
        button.classList.remove('btn-primary', 'active');
        button.classList.add('btn-light');
      }
    });
  }
}

// Función para reinicializar carruseles (útil para debugging)
function reinitializeCarousels() {
  console.log('Reinicializando carruseles...');

  // Destruir instancias existentes
  document.querySelectorAll('.carousel').forEach((carousel) => {
    const instance = bootstrap.Carousel.getInstance(carousel);
    if (instance) {
      instance.dispose();
    }
  });

  // Reinicializar
  setTimeout(() => {
    initializeCarousels();
  }, 100);
}

// Función de utilidad para mostrar información de debug
function debugFlotaPage() {
  console.log('=== DEBUG FLOTA PAGE ===');
  console.log(
    'Carruseles encontrados:',
    document.querySelectorAll('.carousel').length
  );
  console.log(
    'Botones de navegación:',
    document.querySelectorAll('.btn-light').length
  );
  console.log('Cards encontradas:', document.querySelectorAll('.card').length);
  console.log(
    'Secciones encontradas:',
    ['vans', 'minivanes', 'minibuses', 'buses'].map((id) => ({
      id,
      element: document.getElementById(id) ? 'encontrado' : 'no encontrado',
    }))
  );
}

// Exportar funciones para uso global si es necesario
if (typeof window !== 'undefined') {
  window.flotaPageUtils = {
    reinitializeCarousels,
    debugFlotaPage,
    scrollToSection,
  };
}

// Auto-ejecutar inicialización si la página ya está cargada
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFlotaPage);
} else {
  // DOM ya está cargado
  initFlotaPage();
}
