import { db } from '../database/database.js';

const create = async ({ id_venta, id_usuario, monto_reembolso, motivo, items }) => {
  const client = await db.connect();
  
  try {
    await client.query('BEGIN');
    
    // Crear el reembolso
    const reembolsoQuery = {
      text: `
        INSERT INTO taller.reembolsos 
        (id_venta, id_usuario, monto_reembolso, motivo)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `,
      values: [id_venta, id_usuario, monto_reembolso, motivo]
    };
    
    const { rows: [reembolso] } = await client.query(reembolsoQuery);
    
    // Insertar los detalles del reembolso
    for (const item of items) {
      const detalleQuery = {
        text: `
          INSERT INTO taller.detalle_reembolso 
          (id_reembolso, id_detalle_venta, cantidad_reembolsada, subtotal_reembolso)
          VALUES ($1, $2, $3, $4)
        `,
        values: [
          reembolso.id_reembolso,
          item.id_detalle_venta,
          item.cantidad_reembolsada,
          item.subtotal_reembolso
        ]
      };
      
      await client.query(detalleQuery);
      
      // Actualizar el stock si es un producto físico
      if (item.tipo_item !== 'servicio') {
        const updateStockQuery = {
          text: `
            UPDATE taller.${item.tipo_item}s
            SET stock = stock + $1
            WHERE id_${item.tipo_item} = $2
          `,
          values: [item.cantidad_reembolsada, item.id_item]
        };
        
        await client.query(updateStockQuery);
      }
    }
    
    // Actualizar el estado de la venta
    await client.query(`
      UPDATE taller.ventas
      SET estado_venta = FALSE
      WHERE id_venta = $1
    `, [id_venta]);
    
    await client.query('COMMIT');
    return reembolso;
    
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
      SELECT r.*, v.numero_comprobante, u.nombre as nombre_usuario
      FROM taller.reembolsos r
      JOIN taller.ventas v ON r.id_venta = v.id_venta
      JOIN taller.usuarios u ON r.id_usuario = u.id_usuario
      WHERE r.estado_reembolso = TRUE
      ORDER BY r.fecha_reembolso DESC
    `
  };
  const { rows } = await db.query(query);
  return rows;
};

const getById = async (id) => {
  const query = {
    text: `
      SELECT 
        r.*,
        v.numero_comprobante,
        u.nombre as nombre_usuario,
        json_agg(
          json_build_object(
            'id_detalle_reembolso', dr.id_detalle_reembolso,
            'cantidad_reembolsada', dr.cantidad_reembolsada,
            'subtotal_reembolso', dr.subtotal_reembolso,
            'detalle_venta', dv.*
          )
        ) as detalles
      FROM taller.reembolsos r
      JOIN taller.ventas v  ON r.id_venta = v.id_venta
      JOIN taller.usuarios u ON r.id_usuario = u.id_usuario
      JOIN taller.detalle_reembolso dr ON r.id_reembolso = dr.id_reembolso
      JOIN taller.detalle_venta dv ON dr.id_detalle_venta = dv.id_detalle
      WHERE r.id_reembolso = $1
      GROUP BY r.id_reembolso, v.numero_comprobante, u.nombre
    `,
    values: [id]
  };
  const { rows } = await db.query(query);
  return rows[0];
};

export const ReembolsoModel = {
  create,
  getAll,
  getById
};