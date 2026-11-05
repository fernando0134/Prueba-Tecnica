// Importo jsonwebtoken para validar tokens y el modelo Usuario
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

// Obtengo la clave secreta desde las variables de entorno
const JWT_SECRET = process.env.JWT_SECRET || 'super_clave_secreta_academica_docentes_2026';

// Middleware con el que verifico la autenticidad del token JWT
const verificarToken = async (req, res, next) => {
  try {
    // Extraigo la cabecera Authorization de la solicitud
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Acceso no autorizado. Debes proporcionar un token Bearer válido en la cabecera Authorization.',
      });
    }

    // Obtengo la cadena del token
    const token = authHeader.split(' ')[1];

    // Decodifico y verifico la firma del token
    const decodificado = jwt.verify(token, JWT_SECRET);

    // Busco al usuario en la base de datos para confirmar que sigue activo
    const usuario = await Usuario.findByPk(decodificado.id, {
      attributes: ['id', 'nombre', 'email', 'rol', 'activo'],
    });

    if (!usuario || !usuario.activo) {
      return res.status(401).json({
        success: false,
        message: 'El usuario asociado a este token no existe o ha sido desactivado.',
      });
    }

    // Adjunto el usuario autenticado a la solicitud (req.usuario)
    req.usuario = usuario;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Token de autenticación inválido o corrupto.',
    });
  }
};

// Middleware para restringir acceso según el rol del usuario (ADMIN, COORDINADOR)
const verificarRol = (rolesPermitidos = []) => {
  return (req, res, next) => {
    // Si no hay usuario cargado en la petición, retorno no autorizado
    if (!req.usuario) {
      return res.status(401).json({
        success: false,
        message: 'No te encuentras autenticado en el sistema.',
      });
    }

    // Verifico si el rol del usuario está dentro de la lista de roles permitidos
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado. Se requiere uno de los siguientes roles: [${rolesPermitidos.join(', ')}]. Tu rol actual es '${req.usuario.rol}'.`,
      });
    }

    next();
  };
};

// Exporto mis middlewares de seguridad
module.exports = {
  verificarToken,
  verificarRol,
};
