// Importo mi cliente base de peticiones API
import { apiClient } from './api';

// Defino el servicio para gestionar todas las operaciones de docentes y sus asignaciones
export const docenteService = {
  // Consulto la lista completa de docentes con la información de su asignatura
  async obtenerTodos() {
    const response = await apiClient.get('/docentes');
    return response.data || [];
  },

  // Obtengo un docente específico por su identificador
  async obtenerPorId(id) {
    const response = await apiClient.get(`/docentes/${id}`);
    return response.data;
  },

  // Registro un nuevo docente asociándole obligatoriamente una asignatura
  async crear(docenteData) {
    const response = await apiClient.post('/docentes', docenteData);
    return response.data;
  },

  // Actualizo la información del docente y/o modifico su asignatura asignada
  async actualizar(id, docenteData) {
    const response = await apiClient.put(`/docentes/${id}`, docenteData);
    return response.data;
  },

  // Elimino un docente de la base de datos
  async eliminar(id) {
    const response = await apiClient.delete(`/docentes/${id}`);
    return response;
  },
};
