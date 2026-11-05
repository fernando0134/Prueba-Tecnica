<script setup>
// Defino las propiedades que configuran el mensaje del diálogo de confirmación
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  titulo: {
    type: String,
    default: 'Confirmar eliminación',
  },
  mensaje: {
    type: String,
    default: '¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.',
  },
  cargando: {
    type: Boolean,
    default: false,
  },
});

// Emito eventos para confirmar o cancelar la acción
const emit = defineEmits(['confirmar', 'cancelar']);
</script>

<template>
  <!-- Renderizo la ventana modal de confirmación -->
  <div v-if="props.visible" class="modal-overlay" @click.self="emit('cancelar')">
    <div class="modal-content confirm-modal-card">
      <div class="confirm-icon">
        <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>

      <div class="confirm-text">
        <h3 class="confirm-title">{{ props.titulo }}</h3>
        <p class="confirm-description">{{ props.mensaje }}</p>
      </div>

      <div class="confirm-actions">
        <button 
          type="button" 
          class="btn btn-secondary" 
          :disabled="props.cargando"
          @click="emit('cancelar')"
        >
          Cancelar
        </button>
        <button 
          type="button" 
          class="btn btn-danger" 
          :disabled="props.cargando"
          @click="emit('confirmar')"
        >
          <span v-if="props.cargando">Eliminando...</span>
          <span v-else>Sí, Eliminar</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos para el modal de confirmación */
.confirm-modal-card {
  max-width: 440px;
  text-align: center;
  padding: 2rem 1.75rem;
}

.confirm-icon {
  width: 56px;
  height: 56px;
  background-color: var(--danger-light);
  color: var(--danger);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
}

.confirm-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.confirm-description {
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: 1.75rem;
}

.confirm-actions {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
}
</style>
