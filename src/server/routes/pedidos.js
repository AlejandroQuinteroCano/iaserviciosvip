const express = require('express');
const router = express.Router();
const Pedido = require('../models/pedido');
const autenticarUsuario = require('../middleware/auth');


const verificarAdministrador = require('../middleware/roles');
const { createObjectCsvWriter } = require('csv-writer');
const fs = require('fs');
// Crear un nuevo pedido (solo usuarios autenticados)
router.post('/', autenticarUsuario, async (req, res) => {
    const { productos, total } = req.body;

    const nuevoPedido = new Pedido({
        productos,
        total,
        usuario: req.usuario.id // Asociar el pedido con el usuario autenticado
    });

    try {
        const pedidoGuardado = await nuevoPedido.save();
        res.status(201).json(pedidoGuardado);
    } catch (err) {
        res.status(400).json({ error: 'Error al guardar el pedido' });
    }
});

// Obtener los pedidos del usuario autenticado
router.get('/', autenticarUsuario, async (req, res) => {
    try {
        const pedidos = await Pedido.find({ usuario: req.usuario.id });
        res.json(pedidos);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener los pedidos' });
    }
});



// Actualizar un pedido (solo administradores)
router.put('/:id', autenticarUsuario, verificarAdministrador, async (req, res) => {
    const { id } = req.params;
    const { productos, total } = req.body;

    try {
        const pedidoActualizado = await Pedido.findByIdAndUpdate(
            id,
            { productos, total },
            { new: true }
        );
        res.json(pedidoActualizado);
    } catch (err) {
        res.status(400).json({ error: 'Error al actualizar el pedido' });
    }
});

// Eliminar un pedido (solo administradores)
router.delete('/:id', autenticarUsuario, verificarAdministrador, async (req, res) => {
    const { id } = req.params;

    try {
        await Pedido.findByIdAndDelete(id);
        res.json({ message: 'Pedido eliminado con éxito' });
    } catch (err) {
        res.status(400).json({ error: 'Error al eliminar el pedido' });
    }
});
// Obtener pedidos con filtros (solo administradores)
router.get('/filtrar', autenticarUsuario, verificarAdministrador, async (req, res) => {
    const { fechaInicio, fechaFin, usuarioId } = req.query;

    const filtros = {};

    // Filtrar por rango de fechas
    if (fechaInicio && fechaFin) {
        filtros.fecha = {
            $gte: new Date(fechaInicio),
            $lte: new Date(fechaFin)
        };
    }

    // Filtrar por usuario
    if (usuarioId) {
        filtros.usuario = usuarioId;
    }

    try {
        const pedidos = await Pedido.find(filtros).populate('usuario', 'nombre email');
        res.json(pedidos);
    } catch (err) {
        res.status(500).json({ error: 'Error al filtrar los pedidos' });
    }
});



// Exportar pedidos como CSV (solo administradores)
router.get('/exportar', autenticarUsuario, verificarAdministrador, async (req, res) => {
    try {
        const pedidos = await Pedido.find().populate('usuario', 'nombre email');

        // Configurar el escritor de CSV
        const csvWriter = createObjectCsvWriter({
            path: 'pedidos.csv', // Archivo temporal
            header: [
                { id: 'usuario', title: 'Usuario' },
                { id: 'email', title: 'Email' },
                { id: 'total', title: 'Total' },
                { id: 'fecha', title: 'Fecha' }
            ]
        });

        // Formatear los datos para el CSV
        const registros = pedidos.map(pedido => ({
            usuario: pedido.usuario.nombre,
            email: pedido.usuario.email,
            total: pedido.total,
            fecha: new Date(pedido.fecha).toLocaleString()
        }));

        // Escribir el archivo CSV
        await csvWriter.writeRecords(registros);

        // Enviar el archivo CSV al cliente
        res.download('pedidos.csv', 'pedidos.csv', (err) => {
            if (err) {
                console.error('Error al enviar el archivo CSV:', err);
                res.status(500).json({ error: 'Error al generar el archivo CSV' });
            }

            // Eliminar el archivo temporal después de enviarlo
            fs.unlinkSync('pedidos.csv');
        });
    } catch (err) {
        console.error('Error al exportar pedidos:', err);
        res.status(500).json({ error: 'Error al exportar pedidos' });
    }
});
// Obtener pedidos con filtros (solo administradores)
router.get('/filtrar', autenticarUsuario, verificarAdministrador, async (req, res) => {
    const { fechaInicio, fechaFin, usuarioId } = req.query;

    const filtros = {};

    // Filtrar por rango de fechas
    if (fechaInicio && fechaFin) {
        filtros.fecha = {
            $gte: new Date(fechaInicio),
            $lte: new Date(fechaFin)
        };
    }

    // Filtrar por usuario
    if (usuarioId) {
        filtros.usuario = usuarioId;
    }

    try {
        const pedidos = await Pedido.find(filtros).populate('usuario', 'nombre email');
        res.json(pedidos);
    } catch (err) {
        console.error('Error al filtrar los pedidos:', err);
        res.status(500).json({ error: 'Error al filtrar los pedidos' });
    }
});
// Exportar pedidos filtrados como CSV (solo administradores)
router.get('/exportar-filtrados', autenticarUsuario, verificarAdministrador, async (req, res) => {
    const { fechaInicio, fechaFin, usuarioId } = req.query;

    const filtros = {};

    if (fechaInicio && fechaFin) {
        filtros.fecha = {
            $gte: new Date(fechaInicio),
            $lte: new Date(fechaFin)
        };
    }

    if (usuarioId) {
        filtros.usuario = usuarioId;
    }

    try {
        const pedidos = await Pedido.find(filtros).populate('usuario', 'nombre email');

        const csvWriter = createObjectCsvWriter({
            path: 'pedidos-filtrados.csv',
            header: [
                { id: 'usuario', title: 'Usuario' },
                { id: 'email', title: 'Email' },
                { id: 'total', title: 'Total' },
                { id: 'fecha', title: 'Fecha' }
            ]
        });

        const registros = pedidos.map(pedido => ({
            usuario: pedido.usuario.nombre,
            email: pedido.usuario.email,
            total: pedido.total,
            fecha: new Date(pedido.fecha).toLocaleString()
        }));

        await csvWriter.writeRecords(registros);

        res.download('pedidos-filtrados.csv', 'pedidos-filtrados.csv', (err) => {
            if (err) {
                console.error('Error al enviar el archivo CSV:', err);
                res.status(500).json({ error: 'Error al generar el archivo CSV' });
            }

            fs.unlinkSync('pedidos-filtrados.csv');
        });
    } catch (err) {
        console.error('Error al exportar pedidos filtrados:', err);
        res.status(500).json({ error: 'Error al exportar pedidos filtrados' });
    }
});
module.exports = router;