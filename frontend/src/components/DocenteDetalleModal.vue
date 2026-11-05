<script setup>
// Defino las propiedades para consultar la ficha técnica y curricular de un docente
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  docente: {
    type: Object,
    default: () => ({}),
  },
});

// Emito eventos hacia el componente padre
const emit = defineEmits(['cerrar', 'editar']);

// Formateo fechas en español legible
function formatearFecha(fechaIso) {
  if (!fechaIso) return 'N/A';
  return new Date(fechaIso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}
</script>

<template>
  <!-- Modal para consultar la ficha técnica completa del docente -->
  <div v-if="props.visible && props.docente" class="modal-overlay" @click.self="emit('cerrar')">
    <div class="modal-content detalle-modal">
      <div class="modal-header">
        <div class="docente-header-info">
          <div class="docente-avatar-lg">
            {{ props.docente.nombre?.charAt(0) || 'D' }}{{ props.docente.apellidos?.charAt(0) || '' }}
          </div>
          <div>
            <div class="header-badges">
              <span class="badge badge-primary">
                🎓 {{ props.docente.tituloAcademico || 'Docente' }}
              </span>
              <span class="badge badge-warning">
                ⭐ {{ props.docente.experienciaAnos ?? 0 }} años exp.
              </span>
            </div>
            <h2 class="modal-title">{{ props.docente.nombre }} {{ props.docente.apellidos }}</h2>
            <p class="modal-subtitle">ID Ficha Docente: #{{ props.docente.id }}</p>
          </div>
        </div>
        <button class="modal-close-btn" @click="emit('cerrar')" aria-label="Cerrar">&times;</button>
      </div>

      <!-- Datos de contacto y trayectoria -->
      <div class="detalle-grid">
        <div class="detalle-card">
          <span class="detalle-label">Correo Institucional</span>
          <span class="detalle-valor font-mono">{{ props.docente.email }}</span>
        </div>
        <div class="detalle-card">
          <span class="detalle-label">Teléfono de Contacto</span>
          <span class="detalle-valor">{{ props.docente.telefono || 'No registrado' }}</span>
        </div>
        <div class="detalle-card">
          <span class="detalle-label">Grado Académico</span>
          <span class="detalle-valor">{{ props.docente.tituloAcademico }}</span>
        </div>
        <div class="detalle-card">
          <span class="detalle-label">Fecha de Alta en Nómina</span>
          <span class="detalle-valor">{{ formatearFecha(props.docente.createdAt) }}</span>
        </div>
      </div>

      <!-- Materia Asignada de Enseñanza (Activa) -->
      <div class="materia-box">
        <div class="materia-header">
          <div>
            <span class="materia-tag">Asignatura de Enseñanza Asignada</span>
            <h3 class="materia-titulo">
              {{ props.docente.asignatura ? props.docente.asignatura.nombre : 'Sin materia asignada' }}
            </h3>
          </div>
          <span v-if="props.docente.asignatura" class="badge badge-primary materia-codigo">
            {{ props.docente.asignatura.codigo }}
          </span>
        </div>

        <div v-if="props.docente.asignatura" class="materia-detalles">
          <div class="materia-stat">
            <span class="stat-num">{{ props.docente.asignatura.creditos }}</span>
            <span class="stat-lbl">Créditos</span>
          </div>
          <div class="materia-divider"></div>
          <div class="materia-stat">
            <span class="stat-num">{{ props.docente.asignatura.horasSemanales }}h</span>
            <span class="stat-lbl">Carga Semanal</span>
          </div>
          <div class="materia-divider"></div>
          <div class="materia-stat">
            <span class="stat-status" :class="props.docente.asignatura.activo ? 'status-activa' : 'status-inactiva'">
              {{ props.docente.asignatura.activo ? '● Materia Activa' : '○ Materia Inactiva' }}
            </span>
            <span class="stat-lbl">Estado Curricular</span>
          </div>
        </div>

        <p v-if="props.docente.asignatura?.descripcion" class="materia-desc">
          {{ props.docente.asignatura.descripcion }}
        </p>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" @click="emit('cerrar')">
          Cerrar Ficha
        </button>
        <button type="button" class="btn btn-primary" @click="emit('editar', props.docente)">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          <span>Editar o Reasignar</span>
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
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.docente-header-info {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.docente-avatar-lg {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);
  flex-shrink: 0;
}

.header-badges {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.4rem;
}

.modal-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.2rem;
}

.modal-subtitle {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 1.75rem;
  line-height: 1;
  color: var(--text-muted);
  cursor: pointer;
}

.modal-close-btn:hover {
  color: var(--text-primary);
}

.detalle-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.85rem;
  margin-bottom: 1.25rem;
}

.detalle-card {
  padding: 0.9rem;
  background-color: var(--bg-main);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detalle-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
}

.detalle-valor {
  font-size: 0.925rem;
  font-weight: 600;
  color: var(--text-primary);
  word-break: break-all;
}

.font-mono {
  font-family: monospace;
}

/* Caja de la Materia Asignada */
.materia-box {
  background: linear-gradient(to right, #f8fafc, #eff6ff);
  border: 1px solid #bfdbfe;
  border-radius: var(--radius-md);
  padding: 1.2rem;
  margin-bottom: 1.5rem;
}

.materia-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.85rem;
}

.materia-tag {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--primary);
  letter-spacing: 0.05em;
  display: block;
  margin-bottom: 0.2rem;
}

.materia-titulo {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
}

.materia-codigo {
  font-size: 0.825rem;
  font-weight: 700;
  padding: 0.3rem 0.6rem;
}

.materia-detalles {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: var(--radius-sm);
  padding: 0.75rem 1rem;
  margin-bottom: 0.75rem;
}

.materia-stat {
  flex: 1;
  text-align: center;
}

.stat-num {
  display: block;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-status {
  display: block;
  font-size: 0.85rem;
  font-weight: 700;
}

.status-activa {
  color: var(--success);
}

.status-inactiva {
  color: var(--danger);
}

.stat-lbl {
  font-size: 0.72rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.materia-divider {
  width: 1px;
  height: 28px;
  background-color: #e2e8f0;
}

.materia-desc {
  font-size: 0.825rem;
  color: var(--text-secondary);
  line-height: 1.45;
  margin: 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}
</style>