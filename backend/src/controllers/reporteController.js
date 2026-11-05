// Importo los modelos Docente y Asignatura
const { Docente, Asignatura } = require('../models');

// Implemento el controlador para la exportación y generación de reportes académicos
const reporteController = {
  // Exporto el listado completo de docentes y sus asignaturas en formato CSV compatible con Microsoft Excel
  exportarDocentesCsv: async (req, res, next) => {
    try {
      // Consulto los docentes con sus asignaturas asociadas
      const docentes = await Docente.findAll({
        order: [['apellidos', 'ASC']],
        include: [
          {
            model: Asignatura,
            as: 'asignatura',
            attributes: ['id', 'nombre', 'codigo', 'creditos', 'horasSemanales', 'activo'],
          },
        ],
      });

      // Defino los encabezados del archivo CSV
      const columnas = [
        'ID Docente',
        'Nombre',
        'Apellidos',
        'Correo Electronico',
        'Telefono',
        'Titulo Academico',
        'Años de Experiencia',
        'Codigo Asignatura',
        'Asignatura de Enseñanza',
        'Creditos',
        'Horas Semanales',
      ];

      // Construyo las filas del archivo CSV escapando valores con comillas
      const filas = docentes.map((doc) => [
        doc.id,
        `"${doc.nombre.replace(/"/g, '""')}"`,
        `"${doc.apellidos.replace(/"/g, '""')}"`,
        `"${doc.email}"`,
        `"${doc.telefono || 'N/A'}"`,
        `"${doc.tituloAcademico.replace(/"/g, '""')}"`,
        doc.experienciaAnos,
        `"${doc.asignatura ? doc.asignatura.codigo : 'SIN ASIGNAR'}"`,
        `"${doc.asignatura ? doc.asignatura.nombre.replace(/"/g, '""') : 'SIN ASIGNAR'}"`,
        doc.asignatura ? doc.asignatura.creditos : 0,
        doc.asignatura ? doc.asignatura.horasSemanales : 0,
      ]);

      // Incluyo el Byte Order Mark (BOM) UTF-8 (\uFEFF) para que Excel interprete tildes y caracteres especiales
      const csvContenido = '\uFEFF' + [
        columnas.join(','),
        ...filas.map((f) => f.join(',')),
      ].join('\r\n');

      // Configuro las cabeceras HTTP de descarga de archivo
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="reporte_docentes_asignaturas.csv"');

      // Envío el archivo generado al cliente
      return res.status(200).send(csvContenido);
    } catch (error) {
      next(error);
    }
  },

  // Genero el resumen estadístico institucional de carga docente
  resumenEstadistico: async (req, res, next) => {
    try {
      const [totalDocentes, asignaturas] = await Promise.all([
        Docente.count(),
        Asignatura.findAll({
          include: [{ model: Docente, as: 'docentes', attributes: ['id', 'nombre', 'apellidos'] }],
        }),
      ]);

      const distribucionMaterias = asignaturas.map((asig) => ({
        id: asig.id,
        nombre: asig.nombre,
        codigo: asig.codigo,
        creditos: asig.creditos,
        horasSemanales: asig.horasSemanales,
        totalDocentesAsignados: asig.docentes ? asig.docentes.length : 0,
        docentes: asig.docentes,
      }));

      return res.status(200).json({
        success: true,
        message: 'Resumen estadístico institucional generado con éxito.',
        data: {
          totalDocentes,
          totalAsignaturas: asignaturas.length,
          distribucionMaterias,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

// Exporto mi controlador de reportes
module.exports = reporteController;
