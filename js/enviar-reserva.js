// JavaScript mejorado para la página de reservas
console.log('Cargando sistema de reservas VSP Tours...');

// Variables globales
let map;
let marker;
const DateTime = luxon.DateTime;

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM cargado, inicializando sistema de reservas...');

  // Inicializar componentes
  initializeMap();
  initializeDatePicker();
  initializeVehicleSelection();
  initializeFormValidation();
  initializeRealTimeUpdates();

  console.log('Sistema de reservas inicializado correctamente');
});

// Inicializar mapa de Leaflet
function initializeMap() {
  try {
    // Crear mapa centrado en Lima
    map = L.map('map').setView([-12.0464, -77.0428], 13);

    // Agregar capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    // Límites de Lima
    const limaBounds = [
      [-12.305, -77.1674], // Suroeste
      [-11.7439, -76.6782], // Noreste
    ];

    map.setMaxBounds(limaBounds);
    map.setMinZoom(11);

    // Event listener para clics en el mapa
    map.on('click', handleMapClick);

    // Agregar marcador inicial en el centro
    marker = L.marker([-12.0464, -77.0428])
      .addTo(map)
      .bindPopup(
        'Haz clic en cualquier lugar del mapa para cambiar la ubicación'
      )
      .openPopup();

    console.log('Mapa inicializado correctamente');
  } catch (error) {
    console.error('Error al inicializar el mapa:', error);
    showModal(
      'Error de Mapa',
      'No se pudo cargar el mapa. Por favor, recarga la página.'
    );
  }
}

// Detectar si el usuario está en un dispositivo móvil
function isMobileDevice() {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth <= 768
  );
}

// Manejar clics en el mapa (optimizado para móviles)
async function handleMapClick(e) {
  const { lat, lng } = e.latlng;

  // Verificar si está dentro de los límites de Lima
  const limaBounds = [
    [-12.305, -77.1674],
    [-11.7439, -76.6782],
  ];

  if (
    lat < limaBounds[0][0] ||
    lat > limaBounds[1][0] ||
    lng < limaBounds[0][1] ||
    lng > limaBounds[1][1]
  ) {
    showModal(
      'Ubicación fuera de Lima',
      'Por favor, selecciona una ubicación dentro de Lima.'
    );
    return;
  }

  // Mover o crear marcador
  if (marker) {
    marker.setLatLng(e.latlng);
  } else {
    marker = L.marker(e.latlng).addTo(map);
  }

  // Estrategia diferente para móviles
  const isMobile = isMobileDevice();
  if (isMobile) {
    console.log('Dispositivo móvil detectado, usando estrategia optimizada');

    // Mostrar mensaje de carga
    document.getElementById('direccionSeleccionada').textContent =
      'Obteniendo dirección...';

    // Obtener zona como fallback
    const zona = detectarZonaLima(lat, lng);
    let direccionFallback = `${zona}, Lima`;

    // Intentar geocodificación con timeout más corto para móviles
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos para móviles

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=es&limit=1`,
        {
          signal: controller.signal,
          headers: {
            'User-Agent': 'VSPTours-Mobile/1.0',
          },
        }
      );

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        console.log('Datos geocodificación móvil:', data);

        if (data && (data.address || data.display_name)) {
          const direccionDetallada = formatAddressMobile(data);
          console.log(
            'Dirección detallada obtenida en móvil:',
            direccionDetallada
          );

          // Actualizar con dirección detallada
          document.getElementById('ubicacion').value = direccionDetallada;
          document.getElementById('direccionSeleccionada').textContent =
            direccionDetallada;

          marker
            .bindPopup(
              `<strong>Ubicación seleccionada:</strong><br>${direccionDetallada}`
            )
            .openPopup();
          return; // Éxito, salir de la función
        }
      }

      throw new Error('No se pudo obtener dirección detallada');
    } catch (error) {
      console.warn('Geocodificación falló en móvil:', error.message);

      // Fallback: usar zona detectada localmente
      console.log('Usando dirección fallback:', direccionFallback);
      document.getElementById('ubicacion').value = direccionFallback;
      document.getElementById('direccionSeleccionada').textContent =
        direccionFallback;

      marker
        .bindPopup(
          `<strong>Ubicación seleccionada:</strong><br>${direccionFallback}`
        )
        .openPopup();
    }
  } else {
    // Estrategia completa para desktop
    console.log('Dispositivo desktop detectado, usando estrategia completa');
    await geocodificarUbicacionCompleta(lat, lng);
  }
}

// Función de geocodificación completa para desktop
async function geocodificarUbicacionCompleta(lat, lng) {
  // Obtener dirección usando geocodificación inversa (mejorado para móviles)
  try {
    console.log('Obteniendo dirección para:', lat, lng);

    // Mostrar un mensaje de carga mientras se obtiene la dirección
    document.getElementById('direccionSeleccionada').textContent =
      'Obteniendo dirección...';

    // Intentar múltiples servicios de geocodificación
    let direccion = null;

    // Primer intento: Nominatim con timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos timeout

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=es`,
        {
          signal: controller.signal,
          headers: {
            'User-Agent': 'VSPTours-WebApp/1.0',
          },
        }
      );

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        direccion = formatAddress(data);
        console.log('Dirección obtenida (Nominatim):', direccion);
      }
    } catch (nominatimError) {
      console.warn('Error con Nominatim:', nominatimError);
    }

    // Si Nominatim falló, intentar con un servicio alternativo
    if (!direccion) {
      try {
        // Usar servicio de geocodificación de OpenCage (alternativo)
        const response = await fetch(
          `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=YOUR_API_KEY&language=es&limit=1`
        );

        if (response.ok) {
          const data = await response.json();
          if (data.results && data.results.length > 0) {
            direccion = data.results[0].formatted;
            console.log('Dirección obtenida (OpenCage):', direccion);
          }
        }
      } catch (opencageError) {
        console.warn('Error con OpenCage:', opencageError);
      }
    }

    // Si todos los servicios fallaron, generar una dirección aproximada
    if (!direccion) {
      // Detectar zona aproximada basada en coordenadas
      const zona = detectarZonaLima(lat, lng);
      direccion = `${zona}, Lima - Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(
        4
      )}`;
      console.log('Dirección generada localmente:', direccion);
    }

    // Actualizar campo de ubicación
    document.getElementById('ubicacion').value = direccion;
    document.getElementById('direccionSeleccionada').textContent = direccion;

    // Actualizar popup del marcador
    marker
      .bindPopup(`<strong>Ubicación seleccionada:</strong><br>${direccion}`)
      .openPopup();
  } catch (error) {
    console.error('Error general al obtener dirección:', error);

    // Fallback: detectar zona y mostrar coordenadas
    const zona = detectarZonaLima(lat, lng);
    const direccionFallback = `${zona}, Lima - ${lat.toFixed(4)}, ${lng.toFixed(
      4
    )}`;

    document.getElementById('ubicacion').value = direccionFallback;
    document.getElementById('direccionSeleccionada').textContent =
      direccionFallback;

    marker
      .bindPopup(
        `<strong>Ubicación seleccionada:</strong><br>${direccionFallback}`
      )
      .openPopup();
  }
}

// Formatear dirección obtenida de la geocodificación (mejorado)
function formatAddress(data) {
  if (!data || !data.address) {
    return data.display_name || 'Dirección no disponible';
  }

  const components = data.address;
  const parts = [];

  // Construir dirección en orden lógico para Perú
  if (components.road || components.street) {
    let calle = components.road || components.street;
    if (components.house_number) {
      calle += ` ${components.house_number}`;
    }
    parts.push(calle);
  }

  // Añadir barrio/urbanización
  if (components.neighbourhood || components.suburb || components.residential) {
    parts.push(
      components.neighbourhood || components.suburb || components.residential
    );
  }

  // Añadir distrito
  if (components.city_district || components.municipality) {
    parts.push(components.city_district || components.municipality);
  }

  // Añadir ciudad (Lima)
  if (components.city || components.town || components.county) {
    const ciudad = components.city || components.town || components.county;
    if (ciudad.toLowerCase() !== 'lima') {
      parts.push(ciudad);
    }
    parts.push('Lima');
  } else {
    parts.push('Lima');
  }

  // Si no tenemos suficientes componentes, usar display_name pero limpiarlo
  if (parts.length < 2) {
    let direccion = data.display_name;

    // Limpiar y simplificar el display_name
    direccion = direccion.split(',').slice(0, 3).join(', ');

    // Asegurar que termine con Lima si no está presente
    if (!direccion.toLowerCase().includes('lima')) {
      direccion += ', Lima';
    }

    return direccion;
  }

  return parts.join(', ');
}

// Formatear dirección específicamente para móviles (más agresivo en extraer datos)
function formatAddressMobile(data) {
  if (!data) {
    return 'Dirección no disponible';
  }

  console.log('Formateando dirección para móvil:', data);

  // Si tenemos componentes de address, usarlos
  if (data.address) {
    const components = data.address;
    const parts = [];

    // Priorizar obtener calle/avenida en móviles
    let calle = null;

    // Buscar en múltiples campos posibles para la calle
    const calleFields = [
      'road',
      'street',
      'highway',
      'pedestrian',
      'path',
      'cycleway',
    ];
    for (const field of calleFields) {
      if (components[field]) {
        calle = components[field];
        break;
      }
    }

    // Si encontramos calle, construir dirección con número
    if (calle) {
      if (components.house_number) {
        parts.push(`${calle} ${components.house_number}`);
      } else {
        parts.push(calle);
      }
    }

    // Añadir barrio/urbanización si existe
    const barrioFields = [
      'neighbourhood',
      'suburb',
      'residential',
      'quarter',
      'hamlet',
    ];
    for (const field of barrioFields) {
      if (components[field]) {
        parts.push(components[field]);
        break;
      }
    }

    // Añadir distrito
    const distritoFields = ['city_district', 'municipality', 'town', 'village'];
    for (const field of distritoFields) {
      if (components[field]) {
        parts.push(components[field]);
        break;
      }
    }

    // Asegurar que termine con Lima
    if (!parts.some((part) => part.toLowerCase().includes('lima'))) {
      parts.push('Lima');
    }

    // Si tenemos al menos una calle, devolver resultado
    if (parts.length >= 2 && calle) {
      const resultado = parts.join(', ');
      console.log('Dirección formateada para móvil (con calle):', resultado);
      return resultado;
    }
  }

  // Fallback: usar display_name pero intentar extraer partes útiles
  if (data.display_name) {
    let direccion = data.display_name;

    // Dividir por comas y tomar las primeras 3-4 partes más relevantes
    const partes = direccion.split(',').map((p) => p.trim());

    // Filtrar partes que no queremos (códigos postales, país, etc.)
    const partesUtiles = partes.filter((parte) => {
      const lower = parte.toLowerCase();
      return (
        !lower.includes('peru') &&
        !lower.includes('perú') &&
        !/^\d{5}$/.test(parte) && // código postal
        !lower.includes('provincia') &&
        !lower.includes('región')
      );
    });

    // Tomar máximo 4 partes y asegurar que termine con Lima
    let direccionLimpia = partesUtiles.slice(0, 3).join(', ');

    if (!direccionLimpia.toLowerCase().includes('lima')) {
      direccionLimpia += ', Lima';
    }

    console.log(
      'Dirección formateada para móvil (display_name):',
      direccionLimpia
    );
    return direccionLimpia;
  }

  // Último fallback
  console.log('Usando fallback final para móvil');
  return 'Ubicación en Lima';
}

// Inicializar selector de fecha
function initializeDatePicker() {
  const inputFecha = document.getElementById('fechaViaje');
  const fechaLegible = document.getElementById('fechaLegible');

  // Configurar fecha mínima (mañana) y máxima (1 año)
  const hoy = new Date();
  const manana = new Date(hoy);
  manana.setDate(manana.getDate() + 1);
  const maximo = new Date(hoy);
  maximo.setFullYear(maximo.getFullYear() + 1);

  inputFecha.min = formatDate(manana);
  inputFecha.max = formatDate(maximo);

  // Event listener para cambios de fecha
  inputFecha.addEventListener('change', function () {
    if (this.value) {
      const fecha = DateTime.fromISO(this.value, { zone: 'local' }).setLocale(
        'es'
      );
      const fechaFormateada = fecha.toLocaleString(DateTime.DATE_HUGE);
      fechaLegible.textContent = fechaFormateada;
    } else {
      fechaLegible.textContent = 'No seleccionada';
    }
  });
}

// Formatear fecha para input
function formatDate(fecha) {
  return fecha.toISOString().split('T')[0];
}

// Inicializar selección de vehículos
function initializeVehicleSelection() {
  const vehicleCards = document.querySelectorAll('.vehicle-card');
  const movilidadInput = document.getElementById('movilidad');
  const vehiculoSeleccionado = document.getElementById('vehiculoSeleccionado');

  vehicleCards.forEach((card) => {
    card.addEventListener('click', function () {
      // Remover selección anterior
      vehicleCards.forEach((c) => c.classList.remove('selected'));

      // Agregar selección actual
      this.classList.add('selected');

      // Actualizar valor
      const valor = this.dataset.value;
      movilidadInput.value = valor;
      vehiculoSeleccionado.textContent = valor;

      // Animación de confirmación
      this.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.style.transform = '';
      }, 150);
    });
  });
}

// Inicializar validación del formulario
function initializeFormValidation() {
  const form = document.getElementById('reservaForm');

  form.addEventListener('submit', handleFormSubmit);

  // Validación en tiempo real
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach((input) => {
    input.addEventListener('blur', validateField);
    input.addEventListener('input', clearFieldError);
  });
}

// Manejar envío del formulario
function handleFormSubmit(e) {
  e.preventDefault();

  console.log('Enviando formulario de reserva...');

  // Obtener datos del formulario
  const formData = getFormData();

  // Validar formulario
  const validation = validateForm(formData);
  if (!validation.isValid) {
    showModal('Datos Incompletos', validation.message);
    return;
  }

  // Generar mensaje de WhatsApp
  const mensajeWhatsApp = generateWhatsAppMessage(formData);

  // Abrir WhatsApp
  openWhatsApp(mensajeWhatsApp);
}

// Obtener datos del formulario
function getFormData() {
  return {
    nombre: document.getElementById('nombre').value.trim(),
    apellidos: document.getElementById('apellidos').value.trim(),
    correo: document.getElementById('correo').value.trim(),
    numero: document.getElementById('numero').value.trim(),
    distrito: document.getElementById('distrito').value,
    destino: document.getElementById('destino').value,
    pasajeros: document.getElementById('pasajeros').value,
    fechaViaje: document.getElementById('fechaViaje').value,
    tipoServicio: document.getElementById('tipoServicio').value,
    movilidad: document.getElementById('movilidad').value,
    ubicacion: document.getElementById('ubicacion').value.trim(),
    comentarios: document.getElementById('comentarios').value.trim(),
  };
}

// Validar formulario completo
function validateForm(data) {
  // Validar campos requeridos
  const requiredFields = [
    { field: 'nombre', message: 'El nombre es obligatorio' },
    { field: 'apellidos', message: 'Los apellidos son obligatorios' },
    { field: 'correo', message: 'El correo electrónico es obligatorio' },
    { field: 'numero', message: 'El número de celular es obligatorio' },
    { field: 'distrito', message: 'Debes seleccionar un distrito' },
    { field: 'destino', message: 'Debes seleccionar un destino' },
    { field: 'pasajeros', message: 'Debes indicar el número de pasajeros' },
    { field: 'fechaViaje', message: 'Debes seleccionar una fecha' },
    { field: 'tipoServicio', message: 'Debes seleccionar el tipo de servicio' },
    { field: 'movilidad', message: 'Debes seleccionar un tipo de vehículo' },
    {
      field: 'ubicacion',
      message: 'Debes seleccionar una ubicación en el mapa',
    },
  ];

  for (const item of requiredFields) {
    if (!data[item.field] || data[item.field] === '') {
      return { isValid: false, message: item.message };
    }
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.correo)) {
    return {
      isValid: false,
      message: 'El formato del correo electrónico no es válido',
    };
  }

  // Validar número de teléfono peruano
  const phoneRegex = /^9[0-9]{8}$/;
  if (!phoneRegex.test(data.numero)) {
    return {
      isValid: false,
      message:
        'El número debe empezar con 9 y tener 9 dígitos (formato peruano)',
    };
  }

  // Validar número de pasajeros
  const pasajeros = parseInt(data.pasajeros);
  if (isNaN(pasajeros) || pasajeros < 1 || pasajeros > 50) {
    return {
      isValid: false,
      message: 'El número de pasajeros debe estar entre 1 y 50',
    };
  }

  // Validar fecha (no puede ser en el pasado)
  const fechaSeleccionada = new Date(data.fechaViaje);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (fechaSeleccionada <= hoy) {
    return {
      isValid: false,
      message: 'La fecha del viaje debe ser posterior a hoy',
    };
  }

  return { isValid: true };
}

// Validar campo individual
function validateField(e) {
  const field = e.target;
  const value = field.value.trim();

  // Remover errores anteriores
  clearFieldError(e);

  // Validaciones específicas por campo
  switch (field.id) {
    case 'correo':
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        showFieldError(field, 'Formato de correo inválido');
      }
      break;
    case 'numero':
      if (value && !/^9[0-9]{8}$/.test(value)) {
        showFieldError(field, 'Debe empezar con 9 y tener 9 dígitos');
      }
      break;
    case 'pasajeros':
      const num = parseInt(value);
      if (value && (isNaN(num) || num < 1 || num > 50)) {
        showFieldError(field, 'Entre 1 y 50 pasajeros');
      }
      break;
  }
}

// Mostrar error en campo
function showFieldError(field, message) {
  field.classList.add('is-invalid');

  let errorDiv = field.parentNode.querySelector('.invalid-feedback');
  if (!errorDiv) {
    errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    field.parentNode.appendChild(errorDiv);
  }
  errorDiv.textContent = message;
}

// Limpiar error de campo
function clearFieldError(e) {
  const field = e.target;
  field.classList.remove('is-invalid');

  const errorDiv = field.parentNode.querySelector('.invalid-feedback');
  if (errorDiv) {
    errorDiv.remove();
  }
}

// Generar mensaje de WhatsApp
function generateWhatsAppMessage(data) {
  const fechaFormateada = DateTime.fromISO(data.fechaViaje, { zone: 'local' })
    .setLocale('es')
    .toLocaleString(DateTime.DATE_HUGE);

  let mensaje = `🚌 *RESERVA DE VIAJE - VSP TOURS* 🚌\n\n`;
  mensaje += `👤 *DATOS PERSONALES:*\n`;
  mensaje += `• Nombre: ${data.nombre} ${data.apellidos}\n`;
  mensaje += `• Celular: ${data.numero}\n`;
  mensaje += `• Email: ${data.correo}\n\n`;

  mensaje += `🗺️ *DETALLES DEL VIAJE:*\n`;
  mensaje += `• Distrito de recojo: ${data.distrito}\n`;
  mensaje += `• Destino: ${data.destino}\n`;
  mensaje += `• Fecha: ${fechaFormateada}\n`;
  mensaje += `• Pasajeros: ${data.pasajeros}\n`;
  mensaje += `• Tipo de servicio: ${data.tipoServicio}\n`;
  mensaje += `• Vehículo: ${data.movilidad}\n\n`;

  mensaje += `📍 *UBICACIÓN DE RECOJO:*\n`;
  mensaje += `${data.ubicacion}\n\n`;

  if (data.comentarios) {
    mensaje += `💬 *COMENTARIOS ADICIONALES:*\n`;
    mensaje += `${data.comentarios}\n\n`;
  }

  mensaje += `¡Espero su confirmación y cotización! 😊`;

  return mensaje;
}

// Abrir WhatsApp
function openWhatsApp(mensaje) {
  const numeroWhatsApp = '51928626343';
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  let url;
  if (isMobile) {
    url = `whatsapp://send?phone=${numeroWhatsApp}&text=${encodeURIComponent(
      mensaje
    )}`;
  } else {
    url = `https://web.whatsapp.com/send?phone=${numeroWhatsApp}&text=${encodeURIComponent(
      mensaje
    )}`;
  }

  // Mostrar mensaje de confirmación
  showModal(
    '¡Reserva Enviada!',
    'Serás redirigido a WhatsApp para completar tu reserva. Si no se abre automáticamente, puedes contactarnos al +51 928 626 343.',
    () => {
      window.open(url, '_blank');
    }
  );
}

// Inicializar actualizaciones en tiempo real
function initializeRealTimeUpdates() {
  // Actualizar resumen cuando cambien los campos
  const pasajerosInput = document.getElementById('pasajeros');
  const resumenPasajeros = document.getElementById('resumenPasajeros');

  pasajerosInput.addEventListener('input', function () {
    resumenPasajeros.textContent = this.value || '0';
  });

  // Efectos de hover mejorados
  addHoverEffects();
}

// Agregar efectos de hover
function addHoverEffects() {
  const cards = document.querySelectorAll(
    '.vehicle-card, .contact-info, .benefits-card, .testimonial-card'
  );

  cards.forEach((card) => {
    card.addEventListener('mouseenter', function () {
      this.style.transform = 'translateY(-2px)';
    });

    card.addEventListener('mouseleave', function () {
      if (!this.classList.contains('selected')) {
        this.style.transform = '';
      }
    });
  });
}

// Mostrar modal
function showModal(titulo, mensaje, callback) {
  const modal = new bootstrap.Modal(
    document.getElementById('confirmacionModal')
  );

  document.getElementById('modalTitulo').textContent = titulo;
  document.getElementById('modalMensaje').textContent = mensaje;

  // Si hay callback, ejecutarlo cuando se cierre el modal
  if (callback) {
    const modalElement = document.getElementById('confirmacionModal');
    modalElement.addEventListener('hidden.bs.modal', callback, { once: true });
  }

  modal.show();
}

// Función para detectar dispositivo móvil
function esDispositivoMovil() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

// Detectar zona aproximada de Lima basada en coordenadas (mejorado)
function detectarZonaLima(lat, lng) {
  // Zonas más precisas de Lima basadas en coordenadas
  const zonas = [
    // Centro y zonas centrales
    { nombre: 'Cercado de Lima', lat: [-12.06, -12.03], lng: [-77.05, -77.02] },
    { nombre: 'Breña', lat: [-12.07, -12.05], lng: [-77.06, -77.04] },
    { nombre: 'La Victoria', lat: [-12.08, -12.05], lng: [-77.04, -77.01] },
    { nombre: 'Lince', lat: [-12.09, -12.07], lng: [-77.04, -77.02] },
    { nombre: 'Jesús María', lat: [-12.08, -12.06], lng: [-77.06, -77.04] },
    { nombre: 'Pueblo Libre', lat: [-12.08, -12.06], lng: [-77.08, -77.06] },
    {
      nombre: 'Magdalena del Mar',
      lat: [-12.1, -12.08],
      lng: [-77.08, -77.06],
    },
    { nombre: 'San Miguel', lat: [-12.08, -12.06], lng: [-77.1, -77.08] },

    // Lima Sur
    { nombre: 'Miraflores', lat: [-12.13, -12.11], lng: [-77.04, -77.01] },
    { nombre: 'San Isidro', lat: [-12.11, -12.09], lng: [-77.06, -77.03] },
    { nombre: 'Barranco', lat: [-12.15, -12.13], lng: [-77.03, -77.01] },
    { nombre: 'Chorrillos', lat: [-12.18, -12.15], lng: [-77.04, -77.01] },
    {
      nombre: 'Santiago de Surco',
      lat: [-12.14, -12.1],
      lng: [-76.99, -76.95],
    },
    { nombre: 'San Borja', lat: [-12.11, -12.09], lng: [-77.01, -76.98] },
    { nombre: 'Surquillo', lat: [-12.11, -12.1], lng: [-77.02, -77.0] },
    {
      nombre: 'San Juan de Miraflores',
      lat: [-12.16, -12.13],
      lng: [-77.0, -76.97],
    },
    {
      nombre: 'Villa María del Triunfo',
      lat: [-12.17, -12.14],
      lng: [-76.97, -76.94],
    },
    {
      nombre: 'Villa El Salvador',
      lat: [-12.22, -12.18],
      lng: [-76.96, -76.92],
    },

    // Lima Este
    { nombre: 'La Molina', lat: [-12.08, -12.05], lng: [-76.96, -76.92] },
    { nombre: 'Ate', lat: [-12.05, -12.02], lng: [-76.98, -76.95] },
    { nombre: 'Santa Anita', lat: [-12.05, -12.03], lng: [-76.98, -76.95] },
    { nombre: 'El Agustino', lat: [-12.04, -12.02], lng: [-77.02, -76.99] },
    {
      nombre: 'San Juan de Lurigancho',
      lat: [-11.99, -11.95],
      lng: [-77.02, -76.98],
    },
    { nombre: 'Lurigancho-Chosica', lat: [-11.95, -11.9], lng: [-76.9, -76.8] },

    // Lima Norte
    { nombre: 'Los Olivos', lat: [-11.98, -11.95], lng: [-77.08, -77.05] },
    {
      nombre: 'San Martín de Porres',
      lat: [-12.0, -11.97],
      lng: [-77.08, -77.05],
    },
    { nombre: 'Independencia', lat: [-11.99, -11.96], lng: [-77.07, -77.04] },
    { nombre: 'Comas', lat: [-11.95, -11.92], lng: [-77.08, -77.05] },
    { nombre: 'Carabayllo', lat: [-11.9, -11.85], lng: [-77.05, -77.0] },
    { nombre: 'Puente Piedra', lat: [-11.88, -11.83], lng: [-77.08, -77.03] },
    { nombre: 'Ancón', lat: [-11.78, -11.73], lng: [-77.18, -77.13] },
    { nombre: 'Santa Rosa', lat: [-11.88, -11.85], lng: [-77.18, -77.15] },

    // Lima Oeste/Callao
    { nombre: 'Callao', lat: [-12.07, -12.03], lng: [-77.15, -77.1] },
    { nombre: 'Bellavista', lat: [-12.08, -12.06], lng: [-77.12, -77.1] },
    { nombre: 'La Perla', lat: [-12.08, -12.06], lng: [-77.11, -77.09] },
    {
      nombre: 'Carmen de la Legua',
      lat: [-12.05, -12.03],
      lng: [-77.11, -77.09],
    },
    { nombre: 'Ventanilla', lat: [-11.9, -11.85], lng: [-77.18, -77.13] },

    // Otros distritos
    { nombre: 'Rímac', lat: [-12.03, -12.01], lng: [-77.04, -77.01] },
    { nombre: 'San Luis', lat: [-12.09, -12.07], lng: [-77.0, -76.98] },
    { nombre: 'La Molina', lat: [-12.08, -12.06], lng: [-76.96, -76.94] },
  ];

  // Buscar la zona más cercana con mayor precisión
  let mejorCoincidencia = null;
  let menorDistancia = Infinity;

  for (const zona of zonas) {
    // Verificar si está dentro del rectángulo de la zona
    if (
      lat >= zona.lat[0] &&
      lat <= zona.lat[1] &&
      lng >= zona.lng[0] &&
      lng <= zona.lng[1]
    ) {
      // Calcular distancia al centro de la zona para mayor precisión
      const centroLat = (zona.lat[0] + zona.lat[1]) / 2;
      const centroLng = (zona.lng[0] + zona.lng[1]) / 2;
      const distancia = Math.sqrt(
        Math.pow(lat - centroLat, 2) + Math.pow(lng - centroLng, 2)
      );

      if (distancia < menorDistancia) {
        menorDistancia = distancia;
        mejorCoincidencia = zona.nombre;
      }
    }
  }

  // Si encontramos una zona específica, devolverla
  if (mejorCoincidencia) {
    return mejorCoincidencia;
  }

  // Si no encuentra zona específica, determinar área general con mayor precisión
  if (lat > -11.95) {
    return lng < -77.05 ? 'Lima Norte (Callao)' : 'Lima Norte';
  } else if (lat < -12.15) {
    return lng > -77.0 ? 'Lima Sur Este' : 'Lima Sur';
  } else if (lng < -76.98) {
    return 'Lima Este';
  } else if (lng > -77.08) {
    return 'Lima Oeste';
  } else {
    return 'Lima Centro';
  }
}

// Exportar funciones para uso global
window.reservaSystem = {
  showModal,
  esDispositivoMovil,
  validateForm,
  generateWhatsAppMessage,
};

console.log('Sistema de reservas VSP Tours cargado correctamente ✅');
