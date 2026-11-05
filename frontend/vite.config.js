// Importo defineConfig desde Vite y el plugin oficial para soporte de Vue 3
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// Exporto la configuración de Vite para mi aplicación de frontend
export default defineConfig({
  plugins: [
    // Registro el plugin de Vue para compilar los componentes de archivo único (.vue)
    vue(),
  ],
  server: {
    port: 5173,
    // Configuro el proxy inverso para comunicar mi frontend con el backend en desarrollo sin problemas de CORS
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
