<script setup>
// Defino los enlaces de navegación activa y el servicio de autenticación
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { authService } from '../services/authService';

const route = useRoute();
const router = useRouter();

// Cierro la sesión y redirijo a la pantalla de login
function cerrarSesion() {
  authService.logout();
  router.push('/login');
}
</script>

<template>
  <!-- Barra de navegación superior con soporte de identidad de usuario y roles -->
  <header class="admin-navbar">
    <div class="navbar-container">
      <div class="navbar-brand">
        <div class="brand-icon">
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

      <!-- Menú de navegación visible sólo si el usuario está autenticado -->
      <nav v-if="authService.estaAutenticado.value" class="navbar-nav">
        <RouterLink 
          to="/docentes" 
          class="nav-item" 
          :class="{ 'active': route.path === '/docentes' || route.path === '/' }"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
          </svg>
          <span>Docentes</span>
        </RouterLink>

        <RouterLink 
          to="/asignaturas" 
          class="nav-item" 
          :class="{ 'active': route.path === '/asignaturas' }"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          <span>Asignaturas (Materias)</span>
        </RouterLink>
      </nav>

      <!-- Bloque de usuario autenticado con rol y botón de desconexión -->
      <div v-if="authService.estaAutenticado.value" class="user-block">
        <div class="user-info">
          <span class="user-name">{{ authService.usuario.value?.nombre }}</span>
          <span 
            class="badge" 
            :class="authService.esAdmin.value ? 'badge-primary' : 'badge-warning'"
          >
            {{ authService.usuario.value?.rol }}
          </span>
        </div>

        <button class="btn btn-secondary btn-logout" @click="cerrarSesion" title="Cerrar Sesión">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span>Salir</span>
        </button>
      </div>

      <!-- Estado cuando está en la pantalla de Login -->
      <div v-else class="navbar-status">
        <span class="status-indicator-dot"></span>
        <span class="status-indicator-text">API Conectada</span>
      </div>
    </div>
  </header>
</template>

<style scoped>
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

.user-block {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.2rem;
}

.user-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-primary);
}

.btn-logout {
  padding: 0.45rem 0.75rem;
  font-size: 0.8rem;
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

@media (max-width: 800px) {
  .navbar-container {
    flex-direction: column;
    align-items: stretch;
  }
  .user-block {
    justify-content: space-between;
  }
}
</style>
