<script setup>
// Importo utilidades reactivas y ciclo de vida desde Vue
import { ref, computed, onMounted } from 'vue';

// Importo los servicios de asignaturas y de autenticación
import { asignaturaService } from '../services/asignaturaService';
import { authService } from '../services/authService';

// Importo componentes modulares
import AsignaturaModal from '../components/AsignaturaModal.vue';
import AsignaturaDetalleModal from '../components/AsignaturaDetalleModal.vue';
import ConfirmModal from '../components/ConfirmModal.vue';
import ToastNotification from '../components/ToastNotification.vue';

// Estado reactivo principal
const asignaturas = ref([]);
const cargando = ref(true);
const filtroBusqueda = ref('');
const filtroEstado = ref('todos'); // 'todos', 'activas', 'inactivas'

// Modales
const modalFormVisible = ref(false);
const modoEdicion = ref(false);
const asignaturaSeleccionada = ref(null);
const guardandoAsignatura = ref(false);

const modalDetalleVisible = ref(false);
const asignaturaDetalle = ref(null);

const modalConfirmVisible = ref(false);
const asignaturaAEliminar = ref(null);
const eliminandoAsignatura = ref(false);

// Notificaciones Toast
const toast = ref({
  visible: false,
  mensaje: '',
  tipo: 'success',
});

// Cargo las asignaturas al montar la vista
onMounted(async () => {
  await cargarAsignaturas();
});

// Consulto las asignaturas registradas desde el backend
async function cargarAsignaturas() {
  cargando.value = true;
  try {
    const data = await asignaturaService.obtenerTodas();
    asignaturas.value = data;
  } catch (error) {
    mostrarToast(error.message || 'Error al cargar el catálogo de asignaturas.', 'error');
  } finally {
    cargando.value = false;
  }
}

// Filtro las asignaturas por búsqueda y estado activo/inactivo
const asignaturasFiltradas = computed(() => {
  return asignaturas.value.filter((asig) => {
    const query = filtroBusqueda.value.toLowerCase().trim();
    const texto = `${asig.nombre} ${asig.codigo} ${asig.descripcion || ''}`.toLowerCase();
    const coincideTexto = !query || texto.includes(query);

    const coincideEstado = 
      filtroEstado.value === 'todos' ||
      (filtroEstado.value === 'activas' && asig.activo) ||
      (filtroEstado.value === 'inactivas' && !asig.activo);

    return coincideTexto && coincideEstado;
  });
});

// Abro el modal para crear una nueva materia
function abrirModalCrear() {
  modoEdicion.value = false;
  asignaturaSeleccionada.value = null;
  modalFormVisible.value = true;
}

// Abro el modal para editar una materia existente
function abrirModalEditar(asig) {
  modoEdicion.value = true;
  asignaturaSeleccionada.value = { ...asig };
  modalFormVisible.value = true;
}

// Abro el modal para consultar el detalle completo de la materia y sus docentes
function consultarDetalle(asig) {
  asignaturaDetalle.value = asig;
  modalDetalleVisible.value = true;
}

// Proceso el guardado (creación o actualización)
async function guardarAsignatura(datosFormulario) {
  guardandoAsignatura.value = true;
  try {
    if (modoEdicion.value && asignaturaSeleccionada.value) {
      const actualizada = await asignaturaService.actualizar(asignaturaSeleccionada.value.id, datosFormulario);
      const index = asignaturas.value.findIndex((a) => a.id === asignaturaSeleccionada.value.id);
      if (index !== -1) {
        asignaturas.value[index] = { ...asignaturas.value[index], ...actualizada };
      }
      mostrarToast(`Asignatura '${actualizada.nombre}' actualizada exitosamente.`, 'success');
    } else {
      const creada = await asignaturaService.crear(datosFormulario);
      asignaturas.value.unshift(creada);
      mostrarToast(`Asignatura '${creada.nombre}' creada con éxito en el plan de estudios.`, 'success');
    }

    modalFormVisible.value = false;
  } catch (error) {
    mostrarToast(error.message || 'No se pudo guardar la información de la materia.', 'error');
  } finally {
    guardandoAsignatura.value = false;
  }
}

// Solicito confirmación para eliminar (sólo disponible para ADMIN)
function solicitarEliminarAsignatura(asig) {
  if (!authService.esAdmin.value) {
    mostrarToast('Acceso denegado: Sólo el rol ADMIN tiene permisos para eliminar materias.', 'error');
    return;
  }

  asignaturaAEliminar.value = asig;
  modalConfirmVisible.value = true;
}

// Confirmo la eliminación física de la asignatura
async function confirmarEliminacion() {
  if (!asignaturaAEliminar.value) return;

  eliminandoAsignatura.value = true;
  try {
    await asignaturaService.eliminar(asignaturaAEliminar.value.id);
    asignaturas.value = asignaturas.value.filter((a) => a.id !== asignaturaAEliminar.value.id);
    mostrarToast(`Asignatura '${asignaturaAEliminar.value.nombre}' eliminada correctamente.`, 'success');
    modalConfirmVisible.value = false;
  } catch (error) {
    mostrarToast(error.message || 'No fue posible eliminar la asignatura.', 'error');
  } finally {
    eliminandoAsignatura.value = false;
    asignaturaAEliminar.value = null;
  }
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
  <div class="asignaturas-view">
    <!-- Encabezado de la vista -->
    <div class="view-header">
      <div>
        <h2 class="view-title">Gestión y Catálogo de Asignaturas (Materias)</h2>
        <p class="view-description">
          Consulta, crea, actualiza y gestiona las materias del plan de estudios institucional.
        </p>
      </div>

      <button class="btn btn-primary" @click="abrirModalCrear">
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        <span>Crear Nueva Asignatura</span>
      </button>
    </div>

    <!-- Filtros de búsqueda y estado -->
    <div class="search-bar card">
      <div class="search-input-wrapper">
        <svg class="search-icon" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input 
          v-model="filtroBusqueda" 
          type="text" 
          class="form-input search-input" 
          placeholder="Buscar asignatura por nombre, código único o temario..."
        />
      </div>

      <div class="status-filter-wrapper">
        <select v-model="filtroEstado" class="form-select filter-select">
          <option value="todos">Todos los estados</option>
          <option value="activas">Solo Materias Activas</option>
          <option value="inactivas">Solo Materias Inactivas</option>
        </select>
      </div>
    </div>

    <!-- Spinner de carga -->
    <div v-if="cargando" class="loading-state card">
      <div class="spinner"></div>
      <p>Cargando catálogo institucional de asignaturas...</p>
    </div>

    <!-- Estado vacío -->
    <div v-else-if="asignaturasFiltradas.length === 0" class="empty-state card">
      <h3>No se encontraron asignaturas</h3>
      <p>No existen materias que coincidan con los criterios de búsqueda.</p>
    </div>

    <!-- Cuadrícula de tarjetas de asignaturas con acciones completas -->
    <div v-else class="asignaturas-grid">
      <div v-for="asig in asignaturasFiltradas" :key="asig.id" class="asignatura-card card">
        <div class="asig-card-header">
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <span class="badge badge-primary code-badge">{{ asig.codigo }}</span>
            <span class="badge" :class="asig.activo ? 'badge-success' : 'badge-warning'">
              {{ asig.activo ? 'Activa' : 'Inactiva' }}
            </span>
          </div>
          <span class="badge badge-secondary" style="border: 1px solid var(--border-color);">
            {{ asig.creditos }} Créditos
          </span>
        </div>

        <h3 class="asig-title">{{ asig.nombre }}</h3>
        
        <p class="asig-desc">
          {{ asig.descripcion || 'Sin descripción temática detallada registrada.' }}
        </p>

        <div class="asig-meta">
          <div class="meta-item">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>{{ asig.horasSemanales }} horas / semana</span>
          </div>

          <div class="meta-item">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
            </svg>
            <span>
              {{ (asig.docentes && asig.docentes.length) || 0 }} docente(s) asignado(s)
            </span>
          </div>
        </div>

        <!-- Barra de Acciones: Consultar, Actualizar y Eliminar -->
        <div class="asig-actions-bar">
          <!-- Consultar Detalle -->
          <button 
            class="btn btn-secondary btn-sm" 
            title="Consultar ficha completa y docentes asignados"
            @click="consultarDetalle(asig)"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <span>Consultar</span>
          </button>

          <!-- Actualizar (Editar) -->
          <button 
            class="btn btn-secondary btn-sm" 
            title="Actualizar datos curriculares de la asignatura"
            @click="abrirModalEditar(asig)"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <span>Editar</span>
          </button>

          <!-- Eliminar (Exclusivo ADMIN) -->
          <button 
            v-if="authService.esAdmin.value"
            class="btn btn-outline-danger btn-sm" 
            title="Eliminar asignatura (Solo rol ADMIN)"
            @click="solicitarEliminarAsignatura(asig)"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            <span>Eliminar</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal para Crear / Editar Asignatura -->
    <AsignaturaModal 
      :visible="modalFormVisible"
      :modo-edicion="modoEdicion"
      :asignatura-inicial="asignaturaSeleccionada"
      :cargando="guardandoAsignatura"
      @cerrar="modalFormVisible = false"
      @guardar="guardarAsignatura"
    />

    <!-- Modal para Consultar Detalle de Asignatura -->
    <AsignaturaDetalleModal 
      :visible="modalDetalleVisible"
      :asignatura="asignaturaDetalle"
      @cerrar="modalDetalleVisible = false"
    />

    <!-- Modal para Confirmar Eliminación -->
    <ConfirmModal 
      :visible="modalConfirmVisible"
      titulo="¿Eliminar Asignatura del Plan de Estudios?"
      :mensaje="asignaturaAEliminar ? `¿Confirmas que deseas eliminar la asignatura '${asignaturaAEliminar.nombre}' (${asignaturaAEliminar.codigo})? Recuerda que no se podrá eliminar si tiene docentes impartiéndola.` : ''"
      :cargando="eliminandoAsignatura"
      @cancelar="modalConfirmVisible = false"
      @confirmar="confirmarEliminacion"
    />

    <!-- Notificación Toast -->
    <ToastNotification 
      :visible="toast.visible"
      :mensaje="toast.mensaje"
      :tipo="toast.tipo"
      @cerrar="toast.visible = false"
    />
  </div>
</template>

<style scoped>
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

.search-bar {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.search-input-wrapper {
  position: relative;
  flex: 2;
  min-width: 280px;
}

.status-filter-wrapper {
  flex: 1;
  min-width: 200px;
}

.search-icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.search-input {
  padding-left: 2.5rem;
}

.asignaturas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
  gap: 1.25rem;
}

.asignatura-card {
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.asignatura-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

.asig-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.875rem;
}

.code-badge {
  font-weight: 800;
  letter-spacing: 0.05em;
  font-size: 0.8rem;
}

.asig-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.asig-desc {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 1.25rem;
  flex: 1;
}

.asig-meta {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  background-color: #f8fafc;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  margin-bottom: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 600;
}

.asig-actions-bar {
  display: flex;
  gap: 0.5rem;
  padding-top: 0.875rem;
  border-top: 1px solid var(--border-color);
  justify-content: flex-end;
}

.btn-sm {
  padding: 0.4rem 0.75rem;
  font-size: 0.775rem;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 3.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
