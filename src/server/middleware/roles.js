function verificarAdministrador(req, res, next) {
    if (req.usuario.rol !== 'administrador') {
        return res.status(403).json({ error: 'Acceso denegado. Solo los administradores pueden realizar esta acción.' });
    }
    next();
}

module.exports = verificarAdministrador;