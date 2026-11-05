<script setup>
// Importo utilidades reactivas desde Vue y el servicio de autenticación
import { ref, watch, computed } from 'vue';
import { authService } from '../services/authService';

// Defino las propiedades del modal de asignatura (soporta creación y edición)
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  modoEdicion: {
    type: Boolean,
    default: false,
  },
  asignaturaInicial: {
    type: Object,
    default: () => ({}),
  },
  cargando: {
    type: Boolean,
    default: false,
  },
});

// Emito eventos hacia el componente padre
const emit = defineEmits(['cerrar', 'guardar']);

// Estado reactivo del formulario de asignatura
const formulario = ref({
  nombre: '',
  codigo: '',
  descripcion: '',
  creditos: 4,
  horasSemanales: 4,
  activo: true,
});

// Almaceno los errores de validación
const errores = ref({});

// Observo cambios en la visibilidad o asignatura inicial para poblar los datos
watch(
  () => props.visible,
  (estaVisible) => {
    if (estaVisible) {
      errores.value = {};
      if (props.modoEdicion && props.asignaturaInicial) {
        // Cargo los datos de la asignatura existente para su edición
        formulario.value = {
          nombre: props.asignaturaInicial.nombre || '',
          codigo: props.asignaturaInicial.codigo || '',
          descripcion: props.asignaturaInicial.descripcion || '',
          creditos: props.asignaturaInicial.creditos ?? 4,
          horasSemanales: props.asignaturaInicial.horasSemanales ?? 4,
          activo: props.asignaturaInicial.activo !== undefined ? props.asignaturaInicial.activo : true,
        };
      } else {
        // Reinicio los campos para crear una nueva materia
        formulario.value = {
          nombre: '',
          codigo: '',
          descripcion: '',
          creditos: 4,
          horasSemanales: 4,
          activo: true,
        };
      }
    }
  },
  { immediate: true }
);

// Valido los campos de forma estricta evitando coerción truthy/falsy
function validarFormulario() {
  const errs = {};

  if (typeof formulario.value.nombre !== 'string' || formulario.value.nombre.trim().length === 0) {
    errs.nombre = 'El nombre de la asignatura es obligatorio.';
  }

  if (typeof formulario.value.codigo !== 'string' || formulario.value.codigo.trim().length === 0) {
    errs.codigo = 'El código de la materia es obligatorio.';
  }

  const numCreditos = Number(formulario.value.creditos);
  if (formulario.value.creditos === '' || formulario.value.creditos === null || isNaN(numCreditos) || numCreditos < 1) {
    errs.creditos = 'Los créditos deben ser un número mayor o igual a 1.';
  }

  const numHoras = Number(formulario.value.horasSemanales);
  if (formulario.value.horasSemanales === '' || formulario.value.horasSemanales === null || isNaN(numHoras) || numHoras < 1) {
    errs.horasSemanales = 'Las horas semanales deben ser un número mayor o igual a 1.';
  }

  errores.value = errs;
  return Object.keys(errs).length === 0;
}

// Proceso el registro o actualización de la asignatura
function manejarEnvio() {
  if (!validarFormulario()) return;

  emit('guardar', {
    ...formulario.value,
    codigo: formulario.value.codigo.trim().toUpperCase(),
    creditos: Number(formulario.value.creditos),
    horasSemanales: Number(formulario.value.horasSemanales),
    activo: Boolean(formulario.value.activo),
  });
}

const tituloModal = computed(() => {
  return props.modoEdicion ? 'Actualizar Asignatura (Materia)' : 'Crear Nueva Asignatura (Materia)';
});
</script>

<template>
  <div v-if="props.visible" class="modal-overlay" @click.self="emit('cerrar')">
    <div class="modal-content">
      <div class="modal-header">
        <div>
          <h2 class="modal-title">{{ tituloModal }}</h2>
          <p class="modal-subtitle">
            {{ props.modoEdicion ? 'Modifica los datos curriculares o el estado de la materia.' : 'Agrega una nueva materia al plan de estudios para asignación docente.' }}
          </p>
        </div>
        <button class="modal-close-btn" @click="emit('cerrar')" aria-label="Cerrar modal">&times;</button>
      </div>

      <form @submit.prevent="manejarEnvio" novalidate>
        <!-- Campo: Nombre de la Asignatura (Único) -->
        <div class="form-group">
          <label class="form-label" for="asig-nombre">Nombre de la Asignatura (Único) *</label>
          <input 
            id="asig-nombre" 
            v-model="formulario.nombre" 
            type="text" 
            class="form-input" 
            placeholder="Ej. Programación Orientada a Objetos"
            :class="{ 'is-invalid': errores.nombre }"
          />
          <span v-if="errores.nombre" class="form-error">{{ errores.nombre }}</span>
        </div>

        <div class="form-grid">
          <!-- Campo: Código Único -->
          <div class="form-group">
            <label class="form-label" for="asig-codigo">Código de la Materia (Único) *</label>
            <input 
              id="asig-codigo" 
              v-model="formulario.codigo" 
              type="text" 
              class="form-input code-input" 
              placeholder="Ej. MAT-201"
              :class="{ 'is-invalid': errores.codigo }"
            />
            <span v-if="errores.codigo" class="form-error">{{ errores.codigo }}</span>
          </div>

          <!-- Campo: Créditos -->
          <div class="form-group">
            <label class="form-label" for="asig-creditos">Créditos Académicos *</label>
            <input 
              id="asig-creditos" 
              v-model="formulario.creditos" 
              type="number" 
              min="1" 
              max="10" 
              class="form-input" 
              :class="{ 'is-invalid': errores.creditos }"
            />
            <span v-if="errores.creditos" class="form-error">{{ errores.creditos }}</span>
          </div>
        </div>

        <div class="form-grid">
          <!-- Campo: Horas Semanales -->
          <div class="form-group">
            <label class="form-label" for="asig-horas">Horas Semanales de Clase *</label>
            <input 
              id="asig-horas" 
              v-model="formulario.horasSemanales" 
              type="number" 
              min="1" 
              max="40" 
              class="form-input" 
              :class="{ 'is-invalid': errores.horasSemanales }"
            />
            <span v-if="errores.horasSemanales" class="form-error">{{ errores.horasSemanales }}</span>
          </div>

          <!-- Campo: Estado Activo / Inactivo (Exclusivo ADMIN para cambiar) -->
          <div class="form-group">
            <label class="form-label" for="asig-activo">Estado Curricular</label>
            <select 
              id="asig-activo" 
              v-model="formulario.activo" 
              class="form-select"
              :disabled="!authService.esAdmin.value"
            >
              <option :value="true">Activa (Disponible para asignación)</option>
              <option :value="false">Inactiva (En revisión / Dada de baja)</option>
            </select>
            <span v-if="!authService.esAdmin.value" class="field-hint" style="color: var(--text-muted); font-size: 0.725rem;">
              🔒 Modificación de estado activo/inactivo reservada para rol ADMIN.
            </span>
          </div>
        </div>

        <!-- Campo: Descripción -->
        <div class="form-group">
          <label class="form-label" for="asig-desc">Descripción o Temario General</label>
          <textarea 
            id="asig-desc" 
            v-model="formulario.descripcion" 
            rows="3" 
            class="form-textarea" 
            placeholder="Describe brevemente los objetivos y temas principales de la materia..."
          ></textarea>
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
            <span v-if="props.cargando">Guardando cambios...</span>
            <span v-else>{{ props.modoEdicion ? 'Actualizar Asignatura' : 'Crear Asignatura' }}</span>
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

.code-input {
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.05em;
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
</style>
