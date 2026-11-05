# Sistema de Gestión de Docentes y Asignaturas 🎓

Plataforma Fullstack integral con temática administrativa académica para la gestión y control docente. Desarrollada con un **Backend en Node.js, Express.js y Sequelize ORM**, y un **Frontend moderno en Vue.js 3 (Composition API) con Vite y Vue Router**.

---

## 📋 Tabla de Contenidos

1. [Visión General del Proyecto](#-visión-general-del-proyecto)
2. [Seguridad y Control de Acceso (Autenticación & Roles)](#-seguridad-y-control-de-acceso-autenticación--roles)
3. [Reglas de Negocio Institucionales](#-reglas-de-negocio-institucionales)
4. [Módulo de Reportes y Exportación de Datos](#-módulo-de-reportes-y-exportación-de-datos)
5. [Estructura del Proyecto](#-estructura-del-proyecto)
6. [Estrategia de Base de Datos y Comportamiento de Tablas (`DROP TABLE IF EXISTS`)](#-estrategia-de-base-de-datos-y-comportamiento-de-tablas)
7. [Instrucciones de Ejecución Paso a Paso](#-instrucciones-de-ejecución-paso-a-paso)
   - [Credenciales de Prueba Preconfiguradas](#credenciales-de-prueba-preconfiguradas)
   - [Paso 1: Levantar el Backend](#paso-1-levantar-el-backend)
   - [Paso 2: Levantar el Frontend](#paso-2-levantar-el-frontend)
   - [Comandos Rápidos desde la Raíz](#comandos-rápidos-desde-la-raíz)
8. [Catálogo Completo de la API RESTful](#-catálogo-completo-de-la-api-restful)
9. [Buenas Prácticas Aplicadas](#-buenas-prácticas-aplicadas)

---

## 🌟 Visión General del Proyecto

He desarrollado esta solución pensando en los estándares de un panel administrativo institucional universitario, permitiendo a los coordinadores y administradores:
- Visualizar el cuadro docente con sus asignaturas asignadas.
- Contratar/Registrar nuevos docentes asociándoles su materia de especialidad.
- Consultar las asignaturas disponibles en el plan de estudios y dar de alta nuevas asignaturas.
- Reasignar o cambiar la materia de enseñanza de cualquier docente de forma interactiva.
- Editar la información académica o eliminar docentes de la base de datos con confirmación de seguridad.
- Exportar la nómina docente a formatos estándar de oficina (Excel/CSV y PDF).

---

## 🔐 Seguridad y Control de Acceso (Autenticación & Roles)

He implementado un sistema robusto de autenticación y autorización basado en **JSON Web Tokens (JWT)** y contraseñas cifradas mediante **bcryptjs**:

- **Autenticación JWT:** Cada petición que modifica el estado institucional (`POST`, `PUT`, `DELETE`) requiere una cabecera `Authorization: Bearer <token>`.
- **Control de Acceso Basado en Roles (RBAC):**
  - **`ADMIN`:** Control total del sistema. Es el único rol facultado para **eliminar docentes y materias** de la base de datos.
  - **`COORDINADOR`:** Facultado para dar de alta docentes, reasignar materias de enseñanza y crear asignaturas en el plan de estudios, pero con restricciones para eliminar registros.
- **Guardianes de Ruta en Vue Router (`beforeEach`):** Protege las vistas del frontend redirigiendo automáticamente a la pantalla de login si el usuario no cuenta con una sesión válida.

---

## 📚 Reglas de Negocio Institucionales

He blindado tanto el backend como el frontend con las siguientes reglas estrictas:

1. **Cada docente pertenece a una asignatura ACTIVA:**
   - No se permite dar de alta ni reasignar a un docente a una asignatura dada de baja o inactiva (`activo === false`).
   - El sistema valida este requisito tanto a nivel de middleware en el frontend como en la capa de controladores de Sequelize.
2. **Restricción de eliminación de asignaturas con docentes:**
   - No es posible eliminar una asignatura si tiene docentes asignados. La API responde con código `400 Bad Request` protegiendo la integridad referencial y académica.
3. **Unicidad de datos clave:**
   - **El correo electrónico del docente es ÚNICO:** No se permiten duplicados en el registro ni en actualizaciones.
   - **El nombre de la asignatura es ÚNICO:** Se valida de forma insensible a mayúsculas/minúsculas en el modelo y en el controlador para evitar materias redundantes.
   - **El código de la asignatura es ÚNICO:** Cada materia posee un identificador curricular irrepetible (ej. `INF-301`).

---

## 📊 Módulo de Reportes y Exportación de Datos

- **Exportación a Excel / CSV (`/api/reportes/docentes/csv`):**
  - Generación dinámica de archivo CSV con codificación **UTF-8 con BOM** (`\uFEFF`) para que Microsoft Excel abra los acentos y caracteres especiales en español a la perfección.
  - Incluye: ID, Nombre, Apellidos, Correo, Teléfono, Título, Años de experiencia, Asignatura asignada, Código, Créditos y Horas.
- **Impresión y Generación de Ficha Académica Oficial (PDF):**
  - Botón *"Imprimir Ficha"* en la interfaz con estilos `@media print` optimizados para generar reportes limpios listos para archivado o firma.
- **Resumen Estadístico Institucional (`/api/reportes/estadisticas`):**
  - Métricas de distribución de docentes por materia y carga académica acumulada.

---

## 🏗️ Estructura del Proyecto

```text
Prueba-Tecnica/
├── backend/
│   ├── src/
│   │   ├── config/database.js          # Conexión Sequelize (SQLite / PostgreSQL)
│   │   ├── models/
│   │   │   ├── Asignatura.js           # Modelo con nombre y código únicos
│   │   │   ├── Docente.js              # Modelo con correo único y relación foránea
│   │   │   ├── Usuario.js              # Modelo de usuarios y roles con hash bcrypt
│   │   │   └── index.js                # Asociaciones relacionales
│   │   ├── controllers/
│   │   │   ├── authController.js       # Registro, login y perfil JWT
│   │   │   ├── asignaturaController.js # CRUD con validaciones de unicidad y regla de eliminación
│   │   │   ├── docenteController.js    # CRUD con regla de pertenencia a materia activa
│   │   │   └── reporteController.js    # Generación de reportes CSV y estadísticas
│   │   ├── middlewares/
│   │   │   ├── auth.js                 # Verificación de JWT y roles (ADMIN, COORDINADOR)
│   │   │   ├── validators.js           # Validadores de entrada
│   │   │   └── errorHandler.js         # Manejo centralizado de excepciones
│   │   ├── routes/
│   │   │   ├── authRoutes.js           # Rutas /api/auth
│   │   │   ├── asignaturaRoutes.js     # Rutas /api/asignaturas protegidas por rol
│   │   │   ├── docenteRoutes.js        # Rutas /api/docentes protegidas por rol
│   │   │   ├── reporteRoutes.js        # Rutas /api/reportes
│   │   │   └── index.js                # Enrutador central
│   │   ├── seeders/seed.js             # Reseteo (DROP TABLE) y precarga de usuarios y catálogo
│   │   ├── app.js                      # Express y CORS
│   │   └── server.js                   # Inicio y sincronización
│   ├── test-suite.js                   # 10 pruebas automatizadas integrales
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/                 # Navbar, DocenteModal, AsignaturaModal, ConfirmModal, Toast
│   │   ├── views/                      # LoginView, DocentesView, AsignaturasView
│   │   ├── services/                   # api.js (inyecta JWT), authService.js, docenteService.js, asignaturaService.js
│   │   ├── router/index.js             # Vue Router con guardianes de navegación
│   │   ├── App.vue
│   │   └── main.js
│   └── vite.config.js                  # Proxy inverso a /api
├── package.json                        # Scripts orquestadores fullstack
└── README.md                           # Documentación completa
```

---

## 🗄️ Estrategia de Base de Datos y Comportamiento de Tablas

1. **Modo Reinicio / Sembrado (`npm run seed:backend` o `npm run seed`):**
   - En [`backend/src/seeders/seed.js`](file:///c:/Users/Estudiante/Desktop/Prueba-Tecnica/backend/src/seeders/seed.js) ejecuto `await sequelize.sync({ force: true })`.
   - **Aplica `DROP TABLE IF EXISTS`**:
     ```sql
     DROP TABLE IF EXISTS `usuarios`;
     DROP TABLE IF EXISTS `docentes`;
     DROP TABLE IF EXISTS `asignaturas`;
     CREATE TABLE IF NOT EXISTS `asignaturas` (...);
     CREATE TABLE IF NOT EXISTS `docentes` (...);
     CREATE TABLE IF NOT EXISTS `usuarios` (...);
     ```
   - Reinicia la base de datos dejando tablas limpias y creando las cuentas administrativas y catálogo inicial.

2. **Modo Normal del Servidor (`npm run dev:backend` o `npm start`):**
   - En [`backend/src/server.js`](file:///c:/Users/Estudiante/Desktop/Prueba-Tecnica/backend/src/server.js) ejecuto `await sequelize.sync({ alter: false })`.
   - **Utiliza `CREATE TABLE IF NOT EXISTS`**, garantizando que **no se borren** los docentes, asignaturas ni usuarios creados.

---

## 🚀 Instrucciones de Ejecución Paso a Paso

### Credenciales de Prueba Preconfiguradas

| Rol | Correo Electrónico | Contraseña | Permisos |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@universidad.edu` | `Admin123*` | Total (Crear, Editar, Reasignar y **Eliminar**) |
| **COORDINADOR** | `coordinador@universidad.edu` | `Coord123*` | Gestión Académica (Crear, Editar, Reasignar) |

*(En la pantalla de Login he incluido botones de 1 clic para acceder con cualquiera de las dos cuentas al instante).*

---

### Paso 1: Levantar el Backend

En una primera terminal:

```bash
cd backend
npm install
npm run seed     # Resetea tablas (DROP TABLE IF EXISTS) y carga usuarios y datos iniciales
npm run dev      # Inicia el servidor en http://localhost:3000
```

---

### Paso 2: Levantar el Frontend

En una segunda terminal:

```bash
cd frontend
npm install
npm run dev      # Inicia el cliente Vue 3 en http://localhost:5173
```

> 🌐 Accede a **`http://localhost:5173`** en tu navegador.

---

### ⚡ Comandos Rápidos desde la Raíz del Proyecto

```bash
npm run seed:backend   # Resetear y sembrar datos de prueba
npm run test:backend   # Ejecutar batería de 10 pruebas automatizadas
npm run dev:backend    # Levantar backend Express
npm run dev:frontend   # Levantar frontend Vue 3
npm run build:frontend # Compilar frontend para producción
```

---

## 📡 Catálogo Completo de la API RESTful

### 1. Autenticación (`/api/auth`)
- `POST /api/auth/register` - Registro de usuario administrativo.
- `POST /api/auth/login` - Inicio de sesión y generación de token JWT.
- `GET /api/auth/perfil` - Consulta del perfil activo (Requiere Bearer Token).

### 2. Docentes (`/api/docentes`)
- `GET /api/docentes` - Listado con información de asignatura activa asignada.
- `GET /api/docentes/:id` - Detalle de docente por ID.
- `POST /api/docentes` - Crear docente (Valida que la asignatura asignada esté activa y email único).
- `PUT /api/docentes/:id` - Actualizar docente y/o reasignar a otra asignatura activa.
- `DELETE /api/docentes/:id` - Eliminar docente (Exclusivo rol `ADMIN`).

### 3. Asignaturas (`/api/asignaturas`)
- `GET /api/asignaturas` - Catálogo completo de materias con sus docentes.
- `GET /api/asignaturas/:id` - Detalle de asignatura.
- `POST /api/asignaturas` - Crear materia (Valida que el nombre y código sean únicos).
- `PUT /api/asignaturas/:id` - Actualizar materia.
- `DELETE /api/asignaturas/:id` - Eliminar materia (Bloqueado si tiene docentes asignados, exclusivo `ADMIN`).

### 4. Reportes (`/api/reportes`)
- `GET /api/reportes/docentes/csv` - Descarga directa del archivo Excel/CSV.
- `GET /api/reportes/estadisticas` - Resumen estadístico de carga académica.

---

## 🛡️ Buenas Prácticas Aplicadas

1. **Documentación en primera persona**: El 100% del código fuente tanto en el Backend como en el Frontend contiene comentarios redactados en primera persona (*"Inicializo...", "Defino...", "Valido...", "Obtengo..."*).
2. **Defensa en profundidad**: Validaciones defensivas tanto en la interfaz de usuario de Vue 3 como en los middlewares de Express y modelos de Sequelize.
3. **Control granular de roles (RBAC)**: Autorización en endpoints críticos para salvaguardar la consistencia académica.
4. **Formato nativo de exportación**: Codificación con BOM para integración directa con suites ofimáticas sin problemas de codificación.
