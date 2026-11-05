<script setup>
// Importo RouterView para renderizar la vista actual según la ruta
import { RouterView } from 'vue-router';

// Importo mi barra de navegación administrativa
import Navbar from './components/Navbar.vue';
</script>

<template>
  <!-- Contenedor principal de toda la aplicación -->
  <div class="app-container">
    <!-- Barra superior de navegación y estado -->
    <Navbar />

    <!-- Área de contenido dinámico donde se inyectan las vistas -->
    <main class="main-content">
      <RouterView />
    </main>

    <!-- Pie de página institucional administrativo -->
    <footer class="admin-footer">
      <div class="footer-container">
        <p>© 2026 Sistema de Gestión Académica y Control Docente • Universidad Institucional</p>
        <p class="footer-tech">Frontend en Vue.js 3 + Backend Node.js / Express / Sequelize ORM</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Estilos para el pie de página institucional */
.admin-footer {
  background-color: #ffffff;
  border-top: 1px solid var(--border-color);
  padding: 1.5rem 0;
  margin-top: auto;
}

.footer-container {
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: var(--text-muted);
  flex-wrap: wrap;
  gap: 0.5rem;
}

.footer-tech {
  font-weight: 600;
  color: var(--primary);
}
</style>
