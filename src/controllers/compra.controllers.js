import { CompraModel } from '../models/compra.model.js';
import { ProductoModel } from '../models/producto.model.js';
import { AccesorioModel } from '../models/accesorio.model.js';
import { BicicletaModel } from  '../models/bicicleta.model.js';

const crearCompra = async (req, res) => {
  try {
    // Obtener id_usuario del objeto usuario agregado en el middleware
    const id_usuario = req.usuario?.id_usuario;
    
    if (!id_usuario) {
      return res.status(400).json({ 
        ok: false, 
        msg: 'No se encontró el ID del usuario' 
      });
    }

    const { id_proveedor, tipo_comprobante, serie, fecha_facturacion, detalles } = req.body;

    // Validaciones
    if (!id_proveedor || !tipo_comprobante || !serie || !fecha_facturacion || !detalles?.length) {
      return res.status(400).json({ 
        ok: false, 
        msg: 'Faltan campos requeridos' 
      });
    }

    const ultimoNumero = await CompraModel.getLastComprobanteNumber();
    const numero_comprobante = ultimoNumero + 1;

    const total_compra = detalles.reduce((total, detalle) => 
      total + (detalle.cantidad * detalle.precio_unitario), 0);

    const compra = await CompraModel.create({
      id_proveedor,
      id_usuario,
      tipo_comprobante,
      numero_comprobante,
      serie,
      fecha_facturacion,
      total_compra
    });

    // Procesar detalles
    for (const detalle of detalles) {
      await CompraModel.addDetail({
        id_compra: compra.id_compra,
        ...detalle
      });

      // Actualizar stock
      await CompraModel.updateStock(
        detalle.tipo_producto,
        detalle.id_producto,
        detalle.cantidad
      );
    }

    res.status(201).json({ 
      ok: true,
      msg: 'Compra creada exitosamente',
      compra 
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