// Importo Router desde Express y mi controlador de reportes
const { Router } = require('express');
const reporteController = require('../controllers/reporteController');

// Inicializo el enrutador de reportes
const router = Router();

// Ruta para descargar el reporte de docentes y asignaturas en formato CSV / Excel
router.get('/docentes/csv', reporteController.exportarDocentesCsv);

// Ruta para consultar el resumen estadístico de la distribución académica
router.get('/estadisticas', reporteController.resumenEstadistico);

// Exporto mi enrutador de reportes
module.exports = router;
