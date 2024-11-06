import { db } from '../database/database.js';

const crearReembolso = async (reembolsoData) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // 1. Crear el reembolso
    const reembolsoQuery = {
      text: `
        INSERT INTO taller.reembolsos 
        (id_venta, id_usuario, monto_reembolso, motivo)
        VALUES ($1, $2, $3, $4)
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

    // 2. Insertar detalles del reembolso y actualizar stock
    for (const detalle of reembolsoData.items) {
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
          detalle.id_detalle,
          detalle.cantidad_reembolsada,
          detalle.subtotal_reembolso
        ]
      };

      await client.query(detalleQuery);

      // Obtener información del detalle de venta
      const { rows: [detalleVenta] } = await client.query(`
        SELECT tipo_item, id_item, cantidad 
        FROM taller.detalle_venta 
        WHERE id_detalle = $1
      `, [detalle.id_detalle]);

      // Actualizar stock si no es servicio
      if (detalleVenta.tipo_item !== 'servicio') {
        let tabla;
        let idColumn;
        
        switch (detalleVenta.tipo_item) {
          case 'bicicleta':
            tabla = 'taller.bicicletas';
            idColumn = 'id_bicicleta';
            break;
          case 'accesorio':
            tabla = 'taller.accesorios';
            idColumn = 'id_accesorio';
            break;
          case 'producto':
            tabla = 'taller.productos';
            idColumn = 'id_producto';
            break;
        }

        await client.query(`
          UPDATE ${tabla}
          SET stock = stock + $1
          WHERE ${idColumn} = $2
        `, [detalle.cantidad_reembolsada, detalleVenta.id_item]);
      }
    }

    // 3. Actualizar estado de la venta
    await client.query(`
      UPDATE taller.ventas 
      SET estado_venta = false 
      WHERE id_venta = $1
    `, [reembolsoData.id_venta]);

    await client.query('COMMIT');
    return reembolso;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const obtenerReembolsosPorCaja = async (id_caja) => {
  const query = {
    text: `
      SELECT r.*, v.numero_comprobante, u.nombre as nombre_usuario
      FROM taller.reembolsos r
      JOIN taller.ventas v ON r.id_venta = v.id_venta
      JOIN taller.usuarios u ON r.id_usuario = u.id_usuario
      WHERE v.id_caja = $1
    `,
    values: [id_caja]
  };

  const { rows } = await db.query(query);
  return rows;
};

export const ReembolsoModel = {
  crearReembolso,
  obtenerReembolsosPorCaja
};