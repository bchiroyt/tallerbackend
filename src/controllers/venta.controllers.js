import { VentaModel } from '../models/venta.model.js';
import { generarPDF } from '../utils/pdf.generator.js';
import fs from 'fs'; 
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const crearVenta = async (req, res) => {
  try {
    const ventaData = {
      ...req.body,
      
      id_usuario: req.usuario.id_usuario
    };

    
    if (!ventaData.id_caja) {
      return res.status(400).json({
        ok: false,
        msg: 'No hay una caja abierta'
      });
    }

    
    const venta = await VentaModel.crearVenta(ventaData);

    
    const detallesVenta = await VentaModel.obtenerDetallesVenta(venta.id_venta);
    const clienteInfo = ventaData.id_cliente ? 
      await VentaModel.obtenerCliente(ventaData.id_cliente) : null;

    try {
      
      const pdfBuffer = await generarPDF(venta, detallesVenta, clienteInfo);
      
      
      const pdfDir = path.join(__dirname, '..', '..', 'uploads', 'pdfs');
      if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
      }

      const pdfFileName = `venta-${venta.numero_comprobante}.pdf`;
      const pdfPath = path.join(pdfDir, pdfFileName);
      
      
      fs.writeFileSync(pdfPath, Buffer.from(pdfBuffer));
      
      
      const pdfUrl = `/uploads/pdfs/${pdfFileName}`;
      await VentaModel.actualizarPdfUrl(venta.id_venta, pdfUrl);

      return res.status(201).json({
        ok: true,
        msg: 'Venta creada exitosamente',
        venta: {
          ...venta,
          pdf_url: pdfUrl
        }
      });

    } catch (pdfError) {
      console.error('Error al generar PDF:', pdfError);
      return res.status(201).json({
        ok: true,
        msg: 'Venta creada exitosamente (sin PDF)',
        venta
      });
    }

  } catch (error) {
    console.error('Error al crear la venta:', error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al crear la venta'
    });
  }
};

const buscarProductos = async (req, res) => {
  try {
    const { termino } = req.query;
    
    if (!termino) {
      return res.status(400).json({
        ok: false,
        msg: 'El término de búsqueda es requerido'
      });
    }

    const productos = await VentaModel.buscarProductos(termino);
    
    return res.json({
      ok: true,
      productos
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al buscar productos'
    });
  }
};

const obtenerVentasPorCaja = async (req, res) => {
  try {
    const { id_caja } = req.params;
    
    const ventas = await VentaModel.obtenerVentasPorCaja(id_caja);
    
    return res.json({
      ok: true,
      ventas
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al obtener las ventas'
    });
  }
};

const obtenerTodasLasVentas = async (req, res) => {
  try {
    const ventas = await VentaModel.obtenerTodasLasVentas();
    
    return res.json({
      ok: true,
      ventas
    });
  } catch (error) {
    console.error('Error al obtener todas las ventas:', error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al obtener las ventas'
    });
  }
};

const obtenerVentaPorId = async (req, res) => {
  try {
    const { id_venta } = req.params;
    const venta = await VentaModel.obtenerVentaPorId(id_venta);
    
    if (!venta) {
      return res.status(404).json({
        ok: false,
        msg: 'Venta no encontrada'
      });
    }

    return res.json({
      ok: true,
      venta
    });
  } catch (error) {
    console.error('Error al obtener la venta:', error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al obtener la venta'
    });
  }
};

export const VentaController = {
  crearVenta,
  buscarProductos,
  obtenerVentasPorCaja,
  obtenerTodasLasVentas,
  obtenerVentaPorId
};