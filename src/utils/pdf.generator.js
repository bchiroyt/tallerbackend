import jsPDF from 'jspdf';

export const generarPDF = (venta) => {
  const doc = new jsPDF();
  
  // Configuración del documento
  doc.setFontSize(18);
  doc.text('Comprobante de Venta', 105, 20, null, null, 'center');
  
  doc.setFontSize(12);
  doc.text(`Número de Comprobante: ${venta.numero_comprobante}`, 20, 40);
  doc.text(`Fecha: ${new Date(venta.fecha_venta).toLocaleString()}`, 20, 50);
  doc.text(`Cliente: ${venta.nombre_cliente || 'No registrado'}`, 20, 60);
  
  // Tabla de items
  let yPos = 80;
  doc.setFontSize(10);
  doc.text('Descripción', 20, yPos);
  doc.text('Cantidad', 100, yPos);
  doc.text('Precio', 130, yPos);
  doc.text('Subtotal', 160, yPos);
  
  yPos += 10;
  venta.detalles.forEach(item => {
    doc.text(item.nombre || `${item.tipo_item} ${item.id_item}`, 20, yPos);
    doc.text(item.cantidad.toString(), 100, yPos);
    doc.text(`Q${item.precio_unitario.toFixed(2)}`, 130, yPos);
    doc.text(`Q${item.subtotal.toFixed(2)}`, 160, yPos);
    yPos += 10;
  });
  
  // Total
  doc.setFontSize(12);
  doc.text(`Total: Q${venta.total_venta.toFixed(2)}`, 160, yPos + 10);
  
  return doc.output('arraybuffer');
};