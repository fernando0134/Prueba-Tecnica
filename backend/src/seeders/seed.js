// Cargo las variables de entorno
const dotenv = require('dotenv');
dotenv.config();

// Importo Sequelize y mis modelos
const { sequelize, Docente, Asignatura } = require('../models');

// Defino mi función para sembrar la base de datos con datos de prueba realistas
const sembrarDatos = async () => {
  try {
    console.log('🌱 [Seeder]: Iniciando la carga de datos iniciales...');

    // Sincronizo la base de datos recreando las tablas limpias para evitar duplicados
    await sequelize.sync({ force: true });
    console.log('🔄 [Seeder]: Tablas reiniciadas con éxito.');

    // Creo un conjunto de asignaturas iniciales
    const asignaturasCreadas = await Asignatura.bulkCreate([
      {
        nombre: 'Programación Web y Frontend',
        codigo: 'INF-301',
        descripcion: 'Desarrollo de aplicaciones modernas con Vue.js, React y TypeScript.',
        creditos: 4,
        horasSemanales: 5,
        activo: true,
      },
      {
        nombre: 'Bases de Datos y ORM',
        codigo: 'INF-302',
        descripcion: 'Modelado relacional, SQL, Sequelize y optimización de consultas.',
        creditos: 4,
        horasSemanales: 4,
        activo: true,
      },
      {
        nombre: 'Arquitectura de Software y APIs',
        codigo: 'INF-401',
        descripcion: 'Patrones de diseño, microservicios, APIs RESTful y seguridad.',
        creditos: 5,
        horasSemanales: 6,
        activo: true,
      },
      {
        nombre: 'Inteligencia Artificial y Machine Learning',
        codigo: 'INF-405',
        descripcion: 'Algoritmos de aprendizaje automático, redes neuronales y procesamiento de datos.',
        creditos: 5,
        horasSemanales: 6,
        activo: true,
      },
      {
        nombre: 'Estructuras de Datos y Algoritmos',
        codigo: 'INF-201',
        descripcion: 'Grafos, árboles, análisis de complejidad Big-O y diseño algorítmico.',
        creditos: 4,
        horasSemanales: 4,
        activo: true,
      },
    ]);

    console.log(`✅ [Seeder]: Creé ${asignaturasCreadas.length} asignaturas.`);

    // Creo docentes de prueba vinculados a las asignaturas recién creadas
    const docentesCreados = await Docente.bulkCreate([
      {
        nombre: 'Elena',
        apellidos: 'Ríos Montiel',
        email: 'elena.rios@universidad.edu',
        telefono: '+52 55 1234 5678',
        tituloAcademico: 'Doctora en Ciencias de la Computación',
        experienciaAnos: 8,
        asignaturaId: asignaturasCreadas[0].id, // Asignada a Programación Web
      },
      {
        nombre: 'Alejandro',
        apellidos: 'Morales Vargas',
        email: 'alejandro.morales@universidad.edu',
        telefono: '+52 55 8765 4321',
        tituloAcademico: 'Magíster en Ingeniería de Software',
        experienciaAnos: 6,
        asignaturaId: asignaturasCreadas[1].id, // Asignado a Bases de Datos
      },
      {
        nombre: 'Sofía',
        apellidos: 'Castillo Herrera',
        email: 'sofia.castillo@universidad.edu',
        telefono: '+52 55 5555 4444',
        tituloAcademico: 'Especialista en Arquitectura Cloud',
        experienciaAnos: 10,
        asignaturaId: asignaturasCreadas[2].id, // Asignada a Arquitectura de Software
      },
      {
        nombre: 'Martín',
        apellidos: 'Gómez Cárdenas',
        email: 'martin.gomez@universidad.edu',
        telefono: '+52 55 9999 1111',
        tituloAcademico: 'Magíster en Inteligencia Artificial',
        experienciaAnos: 5,
        asignaturaId: asignaturasCreadas[3].id, // Asignado a Inteligencia Artificial
      },
    ]);

    console.log(`✅ [Seeder]: Creé ${docentesCreados.length} docentes vinculados a sus asignaturas.`);
    console.log('🎉 [Seeder]: Proceso de sembrado completado con total éxito.');

    // Cierro la conexión a la base de datos al finalizar
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ [Seeder]: Ocurrió un error sembrando los datos:', error);
    process.exit(1);
  }
};

// Invoco la ejecución del seeder
sembrarDatos();
