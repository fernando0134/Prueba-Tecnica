// Importo DataTypes desde Sequelize y la instancia de conexión
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Defino el modelo Asignatura asegurando la unicidad tanto del nombre como del código
const Asignatura = sequelize.define('Asignatura', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: 'Identificador único de la asignatura',
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: {
      msg: 'Ya existe una asignatura registrada con este nombre.',
    },
    validate: {
      notNull: {
        msg: 'El nombre de la asignatura es obligatorio.',
      },
      notEmpty: {
        msg: 'El nombre de la asignatura no puede estar vacío.',
      },
      len: {
        args: [3, 100],
        msg: 'El nombre de la asignatura debe tener entre 3 y 100 caracteres.',
      },
    },
  },
  codigo: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: {
      msg: 'Ya existe una asignatura registrada con este código.',
    },
    validate: {
      notNull: {
        msg: 'El código de la asignatura es obligatorio.',
      },
      notEmpty: {
        msg: 'El código no puede estar vacío.',
      },
      len: {
        args: [2, 20],
        msg: 'El código debe tener entre 2 y 20 caracteres.',
      },
    },
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  creditos: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 3,
    validate: {
      isInt: {
        msg: 'Los créditos deben ser un número entero.',
      },
      min: {
        args: [1],
        msg: 'Los créditos deben ser al menos 1.',
      },
      max: {
        args: [10],
        msg: 'Los créditos no pueden superar 10.',
      },
    },
  },
  horasSemanales: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 4,
    validate: {
      isInt: {
        msg: 'Las horas semanales deben ser un número entero.',
      },
      min: {
        args: [1],
        msg: 'Las horas semanales deben ser al menos 1.',
      },
      max: {
        args: [40],
        msg: 'Las horas semanales no pueden superar 40.',
      },
    },
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    comment: 'Indica si la asignatura está activa para asignación docente',
  },
}, {
  tableName: 'asignaturas',
  timestamps: true,
});

// Exporto el modelo para utilizarlo en mis controladores y relaciones
module.exports = Asignatura;
