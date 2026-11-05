// Importo el modelo Usuario para la administración de cuentas del sistema
const { Usuario } = require('../models');

// Implemento el controlador para la gestión de usuarios administrativos (exclusivo para rol ADMIN)
const usuarioController = {
  // Obtengo el listado de todos los usuarios y coordinadores del sistema
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
};

// Exporto mi controlador de usuarios
module.exports = usuarioController;
