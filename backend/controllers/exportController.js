const Producto  = require('../models/Producto');
const ExcelJS   = require('exceljs');
const PDFDocument = require('pdfkit');

// ── Exportar a XLSX ────────────────────────────────────────────────────────
const exportXLSX = async (req, res) => {
  try {
    const productos = await Producto.find({}).sort({ fechaRegistro: -1 });

    const workbook  = new ExcelJS.Workbook();
    workbook.creator = 'Tienda App';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Productos', {
      pageSetup: { fitToPage: true, orientation: 'landscape' },
    });

    // Encabezados con estilo
    sheet.columns = [
      { header: 'N°',           key: 'num',         width: 6  },
      { header: 'Nombre',       key: 'nombre',      width: 30 },
      { header: 'Categoría',    key: 'categoria',   width: 20 },
      { header: 'Precio (USD)', key: 'precio',      width: 15 },
      { header: 'Stock',        key: 'stock',       width: 10 },
      { header: 'Estado',       key: 'estado',      width: 12 },
      { header: 'Descripción',  key: 'descripcion', width: 40 },
      { header: 'Fecha Registro', key: 'fecha',     width: 22 },
    ];

    // Estilo encabezado
    const headerRow = sheet.getRow(1);
    headerRow.eachCell(cell => {
      cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
      cell.font   = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11 };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        bottom: { style: 'medium', color: { argb: 'FF6366F1' } },
      };
    });
    headerRow.height = 28;

    // Filas de datos
    productos.forEach((p, i) => {
      const row = sheet.addRow({
        num:        i + 1,
        nombre:     p.nombre,
        categoria:  p.categoria,
        precio:     p.precio,
        stock:      p.stock,
        estado:     p.estado,
        descripcion: p.descripcion || '—',
        fecha:      new Date(p.fechaRegistro).toLocaleString('es-CO'),
      });

      // Zebra striping
      if (i % 2 === 0) {
        row.eachCell(cell => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
        });
      }

      // Color por estado
      const estadoCell = row.getCell('estado');
      const colores = { activo: 'FF16A34A', inactivo: 'FF64748B', agotado: 'FFDC2626' };
      estadoCell.font = { color: { argb: colores[p.estado] || 'FF000000' }, bold: true };

      // Formato moneda
      row.getCell('precio').numFmt = '"$"#,##0.00';
      row.height = 20;
    });

    // Fila totales
    const totalRow = sheet.addRow({
      num:       '',
      nombre:    'TOTAL PRODUCTOS',
      categoria: '',
      precio:    { formula: `SUM(D2:D${productos.length + 1})` },
      stock:     { formula: `SUM(E2:E${productos.length + 1})` },
    });
    totalRow.font = { bold: true };
    totalRow.getCell('precio').numFmt = '"$"#,##0.00';
    totalRow.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E7FF' } };
    });

    // Responder con el archivo
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=productos_${Date.now()}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Error exportando XLSX:', err);
    return res.status(500).json({ error: 'Error al generar el archivo Excel' });
  }
};

// ── Exportar a PDF ─────────────────────────────────────────────────────────
const exportPDF = async (req, res) => {
  try {
    const productos = await Producto.find({}).sort({ fechaRegistro: -1 });

    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=productos_${Date.now()}.pdf`);
    doc.pipe(res);

    // Encabezado del documento
    doc.rect(0, 0, doc.page.width, 70).fill('#1E293B');
    doc.fillColor('#FFFFFF').fontSize(22).font('Helvetica-Bold')
      .text('Reporte de Productos', 40, 20);
    doc.fontSize(10).font('Helvetica')
      .text(`Generado: ${new Date().toLocaleString('es-CO')}  |  Total: ${productos.length} productos`, 40, 48);

    doc.moveDown(3);

    // Cabecera de tabla
    const colWidths = [30, 160, 100, 70, 50, 70, 80];
    const headers   = ['N°', 'Nombre', 'Categoría', 'Precio', 'Stock', 'Estado', 'Fecha Reg.'];
    let x = 40;
    const headerY = doc.y;

    doc.rect(x, headerY - 4, colWidths.reduce((a, b) => a + b, 0) + 10, 22).fill('#6366F1');

    headers.forEach((h, i) => {
      doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold')
        .text(h, x + 2, headerY, { width: colWidths[i], align: 'center' });
      x += colWidths[i];
    });

    doc.moveDown(0.5);

    // Filas
    productos.forEach((p, idx) => {
      if (doc.y > doc.page.height - 80) {
        doc.addPage({ layout: 'landscape' });
      }

      const rowY = doc.y;
      x = 40;

      // Fondo alternado
      if (idx % 2 === 0) {
        doc.rect(40, rowY - 2, colWidths.reduce((a, b) => a + b, 0) + 10, 18).fill('#F8FAFC');
      }

      const cols = [
        String(idx + 1),
        p.nombre,
        p.categoria,
        `$${p.precio.toFixed(2)}`,
        String(p.stock),
        p.estado,
        new Date(p.fechaRegistro).toLocaleDateString('es-CO'),
      ];

      const estadoColors = { activo: '#16A34A', inactivo: '#64748B', agotado: '#DC2626' };

      cols.forEach((val, i) => {
        const color = i === 5 ? (estadoColors[val] || '#000000') : '#1E293B';
        doc.fillColor(color).fontSize(8).font(i === 5 ? 'Helvetica-Bold' : 'Helvetica')
          .text(val, x + 2, rowY, { width: colWidths[i] - 4, align: i === 0 ? 'center' : 'left', ellipsis: true });
        x += colWidths[i];
      });

      doc.moveDown(0.6);
    });

    // Pie de página
    doc.moveTo(40, doc.page.height - 40).lineTo(doc.page.width - 40, doc.page.height - 40)
      .strokeColor('#6366F1').stroke();
    doc.fillColor('#64748B').fontSize(8)
      .text('Tienda App — Sistema de Gestión de Productos', 40, doc.page.height - 30,
        { align: 'center', width: doc.page.width - 80 });

    doc.end();
  } catch (err) {
    console.error('Error exportando PDF:', err);
    return res.status(500).json({ error: 'Error al generar el PDF' });
  }
};

module.exports = { exportXLSX, exportPDF };
