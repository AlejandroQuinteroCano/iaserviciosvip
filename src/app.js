document.addEventListener('DOMContentLoaded', () => {
    const chatbot = document.getElementById('chatbot');
    const closeChatbot = document.getElementById('close-chatbot');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatbotBody = document.querySelector('.chatbot-body');

    // Web Speech API: Synthesis
    const synth = window.speechSynthesis;

    // Mostrar el chatbot
    chatbot.classList.remove('hidden');

    // Ocultar el chatbot al hacer clic en el botón de cerrar
    closeChatbot.addEventListener('click', () => {
        chatbot.classList.add('hidden');
    });

    // Function to add a message to the chatbox
    function addMessage(message, isUser = false) {
        const messageElement = document.createElement('div');
        
        // Si es un mensaje del bot, permite HTML
        if (!isUser) {
            messageElement.innerHTML = message; // Permitir HTML en los mensajes del bot
        } else {
            messageElement.textContent = message; // Mostrar texto plano para mensajes del usuario
        }
    
        messageElement.style.textAlign = isUser ? 'right' : 'left';
        chatbotBody.appendChild(messageElement);
        chatbotBody.scrollTop = chatbotBody.scrollHeight;
    }
        // Si es un mensaje del bot, hablarlo
        if (!isUser) {
            const utterance = new SpeechSynthesisUtterance(message);
utterance.lang = 'es-ES'; // Idioma español
utterance.pitch = 1; // Tono de voz (1 es normal)
utterance.rate = 1; // Velocidad de habla (1 es normal)
synth.speak(utterance);
        }
      // Reconocimiento de voz
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'es-ES'; // Configurar idioma español

// Botón para activar el reconocimiento de voz
const voiceButton = document.createElement('button');
voiceButton.textContent = '🎤 Hablar';
voiceButton.style.marginLeft = '10px';
voiceButton.style.padding = '10px';
voiceButton.style.backgroundColor = '#007bff';
voiceButton.style.color = 'white';
voiceButton.style.border = 'none';
voiceButton.style.borderRadius = '5px';
voiceButton.style.cursor = 'pointer';
document.querySelector('.chatbot-footer').appendChild(voiceButton);

// Evento para iniciar el reconocimiento de voz
voiceButton.addEventListener('click', () => {
    console.log('Reconocimiento de voz iniciado'); // Mensaje de depuración
    recognition.start();
});

// Capturar el texto reconocido
recognition.onresult = (event) => {
    const voiceMessage = event.results[0][0].transcript;
    chatInput.value = voiceMessage; // Mostrar el texto en el input
    const enterEvent = new KeyboardEvent('keypress', { key: 'Enter' });
    chatInput.dispatchEvent(enterEvent); // Simular el envío del mensaje
};

// Manejar errores del reconocimiento de voz
recognition.onerror = (event) => {
    if (event.error === 'no-speech') {
        console.error('No se detectó ninguna voz. Por favor, intenta hablar nuevamente.');
        alert('No se detectó ninguna voz. Por favor, intenta hablar nuevamente.');
    } else {
        console.error('Error en el reconocimiento de voz:', event.error);
    }
};

    // Enviar mensajes al chatbot al hacer clic en el botón de enviar
    chatSend.addEventListener('click', () => {
        const userMessage = chatInput.value.trim();
        if (userMessage) {
            addMessage(userMessage, true); // Agregar mensaje del usuario
            console.log('Mensaje enviado:', userMessage); // Depuración del mensaje enviado
            chatInput.value = ''; // Limpiar el input

            // Simular respuesta del bot
            setTimeout(() => {
                const botResponse = getBotResponse(userMessage);
                addMessage(botResponse); // Agregar respuesta del bot
                console.log('Respuesta del bot:', botResponse); // Depuración de la respuesta del bot
            }, 1000);
        }
    });

    // Enviar mensajes al presionar Enter
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            chatSend.click(); // Simula el clic en el botón de enviar
        }
    });
    
// Función para mostrar el formulario de agendamiento
function showAppointmentForm() {
    const formHTML = `
        <div class="appointment-form">
            <p>Por favor, ingresa los detalles para agendar tu cita:</p>
            <label for="appointment-date">Fecha:</label>
            <input type="date" id="appointment-date" required>
            <label for="appointment-time">Hora:</label>
            <input type="time" id="appointment-time" required>
            <label for="appointment-details">Detalles:</label>
            <textarea id="appointment-details" placeholder="Describe el trabajo a realizar..." required></textarea>
            <button id="submit-appointment">Agendar</button>
        </div>
    `;
    addMessage(formHTML, false); // Mostrar el formulario en el chatbox como mensaje del bot

    // Esperar a que el usuario complete el formulario
    setTimeout(() => {
        const submitButton = document.getElementById('submit-appointment');
        submitButton.addEventListener('click', handleAppointmentSubmission);
    }, 100); // Asegurarse de que el DOM esté cargado
}

// Función para manejar el envío del formulario
function handleAppointmentSubmission() {
    const date = document.getElementById('appointment-date').value;
    const time = document.getElementById('appointment-time').value;
    const details = document.getElementById('appointment-details').value;

    if (date && time && details) {
        const confirmationMessage = `
            ¡Gracias! Tu cita ha sido agendada para el ${date} a las ${time}.
            Detalles: ${details}.
        `;
        addMessage(confirmationMessage, false); // Confirmar la cita al usuario
    } else {
        addMessage('Por favor, completa todos los campos para agendar tu cita.', false);
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const scheduleButton = document.getElementById('schedule-button');

    // Evento para mostrar el formulario de agendamiento al hacer clic en el botón
    scheduleButton.addEventListener('click', () => {
        showAppointmentForm(); // Llama a la función que muestra el formulario
    });
});
// Actualizar la lógica de respuestas del bot
function getBotResponse(message) {
    message = message.toLowerCase();

    if (message.includes('soporte')) {
        return '¿Necesitas soporte técnico para computadores o redes eléctricas?';
    } else if (message.includes('computadores')) {
        return 'Ofrecemos servicios como mantenimiento de hardware, instalación de software y reparación de equipos. ¿Qué necesitas específicamente?';
    } else if (message.includes('redes eléctricas')) {
        return 'Podemos ayudarte con instalaciones, reparaciones y mantenimiento de redes eléctricas domiciliarias. ¿En qué podemos asistirte?';
    } else if (message.includes('mantenimiento')) {
        return 'Realizamos mantenimiento preventivo y correctivo. ¿Es para hardware, software o redes eléctricas?';
    } else if (message.includes('contacto')) {
        return 'Puedes contactarnos al correo iaserviciosvip@hotmail.com o al WhatsApp 3117773087.';
    } else if (message.includes('precio')) {
        return 'Nuestros precios varían según el servicio. Por favor, indícanos qué servicio necesitas para darte más información.';
    } else if (message.includes('horario')) {
        return 'Nuestro horario de atención es de lunes a viernes de 8:00 AM a 6:00 PM.';
    } else if (message.includes('ubicación')) {
        return 'Estamos ubicados en San Javier, Medellín, Colombia.';
    } else if (message.includes('servicio a domicilio')) {
        return 'Sí, ofrecemos servicio a domicilio para soporte técnico. ¿En qué podemos ayudarte?';
    } else if (message.includes('agendar') || message.includes('cita')) {
        showAppointmentForm(); // Mostrar el formulario de agendamiento
        return 'Claro, puedo ayudarte a agendar una cita. Por favor, completa el formulario.';
    } else {
        return 'Lo siento, no entendí tu mensaje. Por favor, intenta ser más específico.';
    }
}
});