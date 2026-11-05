// Importo el servicio de autenticación para inyectar el token JWT
import { authService } from './authService';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Función centralizada para emitir solicitudes HTTP con cabecera de autenticación
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;

  // Inyecto dinámicamente el token Bearer si existe una sesión activa
  const token = authService.obtenerToken();
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const headers = {
    'Content-Type': 'application/json',
    ...authHeader,
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    // Si recibo un 401 Unauthorized, cierro la sesión automáticamente
    if (response.status === 401 && !endpoint.includes('/auth/login')) {
      authService.logout();
      window.location.href = '/login';
    }

    if (!response.ok) {
      const error = new Error(data.message || 'Ocurrió un error en la solicitud.');
      error.status = response.status;
      error.errors = data.errors || [];
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`❌ [API Error en ${options.method || 'GET'} ${url}]:`, error);
    throw error;
  }
}

// Exporto mi cliente API
export const apiClient = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};
