// Importo la instancia de conexión Sequelize y mis modelos
const { sequelize } = require('../config/database');
const Docente = require('./Docente');
const Asignatura = require('./Asignatura');
const Usuario = require('./Usuario');

// Establezco la relación: un Docente pertenece obligatoriamente a una Asignatura
Docente.belongsTo(Asignatura, {
  foreignKey: 'asignaturaId',
  as: 'asignatura',
  onDelete: 'RESTRICT', // Evito borrar una asignatura si aún tiene docentes asignados
  onUpdate: 'CASCADE',
});

// Establezco la relación inversa: una Asignatura puede tener muchos Docentes asignados
Asignatura.hasMany(Docente, {
  foreignKey: 'asignaturaId',
  as: 'docentes',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

// Agrupo y exporto los modelos para su uso en controladores y servicios
module.exports = {
  sequelize,
  Docente,
  Asignatura,
  Usuario,
};
