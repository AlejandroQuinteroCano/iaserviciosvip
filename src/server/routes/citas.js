const express = require('express');
const router = express.Router();
const Cita = require('../models/Cita');

// Obtener todas las citas
router.get('/', async (req, res) => {
    try {
        const citas = await Cita.find();
        res.json(citas);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener las citas', error: err });
    }
});

// Crear una nueva cita
router.post('/', async (req, res) => {
    const { date, time, user, description } = req.body;

    // Verificar si la cita ya está ocupada
    const citaExistente = await Cita.findOne({ date, time });
    if (citaExistente) {
        return res.status(400).json({ message: 'Este horario ya está ocupado.' });
    }

    // Crear la cita
    const nuevaCita = new Cita({ date, time, user, description });
    try {
        const citaGuardada = await nuevaCita.save();
        res.status(201).json({ message: 'Cita creada con éxito', cita: citaGuardada });
    } catch (err) {
        res.status(500).json({ message: 'Error al crear la cita', error: err });
    }
});

// Verificar disponibilidad
router.get('/disponibilidad', async (req, res) => {
    const { date } = req.query;

    try {
        const citas = await Cita.find({ date });
        const horariosOcupados = citas.map(cita => cita.time);
        res.json({ horariosOcupados });
    } catch (err) {
        res.status(500).json({ message: 'Error al verificar disponibilidad', error: err });
    }
});

module.exports = router;