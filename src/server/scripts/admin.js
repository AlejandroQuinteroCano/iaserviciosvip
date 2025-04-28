document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token'); // Obtener el token del almacenamiento local

    if (!token) {
        alert('Acceso denegado. Debes iniciar sesión como administrador.');
        window.location.href = 'login.html';
        return;
    }

    try {
        // Cargar pedidos
        const pedidosResponse = await fetch('http://localhost:3000/api/admin/pedidos', {
            headers: { 'Authorization': token }
        });
        const pedidos = await pedidosResponse.json();

        const pedidosContainer = document.getElementById('pedidos');
        pedidos.forEach(pedido => {
            const pedidoDiv = document.createElement('div');
            pedidoDiv.innerHTML = `
                <p><strong>Usuario:</strong> ${pedido.usuario.nombre} (${pedido.usuario.email})</p>
                <p><strong>Total:</strong> $${pedido.total}</p>
                <p><strong>Fecha:</strong> ${new Date(pedido.fecha).toLocaleString()}</p>
                <hr>
            `;
            pedidosContainer.appendChild(pedidoDiv);
        });

        // Cargar usuarios
        const usuariosResponse = await fetch('http://localhost:3000/api/admin/usuarios', {
            headers: { 'Authorization': token }
        });
        const usuarios = await usuariosResponse.json();

        const usuariosContainer = document.getElementById('usuarios');
        usuarios.forEach(usuario => {
            const usuarioDiv = document.createElement('div');
            usuarioDiv.innerHTML = `
                <p><strong>Nombre:</strong> ${usuario.nombre}</p>
                <p><strong>Email:</strong> ${usuario.email}</p>
                <p><strong>Rol:</strong> ${usuario.rol}</p>
                <hr>
            `;
            usuariosContainer.appendChild(usuarioDiv);
        });
    } catch (error) {
        console.error('Error al cargar los datos:', error);
        alert('Hubo un error al cargar los datos del panel de administración.');
    }
});
document.addEventListener('DOMContentLoaded', async () => {
    if (!verificarToken()) return;

    const token = localStorage.getItem('token');

    try {
        // Cargar pedidos
        const pedidosResponse = await fetch('http://localhost:3000/api/admin/pedidos', {
            headers: { 'Authorization': token }
        });
        const pedidos = await pedidosResponse.json();

        // Mostrar pedidos...
    } catch (error) {
        console.error('Error al cargar los datos:', error);
        alert('Hubo un error al cargar los datos del panel de administración.');
    }
});