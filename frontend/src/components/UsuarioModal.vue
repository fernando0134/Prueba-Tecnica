<script setup>
// Importo utilidades reactivas desde Vue
import { ref, watch } from 'vue';

// Defino las propiedades del modal de usuario
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
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

// Reinicio el formulario al abrir el modal
watch(
  () => props.visible,
  (estaVisible) => {
    if (estaVisible) {
      errores.value = {};
      formulario.value = {
        nombre: '',
        email: '',
        password: '',
        rol: 'COORDINADOR',
      };
    }
  }
);

// Valido los datos antes de emitir
function validar() {
  const errs = {};
  if (!formulario.value.nombre.trim()) errs.nombre = 'El nombre es obligatorio.';
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formulario.value.email.trim() || !emailRegex.test(formulario.value.email)) {
    errs.email = 'Ingresa un correo electrónico válido.';
  }

  if (!formulario.value.password || formulario.value.password.length < 6) {
    errs.password = 'La contraseña debe tener al menos 6 caracteres.';
  }

  errores.value = errs;
  return Object.keys(errs).length === 0;
}

function manejarEnvio() {
  if (!validar()) return;
  emit('guardar', { ...formulario.value });
}
</script>

<template>
  <div v-if="props.visible" class="modal-overlay" @click.self="emit('cerrar')">
    <div class="modal-content">
      <div class="modal-header">
        <div>
          <h2 class="modal-title">Registrar Nueva Cuenta de Personal</h2>
          <p class="modal-subtitle">Crea un nuevo usuario administrativo con rol de Coordinador o Administrador.</p>
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
            <label class="form-label" for="user-pass">Contraseña Inicial *</label>
            <input 
              id="user-pass" 
              v-model="formulario.password" 
              type="password" 
              class="form-input" 
              placeholder="Mínimo 6 caracteres"
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
            <span v-if="props.cargando">Creando cuenta...</span>
            <span v-else>Crear Cuenta</span>
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
