// Importo Router desde Express
const { Router } = require('express');

// Importo mis enrutadores modulares
const authRoutes = require('./authRoutes');
const asignaturaRoutes = require('./asignaturaRoutes');
const docenteRoutes = require('./docenteRoutes');
const reporteRoutes = require('./reporteRoutes');

// Inicializo el enrutador principal de mi API
const router = Router();

// Defino un endpoint de verificación de estado (Health Check)
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API RESTful operativa y funcionando al 100%.',
    timestamp: new Date().toISOString(),
  });
});

// Asigno el prefijo /auth a las rutas de autenticación y control de acceso
router.use('/auth', authRoutes);

// Asigno el prefijo /asignaturas a las rutas de gestión de asignaturas
router.use('/asignaturas', asignaturaRoutes);

// Asigno el prefijo /docentes a las rutas de gestión de docentes
router.use('/docentes', docenteRoutes);

// Asigno el prefijo /reportes a las rutas de exportación y resúmenes analíticos
router.use('/reportes', reporteRoutes);

// Exporto mi enrutador central de la API
module.exports = router;
