// Importo Router desde Express
const { Router } = require('express');

// Importo mi controlador de asignaturas y mis validadores
const asignaturaController = require('../controllers/asignaturaController');
const {
  validarCrearAsignatura,
  validarActualizarAsignatura,
} = require('../middlewares/validators');

// Inicializo el enrutador para las rutas de asignaturas
const router = Router();

// Defino la ruta para consultar todas las asignaturas
router.get('/', asignaturaController.obtenerTodas);

// Defino la ruta para consultar una asignatura por su identificador
router.get('/:id', asignaturaController.obtenerPorId);

// Defino la ruta para crear una nueva asignatura pasando por mi validador
router.post('/', validarCrearAsignatura, asignaturaController.crear);

// Defino la ruta para actualizar una asignatura por su identificador
router.put('/:id', validarActualizarAsignatura, asignaturaController.actualizar);

// Defino la ruta para eliminar una asignatura por su identificador
router.delete('/:id', asignaturaController.eliminar);

// Exporto mi enrutador de asignaturas
module.exports = router;
