<script setup>
// Defino los enlaces de navegación activa utilizando Vue Router
import { RouterLink, useRoute } from 'vue-router';

// Obtengo la ruta actual para aplicar estilos al enlace activo
const route = useRoute();
</script>

<template>
  <!-- Creo la barra de navegación superior con diseño administrativo -->
  <header class="admin-navbar">
    <div class="navbar-container">
      <div class="navbar-brand">
        <div class="brand-icon">
          <!-- Ícono académico SVG -->
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
        </div>
        <div>
          <h1 class="brand-title">Portal Docente</h1>
          <p class="brand-subtitle">Gestión Académica Institucional</p>
        </div>
      </div>

      <!-- Menú de navegación principal entre Docentes y Asignaturas -->
      <nav class="navbar-nav">
        <RouterLink 
          to="/docentes" 
          class="nav-item" 
          :class="{ 'active': route.path === '/docentes' || route.path === '/' }"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span>Docentes</span>
        </RouterLink>

        <RouterLink 
          to="/asignaturas" 
          class="nav-item" 
          :class="{ 'active': route.path === '/asignaturas' }"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          <span>Asignaturas (Materias)</span>
        </RouterLink>
      </nav>

      <!-- Indicador de conexión con el backend -->
      <div class="navbar-status">
        <span class="status-indicator-dot"></span>
        <span class="status-indicator-text">API Conectada</span>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* Estilos con los que doy formato al encabezado del portal */
.admin-navbar {
  background-color: #ffffff;
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
}

.navbar-container {
  max-width: 1300px;
  margin: 0 auto;
  padding: 0.875rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.brand-icon {
  background: linear-gradient(135deg, var(--primary), #1d4ed8);
  color: #ffffff;
  width: 42px;
  height: 42px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.25);
}

.brand-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.2;
}

.brand-subtitle {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 500;
}

.navbar-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #f1f5f9;
  padding: 0.3rem;
  border-radius: var(--radius-md);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
}

.nav-item:hover {
  color: var(--text-primary);
}

.nav-item.active {
  background-color: #ffffff;
  color: var(--primary);
  box-shadow: var(--shadow-sm);
}

.navbar-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  background-color: var(--success-light);
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-full);
}

.status-indicator-dot {
  width: 8px;
  height: 8px;
  background-color: var(--success);
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}

@media (max-width: 768px) {
  .navbar-container {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  .navbar-status {
    display: none;
  }
}
</style>
