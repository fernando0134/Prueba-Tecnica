// Importo DataTypes desde Sequelize, la conexión y bcryptjs para encriptación
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

// Defino el modelo Usuario para gestionar la autenticación y roles de acceso
const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El nombre del usuario no puede estar vacío.' },
    },
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: {
      msg: 'Ya existe un usuario registrado con este correo electrónico.',
    },
    validate: {
      isEmail: { msg: 'El correo electrónico debe ser válido.' },
    },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'La contraseña es obligatoria.' },
      len: {
        args: [6, 100],
        msg: 'La contraseña debe contener al menos 6 caracteres.',
      },
    },
  },
  rol: {
    type: DataTypes.ENUM('ADMIN', 'COORDINADOR'),
    allowNull: false,
    defaultValue: 'COORDINADOR',
    validate: {
      isIn: {
        args: [['ADMIN', 'COORDINADOR']],
        msg: 'El rol debe ser ADMIN o COORDINADOR.',
      },
    },
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'usuarios',
  timestamps: true,
  hooks: {
    // Hasheo automáticamente la contraseña antes de crear un nuevo usuario
    beforeCreate: async (usuario) => {
      if (usuario.password) {
        const salt = await bcrypt.genSalt(10);
        usuario.password = await bcrypt.hash(usuario.password, salt);
      }
    },
    // Hasheo la contraseña si es modificada en una actualización
    beforeUpdate: async (usuario) => {
      if (usuario.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        usuario.password = await bcrypt.hash(usuario.password, salt);
      }
    },
  },
});

// Método para verificar la validez de una contraseña comparándola con el hash
Usuario.prototype.compararPassword = async function (passwordIngresada) {
  return await bcrypt.compare(passwordIngresada, this.password);
};

// Exporto mi modelo Usuario
module.exports = Usuario;
