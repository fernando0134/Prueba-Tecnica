# Sistema de Gestión de Docentes y Asignaturas 🎓

Proyecto Fullstack compuesto por una **API RESTful** en el backend construida con **Node.js**, **Express.js** y **Sequelize ORM**, diseñada y estructurada para integrarse con un frontend en **Vue.js 3**.

---

## 📋 Tabla de Contenidos

1. [Características Principales](#-características-principales)
2. [Estructura del Proyecto](#-estructura-del-proyecto)
3. [Estrategia de Base de Datos y Comportamiento de Tablas](#-estrategia-de-base-de-datos-y-comportamiento-de-tablas)
4. [Requisitos Previos](#-requisitos-previos)
5. [Instrucciones de Ejecución Paso a Paso](#-instrucciones-de-ejecución-paso-a-paso)
6. [Catálogo Completo de la API RESTful](#-catálogo-completo-de-la-api-restful)
   - [Endpoints de Asignaturas](#-endpoints-de-asignaturas)
   - [Endpoints de Docentes](#-endpoints-de-docentes)
   - [Health Check](#-health-check)
7. [Buenas Prácticas Implementadas](#-buenas-prácticas-implementadas)

---

## ✨ Características Principales

- **Gestión de Asignaturas**: Operaciones CRUD completas (Crear, Consultar, Actualizar y Eliminar asignaturas).
- **Gestión de Docentes**: Creación con asignación obligatoria de asignatura, consulta detallada con datos de la asignatura, actualización con posibilidad de reasignar asignatura y eliminación.
- **Integridad Referencial**: Restricción de eliminación de asignaturas que tienen docentes asignados (`RESTRICT`).
- **Validaciones Rigurosas**: Middleware de validación para campos obligatorios, formato de correo electrónico, unicidad y tipos numéricos.
- **Manejo Centralizado de Errores**: Respuestas normalizadas en JSON con códigos de estado HTTP semánticos (`200`, `201`, `400`, `404`, `409`, `500`).
- **Documentación en Primera Persona**: Todo el código fuente está comentado en primera persona (*"Configuro...", "Defino...", "Valido...", "Obtengo..."*).

---

## 🏗️ Estructura del Proyecto

He organizado el backend con una arquitectura modular por capas dentro de [`backend/`](file:///c:/Users/Estudiante/Desktop/Prueba-Tecnica/backend):

```text
Prueba-Tecnica/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # Conexión Sequelize (SQLite por defecto, compatible con PostgreSQL/MySQL)
│   │   ├── models/
│   │   │   ├── Asignatura.js        # Definición del modelo Asignatura (código, nombre, créditos, etc.)
│   │   │   ├── Docente.js           # Definición del modelo Docente (nombre, email, título, asignaturaId, etc.)
│   │   │   └── index.js             # Relaciones: Docente.belongsTo(Asignatura) y Asignatura.hasMany(Docente)
│   │   ├── controllers/
│   │   │   ├── asignaturaController.js # Lógica de negocio para asignaturas
│   │   │   └── docenteController.js    # Lógica de negocio para docentes
│   │   ├── routes/
│   │   │   ├── asignaturaRoutes.js  # Rutas HTTP para asignaturas
│   │   │   ├── docenteRoutes.js     # Rutas HTTP para docentes
│   │   │   └── index.js             # Enrutador principal y Health Check
│   │   ├── middlewares/
│   │   │   ├── validators.js        # Validaciones de entrada para peticiones POST y PUT
│   │   │   └── errorHandler.js      # Middleware de errores (Sequelize, 404, 500)
│   │   ├── seeders/
│   │   │   └── seed.js              # Sembrado con datos iniciales de prueba
│   │   ├── app.js                   # Configuración de Express, CORS y parseo de peticiones
│   │   └── server.js                # Punto de entrada y levantamiento del servidor HTTP
│   ├── test-suite.js                # Batería automatizada de pruebas de integración (10 pruebas)
│   ├── .env.example                 # Plantilla de variables de entorno
│   ├── .env                         # Variables de entorno del servidor
│   └── package.json                 # Dependencias y scripts de ejecución
├── .gitignore                       # Ignora node_modules, .env y base de datos local
├── package.json                     # Scripts rápidos para ejecutar el backend desde la raíz
└── README.md                        # Documentación general del proyecto
```

---

## 🗄️ Estrategia de Base de Datos y Comportamiento de Tablas

### ¿Cómo maneja el proyecto el `DROP TABLE IF EXISTS`?

El comportamiento se divide en dos modos claramente definidos para proteger los datos:

1. **Modo Reinicio / Sembrado (`npm run seed`)**:
   - En el archivo [`backend/src/seeders/seed.js`](file:///c:/Users/Estudiante/Desktop/Prueba-Tecnica/backend/src/seeders/seed.js) ejecuto:
     ```javascript
     await sequelize.sync({ force: true });
     ```
   - Esto ejecuta internamente:
     ```sql
     DROP TABLE IF EXISTS `docentes`;
     DROP TABLE IF EXISTS `asignaturas`;
     CREATE TABLE IF NOT EXISTS `asignaturas` (...);
     CREATE TABLE IF NOT EXISTS `docentes` (...);
     ```
   - **Propósito**: Permite resetear la base de datos a un estado limpio con datos de prueba realistas cada vez que lo desees.

2. **Modo Servidor Normal (`npm start` o `npm run dev`)**:
   - En el archivo [`backend/src/server.js`](file:///c:/Users/Estudiante/Desktop/Prueba-Tecnica/backend/src/server.js) ejecuto:
     ```javascript
     await sequelize.sync({ alter: false });
     ```
   - Esto ejecuta:
     ```sql
     CREATE TABLE IF NOT EXISTS `asignaturas` (...);
     CREATE TABLE IF NOT EXISTS `docentes` (...);
     ```
   - **Propósito**: Garantiza que al iniciar o reiniciar el servidor **NO** se borren los datos que hayas registrado o modificado.

---

## ⚙️ Requisitos Previos

- **Node.js**: Versión 18 o superior (probado y funcionando en Node v22).
- **NPM**: Gestor de paquetes incluido con Node.js.

---

## 🚀 Instrucciones de Ejecución Paso a Paso

### Opción A: Ejecutando desde la carpeta `backend`

1. **Entrar al directorio del backend:**
   ```bash
   cd backend
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Verificar el archivo `.env`:**
   El archivo `.env` ya viene preconfigurado con SQLite (`DB_DIALECT=sqlite`, `PORT=3000`). Si necesitas crearlo manualmente:
   ```bash
   cp .env.example .env
   ```

4. **Poblar la base de datos con datos de prueba:**
   Ejecuta el script seeder para crear las tablas y cargar datos iniciales:
   ```bash
   npm run seed
   ```

5. **Ejecutar la suite de pruebas automatizadas:**
   Comprueba que todos los endpoints (CRUDs y relaciones) funcionen al 100%:
   ```bash
   npm test
   ```

6. **Iniciar el servidor en modo desarrollo (con recarga automática):**
   ```bash
   npm run dev
   ```

7. **O iniciar en modo estándar:**
   ```bash
   npm start
   ```

El servidor estará escuchando en: `http://localhost:3000`

---

### Opción B: Ejecutando desde la raíz del proyecto

Si te encuentras en la raíz `Prueba-Tecnica/`, he configurado scripts rápidos en el `package.json` principal:

- **Poblar datos:** `npm run seed:backend`
- **Correr pruebas:** `npm run test:backend`
- **Iniciar servidor en desarrollo:** `npm run dev:backend`
- **Iniciar servidor estándar:** `npm run start:backend`

---

## 📡 Catálogo Completo de la API RESTful

La URL base es: `http://localhost:3000/api`

### 🩺 Health Check

#### `GET /api/health`
Verifica que la API esté activa y respondiendo.

- **Respuesta (200 OK):**
```json
{
  "success": true,
  "message": "API RESTful operativa y funcionando al 100%.",
  "timestamp": "2026-11-05T19:30:00.000Z"
}
```

---

### 📖 Endpoints de Asignaturas

| Método | Endpoint | Descripción | Código Éxito |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/asignaturas` | Lista todas las asignaturas junto a los docentes asignados | `200 OK` |
| **GET** | `/api/asignaturas/:id` | Obtiene el detalle de una asignatura por su ID | `200 OK` |
| **POST** | `/api/asignaturas` | Crea una nueva asignatura | `201 Created` |
| **PUT** | `/api/asignaturas/:id` | Actualiza la información de una asignatura | `200 OK` |
| **DELETE** | `/api/asignaturas/:id` | Elimina una asignatura (si no tiene docentes asignados) | `200 OK` |

#### Ejemplo de Creación de Asignatura:
- **Petición (`POST /api/asignaturas`):**
```json
{
  "nombre": "Desarrollo Web Frontend con Vue.js",
  "codigo": "VUE-301",
  "descripcion": "Fundamentos de Vue 3, Composition API, Pinia y Router.",
  "creditos": 4,
  "horasSemanales": 5
}
```

- **Respuesta (201 Created):**
```json
{
  "success": true,
  "message": "Asignatura creada satisfactoriamente.",
  "data": {
    "id": 6,
    "nombre": "Desarrollo Web Frontend con Vue.js",
    "codigo": "VUE-301",
    "descripcion": "Fundamentos de Vue 3, Composition API, Pinia y Router.",
    "creditos": 4,
    "horasSemanales": 5,
    "activo": true,
    "updatedAt": "2026-11-05T19:30:00.000Z",
    "createdAt": "2026-11-05T19:30:00.000Z"
  }
}
```

---

### 👨‍🏫 Endpoints de Docentes

| Método | Endpoint | Descripción | Código Éxito |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/docentes` | Lista todos los docentes con la información de su asignatura | `200 OK` |
| **GET** | `/api/docentes/:id` | Obtiene el detalle de un docente por su ID con su asignatura | `200 OK` |
| **POST** | `/api/docentes` | Crea un nuevo docente con asignatura obligatoria asignada | `201 Created` |
| **PUT** | `/api/docentes/:id` | Actualiza los datos del docente y/o reasigna su asignatura | `200 OK` |
| **DELETE** | `/api/docentes/:id` | Elimina un docente de la base de datos | `200 OK` |

#### Ejemplo de Creación de Docente:
- **Petición (`POST /api/docentes`):**
```json
{
  "nombre": "Mariana",
  "apellidos": "López Duarte",
  "email": "mariana.lopez@universidad.edu",
  "telefono": "+52 55 4433 2211",
  "tituloAcademico": "Ingeniera de Software",
  "experienciaAnos": 5,
  "asignaturaId": 1
}
```

- **Respuesta (201 Created):**
```json
{
  "success": true,
  "message": "Docente creado y asignatura asignada con éxito.",
  "data": {
    "id": 5,
    "nombre": "Mariana",
    "apellidos": "López Duarte",
    "email": "mariana.lopez@universidad.edu",
    "telefono": "+52 55 4433 2211",
    "tituloAcademico": "Ingeniera de Software",
    "experienciaAnos": 5,
    "asignaturaId": 1,
    "createdAt": "2026-11-05T19:30:00.000Z",
    "updatedAt": "2026-11-05T19:30:00.000Z",
    "asignatura": {
      "id": 1,
      "nombre": "Programación Web y Frontend",
      "codigo": "INF-301",
      "creditos": 4,
      "horasSemanales": 5
    }
  }
}
```

#### Ejemplo de Actualización y Reasignación de Asignatura:
- **Petición (`PUT /api/docentes/5`):**
```json
{
  "experienciaAnos": 6,
  "asignaturaId": 2
}
```

- **Respuesta (200 OK):**
```json
{
  "success": true,
  "message": "Información del docente y su asignatura asignada actualizada correctamente.",
  "data": {
    "id": 5,
    "nombre": "Mariana",
    "apellidos": "López Duarte",
    "email": "mariana.lopez@universidad.edu",
    "telefono": "+52 55 4433 2211",
    "tituloAcademico": "Ingeniera de Software",
    "experienciaAnos": 6,
    "asignaturaId": 2,
    "asignatura": {
      "id": 2,
      "nombre": "Bases de Datos y ORM",
      "codigo": "INF-302",
      "creditos": 4,
      "horasSemanales": 4
    }
  }
}
```

---

## 🛡️ Buenas Prácticas Implementadas

1. **Separación de responsabilidades**: Estructura modular dividida en configuración, modelos, controladores, rutas y validadores.
2. **CORS abierto**: Preparado para la conexión directa con el cliente de Vue.js 3 en desarrollo.
3. **Validación defensiva**: Evita inconsistencias antes de llegar a la base de datos.
4. **Respuestas unificadas**: Todas las respuestas devuelven `{ success, message, data }` o `{ success, message, errors }`.
5. **Comentarios en primera persona**: Redactados de manera explicativa en cada archivo para seguir la directriz del proyecto.
