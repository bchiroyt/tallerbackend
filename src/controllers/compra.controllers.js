import { CompraModel } from '../models/compra.model.js';
import { ProveedorModel } from '../models/proveedor.model.js';
import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generarPDF = async (compra, detalles, proveedor) => {
  const doc = new jsPDF();
  

  doc.setFont('helvetica');
  doc.setFontSize(20);
  doc.text('COMPROBANTE DE COMPRA', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text('DESCUENTAZO-BIKE', 105, 30, { align: 'center' });
  doc.text('Caserio Centra Solola, Km 135', 105, 35, { align: 'center' });
  doc.text('Tel: (502) 5837 2669', 105, 40, { align: 'center' });
  

  doc.setFontSize(10);
  doc.text(`Compra No: ${compra.numero_comprobante}`, 15, 55);
  doc.text(`Fecha: ${new Date(compra.fecha_facturacion).toLocaleDateString()}`, 15, 60);
  doc.text(`Proveedor: ${proveedor.nombre_compañia}`, 15, 65);
  doc.text(`Comprobante: ${compra.tipo_comprobante} ${compra.serie}-${compra.numero_comprobante}`, 15, 70);


  let y = 85;
  
 
  doc.setFillColor(240, 240, 240);
  doc.rect(15, y-5, 180, 7, 'F');
  doc.text('Producto', 45, y);
  doc.text('Tipo', 85, y);
  doc.text('Cant.', 110, y);
  doc.text('P.U.', 130, y);
  doc.text('P.V.', 150, y);
  doc.text('Subtotal', 170, y);
  
  y += 10;


  detalles.forEach(detalle => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.text(detalle.codigo_producto?.toString() || '', 15, y);
    doc.text(detalle.nombre_producto?.toString() || '', 45, y);
    doc.text(detalle.tipo_producto?.toString() || '', 85, y);
    doc.text(detalle.cantidad?.toString() || '', 110, y);
    doc.text(`Q${Number(detalle.precio_unitario).toFixed(2)}`, 130, y);
    doc.text(`Q${Number(detalle.precio_venta).toFixed(2)}`, 150, y);
    doc.text(`Q${Number(detalle.subtotal).toFixed(2)}`, 170, y);
    
    y += 7;
  });

  
  doc.setFontSize(12);
  doc.text(`Total: Q${Number(compra.total_compra).toFixed(2)}`, 170, y + 10);


  const pdfDir = path.join(__dirname, '..', '..', 'uploads', 'pdfs');
  if (!fs.existsSync(pdfDir)) {
    fs.mkdirSync(pdfDir, { recursive: true });
  }


  const pdfName = `compra_${compra.id_compra}_${Date.now()}.pdf`;
  const pdfPath = path.join(pdfDir, pdfName);
  
  fs.writeFileSync(pdfPath, doc.output());
  
  return `/uploads/pdfs/${pdfName}`;
};


const crearCompra = async (req, res) => {
  try {
    const id_usuario = req.usuario?.id_usuario;
    
    if (!id_usuario) {
      return res.status(400).json({ 
        ok: false, 
        msg: 'No se encontró el ID del usuario' 
      });
    }

    const { id_proveedor, tipo_comprobante, serie, fecha_facturacion, detalles } = req.body;

    if (!id_proveedor || !tipo_comprobante || !serie || !fecha_facturacion || !detalles?.length) {
      return res.status(400).json({ 
        ok: false, 
        msg: 'Faltan campos requeridos' 
      });
    }

    const total_compra = detalles.reduce((total, detalle) => 
      total + (detalle.cantidad * detalle.precio_unitario), 0);

    const compra = await CompraModel.create({
      id_proveedor,
      id_usuario,
      tipo_comprobante,
      serie,
      fecha_facturacion,
      total_compra
    });

   
    const detallesConNombres = [];
    for (const detalle of detalles) {
      const resultado = await CompraModel.addDetail({
        id_compra: compra.id_compra,
        ...detalle
      });
      detallesConNombres.push({
        ...resultado.detalle,
        nombre_producto: resultado.nombreProducto
      });
    }

   
    const proveedor = await ProveedorModel.findById(id_proveedor);

    
    const pdfPath = await generarPDF(compra, detallesConNombres, proveedor);
    const compraActualizada = await CompraModel.updatePdfPath(compra.id_compra, pdfPath);

    res.status(201).json({ 
      ok: true,
      msg: 'Compra creada exitosamente',
      compra: compraActualizada,
      detalles: detallesConNombres,
      pdfUrl: pdfPath
    });
  } catch (error) {
    console.error('Error al crear compra:', error);
    res.status(500).json({ 
      ok: false,
      msg: 'Error al crear la compra',
      error: error.message 
    });
  }
};

const obtenerCompras = async (req, res) => {
  try {
    const compras = await CompraModel.getAllCompras();
    res.json({ ok: true, compras });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener las compras', error: error.message });
  }
};

const obtenerCompra = async (req, res) => {
  try {
    const { id } = req.params;
    const compra = await CompraModel.getCompraById(id);
    if (!compra) {
      return res.status(404).json({ mensaje: 'Compra no encontrada' });
    }
    const detalles = await CompraModel.getDetallesCompra(id);
    res.json({ ok: true, compra, detalles });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener la compra', error: error.message });
  }
};

export const CompraController = {
  crearCompra,
  obtenerCompras,
  obtenerCompra
};