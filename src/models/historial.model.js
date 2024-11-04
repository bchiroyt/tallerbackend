import { db } from '../database/database.js';

// Crear un nuevo registro de historial de mantenimiento
const create = async ({ nombre_bicicleta, id_cita, fecha_mantenimiento, tipo_mantenimiento, descripcion_trabajos, total_costo }) => {
  const query = {
    text: `
      INSERT INTO taller.historial_mantenimiento (nombre_bicicleta, id_cita, fecha_mantenimiento, tipo_mantenimiento, descripcion_trabajos, total_costo) 
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
    `,
    values: [nombre_bicicleta, id_cita, fecha_mantenimiento, tipo_mantenimiento, descripcion_trabajos, total_costo]
  };
  const { rows } = await db.query(query);
  return rows[0];
};

// Obtener todos los registros del historial
const getAll = async () => {
  const query = `SELECT * FROM taller.historial_mantenimiento WHERE estado_hist = TRUE;`;
  const { rows } = await db.query(query);
  return rows;
};

// Obtener un registro específico por ID
const getById = async (id) => {
  const query = {
    text: `SELECT * FROM taller.historial_mantenimiento WHERE id_historial = $1 AND estado_hist = TRUE;`,
    values: [id]
  };
  const { rows } = await db.query(query);
  return rows[0];
};

// Actualizar un registro de historial
const updateById = async (id, { nombre_bicicleta, fecha_mantenimiento, tipo_mantenimiento, descripcion_trabajos, total_costo }) => {
  const query = {
    text: `
      UPDATE taller.historial_mantenimiento 
      SET nombre_bicicleta = $1, fecha_mantenimiento = $2, tipo_mantenimiento = $3, descripcion_trabajos = $4, total_costo = $5
      WHERE id_historial = $6 
      RETURNING *;
    `,
    values: [nombre_bicicleta, fecha_mantenimiento, tipo_mantenimiento, descripcion_trabajos, total_costo, id]
  };
  const { rows } = await db.query(query);
  return rows[0];
};

// Eliminar un registro del historial (eliminación lógica)
const deleteById = async (id) => {
  const query = {
    text: `UPDATE taller.historial_mantenimiento SET estado_hist = FALSE WHERE id_historial = $1 RETURNING *;`,
    values: [id]
  };
  const { rows } = await db.query(query);
  return rows[0];
};

export const HistorialMantenimientoModel = {
  create,
  getAll,
  getById,
  updateById,
  deleteById,
};
