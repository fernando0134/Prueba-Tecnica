<script setup>
// Defino las propiedades que recibo para calcular y mostrar las métricas administrativas
const props = defineProps({
  totalDocentes: {
    type: Number,
    default: 0,
  },
  totalAsignaturas: {
    type: Number,
    default: 0,
  },
  promedioExperiencia: {
    type: Number,
    default: 0,
  },
  asignaturasActivas: {
    type: Number,
    default: 0,
  },
});
</script>

<template>
  <!-- Renderizo la cuadrícula de métricas del panel administrativo -->
  <div class="stats-grid">
    <!-- Métrica: Total de Docentes -->
    <div class="stat-card">
      <div class="stat-icon icon-blue">
        <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      </div>
      <div class="stat-info">
        <span class="stat-label">Docentes Registrados</span>
        <h3 class="stat-value">{{ props.totalDocentes }}</h3>
      </div>
    </div>

    <!-- Métrica: Total de Asignaturas -->
    <div class="stat-card">
      <div class="stat-icon icon-emerald">
        <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      </div>
      <div class="stat-info">
        <span class="stat-label">Asignaturas (Materias)</span>
        <h3 class="stat-value">{{ props.totalAsignaturas }}</h3>
      </div>
    </div>

    <!-- Métrica: Promedio de Experiencia Docente -->
    <div class="stat-card">
      <div class="stat-icon icon-amber">
        <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="8" r="7"/>
          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
        </svg>
      </div>
      <div class="stat-info">
        <span class="stat-label">Promedio Experiencia</span>
        <h3 class="stat-value">{{ props.promedioExperiencia }} <span class="stat-unit">años</span></h3>
      </div>
    </div>

    <!-- Métrica: Asignaturas en impartición -->
    <div class="stat-card">
      <div class="stat-icon icon-violet">
        <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      </div>
      <div class="stat-info">
        <span class="stat-label">Materias Activas</span>
        <h3 class="stat-value">{{ props.asignaturasActivas }}</h3>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Cuadrícula de tarjetas de estadísticas */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.stat-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-blue {
  background-color: #dbeafe;
  color: #1d4ed8;
}

.icon-emerald {
  background-color: #d1fae5;
  color: #047857;
}

.icon-amber {
  background-color: #fef3c7;
  color: #b45309;
}

.icon-violet {
  background-color: #ede9fe;
  color: #6d28d9;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.stat-value {
  font-size: 1.625rem;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.2;
  margin-top: 0.25rem;
}

.stat-unit {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-muted);
}
</style>
