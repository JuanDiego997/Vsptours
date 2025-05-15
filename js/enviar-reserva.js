lucide.createIcons();
emailjs.init('c7NApXMmxX3q0Faeh');
let marker;

const map = L.map('map').setView([-12.0464, -77.0428], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
}).addTo(map);

// Limitar el área visible a Lima (aproximadamente)
const limaBounds = [
  [-12.305, -77.1674], // Suroeste de Lima
  [-11.7439, -76.6782], // Noroeste de Lima
];
map.setMaxBounds(limaBounds);

map.on('click', async function (e) {
  if (marker) {
    marker.setLatLng(e.latlng);
  } else {
    marker = L.marker(e.latlng).addTo(map);
  }

  const url = `https://nominatim.openstreetmap.org/reverse?lat=${e.latlng.lat}&lon=${e.latlng.lng}&format=json`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const direccion = data.display_name || 'Dirección no encontrada';

    // Validar que la ubicación esté dentro de Lima
    if (
      e.latlng.lat < limaBounds[0][0] ||
      e.latlng.lat > limaBounds[1][0] ||
      e.latlng.lng < limaBounds[0][1] ||
      e.latlng.lng > limaBounds[1][1]
    ) {
      mostrarError(
        'La ubicación seleccionada no está dentro de Lima. Por favor, selecciona una ubicación dentro de Lima.'
      );
      return;
    }

    // Guardamos y mostramos la dirección
    document.getElementById('ubicacion').value = direccion;
    document.getElementById('direccionSeleccionada').textContent = direccion;
  } catch (error) {
    console.error('Error al obtener la dirección:', error);
    document.getElementById('ubicacion').value =
      'No se pudo obtener la dirección';
    document.getElementById('direccionSeleccionada').textContent =
      'No disponible';
  }
});

document.getElementById('reservaForm').addEventListener('submit', function (e) {
  e.preventDefault();

  // 1. Validaciones
  const correo = document.getElementById('correo');
  const numero = document.getElementById('numero');
  const ubicacion = document.getElementById('ubicacion').value.trim(); // Asegúrate de usar .trim() para limpiar espacios extra.

  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

  // Validación de correo
  if (!emailRegex.test(correo.value)) {
    mostrarError('El formato del correo electrónico no es válido.');
    return;
  }

  // Validación de número de teléfono
  if (!/^9[0-9]{8}$/.test(numero.value)) {
    mostrarError('El número debe empezar con 9 y tener exactamente 9 dígitos.');
    return;
  }

  // **Validación de la ubicación**
  if (
    !ubicacion ||
    ubicacion === 'No se pudo obtener la dirección' ||
    ubicacion === 'No se seleccionó ubicación'
  ) {
    mostrarError('¡Por favor selecciona una ubicación de recojo!');
    return;
  }

  // 2. Capturar los valores
  const nombre = document.getElementById('nombre').value.trim();
  const apellidos = document.getElementById('apellidos').value.trim();
  const distrito = document.getElementById('distrito').value;
  const destino = document.getElementById('destino').value.trim();
  const pasajeros = document.getElementById('pasajeros').value.trim();
  const movilidad = document.getElementById('movilidad').value;

  // 3. Mensaje para WhatsApp
  const fecha = document.getElementById('fechaViaje').value;
  const fechaFormateada = new Date(fecha).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const mensaje = `Hola, quiero reservar un viaje. Aquí están mis datos:
*Nombre:* ${nombre} ${apellidos}
*Celular:* ${numero.value}
*Correo:* ${correo.value}
*Distrito:* ${distrito}
*Destino:* ${destino}
*Pasajeros:* ${pasajeros}
*Movilidad:* ${movilidad}
*Fecha del viaje:* ${fechaFormateada}
*Ubicación de recojo:* ${ubicacion}`;

  const numeroWhatsApp = '51928626343';
  const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(
    mensaje
  )}`;
  window.open(url, '_blank');

  // 4. Envío por correo usando EmailJS
  emailjs.sendForm('service_v87i4vw', 'template_3fdpnur', this).then(
    function () {
      alert('¡Reserva realizada con éxito!');
    },
    function (error) {
      console.error('Error al enviar el correo:', error);
      alert('Hubo un error al realizar la reserva. Intenta nuevamente.');
    }
  );

  // 5. Enviar una confirmación al usuario
  const confirmationMessage = `¡Hola ${nombre}!

Gracias por tu reserva. Aquí están los detalles:

*Destino:* ${destino}
*Fecha del viaje:* ${fechaFormateada}
*Pasajeros:* ${pasajeros}
*Ubicación de recojo:* ${ubicacion}

Nos pondremos en contacto contigo pronto para confirmar tu viaje.

¡Gracias por elegirnos!`;

  emailjs
    .send('service_v87i4vw', 'template_oo8k09b', {
      correo_usuario: correo.value, // Asegúrate de tener este campo en tu plantilla de correo de confirmación
      mensaje: confirmationMessage,
    })
    .then(
      function () {
        console.log('Correo de confirmación enviado');
      },
      function (error) {
        console.error('Error al enviar el correo de confirmación:', error);
      }
    );
});

function mostrarError(mensaje) {
  // Mostrar el fondo semitransparente
  document.getElementById('modal-overlay').style.display = 'block';

  // Mostrar el modal con la clase 'active' para la animación
  const modal = document.getElementById('modal');
  modal.classList.add('active');

  // Mostrar el mensaje de error
  document.getElementById('modalMensaje').innerText = mensaje;
}

// Cerrar el modal
function cerrarModal() {
  // Ocultar el fondo semitransparente y el modal con animación
  document.getElementById('modal-overlay').style.display = 'none';

  const modal = document.getElementById('modal');
  modal.classList.remove('active'); // Eliminar la clase para la animación
}

const DateTime = luxon.DateTime;

document.getElementById('fechaViaje').addEventListener('change', function () {
  const inputDate = this.value; // La fecha en formato YYYY-MM-DD
  if (inputDate) {
    // Crear un objeto DateTime directamente desde el valor del input
    const fecha = DateTime.fromISO(inputDate, { zone: 'local' }).setLocale(
      'es'
    );

    // Obtener la fecha formateada en español
    const fechaFormateada = fecha.toLocaleString(DateTime.DATE_HUGE); // Ej: "martes, 5 de mayo de 2025"
    document.getElementById('fechaLegible').textContent = fechaFormateada;
  }
});

const inputFecha = document.getElementById('fechaViaje');

// Definir el mínimo y máximo de la fecha
const hoy = new Date();
const manana = new Date(hoy);
manana.setDate(manana.getDate() + 1); // Día siguiente

const maximo = new Date(hoy);
maximo.setFullYear(maximo.getFullYear() + 1); // Un año después

// Convertir a formato YYYY-MM-DD
const formato = (fecha) => fecha.toISOString().split('T')[0];

inputFecha.min = formato(manana);
inputFecha.max = formato(maximo);

// Usar Luxon para formatear la fecha en formato 'es-PE' (español de Perú)
inputFecha.addEventListener('change', function () {
  const inputDate = this.value; // La fecha en formato YYYY-MM-DD
  if (inputDate) {
    const fecha = DateTime.fromISO(inputDate, { zone: 'local' }).setLocale(
      'es'
    );
    const fechaFormateada = fecha.toLocaleString(DateTime.DATE_HUGE); // Ej: "martes, 5 de mayo de 2025"
    document.getElementById('fechaLegible').textContent = fechaFormateada;
  } else {
    document.getElementById('fechaLegible').textContent = 'Ninguna';
  }
});
