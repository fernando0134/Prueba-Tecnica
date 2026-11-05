<script setup>
// Importo utilidades reactivas y ciclo de vida desde Vue
import { ref, computed, onMounted } from 'vue';

// Importo el servicio de asignaturas
import { asignaturaService } from '../services/asignaturaService';

// Importo componentes modulares
import AsignaturaModal from '../components/AsignaturaModal.vue';
import ToastNotification from '../components/ToastNotification.vue';

// Defino el estado reactivo principal
const asignaturas = ref([]);
const cargando = ref(true);
const filtroBusqueda = ref('');

// Estado para el modal de creación de asignaturas
const modalVisible = ref(false);
const guardandoAsignatura = ref(false);

// Estado de la notificación Toast
const toast = ref({
  visible: false,
  mensaje: '',
  tipo: 'success',
});

// Cargo las asignaturas al iniciar la vista
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

// Filtro las asignaturas por código, nombre o descripción
const asignaturasFiltradas = computed(() => {
  const query = filtroBusqueda.value.toLowerCase().trim();
  if (!query) return asignaturas.value;

  return asignaturas.value.filter((asig) => {
    const texto = `${asig.nombre} ${asig.codigo} ${asig.descripcion || ''}`.toLowerCase();
    return texto.includes(query);
  });
});

// Abro el modal para crear una nueva materia
function abrirModalCrear() {
  modalVisible.value = true;
}

// Proceso la creación de una nueva asignatura
async function registrarAsignatura(nuevaAsignaturaData) {
  guardandoAsignatura.value = true;
  try {
    const creada = await asignaturaService.crear(nuevaAsignaturaData);
    asignaturas.value.push(creada);
    mostrarToast(`Asignatura '${creada.nombre}' creada con éxito.`, 'success');
    modalVisible.value = false;
  } catch (error) {
    mostrarToast(error.message || 'No se pudo crear la asignatura.', 'error');
  } finally {
    guardandoAsignatura.value = false;
  }
}

// Muestro una notificación flotante
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
    <!-- Encabezado de la sección de asignaturas -->
    <div class="view-header">
      <div>
        <h2 class="view-title">Catálogo de Asignaturas (Materias)</h2>
        <p class="view-description">
          Consulta las materias disponibles en el plan de estudios institucional y registra nuevas asignaturas para asignación docente.
        </p>
      </div>

      <button class="btn btn-primary" @click="abrirModalCrear">
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        <span>Crear Nueva Asignatura</span>
      </button>
    </div>

    <!-- Barra de búsqueda rápida -->
    <div class="search-bar card">
      <div class="search-input-wrapper">
        <svg class="search-icon" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input 
          v-model="filtroBusqueda" 
          type="text" 
          class="form-input search-input" 
          placeholder="Filtrar asignaturas por nombre, código académico o contenido temático..."
        />
      </div>
    </div>

    <!-- Spinner de carga -->
    <div v-if="cargando" class="loading-state card">
      <div class="spinner"></div>
      <p>Cargando materias del plan de estudios...</p>
    </div>

    <!-- Estado vacío -->
    <div v-else-if="asignaturasFiltradas.length === 0" class="empty-state card">
      <h3>No se encontraron asignaturas</h3>
      <p>No existen materias que coincidan con la búsqueda introducida.</p>
    </div>

    <!-- Cuadrícula de tarjetas de asignaturas -->
    <div v-else class="asignaturas-grid">
      <div v-for="asig in asignaturasFiltradas" :key="asig.id" class="asignatura-card card">
        <div class="asig-card-header">
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <span class="badge badge-primary code-badge">{{ asig.codigo }}</span>
            <span class="badge" :class="asig.activo ? 'badge-success' : 'badge-warning'">
              {{ asig.activo ? 'Activa' : 'Inactiva' }}
            </span>
          </div>
          <span class="badge badge-secondary" style="border: 1px solid var(--border-color);">{{ asig.creditos }} Créditos</span>
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

        <!-- Lista de docentes que imparten la materia -->
        <div class="asig-docentes-section">
          <div class="section-label">Docentes Impartiendo:</div>
          <div v-if="asig.docentes && asig.docentes.length > 0" class="docentes-tags">
            <span v-for="doc in asig.docentes" :key="doc.id" class="docente-tag">
              👨‍🏫 {{ doc.nombre }} {{ doc.apellidos }}
            </span>
          </div>
          <div v-else class="no-docentes-text">
            <span>Aún no hay docentes asignados a esta materia.</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para crear nueva asignatura -->
    <AsignaturaModal 
      :visible="modalVisible"
      :cargando="guardandoAsignatura"
      @cerrar="modalVisible = false"
      @guardar="registrarAsignatura"
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
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
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

/* Grid de materias */
.asignaturas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
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

.asig-docentes-section {
  border-top: 1px dashed var(--border-color);
  padding-top: 0.875rem;
}

.section-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.docentes-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.docente-tag {
  background-color: #f1f5f9;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
}

.no-docentes-text {
  font-size: 0.775rem;
  color: var(--text-muted);
  font-style: italic;
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
