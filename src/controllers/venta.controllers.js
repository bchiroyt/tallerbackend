import { VentaModel } from '../models/venta.model.js';
import { generarPDF } from '../utils/pdf.generator.js';
import fs from 'fs';  // Cambiado a importación de fs normal
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const crearVenta = async (req, res) => {
  try {
    const ventaData = {
      ...req.body,
      id_usuario: req.usuario.id
      // Removemos la generación del numero_comprobante
    };

    // Validaciones iniciales
    if (!ventaData.id_caja) {
      return res.status(400).json({
        ok: false,
        msg: 'No hay una caja abierta'
      });
    }

    // Crear la venta
    const venta = await VentaModel.crearVenta(ventaData);

    // Obtener detalles completos de la venta
    const detallesVenta = await VentaModel.obtenerDetallesVenta(venta.id_venta);
    const clienteInfo = ventaData.id_cliente ? 
      await VentaModel.obtenerCliente(ventaData.id_cliente) : null;

    try {
      // Generar PDF
      const pdfBuffer = await generarPDF(venta, detallesVenta, clienteInfo);
      
      // Crear directorio si no existe
      const pdfDir = path.join(__dirname, '..', '..', 'uploads', 'pdfs');
      if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
      }

      const pdfFileName = `venta-${venta.numero_comprobante}.pdf`;
      const pdfPath = path.join(pdfDir, pdfFileName);
      
      // Guardar PDF
      fs.writeFileSync(pdfPath, Buffer.from(pdfBuffer));
      
      // Actualizar URL del PDF en la base de datos
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

export const VentaController = {
  crearVenta,
  buscarProductos,
  obtenerVentasPorCaja
};