// Importo DataTypes desde Sequelize y la instancia de conexión
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Defino el modelo Docente con toda su información y clave foránea de asignatura
const Docente = sequelize.define('Docente', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: 'Identificador único del docente',
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notNull: {
        msg: 'El nombre del docente es obligatorio.',
      },
      notEmpty: {
        msg: 'El nombre del docente no puede estar vacío.',
      },
      len: {
        args: [2, 100],
        msg: 'El nombre debe tener entre 2 y 100 caracteres.',
      },
    },
  },
  apellidos: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notNull: {
        msg: 'Los apellidos del docente son obligatorios.',
      },
      notEmpty: {
        msg: 'Los apellidos no pueden estar vacíos.',
      },
      len: {
        args: [2, 100],
        msg: 'Los apellidos deben tener entre 2 y 100 caracteres.',
      },
    },
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: {
      msg: 'Ya existe un docente registrado con este correo electrónico.',
    },
    validate: {
      notNull: {
        msg: 'El correo electrónico es obligatorio.',
      },
      isEmail: {
        msg: 'Debes proporcionar un formato de correo electrónico válido.',
      },
    },
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      len: {
        args: [0, 20],
        msg: 'El número de teléfono no puede exceder 20 caracteres.',
      },
    },
  },
  tituloAcademico: {
    type: DataTypes.STRING(120),
    allowNull: false,
    validate: {
      notNull: {
        msg: 'El título académico del docente es obligatorio.',
      },
      notEmpty: {
        msg: 'El título académico no puede estar vacío.',
      },
    },
  },
  experienciaAnos: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      isInt: {
        msg: 'Los años de experiencia deben ser un número entero.',
      },
      min: {
        args: [0],
        msg: 'Los años de experiencia no pueden ser negativos.',
      },
    },
  },
  asignaturaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'asignaturas',
      key: 'id',
    },
    validate: {
      notNull: {
        msg: 'Debes asignar una asignatura obligatoriamente al docente.',
      },
      isInt: {
        msg: 'El identificador de la asignatura asignada debe ser un número entero válido.',
      },
    },
  },
}, {
  tableName: 'docentes',
  timestamps: true,
});

// Exporto el modelo Docente para su uso en asociaciones y controladores
module.exports = Docente;
