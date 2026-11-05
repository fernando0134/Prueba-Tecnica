// Importo assert y la aplicación Express para ejecutar pruebas de seguridad y reglas de negocio
const assert = require('assert');
const app = require('./src/app');
const { sequelize } = require('./src/models');

// Defino mi batería de pruebas de integración
const ejecutarPruebas = async () => {
  let server;
  try {
    console.log('🧪 [Test Suite]: Iniciando pruebas completas con Seguridad, RBAC y Reglas de Negocio...');

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
    console.log('   ✅ Autenticación exitosa y JWT generado.');

    // 3. Verifico perfil autenticado
    console.log('👉 [Test 3]: Probando GET /api/auth/perfil con Bearer Token');
    const resPerfil = await fetch(`${baseUrl}/auth/perfil`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const dataPerfil = await resPerfil.json();
    assert.strictEqual(resPerfil.status, 200);
    assert.strictEqual(dataPerfil.usuario.email, 'admin@universidad.edu');
    console.log('   ✅ Perfil administrativo verificado con token JWT.');

    // 4. Regla de Negocio: Rechazar vincular docente a una asignatura INACTIVA
    console.log('👉 [Test 4]: Validando regla de negocio (Docente no puede pertenecer a asignatura inactiva)');
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
        asignaturaId: 6, // La materia con ID 6 se creó como inactiva en el seeder
      }),
    });
    const dataInactiva = await resInactiva.json();
    assert.strictEqual(resInactiva.status, 400);
    assert.strictEqual(dataInactiva.success, false);
    console.log(`   ✅ Rechazado correctamente: "${dataInactiva.message}"`);

    // 5. Regla de Negocio: Rechazar asignatura con NOMBRE DUPLICADO
    console.log('👉 [Test 5]: Validando regla de negocio (Nombre de asignatura debe ser único)');
    const resNombreDup = await fetch(`${baseUrl}/asignaturas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        nombre: 'Programación Web y Frontend', // Nombre ya existente en el seeder
        codigo: 'DIST-999',
        creditos: 3,
        horasSemanales: 4,
      }),
    });
    const dataNombreDup = await resNombreDup.json();
    assert.strictEqual(resNombreDup.status, 409);
    console.log(`   ✅ Conflicto detectado por nombre duplicado: "${dataNombreDup.message}"`);

    // 6. Regla de Negocio: Bloquear eliminación de asignatura con docentes asignados
    console.log('👉 [Test 6]: Validando regla de negocio (No se puede eliminar asignatura con docentes asignados)');
    const resDelBloqueada = await fetch(`${baseUrl}/asignaturas/1`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const dataDelBloqueada = await resDelBloqueada.json();
    assert.strictEqual(resDelBloqueada.status, 400);
    console.log(`   ✅ Bloqueo de eliminación confirmado: "${dataDelBloqueada.message}"`);

    // 7. Crear nueva asignatura activa válida
    console.log('👉 [Test 7]: Creando nueva asignatura activa válida');
    const resNuevaAsig = await fetch(`${baseUrl}/asignaturas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        nombre: 'Seguridad en Redes y Criptografía',
        codigo: 'SEG-404',
        descripcion: 'Principios de seguridad informática.',
        creditos: 5,
        horasSemanales: 6,
        activo: true,
      }),
    });
    const dataNuevaAsig = await resNuevaAsig.json();
    assert.strictEqual(resNuevaAsig.status, 201);
    const nuevaAsigId = dataNuevaAsig.data.id;
    console.log(`   ✅ Asignatura creada con ID ${nuevaAsigId}`);

    // 8. Crear docente asignado a la nueva materia activa
    console.log('👉 [Test 8]: Registrando docente con asignatura activa');
    const resDocente = await fetch(`${baseUrl}/docentes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        nombre: 'Lucía',
        apellidos: 'Vargas Silva',
        email: 'lucia.vargas@universidad.edu',
        telefono: '+52 55 1111 2222',
        tituloAcademico: 'Especialista en Criptografía',
        experienciaAnos: 6,
        asignaturaId: nuevaAsigId,
      }),
    });
    const dataDocente = await resDocente.json();
    assert.strictEqual(resDocente.status, 201);
    const docenteId = dataDocente.data.id;
    console.log(`   ✅ Docente creado exitosamente con ID ${docenteId}`);

    // 9. Reportes: Probar descarga de reporte CSV
    console.log('👉 [Test 9]: Probando GET /api/reportes/docentes/csv (Exportación CSV / Excel)');
    const resCsv = await fetch(`${baseUrl}/reportes/docentes/csv`);
    assert.strictEqual(resCsv.status, 200);
    const contentType = resCsv.headers.get('content-type');
    assert.ok(contentType.includes('text/csv'));
    const csvTexto = await resCsv.text();
    assert.ok(csvTexto.includes('ID Docente,Nombre,Apellidos'));
    assert.ok(csvTexto.includes('Lucía'));
    console.log('   ✅ Reporte CSV generado y formateado para Excel correctamente.');

    // 10. Limpieza: Eliminar docente y luego eliminar asignatura
    console.log('👉 [Test 10]: Probando eliminación con rol ADMIN');
    const resDelDoc = await fetch(`${baseUrl}/docentes/${docenteId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(resDelDoc.status, 200);

    const resDelAsig = await fetch(`${baseUrl}/asignaturas/${nuevaAsigId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(resDelAsig.status, 200);
    console.log('   ✅ Eliminación de docente y posterior eliminación de materia completadas con éxito.');

    console.log('========================================================');
    console.log('🎉 [Test Suite]: ¡TODAS LAS PRUEBAS (10/10) PASARON CON ÉXITO!');
    console.log('========================================================');

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
