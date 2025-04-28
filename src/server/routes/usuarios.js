const express = require('express');
const router = express.Router();
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Registrar un nuevo usuario
router.post('/register', async (req, res) => {
    const { nombre, email, password } = req.body;

    try {
        const nuevoUsuario = new Usuario({ nombre, email, password });
        const usuarioGuardado = await nuevoUsuario.save();
        res.status(201).json({ message: 'Usuario registrado con éxito', usuario: usuarioGuardado });
    } catch (err) {
        res.status(400).json({ error: 'Error al registrar el usuario', details: err.message });
    }
});

// Iniciar sesión
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const usuario = await Usuario.findOne({ email });
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

        const esValido = await bcrypt.compare(password, usuario.password);
        if (!esValido) return res.status(401).json({ error: 'Contraseña incorrecta' });

        // Generar token JWT
        const token = jwt.sign({ id: usuario._id, email: usuario.email }, 'SECRET_KEY', { expiresIn: '1h' });
        res.json({ message: 'Inicio de sesión exitoso', token });
    } catch (err) {
        res.status(500).json({ error: 'Error al iniciar sesión', details: err.message });
    }
});


// Actualizar un usuario (solo administradores)
router.put('/:id', autenticarUsuario, verificarAdministrador, async (req, res) => {
    const { id } = req.params;
    const { nombre, email, rol } = req.body;

    try {
        const usuarioActualizado = await Usuario.findByIdAndUpdate(
            id,
            { nombre, email, rol },
            { new: true }
        );
        res.json(usuarioActualizado);
    } catch (err) {
        res.status(400).json({ error: 'Error al actualizar el usuario' });
    }
});

// Eliminar un usuario (solo administradores)
router.delete('/:id', autenticarUsuario, verificarAdministrador, async (req, res) => {
    const { id } = req.params;

    try {
        await Usuario.findByIdAndDelete(id);
        res.json({ message: 'Usuario eliminado con éxito' });
    } catch (err) {
        res.status(400).json({ error: 'Error al eliminar el usuario' });
    }
});
// Iniciar sesión
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const usuario = await Usuario.findOne({ email });
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

        const esValido = await bcrypt.compare(password, usuario.password);
        if (!esValido) return res.status(401).json({ error: 'Contraseña incorrecta' });

        // Generar token JWT con expiración de 1 hora
        const token = jwt.sign(
            { id: usuario._id, email: usuario.email, rol: usuario.rol },
            'SECRET_KEY', // Cambia esto por una clave secreta segura
            { expiresIn: '1h' } // Expiración de 1 hora
        );
        res.json({ message: 'Inicio de sesión exitoso', token });
    } catch (err) {
        res.status(500).json({ error: 'Error al iniciar sesión', details: err.message });
    }
});
// Refrescar token
router.post('/refresh', autenticarUsuario, (req, res) => {
    const nuevoToken = jwt.sign(
        { id: req.usuario.id, email: req.usuario.email, rol: req.usuario.rol },
        'SECRET_KEY',
        { expiresIn: '1h' }
    );
    res.json({ token: nuevoToken });
});

// Cargar usuarios en la tabla
usuarios.forEach(usuario => {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${usuario.nombre}</td>
        <td>${usuario.email}</td>
        <td>${usuario.rol}</td>
        <td>
            <button class="btn btn-sm btn-warning btn-editar-usuario" data-id="${usuario._id}">Editar</button>
            <button class="btn btn-sm btn-danger btn-eliminar-usuario" data-id="${usuario._id}">Eliminar</button>
        </td>
    `;
    document.getElementById('usuarios-body').appendChild(row);
});

module.exports = router;

