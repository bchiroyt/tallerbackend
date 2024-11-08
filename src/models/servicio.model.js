import { db } from '../database/database.js';

// Crear un nuevo registro de servicio
const create = async ({ codigo_servicio, nombre_bicicleta, id_cita, fecha_mantenimiento, tipo_mantenimiento, descripcion_trabajos, precio_servicio }) => {
  // Validar que el código de servicio comience con '4'
  if (!codigo_servicio.startsWith('4')) {
    throw new Error('El código de servicio debe comenzar con el número 4.');
  }

  const query = {
    text: `
      INSERT INTO taller.servicio (codigo_servicio, nombre_bicicleta, id_cita, fecha_mantenimiento, tipo_mantenimiento, descripcion_trabajos, precio_servicio) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;
    `,
    values: [codigo_servicio, nombre_bicicleta, id_cita, fecha_mantenimiento, tipo_mantenimiento, descripcion_trabajos, precio_servicio]
  };
  const { rows } = await db.query(query);
  return rows[0];
};

// Obtener todos los registros del servicio
const getAll = async () => {
  const query = `SELECT * FROM taller.servicio WHERE estado_hist = TRUE;`;
  const { rows } = await db.query(query);
  return rows;
};

// Obtener un registro específico por ID
const getById = async (id) => {
  const query = {
    text: `SELECT * FROM taller.servicio WHERE id_historial = $1 AND estado_hist = TRUE;`,
    values: [id]
  };
  const { rows } = await db.query(query);
  return rows[0];
};

// Actualizar un registro de servicio
const updateById = async (id, { codigo_servicio, nombre_bicicleta, fecha_mantenimiento, tipo_mantenimiento, descripcion_trabajos, precio_servicio }) => {
  const query = {
    text: `
      UPDATE taller.servicio 
      SET codigo_servicio = $1, nombre_bicicleta = $2, fecha_mantenimiento = $3, tipo_mantenimiento = $4, descripcion_trabajos = $5, precio_servicio = $6
      WHERE id_historial = $7 
      RETURNING *;
    `,
    values: [codigo_servicio, nombre_bicicleta, fecha_mantenimiento, tipo_mantenimiento, descripcion_trabajos, precio_servicio, id]
  };
  const { rows } = await db.query(query);
  return rows[0];
};

// Eliminar un registro del servicio (eliminación lógica)
const deleteById = async (id) => {
  const query = {
    text: `UPDATE taller.servicio SET estado_hist = FALSE WHERE id_historial = $1 RETURNING *;`,
    values: [id]
  };
  const { rows } = await db.query(query);
  return rows[0];
};

export const ServicioModel = {
  create,
  getAll,
  getById,
  updateById,
  deleteById,
};