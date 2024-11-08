import { db } from '../database/database.js';

const crearReembolso = async (reembolsoData) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // 1. Insertar el reembolso principal
    const reembolsoQuery = {
      text: `
        INSERT INTO taller.reembolsos 
        (id_venta, id_usuario, monto_reembolso, motivo, estado_reembolso)
        VALUES ($1, $2, $3, $4, TRUE)
        RETURNING *
      `,
      values: [
        reembolsoData.id_venta,
        reembolsoData.id_usuario,
        reembolsoData.monto_reembolso,
        reembolsoData.motivo
      ]
    };

    const { rows: [reembolso] } = await client.query(reembolsoQuery);

    // 2. Procesar cada item del reembolso
    for (const item of reembolsoData.items) {
      // Validar que la cantidad a reembolsar no exceda la disponible
      const checkCantidadQuery = {
        text: `
          SELECT cantidad, COALESCE(cantidad_reembolsada, 0) as cantidad_reembolsada
          FROM taller.detalle_venta
          WHERE id_detalle = $1
        `,
        values: [item.id_detalle_venta]
      };
      
      const { rows: [detalleVenta] } = await client.query(checkCantidadQuery);
      
      if (!detalleVenta || 
          (detalleVenta.cantidad - detalleVenta.cantidad_reembolsada) < item.cantidad_reembolsada) {
        throw new Error('Cantidad a reembolsar excede la disponible');
      }

      // Insertar detalle del reembolso
      const detalleQuery = {
        text: `
          INSERT INTO taller.detalle_reembolso
          (id_reembolso, id_detalle_venta, cantidad_reembolsada, subtotal_reembolso)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `,
        values: [
          reembolso.id_reembolso,
          item.id_detalle_venta,
          item.cantidad_reembolsada,
          item.subtotal_reembolso
        ]
      };
      await client.query(detalleQuery);

      // Actualizar cantidad_reembolsada en detalle_venta
      await client.query(`
        UPDATE taller.detalle_venta
        SET cantidad_reembolsada = COALESCE(cantidad_reembolsada, 0) + $1
        WHERE id_detalle = $2
      `, [item.cantidad_reembolsada, item.id_detalle_venta]);

      // Actualizar stock si no es servicio
      if (item.tipo_item !== 'servicio') {
        const tabla = item.tipo_item === 'bicicleta' ? 'taller.bicicletas' :
                     item.tipo_item === 'accesorio' ? 'taller.accesorios' :
                     'taller.productos';
                     
        const idColumn = item.tipo_item === 'bicicleta' ? 'id_bicicleta' :
                        item.tipo_item === 'accesorio' ? 'id_accesorio' :
                        'id_producto';

        await client.query(`
          UPDATE ${tabla}
          SET stock = stock + $1
          WHERE ${idColumn} = $2
        `, [item.cantidad_reembolsada, item.id_item]);
      }
    }

    await client.query('COMMIT');
    return reembolso;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const obtenerReembolsosPorVenta = async (id_venta) => {
  const query = {
    text: `
      SELECT r.*, dr.cantidad_reembolsada, dr.subtotal_reembolso,
             dv.tipo_item, dv.id_item
      FROM taller.reembolsos r
      JOIN taller.detalle_reembolso dr ON r.id_reembolso = dr.id_reembolso
      JOIN taller.detalle_venta dv ON dr.id_detalle_venta = dv.id_detalle
      WHERE r.id_venta = $1
    `,
    values: [id_venta]
  };

  const { rows } = await db.query(query);
  return rows;
};

export const ReembolsoModel = {
  crearReembolso,
  obtenerReembolsosPorVenta
};