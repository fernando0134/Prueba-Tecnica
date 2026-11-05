<script setup>
// Defino las propiedades para consultar la ficha técnica y detalle de una cuenta de usuario
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  usuario: {
    type: Object,
    default: () => ({}),
  },
});

// Emito el evento de cierre
const emit = defineEmits(['cerrar']);

// Formateo fechas legibles
function formatearFecha(fechaIso) {
  if (!fechaIso) return 'N/A';
  return new Date(fechaIso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>

<template>
  <!-- Modal para consultar la ficha técnica de la cuenta de usuario -->
  <div v-if="props.visible && props.usuario" class="modal-overlay" @click.self="emit('cerrar')">
    <div class="modal-content detalle-modal">
      <div class="modal-header">
        <div class="user-header-info">
          <div class="user-avatar-lg" :class="props.usuario.rol === 'ADMIN' ? 'avatar-admin' : 'avatar-coord'">
            {{ props.usuario.nombre?.charAt(0) || 'U' }}
          </div>
          <div>
            <div class="header-badges">
              <span class="badge" :class="props.usuario.rol === 'ADMIN' ? 'badge-primary' : 'badge-warning'">
                {{ props.usuario.rol === 'ADMIN' ? '👑 ADMINISTRADOR' : '📋 COORDINADOR' }}
              </span>
              <span class="badge" :class="props.usuario.activo ? 'badge-success' : 'badge-danger'">
                {{ props.usuario.activo ? '● Cuenta Activa' : '○ Cuenta Suspendida' }}
              </span>
            </div>
            <h2 class="modal-title">{{ props.usuario.nombre }}</h2>
            <p class="modal-subtitle">ID de Cuenta Institucional: #{{ props.usuario.id }}</p>
          </div>
        </div>
        <button class="modal-close-btn" @click="emit('cerrar')" aria-label="Cerrar">&times;</button>
      </div>

      <!-- Datos de contacto y acceso -->
      <div class="detalle-grid">
        <div class="detalle-card">
          <span class="detalle-label">Correo Electrónico</span>
          <span class="detalle-valor">{{ props.usuario.email }}</span>
        </div>
        <div class="detalle-card">
          <span class="detalle-label">Nivel de Acceso</span>
          <span class="detalle-valor">{{ props.usuario.rol }}</span>
        </div>
      </div>

      <!-- Fechas de registro y auditoría -->
      <div class="detalle-grid">
        <div class="detalle-card">
          <span class="detalle-label">Fecha de Alta en el Sistema</span>
          <span class="detalle-valor">{{ formatearFecha(props.usuario.createdAt) }}</span>
        </div>
        <div class="detalle-card">
          <span class="detalle-label">Última Modificación</span>
          <span class="detalle-valor">{{ formatearFecha(props.usuario.updatedAt) }}</span>
        </div>
      </div>

      <!-- Privilegios autorizados para este rol -->
      <div class="permisos-box">
        <h4 class="permisos-titulo">Privilegios y Autorizaciones del Rol</h4>
        <ul v-if="props.usuario.rol === 'ADMIN'" class="permisos-lista">
          <li>✅ Control total del sistema y gobernanza de cuentas.</li>
          <li>✅ Eliminación de registros de docentes y asignaturas.</li>
          <li>✅ Gestión y modificación del estado activo de asignaturas.</li>
          <li>✅ Habilitar o suspender cuentas de coordinadores.</li>
        </ul>
        <ul v-else class="permisos-lista">
          <li>✅ Planificación académica y registro de docentes.</li>
          <li>✅ Asignación y reasignación de asignaturas activas a profesores.</li>
          <li>✅ Consulta del catálogo de materias y sus horas.</li>
          <li>✅ Exportación de nóminas a Excel e impresión de reportes oficiales.</li>
          <li>❌ Sin acceso a eliminación física ni a administración de cuentas.</li>
        </ul>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" @click="emit('cerrar')">
          Cerrar Ficha
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detalle-modal {
  max-width: 580px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 1rem;
}

.user-header-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar-lg {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 800;
  flex-shrink: 0;
}

.avatar-admin {
  background: linear-gradient(135deg, var(--primary), #1e40af);
}

.avatar-coord {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.header-badges {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.2;
}

.modal-subtitle {
  font-size: 0.775rem;
  color: var(--text-muted);
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
  grid-template-columns: 1fr 1fr;
  gap: 0.875rem;
  margin-bottom: 0.875rem;
}

.detalle-card {
  background-color: #f8fafc;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0.875rem 1rem;
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
  font-size: 0.925rem;
  font-weight: 700;
  color: var(--text-primary);
}

.permisos-box {
  background-color: #f8fafc;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1rem;
  margin-top: 1rem;
  margin-bottom: 1.25rem;
}

.permisos-titulo {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.permisos-lista {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.825rem;
  color: var(--text-secondary);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid var(--border-color);
  padding-top: 1rem;
}
</style>
