const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UsuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    rol: { type: String, default: 'usuario', enum: ['usuario', 'administrador'] }, // Campo para roles
    fechaRegistro: { type: Date, default: Date.now }
});

// Encriptar la contraseña antes de guardar
UsuarioSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

module.exports = mongoose.model('Usuario', UsuarioSchema);