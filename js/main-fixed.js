// Sistema de inyección de contenido dinámico para VSP Tours
class VSPToursApp {
  constructor() {
    this.currentPage = this.getCurrentPage();
    this.init();
  }

  // Detectar la página actual basada en la URL
  getCurrentPage() {
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1);

    // Si es index.html o está vacío, cargar inicio
    if (page === 'index.html' || page === '' || page === '/') {
      return 'inicio';
    }

    // Remover .html del nombre de archivo
    return page.replace('.html', '');
  }

  // Inicializar la aplicación
  async init() {
    try {
      console.log('🚀 Inicializando VSP Tours App...');
      await this.loadGlobalCSS();
      await this.loadNavbar();
      await this.loadMainContent();
      await this.loadFooter();
      this.setupNavigation();
      this.initializeAOS();
      this.handleHashNavigation();
      console.log('✅ App inicializada correctamente');
    } catch (error) {
      console.error('❌ Error al inicializar:', error);
    }
  }

  // Cargar CSS globales
  async loadGlobalCSS() {
    const cssFiles = ['css/global.css', 'css/navbar.css', 'css/footer.css'];

    cssFiles.forEach((cssFile) => {
      if (!document.querySelector(`link[href="${cssFile}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssFile;
        document.head.appendChild(link);
      }
    });
  }

  // Cargar navbar
  async loadNavbar() {
    try {
      console.log('📋 Cargando navbar...');
      const response = await fetch('navbar.html');
      if (response.ok) {
        const navbarHTML = await response.text();
        document.getElementById('navbar-placeholder').innerHTML = navbarHTML;
        this.updateActiveNavLink();
        console.log('✅ Navbar cargado');
      }
    } catch (error) {
      console.error('❌ Error al cargar navbar:', error);
    }
  }

  // Cargar contenido principal
  async loadMainContent() {
    try {
      const pageName = this.currentPage;
      console.log('🔄 Cargando página:', pageName);

      let fileName = `${pageName}.html`;
      console.log('📄 Archivo a cargar:', fileName);

      const response = await fetch(fileName);

      if (response.ok) {
        console.log('✅ Archivo cargado exitosamente');
        const contentHTML = await response.text();

        // Extraer contenido principal
        const parser = new DOMParser();
        const doc = parser.parseFromString(contentHTML, 'text/html');

        // Buscar contenido en el <main> del archivo
        const mainElement = doc.querySelector('main');

        if (mainElement) {
          console.log('✅ Encontrado elemento main');
          let content = mainElement.innerHTML;

          // Limpiar elementos no deseados para SPA
          content = content.replace(
            /<div[^>]*id="navbar-placeholder"[^>]*>[\s\S]*?<\/div>/gi,
            ''
          );
          content = content.replace(
            /<div[^>]*id="footer-placeholder"[^>]*>[\s\S]*?<\/div>/gi,
            ''
          );
          content = content.replace(
            /<div[^>]*loading-screen[^>]*>[\s\S]*?<\/div>/gi,
            ''
          );
          content = content.replace(/<script[\s\S]*?<\/script>/gi, '');

          document.getElementById('content-placeholder').innerHTML = content;
          console.log('✅ Contenido inyectado en content-placeholder');
        } else {
          console.error('❌ No se encontró elemento main en', fileName);
          await this.loadDefaultContent();
        }

        // Cargar CSS y JS específicos
        await this.loadPageCSS(pageName);
        await this.loadPageJS(pageName);
        this.hideLoaders();
        this.executePageScripts(pageName);
      } else {
        console.error('❌ Error al cargar archivo:', fileName);
        await this.loadDefaultContent();
      }
    } catch (error) {
      console.error('❌ Error al cargar contenido:', error);
      await this.loadDefaultContent();
    }
  }

  // Cargar contenido por defecto (inicio)
  async loadDefaultContent() {
    try {
      console.log('🔄 Cargando contenido por defecto...');
      const response = await fetch('inicio.html');
      if (response.ok) {
        const contentHTML = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(contentHTML, 'text/html');
        const bodyContent = doc.body.innerHTML;

        document.getElementById('content-placeholder').innerHTML = bodyContent;
        await this.loadPageCSS('inicio');
        await this.loadPageJS('inicio');
        this.hideLoaders();
        this.executePageScripts('inicio');
        console.log('✅ Contenido por defecto cargado');
      }
    } catch (error) {
      console.error('❌ Error al cargar contenido por defecto:', error);
      document.getElementById('content-placeholder').innerHTML = `
        <div class="container mt-5 pt-5">
          <div class="text-center">
            <h1>Error al cargar contenido</h1>
            <p>Por favor, recarga la página.</p>
          </div>
        </div>
      `;
    }
  }

  // Cargar footer
  async loadFooter() {
    try {
      console.log('📋 Cargando footer...');
      const response = await fetch('footer.html');
      if (response.ok) {
        const footerHTML = await response.text();
        document.getElementById('footer-placeholder').innerHTML = footerHTML;
        console.log('✅ Footer cargado');
      }
    } catch (error) {
      console.error('❌ Error al cargar footer:', error);
    }
  }

  // Ocultar loaders de carga
  hideLoaders() {
    const loaders = [
      '.loading-screen',
      '.d-flex.justify-content-center.align-items-center.min-vh-100',
      '[class*="loading"]',
      '[class*="spinner"]',
    ];

    loaders.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        if (
          element.textContent.toLowerCase().includes('cargando') ||
          element.querySelector('.spinner-border') ||
          element.classList.contains('loading-screen')
        ) {
          element.style.display = 'none';
        }
      });
    });

    console.log('✅ Loaders ocultados');
  }

  // Actualizar enlace activo del navbar
  updateActiveNavLink() {
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    navLinks.forEach((link) => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (
        href === `#${this.currentPage}` ||
        (this.currentPage === 'inicio' && href === '#inicio')
      ) {
        link.classList.add('active');
      }
    });
  }

  // Configurar navegación
  setupNavigation() {
    // Navegación por hash
    window.addEventListener('hashchange', () => {
      this.handleHashNavigation();
    });

    // Navegación por enlaces
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (link) {
        e.preventDefault();
        const page = link.getAttribute('href').substring(1);
        this.navigateToPage(page);
      }
    });
  }

  // Manejar navegación por hash
  handleHashNavigation() {
    const hash = window.location.hash.substring(1);
    if (hash && hash !== this.currentPage) {
      this.navigateToPage(hash);
    }
  }

  // Navegar a una página específica
  async navigateToPage(pageName) {
    if (pageName === this.currentPage) return;

    console.log('🧭 Navegando a:', pageName);
    this.currentPage = pageName;
    window.location.hash = pageName;

    await this.loadMainContent();
    this.updateActiveNavLink();
  }

  // Cargar CSS específico de página
  async loadPageCSS(pageName) {
    const cssFile = `css/${pageName}.css`;

    // Remover CSS anterior
    const existingCSS = document.querySelector(`link[href*="${pageName}.css"]`);
    if (existingCSS) {
      existingCSS.remove();
    }

    // Cargar nuevo CSS si existe
    try {
      const response = await fetch(cssFile);
      if (response.ok) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssFile;
        document.head.appendChild(link);
        console.log(`✅ CSS cargado para ${pageName}`);
      }
    } catch (error) {
      console.log(`⚠️ No se encontró CSS para ${pageName}`);
    }
  }

  // Cargar JavaScript específico de página
  async loadPageJS(pageName) {
    const jsFile = `js/${pageName}.js`;

    // Remover script anterior
    const existingScript = document.querySelector(
      `script[src*="${pageName}.js"]`
    );
    if (existingScript) {
      existingScript.remove();
    }

    // Cargar nuevo JavaScript si existe
    try {
      const response = await fetch(jsFile);
      if (response.ok) {
        const script = document.createElement('script');
        script.src = jsFile;
        script.defer = true;
        script.onload = () => {
          console.log(`✅ JavaScript cargado para ${pageName}`);
        };
        script.onerror = () => {
          console.log(`⚠️ Error al cargar JavaScript para ${pageName}`);
        };
        document.head.appendChild(script);
      }
    } catch (error) {
      console.log(`⚠️ No se encontró JavaScript para ${pageName}`);
    }
  }

  // Ejecutar scripts específicos de página
  executePageScripts(pageName) {
    switch (pageName) {
      case 'inicio':
        this.initInicioScripts();
        break;
      case 'contacto':
        this.initContactoScripts();
        break;
      case 'enviar-reserva':
        this.initReservaScripts();
        break;
      case 'flota':
        this.initFlotaScripts();
        break;
      case 'servicios':
        this.initServiciosScripts();
        break;
      case 'destinos':
        this.initDestinosScripts();
        break;
    }
  }

  // Scripts específicos de inicio
  initInicioScripts() {
    // Inicializar carruseles
    if (typeof bootstrap !== 'undefined') {
      const carousels = document.querySelectorAll('.carousel');
      carousels.forEach((carousel) => {
        new bootstrap.Carousel(carousel);
      });
    }
  }

  // Scripts específicos de contacto
  initContactoScripts() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener(
        'submit',
        this.handleContactFormSubmit.bind(this)
      );
    }
  }

  // Scripts específicos de reserva
  initReservaScripts() {
    const reservaForm = document.getElementById('reservaForm');
    if (reservaForm) {
      reservaForm.addEventListener(
        'submit',
        this.handleReservaFormSubmit.bind(this)
      );
    }
  }

  // Scripts específicos de flota
  initFlotaScripts() {
    if (typeof bootstrap !== 'undefined') {
      const carousels = document.querySelectorAll('.carousel');
      carousels.forEach((carousel) => {
        new bootstrap.Carousel(carousel);
      });
    }
  }

  // Scripts específicos de servicios
  initServiciosScripts() {
    // Scripts específicos para servicios
  }

  // Scripts específicos de destinos
  initDestinosScripts() {
    // Scripts específicos para destinos
  }

  // Inicializar AOS (Animate On Scroll)
  initializeAOS() {
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 1000,
        easing: 'ease-in-out',
        once: true,
      });
    }
  }

  // Manejar envío de formulario de contacto
  async handleContactFormSubmit(e) {
    e.preventDefault();
    // Implementar envío de formulario
    console.log('📧 Enviando formulario de contacto...');
  }

  // Manejar envío de formulario de reserva
  async handleReservaFormSubmit(e) {
    e.preventDefault();
    // Implementar envío de formulario
    console.log('📋 Enviando formulario de reserva...');
  }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  console.log('🌟 DOM cargado, inicializando VSP Tours...');
  new VSPToursApp();
});

// También inicializar si el DOM ya está cargado
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 DOM cargado (tardío), inicializando VSP Tours...');
    new VSPToursApp();
  });
} else {
  console.log('🌟 DOM ya cargado, inicializando VSP Tours inmediatamente...');
  new VSPToursApp();
}
