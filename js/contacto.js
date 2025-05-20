// Inicialización de EmailJS
(function () {
  emailjs.init('q1_PHTEbMiTgDJdCc');
})();

// Envío del formulario con doble plantilla
function enviarCorreo(e) {
  e.preventDefault();

  const form = document.getElementById('contactForm');

  emailjs
    .sendForm('service_bj9l6ef', 'template_3l71ex2', form)
    .then(() => {
      console.log('Correo enviado a la empresa correctamente.');
      return emailjs.sendForm('service_bj9l6ef', 'template_m65w6kr', form);
    })
    .then(() => {
      mostrarModal(
        '¡Mensaje enviado!',
        'Te hemos enviado una copia a tu correo. Gracias por contactarnos.'
      );
      form.reset();
    })
    .catch((error) => {
      console.error('Error al enviar el correo:', error);
      mostrarModal(
        'Error al enviar',
        'Hubo un problema al enviar tu mensaje. Por favor, intenta nuevamente más tarde.'
      );
    });
}

// Mostrar el modal con mensaje dinámico
function mostrarModal(titulo, mensaje) {
  const overlay = document.getElementById('modal-overlay');
  const modal = document.getElementById('modal');
  const iconoCheck = document.querySelector('.checkmark-container');
  const tituloElem = document.getElementById('modalTitulo');
  const mensajeElem = document.getElementById('modalMensaje');

  // Mostrar check solo si es éxito
  if (titulo.toLowerCase().includes('error')) {
    iconoCheck.style.display = 'none';
  } else {
    iconoCheck.style.display = 'flex';
  }

  tituloElem.innerText = titulo;
  mensajeElem.innerText = mensaje;

  overlay.classList.add('active');
  modal.classList.add('active');
}

// Cerrar el modal
function cerrarModal() {
  document.getElementById('modal-overlay').classList.remove('active');
  document.getElementById('modal').classList.remove('active');
}
