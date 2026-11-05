<script setup>
// Importo utilidades reactivas y ciclo de vida desde Vue
import { ref, onMounted } from 'vue';
import { apiClient } from '../services/api';
import { authService } from '../services/authService';

import UsuarioModal from '../components/UsuarioModal.vue';
import ToastNotification from '../components/ToastNotification.vue';

// Estado reactivo de los usuarios
const usuarios = ref([]);
const cargando = ref(true);
const modalCrearVisible = ref(false);
const guardandoUsuario = ref(false);

const toast = ref({
  visible: false,
  mensaje: '',
  tipo: 'success',
});

// Cargo los usuarios al montar el componente
onMounted(async () => {
  await cargarUsuarios();
});

// Consulto las cuentas registradas en el backend
async function cargarUsuarios() {
  cargando.value = true;
  try {
    const response = await apiClient.get('/usuarios');
    usuarios.value = response.data || [];
  } catch (error) {
    mostrarToast(error.message || 'Error al recuperar usuarios del sistema.', 'error');
  } finally {
    cargando.value = false;
  }
}

// Proceso la creación de una nueva cuenta administrativa
async function crearCuenta(datosUsuario) {
  guardandoUsuario.value = true;
  try {
    const res = await apiClient.post('/usuarios', datosUsuario);
    usuarios.value.push(res.data);
    mostrarToast(res.message || 'Usuario creado exitosamente.', 'success');
    modalCrearVisible.value = false;
  } catch (error) {
    mostrarToast(error.message || 'No se pudo crear la cuenta.', 'error');
  } finally {
    guardandoUsuario.value = false;
  }
}

// Cambio el estado activo/suspendido de un usuario
async function alternarEstado(user) {
  if (user.id === authService.usuario.value?.id) {
    mostrarToast('No puedes suspender tu propia cuenta activa de administrador.', 'error');
    return;
  }

  try {
    const res = await apiClient.patch(`/usuarios/${user.id}/estado`);
    user.activo = !user.activo;
    mostrarToast(res.message, 'success');
  } catch (error) {
    mostrarToast(error.message || 'Error al cambiar el estado de la cuenta.', 'error');
  }
}

function formatearFecha(fechaIso) {
  if (!fechaIso) return 'N/A';
  return new Date(fechaIso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function mostrarToast(mensaje, tipo = 'success') {
  toast.value = {
    visible: true,
    mensaje,
    tipo,
  };
  setTimeout(() => {
    toast.value.visible = false;
  }, 4500);
}
</script>

<template>
  <div class="usuarios-view">
    <!-- Encabezado exclusivo para Administrador -->
    <div class="view-header">
      <div>
        <div class="badge-role-header">
          <span class="badge badge-primary">👑 Módulo Exclusivo Directivo</span>
        </div>
        <h2 class="view-title">Control de Cuentas y Gobernanza del Sistema</h2>
        <p class="view-description">
          Administra el personal con acceso a la plataforma, da de alta coordinadores y controla el estado de las cuentas.
        </p>
      </div>

      <button class="btn btn-primary" @click="modalCrearVisible = true">
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        <span>Registrar Personal</span>
      </button>
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
            <th style="text-align: right;">Acciones</th>
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
              <span class="badge" :class="user.activo ? 'badge-success' : 'badge-danger'">
                {{ user.activo ? '● Activa' : '○ Suspendida' }}
              </span>
            </td>
            <td>
              <span class="date-text">{{ formatearFecha(user.createdAt) }}</span>
            </td>
            <td style="text-align: right;">
              <button 
                class="btn btn-secondary btn-sm"
                :class="{ 'btn-outline-danger': user.activo }"
                :disabled="user.id === authService.usuario.value?.id"
                :title="user.id === authService.usuario.value?.id ? 'No puedes suspender tu propia cuenta' : 'Cambiar estado de acceso'"
                @click="alternarEstado(user)"
              >
                {{ user.activo ? 'Suspender Acceso' : 'Reactivar Cuenta' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Guía de Jerarquías -->
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

    <!-- Modal para Registrar Nuevo Usuario -->
    <UsuarioModal 
      :visible="modalCrearVisible"
      :cargando="guardandoUsuario"
      @cerrar="modalCrearVisible = false"
      @guardar="crearCuenta"
    />

    <!-- Toast Notification -->
    <ToastNotification 
      :visible="toast.visible"
      :mensaje="toast.mensaje"
      :tipo="toast.tipo"
      @cerrar="toast.visible = false"
    />
  </div>
</template>

<style scoped>
.badge-role-header {
  margin-bottom: 0.5rem;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
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

.btn-sm {
  padding: 0.35rem 0.65rem;
  font-size: 0.75rem;
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
