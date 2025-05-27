document.addEventListener('DOMContentLoaded', () => {
    fetch('./chatbot.html') // Ruta al archivo HTML del chatbot
        .then(response => response.text())
        .then(html => {
            document.body.insertAdjacentHTML('beforeend', html); // Insertar el chatbot al final del body
            initializeChatbot(); // Inicializar el chatbot después de cargarlo
        })
        .catch(error => console.error('Error al cargar el chatbot:', error));
});

// --- INICIO DE SECCIÓN MODIFICADA PARA LOCALHOST (ESCENARIO 2) ---

/* --- BLOQUE COMENTADO ---
   Las siguientes llamadas fetch no funcionarán en producción si el backend no está desplegado.
   Se comentan para evitar errores en el sitio en vivo.
   La funcionalidad de verificar disponibilidad y agendar citas con el backend
   estará desactivada hasta que configures una API pública.

fetch('http://localhost:3000/api/citas/disponibilidad?date=2025-05-10')
    .then(response => response.json())
    .then(data => console.log('Horarios ocupados:', data.horariosOcupados))
    .catch(error => console.error('Error al verificar disponibilidad:', error));

fetch('http://localhost:3000/api/citas', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        date: '2025-05-10',
        time: '10:00',
        user: 'Juan Pérez',
        description: 'Revisión de hardware'
    })
})
    .then(response => response.json())
    .then(data => console.log('Cita creada:', data))
    .catch(error => console.error('Error al crear la cita:', error));
*/

// --- FIN DE SECCIÓN MODIFICADA PARA LOCALHOST ---
    
function initializeChatbot() {
    const chatbot = document.getElementById('chatbot');
    const minimizeChatbotButton = document.getElementById('minimize-chatbot');
    const closeChatbotButton = document.getElementById('close-chatbot');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatbotBody = document.querySelector('.chatbot-body');
    const chatbotFooter = document.querySelector('.chatbot-footer');
    const scheduleButton = document.getElementById('schedule-button');
    const voiceInputButton = document.getElementById('voice-input-button');

    // --- INICIO: Para asegurar que el chatbot sea visible al cargar ---
    // Si el chatbot tiene la clase 'hidden' por defecto en el HTML, esta línea la quitará.
    // Asegúrate que el div con id="chatbot" (en chatbot.html o index.html) no tenga 'hidden'
    // o usa la siguiente línea si quieres controlarlo desde JS:
    if (chatbot) {
         chatbot.classList.remove('hidden'); // Descomenta esta línea si necesitas que JS lo haga visible
    }
    // --- FIN: Para asegurar que el chatbot sea visible al cargar ---

    if ('webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.lang = 'es-CO'; // Consistente con tu audiencia
            recognition.interimResults = true;
            let finalTranscript = '';

            recognition.onresult = (event) => {
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                        chatInput.value = finalTranscript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                        chatInput.value = finalTranscript + interimTranscript;
                    }
                }
            };

            recognition.onerror = (event) => {
                console.error('Error de reconocimiento de voz:', event.error);
                addMessage('Lo siento, hubo un problema con el reconocimiento de voz.', false);
            };

            recognition.onend = () => {
                // Opcional: Lógica al finalizar la grabación
            };
            
            // Asegúrate que voiceInputButton exista antes de añadir el listener
            if (voiceInputButton) {
                voiceInputButton.addEventListener('click', () => {
                    finalTranscript = '';
                    recognition.start();
                    addMessage('Escuchando...', false); // Mensaje al usuario
                });
            } else {
                console.warn("Chatbot: Botón de entrada de voz no encontrado.");
            }

        } else {
            if(voiceInputButton) voiceInputButton.style.display = 'none';
            console.log('El reconocimiento de voz no es compatible con este navegador.');
        }
    } else {
        if(voiceInputButton) voiceInputButton.style.display = 'none';
        console.log('La API de Reconocimiento de Voz no está disponible en este navegador.');
    }

    if (!chatbot || !minimizeChatbotButton || !closeChatbotButton || !chatInput || !chatSend || !chatbotBody || !chatbotFooter /* !voiceInputButton ya se maneja arriba */) {
        console.error('Chatbot: Uno o más elementos visuales necesarios no se encontraron en el DOM.');
        // No retornes aquí necesariamente si voiceInputButton es opcional y ya lo manejaste
        // return; 
    }
    
    // Solo añade listeners si los botones existen
    if (chatSend && chatInput) {
        chatSend.addEventListener('click', () => {
            // console.log('Botón Enviar clickeado'); // Quitar para producción
            const message = chatInput.value.trim();
            if (message) {
                addMessage(message, true);
                chatInput.value = '';
                const botResponse = getBotResponse(message);
                setTimeout(() => addMessage(botResponse, false), 500);
            }
        });

        chatInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                // console.log('Tecla Enter presionada'); // Quitar para producción
                chatSend.click();
            }
        });
    }

    if (minimizeChatbotButton && chatbotBody && chatbotFooter) {
        minimizeChatbotButton.addEventListener('click', () => {
            if (chatbotBody.style.display === 'none') {
                chatbotBody.style.display = 'block';
                chatbotFooter.style.display = 'flex'; // O el display original que tuviera
                minimizeChatbotButton.textContent = '-';
            } else {
                chatbotBody.style.display = 'none';
                chatbotFooter.style.display = 'none';
                minimizeChatbotButton.textContent = '+';
            }
        });
    }

    if (closeChatbotButton && chatbot) {
        closeChatbotButton.addEventListener('click', () => {
            chatbot.classList.add('hidden');
        });
    }

    // Evento para mostrar el formulario de agendamiento (asegúrate de que solo haya un listener)
    // Ya habías eliminado el duplicado, ¡bien hecho!
    if (scheduleButton) {
        scheduleButton.addEventListener('click', () => {
            // console.log('Botón Agendar Cita clickeado'); // Quitar para producción
            showAppointmentForm();
        });
    } else {
        console.error('El botón de agendamiento no se encontró en el DOM.');
    }

    const synth = window.speechSynthesis;

    function addMessage(message, isUser = false) {
        if (!chatbotBody) { // Nueva verificación
            console.error("Chatbot body no encontrado, no se puede agregar mensaje.");
            return;
        }
        const messageElement = document.createElement('div');
        messageElement.classList.add(isUser ? 'user-message' : 'bot-message'); // Para estilizar diferente

        if (!isUser) {
            messageElement.innerHTML = message;
        } else {
            messageElement.textContent = message;
        }

        // messageElement.style.textAlign = isUser ? 'right' : 'left'; // Puedes manejar esto con CSS
        chatbotBody.appendChild(messageElement);
        chatbotBody.scrollTop = chatbotBody.scrollHeight;

        if (!isUser && !message.includes('appointment-form') && synth && typeof SpeechSynthesisUtterance !== 'undefined') {
            const utterance = new SpeechSynthesisUtterance(message.replace(/<[^>]*>/g, "")); // Quitar HTML para hablar
            utterance.lang = 'es-CO'; // Preferiblemente el mismo que reconocimiento
            utterance.pitch = 1;
            utterance.rate = 1;
            synth.speak(utterance);
        }
    }

    function showAppointmentForm() {
        const formHTML = `
            <div id="appointment-form" class="appointment-form">
                <p>Por favor, ingresa los detalles para solicitar tu cita:</p>
                <label for="appointment-date-field">Fecha:</label>
                <input type="date" id="appointment-date-field" required autocomplete="off">

                <label for="appointment-time-field">Hora:</label>
                <input type="time" id="appointment-time-field" required autocomplete="off">

                <label for="appointment-details-field">Detalles:</label>
                <textarea id="appointment-details-field" placeholder="Describe el trabajo a realizar..." required autocomplete="off"></textarea>

                <label for="appointment-contact-field">Correo o WhatsApp:</label>
                <input type="text" id="appointment-contact-field" placeholder="Ingresa tu correo o número de WhatsApp" required autocomplete="off">

                <button id="submit-appointment">Enviar Solicitud</button>
                <button id="close-appointment">Cerrar</button>
            </div>
        `;
        addMessage(formHTML, false);

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
                        formElement.remove();
                        addMessage('Has cerrado el formulario de solicitud de cita.', false);
                    }
                });
            }
        }, 100);
    }

    function handleAppointmentSubmission() {
        const dateElement = document.getElementById('appointment-date-field');
        const timeElement = document.getElementById('appointment-time-field');
        const detailsElement = document.getElementById('appointment-details-field');
        const contactElement = document.getElementById('appointment-contact-field');

        // Verificar que los elementos existen antes de acceder a .value
        if (!dateElement || !timeElement || !detailsElement || !contactElement) {
            addMessage('Error interno: No se pudieron encontrar los campos del formulario.', false);
            return;
        }

        const date = dateElement.value;
        const time = timeElement.value;
        const details = detailsElement.value;
        const contact = contactElement.value;

        if (date && time && details && contact) {
            // --- MENSAJE DE CONFIRMACIÓN SUGERIDO ---
            const confirmationMessage = `
                ¡Gracias! Hemos recibido tu solicitud de cita para el <strong>${date}</strong> a las <strong>${time}</strong>.
                <br>Detalles: ${details}.
                <br>Contacto: ${contact}.
                <br>Nos pondremos en contacto contigo pronto para confirmar la disponibilidad y los detalles finales.
            `;
            addMessage(confirmationMessage, false);
            
            // Opcional: Limpiar el formulario o removerlo después de enviar
            const formElement = document.getElementById('appointment-form');
            if (formElement) {
                formElement.remove();
            }

        } else {
            addMessage('Por favor, completa todos los campos para solicitar tu cita.', false);
        }
    }
    
    // console.log('Botón Agendar Cita:', scheduleButton); // Quitar para producción

    // Función para obtener la respuesta del bot
    function getBotResponse(message) {
        message = message.toLowerCase();
        // ... (todo tu bloque de if-else if para getBotResponse se mantiene igual) ...
        // (Asegúrate que las respuestas aquí no dependan de datos que vendrían del backend)

        if (message.includes('hola')) {
            return '¡Hola! Bienvenido a IA Servicios VIP. ¿En qué te puedo ayudar hoy?';
        } else if (message.includes('buenos dias')) {
            return '¡Buenos días! Bienvenido a IA Servicios VIP. ¿En qué te puedo ayudar?';
        } else if (message.includes('buenas tardes')) {
            return '¡Buenas tardes! Bienvenido a IA Servicios VIP. ¿En qué te puedo ayudar?';
        } else if (message.includes('buenas noches')) {
            return '¡Buenas noches! Bienvenido a IA Servicios VIP. ¿En qué te puedo ayudar?';
        } else if (message.includes('urgente')) {
            return 'Entendido. Si es una urgencia, por favor escribe directamente a nuestro WhatsApp: 3117773087 para una atención más rápida.';
        } else if (message.includes('cual es tu nombre')) {
            return 'Soy el asistente virtual de IA Servicios VIP. Estoy aquí para ayudarte con tus consultas sobre nuestros servicios.';
        } else if (message.includes('soporte')) {
            return 'Ofrecemos soporte técnico para computadores y para redes eléctricas domiciliarias. ¿Sobre cuál necesitas información?';
        } else if (message.includes('computadores')) {
            return 'Para computadores, realizamos mantenimiento de hardware, instalación y configuración de software, reparación de equipos, y más. ¿Tienes alguna necesidad específica?';
        } else if (message.includes('quien eres')) {
            return 'Soy el asistente virtual de IA Servicios VIP. ¿Cómo puedo ayudarte con nuestros servicios de soporte técnico?';
        } else if (message.includes('redes eléctricas')) {
            return 'En redes eléctricas domiciliarias, te ayudamos con instalaciones, reparaciones, mantenimiento y asesoría bajo la normativa RETIE. ¿Qué tipo de servicio eléctrico buscas?';
        } else if (message.includes('mantenimiento')) {
            return 'Claro, ofrecemos mantenimiento preventivo y correctivo. ¿Sería para tus equipos de cómputo o para instalaciones eléctricas?';
        } else if (message.includes('contacto')) {
            return 'Puedes contactarnos al correo iaserviciosvip@hotmail.com o directamente a nuestro WhatsApp 3117773087. También puedes solicitar una cita a través de este chat.';
        } else if (message.includes('precio') || message.includes('costo') || message.includes('tarifa')) {
            return 'Nuestros precios varían según la complejidad y tipo de servicio. Para darte una cotización más precisa, cuéntame un poco más sobre lo que necesitas o agenda una visita de diagnóstico.';
        } else if (message.includes('horario')) {
            return 'Nuestro horario de atención principal es de lunes a viernes de 8:00 AM a 6:00 PM, y sábados de 9:00 AM a 1:00 PM. Atendemos urgencias con previa coordinación.';
        } else if (message.includes('ubicación') || message.includes('donde estan')) {
            return 'Estamos ubicados en el sector de San Javier, Medellín, Colombia. Ofrecemos servicios a domicilio en el área metropolitana.';
        } else if (message.includes('servicio a domicilio')) {
            return 'Sí, gran parte de nuestros servicios de soporte técnico, tanto para computadores como para temas eléctricos, los ofrecemos a domicilio para tu comodidad.';
        } else if (message.includes('agendar') || message.includes('cita')) {
            showAppointmentForm();
            return '¡Perfecto! Te mostraré un formulario para que solicites tu cita.';
        }
else if (message.includes('buenos dias')) {
            return 'Buenos dias! en que te puedo ayudar hoy. ¿Bienvenido IASERVCIOSVIP?';
}
else if (message.includes('buenas tardes')) {
            return 'Buenas tardes! en que te puedo ayudar hoy. ¿Bienvenido IASERVCIOSVIP?';
}
else if (message.includes('buenas noches')) {
            return 'Buenas noches! en que te puedo ayudar hoy. ¿Bienvenido IASERVCIOSVIP?';
}

else if (message.includes('urgente')) {
            return 'Urgente! requiere soporte electrico o computadores . ¿Escribe ami whtasapp 3117773087?';
        }
        else if (message.includes('cual es tu nombre')) {
            return 'Hola! en que te puedo ayudar hoy. ¿Soy Aleajandro Quintero? , Tecnologo en sistemas de informacion y Tecnico en redes electricas domiciliarias';
        }
         else if (message.includes('soporte')) {
            return '¿Necesitas soporte técnico para computadores o redes eléctricas?';
        } 
        else if (message.includes('computadores')) {
            return 'Ofrecemos servicios como mantenimiento de hardware, instalación de software y reparación de equipos. ¿Qué necesitas específicamente?';
        }
        else if (message.includes('quien eres')) {
            return 'Bienvenido a  IASERVICIOSVIP Ofrecemos servicios como mantenimiento de hardware, instalación de software y reparación de equipos. ¿Qué necesitas específicamente?';
        }
        
        else if (message.includes('redes eléctricas')) {
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
        }
            else if (message.includes('error según el retie') || message.includes('entiende por error') || message.includes('definicion de error retie')) {
        return 'Se entiende por "Error" una Acción o estado desacertado o equivocado, susceptible de provocar avería o accidente';
    }
    else if (message.includes('espacio con presencia de riesgos') || message.includes('definicion espacio riesgos')) {
        return 'Es un espacio en el cual, bien sea por condiciones propias de su naturaleza y/o destinación, o por falta de medidas de protección, se pueden presentar situaciones que comprometan la salud o la vida de personas, o la vida animal y vegetal';
    }
    else if (message.includes('experiencia profesional') || message.includes('definicion experiencia profesional') || message.includes('experiencia para ingenieria')) {
        return 'Para estos efectos, la experiencia profesional solo se computará a partir de la fecha de expedición de la matrícula profesional o del certificado de inscripción profesional, respectivamente';
    }
    else if (message.includes('evaluación de la conformidad') || message.includes('definicion evaluacion conformidad') || message.includes('que es evaluacion conformidad')) {
        return 'Es el procedimiento utilizado, directa o indirectamente, para determinar que se cumplen los requisitos o prescripciones pertinentes de los Reglamentos técnicos o normas';
    }
    else if (message.includes('persona competente') || message.includes('definicion persona competente retie')) {
        return 'Persona Competente es la persona natural que ha demostrado su formación a través de matrícula profesional vigente o acreditación según la normatividad legal Esta persona está autorizada para ejercer en el campo de la electrotecnia, considerando los riesgos asociados a la electricidad, y ha adquirido conocimientos y habilidades12....';
    }
    else if (message.includes('peligro inminente') || message.includes('definicion peligro inminente') || message.includes('alto riesgo retie')) {
        return 'Para efectos del RETIE, alto riesgo será equivalente a peligro inminente Se entiende como una condición del entorno o práctica irregular cuya frecuencia esperada y severidad de sus efectos puedan comprometer fisiológicamente el cuerpo humano en forma grave (quemaduras, impactos, paro cardíaco, etc.)12... o afectar el entorno de la instalación eléctrica (contaminación, incendio o explosión)12....';
    }
    else if (message.includes('niveles de tensión') || message.includes('niveles de tension definidos') || message.includes('alta tension at') || message.includes('media tension mt') || message.includes('baja tension bt') || message.includes('muy baja tension')) {
        return 'Se definen varios niveles de tensión: • Alta tensión (AT): Tensiones nominales superiores a 57,5 kV14. • Media tensión (MT): Tensiones nominales superiores a 1000 V e inferiores a 57,5 kV14. • Baja tensión (BT): Tensiones nominales mayores o iguales a 25 V y menores o iguales a 1000 V14. • Muy baja tensión: Tensiones menores de 25 V14. La clasificación de una instalación eléctrica se basa en el valor de la tensión nominal más elevada si hay distintos niveles14.';
    }
    else if (message.includes('qué es el retie') && message.includes('objeto de esta modificación')) {
        return 'El RETIE es el Reglamento Técnico de Instalaciones Eléctricas El objeto de la Resolución 40117 de 2024 es modificar integralmente este Reglamento Técnico';
    }
    else if (message.includes('retie')) {
        return 'El RETIE es el Reglamento Técnico de Instalaciones Eléctricas El objeto de la Resolución 40117 de 2024 es modificar integralmente este Reglamento Técnico';
    }
    else if (message.includes('a qué aplica el retie') || message.includes('aplicabilidad retie') || message.includes('campo de aplicacion retie')) {
        return 'El Reglamento será aplicable a las instalaciones eléctricas, los productos utilizados en dichas instalaciones, y a las personas naturales y/o jurídicas que las intervengan4.';
    }


    // --- Sobre Análisis de Riesgos ---
    else if (message.includes('objetivo') && message.includes('análisis de riesgos de origen eléctrico')) {
        return 'Tiene como principal objetivo crear conciencia sobre los riesgos existentes en todos los lugares donde se haga uso de la electricidad o se tengan elementos energizados3.... Según el Título 5, el análisis de riesgos de origen eléctrico busca principalmente crear conciencia sobre los riesgos existentes donde se use electricidad o haya elementos energizados7....';
    }
    else if (message.includes('evaluar el nivel de riesgo eléctrico') || message.includes('evaluar grado de riesgo eléctrico') || message.includes('matriz de análisis de riesgos')) {
        return 'Se puede aplicar la matriz de análisis de riesgos (Tabla 1.5.1.4.1. a.) para la toma de decisiones5.... Para evaluar el nivel o grado de riesgo de tipo eléctrico, se puede aplicar una matriz de análisis de riesgos9.... La metodología incluye definir el factor de riesgo, si es potencial o real, y determinar las consecuencias para personas, animales, aspectos económicos, ambientales y de imagen de la empresa9.... La matriz relaciona Frecuencia y Gravedad para determinar los Niveles de Riesgo (Alto, Medio, Bajo)11.';
    }
    else if (message.includes('metodología básica') && message.includes('análisis de riesgos')) {
        return 'La metodología incluye definir el factor de riesgo a evaluar o categorizar, definir si el riesgo es potencial o real, y determinar las consecuencias para las personas o animales, económicas, ambientales y de imagen de la empresa, estimando según el caso particular5....';
    }
    else if (message.includes('niveles de riesgo definidos en la matriz') || message.includes('cuales son los niveles de riesgo')) {
        return 'Los niveles de riesgo son: Riesgo alto (necesita alta protección o toma obligatoria de acciones), Riesgo medio (necesita protección básica, que se amplía según criterio del ingeniero), y Riesgo bajo (se puede asumir el riesgo o instalar protección)7.';
    }
    else if (message.includes('análisis de riesgos de origen eléctrico según el retie') || message.includes('que es analisis de riesgos')) {
        return 'El Análisis de Riesgos es un conjunto de técnicas para identificar, clasificar y evaluar los factores de riesgo. Es el estudio de consecuencias nocivas o perjudiciales, vinculadas a exposiciones reales o potenciales5.... Según el Título 5, el análisis de riesgos de origen eléctrico busca principalmente crear conciencia sobre los riesgos existentes donde se use electricidad o haya elementos energizados7....';
    }


    // --- Sobre Productos y sus Requisitos ---
    else if (message.includes('qué deben cumplir los productos objeto del retie') || message.includes('productos del retie')) {
        return 'Deben cumplir todos los requisitos generales y particulares del producto, así como los ensayos mínimos requeridos establecidos en el Libro 2, demostrándolo a través de alguna de las alternativas de demostración de la conformidad8....';
    }
    else if (message.includes('productos usados o remanufacturados') || message.includes('usar productos usados en instalaciones')) {
        return 'Sí, pero solo si demuestran el cumplimiento de los requisitos del RETIE mediante ensayos tipo, realizados en laboratorios acreditados o evaluados por organismos de certificación de producto. El uso de equipos y materiales trasladados de lugar está limitado a que los resultados de pruebas de funcionalidad y aislamiento sean satisfactorios, y se deben dejar registros de estas pruebas12....';
    }
    else if (message.includes('información debe disponer el productor') || message.includes('informacion productos para consumidor') || message.includes('tipo de informacion deben tener los productos electricos') || message.includes('como debe estar disponible la informacion de los productos')) {
        return 'Debe disponer de la información (literales a, b y d del artículo 2.2.1) en medio físico o electrónico, de fácil acceso (insertos, catálogos, fichas, guías técnicas, páginas web, empaque), y su acceso debe ser libre sin condiciones de compra, afiliación o registro14.... Los productos deben incluir instrucciones para el correcto uso, incluyendo el ambiente adecuado (temperatura, humedad, presión, etc.)19.... También deben tener información adicional específica solicitada por el Reglamento21.... La información debe estar disponible en medio físico o electrónico21.... Puede ser en insertos, catálogos, fichas y guías técnicas, impresas o en archivos magnéticos (páginas web)21.... Debe ser de fácil acceso para el consumidor, sin condiciones como compra o registro21.... Los productores o comercializadores deben mantener copias de los certificados de conformidad de producto y suministrarlas si son requeridas23....';
    }
    else if (message.includes('ensayos mínimos') && message.includes('aisladores pasatapas para transformadores')) {
        return 'Se requieren ensayos que le sean aplicables, conformes a la norma NTC 2501-1 o norma internacional equivalente, incluyendo Examen radiográfico o de penetración de fucsina (para porosidades), Análisis dimensional, Ensayo de torque, Tensión de flameo (seco/húmedo), Impulso tipo rayo, y Envejecimiento UV16....';
    }
    else if (message.includes('ensayos mínimos') && (message.includes('cajas') || message.includes('encerramientos') || message.includes('envolventes'))) {
        return 'Incluyen Análisis dimensional y medida del volumen, Grado IP o NEMA (cuando aplique), Medida del espesor de lámina o pared, Verificación del torque a tuercas y tornillos, y Resistencia mecánica (impacto y compresión)18....';
    }
    else if (message.includes('rotulado permanente de las cajas para medidores') || message.includes('informacion cajas medidores')) {
        return 'Debe contener Nombre del productor o marca registrada, Modelo o referencia del producto, Tensión nominal, Grado IP o NEMA, y Corriente nominal cuando posee barrajes o dispositivo para interruptores20....';
    }
    else if (message.includes('rotulado permanente de las cajas de derivación') || message.includes('rotulado cajas porta borneras')) {
        return 'Debe contener Nombre del productor o marca registrada, Modelo o referencia del producto, Tensión nominal, Grado IP o NEMA, Corriente nominal, y Número de salidas22....';
    }
    else if (message.includes('ensayos mínimos') && (message.includes('clavijas') || message.includes('tomacorrientes de baja tensión'))) {
        return 'Deben cumplir requisitos de producto y ensayos mínimos requeridos adaptados de normas técnicas como IEC 60695-2-11, IEC 60884-1, entre otras24.... La fuente menciona varios ensayos para cintas aislantes en la misma sección, no específicamente para clavijas y tomacorrientes24.... Para clavijas y tomacorrientes de baja tensión se requieren ensayos como análisis dimensional, adherencia, elongación, resistencia a la llama, ensayo de flama (autoextinguible), resistencia a la humedad y tensión de ruptura dieléctrica45....';
    }
    else if (message.includes('característica de inflamabilidad') && (message.includes('cables') || message.includes('conductores aislados'))) {
        return 'Deben ser auto extinguibles o retardantes a la llama, o no propagadores de llama. Esta condición debe ser informada por el productor y probada conforme a norma de fabricación26....';
    }
    else if (message.includes('marcación de los dispositivos de protección contra sobretensiones') || message.includes('informacion dps baja tension')) {
        return 'Debe contener Nombre del productor o marca registrada, Número del modelo, Corriente de descarga nominal o impulso, Máxima tensión de funcionamiento continuo, Tipo de corriente y/o frecuencia, Clase o tipo, y Grado de protección si es mayor a IP 20 o NEMA 128....';
    }
    else if (message.includes('ensayos mínimos') && message.includes('dps de baja tensión')) {
        return 'Las partes aislantes de la carcasa deben ser auto extinguibles o no inflamables, ensayadas mediante el ensayo de hilo incandescente a 650°C para partes no portadoras de corriente30....';
    }
    else if (message.includes('información adicional') && message.includes('conectores de compresión')) {
        return 'Deben tener un instructivo, hoja de datos o información en el empaque que contenga indicaciones de instalación, el tipo de prensa y el valor del torque a aplicar32....';
    }
    else if (message.includes('ensayos mínimos') && (message.includes('interruptores') || message.includes('seccionadores') || message.includes('selectores'))) {
        return 'Según aplique: Verificación de la capacidad de operación, Determinación de la corriente soportable de corta duración y valor pico, Grado de protección IP, Verificación de las propiedades dieléctricas, Verificación del aumento de temperatura34....';
    }
    else if (message.includes('marcación de los interruptores automáticos') || message.includes('informacion interruptores automaticos')) {
        return 'Debe contener Nombre del productor o marca registrada, Corriente nominal, Indicación de las posiciones abierto/cerrado, Tensión de operación nominal, Capacidad de interrupción de cortocircuito, y Terminales de línea y carga (a menos que su construcción permita conexión inversa)36....';
    }
    else if (message.includes('marcado y etiquetado de interruptores y dimmers') || message.includes('informacion interruptores y dimmers')) {
        return 'Deben llevar de forma indeleble y legible: Razón social, Nombre del productor o marca registrada, Tensión nominal de operación, y Corriente nominal a interrumpir38....';
    }
    else if (message.includes('ensayos mínimos') && (message.includes('arrancadores') || message.includes('contactores') || message.includes('relés de control'))) {
        return 'Aumento de temperatura, Propiedades dieléctricas, Número de operaciones de apertura y cierre bajo condiciones normales40....';
    }
    else if (message.includes('ensayos mínimos') && message.includes('relés de protección')) {
        return 'Grado de protección IP o NEMA, Tensión de impulso, Tensión dieléctrica, Condición de falla, Determinación de temperaturas máximas bajo servicio continuo, Hilo incandescente o inflamabilidad42....';
    }
    else if (message.includes('productor sobre los fusibles') || message.includes('informacion fusibles')) {
        return 'Debe informar si el fusible es de acción lenta, rápida o ultrarrápida y disponer de las curvas características tiempo-corriente y otros parámetros técnicos para su correcta selección44....';
    }
    else if (message.includes('ensayos mínimos') && message.includes('hilos fusibles de alta tensión')) {
        return 'Características de fusión tiempo corriente para 300 S, 10 S y 0,1 S, Aumento de temperatura, y Resistencia mecánica44....';
    }
    else if (message.includes('ensayos mínimos') && message.includes('transformadores de distribución y potencia')) {
        return 'Incluyen propiedades dieléctricas, aumento de temperatura y protección contra cortocircuito, entre otros46....';
    }
    else if (message.includes('marcada en las máquinas eléctricas') || message.includes('informacion motores') || message.includes('informacion generadores')) {
        return 'Nombre del productor o marca registrada, Número de serie o marca de identificación, Tensión nominal o intervalo, Corriente nominal, Potencia nominal, Frecuencia nominal (o CC), Velocidad nominal o intervalo, Número de fases (para AC), Grados de protección IP, y Factor de potencia nominal (para AC)48....';
    }
    else if (message.includes('información adicional') && message.includes('máquinas eléctricas') && message.includes('suministrar el productor')) {
        return 'Puede mantenerse en canales electrónicos o catálogos e incluye Año de fabricación, Referencia de normas aplicadas, Características específicas, Sobre velocidad admisible, Temperaturas ambientes máxima y mínima admisibles, Masa total, Corriente de arranque (cuando aplique), y Torque de operación y arranque50....';
    }
    else if (message.includes('ensayos mínimos') && (message.includes('paneles fotovoltaicos') || message.includes('módulos fotovoltaicos') || message.includes('paneles solares'))) {
        return 'Determinación de la característica corriente-tensión (curva I-V), Coeficientes de temperatura (corriente, tensión, potencia pico), Medición de la Temperatura Nominal de Operación (NMOT), Medición de la Potencia Máxima (Wp) bajo Condiciones de Prueba Estándar, Ensayo de torsión, Ensayo de carga mecánica (para viento), y Ensayo de calentamiento húmedo52....';
    }
    else if (message.includes('marcada en los postes y torrecillas') || message.includes('informacion postes y torrecillas')) {
        return 'Nombre del productor o marca registrada, Longitud del poste o torrecillas en metros, Carga mínima de rotura en daN o kgf, Peso del poste, y Fecha de fabricación56....';
    }
    else if (message.includes('ensayos mínimos') && message.includes('postes de concreto')) {
        return 'Ensayo de flexión a carga de trabajo, Ensayo de carga de rotura, Resistencia a la compresión del concreto, Análisis dimensional, e Inspección visual56.... También se menciona la imborrabilidad y permanencia del rótulo56....';
    }
    else if (message.includes('ensayos mínimos') && message.includes('postes de acero')) {
        return 'Ensayo de flexión a carga de trabajo, Ensayo de carga de rotura, Análisis dimensional, e Inspección visual58.... También se menciona la imborrabilidad y permanencia del rótulo58....';
    }
    else if (message.includes('marcada en los canalizaciones y tuberías') || message.includes('informacion canalizaciones y tuberias')) {
        return 'Debe ser clara y permanente y contener Nombre del productor o marca registrada, Rangos de tensión y de corriente, Grado de protección IP o NEMA (y tipo de ambiente si es especial)60....';
    }
    else if (message.includes('ensayos mínimos') && (message.includes('canalizaciones') || message.includes('tuberías'))) { // Combinado con Q de pruebas tubería no metálica
        return 'Incluyen Verificación de propiedades dieléctricas, Verificación de resistencia al impacto, Verificación de distorsión por calentamiento, Inflamabilidad (solo tubería no metálica), Resistencia a la compresión, Resistencia al curvado, y Hilo incandescente (solo tubería no metálica)60.... Para tubería no metálica se requieren ensayos como resistencia al impacto, distorsión por calentamiento, inflamabilidad (si aplica), resistencia a la compresión y resistencia al curvado47....';
    }
    else if (message.includes('tablero de transferencia automática de carga') || message.includes('productos en tablero de transferencia')) {
        return 'Deben cumplir con los requisitos de producto y ensayos mínimos definidos para cada uno de ellos y contar con certificado de producto conforme a RETIE64....';
    }
     else if (message.includes('informacion minima se requiere marcar en productos') || message.includes('marcar en cajas de derivacion') || message.includes('marcar en interruptores') || message.includes('marcar en maquinas electricas') || message.includes('marcar en transformadores')) {
        return 'La marcación debe ser permanente e indeleble y generalmente incluye: • Nombre del productor o marca registrada25.... • Modelo o referencia25.... • Tensión nominal25.... • Corriente nominal25.... • Grado IP o NEMA25.... • Información específica como Potencia nominal (para máquinas/transformadores/grupos electrógenos)29..., Frecuencia nominal28..., Número de fases29..., o Año de fabricación (para transformadores, postes)32....';
    }


    // --- Sobre la Evaluación de la Conformidad y Certificación ---
    else if (message.includes('productos importados y de fabricación nacional') && message.includes('certificado de conformidad')) {
        return 'Sí, los productos importados deben disponer de certificados vigentes para su nacionalización, previamente al levante aduanero. Los productos de fabricación nacional deben disponer de certificados vigentes para su comercialización en Colombia66....';
    }
    else if (message.includes('esquemas de certificación') && message.includes('certificación de producto bajo el retie')) {
        return 'Se mencionan Certificación de Lote - Esquema 1B RETIE, Esquema 4 RETIE, o Esquema 5 RETIE. La denominación la determina el emisor según la realización efectiva de las actividades de evaluación mínimas68....';
    }
    else if (message.includes('información mínima debe incluir un certificado de conformidad de producto') || message.includes('contenido certificado de producto')) {
        return 'Nombre del productor o marca, Referencia o modelo, Esquema de certificación, Número o referencia del certificado, Identificación del productor/fabricante para Colombia, Fecha de expedición y vencimiento (y otras si aplican), Número(s) de reporte(s) de ensayo y laboratorio, y Usos permitidos y prohibiciones10....';
    }
    else if (message.includes('no hay un laboratorio acreditado en colombia') || message.includes('ensayo sin laboratorio acreditado')) {
        return 'Los ensayos se podrán realizar en laboratorios evaluados previamente por los organismos de certificación de producto, bajo la norma NTC- ISO/IEC 17025. El organismo de certificación solo puede usar estos laboratorios hasta que se acredite el primero en Colombia o por un año después de que el laboratorio haya sido definido por el organismo10.... Si no hay laboratorio acreditado en Colombia para un ensayo, se pueden usar laboratorios evaluados previamente por organismos de certificación de producto (bajo NTC-ISO/IEC 17025) hasta que uno colombiano sea acreditado o por un año66.... Para procesos de seguimiento, los ensayos se realizarán en laboratorios acreditados en Colombia; ante indisponibilidad, se pueden usar laboratorios evaluados nacionales o extranjeros, o acreditados extranjeros66....';
    }
    else if (message.includes('laboratorios y organismos extranjeros') && message.includes('demostración de la conformidad')) {
        return 'Sí, en casos específicos permitidos por el Reglamento, siempre y cuando estén reconocidos en acuerdos de reconocimiento multilateral de los que ONAC forme parte (como ILAC para laboratorios) o acuerdos de reconocimiento mutuo con Colombia70....';
    }
    else if (message.includes('plazo para que los laboratorios de ensayo acreditados') || message.includes('plazo respuesta laboratorios ensayo')) {
        return 'Deben responder por escrito integralmente en un plazo no mayor a 5 días hábiles, indicando condiciones técnicas y comerciales, así como el plazo de entrega de resultados10.... Si no tienen disponibilidad para iniciar ensayos en menos de 30 días, deben comunicarlo en 5 días hábiles10....';
    }
    else if (message.includes('laboratorio acreditado en colombia no responde') || message.includes('laboratorio no responde en plazo')) {
        return 'Se entenderá que se podrá acudir a otro laboratorio de ensayo acreditado10....';
    }
    else if (message.includes('resultados de ensayos tipo destructivo') && message.includes('procesos de certificación')) {
        return 'Sí, siempre que se presente ante el organismo de certificación una declaración del fabricante que manifieste que el producto no ha sufrido cambios de diseño, que se usan los mismos materiales, y que la norma de fabricación original sigue vigente74....';
    }
    else if (message.includes('actividades incluye el proceso de certificación de producto') || message.includes('certificacion por atributos o lotes')) {
        return 'Incluye selección de muestras76..., ejecución de inspección por atributos78..., realización de ensayos/pruebas78..., revisión y evaluación de resultados78..., elaboración de informe78..., decisión sobre el otorgamiento78..., comunicación de la decisión78..., registro en bases de datos80..., y autorización para el uso del certificado y la marca de conformidad80....';
    }
    else if (message.includes('alcance tiene un certificado de producto bajo el esquema 4 o 5 retie') || message.includes('alcance certificado esquema 4 o 5')) {
        return 'El alcance corresponde a una planta de producción. Si hay varias plantas, cada una debe tener un certificado diferente basado en muestreos y ensayos para los productos fabricados allí84....';
    }
    else if (message.includes('responsables por los servicios de evaluación de la conformidad') || message.includes('quienes son responsables evaluacion conformidad')) {
        return 'Los organismos de evaluación de la conformidad (profesionales con certificación, organismos de certificación e inspección) son responsables por los servicios que presten dentro del marco del certificado o documento que hayan expedido64.... El evaluador de la conformidad es responsable frente al consumidor (usuario del producto/instalación)64.... No serán responsables si el evaluado modificó las condiciones evaluadas o si hay afectaciones por sucesos naturales o fuerza mayor64....';
    }
    else if (message.includes('reconocer normas técnicas internacionales para demostrar conformidad') || message.includes('normas internacionales en retie')) {
        return 'Sí, el Ministerio puede definir una herramienta para incluir normas técnicas internacionales aplicables69.... Se puede solicitar la inclusión de normas no listadas69.... Este mecanismo se valida durante la importación a través de la VUCE69....';
    }


    // --- Sobre Instalaciones y Personal ---
    else if (message.includes('requiere para todo proyecto de distribución') || message.includes('requisitos proyecto distribucion electrica')) {
        return 'Debe contar con un diseño, con memorias de cálculos y planos de construcción, con el nombre, firma y matrícula profesional del responsable del diseño, excepto tramos en baja tensión específicos86....';
    }
    else if (message.includes('empresa que opere una red de distribución respecto a su personal') || message.includes('capacitacion personal empresa distribucion')) {
        return 'Debe proporcionar capacitación sobre riesgos eléctricos a las personas competentes que trabajen en o cerca de instalaciones energizadas y asegurarse de que estén autorizadas86.... También deben estar capacitadas en procedimientos de emergencia eléctrica y primeros auxilios, con copias visibles en sitios relevantes88.... Deben estar capacitados sobre los procedimientos a seguir en caso de emergencia eléctrica y sobre las reglas de primeros auxilios, incluyendo métodos de reanimación61.... Copias de estas reglas y procedimientos deben estar en sitios visibles61....';
    }
    else if (message.includes('evaluación del nivel de riesgo frente a rayos para instalaciones existentes') || message.includes('evaluacion riesgo rayos antes de retie')) {
        return 'Sí, para centrales de generación, líneas/redes de transmisión/distribución (construidas después de mayo de 2005) y ciertas instalaciones de uso final construidas antes de la vigencia del RETIE que presenten alta concentración de personas, alturas destacadas o alta densidad de rayos conocida (edificaciones multifamiliares, oficinas, hoteles, centros médicos, comerciales, industrias, etc.)90.... Esta evaluación debe estar disponible para autoridades90....';
    }
    else if (message.includes('instalaciones eléctricas en áreas mojadas') || message.includes('instalaciones en piscinas o jacuzzis')) {
        return 'Se requieren materiales y equipos adecuados debido a la menor soportabilidad del cuerpo humano a la corriente con piel mojada. La construcción y montajes deben ser ejecutados por personas competentes, además de cumplir otros requisitos92.... Debido a que la soportabilidad del cuerpo humano a la corriente eléctrica es menor con la piel mojada, estas instalaciones requieren materiales y equipos adecuados para esa condición55.... La construcción y los montajes deben ser ejecutados por personas competentes55....';
    }
    else if (message.includes('registros debe documentar la inspección de un sistema de puesta a tierra') || message.includes('registros inspeccion spt')) {
        return 'Condiciones generales de conductores, nivel de corrosión, estado de uniones, valores de resistencia, desviaciones respecto al RETIE, cambios frente a la última inspección, resultados de pruebas, y registro fotográfico94....';
    }
    else if (message.includes('trabajo de un inspector de instalaciones eléctricas') || message.includes('que hace un inspector electrico retie')) {
        return 'Corresponde al conjunto de tareas o actividades (bajo un Organismo de Inspección o de forma profesional) como evaluar, medir, examinar, ensayar, declarar, verificar, validar, revisar y comparar con requisitos del RETIE para determinar la conformidad de una instalación eléctrica96....';
    }
    else if (message.includes('quién puede emitir certificados de competencias de personas según el retie') || message.includes('certificar o habilitar personas retie')) {
        return 'Organismos de certificación de personas acreditados por el ONAC bajo ISO/IEC 17024 o NTC-ISO-IEC 17024, o entidades públicas habilitadas por el Ministerio de Trabajo98.... Las personas pueden certificarse por organismos de certificación de personas acreditados por ONAC conforme a la norma ISO/IEC 17024 o NTC-ISO-IEC 1702471.... También pueden obtener habilitación por el Ministerio del Trabajo, siguiendo sus lineamientos, el esquema de certificación y las Normas Sectoriales de Competencia Laboral71.... Entidades públicas habilitadas por el Ministerio de Trabajo también pueden emitir certificados de competencias73.';
    }
    else if (message.includes('ajustó en el retie respecto a la facultad de diseño de los técnicos electricistas') || message.includes('diseño tecnicos electricistas retie')) {
        return 'Se ajustaron los requisitos asociados al diseño de instalaciones, ya que los técnicos electricistas ya no tienen la facultad de proyectar y diseñar de forma autónoma instalaciones eléctricas, de acuerdo con la inexequibilidad del literal e) del artículo 10 de la Ley 1264 de 2008 declarada por la sentencia C-166 de 201599.';
    }
    else if (message.includes('simbología general a utilizar') || message.includes('donde encontrar simbologia retie')) {
        return 'Se pueden utilizar los símbolos gráficos contemplados en la Tabla 815, tomados de normas unificadas como IEC 60617, ANSI Y32, CSA Z99, IEEE 315, los cuales guardan mayor relación con la seguridad eléctrica14. Si se requieren otros símbolos, pueden tomarse de estas mismas normas14.';
    }
    else if (message.includes('objetivo de la señalización de seguridad') || message.includes('para que sirve la señalizacion de seguridad')) {
        return 'El objetivo de las señales de seguridad es transmitir mensajes de prevención, prohibición o información de forma clara, precisa y de fácil entendimiento15. Esto es relevante en zonas donde se ejecutan trabajos eléctricos o áreas con máquinas, equipos o instalaciones que presenten un peligro potencial15.';
    }
    else if (message.includes('código q') && message.includes('cuándo se debe usar')) {
        return 'El Código Q es una tabla de abreviaturas con significados específicos para la comunicación, como "Pedir autorización" (QAB) o "Tiene algún mensaje para mí?" (QRU)16.... Debe ser utilizado por las empresas que no tengan establecido un protocolo de comunicaciones propio18. Las reglas para mensajes orales incluyen la repetición y confirmación de identidad18.';
    }
    else if (message.includes('información deben proporcionar los operadores de red a los usuarios') || message.includes('que deben informar los operadores de red')) {
        return 'Los operadores de red deben producir y difundir cartillas de seguridad para usuarios residenciales, comerciales e industriales, con énfasis en seguridad y uso correcto de la energía57.... Estas cartillas deben ser prácticas, sencillas, ilustradas y estar disponibles57.... También deben instruir periódicamente (al menos cada seis meses) sobre recomendaciones de seguridad, por medios como la factura o volantes59.... Deben realizar campañas de advertencia sobre riesgos asociados a las redes59... e informar a los residentes cercanos durante trabajos de mantenimiento sobre riesgos59....';
    }
  else {
            return 'Lo siento, no entendí tu mensaje. Por favor, intenta ser más específico.';
        }
    }
}