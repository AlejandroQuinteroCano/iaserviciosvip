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
        messageElement.textContent = message;
        messageElement.style.textAlign = isUser ? 'right' : 'left';
        chatbotBody.appendChild(messageElement);
        chatbotBody.scrollTop = chatbotBody.scrollHeight;

        // Si es un mensaje del bot, hablarlo
        if (!isUser) {
            const utterance = new SpeechSynthesisUtterance(message);
utterance.lang = 'es-ES'; // Idioma español
utterance.pitch = 1; // Tono de voz (1 es normal)
utterance.rate = 1; // Velocidad de habla (1 es normal)
synth.speak(utterance);
        }
    }

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

    // Simple bot response logic
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
        } else {
            return 'Lo siento, no entendí tu mensaje. Por favor, intenta ser más específico.';
        }
    }
});