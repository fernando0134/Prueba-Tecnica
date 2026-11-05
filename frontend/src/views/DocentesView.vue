<script setup>
// Importo utilidades reactivas y ciclo de vida desde Vue
import { ref, computed, onMounted } from 'vue';

// Importo los servicios para interactuar con la API del backend
import { docenteService } from '../services/docenteService';
import { asignaturaService } from '../services/asignaturaService';

// Importo mis componentes modulares
import StatsOverview from '../components/StatsOverview.vue';
import DocenteModal from '../components/DocenteModal.vue';
import ConfirmModal from '../components/ConfirmModal.vue';
import ToastNotification from '../components/ToastNotification.vue';

// Defino el estado reactivo principal de la vista
const docentes = ref([]);
const asignaturas = ref([]);
const cargando = ref(true);
const filtroBusqueda = ref('');
const filtroAsignatura = ref('');

// Estado para modales
const modalDocenteVisible = ref(false);
const modoEdicion = ref(false);
const docenteSeleccionado = ref(null);
const guardandoDocente = ref(false);

const modalConfirmVisible = ref(false);
const docenteAEliminar = ref(null);
const eliminandoDocente = ref(false);

// Estado para notificaciones Toast
const toast = ref({
  visible: false,
  mensaje: '',
  tipo: 'success',
});

// Cargo los datos al montar el componente en el DOM
onMounted(async () => {
  await cargarDatosIniciales();
});

// Función con la que obtengo los docentes y las asignaturas desde la API
async function cargarDatosIniciales() {
  cargando.value = true;
  try {
    // Consulto docentes y asignaturas en paralelo
    const [listaDocentes, listaAsignaturas] = await Promise.all([
      docenteService.obtenerTodos(),
      asignaturaService.obtenerTodas(),
    ]);

    docentes.value = listaDocentes;
    asignaturas.value = listaAsignaturas;
  } catch (error) {
    mostrarToast(error.message || 'Error al conectar con el servidor.', 'error');
  } finally {
    cargando.value = false;
  }
}

// Calculo el listado filtrado de docentes según los criterios de búsqueda
const docentesFiltrados = computed(() => {
  return docentes.value.filter((doc) => {
    const texto = `${doc.nombre} ${doc.apellidos} ${doc.email} ${doc.tituloAcademico}`.toLowerCase();
    const coincideTexto = texto.includes(filtroBusqueda.value.toLowerCase().trim());
    
    const coincideAsignatura = filtroAsignatura.value === '' 
      ? true 
      : doc.asignaturaId === Number(filtroAsignatura.value);

    return coincideTexto && coincideAsignatura;
  });
});

// Calculo el promedio de años de experiencia para las métricas del panel
const promedioExperiencia = computed(() => {
  if (docentes.value.length === 0) return 0;
  const suma = docentes.value.reduce((acc, doc) => acc + (doc.experienciaAnos || 0), 0);
  return Math.round((suma / docentes.value.length) * 10) / 10;
});

// Abro el modal para registrar un nuevo docente
function abrirModalCrear() {
  modoEdicion.value = false;
  docenteSeleccionado.value = null;
  modalDocenteVisible.value = true;
}

// Abro el modal en modo edición permitiendo actualizar datos o reasignar su asignatura
function abrirModalEditar(docente) {
  modoEdicion.value = true;
  docenteSeleccionado.value = { ...docente };
  modalDocenteVisible.value = true;
}

// Proceso el guardado (creación o actualización) del docente
async function guardarDocente(datosFormulario) {
  guardandoDocente.value = true;
  try {
    if (modoEdicion.value && docenteSeleccionado.value) {
      // Actualizo el docente existente (incluyendo posibilidad de cambiar la asignatura asignada)
      const docenteActualizado = await docenteService.actualizar(docenteSeleccionado.value.id, datosFormulario);
      
      // Actualizo el elemento en la lista local
      const index = docentes.value.findIndex((d) => d.id === docenteSeleccionado.value.id);
      if (index !== -1) {
        docentes.value[index] = docenteActualizado;
      }
      mostrarToast('Docente e información de asignatura actualizados correctamente.', 'success');
    } else {
      // Registro un nuevo docente en la base de datos
      const nuevoDocente = await docenteService.crear(datosFormulario);
      docentes.value.unshift(nuevoDocente);
      mostrarToast('Nuevo docente registrado con su asignatura asignada con éxito.', 'success');
    }

    modalDocenteVisible.value = false;
  } catch (error) {
    mostrarToast(error.message || 'No se pudo guardar la información del docente.', 'error');
  } finally {
    guardandoDocente.value = false;
  }
}

// Abro el modal de confirmación antes de eliminar al docente
function solicitarEliminarDocente(docente) {
  docenteAEliminar.value = docente;
  modalConfirmVisible.value = true;
}

// Confirmo y ejecuto la eliminación física del docente de la base de datos
async function confirmarEliminacion() {
  if (!docenteAEliminar.value) return;

  eliminandoDocente.value = true;
  try {
    await docenteService.eliminar(docenteAEliminar.value.id);
    
    // Remuevo al docente de mi estado reactivo
    docentes.value = docentes.value.filter((d) => d.id !== docenteAEliminar.value.id);
    mostrarToast(`Docente ${docenteAEliminar.value.nombre} eliminado exitosamente de la base de datos.`, 'success');
    modalConfirmVisible.value = false;
  } catch (error) {
    mostrarToast(error.message || 'No fue posible eliminar al docente.', 'error');
  } finally {
    eliminandoDocente.value = false;
    docenteAEliminar.value = null;
  }
}

// Muestro un mensaje Toast flotante
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
  <div class="docentes-view">
    <!-- Panel de estadísticas generales del área académica -->
    <StatsOverview 
      :total-docentes="docentes.length"
      :total-asignaturas="asignaturas.length"
      :promedio-experiencia="promedioExperiencia"
      :asignaturas-activas="asignaturas.filter(a => a.activo).length"
    />

    <!-- Barra de acciones y control administrativo -->
    <div class="view-header">
      <div>
        <h2 class="view-title">Gestión de Docentes</h2>
        <p class="view-description">
          Visualiza los docentes registrados, su materia de enseñanza asignada, o registra nuevas contrataciones.
        </p>
      </div>

      <button class="btn btn-primary" @click="abrirModalCrear">
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        <span>Registrar Nuevo Docente</span>
      </button>
    </div>

    <!-- Barra de filtrado y búsqueda reactiva -->
    <div class="filters-card card">
      <div class="search-input-wrapper">
        <svg class="search-icon" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input 
          v-model="filtroBusqueda" 
          type="text" 
          class="form-input search-input" 
          placeholder="Buscar docente por nombre, apellidos, correo o título..."
        />
      </div>

      <div class="select-wrapper">
        <select v-model="filtroAsignatura" class="form-select filter-select">
          <option value="">Todas las asignaturas de enseñanza</option>
          <option v-for="asig in asignaturas" :key="asig.id" :value="asig.id">
            {{ asig.nombre }} ({{ asig.codigo }})
          </option>
        </select>
      </div>
    </div>

    <!-- Estado de carga: Spinner -->
    <div v-if="cargando" class="loading-state card">
      <div class="spinner"></div>
      <p>Cargando lista de docentes y asignaturas asignadas...</p>
    </div>

    <!-- Estado vacío: Sin resultados -->
    <div v-else-if="docentesFiltrados.length === 0" class="empty-state card">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" width="40" height="40" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="8" y1="15" x2="16" y2="15"/>
          <line x1="9" y1="9" x2="9.01" y2="9"/>
          <line x1="15" y1="9" x2="15.01" y2="9"/>
        </svg>
      </div>
      <h3>No se encontraron docentes</h3>
      <p>No existen registros que coincidan con los filtros aplicados o aún no has registrado docentes.</p>
      <button class="btn btn-secondary" @click="filtroBusqueda = ''; filtroAsignatura = ''">
        Limpiar Filtros
      </button>
    </div>

    <!-- Tabla administrativa de docentes -->
    <div v-else class="table-responsive">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Docente</th>
            <th>Contacto</th>
            <th>Título & Experiencia</th>
            <th>Asignatura (Materia de Enseñanza)</th>
            <th style="text-align: right;">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="docente in docentesFiltrados" :key="docente.id">
            <!-- Columna: Docente -->
            <td>
              <div class="docente-profile">
                <div class="avatar-circle">
                  {{ docente.nombre.charAt(0) }}{{ docente.apellidos.charAt(0) }}
                </div>
                <div>
                  <div class="docente-nombre">{{ docente.nombre }} {{ docente.apellidos }}</div>
                  <div class="docente-id">ID Docente: #{{ docente.id }}</div>
                </div>
              </div>
            </td>

            <!-- Columna: Contacto -->
            <td>
              <div class="contact-info">
                <div class="contact-email">
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <span>{{ docente.email }}</span>
                </div>
                <div v-if="docente.telefono" class="contact-phone">
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  <span>{{ docente.telefono }}</span>
                </div>
              </div>
            </td>

            <!-- Columna: Formación y Años de Experiencia -->
            <td>
              <div class="academic-title">{{ docente.tituloAcademico }}</div>
              <div class="experience-tag">
                <span class="badge badge-warning">{{ docente.experienciaAnos }} años de experiencia</span>
              </div>
            </td>

            <!-- Columna: Asignatura de Enseñanza Asignada -->
            <td>
              <div v-if="docente.asignatura" class="subject-box">
                <span class="badge badge-primary">
                  <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                  {{ docente.asignatura.codigo }}
                </span>
                <span class="subject-name">{{ docente.asignatura.nombre }}</span>
                <span class="subject-details">{{ docente.asignatura.creditos }} créditos • {{ docente.asignatura.horasSemanales }}h/sem</span>
              </div>
              <div v-else class="no-subject">
                <span class="badge badge-warning">Sin materia asignada</span>
              </div>
            </td>

            <!-- Columna: Acciones Administrativas -->
            <td style="text-align: right;">
              <div class="actions-group">
                <!-- Botón: Editar y Reasignar Materia -->
                <button 
                  class="btn-icon btn-icon-edit" 
                  title="Editar información o cambiar asignatura asignada"
                  @click="abrirModalEditar(docente)"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  <span>Editar / Cambiar Materia</span>
                </button>

                <!-- Botón: Eliminar Docente -->
                <button 
                  class="btn-icon btn-icon-delete" 
                  title="Eliminar docente de la base de datos"
                  @click="solicitarEliminarDocente(docente)"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    <line x1="10" y1="11" x2="10" y2="17"/>
                    <line x1="14" y1="11" x2="14" y2="17"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para Crear / Editar Docente y Reasignar Asignatura -->
    <DocenteModal 
      :visible="modalDocenteVisible"
      :modo-edicion="modoEdicion"
      :docente-inicial="docenteSeleccionado"
      :asignaturas="asignaturas"
      :cargando="guardandoDocente"
      @cerrar="modalDocenteVisible = false"
      @guardar="guardarDocente"
    />

    <!-- Modal de confirmación para eliminar docente -->
    <ConfirmModal 
      :visible="modalConfirmVisible"
      titulo="¿Eliminar Docente?"
      :mensaje="docenteAEliminar ? `¿Confirmas que deseas eliminar permanentemente a ${docenteAEliminar.nombre} ${docenteAEliminar.apellidos}? Esta operación eliminará el registro de la base de datos.` : ''"
      :cargando="eliminandoDocente"
      @cancelar="modalConfirmVisible = false"
      @confirmar="confirmarEliminacion"
    />

    <!-- Notificación Toast reactiva -->
    <ToastNotification 
      :visible="toast.visible"
      :mensaje="toast.mensaje"
      :tipo="toast.tipo"
      @cerrar="toast.visible = false"
    />
  </div>
</template>

<style scoped>
/* Estilos principales de la vista de docentes */
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

.filters-card {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.search-input-wrapper {
  flex: 2;
  min-width: 280px;
  position: relative;
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

.select-wrapper {
  flex: 1;
  min-width: 220px;
}

/* Avatar del docente */
.docente-profile {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.avatar-circle {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  letter-spacing: 0.05em;
  flex-shrink: 0;
}

.docente-nombre {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.docente-id {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Información de contacto */
.contact-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.825rem;
}

.contact-email, .contact-phone {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--text-secondary);
}

/* Formación académica */
.academic-title {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.85rem;
}

.experience-tag {
  margin-top: 0.3rem;
}

/* Asignatura asignada */
.subject-box {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: flex-start;
}

.subject-name {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.subject-details {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Grupo de botones de acción */
.actions-group {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.75rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background-color: #ffffff;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-icon-edit {
  color: var(--primary);
  border-color: #bfdbfe;
  background-color: var(--primary-light);
}

.btn-icon-edit:hover {
  background-color: #dbeafe;
}

.btn-icon-delete {
  color: var(--danger);
  border-color: #fecaca;
  background-color: var(--danger-light);
  padding: 0.45rem 0.5rem;
}

.btn-icon-delete:hover {
  background-color: #fee2e2;
}

/* Estado de carga y vacío */
.loading-state, .empty-state {
  text-align: center;
  padding: 3.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.empty-icon {
  width: 70px;
  height: 70px;
  background-color: #f1f5f9;
  color: var(--text-muted);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
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
