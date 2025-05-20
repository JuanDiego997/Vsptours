lucide.createIcons();

let marker;

const map = L.map('map').setView([-12.0464, -77.0428], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
}).addTo(map);

const limaBounds = [
  [-12.305, -77.1674],
  [-11.7439, -76.6782],
];
map.setMaxBounds(limaBounds);

map.on('click', async (e) => {
  const { lat, lng } = e.latlng;

  if (
    lat < limaBounds[0][0] ||
    lat > limaBounds[1][0] ||
    lng < limaBounds[0][1] ||
    lng > limaBounds[1][1]
  ) {
    mostrarModal(
      'Ubicación fuera de Lima',
      'Selecciona una ubicación dentro de Lima, por favor.'
    );
    return;
  }

  if (marker) {
    marker.setLatLng(e.latlng);
  } else {
    marker = L.marker(e.latlng).addTo(map);
  }

  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const direccion = data.display_name || 'Dirección no encontrada';

    document.getElementById('ubicacion').value = direccion;
    document.getElementById('direccionSeleccionada').textContent = direccion;
  } catch (error) {
    console.error('Error al obtener la dirección:', error);
    mostrarModal('Error', 'No se pudo obtener la dirección desde el mapa.');
  }
});

// Función para detectar si es dispositivo móvil
function esDispositivoMovil() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

document.getElementById('reservaForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const nombre = document.getElementById('nombre').value.trim();
  const apellidos = document.getElementById('apellidos').value.trim();
  const correo = document.getElementById('correo').value.trim();
  const numero = document.getElementById('numero').value.trim();
  const ubicacion = document.getElementById('ubicacion').value.trim();
  const distrito = document.getElementById('distrito').value;
  const destino = document.getElementById('destino').value.trim();
  const pasajeros = document.getElementById('pasajeros').value.trim();
  const movilidad = document.getElementById('movilidad').value;
  const fecha = document.getElementById('fechaViaje').value;
  const tipoServicio = document.getElementById('tipoServicio').value;

  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  if (!emailRegex.test(correo)) {
    mostrarModal(
      'Correo inválido',
      'El formato del correo electrónico no es válido.'
    );
    return;
  }

  if (!/^9[0-9]{8}$/.test(numero)) {
    mostrarModal(
      'Número inválido',
      'El número debe empezar con 9 y tener exactamente 9 dígitos.'
    );
    return;
  }

  if (
    !ubicacion ||
    ubicacion === 'No se pudo obtener la dirección' ||
    ubicacion === ''
  ) {
    mostrarModal(
      'Ubicación no válida',
      'Por favor, selecciona una ubicación válida en el mapa.'
    );
    return;
  }

  if (!movilidad || movilidad === 'Selecciona') {
    mostrarModal(
      'Tipo de servicio faltante',
      'Selecciona el tipo de movilidad que deseas reservar.'
    );
    return;
  }

  if (!fecha) {
    mostrarModal(
      'Fecha requerida',
      'Por favor, selecciona una fecha para tu viaje.'
    );
    return;
  }

  const fechaFormateada = new Date(fecha).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (!tipoServicio || tipoServicio === 'Selecciona') {
    mostrarModal(
      'Tipo de servicio faltante',
      'Selecciona el tipo de servicio que deseas reservar.'
    );
    return;
  }

  const mensajeWhatsApp = `Hola, quiero reservar un viaje. Aquí están mis datos:
*Nombre:* ${nombre} ${apellidos}
*Celular:* ${numero}
*Correo:* ${correo}
*Distrito:* ${distrito}
*Destino:* ${destino}
*Pasajeros:* ${pasajeros}
*Movilidad:* ${movilidad}
*Tipo de servicio:* ${tipoServicio}
*Fecha del viaje:* ${fechaFormateada}
*Ubicación de recojo:* ${ubicacion}`;

  const numeroWhatsApp = '51928626343';

  let urlWhatsApp;

  if (esDispositivoMovil()) {
    // Abre app WhatsApp en móviles
    urlWhatsApp = `whatsapp://send?phone=${numeroWhatsApp}&text=${encodeURIComponent(
      mensajeWhatsApp
    )}`;
  } else {
    // Abre WhatsApp Web en PC
    urlWhatsApp = `https://web.whatsapp.com/send?phone=${numeroWhatsApp}&text=${encodeURIComponent(
      mensajeWhatsApp
    )}`;
  }

  window.open(urlWhatsApp, '_blank');
});

// Función para mostrar modales bonitos
function mostrarModal(titulo, mensaje) {
  const modal = document.getElementById('modal');
  const overlay = document.getElementById('modal-overlay');

  document.getElementById('modalTitulo').innerText = titulo;
  document.getElementById('modalMensaje').innerText = mensaje;

  overlay.style.display = 'block';
  modal.classList.add('active');
}

function cerrarModal() {
  document.getElementById('modal-overlay').style.display = 'none';
  document.getElementById('modal').classList.remove('active');
}

// Luxon para fecha
const DateTime = luxon.DateTime;
const inputFecha = document.getElementById('fechaViaje');
const hoy = new Date();
const manana = new Date(hoy);
manana.setDate(manana.getDate() + 1);
const maximo = new Date(hoy);
maximo.setFullYear(maximo.getFullYear() + 1);

const formatoFecha = (fecha) => fecha.toISOString().split('T')[0];
inputFecha.min = formatoFecha(manana);
inputFecha.max = formatoFecha(maximo);

inputFecha.addEventListener('change', function () {
  const inputDate = this.value;
  if (inputDate) {
    const fecha = DateTime.fromISO(inputDate, { zone: 'local' }).setLocale(
      'es'
    );
    const fechaFormateada = fecha.toLocaleString(DateTime.DATE_HUGE);
    document.getElementById('fechaLegible').textContent = fechaFormateada;
  } else {
    document.getElementById('fechaLegible').textContent = 'Ninguna';
  }
});
