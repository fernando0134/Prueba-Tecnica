// Importo el módulo de aserciones y mi aplicación Express
const assert = require('assert');
const app = require('./src/app');
const { sequelize } = require('./src/models');

// Defino mi función principal para realizar pruebas exhaustivas de todos los endpoints
const ejecutarPruebas = async () => {
  let server;
  try {
    console.log('🧪 [Test]: Iniciando suite de pruebas automatizadas...');

    // Inicio el servidor en un puerto dinámico disponible
    server = app.listen(0);
    const { port } = server.address();
    const baseUrl = `http://localhost:${port}/api`;

    // 1. Pruebo el endpoint de salud (Health Check)
    console.log('👉 [Test 1]: Probando GET /api/health');
    const resHealth = await fetch(`${baseUrl}/health`);
    const dataHealth = await resHealth.json();
    assert.strictEqual(resHealth.status, 200);
    assert.strictEqual(dataHealth.success, true);
    console.log('   ✅ Health check respondió 200 OK');

    // 2. Pruebo consultar todas las asignaturas
    console.log('👉 [Test 2]: Probando GET /api/asignaturas');
    const resAsignaturas = await fetch(`${baseUrl}/asignaturas`);
    const dataAsignaturas = await resAsignaturas.json();
    assert.strictEqual(resAsignaturas.status, 200);
    assert.strictEqual(dataAsignaturas.success, true);
    assert.ok(Array.isArray(dataAsignaturas.data));
    console.log(`   ✅ Se recuperaron ${dataAsignaturas.data.length} asignaturas`);

    // 3. Pruebo crear una nueva asignatura
    console.log('👉 [Test 3]: Probando POST /api/asignaturas');
    const nuevaAsigPayload = {
      nombre: 'Redes y Seguridad Informática',
      codigo: 'RED-501',
      descripcion: 'Protocolos de red, ciberseguridad y criptografía básica.',
      creditos: 4,
      horasSemanales: 5,
    };
    const resCrearAsig = await fetch(`${baseUrl}/asignaturas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevaAsigPayload),
    });
    const dataCrearAsig = await resCrearAsig.json();
    assert.strictEqual(resCrearAsig.status, 201);
    assert.strictEqual(dataCrearAsig.success, true);
    assert.strictEqual(dataCrearAsig.data.codigo, 'RED-501');
    const asignaturaIdCreada = dataCrearAsig.data.id;
    console.log(`   ✅ Asignatura creada con ID: ${asignaturaIdCreada}`);

    // 4. Pruebo actualizar la asignatura
    console.log('👉 [Test 4]: Probando PUT /api/asignaturas/:id');
    const resActAsig = await fetch(`${baseUrl}/asignaturas/${asignaturaIdCreada}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'Redes Avanzadas y Ciberseguridad',
        creditos: 5,
      }),
    });
    const dataActAsig = await resActAsig.json();
    assert.strictEqual(resActAsig.status, 200);
    assert.strictEqual(dataActAsig.data.nombre, 'Redes Avanzadas y Ciberseguridad');
    console.log('   ✅ Asignatura actualizada correctamente');

    // 5. Pruebo crear un nuevo docente asignado a la nueva asignatura
    console.log('👉 [Test 5]: Probando POST /api/docentes (Crear docente con asignatura)');
    const nuevoDocentePayload = {
      nombre: 'Gabriel',
      apellidos: 'Torres Valencia',
      email: 'gabriel.torres@universidad.edu',
      telefono: '+52 55 7777 8888',
      tituloAcademico: 'Magíster en Ciberseguridad',
      experienciaAnos: 7,
      asignaturaId: asignaturaIdCreada,
    };
    const resCrearDoc = await fetch(`${baseUrl}/docentes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoDocentePayload),
    });
    const dataCrearDoc = await resCrearDoc.json();
    assert.strictEqual(resCrearDoc.status, 201);
    assert.strictEqual(dataCrearDoc.success, true);
    assert.ok(dataCrearDoc.data.asignatura);
    assert.strictEqual(dataCrearDoc.data.asignatura.id, asignaturaIdCreada);
    const docenteIdCreado = dataCrearDoc.data.id;
    console.log(`   ✅ Docente creado exitosamente con ID ${docenteIdCreado} y asignatura asociada.`);

    // 6. Pruebo consultar todos los docentes y comprobar que incluyan los datos de la asignatura
    console.log('👉 [Test 6]: Probando GET /api/docentes');
    const resDocentes = await fetch(`${baseUrl}/docentes`);
    const dataDocentes = await resDocentes.json();
    assert.strictEqual(resDocentes.status, 200);
    assert.strictEqual(dataDocentes.success, true);
    assert.ok(dataDocentes.data.length > 0);
    assert.ok(dataDocentes.data[0].asignatura, 'El docente debe incluir la información de su asignatura');
    console.log(`   ✅ Obtenidos ${dataDocentes.data.length} docentes, todos con su información de asignatura.`);

    // 7. Pruebo consultar un docente por ID
    console.log('👉 [Test 7]: Probando GET /api/docentes/:id');
    const resDocentePorId = await fetch(`${baseUrl}/docentes/${docenteIdCreado}`);
    const dataDocentePorId = await resDocentePorId.json();
    assert.strictEqual(resDocentePorId.status, 200);
    assert.strictEqual(dataDocentePorId.data.id, docenteIdCreado);
    assert.strictEqual(dataDocentePorId.data.asignatura.id, asignaturaIdCreada);
    console.log('   ✅ Consulta de docente por ID exitosa con relación cargada.');

    // 8. Pruebo actualizar el docente, modificando su información y su asignatura asignada (cambio a la asignatura 1)
    console.log('👉 [Test 8]: Probando PUT /api/docentes/:id (Modificando docente y reasignando asignatura)');
    const resActDoc = await fetch(`${baseUrl}/docentes/${docenteIdCreado}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        experienciaAnos: 9,
        asignaturaId: 1, // Reasignamos a la primera asignatura (Programación Web)
      }),
    });
    const dataActDoc = await resActDoc.json();
    assert.strictEqual(resActDoc.status, 200);
    assert.strictEqual(dataActDoc.data.experienciaAnos, 9);
    assert.strictEqual(dataActDoc.data.asignaturaId, 1);
    assert.strictEqual(dataActDoc.data.asignatura.id, 1);
    console.log('   ✅ Docente actualizado y asignatura reasignada con éxito.');

    // 9. Pruebo eliminar el docente de la base de datos
    console.log('👉 [Test 9]: Probando DELETE /api/docentes/:id');
    const resDelDoc = await fetch(`${baseUrl}/docentes/${docenteIdCreado}`, {
      method: 'DELETE',
    });
    const dataDelDoc = await resDelDoc.json();
    assert.strictEqual(resDelDoc.status, 200);
    assert.strictEqual(dataDelDoc.success, true);
    console.log('   ✅ Docente eliminado de la base de datos.');

    // 10. Pruebo verificar que el docente ya no exista
    const resDocVerif = await fetch(`${baseUrl}/docentes/${docenteIdCreado}`);
    assert.strictEqual(resDocVerif.status, 404);
    console.log('   ✅ Verificado: El docente ya no existe (404 Not Found).');

    // 11. Pruebo eliminar la asignatura creada (que ahora quedó libre de docentes)
    console.log('👉 [Test 10]: Probando DELETE /api/asignaturas/:id');
    const resDelAsig = await fetch(`${baseUrl}/asignaturas/${asignaturaIdCreada}`, {
      method: 'DELETE',
    });
    const dataDelAsig = await resDelAsig.json();
    assert.strictEqual(resDelAsig.status, 200);
    assert.strictEqual(dataDelAsig.success, true);
    console.log('   ✅ Asignatura eliminada correctamente.');

    console.log('========================================================');
    console.log('🎉 [Test]: ¡TODAS LAS PRUEBAS PASARON SATISFACTORIAMENTE!');
    console.log('========================================================');

    server.close();
    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ [Test Error]: Falló la suite de pruebas:', err);
    if (server) server.close();
    process.exit(1);
  }
};

// Ejecuto la batería de pruebas
ejecutarPruebas();
