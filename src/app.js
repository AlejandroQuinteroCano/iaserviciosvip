document.addEventListener('DOMContentLoaded', () => {
    const chatbot = document.getElementById('chatbot');
    const chatbotBtn = document.getElementById('chatbot-btn');
    const closeChatbot = document.getElementById('close-chatbot');
    const chatInput = document.getElementById('chat-input');
    const chatbotBody = document.querySelector('.chatbot-body');

    // Mostrar el chatbot al hacer clic en el botón
    chatbotBtn.addEventListener('click', () => {
        chatbot.classList.remove('hidden');
    });

    // Ocultar el chatbot al hacer clic en el botón de cerrar
    closeChatbot.addEventListener('click', () => {
        chatbot.classList.add('hidden');
    });

    // Enviar mensajes al chatbot
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const message = chatInput.value;
            chatbotBody.innerHTML += `<p><strong>Tú:</strong> ${message}</p>`;
            chatInput.value = '';

            // Respuesta predefinida del chatbot
            let reply = 'Lo siento, no entiendo tu mensaje.';
            if (message.toLowerCase().includes('servicio')) {
                reply = 'Ofrecemos soporte técnico y servicios personalizados. ¿En qué puedo ayudarte?';
            } else if (message.toLowerCase().includes('precio')) {
                reply = 'Nuestros precios varían según el servicio. Contáctanos para más información.';
            }

            chatbotBody.innerHTML += `<p><strong>Chatbot:</strong> ${reply}</p>`;
        }
    });
});