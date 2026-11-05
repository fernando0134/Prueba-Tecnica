// Importo Router desde Express y mi controlador de autenticación
const { Router } = require('express');
const authController = require('../controllers/authController');
const { verificarToken } = require('../middlewares/auth');

// Inicializo el enrutador para las rutas de autenticación
const router = Router();

// Ruta pública para registrar un nuevo usuario administrativo
router.post('/register', authController.registro);

// Ruta pública para iniciar sesión
router.post('/login', authController.login);

// Ruta protegida para consultar el perfil del usuario autenticado
router.get('/perfil', verificarToken, authController.obtenerPerfil);

// Exporto mi enrutador de autenticación
module.exports = router;
