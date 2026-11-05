// Importo Router desde Express y mi controlador de usuarios
const { Router } = require('express');
const usuarioController = require('../controllers/usuarioController');
const { verificarToken, verificarRol } = require('../middlewares/auth');

// Inicializo el enrutador de usuarios
const router = Router();

// Ruta protegida exclusivamente para usuarios con rol ADMIN
router.get(
  '/',
  verificarToken,
  verificarRol(['ADMIN']),
  usuarioController.obtenerTodos
);

// Exporto mi enrutador de usuarios
module.exports = router;
