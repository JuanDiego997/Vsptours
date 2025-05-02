(() => {
  const inputCorreo = document.getElementById("inputCorreo");
  const btnSuscribirse = document.getElementById("btnSuscribirse");

  if (!inputCorreo || !btnSuscribirse) {
    console.warn("inputCorreo o btnSuscribirse no encontrados.");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

  inputCorreo.addEventListener("input", () => {
    btnSuscribirse.disabled = !emailRegex.test(inputCorreo.value.trim());
  });

  window.alertaSuscripcion = function(event) {
    event.preventDefault();

    const modal = new bootstrap.Modal(document.getElementById("modalSuscripcion"));
    modal.show();

    inputCorreo.value = "";
    btnSuscribirse.disabled = true;
  };
})();

