import { VentaModel } from '../models/venta.model.js';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const crearVenta = async (req, res) => {
  const client = await db.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id_cliente, id_usuario, tipo_venta, total_venta, detalles } = req.body;
    
    // Crear la venta
    const venta = await VentaModel.create({
      id_cliente,
      id_usuario,
      tipo_venta,
      total_venta
    });
    
    // Crear los detalles de la venta
    for (const detalle of detalles) {
      await VentaModel.createDetalleVenta({
        id_venta: venta.id_venta,
        ...detalle
      });
    }
    
    // Generar PDF
    const ventaCompleta = await VentaModel.getVentaById(venta.id_venta);
    const pdfContent = generarPDF(ventaCompleta);
    
    // Actualizar la venta con la URL del PDF
    const ventaActualizada = await VentaModel.create({
      ...venta,
      pdf_content: pdfContent
    });
    
    await client.query('COMMIT');
    
    res.status(201).json({
      ok: true,
      msg: 'Venta creada exitosamente',
      venta: ventaActualizada
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: 'Error al crear la venta'
    });
  } finally {
    client.release();
  }
};

const obtenerVenta = async (req, res) => {
  try {
    const { id } = req.params;
    const venta = await VentaModel.getVentaById(id);
    
    if (!venta) {
      return res.status(404).json({
        ok: false,
        msg: 'Venta no encontrada'
      });
    }
    
    res.json({
      ok: true,
      venta
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: 'Error al obtener la venta'
    });
  }
};

const generarPDF = (venta) => {
  const doc = new jsPDF();

  // Encabezado
  doc.setFontSize(18);
  doc.text('Factura de Venta', 105, 20, null, null, 'center');
  
  // Información de la empresa
  doc.setFontSize(12);
  doc.text('Taller de Bicicletas', 20, 30);
  doc.text('NIT: 123456789', 20, 35);
  doc.text('Dirección: Calle Principal #123', 20, 40);
  
  // Información del cliente
  doc.text(`Cliente: ${venta.cliente_nombre || 'Cliente General'}`, 20, 50);
  if (venta.cliente_nit) doc.text(`NIT: ${venta.cliente_nit}`, 20, 55);
  if (venta.cliente_direccion) doc.text(`Dirección: ${venta.cliente_direccion}`, 20, 60);
  
  // Información de la venta
  doc.text(`Factura N°: ${venta.id_venta}`, 140, 50);
  doc.text(`Fecha: ${new Date(venta.fecha_venta).toLocaleDateString()}`, 140, 55);
  
  // Tabla de productos
  const headers = [['Tipo', 'Descripción', 'Cantidad', 'Precio Unit.', 'Subtotal']];
  const data = venta.detalles.map(detalle => [
    detalle.tipo_item,
    detalle.nombre || 'N/A',
    detalle.cantidad,
    `$${detalle.precio_unitario.toFixed(2)}`,
    `$${detalle.subtotal.toFixed(2)}`
  ]);
  
  doc.autoTable({
    startY: 70,
    head: headers,
    body: data,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    footStyles: { fillColor: [41, 128, 185], textColor: 255 },
    foot: [['', '', '', 'Total:', `$${venta.total_venta.toFixed(2)}`]]
  });
  
  // Pie de página
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text('Gracias por su compra', 105, doc.internal.pageSize.height - 10, null, null, 'center');
  }
  
  return doc.output();
};

export const VentaController = {
  crearVenta,
  obtenerVenta
};