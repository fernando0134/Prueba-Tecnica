// Importo los modelos Docente y Asignatura desde mi capa de modelos
const { Docente, Asignatura } = require('../models');

// Implemento el controlador para la gestión completa de docentes
const docenteController = {
  // Obtengo todos los docentes registrados, incluyendo la información de su asignatura asignada
  obtenerTodos: async (req, res, next) => {
    try {
      // Consulto los docentes e incluyo el modelo Asignatura relacionado
      const docentes = await Docente.findAll({
        order: [['id', 'DESC']],
        include: [
          {
            model: Asignatura,
            as: 'asignatura',
            attributes: ['id', 'nombre', 'codigo', 'creditos', 'horasSemanales', 'activo'],
          },
        ],
      });

      // Retorno la respuesta con el listado de docentes y sus asignaturas
      return res.status(200).json({
        success: true,
        total: docentes.length,
        message: 'Listado de docentes recuperado exitosamente con sus asignaturas asignadas.',
        data: docentes,
      });
    } catch (error) {
      next(error);
    }
  },

  // Obtengo un docente específico mediante su ID, con los datos de su asignatura asignada
  obtenerPorId: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Busco al docente por su clave primaria e incluyo su asignatura
      const docente = await Docente.findByPk(id, {
        include: [
          {
            model: Asignatura,
            as: 'asignatura',
            attributes: ['id', 'nombre', 'codigo', 'descripcion', 'creditos', 'horasSemanales'],
          },
        ],
      });

      // Si no existe el docente en la base de datos, retorno 404
      if (!docente) {
        return res.status(404).json({
          success: false,
          message: `No encontré ningún docente con el ID ${id}.`,
        });
      }

      // Retorno los datos del docente encontrado
      return res.status(200).json({
        success: true,
        message: 'Docente encontrado exitosamente.',
        data: docente,
      });
    } catch (error) {
      next(error);
    }
  },

  // Creo un nuevo docente vinculando obligatoriamente su asignatura asignada
  crear: async (req, res, next) => {
    try {
      const {
        nombre,
        apellidos,
        email,
        telefono,
        tituloAcademico,
        experienciaAnos,
        asignaturaId,
      } = req.body;

      // Verifico que la asignatura asignada exista en la base de datos
      const asignaturaExistente = await Asignatura.findByPk(asignaturaId);
      if (!asignaturaExistente) {
        return res.status(404).json({
          success: false,
          message: `La asignatura con ID ${asignaturaId} no existe. No puedo asignar una asignatura inexistente.`,
        });
      }

      // Verifico si el correo electrónico ya está registrado por otro docente
      const emailExistente = await Docente.findOne({
        where: { email: email.trim().toLowerCase() },
      });

      if (emailExistente) {
        return res.status(409).json({
          success: false,
          message: `El correo electrónico '${email}' ya se encuentra registrado para otro docente.`,
        });
      }

      // Creo el registro del nuevo docente en la base de datos
      const nuevoDocente = await Docente.create({
        nombre: nombre.trim(),
        apellidos: apellidos.trim(),
        email: email.trim().toLowerCase(),
        telefono: telefono ? telefono.trim() : null,
        tituloAcademico: tituloAcademico.trim(),
        experienciaAnos: experienciaAnos !== undefined ? Number(experienciaAnos) : 0,
        asignaturaId: Number(asignaturaId),
      });

      // Cargo nuevamente el docente creado con los datos de su asignatura asignada
      const docenteCompleto = await Docente.findByPk(nuevoDocente.id, {
        include: [
          {
            model: Asignatura,
            as: 'asignatura',
            attributes: ['id', 'nombre', 'codigo', 'creditos', 'horasSemanales'],
          },
        ],
      });

      // Retorno respuesta con código 201 Created
      return res.status(201).json({
        success: true,
        message: 'Docente creado y asignatura asignada con éxito.',
        data: docenteCompleto,
      });
    } catch (error) {
      next(error);
    }
  },

  // Actualizo la información de un docente con la posibilidad de modificar su asignatura asignada
  actualizar: async (req, res, next) => {
    try {
      const { id } = req.params;
      const {
        nombre,
        apellidos,
        email,
        telefono,
        tituloAcademico,
        experienciaAnos,
        asignaturaId,
      } = req.body;

      // Busco al docente que se desea actualizar
      const docente = await Docente.findByPk(id);

      if (!docente) {
        return res.status(404).json({
          success: false,
          message: `No encontré ningún docente con el ID ${id} para actualizar.`,
        });
      }

      // Si se desea modificar la asignatura asignada, valido que la nueva asignatura exista
      if (asignaturaId !== undefined && Number(asignaturaId) !== docente.asignaturaId) {
        const nuevaAsignatura = await Asignatura.findByPk(asignaturaId);
        if (!nuevaAsignatura) {
          return res.status(404).json({
            success: false,
            message: `La nueva asignatura con ID ${asignaturaId} no existe en la base de datos.`,
          });
        }
      }

      // Si se desea cambiar el correo electrónico, valido que no colisione con otro docente
      if (email && email.trim().toLowerCase() !== docente.email) {
        const emailDuplicado = await Docente.findOne({
          where: { email: email.trim().toLowerCase() },
        });

        if (emailDuplicado) {
          return res.status(409).json({
            success: false,
            message: `El correo electrónico '${email}' ya pertenece a otro docente.`,
          });
        }
      }

      // Aplico la actualización de los datos proporcionados
      await docente.update({
        ...(nombre !== undefined && { nombre: nombre.trim() }),
        ...(apellidos !== undefined && { apellidos: apellidos.trim() }),
        ...(email !== undefined && { email: email.trim().toLowerCase() }),
        ...(telefono !== undefined && { telefono: telefono !== null ? telefono.trim() : null }),
        ...(tituloAcademico !== undefined && { tituloAcademico: tituloAcademico.trim() }),
        ...(experienciaAnos !== undefined && { experienciaAnos: Number(experienciaAnos) }),
        ...(asignaturaId !== undefined && { asignaturaId: Number(asignaturaId) }),
      });

      // Recargo la instancia para devolver los datos actualizados junto a su asignatura
      const docenteActualizado = await Docente.findByPk(docente.id, {
        include: [
          {
            model: Asignatura,
            as: 'asignatura',
            attributes: ['id', 'nombre', 'codigo', 'creditos', 'horasSemanales'],
          },
        ],
      });

      return res.status(200).json({
        success: true,
        message: 'Información del docente y su asignatura asignada actualizada correctamente.',
        data: docenteActualizado,
      });
    } catch (error) {
      next(error);
    }
  },

  // Elimino un docente de la base de datos
  eliminar: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Busco al docente para verificar su existencia
      const docente = await Docente.findByPk(id);

      if (!docente) {
        return res.status(404).json({
          success: false,
          message: `No encontré ningún docente con el ID ${id} para eliminar.`,
        });
      }

      const nombreCompleto = `${docente.nombre} ${docente.apellidos}`;

      // Procedo a eliminar físicamente al docente de la base de datos
      await docente.destroy();

      return res.status(200).json({
        success: true,
        message: `El docente '${nombreCompleto}' ha sido eliminado exitosamente de la base de datos.`,
      });
    } catch (error) {
      next(error);
    }
  },
};

// Exporto mi controlador de docentes
module.exports = docenteController;
