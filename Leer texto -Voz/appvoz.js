let sintetizador = window.speechSynthesis;
let mensaje;

function leerTexto() {
  const texto = document.getElementById('texto').value;
  if (texto.trim() !== '') {
    if (sintetizador.speaking) {
      sintetizador.cancel();
    }
    mensaje = new SpeechSynthesisUtterance(texto);
    mensaje.lang = 'es-ES';
    sintetizador.speak(mensaje);
  } else {
    alert('Por favor, ingresa un texto para leer.');
  }
}

function pausarTexto() {
  if (sintetizador.speaking && !sintetizador.paused) {
    sintetizador.pause();
  }
}

function reanudarTexto() {
  if (sintetizador.paused) {
    sintetizador.resume();
  }
}

function nuevoTexto() {
  if (sintetizador.speaking) {
    sintetizador.cancel();
  }
  document.getElementById('texto').value = '';
  document.getElementById('resumen').textContent = '';
}

function resumirTexto() {
  const texto = document.getElementById('texto').value;
  if (texto.trim() === '') {
    alert('Por favor, ingresa un texto para resumir.');
    return;
  }

  const resumenElemento = document.getElementById('resumen');
  resumenElemento.textContent = 'Generando resumen...';

  try {
    const resumen = get_summary(texto);
    resumenElemento.textContent = resumen;
  } catch (error) {
    resumenElemento.textContent = 'Error al generar el resumen.';
    console.error(error);
  }
}
function leerResumen() {
  const resumen = document.getElementById('resumen').textContent;
  if (resumen.trim() !== '') {
    const mensaje = new SpeechSynthesisUtterance(resumen);
    mensaje.lang = 'es-ES'; // Establece el idioma a español
    window.speechSynthesis.speak(mensaje);
  } else {
    alert('No hay resumen para leer.');
  }
}