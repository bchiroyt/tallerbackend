import { db } from '../database/database.js';

const create = async ({ id_cliente, id_usuario, total_venta, monto_recibido, items }) => {
  const client = await db.connect();
  
  try {
    await client.query('BEGIN');
    
    // Crear la venta
    const ventaQuery = {
      text: `
        INSERT INTO taller.ventas 
        (id_cliente, id_usuario, total_venta, monto_recibido, cambio) 
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `,
      values: [
        id_cliente, 
        id_usuario, 
        total_venta, 
        monto_recibido,
        monto_recibido - total_venta
      ]
    };
    
    const { rows: [venta] } = await client.query(ventaQuery);
    
    // Insertar los detalles de la venta
    for (const item of items) {
      const detalleQuery = {
        text: `
          INSERT INTO taller.detalle_venta 
          (id_venta, tipo_item, id_item, cantidad, precio_unitario, subtotal)
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
        values: [
          venta.id_venta,
          item.tipo_item,
          item.id_item,
          item.cantidad,
          item.precio_unitario,
          item.subtotal
        ]
      };
      
      await client.query(detalleQuery);
    }
    
    await client.query('COMMIT');
    return venta;
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const getAll = async () => {
  const query = {
    text: `
      SELECT v.*, c.nombre as nombre_cliente, c.nit
      FROM taller.ventas v
      LEFT JOIN taller.clientes c ON v.id_cliente = c.id_cliente
      WHERE v.estado_venta = TRUE
      ORDER BY v.fecha_venta DESC
    `
  };
  const { rows } = await db.query(query);
  return rows;
};

const getById = async (id) => {
  const query = {
    text: `
      SELECT 
        v.*,
        c.nombre as nombre_cliente,
        c.nit,
        json_agg(
          json_build_object(
            'id_detalle', dv.id_detalle,
            'tipo_item', dv.tipo_item,
            'id_item', dv.id_item,
            'cantidad', dv.cantidad,
            'precio_unitario', dv.precio_unitario,
            'subtotal', dv.subtotal
          )
        ) as detalles
      FROM taller.ventas v
      LEFT JOIN taller.clientes c ON v.id_cliente = c.id_cliente
      LEFT JOIN taller.detalle_venta dv ON v.id_venta = dv.id_venta
      WHERE v.id_venta = $1
      GROUP BY v.id_venta, c.id_cliente
    `,
    values: [id]
  };
  const { rows } = await db.query(query);
  return rows[0];
};

const updatePdfUrl = async (id_venta, pdf_url) => {
  const query = {
    text: `
      UPDATE taller.ventas
      SET pdf_url = $1
      WHERE id_venta = $2
      RETURNING *
    `,
    values: [pdf_url, id_venta]
  };
  const { rows } = await db.query(query);
  return rows[0];
};

export const VentaModel = {
  create,
  getAll,
  getById,
  updatePdfUrl
};