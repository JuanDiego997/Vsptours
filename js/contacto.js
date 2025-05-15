(function () {
  // Inicializa EmailJS con tu clave pública (ya está correcta)
  emailjs.init('q1_PHTEbMiTgDJdCc');
})();

function enviarCorreo(e) {
  e.preventDefault(); // Evita el comportamiento por defecto del formulario

  const form = document.getElementById('contactForm'); // Obtén el formulario

  // Enviar el formulario usando el primer template
  emailjs
    .sendForm('service_bj9l6ef', 'template_3l71ex2', form)
    .then(() => {
      console.log('Correo enviado a la empresa correctamente.');

      // Después de enviar el primer correo, enviar el segundo (copia al usuario)
      return emailjs.sendForm('service_bj9l6ef', 'template_m65w6kr', form);
    })
    .then(() => {
      alert('¡Mensaje enviado! Te hemos enviado una copia.');
      form.reset(); // Resetea el formulario después de enviar el mensaje
    })
    .catch((error) => {
      console.error('Error al enviar el correo:', error);
      alert('Error al enviar mensaje. Inténtalo de nuevo.'); // Muestra un mensaje de error si algo falla
    });
}
