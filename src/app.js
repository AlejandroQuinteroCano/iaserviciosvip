document.addEventListener('DOMContentLoaded', () => {
    fetch('chatbot.html') // Ruta al archivo HTML del chatbot
        .then(response => response.text())
        .then(html => {
            document.body.insertAdjacentHTML('beforeend', html); // Insertar el chatbot al final del body
            initializeChatbot(); // Inicializar el chatbot después de cargarlo
        })
        .catch(error => console.error('Error al cargar el chatbot:', error));
});

function initializeChatbot() {
    const chatbot = document.getElementById('chatbot');
    const minimizeChatbotButton = document.getElementById('minimize-chatbot');
    const closeChatbotButton = document.getElementById('close-chatbot');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatbotBody = document.querySelector('.chatbot-body');
    const chatbotFooter = document.querySelector('.chatbot-footer');
    const scheduleButton = document.getElementById('schedule-button');

    // Verificar si los elementos existen en el DOM
    if (!chatbot || !minimizeChatbotButton || !closeChatbotButton || !chatInput || !chatSend || !chatbotBody || !chatbotFooter) {
        console.error('Uno o más elementos necesarios no se encontraron en el DOM.');
        return;
    }

    // Función para minimizar el chatbot
    minimizeChatbotButton.addEventListener('click', () => {
        if (chatbotBody.style.display === 'none') {
            chatbotBody.style.display = 'block';
            chatbotFooter.style.display = 'flex';
            minimizeChatbotButton.textContent = '-'; // Cambiar el texto del botón
        } else {
            chatbotBody.style.display = 'none';
            chatbotFooter.style.display = 'none';
            minimizeChatbotButton.textContent = '+'; // Cambiar el texto del botón
        }
    });

    // Función para cerrar el chatbot
    closeChatbotButton.addEventListener('click', () => {
        chatbot.classList.add('hidden'); // Ocultar el chatbot
    });

    // Evento para mostrar el formulario de agendamiento
    if (scheduleButton) {
        scheduleButton.addEventListener('click', () => {
            showAppointmentForm(); // Llama a la función que muestra el formulario
        });
    } else {
        console.error('El botón de agendamiento no se encontró en el DOM.');
    }

    // Web Speech API: Synthesis
    const synth = window.speechSynthesis;

    // Función para agregar un mensaje al chatbox
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

        // Si es un mensaje del bot, hablarlo (excepto si es el formulario)
        if (!isUser && !message.includes('appointment-form')) {
            const utterance = new SpeechSynthesisUtterance(message);
            utterance.lang = 'es-ES'; // Idioma español
            utterance.pitch = 1; // Tono de voz (1 es normal)
            utterance.rate = 1; // Velocidad de habla (1 es normal)
            synth.speak(utterance);
        }
    }

    // Función para mostrar el formulario de agendamiento
    function showAppointmentForm() {
        const formHTML = `
            <div id="appointment-form" class="appointment-form">
                <p>Por favor, ingresa los detalles para agendar tu cita:</p>
                <label for="appointment-date-field">Fecha:</label>
                <input type="date" id="appointment-date-field" required autocomplete="off">
                
                <label for="appointment-time-field">Hora:</label>
                <input type="time" id="appointment-time-field" required autocomplete="off">
                
                <label for="appointment-details-field">Detalles:</label>
                <textarea id="appointment-details-field" placeholder="Describe el trabajo a realizar..." required autocomplete="off"></textarea>
                
                <label for="appointment-contact-field">Correo o WhatsApp:</label>
                <input type="text" id="appointment-contact-field" placeholder="Ingresa tu correo o número de WhatsApp" required autocomplete="off">
                
                <button id="submit-appointment">Agendar</button>
                <button id="close-appointment">Cerrar</button>
            </div>
        `;
        addMessage(formHTML, false); // Mostrar el formulario en el chatbox como mensaje del bot
    
        setTimeout(() => {
            const submitButton = document.getElementById('submit-appointment');
            const closeButton = document.getElementById('close-appointment');
    
            if (submitButton) {
                submitButton.addEventListener('click', handleAppointmentSubmission);
            }
    
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    const formElement = document.getElementById('appointment-form');
                    if (formElement) {
                        formElement.remove(); // Eliminar el formulario del DOM
                        addMessage('El formulario de agendamiento ha sido cerrado.', false);
                    }
                });
            }
        }, 100);
    }
    // Función para manejar el envío del formulario
    function handleAppointmentSubmission() {
        const date = document.getElementById('appointment-date-field').value;
        const time = document.getElementById('appointment-time-field').value;
        const details = document.getElementById('appointment-details-field').value;
        const contact = document.getElementById('appointment-contact-field').value;
    
        if (date && time && details && contact) {
            const confirmationMessage = `
                ¡Gracias! Tu cita ha sido agendada para el ${date} a las ${time}.
                Detalles: ${details}.
                Contacto: ${contact}.
            `;
            addMessage(confirmationMessage, false); // Confirmar la cita al usuario
        } else {
            addMessage('Por favor, completa todos los campos para agendar tu cita.', false);
        }
    }

    // Función para obtener la respuesta del bot
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
}