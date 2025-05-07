const express = require('express');
const router = express.Router();
const FAQ = require('../models/FAQ');

// Obtener todas las preguntas frecuentes
router.get('/', async (req, res) => {
    try {
        const faqs = await FAQ.find();
        res.json(faqs);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener las preguntas frecuentes', error: err });
    }
});

// Consultar una pregunta específica
router.get('/buscar', async (req, res) => {
    const { question } = req.query;

    try {
        const faq = await FAQ.findOne({ question: new RegExp(question, 'i') });
        if (faq) {
            res.json(faq);
        } else {
            res.status(404).json({ message: 'Pregunta no encontrada' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error al buscar la pregunta', error: err });
    }
});

module.exports = router;