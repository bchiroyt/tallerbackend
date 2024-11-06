import { db } from '../database/database.js';

const crearVenta = async (ventaData) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // Insertar la venta - Removemos numero_comprobante ya que se genera por trigger
    const ventaQuery = {
      text: `
        INSERT INTO taller.ventas 
        (id_cliente, id_usuario, id_caja, total_venta, monto_recibido, cambio)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `,
      values: [
        ventaData.id_cliente || null,
        ventaData.id_usuario,
        ventaData.id_caja,
        ventaData.total_venta,
        ventaData.monto_recibido,
        ventaData.monto_recibido - ventaData.total_venta
      ]
    };

    const { rows: [venta] } = await client.query(ventaQuery);

    // Insertar los detalles y actualizar stock
    for (const item of ventaData.items) {
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

      // Actualizar stock si no es servicio
      if (item.tipo_item !== 'servicio') {
        let tabla;
        let idColumn;
        
        switch (item.tipo_item) {
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
          default:
            continue;
        }
        
        const updateStockQuery = {
          text: `
            UPDATE ${tabla}
            SET stock = stock - $1
            WHERE ${idColumn} = $2
          `,
          values: [item.cantidad, item.id_item]
        };
        
        await client.query(updateStockQuery);
      }
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

const buscarProductos = async (termino) => {
  const query = {
    text: `
      (
        SELECT 
          'bicicleta' as tipo_item,
          id_bicicleta as id,
          codigo as codigo_barra,
          nombre,
          precio_venta,
          stock,
          descripcion
        FROM taller.bicicletas
        WHERE (LOWER(nombre) LIKE $1 OR LOWER(codigo) = LOWER($2))
        AND estado = true
      )
      UNION ALL
      (
        SELECT 
          'accesorio' as tipo_item,
          id_accesorio as id,
          codigo_barra,
          nombre,
          precio_venta,
          stock,
          material as descripcion
        FROM taller.accesorios
        WHERE (LOWER(nombre) LIKE $1 OR LOWER(codigo_barra) = LOWER($2))
        AND estado_acce = true
      )
      UNION ALL
      (
        SELECT 
          'producto' as tipo_item,
          id_producto as id,
          codigo as codigo_barra,
          nombre,
          precio_venta,
          stock,
          descripcion
        FROM taller.productos
        WHERE (LOWER(nombre) LIKE $1 OR LOWER(codigo) = LOWER($2))
        AND estado = true
      )
      UNION ALL
      (
        SELECT 
          'servicio' as tipo_item,
          id_historial as id,
          codigo_servicio as codigo_barra,
          nombre_bicicleta as nombre,
          precio_servicio as precio_venta,
          NULL as stock,
          descripcion_trabajos as descripcion
        FROM taller.servicio
        WHERE (LOWER(nombre_bicicleta) LIKE $1 OR LOWER(codigo_servicio) = LOWER($2))
        AND estado_hist = true
      )
    `,
    values: [`%${termino.toLowerCase()}%`, termino.toLowerCase()]
  };

  const { rows } = await db.query(query);
  return rows;
};

const obtenerVentasPorCaja = async (id_caja) => {
  const query = {
    text: `
      SELECT 
        v.*,
        c.nombre as nombre_cliente,
        c.nit,
        json_agg(
          json_build_object(
            'tipo_item', dv.tipo_item,
            'id_item', dv.id_item,
            'cantidad', dv.cantidad,
            'precio_unitario', dv.precio_unitario,
            'subtotal', dv.subtotal
          )
        ) as items
      FROM taller.ventas v
      LEFT JOIN taller.clientes c ON v.id_cliente = c.id_cliente
      LEFT JOIN taller.detalle_venta dv ON v.id_venta = dv.id_venta
      WHERE v.id_caja = $1 AND v.estado_venta = true
      GROUP BY v.id_venta, c.id_cliente
      ORDER BY v.fecha_venta DESC
    `,
    values: [id_caja]
  };

  const { rows } = await db.query(query);
  return rows;
};

const actualizarPdfUrl = async (id_venta, pdf_url) => {
  const query = {
    text: `
      UPDATE taller.ventas 
      SET pdf_url = $1 
      WHERE id_venta = $2 
      RETURNING *
    `,
    values: [pdf_url, id_venta]
  };

  const { rows: [venta] } = await db.query(query);
  return venta;
};

const obtenerDetallesVenta = async (id_venta) => {
  const query = {
    text: `
      SELECT 
        dv.*,
        CASE 
          WHEN dv.tipo_item = 'bicicleta' THEN b.nombre
          WHEN dv.tipo_item = 'accesorio' THEN a.nombre
          WHEN dv.tipo_item = 'producto' THEN p.nombre
          WHEN dv.tipo_item = 'servicio' THEN s.nombre_bicicleta
        END as nombre
      FROM taller.detalle_venta dv
      LEFT JOIN taller.bicicletas b ON dv.tipo_item = 'bicicleta' AND dv.id_item = b.id_bicicleta
      LEFT JOIN taller.accesorios a ON dv.tipo_item = 'accesorio' AND dv.id_item = a.id_accesorio
      LEFT JOIN taller.productos p ON dv.tipo_item = 'producto' AND dv.id_item = p.id_producto
      LEFT JOIN taller.servicio s ON dv.tipo_item = 'servicio' AND dv.id_item = s.id_historial
      WHERE dv.id_venta = $1
    `,
    values: [id_venta]
  };

  const { rows } = await db.query(query);
  return rows;
};

const obtenerCliente = async (id_cliente) => {
  const query = {
    text: 'SELECT * FROM taller.clientes WHERE id_cliente = $1',
    values: [id_cliente]
  };

  const { rows: [cliente] } = await db.query(query);
  return cliente;
};



export const VentaModel = {
  crearVenta,
  buscarProductos,
  obtenerVentasPorCaja,
  actualizarPdfUrl,
  obtenerDetallesVenta,
  obtenerCliente

};