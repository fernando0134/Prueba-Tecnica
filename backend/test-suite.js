// Importo assert y la aplicación Express para ejecutar pruebas de seguridad y reglas de negocio
const assert = require('assert');
const app = require('./src/app');
const { sequelize } = require('./src/models');

// Defino mi batería de pruebas de integración
const ejecutarPruebas = async () => {
  let server;
  try {
    console.log('🧪 [Test Suite]: Iniciando pruebas completas con Seguridad, RBAC, Niveles y Reglas de Negocio...');

    server = app.listen(0);
    const { port } = server.address();
    const baseUrl = `http://localhost:${port}/api`;

    // 1. Health check
    console.log('👉 [Test 1]: Probando GET /api/health');
    const resHealth = await fetch(`${baseUrl}/health`);
    assert.strictEqual(resHealth.status, 200);
    console.log('   ✅ Health check respondió 200 OK');

    // 2. Autenticación: Login de Administrador
    console.log('👉 [Test 2]: Probando POST /api/auth/login (Login de Administrador)');
    const resLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@universidad.edu',
        password: 'Admin123*',
      }),
    });
    const dataLogin = await resLogin.json();
    assert.strictEqual(resLogin.status, 200);
    assert.strictEqual(dataLogin.success, true);
    assert.ok(dataLogin.token, 'Debe devolver un token JWT');
    assert.strictEqual(dataLogin.usuario.rol, 'ADMIN');
    const adminToken = dataLogin.token;
    console.log('   ✅ Autenticación exitosa y JWT de Administrador generado.');

    // 3. Login de Coordinador
    console.log('👉 [Test 3]: Probando POST /api/auth/login (Login de Coordinador)');
    const resCoordLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'coordinador@universidad.edu',
        password: 'Coord123*',
      }),
    });
    const dataCoordLogin = await resCoordLogin.json();
    assert.strictEqual(resCoordLogin.status, 200);
    assert.strictEqual(dataCoordLogin.usuario.rol, 'COORDINADOR');
    const coordToken = dataCoordLogin.token;
    console.log('   ✅ Autenticación exitosa y JWT de Coordinador generado.');

    // 4. Diferenciación de Niveles: Coordinador NO puede ver Usuarios del Sistema (403 Forbidden)
    console.log('👉 [Test 4]: Validando restricción de rol (Coordinador no puede acceder a /api/usuarios)');
    const resCoordUsers = await fetch(`${baseUrl}/usuarios`, {
      headers: { Authorization: `Bearer ${coordToken}` },
    });
    assert.strictEqual(resCoordUsers.status, 403);
    console.log('   ✅ Acceso denegado a Coordinador en /api/usuarios (403 Forbidden).');

    // 5. Diferenciación de Niveles: Administrador SÍ puede ver Usuarios del Sistema (200 OK)
    console.log('👉 [Test 5]: Validando acceso exclusivo de Administrador a /api/usuarios');
    const resAdminUsers = await fetch(`${baseUrl}/usuarios`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const dataAdminUsers = await resAdminUsers.json();
    assert.strictEqual(resAdminUsers.status, 200);
    assert.ok(dataAdminUsers.data.length >= 2);
    console.log(`   ✅ Administrador recuperó exitosamente ${dataAdminUsers.data.length} cuentas del sistema.`);

    // 6. Regla de Negocio: Rechazar vincular docente a una asignatura INACTIVA
    console.log('👉 [Test 6]: Validando regla de negocio (Docente no puede pertenecer a asignatura inactiva)');
    const resInactiva = await fetch(`${baseUrl}/docentes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        nombre: 'Profesor',
        apellidos: 'Prueba Inactiva',
        email: 'profesor.inactiva@universidad.edu',
        tituloAcademico: 'Licenciado',
        experienciaAnos: 2,
        asignaturaId: 6, // Materia inactiva
      }),
    });
    const dataInactiva = await resInactiva.json();
    assert.strictEqual(resInactiva.status, 400);
    console.log(`   ✅ Rechazado correctamente: "${dataInactiva.message}"`);

    // 7. Regla de Negocio: Rechazar asignatura con NOMBRE DUPLICADO
    console.log('👉 [Test 7]: Validando regla de negocio (Nombre de asignatura debe ser único)');
    const resNombreDup = await fetch(`${baseUrl}/asignaturas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        nombre: 'Programación Web y Frontend',
        codigo: 'DIST-999',
        creditos: 3,
        horasSemanales: 4,
      }),
    });
    const dataNombreDup = await resNombreDup.json();
    assert.strictEqual(resNombreDup.status, 409);
    console.log(`   ✅ Conflicto detectado por nombre duplicado: "${dataNombreDup.message}"`);

    // 8. Regla de Negocio: Bloquear eliminación de asignatura con docentes asignados
    console.log('👉 [Test 8]: Validando regla de negocio (No se puede eliminar asignatura con docentes asignados)');
    const resDelBloqueada = await fetch(`${baseUrl}/asignaturas/1`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const dataDelBloqueada = await resDelBloqueada.json();
    assert.strictEqual(resDelBloqueada.status, 400);
    console.log(`   ✅ Bloqueo de eliminación confirmado: "${dataDelBloqueada.message}"`);

    // 9. Asignatura: Crear, Consultar por ID y Actualizar
    console.log('👉 [Test 9]: Probando ciclo de vida de Asignatura (Crear, Consultar por ID y Actualizar)');
    const resCrearAsig = await fetch(`${baseUrl}/asignaturas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        nombre: 'Sistemas Operativos y Kernel',
        codigo: 'SO-301',
        descripcion: 'Gestión de procesos y memoria.',
        creditos: 4,
        horasSemanales: 4,
        activo: true,
      }),
    });
    const dataCrearAsig = await resCrearAsig.json();
    assert.strictEqual(resCrearAsig.status, 201);
    const idAsig = dataCrearAsig.data.id;

    // Consultar por ID
    const resConsultarAsig = await fetch(`${baseUrl}/asignaturas/${idAsig}`);
    const dataConsultarAsig = await resConsultarAsig.json();
    assert.strictEqual(resConsultarAsig.status, 200);
    assert.strictEqual(dataConsultarAsig.data.nombre, 'Sistemas Operativos y Kernel');

    // Actualizar Asignatura
    const resActAsig = await fetch(`${baseUrl}/asignaturas/${idAsig}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        creditos: 5,
        horasSemanales: 6,
      }),
    });
    const dataActAsig = await resActAsig.json();
    assert.strictEqual(resActAsig.status, 200);
    assert.strictEqual(dataActAsig.data.creditos, 5);
    console.log('   ✅ Creación, consulta por ID y actualización de asignatura comprobadas.');

    // 10. Diferenciación de Niveles: Coordinador NO puede eliminar materias (403 Forbidden)
    console.log('👉 [Test 10]: Validando que Coordinador no pueda eliminar materias');
    const resCoordDel = await fetch(`${baseUrl}/asignaturas/${idAsig}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${coordToken}` },
    });
    assert.strictEqual(resCoordDel.status, 403);
    console.log('   ✅ Coordinador bloqueado al intentar eliminar materia (403 Forbidden).');

    // 11. Administrador SÍ puede eliminar materias vacías
    console.log('👉 [Test 11]: Administrador elimina la materia sin docentes asignados');
    const resAdminDel = await fetch(`${baseUrl}/asignaturas/${idAsig}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(resAdminDel.status, 200);
    console.log('   ✅ Administrador eliminó la materia exitosamente (200 OK).');

    // 12. Reportes: Descarga de reporte CSV
    console.log('👉 [Test 12]: Probando GET /api/reportes/docentes/csv (Exportación CSV / Excel)');
    const resCsv = await fetch(`${baseUrl}/reportes/docentes/csv`);
    assert.strictEqual(resCsv.status, 200);
    const contentType = resCsv.headers.get('content-type');
    assert.ok(contentType.includes('text/csv'));
    console.log('   ✅ Reporte CSV generado y formateado para Excel correctamente.');

    console.log('========================================================================');
    console.log('🎉 [Test Suite]: ¡TODAS LAS PRUEBAS (12/12) PASARON CON TOTAL ÉXITO!');
    console.log('========================================================================');

    server.close();
    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ [Test Error]: Falló la prueba:', err);
    if (server) server.close();
    process.exit(1);
  }
};

ejecutarPruebas();
