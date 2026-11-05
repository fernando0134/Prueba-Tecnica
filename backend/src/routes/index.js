// Importo Router desde Express
const { Router } = require('express');

// Importo mis enrutadores modulares
const authRoutes = require('./authRoutes');
const usuarioRoutes = require('./usuarioRoutes');
const asignaturaRoutes = require('./asignaturaRoutes');
const docenteRoutes = require('./docenteRoutes');
const reporteRoutes = require('./reporteRoutes');

// Inicializo el enrutador principal de mi API
const router = Router();

// Endpoint de verificación de estado (Health Check)
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API RESTful operativa y funcionando al 100%.',
    timestamp: new Date().toISOString(),
  });
});

// Rutas de autenticación
router.use('/auth', authRoutes);

// Rutas de administración de usuarios (Exclusivo ADMIN)
router.use('/usuarios', usuarioRoutes);

// Rutas de gestión de asignaturas (CRUD completo)
router.use('/asignaturas', asignaturaRoutes);

// Rutas de gestión de docentes (CRUD completo con asignatura activa)
router.use('/docentes', docenteRoutes);

// Rutas de reportes y exportación (Excel / CSV y estadísticas)
router.use('/reportes', reporteRoutes);

// Exporto mi enrutador central
module.exports = router;
