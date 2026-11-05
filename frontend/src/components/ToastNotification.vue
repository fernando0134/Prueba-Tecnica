<script setup>
// Defino las propiedades que recibe la notificación flotante (Toast)
const props = defineProps({
  mensaje: {
    type: String,
    default: '',
  },
  tipo: {
    type: String, // 'success' o 'error'
    default: 'success',
  },
  visible: {
    type: Boolean,
    default: false,
  },
});

// Emito el evento para cerrar la notificación
const emit = defineEmits(['cerrar']);
</script>

<template>
  <!-- Renderizo la notificación flotante con transición suave -->
  <Transition name="toast">
    <div v-if="props.visible" :class="['toast-notification', `toast-${props.tipo}`]">
      <div class="toast-icon">
        <!-- Ícono de éxito -->
        <svg v-if="props.tipo === 'success'" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <!-- Ícono de error -->
        <svg v-else viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>

      <div class="toast-content">
        <p class="toast-message">{{ props.mensaje }}</p>
      </div>

      <!-- Botón para cerrar manualmente -->
      <button class="toast-close" @click="emit('cerrar')" aria-label="Cerrar notificación">
        &times;
      </button>
    </div>
  </Transition>
</template>

<style scoped>
/* Estilos del Toast flotante */
.toast-notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  min-width: 320px;
  max-width: 450px;
  background-color: #ffffff;
  border-radius: var(--radius-md);
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  box-shadow: var(--shadow-xl);
  z-index: 1000;
  border-left: 5px solid;
}

.toast-success {
  border-left-color: var(--success);
}

.toast-success .toast-icon {
  color: var(--success);
}

.toast-error {
  border-left-color: var(--danger);
}

.toast-error .toast-icon {
  color: var(--danger);
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.toast-content {
  flex: 1;
}

.toast-message {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.2rem;
  line-height: 1;
}

.toast-close:hover {
  color: var(--text-primary);
}

/* Transiciones de entrada y salida */
.toast-enter-active, .toast-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-enter-from, .toast-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
</style>
