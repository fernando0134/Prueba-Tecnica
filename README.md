# Sistema de Gestión de Docentes y Asignaturas 🎓

Plataforma Fullstack integral con temática administrativa académica para la gestión y control docente. Desarrollada con un **Backend en Node.js, Express.js y Sequelize ORM**, y un **Frontend moderno en Vue.js 3 (Composition API) con Vite y Vue Router**.

---

## 📋 Tabla de Contenidos

1. [Visión General del Proyecto](#-visión-general-del-proyecto)
2. [Arquitectura del Sistema](#-arquitectura-del-sistema)
   - [Estructura del Frontend (Vue.js 3)](#-estructura-del-frontend-vuejs-3)
   - [Estructura del Backend (Node.js & Express)](#-estructura-del-backend-nodejs--express)
3. [Funcionalidades de la Aplicación Frontend](#-funcionalidades-de-la-aplicación-frontend)
4. [Estrategia de Base de Datos y Comportamiento de Tablas (`DROP TABLE IF EXISTS`)](#-estrategia-de-base-de-datos-y-comportamiento-de-tablas)
5. [Instrucciones de Ejecución Paso a Paso](#-instrucciones-de-ejecución-paso-a-paso)
   - [Paso 1: Levantar el Backend](#paso-1-levantar-el-backend)
   - [Paso 2: Levantar el Frontend](#paso-2-levantar-el-frontend)
   - [Comandos Rápidos desde la Raíz](#comandos-rápidos-desde-la-raíz)
6. [Catálogo de la API RESTful](#-catálogo-de-la-api-restful)
7. [Buenas Prácticas Aplicadas](#-buenas-prácticas-aplicadas)

---

## 🌟 Visión General del Proyecto

He desarrollado esta solución pensando en los estándares de un panel administrativo institucional universitario, permitiendo a los coordinadores y administradores:
- Visualizar el cuadro docente con sus asignaturas asignadas.
- Contratar/Registrar nuevos docentes asociándoles su materia de especialidad.
- Consultar las asignaturas disponibles en el plan de estudios y dar de alta nuevas asignaturas.
- Reasignar o cambiar la materia de enseñanza de cualquier docente de forma interactiva.
- Editar la información académica o eliminar docentes de la base de datos con confirmación de seguridad.
- Visualizar métricas en tiempo real (total docentes, total materias, promedio de años de experiencia y materias activas).

---

## 🏗️ Arquitectura del Sistema

El repositorio se divide limpiamente en dos módulos independientes:

```text
Prueba-Tecnica/
├── backend/                  # API RESTful con Express y Sequelize
├── frontend/                 # Aplicación SPA con Vue.js 3 y Vite
├── package.json              # Scripts orquestadores del proyecto completo
└── README.md                 # Documentación técnica general
```

### 💻 Estructura del Frontend (`Vue.js 3`)

```text
frontend/
├── src/
│   ├── assets/
│   │   └── styles/
│   │       └── main.css            # Estilos globales, variables CSS y diseño administrativo
│   ├── components/
│   │   ├── Navbar.vue              # Encabezado institucional con indicador de conexión a la API
│   │   ├── StatsOverview.vue       # Tarjetas de estadísticas y métricas docentes
│   │   ├── DocenteModal.vue        # Formulario modal para crear, editar y reasignar asignaturas
│   │   ├── AsignaturaModal.vue     # Formulario modal para crear nuevas materias
│   │   ├── ConfirmModal.vue        # Diálogo modal de confirmación para eliminaciones
│   │   └── ToastNotification.vue   # Alertas flotantes (éxito y error)
│   ├── views/
│   │   ├── DocentesView.vue        # Vista principal: tabla de docentes, filtros, búsqueda y acciones
│   │   └── AsignaturasView.vue     # Vista de catálogo de asignaturas con sus docentes asignados
│   ├── services/
│   │   ├── api.js                  # Cliente HTTP centralizado basado en fetch
│   │   ├── docenteService.js       # Operaciones de red para docentes
│   │   └── asignaturaService.js    # Operaciones de red para asignaturas
│   ├── router/
│   │   └── index.js                # Enrutador Vue Router (/docentes, /asignaturas)
│   ├── App.vue                     # Layout principal con navegación y footer
│   └── main.js                     # Inicialización y montaje de Vue 3
├── index.html                      # Punto de entrada HTML con tipografía Inter / Plus Jakarta Sans
├── vite.config.js                  # Configuración de Vite con proxy inverso para /api
└── package.json                    # Dependencias de Vue 3, Vue Router y Vite
```

### ⚙️ Estructura del Backend (`Node.js & Express`)

```text
backend/
├── src/
│   ├── config/database.js          # Conexión Sequelize con SQLite (compatible con PostgreSQL)
│   ├── models/                     # Modelos Docente y Asignatura con asociaciones 1:N
│   ├── controllers/                # Lógica CRUD de asignaturas y docentes
│   ├── routes/                     # Enrutadores Express modulares y Health Check
│   ├── middlewares/                # Validadores de entrada y manejador global de errores
│   ├── seeders/seed.js             # Sembrado de datos con reseteo (DROP TABLE IF EXISTS)
│   ├── app.js                      # Configuración de Express y CORS
│   └── server.js                   # Inicio del servidor HTTP
├── test-suite.js                   # Batería de 10 pruebas automatizadas
├── .env                            # Variables de entorno activas
└── package.json                    # Dependencias y scripts
```

---

## 🎯 Funcionalidades de la Aplicación Frontend

1. **Visualizar la lista de docentes registrados:**
   - Muestra tabla con avatar generado, nombre completo, correo, teléfono, título académico y años de experiencia.
   - Muestra una tarjeta distintiva de la **asignatura de enseñanza asignada** con su código y créditos.
   - Búsqueda en tiempo real por texto (nombre, apellido, email, título) y selector para filtrar por materia específica.

2. **Registrar un nuevo docente:**
   - Botón *"Registrar Nuevo Docente"* en el encabezado.
   - Modal con validación defensiva en el cliente: nombre, apellidos, email (con validación de formato), teléfono opcional, título académico y años de experiencia.
   - **Selector obligatorio de asignatura asignada**, cargado dinámicamente desde la base de datos.

3. **Consultar y crear asignaturas (materias):**
   - Vista dedicada en `/asignaturas` con tarjetas de cada materia, código oficial, créditos, horas semanales y lista de docentes que la imparten.
   - Modal *"Crear Nueva Asignatura"* con validación de código único, nombre, créditos y horas.

4. **Asignar o cambiar la asignatura de enseñanza:**
   - Botón de acción *"Editar / Cambiar Materia"* en cada fila de docente.
   - Permite al usuario modificar cualquier dato personal o seleccionar una nueva materia en el dropdown para reasignarlo inmediatamente.

5. **Editar y Eliminar docentes:**
   - Edición completa desde el modal interactivo.
   - Botón de eliminación con modal de confirmación antes de impactar físicamente la base de datos.
   - Notificaciones Toast en la esquina inferior derecha para confirmar el resultado de cada operación.

---

## 🗄️ Estrategia de Base de Datos y Comportamiento de Tablas

He implementado una diferenciación clara entre el modo de sembrado y el modo de operación normal:

1. **Modo Reinicio / Sembrado (`npm run seed:backend` o `npm run seed`):**
   - En [`backend/src/seeders/seed.js`](file:///c:/Users/Estudiante/Desktop/Prueba-Tecnica/backend/src/seeders/seed.js) ejecuto `await sequelize.sync({ force: true })`.
   - **Esto ejecuta internamente el `DROP TABLE IF EXISTS`**:
     ```sql
     DROP TABLE IF EXISTS `docentes`;
     DROP TABLE IF EXISTS `asignaturas`;
     CREATE TABLE IF NOT EXISTS `asignaturas` (...);
     CREATE TABLE IF NOT EXISTS `docentes` (...);
     ```
   - Reinicia la base de datos dejando tablas limpias y pre-poblando 5 materias y 4 docentes de prueba.

2. **Modo Normal del Servidor (`npm run dev:backend` o `npm start`):**
   - En [`backend/src/server.js`](file:///c:/Users/Estudiante/Desktop/Prueba-Tecnica/backend/src/server.js) ejecuto `await sequelize.sync({ alter: false })`.
   - **Utiliza `CREATE TABLE IF NOT EXISTS`**, garantizando que **no se borren** los docentes ni asignaturas cuando apagues o reinicies el servidor.

---

## 🚀 Instrucciones de Ejecución Paso a Paso

### Paso 1: Levantar el Backend

En una primera terminal:

```bash
# 1. Acceder al directorio backend
cd backend

# 2. Instalar dependencias (Express, Sequelize, SQLite3, CORS, etc.)
npm install

# 3. Poblar la base de datos inicial (aplica DROP TABLE IF EXISTS y genera datos limpios)
npm run seed

# 4. Iniciar el servidor backend en desarrollo
npm run dev
```

> 🟢 El backend quedará escuchando en `http://localhost:3000`.

---

### Paso 2: Levantar el Frontend

En una segunda terminal:

```bash
# 1. Acceder al directorio frontend
cd frontend

# 2. Instalar dependencias (Vue 3, Vue Router, Vite)
npm install

# 3. Iniciar el servidor de desarrollo Vite
npm run dev
```

> 🌐 El frontend se abrirá en tu navegador en: **`http://localhost:5173`**

---

### ⚡ Comandos Rápidos desde la Raíz del Proyecto

Si prefieres ejecutar desde la carpeta raíz `Prueba-Tecnica/`:

```bash
# Sembrar la base de datos con datos de prueba
npm run seed:backend

# Ejecutar las pruebas unitarias del backend (10/10 pasando)
npm run test:backend

# Iniciar el backend
npm run dev:backend

# Iniciar el frontend
npm run dev:frontend

# Compilar el frontend para producción
npm run build:frontend
```

---

## 📡 Catálogo de la API RESTful

La API se encuentra en `http://localhost:3000/api` y cuenta con los siguientes endpoints:

### Docentes (`/api/docentes`)
- `GET /api/docentes` - Lista todos los docentes junto a su materia asignada.
- `GET /api/docentes/:id` - Detalle de un docente específico con su asignatura.
- `POST /api/docentes` - Crea un docente validando que la materia asignada exista.
- `PUT /api/docentes/:id` - Actualiza datos y permite reasignar la materia (`asignaturaId`).
- `DELETE /api/docentes/:id` - Elimina un docente de la base de datos.

### Asignaturas (`/api/asignaturas`)
- `GET /api/asignaturas` - Lista las asignaturas junto a sus docentes asignados.
- `GET /api/asignaturas/:id` - Detalle de una asignatura.
- `POST /api/asignaturas` - Crea una nueva materia con código único.
- `PUT /api/asignaturas/:id` - Actualiza información de la materia.
- `DELETE /api/asignaturas/:id` - Elimina una materia (protegida si tiene docentes activos).

### Health Check
- `GET /api/health` - Comprueba que la API esté 100% activa.

---

## 🛡️ Buenas Prácticas Aplicadas

1. **Documentación en primera persona**: El 100% del código fuente tanto en el Backend como en el Frontend contiene comentarios redactados en primera persona (*"Inicializo...", "Defino...", "Valido...", "Obtengo..."*).
2. **Arquitectura modular por componentes**: Separación nítida en componentes reutilizables (`Navbar`, `StatsOverview`, `DocenteModal`, `AsignaturaModal`, `ConfirmModal`, `ToastNotification`).
3. **Manejo de estados de carga y retroalimentación**: Spinners de carga, vistas de estado vacío y notificaciones Toast contextuales.
4. **Validaciones en ambos lados**: Validación defensiva en cliente para prevenir llamadas innecesarias y validaciones de integridad referencial en el backend con Sequelize.
5. **Proxy inverso en Vite**: Configuración de proxy para `/api` evitando bloqueos de origen cruzado en entorno de desarrollo.
