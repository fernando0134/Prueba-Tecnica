<script setup>
// Importo utilidades reactivas desde Vue
import { ref, watch, computed } from 'vue';

// Defino las propiedades del modal de docente
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  modoEdicion: {
    type: Boolean,
    default: false,
  },
  docenteInicial: {
    type: Object,
    default: () => ({}),
  },
  asignaturas: {
    type: Array,
    default: () => [],
  },
  cargando: {
    type: Boolean,
    default: false,
  },
});

// Emito los eventos hacia el componente padre
const emit = defineEmits(['cerrar', 'guardar']);

// Inicializo el estado de mi formulario reactivo
const formulario = ref({
  nombre: '',
  apellidos: '',
  email: '',
  telefono: '',
  tituloAcademico: '',
  experienciaAnos: 0,
  asignaturaId: '',
});

// Almaceno los errores de validación local
const errores = ref({});

// Observo cambios en la visibilidad o en el docente inicial para poblar o limpiar el formulario
watch(
  () => props.visible,
  (estaVisible) => {
    if (estaVisible) {
      limpiarErrores();
      if (props.modoEdicion && props.docenteInicial) {
        // Cargo los datos del docente existente para su edición y reasignación de asignatura
        formulario.value = {
          nombre: props.docenteInicial.nombre || '',
          apellidos: props.docenteInicial.apellidos || '',
          email: props.docenteInicial.email || '',
          telefono: props.docenteInicial.telefono || '',
          tituloAcademico: props.docenteInicial.tituloAcademico || '',
          experienciaAnos: props.docenteInicial.experienciaAnos ?? 0,
          asignaturaId: props.docenteInicial.asignaturaId || (props.docenteInicial.asignatura ? props.docenteInicial.asignatura.id : ''),
        };
      } else {
        // Busco la primera asignatura ACTIVA disponible para asignarla por defecto
        const primeraActiva = props.asignaturas.find((a) => a.activo);
        formulario.value = {
          nombre: '',
          apellidos: '',
          email: '',
          telefono: '',
          tituloAcademico: '',
          experienciaAnos: 0,
          asignaturaId: primeraActiva ? primeraActiva.id : '',
        };
      }
    }
  },
  { immediate: true }
);

function limpiarErrores() {
  errores.value = {};
}

// Valido los datos ingresados en el formulario de forma estricta evitando coerción truthy/falsy
function validarFormulario() {
  const errs = {};

  if (typeof formulario.value.nombre !== 'string' || formulario.value.nombre.trim().length === 0) {
    errs.nombre = 'El nombre es obligatorio.';
  }

  if (typeof formulario.value.apellidos !== 'string' || formulario.value.apellidos.trim().length === 0) {
    errs.apellidos = 'Los apellidos son obligatorios.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (typeof formulario.value.email !== 'string' || formulario.value.email.trim().length === 0) {
    errs.email = 'El correo electrónico es obligatorio.';
  } else if (!emailRegex.test(formulario.value.email.trim())) {
    errs.email = 'Ingresa un formato de correo electrónico válido.';
  }

  if (typeof formulario.value.tituloAcademico !== 'string' || formulario.value.tituloAcademico.trim().length === 0) {
    errs.tituloAcademico = 'El título académico es obligatorio.';
  }

  const numExp = Number(formulario.value.experienciaAnos);
  if (formulario.value.experienciaAnos === '' || formulario.value.experienciaAnos === null || isNaN(numExp) || numExp < 0) {
    errs.experienciaAnos = 'Los años de experiencia deben ser un número mayor o igual a 0.';
  }

  if (formulario.value.asignaturaId === '' || formulario.value.asignaturaId === null || formulario.value.asignaturaId === undefined) {
    errs.asignaturaId = 'Debes asignar obligatoriamente una materia al docente.';
  } else {
    // REGLA DE NEGOCIO EN CLIENTE: Verificar que la materia esté ACTIVA de forma estricta
    const asigSeleccionada = props.asignaturas.find((a) => a.id === Number(formulario.value.asignaturaId));
    if (asigSeleccionada && asigSeleccionada.activo !== true) {
      errs.asignaturaId = 'No puedes asignar una materia inactiva. Cada docente debe pertenecer a una asignatura activa.';
    }
  }

  errores.value = errs;
  return Object.keys(errs).length === 0;
}

// Proceso el envío del formulario
function manejarEnvio() {
  if (!validarFormulario()) return;

  emit('guardar', {
    ...formulario.value,
    asignaturaId: Number(formulario.value.asignaturaId),
    experienciaAnos: Number(formulario.value.experienciaAnos),
  });
}

const tituloModal = computed(() => {
  return props.modoEdicion ? 'Actualizar Información de Docente' : 'Registrar Nuevo Docente';
});
</script>

<template>
  <div v-if="props.visible" class="modal-overlay" @click.self="emit('cerrar')">
    <div class="modal-content">
      <div class="modal-header">
        <div>
          <h2 class="modal-title">{{ tituloModal }}</h2>
          <p class="modal-subtitle">
            {{ props.modoEdicion ? 'Modifica los datos del docente o reasigna su materia de enseñanza activa.' : 'Completa los datos del docente y vincúlalo a una asignatura activa.' }}
          </p>
        </div>
        <button class="modal-close-btn" @click="emit('cerrar')" aria-label="Cerrar modal">&times;</button>
      </div>

      <form @submit.prevent="manejarEnvio" novalidate>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label" for="docente-nombre">Nombre(s) *</label>
            <input 
              id="docente-nombre" 
              v-model="formulario.nombre" 
              type="text" 
              class="form-input" 
              placeholder="Ej. Roberto"
              :class="{ 'is-invalid': errores.nombre }"
            />
            <span v-if="errores.nombre" class="form-error">{{ errores.nombre }}</span>
          </div>

          <div class="form-group">
            <label class="form-label" for="docente-apellidos">Apellidos *</label>
            <input 
              id="docente-apellidos" 
              v-model="formulario.apellidos" 
              type="text" 
              class="form-input" 
              placeholder="Ej. Hernández Mendoza"
              :class="{ 'is-invalid': errores.apellidos }"
            />
            <span v-if="errores.apellidos" class="form-error">{{ errores.apellidos }}</span>
          </div>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label" for="docente-email">Correo Electrónico (Único) *</label>
            <input 
              id="docente-email" 
              v-model="formulario.email" 
              type="email" 
              class="form-input" 
              placeholder="ejemplo@universidad.edu"
              :class="{ 'is-invalid': errores.email }"
            />
            <span v-if="errores.email" class="form-error">{{ errores.email }}</span>
          </div>

          <div class="form-group">
            <label class="form-label" for="docente-telefono">Teléfono (Opcional)</label>
            <input 
              id="docente-telefono" 
              v-model="formulario.telefono" 
              type="tel" 
              class="form-input" 
              placeholder="+52 55 1234 5678"
            />
          </div>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label" for="docente-titulo">Título Académico *</label>
            <input 
              id="docente-titulo" 
              v-model="formulario.tituloAcademico" 
              type="text" 
              class="form-input" 
              placeholder="Ej. Magíster en Ciencias Computacionales"
              :class="{ 'is-invalid': errores.tituloAcademico }"
            />
            <span v-if="errores.tituloAcademico" class="form-error">{{ errores.tituloAcademico }}</span>
          </div>

          <div class="form-group">
            <label class="form-label" for="docente-experiencia">Años de Experiencia *</label>
            <input 
              id="docente-experiencia" 
              v-model="formulario.experienciaAnos" 
              type="number" 
              min="0"
              max="60"
              class="form-input" 
              :class="{ 'is-invalid': errores.experienciaAnos }"
            />
            <span v-if="errores.experienciaAnos" class="form-error">{{ errores.experienciaAnos }}</span>
          </div>
        </div>

        <!-- Selector de Asignatura: Sólo activas -->
        <div class="form-group highlight-group">
          <label class="form-label" for="docente-asignatura">
            <span class="badge badge-primary">Materia Asignada</span>
            Asignatura Activa de Trabajo / Enseñanza *
          </label>
          <select 
            id="docente-asignatura" 
            v-model="formulario.asignaturaId" 
            class="form-select"
            :class="{ 'is-invalid': errores.asignaturaId }"
          >
            <option value="" disabled>-- Selecciona una asignatura activa disponible --</option>
            <option 
              v-for="asig in props.asignaturas" 
              :key="asig.id" 
              :value="asig.id"
              :disabled="!asig.activo"
            >
              {{ asig.nombre }} ({{ asig.codigo }} | {{ asig.creditos }} Créditos) {{ !asig.activo ? '— [INACTIVA: No elegible]' : '' }}
            </option>
          </select>
          <span v-if="errores.asignaturaId" class="form-error">{{ errores.asignaturaId }}</span>
          <p class="field-hint">
            🔒 Cada docente debe pertenecer a una asignatura activa. Las materias dadas de baja o en revisión no pueden ser seleccionadas.
          </p>
        </div>

        <div class="modal-footer">
          <button 
            type="button" 
            class="btn btn-secondary" 
            :disabled="props.cargando"
            @click="emit('cerrar')"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            class="btn btn-primary" 
            :disabled="props.cargando"
          >
            <span v-if="props.cargando">Guardando en sistema...</span>
            <span v-else>{{ props.modoEdicion ? 'Actualizar Docente' : 'Registrar Docente' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 1rem;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-primary);
}

.modal-subtitle {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 1.75rem;
  color: var(--text-muted);
  cursor: pointer;
  line-height: 1;
}

.modal-close-btn:hover {
  color: var(--text-primary);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.highlight-group {
  background-color: var(--primary-light);
  padding: 1rem;
  border-radius: var(--radius-md);
  border: 1px solid #bfdbfe;
}

.field-hint {
  font-size: 0.775rem;
  color: #1e40af;
  margin-top: 0.4rem;
}

.is-invalid {
  border-color: var(--danger) !important;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
