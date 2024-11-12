import { db } from '../database/database.js';

// Crear una nueva cita
const crearCita = async ({ id_cliente, nombre_bicicleta, id_tecnico, fecha_cita, hora_cita, tipo_mantenimiento, estado_cita, observaciones }) => {
  const query = {
    text: `
      INSERT INTO taller.citas_mantenimiento 
      (id_cliente, nombre_bicicleta, id_tecnico, fecha_cita, hora_cita, tipo_mantenimiento, estado_cita, observaciones) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
    values: [id_cliente, nombre_bicicleta, id_tecnico, fecha_cita, hora_cita, tipo_mantenimiento, estado_cita, observaciones]
  };
  const { rows } = await db.query(query);
  return rows[0];
};

// Obtener todas las citas 
const obtenerCitas = async () => {
  const query = `
    SELECT c.*, cl.nombre AS nombre_cliente, u.nombre AS nombre_tecnico
    FROM taller.citas_mantenimiento c
    LEFT JOIN taller.clientes cl ON c.id_cliente = cl.id_cliente
    LEFT JOIN taller.usuarios u ON c.id_tecnico = u.id_usuario
    ORDER BY c.fecha_cita DESC
  `;
  const { rows } = await db.query(query);
  return rows;
};

// Obtener una cita 
const obtenerCitaPorId = async (id) => {
  const query = {
    text: `SELECT * FROM taller.citas_mantenimiento WHERE id_cita = $1`,
    values: [id]
  };
  const { rows } = await db.query(query);
  return rows[0];
};

// Actualizar el estado
const actualizarEstadoCita = async (id, estado_cita) => {
  const query = {
    text: `
      UPDATE taller.citas_mantenimiento 
      SET estado_cita = $1 
      WHERE id_cita = $2 
      RETURNING *
    `,
    values: [estado_cita, id]
  };
  const { rows } = await db.query(query);
  return rows[0];
};

export const MantenimientoModel = {
  crearCita,
  obtenerCitas,
  obtenerCitaPorId,
  actualizarEstadoCita,
};
