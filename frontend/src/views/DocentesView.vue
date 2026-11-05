<script setup>
// Importo utilidades reactivas y ciclo de vida desde Vue
import { ref, computed, onMounted } from 'vue';

// Importo los servicios para interactuar con la API del backend y el servicio de autenticación
import { docenteService } from '../services/docenteService';
import { asignaturaService } from '../services/asignaturaService';
import { authService } from '../services/authService';

// Importo componentes modulares
import StatsOverview from '../components/StatsOverview.vue';
import DocenteModal from '../components/DocenteModal.vue';
import ConfirmModal from '../components/ConfirmModal.vue';
import ToastNotification from '../components/ToastNotification.vue';

// Estado reactivo principal
const docentes = ref([]);
const asignaturas = ref([]);
const cargando = ref(true);
const filtroBusqueda = ref('');
const filtroAsignatura = ref('');

// Modales
const modalDocenteVisible = ref(false);
const modoEdicion = ref(false);
const docenteSeleccionado = ref(null);
const guardandoDocente = ref(false);

const modalConfirmVisible = ref(false);
const docenteAEliminar = ref(null);
const eliminandoDocente = ref(false);

// Notificaciones Toast
const toast = ref({
  visible: false,
  mensaje: '',
  tipo: 'success',
});

// Cargo los datos al montar la vista
onMounted(async () => {
  await cargarDatosIniciales();
});

// Consulto docentes y asignaturas activas en paralelo
async function cargarDatosIniciales() {
  cargando.value = true;
  try {
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

// Filtro docentes en tiempo real por texto o por materia asignada
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

// Promedio de experiencia para las métricas
const promedioExperiencia = computed(() => {
  if (docentes.value.length === 0) return 0;
  const suma = docentes.value.reduce((acc, doc) => acc + (doc.experienciaAnos || 0), 0);
  return Math.round((suma / docentes.value.length) * 10) / 10;
});

function abrirModalCrear() {
  modoEdicion.value = false;
  docenteSeleccionado.value = null;
  modalDocenteVisible.value = true;
}

function abrirModalEditar(docente) {
  modoEdicion.value = true;
  docenteSeleccionado.value = { ...docente };
  modalDocenteVisible.value = true;
}

// Proceso el guardado con validación y manejo de errores de backend
async function guardarDocente(datosFormulario) {
  guardandoDocente.value = true;
  try {
    if (modoEdicion.value && docenteSeleccionado.value) {
      const docenteActualizado = await docenteService.actualizar(docenteSeleccionado.value.id, datosFormulario);
      const index = docentes.value.findIndex((d) => d.id === docenteSeleccionado.value.id);
      if (index !== -1) {
        docentes.value[index] = docenteActualizado;
      }
      mostrarToast('Docente y su asignatura activa actualizados con éxito.', 'success');
    } else {
      const nuevoDocente = await docenteService.crear(datosFormulario);
      docentes.value.unshift(nuevoDocente);
      mostrarToast('Docente registrado y asignado a su materia activa con éxito.', 'success');
    }

    modalDocenteVisible.value = false;
  } catch (error) {
    mostrarToast(error.message || 'No se pudo guardar la información del docente.', 'error');
  } finally {
    guardandoDocente.value = false;
  }
}

function solicitarEliminarDocente(docente) {
  // Compruebo si el usuario actual tiene permisos de Administrador
  if (!authService.esAdmin.value) {
    mostrarToast('Acceso denegado: Sólo los usuarios con rol ADMIN pueden eliminar docentes.', 'error');
    return;
  }

  docenteAEliminar.value = docente;
  modalConfirmVisible.value = true;
}

async function confirmarEliminacion() {
  if (!docenteAEliminar.value) return;

  eliminandoDocente.value = true;
  try {
    await docenteService.eliminar(docenteAEliminar.value.id);
    docentes.value = docentes.value.filter((d) => d.id !== docenteAEliminar.value.id);
    mostrarToast(`Docente ${docenteAEliminar.value.nombre} eliminado exitosamente.`, 'success');
    modalConfirmVisible.value = false;
  } catch (error) {
    mostrarToast(error.message || 'No fue posible eliminar al docente.', 'error');
  } finally {
    eliminandoDocente.value = false;
    docenteAEliminar.value = null;
  }
}

// Descargo el archivo CSV compatible con Excel desde el endpoint de reportes
function descargarReporteCsv() {
  window.open('/api/reportes/docentes/csv', '_blank');
  mostrarToast('Descargando reporte de docentes y asignaciones en formato Excel / CSV...', 'success');
}

// Activo la vista de impresión del navegador para emitir la ficha institucional
function imprimirReporte() {
  window.print();
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
  <div class="docentes-view">
    <!-- Panel de métricas académicas -->
    <StatsOverview 
      :total-docentes="docentes.length"
      :total-asignaturas="asignaturas.length"
      :promedio-experiencia="promedioExperiencia"
      :asignaturas-activas="asignaturas.filter(a => a.activo).length"
    />

    <!-- Barra de acciones y exportación de reportes -->
    <div class="view-header">
      <div>
        <h2 class="view-title">Gestión de Docentes</h2>
        <p class="view-description">
          Administración de la plantilla académica institucional y asignación de materias activas de enseñanza.
        </p>
      </div>

      <div class="header-actions">
        <!-- Botón: Exportar a Excel / CSV -->
        <button class="btn btn-secondary" @click="descargarReporteCsv" title="Descargar nómina docente en Excel / CSV">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <span>Exportar Excel</span>
        </button>

        <!-- Botón: Imprimir Reporte -->
        <button class="btn btn-secondary" @click="imprimirReporte" title="Imprimir informe oficial">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
            <polyline points="6 9 6 2 18 2 18 9"/>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
            <rect x="6" y="14" width="12" height="8"/>
          </svg>
          <span>Imprimir Ficha</span>
        </button>

        <!-- Botón: Registrar Nuevo Docente -->
        <button class="btn btn-primary" @click="abrirModalCrear">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>Registrar Docente</span>
        </button>
      </div>
    </div>

    <!-- Barra de filtros -->
    <div class="filters-card card no-print">
      <div class="search-input-wrapper">
        <svg class="search-icon" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input 
          v-model="filtroBusqueda" 
          type="text" 
          class="form-input search-input" 
          placeholder="Buscar por nombre, apellidos, correo único o título académico..."
        />
      </div>

      <div class="select-wrapper">
        <select v-model="filtroAsignatura" class="form-select filter-select">
          <option value="">Todas las asignaturas de enseñanza</option>
          <option v-for="asig in asignaturas" :key="asig.id" :value="asig.id">
            {{ asig.nombre }} ({{ asig.codigo }}) {{ !asig.activo ? '[Inactiva]' : '' }}
          </option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="cargando" class="loading-state card">
      <div class="spinner"></div>
      <p>Cargando información de docentes y asignaturas activas...</p>
    </div>

    <!-- Vacío -->
    <div v-else-if="docentesFiltrados.length === 0" class="empty-state card">
      <h3>No se encontraron docentes</h3>
      <p>No existen registros que coincidan con los filtros aplicados.</p>
    </div>

    <!-- Tabla administrativa -->
    <div v-else class="table-responsive">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Docente</th>
            <th>Contacto</th>
            <th>Título & Experiencia</th>
            <th>Asignatura Asignada (Materia Activa)</th>
            <th class="no-print" style="text-align: right;">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="docente in docentesFiltrados" :key="docente.id">
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

            <td>
              <div class="contact-info">
                <div class="contact-email">
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <span>{{ docente.email }}</span>
                </div>
                <div v-if="docente.telefono" class="contact-phone">
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  <span>{{ docente.telefono }}</span>
                </div>
              </div>
            </td>

            <td>
              <div class="academic-title">{{ docente.tituloAcademico }}</div>
              <div class="experience-tag">
                <span class="badge badge-warning">{{ docente.experienciaAnos }} años exp.</span>
              </div>
            </td>

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
                <span class="badge badge-warning">Sin materia</span>
              </div>
            </td>

            <td class="no-print" style="text-align: right;">
              <div class="actions-group">
                <!-- Editar y Reasignar -->
                <button 
                  class="btn-icon btn-icon-edit" 
                  title="Editar datos o reasignar materia de enseñanza"
                  @click="abrirModalEditar(docente)"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  <span>Editar / Reasignar</span>
                </button>

                <!-- Eliminar: Bloqueado o restringido a ADMIN -->
                <button 
                  v-if="authService.esAdmin.value"
                  class="btn-icon btn-icon-delete" 
                  title="Eliminar docente de la base de datos (Exclusivo ADMIN)"
                  @click="solicitarEliminarDocente(docente)"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
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

    <!-- Modales -->
    <DocenteModal 
      :visible="modalDocenteVisible"
      :modo-edicion="modoEdicion"
      :docente-inicial="docenteSeleccionado"
      :asignaturas="asignaturas"
      :cargando="guardandoDocente"
      @cerrar="modalDocenteVisible = false"
      @guardar="guardarDocente"
    />

    <ConfirmModal 
      :visible="modalConfirmVisible"
      titulo="¿Eliminar Docente de la Base de Datos?"
      :mensaje="docenteAEliminar ? `¿Confirmas que deseas eliminar permanentemente a ${docenteAEliminar.nombre} ${docenteAEliminar.apellidos}? Esta operación es irreversible.` : ''"
      :cargando="eliminandoDocente"
      @cancelar="modalConfirmVisible = false"
      @confirmar="confirmarEliminacion"
    />

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

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
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

.academic-title {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.85rem;
}

.experience-tag {
  margin-top: 0.3rem;
}

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

/* Reglas de impresión para generar el reporte en PDF */
@media print {
  .no-print {
    display: none !important;
  }
  .app-container {
    background: #ffffff !important;
  }
  .admin-navbar, .admin-footer {
    display: none !important;
  }
  .admin-table th, .admin-table td {
    padding: 0.5rem !important;
    font-size: 0.8rem !important;
  }
}
</style>
