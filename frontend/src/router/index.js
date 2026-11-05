// Importo las funciones necesarias desde vue-router y mi servicio de autenticación
import { createRouter, createWebHistory } from 'vue-router';
import { authService } from '../services/authService';

// Importo mis vistas principales
import DocentesView from '../views/DocentesView.vue';
import AsignaturasView from '../views/AsignaturasView.vue';
import LoginView from '../views/LoginView.vue';

// Defino la lista de rutas con sus respectivos requerimientos de autenticación
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
    meta: { title: 'Catálogo de Asignaturas', requiresAuth: true },
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

// Implemento el guardián de navegación para proteger rutas administrativas
router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || 'Portal'} | Panel Administrativo`;

  const estaAutenticado = authService.estaAutenticado.value;

  // Si la ruta requiere autenticación y el usuario no ha iniciado sesión, redirijo al login
  if (to.meta.requiresAuth && !estaAutenticado) {
    return next({ path: '/login' });
  }

  // Si el usuario ya está autenticado e intenta ir a /login, lo llevo a /docentes
  if (to.meta.requiresGuest && estaAutenticado) {
    return next({ path: '/docentes' });
  }

  next();
});

// Exporto mi enrutador
export default router;
