// Importo la instancia de conexión Sequelize y mis modelos
const { sequelize } = require('../config/database');
const Docente = require('./Docente');
const Asignatura = require('./Asignatura');

// Establezco la relación: un Docente pertenece a una Asignatura
Docente.belongsTo(Asignatura, {
  foreignKey: 'asignaturaId',
  as: 'asignatura',
  onDelete: 'RESTRICT', // Evito borrar una asignatura si aún tiene docentes impartiéndola
  onUpdate: 'CASCADE',
});

// Establezco la relación inversa: una Asignatura puede tener muchos Docentes asignados
Asignatura.hasMany(Docente, {
  foreignKey: 'asignaturaId',
  as: 'docentes',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

// Agrupo y exporto los modelos junto con la instancia de conexión para sincronización
module.exports = {
  sequelize,
  Docente,
  Asignatura,
};
