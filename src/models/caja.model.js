import { db } from '../database/database.js';

const abrirCaja = async ({ id_usuario, monto_inicial }) => {
  const query = {
    text: `
      INSERT INTO taller.cajas (id_usuario, monto_inicial)
      VALUES ($1, $2)
      RETURNING *
    `,
    values: [id_usuario, monto_inicial]
  };
  const { rows } = await db.query(query);
  return rows[0];
};

const cerrarCaja = async (id_caja, monto_final) => {
  const query = {
    text: `
      UPDATE taller.cajas
      SET monto_final = $2,
          fecha_cierre = CURRENT_TIMESTAMP,
          estado_caja = FALSE
      WHERE id_caja = $1
      RETURNING *
    `,
    values: [id_caja, monto_final]
  };
  const { rows } = await db.query(query);
  return rows[0];
};

const getCajaActual = async () => {
  const query = {
    text: `
      SELECT c.*, u.nombre as nombre_usuario
      FROM taller.cajas c
      JOIN taller.usuarios u ON c.id_usuario = u.id_usuario
      WHERE c.estado_caja = TRUE
      LIMIT 1
    `
  };
  const { rows } = await db.query(query);
  return rows[0];
};

const getHistorial = async (fecha_inicio, fecha_fin) => {
  const query = {
    text: `
      SELECT 
        c.*,
        u.nombre as nombre_usuario,
        COUNT(v.id_venta) as total_transacciones,
        COALESCE(SUM(v.total_venta), 0) as total_ventas
      FROM taller.cajas c
      JOIN taller.usuarios u ON c.id_usuario = u.id_usuario
      LEFT JOIN taller.ventas v ON 
        v.fecha_venta BETWEEN c.fecha_apertura AND COALESCE(c.fecha_cierre, CURRENT_TIMESTAMP)
      WHERE c.fecha_apertura BETWEEN $1 AND $2
      GROUP BY c.id_caja, u.nombre
      ORDER BY c.fecha_apertura DESC
    `,
    values: [fecha_inicio, fecha_fin]
  };
  const { rows } = await db.query(query);
  return rows;
};

export const CajaModel = {
  abrirCaja,
  cerrarCaja,
  getCajaActual,
  getHistorial
};