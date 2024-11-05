import { VentaModel } from "../models/venta.model.js";
import { generarPDF } from "../utils/pdf.generator.js";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const crearVenta = async (req, res) => {
  try {
    const ventaData = req.body;
    
    // Validar que haya una caja abierta
    const cajaActual = await CajaModel.getCajaActual();
    if (!cajaActual) {
      return res.status(400).json({ 
        ok: false, 
        msg: 'No hay una caja abierta para realizar ventas' 
      });
    }
    
    // Crear la venta
    const venta = await VentaModel.create(ventaData);
    
    // Generar PDF
    const pdfBuffer = await generarPDF(venta);
    const pdfFileName = `venta-${venta.numero_comprobante}.pdf`;
    const pdfPath = path.join(__dirname, '..', '..', 'uploads', 'pdfs', pdfFileName);
    
    // Guardar PDF
    await fs.promises.writeFile(pdfPath, pdfBuffer);
    
    // Actualizar URL del PDF en la venta
    const pdfUrl = `/uploads/pdfs/${pdfFileName}`;
    await VentaModel.updatePdfUrl(venta.id_venta, pdfUrl);
    
    return res.status(201).json({
      ok: true,
      msg: 'Venta creada exitosamente',
      venta: {
        ...venta,
        pdf_url: pdfUrl
      }
    });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al crear la venta',
      error: error.message
    });
  }
};

const obtenerVentas = async (req, res) => {
  try {
    const ventas = await VentaModel.getAll();
    return res.json({ ok: true, ventas });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al obtener las ventas'
    });
  }
};

const obtenerVenta = async (req, res) => {
  try {
    const { id } = req.params;
    const venta = await VentaModel.getById(id);
    
    if (!venta) {
      return res.status(404).json({
        ok: false,
        msg: 'Venta no encontrada'
      });
    }
    
    return res.json({ ok: true, venta });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al obtener la venta'
    });
  }
};

export const VentaController = {
  crearVenta,
  obtenerVentas,
  obtenerVenta
};