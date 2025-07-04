// Script de redirección para páginas directas
// Este script se ejecuta cuando alguien accede directamente a una página específica

(function () {
  console.log('Detectado acceso directo a página específica');

  // Obtener el nombre de la página actual
  const currentPath = window.location.pathname;
  const pageName = currentPath.substring(currentPath.lastIndexOf('/') + 1);

  // Si no es index.html, redirigir al sistema SPA
  if (pageName && pageName !== 'index.html' && pageName.endsWith('.html')) {
    const pageWithoutExtension = pageName.replace('.html', '');

    console.log(`Redirigiendo de ${pageName} al sistema SPA...`);

    // Redirigir al index con el hash de la página
    window.location.href = `/index.html#${pageWithoutExtension}`;
  }
})();
