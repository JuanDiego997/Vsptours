document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const email = this.email.value.trim();
  const pass = this.password.value.trim();
  if (!email || !pass) {
    return alert('Por favor, completa todos los campos.');
  }

  window.location.href = 'dashboard.html';
});

document.getElementById('googleLogin').addEventListener('click', function () {
  window.location.href = 'https://accounts.google.com/signin';
});
document.getElementById('facebookLogin').addEventListener('click', function () {
  window.location.href = 'https://www.facebook.com/login';
});
