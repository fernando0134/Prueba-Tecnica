// Importo Sequelize y el módulo path para gestionar rutas de archivos
const { Sequelize } = require('sequelize');
const path = require('path');
const dotenv = require('dotenv');

// Cargo las variables de entorno desde el archivo .env
dotenv.config();

// Obtengo el dialecto de base de datos desde las variables de entorno o asigno sqlite por defecto
const dialect = process.env.DB_DIALECT || 'sqlite';

// Declaro la variable donde alojaré mi instancia de Sequelize
let sequelize;

// Inicializo la conexión a la base de datos según el dialecto configurado
if (dialect === 'sqlite') {
  // Configuro la conexión para SQLite utilizando un archivo local en la raíz del backend
  const storagePath = path.resolve(__dirname, '../../', process.env.DB_STORAGE || 'database.sqlite');
  
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: false,
    },
  });
} else {
  // Configuro la conexión cliente/servidor para PostgreSQL o MySQL si el usuario decide cambiar el dialecto
  sequelize = new Sequelize(
    process.env.DB_NAME || 'gestion_docentes',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASS || 'postgres',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: dialect,
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  );
}

// Creo una función para probar la conectividad con la base de datos
const testConnection = async () => {
  try {
    // Intento autenticarme contra el motor de base de datos
    await sequelize.authenticate();
    console.log('✅ [Base de Datos]: He establecido la conexión exitosamente.');
  } catch (error) {
    console.error('❌ [Base de Datos]: No pude conectar con la base de datos:', error.message);
    throw error;
  }
};

// Exporto mi instancia de conexión y mi función de prueba
module.exports = {
  sequelize,
  testConnection,
};
