// Importo la función createApp desde el núcleo de Vue 3
import { createApp } from 'vue';

// Importo mi componente raíz App
import App from './App.vue';

// Importo mi enrutador configurado con Vue Router
import router from './router';

// Importo los estilos globales y variables administrativas
import './assets/styles/main.css';

// Inicializo mi aplicación Vue 3
const app = createApp(App);

// Registro el plugin de Vue Router en mi aplicación
app.use(router);

// Monto mi aplicación en el elemento raíz del DOM (#app)
app.mount('#app');
