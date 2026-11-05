// Importo mi cliente base de peticiones API
import { apiClient } from './api';

// Defino el servicio para gestionar todas las operaciones de asignaturas (materias)
export const asignaturaService = {
  // Consulto el listado completo de asignaturas disponibles
  async obtenerTodas() {
    const response = await apiClient.get('/asignaturas');
    return response.data || [];
  },

  // Consulto una asignatura por su identificador único
  async obtenerPorId(id) {
    const response = await apiClient.get(`/asignaturas/${id}`);
    return response.data;
  },

  // Envío los datos para crear una nueva asignatura en el sistema
  async crear(asignaturaData) {
    const response = await apiClient.post('/asignaturas', asignaturaData);
    return response.data;
  },

  // Envío los datos modificados para actualizar una asignatura existente
  async actualizar(id, asignaturaData) {
    const response = await apiClient.put(`/asignaturas/${id}`, asignaturaData);
    return response.data;
  },

  // Solicito la eliminación de una asignatura verificando que no tenga docentes
  async eliminar(id) {
    const response = await apiClient.delete(`/asignaturas/${id}`);
    return response;
  },
};
