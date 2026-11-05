// Configuro la URL base de mi API (utilizo /api gracias al proxy de Vite o el puerto directo)
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Creo una función genérica para enviar peticiones HTTP y procesar las respuestas de forma unificada
async function request(endpoint, options = {}) {
  // Construyo la URL completa de la petición
  const url = `${BASE_URL}${endpoint}`;

  // Defino las cabeceras predeterminadas con soporte para JSON
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    // Realizo la llamada de red mediante fetch
    const response = await fetch(url, config);

    // Intento parsear la respuesta como JSON
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    // Si la respuesta no es exitosa (códigos 4xx, 5xx), lanzo un error estructurado
    if (!response.ok) {
      const error = new Error(data.message || 'Ocurrió un error en la solicitud.');
      error.status = response.status;
      error.errors = data.errors || [];
      throw error;
    }

    // Retorno la carga de datos procesada
    return data;
  } catch (error) {
    // Registro el error en la consola para depuración
    console.error(`❌ [API Service Error en ${options.method || 'GET'} ${url}]:`, error);
    throw error;
  }
}

// Exporto mi cliente API con métodos helper para GET, POST, PUT y DELETE
export const apiClient = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};
