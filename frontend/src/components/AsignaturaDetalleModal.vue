<script setup>
// Defino las propiedades para consultar el detalle completo de la asignatura
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  asignatura: {
    type: Object,
    default: () => ({}),
  },
});

// Emito el evento de cierre
const emit = defineEmits(['cerrar']);
</script>

<template>
  <!-- Modal para consultar el detalle de una asignatura y sus docentes asignados -->
  <div v-if="props.visible && props.asignatura" class="modal-overlay" @click.self="emit('cerrar')">
    <div class="modal-content detalle-modal">
      <div class="modal-header">
        <div class="header-content">
          <div class="badge-row">
            <span class="badge badge-primary code-badge">{{ props.asignatura.codigo }}</span>
            <span class="badge" :class="props.asignatura.activo ? 'badge-success' : 'badge-warning'">
              {{ props.asignatura.activo ? 'Asignatura Activa' : 'Asignatura Inactiva' }}
            </span>
          </div>
          <h2 class="modal-title">{{ props.asignatura.nombre }}</h2>
        </div>
        <button class="modal-close-btn" @click="emit('cerrar')" aria-label="Cerrar">&times;</button>
      </div>

      <!-- Resumen curricular -->
      <div class="detalle-grid">
        <div class="detalle-card">
          <span class="detalle-label">Créditos Académicos</span>
          <span class="detalle-valor">{{ props.asignatura.creditos }} Créditos</span>
        </div>
        <div class="detalle-card">
          <span class="detalle-label">Carga Horaria</span>
          <span class="detalle-valor">{{ props.asignatura.horasSemanales }} Horas / Semana</span>
        </div>
        <div class="detalle-card">
          <span class="detalle-label">Docentes Impartiendo</span>
          <span class="detalle-valor">{{ (props.asignatura.docentes && props.asignatura.docentes.length) || 0 }} Docentes</span>
        </div>
      </div>

      <!-- Descripción -->
      <div class="detalle-seccion">
        <h4 class="seccion-titulo">Descripción Temática</h4>
        <p class="seccion-texto">
          {{ props.asignatura.descripcion || 'Esta materia no tiene una descripción temática registrada.' }}
        </p>
      </div>

      <!-- Docentes que imparten la asignatura -->
      <div class="detalle-seccion">
        <h4 class="seccion-titulo">Docentes Asignados a esta Materia</h4>
        <div v-if="props.asignatura.docentes && props.asignatura.docentes.length > 0" class="docentes-lista">
          <div v-for="doc in props.asignatura.docentes" :key="doc.id" class="docente-item">
            <div class="docente-avatar">
              {{ doc.nombre.charAt(0) }}{{ doc.apellidos.charAt(0) }}
            </div>
            <div class="docente-datos">
              <span class="docente-fullname">{{ doc.nombre }} {{ doc.apellidos }}</span>
              <span class="docente-meta">{{ doc.tituloAcademico }} • {{ doc.email }}</span>
            </div>
          </div>
        </div>
        <div v-else class="sin-docentes-box">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>Actualmente no hay ningún docente asignado a esta materia.</span>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" @click="emit('cerrar')">
          Cerrar Consulta
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detalle-modal {
  max-width: 620px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 1rem;
}

.badge-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.4rem;
}

.code-badge {
  font-weight: 800;
  letter-spacing: 0.05em;
}

.modal-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--text-primary);
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 1.75rem;
  color: var(--text-muted);
  cursor: pointer;
}

.detalle-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.875rem;
  margin-bottom: 1.5rem;
}

.detalle-card {
  background-color: #f8fafc;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0.875rem;
  text-align: center;
}

.detalle-label {
  display: block;
  font-size: 0.725rem;
  text-transform: uppercase;
  font-weight: 700;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}

.detalle-valor {
  font-size: 1rem;
  font-weight: 800;
  color: var(--text-primary);
}

.detalle-seccion {
  margin-bottom: 1.5rem;
}

.seccion-titulo {
  font-size: 0.825rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.seccion-texto {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.5;
  background-color: #f8fafc;
  padding: 0.875rem;
  border-radius: var(--radius-md);
}

.docentes-lista {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.docente-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.875rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: #ffffff;
}

.docente-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), #1d4ed8);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
}

.docente-datos {
  display: flex;
  flex-direction: column;
}

.docente-fullname {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-primary);
}

.docente-meta {
  font-size: 0.775rem;
  color: var(--text-muted);
}

.sin-docentes-box {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.875rem;
  border-radius: var(--radius-md);
  background-color: #fffbeb;
  color: #b45309;
  font-size: 0.85rem;
  font-weight: 600;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid var(--border-color);
  padding-top: 1rem;
}
</style>
