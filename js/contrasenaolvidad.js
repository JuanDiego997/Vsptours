document.getElementById('recoverForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const email = this.email.value.trim();
  if (!email) return alert('Por favor ingresa tu correo.');

  alert('Se ha enviado un enlace de recuperación a ' + email);
  this.reset();
});
