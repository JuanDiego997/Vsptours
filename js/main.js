function loadLayout() {
  // Cargar Navbar
  fetch('navbar.html')
    .then((res) => res.text())
    .then((html) => {
      document.getElementById('navbar-placeholder').innerHTML = html;

      const script = document.createElement('script');
      script.src = 'js/navbar.js';
      script.defer = true;
      document.body.appendChild(script);

      const link = document.createElement('link');
      link.rel = 'stylesheet'; //
      link.href = 'css/navbar.css';
      document.head.appendChild(link);
    });

  fetch('footer.html')
    .then((res) => res.text())
    .then((html) => {
      document.getElementById('footer-placeholder').innerHTML = html;

      const script = document.createElement('script');
      script.src = 'js/footer.js';
      script.defer = true;
      document.body.appendChild(script);

      const link = document.createElement('link');
      link.rel = 'stylesheet'; //
      link.href = 'css/footer.css';
      document.head.appendChild(link);
    });
}

function loadPage(page) {
  const cssName = `${page}.css`;
  loadCSS(`css/${cssName}`);
  fetch(`${page}.html`)
    .then((res) => res.text())
    .then((html) => {
      document.getElementById('content-placeholder').innerHTML = html;

      const scriptName = `${page}.js`;
      loadScript(`js/${scriptName}`);

      // Mover scroll al top después de cargar la página
      window.scrollTo(0, 0);
    })
    .catch(() => {
      document.getElementById('content-placeholder').innerHTML =
        '<h2>Página no encontrada 😢</h2>';
      window.scrollTo(0, 0);
    });
}

function loadScript(src) {
  const oldScript = document.getElementById('page-script');
  if (oldScript) {
    oldScript.remove();
  }

  const script = document.createElement('script');
  script.src = src;
  script.id = 'page-script';
  script.defer = true;
  document.body.appendChild(script);

  const link = document.createElement('link');
  link.rel = 'stylesheet'; //
  link.href = 'css/navbar.css';
  document.head.appendChild(link);
}

function loadCSS(href) {
  const oldLink = document.getElementById('page-style');
  if (oldLink) {
    oldLink.remove();
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.id = 'page-style';
  document.head.appendChild(link);
}

window.addEventListener('hashchange', () => {
  const page = location.hash.substring(1) || 'inicio';
  loadPage(page);
});

window.addEventListener('DOMContentLoaded', () => {
  loadLayout();
  const page = location.hash.substring(1) || 'inicio';
  loadPage(page);
});
