document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3000/api/usuarios/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok) {
            alert('Inicio de sesión exitoso');
            localStorage.setItem('token', data.token); // Guardar el token en el almacenamiento local
            window.location.href = 'index.html'; // Redirigir al inicio
        } else {
            alert(data.error || 'Error al iniciar sesión');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Hubo un error al iniciar sesión');
    }
});

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email-register').value;
    const password = document.getElementById('password-register').value;

    try {
        const response = await fetch('http://localhost:3000/api/usuarios/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email, password })
        });

        const data = await response.json();
        if (response.ok) {
            alert('Registro exitoso. Ahora puedes iniciar sesión.');
        } else {
            alert(data.error || 'Error al registrarse');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Hubo un error al registrarse');
    }
});
const jwt = require('jsonwebtoken');

function autenticarUsuario(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token.' });
    }

    try {
        const verificado = jwt.verify(token, 'SECRET_KEY'); // Usa la misma clave secreta que en el login
        req.usuario = verificado; // Agrega los datos del usuario al objeto `req`
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token inválido.' });
    }
}

const jwt = require('jsonwebtoken');

function autenticarUsuario(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token.' });
    }

    try {
        const verificado = jwt.verify(token, 'SECRET_KEY'); // Usa la misma clave secreta que en el login
        req.usuario = verificado; // Agrega los datos del usuario al objeto `req`
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'El token ha expirado. Por favor, inicia sesión nuevamente.' });
        }
        res.status(401).json({ error: 'Token inválido.' });
    }
}
function verificarToken() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}
module.exports = autenticarUsuario;