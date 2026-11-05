// Importo las librerías necesarias para mi servidor Express
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Importo mis rutas principales y middlewares de manejo de errores
const apiRoutes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

// Inicializo mi aplicación Express
const app = express();

// Configuro CORS para permitir peticiones desde mi futuro frontend en Vue.js 3
app.use(cors({
  origin: '*', // En producción puedo restringirlo a la URL de mi frontend Vue
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Configuro morgan para registrar las solicitudes HTTP en consola en modo desarrollo
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Configuro los parsers para interpretar cuerpos en formato JSON y URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Defino la ruta raíz para dar la bienvenida a mi API
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Bienvenido a la API RESTful de Gestión de Docentes y Asignaturas.',
    endpoints: {
      health: '/api/health',
      asignaturas: '/api/asignaturas',
      docentes: '/api/docentes',
    },
  });
});

// Monto las rutas de mi API bajo el prefijo /api
app.use('/api', apiRoutes);

// Registro mi middleware para capturar rutas inexistentes (404)
app.use(notFoundHandler);

// Registro mi middleware centralizado para el manejo global de errores (500, validaciones, etc.)
app.use(errorHandler);

// Exporto mi aplicación configurada para que pueda ser ejecutada o testeada
module.exports = app;
