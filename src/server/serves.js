const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const productosRoutes = require('./routes/productos');
const pedidosRoutes = require('./routes/pedidos');
const usuariosRoutes = require('./routes/usuarios');
const adminRoutes = require('./routes/admin'); // Rutas de administración
const citasRoutes = require('./routes/citas'); // Importar las rutas de citas
const faqRoutes = require('./routes/faq');


const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Conexión a MongoDB local
/*mongoose.connect('mongodb://localhost:27017/mi-pagina-web', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})*/
// conexion dese momgo atlas 
/*
mongosh "mongodb+srv://iaserviciosvip.mfwcp4e.mongodb.net/" --apiVersion 1 --username diegoalejandrocano --password Hz1eqFAUfu05lv0I
*/
mongoose.connect('mongodb+srv://<diegoalejandrocano>:<Hz1eqFAUfu05lv0I>@cluster0.mongodb.net/mi-pagina-web?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Conectado a MongoDB Atlas'))
.catch(err => console.error('Error al conectar a MongoDB Atlas:', err));
// Rutas
app.use('/api/productos', productosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/admin', adminRoutes); // Rutas de administración
// Otras rutas...
app.use('/api/citas', citasRoutes); // Registrar las rutas de citas

app.use('/api/faq', faqRoutes);
// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});