const mongoose = require('mongoose');

const CitaSchema = new mongoose.Schema({
    date: { type: String, required: true }, // Fecha de la cita (YYYY-MM-DD)
    time: { type: String, required: true }, // Hora de la cita (HH:mm)
    user: { type: String, required: true }, // Nombre o identificador del usuario
    description: { type: String } // Descripción opcional
});

module.exports = mongoose.model('Cita', CitaSchema);