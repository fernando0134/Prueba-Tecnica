<script setup>
// Importo utilidades reactivas y ciclo de vida desde Vue
import { ref, onMounted } from 'vue';
import { apiClient } from '../services/api';

// Estado reactivo de los usuarios del sistema
const usuarios = ref([]);
const cargando = ref(true);
const errorMensaje = ref('');

// Cargo la lista de cuentas administrativas al montar la vista
onMounted(async () => {
  await cargarUsuarios();
});

// Consulto las cuentas registradas en el backend
async function cargarUsuarios() {
  cargando.value = true;
  errorMensaje.value = '';
  try {
    const response = await apiClient.get('/usuarios');
    usuarios.value = response.data || [];
  } catch (error) {
    errorMensaje.value = error.message || 'Error al recuperar usuarios del sistema.';
  } finally {
    cargando.value = false;
  }
}

// Formateo fechas para visualización clara
function formatearFecha(fechaIso) {
  if (!fechaIso) return 'N/A';
  return new Date(fechaIso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
</script>

<template>
  <div class="usuarios-view">
    <!-- Encabezado de la vista exclusiva para Administrador -->
    <div class="view-header">
      <div>
        <div class="badge-role-header">
          <span class="badge badge-primary">👑 Módulo Exclusivo Directivo</span>
        </div>
        <h2 class="view-title">Control de Cuentas y Gobernanza del Sistema</h2>
        <p class="view-description">
          Administra el personal con acceso a la plataforma, sus niveles de autorización y roles institucionales.
        </p>
      </div>
    </div>

    <!-- Error state -->
    <div v-if="errorMensaje" class="login-alert">
      {{ errorMensaje }}
    </div>

    <!-- Loading -->
    <div v-if="cargando" class="loading-state card">
      <div class="spinner"></div>
      <p>Cargando lista de personal administrativo...</p>
    </div>

    <!-- Tabla de Cuentas -->
    <div v-else class="table-responsive">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Usuario / Nombre</th>
            <th>Correo Electrónico</th>
            <th>Nivel de Acceso (Rol)</th>
            <th>Estado</th>
            <th>Fecha de Alta</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in usuarios" :key="user.id">
            <td>
              <div class="user-row">
                <div class="user-avatar" :class="user.rol === 'ADMIN' ? 'avatar-admin' : 'avatar-coord'">
                  {{ user.nombre.charAt(0) }}
                </div>
                <div>
                  <div class="user-name">{{ user.nombre }}</div>
                  <div class="user-id">ID de Cuenta: #{{ user.id }}</div>
                </div>
              </div>
            </td>
            <td>
              <span class="user-email">{{ user.email }}</span>
            </td>
            <td>
              <span 
                class="badge" 
                :class="user.rol === 'ADMIN' ? 'badge-primary' : 'badge-warning'"
              >
                {{ user.rol === 'ADMIN' ? '👑 ADMINISTRADOR' : '📋 COORDINADOR' }}
              </span>
            </td>
            <td>
              <span class="badge badge-success">
                ● Cuenta Activa
              </span>
            </td>
            <td>
              <span class="date-text">{{ formatearFecha(user.createdAt) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Guía de Jerarquías y Permisos -->
    <div class="roles-guide-card card">
      <h3 class="guide-title">Matriz de Roles y Niveles de Privilegio</h3>
      <div class="roles-grid">
        <div class="role-box">
          <div class="role-badge-title">
            <span class="badge badge-primary">ADMINISTRADOR (Nivel Directivo)</span>
          </div>
          <ul class="role-permissions">
            <li>✅ Gobernanza total y gestión de cuentas del sistema.</li>
            <li>✅ <strong>Eliminación física</strong> de docentes y asignaturas.</li>
            <li>✅ Activar o desactivar asignaturas del plan de estudios.</li>
            <li>✅ Acceso a reportes globales y auditorías.</li>
          </ul>
        </div>

        <div class="role-box">
          <div class="role-badge-title">
            <span class="badge badge-warning">COORDINADOR (Nivel Académico)</span>
          </div>
          <ul class="role-permissions">
            <li>✅ Gestión operativa de la plantilla docente.</li>
            <li>✅ <strong>Asignar y reasignar materias activas</strong> a profesores.</li>
            <li>✅ Registrar nuevos docentes en el sistema.</li>
            <li>✅ Exportación de nóminas a Excel e impresión de fichas oficiales.</li>
            <li>❌ <strong>Sin permisos destructivos</strong> (no puede eliminar docentes ni materias).</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.badge-role-header {
  margin-bottom: 0.5rem;
}

.view-header {
  margin-bottom: 1.5rem;
}

.view-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
}

.view-description {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.user-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.85rem;
}

.avatar-admin {
  background: linear-gradient(135deg, #2563eb, #1e40af);
}

.avatar-coord {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.user-name {
  font-weight: 700;
  color: var(--text-primary);
}

.user-id {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.user-email {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.date-text {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.roles-guide-card {
  margin-top: 2rem;
  background-color: #ffffff;
  padding: 1.75rem;
}

.guide-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 1.25rem;
}

.roles-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.role-box {
  background-color: #f8fafc;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1.25rem;
}

.role-badge-title {
  margin-bottom: 0.875rem;
}

.role-permissions {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .roles-grid {
    grid-template-columns: 1fr;
  }
}
</style>
