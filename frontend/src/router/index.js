// Importo las funciones necesarias desde vue-router
import { createRouter, createWebHistory } from 'vue-router';

// Importo mis vistas principales
import DocentesView from '../views/DocentesView.vue';
import AsignaturasView from '../views/AsignaturasView.vue';

// Defino la lista de rutas accesibles en el panel administrativo
const routes = [
  {
    path: '/',
    redirect: '/docentes',
  },
  {
    path: '/docentes',
    name: 'Docentes',
    component: DocentesView,
    meta: { title: 'Gestión de Docentes' },
  },
  {
    path: '/asignaturas',
    name: 'Asignaturas',
    component: AsignaturasView,
    meta: { title: 'Catálogo de Asignaturas' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/docentes',
  },
];

// Creo la instancia del enrutador en modo HTML5 History
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Actualizo dinámicamente el título del documento según la ruta navegada
router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || 'Portal'} | Panel Administrativo de Docentes`;
  next();
});

// Exporto mi enrutador para registrarlo en main.js
export default router;
