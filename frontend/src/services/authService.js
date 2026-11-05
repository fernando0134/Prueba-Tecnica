// Importo reactividad desde Vue
import { ref, computed } from 'vue';

// Claves de almacenamiento local para persistencia de sesión
const TOKEN_KEY = 'token_docentes_app';
const USER_KEY = 'usuario_docentes_app';

// Estado reactivo global del usuario autenticado
const token = ref(localStorage.getItem(TOKEN_KEY) || null);
const usuario = ref(
  localStorage.getItem(USER_KEY) ? JSON.parse(localStorage.getItem(USER_KEY)) : null
);

// Servicio de autenticación y control de roles
export const authService = {
  // Estado reactivo expuesto
  usuario: computed(() => usuario.value),
  estaAutenticado: computed(() => Boolean(token.value)),
  esAdmin: computed(() => usuario.value?.rol === 'ADMIN'),
  esCoordinador: computed(() => usuario.value?.rol === 'COORDINADOR'),

  // Obtengo el token JWT almacenado
  obtenerToken() {
    return token.value;
  },

  // Inicio sesión contra la API y guardo el token y perfil
  async login(email, password) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al iniciar sesión.');
    }

    // Persisto en memoria reactiva y en localStorage
    token.value = data.token;
    usuario.value = data.usuario;

    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.usuario));

    return data.usuario;
  },

  // Cierro la sesión y limpio el almacenamiento
  logout() {
    token.value = null;
    usuario.value = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
