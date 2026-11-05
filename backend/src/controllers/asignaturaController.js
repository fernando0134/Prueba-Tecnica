// Importo los modelos Asignatura y Docente, y la función Sequelize para consultas avanzadas
const { Op } = require('sequelize');
const { Asignatura, Docente, sequelize } = require('../models');

// Implemento el controlador para gestionar las asignaturas cumpliendo las reglas de negocio
const asignaturaController = {
  // Obtengo el listado completo de asignaturas con sus docentes asociados
  obtenerTodas: async (req, res, next) => {
    try {
      // Consulto todas las asignaturas ordenadas por nombre de manera ascendente
      const asignaturas = await Asignatura.findAll({
        order: [['nombre', 'ASC']],
        include: [
          {
            model: Docente,
            as: 'docentes',
            attributes: ['id', 'nombre', 'apellidos', 'email', 'tituloAcademico'],
          },
        ],
      });

      // Retorno la respuesta exitosa con los datos obtenidos
      return res.status(200).json({
        success: true,
        total: asignaturas.length,
        message: 'Listado de asignaturas recuperado correctamente.',
        data: asignaturas,
      });
    } catch (error) {
      next(error);
    }
  },

  // Obtengo una asignatura específica a partir de su ID
  obtenerPorId: async (req, res, next) => {
    try {
      const { id } = req.params;

      const asignatura = await Asignatura.findByPk(id, {
        include: [
          {
            model: Docente,
            as: 'docentes',
            attributes: ['id', 'nombre', 'apellidos', 'email', 'tituloAcademico', 'experienciaAnos'],
          },
        ],
      });

      if (!asignatura) {
        return res.status(404).json({
          success: false,
          message: `No encontré ninguna asignatura con el ID ${id}.`,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Asignatura encontrada exitosamente.',
        data: asignatura,
      });
    } catch (error) {
      next(error);
    }
  },

  // Creo una nueva asignatura validando que tanto el nombre como el código sean estrictamente únicos
  crear: async (req, res, next) => {
    try {
      const { nombre, codigo, descripcion, creditos, horasSemanales, activo } = req.body;

      // Verifico que el nombre de la asignatura no exista previamente (insensible a mayúsculas)
      const existeNombre = await Asignatura.findOne({
        where: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('nombre')),
          nombre.trim().toLowerCase()
        ),
      });

      if (existeNombre) {
        return res.status(409).json({
          success: false,
          message: `Ya existe una asignatura registrada con el nombre '${nombre.trim()}'. El nombre debe ser único.`,
        });
      }

      // Verifico que el código de la asignatura no exista previamente
      const existeCodigo = await Asignatura.findOne({
        where: { codigo: codigo.trim().toUpperCase() },
      });

      if (existeCodigo) {
        return res.status(409).json({
          success: false,
          message: `Ya existe una asignatura registrada con el código '${codigo.trim().toUpperCase()}'. El código debe ser único.`,
        });
      }

      // Creo la asignatura en la base de datos
      const nuevaAsignatura = await Asignatura.create({
        nombre: nombre.trim(),
        codigo: codigo.trim().toUpperCase(),
        descripcion: descripcion ? descripcion.trim() : null,
        creditos: creditos !== undefined ? Number(creditos) : 3,
        horasSemanales: horasSemanales !== undefined ? Number(horasSemanales) : 4,
        activo: activo !== undefined ? Boolean(activo) : true,
      });

      return res.status(201).json({
        success: true,
        message: 'Asignatura creada satisfactoriamente.',
        data: nuevaAsignatura,
      });
    } catch (error) {
      next(error);
    }
  },

  // Actualizo la información de una asignatura existente validando unicidad de nombre y código
  actualizar: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { nombre, codigo, descripcion, creditos, horasSemanales, activo } = req.body;

      const asignatura = await Asignatura.findByPk(id);

      if (!asignatura) {
        return res.status(404).json({
          success: false,
          message: `No encontré ninguna asignatura con el ID ${id} para actualizar.`,
        });
      }

      // Si se modifica el nombre, compruebo que ninguna otra asignatura lo tenga registrado
      if (nombre && nombre.trim().toLowerCase() !== asignatura.nombre.toLowerCase()) {
        const nombreDuplicado = await Asignatura.findOne({
          where: {
            id: { [Op.ne]: id },
            [Op.and]: [
              sequelize.where(
                sequelize.fn('LOWER', sequelize.col('nombre')),
                nombre.trim().toLowerCase()
              ),
            ],
          },
        });

        if (nombreDuplicado) {
          return res.status(409).json({
            success: false,
            message: `El nombre '${nombre.trim()}' ya pertenece a otra asignatura registrada.`,
          });
        }
      }

      // Si se envía un nuevo código, compruebo que no pertenezca a otra asignatura distinta
      if (codigo && codigo.trim().toUpperCase() !== asignatura.codigo) {
        const codigoDuplicado = await Asignatura.findOne({
          where: {
            id: { [Op.ne]: id },
            codigo: codigo.trim().toUpperCase(),
          },
        });

        if (codigoDuplicado) {
          return res.status(409).json({
            success: false,
            message: `El código '${codigo.trim().toUpperCase()}' ya está en uso por otra asignatura.`,
          });
        }
      }

      // Si se intenta desactivar una asignatura que tiene docentes, advierto o valido
      if (activo === false) {
        const docentesAsignados = await Docente.count({ where: { asignaturaId: id } });
        if (docentesAsignados > 0) {
          return res.status(400).json({
            success: false,
            message: `No puedes desactivar esta asignatura porque tiene ${docentesAsignados} docente(s) en activo. Reasigna los docentes primero.`,
          });
        }
      }

      // Aplico los cambios a los campos recibidos
      await asignatura.update({
        ...(nombre !== undefined && { nombre: nombre.trim() }),
        ...(codigo !== undefined && { codigo: codigo.trim().toUpperCase() }),
        ...(descripcion !== undefined && { descripcion: descripcion !== null ? descripcion.trim() : null }),
        ...(creditos !== undefined && { creditos: Number(creditos) }),
        ...(horasSemanales !== undefined && { horasSemanales: Number(horasSemanales) }),
        ...(activo !== undefined && { activo: Boolean(activo) }),
      });

      return res.status(200).json({
        success: true,
        message: 'Asignatura actualizada exitosamente.',
        data: asignatura,
      });
    } catch (error) {
      next(error);
    }
  },

  // Elimino una asignatura garantizando estrictamente que no tenga docentes asignados
  eliminar: async (req, res, next) => {
    try {
      const { id } = req.params;

      const asignatura = await Asignatura.findByPk(id);

      if (!asignatura) {
        return res.status(404).json({
          success: false,
          message: `No encontré ninguna asignatura con el ID ${id} para eliminar.`,
        });
      }

      // Verifico estrictamente si existen docentes asignados a esta materia
      const docentesAsociados = await Docente.count({
        where: { asignaturaId: id },
      });

      // Si tiene docentes asignados, bloqueo rotundamente la eliminación
      if (docentesAsociados > 0) {
        return res.status(400).json({
          success: false,
          message: `No es posible eliminar la asignatura '${asignatura.nombre}' porque tiene ${docentesAsociados} docente(s) asignado(s). Para proteger la integridad académica, debes reasignar o eliminar los docentes antes de borrar la materia.`,
        });
      }

      // Destruyo el registro si no tiene ninguna relación docente activa
      await asignatura.destroy();

      return res.status(200).json({
        success: true,
        message: `La asignatura '${asignatura.nombre}' ha sido eliminada correctamente de la base de datos.`,
      });
    } catch (error) {
      next(error);
    }
  },
};

// Exporto mi controlador de asignaturas
module.exports = asignaturaController;
