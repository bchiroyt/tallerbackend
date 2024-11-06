import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const generarPDF = async (venta, detalles, cliente) => {
  try {
    const doc = new jsPDF();
    
    // Encabezado
    doc.setFontSize(20);
    doc.text('Bici-Repuestos', 105, 20, { align: 'center' });
    doc.text('DESCUENTAZO-BIKE', 105, 30, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`No. Comprobante: ${venta.numero_comprobante || 'N/A'}`, 20, 40);
    doc.text(`Fecha: ${new Date(venta.fecha_venta).toLocaleString()}`, 20, 50);
    
    // Información del cliente
    doc.text(`Cliente: ${cliente?.nombre || 'Consumidor Final'}`, 20, 60);
    doc.text(`NIT: ${cliente?.nit || 'C/F'}`, 20, 70);
    
    // Tabla de productos
    const headers = [['Descripción', 'Cantidad', 'Precio Unit.', 'Subtotal']];
    const data = detalles.map(item => [
      item.nombre || `${item.tipo_item} ${item.id_item}`,
      item.cantidad.toString(),
      `Q${Number(item.precio_unitario).toFixed(2)}`,
      `Q${Number(item.subtotal).toFixed(2)}`
    ]);
    
    doc.autoTable({
      startY: 80,
      head: headers,
      body: data,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [66, 66, 66] }
    });
    
    // Totales
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Total: Q${Number(venta.total_venta).toFixed(2)}`, 150, finalY);
    doc.text(`Efectivo: Q${Number(venta.monto_recibido).toFixed(2)}`, 150, finalY + 10);
    doc.text(`Cambio: Q${Number(venta.cambio).toFixed(2)}`, 150, finalY + 20);
    
    // Pie de página
    doc.setFontSize(10);
    doc.text('Gracias por su compra', 105, finalY + 40, { align: 'center' });
    
    return doc.output('arraybuffer');
  } catch (error) {
    console.error('Error generando PDF:', error);
    throw error;
  }
};