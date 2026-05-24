const PDFDocument = require('pdfkit');
const Venta = require('../models/Venta');

// ── Resumen de caja ────────────────────────────────────────────────────────
const resumen = async (_req, res) => {
  try {
    const ventas = await Venta.find({}).sort({ fecha: -1 });

    const saldo  = ventas.reduce((acc, v) => acc + (v.total || 0), 0);
    const totalVentas = ventas.length;

    const historico = ventas.map(v => ({
      _id:      v._id,
      numero:   v.numero,
      fecha:    v.fecha,
      cliente:  `${v.cliente.nombres} ${v.cliente.apellidos}`,
      cedula:   v.cliente.cedula,
      cantidadItems: v.items.reduce((a, i) => a + i.cantidad, 0),
      total:    v.total,
    }));

    return res.json({
      saldo:       +saldo.toFixed(2),
      totalVentas,
      historico,
    });
  } catch (err) {
    console.error('Error resumen caja:', err);
    return res.status(500).json({ error: 'Error al obtener el saldo en caja' });
  }
};

// ── Reporte PDF de caja ────────────────────────────────────────────────────
const reportePDF = async (_req, res) => {
  try {
    const ventas = await Venta.find({}).sort({ fecha: -1 });
    const saldo  = ventas.reduce((acc, v) => acc + (v.total || 0), 0);

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition',
      `attachment; filename="reporte_caja_${Date.now()}.pdf"`);
    doc.pipe(res);

    // Encabezado
    doc.rect(0, 0, doc.page.width, 70).fill('#1E293B');
    doc.fillColor('#FFFFFF').fontSize(20).font('Helvetica-Bold')
      .text('Reporte de Caja', 40, 22);
    doc.fontSize(10).font('Helvetica')
      .text(`Generado: ${new Date().toLocaleString('es-CO')}`, 40, 48);

    // Tarjeta de resumen
    doc.fillColor('#1E293B');
    let y = 90;
    doc.rect(40, y, doc.page.width - 80, 70).fillAndStroke('#EEF2FF', '#C7D2FE');
    doc.fillColor('#4338CA').fontSize(11).font('Helvetica-Bold')
      .text('Saldo acumulado en caja', 55, y + 10);
    doc.fillColor('#1E293B').fontSize(24).font('Helvetica-Bold')
      .text(`$${saldo.toFixed(2)}`, 55, y + 28);
    doc.fontSize(10).font('Helvetica').fillColor('#475569')
      .text(`Ventas registradas: ${ventas.length}`, doc.page.width - 240, y + 36, { width: 180, align: 'right' });

    y += 90;

    // Tabla
    const colX = { num: 40, fecha: 130, cliente: 240, cedula: 380, items: 450, total: 510 };
    const colW = { num: 90, fecha: 110, cliente: 140, cedula: 70,  items: 60,  total: 60 };

    doc.rect(40, y, doc.page.width - 80, 22).fill('#6366F1');
    doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica-Bold')
      .text('N° Factura', colX.num,     y + 6, { width: colW.num })
      .text('Fecha',      colX.fecha,   y + 6, { width: colW.fecha })
      .text('Cliente',    colX.cliente, y + 6, { width: colW.cliente })
      .text('Cédula',     colX.cedula,  y + 6, { width: colW.cedula })
      .text('Items',      colX.items,   y + 6, { width: colW.items, align: 'center' })
      .text('Total',      colX.total,   y + 6, { width: colW.total, align: 'right' });
    y += 22;

    doc.fillColor('#0F172A').font('Helvetica').fontSize(9);
    ventas.forEach((v, idx) => {
      if (y > doc.page.height - 80) {
        doc.addPage();
        y = 50;
      }
      if (idx % 2 === 0) {
        doc.rect(40, y, doc.page.width - 80, 20).fill('#F8FAFC');
        doc.fillColor('#0F172A');
      }
      const cantItems = v.items.reduce((a, i) => a + i.cantidad, 0);
      doc.text(v.numero,                                    colX.num,     y + 5, { width: colW.num })
         .text(new Date(v.fecha).toLocaleDateString('es-CO'), colX.fecha, y + 5, { width: colW.fecha })
         .text(`${v.cliente.nombres} ${v.cliente.apellidos}`, colX.cliente, y + 5, { width: colW.cliente, ellipsis: true })
         .text(v.cliente.cedula,                              colX.cedula, y + 5, { width: colW.cedula })
         .text(String(cantItems),                             colX.items,  y + 5, { width: colW.items, align: 'center' })
         .text(`$${v.total.toFixed(2)}`,                      colX.total,  y + 5, { width: colW.total, align: 'right' });
      y += 20;
    });

    if (ventas.length === 0) {
      doc.fillColor('#94A3B8').fontSize(11).font('Helvetica-Oblique')
        .text('No hay ventas registradas.', 40, y + 20, { align: 'center', width: doc.page.width - 80 });
    } else {
      // Línea total
      y += 8;
      doc.moveTo(40, y).lineTo(doc.page.width - 40, y).strokeColor('#6366F1').stroke();
      y += 8;
      doc.fillColor('#1E293B').font('Helvetica-Bold').fontSize(11)
        .text('SALDO TOTAL', colX.cedula - 40, y, { width: 140, align: 'right' });
      doc.fillColor('#6366F1')
        .text(`$${saldo.toFixed(2)}`, colX.total - 40, y, { width: colW.total + 40, align: 'right' });
    }

    doc.fontSize(8).fillColor('#94A3B8').font('Helvetica')
      .text('VenditaApp · Reporte de caja',
        40, doc.page.height - 30, { align: 'center', width: doc.page.width - 80 });

    doc.end();
  } catch (err) {
    console.error('Error reporte caja:', err);
    return res.status(500).json({ error: 'Error al generar el reporte de caja' });
  }
};

module.exports = { resumen, reportePDF };
