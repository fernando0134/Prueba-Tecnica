// Importo las funciones necesarias desde vue-router y mi servicio de autenticación
import { createRouter, createWebHistory } from 'vue-router';
import { authService } from '../services/authService';

// Importo mis vistas principales
import DocentesView from '../views/DocentesView.vue';
import AsignaturasView from '../views/AsignaturasView.vue';
import UsuariosView from '../views/UsuariosView.vue';
import LoginView from '../views/LoginView.vue';

// Defino la lista de rutas con sus respectivos requerimientos de autenticación y roles
const routes = [
  {
    path: '/',
    redirect: '/docentes',
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { title: 'Iniciar Sesión', requiresGuest: true },
  },
  {
    path: '/docentes',
    name: 'Docentes',
    component: DocentesView,
    meta: { title: 'Gestión de Docentes', requiresAuth: true },
  },
  {
    path: '/asignaturas',
    name: 'Asignaturas',
    component: AsignaturasView,
    meta: { title: 'Gestión de Asignaturas', requiresAuth: true },
  },
  {
    path: '/usuarios',
    name: 'Usuarios',
    component: UsuariosView,
    meta: { title: 'Gobernanza y Usuarios', requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/docentes',
  },
];

// Creo la instancia del enrutador
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Implemento el guardián de navegación para proteger rutas y verificar roles
router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || 'Portal'} | Panel Administrativo`;

  const estaAutenticado = authService.estaAutenticado.value;
  const esAdmin = authService.esAdmin.value;

  // Redirijo al login si la ruta requiere sesión activa
  if (to.meta.requiresAuth && !estaAutenticado) {
    return next({ path: '/login' });
  }

  // Si requiere rol ADMIN y el usuario es COORDINADOR, lo redirijo a /docentes
  if (to.meta.requiresAdmin && !esAdmin) {
    return next({ path: '/docentes' });
  }

  // Si ya tiene sesión activa e intenta ir al login, lo dirijo al dashboard
  if (to.meta.requiresGuest && estaAutenticado) {
    return next({ path: '/docentes' });
  }

  next();
});

// Exporto mi enrutador
export default router;
