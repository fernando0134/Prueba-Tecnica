// Cargo las variables de entorno al iniciar el servidor
const dotenv = require('dotenv');
dotenv.config();

// Importo mi aplicación de Express y mi instancia de Sequelize con asociaciones
const app = require('./app');
const { sequelize, testConnection } = require('./config/database');
// Importo los modelos para asegurar que sus definiciones y relaciones queden cargadas
require('./models');

// Determino el puerto en el que escucharé las peticiones
const PORT = process.env.PORT || 3000;

// Creo la función asíncrona para inicializar la base de datos y arrancar mi servidor
const iniciarServidor = async () => {
  try {
    console.log('⏳ [Servidor]: Conectando a la base de datos con Sequelize...');
    
    // Verifico la conexión activa
    await testConnection();

    // Sincronizo los modelos con la base de datos creando las tablas si no existen
    await sequelize.sync({ alter: false });
    console.log('✅ [Base de Datos]: Modelos sincronizados correctamente (tablas verificadas).');

    // Levanto el servidor en el puerto establecido
    app.listen(PORT, () => {
      console.log('========================================================');
      console.log(`🚀 [Servidor]: API RESTful ejecutándose en http://localhost:${PORT}`);
      console.log(`📚 [Rutas]: Docentes en http://localhost:${PORT}/api/docentes`);
      console.log(`📖 [Rutas]: Asignaturas en http://localhost:${PORT}/api/asignaturas`);
      console.log(`🩺 [Health]: Estado del servidor en http://localhost:${PORT}/api/health`);
      console.log('========================================================');
    });
  } catch (error) {
    console.error('❌ [Servidor]: Error crítico al iniciar la aplicación:', error);
    process.exit(1);
  }
};

// Ejecuto la función de inicio
iniciarServidor();
