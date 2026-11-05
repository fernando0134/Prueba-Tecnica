// Importo el modelo Usuario y operadores de Sequelize
const { Op } = require('sequelize');
const { Usuario, sequelize } = require('../models');

// Implemento el controlador completo para la administración y gobernanza de cuentas (exclusivo para rol ADMIN)
const usuarioController = {
  // Obtengo el listado de todas las cuentas del sistema
  obtenerTodos: async (req, res, next) => {
    try {
      const usuarios = await Usuario.findAll({
        attributes: ['id', 'nombre', 'email', 'rol', 'activo', 'createdAt', 'updatedAt'],
        order: [['id', 'ASC']],
      });

      return res.status(200).json({
        success: true,
        total: usuarios.length,
        message: 'Listado de usuarios del sistema recuperado exitosamente.',
        data: usuarios,
      });
    } catch (error) {
      next(error);
    }
  },

  // Obtengo una cuenta específica a partir de su ID para consultar su ficha técnica
  obtenerPorId: async (req, res, next) => {
    try {
      const { id } = req.params;

      const usuario = await Usuario.findByPk(id, {
        attributes: ['id', 'nombre', 'email', 'rol', 'activo', 'createdAt', 'updatedAt'],
      });

      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: `No encontré ningún usuario con el ID ${id}.`,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Ficha de usuario recuperada correctamente.',
        data: usuario,
      });
    } catch (error) {
      next(error);
    }
  },

  // Creo una nueva cuenta administrativa (Administrador o Coordinador)
  crear: async (req, res, next) => {
    try {
      const { nombre, email, password, rol } = req.body;

      if (!nombre || !email || !password || !rol) {
        return res.status(400).json({
          success: false,
          message: 'Los campos nombre, email, password y rol son obligatorios.',
        });
      }

      const existeEmail = await Usuario.findOne({
        where: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('email')),
          email.trim().toLowerCase()
        ),
      });

      if (existeEmail) {
        return res.status(409).json({
          success: false,
          message: `El correo '${email.trim().toLowerCase()}' ya se encuentra registrado para otra cuenta.`,
        });
      }

      const nuevoUsuario = await Usuario.create({
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        password,
        rol: rol.toUpperCase(),
        activo: true,
      });

      return res.status(201).json({
        success: true,
        message: `Cuenta de ${nuevoUsuario.rol} creada con éxito para ${nuevoUsuario.nombre}.`,
        data: {
          id: nuevoUsuario.id,
          nombre: nuevoUsuario.nombre,
          email: nuevoUsuario.email,
          rol: nuevoUsuario.rol,
          activo: nuevoUsuario.activo,
          createdAt: nuevoUsuario.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Actualizo la información de una cuenta existente (nombre, email, rol y opcionalmente password)
  actualizar: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { nombre, email, password, rol, activo } = req.body;

      const usuario = await Usuario.findByPk(id);

      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: `No encontré ningún usuario con el ID ${id} para actualizar.`,
        });
      }

      // Verifico que el nuevo correo no esté registrado por otra cuenta distinta
      if (email && email.trim().toLowerCase() !== usuario.email.toLowerCase()) {
        const emailDuplicado = await Usuario.findOne({
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
            message: `El correo electrónico '${email.trim().toLowerCase()}' ya está registrado por otra cuenta.`,
          });
        }
      }

      // Protección: Evito que el administrador activo degrade su propio rol mientras está conectado
      if (Number(id) === req.usuario.id && rol && rol.toUpperCase() !== 'ADMIN') {
        return res.status(400).json({
          success: false,
          message: 'Por seguridad, no puedes degradar tu propio rol de administrador en tu sesión activa.',
        });
      }

      // Aplico los cambios a los campos recibidos
      const datosActualizados = {
        ...(nombre && { nombre: nombre.trim() }),
        ...(email && { email: email.trim().toLowerCase() }),
        ...(rol && ['ADMIN', 'COORDINADOR'].includes(rol.toUpperCase()) && { rol: rol.toUpperCase() }),
        ...(activo !== undefined && { activo: Boolean(activo) }),
      };

      // Si se envía una nueva contraseña, la asigno (el hook beforeUpdate de Sequelize la hashea)
      if (password && password.trim().length >= 6) {
        datosActualizados.password = password.trim();
      }

      await usuario.update(datosActualizados);

      return res.status(200).json({
        success: true,
        message: `Cuenta de '${usuario.nombre}' actualizada correctamente.`,
        data: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
          activo: usuario.activo,
          updatedAt: usuario.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Alterno el estado activo/suspendido de una cuenta de usuario
  cambiarEstado: async (req, res, next) => {
    try {
      const { id } = req.params;

      if (Number(id) === req.usuario.id) {
        return res.status(400).json({
          success: false,
          message: 'Por seguridad, no puedes desactivar tu propia cuenta activa de administrador.',
        });
      }

      const usuario = await Usuario.findByPk(id);

      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: `No encontré ningún usuario con el ID ${id}.`,
        });
      }

      await usuario.update({ activo: !usuario.activo });

      return res.status(200).json({
        success: true,
        message: `La cuenta de '${usuario.nombre}' ahora se encuentra ${usuario.activo ? 'ACTIVA' : 'SUSPENDIDA'}.`,
        data: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
          activo: usuario.activo,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

// Exporto mi controlador de usuarios
module.exports = usuarioController;
