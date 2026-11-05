// Importo Router desde Express
const { Router } = require('express');

// Importo mi controlador de docentes, validadores y middlewares de seguridad
const docenteController = require('../controllers/docenteController');
const {
  validarCrearDocente,
  validarActualizarDocente,
} = require('../middlewares/validators');
const { verificarToken, verificarRol } = require('../middlewares/auth');

// Inicializo el enrutador para las rutas de docentes
const router = Router();

// Consultas de lectura
router.get('/', docenteController.obtenerTodos);
router.get('/:id', docenteController.obtenerPorId);

// Creación de docente: Requiere autenticación y rol ADMIN o COORDINADOR
router.post(
  '/',
  verificarToken,
  verificarRol(['ADMIN', 'COORDINADOR']),
  validarCrearDocente,
  docenteController.crear
);

// Modificación y reasignación de materia: Requiere autenticación y rol ADMIN o COORDINADOR
router.put(
  '/:id',
  verificarToken,
  verificarRol(['ADMIN', 'COORDINADOR']),
  validarActualizarDocente,
  docenteController.actualizar
);

// Eliminación de docente: Estrictamente reservada para rol ADMIN
router.delete(
  '/:id',
  verificarToken,
  verificarRol(['ADMIN']),
  docenteController.eliminar
);

// Exporto mi enrutador de docentes
module.exports = router;
