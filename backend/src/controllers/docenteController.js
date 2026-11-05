// Importo los modelos Docente y Asignatura y operadores de Sequelize
const { Op } = require('sequelize');
const { Docente, Asignatura, sequelize } = require('../models');

// Implemento el controlador para la gestión completa de docentes y su regla de pertenencia a asignatura activa
const docenteController = {
  // Obtengo todos los docentes registrados con su asignatura asignada
  obtenerTodos: async (req, res, next) => {
    try {
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

  // Obtengo un docente por ID con los datos de su materia de enseñanza
  obtenerPorId: async (req, res, next) => {
    try {
      const { id } = req.params;

      const docente = await Docente.findByPk(id, {
        include: [
          {
            model: Asignatura,
            as: 'asignatura',
            attributes: ['id', 'nombre', 'codigo', 'descripcion', 'creditos', 'horasSemanales', 'activo'],
          },
        ],
      });

      if (!docente) {
        return res.status(404).json({
          success: false,
          message: `No encontré ningún docente con el ID ${id}.`,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Docente encontrado exitosamente.',
        data: docente,
      });
    } catch (error) {
      next(error);
    }
  },

  // Creo un nuevo docente validando que pertenezca obligatoriamente a una asignatura ACTIVA
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

      // Verifico que la asignatura asignada exista en el catálogo institucional
      const asignaturaExistente = await Asignatura.findByPk(asignaturaId);
      if (!asignaturaExistente) {
        return res.status(404).json({
          success: false,
          message: `La asignatura con ID ${asignaturaId} no existe en la base de datos.`,
        });
      }

      // REGLA DE NEGOCIO: Cada docente debe pertenecer a una asignatura ACTIVA
      if (!asignaturaExistente.activo) {
        return res.status(400).json({
          success: false,
          message: `La asignatura '${asignaturaExistente.nombre}' (${asignaturaExistente.codigo}) se encuentra inactiva. Por regla de negocio, cada docente debe pertenecer a una asignatura activa.`,
        });
      }

      // Verifico que el correo electrónico no esté duplicado (insensible a mayúsculas/minúsculas)
      const emailExistente = await Docente.findOne({
        where: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('email')),
          email.trim().toLowerCase()
        ),
      });

      if (emailExistente) {
        return res.status(409).json({
          success: false,
          message: `El correo electrónico '${email.trim().toLowerCase()}' ya se encuentra registrado para otro docente. El correo debe ser único.`,
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
            attributes: ['id', 'nombre', 'codigo', 'creditos', 'horasSemanales', 'activo'],
          },
        ],
      });

      return res.status(201).json({
        success: true,
        message: 'Docente creado y vinculado exitosamente a su asignatura activa.',
        data: docenteCompleto,
      });
    } catch (error) {
      next(error);
    }
  },

  // Actualizo la información del docente con la posibilidad de modificar su asignatura asignada (debe ser activa)
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

      const docente = await Docente.findByPk(id);

      if (!docente) {
        return res.status(404).json({
          success: false,
          message: `No encontré ningún docente con el ID ${id} para actualizar.`,
        });
      }

      // Si se desea modificar la asignatura asignada, valido existencia y que esté ACTIVA
      if (asignaturaId !== undefined && Number(asignaturaId) !== docente.asignaturaId) {
        const nuevaAsignatura = await Asignatura.findByPk(asignaturaId);
        if (!nuevaAsignatura) {
          return res.status(404).json({
            success: false,
            message: `La nueva asignatura con ID ${asignaturaId} no existe en la base de datos.`,
          });
        }

        // REGLA DE NEGOCIO: La nueva asignatura debe estar activa
        if (!nuevaAsignatura.activo) {
          return res.status(400).json({
            success: false,
            message: `No puedes reasignar al docente a la materia '${nuevaAsignatura.nombre}' porque está inactiva. Cada docente debe pertenecer a una asignatura activa.`,
          });
        }
      }

      // Si se desea cambiar el correo electrónico, valido que no colisione con otro docente
      if (email && email.trim().toLowerCase() !== docente.email.toLowerCase()) {
        const emailDuplicado = await Docente.findOne({
          where: {
            id: { [Op.ne]: id },
            [Op.and]: [
              sequelize.where(
                sequelize.fn('LOWER', sequelize.col('email')),
                email.trim().toLowerCase()
              ),
            ],
          },
        });

        if (emailDuplicado) {
          return res.status(409).json({
            success: false,
            message: `El correo electrónico '${email.trim().toLowerCase()}' ya pertenece a otro docente registrado.`,
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

      // Recargo la instancia con su asignatura asignada
      const docenteActualizado = await Docente.findByPk(docente.id, {
        include: [
          {
            model: Asignatura,
            as: 'asignatura',
            attributes: ['id', 'nombre', 'codigo', 'creditos', 'horasSemanales', 'activo'],
          },
        ],
      });

      return res.status(200).json({
        success: true,
        message: 'Información del docente y su asignatura de enseñanza actualizada correctamente.',
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

      const docente = await Docente.findByPk(id);

      if (!docente) {
        return res.status(404).json({
          success: false,
          message: `No encontré ningún docente con el ID ${id} para eliminar.`,
        });
      }

      const nombreCompleto = `${docente.nombre} ${docente.apellidos}`;

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
