// Importo Router desde Express y mi controlador de usuarios
const { Router } = require('express');
const usuarioController = require('../controllers/usuarioController');
const { verificarToken, verificarRol } = require('../middlewares/auth');

// Inicializo el enrutador de usuarios
const router = Router();

// Aplico los middlewares para que todas las operaciones de este módulo requieran autenticación y rol ADMIN
router.use(verificarToken, verificarRol(['ADMIN']));

// Consultar todas las cuentas de usuarios
router.get('/', usuarioController.obtenerTodos);

// Consultar el detalle / ficha técnica de una cuenta específica por ID
router.get('/:id', usuarioController.obtenerPorId);

// Crear una nueva cuenta administrativa (Admin o Coordinador)
router.post('/', usuarioController.crear);

// Actualizar información de una cuenta existente
router.put('/:id', usuarioController.actualizar);

// Activar o suspender cuenta de usuario
router.patch('/:id/estado', usuarioController.cambiarEstado);

// Exporto mi enrutador de usuarios
module.exports = router;
