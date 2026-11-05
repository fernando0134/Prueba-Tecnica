// Defino mi middleware para capturar rutas no encontradas (404)
const notFoundHandler = (req, res, next) => {
  // Construyo una respuesta clara para el cliente cuando la ruta no existe
  res.status(404).json({
    success: false,
    message: `La ruta solicitada '${req.originalUrl}' con método '${req.method}' no existe en esta API.`,
  });
};

// Defino mi middleware centralizado para el manejo global de errores
const errorHandler = (err, req, res, next) => {
  // Imprimo el error en consola si me encuentro en entorno de desarrollo para depurar
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ [Error Handler]:', err);
  }

  // Manejo errores de validación lanzados directamente por Sequelize
  if (err.name === 'SequelizeValidationError') {
    const errores = err.errors.map(e => ({
      campo: e.path,
      mensaje: e.message,
    }));

    return res.status(400).json({
      success: false,
      message: 'Fallaron las validaciones de datos.',
      errors: errores,
    });
  }

  // Manejo errores de unicidad (campos duplicados como email o código)
  if (err.name === 'SequelizeUniqueConstraintError') {
    const camposDuplicados = err.errors.map(e => ({
      campo: e.path,
      valor: e.value,
      mensaje: e.message,
    }));

    return res.status(409).json({
      success: false,
      message: 'Existe un conflicto con registros duplicados.',
      errors: camposDuplicados,
    });
  }

  // Manejo violaciones de clave foránea (por ejemplo intentar asignar una asignatura inexistente o borrar una asignada)
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'No es posible realizar la operación debido a una restricción de integridad referencial (clave foránea).',
      detail: err.parent ? err.parent.message : err.message,
    });
  }

  // Determino el código de estado HTTP o uso 500 por defecto
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Ocurrió un error inesperado en el servidor.';

  // Retorno la respuesta estandarizada de error
  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Exporto ambos manejadores de errores
module.exports = {
  notFoundHandler,
  errorHandler,
};
