import { db } from '../database/database.js';

const getAllVentas = async (fechaInicio, fechaFin, comprobante = '') => {
  const query = {
      text: `
          SELECT 
              v.id_venta,
              v.numero_comprobante,
              v.fecha_venta,
              v.total_venta,
              v.monto_recibido,
              v.cambio,
              v.estado_venta,
              v.pdf_url,
              v.id_caja,
              u.nombre as nombre_usuario,
              c.nombre as nombre_cliente
          FROM taller.ventas v
          LEFT JOIN taller.usuarios u ON v.id_usuario = u.id_usuario
          LEFT JOIN taller.clientes c ON v.id_cliente = c.id_cliente
          WHERE (v.fecha_venta::date BETWEEN $1::date AND $2::date)
          AND (v.numero_comprobante ILIKE $3 OR $3 = '')
          ORDER BY v.fecha_venta DESC
      `,
      values: [
          fechaInicio,
          fechaFin,
          comprobante ? `%${comprobante}%` : ''
      ]
  };
  try {
      const { rows } = await db.query(query);
      return rows;
  } catch (error) {
      console.error('Error en getAllVentas:', error);
      throw error;
  }
};

const getAllCompras = async (fechaInicio, fechaFin, comprobante = '') => {
  const query = {
      text: `
          SELECT 
              c.id_compra,
              c.tipo_comprobante,
              c.numero_comprobante,
              c.serie,
              c.fecha_compra,
              c.fecha_facturacion,
              c.total_compra,
              c.pdf,
              u.nombre as nombre_usuario,
              p.nombre_compañia as nombre_proveedor
          FROM taller.compras c
          LEFT JOIN taller.usuarios u ON c.id_usuario = u.id_usuario
          LEFT JOIN taller.proveedores p ON c.id_proveedor = p.id_proveedor
          WHERE (c.fecha_compra::date BETWEEN $1::date AND $2::date)
          AND (CAST(c.numero_comprobante AS TEXT) ILIKE $3 OR $3 = '')
          ORDER BY c.fecha_compra DESC
      `,
      values: [
          fechaInicio,
          fechaFin,
          comprobante ? `%${comprobante}%` : ''
      ]
  };
  try {
      const { rows } = await db.query(query);
      return rows;
  } catch (error) {
      console.error('Error en getAllCompras:', error);
      throw error;
  }
};

const getDetalleVenta = async (idVenta) => {
    const query = {
        text: `
            SELECT 
                dv.id_detalle_venta,
                dv.id_venta,
                dv.id_producto,
                dv.cantidad,
                dv.precio_venta,
                dv.subtotal,
                p.nombre as nombre_producto
            FROM taller.detalle_venta dv
            LEFT JOIN taller.productos p ON dv.id_producto = p.id_producto
            WHERE dv.id_venta = $1
            ORDER BY dv.id_detalle_venta
        `,
        values: [idVenta]
    };
    try {
        const { rows } = await db.query(query);
        return rows;
    } catch (error) {
        console.error('Error en getDetalleVenta:', error);
        throw error;
    }
};

const getDetalleCompra = async (idCompra) => {
    const query = {
        text: `
            SELECT 
                dc.id_detalle_compra,
                dc.id_compra,
                dc.id_producto,
                dc.cantidad,
                dc.precio_unitario,
                dc.subtotal,
                p.nombre as nombre_producto
            FROM taller.detalle_compra dc
            LEFT JOIN taller.productos p ON dc.id_producto = p.id_producto
            WHERE dc.id_compra = $1
            ORDER BY dc.id_detalle_compra
        `,
        values: [idCompra]
    };
    try {
        const { rows } = await db.query(query);
        return rows;
    } catch (error) {
        console.error('Error en getDetalleCompra:', error);
        throw error;
    }
};

export const ConsultasModel = {
    getAllVentas,
    getAllCompras,
    getDetalleVenta,
    getDetalleCompra
};