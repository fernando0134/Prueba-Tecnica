// Importo Router desde Express
const { Router } = require('express');

// Importo mi controlador de asignaturas, validadores y middlewares de seguridad
const asignaturaController = require('../controllers/asignaturaController');
const {
  validarCrearAsignatura,
  validarActualizarAsignatura,
} = require('../middlewares/validators');
const { verificarToken, verificarRol } = require('../middlewares/auth');

// Inicializo el enrutador para las rutas de asignaturas
const router = Router();

// Consultas públicas / de lectura
router.get('/', asignaturaController.obtenerTodas);
router.get('/:id', asignaturaController.obtenerPorId);

// Creación: Requiere autenticación y rol ADMIN o COORDINADOR
router.post(
  '/',
  verificarToken,
  verificarRol(['ADMIN', 'COORDINADOR']),
  validarCrearAsignatura,
  asignaturaController.crear
);

// Modificación: Requiere autenticación y rol ADMIN o COORDINADOR
router.put(
  '/:id',
  verificarToken,
  verificarRol(['ADMIN', 'COORDINADOR']),
  validarActualizarAsignatura,
  asignaturaController.actualizar
);

// Eliminación: Estrictamente reservada para rol ADMIN (protección contra eliminaciones indebidas)
router.delete(
  '/:id',
  verificarToken,
  verificarRol(['ADMIN']),
  asignaturaController.eliminar
);

// Exporto mi enrutador de asignaturas
module.exports = router;
