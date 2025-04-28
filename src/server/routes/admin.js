const express = require('express');
const router = express.Router();
const Pedido = require('../models/pedido');
const Usuario = require('../models/usuario');
const autenticarUsuario = require('../middleware/auth');
const verificarAdministrador = require('../middleware/roles');

// Obtener todos los pedidos (solo administradores)
router.get('/pedidos', autenticarUsuario, verificarAdministrador, async (req, res) => {
    try {
        const pedidos = await Pedido.find().populate('usuario', 'nombre email');
        res.json(pedidos);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener los pedidos' });
    }
});

// Obtener todos los usuarios (solo administradores)
router.get('/usuarios', autenticarUsuario, verificarAdministrador, async (req, res) => {
    try {
        const usuarios = await Usuario.find().select('-password'); // Excluir la contraseña
        res.json(usuarios);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener los usuarios' });
    }
});



// Funcionalidad para eliminar usuarios
const botonesEliminarUsuario = document.querySelectorAll('.btn-eliminar-usuario');
botonesEliminarUsuario.forEach(boton => {
    boton.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            try {
                const response = await fetch(`http://localhost:3000/api/admin/usuarios/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': token }
                });
                if (response.ok) {
                    alert('Usuario eliminado con éxito');
                    location.reload(); // Recargar la página
                } else {
                    alert('Error al eliminar el usuario');
                }
            } catch (error) {
                console.error('Error al eliminar el usuario:', error);
            }
        }
    });
});

// Funcionalidad para editar usuarios
const botonesEditarUsuario = document.querySelectorAll('.btn-editar-usuario');
botonesEditarUsuario.forEach(boton => {
    boton.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        const nuevoRol = prompt('Ingresa el nuevo rol del usuario (usuario/administrador):');
        if (nuevoRol) {
            fetch(`http://localhost:3000/api/admin/usuarios/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify({ rol: nuevoRol })
            })
            .then(response => {
                if (response.ok) {
                    alert('Usuario actualizado con éxito');
                    location.reload(); // Recargar la página
                } else {
                    alert('Error al actualizar el usuario');
                }
            })
            .catch(error => console.error('Error al actualizar el usuario:', error));
        }
    });
});
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
                <button class="btn-editar" data-id="${pedido._id}">Editar</button>
                <button class="btn-eliminar" data-id="${pedido._id}">Eliminar</button>
                <hr>
            `;
            pedidosContainer.appendChild(pedidoDiv);
        });

        // Funcionalidad para eliminar pedidos
        const botonesEliminar = document.querySelectorAll('.btn-eliminar');
        botonesEliminar.forEach(boton => {
            boton.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                if (confirm('¿Estás seguro de que deseas eliminar este pedido?')) {
                    try {
                        const response = await fetch(`http://localhost:3000/api/admin/pedidos/${id}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': token }
                        });
                        if (response.ok) {
                            alert('Pedido eliminado con éxito');
                            location.reload(); // Recargar la página
                        } else {
                            alert('Error al eliminar el pedido');
                        }
                    } catch (error) {
                        console.error('Error al eliminar el pedido:', error);
                    }
                }
            });
        });

        // Funcionalidad para editar pedidos
        const botonesEditar = document.querySelectorAll('.btn-editar');
        botonesEditar.forEach(boton => {
            boton.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const nuevoTotal = prompt('Ingresa el nuevo total del pedido:');
                if (nuevoTotal) {
                    fetch(`http://localhost:3000/api/admin/pedidos/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': token
                        },
                        body: JSON.stringify({ total: parseFloat(nuevoTotal) })
                    })
                    .then(response => {
                        if (response.ok) {
                            alert('Pedido actualizado con éxito');
                            location.reload(); // Recargar la página
                        } else {
                            alert('Error al actualizar el pedido');
                        }
                    })
                    .catch(error => console.error('Error al actualizar el pedido:', error));
                }
            });
        });
    } catch (error) {
        console.error('Error al cargar los datos:', error);
        alert('Hubo un error al cargar los datos del panel de administración.');
    }
});
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token'); // Obtener el token del almacenamiento local

    if (!token) {
        alert('Acceso denegado. Debes iniciar sesión como administrador.');
        window.location.href = 'login.html';
        return;
    }

    // Función para filtrar pedidos
    document.getElementById('filtro-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const fechaInicio = document.getElementById('fechaInicio').value;
        const fechaFin = document.getElementById('fechaFin').value;
        const usuarioId = document.getElementById('usuarioId').value;

        const queryParams = new URLSearchParams();
        if (fechaInicio) queryParams.append('fechaInicio', fechaInicio);
        if (fechaFin) queryParams.append('fechaFin', fechaFin);
        if (usuarioId) queryParams.append('usuarioId', usuarioId);

        try {
            const response = await fetch(`http://localhost:3000/api/admin/pedidos/filtrar?${queryParams.toString()}`, {
                headers: { 'Authorization': token }
            });
            const pedidos = await response.json();

            const pedidosFiltradosContainer = document.getElementById('pedidos-filtrados');
            pedidosFiltradosContainer.innerHTML = ''; // Limpiar resultados anteriores

            if (pedidos.length === 0) {
                pedidosFiltradosContainer.innerHTML = '<p>No se encontraron pedidos con los filtros aplicados.</p>';
                return;
            }

            pedidos.forEach(pedido => {
                const pedidoDiv = document.createElement('div');
                pedidoDiv.innerHTML = `
                    <p><strong>Usuario:</strong> ${pedido.usuario.nombre} (${pedido.usuario.email})</p>
                    <p><strong>Total:</strong> $${pedido.total}</p>
                    <p><strong>Fecha:</strong> ${new Date(pedido.fecha).toLocaleString()}</p>
                    <hr>
                `;
                pedidosFiltradosContainer.appendChild(pedidoDiv);
            });
        } catch (error) {
            console.error('Error al filtrar los pedidos:', error);
            alert('Hubo un error al filtrar los pedidos.');
        }
    });
});
document.getElementById('exportar-csv').addEventListener('click', async () => {
    const token = localStorage.getItem('token'); // Obtener el token del almacenamiento local

    if (!token) {
        alert('Acceso denegado. Debes iniciar sesión como administrador.');
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/admin/pedidos/exportar', {
            headers: { 'Authorization': token }
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'pedidos.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();
        } else {
            alert('Error al exportar los pedidos.');
        }
    } catch (error) {
        console.error('Error al exportar los pedidos:', error);
        alert('Hubo un error al exportar los pedidos.');
    }
});
// Obtener estadísticas de ventas y usuarios (solo administradores)
router.get('/estadisticas', autenticarUsuario, verificarAdministrador, async (req, res) => {
    try {
        // Calcular ingresos totales
        const pedidos = await Pedido.find();
        const ingresosTotales = pedidos.reduce((total, pedido) => total + pedido.total, 0);

        // Contar usuarios registrados
        const usuariosRegistrados = await Usuario.countDocuments();

        // Contar pedidos realizados
        const pedidosRealizados = pedidos.length;

        res.json({
            ingresosTotales,
            usuariosRegistrados,
            pedidosRealizados
        });
    } catch (err) {
        console.error('Error al obtener estadísticas:', err);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
});
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token'); // Obtener el token del almacenamiento local

    if (!token) {
        alert('Acceso denegado. Debes iniciar sesión como administrador.');
        window.location.href = 'login.html';
        return;
    }

    try {
        // Obtener estadísticas
        const estadisticasResponse = await fetch('http://localhost:3000/api/admin/estadisticas', {
            headers: { 'Authorization': token }
        });
        const estadisticas = await estadisticasResponse.json();

        // Mostrar estadísticas en el DOM
        document.getElementById('ingresos-totales').textContent = estadisticas.ingresosTotales.toLocaleString();
        document.getElementById('usuarios-registrados').textContent = estadisticas.usuariosRegistrados;
        document.getElementById('pedidos-realizados').textContent = estadisticas.pedidosRealizados;
    } catch (error) {
        console.error('Error al cargar las estadísticas:', error);
        alert('Hubo un error al cargar las estadísticas.');
    }
});
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');

    if (!token) {
        alert('Acceso denegado. Debes iniciar sesión como administrador.');
        window.location.href = 'login.html';
        return;
    }

    try {
        // Obtener estadísticas
        const estadisticasResponse = await fetch('http://localhost:3000/api/admin/estadisticas', {
            headers: { 'Authorization': token }
        });
        const estadisticas = await estadisticasResponse.json();

        // Mostrar estadísticas en el DOM
        document.getElementById('ingresos-totales').textContent = estadisticas.ingresosTotales.toLocaleString();
        document.getElementById('usuarios-registrados').textContent = estadisticas.usuariosRegistrados;
        document.getElementById('pedidos-realizados').textContent = estadisticas.pedidosRealizados;

        // Crear gráfico de ingresos
        const ctx = document.getElementById('grafico-ingresos').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Ingresos Totales', 'Usuarios Registrados', 'Pedidos Realizados'],
                datasets: [{
                    label: 'Estadísticas',
                    data: [
                        estadisticas.ingresosTotales,
                        estadisticas.usuariosRegistrados,
                        estadisticas.pedidosRealizados
                    ],
                    backgroundColor: ['#4caf50', '#2196f3', '#ff9800']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error al cargar las estadísticas:', error);
        alert('Hubo un error al cargar las estadísticas.');
    }
});
// Cargar pedidos en la tabla
pedidos.forEach(pedido => {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${pedido.usuario.nombre}</td>
        <td>${pedido.usuario.email}</td>
        <td>$${pedido.total}</td>
        <td>${new Date(pedido.fecha).toLocaleString()}</td>
        <td>
            <button class="btn btn-sm btn-warning btn-editar" data-id="${pedido._id}">Editar</button>
            <button class="btn btn-sm btn-danger btn-eliminar" data-id="${pedido._id}">Eliminar</button>
        </td>
    `;
    document.getElementById('pedidos-body').appendChild(row);
});
document.getElementById('filtro-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const fechaInicio = document.getElementById('fechaInicio').value;
    const fechaFin = document.getElementById('fechaFin').value;
    const usuarioId = document.getElementById('usuarioId').value;

    const queryParams = new URLSearchParams();
    if (fechaInicio) queryParams.append('fechaInicio', fechaInicio);
    if (fechaFin) queryParams.append('fechaFin', fechaFin);
    if (usuarioId) queryParams.append('usuarioId', usuarioId);

    try {
        const response = await fetch(`http://localhost:3000/api/admin/pedidos/filtrar?${queryParams.toString()}`, {
            headers: { 'Authorization': token }
        });
        const pedidos = await response.json();

        const pedidosFiltradosContainer = document.getElementById('pedidos-filtrados');
        pedidosFiltradosContainer.innerHTML = ''; // Limpiar resultados anteriores

        if (pedidos.length === 0) {
            pedidosFiltradosContainer.innerHTML = '<p>No se encontraron pedidos con los filtros aplicados.</p>';
            return;
        }

        pedidos.forEach(pedido => {
            const pedidoDiv = document.createElement('div');
            pedidoDiv.innerHTML = `
                <p><strong>Usuario:</strong> ${pedido.usuario.nombre} (${pedido.usuario.email})</p>
                <p><strong>Total:</strong> $${pedido.total}</p>
                <p><strong>Fecha:</strong> ${new Date(pedido.fecha).toLocaleString()}</p>
                <hr>
            `;
            pedidosFiltradosContainer.appendChild(pedidoDiv);
        });
    } catch (error) {
        console.error('Error al filtrar los pedidos:', error);
        alert('Hubo un error al filtrar los pedidos.');
    }
});
document.getElementById('exportar-filtrados').addEventListener('click', async () => {
    const fechaInicio = document.getElementById('fechaInicio').value;
    const fechaFin = document.getElementById('fechaFin').value;
    const usuarioId = document.getElementById('usuarioId').value;

    const queryParams = new URLSearchParams();
    if (fechaInicio) queryParams.append('fechaInicio', fechaInicio);
    if (fechaFin) queryParams.append('fechaFin', fechaFin);
    if (usuarioId) queryParams.append('usuarioId', usuarioId);

    try {
        const response = await fetch(`http://localhost:3000/api/admin/pedidos/exportar-filtrados?${queryParams.toString()}`, {
            headers: { 'Authorization': token }
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'pedidos-filtrados.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();
        } else {
            alert('Error al exportar los pedidos filtrados.');
        }
    } catch (error) {
        console.error('Error al exportar los pedidos filtrados:', error);
        alert('Hubo un error al exportar los pedidos filtrados.');
    }
});
module.exports = router;