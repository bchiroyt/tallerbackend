import { db } from '../database/database.js';

export const ConsultasModel = {
  // Consultas para ventas
  ventasPorPeriodo: async (fechaInicio, fechaFin) => {
    const query = `
      SELECT DATE(fecha_venta) as fecha, COUNT(*) as total_ventas, SUM(total_venta) as total_ingresos
      FROM taller.ventas
      WHERE fecha_venta BETWEEN $1 AND $2
      GROUP BY DATE(fecha_venta)
      ORDER BY fecha
    `;
    const { rows } = await db.query(query, [fechaInicio, fechaFin]);
    return rows;
  },

  productosMasVendidos: async (fechaInicio, fechaFin, limite = 10) => {
    const query = `
      SELECT p.nombre, SUM(dv.cantidad) as total_vendido, SUM(dv.subtotal) as total_ingresos
      FROM taller.detalle_venta dv
      JOIN taller.ventas v ON dv.id_venta = v.id_venta
      LEFT JOIN taller.productos p ON dv.id_item = p.id_producto AND dv.tipo_item = 'producto'
      LEFT JOIN taller.bicicletas b ON dv.id_item = b.id_bicicleta AND dv.tipo_item = 'bicicleta'
      LEFT JOIN taller.accesorios a ON dv.id_item = a.id_accesorio AND dv.tipo_item = 'accesorio'
      WHERE v.fecha_venta BETWEEN $1 AND $2
      GROUP BY COALESCE(p.nombre, b.nombre, a.nombre)
      ORDER BY total_vendido DESC
      LIMIT $3
    `;
    const { rows } = await db.query(query, [fechaInicio, fechaFin, limite]);
    return rows;
  },

  ventasPorCategoria: async (fechaInicio, fechaFin) => {
    const query = `
      SELECT c.nombre_categoria, COUNT(*) as total_ventas, SUM(dv.subtotal) as total_ingresos
      FROM taller.detalle_venta dv
      JOIN taller.ventas v ON dv.id_venta = v.id_venta
      LEFT JOIN taller.productos p ON dv.id_item = p.id_producto AND dv.tipo_item = 'producto'
      LEFT JOIN taller.bicicletas b ON dv.id_item = b.id_bicicleta AND dv.tipo_item = 'bicicleta'
      LEFT JOIN taller.accesorios a ON dv.id_item = a.id_accesorio AND dv.tipo_item = 'accesorio'
      LEFT JOIN taller.categorias c ON c.id_categoria = COALESCE(p.id_categoria, b.id_categoria, a.id_categoria)
      WHERE v.fecha_venta BETWEEN $1 AND $2
      GROUP BY c.nombre_categoria
      ORDER BY total_ingresos DESC
    `;
    const { rows } = await db.query(query, [fechaInicio, fechaFin]);
    return rows;
  },

  clientesConMasCompras: async (fechaInicio, fechaFin, limite = 10) => {
    const query = `
      SELECT c.nombre, COUNT(*) as total_compras, SUM(v.total_venta) as total_gastado
      FROM taller.ventas v
      JOIN taller.clientes c ON v.id_cliente = c.id_cliente
      WHERE v.fecha_venta BETWEEN $1 AND $2
      GROUP BY c.id_cliente
      ORDER BY total_gastado DESC
      LIMIT $3
    `;
    const { rows } = await db.query(query, [fechaInicio, fechaFin, limite]);
    return rows;
  },

  ventasPorUsuario: async (fechaInicio, fechaFin) => {
    const query = `
      SELECT u.nombre, COUNT(*) as total_ventas, SUM(v.total_venta) as total_ingresos
      FROM taller.ventas v
      JOIN taller.usuarios u ON v.id_usuario = u.id_usuario
      WHERE v.fecha_venta BETWEEN $1 AND $2
      GROUP BY u.id_usuario
      ORDER BY total_ingresos DESC
    `;
    const { rows } = await db.query(query, [fechaInicio, fechaFin]);
    return rows;
  },

  ventasPorTipoItem: async (fechaInicio, fechaFin) => {
    const query = `
      SELECT dv.tipo_item, COUNT(*) as total_ventas, SUM(dv.subtotal) as total_ingresos
      FROM taller.detalle_venta dv
      JOIN taller.ventas v ON dv.id_venta = v.id_venta
      WHERE v.fecha_venta BETWEEN $1 AND $2
      GROUP BY dv.tipo_item
      ORDER BY total_ingresos DESC
    `;
    const { rows } = await db.query(query, [fechaInicio, fechaFin]);
    return rows;
  },

  ventasConReembolso: async (fechaInicio, fechaFin) => {
    const query = `
      SELECT v.id_venta, v.numero_comprobante, v.fecha_venta, v.total_venta, 
             r.fecha_reembolso, r.monto_reembolso, r.motivo
      FROM taller.ventas v
      JOIN taller.reembolsos r ON v.id_venta = r.id_venta
      WHERE v.fecha_venta BETWEEN $1 AND $2
      ORDER BY v.fecha_venta DESC
    `;
    const { rows } = await db.query(query, [fechaInicio, fechaFin]);
    return rows;
  },

  // Consultas para ingresos
  ingresosPorPeriodo: async (fechaInicio, fechaFin) => {
    const query = `
      SELECT DATE(fecha_venta) as fecha, SUM(total_venta) as total_ingresos
      FROM taller.ventas
      WHERE fecha_venta BETWEEN $1 AND $2
      GROUP BY DATE(fecha_venta)
      ORDER BY fecha
    `;
    const { rows } = await db.query(query, [fechaInicio, fechaFin]);
    return rows;
  },

  ingresosPorCategoria: async (fechaInicio, fechaFin) => {
    const query = `
      SELECT c.nombre_categoria, SUM(dv.subtotal) as total_ingresos
      FROM taller.detalle_venta dv
      JOIN taller.ventas v ON dv.id_venta = v.id_venta
      LEFT JOIN taller.productos p ON dv.id_item = p.id_producto AND dv.tipo_item = 'producto'
      LEFT JOIN taller.bicicletas b ON dv.id_item = b.id_bicicleta AND dv.tipo_item = 'bicicleta'
      LEFT JOIN taller.accesorios a ON dv.id_item = a.id_accesorio AND dv.tipo_item = 'accesorio'
      LEFT JOIN taller.categorias c ON c.id_categoria = COALESCE(p.id_categoria, b.id_categoria, a.id_categoria)
      WHERE v.fecha_venta BETWEEN $1 AND $2
      GROUP BY c.nombre_categoria
      ORDER BY total_ingresos DESC
    `;
    const { rows } = await db.query(query, [fechaInicio, fechaFin]);
    return rows;
  },

  ingresosPorTipoItem: async (fechaInicio, fechaFin) => {
    const query = `
      SELECT dv.tipo_item, SUM(dv.subtotal) as total_ingresos
      FROM taller.detalle_venta dv
      JOIN taller.ventas v ON dv.id_venta = v.id_venta
      WHERE v.fecha_venta BETWEEN $1 AND $2
      GROUP BY dv.tipo_item
      ORDER BY total_ingresos DESC
    `;
    const { rows } = await db.query(query, [fechaInicio, fechaFin]);
    return rows;
  },

  ingresosPorUsuario: async (fechaInicio, fechaFin) => {
    const query = `
      SELECT u.nombre, SUM(v.total_venta) as total_ingresos
      FROM taller.ventas v
      JOIN taller.usuarios u ON v.id_usuario = u.id_usuario
      WHERE v.fecha_venta BETWEEN $1 AND $2
      GROUP BY u.id_usuario
      ORDER BY total_ingresos DESC
    `;
    const { rows } = await db.query(query, [fechaInicio, fechaFin]);
    return rows;
  },

  ingresosPorCliente: async (fechaInicio, fechaFin, limite = 10) => {
    const query = `
      SELECT c.nombre, SUM(v.total_venta) as total_ingresos
      FROM taller.ventas v
      JOIN taller.clientes c ON v.id_cliente = c.id_cliente
      WHERE v.fecha_venta BETWEEN $1 AND $2
      GROUP BY c.id_cliente
      ORDER BY total_ingresos DESC
      LIMIT $3
    `;
    const { rows } = await db.query(query, [fechaInicio, fechaFin, limite]);
    return rows;
  },

  comparativaIngresosMesActualVsAnterior: async () => {
    const query = `
      SELECT 
        DATE_TRUNC('month', fecha_venta) as mes,
        SUM(total_venta) as total_ingresos
      FROM taller.ventas
      WHERE fecha_venta >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
      GROUP BY DATE_TRUNC('month', fecha_venta)
      ORDER BY mes
    `;
    const { rows } = await db.query(query);
    return rows;
  },

  promedioIngresoDiario: async (fechaInicio, fechaFin) => {
    const query = `
      SELECT AVG(total_diario) as promedio_diario
      FROM (
        SELECT DATE(fecha_venta) as fecha, SUM(total_venta) as total_diario
        FROM taller.ventas
        WHERE fecha_venta BETWEEN $1 AND $2
        GROUP BY DATE(fecha_venta)
      ) as ventas_diarias
    `;
    const { rows } = await db.query(query, [fechaInicio, fechaFin]);
    return rows[0];
  },
};