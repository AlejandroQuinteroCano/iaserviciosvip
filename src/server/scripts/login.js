document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Simular autenticación
    if (email === 'admin@admin.com' && password === 'admin123') {
        alert('Inicio de sesión exitoso como administrador');
        window.location.href = 'admin.html'; // Redirigir al panel de administración
    } else {
        alert('Inicio de sesión exitoso como usuario');
        window.location.href = 'index.html'; // Redirigir al inicio
    }
});