import { db } from '../database/database.js';

export const ReportesModel = {
  obtenerReportesIngresos: async (fechaInicio, fechaFin) => {
    const ingresosPorMes = await db.query(`
      SELECT 
        DATE_TRUNC('month', fecha_venta) AS mes,
        SUM(total_venta) AS total_ingresos
      FROM taller.ventas
      WHERE fecha_venta BETWEEN $1 AND $2
      GROUP BY mes
      ORDER BY mes
    `, [fechaInicio, fechaFin]);

    const ingresosPorCategoria = await db.query(`
      SELECT 
        c.nombre_categoria,
        SUM(dv.subtotal) AS total_ingresos
      FROM taller.detalle_venta dv
      JOIN taller.ventas v ON dv.id_venta = v.id_venta
      JOIN taller.categorias c ON 
        CASE 
          WHEN dv.tipo_item = 'bicicleta' THEN (SELECT id_categoria FROM taller.bicicletas WHERE id_bicicleta = dv.id_item)
          WHEN dv.tipo_item = 'accesorio' THEN (SELECT id_categoria FROM taller.accesorios WHERE id_accesorio = dv.id_item)
          WHEN dv.tipo_item = 'producto' THEN (SELECT id_categoria FROM taller.productos WHERE id_producto = dv.id_item)
        END = c.id_categoria
      WHERE v.fecha_venta BETWEEN $1 AND $2
      GROUP BY c.nombre_categoria
      ORDER BY total_ingresos DESC
    `, [fechaInicio, fechaFin]);

    const ingresosPorTipoItem = await db.query(`
      SELECT 
        tipo_item,
        SUM(subtotal) AS total_ingresos
      FROM taller.detalle_venta dv
      JOIN taller.ventas v ON dv.id_venta = v.id_venta
      WHERE v.fecha_venta BETWEEN $1 AND $2
      GROUP BY tipo_item
      ORDER BY total_ingresos DESC
    `, [fechaInicio, fechaFin]);

    return {
      ingresosPorMes: ingresosPorMes.rows,
      ingresosPorCategoria: ingresosPorCategoria.rows,
      ingresosPorTipoItem: ingresosPorTipoItem.rows
    };
  },

  obtenerReportesVentas: async (fechaInicio, fechaFin) => {
    const ventasPorMes = await db.query(`
      SELECT 
        DATE_TRUNC('month', fecha_venta) AS mes,
        COUNT(*) AS total_ventas
      FROM taller.ventas
      WHERE fecha_venta BETWEEN $1 AND $2
      GROUP BY mes
      ORDER BY mes
    `, [fechaInicio, fechaFin]);

    const productosMasVendidos = await db.query(`
      SELECT 
        CASE 
          WHEN dv.tipo_item = 'bicicleta' THEN (SELECT nombre FROM taller.bicicletas WHERE id_bicicleta = dv.id_item)
          WHEN dv.tipo_item = 'accesorio' THEN (SELECT nombre FROM taller.accesorios WHERE id_accesorio = dv.id_item)
          WHEN dv.tipo_item = 'producto' THEN (SELECT nombre FROM taller.productos WHERE id_producto = dv.id_item)
          WHEN dv.tipo_item = 'servicio' THEN (SELECT nombre_bicicleta FROM taller.servicio WHERE id_historial = dv.id_item)
        END AS nombre_producto,
        SUM(dv.cantidad) AS cantidad_vendida
      FROM taller.detalle_venta dv
      JOIN taller.ventas v ON dv.id_venta = v.id_venta
      WHERE v.fecha_venta BETWEEN $1 AND $2
      GROUP BY dv.tipo_item, dv.id_item
      ORDER BY cantidad_vendida DESC
      LIMIT 10
    `, [fechaInicio, fechaFin]);

    const ventasPorCliente = await db.query(`
      SELECT 
        c.nombre AS nombre_cliente,
        COUNT(v.id_venta) AS total_ventas,
        SUM(v.total_venta) AS total_ingresos
      FROM taller.ventas v
      JOIN taller.clientes c ON v.id_cliente = c.id_cliente
      WHERE v.fecha_venta BETWEEN $1 AND $2
      GROUP BY c.id_cliente
      ORDER BY total_ingresos DESC
      LIMIT 10
    `, [fechaInicio, fechaFin]);

    return {
      ventasPorMes: ventasPorMes.rows,
      productosMasVendidos: productosMasVendidos.rows,
      ventasPorCliente: ventasPorCliente.rows
    };
  }
};