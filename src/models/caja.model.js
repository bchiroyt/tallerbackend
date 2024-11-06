// src/models/caja.model.js
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
      SELECT 
        c.*,
        u.nombre as nombre_usuario,
        u.email as email_usuario,
        COALESCE(SUM(v.total_venta), 0) as total_ventas_reales,
        COALESCE(SUM(r.monto_reembolso), 0) as total_reembolsos_reales,
        (
          COALESCE(SUM(v.total_venta), 0) - 
          COALESCE(SUM(r.monto_reembolso), 0) + 
          c.monto_inicial
        ) as saldo_actual
      FROM taller.cajas c
      LEFT JOIN taller.usuarios u ON c.id_usuario = u.id_usuario
      LEFT JOIN taller.ventas v ON v.id_caja = c.id_caja
      LEFT JOIN taller.reembolsos r ON r.id_venta = v.id_venta
      WHERE c.estado_caja = TRUE
      GROUP BY 
        c.id_caja,
        c.fecha_apertura,
        c.fecha_cierre,
        c.monto_inicial,
        c.monto_final,
        c.estado_caja,
        c.total_ventas,
        c.total_reembolsos,
        u.nombre,
        u.email
      ORDER BY c.fecha_apertura DESC
      LIMIT 1
    `
  };

  console.log('Consultando caja actual...');
  const { rows } = await db.query(query);
  console.log('Resultado:', rows[0]);
  return rows[0];
};

const getHistorial = async (fecha_inicio, fecha_fin) => {
  const query = {
    text: `
      SELECT 
        c.*,
        u.nombre as nombre_usuario,
        u.email as email_usuario,
        COUNT(v.id_venta) as total_transacciones,
        COALESCE(SUM(v.total_venta), 0) as total_ventas_reales,
        COALESCE(SUM(r.monto_reembolso), 0) as total_reembolsos_reales,
        COALESCE(c.monto_final - c.monto_inicial, 0) as diferencia,
        CASE 
          WHEN c.estado_caja = true THEN 'Abierta'
          ELSE 'Cerrada'
        END as estado
      FROM taller.cajas c
      LEFT JOIN taller.usuarios u ON c.id_usuario = u.id_usuario
      LEFT JOIN taller.ventas v ON v.id_caja = c.id_caja
      LEFT JOIN taller.reembolsos r ON r.id_venta = v.id_venta
      WHERE 
        c.fecha_apertura::date BETWEEN $1::date AND $2::date
      GROUP BY 
        c.id_caja,
        c.fecha_apertura,
        c.fecha_cierre,
        c.monto_inicial,
        c.monto_final,
        c.estado_caja,
        c.total_ventas,
        c.total_reembolsos,
        u.nombre,
        u.email
      ORDER BY c.fecha_apertura DESC
    `,
    values: [fecha_inicio, fecha_fin]
  };

  console.log('Query SQL:', query.text);
  console.log('Valores:', query.values);

  const { rows } = await db.query(query);
  console.log('Resultados de la base de datos:', rows);
  return rows;
};

export const CajaModel = {
  abrirCaja,
  cerrarCaja,
  getCajaActual,
  getHistorial
};