// Importo Router desde Express
const { Router } = require('express');

// Importo mi controlador de docentes y mis validadores
const docenteController = require('../controllers/docenteController');
const {
  validarCrearDocente,
  validarActualizarDocente,
} = require('../middlewares/validators');

// Inicializo el enrutador para las rutas de docentes
const router = Router();

// Defino la ruta para consultar todos los docentes con sus asignaturas
router.get('/', docenteController.obtenerTodos);

// Defino la ruta para consultar el detalle de un docente por su ID
router.get('/:id', docenteController.obtenerPorId);

// Defino la ruta para crear un docente con su asignatura asignada
router.post('/', validarCrearDocente, docenteController.crear);

// Defino la ruta para actualizar los datos de un docente y/o su asignatura asignada
router.put('/:id', validarActualizarDocente, docenteController.actualizar);

// Defino la ruta para eliminar un docente de la base de datos
router.delete('/:id', docenteController.eliminar);

// Exporto mi enrutador de docentes
module.exports = router;
