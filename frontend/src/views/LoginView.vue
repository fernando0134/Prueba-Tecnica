<script setup>
// Importo utilidades reactivas desde Vue y el enrutador
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../services/authService';

const router = useRouter();

// Estado del formulario de inicio de sesión
const email = ref('');
const password = ref('');
const cargando = ref(false);
const errorMensaje = ref('');

// Proceso el inicio de sesión
async function manejarLogin() {
  errorMensaje.value = '';

  if (!email.value.trim() || !password.value.trim()) {
    errorMensaje.value = 'Por favor completa todos los campos.';
    return;
  }

  cargando.value = true;
  try {
    await authService.login(email.value.trim(), password.value);
    // Redirijo al dashboard docente tras iniciar sesión exitosamente
    router.push('/docentes');
  } catch (error) {
    errorMensaje.value = error.message || 'Error al autenticar credenciales.';
  } finally {
    cargando.value = false;
  }
}

// Botones de acceso rápido para pruebas inmediatas de roles
function rellenarCredenciales(tipo) {
  if (tipo === 'admin') {
    email.value = 'admin@universidad.edu';
    password.value = 'Admin123*';
  } else {
    email.value = 'coordinador@universidad.edu';
    password.value = 'Coord123*';
  }
  manejarLogin();
}
</script>

<template>
  <div class="login-wrapper">
    <div class="login-card card">
      <div class="login-header">
        <div class="login-icon">
          <svg viewBox="0 0 24 24" width="30" height="30" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <h2 class="login-title">Control de Acceso</h2>
        <p class="login-subtitle">Sistema de Gestión de Docentes y Asignaturas</p>
      </div>

      <!-- Alerta de error -->
      <div v-if="errorMensaje" class="login-alert">
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>{{ errorMensaje }}</span>
      </div>

      <form @submit.prevent="manejarLogin" novalidate>
        <div class="form-group">
          <label class="form-label" for="login-email">Correo Electrónico Institucional</label>
          <input 
            id="login-email" 
            v-model="email" 
            type="email" 
            class="form-input" 
            placeholder="admin@universidad.edu"
            autocomplete="email"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="login-pass">Contraseña</label>
          <input 
            id="login-pass" 
            v-model="password" 
            type="password" 
            class="form-input" 
            placeholder="••••••••"
            autocomplete="current-password"
          />
        </div>

        <button type="submit" class="btn btn-primary btn-block" :disabled="cargando">
          <span v-if="cargando">Verificando credenciales...</span>
          <span v-else>Iniciar Sesión</span>
        </button>
      </form>

      <!-- Accesos rápidos demostrativos para pruebas -->
      <div class="demo-section">
        <div class="demo-divider">
          <span>O ingresar con cuentas de prueba:</span>
        </div>
        <div class="demo-buttons">
          <button type="button" class="btn btn-secondary demo-btn" @click="rellenarCredenciales('admin')">
            <span class="badge badge-primary">ADMIN</span>
            <span>Acceso Administrador</span>
          </button>
          <button type="button" class="btn btn-secondary demo-btn" @click="rellenarCredenciales('coord')">
            <span class="badge badge-warning">COORD</span>
            <span>Acceso Coordinador</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-wrapper {
  min-height: calc(100vh - 120px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
}

.login-card {
  width: 100%;
  max-width: 440px;
  padding: 2.25rem 2rem;
  box-shadow: var(--shadow-lg);
}

.login-header {
  text-align: center;
  margin-bottom: 1.75rem;
}

.login-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, var(--primary), #1d4ed8);
  color: #ffffff;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);
}

.login-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--text-primary);
}

.login-subtitle {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.login-alert {
  background-color: var(--danger-light);
  color: var(--danger);
  border: 1px solid #fecaca;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-block {
  width: 100%;
  padding: 0.75rem;
  font-size: 0.95rem;
  margin-top: 0.5rem;
}

.demo-section {
  margin-top: 2rem;
  border-top: 1px dashed var(--border-color);
  padding-top: 1.25rem;
}

.demo-divider {
  text-align: center;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.875rem;
}

.demo-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.demo-btn {
  justify-content: flex-start;
  font-size: 0.8rem;
  padding: 0.5rem 0.875rem;
}
</style>
