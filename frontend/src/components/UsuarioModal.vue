<script setup>
// Importo utilidades reactivas desde Vue
import { ref, watch, computed } from 'vue';

// Defino las propiedades del modal de usuario (soporta registro y edición)
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  modoEdicion: {
    type: Boolean,
    default: false,
  },
  usuarioInicial: {
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

// Estado reactivo del formulario
const formulario = ref({
  nombre: '',
  email: '',
  password: '',
  rol: 'COORDINADOR',
});

// Errores locales
const errores = ref({});

// Observo cambios en la visibilidad o usuario inicial para inicializar campos
watch(
  () => props.visible,
  (estaVisible) => {
    if (estaVisible) {
      errores.value = {};
      if (props.modoEdicion && props.usuarioInicial) {
        // Cargo los datos de la cuenta existente
        formulario.value = {
          nombre: props.usuarioInicial.nombre || '',
          email: props.usuarioInicial.email || '',
          password: '', // En edición, la contraseña se deja vacía si no se desea cambiar
          rol: props.usuarioInicial.rol || 'COORDINADOR',
        };
      } else {
        // Reinicio los campos para nueva cuenta
        formulario.value = {
          nombre: '',
          email: '',
          password: '',
          rol: 'COORDINADOR',
        };
      }
    }
  },
  { immediate: true }
);

// Valido los datos antes de emitir
function validar() {
  const errs = {};
  if (!formulario.value.nombre.trim()) errs.nombre = 'El nombre es obligatorio.';
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formulario.value.email.trim() || !emailRegex.test(formulario.value.email)) {
    errs.email = 'Ingresa un correo electrónico válido.';
  }

  // La contraseña es obligatoria en modo creación, pero opcional en edición
  if (!props.modoEdicion) {
    if (!formulario.value.password || formulario.value.password.length < 6) {
      errs.password = 'La contraseña inicial debe tener al menos 6 caracteres.';
    }
  } else {
    if (formulario.value.password && formulario.value.password.length < 6) {
      errs.password = 'Si deseas cambiar la contraseña, debe contener al menos 6 caracteres.';
    }
  }

  errores.value = errs;
  return Object.keys(errs).length === 0;
}

function manejarEnvio() {
  if (!validar()) return;
  emit('guardar', { ...formulario.value });
}

const tituloModal = computed(() => {
  return props.modoEdicion ? 'Actualizar Cuenta de Personal' : 'Registrar Nueva Cuenta de Personal';
});
</script>

<template>
  <div v-if="props.visible" class="modal-overlay" @click.self="emit('cerrar')">
    <div class="modal-content">
      <div class="modal-header">
        <div>
          <h2 class="modal-title">{{ tituloModal }}</h2>
          <p class="modal-subtitle">
            {{ props.modoEdicion ? 'Modifica los datos personales, el rol o actualiza la clave de acceso.' : 'Crea un nuevo usuario administrativo con rol de Coordinador o Administrador.' }}
          </p>
        </div>
        <button class="modal-close-btn" @click="emit('cerrar')" aria-label="Cerrar">&times;</button>
      </div>

      <form @submit.prevent="manejarEnvio" novalidate>
        <div class="form-group">
          <label class="form-label" for="user-nombre">Nombre Completo *</label>
          <input 
            id="user-nombre" 
            v-model="formulario.nombre" 
            type="text" 
            class="form-input" 
            placeholder="Ej. Lic. Fernando Gutiérrez"
            :class="{ 'is-invalid': errores.nombre }"
          />
          <span v-if="errores.nombre" class="form-error">{{ errores.nombre }}</span>
        </div>

        <div class="form-group">
          <label class="form-label" for="user-email">Correo Electrónico Institucional *</label>
          <input 
            id="user-email" 
            v-model="formulario.email" 
            type="email" 
            class="form-input" 
            placeholder="fernando.gutierrez@universidad.edu"
            :class="{ 'is-invalid': errores.email }"
          />
          <span v-if="errores.email" class="form-error">{{ errores.email }}</span>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label" for="user-pass">
              {{ props.modoEdicion ? 'Nueva Contraseña (Opcional)' : 'Contraseña Inicial *' }}
            </label>
            <input 
              id="user-pass" 
              v-model="formulario.password" 
              type="password" 
              class="form-input" 
              :placeholder="props.modoEdicion ? 'Dejar vacío para conservar actual' : 'Mínimo 6 caracteres'"
              :class="{ 'is-invalid': errores.password }"
            />
            <span v-if="errores.password" class="form-error">{{ errores.password }}</span>
          </div>

          <div class="form-group">
            <label class="form-label" for="user-rol">Nivel de Acceso (Rol) *</label>
            <select id="user-rol" v-model="formulario.rol" class="form-select">
              <option value="COORDINADOR">📋 COORDINADOR (Operativo / Académico)</option>
              <option value="ADMIN">👑 ADMINISTRADOR (Gobernanza Total)</option>
            </select>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" :disabled="props.cargando" @click="emit('cerrar')">
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary" :disabled="props.cargando">
            <span v-if="props.cargando">Guardando cuenta...</span>
            <span v-else>{{ props.modoEdicion ? 'Actualizar Cuenta' : 'Crear Cuenta' }}</span>
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
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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
