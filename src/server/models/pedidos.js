const mongoose = require('mongoose');

const PedidoSchema = new mongoose.Schema({
    productos: [
        {
            nombre: { type: String, required: true },
            precio: { type: Number, required: true },
            cantidad: { type: Number, required: true }
        }
    ],
    total: { type: Number, required: true },
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true }, // Referencia al usuario
    fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pedido', PedidoSchema);