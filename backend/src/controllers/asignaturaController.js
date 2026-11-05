// Importo los modelos Asignatura y Docente desde mi directorio de modelos
const { Asignatura, Docente } = require('../models');

// Implemento el controlador para gestionar las asignaturas
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
      // Si ocurre un error, lo envío al middleware centralizado de errores
      next(error);
    }
  },

  // Obtengo una asignatura específica a partir de su ID recibido en los parámetros
  obtenerPorId: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Busco la asignatura por clave primaria incluyendo sus docentes
      const asignatura = await Asignatura.findByPk(id, {
        include: [
          {
            model: Docente,
            as: 'docentes',
            attributes: ['id', 'nombre', 'apellidos', 'email', 'tituloAcademico', 'experienciaAnos'],
          },
        ],
      });

      // Si no encuentro la asignatura, respondo con un 404
      if (!asignatura) {
        return res.status(404).json({
          success: false,
          message: `No encontré ninguna asignatura con el ID ${id}.`,
        });
      }

      // Retorno la asignatura encontrada
      return res.status(200).json({
        success: true,
        message: 'Asignatura encontrada exitosamente.',
        data: asignatura,
      });
    } catch (error) {
      next(error);
    }
  },

  // Creo una nueva asignatura en la base de datos
  crear: async (req, res, next) => {
    try {
      const { nombre, codigo, descripcion, creditos, horasSemanales, activo } = req.body;

      // Verifico preventivamente si ya existe una asignatura con el mismo código
      const existeCodigo = await Asignatura.findOne({
        where: { codigo: codigo.trim().toUpperCase() },
      });

      if (existeCodigo) {
        return res.status(409).json({
          success: false,
          message: `Ya existe una asignatura registrada con el código '${codigo.trim().toUpperCase()}'.`,
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

      // Respondo con código 201 Created y la nueva entidad
      return res.status(201).json({
        success: true,
        message: 'Asignatura creada satisfactoriamente.',
        data: nuevaAsignatura,
      });
    } catch (error) {
      next(error);
    }
  },

  // Actualizo la información de una asignatura existente
  actualizar: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { nombre, codigo, descripcion, creditos, horasSemanales, activo } = req.body;

      // Busco la asignatura que deseo actualizar
      const asignatura = await Asignatura.findByPk(id);

      if (!asignatura) {
        return res.status(404).json({
          success: false,
          message: `No encontré ninguna asignatura con el ID ${id} para actualizar.`,
        });
      }

      // Si se envía un nuevo código, compruebo que no pertenezca a otra asignatura distinta
      if (codigo && codigo.trim().toUpperCase() !== asignatura.codigo) {
        const codigoDuplicado = await Asignatura.findOne({
          where: { codigo: codigo.trim().toUpperCase() },
        });

        if (codigoDuplicado) {
          return res.status(409).json({
            success: false,
            message: `El código '${codigo.trim().toUpperCase()}' ya está en uso por otra asignatura.`,
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

      // Retorno la entidad actualizada
      return res.status(200).json({
        success: true,
        message: 'Asignatura actualizada exitosamente.',
        data: asignatura,
      });
    } catch (error) {
      next(error);
    }
  },

  // Elimino una asignatura de la base de datos
  eliminar: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Busco la asignatura existente
      const asignatura = await Asignatura.findByPk(id);

      if (!asignatura) {
        return res.status(404).json({
          success: false,
          message: `No encontré ninguna asignatura con el ID ${id} para eliminar.`,
        });
      }

      // Verifico si existen docentes asignados a esta asignatura antes de borrar
      const docentesAsociados = await Docente.count({
        where: { asignaturaId: id },
      });

      // Si tiene docentes asignados, restrinjo la eliminación para proteger la integridad relacional
      if (docentesAsociados > 0) {
        return res.status(400).json({
          success: false,
          message: `No puedo eliminar la asignatura '${asignatura.nombre}' porque tiene ${docentesAsociados} docente(s) asignado(s). Reasigna o elimina los docentes primero.`,
        });
      }

      // Procedo a destruir el registro de la base de datos
      await asignatura.destroy();

      return res.status(200).json({
        success: true,
        message: `La asignatura '${asignatura.nombre}' ha sido eliminada correctamente.`,
      });
    } catch (error) {
      next(error);
    }
  },
};

// Exporto mi controlador de asignaturas
module.exports = asignaturaController;
