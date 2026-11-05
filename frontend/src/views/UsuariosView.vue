<script setup>
// Importo utilidades reactivas y ciclo de vida desde Vue
import { ref, onMounted } from 'vue';
import { apiClient } from '../services/api';
import { authService } from '../services/authService';

// Importo componentes modulares
import UsuarioModal from '../components/UsuarioModal.vue';
import UsuarioDetalleModal from '../components/UsuarioDetalleModal.vue';
import ToastNotification from '../components/ToastNotification.vue';

// Estado reactivo de los usuarios
const usuarios = ref([]);
const cargando = ref(true);

// Modales
const modalFormVisible = ref(false);
const modoEdicion = ref(false);
const usuarioSeleccionado = ref(null);
const guardandoUsuario = ref(false);

const modalDetalleVisible = ref(false);
const usuarioDetalle = ref(null);

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

// Abro el modal para registrar una nueva cuenta
function abrirModalCrear() {
  modoEdicion.value = false;
  usuarioSeleccionado.value = null;
  modalFormVisible.value = true;
}

// Abro el modal para editar una cuenta existente
function abrirModalEditar(user) {
  modoEdicion.value = true;
  usuarioSeleccionado.value = { ...user };
  modalFormVisible.value = true;
}

// Abro el modal para consultar la ficha técnica y detalle de la cuenta
function consultarFicha(user) {
  usuarioDetalle.value = user;
  modalDetalleVisible.value = true;
}

// Proceso el guardado (creación o actualización)
async function guardarCuenta(datosUsuario) {
  guardandoUsuario.value = true;
  try {
    if (modoEdicion.value && usuarioSeleccionado.value) {
      // Actualizo la cuenta existente
      const res = await apiClient.put(`/usuarios/${usuarioSeleccionado.value.id}`, datosUsuario);
      const index = usuarios.value.findIndex((u) => u.id === usuarioSeleccionado.value.id);
      if (index !== -1) {
        usuarios.value[index] = { ...usuarios.value[index], ...res.data };
      }
      mostrarToast(res.message || 'Cuenta actualizada exitosamente.', 'success');
    } else {
      // Registro una nueva cuenta
      const res = await apiClient.post('/usuarios', datosUsuario);
      usuarios.value.push(res.data);
      mostrarToast(res.message || 'Cuenta de personal creada exitosamente.', 'success');
    }

    modalFormVisible.value = false;
  } catch (error) {
    mostrarToast(error.message || 'No se pudo procesar la cuenta.', 'error');
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
          Administra el personal con acceso a la plataforma, consulta fichas técnicas, edita privilegios y controla el estado de las cuentas.
        </p>
      </div>

      <button class="btn btn-primary" @click="abrirModalCrear">
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

    <!-- Tabla de Cuentas con acciones completas -->
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
              <div class="actions-group">
                <!-- Botón: Consultar Ficha Técnica -->
                <button 
                  class="btn-icon btn-icon-view" 
                  title="Consultar ficha de cuenta y permisos"
                  @click="consultarFicha(user)"
                >
                  <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <span>Ver Ficha</span>
                </button>

                <!-- Botón: Editar Cuenta -->
                <button 
                  class="btn-icon btn-icon-edit" 
                  title="Editar nombre, correo, rol o contraseña"
                  @click="abrirModalEditar(user)"
                >
                  <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  <span>Editar</span>
                </button>

                <!-- Botón: Suspender / Reactivar -->
                <button 
                  class="btn btn-secondary btn-sm"
                  :class="{ 'btn-outline-danger': user.activo }"
                  :disabled="user.id === authService.usuario.value?.id"
                  :title="user.id === authService.usuario.value?.id ? 'No puedes suspender tu propia cuenta' : 'Cambiar estado de acceso'"
                  @click="alternarEstado(user)"
                >
                  {{ user.activo ? 'Suspender' : 'Reactivar' }}
                </button>
              </div>
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
            <li>✅ Consultar fichas y editar cuentas de usuario.</li>
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

    <!-- Modal para Crear / Editar Usuario -->
    <UsuarioModal 
      :visible="modalFormVisible"
      :modo-edicion="modoEdicion"
      :usuario-inicial="usuarioSeleccionado"
      :cargando="guardandoUsuario"
      @cerrar="modalFormVisible = false"
      @guardar="guardarCuenta"
    />

    <!-- Modal para Consultar Ficha Técnica de Usuario -->
    <UsuarioDetalleModal 
      :visible="modalDetalleVisible"
      :usuario="usuarioDetalle"
      @cerrar="modalDetalleVisible = false"
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

.actions-group {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.65rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background-color: #ffffff;
  cursor: pointer;
  font-size: 0.775rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-icon-view {
  color: var(--text-secondary);
}

.btn-icon-view:hover {
  background-color: #f1f5f9;
  color: var(--text-primary);
}

.btn-icon-edit {
  color: var(--primary);
  border-color: #bfdbfe;
  background-color: var(--primary-light);
}

.btn-icon-edit:hover {
  background-color: #dbeafe;
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
