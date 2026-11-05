// Importo el modelo Usuario para la gestión de cuentas institucionales
const { Usuario } = require('../models');

// Implemento el controlador para la gobernanza y gestión de cuentas (exclusivo para rol ADMIN)
const usuarioController = {
  // Obtengo el listado completo de cuentas del sistema
  obtenerTodos: async (req, res, next) => {
    try {
      const usuarios = await Usuario.findAll({
        attributes: ['id', 'nombre', 'email', 'rol', 'activo', 'createdAt'],
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

  // Creo una nueva cuenta de personal (Coordinador o Administrador)
  crear: async (req, res, next) => {
    try {
      const { nombre, email, password, rol } = req.body;

      if (!nombre || !email || !password || !rol) {
        return res.status(400).json({
          success: false,
          message: 'Los campos nombre, email, password y rol son obligatorios.',
        });
      }

      // Compruebo que el correo no esté registrado
      const existeEmail = await Usuario.findOne({
        where: { email: email.trim().toLowerCase() },
      });

      if (existeEmail) {
        return res.status(409).json({
          success: false,
          message: `El correo '${email.trim().toLowerCase()}' ya se encuentra registrado para otra cuenta.`,
        });
      }

      // Creo la nueva cuenta administrativa
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

  // Alterno el estado activo/suspendido de una cuenta de usuario
  cambiarEstado: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Evito que el administrador desactive su propia cuenta
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

      // Invierto el estado activo
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
