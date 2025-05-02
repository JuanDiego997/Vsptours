(function () {
  emailjs.init('q1_PHTEbMiTgDJdCc');
})();

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
      alert('¡Mensaje enviado! Te hemos enviado una copia.');
      form.reset();
    })
    .catch((error) => {
      console.error('Error al enviar el correo:', error);
      alert('Error al enviar mensaje. Inténtalo de nuevo.');
    });
}
