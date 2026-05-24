const { validationResult } = require('express-validator');
const PDFDocument = require('pdfkit');
const mongoose    = require('mongoose');

const Venta    = require('../models/Venta');
const Producto = require('../models/Producto');
const Cliente  = require('../models/Cliente');

const PORCENTAJE_IVA = parseFloat(process.env.VENTA_IVA_PORCENTAJE);
const IVA = Number.isFinite(PORCENTAJE_IVA) ? PORCENTAJE_IVA : 0; // por defecto sin IVA

const generarNumero = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const aleatorio = Math.floor(Math.random() * 9000) + 1000;
  return `F-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${aleatorio}`;
};

// ── Crear venta ────────────────────────────────────────────────────────────
const crear = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { clienteId, items } = req.body;

  try {
    // Validar cliente
    if (!mongoose.Types.ObjectId.isValid(clienteId)) {
      return res.status(400).json({ error: 'Cliente inválido' });
    }
    const cliente = await Cliente.findById(clienteId);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

    // Cargar productos
    const ids = items.map(it => it.productoId);
    const productos = await Producto.find({ _id: { $in: ids } });
    const mapaProd  = new Map(productos.map(p => [String(p._id), p]));

    // Validar stock y construir items
    const itemsResultado = [];
    let subtotal = 0;
    for (const it of items) {
      const prod = mapaProd.get(String(it.productoId));
      if (!prod) {
        return res.status(400).json({ error: `Producto no encontrado: ${it.productoId}` });
      }
      const cantidad = parseInt(it.cantidad);
      if (!cantidad || cantidad < 1) {
        return res.status(400).json({ error: `Cantidad inválida para ${prod.nombre}` });
      }
      if (prod.stock < cantidad) {
        return res.status(400).json({
          error: `Stock insuficiente para "${prod.nombre}". Disponible: ${prod.stock}, solicitado: ${cantidad}`,
        });
      }
      const sub = +(prod.precio * cantidad).toFixed(2);
      subtotal += sub;
      itemsResultado.push({
        productoId:     prod._id,
        nombre:         prod.nombre,
        categoria:      prod.categoria,
        precioUnitario: prod.precio,
        cantidad,
        subtotal:       sub,
      });
    }

    subtotal       = +subtotal.toFixed(2);
    const impuesto = +(subtotal * (IVA / 100)).toFixed(2);
    const total    = +(subtotal + impuesto).toFixed(2);

    // Descontar stock de manera atómica producto por producto
    for (const it of itemsResultado) {
      const r = await Producto.updateOne(
        { _id: it.productoId, stock: { $gte: it.cantidad } },
        {
          $inc: { stock: -it.cantidad },
        }
      );
      if (r.modifiedCount === 0) {
        // Revertir lo descontado hasta el momento
        const yaDescontados = itemsResultado.slice(0, itemsResultado.indexOf(it));
        for (const x of yaDescontados) {
          await Producto.updateOne({ _id: x.productoId }, { $inc: { stock: x.cantidad } });
        }
        return res.status(409).json({
          error: `No hay stock suficiente para "${it.nombre}" al momento de procesar la venta`,
        });
      }
    }

    // Marcar productos como agotados si quedaron en 0
    await Producto.updateMany(
      { _id: { $in: itemsResultado.map(i => i.productoId) }, stock: 0 },
      { $set: { estado: 'agotado' } }
    );

    // Crear la venta
    let venta;
    let intentos = 3;
    while (intentos--) {
      try {
        venta = await Venta.create({
          numero: generarNumero(),
          cliente: {
            clienteId: cliente._id,
            cedula:    cliente.cedula,
            nombres:   cliente.nombres,
            apellidos: cliente.apellidos,
            email:     cliente.email,
            telefono:  cliente.telefono,
            direccion: cliente.direccion,
          },
          items:    itemsResultado,
          subtotal,
          impuesto,
          total,
          porcentajeImpuesto: IVA,
          creadoPor: req.usuario.id,
        });
        break;
      } catch (e) {
        if (e.code !== 11000 || intentos === 0) throw e;
        // Colisión muy improbable: reintentar con otro número
      }
    }

    return res.status(201).json({ message: 'Venta registrada', venta });
  } catch (err) {
    console.error('Error crear venta:', err);
    return res.status(500).json({ error: 'Error al registrar la venta' });
  }
};

// ── Listar ventas ──────────────────────────────────────────────────────────
const listar = async (req, res) => {
  try {
    const { buscar = '', pagina = 1, limite = 10 } = req.query;

    const filtro = {};
    if (buscar) {
      const rx = { $regex: buscar, $options: 'i' };
      filtro.$or = [
        { numero: rx },
        { 'cliente.cedula':    rx },
        { 'cliente.nombres':   rx },
        { 'cliente.apellidos': rx },
      ];
    }

    const skip = (parseInt(pagina) - 1) * parseInt(limite);
    const [ventas, total] = await Promise.all([
      Venta.find(filtro).sort({ fecha: -1 }).skip(skip).limit(parseInt(limite)),
      Venta.countDocuments(filtro),
    ]);

    return res.json({
      ventas,
      total,
      pagina:       parseInt(pagina),
      totalPaginas: Math.ceil(total / parseInt(limite)),
    });
  } catch (err) {
    console.error('Error listar ventas:', err);
    return res.status(500).json({ error: 'Error al obtener las ventas' });
  }
};

// ── Obtener venta ──────────────────────────────────────────────────────────
const obtener = async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id);
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });
    return res.json({ venta });
  } catch (err) {
    console.error('Error obtener venta:', err);
    return res.status(500).json({ error: 'Error al obtener la venta' });
  }
};

// ── Generar factura PDF (también sirve para reimprimir) ────────────────────
const factura = async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id);
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });

    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="factura_${venta.numero}.pdf"`);
    doc.pipe(res);

    // Encabezado
    doc.rect(0, 0, doc.page.width, 80).fill('#1E293B');
    doc.fillColor('#FFFFFF').fontSize(22).font('Helvetica-Bold')
      .text('VenditaApp', 50, 25);
    doc.fontSize(10).font('Helvetica')
      .text('Sistema de gestión de productos', 50, 52);

    doc.fillColor('#FFFFFF').fontSize(11).font('Helvetica-Bold')
      .text('FACTURA DE VENTA', doc.page.width - 220, 25, { width: 170, align: 'right' });
    doc.fontSize(10).font('Helvetica')
      .text(`N°: ${venta.numero}`, doc.page.width - 220, 45, { width: 170, align: 'right' })
      .text(`Fecha: ${new Date(venta.fecha).toLocaleString('es-CO')}`,
        doc.page.width - 220, 60, { width: 170, align: 'right' });

    doc.fillColor('#1E293B');
    doc.moveDown(4);

    // Datos del cliente
    let cursorY = 110;
    doc.rect(50, cursorY, doc.page.width - 100, 90).fillAndStroke('#F8FAFC', '#E2E8F0');
    doc.fillColor('#1E293B').fontSize(11).font('Helvetica-Bold')
      .text('Cliente', 60, cursorY + 8);

    doc.fontSize(9).font('Helvetica').fillColor('#0F172A');
    doc.text(`Cédula:    ${venta.cliente.cedula}`,           60, cursorY + 26)
       .text(`Nombre:    ${venta.cliente.nombres} ${venta.cliente.apellidos}`, 60, cursorY + 40)
       .text(`Email:     ${venta.cliente.email || '—'}`,      60, cursorY + 54)
       .text(`Teléfono:  ${venta.cliente.telefono || '—'}`,   60, cursorY + 68);
    doc.text(`Dirección: ${venta.cliente.direccion || '—'}`,  300, cursorY + 26, { width: 240 });

    cursorY += 110;

    // Tabla de items
    const colX = { idx: 50, prod: 80, cant: 320, precio: 380, sub: 470 };
    const colW = { idx: 30, prod: 240, cant: 60, precio: 90, sub: 80 };

    doc.rect(50, cursorY, doc.page.width - 100, 22).fill('#6366F1');
    doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica-Bold')
      .text('#',         colX.idx + 4,    cursorY + 6,  { width: colW.idx })
      .text('Producto',  colX.prod,       cursorY + 6,  { width: colW.prod })
      .text('Cant.',     colX.cant,       cursorY + 6,  { width: colW.cant, align: 'center' })
      .text('Precio',    colX.precio,     cursorY + 6,  { width: colW.precio, align: 'right' })
      .text('Subtotal',  colX.sub,        cursorY + 6,  { width: colW.sub, align: 'right' });
    cursorY += 22;

    doc.fillColor('#0F172A').font('Helvetica').fontSize(9);
    venta.items.forEach((it, idx) => {
      if (cursorY > doc.page.height - 180) {
        doc.addPage();
        cursorY = 50;
      }
      if (idx % 2 === 0) {
        doc.rect(50, cursorY, doc.page.width - 100, 20).fill('#F8FAFC');
        doc.fillColor('#0F172A');
      }
      doc.text(String(idx + 1),               colX.idx + 4, cursorY + 5, { width: colW.idx })
         .text(it.nombre,                     colX.prod,    cursorY + 5, { width: colW.prod, ellipsis: true })
         .text(String(it.cantidad),           colX.cant,    cursorY + 5, { width: colW.cant, align: 'center' })
         .text(`$${it.precioUnitario.toFixed(2)}`, colX.precio, cursorY + 5, { width: colW.precio, align: 'right' })
         .text(`$${it.subtotal.toFixed(2)}`,  colX.sub,     cursorY + 5, { width: colW.sub, align: 'right' });
      cursorY += 20;
    });

    cursorY += 16;

    // Totales
    const labelX = doc.page.width - 220;
    const valueX = doc.page.width - 130;
    doc.font('Helvetica').fontSize(10).fillColor('#0F172A')
      .text('Subtotal', labelX, cursorY, { width: 80 })
      .text(`$${venta.subtotal.toFixed(2)}`, valueX, cursorY, { width: 80, align: 'right' });
    cursorY += 16;
    doc.text(`Impuesto (${venta.porcentajeImpuesto || 0}%)`, labelX, cursorY, { width: 80 })
       .text(`$${venta.impuesto.toFixed(2)}`, valueX, cursorY, { width: 80, align: 'right' });
    cursorY += 8;
    doc.moveTo(labelX, cursorY + 8).lineTo(doc.page.width - 50, cursorY + 8)
      .strokeColor('#6366F1').stroke();
    cursorY += 16;
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#1E293B')
      .text('TOTAL', labelX, cursorY, { width: 80 })
      .fillColor('#6366F1')
      .text(`$${venta.total.toFixed(2)}`, valueX, cursorY, { width: 80, align: 'right' });

    // Pie
    doc.fontSize(8).fillColor('#94A3B8').font('Helvetica')
      .text('Documento generado electrónicamente · VenditaApp',
        50, doc.page.height - 40, { align: 'center', width: doc.page.width - 100 });

    doc.end();
  } catch (err) {
    console.error('Error generar factura:', err);
    return res.status(500).json({ error: 'Error al generar la factura' });
  }
};

module.exports = { crear, listar, obtener, factura };
