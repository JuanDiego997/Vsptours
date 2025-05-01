document
  .getElementById('registerForm')
  .addEventListener('submit', function (e) {
    e.preventDefault();

    const name = this.name.value.trim();
    const email = this.email.value.trim();
    const pass = this.password.value.trim();
    const conf = this.confirm.value.trim();
    const phone = this.phone.value.trim(); // Obtener el valor del teléfono

    if (!name || !email || !pass || !conf || !phone) {
      showErrorModal('Completa todos los campos.');
      return;
    }

    if (pass !== conf) {
      showErrorModal('Las contraseñas no coinciden.');
      return;
    }

    const phonePattern = /^(9\d{8}|01\d{8})$/;
    if (!phonePattern.test(phone)) {
      showErrorModal(
        'Ingresa un número de teléfono válido de Perú (9XXXXXXXX para móviles o 01XXXXXXXX para líneas fijas).'
      );
      return;
    }

    // Si todo es válido, mostrar éxito y redirigir al login
    alert('¡Registro exitoso, ' + name + '!');
    window.location.href = 'login.html';
  });

// Función para mostrar el modal de error con el mensaje
function showErrorModal(message) {
  const errorMessageElement = document.getElementById('errorMessage');
  errorMessageElement.textContent = message;
  const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
  errorModal.show();
}
