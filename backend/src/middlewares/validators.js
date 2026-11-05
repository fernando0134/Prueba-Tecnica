// Creo una función auxiliar para verificar si un valor es texto no vacío
const esTextoValido = (valor) => {
  return typeof valor === 'string' && valor.trim().length > 0;
};

// Creo una función auxiliar para verificar formato de correo electrónico
const esEmailValido = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Middleware con el que valido los datos para crear una Asignatura
const validarCrearAsignatura = (req, res, next) => {
  const { nombre, codigo, creditos, horasSemanales } = req.body;
  const errores = [];

  // Valido que el nombre esté presente y no sea vacío
  if (!esTextoValido(nombre)) {
    errores.push('El campo "nombre" es obligatorio y debe ser una cadena de texto.');
  }

  // Valido que el código esté presente
  if (!esTextoValido(codigo)) {
    errores.push('El campo "codigo" es obligatorio y debe ser una cadena de texto.');
  }

  // Valido que los créditos sean numéricos si se proporcionan
  if (creditos !== undefined && (!Number.isInteger(Number(creditos)) || Number(creditos) <= 0)) {
    errores.push('El campo "creditos" debe ser un número entero positivo.');
  }

  // Valido que las horas semanales sean numéricas si se proporcionan
  if (horasSemanales !== undefined && (!Number.isInteger(Number(horasSemanales)) || Number(horasSemanales) <= 0)) {
    errores.push('El campo "horasSemanales" debe ser un número entero positivo.');
  }

  // Si detecto errores, corto la petición y respondo con 400 Bad Request
  if (errores.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Los datos proporcionados para la asignatura no son válidos.',
      errors: errores,
    });
  }

  // Paso al siguiente middleware si todo es válido
  next();
};

// Middleware con el que valido los datos para actualizar una Asignatura
const validarActualizarAsignatura = (req, res, next) => {
  const { nombre, codigo, creditos, horasSemanales } = req.body;
  const errores = [];

  if (nombre !== undefined && !esTextoValido(nombre)) {
    errores.push('El campo "nombre" no puede estar vacío.');
  }

  if (codigo !== undefined && !esTextoValido(codigo)) {
    errores.push('El campo "codigo" no puede estar vacío.');
  }

  if (creditos !== undefined && (!Number.isInteger(Number(creditos)) || Number(creditos) <= 0)) {
    errores.push('El campo "creditos" debe ser un número entero positivo.');
  }

  if (horasSemanales !== undefined && (!Number.isInteger(Number(horasSemanales)) || Number(horasSemanales) <= 0)) {
    errores.push('El campo "horasSemanales" debe ser un número entero positivo.');
  }

  if (errores.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Datos inválidos para actualizar la asignatura.',
      errors: errores,
    });
  }

  next();
};

// Middleware con el que valido los datos para crear un Docente
const validarCrearDocente = (req, res, next) => {
  const { nombre, apellidos, email, tituloAcademico, asignaturaId, experienciaAnos } = req.body;
  const errores = [];

  // Valido campos de texto obligatorios
  if (!esTextoValido(nombre)) {
    errores.push('El campo "nombre" es obligatorio.');
  }

  if (!esTextoValido(apellidos)) {
    errores.push('El campo "apellidos" es obligatorio.');
  }

  if (!esTextoValido(email) || !esEmailValido(email)) {
    errores.push('El campo "email" es obligatorio y debe tener un formato de correo válido.');
  }

  if (!esTextoValido(tituloAcademico)) {
    errores.push('El campo "tituloAcademico" es obligatorio.');
  }

  // Valido que la asignatura asignada sea enviada y sea un número
  if (asignaturaId === undefined || asignaturaId === null || isNaN(Number(asignaturaId))) {
    errores.push('Debes enviar un "asignaturaId" numérico válido para asignar la asignatura al docente.');
  }

  // Valido la experiencia si viene dada
  if (experienciaAnos !== undefined && (!Number.isInteger(Number(experienciaAnos)) || Number(experienciaAnos) < 0)) {
    errores.push('El campo "experienciaAnos" debe ser un número entero mayor o igual a 0.');
  }

  // Si encuentro inconsistencias, retorno respuesta con código 400
  if (errores.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Los datos proporcionados para el docente no son válidos.',
      errors: errores,
    });
  }

  next();
};

// Middleware con el que valido los datos al actualizar un Docente
const validarActualizarDocente = (req, res, next) => {
  const { nombre, apellidos, email, tituloAcademico, asignaturaId, experienciaAnos } = req.body;
  const errores = [];

  if (nombre !== undefined && !esTextoValido(nombre)) {
    errores.push('El campo "nombre" no puede estar vacío.');
  }

  if (apellidos !== undefined && !esTextoValido(apellidos)) {
    errores.push('El campo "apellidos" no puede estar vacío.');
  }

  if (email !== undefined && (!esTextoValido(email) || !esEmailValido(email))) {
    errores.push('El campo "email" debe ser un formato de correo válido.');
  }

  if (tituloAcademico !== undefined && !esTextoValido(tituloAcademico)) {
    errores.push('El campo "tituloAcademico" no puede estar vacío.');
  }

  if (asignaturaId !== undefined && (isNaN(Number(asignaturaId)) || Number(asignaturaId) <= 0)) {
    errores.push('El campo "asignaturaId" debe ser un número entero positivo.');
  }

  if (experienciaAnos !== undefined && (!Number.isInteger(Number(experienciaAnos)) || Number(experienciaAnos) < 0)) {
    errores.push('El campo "experienciaAnos" debe ser un número entero mayor o igual a 0.');
  }

  if (errores.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Datos inválidos para actualizar el docente.',
      errors: errores,
    });
  }

  next();
};

// Exporto todos mis validadores
module.exports = {
  validarCrearAsignatura,
  validarActualizarAsignatura,
  validarCrearDocente,
  validarActualizarDocente,
};
