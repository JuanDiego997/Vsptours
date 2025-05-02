function cargarModal(titulo, descripcion) {
  document.getElementById('modalDestinoLabel').textContent = titulo;
  document.getElementById('modalDestinoContenido').textContent = descripcion;
}

document
  .getElementById('buscadorDestinos')
  .addEventListener('input', function () {
    const filtro = this.value.toLowerCase();
    document
      .querySelectorAll('#contenedorDestinos .destino')
      .forEach((card) => {
        const nombre = card.getAttribute('data-nombre').toLowerCase();
        card.style.display = nombre.includes(filtro) ? '' : 'none';
      });
  });
