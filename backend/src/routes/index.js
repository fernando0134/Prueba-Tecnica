// Importo Router desde Express
const { Router } = require('express');

// Importo mis enrutadores modulares
const asignaturaRoutes = require('./asignaturaRoutes');
const docenteRoutes = require('./docenteRoutes');

// Inicializo el enrutador principal de mi API
const router = Router();

// Defino un endpoint de verificación de estado (Health Check)
router.get('/health', (req, res) => {
  // Retorno el estado operacional del servicio junto a la marca de tiempo
  res.status(200).json({
    success: true,
    message: 'API RESTful operativa y funcionando al 100%.',
    timestamp: new Date().toISOString(),
  });
});

// Asigno el prefijo /asignaturas a las rutas de gestión de asignaturas
router.use('/asignaturas', asignaturaRoutes);

// Asigno el prefijo /docentes a las rutas de gestión de docentes
router.use('/docentes', docenteRoutes);

// Exporto mi enrutador central de la API
module.exports = router;
