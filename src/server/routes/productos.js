const express = require('express');
const router = express.Router();
const Producto = require('../models/producto');

// Obtener todos los productos
router.get('/', async (req, res) => {
    try {
        const productos = await Producto.find();
        res.json(productos);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
});

// Agregar un nuevo producto
router.post('/', async (req, res) => {
    const { nombre, descripcion, precio, stock } = req.body;
    const nuevoProducto = new Producto({ nombre, descripcion, precio, stock });

    try {
        const productoGuardado = await nuevoProducto.save();
        res.status(201).json(productoGuardado);
    } catch (err) {
        res.status(400).json({ error: 'Error al guardar el producto' });
    }
});

module.exports = router;