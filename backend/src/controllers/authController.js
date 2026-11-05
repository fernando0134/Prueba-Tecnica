// Importo jsonwebtoken, el modelo Usuario y variables de entorno
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'super_clave_secreta_academica_docentes_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Función auxiliar con la que genero el token JWT
const generarToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Implemento el controlador de autenticación y control de acceso
const authController = {
  // Registro un nuevo usuario administrativo en el sistema
  registro: async (req, res, next) => {
    try {
      const { nombre, email, password, rol } = req.body;

      // Valido de forma estricta evitando coerción implícita truthy/falsy
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (
        typeof nombre !== 'string' || nombre.trim().length === 0 ||
        typeof email !== 'string' || email.trim().length === 0 || !emailRegex.test(email.trim()) ||
        typeof password !== 'string' || password.trim().length < 6
      ) {
        return res.status(400).json({
          success: false,
          message: 'Datos inválidos: nombre, email válido y password (mínimo 6 caracteres) son estrictamente obligatorios.',
        });
      }

      // Verifico que el email no esté ya registrado
      const usuarioExistente = await Usuario.findOne({
        where: { email: email.trim().toLowerCase() },
      });

      if (usuarioExistente) {
        return res.status(409).json({
          success: false,
          message: `El correo electrónico '${email}' ya se encuentra registrado.`,
        });
      }

      // Creo el nuevo usuario (la contraseña se hashea en el hook beforeCreate)
      const rolDefinido = typeof rol === 'string' && ['ADMIN', 'COORDINADOR'].includes(rol.trim().toUpperCase())
        ? rol.trim().toUpperCase()
        : 'COORDINADOR';

      const nuevoUsuario = await Usuario.create({
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        rol: rolDefinido,
      });

      // Genero el token JWT
      const token = generarToken(nuevoUsuario);

      return res.status(201).json({
        success: true,
        message: 'Usuario administrativo registrado exitosamente.',
        token,
        usuario: {
          id: nuevoUsuario.id,
          nombre: nuevoUsuario.nombre,
          email: nuevoUsuario.email,
          rol: nuevoUsuario.rol,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Inicio de sesión para administradores y coordinadores
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      // Valido con comprobación estricta de tipos en lugar de evaluar verdad/falsedad difusa (truthy/falsy)
      if (
        typeof email !== 'string' || email.trim().length === 0 ||
        typeof password !== 'string' || password.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: 'Debes proporcionar tu correo electrónico y tu contraseña.',
        });
      }

      // Busco al usuario por su correo
      const usuario = await Usuario.findOne({
        where: { email: email.trim().toLowerCase() },
      });

      if (!usuario) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas. Correo o contraseña incorrectos.',
        });
      }

      // Verifico estrictamente si el usuario se encuentra activo (evito coerción truthy/falsy)
      if (usuario.activo !== true) {
        return res.status(403).json({
          success: false,
          message: 'Tu cuenta administrativa se encuentra suspendida o inactiva.',
        });
      }

      // Comparo la contraseña ingresada con el hash almacenado
      const passwordValida = await usuario.compararPassword(password);
      if (!passwordValida) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas. Correo o contraseña incorrectos.',
        });
      }

      // Genero el token JWT
      const token = generarToken(usuario);

      return res.status(200).json({
        success: true,
        message: `¡Bienvenido de vuelta, ${usuario.nombre}!`,
        token,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Obtengo el perfil del usuario autenticado actualmente
  obtenerPerfil: async (req, res) => {
    return res.status(200).json({
      success: true,
      usuario: req.usuario,
    });
  },
};

// Exporto mi controlador de autenticación
module.exports = authController;
